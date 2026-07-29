import type {
  Product,
  ScoreBreakdown,
  UserPreferences,
} from "@sports-shop/shared";
import {
  hasBenefitSignal,
  productMatchesPrimarySport,
  sportEquals,
} from "./hardFilters.js";

export function buildExplanation(
  preferences: UserPreferences,
  product: Product,
  breakdown: ScoreBreakdown,
  options: { isAccessory?: boolean; fallbackUsed?: boolean } = {},
): string {
  if (options.fallbackUsed) {
    return "No exact match was found, so here is a close alternative within a similar budget.";
  }

  if (options.isAccessory) {
    return "Recommended as an accessory to support your selected sport.";
  }

  const primarySport = preferences.primarySport;
  const isBeginner = preferences.experienceLevel === "Beginner";
  const primarySportMatch = productMatchesPrimarySport(product, preferences);
  const additionalMatch = preferences.additionalSports.find((sport) =>
    product.sport.some((value) => sportEquals(value, sport)),
  );

  // Priority: sport+beginner > 55+ ease > budget+comfort > multi-sport > high rating > age > generic
  if (primarySportMatch && isBeginner && breakdown.sport >= 40) {
    return `Recommended because it matches your interest in ${primarySport.toLowerCase()} and is suitable for beginners.`;
  }

  const lightweight = hasBenefitSignal(product, [
    "lightweight",
    "light-weight",
    "light weight",
  ]);
  const easy = hasBenefitSignal(product, [
    "easy to use",
    "easy-to-use",
    "easy use",
  ]);
  if (preferences.ageGroup === "55+" && lightweight && easy) {
    return "A lightweight and easy-to-use option for users aged 55+.";
  }

  if (breakdown.budget > 0 && breakdown.benefit > 0) {
    const comfort = hasBenefitSignal(product, [
      "comfort-focused",
      "comfort focused",
      "comfort",
      "cushion",
    ]);
    if (comfort) {
      return "Fits your selected budget and provides comfort-focused features.";
    }
  }

  if (primarySportMatch && additionalMatch) {
    return `Suitable for both ${primarySport.toLowerCase()} and ${additionalMatch.toLowerCase()}.`;
  }

  if (breakdown.rating > 0 && (primarySportMatch || additionalMatch)) {
    const sport = primarySportMatch
      ? primarySport
      : (additionalMatch ?? primarySport);
    return `A highly rated option that matches your interest in ${sport.toLowerCase()}.`;
  }

  if (breakdown.age >= 20) {
    return "Chosen because it is designed for your age group.";
  }

  if (primarySportMatch) {
    return `Recommended because it matches your interest in ${primarySport.toLowerCase()}.`;
  }

  if (additionalMatch) {
    return `Recommended because it fits your interest in ${additionalMatch.toLowerCase()}.`;
  }

  return "Recommended based on your selected preferences.";
}
