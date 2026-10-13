/*
 * Smooth scrolling (Lenis) wired into GSAP's ticker so ScrollTrigger stays in sync.
 * Requires: js/vendor/gsap.min.js, ScrollTrigger.min.js, lenis.min.js
 */
(() => {
  const lenis = new Lenis({ lerp: 0.07 });
  window.lenis = lenis; // js/menu.js pauses scrolling while the mobile menu is open

  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Keep the scroll limit in step with the real page height. If it goes stale (an FAQ answer opens, a lazy image or a
  // font loads), the page stops short of the bottom and the fixed footer stays partly covered by the section above it.
  const syncHeight = () => lenis.resize();
  window.addEventListener("load", syncHeight);
  if (window.ResizeObserver) new ResizeObserver(syncHeight).observe(document.body);

  // Footer "Kembali ke atas" button
  document.querySelectorAll("[data-back-to-top]").forEach((button) => {
    button.addEventListener("click", () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) lenis.scrollTo(0, { immediate: true });
      else lenis.scrollTo(0, { duration: 1.8, easing: (t) => 1 - Math.pow(1 - t, 4) });
    });
  });
})();
