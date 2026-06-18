---
plan: 01-05
status: complete
completed_at: "2026-06-18T15:15:00+07:00"
phase: 01-fix-critical-issues-testing-foundation
subsystem: frontend
tags: [fix, borrow-page, error-handling, tab-filter, tests]
requires: ["01-01"]
provides: [FIX-02, FIX-06]
affects:
  - frontend/src/app/borrow/page.tsx
  - frontend/src/app/borrow/__tests__/page.test.tsx
tech-stack:
  added: []
  patterns:
    - "TDD: RED (failing tests for FIX-06 error states) then GREEN (error banners + actionError timeout)"
    - "Error banner: bg-red-50 px-4 py-3 text-sm text-red-700 (per UI-SPEC.md)"
    - "Auto-dismiss: 5-second setTimeout in useEffect for actionError"
key-files:
  created:
    - frontend/src/app/borrow/__tests__/page.test.tsx
  modified:
    - frontend/src/app/borrow/page.tsx
decisions:
  - "FIX-02 tab filter already applied in current code base — plan acknowledged, verified by tests"
  - "FIX-06 error messages follow established bg-red-50 pattern from UI-SPEC.md"
metrics:
  duration_seconds: 483
  completed_date: "2026-06-18"
---

# Phase 01 Plan 05: Fix Borrow Page Tab Filter & Error Handling

**One-liner:** Fixed borrow page error handling (FIX-06) by replacing empty catch blocks with user-visible error banners using the bg-red-50 pattern, and verified the already-applied tab filter (FIX-02) with 6 new unit tests.

## Summary

### What was built

**FIX-06: Borrow Page Error Handling**

The borrow page previously swallowed all API errors with empty catch blocks (`catch(() => {})` and `catch { // ignore }`). Users saw a perpetual spinner or an empty list with no explanation when API calls failed. This fix adds:

1. **Fetch error state** — `setError("Failed to load borrow requests. Please try again.")` in the fetch useEffect catch block
2. **Action error state** — `setActionError(\`Failed to ${action} request. Please try again.\`)` in the handleAction catch block
3. **Error banners** — `<div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">` rendered between the tab bar and card list, following the established pattern from login/register/item pages (per UI-SPEC.md)
4. **Auto-dismiss** — 5-second `setTimeout` in a `useEffect` clears `actionError` automatically

**FIX-02: Tab Filter (already applied)**

The tab filter was already using strict user ID comparison (`r.borrowerId === user?.id` / `r.ownerId === user?.id`) when this plan executed. The `getUser()` import and `const user = getUser()` call were already present. New tests verify the filter works correctly.

### Key files modified

| File | Changes | Purpose |
|------|---------|---------|
| `frontend/src/app/borrow/page.tsx` | +20 / -2 lines | Error states, catch blocks, error banners, auto-clear timer |

### Key files created

| File | Lines | Purpose |
|------|-------|---------|
| `frontend/src/app/borrow/__tests__/page.test.tsx` | 181 | 6 tests for FIX-02 tab filter and FIX-06 error handling |

### Test summary

| Test | Status | Category |
|------|--------|----------|
| borrowed tab shows only requests where borrowerId matches current user | PASS | FIX-02 |
| lent tab shows only requests where ownerId matches current user | PASS | FIX-02 |
| empty state shown when filtered requests are empty | PASS | FIX-02 |
| shows error banner when initial fetch fails | PASS | FIX-06 |
| shows action error message when approve/reject/return fails | PASS | FIX-06 |
| loading state shows spinner | PASS | general |

**Full frontend suite:** 89 tests, 11 files, all pass — zero regressions.

### Must-have verification

- [x] FIX-02: Tab filter compares against user.id (`borrowerId === user?.id`, `ownerId === user?.id`) — test-verified
- [x] FIX-06: Initial fetch error sets error state with "Failed to load borrow requests. Please try again." — test-verified
- [x] FIX-06: Action error sets actionError state with "Failed to {action} request. Please try again." — test-verified
- [x] FIX-06: Error banners use className "rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" per UI-SPEC.md — test-verified
- [x] FIX-06: actionError auto-clears after 5 seconds — implemented
- [x] All existing frontend tests still pass — 89 tests, 0 failures

### Commits

| Task | Commit | Message |
|------|--------|---------|
| 1 | `f45d7c2` | test(01-05): add failing borrow page tests for FIX-02 tab filter and FIX-06 error handling |
| 2 | `67fbb95` | feat(01-05): fix borrow page FIX-06 error handling with user-visible error banners |

## Deviations from Plan

### Pre-existing Fix

**1. [Deviation] FIX-02 tab filter already applied in current code base**

- **Found during:** Task 1 (writing tests)
- **Issue:** The plan's context showed FIX-02 as a bug to fix (`r.borrowerId` without `=== user?.id`), but the current `page.tsx` already contained the correct filter logic with `getUser()` import and `const user = getUser()` call.
- **Fix:** No code change needed for FIX-02. Wrote tests anyway to verify the filter works correctly — all 3 FIX-02 tests pass.
- **Impact:** Task 2 scope reduced to FIX-06 only (error handling). No regression risk since FIX-02 was already correct.

### Auto-fixed Issues

None.

## TDD Gate Compliance

- [x] RED gate: `f45d7c2` (test commit) — 2 FIX-06 tests fail on empty catch blocks, 4 tests pass (FIX-02 already fixed)
- [x] GREEN gate: `67fbb95` (feat commit) — all 6 tests pass after adding error handling
- REFACTOR gate: N/A (no refactoring needed)

## Known Stubs

None. All error states are functional with real user-facing messages.

## Threat Flags

None. The threat model for this plan (T-01-08: Information Disclosure via tab filter, T-01-09: Error message disclosure) is addressed:
- T-01-08: Filter uses strict `===` comparison against current user's ID — prevents cross-user data leakage
- T-01-09: Error messages are generic ("Failed to load borrow requests") — no internal details leaked
