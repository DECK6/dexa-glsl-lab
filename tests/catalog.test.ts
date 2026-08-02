import { describe, expect, test } from 'bun:test'
import {
  CATALOG_TOTAL,
  CATEGORIES,
  DOMAINS,
  RUNTIME_TOTALS,
  categoryById,
} from '../src/catalog'

describe('500-shader catalog contract', () => {
  test('declares five domains and fifty ten-work categories', () => {
    expect(DOMAINS.map((domain) => domain.id)).toEqual([
      'form',
      'field',
      'world',
      'sim',
      'media',
    ])
    expect(CATEGORIES).toHaveLength(50)
    expect(CATALOG_TOTAL).toBe(500)
    expect(new Set(CATEGORIES.map((category) => category.id)).size).toBe(50)
    expect(new Set(CATEGORIES.map((category) => category.prefix)).size).toBe(50)
    expect(CATEGORIES.every((category) => category.count === 10)).toBe(true)
  })

  test('preserves the original twenty categories as core', () => {
    const original: (typeof CATEGORIES)[number]['id'][] = [
      'raymarch', 'sdf', 'fractal', 'noise', 'flow', 'pattern', 'tiling', 'truchet',
      'color', 'light', 'water', 'fire', 'smoke', 'space', 'geometry', 'glitch',
      'moire', 'warp', 'cellular', 'minimal',
    ]
    expect(CATEGORIES.slice(0, 20).map((category) => category.id)).toEqual(original)
    expect(CATEGORIES.slice(0, 20).every((category) => category.runtime === 'core')).toBe(true)
  })

  test('balances the requested runtime tiers', () => {
    expect(RUNTIME_TOTALS).toEqual({ core: 350, buffer: 100, input: 50 })
    expect(categoryById('reaction')?.runtime).toBe('buffer')
    expect(categoryById('audio')?.runtime).toBe('input')
    expect(categoryById('complex')?.prefix).toBe('CX')
  })

  test('assigns deterministic input fixtures only to input categories', () => {
    const inputs = CATEGORIES.filter((category) => category.runtime === 'input')
    expect(inputs.map((category) => category.input)).toEqual([
      'image',
      'camera',
      'composite',
      'environment',
      'audio',
    ])
    expect(
      CATEGORIES.filter((category) => category.runtime !== 'input').every(
        (category) => category.input === undefined,
      ),
    ).toBe(true)
  })
})
