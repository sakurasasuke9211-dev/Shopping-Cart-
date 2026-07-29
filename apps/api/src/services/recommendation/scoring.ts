import type {
  Product,
  ProductCategory,
  ScoreBreakdown,
  UserPreferences,
} from "@sports-shop/shared";
import { SCORING_WEIGHTS } from "@sports-shop/shared";
import {
  hasBenefitSignal,
  productMatchesPrimarySport,
  sportEquals,
} from "./hardFilters.js";

function asTypes(productType: UserPreferences["productType"]): ProductCategory[] {
  return Array.isArray(productType) ? productType : [productType];
}

function matchesProductType(
  category: ProductCategory,
  productType: UserPreferences["productType"],
): boolean {
  return asTypes(productType).includes(category);
}

function intersectsSports(productSports: string[], targets: string[]): boolean {
  return targets.some((target) =>
    productSports.some((sport) => sportEquals(sport, target)),
  );
}

export function scoreProduct(
  product: Product,
  preferences: UserPreferences,
): { total: number; breakdown: ScoreBreakdown } {
  const breakdown: ScoreBreakdown = {
    sport: 0,
    age: 0,
    experience: 0,
    productType: 0,
    budget: 0,
    benefit: 0,
    rating: 0,
    featured: 0,
  };

  if (productMatchesPrimarySport(product, preferences)) {
    breakdown.sport = SCORING_WEIGHTS.primarySport;
  } else if (intersectsSports(product.sport, preferences.additionalSports)) {
    breakdown.sport = SCORING_WEIGHTS.additionalSport;
  }

  if (product.ageGroup === preferences.ageGroup) {
    breakdown.age = SCORING_WEIGHTS.exactAgeGroup;
  } else if (product.ageGroup === "all-45+") {
    breakdown.age = SCORING_WEIGHTS.allAge45Plus;
  }

  if (product.experienceLevel === preferences.experienceLevel) {
    breakdown.experience = SCORING_WEIGHTS.exactExperience;
  }

  if (matchesProductType(product.category, preferences.productType)) {
    breakdown.productType = SCORING_WEIGHTS.productType;
  }

  if (
    product.price >= preferences.budgetMin &&
    product.price <= preferences.budgetMax
  ) {
    breakdown.budget = SCORING_WEIGHTS.withinBudget;
  }

  if (
    preferences.experienceLevel === "Beginner" &&
    hasBenefitSignal(product, [
      "beginner-friendly",
      "beginner friendly",
      "beginner",
      "starter",
    ])
  ) {
    breakdown.benefit += SCORING_WEIGHTS.beginnerFriendly;
  }

  if (
    preferences.ageGroup === "55+" &&
    hasBenefitSignal(product, ["lightweight", "light-weight", "light weight"])
  ) {
    breakdown.benefit += SCORING_WEIGHTS.lightweightFor55Plus;
  }

  if (
    preferences.ageGroup === "55+" &&
    hasBenefitSignal(product, ["easy to use", "easy-to-use", "easy use"])
  ) {
    breakdown.benefit += SCORING_WEIGHTS.easyToUseFor55Plus;
  }

  if (
    hasBenefitSignal(product, [
      "comfort-focused",
      "comfort focused",
      "comfort",
      "cushion",
    ])
  ) {
    breakdown.benefit += SCORING_WEIGHTS.comfortFocused;
  }

  let preferredBonus = 0;
  for (const preferred of preferences.preferredBenefits) {
    if (preferredBonus >= SCORING_WEIGHTS.preferredBenefitCap) break;
    if (hasBenefitSignal(product, [preferred])) {
      preferredBonus = Math.min(
        SCORING_WEIGHTS.preferredBenefitCap,
        preferredBonus + SCORING_WEIGHTS.preferredBenefit,
      );
    }
  }
  breakdown.benefit += preferredBonus;

  if (product.rating >= 4) {
    breakdown.rating = SCORING_WEIGHTS.highRating;
  }

  if (product.featured) {
    breakdown.featured = SCORING_WEIGHTS.featured;
  }

  const total = Object.values(breakdown).reduce((sum, value) => sum + value, 0);
  return { total, breakdown };
}

export function compareScored(
  a: { score: number; product: Product },
  b: { score: number; product: Product },
): number {
  if (b.score !== a.score) return b.score - a.score;
  if (b.product.rating !== a.product.rating) {
    return b.product.rating - a.product.rating;
  }
  if (a.product.price !== b.product.price) {
    return a.product.price - b.product.price;
  }
  return a.product.productId.localeCompare(b.product.productId);
}
