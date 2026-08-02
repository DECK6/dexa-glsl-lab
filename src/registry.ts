import { CATEGORIES, categoryById } from './catalog'
import type { CategoryId, ShaderMeta } from './types'

export { CATEGORIES }
export type { Category } from './catalog'

export interface ShaderEntry {
  meta: ShaderMeta
  /** lazy raw GLSL — loaded on card activation / detail entry (SPEC §4) */
  source: () => Promise<string>
}

const metaModules = import.meta.glob<ShaderMeta>('../shaders/**/*.meta.ts', {
  eager: true,
  import: 'default',
})
const sourceModules = import.meta.glob<string>('../shaders/**/*.frag', {
  query: '?raw',
  import: 'default',
})

function build(): ShaderEntry[] {
  const entries: ShaderEntry[] = []
  for (const [path, meta] of Object.entries(metaModules)) {
    const source = sourceModules[path.replace(/\.meta\.ts$/, '.frag')]
    if (!source) {
      console.warn(`registry: ${meta.id} has no matching .frag — skipped`)
      continue
    }
    entries.push({ meta, source })
  }
  return entries.sort((a, b) => a.meta.id.localeCompare(b.meta.id))
}

export const SHADERS: ShaderEntry[] = build()

const index = new Map(SHADERS.map((entry) => [entry.meta.id, entry]))

export function byId(id: string): ShaderEntry | undefined {
  return index.get(id)
}

export function categoryLabel(id: CategoryId): string {
  return categoryById(id)?.label ?? id.toUpperCase()
}
