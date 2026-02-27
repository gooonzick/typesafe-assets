export interface DirEntry {
    /** Directory to scan for static assets, relative to project root. */
    path: string;
    /** Prefix prepended to every generated path (for example: /cdn). */
    prefix?: string;
    /** Override output filename (defaults to {dirname}.gen.ts). */
    filename?: string;
}

export interface StaticAssetsOptions {
    dirs?: Array<string | DirEntry>;
    outDir?: string;
    extensions?: string[];
    exclude?: string[];
    fnName?: string;
    typeName?: string;
}

export interface ResolvedDir {
    absPath: string;
    relPath: string;
    prefix: string;
    outFile: string;
    outRelative: string;
    lastHash: string;
}

export interface GeneratorRuntimeOptions {
    root: string;
}

export interface StaticAssetsGenerator {
    generateAll(): string[];
    generateForPath(filePath: string): string | undefined;
    getWatchedPaths(): string[];
}
