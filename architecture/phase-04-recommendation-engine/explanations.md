# Phase 04 — Explanations

Template-based, short sentences. Never invent claims not supported by the score breakdown or product tags.

## Principles

- One or two sentences max.
- Plain language for 45+ users.
- Prefer sport + experience + comfort / ease reasons.
- Accessory bucket uses accessory-specific templates.

## Template catalog

| Condition | Template |
|-----------|----------|
| Primary sport + beginner | “Recommended because it matches your interest in {sport} and is suitable for beginners.” |
| 55+ + lightweight + easy | “A lightweight and easy-to-use option for users aged 55+.” |
| Budget + comfort | “Fits your selected budget and provides comfort-focused features.” |
| Multi-sport (primary + additional) | “Suitable for both {sportA} and {sportB}.” |
| Accessory bucket | “Recommended as an accessory to support your selected sport.” |
| High rating + sport | “A highly rated option that matches your interest in {sport}.” |
| Exact age match | “Chosen because it is designed for your age group.” |
| Fallback / closest | “No exact match was found, so here is a close alternative within a similar budget.” |

## Selection algorithm

1. Inspect `ScoreBreakdown` flags / points.
2. Pick the **highest-priority** matching template (sport+beginner > 55+ ease > budget+comfort > generic sport).
3. Fill placeholders from preferences and product fields.
4. If multiple strong signals, optionally append a second short clause (still one sentence preferred).

## Response field

Each recommendation item includes:

```json
{
  "explanation": "Recommended because it matches your interest in walking and is suitable for beginners."
}
```

The recommendations page also has a static **“Why these products?”** section explaining the overall method in one short paragraph (not per-product).

## Forbidden

- Long technical specs as explanation text
- Vague marketing (“best in class”) without a rule trigger
- LLM-generated free text in MVP
