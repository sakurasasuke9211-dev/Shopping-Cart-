# Phase 08 — Supabase Auth

Email/password authentication for Sports Mart with guest → account data merge.

## Goals

- Sign up, login, logout, email verification, forgot/reset password via Supabase Auth
- Secure browser session via Supabase JS client
- `profiles`, `user_preferences`, `cart_items` with RLS
- Guest preferences + cart in `localStorage`, transferred after login

## Implementation list

See **[AUTH_IMPLEMENTATION_CHECKLIST.md](./AUTH_IMPLEMENTATION_CHECKLIST.md)** for every step.

## Key paths

| Path | Role |
|------|------|
| `apps/web/src/lib/supabase.ts` | Reusable client |
| `apps/web/src/auth/` | Context, protected route, guest transfer |
| `supabase/migrations/` | SQL schema + RLS |
| `/login` `/signup` `/forgot-password` `/reset-password` `/auth/callback` `/account` | Auth UI |

## Guest cart merge (sign-in / sign-up)

- Guest quiz prefs + cart lines live in `localStorage` (`sports-mart.preferences`, `sports-mart.guestCart`).
- On auth, `transferGuestDataToDatabase` upserts Supabase `profiles` / `user_preferences` / `cart_items`.
- **Quantity rule:** Express session cart is synced to the **absolute** guest quantity per line (update if present, add once if missing). Concurrent auth events share a per-user mutex so qty does not stack (e.g. 1 → 3).
- Guest cart key is cleared after a successful merge.

## Depends on

Phase 05 (guest quiz / cart UX), Phase 06 (commerce APIs for cart rehydrate).
