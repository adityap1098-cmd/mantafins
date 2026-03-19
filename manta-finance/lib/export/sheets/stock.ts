import ExcelJS from 'exceljs'
import { applyHeaderStyle, autoWidth, RUPIAH_FMT } from '../formatters'

export interface StockItem {
  sku: string
  name: string
  category: string
  hpp: number
  hargaJual: number
  stock: number
  marginUnit: number
  marginPersen: number
}

export interface StockFilters {
  category?: string
}

export function buildStockSheet(
  wb: ExcelJS.Workbook,
  rows: StockItem[],
  filters: StockFilters
): void {
  const ws = wb.addWorksheet('Stock')

  ws.columns = [
    { header: 'SKU', key: 'sku', width: 14 },
    { header: 'Nama', key: 'name', width: 24 },
    { header: 'Kategori', key: 'category', width: 16 },
    { header: 'HPP (Rp)', key: 'hpp', width: 16, style: { numFmt: RUPIAH_FMT } },
    { header: 'Harga Jual (Rp)', key: 'hargaJual', width: 18, style: { numFmt: RUPIAH_FMT } },
    { header: 'Stock', key: 'stock', width: 10 },
    { header: 'Margin/Unit (Rp)', key: 'marginUnit', width: 18, style: { numFmt: RUPIAH_FMT } },
    { header: 'Margin %', key: 'marginPersen', width: 12 },
  ]

  applyHeaderStyle(ws.getRow(1))

  const filtered = rows.filter((row) => {
    if (filters.category && row.category !== filters.category) return false
    return true
  })

  filtered.forEach((r) => ws.addRow(r))

  autoWidth(ws)
}
