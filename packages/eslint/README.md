# @typesafe-assets/eslint

ESLint plugin that enforces generated asset helpers instead of raw static-asset strings.

## Install

```bash
pnpm add -D @typesafe-assets/eslint eslint
```

Peer dependency:

- `eslint >= 9`

## Rule

- `typesafe-assets/prefer-generated-asset-helper`

The rule reports direct asset strings in `src`/`srcSet` and allows helper calls imported from `*.gen` files.

## Flat config usage

```js
import typesafeAssets from "@typesafe-assets/eslint";
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

Or use the bundled config:

```js
import typesafeAssets from "@typesafe-assets/eslint";

export default [...typesafeAssets.configs.recommended];
```

## Rule options

```js
{
  "typesafe-assets/prefer-generated-asset-helper": [
    "error",
    {
      attributes: ["src", "srcSet"],
      extensions: [".png", ".jpg", ".svg"]
    }
  ]
}
```

Option defaults:

- `attributes`: `["src", "srcSet"]`
- `extensions`: `[]` (match any absolute path beginning with `/`)

## Framework support

The rule handles:

- JSX/TSX attributes
- Vue templates (`.vue`)
- Svelte templates (`.svelte`)

For `.vue` and `.svelte`, configure the corresponding parser (`vue-eslint-parser` / `svelte-eslint-parser`).
