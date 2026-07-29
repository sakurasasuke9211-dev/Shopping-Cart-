export type AgeGroup = "45-55" | "55+" | "all-45+";

export type UserAgeGroup = "45-55" | "55+";

export type ExperienceLevel =
  | "Beginner"
  | "Intermediate"
  | "Experienced"
  | "All";

export type UserExperienceLevel =
  | "Beginner"
  | "Intermediate"
  | "Experienced";

export type ProductCategory =
  | "Equipment"
  | "Clothing"
  | "Footwear"
  | "Accessories"
  | "Support"
  | "Fitness technology";

export type PriceRange = "Low" | "Medium" | "High";

export interface Product {
  productId: string;
  name: string;
  brand: string;
  sport: string[];
  category: ProductCategory;
  subcategory: string;
  ageGroup: AgeGroup;
  experienceLevel: ExperienceLevel;
  price: number;
  priceRange: PriceRange;
  stockQuantity: number;
  rating: number;
  reviewCount: number;
  description: string;
  benefits: string[];
  tags: string[];
  images: string[];
  sizes?: string[];
  colors?: string[];
  active: boolean;
  featured: boolean;
}

export type InventorySource = "sheets" | "json" | "csv" | "xlsx";

export interface InventoryLoadResult {
  source: InventorySource;
  loadedAt: string;
  productCount: number;
  products: Product[];
  warnings: string[];
}
