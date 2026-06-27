# Redesign of Login and Registration Layouts (Glassmorphic Redesign)

The user requested a redesign of the login and register pages, incorporating background images from `D:\Dev\ShareShelf\frontend\public\bk_images` and using a premium glassmorphic popup block for the login/register forms instead of a simple flat container.

## Proposed Changes

### 1. Dynamic Backgrounds from `public/bk_images`
- On component mount, the pages will dynamically select a random landscape image from the 12 village backgrounds inside the `bk_images/` folder (e.g. `bk_1.jpg` to `bk_93.jpg`).
- This prevents hydration mismatch while providing a distinct, cozier, and more premium community-oriented visual feeling on every page load.
- A high-end dark gradient overlay (`bg-gradient-to-tr from-purple-950/60 via-stone-950/50 to-indigo-950/60`) will be layered on top of the background image to ensure rich colors and excellent contrast for overlays.

### 2. Glassmorphic Popup Block
- Replace the solid white container with a glassmorphic popup card.
- Styling: `backdrop-blur-md bg-white/[0.005] border border-white/20 shadow-[0_24px_50px_rgba(0,0,0,0.30)]`.
- Logo & Text: Convert brand name and typography to green and emerald colors (`text-green-400`, `text-green-600/70`, `text-stone-300`, etc.) to match the village forest aesthetic.
- Integrate the `CommunityQuotes` component using its `sunset` variant (warm sunset peach/rose `#fca3a0` quote text and matching indicator dots) to sit elegantly inside the glass block.
- Adjust the Google Sign In Button to match with clean borders and active feedback.

---

## Files to Modify

### `frontend/src/app/[locale]/login/page.tsx`
- Redesign the layout to load a random background image on mount.
- Apply glassmorphism styling to the card container.
- Update text and link colors to premium high-contrast white and soft violet/indigo shades.

### `frontend/src/app/[locale]/register/page.tsx`
- Port the glassmorphic card design and dynamic background selection to the register page.

### `frontend/src/app/[locale]/page.tsx`
- Style the logged-in user Quotes container with a light frosted glass layout (`bg-white/50 backdrop-blur-sm border border-rose-100 shadow-sm rounded-2xl`) and decorative quotes mark matching the sunset theme.
- Fixed dimensions size to `w-full max-w-lg h-[180px] sm:h-[160px] flex flex-col justify-center` to prevent layout shifts as quote text changes.

---

## Verification Plan

### Automated Verification
- Run Next.js production build check (`npm run build`) in `frontend` folder to guarantee TypeScript and Next.js routing compatibility.

### Manual Verification
- Test rotation of background images across separate sessions/page reloads.
- Verify readability of English and Myanmar copy across all background images.
