#!/usr/bin/env node
/**
 * Registry lint (SPEC §4). Fails the build on:
 *  - meta/frag pair mismatch (either direction)
 *  - duplicate IDs, ID not matching the filename prefix, slug mismatch
 *  - ID prefix not matching the category (RM* only in raymarch/, …)
 *  - meta category not matching its folder
 *  - .frag contract violations:
 *      missing mainImage entry point, no iTime reference (must animate),
 *      no uCol* palette uniform reference (central palette only),
 *      #version / precision / out declarations (the runner owns the prelude),
 *      gl_FragColor (ES1), iChannel / texture sampling (single-pass, no inputs)
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const SHADERS = join(ROOT, 'shaders')

const PREFIXES = {
  raymarch: 'RM',
  sdf: 'SD',
  fractal: 'FR',
  noise: 'NS',
  flow: 'FL',
  pattern: 'PT',
  tiling: 'TL',
  truchet: 'TR',
  color: 'CL',
  light: 'LT',
  water: 'WT',
  fire: 'FI',
  smoke: 'SM',
  space: 'SP',
  geometry: 'GE',
  glitch: 'GL',
  moire: 'MO',
  warp: 'WP',
  cellular: 'CA',
  minimal: 'MN',
}

const FORBIDDEN = [
  [/#version/, '#version directive — the runner prelude owns it'],
  [/precision\s+(lowp|mediump|highp)\s+float/, 'precision statement — the runner prelude owns it'],
  [/gl_FragColor/, 'gl_FragColor — write to the mainImage out parameter (GLSL ES 3.0)'],
  [/iChannel\d/, 'iChannel — single-pass catalog, no texture inputs'],
  [/\btexture\s*\(/, 'texture() — single-pass catalog, no texture inputs'],
  [/^\s*out\s+vec4\s/m, 'global out declaration — the runner prelude owns it'],
  [/\buniform\s/, 'uniform declaration — the runner prelude owns all uniforms'],
]

const REQUIRED = [
  [/void\s+mainImage\s*\(\s*out\s+vec4\s+\w+\s*,\s*in\s+vec2\s+\w+\s*\)/, 'mainImage(out vec4, in vec2) entry point'],
  [/\biTime\b/, 'iTime reference — every shader must animate'],
  [/\buCol(Bg|Ink|Signal|Accent|Paper|Dim)\b/, 'palette uniform (uColBg/uColSignal/…) — central palette only'],
]

const errors = []
const ids = new Map()
let fragCount = 0
const inventory = new Map(
  Object.keys(PREFIXES).map((category) => [category, { meta: new Set(), frag: new Set() }]),
)

if (!existsSync(SHADERS)) {
  console.log('lint:registry — shaders/ not present yet, nothing to lint')
  process.exit(0)
}

for (const category of readdirSync(SHADERS)) {
  const categoryDir = join(SHADERS, category)
  if (!statSync(categoryDir).isDirectory()) continue
  const prefix = PREFIXES[category]
  if (!prefix) {
    errors.push(`folder: shaders/${category} is not a known category`)
    continue
  }

  for (const file of readdirSync(categoryDir)) {
    const path = join(categoryDir, file)
    const where = `${category}/${file}`

    if (file.endsWith('.meta.ts')) {
      const match = file.match(/^([A-Z]{2}\d{2})_([a-z0-9-]+)\.meta\.ts$/)
      if (!match) {
        errors.push(`naming: ${where} does not match <ID>_<slug>.meta.ts`)
        continue
      }
      const [, id, slug] = match
      inventory.get(category).meta.add(id)
      if (ids.has(id)) errors.push(`duplicate id ${id}: ${where} vs ${ids.get(id)}`)
      ids.set(id, where)
      if (!id.startsWith(prefix)) {
        errors.push(`prefix: ${where} — ${category}/ ids must start with ${prefix}`)
      }

      if (!existsSync(path.replace(/\.meta\.ts$/, '.frag'))) {
        errors.push(`pair: ${where} has no matching ${id}_${slug}.frag`)
      }

      const source = readFileSync(path, 'utf8')
      const field = (name) => source.match(new RegExp(`${name}:\\s*'([^']*)'`))?.[1]
      if (field('id') !== id) errors.push(`meta id: ${where} must declare id '${id}'`)
      if (field('slug') !== slug) errors.push(`meta slug: ${where} must declare slug '${slug}'`)
      if (field('category') !== category) {
        errors.push(`meta category: ${where} must declare category '${category}'`)
      }
      const title = field('title')
      if (!title || title !== title.toUpperCase()) {
        errors.push(`meta title: ${where} must declare a non-empty uppercase English title`)
      }
      const description = field('description')
      if (!description || !/[가-힣]/.test(description)) {
        errors.push(`meta description: ${where} must declare a Korean sentence`)
      }
      const tagsSource = source.match(/tags:\s*\[([^\]]*)\]/)?.[1]
      const tags = tagsSource ? [...tagsSource.matchAll(/'([^']+)'/g)].map((tag) => tag[1]) : []
      if (tags.length < 3 || tags.length > 5) {
        errors.push(`meta tags: ${where} must declare 3–5 tags`)
      }
      for (const tag of tags) {
        if (!/^[a-z0-9-]+$/.test(tag)) {
          errors.push(`meta tags: ${where} tag '${tag}' must be lowercase kebab-case`)
        }
      }
      continue
    }

    if (file.endsWith('.frag')) {
      fragCount++
      const match = file.match(/^([A-Z]{2}\d{2})_([a-z0-9-]+)\.frag$/)
      if (!match) {
        errors.push(`naming: ${where} does not match <ID>_<slug>.frag`)
        continue
      }
      inventory.get(category).frag.add(match[1])
      if (!existsSync(path.replace(/\.frag$/, '.meta.ts'))) {
        errors.push(`pair: ${where} has no matching ${match[1]}_${match[2]}.meta.ts`)
      }
      const source = readFileSync(path, 'utf8')
      for (const [pattern, message] of FORBIDDEN) {
        const hit = source.match(pattern)
        if (hit) errors.push(`${where}: ${message} (found "${hit[0]}")`)
      }
      for (const [pattern, message] of REQUIRED) {
        if (!pattern.test(source)) errors.push(`${where}: missing ${message}`)
      }
      continue
    }

    errors.push(`stray file: ${where} — only .meta.ts / .frag belong in shaders/`)
  }
}

for (const [category, prefix] of Object.entries(PREFIXES)) {
  const found = inventory.get(category)
  const expected = Array.from({ length: 10 }, (_, index) => `${prefix}${String(index + 1).padStart(2, '0')}`)
  for (const kind of ['meta', 'frag']) {
    const actual = found[kind]
    if (actual.size !== expected.length) {
      errors.push(`count: shaders/${category} must contain 10 ${kind} files, found ${actual.size}`)
    }
    for (const id of expected) {
      if (!actual.has(id)) errors.push(`catalog: shaders/${category} is missing ${id} ${kind}`)
    }
    for (const id of actual) {
      if (!expected.includes(id)) errors.push(`catalog: shaders/${category} has out-of-range ${id} ${kind}`)
    }
  }
}

if (ids.size !== 200) errors.push(`catalog: expected 200 meta entries, found ${ids.size}`)
if (fragCount !== 200) errors.push(`catalog: expected 200 fragment shaders, found ${fragCount}`)

if (errors.length) {
  console.error(`lint:registry — ${errors.length} error(s):`)
  for (const error of errors) console.error(`  ✗ ${error}`)
  process.exit(1)
}
console.log(`lint:registry — OK (${ids.size} meta / ${fragCount} frag)`)
