/*
 * Services page animations (GSAP + ScrollTrigger + SplitText).
 * Ported from the template's interactions: hero intro, image reveal (a cover wipes away while the photo settles from
 * 1.4x), scroll parallax, list rows that fill from the bottom on hover and a fade-up on scroll.
 * Navbar, buttons and footer links are handled by js/animations.js, js/menu.js and js/navbar.js.
 * Requires: js/vendor/gsap.min.js, ScrollTrigger.min.js, SplitText.min.js
 */
(() => {
  gsap.registerPlugin(ScrollTrigger, SplitText);

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const root = document.documentElement;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Plays once when the element is 10% into the viewport.
  const playOnce = (trigger) => ({ trigger, start: "top 90%", toggleActions: "play none none none" });

  /* ---------- hero intro (page load) ---------- */

  function initHero() {
    const title = $(".svc-title");
    if (!title) return;

    const words = SplitText.create(title, { type: "words" }).words;
    // The case-study pages reuse this intro with different bottom content, so only animate what is on the page.
    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
    if ($(".svc-hero-label")) tl.from(".svc-hero-label", { opacity: 0, duration: 0.5 }, 0);
    tl.from(words, { opacity: 0, y: 24, duration: 0.7, stagger: { amount: 0.5 } }, 0.11);
    if ($(".svc-lead")) tl.from(".svc-lead", { opacity: 0, duration: 0.5 }, 0.71);
    if ($(".svc-hero-actions")) tl.from(".svc-hero-actions", { opacity: 0, duration: 0.5 }, 0.89);
    if ($(".svc-hero-meta")) tl.from(".svc-hero-meta", { opacity: 0, duration: 0.5 }, 0.71);

    // The gold hairline in the label draws in with it
    if ($(".svc-hero-label .label-line")) {
      gsap.fromTo(".svc-hero-label .label-line", { width: 0 }, { width: 80, duration: 0.8, ease: "power2.out", delay: 0.1 });
    }
  }

  /* ---------- fade up on scroll ---------- */

  function initFadeUps() {
    $$("[data-svc-reveal]").forEach((el) => {
      gsap.from(el, {
        opacity: 0,
        y: 32,
        duration: 0.9,
        ease: "power2.out",
        delay: parseFloat(el.dataset.svcDelay || "0"),
        scrollTrigger: playOnce(el),
      });
    });

    // Gold hairlines of the section labels (the hero one is part of the intro above)
    $$(".svc-heading .label-line").forEach((line) => {
      gsap.fromTo(line, { width: 0 }, { width: 80, duration: 0.5, ease: "none", scrollTrigger: playOnce(line) });
    });
  }

  /* ---------- image reveal + parallax ---------- */

  function initImages() {
    $$(".img-reveal").forEach((box) => {
      const cover = $(".img-cover", box);
      const img = $(".img-parallax", box);
      if (!cover || !img) return;

      // Cover wipes down while the photo settles from 1.4x to 1x
      gsap.set(cover, { yPercent: 0 });
      gsap.set(img, { scale: 1.4 });
      gsap
        .timeline({ defaults: { duration: 2, ease: "quart.out" }, scrollTrigger: playOnce(box) })
        .to(cover, { yPercent: 100 }, 0)
        .to(img, { scale: 1 }, 0);

      // Parallax: the photo drifts down through its frame while the page scrolls past. It travels exactly as far as
      // it is taller than the frame (read from the layout, so each frame can set its own overscan in CSS).
      const overscan = () => ((img.offsetHeight - box.offsetHeight) / img.offsetHeight) * 100;
      gsap.fromTo(
        img,
        { yPercent: 0 },
        {
          yPercent: overscan,
          ease: "none",
          scrollTrigger: { trigger: box, start: "top bottom", end: "bottom top", scrub: 0.8, invalidateOnRefresh: true },
        }
      );
    });
  }

  /* ---------- hover ---------- */

  // Same helper as js/animations.js: `tl` is a paused timeline (children ease "none", duration 1) driven by hover.
  function bindHover(el, tl, duration = 0.5) {
    const goTo = (progress) =>
      gsap.to(tl, { progress, duration: duration * Math.abs(progress - tl.progress()), ease: "power1.out", overwrite: true });
    el.addEventListener("mouseenter", () => goTo(1));
    el.addEventListener("mouseleave", () => goTo(0));
  }

  const hoverTimeline = () => gsap.timeline({ paused: true, defaults: { duration: 1, ease: "none" } });

  function initHovers() {
    const mm = gsap.matchMedia();

    mm.add("(hover: hover) and (pointer: fine)", () => {
      // Package rows: the row pulls in to 95% while a soft panel fills it from the bottom
      $$(".svc-row").forEach((row) => {
        const item = $(".svc-row-item", row);
        const bg = $(".svc-row-bg", row);
        const arrow = $(".svc-row-arrow", row);
        const tl = hoverTimeline()
          .fromTo(item, { scale: 1 }, { scale: 0.95 }, 0)
          .fromTo(bg, { height: "0%", backgroundColor: "rgba(255,255,255,0)" }, { height: "100%", backgroundColor: "rgba(255,255,255,0.07)" }, 0);
        if (arrow) tl.fromTo(arrow, { rotation: -45 }, { rotation: 0 }, 0);
        bindHover(row, tl);
      });

      // Archive cards (projects page): the photo zooms in slightly and the arrow turns upright
      $$(".pl-card").forEach((card) => {
        const img = $(".img-parallax", card);
        const arrow = $(".pl-card-arrow", card);
        // immediateRender: false keeps this from resetting the 1.4x start state of the image reveal.
        const tl = hoverTimeline().fromTo(img, { scale: 1 }, { scale: 1.04, immediateRender: false }, 0);
        if (arrow) tl.fromTo(arrow, { rotation: -45 }, { rotation: 0 }, 0);
        bindHover(card, tl, 0.6);
      });
    });
  }

  /* ---------- init ---------- */

  function init() {
    if (reducedMotion) {
      // No motion: show everything as it is and drop the covers.
      $$(".img-cover").forEach((cover) => (cover.style.display = "none"));
    } else {
      initHero();
      initFadeUps();
      initImages();
      initHovers();
    }
    root.classList.remove("svc-failed");
    root.classList.add("svc-ready");
    ScrollTrigger.refresh();
  }

  window.addEventListener("DOMContentLoaded", () => {
    // SplitText measures glyphs, so wait until the fonts are loaded.
    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
    fontsReady.then(init);
  });

  // Images change the page height once they load.
  window.addEventListener("load", () => ScrollTrigger.refresh());
})();
