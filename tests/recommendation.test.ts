import { describe, it, expect } from 'vitest'
import {
  recommendProductLine,
  getPrimerRecommendation,
  estimateQuantity,
} from '../src/utils/recommendation'

describe('recommendProductLine', () => {
  it('returns Better tier for standard rooms', () => {
    const result = recommendProductLine('bm', 'walls', [], false)
    expect(result.tier).toBe('Better')
    expect(result.name).toBe('Regal Select')
  })

  it('returns Best tier for high-traffic priorities', () => {
    const result = recommendProductLine('bm', 'walls', ['wipe_clean'], false)
    expect(result.tier).toBe('Best')
    expect(result.name).toBe('Aura')
  })

  it('returns Best tier when noRegretsMode is true', () => {
    const result = recommendProductLine('sw', 'walls', [], true)
    expect(result.tier).toBe('Best')
    expect(result.name).toBe('Emerald Interior')
  })

  it('recommends correct products for trim', () => {
    const result = recommendProductLine('bm', 'trim', [], false)
    expect(result.name).toBe('Advance')
  })

  it('recommends correct products for cabinets', () => {
    const result = recommendProductLine('sw', 'cabinets', [], true)
    expect(result.name).toBe('Emerald Urethane')
  })

  it('falls back to SW for unknown brands', () => {
    const result = recommendProductLine('unknown', 'walls', [], false)
    expect(result.name).toBe('Duration Home')
  })
})

describe('getPrimerRecommendation', () => {
  it('recommends primer for new drywall', () => {
    const result = getPrimerRecommendation('new_drywall')
    expect(result.needed).toBe(true)
    expect(result.type).toBe('Drywall primer')
  })

  it('does not require primer for good existing paint', () => {
    const result = getPrimerRecommendation('painted_good')
    expect(result.needed).toBe(false)
    expect(result.type).toBeNull()
  })

  it('recommends bonding primer for glossy surfaces', () => {
    const result = getPrimerRecommendation('glossy')
    expect(result.needed).toBe(true)
    expect(result.type).toBe('Bonding primer')
  })

  it('recommends stain-blocking primer for wood', () => {
    const result = getPrimerRecommendation('stained_wood')
    expect(result.needed).toBe(true)
    expect(result.type).toBe('Stain-blocking primer')
  })

  it('returns default for unknown conditions', () => {
    const result = getPrimerRecommendation('unknown_surface')
    expect(result.needed).toBe(false)
    expect(result.why).toBe('Standard surface preparation')
  })
})

describe('estimateQuantity', () => {
  it('calculates correct gallons for small room', () => {
    const result = estimateQuantity('small', 8, 'walls')
    expect(result.gallons).toBeGreaterThan(0)
    expect(result.coats).toBe(2)
  })

  it('calculates more gallons for larger rooms', () => {
    const small = estimateQuantity('small', 8, 'walls')
    const large = estimateQuantity('large', 8, 'walls')
    expect(large.gallons).toBeGreaterThan(small.gallons)
  })

  it('adjusts for ceiling height', () => {
    const standard = estimateQuantity('medium', 8, 'walls')
    const tall = estimateQuantity('medium', 12, 'walls') // Use 12ft for clearer difference
    expect(tall.gallons).toBeGreaterThanOrEqual(standard.gallons)
  })

  it('calculates less paint for trim', () => {
    const walls = estimateQuantity('medium', 8, 'walls')
    const trim = estimateQuantity('medium', 8, 'trim')
    expect(trim.gallons).toBeLessThan(walls.gallons)
  })

  it('includes buffer note', () => {
    const result = estimateQuantity('medium', 8, 'walls')
    expect(result.note).toContain('buffer')
  })
})
