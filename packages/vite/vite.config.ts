import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
    plugins: [
        dts({
            include: ["src"],
            outDir: "dist",
            entryRoot: "src",
            tsconfigPath: "./tsconfig.json",
        }),
    ],
    build: {
        lib: {
            entry: "./src/index.ts",
            formats: ["es", "cjs"],
            fileName: (format) => (format === "es" ? "index.js" : "index.cjs"),
        },
        rollupOptions: {
            external: ["@typesafe-assets/core", "vite"],
        },
    },
});