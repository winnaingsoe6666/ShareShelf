# Technology Stack

**Analysis Date:** 2026-06-13

## Languages

**Primary:**
- **Kotlin 2.1.0** — Backend application logic, JPA entities, controllers, services. Located in `backend/src/main/kotlin/com/shareshelf/`.
- **TypeScript ~5.7** — Frontend application logic, component props, API type definitions. Located in `frontend/src/`.

**Secondary:**
- **Java 21** — Underlying JVM runtime. No hand-written Java source files found; all backend code is Kotlin compiled to JVM bytecode via `jvmToolchain(21)`.

## Runtime

**Environment:**
- **JVM** (eclipse-temurin:21-jre-jammy in production) — Backend runs as a Spring Boot fat JAR (`shareshelf-0.0.1-SNAPSHOT.jar`).
- **Node.js** (via Vercel) — Frontend is built statically or server-side rendered by Next.js.

**Package Manager (Backend):**
- **Gradle 8.12** — Kotlin DSL (`settings.gradle.kts`, `build.gradle.kts`). Wrapper configured in `backend/gradle/wrapper/gradle-wrapper.properties`.

**Package Manager (Frontend):**
- **npm** — `frontend/package.json` present, no lockfile committed (neither `package-lock.json` nor `yarn.lock` or `pnpm-lock.yaml` detected). Dependency versions are semver-ranged.

## Frameworks

**Core:**
- **Spring Boot 3.4.3** — Java/Kotlin web framework. Application entry point at `backend/src/main/kotlin/com/shareshelf/ShareShelfApplication.kt`.
  - `spring-boot-starter-web` — REST controllers, embedded Tomcat.
  - `spring-boot-starter-security` — Authentication/authorization, JWT filter chain.
  - `spring-boot-starter-data-jpa` — ORM via Hibernate + PostgreSQL dialect.
  - `spring-boot-starter-validation` — Jakarta Bean Validation on DTOs.
- **Next.js 15 (App Router)** — React meta-framework. Configuration at `frontend/next.config.ts`. All pages are client components under `frontend/src/app/`.
- **React 19** — UI component library. Client components only (no Server Components used in pages found).

**Testing:**
- **JUnit 5** (via `spring-boot-starter-test`) — Test runner.
- **MockK 1.13.14** — Kotlin-native mocking library.
- **SpringMockK 4.0.2** — Spring Boot integration for MockK.
- **Spring Security Test** — `@WithMockUser` / `SecurityMockServerRequest` support.

**Build/Dev:**
- **Spring Boot DevTools** — Hot reload during development.
- **Kotlin JPA plugin** — `kotlin("plugin.jpa")` for no-arg constructors on entities.
- **Kotlin AllOpen plugin** — `kotlin("plugin.allopen")` to open JPA-annotated classes.
- **Kotlin Spring plugin** — `kotlin("plugin.spring")` to open `@Configuration`/`@Bean` classes.

## Key Dependencies

**Critical:**
- **jjwt 0.12.6** (`io.jsonwebtoken:jjwt-api`) — JWT token generation and validation at `backend/src/main/kotlin/com/shareshelf/auth/JwtTokenProvider.kt`. Well-integrated, uses `Keys.hmacShaKeyFor()` with HMAC-SHA.
- **Springdoc OpenAPI 2.8.5** (`springdoc-openapi-starter-webmvc-ui:2.8.5`) — Swagger UI at `/swagger-ui.html` and OpenAPI spec at `/api-docs`. Enabled in dev, disabled in railway profile (`application-railway.yml`).
- **Axios 1.7.9** — HTTP client for frontend API calls. Singleton instance at `frontend/src/lib/api.ts` with request/response interceptors for JWT injection and 401 handling.
- **Flyway** (`flyway-core`, `flyway-database-postgresql`) — Database migrations. Migrations at `backend/src/main/resources/db/migration/V1`-`V5`. `ddl-auto: validate` ensures schema matches migrations.
- **Resend API** (via `RestTemplate`) — Email verification service. `EmailService` at `backend/src/main/kotlin/com/shareshelf/auth/EmailService.kt` sends verification emails via REST API. Replaces SMTP (JavaMailSender). Marked `@Async` for non-blocking execution.

**Infrastructure:**
- **PostgreSQL JDBC Driver** (`org.postgresql:postgresql`) — Database connectivity. Runtime scope.

## Configuration

**Environment:**
- Backend uses Spring profiles: `default` (dev at `application.yml` + `application-dev.yml` active by default?), and `railway` (`application-railway.yml` activated in Docker by `SPRING_PROFILES_ACTIVE=railway`).
- Frontend uses `NEXT_PUBLIC_API_URL` environment variable (defaults to `/api` proxy in `frontend/src/lib/api.ts`).

**Key configs required:**
| Variable | Purpose | Set in |
|---|---|---|
| `JWT_SECRET` | HMAC-SHA key for signing tokens | `application.yml` (fallback dev value) |
| `DB_PASSWORD` | Local dev database password | `application.yml` (fallback `shareshelf_dev`) |
| `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD` | Railway Postgres connection | `application-railway.yml` |
| `PORT` | Server port on Railway | `application-railway.yml` (defaults 8080) |
| `NEXT_PUBLIC_API_URL` | Backend URL for frontend API calls | Frontend env at deploy |
| `RESEND_API_KEY` | Resend API key for sending verification emails | Backend env (required for email) |
| `GOOGLE_CLIENT_ID` | Google OAuth2 client ID | Backend env (required for auth) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth2 client secret | Backend env (required for auth) |

**Build:**
- Backend: `backend/build.gradle.kts` (Gradle Kotlin DSL).
- Frontend: `frontend/next.config.ts`, `frontend/postcss.config.mjs`.
- Docker: `Dockerfile` at project root (multi-stage build using `gradle:8.12-jdk21` then `eclipse-temurin:21-jre-jammy`).

## Platform Requirements

**Development:**
- JDK 21 (tested with Eclipse Temurin).
- Kotlin 2.1.0 compiler (via Gradle plugin).
- Node.js 18+ (for frontend dev server).
- PostgreSQL server on localhost:5432 with database `shareshelf` and user `shareshelf`.
- Gradle 8.12 wrapper (auto-downloaded).

**Production:**
- Railway (backend): Docker container with JDK 21 runtime.
- Vercel (frontend): Node.js runtime, Next.js build output.
- PostgreSQL: Managed by Railway add-on.

---

*Stack analysis: 2026-06-13*
