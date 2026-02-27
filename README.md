# typesafe-assets

Zero-runtime compile-time validation and autocomplete for static asset paths.

The package is split into adapter-specific entrypoints:

- `typesafe-assets/eslint`
- `typesafe-assets/vite`
- `typesafe-assets/webpack`

## Problem

Static assets served from `public/` are referenced by string paths. Rename a file, make a typo — you find out at runtime (or your users do).

## Solution

This tool scans your asset directories and generates TypeScript modules with:

- A **union type** of all valid asset paths
- An **identity function** `asset()` that validates paths at compile time

Full IDE autocomplete, compile-time errors on invalid paths, **zero bytes added to the bundle**.

## Install

Install with your package manager and use the adapter import that matches your bundler.

## Quick start

Vite:

```ts
import { defineConfig } from "vite";
import staticAssets from "typesafe-assets/vite";

export default defineConfig({
  plugins: [staticAssets()],
});
```

Webpack:

```ts
import { defineConfig } from "webpack";
import staticAssetsWebpack from "typesafe-assets/webpack";

export default {
  plugins: [staticAssetsWebpack()],
};
```

In your app code (same for any adapter):

```ts
import { asset } from "./generated/public.gen";

const hero = asset("/images/hero.png"); // valid path
const bad = asset("/images/oops.png"); // TypeScript error
```

## Multiple directories

Scan several directories — each gets its own generated module:

```ts
staticAssets({
  dirs: [
    "public",
    { path: "static", prefix: "/static" },
    { path: "cdn-assets", prefix: "/cdn", filename: "cdn.gen.ts" },
  ],
  outDir: "src/generated",
});
```

This generates:

```
src/generated/
  public.gen.ts    → paths like "/images/hero.png"
  static.gen.ts    → paths like "/static/docs/terms.pdf"
  cdn.gen.ts       → paths like "/cdn/logos/main.svg"
```

Usage:

```ts
import { asset } from "./generated/public.gen";
import { asset as cdnAsset } from "./generated/cdn.gen";

const hero = asset("/images/hero.png");
const logo = cdnAsset("/cdn/logos/main.svg");
const url = `${import.meta.env.VITE_CDN_URL}${cdnAsset("/cdn/logos/main.svg")}`;
```

## What ends up in the bundle?

```js
// Source
const url = asset("/images/hero.png");

// Production build — function inlined to bare string
const url = "/images/hero.png";
```

## Options

```ts
staticAssets({
  // Directories to scan — string or DirEntry objects
  dirs: ["public"], // default

  // Output directory for generated .ts modules
  outDir: "src/generated", // default

  // Only include specific extensions (empty = all)
  extensions: [".png", ".svg"], // default: []

  // Exclude patterns (substring match)
  exclude: [".DS_Store"], // default: []

  // Customize exported names
  fnName: "asset", // default
  typeName: "AssetPath", // default
});
```

### DirEntry

```ts
{
  path: "cdn-assets",        // directory to scan (relative to root)
  prefix: "/cdn",            // prepended to all generated paths
  filename: "cdn.gen.ts",    // output filename (default: "{dirname}.gen.ts")
}
```

## Watch mode

Both adapters regenerate on asset changes in watch/dev mode. Content hashing ensures generated files are only rewritten when content actually changes.

## ESLint plugin

Use the ESLint plugin to prevent raw asset strings and require generated helpers from `*.gen` files.

### Install parser dependencies

If your project uses framework templates, also install the matching parser:

- Vue: `vue-eslint-parser`
- Svelte: `svelte-eslint-parser`
- JSX/Solid: `@typescript-eslint/parser` (or your JSX parser)

### React or Solid (JSX)

```js
import typesafeAssets from "typesafe-assets/eslint";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      parser: tsParser,
    },
    plugins: {
      "typesafe-assets": typesafeAssets,
    },
    rules: {
      "typesafe-assets/prefer-generated-asset-helper": "error",
    },
  },
];
```

### Vue

```js
import typesafeAssets from "typesafe-assets/eslint";
import vueParser from "vue-eslint-parser";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
      },
    },
    plugins: {
      "typesafe-assets": typesafeAssets,
    },
    rules: {
      "typesafe-assets/prefer-generated-asset-helper": "error",
    },
  },
];
```

### Svelte

```js
import typesafeAssets from "typesafe-assets/eslint";
import svelteParser from "svelte-eslint-parser";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    files: ["**/*.svelte"],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        parser: tsParser,
      },
    },
    plugins: {
      "typesafe-assets": typesafeAssets,
    },
    rules: {
      "typesafe-assets/prefer-generated-asset-helper": "error",
    },
  },
];
```

### What it enforces

- Flags `src` and `srcSet` raw literals like `"/images/hero.png"`
- Accepts helper calls when the helper is imported from a generated `*.gen` module
- Works for JSX, Vue templates, and Svelte templates

## Migration from Vite-only plugin

Replace:

```ts
import staticAssets from "vite-plugin-static-assets";
```

with:

```ts
import staticAssets from "typesafe-assets/vite";
```

## License

MIT
