---
phase: 01-foundation-and-auth
plan: 01
subsystem: infra
tags: [nextjs, prisma, sqlite, tailwind, typescript]

# Dependency graph
requires: []
provides:
  - Next.js 14 App Router project bootable at localhost:3000
  - Prisma v7 with SQLite datasource configured
  - Session model in schema.prisma (id, token, createdAt, expiresAt)
  - data/manta.db SQLite database created and in sync
  - APP_PASSWORD and DATABASE_URL env vars in .env
affects: [01-02, 01-03, all subsequent phases]

# Tech tracking
tech-stack:
  added: [nextjs@14, react, typescript, tailwindcss, prisma@7, @prisma/client, jose]
  patterns: [app-router, no-src-dir layout, prisma.config.ts for datasource URL]

key-files:
  created:
    - manta-finance/prisma/schema.prisma
    - manta-finance/prisma.config.ts
    - manta-finance/.env.example
    - manta-finance/app/layout.tsx
    - manta-finance/app/page.tsx
  modified:
    - manta-finance/.gitignore

key-decisions:
  - "Prisma v7 moves DATABASE_URL from schema.prisma url= to prisma.config.ts datasource.url"
  - "SQLite database file at H:/AI/VERA/Manta Racing/data/manta.db (../data/ relative to manta-finance/)"
  - "No src/ directory — app/ is at project root (manta-finance/app/)"
  - "next.config.mjs instead of next.config.ts (create-next-app default)"

patterns-established:
  - "Project files live in manta-finance/ subdirectory"
  - "Database at data/manta.db one level above manta-finance/"
  - "prisma.config.ts reads DATABASE_URL via dotenv from .env"

requirements-completed: [AUTH-01, AUTH-02]

# Metrics
duration: 4min
completed: 2026-03-18
---

# Phase 1 Plan 01: Next.js Scaffold + Prisma Setup Summary

**Next.js 14 App Router project bootstrapped with Prisma v7/SQLite Session model and Tailwind CSS, ready for auth implementation**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-18T20:04:08Z
- **Completed:** 2026-03-18T20:08:38Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Scaffolded Next.js 14 project with App Router, TypeScript, Tailwind CSS (no src/ dir)
- Installed prisma, @prisma/client, jose — all core dependencies for auth
- Configured Prisma v7 with SQLite datasource and Session model
- Database created at data/manta.db, prisma db push succeeds
- Build passes cleanly, project compiles without errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold Next.js project with dependencies** - `db245ff` (feat)
2. **Task 2: Initialize Prisma with SQLite and Session model** - `4e13db4` (feat)

## Files Created/Modified
- `manta-finance/app/layout.tsx` - Root layout: lang="id", bg-gray-50, title "Manta Racing Finance"
- `manta-finance/app/page.tsx` - Minimal placeholder (h1 + p-8)
- `manta-finance/prisma/schema.prisma` - Session model with id, token, createdAt, expiresAt
- `manta-finance/prisma.config.ts` - Prisma v7 config: schema path, DATABASE_URL from dotenv
- `manta-finance/.env` - DATABASE_URL (file:../data/manta.db) and APP_PASSWORD (manta2026)
- `manta-finance/.env.example` - Safe placeholder values for version control
- `manta-finance/.gitignore` - Added .env and /data/*.db exclusions
- `manta-finance/package.json` - All dependencies including prisma, @prisma/client, jose

## Decisions Made
- Used `prisma.config.ts` (Prisma v7 approach) for DATABASE_URL instead of `url = env("DATABASE_URL")` in schema.prisma — Prisma v7 removed the url field from schema.prisma datasource blocks
- Database path set to `../data/manta.db` so the file lives at the repo root level (H:/AI/VERA/Manta Racing/data/) not inside manta-finance/
- next.config stays as `.mjs` (create-next-app default), not renamed to `.ts` — no behavior difference
- No src/ directory per scaffold flags — app/ lives at manta-finance/app/

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Prisma v7 schema.prisma datasource url field removed**
- **Found during:** Task 2 (Prisma db push)
- **Issue:** Plan specified `url = env("DATABASE_URL")` in schema.prisma datasource block, but Prisma v7 (installed: 7.5.0) no longer supports the `url` field in schema files — it must be configured in `prisma.config.ts`
- **Fix:** Removed `url` from datasource block in schema.prisma; `prisma.config.ts` already reads `DATABASE_URL` from `.env` via dotenv — this is the correct Prisma v7 approach
- **Files modified:** manta-finance/prisma/schema.prisma
- **Verification:** `npx prisma db push` succeeds with "Your database is now in sync"
- **Committed in:** 4e13db4 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 API change adaptation)
**Impact on plan:** Required adaptation to Prisma v7 breaking change. Database is created correctly, all functionality preserved. No scope creep.

## Issues Encountered
- Prisma v7 changed how datasource URLs are configured — schema.prisma no longer accepts `url =` in datasource block. Resolved by using the generated `prisma.config.ts` pattern which already reads from .env via dotenv.

## User Setup Required
None - no external service configuration required. The .env file is pre-configured with working defaults for local development.

## Next Phase Readiness
- Next.js project boots and builds cleanly
- Prisma client generated, Session model ready for auth API routes
- jose library installed for Edge-compatible JWT/cookie operations
- Ready for Plan 01-02: Auth API routes (login/logout/check) + middleware

---
*Phase: 01-foundation-and-auth*
*Completed: 2026-03-18*
