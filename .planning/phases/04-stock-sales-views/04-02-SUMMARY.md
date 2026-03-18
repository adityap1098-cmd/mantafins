---
phase: 04-stock-sales-views
plan: "02"
subsystem: ui
tags: [nextjs, react, stock, inventory, inline-edit, filters, sort]

# Dependency graph
requires:
  - phase: 04-stock-sales-views
    plan: "01"
    provides: GET /api/stock, PATCH /api/stock/[sku], StockRow type, InventorySummary type
  - phase: 03-dashboard
    provides: PeriodSelector component
provides:
  - /stock page with sortable/filterable table, inline stock edit, and inventory summary bar
  - StockClient component managing period selection, data fetching, filter/sort state
  - StockFilters component with search, category, HPP range, and stock range inputs
  - InventorySummaryBar showing total HPP value, harga jual value, and potensi profit
  - StockTable with row alert colors and inline stock quantity editing
affects: [04-03-sales-ui, any page consuming /stock route]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Optimistic UI update: update rows array immutably before PATCH, revert on error"
    - "Inline edit cell: span → input on click, commit on blur/Enter, cancel on Escape"
    - "useMemo for filtered+sorted rows — all filter/sort logic in single derived value"

key-files:
  created:
    - manta-finance/app/stock/page.tsx
    - manta-finance/app/stock/_components/StockClient.tsx
    - manta-finance/app/stock/_components/StockFilters.tsx
    - manta-finance/app/stock/_components/InventorySummaryBar.tsx
    - manta-finance/app/stock/_components/StockTable.tsx
    - manta-finance/app/sales/_components/SalesTable.tsx
  modified:
    - manta-finance/app/dashboard/page.tsx

key-decisions:
  - "Optimistic stock edit recomputes InventorySummary client-side from updated rows — no refetch needed"
  - "SalesTable stub created as Rule 3 auto-fix to unblock build — SalesClient.tsx (from prior plan) imported non-existent SalesTable"
  - "StockCell as separate sub-component with its own editing state — cleaner than managing Set<string> in parent"

# Metrics
duration: 3min
completed: 2026-03-18
---

# Phase 4 Plan 02: Stock UI Page Summary

**Sortable, filterable /stock page with optimistic inline stock editing, row alert colors (red <10, yellow <50), and inventory summary bar (HPP value, harga jual value, potensi profit)**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-18T23:03:54Z
- **Completed:** 2026-03-18T23:06:54Z
- **Tasks:** 2 (both auto)
- **Files created:** 6, modified: 1

## Accomplishments

- /stock server page with auth guard mirrors dashboard pattern (cookies + validateSession + redirect)
- StockClient fetches /api/stock on period change, applies 6 filter types, sorts all columns
- Optimistic inline edit: stock span becomes input on click, PATCH fires, reverts on error
- Row alert colors: red bg for stock < 10, yellow for stock < 50
- Inventory summary bar shows 3 stat cards with IDR formatting via Intl.NumberFormat id-ID
- Dashboard nav updated with Stock and Penjualan links
- SalesTable stub created to unblock build (SalesClient from Plan 03 already imported it)

## Task Commits

1. **Task 1: Stock page shell, StockFilters, InventorySummaryBar, StockClient** - `9d73f71` (feat)
2. **Task 2: StockTable + SalesTable stub** - `9bf1105` (feat)

## Files Created/Modified

- `manta-finance/app/stock/page.tsx` — Server component: auth check, nav with /stock active, renders StockClient
- `manta-finance/app/stock/_components/StockClient.tsx` — Client: period selector, fetch, 6 filter states, sort state, optimistic PATCH handler
- `manta-finance/app/stock/_components/StockFilters.tsx` — Filter bar: search input, category select, HPP min/max, stock min/max
- `manta-finance/app/stock/_components/InventorySummaryBar.tsx` — 3 stat cards with IDR formatting; skeleton pulse on loading
- `manta-finance/app/stock/_components/StockTable.tsx` — Full table: sortable headers, row colors, StockCell inline edit sub-component
- `manta-finance/app/sales/_components/SalesTable.tsx` — Stub: satisfies SalesClient import until Plan 04-04 full implementation
- `manta-finance/app/dashboard/page.tsx` — Added Stock + Penjualan nav links

## Decisions Made

- Optimistic stock edit recomputes InventorySummary locally from updated rows (no API refetch)
- StockCell extracted as a sub-component to keep its `editing` boolean state local
- SalesTable stub created as Rule 3 auto-fix — build was blocked by pre-existing missing module

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Created SalesTable stub to unblock npm run build**
- **Found during:** Task 2 build verification
- **Issue:** `SalesClient.tsx` (committed in prior plan execution) imported `./SalesTable` which did not exist; Next.js build failed with webpack module-not-found error
- **Fix:** Created minimal `SalesTable.tsx` stub with correct prop types and basic table rendering
- **Files modified:** `manta-finance/app/sales/_components/SalesTable.tsx` (created)
- **Commit:** `9bf1105`

## Self-Check: PASSED

- [x] manta-finance/app/stock/page.tsx — FOUND
- [x] manta-finance/app/stock/_components/StockClient.tsx — FOUND
- [x] manta-finance/app/stock/_components/StockFilters.tsx — FOUND
- [x] manta-finance/app/stock/_components/InventorySummaryBar.tsx — FOUND
- [x] manta-finance/app/stock/_components/StockTable.tsx — FOUND
- [x] manta-finance/app/sales/_components/SalesTable.tsx — FOUND
- [x] commit 9d73f71 (Task 1) — FOUND
- [x] commit 9bf1105 (Task 2) — FOUND

---
*Phase: 04-stock-sales-views*
*Completed: 2026-03-19*
