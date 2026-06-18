# Architectural Decisions

**Generated:** 2026-06-18
**Source:** Phase 1 Context (01-CONTEXT.md), Phase 1 Discussion Log (01-DISCUSSION-LOG.md)
**Scope:** Decisions locked during Phase 1 that govern all subsequent phases.

---

## D-01: TDD-First Approach

**Decision:** Write a failing test BEFORE fixing each bug or implementing each feature.
**Rationale:** True Ralpha Loop — tests define expected behavior, prevent regressions, and serve as living documentation.
**Impact:**
- Every bug fix in Phase 1 started with a RED (failing test) commit
- Test must exist and fail before implementation code is written
- Commit convention: `test(...)` for RED, `fix(...)` or `feat(...)` for GREEN

## D-02: Fix Cycle

**Decision:** Each fix follows: failing test → fix → test passes → code review → commit.
**Rationale:** Enforces the TDD gate structure. No fix is applied without a test proving it works.
**Impact:**
- Two-commit pattern: RED commit (test only), then GREEN commit (fix + passing test)
- If the fix is already present, add a verification test and document as "pre-existing fix"
- No REFACTOR commit required for Phase 1 (fixes are minimal)

## D-03: Full Test Scaffolding Across All Domains

**Decision:** Establish test coverage for ALL backend and frontend domains, not just the ones being fixed.
**Rationale:** Create the TDD foundation for the entire project in Phase 1, so Phase 2+ inherits a working test suite.
**Impact:**
- Backend: test files for AuthService, ItemService, BorrowService, ReviewService, CategoryController, ApiResponse, GlobalExceptionHandler
- Frontend: test files for all UI primitives (Button, Input, Card, Badge, Modal, Spinner), layout (Navbar), utilities (auth, api, utils), and all pages
- Total: 82+ backend tests, 105 frontend tests

## D-04: Backend Test Depth — Service Unit Tests Only

**Decision:** JUnit 5 + MockK for service layer unit tests. No `@WebMvcTest` or `@DataJpaTest` in Phase 1.
**Rationale:** Integration/controller tests add complexity without proportional value right now. Focus on business logic correctness.
**Impact:**
- Service tests mock all repository dependencies with `mockk<>()`
- Constructor injection for test subject instantiation (no Spring context)
- `every {}` / `verify {}` pattern
- `assertThrows<>` for error paths

## D-05: Frontend Test Coverage — All Components + All Pages

**Decision:** Vitest + React Testing Library. Test ALL UI components, layout, utilities, and all pages.
**Rationale:** Complete frontend test coverage established in Phase 1. Every component gets tested.
**Impact:**
- 15 test files, 105 tests, all passing
- Page tests cover: loading state, error state, empty state, auth redirects, success paths
- Mock patterns: `vi.mock("@/lib/api")`, `vi.mock("@/lib/auth")`, `vi.mock("next/navigation")`
- Colocated tests in `__tests__/` subdirectories

## D-06: E2E Tests Deferred to Phase 3

**Decision:** Playwright end-to-end tests are deferred to Phase 3.
**Rationale:** Unit tests and fixes take priority. E2E adds infrastructure complexity (CI, browser installs) that's better handled after the build pipeline is established.
**Impact:**
- Phase 3 plans must include Playwright setup, CI integration, and smoke tests
- Phase 1 and 2 rely on unit + component tests only

## D-07: Claude Code Memory Initialization

**Decision:** Establish persistent Claude Code memory with project context, bug patterns, test conventions, architectural decisions, and fix approaches.
**Rationale:** Ralpha Loop requires persistent context across sessions. Future phases should benefit from Phase 1 learnings without re-exploration.
**Impact:**
- Five memory files in `.claude/memory/`: project context, bug patterns, test conventions, architectural decisions, fix approaches
- Phase 2+ agents can read these files to understand conventions, known bugs, and fix patterns

## D-08: Memory Storage Location

**Decision:** Memory files stored in `.claude/memory/` within the project root.
**Rationale:** Project-relative path ensures memory travels with the repo and is accessible to any Claude session working in the project.
**Impact:** Files are version-controlled alongside source code (though primarily for Claude consumption).

## D-09: Execution Order

**Decision:** Test infrastructure setup first → fixes via TDD → Claude memory last.
**Rationale:** Memory should capture actual patterns used, not planned patterns. Building test infra first ensures fixes have a framework to validate against.
**Impact:**
- Plans 01-01 and 01-02 (test infrastructure) executed first
- Plans 01-03 through 01-06 (fixes) executed next
- Plan 01-07 (memory) executed last

---

## Deferred Items (Carried Forward)

| Item | Deferred To | Reason |
|------|------------|--------|
| Playwright E2E tests | Phase 3 | Requires CI infrastructure |
| Photo upload feature | Phase 2 | Separate feature scope |
| CI/CD pipeline | Phase 3 | Depends on E2E setup |
| `@WebMvcTest` integration tests | Phase 2+ | Unit tests sufficient for now |
| `@DataJpaTest` persistence tests | Phase 2+ | Unit tests sufficient for now |
| React Server Components | Never (decided against) | All pages use `"use client"` |

## Key Anti-Patterns to Avoid

1. **Data class entities for JPA** — Use regular classes with ID-based equals/hashCode
2. **N+1 queries** — Use `@EntityGraph` or batch fetches, not per-item repository calls
3. **AuthService returning ApiResponse** — Services should throw exceptions, let GlobalExceptionHandler map them
4. **Render-time redirects** — Use `useEffect` for all navigation side effects
5. **`!!` on nullable entity fields** — Use `?: throw IllegalStateException("message")`
6. **Empty catch blocks** — Always report errors to the user via error state
7. **Hardcoded data in forms** — Fetch all reference data from the API
