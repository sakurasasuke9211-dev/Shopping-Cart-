import {
  getAllProducts,
  getRecommendationCandidates,
  loadInventory,
} from "../apps/api/src/services/inventory/inventoryService.ts";
import { loadFromFile } from "../apps/api/src/services/inventory/fileLoader.ts";

async function main() {
  const withSheets = await loadInventory();
  console.log(
    "sheets-or-fallback",
    JSON.stringify({
      source: withSheets.source,
      productCount: withSheets.productCount,
      candidates: getRecommendationCandidates().length,
      sample: getAllProducts()[0]?.name,
    }),
  );

  const fallback = await loadFromFile(
    "database/sports_shopping_cart_product_catalog.csv",
  );
  console.log(
    "csv-fallback",
    JSON.stringify({
      source: fallback.source,
      productCount: fallback.productCount,
      candidates: fallback.products.filter(
        (p) => p.active && p.stockQuantity > 0,
      ).length,
    }),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
