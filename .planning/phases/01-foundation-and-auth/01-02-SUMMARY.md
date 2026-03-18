---
phase: 01-foundation-and-auth
plan: 02
subsystem: auth
tags: [nextjs, prisma, sqlite, cookies, middleware, typescript]

# Dependency graph
requires:
  - phase: 01-01
    provides: "Next.js project scaffold, Prisma v7 with SQLite Session model, jose dependency"
provides:
  - lib/prisma.ts — singleton PrismaClient with globalThis guard (Next.js hot reload safe)
  - lib/auth.ts — createSession, validateSession, deleteSession, SESSION_COOKIE_NAME
  - app/api/auth/login/route.ts — POST validates APP_PASSWORD, creates session, sets httpOnly cookie
  - app/api/auth/logout/route.ts — POST deletes session from DB, clears cookie
  - app/api/auth/check/route.ts — GET validates session cookie, returns 200 or 401
  - middleware.ts — Edge-compatible cookie-presence check, redirects unauthenticated to /login
affects: [01-03, all phases that add protected routes or pages]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Prisma singleton via globalThis guard — prevents multiple connections during hot reload"
    - "SESSION_COOKIE_NAME inlined in middleware.ts to avoid Prisma import in Edge runtime"
    - "Middleware does cookie-presence check only; full DB validation deferred to API routes"
    - "httpOnly cookie with maxAge = SESSION_DURATION_MS/1000 (seconds)"

key-files:
  created:
    - manta-finance/lib/prisma.ts
    - manta-finance/lib/auth.ts
    - manta-finance/app/api/auth/login/route.ts
    - manta-finance/app/api/auth/logout/route.ts
    - manta-finance/app/api/auth/check/route.ts
    - manta-finance/middleware.ts
  modified: []

key-decisions:
  - "Files placed in lib/ not src/lib/ — no src/ directory in this project (tsconfig @/* maps to ./)"
  - "SESSION_COOKIE_NAME inlined in middleware.ts — importing @/lib/auth would pull Prisma into Edge runtime"
  - "Middleware does lightweight cookie presence check only — DB validation happens per API route/server component"
  - "deleteSession uses deleteMany (not delete) to avoid thrown errors if token already expired/deleted"

patterns-established:
  - "All auth utilities in lib/auth.ts, Prisma client in lib/prisma.ts"
  - "API routes use named exports POST/GET per Next.js App Router convention"
  - "Public paths: /login, /api/auth/login, /api/auth/logout bypass middleware auth check"

requirements-completed: [AUTH-01, AUTH-02]

# Metrics
duration: 5min
completed: 2026-03-19
---

# Phase 1 Plan 02: Auth Backend Summary

**Cookie-based single-user auth: Prisma session CRUD, three API routes (login/logout/check), and Edge-compatible middleware redirecting unauthenticated requests to /login**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-18T20:11:42Z
- **Completed:** 2026-03-18T20:16:45Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Prisma singleton client with globalThis guard to survive Next.js hot reload
- Auth utility functions: createSession (random UUID token, 7-day expiry), validateSession (DB lookup + expiry check + auto-delete), deleteSession
- Three App Router API routes: login (password check + cookie set), logout (DB delete + cookie clear), check (session validation)
- Edge-compatible middleware that redirects unauthenticated requests to /login using cookie presence check only

## Task Commits

Each task was committed atomically:

1. **Task 1: Prisma singleton and auth utility functions** - `d688aca` (feat)
2. **Task 2: Auth API routes and middleware** - `422debd` (feat)

## Files Created/Modified
- `manta-finance/lib/prisma.ts` - Singleton PrismaClient with globalThis guard for Next.js hot reload safety
- `manta-finance/lib/auth.ts` - createSession, validateSession, deleteSession, SESSION_COOKIE_NAME, SESSION_DURATION_MS
- `manta-finance/app/api/auth/login/route.ts` - POST: validates APP_PASSWORD, creates session, sets httpOnly 7-day cookie
- `manta-finance/app/api/auth/logout/route.ts` - POST: deletes session from DB, clears cookie (maxAge: 0)
- `manta-finance/app/api/auth/check/route.ts` - GET: validates session cookie, returns {authenticated: true/false} with 200/401
- `manta-finance/middleware.ts` - Lightweight Edge cookie-presence check, redirects unauthenticated to /login; passes /login and /api/auth/* through

## Decisions Made
- Files placed in `lib/` not `src/lib/` — the project has no `src/` directory (Plan 01 used no-src-dir scaffold flag); tsconfig `@/*` maps to `./` so `@/lib/auth` resolves correctly
- `SESSION_COOKIE_NAME` is inlined as a string constant in `middleware.ts` rather than imported from `@/lib/auth`. Importing auth.ts would transitively import Prisma, which uses Node.js APIs incompatible with the Edge runtime
- Middleware checks cookie presence only — this is intentional. Expired sessions are caught at the API route level where Prisma is available. Middleware's job is to gate routing, not full validation
- `deleteSession` uses `deleteMany` instead of `delete` to avoid Prisma throwing if the token row doesn't exist (e.g., already expired and auto-deleted)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Files placed in lib/ not src/lib/ per actual project structure**
- **Found during:** Task 1 (file creation)
- **Issue:** Plan specified `src/lib/prisma.ts` and `src/lib/auth.ts`, but the project has no `src/` directory. Plan 01-01 established the no-src-dir pattern. tsconfig `@/*` alias maps to `./` (manta-finance root), so `@/lib/auth` resolves to `lib/auth.ts`
- **Fix:** Created files at `manta-finance/lib/prisma.ts` and `manta-finance/lib/auth.ts`. API routes similarly at `app/api/auth/` not `src/app/api/auth/`
- **Files modified:** All 6 files in plan
- **Verification:** `npx tsc --noEmit` passes with zero errors
- **Committed in:** d688aca (Task 1 commit), 422debd (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 structural path correction — no behavior change)
**Impact on plan:** Required path correction to match actual project structure from Plan 01. All functionality delivered as specified. No scope change.

## Issues Encountered
- Plan referenced `src/lib/` and `src/app/` paths but project has no `src/` directory (established in Plan 01). Corrected automatically by placing files at project root `lib/` and `app/` which matches the `@/*` tsconfig alias.

## User Setup Required
None - auth uses `APP_PASSWORD` env var already set in `.env` from Plan 01 (`manta2026`).

## Next Phase Readiness
- Auth backend fully operational: login/logout/check routes + middleware protection
- All protected routes will automatically redirect to /login for unauthenticated users
- Ready for Plan 01-03: Login page UI (the only unprotected page users will see)

---
*Phase: 01-foundation-and-auth*
*Completed: 2026-03-19*
