# Phase 1: Fix Critical Issues & Testing Foundation - Context

**Gathered:** 2026-06-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix all critical and warning bugs from code review (8 remaining), establish full testing infrastructure across all domains, and initialize Claude Code memory with project context for the Ralpha Loop.

**Remaining bugs after upstream fixes (FIX-03 already resolved):**
- 2 Critical: FIX-01 (missing `@Transactional`), FIX-02 (borrow page exposes all users' requests)
- 6 Warnings: FIX-04 through FIX-09 (JWT exception handling, categoryName null, empty catch blocks, hardcoded categories, render-time redirects, unsafe `!!`)
</domain>

<decisions>
## Implementation Decisions

### Fix Strategy
- **D-01:** TDD-first approach — write a failing test BEFORE fixing each bug (true Ralpha Loop)
- **D-02:** Fixes use this cycle: failing test → fix → test passes → code review → commit

### Testing Infrastructure
- **D-03:** Full test scaffolding across ALL domains (auth, item, borrow, review, category, common) — not just the fixes
- **D-04:** Backend: JUnit 5 + MockK — unit tests for service layers only. No `@WebMvcTest` or `@DataJpaTest` in Phase 1
- **D-05:** Frontend: Vitest + React Testing Library — test ALL UI components (Button, Input, Card, Modal, Badge, Spinner) + all pages (login, register, items/[id], items/new, items, borrow, profile)
- **D-06:** E2E tests deferred to Phase 3 (Playwright)

### Claude Code Memory
- **D-07:** Full memory initialization: bug patterns, architectural decisions, test conventions, recurring issues, preferred fix approaches
- **D-08:** Memory stored in `.claude/projects/-home-wns-winnaingsoe6666-ShareShelf/memory/`

### Order of Execution
- **D-09:** Test infrastructure setup first (add Vitest + frontend test config), then fix each bug TDD-style, then Claude memory setup last

## Claude's Discretion
- Test file naming conventions (standard: `*Test.kt` for backend, `*.test.tsx` for frontend)
- Exact directory structure for tests (mirror source layout)
- Component test depth (render tests, interaction tests, edge cases)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Code Review
- `01-REVIEW.md` — All 13 findings (3 critical, 6 warnings, 4 info) with file paths, descriptions, and recommended fixes

### Requirements & Roadmap
- `.planning/REQUIREMENTS.md` — Phase 1 requirements: FIX-01 through FIX-09, TEST-01, TEST-02, RALPH-01
- `.planning/ROADMAP.md` — Phase 1 success criteria and scope

### Codebase Map
- `.planning/codebase/TESTING.md` — Current testing state and recommended test stack
- `.planning/codebase/CONCERNS.md` — Full details on each bug finding with file paths
- `.planning/codebase/CONVENTIONS.md` — Existing coding patterns tests must follow
- `.planning/codebase/ARCHITECTURE.md` — System architecture for integration context

### Existing Source Code
- `backend/src/main/kotlin/com/shareshelf/borrow/BorrowService.kt` — FIX-01: missing @Transactional
- `frontend/src/app/borrow/page.tsx` — FIX-02: borrow tab filter + FIX-06: empty catch blocks
- `backend/src/main/kotlin/com/shareshelf/auth/JwtAuthenticationFilter.kt` — FIX-04: JWT filter exceptions
- `backend/src/main/kotlin/com/shareshelf/item/ItemService.kt` — FIX-05: categoryName hardcoded null
- `frontend/src/app/items/new/page.tsx` — FIX-07: hardcoded categories
- `frontend/src/app/login/page.tsx`, `register/page.tsx` — FIX-08: render-time redirects
- Multiple entity files — FIX-09: unsafe `!!` assertions
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **ApiResponse<T> wrapper** (`common/ApiResponse.kt`) — consistent response format all endpoints use
- **GlobalExceptionHandler** (`common/GlobalExceptionHandler.kt`) — centralized error handling pattern
- **UI primitives** (`components/ui/`) — Button, Input, Card, Modal, Badge, Spinner — will need test coverage
- **Axios instance with JWT interceptor** (`lib/api.ts`) — all API calls go through this

### Established Patterns
- **Layered architecture**: Controller → Service → Repository — tests follow same structure
- **DTO pattern**: Separate request/response data classes per domain
- **Standardized responses**: All endpoints return `ApiResponse<T>`
- **Error handling**: Global exception handler maps exceptions to HTTP status codes

### Integration Points
- Borrow page (`frontend/src/app/borrow/page.tsx`) needs frontend + backend fixes
- ItemService.toResponse() shared between create/update operations
- JwtAuthenticationFilter is in the Spring Security filter chain — requires careful testing

### Test Patterns Already in Use (via build.gradle.kts)
- `testImplementation("io.mockk:mockk:1.13.14")` — Kotlin-first mocking
- `testImplementation("com.ninja-squad:springmockk:4.0.2")` — MockK + Spring Boot integration
</code_context>

<specifics>
## Specific Ideas

- BorrowServiceTest should verify: (1) `@Transactional` is present on `create()`, (2) item status transitions correctly, (3) rollback on failure
- Borrow page test should verify: (1) tabs filter by current user's ID, (2) error states show user-friendly messages (not empty spinners)
- JWT filter test should verify: (1) valid token + deleted user = 401, (2) valid token + valid user = pass through, (3) invalid token = pass through (next filter handles it)
- Claude memory should persist: the test conventions established here so Phase 2 onwards follows the same patterns automatically

</specifics>

<deferred>
## Deferred Ideas

- **E2E tests** (Playwright) — deferred to Phase 3
- **Integration tests** (@WebMvcTest, @DataJpaTest) — deferred to Phase 2 or later
- **Photo upload** — deferred to Phase 2
- **CI/CD pipeline** — deferred to Phase 3

</deferred>

---

*Phase: 1-Fix Critical Issues & Testing Foundation*
*Context gathered: 2026-06-13*
