# Inventory data

| Path | Role |
|------|------|
| `../database/sports_shopping_cart_product_catalog.csv` | Primary local fallback (demo catalog) |
| `inventory.json` | JSON fallback (generated/synced from demo CSV) |
| `inventory.csv` | CSV copy of the demo catalog |
| `inventory.xlsx` | Excel fallback path supported in code; **no seed file shipped** (optional) |

Load order when Sheets fails: configured fallback path → `inventory.json` → `inventory.csv` → `inventory.xlsx` (if present) → database CSV.
