import { createGenerator } from "@typesafe-assets/core";
import type { StaticAssetsGenerator, StaticAssetsOptions } from "@typesafe-assets/core";
import type { Plugin } from "vite";

export default function staticAssets(options: StaticAssetsOptions = {}) {
    let generator: StaticAssetsGenerator | undefined;

    // ─── Vite plugin hooks ───────────────────────────────────

    return {
        name: "vite-plugin-typesafe-assets",
        enforce: "pre" as const,

        configResolved(config: { root: string }) {
            generator = createGenerator(options, { root: config.root });
        },

        buildStart() {
            if (!generator) return;
            const changed = generator.generateAll();
            if (changed.length > 0) {
                console.log(`[static-assets] Generated: ${changed.join(", ")}`);
            }
        },

        configureServer(server: {
            watcher: {
                add(path: string): void;
                on(event: string, cb: (path: string) => void): void;
            };
        }) {
            if (!generator) return;
            const watcher = server.watcher;

            const handleChange = (filePath: string) => {
                const changed = generator?.generateForPath(filePath);
                if (changed) {
                    console.log(
                        `[static-assets] Regenerated ${changed}`,
                    );
                }
            };

            for (const watchPath of generator.getWatchedPaths()) {
                watcher.add(watchPath);
            }

            watcher.on("add", handleChange);
            watcher.on("unlink", handleChange);
            watcher.on("unlinkDir", handleChange);
        },
    } satisfies Plugin;
}

