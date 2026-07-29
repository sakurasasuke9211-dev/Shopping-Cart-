import type {
  Product,
  RecommendationProduct,
  RecommendationResult,
  ScoredRecommendation,
  UserPreferences,
} from "@sports-shop/shared";
import { RECOMMENDATION_LIMITS } from "@sports-shop/shared";
import {
  assertInventoryReady,
  getRecommendationCandidates,
} from "../inventory/inventoryService.js";
import { applyDiversity } from "./diversity.js";
import { buildExplanation } from "./explanations.js";
import {
  applyAccessoryFilters,
  applyHardFilters,
  productMatchesProductType,
} from "./hardFilters.js";
import { compareScored, scoreProduct } from "./scoring.js";

function toRecommendationProduct(product: Product): RecommendationProduct {
  return {
    ...product,
    availability:
      product.active && product.stockQuantity > 0 ? "in_stock" : "out_of_stock",
  };
}

function scoreAndSort(
  products: Product[],
  preferences: UserPreferences,
): Omit<ScoredRecommendation, "explanation">[] {
  return products
    .map((product) => {
      const { total, breakdown } = scoreProduct(product, preferences);
      return {
        product: toRecommendationProduct(product),
        score: total,
        breakdown,
      };
    })
    .sort(compareScored);
}

function withExplanations(
  items: Omit<ScoredRecommendation, "explanation">[],
  preferences: UserPreferences,
  options: { isAccessory?: boolean; fallbackUsed?: boolean },
): ScoredRecommendation[] {
  return items.map((item) => ({
    ...item,
    explanation: buildExplanation(
      preferences,
      item.product,
      item.breakdown,
      options,
    ),
  }));
}

function selectCandidates(
  inventory: Product[],
  preferences: UserPreferences,
): { products: Product[]; fallbackUsed: boolean; message: string | null } {
  const strict = applyHardFilters(inventory, preferences, {
    requireProductType: true,
  });
  if (strict.length > 0) {
    return { products: strict, fallbackUsed: false, message: null };
  }

  const relaxedBudget = applyHardFilters(inventory, preferences, {
    requireProductType: true,
    relaxBudgetPercent: 20,
  });
  if (relaxedBudget.length > 0) {
    return {
      products: relaxedBudget,
      fallbackUsed: true,
      message:
        "No exact matches were found, so here are close alternatives within a similar budget.",
    };
  }

  const relaxedExperience = applyHardFilters(inventory, preferences, {
    requireProductType: true,
    relaxBudgetPercent: 20,
    relaxExperience: true,
  });
  if (relaxedExperience.length > 0) {
    return {
      products: relaxedExperience,
      fallbackUsed: true,
      message:
        "No exact matches were found, so here are the closest alternatives we could find.",
    };
  }

  // Last resort: ignore product type but keep sport/age/budget soft filters
  const broadened = applyHardFilters(inventory, preferences, {
    requireProductType: false,
    relaxBudgetPercent: 20,
    relaxExperience: true,
  });
  if (broadened.length > 0) {
    return {
      products: broadened,
      fallbackUsed: true,
      message:
        "No exact matches were found for your product type, so here are related options.",
    };
  }

  return {
    products: [],
    fallbackUsed: true,
    message:
      "No suitable products were found. Try refining your sport, budget, or product type.",
  };
}

export async function getRecommendations(
  preferences: UserPreferences,
): Promise<RecommendationResult> {
  assertInventoryReady();

  const inventory = getRecommendationCandidates();
  const selected = selectCandidates(inventory, preferences);
  const scoredTyped = scoreAndSort(selected.products, preferences);

  const primaryPool = selected.fallbackUsed
    ? scoredTyped
    : scoredTyped.filter((item) =>
        productMatchesProductType(item.product, preferences),
      );

  const primary = applyDiversity(
    withExplanations(primaryPool, preferences, {
      fallbackUsed: selected.fallbackUsed,
    }),
    RECOMMENDATION_LIMITS.primary,
  );

  const usedIds = new Set(primary.map((item) => item.product.productId));

  const additionalPool = scoredTyped.filter(
    (item) => !usedIds.has(item.product.productId),
  );
  const additional = applyDiversity(
    withExplanations(additionalPool, preferences, {
      fallbackUsed: selected.fallbackUsed,
    }),
    RECOMMENDATION_LIMITS.additional,
    { excludeProductIds: usedIds },
  );

  for (const item of additional) {
    usedIds.add(item.product.productId);
  }

  const accessoryProducts = applyAccessoryFilters(inventory, preferences, {
    relaxBudgetPercent: selected.fallbackUsed ? 20 : 0,
    relaxExperience: selected.fallbackUsed,
  }).filter((product) => !usedIds.has(product.productId));

  const scoredAccessories = scoreAndSort(accessoryProducts, preferences);
  const accessories = applyDiversity(
    withExplanations(scoredAccessories, preferences, {
      isAccessory: true,
      fallbackUsed: false,
    }),
    RECOMMENDATION_LIMITS.accessories,
    { excludeProductIds: usedIds },
  );

  return {
    primary,
    additional,
    accessories,
    meta: {
      candidateCount: selected.products.length,
      fallbackUsed: selected.fallbackUsed,
      message: selected.message,
    },
  };
}
