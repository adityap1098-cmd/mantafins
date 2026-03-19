import ExcelJS from 'exceljs'
import { applyHeaderStyle, autoWidth, RUPIAH_FMT } from '../formatters'
import { SaleRow } from './transaksi'

export interface DetailItemFilters {
  dateFrom?: string
  dateTo?: string
  customer?: string
}

export function buildDetailItemSheet(
  wb: ExcelJS.Workbook,
  rows: SaleRow[],
  filters: DetailItemFilters
): void {
  const ws = wb.addWorksheet('Detail Item')

  ws.columns = [
    { header: 'Tanggal', key: 'date', width: 14 },
    { header: 'No Ref', key: 'refNo', width: 18 },
    { header: 'Konsumen', key: 'customer', width: 20 },
    { header: 'Produk', key: 'productName', width: 24 },
    { header: 'Qty', key: 'qty', width: 8 },
    { header: 'HPP Unit (Rp)', key: 'hppUnit', width: 16, style: { numFmt: RUPIAH_FMT } },
    { header: 'Harga Unit (Rp)', key: 'hargaUnit', width: 16, style: { numFmt: RUPIAH_FMT } },
    { header: 'Subtotal (Rp)', key: 'subtotal', width: 16, style: { numFmt: RUPIAH_FMT } },
  ]

  applyHeaderStyle(ws.getRow(1))

  const filtered = rows.filter((row) => {
    if (filters.dateFrom && row.date < filters.dateFrom) return false
    if (filters.dateTo && row.date > filters.dateTo) return false
    if (filters.customer && row.customer !== filters.customer) return false
    return true
  })

  const detailRows: Array<{
    date: string
    refNo: string
    customer: string
    productName: string
    qty: number
    hppUnit: number
    hargaUnit: number
    subtotal: number
  }> = []

  filtered.forEach((sale) => {
    sale.items.forEach((item) => {
      detailRows.push({
        date: sale.date,
        refNo: sale.refNo,
        customer: sale.customer,
        productName: item.productName,
        qty: item.qty,
        hppUnit: item.hppUnit,
        hargaUnit: item.hargaUnit,
        subtotal: item.hargaUnit * item.qty,
      })
    })
  })

  detailRows.forEach((row) => ws.addRow(row))

  const totalRow = ws.addRow({
    date: 'TOTAL',
    subtotal: detailRows.reduce((s, r) => s + r.subtotal, 0),
  })
  totalRow.font = { bold: true }

  autoWidth(ws)
}
