# ShareShelf — Community Tool Library

**ShareShelf** is a community-powered tool library designed to foster local collaboration by helping people borrow, lend, and share rarely used tools and equipment within their neighborhood, apartment complex, university, or local community. 

Whether it's a power drill for a quick weekend project, a tent for a camping trip, or gardening equipment for the spring, ShareShelf connects individuals who need temporary access to gear with neighbors who have items sitting idle.

### Why ShareShelf?
- 🌍 **Reduce Waste:** Promote sustainable living by maximizing the lifespan and utility of manufactured goods.
- 💰 **Save Money:** Avoid the high costs of purchasing tools and equipment that you might only use once or twice a year.
- 🤝 **Build Community:** Connect with your neighbors, build local trust, and strengthen the bonds within your local network.
- 📦 **Save Space:** Declutter your garage or apartment by borrowing what you need, only when you need it.

With built-in trust scores, community statistics, and seamless in-app notifications, ShareShelf makes the process of lending and borrowing as smooth and reliable as possible.

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, next-intl |
| **Backend** | Spring Boot 3.4, Kotlin, Gradle 8.12 (Kotlin DSL) |
| **Database** | PostgreSQL + Flyway (versioned migrations) |
| **Auth** | JWT (jjwt), Spring Security |
| **Testing** | Vitest, Playwright, JUnit 5, MockK |

## Project Structure

```
ShareShelf/
├── backend/               # Spring Boot REST API
│   ├── build.gradle.kts   # Gradle build config
│   └── src/
│       ├── main/kotlin/   # Kotlin source files
│       └── resources/     # Config + Flyway migrations
├── frontend/              # Next.js client app
│   └── src/
│       ├── app/           # Pages (App Router)
│       ├── components/    # Reusable UI + domain components
│       ├── lib/           # API client, auth helpers
│       └── types/         # TypeScript types
├── scripts/               # Dev helper scripts
└── proposal/              # Project proposal
```

## Quick Start

### Prerequisites

- **Java 21+** — verify: `java --version`
- **Node.js 20+** — verify: `node --version`
- **PostgreSQL 16+** — verify: `psql --version`
- **Gradle 8.12** (optional — the wrapper handles it)

### 1. Database

```bash
# Start PostgreSQL and create the database
sudo ./scripts/start-db.sh
```

### 2. Backend

```bash
cd backend

# Build and run
./gradlew bootRun

# The API starts at http://localhost:8080
# Swagger UI: http://localhost:8080/swagger-ui.html
```

### 3. Frontend

In a separate terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev

# The app runs at http://localhost:3000
```

### 4. Seed Demo Data (optional)

```bash
./scripts/seed.sh
```

Demo credentials:
- `alice@example.com` / `password123`
- `bob@example.com` / `password123`
- `charlie@example.com` / `password123`

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Log in, get JWT |
| GET | `/api/auth/me` | Yes | Current user profile |
| POST | `/api/auth/logout` | Yes | Log out |
| POST | `/api/auth/refresh` | No | Refresh JWT token |
| GET | `/api/items` | Yes | List/search items |
| POST | `/api/items` | Yes | Create item listing |
| GET | `/api/items/{id}` | Yes | Item detail |
| PUT | `/api/items/{id}` | Yes | Update item |
| DELETE | `/api/items/{id}` | Yes | Delete item |
| POST | `/api/items/{id}/images` | Yes | Upload item image |
| DELETE | `/api/items/{id}/images` | Yes | Delete item image |
| POST | `/api/borrow` | Yes | Submit borrow request |
| GET | `/api/borrow` | Yes | My borrows & lends |
| PUT | `/api/borrow/{id}/approve` | Yes | Approve request |
| PUT | `/api/borrow/{id}/reject` | Yes | Reject request |
| PUT | `/api/borrow/{id}/return` | Yes | Mark returned |
| POST | `/api/review` | Yes | Rate a transaction |
| GET | `/api/review/user/{id}` | Yes | User's reviews |
| GET | `/api/categories` | Yes | List categories |
| GET | `/api/notifications` | Yes | List user notifications |
| GET | `/api/notifications/unread-count` | Yes | Get unread count |
| PUT | `/api/notifications/{id}/read` | Yes | Mark notification read |
| PUT | `/api/notifications/read-all` | Yes | Mark all read |
| GET | `/api/community/stats` | No | Platform statistics |
| GET | `/api/health` | No | Health check |
| GET | `/api/dev/seed` | No | Seed demo data |

## Features

- [x] User Registration and Authentication
- [x] Item Management (create, edit, delete listings)
- [x] Borrowing Workflow (request → approve/reject → return)
- [x] Search and Discovery (by name, category, status)
- [x] Reviews and Ratings (1-5 star, trust score)
- [x] Photo upload and image gallery support
- [x] In-app Notifications
- [x] Community Statistics
- [x] Internationalization (i18n)
- [x] Deployment configuration (Docker, Railway)
- [x] Comprehensive Testing (Vitest, Playwright, JUnit)

## Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_PASSWORD` | `shareshelf_dev` | PostgreSQL password |
| `JWT_SECRET` | (dev secret) | JWT signing key (min 256 bits) |
| `SPRING_PROFILES_ACTIVE` | `dev` | Spring profile |

### Frontend (`frontend/.env.local`)

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080` | Backend API base URL |

## License

MIT
