---
status: passed
phase: 08-photo-upload-r2
verified: "2026-06-25"
---

# Verification: Phase 8 — Photo Upload R2 Migration

## Goal Achievement

**Goal**: Replace local filesystem storage with Cloudflare R2 for persistent, CDN-backed image hosting

**Result**: ✓ Achieved — backend storage fully migrated to R2, frontend configured for R2 image domains

## Must-Have Checks

| # | Check | Status | Evidence |
|---|-------|--------|----------|
| 1 | AWS S3 SDK in build.gradle.kts | ✓ | `software.amazon.awssdk:s3:2.25.0` |
| 2 | R2Config creates S3Client bean | ✓ | `R2Config.kt` with endpoint, credentials, region=auto, pathStyleAccess |
| 3 | FileStorageService uses S3Client | ✓ | `putObject` for store, `deleteObject` for delete |
| 4 | No local filesystem code in storage | ✓ | No `Files.copy` or `java.nio.file` references |
| 5 | WebConfig no /uploads handler | ✓ | Resource handler removed |
| 6 | SecurityConfig no /uploads permitAll | ✓ | Line removed |
| 7 | R2 in next.config.ts remotePatterns | ✓ | `*.r2.cloudflarestorage.com` and `**.r2.dev` |
| 8 | R2 config in application.yml | ✓ | `app.r2.*` properties |
| 9 | R2 config in application-railway.yml | ✓ | `app.r2.*` with env var references |
| 10 | R2 config in application-dev.yml | ✓ | `app.r2.*` with env var defaults |
| 11 | Backend compiles | ✓ | `./gradlew compileKotlin` passes |
| 12 | FileStorageServiceTest passes | ✓ | All 9 tests pass with S3Client mocks |

## API Contract Verification

- POST /items/{id}/images — unchanged (multipart form upload)
- DELETE /items/{id}/images — unchanged (URL parameter)
- imageUrls JSONB column — now stores full R2 URLs (https://...) instead of relative /uploads/ paths
- Frontend upload code — no logic changes needed (same FormData POST)

## Risk Acceptance

- Existing local dev images (stored as `/uploads/items/...`) will not resolve after migration — acceptable for dev
- Production images on Railway were already lost (ephemeral disk) — R2 fixes this going forward

## Requirements Traceability

| Requirement | Plan | Status |
|-------------|------|--------|
| R2-01: R2 storage backend | 08-01 | ✓ Complete |
| R2-02: Frontend R2 integration | 08-02 | ✓ Complete |
