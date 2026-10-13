/*
 * Mobile / tablet menu (<= 991px): a full-screen panel that is revealed top-down (clip-path),
 * with the links rising out of line masks, hairlines drawing in and the two bars of the button crossing into an X.
 * Closing plays the same timeline backwards, a bit faster.
 * Requires: js/vendor/gsap.min.js (optional: window.lenis from js/main.js, paused while the menu is open)
 */
(() => {
  window.addEventListener("DOMContentLoaded", () => {
    const toggle = document.querySelector(".menu-wrapper");
    const popup = document.querySelector(".navbar-popup-wrapper");
    const navbar = document.querySelector(".navbar-section");
    if (!toggle || !popup || !window.gsap) return;

    const $$ = (selector, root = popup) => Array.from(root.querySelectorAll(selector));
    const lineTop = toggle.querySelector(".menu-line.top");
    const lineBottom = toggle.querySelector(".menu-line.bottom");
    const labelTrack = toggle.querySelector(".menu-label-track");
    const links = $$(".menu-link");
    const bottom = [popup.querySelector(".menu-cta"), ...$$(".menu-info-block")].filter(Boolean);

    const desktop = window.matchMedia("(min-width: 992px)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const openSpeed = () => (reducedMotion.matches ? 40 : 1);
    const closeSpeed = () => (reducedMotion.matches ? 40 : 1.6);

    const tl = gsap
      .timeline({ paused: true })
      // Panel: unrolls from the top edge. visibility keeps the closed panel out of the tab order and out of sight.
      .fromTo(
        popup,
        { clipPath: "inset(0% 0% 100% 0%)", visibility: "hidden" },
        { clipPath: "inset(0% 0% 0% 0%)", visibility: "visible", duration: 0.85, ease: "power4.inOut" },
        0
      )
      // Link text rises out of its mask, the hairlines draw in from the left, index + arrow fade in.
      .fromTo($$(".menu-link-text"), { yPercent: 115 }, { yPercent: 0, duration: 1, stagger: 0.08, ease: "power4.out" }, 0.35)
      .fromTo(links, { "--line": 0 }, { "--line": 1, duration: 0.9, stagger: 0.08, ease: "power3.out" }, 0.3)
      .fromTo($$(".menu-link-index, .menu-link-arrow"), { opacity: 0 }, { opacity: 1, duration: 0.6, stagger: 0.04, ease: "power1.out" }, 0.5)
      .fromTo(bottom, { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.09, ease: "power3.out" }, 0.6)
      // Button: bars meet in the middle and rotate into an X, the label rolls from "Menu" to "Tutup".
      .fromTo(lineTop, { y: 0, rotation: 0 }, { y: 5, rotation: 45, duration: 0.7, ease: "power3.inOut" }, 0)
      .fromTo(lineBottom, { y: 0, x: 5, scaleX: 0.643, rotation: 0 }, { y: -5, x: 0, scaleX: 1, rotation: -45, duration: 0.7, ease: "power3.inOut" }, 0)
      .fromTo(labelTrack, { yPercent: 0 }, { yPercent: -50, duration: 0.6, ease: "power3.inOut" }, 0);

    let isOpen = false;
    let focusTimer;

    const focusables = () => [toggle, ...$$("a[href]")];

    function setOpen(value, { instant = false, restoreFocus = false } = {}) {
      isOpen = value;
      navbar?.classList.toggle("is-open", isOpen);
      document.documentElement.classList.toggle("menu-open", isOpen);
      toggle.setAttribute("aria-expanded", String(isOpen));
      const label = (text) => (window.i18n ? window.i18n.t(text) : text);
      toggle.setAttribute("aria-label", isOpen ? label("Tutup menu") : label("Buka menu"));
      clearTimeout(focusTimer);

      if (isOpen) {
        window.lenis?.stop();
        tl.timeScale(openSpeed()).play();
        // Let keyboard and screen-reader users land inside the panel once it has started to open.
        focusTimer = setTimeout(() => links[0]?.focus({ preventScroll: true }), 400);
      } else {
        window.lenis?.start();
        if (instant) tl.pause(0);
        else tl.timeScale(closeSpeed()).reverse();
        if (restoreFocus) toggle.focus({ preventScroll: true });
      }
    }

    toggle.addEventListener("click", () => setOpen(!isOpen));

    // Picking a link closes the menu first, then the browser follows the anchor.
    popup.addEventListener("click", (event) => {
      if (isOpen && event.target.closest("a[href]")) setOpen(false);
    });

    document.addEventListener("keydown", (event) => {
      if (!isOpen) return;
      if (event.key === "Escape") {
        setOpen(false, { restoreFocus: true });
      } else if (event.key === "Tab") {
        // Keep focus inside the open menu (button + panel links).
        const items = focusables();
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });

    // Growing past the tablet breakpoint while open: reset instantly, the desktop navbar takes over.
    desktop.addEventListener("change", (event) => event.matches && isOpen && setOpen(false, { instant: true }));
  });
})();
