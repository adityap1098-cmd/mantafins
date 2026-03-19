# Roadmap: Manta Racing Finance Dashboard

## Overview

From a bare Next.js project to a working internal finance dashboard: first the app is protected and running, then data flows in via Excel upload with automatic calculations, then views are built layer by layer — summary dashboard, operational tables, deep financial reports, and finally export. Each phase delivers a coherent, verifiable capability that the next phase builds on.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation & Auth** - App runs, is accessible, and is protected by password
- [x] **Phase 2: Import & Calculations** - User uploads 2 Excel files and all financial metrics are computed
- [x] **Phase 3: Dashboard** - User sees a visual summary of any period at a glance (completed 2026-03-18)
- [x] **Phase 4: Stock & Sales Views** - User browses, filters, and edits operational data tables (completed 2026-03-18)
- [x] **Phase 5: Finance & Receivables** - User sees deep P&L reporting and manages customer receivables (completed 2026-03-19)
- [ ] **Phase 6: Export** - User exports any slice of data to formatted Excel

## Phase Details

### Phase 1: Foundation & Auth
**Goal**: The application is deployed, accessible, and protected so the user can start working
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02
**Success Criteria** (what must be TRUE):
  1. User is redirected to a login page when visiting the app unauthenticated
  2. User can enter the correct password and access the dashboard
  3. User's session persists after closing and reopening the browser tab
  4. User can log out and is redirected back to login
**Plans**: 3 plans

Plans:
- [x] 01-01-PLAN.md — Next.js scaffold + Prisma/SQLite setup with Session model
- [x] 01-02-PLAN.md — Auth API routes (login/logout/check) + middleware
- [x] 01-03-PLAN.md — Login page UI + dashboard placeholder + human verification

### Phase 2: Import & Calculations
**Goal**: User uploads 2 Excel files for a period and all financial metrics are automatically computed and persisted
**Depends on**: Phase 1
**Requirements**: IMP-01, IMP-02, IMP-03, IMP-04, IMP-05, IMP-06, CALC-01, CALC-02, CALC-03, CALC-04, CALC-05
**Success Criteria** (what must be TRUE):
  1. User can create a new monthly period (e.g., "Maret 2026")
  2. User can upload a Products Excel file and stock data with HPP is saved as a snapshot for that period
  3. User can upload a Sales Report Excel file and all transactions are parsed and matched to products
  4. After upload, HPP, discount, gross profit, and margin are calculated automatically for every transaction
  5. User sees a clear status after each upload: success, warnings for unmatched products, or errors
  6. Historical period data does not change when a new period is uploaded
**Plans**: 6 plans

Plans:
- [x] 02-01-PLAN.md — Prisma schema migration (Period, ProductSnapshot, Sale, SaleItem, PaymentLog) + lib/prisma.ts singleton
- [x] 02-02-PLAN.md — Install xlsx, create lib/parser/products.ts and lib/parser/sales.ts
- [x] 02-03-PLAN.md — Create lib/calculator/margin.ts (HPP, diskon, labaKotor, marginPersen, period summary)
- [x] 02-04-PLAN.md — API routes: GET/POST /api/periods, POST /api/upload/products, POST /api/upload/sales
- [x] 02-05-PLAN.md — Import UI: period manager + file upload panels with status display + dashboard nav link
- [x] 02-06-PLAN.md — Human verification of full upload flow end-to-end

### Phase 3: Dashboard
**Goal**: User can see a visual financial summary of any period without digging into raw tables
**Depends on**: Phase 2
**Requirements**: DASH-01, DASH-02, DASH-03, DASH-04, DASH-05
**Success Criteria** (what must be TRUE):
  1. User sees summary cards showing total sales, HPP, gross profit, discount, receivables, and margin % for the selected period
  2. User sees a bar chart of sales by customer for the selected period
  3. User sees a pie chart of sales composition by product category
  4. User sees a bar chart of the top 10 best-selling products by quantity
  5. User can switch which period is displayed and all charts and cards update accordingly
**Plans**: 3 plans

Plans:
- [ ] 03-01-PLAN.md — Dashboard data API (GET /api/dashboard) aggregating summary + 3 chart datasets
- [ ] 03-02-PLAN.md — Summary cards + period selector + dashboard page client/server split
- [ ] 03-03-PLAN.md — Install Recharts + 3 chart components + wire into DashboardClient

### Phase 4: Stock & Sales Views
**Goal**: User can browse, filter, sort, search, and edit operational data in the stock and sales tables
**Depends on**: Phase 2
**Requirements**: STOK-01, STOK-02, STOK-03, STOK-04, STOK-05, STOK-06, STOK-07, SALE-01, SALE-02, SALE-03, SALE-04
**Success Criteria** (what must be TRUE):
  1. User can view the stock table with SKU, name, category, HPP, sale price, stock quantity, and margin columns
  2. User can sort the stock table by any column, filter by category/HPP range/stock range, and search by name or SCU
  3. User can inline-edit stock quantities and see low-stock alerts (yellow < 50, red < 10)
  4. User can view the transaction table with date, ref, customer, item count, totals, and payment status
  5. User can expand a transaction row to see per-item detail, and filter/sort transactions by customer, date, and status
**Plans**: 4 plans

Plans:
- [ ] 04-01-PLAN.md — GET /api/stock + PATCH /api/stock/[sku] routes with margin computation and inventory summary
- [ ] 04-02-PLAN.md — /stock page: sortable/filterable table, inline stock edit, low-stock alerts, inventory summary bar
- [ ] 04-03-PLAN.md — GET /api/sales route with computed metrics and nested item details
- [ ] 04-04-PLAN.md — /sales page: expandable transaction table, filter by customer/status/date, sort by date/total/margin

### Phase 5: Finance & Receivables
**Goal**: User can see deep P&L reporting, product/customer margin analysis, and manage receivables payments
**Depends on**: Phase 4
**Requirements**: FIN-01, FIN-02, FIN-03, FIN-04, FIN-05, PIUT-01, PIUT-02, PIUT-03, PIUT-04
**Success Criteria** (what must be TRUE):
  1. User can view a P&L-style financial report showing revenue, HPP, gross profit, operational costs, and net profit
  2. User can input manual operational costs and see net profit recalculate
  3. User can view a receivables table per customer showing total billed, paid, and outstanding balance
  4. User can record a payment (partial or full) against a specific transaction and the outstanding balance updates immediately
  5. User can view per-customer discount averages and per-product margin tables
**Plans**: 6 plans

Plans:
- [ ] 05-01-PLAN.md — Prisma schema: add OperationalCost model + db push + generate
- [ ] 05-02-PLAN.md — Finance API: GET /api/finance (P&L + product margins + customer discounts), POST/DELETE /api/finance/costs
- [ ] 05-03-PLAN.md — Receivables API: GET /api/receivables, POST /api/receivables/payment, GET /api/receivables/customer
- [ ] 05-04-PLAN.md — Finance page (/finance): P&L table, op costs form, product margin table, customer discount table
- [ ] 05-05-PLAN.md — Receivables page (/receivables): customer table, expand-to-sales, payment modal, history panel
- [ ] 05-06-PLAN.md — Nav update (6 links on all pages) + human verification

### Phase 6: Export
**Goal**: User can export any slice of financial data to a formatted Excel file ready for business reporting
**Depends on**: Phase 5
**Requirements**: EXPT-01, EXPT-02, EXPT-03
**Success Criteria** (what must be TRUE):
  1. User can select which report sheets to include in the export (financial report, transactions, item detail, receivables, stock, product margin, customer margin)
  2. User can apply filters before export (date range, customer, category, payment status)
  3. The generated Excel file has formatted headers, Rupiah number formatting, auto-width columns, colored header rows, and sub-totals/grand totals
**Plans**: 4 plans

Plans:
- [ ] 06-01-PLAN.md — Install ExcelJS + lib/export/ layer (formatters, 7 sheet builders, buildWorkbook) with TDD
- [ ] 06-02-PLAN.md — POST /api/export (binary xlsx response) + GET /api/export/preview (row counts)
- [ ] 06-03-PLAN.md — /export page UI (ExportClient two-column layout) + nav update on all 6 existing pages
- [ ] 06-04-PLAN.md — Full test suite + human verification of download and formatting

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Auth | 3/3 | Complete    | 2026-03-18 |
| 2. Import & Calculations | 6/6 | Complete    | 2026-03-18 |
| 3. Dashboard | 3/3 | Complete   | 2026-03-18 |
| 4. Stock & Sales Views | 4/4 | Complete   | 2026-03-18 |
| 5. Finance & Receivables | 6/6 | Complete   | 2026-03-19 |
| 6. Export | 1/4 | In Progress|  |
