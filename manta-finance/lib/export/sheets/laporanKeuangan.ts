import ExcelJS from 'exceljs'
import { applyHeaderStyle, autoWidth, RUPIAH_FMT } from '../formatters'

export interface FinanceSummary {
  totalPendapatan: number
  totalHpp: number
  labaKotor: number
  totalDiskon: number
  totalPiutang: number
  totalTerbayar: number
  netProfit: number
}

export function buildLaporanKeuanganSheet(
  wb: ExcelJS.Workbook,
  summary: FinanceSummary,
  periodLabel: string
): void {
  const ws = wb.addWorksheet('Laporan Keuangan')

  ws.columns = [
    { header: 'Metrik', key: 'metrik', width: 30 },
    { header: 'Nilai', key: 'nilai', width: 20, style: { numFmt: RUPIAH_FMT } },
  ]

  applyHeaderStyle(ws.getRow(1))

  const rows = [
    { metrik: 'Pendapatan', nilai: summary.totalPendapatan },
    { metrik: 'HPP', nilai: summary.totalHpp },
    { metrik: 'Laba Kotor', nilai: summary.labaKotor },
    { metrik: 'Diskon', nilai: summary.totalDiskon },
    { metrik: 'Piutang', nilai: summary.totalPiutang },
    { metrik: 'Terbayar', nilai: summary.totalTerbayar },
    { metrik: 'Laba Bersih', nilai: summary.netProfit },
  ]

  rows.forEach((row) => ws.addRow(row))

  autoWidth(ws)
}
