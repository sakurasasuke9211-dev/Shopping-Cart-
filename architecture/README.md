# Phase-Wise Architecture

Personalized sports equipment recommendation platform for users aged **45+**, inspired by Decathlon. Architecture is split into seven build phases that map directly to `docs/ProblemStatement.md`.

## System goal

Help older adults discover suitable sports equipment without decision fatigue by combining:

1. Structured inventory (Google Sheets + local fallback)
2. A deterministic rule-based recommendation engine
3. An accessibility-first shopping UI with guest checkout

## High-level architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Web)                          │
│  Opening → Auth/Guest → Questionnaire ─┬→ Recommendations       │
│                    Skip ───────────────┘→ Browse landings       │
│           → Product Detail → Cart → Checkout → Confirmation     │
└────────────────────────────┬────────────────────────────────────┘
                             │ REST (JSON)
┌────────────────────────────▼────────────────────────────────────┐
│                         Backend API                             │
│  Products │ Recommendations │ Cart │ Orders │ Payments          │
└──────┬───────────────┬───────────────┬──────────────────────────┘
       │               │               │
       ▼               ▼               ▼
 Inventory         Scoring          Session store
 Loader            Engine           (cart/orders)
 (Sheets/JSON)     + Explanations   (in-memory / file for MVP)
```

## Phase map

| Phase | Folder | Focus | Depends on |
|------:|--------|-------|------------|
| 01 | [phase-01-foundation](./phase-01-foundation/) | Stack, monorepo layout, coding standards | — |
| 02 | [phase-02-inventory-data](./phase-02-inventory-data/) | Product schema, Sheets + CSV/JSON/Excel fallback, ingestion | 01 |
| 03 | [phase-03-backend-api](./phase-03-backend-api/) | REST contracts for products, cart, orders, payments | 01–02 |
| 04 | [phase-04-recommendation-engine](./phase-04-recommendation-engine/) | Hard filters, weighted scoring, diversity, explanations | 02–03 |
| 05 | [phase-05-frontend-ux](./phase-05-frontend-ux/) | 45+ UI, questionnaire overlay, recommendation display | 03–04 |
| 06 | [phase-06-shopping-checkout](./phase-06-shopping-checkout/) | Product detail, cart, checkout, mock payment | 03, 05 |
| 07 | [phase-07-mvp-integration](./phase-07-mvp-integration/) | End-to-end wiring, polish, acceptance criteria | 01–06 |
| 08 | [phase-08-supabase-auth](./phase-08-supabase-auth/) | Supabase email auth, RLS profiles/prefs, guest merge | 05–06 |
| 09 | [phase-09-deployment](./phase-09-deployment/) | Vercel (frontend + API) + Supabase deployment | 01–08 |

## Recommended build order

```text
Phase 01  Foundation
    │
    ▼
Phase 02  Inventory & Data
    │
    ▼
Phase 03  Backend APIs ──────────────┐
    │                                │
    ▼                                ▼
Phase 04  Recommendation Engine   Phase 05 Frontend UX (can start in parallel after API stubs)
    │                                │
    └────────────┬───────────────────┘
                 ▼
           Phase 06 Shopping & Checkout
                 │
                 ▼
           Phase 07 MVP Integration
                 │
                 ▼
           Phase 08 Supabase Auth (optional account layer)
                 │
                 ▼
           Phase 09 Deployment (Vercel + Supabase)
```

## Cross-cutting principles

- **Cognitive load first** — show few products; one question per step; short explanations.
- **Deterministic MVP** — rule-based scoring only; no LLM in the recommendation path.
- **Guest-first** — full journey works without an account (session-based cart/orders).
- **Resilient inventory** — Google Sheets primary; local JSON/CSV/Excel fallback.
- **Accessibility for 45+** — large type, high contrast, large buttons, clear labels, minimal motion.

## Source of truth

Requirements live in [`../docs/ProblemStatement.md`](../docs/ProblemStatement.md). Each phase folder documents scope, components, data contracts, and exit criteria for that slice of the system.

## Implementation tracking

Use the phase-wise module checklist while building:

→ [`IMPLEMENTATION_CHECKLIST.md`](./IMPLEMENTATION_CHECKLIST.md)
