# Coding Conventions

**Analysis Date:** 2026-06-13

## Backend: Kotlin / Spring Boot

### Language Features

**Data Classes:**
All entities, DTOs, and API response wrappers are declared as `data class`. Found throughout:

- Entities: `User` (`auth/entity/User.kt`), `Item` (`item/entity/Item.kt`), `BorrowRequest` (`borrow/entity/BorrowRequest.kt`)
- DTOs: `CreateItemRequest`, `UpdateItemRequest`, `ItemResponse` (`item/dto/ItemDtos.kt`)
- API wrapper: `ApiResponse<T>` (`common/ApiResponse.kt`)

**Nullable Types:**
- Database nullable columns use `Type?` (e.g., `val community: String? = null` in `User.kt:22`, `val description: String? = null` in `Item.kt:23`)
- DTO fields that are optional in requests use nullable types (`val description: String? = null` in `CreateItemRequest`)
- Entity IDs use `val id: Long? = null` with auto-generation; non-null asserted via `!!` when used (e.g., `item.id!!` at `ItemService.kt:54`)
- Optional API query parameters use `@RequestParam(required = false)` with nullable types

**Extension Functions:**
No extension functions observed in the codebase. This is a noted absence -- utility operations like `parseJsonArray` are implemented as private methods instead of extensions.

**Property Access:**
- Entity fields exposed directly (no getter/setter wrappers); `var` for mutable columns, `val` for immutable ones
- JPA lifecycle callbacks are methods on the entity class (`@PreUpdate`, `@PrePersist`)

### Controller Conventions

**Annotation Pattern:**
```kotlin
@RestController
@RequestMapping("/api/items")
class ItemController(
    private val itemService: ItemService
) {
```

- Every controller uses `@RestController` with `@RequestMapping` at class level
- Single constructor injection (no `@Autowired`)
- Methods return `ResponseEntity<ApiResponse<T>>` wrapping all responses
- `@AuthenticationPrincipal principal: UserPrincipal` extracts authenticated user from JWT
- `@RequestBody @Valid` for request body validation

**Endpoint Patterns:**
- `@GetMapping` for reads, `@PostMapping` for creates, `@PutMapping` for updates/actions, `@DeleteMapping` for deletes
- Created resources return `ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(...))`
- Successful reads return `ResponseEntity.ok(ApiResponse.success(...))`
- AuthController (`auth/AuthController.kt`) checks `response.success` inline to determine HTTP status

### Service Layer Patterns

**Dependency Injection:**
```kotlin
@Service
class ItemService(
    private val itemRepository: ItemRepository,
    private val userRepository: UserRepository,
    private val categoryRepository: CategoryRepository,
    private val objectMapper: ObjectMapper
) {
```

- Every service uses `@Service` annotation
- Constructor injection via `private val` parameters (Spring Boot idiomatic Kotlin)
- Dependencies are repository interfaces, utility beans, or other services
- No setter injection or field injection observed

**Transactional Methods:**
- `@Transactional` applied on write operations (`update`, `delete`, `create` in `BorrowService`)
- Applied at method level, not class level
- Read operations (`findAll`, `findById`) are non-transactional

**Error Throwing:**
- `EntityNotFoundException` for missing resources
- `IllegalStateException` for invalid state transitions
- `IllegalArgumentException` for invalid inputs
- `AccessDeniedException` (fully qualified: `org.springframework.security.access.AccessDeniedException`) for authorization failures

### Repository Conventions

```kotlin
interface ItemRepository : JpaRepository<Item, Long> {
    fun findByOwnerId(ownerId: Long): List<Item>
    fun findByStatus(status: String): List<Item>

    @Query(...)
    fun search(...): List<Item>
}
```

- All repositories extend `JpaRepository<Entity, IdType>` 
- No `@Repository` annotation (redundant with Spring Data JPA)
- Query methods use Spring Data JPA naming conventions (`findByOwnerId`, `findByEmail`, `existsByEmail`)
- Custom queries use `@Query` with JPQL and `@Param` annotations
- Return types are either `List<T>`, `T?`, or `Boolean`

### DTO Patterns

**Request DTOs:**
```kotlin
data class CreateItemRequest(
    @field:NotBlank(message = "Title is required")
    @field:Size(max = 200)
    val title: String,

    val description: String? = null,
    val categoryId: Long? = null,
    val dailyPrice: BigDecimal? = null
)
```

- Defined as `data class` in dedicated `dto/` subdirectory
- `@field:` validation annotation syntax (required for Kotlin)
- Optional fields have nullable types with `= null` defaults
- All request DTOs have the field being validated

**Response DTOs:**
- Also `data class` with all `val` properties (immutable)
- Contain computed/joined fields (e.g., `ownerName` in `ItemResponse`)
- No validation annotations (output only)

### API Response Wrapper

```kotlin
@JsonInclude(JsonInclude.Include.NON_NULL)
data class ApiResponse<T>(
    val success: Boolean,
    val message: String? = null,
    val data: T? = null,
    val errors: List<String>? = null
) {
    companion object {
        fun <T> success(data: T, message: String? = null): ApiResponse<T>
        fun <T> created(data: T): ApiResponse<T>
        fun <T> error(message: String, errors: List<String>? = null): ApiResponse<T>
    }
}
```

- Standardized wrapper in `common/ApiResponse.kt`
- `@JsonInclude(NON_NULL)` ensures null fields are omitted from JSON
- Factory methods in companion object

### Error Handling

**GlobalExceptionHandler** (`common/GlobalExceptionHandler.kt`):
- `@RestControllerAdvice` class
- Separate `@ExceptionHandler` methods for: `EntityNotFoundException` (404), `IllegalArgumentException` (400), `IllegalStateException` (409), `AccessDeniedException` (403), `MethodArgumentNotValidException` (400 with field errors), general `Exception` (500)
- All return `ResponseEntity<ApiResponse<Unit>>`

**Inconsistency:**
- AuthService returns `ApiResponse` directly from service layer instead of throwing exceptions and letting the GlobalExceptionHandler handle them. This means success/failure logic is in the controller (`AuthController.kt:20-25`), unlike other controllers that always succeed at the controller level. This is a mixed approach.

### Import Organization

**Kotlin Files:**
1. `package` declaration
2. Blank line
3. Import statements grouped by type (not explicitly grouped by blank lines, but roughly follows: standard library, jakarta, Spring, project-specific)
4. Blank line before class declaration

Example from `ItemService.kt`:
```kotlin
package com.shareshelf.item

import com.fasterxml.jackson.databind.ObjectMapper
import com.shareshelf.auth.entity.UserRepository
import com.shareshelf.category.CategoryRepository
import com.shareshelf.item.dto.CreateItemRequest
import com.shareshelf.item.dto.ItemResponse
import com.shareshelf.item.dto.UpdateItemRequest
import com.shareshelf.item.entity.Item
import jakarta.persistence.EntityNotFoundException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
```

### Naming Conventions

**Backend:**
- Packages: `com.shareshelf.{module}` (e.g., `com.shareshelf.auth`, `com.shareshelf.item`)
- Sub-packages: `entity/`, `dto/` for domain-specific grouping
- Classes: PascalCase (`ItemService`, `AuthController`, `GlobalExceptionHandler`)
- Functions/methods: camelCase (`findAll`, `toResponse`, `parseJsonArray`)
- Properties: camelCase (`dailyPrice`, `depositAmount`)

**Anti-pattern observed:** The `Item` entity has an explicit `fun ownerId() = ownerId` method (line 52) that shadows the `ownerId` property. This is dead code and confusing.

## Frontend: React / Next.js / TypeScript

### Component Patterns

**Functional Components with Named Exports:**
```typescript
export default function Button({ children, variant = "primary", ...props }: ButtonProps) {
```

- All components are default-exported function components
- Props typed via `interface` declared above the component
- Arrow functions not used for component declarations

**"use client" Directive:**
- Interactive/pages that use hooks start with `"use client";` (e.g., all page files in `app/`, UI components like `Modal.tsx`, `Navbar.tsx`)
- Server components (no directive) used for layout: `layout.tsx`, `page.tsx` (homepage is server component)

**Props Typing:**
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}
```

- Interfaces defined locally per component file (colocated)
- Extend native HTML attribute interfaces via `React.ButtonHTMLAttributes` / `React.InputHTMLAttributes`
- Optional props use `?` with defaults in destructuring

**forwardRef Usage:**
- `Input.tsx` uses `forwardRef<HTMLInputElement, InputProps>` to support ref forwarding
- Sets `Input.displayName = "Input"` for dev tools

**State Management:**
- Local `useState` for component-level state
- `useEffect` for data fetching (no React Query / TanStack Query observed)
- No global state management (Redux, Zustand, etc.)
- `localStorage` for auth token persistence (`lib/auth.ts`)

### File Organization

```
frontend/src/
  app/             # Next.js App Router pages
  components/
    ui/            # Reusable UI primitives (Button, Input, Card, Badge, Modal, Spinner)
    items/         # Item-specific components (ItemCard, ItemGrid)
    layout/        # Layout components (Navbar, Footer)
  lib/             # Utilities (api.ts, auth.ts, utils.ts)
  types/           # Shared TypeScript types (index.ts)
```

### Naming Conventions

**Frontend:**
- Files: PascalCase for components (`Button.tsx`, `ItemCard.tsx`), camelCase for utilities (`auth.ts`, `utils.ts`)
- Functions: camelCase (`handleBorrow`, `formatPrice`, `clearAuth`)
- Interfaces: PascalCase (`ButtonProps`, `Item`, `AuthResponse`)
- Types: PascalCase (`BorrowStatus`, `ItemStatus`)

### Import Organization

**Frontend files:**
1. `"use client"` directive (when needed)
2. Blank line
3. React/Next.js imports
4. Component imports (relative with `@/` alias)
5. Library imports
6. Type imports
7. Blank line before component declaration

Example from `items/[id]/page.tsx`:
```typescript
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import api from "@/lib/api";
import { getUser, isAuthenticated } from "@/lib/auth";
import { formatPrice, formatDate } from "@/lib/utils";
import type { Item } from "@/types";
```

### Path Aliases

Configured in `tsconfig.json`:
```json
"paths": { "@/*": ["./src/*"] }
```
All frontend imports use `@/` prefix for project-internal imports.

### API Client

- Axios instance in `lib/api.ts` with interceptors
- Request interceptor injects JWT from `localStorage`
- Response interceptor handles 401 by clearing auth and redirecting to `/login`
- Base URL from `NEXT_PUBLIC_API_URL` environment variable, falls back to `/api`

### Styling

- **Tailwind CSS v4** with `@tailwindcss/postcss`
- Inline Tailwind classes (no styled-components, no CSS modules)
- Consistent color palette: emerald-* for primary actions, stone-* for neutrals
- `className` concatenation pattern: template literals with conditional classes via ternary

### Code Style & Formatting

No linting or formatting configuration detected across the project:
- No `.eslintrc`, `.prettierrc`, `biome.json`, or `.editorconfig`
- No `ktlint` or `detekt` configuration
- No lint scripts in `package.json` beyond `next lint`

## Inconsistencies and Anti-Patterns

### 1. AuthService returns ApiResponse instead of throwing
**File:** `auth/AuthService.kt`
**Issue:** AuthService returns `ApiResponse` directly, requiring the controller to manually check `response.success`. This breaks the pattern used by all other services, which let exceptions propagate to `GlobalExceptionHandler`.
**Impact:** Inconsistent error handling; the 400/401 status must be set manually in the controller.
**Fix:** Make AuthService methods throw exceptions for error cases, letting GlobalExceptionHandler map them to proper HTTP responses.

### 2. Mixed `needs`+service in AuthController
**File:** `auth/AuthController.kt`
**Issue:** AuthController inspects response success inline (`if (response.success)`) rather than letting exceptions drive error handling. Other controllers trust the service to throw on failure.
**Impact:** Inconsistent controller logic pattern.

### 3. Dead `ownerId()` method on Item entity
**File:** `item/entity/Item.kt`, line 52
**Issue:** `fun ownerId() = ownerId` is a getter-like method that shadows the `ownerId` property. It is never called in the codebase. Properties in data classes already expose their values.
**Impact:** Dead code that adds confusion.

### 4. Entity fields as `var` with default values vs JPA
**File:** `item/entity/Item.kt`, `auth/entity/User.kt`, `borrow/entity/BorrowRequest.kt`
**Issue:** Entity fields use mutable `var` with default values (e.g., `var status: String = "available"`). While this works with JPA, it means Hibernate can create entities in invalid intermediate states. Entities use `val` for immutable fields (like `id`, `createdAt`) but `var` for mutable business fields.
**Observation:** Acceptable pattern for Kotlin+JPA but worth noting that no domain invariants are enforced at construction time.

### 5. No test files exist
**Issue:** Zero test files across the entire project. Backend has `src/test/` directory tree but it is empty. Frontend has no test configuration at all. No test scripts in `package.json`.
**Impact:** No regression safety net. See TESTING.md for recommendations.

### 6. Direct `ResponseEntity` construction in some controllers
**Files:** `ItemController.kt` uses `ResponseEntity.status(HttpStatus.CREATED).body(...)` while `AuthController.kt` uses `ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(...)`. The global pattern favors `ResponseEntity.ok(...)` for success and exceptions for errors.
**Issue:** `AuthController` manually creates error responses instead of using `GlobalExceptionHandler`.

### 7. No linting/formatting tooling
**Issue:** No Prettier, ESLint config, ktlint, or detekt present. `tsconfig.json` enables `strict: true` as the only type-checking enforcement.
**Impact:** Code style consistency relies entirely on developer discipline.

---

*Convention analysis: 2026-06-13*
