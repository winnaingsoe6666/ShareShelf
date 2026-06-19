# Phase 6: Location Search - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-19
**Phase:** 06-location-search
**Areas discussed:** Geocoding, Search UX, Map Provider, Scope, Near Me, Community Field, Radius

---

## Geocoding & Location Capture

| Option | Description | Selected |
|--------|-------------|----------|
| Pin on a map | User drops a pin or clicks on an embedded map. Free, no geocoding API. Most accurate. | ✓ |
| Type an address | Street address geocoded via Nominatim or Google Maps API. | |
| Both — pin with fallback | Address input with autocomplete + map adjust. Best UX, most work. | |
| Neighborhood-level only | Reuse existing community field. No coordinates. | |

**User's choice:** Pin on a map
**Notes:** Zero API cost. Simpler UX — drag a marker where the item is.

---

## Search UX

| Option | Description | Selected |
|--------|-------------|----------|
| Distance filter on browse page | Add radius filter to existing browse page. No map page. | |
| Dedicated map search page | New /items/map with interactive map. | |
| Both — filter + map view | Filter on browse + "View on Map" toggle. Best of both. | ✓ |

**User's choice:** Both — filter + map view
**Notes:** Users can search by distance in the list view or switch to map view for spatial browsing.

---

## Map Provider

| Option | Description | Selected |
|--------|-------------|----------|
| Leaflet (OpenStreetMap) | Free, no API key, no usage limits. | ✓ |
| Mapbox GL JS | Beautiful maps, free tier 50K loads/month. Needs API key. | |
| Google Maps | Most familiar, $200/month free credit. | |

**User's choice:** Leaflet (OpenStreetMap)
**Notes:** Free-tier keeps ShareShelf zero-budget. OSM tiles are sufficient for neighborhood-level browsing.

---

## Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Core spatial search (3-4 days) | PostGIS, lat/lng, distance filter, pin-drop. No map page. | |
| Full map experience (5-7 days) | Core + dedicated map page, marker clustering, map toggle. | ✓ |

**User's choice:** Full map experience (5-7 days)
**Notes:** Complete UX — both list-based distance filter and interactive map view.

---

## Near Me

| Option | Description | Selected |
|--------|-------------|----------|
| Browser geolocation | `navigator.geolocation` with permission prompt. Auto-centers on user. | ✓ |
| Manual entry | User types a reference point or pans map manually. | |
| Smart default + geolocation | Default to community field, with "Use my location" button. | |

**User's choice:** Browser geolocation
**Notes:** Most convenient. Permission prompt is standard and expected by users.

---

## Community Field

| Option | Description | Selected |
|--------|-------------|----------|
| Keep it, add coordinates separately | Community stays as text label. Items get their own lat/lng. | ✓ |
| Replace with coordinates | Drop text field, add lat/lng to User. | |
| Keep it, don't touch User model | Only add location to Items. Simplest change. | |

**User's choice:** Keep it, add coordinates separately
**Notes:** Community is social/display, location is spatial/search. They serve different purposes.

---

## Radius Options

| Option | Description | Selected |
|--------|-------------|----------|
| Walking scale | 1km, 3km, 5km, 10km. Neighborhood-level. | ✓ |
| City scale | 5km, 10km, 25km, 50km. Broader reach. | |
| Both, context-aware | 1/3/5/10/25/50km full dropdown. | |

**User's choice:** Walking scale
**Notes:** Matches the "borrow from neighbors" vision. Small radius encourages community trust.

---

## Claude's Discretion

- Marker clustering implementation (leaflet.markercluster vs manual)
- Map tile styling (standard OSM or brand-matched variant)
- Map marker design and popup content
- Default map zoom level and center fallback when geolocation denied
- Reverse-geocode for human-readable "near X" display
- Distance display format on ItemCard
- Map page layout (sidebar list vs full-map browsing)
- Leaflet component architecture

## Deferred Ideas

- Address autocomplete / geocoding APIs
- User home location (coordinates on User model)
- Real-time location tracking
- Turn-by-turn directions
