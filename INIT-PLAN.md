# ShareShelf — Project Initialization Plan

## 1. Directory Structure

```
ShareShelf/
├── backend/                         # Spring Boot REST API
│   ├── build.gradle.kts             # Gradle Kotlin DSL build file
│   ├── settings.gradle.kts          # Project settings
│   ├── gradle/
│   │   └── wrapper/
│   │       ├── gradle-wrapper.jar
│   │       └── gradle-wrapper.properties
│   ├── gradlew
│   ├── gradlew.bat
│   ├── src/
│   │   ├── main/
│   │   │   ├── kotlin/com/shareshelf/
│   │   │   │   ├── ShareShelfApplication.kt    # Entry point
│   │   │   │   ├── config/                     # Security, CORS, JWT config
│   │   │   │   │   ├── SecurityConfig.kt
│   │   │   │   │   ├── JwtConfig.kt
│   │   │   │   │   └── CorsConfig.kt
│   │   │   │   ├── auth/                       # Auth domain
│   │   │   │   │   ├── AuthController.kt
│   │   │   │   │   ├── AuthService.kt
│   │   │   │   │   ├── JwtTokenProvider.kt
│   │   │   │   │   ├── dto/                    # Login/Register request/response DTOs
│   │   │   │   │   └── entity/                 # User entity
│   │   │   │   ├── item/                       # Item domain
│   │   │   │   │   ├── ItemController.kt
│   │   │   │   │   ├── ItemService.kt
│   │   │   │   │   ├── ItemRepository.kt
│   │   │   │   │   ├── dto/
│   │   │   │   │   └── entity/
│   │   │   │   ├── borrow/                     # Borrow request domain
│   │   │   │   │   ├── BorrowController.kt
│   │   │   │   │   ├── BorrowService.kt
│   │   │   │   │   ├── BorrowRepository.kt
│   │   │   │   │   ├── dto/
│   │   │   │   │   └── entity/
│   │   │   │   ├── category/                   # Category domain
│   │   │   │   ├── review/                     # Rating & reputation domain
│   │   │   │   └── common/                     # Shared exceptions, response wrappers
│   │   │   │       ├── ApiResponse.kt
│   │   │   │       └── GlobalExceptionHandler.kt
│   │   │   └── resources/
│   │   │       ├── application.yml             # Main config
│   │   │       ├── application-dev.yml         # Dev profile
│   │   │       └── db/migration/               # Flyway migrations
│   │   │           ├── V1__create_users.sql
│   │   │           ├── V2__create_categories.sql
│   │   │           ├── V3__create_items.sql
│   │   │           ├── V4__create_borrow_requests.sql
│   │   │           └── V5__create_reviews.sql
│   │   └── test/
│   │       └── kotlin/com/shareshelf/
│   │           ├── auth/
│   │           ├── item/
│   │           └── borrow/
│   └── .env.example
├── frontend/                        # Next.js (React + Tailwind)
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── postcss.config.mjs
│   ├── .env.local.example
│   ├── public/
│   │   └── placeholder.svg
│   └── src/
│       ├── app/                     # App Router
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   ├── login/page.tsx
│       │   ├── register/page.tsx
│       │   ├── items/
│       │   │   ├── page.tsx         # Browse items
│       │   │   ├── [id]/page.tsx    # Item detail
│       │   │   └── new/page.tsx     # Create item
│       │   ├── borrow/page.tsx      # My borrows
│       │   └── profile/page.tsx     # User profile
│       ├── components/
│       │   ├── ui/                  # Reusable primitives
│       │   │   ├── Button.tsx
│       │   │   ├── Card.tsx
│       │   │   ├── Input.tsx
│       │   │   ├── Badge.tsx
│       │   │   ├── Modal.tsx
│       │   │   └── Spinner.tsx
│       │   ├── layout/
│       │   │   ├── Navbar.tsx
│       │   │   └── Footer.tsx
│       │   ├── items/
│       │   │   ├── ItemCard.tsx
│       │   │   ├── ItemGrid.tsx
│       │   │   └── ItemForm.tsx
│       │   ├── borrow/
│       │   │   ├── BorrowRequestCard.tsx
│       │   │   └── BorrowStatusBadge.tsx
│       │   └── auth/
│       │       ├── LoginForm.tsx
│       │       └── RegisterForm.tsx
│       ├── lib/                     # Utilities
│       │   ├── api.ts               # Axios instance with JWT interceptor
│       │   ├── auth.ts              # Auth helpers
│       │   └── utils.ts             # Shared utilities
│       └── types/                   # TypeScript types
│           ├── item.ts
│           ├── user.ts
│           ├── borrow.ts
│           └── api.ts
├── scripts/                         # Development helpers
│   ├── start-db.sh                  # Start PostgreSQL
│   └── seed-db.sh                   # Seed sample data
├── .gitignore
├── README.md                        # Updated with setup instructions
└── INIT-PLAN.md                     # This file
```

## 2. Backend Stack (Spring Boot + Kotlin)

| Concern | Choice | Rationale |
|---------|--------|-----------|
| JVM | Java 21 | Available in environment |
| Build tool | Gradle 8.12 (Kotlin DSL) | Installed, modern DSL |
| Language | Kotlin | Concise, null-safe, official Android/JVM language |
| Framework | Spring Boot 3.4.x | Mature REST API framework |
| Auth | Spring Security + JWT (jjwt) | Stateless, proposal requirement |
| Database | PostgreSQL + Flyway | Versioned migrations |
| Testing | JUnit 5 + MockK | Kotlin-native mocking |
| API format | REST JSON with `ApiResponse<T>` wrapper | Consistent client consumption |

### Key Dependencies (build.gradle.kts)
- spring-boot-starter-web
- spring-boot-starter-security
- spring-boot-starter-data-jpa
- spring-boot-starter-validation
- flyway-core + flyway-database-postgresql
- io.jsonwebtoken:jjwt-api / jjwt-impl / jjwt-jackson
- postgresql (runtime)
- springdoc-openapi-starter-webmvc-ui (Swagger, optional dev)
- kotlin-reflect, kotlin-stdlib

### API Endpoints (v0.1 scope)

```
POST   /api/auth/register       # Create account (name, email, password, community)
POST   /api/auth/login          # Returns JWT token
GET    /api/auth/me             # Current user profile (authenticated)

GET    /api/items               # List items (search, filter, paginate)
POST   /api/items               # Create item listing
GET    /api/items/{id}          # Item detail
PUT    /api/items/{id}          # Edit item (owner only)
DELETE /api/items/{id}          # Delete item (owner only)
POST   /api/items/{id}/image    # Upload item photo

POST   /api/borrow              # Submit borrow request
GET    /api/borrow              # My requests (as borrower) / My received (as owner)
PUT    /api/borrow/{id}/approve # Approve request (owner)
PUT    /api/borrow/{id}/reject  # Reject request (owner)
PUT    /api/borrow/{id}/return  # Mark as returned (owner)

POST   /api/review              # Rate a completed borrow
GET    /api/review/user/{id}    # User's reviews & rating

GET    /api/categories          # List categories
```

### Database Schema (Core Tables)

```sql
-- users: id, name, email, password_hash, community, phone, avatar_url,
--        trust_score, created_at, updated_at
-- categories: id, name, icon, description
-- items: id, owner_id (FK users), category_id (FK categories),
--        title, description, daily_price, deposit_amount, status (available/borrowed/unavailable),
--        image_urls (JSONB), created_at, updated_at
-- borrow_requests: id, item_id (FK items), borrower_id (FK users), owner_id (FK users),
--                  status (pending/approved/rejected/returned/cancelled),
--                  start_date, end_date, message, created_at, updated_at
-- reviews: id, borrow_request_id (FK borrow_requests), reviewer_id (FK users),
--          reviewee_id (FK users), rating (1-5), comment, created_at
```

## 3. Frontend Stack (Next.js 15 + TypeScript + Tailwind CSS)

| Concern | Choice | Rationale |
|---------|--------|-----------|
| Framework | Next.js 15 App Router | SSR + SPA, file-based routing |
| Language | TypeScript | Type safety |
| Styling | Tailwind CSS v4 | Utility-first, proposal requirement |
| HTTP | Axios with interceptors | JWT auto-injection, clean error handling |
| Forms | React Hook Form + Zod | Performant, schema validation |
| Auth state | React Context (AuthProvider) | Simple, JWT stored in memory/httpOnly |

### Page Structure

```
/                   → Landing page (hero, search bar, featured items)
/login              → Login page
/register           → Registration page
/items              → Browse & search items (grid, filters, pagination)
/items/new          → Create item listing (multi-step form, image upload)
/items/[id]         → Item detail (photos, specs, borrow button)
/borrow             → My borrows (tab: borrowed items / lent items / requests)
/profile            → User profile (info, ratings, items listed)
```

### Component Tree (Key Pages)

**HomePage** → Navbar + HeroSection + SearchBar + FeaturedItems(ItemGrid→ItemCard) + Footer
**BrowsePage** → Navbar + FilterSidebar + ItemGrid(ItemCard) + Pagination + Footer
**ItemDetailPage** → Navbar + ImageGallery + ItemInfo + OwnerInfo + BorrowButton + Footer
**BorrowPage** → Navbar + TabSwitcher + BorrowRequestCard[] + Footer

## 4. Implementation Order

| Phase | What | Why first? |
|-------|------|------------|
| **0. Foundation** | `.gitignore`, `backend/build.gradle.kts`, Gradle wrapper, flyway migrations | Everything builds on this |
| **1. Auth Domain** | User entity, JWT provider, security config, auth controller | Needed by every other domain |
| **2. Categories** | Entity, repository, controller, seed data | Items depend on categories |
| **3. Items Domain** | Item entity, controller, service, image upload | Core feature, depends on auth + categories |
| **4. Borrow Domain** | Borrow request entity, workflow (request→approve→reject→return) | Depends on items |
| **5. Reviews Domain** | Review entity, rating calculation, trust score | Depends on completed borrows |
| **6. Frontend Foundation** | Next.js scaffold, Tailwind, Axios/API layer, AuthProvider, shared UI components | Needed by all pages |
| **7. Frontend Pages** | Auth pages → Items (browse, create, detail) → Borrow pages → Profile | Feature-matching backend order |
| **8. Integration** | Connect frontend↔backend, demo data, smoke test | Full flow verification |

## 5. Key Decisions

1. **Multi-module (backend/frontend) in one repo** — simpler for MVP, single PR flow. Separate deploy later if needed.
2. **Kotlin over Java** — Spring Boot + Kotlin is idiomatic in 2026, reduces boilerplate by ~40%.
3. **Flyway over Hibernate auto-DDL** — production-safe, version-controlled migrations.
4. **JWT + Bearer token (no refresh token in v0)** — simpler for MVP, refresh can be added later.
5. **Image upload: local filesystem in dev** — minimal infra; swap to S3/Cloudflare R2 when deploying.
6. **Next.js App Router** — modern React idioms (Server Components, server actions) but Pages Router fallback if needed.
7. **No state library** — React Context + URL search params suffice for MVP; add Zustand if cross-page state grows.

## 6. File Summary (to create)

**Backend (~25 files)**
- 5 build/config files (build.gradle.kts, settings, application*.yml, .env.example)
- 5 migration SQL files
- ~15 Kotlin source files (main + test)

**Frontend (~25 files)**
- 6 config files (package.json, tsconfig, next.config, tailwind, postcss, .env.local.example)
- ~8 page files (app router)
- ~15 component/library/type files

**Other**
- .gitignore, scripts/start-db.sh, scripts/seed.sh, updated README.md
