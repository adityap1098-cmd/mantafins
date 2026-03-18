---
phase: 05-finance-receivables
plan: "03"
subsystem: api
tags: [prisma, nextjs, receivables, payments, sqlite]

requires:
  - phase: 05-01
    provides: OperationalCost model and Phase 5 schema foundation
  - phase: 02-import-and-calculations
    provides: Sale, SaleItem, PaymentLog models and computeTransactionMetrics
provides:
  - GET /api/receivables — per-customer receivables summary with totalTagihan/totalTerbayar/totalPiutang/avgDiskonPersen
  - POST /api/receivables/payment — atomic payment recording updating Sale.paid/balance/status + PaymentLog creation
  - GET /api/receivables/customer — per-customer purchase history returning SaleRow[]
affects: [05-05-receivables-page, 05-finance-receivables]

tech-stack:
  added: []
  patterns:
    - Map.entries() iterated via Array.from() for ES target compatibility
    - Prisma $transaction for atomic multi-model updates
    - Immutable value computation before passing to prisma.update

key-files:
  created:
    - manta-finance/app/api/receivables/route.ts
    - manta-finance/app/api/receivables/customer/route.ts
    - manta-finance/app/api/receivables/payment/route.ts
  modified: []

key-decisions:
  - "Map iteration uses Array.from(customerMap.entries()) instead of for...of — TypeScript target doesn't support downlevelIteration"
  - "avgDiskonPersen computed as (sumDiscounts/sumGrossRevenue)*100 across all customer sales — consistent with per-transaction diskon formula"
  - "Payment route validates amount > balance before transaction — prevents overpayment at application layer"

patterns-established:
  - "Receivables grouping: collect sales, build Map, Array.from(entries()), accumulate totals, push to result array"
  - "Atomic payment: fetch sale, validate, compute new values immutably, prisma.$transaction([update, create])"

requirements-completed: [FIN-03, PIUT-01, PIUT-02, PIUT-03, PIUT-04]

duration: 2min
completed: 2026-03-19
---

# Phase 5 Plan 03: Receivables API Routes Summary

**Three receivables API routes: per-customer summary, payment recording with atomic Sale+PaymentLog update, and customer purchase history**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-03-18T23:25:39Z
- **Completed:** 2026-03-18T23:27:41Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- GET /api/receivables groups sales by customer and computes totalTagihan, totalTerbayar, totalPiutang, avgDiskonPersen sorted by outstanding balance
- POST /api/receivables/payment atomically updates Sale.paid/balance/status and creates PaymentLog in a single Prisma transaction
- GET /api/receivables/customer returns full SaleRow[] purchase history (reusing computeTransactionMetrics and SaleRow type from sales route)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create GET /api/receivables and GET /api/receivables/customer routes** - `a688bb8` (feat)
2. **Task 2: Create POST /api/receivables/payment route** - `df5f53d` (feat)

## Files Created/Modified
- `manta-finance/app/api/receivables/route.ts` - Per-customer receivables summary GET route
- `manta-finance/app/api/receivables/customer/route.ts` - Customer purchase history GET route
- `manta-finance/app/api/receivables/payment/route.ts` - Payment recording POST route with atomic transaction

## Decisions Made
- Map iteration uses `Array.from(customerMap.entries())` instead of `for...of` on Map — TypeScript target configuration does not support downlevelIteration, causing TS2802 error
- avgDiskonPersen computed as sumDiscounts/sumGrossRevenue across all customer sales, consistent with per-transaction diskon = grossRevenue - grandTotal formula used elsewhere
- Payment validation checks amount > sale.balance before entering transaction to return clear 400 error without unnecessary DB write

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Map iteration TS2802 error and implicit any types**
- **Found during:** Task 1 (GET /api/receivables route)
- **Issue:** `for...of` on `Map.entries()` fails with TS2802 in project's TypeScript target; lambda parameters in `customerMap` callbacks had implicit `any`
- **Fix:** Changed to `Array.from(customerMap.entries())` with explicit `SaleWithItems` type alias for the mapped sale; added explicit `sum: number` on reduce
- **Files modified:** manta-finance/app/api/receivables/route.ts
- **Verification:** `npx tsc --noEmit` passes with no errors
- **Committed in:** a688bb8 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - Bug)
**Impact on plan:** Necessary TypeScript compatibility fix, no functional scope change.

## Issues Encountered
None beyond the Map iteration TypeScript compatibility fix handled above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All three receivables routes are ready for consumption by Plan 05-05 (Receivables page)
- POST /api/receivables/payment tested to compile cleanly with proper 404/400/201 response shapes
- No blockers

---
*Phase: 05-finance-receivables*
*Completed: 2026-03-19*
