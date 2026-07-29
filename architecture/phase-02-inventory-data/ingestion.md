# Phase 02 — Ingestion pipeline

## Sequence

```text
App start / refresh
        │
        ▼
config.inventory.preferSheets?
        │
   yes  │  no
        ▼
 SheetsLoader.authenticate()
        │
        ├─ OK → fetch rows → parse
        └─ ERR → FileLoader
                    │
                    ├─ inventory.json
                    ├─ else inventory.csv
                    └─ else inventory.xlsx
        │
        ▼
 normalizeProducts(rawRows)
        │
        ├─ map columns
        ├─ standardize enums
        ├─ split multi-value fields
        ├─ drop invalid / inactive
        └─ collect warnings
        │
        ▼
 InventoryCache.set(products, meta)
```

## Normalization details

| Raw issue | Handling |
|-----------|----------|
| Unknown sport string | Warning + drop sport from list; keep product if ≥1 valid sport remains |
| Empty category | Drop product |
| Price as currency string (`₹1,299`) | Strip symbols/commas → number |
| Duplicate `productId` | Keep last; warn |
| Missing / `example.com` image | Replace with category stock photo (`productImages.ts`) |
| `stockQuantity` blank | Treat as `0` |

## Image URLs

- Multi-image cells use `|` only (never `/`) so `https://` URLs stay intact — see `splitImageValues` in `normalize.ts`.
- Prefer named columns (`images`, `image`, …); else spreadsheet **column Q** (`__col_Q`).
- **Usable URL rule:** keep `http(s)://` hosts that are not `example.com` / `localhost`, and local paths starting with `/`.
- **Empty or placeholder (e.g. `https://example.com/images/...`) cells** are replaced during normalize with a **category stock photo** (Unsplash) so cards and PDP always show a real image in demos.
- True missing/failed loads on the web fall back to `/placeholder-product.svg` via `ProductImage` (`referrerPolicy="no-referrer"` so CDN/hotlink-protected URLs can still render).

Catalog authors should put real CDN or Drive view URLs in the sheet when ready; placeholders are demo-only.

## Recommendation eligibility view

```ts
function getRecommendationCandidates(products: Product[]): Product[] {
  return products.filter(
    (p) => p.active && p.stockQuantity > 0
  );
}
```

Catalog browse (`GET /api/products`) may include out-of-stock items with an availability flag; recommendation path must not.

## Refresh strategy

- Load once at API boot.
- Optional `POST /api/admin/inventory/reload` (dev/admin only) or TTL refresh (e.g. 15 minutes).
- Log `source` and `productCount` after every load.

## Error policy

| Failure | Behavior |
|---------|----------|
| Sheets timeout / auth error | Automatic file fallback |
| All loaders fail | API health degraded; recommendation endpoints return `503` with clear message |
| Partial bad rows | Skip bad rows; continue; surface warnings in logs |
