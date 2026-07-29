import type { Product } from "./product.js";

export interface ScoreBreakdown {
  sport: number;
  age: number;
  experience: number;
  productType: number;
  budget: number;
  benefit: number;
  rating: number;
  featured: number;
}

export interface RecommendationProduct extends Product {
  availability: "in_stock" | "out_of_stock";
}

export interface ScoredRecommendation {
  product: RecommendationProduct;
  score: number;
  breakdown: ScoreBreakdown;
  explanation: string;
}

export interface RecommendationMeta {
  candidateCount: number;
  fallbackUsed: boolean;
  message: string | null;
}

export interface RecommendationResult {
  primary: ScoredRecommendation[];
  additional: ScoredRecommendation[];
  accessories: ScoredRecommendation[];
  meta: RecommendationMeta;
}
