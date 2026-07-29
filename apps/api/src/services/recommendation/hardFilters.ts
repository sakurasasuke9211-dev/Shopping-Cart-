import type { Product, ProductCategory, UserPreferences } from "@sports-shop/shared";

export interface HardFilterOptions {
  relaxBudgetPercent?: number;
  relaxExperience?: boolean;
  requireProductType?: boolean;
}

function asTypes(productType: UserPreferences["productType"]): ProductCategory[] {
  return Array.isArray(productType) ? productType : [productType];
}

export function sportEquals(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

export function productMatchesSport(
  product: Product,
  preferences: UserPreferences,
): boolean {
  if (product.sport.some((sport) => sportEquals(sport, preferences.primarySport))) {
    return true;
  }
  return preferences.additionalSports.some((sport) =>
    product.sport.some((value) => sportEquals(value, sport)),
  );
}

export function productMatchesPrimarySport(
  product: Product,
  preferences: UserPreferences,
): boolean {
  return product.sport.some((sport) =>
    sportEquals(sport, preferences.primarySport),
  );
}

export function productMatchesProductType(
  product: Product,
  preferences: UserPreferences,
): boolean {
  const types = asTypes(preferences.productType);
  return types.includes(product.category);
}

export function productMatchesAge(
  product: Product,
  preferences: UserPreferences,
): boolean {
  return (
    product.ageGroup === preferences.ageGroup || product.ageGroup === "all-45+"
  );
}

export function hasBenefitSignal(product: Product, phrases: string[]): boolean {
  const blob = [...product.benefits, ...product.tags, product.description]
    .join(" ")
    .toLowerCase();
  return phrases.some((phrase) => blob.includes(phrase.toLowerCase()));
}

export function isBeginnerFriendly(product: Product): boolean {
  return hasBenefitSignal(product, [
    "beginner-friendly",
    "beginner friendly",
    "beginner",
    "easy to use",
    "easy-to-use",
    "starter",
  ]);
}

export function productMatchesExperience(
  product: Product,
  preferences: UserPreferences,
  relaxExperience = false,
): boolean {
  if (product.experienceLevel === "All") return true;
  if (product.experienceLevel === preferences.experienceLevel) return true;
  if (
    preferences.experienceLevel === "Beginner" &&
    isBeginnerFriendly(product)
  ) {
    return true;
  }
  return relaxExperience;
}

export function productMatchesBudget(
  product: Product,
  preferences: UserPreferences,
  relaxBudgetPercent = 0,
): boolean {
  const pad =
    relaxBudgetPercent > 0
      ? ((preferences.budgetMax - preferences.budgetMin) * relaxBudgetPercent) /
          100 ||
        preferences.budgetMax * (relaxBudgetPercent / 100)
      : 0;
  const min = Math.max(0, preferences.budgetMin - pad);
  const max = preferences.budgetMax + pad;
  return product.price >= min && product.price <= max;
}

export function isAccessoryProduct(product: Product): boolean {
  if (product.category === "Accessories" || product.category === "Support") {
    return true;
  }
  return hasBenefitSignal(product, [
    "accessory",
    "water bottle",
    "knee support",
    "recovery",
    "backpack",
    "hydration",
    "gloves",
    "socks",
    "cap",
  ]);
}

/** Core eligibility for recommendation candidates (sport/age/experience/budget). */
export function applyHardFilters(
  products: Product[],
  preferences: UserPreferences,
  options: HardFilterOptions = {},
): Product[] {
  const {
    relaxBudgetPercent = 0,
    relaxExperience = false,
    requireProductType = false,
  } = options;

  return products.filter((product) => {
    if (!(product.active && product.stockQuantity > 0)) return false;
    if (!productMatchesSport(product, preferences)) return false;
    if (!productMatchesAge(product, preferences)) return false;
    if (!productMatchesExperience(product, preferences, relaxExperience)) {
      return false;
    }
    if (!productMatchesBudget(product, preferences, relaxBudgetPercent)) {
      return false;
    }
    if (requireProductType && !productMatchesProductType(product, preferences)) {
      return false;
    }
    return true;
  });
}

export function applyAccessoryFilters(
  products: Product[],
  preferences: UserPreferences,
  options: HardFilterOptions = {},
): Product[] {
  return applyHardFilters(products, preferences, {
    ...options,
    requireProductType: false,
  }).filter(isAccessoryProduct);
}
