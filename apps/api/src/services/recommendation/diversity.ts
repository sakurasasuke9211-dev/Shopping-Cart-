import type { Product, ScoredRecommendation } from "@sports-shop/shared";
import { RECOMMENDATION_LIMITS } from "@sports-shop/shared";

export function variantKey(product: Product): string {
  return product.name
    .toLowerCase()
    .replace(/\s*[-–—]\s*.*$/u, "")
    .replace(/\b(size|colour|color)\b.*$/iu, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function applyDiversity(
  scored: ScoredRecommendation[],
  limit: number = RECOMMENDATION_LIMITS.primary,
  options: {
    maxPerSubcategory?: number;
    maxPerBrand?: number;
    excludeProductIds?: Set<string>;
  } = {},
): ScoredRecommendation[] {
  const maxPerSubcategory =
    options.maxPerSubcategory ?? RECOMMENDATION_LIMITS.maxPerSubcategory;
  const maxPerBrand = options.maxPerBrand ?? RECOMMENDATION_LIMITS.maxPerBrand;
  const excluded = options.excludeProductIds ?? new Set<string>();

  const selected: ScoredRecommendation[] = [];
  const countsBySubcategory = new Map<string, number>();
  const countsByBrand = new Map<string, number>();
  const seenVariantKeys = new Set<string>();

  for (const item of scored) {
    if (selected.length >= limit) break;

    const { product } = item;
    if (excluded.has(product.productId)) continue;

    const subcategoryCount = countsBySubcategory.get(product.subcategory) ?? 0;
    if (subcategoryCount >= maxPerSubcategory) continue;

    const brandCount = countsByBrand.get(product.brand) ?? 0;
    if (brandCount >= maxPerBrand) continue;

    const key = variantKey(product);
    if (key && seenVariantKeys.has(key)) continue;

    selected.push(item);
    countsBySubcategory.set(product.subcategory, subcategoryCount + 1);
    countsByBrand.set(product.brand, brandCount + 1);
    if (key) seenVariantKeys.add(key);
  }

  return selected;
}
