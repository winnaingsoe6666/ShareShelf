# Codebase Concerns

**Analysis Date:** 2026-06-13

## Tech Debt

### CR-01: Borrow creation lacks @Transactional — item/borrow state can desynchronize

**Issue:** `BorrowService.create()` (line 22) performs two writes — saving the `BorrowRequest` entity, then setting item status to `"borrowed"` and saving the item — but the method is not annotated with `@Transactional`. Each `save()` executes in its own auto-committed transaction. If the item status update (second write) fails, the borrow request remains committed and the item stays `"available"`.

**Files:** `backend/src/main/kotlin/com/shareshelf/borrow/BorrowService.kt:22`

**Impact:** Data corruption — borrow requests can be stranded in `"pending"` while the item stays `"available"`, enabling double-borrow conflicts.

**Fix approach:** Add `@Transactional` to `BorrowService.create()`. Note that `approve()`, `reject()`, and `markReturned()` already have `@Transactional`.

### CR-02: Borrow page tab filter does not distinguish borrowed vs lent items

**Issue:** The tab filter at `borrow/page.tsx:59-61` filters by `r.borrowerId` (always present and non-zero) and `r.ownerId` (always present and non-zero). Every `BorrowRequest` has both fields, so both tabs display every request in the system. The current user's ID is never consulted.

**Files:** `frontend/src/app/borrow/page.tsx:59-61`

**Impact:** Users see all borrow requests for all users, including transactions they are not involved in. The "Items I'm Borrowing" and "Items I'm Lending" tabs show identical content.

**Fix approach:** Compare against the logged-in user's ID: `r.borrowerId === user?.id` for borrowed tab, `r.ownerId === user?.id` for lent tab.

### CR-03: CORS hardcoded to localhost:3000 — blocks production deployment

**Issue:** `CorsConfig.kt:16` hardcodes `allowedOrigins = listOf("http://localhost:3000")`. The production architecture uses Vercel for the frontend (see `vercel.json`) proxying to Railway, but the Vercel deployment domain is not in the allowed origins. The browser's CORS check rejects all cross-origin requests from production.

**Files:** `backend/src/main/kotlin/com/shareshelf/config/CorsConfig.kt:16`, `frontend/vercel.json`

**Impact:** Production deployment is non-functional. All API calls from Vercel to Railway will be rejected by the browser.

**Fix approach:** Make `allowedOrigins` configurable via `app.cors.allowed-origins` environment variable. Set the Vercel domain in production profile.

### WR-01: JWT filter swallows exceptions — returns 500 instead of 401 for deleted-user tokens

**Issue:** `JwtAuthenticationFilter.kt:33` calls `userDetailsService.loadUserById(userId)` which throws `UsernameNotFoundException` when the user has been deleted. This exception propagates out of `doFilterInternal` without calling `filterChain.doFilter()`, bypassing the `GlobalExceptionHandler` (which only covers controllers). The servlet container returns a raw 500.

**Files:** `backend/src/main/kotlin/com/shareshelf/auth/JwtAuthenticationFilter.kt:24-44`

**Impact:** Users with deleted accounts holding unexpired JWTs get 500 errors on every request instead of a clean 401.

**Fix approach:** Wrap the authentication logic in a try-catch, clear `SecurityContextHolder`, and always call `filterChain.doFilter()`.

### WR-02: categoryName hardcoded to null in create/update item responses

**Issue:** The `ItemService.toResponse()` helper at line 130 hardcodes `categoryName = null`. Both `create()` and `update()` call this method. Meanwhile `findAll()` and `findById()` manually construct responses and correctly resolve the category name from the database.

**Files:** `backend/src/main/kotlin/com/shareshelf/item/ItemService.kt:130`

**Impact:** Newly created or updated items report `categoryName: null` in the API response, forcing callers to make a second request to see the category name. No data is lost (`categoryId` is correct), but responses are inconsistent.

**Fix approach:** Resolve the category name inside `toResponse()` via `categoryRepository.findById()`.

### WR-03: Empty catch blocks silently swallow API errors in borrow page

**Issue:** Two `.catch(() => {})` handlers at `borrow/page.tsx:36` and `borrow/page.tsx:54` suppress all errors. The initial borrow list fetch error at line 36 leaves the user with a loading spinner or empty list and no explanation. The action handler at line 54 optimistically updates UI state before the server responds, so if the server rejects the operation, the user sees success but the state is wrong.

**Files:** `frontend/src/app/borrow/page.tsx:36,54`

**Impact:** Network failures, server errors, or business logic rejections go unreported. The optimistically-updated state can show a request as "approved" when the server actually returned an error.

**Fix approach:** Add error logging and user-facing error states. Revert optimistic updates on failure.

### WR-04: Hardcoded category options in new-item form

**Issue:** The category dropdown at `items/new/page.tsx:85-86` is populated with a hardcoded array: `["Tools", "Electronics", "Outdoor & Camping", "Sports & Fitness", "Kitchen & Dining", "Gardening"]`. The backend serves categories via `GET /api/categories`, and the browse page (`items/page.tsx`) correctly fetches from the API. The new-item form does not.

**Files:** `frontend/src/app/items/new/page.tsx:85-86`

**Impact:** If backend categories change (renamed, added, removed), the dropdown silently diverges. The hardcoded IDs (index + 1) can produce incorrect category associations.

**Fix approach:** Fetch categories from `/api/categories` and populate the dropdown dynamically, matching the pattern in `items/page.tsx`.

### WR-05: Auth redirects called during render instead of useEffect

**Issue:** Pages `borrow/page.tsx:30-32`, `items/new/page.tsx:21-24`, and `profile/page.tsx:21-23` call `router.push("/login")` during the component render phase (not inside a `useEffect`). In Next.js client components, this can cause state updates on unmounted components and potential hydration mismatches. The `items/new/page.tsx` route also has an early `return null` that can trigger on initial SSR.

**Files:**
- `frontend/src/app/borrow/page.tsx:30-32`
- `frontend/src/app/items/new/page.tsx:21-24`
- `frontend/src/app/profile/page.tsx:21-23`

**Impact:** Potential React warnings, flash-of-unauthenticated-content, and in rare cases redirect loops.

**Fix approach:** Move all auth redirects into `useEffect` blocks.

### WR-06: Unsafe !! assertions on nullable entity IDs

**Issue:** Multiple locations force-unwrap nullable entity IDs with `!!`. If `user.id` is null (e.g., entity not yet persisted, deserialized object), this throws a `NullPointerException`. `CustomUserDetailsService.UserPrincipal.getId()` at line 29 also uses `!!`.

**Files:**
- `backend/src/main/kotlin/com/shareshelf/auth/AuthService.kt:35,48,56,62`
- `backend/src/main/kotlin/com/shareshelf/auth/CustomUserDetailsService.kt:29`

**Impact:** Latent production crash risk. Any code path constructing a `User` or `UserPrincipal` without a fully persisted entity will throw unexpected NPEs.

**Fix approach:** Replace `!!` with `?: throw IllegalStateException("...")` for clear error messages.

### IN-01: Unused repository method `findByItemIdAndBorrowerIdAndStatus`

**Issue:** `BorrowRepository.kt:10` defines an unused query method. Dead code adds maintenance overhead.

**Files:** `backend/src/main/kotlin/com/shareshelf/borrow/BorrowRepository.kt:10`

**Fix approach:** Remove the unused method, or add a comment explaining its intended future use.

### IN-02: Redundant `ownerId()` function in Item entity

**Issue:** `Item.kt:52` defines `fun ownerId() = ownerId`, which is a redundant wrapper around the property getter. Never called anywhere.

**Files:** `backend/src/main/kotlin/com/shareshelf/item/entity/Item.kt:52`

**Fix approach:** Remove the function.

### IN-03: Inconsistent error handling between Login and Register pages

**Issue:** Login page (`login/page.tsx:31`) uses a generic catch that always displays "Invalid email or password". Register page (`register/page.tsx:38-44`) has detailed catch logic that extracts the server error message.

**Files:**
- `frontend/src/app/login/page.tsx:31`
- `frontend/src/app/register/page.tsx:38-44`

**Fix approach:** Make login error handling consistent with register's pattern.

### IN-04: Data class entities with mutable var fields (JPA anti-pattern)

**Issue:** All four JPA entities (`User.kt`, `Item.kt`, `BorrowRequest.kt`, `Review.kt`) are `data class` with `var` properties. Kotlin `data class` derives `equals()`, `hashCode()`, and `toString()` from all constructor properties. For JPA-managed entities, this means:
- Mutating a property changes the entity's hash code, causing issues in `HashSet`/`HashMap`
- Two loads of the same database row may not `equals()` each other
- Lazy-loading proxies can have different field values

This is a well-known JPA anti-pattern, though not currently causing bugs.

**Files:**
- `backend/src/main/kotlin/com/shareshelf/auth/entity/User.kt`
- `backend/src/main/kotlin/com/shareshelf/item/entity/Item.kt`
- `backend/src/main/kotlin/com/shareshelf/borrow/entity/BorrowRequest.kt`
- `backend/src/main/kotlin/com/shareshelf/review/entity/Review.kt`

**Fix approach:** Convert entities to regular classes with `equals()`/`hashCode()` based only on the ID field.

## Known Bugs

### Borrow request approve/reject/return with already-modified state

**Issue:** `BorrowService.approve()` and `BorrowService.reject()` only check `borrow.status` after loading the entity but do not use pessimistic locking. Under concurrent requests, two threads could both load a `"pending"` request and both approve it, or a reject could race ahead of an approve.

**Files:** `backend/src/main/kotlin/com/shareshelf/borrow/BorrowService.kt:79-144`

**Impact:** Race conditions on borrow state transitions. The same request could be approved by two concurrent calls, or approved after being rejected.

**Fix approach:** Add `@Lock(LockModeType.PESSIMISTIC_WRITE)` to the borrow repository's `findById` or use `SELECT ... FOR UPDATE`.

### Response interceptor clears auth on 401 even for unrelated errors

**Issue:** The Axios response interceptor at `api.ts:22-30` treats any 401 response as a token expiry and clears local storage. If a 401 is returned for reasons unrelated to the user's token (e.g., accessing a resource that requires different permissions), the user is logged out unnecessarily.

**Files:** `frontend/src/lib/api.ts:22-30`

**Impact:** False-positive logouts can frustrate users. The interceptor could be made more conservative by only clearing auth for 401s on token-validation endpoints.

## Security Considerations

### JWT secret configuration

**Issue:** The dev default `shareshelf-dev-secret-key-must-be-at-least-256-bits-long-for-hs256` in `application.yml:31` is readable in source code. While this is a dev default, production deployments must override `JWT_SECRET`. The `application-railway.yml` does not set it, so production relies on the environment variable being set correctly.

**Files:** `backend/src/main/resources/application.yml:31`

**Risk:** If the `JWT_SECRET` environment variable is not set in production, the dev default is used, which is publicly known. This would allow anyone to forge valid JWTs.

**Current mitigation:** The environment variable pattern is documented in README. The dev default is clearly labeled as a dev secret.

**Recommendations:** Add a startup validation that rejects weak or default secrets in non-dev profiles. Consider adding a health check that verifies the JWT secret is set.

### Password validation at registration

**Issue:** Minimum password length is enforced at 6 characters (`AuthDtos.kt:17`). This is below modern security recommendations (NIST recommends 8+ characters, OWASP recommends 8+).

**Files:** `backend/src/main/kotlin/com/shareshelf/auth/dto/AuthDtos.kt:17`

**Risk:** Weak passwords make brute-force attacks easier.

**Recommendations:** Increase minimum to 8 characters. Consider adding complexity requirements (uppercase, digit, etc.) or integrating with a password strength library like zxcvbn.

### Missing password confirmation field on registration

**Issue:** The registration form (`register/page.tsx`) has a single password field with no confirmation. The backend does not require or validate a password confirmation.

**Files:** `frontend/src/app/register/page.tsx:65`

**Risk:** Users can accidentally mistype their password during registration with no way to detect the error, resulting in a locked account.

### Rate limiting absent

**Issue:** No rate limiting is configured anywhere. Authentication endpoints (`/api/auth/login`, `/api/auth/register`) are publicly accessible and could be brute-forced.

**Files:** `backend/src/main/kotlin/com/shareshelf/config/SecurityConfig.kt` (no rate limiting)

**Risk:** Unbounded brute-force attacks on login and registration endpoints.

**Recommendations:** Add Spring Boot's `bucket4j` or Spring Cloud Gateway rate limiting, or use a reverse proxy-level rate limiter. Apply strict limits to `/api/auth/login` (e.g., 5 attempts per minute per IP).

### Input validation completeness

**Issue:** `CreateItemRequest` has no minimum or maximum constraints on `dailyPrice` or `depositAmount`. Negative prices are accepted and stored. `UpdateItemRequest` has no validation annotations at all — every field is optional and unchecked.

**Files:**
- `backend/src/main/kotlin/com/shareshelf/item/dto/ItemDtos.kt:22-28`

**Risk:** Clients could create items with negative prices or absurdly large values, potentially causing display issues or numeric overflow.

### No CSRF protection on authenticated endpoints

**Issue:** `SecurityConfig.kt:25` disables CSRF protection entirely with `.csrf { it.disable() }`. While this is common for stateless JWT APIs, it means any XSS vulnerability in the frontend would allow attackers to perform state-changing actions on behalf of authenticated users.

**Files:** `backend/src/main/kotlin/com/shareshelf/config/SecurityConfig.kt:25`

**Risk:** If an XSS vulnerability is discovered in the frontend, all API endpoints become exploitable without CSRF tokens.

## Performance Bottlenecks

### N+1 query pattern in BorrowService.findByUser()

**Issue:** `BorrowService.findByUser()` (line 52) fetches a list of borrows, then for each borrow issues individual `findById` calls to `itemRepository`, `userRepository` (twice), and again in the `toResponse()` helper. For a user with 20 borrows, this results in roughly 80+ separate database queries.

**Files:** `backend/src/main/kotlin/com/shareshelf/borrow/BorrowService.kt:52-76`

**Impact:** Page load time scales linearly with the number of borrows. For users with many transactions, the borrow page will be noticeably slow.

**Improvement path:** Use `@EntityGraph` on `BorrowRepository` to eagerly fetch item and user associations, or batch-load all referenced entities with a single query using `IN` clauses.

### N+1 query pattern in ReviewService.findByUser()

**Issue:** `ReviewService.findByUser()` at line 57 maps reviews via `toResponse()`, which issues individual `userRepository.findById()` calls for each review. Same pattern as `BorrowService`.

**Files:** `backend/src/main/kotlin/com/shareshelf/review/ReviewService.kt:56-58`

**Improvement path:** Batch fetch all referenced users with a single query.

## Fragile Areas

### JwtAuthenticationFilter with unguarded exceptions

**Files:** `backend/src/main/kotlin/com/shareshelf/auth/JwtAuthenticationFilter.kt:24-44`

**Why fragile:** Any exception thrown during token validation or user loading propagates uncaught to the servlet container, returning a 500 instead of a graceful 401. The filter has zero error handling for `JwtTokenProvider`, `CustomUserDetailsService`, or any unexpected runtime exceptions.

**Test coverage:** None.

**Safe modification:** Always wrap the authentication logic in try-catch. Always call `filterChain.doFilter()` in both success and failure paths.

### Empty catch blocks in borrow page

**Files:** `frontend/src/app/borrow/page.tsx:36,54`

**Why fragile:** The empty `.catch(() => {})` blocks mean the app has no way to report failures. Users see stale or incorrect UI with no indication that something went wrong. The optimistic update in `handleAction` creates an especially dangerous disconnect between UI state and server state.

**Test coverage:** None.

### !! force-unwraps on nullable entity IDs

**Files:**
- `backend/src/main/kotlin/com/shareshelf/auth/AuthService.kt:35,48,56,62`
- `backend/src/main/kotlin/com/shareshelf/auth/CustomUserDetailsService.kt:29`

**Why fragile:** A `NullPointerException` is the most uninformative failure mode in Kotlin. Any future code path that constructs a `User` without a persisted entity (e.g., unit tests, deserialization from a cache, copy constructors) will crash without a clear error.

## Missing Critical Features

### Photo upload (local filesystem)

**Problem:** The README lists photo upload as unimplemented. The `application.yml` contains an `app.upload-dir: uploads` configuration, suggesting it was planned. No upload endpoint exists. The `Item.imageUrls` field is stored as a JSON string but there is no way to upload actual images.

**Files:** `backend/src/main/resources/application.yml:36`, `backend/src/main/kotlin/com/shareshelf/item/entity/Item.kt:34-35`

**Blocks:** Users cannot attach photos to item listings. The frontend renders an image placeholder (SVG icon) on item detail pages.

### Image support in frontend

**Problem:** Even the placeholder infrastructure for images is incomplete. The item detail page (`items/[id]/page.tsx:69-77`) has an `img` tag that references `item.imageUrls[0]`, but since there is no upload flow, the array is always empty.

### Deployment configuration refinement

**Problem:** While `vercel.json` and `application-railway.yml` exist, the CORS configuration is hardcoded to localhost (CR-03), meaning the production deployment is non-functional. No production-appropriate JWT secret validation exists.

## Test Coverage Gaps

### Zero test coverage across entire project

**What's not tested:** No test files exist anywhere in the project. Zero unit tests, zero integration tests, zero E2E tests.

**Files:** Entire source tree under `backend/src/` and `frontend/src/`

**Risk:** Every bug listed in this document was found through manual code review. There are no automated safety nets. Any refactoring or feature addition risks regressions that will go undetected until production. The most critical untested areas are:

| Area | Risk |
|------|------|
| `BorrowService.create()` | Transactional integrity (CR-01) |
| `BorrowService.approve/reject/markReturned` | State transition correctness, race conditions |
| `JwtAuthenticationFilter` | Auth bypass, error response format (WR-01) |
| `ItemService.toResponse()` | Response consistency (WR-02) |
| Borrow page tab filter | Data visibility (CR-02) |
| Auth guard redirects | Navigation correctness (WR-05) |
| `AuthService.register/login` | Registration/login flow |

**Priority:** High — no testing infrastructure exists at all. This is the single largest quality gap in the project.

---

*Concerns audit: 2026-06-13*
