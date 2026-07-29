import { createApp } from "./app.js";
import { config } from "./config.js";
import { loadInventory } from "./services/inventory/inventoryService.js";

async function bootstrap(): Promise<void> {
  await loadInventory();

  const app = createApp();

  app.listen(config.port, () => {
    console.info(
      `[api] listening on http://localhost:${config.port} (web origin ${config.webOrigin})`,
    );
  });
}

bootstrap().catch((error) => {
  console.error("[api] failed to start", error);
  process.exit(1);
});
