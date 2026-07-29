# Demo script — Sports Mart MVP

Run this on a clean machine after `npm install` and `npm run dev` (or `dev:api` + `dev:web`).

## Sample preferences (happy path)

| Step | Choice |
|------|--------|
| Age group | 55+ |
| Primary sport | Walking |
| Additional sports | (skip / none) |
| Product type | Footwear |
| Experience | Beginner |
| Budget | Medium ($40–$100) |
| Benefits | Comfort-focused, Low impact |

Expected: a short list (≤6 primary) with in-stock Walking footwear such as **Comfort Walk Pro Shoes (SP001)**, each with a plain-language explanation.

## Purchase path

1. Continue as Guest from the opening page.
2. Complete the questionnaire with the table above.
3. On recommendations, read **Why these products?** and one card explanation.
4. **View product** → confirm size/color if shown → **Add to cart**.
5. Open **Cart** → adjust qty if needed → **Proceed to checkout**.
6. Fill guest checkout (any valid email/address) → **Place order & pay**.
7. Choose any mock payment method → **Pay now**.
8. Confirm the **order ID**, items, and total on the confirmation page.

## Buy now path (optional)

From product detail, use **Buy now** instead of Add to cart. Checkout should not empty the previous cart until a cart-based payment succeeds.

## Refine path (optional)

Re-run the questionnaire with:

- Primary sport: **Hiking**
- Product type: Equipment and/or Accessories
- Budget: Low–Medium

Ranking and top picks should change versus Walking footwear.

## Offline inventory check

1. Stop the API.
2. Set `INVENTORY_PREFER_SHEETS=false` in `.env`.
3. Start API again and open `/api/health` — `inventory.source` should be `csv` or `json` with `productCount > 0`.
4. Re-run the demo questionnaire; recommendations should still load.

## Automated gate

```bash
npm run dev:api
# other terminal
npm run smoke:phase7
```

`smoke:phase7` covers health, demo recommendations, refine call, cart → order → mock pay, cart clear, and stock decrement.
