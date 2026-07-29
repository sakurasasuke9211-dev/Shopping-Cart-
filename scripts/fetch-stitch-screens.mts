/**
 * Export all screens from the Sports Mart Stitch project as PNG (and HTML when available).
 *
 * Requires STITCH_API_KEY in the environment or .env
 *
 * Usage:
 *   npx tsx scripts/fetch-stitch-screens.mts
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { stitch } from "@google/stitch-sdk";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
dotenv.config({ path: path.join(repoRoot, ".env") });

const PROJECT_ID = "1661451065380919448";
const OUT_DIR = path.join(repoRoot, "design", "screens");

/** Preferred filenames for known screens in the user flow. */
const KNOWN_NAMES: Record<string, string> = {
  "124c25d4c4dc498697b36754a13981ad": "01-opening",
  "6e6492f57f1944acb077b1b3a871891f": "04-add-items",
  "83ff30329f09451698e5aa6d714afa48": "05-cart-review",
  "1e80db28cd414bc787e3219d7c139138": "06-recommendation",
  "ca6b62c8d62046928bfdbae06d4b002b": "08-order-confirmation",
};

async function download(url: string, dest: string): Promise<void> {
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} downloading ${url}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(dest, buffer);
}

function baseNameFor(screenId: string, index: number): string {
  if (KNOWN_NAMES[screenId]) return KNOWN_NAMES[screenId]!;
  return `screen-${String(index + 1).padStart(2, "0")}-${screenId.slice(0, 8)}`;
}

async function main(): Promise<void> {
  if (!process.env.STITCH_API_KEY && !process.env.STITCH_ACCESS_TOKEN) {
    throw new Error(
      [
        "Missing Stitch credentials.",
        "Add STITCH_API_KEY to .env (from Google AI Studio / Stitch settings), then re-run:",
        "  npx tsx scripts/fetch-stitch-screens.mts",
      ].join("\n"),
    );
  }

  await fs.mkdir(OUT_DIR, { recursive: true });
  const project = stitch.project(PROJECT_ID);
  const screens = await project.screens();

  if (screens.length === 0) {
    throw new Error(`No screens found in Stitch project ${PROJECT_ID}`);
  }

  console.log(`Found ${screens.length} screen(s) in project ${PROJECT_ID}`);
  const exported: Array<{ screenId: string; file: string }> = [];

  for (let i = 0; i < screens.length; i += 1) {
    const screen = screens[i]!;
    const screenId = screen.screenId || screen.id;
    const base = baseNameFor(screenId, i);
    console.log(`\n[${i + 1}/${screens.length}] ${base} (${screenId})`);

    try {
      const imageUrl = await screen.getImage();
      if (!imageUrl) {
        console.warn("  No image URL — skipped PNG");
      } else {
        // Request a wider render when the CDN supports width hints
        const wideUrl = imageUrl.includes("=")
          ? imageUrl
          : `${imageUrl}${imageUrl.includes("?") ? "&" : "?"}w=2400`;
        const pngPath = path.join(OUT_DIR, `${base}.png`);
        try {
          await download(wideUrl, pngPath);
        } catch {
          await download(imageUrl, pngPath);
        }
        console.log(`  Saved ${pngPath}`);
        exported.push({ screenId, file: `${base}.png` });
      }
    } catch (error) {
      console.warn(
        `  PNG failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    try {
      const htmlUrl = await screen.getHtml();
      if (htmlUrl) {
        const htmlPath = path.join(OUT_DIR, `${base}.html`);
        await download(htmlUrl, htmlPath);
        console.log(`  Saved ${htmlPath}`);
      }
    } catch (error) {
      console.warn(
        `  HTML skipped: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  const manifestPath = path.join(OUT_DIR, "export-manifest.json");
  await fs.writeFile(
    manifestPath,
    JSON.stringify(
      {
        projectId: PROJECT_ID,
        exportedAt: new Date().toISOString(),
        count: exported.length,
        files: exported,
      },
      null,
      2,
    ),
  );
  console.log(`\nDone. Exported ${exported.length} PNG(s). Manifest: ${manifestPath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
