---
name: code-review
description: Review current changes against ShareShelf conventions checklist. Use after making code changes or before committing.
---

# Code Review

## Purpose
Review staged and unstaged changes against the ShareShelf project conventions and known anti-patterns. Produces a structured report with pass/fail per rule.

## Instructions
1. Run `git diff` to see unstaged changes and `git diff --cached` for staged changes.
2. Run `git diff --name-only` and `git diff --cached --name-only` to identify all changed files.
3. Read every changed file in full.
4. For each file, check against the applicable checklist below. Produce a report:

### Backend Checklist (Kotlin/Spring Boot files in `backend/`)
- [ ] Every controller returns `ResponseEntity<ApiResponse<T>>`
- [ ] Services throw exceptions (not return ApiResponse) — AuthService is the known exception, do not replicate
- [ ] Constructor injection with `private val` — no `@Autowired`
- [ ] `@Transactional` on write methods only (method level)
- [ ] Ownership checks before mutation (`item.owner.id == principal.getId()`)
- [ ] `@field:` validation annotations on DTOs, `@Valid` on controller params
- [ ] No N+1 queries — use `JOIN FETCH` for eager loading
- [ ] Entity IDs use `val id: Long? = null`, referenced with `!!` after `save()`
- [ ] Optional fields use `Type?` with `= null` defaults
- [ ] Flyway migration exists for any schema change (`V6__`, `V7__`, etc.)
- [ ] Exception types match convention: `EntityNotFoundException` (404), `IllegalArgumentException` (400), `IllegalStateException` (409), `AccessDeniedException` (403)

### Frontend Checklist (TypeScript/React files in `frontend/`)
- [ ] `"use client";` directive present if hooks are used
- [ ] Uses centralized Axios from `lib/api.ts` — no raw `fetch()`
- [ ] Auth via `lib/auth.ts` helpers — no direct `localStorage` writes for auth
- [ ] Default-exported function component, Props interface above
- [ ] No `any` types — fully typed
- [ ] Tailwind v4 classes only — emerald + stone palette
- [ ] Handles loading, error, and empty states for every API call
- [ ] Responsive breakpoints: `sm:`, `md:`, `lg:`

### General
- [ ] No dead code (unused imports, unreachable methods)
- [ ] No secrets hardcoded
- [ ] Error messages are user-friendly

5. Output a summary:
   ```
   ## Code Review Report
   **Files changed:** N
   **Passed:** X/Y rules
   **Critical issues:** (blockers)
   **Warnings:** (should fix)
   **Suggestions:** (nice to have)
   ```
6. For each failure, include: file path, line reference, what's wrong, and the idiomatic fix.
