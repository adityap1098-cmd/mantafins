// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import PLTable from './PLTable'

interface FinanceSummary {
  totalPendapatan: number
  totalHpp: number
  labaKotor: number
  totalDiskon: number
  totalBiayaOperasional: number
  labaBersih: number
  marginKotor: number
  marginBersih: number
  totalPiutang: number
  totalTerbayar: number
  operationalCosts: { id: string; description: string; amount: number }[]
}

function makeSummary(overrides: Partial<FinanceSummary> = {}): FinanceSummary {
  return {
    totalPendapatan: 1000000,
    totalHpp: 600000,
    labaKotor: 400000,
    totalDiskon: 50000,
    totalBiayaOperasional: 100000,
    labaBersih: 250000,
    marginKotor: 40,
    marginBersih: 25,
    totalPiutang: 200000,
    totalTerbayar: 150000,
    operationalCosts: [],
    ...overrides,
  }
}

describe('PLTable visual hierarchy', () => {
  it('Laba Kotor row always has bg-blue-50 highlight class regardless of sign', () => {
    render(<PLTable summary={makeSummary({ labaKotor: 400000 })} />)

    // Find the "Laba Kotor" label text, then check its container row div for bg-blue-50
    const labaKotorLabel = screen.getByText('Laba Kotor')
    const rowDiv = labaKotorLabel.closest('div[class*="flex"]')
    expect(rowDiv).toBeTruthy()
    expect(rowDiv?.className).toContain('bg-blue-50')
  })

  it('Laba Bersih row has bg-green-50 when positive', () => {
    render(<PLTable summary={makeSummary({ labaBersih: 250000 })} />)

    const labaBersihLabel = screen.getByText('Laba Bersih')
    const rowDiv = labaBersihLabel.closest('div[class*="flex"]')
    expect(rowDiv).toBeTruthy()
    expect(rowDiv?.className).toContain('bg-green-50')
  })

  it('Laba Bersih row has bg-red-50 when negative (labaBersih < 0)', () => {
    render(<PLTable summary={makeSummary({ labaBersih: -10000 })} />)

    const labaBersihLabel = screen.getByText('Laba Bersih')
    const rowDiv = labaBersihLabel.closest('div[class*="flex"]')
    expect(rowDiv).toBeTruthy()
    expect(rowDiv?.className).toContain('bg-red-50')
  })
})
