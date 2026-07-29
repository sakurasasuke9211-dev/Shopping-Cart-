/** Production backend — used when same-origin proxy is unavailable. */
export const PRODUCTION_API_URL =
  "https://shopping-cart-api-steel.vercel.app";

/**
 * Base URL for REST calls.
 *
 * Production prefers same-origin `/api/*` (Vercel rewrite → backend) to avoid
 * cross-origin cold-start failures. Absolute URL is used as a fallback by the
 * API client when the proxy path fails.
 *
 * Dev uses Vite proxy unless VITE_API_BASE_URL is set.
 */
export function getApiBaseUrl(): string {
  if (import.meta.env.PROD) {
    // Same-origin → apps/web vercel.json rewrites /api/* to the API project.
    return "";
  }

  const fromEnv = import.meta.env.VITE_API_BASE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, "");

  return "";
}

export function getAbsoluteApiBaseUrl(): string {
  return getApiBaseUrl() || PRODUCTION_API_URL;
}

export function getFallbackApiBaseUrl(): string {
  return PRODUCTION_API_URL;
}
