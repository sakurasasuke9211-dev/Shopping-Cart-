# Sports Shopping App

Personalized sports equipment recommendations for users aged **45+**.

## Docs

- [Problem statement](./docs/ProblemStatement.md)
- [Demo script](./docs/DEMO.md)
- [Architecture overview](./architecture/README.md)
- [Implementation checklist](./architecture/IMPLEMENTATION_CHECKLIST.md)

## Monorepo layout

```text
apps/web          React + Vite frontend
apps/api          Express + TypeScript API
packages/shared   Shared types and constants
data/             Local inventory fallback files
database/         Canonical CSV catalog (fallback)
architecture/     Phase-wise architecture
docs/             Product requirements + demo notes
design/           Stitch screen exports
```

## Prerequisites

- Node.js 20+
- npm 10+

## Setup

```bash
cp .env.example .env
npm install
```

On Windows PowerShell, if `npm` is blocked by execution policy, use `npm.cmd` instead.

## Environment

| Variable | Default | Purpose |
|----------|---------|---------|
| `PORT` | `4000` | API port |
| `WEB_ORIGIN` | `http://localhost:5173` | CORS origin for the web app |
| `INVENTORY_PREFER_SHEETS` | `true` | Try Google Sheets first |
| `INVENTORY_FALLBACK_PATH` | `database/sports_shopping_cart_product_catalog.csv` | First local fallback file |
| `INVENTORY_DATA_DIR` | `data` | Also checks `inventory.json` / `.csv` here |
| `GOOGLE_SHEETS_SPREADSHEET_ID` | demo sheet id | Public CSV export when no service account |
| `MOCK_PAYMENTS` | `true` | Enable mock payment create/confirm |
| `VITE_SUPABASE_URL` | — | Supabase project URL (web auth) |
| `VITE_SUPABASE_ANON_KEY` | — | Supabase anon/public key (web only; never service role) |

Local Vite proxies `/api` → `http://localhost:4000`, so the web app does not need a separate `VITE_API_URL` for local demos.

### Supabase Auth (optional for guest-only demos)

1. Create a Supabase project and enable Email auth with confirm email.
2. Set Site URL to `http://localhost:5173` and allow redirects for `/auth/callback` and `/reset-password`.
3. Run [`supabase/migrations/001_auth_profiles_preferences.sql`](./supabase/migrations/001_auth_profiles_preferences.sql) in the SQL editor.
4. Copy URL + anon key into `.env` as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, then restart the web app.

Full steps: [architecture/phase-08-supabase-auth/AUTH_IMPLEMENTATION_CHECKLIST.md](./architecture/phase-08-supabase-auth/AUTH_IMPLEMENTATION_CHECKLIST.md).

To force CSV/JSON fallback (Sheets offline demo):

```bash
# in .env
INVENTORY_PREFER_SHEETS=false
```

## Develop

```bash
# both (API :4000 + Web :5173)
npm run dev

# or separately
npm run dev:api
npm run dev:web
```

- Web: http://localhost:5173/
- API health: http://localhost:4000/api/health

## Demo script (MVP)

1. Open http://localhost:5173/ → **Continue as Guest**.
2. Questionnaire:
   - Age: **55+**
   - Primary sport: **Walking**
   - Product type: **Footwear**
   - Experience: **Beginner**
   - Budget: **Medium** ($40–$100)
   - Benefits: **Comfort-focused** and/or **Low impact**
3. Confirm primary cards show explanations (and usually Comfort Walk Pro / similar).
4. Open a product → **Add to cart** → Cart → **Proceed to checkout**.
5. Enter any guest name/email/address → **Place order & pay**.
6. On Payment → **Pay now** (mock) → confirmation page with order ID.
7. Optional refine: reopen questionnaire, switch primary sport to **Hiking**, and compare ranking.

Full notes: [docs/DEMO.md](./docs/DEMO.md)

## Verify (API smoke)

With the API running:

```bash
npm run smoke:phase7
```

Also available: `npm run smoke:phase3`, `npm run smoke:phase4`.

## Inventory

Primary source: [Google Sheet](https://docs.google.com/spreadsheets/d/1XD6e2f_IQ1hvBn7Mq92H0AtRdcSX7_A67x0mDG6GyBk/edit?usp=drive_link)  
Local fallback: `database/sports_shopping_cart_product_catalog.csv` (mirrored as `data/inventory.json` and `data/inventory.csv`)

```bash
curl -X POST http://localhost:4000/api/admin/inventory/reload
```

## Known limitations

- Payments are **mock only** (no real card processing).
- Cart, orders, and stock decrements are **in-memory** — restarting the API resets them; inventory files are not rewritten.
- Login / Sign up are UI stubs; full purchase works as **guest**.
- Google Sheets may be unavailable; the app falls back to local CSV/JSON automatically.
- Excel fallback path is supported in code, but no `data/inventory.xlsx` seed is shipped.
- Product images depend on URLs in the catalog; missing images fail gracefully.
- Tax/shipping are not calculated (shipping shown as “at checkout”).

## Workspace packages

| Package | Name |
|---------|------|
| Shared | `@sports-shop/shared` |
| API | `@sports-shop/api` |
| Web | `@sports-shop/web` |

Frontend talks to the API over HTTP only; both apps import types from `@sports-shop/shared`.
