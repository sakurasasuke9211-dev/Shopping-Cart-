/** Production backend — always used for live Vercel builds. */
export const PRODUCTION_API_URL =
  "https://shopping-cart-api-steel.vercel.app";

/**
 * Base URL for REST calls.
 * Production always hits the deployed API directly (CORS-enabled).
 * Dev uses Vite proxy unless VITE_API_BASE_URL is set.
 */
export function getApiBaseUrl(): string {
  if (import.meta.env.PROD) {
    return PRODUCTION_API_URL;
  }

  const fromEnv = import.meta.env.VITE_API_BASE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, "");

  return "";
}

export function getAbsoluteApiBaseUrl(): string {
  return getApiBaseUrl() || PRODUCTION_API_URL;
}
