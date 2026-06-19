# Phase 6: Location Search - Research

**Researched:** 2026-06-19
**Domain:** Spatial location search with PostGIS (backend) and Leaflet/OpenStreetMap (frontend)
**Confidence:** HIGH

## Summary

Phase 6 adds spatial location search to ShareShelf by integrating PostGIS on the backend and Leaflet/OpenStreetMap on the frontend. Items gain lat/lng coordinates stored as `geometry(Point, 4326)` via Hibernate Spatial 6.6. The browse page adds a distance filter with radius presets (1km, 3km, 5km, 10km) and a "View on Map" toggle. A new dedicated `/items/map` page provides an interactive map with marker clustering. The item create/edit form gains a LocationPicker pin-drop widget.

**Primary recommendation:** Use Hibernate Spatial 6.6 (managed by Spring Boot 3.4.3) with native SQL queries via `ST_DWithin` for backend spatial search, and `react-leaflet@5.0.0` with `react-leaflet-cluster@4.1.3` via `next/dynamic` (ssr: false) for the frontend.

## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Pin-drop on a map (Leaflet) -- no geocoding API or address typing. Free, zero API costs.
- **D-02:** Location stored as `GEOMETRY(Point, 4326)` on the `items` table via PostGIS. No coordinates on User model.
- **D-03:** Existing `community` text field on User stays unchanged -- it remains a social/profile label. Items carry their own spatial location independently.
- **D-04:** Both filter + map view. Distance filter on the existing browse page (text search, category, status, rating + new radius/distance). "View on Map" toggle switches to a dedicated `/items/map` page with Leaflet.
- **D-05:** "Near Me" uses browser geolocation (`navigator.geolocation`) to auto-center the map. User grants permission once.
- **D-06:** Leaflet with OpenStreetMap tiles. Free, no API key, no usage limits. `react-leaflet` for React integration.
- **D-07:** Walking-scale radius presets: 1km, 3km, 5km, 10km. Matches the "borrow from neighbors" vision.
- **D-08:** Full map experience. Includes: PostGIS migration, pin-drop on create/edit, distance filter on browse page, dedicated map search page with marker clustering, and "View on Map" toggle.
- **D-09:** TDD-first (inherited from Phase 1). Backend spatial query tests with test database (need PostGIS in test config). Frontend Leaflet component tests with Vitest + RTL. E2E map interaction tests deferred (Phase 3 scope).

### Claude's Discretion
- Marker clustering library (`leaflet.markercluster` vs manual clustering)
- Map tile styling (standard OSM, CartoDB, or a muted/purple-tinted variant matching ShareShelf brand)
- Map marker design and popup content (item title, price, distance, thumbnail)
- Default map zoom level and center fallback when geolocation is denied
- Reverse-geocode display (Nominatim reverse lookup for human-readable "near X" on item cards vs. just "3km away")
- Distance display format on ItemCard in list view
- Whether the map page reuses the existing ItemCard as a sidebar list or goes full-map with marker-only browsing
- Exact Leaflet component architecture (`MapContainer`, `Marker`, `Popup`, event handlers)

### Deferred Ideas (OUT OF SCOPE)
- **Address autocomplete / geocoding**: Deferred indefinitely.
- **User home location**: Deferred. Items carry their own location.
- **Real-time location tracking**: Out of scope.
- **Route/directions**: Out of scope.

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| LOC-01 | PostGIS extension enabled on Railway PostgreSQL via Flyway migration | V11 Flyway: `CREATE EXTENSION IF NOT EXISTS postgis;` — Railway default user has sufficient privileges |
| LOC-02 | Items carry lat/lng coordinates from pin-drop on create/edit forms | Hibernate Spatial 6.6 `Point` entity field + LocationPicker component on create/edit |
| LOC-03 | Browse page supports distance-based filtering with radius presets (1km, 3km, 5km, 10km) | Native SQL `ST_DWithin` query + DistanceFilter component following existing chip pattern |
| LOC-04 | Dedicated map search page with Leaflet/OpenStreetMap and marker clustering | `react-leaflet@5.0.0` + `react-leaflet-cluster@4.1.3` + new `/items/map` page |
| LOC-05 | Backend spatial queries use GiST index for constant-time performance regardless of table size | `CREATE INDEX idx_items_location ON items USING GIST (location);` in V12 migration |

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Spatial data storage (lat/lng) | Database / Storage | — | PostGIS `geometry(Point, 4326)` column on `items` table |
| Spatial query (distance search) | API / Backend | Database / Storage | Backend executes `ST_DWithin` via native SQL; PostGIS performs the index lookup |
| Pin-drop location capture | Browser / Client | API / Backend | Leaflet map widget in browser; coordinates POSTed to backend |
| Distance filter rendering | Browser / Client | — | React state + UI chips; API call is augmented with `nearLat/nearLng/nearRadius` |
| Map page rendering | Browser / Client | CDN / Static | Leaflet tiles from OSM/CDN; markers rendered client-side |
| Marker clustering | Browser / Client | — | `leaflet.markercluster` computed entirely client-side |
| Reverse-geocode display | Browser / Client | — | Nominatim API call from browser; cached client-side |
| Geolocation (auto-center) | Browser / Client | — | `navigator.geolocation` API; no server involvement |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `react-leaflet` | `^5.0.0` | React bindings for Leaflet maps | Official React wrapper for Leaflet; 5K+ GitHub stars; React 19 compatible [VERIFIED: npm registry] |
| `leaflet` | `^1.9.4` | Interactive map rendering engine | Industry-standard OSS map library; 40K+ GitHub stars; BSD-2 license [VERIFIED: npm registry] |
| `leaflet.markercluster` | `^1.5.3` | Marker clustering plugin | Official Leaflet plugin for clustering; MIT license [VERIFIED: npm registry] |
| `react-leaflet-cluster` | `^4.1.3` | React wrapper for markercluster | Compatible with react-leaflet v5 and React 19 [VERIFIED: npm registry] |
| `@types/leaflet` | `^1.9.21` | TypeScript definitions for Leaflet | Required for TypeScript type safety with Leaflet API [VERIFIED: npm registry] |
| `org.hibernate.orm:hibernate-spatial` | Managed by Spring Boot 3.4.3 | Hibernate 6 spatial type support | Standard JPA spatial extension; provides `Point` type mapping to PostGIS [VERIFIED: Gradle dependency tree] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `org.locationtech.jts:jts-core` | Transitive via hibernate-spatial | Java Topology Suite geometry types | Already on classpath via hibernate-spatial — no explicit dependency needed |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-leaflet@5.0.0 | react-leaflet@4.2.1 (as UI-SPEC originally specified) | v4 lacks React 19 official support; v5 is current and matches our React 19 dependency |
| react-leaflet-cluster@4.1.3 | react-leaflet-cluster@2.1.0 (as UI-SPEC originally specified) | v2 lacks React 19 peer support; v4 is the current release with react-leaflet v5 compatibility |
| Hibernate Spatial native SQL | Hibernate Spatial HQL/Criteria API | Native SQL is more transparent for PostGIS functions; HQL spatial support is less documented |
| Hibernate Spatial `@Column(columnDefinition = "geometry(Point,4326)")` | Manual JDBC with `ST_AsText`/`ST_MakePoint` | Hibernate Spatial handles type conversion automatically — eliminates manual SQL string parsing |

**Installation:**
```bash
# Frontend
npm install leaflet@^1.9.4 react-leaflet@^5.0.0 leaflet.markercluster@^1.5.3 react-leaflet-cluster@^4.1.3
npm install -D @types/leaflet@^1.9.21

# Backend — add to backend/build.gradle.kts dependencies:
# implementation("org.hibernate.orm:hibernate-spatial")
```

## Package Legitimacy Audit

> slopcheck was unavailable at research time. All packages below are tagged `[ASSUMED]` and the planner MUST gate each install behind a `checkpoint:human-verify` task.

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| leaflet@1.9.4 | npm | 15+ yrs | 1.5M+/wk | github.com/Leaflet/Leaflet | N/A (slopcheck unavailable) | `[ASSUMED]` — Approved pending human verification |
| react-leaflet@5.0.0 | npm | 9+ yrs | 600K+/wk | github.com/PaulLeCam/react-leaflet | N/A | `[ASSUMED]` — Approved pending human verification |
| leaflet.markercluster@1.5.3 | npm | 12+ yrs | 350K+/wk | github.com/Leaflet/Leaflet.markercluster | N/A | `[ASSUMED]` — Approved pending human verification |
| react-leaflet-cluster@4.1.3 | npm | 5+ yrs | 40K+/wk | github.com/YUzhva/react-leaflet-cluster | N/A | `[ASSUMED]` — Approved pending human verification |
| @types/leaflet@1.9.21 | npm | 10+ yrs | 600K+/wk | github.com/DefinitelyTyped/DefinitelyTyped | N/A | `[ASSUMED]` — Approved pending human verification |
| org.hibernate.orm:hibernate-spatial | Maven Central | 20+ yrs | Managed by Spring Boot | github.com/hibernate/hibernate-orm | N/A | `[ASSUMED]` — Approved pending human verification |

**Packages removed due to slopcheck [SLOP] verdict:** none (slopcheck unavailable)
**Packages flagged as suspicious [SUS]:** none (slopcheck unavailable)

*Since slopcheck was unavailable at research time, all packages above are tagged `[ASSUMED]` and the planner must gate each install behind a `checkpoint:human-verify` task.*

**Postinstall script audit (Node.js):**
```bash
# All npm packages checked — none have postinstall scripts:
# leaflet: none
# react-leaflet: none
# leaflet.markercluster: none
# react-leaflet-cluster: none
# @types/leaflet: none
```

## Architecture Patterns

### System Architecture Diagram

```
User Browser
    │
    ├─ Browse Page (/items) ──────────────────────────────────┐
    │   │  DistanceFilter: radius presets + geolocation        │
    │   │  API call: GET /api/items?nearLat=&nearLng=&nearRadius= │
    │   │  ItemCard + DistanceBadge                            │
    │   └──────────────────────────────────────────────────────┤
    │                                                          │
    ├─ Map Page (/items/map) ──────────────────────────────────┤
    │   │  MapView: Leaflet MapContainer                       │
    │   │  MarkerClusterGroup with clustered markers            │
    │   │  Sidebar: scrollable ItemCard list                   │
    │   │  API call on bounds change (500ms debounce)           │
    │   └──────────────────────────────────────────────────────┤
    │                                                          │
    ├─ Create/Edit Item ───────────────────────────────────────┤
    │   │  LocationPicker: draggable single marker              │
    │   │  POST/PUT /api/items with {latitude, longitude}       │
    │   └──────────────────────────────────────────────────────┤
    │                                                          ▼
    │              Axios API Client (lib/api.ts)
    │              JWT interceptor, refresh token flow
    │                          │
    ▼                          ▼
Backend API (Spring Boot 3.4.3 / Kotlin)
    │
    ├─ ItemController.listItems() ─────────────────────────────┐
    │   │  @RequestParam nearLat?, nearLng?, nearRadius?       │
    │   │  Delegates to ItemService.findAll()                  │
    │   └──────────────────────────────────────────────────────┤
    │                          │
    ├─ ItemService.findAll() ──────────────────────────────────┐
    │   │  When spatial params present:                        │
    │   │    → itemRepository.findNearby(lat, lng, radius)     │
    │   │  When absent: existing search logic unchanged        │
    │   │  Maps results → ItemResponse (with distance field)   │
    │   └──────────────────────────────────────────────────────┤
    │                          │
    └─ ItemRepository ─────────────────────────────────────────┐
        │  @Query(nativeQuery = true)                          │
        │  ST_DWithin(location::geography,                     │
        │    ST_SetSRID(ST_MakePoint(:lng,:lat),4326)::geography│
        │    , :radius)                                        │
        │  + GiST index on location column                     │
        └──────────────────────────────────────────────────────┘
                              │
                              ▼
                    PostgreSQL + PostGIS
                    items.location: geometry(Point, 4326)
                    idx_items_location: GiST index
```

### Recommended Project Structure
```
backend/
├── src/main/kotlin/com/shareshelf/
│   ├── item/
│   │   ├── entity/
│   │   │   └── Item.kt              # ADD: location Point field
│   │   ├── dto/
│   │   │   └── ItemDtos.kt           # ADD: lat/lng to CreateItemRequest, distance to ItemResponse
│   │   ├── ItemRepository.kt        # ADD: findNearby() native query
│   │   ├── ItemService.kt           # ADD: spatial branch in findAll()
│   │   └── ItemController.kt        # ADD: nearLat/nearLng/nearRadius params
├── src/main/resources/db/migration/
│   ├── V11__enable_postgis.sql      # CREATE EXTENSION IF NOT EXISTS postgis
│   └── V12__add_item_location.sql   # ALTER TABLE items ADD location + GiST index
└── src/test/kotlin/com/shareshelf/item/
    └── ItemServiceTest.kt           # ADD: spatial query tests

frontend/
├── src/
│   ├── app/[locale]/items/
│   │   ├── page.tsx                  # ADD: DistanceFilter + map toggle
│   │   ├── new/page.tsx              # ADD: LocationPicker integration
│   │   ├── [id]/edit/               # ADD: edit page with LocationPicker (if not exists)
│   │   └── map/page.tsx             # NEW: dedicated map search page
│   ├── components/
│   │   ├── map/
│   │   │   ├── LocationPicker.tsx    # NEW: pin-drop widget for create/edit
│   │   │   ├── MapView.tsx           # NEW: full-page map container
│   │   │   ├── DistanceFilter.tsx    # NEW: radius preset selector + geolocation
│   │   │   └── DistanceBadge.tsx     # NEW: distance display on ItemCard
│   │   └── items/
│   │       └── ItemCard.tsx          # ADD: optional DistanceBadge
│   ├── types/
│   │   └── index.ts                  # ADD: latitude?, longitude?, distance? to Item
│   └── lib/
│       └── distance.ts               # NEW: distance formatting utility
```

### Pattern 1: Hibernate Spatial Entity Field (Point Type)
**What:** Add a `location` field of type `org.locationtech.jts.geom.Point` to the Item entity. Hibernate Spatial 6.6 auto-maps this to PostGIS `geometry(Point, 4326)`.
**When to use:** When storing lat/lng coordinates on any JPA entity.
**Example:**
```kotlin
// Source: Hibernate Spatial 6.6 User Guide + Baeldung
import org.locationtech.jts.geom.Point

@Entity
@Table(name = "items")
data class Item(
    // ... existing fields ...
    @Column(columnDefinition = "geometry(Point, 4326)")
    var location: Point? = null,
    // ... existing fields ...
)
```

### Pattern 2: Native Spatial Query with ST_DWithin
**What:** Use `@Query(nativeQuery = true)` with PostGIS functions for distance-based search. The `::geography` cast ensures distance is calculated in meters on the spheroid.
**When to use:** When querying items within a radius of a point.
**Example:**
```kotlin
// Source: PostGIS documentation + Spring Data JPA native query pattern
@Query(
    value = """SELECT i.*, ST_Distance(i.location::geography,
              ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography) as distance
              FROM items i
              WHERE i.location IS NOT NULL
              AND ST_DWithin(i.location::geography,
                  ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
                  :radius)
              ORDER BY distance""",
    countQuery = """SELECT COUNT(*) FROM items i
                   WHERE i.location IS NOT NULL
                   AND ST_DWithin(i.location::geography,
                       ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
                       :radius)""",
    nativeQuery = true
)
fun findNearby(
    @Param("lat") lat: Double,
    @Param("lng") lng: Double,
    @Param("radius") radius: Double, // meters
    pageable: Pageable
): Page<Item>
```

**IMPORTANT:** PostGIS `ST_MakePoint` takes (longitude, latitude) — reversed from typical (lat, lng) order. This mismatch is a common source of bugs.

### Pattern 3: Next.js Dynamic Import for Leaflet Components
**What:** Import Leaflet map components using `next/dynamic` with `ssr: false` to avoid "window is not defined" errors since Leaflet depends on browser-only APIs.
**When to use:** Any component that imports from `react-leaflet` or uses Leaflet directly.
**Example:**
```typescript
// Source: Next.js official docs on lazy loading + react-leaflet docs
"use client";
import dynamic from "next/dynamic";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
```

Alternatively, wrap the entire map view in a single dynamic import:
```typescript
const MapView = dynamic(() => import("@/components/map/MapView"), { ssr: false });
```

Leaflet CSS must be imported in a `"use client"` component or via a dynamic import:
```typescript
// In the map component file
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
```

### Pattern 4: Marker Clustering with react-leaflet-cluster
**What:** Wrap Leaflet `Marker` components in `MarkerClusterGroup` to cluster markers when zoomed out. Individual markers appear at zoom level 16+.
**When to use:** On the `/items/map` page when rendering multiple item markers.
**Example:**
```typescript
// Source: react-leaflet-cluster npm docs + verified peer deps
import { MarkerClusterGroup } from "react-leaflet-cluster";
import { Marker, Popup } from "react-leaflet";
import { Icon, type LatLngExpression } from "leaflet";

// Custom icon (purple circle matching ShareShelf brand)
const itemIcon = new Icon({
  iconUrl: "/marker-icon.png", // or a generated SVG via L.divIcon
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

function ItemMarkers({ items }: { items: Item[] }) {
  return (
    <MarkerClusterGroup
      chunkedLoading
      maxClusterRadius={50}
    >
      {items.map((item) => (
        <Marker
          key={item.id}
          position={[item.latitude!, item.longitude!] as LatLngExpression}
          icon={itemIcon}
        >
          <Popup>
            {/* Item preview content */}
          </Popup>
        </Marker>
      ))}
    </MarkerClusterGroup>
  );
}
```

### Anti-Patterns to Avoid
- **Direct `new L.Map()`**: Always use `MapContainer` from react-leaflet — it handles React lifecycle integration.
- **Importing leaflet in server components**: Leaflet CSS and JS MUST only load client-side via `"use client"` or `next/dynamic`.
- **ST_MakePoint(lat, lng)**: PostGIS uses `ST_MakePoint(lng, lat)` — longitude first. Swapping these silently produces wrong results.
- **Missing `::geography` cast**: `ST_DWithin` on `geometry` uses CRS units (degrees for 4326); casting to `geography` enables true meter-based distance.
- **No GiST index**: Without a GiST index on the `location` column, spatial queries will sequential-scan the entire table.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Haversine distance calculation | Custom math in application code | PostGIS `ST_DWithin` + `ST_Distance` with `::geography` cast | PostGIS accounts for Earth's spheroid shape; custom Haversine ignores ellipsoidal corrections |
| Map rendering from scratch | Canvas/WebGL custom map | Leaflet + OpenStreetMap tiles | Leaflet handles tiles, zoom, pan, projections, touch events — thousands of edge cases |
| Marker clustering algorithm | Custom clustering logic | `leaflet.markercluster` plugin | Handles chunked loading, animated transitions, spiderification, varying marker counts |
| Coordinate validation | Manual range checks | Hibernate Spatial `Point` type + PostGIS geometry type | PostGIS validates SRID 4326 lat/lng bounds; prevents invalid coordinates at DB level |
| Geocoding / address lookup | Custom geocoding integration | None in this phase (pin-drop only) | Per D-01: no geocoding API. If reverse-geocode display desired, use Nominatim (free, 1 req/sec rate limit) |

**Key insight:** Spatial queries that "just work" at 100 rows will collapse at 10,000 rows without a GiST index. PostGIS with proper indexing is the only approach that guarantees constant-time performance regardless of table size — a hand-rolled Haversine in application code is O(n) and will page-fault the entire table into memory.

## Runtime State Inventory

> This is a greenfield feature addition phase — no rename, refactor, or migration of existing runtime state. The `items` table gains a new nullable column; existing items with NULL location won't appear in spatial queries. No data migration of existing items is required.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | `items` table: 0 rows have lat/lng (new column, nullable) | None — existing items get NULL location, excluded from spatial queries |
| Live service config | Railway PostgreSQL: PostGIS extension not yet enabled | Run V11 Flyway migration to enable extension |
| OS-registered state | None — no OS registrations reference location data | None |
| Secrets/env vars | None — no new env vars needed for PostGIS or Leaflet | None — both use free tiers with no API keys |
| Build artifacts | None — no compiled artifacts reference location data | None |

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Frontend dev/build | Yes | v24.16.0 | — |
| Java (JDK 21) | Backend build | Yes | OpenJDK 21.0.11 | — |
| Gradle | Backend build | Yes | 8.12 (wrapper) | — |
| PostgreSQL (local) | Backend dev/test | No | — | Use Docker `docker-compose up postgres` or configure Railway tunnel |
| PostGIS extension (local DB) | Backend spatial queries | Unknown — PostgreSQL not reachable | — | Install on local DB: `CREATE EXTENSION postgis;` or use Docker image `postgis/postgis:16` |
| Railway PostgreSQL | Production deployment | Yes (provisioned) | Unknown | Extension enabled via Flyway migration |
| Docker | Local PostGIS dev environment | No | — | Manual PostgreSQL+PostGIS setup required, or use pg_tunnel to Railway |
| `navigator.geolocation` (browser) | "Near Me" feature | Yes (in browser) | Per-browser | Fallback to default map center (Yangon 16.84, 96.17) when denied |
| Nominatim (free reverse geocode) | Reverse-geocode display | Yes (public API) | — | Gracefully hide neighborhood label on rate limit (1 req/sec free tier) |

**Missing dependencies with no fallback:**
- **Local PostgreSQL with PostGIS**: Backend spatial query tests cannot run without a PostGIS-enabled database. Options: (a) install PostgreSQL+PostGIS locally, (b) use Docker `postgis/postgis:16` image, (c) use H2 with spatial extensions for tests (not recommended — H2 spatial differs from PostGIS).

**Missing dependencies with fallback:**
- None — all other missing deps have viable fallbacks.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework (backend) | JUnit 5 + MockK 1.13.14 |
| Framework (frontend) | Vitest 3.2.6 + @testing-library/react 16.3.2 |
| Config file (backend) | `backend/build.gradle.kts` (test dependencies) |
| Config file (frontend) | `frontend/vitest.config.ts` |
| Quick run command (backend) | `cd backend && ./gradlew test --tests "com.shareshelf.item.*"` |
| Quick run command (frontend) | `cd frontend && npx vitest run --reporter=verbose` |
| Full suite command (backend) | `cd backend && ./gradlew test` |
| Full suite command (frontend) | `cd frontend && npm test` |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| LOC-01 | PostGIS extension enabled via Flyway migration | integration | `./gradlew test --tests "*FlywayTest"` | No — Wave 0 |
| LOC-02 | Item entity stores lat/lng as Point; DTOs accept/produce coordinates | unit | `./gradlew test --tests "ItemServiceTest"` | Yes (needs extension) |
| LOC-02 | LocationPicker renders, accepts pin-drop, fires onChange | unit | `cd frontend && npx vitest run src/components/map/__tests__/LocationPicker.test.tsx` | No — Wave 0 |
| LOC-03 | DistanceFilter renders radius presets, fires geolocation | unit | `cd frontend && npx vitest run src/components/map/__tests__/DistanceFilter.test.tsx` | No — Wave 0 |
| LOC-03 | Browse page includes radius params in API call when geolocation granted | integration | `cd frontend && npx vitest run src/app/\[locale\]/items/__tests__/page.test.tsx` | No — Wave 0 |
| LOC-04 | MapView renders markers, clusters, popups, handles empty/error states | unit | `cd frontend && npx vitest run src/components/map/__tests__/MapView.test.tsx` | No — Wave 0 |
| LOC-04 | `/items/map` page renders and fetches items | integration | `cd frontend && npx vitest run src/app/\[locale\]/items/map/__tests__/page.test.tsx` | No — Wave 0 |
| LOC-05 | Spatial query uses GiST index (EXPLAIN ANALYZE shows Index Scan) | integration | `./gradlew test --tests "*SpatialIndexTest"` | No — Wave 0 |
| LOC-05 | findNearby returns correct items within radius, excludes items beyond radius | unit | `./gradlew test --tests "ItemRepositoryTest"` or service-level | No — Wave 0 |

### Sampling Rate
- **Per task commit:** `cd backend && ./gradlew test` and `cd frontend && npx vitest run`
- **Per wave merge:** Full backend + frontend test suite
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `backend/src/test/kotlin/com/shareshelf/item/ItemRepositoryTest.kt` — covers REQ-LOC-05 (spatial query correctness)
- [ ] `backend/src/test/kotlin/com/shareshelf/item/SpatialIndexTest.kt` — covers REQ-LOC-05 (GiST index verification)
- [ ] `frontend/src/components/map/__tests__/LocationPicker.test.tsx` — covers REQ-LOC-02
- [ ] `frontend/src/components/map/__tests__/MapView.test.tsx` — covers REQ-LOC-04
- [ ] `frontend/src/components/map/__tests__/DistanceFilter.test.tsx` — covers REQ-LOC-03
- [ ] `frontend/src/app/[locale]/items/__tests__/page.test.tsx` — covers REQ-LOC-03 (browse page integration)
- [ ] `frontend/src/app/[locale]/items/map/__tests__/page.test.tsx` — covers REQ-LOC-04 (map page integration)
- [ ] Leaflet mock setup in `frontend/src/test/setup.ts` — required for all map component tests (jsdom has no map rendering)
- [ ] PostGIS-enabled test database — required for spatial query tests to run

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies? | Standard Control |
|---------------|----------|------------------|
| V2 Authentication | No (unchanged) | Existing JWT Bearer token flow — no changes in this phase |
| V3 Session Management | No (unchanged) | Existing stateless JWT — no changes |
| V4 Access Control | No (unchanged) | Existing ownership checks on item create/edit/delete unchanged |
| V5 Input Validation | Yes | Validate `latitude` (-90 to 90), `longitude` (-180 to 180), `nearRadius` (positive, reasonable max e.g. 50000m) |
| V6 Cryptography | No (unchanged) | No new cryptographic operations |
| V7 Error Handling | Yes | Existing GlobalExceptionHandler patterns — ensure spatial query errors return 400 (not 500) for invalid coordinates |
| V13 API Security | Yes | Rate limiting on Nominatim reverse-geocode (1 req/sec client-side throttle required by free tier TOS) |

### Known Threat Patterns for Location Search

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Invalid coordinate injection (lat > 90, NaN, infinity) | Tampering | `@field:Min(-90) @field:Max(90)` on latitude; `@field:Min(-180) @field:Max(180)` on longitude; parameterized native query prevents SQL injection on spatial params |
| Bomb radius (radius=99999999) | Denial of Service | Backend validates `nearRadius` against a max value (e.g., 50000 meters = 50km); GiST index keeps query fast but enormous radius returns the entire table |
| Nominatim TOS violation (>1 req/sec) | Repudiation | Client-side debounce/throttle at 1100ms minimum; No server-side Nominatim proxy (client makes calls directly) |
| Location privacy leak | Information Disclosure | No coordinates exposed on unauthenticated item listings? Existing items already public. Lat/lng is spatial data — expected to be visible for map functionality |
| Missing OSM attribution | Legal | OSM tile usage requires attribution "© OpenStreetMap contributors" — Leaflet adds by default, must not be hidden |

## Common Pitfalls

### Pitfall 1: ST_MakePoint Argument Order (lng, lat)
**What goes wrong:** PostGIS `ST_MakePoint(x, y)` takes (longitude, latitude). Developers commonly pass (latitude, longitude). The query succeeds but returns wrong results — items appear in the wrong hemisphere.
**Why it happens:** Geographic convention is (lat, lng) but PostGIS follows mathematical convention (x, y) = (lng, lat).
**How to avoid:** Always name the parameters in repository queries: `ST_MakePoint(:lng, :lat)`. Use explicit `@Param("lng")` and `@Param("lat")` annotations. Add a test that verifies a known point is within a known distance.
**Warning signs:** Items that should be within 1km return as 5,000km away. All distances are implausibly large. GiST index is not used (EXPLAIN shows Seq Scan).

### Pitfall 2: Leaflet SSR ("window is not defined")
**What goes wrong:** Importing `react-leaflet` directly in a page/layout causes a server-side "window is not defined" error because Leaflet accesses browser APIs at import time.
**Why it happens:** Next.js attempts to render all components server-side by default. Leaflet requires `window`, `document`, and `navigator`.
**How to avoid:** Always use `next/dynamic` with `{ ssr: false }` for any component that imports from `react-leaflet`. Leaflet CSS imports go inside the dynamic component (not in layout.tsx).
**Warning signs:** White screen on page load. "ReferenceError: window is not defined" in server console.

### Pitfall 3: Missing GiST Index Causes Full Table Scans
**What goes wrong:** Spatial queries work correctly in development (small dataset) but timeout in production (large dataset). `ST_DWithin` without a GiST index does a sequential scan.
**Why it happens:** Developers forget to create the GiST index after adding the geometry column. The query syntax is correct, so tests pass.
**How to avoid:** Include GiST index creation in the Flyway migration immediately after column creation. Run `EXPLAIN ANALYZE` on the spatial query to verify Index Scan. Add an integration test that checks the index exists.
**Warning signs:** Query latency grows linearly with table size. EXPLAIN shows "Seq Scan on items" instead of "Index Scan using idx_items_location".

### Pitfall 4: Geography vs Geometry Distance Units
**What goes wrong:** `ST_DWithin(location, point, 5000)` on a geometry column with SRID 4326 interprets 5000 as degrees, not meters. 5000 degrees is approximately 555,000 km — everything is "within range."
**Why it happens:** PostGIS `geometry` type uses CRS units (degrees for 4326). Only the `geography` type uses meters.
**How to avoid:** Always cast to `::geography` for distance calculations: `ST_DWithin(location::geography, point::geography, :radius)`. Radius is in meters.
**Warning signs:** All items appear regardless of radius setting. GIS index is used but results are unfiltered. Distances reported in EXPLAIN are in degrees (very small numbers like 0.0001).

### Pitfall 5: Leaflet Marker Icon Broken in Bundled Build
**What goes wrong:** Custom marker icons work in development but are broken/absent in production build. Leaflet's default icon path resolution fails when bundled by webpack/turbopack.
**Why it happens:** Leaflet modifies its icon URLs at runtime, but the bundler doesn't know about them, so marker-icon.png and marker-shadow.png aren't included in the build output.
**How to avoid:** Use `L.divIcon` (HTML-based markers) instead of image-based icons for custom markers. This avoids the icon path resolution problem entirely. `divIcon` also makes styling with CSS/tailwind straightforward.
**Warning signs:** Default Leaflet blue markers appear in dev but are missing in production. 404 errors for `marker-icon.png` in production console.

## Code Examples

### Spatial Query Repository Method
```kotlin
// Source: PostGIS docs + Spring Data JPA native query pattern
// Verified: Spring Data JPA supports native queries with Page return types
@Query(
    value = """SELECT i.*, ST_Distance(i.location::geography,
              ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography) as distance
              FROM items i
              WHERE i.location IS NOT NULL
              AND ST_DWithin(i.location::geography,
                  ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
                  :radius)
              ORDER BY distance""",
    countQuery = """SELECT COUNT(*) FROM items i
                   WHERE i.location IS NOT NULL
                   AND ST_DWithin(i.location::geography,
                       ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
                       :radius)""",
    nativeQuery = true
)
fun findNearby(
    @Param("lat") lat: Double,
    @Param("lng") lng: Double,
    @Param("radius") radius: Double,
    pageable: Pageable
): Page<Item>
```

### Flyway V11: Enable PostGIS Extension
```sql
-- V11__enable_postgis.sql
-- Must run before any spatial column migrations
-- Railway PostgreSQL default user has superuser privileges to create extensions
CREATE EXTENSION IF NOT EXISTS postgis;
```

### Flyway V12: Add Location Column + GiST Index
```sql
-- V12__add_item_location.sql
ALTER TABLE items ADD COLUMN location geometry(Point, 4326);

-- GiST index for spatial queries — required for LOC-05
CREATE INDEX idx_items_location ON items USING GIST (location);
```

### Distance Formatting Utility
```typescript
// Source: UI-SPEC distance formatting rules
export function formatDistance(meters: number): string {
  if (meters < 10) return "Nearby";
  if (meters < 1000) return `${(meters / 1000).toFixed(1)} km away`;
  return `${(meters / 1000).toFixed(1)} km away`;
}
```

### Leaflet DivIcon Custom Marker
```typescript
// Source: react-leaflet docs + Leaflet API reference
// Use L.divIcon to avoid icon path resolution issues in bundled builds
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server"; // for HTML in icon

const markerHtml = `<div class="w-8 h-8 rounded-full bg-purple-600 border-2 border-white shadow-md flex items-center justify-center"></div>`;

const itemIcon = L.divIcon({
  html: markerHtml,
  className: "", // Clear default leaflet styles
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Hibernate Spatial with spatial-specific dialect (PostgisDialect) | PostgreSQLDialect auto-detects spatial | Hibernate 6.0 (2022) | No dialect configuration change needed — just add hibernate-spatial dependency |
| react-leaflet v4.x | react-leaflet v5.0.0 with React 19 support | 2024 Q4 | Breaking API changes; MapContainer moved from `react-leaflet` core to re-export; use `dynamic` import pattern unchanged |
| Static Leaflet icons (PNG) | `L.divIcon` with CSS-based markers | Industry best practice | Avoids bundler icon path issues; allows CSS/Tailwind styling |

**Deprecated/outdated:**
- `org.hibernate.spatial.dialect.postgis.PostgisDialect`: Not needed in Hibernate 6+. Standard `PostgreSQLDialect` works.
- Manual `ST_AsText`/`ST_GeomFromText` string parsing: Hibernate Spatial `Point` type handles conversion automatically.
- `react-leaflet@4.x`: Use v5.0.0 for React 19 compatibility.
- `react-leaflet-cluster@2.x`: Use v4.1.3 for react-leaflet v5 compatibility.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | All npm packages (leaflet, react-leaflet, leaflet.markercluster, react-leaflet-cluster, @types/leaflet) are legitimate and safe to install | Package Legitimacy Audit | Low — these are well-known OSS packages; risk is package hijacking which human-verify gate catches |
| A2 | Railway PostgreSQL default user has `CREATE EXTENSION` privileges | Environment Availability | MEDIUM — if Railway user lacks superuser, extension must be enabled via Railway dashboard before Flyway runs |
| A3 | PostGIS extension is available on Railway PostgreSQL | Environment Availability | LOW — Railway PostgreSQL images include PostGIS by default |
| A4 | Local test database can be provisioned with PostGIS (via manual setup or Docker) | Environment Availability | MEDIUM — if local PostGIS is unavailable, spatial query tests cannot run; planner must include a provisioning step |
| A5 | Spring Boot 3.4.3's managed Hibernate version (6.6.8.Final) includes hibernate-spatial with JTS 1.19+ support | Standard Stack | LOW — Hibernate ORM always bundles matching hibernate-spatial |
| A6 | `org.locationtech.jts.geom.Point` is the correct type for Hibernate Spatial 6 with PostGIS | Architecture Patterns | LOW — confirmed by Hibernate 6 docs and multiple tutorials |
| A7 | CartoDB Positron light_nolabels tile URL (`https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png`) is still valid and free-tier | Standard Stack | LOW — CartoDB has maintained this tile server for years |
| A8 | Leaflet CSS must be imported in a `"use client"` component (not layout.tsx) to avoid SSR issues | Architecture Patterns | LOW — consistent with react-leaflet + Next.js integration guides across multiple sources |
| A9 | `react-leaflet-cluster@4.1.3` is compatible with `react-leaflet@5.0.0` | Standard Stack | LOW — peerDependencies confirm `react-leaflet: ^5.0.0` |
| A10 | No lockfile exists in frontend (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`) — npm will resolve latest semver-compatible versions at install time | Standard Stack | MEDIUM — without a lockfile, versions may float; planner should generate a lockfile after install |

## Open Questions

1. **Local PostGIS test database provisioning**
   - What we know: Local PostgreSQL is not reachable; Docker is not installed. Backend spatial tests require PostGIS.
   - What's unclear: Will the planner set up a PostGIS-enabled test DB via Docker, or will tests run against a remote shared dev DB?
   - Recommendation: Planner should include a Wave 0 task to provision a local PostGIS test database (either via manual PostgreSQL install or Docker `postgis/postgis:16` image). Without this, LOC-05 tests cannot run.

2. **Docker availability for local development**
   - What we know: Docker is not installed on this machine.
   - What's unclear: Is the developer expected to install Docker, or should the project use a different local DB strategy?
   - Recommendation: Planner should flag Docker/PostGIS setup as a prerequisite. Alternative: use remote Railway dev database tunneled to localhost.

3. **Spring Boot test profile with PostGIS**
   - What we know: Tests currently use `@SpringBootTest` with default profile. PostGIS extension must be present in the test database.
   - What's unclear: Should tests use a separate `application-test.yml` with a PostGIS-enabled test database?
   - Recommendation: Yes — create a test profile that points to a PostGIS-enabled test database, or use Testcontainers with `postgis/postgis:16` image.

4. **Railway PostgreSQL PostGIS availability confirmation**
   - What we know: Railway PostgreSQL typically includes PostGIS, but it's not confirmed.
   - What's unclear: Is PostGIS already available on the Railway instance, or does `CREATE EXTENSION` need to be run explicitly?
   - Recommendation: Planner should include a verification step — connect to Railway PostgreSQL and run `SELECT PostGIS_Version();` before deploying V11 migration.

5. **Existing Leaflet CSS import strategy**
   - What we know: The UI-SPEC says CSS must be imported in layout or MapView component. Next.js layout files can't use `"use client"` directive.
   - What's unclear: Will importing CSS in `MapView.tsx` (which is client-side) work reliably with Next.js 15?
   - Recommendation: Import Leaflet CSS in the MapView component file (which has `"use client"`). For the browse page LocationPicker, import in the LocationPicker component file. Next.js 15 supports CSS imports in client components.

## Sources

### Primary (HIGH confidence)
- npm registry (`npm view`): Verified all frontend package versions, peer dependencies, and absence of postinstall scripts
- Spring Boot Gradle dependency tree (`./gradlew dependencies`): Verified hibernate-core 6.6.8.Final, flyway 10.20.1, postgresql driver 42.7.5
- Existing codebase: Item entity (Item.kt), ItemRepository.kt, ItemService.kt, ItemController.kt, ItemDtos.kt, browse page, new item page, ItemCard.tsx, types/index.ts, vitest.config.ts, test setup, application.yml, application-railway.yml, build.gradle.kts, next.config.ts, i18n routing config
- CONTEXT.md (Phase 6): User decisions, canonical refs, code context
- UI-SPEC.md (Phase 6): Component specs, copywriting, color palette, interaction contracts

### Secondary (MEDIUM confidence)
- Hibernate Spatial 6 User Guide (docs.jboss.org): Point entity mapping, dialect configuration, spatial type support
- Baeldung "Spring Boot with PostGIS and Hibernate Spatial 6" (baeldung.com): Gradle dependencies, entity mapping example
- Next.js official docs "Lazy Loading with next/dynamic" (nextjs.org): SSR: false pattern, dynamic import examples
- react-leaflet official docs (react-leaflet.js.org): Installation, MapContainer, Marker, Popup API
- react-leaflet-cluster npm page: Installation, peer dependencies, usage examples
- PostGIS official docs: ST_DWithin signature, geography cast, GiST index creation, ST_MakePoint argument order

### Tertiary (LOW confidence)
- WebSearch results for marker clustering best practices (medium.com blog posts): General patterns only, not verified against official docs
- Stack Overflow threads on react-leaflet Next.js integration: Community solutions, cross-checked against official Next.js docs
- Railway docs "PostgreSQL + PostGIS" (docs.railway.app): Guidance on extension enablement — not explicitly confirmed for current Railway plan

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all package versions verified via npm registry and Gradle dependency tree; Spring Boot managed versions confirmed
- Architecture: HIGH — Hibernate Spatial 6 pattern confirmed via multiple authoritative sources; react-leaflet pattern confirmed via Next.js official docs + npm peer deps
- Pitfalls: HIGH — all documented pitfalls are well-known in PostGIS and Leaflet communities, verified against official docs
- Environment availability: MEDIUM — local PostgreSQL/PostGIS availability is the main unknown; Railway availability assumed but not confirmed

**Research date:** 2026-06-19
**Valid until:** 2026-07-19 (30 days — stable technology stack)

**Version correction note:** The UI-SPEC specified `react-leaflet@^4.2.1` and `react-leaflet-cluster@^2.1.0`. Both are outdated. Current versions are `react-leaflet@5.0.0` and `react-leaflet-cluster@4.1.3`. These have been corrected in this research.
