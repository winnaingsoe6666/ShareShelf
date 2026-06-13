# Codebase Structure

**Analysis Date:** 2026-06-13

## Directory Layout

```
shareshelf/
├── backend/                            # Spring Boot 3 + Kotlin backend
│   ├── build.gradle.kts                # Gradle build script (Kotlin DSL)
│   ├── gradle/                         # Gradle wrapper
│   ├── src/
│   │   ├── main/
│   │   │   ├── kotlin/com/shareshelf/
│   │   │   │   ├── ShareShelfApplication.kt    # Boot entry point
│   │   │   │   ├── auth/                       # Authentication module
│   │   │   │   │   ├── AuthController.kt
│   │   │   │   │   ├── AuthService.kt
│   │   │   │   │   ├── JwtAuthenticationFilter.kt
│   │   │   │   │   ├── JwtTokenProvider.kt
│   │   │   │   │   ├── CustomUserDetailsService.kt
│   │   │   │   │   ├── dto/AuthDtos.kt
│   │   │   │   │   └── entity/
│   │   │   │   │       ├── User.kt
│   │   │   │   │       └── UserRepository.kt
│   │   │   │   ├── borrow/                     # Borrow request module
│   │   │   │   │   ├── BorrowController.kt
│   │   │   │   │   ├── BorrowService.kt
│   │   │   │   │   ├── BorrowRepository.kt
│   │   │   │   │   ├── dto/BorrowDtos.kt
│   │   │   │   │   └── entity/BorrowRequest.kt
│   │   │   │   ├── category/                   # Category module (read-only)
│   │   │   │   │   ├── CategoryController.kt
│   │   │   │   │   ├── Category.kt             # Entity + no service layer
│   │   │   │   │   └── CategoryRepository.kt
│   │   │   │   ├── item/                       # Items module
│   │   │   │   │   ├── ItemController.kt
│   │   │   │   │   ├── ItemService.kt
│   │   │   │   │   ├── ItemRepository.kt
│   │   │   │   │   ├── dto/ItemDtos.kt
│   │   │   │   │   └── entity/Item.kt
│   │   │   │   ├── review/                     # Reviews module
│   │   │   │   │   ├── ReviewController.kt
│   │   │   │   │   ├── ReviewService.kt
│   │   │   │   │   ├── ReviewRepository.kt
│   │   │   │   │   ├── dto/ReviewDtos.kt
│   │   │   │   │   └── entity/Review.kt
│   │   │   │   ├── common/                     # Shared utilities
│   │   │   │   │   ├── ApiResponse.kt
│   │   │   │   │   ├── GlobalExceptionHandler.kt
│   │   │   │   │   └── HealthController.kt
│   │   │   │   └── config/                     # Application configuration
│   │   │   │       ├── SecurityConfig.kt
│   │   │   │       └── CorsConfig.kt
│   │   │   └── resources/
│   │   │       └── db/migration/               # Flyway migrations
│   │   │           ├── V1__create_users.sql
│   │   │           ├── V2__create_categories.sql
│   │   │           ├── V3__create_items.sql
│   │   │           ├── V4__create_borrow_requests.sql
│   │   │           └── V5__create_reviews.sql
│   │   └── test/kotlin/com/shareshelf/         # Unit tests
│   │       ├── auth/
│   │       ├── borrow/
│   │       └── item/
│   └── .kotlin/                                # Kotlin build cache (generated)
│
├── frontend/                           # Next.js 14 frontend
│   ├── package.json
│   ├── next.config.js                  # Next.js configuration
│   ├── tsconfig.json                   # TypeScript config with @/ alias
│   └── src/
│       ├── app/                        # Next.js App Router pages
│       │   ├── layout.tsx              # Root layout (HTML shell + CSS)
│       │   ├── page.tsx                # Home page (hero + how-it-works)
│       │   ├── login/page.tsx          # Login form
│       │   ├── register/page.tsx       # Registration form
│       │   ├── items/
│       │   │   ├── page.tsx            # Browse items with search/filter
│       │   │   ├── [id]/page.tsx       # Item detail + borrow modal
│       │   │   └── new/page.tsx        # Create item listing
│       │   ├── borrow/page.tsx         # My borrows (borrowed/lent tabs)
│       │   └── profile/page.tsx        # Profile with items + reviews
│       ├── components/
│       │   ├── auth/                   # Auth-related components (empty dir)
│       │   ├── borrow/                 # Borrow-related components (empty dir)
│       │   ├── items/
│       │   │   ├── ItemCard.tsx        # Card for item grid
│       │   │   └── ItemGrid.tsx        # (not used by pages currently)
│       │   ├── layout/
│       │   │   ├── Navbar.tsx          # Sticky nav with auth-aware links
│       │   │   └── Footer.tsx          # Site footer
│       │   └── ui/
│       │       ├── Badge.tsx           # Status badge component
│       │       ├── Button.tsx          # Styled button with loading state
│       │       ├── Card.tsx            # Generic card container
│       │       ├── Input.tsx           # Labeled input field
│       │       ├── Modal.tsx           # Modal dialog
│       │       └── Spinner.tsx         # Loading spinner
│       ├── lib/
│       │   ├── api.ts                  # Axios instance with JWT interceptors
│       │   ├── auth.ts                 # localStorage auth helpers
│       │   └── utils.ts                # formatDate, formatPrice, cn()
│       └── types/
│           └── index.ts                # TypeScript interfaces (User, Item, etc.)
│
├── scripts/
│   ├── start-db.sh                     # Start PostgreSQL + create DB/user
│   └── seed.sh                         # Seed demo data via curl
│
├── Dockerfile                          # Container build for backend
├── railway.json                        # Railway deployment config
├── DEPLOYMENT_GUIDE.md                 # Deployment instructions
├── README.md                           # Project overview
├── 01-REVIEW.md                        # Project review document
├── INIT-PLAN.md                        # Initial plan document
└── .gitignore
```

## Directory Purposes

### Backend Packages

**`backend/src/main/kotlin/com/shareshelf/auth/`:**
- Purpose: User authentication and authorization
- Contains: Controller, Service, JWT infrastructure (filter, token provider, user details), DTOs, entity, repository
- Key files:
  - `AuthController.kt` - `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
  - `AuthService.kt` - Registration with bcrypt, login verification, JWT generation
  - `JwtAuthenticationFilter.kt` - `OncePerRequestFilter` for Bearer token extraction and validation
  - `JwtTokenProvider.kt` - JWT creation and parsing using `jjwt` library
  - `CustomUserDetailsService.kt` - Bridges `User` entity to Spring Security `UserDetails` as `UserPrincipal`
  - `entity/User.kt` - JPA entity mapped to `users` table with `BigDecimal trustScore`
  - `entity/UserRepository.kt` - `JpaRepository` with `findByEmail()` and `existsByEmail()`
  - `dto/AuthDtos.kt` - `RegisterRequest`, `LoginRequest`, `AuthResponse`
- Depends on: `common/` (ApiResponse), `config/` (SecurityConfig registers the filter)

**`backend/src/main/kotlin/com/shareshelf/borrow/`:**
- Purpose: Borrow request lifecycle (create, approve, reject, mark returned)
- Contains: Controller, Service, Repository, DTOs, entity
- Key files:
  - `BorrowController.kt` - `POST /api/borrow`, `GET /api/borrow`, `PUT /{id}/approve|reject|return`
  - `BorrowService.kt` - State machine logic, item status transitions, N+1 issue (per-item user lookups)
  - `BorrowRepository.kt` - Queries by borrowerId, ownerId, itemId
  - `entity/BorrowRequest.kt` - Entity with status enum: pending/approved/rejected/returned/cancelled
  - `dto/BorrowDtos.kt` - `CreateBorrowRequest`, `BorrowResponse`
- Depends on: `item/` (ItemRepository), `auth/` (UserRepository)

**`backend/src/main/kotlin/com/shareshelf/item/`:**
- Purpose: Item CRUD with search and filtering
- Contains: Controller, Service, Repository, DTOs, entity
- Key files:
  - `ItemController.kt` - Full CRUD: `GET|POST /api/items`, `GET|PUT|DELETE /api/items/{id}`
  - `ItemService.kt` - Create with owner lookup, search with JPQL, update/delete ownership validation, image parsing from JSONB
  - `ItemRepository.kt` - Custom `search()` JPQL query with optional search/categoryId/status filters
  - `entity/Item.kt` - Entity with `imageUrls` as JSONB string field (parsed manually via ObjectMapper)
  - `dto/ItemDtos.kt` - `CreateItemRequest`, `UpdateItemRequest`, `ItemResponse`
- Depends on: `auth/` (UserRepository), `category/` (CategoryRepository)

**`backend/src/main/kotlin/com/shareshelf/category/`:**
- Purpose: Read-only category listing (seeded in V2 migration)
- Contains: Controller (direct repository injection, no service layer), Entity, Repository
- Key files:
  - `CategoryController.kt` - `GET /api/categories`
  - `Category.kt` - Simple entity with name, icon, description
  - `CategoryRepository.kt` - Plain `JpaRepository` (no custom queries)
- Depends on: Nothing outside the package (no service layer)

**`backend/src/main/kotlin/com/shareshelf/review/`:**
- Purpose: Peer reviews after returned borrows, trust score calculation
- Contains: Controller, Service, Repository, DTOs, entity
- Key files:
  - `ReviewController.kt` - `POST /api/review`, `GET /api/review/user/{userId}`
  - `ReviewService.kt` - Validates completed borrow, prevents duplicate reviews, updates trust score
  - `ReviewRepository.kt` - Custom `averageRatingByRevieweeId()` for trust score computation
  - `entity/Review.kt` - Entity with unique constraint on (borrow_request_id, reviewer_id)
  - `dto/ReviewDtos.kt` - `CreateReviewRequest`, `ReviewResponse`
- Depends on: `borrow/` (BorrowRepository), `auth/` (UserRepository)

**`backend/src/main/kotlin/com/shareshelf/common/`:**
- Purpose: Cross-cutting shared utilities
- Contains: API response wrapper, global exception handler, health endpoint
- Key files:
  - `ApiResponse.kt` - Generic `ApiResponse<T>` with JSON-include control for null fields
  - `GlobalExceptionHandler.kt` - `@RestControllerAdvice` mapping 5 exception types to HTTP status codes
  - `HealthController.kt` - `GET /api/health` returns `{"status": "UP"}`
- Depends on: Nothing outside the package

**`backend/src/main/kotlin/com/shareshelf/config/`:**
- Purpose: Spring Security and CORS configuration
- Contains: Security filter chain, CORS filter bean
- Key files:
  - `SecurityConfig.kt` - Stateless session, public endpoints, JWT filter injection
  - `CorsConfig.kt` - CORS filter allowing `http://localhost:3000`
- Depends on: `auth/` (JwtAuthenticationFilter)

### Frontend Directories

**`frontend/src/app/` (Next.js App Router pages):**
- Purpose: Page-level components, each directory is a route segment
- Key files:
  - `layout.tsx` - Root layout with HTML shell, global CSS import
  - `page.tsx` - Landing page with hero section, how-it-works, CTA
  - `login/page.tsx` - Email/password form, calls `/api/auth/login`
  - `register/page.tsx` - Name/email/password/community form, calls `/api/auth/register`
  - `items/page.tsx` - Browse grid with text search + category filter dropdown, fetches items + categories
  - `items/[id]/page.tsx` - Item detail with borrow request modal with message field
  - `items/new/page.tsx` - Create listing form with title, description, category, prices
  - `borrow/page.tsx` - Tabs for "Items I'm Borrowing" / "Items I'm Lending" with approve/reject/return buttons
  - `profile/page.tsx` - User profile card, my items list, reviews list

**`frontend/src/components/`:**
- Purpose: Reusable React components organized by domain
- **`ui/`**: Primitive UI components (Badge, Button, Card, Input, Modal, Spinner) - design-system building blocks
- **`layout/`**: Site-level layout components (Navbar with auth-aware navigation, Footer)
- **`items/`**: Item-specific components (ItemCard for grid display, ItemGrid)
- **`auth/`, `borrow/`**: Intended directories, currently empty

**`frontend/src/lib/`:**
- Purpose: Application logic and utilities
- `api.ts` - Axios instance with base URL from `NEXT_PUBLIC_API_URL`, request interceptor for JWT, response interceptor for 401 auto-logout
- `auth.ts` - LocalStorage helpers: `saveAuth()`, `clearAuth()`, `getToken()`, `getUser()`, `isAuthenticated()`
- `utils.ts` - Pure utility functions: `formatDate()`, `formatPrice()`, `cn()` (classname joiner)

**`frontend/src/types/`:**
- Purpose: TypeScript type definitions shared across the frontend
- `index.ts` - `User`, `Item`, `Category`, `BorrowRequest`, `Review`, `AuthResponse`, `ApiResponse<T>`, `BorrowStatus`, `ItemStatus`

### Database Migrations

**`backend/src/main/resources/db/migration/`:**
- Purpose: Schema versioning via Flyway
- `V1__create_users.sql` - `users` table with email unique constraint, trust_score default 0.00, indexes on email and community
- `V2__create_categories.sql` - `categories` table + seed data (10 categories: Tools, Electronics, Outdoor, etc.)
- `V3__create_items.sql` - `items` table with FK to users and categories, JSONB image_urls, GIN full-text search index
- `V4__create_borrow_requests.sql` - `borrow_requests` table with CHECK constraint on status values, FKs to items and users
- `V5__create_reviews.sql` - `reviews` table with UNIQUE(borrow_request_id, reviewer_id), rating CHECK(1-5), FKs

### Scripts

**`scripts/start-db.sh`:**
- Purpose: Start local PostgreSQL service, create `shareshelf` database and user
- Usage: `./scripts/start-db.sh`

**`scripts/seed.sh`:**
- Purpose: Register 3 demo users (Alice, Bob, Charlie) and create 5 sample items via the REST API
- Usage: `API_URL=http://localhost:8080 ./scripts/seed.sh`

## Naming Conventions

**Files:**
- `PascalCase.kt` for Kotlin classes (e.g., `AuthController.kt`, `JwtTokenProvider.kt`)
- `PascalCase.tsx` for React components (e.g., `Navbar.tsx`, `ItemCard.tsx`)
- `kebab-case.ts` for non-component modules (e.g., `api.ts`, `auth.ts`, `utils.ts`)
- `snake_case.sql` for Flyway migrations with V-prefix (e.g., `V1__create_users.sql`)

**Directories:**
- `kebab-case` for frontend app router segments (e.g., `items/new/`, `items/[id]/`)
- `lowercase` for backend feature packages (e.g., `auth/`, `borrow/`, `item/`)
- `dto/`, `entity/` sub-packages inside each feature

## Where to Add New Code

**New Feature Module (Backend):**
- Controllers: `backend/src/main/kotlin/com/shareshelf/<feature>/<Feature>Controller.kt`
- Service: `backend/src/main/kotlin/com/shareshelf/<feature>/<Feature>Service.kt`
- Repository: `backend/src/main/kotlin/com/shareshelf/<feature>/<Feature>Repository.kt`
- Entity: `backend/src/main/kotlin/com/shareshelf/<feature>/entity/<Entity>.kt`
- DTOs: `backend/src/main/kotlin/com/shareshelf/<feature>/dto/<Feature>Dtos.kt`
- Tests: `backend/src/test/kotlin/com/shareshelf/<feature>/`

**New Page (Frontend):**
- Page: `frontend/src/app/<route>/page.tsx` (must start with `"use client"`)
- Dynamic route: `frontend/src/app/<route>/[param]/page.tsx`

**New Component (Frontend):**
- UI primitive: `frontend/src/components/ui/<Name>.tsx`
- Feature-specific: `frontend/src/components/<feature>/<Name>.tsx` (e.g., `items/`, `borrow/`)

**New Utility:**
- Frontend shared helper: `frontend/src/lib/<name>.ts`
- Backend shared helper: Place in `backend/.../common/` or create a `util/` package

**New Database Migration:**
- `backend/src/main/resources/db/migration/V<next>__<description>.sql`
- Use sequential numbering, snake_case description

## Test Directory Structure

**Backend tests** are organized mirroring the main source layout:
- `backend/src/test/kotlin/com/shareshelf/auth/` - Auth tests
- `backend/src/test/kotlin/com/shareshelf/borrow/` - Borrow tests
- `backend/src/test/kotlin/com/shareshelf/item/` - Item tests
- Test framework: JUnit 5 + MockK + SpringMockK + Spring Security Test

## Special Directories

**`backend/.kotlin/`:**
- Purpose: Kotlin incremental compilation cache and build session data
- Generated: Yes
- Committed: No (in `.gitignore`)

**`backend/build/`:**
- Purpose: Gradle build output (compiled classes, JAR, test reports)
- Generated: Yes
- Committed: No

**`frontend/.next/`:**
- Purpose: Next.js build output (compiled JS, optimized assets)
- Generated: Yes
- Committed: No

**`frontend/node_modules/`:**
- Purpose: NPM dependencies
- Generated: Yes
- Committed: No

**`.planning/codebase/`:**
- Purpose: GSD-generated codebase analysis documents (this file)
- Generated: Yes
- Committed: Yes (intended for reference by planning/execution phases)

---

*Structure analysis: 2026-06-13*
