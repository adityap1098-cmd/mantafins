import ExcelJS from 'exceljs'
import { C, FMT, solidFill, THIN_BORDER, applyHeaderStyle, applySheetSetup, setCurrency } from '../formatters'

export interface FinanceSummary {
  totalPendapatan: number
  totalHpp: number
  labaKotor: number
  totalDiskon: number
  totalPiutang: number
  totalTerbayar: number
  netProfit: number
}

const METRICS = [
  { key: 'totalPendapatan', label: 'Pendapatan',   keterangan: 'Total penjualan',         strip: C.ACCENT_BLUE,   bg: C.LIGHT_BLUE_BG },
  { key: 'totalHpp',        label: 'HPP',           keterangan: 'Harga Pokok Penjualan',    strip: C.ACCENT_GRAY,   bg: C.LIGHT_GRAY_BG },
  { key: 'labaKotor',       label: 'Laba Kotor',    keterangan: 'Pendapatan − HPP',         strip: C.ACCENT_GREEN,  bg: C.LIGHT_GREEN_BG },
  { key: 'totalDiskon',     label: 'Diskon Total',  keterangan: 'Total potongan harga',     strip: C.ACCENT_ORANGE, bg: C.LIGHT_ORANGE_BG },
  { key: 'totalPiutang',    label: 'Piutang',       keterangan: 'Belum terbayar',           strip: C.ACCENT_RED,    bg: C.LIGHT_RED_BG },
  { key: 'totalTerbayar',   label: 'Terbayar',      keterangan: 'Sudah masuk kas',          strip: C.ACCENT_GREEN,  bg: C.LIGHT_GREEN_BG },
  { key: 'netProfit',       label: 'Laba Bersih',   keterangan: 'Pendapatan − HPP − Diskon',strip: C.DARK_NAVY,     bg: C.LIGHT_BLUE_BG },
] as const

export function buildLaporanKeuanganSheet(wb: ExcelJS.Workbook, summary: FinanceSummary, periodLabel: string): void {
  const ws = wb.addWorksheet('Laporan Keuangan')
  applySheetSetup(ws, C.DARK_NAVY, 4)

  ws.getColumn(1).width = 3   // strip
  ws.getColumn(2).width = 22  // metrik
  ws.getColumn(3).width = 22  // nilai
  ws.getColumn(4).width = 30  // keterangan

  // Row 1: MANTA RACING
  const brandRow = ws.addRow(['MANTA RACING'])
  ws.mergeCells(1, 1, 1, 4)
  brandRow.height = 42
  brandRow.getCell(1).font = { name: 'Arial', bold: true, size: 22, color: { argb: C.DARK_NAVY } }
  brandRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'left' }

  // Row 2: subtitle
  const sub = ws.addRow([`Laporan Keuangan — ${periodLabel}`])
  ws.mergeCells(2, 1, 2, 4)
  sub.height = 18
  sub.getCell(1).font = { name: 'Arial', italic: true, size: 10, color: { argb: C.ACCENT_GRAY } }
  sub.getCell(1).alignment = { vertical: 'middle', horizontal: 'left' }

  // Row 3: empty
  ws.addRow([]).height = 8

  // Row 4: header
  const hdr = ws.addRow(['', 'Metrik', 'Nilai (Rp)', 'Keterangan'])
  applyHeaderStyle(hdr, 4)

  // Data rows 5–11
  METRICS.forEach(({ key, label, keterangan, strip, bg }) => {
    const val = summary[key as keyof FinanceSummary]
    const row = ws.addRow(['', label, val, keterangan])
    row.height = 18
    // col A: colour strip
    row.getCell(1).fill = solidFill(strip)
    row.getCell(1).border = THIN_BORDER
    // cols B–D: bg
    for (let c = 2; c <= 4; c++) {
      row.getCell(c).fill = solidFill(bg)
      row.getCell(c).border = THIN_BORDER
    }
    row.getCell(2).font = { name: 'Arial', bold: (label === 'Laba Kotor' || label === 'Laba Bersih'), size: 10 }
    setCurrency(row.getCell(3))
    row.getCell(3).font = { name: 'Arial', bold: (label === 'Laba Kotor' || label === 'Laba Bersih'), size: 10 }
    row.getCell(4).font = { name: 'Arial', italic: true, size: 9, color: { argb: C.ACCENT_GRAY } }
  })

  // Spacer
  ws.addRow([]).height = 8

  // KPI derived rows
  const grossMargin = summary.totalPendapatan > 0 ? summary.labaKotor / summary.totalPendapatan : 0
  const collectionRate = summary.totalPiutang + summary.totalTerbayar > 0
    ? summary.totalTerbayar / (summary.totalPiutang + summary.totalTerbayar) : 0

  const kpiData = [
    { label: 'Gross Margin (%)', val: grossMargin, color: C.ACCENT_GREEN },
    { label: 'Collection Rate (%)', val: collectionRate, color: C.ACCENT_BLUE },
  ]
  kpiData.forEach(({ label, val, color }) => {
    const row = ws.addRow(['', label, val, ''])
    row.height = 16
    row.getCell(1).fill = solidFill(color)
    for (let c = 2; c <= 4; c++) {
      row.getCell(c).fill = solidFill(C.LIGHT_GRAY_BG)
      row.getCell(c).border = THIN_BORDER
    }
    row.getCell(2).font = { name: 'Arial', bold: true, size: 10 }
    row.getCell(3).numFmt = FMT.PERSEN
    row.getCell(3).font = { name: 'Arial', bold: true, size: 10, color: { argb: color } }
  })
}
