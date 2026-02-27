import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";
import plugin from "../lib/eslint/index";

const fixture = (name: string) =>
    readFileSync(join(process.cwd(), "tests/fixtures/eslint", name), "utf8");

const ruleName = "typesafe-assets/prefer-generated-asset-helper";

type RuleMessage = { ruleId: string | null };

async function runLint({
    code,
    filePath,
    parser,
}: {
    code: string;
    filePath: string;
    parser: string;
}): Promise<RuleMessage[]> {
    const parserModule = await import(parser);
    const resolvedParser = (parserModule as { default?: unknown }).default ?? parserModule;

    const parserOptions: Record<string, unknown> = {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
    };

    if (parser === "vue-eslint-parser" || parser === "svelte-eslint-parser") {
        const tsParserModule = await import("@typescript-eslint/parser");
        parserOptions.parser = (tsParserModule as { default?: unknown }).default ?? tsParserModule;
    }

    const eslint = new ESLint({
        ignore: false,
        overrideConfigFile: true,
        overrideConfig: {
            files: ["**/*.{js,jsx,ts,tsx,vue,svelte}"],
            plugins: {
                "typesafe-assets": plugin,
            },
            languageOptions: {
                parser: resolvedParser as never,
                parserOptions,
            },
            rules: {
                [ruleName]: "error",
            },
        },
    });

    const [result] = await eslint.lintText(code, {
        filePath: join(process.cwd(), filePath),
    });

    return (result?.messages ?? []) as RuleMessage[];
}

describe("eslint plugin", () => {
    it("flags raw JSX src strings", async () => {
        const messages = await runLint({
            code: fixture("invalid.tsx"),
            filePath: "src/invalid.tsx",
            parser: "@typescript-eslint/parser",
        });

        expect(messages.some((m) => m.ruleId === ruleName)).toBe(true);
    });

    it("accepts JSX helper calls imported from .gen files", async () => {
        const messages = await runLint({
            code: fixture("valid.tsx"),
            filePath: "src/valid.tsx",
            parser: "@typescript-eslint/parser",
        });

        expect(messages).toHaveLength(0);
    });

    it("flags raw Vue template src strings", async () => {
        const messages = await runLint({
            code: fixture("invalid.vue"),
            filePath: "src/invalid.vue",
            parser: "vue-eslint-parser",
        });

        expect(messages.some((m) => m.ruleId === ruleName)).toBe(true);
    });

    it("accepts Vue helper calls imported from .gen files", async () => {
        const messages = await runLint({
            code: fixture("valid.vue"),
            filePath: "src/valid.vue",
            parser: "vue-eslint-parser",
        });

        expect(messages).toHaveLength(0);
    });

    it("flags raw Svelte template src strings", async () => {
        const messages = await runLint({
            code: fixture("invalid.svelte"),
            filePath: "src/invalid.svelte",
            parser: "svelte-eslint-parser",
        });

        expect(messages.some((m) => m.ruleId === ruleName)).toBe(true);
    });

    it("accepts Svelte helper calls imported from .gen files", async () => {
        const messages = await runLint({
            code: fixture("valid.svelte"),
            filePath: "src/valid.svelte",
            parser: "svelte-eslint-parser",
        });

        expect(messages).toHaveLength(0);
    });
});
