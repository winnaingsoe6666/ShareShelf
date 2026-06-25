---
phase: 08-photo-upload-r2
plan: 02
status: complete
completed: "2026-06-25"
---

# Summary: Frontend R2 Integration

## What Was Built

Updated the frontend Next.js configuration to allow images from Cloudflare R2 domains, and added R2 configuration for the dev environment. No frontend logic changes were needed — the existing components already render full URLs directly.

## Key Files

| File | Action | Purpose |
|------|--------|---------|
| `frontend/next.config.ts` | Modified | Added `*.r2.cloudflarestorage.com` and `**.r2.dev` to `images.remotePatterns` |
| `backend/src/main/resources/application-dev.yml` | Modified | Added `app.r2.*` configuration with env var override support |

## Verification

- `grep "r2" frontend/next.config.ts` — R2 domains in remotePatterns
- `grep "r2" backend/src/main/resources/application-dev.yml` — dev R2 config present
- No `/uploads/` path manipulation in frontend components
- `ItemCard`, item detail, and `ImageUpload` components render URLs directly
- Backend compiles successfully

## Technical Notes

- Frontend uses `<img>` tags (not Next.js `<Image>` component) for item images, so remotePatterns is a safety net for future Image component usage
- The homepage hero image (`/uploads/sharing_tool.jpg`) is a static local asset, not an R2-uploaded item image — no change needed
- Frontend API upload contract (POST /items/{id}/images with FormData) is unchanged
- R2 public URLs are absolute (https://...) — no path prepending needed in frontend

## Requirements Covered

- R2-02: Frontend R2 integration
