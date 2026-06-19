# Bug Patterns Catalog

**Generated:** 2026-06-18
**Updated:** 2026-06-19 — added JPA schema gap pattern (CR-04) and filter ordering pattern (CR-05)
**Source:** Phase 1 Code Review (01-REVIEW.md), Codebase Concerns (CONCERNS.md), Railway deploy failures
**Purpose:** Catalog of all findings from Phase 1 code review, organized by pattern category, with root causes, fixes, and prevention strategies.

---

## Pattern 1: Transactional Integrity (CR-01 / FIX-01)

**Severity:** Critical
**Pattern:** Multi-write service methods missing `@Transactional` annotation.

**Root cause:** Service methods that write to multiple tables assume each `repository.save()` happens atomically, but Spring Data JPA auto-commits each call independently. Without `@Transactional`, partial failures leave the database in an inconsistent state.

**Affected file:** `backend/src/main/kotlin/com/shareshelf/borrow/BorrowService.kt:22`

**Fix approach:**
- Add `@Transactional` to any service method that performs 2+ write operations
- Verify with a reflection test: `method.isAnnotationPresent(Transactional::class.java)`
- Already fixed upstream (commit `6cda9b2`); verified via test in plan 01-03

**Prevention strategy:** Audit all service `create`/`update`/`delete` methods for multi-write patterns. Make `@Transactional` mandatory on any method that calls `repository.save()` more than once.

## Pattern 2: Data Visibility — Missing User Scoping (CR-02 / FIX-02)

**Severity:** Critical
**Pattern:** Filter logic that doesn't scope data to the authenticated user, exposing all users' data.

**Root cause:** Filter predicates use truthy checks (`r.borrowerId`) instead of identity comparisons (`r.borrowerId === currentUserId`). Every entity has a non-null foreign key, so `filter(r => r.borrowerId)` matches ALL records.

**Affected file:** `frontend/src/app/borrow/page.tsx:59-61`

**Fix approach:**
- Import `getUser()` from auth lib, get current user at component top
- Change filter to strict equality: `r.borrowerId === user?.id` / `r.ownerId === user?.id`
- Already fixed; verified via tests in plan 01-05

**Prevention strategy:** For any data-fetching component, assert in tests that filters include the current user's ID. Add "other-user data should not appear" test case.

## Pattern 3: CORS Configuration (CR-03 / FIX-03)

**Severity:** Critical (blocked production deployment)
**Pattern:** Hardcoded allowed origins that only work in local development.

**Root cause:** `CorsConfig.kt` hardcodes `http://localhost:3000`. Production deploys to Vercel (different domain), so browser CORS preflight fails.

**Affected file:** `backend/src/main/kotlin/com/shareshelf/config/CorsConfig.kt:16`

**Fix approach:**
- Make `allowedOrigins` configurable via `app.cors.allowed-origins` env var (comma-separated)
- Set production domain in `application-railway.yml`
- Fixed upstream; no Phase 1 plan needed

**Prevention strategy:** Never hardcode URLs in config classes. Always read from `@Value` with sensible dev defaults.

## Pattern 4: Exception Handling in Filter Chain (WR-01 / FIX-04)

**Severity:** Warning
**Pattern:** Exceptions in Spring Security filter chain escape `doFilterInternal` without calling `filterChain.doFilter()`, breaking the filter chain.

**Root cause:** The JWT filter calls `userDetailsService.loadUserById()` which throws `UsernameNotFoundException` for deleted users. This exception bypasses `GlobalExceptionHandler` (which only covers controllers) and reaches the servlet container, returning a 500 instead of a graceful 401.

**Affected file:** `backend/src/main/kotlin/com/shareshelf/auth/JwtAuthenticationFilter.kt:24-44`

**Fix approach:**
- Wrap all filter authentication logic in `try-catch`
- On any exception: clear `SecurityContextHolder`, log the error
- ALWAYS call `filterChain.doFilter()` in both success and failure paths
- Fixed in plan 01-04

**Prevention strategy:** Any `OncePerRequestFilter` implementation must have exception handling that guarantees `filterChain.doFilter()` is called.

## Pattern 5: Response Consistency (WR-02 / FIX-05)

**Severity:** Warning
**Pattern:** Different methods in the same service return differently-constructed responses — some resolve related data, others leave fields null.

**Root cause:** `ItemService.toResponse()` hardcoded `categoryName = null` while `findAll()` and `findById()` manually constructed responses with resolved category names. The shared helper method was incomplete.

**Affected file:** `backend/src/main/kotlin/com/shareshelf/item/ItemService.kt:130-133`

**Fix approach:**
- Inject `CategoryRepository` into ItemService
- Change `toResponse()` from `item.category?.name` (JPA relationship) to `categoryRepository.findById(item.categoryId)` (explicit lookup)
- Fixed in plan 01-03

**Prevention strategy:** All response-construction methods (especially shared helpers like `toResponse()`) should resolve ALL fields. Test every field in the response DTO.

## Pattern 6: Error Silencing — Empty Catch Blocks (WR-03 / FIX-06)

**Severity:** Warning
**Pattern:** `.catch(() => {})` with empty body silently swallows API errors, leaving users with no feedback.

**Root cause:** Optimistic UI updates in `handleAction` fire before the server responds. If the server rejects the action, the catch block does nothing — the user sees the optimistic success state permanently even though the operation failed.

**Affected files:**
- `frontend/src/app/borrow/page.tsx:36` (fetch error)
- `frontend/src/app/borrow/page.tsx:54` (action error)

**Fix approach:**
- Add error state variables (`error`, `actionError`)
- Set error messages in catch blocks: `setError("Failed to load borrow requests. Please try again.")`
- Render error banners: `<div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">`
- Auto-dismiss action errors after 5 seconds via `setTimeout` in `useEffect`
- Fixed in plan 01-05

**Prevention strategy:** Every `.catch()` must set a user-facing error state. Audit all catch blocks — no empty handlers allowed.

## Pattern 7: Hardcoded Reference Data (WR-04 / FIX-07)

**Severity:** Warning
**Pattern:** Frontend forms use hardcoded arrays for dropdown options instead of fetching from the API.

**Root cause:** Category dropdown in items/new form used a hardcoded string array with index-based IDs. Backend categories could diverge, causing incorrect categoryId assignments.

**Affected file:** `frontend/src/app/items/new/page.tsx:85-86`

**Fix approach:**
- Fetch categories from `api.get("/categories")` in `useEffect`
- Add loading state (`categoriesLoading`), error state, and empty state
- Populate select options from API response
- Fixed in plan 01-06

**Prevention strategy:** All reference data (categories, statuses, enum values) must come from the API, never hardcoded. If a value is hardcoded, there must be a comment explaining why it cannot be server-driven.

## Pattern 8: Render-Time Side Effects (WR-05 / FIX-08)

**Severity:** Warning
**Pattern:** `router.push()` called during React component render phase instead of inside `useEffect`.

**Root cause:** Auth guard checks call `router.push("/login")` at the top of the function body (render phase). This causes potential hydration mismatches, flash-of-unauthenticated-content, and React warnings.

**Affected files:**
- `frontend/src/app/login/page.tsx`
- `frontend/src/app/register/page.tsx`
- `frontend/src/app/items/new/page.tsx`
- `frontend/src/app/profile/page.tsx`

**Fix approach:**
- Move all auth redirects into `useEffect` hooks
- Check `typeof window !== "undefined" && isAuthenticated()` inside the effect
- Fixed in plan 01-06

**Prevention strategy:** Never call `router.push()` or any navigation function during render. All navigation side effects must be in `useEffect` or event handlers.

## Pattern 9: Unsafe Null Handling (WR-06 / FIX-09)

**Severity:** Warning
**Pattern:** `!!` force-unwrap on nullable entity ID fields (`id: Long?`), risking uninformative NPEs.

**Root cause:** Kotlin JPA entities declare `id: Long? = null` (nullable until persisted). Code that uses `user.id!!` assumes the entity is always persisted, but this isn't guaranteed at compile time.

**Affected files:**
- `backend/src/main/kotlin/com/shareshelf/auth/AuthService.kt` (9 locations)
- `backend/src/main/kotlin/com/shareshelf/auth/CustomUserDetailsService.kt` (1 location)

**Fix approach:**
- Replace all `!!` with `?: throw IllegalStateException("descriptive message")`
- Message includes context: `"User was saved but no ID was generated"`, `"User entity has no ID assigned"`
- Fixed in plan 01-04

**Prevention strategy:** Zero tolerance for `!!` on nullable fields. Use `?: throw` with descriptive messages. Grep for `!!` as a CI check.

## Pattern 10: JPA Schema Gap — Missing @Version Column (CR-04)

**Severity:** Critical (blocks Railway startup)
**Pattern:** JPA entity has `@Version` field for optimistic locking, but the Flyway migration that creates the table (or a subsequent migration) never added the corresponding database column.

**Root cause:** When `Item.kt` gained `@Version var version: Long? = null` (for JPA optimistic locking), no Flyway migration was written to add the column to the existing `items` table. Hibernate `ddl-auto: validate` detects the mismatch between the entity mapping and the actual database schema, and aborts Spring Boot startup before `/api/health` can respond.

**Affected file:** `backend/src/main/kotlin/com/shareshelf/item/entity/Item.kt:47-48`

**Fix approach:**
- Create a new Flyway migration that adds the missing column:
  ```sql
  ALTER TABLE items ADD COLUMN version BIGINT NOT NULL DEFAULT 0;
  ```
- Fixed in commit `0a16cad` (V9__add_items_version.sql)

**Prevention strategy:** Whenever adding `@Version`, `@Column`, or any new JPA-mapped field to an entity, always write a corresponding Flyway migration. Run `ddl-auto: validate` locally (not `update`) to catch these gaps before pushing.

## Pattern 11: Security Filter Chain Ordering (CR-05)

**Severity:** Critical (blocks Railway startup)
**Pattern:** `addFilterBefore(X, Y::class.java)` is called before `Y` has been added to the Spring Security filter chain, causing `BeanInstantiationException: The Filter class Y does not have a registered order`.

**Root cause:** In `SecurityConfig.kt`, the `rateLimitFilter` was configured to be placed before `JwtAuthenticationFilter` via `.addFilterBefore(rateLimitFilter, JwtAuthenticationFilter::class.java)`, but `JwtAuthenticationFilter` hadn't been added to the chain yet (its `.addFilterBefore` call came on the next line). Spring Security validates filter ordering eagerly when building the `SecurityFilterChain` bean from the Kotlin DSL — it can't position a filter relative to another filter that isn't yet part of the chain.

**Affected file:** `backend/src/main/kotlin/com/shareshelf/config/SecurityConfig.kt:46-47`

**Fix approach:**
- Register `jwtAuthenticationFilter` in the chain FIRST
- THEN place `rateLimitFilter` before it
- Fixed in commit `d21355e`:
  ```kotlin
  // Correct order:
  .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter::class.java)
  .addFilterBefore(rateLimitFilter, JwtAuthenticationFilter::class.java)
  ```

**Prevention strategy:** When using `addFilterBefore(X, Y)` with a custom filter `Y`, always ensure `Y`'s own `addFilterBefore` call appears above `X`'s. The referenced filter must already be part of the chain. Spring Security builds the chain sequentially through the DSL.
