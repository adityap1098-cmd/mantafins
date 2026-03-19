import ExcelJS from 'exceljs'

export const RUPIAH_FMT = '"Rp "#,##0'

export const HEADER_FILL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FF1E3A5F' },
}

export const HEADER_FONT: Partial<ExcelJS.Font> = {
  bold: true,
  color: { argb: 'FFFFFFFF' },
  size: 11,
}

export function applyHeaderStyle(row: ExcelJS.Row): void {
  row.eachCell((cell) => {
    cell.fill = HEADER_FILL
    cell.font = HEADER_FONT
    cell.alignment = { vertical: 'middle', horizontal: 'center' }
    cell.border = {
      bottom: { style: 'medium', color: { argb: 'FF1E3A5F' } },
    }
  })
  row.height = 22
}

export function autoWidth(worksheet: ExcelJS.Worksheet, minimalWidth = 10): void {
  worksheet.columns.forEach((column) => {
    let maxLength = 0
    if (column && typeof column.eachCell === 'function') {
      column.eachCell({ includeEmpty: true }, (cell) => {
        maxLength = Math.max(
          maxLength,
          minimalWidth,
          cell.value ? cell.value.toString().length : 0
        )
      })
      column.width = maxLength + 2
    }
  })
}

export const BULAN_ID: Record<number, string> = {
  1: 'Januari',
  2: 'Februari',
  3: 'Maret',
  4: 'April',
  5: 'Mei',
  6: 'Juni',
  7: 'Juli',
  8: 'Agustus',
  9: 'September',
  10: 'Oktober',
  11: 'November',
  12: 'Desember',
}
