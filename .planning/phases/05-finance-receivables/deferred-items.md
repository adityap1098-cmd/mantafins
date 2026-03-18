# Deferred Items — Phase 05

## Pre-existing TypeScript Errors in receivables/route.ts

**Found during:** Plan 05-02 Task 2 verification
**File:** `manta-finance/app/api/receivables/route.ts`
**Errors:**
- TS2802: `Map` iteration requires `--downlevelIteration` flag or `--target` of `es2015` or higher (line 56)
- TS7006: Implicit `any` types on parameters in `.map()` callbacks (lines 63, 66, 74)

**Root cause:** `for...of` on `Map.entries()` fails with the current TS target. The `--downlevelIteration` flag is not enabled, and parameters inside map callbacks lack explicit types.

**Scope:** Out of scope for 05-02 (created in 05-01). Fix in a follow-up task or 05-06 verification sweep.
