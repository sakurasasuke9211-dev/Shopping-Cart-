# Phase 03 — API contracts

Illustrative request/response payloads for MVP clients.

## POST `/api/recommendations`

### Request

```json
{
  "ageGroup": "55+",
  "primarySport": "Walking",
  "additionalSports": ["Yoga"],
  "productType": ["Footwear", "Accessories"],
  "experienceLevel": "Beginner",
  "budgetMin": 500,
  "budgetMax": 3000,
  "preferredBenefits": ["Lightweight", "Beginner-friendly", "Non-slip"]
}
```

### Response

```json
{
  "primary": [
    {
      "product": { "productId": "P100", "name": "...", "brand": "...", "price": 1499, "rating": 4.5, "images": ["..."], "category": "Footwear", "sport": ["Walking"], "benefits": ["Lightweight"], "availability": "in_stock" },
      "score": 98,
      "explanation": "Recommended because it matches your interest in walking and is suitable for beginners."
    }
  ],
  "additional": [],
  "accessories": [],
  "meta": {
    "candidateCount": 42,
    "fallbackUsed": false,
    "message": null
  }
}
```

Limits: up to **6** primary, **4** additional, **3** accessories.

## GET `/api/products`

### Response

```json
{
  "items": [],
  "page": 1,
  "pageSize": 20,
  "total": 120
}
```

## Cart

### POST `/api/cart`

```json
{
  "sessionId": "sess_abc",
  "productId": "P100",
  "quantity": 1,
  "size": "9",
  "color": "Navy"
}
```

### GET `/api/cart/:sessionId`

```json
{
  "sessionId": "sess_abc",
  "items": [
    {
      "productId": "P100",
      "name": "...",
      "unitPrice": 1499,
      "quantity": 1,
      "lineTotal": 1499
    }
  ],
  "subtotal": 1499
}
```

## Orders & payments

### POST `/api/orders`

```json
{
  "sessionId": "sess_abc",
  "items": [{ "productId": "P100", "quantity": 1 }],
  "customer": {
    "name": "Guest User",
    "email": "guest@example.com",
    "phone": "",
    "shippingAddress": { "line1": "...", "city": "...", "postalCode": "..." }
  }
}
```

→ `{ "orderId": "ord_123", "status": "pending_payment", "amount": 1499 }`

### POST `/api/payments/create`

```json
{ "orderId": "ord_123" }
```

→ `{ "paymentId": "pay_456", "status": "requires_confirmation", "amount": 1499 }`

### POST `/api/payments/confirm`

```json
{ "paymentId": "pay_456", "orderId": "ord_123" }
```

→ `{ "status": "paid", "orderId": "ord_123" }`

Order status after confirm: `confirmed` (mock always succeeds if order is valid and in stock).
