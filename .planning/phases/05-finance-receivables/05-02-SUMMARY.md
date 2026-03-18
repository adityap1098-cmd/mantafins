---
phase: 05-finance-receivables
plan: "02"
subsystem: api
tags: [nextjs, prisma, sqlite, finance, aggregation]

requires:
  - phase: 05-01
    provides: OperationalCost Prisma model and schema migration

provides:
  - "GET /api/finance aggregates P&L summary, product margin table, and customer discount table"
  - "POST /api/finance/costs creates operational cost records for a period"
  - "DELETE /api/finance/costs removes an operational cost record by id"

affects: [05-04-finance-page, 05-05, 05-06]

tech-stack:
  added: []
  patterns:
    - "Server-side aggregation: all grouping/summing done in route handler, client receives flat arrays"
    - "Prisma P2025 error code pattern for not-found detection in DELETE handlers"

key-files:
  created:
    - manta-finance/app/api/finance/route.ts
    - manta-finance/app/api/finance/costs/route.ts
  modified: []

key-decisions:
  - "FinanceSummary totalDiskon computed as sum of (grossRevenue per sale - grandTotal) — consistent with import calculator approach"
  - "ProductMarginRow groups by productName (not SKU) — matches plan spec; hppUnit from first found item per product"
  - "CustomerDiscountRow avgDiskonPersen uses (totalDiskon / (totalPenjualan + totalDiskon)) * 100 — denominator is gross revenue base"
  - "Pre-existing TSC errors in receivables/route.ts (Map iteration TS2802) deferred to 05-06 verification sweep"

patterns-established:
  - "Finance aggregation: fetch sales+items and operationalCosts in parallel with Promise.all, then compute in JS"
  - "Operational cost CRUD: POST validates body fields, DELETE uses Prisma P2025 for 404 detection"

requirements-completed: [FIN-01, FIN-02, FIN-04, FIN-05]

duration: 5min
completed: 2026-03-19
---

# Phase 5 Plan 02: Finance API Routes Summary

**Server-side P&L aggregation API with product margin table, customer discount table, and operational cost CRUD via two Next.js route handlers**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-18T23:25:22Z
- **Completed:** 2026-03-18T23:30:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Built `GET /api/finance` that computes full P&L summary (8 metrics), product margin rows grouped by product, and customer discount rows grouped by customer — all in a single request
- Built `POST /api/finance/costs` with input validation (periodId, non-empty description, positive amount) returning 201 with created record
- Built `DELETE /api/finance/costs?id=X` with P2025 not-found handling returning 404 gracefully

## Task Commits

1. **Task 1: Create GET /api/finance route** - `4fed725` (feat)
2. **Task 2: Create POST/DELETE /api/finance/costs route** - `3e15675` (feat)

## Files Created/Modified

- `manta-finance/app/api/finance/route.ts` - GET handler: aggregates P&L summary, ProductMarginRow[], CustomerDiscountRow[] from Sales+SaleItems+OperationalCosts
- `manta-finance/app/api/finance/costs/route.ts` - POST creates OperationalCost record; DELETE removes by id with P2025 404 handling

## Decisions Made

- `totalDiskon` in FinanceSummary computed as sum of (gross revenue per sale - grandTotal) — same approach as margin calculator
- ProductMarginRow uses first found `hppUnit` per product name (snapshot-consistent per period)
- CustomerDiscountRow `avgDiskonPersen` denominator is gross revenue base (penjualan + diskon) per plan spec
- Pre-existing TypeScript errors in `receivables/route.ts` (Map iteration TS2802, implicit any) are out of scope — deferred to 05-06

## Deviations from Plan

None - plan executed exactly as written.

Pre-existing TSC errors discovered in `receivables/route.ts` (from plan 05-01) are logged in `deferred-items.md` and will be addressed in the 05-06 verification sweep.

## Issues Encountered

- `npx tsc --noEmit` reported 4 errors, all in `app/api/receivables/route.ts` (created in 05-01, not 05-02). Errors are Map iteration TS2802 and implicit `any` on callback parameters. Neither new route file has errors. Deferred to 05-06.

## Next Phase Readiness

- Finance data API is complete and queryable
- Plan 05-04 (Finance page) can call `GET /api/finance?periodId=X`, `POST /api/finance/costs`, and `DELETE /api/finance/costs?id=X` without additional backend work
- The pre-existing receivables/route.ts TSC errors should be fixed before final phase verification

---
*Phase: 05-finance-receivables*
*Completed: 2026-03-19*
