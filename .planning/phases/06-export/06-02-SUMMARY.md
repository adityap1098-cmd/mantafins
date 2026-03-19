---
phase: 06-export
plan: 02
subsystem: api
tags: [exceljs, xlsx, export, binary-response, prisma, nextjs]

requires:
  - phase: 06-export-01
    provides: buildWorkbook(ExportConfig, ExportData), ExportConfig, ExportData, 7 sheet builder types

provides:
  - POST /api/export — fetches all data, builds workbook, returns binary xlsx with correct MIME/Content-Disposition
  - GET /api/export/preview — returns JSON row counts per sheet for a given periodId

affects: [06-03-export-page]

tech-stack:
  added: []
  patterns:
    - Binary response via new Response(buffer, headers) — NOT NextResponse.json() which corrupts buffer
    - Data assembly in API route maps Prisma results to exact sheet builder type shapes
    - Parallel data fetching with Promise.all for sales, opCosts, productSnapshots

key-files:
  created:
    - manta-finance/app/api/export/route.ts
    - manta-finance/app/api/export/preview/route.ts

key-decisions:
  - "Binary route uses new Response(buffer) not NextResponse — NextResponse.json() would corrupt the buffer"
  - "FinanceSummary for laporanKeuangan sheet uses netProfit field (= labaBersih) not labaBersih — matched sheet builder type"
  - "CustomerRow for piutang sheet uses totalTransactions/totalGrandTotal — computed inline from sales, not reused from /api/receivables"
  - "ProductMarginRow for marginProduk sheet needs category/hargaJual from ProductSnapshot — looked up via snapshotBySku map"
  - "marginProduk count equals stockCount (productSnapshot count) — same product set"

patterns-established:
  - "Export data mapping: compute all 6 data shapes inline from prisma.sale + opCosts + productSnapshot queries"
  - "Preview route: 4 parallel counts yielding 7 sheet row count estimates"

requirements-completed: [EXPT-01, EXPT-02, EXPT-03]

duration: 3min
completed: 2026-03-19
---

# Phase 6 Plan 2: Export API Routes Summary

**POST /api/export assembles all 6 data shapes and streams binary xlsx; GET /api/export/preview returns row counts for 7 sheets in a single parallel query**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-19T04:35:55Z
- **Completed:** 2026-03-19T04:38:30Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- POST /api/export: fetches sales+opCosts+snapshots in parallel, maps to ExportData, calls buildWorkbook(), returns binary with correct MIME/Content-Disposition headers
- GET /api/export/preview: 4 parallel Prisma counts returning all 7 sheet row estimates in one response
- TypeScript passes with zero errors across both new files
- All 18 pre-existing buildWorkbook Vitest tests remain green

## Task Commits

1. **Task 1: POST /api/export route** - `008b213` (feat)
2. **Task 2: GET /api/export/preview route** - `02e457f` (feat)

## Files Created/Modified

- `manta-finance/app/api/export/route.ts` - POST endpoint: auth, 400 validation, parallel fetch, ExportData assembly, buildWorkbook call, binary Response
- `manta-finance/app/api/export/preview/route.ts` - GET endpoint: auth, 400 validation, 4 parallel counts, JSON with 7 sheet keys

## Decisions Made

- `new Response(buffer)` used for binary route — `NextResponse` would wrap the buffer in JSON and corrupt it
- `FinanceSummary` shape for `laporanKeuangan` sheet uses `netProfit` (not `labaBersih`) — matched the existing sheet builder interface from Plan 01
- `CustomerRow` for piutang sheet (`totalTransactions`, `totalGrandTotal`) computed inline from sale aggregation rather than reusing `/api/receivables` field names
- `ProductMarginRow` for marginProduk requires `category`, `hargaJual`, `avgTransactionPrice`, `totalQtySold` — resolved by joining sale items against productSnapshot map

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Matched FinanceSummary type to laporanKeuangan sheet builder**
- **Found during:** Task 1 (TypeScript verification)
- **Issue:** Plan described building summary as `{ labaBersih, totalBiayaOperasional, marginKotor, marginBersih, operationalCosts }` but the sheet builder `FinanceSummary` interface only accepts `{ totalPendapatan, totalHpp, labaKotor, totalDiskon, totalPiutang, totalTerbayar, netProfit }`
- **Fix:** Mapped `labaBersih` to `netProfit`, dropped unneeded fields not consumed by sheet builder
- **Files modified:** manta-finance/app/api/export/route.ts
- **Verification:** `npx tsc --noEmit` reported zero errors
- **Committed in:** `008b213` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - type mismatch corrected inline)
**Impact on plan:** Required — plan described the intent correctly but the concrete type had a different field name established in Plan 01. Auto-fix aligned implementation to existing contract.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Both API routes are ready to serve `ExportClient` (Plan 03)
- POST /api/export returns correct Content-Disposition so browser will trigger file download directly
- GET /api/export/preview returns all 7 sheet keys ExportClient needs for the row count preview panel

## Self-Check: PASSED

- manta-finance/app/api/export/route.ts: FOUND
- manta-finance/app/api/export/preview/route.ts: FOUND
- .planning/phases/06-export/06-02-SUMMARY.md: FOUND
- Commit 008b213: FOUND
- Commit 02e457f: FOUND

---
*Phase: 06-export*
*Completed: 2026-03-19*
