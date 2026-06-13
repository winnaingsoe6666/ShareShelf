<!-- refreshed: 2026-06-13 -->
# Architecture

**Analysis Date:** 2026-06-13

## System Overview

```text
┌──────────────────────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js 14 App Router)                          │
│  ┌──────────────────────────────────────────────────────────────────────────┐    │
│  │  Pages: /login /register  /items  /items/[id]  /items/new  /borrow /profile│   │
│  ├──────────────────────────────────────────────────────────────────────────┤    │
│  │  Components: ui/  layout/  items/  borrow/  auth/                        │    │
│  ├──────────────────────────────────────────────────────────────────────────┤    │
│  │  lib/api.ts (Axios + JWT interceptor)  |  lib/auth.ts (localStorage)     │    │
│  └──────────────────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────┬───────────────────────────────────────────┘
                                       │  HTTP JSON (REST)
                                       │  Authorization: Bearer <JWT>
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                     Backend (Spring Boot 3 + Kotlin 21)                          │
│                                                                                  │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐  ┌────────────────────┐     │
│  │ AuthController│  │ItemController│  │BorrowCtrl    │  │ ReviewController   │     │
│  │ /api/auth     │  │ /api/items   │  │ /api/borrow  │  │ /api/review        │     │
│  └──────┬──────┘  └──────┬───────┘  └──────┬──────┘  └──────┬─────────────┘     │
│         │                │                  │                │                    │
│  ┌──────┴──────┐  ┌──────┴───────┐  ┌──────┴──────┐  ┌──────┴─────────────┐     │
│  │ AuthService  │  │ ItemService  │  │ BorrowService│  │ ReviewService     │     │
│  └──────┬──────┘  └──────┬───────┘  └──────┬──────┘  └──────┬─────────────┘     │
│         │                │                  │                │                    │
│  ┌──────┴──────────────┐ │                  │                │                    │
│  │ JwtTokenProvider     │ │                  │                │                    │
│  │ JwtAuthenticationFtr │ │                  │                │                    │
│  │ CustomUserDetailsSvc │ │                  │                │                    │
│  └─────────────────────┘ │                  │                │                    │
│                          ▼                  ▼                ▼                    │
│  ┌──────────────────────────────────────────────────────────────────────────┐    │
│  │  Repository Layer (JPA / Spring Data)                                    │    │
│  │  UserRepo  ItemRepo  BorrowRepo  CategoryRepo  ReviewRepo               │    │
│  └──────────────────────────────────┬───────────────────────────────────────┘    │
│                                     ▼                                             │
│  ┌──────────────────────────────────────────────────────────────────────────┐    │
│  │  PostgreSQL Database (Flyway-migrated)                                    │    │
│  │  users  categories  items  borrow_requests  reviews                       │    │
│  └──────────────────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| AuthController | Register, login, current user endpoints | `backend/.../auth/AuthController.kt` |
| AuthService | User registration with bcrypt, login authentication, JWT generation | `backend/.../auth/AuthService.kt` |
| JwtTokenProvider | JWT creation, parsing, validation with HMAC-SHA | `backend/.../auth/JwtTokenProvider.kt` |
| JwtAuthenticationFilter | Extract Bearer token, validate, set SecurityContext | `backend/.../auth/JwtAuthenticationFilter.kt` |
| CustomUserDetailsService | Load UserDetails by email or ID for Spring Security | `backend/.../auth/CustomUserDetailsService.kt` |
| SecurityConfig | HTTP security rules, CORS, stateless sessions, filter chain | `backend/.../config/SecurityConfig.kt` |
| CorsConfig | Allow localhost:3000 for development | `backend/.../config/CorsConfig.kt` |
| ItemController | CRUD for items (list, get, create, update, delete) | `backend/.../item/ItemController.kt` |
| ItemService | Item business logic, search, ownership validation | `backend/.../item/ItemService.kt` |
| CategoryController | List categories (read-only) | `backend/.../category/CategoryController.kt` |
| BorrowController | Create/approve/reject/return borrow requests | `backend/.../borrow/BorrowController.kt` |
| BorrowService | Borrow lifecycle, item status transitions | `backend/.../borrow/BorrowService.kt` |
| ReviewController | Create review, list reviews by user | `backend/.../review/ReviewController.kt` |
| ReviewService | Review creation with trust score recalculation | `backend/.../review/ReviewService.kt` |
| ApiResponse | Standardized `{success, message, data, errors}` wrapper | `backend/.../common/ApiResponse.kt` |
| GlobalExceptionHandler | Map exceptions to HTTP status codes with ApiResponse | `backend/.../common/GlobalExceptionHandler.kt` |
| HealthController | Liveness check at `/api/health` | `backend/.../common/HealthController.kt` |
| Axios api client | HTTP client with JWT interceptor and 401 auto-logout | `frontend/src/lib/api.ts` |
| auth.ts lib | localStorage helpers for token and user persistence | `frontend/src/lib/auth.ts` |

## Pattern Overview

**Overall:** Monorepo with separate frontend (Next.js) and backend (Spring Boot) communicating over REST JSON. Backend follows a classic layered architecture: Controller -> Service -> Repository (JPA).

**Key Characteristics:**
- Backend: Package-by-feature organization (`auth/`, `item/`, `borrow/`, `review/`, `category/`, `common/`, `config/`)
- Frontend: Next.js 14 App Router with page-per-route under `src/app/`
- API responses always wrapped in `ApiResponse<T>` for consistency
- Authentication via JWT Bearer tokens in HTTP headers, stateless sessions
- Database migrations via Flyway, schema managed in `db/migration/`
- Frontend uses `"use client"` directives for interactive pages (no server components used)

## Layers

### Frontend Layer:
- Purpose: Browser-side UI rendering with React/Next.js
- Location: `frontend/src/`
- Contains: Pages (app router), components (ui, layout, items), lib (api, auth, utils), types
- Depends on: Backend REST API at `NEXT_PUBLIC_API_URL` (defaults to `/api`)
- Used by: End users in browsers

### Controller Layer:
- Purpose: HTTP request/response handling, route mapping, input validation
- Location: `backend/.../auth/AuthController.kt`, `item/ItemController.kt`, `borrow/BorrowController.kt`, `review/ReviewController.kt`, `category/CategoryController.kt`
- Contains: `@RestController` classes with `@RequestMapping`, `@Valid` for DTO validation
- Depends on: Service classes via constructor injection, DTOs, `ApiResponse`
- Used by: HTTP clients (frontend, curl, mobile apps)

### Service Layer:
- Purpose: Business logic, orchestration, validation, transaction management
- Location: `backend/.../auth/AuthService.kt`, `item/ItemService.kt`, `borrow/BorrowService.kt`, `review/ReviewService.kt`
- Contains: `@Service` classes with injected repositories and other services
- Depends on: Repository interfaces, Entity classes, JWT provider (auth only)
- Used by: Controllers

### Repository Layer:
- Purpose: Data access via Spring Data JPA
- Location: `backend/.../auth/entity/UserRepository.kt`, `item/ItemRepository.kt`, `borrow/BorrowRepository.kt`, `review/ReviewRepository.kt`, `category/CategoryRepository.kt`
- Contains: `interface` extending `JpaRepository<Entity, Long>`, custom `@Query` methods
- Depends on: Entity classes
- Used by: Service classes

### Database Layer:
- Purpose: Persistent storage via PostgreSQL
- Location: `backend/src/main/resources/db/migration/`
- Contains: Flyway migration SQL scripts (V1-V5), seed data for categories
- Depends on: PostgreSQL 15+
- Used by: Repository layer

## Data Flow

### User Registration Flow

1. User submits name, email, password on `/register` page (`frontend/src/app/register/page.tsx`)
2. Axios client posts to `POST /api/auth/register` (`backend/.../auth/AuthController.kt:19`)
3. `AuthService.register()` checks email uniqueness, hashes password with BCrypt, saves `User` entity (`backend/.../auth/AuthService.kt:21-38`)
4. `JwtTokenProvider.generateToken()` creates a JWT with userId subject and email claim (`backend/.../auth/JwtTokenProvider.kt:20-31`)
5. Returns `ApiResponse<AuthResponse>` with JWT token and user profile
6. Frontend calls `saveAuth()` from `auth.ts`, stores token in localStorage and user object (`frontend/src/lib/auth.ts:6-16`)
7. User is redirected to `/items`

### User Login Flow

1. User submits email and password on `/login` page (`frontend/src/app/login/page.tsx`)
2. Axios client posts to `POST /api/auth/login`
3. `AuthService.login()` looks up user by email, verifies password with `passwordEncoder.matches()` (`backend/.../auth/AuthService.kt:40-49`)
4. JWT token generated and returned in `AuthResponse`
5. Frontend saves auth to localStorage, redirects to `/items`

### Authenticated Request Flow (JWT)

1. Axios request interceptor reads `shareshelf_token` from localStorage and sets `Authorization: Bearer <token>` header (`frontend/src/lib/api.ts:9-16`)
2. `JwtAuthenticationFilter.doFilterInternal()` extracts Bearer token from request (`backend/.../auth/JwtAuthenticationFilter.kt:29-43`)
3. Token validated via `JwtTokenProvider.validateToken()` (checks signature and expiry) (`backend/.../auth/JwtTokenProvider.kt:38-44`)
4. `CustomUserDetailsService.loadUserById()` loads user from database and creates `UserPrincipal` (`backend/.../auth/CustomUserDetailsService.kt:21-24`)
5. `UsernamePasswordAuthenticationToken` created and set in `SecurityContextHolder`
6. On 401 response, Axios response interceptor clears localStorage and redirects to `/login` (`frontend/src/lib/api.ts:20-33`)

### Item Creation and Browsing Flow

1. User fills item form on `/items/new` page (`frontend/src/app/items/new/page.tsx`)
2. Posts to `POST /api/items` with title, description, categoryId, prices
3. `ItemController.createItem()` extracts authenticated user via `@AuthenticationPrincipal` (`backend/.../item/ItemController.kt:37-43`)
4. `ItemService.create()` looks up owner user, creates `Item` entity with status="available", saves to DB (`backend/.../item/ItemService.kt:22-38`)
5. Returns `ApiResponse<ItemResponse>` with owner name and trust score
6. Browsing: Frontend calls `GET /api/items` (optionally with search, categoryId, status query params)
7. `ItemService.findAll()` delegates to `ItemRepository.search()` or `findAll()` based on filter presence (`backend/.../item/ItemService.kt:40-68`)
8. Each item response includes ownerName, categoryName, imageUrls resolved from related entities/JSONB

### Borrow Request Lifecycle

1. Borrower clicks "Request to Borrow" on item detail page, sends message in modal (`frontend/src/app/items/[id]/page.tsx:35-53`)
2. `POST /api/borrow` with itemId and message (`backend/.../borrow/BorrowController.kt:20-26`)
3. `BorrowService.create()` validates item is available and not self-owned, sets item status to "borrowed", persists `BorrowRequest` with status="pending" (`backend/.../borrow/BorrowService.kt:22-49`)
4. Owner sees request on `/borrow` page under "Items I'm Lending" tab (`frontend/src/app/borrow/page.tsx`)
5. Owner clicks Approve -> `PUT /api/borrow/{id}/approve` sets status to "approved" (`backend/.../borrow/BorrowService.kt:80-94`)
6. Owner clicks Reject -> `PUT /api/borrow/{id}/reject` sets status to "rejected" and marks item "available" (`backend/.../borrow/BorrowService.kt:97-119`)
7. Owner clicks Mark Returned -> `PUT /api/borrow/{id}/return` sets status to "returned", marks item "available" (`backend/.../borrow/BorrowService.kt:122-144`)
8. State machine: `pending -> approved -> returned` | `pending -> rejected`
9. Frontend optimistically updates local state after each action (`frontend/src/app/borrow/page.tsx:42-52`)

### Review Submission Flow

1. After a borrow is returned, either party can submit a review
2. `POST /api/review` with borrowRequestId, rating (1-5), optional comment (`backend/.../review/ReviewController.kt:19-27`)
3. `ReviewService.create()` validates borrow request exists, status is "returned", reviewer was part of transaction, no duplicate review (`backend/.../review/ReviewService.kt:20-53`)
4. Determines revieweeId (the other party in the transaction)
5. Saves `Review` entity, then calls `updateTrustScore()` which recalculates average rating and updates `User.trustScore` (`backend/.../review/ReviewService.kt:60-67`)
6. Reviews are visible on `/profile` page fetched via `GET /api/review/user/{userId}`

**State Management:**
- Frontend: No global state library. Each page uses React `useState` with local component state. Auth persisted in localStorage via `lib/auth.ts`. API calls made directly from pages via `api.ts`.
- Backend: Stateless. All state lives in PostgreSQL database. Authentication state held in JWT token (not server-side session).

## Key Abstractions

**ApiResponse<T>:**
- Purpose: Standardized JSON wrapper for every API response
- Examples: `backend/.../common/ApiResponse.kt`
- Pattern: Generic data class with `success`, `message`, `data`, `errors` fields. Static factory methods `success()`, `created()`, `error()`.

**UserPrincipal:**
- Purpose: Adapter between `User` entity and Spring Security's `UserDetails`
- Example: `backend/.../auth/CustomUserDetailsService.kt:28-39`
- Pattern: Wraps `User` entity, exposes `getId()`, `getEmail()`, `getName()` via custom methods. Used in `@AuthenticationPrincipal` controller parameters.

**DTOs per feature:**
- Purpose: Separate API contract from entity persistence model
- Examples: `AuthDtos.kt`, `ItemDtos.kt`, `BorrowDtos.kt`, `ReviewDtos.kt`
- Pattern: Each feature package contains a `dto/` sub-package with request/response data classes

**Entity lifecycle callbacks:**
- Purpose: Automatic timestamp management
- Examples: `User.kt:47-50`, `Item.kt:44-50`, `BorrowRequest.kt:40-47`, `Review.kt:30-31`
- Pattern: `@PrePersist` and `@PreUpdate` methods set `createdAt` and `updatedAt` timestamps

## Entry Points

**ShareShelfApplication:**
- Location: `backend/.../ShareShelfApplication.kt`
- Triggers: JVM startup via `gradle bootRun` or `java -jar`
- Responsibilities: Bootstrap Spring Boot context with all auto-configurations, component scanning

**HealthController:**
- Location: `backend/.../common/HealthController.kt`
- Triggers: `GET /api/health` HTTP request
- Responsibilities: Return `{"status": "UP"}` for liveness checks

## Architectural Constraints

- **Threading:** Single-threaded per-request model (Spring Boot default with Tomcat). No explicit coroutines or reactive streams used.
- **Global state:** No module-level singletons or shared mutable state. All service beans are stateless singletons managed by Spring DI.
- **Circular imports:** No circular dependency chains detected. Dependency direction is strict: Controller -> Service -> Repository -> Entity with no back-edges.
- **Frontend routing:** All pages use `"use client"` directive. No React Server Components, no Server Actions. Data fetching happens in `useEffect` hooks.

## Anti-Patterns

### N+1 Query Pattern in Service Layer

**What happens:** In `ItemService.findAll()` and `BorrowService.findByUser()`, the service loops over query results and makes individual `userRepository.findById()` calls for each item/borrow. For example, `ItemService.kt:51-68` iterates `items.map { ... }` and calls `userRepository.findById(item.ownerId)` per item.

**Why it's wrong:** This produces N+1 SQL queries (1 query for items + N queries for users/categories). As the dataset grows, this becomes a significant performance bottleneck.

**Do this instead:** Use JPA `@EntityGraph`, JOIN FETCH in `@Query`, or a custom `@Query` that joins users and categories in a single SQL statement. Alternatively, batch-load owner data using `findAllById()`.

### Direct Service-to-Repository Calls in CategoryController

**What happens:** `CategoryController.kt:15` injects `CategoryRepository` directly instead of going through a service layer.

**Why it's wrong:** Skips the layered architecture pattern. Business logic, caching, or access checks that might be needed later would have to be added in a controller, mixing concerns.

**Do this instead:** Create a `CategoryService` (even if it currently just delegates to `findAll()`) to maintain consistent architecture.

## Error Handling

**Strategy:** Centralized exception handling via `@RestControllerAdvice`

**Patterns:**
- `EntityNotFoundException` -> `404 NOT_FOUND` with `ApiResponse.error()`
- `IllegalArgumentException` -> `400 BAD_REQUEST`
- `IllegalStateException` -> `409 CONFLICT`
- `AccessDeniedException` -> `403 FORBIDDEN`
- `MethodArgumentNotValidException` -> `400 BAD_REQUEST` with field-level error messages
- `Exception` (catch-all) -> `500 INTERNAL_SERVER_ERROR`

All exception handlers are in `backend/.../common/GlobalExceptionHandler.kt`.

## Cross-Cutting Concerns

**Logging:** Not explicitly configured beyond Spring Boot default (Logback). No structured logging, no correlation IDs.

**Validation:** Jakarta Bean Validation (`@Valid`, `@NotBlank`, `@Email`, `@Size`, `@Min`, `@Max`) on controller request DTOs. Validation errors caught by `GlobalExceptionHandler` and returned as field-level error list.

**Authentication:** JWT Bearer token extracted by `JwtAuthenticationFilter` (a `OncePerRequestFilter`). Public endpoints: `/api/auth/register`, `/api/auth/login`, `/api/health`, Swagger docs. All other `/api/**` endpoints require authentication. Config in `SecurityConfig.kt`.

---

*Architecture analysis: 2026-06-13*
