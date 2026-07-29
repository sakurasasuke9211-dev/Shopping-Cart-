# Phase 09 — Deployment (Vercel + Supabase)

## Deployment Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         PRODUCTION ARCHITECTURE                        │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   ┌──────────────┐        HTTPS         ┌──────────────────────┐       │
│   │   Browser     │ ──────────────────► │  Vercel (Frontend)    │       │
│   │   (React SPA) │ ◄────────────────── │  apps/web → dist/    │       │
│   │               │   Static assets     │  Framework: Vite     │       │
│   └──────┬───────┘                      │  SPA rewrites →      │       │
│          │                              │    /index.html       │       │
│          │ VITE_API_BASE_URL            └──────────────────────┘       │
│          │                                                             │
│          │  /api/*                                                     │
│          ▼                                                             │
│   ┌──────────────────────┐                                             │
│   │  Vercel (Backend)     │   Serverless Functions                     │
│   │  apps/api             │   api/index.ts → Express app              │
│   │  Routes: /api/*       │   Cold start: loads inventory             │
│   │  Rewrite: /* → /api   │   from Google Sheets on first request     │
│   └──────┬───────────────┘                                             │
│          │                                                             │
│          │  googleapis                                                 │
│          ▼                                                             │
│   ┌──────────────────────┐                                             │
│   │  Google Sheets        │   Product catalog / inventory              │
│   │  (Data source)        │   Public or service-account access        │
│   └──────────────────────┘                                             │
│                                                                        │
│   ┌──────────────────────┐                                             │
│   │  Supabase             │   Auth (email/password)                    │
│   │  (Database + Auth)    │   PostgreSQL: profiles, preferences,      │
│   │                       │     cart_items (RLS enabled)               │
│   │  Direct from browser  │   Client: @supabase/supabase-js           │
│   └──────────────────────┘                                             │
│                                                                        │
└──────────────────────────────────────────────────────────────────────────┘
```

## Vercel Project Setup

The monorepo deploys as **two separate Vercel projects** (same Git repo, different root directories):

| Project        | Root Directory | Framework | Build Command                                                 | Output   |
|----------------|----------------|-----------|---------------------------------------------------------------|----------|
| sports-mart-web | `apps/web`    | Vite      | `cd ../.. && npm run build:shared && cd apps/web && npx vite build` | `dist`   |
| sports-mart-api | `apps/api`    | Other     | `cd ../.. && npm run build:shared && cd apps/api && npx tsc -p tsconfig.json` | `.`      |

Both use `cd ../.. && npm install` as the install command (monorepo root).

## Environment Variables

### Frontend (sports-mart-web) — Vercel Dashboard

| Variable               | Value                                      | Notes                              |
|------------------------|--------------------------------------------|------------------------------------|
| `VITE_API_BASE_URL`    | `https://sports-mart-api.vercel.app`       | Backend Vercel deployment URL      |
| `VITE_SUPABASE_URL`    | `https://<project>.supabase.co`            | Supabase project URL               |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...`                                 | Supabase anon/public key           |

### Backend (sports-mart-api) — Vercel Dashboard

| Variable                            | Value                                    | Notes                              |
|-------------------------------------|------------------------------------------|------------------------------------|
| `WEB_ORIGIN`                        | `https://sports-mart-web.vercel.app`     | CORS: frontend URL (comma-sep OK)  |
| `INVENTORY_PREFER_SHEETS`           | `true`                                   | Use Google Sheets in production    |
| `GOOGLE_SHEETS_SPREADSHEET_ID`      | `1XD6e2f_...`                            | Product catalog sheet ID           |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL`      | (optional)                               | For private sheets                 |
| `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`| (optional)                               | For private sheets                 |
| `MOCK_PAYMENTS`                     | `true`                                   | Keep mock payments for now         |

### Supabase Dashboard

1. **Auth → URL Configuration → Site URL**: Set to `https://sports-mart-web.vercel.app`
2. **Auth → URL Configuration → Redirect URLs**: Add:
   - `https://sports-mart-web.vercel.app/**`
   - `https://sports-mart-web.vercel.app/auth/callback`
   - `https://sports-mart-web.vercel.app/reset-password`
   - `http://localhost:5173/**` (keep for local dev)

## Key Design Decisions

1. **Two Vercel projects**: Frontend is a static SPA; backend runs as a Vercel Serverless Function. Deployed from the same repo with different root directories.

2. **VITE_API_BASE_URL**: In development, Vite's proxy forwards `/api/*` to `localhost:4000`. In production, the React client prepends the full API URL using this env var.

3. **Inventory on cold start**: The serverless function loads inventory from Google Sheets on the first request. Subsequent requests within the same function instance reuse the cached data. No local CSV fallback is available in serverless.

4. **In-memory state limitation**: Cart, orders, and payments are stored in-memory on the Express backend. In serverless, each function invocation may run in a different instance. For a production-ready app, these should migrate to Supabase/PostgreSQL. Current deployment works for demo/portfolio purposes.

5. **CORS**: The backend accepts the frontend's Vercel URL via `WEB_ORIGIN`. Multiple origins can be comma-separated.

---

## Deployment Implementation Checklist

### 1. Code Changes (Already Done)

- [x] Extract Express app into `apps/api/src/app.ts` (separating `createApp()` from `listen()`)
- [x] Create serverless entry point `apps/api/api/index.ts`
- [x] Add `apps/api/vercel.json` with rewrite rules
- [x] Add `apps/web/vercel.json` with SPA fallback rewrite
- [x] Add `VITE_API_BASE_URL` support in `apps/web/src/api/client.ts`
- [x] Update `apps/web/src/vite-env.d.ts` with new env var type
- [x] Update `.env.example` with `VITE_API_BASE_URL` docs
- [x] Support comma-separated `WEB_ORIGIN` for multi-origin CORS
- [x] Lazy inventory loading in `app.ts` (load on first request, not at import time)

### 2. Supabase Setup (You — Dashboard)

- [ ] Create Supabase project (if not already done)
- [ ] Run migration: `supabase/migrations/001_auth_profiles_preferences.sql` in SQL Editor
- [ ] Enable email auth in Auth → Providers
- [ ] Set Site URL to production frontend URL
- [ ] Add redirect URLs (see above)
- [ ] Copy project URL and anon key

### 3. Vercel — Backend Deployment (You — Dashboard)

- [ ] Create new Vercel project → Import Git repo
- [ ] Set **Root Directory** to `apps/api`
- [ ] Set **Framework Preset** to "Other"
- [ ] Set **Build Command**: `cd ../.. && npm run build:shared && cd apps/api && npx tsc -p tsconfig.json`
- [ ] Set **Output Directory**: `.`
- [ ] Set **Install Command**: `cd ../.. && npm install`
- [ ] Add environment variables (see table above)
- [ ] Deploy and note the URL (e.g. `https://sports-mart-api.vercel.app`)

### 4. Vercel — Frontend Deployment (You — Dashboard)

- [ ] Create new Vercel project → Import same Git repo
- [ ] Set **Root Directory** to `apps/web`
- [ ] Set **Framework Preset** to "Vite"
- [ ] Set **Build Command**: `cd ../.. && npm run build:shared && cd apps/web && npx vite build`
- [ ] Set **Output Directory**: `dist`
- [ ] Set **Install Command**: `cd ../.. && npm install`
- [ ] Add environment variables (see table above)
- [ ] Set `VITE_API_BASE_URL` to the backend Vercel URL from step 3
- [ ] Deploy

### 5. Post-Deployment Verification

- [ ] Visit backend `/api/health` — should return `200` with inventory loaded
- [ ] Visit frontend URL — app loads, products display
- [ ] Test sign-up flow (email verification)
- [ ] Test login / logout
- [ ] Test forgot password flow
- [ ] Verify guest cart → login transfer works
- [ ] Test product recommendations
- [ ] Test checkout flow

### 6. Optional Improvements (Future)

- [ ] Migrate cart/orders/payments from in-memory to Supabase PostgreSQL
- [ ] Add Vercel Analytics
- [ ] Set up custom domain
- [ ] Add CI/CD with GitHub Actions for automatic deployments
- [ ] Add preview deployments for pull requests
