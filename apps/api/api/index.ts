import { createApp } from "../dist/app.js";
import {
  bootstrapEmbeddedInventory,
  loadInventory,
} from "../dist/services/inventory/inventoryService.js";

/** Sync warm — catalog is compiled into the bundle. */
try {
  bootstrapEmbeddedInventory();
} catch (error) {
  console.error(
    "[api] sync inventory bootstrap failed",
    error instanceof Error ? error.message : error,
  );
}

void loadInventory().catch((error) => {
  console.error(
    "[api] cold-start inventory preload failed",
    error instanceof Error ? error.message : error,
  );
});

/** Vercel serverless entry — routes all traffic through the Express app. */
export default createApp();
