/** Production API — used when VITE_API_BASE_URL is unset at build time. */
const PRODUCTION_API_URL = "https://shopping-cart-api-steel.vercel.app";

/** Base URL for REST calls. Empty in dev → Vite proxy handles /api/*. */
export function getApiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, "");

  if (import.meta.env.PROD) return PRODUCTION_API_URL;

  return "";
}
