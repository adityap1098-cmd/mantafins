import ExcelJS from 'exceljs'
import { applyHeaderStyle, autoWidth, RUPIAH_FMT } from '../formatters'

export interface CustomerRow {
  customer: string
  totalTransactions: number
  totalGrandTotal: number
  totalTerbayar: number
  totalPiutang: number
  avgDiskonPersen: number
}

export interface PiutangFilters {
  customer?: string
  paymentStatus?: 'all' | 'paid' | 'unpaid'
}

export function buildPiutangSheet(
  wb: ExcelJS.Workbook,
  rows: CustomerRow[],
  filters: PiutangFilters
): void {
  const ws = wb.addWorksheet('Piutang')

  ws.columns = [
    { header: 'Konsumen', key: 'customer', width: 24 },
    { header: 'Total Transaksi', key: 'totalTransactions', width: 16 },
    { header: 'Grand Total (Rp)', key: 'totalGrandTotal', width: 18, style: { numFmt: RUPIAH_FMT } },
    { header: 'Terbayar (Rp)', key: 'totalTerbayar', width: 16, style: { numFmt: RUPIAH_FMT } },
    { header: 'Piutang (Rp)', key: 'totalPiutang', width: 16, style: { numFmt: RUPIAH_FMT } },
    { header: 'Avg Diskon %', key: 'avgDiskonPersen', width: 14 },
  ]

  applyHeaderStyle(ws.getRow(1))

  const filtered = rows.filter((row) => {
    if (filters.customer && row.customer !== filters.customer) return false
    if (filters.paymentStatus === 'unpaid' && row.totalPiutang <= 0) return false
    if (filters.paymentStatus === 'paid' && row.totalPiutang > 0) return false
    return true
  })

  filtered.forEach((r) => ws.addRow(r))

  const totalRow = ws.addRow({
    customer: 'TOTAL',
    totalTransactions: filtered.reduce((s, r) => s + r.totalTransactions, 0),
    totalGrandTotal: filtered.reduce((s, r) => s + r.totalGrandTotal, 0),
    totalTerbayar: filtered.reduce((s, r) => s + r.totalTerbayar, 0),
    totalPiutang: filtered.reduce((s, r) => s + r.totalPiutang, 0),
  })
  totalRow.font = { bold: true }

  autoWidth(ws)
}
