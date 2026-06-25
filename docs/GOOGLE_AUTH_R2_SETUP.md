# Google Sign-In & Cloudflare R2 Setup Guide

This guide walks through configuring Google OAuth2 Sign-In and Cloudflare R2 file storage for ShareShelf.

---

## Part 1: Google Sign-In Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** → **New Project**
3. Name it `ShareShelf` and click **Create**

### Step 2: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** user type → Click **Create**
3. Fill in:
   - **App name**: `ShareShelf`
   - **User support email**: Your email
   - **Developer contact email**: Your email
4. Click **Save and Continue**
5. **Scopes**: Click **Add or Remove Scopes** → select:
   - `openid`
   - `profile`
   - `email`
6. Click **Save and Continue**
7. **Test users**: Add your Google email for testing
8. Click **Save and Continue**

### Step 3: Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Select **Web application**
4. Name: `ShareShelf`
5. **Authorized redirect URIs** — Add these:
   ```
   http://localhost:8080/login/oauth2/code/google
   https://your-backend-url.railway.app/login/oauth2/code/google
   ```
6. Click **Create**
7. Copy the **Client ID** and **Client Secret**

### Step 4: Set Environment Variables

**For local development**, set in your shell or `.env`:
```bash
export GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
export GOOGLE_CLIENT_SECRET=your-client-secret
```

**For Railway deployment**, add in Railway dashboard → Variables:
```
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

---

## Part 2: Cloudflare R2 Setup

### Step 1: Create Cloudflare Account

1. Go to [Cloudflare](https://dash.cloudflare.com/)
2. Sign up or log in

### Step 2: Create R2 Bucket

1. Go to **R2 Object Storage** in the sidebar
2. Click **Create bucket**
3. Bucket name: `shareshelf-images`
4. Location: **Automatic** (or choose nearest region)
5. Click **Create bucket**

### Step 3: Enable Public Access

1. Click on your bucket → **Settings**
2. Under **Public Access**, click **Allow Access**
3. Note the public URL (e.g., `https://shareshelf-images.xxxxx.r2.dev`)

### Step 4: Create R2 API Token

1. Go to **R2** → **Manage R2 API Tokens**
2. Click **Create API token**
3. Token name: `ShareShelf`
4. Permissions: **Object Read & Write**
5. Specify bucket: Select `shareshelf-images`
6. Click **Create API Token**
7. Copy the **Access Key ID** and **Secret Access Key**

### Step 5: Get Your Account ID

1. In Cloudflare dashboard, go to **R2**
2. Look at the URL: `https://dash.cloudflare.com/xxxxx/r2`
3. The `xxxxx` is your Account ID

### Step 6: Set Environment Variables

**For local development:**
```bash
export R2_ENDPOINT=https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com
export R2_ACCESS_KEY_ID=your-access-key-id
export R2_SECRET_ACCESS_KEY=your-secret-access-key
export R2_BUCKET=shareshelf-images
export R2_PUBLIC_URL=https://shareshelf-images.YOUR_ACCOUNT_ID.r2.cloudflarestorage.com
```

**For Railway deployment**, add these in Railway dashboard → Variables.

---

## Summary of Required Environment Variables

| Variable | Where to Get |
|----------|--------------|
| `GOOGLE_CLIENT_ID` | Google Cloud Console → Credentials |
| `GOOGLE_CLIENT_SECRET` | Google Cloud Console → Credentials |
| `R2_ENDPOINT` | `https://{ACCOUNT_ID}.r2.cloudflarestorage.com` |
| `R2_ACCESS_KEY_ID` | Cloudflare R2 → API Tokens |
| `R2_SECRET_ACCESS_KEY` | Cloudflare R2 → API Tokens |
| `R2_BUCKET` | Your bucket name (e.g., `shareshelf-images`) |
| `R2_PUBLIC_URL` | Your bucket's public URL |

After setting these, restart your backend and both features will work.
