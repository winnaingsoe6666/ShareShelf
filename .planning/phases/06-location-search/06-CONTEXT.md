# Phase 6: Location Search - Context

**Gathered:** 2026-06-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Add spatial location search to ShareShelf. Users can set an item's location by dropping a pin on a map during create/edit, browse items by distance with a radius filter on the existing browse page, and view items spatially on a dedicated map search page. Backend uses PostGIS for efficient spatial queries — a single Flyway migration enables the extension on Railway's existing PostgreSQL.

This phase delivers coordinates-on-items + distance search + map UI. It does NOT add address autocomplete, geocoding APIs, or real-time location tracking.
</domain>

<decisions>
## Implementation Decisions

### Geocoding & Location Capture
- **D-01:** Pin-drop on a map (Leaflet) — no geocoding API or address typing. Free, zero API costs.
- **D-02:** Location stored as `GEOMETRY(Point, 4326)` on the `items` table via PostGIS. No coordinates on User model.
- **D-03:** Existing `community` text field on User stays unchanged — it remains a social/profile label. Items carry their own spatial location independently.

### Search UX
- **D-04:** Both filter + map view. Distance filter on the existing browse page (text search, category, status, rating + new radius/distance). "View on Map" toggle switches to a dedicated `/items/map` page with Leaflet.
- **D-05:** "Near Me" uses browser geolocation (`navigator.geolocation`) to auto-center the map. User grants permission once.

### Map Provider
- **D-06:** Leaflet with OpenStreetMap tiles. Free, no API key, no usage limits. `react-leaflet` for React integration.

### Distance Filter
- **D-07:** Walking-scale radius presets: 1km, 3km, 5km, 10km. Matches the "borrow from neighbors" vision.

### Scope Level
- **D-08:** Full map experience. Includes: PostGIS migration, pin-drop on create/edit, distance filter on browse page, dedicated map search page with marker clustering, and "View on Map" toggle.

### Testing
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
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & Roadmap
- `.planning/ROADMAP.md` — Overall phase structure; Phase 6 extends search beyond Phase 5's COMM-03
- `.planning/REQUIREMENTS.md` — v1 and v2 requirements; location search is a new v2-level capability

### Existing Code (directly affected)
- `backend/src/main/kotlin/com/shareshelf/item/entity/Item.kt` — Entity to add location column to
- `backend/src/main/kotlin/com/shareshelf/item/ItemRepository.kt` — Repository to add spatial query method
- `backend/src/main/kotlin/com/shareshelf/item/ItemService.kt` — Service to pass location params
- `backend/src/main/kotlin/com/shareshelf/item/ItemController.kt` — Controller to expose nearLat/nearLng/nearRadius params
- `backend/src/main/kotlin/com/shareshelf/item/dto/ItemDtos.kt` — DTOs to add lat/lng to CreateItemRequest and distance to ItemResponse
- `backend/src/main/resources/db/migration/` — Flyway migrations (V11: postgis extension, V12: location column + GiST index)
- `frontend/src/app/[locale]/items/page.tsx` — Browse page to add distance filter + map toggle
- `frontend/src/app/[locale]/items/new/page.tsx` — Create item page to add pin-drop component
- `frontend/src/components/items/ItemCard.tsx` — Card to optionally show distance

### Architecture
- `.planning/codebase/ARCHITECTURE.md` — System architecture for integration context
- `.planning/codebase/CONVENTIONS.md` — Existing coding patterns to follow
- `CLAUDE.md` — Project conventions (controllers, services, repositories, DTOs, frontend patterns)
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **Browse page filter pattern** (`frontend/src/app/[locale]/items/page.tsx`): Category chips, status filter, rating filter, debounced text search — distance filter slots into this pattern. Same `params` object → `api.get("/items", { params })` approach.
- **ItemCard component** (`frontend/src/components/items/ItemCard.tsx`): Already renders image, title, price, category. Can add a distance badge.
- **API client** (`frontend/src/lib/api.ts`): Axios instance with JWT interceptor. No changes needed — new params pass through existing `params` mechanism.
- **ImageUpload component** (`frontend/src/components/ui/ImageUpload.tsx`): Pattern for adding interactive UI to item create/edit form. Pin-drop follows a similar "add a widget to the form" pattern.

### Established Patterns
- **Repository queries**: `@Query` with JPQL and `@Param` annotations in `ItemRepository.search()`. New spatial query follows the same pattern but uses native PostGIS functions via `function()` JPQL escape.
- **Controller param passing**: `@RequestParam(required = false)` for optional filter params. `nearLat`, `nearLng`, `nearRadius` follow this convention.
- **Flyway migrations**: Versioned SQL files (`V{N}__description.sql`). Extension enablement + schema change are two separate migrations.
- **DTO patterns**: `data class` with `= null` defaults for optional fields. `lat`/`lng` on `CreateItemRequest` should be nullable/optional.

### Integration Points
- **Item entity**: Add `location` column (GEOMETRY Point, 4326). Not a Kotlin-managed field — raw JDBC or a PostGIS JDBC type mapping needed. Hibernate Spatial or manual `ST_AsText`/`ST_MakePoint` handling.
- **GET /api/items**: New optional query params `nearLat`, `nearLng`, `nearRadius`. When all three present, use spatial query. When absent, existing text/category search unchanged.
- **POST /api/items**: `CreateItemRequest` gains optional `latitude`/`longitude` fields.
- **ItemResponse**: Gains optional `latitude`, `longitude`, and `distance` (meters, only populated when spatial query used).
- **Browse page**: New "Nearby" section in filters with radius dropdown + geolocation button. "View on Map" link/toggle opens `/items/map`.
- **Map page**: New `frontend/src/app/[locale]/items/map/page.tsx` with `react-leaflet` MapContainer. Fetches items with current map bounds or user location.
- **Create/Edit item pages**: Leaflet map widget for pin placement. Single marker, draggable. On save, lat/lng included in request body.
</code_context>

<specifics>
## Specific Ideas

- Map should auto-center on user's location via `navigator.geolocation.getCurrentPosition()` on first visit
- Radius filter should feel like the existing category/status chips — a row of preset distance buttons
- Map markers should cluster when zoomed out (`leaflet.markercluster` is the standard approach)
- Distance shown on item cards as "1.2 km away" when a location filter is active
- The pin-drop on create/edit should default to the map center (user's location) with a draggable marker
- OSM tile attribution must be included per OpenStreetMap requirements

No specific external references or "make it like X" examples — open to standard map UX patterns.
</specifics>

<deferred>
## Deferred Ideas

- **Address autocomplete / geocoding**: Deferred indefinitely. Pin-drop avoids the need for geocoding APIs and their costs. If address input is needed later, Nominatim (free) should be tried before paid APIs.
- **User home location**: Deferred. Items carry their own location; User model stays unchanged. If "default location for all my items" is desired later, add user-level coordinates then.
- **Real-time location tracking**: Out of scope — no live GPS or item tracking. Static pin locations only.
- **Route/directions**: Out of scope — distance is straight-line (crow-flies). Turn-by-turn directions belong in a separate phase.

None — discussion stayed within phase scope.
</deferred>

---

*Phase: 06-Location Search*
*Context gathered: 2026-06-19*
