import ExcelJS from 'exceljs'
import { C, FMT, solidFill, applyHeaderStyle, applyDataRow, applyTotalRow, applySheetSetup, setCurrency, setRefNo, addStandardTitle, parseDate } from '../formatters'

export interface SaleRow {
  id: string; date: string; refNo: string; customer: string; status: string
  grandTotal: number; totalHpp: number; labaKotor: number; diskon: number; marginPersen: number
  items: Array<{ productName: string; qty: number; hppUnit: number; hargaUnit: number; sku: string }>
}

export interface TransaksiFilters {
  dateFrom?: string; dateTo?: string; customer?: string; paymentStatus?: 'all' | 'paid' | 'unpaid'
}

// No, Tanggal, No Ref, Konsumen, Grand Total, HPP, Laba Kotor, Diskon, Status
const WIDTHS = [5, 14, 22, 22, 18, 16, 18, 16, 13]
const NUM_COLS = WIDTHS.length

export function buildTransaksiSheet(wb: ExcelJS.Workbook, rows: SaleRow[], filters: TransaksiFilters, periodLabel?: string): void {
  const ws = wb.addWorksheet('Transaksi')
  applySheetSetup(ws, C.ACCENT_BLUE, 3)
  WIDTHS.forEach((w, i) => { ws.getColumn(i + 1).width = w })

  addStandardTitle(ws, `DAFTAR TRANSAKSI — ${(periodLabel ?? '').toUpperCase()}`, NUM_COLS)

  const hdr = ws.addRow(['No','Tanggal','No Referensi','Konsumen','Grand Total (Rp)','HPP (Rp)','Laba Kotor (Rp)','Diskon (Rp)','Status'])
  applyHeaderStyle(hdr, NUM_COLS)

  const filtered = applyFilters(rows, filters)
  const dataStartRow = 4

  filtered.forEach((r, i) => {
    const row = ws.addRow([i + 1, parseDate(r.date), r.refNo, r.customer, r.grandTotal, r.totalHpp, r.labaKotor, r.diskon, translateStatus(r.status)])
    applyDataRow(row, i, NUM_COLS)
    row.getCell(2).numFmt = FMT.DATE_LONG
    setRefNo(row.getCell(3))
    ;[5,6,7,8].forEach(c => setCurrency(row.getCell(c)))

    // Status coloring — handle various status formats from import source
    const statusCell = row.getCell(9)
    const isPaid = isPaidStatus(r.status)
    statusCell.fill = solidFill(isPaid ? C.LIGHT_GREEN_BG : C.LIGHT_RED_BG)
    statusCell.font = { name: 'Arial', bold: true, size: 10, color: { argb: isPaid ? C.ACCENT_GREEN : C.ACCENT_RED } }
    statusCell.alignment = { horizontal: 'center' }
  })

  // TOTAL row with SUM formulas
  const dataEndRow = dataStartRow + filtered.length - 1
  const col = (n: number) => String.fromCharCode(64 + n)
  const totalRow = ws.addRow([
    '', 'TOTAL', '', '',
    { formula: `SUM(${col(5)}${dataStartRow}:${col(5)}${dataEndRow})` },
    { formula: `SUM(${col(6)}${dataStartRow}:${col(6)}${dataEndRow})` },
    { formula: `SUM(${col(7)}${dataStartRow}:${col(7)}${dataEndRow})` },
    { formula: `SUM(${col(8)}${dataStartRow}:${col(8)}${dataEndRow})` },
    '',
  ])
  applyTotalRow(totalRow, NUM_COLS)
  ;[5,6,7,8].forEach(c => { totalRow.getCell(c).numFmt = FMT.RUPIAH })
}

function isPaidStatus(status: string): boolean {
  const s = status.toLowerCase().trim()
  return s === 'lunas' || s === 'terbayar' || s === 'paid' || s === 'sudah bayar' || s === 'dibayar'
}

function applyFilters(rows: SaleRow[], f: TransaksiFilters): SaleRow[] {
  return rows.filter(r => {
    if (f.dateFrom && r.date < f.dateFrom) return false
    if (f.dateTo && r.date > f.dateTo) return false
    if (f.customer && r.customer !== f.customer) return false
    if (f.paymentStatus === 'paid' && !isPaidStatus(r.status)) return false
    if (f.paymentStatus === 'unpaid' && isPaidStatus(r.status)) return false
    return true
  })
}

function translateStatus(s: string): string {
  const lower = s.toLowerCase().trim()
  if (lower === 'lunas' || lower === 'terbayar' || lower === 'paid' || lower === 'sudah bayar' || lower === 'dibayar') return 'Terbayar'
  if (lower === 'belum bayar' || lower === 'belum dibayar' || lower === 'unpaid' || lower === 'overdue' || lower === 'belum lunas') return 'Belum Bayar'
  if (lower === 'tertunda' || lower === 'partial' || lower === 'sebagian') return 'Tertunda'
  return s
}
