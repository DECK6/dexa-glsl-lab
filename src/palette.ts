import type { Palette } from './types'

// Single source of truth for artwork colors (SPEC §6). No hex literals anywhere else.
export const DEXA_PALETTE: Palette = {
  bg: '#0D0E10',
  ink: '#17181B',
  signal: '#5EE7F3',
  accent: '#FF5A1F',
  paper: '#F5F1E6',
  dim: '#5A5D63',
}
