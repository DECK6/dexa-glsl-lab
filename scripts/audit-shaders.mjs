#!/usr/bin/env node
/**
 * Full-catalog GLSL render audit.
 *
 * Compiles every author source against the real runner contract, samples the
 * deterministic thumbnail frame and a later frame, rejects blank/frozen output,
 * and reports the closest visual/code pairs for the human differentiation pass.
 */
import { chromium } from '@playwright/test'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const SHADERS = join(ROOT, 'shaders')
const SIZE = 256
const BLANK_MAD = 0.8
const MOTION_MAE = 0.05

const HEADER = `#version 300 es
precision highp float;
uniform vec3 iResolution;
uniform float iTime;
uniform vec4 iMouse;
uniform int iFrame;
uniform float uSeed;
uniform vec3 uColBg;
uniform vec3 uColInk;
uniform vec3 uColSignal;
uniform vec3 uColAccent;
uniform vec3 uColPaper;
uniform vec3 uColDim;
out vec4 outColor;
#line 1
`
const FOOTER = `
void main() { mainImage(outColor, gl_FragCoord.xy); }
`
const VERT = `#version 300 es
void main() {
  vec2 v = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(v * 2.0 - 1.0, 0.0, 1.0);
}
`

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

const sources = collectSources()
const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader'],
})
const page = await browser.newPage()
await page.setContent(`<canvas width="${SIZE}" height="${SIZE}"></canvas>`)

const results = await page.evaluate(
  ({ sources, HEADER, FOOTER, VERT, SIZE }) => {
    const canvas = document.querySelector('canvas')
    const gl = canvas?.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false })
    if (!gl) return [{ id: '(context)', category: '(context)', error: 'WebGL2 unavailable' }]

    const palette = {
      uColBg: [13 / 255, 14 / 255, 16 / 255],
      uColInk: [23 / 255, 24 / 255, 27 / 255],
      uColSignal: [94 / 255, 231 / 255, 243 / 255],
      uColAccent: [255 / 255, 90 / 255, 31 / 255],
      uColPaper: [245 / 255, 241 / 255, 230 / 255],
      uColDim: [90 / 255, 93 / 255, 99 / 255],
    }

    const vertex = gl.createShader(gl.VERTEX_SHADER)
    gl.shaderSource(vertex, VERT)
    gl.compileShader(vertex)
    if (!gl.getShaderParameter(vertex, gl.COMPILE_STATUS)) {
      return [{ id: '(vertex)', category: '(context)', error: gl.getShaderInfoLog(vertex) }]
    }

    function sample(program, time) {
      gl.useProgram(program)
      gl.uniform3f(gl.getUniformLocation(program, 'iResolution'), SIZE, SIZE, 1)
      gl.uniform1f(gl.getUniformLocation(program, 'iTime'), time)
      gl.uniform4f(gl.getUniformLocation(program, 'iMouse'), 0, 0, 0, 0)
      gl.uniform1i(gl.getUniformLocation(program, 'iFrame'), Math.round(time * 30))
      gl.uniform1f(gl.getUniformLocation(program, 'uSeed'), 7)
      for (const [name, value] of Object.entries(palette)) {
        gl.uniform3f(gl.getUniformLocation(program, name), value[0], value[1], value[2])
      }
      gl.viewport(0, 0, SIZE, SIZE)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      const pixels = new Uint8Array(SIZE * SIZE * 4)
      gl.readPixels(0, 0, SIZE, SIZE, gl.RGBA, gl.UNSIGNED_BYTE, pixels)

      const motion = []
      const visual = []
      let sum = 0
      for (let y = 0; y < SIZE; y += 4) {
        for (let x = 0; x < SIZE; x += 4) {
          const offset = (y * SIZE + x) * 4
          const luminance = 0.299 * pixels[offset] + 0.587 * pixels[offset + 1] + 0.114 * pixels[offset + 2]
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

    const output = []
    for (const source of sources) {
      const fragment = gl.createShader(gl.FRAGMENT_SHADER)
      gl.shaderSource(fragment, HEADER + source.body + FOOTER)
      gl.compileShader(fragment)
      if (!gl.getShaderParameter(fragment, gl.COMPILE_STATUS)) {
        output.push({ id: source.id, category: source.category, path: source.path, error: gl.getShaderInfoLog(fragment) })
        gl.deleteShader(fragment)
        continue
      }
      const program = gl.createProgram()
      gl.attachShader(program, vertex)
      gl.attachShader(program, fragment)
      gl.linkProgram(program)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        output.push({ id: source.id, category: source.category, path: source.path, error: gl.getProgramInfoLog(program) })
        gl.deleteProgram(program)
        gl.deleteShader(fragment)
        continue
      }
      const still = sample(program, 3)
      const later = sample(program, 3.6)
      let motion = 0
      for (let index = 0; index < still.motion.length; index++) {
        motion += Math.abs(still.motion[index] - later.motion[index])
      }
      output.push({
        id: source.id,
        category: source.category,
        path: source.path,
        mean: still.mean,
        mad: still.mad,
        motion: motion / still.motion.length,
        visual: still.visual,
      })
      gl.deleteProgram(program)
      gl.deleteShader(fragment)
    }
    gl.deleteShader(vertex)
    return output
  },
  { sources, HEADER, FOOTER, VERT, SIZE },
)

await browser.close()

const failures = []
const categoryCounts = new Map()
for (const result of results) {
  categoryCounts.set(result.category, (categoryCounts.get(result.category) ?? 0) + 1)
  if (result.error) failures.push(`${result.id}: compile/link failed — ${result.error.trim()}`)
  else {
    if (result.mad < BLANK_MAD) failures.push(`${result.id}: blank still (MAD ${result.mad.toFixed(3)})`)
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
    if (distance.mae < 1 && distance.correlation > 0.995) {
      failures.push(`${results[left].id}/${results[right].id}: near-identical stills (MAE ${distance.mae.toFixed(3)}, r ${distance.correlation.toFixed(4)})`)
    }
  }
}
visualPairs.sort((a, b) => b.correlation - a.correlation || a.mae - b.mae)

const shingles = sources.map((source) => ({ id: source.id, value: codeShingles(source.body) }))
const codePairs = []
for (let left = 0; left < shingles.length; left++) {
  for (let right = left + 1; right < shingles.length; right++) {
    const similarity = jaccard(shingles[left].value, shingles[right].value)
    if (similarity >= 0.55) codePairs.push({ a: shingles[left].id, b: shingles[right].id, similarity })
    if (similarity >= 0.82) {
      failures.push(`${shingles[left].id}/${shingles[right].id}: probable parameter variant (code Jaccard ${similarity.toFixed(3)})`)
    }
  }
}
codePairs.sort((a, b) => b.similarity - a.similarity)

console.log(`audit:shaders — rendered ${results.length} shaders at ${SIZE}×${SIZE}`)
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
  console.error(`audit:shaders — ${failures.length} failure(s):`)
  for (const failure of [...new Set(failures)]) console.error(`  ✗ ${failure}`)
  process.exit(1)
}
console.log('audit:shaders — OK (compile, nonblank, motion, duplicate hard gates)')
