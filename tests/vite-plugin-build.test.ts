import { existsSync, mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { build } from "vite";
import { describe, expect, it } from "vitest";
import staticAssets from "../lib/vite/index";

describe("vite plugin build integration", () => {
    it("generates helper module during vite build", async () => {
        const rootDir = mkdtempSync(join(tmpdir(), "typesafe-assets-vite-build-"));

        mkdirSync(join(rootDir, "public", "images"), { recursive: true });
        mkdirSync(join(rootDir, "src"), { recursive: true });

        writeFileSync(join(rootDir, "public", "images", "hero.png"), "hero");
        writeFileSync(join(rootDir, "src", "main.ts"), "export const ok = true;\n");

        await build({
            root: rootDir,
            logLevel: "silent",
            plugins: [
                staticAssets({
                    dirs: ["public"],
                    outDir: "src/generated",
                }),
            ],
            build: {
                write: false,
                lib: {
                    entry: join(rootDir, "src", "main.ts"),
                    formats: ["es"],
                    fileName: "bundle",
                },
            },
        });

        const outputFile = join(rootDir, "src", "generated", "public.gen.ts");

        expect(existsSync(outputFile)).toBe(true);
        expect(readFileSync(outputFile, "utf8")).toContain('"/images/hero.png"');
    });
});