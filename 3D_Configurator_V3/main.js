(function () {
  const figureImg = document.getElementById("figure-img");
  const figureWrap = document.getElementById("figure-wrap");
  const toggleBtns = document.querySelectorAll(".toggle-opt");
  const crumbBtns = document.querySelectorAll(".crumb");
  const zoomInBtn = document.getElementById("zoom-in-btn");
  const zoomOutBtn = document.getElementById("zoom-out-btn");
  const resetBtn = document.getElementById("reset-btn");

  const ZOOM_STEP = 0.15;
  const ZOOM_MIN = 0.6;
  const ZOOM_MAX = 2.5;
  const DEFAULT_ZOOM = 1;

  let zoom = DEFAULT_ZOOM;

  const figureSrc = {
    male: "assets/body-male.png",
    female: "assets/body-female.png",
  };

  function applyZoom() {
    figureImg.style.transform = `scale(${zoom})`;
  }

  function setZoom(next) {
    zoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, next));
    applyZoom();
  }

  function setSex(sex) {
    if (!figureSrc[sex]) return;
    if (figureImg.dataset.sex === sex) return;

    toggleBtns.forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.sex === sex);
    });

    figureImg.classList.add("is-swapping");
    setTimeout(() => {
      figureImg.src = figureSrc[sex];
      figureImg.alt = sex === "male" ? "Male body figure" : "Female body figure";
      figureImg.dataset.sex = sex;
      figureImg.addEventListener(
        "load",
        () => figureImg.classList.remove("is-swapping"),
        { once: true }
      );
    }, 160);
  }

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
    setZoom(DEFAULT_ZOOM);
    setSex("male");
  });

  figureImg.dataset.sex = "male";
})();
