import type { InventoryLoadResult } from "@sports-shop/shared";
import { config } from "../../config.js";
import { parseCsvText } from "./fileLoader.js";
import { normalizeProducts } from "./normalize.js";

function hasServiceAccountCredentials(): boolean {
  const { serviceAccountEmail, privateKey, spreadsheetId } =
    config.inventory.sheets;
  return Boolean(serviceAccountEmail && privateKey && spreadsheetId);
}

async function loadViaGoogleApis(): Promise<InventoryLoadResult> {
  const { google } = await import("googleapis");
  const { spreadsheetId, range, serviceAccountEmail, privateKey } =
    config.inventory.sheets;

  const auth = new google.auth.JWT({
    email: serviceAccountEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  const sheets = google.sheets({ version: "v4", auth });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  const values = response.data.values ?? [];
  if (values.length < 2) {
    throw new Error("Google Sheets returned no data rows");
  }

  const headers = values[0]!.map((h) => String(h).trim());
  const rows = values.slice(1).map((row) => {
    const record: Record<string, string> = {};
    headers.forEach((header, i) => {
      const cell = row[i] == null ? "" : String(row[i]);
      if (header) record[header] = cell;
      // Column Q (index 16) is the product image URL(s)
      if (i === 16) {
        record.__col_Q = cell;
        if (!record.images) record.images = cell;
      }
    });
    return record;
  });

  const { products, warnings } = normalizeProducts(rows);
  return {
    source: "sheets",
    loadedAt: new Date().toISOString(),
    productCount: products.length,
    products,
    warnings: [
      `Loaded via Google Sheets API (${spreadsheetId})`,
      ...warnings,
    ],
  };
}

/**
 * Public/share-link readable sheets can be exported as CSV without a service account.
 */
async function loadViaPublicCsvExport(): Promise<InventoryLoadResult> {
  const { spreadsheetId } = config.inventory.sheets;
  if (!spreadsheetId) {
    throw new Error("GOOGLE_SHEETS_SPREADSHEET_ID is not configured");
  }

  const urls = [
    `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv`,
    `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv`,
  ];

  let lastError: unknown;
  for (const url of urls) {
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": "sports-shopping-app/0.1" },
        redirect: "follow",
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} for ${url}`);
      }
      const csvText = await response.text();
      if (!csvText.trim() || !csvText.toLowerCase().includes("productid")) {
        throw new Error(`Unexpected CSV payload from ${url}`);
      }

      const rows = parseCsvText(csvText);
      const { products, warnings } = normalizeProducts(rows);
      return {
        source: "sheets",
        loadedAt: new Date().toISOString(),
        productCount: products.length,
        products,
        warnings: [
          `Loaded via Google Sheets CSV export (${spreadsheetId})`,
          ...warnings,
        ],
      };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(String(lastError ?? "Sheets CSV export failed"));
}

export async function loadFromSheets(): Promise<InventoryLoadResult> {
  if (hasServiceAccountCredentials()) {
    try {
      return await loadViaGoogleApis();
    } catch (error) {
      console.warn(
        "[inventory] Google Sheets API failed, trying public CSV export",
        error instanceof Error ? error.message : error,
      );
    }
  }

  return loadViaPublicCsvExport();
}

export async function tryLoadFromSheets(): Promise<InventoryLoadResult | null> {
  if (!config.inventory.preferSheets && !config.inventory.sheets.spreadsheetId) {
    return null;
  }

  try {
    return await loadFromSheets();
  } catch (error) {
    console.warn(
      "[inventory] Sheets load failed",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}
