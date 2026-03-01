import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import { createGenerator } from "@typesafe-assets/core";
import type { StaticAssetsOptions } from "@typesafe-assets/core";

describe("core generator", () => {
    let rootDir: string;

    beforeEach(() => {
        rootDir = mkdtempSync(join(tmpdir(), "typesafe-assets-"));
    });

    it("generates sorted union paths for configured directories", () => {
        const publicDir = join(rootDir, "public");
        mkdirSync(join(publicDir, "images"), { recursive: true });
        writeFileSync(join(publicDir, "images", "z.png"), "z");
        writeFileSync(join(publicDir, "images", "a.png"), "a");

        const options: StaticAssetsOptions = {
            dirs: ["public"],
            outDir: "src/generated",
            extensions: [".png"],
            fnName: "asset",
            typeName: "AssetPath",
        };

        const generator = createGenerator(options, { root: rootDir });
        const changed = generator.generateAll();

        expect(changed).toEqual(["src/generated/public.gen.ts"]);

        const outputFile = join(rootDir, "src/generated/public.gen.ts");
        const output = readFileSync(outputFile, "utf-8");

        expect(output).toContain('export type AssetPath =');
        expect(output).toContain('  | "/images/a.png"');
        expect(output).toContain('  | "/images/z.png"');
    });

    it("regenerates only the directory impacted by a changed file path", () => {
        const publicDir = join(rootDir, "public");
        const staticDir = join(rootDir, "static");

        mkdirSync(join(publicDir, "images"), { recursive: true });
        mkdirSync(join(staticDir, "docs"), { recursive: true });

        writeFileSync(join(publicDir, "images", "hero.png"), "hero");
        writeFileSync(join(staticDir, "docs", "terms.pdf"), "terms");

        const generator = createGenerator(
            {
                dirs: ["public", { path: "static", prefix: "/static" }],
                outDir: "src/generated",
            },
            { root: rootDir },
        );

        generator.generateAll();

        writeFileSync(join(publicDir, "images", "logo.svg"), "logo");
        const changed = generator.generateForPath(join(publicDir, "images", "logo.svg"));

        expect(changed).toBe("src/generated/public.gen.ts");
    });

    it("skips generation when file list has not changed", () => {
        const publicDir = join(rootDir, "public");
        mkdirSync(publicDir, { recursive: true });
        writeFileSync(join(publicDir, "logo.png"), "logo");

        const generator = createGenerator(
            { dirs: ["public"], outDir: "src/generated" },
            { root: rootDir },
        );

        const first = generator.generateAll();
        expect(first).toEqual(["src/generated/public.gen.ts"]);

        const second = generator.generateAll();
        expect(second).toEqual([]);
    });

    it("regenerates after a file is added then skips again", () => {
        const publicDir = join(rootDir, "public");
        mkdirSync(publicDir, { recursive: true });
        writeFileSync(join(publicDir, "a.png"), "a");

        const generator = createGenerator(
            { dirs: ["public"], outDir: "src/generated" },
            { root: rootDir },
        );

        generator.generateAll();

        writeFileSync(join(publicDir, "b.png"), "b");
        const afterAdd = generator.generateAll();
        expect(afterAdd).toEqual(["src/generated/public.gen.ts"]);

        const afterNoChange = generator.generateAll();
        expect(afterNoChange).toEqual([]);
    });

    it("regenerates after a file is removed", () => {
        const publicDir = join(rootDir, "public");
        mkdirSync(publicDir, { recursive: true });
        writeFileSync(join(publicDir, "a.png"), "a");
        writeFileSync(join(publicDir, "b.png"), "b");

        const generator = createGenerator(
            { dirs: ["public"], outDir: "src/generated" },
            { root: rootDir },
        );

        generator.generateAll();

        unlinkSync(join(publicDir, "b.png"));
        const afterRemove = generator.generateAll();
        expect(afterRemove).toEqual(["src/generated/public.gen.ts"]);
    });
});
