// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react'
import SalesTable from './SalesTable'

function makeSaleRow(overrides: Partial<ReturnType<typeof makeSaleRow>> = {}) {
  return {
    id: 'r1',
    date: '2026-01-01T00:00:00Z',
    refNo: 'REF-001',
    customer: 'Customer A',
    status: 'LUNAS',
    grandTotal: 100000,
    paid: 100000,
    balance: 0,
    itemCount: 1,
    totalHpp: 70000,
    labaKotor: 30000,
    diskon: 0,
    marginPersen: 30,
    items: [],
    ...overrides,
  }
}

function makeRows(n: number) {
  return Array.from({ length: n }, (_, i) =>
    makeSaleRow({ id: `r${i + 1}`, grandTotal: 100000 })
  )
}

const defaultProps = {
  sortKey: null as null,
  sortDir: 'asc' as const,
  onSort: () => {},
}

describe('column toggle', () => {
  it('toggling refNo column key removes its th header from DOM', () => {
    render(<SalesTable rows={makeRows(1)} {...defaultProps} />)
    // After toggle, refNo header should be gone
    const toggleBtn = screen.getByRole('button', { name: /No Ref|refNo/i })
    fireEvent.click(toggleBtn)
    expect(screen.queryByRole('columnheader', { name: /No Ref/i })).toBeNull()
  })

  it('required columns date, customer, grandTotal always present after toggling all optional cols', () => {
    render(<SalesTable rows={makeRows(1)} {...defaultProps} />)
    // Toggle all optional columns — required ones must remain
    const optionalLabels = ['No Ref', 'Jml Item', 'HPP Total', 'Laba Kotor', 'Diskon', 'Margin %', 'Status']
    optionalLabels.forEach((label) => {
      const btn = screen.queryByRole('button', { name: new RegExp(label, 'i') })
      if (btn) fireEvent.click(btn)
    })
    expect(screen.getByRole('columnheader', { name: /Tanggal/i })).toBeTruthy()
    expect(screen.getByRole('columnheader', { name: /Konsumen/i })).toBeTruthy()
    expect(screen.getByRole('columnheader', { name: /Grand Total/i })).toBeTruthy()
  })
})

describe('slide-over', () => {
  it('clicking a sales row renders an element containing "Detail Transaksi"', () => {
    render(<SalesTable rows={makeRows(1)} {...defaultProps} />)
    const row = screen.getByText('Customer A').closest('tr')!
    fireEvent.click(row)
    expect(screen.getByText('Detail Transaksi')).toBeTruthy()
  })

  it('clicking the backdrop removes "Detail Transaksi" from DOM', () => {
    render(<SalesTable rows={makeRows(1)} {...defaultProps} />)
    const row = screen.getByText('Customer A').closest('tr')!
    fireEvent.click(row)
    expect(screen.getByText('Detail Transaksi')).toBeTruthy()
    // Backdrop is a fixed overlay div — find by its role or test-id
    const backdrop = document.querySelector('.fixed.inset-0')!
    fireEvent.click(backdrop)
    expect(screen.queryByText('Detail Transaksi')).toBeNull()
  })
})

describe('totals row', () => {
  it('renders a tfoot element with sum of grandTotal across rows', () => {
    render(<SalesTable rows={makeRows(2)} {...defaultProps} />)
    const tfoot = document.querySelector('tfoot')
    expect(tfoot).toBeTruthy()
    // 2 rows × 100,000 = 200,000 — formatted as Indonesian currency
    expect(tfoot!.textContent).toContain('200')
  })

  it('tfoot grandTotal sum updates when rows prop changes', () => {
    const { rerender } = render(<SalesTable rows={makeRows(2)} {...defaultProps} />)
    const tfoot = document.querySelector('tfoot')!
    expect(tfoot.textContent).toContain('200')

    rerender(<SalesTable rows={makeRows(3)} {...defaultProps} />)
    expect(document.querySelector('tfoot')!.textContent).toContain('300')
  })
})
