import type { CategoryId } from './catalog'

export type { CategoryId } from './catalog'

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
