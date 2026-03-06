# @gooonzick/typesafe-assets-vite

Vite plugin that generates type-safe static asset helpers from configured directories.

## Install

```bash
pnpm add -D @gooonzick/typesafe-assets-vite
```

Peer dependency:

- `vite >= 5`

## Usage

```ts
import { defineConfig } from "vite";
import staticAssets from "@gooonzick/typesafe-assets-vite";

export default defineConfig({
  plugins: [
    staticAssets({
      dirs: ["public"],
      outDir: "src/generated",
    }),
  ],
});
```

Use the generated helper in app code:

```ts
import { asset } from "./generated/public.gen";

const logo = asset("/images/logo.png");
```

## Options

Accepts `StaticAssetsOptions` from `@gooonzick/typesafe-assets-core`:

- `dirs?: Array<string | DirEntry>`
- `outDir?: string`
- `extensions?: string[]`
- `exclude?: string[]`
- `fnName?: string`
- `typeName?: string`

## Behavior

- Generates on `buildStart`.
- In dev server mode, watches configured directories and regenerates on `add`, `unlink`, and `unlinkDir`.
- Logs changed generated files to stdout.
