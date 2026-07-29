# Phase 07 — MVP Integration

Wire all phases into one demonstrable product and verify Problem Statement §12 outcomes.

## Goals

- End-to-end guest journey works against live API + inventory fallback.
- Recommendation → purchase path is reliable and understandable.
- Document how to run a demo and how acceptance is judged.
- Fix integration gaps (CORS, env, empty states, error handling).

## End-to-end acceptance journey

A user aged 45+ can:

1. Enter as guest (or registered stub).
2. Select age, sport, budget, experience, preferences.
3. Receive a **limited** suitable product list.
4. See **why** each product was recommended.
5. View product details in simple language.
6. Add to cart.
7. Complete checkout and **mock** payment.
8. See order confirmation.

## Integration checklist

| Area | Check |
|------|-------|
| Inventory | Sheets works **or** JSON/CSV fallback engages automatically |
| Recommendations | Caps 6 / 4 / 3; explanations present; diversity holds |
| Refine | Changing preferences changes results |
| Cart | Session survives refresh (localStorage `sessionId` + cart re-sync) |
| Checkout | Validation errors clear |
| Payment | Confirm → confirmation page with orderId |
| UI | Manual 45+ readability pass; React ErrorBoundary for crashes |
| Resilience | Stop Sheets / set `INVENTORY_PREFER_SHEETS=false` → app still demos via fallback |

## Suggested demo script

Canonical copy: [docs/DEMO.md](../../docs/DEMO.md) and root [README.md](../../README.md).

1. Open app → Continue as Guest.
2. Questionnaire: 55+, Walking, Footwear, Beginner, medium budget, Comfort-focused + Low impact.
3. Show primary cards + explanations + accessories.
4. Open one product → Add to Cart → Checkout → Pay → Confirm.
5. Show order ID page.
6. Optionally: Refine to **Hiking** and show ranking change.

Automated gate: `npm run smoke:phase7` (API must be running).

## Quality bar for MVP

- Deterministic recommendations (no LLM).
- No out-of-stock items in recommendation lists.
- No account required for full purchase path.
- Errors never leave the user on a blank screen.

## Out of scope (post-MVP)

- Real payment gateway
- Account order history / profiles
- ML personalization
- Admin inventory CMS UI
- Multi-language

## Exit criteria

- [x] Demo script documented for a clean machine using README instructions.
- [x] §12 expected outcomes covered by UI + `smoke:phase7`.
- [x] Architecture demo path aligned with seed inventory (Hiking refine, not Trekking).
- [x] Known limitations listed in root README.

## Deliverables

- Runnable `apps/web` + `apps/api`
- Seed `data/inventory.json` (+ CSV mirror; Excel loader supported but no `.xlsx` seed shipped)
- Root README: setup, env, demo script, limitations
- `scripts/smoke-phase7.mjs` + `npm run smoke:phase7`
- This architecture tree kept as the build roadmap

## Next

MVP complete for demo. Post-MVP work is listed under Out of scope above.
