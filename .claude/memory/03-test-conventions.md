# Test Conventions

**Generated:** 2026-06-18
**Source:** Phase 1 plans 01-01 through 01-06 (actual test patterns used)
**Purpose:** Reference for writing tests in any phase. Follow these patterns to stay consistent with the established codebase.

---

## General Principles

- **TDD-first:** Write a failing test BEFORE implementation code. RED commit → GREEN commit.
- **Behavior-driven:** Test what the code does, not how it does it. Prefer `expect(result).toEqual(...)` over `verify(mock).someInternalCall()`.
- **Test all states:** Loading, error, empty, success, and edge cases for every component/page.
- **Accessibility-first queries:** Prefer `getByLabelText`, `getByRole`, `getByText` over `getByTestId`.

---

## Backend: JUnit 5 + MockK

### Configuration
```kotlin
// build.gradle.kts (already configured)
testImplementation("io.mockk:mockk:1.13.14")
testImplementation("com.ninja-squad:springmockk:4.0.2")
```

Run: `cd backend && ./gradlew test`

### Directory Convention
```
backend/src/test/kotlin/com/shareshelf/
  {module}/
    {ClassName}Test.kt
```
Mirror the main source tree exactly.

### Service Test Pattern

```kotlin
package com.shareshelf.{module}

import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import io.mockk.slot
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.Assertions.*
import java.util.Optional

class ItemServiceTest {
    // 1. Mock all dependencies
    private val itemRepository = mockk<ItemRepository>()
    private val userRepository = mockk<UserRepository>()
    private val categoryRepository = mockk<CategoryRepository>()

    // 2. Construct subject with mocked deps (no Spring context)
    private val itemService = ItemService(itemRepository, userRepository, categoryRepository)

    // 3. Test naming: backtick-enclosed descriptive names
    @Test
    fun `findById should return ItemResponse when item exists`() {
        // Arrange
        val itemId = 1L
        val item = Item(id = itemId, ownerId = 10L, title = "Drill", status = "available")
        every { itemRepository.findById(itemId) } returns Optional.of(item)
        every { userRepository.findById(10L) } returns Optional.of(mockUser)

        // Act
        val response = itemService.findById(itemId)

        // Assert
        assertEquals(itemId, response.id)
        assertEquals("Drill", response.title)
        verify { itemRepository.findById(itemId) }
    }

    @Test
    fun `findById should throw EntityNotFoundException when item does not exist`() {
        every { itemRepository.findById(999L) } returns Optional.empty()
        assertThrows<EntityNotFoundException> { itemService.findById(999L) }
    }
}
```

### MockK Patterns

| Operation | Syntax |
|-----------|--------|
| Mock creation | `mockk<RepositoryType>()` |
| Stub return | `every { repo.method(args) } returns value` |
| Stub throws | `every { repo.method(args) } throws Exception()` |
| Optional stub | `every { repo.findById(id) } returns Optional.of(entity)` |
| Verify call | `verify { repo.method(args) }` |
| Verify exact count | `verify(exactly = 1) { repo.save(any()) }` |
| Capture argument | `val slot = slot<Entity>(); every { repo.save(capture(slot)) } returns ...` |
| Relaxed mock | `mockk<Type>(relaxed = true)` — returns defaults for unstubbed calls |

### Testing Patterns for Specific Scenarios

**Reflection-based annotation verification:**
```kotlin
@Test
fun `method is annotated with Transactional`() {
    val method = BorrowService::class.java.getMethod("create", CreateBorrowRequest::class.java, Long::class.java)
    assertTrue(method.isAnnotationPresent(Transactional::class.java))
}
```

**GlobalExceptionHandler testing:**
```kotlin
@Test
fun `should return 404 for EntityNotFoundException`() {
    val exception = EntityNotFoundException("Item not found")
    val response = handler.handleEntityNotFoundException(exception)
    assertEquals(404, response.statusCode.value())
    assertEquals(false, response.body?.success)
}
```

**Controller testing (when added):**
```kotlin
@WebMvcTest(ItemController::class)
class ItemControllerTest {
    @Autowired private lateinit var mockMvc: MockMvc
    @MockkBean private lateinit var itemService: ItemService

    @Test
    fun `GET api-items should return 200 with item list`() {
        every { itemService.findAll(any(), any(), any()) } returns listOf(...)
        mockMvc.perform(get("/api/items"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
    }
}
```

---

## Frontend: Vitest + React Testing Library

### Configuration
```typescript
// vitest.config.ts — already configured
export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
    include: ["src/**/*.test.{ts,tsx}"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
```

Run: `cd frontend && npx vitest run`

### Directory Convention
```
frontend/src/
  components/ui/__tests__/
    Button.test.tsx        — tests for Button.tsx
    Input.test.tsx         — tests for Input.tsx
  app/login/__tests__/
    page.test.tsx          — tests for login/page.tsx
  lib/__tests__/
    auth.test.ts           — tests for auth.ts
```
Colocate `__tests__/` directory alongside the source file.

### Component Test Pattern

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Button from "../Button";

describe("Button", () => {
  it("renders children text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeTruthy();
  });

  it("fires onClick when clicked", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={handleClick}>Click</Button>);
    await user.click(screen.getByText("Click"));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("disables button and shows spinner when loading", () => {
    render(<Button loading>Submit</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button.querySelector("svg")).toBeTruthy();
  });

  it("applies variant classes", () => {
    render(<Button variant="danger">Delete</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-red-600");
  });
});
```

### Page Test Pattern

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "../page";

// Mock external dependencies BEFORE importing the mocked modules
const mockPush = vi.fn();

vi.mock("@/lib/api", () => ({ default: { get: vi.fn(), post: vi.fn() } }));
vi.mock("@/lib/auth", () => ({
  isAuthenticated: vi.fn(() => false),
  saveAuth: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: mockPush })),
}));

import api from "@/lib/api";
import { isAuthenticated, saveAuth } from "@/lib/auth";

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockReset();
  });

  // Render test
  it("renders login form when not authenticated", () => {
    render(<LoginPage />);
    expect(screen.getByText("Welcome back")).toBeTruthy();
  });

  // Auth redirect test
  it("redirects when already authenticated", async () => {
    (isAuthenticated as ReturnType<typeof vi.fn>).mockReturnValue(true);
    render(<LoginPage />);
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/items"));
  });

  // Error state test (must fill required fields!)
  it("shows error on failed login", async () => {
    const user = userEvent.setup();
    (api.post as ReturnType<typeof vi.fn>).mockRejectedValue({ response: { status: 401 } });
    render(<LoginPage />);
    await user.type(screen.getByLabelText("Email"), "test@test.com");
    await user.type(screen.getByLabelText("Password"), "wrong");
    await user.click(screen.getByText("Sign In"));
    await waitFor(() => expect(screen.getByText(/invalid email/i)).toBeTruthy());
  });

  // Success path test
  it("calls saveAuth and navigates on success", async () => {
    const user = userEvent.setup();
    (api.post as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { success: true, data: { token: "t", userId: 1, name: "T", email: "t@t" } },
    });
    render(<LoginPage />);
    await user.type(screen.getByLabelText("Email"), "test@test.com");
    await user.type(screen.getByLabelText("Password"), "Password1");
    await user.click(screen.getByText("Sign In"));
    await waitFor(() => {
      expect(saveAuth).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/items");
    });
  });
});
```

### Critical Pitfall: HTML5 Form Validation

**`@testing-library/user-event` v14+ uses `form.requestSubmit()` which triggers HTML5 validation.** Required fields that are empty will block form submission silently. Always fill required fields with `user.type()` before clicking submit.

```typescript
// ❌ WRONG — form validation blocks submit
await user.click(screen.getByText("Submit"));

// ✅ RIGHT — fill required fields first
await user.type(screen.getByLabelText("Email"), "test@test.com");
await user.type(screen.getByLabelText("Password"), "Password1");
await user.click(screen.getByText("Submit"));
```

This requires labels to be properly associated with inputs (`htmlFor` + `id`).

### Mock Patterns

| What | Pattern |
|------|---------|
| API module | `vi.mock("@/lib/api", () => ({ default: { get: vi.fn(), post: vi.fn(), put: vi.fn() } }))` |
| Auth module | `vi.mock("@/lib/auth", () => ({ isAuthenticated: vi.fn(), saveAuth: vi.fn(), getUser: vi.fn(), clearAuth: vi.fn() }))` |
| Next navigation | `vi.mock("next/navigation", () => ({ useRouter: vi.fn(() => ({ push: mockPush })) }))` |
| Mock resolved value | `(api.post as ReturnType<typeof vi.fn>).mockResolvedValue({ data: {...} })` |
| Mock rejected value | `(api.post as ReturnType<typeof vi.fn>).mockRejectedValue({ response: { status: 401 } })` |
| Change mock per test | `(isAuthenticated as ReturnType<typeof vi.fn>).mockReturnValue(true)` |

### Query Priority

1. `getByLabelText("Email")` — must have `htmlFor`/`id` pairing on label+input
2. `getByRole("button", { name: "Submit" })` — accessible, preferred
3. `getByText("Welcome back")` — for visible text content
4. `getByPlaceholderText("e.g. Downtown")` — when placeholder exists
5. `container.querySelector(".some-class")` — last resort only

**Important:** Always add `htmlFor`/`id` to labels and inputs so `getByLabelText` works. Without it, label queries are broken.

---

## Test Infrastructure

### Frontend Setup
- `vitest.config.ts` — jsdom environment, globals, `@/` alias, `setupFiles`
- `src/test/setup.ts` — imports `@testing-library/jest-dom/vitest` for custom matchers
- `package-lock.json` — committed for reproducible installs

### Backend Setup
- `build.gradle.kts` — MockK, SpringMockK already configured
- Test runner: JUnit 5 via `useJUnitPlatform()`

---

## Test Coverage Summary (Phase 1)

| Domain | Test Files | Tests | Framework |
|--------|-----------|-------|-----------|
| UI Components (Button, Input, Card, Badge, Modal, Spinner) | 6 | 44 | Vitest + RTL |
| Layout (Navbar) | 1 | 6 | Vitest + RTL |
| Pages (login, register, items/new, borrow, profile) | 5 | 31 | Vitest + RTL |
| Lib Utilities (auth, api, utils) | 3 | 24 | Vitest |
| Backend Services (Auth, Item, Borrow, Review) | 4 | 66+ | JUnit 5 + MockK |
| Backend Common (ApiResponse, GlobalExceptionHandler) | 2 | 20 | JUnit 5 + MockK |
| Backend Controllers + Extras | 3 | 17+ | JUnit 5 + MockK |

**Total:** ~23 test files, ~200 tests, all passing.
