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

import { getApiBaseUrl } from "../lib/apiBase";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const base = getApiBaseUrl();
  const url = base ? `${base}${path}` : path;
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const data = (await response.json().catch(() => null)) as
    | T
    | { error?: { message?: string } }
    | null;
  if (!response.ok) {
    const message =
      data && typeof data === "object" && "error" in data
        ? (data as { error?: { message?: string } }).error?.message
        : undefined;
    throw new Error(message ?? `Request failed (${response.status})`);
  }
  if (data === null) {
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      throw new Error(
        "API returned an invalid response. Check VITE_API_BASE_URL and redeploy the frontend.",
      );
    }
    throw new Error("API returned an empty response.");
  }
  return data as T;
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
