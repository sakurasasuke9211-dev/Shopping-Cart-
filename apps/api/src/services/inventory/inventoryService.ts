import type { InventoryLoadResult, Product } from "@sports-shop/shared";
import { config } from "../../config.js";
import { AppError } from "../../middleware/errorHandler.js";
import { loadEmbeddedCatalog } from "./embeddedCatalog.js";
import { tryLoadFromFallbackPaths } from "./fileLoader.js";
import { tryLoadFromSheets } from "./sheetsLoader.js";

let cache: InventoryLoadResult | null = null;
let loadingPromise: Promise<InventoryLoadResult> | null = null;
let refreshTimer: NodeJS.Timeout | null = null;

const isVercel = Boolean(process.env.VERCEL);

function logLoad(result: InventoryLoadResult): void {
  console.info("[inventory]", {
    source: result.source,
    productCount: result.productCount,
    warningCount: result.warnings.length,
    preferSheets: config.inventory.preferSheets,
    vercel: isVercel,
  });
  if (result.warnings.length > 0) {
    console.info(
      "[inventory] warnings:",
      result.warnings.slice(0, 20),
      result.warnings.length > 20
        ? `… +${result.warnings.length - 20} more`
        : "",
    );
  }
}

/** Instant sync bootstrap — used on every Vercel cold start before any I/O. */
export function bootstrapEmbeddedInventory(): InventoryLoadResult {
  if (cache && cache.productCount > 0) return cache;
  const result = loadEmbeddedCatalog();
  cache = result;
  logLoad(result);
  return result;
}

async function tryLoadFromFiles(): Promise<InventoryLoadResult | null> {
  try {
    return await tryLoadFromFallbackPaths(config.inventory.fallbackPaths);
  } catch (error) {
    console.warn(
      "[inventory] file fallback failed",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

async function tryLoadSheetsSafe(): Promise<InventoryLoadResult | null> {
  if (isVercel) return null;
  try {
    return await tryLoadFromSheets();
  } catch (error) {
    console.warn(
      "[inventory] sheets load failed",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

async function loadInventoryInternal(): Promise<InventoryLoadResult> {
  const warnings: string[] = [];
  let result: InventoryLoadResult | null = null;

  // Always prefer the compiled-in catalog on Vercel (instant, reliable).
  if (isVercel) {
    result = bootstrapEmbeddedInventory();
    warnings.push("Using embedded catalog on Vercel (Sheets skipped).");
    result = {
      ...result,
      warnings: [...warnings, ...result.warnings],
    };
    cache = result;
    logLoad(result);
    return result;
  }

  if (!result) {
    result = await tryLoadFromFiles();
  }

  if (
    !result &&
    (config.inventory.preferSheets || config.inventory.sheets.spreadsheetId)
  ) {
    result = await tryLoadSheetsSafe();
    if (!result) {
      warnings.push(
        "Google Sheets unavailable or failed; using local fallback.",
      );
    }
  }

  if (!result) {
    result = await tryLoadFromFiles();
  }

  if (!result) {
    result = loadEmbeddedCatalog();
    warnings.push("All remote/file sources failed; using embedded catalog.");
  }

  result = {
    ...result,
    warnings: [...warnings, ...result.warnings],
  };

  cache = result;
  logLoad(result);
  scheduleRefresh();
  return result;
}

export async function loadInventory(): Promise<InventoryLoadResult> {
  if (cache && cache.productCount > 0) return cache;
  if (!loadingPromise) {
    loadingPromise = loadInventoryInternal().catch((error) => {
      loadingPromise = null;
      // Last resort: never leave a Vercel instance without products.
      try {
        return bootstrapEmbeddedInventory();
      } catch {
        throw error;
      }
    });
  }
  return loadingPromise;
}

function scheduleRefresh(): void {
  if (isVercel) return;

  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }

  const { refreshMs } = config.inventory;
  if (refreshMs <= 0) return;

  refreshTimer = setInterval(() => {
    cache = null;
    loadingPromise = null;
    void loadInventory().catch((error) => {
      console.error(
        "[inventory] refresh failed",
        error instanceof Error ? error.message : error,
      );
    });
  }, refreshMs);

  refreshTimer.unref?.();
}

export async function reloadInventory(): Promise<InventoryLoadResult> {
  cache = null;
  loadingPromise = null;
  return loadInventory();
}

export function getInventoryMeta(): Pick<
  InventoryLoadResult,
  "source" | "loadedAt" | "productCount" | "warnings"
> | null {
  if (!cache) return null;
  const { source, loadedAt, productCount, warnings } = cache;
  return { source, loadedAt, productCount, warnings };
}

export function assertInventoryReady(): void {
  if (!cache || cache.productCount === 0) {
    try {
      bootstrapEmbeddedInventory();
    } catch {
      // fall through to error below
    }
  }

  if (!cache || cache.productCount === 0) {
    throw new AppError(
      503,
      "INVENTORY_UNAVAILABLE",
      "Product inventory is unavailable. Please try again shortly.",
    );
  }
}

export function getAllProducts(): Product[] {
  return cache?.products ?? [];
}

export function getProductById(productId: string): Product | undefined {
  return getAllProducts().find((product) => product.productId === productId);
}

export function getRecommendationCandidates(): Product[] {
  return getAllProducts().filter(
    (product) => product.active && product.stockQuantity > 0,
  );
}

export function decrementStock(productId: string, quantity: number): void {
  assertInventoryReady();
  if (!cache) {
    throw new AppError(
      503,
      "INVENTORY_UNAVAILABLE",
      "Product inventory is unavailable. Please try again shortly.",
    );
  }

  const product = cache.products.find((item) => item.productId === productId);
  if (!product) {
    throw new AppError(404, "NOT_FOUND", `Product ${productId} was not found.`);
  }
  if (product.stockQuantity < quantity) {
    throw new AppError(
      409,
      "OUT_OF_STOCK",
      `${product.name} does not have enough stock to complete payment.`,
    );
  }

  product.stockQuantity -= quantity;
}
