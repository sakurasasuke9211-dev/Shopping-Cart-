# Phase 03 — Backend API

Expose REST endpoints that power discovery, recommendations, cart, orders, and mock payments.

## Goals

- Implement stable JSON APIs as specified in Problem Statement §8.
- Keep handlers thin; business logic in services.
- Support guest users via `sessionId`.
- Validate inputs and return consistent error shapes.

## API surface

### Health

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/health` | Liveness + inventory source status |

### Products

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/products` | List with search, filter, sort, pagination |
| GET | `/api/products/:id` | Full product detail |

**Query params (`GET /api/products`):**

- `q` — search name/brand/description
- `sport`, `category`, `ageGroup`, `experienceLevel`
- `minPrice`, `maxPrice`
- `sort` — `price_asc` \| `price_desc` \| `rating_desc` \| `name_asc`
- `page`, `pageSize`

### Recommendations

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/recommendations` | Preferences in → ranked recommendations out |

### Cart

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/cart/:sessionId` | Fetch cart |
| POST | `/api/cart` | Add item |
| POST | `/api/cart/update` | Update quantity |
| POST | `/api/cart/remove` | Remove line item |

### Orders

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/orders` | Create order from cart / buy-now |
| GET | `/api/orders/:orderId` | Order details / confirmation data |

### Payments

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/payments/create` | Start mock payment for an order |
| POST | `/api/payments/confirm` | Confirm mock payment |

## Layering

```text
Route → validate (Zod) → Service → Inventory / Store → Response DTO
```

No scoring logic inside route files — that belongs in Phase 04 services called from the recommendations route.

## Session model

```text
Client generates or receives sessionId
        │
        ▼
localStorage / cookie
        │
        ▼
All cart calls keyed by sessionId
Orders reference sessionId for guest attribution
```

Optional login can later map `userId → sessionId` without changing cart APIs.

## Error response shape

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "budgetMax must be greater than budgetMin",
    "details": []
  }
}
```

Common codes: `VALIDATION_ERROR`, `NOT_FOUND`, `OUT_OF_STOCK`, `INVENTORY_UNAVAILABLE`, `PAYMENT_FAILED`.

## Non-goals

- Real OAuth / full account system
- Real payment provider webhooks
- GraphQL

## Exit criteria

- [x] All §8 routes exist with request/response contracts documented.
- [x] Product list supports filter/sort/pagination.
- [x] Cart works for a guest `sessionId`.
- [x] Orders and mock payments create a confirmable order lifecycle.
- [x] Recommendation route wired to engine (or stub returning empty until Phase 04).

## Next phase

→ [Phase 04 — Recommendation Engine](../phase-04-recommendation-engine/)
