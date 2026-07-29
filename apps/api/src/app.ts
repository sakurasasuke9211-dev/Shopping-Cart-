import cors from "cors";
import express from "express";
import { SPORTS } from "@sports-shop/shared";
import { config } from "./config.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { sessionMiddleware } from "./middleware/session.js";
import {
  addToCart,
  getCart,
  removeFromCart,
  updateCart,
} from "./routes/cart.js";
import {
  getInventoryStatus,
  reloadInventoryHandler,
} from "./routes/inventory.js";
import { createOrder, getOrderById } from "./routes/orders.js";
import { createPayment, confirmPayment } from "./routes/payments.js";
import { getProductById, listProducts } from "./routes/products.js";
import { createRecommendations } from "./routes/recommendations.js";
import {
  getInventoryMeta,
  loadInventory,
} from "./services/inventory/inventoryService.js";

let inventoryPromise: Promise<void> | null = null;

async function ensureInventory(): Promise<void> {
  if (!inventoryPromise) {
    inventoryPromise = loadInventory().then(() => undefined);
  }
  await inventoryPromise;
}

export function createApp(): express.Express {
  const app = express();

  const allowedOrigins = config.webOrigin
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        // Never pass Error to the callback — that surfaces as browser "Failed to fetch"
        // with no useful CORS headers. Deny with `false` instead.
        if (
          !origin ||
          allowedOrigins.includes(origin) ||
          allowedOrigins.includes("*") ||
          /\.vercel\.app$/i.test(origin) ||
          /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)
        ) {
          callback(null, true);
          return;
        }
        callback(null, false);
      },
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(sessionMiddleware);

  app.use("/api", (_req, _res, next) => {
    void ensureInventory()
      .then(() => next())
      .catch(next);
  });

  app.get("/api/health", (_req, res) => {
    const inventory = getInventoryMeta();
    const inventoryReady = Boolean(inventory && inventory.productCount > 0);
    res.status(inventoryReady ? 200 : 503).json({
      status: inventoryReady ? "ok" : "degraded",
      service: "@sports-shop/api",
      timestamp: new Date().toISOString(),
      sportsCatalogSize: SPORTS.length,
      inventory: inventory ?? {
        source: null,
        loadedAt: null,
        productCount: 0,
        warnings: ["Inventory not loaded"],
      },
      features: {
        mockPayments: config.mockPayments,
        preferSheets: config.inventory.preferSheets,
        spreadsheetId: config.inventory.sheets.spreadsheetId || null,
      },
    });
  });

  app.get("/", (_req, res) => {
    res.type("html").send(`<!doctype html>
<html lang="en">
  <head><meta charset="utf-8" /><title>Sports Mart API</title></head>
  <body style="font-family: system-ui, sans-serif; max-width: 40rem; margin: 2rem auto; line-height: 1.5;">
    <h1>Sports Mart API</h1>
    <p>This is the backend API. Open the web app instead:</p>
    <p><a href="${config.webOrigin}">${config.webOrigin}</a></p>
    <p>API health: <a href="/api/health">/api/health</a></p>
  </body>
</html>`);
  });

  app.get("/api/admin/inventory", getInventoryStatus);
  app.post("/api/admin/inventory/reload", (req, res, next) => {
    void reloadInventoryHandler(req, res).catch(next);
  });

  app.get("/api/products", listProducts);
  app.get("/api/products/:id", getProductById);

  app.post("/api/recommendations", (req, res, next) => {
    void createRecommendations(req, res).catch(next);
  });

  app.get("/api/cart/:sessionId", getCart);
  app.post("/api/cart", addToCart);
  app.post("/api/cart/update", updateCart);
  app.post("/api/cart/remove", removeFromCart);

  app.post("/api/orders", createOrder);
  app.get("/api/orders/:orderId", getOrderById);

  app.post("/api/payments/create", createPayment);
  app.post("/api/payments/confirm", confirmPayment);

  app.use(errorHandler);

  return app;
}
