---
phase: 6
slug: export
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-19
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest ^4.1.0 |
| **Config file** | `manta-finance/vitest.config.ts` (exists) |
| **Quick run command** | `npx vitest run lib/export` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run lib/export`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 0 | EXPT-01,02,03 | unit | `npx vitest run lib/export/buildWorkbook.test.ts` | Wave 0 | ⬜ pending |
| 06-02-01 | 02 | 1 | EXPT-01 | unit | `npx vitest run lib/export/buildWorkbook.test.ts -t "only selected sheets"` | Wave 0 | ⬜ pending |
| 06-02-02 | 02 | 1 | EXPT-02 | unit | `npx vitest run lib/export/buildWorkbook.test.ts -t "filter mapping"` | Wave 0 | ⬜ pending |
| 06-02-03 | 02 | 1 | EXPT-03 | unit | `npx vitest run lib/export/buildWorkbook.test.ts -t "formatting"` | Wave 0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `manta-finance/lib/export/buildWorkbook.test.ts` — stubs covering EXPT-01, EXPT-02, EXPT-03
- [ ] `npm install exceljs` in `manta-finance/` — required before any test can import it

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Browser triggers direct file download | EXPT-01 | Requires browser interaction | Click Export button, verify .xlsx file downloads |
| Excel file opens correctly in Excel/LibreOffice | EXPT-03 | File format validation | Open downloaded file, verify sheets, formatting, Rupiah values |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
