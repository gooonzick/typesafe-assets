# @typesafe-assets/core

Core generator used by bundler adapters.

`@typesafe-assets/core` scans configured static-asset directories and writes generated TypeScript modules (for example `public.gen.ts`) containing:

- A path union type (default: `AssetPath`)
- A typed helper function (default: `asset`)

## API

### `createGenerator(options, runtime)`

Creates a generator instance.

```ts
import { createGenerator } from "@typesafe-assets/core";

const generator = createGenerator(
  {
    dirs: ["public"],
    outDir: "src/generated",
    extensions: [".png", ".svg"],
    exclude: [".DS_Store"],
    fnName: "asset",
    typeName: "AssetPath",
  },
  { root: process.cwd() },
);

generator.generateAll();
```

Generator methods:

- `generateAll(): string[]`
- `generateForPath(filePath: string): string | undefined`
- `getWatchedPaths(): string[]`

### `normalizeDirs(dirs, root, outDir)`

Normalizes directory configuration into resolved entries with absolute input paths and output file locations.

## Options

```ts
type StaticAssetsOptions = {
  dirs?: Array<string | DirEntry>;
  outDir?: string;
  extensions?: string[];
  exclude?: string[];
  fnName?: string;
  typeName?: string;
};

type DirEntry = {
  path: string;
  prefix?: string;
  filename?: string;
};
```

Defaults:

- `dirs`: `["public"]`
- `outDir`: `"src/generated"`
- `extensions`: `[]` (include all files)
- `exclude`: `[]` (substring match)
- `fnName`: `"asset"`
- `typeName`: `"AssetPath"`

## Generated module shape

```ts
export type AssetPath = "/images/a.png" | "/images/b.png";

export function asset<T extends AssetPath>(path: T): T {
  return path;
}
```

## Notes

- File ordering is stable and sorted.
- Dotfiles/directories are ignored.
- Generated files are only rewritten when content changes.
