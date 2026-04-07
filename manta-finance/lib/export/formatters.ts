import ExcelJS from 'exceljs'

// ─── Colour palette ────────────────────────────────────────────────────────
export const C = {
  DARK_NAVY:        'FF1B2A4A',
  ACCENT_BLUE:      'FF2E75B6',
  ACCENT_GREEN:     'FF27AE60',
  ACCENT_RED:       'FFE74C3C',
  ACCENT_ORANGE:    'FFF39C12',
  ACCENT_PURPLE:    'FF8E44AD',
  ACCENT_GRAY:      'FF7F8C8D',
  WHITE:            'FFFFFFFF',
  LIGHT_BLUE_BG:    'FFD6E4F0',
  LIGHT_GREEN_BG:   'FFD5F5E3',
  LIGHT_RED_BG:     'FFFADBD8',
  LIGHT_GRAY_BG:    'FFF2F3F4',
  LIGHT_PURPLE_BG:  'FFE8DAEF',
  LIGHT_ORANGE_BG:  'FFFEF9E7',
  LIGHT_YELLOW_BG:  'FFFAD7A0',
  GRAY_TEXT:        'FF666666',
  BORDER_COLOR:     'FFC0C0C0',
}

// ─── Number / date formats ──────────────────────────────────────────────────
export const FMT = {
  RUPIAH:   '#,##0',
  PERSEN:   '0.0%',
  DATE_LONG:  'DD MMM YYYY',
  DATE_SHORT: 'DD MMM',
}

// ─── Border helpers ─────────────────────────────────────────────────────────
const thinSide = (): Partial<ExcelJS.Border> => ({ style: 'thin', color: { argb: C.BORDER_COLOR } })

export const THIN_BORDER: Partial<ExcelJS.Borders> = {
  top: thinSide(), left: thinSide(), bottom: thinSide(), right: thinSide(),
}

// ─── Fill factories ─────────────────────────────────────────────────────────
export function solidFill(argb: string): ExcelJS.Fill {
  return { type: 'pattern', pattern: 'solid', fgColor: { argb } }
}

// ─── Apply thin border to each cell in a row ────────────────────────────────
export function applyBorder(row: ExcelJS.Row, colCount: number): void {
  for (let c = 1; c <= colCount; c++) {
    row.getCell(c).border = THIN_BORDER
  }
}

// ─── Header row (Row 3 in standard sheets) ──────────────────────────────────
export function applyHeaderStyle(row: ExcelJS.Row, colCount: number): void {
  for (let c = 1; c <= colCount; c++) {
    const cell = row.getCell(c)
    cell.fill = solidFill(C.DARK_NAVY)
    cell.font = { name: 'Arial', bold: true, color: { argb: C.WHITE }, size: 10 }
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
    cell.border = THIN_BORDER
  }
  row.height = 30
}

// ─── Data row fill (alternating) ─────────────────────────────────────────────
export function dataFill(zeroBasedIdx: number): ExcelJS.Fill {
  return solidFill(zeroBasedIdx % 2 === 1 ? C.LIGHT_GRAY_BG : C.WHITE)
}

export function applyDataRow(row: ExcelJS.Row, zeroBasedIdx: number, colCount: number): void {
  const fill = dataFill(zeroBasedIdx)
  for (let c = 1; c <= colCount; c++) {
    const cell = row.getCell(c)
    cell.fill = fill
    if (!cell.font || !cell.font.name) {
      cell.font = { name: 'Arial', size: 10 }
    }
    cell.border = THIN_BORDER
  }
  row.height = 15
}

// ─── Total row ───────────────────────────────────────────────────────────────
export function applyTotalRow(row: ExcelJS.Row, colCount: number): void {
  for (let c = 1; c <= colCount; c++) {
    const cell = row.getCell(c)
    cell.fill = solidFill(C.DARK_NAVY)
    cell.font = { name: 'Arial', bold: true, color: { argb: C.WHITE }, size: 10 }
    cell.border = THIN_BORDER
  }
  row.height = 16
}

// ─── Standard title block (Rows 1–2) ─────────────────────────────────────────
export function addStandardTitle(ws: ExcelJS.Worksheet, title: string, numCols: number): void {
  // Row 1: sheet title
  const titleRow = ws.addRow([title])
  ws.mergeCells(1, 1, 1, numCols)
  titleRow.height = 36
  const tc = titleRow.getCell(1)
  tc.font = { name: 'Arial', bold: true, size: 14, color: { argb: C.DARK_NAVY } }
  tc.alignment = { vertical: 'middle', horizontal: 'left' }

  // Row 2: empty spacer
  const spacer = ws.addRow([])
  spacer.height = 6
}

// ─── Sheet setup (tab colour, freeze, page margins) ──────────────────────────
export function applySheetSetup(
  ws: ExcelJS.Worksheet,
  tabArgb: string,
  freezeRow: number,
): void {
  ws.properties.tabColor = { argb: tabArgb }
  ws.views = [{ state: 'frozen', xSplit: 0, ySplit: freezeRow }]
  ws.pageSetup.margins = { left: 0.5, right: 0.5, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 }
}

// ─── Currency cell helper ─────────────────────────────────────────────────────
export function setCurrency(cell: ExcelJS.Cell): void {
  cell.numFmt = FMT.RUPIAH
  cell.alignment = { horizontal: 'right' }
}

// ─── Ref-no cell (Consolas, gray) ────────────────────────────────────────────
export function setRefNo(cell: ExcelJS.Cell): void {
  cell.font = { name: 'Consolas', size: 9, color: { argb: C.GRAY_TEXT } }
  cell.alignment = { horizontal: 'left' }
}

// ─── Parse date string (ISO or YYYY-MM-DD) to Date ───────────────────────────
export function parseDate(str: string): Date {
  // Handle ISO strings like "2026-03-14T08:39:00.000Z" — take only date part
  const datePart = str.substring(0, 10)
  const [y, m, d] = datePart.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const BULAN_ID: Record<number, string> = {
  1:'Januari',2:'Februari',3:'Maret',4:'April',5:'Mei',6:'Juni',
  7:'Juli',8:'Agustus',9:'September',10:'Oktober',11:'November',12:'Desember',
}
