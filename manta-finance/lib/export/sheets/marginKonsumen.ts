import ExcelJS from 'exceljs'
import { C, FMT, solidFill, THIN_BORDER, applyHeaderStyle, applyDataRow, applySheetSetup, setCurrency, addStandardTitle } from '../formatters'

export interface CustomerDiscountRow {
  customer: string; totalTransactions: number; totalGrandTotal: number; avgDiskonPersen: number
}

const WIDTHS = [5, 22, 14, 20, 14, 13]
const NUM_COLS = WIDTHS.length

export function buildMarginKonsumenSheet(wb: ExcelJS.Workbook, rows: CustomerDiscountRow[], periodLabel?: string): void {
  const ws = wb.addWorksheet('Margin Konsumen')
  applySheetSetup(ws, C.ACCENT_BLUE, 3)
  WIDTHS.forEach((w, i) => { ws.getColumn(i + 1).width = w })

  addStandardTitle(ws, `ANALISIS MARGIN KONSUMEN — ${(periodLabel ?? '').toUpperCase()}`, NUM_COLS)

  const hdr = ws.addRow(['No','Konsumen','Jml Transaksi','Grand Total (Rp)','Avg Diskon %','Tier'])
  applyHeaderStyle(hdr, NUM_COLS)

  rows.forEach((r, i) => {
    const diskon = r.avgDiskonPersen  // already a percentage value (e.g. 40 = 40%)
    let tier: string, tierFg: string, tierBg: string
    if (diskon >= 40) { tier = 'RESELLER'; tierFg = C.ACCENT_BLUE;   tierBg = C.LIGHT_BLUE_BG }
    else if (diskon >= 20) { tier = 'GROSIR';   tierFg = C.ACCENT_GREEN;  tierBg = C.LIGHT_GREEN_BG }
    else                  { tier = 'RETAIL';    tierFg = C.ACCENT_ORANGE; tierBg = C.LIGHT_ORANGE_BG }

    const row = ws.addRow([i + 1, r.customer, r.totalTransactions, r.totalGrandTotal, diskon / 100, tier])
    applyDataRow(row, i, NUM_COLS)
    setCurrency(row.getCell(4))
    row.getCell(5).numFmt = FMT.PERSEN

    const tc = row.getCell(6)
    tc.fill = solidFill(tierBg)
    tc.font = { name: 'Arial', bold: true, size: 10, color: { argb: tierFg } }
    tc.alignment = { horizontal: 'center' }
    tc.border = THIN_BORDER
  })
}
