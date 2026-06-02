# Handoff: Ohio Regions Interactive Map

## Overview
An interactive, editable map of Ohio's 7 JobsOhio business regions (Northeast, Eastern, Northwest, West, Central, Southwest, Southeast). Regions render as a soft-pastel "3D plaque" on a slight perspective tilt. Hovering a region (on the map or in the left label list) lifts it above its neighbors with a brighter face and drop shadow; clicking pins it. A detail card surfaces the region's cities and highlights. Colors, fonts, raise height, and perspective tilt are all live-editable through a Tweaks panel.

## About the Design Files
The files in this bundle are a **working design reference built in HTML/CSS/vanilla JS + a small React layer for the Tweaks panel**. They run as-is in a browser, but they are a *prototype of intended look and behavior* — not necessarily production code to paste directly. The task on the other side is to **recreate this design in the target codebase's environment** (React/Vue/Svelte/etc.) using its established component and styling patterns. If there is no existing environment, the HTML files can be shipped/iterated on directly — they are self-contained aside from CDN-loaded React/Babel and Google Fonts.

To run locally: serve the folder over a static server (e.g. `npx serve .`) and open **`Ohio Regions Map.html`**. Opening via `file://` works too, but a server avoids any fetch/font quirks.

## Fidelity
**High-fidelity.** Final colors, typography, geometry, spacing, and interactions are all in place. The region/state geometry is exact — extracted from the provided source SVG (`src-neo.svg`), not approximated.

## Architecture / Files
- **`Ohio Regions Map.html`** — entry point. Holds all CSS (design tokens in `:root`), the left panel markup (title + region list + hint), the map mount (`#map-root`), the detail card (`#detail`), and the Tweaks mount (`#tweaks-root`). Loads the scripts below in order.
- **`svg-geo.js`** — auto-extracted exact geometry from the source SVG: `window.SVG_GEO = { viewBox, outline, regions{7 path strings}, majorDots[], minorDots[], star }`. Coordinate space is the source viewBox `0 0 670 600`.
- **`map-data.js`** — builds `window.MAP_DATA`: parses each region path to points + centroid, attaches region metadata (display name, two-line label, label position, tagline, cities, highlights), maps city dots → names, defines surroundings (neighbor-state border polylines, faded state-name labels, Lake Erie path), and the scene viewBox/rect.
- **`map.js`** — the renderer + interaction engine (vanilla, no framework). Builds the SVG scene, fakes 3D extrusion, handles hover/pin, draw-order, the detail card, and exposes `window.MAP`.
- **`app.jsx`** — React Tweaks panel. Reads/writes design tokens on `document.documentElement.style` and calls `window.MAP.setLiftUnits()` / `window.MAP.recolorGradient()`.
- **`tweaks-panel.jsx`** — Tweaks panel shell/host wiring + form-control components (provided scaffold; not design-specific).
- **`src-neo.svg`** — the original source SVG the geometry was extracted from (reference only).

## The 3D / perspective technique (important to replicate)
There are **two** stacked effects:

1. **Per-region extrusion (inside the SVG).** Each region is drawn as a `<g class="region">` containing a `<g class="walls">` (many copies of the region path translated downward in +y by 1px increments, from `REST_DEPTH` up to the lifted top) and a `<g class="lift">` holding the `top` face path + label + city markers. Raising a region animates `lift` upward (`translate(0, -liftY)`) and rebuilds the walls taller. `REST_DEPTH = 9` (resting thickness), lift height ≈ `tilt slider → window.MAP.setLiftUnits()`.
2. **Whole-plate perspective (CSS).** `.stage` gets `perspective: 1700px; perspective-origin: 50% 42%`. `#map-root` gets `transform: rotateX(var(--tilt-x)) rotateZ(var(--tilt-z)) scale(var(--tilt-scale))` with a `.45s` transition. Default tilt-x `20deg`, tilt-z `-5deg`, scale `1.04`.

Region tops are filled with a **per-region solid color sampled along the NW→SE diagonal** of a 3-stop palette (computed in JS in `map.js` `regionFills()` / `recolorGradient()`), NOT an SVG gradient paint-server — this was deliberate (the gradient `var()` stop-color did not resolve reliably). If reimplementing, compute each region's fill from its centroid position along the palette ramp.

## Interactions & Behavior
- **Hover** a region (map shape or left list item) → that region animates up (`animateLift`, ~280ms, ease-out cubic), gets `.active` (brighter/saturated face, accent stroke, taller wall, `liftShadow` filter), moves to top of draw order, and the detail card fades in. Moving away drops it back — *unless pinned*.
- **Click** a region or list item → toggles **pinned**. Pinned stays raised; clicking it again (or clicking empty map space) unpins. Only **one** region raised at a time.
- **Left list item** states: `:hover`/`.active` (white bg, indented, accent text), `.pinned` (adds a 📌 and gradient bg).
- **Detail card** (`#detail`, floats bottom-left over the map): eyebrow ("Region"/"Pinned region"), region name, tagline, city chips, and a bulleted highlights list. Hidden (opacity 0 + translateY) when nothing active.
- **Draw order**: regions sorted south→north by centroid Y so southern walls overlap correctly; the active region is appended last (on top).

## State (in `map.js`)
- `activeKey` — currently raised region key (or null)
- `pinned` — boolean, whether the active region is click-pinned
- per-region: `{ group, walls, lift, top, liftY, target, raf }`

## Design Tokens (defined in `:root` in the HTML)
Colors:
- Region gradient stops: `--region-grad-1 #cfdaf3`, `--region-grad-2 #ddd6ef`, `--region-grad-3 #f4d9e8`
- `--wall #9c97d2` (3D side), `--accent #5b54b0`, `--wall-active` = mix(wall 62% / accent 38%)
- `--divider #3b3a6e` (region borders), `--map-label #2a2b61`
- `--lake #84b7dd`, `--terrain #e9e9ea`, `--terrain-green #dfe7d6`, `--terrain-tan #ece5d8`
- `--state-name #adb0b6`, `--state-border #c9ccd1`
- `--city-major #21234d`, `--city-minor #3b3a6e`, `--city-label #2a2b61`, `--capital #e23b3b` (Columbus star)
- Surface: `--ink #16234a`, panel bg `#eaf2fb`, page bg `#f4f8fd`

Perspective: `--tilt-x 20deg`, `--tilt-z -5deg`, `--tilt-scale 1.04`

Typography (Google Fonts):
- `--font-display 'Archivo'` — title (800), region map labels fallback
- `--font-region 'Saira Condensed'` — eyebrow + map region labels (700 italic)
- `--font-body 'Archivo'` — body, city labels, state names
- Editable alternatives offered in Tweaks: Sora, Oswald, Space Grotesk, Libre Franklin
- Map scale (in 670×600 SVG units): region label 15px, major city label 9.5px, minor city 7.5px, state name 24–25px

Geometry constants (`map.js`): `REST_DEPTH = 9`. Scene viewBox `-150 -150 1000 880`; fade radius `540` (radial mask vignettes terrain + lake + borders at edges, but **state-name text stays full opacity** per requirement).

## Tweaks (editable controls, `app.jsx`)
Region gradient (5 palettes incl. JobsOhio navy), 3D wall color, selected accent, border color, map text, Lake Erie, terrain, state-name colors; three font selectors (display / region / body); perspective tilt slider (0–34°); raise-height slider; toggles for city dots, terrain fill, and state borders/names.

## Assets
- No raster assets required. The Ohio + region geometry is vector, embedded in `svg-geo.js` (extracted from `src-neo.svg`, included for reference).
- Fonts load from Google Fonts CDN. React/ReactDOM/Babel load from unpkg (pinned versions w/ integrity hashes) — only needed for the Tweaks panel; the map itself is framework-free.
- Columbus is marked with a red star; major cities are ringed dots, minor cities small dots. All at exact source coordinates.

## Notes for reimplementation
- If porting to React/Vue: the map renderer is cleanly separable — `MAP_DATA` is pure data, and `map.js` only touches the DOM/SVG. You can keep the SVG-building logic and drive `activeKey`/`pinned` from your framework's state, or rebuild the SVG declaratively.
- Keep the **two-layer 3D approach** (SVG extrusion + CSS plate tilt) — collapsing it into one will lose either the per-region raise or the plaque perspective.
- Surrounding-state names must remain readable while their background/borders fade — don't put the names under the vignette mask.
