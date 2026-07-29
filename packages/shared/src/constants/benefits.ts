export const PRODUCT_BENEFITS = [
  "Lightweight",
  "Beginner-friendly",
  "Easy to use",
  "High cushioning",
  "Wide fit",
  "Low impact",
  "Portable",
  "Ergonomic grip",
  "Non-slip",
  "Adjustable",
  "Compact",
  "Comfort-focused",
  "Weather-resistant",
] as const;

export type ProductBenefit = (typeof PRODUCT_BENEFITS)[number];
