/* Tweaks app — drives editable colors, fonts, and raise height.
   Applies CSS custom properties to :root so the SVG updates live. */
const { useEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "regionPalette": ["#cfdaf3", "#ddd6ef", "#f4d9e8"],
  "wall": "#9c97d2",
  "accent": "#5b54b0",
  "divider": "#3b3a6e",
  "mapLabel": "#2a2b61",
  "lake": "#84b7dd",
  "terrain": "#e9e9ea",
  "stateName": "#adb0b6",
  "fontDisplay": "Archivo",
  "fontRegion": "Saira Condensed",
  "fontBody": "Archivo",
  "raise": 6,
  "tilt": 20,
  "showCities": true,
  "showTerrain": true,
  "showStates": true
}/*EDITMODE-END*/;

const PALETTES = [
  ["#cfdaf3", "#ddd6ef", "#f4d9e8"], // soft 3D (default)
  ["#dfe9f7", "#cfe0f2", "#bcd4ee"], // icy blue
  ["#c9e6da", "#d9ecdf", "#eef3d9"], // sage
  ["#fbe1c6", "#f6cdd2", "#ecccea"], // sunset
  ["#1e3f6b", "#1a3559", "#142a49"]  // jobsohio navy
];
const WALLS = ["#9c97d2", "#8aa7da", "#9ec7b6", "#e3ad92", "#16315a"];
const ACCENTS = ["#5b54b0", "#2f74c7", "#1f8a5b", "#d9762f", "#0f3a6b"];
const DIVIDERS = ["#3b3a6e", "#2a2b61", "#5a4b8f", "#0f2a4d", "#ffffff"];
const LABELS = ["#2a2b61", "#13315a", "#3a2d6b", "#ffffff"];
const LAKES = ["#84b7dd", "#a8cfe8", "#7fb0a6", "#bcc6d6"];
const TERRAINS = ["#e9e9ea", "#eef2f6", "#f1ede5", "#e7ecef"];
const STATE_NAMES = ["#adb0b6", "#c8ccd4", "#9aa7bb", "#d7c9c0"];
const DISPLAY_FONTS = ["Archivo", "Sora", "Oswald", "Space Grotesk", "Libre Franklin"];
const REGION_FONTS = ["Saira Condensed", "Oswald", "Archivo", "Sora"];
const BODY_FONTS = ["Archivo", "Libre Franklin", "Sora"];

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  useEffect(() => {
    const r = document.documentElement.style;
    const p = t.regionPalette || PALETTES[0];
    r.setProperty('--region-grad-1', p[0]);
    r.setProperty('--region-grad-2', p[1]);
    r.setProperty('--region-grad-3', p[2]);
    r.setProperty('--wall', t.wall);
    r.setProperty('--accent', t.accent);
    r.setProperty('--divider', t.divider);
    r.setProperty('--map-label', t.mapLabel);
    r.setProperty('--lake', t.lake);
    r.setProperty('--terrain', t.terrain);
    r.setProperty('--state-name', t.stateName);
    r.setProperty('--city-label', t.mapLabel);
    r.setProperty('--font-display', `'${t.fontDisplay}', sans-serif`);
    r.setProperty('--font-region', `'${t.fontRegion}', sans-serif`);
    r.setProperty('--font-body', `'${t.fontBody}', sans-serif`);

    const cl = document.documentElement.classList;
    cl.toggle('hide-cities', !t.showCities);
    cl.toggle('hide-terrain', !t.showTerrain);
    cl.toggle('hide-states', !t.showStates);

    if (window.MAP) window.MAP.setLiftUnits(t.raise * 3 + 4);
    r.setProperty('--tilt-x', (t.tilt || 0) + 'deg');
    r.setProperty('--tilt-z', (t.tilt ? -((t.tilt) * 0.25) : 0) + 'deg');
    r.setProperty('--tilt-scale', (1 + (t.tilt || 0) * 0.002).toFixed(3));
    if (window.MAP && window.MAP.recolorGradient) window.MAP.recolorGradient();
  }, [t]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Region color" />
      <TweakColor label="Gradient" value={t.regionPalette}
        options={PALETTES} onChange={(v) => setTweak('regionPalette', v)} />
      <TweakColor label="Sides (3D wall)" value={t.wall}
        options={WALLS} onChange={(v) => setTweak('wall', v)} />
      <TweakColor label="Selected accent" value={t.accent}
        options={ACCENTS} onChange={(v) => setTweak('accent', v)} />
      <TweakColor label="Borders" value={t.divider}
        options={DIVIDERS} onChange={(v) => setTweak('divider', v)} />

      <TweakSection label="Labels & surroundings" />
      <TweakColor label="Map text" value={t.mapLabel}
        options={LABELS} onChange={(v) => setTweak('mapLabel', v)} />
      <TweakColor label="Lake Erie" value={t.lake}
        options={LAKES} onChange={(v) => setTweak('lake', v)} />
      <TweakColor label="Terrain" value={t.terrain}
        options={TERRAINS} onChange={(v) => setTweak('terrain', v)} />
      <TweakColor label="State names" value={t.stateName}
        options={STATE_NAMES} onChange={(v) => setTweak('stateName', v)} />

      <TweakSection label="Typography" />
      <TweakSelect label="Display / title" value={t.fontDisplay}
        options={DISPLAY_FONTS} onChange={(v) => setTweak('fontDisplay', v)} />
      <TweakSelect label="Region labels" value={t.fontRegion}
        options={REGION_FONTS} onChange={(v) => setTweak('fontRegion', v)} />
      <TweakSelect label="Body / cities" value={t.fontBody}
        options={BODY_FONTS} onChange={(v) => setTweak('fontBody', v)} />

      <TweakSection label="Motion & layers" />
      <TweakSlider label="Perspective tilt" value={t.tilt} min={0} max={34} step={1}
        onChange={(v) => setTweak('tilt', v)} />
      <TweakSlider label="Raise height" value={t.raise} min={1} max={10} step={1}
        onChange={(v) => setTweak('raise', v)} />
      <TweakToggle label="City dots & labels" value={t.showCities}
        onChange={(v) => setTweak('showCities', v)} />
      <TweakToggle label="Terrain fill" value={t.showTerrain}
        onChange={(v) => setTweak('showTerrain', v)} />
      <TweakToggle label="State borders & names" value={t.showStates}
        onChange={(v) => setTweak('showStates', v)} />
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById('tweaks-root')).render(<App />);
