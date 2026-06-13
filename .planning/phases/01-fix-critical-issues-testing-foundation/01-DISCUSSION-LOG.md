# Phase 1: Fix Critical Issues & Testing Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-13
**Phase:** 1-Fix Critical Issues & Testing Foundation
**Areas discussed:** Fix strategy, Test scope, Backend test depth, Frontend test scope, Claude memory

---

## Fix Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| TDD-first: test → fix | Write a failing test BEFORE fixing each issue. True Ralpha Loop. | ✓ |
| Fix-first: fix → test | Fix all 8 bugs first, then add tests after to lock them in. | |

**User's choice:** TDD-first: test → fix
**Notes:** True Ralpha Loop approach — every bug fix starts with a failing test.

---

## Test Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Focused — just the fixes | Only write tests for the services/endpoints we're fixing | |
| Full — all domains | Full scaffolding: test classes for ALL domains (auth, item, borrow, review) | ✓ |

**User's choice:** Full — all domains
**Notes:** Establish the TDD foundation for the entire project in Phase 1.

---

## Backend Test Depth

| Option | Description | Selected |
|--------|-------------|----------|
| Unit tests only | JUnit 5 + MockK for service layers. Fast, focused, covers logic. | ✓ |
| Full stack: unit + integration + persistence | Unit tests + @WebMvcTest + @DataJpaTest | |

**User's choice:** Unit tests only
**Notes:** Save integration tests for later phases.

---

## Frontend Test Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Focused — fixes + primitives | Test UI primitives + the pages/services we're fixing | |
| Full — all components + pages | Test ALL UI components + pages + auth flow | ✓ |

**User's choice:** Full — all components + pages
**Notes:** Complete frontend test coverage established in Phase 1.

---

## Claude Memory

| Option | Description | Selected |
|--------|-------------|----------|
| Bug patterns + conventions | Bug patterns, code review findings, test conventions | |
| Full: patterns + decisions + conventions | Bug patterns, architectural decisions, test conventions, recurring issues, preferred fix approaches | ✓ |

**User's choice:** Full: patterns + decisions + conventions
**Notes:** Ensure Claude Code persists full project context for iterative learning.

---

## Claude's Discretion

- Test file naming conventions (standard: `*Test.kt` backend, `*.test.tsx` frontend)
- Exact directory structure for tests (mirror source layout)
- Component test depth (render tests, interaction tests, edge cases)

## Deferred Ideas

- E2E tests (Playwright) — Phase 3
- Integration tests (@WebMvcTest, @DataJpaTest) — deferred to Phase 2+
- Photo upload — Phase 2
- CI/CD pipeline — Phase 3
