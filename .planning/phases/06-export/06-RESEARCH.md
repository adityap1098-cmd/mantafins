# Phase 6: Export - Research

**Researched:** 2026-03-19
**Domain:** ExcelJS workbook generation, Next.js binary file API route, client-triggered browser download
**Confidence:** HIGH

## Summary

Phase 6 adds a `/export` page where the user selects report sheets and applies filters, then downloads a formatted Excel file. The implementation has three moving parts: (1) a new page with a two-column config/preview UI, (2) a POST API route at `/api/export` that queries existing data sources, builds an ExcelJS workbook, and returns a binary response, and (3) a client-side fetch-to-blob-download trigger.

ExcelJS is the locked library (PROJECT.md). It is NOT yet installed — it is absent from `package.json` and not present in `node_modules`. All 6 existing pages have inline nav with 6 links; a 7th "Export" link must be added to every page's nav as part of this phase. Data fetching in the export route can reuse the same Prisma queries already used in `/api/finance`, `/api/sales`, `/api/receivables`, and `/api/stock` — no new database logic is needed, only assembly into ExcelJS sheets.

**Primary recommendation:** Install ExcelJS, build a single `lib/export/buildWorkbook.ts` pure function that accepts config+data and returns an ExcelJS Workbook, call it from a thin POST route handler, and use `workbook.xlsx.writeBuffer()` to return binary via `new Response(buffer, { headers })`.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Export UI: New dedicated `/export` page — not embedded in existing pages
- Navigation: 7th link in main nav bar named "Export" — added to all 6 existing pages AND new export page
- Layout: Two-column — left column: config (period + sheet selection + filters), right column: preview (selected sheets + row counts)
- Export trigger: Direct browser file download — no email, no cloud storage
- File naming: `Manta-Racing-Export-Maret-2026.xlsx` (Indonesian month name + year)
- Sheet selection: Checklist of 7 sheets, all selected by default:
  - Laporan Keuangan (P&L)
  - Transaksi
  - Detail Item
  - Piutang
  - Stock
  - Margin Produk
  - Margin Konsumen
- Right-side preview: Row count per selected sheet (requires a quick count query per sheet)
- Filters: Period bulan/tahun (required), Date range, Customer, Category, Payment status
- Filter-to-sheet mapping (filters NOT applied uniformly):
  - Date range → Transaksi, Detail Item only
  - Customer → Transaksi, Detail Item, Piutang only
  - Category → Stock, Margin Produk only
  - Payment status → Transaksi, Piutang only
- ExcelJS is locked (from PROJECT.md)
- Excel formatting: Rupiah number formatting, auto-width columns, colored header rows, sub-totals/grand totals per EXPT-03

### Claude's Discretion
- Exact header row color and styling
- Sheet tab colors in the Excel file
- How to handle empty sheets when filters produce 0 rows (include empty sheet with header, or skip?)
- Loading state while server generates the Excel file

### Deferred Ideas (OUT OF SCOPE)
- None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| EXPT-01 | User can select which report sheets to include (7-sheet checklist, all on by default) | Sheet selection state in ExportClient → sent as `sheets[]` array in POST body; server only builds selected sheets |
| EXPT-02 | User can apply filters before export (date range, customer, category, payment status) | Filters sent in POST body; server applies per-sheet filter mapping using Prisma `where` clauses consistent with existing API routes |
| EXPT-03 | Excel file has formatted headers, Rupiah formatting, auto-width columns, colored header rows, sub-totals/grand totals | ExcelJS `cell.numFmt`, `cell.fill`, `column.width` (manual auto-fit), `addRow` for total rows — all verified patterns |
</phase_requirements>

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| exceljs | ^4.4.0 (latest stable) | Build multi-sheet .xlsx workbooks with full styling control | Locked in PROJECT.md; supports numFmt, fill, font, column width — more control than SheetJS for formatted output |

### Already Installed (No Action)
| Library | Version | Purpose |
|---------|---------|---------|
| next | 14.2.35 | App Router API route returns binary response via `new Response(buffer, { headers })` |
| prisma | ^7.5.0 | Data queries — reuse existing patterns from finance/sales/receivables/stock routes |
| tailwindcss | ^3.4.1 | Export page UI — same styling as all other pages |

### Not Needed
| Skipped | Reason |
|---------|--------|
| react-query / SWR | Single fetch-on-demand — no polling |
| file-saver | Browser native `URL.createObjectURL` + anchor click is sufficient |
| xlsx (SheetJS) | Already in package.json for upload parsing — do NOT use for export; ExcelJS is locked |

**Installation (ExcelJS only):**
```bash
cd "H:/AI/VERA/Manta Racing/manta-finance" && npm install exceljs
```

TypeScript types are bundled with exceljs (no `@types/exceljs` needed).

---

## Architecture Patterns

### Recommended Project Structure
```
manta-finance/
├── app/
│   ├── export/
│   │   ├── page.tsx              # Server component: auth check only
│   │   └── _components/
│   │       └── ExportClient.tsx  # All UI state: sheet selection, filters, preview
│   └── api/
│       └── export/
│           └── route.ts          # POST: accepts config, returns .xlsx binary
├── lib/
│   └── export/
│       ├── buildWorkbook.ts      # Pure function: data → ExcelJS Workbook
│       ├── sheets/
│       │   ├── laporanKeuangan.ts
│       │   ├── transaksi.ts
│       │   ├── detailItem.ts
│       │   ├── piutang.ts
│       │   ├── stock.ts
│       │   ├── marginProduk.ts
│       │   └── marginKonsumen.ts
│       └── formatters.ts         # Shared: autoWidth, rupiahFmt, headerStyle
```

### Pattern 1: POST API Route Returning Binary Excel

The export API must be POST (not GET) because it accepts a complex config body. The route queries data, calls `buildWorkbook()`, writes to buffer, and returns with download headers.

```typescript
// app/api/export/route.ts
import { NextRequest } from 'next/server'
import ExcelJS from 'exceljs'
import { prisma } from '@/lib/prisma'
import { validateSession, SESSION_COOKIE_NAME } from '@/lib/auth'
import { buildWorkbook } from '@/lib/export/buildWorkbook'

export interface ExportConfig {
  periodId: string
  periodLabel: string  // e.g. "Maret-2026" — used in filename
  sheets: string[]     // e.g. ['laporanKeuangan', 'transaksi', ...]
  filters: {
    dateFrom?: string
    dateTo?: string
    customer?: string
    category?: string
    paymentStatus?: 'all' | 'paid' | 'unpaid'
  }
}

export async function POST(req: NextRequest): Promise<Response> {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value
  if (!token || !(await validateSession(token))) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const config: ExportConfig = await req.json()
  if (!config.periodId) {
    return new Response(JSON.stringify({ error: 'periodId required' }), { status: 400 })
  }

  // Fetch data (reuse existing prisma query patterns)
  // ...

  const workbook = await buildWorkbook(config, data)
  const buffer = await workbook.xlsx.writeBuffer()

  return new Response(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="Manta-Racing-Export-${config.periodLabel}.xlsx"`,
    },
  })
}
```

### Pattern 2: ExcelJS Sheet Construction with Full Formatting

Each sheet builder follows this pattern — define columns, add header row with style, add data rows, add totals row, then auto-width.

```typescript
// lib/export/sheets/transaksi.ts
import ExcelJS from 'exceljs'
import { autoWidth, applyHeaderStyle, RUPIAH_FMT, HEADER_FILL } from '../formatters'

export function buildTransaksiSheet(wb: ExcelJS.Workbook, rows: SaleRow[]): void {
  const ws = wb.addWorksheet('Transaksi')

  ws.columns = [
    { header: 'Tanggal', key: 'date', width: 14 },
    { header: 'No Ref', key: 'refNo', width: 18 },
    { header: 'Konsumen', key: 'customer', width: 20 },
    { header: 'Grand Total', key: 'grandTotal', width: 16, style: { numFmt: RUPIAH_FMT } },
    { header: 'HPP Total', key: 'totalHpp', width: 16, style: { numFmt: RUPIAH_FMT } },
    { header: 'Laba Kotor', key: 'labaKotor', width: 16, style: { numFmt: RUPIAH_FMT } },
    { header: 'Diskon', key: 'diskon', width: 14, style: { numFmt: RUPIAH_FMT } },
    { header: 'Status', key: 'status', width: 14 },
  ]

  // Style header row (row 1)
  applyHeaderStyle(ws.getRow(1))

  // Add data rows
  rows.forEach(r => ws.addRow(r))

  // Grand total row
  if (rows.length > 0) {
    const totalRow = ws.addRow({
      date: 'TOTAL',
      grandTotal: rows.reduce((s, r) => s + r.grandTotal, 0),
      totalHpp: rows.reduce((s, r) => s + r.totalHpp, 0),
      labaKotor: rows.reduce((s, r) => s + r.labaKotor, 0),
      diskon: rows.reduce((s, r) => s + r.diskon, 0),
    })
    totalRow.font = { bold: true }
    totalRow.getCell('date').font = { bold: true }
  }

  autoWidth(ws)
}
```

### Pattern 3: Shared Formatters

```typescript
// lib/export/formatters.ts
import ExcelJS from 'exceljs'

// Rupiah format: "Rp 1.234.567" — Indonesian locale uses . as thousands separator
export const RUPIAH_FMT = '"Rp "#,##0'

export const HEADER_FILL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FF1E3A5F' },  // Deep navy (Claude's discretion)
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

// Auto-width: iterate all cells, find max content length, set width
// Source: https://gist.github.com/ShinChven/16265da683ff397471a2fe8a6f48d7b0
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
```

### Pattern 4: Client-Side Fetch-to-Download

```typescript
// Inside ExportClient.tsx — handleExport function
async function handleExport(): Promise<void> {
  setLoading(true)
  try {
    const res = await fetch('/api/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    })
    if (!res.ok) throw new Error('Export failed')

    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Manta-Racing-Export-${config.periodLabel}.xlsx`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  } finally {
    setLoading(false)
  }
}
```

### Pattern 5: Preview Row Count API

The right-side panel needs row counts per selected sheet before the user downloads. This requires a lightweight count endpoint or including counts in the initial page load. Recommended: a separate GET `/api/export/preview?periodId=X&filters=...` that returns `{ [sheetKey]: number }` — each count maps to a simple `prisma.sale.count()` or `prisma.productSnapshot.count()` query.

### Anti-Patterns to Avoid

- **Returning the buffer via `NextResponse.json()`:** Binary data must use `new Response(buffer, { headers })` — not NextResponse.json. NextResponse.json will corrupt binary.
- **Applying all filters to all sheets:** Filters are sheet-specific (see CONTEXT.md). Date range does NOT affect Laporan Keuangan or Stock sheets.
- **Calling `ws.columns = [...]` after adding rows:** ExcelJS applies column style to existing cells on assignment. Set `ws.columns` BEFORE adding data rows.
- **Using `workbook.xlsx.write(stream)`:** In a Next.js API route, there is no writable stream. Use `workbook.xlsx.writeBuffer()` which returns a Promise<Buffer>.
- **Setting numFmt on the column definition AND individual cells:** This causes double-formatting. Pick one: column-level `style: { numFmt }` for data columns, or cell-level `cell.numFmt` for total rows.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Column auto-width | Custom width calculator | `autoWidth()` function (6-line utility, see Code Examples) | The pattern is well-established and consistent across the codebase |
| Rupiah number formatting | String concatenation "Rp X.XXX" | ExcelJS `numFmt: '"Rp "#,##0'` | Native numFmt keeps numbers as numbers — Excel can sort/sum them; string concat turns them into text |
| Excel MIME type | Guess the content-type | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` | Exact OOXML MIME type; `application/vnd.ms-excel` works but is the older .xls type |
| Month-to-Indonesian-name | Custom switch statement | Small lookup map in `lib/export/formatters.ts` | 12 entries, predictable |

**Key insight:** ExcelJS handles all the complex .xlsx XML generation. The only hand-rolled pieces are the auto-width traversal (6 lines) and the totals row accumulation (reduce). Everything else is ExcelJS API calls.

---

## Common Pitfalls

### Pitfall 1: ExcelJS Not Installed
**What goes wrong:** Build fails with `Cannot find module 'exceljs'`.
**Why it happens:** ExcelJS is absent from package.json — it is locked in PROJECT.md but was never installed.
**How to avoid:** Wave 0 task must `npm install exceljs` before any code references it.
**Warning signs:** TypeScript import error on `import ExcelJS from 'exceljs'`.

### Pitfall 2: Nav Link Update Scope
**What goes wrong:** Export page is accessible but nav on 6 existing pages still shows 6 links.
**Why it happens:** Nav is inline in each page.tsx — there is no shared NavBar component. All 6 files must be patched.
**How to avoid:** Plan must explicitly list all 6 files that need nav update: `dashboard/page.tsx`, `import/page.tsx`, `stock/page.tsx`, `sales/page.tsx`, `finance/page.tsx`, `receivables/page.tsx`.
**Warning signs:** Can navigate TO export page from export nav but cannot navigate there from other pages.

### Pitfall 3: Column Definition Order Relative to Row Addition
**What goes wrong:** Header row styling doesn't apply to all cells, or column numFmt doesn't apply to data rows.
**Why it happens:** ExcelJS applies column styles to existing cells at the time `ws.columns = [...]` is called. If rows are added before columns are defined, the style won't apply retroactively.
**How to avoid:** Always set `ws.columns = [...]` FIRST, then add rows.

### Pitfall 4: Filter Scope Mismatch
**What goes wrong:** Customer filter is applied to Stock sheet (incorrect) or Category filter is applied to Piutang sheet (incorrect).
**Why it happens:** Naive implementation passes all filters to all sheets.
**How to avoid:** Each sheet builder function only accepts the filters relevant to it (see filter-to-sheet mapping in CONTEXT.md).

### Pitfall 5: Period Label in Indonesian
**What goes wrong:** Filename is `Manta-Racing-Export-March-2026.xlsx` (English) instead of `Manta-Racing-Export-Maret-2026.xlsx`.
**Why it happens:** JavaScript `Date.toLocaleDateString('id-ID', { month: 'long' })` requires locale support that may not be available in all Node.js environments.
**How to avoid:** Use a hardcoded 12-entry lookup map for Indonesian month names — guaranteed to work regardless of Node.js ICU data.

### Pitfall 6: Large Export Timeout
**What goes wrong:** Export for a large period times out (Next.js default route timeout).
**Why it happens:** Building 7 sheets with hundreds of rows + ExcelJS formatting is synchronous and CPU-bound.
**How to avoid:** Not a concern for this use case — Manta Racing has ~32 SKUs and typically <50 transactions per period. No timeout risk at this data volume. No streaming needed.

---

## Code Examples

### ExcelJS Workbook to Buffer (verified pattern)
```typescript
// Source: ExcelJS official README - https://github.com/exceljs/exceljs
const workbook = new ExcelJS.Workbook()
const ws = workbook.addWorksheet('Sheet 1', {
  properties: { tabColor: { argb: 'FF1E3A5F' } }
})
// ... add data ...
const buffer = await workbook.xlsx.writeBuffer()
// buffer is a Buffer — pass directly to new Response(buffer, { headers })
```

### Header Row Styling (verified pattern)
```typescript
// Source: ExcelJS official README
headerRow.eachCell((cell) => {
  cell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E3A5F' },
  }
  cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
  cell.alignment = { vertical: 'middle', horizontal: 'center' }
})
```

### Rupiah Number Format
```typescript
// numFmt string: Rp prefix, comma thousands separator, no decimals
// Displays as: Rp 1,234,567 in Excel (Excel uses system locale for , vs .)
const RUPIAH_FMT = '"Rp "#,##0'

// Apply at column level (before adding rows):
ws.getColumn('grandTotal').numFmt = RUPIAH_FMT

// Or at column definition time:
ws.columns = [
  { header: 'Grand Total', key: 'grandTotal', width: 16, style: { numFmt: RUPIAH_FMT } }
]
```

### Auto-Width (verified pattern)
```typescript
// Source: https://gist.github.com/ShinChven/16265da683ff397471a2fe8a6f48d7b0
export function autoWidth(worksheet: ExcelJS.Worksheet, minimalWidth = 10): void {
  worksheet.columns.forEach((column) => {
    let maxLength = 0
    if (column && typeof column.eachCell === 'function') {
      column.eachCell({ includeEmpty: true }, (cell) => {
        maxLength = Math.max(maxLength, minimalWidth, cell.value ? cell.value.toString().length : 0)
      })
      column.width = maxLength + 2
    }
  })
}
```

### Client Download Trigger (fetch → blob → anchor click)
```typescript
// Standard browser download trigger — no library needed
const blob = await res.blob()
const url = URL.createObjectURL(blob)
const a = document.createElement('a')
a.href = url
a.download = filename
document.body.appendChild(a)
a.click()
a.remove()
URL.revokeObjectURL(url)
```

### Indonesian Month Name Lookup
```typescript
const BULAN_ID: Record<number, string> = {
  1: 'Januari', 2: 'Februari', 3: 'Maret', 4: 'April',
  5: 'Mei', 6: 'Juni', 7: 'Juli', 8: 'Agustus',
  9: 'September', 10: 'Oktober', 11: 'November', 12: 'Desember',
}
// e.g. "Maret-2026"
const periodLabel = `${BULAN_ID[month]}-${year}`
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| SheetJS for export | ExcelJS for export | ExcelJS has richer styling API (fill, font, border, numFmt per cell) — SheetJS styling requires premium version |
| Stream-based writeFile | `writeBuffer()` → Response | writeBuffer() is the correct pattern for serverless/Edge-style API routes with no filesystem access |
| `application/vnd.ms-excel` | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` | Correct OOXML MIME type for .xlsx files |

**Note on xlsx package:** The `xlsx` package in package.json (v0.18.5) is SheetJS Community Edition — used for import parsing (upload flow). Do NOT use it for export. ExcelJS is the separate library for export generation.

---

## Open Questions

1. **Row counts for preview panel**
   - What we know: Preview needs `{ sheetKey: rowCount }` before download
   - What's unclear: Whether to implement a separate `GET /api/export/preview` or derive counts from the existing API data already fetched by ExportClient
   - Recommendation: Since ExportClient already needs periodId to show a period-aware page, do a lightweight count fetch on period selection. A GET `/api/export/preview?periodId=X` that runs `prisma.sale.count()`, `prisma.productSnapshot.count()` is the cleanest approach.

2. **Empty sheet behavior (Claude's Discretion)**
   - What we know: Filters may produce 0 rows for a sheet
   - Recommendation: Include empty sheet with header row only (do not skip). Users selected it intentionally; empty sheet with header is more informative than silent omission and avoids confusing "missing sheet" questions.

3. **Loading state during server generation**
   - Recommendation: Simple button state change to "Generating..." + disabled state while fetch is in progress. No skeleton or spinner needed — generation is fast (<1s for this data volume).

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest ^4.1.0 |
| Config file | `manta-finance/vitest.config.ts` (exists) |
| Quick run command | `npx vitest run lib/export` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| EXPT-01 | buildWorkbook only includes selected sheets | unit | `npx vitest run lib/export/buildWorkbook.test.ts -t "only selected sheets"` | Wave 0 |
| EXPT-02 | Filters applied per-sheet (date range to Transaksi only, not Stock) | unit | `npx vitest run lib/export/buildWorkbook.test.ts -t "filter mapping"` | Wave 0 |
| EXPT-03 | Header row has fill/font, data cells have numFmt, totals row exists | unit | `npx vitest run lib/export/buildWorkbook.test.ts -t "formatting"` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run lib/export`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `manta-finance/lib/export/buildWorkbook.test.ts` — covers EXPT-01, EXPT-02, EXPT-03
- [ ] ExcelJS install: `npm install exceljs` in `manta-finance/` — required before any test can import it

---

## Sources

### Primary (HIGH confidence)
- [ExcelJS GitHub README](https://github.com/exceljs/exceljs) — workbook/worksheet API, styling, writeBuffer, numFmt patterns
- ExcelJS NPM page — version confirmed as ^4.x current stable

### Secondary (MEDIUM confidence)
- [ShinChven autoWidth gist](https://gist.github.com/ShinChven/16265da683ff397471a2fe8a6f48d7b0) — auto-width utility, verified against ExcelJS column API
- [Dave Gray: Next.js XLSX download](https://www.davegray.codes/posts/how-to-download-xlsx-files-from-a-nextjs-route-handler) — confirmed `new Response(buffer, { headers })` pattern for App Router
- [ExcelJS/exceljs Discussion #2396](https://github.com/exceljs/exceljs/discussions/2396) — client-side fetch → blob → download anchor pattern

### Tertiary (LOW confidence — cross-verified with above)
- Built In guide to ExcelJS — general API overview, consistent with official README

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — ExcelJS is locked in PROJECT.md; patterns verified from official README and working gists
- Architecture: HIGH — follows identical patterns to Phases 3–5 (server component auth + Client component UI + API route); only new element is binary response
- ExcelJS formatting API: HIGH — verified from official README and multiple code examples
- Pitfalls: HIGH — all pitfalls derived from real API constraints (column definition order, filter scoping) or from existing project patterns (nav inline, ExcelJS not yet installed)

**Research date:** 2026-03-19
**Valid until:** 2026-04-19 (ExcelJS is stable; Next.js 14 App Router binary response pattern is stable)
