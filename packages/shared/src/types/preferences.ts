import type { ProductCategory, UserAgeGroup, UserExperienceLevel } from "./product.js";

export interface UserPreferences {
  ageGroup: UserAgeGroup;
  primarySport: string;
  additionalSports: string[];
  productType: ProductCategory | ProductCategory[];
  experienceLevel: UserExperienceLevel;
  budgetMin: number;
  budgetMax: number;
  preferredBenefits: string[];
}
