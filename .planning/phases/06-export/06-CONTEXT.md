# Phase 6: Export - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Generate a formatted multi-sheet Excel file from selected financial data with applied filters. Includes a dedicated /export page where the user configures which sheets to include and what filters to apply, then triggers a direct file download. Creating or editing data is out of scope — read-only export only.

</domain>

<decisions>
## Implementation Decisions

### Export UI entry point
- New dedicated `/export` page — not embedded in existing pages
- Added as 7th link in the main navigation bar (alongside Dashboard, Import Data, Stock, Penjualan, Finance, Piutang)
- Two-column layout: left column for configuration (period + sheet selection + filters), right column for preview summary (selected sheets + row counts)
- Export button triggers direct browser file download — no email, no cloud storage
- File named like `Manta-Racing-Export-Maret-2026.xlsx`

### Sheet selection UX
- Simple checklist (checkboxes) listing all 7 available sheets:
  - Laporan Keuangan (P&L)
  - Transaksi
  - Detail Item
  - Piutang
  - Stock
  - Margin Produk
  - Margin Konsumen
- All sheets selected by default when user opens the page
- Right-side preview panel shows estimated row count per selected sheet (requires a quick count query per sheet)

### Filter approach
- Filters live on the left config panel, below sheet selection
- Available filters: Period (bulan/tahun — required), Date range within period, Customer/konsumen, Category/kategori produk, Payment status (all/unpaid/paid)
- Filters apply to relevant sheets only — not uniformly to all sheets:
  - Date range → Transaksi, Detail Item
  - Customer → Transaksi, Detail Item, Piutang
  - Category → Stock, Margin Produk
  - Payment status → Transaksi, Piutang

### Excel formatting
- ExcelJS is locked (from PROJECT.md)
- Rupiah number formatting, auto-width columns, colored header rows, sub-totals/grand totals per EXPT-03
- Claude's Discretion: specific header color, font size, exact color codes, branding text placement

### Claude's Discretion
- Exact header row color and styling
- Sheet tab colors in the Excel file
- How to handle empty sheets when filters produce 0 rows (include empty sheet with header, or skip?)
- Loading state while server generates the Excel file

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `app/dashboard/_components/LogoutButton.tsx`: Reuse in export page header (same pattern as all other pages)
- `app/finance/page.tsx`: Pattern for server auth check + client component — follow same pattern for /export page
- `app/api/finance/route.ts`: Exports FinanceSummary, ProductMarginRow, CustomerDiscountRow types — reuse for export data fetching
- `app/api/receivables/route.ts`: CustomerRow data — reuse for Piutang sheet
- `app/api/sales/route.ts`: SaleRow data — reuse for Transaksi + Detail Item sheets
- `app/api/stock/route.ts`: Stock data — reuse for Stock sheet

### Established Patterns
- Auth pattern: `cookieStore.get('manta_session')?.value` → `validateSession(token)` → `redirect('/login')` if invalid
- Client component pattern: page.tsx is server component for auth only, delegates to XxxClient.tsx for all UI
- Nav pattern: 6 links currently, all inline in page.tsx — 7th link added to every page's nav
- Period selector: reused across dashboard, finance, receivables pages — reuse for export page

### Integration Points
- Navigation: All 6 existing pages have inline nav — need to add Export link to all of them
- New API route: `app/api/export/route.ts` — POST endpoint that accepts config (period, sheets, filters), returns Excel file as binary response
- ExcelJS: already decided in PROJECT.md, likely needs install if not already present

</code_context>

<specifics>
## Specific Ideas

- File download should trigger immediately on button click — no intermediate step
- Preview row counts give user confidence before downloading

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope

</deferred>

---

*Phase: 06-export*
*Context gathered: 2026-03-19*
