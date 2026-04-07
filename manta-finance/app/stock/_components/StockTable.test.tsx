// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { rowClass, MarginBadge } from './StockTable'

const makeRow = (stock: number, marginPersen: number) => ({
  id: 'x',
  periodId: 'p',
  sku: 'S1',
  name: 'N',
  category: 'C',
  hpp: 100,
  hargaJual: 150,
  stock,
  marginUnit: 10,
  marginPersen,
})

describe('rowClass', () => {
  it('returns bg-red-50 for stock < 10', () => {
    expect(rowClass(makeRow(5, 50))).toContain('bg-red-50')
  })

  it('returns bg-orange-50 for stock=20 and marginPersen=15 (< 20%)', () => {
    expect(rowClass(makeRow(20, 15))).toContain('bg-orange-50')
  })

  it('returns bg-yellow-50 for stock=30 and marginPersen=25 (stock < 50, margin ok)', () => {
    expect(rowClass(makeRow(30, 25))).toContain('bg-yellow-50')
  })

  it('returns hover:bg-gray-50 for stock=100 and marginPersen=50 (all ok)', () => {
    expect(rowClass(makeRow(100, 50))).toContain('hover:bg-gray-50')
  })
})

describe('MarginBadge', () => {
  it('renders bg-red-100 class when persen=15 (< 20)', () => {
    render(<MarginBadge persen={15} />)
    const span = screen.getByText('15.0%')
    expect(span.className).toContain('bg-red-100')
  })

  it('renders bg-yellow-100 class when persen=30 (20-40)', () => {
    render(<MarginBadge persen={30} />)
    const span = screen.getByText('30.0%')
    expect(span.className).toContain('bg-yellow-100')
  })

  it('renders bg-green-100 class when persen=45 (> 40)', () => {
    render(<MarginBadge persen={45} />)
    const span = screen.getByText('45.0%')
    expect(span.className).toContain('bg-green-100')
  })
})
