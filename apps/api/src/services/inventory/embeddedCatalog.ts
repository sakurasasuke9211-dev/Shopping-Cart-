import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
import type { InventoryLoadResult } from "@sports-shop/shared";
import { normalizeProducts, type RawInventoryRow } from "./normalize.js";

const require = createRequire(import.meta.url);

function readEmbeddedRows(): RawInventoryRow[] {
  // Prefer require so Vercel/nft always bundles the JSON with the function.
  try {
    return require("../../inventory/embeddedRows.json") as RawInventoryRow[];
  } catch {
    // Fallback: read beside compiled output (dist/inventory/…)
    const candidates = [
      path.join(
        path.dirname(fileURLToPath(import.meta.url)),
        "../../inventory/embeddedRows.json",
      ),
      path.join(process.cwd(), "src/inventory/embeddedRows.json"),
      path.join(process.cwd(), "dist/inventory/embeddedRows.json"),
    ];
    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) {
        return JSON.parse(fs.readFileSync(candidate, "utf8")) as RawInventoryRow[];
      }
    }
    throw new Error("Embedded product catalog JSON was not found in the bundle.");
  }
}

/** Always available in the serverless bundle — no filesystem/Sheets required. */
export function loadEmbeddedCatalog(): InventoryLoadResult {
  const { products, warnings } = normalizeProducts(readEmbeddedRows());

  return {
    source: "json",
    loadedAt: new Date().toISOString(),
    productCount: products.length,
    products,
    warnings: ["Loaded embedded product catalog.", ...warnings],
  };
}
