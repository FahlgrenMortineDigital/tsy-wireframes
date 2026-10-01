/* ==========================================================================
   Sample Experience Trend Report — interactions
   - Lenis smooth scroll (falls back to native if the CDN is unavailable)
   - Word-split + block reveals on enter
   - Count-ups, pinned horizontal card tracks, parallax, step timeline
   - Top bar: colour follows the section beneath it, chapter highlight, progress
   ========================================================================== */
(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.remove("no-js");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var mobile = window.matchMedia("(max-width: 900px)");

  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  /* ------------------------------------------------------------ smooth scroll */
  var lenis = null, navigating = false;
  if (!reduceMotion && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.09, wheelMultiplier: 1, smoothWheel: true });
    (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(performance.now());
    window.reportLenis = lenis; // handy for scripted scrolling/QA
  }

  // In-page links: ease to the target (and account for the fixed bar)
  document.addEventListener("click", function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute("href");
    var target = id === "#top" ? document.body : document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    // Jumping via a link skips slide locks on the way; slides passed just reveal.
    if (lenis) { navigating = true; lenis.scrollTo(target, { offset: 0, duration: 1.6, lock: true, onComplete: function () { navigating = false; } }); }
    else target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    if (history.replaceState) history.replaceState(null, "", id === "#top" ? location.pathname : id);
  });

  /* ------------------------------------------------------------ in-view helper */
  function onInview(els, cb, opts) {
    if (!("IntersectionObserver" in window) || reduceMotion) { els.forEach(cb); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { cb(en.target); io.unobserve(en.target); }
      });
    }, opts || { rootMargin: "0px 0px -12% 0px", threshold: 0.01 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------------------------ word split */
  function splitWords(el) {
    var index = 0;
    (function walk(node) {
      if (node.nodeType === 3) {
        var frag = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
          var w = document.createElement("span"); w.className = "w";
          var i = document.createElement("span"); i.className = "w__i";
          i.style.setProperty("--i", index++);
          i.textContent = part;
          w.appendChild(i); frag.appendChild(w);
        });
        node.parentNode.replaceChild(frag, node);
      } else if (node.nodeType === 1 && node.tagName !== "BR") {
        Array.prototype.slice.call(node.childNodes).forEach(walk);
      }
    })(el);
    // keep the full sentence for assistive tech
    if (!el.getAttribute("aria-label")) el.setAttribute("aria-label", el.textContent.replace(/\s+/g, " ").trim());
    $all(".w", el).forEach(function (w) { w.setAttribute("aria-hidden", "true"); });
  }

  var splits = $all("[data-split]");
  splits.forEach(splitWords);

  // Cover content animates on load, after the blue panel has wiped in
  $all("[data-split-load]").forEach(function (el) {
    el.style.setProperty("--base", "450ms");
    requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add("is-in"); }); });
  });
  $all("[data-reveal-load]").forEach(function (el) {
    requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add("is-in"); }); });
  });

  /* ------------------------------------------------------------ highlight sequence
     Headline with a <mark>: marked words rise in, the highlight sweeps across them,
     then the rest of the sentence rises in. */
  $all("[data-mark-seq]").forEach(function (el) {
    var mark = el.querySelector("mark");
    if (!mark) return;
    var inMark = $all(".w__i", mark), rest = $all(".w__i", el).filter(function (w) { return !mark.contains(w); });
    inMark.forEach(function (w, k) { w.style.setProperty("--i", k); });
    var hl = inMark.length * 32 + 650;
    mark.style.transitionDelay = hl + "ms";
    rest.forEach(function (w, k) { w.style.setProperty("--i", k); w.style.setProperty("--base", (hl + 1000) + "ms"); });
  });

  /* ------------------------------------------------------------ count-up */
  function runCount(el) {
    var raw = el.getAttribute("data-count");
    var target = parseFloat(raw);
    var decimals = (raw.split(".")[1] || "").length;
    var suffix = el.getAttribute("data-suffix") || "";
    var fmt = function (n) { return n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }); };
    if (reduceMotion) { el.textContent = fmt(target) + suffix; return; }
    var dur = 1600, start = null;
    var delay = parseFloat(getComputedStyle(el.closest("[style*='--d']") || el).getPropertyValue("--d")) || 0;
    setTimeout(function () {
      requestAnimationFrame(function step(ts) {
        if (!start) start = ts;
        var p = Math.min(1, (ts - start) / dur);
        el.textContent = fmt(target * (1 - Math.pow(1 - p, 4))) + suffix;
        if (p < 1) requestAnimationFrame(step);
      });
    }, delay + 250);
  }

  /* ------------------------------------------------------------ locked slides
     [data-lock="ms"]: when the slide reaches the top it snaps into place, scrolling
     pauses, its animations play, then scrolling resumes. First visit only, desktop
     only (needs Lenis); otherwise its content simply reveals on enter. */
  var locks = $all("[data-lock]");
  var lockOn = !!lenis && !mobile.matches;
  var REVEALS = "[data-split], [data-reveal], .numbers__stat, .viz, [data-bars], [data-wipe], [data-wipe-card], [data-chat]";
  function inLock(el) { return lockOn && !!el.closest("[data-lock]"); }
  // Reveal what's on screen now; anything further down the section reveals as it scrolls in.
  function playLock(sec) {
    var vh = window.innerHeight, later = [];
    $all(REVEALS, sec).forEach(function (el) {
      if (el.getBoundingClientRect().top < vh) el.classList.add("is-in"); else later.push(el);
    });
    onInview(later, function (el) { el.classList.add("is-in"); });
    $all("[data-count]", sec).forEach(function (el) {
      if (el.getBoundingClientRect().top < vh) runCount(el); else onInview([el], runCount, { threshold: 0.5 });
    });
  }
  function holdFor(ms) {
    lenis.stop();
    clearTimeout(holdFor._t);
    holdFor._t = setTimeout(function () { lenis.start(); }, ms);
  }
  // Cover plays on load: hold briefly if the page opens at the top
  if (lockOn && (window.scrollY || 0) < 10) holdFor(1800);

  function notLocked(list) { return list.filter(function (el) { return !inLock(el); }); }
  onInview(notLocked(splits.filter(function (el) { return !el.hasAttribute("data-split-load"); })), function (el) { el.classList.add("is-in"); });
  onInview(notLocked($all("[data-reveal]:not([data-reveal-load])")), function (el) { el.classList.add("is-in"); });
  onInview(notLocked($all(".viz, .numbers__stat, [data-bars], [data-wipe], [data-wipe-card], [data-chat]")), function (el) { el.classList.add("is-in"); }, { rootMargin: "0px 0px -18% 0px" });
  onInview(notLocked($all("[data-count]")), runCount, { threshold: 0.5 });

  // Cards: stagger within each track
  $all("[data-stack-track]").forEach(function (track) {
    $all(".card", track).forEach(function (card, i) { card.style.setProperty("--d", (i * 110) + "ms"); });
  });
  onInview($all(".card"), function (el) { el.classList.add("is-in"); }, { rootMargin: "0px 0px -8% 0px" });

  /* ------------------------------------------------------------ scroll-linked */
  var bar = document.querySelector("[data-bar]");
  var progress = document.querySelector("[data-progress]");
  var heroMedia = document.querySelector("[data-hero-media]");
  var heroPanel = document.querySelector("[data-hero-panel]");
  var heroVeil = document.querySelector("[data-hero-veil]");
  var themed = $all("main [data-theme], footer[data-theme]"); // later (nested) blocks win below
  var chapters = $all("[data-chapter]");
  var chapterLinks = $all("[data-chapter-link]");
  var stacks = $all("[data-stack]");
  var desktopWide = window.matchMedia("(min-width: 1101px)");
  var parallax = $all("[data-parallax]");
  var steps = $all("[data-steps] .step");

  /* Pinned card stages. Each card gets ~0.85 screens of scroll; the eased
     progress pauses briefly on every card so it settles in focus. */
  var STEP = 0.85, PAD = 0.8;
  function sizeStacks() {
    stacks.forEach(function (st) {
      var cards = $all(".card", st);
      var on = desktopWide.matches && !reduceMotion;
      st.classList.toggle("is-staged", on);
      st._cards = cards;
      if (!on) {
        st.style.removeProperty("--stack-h");
        cards.forEach(function (c) { c.style.transform = c.style.opacity = c.style.filter = c.style.zIndex = ""; c.style.removeProperty("--tf"); });
        return;
      }
      st.style.setProperty("--stack-h", Math.round(window.innerHeight * (1 + (cards.length - 1 + PAD) * STEP)) + "px");
    });
  }

  function stackProgress(st, vh) {
    var n = st._cards.length;
    var span = st.offsetHeight - vh;
    var t = span > 0 ? clamp01(-st.getBoundingClientRect().top / span) : 0;
    var raw = Math.min(n - 1, Math.max(0, t * (n - 1 + PAD) - PAD / 2));
    var k = Math.floor(raw), f = raw - k;
    f = clamp01((f - 0.15) / 0.7);
    f = f * f * (3 - 2 * f); // smoothstep: glide between cards, rest on each
    return k + f;
  }

  function layoutDeck(cards, p) {
    var fan = Math.min(210, Math.max(120, window.innerWidth * 0.11)) / 3; // matches --fan in CSS
    cards.forEach(function (c, i) {
      var d = i - p, tf = clamp01(1 - Math.abs(d) * 2.2), tr, op, fl;
      if (d < 0) { // retiring: lifts away, tilts and fades
        var a = Math.min(1, -d);
        tr = "translate3d(0," + (-a * 60).toFixed(2) + "%,0) rotate(" + (-a * 6).toFixed(2) + "deg) scale(" + (1 - a * 0.06).toFixed(3) + ")";
        op = clamp01(1 - a * 1.4); fl = "none";
      } else { // waiting: fanned out behind to the right, like a hand of cards
        var e = Math.min(d, 3);
        tr = "translate3d(" + (e * fan).toFixed(1) + "px," + (-e * 10).toFixed(1) + "px,0) rotate(" + (e * 3.5).toFixed(2) + "deg) scale(" + (1 - e * 0.05).toFixed(3) + ")";
        op = d > 3 ? 0 : 1; fl = "brightness(" + (1 - e * 0.14).toFixed(3) + ")";
      }
      c.style.transform = tr; c.style.opacity = op.toFixed(3); c.style.filter = fl;
      c.style.zIndex = 100 - i;
      c.style.setProperty("--tf", tf.toFixed(3));
      c.style.pointerEvents = Math.abs(d) < 0.5 ? "" : "none";
    });
  }

  function layoutFlow(cards, p) {
    var cw = cards[0].offsetWidth;
    cards.forEach(function (c, i) {
      var d = i - p, ad = Math.abs(d), tf = clamp01(1 - ad * 2.2);
      var tx = d * cw * 0.78, sc = 1 - Math.min(ad, 2.2) * 0.17, ry = Math.max(-28, Math.min(28, -d * 16));
      c.style.transform = "perspective(1400px) translate3d(" + tx.toFixed(1) + "px,0," + (-ad * 90).toFixed(1) + "px) rotateY(" + ry.toFixed(2) + "deg) scale(" + sc.toFixed(3) + ")";
      c.style.opacity = clamp01(1.1 - ad * 0.5).toFixed(3);
      c.style.filter = ad > 0.02 ? "blur(" + (Math.min(ad, 2) * 2.5).toFixed(2) + "px) saturate(" + (1 - Math.min(ad, 1) * 0.4).toFixed(2) + ")" : "none";
      c.style.zIndex = 100 - Math.round(ad * 10);
      c.style.setProperty("--tf", tf.toFixed(3));
      c.style.pointerEvents = ad < 0.5 ? "" : "none";
    });
  }

  var ticking = false, lockReady = false;

  function update() {
    ticking = false;
    var y = window.scrollY || window.pageYOffset;
    var vh = window.innerHeight;
    var docH = document.documentElement.scrollHeight - vh;

    // progress + bar state
    if (progress) progress.style.setProperty("--p", docH > 0 ? (y / docH).toFixed(4) : 0);
    bar.classList.toggle("is-top", y < vh * 0.6);

    // theme: whichever themed block sits under the bar's midline
    var probe = 32, theme = "dark", bg = "";
    for (var i = themed.length - 1; i >= 0; i--) {
      var r = themed[i].getBoundingClientRect();
      if (r.top <= probe && r.bottom > probe) {
        theme = themed[i].getAttribute("data-theme");
        bg = getComputedStyle(themed[i]).backgroundColor;
        break;
      }
    }
    bar.classList.toggle("is-light", theme === "light");
    bar.classList.toggle("is-solid", y > vh * 0.6 && bg && bg !== "rgba(0, 0, 0, 0)");
    if (bg) bar.style.setProperty("--bar-bg", bg);

    // active chapter
    var active = -1;
    chapters.forEach(function (c, k) {
      var r = c.getBoundingClientRect();
      if (r.top < vh * 0.5 && r.bottom > vh * 0.5) active = k;
    });
    chapterLinks.forEach(function (a, k) { a.classList.toggle("is-active", k === active); });

    // Locked slides: when a section's top edge reaches the top of the screen it snaps flush,
    // holds while its animations play, then releases. A fast flick past one snaps back to it.
    if (lockOn) {
      locks.forEach(function (sec) {
        if (sec._played) return;
        var r = sec.getBoundingClientRect();
        if (r.top > 0) return;                           // not reached yet
        sec._played = true;
        if (navigating || !lockReady) { playLock(sec); return; } // chapter-link jump, or page opened below it
        if (Math.abs(r.top) > 0.5) lenis.scrollTo(y + r.top, { immediate: true, force: true });
        holdFor(parseInt(sec.getAttribute("data-lock"), 10) || 2500);
        playLock(sec);
      });
      lockReady = true;
    }

    if (reduceMotion) return;

    // cover: photo drifts slower than the page, panel slightly faster; veil deepens
    if (heroMedia && y < vh * 1.2) {
      heroMedia.style.transform = "translate3d(0," + (y * 0.35).toFixed(1) + "px,0)";
      heroPanel.style.transform = "translate3d(0," + (y * -0.12).toFixed(1) + "px,0)";
      heroVeil.style.setProperty("--veil", (clamp01(y / vh) * 0.55).toFixed(3));
    }

    // pinned card stages
    stacks.forEach(function (st) {
      if (!st.classList.contains("is-staged")) return;
      var r = st.getBoundingClientRect();
      if (r.bottom < -vh || r.top > vh * 2) return;
      var p = stackProgress(st, vh), n = st._cards.length;
      (st.getAttribute("data-stack") === "deck" ? layoutDeck : layoutFlow)(st._cards, p);
      var cnt = st.querySelector("[data-stack-count]"), sb = st.querySelector("[data-stack-bar]");
      if (cnt) cnt.textContent = ("0" + (Math.round(p) + 1)).slice(-2);
      if (sb) sb.style.setProperty("--sp", (p / (n - 1)).toFixed(3));
    });

    // parallax chat panels
    parallax.forEach(function (el) {
      if (mobile.matches) { el.style.transform = ""; return; }
      var r = el.parentElement.getBoundingClientRect();
      var centre = r.top + r.height / 2 - vh / 2;
      el.style.transform = "translate3d(0," + (centre * parseFloat(el.getAttribute("data-parallax"))).toFixed(1) + "px,0)";
    });

    // step timeline: the step nearest the reading line is active; lines fill between steps
    if (!mobile.matches) {
      var line = vh * 0.45, activeStep = 0;
      steps.forEach(function (s, k) {
        var r = s.getBoundingClientRect();
        if (r.top < line) activeStep = k;
        s.style.setProperty("--fill", clamp01((line - r.top - 26) / (r.height)).toFixed(3));
      });
      steps.forEach(function (s, k) {
        s.classList.toggle("is-active", k === activeStep);
        s.classList.toggle("is-done", k < activeStep);
      });
    }
  }

  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  if (lenis) lenis.on("scroll", onScroll);
  window.addEventListener("scroll", onScroll, { passive: true });

  var resizeT;
  function onResize() {
    clearTimeout(resizeT);
    resizeT = setTimeout(function () { sizeStacks(); if (lenis) lenis.resize(); update(); }, 120);
  }
  window.addEventListener("resize", onResize);
  window.addEventListener("load", onResize);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(onResize);

  sizeStacks();
  update();
})();
