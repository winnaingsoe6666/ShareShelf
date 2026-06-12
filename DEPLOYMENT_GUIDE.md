# ShareShelf — Deployment Guide

This guide covers deploying ShareShelf to production across different providers (free-tier friendly).

## Architecture

```
Browser ──► Vercel ──► Render / Railway ──► PostgreSQL
(frontend)    (backend API)         (database)
```

- **Frontend**: Next.js static generation + server-side rendering on Vercel
- **Backend**: Spring Boot JAR running on Render / Railway / Fly.io
- **Database**: Managed PostgreSQL on Render / Neon / Railway

---

## Table of Contents

1. [Before You Deploy](#1-before-you-deploy)
2. [Option A: Vercel + Render + Neon (all free)](#2-option-a-vercel--render--neon)
3. [Option B: Railway (all-in-one, free credit)](#3-option-b-railway)
4. [Option C: Fly.io + Neon (all free)](#4-option-c-flyio--neon)
5. [Domain & SSL](#5-domain--ssl)
6. [CI/CD with GitHub Actions](#6-cicd-with-github-actions)
7. [Production Checklist](#7-production-checklist)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Before You Deploy

### 1.1 Push to GitHub

```bash
cd /home/wns/winnaingsoe6666/ShareShelf

# Create a new repo on GitHub first (without README, .gitignore, or license)
# then run:
git remote add origin https://github.com/YOUR_USER/shareshelf.git
git push -u origin main
```

### 1.2 Generate Production Secrets

```bash
# JWT signing key (REQUIRED — do not use the dev default)
openssl rand -base64 64
# Copy the output — you'll paste it as JWT_SECRET

# Optional: Generate a random DB password
openssl rand -base64 32
```

### 1.3 Create a Production Spring Profile

```bash
cat > backend/src/main/resources/application-prod.yml << 'EOF'
spring:
  jpa:
    show-sql: false
  flyway:
    clean-disabled: true

logging:
  level:
    com.shareshelf: INFO
    org.springframework.security: WARN
    org.hibernate.SQL: WARN

springdoc:
  api-docs:
    enabled: false
  swagger-ui:
    enabled: false
EOF
```

### 1.4 Update CORS for Production

Edit `backend/src/main/kotlin/com/shareshelf/config/CorsConfig.kt` to use an environment variable:

```kotlin
@Configuration
class CorsConfig {

    @Bean
    fun corsFilter(): CorsFilter {
        val config = CorsConfiguration().apply {
            allowCredentials = true
            allowedOrigins = (System.getenv("CORS_ORIGINS") ?: "http://localhost:3000")
                .split(",")
                .map { it.trim() }
            allowedMethods = listOf("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
            allowedHeaders = listOf("*")
            exposedHeaders = listOf("Authorization")
        }
        // ...
    }
}
```

### 1.5 Update Next.js Image Config

Edit `frontend/next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.onrender.com",
      },
      {
        protocol: "https",
        hostname: "**.railway.app",
      },
    ],
  },
};

export default nextConfig;
```

---

## 2. Option A: Vercel + Render + Neon

**Cost: $0/mo** | All three have generous free tiers.

### 2.1 Database — Neon

[Neon](https://neon.tech) is serverless PostgreSQL with a free tier (0.5 GB, always-on).

1. Go to https://neon.tech and sign up (GitHub login)
2. Click **Create a project**
   - Name: `shareshelf`
   - Region: pick closest to you
3. Copy the **connection string** — it looks like:
   ```
   postgresql://alice:xxxxx@ep-shy-rain-123456.us-east-2.aws.neon.tech/shareshelf?sslmode=require
   ```

### 2.2 Backend — Render

[Render](https://render.com) runs web services on a free tier (spins down after 15 min idle).

1. Go to https://render.com and sign up (GitHub login)
2. Click **New +** → **Web Service**
3. Connect your GitHub repo (`YOUR_USER/shareshelf`)
4. Configure:

   | Field | Value |
   |-------|-------|
   | **Name** | `shareshelf-api` |
   | **Root Directory** | `backend` |
   | **Runtime** | `Java` |
   | **Build Command** | `./gradlew build -x test` |
   | **Start Command** | `./gradlew bootRun` |
   | **Plan** | Free |

5. Add **Environment Variables**:

   | Variable | Value |
   |----------|-------|
   | `SPRING_PROFILES_ACTIVE` | `prod` |
   | `JWT_SECRET` | *(output from `openssl rand -base64 64`)* |
   | `DB_PASSWORD` | *(from Neon connection string)* |
   | `SPRING_DATASOURCE_URL` | `jdbc:postgresql://ep-shy-rain-...neon.tech/shareshelf?sslmode=require` |
   | `SPRING_DATASOURCE_USERNAME` | *(from Neon connection string)* |
   | `CORS_ORIGINS` | `https://shareshelf.vercel.app` *(update after frontend deploys)* |

6. Click **Create Web Service** — it will build and deploy (~5 min first time)

### 2.3 Frontend — Vercel

[Vercel](https://vercel.com) deploys Next.js apps for free.

1. Go to https://vercel.com and sign up (GitHub login)
2. Click **Add New…** → **Project**
3. Import your `shareshelf` repo
4. Configure:

   | Field | Value |
   |-------|-------|
   | **Root Directory** | `frontend` |
   | **Framework Preset** | Next.js |

5. Add **Environment Variable**:

   | Variable | Value |
   |----------|-------|
   | `NEXT_PUBLIC_API_URL` | `https://shareshelf-api.onrender.com` |

6. Click **Deploy** — your app is live at `https://shareshelf.vercel.app` 🎉

7. **Update CORS**: Go back to Render → Environment → edit `CORS_ORIGINS` to your Vercel URL.

---

## 3. Option B: Railway

**Cost: $5 free credit, no card required to start.** Railway bundles backend + database.

### 3.1 Deploy

1. Go to https://railway.app and sign up (GitHub)
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your `shareshelf` repo
4. Railway auto-detects the Gradle build — add these variables:

   | Variable | Value |
   |----------|-------|
   | `SPRING_PROFILES_ACTIVE` | `railway` |
   | `JWT_SECRET` | *(random 64-char base64)* |
   | `PORT` | `8080` |
   | `CORS_ORIGINS` | `https://shareshelf.up.railway.app` *(update later)* |

5. Add a **PostgreSQL** plugin:
   - Click **New** → **Database** → **Add PostgreSQL**
   - Railway auto-injects `DATABASE_URL` into the app
6. Deploy will auto-start

### 3.2 Update application.yml for Railway

Railway provides `DATABASE_URL` directly (format: `postgresql://user:pass@host:port/db?sslmode=require`). The `application-railway.yml` profile already handles this correctly:

```yaml
spring:
  datasource:
    url: jdbc:${DATABASE_URL}
    # Username and password are embedded in DATABASE_URL; do not set separately.
```

The `jdbc:` prefix is required because Spring Boot expects a `jdbc:postgresql://...` URL, while Railway's `DATABASE_URL` starts with `postgresql://...`.

### 3.3 Frontend on Railway

You can deploy the frontend as a separate Railway service or use Vercel (as in Option A).

To add frontend:
1. **New** → **Empty Service** → **Add GitHub repo** (same repo, root: `frontend`)
2. Build command: `npm install && npm run build`
3. Start command: `npm run start`
4. Add `NEXT_PUBLIC_API_URL` pointing to your backend Railway URL

---

## 4. Option C: Fly.io + Neon

**Cost: $0/mo** | Fly.io free tier includes 3 shared-CPU VMs.

### 4.1 Install Fly CLI & Deploy

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh
export PATH="$HOME/.fly/bin:$PATH"

# Login
fly auth login

# Launch the backend
cd backend
fly launch
```

Follow the prompts:
- App name: `shareshelf-api`
- Region: pick closest
- PostgreSQL: **No** (we'll use Neon externally)
- Deploy now: **No**

### 4.2 Configure

Edit `backend/fly.toml` (created by `fly launch`):

```toml
app = "shareshelf-api"

[env]
  SPRING_PROFILES_ACTIVE = "prod"
  JWT_SECRET = "your-generated-secret"
  SPRING_DATASOURCE_URL = "jdbc:postgresql://ep-xxx.neon.tech/shareshelf?sslmode=require"
  SPRING_DATASOURCE_USERNAME = "alice"
  SPRING_DATASOURCE_PASSWORD = "xxxxx"
  CORS_ORIGINS = "https://shareshelf.vercel.app"

[[services]]
  http_checks = []
  internal_port = 8080
  processes = ["app"]
  protocol = "tcp"
  script_checks = []
  [services.concurrency]
    hard_limit = 25
    soft_limit = 20
    type = "connections"

  [[services.ports]]
    force_https = true
    handlers = ["http"]
    port = 80
  [[services.ports]]
    handlers = ["tls", "http"]
    port = 443
```

Then deploy:

```bash
fly deploy
```

### 4.3 Frontend on Vercel

Same as [Section 2.3](#23-frontend--vercel). Set `NEXT_PUBLIC_API_URL` to `https://shareshelf-api.fly.dev`.

---

## 5. Domain & SSL

All providers above give you a **free subdomain with SSL**:
- Vercel: `your-app.vercel.app` (auto SSL)
- Render: `your-app.onrender.com` (auto SSL)
- Railway: `your-app.up.railway.app` (auto SSL)
- Fly.io: `your-app.fly.dev` (auto SSL)

### Custom Domain (optional)

| Provider | Custom Domain |
|----------|--------------|
| **Vercel** | Add in Dashboard → Project → Domains (auto SSL) |
| **Render** | Add in Dashboard → Settings → Custom Domain (auto SSL) |
| **Railway** | Paid plan only |
| **Fly.io** | `fly certs create yourdomain.com` |

---

## 6. CI/CD with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          java-version: 21
          distribution: temurin
      - run: ./gradlew compileKotlin

  test-frontend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci
      - run: npm run build

  # ===== Deploy to Render =====
  # Uncomment and add RENDER_DEPLOY_HOOK as a GitHub secret:
  # deploy-render:
  #   needs: [test-backend, test-frontend]
  #   runs-on: ubuntu-latest
  #   steps:
  #     - run: curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK }}

  # ===== Deploy to Fly.io =====
  # deploy-fly:
  #   needs: [test-backend, test-frontend]
  #   runs-on: ubuntu-latest
  #   steps:
  #     - uses: superfly/flyctl-actions/setup-flyctl@master
  #     - run: flyctl deploy --remote-only
  #       working-directory: backend
  #       env:
  #         FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

**Getting deploy hooks:**
- **Render**: Dashboard → Web Service → Settings → Deploy Hook → copy URL
- **Vercel**: Dashboard → Project → Settings → Git → Deploy Hooks

---

## 7. Production Checklist

### Security

- [ ] **JWT_SECRET** is a strong random value (not the dev default)
- [ ] **Swagger/OpenAPI disabled** in production (`springdoc.api-docs.enabled: false`)
- [ ] **CORS** restricted to your actual frontend domain
- [ ] **Flyway clean disabled** (`spring.flyway.clean-disabled: true`)
- [ ] **HTTPS enabled** (auto with all providers above)
- [ ] **DB password** is strong and unique

### Configuration

- [ ] `SPRING_PROFILES_ACTIVE=prod` is set
- [ ] `CORS_ORIGINS` points to your deployed frontend
- [ ] `NEXT_PUBLIC_API_URL` in frontend points to deployed backend
- [ ] Database connection string uses `sslmode=require`

### Performance

- [ ] Connection pooling configured (Neon and Railway handle this; Render may need HikariCP tuning)
- [ ] Image uploads switched to S3/Cloudflare R2 (local filesystem doesn't persist across deploys)

### Monitoring

- [ ] Render: Dashboard shows live logs and metrics
- [ ] Vercel: Analytics available under Dashboard → Analytics
- [ ] Consider [Sentry](https://sentry.io) free tier for error tracking:
  ```bash
  # Backend: add spring-boot-starter-actuator + sentry-spring-boot-starter
  # Frontend: npm install @sentry/nextjs
  ```

---

## 8. Troubleshooting

### Backend won't start

```bash
# Check logs on Render
# Dashboard → Web Service → Logs

# Common issues:
# 1. Database not reachable — verify connection string and SSL
# 2. Flyway migration fails — check SQL syntax in migrations
# 3. Port mismatch — Render/Fly use PORT env var, Spring uses 8080.
#    Set SERVER_PORT=${PORT} env var if needed.
```

### Railway health check failure

If you see the error **"deployment failed during the network process: healtcheck"** in Railway's deploy logs:

1. **Wrong Spring profile** — Railway needs `SPRING_PROFILES_ACTIVE=railway`, not `prod`. The `railway` profile ships with the correct `jdbc:${DATABASE_URL}` datasource config.
2. **Cold start timeout** — Spring Boot + JVM + DB connection can take 2-3 minutes on first deploy. The default `healthcheckTimeout: 120` in `railway.json` may be too short. Increase it to 300.
3. **DB not ready yet** — Railway's PostgreSQL plugin starts in parallel with the app. If the health check fails immediately, wait 60s and Railway will retry (up to 5 retries with `restartPolicyMaxRetries: 5`).

### Frontend can't reach backend

```bash
# 1. Check NEXT_PUBLIC_API_URL is set correctly in Vercel dashboard
# 2. Verify CORS on backend allows your frontend domain
# 3. Check that the backend URL is https (not http)
# 4. Open browser DevTools → Network tab to see the actual request failure
```

### Database connection errors

```bash
# Neon
# Make sure sslmode=require is in the connection string
# Neon free tier auto-pauses after 5 min idle — first connection may take 2-3s

# Render PostgreSQL (free)
# Database is ephemeral — data may be lost after 90 days
# Not recommended for production data
```

### Cold starts

**Render** and **Fly.io** free tiers spin down after inactivity. First request after idle takes:

| Provider | Cold Start |
|----------|-----------|
| **Render** | ~30-60s (Spring Boot boot time) |
| **Fly.io** | ~10-20s |
| **Vercel** | Near-zero (static pages) |
| **Neon** | ~2-3s (first query) |

To mitigate with Render, set up a **cron job** (https://cron-job.org is free):

```bash
# Ping your backend every 10 min to keep it warm
Interval: Every 10 minutes
URL: https://shareshelf-api.onrender.com/api/auth/login
Request method: HEAD
```

### Rollback

```bash
# Vercel: Dashboard → Deployments → click the three dots → Promote to Production
# Render: Dashboard → Web Service → Manual Deploy → Deploy prior commit
# Railway: Click on deployment → Rollback to this deploy
```

---

## Quick Reference: Provider URLs

| Provider | Sign Up | Dashboard |
|----------|---------|-----------|
| **Vercel** | https://vercel.com | https://vercel.com/dashboard |
| **Render** | https://render.com | https://dashboard.render.com |
| **Railway** | https://railway.app | https://railway.app/dashboard |
| **Fly.io** | https://fly.io | https://fly.io/dashboard |
| **Neon** | https://neon.tech | https://console.neon.tech |

---

## Recommended Path

For a **first deployment with zero cost**, use:

1. **Neon** for PostgreSQL — set up in 2 min
2. **Render** for backend — connects to GitHub, auto-deploys
3. **Vercel** for frontend — one-click from GitHub

This path keeps everything free, has the simplest setup, and each provider auto-provisions SSL.
