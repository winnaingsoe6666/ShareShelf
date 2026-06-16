---
name: test-generator
description: Generate TDD-first test suites for ShareShelf backend (JUnit 5 + MockK) and frontend (Vitest + RTL) code.
---

# Test Generator

## Purpose
Generate comprehensive test suites for ShareShelf using Test-Driven Development principles. Write failing tests first, then implement.

## Instructions
1. Identify the target: ask the user which file or component to test, or inspect the current git diff for untested changes.
2. Read the target source file thoroughly — understand every method, parameter, return type, and dependency.
3. Determine test type based on the file:

### Backend Service Tests (`@Service` classes)
- Create at `backend/src/test/kotlin/com/shareshelf/{module}/{ServiceName}Test.kt`
- Use `@ExtendWith(MockKExtension::class)` for unit tests
- Mock all collaborators with `@Mockk` or `mockk<T>()`
- Test pattern:
  ```kotlin
  @ExtendWith(MockKExtension::class)
  class ItemServiceTest {
      @Mockk
      private lateinit var itemRepository: ItemRepository

      @InjectMockks
      private lateinit var itemService: ItemService

      @Test
      fun `should create item with valid data`() {
          // Given
          val request = CreateItemRequest(name = "Drill", dailyPrice = 5.0)
          val user = User(id = 1L, email = "test@test.com")
          every { itemRepository.save(any()) } returns Item(id = 1L, name = "Drill")

          // When
          val result = itemService.create(request, user)

          // Then
          assertEquals("Drill", result.name)
          verify(exactly = 1) { itemRepository.save(any()) }
      }
  }
  ```

### Backend Controller Tests (`@RestController` classes)
- Create at `backend/src/test/kotlin/com/shareshelf/{module}/{ControllerName}Test.kt`
- Use `@WebMvcTest` with `@MockkBean` for dependencies
- Test every endpoint variant: 200, 201, 400, 401, 403, 404, 409
- Use `mockMvc.perform()` with MockMvcRequestBuilders
- Test pattern:
  ```kotlin
  @WebMvcTest(ItemController::class)
  class ItemControllerTest {
      @MockkBean
      private lateinit var itemService: ItemService

      @Autowired
      private lateinit var mockMvc: MockMvc

      @Test
      @WithMockUser
      fun `GET api/items should return 200 with items list`() {
          every { itemService.findAll(any()) } returns listOf(mockItem())

          mockMvc.perform(get("/api/items"))
              .andExpect(status().isOk)
              .andExpect(jsonPath("$.success").value(true))
              .andExpect(jsonPath("$.data").isArray)
      }
  }
  ```

### Backend Repository Tests (`JpaRepository` interfaces)
- Create at `backend/src/test/kotlin/com/shareshelf/{module}/{RepositoryName}Test.kt`
- Use `@DataJpaTest` with `@Testcontainers` for PostgreSQL or H2 fallback
- Test custom `@Query` methods with real data

### Frontend Component Tests
- Create colocated: `frontend/src/components/__tests__/{ComponentName}.test.tsx`
- Use Vitest + React Testing Library
- Test pattern:
  ```tsx
  import { render, screen, fireEvent, waitFor } from '@testing-library/react'
  import { describe, it, expect, vi } from 'vitest'

  describe('LoginForm', () => {
      it('should show validation errors for empty fields', async () => {
          render(<LoginForm />)
          fireEvent.click(screen.getByRole('button', { name: /login/i }))
          await waitFor(() => {
              expect(screen.getByText(/email is required/i)).toBeInTheDocument()
          })
      })

      it('should call API on valid submit', async () => {
          vi.mock('@/lib/api', () => ({ post: vi.fn().mockResolvedValue({ data: { success: true } }) }))
          render(<LoginForm />)
          // fill form, submit, assert navigation
      })
  })
  ```

### Frontend Page Tests
- Test full page renders, API calls, loading/error/empty states
- Mock `useRouter` from `next/navigation`
- Mock Axios for API responses

## ShareShelf Test Scenarios (must cover)

### Auth
- Register with valid data → 201
- Register with duplicate email → 409
- Register with missing fields → 400 with field-level errors
- Login with valid credentials → 200 with JWT
- Login with wrong password → 401
- Access protected endpoint without token → 401
- Access protected endpoint with expired token → 401

### Items
- Create item (authenticated) → 201
- Create item (unauthenticated) → 401
- Update item as owner → 200
- Update item as non-owner → 403
- Update BORROWED item → 409
- Delete item as owner → 204
- Delete item as non-owner → 403
- Search items by keyword and category → 200

### Borrow Requests (state machine)
- Create borrow on AVAILABLE item → PENDING, item becomes BORROWED
- Create duplicate borrow on same item → 409
- Owner approves PENDING → APPROVED
- Owner rejects PENDING → REJECTED, item returns to AVAILABLE
- Non-owner tries to approve → 403
- Borrower returns APPROVED → RETURNED, item becomes AVAILABLE
- Non-borrower tries to return → 403

### Reviews & Trust Score
- Submit review on RETURNED borrow → 201
- Submit review on non-RETURNED borrow → 409
- Trust score recalculates after review
- Cannot review same borrow twice → 409

## Rules
1. Write tests BEFORE implementation code if doing TDD.
2. Cover happy path AND every unhappy path (errors, edge cases, auth failures).
3. Use descriptive test names in backtick format: \`should [expected behavior] when [condition]\`
4. Use MockK `slot<T>()` to capture arguments when needed for assertions.
5. Use `verify(exactly = N)` for critical method calls — never `verifyAll` or `confirmVerified`.
6. Never skip tests with `@Disabled` except for known issues with a TODO comment.
