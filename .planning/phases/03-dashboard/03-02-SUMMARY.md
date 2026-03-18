---
phase: 03-dashboard
plan: "02"
subsystem: dashboard-ui
tags: [dashboard, summary-cards, period-selector, client-components]
dependency_graph:
  requires: [03-01]
  provides: [dashboard-summary-ui, period-selector, dashboard-client-state]
  affects: [03-03]
tech_stack:
  added: []
  patterns: [server-component-auth-shell, client-component-data-state, rupiah-intl-formatter]
key_files:
  created:
    - manta-finance/app/dashboard/_components/SummaryCards.tsx
    - manta-finance/app/dashboard/_components/PeriodSelector.tsx
    - manta-finance/app/dashboard/_components/DashboardClient.tsx
  modified:
    - manta-finance/app/dashboard/page.tsx
decisions:
  - "SummaryCards imports PeriodSummary from lib/calculator/margin (canonical type source) rather than re-exporting from route"
  - "DashboardClient owns all client state; page.tsx remains a pure server component for auth — clean separation"
metrics:
  duration: "2 min"
  completed_date: "2026-03-19"
  tasks_completed: 2
  files_changed: 4
---

# Phase 3 Plan 2: Summary Cards and Period Selector Summary

**One-liner:** Dashboard UI with 7 Rupiah-formatted summary cards and a period dropdown that auto-selects latest period and triggers data refresh on change.

## What Was Built

- **SummaryCards.tsx** — pure display component rendering a 7-card grid (Total Penjualan, HPP, Laba Kotor, Diskon, Piutang Aktif, Terbayar, Margin %). Uses `Intl.NumberFormat('id-ID', IDR)` for Rupiah formatting, `XX.XX%` for margin. Skeleton loading state via `animate-pulse`. Null summary falls back to zero values.

- **PeriodSelector.tsx** — `'use client'` dropdown that fetches `/api/periods` on mount, sorts descending by year/month, auto-selects the first period when `selectedPeriodId` is null. Error state shows "Gagal memuat periode".

- **DashboardClient.tsx** — `'use client'` component owning `selectedPeriodId`, `dashboardData`, and `loading` state. `useEffect` fires on `selectedPeriodId` change to fetch `/api/dashboard?periodId=...`. Renders header row with PeriodSelector + SummaryCards + charts placeholder div for Plan 03.

- **page.tsx** — stripped to server-component auth shell only. After auth passes, renders `<DashboardClient />` inside the existing header/nav layout.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | SummaryCards and PeriodSelector | b538d2c | SummaryCards.tsx, PeriodSelector.tsx |
| 2 | DashboardClient + page.tsx refactor | 2e1040c | DashboardClient.tsx, page.tsx |

## Verification

- `npx tsc --noEmit` passes clean (no output = no errors)
- All 7 card labels and Rupiah formatting defined
- PeriodSelector fetches `/api/periods` on mount with auto-select
- `useEffect` on `selectedPeriodId` fetches `/api/dashboard?periodId=...`
- Charts placeholder `id="charts-placeholder"` present for Plan 03

## Deviations from Plan

**1. [Rule 2 - Missing critical functionality] Import type from lib/calculator/margin directly**
- **Found during:** Task 1
- **Issue:** Plan spec said to import `PeriodSummary` from `@/app/api/dashboard/route` but that route re-exports it from `@/lib/calculator/margin`. Importing from the route in a non-client component can cause issues with Next.js server/client boundary analysis.
- **Fix:** SummaryCards imports `PeriodSummary` directly from `@/lib/calculator/margin` (the canonical type location). DashboardClient imports `DashboardData` from `@/app/api/dashboard/route` as specified (correct — it's a type-only import).
- **Files modified:** SummaryCards.tsx
- **Commit:** b538d2c

## Self-Check: PASSED

All created files confirmed present on disk. Both task commits (b538d2c, 2e1040c) confirmed in git log.
