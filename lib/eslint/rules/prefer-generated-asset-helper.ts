type RuleOptions = {
    attributes?: string[];
    extensions?: string[];
};

const DEFAULT_ATTRIBUTES = new Set(["src", "srcSet"]);
const GEN_IMPORT_RE = /\.gen(?:\.ts)?$/;

function asStringLiteral(node: unknown): string | undefined {
    if (!node || typeof node !== "object") return undefined;
    const candidate = node as { type?: string; value?: unknown; raw?: unknown };

    if (candidate.type === "Literal" && typeof candidate.value === "string") {
        return candidate.value;
    }

    if (candidate.type === "TemplateLiteral") {
        const template = candidate as {
            expressions?: unknown[];
            quasis?: Array<{ value?: { cooked?: string } }>;
        };

        if ((template.expressions?.length ?? 0) === 0 && (template.quasis?.length ?? 0) === 1) {
            return template.quasis?.[0]?.value?.cooked;
        }
    }

    return undefined;
}

function looksLikeAssetPath(value: string, extensions: string[]): boolean {
    const trimmed = value.trim();
    if (!trimmed.startsWith("/")) return false;

    if (extensions.length === 0) {
        return true;
    }

    return extensions.some((ext) => trimmed.endsWith(ext));
}

function srcSetHasAssetPath(value: string, extensions: string[]): boolean {
    const parts = value
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean)
        .map((entry) => entry.split(/\s+/)[0]);

    return parts.some((candidate) => looksLikeAssetPath(candidate, extensions));
}

function isTargetAttribute(name: string, attrs: Set<string>): boolean {
    return attrs.has(name);
}

function normalizeOptions(options: RuleOptions | undefined): Required<RuleOptions> {
    const attributes = options?.attributes?.filter(Boolean) ?? [...DEFAULT_ATTRIBUTES];
    const extensions = options?.extensions?.filter(Boolean) ?? [];
    return { attributes, extensions };
}

function checkTemplateText(
    sourceText: string,
    attrs: Set<string>,
    extensions: string[],
    report: (message: string) => void,
) {
    for (const attr of attrs) {
        const rawPattern = new RegExp(`\\b${attr}\\s*=\\s*(["'])(.*?)\\1`, "g");

        for (const match of sourceText.matchAll(rawPattern)) {
            const value = match[2] ?? "";
            const isAsset = attr === "srcSet" ? srcSetHasAssetPath(value, extensions) : looksLikeAssetPath(value, extensions);

            if (isAsset) {
                report(`Use a helper imported from *.gen files for ${attr} values.`);
            }
        }
    }
}

const rule = {
    meta: {
        type: "problem",
        docs: {
            description: "Require generated asset helpers for resource attributes",
        },
        schema: [
            {
                type: "object",
                properties: {
                    attributes: {
                        type: "array",
                        items: { type: "string" },
                    },
                    extensions: {
                        type: "array",
                        items: { type: "string" },
                    },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            preferGeneratedHelper: "Use a helper imported from *.gen files for '{{attr}}'.",
        },
    },
    create(context: {
        options: RuleOptions[];
        filename?: string;
        sourceCode: { getText: () => string };
        report: (arg: { node: unknown; messageId?: string; data?: Record<string, string>; message?: string }) => void;
        getFilename?: () => string;
    }) {
        const opts = normalizeOptions(context.options[0]);
        const targetAttrs = new Set(opts.attributes);
        const helperNames = new Set<string>();
        const namespaceImports = new Set<string>();

        const report = (node: unknown, attr: string) => {
            context.report({
                node,
                messageId: "preferGeneratedHelper",
                data: { attr },
            });
        };

        const isAllowedCallee = (callee: unknown): boolean => {
            if (!callee || typeof callee !== "object") return false;
            const value = callee as { type?: string; name?: string; object?: { name?: string } };

            if (value.type === "Identifier" && typeof value.name === "string") {
                return helperNames.has(value.name);
            }

            if (value.type === "MemberExpression" && value.object && typeof value.object.name === "string") {
                return namespaceImports.has(value.object.name);
            }

            return false;
        };

        const parseTemplateHelpers = (sourceText: string) => {
            for (const match of sourceText.matchAll(/import\s*\{([^}]*)\}\s*from\s*["']([^"']+)["']/g)) {
                const source = (match[2] ?? "").trim();
                if (!GEN_IMPORT_RE.test(source)) continue;

                const names = (match[1] ?? "")
                    .split(",")
                    .map((name) => name.trim())
                    .filter(Boolean)
                    .map((entry) => {
                        const alias = entry.split(/\s+as\s+/i);
                        return (alias[1] ?? alias[0])?.trim();
                    })
                    .filter(Boolean) as string[];

                for (const name of names) helperNames.add(name);
            }
        };

        return {
            ImportDeclaration(node: {
                source?: { value?: unknown };
                specifiers?: Array<{
                    type?: string;
                    local?: { name?: string };
                    imported?: { name?: string };
                }>;
            }) {
                const importSource = node.source?.value;
                if (typeof importSource !== "string" || !GEN_IMPORT_RE.test(importSource)) {
                    return;
                }

                for (const specifier of node.specifiers ?? []) {
                    if (specifier.type === "ImportSpecifier" || specifier.type === "ImportDefaultSpecifier") {
                        const localName = specifier.local?.name;
                        if (localName) helperNames.add(localName);
                    }

                    if (specifier.type === "ImportNamespaceSpecifier") {
                        const namespaceName = specifier.local?.name;
                        if (namespaceName) namespaceImports.add(namespaceName);
                    }
                }
            },

            JSXAttribute(node: {
                name?: { type?: string; name?: string };
                value?: unknown;
            }) {
                const attrName = node.name?.type === "JSXIdentifier" ? node.name.name : undefined;
                if (!attrName || !isTargetAttribute(attrName, targetAttrs)) return;

                const directLiteral = asStringLiteral(node.value);
                if (typeof directLiteral === "string") {
                    const isAsset =
                        attrName === "srcSet"
                            ? srcSetHasAssetPath(directLiteral, opts.extensions)
                            : looksLikeAssetPath(directLiteral, opts.extensions);

                    if (isAsset) report(node, attrName);
                    return;
                }

                const expression = (node.value as { type?: string; expression?: unknown } | undefined)?.expression;
                if (!expression || typeof expression !== "object") return;

                const callExpr = expression as { type?: string; callee?: unknown };
                if (callExpr.type === "CallExpression" && isAllowedCallee(callExpr.callee)) {
                    return;
                }

                const expressionLiteral = asStringLiteral(expression);
                if (typeof expressionLiteral === "string") {
                    const isAsset =
                        attrName === "srcSet"
                            ? srcSetHasAssetPath(expressionLiteral, opts.extensions)
                            : looksLikeAssetPath(expressionLiteral, opts.extensions);

                    if (isAsset) report(node, attrName);
                }
            },

            "Program:exit"(node: unknown) {
                const filename = context.getFilename ? context.getFilename() : context.filename ?? "";
                const lower = filename.toLowerCase();

                if (!lower.endsWith(".vue") && !lower.endsWith(".svelte")) {
                    return;
                }

                const sourceText = context.sourceCode.getText();
                parseTemplateHelpers(sourceText);

                checkTemplateText(sourceText, targetAttrs, opts.extensions, (message) => {
                    context.report({
                        node,
                        message,
                    });
                });

                for (const attr of targetAttrs) {
                    const vueBoundPattern = new RegExp(`(?:\\:${attr}|v-bind:${attr})\\s*=\\s*(["'])\\s*([A-Za-z_$][\\w$]*)\\s*\\(`, "g");
                    const svelteBoundPattern = new RegExp(`\\b${attr}\\s*=\\s*\\{\\s*([A-Za-z_$][\\w$]*)\\s*\\(`, "g");

                    for (const match of sourceText.matchAll(vueBoundPattern)) {
                        const callee = match[2];
                        if (callee && !helperNames.has(callee)) {
                            report(node, attr);
                        }
                    }

                    for (const match of sourceText.matchAll(svelteBoundPattern)) {
                        const callee = match[1];
                        if (callee && !helperNames.has(callee)) {
                            report(node, attr);
                        }
                    }
                }
            },
        };
    },
};

export default rule;
