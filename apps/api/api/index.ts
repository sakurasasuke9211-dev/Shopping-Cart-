import { createApp } from "../dist/app.js";
import { loadInventory } from "../dist/services/inventory/inventoryService.js";

/** Warm inventory as soon as the function boots (CSV on Vercel is ~instant). */
void loadInventory().catch((error) => {
  console.error(
    "[api] cold-start inventory preload failed",
    error instanceof Error ? error.message : error,
  );
});

/** Vercel serverless entry — routes all traffic through the Express app. */
export default createApp();
