import type { Compiler } from "webpack";
import { createGenerator } from "@typesafe-assets/core";
import type { StaticAssetsGenerator, StaticAssetsOptions } from "@typesafe-assets/core";

const PLUGIN_NAME = "TypesafeAssetsWebpackPlugin";

export class TypesafeAssetsWebpackPlugin {
    private generator: StaticAssetsGenerator | undefined;

    constructor(private readonly options: StaticAssetsOptions = {}) { }

    apply(compiler: Compiler): void {
        const ensureGenerator = (): StaticAssetsGenerator => {
            if (!this.generator) {
                this.generator = createGenerator(this.options, { root: compiler.context });
            }
            return this.generator;
        };

        const logGenerated = (changed: string[]): void => {
            if (changed.length > 0) {
                console.log(`[typesafe-assets:webpack] Generated: ${changed.join(", ")}`);
            }
        };

        compiler.hooks.beforeRun.tap(PLUGIN_NAME, () => {
            const changed = ensureGenerator().generateAll();
            logGenerated(changed);
        });

        compiler.hooks.watchRun.tap(PLUGIN_NAME, (watchCompiler) => {
            const generator = ensureGenerator();
            const modifiedFiles = watchCompiler.modifiedFiles;

            if (!modifiedFiles || modifiedFiles.size === 0) {
                logGenerated(generator.generateAll());
                return;
            }

            for (const filePath of modifiedFiles) {
                const changed = generator.generateForPath(filePath);
                if (changed) {
                    console.log(`[typesafe-assets:webpack] Regenerated ${changed}`);
                }
            }
        });
    }
}

export default function staticAssetsWebpack(
    options: StaticAssetsOptions = {},
): TypesafeAssetsWebpackPlugin {
    return new TypesafeAssetsWebpackPlugin(options);
}

export type { DirEntry, StaticAssetsOptions } from "@typesafe-assets/core";
