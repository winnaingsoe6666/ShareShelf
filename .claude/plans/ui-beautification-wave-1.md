# Wave 1: Design Foundation — Implementation Plan

> Applies the `design-system/shareshelf/MASTER.md` foundation tokens across the frontend.
> **Goal:** Color palette shift (emerald→purple), serif fonts, Lucide icon library, CSS custom properties, `prefers-reduced-motion`.

## Current State

| Area | Current | Target |
|------|---------|--------|
| Primary color | `emerald-600` | `purple-600 #7C3AED` |
| Accent/CTA | `emerald-600` | `green-600 #16A34A` |
| Background | `stone-50` | `purple-50 #FAF5FF` |
| Fonts | System UI | Cormorant Garamond (headings) + Crimson Pro (body) |
| Icons | 7 inline SVG blocks across 6 files | Lucide React components |
| globals.css | 1 line (`@import "tailwindcss"`) | Full CSS custom properties + @theme + fonts |
| Tailwind config | None (v4 CSS-based) | `@theme` block in globals.css |
| design-tokens.ts | Doesn't exist | Typed token constants |

## Inline SVG Inventory (all to migrate)

| File | SVG Role | Lucide Replacement |
|------|----------|--------------------|
| `Navbar.tsx:23-25` | Logo icon | `Share2` |
| `Navbar.tsx:73-77` | Hamburger / close toggle | `Menu` / `X` |
| `ItemCard.tsx:25-27` | Image placeholder | `Image` |
| `Button.tsx:39-42` | Loading spinner | `Loader2` (with `animate-spin`) |
| `Spinner.tsx:4-7` | Spinner | `Loader2` (with `animate-spin`) |
| `Modal.tsx:35-37` | Close button X | `X` |
| `items/[id]/page.tsx:73-75` | Image placeholder | `Image` |
| `items/page.tsx:46-48` | Add / plus icon | `Plus` |

## Color Class Migration (global find-and-replace)

| Old | New |
|-----|-----|
| `emerald-600` | `purple-600` |
| `emerald-700` | `purple-700` |
| `emerald-500` | `purple-500` |
| `emerald-100` | `purple-100` |
| `stone-*` (backgrounds) | `purple-*` (equivalent shade) |
| `stone-50` for bg | `purple-50` |
| `stone-100` for bg | `purple-100` |
| `stone-200` for borders | `purple-200` |
| `bg-emerald-600` (CTA buttons) | `bg-green-600` (accent) |

**Important nuance:**
- Primary buttons/tabs/focus-rings: `emerald` → `purple`
- CTA buttons ("Sign Up", "Request to Borrow", "Add Item"): `emerald` → `green-600` (accent per design system)
- Text/neutral colors: `stone` → keep stone for text readability (stone-900/600 text has good contrast), only shift backgrounds/borders to purple tint

## Steps

### Step 1: Install lucide-react
- `cd frontend && npm install lucide-react`
- Verify in package.json

### Step 2: Rewrite `globals.css` — Design Foundation
- Google Fonts `@import` for Cormorant Garamond + Crimson Pro + Cinzel
- CSS `@theme` block extending Tailwind v4 with:
  - `--color-purple-*` shades from the palette
  - `--color-green-600` as accent
  - `--font-family-heading`, `--font-family-body`, `--font-family-display`
  - Shadow tokens (`--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl`)
- CSS custom properties from MASTER.md (colors, spacing, shadows)
- `prefers-reduced-motion` media query: disable all `transition-*` and `animate-*`
- Keyframes for `animate-spin` (preserve existing but tint purple)
- Keyframe `animate-fade-in` and `animate-slide-up` for later waves

### Step 3: Create `frontend/src/lib/design-tokens.ts`
- Export typed color, spacing, font, and shadow constants
- Map design system tokens to Tailwind classes
- Export helper: `getToken(name: string)` for programmatic access

### Step 4: Update `layout.tsx`
- Body background: `bg-stone-50` → `bg-purple-50`
- Add font classes: `font-[family-name:var(--font-family-body)]`
- Update metadata title/description if needed (no changes expected)

### Step 5: Replace inline SVGs with Lucide icons
- **Spinner.tsx** — Replace SVG with `<Loader2 className="animate-spin" />`
- **Button.tsx** — Replace loading SVG with `<Loader2 className="animate-spin" />`
- **Modal.tsx** — Replace X SVG with `<X />`
- **Navbar.tsx** — Replace logo SVG with `<Share2 />`, hamburger with `<Menu />`/`<X />`
- **ItemCard.tsx** — Replace image placeholder with `<Image />`
- **items/[id]/page.tsx** — Replace image placeholder with `<Image />`
- **items/page.tsx** — Replace plus SVG with `<Plus />`
- Remove `className` props that styled the old SVGs (size via `size` prop or `className`)

### Step 6: Update test files for new patterns
- Tests that check CSS classes (`emerald-*`) → update to new color classes
- Tests that check SVG role/content → update for Lucide icon presence
- Ensure all tests pass with `npm test`

### Step 7: Verification
- `npm run build` succeeds
- `npm test` passes
- Manual check: fonts load, no FOUT, colors consistent

## Files Modified (estimated ~20 files)

| File | Change |
|------|--------|
| `frontend/package.json` | Add lucide-react dependency |
| `frontend/src/app/globals.css` | Full rewrite — fonts, @theme, vars, motion |
| `frontend/src/app/layout.tsx` | Body bg, font class |
| `frontend/src/lib/design-tokens.ts` | **New file** — typed tokens |
| `frontend/src/components/ui/Spinner.tsx` | Lucide Loader2 |
| `frontend/src/components/ui/Button.tsx` | Lucide Loader2 + color classes |
| `frontend/src/components/ui/Modal.tsx` | Lucide X |
| `frontend/src/components/layout/Navbar.tsx` | Lucide Share2/Menu/X + color classes |
| `frontend/src/components/items/ItemCard.tsx` | Lucide Image + color classes |
| `frontend/src/app/items/[id]/page.tsx` | Lucide Image + color classes |
| `frontend/src/app/items/page.tsx` | Lucide Plus + color classes |
| `frontend/src/app/page.tsx` | Color class migration |
| `frontend/src/components/ui/__tests__/Button.test.tsx` | Update assertions |
| `frontend/src/components/ui/__tests__/Spinner.test.tsx` | Update assertions |
| `frontend/src/components/layout/__tests__/Navbar.test.tsx` | Update assertions |
| Other page/component tests | Update color assertions |

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Tailwind v4 `@theme` syntax incompatible | Verify with `npm run build` after each change |
| Font loading FOUT | `&display=swap` in Google Fonts import |
| Test breakage from color class changes | Run tests after each step |
| Lucide icons missing expected sizes | Use `size` prop + `className` for consistent sizing |
| Accent green doesn't contrast well on purple bg | Use green-600 only on white/light backgrounds per design system |
