import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";

// Removed vitePluginManusRuntime - not needed for local development

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const plugins = [react(), tailwindcss(), jsxLocPlugin()];

// Absolute paths for alias resolution
const srcPath = path.resolve(__dirname, "client/src");
const sharedPath = path.resolve(__dirname, "shared");
const assetsPath = path.resolve(__dirname, "attached_assets");

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": srcPath,
      "@shared": sharedPath,
      "@assets": assetsPath,
    },
  },
  envDir: path.resolve(__dirname),
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  server: {
    port: 3000,
    strictPort: false,
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1",
    ],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    middlewareMode: false,
  },
  preview: {
    port: 3000,
    host: true,
  },
});
