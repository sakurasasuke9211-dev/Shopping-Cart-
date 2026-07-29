import type { InventoryLoadResult, Product } from "@sports-shop/shared";
import { config } from "../../config.js";
import { AppError } from "../../middleware/errorHandler.js";
import { tryLoadFromFallbackPaths } from "./fileLoader.js";
import { tryLoadFromSheets } from "./sheetsLoader.js";

let cache: InventoryLoadResult | null = null;
let refreshTimer: NodeJS.Timeout | null = null;

function logLoad(result: InventoryLoadResult): void {
  console.info("[inventory]", {
    source: result.source,
    productCount: result.productCount,
    warningCount: result.warnings.length,
    preferSheets: config.inventory.preferSheets,
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

export async function loadInventory(): Promise<InventoryLoadResult> {
  const fallbackPaths = config.inventory.fallbackPaths;
  let result: InventoryLoadResult | null = null;
  const warnings: string[] = [];

  if (config.inventory.preferSheets || config.inventory.sheets.spreadsheetId) {
    result = await tryLoadFromSheets();
    if (!result) {
      warnings.push(
        "Google Sheets unavailable or failed; using local fallback.",
      );
    }
  }

  if (!result) {
    result = await tryLoadFromFallbackPaths(fallbackPaths);
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

function scheduleRefresh(): void {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }

  const { refreshMs } = config.inventory;
  if (refreshMs <= 0) return;

  refreshTimer = setInterval(() => {
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
