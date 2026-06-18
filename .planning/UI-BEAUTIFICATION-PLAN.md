# UI Beautification — Full Design System Implementation

> Applies the `design-system/shareshelf/MASTER.md` design system across the entire ShareShelf frontend.
> **Direction:** Purple academia/library aesthetic with vibrant block-based layouts.
> **Scope:** Full redesign — every page, component, and state.

---

## Design System Reference

| Token | Current | → | Target |
|-------|---------|---|--------|
| **Primary** | emerald-600 `#059669` | → | purple-600 `#7C3AED` |
| **Accent/CTA** | emerald-600 | → | green-600 `#16A34A` |
| **Background** | stone-50 `#fafaf9` | → | purple-50 `#FAF5FF` |
| **Heading Font** | System UI | → | Cormorant Garamond (serif) |
| **Body Font** | System UI | → | Crimson Pro (serif) |
| **Icon Library** | Inline SVGs | → | Lucide React |
| **Style** | Minimal/neutral | → | Vibrant & Block-based |

---

## Wave Structure

### Wave 1: Design Foundation

**Plan: Design tokens, fonts, and icon library**

- Install `lucide-react` as dependency
- Add Google Fonts import (Cormorant Garamond + Crimson Pro + Cinzel)
- Update `globals.css` with CSS custom properties for the new palette
- Configure Tailwind v4 theme extension (colors, fontFamily, shadows)
- Create `frontend/src/lib/design-tokens.ts` with typed token exports
- Replace all inline SVG icons with Lucide components across the app
- Add `prefers-reduced-motion` media query support
- Verify: no emojis as icons, consistent icon set, fonts load without FOUT

### Wave 2: Component Library Upgrade

**Plan: Upgrade all 6 UI primitives to design system spec**

- **Button** — New purple primary, green accent, hover lift (`translateY(-1px)`), 200ms transitions
- **Card** — Purple-tinted background, `shadow-md` → `shadow-lg` on hover, `translateY(-2px)` lift
- **Input** — New focus ring (purple `#7C3AED20`), 3px ring, 200ms border transition
- **Badge** — New color variants matching purple/green palette, softer rounded corners
- **Modal** — `backdrop-filter: blur(4px)`, 16px border radius, `shadow-xl`
- **Spinner** — Purple accent color, smoother animation

Each component gets updated tests verifying new visual tokens.

### Wave 3: Layout & Auth Pages

**Plan: Navbar, Footer, Login, Register beautification**

- **Navbar** — Purple-tinted backdrop blur, new logo treatment with Cinzel font, active nav indicators, animated mobile menu
- **Footer** — Richer multi-column layout (About, Links, Community), purple-tinted background, social proof
- **Login page** — Decorative auth card with top accent bar, illustrated empty state (library/book theme), subtle background pattern
- **Register page** — Same card treatment, community field with map-pin icon, password strength indicator

### Wave 4: Core App Pages

**Plan: Browse, Item Detail, New Item, Borrow, Profile beautification**

- **Browse Items** — Hero search bar (design system marketplace pattern), category chips with icons, featured items section, animated grid
- **Item Detail** — Image placeholder with decorative fallback, "owned by" badge, trust indicators, borrow CTA with deposit info
- **New Item** — Form sections with icon headers, category selector with visual icons, image upload drop zone with dashed border
- **Borrow** — Status timeline (pending→approved→returned), richer request cards, action buttons with confirmation micro-interactions
- **Profile** — Stats dashboard (items listed, borrowed, trust score), trust score visualization (star gauge), activity feed

### Wave 5: Homepage & Decorative Elements

**Plan: Homepage hero, decorative patterns, micro-interactions**

- **Hero** — Animated geometric background pattern (CSS), large Cinzel heading, search bar CTA, floating tool illustrations
- **How It Works** — Numbered steps with animated reveal on scroll, illustrated icons for each step
- **Stats** — Animated counters (items shared, community members, successful borrows)
- **Trust section** — Trust badges, community testimonials placeholder
- **Global** — Scroll-snap on hero, smooth page transitions, hover micro-interactions, skeleton loading states replacing Spinner
- **Empty states** — Illustrated empty states for: no items found, no borrows, no reviews, no results (consistent illustration style)

---

## Pages Affected (10 total)

| Page | Wave | Key Changes |
|------|------|-------------|
| `layout.tsx` | 1 | Body background, font loading |
| `globals.css` | 1 | CSS variables, font imports, animations |
| All components (6) | 2 | Design system tokens applied |
| `Navbar.tsx` | 3 | Purple backdrop, Cinzel logo, active states |
| `Footer.tsx` | 3 | Multi-column, richer content |
| `login/page.tsx` | 3 | Decorative card, background pattern |
| `register/page.tsx` | 3 | Decorative card, password strength |
| `items/page.tsx` | 4 | Hero search, category chips, animated grid |
| `items/[id]/page.tsx` | 4 | Trust indicators, image fallback |
| `items/new/page.tsx` | 4 | Icon headers, visual category selector |
| `borrow/page.tsx` | 4 | Status timeline, richer cards |
| `profile/page.tsx` | 4 | Stats dashboard, trust gauge |
| `page.tsx` (home) | 5 | Animated hero, scroll reveal, counters |

---

## Key Constraints from Design System

- ❌ No emojis as icons — all Lucide SVG
- ❌ No layout-shifting hovers — use `transform` not layout-changing properties
- ❌ No instant state changes — 150-300ms transitions everywhere
- ❌ No invisible focus states — visible rings on all interactive elements
- ✅ `prefers-reduced-motion` respected throughout
- ✅ Responsive at 375/768/1024/1440px breakpoints
- ✅ 4.5:1 minimum contrast ratio on all text
- ✅ `cursor-pointer` on all clickable elements

---

## Estimated Plans: 5 (one per wave)

| Wave | Plans | Effort | Impact |
|------|-------|--------|--------|
| 1. Foundation | 1 | Medium | Foundation for everything |
| 2. Components | 1 | Medium | Touches every rendered element |
| 3. Layout + Auth | 1 | Medium | Navbar, footer, login, register |
| 4. Core Pages | 1 | Large | 5 pages, most complex wave |
| 5. Homepage + Polish | 1 | Medium | Delight and micro-interactions |

**Total: 5 plans across 5 waves (~2-3 plans can parallelize within waves)**
