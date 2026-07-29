import type { Cart, CartItem, CartView } from "@sports-shop/shared";
import { AppError } from "../middleware/errorHandler.js";
import {
  assertInventoryReady,
  getProductById,
} from "./inventory/inventoryService.js";

const carts = new Map<string, Cart>();

function itemKey(item: Pick<CartItem, "productId" | "size" | "color">): string {
  return `${item.productId}::${item.size ?? ""}::${item.color ?? ""}`;
}

function getOrCreateCart(sessionId: string): Cart {
  const existing = carts.get(sessionId);
  if (existing) return existing;

  const created: Cart = {
    sessionId,
    items: [],
    updatedAt: new Date().toISOString(),
  };
  carts.set(sessionId, created);
  return created;
}

function toCartView(cart: Cart): CartView {
  assertInventoryReady();

  const items = cart.items.map((item) => {
    const product = getProductById(item.productId);
    if (!product) {
      return {
        ...item,
        name: "Unavailable product",
        unitPrice: 0,
        lineTotal: 0,
        availability: "out_of_stock" as const,
      };
    }

    const availability =
      product.active && product.stockQuantity > 0
        ? ("in_stock" as const)
        : ("out_of_stock" as const);

    return {
      ...item,
      name: product.name,
      unitPrice: product.price,
      lineTotal: Number((product.price * item.quantity).toFixed(2)),
      availability,
    };
  });

  const subtotal = Number(
    items.reduce((sum, line) => sum + line.lineTotal, 0).toFixed(2),
  );

  return {
    sessionId: cart.sessionId,
    items,
    subtotal,
  };
}

export function getCartView(sessionId: string): CartView {
  return toCartView(getOrCreateCart(sessionId));
}

export function addToCart(input: {
  sessionId: string;
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
}): CartView {
  assertInventoryReady();

  const product = getProductById(input.productId);
  if (!product) {
    throw new AppError(404, "NOT_FOUND", `Product ${input.productId} was not found.`);
  }
  if (!product.active || product.stockQuantity <= 0) {
    throw new AppError(
      409,
      "OUT_OF_STOCK",
      `${product.name} is currently out of stock.`,
    );
  }

  const cart = getOrCreateCart(input.sessionId);
  const key = itemKey(input);
  const existing = cart.items.find((item) => itemKey(item) === key);
  const nextQuantity = (existing?.quantity ?? 0) + input.quantity;

  if (nextQuantity > product.stockQuantity) {
    throw new AppError(
      409,
      "OUT_OF_STOCK",
      `Only ${product.stockQuantity} of ${product.name} available.`,
    );
  }

  if (existing) {
    existing.quantity = nextQuantity;
  } else {
    cart.items.push({
      productId: input.productId,
      quantity: input.quantity,
      size: input.size,
      color: input.color,
    });
  }

  cart.updatedAt = new Date().toISOString();
  return toCartView(cart);
}

export function updateCartItem(input: {
  sessionId: string;
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
}): CartView {
  assertInventoryReady();

  const cart = getOrCreateCart(input.sessionId);
  const key = itemKey(input);
  const existingIndex = cart.items.findIndex((item) => itemKey(item) === key);

  if (existingIndex < 0) {
    throw new AppError(404, "NOT_FOUND", "Cart item was not found.");
  }

  if (input.quantity === 0) {
    cart.items.splice(existingIndex, 1);
    cart.updatedAt = new Date().toISOString();
    return toCartView(cart);
  }

  const product = getProductById(input.productId);
  if (!product) {
    throw new AppError(404, "NOT_FOUND", `Product ${input.productId} was not found.`);
  }
  if (input.quantity > product.stockQuantity) {
    throw new AppError(
      409,
      "OUT_OF_STOCK",
      `Only ${product.stockQuantity} of ${product.name} available.`,
    );
  }

  cart.items[existingIndex] = {
    productId: input.productId,
    quantity: input.quantity,
    size: input.size,
    color: input.color,
  };
  cart.updatedAt = new Date().toISOString();
  return toCartView(cart);
}

export function removeFromCart(input: {
  sessionId: string;
  productId: string;
  size?: string;
  color?: string;
}): CartView {
  const cart = getOrCreateCart(input.sessionId);
  const key = itemKey(input);
  const before = cart.items.length;
  cart.items = cart.items.filter((item) => itemKey(item) !== key);

  if (cart.items.length === before) {
    throw new AppError(404, "NOT_FOUND", "Cart item was not found.");
  }

  cart.updatedAt = new Date().toISOString();
  return toCartView(cart);
}

export function clearCart(sessionId: string): void {
  const cart = getOrCreateCart(sessionId);
  cart.items = [];
  cart.updatedAt = new Date().toISOString();
}

export function getCartItems(sessionId: string): CartItem[] {
  return [...getOrCreateCart(sessionId).items];
}
