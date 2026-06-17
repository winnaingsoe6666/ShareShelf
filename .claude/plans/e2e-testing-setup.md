# E2E Testing Setup Plan

## Current State

| Item | Status |
|------|--------|
| Playwright packages | ❌ Not installed |
| `playwright.config.ts` | ❌ Not created |
| E2E test files | ❌ None exist |
| `frontend/package.json` test scripts | ❌ None |
| Backend server | ❌ Not running (needs PostgreSQL) |
| Frontend server | ❌ Not running |

## Scope

Set up a complete Playwright E2E test suite covering all 6 critical user journeys from the `e2e-ui-tester` agent definition, plus edge cases.

---

## Step 1: Install Playwright Dependencies

Add to `frontend/package.json` devDependencies:
- `@playwright/test` — test runner + assertions
- `playwright` — browser automation

Run `npm install` and `npx playwright install chromium`.

---

## Step 2: Create `frontend/playwright.config.ts`

Configure:
- **Test dir**: `frontend/e2e/`
- **Base URL**: `http://localhost:3000`
- **Timeout**: 30s per test, 120s per hook
- **Browser**: Chromium (headless by default, headed in CI)
- **Web server**: `npm run dev` auto-start with `timeout: 60000` + `reuseExistingServer: true`
- **Workers**: 1 (sequential — tests depend on DB state)
- **retries**: 0 local, 2 CI
- **Reporter**: HTML + list

---

## Step 3: Create E2E Helpers (`frontend/e2e/helpers/`)

### `auth.ts` — Authentication helpers
- `registerUser(page, {name, email, password, community?})` — fills & submits register form, returns user data
- `loginUser(page, {email, password})` — fills & submits login form
- `logoutUser(page)` — click logout in navbar
- `clearSession(page)` — clear sessionStorage via `page.evaluate`

### `items.ts` — Item helpers
- `createItem(page, {title, description, categoryId, dailyPrice, depositAmount})` — fills & submits item form
- `browseItems(page)` — navigate to `/items`

### `borrow.ts` — Borrow helpers
- `requestBorrow(page)` — click "Request to Borrow", fill message, submit
- `approveRequest(page, requestId)` — as lender, approve
- `rejectRequest(page, requestId)` — as lender, reject
- `returnItem(page, requestId)` — as borrower, mark returned

### `testData.ts` — Test data factory
- `generateUser(seed?)` — unique email/name per run using timestamp
- Pre-registered test users (lender + borrower) for borrow lifecycle tests

---

## Step 4: Write E2E Test Specs

### 4a. `auth.spec.ts` — Authentication Flows (Journey 1 & 2)

```
Test: Registration success
  → Navigate to /register
  → Fill name, email, password
  → Submit
  → Verify redirect to /items (not /login — code actually redirects to /items after auto-login)
  → Verify JWT stored in sessionStorage

Test: Registration with missing fields shows validation errors
  → Submit empty form → verify HTML5 validation or error messages

Test: Login success with registered credentials
  → Register first, then login
  → Fill email + password
  → Submit
  → Verify redirect to /items
  → Verify Navbar shows authenticated links (Add Item, My Borrows, Profile)

Test: Login with invalid credentials shows error
  → Fill wrong email/password → submit → verify error message

Test: Logout clears session
  → Login → logout → verify redirect to / → verify sessionStorage cleared

Test: Protected routes redirect to /login
  → Visit /items/new without auth → verify redirect to /login
  → Visit /borrow without auth → verify redirect to /login
```

### 4b. `items.spec.ts` — Item Browsing & Search (Journey 3)

```
Test: Browse items page loads with grid
  → Login → navigate to /items
  → Verify items are displayed in a grid
  → Verify "Browse Items" heading visible
  → Verify "Add Item" button visible

Test: Search filters items by keyword
  → Type in search input → verify filtered results
  → Clear search → verify all items return

Test: Category dropdown filters items
  → Select a category → verify results update
  → Select "All Categories" → verify all items return

Test: Item detail page shows full info
  → Click an item card → verify title, description, price, deposit, owner, status, date

Test: Empty state when no items match
  → Search for nonexistent term → verify "No items found" message
```

### 4c. `item-create.spec.ts` — Item Creation (Journey 4)

```
Test: Create item with all fields
  → Login → navigate to /items/new
  → Fill title, description, category, dailyPrice, depositAmount
  → Submit
  → Verify redirect to /items/[new-id]
  → Verify item details displayed

Test: Create item with only required fields (title)
  → Fill only title → submit → verify item created

Test: Unauthenticated user cannot create items
  → Visit /items/new without auth → verify redirect to /login
```

### 4d. `borrow-flow.spec.ts` — Borrow Lifecycle (Journey 5 — Most Critical)

```
Test: Full borrow lifecycle (happy path) — Two users required
  Precondition: Lender registers and creates an item. Borrower registers.
  
  AS BORROWER:
    → Login as borrower → navigate to /items
    → Click lender's item → verify "Request to Borrow" button visible
    → Click "Request to Borrow" → fill optional message → submit
    → Verify success message or redirect

  AS LENDER:
    → Login as lender → navigate to /borrow
    → Switch to "Items I'm Lending" tab
    → Verify pending request visible
    → Click "Approve" → verify status changes to "approved"

  AS BORROWER:
    → Login as borrower → navigate to /borrow
    → Click "Mark Returned" (or wait for lender to do it)
    → Verify status changes to "returned"

Test: Lender rejects borrow request
  → Borrower sends request → Lender navigates to /borrow → Clicks "Reject"
  → Verify status changes to "rejected"

Test: Cannot request own item (no "Request to Borrow" button)
  → Login → navigate to own item → verify "This is your listing" shown, no borrow button

Test: Cannot request already borrowed item
  → Item status is "borrowed" → verify no "Request to Borrow" button
```

### 4e. `reviews.spec.ts` — Review Submission (Journey 6)

```
Test: Submit review after borrow completion
  Precondition: Completed borrow lifecycle
  → Navigate to completed borrow → click "Leave Review" (if UI supports it)
  → Select rating → write comment → submit
  → Verify review appears on profile

Test: Reviews appear on user profile
  → Navigate to /profile
  → Verify reviews section shows reviews with star ratings
```

### 4f. `profile.spec.ts` — User Profile

```
Test: Profile shows user info
  → Login → navigate to /profile
  → Verify name, email, trust score displayed
  → Verify "My Items" section with count
  → Verify "Reviews" section

Test: Logout from profile page
  → Click "Log Out" → verify redirect to / → verify navbar shows guest state
```

### 4g. `responsive.spec.ts` — Responsive Design

```
Test: Homepage renders at mobile (375px)
Test: Browse page renders at tablet (768px)
Test: Navbar hamburger menu works on mobile
Test: Item detail page is readable at mobile width
```

---

## Step 5: Add npm Scripts

Add to `frontend/package.json`:
```json
"test:e2e": "playwright test",
"test:e2e:ui": "playwright test --ui",
"test:e2e:headed": "playwright test --headed",
"test:e2e:report": "playwright show-report"
```

---

## Files to Create

```
frontend/
├── playwright.config.ts
├── e2e/
│   ├── helpers/
│   │   ├── auth.ts
│   │   ├── items.ts
│   │   ├── borrow.ts
│   │   └── testData.ts
│   ├── auth.spec.ts
│   ├── items.spec.ts
│   ├── item-create.spec.ts
│   ├── borrow-flow.spec.ts
│   ├── reviews.spec.ts
│   ├── profile.spec.ts
│   └── responsive.spec.ts
```

## Dependencies Between Tests

Tests must run sequentially (1 worker) because:
- Auth tests create users that items tests need
- Borrow flow tests require items created by other tests
- Reviews depend on completed borrow cycles

## What This Does NOT Cover

- **Running tests against a live app** — requires PostgreSQL, Spring Boot, and Next.js dev server to be running
- **CI integration** (GitHub Actions workflow) — out of scope; could be a follow-up
- **Visual regression testing** — out of scope
- **API-level E2E tests** — focuses on UI flows only
