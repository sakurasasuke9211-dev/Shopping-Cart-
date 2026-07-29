import type { Request, Response } from "express";
import {
  getInventoryMeta,
  reloadInventory,
} from "../services/inventory/inventoryService.js";

/** Dev/admin reload of Sheets or local fallback inventory. */
export async function reloadInventoryHandler(
  _req: Request,
  res: Response,
): Promise<void> {
  const result = await reloadInventory();
  res.json({
    ok: true,
    source: result.source,
    productCount: result.productCount,
    loadedAt: result.loadedAt,
    warningCount: result.warnings.length,
    warnings: result.warnings.slice(0, 50),
  });
}

export function getInventoryStatus(_req: Request, res: Response): void {
  const meta = getInventoryMeta();
  res.json(meta ?? { source: null, productCount: 0, warnings: [] });
}
