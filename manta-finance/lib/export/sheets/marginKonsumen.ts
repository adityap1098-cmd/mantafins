import ExcelJS from 'exceljs'
import { applyHeaderStyle, autoWidth, RUPIAH_FMT } from '../formatters'

export interface CustomerDiscountRow {
  customer: string
  totalTransactions: number
  totalGrandTotal: number
  avgDiskonPersen: number
}

export function buildMarginKonsumenSheet(
  wb: ExcelJS.Workbook,
  rows: CustomerDiscountRow[]
): void {
  const ws = wb.addWorksheet('Margin Konsumen')

  ws.columns = [
    { header: 'Konsumen', key: 'customer', width: 24 },
    { header: 'Total Transaksi', key: 'totalTransactions', width: 16 },
    { header: 'Grand Total (Rp)', key: 'totalGrandTotal', width: 18, style: { numFmt: RUPIAH_FMT } },
    { header: 'Avg Diskon %', key: 'avgDiskonPersen', width: 14 },
  ]

  applyHeaderStyle(ws.getRow(1))

  rows.forEach((r) => ws.addRow(r))

  autoWidth(ws)
}
