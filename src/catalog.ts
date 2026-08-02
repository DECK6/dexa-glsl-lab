export type RuntimeTier = 'core' | 'buffer' | 'input'
export type DomainId = 'form' | 'field' | 'world' | 'sim' | 'media'
export type InputFixture = 'image' | 'camera' | 'composite' | 'environment' | 'audio'

export const CATEGORY_IDS = [
  'raymarch', 'sdf', 'fractal', 'noise', 'flow', 'pattern', 'tiling', 'truchet',
  'color', 'light', 'water', 'fire', 'smoke', 'space', 'geometry', 'glitch',
  'moire', 'warp', 'cellular', 'minimal',
  'complex', 'curve', 'plot', 'optics', 'material', 'terrain', 'atmosphere', 'volume',
  'architecture', 'organic', 'typography', 'cartography', 'particle', 'mechanism',
  'topology',
  'automata', 'reaction', 'fluid', 'wave-sim', 'growth', 'swarm', 'erosion',
  'feedback', 'progressive', 'digital-paint',
  'convolution', 'vision', 'compositing', 'environment', 'audio',
] as const

export type CategoryId = (typeof CATEGORY_IDS)[number]

export interface Domain {
  id: DomainId
  label: string
}

export interface Category {
  id: CategoryId
  label: string
  prefix: string
  domain: DomainId
  runtime: RuntimeTier
  count: 10
  input?: InputFixture
}

export const DOMAINS: readonly Domain[] = [
  { id: 'form', label: 'FORM' },
  { id: 'field', label: 'FIELD' },
  { id: 'world', label: 'WORLD' },
  { id: 'sim', label: 'SIM' },
  { id: 'media', label: 'MEDIA' },
]

export const CATEGORIES: readonly Category[] = [
  { id: 'raymarch', label: 'RAYMARCH', prefix: 'RM', domain: 'world', runtime: 'core', count: 10 },
  { id: 'sdf', label: 'SDF', prefix: 'SD', domain: 'form', runtime: 'core', count: 10 },
  { id: 'fractal', label: 'FRACTAL', prefix: 'FR', domain: 'field', runtime: 'core', count: 10 },
  { id: 'noise', label: 'NOISE', prefix: 'NS', domain: 'field', runtime: 'core', count: 10 },
  { id: 'flow', label: 'FLOW', prefix: 'FL', domain: 'field', runtime: 'core', count: 10 },
  { id: 'pattern', label: 'PATTERN', prefix: 'PT', domain: 'form', runtime: 'core', count: 10 },
  { id: 'tiling', label: 'TILING', prefix: 'TL', domain: 'form', runtime: 'core', count: 10 },
  { id: 'truchet', label: 'TRUCHET', prefix: 'TR', domain: 'form', runtime: 'core', count: 10 },
  { id: 'color', label: 'COLOR', prefix: 'CL', domain: 'field', runtime: 'core', count: 10 },
  { id: 'light', label: 'LIGHT', prefix: 'LT', domain: 'world', runtime: 'core', count: 10 },
  { id: 'water', label: 'WATER', prefix: 'WT', domain: 'world', runtime: 'core', count: 10 },
  { id: 'fire', label: 'FIRE', prefix: 'FI', domain: 'world', runtime: 'core', count: 10 },
  { id: 'smoke', label: 'SMOKE', prefix: 'SM', domain: 'world', runtime: 'core', count: 10 },
  { id: 'space', label: 'SPACE', prefix: 'SP', domain: 'world', runtime: 'core', count: 10 },
  { id: 'geometry', label: 'GEOMETRY', prefix: 'GE', domain: 'form', runtime: 'core', count: 10 },
  { id: 'glitch', label: 'GLITCH', prefix: 'GL', domain: 'media', runtime: 'core', count: 10 },
  { id: 'moire', label: 'MOIRE', prefix: 'MO', domain: 'field', runtime: 'core', count: 10 },
  { id: 'warp', label: 'WARP', prefix: 'WP', domain: 'field', runtime: 'core', count: 10 },
  { id: 'cellular', label: 'CELLULAR', prefix: 'CA', domain: 'field', runtime: 'core', count: 10 },
  { id: 'minimal', label: 'MINIMAL', prefix: 'MN', domain: 'form', runtime: 'core', count: 10 },

  { id: 'complex', label: 'COMPLEX', prefix: 'CX', domain: 'field', runtime: 'core', count: 10 },
  { id: 'curve', label: 'CURVE', prefix: 'CV', domain: 'form', runtime: 'core', count: 10 },
  { id: 'plot', label: 'PLOT', prefix: 'PL', domain: 'form', runtime: 'core', count: 10 },
  { id: 'optics', label: 'OPTICS', prefix: 'OP', domain: 'field', runtime: 'core', count: 10 },
  { id: 'material', label: 'MATERIAL', prefix: 'MT', domain: 'field', runtime: 'core', count: 10 },
  { id: 'terrain', label: 'TERRAIN', prefix: 'TE', domain: 'world', runtime: 'core', count: 10 },
  { id: 'atmosphere', label: 'ATMOSPHERE', prefix: 'AT', domain: 'world', runtime: 'core', count: 10 },
  { id: 'volume', label: 'VOLUME', prefix: 'VL', domain: 'world', runtime: 'core', count: 10 },
  { id: 'architecture', label: 'ARCHITECTURE', prefix: 'AR', domain: 'world', runtime: 'core', count: 10 },
  { id: 'organic', label: 'ORGANIC', prefix: 'OR', domain: 'world', runtime: 'core', count: 10 },
  { id: 'typography', label: 'TYPOGRAPHY', prefix: 'TY', domain: 'form', runtime: 'core', count: 10 },
  { id: 'cartography', label: 'CARTOGRAPHY', prefix: 'CM', domain: 'world', runtime: 'core', count: 10 },
  { id: 'particle', label: 'PARTICLE', prefix: 'PR', domain: 'field', runtime: 'core', count: 10 },
  { id: 'mechanism', label: 'MECHANISM', prefix: 'MC', domain: 'form', runtime: 'core', count: 10 },
  { id: 'topology', label: 'TOPOLOGY', prefix: 'TP', domain: 'form', runtime: 'core', count: 10 },

  { id: 'automata', label: 'AUTOMATA', prefix: 'AU', domain: 'sim', runtime: 'buffer', count: 10 },
  { id: 'reaction', label: 'REACTION', prefix: 'RX', domain: 'sim', runtime: 'buffer', count: 10 },
  { id: 'fluid', label: 'FLUID', prefix: 'FD', domain: 'sim', runtime: 'buffer', count: 10 },
  { id: 'wave-sim', label: 'WAVE SIM', prefix: 'WS', domain: 'sim', runtime: 'buffer', count: 10 },
  { id: 'growth', label: 'GROWTH', prefix: 'GR', domain: 'sim', runtime: 'buffer', count: 10 },
  { id: 'swarm', label: 'SWARM', prefix: 'SW', domain: 'sim', runtime: 'buffer', count: 10 },
  { id: 'erosion', label: 'EROSION', prefix: 'ER', domain: 'sim', runtime: 'buffer', count: 10 },
  { id: 'feedback', label: 'FEEDBACK', prefix: 'FB', domain: 'sim', runtime: 'buffer', count: 10 },
  { id: 'progressive', label: 'PROGRESSIVE', prefix: 'PG', domain: 'sim', runtime: 'buffer', count: 10 },
  { id: 'digital-paint', label: 'DIGITAL PAINT', prefix: 'DP', domain: 'sim', runtime: 'buffer', count: 10 },

  { id: 'convolution', label: 'CONVOLUTION', prefix: 'KC', domain: 'media', runtime: 'input', count: 10, input: 'image' },
  { id: 'vision', label: 'VISION', prefix: 'VS', domain: 'media', runtime: 'input', count: 10, input: 'camera' },
  { id: 'compositing', label: 'COMPOSITING', prefix: 'CP', domain: 'media', runtime: 'input', count: 10, input: 'composite' },
  { id: 'environment', label: 'ENVIRONMENT', prefix: 'EV', domain: 'media', runtime: 'input', count: 10, input: 'environment' },
  { id: 'audio', label: 'AUDIO', prefix: 'AD', domain: 'media', runtime: 'input', count: 10, input: 'audio' },
]

export const CATALOG_TOTAL = CATEGORIES.reduce((total, category) => total + category.count, 0)

export const RUNTIME_TOTALS: Readonly<Record<RuntimeTier, number>> = CATEGORIES.reduce(
  (totals, category) => {
    totals[category.runtime] += category.count
    return totals
  },
  { core: 0, buffer: 0, input: 0 },
)

const categoryIndex = new Map(CATEGORIES.map((category) => [category.id, category]))

export function categoryById(id: string): Category | undefined {
  return categoryIndex.get(id as CategoryId)
}
