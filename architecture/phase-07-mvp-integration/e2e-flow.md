# Phase 07 — End-to-end flow

## Sequence (happy path)

```text
Browser                         API                         Inventory
   │                             │                              │
   │  open app / guest           │                              │
   │  complete questionnaire     │                              │
   │                             │                              │
   │  POST /api/recommendations  │                              │
   │────────────────────────────►│  getCandidates()             │
   │                             │─────────────────────────────►│
   │                             │◄─────────────────────────────│
   │                             │  filter → score → diversify  │
   │◄────────────────────────────│  explain                     │
   │  show primary/additional/   │                              │
   │  accessories                │                              │
   │                             │                              │
   │  GET /api/products/:id      │                              │
   │────────────────────────────►│                              │
   │◄────────────────────────────│                              │
   │                             │                              │
   │  POST /api/cart             │                              │
   │────────────────────────────►│                              │
   │  POST /api/orders           │                              │
   │────────────────────────────►│                              │
   │  POST /api/payments/create  │                              │
   │────────────────────────────►│                              │
   │  POST /api/payments/confirm │                              │
   │────────────────────────────►│  status=confirmed            │
   │◄────────────────────────────│                              │
   │  confirmation page          │                              │
```

## State transitions

```text
Preferences collected
        → Recommendations loaded
        → Cart non-empty
        → Order pending_payment
        → Payment requires_confirmation
        → Payment paid / Order confirmed
```

## Failure UX

| Failure | User-facing message (tone) |
|---------|----------------------------|
| Inventory unavailable | “We could not load products right now. Please try again shortly.” |
| No matches | “No exact matches. Here are the closest options.” or empty state with Refine |
| Out of stock at checkout | “This item is no longer available. Please remove it to continue.” |
| Payment mock fail (if simulated) | “Payment could not be completed. You can try again.” |

## Definition of done for the project MVP

Architecture phases 01–07 implemented sufficiently to run the demo script without stubs for recommendation scoring, cart, or payment confirmation.
