# Phase 04 — Diversity

After scoring, select products greedily from highest score to lowest while enforcing caps.

## Algorithm

```text
sorted = products sorted by score desc, then tie-breakers
selected = []
countsBySubcategory = {}
countsByBrand = {}
seenVariantKeys = {}

for p in sorted:
  if len(selected) >= targetLimit: break
  if countsBySubcategory[p.subcategory] >= 3: continue
  if countsByBrand[p.brand] >= 2: continue
  if seenVariantKeys[variantKey(p)]: continue
  selected.append(p)
  update counts and variant set
```

## Variant key

Normalize name by stripping size/color suffixes and lowercasing, e.g.:

`Trail Soft Walker - Navy / Size 9` → `trail soft walker`

Same key ⇒ treat as duplicate variant.

## Buckets

Run diversity separately (or once then split):

1. **Primary** — non-accessory categories matching product type, top 6 after diversity.
2. **Additional** — next eligible non-duplicates, top 4 (can broaden sports slightly).
3. **Accessories** — category Accessories / Support / accessory tags related to primary sport, top 3.

Do not repeat a `productId` across buckets.

## Cognitive load rule

UI must not request more than these caps; API enforces the same limits even if the client asks for more.
