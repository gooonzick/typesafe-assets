import { basename, join, relative, resolve } from "node:path";
import { DirEntry, ResolvedDir } from "./types";

export function normalizeDirs(
    dirs: Array<string | DirEntry>,
    root: string,
    outDir: string,
): ResolvedDir[] {
    const resolvedOutDir = resolve(root, outDir);

    return dirs.map((entry) => {
        const dirPath = typeof entry === "string" ? entry : entry.path;
        const prefix = (typeof entry === "object" ? entry.prefix : undefined) ?? "";
        const filename =
            (typeof entry === "object" ? entry.filename : undefined) ??
            `${basename(dirPath)}.gen.ts`;

        const absPath = resolve(root, dirPath);
        const outFile = join(resolvedOutDir, filename);

        return {
            absPath,
            relPath: dirPath,
            prefix: prefix.replace(/\/+$/, ""), // strip trailing slashes
            outFile,
            outRelative: relative(root, outFile),
            lastHash: "",
        };
    });
}