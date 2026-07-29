# Phase 04 — Recommendation Engine

Deterministic rule-based engine: hard filters → weighted scores → diversity constraints → template explanations.

## Goals

- Filter to mandatory-fit, in-stock products.
- Score with explicit weights from Problem Statement §4.
- Cap and diversify results to reduce cognitive overload.
- Attach short, template-based explanations (no LLM).

## Pipeline

```text
UserPreferences
       │
       ▼
┌──────────────┐
│ Hard filters │  availability, sport, type, age, experience, budget
└──────┬───────┘
       ▼
┌──────────────┐
│ Score each   │  weighted sum → Recommendation Score
└──────┬───────┘
       ▼
┌──────────────┐
│ Rank desc    │
└──────┬───────┘
       ▼
┌──────────────┐
│ Diversity    │  subcategory ≤3, brand ≤2, no duplicate variants
└──────┬───────┘
       ▼
┌──────────────┐
│ Bucketize    │  primary (6) / additional (4) / accessories (3)
└──────┬───────┘
       ▼
┌──────────────┐
│ Explain      │  template strings from matched rules
└──────────────┘
```

## Hard filters (must pass)

| Filter | Rule |
|--------|------|
| Availability | `active && stockQuantity > 0` |
| Sport | Product sports intersect primary **or** additional sports (primary preferred in scoring) |
| Product type | Category matches selected type(s) for primary/additional buckets; accessories bucket uses accessory categories/tags |
| Age | Product `ageGroup` matches user group **or** `all-45+` |
| Experience | Exact match **or** product supports `All` / beginner-friendly path as defined in scoring docs |
| Budget | `price` within `[budgetMin, budgetMax]` for primary path; optional soft near-miss for “closest alternatives” |

If hard filters yield zero products, return closest alternatives (relax budget ±20% or experience) and set `meta.fallbackUsed = true` with a plain-language message.

## Diversity & volume caps

| Constraint | Limit |
|------------|------:|
| Primary recommendations | ≤ 6 |
| Additional recommendations | ≤ 4 |
| Accessories | ≤ 3 |
| Same subcategory | ≤ 3 |
| Same brand | ≤ 2 |
| Duplicate variants (same family/name stem) | 0 extras |

## Module map

| File | Role |
|------|------|
| `hardFilters.ts` | Eligibility boolean pipeline |
| `scoring.ts` | Weighted points |
| `diversity.ts` | Greedy pick while respecting caps |
| `explanations.ts` | Template selection from score breakdown |
| `recommendationService.ts` | Orchestrates + builds response DTO |

## Non-goals

- ML / embeddings / LLM ranking
- Collaborative filtering
- Personalization from historical purchases (future)

## Exit criteria

- [x] Same preferences always produce the same ranking (deterministic).
- [x] Scoring weights match documented table.
- [x] Caps and diversity rules enforced.
- [x] Every returned item has a short explanation.
- [x] Empty hard-filter case returns closest alternatives or clear empty state.

## Next phase

→ [Phase 05 — Frontend UX](../phase-05-frontend-ux/) (UI can proceed in parallel once contracts exist)
