# Phase 05 — Frontend UX

Accessibility-first UI for users aged 45+, including the multi-step questionnaire overlay, personalized recommendations, category browse landings, and a left-side preference filter band.

**Stitch prompt:** [stitch-prompt.md](./stitch-prompt.md) — ready-to-paste Google Stitch prompt for Sports Mart screens (Decathlon tone, 45+ accessibility, full user flow).

**Related:** [questionnaire.md](./questionnaire.md) · [browse-filters.md](./browse-filters.md) · [accessibility.md](./accessibility.md)

## Goals

- Implement the user journey from opening page through recommendations **or** browse.
- One question per questionnaire step (overlay), with an explicit **Skip** path.
- Left filter band mirrors questionnaire fields so guests can change answers without reopening the overlay.
- Category landing pages: All Sports, Equipment, Clothing, Footwear, Accessories, **Support and recovery**, **Fitness technology** (full catalog coverage).
- Large type, high contrast, large controls, clear labels.

## Screen map (this phase)

```text
Opening Page
    → Login or Continue as Guest
    → Questionnaire Overlay (multi-step)
         ├─ Finish (complete prefs) → Personalized Recommendations (+ left Filter band)
         ├─ Skip this step → next question (optional answers)
         └─ Skip All → All Products browse (+ left Filter band)

Header category links
    → All Sports | Equipment | Clothing | Footwear | Accessories
      | Support and recovery | Fitness technology
```

Product detail / cart screens are stub-linked here and completed in Phase 06.

## UX requirements (must)

| Do | Avoid |
|----|-------|
| Large readable fonts | Small text |
| High-contrast text | Low-contrast gray on gray |
| Large buttons with text labels | Icon-only actions |
| Clear navigation | Crowded screens |
| One question per step | Multi-field dense forms |
| Limited product cards on recommendations | Too many recommendation cards |
| Filter band with large labeled controls | Dense left accordion of tiny checkboxes |
| Simple descriptions | Long technical copy |
| Clear errors / confirmations | Excessive animations / banner clutter |

## Questionnaire overlay

### Steps (order)

1. Age group — `45–55` / `55+`
2. Primary sport — single select from sport list
3. Additional sports — multi-select (optional, capped)
4. Product type — Equipment, Clothing, Footwear, Accessories, Support and recovery, Fitness technology
5. Experience level — Beginner / Intermediate / Experienced
6. Budget range — min/max or preset bands (Low / Medium / High mapped to numbers)
7. Extra preferences / benefits — multi-select chips with **text labels** (Lightweight, Beginner-friendly, …)

### Interaction rules

- Overlay blocks the page until completed **or** the guest chooses **Skip All**.
- **Skip All** (grey secondary, always visible) → `/browse` without requiring preferences. Do not call recommendations.
- **Skip this step** (grey secondary) → clear current answer only, advance; keep answers from other steps.
- Progress indicator: “Step 3 of 7” in plain text.
- Back / Next always visible and large.
- On finish with **any** answered fields (skipped steps soft-defaulted) → `POST /api/recommendations` → recommendations page.
- On finish with **no** answers → `/browse` (guest can still shop).
- Completed / partial answers seed the left Filter band on recommendations (and browse, if prefs exist).

## Recommendations page

Layout: **left Filter band** + main results column (stacked on small screens).

Each card shows:

- Image (`ProductImage` with CDN-safe referrer policy + local SVG fallback), name, brand, sport, category, price, rating
- Main benefit
- Availability
- Personalized explanation
- **View Product** and **Add to Cart** (large buttons)

Page sections:

1. Primary recommendations (≤6)
2. Additional (≤4)
3. Related accessories (≤3)
4. **Why these products?** (short method blurb)
5. **Refine preferences** (re-open questionnaire) and/or **Apply filters** on the band
6. Closest alternatives messaging when `meta.fallbackUsed`

## Browse / category landings

| Nav label | Route | Default product filter |
|-----------|-------|------------------------|
| All Sports | `/browse` | No category — **all** products (`pageSize` ≥ catalog size) |
| Equipment | `/browse/Equipment` | `category=Equipment` |
| Clothing | `/browse/Clothing` | `category=Clothing` |
| Footwear | `/browse/Footwear` | `category=Footwear` |
| Accessories | `/browse/Accessories` | `category=Accessories` |
| Support and recovery | `/browse/Support` | `category=Support` |
| Fitness technology | `/browse/Fitness technology` | `category=Fitness technology` |

- Same left Filter band (questionnaire dimensions).
- Product grid from `GET /api/products` with large View / Add actions.
- Age filter must include `all-45+` inventory; must not truncate the grid to 24 by default.
- No recommendation explanations required on browse cards.
- Empty / error states with plain language.

## Left Filter band

See [browse-filters.md](./browse-filters.md). Mirrors every questionnaire step; values editable; Apply updates recommendations or browse results.

## State

| State | Storage |
|-------|---------|
| `sessionId` | localStorage |
| `preferences` | sessionStorage / memory |
| `recommendations` | memory (refetch on refine / Apply filters) |
| Auth mode | `guest` \| `registered` (stub) |
| Browse filters | URL params + local form state (optional sync to preferences when Apply on recommendations) |

## Component sketch

```text
components/
  questionnaire/
    QuestionnaireOverlay.tsx
  filters/
    PreferenceFilterBand.tsx
  product/
    RecommendationCard.tsx
    RecommendationSections.tsx
    BrowseProductCard.tsx
  layout/
    AppHeader.tsx
    PrimaryButton.tsx
pages/
  BrowsePage.tsx
  RecommendationsPage.tsx
```

## Non-goals

- Pixel-perfect Decathlon clone
- Dark-mode toggle as a focus (prefer a single clear light, high-contrast theme for MVP)
- Complex animation systems
- Faceted filters beyond questionnaire dimensions (brand clouds, tiny size matrices, etc.)

## Exit criteria

- [x] Guest can complete questionnaire without an account.
- [x] One question per step; progress is clear.
- [x] Guest can **Skip All** → All Products browse (full catalog).
- [x] Guest can **Skip this step** on any question.
- [x] Recommendations render with explanations, action buttons, and left Filter band.
- [x] Category landings cover Equipment, Clothing, Footwear, Accessories, Support, Fitness technology (+ All Sports).
- [x] Filter band can change questionnaire dimensions and refresh results without hiding `all-45+` stock via pagination.
- [x] Refine preferences re-runs recommendations.
- [x] UI checklist for 45+ readability passes manual review.

## Next phase

→ [Phase 06 — Shopping & Checkout](../phase-06-shopping-checkout/)
