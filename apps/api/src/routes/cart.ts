import type { Request, Response } from "express";
import {
  addToCart as addToCartService,
  getCartView,
  removeFromCart as removeFromCartService,
  updateCartItem,
} from "../services/cartService.js";
import { parseOrThrow } from "../validation/parse.js";
import {
  addToCartSchema,
  removeFromCartSchema,
  updateCartSchema,
} from "../validation/schemas.js";

export function getCart(req: Request, res: Response): void {
  const sessionId = String(req.params.sessionId ?? "");
  res.json(getCartView(sessionId));
}

export function addToCart(req: Request, res: Response): void {
  const body = parseOrThrow(addToCartSchema, req.body);
  res.status(201).json(addToCartService(body));
}

export function updateCart(req: Request, res: Response): void {
  const body = parseOrThrow(updateCartSchema, req.body);
  res.json(updateCartItem(body));
}

export function removeFromCart(req: Request, res: Response): void {
  const body = parseOrThrow(removeFromCartSchema, req.body);
  res.json(removeFromCartService(body));
}
