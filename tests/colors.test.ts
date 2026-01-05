import { describe, it, expect } from 'vitest'
import { paintColors, trimColors, getColorById, getColorsByBrand } from '../src/data/colors'

describe('paintColors data', () => {
  it('contains paint colors', () => {
    expect(paintColors.length).toBeGreaterThan(0)
  })

  it('all colors have required properties', () => {
    for (const color of paintColors) {
      expect(color.id).toBeTruthy()
      expect(color.brand).toBeTruthy()
      expect(color.brandId).toBeTruthy()
      expect(color.name).toBeTruthy()
      expect(color.hex).toMatch(/^#[0-9A-Fa-f]{6}$/)
      expect(color.lrv).toBeGreaterThanOrEqual(0)
      expect(color.lrv).toBeLessThanOrEqual(100)
      expect(['light', 'mid', 'dark']).toContain(color.depthCategory)
      expect(color.stability).toBeGreaterThanOrEqual(0)
      expect(color.stability).toBeLessThanOrEqual(1)
    }
  })

  it('all colors have valid undertone structure', () => {
    for (const color of paintColors) {
      expect(['warm', 'cool', 'neutral']).toContain(color.undertone.temperature)
      expect(color.undertone.leansPrimary).toBeTruthy()
    }
  })
})

describe('trimColors', () => {
  it('contains only white/trim colors', () => {
    for (const color of trimColors) {
      const hasWhiteTag = color.tags.includes('white')
      const hasTrimTag = color.tags.includes('trim')
      expect(hasWhiteTag || hasTrimTag).toBe(true)
    }
  })

  it('is a subset of paintColors', () => {
    expect(trimColors.length).toBeLessThanOrEqual(paintColors.length)
  })
})

describe('getColorById', () => {
  it('returns color when found', () => {
    const color = getColorById('bm-oc-20')
    expect(color).toBeDefined()
    expect(color?.name).toBe('Pale Oak')
  })

  it('returns undefined for non-existent id', () => {
    const color = getColorById('non-existent-id')
    expect(color).toBeUndefined()
  })
})

describe('getColorsByBrand', () => {
  it('returns only colors from specified brand', () => {
    const bmColors = getColorsByBrand('bm')
    expect(bmColors.length).toBeGreaterThan(0)
    for (const color of bmColors) {
      expect(color.brandId).toBe('bm')
    }
  })

  it('returns empty array for non-existent brand', () => {
    const colors = getColorsByBrand('non-existent-brand')
    expect(colors).toHaveLength(0)
  })

  it('works for all known brands', () => {
    const brands = ['bm', 'sw', 'behr', 'ppg']
    for (const brand of brands) {
      const colors = getColorsByBrand(brand)
      expect(colors.length).toBeGreaterThan(0)
    }
  })
})
