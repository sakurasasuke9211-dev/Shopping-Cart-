import { parse } from "csv-parse/sync";
import fs from "node:fs/promises";
import path from "node:path";
import type { InventoryLoadResult, InventorySource } from "@sports-shop/shared";
import { normalizeProducts, type RawInventoryRow } from "./normalize.js";

function extensionOf(filePath: string): string {
  return path.extname(filePath).toLowerCase();
}

function sourceFromExt(ext: string): InventorySource | null {
  if (ext === ".json") return "json";
  if (ext === ".csv") return "csv";
  if (ext === ".xlsx" || ext === ".xls") return "xlsx";
  return null;
}

export function parseCsvText(csvText: string): RawInventoryRow[] {
  const records = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
    bom: true,
  }) as RawInventoryRow[];

  // Stamp column Q (17th field, index 16) for image URL fallback
  const rawRows = parse(csvText, {
    columns: false,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
    bom: true,
  }) as string[][];

  return records.map((record, index) => {
    const cells = rawRows[index + 1]; // +1 skip header
    const colQ = cells?.[16] ?? "";
    return {
      ...record,
      __col_Q: colQ,
      images: record.images || record.image || colQ || "",
    };
  });
}

async function loadJsonRows(filePath: string): Promise<unknown[]> {
  const text = await fs.readFile(filePath, "utf8");
  const parsed: unknown = JSON.parse(text);
  if (Array.isArray(parsed)) return parsed;
  if (
    parsed &&
    typeof parsed === "object" &&
    Array.isArray((parsed as { products?: unknown }).products)
  ) {
    return (parsed as { products: unknown[] }).products;
  }
  throw new Error(`JSON inventory must be an array or { products: [] }: ${filePath}`);
}

async function loadCsvRows(filePath: string): Promise<RawInventoryRow[]> {
  const text = await fs.readFile(filePath, "utf8");
  return parseCsvText(text);
}

async function loadXlsxRows(filePath: string): Promise<RawInventoryRow[]> {
  const xlsx = await import("xlsx");
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error(`Excel file has no sheets: ${filePath}`);
  }
  const sheet = workbook.Sheets[sheetName];
  return xlsx.utils.sheet_to_json<RawInventoryRow>(sheet, {
    defval: "",
    raw: false,
  });
}

async function loadRowsFromFile(filePath: string): Promise<{
  source: InventorySource;
  rows: unknown[];
}> {
  const source = sourceFromExt(extensionOf(filePath));
  if (!source) {
    throw new Error(`Unsupported inventory file type: ${filePath}`);
  }

  if (source === "json") {
    return { source, rows: await loadJsonRows(filePath) };
  }
  if (source === "csv") {
    return { source, rows: await loadCsvRows(filePath) };
  }
  return { source, rows: await loadXlsxRows(filePath) };
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Load inventory from an explicit file path, or discover json → csv → xlsx
 * under a directory.
 */
export async function loadFromFile(
  fileOrDirPath: string,
): Promise<InventoryLoadResult> {
  const stat = await fs.stat(fileOrDirPath).catch(() => null);
  if (!stat) {
    throw new Error(`Inventory path not found: ${fileOrDirPath}`);
  }

  let filePath = fileOrDirPath;
  if (stat.isDirectory()) {
    const candidates = [
      path.join(fileOrDirPath, "inventory.json"),
      path.join(fileOrDirPath, "inventory.csv"),
      path.join(fileOrDirPath, "inventory.xlsx"),
      path.join(fileOrDirPath, "sports_shopping_cart_product_catalog.csv"),
    ];
    const found = [];
    for (const candidate of candidates) {
      if (await fileExists(candidate)) {
        found.push(candidate);
        break;
      }
    }
    if (found.length === 0) {
      throw new Error(
        `No inventory.json/csv/xlsx found under ${fileOrDirPath}`,
      );
    }
    filePath = found[0]!;
  }

  const { source, rows } = await loadRowsFromFile(filePath);
  const { products, warnings } = normalizeProducts(rows);

  return {
    source,
    loadedAt: new Date().toISOString(),
    productCount: products.length,
    products,
    warnings: [
      `Loaded from file: ${filePath}`,
      ...warnings,
    ],
  };
}

export async function loadProductsFromFallback(
  fileOrDirPath: string,
): Promise<InventoryLoadResult> {
  return loadFromFile(fileOrDirPath);
}

export async function tryLoadFromFallbackPaths(
  paths: readonly string[],
): Promise<InventoryLoadResult> {
  const errors: string[] = [];

  for (const candidate of paths) {
    try {
      if (!(await fileExists(candidate))) {
        errors.push(`missing: ${candidate}`);
        continue;
      }
      return await loadFromFile(candidate);
    } catch (error) {
      errors.push(
        `${candidate}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  throw new Error(
    `All local inventory fallbacks failed. ${errors.join(" | ")}`,
  );
}
