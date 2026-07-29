# Phase 02 — Data model

Shared TypeScript shapes (illustrative).

## Product

```ts
type AgeGroup = "45-55" | "55+" | "all-45+";
type ExperienceLevel = "Beginner" | "Intermediate" | "Experienced" | "All";
type ProductCategory =
  | "Equipment"
  | "Clothing"
  | "Footwear"
  | "Accessories"
  | "Support"
  | "Fitness technology";
type PriceRange = "Low" | "Medium" | "High";

interface Product {
  productId: string;
  name: string;
  brand: string;
  sport: string[];
  category: ProductCategory;
  subcategory: string;
  ageGroup: AgeGroup;
  experienceLevel: ExperienceLevel;
  price: number;
  priceRange: PriceRange;
  stockQuantity: number;
  rating: number;
  reviewCount: number;
  description: string;
  benefits: string[];
  tags: string[];
  images: string[];
  sizes?: string[];
  colors?: string[];
  active: boolean;
  featured: boolean;
}
```

## User preferences (from questionnaire)

```ts
interface UserPreferences {
  ageGroup: "45-55" | "55+";
  primarySport: string;
  additionalSports: string[];
  productType: ProductCategory | ProductCategory[];
  experienceLevel: "Beginner" | "Intermediate" | "Experienced";
  budgetMin: number;
  budgetMax: number;
  preferredBenefits: string[];
}
```

## Inventory source metadata

```ts
interface InventoryLoadResult {
  source: "sheets" | "json" | "csv" | "xlsx";
  loadedAt: string; // ISO
  productCount: number;
  products: Product[];
  warnings: string[];
}
```

## Google Sheet column mapping

Suggested header row (order flexible if mapped by name):

`productId | name | brand | sport | category | subcategory | ageGroup | experienceLevel | price | priceRange | stockQuantity | rating | reviewCount | description | benefits | tags | images | sizes | colors | active | featured`

- Multi-value cells (`sport`, `benefits`, `tags`) use `|` or `;` separators; normalize to arrays.
- **`images`:** `|` separates multiple URLs. Do **not** split on `/` (breaks `https://`). Empty or `example.com` placeholders are replaced with category stock photos at ingest (`productImages.ts`).
- Booleans: `TRUE`/`FALSE` or `1`/`0`.
