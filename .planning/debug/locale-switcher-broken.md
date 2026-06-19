---
status: resolved
trigger: "Language switcher button doesn't work — clicking မြန်မာ does not change the UI to Burmese"
created: 2026-06-19
updated: 2026-06-19
resolved: 2026-06-19
---

## Resolution

### Root Cause 1: Wrong locale detection (Navbar.tsx:33)

`usePathname()` from `next-intl/navigation` strips the locale prefix from the path. The old code did:
```ts
const locale = pathname.split('/')[1] || 'en';  // never yielded 'my'
```
When URL is `/my`, `usePathname()` returns `/`, giving `locale = ''` → defaults to `'en'`.
When URL is `/my/items`, it returns `/items`, giving `locale = 'items'`.

**Fix:** Replaced with `useLocale()` from `next-intl` which returns the actual active locale string.

### Root Cause 2: Zero translation wiring (page.tsx + Navbar.tsx)

All homepage and navbar strings were hardcoded English. The ~250-key translation files (`en.json`, `my.json`) existed but were never accessed by any component.

**Fix:** Added `useTranslations()` hook and replaced all hardcoded strings with `t('key')` calls.

### Files Changed

| File | Change |
|---|---|
| `frontend/src/components/layout/Navbar.tsx` | Import `useLocale`+`useTranslations`; replaced `pathname.split('/')[1]` with `useLocale()`; wired all nav labels through `t()` |
| `frontend/src/app/[locale]/page.tsx` | Import `useTranslations`; wired all homepage sections through `t('home.*')` |
| `frontend/src/components/layout/__tests__/Navbar.test.tsx` | Added `next-intl` mocks; replaced `next/navigation` mock with `@/i18n/navigation` |
| `frontend/src/app/[locale]/borrow/__tests__/page.test.tsx` | Added `next-intl` + `@/i18n/navigation` mocks |

### Verification

- `npm run build` — passes ✅
- `npm test` — 19 files, 133/133 passing ✅
