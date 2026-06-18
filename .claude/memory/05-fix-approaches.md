# Fix Approaches

**Generated:** 2026-06-18
**Source:** Actual fix patterns used in Phase 1 plans 01-03 through 01-06
**Purpose:** Reference for applying the same fix patterns in future phases or when similar bugs are discovered.

---

## TDD Cycle (Standard Fix Pattern)

Every bug is fixed using this 3-gate cycle:

```
1. RED    — Write a failing test that proves the bug exists
2. GREEN  — Write the minimum code to make the test pass
3. COMMIT — Conventional commit: test(...) for RED, fix(...) or feat(...) for GREEN
```

### Pre-Existing Fix (Fail-Fast Rule)

If the fix is already present when you start:
1. Write a verification test that confirms the fix is in place
2. Document as "pre-existing fix" in the plan summary
3. No code change needed

Example: FIX-01 (`@Transactional`) was already applied — added a reflection test to verify.

### Conventional Commit Messages

```
test(01-XX): <description of failing test>

fix(01-XX): <description of fix that makes tests pass>
```

---

## Fix Pattern 1: Missing @Transactional

**When to use:** Service method writes to 2+ tables without an enclosing transaction.

**RED test:**
```kotlin
@Test
fun `create method is annotated with Transactional`() {
    val method = BorrowService::class.java.getMethod("create", CreateBorrowRequest::class.java, Long::class.java)
    assertTrue(method.isAnnotationPresent(Transactional::class.java))
}
```

**GREEN fix:**
```kotlin
@Transactional
fun create(request: CreateBorrowRequest, borrowerId: Long): BorrowResponse {
    // ... existing method body
}
```

**Verification:** Reflection test passes. Integration: both writes succeed or both roll back.

---

## Fix Pattern 2: Data Visibility — User Scoping

**When to use:** Filter/predicate exposes data from all users instead of scoping to current user.

**RED test:**
```typescript
it("borrowed tab shows only requests where borrowerId matches current user", () => {
    (getUser as ReturnType<typeof vi.fn>).mockReturnValue({ id: 1, name: "Me" });
    render(<BorrowPage />);
    // Verify other user's requests are NOT in the DOM
});
```

**GREEN fix:**
```typescript
const user = getUser();
const filtered = tab === "borrowed"
  ? requests.filter((r) => r.borrowerId === user?.id)
  : requests.filter((r) => r.ownerId === user?.id);
```

---

## Fix Pattern 3: Exception Handling in Filters

**When to use:** Spring Security filter can throw exceptions that bypass GlobalExceptionHandler.

**GREEN fix (no RED needed — security code is hard to unit-test in isolation):**
```kotlin
override fun doFilterInternal(
    request: HttpServletRequest,
    response: HttpServletResponse,
    filterChain: FilterChain
) {
    try {
        // ... authentication logic ...
    } catch (ex: Exception) {
        SecurityContextHolder.clearContext()
    }
    filterChain.doFilter(request, response)  // <-- ALWAYS called
}
```

**Key rule:** `filterChain.doFilter()` must be reachable on every code path.

---

## Fix Pattern 4: Response Field Resolution

**When to use:** Response construction helper leaves fields null when related data exists.

**RED test:**
```kotlin
@Test
fun `create should return categoryName from category repository`() {
    every { categoryRepository.findById(1L) } returns Optional.of(Category(1L, "Tools"))
    val response = itemService.create(request, ownerId)
    assertEquals("Tools", response.categoryName)
}
```

**GREEN fix:**
```kotlin
// Before: categoryName = item.category?.name  (JPA relationship, null in tests)
// After: explicit repository lookup
private fun toResponse(item: Item, ...): ItemResponse {
    val category = item.categoryId?.let { categoryRepository.findById(it).orElse(null) }
    return ItemResponse(
        // ...
        categoryName = category?.name,
    )
}
```

**Design choice:** Use `repository.findById()` over JPA `@ManyToOne` relationship for testability. Repository lookups can be mocked in unit tests; JPA lazy loading cannot.

---

## Fix Pattern 5: Error Silencing — Empty Catch Blocks

**When to use:** `.catch(() => {})` with empty body silently swallows errors.

**RED test:**
```typescript
it("shows error banner when initial fetch fails", async () => {
    (api.get as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Network error"));
    render(<BorrowPage />);
    await waitFor(() => {
        expect(screen.getByText(/failed to load/i)).toBeTruthy();
    });
});
```

**GREEN fix:**
```typescript
const [error, setError] = useState("");
const [actionError, setActionError] = useState("");

// In fetch:
.catch(() => setError("Failed to load borrow requests. Please try again."));

// In action:
.catch(() => setActionError(`Failed to ${action} request. Please try again.`));

// In JSX (between tab bar and content):
{error && (
    <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
)}

// Auto-dismiss action errors:
useEffect(() => {
    if (actionError) {
        const timer = setTimeout(() => setActionError(""), 5000);
        return () => clearTimeout(timer);
    }
}, [actionError]);
```

---

## Fix Pattern 6: Hardcoded Data → API Fetch

**When to use:** Frontend uses hardcoded array/object for data that exists in the backend API.

**RED test:**
```typescript
it("fetches categories from API on mount", async () => {
    const mockCategories = [{ id: 1, name: "Tools" }, { id: 2, name: "Electronics" }];
    (api.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { data: mockCategories } });
    render(<NewItemPage />);
    await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith("/categories");
    });
});
```

**GREEN fix:**
```typescript
const [categories, setCategories] = useState<Category[]>([]);
const [categoriesLoading, setCategoriesLoading] = useState(true);
const [categoriesError, setCategoriesError] = useState("");

useEffect(() => {
    api.get("/categories")
        .then((res) => setCategories(res.data.data ?? []))
        .catch(() => setCategoriesError("Failed to load categories"))
        .finally(() => setCategoriesLoading(false));
}, []);

// In JSX:
{categoriesLoading && <Spinner />}
{categoriesError && <div className="...">{categoriesError}</div>}
{!categoriesLoading && !categoriesError && categories.length === 0 && <EmptyState />}
{!categoriesLoading && categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
```

---

## Fix Pattern 7: Render-Time Redirect → useEffect

**When to use:** `router.push()` called during component render phase.

**GREEN fix:**
```typescript
// ❌ Before: called during render
if (!isAuthenticated()) {
    router.push("/login");
    return null;
}

// ✅ After: called in useEffect
useEffect(() => {
    if (typeof window !== "undefined" && !isAuthenticated()) {
        router.push("/login");
    }
}, [router]);
```

---

## Fix Pattern 8: Unsafe `!!` → Safe Null Handling

**When to use:** `!!` force-unwrap on nullable entity field.

```kotlin
// ❌ Before
val token = jwtTokenProvider.generateToken(savedUser.id!!, savedUser.email)

// ✅ After
val userId = savedUser.id ?: throw IllegalStateException("User was saved but no ID was generated")
val token = jwtTokenProvider.generateToken(userId, savedUser.email)
```

**Rule:** Every `?: throw IllegalStateException(...)` message must include enough context to identify the call site in logs.

---

## Preferred Patterns to Carry Forward

| Pattern | Example |
|---------|---------|
| ApiResponse wrapper | All endpoints return `ResponseEntity<ApiResponse<T>>` |
| GlobalExceptionHandler | Map exceptions → HTTP status codes centrally |
| useEffect for side effects | Never `router.push()` during render |
| Safe null handling | `?: throw IllegalStateException(...)` never `!!` |
| @Transactional on multi-write | Any method with 2+ `repository.save()` calls |
| Error banners | `<div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">` |
| Auto-dismiss errors | `setTimeout` in `useEffect` with cleanup |
| API-driven reference data | Fetch categories, statuses, etc. from API endpoints |
| Label-input association | `htmlFor`/`id` pairing on every form input with a label |

---

## Audit Checklist for Future Phases

When encountering a new bug, check against these patterns first:

- [ ] Is there a missing `@Transactional` on a multi-write operation?
- [ ] Does filter logic scope to the current user's ID?
- [ ] Are catch blocks setting user-facing error states?
- [ ] Is reference data fetched from the API or hardcoded?
- [ ] Are navigation calls inside `useEffect` (not render phase)?
- [ ] Are there any `!!` on nullable fields?
- [ ] Are response DTO fields all populated (no null where data exists)?
- [ ] Do filter chain methods always call `filterChain.doFilter()`?
