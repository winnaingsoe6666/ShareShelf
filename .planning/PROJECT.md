# ShareShelf

## What This Is

ShareShelf is a community-powered tool library web application that lets neighbors borrow and lend rarely used tools and equipment. Instead of buying items used only a few times a year, members share resources within their community — saving money and reducing waste. The app handles user registration, item listings, borrowing requests, reviews/ratings, and trust scoring.

## Core Value

Users can discover and borrow tools from neighbors in their community, with a trusted borrowing workflow that protects both lenders and borrowers.

## Requirements

### Validated

*Existing capabilities shipped and confirmed working.*

- ✓ **AUTH-01**: User can register with email and password (BCrypt hashed)
- ✓ **AUTH-02**: User can log in and receive JWT token
- ✓ **AUTH-03**: User session authenticated via JWT Bearer token on subsequent requests
- ✓ **AUTH-04**: User profile includes name, email, community, phone, trust score
- ✓ **ITEM-01**: User can create item listings with name, description, category
- ✓ **ITEM-02**: User can browse all available items
- ✓ **ITEM-03**: User can search items by name, category, and status
- ✓ **ITEM-04**: User can view individual item details
- ✓ **ITEM-05**: User can edit and delete their own item listings
- ✓ **BORR-01**: User can request to borrow an item from an owner
- ✓ **BORR-02**: Item owner can approve or reject borrow requests
- ✓ **BORR-03**: Borrower can mark items as returned
- ✓ **BORR-04**: Users can view their borrow request history
- ✓ **BORR-05**: Borrow request status lifecycle (pending → approved/rejected → returned/cancelled)
- ✓ **REVW-01**: User can leave a rating (1-5) and review after a borrow is completed
- ✓ **REVW-02**: Users can view average ratings on items and borrower/lender profiles
- ✓ **REVW-03**: User trust score updates based on reviews
- ✓ **CAT-01**: Items are categorized for discovery

### Active

*Current scope — building toward these.*

- [ ] **FIX-01**: Add `@Transactional` to `BorrowService.create()` to prevent item/borrow state desync
- [ ] **FIX-02**: Fix borrow page tab filter — users should only see their own requests
- [x] **FIX-03**: Fix CORS configuration for production (Vercel → Railway) — *fixed upstream: reads from CORS_ORIGINS env var*
- [ ] **FIX-04**: Fix uncaught exceptions in JWT filter (return 401 instead of 500)
- [ ] **FIX-05**: Wire `categoryName` through item create/update responses (currently hardcoded null)
- [ ] **FIX-06**: Fix empty catch blocks in borrow page (don't swallow API errors)
- [ ] **FIX-07**: Replace hardcoded category options in new-item form with API-driven data
- [ ] **FIX-08**: Move auth redirects from render to `useEffect` in frontend
- [ ] **FIX-09**: Add safe null handling for nullable entity IDs (replace `!!`)
- [ ] **PHOTO-01**: User can upload photos of items (local filesystem)
- [ ] **PHOTO-02**: Frontend image upload UI for item create/edit
- [ ] **PHOTO-03**: Display uploaded images on item detail page
- [ ] **TEST-01**: Backend test suite with JUnit 5 + MockK (unit + integration tests)
- [ ] **TEST-02**: Frontend test suite with Vitest + React Testing Library
- [ ] **TEST-03**: E2E tests with Playwright for critical paths
- [ ] **RALPH-01**: Establish Ralpha Loop: Spec → Test → Implement → Review → Commit → Learn
- [ ] **RALPH-02**: Claude Code memory setup for iterative learning from repo history
- [ ] **RALPH-03**: CI/CD pipeline with test gates

### Out of Scope

- **Real-time chat/notifications**: Out of scope for v1; borrow flow works async via the request/approve workflow
- **Mobile apps (iOS/Android)**: Web-first; responsive design sufficient for initial release
- **Payment processing**: Free community sharing model; no payment integration
- **Admin dashboard**: Community moderation is trust-score based for v1
- **OAuth/Social login**: Email/password sufficient for community-scale use

## Context

**Current codebase state:**
- Backend: Spring Boot 3.4.3 + Kotlin, complete with 5 domain modules (auth, item, borrow, review, category)
- Frontend: Next.js 15 + React 19 + TypeScript, 7 pages, reusable UI component library
- Database: PostgreSQL with 5 Flyway migrations
- Deployment: Docker multi-stage build, Railway (backend), Vercel (frontend with API proxy)
- Code review completed: 13 findings (3 critical, 6 warnings, 4 info) documented in `01-REVIEW.md`
- Codebase map completed: 7 documents in `.planning/codebase/`
- **Zero tests** across entire project — testing infrastructure needs to be built from scratch
- Known gaps: Photo upload feature not implemented, image support in frontend missing

**Ralpha Loop vision:**
The project will adopt a test-first, spec-driven iterative development cycle where:
1. Each iteration starts with specification updates
2. Tests are written before implementation (TDD)
3. Code review gates every change
4. Claude Code memory persists context between iterations
5. Repository history and documentation continuously guide future work

## Constraints

- **Tech Stack**: Spring Boot 3.4.x / Kotlin / Next.js 15 / PostgreSQL — locked
- **Deployment**: Railway (backend) + Vercel (frontend) — infrastructure decided
- **Auth Model**: JWT-based stateless auth — not changing
- **Language**: Backend code in Kotlin, frontend in TypeScript
- **Testing**: JUnit 5 + MockK (backend), Vitest + RTL (frontend), Playwright (E2E)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Monorepo structure (backend + frontend) | Simplified development and deployment coordination | ✓ Good |
| JWT stateless auth | No session store needed, scales horizontally | ✓ Good |
| Flyway for DB migrations | Version-controlled, reproducible schema | ✓ Good |
| ApiResponse<T> wrapper | Consistent error handling across all endpoints | ✓ Good |
| TDD-first going forward (Ralpha Loop) | Catch regressions early, enable safe refactoring | — Pending |
| Photo upload to local filesystem | Simple v1; cloud storage (S3) can be added later | — Pending |

---

*Last updated: 2026-06-13 after codebase map completion*
