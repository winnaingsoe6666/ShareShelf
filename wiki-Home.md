# ShareShelf — Community Tool Library

**ShareShelf** is a community-powered tool library that lets neighbors borrow, lend, and share rarely used tools and equipment within their neighborhood, university, or local community.

Instead of buying a $200 drill for one shelf or a tent for one camping trip, browse what your neighbors are already sharing — or list your own idle gear and build trust in your community.

---

## Why ShareShelf?

| | |
|---|---|
| 🌍 **Reduce Waste** | Maximize the lifespan of tools instead of manufacturing more |
| 💰 **Save Money** | Borrow what you need once or twice a year; skip the purchase |
| 🤝 **Build Community** | Every borrow builds trust between neighbors |
| 📦 **Save Space** | Declutter your garage; borrow only when you need it |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4 |
| **Backend** | Spring Boot 3.4, Kotlin 2.1, Gradle 8.12 (Kotlin DSL) |
| **Database** | PostgreSQL + Flyway (V1–V10 migrations) |
| **Auth** | JWT (jjwt 0.12) + refresh tokens + JTI blacklist + account lockout |
| **i18n** | next-intl — English + Burmese (မြန်မာ) |
| **Testing** | JUnit 5 + MockK (backend), Vitest + React Testing Library (frontend), Playwright (E2E) |
| **Deployment** | Railway (backend Docker) + Vercel (frontend) |

---

## Project Structure

```
ShareShelf/
├── backend/                      # Spring Boot REST API (Kotlin)
│   ├── build.gradle.kts
│   └── src/main/
│       ├── kotlin/com/shareshelf/ # Auth, Item, Borrow, Review, Category,
│       │                           # Notification, Community, Storage, Config
│       └── resources/db/migration/ # Flyway V1–V10
├── frontend/                     # Next.js client (TypeScript)
│   ├── src/
│   │   ├── app/[locale]/         # Pages: home, items, community, borrow,
│   │   │                         #   profile, about, readme, login, register
│   │   ├── components/           # UI kit + layout (Navbar, Footer, Modal,
│   │   │                         #   Skeleton, ImageUpload, ItemCard, etc.)
│   │   ├── lib/                  # API client, auth helpers, design tokens
│   │   ├── i18n/                 # next-intl routing & navigation
│   │   └── test/                 # Test setup & mocks
│   └── messages/                 # en.json, my.json translation files
├── slides/                       # PechaKucha deck (Marp)
├── proposal/                     # Project proposal
├── scripts/                      # DB start & seed helper scripts
├── Dockerfile                    # Railway backend deployment
├── report.md                     # Ch-3 report
└── CLAUDE.md                     # AI-assisted development guide
```

---

## Quick Start

### Prerequisites

- **Java 21+** — `java --version`
- **Node.js 18+** — `node --version`
- **PostgreSQL 16+** — `psql --version`

### 1. Database

```bash
sudo ./scripts/start-db.sh          # Creates database & user
```

### 2. Backend

```bash
cd backend
./gradlew bootRun                   # http://localhost:8080
# Swagger UI: http://localhost:8080/swagger-ui.html
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev                         # http://localhost:3000
```

### 4. Seed Demo Data (optional)

```bash
./scripts/seed.sh                   # Or: curl http://localhost:8080/api/dev/seed
```

Demo accounts: `alice@example.com` / `bob@example.com` / `charlie@example.com` (password: `password123`)

> **Note:** Login and registration now use Google OAuth. Demo accounts with password login are no longer available on the login page.

---

## Features

- [x] **User Authentication** — Google OAuth sign-in/sign-up, JWT, email verification (Resend API), JTI blacklist, logout
- [x] **Item Management** — Create, edit, delete listings with photo uploads and image galleries
- [x] **Borrowing Workflow** — Request → Approve/Reject → Mark Returned, with full lifecycle tracking
- [x] **Reviews & Trust Scores** — 1–5 star ratings after each borrow, trust score recalculated automatically
- [x] **Search & Discovery** — Search by name, filter by category, status, and minimum rating
- [x] **In-App Notifications** — Real-time bell with unread count, mark read, mark all read
- [x] **Community Dashboard** — Animated counters (items shared, members, successful borrows), top sharers
- [x] **Internationalization** — English + Burmese (မြန်မာ) with language switcher
- [x] **Rate Limiting** — API protection against abuse
- [x] **File Storage** — Photo upload with preview and removal
- [x] **Deployment** — Railway (backend Docker) + Vercel (frontend), CI/CD configured
- [x] **Testing** — Unit, integration, and E2E tests across backend and frontend
- [x] **AI-Assisted Development** — MCP servers, Claude Skills & Agents integrated

---

## Architecture

ShareShelf follows a layered architecture with strict dependency direction:

```
Browser → Next.js (React) → Axios HTTP Client → Spring Boot REST API → PostgreSQL
```

| Layer | Responsibility | Location |
|---|---|---|
| **Frontend** | Browser-side UI rendering | `frontend/src/` |
| **Controller** | HTTP request/response, route mapping, validation | `backend/.../auth/`, `item/`, `borrow/` |
| **Service** | Business logic, orchestration, transactions | `backend/.../*/` |
| **Repository** | Data access via Spring Data JPA | `backend/.../*/entity/` |
| **Database** | Persistent storage (PostgreSQL + Flyway) | `backend/.../resources/db/migration/` |

### Pattern Overview

- **Backend:** Package-by-feature (`auth/`, `item/`, `borrow/`, `review/`, `category/`, `common/`, `config/`)
- **Frontend:** Next.js App Router with page-per-route under `src/app/`
- **API:** All responses wrapped in `ApiResponse<T>` — `{success, message, data, errors}`
- **Auth:** JWT Bearer tokens, stateless sessions
- **Migrations:** Flyway with `ddl-auto: validate`

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register with email/password (sends verification email) |
| POST | `/api/auth/login` | No | Log in with email/password, get JWT |
| POST | `/api/auth/google` | No | Google OAuth login/register, get JWT |
| GET | `/api/auth/verify-email` | No | Verify email address with token |
| GET | `/api/auth/me` | Yes | Current user profile |
| POST | `/api/auth/logout` | Yes | Log out (JTI blacklist) |
| POST | `/api/auth/refresh` | No | Refresh access token |
| GET | `/api/items` | Yes | List/search items |
| POST | `/api/items` | Yes | Create item listing |
| GET | `/api/items/{id}` | Yes | Item detail |
| PUT | `/api/items/{id}` | Yes | Update item |
| DELETE | `/api/items/{id}` | Yes | Delete item |
| POST | `/api/items/{id}/images` | Yes | Upload item photo |
| DELETE | `/api/items/{id}/images` | Yes | Remove item photo |
| POST | `/api/borrow` | Yes | Submit borrow request |
| GET | `/api/borrow` | Yes | My borrows |
| PUT | `/api/borrow/{id}/approve` | Yes | Approve request |
| PUT | `/api/borrow/{id}/reject` | Yes | Reject request |
| PUT | `/api/borrow/{id}/return` | Yes | Mark returned |
| POST | `/api/review` | Yes | Submit review & rating |
| GET | `/api/review/user/{id}` | Yes | User's reviews |
| GET | `/api/categories` | Yes | List categories |
| GET | `/api/notifications` | Yes | User notifications |
| GET | `/api/notifications/unread-count` | Yes | Unread count |
| PUT | `/api/notifications/{id}/read` | Yes | Mark read |
| PUT | `/api/notifications/read-all` | Yes | Mark all read |
| GET | `/api/community/stats` | No | Platform statistics |
| GET | `/api/health` | No | Health check |
| GET | `/api/dev/seed` | No | Seed demo data |

---

## Borrow Request Lifecycle

```
REQUESTED → APPROVED → RETURNED
                  ↘ REJECTED
```

1. **Borrower** submits a borrow request on an available item
2. **Lender** (item owner) approves or rejects the request
3. Item status transitions: `AVAILABLE` → `BORROWED` → `AVAILABLE` (upon return)
4. After return, borrower can leave a review & rating (1–5 stars)
5. Trust scores are recalculated after each review

---

## Environment Variables

### Backend

| Variable | Default | Description |
|---|---|---|
| `DB_PASSWORD` | `shareshelf_dev` | PostgreSQL password |
| `JWT_SECRET` | (dev value) | JWT HMAC-SHA signing key |
| `RESEND_API_KEY` | *(empty)* | Resend API key for sending verification emails |
| `GOOGLE_CLIENT_ID` | *(required)* | Google OAuth2 client ID |
| `GOOGLE_CLIENT_SECRET` | *(required)* | Google OAuth2 client secret |
| `SPRING_PROFILES_ACTIVE` | `dev` | Spring profile (`dev` or `railway`) |

### Frontend

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080` | Backend API base URL |

---

## AI-Assisted Development

ShareShelf was built with Claude Code assistance, using:

### MCP Servers (`.mcp.json`)

| Server | Purpose |
|---|---|
| `shareshelf-db` | PostgreSQL read-only query access |
| `memory` | Knowledge graph memory persistence |
| `sequential-thinking` | Structured reasoning |
| `github` | GitHub API integration |
| `playwright` | Browser automation & E2E testing |
| `filesystem` | Project-scoped filesystem access |

### Development Workflow

The project uses the GSD (Get Shit Done) workflow system with:
- Structured phases and plans tracked in `.planning/`
- Quick tasks for ad-hoc fixes and improvements
- Worktree isolation for parallel agent execution
- Automatic STATE.md tracking

---

## License

MIT
