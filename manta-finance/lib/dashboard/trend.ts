export interface TrendBadge {
  pct: number       // signed percentage, e.g. 12.5 or -8.3
  direction: 'up' | 'down'
}

/**
 * Computes period-over-period trend.
 * Returns null when previous is null (no prior period) or 0 (division undefined).
 * pct uses Math.abs(previous) as denominator to handle negative values correctly.
 */
export function computeTrend(current: number, previous: number | null): TrendBadge | null {
  if (previous === null || previous === 0) return null
  const pct = Math.round(((current - previous) / Math.abs(previous)) * 1000) / 10
  return {
    pct,
    direction: pct >= 0 ? 'up' : 'down',
  }
}
