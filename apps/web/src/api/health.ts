import { getAbsoluteApiBaseUrl } from "../lib/apiBase";

export type HealthResponse = {
  status: "ok" | "degraded" | string;
  service: string;
  timestamp: string;
  sportsCatalogSize: number;
  inventory: {
    source: "sheets" | "json" | "csv" | "xlsx" | null;
    loadedAt: string | null;
    productCount: number;
    warnings: string[];
  };
  features: {
    mockPayments: boolean;
    preferSheets: boolean;
    spreadsheetId: string | null;
  };
};

export async function fetchHealth(): Promise<HealthResponse> {
  const base = getAbsoluteApiBaseUrl();
  const url = base ? `${base}/api/health` : "/api/health";
  const response = await fetch(url);
  const data = (await response.json().catch(() => null)) as HealthResponse | null;
  if (!response.ok || !data) {
    throw new Error(
      data && typeof data === "object"
        ? `Health check failed (${response.status})`
        : `Health check failed (${response.status})`,
    );
  }
  return data;
}
