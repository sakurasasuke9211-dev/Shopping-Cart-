# Phase 05 — Questionnaire design



## Step machine



```text

idle → age → primarySport → additionalSports → productType

     → experience → budget → benefits → submitting → done | error

         ↘ Skip this step (any step) ───────────────→ next step (keep other answers)

         ↘ Skip All ────────────────────────────────→ /browse

```



## Skip controls (both grey / secondary)



### Skip All



- Labeled **Skip All** (not “Skip to all products”).

- Always visible; does not require validation.

- Navigates to All Products browse (`/browse`) and does not call `POST /api/recommendations`.

- Existing preferences (if any) left unchanged (MVP).



### Skip this step



- Labeled **Skip this step**.

- Styled as a **grey** control (`btn--muted`), not the navy primary/secondary CTAs — so guests clearly see it as optional.

- Clears any selection on the **current** question only, then advances to the **next** question without validation.

- Does **not** discard answers already given on other steps.

- Lets the guest answer only what they deem necessary.

- On the last step, Skip this step clears the last question and attempts finish (see below).



## Finish behavior (Next / Show my recommendations / Skip this step on last step)



| Guest state | Destination |

|-------------|-------------|

| At least one field answered (others may be skipped) | `POST /api/recommendations` → `/recommendations` |

| No fields answered | `/browse` (All Products) |

| **Skip All** | `/browse` (All Products) |



Skipped required fields receive **soft defaults** so the API still receives a complete `UserPreferences` payload while answered fields drive personalization:



| Skipped field | Soft default |

|---------------|--------------|

| Age group | `55+` |

| Primary sport | First additional sport if any, else `Walking` |

| Product type | All catalog categories |

| Experience | `Beginner` |

| Budget | `$0 – $600` |

| Benefits / additional sports | Empty arrays |



Guests can refine any defaulted field on the recommendations [Filter band](./browse-filters.md).



## Field validation (when using Next on the *current* step)



| Step | Validation on **Next** |

|------|-------------------------|

| Age | Required to leave this step via Next (or Skip this step) |

| Primary sport | Required via Next |

| Additional sports | Optional; cannot duplicate primary; soft max e.g. 3 |

| Product type | At least one via Next |

| Experience | Required via Next |

| Budget | `budgetMax >= budgetMin`; presets available |

| Benefits | Optional |



Finish no longer requires every step to have been answered — only that the guest selected something somewhere (or uses Skip All for the catalog).



## Accessibility



- Each step is a single `fieldset` with a visible `legend` (the question).

- Focus moves to the question heading on step change.

- Errors announced with text, not color alone.

- Keyboard: Tab order linear; Enter submits Next when valid.

- Action row: **Back** · **Skip this step** · **Skip All** · **Next** / **Show my recommendations** — all text-labeled, ≥48px.



## Copy tone



Questions should be short, e.g.:



- “Which age group are you in?”

- “Which sport do you want equipment for?”

- “What is your experience level?”



Avoid jargon and multi-clause instructions.



## After complete



Completed (or partial-with-defaults) answers populate the left [Filter band](./browse-filters.md) on the recommendations page so the guest can change any dimension without redoing the full overlay (unless they choose **Refine preferences**).

