// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import type { CustomerReceivable } from '@/app/api/receivables/route'
import AgingCards from './AgingCards'

// Fixed "today" to avoid flakiness in aging calculations
const TODAY = new Date('2026-03-20')

function daysAgoISO(days: number): string {
  const d = new Date(TODAY)
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

function makeReceivable(
  salesOverrides: Array<{ daysAgo: number; balance: number; id?: string }>
): CustomerReceivable {
  return {
    customer: 'Test Customer',
    totalTransaksi: salesOverrides.length,
    totalTagihan: salesOverrides.reduce((sum, s) => sum + s.balance, 0),
    totalTerbayar: 0,
    totalPiutang: salesOverrides.reduce((sum, s) => sum + s.balance, 0),
    avgDiskonPersen: 0,
    sales: salesOverrides.map((s, i) => ({
      id: s.id ?? `sale-${i}`,
      refNo: `REF-${i}`,
      date: daysAgoISO(s.daysAgo),
      grandTotal: s.balance,
      paid: 0,
      balance: s.balance,
      status: 'Belum Bayar',
    })),
  }
}

describe('AgingCards', () => {
  it('renders three cards with labels "0-30 Hari", "31-60 Hari", ">60 Hari"', () => {
    const receivables = [makeReceivable([{ daysAgo: 5, balance: 100000 }])]
    render(<AgingCards receivables={receivables} today={TODAY} />)

    expect(screen.getByText('0-30 Hari')).toBeTruthy()
    expect(screen.getByText('31-60 Hari')).toBeTruthy()
    expect(screen.getByText('>60 Hari')).toBeTruthy()
  })

  it('bucket "0-30 Hari" shows sum of balances for sales dated within 30 days', () => {
    // 2 sales within 30 days (balance 100_000 each) + 1 sale at 45 days ago (200_000)
    const receivables = [
      makeReceivable([
        { daysAgo: 5, balance: 100000 },
        { daysAgo: 15, balance: 100000 },
        { daysAgo: 45, balance: 200000 },
      ]),
    ]
    render(<AgingCards receivables={receivables} today={TODAY} />)

    // 0-30 card should show 200_000 total (not 400_000 which would include the 45-day sale)
    // Indonesian locale: 200.000
    const card030 = screen.getByTestId('aging-card-0-30')
    expect(card030.textContent).toContain('200')
    expect(card030.textContent).not.toContain('400')
  })

  it('bucket ">60 Hari" shows sum of balances for sales dated more than 60 days ago', () => {
    // 1 sale at 70 days ago (balance 500_000)
    const receivables = [
      makeReceivable([
        { daysAgo: 10, balance: 100000 },
        { daysAgo: 70, balance: 500000 },
      ]),
    ]
    render(<AgingCards receivables={receivables} today={TODAY} />)

    const card60plus = screen.getByTestId('aging-card-60-plus')
    expect(card60plus.textContent).toContain('500')
  })
})
