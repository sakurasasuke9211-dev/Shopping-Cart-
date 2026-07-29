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
  const bases = ["", getAbsoluteApiBaseUrl()].filter(
    (value, index, all) => all.indexOf(value) === index,
  );
  let lastError: Error = new Error("Health check failed");

  for (const base of bases) {
    try {
      const url = base ? `${base}/api/health` : "/api/health";
      const response = await fetch(url);
      const data = (await response.json().catch(() => null)) as HealthResponse | null;
      if (response.ok && data) return data;
      lastError = new Error(`Health check failed (${response.status})`);
    } catch (error) {
      lastError =
        error instanceof Error ? error : new Error("Health check failed");
    }
  }

  throw lastError;
}
