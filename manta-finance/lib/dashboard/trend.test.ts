import { describe, it, expect } from 'vitest'
import { computeTrend } from './trend'

describe('computeTrend', () => {
  it('returns pct and direction up when current > previous', () => {
    const result = computeTrend(110, 100)
    expect(result).not.toBeNull()
    expect(result!.pct).toBeCloseTo(10)
    expect(result!.direction).toBe('up')
  })

  it('returns pct and direction down when current < previous', () => {
    const result = computeTrend(90, 100)
    expect(result).not.toBeNull()
    expect(result!.pct).toBeCloseTo(-10)
    expect(result!.direction).toBe('down')
  })

  it('returns null when previous is null', () => {
    expect(computeTrend(100, null)).toBeNull()
  })

  it('returns null when previous is 0', () => {
    expect(computeTrend(100, 0)).toBeNull()
  })

  it('rounds pct to 1 decimal place', () => {
    const result = computeTrend(113, 100)
    expect(result!.pct).toBe(13)
  })
})
