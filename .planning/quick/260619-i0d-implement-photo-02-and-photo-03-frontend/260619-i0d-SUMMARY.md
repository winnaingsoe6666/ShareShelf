---
phase: 02-photo-upload
plan: 02-frontend-upload-ui
subsystem: frontend
tags: [image-upload, ui-component, photo-02, photo-03]
requires: [backend-image-upload-endpoints]
provides: [ImageUploadComponent, ItemPageImageUpload, ClickableItemCards]
affects: [create-item-page, item-detail-page, item-card]
tech-stack:
  added: []
  patterns: [formdata-multipart-upload, encodeURIComponent-query-encoding, url-createObjectURL-preview, i18n-link-navigation]
key-files:
  created:
    - frontend/src/components/ui/ImageUpload.tsx
    - frontend/src/components/ui/__tests__/ImageUpload.test.tsx
    - frontend/src/app/[locale]/items/new/page.tsx
    - frontend/src/app/[locale]/items/[id]/page.tsx
  modified:
    - frontend/src/components/items/ItemCard.tsx
    - frontend/src/app/[locale]/items/new/__tests__/page.test.tsx
decisions:
  - "ImageUpload component uses local state for preview/error management, delegating actual API calls to parent via onUpload/onRemove callbacks"
  - "Images are uploaded sequentially after item creation via FormData multipart POST"
  - "DELETE uses encodeURIComponent on URL query param for safe encoding"
  - "ItemCard wrapped in i18n Link (from @/i18n/navigation) for locale-aware navigation"
metrics:
  duration: ~10 minutes
  completed_date: "2026-06-19T06:13:57Z"
---

# Phase 2 Plan 2: ImageUpload Component and Frontend Integration

Multi-image upload UI component with preview and remove, integrated into item create and detail pages, with clickable ItemCard navigation.

## Tasks Executed

| # | Name | Commit | Status |
|---|------|--------|--------|
| 1 | Create ImageUpload component with test suite (TDD) | f8e45ba (RED), 6f74ac5 (GREEN) | Complete |
| 2 | Integrate ImageUpload into create/detail pages and wrap ItemCard in Link | 772ebd3 | Complete |
| 3 | Update integration tests for image upload | c3b1def | Complete |

## Verification Results

- ImageUpload component tests: **10/10 passing**
- Create item page tests: **8/8 passing** (6 existing + 2 new)
- Overall test suite: 17/22 test files passing (129/131 tests) — 5 pre-existing failures unrelated to this plan

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] jsdom missing URL.createObjectURL/revokeObjectURL**
- **Found during:** Task 1 (GREEN phase)
- **Issue:** jsdom does not implement `URL.createObjectURL` or `URL.revokeObjectURL`, causing 3 test failures
- **Fix:** Added `beforeAll` mock for `URL.createObjectURL` (returns blob:mock-* URL) and `URL.revokeObjectURL` (no-op) in the test file
- **Files modified:** `frontend/src/components/ui/__tests__/ImageUpload.test.tsx`

### Path Discrepancy

**2. Plan specified `[locale]` paths but pages did not exist**
- **Found during:** Task 2
- **Issue:** Plan's `files_modified` listed `frontend/src/app/[locale]/items/new/page.tsx` and `[locale]/items/[id]/page.tsx`, but only non-locale versions existed at `items/`. The `[locale]` directories contained test scaffolding only.
- **Fix:** Created the `[locale]` page files as specified, implementing the full page logic with ImageUpload integration alongside the existing non-locale pages

### Pre-existing Failures

- 5 test files fail due to incomplete `[locale]` migration (borrow, login, profile, register pages missing at `[locale]` path). These are out of scope for this plan. Logged to deferred-items.md.

## Known Stubs

None. All features are fully functional — ImageUpload component handles all states (add, preview, upload, error, disabled, max), pages are wired to backend endpoints, and ItemCard navigation works.

## Threat Flags

None. All threat mitigations from the plan's threat model are in place:
- File input accept attribute restricts types (defense-in-depth for T-02-01)
- `encodeURIComponent` used for DELETE URL param (mitigation for T-02-02)
- `maxFiles` limits upload count to 5 (mitigation for T-02-04)

## Self-Check: PASSED

All created files verified present. All 4 commits (f8e45ba, 6f74ac5, 772ebd3, c3b1def) confirmed in git history.
