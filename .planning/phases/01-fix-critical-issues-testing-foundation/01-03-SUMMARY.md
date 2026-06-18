---
phase: 01-fix-critical-issues-testing-foundation
plan: 03
subsystem: borrow, item
tags: [TDD, bugfix, transactional, category-resolution]
requires:
  - 01-02
provides:
  - FIX-01 (@Transactional on BorrowService.create)
  - FIX-05 (categoryName resolved in ItemService.toResponse)
affects:
  - BorrowService
  - ItemService
tech-stack:
  added: []
  patterns:
    - "TDD RED→GREEN cycle for bug fixes"
    - "categoryRepository.findById() for testable category name resolution"
key-files:
  created: []
  modified:
    - "backend/src/main/kotlin/com/shareshelf/item/ItemService.kt"
    - "backend/src/test/kotlin/com/shareshelf/borrow/BorrowServiceTest.kt"
    - "backend/src/test/kotlin/com/shareshelf/item/ItemServiceTest.kt"
decisions:
  - "FIX-01 already implemented upstream (commit 6cda9b2) — added verification test instead of code change"
  - "FIX-05 uses categoryRepository.findById() instead of JPA relationship (item.category?.name) for unit-testability"
metrics:
  duration: "~9 minutes"
  completed: "2026-06-18"
---

# Phase 1 Plan 3: Fix @Transactional and Wire categoryName Summary

Fix FIX-01 and FIX-05 using TDD cycles. FIX-01 adds missing `@Transactional` to `BorrowService.create()` (or verifies it). FIX-05 wires `categoryName` through `ItemService.toResponse()` so create/update responses include the category name instead of null.

## Execution Summary

Executed autonomously. No checkpoints encountered. 2 tasks (features) with total 3 commits.

### Task 1: FIX-01 — @Transactional on BorrowService.create()

**Status:** Already implemented upstream (commit `6cda9b2`). Added verification test.

The `@Transactional` annotation was already present on `BorrowService.create()` at line 26 from a prior fix. Per TDD fail-fast rule, the feature already existed — the RED phase test would have passed instead of failed.

Added a Java reflection test in `BorrowServiceTest`:
- `create method is annotated with Transactional` — uses `getMethod().isAnnotationPresent()` to verify the annotation is present
- Test passes immediately, confirming the fix is in place

No code change was needed for FIX-01.

**Commit:** `36411b9` — `test(01-03): add verification test for FIX-01 — @Transactional on BorrowService.create()`

### Task 2: FIX-05 — Wire categoryName through ItemService.toResponse()

**Status:** Full TDD cycle (RED → GREEN). Fixed.

**RED phase (commit `b4978de`):**
Added 2 failing tests to `ItemServiceTest`:
1. `create should return categoryName from category repository` — asserts `categoryName` equals the name of the category with matching ID
2. `update should return updated categoryName when categoryId changes` — asserts `categoryName` reflects the new category after update

Both tests failed because the existing code used `item.category?.name` (JPA `@ManyToOne` relationship), which is null in unit tests without JPA context.

**GREEN phase (commit `8d8a708`):**
Fixed `ItemService.kt`:
1. Added `categoryRepository: CategoryRepository` constructor injection
2. Changed `toResponse()` from `categoryName = item.category?.name` (JPA relationship) to `categoryRepository.findById(item.categoryId)` (explicit repository lookup)
3. Updated all `ItemServiceTest` tests:
   - Added `categoryRepository` mock to test class
   - Updated `create` and `update` tests with `categoryRepository.findById()` mocks
   - Added `categoryName` assertions and `verify()` calls

All 15 `ItemServiceTest` tests pass, all backend tests pass with no regressions.

## Deviations from Plan

### FIX-01: Feature already implemented upstream

**[TDD Fail-Fast] @Transactional already present on BorrowService.create()**
- **Found during:** Task 1 (FIX-01 RED phase)
- **Issue:** The plan expected `@Transactional` to be missing from `create()`, requiring a RED→GREEN cycle. The annotation was already added in commit `6cda9b2` ("fix(backend): fix borrow lifecycle, add status enums, fix N+1 queries, remove dead code").
- **Resolution:** Added reflection-based verification test that confirms the annotation is present. Test passes immediately — no code change needed. Documented as a plan→implementation delta.
- **Files modified:** `backend/src/test/kotlin/com/shareshelf/borrow/BorrowServiceTest.kt`
- **Commit:** `36411b9`

### FIX-05: Implementation approach differs from plan

**[Plan vs. Reality] Current code already had partial fix via JPA relationship**
- **Found during:** Task 2 initial analysis
- **Issue:** The plan assumed `categoryName = null` was hardcoded. The actual code had `categoryName = item.category?.name` using the JPA `@ManyToOne` relationship on `Item.category`. This works in integration (with active JPA context) but returns null in unit tests.
- **Resolution:** Followed the plan's explicit approach (`categoryRepository.findById()`) instead of keeping the JPA relationship. This approach is unit-testable without JPA lazy loading context and matches the plan's `must_haves` ("toResponse() resolves categoryName via categoryRepository").
- **Files modified:** `backend/src/main/kotlin/com/shareshelf/item/ItemService.kt`, `backend/src/test/kotlin/com/shareshelf/item/ItemServiceTest.kt`
- **Commit:** `8d8a708`

## Verification

- [x] `cd backend && ./gradlew test --tests "com.shareshelf.borrow.BorrowServiceTest"` — passes
- [x] `cd backend && ./gradlew test --tests "com.shareshelf.item.ItemServiceTest"` — passes
- [x] `cd backend && ./gradlew test` — all backend tests pass
- [x] BorrowService.create() has @Transactional annotation — verified by reflection test
- [x] ItemService.create() returns categoryName != null when item has a category
- [x] ItemService.update() returns categoryName != null when item has a category
- [x] FIX-01 threat T-01-03 mitigated: @Transactional ensures both DB writes commit or rollback atomically
- [x] FIX-05 threat T-01-04 mitigated: categoryName resolved from authorized data source

## TDD Gate Compliance

The plan is `type: tdd`. Gate sequence validation:

| Gate | Commit | Status |
|------|--------|--------|
| RED (FIX-01) | `36411b9` — `test(...)` | Verification test (feature pre-existing; see deviation) |
| RED (FIX-05) | `b4978de` — `test(...)` | Confirmed: 2 tests failed as expected |
| GREEN (FIX-05) | `8d8a708` — `fix(...)` | Confirmed: all 15 ItemServiceTest + all backend tests pass |

FIX-01 has no separate GREEN commit because the feature was already implemented — only the verification test was added. This is a valid TDD outcome under the fail-fast rule.

## Threat Flags

None. Both STRIDE threats from the plan's threat model (T-01-03, T-01-04) are addressed by the implemented mitigations. No new threat surface introduced.

## Known Stubs

None.
