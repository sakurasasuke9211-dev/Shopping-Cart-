# Sports Mart API

Express backend for products, recommendations, cart, orders, and payments.

## Local development

From the monorepo root:

```bash
npm run dev:api
```

API listens on `http://localhost:4000`.

## Deploy to Vercel

This app is deployed as a **separate Vercel project** with root directory `apps/api`.

### Vercel project settings

| Setting | Value |
|---------|-------|
| Root Directory | `apps/api` |
| Framework Preset | Other |
| Install Command | `cd ../.. && npm install` |
| Build Command | *(from `vercel.json`)* |
| Output Directory | *(leave empty — serverless)* |

### Required environment variables

| Variable | Example | Purpose |
|----------|---------|---------|
| `WEB_ORIGIN` | `https://your-frontend.vercel.app` | CORS allowed origin(s), comma-separated |
| `INVENTORY_PREFER_SHEETS` | `true` | Load catalog from Google Sheets |
| `GOOGLE_SHEETS_SPREADSHEET_ID` | `1XD6e2f_...` | Product catalog spreadsheet |
| `MOCK_PAYMENTS` | `true` | Mock payment flow |

Optional: `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` for private sheets.

### How it works

1. `vercel.json` rewrites all routes to the serverless function at `api/index.ts`.
2. The function imports the compiled Express app from `dist/app.js`.
3. On first `/api/*` request, inventory loads from Google Sheets (with bundled CSV fallback).
4. CORS is handled by Express using `WEB_ORIGIN`.

### Verify deployment

```bash
curl https://your-api.vercel.app/api/health
```

Expect `"status": "ok"` and a non-zero `productCount`.

See [architecture/phase-09-deployment](../../architecture/phase-09-deployment/README.md) for the full deployment guide.
