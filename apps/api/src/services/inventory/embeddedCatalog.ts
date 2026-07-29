import type { InventoryLoadResult } from "@sports-shop/shared";
import embeddedRows from "../../inventory/embeddedRows.json" with { type: "json" };
import { normalizeProducts, type RawInventoryRow } from "./normalize.js";

/** Always bundled with the serverless function — no filesystem required. */
export function loadEmbeddedCatalog(): InventoryLoadResult {
  const { products, warnings } = normalizeProducts(
    embeddedRows as RawInventoryRow[],
  );

  return {
    source: "json",
    loadedAt: new Date().toISOString(),
    productCount: products.length,
    products,
    warnings: ["Loaded embedded product catalog.", ...warnings],
  };
}
