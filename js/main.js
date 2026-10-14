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

  // Scroll cue: a small "Gulir" + arrow chip fixed at the bottom centre of the first screen of every page that opens with a
  // hero. Heroes fill the screen (and on phones run past it), so visitors who do not expect to scroll can miss that there is
  // more. It fades out as soon as the page moves, comes back at the top, and a tap scrolls roughly one screen down.
  const hero = document.querySelector(".hero-section, .ab-hero, .svc-hero, .ct-section");
  if (hero) {
    const tr = (text) => (window.i18n ? window.i18n.t(text) : text);
    const cue = document.createElement("button");
    cue.type = "button";
    cue.className = "scroll-cue";
    cue.setAttribute("aria-label", tr("Gulir ke bawah"));
    cue.innerHTML =
      '<span class="scroll-cue-label">' + tr("Gulir") + "</span>" +
      '<svg viewBox="0 0 14 22" width="10" height="16" fill="none" stroke="currentColor" stroke-width="1.25" aria-hidden="true"><path d="M7 1v19M1.5 14.5 7 20l5.5-5.5"/></svg>';
    document.body.appendChild(cue);

    const update = () => {
      const away = window.scrollY > 40;
      if (!away && cue.classList.contains("is-away")) scheduleCheck(); // back at the top: measure again
      cue.classList.toggle("is-away", away);
    };
    lenis.on("scroll", update);

    // On small phones a dense hero can run past the screen and reach the cue's spot. The cue never sits on top of a button,
    // link or form field: if it would, it stays hidden (the cut-off content already shows there is more below).
    const checkBlocked = () => {
      if (window.scrollY > 40) return; // only the first screen matters
      cue.classList.remove("is-blocked");
      const r = cue.getBoundingClientRect();
      const targets = [...hero.querySelectorAll("a, button, input, select, textarea"), ...document.querySelectorAll(".latest-card")];
      const hit = targets.some((el) => {
        const b = el.getBoundingClientRect();
        return b.width > 1 && b.height > 1 && b.left < r.right && b.right > r.left && b.top < r.bottom && b.bottom > r.top;
      });
      cue.classList.toggle("is-blocked", hit);
    };
    let blockedTimer;
    const scheduleCheck = () => {
      window.clearTimeout(blockedTimer);
      blockedTimer = window.setTimeout(checkBlocked, 150);
    };
    window.addEventListener("resize", scheduleCheck);
    // after the intro animations settle (they move the hero content for a moment), and once more to be sure
    window.addEventListener("load", () => {
      window.setTimeout(checkBlocked, 900);
      window.setTimeout(checkBlocked, 2600);
    });
    update();

    cue.addEventListener("click", () => {
      // The next section, but never further than about one screen: the contact hero alone is taller than a screen
      const next = hero.nextElementSibling;
      const nextTop = next ? next.getBoundingClientRect().top + window.scrollY : Infinity;
      const y = Math.min(nextTop, window.scrollY + window.innerHeight * 0.85);
      if (reducedMotion.matches) lenis.scrollTo(y, { immediate: true });
      else lenis.scrollTo(y, { duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4) });
    });
  }
})();
