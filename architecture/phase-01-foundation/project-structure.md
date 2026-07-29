# Phase 01 — Project structure

Concrete module boundaries for the monorepo.

## apps/api

```text
apps/api/
├── src/
│   ├── index.ts                 # server bootstrap
│   ├── config.ts                # env + feature flags
│   ├── routes/
│   │   ├── products.ts
│   │   ├── recommendations.ts
│   │   ├── cart.ts
│   │   ├── orders.ts
│   │   └── payments.ts
│   ├── services/
│   │   ├── inventory/
│   │   │   ├── sheetsLoader.ts
│   │   │   ├── fileLoader.ts
│   │   │   ├── normalize.ts
│   │   │   └── inventoryService.ts
│   │   ├── recommendation/
│   │   │   ├── hardFilters.ts
│   │   │   ├── scoring.ts
│   │   │   ├── diversity.ts
│   │   │   ├── explanations.ts
│   │   │   └── recommendationService.ts
│   │   ├── cartService.ts
│   │   ├── orderService.ts
│   │   └── paymentService.ts
│   └── middleware/
│       ├── errorHandler.ts
│       └── session.ts
└── package.json
```

## apps/web

```text
apps/web/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── styles/
│   │   └── tokens.css
│   ├── pages/
│   │   ├── OpeningPage.tsx
│   │   ├── RecommendationsPage.tsx
│   │   ├── ProductDetailPage.tsx
│   │   ├── CartPage.tsx
│   │   ├── CheckoutPage.tsx
│   │   ├── PaymentPage.tsx
│   │   └── OrderConfirmationPage.tsx
│   ├── components/
│   │   ├── questionnaire/
│   │   ├── product/
│   │   └── layout/
│   ├── api/                     # thin HTTP clients
│   └── state/                   # preferences, sessionId, cart
└── package.json
```

## packages/shared

```text
packages/shared/
├── src/
│   ├── types/
│   │   ├── product.ts
│   │   ├── preferences.ts
│   │   ├── recommendation.ts
│   │   ├── cart.ts
│   │   └── order.ts
│   ├── constants/
│   │   ├── sports.ts
│   │   ├── categories.ts
│   │   ├── benefits.ts
│   │   └── scoringWeights.ts
│   └── index.ts
└── package.json
```

## Dependency rule

```text
web ──► shared
api ──► shared
web ✗──► api (HTTP only, no direct imports)
```

Frontend never imports backend modules; communication is REST only.
