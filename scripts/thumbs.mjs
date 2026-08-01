#!/usr/bin/env node
/**
 * Thumbnail generator + render gate (SPEC §8). Serves dist/ with vite preview,
 * visits the chrome-less preview harness for every shader in thumb mode, waits
 * for __SHADER_READY__, and writes public/thumbs/<id>.jpg. A canvas with (near)
 * zero pixel variance counts as a render failure.
 */
import { chromium } from '@playwright/test'
import { spawn } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { listIds } from './shader-ids.js'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const THUMBS = join(ROOT, 'public/thumbs')
const PORT = 4189
const BASE = `http://localhost:${PORT}/glsl/`
const SIZE = 320
const SEED = 7
const CONCURRENCY = 3
const BLANK_MAD = 0.8

async function waitForServer(timeout = 60_000) {
  const deadline = Date.now() + timeout
  while (Date.now() < deadline) {
    try {
      const response = await fetch(BASE)
      if (response.ok) return
    } catch {
      /* not up yet */
    }
    await new Promise((resolve) => setTimeout(resolve, 300))
  }
  throw new Error(`vite preview did not come up on ${BASE}`)
}

// Luminance mean-absolute-deviation over the canvas — 0 means a flat (blank) frame.
function canvasStats() {
  const canvas = document.querySelector('canvas')
  if (!canvas) return null
  const off = document.createElement('canvas')
  off.width = canvas.width
  off.height = canvas.height
  const context = off.getContext('2d')
  context.drawImage(canvas, 0, 0)
  const { data } = context.getImageData(0, 0, off.width, off.height)
  const values = []
  let sum = 0
  for (let i = 0; i < data.length; i += 16) {
    const luminance = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
    values.push(luminance)
    sum += luminance
  }
  const mean = sum / values.length
  let deviation = 0
  for (const value of values) deviation += Math.abs(value - mean)
  return { mean, mad: deviation / values.length }
}

async function shoot(page, id) {
  // Query buster forces a full document load so each shader gets a clean GL context.
  await page.goto(`${BASE}?s=${id}#/p/${id}?seed=${SEED}&thumb=1&size=${SIZE}`, {
    waitUntil: 'load',
  })
  await page.waitForFunction(() => window.__SHADER_READY__ === true, undefined, { timeout: 30_000 })
  const canvas = page.locator('canvas').first()
  await canvas.waitFor({ state: 'visible', timeout: 5_000 })
  const stats = await page.evaluate(canvasStats)
  if (!stats) throw new Error('no canvas on the page')
  if (stats.mad < BLANK_MAD) {
    throw new Error(`blank canvas (mean ${stats.mean.toFixed(1)}, mad ${stats.mad.toFixed(3)})`)
  }
  await canvas.screenshot({ path: join(THUMBS, `${id}.jpg`), type: 'jpeg', quality: 80 })
}

const ids = listIds()
if (!ids.length) {
  console.log('thumbs — no shaders found, nothing to render')
  process.exit(0)
}
if (!existsSync(join(ROOT, 'dist'))) {
  console.error("thumbs — dist/ not found, run 'bun run build' first")
  process.exit(1)
}

mkdirSync(THUMBS, { recursive: true })

const server = spawn('bunx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
  cwd: ROOT,
  stdio: 'ignore',
})

let browser
const failures = []
try {
  await waitForServer()
  browser = await chromium.launch({
    args: [
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
    ],
  })

  let cursor = 0
  async function worker() {
    const context = await browser.newContext({
      viewport: { width: SIZE + 80, height: SIZE + 80 },
      deviceScaleFactor: 1,
    })
    const page = await context.newPage()
    while (cursor < ids.length) {
      const id = ids[cursor++]
      try {
        await shoot(page, id)
        console.log(`✓ ${id}`)
      } catch (error) {
        failures.push({ id, message: error instanceof Error ? error.message : String(error) })
        console.log(`✗ ${id} — ${error instanceof Error ? error.message : error}`)
      }
    }
    await context.close()
  }

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, ids.length) }, () => worker()),
  )
} finally {
  await browser?.close()
  server.kill()
}

if (failures.length) {
  console.error(`thumbs — ${failures.length}/${ids.length} failed:`)
  for (const failure of failures) console.error(`  ✗ ${failure.id}: ${failure.message}`)
  process.exit(1)
}
console.log(`thumbs — OK (${ids.length} stills → public/thumbs)`)
