import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Compiled output lives in `dist/`; on Vercel the deploy root is `apps/api`. */
const apiRoot = path.resolve(__dirname, "..");
export const repoRoot = process.env.VERCEL
  ? apiRoot
  : path.resolve(__dirname, "../../..");

dotenv.config({ path: path.join(repoRoot, ".env") });

function envBool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

function envInt(value: string | undefined, fallback: number): number {
  if (value === undefined || value === "") return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

const spreadsheetId =
  process.env.GOOGLE_SHEETS_SPREADSHEET_ID ??
  "1XD6e2f_IQ1hvBn7Mq92H0AtRdcSX7_A67x0mDG6GyBk";

const defaultFallback = process.env.VERCEL
  ? "data/inventory.csv"
  : "database/sports_shopping_cart_product_catalog.csv";

const primaryFallback = path.resolve(
  apiRoot,
  process.env.INVENTORY_FALLBACK_PATH ?? defaultFallback,
);

const dataDir = path.resolve(apiRoot, process.env.INVENTORY_DATA_DIR ?? "data");

export const config = {
  port: envInt(process.env.PORT, 4000),
  webOrigin: process.env.WEB_ORIGIN ?? "http://localhost:5173",
  inventory: {
    preferSheets: envBool(process.env.INVENTORY_PREFER_SHEETS, true),
    fallbackPath: primaryFallback,
    dataDir,
    fallbackPaths: [
      primaryFallback,
      path.join(dataDir, "inventory.json"),
      path.join(dataDir, "inventory.csv"),
      path.join(dataDir, "inventory.xlsx"),
      path.join(apiRoot, "data", "inventory.csv"),
      path.join(repoRoot, "database", "sports_shopping_cart_product_catalog.csv"),
    ],
    refreshMs: envInt(process.env.INVENTORY_REFRESH_MS, 900_000),
    sheets: {
      spreadsheetId,
      range: process.env.GOOGLE_SHEETS_RANGE ?? "Sheet1!A:U",
      serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? "",
      privateKey: (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ?? "").replace(
        /\\n/g,
        "\n",
      ),
    },
  },
  mockPayments: envBool(process.env.MOCK_PAYMENTS, true),
} as const;
