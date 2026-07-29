# Phase 04 — Scoring

## Weight table

| Signal | Points |
|--------|-------:|
| Primary sport match | +40 |
| Additional sport match | +15 |
| Exact age-group match | +20 |
| Suitable for all users aged 45+ | +10 |
| Exact experience-level match | +15 |
| Product-type match | +15 |
| Product within budget | +10 |
| Beginner-friendly tag for beginner users | +10 |
| Lightweight tag for users aged 55+ | +8 |
| Easy-to-use tag for users aged 55+ | +8 |
| Comfort-focused tag | +6 |
| Rating ≥ 4 | +5 |
| Featured product | +3 |

## Score formula

```text
Recommendation Score =
  Sport Score
+ Age Score
+ Experience Score
+ Product Type Score
+ Budget Score
+ Benefit Score
+ Rating Score
+ Featured Score
```

## Implementation notes

1. Compute a **breakdown object** per product (not only the total) so explanations can cite real reasons.
2. Sport score: if both primary and additional match, award **primary (+40)** only (do not stack both unless product is multi-sport and you explicitly want both — default: max of the two, preferring primary).
3. Age score: exact user group match **or** `all-45+` bonus (not both). Prefer exact (+20) when both apply.
4. Benefit score: sum applicable benefit bonuses (beginner-friendly, lightweight, easy-to-use, comfort-focused) based on user age/experience/preferences.
5. Preferred benefits from the questionnaire can add a small uniform bonus (e.g. +4 each match, capped) — keep documented if added beyond the problem statement table.
6. Tie-breakers (in order): higher rating → lower price → `productId` ascending (stable).

## Pseudocode

```ts
function scoreProduct(p: Product, pref: UserPreferences): ScoreBreakdown {
  const breakdown = {
    sport: 0, age: 0, experience: 0, productType: 0,
    budget: 0, benefit: 0, rating: 0, featured: 0,
  };

  if (p.sport.includes(pref.primarySport)) breakdown.sport = 40;
  else if (intersects(p.sport, pref.additionalSports)) breakdown.sport = 15;

  if (p.ageGroup === pref.ageGroup) breakdown.age = 20;
  else if (p.ageGroup === "all-45+") breakdown.age = 10;

  if (p.experienceLevel === pref.experienceLevel || p.experienceLevel === "All") {
    if (p.experienceLevel === pref.experienceLevel) breakdown.experience = 15;
  }

  if (matchesProductType(p.category, pref.productType)) breakdown.productType = 15;
  if (p.price >= pref.budgetMin && p.price <= pref.budgetMax) breakdown.budget = 10;

  if (pref.experienceLevel === "Beginner" && has(p, "Beginner-friendly")) breakdown.benefit += 10;
  if (pref.ageGroup === "55+" && has(p, "Lightweight")) breakdown.benefit += 8;
  if (pref.ageGroup === "55+" && has(p, "Easy to use")) breakdown.benefit += 8;
  if (has(p, "Comfort-focused")) breakdown.benefit += 6;

  if (p.rating >= 4) breakdown.rating = 5;
  if (p.featured) breakdown.featured = 3;

  const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
  return { total, breakdown };
}
```

Keep weights in `packages/shared/constants/scoringWeights.ts` so frontend “Why these products?” copy can mirror backend logic if needed.
