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

  // Links to another section of the same page ("#Isi", "#Perbandingan", ...): scroll there with the same easing as the
  // "Kembali ke atas" button instead of jumping. Longer distances take a little longer. Links to a section of another
  // page ("services/#Paket") are left alone: the browser opens that page, as before.
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest && event.target.closest("a[href]");
    if (!link || (link.target && link.target !== "_self")) return;

    let url;
    try {
      url = new URL(link.href, window.location.href);
    } catch (error) {
      return;
    }
    if (!url.hash || url.hash.length < 2) return;
    if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || url.search !== window.location.search) return;

    let target;
    try {
      target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    } catch (error) {
      return;
    }
    if (!target) return;

    event.preventDefault();
    // Lenis already honours the section's CSS scroll-margin-top, so no extra offset here
    const distance = target.getBoundingClientRect().top;
    const go = () => {
      if (reducedMotion.matches) lenis.scrollTo(target, { immediate: true });
      else
        lenis.scrollTo(target, {
          duration: Math.min(2.2, Math.max(1.1, Math.abs(distance) / 1500)),
          easing: (t) => 1 - Math.pow(1 - t, 4),
        });
    };
    // The mobile menu (js/menu.js) pauses Lenis while it is open and restarts it on the same click: wait one frame
    window.requestAnimationFrame(go);

    // Keep the address and keyboard focus in step with where the page lands
    if (window.location.hash !== url.hash) window.history.replaceState(null, "", url.hash);
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  });

  // Footer "Kembali ke atas" button
  document.querySelectorAll("[data-back-to-top]").forEach((button) => {
    button.addEventListener("click", () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) lenis.scrollTo(0, { immediate: true });
      else lenis.scrollTo(0, { duration: 1.8, easing: (t) => 1 - Math.pow(1 - t, 4) });
    });
  });
})();
