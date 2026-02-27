import type { Compiler } from "webpack";

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

export declare class TypesafeAssetsWebpackPlugin {
    constructor(options?: StaticAssetsOptions);
    apply(compiler: Compiler): void;
}

export default function staticAssetsWebpack(options?: StaticAssetsOptions): TypesafeAssetsWebpackPlugin;
