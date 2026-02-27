export interface DirEntry {
    /**
     * Directory to scan for static assets.
     * Relative to Vite's project root.
     */
    path: string;

    /**
     * Base path prefix prepended to every generated asset path.
     * Useful when the directory is served under a specific URL prefix.
     *
     * @default "" — paths start with "/" relative to the directory root
     *
     * @example
     *   { path: "public", prefix: "" }         → "/images/hero.png"
     *   { path: "cdn-assets", prefix: "/cdn" } → "/cdn/images/hero.png"
     */
    prefix?: string;

    /**
     * Override the generated filename for this directory.
     * By default derived from the directory name: "public" → "public.gen.ts"
     *
     * @example "static-assets.gen.ts"
     */
    filename?: string;
}

export interface StaticAssetsOptions {
    /**
     * Directories to scan for static assets.
     * Each entry can be a string (directory path) or a DirEntry object.
     *
     * @default ["public"]
     *
     * @example
     *   // Simple — just directory paths
     *   dirs: ["public", "static"]
     *
     *   // Advanced — with prefixes and custom filenames
     *   dirs: [
     *     { path: "public", prefix: "" },
     *     { path: "cdn-assets", prefix: "/cdn", filename: "cdn.gen.ts" },
     *   ]
     *
     *   // Mixed
     *   dirs: ["public", { path: "shared-assets", prefix: "/shared" }]
     */
    dirs?: Array<string | DirEntry>;

    /**
     * Output directory for the generated .ts helper modules.
     * Each scanned directory produces its own file inside this directory.
     * Relative to Vite's project root.
     *
     * @default "src/generated"
     *
     * @example
     *   dirs: ["public", "static"]
     *   outDir: "src/generated"
     *   // → src/generated/public.gen.ts
     *   // → src/generated/static.gen.ts
     */
    outDir?: string;

    /**
     * File extensions to include. If empty — all files are included.
     * @default [] (all files)
     */
    extensions?: string[];

    /**
     * Patterns to exclude (substring match against relative path).
     * @default []
     */
    exclude?: string[];

    /**
     * Name of the exported identity function.
     * @default "asset"
     */
    fnName?: string;

    /**
     * Name of the exported union type.
     * @default "AssetPath"
     */
    typeName?: string;
}

export interface ResolvedDir {
    /** Absolute path to the scanned directory */
    absPath: string;
    /** Original relative path (for logging) */
    relPath: string;
    /** Prefix prepended to generated paths */
    prefix: string;
    /** Absolute path to the generated output file */
    outFile: string;
    /** Output filename (for logging) */
    outRelative: string;
    /** Content hash of last written file */
    lastHash: string;
}