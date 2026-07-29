# Phase 06 — Shopping & Checkout

Complete the commerce path: product detail → cart → checkout → mock payment → order confirmation.

## Goals

- Wire product detail and buy actions to cart/order APIs.
- Support **Add to Cart** and **Buy Now**.
- Guest checkout without account creation.
- Mock payment create/confirm flow with a clear confirmation page.

## User flow

```text
Recommendations / Browse
        │
        ▼
 Product Details
        │
        ├─ Add to Cart → Cart → Checkout
        └─ Buy Now ───────────► Checkout
                │
                ▼
         Payment Page
                │
                ▼
     Payment Gateway (Mock)
                │
                ▼
       Order Confirmation
```

## Screens

| Screen | Responsibilities |
|--------|------------------|
| Product Detail | Image(s), name, brand, price, rating, simple description, benefits, size/color if any, stock, Add to Cart, Buy Now |
| Cart | Line items, qty update/remove, subtotal, proceed to checkout |
| Checkout | Customer + shipping fields (simple), order summary, place order |
| Payment | Show amount; confirm mock payment |
| Order Confirmation | Order ID, items, total, plain success message |

## Domain flow (backend)

```text
Cart (session) ──► Create Order (pending_payment)
                          │
                          ▼
                   Create Payment
                          │
                          ▼
                   Confirm Payment ──► Order (confirmed)
                          │
                          └─ decrement stock (MVP: best-effort in memory)
```

## Validation & edge cases

- Block checkout if any line item is out of stock.
- Quantity cannot exceed `stockQuantity`.
- Empty cart cannot checkout.
- Payment confirm on unknown/paid order returns clear error.
- After confirmation, cart for that session is cleared.

## UI constraints (same as Phase 05)

- Large buttons; labeled actions; short success/error messages.
- No dense multi-column checkout forms — single column, few fields.

## Non-goals

- Real card processing / PCI scope
- Coupons, multi-currency, tax engines
- Order history account portal (single confirmation by `orderId` is enough)

## Exit criteria

- [ ] Guest can buy a recommended product end-to-end.
- [ ] Cart update/remove works.
- [ ] Mock payment confirms and shows order confirmation.
- [ ] Stock and empty-cart errors are understandable.

## Next phase

→ [Phase 07 — MVP Integration](../phase-07-mvp-integration/)
