# Research: Phase 08 — Photo Upload R2 Migration

## Current State

- FileStorageService uses local filesystem (`java.nio.file.Files.copy`)
- Images stored at `uploads/items/{uuid}.{ext}`
- Served via Spring WebConfig resource handler at `/uploads/**`
- SecurityConfig permits GET `/uploads/**` without auth
- Item entity stores `image_urls` as JSONB array of URL strings
- Image upload endpoints: POST/DELETE `/api/items/{id}/images`
- Railway containers have ephemeral disk — images lost on redeploy

## Decision: Cloudflare R2

### Why R2 over AWS S3
- **No egress fees** — R2 charges zero for data transfer out
- **S3-compatible API** — works with AWS SDK, no new client library to learn
- **Free tier** — 10GB storage, 1M Class A ops, 10M Class B ops/month
- **CDN integration** — R2 has built-in CDN for fast image delivery
- **Simpler than S3** — fewer IAM concepts, just API tokens

### Architecture Decision
- **Replace, not dual** — swap FileStorageService backend entirely. No dual local+cloud.
- **Full URLs in DB** — imageUrls JSONB stores full R2 public URLs (not relative paths)
- **No migration script** — existing items on Railway have ephemeral disk anyway (images already lost). Local dev images will need re-upload.
- **Presigned URLs not needed** — upload goes through backend (multipart form), backend uploads to R2. Presigned direct upload is a future optimization.

### Dependencies
- `software.amazon.awssdk:s3` — AWS SDK v2 S3 client (works with R2)
- No Cloudflare-specific SDK needed

### Configuration
- R2_ENDPOINT — account-specific R2 endpoint URL
- R2_ACCESS_KEY_ID — R2 API token key
- R2_SECRET_ACCESS_KEY — R2 API token secret
- R2_BUCKET — bucket name (e.g., shareshelf-images)
- R2_PUBLIC_URL — public CDN URL for serving images

### Risk: Image URL Migration
- Existing local dev images stored as `/uploads/items/...` will not resolve after migration
- Mitigation: acceptable for dev. Production images on Railway are already lost (ephemeral disk).
- Future: write a migration script if needed to re-upload from a backup.

## Alternatives Considered

| Option | Verdict | Reason |
|--------|---------|--------|
| AWS S3 | Rejected | Egress fees add up; R2 is S3-compatible without cost |
| Railway Volumes | Rejected | Not designed for blob storage; no CDN; manual management |
| Keep local + persistent volume | Rejected | Railway volumes are an add-on; still no CDN |
| Presigned URL direct upload | Deferred | Better architecture but more complex; backend proxy works for MVP |
