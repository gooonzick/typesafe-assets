import type { Plugin, ViteDevServer } from "vite";
import { createGenerator } from "../core";
import type { StaticAssetsGenerator, StaticAssetsOptions } from "../core";



export default function staticAssets(options: StaticAssetsOptions = {}): Plugin {
    let generator: StaticAssetsGenerator | undefined;

    // ─── Vite plugin hooks ───────────────────────────────────

    return {
        name: "vite-plugin-typesafe-assets",
        enforce: "pre",

        configResolved(config) {
            generator = createGenerator(options, { root: config.root });
        },

        buildStart() {
            if (!generator) return;
            const changed = generator.generateAll();
            if (changed.length > 0) {
                console.log(`[static-assets] Generated: ${changed.join(", ")}`);
            }
        },

        configureServer(server: ViteDevServer) {
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
    };
}

