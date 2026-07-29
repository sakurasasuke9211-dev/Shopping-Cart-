import type { Product } from "@sports-shop/shared";
import { AppError } from "../middleware/errorHandler.js";
import {
  assertInventoryReady,
  getAllProducts,
  getProductById,
} from "./inventory/inventoryService.js";

export type ProductSort =
  | "price_asc"
  | "price_desc"
  | "rating_desc"
  | "name_asc";

export interface ProductListQuery {
  q?: string;
  sport?: string;
  category?: string;
  ageGroup?: string;
  experienceLevel?: string;
  minPrice?: number;
  maxPrice?: number;
  sort: ProductSort;
  page: number;
  pageSize: number;
}

export interface ProductListResult {
  items: Array<Product & { availability: "in_stock" | "out_of_stock" }>;
  page: number;
  pageSize: number;
  total: number;
}

function withAvailability(product: Product) {
  return {
    ...product,
    availability:
      product.active && product.stockQuantity > 0
        ? ("in_stock" as const)
        : ("out_of_stock" as const),
  };
}

export function listProducts(query: ProductListQuery): ProductListResult {
  assertInventoryReady();

  let products = getAllProducts();

  if (query.q) {
    const needle = query.q.toLowerCase();
    products = products.filter((product) => {
      const haystack = [
        product.name,
        product.brand,
        product.description,
        product.subcategory,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }

  if (query.sport) {
    const sport = query.sport.toLowerCase();
    products = products.filter((product) =>
      product.sport.some((value) => value.toLowerCase() === sport),
    );
  }

  if (query.category) {
    products = products.filter((product) => product.category === query.category);
  }

  if (query.ageGroup) {
    products = products.filter(
      (product) =>
        product.ageGroup === query.ageGroup || product.ageGroup === "all-45+",
    );
  }

  if (query.experienceLevel) {
    products = products.filter(
      (product) =>
        product.experienceLevel === query.experienceLevel ||
        product.experienceLevel === "All",
    );
  }

  if (query.minPrice !== undefined) {
    products = products.filter((product) => product.price >= query.minPrice!);
  }

  if (query.maxPrice !== undefined) {
    products = products.filter((product) => product.price <= query.maxPrice!);
  }

  products = [...products].sort((a, b) => {
    switch (query.sort) {
      case "price_asc":
        return a.price - b.price || a.productId.localeCompare(b.productId);
      case "price_desc":
        return b.price - a.price || a.productId.localeCompare(b.productId);
      case "rating_desc":
        return b.rating - a.rating || a.productId.localeCompare(b.productId);
      case "name_asc":
      default:
        return a.name.localeCompare(b.name) || a.productId.localeCompare(b.productId);
    }
  });

  const total = products.length;
  const start = (query.page - 1) * query.pageSize;
  const items = products.slice(start, start + query.pageSize).map(withAvailability);

  return {
    items,
    page: query.page,
    pageSize: query.pageSize,
    total,
  };
}

export function getProductDetail(productId: string) {
  assertInventoryReady();
  const product = getProductById(productId);
  if (!product) {
    throw new AppError(404, "NOT_FOUND", `Product ${productId} was not found.`);
  }
  return withAvailability(product);
}
