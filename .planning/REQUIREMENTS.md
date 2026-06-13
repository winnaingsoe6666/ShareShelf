# Requirements: ShareShelf

**Defined:** 2026-06-13
**Core Value:** Users can discover and borrow tools from neighbors in their community, with a trusted borrowing workflow that protects both lenders and borrowers.

## v1 Requirements

### Phase 1: Fix Critical Issues & Testing Foundation

- [ ] **FIX-01**: Add `@Transactional` to `BorrowService.create()` to prevent item/borrow state desync
- [ ] **FIX-02**: Fix borrow page tab filter — users should only see their own requests
- [ ] **FIX-03**: Fix CORS configuration for production (Vercel → Railway)
- [ ] **FIX-04**: Fix uncaught exceptions in JWT filter (return 401 instead of 500)
- [ ] **FIX-05**: Wire `categoryName` through item create/update responses (currently hardcoded null)
- [ ] **FIX-06**: Fix empty catch blocks in borrow page (don't swallow API errors)
- [ ] **FIX-07**: Replace hardcoded category options with API-driven data
- [ ] **FIX-08**: Move auth redirects from render to `useEffect` in frontend
- [ ] **FIX-09**: Add safe null handling for nullable entity IDs (replace `!!`)
- [ ] **TEST-01**: Add JUnit 5 + MockK test dependencies and write backend unit tests
- [ ] **TEST-02**: Add Vitest + React Testing Library and write frontend component tests
- [ ] **RALPH-01**: Establish Claude Code memory with project context

### Phase 2: Photo Upload Feature

- [ ] **PHOTO-01**: Backend API endpoint for item photo upload (local filesystem)
- [ ] **PHOTO-02**: Frontend image upload UI component for item create/edit forms
- [ ] **PHOTO-03**: Display uploaded images on item detail page and cards
- [ ] **PHOTO-04**: Backend tests for photo upload (JUnit 5 + MockMvc)
- [ ] **PHOTO-05**: Frontend tests for image upload component

### Phase 3: E2E Tests & CI/CD

- [ ] **TEST-03**: E2E tests with Playwright for critical paths (login, browse, borrow flow)
- [ ] **RALPH-02**: CI/CD pipeline with GitHub Actions — test gate before deploy
- [ ] **RALPH-03**: Automated Playwright E2E runs in CI
- [ ] **RALPH-04**: Vercel preview deployments with E2E smoke tests

### Phase 4: Code Quality & Technical Debt

- [ ] **QUAL-01**: Replace data class entities with regular classes (JPA proxy safety)
- [ ] **QUAL-02**: Add API rate limiting
- [ ] **QUAL-03**: Add input validation improvements across all endpoints
- [ ] **QUAL-04**: Fix N+1 query patterns in BorrowService and ReviewService
- [ ] **QUAL-05**: Add request logging middleware

### Phase 5: Community Features

- [ ] **COMM-01**: User notifications (in-app) for borrow request status changes
- [ ] **COMM-02**: Community dashboard showing active borrows and available items
- [ ] **COMM-03**: Enhanced search with filters (distance, availability, rating)

## v2 Requirements

### Notifications

- **NOTF-01**: Email notifications for borrow request status changes
- **NOTF-02**: Push notifications for mobile (future)

### Admin

- **ADMN-01**: Admin dashboard for community management
- **ADMN-02**: Content moderation tools

### Advanced Features

- **ADVN-01**: Item availability calendar
- **ADVN-02**: Recurring borrow scheduling
- **ADVN-03**: Tool maintenance tracking

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real-time chat | Borrow flow is async via request/approve; chat adds high complexity |
| Mobile apps (iOS/Android) | Web-first with responsive design; PWA possible later |
| Payment processing | Free community sharing model |
| OAuth/Social login | Email/password sufficient for community-scale use |
| Cloud photo storage (S3) | Local filesystem for v1; S3 migration deferred |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FIX-01 | Phase 1 | Pending |
| FIX-02 | Phase 1 | Pending |
| FIX-03 | Phase 1 | Pending |
| FIX-04 | Phase 1 | Pending |
| FIX-05 | Phase 1 | Pending |
| FIX-06 | Phase 1 | Pending |
| FIX-07 | Phase 1 | Pending |
| FIX-08 | Phase 1 | Pending |
| FIX-09 | Phase 1 | Pending |
| TEST-01 | Phase 1 | Pending |
| TEST-02 | Phase 1 | Pending |
| RALPH-01 | Phase 1 | Pending |
| PHOTO-01 | Phase 2 | Pending |
| PHOTO-02 | Phase 2 | Pending |
| PHOTO-03 | Phase 2 | Pending |
| PHOTO-04 | Phase 2 | Pending |
| PHOTO-05 | Phase 2 | Pending |
| TEST-03 | Phase 3 | Pending |
| RALPH-02 | Phase 3 | Pending |
| RALPH-03 | Phase 3 | Pending |
| RALPH-04 | Phase 3 | Pending |
| QUAL-01 | Phase 4 | Pending |
| QUAL-02 | Phase 4 | Pending |
| QUAL-03 | Phase 4 | Pending |
| QUAL-04 | Phase 4 | Pending |
| QUAL-05 | Phase 4 | Pending |
| COMM-01 | Phase 5 | Pending |
| COMM-02 | Phase 5 | Pending |
| COMM-03 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 29 total
- Mapped to phases: 29
- Unmapped: 0 ✓

---
*Requirements defined: 2026-06-13*
*Last updated: 2026-06-13 after initial definition*
