import type { Request, Response } from "express";
import {
  confirmPayment as confirmPaymentService,
  createPayment as createPaymentService,
} from "../services/paymentService.js";
import { parseOrThrow } from "../validation/parse.js";
import {
  confirmPaymentSchema,
  createPaymentSchema,
} from "../validation/schemas.js";

export function createPayment(req: Request, res: Response): void {
  const body = parseOrThrow(createPaymentSchema, req.body);
  const payment = createPaymentService(body.orderId);
  res.status(201).json({
    paymentId: payment.paymentId,
    status: payment.status,
    amount: payment.amount,
  });
}

export function confirmPayment(req: Request, res: Response): void {
  const body = parseOrThrow(confirmPaymentSchema, req.body);
  const result = confirmPaymentService(body);
  res.json(result);
}
