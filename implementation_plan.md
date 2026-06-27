# Redesign of Login and Registration Layouts

The user requested a redesign of the login page to move away from the basic split-screen "b-roll style" layout and purple-to-indigo side panel. The new design targets a highly premium, beautiful layout that highlights visual excellence, subtle animations, and modern typography aligned with the ShareShelf brand.

## User Review Required

> [!IMPORTANT]
> The login and registration flows exclusively use Google OAuth (as documented in `README.md`). We will preserve this logic while transforming the UI layouts into a single, cohesive, premium centered card structure.

> [!NOTE]
> We will apply these layout changes to both the **Login** and **Registration** pages to maintain style consistency throughout the auth flow.

---

## Proposed Changes

### 1. `frontend/src/components/ui/CommunityQuotes.tsx`

We will update the `CommunityQuotes` component to support a `variant` prop (`'light' | 'dark'`). This will allow it to be embedded inside a white glassmorphic card (using the `'dark'` variant) with appropriate text colors and dot indicators.

#### [MODIFY] [CommunityQuotes.tsx](file:///d:/Dev/ShareShelf/frontend/src/components/ui/CommunityQuotes.tsx)
- Add `variant` prop to `CommunityQuotesProps`.
- Update text and dot active/inactive styling depending on the variant.

---

### 2. `frontend/src/app/[locale]/login/page.tsx`

We will rewrite the layout of the login page:
- Replace the split-screen layout (`flex flex-col lg:flex-row`) with a centered, single-screen experience.
- Background: Ambient blur elements floating slowly, with a subtle geometric or dot pattern.
- Form Card: An elegant glassmorphic container (`backdrop-blur-xl bg-white/70 border border-white/80 shadow-2xl`) with rounded corners, premium typography (Cinzel and Cormorant Garamond), and smooth drop shadows.
- Logo: A custom-designed glowing container for the `Library` icon.
- Integrated Quotes: Embed the rotating quotes inside a beautiful card callout with the new `dark` variant.
- Premium Button: Update the Google login button classes to hover/glow cleanly.

#### [MODIFY] [page.tsx (login)](file:///d:/Dev/ShareShelf/frontend/src/app/[locale]/login/page.tsx)
- Redesign the layout structure.
- Add background decorative blur elements.
- Integrate the `CommunityQuotes` component inside the form card.

---

### 3. `frontend/src/app/[locale]/register/page.tsx`

We will apply the identical styling layout to the registration page for continuity, changing only the title texts, routing URLs, and translations.

#### [MODIFY] [page.tsx (register)](file:///d:/Dev/ShareShelf/frontend/src/app/[locale]/register/page.tsx)
- Redesign the layout to match the login page structure.

---

## Verification Plan

### Manual Verification
- Start the Next.js development server.
- Open the `/login` and `/register` pages on the web browser.
- Verify page styling, colors, and responsive design (mobile/tablet/desktop layouts).
- Inspect the rotation and transition behavior of the community quotes component inside the glass card.
- Click the Google Sign-in button to ensure that the redirect function works correctly.
