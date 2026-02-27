# vite-plugin-static-assets

Zero-runtime compile-time validation and autocomplete for static asset paths in Vite projects.

## Problem

Static assets served from `public/` are referenced by string paths. Rename a file, make a typo — you find out at runtime (or your users do).

## Solution

This plugin scans your asset directories and generates TypeScript modules with:

- A **union type** of all valid asset paths
- An **identity function** `asset()` that validates paths at compile time

Full IDE autocomplete, compile-time errors on invalid paths, **zero bytes added to the bundle**.

## Install

```bash
npm install -D vite-plugin-static-assets
```

## Quick start

```ts
// vite.config.ts
import { defineConfig } from "vite";
import staticAssets from "vite-plugin-static-assets";

export default defineConfig({
  plugins: [staticAssets()],
});
```

```ts
// In your code
import { asset } from "./generated/public.gen";

const hero = asset("/images/hero.png"); // ✅ autocomplete + validated
const bad = asset("/images/oops.png"); // ❌ TypeScript error
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

In dev mode the plugin watches all configured directories. Adding, removing, or renaming files triggers instant regeneration. Content hashing ensures the file is only rewritten when paths actually change — no unnecessary HMR.

## License

MIT
