
import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
	resolve: {
		alias: {
			"@typesafe-assets/core": fileURLToPath(new URL("../core/src/index.ts", import.meta.url)),
			"@typesafe-assets/vite": fileURLToPath(new URL("./src/index.ts", import.meta.url)),
		},
	},
	test: {
		environment: "node",
		include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
		globals: true,
	},
});
