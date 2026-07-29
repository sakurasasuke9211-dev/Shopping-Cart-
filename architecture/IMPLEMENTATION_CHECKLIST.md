# Phase-Wise Implementation Checklist

Track implementation of every module against `docs/ProblemStatement.md` and this `architecture/` tree.

**How to use:** check items as you complete them. Do not mark a phase done until its **Phase exit** section is complete.

---

## Progress overview


| Phase | Module area           | Status |
| ----- | --------------------- | ------ |
| 01    | Foundation            | ☑      |
| 02    | Inventory & data      | ☑      |
| 03    | Backend API           | ☑      |
| 04    | Recommendation engine | ☑      |
| 05    | Frontend UX           | ☑      |
| 06    | Shopping & checkout   | ☑      |
| 07    | MVP integration       | ☑      |


---

## Phase 01 — Foundation

Architecture: [phase-01-foundation](./phase-01-foundation/)

### Workspace & tooling

- [x] Initialize monorepo (npm/pnpm workspaces or equivalent)
- [x] Create `apps/api`, `apps/web`, `packages/shared`, `data/`
- [x] Add root scripts: `dev`, `build`, `lint` (or documented equivalents)
- [x] Add `.env.example` (API port, Sheets flags, inventory fallback path)
- [x] Add `.gitignore` (node_modules, `.env`, build output)



### Shared package (`packages/shared`)

- [x] `Product` type
- [x] `UserPreferences` type
- [x] `RecommendationResult` / scored item types
- [x] `Cart` / `Order` / `Payment` types (stubs OK)
- [x] Constants: sports, categories, benefits, scoring weights
- [x] Package exports consumable from `web` and `api`



### API shell (`apps/api`)

- [x] TypeScript + Express/Fastify bootstrap
- [x] Config loader from env
- [x] `GET /api/health`
- [x] Error-handler middleware stub
- [x] CORS enabled for local web origin



### Web shell (`apps/web`)

- [x] Vite + React + TypeScript app boots
- [x] Router scaffold (placeholder routes)
- [x] Design tokens CSS (font sizes, contrast, button sizes)
- [x] Base layout / header stub



### Phase exit

- [x] `web` and `api` start locally
- [x] Shared types import from both apps
- [x] Architecture linked from root README (or docs index)
- [x] `.env.example` documents required keys

---



## Phase 02 — Inventory & data

Architecture: [phase-02-inventory-data](./phase-02-inventory-data/)

### Data artifacts

- [x] Seed `data/inventory.json` with multi-sport, 45+ suitable products
- [x] Provide `data/inventory.csv`
- [x] Provide `data/inventory.xlsx` (or document Excel as optional if parser deferred)
- [x] Cover sports, categories, age tags, benefit tags, accessories
- [x] Demo CSV fallback in `database/sports_shopping_cart_product_catalog.csv`



### Schema & normalization

- [x] Map all canonical product fields (id, brand, sport, category, price, stock, etc.)
- [x] Normalize sport / category / age / experience enums
- [x] Parse multi-value fields (`benefits`, `tags`, `images`, `sport`)
- [x] Drop invalid rows (missing id/name/price)
- [x] Drop inactive products from recommendation candidates
- [x] Treat `stockQuantity <= 0` as unavailable for recommendations
- [x] Deduplicate by `productId` with warnings



### Inventory modules

- [x] `fileLoader` — JSON (required)
- [x] `fileLoader` — CSV
- [x] `fileLoader` — Excel
- [x] `sheetsLoader` — Google Sheets read (or feature-flagged stub)
- [x] `normalize` — raw rows → `Product[]`
- [x] `inventoryService` — cache, `getAll`, `getById`, `getRecommendationCandidates`
- [x] Boot-time load + optional reload/TTL
- [x] Log inventory `source` and `productCount`
- [x] Automatic fallback: Sheets fail → local file



### Phase exit

- [x] JSON fallback loads successfully without Sheets
- [x] Candidate set excludes inactive / out-of-stock
- [x] Sample catalog sufficient for demo recommendations

---



## Phase 03 — Backend API

Architecture: [phase-03-backend-api](./phase-03-backend-api/)

### Product module

- [x] `GET /api/products` — list
- [x] Search (`q`)
- [x] Filters (sport, category, age, experience, price)
- [x] Sort (`price`, `rating`, `name`)
- [x] Pagination (`page`, `pageSize`)
- [x] `GET /api/products/:id` — full detail + 404



### Recommendation route (wire later in Phase 04)

- [x] `POST /api/recommendations` route + request validation
- [x] Stub response shape (`primary`, `additional`, `accessories`, `meta`) until engine lands



### Cart module

- [x] Session store keyed by `sessionId`
- [x] `GET /api/cart/:sessionId`
- [x] `POST /api/cart` — add item
- [x] `POST /api/cart/update` — quantity
- [x] `POST /api/cart/remove`
- [x] Server-side price/subtotal from inventory (do not trust client prices)
- [x] Reject / flag out-of-stock adds



### Order module

- [x] `POST /api/orders` — create from cart or explicit items
- [x] `GET /api/orders/:orderId`
- [x] Status: `pending_payment` → later `confirmed`
- [x] Guest customer + shipping fields validated



### Payment module (mock)

- [x] `POST /api/payments/create`
- [x] `POST /api/payments/confirm`
- [x] Confirm sets order to `confirmed` when valid
- [x] Clear errors for unknown/already-paid orders



### Cross-cutting API

- [x] Zod (or equivalent) validation on POST bodies
- [x] Consistent error JSON (`code`, `message`)
- [x] `sessionId` supported for guest flow



### Phase exit

- [x] All Problem Statement §8 endpoints exist
- [x] Cart works for a guest session end-to-end via API client/Postman
- [x] Order + mock payment lifecycle works via API

---



## Phase 04 — Recommendation engine

Architecture: [phase-04-recommendation-engine](./phase-04-recommendation-engine/)

### Hard filters module

- [x] Availability (`active`, `stockQuantity > 0`)
- [x] Sport (primary / additional)
- [x] Product type / category
- [x] Age suitability (`45-55`, `55+`, `all-45+`)
- [x] Experience level
- [x] Budget range
- [x] Empty-result fallback (closest alternatives / relax rules) + `meta.fallbackUsed`



### Scoring module

- [x] Primary sport +40
- [x] Additional sport +15
- [x] Exact age +20 / all-45+ +10
- [x] Exact experience +15
- [x] Product-type +15
- [x] Within budget +10
- [x] Beginner-friendly for beginners +10
- [x] Lightweight for 55+ +8
- [x] Easy-to-use for 55+ +8
- [x] Comfort-focused +6
- [x] Rating ≥ 4 +5
- [x] Featured +3
- [x] Score breakdown object retained for explanations
- [x] Stable tie-breakers (rating → price → id)
- [x] Deterministic: same input → same ranking



### Diversity module

- [x] Cap primary ≤ 6
- [x] Cap additional ≤ 4
- [x] Cap accessories ≤ 3
- [x] Same subcategory ≤ 3
- [x] Same brand ≤ 2
- [x] No duplicate variants
- [x] No repeated `productId` across buckets



### Explanation module

- [x] Template-based explanations (no LLM)
- [x] Sport + beginner template
- [x] 55+ lightweight / easy-to-use template
- [x] Budget + comfort template
- [x] Multi-sport template
- [x] Accessory template
- [x] Fallback / closest-alternative template
- [x] Every returned item includes `explanation`



### Orchestration

- [x] `recommendationService` wires filter → score → diversify → explain
- [x] `POST /api/recommendations` returns full production payload
- [ ] Unit tests for scoring / filters / diversity (recommended)



### Phase exit

- [x] Caps and diversity enforced in API responses
- [x] Explanations present and short
- [x] Fallback path returns clear `meta` messaging

---



## Phase 05 — Frontend UX

Architecture: [phase-05-frontend-ux](./phase-05-frontend-ux/)

### Opening & session

- [x] Opening page
- [x] Continue as Guest
- [x] Login stub (optional for MVP)
- [x] Create/persist `sessionId` (localStorage)



### Questionnaire module

- [x] Overlay with one question per step
- [x] Step: age group (45–55 / 55+)
- [x] Step: primary sport
- [x] Step: additional sports
- [x] Step: product type
- [x] Step: experience level
- [x] Step: budget range
- [x] Step: benefit preferences
- [x] Progress text (“Step X of Y”)
- [x] Large Back / Next controls
- [x] **Skip All** → `/browse` (full catalog)
- [x] **Skip this step** (grey) → next question without answer (keeps other steps)
- [x] Validation per step (Next)
- [x] Submit → `POST /api/recommendations` when any answers exist (soft defaults for skips); `/browse` only if empty or Skip All
- [x] Focus management / keyboard-friendly steps



### Recommendations UI module

- [x] Primary section (≤6 cards)
- [x] Additional section (≤4)
- [x] Accessories section (≤3)
- [x] Card fields: image, name, brand, sport, category, price, rating, benefit, availability, explanation
- [x] View Product button
- [x] Add to Cart button
- [x] “Why these products?” section
- [x] Refine preferences (re-open questionnaire)
- [x] Empty / fallback messaging when no exact match
- [x] Left preference Filter band (questionnaire dimensions, Apply filters)



### Browse / category landings

- [x] All Sports landing (`/browse`) — full catalog (no 24-item cap)
- [x] Equipment landing
- [x] Clothing landing
- [x] Footwear landing
- [x] Accessories landing
- [x] Support and recovery landing (`/browse/Support`)
- [x] Fitness technology landing
- [x] Header links for all landings
- [x] Left Filter band on browse pages
- [x] Product grid via `GET /api/products` with large View / Add actions
- [x] Age filter includes `all-45+` products



### 45+ accessibility pass

- [x] Large readable fonts
- [x] High-contrast text
- [x] Large labeled buttons (no icon-only critical actions)
- [x] Clear navigation labels
- [x] Minimal motion / `prefers-reduced-motion`
- [x] Clear error and success messages
- [x] Avoid crowded layouts and banner clutter



### Phase exit

- [x] Guest completes questionnaire → sees personalized list
- [x] Guest can Skip questionnaire → All Products browse
- [x] Refine preferences / Apply filters re-fetches recommendations
- [x] Manual readability review for 45+ users passes

---



## Phase 06 — Shopping & checkout

Architecture: [phase-06-shopping-checkout](./phase-06-shopping-checkout/)

### Product detail module

- [x] Product detail page from `GET /api/products/:id`
- [x] Simple description and benefits
- [x] Size / color selectors when present
- [x] Stock status in plain language
- [x] Add to Cart
- [x] Buy Now



### Cart UI module

- [x] Cart page loads by `sessionId`
- [x] Update quantity
- [x] Remove item
- [x] Subtotal display
- [x] Proceed to checkout
- [x] Empty-cart state



### Checkout module

- [x] Single-column customer + shipping form
- [x] Order summary
- [x] Create order via `POST /api/orders`
- [x] Block checkout when items out of stock
- [x] Validation errors in plain language



### Payment & confirmation module

- [x] Payment page shows amount
- [x] `POST /api/payments/create`
- [x] `POST /api/payments/confirm` (mock success)
- [x] Order confirmation page (orderId, items, total)
- [x] Clear cart after successful payment
- [x] Failed/invalid payment error state



### Phase exit

- [x] Guest can buy a recommended product end-to-end
- [x] Buy Now and Add-to-Cart paths both work
- [x] Confirmation page shows after mock payment

---



## Phase 07 — MVP integration

Architecture: [phase-07-mvp-integration](./phase-07-mvp-integration/)

### Wiring & resilience

- [x] Frontend env points at API; CORS verified
- [x] Sheets unavailable → JSON/CSV/Excel fallback still demos
- [x] Health endpoint reflects inventory status
- [x] Global empty/error states (no blank screens)
- [x] Stock decrement or consistent stock checks at order time (MVP-appropriate)



### Full journey verification (§12)

- [x] Enter as guest (or registered stub)
- [x] Complete preferences questionnaire
- [x] Receive limited suitable products
- [x] Understand why each product is recommended
- [x] View simple product details
- [x] Add to cart
- [x] Complete checkout + mock payment
- [x] View order confirmation



### Demo readiness

- [x] Root README: setup, env vars, run commands
- [x] Demo script documented (sample preferences path)
- [x] Seed inventory covers the demo path
- [x] Known limitations listed
- [x] Architecture docs updated if implementation diverged



### Phase exit

- [x] Demo script succeeds on a clean local run
- [x] All modules above checked or explicitly deferred with reason
- [x] MVP accepted against Problem Statement expected outcomes

---



## Module index (quick lookup)


| Module                                            | Primary phase(s) |
| ------------------------------------------------- | ---------------- |
| Workspace / shared types                          | 01               |
| Inventory loaders & normalize                     | 02               |
| Product APIs                                      | 03               |
| Cart / order / payment APIs                       | 03, 06           |
| Hard filters / scoring / diversity / explanations | 04               |
| Opening + guest session                           | 05               |
| Questionnaire overlay                             | 05               |
| Preference filter band                            | 05               |
| Browse / category landings                        | 05               |
| Recommendations UI                                | 05               |
| Product detail UI                                 | 06               |
| Cart / checkout / payment UI                      | 06               |
| E2E demo & acceptance                             | 07               |


