import type { Plugin } from "vite";

export interface DirEntry {
    path: string;
    prefix?: string;
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

export default function staticAssets(options?: StaticAssetsOptions): Plugin;
