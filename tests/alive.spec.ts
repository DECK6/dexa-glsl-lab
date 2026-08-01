import { expect, test } from '@playwright/test'
import { listIds } from '../scripts/shader-ids.js'

/**
 * Alive suite (SPEC §8). For every shader, the chrome-less preview harness must
 * paint a non-blank canvas and keep changing — this catches both dead renders and
 * frozen ones. The registry can't be imported here (import.meta.glob is Vite-only),
 * so ids come from the shaders/ filenames.
 */

const SEED = 7
const BLANK_MAD = 0.8
const SETTLE_MS = 1500
const MOTION_MS = 600
const SAMPLES = 3

// Runs in the page: luminance spread (blankness) + a signature that changes with the frame.
function canvasSample() {
  const canvas = document.querySelector('canvas')
  if (!canvas) return null
  const off = document.createElement('canvas')
  off.width = canvas.width
  off.height = canvas.height
  const context = off.getContext('2d')!
  context.drawImage(canvas, 0, 0)
  const { data } = context.getImageData(0, 0, off.width, off.height)
  const values: number[] = []
  let sum = 0
  let signature = 0
  for (let i = 0; i < data.length; i += 16) {
    const luminance = 0.299 * data[i]! + 0.587 * data[i + 1]! + 0.114 * data[i + 2]!
    values.push(luminance)
    sum += luminance
    signature = (signature * 31 + Math.round(luminance)) % 2_147_483_647
  }
  const mean = sum / values.length
  let deviation = 0
  for (const value of values) deviation += Math.abs(value - mean)
  return { mean, mad: deviation / values.length, signature }
}

const ids = listIds()

test('product shell renders the full catalog', async ({ page }) => {
  await page.goto('#/')
  await expect(page.locator('.site-header')).toBeVisible()
  await expect(page.locator('.gallery-layout')).toBeVisible()
  await expect(page.locator('.filters')).toBeVisible()
  await expect(page.locator('.gallery-toolbar')).toBeVisible()
  await expect(page.locator('.effect-grid .effect-card')).toHaveCount(ids.length)
  await expect(page.locator('[data-role="count"]')).toHaveText(`${ids.length} / ${ids.length}`)

  await page.goto('#/about')
  await expect(page.locator('.about-page')).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'GITHUB.COM/DECK6/DEXA-GLSL-LAB ↗' }),
  ).toHaveAttribute('href', 'https://github.com/DECK6/dexa-glsl-lab')
})

test('gallery route renders', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(String(error)))
  await page.goto('#/')
  await expect(page.locator('.effect-grid .effect-card').first()).toBeVisible()
  expect(errors.join('\n')).toBe('')
})

test('detail live edit recompiles and surfaces errors', async ({ page }) => {
  const first = ids[0]!
  await page.goto(`#/s/${first}`)
  const editor = page.locator('[data-role="editor"]')
  await expect(editor).toBeVisible()
  await expect(editor).not.toHaveValue('LOADING…')
  await expect(page.locator('[data-role="status"]')).toHaveText('LIVE')

  // Break the shader → compile error with a line number surfaces.
  await editor.fill('void mainImage(out vec4 o, in vec2 p) { o = vec4(uColSignal, 1.0) }')
  await expect(page.locator('[data-role="errors"]')).toBeVisible()
  await expect(page.locator('[data-role="status"]')).toHaveText('COMPILE ERROR')

  // Fix it → recompiles clean as an edited live shader.
  await editor.fill('void mainImage(out vec4 o, in vec2 p) { o = vec4(uColSignal * (0.5 + 0.5 * sin(iTime)), 1.0); }')
  await expect(page.locator('[data-role="errors"]')).toBeHidden()
  await expect(page.locator('[data-role="status"]')).toHaveText('LIVE — EDITED')
})

for (const id of ids) {
  test(`shader ${id} is alive`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(String(error)))

    await page.goto(`#/p/${id}?seed=${SEED}`)
    await page.waitForFunction(() => window.__SHADER_READY__ === true, undefined, {
      timeout: 20_000,
    })
    await expect(page.locator('canvas').first()).toBeVisible()

    // Sampled over a window, not at one instant: shaders that build up are bare at
    // frame 1, and shaders that restart a cycle are momentarily back at background.
    const samples: NonNullable<ReturnType<typeof canvasSample>>[] = []
    for (let i = 0; i < SAMPLES; i++) {
      await page.waitForTimeout(i === 0 ? SETTLE_MS : MOTION_MS)
      const sample = await page.evaluate(canvasSample)
      expect(sample, `${id}: no canvas on the page`).not.toBeNull()
      samples.push(sample!)
    }

    const spread = Math.max(...samples.map((sample) => sample.mad))
    const means = samples.map((sample) => sample.mean.toFixed(1)).join(' / ')
    expect(spread, `${id}: blank canvas at every sample (means ${means})`).toBeGreaterThan(
      BLANK_MAD,
    )
    const signatures = new Set(samples.map((sample) => sample.signature))
    expect(signatures.size, `${id}: canvas is frozen`).toBeGreaterThan(1)
    expect(errors.join('\n')).toBe('')
  })
}
