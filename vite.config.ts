import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: {
        vite: "./lib/vite/index.ts",
        webpack: "./lib/webpack/index.ts",
      },
      formats: ["es", "cjs"],
      fileName: (format, entryName) =>
        format === "es" ? `${entryName}.js` : `${entryName}.cjs`,
    },
    rollupOptions: {
      external: [/^node:/, "vite", "webpack"],
    },
  },
});
