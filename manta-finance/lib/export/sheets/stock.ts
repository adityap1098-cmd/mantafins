import ExcelJS from 'exceljs'
import { C, FMT, solidFill, THIN_BORDER, applyHeaderStyle, applyDataRow, applySheetSetup, setCurrency, addStandardTitle } from '../formatters'

export interface StockItem {
  sku: string; name: string; category: string
  hpp: number; hargaJual: number; stock: number; marginUnit: number; marginPersen: number
}
export interface StockFilters { category?: string }

// No, SKU, Nama Produk, Kategori, HPP, Harga Jual, Stock, Margin/Unit, Margin%
const WIDTHS = [5, 12, 40, 14, 14, 16, 8, 16, 10]
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

export function buildStockSheet(wb: ExcelJS.Workbook, rows: StockItem[], filters: StockFilters, periodLabel?: string): void {
  const ws = wb.addWorksheet('Stock')
  applySheetSetup(ws, C.ACCENT_ORANGE, 3)
  WIDTHS.forEach((w, i) => { ws.getColumn(i + 1).width = w })

  addStandardTitle(ws, `DATA STOK PRODUK — ${(periodLabel ?? '').toUpperCase()}`, NUM_COLS)

  const hdr = ws.addRow(['No','SKU','Nama Produk','Kategori','HPP (Rp)','Harga Jual (Rp)','Stock','Margin/Unit (Rp)','Margin %'])
  applyHeaderStyle(hdr, NUM_COLS)

  const filtered = rows.filter(r => !filters.category || r.category === filters.category)

  filtered.forEach((r, i) => {
    const row = ws.addRow([i + 1, r.sku, r.name, r.category, r.hpp, r.hargaJual, r.stock, r.marginUnit, r.marginPersen])
    applyDataRow(row, i, NUM_COLS)
    // SKU: Consolas monospace
    row.getCell(2).font = { name: 'Consolas', size: 9, color: { argb: C.GRAY_TEXT } }
    ;[5,6,8].forEach(c => setCurrency(row.getCell(c)))
    row.getCell(9).numFmt = FMT.PERSEN

    // Kategori colour
    const katBg = KATEGORI_BG[r.category]
    if (katBg) {
      row.getCell(4).fill = solidFill(katBg)
      row.getCell(4).border = THIN_BORDER
    }

    // Stock alert
    if (r.stock < 50) {
      row.getCell(7).font = { name: 'Arial', bold: true, size: 10, color: { argb: C.ACCENT_RED } }
      row.getCell(7).fill = solidFill(C.LIGHT_RED_BG)
      row.getCell(7).border = THIN_BORDER
    } else if (r.stock < 100) {
      row.getCell(7).font = { name: 'Arial', bold: true, size: 10, color: { argb: C.ACCENT_ORANGE } }
    } else {
      row.getCell(7).font = { name: 'Arial', bold: true, size: 10, color: { argb: C.DARK_NAVY } }
    }

    // Margin colour (marginPersen is decimal: 0.72 = 72%)
    if (r.marginPersen >= 0.8) {
      row.getCell(9).font = { name: 'Arial', bold: true, size: 10, color: { argb: C.ACCENT_GREEN } }
    } else if (r.marginPersen < 0.5) {
      row.getCell(9).font = { name: 'Arial', bold: true, size: 10, color: { argb: C.ACCENT_RED } }
    } else {
      row.getCell(9).font = { name: 'Arial', bold: true, size: 10, color: { argb: C.DARK_NAVY } }
    }
  })
}
