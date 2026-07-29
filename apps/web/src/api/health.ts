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
  const response = await fetch("/api/health");
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
