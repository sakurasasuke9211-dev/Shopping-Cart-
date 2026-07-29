# Phase 02 — Inventory & Data

Model the sports equipment catalog and build a resilient ingestion pipeline: Google Sheets primary, local JSON/CSV/Excel fallback.

## Goals

- Define a canonical `Product` schema used by API and recommendation engine.
- Load inventory from Google Sheets when available.
- Fall back to local files without changing downstream consumers.
- Clean, normalize, and exclude invalid / inactive / out-of-stock items from recommendations.

## Canonical product fields

| Field | Type | Notes |
|-------|------|-------|
| `productId` | string | Stable unique ID |
| `name` | string | Display name |
| `brand` | string | |
| `sport` | string \| string[] | Primary sport; may list multiple |
| `category` | enum | Equipment, Clothing, Footwear, Accessories, Support, Fitness technology |
| `subcategory` | string | Used for diversity caps |
| `ageGroup` | enum | `45-55` \| `55+` \| `all-45+` |
| `experienceLevel` | enum | Beginner \| Intermediate \| Experienced \| All |
| `price` | number | |
| `priceRange` | enum | Low \| Medium \| High |
| `stockQuantity` | number | |
| `rating` | number | 0–5 |
| `reviewCount` | number | |
| `description` | string | Plain language |
| `benefits` | string[] | From benefit tag vocabulary |
| `tags` | string[] | Free-form + controlled tags |
| `images` | string[] | Real URLs preferred; empty/`example.com` → category stock photo at normalize |
| `sizes` | string[] | Optional |
| `colors` | string[] | Optional |
| `active` | boolean | Inactive products removed from catalog views used for recs |
| `featured` | boolean | Scoring bonus |

## Controlled vocabularies

Aligned with Problem Statement §7:

- **Sports:** Walking, Trekking, Hiking, Badminton, Table Tennis, Yoga, Pickleball, Golf, Paddleball, Camping, Cycling
- **Categories:** Equipment, Clothing, Footwear, Accessories, Support, Fitness technology
- **Age:** Age 45–55, Age 55+, Suitable for all users aged 45+
- **Price:** Low / Medium / High budget
- **Benefits:** Lightweight, Beginner-friendly, Easy to use, High cushioning, Wide fit, Low impact, Portable, Ergonomic grip, Non-slip, Adjustable, Compact, Comfort-focused, Weather-resistant
- **Accessories:** Water bottle, Fitness watch, Knee support, Cap, Gloves, Socks, Backpack, Protective gear, Hydration, Recovery

Normalization maps synonyms (e.g. `table-tennis` → `Table Tennis`) during ingest.

## Ingestion architecture

```text
                    ┌──────────────────┐
                    │ InventoryService │
                    └────────┬─────────┘
                             │ try
                    ┌────────▼─────────┐
                    │  SheetsLoader    │── success ──► normalize → cache
                    └────────┬─────────┘
                             │ fail / unavailable
                    ┌────────▼─────────┐
                    │  FileLoader      │
                    │  json → csv → xlsx
                    └────────┬─────────┘
                             ▼
                      normalize → cache
```

### Cleaning rules

1. Drop rows missing `productId`, `name`, or `price`.
2. Drop `active === false`.
3. Standardize sport / category / age / experience strings.
4. Deduplicate by `productId` (last write wins) and optional name+brand collision warnings.
5. Mark `stockQuantity <= 0` as unavailable — **excluded from recommendations** (may still appear in direct product fetch with “out of stock”).

## Local data artifacts

```text
data/
├── inventory.json
├── inventory.csv
└── inventory.xlsx
```

Seed data should cover all sports and categories needed to demo recommendations for 45+ users.

## Services

| Module | Responsibility |
|--------|----------------|
| `sheetsLoader` | Auth + read range → raw rows |
| `fileLoader` | Detect format, parse to raw rows |
| `normalize` | Map raw → `Product`, apply cleaning |
| `inventoryService` | Cache, refresh, `getAll` / `getById` / `getEligible` |

## Non-goals

- Write-back to Google Sheets
- Full admin CMS
- Real-time multi-writer sync

## Exit criteria

- [x] Schema documented and shared types exist.
- [x] Loader returns normalized products from at least JSON fallback.
- [x] Sheets path implemented or clearly stubbed with feature flag.
- [x] Out-of-stock and inactive products excluded from recommendation candidate set.
- [x] Sample inventory covers multiple sports and benefit tags.

## Next phase

→ [Phase 03 — Backend API](../phase-03-backend-api/)
