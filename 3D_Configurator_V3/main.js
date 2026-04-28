(function () {
  const stage = document.getElementById("stage");
  const stacks = document.querySelectorAll(".figure-stack");
  const viewportFrame = document.getElementById("viewport-frame");
  const toggleBtns = document.querySelectorAll(".toggle-opt");
  const crumbBtns = document.querySelectorAll(".crumb");
  const zoomInBtn = document.getElementById("zoom-in-btn");
  const zoomOutBtn = document.getElementById("zoom-out-btn");
  const resetBtn = document.getElementById("reset-btn");
  const layersPanel = document.getElementById("layers-panel");
  const studyPanel = document.getElementById("study-panel");
  const layersList = document.getElementById("layers-list");
  const hintText = document.getElementById("hint-text");

  const ZOOM_STEP = 0.15;
  const WHEEL_STEP = 0.1;
  const ZOOM_MIN = 0.6;
  const ZOOM_MAX = 8;
  const DEFAULT_ZOOM = 1;

  // Head focal point: head center sits at ~10% of layer image height,
  // ty = HEAD_ZOOM * H * (0.5 - HEAD_HEAD_Y)
  const HEAD_ZOOM = 4.5;
  const HEAD_HEAD_Y = 0.10;
  const HEAD_TRANSITION_MS = 900;

  let zoom = DEFAULT_ZOOM;
  let tx = 0;
  let ty = 0;
  let currentSex = "male";
  let currentView = "body"; // "body" | "head"

  // ---------- Layers (sliders) ----------
  // Each slider key maps to either a real layer image, or null for a
  // decorative slider that has no visual effect (Cardiovascular shares
  // anatomy with the skeletal layer).
  const LAYER_DEFS = [
    { key: "integumentary", label: "Integumentary System (Tissue)", layer: "skin" },
    { key: "skeletal",      label: "Skeletal System",                layer: "skeletal" },
    { key: "muscular",      label: "Muscular System",                layer: "muscular" },
    { key: "cardiovascular",label: "Cardiovascular System",          layer: null },
    { key: "nervous",       label: "Nervous System",                 layer: "nervous" },
  ];

  const layerValues = {};
  LAYER_DEFS.forEach((d) => (layerValues[d.key] = 100));

  function buildLayers() {
    layersList.innerHTML = LAYER_DEFS.map(
      ({ key, label }) => `
      <div class="layer-item" data-slider="${key}">
        <div class="layer-label">
          <span class="layer-name">${label}</span>
          <span class="layer-value">100</span>
        </div>
        <div class="slider">
          <div class="slider-track">
            <span class="slider-thumb" style="left: 100%"></span>
          </div>
        </div>
      </div>`
    ).join("");
  }
  buildLayers();

  function applyLayerOpacity(key) {
    const def = LAYER_DEFS.find((d) => d.key === key);
    if (!def || !def.layer) return;
    const opacity = layerValues[key] / 100;
    document
      .querySelectorAll(`.figure-layer[data-layer="${def.layer}"]`)
      .forEach((el) => {
        el.style.opacity = opacity;
      });
  }

  function setSliderValue(key, value) {
    value = Math.max(0, Math.min(100, value));
    layerValues[key] = value;
    const item = document.querySelector(`.layer-item[data-slider="${key}"]`);
    if (item) {
      item.querySelector(".layer-value").textContent = Math.round(value);
      item.querySelector(".slider-thumb").style.left = value + "%";
    }
    applyLayerOpacity(key);
  }

  // ---------- Slider drag interactions ----------
  function setupSliders() {
    document.querySelectorAll(".layer-item").forEach((item) => {
      const key = item.dataset.slider;
      const slider = item.querySelector(".slider");
      const track = item.querySelector(".slider-track");
      let dragging = false;

      const updateFromEvent = (e) => {
        const rect = track.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const value = (x / rect.width) * 100;
        setSliderValue(key, value);
      };

      slider.addEventListener("mousedown", (e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();
        dragging = true;
        updateFromEvent(e);
      });

      window.addEventListener("mousemove", (e) => {
        if (!dragging) return;
        updateFromEvent(e);
      });

      window.addEventListener("mouseup", () => {
        dragging = false;
      });
    });
  }
  setupSliders();

  // Apply initial opacities
  LAYER_DEFS.forEach((d) => applyLayerOpacity(d.key));

  // ---------- Transforms ----------
  function applyTransform() {
    const t = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(${zoom})`;
    stacks.forEach((s) => {
      s.style.transform = t;
    });
  }

  function setZoom(next) {
    zoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, next));
    applyTransform();
  }

  function resetView() {
    zoom = DEFAULT_ZOOM;
    tx = 0;
    ty = 0;
    applyTransform();
  }

  function setSex(sex) {
    if (sex !== "male" && sex !== "female") return;
    if (sex === currentSex) return;
    currentSex = sex;

    toggleBtns.forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.sex === sex);
    });

    stacks.forEach((s) => {
      s.classList.toggle("is-current", s.dataset.sex === sex);
    });
  }

  function setActiveCrumb(step) {
    crumbBtns.forEach((b) =>
      b.classList.toggle("is-active", b.dataset.step === step)
    );
  }

  // ---------- View transitions ----------
  function enterHeadView() {
    if (currentView === "head") return;
    currentView = "head";

    setActiveCrumb("head");

    const H = viewportFrame.clientHeight;
    stacks.forEach((s) => s.classList.add("is-animating"));
    zoom = HEAD_ZOOM;
    tx = 0;
    ty = HEAD_ZOOM * H * (0.5 - HEAD_HEAD_Y);
    applyTransform();

    setTimeout(() => {
      stacks.forEach((s) => s.classList.remove("is-animating"));
      stage.classList.add("is-head-view");
      requestAnimationFrame(() => {
        layersPanel.classList.add("is-visible");
        studyPanel.classList.add("is-visible");
      });
      hintText.textContent = "Drag to pan and rotate";
    }, HEAD_TRANSITION_MS);
  }

  function exitHeadView() {
    if (currentView === "body") return;
    currentView = "body";

    setActiveCrumb("body");
    layersPanel.classList.remove("is-visible");
    studyPanel.classList.remove("is-visible");

    setTimeout(() => {
      stage.classList.remove("is-head-view");
      stacks.forEach((s) => s.classList.add("is-animating"));
      resetView();
      setTimeout(() => {
        stacks.forEach((s) => s.classList.remove("is-animating"));
      }, HEAD_TRANSITION_MS);
    }, 200);

    hintText.textContent =
      "Click head or body to select an area · ⌃-click or right-click to drag · scroll to zoom";
  }

  // ---------- Controls ----------
  toggleBtns.forEach((btn) => {
    btn.addEventListener("click", () => setSex(btn.dataset.sex));
  });

  crumbBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const step = btn.dataset.step;
      if (step === "head" && currentView !== "head") {
        enterHeadView();
        return;
      }
      if (step === "body" && currentView !== "body") {
        exitHeadView();
        return;
      }
      setActiveCrumb(step);
    });
  });

  zoomInBtn.addEventListener("click", () => setZoom(zoom + ZOOM_STEP));
  zoomOutBtn.addEventListener("click", () => setZoom(zoom - ZOOM_STEP));
  resetBtn.addEventListener("click", () => {
    if (currentView === "head") {
      exitHeadView();
    } else {
      resetView();
      setSex("male");
      LAYER_DEFS.forEach((d) => setSliderValue(d.key, 100));
    }
  });

  // ---------- Wheel zoom ----------
  viewportFrame.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      const dir = e.deltaY < 0 ? 1 : -1;
      setZoom(zoom + dir * WHEEL_STEP);
    },
    { passive: false }
  );

  // ---------- Drag to pan ----------
  let dragging = false;
  let didDrag = false;
  let dragButton = null;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragStartTx = 0;
  let dragStartTy = 0;

  function isDragGesture(e) {
    if (e.button === 2 || e.button === 1) return true;
    if (e.button === 0 && (e.ctrlKey || e.metaKey)) return true;
    return false;
  }

  viewportFrame.addEventListener("contextmenu", (e) => e.preventDefault());

  viewportFrame.addEventListener("mousedown", (e) => {
    if (!isDragGesture(e)) return;
    e.preventDefault();
    dragging = true;
    didDrag = false;
    dragButton = e.button;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    dragStartTx = tx;
    dragStartTy = ty;
    viewportFrame.classList.add("is-dragging");
  });

  window.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) didDrag = true;
    tx = dragStartTx + dx;
    ty = dragStartTy + dy;
    applyTransform();
  });

  window.addEventListener("mouseup", (e) => {
    if (!dragging) return;
    if (e.button !== dragButton) return;
    dragging = false;
    dragButton = null;
    viewportFrame.classList.remove("is-dragging");
  });

  window.addEventListener("blur", () => {
    if (dragging) {
      dragging = false;
      viewportFrame.classList.remove("is-dragging");
    }
  });

  // ---------- Click on head area enters head view ----------
  viewportFrame.addEventListener("click", (e) => {
    if (e.button !== 0) return;
    if (e.ctrlKey || e.metaKey) return;
    if (didDrag) {
      didDrag = false;
      return;
    }
    if (currentView !== "body") return;

    const stack = document.querySelector(".figure-stack.is-current");
    if (!stack) return;
    const rect = stack.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (x < 0 || x > rect.width || y < 0 || y > rect.height) return;
    const yFrac = y / rect.height;
    if (yFrac >= 0.02 && yFrac <= 0.2) {
      enterHeadView();
    }
  });

  // ---------- Collapsible panels ----------
  function setupCollapsible(panel) {
    const btn = panel.querySelector(".panel-collapse-btn");
    if (!btn) return;
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      panel.classList.toggle("is-collapsed");
    });
  }

  // ---------- Draggable panels (drag by header) ----------
  function makeDraggable(panel) {
    const handle = panel.querySelector("[data-drag-handle]");
    if (!handle) return;

    let dragging = false;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;

    handle.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;
      // Don't start a drag from the chevron button
      if (e.target.closest(".panel-collapse-btn")) return;
      e.preventDefault();

      // Convert any right-anchored position to absolute left so dragging works
      const offsetParent = panel.offsetParent || stage;
      const parentRect = offsetParent.getBoundingClientRect();
      const rect = panel.getBoundingClientRect();
      panel.style.left = rect.left - parentRect.left + "px";
      panel.style.right = "auto";
      panel.style.top = rect.top - parentRect.top + "px";

      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = parseFloat(panel.style.left);
      startTop = parseFloat(panel.style.top);
      handle.classList.add("is-grabbing");
      document.body.style.userSelect = "none";
    });

    window.addEventListener("mousemove", (e) => {
      if (!dragging) return;
      const offsetParent = panel.offsetParent || stage;
      const parentRect = offsetParent.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      const newLeft = startLeft + (e.clientX - startX);
      const newTop = startTop + (e.clientY - startY);
      const maxLeft = parentRect.width - panelRect.width;
      const maxTop = parentRect.height - panelRect.height;
      panel.style.left = Math.max(0, Math.min(maxLeft, newLeft)) + "px";
      panel.style.top = Math.max(0, Math.min(maxTop, newTop)) + "px";
    });

    window.addEventListener("mouseup", () => {
      if (!dragging) return;
      dragging = false;
      handle.classList.remove("is-grabbing");
      document.body.style.userSelect = "";
    });
  }

  [layersPanel, studyPanel].forEach((p) => {
    setupCollapsible(p);
    makeDraggable(p);
  });

  // ---------- Custom dropdowns ----------
  function setupDropdowns() {
    const wraps = document.querySelectorAll(".dd-wrap");

    function closeAll(except) {
      wraps.forEach((w) => {
        if (w === except) return;
        w.querySelector(".dd-row").classList.remove("is-open");
        w.querySelector(".dd-menu").classList.remove("is-open");
      });
    }

    wraps.forEach((wrap) => {
      const row = wrap.querySelector(".dd-row");
      const menu = wrap.querySelector(".dd-menu");
      const label = wrap.querySelector(".dd-label");
      const options = wrap.querySelectorAll(".dd-option");

      row.addEventListener("click", (e) => {
        e.stopPropagation();
        const willOpen = !row.classList.contains("is-open");
        closeAll(wrap);
        row.classList.toggle("is-open", willOpen);
        menu.classList.toggle("is-open", willOpen);
      });

      options.forEach((opt) => {
        opt.addEventListener("click", (e) => {
          e.stopPropagation();
          options.forEach((o) => o.classList.toggle("is-selected", o === opt));
          label.textContent = opt.textContent;
          row.classList.add("has-selection");
          row.classList.remove("is-open");
          menu.classList.remove("is-open");
        });
      });
    });

    document.addEventListener("click", () => closeAll(null));
  }
  setupDropdowns();

  applyTransform();
})();
