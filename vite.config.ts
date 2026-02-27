import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    dts({
      include: ["lib"],
      outDir: "dist",
      entryRoot: "lib",
      tsconfigPath: "./tsconfig.json",
    }),
  ],
  build: {
    lib: {
      entry: {
        eslint: "./lib/eslint/index.ts",
        vite: "./lib/vite/index.ts",
        webpack: "./lib/webpack/index.ts",
      },
      formats: ["es", "cjs"],
      fileName: (format, entryName) =>
        format === "es" ? `${entryName}.js` : `${entryName}.cjs`,
    },
    rollupOptions: {
      external: [/^node:/, "vite", "webpack", "eslint"],
    },
  },
});
