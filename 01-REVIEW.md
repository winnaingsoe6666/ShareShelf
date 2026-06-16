---
phase: 01-code-review
reviewed: 2026-06-13T12:00:00Z
depth: standard
files_reviewed: 53
files_reviewed_list:
  - backend/src/main/kotlin/com/shareshelf/ShareShelfApplication.kt
  - backend/src/main/kotlin/com/shareshelf/auth/AuthController.kt
  - backend/src/main/kotlin/com/shareshelf/auth/AuthService.kt
  - backend/src/main/kotlin/com/shareshelf/auth/CustomUserDetailsService.kt
  - backend/src/main/kotlin/com/shareshelf/auth/JwtAuthenticationFilter.kt
  - backend/src/main/kotlin/com/shareshelf/auth/JwtTokenProvider.kt
  - backend/src/main/kotlin/com/shareshelf/auth/dto/AuthDtos.kt
  - backend/src/main/kotlin/com/shareshelf/auth/entity/User.kt
  - backend/src/main/kotlin/com/shareshelf/auth/entity/UserRepository.kt
  - backend/src/main/kotlin/com/shareshelf/borrow/BorrowController.kt
  - backend/src/main/kotlin/com/shareshelf/borrow/BorrowRepository.kt
  - backend/src/main/kotlin/com/shareshelf/borrow/BorrowService.kt
  - backend/src/main/kotlin/com/shareshelf/borrow/dto/BorrowDtos.kt
  - backend/src/main/kotlin/com/shareshelf/borrow/entity/BorrowRequest.kt
  - backend/src/main/kotlin/com/shareshelf/category/Category.kt
  - backend/src/main/kotlin/com/shareshelf/category/CategoryController.kt
  - backend/src/main/kotlin/com/shareshelf/category/CategoryRepository.kt
  - backend/src/main/kotlin/com/shareshelf/common/ApiResponse.kt
  - backend/src/main/kotlin/com/shareshelf/common/GlobalExceptionHandler.kt
  - backend/src/main/kotlin/com/shareshelf/common/HealthController.kt
  - backend/src/main/kotlin/com/shareshelf/config/CorsConfig.kt
  - backend/src/main/kotlin/com/shareshelf/config/SecurityConfig.kt
  - backend/src/main/kotlin/com/shareshelf/item/ItemController.kt
  - backend/src/main/kotlin/com/shareshelf/item/ItemRepository.kt
  - backend/src/main/kotlin/com/shareshelf/item/ItemService.kt
  - backend/src/main/kotlin/com/shareshelf/item/dto/ItemDtos.kt
  - backend/src/main/kotlin/com/shareshelf/item/entity/Item.kt
  - backend/src/main/kotlin/com/shareshelf/review/ReviewController.kt
  - backend/src/main/kotlin/com/shareshelf/review/ReviewRepository.kt
  - backend/src/main/kotlin/com/shareshelf/review/ReviewService.kt
  - backend/src/main/kotlin/com/shareshelf/review/dto/ReviewDtos.kt
  - backend/src/main/kotlin/com/shareshelf/review/entity/Review.kt
  - backend/src/main/resources/application.yml
  - backend/src/main/resources/application-dev.yml
  - backend/src/main/resources/application-railway.yml
  - backend/build.gradle.kts
  - frontend/src/app/borrow/page.tsx
  - frontend/src/app/globals.css
  - frontend/src/app/items/[id]/page.tsx
  - frontend/src/app/items/new/page.tsx
  - frontend/src/app/items/page.tsx
  - frontend/src/app/layout.tsx
  - frontend/src/app/login/page.tsx
  - frontend/src/app/page.tsx
  - frontend/src/app/profile/page.tsx
  - frontend/src/app/register/page.tsx
  - frontend/src/components/items/ItemCard.tsx
  - frontend/src/components/items/ItemGrid.tsx
  - frontend/src/components/layout/Footer.tsx
  - frontend/src/components/layout/Navbar.tsx
  - frontend/src/components/ui/Badge.tsx
  - frontend/src/components/ui/Button.tsx
  - frontend/src/components/ui/Card.tsx
  - frontend/src/components/ui/Input.tsx
  - frontend/src/components/ui/Modal.tsx
  - frontend/src/components/ui/Spinner.tsx
  - frontend/src/lib/api.ts
  - frontend/src/lib/auth.ts
  - frontend/src/lib/utils.ts
  - frontend/src/types/index.ts
  - frontend/package.json
  - frontend/next.config.ts
  - frontend/vercel.json
findings:
  critical: 3
  warning: 6
  info: 4
  total: 13
status: issues_found
---

# Phase 1: Code Review Report

**Reviewed:** 2026-06-13T12:00:00Z
**Depth:** standard
**Files Reviewed:** 53
**Status:** issues_found

## Summary

Reviewed the full ShareShelf codebase: a Kotlin/Spring Boot backend with JWT authentication, borrow/return workflows, reviews, and item management; a TypeScript/Next.js frontend; and deployment/build configuration. Found 3 critical issues (data inconsistency, broken UI logic, production deployment blocker), 6 warnings, and 4 informational items. The overall architecture is sound, but several concrete bugs and gaps in transaction safety require attention before shipping.

---

## Critical Issues

### CR-01: Borrow created without transaction -- item and borrow state can desynchronize

**File:** `backend/src/main/kotlin/com/shareshelf/borrow/BorrowService.kt:22`
**Issue:** The `BorrowService.create()` method is not annotated with `@Transactional`. It performs two writes: first saving the `BorrowRequest` entity (line 43), then setting the item status to `"borrowed"` and saving the item (line 46-47). Without a wrapping transaction, each `save()` executes in its own auto-committed transaction. If the item status update (second write) fails, the borrow request is already committed to the database and the item remains marked as `"available"` in a separate committed transaction. Subsequent operations against that borrow request will find it in `"pending"` status but the item is never updated to reflect the borrow.

**Impact:** Data corruption -- borrow requests can be stranded in `"pending"` status while the item stays `"available"`. The item could be borrowed a second time by a different user, leading to double-borrow conflicts.

**Fix:** Add `@Transactional` to the `create` method:

```kotlin
@Transactional
fun create(request: CreateBorrowRequest, borrowerId: Long): BorrowResponse {
    val item = itemRepository.findById(request.itemId)
        .orElseThrow { EntityNotFoundException("Item not found") }
    // ... rest of method unchanged
}
```

---

### CR-02: Borrow page tab filter does not distinguish borrowed vs lent items

**File:** `frontend/src/app/borrow/page.tsx:59-61`
**Issue:** The tab filter logic is broken. The code filters by `r.borrowerId` (a `number` that is always present and non-zero) and `r.ownerId` (also always present and non-zero). Every `BorrowRequest` in the system has both a `borrowerId` and `ownerId`, so both `filter` calls return the full list of requests unaffected by the selected tab. The intent is clearly to show only items where the current user is the borrower (tab="borrowed") vs only items where the current user is the owner (tab="lent"), but the current user's ID is never consulted.

```typescript
const filtered = tab === "borrowed"
  ? requests.filter((r) => r.borrowerId)     // always true for every request
  : requests.filter((r) => r.ownerId);        // always true for every request
```

**Impact:** The "Items I'm Borrowing" and "Items I'm Lending" tabs both display identical content showing all borrow requests in the system. A user sees other people's transactions and can even attempt to approve/reject borrows that do not involve them (though service-layer auth checks prevent actual state changes, the UI is misleading).

**Fix:** Compare against the logged-in user's ID:

```typescript
// Get current user at component top
import { getUser } from "@/lib/auth";
// Inside component:
const user = getUser();

const filtered = tab === "borrowed"
  ? requests.filter((r) => r.borrowerId === user?.id)
  : requests.filter((r) => r.ownerId === user?.id);
```

---

### CR-03: CORS configuration blocks production frontend deployment

**File:** `backend/src/main/kotlin/com/shareshelf/config/CorsConfig.kt:16`
**Issue:** `allowedOrigins` is hardcoded to `listOf("http://localhost:3000")`. The production architecture uses Vercel to host the frontend (see `frontend/vercel.json`) with rewrites proxying `/api/*` to `https://shareshelf-api.up.railway.app`. Modern browsers send an `Origin` header matching the Vercel deployment domain (e.g., `https://shareshelf.vercel.app`) for cross-origin preflight requests. This origin is not in the allowed list, causing the browser CORS check to reject API calls from the production frontend. The API will operate correctly only when the frontend runs on localhost:3000.

**Impact:** The production deployment is broken. All API calls from the deployed Vercel frontend to the Railway backend will be rejected by the browser due to CORS policy. Users will see network errors and the application will be non-functional.

**Fix:** Make allowed origins configurable via an environment variable:

```kotlin
@Configuration
class CorsConfig {

    @Value("\${app.cors.allowed-origins:http://localhost:3000}")
    private lateinit var allowedOrigins: String

    @Bean
    fun corsFilter(): CorsFilter {
        val config = CorsConfiguration().apply {
            allowCredentials = true
            allowedOrigins = allowedOrigins.split(",").map { it.trim() }
            allowedMethods = listOf("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
            allowedHeaders = listOf("*")
            exposedHeaders = listOf("Authorization")
        }
        val source = UrlBasedCorsConfigurationSource().apply {
            registerCorsConfiguration("/**", config)
        }
        return CorsFilter(source)
    }
}
```

Then set `app.cors.allowed-origins` in `application-railway.yml` or via environment variable.

---

## Warnings

### WR-01: JwtAuthenticationFilter throws uncaught exception on deleted-user token, returning 500 instead of 401

**File:** `backend/src/main/kotlin/com/shareshelf/auth/JwtAuthenticationFilter.kt:33`
**Issue:** When a request carries a valid JWT that contains a user ID for a user who has been deleted from the database, `userDetailsService.loadUserById(userId)` throws `UsernameNotFoundException`. This exception propagates out of `doFilterInternal` without calling `filterChain.doFilter()`, and is not caught anywhere before reaching the servlet container. The `GlobalExceptionHandler` catches it only at the controller level, but the filter chain runs before controllers. The result is a 500 Internal Server Error with no meaningful security response, instead of a graceful 401 Unauthorized.

**Impact:** Users whose accounts are deleted but have unexpired JWTs will receive a 500 error on every request, with the raw exception potentially leaking in the response body depending on server configuration. The intended behavior should be to treat the token as invalid and return 401.

**Fix:** Wrap the authentication logic in a try-catch and continue the filter chain without setting authentication:

```kotlin
override fun doFilterInternal(
    request: HttpServletRequest,
    response: HttpServletResponse,
    filterChain: FilterChain
) {
    try {
        val token = extractToken(request)
        if (token != null && jwtTokenProvider.validateToken(token)) {
            val userId = jwtTokenProvider.getUserIdFromToken(token)
            val userDetails = userDetailsService.loadUserById(userId)
            val authentication = UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.authorities
            )
            authentication.details = WebAuthenticationDetailsSource().buildDetails(request)
            SecurityContextHolder.getContext().authentication = authentication
        }
    } catch (ex: Exception) {
        SecurityContextHolder.clearContext()
    }
    filterChain.doFilter(request, response)
}
```

---

### WR-02: `create` and `update` endpoints return `categoryName: null` even when category is set

**File:** `backend/src/main/kotlin/com/shareshelf/item/ItemService.kt:133`
**Issue:** The `toResponse()` helper method hardcodes `categoryName = null` at line 133. Both the `create()` method (line 37) and the `update()` method (line 111) call `toResponse()` to build their return values. By contrast, `findAll()` (lines 53-67) and `findById()` (lines 76-91) manually construct `ItemResponse` objects and correctly resolve the category name from the database. This inconsistency means that when a user creates or updates an item with a specific category, the API response includes a null category name, forcing the caller to make a second request to see the category name.

**Impact:** Confusing API behavior -- newly created/updated items report their category as null, requiring extra client logic to reconcile. No data is lost (the `categoryId` is correct), but responses are inconsistent.

**Fix:** Either resolve the category name inside `toResponse()`:

```kotlin
private fun toResponse(item: Item, ownerName: String, ownerTrustScore: Double): ItemResponse {
    val category = item.categoryId?.let { categoryRepository.findById(it).orElse(null) }
    return ItemResponse(
        id = item.id!!,
        // ... other fields ...
        categoryName = category?.name,
        // ...
    )
}
```

Or remove the `toResponse` method entirely and use the same manual construction pattern used in `findAll` and `findById`.

---

### WR-03: Empty catch blocks in borrow page silently swallow API errors

**File:** 
- `frontend/src/app/borrow/page.tsx:36`
- `frontend/src/app/borrow/page.tsx:54`

**Issue:** Two API calls use `.catch(() => {})` with empty catch bodies. At line 36, the initial borrow list fetch error is completely swallowed -- the user sees a loading spinner indefinitely or an empty list with no explanation. At line 54, the approve/reject/return action errors are silently swallowed -- if the action fails (e.g., network error, auth failure), the UI optimistically updates the state (lines 43-53) and the user sees the success state even though the server rejected the operation.

**Impact:** User experience degradation. Network failures, server errors, or business logic rejections go unreported. The optimistic state update in `handleAction` (line 43-53) can show a request as "approved" when the server actually returned an error, creating a false sense of success.

**Fix:** Add error handling that reports failures to the user:

```typescript
// Line 36
.catch((err) => {
  console.error("Failed to load borrow requests", err);
  // Optionally set an error state
})

// Line 54
.catch((err) => {
  // Revert optimistic update or show error
  console.error("Action failed", err);
})
```

---

### WR-04: New item page hardcodes category options instead of fetching from API

**File:** `frontend/src/app/items/new/page.tsx:85-86`
**Issue:** The category dropdown in the "Create New Item" form is populated with a hardcoded array: `["Tools", "Electronics", "Outdoor & Camping", "Sports & Fitness", "Kitchen & Dining", "Gardening"]`. The backend serves category data via `GET /api/categories` (see `CategoryController.kt`), and the browse items page (`items/page.tsx`) correctly fetches categories from the API. The new item form does not. If the backend categories are modified (renamed, added, removed), the dropdown silently goes out of sync -- users could select a category that maps to the wrong `categoryId`, or miss new categories entirely.

**Impact:** Category selection on item creation is coupled to a hardcoded array that can diverge from the backend. When categories are added to the backend, they are invisible to users creating items. When categories change order, the hardcoded IDs (based on index + 1) can produce incorrect category associations.

**Fix:** Fetch categories via the API and populate the dropdown dynamically, matching the pattern used in `items/page.tsx`:

```typescript
const [categories, setCategories] = useState<Category[]>([]);

useEffect(() => {
  api.get("/api/categories")
    .then((res) => setCategories(res.data.data ?? []))
    .catch(() => {});
}, []);

// In JSX:
<select ...>
  <option value="">Select a category</option>
  {categories.map((cat) => (
    <option key={cat.id} value={cat.id}>{cat.name}</option>
  ))}
</select>
```

---

### WR-05: Auth redirects called during render instead of in useEffect, causing timing issues

**Files:**
- `frontend/src/app/borrow/page.tsx:30-32`
- `frontend/src/app/items/new/page.tsx:21-24`
- `frontend/src/app/profile/page.tsx:21-23`

**Issue:** These pages check `isAuthenticated()` during the component render phase (not inside a `useEffect`) and call `router.push("/login")` if not authenticated. In Next.js client components, calling `router.push` during render can cause unpredictable behavior: the redirect happens before the component commits, potentially triggering state updates on unmounted components or causing the Component to render partially before redirect. The early `return null` at lines 23-24 of `items/new/page.tsx` also means the component could return null on the initial server render (when `window` is undefined and `isAuthenticated()` always returns `false`), causing a hydration mismatch.

The `borrow/page.tsx` and `profile/page.tsx` wrap the check in `typeof window !== "undefined"`, which prevents SSR issues but still performs the redirect during render on the client side.

**Impact:** Potential React warnings about state updates on unmounted components, flash-of-unauthenticated-content, and in rare cases, redirect loops. Not a security issue since API-level auth is enforced, but degrades UX reliability.

**Fix:** Move the redirect into a `useEffect`:

```typescript
useEffect(() => {
  if (typeof window !== "undefined" && !isAuthenticated()) {
    router.push("/login");
  }
}, [router]);
```

---

### WR-06: Multiple uses of non-null assertion (`!!`) on nullable entity ID fields create latent NPE risk

**Files:**
- `backend/src/main/kotlin/com/shareshelf/auth/AuthService.kt:35,48,56,62`
- `backend/src/main/kotlin/com/shareshelf/auth/CustomUserDetailsService.kt:29`

**Issue:** The `User.id` field is declared as `Long?` (nullable) in the entity, but several locations force-unwrap it with `!!`. If `user.id` is null at runtime (e.g., the entity is not yet persisted by JPA, or a deserialized/copied object has a null ID), this will throw a `NullPointerException`. While JPA normally sets the ID after save, there is no compile-time guarantee. The `UserPrincipal.getId()` function at `CustomUserDetailsService.kt:29` similarly uses `!!` on the user ID, which can fail if the `UserPrincipal` is constructed with a detached entity.

**Impact:** Latent production crash risk. If any code path constructs a `User` or `UserPrincipal` without a fully persisted entity (e.g., in testing, deserialization, or future refactoring), these `!!` calls will throw unexpected NPEs instead of failing with a clear error message.

**Fix:** Replace `!!` with safe calls or explicit error handling:

```kotlin
// In UserPrincipal.kt
fun getId() = user.id ?: throw IllegalStateException("User entity has no ID assigned")
```

```kotlin
// In AuthService.kt
val token = jwtTokenProvider.generateToken(
    savedUser.id ?: throw IllegalStateException("User was saved but no ID was generated"),
    savedUser.email
)
```

---

## Info

### IN-01: Unused repository method `findByItemIdAndBorrowerIdAndStatus`

**File:** `backend/src/main/kotlin/com/shareshelf/borrow/BorrowRepository.kt:10`
**Issue:** The method `findByItemIdAndBorrowerIdAndStatus(itemId: Long, borrowerId: Long, status: String): List<BorrowRequest>` is defined but never called anywhere in the codebase. This is dead code that adds maintenance overhead and could mislead future developers into thinking this query is used.

**Recommendation:** Remove the unused method declaration, or add it alongside a comment explaining its intended use case if it is planned for a future feature.

---

### IN-02: Redundant and unused `ownerId()` function in Item entity

**File:** `backend/src/main/kotlin/com/shareshelf/item/entity/Item.kt:52`
**Issue:** The `Item` entity defines `fun ownerId() = ownerId`, which is a function that simply returns the `ownerId` property. In Kotlin, the property already has a generated getter. This function is never called anywhere in the codebase. It adds noise and could confuse developers about whether `item.ownerId` (property) or `item.ownerId()` (function) should be used.

**Recommendation:** Remove the `ownerId()` function from the entity.

---

### IN-03: Inconsistent error handling between Login and Register pages

**Files:**
- `frontend/src/app/login/page.tsx:31`
- `frontend/src/app/register/page.tsx:38-44`

**Issue:** The login page uses a generic `catch` block that always displays `"Invalid email or password"`, discarding any structured error information the server may have returned (e.g., validation errors, account disabled). The register page, by contrast, has detailed catch logic that extracts the server error message. This inconsistency means login errors are less informative than they could be.

**Recommendation:** Make the login error handling consistent with register's pattern:

```typescript
} catch (err: unknown) {
  if (err && typeof err === "object" && "response" in err) {
    const axiosErr = err as { response?: { data?: { message?: string } } };
    setError(axiosErr.response?.data?.message || "Invalid email or password");
  } else {
    setError("Invalid email or password");
  }
}
```

---

### IN-04: Data classes with mutable `var` properties for JPA entities

**Files:**
- `backend/src/main/kotlin/com/shareshelf/auth/entity/User.kt`
- `backend/src/main/kotlin/com/shareshelf/item/entity/Item.kt`
- `backend/src/main/kotlin/com/shareshelf/borrow/entity/BorrowRequest.kt`
- `backend/src/main/kotlin/com/shareshelf/review/entity/Review.kt`

**Issue:** All four JPA entities are declared as Kotlin `data class` with `var` properties. Kotlin `data class` derives `equals()`, `hashCode()`, and `toString()` from all properties in the primary constructor. For JPA-managed entities loaded from the database, this means:
- Two loads of the same database row could produce objects that are `equals()` if all fields match, but are not the same Java identity.
- After a `save()`, the returned entity may not `equals()` the previous entity if the ID was null before save.
- Lazy-loading proxies can have different field values than their unproxied originals.
- Mutating a property changes the entity's hash code, which can cause issues if the entity is in a `HashSet` or `HashMap`.

This is a well-known JPA anti-pattern in Kotlin. While not currently causing bugs, it can lead to subtle issues with collection semantics, change tracking, and proxy handling.

**Recommendation:** Consider converting entities to regular classes with `equals()`/`hashCode()` based only on the ID field (or removing custom equals entirely and relying on JPA's identity management).

---

_Reviewed: 2026-06-13T12:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
