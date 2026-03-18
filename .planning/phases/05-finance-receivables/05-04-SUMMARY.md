---
phase: 05-finance-receivables
plan: "04"
subsystem: finance-ui
tags: [finance, p&l, operational-costs, product-margin, customer-discount, react, nextjs]
dependency_graph:
  requires: [05-02]
  provides: [finance-page-ui]
  affects: [FIN-01, FIN-02, FIN-04, FIN-05]
tech_stack:
  added: []
  patterns: [client-state-orchestration, sortable-table, period-selector-reuse, idr-formatting, immutable-sort]
key_files:
  created:
    - manta-finance/app/finance/page.tsx
    - manta-finance/app/finance/_components/FinanceClient.tsx
    - manta-finance/app/finance/_components/PLTable.tsx
    - manta-finance/app/finance/_components/OpCostsForm.tsx
    - manta-finance/app/finance/_components/ProductMarginTable.tsx
    - manta-finance/app/finance/_components/CustomerDiscountTable.tsx
  modified: []
decisions:
  - "/finance page reuses shared PeriodSelector and LogoutButton from dashboard — no new components for nav/auth"
  - "FinanceClient uses useCallback for fetchFinanceData to avoid stale closure on add/delete cost handlers"
  - "PLTable shows costs as (negative) parenthesized values for readability — consistent with accounting convention"
  - "Sortable tables default to desc sort on their primary metric (marginPersen, totalDiskon) — most useful view first"
metrics:
  duration: "~4 min"
  completed_date: "2026-03-19"
  tasks_completed: 2
  files_created: 6
  files_modified: 0
---

# Phase 5 Plan 04: Finance Page Summary

**One-liner:** Full P&L report with manual operational cost CRUD, plus sortable product margin and customer discount tables at `/finance`.

## What Was Built

Six React/Next.js components implementing the finance dashboard page:

1. **`finance/page.tsx`** — Server component with auth guard (validateSession), shared header, and 5-link nav bar with Finance as active link
2. **`FinanceClient.tsx`** — Client orchestrator managing period selection, finance data fetch, and add/delete cost mutations with refetch
3. **`PLTable.tsx`** — P&L report: 11 rows including Pendapatan Kotor, HPP, Laba Kotor, Diskon, Biaya Operasional, Laba Bersih, margins, Piutang summary. Green/red color coding, IDR formatting
4. **`OpCostsForm.tsx`** — Operational costs table with inline add form (description + amount) and per-row delete. Validation, loading states, inline errors
5. **`ProductMarginTable.tsx`** — Sortable 7-column table, color-coded margin % (green >= 30%, yellow 15-29%, red < 15%), default sort by marginPersen desc
6. **`CustomerDiscountTable.tsx`** — Sortable 5-column table, color-coded avg discount % (green <= 5%, yellow 6-15%, red > 15%), default sort by totalDiskon desc

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking Build] CustomerHistoryPanel resolved itself on TSC check**
- **Found during:** Task 2 build verification
- **Issue:** `npm run build` failed with "Can't resolve './CustomerHistoryPanel'" — TSC showed the same error in first check
- **Investigation:** CustomerHistoryPanel.tsx existed on disk (created in 05-03 as `de9ebf6`) but TSC hadn't seen it before all finance files were present
- **Resolution:** After all 6 finance files were written, `npx tsc --noEmit` passed clean and `npm run build` succeeded — no code changes needed
- **Commit:** Resolved naturally (no separate fix commit)

## Requirements Satisfied

- **FIN-01:** User can navigate to /finance and see a P&L-style report — finance page with PLTable renders all 11 rows
- **FIN-02:** P&L shows Pendapatan, HPP, Laba Kotor, Biaya Operasional (via OpCostsForm), Laba Bersih with margin % — complete
- **FIN-04:** User sees product margin table with productName, totalQty, HPP/unit, avg harga aktual, margin % — ProductMarginTable
- **FIN-05:** User sees customer discount table with customer, totalTransaksi, totalDiskon, avg diskon % — CustomerDiscountTable

## Self-Check: PASSED

All 6 files exist on disk. Both task commits verified:
- `9f61fa3` feat(05-04): Finance server page + FinanceClient + PLTable + OpCostsForm
- `f8c0ed9` feat(05-04): ProductMarginTable and CustomerDiscountTable components
