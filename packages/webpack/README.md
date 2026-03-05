# @typesafe-assets/webpack

Webpack plugin that generates type-safe static asset helpers from configured directories.

## Install

```bash
pnpm add -D @typesafe-assets/webpack
```

Peer dependency:

- `webpack >= 5`

## Usage

```ts
import staticAssetsWebpack from "@typesafe-assets/webpack";

export default {
  plugins: [
    staticAssetsWebpack({
      dirs: ["public"],
      outDir: "src/generated",
    }),
  ],
};
```

Class form is also exported:

```ts
import { TypesafeAssetsWebpackPlugin } from "@typesafe-assets/webpack";

export default {
  plugins: [new TypesafeAssetsWebpackPlugin()],
};
```

## Options

Accepts `StaticAssetsOptions` from `@typesafe-assets/core`:

- `dirs?: Array<string | DirEntry>`
- `outDir?: string`
- `extensions?: string[]`
- `exclude?: string[]`
- `fnName?: string`
- `typeName?: string`

## Behavior

- Generates on `beforeRun`.
- In watch mode, regenerates only affected generated modules for changed files when possible.
- Logs changed generated files to stdout.
