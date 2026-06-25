---
phase: 06
slug: location-search
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-06-19
---

# Phase 06 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework (backend)** | JUnit 5 + MockK 1.13.14 |
| **Framework (frontend)** | Vitest 3.2.6 + @testing-library/react 16.3.2 |
| **Config file (backend)** | `backend/build.gradle.kts` (test dependencies) |
| **Config file (frontend)** | `frontend/vitest.config.ts` |
| **Quick run command (backend)** | `cd backend && ./gradlew test --tests "com.shareshelf.item.*"` |
| **Quick run command (frontend)** | `cd frontend && npx vitest run --reporter=verbose` |
| **Full suite command (backend)** | `cd backend && ./gradlew test` |
| **Full suite command (frontend)** | `cd frontend && npm test` |
| **Estimated runtime** | ~45 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd backend && ./gradlew test` and `cd frontend && npx vitest run`
- **After every plan wave:** Full backend + frontend test suite
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 1 | LOC-01 | T-06-01 / N/A | PostGIS extension enabled via Flyway migration | integration | `./gradlew test --tests "*FlywayTest"` | ❌ W0 | ⬜ pending |
| 06-01-02 | 01 | 1 | LOC-02 | T-06-02 | Item entity stores lat/lng as Point; DTOs accept/produce coordinates | unit | `./gradlew test --tests "ItemServiceTest"` | ✅ (needs extension) | ⬜ pending |
| 06-02-01 | 02 | 1 | LOC-02 | T-06-02 | LocationPicker renders, accepts pin-drop, fires onChange | unit | `cd frontend && npx vitest run src/components/map/__tests__/LocationPicker.test.tsx` | ❌ W0 | ⬜ pending |
| 06-03-01 | 03 | 1 | LOC-03 | T-06-03 | DistanceFilter renders radius presets, fires geolocation | unit | `cd frontend && npx vitest run src/components/map/__tests__/DistanceFilter.test.tsx` | ❌ W0 | ⬜ pending |
| 06-03-02 | 03 | 1 | LOC-03 | T-06-04 | Browse page includes radius params in API call when geolocation granted | integration | `cd frontend && npx vitest run src/app/\[locale\]/items/__tests__/page.test.tsx` | ❌ W0 | ⬜ pending |
| 06-04-01 | 04 | 2 | LOC-04 | T-06-05 | MapView renders markers, clusters, popups, handles empty/error states | unit | `cd frontend && npx vitest run src/components/map/__tests__/MapView.test.tsx` | ❌ W0 | ⬜ pending |
| 06-04-02 | 04 | 2 | LOC-04 | T-06-05 | `/items/map` page renders and fetches items | integration | `cd frontend && npx vitest run src/app/\[locale\]/items/map/__tests__/page.test.tsx` | ❌ W0 | ⬜ pending |
| 06-05-01 | 05 | 2 | LOC-05 | T-06-06 | Spatial query uses GiST index (EXPLAIN ANALYZE shows Index Scan) | integration | `./gradlew test --tests "*SpatialIndexTest"` | ❌ W0 | ⬜ pending |
| 06-05-02 | 05 | 2 | LOC-05 | T-06-06 | findNearby returns correct items within radius, excludes items beyond radius | unit | `./gradlew test --tests "ItemRepositoryTest"` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `backend/src/test/kotlin/com/shareshelf/item/ItemRepositoryTest.kt` — covers LOC-05 (spatial query correctness)
- [ ] `backend/src/test/kotlin/com/shareshelf/item/SpatialIndexTest.kt` — covers LOC-05 (GiST index verification)
- [ ] `frontend/src/components/map/__tests__/LocationPicker.test.tsx` — covers LOC-02
- [ ] `frontend/src/components/map/__tests__/MapView.test.tsx` — covers LOC-04
- [ ] `frontend/src/components/map/__tests__/DistanceFilter.test.tsx` — covers LOC-03
- [ ] `frontend/src/app/[locale]/items/__tests__/page.test.tsx` — covers LOC-03 (browse page integration)
- [ ] `frontend/src/app/[locale]/items/map/__tests__/page.test.tsx` — covers LOC-04 (map page integration)
- [ ] Leaflet mock setup in `frontend/src/test/setup.ts` — required for all map component tests (jsdom has no map rendering)
- [ ] PostGIS-enabled test database — required for spatial query tests to run

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Map tile rendering | LOC-04 | jsdom cannot render Leaflet/OpenStreetMap tiles | Open `/items/map`, verify tiles load, markers cluster at zoom < 16 |
| Browser geolocation prompt | LOC-03 | `navigator.geolocation` requires user gesture in real browser | Click "Near Me" button, accept permission, verify map centers on user |
| OSM attribution display | LOC-04 | Attribution is rendered by Leaflet, not testable in jsdom | Verify "© OpenStreetMap contributors" appears on map page |
| Nominatim reverse-geocode rate limiting | N/A | Rate-limit behavior is timing-dependent | Verify neighborhood labels throttle at ~1 req/sec |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
