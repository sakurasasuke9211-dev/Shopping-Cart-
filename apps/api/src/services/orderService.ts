import { randomUUID } from "node:crypto";
import type { Order, OrderCustomer, OrderItem } from "@sports-shop/shared";
import { AppError } from "../middleware/errorHandler.js";
import { getCartItems } from "./cartService.js";
import {
  assertInventoryReady,
  getProductById,
} from "./inventory/inventoryService.js";

const orders = new Map<string, Order>();

function createId(prefix: string): string {
  return `${prefix}_${randomUUID().replace(/-/g, "").slice(0, 12)}`;
}

function buildOrderItems(
  lines: Array<{ productId: string; quantity: number }>,
): OrderItem[] {
  return lines.map((line) => {
    const product = getProductById(line.productId);
    if (!product) {
      throw new AppError(
        404,
        "NOT_FOUND",
        `Product ${line.productId} was not found.`,
      );
    }
    if (!product.active || product.stockQuantity < line.quantity) {
      throw new AppError(
        409,
        "OUT_OF_STOCK",
        `${product.name} is no longer available in the requested quantity.`,
      );
    }

    return {
      productId: product.productId,
      name: product.name,
      quantity: line.quantity,
      unitPrice: product.price,
    };
  });
}

export function createOrder(input: {
  sessionId: string;
  items?: Array<{ productId: string; quantity: number }>;
  customer: OrderCustomer;
}): Pick<Order, "orderId" | "status" | "amount"> & { order: Order } {
  assertInventoryReady();

  const sourceItems =
    input.items && input.items.length > 0
      ? input.items
      : getCartItems(input.sessionId).map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        }));

  if (sourceItems.length === 0) {
    throw new AppError(
      400,
      "VALIDATION_ERROR",
      "Order must include at least one item (or a non-empty cart).",
    );
  }

  const orderItems = buildOrderItems(sourceItems);
  const amount = Number(
    orderItems
      .reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
      .toFixed(2),
  );

  const order: Order = {
    orderId: createId("ord"),
    sessionId: input.sessionId,
    status: "pending_payment",
    items: orderItems,
    amount,
    customer: input.customer,
    createdAt: new Date().toISOString(),
  };

  orders.set(order.orderId, order);

  return {
    orderId: order.orderId,
    status: order.status,
    amount: order.amount,
    order,
  };
}

export function getOrder(orderId: string): Order {
  const order = orders.get(orderId);
  if (!order) {
    throw new AppError(404, "NOT_FOUND", `Order ${orderId} was not found.`);
  }
  return order;
}

export function markOrderConfirmed(orderId: string): Order {
  const order = getOrder(orderId);
  if (order.status === "confirmed") {
    return order;
  }
  if (order.status !== "pending_payment") {
    throw new AppError(
      409,
      "PAYMENT_FAILED",
      `Order ${orderId} cannot be confirmed from status ${order.status}.`,
    );
  }

  order.status = "confirmed";
  order.paidAt = new Date().toISOString();
  orders.set(orderId, order);
  return order;
}

export function markOrderPaymentFailed(orderId: string): Order {
  const order = getOrder(orderId);
  order.status = "payment_failed";
  orders.set(orderId, order);
  return order;
}
