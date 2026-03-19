import ExcelJS from 'exceljs'
import { applyHeaderStyle, autoWidth, RUPIAH_FMT } from '../formatters'

export interface ProductMarginRow {
  sku: string
  name: string
  category: string
  hppUnit: number
  hargaJual: number
  avgTransactionPrice: number
  marginPersen: number
  totalQtySold: number
}

export interface MarginProdukFilters {
  category?: string
}

export function buildMarginProdukSheet(
  wb: ExcelJS.Workbook,
  rows: ProductMarginRow[],
  filters: MarginProdukFilters
): void {
  const ws = wb.addWorksheet('Margin Produk')

  ws.columns = [
    { header: 'SKU', key: 'sku', width: 14 },
    { header: 'Nama', key: 'name', width: 24 },
    { header: 'Kategori', key: 'category', width: 16 },
    { header: 'HPP Unit (Rp)', key: 'hppUnit', width: 16, style: { numFmt: RUPIAH_FMT } },
    { header: 'Harga Jual (Rp)', key: 'hargaJual', width: 18, style: { numFmt: RUPIAH_FMT } },
    { header: 'Harga Aktual (Rp)', key: 'avgTransactionPrice', width: 20, style: { numFmt: RUPIAH_FMT } },
    { header: 'Margin %', key: 'marginPersen', width: 12 },
    { header: 'Total Qty Sold', key: 'totalQtySold', width: 14 },
  ]

  applyHeaderStyle(ws.getRow(1))

  const filtered = rows.filter((row) => {
    if (filters.category && row.category !== filters.category) return false
    return true
  })

  filtered.forEach((r) => ws.addRow(r))

  autoWidth(ws)
}
