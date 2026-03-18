---
phase: 04-stock-sales-views
plan: "01"
subsystem: api
tags: [nextjs, prisma, sqlite, stock, inventory, margin]

# Dependency graph
requires:
  - phase: 01-foundation-and-auth
    provides: validateSession, SESSION_COOKIE_NAME, lib/auth.ts
  - phase: 02-import-and-calculations
    provides: ProductSnapshot model with periodId_sku composite key
provides:
  - GET /api/stock?periodId=X returning StockRow[] with margin metrics and InventorySummary
  - PATCH /api/stock/[sku]?periodId=X for inline stock quantity updates
  - StockRow and InventorySummary TypeScript types exported for Plan 02 UI
affects: [04-02-stock-ui, any phase consuming stock data]

# Tech tracking
tech-stack:
  added: [vitest (test infrastructure), vitest.config.ts]
  patterns: [TDD red-green for API routes, margin computed at read time from stored hpp/hargaJual]

key-files:
  created:
    - manta-finance/app/api/stock/route.ts
    - manta-finance/app/api/stock/[sku]/route.ts
    - manta-finance/__tests__/api/stock.test.ts
    - manta-finance/vitest.config.ts
  modified: []

key-decisions:
  - "marginPersen uses hargaJual as denominator: ((hargaJual - hpp) / hargaJual) * 100 — consistent with retail margin convention"
  - "toStockRow() helper duplicated in [sku]/route.ts (not imported from parent) to keep each route file self-contained"
  - "Prisma P2025 error code used to detect not-found on PATCH — returns 404 with { error: 'Product not found' }"

patterns-established:
  - "StockRow margin: computed at query time from stored hpp/hargaJual, not stored separately"
  - "API routes import StockRow type from GET route file — single canonical source for Plan 02 UI"

requirements-completed: [STOK-01, STOK-06]

# Metrics
duration: 7min
completed: 2026-03-19
---

# Phase 4 Plan 01: Stock API Routes Summary

**Session-protected GET /api/stock and PATCH /api/stock/[sku] routes with computed margin metrics (marginUnit, marginPersen) and inventory value aggregation (totalHppValue, totalHargaJualValue, potentialProfit)**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-18T22:53:57Z
- **Completed:** 2026-03-18T23:00:57Z
- **Tasks:** 2 (Task 1 via TDD: test + impl commits; Task 2 direct impl)
- **Files modified:** 4 created, 0 modified

## Accomplishments
- GET /api/stock?periodId=X returns StockRow[] with computed marginUnit and marginPersen plus InventorySummary aggregate
- PATCH /api/stock/[sku]?periodId=X accepts { stock: N } and returns updated StockRow with recomputed margins
- Both routes return 401 without valid session, 400 for missing required params
- StockRow and InventorySummary types exported for Plan 02 stock UI consumption
- Vitest config established with 4 passing unit tests covering auth, validation, and computation

## Task Commits

Each task was committed atomically:

1. **TDD RED: GET /api/stock test** - `0c96735` (test)
2. **Task 1: GET /api/stock implementation** - `82edfe7` (feat)
3. **Task 2: PATCH /api/stock/[sku] implementation** - `8478362` (feat)

## Files Created/Modified
- `manta-finance/app/api/stock/route.ts` - GET handler: queries ProductSnapshot by periodId, maps to StockRow with margins, aggregates InventorySummary; exports StockRow and InventorySummary types
- `manta-finance/app/api/stock/[sku]/route.ts` - PATCH handler: validates stock integer, updates via periodId_sku composite key, returns updated StockRow; handles P2025 as 404
- `manta-finance/__tests__/api/stock.test.ts` - 4 Vitest unit tests covering 401/400/200 cases and margin math
- `manta-finance/vitest.config.ts` - Vitest config with @/ alias and node environment

## Decisions Made
- marginPersen formula: `(hargaJual - hpp) / hargaJual * 100` — retail margin convention (not markup)
- toStockRow() helper is duplicated in the [sku] route rather than importing from parent to keep files self-contained
- Prisma error code P2025 caught to return 404 on not-found PATCH

## Deviations from Plan

None - plan executed exactly as written. Vitest config added as first-time TDD infrastructure (expected for first TDD plan).

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- GET /api/stock and PATCH /api/stock/[sku] ready for Plan 02 stock UI to consume
- StockRow and InventorySummary types exportable via @/app/api/stock/route
- All TypeScript types verified clean (tsc --noEmit passes)

## Self-Check: PASSED

- [x] manta-finance/app/api/stock/route.ts — FOUND
- [x] manta-finance/app/api/stock/[sku]/route.ts — FOUND
- [x] .planning/phases/04-stock-sales-views/04-01-SUMMARY.md — FOUND
- [x] commit 0c96735 (test) — FOUND
- [x] commit 82edfe7 (feat GET route) — FOUND
- [x] commit 8478362 (feat PATCH route) — FOUND

---
*Phase: 04-stock-sales-views*
*Completed: 2026-03-19*
