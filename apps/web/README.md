# Sports Mart Web

React + Vite frontend for the Sports Shopping App.

## Local development

From the monorepo root:

```bash
npm run dev:web
```

Opens at `http://localhost:5173`. API calls use Vite's proxy to `localhost:4000` unless `VITE_API_BASE_URL` is set.

## Deploy to Vercel

Deploy **after** the backend API is live (or set `VITE_API_BASE_URL` to your backend URL).

### Vercel project settings

| Setting | Value |
|---------|-------|
| Root Directory | `apps/web` |
| Framework Preset | Vite |
| Install Command | `cd ../.. && npm install` |
| Build / Output | *(from `vercel.json`)* — output `dist` |

### Required environment variables

| Variable | Value |
|----------|-------|
| `VITE_API_BASE_URL` | `https://shopping-cart-api-steel.vercel.app` |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key |

### After first deploy

1. Copy your frontend URL from the Vercel dashboard.
2. Add it to the **backend** project env: `WEB_ORIGIN=http://localhost:5173,https://your-frontend.vercel.app`
3. Redeploy the backend.
4. In Supabase → Auth → URL Configuration, set Site URL and redirect URLs to the frontend URL.

See [architecture/phase-09-deployment](../../architecture/phase-09-deployment/README.md) for the full guide.
