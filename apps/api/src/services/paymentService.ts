import { randomUUID } from "node:crypto";
import type { Payment } from "@sports-shop/shared";
import { config } from "../config.js";
import { AppError } from "../middleware/errorHandler.js";
import { clearCart } from "./cartService.js";
import { decrementStock } from "./inventory/inventoryService.js";
import {
  getOrder,
  markOrderConfirmed,
  markOrderPaymentFailed,
} from "./orderService.js";

const payments = new Map<string, Payment>();

function createId(prefix: string): string {
  return `${prefix}_${randomUUID().replace(/-/g, "").slice(0, 12)}`;
}

export function isMockPaymentsEnabled(): boolean {
  return config.mockPayments;
}

export function getPayment(paymentId: string): Payment {
  const payment = payments.get(paymentId);
  if (!payment) {
    throw new AppError(404, "NOT_FOUND", `Payment ${paymentId} was not found.`);
  }
  return payment;
}

export function createPayment(orderId: string): Payment {
  if (!isMockPaymentsEnabled()) {
    throw new AppError(
      501,
      "NOT_IMPLEMENTED",
      "Live payments are not enabled in this environment.",
    );
  }

  const order = getOrder(orderId);
  if (order.status === "confirmed") {
    throw new AppError(
      409,
      "PAYMENT_FAILED",
      "This order is already paid.",
    );
  }
  if (order.status !== "pending_payment") {
    throw new AppError(
      409,
      "PAYMENT_FAILED",
      `Order ${orderId} is not awaiting payment.`,
    );
  }

  const existing = [...payments.values()].find(
    (payment) =>
      payment.orderId === orderId &&
      payment.status === "requires_confirmation",
  );
  if (existing) {
    return existing;
  }

  const payment: Payment = {
    paymentId: createId("pay"),
    orderId,
    amount: order.amount,
    status: "requires_confirmation",
  };
  payments.set(payment.paymentId, payment);
  return payment;
}

export function confirmPayment(input: {
  paymentId: string;
  orderId: string;
}): { status: "paid"; orderId: string; paymentId: string } {
  if (!isMockPaymentsEnabled()) {
    throw new AppError(
      501,
      "NOT_IMPLEMENTED",
      "Live payments are not enabled in this environment.",
    );
  }

  const payment = getPayment(input.paymentId);
  if (payment.orderId !== input.orderId) {
    throw new AppError(
      400,
      "VALIDATION_ERROR",
      "paymentId does not match orderId.",
    );
  }

  if (payment.status === "paid") {
    return {
      status: "paid",
      orderId: payment.orderId,
      paymentId: payment.paymentId,
    };
  }

  if (payment.status !== "requires_confirmation") {
    throw new AppError(
      409,
      "PAYMENT_FAILED",
      `Payment ${payment.paymentId} cannot be confirmed.`,
    );
  }

  const order = getOrder(input.orderId);
  if (order.amount !== payment.amount) {
    payment.status = "failed";
    payments.set(payment.paymentId, payment);
    markOrderPaymentFailed(order.orderId);
    throw new AppError(
      409,
      "PAYMENT_FAILED",
      "Payment amount does not match the order total.",
    );
  }

  try {
    for (const item of order.items) {
      decrementStock(item.productId, item.quantity);
    }
  } catch (error) {
    payment.status = "failed";
    payments.set(payment.paymentId, payment);
    markOrderPaymentFailed(order.orderId);
    throw error;
  }

  payment.status = "paid";
  payments.set(payment.paymentId, payment);
  markOrderConfirmed(order.orderId);
  clearCart(order.sessionId);

  return {
    status: "paid",
    orderId: order.orderId,
    paymentId: payment.paymentId,
  };
}
