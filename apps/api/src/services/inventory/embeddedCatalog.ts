import type { InventoryLoadResult } from "@sports-shop/shared";
import { EMBEDDED_ROWS } from "../../inventory/embeddedRows.js";
import { normalizeProducts } from "./normalize.js";

/** Compiled into the serverless JS bundle — no filesystem or Sheets required. */
export function loadEmbeddedCatalog(): InventoryLoadResult {
  const { products, warnings } = normalizeProducts(EMBEDDED_ROWS);

  if (products.length === 0) {
    throw new Error("Embedded product catalog normalized to zero products.");
  }

  return {
    source: "json",
    loadedAt: new Date().toISOString(),
    productCount: products.length,
    products,
    warnings: ["Loaded embedded product catalog.", ...warnings],
  };
}
