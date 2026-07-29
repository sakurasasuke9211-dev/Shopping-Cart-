import type { Request, Response } from "express";
import {
  createOrder as createOrderService,
  getOrder,
} from "../services/orderService.js";
import { parseOrThrow } from "../validation/parse.js";
import { createOrderSchema } from "../validation/schemas.js";

export function createOrder(req: Request, res: Response): void {
  const body = parseOrThrow(createOrderSchema, req.body);
  const created = createOrderService(body);
  res.status(201).json({
    orderId: created.orderId,
    status: created.status,
    amount: created.amount,
  });
}

export function getOrderById(req: Request, res: Response): void {
  const orderId = String(req.params.orderId ?? "");
  res.json(getOrder(orderId));
}
