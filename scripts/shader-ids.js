import { existsSync, readdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))

/** Shader ids taken from the shaders/ filenames — the registry itself is Vite-only. */
export function listIds() {
  const root = join(ROOT, 'shaders')
  if (!existsSync(root)) return []
  const ids = []
  for (const category of readdirSync(root)) {
    const dir = join(root, category)
    if (!statSync(dir).isDirectory()) continue
    for (const file of readdirSync(dir)) {
      const match = file.match(/^([A-Z]{2}\d{2})_[a-z0-9-]+\.meta\.ts$/)
      if (match) ids.push(match[1])
    }
  }
  return ids.sort()
}
