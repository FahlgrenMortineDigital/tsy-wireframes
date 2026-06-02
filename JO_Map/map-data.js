/* ============================================================
   Ohio Regions Map — data built from the EXACT source SVG
   (ohioRegionsMap NEO). Requires svg-geo.js loaded first.
   Coordinate space = source viewBox 0 0 670 600.
   ============================================================ */
(function () {
  const G = window.SVG_GEO;

  // ---- path -> points (abs commands; endpoints only) ----
  function parsePts(d) {
    const t = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e-?\d+)?/g);
    const pts = []; let x = 0, y = 0, c = '', k = 0;
    const n = () => parseFloat(t[k++]);
    while (k < t.length) {
      let z = t[k];
      if (/[a-zA-Z]/.test(z)) { c = z; k++; }
      switch (c) {
        case 'M': case 'L': x = n(); y = n(); pts.push([x, y]); if (c === 'M') c = 'L'; break;
        case 'H': x = n(); pts.push([x, y]); break;
        case 'V': y = n(); pts.push([x, y]); break;
        case 'C': n(); n(); n(); n(); x = n(); y = n(); pts.push([x, y]); break;
        case 'S': case 'Q': n(); n(); x = n(); y = n(); pts.push([x, y]); break;
        case 'T': x = n(); y = n(); pts.push([x, y]); break;
        case 'Z': k++; c = ''; break;
        default: k++;
      }
    }
    return pts;
  }
  function centroid(pts) {
    let x = 0, y = 0, a = 0;
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i], q = pts[(i + 1) % pts.length];
      const cr = p[0] * q[1] - q[0] * p[1];
      a += cr; x += (p[0] + q[0]) * cr; y += (p[1] + q[1]) * cr;
    }
    a *= 0.5;
    if (Math.abs(a) < 1e-6) { // fallback: avg
      let sx = 0, sy = 0; pts.forEach(p => { sx += p[0]; sy += p[1]; });
      return [sx / pts.length, sy / pts.length];
    }
    return [x / (6 * a), y / (6 * a)];
  }

  // ---- region metadata (left-column order) ----
  const META = {
    northeast: { name: 'Northeast', label: ['NORTHEAST', 'REGION'], labelPos: [432, 138],
      tagline: 'Anchored by Cleveland — a 14-county hub of industry and reinvention.',
      cities: ['Cleveland', 'Akron', 'Canton', 'Sandusky'],
      highlights: ['Top 10 best places for a fresh start', '#5 in the U.S. for jobs', '#3 in the U.S. for cost of living', 'A top 50 foodie town in America'] },
    southwest: { name: 'Southwest', label: ['SOUTHWEST', 'REGION'], labelPos: [97, 430],
      tagline: 'A progressive global business center anchored by Cincinnati.',
      cities: ['Cincinnati'],
      highlights: ['#1 city for new college grads', '#4 happiest city to work in', '#1 best Oktoberfest', '#2 city for environmentally focused jobs'] },
    central: { name: 'Central', label: ['CENTRAL', 'REGION'], labelPos: [285, 285],
      tagline: "Ohio's capital and fastest-growing region, anchored by Columbus.",
      cities: ['Columbus', 'Delaware', 'Marion', 'New Albany', 'Newark'],
      highlights: ["Home of Intel's first new chip operation in 40 years", 'A top 10 metro for young professionals', 'A top 30 most fun place to live in the U.S.', 'Home to 50+ colleges and universities'] },
    west: { name: 'West', label: ['WEST', 'REGION'], labelPos: [135, 312],
      tagline: 'A thriving military and STEM sector, anchored by Dayton.',
      cities: ['Dayton', 'Lima'],
      highlights: ['A top 10 STEM community', 'The 1st Welcoming Community in the U.S.', '340+ miles of paved bike trails', '#3 for STEM job growth'] },
    southeast: { name: 'Southeast', label: ['SOUTHEAST', 'REGION'], labelPos: [452, 392],
      tagline: 'Rolling country and a 25-county manufacturing ecosystem.',
      cities: ['Athens', 'Chillicothe', 'Zanesville'],
      highlights: ['3 of the top 10 U.S. counties for economic development', '10.6% lower cost of living than the U.S.', '27 colleges and universities', '64K acres of national forest'] },
    northwest: { name: 'Northwest', label: ['NORTHWEST', 'REGION'], labelPos: [153, 140],
      tagline: 'Glass City heritage and Lake Erie shoreline, anchored by Toledo.',
      cities: ['Toledo', 'Perrysburg', 'Bowling Green', 'Findlay'],
      highlights: ['The #1 park district in America', 'A 47-acre arboretum', '120 miles of trails', '100 miles of Lake Erie shoreline'] },
    east: { name: 'Eastern', label: ['EAST', 'REGION'], labelPos: [578, 96],
      tagline: 'The four-county Mahoning Valley — batteries and the outdoors.',
      cities: ['Youngstown', 'Steubenville'],
      highlights: ["Home of Ultium Cells' battery manufacturing", 'In the Midwest Semiconductor Network', 'Youngstown: #7 most affordable small city', "Ohio's first park district — 5K+ acres"] }
  };
  const ORDER = ['northeast', 'southwest', 'central', 'west', 'southeast', 'northwest', 'east'];

  // ---- build region objects from exact SVG paths ----
  const regions = {};
  let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
  for (const key in G.regions) {
    const d = G.regions[key];
    const pts = parsePts(d);
    pts.forEach(p => { minX = Math.min(minX, p[0]); maxX = Math.max(maxX, p[0]); minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]); });
    regions[key] = Object.assign({ key, pts, path: d, cent: centroid(pts) }, META[key]);
  }
  const regionList = ORDER.map(k => regions[k]);
  const drawOrder = Object.keys(regions).sort((a, b) => regions[b].cent[1] - regions[a].cent[1]);

  // ---- cities (exact dot positions from the SVG) ----
  const majorNames = ['CLEVELAND', 'CINCINNATI', 'DAYTON', 'TOLEDO', 'ATHENS', 'YOUNGSTOWN'];
  const majorDir = { CLEVELAND: 'b', CINCINNATI: 'r', DAYTON: 'b', TOLEDO: 'b', ATHENS: 'r', YOUNGSTOWN: 'b' };
  const minorInfo = [
    ['Akron', 'r'], ['Sandusky', 'b'], ['Canton', 'r'], ['Mansfield', 'r'], ['Bowling Green', 'l'],
    ['Lima', 'l'], ['Findlay', 'r'], ['Perrysburg', 'r'], ['New Albany', 'r'], ['Newark', 'r'],
    ['Delaware', 'r'], ['Marion', 'r'], ['Chillicothe', 'r'], ['Zanesville', 'r'], ['Steubenville', 'l']
  ];
  const cities = [];
  G.majorDots.forEach((c, i) => cities.push({ n: majorNames[i], x: c[0], y: c[1], major: true, dir: majorDir[majorNames[i]] || 'r' }));
  G.minorDots.forEach((c, i) => { const m = minorInfo[i] || ['', 'r']; cities.push({ n: m[0], x: c[0], y: c[1], dir: m[1] }); });
  const capital = { n: 'COLUMBUS', x: G.star[0], y: G.star[1], dir: 'b' };

  // ---- surroundings (670-space) ----
  const surround = {
    names: [
      { t: 'MICHIGAN', x: 150, y: -80, size: 25, anchor: 'middle' },
      { t: 'INDIANA', x: -70, y: 300, size: 25, anchor: 'middle' },
      { t: 'PENNSYLVANIA', x: 700, y: 250, size: 24, anchor: 'middle' },
      { t: 'WEST', x: 712, y: 498, size: 25, anchor: 'middle' },
      { t: 'VIRGINIA', x: 712, y: 528, size: 25, anchor: 'middle' },
      { t: 'KENTUCKY', x: 250, y: 706, size: 25, anchor: 'middle' }
    ],
    borders: [
      'M-150,40 L67,46',                              // MICHIGAN top (west extension)
      'M44,-150 L46,16 L67,46',                       // MI / INDIANA vertical
      'M612,96 L862,80',                              // PENNSYLVANIA north edge (east)
      'M612,236 L862,244',                            // PA eastern divide
      'M612,470 L712,520 L862,512',                   // PA / WEST VIRGINIA step
      'M712,520 L758,624 L762,740',                   // WV panhandle (south)
      'M470,560 L514,650 L520,740'                    // KENTUCKY / WV divide
    ],
    blobs: []
  };
  // Lake Erie — solid blue, hugs the exact shore (tucked under regions), fills top
  const lake = 'M232,92 L250,92 L300,94 L380,100 L470,112 L560,128 L612,98 L660,80 L732,30 L742,-26 L560,-66 L360,-60 L232,-8 Z';

  window.MAP_DATA = {
    regions, regionList, drawOrder,
    outlinePath: G.outline,
    cities, capital, surround, lake,
    bounds: { minX, minY, maxX, maxY },
    fadeR: 540,
    sceneViewBox: '-150 -150 1000 880',
    sceneRect: { x: -150, y: -150, w: 1000, h: 880 }
  };
})();
