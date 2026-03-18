---
phase: 03-dashboard
plan: "03"
subsystem: dashboard-charts
tags: [recharts, visualization, bar-chart, pie-chart, dashboard]
dependency_graph:
  requires: [03-02]
  provides: [DASH-02, DASH-03, DASH-04]
  affects: [manta-finance/app/dashboard/_components/DashboardClient.tsx]
tech_stack:
  added: [recharts@^3.8.0]
  patterns: [recharts ResponsiveContainer, BarChart layout=vertical, PieChart with Cell palette]
key_files:
  created:
    - manta-finance/app/dashboard/_components/SalesBarChart.tsx
    - manta-finance/app/dashboard/_components/CategoryPieChart.tsx
    - manta-finance/app/dashboard/_components/TopProductsChart.tsx
  modified:
    - manta-finance/app/dashboard/_components/DashboardClient.tsx
decisions:
  - "Recharts v3 tooltip formatters use ValueType union — guard with typeof value === 'number' to avoid TS2322"
  - "PieLabelRenderProps.name carries nameKey value; props.category is not a standard field — use props.name for label"
metrics:
  duration: "~3 min"
  completed_date: "2026-03-19"
  tasks_completed: 2
  files_changed: 4
---

# Phase 3 Plan 03: Dashboard Charts Summary

**One-liner:** Recharts bar/pie charts for sales by customer, category composition, and top-10 products wired into DashboardClient with loading skeletons and empty states.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Install Recharts and create three chart components | 9329641 | SalesBarChart.tsx, CategoryPieChart.tsx, TopProductsChart.tsx, package.json |
| 2 | Wire charts into DashboardClient | f2363a5 | DashboardClient.tsx |

## What Was Built

Three Recharts chart components integrated into the dashboard below the summary cards:

- **SalesBarChart** — Vertical bar chart showing total sales per customer. IDR tooltip with abbreviated Y-axis (Jt/Rb). Angled X-axis labels (−30°) to prevent cutoff.
- **CategoryPieChart** — Pie chart showing revenue composition by product category. 8-color palette cycling via `index % 8`. Label shows category name + percentage. Legend with circle icons.
- **TopProductsChart** — Horizontal bar chart (layout="vertical") for top 10 products by quantity. 180px Y-axis width for long product names. Qty tooltip with "pcs" suffix.

All components:
- Accept `data` array + `loading: boolean` props
- Show animated skeleton (`animate-pulse bg-gray-100`) while loading
- Show "Tidak ada data penjualan" empty state when data is empty
- Wrapped in white card with border and shadow

DashboardClient layout:
- SalesBarChart: full width (row 1)
- CategoryPieChart + TopProductsChart: `grid-cols-1 lg:grid-cols-2` (row 2)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Recharts v3 strict TypeScript types**
- **Found during:** Task 1 verification (tsc --noEmit)
- **Issue:** Recharts v3 changed `Tooltip formatter` signature to `(value: ValueType | undefined)` — literal `(value: number)` params failed TS2322. `PieLabelRenderProps` does not include data-key properties directly; `props.name` carries the `nameKey` value, not `props.category`.
- **Fix:** Tooltip formatters guard with `typeof value === 'number'`. Label function uses `PieLabelRenderProps` type from recharts and reads `props.name` instead of `props.category`.
- **Files modified:** CategoryPieChart.tsx, SalesBarChart.tsx, TopProductsChart.tsx
- **Commit:** 9329641

## Verification

- `npx tsc --noEmit` — passes clean
- `npm run build` — passes clean, dashboard bundle 128 kB
- DashboardClient imports all three chart components
- Charts show loading skeletons and empty states

## Self-Check: PASSED

Files confirmed present:
- manta-finance/app/dashboard/_components/SalesBarChart.tsx — FOUND
- manta-finance/app/dashboard/_components/CategoryPieChart.tsx — FOUND
- manta-finance/app/dashboard/_components/TopProductsChart.tsx — FOUND
- manta-finance/app/dashboard/_components/DashboardClient.tsx — FOUND

Commits confirmed:
- 9329641 — FOUND
- f2363a5 — FOUND
