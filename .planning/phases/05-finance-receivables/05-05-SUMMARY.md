---
phase: 05-finance-receivables
plan: "05"
subsystem: ui
tags: [next.js, react, receivables, payment, piutang]

# Dependency graph
requires:
  - phase: 05-finance-receivables
    provides: GET /api/receivables, POST /api/receivables/payment, GET /api/receivables/customer APIs
provides:
  - Receivables page at /receivables with customer-grouped expandable table
  - PaymentModal for inline payment recording with optimistic update
  - CustomerHistoryPanel for per-customer purchase history view
affects: [06-reporting]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Optimistic state update after payment POST — recomputes derived totals from updated sales array without refetch
    - Expandable customer rows using expandedCustomer string state toggled per customer key
    - Fixed modal overlay pattern (PaymentModal + CustomerHistoryPanel) with backdrop dismiss

key-files:
  created:
    - manta-finance/app/receivables/page.tsx
    - manta-finance/app/receivables/_components/ReceivablesClient.tsx
    - manta-finance/app/receivables/_components/ReceivablesTable.tsx
    - manta-finance/app/receivables/_components/PaymentModal.tsx
    - manta-finance/app/receivables/_components/CustomerHistoryPanel.tsx
  modified: []

key-decisions:
  - "Optimistic update after payment: recompute totalTerbayar/totalPiutang from updated sales array using reduce — no full refetch needed"
  - "Finance link added to nav on receivables page — nav now has 6 entries (Dashboard, Import Data, Stock, Penjualan, Finance, Piutang)"
  - "CustomerHistoryPanel fetches /api/receivables/customer which returns SaleRow[] with labaKotor and marginPersen — matches history table columns"

patterns-established:
  - "Modal overlay: fixed inset-0 z-50 with absolute backdrop div + relative z-10 card"
  - "Optimistic list update: prev.map finding target item, returning spread with new fields, then recomputing aggregates"

requirements-completed: [FIN-03, PIUT-01, PIUT-02, PIUT-03, PIUT-04]

# Metrics
duration: 10min
completed: 2026-03-19
---

# Phase 5 Plan 05: Receivables UI Summary

**Customer-grouped piutang table with expandable sale rows, inline PaymentModal with optimistic balance update, and CustomerHistoryPanel showing per-customer purchase history**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-03-18T23:33:44Z
- **Completed:** 2026-03-18T23:44:00Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Built /receivables page: server component with auth check, 6-link nav (added Finance + Piutang), renders ReceivablesClient
- ReceivablesClient orchestrates period selection, data fetch, expand/payment/history state; optimistically updates receivables state after payment POST
- ReceivablesTable groups sales by customer, expandable into per-sale rows with Catat Bayar buttons; outstanding balance colored red/green
- PaymentModal: fixed overlay with amount + note inputs, validation (amount > 0, amount <= balance), loading state, error display
- CustomerHistoryPanel: modal with sales table (Tanggal, No Ref, Grand Total, HPP Total, Laba Kotor, Margin %, Status) + summary row; fetches /api/receivables/customer

## Task Commits

Each task was committed atomically:

1. **Task 1: Receivables server page + ReceivablesClient + ReceivablesTable** - `b9d76f3` (feat)
2. **Task 2: PaymentModal and CustomerHistoryPanel components** - `de9ebf6` (feat)

## Files Created/Modified
- `manta-finance/app/receivables/page.tsx` - Server component with auth check and 6-link navigation
- `manta-finance/app/receivables/_components/ReceivablesClient.tsx` - Client orchestrator with period selector, data fetch, expand/payment/history state, optimistic update
- `manta-finance/app/receivables/_components/ReceivablesTable.tsx` - Customer-grouped table with expandable sale rows and action buttons
- `manta-finance/app/receivables/_components/PaymentModal.tsx` - Fixed overlay payment form with validation and loading state
- `manta-finance/app/receivables/_components/CustomerHistoryPanel.tsx` - Customer purchase history modal with summary row

## Decisions Made
- Optimistic update after payment POST: `setReceivables(prev => prev.map(...))` finds the customer and sale, updates paid/balance/status, then uses reduce to recompute totalTerbayar and totalPiutang — no full refetch needed
- Finance link added to receivables page nav (6 links total) as the plan specified adding both Finance and Piutang
- CustomerHistoryPanel uses SaleRow from /api/sales/route (imported type) since /api/receivables/customer returns the same shape

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Pre-existing TSC errors in finance/_components/FinanceClient.tsx (missing ProductMarginTable and CustomerDiscountTable) were present before this plan and remain out of scope — deferred per deviation rules
- TSC with those excluded passes clean; full `npm run build` passes cleanly showing /receivables at 3.95 kB

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 5 receivables UI files created and build-verified
- FIN-03, PIUT-01 through PIUT-04 requirements satisfied
- Phase 5 plan 06 (verification sweep) can now verify the complete receivables flow end-to-end

---
*Phase: 05-finance-receivables*
*Completed: 2026-03-19*
