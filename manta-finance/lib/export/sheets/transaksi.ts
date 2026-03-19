import ExcelJS from 'exceljs'
import { applyHeaderStyle, autoWidth, RUPIAH_FMT } from '../formatters'

export interface SaleRow {
  id: string
  date: string
  refNo: string
  customer: string
  status: string
  grandTotal: number
  totalHpp: number
  labaKotor: number
  diskon: number
  marginPersen: number
  items: Array<{
    productName: string
    qty: number
    hppUnit: number
    hargaUnit: number
    sku: string
  }>
}

export interface TransaksiFilters {
  dateFrom?: string
  dateTo?: string
  customer?: string
  paymentStatus?: 'all' | 'paid' | 'unpaid'
}

export function buildTransaksiSheet(
  wb: ExcelJS.Workbook,
  rows: SaleRow[],
  filters: TransaksiFilters
): void {
  const ws = wb.addWorksheet('Transaksi')

  ws.columns = [
    { header: 'Tanggal', key: 'date', width: 14 },
    { header: 'No Ref', key: 'refNo', width: 18 },
    { header: 'Konsumen', key: 'customer', width: 20 },
    { header: 'Grand Total (Rp)', key: 'grandTotal', width: 18, style: { numFmt: RUPIAH_FMT } },
    { header: 'HPP Total (Rp)', key: 'totalHpp', width: 18, style: { numFmt: RUPIAH_FMT } },
    { header: 'Laba Kotor (Rp)', key: 'labaKotor', width: 18, style: { numFmt: RUPIAH_FMT } },
    { header: 'Diskon (Rp)', key: 'diskon', width: 14, style: { numFmt: RUPIAH_FMT } },
    { header: 'Status', key: 'status', width: 14 },
  ]

  applyHeaderStyle(ws.getRow(1))

  const filtered = applyTransaksiFilters(rows, filters)

  filtered.forEach((r) =>
    ws.addRow({
      date: r.date,
      refNo: r.refNo,
      customer: r.customer,
      grandTotal: r.grandTotal,
      totalHpp: r.totalHpp,
      labaKotor: r.labaKotor,
      diskon: r.diskon,
      status: r.status,
    })
  )

  const totalRow = ws.addRow({
    date: 'TOTAL',
    grandTotal: filtered.reduce((s, r) => s + r.grandTotal, 0),
    totalHpp: filtered.reduce((s, r) => s + r.totalHpp, 0),
    labaKotor: filtered.reduce((s, r) => s + r.labaKotor, 0),
    diskon: filtered.reduce((s, r) => s + r.diskon, 0),
  })
  totalRow.font = { bold: true }

  autoWidth(ws)
}

function applyTransaksiFilters(rows: SaleRow[], filters: TransaksiFilters): SaleRow[] {
  return rows.filter((row) => {
    if (filters.dateFrom && row.date < filters.dateFrom) return false
    if (filters.dateTo && row.date > filters.dateTo) return false
    if (filters.customer && row.customer !== filters.customer) return false
    if (filters.paymentStatus === 'paid' && row.status !== 'PAID') return false
    if (filters.paymentStatus === 'unpaid' && row.status !== 'UNPAID') return false
    return true
  })
}
