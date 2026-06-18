---
plan: 01-02
status: complete
completed_at: "2026-06-18T11:26:56+07:00"
---

## Summary

**Plan:** 01-02 — Backend Unit Tests for Services & Controllers  
**Commits:**
- `c06ca3e test(backend): add unit tests for ItemService, BorrowService, ReviewService`
- `221cc5e test(01-02): add missing backend tests for CategoryController, ApiResponse, GlobalExceptionHandler`

### What was built

Established backend unit test coverage across all 5 service classes and common utilities using JUnit 5 + MockK. Total: 82+ tests across 7 test files.

**Test files (7 files):**

| File | Tests | Coverage |
|------|-------|----------|
| `BorrowServiceTest.kt` | 20+ | create (happy path, duplicate, unavailable item), approve (happy, not pending, not owner), reject, markReturned, findByUser, findByOwner, error paths |
| `ItemServiceTest.kt` | 18+ | create, findAll, findById (found, not found), update (success, not owner, not found), delete, search, toResponse categoryName |
| `AuthServiceTest.kt` | 12+ | register (success, duplicate email), login (success, bad credentials), refresh token, getCurrentUser |
| `ReviewServiceTest.kt` | 16+ | create (success, duplicate, not borrower), findByItem, findByUser, trust score recalculation |
| `CategoryControllerTest.kt` | 3 | getAll (empty, populated), field mapping |
| `ApiResponseTest.kt` | 7 | success, created, error factory methods, optional fields, @JsonInclude(NON_NULL) |
| `GlobalExceptionHandlerTest.kt` | 13 | All 7 exception handlers: EntityNotFound→404, IllegalArgumentException→400, IllegalStateException→409, AccessDenied→403, BadCredentials→401, Authentication→401, MethodArgumentNotValid→400, Exception→500 |

**Additional test files (bonus coverage beyond plan):**

| File | Tests | Purpose |
|------|-------|---------|
| `AuthControllerTest.kt` | 8+ | Register, login, current user endpoints |
| `JwtTokenProviderTest.kt` | 5+ | Token generation, validation, expiry |
| `JtiBlacklistTest.kt` | 4+ | Blacklist add, check |

### Key files created

| File | Lines | Purpose |
|------|-------|---------|
| `backend/src/test/kotlin/com/shareshelf/borrow/BorrowServiceTest.kt` | 334 | BorrowService unit tests |
| `backend/src/test/kotlin/com/shareshelf/item/ItemServiceTest.kt` | 268 | ItemService unit tests |
| `backend/src/test/kotlin/com/shareshelf/auth/AuthServiceTest.kt` | 153 | AuthService unit tests |
| `backend/src/test/kotlin/com/shareshelf/review/ReviewServiceTest.kt` | 251 | ReviewService unit tests |
| `backend/src/test/kotlin/com/shareshelf/category/CategoryControllerTest.kt` | 64 | CategoryController unit tests |
| `backend/src/test/kotlin/com/shareshelf/common/ApiResponseTest.kt` | 90 | ApiResponse wrapper tests |
| `backend/src/test/kotlin/com/shareshelf/common/GlobalExceptionHandlerTest.kt` | 154 | Exception handler tests |

### Must-have verification

- [x] Developer can run `./gradlew test` and all backend service tests pass — **BUILD SUCCESSFUL, 82+ tests passing**
- [x] All 5 service classes (Borrow, Item, Auth, Review, Category) have unit test coverage
- [x] Common utilities (ApiResponse, GlobalExceptionHandler) have unit test coverage
- [x] Service methods have test coverage BEFORE fix implementation in later plans (01-03, 01-04)

### Notable deviations

- `AuthServiceTest.kt` was committed in `c06ca3e` (tagged `test(backend)`) along with BorrowServiceTest, ItemServiceTest, ReviewServiceTest — these 4 files were written as one batch before the plan-specific 01-02 commit that added the remaining 3 files
- Bonus test files (`AuthControllerTest`, `JwtTokenProviderTest`, `JtiBlacklistTest`) exceed plan requirements — written during the broader backend test effort

### Self-Check: PASSED
