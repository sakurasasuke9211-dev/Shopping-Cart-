import type {
  ProductCategory,
  UserAgeGroup,
  UserExperienceLevel,
  UserPreferences,
} from "@sports-shop/shared";

export const BUDGET_PRESETS = [
  { id: "low", label: "Low budget", min: 0, max: 40, hint: "Under $40" },
  { id: "medium", label: "Medium budget", min: 40, max: 100, hint: "$40 – $100" },
  { id: "high", label: "High budget", min: 100, max: 600, hint: "$100+" },
] as const;

export const PRODUCT_TYPE_OPTIONS: Array<{ value: ProductCategory; label: string }> = [
  { value: "Equipment", label: "Equipment" },
  { value: "Clothing", label: "Clothing" },
  { value: "Footwear", label: "Footwear" },
  { value: "Accessories", label: "Accessories" },
  { value: "Support", label: "Support and recovery" },
  { value: "Fitness technology", label: "Fitness technology" },
];

export type PreferenceDraft = {
  ageGroup: UserAgeGroup | null;
  primarySport: string | null;
  additionalSports: string[];
  productTypes: ProductCategory[];
  experienceLevel: UserExperienceLevel | null;
  budgetMin: number | null;
  budgetMax: number | null;
  preferredBenefits: string[];
};

export const emptyPreferenceDraft: PreferenceDraft = {
  ageGroup: null,
  primarySport: null,
  additionalSports: [],
  productTypes: [],
  experienceLevel: null,
  budgetMin: null,
  budgetMax: null,
  preferredBenefits: [],
};

export function draftFromPreferences(
  prefs: UserPreferences | null,
): PreferenceDraft {
  if (!prefs) return { ...emptyPreferenceDraft };
  return {
    ageGroup: prefs.ageGroup,
    primarySport: prefs.primarySport,
    additionalSports: [...prefs.additionalSports],
    productTypes: Array.isArray(prefs.productType)
      ? [...prefs.productType]
      : [prefs.productType],
    experienceLevel: prefs.experienceLevel,
    budgetMin: prefs.budgetMin,
    budgetMax: prefs.budgetMax,
    preferredBenefits: [...prefs.preferredBenefits],
  };
}

/** True when the guest answered at least one questionnaire field. */
export function draftHasAnyAnswers(draft: PreferenceDraft): boolean {
  return Boolean(
    draft.ageGroup ||
      draft.primarySport ||
      draft.additionalSports.length > 0 ||
      draft.productTypes.length > 0 ||
      draft.experienceLevel ||
      draft.budgetMin !== null ||
      draft.budgetMax !== null ||
      draft.preferredBenefits.length > 0,
  );
}

const DEFAULT_PRODUCT_TYPES = PRODUCT_TYPE_OPTIONS.map((option) => option.value);
const DEFAULT_PRIMARY_SPORT = "Walking";
const DEFAULT_AGE_GROUP: UserAgeGroup = "55+";
const DEFAULT_EXPERIENCE: UserExperienceLevel = "Beginner";
const DEFAULT_BUDGET_MIN = 0;
const DEFAULT_BUDGET_MAX = 600;

/**
 * Build preferences for the recommendation API.
 * Skipped fields get soft defaults so partial quizzes still personalize —
 * only a completely empty draft returns null (caller should send guest to /browse).
 */
export function draftToPreferences(
  draft: PreferenceDraft,
): UserPreferences | null {
  if (!draftHasAnyAnswers(draft)) return null;

  const budgetMin = draft.budgetMin ?? DEFAULT_BUDGET_MIN;
  const budgetMax =
    draft.budgetMax ??
    (draft.budgetMin !== null ? Math.max(draft.budgetMin, DEFAULT_BUDGET_MAX) : DEFAULT_BUDGET_MAX);

  const productTypes =
    draft.productTypes.length > 0 ? draft.productTypes : DEFAULT_PRODUCT_TYPES;

  return {
    ageGroup: draft.ageGroup ?? DEFAULT_AGE_GROUP,
    primarySport:
      draft.primarySport ??
      draft.additionalSports[0] ??
      DEFAULT_PRIMARY_SPORT,
    additionalSports: draft.additionalSports,
    productType: productTypes.length === 1 ? productTypes[0]! : productTypes,
    experienceLevel: draft.experienceLevel ?? DEFAULT_EXPERIENCE,
    budgetMin,
    budgetMax: Math.max(budgetMin, budgetMax),
    preferredBenefits: draft.preferredBenefits,
  };
}

export function validateDraftForRecommendations(
  draft: PreferenceDraft,
): string | null {
  if (!draftHasAnyAnswers(draft)) {
    return "Answer at least one question, or choose Skip All to browse everything.";
  }
  if (
    draft.budgetMin !== null &&
    draft.budgetMax !== null &&
    draft.budgetMax < draft.budgetMin
  ) {
    return "Budget maximum must be at least the minimum.";
  }
  return null;
}
