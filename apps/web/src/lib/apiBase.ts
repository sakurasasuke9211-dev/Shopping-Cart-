/** Production API — fallback when env is unset and not using same-origin proxy. */
const PRODUCTION_API_URL = "https://shopping-cart-api-steel.vercel.app";

/**
 * Base URL for REST calls.
 * - Production: empty → same-origin `/api/*` proxied by apps/web/vercel.json (no CORS).
 * - Dev: empty → Vite proxy; or VITE_API_BASE_URL for prod API testing.
 */
export function getApiBaseUrl(): string {
  if (import.meta.env.PROD) return "";

  const fromEnv = import.meta.env.VITE_API_BASE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, "");

  return "";
}

/** Absolute API URL (health checks, debugging). */
export function getAbsoluteApiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, "");
  if (import.meta.env.PROD) return PRODUCTION_API_URL;
  return "";
}
