---
phase: 06-export
plan: "03"
subsystem: export-ui
tags: [export, ui, next-js, client-component, nav]
dependency_graph:
  requires: [06-02]
  provides: [export-page-ui, 7-link-nav]
  affects: [dashboard, import, stock, sales, finance, receivables]
tech_stack:
  added: []
  patterns: [server-component-auth, use-client-state, blob-download, useEffect-fetch]
key_files:
  created:
    - manta-finance/app/export/page.tsx
    - manta-finance/app/export/_components/ExportClient.tsx
  modified:
    - manta-finance/app/dashboard/page.tsx
    - manta-finance/app/import/page.tsx
    - manta-finance/app/stock/page.tsx
    - manta-finance/app/sales/page.tsx
    - manta-finance/app/finance/page.tsx
    - manta-finance/app/receivables/page.tsx
decisions:
  - ExportClient uses useEffect on selectedPeriodId change to fetch /api/export/preview for row counts
  - periodLabel derived by replacing spaces with dashes in period.name (e.g. "Maret 2026" -> "Maret-2026")
  - Export button disabled when loading, no periodId, or no sheets selected
  - lg:col-span-3 left / lg:col-span-2 right grid layout for config/preview panels
metrics:
  duration: ~5 min
  completed_date: "2026-03-19"
  tasks_completed: 2
  files_modified: 8
requirements_satisfied: [EXPT-01, EXPT-02, EXPT-03]
---

# Phase 6 Plan 3: Export UI Summary

**One-liner:** Two-column /export page with sheet checklist, filter controls, preview row counts via /api/export/preview, and blob download — plus Export as 7th nav link across all 7 pages.

## Tasks Completed

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 1 | /export page.tsx + ExportClient.tsx | 66a33a4 | app/export/page.tsx, app/export/_components/ExportClient.tsx |
| 2 | Add Export nav link to 6 existing pages | 4ec8f4b | dashboard, import, stock, sales, finance, receivables page.tsx |

## What Was Built

### /export page (page.tsx)
- Server component with auth guard (cookies -> validateSession -> redirect)
- Fetches periods via prisma.period.findMany({ orderBy: { createdAt: 'desc' } })
- Renders header, 7-link nav with Export as active (blue underline), ExportClient

### ExportClient.tsx
- Two-column layout: lg:col-span-3 config / lg:col-span-2 preview
- Period selector dropdown from periods prop
- 7-sheet checklist (laporanKeuangan, transaksi, detailItem, piutang, stock, marginProduk, marginKonsumen), all checked by default
- 5 filter controls: dateFrom, dateTo, customer, category, paymentStatus (All/Paid/Unpaid)
- useEffect on selectedPeriodId: fetches GET /api/export/preview?periodId= and updates previewCounts
- Preview panel shows selected sheets with row count (or "-" if not yet loaded), total sheet count
- Export button: "Export Excel" idle / "Generating..." while loading, disabled when loading or no period/sheets
- handleExport: POST /api/export with ExportConfig JSON, blob() -> createObjectURL -> anchor click -> revokeObjectURL
- Error display in red below Export button

### Nav link updates
All 6 existing pages (dashboard, import, stock, sales, finance, receivables) have Export as 7th nav link after Piutang, styled consistently with non-active links.

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

- TypeScript: no type errors (npx tsc --noEmit clean)
- Nav link coverage: all 6 pages confirmed with grep (count = 6)
- Full build: npm run build passes, /export route present as Dynamic (ƒ) at 2.29 kB

## Self-Check: PASSED

Files confirmed:
- manta-finance/app/export/page.tsx: FOUND
- manta-finance/app/export/_components/ExportClient.tsx: FOUND

Commits confirmed:
- 66a33a4: feat(06-03): add /export page with ExportClient two-column layout
- 4ec8f4b: feat(06-03): add Export as 7th nav link to all 6 existing pages
