#!/usr/bin/env bun
/** Build one labeled 5×2 thumbnail contact sheet per catalog category. */
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { CATEGORIES } from '../src/catalog.ts'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const THUMBS = join(ROOT, 'public/thumbs')
const OUTPUT = process.argv[2] ?? '/tmp/dexa-glsl-contact-sheets'
mkdirSync(OUTPUT, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 590 }, deviceScaleFactor: 1 })

for (const { prefix, label, runtime, domain } of CATEGORIES) {
  const cards = []
  for (let index = 1; index <= 10; index++) {
    const id = `${prefix}${String(index).padStart(2, '0')}`
    const path = join(THUMBS, `${id}.jpg`)
    if (!existsSync(path)) throw new Error(`missing thumbnail: ${path}`)
    const data = readFileSync(path).toString('base64')
    cards.push(`<figure><img src="data:image/jpeg;base64,${data}"><figcaption>${id}</figcaption></figure>`)
  }
  await page.setContent(`<!doctype html><style>
    *{box-sizing:border-box}body{margin:0;background:#0d0e10;color:#f5f1e6;font-family:ui-monospace,monospace}
    header{height:50px;padding:14px 18px;color:#5ee7f3;font-size:18px;letter-spacing:.14em}
    main{display:grid;grid-template-columns:repeat(5,240px);gap:10px;padding:0 20px 20px}
    figure{position:relative;width:240px;height:250px;margin:0;border:1px solid #292b30;background:#17181b}
    img{display:block;width:240px;height:240px;object-fit:cover}
    figcaption{position:absolute;left:7px;bottom:5px;padding:2px 5px;background:#0d0e10dd;color:#f5f1e6;font-size:12px}
  </style><header>${label} · ${prefix}01–${prefix}10 · ${domain.toUpperCase()} / ${runtime.toUpperCase()}</header><main>${cards.join('')}</main>`)
  await page.screenshot({ path: join(OUTPUT, `${prefix}-${label.toLowerCase()}.png`) })
  console.log(`✓ ${prefix} ${label}`)
}

await browser.close()
console.log(`contact-sheets — OK (${CATEGORIES.length} sheets → ${OUTPUT})`)
