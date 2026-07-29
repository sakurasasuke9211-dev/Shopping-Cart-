import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const apiRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(apiRoot, "../..");
const dataDir = path.join(apiRoot, "data");

const sources = [
  path.join(repoRoot, "database", "sports_shopping_cart_product_catalog.csv"),
  path.join(repoRoot, "data", "inventory.csv"),
];

fs.mkdirSync(dataDir, { recursive: true });

const source = sources.find((candidate) => fs.existsSync(candidate));
if (!source) {
  console.warn("[prepare-vercel] No inventory CSV found; relying on Google Sheets only.");
  process.exit(0);
}

const dest = path.join(dataDir, "inventory.csv");
fs.copyFileSync(source, dest);
console.info(`[prepare-vercel] Copied ${path.relative(repoRoot, source)} → data/inventory.csv`);
