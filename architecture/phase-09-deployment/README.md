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


| Project         | Root Directory | Framework | Build Command                                                          | Output         |
| --------------- | -------------- | --------- | ---------------------------------------------------------------------- | -------------- |
| sports-mart-web | `apps/web`     | Vite      | `cd ../.. && npm run build:shared && cd apps/web && npx vite build`    | `dist`         |
| sports-mart-api | `apps/api`     | Other     | *(see* `apps/api/vercel.json`*)* — shared build + inventory copy + tsc | *(serverless)* |


Both use `cd ../.. && npm install` as the install command (monorepo root).

## Recommended deployment order

You do **not** need the frontend deployed before the backend. Use this order:

### Step A — Backend only (frontend not on Vercel yet)

1. Deploy **backend** (`apps/api`) to Vercel.
2. Set backend env vars with **interim** CORS:
  - `WEB_ORIGIN` = `http://localhost:5173` *(local dev against prod API)*
3. Verify: open `https://shopping-cart-api-steel.vercel.app/api/health` — should return JSON with `"status": "ok"`.
4. Optional: point local `.env` at the prod API:
  - `VITE_API_BASE_URL=https://shopping-cart-api-steel.vercel.app`
  - Run `npm run dev:web` locally to test against the deployed backend.



### Step B — Frontend

**Live URLs**

| App | URL |
|-----|-----|
| Backend API | https://shopping-cart-api-steel.vercel.app |
| Frontend Web | https://shopping-cart-web-two.vercel.app |

1. Create a **second** Vercel project for `apps/web`.
2. Set frontend env vars:
  - `VITE_API_BASE_URL` = `https://shopping-cart-api-steel.vercel.app`
  - `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. Deploy — production URL: `https://shopping-cart-web-two.vercel.app`
4. **Update backend** `WEB_ORIGIN` (Vercel → API project → Environment Variables):
  - `http://localhost:5173,https://shopping-cart-web-two.vercel.app`
5. Redeploy the backend (or trigger redeploy from Vercel dashboard).
6. Update **Supabase** Auth → Site URL and Redirect URLs to the frontend URL (see below).

## Environment Variables



### Frontend (sports-mart-web) — Vercel Dashboard


| Variable                 | Value                                | Notes                         |
| ------------------------ | ------------------------------------ | ----------------------------- |
| `VITE_API_BASE_URL`      | `https://shopping-cart-api-steel.vercel.app` | Backend Vercel deployment URL |
| `VITE_SUPABASE_URL`      | `https://<project>.supabase.co`              | Supabase project URL          |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...`                                     | Supabase anon/public key      |




### Backend (sports-mart-api) — Vercel Dashboard


| Variable                             | Value                                                                              | Notes                           |
| ------------------------------------ | ---------------------------------------------------------------------------------- | ------------------------------- |
| `WEB_ORIGIN`                         | `http://localhost:5173,https://shopping-cart-web-two.vercel.app`                  | CORS allowed origins            |
| `INVENTORY_PREFER_SHEETS`            | `true`                                                                             | Use Google Sheets in production |
| `GOOGLE_SHEETS_SPREADSHEET_ID`       | `1XD6e2f_...`                                                                      | Product catalog sheet ID        |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL`       | (optional)                                                                         | For private sheets              |
| `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | (optional)                                                                         | For private sheets              |
| `MOCK_PAYMENTS`                      | `true`                                                                             | Keep mock payments for now      |




### Supabase Dashboard

*(Can wait until frontend is deployed on Vercel.)*

1. **Auth → URL Configuration → Site URL**: `https://shopping-cart-web-two.vercel.app`
2. **Auth → URL Configuration → Redirect URLs**: Add:
  - `http://localhost:5173/**` *(local dev — keep)*
  - `https://shopping-cart-web-two.vercel.app/**`
  - `https://shopping-cart-web-two.vercel.app/auth/callback`
  - `https://shopping-cart-web-two.vercel.app/reset-password`



## Key Design Decisions

1. **Two Vercel projects**: Frontend is a static SPA; backend runs as a Vercel Serverless Function. Deployed from the same repo with different root directories.
2. **VITE_API_BASE_URL**: In development, Vite's proxy forwards `/api/`* to `localhost:4000`. In production, the React client prepends the full API URL using this env var.
3. **Inventory on cold start**: The serverless function loads inventory from Google Sheets on the first request. Subsequent requests within the same function instance reuse the cached data. No local CSV fallback is available in serverless.
4. **In-memory state limitation**: Cart, orders, and payments are stored in-memory on the Express backend. In serverless, each function invocation may run in a different instance. For a production-ready app, these should migrate to Supabase/PostgreSQL. Current deployment works for demo/portfolio purposes.
5. **CORS**: The backend accepts the frontend's Vercel URL via `WEB_ORIGIN`. Multiple origins can be comma-separated.

---



## Deployment Implementation Checklist



### 1. Code Changes (Already Done)

- [x] Extract Express app into `apps/api/src/app.ts` (separating `createApp()` from `listen()`)
- [x] Create serverless entry point `apps/api/api/index.ts` (imports compiled `dist/app.js`)
- [x] Add `apps/api/vercel.json` with rewrite rules and function config (1 GB RAM, 30s timeout)
- [x] Add `apps/api/scripts/prepare-vercel.mjs` to bundle inventory CSV fallback at build time
- [x] Fix `config.ts` paths for Vercel (`apiRoot` vs monorepo `repoRoot`)
- [x] Add inventory-loading middleware on all `/api/*` routes (cold-start safe)
- [x] Disable inventory refresh timer on Vercel (`process.env.VERCEL`)
- [x] Add `build:vercel` script and `apps/api/README.md` deployment guide



### 2. Supabase Setup (You — Dashboard)

- [x] Create Supabase project (if not already done)
- [x] Run migration: `supabase/migrations/001_auth_profiles_preferences.sql` in SQL Editor
- [x] Enable email auth in Auth → Providers
- [x] Set Site URL to production frontend URL
- [x] Add redirect URLs (see above)
- [x] Copy project URL and anon key



### 3. Vercel — Backend Deployment (You — Dashboard)

- [x] Create new Vercel project → Import Git repo
- [x] Set **Root Directory** to `apps/api`
- [x] Set **Framework Preset** to "Other"
- [x] Set **Build Command**: *(auto from* `vercel.json`*)* — builds shared, copies inventory CSV, compiles TypeScript
- [x] Set **Output Directory**: *(leave empty)*
- [x] Set **Install Command**: `cd ../.. && npm install`
- [x] Add environment variables (see table above)
- [x] Deploy and note the URL (e.g. `https://sports-mart-api.vercel.app`)



### 4. Vercel — Frontend Deployment (You — Dashboard)

- [x] Create new Vercel project → Import same Git repo
- [x] Set **Root Directory** to `apps/web`
- [x] Set **Framework Preset** to "Vite"
- [x] Set **Build Command**: `cd ../.. && npm run build:shared && cd apps/web && npx vite build`
- [x] Set **Output Directory**: `dist`
- [x] Set **Install Command**: `cd ../.. && npm install`
- [x] Add environment variables (see table above)
- [x] Set `VITE_API_BASE_URL` to the backend Vercel URL from step 3
- [x] Deploy



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