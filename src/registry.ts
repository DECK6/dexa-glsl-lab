import type { CategoryId, ShaderMeta } from './types'

export interface Category {
  id: CategoryId
  label: string
  /** two-letter ID prefix — RM01..RM10 live in raymarch/ (SPEC §4) */
  prefix: string
}

// Display order of the filter chips (SPEC §5). Shader order is by id.
export const CATEGORIES: Category[] = [
  { id: 'raymarch', label: 'RAYMARCH', prefix: 'RM' },
  { id: 'sdf', label: 'SDF', prefix: 'SD' },
  { id: 'fractal', label: 'FRACTAL', prefix: 'FR' },
  { id: 'noise', label: 'NOISE', prefix: 'NS' },
  { id: 'flow', label: 'FLOW', prefix: 'FL' },
  { id: 'pattern', label: 'PATTERN', prefix: 'PT' },
  { id: 'tiling', label: 'TILING', prefix: 'TL' },
  { id: 'truchet', label: 'TRUCHET', prefix: 'TR' },
  { id: 'color', label: 'COLOR', prefix: 'CL' },
  { id: 'light', label: 'LIGHT', prefix: 'LT' },
  { id: 'water', label: 'WATER', prefix: 'WT' },
  { id: 'fire', label: 'FIRE', prefix: 'FI' },
  { id: 'smoke', label: 'SMOKE', prefix: 'SM' },
  { id: 'space', label: 'SPACE', prefix: 'SP' },
  { id: 'geometry', label: 'GEOMETRY', prefix: 'GE' },
  { id: 'glitch', label: 'GLITCH', prefix: 'GL' },
  { id: 'moire', label: 'MOIRE', prefix: 'MO' },
  { id: 'warp', label: 'WARP', prefix: 'WP' },
  { id: 'cellular', label: 'CELLULAR', prefix: 'CA' },
  { id: 'minimal', label: 'MINIMAL', prefix: 'MN' },
]

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
  return CATEGORIES.find((category) => category.id === id)?.label ?? id.toUpperCase()
}
