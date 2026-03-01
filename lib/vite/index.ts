import { createGenerator } from "../core";
import type { StaticAssetsGenerator, StaticAssetsOptions } from "../core";

type WatchEvent = "add" | "unlink" | "unlinkDir";

interface DevWatcher {
    add(path: string): void;
    on(event: WatchEvent, handler: (filePath: string) => void): void;
}

interface ViteLikeDevServer {
    watcher: DevWatcher;
}

interface ViteLikePlugin {
    name: string;
    enforce?: "pre" | "post";
    configResolved(config: { root: string }): void;
    buildStart(): void;
    configureServer(server: ViteLikeDevServer): void;
}

export default function staticAssets(options: StaticAssetsOptions = {}): ViteLikePlugin {
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

        configureServer(server: ViteLikeDevServer) {
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

