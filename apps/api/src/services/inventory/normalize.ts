import type {
  AgeGroup,
  ExperienceLevel,
  PriceRange,
  Product,
  ProductCategory,
} from "@sports-shop/shared";
import { PRODUCT_CATEGORIES, SPORTS } from "@sports-shop/shared";
import { resolveProductImages } from "./productImages.js";

export type RawInventoryRow = Record<string, string>;

const CANONICAL_SPORTS = new Set<string>(SPORTS);

const SPORT_ALIASES: Record<string, string> = {
  walking: "Walking",
  trekking: "Trekking",
  hiking: "Hiking",
  badminton: "Badminton",
  "table tennis": "Table Tennis",
  "table-tennis": "Table Tennis",
  tabletennis: "Table Tennis",
  yoga: "Yoga",
  pickleball: "Pickleball",
  golf: "Golf",
  paddleball: "Paddleball",
  camping: "Camping",
  cycling: "Cycling",
  fitness: "Fitness",
  running: "Running",
  pilates: "Pilates",
  swimming: "Swimming",
  "strength training": "Strength Training",
  physiotherapy: "Physiotherapy",
  rehabilitation: "Rehabilitation",
  "indoor sports": "Indoor Sports",
  "indoor fitness": "Indoor Fitness",
  "water aerobics": "Water Aerobics",
  "tai chi": "Tai Chi",
  tennis: "Tennis",
};

const CATEGORY_ALIASES: Record<string, ProductCategory> = {
  equipment: "Equipment",
  clothing: "Clothing",
  apparel: "Clothing",
  footwear: "Footwear",
  accessories: "Accessories",
  support: "Support",
  "support gear": "Support",
  recovery: "Support",
  "fitness technology": "Fitness technology",
  wearables: "Fitness technology",
  "safety gear": "Accessories",
};

const AGE_ALIASES: Record<string, AgeGroup> = {
  "45-55": "45-55",
  "45–55": "45-55",
  "age 45-55": "45-55",
  "55+": "55+",
  "age 55+": "55+",
  "45+": "all-45+",
  "all adults": "all-45+",
  "all-45+": "all-45+",
  "suitable for all users aged 45+": "all-45+",
};

const EXPERIENCE_ALIASES: Record<string, ExperienceLevel> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  experienced: "Experienced",
  advanced: "Experienced",
  all: "All",
  "all levels": "All",
};

const PRICE_ALIASES: Record<string, PriceRange> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  "low budget": "Low",
  "medium budget": "Medium",
  "high budget": "High",
};

function keyOf(value: string): string {
  return value.trim().toLowerCase();
}

function getField(row: RawInventoryRow, ...names: string[]): string {
  const entries = Object.entries(row);
  for (const name of names) {
    const wanted = keyOf(name);
    const match = entries.find(([k]) => keyOf(k) === wanted);
    if (match && match[1] !== undefined && match[1] !== null) {
      return String(match[1]).trim();
    }
  }
  return "";
}

export function splitMultiValue(value: string): string[] {
  if (!value.trim()) return [];
  // Do not split on "/" — that breaks https:// URLs and paths.
  return value
    .split(/[|;]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

/** Image URLs from column Q — only pipe/semicolon separate multiple images. */
export function splitImageValues(value: string): string[] {
  if (!value.trim()) return [];
  return value
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => part.replace(/[;,]+$/g, "").trim())
    .filter(Boolean);
}

/**
 * Prefer named image fields, then spreadsheet column Q (0-based index 16).
 */
export function getImagesRaw(row: RawInventoryRow): string {
  const named = getField(
    row,
    "images",
    "image",
    "product images",
    "image url",
    "image urls",
    "imageurl",
    "img",
    "photo",
    "q",
  );
  if (named) return named;

  const colQ = row.__col_Q ?? row.col_Q ?? row.Q;
  if (colQ != null && String(colQ).trim()) return String(colQ).trim();

  return "";
}

export function parsePrice(raw: string): number | null {
  if (!raw.trim()) return null;
  const cleaned = raw.replace(/[^0-9.\-]/g, "");
  if (!cleaned) return null;
  const value = Number.parseFloat(cleaned);
  return Number.isFinite(value) ? value : null;
}

export function parseBoolean(raw: string, fallback = true): boolean {
  if (!raw.trim()) return fallback;
  const value = keyOf(raw);
  if (["true", "1", "yes", "y"].includes(value)) return true;
  if (["false", "0", "no", "n"].includes(value)) return false;
  return fallback;
}

export function parseNumber(raw: string, fallback = 0): number {
  if (!raw.trim()) return fallback;
  const value = Number.parseFloat(raw.replace(/,/g, ""));
  return Number.isFinite(value) ? value : fallback;
}

function normalizeSport(raw: string): string {
  const alias = SPORT_ALIASES[keyOf(raw)];
  if (alias) return alias;
  // Title-case unknown sports so they remain usable for recommendations.
  return raw
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function normalizeCategory(raw: string): ProductCategory | null {
  return CATEGORY_ALIASES[keyOf(raw)] ?? null;
}

function normalizeAgeGroup(raw: string): AgeGroup {
  return AGE_ALIASES[keyOf(raw)] ?? "all-45+";
}

function normalizeExperience(values: string[]): ExperienceLevel {
  if (values.length === 0) return "All";
  const mapped = values
    .map((v) => EXPERIENCE_ALIASES[keyOf(v)])
    .filter((v): v is ExperienceLevel => Boolean(v));
  if (mapped.includes("All") || mapped.length === 0) return "All";
  if (mapped.length > 1) return "All";
  return mapped[0] ?? "All";
}

function normalizePriceRange(raw: string, price: number): PriceRange {
  const mapped = PRICE_ALIASES[keyOf(raw)];
  if (mapped) return mapped;
  if (price < 40) return "Low";
  if (price < 100) return "Medium";
  return "High";
}

function inferPriceRange(price: number): PriceRange {
  if (price < 40) return "Low";
  if (price < 100) return "Medium";
  return "High";
}

export function normalizeProducts(rawRows: unknown[]): {
  products: Product[];
  warnings: string[];
} {
  const warnings: string[] = [];
  const byId = new Map<string, Product>();

  rawRows.forEach((raw, index) => {
    if (!raw || typeof raw !== "object") {
      warnings.push(`Row ${index + 1}: skipped (not an object)`);
      return;
    }

    const row = Object.fromEntries(
      Object.entries(raw as Record<string, unknown>).map(([k, v]) => [
        k,
        v == null ? "" : String(v),
      ]),
    ) as RawInventoryRow;

    const productId = getField(row, "productId", "product_id", "id");
    const name = getField(row, "name", "product name", "productName");
    const price = parsePrice(getField(row, "price"));

    if (!productId || !name || price === null) {
      warnings.push(
        `Row ${index + 1}: dropped (missing productId, name, or price)`,
      );
      return;
    }

    const active = parseBoolean(getField(row, "active", "status"), true);
    if (!active) {
      warnings.push(`Row ${index + 1} (${productId}): dropped (inactive)`);
      return;
    }

    const categoryRaw = getField(row, "category", "product category");
    const category = normalizeCategory(categoryRaw);
    if (!category) {
      warnings.push(
        `Row ${index + 1} (${productId}): dropped (unknown category "${categoryRaw}")`,
      );
      return;
    }
    if (!PRODUCT_CATEGORIES.includes(category)) {
      warnings.push(
        `Row ${index + 1} (${productId}): dropped (invalid category)`,
      );
      return;
    }

    const sportParts = splitMultiValue(getField(row, "sport", "sports"));
    const sports = sportParts.map(normalizeSport);
    const unknownSports = sports.filter((s) => !CANONICAL_SPORTS.has(s));
    for (const sport of unknownSports) {
      warnings.push(
        `Row ${index + 1} (${productId}): non-canonical sport kept "${sport}"`,
      );
    }
    if (sports.length === 0) {
      warnings.push(`Row ${index + 1} (${productId}): dropped (no sports)`);
      return;
    }

    const experienceParts = splitMultiValue(
      getField(row, "experienceLevel", "experience", "experience level"),
    );

    if (byId.has(productId)) {
      warnings.push(
        `Duplicate productId "${productId}" — keeping last occurrence`,
      );
    }

    const product: Product = {
      productId,
      name,
      brand: getField(row, "brand") || "Unknown",
      sport: sports,
      category,
      subcategory: getField(row, "subcategory", "product subcategory") || category,
      ageGroup: normalizeAgeGroup(getField(row, "ageGroup", "age group", "age")),
      experienceLevel: normalizeExperience(experienceParts),
      price,
      priceRange: normalizePriceRange(
        getField(row, "priceRange", "price range"),
        price,
      ) || inferPriceRange(price),
      stockQuantity: Math.max(
        0,
        Math.floor(parseNumber(getField(row, "stockQuantity", "stock"), 0)),
      ),
      rating: parseNumber(getField(row, "rating"), 0),
      reviewCount: Math.max(
        0,
        Math.floor(parseNumber(getField(row, "reviewCount", "reviews"), 0)),
      ),
      description: getField(row, "description"),
      benefits: splitMultiValue(getField(row, "benefits", "product benefits")),
      tags: splitMultiValue(getField(row, "tags", "product tags")),
      images: resolveProductImages(
        productId,
        category,
        splitImageValues(getImagesRaw(row)),
      ),
      sizes: splitMultiValue(getField(row, "sizes", "size")),
      colors: splitMultiValue(getField(row, "colors", "color")),
      active: true,
      featured: parseBoolean(getField(row, "featured"), false),
    };

    if (product.sizes?.length === 0) delete product.sizes;
    if (product.colors?.length === 0) delete product.colors;

    byId.set(productId, product);
  });

  return {
    products: [...byId.values()],
    warnings,
  };
}
