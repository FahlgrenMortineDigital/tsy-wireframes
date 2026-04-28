(function () {
  const stage = document.getElementById("stage");
  const figureImgs = document.querySelectorAll(".figure-img");
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

  // Head-view target (derived from Figma frame 27400:14982: image scaled
  // to 5.6x viewport height, vertical center at ~11% of full image height,
  // so the image is pushed down by roughly 2.18 viewport heights to bring
  // the head into view.)
  const HEAD_ZOOM = 5.5;
  const HEAD_TY_FACTOR = 2.05;
  const HEAD_TRANSITION_MS = 900;

  let zoom = DEFAULT_ZOOM;
  let tx = 0;
  let ty = 0;
  let currentSex = "male";
  let currentView = "body"; // "body" | "head"

  // --- Layers data ---
  const LAYERS = [
    "Integumentary System (Tissue)",
    "Skeletal System",
    "Muscular System",
    "Cardiovascular System",
    "Nervous System",
  ];

  function buildLayers() {
    layersList.innerHTML = LAYERS.map(
      (name) => `
      <div class="layer-item">
        <div class="layer-label">
          <span class="layer-name">${name}</span>
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

  // --- Transforms ---
  function applyTransform() {
    const t = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(${zoom})`;
    figureImgs.forEach((img) => {
      img.style.transform = t;
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

    figureImgs.forEach((img) => {
      img.classList.toggle("is-current", img.dataset.sex === sex);
    });
  }

  function setActiveCrumb(step) {
    crumbBtns.forEach((b) =>
      b.classList.toggle("is-active", b.dataset.step === step)
    );
  }

  // --- View transitions ---
  function enterHeadView() {
    if (currentView === "head") return;
    currentView = "head";

    setActiveCrumb("head");

    const H = viewportFrame.clientHeight;
    figureImgs.forEach((img) => img.classList.add("is-animating"));
    zoom = HEAD_ZOOM;
    tx = 0;
    ty = H * HEAD_TY_FACTOR;
    applyTransform();

    setTimeout(() => {
      figureImgs.forEach((img) => img.classList.remove("is-animating"));
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
      figureImgs.forEach((img) => img.classList.add("is-animating"));
      resetView();
      setTimeout(() => {
        figureImgs.forEach((img) => img.classList.remove("is-animating"));
      }, HEAD_TRANSITION_MS);
    }, 200);

    hintText.textContent =
      "Click head or body to select an area · ⌃-click or right-click to drag · scroll to zoom";
  }

  // --- Controls ---
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
    }
  });

  // --- Wheel zoom ---
  viewportFrame.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      const dir = e.deltaY < 0 ? 1 : -1;
      setZoom(zoom + dir * WHEEL_STEP);
    },
    { passive: false }
  );

  // --- Drag to pan: right-click, middle-click, or Ctrl/Cmd + left-click ---
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

  // --- Click on head area enters head view ---
  viewportFrame.addEventListener("click", (e) => {
    if (e.button !== 0) return;
    if (e.ctrlKey || e.metaKey) return;
    if (didDrag) {
      didDrag = false;
      return;
    }
    if (currentView !== "body") return;
    if (!e.target.classList.contains("figure-img")) return;

    const rect = e.target.getBoundingClientRect();
    const yFrac = (e.clientY - rect.top) / rect.height;
    if (yFrac >= 0.02 && yFrac <= 0.2) {
      enterHeadView();
    }
  });

  applyTransform();
})();
