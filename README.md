# Ancient Guardian Oak Builder — Layer 4

This release adds the approved Layer 4 lower-trunk shape while preserving saved progress and the working layer-comparison controls.

## Layer 4 specification
- 19 × 19 grid
- 114 Puffy Tree Pillars
- Build directly above Layer 3
- Omit 17 Layer 3 positions
- No outward additions
- Keep the Pokémon Center courtyard and south entrance open
- Preserve the small side protrusions as future shelves for mushrooms, glowing lights, vines, and other decorations

## Comparison view
- Brown: block to place on Layer 4
- Red X: block exists on Layer 3 but stops there
- Gray ghost: previous-layer reference when enabled
- For changes only, turn off Current layer and Previous layer while leaving Additions and removals enabled

## GitHub update
Replace these five files in the repository root:
- index.html
- styles.css
- app.js
- sw.js
- README.md

Keep the existing `icons` folder and `manifest.webmanifest`.


## Layer 4 view fix (v9)
When changing layers, the app now automatically returns to normal build view: current-layer blocks on, previous-layer ghost off, and additions/removals on. This prevents a saved changes-only display from making Layer 4 appear to consist entirely of red X markers.


## Version 10 Layer 4 display correction
Current-layer blocks remain brown. Red X markers are now a separate overlay and appear only at the 17 Layer 3 positions omitted on Layer 4.
