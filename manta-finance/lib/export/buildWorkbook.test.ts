import { describe, it, expect } from 'vitest'
import ExcelJS from 'exceljs'
import { buildWorkbook, ExportConfig, ExportData } from './buildWorkbook'

// --- Fixtures ---

const mockSaleRows = [
  {
    id: 's1',
    date: '2026-03-01',
    refNo: 'REF-001',
    customer: 'PT Maju',
    status: 'PAID',
    grandTotal: 1000000,
    totalHpp: 700000,
    labaKotor: 300000,
    diskon: 50000,
    marginPersen: 30,
    items: [
      { productName: 'Helm A', qty: 2, hppUnit: 200000, hargaUnit: 350000, sku: 'HLM-001' },
    ],
  },
  {
    id: 's2',
    date: '2026-03-05',
    refNo: 'REF-002',
    customer: 'PT Sejahtera',
    status: 'UNPAID',
    grandTotal: 500000,
    totalHpp: 350000,
    labaKotor: 150000,
    diskon: 0,
    marginPersen: 30,
    items: [
      { productName: 'Sarung Tangan B', qty: 1, hppUnit: 350000, hargaUnit: 500000, sku: 'STG-001' },
    ],
  },
]

const mockSummary = {
  totalPendapatan: 1500000,
  totalHpp: 1050000,
  labaKotor: 450000,
  totalDiskon: 50000,
  totalPiutang: 500000,
  totalTerbayar: 1000000,
  netProfit: 400000,
}

const mockCustomerRows = [
  {
    customer: 'PT Maju',
    totalTransactions: 1,
    totalGrandTotal: 1000000,
    totalTerbayar: 1000000,
    totalPiutang: 0,
    avgDiskonPersen: 5,
  },
  {
    customer: 'PT Sejahtera',
    totalTransactions: 1,
    totalGrandTotal: 500000,
    totalTerbayar: 0,
    totalPiutang: 500000,
    avgDiskonPersen: 0,
  },
]

const mockStockItems = [
  {
    sku: 'HLM-001',
    name: 'Helm A',
    category: 'Helm',
    hpp: 200000,
    hargaJual: 350000,
    stock: 10,
    marginUnit: 150000,
    marginPersen: 42.86,
  },
  {
    sku: 'STG-001',
    name: 'Sarung Tangan B',
    category: 'Aksesoris',
    hpp: 350000,
    hargaJual: 500000,
    stock: 5,
    marginUnit: 150000,
    marginPersen: 30,
  },
]

const mockProductMarginRows = [
  {
    sku: 'HLM-001',
    name: 'Helm A',
    category: 'Helm',
    hppUnit: 200000,
    hargaJual: 350000,
    avgTransactionPrice: 340000,
    marginPersen: 42.86,
    totalQtySold: 2,
  },
]

const mockCustomerDiscountRows = [
  {
    customer: 'PT Maju',
    totalTransactions: 1,
    totalGrandTotal: 1000000,
    avgDiskonPersen: 5,
  },
]

const defaultData: ExportData = {
  summary: mockSummary,
  saleRows: mockSaleRows,
  customerRows: mockCustomerRows,
  stockItems: mockStockItems,
  productMarginRows: mockProductMarginRows,
  customerDiscountRows: mockCustomerDiscountRows,
}

const baseConfig: ExportConfig = {
  periodId: 'period-1',
  periodLabel: 'Maret-2026',
  sheets: [],
  filters: {},
}

// -----------------------------------------------------------------------
// EXPT-01: Sheet Selection
// -----------------------------------------------------------------------

describe('buildWorkbook - sheet selection (EXPT-01)', () => {
  it('produces exactly 1 worksheet named Transaksi when sheets=[transaksi]', async () => {
    const wb = await buildWorkbook({ ...baseConfig, sheets: ['transaksi'] }, defaultData)
    expect(wb.worksheets).toHaveLength(1)
    expect(wb.worksheets[0].name).toBe('Transaksi')
  })

  it('produces 0 worksheets when sheets=[]', async () => {
    const wb = await buildWorkbook({ ...baseConfig, sheets: [] }, defaultData)
    expect(wb.worksheets).toHaveLength(0)
  })

  it('produces 2 worksheets for sheets=[laporanKeuangan, stock]', async () => {
    const wb = await buildWorkbook(
      { ...baseConfig, sheets: ['laporanKeuangan', 'stock'] },
      defaultData
    )
    expect(wb.worksheets).toHaveLength(2)
    const names = wb.worksheets.map((ws) => ws.name)
    expect(names).toContain('Laporan Keuangan')
    expect(names).toContain('Stock')
  })

  it('only adds worksheets listed in config.sheets (not all 7)', async () => {
    const wb = await buildWorkbook(
      { ...baseConfig, sheets: ['piutang', 'marginKonsumen'] },
      defaultData
    )
    expect(wb.worksheets).toHaveLength(2)
  })
})

// -----------------------------------------------------------------------
// EXPT-02: Filter Mapping
// -----------------------------------------------------------------------

describe('buildWorkbook - filter mapping (EXPT-02)', () => {
  it('date range filter applies to Transaksi rows (only rows within range)', async () => {
    const wb = await buildWorkbook(
      {
        ...baseConfig,
        sheets: ['transaksi'],
        filters: { dateFrom: '2026-03-04', dateTo: '2026-03-10' },
      },
      defaultData
    )
    const ws = wb.getWorksheet('Transaksi')!
    // Row 1 is header. Only s2 (2026-03-05) passes date filter; s1 (2026-03-01) does not.
    // Data rows = row 2 (s2 data) + row 3 (total). Total data rows = rowCount - 1 header.
    // We check row 2 has REF-002 (s2) not REF-001 (s1)
    const refCell = ws.getRow(2).getCell(2) // col 2 = refNo
    expect(refCell.value).toBe('REF-002')
  })

  it('date range filter does NOT affect Stock rows', async () => {
    const wb = await buildWorkbook(
      {
        ...baseConfig,
        sheets: ['stock'],
        filters: { dateFrom: '2026-03-04', dateTo: '2026-03-10' },
      },
      defaultData
    )
    const ws = wb.getWorksheet('Stock')!
    // Stock has 2 items — filter should not remove any
    // Row 1 = header, rows 2+ = data (no total row for stock)
    expect(ws.rowCount).toBeGreaterThanOrEqual(3) // header + 2 data rows
  })

  it('customer filter applies to Transaksi rows', async () => {
    const wb = await buildWorkbook(
      {
        ...baseConfig,
        sheets: ['transaksi'],
        filters: { customer: 'PT Maju' },
      },
      defaultData
    )
    const ws = wb.getWorksheet('Transaksi')!
    // Only s1 (PT Maju) passes; row 2 should be PT Maju
    const customerCell = ws.getRow(2).getCell(3) // col 3 = customer
    expect(customerCell.value).toBe('PT Maju')
    // Row 3 is total, so rowCount is 3 (header + 1 data + total)
    expect(ws.rowCount).toBe(3)
  })

  it('customer filter does NOT affect Stock rows', async () => {
    const wb = await buildWorkbook(
      {
        ...baseConfig,
        sheets: ['stock'],
        filters: { customer: 'PT Maju' },
      },
      defaultData
    )
    const ws = wb.getWorksheet('Stock')!
    expect(ws.rowCount).toBeGreaterThanOrEqual(3) // header + 2 items
  })

  it('category filter applies to Stock rows', async () => {
    const wb = await buildWorkbook(
      {
        ...baseConfig,
        sheets: ['stock'],
        filters: { category: 'Helm' },
      },
      defaultData
    )
    const ws = wb.getWorksheet('Stock')!
    // Only 1 stock item has category 'Helm'
    // Row 1 = header, row 2 = HLM-001 only
    expect(ws.rowCount).toBe(2) // header + 1 data row (no total for stock)
    expect(ws.getRow(2).getCell(1).value).toBe('HLM-001')
  })

  it('category filter does NOT affect Transaksi rows', async () => {
    const wb = await buildWorkbook(
      {
        ...baseConfig,
        sheets: ['transaksi'],
        filters: { category: 'Helm' },
      },
      defaultData
    )
    const ws = wb.getWorksheet('Transaksi')!
    // Both sales should still be present
    expect(ws.rowCount).toBe(4) // header + 2 data + 1 total
  })

  it('paymentStatus=unpaid filters Transaksi to only UNPAID rows', async () => {
    const wb = await buildWorkbook(
      {
        ...baseConfig,
        sheets: ['transaksi'],
        filters: { paymentStatus: 'unpaid' },
      },
      defaultData
    )
    const ws = wb.getWorksheet('Transaksi')!
    // Only s2 (UNPAID) passes; row 2 = REF-002
    const refCell = ws.getRow(2).getCell(2)
    expect(refCell.value).toBe('REF-002')
    expect(ws.rowCount).toBe(3) // header + 1 data + total
  })

  it('paymentStatus filter does NOT affect Stock rows', async () => {
    const wb = await buildWorkbook(
      {
        ...baseConfig,
        sheets: ['stock'],
        filters: { paymentStatus: 'unpaid' },
      },
      defaultData
    )
    const ws = wb.getWorksheet('Stock')!
    expect(ws.rowCount).toBeGreaterThanOrEqual(3)
  })
})

// -----------------------------------------------------------------------
// EXPT-03: Formatting
// -----------------------------------------------------------------------

describe('buildWorkbook - formatting (EXPT-03)', () => {
  it('row 1 of Transaksi sheet has fill fgColor.argb = FF1E3A5F', async () => {
    const wb = await buildWorkbook(
      { ...baseConfig, sheets: ['transaksi'] },
      defaultData
    )
    const ws = wb.getWorksheet('Transaksi')!
    const headerRow = ws.getRow(1)
    headerRow.eachCell((cell) => {
      const fill = cell.fill as ExcelJS.FillPattern
      expect(fill?.fgColor?.argb).toBe('FF1E3A5F')
    })
  })

  it('row 1 of Stock sheet has fill fgColor.argb = FF1E3A5F', async () => {
    const wb = await buildWorkbook(
      { ...baseConfig, sheets: ['stock'] },
      defaultData
    )
    const ws = wb.getWorksheet('Stock')!
    ws.getRow(1).eachCell((cell) => {
      const fill = cell.fill as ExcelJS.FillPattern
      expect(fill?.fgColor?.argb).toBe('FF1E3A5F')
    })
  })

  it('grandTotal column in Transaksi sheet data rows has numFmt containing Rp', async () => {
    const wb = await buildWorkbook(
      { ...baseConfig, sheets: ['transaksi'] },
      defaultData
    )
    const ws = wb.getWorksheet('Transaksi')!
    // Col 4 = Grand Total — check that column style has RUPIAH_FMT
    const col = ws.getColumn(4)
    expect(col.style?.numFmt).toContain('Rp')
  })

  it('last data row in Transaksi sheet has bold font (total row)', async () => {
    const wb = await buildWorkbook(
      { ...baseConfig, sheets: ['transaksi'] },
      defaultData
    )
    const ws = wb.getWorksheet('Transaksi')!
    // Last row is the total row
    const lastRow = ws.getRow(ws.rowCount)
    expect(lastRow.font?.bold).toBe(true)
  })

  it('autoWidth: all columns in Transaksi worksheet have width > 0', async () => {
    const wb = await buildWorkbook(
      { ...baseConfig, sheets: ['transaksi'] },
      defaultData
    )
    const ws = wb.getWorksheet('Transaksi')!
    ws.columns.forEach((col) => {
      expect(col.width).toBeGreaterThan(0)
    })
  })

  it('row 1 of Laporan Keuangan sheet has fill fgColor.argb = FF1E3A5F', async () => {
    const wb = await buildWorkbook(
      { ...baseConfig, sheets: ['laporanKeuangan'] },
      defaultData
    )
    const ws = wb.getWorksheet('Laporan Keuangan')!
    ws.getRow(1).eachCell((cell) => {
      const fill = cell.fill as ExcelJS.FillPattern
      expect(fill?.fgColor?.argb).toBe('FF1E3A5F')
    })
  })
})
