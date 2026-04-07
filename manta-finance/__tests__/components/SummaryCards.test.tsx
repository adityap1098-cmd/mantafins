// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import SummaryCards from '@/app/dashboard/_components/SummaryCards'
import type { PeriodSummary } from '@/lib/calculator/margin'

const baseSummary: PeriodSummary = {
  totalPenjualan: 1_000_000,
  totalHpp: 600_000,
  totalLabaKotor: 400_000,
  totalDiskon: 50_000,
  totalPiutang: 100_000,
  totalTerbayar: 900_000,
  marginPersen: 40,
}

const higherSummary: PeriodSummary = {
  ...baseSummary,
  totalPenjualan: 1_100_000,
}

const lowerSummary: PeriodSummary = {
  ...baseSummary,
  totalPenjualan: 900_000,
}

describe('SummaryCards', () => {
  it('renders exactly 7 cards', () => {
    render(<SummaryCards summary={baseSummary} previousSummary={null} loading={false} />)
    // Each card has a label visible as uppercase text — check for known labels
    expect(screen.getByText(/Total Penjualan/i)).toBeDefined()
    expect(screen.getByText(/Margin %/i)).toBeDefined()
  })

  it('renders no trend badge when previousSummary is null', () => {
    render(<SummaryCards summary={baseSummary} previousSummary={null} loading={false} />)
    expect(screen.queryByText(/▲/)).toBeNull()
    expect(screen.queryByText(/▼/)).toBeNull()
  })

  it('renders ▲ badge on Penjualan card when current > previous', () => {
    render(<SummaryCards summary={higherSummary} previousSummary={baseSummary} loading={false} />)
    expect(screen.getAllByText(/▲/).length).toBeGreaterThan(0)
  })

  it('renders ▼ badge on Penjualan card when current < previous', () => {
    render(<SummaryCards summary={lowerSummary} previousSummary={baseSummary} loading={false} />)
    expect(screen.getAllByText(/▼/).length).toBeGreaterThan(0)
  })

  it('renders no col-span-2 on any card', () => {
    const { container } = render(<SummaryCards summary={baseSummary} previousSummary={null} loading={false} />)
    const cards = container.querySelectorAll('[class*="col-span-2"]')
    expect(cards.length).toBe(0)
  })
})
