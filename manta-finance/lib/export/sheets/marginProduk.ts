import ExcelJS from 'exceljs'
import { C, FMT, solidFill, THIN_BORDER, applyHeaderStyle, applyDataRow, applyTotalRow, applySheetSetup, setCurrency, addStandardTitle } from '../formatters'

export interface ProductMarginRow {
  sku: string; name: string; category: string; hppUnit: number
  hargaJual: number; avgTransactionPrice: number; marginPersen: number; totalQtySold: number
}
export interface MarginProdukFilters { category?: string }

const WIDTHS = [5, 12, 40, 14, 14, 16, 10, 10, 16]
const NUM_COLS = WIDTHS.length

const KATEGORI_BG: Record<string, string> = {
  'Klep':          C.LIGHT_BLUE_BG,
  'Blok Cylinder': C.LIGHT_ORANGE_BG,
  'Timing Gear':   C.LIGHT_PURPLE_BG,
  'Shim':          C.LIGHT_GREEN_BG,
  'Retainer':      C.LIGHT_YELLOW_BG,
  'TPS':           C.LIGHT_GREEN_BG,
  'Rocker Arm':    C.LIGHT_RED_BG,
  'Tensioner':     C.LIGHT_BLUE_BG,
}

export function buildMarginProdukSheet(wb: ExcelJS.Workbook, rows: ProductMarginRow[], filters: MarginProdukFilters, periodLabel?: string): void {
  const ws = wb.addWorksheet('Margin Produk')
  applySheetSetup(ws, C.ACCENT_GREEN, 3)
  WIDTHS.forEach((w, i) => { ws.getColumn(i + 1).width = w })

  addStandardTitle(ws, `ANALISIS MARGIN PRODUK — ${(periodLabel ?? '').toUpperCase()}`, NUM_COLS)

  const hdr = ws.addRow(['No','SKU','Nama Produk','Kategori','HPP/Unit (Rp)','Harga Jual (Rp)','Margin %','Qty Terjual','Revenue (Rp)'])
  applyHeaderStyle(hdr, NUM_COLS)

  const filtered = rows.filter(r => !filters.category || r.category === filters.category)
  const dataStartRow = 4

  filtered.forEach((r, i) => {
    const revenue = r.hargaJual * r.totalQtySold
    const row = ws.addRow([i + 1, r.sku, r.name, r.category, r.hppUnit, r.hargaJual, r.marginPersen, r.totalQtySold, revenue])
    applyDataRow(row, i, NUM_COLS)
    // SKU: Consolas monospace
    row.getCell(2).font = { name: 'Consolas', size: 9, color: { argb: C.GRAY_TEXT } }
    ;[5,6,9].forEach(c => setCurrency(row.getCell(c)))
    row.getCell(7).numFmt = FMT.PERSEN

    const katBg = KATEGORI_BG[r.category]
    if (katBg) { row.getCell(4).fill = solidFill(katBg); row.getCell(4).border = THIN_BORDER }

    // Margin colour (marginPersen is decimal: 0.72 = 72%)
    if (r.marginPersen >= 0.8) {
      row.getCell(7).font = { name: 'Arial', bold: true, size: 10, color: { argb: C.ACCENT_GREEN } }
    } else if (r.marginPersen < 0.5) {
      row.getCell(7).font = { name: 'Arial', bold: true, size: 10, color: { argb: C.ACCENT_RED } }
    } else {
      row.getCell(7).font = { name: 'Arial', bold: true, size: 10, color: { argb: C.DARK_NAVY } }
    }
  })

  const dataEndRow = dataStartRow + filtered.length - 1
  const cl = (n: number) => String.fromCharCode(64 + n)
  const totalRow = ws.addRow(['','TOTAL','','','','','',
    { formula: `SUM(${cl(8)}${dataStartRow}:${cl(8)}${dataEndRow})` },
    { formula: `SUM(${cl(9)}${dataStartRow}:${cl(9)}${dataEndRow})` },
  ])
  applyTotalRow(totalRow, NUM_COLS)
  totalRow.getCell(9).numFmt = FMT.RUPIAH
}
