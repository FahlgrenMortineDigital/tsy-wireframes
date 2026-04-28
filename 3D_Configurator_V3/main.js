(function () {
  const figureImgs = document.querySelectorAll(".figure-img");
  const viewportFrame = document.getElementById("viewport-frame");
  const toggleBtns = document.querySelectorAll(".toggle-opt");
  const crumbBtns = document.querySelectorAll(".crumb");
  const zoomInBtn = document.getElementById("zoom-in-btn");
  const zoomOutBtn = document.getElementById("zoom-out-btn");
  const resetBtn = document.getElementById("reset-btn");

  const ZOOM_STEP = 0.15;
  const WHEEL_STEP = 0.1;
  const ZOOM_MIN = 0.6;
  const ZOOM_MAX = 4;
  const DEFAULT_ZOOM = 1;

  let zoom = DEFAULT_ZOOM;
  let tx = 0;
  let ty = 0;
  let currentSex = "male";

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

  // --- Controls ---
  toggleBtns.forEach((btn) => {
    btn.addEventListener("click", () => setSex(btn.dataset.sex));
  });

  crumbBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      crumbBtns.forEach((b) => b.classList.toggle("is-active", b === btn));
    });
  });

  zoomInBtn.addEventListener("click", () => setZoom(zoom + ZOOM_STEP));
  zoomOutBtn.addEventListener("click", () => setZoom(zoom - ZOOM_STEP));
  resetBtn.addEventListener("click", () => {
    resetView();
    setSex("male");
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
    dragButton = e.button;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    dragStartTx = tx;
    dragStartTy = ty;
    viewportFrame.classList.add("is-dragging");
  });

  window.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    tx = dragStartTx + (e.clientX - dragStartX);
    ty = dragStartTy + (e.clientY - dragStartY);
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

  applyTransform();
})();
