# Supabase Auth — Implementation Checklist

Track every step for Sports Mart email/password authentication, guest merge, and RLS-backed profile/preferences storage.

**Related code:** `apps/web/src/lib/supabase.ts`, `apps/web/src/auth/`, `supabase/migrations/`  
**Env:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (see root `.env.example`)

---

## Progress overview

| Area | Status |
|------|--------|
| 01 Supabase project & env | ☐ You (dashboard + `.env`) |
| 02 Database schema + RLS | ☑ SQL ready — run in Supabase |
| 03 Web Supabase client | ☑ |
| 04 Auth Context & session | ☑ |
| 05 Auth UI pages | ☑ |
| 06 Protected routes | ☑ |
| 07 Guest localStorage | ☑ |
| 08 Post-login data transfer | ☑ |
| 09 App wiring (header / routes) | ☑ |
| 10 Verification & docs | ☐ After env + migration |

---

## 01 — Supabase project & environment

- [ ] Create a Supabase project
- [ ] Enable **Email** provider (Authentication → Providers)
- [ ] Enable **Confirm email** (email verification) for sign-up
- [ ] Configure Site URL: `http://localhost:5173`
- [ ] Configure Redirect URLs: `http://localhost:5173/**`, `http://localhost:5173/reset-password`, `http://localhost:5173/auth/callback`
- [ ] Copy Project URL + `anon` public key into `.env` / `.env.local` for the web app:
  - `VITE_SUPABASE_URL=`
  - `VITE_SUPABASE_ANON_KEY=`
- [ ] Never commit service-role keys to the frontend

---

## 02 — Database schema + Row-Level Security

Run migration: [`supabase/migrations/001_auth_profiles_preferences.sql`](../../supabase/migrations/001_auth_profiles_preferences.sql)

- [x] Create `public.profiles` (`id` → `auth.users.id`, display name, email, timestamps)
- [x] Create `public.user_preferences` (`user_id` → `auth.users.id`, questionnaire JSON fields)
- [x] Create `public.cart_items` (`user_id` → `auth.users.id`, product lines for logged-in merge)
- [x] Trigger: on `auth.users` insert → create `profiles` row
- [x] Enable RLS on `profiles`, `user_preferences`, `cart_items`
- [x] Policies: `SELECT` / `INSERT` / `UPDATE` / `DELETE` only where `auth.uid() = user_id` (or `id` for profiles)
- [ ] Verify as two test users that cross-user reads fail *(after you run the migration)*

---

## 03 — Reusable Supabase client (React)

- [x] Install `@supabase/supabase-js` in `apps/web`
- [x] Create `apps/web/src/lib/supabase.ts` with `createClient(url, anonKey)`
- [x] Use browser storage for session persistence (default Supabase auth storage)
- [x] Export typed helpers for auth + table access
- [x] Guard missing env with a clear console/runtime message (auth pages show setup help)

---

## 04 — Auth Context & secure session

- [x] Create `AuthProvider` + `useAuth()`
- [x] On mount: `supabase.auth.getSession()` then subscribe to `onAuthStateChange`
- [x] Expose: `user`, `session`, `loading`, `signUp`, `signIn`, `signOut`, `resetPasswordForEmail`, `updatePassword`
- [x] Keep session in memory from Supabase (JWT refresh handled by client)
- [x] Sync app `authMode`: `registered` when `user` present, else preserve guest
- [x] Wrap app in `AuthProvider` (outside or around `AppStateProvider` as needed)

---

## 05 — Auth UI pages (45+ accessible)

- [x] **Sign up** — email, password, full name; call `signUp`; show “check your email” when confirmation required
- [x] **Log in** — email + password; call `signInWithPassword`
- [x] **Log out** — header control when signed in
- [x] **Forgot password** — request reset email (`resetPasswordForEmail`)
- [x] **Reset password** — `/reset-password` after recovery link; `updateUser({ password })`
- [x] **Email verification / callback** — `/auth/callback` handles redirect session
- [x] Large labels, ≥48px controls, plain-language errors (`role="alert"`)
- [x] Links between login ↔ signup ↔ forgot password ↔ continue as guest

---

## 06 — Protected routes (React Router)

- [x] Create `ProtectedRoute` that waits for auth `loading`, then redirects unauthenticated users to `/login` with `state.from`
- [x] Protect account-style routes (e.g. `/account`)
- [x] Allow guest access to browse, questionnaire, cart, recommendations
- [x] After login, redirect to `from` or `/browse` / questionnaire as appropriate

---

## 07 — Guest data in localStorage

- [x] Questionnaire preferences → `localStorage` key `sports-mart.preferences` (guest)
- [x] Guest cart lines → `localStorage` key `sports-mart.guestCart`
- [x] Keep Express `sessionId` cart working for checkout demo; mirror writes into guest cart storage
- [x] Document keys and shapes in this checklist / README snippet

| Key | Shape |
|-----|--------|
| `sports-mart.preferences` | `UserPreferences` JSON |
| `sports-mart.guestCart` | `{ productId, quantity, size?, color? }[]` |
| `sports-mart.sessionId` | existing guest commerce session |

---

## 08 — Transfer guest data after login

- [x] On successful `SIGNED_IN` / sign-up session: run `transferGuestDataToDatabase(user)`
- [x] Upsert `profiles` (name/email from metadata)
- [x] Upsert `user_preferences` from localStorage preferences (if present)
- [x] Upsert `cart_items` from localStorage guest cart (if present)
- [x] Re-hydrate Express cart via absolute quantity sync (update existing lines; add only if missing — never stack)
- [x] Clear or retain guest keys after successful merge (clear guest cart after merge; keep prefs synced)
- [x] Idempotent merge (per-user in-flight mutex; safe if login fires twice)

---

## 09 — App wiring

- [x] Routes: `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/auth/callback`, `/account`
- [x] Header: Sign In vs account email + Log out
- [x] Opening / login CTAs use real auth or guest path
- [x] Update `.env.example` and root README Auth section

---

## 10 — Verification

- [ ] Sign up → verification email → confirm → can log in
- [ ] Wrong password shows clear error
- [ ] Forgot password → email → reset password → log in with new password
- [ ] Guest completes questionnaire + adds cart → login → rows appear in `user_preferences` / `cart_items` for that user only
- [ ] Second user cannot read first user’s rows (RLS)
- [ ] Log out clears session; protected `/account` redirects to login
- [ ] `npm run typecheck -w @sports-shop/web` passes

---

## Out of scope (this checklist)

- OAuth (Google/Apple) social login
- Phone OTP auth
- Replacing Express inventory/checkout with Supabase entirely
- Admin roles / service-role server APIs

---

## Exit criteria

- [ ] Checklist sections 01–10 complete or explicitly deferred with reason
- [ ] Demo path: guest quiz → add to cart → sign up/login → data visible under that user in Supabase
- [ ] Architecture docs reference this checklist
