import ExcelJS from 'exceljs'
import { C, FMT, solidFill, THIN_BORDER, applyHeaderStyle, applyDataRow, applyTotalRow, applySheetSetup, setCurrency, addStandardTitle } from '../formatters'

export interface CustomerRow {
  customer: string; totalTransactions: number; totalGrandTotal: number
  totalTerbayar: number; totalPiutang: number; avgDiskonPersen: number
}
export interface PiutangFilters { customer?: string; paymentStatus?: 'all' | 'paid' | 'unpaid' }

// No, Konsumen, Jml Transaksi, Grand Total, Terbayar, Piutang, Status
const WIDTHS = [5, 22, 14, 20, 18, 18, 15]
const NUM_COLS = WIDTHS.length

export function buildPiutangSheet(wb: ExcelJS.Workbook, rows: CustomerRow[], filters: PiutangFilters, periodLabel?: string): void {
  const ws = wb.addWorksheet('Piutang')
  applySheetSetup(ws, C.ACCENT_RED, 3)
  WIDTHS.forEach((w, i) => { ws.getColumn(i + 1).width = w })

  addStandardTitle(ws, `LAPORAN PIUTANG — ${(periodLabel ?? '').toUpperCase()}`, NUM_COLS)

  const hdr = ws.addRow(['No','Konsumen','Jml Transaksi','Grand Total (Rp)','Terbayar (Rp)','Piutang (Rp)','Status'])
  applyHeaderStyle(hdr, NUM_COLS)

  const filtered = rows.filter(r => {
    if (filters.customer && r.customer !== filters.customer) return false
    if (filters.paymentStatus === 'unpaid' && r.totalPiutang <= 0) return false
    if (filters.paymentStatus === 'paid' && r.totalPiutang > 0) return false
    return true
  })

  const dataStartRow = 4
  filtered.forEach((r, i) => {
    const lunas = r.totalPiutang <= 0
    const row = ws.addRow([i + 1, r.customer, r.totalTransactions, r.totalGrandTotal, r.totalTerbayar, r.totalPiutang, lunas ? 'LUNAS' : 'BELUM LUNAS'])
    applyDataRow(row, i, NUM_COLS)
    ;[4,5,6].forEach(c => setCurrency(row.getCell(c)))

    // Piutang value: red bold if > 0
    if (!lunas) {
      row.getCell(6).font = { name: 'Arial', bold: true, size: 10, color: { argb: C.ACCENT_RED } }
    }

    // Status cell
    const sc = row.getCell(7)
    sc.fill = solidFill(lunas ? C.LIGHT_GREEN_BG : C.LIGHT_RED_BG)
    sc.font = { name: 'Arial', bold: true, size: 10, color: { argb: lunas ? C.ACCENT_GREEN : C.ACCENT_RED } }
    sc.alignment = { horizontal: 'center' }
    sc.border = THIN_BORDER
  })

  const dataEndRow = dataStartRow + filtered.length - 1
  const cl = (n: number) => String.fromCharCode(64 + n)
  const totalRow = ws.addRow([
    '', 'TOTAL',
    { formula: `SUM(${cl(3)}${dataStartRow}:${cl(3)}${dataEndRow})` },
    { formula: `SUM(${cl(4)}${dataStartRow}:${cl(4)}${dataEndRow})` },
    { formula: `SUM(${cl(5)}${dataStartRow}:${cl(5)}${dataEndRow})` },
    { formula: `SUM(${cl(6)}${dataStartRow}:${cl(6)}${dataEndRow})` },
    '',
  ])
  applyTotalRow(totalRow, NUM_COLS)
  ;[4,5,6].forEach(c => { totalRow.getCell(c).numFmt = FMT.RUPIAH })

  // ── Summary section ──────────────────────────────────────────────────────
  ws.addRow([]).height = 10

  const totalPiutang = filtered.reduce((s, r) => s + r.totalPiutang, 0)
  const totalTerbayar = filtered.reduce((s, r) => s + r.totalTerbayar, 0)
  const totalGrand = filtered.reduce((s, r) => s + r.totalGrandTotal, 0)
  const collRate = totalGrand > 0 ? totalTerbayar / totalGrand : 0

  const summary = [
    { label: 'Total Piutang Outstanding', val: totalPiutang, fmt: FMT.RUPIAH, color: C.ACCENT_RED, bg: C.LIGHT_RED_BG },
    { label: 'Total Sudah Terbayar',       val: totalTerbayar, fmt: FMT.RUPIAH, color: C.ACCENT_GREEN, bg: C.LIGHT_GREEN_BG },
    { label: 'Collection Rate',            val: collRate,    fmt: FMT.PERSEN, color: C.ACCENT_BLUE,  bg: C.LIGHT_BLUE_BG },
  ]
  summary.forEach(({ label, val, fmt, color, bg }) => {
    const r = ws.addRow(['', label, val, ''])
    ws.mergeCells(r.number, 3, r.number, 4)
    r.height = 16
    for (let c = 1; c <= 4; c++) r.getCell(c).fill = solidFill(bg)
    r.getCell(2).font = { name: 'Arial', bold: true, size: 10 }
    r.getCell(3).numFmt = fmt
    r.getCell(3).font = { name: 'Arial', bold: true, size: 10, color: { argb: color } }
    r.getCell(3).alignment = { horizontal: 'right' }
  })
}
