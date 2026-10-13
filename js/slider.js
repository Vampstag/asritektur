/*
 * Slideshow with cross-fade, arrows, swipe and autoplay.
 *
 * Markup: an element with [data-slider] (optionally data-autoplay="<ms>", 0 disables it) that contains
 * .slider-slide children, .slider-prev / .slider-next buttons.
 * Autoplay pauses on hover/focus, while the tab is hidden and while the slider is off screen.
 */
(() => {
  function init(root) {
    const slides = Array.from(root.querySelectorAll(".slider-slide"));
    if (slides.length < 2) return;

    const prevButton = root.querySelector(".slider-prev");
    const nextButton = root.querySelector(".slider-next");
    const delay = Number(root.dataset.autoplay ?? 5000);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let index = Math.max(0, slides.findIndex((slide) => slide.classList.contains("is-active")));
    let timer = null;
    let paused = false;
    let visible = true;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        const active = i === index;
        slide.classList.toggle("is-active", active);
        slide.setAttribute("aria-hidden", String(!active));
      });
    }

    function stop() {
      clearInterval(timer);
      timer = null;
    }

    function start() {
      stop();
      if (!delay || reducedMotion || paused || !visible || document.hidden) return;
      timer = setInterval(() => show(index + 1), delay);
    }

    // Manual navigation restarts the autoplay countdown.
    const go = (next) => {
      show(next);
      start();
    };

    prevButton?.addEventListener("click", () => go(index - 1));
    nextButton?.addEventListener("click", () => go(index + 1));

    root.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") go(index - 1);
      if (event.key === "ArrowRight") go(index + 1);
    });

    // Swipe
    let startX = null;
    root.addEventListener("pointerdown", (event) => {
      if (event.target.closest(".slider-arrow")) return;
      startX = event.clientX;
    });
    root.addEventListener("pointerup", (event) => {
      if (startX === null) return;
      const dx = event.clientX - startX;
      startX = null;
      if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1));
    });
    root.addEventListener("pointercancel", () => (startX = null));

    // Pause while hovering / focused
    const setPaused = (value) => {
      paused = value;
      start();
    };
    root.addEventListener("mouseenter", () => setPaused(true));
    root.addEventListener("mouseleave", () => setPaused(false));
    root.addEventListener("focusin", () => setPaused(true));
    root.addEventListener("focusout", () => setPaused(false));

    // Only run while on screen and while the tab is visible
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      start();
    }).observe(root);
    document.addEventListener("visibilitychange", start);

    show(index);
    start();
  }

  window.addEventListener("DOMContentLoaded", () => document.querySelectorAll("[data-slider]").forEach(init));
})();
