# Phase 06: Location Search - Pattern Map

**Mapped:** 2026-06-19
**Files analyzed:** 25 (new + modified)
**Analogs found:** 20 / 25

## File Classification

| # | New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|-------------------|------|-----------|----------------|---------------|
| 1 | `backend/.../item/entity/Item.kt` (modify) | entity | CRUD | itself — existing entity | exact |
| 2 | `backend/.../item/dto/ItemDtos.kt` (modify) | dto | CRUD | itself — existing DTOs | exact |
| 3 | `backend/.../item/ItemRepository.kt` (modify) | repository | CRUD | itself — existing `search()` @Query | exact |
| 4 | `backend/.../item/ItemService.kt` (modify) | service | CRUD | itself — existing `findAll()` | exact |
| 5 | `backend/.../item/ItemController.kt` (modify) | controller | request-response | itself — existing `listItems()` | exact |
| 6 | `backend/.../db/migration/V11__enable_postgis.sql` (new) | migration | schema-change | `V9__add_items_version.sql` | role-match |
| 7 | `backend/.../db/migration/V12__add_item_location.sql` (new) | migration | schema-change | `V9__add_items_version.sql` | role-match |
| 8 | `backend/.../item/ItemRepositoryTest.kt` (new) | test | CRUD | `ItemServiceTest.kt` | role-match |
| 9 | `backend/.../item/SpatialIndexTest.kt` (new) | test | CRUD | `ItemServiceTest.kt` | role-match |
| 10 | `frontend/src/app/[locale]/items/page.tsx` (modify) | page | request-response | itself — existing browse page | exact |
| 11 | `frontend/src/app/[locale]/items/new/page.tsx` (modify) | page | request-response | itself — existing create page | exact |
| 12 | `frontend/src/components/items/ItemCard.tsx` (modify) | component | request-response | itself — existing card | exact |
| 13 | `frontend/src/types/index.ts` (modify) | type | config | itself — existing types | exact |
| 14 | `frontend/src/app/[locale]/items/map/page.tsx` (new) | page | request-response | `items/page.tsx` (browse page) | role-match |
| 15 | `frontend/src/components/map/LocationPicker.tsx` (new) | component | event-driven | `ImageUpload.tsx` (form widget) | role-match |
| 16 | `frontend/src/components/map/MapView.tsx` (new) | component | event-driven | no analog — uses Leaflet | none |
| 17 | `frontend/src/components/map/DistanceFilter.tsx` (new) | component | request-response | category/status chip row in `items/page.tsx` | role-match |
| 18 | `frontend/src/components/map/DistanceBadge.tsx` (new) | component | request-response | `Badge.tsx` | role-match |
| 19 | `frontend/src/lib/distance.ts` (new) | utility | transform | `lib/utils.ts` (formatPrice, formatDate) | role-match |
| 20 | `frontend/src/test/setup.ts` (modify) | config | test | itself — existing setup | exact |
| 21 | `frontend/src/components/map/__tests__/LocationPicker.test.tsx` (new) | test | event-driven | `Badge.test.tsx` | role-match |
| 22 | `frontend/src/components/map/__tests__/MapView.test.tsx` (new) | test | event-driven | `Badge.test.tsx` | role-match |
| 23 | `frontend/src/components/map/__tests__/DistanceFilter.test.tsx` (new) | test | request-response | `Badge.test.tsx` | role-match |
| 24 | `frontend/src/app/[locale]/items/__tests__/page.test.tsx` (new) | test | request-response | `items/new/__tests__/page.test.tsx` | role-match |
| 25 | `frontend/src/app/[locale]/items/map/__tests__/page.test.tsx` (new) | test | request-response | `items/new/__tests__/page.test.tsx` | role-match |

---

## Pattern Assignments

### 1. `backend/src/main/kotlin/com/shareshelf/item/entity/Item.kt` (entity, CRUD) — MODIFY

**Analog:** itself (`backend/.../item/entity/Item.kt`)

Add a new nullable field for location. Existing field patterns show `var` with default value for mutable columns, nullable `Type?` for optional columns.

**Add this field after the `status` field (line 45):**

```kotlin
// Line ~46: new location field using Hibernate Spatial Point type
@Column(columnDefinition = "geometry(Point, 4326)")
var location: org.locationtech.jts.geom.Point? = null,
```

**Add this import alongside existing imports:**

```kotlin
// (import auto-resolved by IDE; explicit for PATTERNS.md reference)
import org.locationtech.jts.geom.Point
```

Pattern source: `Item.kt:17-58` — all fields use `var` with defaults for mutable data, `val` for IDs and timestamps. Nullable optional columns use `Type? = null`.

---

### 2. `backend/src/main/kotlin/com/shareshelf/item/dto/ItemDtos.kt` (dto, CRUD) — MODIFY

**Analog:** itself (`backend/.../item/dto/ItemDtos.kt`)

Add optional lat/lng to CreateItemRequest (nullable, defaults null), and lat/lng/distance to ItemResponse.

**Add to `CreateItemRequest` (after `depositAmount`, line 20):**

```kotlin
// Pattern from CreateItemRequest:10-21 — optional fields: Type? = null
val latitude: Double? = null,
val longitude: Double? = null,
```

**Add validation annotations (alongside existing annotations, lines 9-11):**

```kotlin
// On latitude field:
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min

@field:Min(-90) @field:Max(90)
val latitude: Double? = null,

@field:Min(-180) @field:Max(180)
val longitude: Double? = null,
```

**Add to `ItemResponse` (after `createdAt`, line 45):**

```kotlin
// Pattern from ItemResponse:33-45 — all val properties, no defaults for required fields
val latitude: Double? = null,
val longitude: Double? = null,
val distance: Double? = null,  // meters, only populated for spatial queries
```

---

### 3. `backend/src/main/kotlin/com/shareshelf/item/ItemRepository.kt` (repository, CRUD) — MODIFY

**Analog:** itself — existing `search()` method at lines 17-32

Add a native spatial query method. The existing `search()` uses JPQL with `@Query` and `@Param`. The new `findNearby()` uses `nativeQuery = true` with PostGIS functions.

**Add after the `findTopLenders` method (line 41):**

```kotlin
// Pattern: existing search() at ItemRepository.kt:17-32 uses @Query + @Param + Pageable return
// New: native query for PostGIS ST_DWithin + ST_Distance
// WARNING: ST_MakePoint(x, y) = ST_MakePoint(lng, lat) — not (lat, lng)!
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
    @Param("radius") radius: Double,  // meters
    pageable: Pageable
): Page<Item>
```

Pattern: `ItemRepository.kt:17-32` — `@Query` annotation with string template, `@Param` for each parameter, returns `Page<Item>`. The new method uses `nativeQuery = true` instead of JPQL.

---

### 4. `backend/src/main/kotlin/com/shareshelf/item/ItemService.kt` (service, CRUD) — MODIFY

**Analog:** itself — existing `findAll()` at lines 43-58

Add nearLat/nearLng/nearRadius params to findAll(), branch to spatial query when all three are present.

**Modify `findAll()` signature (line 43) and body (lines 49-57):**

```kotlin
// Pattern: existing findAll() at ItemService.kt:43-58
// Add new parameters and spatial branch
fun findAll(
    search: String? = null,
    categoryId: Long? = null,
    status: ItemStatus? = null,
    minRating: Double? = null,
    nearLat: Double? = null,       // NEW
    nearLng: Double? = null,       // NEW
    nearRadius: Double? = null,    // NEW — meters
    pageable: Pageable
): Page<ItemResponse> {
    val items = when {
        nearLat != null && nearLng != null && nearRadius != null -> {
            // Spatial query branch — NEW
            itemRepository.findNearby(nearLat, nearLng, nearRadius, pageable)
        }
        search != null || categoryId != null || status != null || minRating != null -> {
            itemRepository.search(search, categoryId, status, minRating, pageable)
        }
        else -> {
            itemRepository.findAll(pageable)
        }
    }
    return items.map { item ->
        toResponse(item, item.owner?.name ?: "Unknown", item.owner?.trustScore?.toDouble() ?: 0.0)
    }
}
```

**Modify `toResponse()` (line 131) to include location + distance from the query result:**

```kotlin
// Pattern: existing toResponse() at ItemService.kt:131-148
// The native query adds a synthetic "distance" column — extract it if available
// For location, use item.location?.x (lng) and item.location?.y (lat)
// IMPORTANT: JTS Point uses (x=lng, y=lat) — geographic convention reversed!
private fun toResponse(item: Item, ownerName: String, ownerTrustScore: Double): ItemResponse {
    val category = item.categoryId?.let { categoryRepository.findById(it).orElse(null) }
    return ItemResponse(
        id = item.id!!,
        ownerId = item.ownerId,
        ownerName = ownerName,
        ownerTrustScore = ownerTrustScore,
        categoryId = item.categoryId,
        categoryName = category?.name,
        title = item.title,
        description = item.description,
        dailyPrice = item.dailyPrice,
        depositAmount = item.depositAmount,
        status = item.status,
        imageUrls = parseJsonArray(item.imageUrls),
        createdAt = item.createdAt,
        latitude = item.location?.y,   // NEW: JTS Point.y = latitude
        longitude = item.location?.x,  // NEW: JTS Point.x = longitude
        distance = null // NOTE: native query synthetic column not auto-mapped by JPA
                        // Planner: use explicit column mapping or post-processing
    )
}
```

Pattern: `ItemService.kt:43-58` — method uses conditional branching for query selection, maps repository `Page<Item>` to `Page<ItemResponse>` via lambda with `toResponse()`.

---

### 5. `backend/src/main/kotlin/com/shareshelf/item/ItemController.kt` (controller, CRUD) — MODIFY

**Analog:** itself — existing `listItems()` at lines 28-38

Add three new optional @RequestParam parameters to the listItems endpoint.

**Modify `listItems()` method (lines 28-38):**

```kotlin
// Pattern: existing listItems() at ItemController.kt:28-38
// Add new @RequestParam(required = false) entries alongside existing filter params
@GetMapping
fun listItems(
    @RequestParam(required = false) search: String?,
    @RequestParam(required = false) categoryId: Long?,
    @RequestParam(required = false) status: ItemStatus?,
    @RequestParam(required = false) minRating: Double?,
    @RequestParam(required = false) nearLat: Double?,       // NEW
    @RequestParam(required = false) nearLng: Double?,       // NEW
    @RequestParam(required = false) nearRadius: Double?,    // NEW — meters, valid 1–50000
    @PageableDefault(size = 20, sort = ["createdAt"], direction = Sort.Direction.DESC) pageable: Pageable
): ResponseEntity<ApiResponse<Page<ItemResponse>>> {
    // When nearRadius provided but no coords, or vice versa — validate
    if (nearRadius != null && (nearLat == null || nearLng == null)) {
        throw IllegalArgumentException("nearLat and nearLng are required when nearRadius is provided")
    }
    if (nearRadius != null && (nearRadius < 1 || nearRadius > 50000)) {
        throw IllegalArgumentException("nearRadius must be between 1 and 50000 meters")
    }
    val items = itemService.findAll(search, categoryId, status, minRating, nearLat, nearLng, nearRadius, pageable)
    return ResponseEntity.ok(ApiResponse.success(items))
}
```

Pattern: `ItemController.kt:28-38` — `@RequestParam(required = false)` for optional filter params, delegates to service method with same parameter names, returns `ResponseEntity.ok(ApiResponse.success(...))`.

---

### 6. `backend/src/main/resources/db/migration/V11__enable_postgis.sql` (migration, schema-change) — NEW

**Analog:** `V9__add_items_version.sql` — single-column ALTER TABLE pattern

V9 shows the minimal migration format: a single SQL statement with no header comments. V11 enables the PostGIS extension.

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

Pattern source: `V9__add_items_version.sql` — single statement, no transaction markers, versioned filename `V{N}__{description}.sql`.

Naming convention from existing: `V9__add_items_version.sql`, `V10__create_notifications.sql` → use `V11__enable_postgis.sql`.

---

### 7. `backend/src/main/resources/db/migration/V12__add_item_location.sql` (migration, schema-change) — NEW

**Analog:** `V9__add_items_version.sql` (ALTER TABLE) + `V10__create_notifications.sql` (CREATE INDEX)

V9 pattern: single ALTER TABLE ADD COLUMN. V10 pattern: CREATE INDEX after table creation. V12 combines both.

```sql
ALTER TABLE items ADD COLUMN location geometry(Point, 4326);

CREATE INDEX idx_items_location ON items USING GIST (location);
```

Pattern: `V9__add_items_version.sql:1` — `ALTER TABLE items ADD COLUMN version BIGINT NOT NULL DEFAULT 0;` — no transaction markers. `V10__create_notifications.sql:16-17` — `CREATE INDEX idx_notifications_user ON notifications (user_id);`.

Naming: `V12__add_item_location.sql`.

---

### 8. `backend/src/test/kotlin/com/shareshelf/item/ItemRepositoryTest.kt` (test, CRUD) — NEW

**Analog:** `backend/src/test/kotlin/com/shareshelf/item/ItemServiceTest.kt`

Full test file structure extracted from ItemServiceTest.kt:

**Imports pattern** (lines 1-22):
```kotlin
package com.shareshelf.item

import com.shareshelf.item.entity.Item
import com.shareshelf.item.entity.ItemStatus
import io.mockk.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import java.math.BigDecimal
import java.time.LocalDateTime
import java.util.*
```

**Test class setup pattern** (lines 23-35):
```kotlin
class ItemRepositoryTest {

    // MockK pattern: mock dependencies, manually construct service
    private val itemRepository = mockk<ItemRepository>()
    // No @SpringBootTest — pure unit test

    // Helper to create test entities
    private fun testItem(...) = Item(...)
}
```

**Test method pattern** (lines 80-95):
```kotlin
@Test
fun `test name describes behavior`() {
    val pageable = PageRequest.of(0, 20)
    val item = testItem()
    val page = PageImpl(listOf(item), pageable, 1)

    every { itemRepository.someMethod(args) } returns page

    val result = target.method(args)

    assertEquals(expected, result.actual)
    verify(exactly = 1) { itemRepository.someMethod(args) }
}
```

**@BeforeEach pattern** (line 73-75):
```kotlin
@BeforeEach
fun setUp() {
    clearAllMocks()
}
```

Pattern: `ItemServiceTest.kt:23-449` — MockK for repository mocks, manual instantiation of the service under test, `clearAllMocks()` in `@BeforeEach`, descriptive backtick test names, `every { } returns { }` for stubbing, `verify { }` for assertions on mock calls.

---

### 9. `backend/src/test/kotlin/com/shareshelf/item/SpatialIndexTest.kt` (test, CRUD) — NEW

**Analog:** `ItemServiceTest.kt` — same MockK/JUnit 5 pattern

Follows the same test class structure as ItemServiceTest. This is an integration test that verifies the GiST index exists and is used by spatial queries. May need `@SpringBootTest` with a PostGIS-enabled database.

```kotlin
package com.shareshelf.item

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

class SpatialIndexTest {
    // Integration test pattern: @SpringBootTest with PostGIS test database
    // Tests that findNearby() uses GiST Index Scan (EXPLAIN ANALYZE)
    // Tests coordinate validation boundaries
}
```

Pattern: `ItemServiceTest.kt` for structure. Note: may need `@SpringBootTest` + `@ActiveProfiles("test")` with PostGIS test DB — different from pure unit test pattern. See RESEARCH.md Open Question #3 for test profile configuration.

---

### 10. `frontend/src/app/[locale]/items/page.tsx` (page, request-response) — MODIFY

**Analog:** itself — the existing browse page

Add DistanceFilter integration and "View on Map" toggle button. The existing filter pattern at lines 73-103 shows how filters are assembled into a `params` object and passed to `api.get("/items", { params })`.

**Add to state declarations (after line 55):**
```typescript
// Pattern: existing useState declarations at lines 50-56
const [nearLat, setNearLat] = useState<number | undefined>(undefined);
const [nearLng, setNearLng] = useState<number | undefined>(undefined);
const [nearRadius, setNearRadius] = useState<number | undefined>(undefined);
```

**Modify params object in fetchItems (lines 80-89):**
```typescript
// Pattern: existing params assembly at lines 80-92
const params: Record<string, string | number | undefined> = {
  search: debouncedSearch || undefined,
  categoryId: selectedCat?.id,
  status: statusFilter || undefined,
  minRating,
  nearLat,     // NEW
  nearLng,     // NEW
  nearRadius,  // NEW
  size: 50,
};
```

**Add DistanceFilter component (insert in filter row after the rating filter, line 219):**
```tsx
{/* Pattern: existing filter chip row at lines 169-219 */}
<DistanceFilter
  onLocationChange={(lat, lng, radius) => {
    setNearLat(lat);
    setNearLng(lng);
    setNearRadius(radius);
  }}
/>
```

**Add "View on Map" button (alongside "Add Item" button at line 117-124):**
```tsx
{/* Pattern: existing Link button at lines 117-124 */}
<Link
  href="/items/map"
  className="inline-flex items-center gap-1 rounded-lg border border-purple-300 px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-50 transition-all duration-200"
>
  <MapPin className="h-4 w-4" />
  View on Map
</Link>
```

Pattern: `items/page.tsx:73-103` — `useCallback` for fetchItems that assembles params, calls `api.get`, handles loading/error/empty states. `items/page.tsx:168-219` — filter chip row with flex layout and consistent button styling.

---

### 11. `frontend/src/app/[locale]/items/new/page.tsx` (page, request-response) — MODIFY

**Analog:** itself — existing create item page

Add LocationPicker integration. The page already has a form with sections for Item Details, Pricing, Category, Images (lines 96-180). LocationPicker follows the same "add a section to the form" pattern as ImageUpload.

**Add state (after line 24):**
```typescript
// Pattern: existing useState at lines 16-25
const [latitude, setLatitude] = useState<number | undefined>(undefined);
const [longitude, setLongitude] = useState<number | undefined>(undefined);
```

**Add location to POST body in handleSubmit (line 49-55):**
```typescript
// Pattern: existing api.post at lines 49-55
const res = await api.post("/items", {
  title,
  description: description || undefined,
  categoryId: categoryId ? Number(categoryId) : undefined,
  dailyPrice: dailyPrice ? Number(dailyPrice) : undefined,
  depositAmount: depositAmount ? Number(depositAmount) : undefined,
  latitude,   // NEW
  longitude,  // NEW
});
```

**Add LocationPicker section (insert before Image Upload section, line 160):**
```tsx
{/* Pattern: form section at lines 102-118 (Item Details) */}
<div className="space-y-4">
  <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-purple-800">
    <MapPin className="h-5 w-5 text-purple-500" />
    Location
  </h2>
  <LocationPicker
    latitude={latitude}
    longitude={longitude}
    onLocationChange={(lat, lng) => {
      setLatitude(lat);
      setLongitude(lng);
    }}
  />
</div>
```

Pattern: `items/new/page.tsx:96-180` — form sections use consistent spacing (`space-y-4`), section headers with icon + heading, form fields with labels. `ImageUpload` at line 166 shows the pattern for adding an interactive widget to the form.

---

### 12. `frontend/src/components/items/ItemCard.tsx` (component, request-response) — MODIFY

**Analog:** itself (`frontend/src/components/items/ItemCard.tsx`)

Add an optional DistanceBadge when the item has a `distance` property.

**Add before the closing `</div>` of the Card body (after line 46):**
```tsx
{/* Pattern: conditional rendering like categoryName at line 37-39 */}
{item.distance != null && (
  <DistanceBadge meters={item.distance} className="mt-2" />
)}
```

**Add import (line 6 area):**
```typescript
import DistanceBadge from "@/components/map/DistanceBadge";
```

Pattern: `ItemCard.tsx:37-39` — conditional rendering of optional fields with `&&` operator. `ItemCard.tsx:1-6` — colocated imports, default export function component.

---

### 13. `frontend/src/types/index.ts` (type, config) — MODIFY

**Analog:** itself (`frontend/src/types/index.ts`)

Add latitude, longitude, and distance to the Item interface.

**Add to Item interface (after `createdAt` at line 35):**
```typescript
// Pattern: existing optional properties at Item interface lines 29-31 (description?, categoryId?, etc.)
export interface Item {
  // ... existing fields ...
  createdAt: string;
  latitude?: number;   // NEW
  longitude?: number;  // NEW
  distance?: number;   // NEW — meters, only populated for spatial queries
}
```

Pattern: `types/index.ts:22-36` — `Item` interface uses `?` for optional fields.

---

### 14. `frontend/src/app/[locale]/items/map/page.tsx` (page, request-response) — NEW

**Analog:** `frontend/src/app/[locale]/items/page.tsx` (browse page)

The browse page pattern: "use client" directive, useState for data/loading/error, useEffect for data fetching, api.get with params, conditional rendering for loading/error/empty states, Navbar wrapper. The map page adds Leaflet dynamic import + MapView instead of an item grid.

```typescript
"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import api from "@/lib/api";
import type { Item } from "@/types";

// Pattern: dynamic import to avoid SSR with Leaflet
// Source: RESEARCH.md Pattern 3 — Next.js Dynamic Import for Leaflet
const MapView = dynamic(() => import("@/components/map/MapView"), { ssr: false });

export default function MapSearchPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userLat, setUserLat] = useState<number | undefined>(undefined);
  const [userLng, setUserLng] = useState<number | undefined>(undefined);
  const [radius, setRadius] = useState<number>(3000); // default 3km

  // Pattern: useEffect fetch from items/page.tsx:74-103
  useEffect(() => {
    setLoading(true);
    setError("");

    const params: Record<string, string | number> = {};
    if (userLat != null && userLng != null) {
      params.nearLat = userLat;
      params.nearLng = userLng;
      params.nearRadius = radius;
    }
    params.size = 50;

    api.get("/items", { params })
      .then((res) => setItems(res.data.data?.content ?? []))
      .catch(() => setError("Failed to load items"))
      .finally(() => setLoading(false));
  }, [userLat, userLng, radius]);

  // Pattern: loading/error/empty states from items/page.tsx:224-258
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6">
          <h1 className="font-heading text-3xl font-bold text-purple-900 flex items-center gap-2">
            <MapPin className="h-8 w-8" />
            Search by Map
          </h1>
          <p className="mt-2 text-stone-600">Discover tools near you</p>
        </div>

        {loading ? (
          <div className="h-96 rounded-2xl bg-purple-100 animate-pulse flex items-center justify-center">
            <p className="text-purple-400">Loading map...</p>
          </div>
        ) : error ? (
          <p className="py-16 text-center text-stone-500">{error}</p>
        ) : (
          <MapView
            items={items}
            userLat={userLat}
            userLng={userLng}
            radius={radius}
            onRadiusChange={setRadius}
            onLocationFound={(lat, lng) => {
              setUserLat(lat);
              setUserLng(lng);
            }}
          />
        )}
      </main>
    </>
  );
}
```

Pattern: `items/page.tsx:47-263` — "use client" directive, function component with default export, useState/useEffect/useCallback for state management, Navbar wrapper, `api.get` with params assembly, conditional rendering for loading/error/empty states. RESEARCH.md Pattern 3 — `next/dynamic` with `{ ssr: false }` for Leaflet components.

---

### 15. `frontend/src/components/map/LocationPicker.tsx` (component, event-driven) — NEW

**Analog:** `frontend/src/components/ui/ImageUpload.tsx` — interactive form widget with file input, preview, clear

ImageUpload pattern: function component with default export, interface Props, useState for local state, useRef for DOM element access, useCallback for event handlers, use of lucide-react icons, Tailwind styling, disabled prop support.

Leaflet-specific concerns: must use `next/dynamic` in the page that imports it (NOT within LocationPicker itself if the page already handles SSR). LocationPicker internally uses `MapContainer`, `TileLayer`, `Marker` (draggable) from react-leaflet.

```typescript
"use client";

import { useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { MapPin } from "lucide-react";
import type { LatLng } from "leaflet";

interface LocationPickerProps {
  latitude?: number;
  longitude?: number;
  onLocationChange: (lat: number, lng: number) => void;
  disabled?: boolean;
}

// Default center: Yangon (per RESEARCH.md Environment Availability fallback)
const DEFAULT_CENTER: [number, number] = [16.84, 96.17];
const DEFAULT_ZOOM = 13;

export default function LocationPicker({
  latitude,
  longitude,
  onLocationChange,
  disabled = false,
}: LocationPickerProps) {
  const center: [number, number] = latitude != null && longitude != null
    ? [latitude, longitude]
    : DEFAULT_CENTER;

  const handleMarkerDrag = useCallback((e: { latlng: LatLng }) => {
    if (disabled) return;
    onLocationChange(e.latlng.lat, e.latlng.lng);
  }, [onLocationChange, disabled]);

  // Pattern from ImageUpload.tsx:74-162 — Tailwind card layout
  return (
    <div className="rounded-xl border border-purple-200 overflow-hidden">
      {!latitude && !longitude && (
        <p className="px-4 py-3 bg-purple-50 text-sm text-purple-700 border-b border-purple-200 flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Drag the marker to set your item's location
        </p>
      )}
      <div className="h-64 w-full">
        <MapContainer
          center={center}
          zoom={DEFAULT_ZOOM}
          className="h-full w-full"
          scrollWheelZoom={!disabled}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onMapClick={(lat, lng) => {
            if (!disabled) onLocationChange(lat, lng);
          }} />
          {latitude != null && longitude != null && (
            <Marker
              position={[latitude, longitude]}
              draggable={!disabled}
              eventHandlers={{ dragend: handleMarkerDrag }}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
}

// Click handler — separate component because useMapEvents must be inside MapContainer
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}
```

Pattern: `ImageUpload.tsx:1-163` — function component, interface Props, default export, disabled prop, Tailwind card/border styling. Leaflet patterns from RESEARCH.md Pattern 3-4.

---

### 16. `frontend/src/components/map/MapView.tsx` (component, event-driven) — NEW

**Analog:** none in existing codebase. Pattern from RESEARCH.md Patterns 3+4.

MapView is a full-page Leaflet map container with marker clustering. It MUST be imported via `next/dynamic` with `{ ssr: false }` by the page that uses it.

```typescript
"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { MarkerClusterGroup } from "react-leaflet-cluster";
import L, { type LatLngExpression } from "leaflet";
import { Link } from "@/i18n/navigation";
import type { Item } from "@/types";
import { formatPrice } from "@/lib/utils";
import { formatDistance } from "@/lib/distance";

// Leaflet CSS — imported in client component per RESEARCH.md Pitfall 2
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

// Custom divIcon per RESEARCH.md Pitfall 5
const itemIcon = L.divIcon({
  html: '<div class="w-8 h-8 rounded-full bg-purple-600 border-2 border-white shadow-md flex items-center justify-center"><svg class="w-4 h-4 text-white" ...></svg></div>',
  className: "",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

interface MapViewProps {
  items: Item[];
  userLat?: number;
  userLng?: number;
  radius: number;
  onRadiusChange: (radius: number) => void;
  onLocationFound: (lat: number, lng: number) => void;
}

const DEFAULT_CENTER: LatLngExpression = [16.84, 96.17]; // Yangon fallback

export default function MapView({
  items,
  userLat,
  userLng,
  radius,
  onRadiusChange,
  onLocationFound,
}: MapViewProps) {
  const center: LatLngExpression = userLat != null && userLng != null
    ? [userLat, userLng]
    : DEFAULT_CENTER;

  // items filtered to those with coordinates
  const locatedItems = items.filter((i) => i.latitude != null && i.longitude != null);

  return (
    <div className="rounded-2xl border border-purple-200 overflow-hidden shadow-md">
      <div className="h-[70vh] w-full">
        <MapContainer center={center} zoom={14} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <GeolocationHandler onLocationFound={onLocationFound} />
          <MarkerClusterGroup chunkedLoading maxClusterRadius={50}>
            {locatedItems.map((item) => (
              <Marker
                key={item.id}
                position={[item.latitude!, item.longitude!] as LatLngExpression}
                icon={itemIcon}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <Link href={`/items/${item.id}`} className="font-semibold text-purple-900 hover:underline">
                      {item.title}
                    </Link>
                    <p className="text-sm text-stone-600">{formatPrice(item.dailyPrice)}</p>
                    {item.distance != null && (
                      <p className="text-xs text-purple-600 mt-1">{formatDistance(item.distance)}</p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>
      </div>
    </div>
  );
}

function GeolocationHandler({ onLocationFound }: { onLocationFound: (lat: number, lng: number) => void }) {
  const map = useMap();
  useEffect(() => {
    if (typeof navigator !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          onLocationFound(latitude, longitude);
          map.setView([latitude, longitude], 14);
        },
        () => { /* denied — stay at default center */ },
        { enableHighAccuracy: false, timeout: 5000 }
      );
    }
  }, []);
  return null;
}
```

Pattern: RESEARCH.md Patterns 3+4 — `next/dynamic` import in page, Leaflet CSS in client component, `MapContainer`/`TileLayer`/`Marker`/`Popup` from react-leaflet, `MarkerClusterGroup` from react-leaflet-cluster, `L.divIcon` for custom markers, `useMap()` for geolocation handler.

---

### 17. `frontend/src/components/map/DistanceFilter.tsx` (component, request-response) — NEW

**Analog:** chip row in `items/page.tsx:139-219` — category chips + status filter + rating filter

The existing filter chip pattern uses a row of `<button>` elements with conditional styling based on `selectedCategory === cat.name`. The same pattern applies to radius presets.

```typescript
"use client";

import { useState } from "react";
import { MapPin, Navigation } from "lucide-react";
import Button from "@/components/ui/Button";

interface DistanceFilterProps {
  onLocationChange: (lat: number, lng: number, radius: number) => void;
}

const RADIUS_PRESETS = [
  { value: 1000, label: "1 km" },
  { value: 3000, label: "3 km" },
  { value: 5000, label: "5 km" },
  { value: 10000, label: "10 km" },
];

export default function DistanceFilter({ onLocationChange }: DistanceFilterProps) {
  const [selectedRadius, setSelectedRadius] = useState<number | undefined>(undefined);
  const [locating, setLocating] = useState(false);

  const handleGeolocate = () => {
    setLocating(true);
    if (typeof navigator !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setLocating(false);
          // Default to 3km if no radius selected
          onLocationChange(latitude, longitude, selectedRadius ?? 3000);
        },
        () => { setLocating(false); }
      );
    }
  };

  const handleRadiusSelect = (radius: number) => {
    setSelectedRadius(radius);
    // If we already have a location (from previous geolocate), update
    if (typeof navigator !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          onLocationChange(pos.coords.latitude, pos.coords.longitude, radius);
        },
        () => {}
      );
    }
  };

  // Pattern: chip buttons from items/page.tsx:140-166
  return (
    <div className="flex flex-wrap items-center gap-3">
      <MapPin className="h-4 w-4 text-stone-400" />
      <button
        type="button"
        onClick={handleGeolocate}
        disabled={locating}
        className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium bg-purple-600 text-white hover:bg-purple-700 transition-all duration-200 disabled:opacity-50 cursor-pointer"
      >
        <Navigation className="h-3.5 w-3.5" />
        {locating ? "Locating..." : "Near Me"}
      </button>

      <span className="text-stone-300">|</span>

      {RADIUS_PRESETS.map((preset) => (
        <button
          key={preset.value}
          type="button"
          onClick={() => handleRadiusSelect(preset.value)}
          className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 cursor-pointer ${
            selectedRadius === preset.value
              ? "bg-purple-600 text-white"
              : "bg-white border border-purple-200 text-stone-500 hover:bg-purple-50"
          }`}
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}
```

Pattern: `items/page.tsx:139-166` — flex-wrap row of `<button>` elements, conditional styling with active/inactive states, lucide-react icons. `items/page.tsx:168-219` — separator `|` between filter groups.

---

### 18. `frontend/src/components/map/DistanceBadge.tsx` (component, request-response) — NEW

**Analog:** `frontend/src/components/ui/Badge.tsx` — small display component with variant styling

Badge pattern: function component, interface with optional props, Tailwind span element, variant-based styling object.

```typescript
import { formatDistance } from "@/lib/distance";

interface DistanceBadgeProps {
  meters: number;
  className?: string;
}

export default function DistanceBadge({ meters, className = "" }: DistanceBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-lg bg-purple-100 text-purple-700 border border-current/10 px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {formatDistance(meters)}
    </span>
  );
}
```

Pattern: `Badge.tsx:1-20` — `interface BadgeProps`, default export, `className` prop with default empty string, template literal for class concatenation, `text-xs font-medium` sizing.

---

### 19. `frontend/src/lib/distance.ts` (utility, transform) — NEW

**Analog:** `frontend/src/lib/utils.ts` — utility functions with named exports

Utils pattern: named function exports, no default export, no React imports, pure TypeScript functions.

```typescript
// Pattern: formatPrice, formatDate, cn from lib/utils.ts
export function formatDistance(meters: number): string {
  if (meters < 10) return "Nearby";
  if (meters < 1000) return `${Math.round(meters)} m away`;
  return `${(meters / 1000).toFixed(1)} km away`;
}
```

Pattern: `lib/utils.ts:1-17` — named export functions, pure functions with no dependencies.

---

### 20. `frontend/src/test/setup.ts` (config, test) — MODIFY

**Analog:** itself (`frontend/src/test/setup.ts`)

Add Leaflet mock to prevent errors in jsdom test environment.

**Add after existing mocks (after line 30):**
```typescript
// Mock Leaflet for jsdom — Leaflet requires browser APIs not available in jsdom
vi.mock("react-leaflet", () => ({
  MapContainer: ({ children, className, ...props }: any) =>
    React.createElement("div", { className, "data-testid": "map-container", ...props }, children),
  TileLayer: ({ ...props }: any) =>
    React.createElement("div", { "data-testid": "tile-layer", ...props }),
  Marker: ({ children, position, ...props }: any) =>
    React.createElement("div", { "data-testid": "marker", "data-lat": position?.[0], "data-lng": position?.[1], ...props }, children),
  Popup: ({ children, ...props }: any) =>
    React.createElement("div", { "data-testid": "popup", ...props }, children),
  useMap: () => ({
    setView: vi.fn(),
    getCenter: () => ({ lat: 16.84, lng: 96.17 }),
    getZoom: () => 14,
  }),
  useMapEvents: () => null,
}));

vi.mock("react-leaflet-cluster", () => ({
  MarkerClusterGroup: ({ children, ...props }: any) =>
    React.createElement("div", { "data-testid": "marker-cluster", ...props }, children),
}));
```

Pattern: `test/setup.ts:1-30` — `vi.mock()` calls with factory functions that return React elements for complex components. Mock components render as `<div>` with `data-testid` attributes.

---

### 21-25. Frontend Test Files (test, various) — NEW

**Analog for component tests (21-23):** `frontend/src/components/ui/__tests__/Badge.test.tsx`

```typescript
// Pattern from Badge.test.tsx:1-47
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ComponentUnderTest from "@/components/path/Component";

describe("ComponentUnderTest", () => {
  it("renders something", () => {
    render(<ComponentUnderTest prop={value} />);
    expect(screen.getByText("expected text")).toBeInTheDocument();
  });

  it("handles className prop", () => {
    render(<ComponentUnderTest className="extra" />);
    const element = screen.getByText("text");
    expect(element.className).toContain("extra");
  });
});
```

Pattern: `Badge.test.tsx:1-47` — `describe`/`it` from vitest, `render`/`screen` from RTL, `toBeInTheDocument()` assertions, `className.contains()` checks.

**Analog for page tests (24-25):** `frontend/src/app/[locale]/items/new/__tests__/page.test.tsx`

```typescript
// Pattern from items/new/__tests__/page.test.tsx:1-133
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PageUnderTest from "../page";

const mockPush = vi.fn();

vi.mock("@/lib/api", () => ({ default: { get: vi.fn(), post: vi.fn() } }));
vi.mock("@/lib/auth", () => ({ isAuthenticated: vi.fn(() => true) }));
vi.mock("next/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/navigation")>()),
  useRouter: vi.fn(() => ({ push: mockPush })),
}));
vi.mock("@/components/layout/Navbar", () => ({
  default: () => <nav data-testid="navbar">Navbar</nav>,
}));

import api from "@/lib/api";

describe("PageUnderTest", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("fetches data on mount", async () => {
    (api.get as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { content: [] } },
    });
    render(<PageUnderTest />);
    await waitFor(() => { expect(api.get).toHaveBeenCalledWith("/items", expect.any(Object)); });
  });
});
```

Pattern: `items/new/__tests__/page.test.tsx:1-133` — `vi.mock` for api/auth/navigation/layout, `mockResolvedValue` for API responses, `waitFor` for async assertions, `beforeEach` with `vi.clearAllMocks()`, `userEvent` for interaction tests.

---

## Shared Patterns

### Authentication (Backend — JWT)
**Source:** `backend/src/main/kotlin/com/shareshelf/item/ItemController.kt:46-53`
**Apply to:** ItemController (modify) — existing methods already use `@AuthenticationPrincipal`. New `listItems` params are public reads — no auth change needed.
```kotlin
@PostMapping
fun createItem(
    @RequestBody @Valid request: CreateItemRequest,
    @AuthenticationPrincipal principal: UserPrincipal
): ResponseEntity<ApiResponse<ItemResponse>>
```

### Validation (Backend — Kotlin Bean Validation)
**Source:** `backend/src/main/kotlin/com/shareshelf/item/dto/ItemDtos.kt:9-21`
**Apply to:** CreateItemRequest — latitude/longitude need new `@field:Min`/`@field:Max` annotations.
```kotlin
data class CreateItemRequest(
    @field:NotBlank(message = "Title is required")
    @field:Size(max = 200, message = "Title must be at most 200 characters")
    val title: String,
    // ...
)
```

### Error Handling (Backend — GlobalExceptionHandler)
**Source:** `backend/src/main/kotlin/com/shareshelf/common/GlobalExceptionHandler.kt:25-74`
**Apply to:** ItemController — `IllegalArgumentException` for invalid coordinate/radius params already mapped to 400 BAD_REQUEST.
```kotlin
@ExceptionHandler(IllegalArgumentException::class)
fun handleBadArgument(ex: IllegalArgumentException): ResponseEntity<ApiResponse<Unit>> =
    ResponseEntity.status(HttpStatus.BAD_REQUEST)
        .body(ApiResponse.error(ex.message ?: "Invalid request"))
```

### API Response Wrapper (Backend)
**Source:** `backend/src/main/kotlin/com/shareshelf/common/ApiResponse.kt:5-22`
**Apply to:** All controller methods.
```kotlin
data class ApiResponse<T>(
    val success: Boolean,
    val message: String? = null,
    val data: T? = null,
    val errors: List<String>? = null
) {
    companion object {
        fun <T> success(data: T, message: String? = null): ApiResponse<T>
        fun <T> created(data: T): ApiResponse<T>
        fun <T> error(message: String, errors: List<String>? = null): ApiResponse<T>
    }
}
```

### API Client (Frontend — Axios with JWT interceptor)
**Source:** `frontend/src/lib/api.ts:1-109`
**Apply to:** All frontend pages — no changes needed. JWT injection, refresh token flow, 401 handling already in place.
```typescript
import api from "@/lib/api";
const res = await api.get("/items", { params: cleanParams });
```

### Flyway Migration Naming (Backend)
**Source:** existing migrations `V1__` through `V10__`
**Apply to:** V11, V12.
```
V{N}__{lowercase_snake_description}.sql
V11__enable_postgis.sql
V12__add_item_location.sql
```

### Frontend Component Pattern
**Source:** `frontend/src/components/ui/Badge.tsx:1-20`
**Apply to:** DistanceBadge, DistanceFilter, LocationPicker, MapView.
```typescript
interface ComponentProps {
  children?: React.ReactNode;
  className?: string;
}

export default function Component({ className = "" }: ComponentProps) {
  return (
    <div className={`... ${className}`}>
      ...
    </div>
  );
}
```

### Frontend Test Setup
**Source:** `frontend/src/test/setup.ts:1-30` AND `vitest.config.ts:1-27`
**Apply to:** All new test files. Vitest with jsdom, `@testing-library/jest-dom/vitest` import, mock next/navigation and next-intl/navigation in setup.ts, `globals: true` for test functions.
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
    include: ["src/**/*.test.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

---

## No Analog Found

Files with no close match in the codebase — planner should use RESEARCH.md patterns instead:

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `frontend/src/components/map/MapView.tsx` | component | event-driven | No Leaflet/map components exist. Use RESEARCH.md Patterns 3+4: `next/dynamic` SSR handling, `MapContainer`/`MarkerClusterGroup`, `L.divIcon` custom markers, Leaflet CSS import in client component. |
| `frontend/src/components/map/LocationPicker.tsx` | component | event-driven | No Leaflet/map components exist. Use RESEARCH.md Patterns 3+4: `MapContainer` with single `Marker` (draggable), `TileLayer`, `useMapEvents` for click-to-place. |
| `backend/src/main/kotlin/com/shareshelf/item/ItemRepository.kt` (findNearby method) | repository | CRUD (spatial) | No native SQL query exists yet. Use RESEARCH.md Pattern 2: `@Query(nativeQuery = true)` with `ST_DWithin`/`ST_Distance` on `::geography` cast. WARNING: `ST_MakePoint(lng, lat)` — not (lat, lng)! |

---

## Metadata

**Analog search scope:**
- `backend/src/main/kotlin/com/shareshelf/` — all existing controllers, services, repositories, entities, DTOs
- `backend/src/main/resources/db/migration/` — V1-V10 Flyway migrations
- `backend/src/test/kotlin/com/shareshelf/` — all existing test files
- `frontend/src/` — all pages, components, lib files, types, tests

**Files scanned:** 35+ (all entities, controllers, services, repositories, migrations, frontend pages, components, lib, types, tests)
**Pattern extraction date:** 2026-06-19

**Key Pitfalls to Copy into Plans (from RESEARCH.md):**
1. **ST_MakePoint(lng, lat)** — PostGIS takes longitude first, not latitude. Name params explicitly: `@Param("lng")` and `@Param("lat")`.
2. **`::geography` cast** — `ST_DWithin` on `geometry` uses degrees. Always cast to `::geography` for meter-based distance.
3. **GiST index required** — Without `CREATE INDEX ... USING GIST (location)`, spatial queries do sequential scans.
4. **Leaflet SSR** — Use `next/dynamic(() => import("..."), { ssr: false })` for any component importing from react-leaflet.
5. **L.divIcon** not PNG icons — Avoids bundler icon path resolution issues.
6. **Leaflet CSS in client component** — Import `leaflet/dist/leaflet.css` in the MapView/LocationPicker component file (has "use client"), NOT in layout.tsx.
