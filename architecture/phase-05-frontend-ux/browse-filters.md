# Phase 05 — Browse landings & preference filter band

## Purpose

After (or instead of) the questionnaire, guests need a clear catalog path and a way to change the same preference dimensions without reopening the overlay.

## Category landings

Persistent header links (text labels, ≥18px, large hit targets). Landings must cover **every** normalized inventory category so the sum of category pages equals the full catalog:

1. **All Sports** → `/browse` — show **all** products (no artificial page cap for MVP demos; `pageSize` ≥ catalog size, currently 36)
2. **Equipment** → `/browse/Equipment`
3. **Clothing** → `/browse/Clothing` (includes catalog aliases such as Apparel)
4. **Footwear** → `/browse/Footwear`
5. **Accessories** → `/browse/Accessories` (includes Safety Gear)
6. **Support and recovery** → `/browse/Support` (includes Support Gear / Recovery)
7. **Fitness technology** → `/browse/Fitness%20technology` (includes Wearables)

### Landing page content

- Page title matching the nav label (e.g. “Footwear”, “Support and recovery”).
- Short supporting line (one sentence).
- Left Filter band + product grid.
- Large **View product** / **Add to cart** on each card.
- **All Sports** and filtered browse must return the full matching set (do not truncate to 24). Show “Showing N of N” when the full set fits one page.

## Filter band (left)

Shown on:

- Personalized **Recommendations** (after questionnaire complete)
- **Browse** landings (always; prefilled from preferences when present)

### Controls (same order as questionnaire)

| Control | Type | Notes |
|---------|------|-------|
| Age group | Single select | 45–55 / 55+ |
| Primary sport | Single select | From `SPORTS` |
| Additional sports | Multi-select | Optional, capped |
| Product type | Multi-select | All six categories; category landing may lock one |
| Experience | Single select | Beginner / Intermediate / Experienced |
| Budget | Preset bands | Low / Medium / High |
| Benefits | Multi-select chips | Text labels only |

### Age filter on browse (important)

Catalog rows normalize to `all-45+` for “45+” / “All Adults”. When the guest selects **45–55** or **55+**, the API must still include products with `ageGroup === "all-45+"` (suitable for all 45+). Age must not silently hide the majority of the catalog. Truncation at 24 items is a **pagination bug**, not an age rule.

### Interaction

- Changing a control does **not** instantly navigate away; guest presses **Apply filters**.
- On recommendations: Apply → update preferences → `POST /api/recommendations`.
- On browse: Apply → `GET /api/products` with mapped query; **`pageSize` large enough for full catalog** (e.g. 100).
- **Clear filters** resets to category-route defaults (browse) or last questionnaire prefs (recommendations).

### Accessibility

- Band is a `<aside>` with heading “Your preferences” / “Filters”.
- Each group is a `fieldset` + `legend`.
- Controls ≥ 48px; no icon-only apply.
- Stack groups vertically; on narrow viewports, band stacks **above** the grid.

## Skip → browse

- **Skip All** (grey secondary) → `/browse` (All Sports, full catalog). Does not call recommendations.
- See [questionnaire.md](./questionnaire.md) for **Skip this step**.
