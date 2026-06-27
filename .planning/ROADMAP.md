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
- [ ] **Phase 7: Google OAuth Signup** - Add Google OAuth signup/login so users can authenticate with their Google account instead of email/password
- [x] **Phase 8: Photo Upload R2 Migration** - Replace local filesystem storage with Cloudflare R2 for persistent, CDN-backed image hosting ✓ 2026-06-25
- [x] **Phase 9: In-App Chat** - Item-scoped real-time messaging between borrowers and owners via WebSocket + STOMP ✓ 2026-06-26

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

### Phase 7: Google OAuth Signup
**Goal**: Add Google OAuth signup/login so users can authenticate with their Google account instead of email/password
**Depends on**: Phase 1 (auth infrastructure must exist)
**Requirements**: OAUTH-01, OAUTH-02, OAUTH-03, OAUTH-04
**Success Criteria** (what must be TRUE):
  1. Users can sign up and log in with their Google account (OAuth 2.0 flow)
  2. Google-authenticated users are created in the database with profile info (name, email, avatar)
  3. ~~Existing email/password users can link their Google account~~ *(Updated: login/register pages are now Google-only — no credential forms remain)*
  4. Frontend has "Sign in with Google" button on login and register pages
  5. Backend and frontend tests cover the OAuth flow
**Plans**: TBD
**UI hint**: yes

### Phase 8: Photo Upload R2 Migration
**Goal**: Replace local filesystem storage with Cloudflare R2 for persistent, CDN-backed image hosting
**Depends on**: Phase 2 (existing photo upload infrastructure)
**Requirements**: R2-01, R2-02
**Success Criteria** (what must be TRUE):
  1. FileStorageService uploads to and deletes from Cloudflare R2 via S3 SDK
  2. No local filesystem code remains in FileStorageService
  3. Item image URLs stored in DB are full R2 public URLs
  4. Next.js Image component renders images from R2 domain
  5. WebConfig and SecurityConfig no longer reference /uploads/**
  6. Backend and frontend tests updated for R2 storage
**Plans**: 2/2 — 08-01 (R2 backend), 08-02 (frontend + cleanup)
**UI hint**: no

### Phase 9: In-App Chat
**Goal**: Item-scoped real-time messaging between borrowers and item owners via WebSocket + STOMP
**Depends on**: Phase 7 (auth infrastructure)
**Requirements**: CHAT-01, CHAT-02, CHAT-03, CHAT-04
**Success Criteria** (what must be TRUE):
  1. chat_messages table stores messages with sender, receiver, item, and timestamps
  2. WebSocket + STOMP configured with JWT authentication and SockJS fallback
  3. REST endpoints serve conversation history and inbox
  4. STOMP delivers messages in real-time to online recipients
  5. Frontend ChatWindow component renders message thread with send capability
  6. Item detail page has "Message Owner" button opening chat modal
  7. /messages page shows conversation list with unread badges
  8. Navbar shows unread message count badge
  9. Backend and frontend tests cover chat functionality
**Plans**: 4/4
Plans:
- [x] 09-01-PLAN.md — Data model + WebSocket infrastructure: Flyway V14, ChatMessage entity, ChatRepository, WebSocket+STOMP with JWT auth ✓ 2026-06-26
- [x] 09-02-PLAN.md — Backend: REST endpoints for conversation history + inbox, STOMP send/receive controller ✓ 2026-06-26
- [x] 09-03-PLAN.md — Frontend: ChatWindow, /messages page, navbar badge, "Message Owner" button ✓ 2026-06-26
- [x] 09-04-PLAN.md — Tests: backend + frontend chat tests ✓ 2026-06-26
**UI hint**: yes

### Phase 10: Email Service & Auth Simplification
**Goal**: Migrate email from SMTP to Resend API, enable async email sending, simplify login/register to Google-only
**Depends on**: Phase 7 (Google OAuth)
**Requirements**: EMAIL-01, AUTH-05
**Success Criteria** (what must be TRUE):
  1. EmailService sends verification emails via Resend REST API (no SMTP dependency)
  2. Email sending is async (@EnableAsync + @Async) — non-blocking registration response
  3. Login and register pages show only Google sign-in button (no credential forms)
  4. Unverified users can re-register (old tokens cleaned up, details overwritten)
  5. User.phone field is mutable (val → var) for profile updates
**Plans**: N/A (completed in main branch)
**UI hint**: yes

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Fix Critical Issues & Testing Foundation | 7/7 | Complete | 2026-06-18 |
| 2. Photo Upload Feature | 0/TBD | Complete | 2026-06-19 |
| 3. E2E Tests & CI/CD Pipeline | 0/TBD | Not started | - |
| 4. Code Quality & Technical Debt | 0/TBD | Not started | - |
| 5. Community Features | 3/3 | Complete | 2026-06-19 |
| 6. Location Search | 0/5 | Not started | - |
| 7. Google OAuth Signup | 4/4 | Complete | 2026-06-25 |
| 8. Photo Upload R2 Migration | 2/2 | Complete | 2026-06-25 |
| 9. In-App Chat | 4/4 | Complete | 2026-06-26 |
| 10. Email Service & Auth Simplification | N/A | Complete | 2026-06-27 |
