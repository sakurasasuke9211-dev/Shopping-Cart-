# Phase 06 — Cart, checkout, payment

## Cart service

In-memory store keyed by `sessionId`:

```ts
interface CartItem {
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
}

interface Cart {
  sessionId: string;
  items: CartItem[];
  updatedAt: string;
}
```

On read, join with inventory for name, price, availability. Recalculate `lineTotal` / `subtotal` server-side (never trust client prices).

## Order model

```ts
type OrderStatus =
  | "pending_payment"
  | "confirmed"
  | "cancelled"
  | "payment_failed";

interface Order {
  orderId: string;
  sessionId: string;
  status: OrderStatus;
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    unitPrice: number;
  }>;
  amount: number;
  customer: { name: string; email: string; phone?: string; shippingAddress: object };
  createdAt: string;
  paidAt?: string;
}
```

## Payment model (mock)

```ts
type PaymentStatus = "requires_confirmation" | "paid" | "failed";

interface Payment {
  paymentId: string;
  orderId: string;
  amount: number;
  status: PaymentStatus;
}
```

Mock confirm: validate order is `pending_payment` and amount matches → mark payment `paid`, order `confirmed`.

## Buy Now

Creates a temporary one-item checkout context (or ephemeral cart) without wiping the main cart — MVP may clone into checkout payload directly via `POST /api/orders` with explicit `items`.

## Persistence (MVP)

- Memory is acceptable for demos.
- Optional: append-only `data/orders.json` for reboot survival during demos.
