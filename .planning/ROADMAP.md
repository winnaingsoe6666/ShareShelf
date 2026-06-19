# Roadmap: ShareShelf

## Overview

ShareShelf is a production-ready community tool library app with known bugs and zero tests. This roadmap retrofits quality into the existing codebase: first by fixing critical issues and establishing a testing foundation (Phase 1), then adding the missing photo upload feature (Phase 2), followed by E2E tests and CI/CD (Phase 3), code quality hardening (Phase 4), and finally community-facing enhancements (Phase 5). Every phase follows Ralpha Loop principles: spec-first, TDD-driven, with Claude Code memory persisting context.

## Phases

- [ ] **Phase 1: Fix Critical Issues & Testing Foundation** - Fix all 9 code review findings (3 critical, 6 warnings), establish test infrastructure, and initialize Ralpha Loop memory
- [ ] **Phase 2: Photo Upload Feature** - Add item photo upload with local filesystem backend and image upload UI
- [ ] **Phase 3: E2E Tests & CI/CD Pipeline** - End-to-end testing with Playwright and automated CI/CD with test gates
- [ ] **Phase 4: Code Quality & Technical Debt** - Address N+1 queries, rate limiting, validation, JPA entity patterns, and logging
- [ ] **Phase 5: Community Features** - In-app notifications, community dashboard, and enhanced search filters
- [ ] **Phase 6: Location Search** - Spatial location search with PostGIS — pin-drop on items, distance filter, and interactive map view

## Phase Details

### Phase 1: Fix Critical Issues & Testing Foundation
**Goal**: Fix all critical/warning bugs from code review, establish testing infrastructure, and set up Claude Code memory for Ralpha Loop
**Depends on**: Nothing (first phase)
**Requirements**: FIX-01, FIX-02, FIX-03, FIX-04, FIX-05, FIX-06, FIX-07, FIX-08, FIX-09, TEST-01, TEST-02, RALPH-01
**Success Criteria** (what must be TRUE):
  1. All 3 critical and 6 warning findings from code review are fixed and verified
  2. Borrow page shows only the current user's borrow requests (not all users' requests)
  3. CORS works in production (Vercel frontend can call Railway backend)
  4. Backend tests run with JUnit 5 + MockK (minimum 1 test per service class)
  5. Frontend tests run with Vitest + React Testing Library
  6. Claude Code memory initialized with full project context for iterative learning
**Plans**: TBD
**UI hint**: yes

### Phase 2: Photo Upload Feature
**Goal**: Add item photo upload (local filesystem backend + image upload UI)
**Depends on**: Phase 1
**Requirements**: PHOTO-01, PHOTO-02, PHOTO-03, PHOTO-04, PHOTO-05
**Success Criteria** (what must be TRUE):
  1. Backend API endpoint accepts multipart file upload for items and stores to local filesystem
  2. Frontend has image upload UI component on item create and edit forms
  3. Uploaded images display on item detail page and item cards
  4. Backend tests cover the photo upload endpoint (JUnit 5 + MockMvc)
  5. Frontend tests cover the image upload component (Vitest + RTL)
**Plans**: TBD
**UI hint**: yes

### Phase 3: E2E Tests & CI/CD Pipeline
**Goal**: End-to-end testing and automated CI/CD with test gates
**Depends on**: Phase 2
**Requirements**: TEST-03, RALPH-02, RALPH-03, RALPH-04
**Success Criteria** (what must be TRUE):
  1. Playwright E2E tests cover login, browse, and borrow request flows
  2. GitHub Actions CI runs backend tests, frontend tests, and E2E tests on every push
  3. PRs are blocked from merging if any test suite fails
  4. Vercel preview deployments receive automated smoke tests via CI
**Plans**: TBD

### Phase 4: Code Quality & Technical Debt
**Goal**: Address technical debt — N+1 queries, rate limiting, validation, JPA entity patterns, and logging
**Depends on**: Phase 3
**Requirements**: QUAL-01, QUAL-02, QUAL-03, QUAL-04, QUAL-05
**Success Criteria** (what must be TRUE):
  1. No N+1 query patterns in BorrowService or ReviewService (verified by query count monitoring)
  2. API rate limiting is configured and enforced (strict limits on auth endpoints)
  3. Input validation passes OWASP basic checks across all endpoints (negative prices rejected, minimum password length 8)
  4. JPA entities use regular classes with ID-based equals/hashCode (not data classes)
  5. Request logging middleware is active and logs method, path, status, and duration
**Plans**: TBD

### Phase 5: Community Features
**Goal**: Enhanced community features — notifications, dashboard, search filters
**Depends on**: Phase 4
**Requirements**: COMM-01, COMM-02, COMM-03
**Success Criteria** (what must be TRUE):
  1. Users receive in-app notifications when borrow request status changes (pending, approved, rejected, returned)
  2. Community dashboard shows active borrows and available items in a single view
  3. Search supports filtering by availability status and average rating
  4. Frontend and backend tests cover the new community features
**Plans**: TBD
**UI hint**: yes

### Phase 6: Location Search
**Goal**: Add spatial location search — users set item locations via pin-drop on a map, browse items by distance with radius filters, and view items spatially on an interactive map
**Depends on**: Phase 5
**Requirements**: LOC-01, LOC-02, LOC-03, LOC-04, LOC-05
**Success Criteria** (what must be TRUE):
  1. PostGIS extension enabled on Railway PostgreSQL via Flyway migration
  2. Items carry lat/lng coordinates from pin-drop on create/edit forms
  3. Browse page supports distance-based filtering with radius presets (1km, 3km, 5km, 10km)
  4. Dedicated map search page with Leaflet/OpenStreetMap and marker clustering
  5. Backend spatial queries use GiST index for constant-time performance regardless of table size
  6. Frontend and backend tests cover spatial queries and map components
**Plans**: TBD
**UI hint**: yes

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Fix Critical Issues & Testing Foundation | 7/7 | Complete | 2026-06-18 |
| 2. Photo Upload Feature | 0/TBD | Complete | 2026-06-19 |
| 3. E2E Tests & CI/CD Pipeline | 0/TBD | Not started | - |
| 4. Code Quality & Technical Debt | 0/TBD | Not started | - |
| 5. Community Features | 3/3 | Complete | 2026-06-19 |
| 6. Location Search | 0/TBD | Not started | - |
