# Testing Patterns

**Analysis Date:** 2026-06-13

## Current State: No Tests Exist

The entire project has **zero** test files. This is a critical gap.

### Backend

- `backend/src/test/` directory exists (empty `kotlin/` subtree) but contains no test classes
- `build.gradle.kts` declares test dependencies (lines 59-62), but no tests use them:
  ```kotlin
  testImplementation("org.springframework.boot:spring-boot-starter-test")
  testImplementation("org.springframework.security:spring-security-test")
  testImplementation("io.mockk:mockk:1.13.14")
  testImplementation("com.ninja-squad:springmockk:4.0.2")
  ```
- The Gradle `Test` task is configured with `useJUnitPlatform()` (line 76-77), establishing JUnit 5 as the test engine
- No test source files exist under any `src/test/` path

### Frontend

- `package.json` has no test framework dependencies (no Jest, no Vitest, no Playwright, no Cypress)
- No test scripts defined -- only `dev`, `build`, `start`, `lint`
- No test configuration files (`vitest.config.*`, `jest.config.*`, `.playwright/`)
- No `__tests__/` directories or `.test.*`/`.spec.*` files exist
- The only test files found are inside `node_modules/next/dist/` (Next.js internal tests, not project tests)

### What Test Dependencies Do Exist

| Dependency | Version | Present | Notes |
|------------|---------|---------|-------|
| `spring-boot-starter-test` | (managed by Spring Boot) | Yes | Provides JUnit 5, Mockito, AssertJ, Hamcrest |
| `spring-security-test` | (managed by Spring Boot) | Yes | Test utilities for Spring Security |
| `mockk` | 1.13.14 | Yes | Kotlin mocking library |
| `springmockk` | 4.0.2 | Yes | MockK Spring Boot integration |
| Jest | - | No | Not in frontend dependencies |
| Vitest | - | No | Not in frontend dependencies |
| React Testing Library | - | No | Not in frontend dependencies |

**Test dependencies are backend-only.** The frontend has none.

## Recommended Testing Approach (Ralpha Loop / TDD)

Given the absence of tests and the project's architecture (Spring Boot backend + Next.js/React frontend), the following test stack is recommended:

### Backend: JUnit 5 + Mockito + Spring Boot Test

The dependencies are already in place. Tests should follow this structure:

**Directory Conventions:**
```
backend/src/test/kotlin/com/shareshelf/
  item/
    ItemServiceTest.kt
    ItemControllerTest.kt
  auth/
    AuthServiceTest.kt
    AuthControllerTest.kt
  borrow/
    BorrowServiceTest.kt
  common/
    ApiResponseTest.kt
```

**Unit Test Pattern (Service Layer with MockK):**

```kotlin
// backend/src/test/kotlin/com/shareshelf/item/ItemServiceTest.kt
package com.shareshelf.item

import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import java.util.Optional

class ItemServiceTest {

    private val itemRepository = mockk<ItemRepository>()
    private val userRepository = mockk<UserRepository>()
    private val categoryRepository = mockk<CategoryRepository>()
    private val objectMapper = mockk<ObjectMapper>()

    private val itemService = ItemService(
        itemRepository, userRepository, categoryRepository, objectMapper
    )

    @Test
    fun `findById should return ItemResponse when item exists`() {
        // Arrange
        val itemId = 1L
        val item = Item(id = itemId, ownerId = 10L, title = "Drill", status = "available")
        every { itemRepository.findById(itemId) } returns Optional.of(item)
        // Mock user lookup ...

        // Act
        val response = itemService.findById(itemId)

        // Assert
        assertEquals(itemId, response.id)
        assertEquals("Drill", response.title)
        verify { itemRepository.findById(itemId) }
    }

    @Test
    fun `findById should throw when item does not exist`() {
        val itemId = 999L
        every { itemRepository.findById(itemId) } returns Optional.empty()

        assertThrows<EntityNotFoundException> {
            itemService.findById(itemId)
        }
    }
}
```

**Integration Test Pattern (SpringBootTest with WebMvcTest):**

```kotlin
// backend/src/test/kotlin/com/shareshelf/item/ItemControllerTest.kt
@WebMvcTest(ItemController::class)
class ItemControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockkBean
    private lateinit var itemService: ItemService

    @Test
    fun `GET api/items should return list of items`() {
        every { itemService.findAll(any(), any(), any()) } returns listOf(/* ... */)

        mockMvc.perform(get("/api/items"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
    }
}
```

**What to Test (Prioritized):**

1. **Service unit tests** (highest priority) -- `ItemService`, `AuthService`, `BorrowService`, `ReviewService`
   - Test each public method with valid inputs
   - Test each exception path (missing entity, invalid state, unauthorized access)
   - Mock all repository dependencies

2. **Controller integration tests** -- verify request mapping, validation, response structure
   - Use `@WebMvcTest` with `@MockkBean` to mock services
   - Test `@Valid` annotation rejection of invalid payloads
   - Test `@AuthenticationPrincipal` injection

3. **Repository tests** (lower priority) -- verify custom queries
   - Use `@DataJpaTest` with in-memory database
   - Test `search()`, custom finders

4. **GlobalExceptionHandler tests** -- verify error response structure

### Frontend: Vitest + React Testing Library

The frontend needs a test framework added. Vitest is recommended over Jest because it integrates natively with Vite (which Next.js uses under the hood for transpilation) and provides faster execution.

**Configuration to Add to `package.json`:**
```json
{
  "devDependencies": {
    "vitest": "^3.0.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/user-event": "^14.0.0",
    "jsdom": "^25.0.0"
  },
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

**vitest.config.ts (to create at frontend root):**
```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

**Test setup file (`frontend/src/test/setup.ts`):**
```typescript
import "@testing-library/jest-dom";
```

**Directory Conventions:**
```
frontend/src/
  components/ui/__tests__/
    Button.test.tsx
    Input.test.tsx
    Modal.test.tsx
  components/items/__tests__/
    ItemCard.test.tsx
  lib/__tests__/
    utils.test.ts
```

**Component Test Pattern:**

```typescript
// frontend/src/components/ui/__tests__/Button.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Button from "../Button";

describe("Button", () => {
  it("renders children text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("fires onClick when clicked", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByText("Click"));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("shows spinner when loading", () => {
    render(<Button loading>Submit</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
    // Spinner SVG element should be present
    const button = screen.getByRole("button");
    expect(button.querySelector("svg")).toBeInTheDocument();
  });

  it("applies variant classes", () => {
    const { rerender } = render(<Button variant="danger">Delete</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-red-600");
  });
});
```

**Utility Test Pattern:**
```typescript
// frontend/src/lib/__tests__/utils.test.ts
import { describe, it, expect } from "vitest";
import { formatPrice, formatDate, cn } from "../utils";

describe("formatPrice", () => {
  it("formats number as currency", () => {
    expect(formatPrice(10)).toBe("$10.00");
    expect(formatPrice(0.5)).toBe("$0.50");
  });

  it("returns 'Free' for null/undefined", () => {
    expect(formatPrice(null)).toBe("Free");
    expect(formatPrice(undefined)).toBe("Free");
  });
});

describe("cn", () => {
  it("joins truthy classes", () => {
    expect(cn("a", false && "b", "c")).toBe("a c");
  });
});
```

**What to Test on Frontend (Prioritized):**

1. **Utility functions** -- pure functions in `lib/utils.ts` (highest ROI, simplest)
2. **UI components** -- `Button`, `Input`, `Badge`, `Card`, `Modal`, `Spinner` (test render, props, interactions)
3. **Auth lib** -- `lib/auth.ts` (test localStorage operations, parsing)
4. **Page components** (lower priority) -- integration tests with mocked API

### E2E: Playwright or Cypress

For end-to-end testing, either Playwright or Cypress should be added. Playwright is slightly preferred for speed and cross-browser support.

```bash
npm install -D @playwright/test
npx playwright install
```

**Key E2E Flows to Cover:**
1. User registration -> login -> browse items
2. Create a new item listing
3. Request to borrow an item
4. Approve and return a borrow
5. Leave a review

**Test Commands to Add:**
```json
{
  "scripts": {
    "test:e2e": "playwright test"
  }
}
```

## Run Commands (Once Implemented)

**Backend:**
```bash
cd backend
./gradlew test                    # Run all backend tests
./gradlew test --tests "*ItemService*"  # Run specific test class
./gradlew test --continuous       # Watch mode (Gradle 4.10+)
```

**Frontend:**
```bash
cd frontend
npx vitest run                    # Run all frontend tests
npx vitest                        # Watch mode
npx vitest run --coverage         # With coverage
```

**E2E:**
```bash
cd frontend
npx playwright test               # Run all E2E tests
npx playwright test --ui          # Interactive UI mode
```

---

*Testing analysis: 2026-06-13*
