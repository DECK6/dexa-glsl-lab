export type CategoryId =
  | 'raymarch'
  | 'sdf'
  | 'fractal'
  | 'noise'
  | 'flow'
  | 'pattern'
  | 'tiling'
  | 'truchet'
  | 'color'
  | 'light'
  | 'water'
  | 'fire'
  | 'smoke'
  | 'space'
  | 'geometry'
  | 'glitch'
  | 'moire'
  | 'warp'
  | 'cellular'
  | 'minimal'

export interface ShaderMeta {
  id: string
  slug: string
  title: string
  category: CategoryId
  tags: string[]
  description: string
}

export interface Palette {
  bg: string
  ink: string
  signal: string
  accent: string
  paper: string
  dim: string
}
