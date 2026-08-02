#!/usr/bin/env bun
/**
 * Full-catalog audit through the production runner.
 *
 * Unlike the core-only source compiler, this gate exercises every runtime tier:
 * core (single pass), buffer (ping-pong state), and input (deterministic fixtures).
 * It checks compile/mount errors, blankness, motion, and visual/code proximity.
 */
import { chromium } from '@playwright/test'
import { spawn } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { categoryById } from '../src/catalog.ts'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const SHADERS = join(ROOT, 'shaders')
const PORT = 4191
const BASE = `http://localhost:${PORT}/glsl/`
const SIZE = 160
const CONCURRENCY = 4
const BLANK_MAD = 0.8
const MOTION_MAE = 0.02

function collectSources() {
  const sources = []
  for (const category of readdirSync(SHADERS).sort()) {
    const directory = join(SHADERS, category)
    if (!statSync(directory).isDirectory()) continue
    for (const file of readdirSync(directory).sort()) {
      if (!file.endsWith('.frag')) continue
      const path = join(directory, file)
      sources.push({
        id: file.slice(0, 4),
        category,
        runtime: categoryById(category)?.runtime ?? 'unknown',
        path: relative(ROOT, path),
        body: readFileSync(path, 'utf8'),
      })
    }
  }
  return sources
}

function codeShingles(source) {
  const tokens = source
    .replace(/\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\b(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?\b/gi, '#')
    .match(/[A-Za-z_]\w*|==|!=|<=|>=|&&|\|\||[-+*/%=<>?:]/g) ?? []
  const shingles = new Set()
  for (let index = 0; index <= tokens.length - 5; index++) {
    shingles.add(tokens.slice(index, index + 5).join(' '))
  }
  return shingles
}

function jaccard(a, b) {
  let intersection = 0
  for (const value of a) if (b.has(value)) intersection++
  return intersection / Math.max(1, a.size + b.size - intersection)
}

function visualDistance(a, b) {
  let absolute = 0
  let dot = 0
  let aa = 0
  let bb = 0
  const meanA = a.reduce((sum, value) => sum + value, 0) / a.length
  const meanB = b.reduce((sum, value) => sum + value, 0) / b.length
  for (let index = 0; index < a.length; index++) {
    absolute += Math.abs(a[index] - b[index])
    const ca = a[index] - meanA
    const cb = b[index] - meanB
    dot += ca * cb
    aa += ca * ca
    bb += cb * cb
  }
  return {
    mae: absolute / a.length,
    correlation: dot / Math.max(1e-9, Math.sqrt(aa * bb)),
  }
}

function canvasSample() {
  const canvas = document.querySelector('canvas')
  if (!canvas) return null
  const copy = document.createElement('canvas')
  copy.width = canvas.width
  copy.height = canvas.height
  const context = copy.getContext('2d')
  context.drawImage(canvas, 0, 0)
  const { data } = context.getImageData(0, 0, copy.width, copy.height)
  const motion = []
  const visual = []
  let sum = 0
  for (let y = 0; y < copy.height; y += 4) {
    for (let x = 0; x < copy.width; x += 4) {
      const offset = (y * copy.width + x) * 4
      const luminance = .299 * data[offset] + .587 * data[offset + 1] + .114 * data[offset + 2]
      motion.push(luminance)
      sum += luminance
      if (x % 8 === 0 && y % 8 === 0) visual.push(luminance)
    }
  }
  const mean = sum / motion.length
  let deviation = 0
  for (const value of motion) deviation += Math.abs(value - mean)
  return { mean, mad: deviation / motion.length, motion, visual }
}

async function waitForServer(timeout = 60_000) {
  const deadline = Date.now() + timeout
  while (Date.now() < deadline) {
    try {
      const response = await fetch(BASE)
      if (response.ok) return
    } catch {
      // preview is still starting
    }
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  throw new Error(`vite preview did not start at ${BASE}`)
}

const sources = collectSources()
if (!existsSync(join(ROOT, 'dist'))) {
  console.error("audit:shaders — dist/ missing; run 'bun run build' first")
  process.exit(1)
}

const server = spawn('bunx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
  cwd: ROOT,
  stdio: 'ignore',
})
let browser
const results = new Array(sources.length)
let cursor = 0

try {
  await waitForServer()
  browser = await chromium.launch({
    args: [
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
    ],
  })

  async function worker() {
    const context = await browser.newContext({
      viewport: { width: SIZE + 40, height: SIZE + 40 },
      deviceScaleFactor: 1,
    })
    const page = await context.newPage()
    let currentErrors = []
    page.on('pageerror', (error) => currentErrors.push(String(error)))
    page.on('console', (message) => {
      if (message.type() === 'error') currentErrors.push(message.text())
    })

    while (true) {
      const index = cursor++
      if (index >= sources.length) break
      const source = sources[index]
      currentErrors = []
      try {
        await page.goto(
          `${BASE}?audit=${source.id}#/p/${source.id}?seed=7&size=${SIZE}`,
          { waitUntil: 'load', timeout: 20_000 },
        )
        await page.waitForFunction(() => window.__SHADER_READY__ === true, undefined, {
          timeout: 20_000,
        })
        await page.waitForTimeout(220)
        const still = await page.evaluate(canvasSample)
        await page.waitForTimeout(360)
        const later = await page.evaluate(canvasSample)
        if (!still || !later) throw new Error('runner produced no canvas')
        let motion = 0
        for (let sample = 0; sample < still.motion.length; sample++) {
          motion += Math.abs(still.motion[sample] - later.motion[sample])
        }
        results[index] = {
          ...source,
          mean: still.mean,
          mad: still.mad,
          motion: motion / still.motion.length,
          visual: still.visual,
          error: currentErrors.join(' | '),
        }
      } catch (error) {
        results[index] = {
          ...source,
          error: [currentErrors.join(' | '), error instanceof Error ? error.message : String(error)]
            .filter(Boolean)
            .join(' | '),
        }
      }
    }
    await context.close()
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()))
} finally {
  await browser?.close()
  server.kill()
}

const failures = []
const categoryCounts = new Map()
const runtimeCounts = new Map()
for (const result of results) {
  categoryCounts.set(result.category, (categoryCounts.get(result.category) ?? 0) + 1)
  runtimeCounts.set(result.runtime, (runtimeCounts.get(result.runtime) ?? 0) + 1)
  if (result.error) failures.push(`${result.id}: runner failed — ${result.error}`)
  else {
    if (result.mad < BLANK_MAD) failures.push(`${result.id}: blank output (MAD ${result.mad.toFixed(3)})`)
    if (result.motion < MOTION_MAE) failures.push(`${result.id}: frozen output (motion MAE ${result.motion.toFixed(3)})`)
  }
}

const visualPairs = []
for (let left = 0; left < results.length; left++) {
  if (!results[left].visual) continue
  for (let right = left + 1; right < results.length; right++) {
    if (!results[right].visual) continue
    const distance = visualDistance(results[left].visual, results[right].visual)
    visualPairs.push({ a: results[left].id, b: results[right].id, ...distance })
    if (distance.mae < 1 && distance.correlation > .995) {
      failures.push(
        `${results[left].id}/${results[right].id}: near-identical outputs (MAE ${distance.mae.toFixed(3)}, r ${distance.correlation.toFixed(4)})`,
      )
    }
  }
}
visualPairs.sort((a, b) => b.correlation - a.correlation || a.mae - b.mae)

const shingles = sources.map((source) => ({ id: source.id, value: codeShingles(source.body) }))
const codePairs = []
for (let left = 0; left < shingles.length; left++) {
  for (let right = left + 1; right < shingles.length; right++) {
    const similarity = jaccard(shingles[left].value, shingles[right].value)
    if (similarity >= .55) codePairs.push({ a: shingles[left].id, b: shingles[right].id, similarity })
    if (similarity >= .82) {
      failures.push(
        `${shingles[left].id}/${shingles[right].id}: probable parameter variant (code Jaccard ${similarity.toFixed(3)})`,
      )
    }
  }
}
codePairs.sort((a, b) => b.similarity - a.similarity)

console.log(`audit:shaders — exercised ${results.length} shaders through the production runner at ${SIZE}×${SIZE}`)
console.log(`runtime tiers — ${[...runtimeCounts.entries()].sort().map(([tier, count]) => `${tier}:${count}`).join(' ')}`)
console.log(`categories — ${[...categoryCounts.entries()].sort().map(([category, count]) => `${category}:${count}`).join(' ')}`)
console.log('closest visual pairs (human review queue):')
for (const pair of visualPairs.slice(0, 15)) {
  console.log(`  ${pair.a}/${pair.b}  r=${pair.correlation.toFixed(4)}  MAE=${pair.mae.toFixed(2)}`)
}
console.log('closest code pairs (numeric literals normalized):')
if (!codePairs.length) console.log('  none at Jaccard >= 0.55')
for (const pair of codePairs.slice(0, 15)) {
  console.log(`  ${pair.a}/${pair.b}  J=${pair.similarity.toFixed(3)}`)
}

if (failures.length) {
  console.error(`audit:shaders — ${new Set(failures).size} failure(s):`)
  for (const failure of new Set(failures)) console.error(`  ✗ ${failure}`)
  process.exit(1)
}
console.log('audit:shaders — OK (runner compile, nonblank, motion, duplicate hard gates)')
