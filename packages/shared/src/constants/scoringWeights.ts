export const SCORING_WEIGHTS = {
  primarySport: 40,
  additionalSport: 15,
  exactAgeGroup: 20,
  allAge45Plus: 10,
  exactExperience: 15,
  productType: 15,
  withinBudget: 10,
  beginnerFriendly: 10,
  lightweightFor55Plus: 8,
  easyToUseFor55Plus: 8,
  comfortFocused: 6,
  highRating: 5,
  featured: 3,
  /** Extra bonus per matched questionnaire benefit preference (capped). */
  preferredBenefit: 4,
  preferredBenefitCap: 12,
} as const;

export const RECOMMENDATION_LIMITS = {
  primary: 6,
  additional: 4,
  accessories: 3,
  maxPerSubcategory: 3,
  maxPerBrand: 2,
} as const;
