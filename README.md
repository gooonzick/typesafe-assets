# typesafe-assets

Type-safe static asset paths with zero runtime cost.

This repository is a monorepo with four workspace packages:

- `@typesafe-assets/core`
- `@typesafe-assets/vite`
- `@typesafe-assets/webpack`
- `@typesafe-assets/eslint`

## Why this exists

Asset paths are usually plain strings. Typos and stale paths are easy to ship and only fail at runtime.

`typesafe-assets` scans configured asset directories and generates `.gen.ts` modules containing:

- A string-literal union type of valid asset paths
- A typed helper function (default: `asset`) that enforces the union at compile time

The helper is an identity function, so bundlers inline the value to a plain string.

## Package docs

- Core API: `packages/core/README.md`
- Vite plugin: `packages/vite/README.md`
- Webpack plugin: `packages/webpack/README.md`
- ESLint plugin: `packages/eslint/README.md`

## Monorepo development

Install dependencies:

```bash
pnpm install
```

Build all packages:

```bash
pnpm build
```

Run all tests:

```bash
pnpm test
```

Typecheck all packages:

```bash
pnpm typecheck
```

## Quick examples

Vite:

```ts
import { defineConfig } from "vite";
import staticAssets from "@typesafe-assets/vite";

export default defineConfig({
  plugins: [staticAssets()],
});
```

Webpack:

```ts
import staticAssetsWebpack from "@typesafe-assets/webpack";

export default {
  plugins: [staticAssetsWebpack()],
};
```

Use generated helper:

```ts
import { asset } from "./generated/public.gen";

const hero = asset("/images/hero.png");
```

## License

MIT
