# Burmese (Myanmar) Localization & Community Pages

> Add Myanmar (Burmese) language support with warm community-focused messaging, plus new About and Read Me pages in both languages.

---

## Market Context: Why Myanmar?

### Digital Landscape
| Metric | Value |
|--------|-------|
| Population | ~55 million (2025 est.) |
| Internet users | ~30 million (~55% penetration, growing fast) |
| Mobile-first | 95%+ access via smartphone |
| Top platforms | Facebook, Viber, TikTok |
| E-commerce growth | Rapid post-2021, community-trust-based |

### Cultural Fit for ShareShelf
- **Parahita (mutual aid)** — Deep-rooted tradition of neighbors helping neighbors; tool/equipment sharing already happens informally
- **Dāna (generosity/sharing)** — Buddhist cultural value aligns perfectly with "share and care" model
- **Community trust networks** — Myanmar society operates on trusted local networks; ShareShelf formalizes this digitally
- **Warm, welcoming language** — Burmese communication emphasizes warmth, politeness particles (ပါ, ရှင့်, ခင်ဗျာ), and community belonging
- **Price-sensitive market** — Strong fit for "borrow instead of buy" value proposition
- **Zawgyi vs Unicode** — Must use Unicode (official standard since 2019); ~80% of users now on Unicode

### Key Burmese UX Principles
1. **Warm welcome first** — "မင်္ဂလာပါ" (Mingalaba) is essential; it's both hello and blessing
2. **Politeness markers** — Use gender-appropriate particles (ခင်ဗျာ for male, ရှင် for female)
3. **Community-first language** — "အတူတူ" (together), "မျှဝေ" (share), "အကူအညီ" (help) resonate strongly
4. **Trust signals** — Display trust scores, verified badges, community endorsements prominently
5. **Simple, warm CTAs** — Avoid aggressive sales language; use inviting, humble phrasing

---

## Technical Architecture: i18n Setup

### Choice: `next-intl`

**Why next-intl over alternatives:**
- Best Next.js 15 App Router support (both Server and Client Components)
- Middleware-based locale detection with cookie persistence
- Lightweight (19 kB gzipped)
- TypeScript-first with ICU message format
- Works with `"use client"` components (compatible with current codebase)
- React Native support (future-proof)

### Locale Strategy

| Locale | Code | Flag |
|--------|------|------|
| English | `en` | 🇬🇧 (default) |
| Burmese | `my` | 🇲🇲 |

URL structure: `/[locale]/...` with middleware redirect
- `/en` → English (default, also accessible at `/` for backward compat)
- `/my` → Burmese

### Files Structure

```
frontend/
├── messages/
│   ├── en.json          # English translations
│   └── my.json          # Burmese translations (Unicode)
├── src/
│   ├── i18n/
│   │   ├── request.ts   # next-intl server request config
│   │   ├── navigation.ts # Localized Link/useRouter
│   │   └── routing.ts   # Locale routing config
│   ├── middleware.ts     # Locale detection middleware
│   └── app/
│       └── [locale]/    # All pages moved under locale segment
│           ├── layout.tsx
│           ├── page.tsx
│           ├── about/
│           │   └── page.tsx
│           ├── readme/
│           │   └── page.tsx
│           ├── items/
│           ├── community/
│           ├── borrow/
│           ├── profile/
│           ├── login/
│           └── register/
```

### Rewrites for Backward Compatibility

Keep existing URLs working via `next.config.ts` rewrites:
- `/` → redirect to `/[detected-locale]`
- `/items` → `/en/items` (for bookmarks/seo)

---

## Phase 5a: Burmese Localization — Implementation Steps

### Step 1: Install and Configure next-intl

Install packages:
```bash
npm install next-intl
```

**Files to create:**
- `frontend/src/i18n/routing.ts` — Define `en` and `my` locales, default `en`
- `frontend/src/i18n/request.ts` — Server-side locale request config for next-intl
- `frontend/src/i18n/navigation.ts` — Drop-in replacement for `next/navigation` (Link, useRouter, usePathname)
- `frontend/src/middleware.ts` — Detect locale from cookie/header/URL and redirect

**Files to modify:**
- `frontend/next.config.ts` — Add `createNextIntlPlugin()` wrapper
- Root `layout.tsx` → Move to `[locale]/layout.tsx` — Wrap with `NextIntlClientProvider`
- All pages → Update imports from `next/navigation` to `@/i18n/navigation`

### Step 2: Create Translation Files

#### English (`messages/en.json`)
Standard translation keys organized by page/section:
```json
{
  "common": { "siteName": "ShareShelf", "tagline": "Community Tool Library" },
  "home": {
    "hero": {
      "title": "Share tools, build community",
      "subtitle": "Borrow and lend rarely used tools and equipment within your neighborhood."
    },
    "howItWorks": { "title": "How It Works", ... },
    "trust": { "title": "Built on Trust", ... }
  },
  "about": { ... },
  "readme": { ... },
  "nav": { ... }
}
```

#### Burmese (`messages/my.json`)
Full Burmese translations with warm, community-focused language:
```json
{
  "common": {
    "siteName": "ShareShelf",
    "tagline": "အိမ်နီးချင်း ကိရိယာ မျှဝေရေး"
  },
  "home": {
    "hero": {
      "title": "ကိရိယာများ မျှဝေပါ၊ ရပ်ရွာအသိုက်အဝန်း တည်ဆောက်ပါ",
      "subtitle": "သင့်အိမ်နီးချင်းများနှင့် အသုံးနည်းသော ကိရိယာပစ္စည်းများကို ငှားရမ်းပါ၊ ငွေကုန်သက်သာစေပြီး ပတ်ဝန်းကျင်ကို ကူညီပါ။"
    },
    "howItWorks": {
      "title": "ဘယ်လို အလုပ်လုပ်လဲ",
      "steps": [
        { "title": "ရှာဖွေပါ", "desc": "သင့်အနီးအနားရှိ ကိရိယာများကို ရှာဖွေပါ" },
        { "title": "ငှားရမ်းတောင်းဆိုပါ", "desc": "ပိုင်ရှင်ထံ ငှားရမ်းခွင့်တောင်းခံပါ" },
        { "title": "အသုံးပြု၍ ပြန်ပေးပါ", "desc": "အသုံးပြုပြီး ပြန်လည်ပေးအပ်ပါ၊ တစ်ဦးနဲ့တစ်ဦး အဆင့်သတ်မှတ်ပါ" }
      ]
    },
    "trust": {
      "title": "ယုံကြည်မှုပေါ်တွင် တည်ဆောက်ထားသည်",
      "subtitle": "ငှားရမ်းမှုတိုင်းသည် ဂုဏ်သတင်းကို တည်ဆောက်ပါသည်"
    }
  }
}
```

### Step 3: Community-Focused Homepage Copy

#### Burmese Tone Guide
| English | Burmese | Feeling |
|---------|---------|---------|
| Welcome | မင်္ဂလာပါ / ကြိုဆိုပါတယ် | Warm blessing + welcome |
| Share | မျှဝေပါ | Togetherness, generosity |
| Community | ရပ်ရွာအသိုက်အဝန်း / အိမ်နီးချင်း | Local, neighborly |
| Trust | ယုံကြည်မှု | Earned, sacred |
| Care | ဂရုစိုက်ပါ | Mindful, respectful |
| Together | အတူတူ | Unity, solidarity |

#### Key Homepage Phrases (Burmese)
1. **Welcome:** "မင်္ဂလာပါ — အိမ်နီးချင်းများနဲ့ ကိရိယာမျှဝေတဲ့ နေရာမှ ကြိုဆိုပါတယ်"
   *(Mingalaba — Welcome to the neighborhood tool sharing space)*

2. **Credibility:** "ယုံကြည်စိတ်ချရသော အိမ်နီးချင်းများကြား ကိရိယာငှားရမ်းခြင်း"
   *(Trusted tool rental between verified neighbors)*

3. **Value prop:** "တစ်ခါသုံးဖို့အတွက် မဝယ်ပါနဲ့ — အိမ်နီးချင်းဆီမှာ ငှားလိုက်ပါ"
   *(Don't buy for one-time use — borrow from a neighbor)*

4. **Share & Care:** "မျှဝေခြင်းဖြင့် ဂရုစိုက်ပါ"
   *(Care by sharing)*

5. **Building community:** "အတူတူ တည်ဆောက်ကြပါစို့"
   *(Let's build together)*

### Step 4: Language Switcher

Add to Navbar:
- Flag-based toggle: 🇬🇧 / 🇲🇲 (or text: EN / မြန်မာ)
- Position: Top-right, near notification bell
- Persists via cookie (next-intl handles this)
- Smooth transition — no page reload (client-side navigation)

### Step 5: About Page (`/[locale]/about`)

**Content (both languages):**
1. **Our Story** — Why ShareShelf exists, the problem it solves
2. **Mission** — Community, sustainability, trust
3. **How It Works** — Visual step-by-step with Burmese illustrations
4. **Values** — Trust, sharing, community, sustainability
5. **Team/Vision** — Community-first, not-for-profit tone

**Burmese cultural touches:**
- Opening with "မင်္ဂလာပါ" blessing
- Reference to Myanmar sharing traditions
- Community photos/illustrations with Burmese context
- "ကျေးဇူးတင်ပါတယ်" (thank you) closing

### Step 6: Read Me / Guide Page (`/[locale]/readme`)

**Content (both languages):**
1. **Getting Started** — Registration, browsing, borrowing
2. **Safety Tips** — Trust scores, reviews, community guidelines
3. **FAQ** — Common questions in Burmese context
4. **Community Rules** — Respect, care for items, timely returns
5. **Glossary** — Key terms explained in Burmese

**Burmese-specific content:**
- Unicode font usage note (no Zawgyi)
- Mobile data-friendly tips (image lazy loading already in place)
- Facebook sharing integration mention
- Local community norms explained

---

## Files to Create (12 new)

```
frontend/
├── messages/
│   ├── en.json
│   └── my.json
├── src/
│   ├── middleware.ts
│   ├── i18n/
│   │   ├── routing.ts
│   │   ├── request.ts
│   │   └── navigation.ts
│   └── app/
│       └── [locale]/
│           ├── layout.tsx
│           ├── page.tsx          (moved from root)
│           ├── about/
│           │   ├── page.tsx
│           │   └── __tests__/page.test.tsx
│           └── readme/
│               ├── page.tsx
│               └── __tests__/page.test.tsx
```

## Files to Modify (all existing pages + components)

Every page moves under `[locale]/` and updates:
- `import { Link } from "next/link"` → `import { Link } from "@/i18n/navigation"`
- `import { useRouter } from "next/navigation"` → `import { useRouter } from "@/i18n/navigation"`
- Hardcoded text → `useTranslations()` / `t("key")` calls

**Full list of files to modify:**
- `layout.tsx` → `[locale]/layout.tsx` (restructured)
- `page.tsx` → `[locale]/page.tsx` (all text to translations)
- `items/page.tsx` → `[locale]/items/page.tsx`
- `items/[id]/page.tsx` → `[locale]/items/[id]/page.tsx`
- `items/new/page.tsx` → `[locale]/items/new/page.tsx`
- `community/page.tsx` → `[locale]/community/page.tsx`
- `borrow/page.tsx` → `[locale]/borrow/page.tsx`
- `profile/page.tsx` → `[locale]/profile/page.tsx`
- `login/page.tsx` → `[locale]/login/page.tsx`
- `register/page.tsx` → `[locale]/register/page.tsx`
- All shared components: `Navbar.tsx`, `Footer.tsx`, `ItemCard.tsx`, `Button.tsx`, etc.
- `next.config.ts` — next-intl plugin wrapper
- All test files — update imports, wrap with `NextIntlClientProvider`

## Estimated Effort

| Step | Files | Complexity | Time |
|------|-------|-----------|------|
| 1. Install & configure next-intl | 6 new | Medium | ~30 min |
| 2. Translation files (en.json + my.json) | 2 new | High (creative copy) | ~2 hrs |
| 3. Move pages to [locale] + wire translations | ~20 modified | High (refactor) | ~3 hrs |
| 4. Language switcher in Navbar | 1 modified | Low | ~30 min |
| 5. About page | 2 new | Medium | ~1 hr |
| 6. Read Me page | 2 new | Medium | ~1 hr |
| 7. Update all tests | ~16 modified | Medium | ~1.5 hrs |
| 8. Verify build + tests | — | — | ~30 min |

**Total: ~10 hours estimated**

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Moving all pages under `[locale]` breaks all existing URLs | Add middleware redirect + next.config rewrites for backward compat |
| Burmese font rendering issues (Zawgyi vs Unicode) | Use Unicode only; add `lang="my"` on `<html>`; test with Noto Sans Myanmar font |
| RTL not needed (Burmese is LTR) | Simpler than Arabic/Hebrew i18n |
| Translation file gets large | Split by page/namespace (common, home, about, readme, items, borrow, etc.) |
| Test files need `NextIntlClientProvider` wrapper | Create a test helper that wraps components with provider + messages |
| Rebase conflicts if done after Phase 2-4 | Do this first (before remaining phases) to avoid massive merge conflicts |

## What This Does NOT Cover

- **Full app translation** — Focus on: homepage, about, readme, navbar, footer. Other pages get partial key translations initially, falling back to English.
- **Dynamic content translation** — Item titles/descriptions, borrow messages, reviews stay in user's language (not auto-translated).
- **Burmese-specific backend features** — No backend changes needed (API responses stay in English; frontend handles display).
- **RTL support** — Burmese is LTR, so no bidirectional layout needed.
- **Font file bundling** — Use Google Fonts `@import` for Noto Sans Myanmar (or rely on system fonts).
