# ShareShelf — Project Context

**Generated:** 2026-06-18
**Phase:** 1 — Fix Critical Issues & Testing Foundation
**Purpose:** Onboard any future Claude session with the essential project facts.

---

## Core Identity

- **Project:** ShareShelf
- **Tagline:** Community-powered tool library — neighbors borrow and lend rarely used tools.
- **Core Value:** Users can discover and borrow tools from neighbors in their community, with a trusted borrowing workflow that protects both lenders and borrowers.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Spring Boot 3.4.3 / Kotlin 2.1.0 / Java 21 |
| Frontend | Next.js 15 (App Router) / React 19 / TypeScript ~5.7 |
| Database | PostgreSQL 15+ (Flyway-managed, V1–V5 migrations) |
| Auth | JWT-based stateless auth (jjwt 0.12.6, HMAC-SHA) |
| Testing (Backend) | JUnit 5 + MockK 1.13.14 + SpringMockK 4.0.2 |
| Testing (Frontend) | Vitest 3.x + React Testing Library + jsdom |
| E2E | Playwright (deferred to Phase 3) |

## Deployment

| Component | Platform | Details |
|-----------|----------|---------|
| Backend API | Railway | Docker container, `eclipse-temurin:21-jre-jammy`, port 8080, profile `railway` |
| Frontend | Vercel | Next.js build output, `NEXT_PUBLIC_API_URL` env var |
| Database | Railway add-on | PostgreSQL, connection via `PGHOST`/`PGPORT`/`PGDATABASE`/`PGUSER`/`PGPASSWORD` |

## Key Environment Variables

| Variable | Purpose | Profile |
|----------|---------|---------|
| `JWT_SECRET` | HMAC-SHA signing key | All (dev default in `application.yml`) |
| `NEXT_PUBLIC_API_URL` | Backend URL for frontend | Frontend |
| `SPRING_PROFILES_ACTIVE` | Set to `railway` in production | Backend Docker |
| `app.upload-dir` | Photo upload directory | Backend (Phase 2) |

---

## Directory Structure

### Backend (`backend/src/main/kotlin/com/shareshelf/`)

```
auth/           — AuthController, AuthService, JwtTokenProvider, JwtAuthenticationFilter,
                  CustomUserDetailsService, dto/AuthDtos.kt, entity/User.kt + UserRepository.kt
item/           — ItemController, ItemService, ItemRepository, dto/ItemDtos.kt, entity/Item.kt
borrow/         — BorrowController, BorrowService, BorrowRepository, dto/BorrowDtos.kt, entity/BorrowRequest.kt
review/         — ReviewController, ReviewService, ReviewRepository, dto/ReviewDtos.kt, entity/Review.kt
category/       — CategoryController, CategoryRepository, Category.kt
common/         — ApiResponse.kt, GlobalExceptionHandler.kt, HealthController.kt
config/         — SecurityConfig.kt, CorsConfig.kt
```

Tests at `backend/src/test/kotlin/com/shareshelf/{module}/`.

### Frontend (`frontend/src/`)

```
app/            — Next.js App Router pages: login/, register/, items/, items/[id]/, items/new/, borrow/, profile/
components/
  ui/           — Button, Input, Card, Badge, Modal, Spinner
  items/        — ItemCard, ItemGrid
  layout/       — Navbar, Footer
lib/            — api.ts (Axios + JWT interceptor), auth.ts (localStorage), utils.ts
types/          — index.ts (shared TS types)
test/           — setup.ts (jest-dom matchers)
```

Tests colocated in `__tests__/` subdirectories.

---

## Architecture

- **Pattern:** Layered — Controller → Service → Repository → Entity (strict one-way deps)
- **API response format:** Every endpoint returns `ApiResponse<T>` wrapper (`{success, message, data, errors}`)
- **Error handling:** `GlobalExceptionHandler` (`@RestControllerAdvice`) maps exceptions to HTTP status codes
- **Auth flow:** JWT Bearer token → `JwtAuthenticationFilter` → `SecurityContextHolder` → `@AuthenticationPrincipal UserPrincipal`
- **Frontend API client:** Axios singleton in `lib/api.ts` with request interceptor (JWT injection) and response interceptor (401 → logout)
- **State:** Stateless backend, no global state library on frontend (local `useState` + `localStorage` for auth)

## Key Files — Quick Reference

| File | Role |
|------|------|
| `ShareShelfApplication.kt` | Spring Boot entry point |
| `SecurityConfig.kt` | HTTP security rules, stateless sessions, CSRF disabled |
| `CorsConfig.kt` | CORS allowed origins (configurable via `app.cors.allowed-origins`) |
| `JwtTokenProvider.kt` | JWT creation, parsing, validation |
| `JwtAuthenticationFilter.kt` | Bearer token extraction, SecurityContext setup |
| `GlobalExceptionHandler.kt` | Exception → HTTP status mapping |
| `ApiResponse.kt` | Standardized JSON response wrapper |
| `api.ts` | Axios instance with JWT interceptor |
| `auth.ts` | localStorage-based auth persistence (`getToken`, `saveAuth`, `clearAuth`) |

## Constraints

- Backend code in Kotlin, frontend in TypeScript — not changing
- JWT stateless auth model — not changing
- Railway + Vercel deployment — infrastructure decided
- All pages use `"use client"` directive (no React Server Components)
- Tailwind CSS v4 for styling, emerald-* primary / stone-* neutral palette

## Phase 1 Status (as of 2026-06-18)

| Plan | Requirements | Status |
|------|-------------|--------|
| 01-01 | Frontend test infrastructure (TEST-02) | ✅ Complete |
| 01-02 | Backend unit tests (TEST-01) | ✅ Complete |
| 01-03 | @Transactional + categoryName (FIX-01, FIX-05) | ✅ Complete |
| 01-04 | JWT filter + null safety (FIX-04, FIX-09) | ✅ Complete |
| 01-05 | Borrow page error handling (FIX-02, FIX-06) | ✅ Complete |
| 01-06 | API-driven categories + useEffect redirects (FIX-07, FIX-08) | ✅ Complete |
| 01-07 | Claude memory initialization (RALPH-01) | 🔄 Current |

**Test coverage achieved:** 82+ backend tests (7 files), 105 frontend tests (15 files), all passing.
