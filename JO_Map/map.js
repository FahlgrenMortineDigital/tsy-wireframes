/* ============================================================
   Ohio Regions Map — renderer + interaction (vanilla)
   ============================================================ */
(function () {
  const D = window.MAP_DATA;
  const SVGNS = 'http://www.w3.org/2000/svg';
  const el = (n, attrs) => {
    const e = document.createElementNS(SVGNS, n);
    if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  };

  // ---------- point in polygon (ray cast) ----------
  function pip(pt, poly) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
      const hit = ((yi > pt[1]) !== (yj > pt[1])) &&
        (pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi);
      if (hit) inside = !inside;
    }
    return inside;
  }
  function regionForPoint(x, y) {
    for (const key in D.regions) {
      if (pip([x, y], D.regions[key].pts)) return key;
    }
    return null;
  }

  // ---------- config ----------
  const REST_DEPTH = 9;           // resting extrusion thickness (svg-units)
  let LIFT_UNITS = 22;            // raise amount, controlled by tweak

  // ---------- build scene ----------
  const root = document.getElementById('map-root');
  const svg = el('svg', { viewBox: D.sceneViewBox, id: 'map-svg', preserveAspectRatio: 'xMidYMid meet' });
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Interactive map of Ohio business regions');
  root.appendChild(svg);

  const b = D.bounds;

  // ===== defs =====
  const defs = el('defs');
  svg.appendChild(defs);

  // continuous pastel: each region gets a SOLID tone sampled along the
  // NW->SE diagonal of the 3-stop palette (robust; no gradient paint-server).
  function hexToRgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
  function rgbToHex(a) { return '#' + a.map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join(''); }
  function lerp(a, b, t) { return a.map((v, i) => v + (b[i] - v) * t); }
  function paletteAt(s, p1, p2, p3) {
    s = Math.max(0, Math.min(1, s));
    return s < 0.5 ? rgbToHex(lerp(p1, p2, s / 0.5)) : rgbToHex(lerp(p2, p3, (s - 0.5) / 0.5));
  }
  function regionFills() {
    const cs = getComputedStyle(document.documentElement);
    const g = (n, d) => hexToRgb((cs.getPropertyValue(n).trim() || d));
    const p1 = g('--region-grad-1', '#cfdaf3'), p2 = g('--region-grad-2', '#ddd6ef'), p3 = g('--region-grad-3', '#f4d9e8');
    const span = (b.maxX - b.minX) + (b.maxY - b.minY) || 1;
    const out = {};
    for (const key in D.regions) {
      const c = D.regions[key].cent;
      const s = ((c[0] - b.minX) + (c[1] - b.minY)) / span;
      out[key] = paletteAt(s, p1, p2, p3);
    }
    return out;
  }
  function recolorGradient() {
    const fills = regionFills();
    for (const key in fills) {
      const R = regionEls[key];
      if (R && R.top) R.top.setAttribute('fill', fills[key]);
    }
  }

  // soft drop shadow for the whole state block
  const f = el('filter', { id: 'stateShadow', x: '-20%', y: '-20%', width: '140%', height: '160%' });
  f.appendChild(el('feDropShadow', { dx: '0', dy: '26', stdDeviation: '26', 'flood-color': '#3a3566', 'flood-opacity': '0.28' }));
  defs.appendChild(f);

  // shadow for a raised region
  const fr = el('filter', { id: 'liftShadow', x: '-40%', y: '-40%', width: '180%', height: '200%' });
  fr.appendChild(el('feDropShadow', { dx: '0', dy: '10', stdDeviation: '12', 'flood-color': '#2b2752', 'flood-opacity': '0.40' }));
  defs.appendChild(fr);

  // terrain edge-fade mask (visible near Ohio, fades to nothing at canvas edge)
  const cx = (b.minX + b.maxX) / 2, cy = (b.minY + b.maxY) / 2;
  const SR = D.sceneRect;
  const mask = el('mask', { id: 'terrainFade', maskUnits: 'userSpaceOnUse', x: SR.x, y: SR.y, width: SR.w, height: SR.h });
  const rg = el('radialGradient', { id: 'fadeRG', gradientUnits: 'userSpaceOnUse', cx: cx, cy: cy, r: D.fadeR });
  rg.appendChild(el('stop', { offset: '0%', 'stop-color': '#fff' }));
  rg.appendChild(el('stop', { offset: '60%', 'stop-color': '#fff' }));
  rg.appendChild(el('stop', { offset: '100%', 'stop-color': '#000' }));
  defs.appendChild(rg);
  mask.appendChild(el('rect', { x: SR.x, y: SR.y, width: SR.w, height: SR.h, fill: 'url(#fadeRG)' }));
  defs.appendChild(mask);

  // geometry-only region paths kept for reference (not used for paint)
  // (rendering uses real <path> elements so fill reliably applies)

  // ===== background: faded terrain =====
  const bg = el('g', { id: 'bg-terrain', mask: 'url(#terrainFade)' });
  svg.appendChild(bg);
  bg.appendChild(el('rect', { x: SR.x, y: SR.y, width: SR.w, height: SR.h, fill: 'var(--terrain)' }));
  // faint terrain blobs (parks / relief)
  const blobColor = { green: 'var(--terrain-green)', tan: 'var(--terrain-tan)' };
  (D.surround.blobs || []).forEach(([x, y, rx, ry, kind]) =>
    bg.appendChild(el('ellipse', { cx: x, cy: y, rx: rx, ry: ry, fill: blobColor[kind] || 'var(--terrain-green)', opacity: '0.5' })));

  // ===== lake erie ===== (fades at its far edge like the surroundings)
  const lake = el('path', { d: D.lake, fill: 'var(--lake)', opacity: '1', mask: 'url(#terrainFade)' });
  svg.appendChild(lake);

  // ===== state borders (thin, faded like the reference) =====
  const borders = el('g', { id: 'state-borders', mask: 'url(#terrainFade)' });
  svg.appendChild(borders);
  // Ohio's own outline = the shared border with its neighbours (regions cover the inside)
  borders.appendChild(el('path', {
    d: D.outlinePath, fill: 'none', stroke: 'var(--state-border)', 'stroke-width': '1.6',
    'stroke-linejoin': 'round'
  }));
  D.surround.borders.forEach(d => borders.appendChild(el('path', {
    d: d, fill: 'none', stroke: 'var(--state-border)', 'stroke-width': '1.3',
    'stroke-linejoin': 'round', 'stroke-linecap': 'round'
  })));

  // ===== state names (full opacity, NOT faded) =====
  const names = el('g', { id: 'state-names' });
  svg.appendChild(names);
  D.surround.names.forEach(o => {
    const t = el('text', {
      x: o.x, y: o.y, 'text-anchor': o.anchor || 'start',
      class: 'state-name', 'font-size': o.size
    });
    t.textContent = o.t;
    names.appendChild(t);
  });

  // ===== the state block (regions) =====
  const state = el('g', { id: 'state', filter: 'url(#stateShadow)' });
  svg.appendChild(state);

  // assign cities + capital to regions for joint lifting
  const cityByRegion = {};
  Object.keys(D.regions).forEach(k => cityByRegion[k] = []);
  D.cities.forEach(c => { const k = regionForPoint(c.x, c.y); if (k) cityByRegion[k].push(c); else cityByRegion['southeast'].push(c); });
  const capKey = regionForPoint(D.capital.x, D.capital.y) || 'central';

  const regionEls = {};   // key -> { group, walls, lift, liftY, target, raf }
  let activeKey = null;    // currently raised
  let pinned = false;      // clicked-to-pin

  function makeCityMarker(c, isCapital) {
    const g = el('g', { class: 'city' + (c.major ? ' major' : '') + (isCapital ? ' capital' : '') });
    if (isCapital) {
      const star = el('path', { d: starPath(c.x, c.y, 6.2, 2.7), class: 'star' });
      g.appendChild(star);
    } else if (c.major) {
      g.appendChild(el('circle', { cx: c.x, cy: c.y, r: 4.2, class: 'dot-major' }));
      g.appendChild(el('circle', { cx: c.x, cy: c.y, r: 1.8, class: 'dot-major-in' }));
    } else {
      g.appendChild(el('circle', { cx: c.x, cy: c.y, r: 2, class: 'dot-minor' }));
    }
    // label
    const t = el('text', { class: 'city-label' + (c.major || isCapital ? ' city-label-major' : '') });
    let tx = c.x, ty = c.y, anchor = 'start';
    const off = (c.major || isCapital) ? 6 : 4;
    const dir = c.dir || 'r';
    if (dir === 'r') { tx = c.x + (off + 2); ty = c.y + 2.6; anchor = 'start'; }
    else if (dir === 'l') { tx = c.x - (off + 2); ty = c.y + 2.6; anchor = 'end'; }
    else if (dir === 'b') { tx = c.x; ty = c.y + off + (c.major || isCapital ? 10 : 8); anchor = 'middle'; }
    else if (dir === 't') { tx = c.x; ty = c.y - off - 4; anchor = 'middle'; }
    t.setAttribute('x', tx); t.setAttribute('y', ty); t.setAttribute('text-anchor', anchor);
    t.textContent = c.n;
    g.appendChild(t);
    return g;
  }
  function starPath(cx, cy, R, r) {
    let p = '';
    for (let i = 0; i < 10; i++) {
      const ang = -Math.PI / 2 + i * Math.PI / 5;
      const rad = i % 2 ? r : R;
      p += (i ? 'L' : 'M') + (cx + rad * Math.cos(ang)).toFixed(1) + ',' + (cy + rad * Math.sin(ang)).toFixed(1);
    }
    return p + 'Z';
  }

  D.regionList.forEach(r => {
    const key = r.key;
    const g = el('g', { class: 'region', 'data-key': key });
    const walls = el('g', { class: 'walls' });
    const liftG = el('g', { class: 'lift' });
    const top = el('path', { class: 'top', d: D.regions[key].path });
    liftG.appendChild(top);

    // region label (two lines, italic)
    const lp = r.labelPos;
    const lab = el('text', { class: 'rlabel', x: lp[0], y: lp[1], 'text-anchor': 'middle' });
    const l1 = el('tspan', { x: lp[0], dy: '0' }); l1.textContent = r.label[0];
    const l2 = el('tspan', { x: lp[0], dy: '1.0em' }); l2.textContent = r.label[1];
    lab.appendChild(l1); lab.appendChild(l2);
    liftG.appendChild(lab);

    // cities for this region
    const rc = el('g', { class: 'rcities' });
    (cityByRegion[key] || []).forEach(c => rc.appendChild(makeCityMarker(c, false)));
    if (capKey === key) rc.appendChild(makeCityMarker(D.capital, true));
    liftG.appendChild(rc);

    g.appendChild(walls);
    g.appendChild(liftG);
    state.appendChild(g);
    regionEls[key] = { group: g, walls, lift: liftG, top, liftY: 0, target: 0, raf: 0 };
    buildWalls(key, 0);

    // interaction on the region itself
    g.addEventListener('mouseenter', () => { if (!pinned) hover(key); });
    g.addEventListener('mouseleave', () => { if (!pinned) hover(null); });
    g.addEventListener('click', (e) => { e.stopPropagation(); togglePin(key); });
  });

  // initial draw order (south -> north)
  reorder();
  recolorGradient();

  function reorder() {
    D.drawOrder.forEach(k => state.appendChild(regionEls[k].group));
    if (activeKey) state.appendChild(regionEls[activeKey].group); // active on top
  }

  function buildWalls(key, lift) {
    const R = regionEls[key];
    const w = R.walls;
    while (w.firstChild) w.removeChild(w.firstChild);
    const d = D.regions[key].path;
    // copies from bottom (rest depth) up to top of lifted face
    const topK = -lift + 1;
    for (let k = REST_DEPTH; k >= topK; k--) {
      w.appendChild(el('path', { d: d, transform: 'translate(0,' + k + ')' }));
    }
  }

  // ---------- raise animation ----------
  function animateLift(key, target) {
    const R = regionEls[key];
    R.target = target;
    if (R.raf) cancelAnimationFrame(R.raf);
    const start = R.liftY, t0 = performance.now(), dur = 280;
    const ease = t => 1 - Math.pow(1 - t, 3);
    function step(now) {
      let t = Math.min(1, (now - t0) / dur);
      const v = start + (target - start) * ease(t);
      R.liftY = v;
      R.lift.setAttribute('transform', 'translate(0,' + (-v).toFixed(2) + ')');
      buildWalls(key, v);
      if (t < 1) R.raf = requestAnimationFrame(step); else R.raf = 0;
    }
    R.raf = requestAnimationFrame(step);
  }

  // ---------- active state ----------
  function setActive(key) {
    if (activeKey === key) return;
    const prev = activeKey;
    activeKey = key;
    if (prev && prev !== key) {
      regionEls[prev].group.classList.remove('active');
      regionEls[prev].group.removeAttribute('filter');
      animateLift(prev, 0);
    }
    if (key) {
      const g = regionEls[key].group;
      g.classList.add('active');
      g.setAttribute('filter', 'url(#liftShadow)');
      reorder();
      animateLift(key, LIFT_UNITS);
    } else {
      reorder();
    }
    syncUI();
  }

  function hover(key) { setActive(key); }
  function togglePin(key) {
    if (pinned && activeKey === key) { pinned = false; setActive(null); }
    else { pinned = true; setActive(key); }
    syncUI();
  }

  // ---------- left column wiring ----------
  const listItems = Array.from(document.querySelectorAll('.region-item'));
  listItems.forEach(li => {
    const key = li.getAttribute('data-key');
    li.addEventListener('mouseenter', () => { if (!pinned) setActive(key); });
    li.addEventListener('mouseleave', () => { if (!pinned) setActive(null); });
    li.addEventListener('click', () => togglePin(key));
  });
  // click empty space clears pin
  svg.addEventListener('click', () => { if (pinned) { pinned = false; setActive(null); } });

  function syncUI() {
    listItems.forEach(li => {
      const k = li.getAttribute('data-key');
      li.classList.toggle('active', k === activeKey);
      li.classList.toggle('pinned', pinned && k === activeKey);
    });
    updateDetail();
  }

  // ---------- detail panel ----------
  const detail = document.getElementById('detail');
  function updateDetail() {
    if (!detail) return;
    if (!activeKey) { detail.classList.remove('show'); return; }
    const r = D.regions[activeKey];
    detail.classList.add('show');
    detail.innerHTML =
      '<div class="detail-eyebrow">' + (pinned ? 'Pinned region' : 'Region') + '</div>' +
      '<h3 class="detail-name">' + r.label[0] + '</h3>' +
      '<p class="detail-tag">' + r.tagline + '</p>' +
      (r.cities && r.cities.length ? '<div class="detail-cities">' + r.cities.map(c => '<span>' + c + '</span>').join('') + '</div>' : '') +
      '<ul class="detail-list">' + r.highlights.map(h => '<li>' + h + '</li>').join('') + '</ul>';
  }

  // ---------- public API for tweaks ----------
  window.MAP = {
    setLiftUnits(px) { LIFT_UNITS = px; if (activeKey) animateLift(activeKey, LIFT_UNITS); },
    recolorGradient,
    setRestDepth(px) { /* reserved */ },
    clear() { pinned = false; setActive(null); }
  };
})();
