export type {
  AgeGroup,
  UserAgeGroup,
  ExperienceLevel,
  UserExperienceLevel,
  ProductCategory,
  PriceRange,
  Product,
  InventorySource,
  InventoryLoadResult,
} from "./types/product.js";

export type { UserPreferences } from "./types/preferences.js";

export type {
  ScoreBreakdown,
  RecommendationProduct,
  ScoredRecommendation,
  RecommendationMeta,
  RecommendationResult,
} from "./types/recommendation.js";

export type {
  CartItem,
  CartLineItem,
  Cart,
  CartView,
} from "./types/cart.js";

export type {
  OrderStatus,
  PaymentStatus,
  ShippingAddress,
  OrderCustomer,
  OrderItem,
  Order,
  Payment,
} from "./types/order.js";

export { SPORTS } from "./constants/sports.js";
export type { Sport } from "./constants/sports.js";

export { PRODUCT_CATEGORIES, ACCESSORY_TAGS } from "./constants/categories.js";

export { PRODUCT_BENEFITS } from "./constants/benefits.js";
export type { ProductBenefit } from "./constants/benefits.js";

export {
  SCORING_WEIGHTS,
  RECOMMENDATION_LIMITS,
} from "./constants/scoringWeights.js";
