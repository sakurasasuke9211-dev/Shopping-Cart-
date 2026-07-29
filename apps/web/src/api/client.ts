import type {
  CartView,
  Order,
  Product,
  RecommendationResult,
  UserPreferences,
} from "@sports-shop/shared";

export type ProductDetail = Product & {
  availability: "in_stock" | "out_of_stock";
};

export type ProductListResult = {
  items: ProductDetail[];
  page: number;
  pageSize: number;
  total: number;
};

export type ProductListQuery = {
  q?: string;
  sport?: string;
  category?: string;
  ageGroup?: string;
  experienceLevel?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "price_asc" | "price_desc" | "rating_desc" | "name_asc";
  page?: number;
  pageSize?: number;
};

export type CreateOrderResponse = {
  orderId: string;
  status: Order["status"];
  amount: number;
};

export type CreatePaymentResponse = {
  paymentId: string;
  status: "requires_confirmation" | "paid" | "failed";
  amount: number;
};

export type ConfirmPaymentResponse = {
  status: "paid";
  orderId: string;
  paymentId: string;
};

export type CartLineInput = {
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
};

export type OrderCustomerInput = {
  name: string;
  email: string;
  phone?: string;
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    postalCode: string;
    state?: string;
    country?: string;
  };
};

import {
  getApiBaseUrl,
  getFallbackApiBaseUrl,
} from "../lib/apiBase";

const MAX_ATTEMPTS = 5;
const RETRY_DELAY_MS = 1500;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableStatus(status: number): boolean {
  return status === 503 || status === 502 || status === 504;
}

function buildHeaders(init?: RequestInit): HeadersInit {
  const method = (init?.method ?? "GET").toUpperCase();
  const headers: Record<string, string> = {
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (method !== "GET" && method !== "HEAD" && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  return headers;
}

function candidateBases(): string[] {
  const primary = getApiBaseUrl();
  const fallback = getFallbackApiBaseUrl();
  const bases = [primary];
  if (fallback && fallback !== primary) {
    bases.push(fallback);
  }
  return bases;
}

async function requestOnce<T>(
  base: string,
  path: string,
  init?: RequestInit,
): Promise<{ ok: true; data: T } | { ok: false; retryable: boolean; error: Error }> {
  const url = base ? `${base}${path}` : path;

  try {
    const response = await fetch(url, {
      ...init,
      headers: buildHeaders(init),
    });

    const contentType = response.headers.get("content-type") ?? "";
    const rawText = await response.text();
    let data: unknown = null;
    if (rawText) {
      try {
        data = JSON.parse(rawText);
      } catch {
        data = null;
      }
    }

    // SPA HTML or non-JSON means the /api proxy missed — try the absolute API next.
    if (!contentType.includes("application/json") || data === null) {
      return {
        ok: false,
        retryable: true,
        error: new Error(
          "API returned an invalid response. The server may still be starting — try again.",
        ),
      };
    }

    if (!response.ok) {
      const message =
        data && typeof data === "object" && "error" in data
          ? (data as { error?: { message?: string } }).error?.message
          : undefined;
      return {
        ok: false,
        retryable: isRetryableStatus(response.status),
        error: new Error(message ?? `Request failed (${response.status})`),
      };
    }

    return { ok: true, data: data as T };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Network request failed";
    return {
      ok: false,
      retryable: true,
      error: new Error(
        message.includes("Failed to fetch") || error instanceof TypeError
          ? "Could not reach the server. It may still be starting — please wait a moment and refresh."
          : message,
      ),
    };
  }
}

async function request<T>(
  path: string,
  init?: RequestInit,
  attempt = 0,
): Promise<T> {
  const bases = candidateBases();
  let lastError: Error = new Error("Request failed");

  for (const base of bases) {
    const result = await requestOnce<T>(base, path, init);
    if (result.ok) return result.data;
    lastError = result.error;
    if (!result.retryable) {
      throw result.error;
    }
  }

  if (attempt < MAX_ATTEMPTS - 1) {
    await sleep(RETRY_DELAY_MS * (attempt + 1));
    return request<T>(path, init, attempt + 1);
  }

  throw lastError;
}

export function fetchRecommendations(
  preferences: UserPreferences,
): Promise<RecommendationResult> {
  return request<RecommendationResult>("/api/recommendations", {
    method: "POST",
    body: JSON.stringify(preferences),
  });
}

export function fetchProduct(productId: string): Promise<ProductDetail> {
  return request<ProductDetail>(`/api/products/${encodeURIComponent(productId)}`);
}

export function fetchProducts(query: ProductListQuery = {}): Promise<ProductListResult> {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.sport) params.set("sport", query.sport);
  if (query.category) params.set("category", query.category);
  if (query.ageGroup) params.set("ageGroup", query.ageGroup);
  if (query.experienceLevel) params.set("experienceLevel", query.experienceLevel);
  if (query.minPrice !== undefined) params.set("minPrice", String(query.minPrice));
  if (query.maxPrice !== undefined) params.set("maxPrice", String(query.maxPrice));
  params.set("sort", query.sort ?? "rating_desc");
  params.set("page", String(query.page ?? 1));
  params.set("pageSize", String(query.pageSize ?? 100));
  const qs = params.toString();
  return request<ProductListResult>(`/api/products?${qs}`);
}

export function addToCart(input: {
  sessionId: string;
  productId: string;
  quantity?: number;
  size?: string;
  color?: string;
}): Promise<CartView> {
  return request<CartView>("/api/cart", {
    method: "POST",
    body: JSON.stringify({ quantity: 1, ...input }),
  });
}

export function fetchCart(sessionId: string): Promise<CartView> {
  return request<CartView>(`/api/cart/${encodeURIComponent(sessionId)}`);
}

export function updateCart(input: {
  sessionId: string;
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
}): Promise<CartView> {
  return request<CartView>("/api/cart/update", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function removeFromCart(input: {
  sessionId: string;
  productId: string;
  size?: string;
  color?: string;
}): Promise<CartView> {
  return request<CartView>("/api/cart/remove", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function createOrder(input: {
  sessionId: string;
  customer: OrderCustomerInput;
  items?: CartLineInput[];
}): Promise<CreateOrderResponse> {
  return request<CreateOrderResponse>("/api/orders", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function fetchOrder(orderId: string): Promise<Order> {
  return request<Order>(`/api/orders/${encodeURIComponent(orderId)}`);
}

export function createPayment(orderId: string): Promise<CreatePaymentResponse> {
  return request<CreatePaymentResponse>("/api/payments/create", {
    method: "POST",
    body: JSON.stringify({ orderId }),
  });
}

export function confirmPayment(input: {
  paymentId: string;
  orderId: string;
}): Promise<ConfirmPaymentResponse> {
  return request<ConfirmPaymentResponse>("/api/payments/confirm", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
