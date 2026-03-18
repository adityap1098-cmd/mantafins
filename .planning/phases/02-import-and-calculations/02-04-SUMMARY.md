---
phase: 02-import-and-calculations
plan: 04
subsystem: api
tags: [nextjs, prisma, sqlite, excel, upload, periods]

# Dependency graph
requires:
  - phase: 02-import-and-calculations plan 01
    provides: Prisma schema — Period, ProductSnapshot, Sale, SaleItem models
  - phase: 02-import-and-calculations plan 02
    provides: parseProducts() from lib/parser/products.ts
  - phase: 02-import-and-calculations plan 03
    provides: parseSales(), computeTransactionMetrics() from lib/parser/sales.ts and lib/calculator/margin.ts
  - phase: 01-foundation-and-auth
    provides: validateSession(), SESSION_COOKIE_NAME from lib/auth.ts, prisma client from lib/prisma.ts
provides:
  - GET /api/periods — returns all periods ordered by year/month desc
  - POST /api/periods — creates a period, returns {period} 201
  - POST /api/upload/products?periodId=X — parses Excel, saves ProductSnapshot rows, returns {count}
  - POST /api/upload/sales?periodId=X — matches products case-insensitively, saves Sale+SaleItem, returns {count, warnings}
affects: [03-dashboard-ui, 04-reports]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Auth check pattern: extract token from SESSION_COOKIE_NAME cookie, call validateSession(token), return 401 if not valid
    - Re-import pattern: deleteMany for periodId before createMany — enables idempotent re-uploads
    - Product matching: case-insensitive trimmed name lookup via Map, unmatched → hppUnit=0 + warning
    - Metrics computed on upload but NOT stored in Sale table — derived from SaleItems on read in Phase 3

key-files:
  created:
    - manta-finance/app/api/periods/route.ts
    - manta-finance/app/api/upload/products/route.ts
    - manta-finance/app/api/upload/sales/route.ts
  modified: []

key-decisions:
  - "Auth pattern in routes: extract cookie token via req.cookies.get(SESSION_COOKIE_NAME)?.value, pass to validateSession(token: string) — matching Phase 1 check route pattern"
  - "computeTransactionMetrics() called during sales upload but result not stored in Sale row — HPP/margin derived from SaleItems at query time (avoids data duplication)"
  - "Re-import supported by deleteMany before createMany — no upsert needed since period data is treated as a complete batch"

patterns-established:
  - "Route auth: cookie extraction + validateSession(token) — identical pattern to app/api/auth/check/route.ts"
  - "Upload routes: formData() for multipart, arrayBuffer() → Buffer.from() for parser compatibility"
  - "Array.from(new Set()) for deduplication — avoids Set spread issue with tsconfig lacking explicit target"

requirements-completed: [IMP-01, IMP-02, IMP-03, IMP-04, IMP-05, IMP-06, CALC-01, CALC-02, CALC-03, CALC-04]

# Metrics
duration: 1min
completed: 2026-03-19
---

# Phase 2 Plan 04: API Routes Summary

**Four backend endpoints wiring parsers, product matching, and DB persistence — periods CRUD plus Excel upload for products and sales with HPP calculation**

## Performance

- **Duration:** ~1 min
- **Started:** 2026-03-18T22:06:36Z
- **Completed:** 2026-03-18T22:08:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- GET/POST /api/periods with session auth and ordered results
- POST /api/upload/products: Excel parse → delete old snapshots → bulk insert ProductSnapshot rows
- POST /api/upload/sales: Excel parse → case-insensitive product matching → Sale+SaleItem persistence → deduplicated warnings for unmatched product names
- All 4 endpoints return 401 when session cookie absent or invalid

## Task Commits

Each task was committed atomically:

1. **Task 1: Create periods API route** - `762979c` (feat)
2. **Task 2: Create products and sales upload API routes** - `1f32c15` (feat)

**Plan metadata:** _(to be added in final commit)_

## Files Created/Modified
- `manta-finance/app/api/periods/route.ts` - GET (list periods) + POST (create period) with session auth
- `manta-finance/app/api/upload/products/route.ts` - POST handler: parse Excel, deleteMany+createMany ProductSnapshot
- `manta-finance/app/api/upload/sales/route.ts` - POST handler: parse Excel, match products by name, create Sale+SaleItem rows, return warnings

## Decisions Made
- Adapted `validateSession` call to match Phase 1 signature: `validateSession(token: string)` not `validateSession(request: NextRequest)` — token extracted from cookie in route handler
- `computeTransactionMetrics()` invoked but result discarded — metrics will be derived from SaleItems at read time in Phase 3/4 to avoid duplication

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Set spread TypeScript error**
- **Found during:** Task 2 (sales upload route)
- **Issue:** `[...new Set(warnings)]` caused TS2802 — Set can only be iterated with `--downlevelIteration` or ES2015+ target; tsconfig lacks explicit `target` field
- **Fix:** Replaced with `Array.from(new Set(warnings))` which compiles without the target constraint
- **Files modified:** manta-finance/app/api/upload/sales/route.ts
- **Verification:** `npx tsc --noEmit` passes with no errors
- **Committed in:** `1f32c15` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Minor compatibility fix, no behavior change.

## Issues Encountered
- Plan template used `validateSession(request: NextRequest)` but actual lib/auth.ts signature is `validateSession(token: string)` — adapted routes to match established Phase 1 pattern (cookie extraction before calling validateSession)

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 4 upload/period API endpoints live and TypeScript-clean
- Sales upload orchestrates parsers + calculator + DB — core of Phase 2 complete
- Phase 3 can query Sale+SaleItem rows to compute and display dashboard metrics
- No blockers

---
*Phase: 02-import-and-calculations*
*Completed: 2026-03-19*
