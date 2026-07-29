import type { Request, Response } from "express";
import { parseOrThrow } from "../validation/parse.js";
import { productQuerySchema } from "../validation/schemas.js";
import {
  getProductDetail,
  listProducts as listProductsService,
} from "../services/productService.js";

export function listProducts(req: Request, res: Response): void {
  const query = parseOrThrow(productQuerySchema, req.query);
  const result = listProductsService(query);
  res.json(result);
}

export function getProductById(req: Request, res: Response): void {
  const productId = String(req.params.id ?? "");
  const product = getProductDetail(productId);
  res.json(product);
}
