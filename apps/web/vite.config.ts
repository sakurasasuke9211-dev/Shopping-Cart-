import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  // Load VITE_* from monorepo root `.env` (shared with the API)
  envDir: path.resolve(rootDir, "../.."),
  plugins: [react()],
  resolve: {
    alias: {
      "@sports-shop/shared": path.resolve(
        rootDir,
        "../../packages/shared/src/index.ts",
      ),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
});
