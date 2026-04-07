import ExcelJS from 'exceljs'
import { C, FMT, solidFill, applyHeaderStyle, applyDataRow, applyTotalRow, applySheetSetup, setCurrency, setRefNo, addStandardTitle, parseDate } from '../formatters'
import { SaleRow } from './transaksi'

export interface DetailItemFilters { dateFrom?: string; dateTo?: string; customer?: string }

// No, Tanggal, No Ref, Konsumen, Produk, Qty, HPP/Unit, Harga/Unit, Subtotal
const WIDTHS = [5, 11, 22, 20, 38, 6, 14, 14, 16]
const NUM_COLS = WIDTHS.length

export function buildDetailItemSheet(wb: ExcelJS.Workbook, rows: SaleRow[], filters: DetailItemFilters, periodLabel?: string): void {
  const ws = wb.addWorksheet('Detail Item')
  applySheetSetup(ws, C.ACCENT_PURPLE, 3)
  WIDTHS.forEach((w, i) => { ws.getColumn(i + 1).width = w })

  addStandardTitle(ws, `DETAIL ITEM TRANSAKSI — ${(periodLabel ?? '').toUpperCase()}`, NUM_COLS)

  const hdr = ws.addRow(['No','Tanggal','No Referensi','Konsumen','Produk','Qty','HPP/Unit (Rp)','Harga/Unit (Rp)','Subtotal (Rp)'])
  applyHeaderStyle(hdr, NUM_COLS)

  const filtered = rows.filter(r => {
    if (filters.dateFrom && r.date < filters.dateFrom) return false
    if (filters.dateTo && r.date > filters.dateTo) return false
    if (filters.customer && r.customer !== filters.customer) return false
    return true
  })

  const dataStartRow = 4
  let counter = 0

  filtered.forEach(sale => {
    sale.items.forEach(item => {
      const subtotal = item.hargaUnit * item.qty
      const row = ws.addRow([++counter, parseDate(sale.date), sale.refNo, sale.customer, item.productName, item.qty, item.hppUnit, item.hargaUnit, subtotal])
      applyDataRow(row, counter - 1, NUM_COLS)
      // 9pt font for detail rows
      for (let c = 1; c <= NUM_COLS; c++) {
        const cell = row.getCell(c)
        if (!cell.font?.bold) cell.font = { name: 'Arial', size: 9 }
      }
      row.getCell(2).numFmt = FMT.DATE_SHORT
      setRefNo(row.getCell(3))
      ;[7,8].forEach(c => setCurrency(row.getCell(c)))
      // Subtotal bold
      row.getCell(9).font = { name: 'Arial', bold: true, size: 9 }
      row.getCell(9).numFmt = FMT.RUPIAH
    })
  })

  const dataEndRow = dataStartRow + counter - 1
  const colLetter = (n: number) => String.fromCharCode(64 + n)
  const totalRow = ws.addRow([
    '', 'TOTAL', '', '', '',
    { formula: `SUM(${colLetter(6)}${dataStartRow}:${colLetter(6)}${dataEndRow})` },
    '', '',
    { formula: `SUM(${colLetter(9)}${dataStartRow}:${colLetter(9)}${dataEndRow})` },
  ])
  applyTotalRow(totalRow, NUM_COLS)
  totalRow.getCell(9).numFmt = FMT.RUPIAH
}
