# Ivy Research brand assets

This repository contains the source SVG artwork and generated exports for the approved Ivy Research logo. In the horizontal lockup, the connected-dot mark functions as the `I`, so the adjacent text starts with `vy Research`. Standalone wordmark and stacked variants spell out `Ivy Research`.

## Contents

- `source/` canonical editable SVGs. The wordmark is converted to path geometry, so the SVGs do not depend on a viewer having the font installed.
- `dist/svg/` production SVG exports for horizontal, stacked, mark, wordmark, and favicon variants.
- `dist/png/` transparent PNG exports at common web and presentation sizes.
- `dist/icons/` favicon, app icon, Apple touch icon, and web manifest assets.
- `dist/previews/` flattened previews on white or black backgrounds for quick review.
- `scripts/generate-assets.mjs` reproducible generator for rebuilding the package.

## Rebuild

```sh
npm install
npm run build
```

The generator uses Avenir Next Demi Bold from macOS to trace the wordmark into SVG paths. If that font is elsewhere, set `IVY_RESEARCH_FONT_PATH=/path/to/font.ttc` and optionally `IVY_RESEARCH_FONT_NAME="Avenir Next Demi Bold"` before running `npm run build`.

## Primary Assets

- Horizontal logo: `dist/svg/logo-horizontal-black.svg`
- Inverse horizontal logo: `dist/svg/logo-horizontal-white.svg`
- Mark: `dist/svg/mark-black.svg`
- Wordmark: `dist/svg/wordmark-black.svg`
- Favicon: `dist/icons/favicon.ico`, `dist/icons/favicon.svg`
- App icons: `dist/icons/icon-192.png`, `dist/icons/icon-512.png`, `dist/icons/apple-touch-icon.png`
