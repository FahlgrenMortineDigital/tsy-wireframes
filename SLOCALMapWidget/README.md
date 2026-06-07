# Handoff: SLO CAL "Impromptu" Widget

## Overview
The **Impromptu Widget** is an embeddable exploration tool for slocal.com (San Luis Obispo County tourism). It lets visitors explore the 7 regional/destination brands of SLO CAL from a map-forward interface, drill into a region to see live "things to do" (with today's hours), browse inspiration video reels, and personalize results against the **IDSS** CRM profile. It is designed to live as an overlay on top of the existing slocal.com site.

The 7 regions represented:
- Highway 1 Road Trip
- Travel Paso Robles
- Visit Atascadero
- Visit Morro Bay
- Visit San Luis Obispo
- Pismo Beach Conference & Visitors Bureau
- Visit Arroyo Grande

## About the Design Files
The files in this bundle are **design references created in HTML/CSS/vanilla JS** — a working prototype demonstrating intended layout, states, and behavior. They are **not production code to copy directly**. The task is to **recreate this widget inside the target codebase's existing environment** (e.g. React/Vue component embedded on slocal.com, or whatever the slocal.com platform uses) following its established patterns, data layer, and component library. If no front-end environment is chosen yet, pick the most appropriate one for an embeddable widget.

The slocal.com page shown *behind* the widget is **only a ghosted placeholder for context** — do NOT build it. A separate creative team owns the real site design. Build only the widget.

## Fidelity
**Low-fidelity (lofi) wireframe.** This was intentionally kept as a grayscale wireframe to focus on **functionality, structure, and flow** — not final visual design. Use it as the source of truth for **layout, states, interactions, data model, and copy patterns**, but apply SLO CAL's real brand design system (colors, typography, photography, iconography) when implementing. Placeholder text is wrapped in `[square brackets]` and image areas are shown as crosshatched boxes labeled "img" / "video still".

The one place real styling is implied: the **map** is drawn to resemble a real regional map (blue Pacific Ocean on the left, beige land, curving coastline, roads, Highway 1). In production this should be a real/illustrated SLO CAL regional map, ideally an interactive vector map.

---

## Responsive Modes
The widget has two distinct presentations, switchable in the prototype via the top "VIEW" demo toggle (the dark demo bar at the very top is **dev chrome only — not part of the product**).

- **Desktop** — a floating thumbnail map card → expands to a two-column panel (map + detail).
- **Mobile** — a floating pill → expands to a near-full-height bottom sheet (map on top, list below).

---

## Screens / Views

### 1. Desktop — Collapsed (default entry point)
- **Thumbnail map card**, fixed to the bottom-right, floating ~84px off the bottom edge.
- Width 268px, white card, 1.6px ink border, 14px radius, large drop shadow.
- Contents: header row with title "Explore SLO CAL" + a minimize "–" button; a mini regional map (160px tall) showing all 7 region dots; footer "7 regions · tap to explore" + an "Open ↗" button.
- **Behavior:** clicking the card body → opens the expanded panel. Clicking "–" → slides the card off to the right and leaves a vertical **edge tab** docked to the right edge of the viewport (dark, rounded left corners, vertical "Explore SLO CAL" text + mini map glyph). Clicking the edge tab restores the thumbnail.
- (A secondary collapsed style, "Edge dock," exists in the demo toggle as an alternate — not required for production.)

### 2. Desktop — Expanded Panel
- Fixed bottom-right, 760px wide × 600px tall (caps to viewport with margins), white, 1.7px ink border, 16px radius, large shadow. A scrim dims the page behind it.
- **Top bar:** eyebrow "RIGHT NOW · IMPROMPTU" + title "Explore SLO CAL"; right side has the **mode toggle** (segmented: "✺ Plan a trip" / "📍 Near me") and a circular "×" close button.
- **Auto-detect strip** (only in "Near me" mode): a light band "📍 Looks like you're near Morro Bay — showing what's nearby." with a "Just browsing? Switch to Plan" link.
- **Body = two columns:**
  - **Left (map column):** a region selector row (a "← All regions" back button when drilled in, otherwise a "Region" label) + a **dropdown** of all 7 regions + a "–" minimize-map button; the **map**; a legend caption.
  - **Right (detail column):** see "Region detail" below.
- **Map minimize:** the "–" collapses the entire map column; the panel narrows to ~470px and a slim vertical "🗺 Show map" rail appears on the left to bring it back. **Map is shown by default.**

### 3. Desktop — Map: two levels
- **Overview (no region selected):** the full regional map with all 7 region **pins**, each a dot + a text label beside it (label flips to the left side for pins on the right half so it doesn't overflow). The right column shows a scrollable **list of the 7 regions** (image, name, vibe, "N on now", chevron).
- **Region focused (after clicking a pin / list row / dropdown):** the map **zooms** to frame that region (CSS scale transform on the map artwork; a faint dot-grid texture appears) and drops **numbered point markers** (1, 2, 3…) for each item. A region-name label chip sits at the top of the map. The right column shows that region's numbered list.
- **Map ↔ list linking:** hovering a numbered map marker highlights the matching list row and vice-versa; clicking a marker scrolls its row into view and highlights it. Marker number === list number.

### 4. Region Detail (right column when focused)
- Header: "← All regions" back button, region name, vibe + count ("6 things on now" or "N reels").
- **Tabs:** "Things to do" / "Videos" (underline-style tabs).
- **Things-to-do filters** (single row, shown only on the Things to do tab): "📍 Near me" (default, distance-sorted), "🎲 Surprise me" (random handful, re-rolls on each tap), "✦ For me" (IDSS profile matches first). A small eyebrow line describes the active filter (e.g. "NEAREST TO YOU FIRST").
- **Pick rows** (each thing to do): image thumb (58px) · body · number badge (right). Body = type tag (Event/Eat/Do) + optional "✦ matches you" (when For me is active and it's a profile match) + name + meta line (+ "X min away" when Near me) + **today's business hours line** + a **"Visit website ↗"** link.
- Footer: "See all in <Region> →".

### 5. Business Hours (on pick rows)
- Shows **today's** hours and a **live open/closed status** computed from the current time and day:
  - Restaurants (`eat`): default 11a–9p.
  - Venue activities (`do` that aren't outdoor): default 10a–5p (or parsed "open 'til N" if present).
  - All-day outdoor spots (beach, hike, dunes, grove, tide-pools, lake, boardwalk, etc.): "Open daily · sunrise–sunset".
  - Events: no hours line (their time is in the meta).
- Status dot + label, color-coded: **Open now** (green), **Closed** (red), **Opens <time>** (amber). Label includes the hours range and the current day abbreviation (e.g. "Open now · 11a–9p · Sun").
- In production, replace the heuristic with real per-business hours from IDSS / the listings source, including the actual current-day schedule.

### 6. Videos tab + Video Modal
- Videos tab shows **inspiration reels** as cards (16:9 still, location pill "📍 <town>", play button, duration, "N. <title>", "YouTube · @SLOCAL", "See on map" link). Each video is tagged by the **film/coverage location** and also appears as a camera-style marker on the focused map.
- **Clicking a video opens a lightbox modal** (`z-index: 700`, dims everything) containing a 16:9 **YouTube embed that autoplays** the clip, plus a caption (title · "YouTube · @SLOCAL · filmed in <town>"). Closes via the "×", backdrop click, or Esc.
- In the prototype the embeds point at real @SLOCAL "Unpacking SLO CAL" videos (see Assets). In production, map each listing/region to its real YouTube video ID(s).

### 7. Mobile — Collapsed + Sheet
- **Collapsed:** a pill ("🗺 Explore SLO CAL") fixed bottom-right inside the device.
- **Sheet (expanded):** bottom sheet ~90% height, rounded top, grab handle. Header: title + mode toggle ("✺ Plan" / "📍 Near me") + "×". Scrollable body: optional near-detect band; region **dropdown** (+ "← All regions" back when focused); the **map** (shown on mobile too, ~230px tall — the earlier chip row was removed in favor of the dropdown); legend; then either the **region list** (overview) or the **tabs + filters + numbered list** (focused). Same pick rows, hours, visit links, video modal as desktop.

---

## Interactions & Behavior
- **Open/close:** thumbnail/pill click → expand; "×"/scrim/Esc → collapse.
- **Minimize thumbnail (desktop):** slide-off-right (~240ms) → edge tab; tab click → slide thumbnail back in.
- **Minimize map (desktop expanded):** collapse map column → narrow panel + "Show map" rail.
- **Mode toggle:** Plan a trip ↔ Near me. Near me reveals the auto-detect strip + a "you are here" beacon on the overview map.
- **Drill in / back:** region pin / list row / dropdown selection → zoom + numbered points; "← All regions" → overview.
- **Filters:** Near me (sort by distance asc), Surprise me (Fisher–Yates shuffle, returns a 4-item handful, re-rolls every click — does NOT toggle off), For me (IDSS matches first).
- **Map↔list hover/click linking** (see Map section).
- **Video:** card click → autoplay lightbox; Esc/×/backdrop close.
- **Transitions:** map zoom & marker reposition ~0.55s cubic-bezier(.4,0,.2,1); thumbnail slide ~0.24–0.28s ease.
- **Reduced motion / persistence:** state persists to `localStorage` under key `slocal_widget` (so a refresh keeps the user's place during review).

## Defaults
- **Desktop** opens in **Plan a Trip** mode; **Mobile** opens in **Near me** mode.
- The **Near me** filter is the default sort in a focused region (both breakpoints).
- The map is **open/shown by default** when the panel expands.

## State Management
Single state object `S` (persisted to `localStorage` as `slocal_widget`):
- `view`: "desktop" | "mobile" (production: derive from breakpoint, not a toggle)
- `expanded`: bool — panel/sheet open
- `thumbMin`: bool — desktop thumbnail minimized to edge tab
- `mapOpen`: bool — desktop map column shown
- `zoom`: bool — region drilled-in vs overview
- `region`: region id ("hwy1" | "paso" | "atascadero" | "morro" | "slo" | "pismo" | "ag")
- `mode`: "plan" | "near"
- `layer`: "todo" | "video"
- `filter`: "location"(Near me) | "surprise" | "idss"(For me) | "now"
- Active video modal is transient (not persisted).

### Data the production widget needs (per region)
- Region: id, full name, short name, "vibe" tagline, map coordinates/shape.
- Things to do: type (event/eat/do), name, meta, **distance from user**, **today's hours + open status**, mood tags, **IDSS match flag**, **website URL**, map point.
- Videos: title, duration, **film/coverage location**, region, **YouTube video ID**.
- Personalization: IDSS profile → which items are "matches you"; geolocation → nearby region + "you are here".

## Design Tokens (from the wireframe — replace with SLO CAL brand on implementation)
Defined as CSS custom properties in `widget.css` `:root`. **These are placeholder/wireframe values.**
- Ink: `--ink #2b2a28`, `--ink-soft #6f6c64`, `--ink-faint #a8a499`, `--line #bdb9ad`
- Surfaces: `--white #fffdf8`; page backdrop grey `#e7e7e7`; ghosted site `#f4f4f4`
- Accent (interactive/active/Highway 1): `--accent #d8623a`, `--accent-soft #f1d8cd`
- Secondary (IDSS / coast / "you are here"): `--idss #3f7d8c`, `--idss-soft #d7e6ea`
- Status: open `#1f8a5b`, closed `#b0472f`, opens-soon `#a9781b`
- Map: sea `#bcd6de`, land `--paper-2 #efece2`, coastline `#7c9aa3`, roads `#fffdf8`, contours `#8fb6c0`
- Radius: cards 14–16px, controls/pills 8–999px. Shadows: `--shadow`, `--shadow-lg`.
- Type: Inter Tight (UI). Sizes: panel title ~18px, region/section ~19px, body 13–14px, meta 11px. Slide/large-surface minimums per SLO CAL brand.
- The background was intentionally rendered **black / grey / white** to keep focus on the widget.

## Assets
- **Map:** prototype uses a hand-built SVG silhouette. Replace with a real SLO CAL regional map (vector preferred for the zoom interaction).
- **Imagery:** all image areas are placeholders. Source real photography for region cards, pick thumbnails, and video stills.
- **Videos (real @SLOCAL YouTube IDs used in the prototype):**
  - `oCF3yr336CM` — Unpacking SLO CAL Episode 1: Suzi on the Move
  - `I1Q40XOeOEk` — Unpacking SLO CAL Episode 2: Zips & Sips
  - `dRIsr6-wtWQ` — Unpacking SLO CAL Episode 3
  - `gEEYV4nqcPo` — Unpacking SLO CAL Episode 2 (:15)
  - Channel: https://www.youtube.com/@SLOCAL — production should map each listing/region to its real clip(s).
- **Icons/emoji:** the wireframe uses emoji (📍 ✺ 🎲 ✦ ▶ 🗺) as stand-ins — replace with the brand icon set.

## Files
In this bundle (under `design_handoff_impromptu_widget/`):
- `W Impromptu Widget.html` — the page shell: ghosted slocal.com background (context only), the dev demo bar, the mobile device frame, and the script/style includes.
- `widget.css` — all widget styling + the wireframe token system + the ghosted-site styles.
- `widget.js` — all widget behavior and **mock data** (regions, things-to-do with hours, videos, IDSS flags). The data structures here define the shape the production data layer should provide.

Open `W Impromptu Widget.html` in a browser to interact with the full prototype. Use the dev demo bar (top) to switch desktop/mobile and the collapsed style; it is not part of the product.
