# Ancient Guardian Oak Builder — Layer 5 (v14)

This release contains the approved Layer 5 blueprint and uses new asset filenames so an older cached app cannot hide the Layer 5 blocks.

## Layer 5 blueprint
- 19 × 19 grid
- 107 Puffy Tree Pillars
- Build directly above Layer 4
- Omit 7 Layer 4 positions, shown with red X markers
- Keep the Pokémon Center courtyard and south entrance open
- Preserve the small decorative shelf protrusions
- Begin a gentle taper while keeping the left side slightly heavier

## What v14 fixes
- Brown Layer 5 blocks are always visible.
- Red X markers appear only where a Layer 4 block stops.
- The app now loads `app-v14.js` and `styles-v14.css`, bypassing stale copies of the older files.
- The app clears old service-worker caches and installs `sw-v14.js`.
- The version label at the top reads `v14`.

## GitHub update
Upload all five files from this package to the repository root:
- `index.html`
- `app-v14.js`
- `styles-v14.css`
- `sw-v14.js`
- `README.md`

Keep the existing `icons` folder and `manifest.webmanifest`.

The older `app.js`, `styles.css`, and `sw.js` files may remain in the repository; v14 no longer references them.
