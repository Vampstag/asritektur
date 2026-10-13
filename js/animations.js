/*
 * Page animations (GSAP + ScrollTrigger + SplitText).
 * Requires: js/vendor/gsap.min.js, ScrollTrigger.min.js, SplitText.min.js
 */
(() => {
  gsap.registerPlugin(ScrollTrigger, SplitText);

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  /* ---------- helpers ---------- */

  // Scroll range used by almost every scroll animation: from the moment the
  // element enters the viewport until it has fully left it.
  const scrollRange = {
    start: "clamp(top bottom)",
    end: "clamp(bottom top)",
  };

  // Plays once when the element reaches `start`.
  const playOnce = (trigger, start = scrollRange.start) => ({
    trigger,
    start,
    end: scrollRange.end,
    toggleActions: "play none none none",
  });

  // Easing to use when a hover animation is played backwards without "flipping" the ease.
  const reverseEase = (ease) =>
    ease.endsWith(".out") ? ease.replace(".out", ".in") : ease.endsWith(".in") ? ease.replace(".in", ".out") : ease;

  /**
   * Hover animation: `tl` is a paused timeline (children use ease "none", duration 1)
   * that gets driven forward on mouseenter and backward on mouseleave.
   * flip = true  -> same ease in both directions
   * flip = false -> mirrored ease when going back
   */
  function bindHover(el, tl, { duration = 0.5, ease = "power1.out", flip = true } = {}) {
    const goTo = (progress, easing) =>
      gsap.to(tl, {
        progress,
        duration: duration * Math.abs(progress - tl.progress()),
        ease: easing,
        overwrite: true,
      });

    el.addEventListener("mouseenter", () => goTo(1, ease));
    el.addEventListener("mouseleave", () => goTo(0, flip ? ease : reverseEase(ease)));
  }

  const hoverTimeline = () => gsap.timeline({ paused: true, defaults: { duration: 1, ease: "none" } });

  /* ---------- hover animations ---------- */

  function initHovers() {
    // Nav / footer links: arrow rotates upright
    $$(".link-wrapper").forEach((link) => {
      const arrow = $(".arrow-link-icon", link);
      if (!arrow) return;
      bindHover(link, hoverTimeline().to(arrow, { rotation: 0 }), { duration: 0.4 });
    });

    // Primary button: the two brackets move outward and grow
    $$(".primary-button").forEach((button) => {
      const left = $(".bracket-icon:not(.bracket-right)", button);
      const right = $(".bracket-icon.bracket-right", button);
      if (!left || !right) return;
      const tl = hoverTimeline().to(left, { x: -8, scale: 1.2 }, 0).to(right, { x: 8, scale: 1.2 }, 0);
      bindHover(button, tl);
    });

    // Secondary button: inverts to black background / white text
    // GSAP cannot blend "var(--x)" strings (the in-between frames flash a wrong hue), so read the real colours once.
    const rootStyle = getComputedStyle(document.documentElement);
    const white = rootStyle.getPropertyValue("--white").trim() || "#ffffff";
    const blue = rootStyle.getPropertyValue("--blue").trim() || "#093b4f";

    $$(".secondary-button").forEach((button) => {
      const label = $(".button-text", button);
      const blackArrow = $(".arrow-button-icon.black", button);
      const tl = hoverTimeline().fromTo(button, { backgroundColor: white }, { backgroundColor: blue }, 0);
      // Text and arrow switch quickly around the halfway point. Blending them over the whole hover would make the
      // text the same mid-tone as the background at 50% and it would vanish for a moment.
      if (label) tl.fromTo(label, { color: blue }, { color: white, duration: 0.1 }, 0.45);
      if (blackArrow) tl.fromTo(blackArrow, { opacity: 1 }, { opacity: 0, duration: 0.1 }, 0.45);
      bindHover(button, tl, { flip: false });
    });

    // Works cards: image zooms in
    $$(".works-card").forEach((card) => {
      const image = $(".works-card-image", card);
      if (!image) return;
      bindHover(card, hoverTimeline().fromTo(image, { scale: 1 }, { scale: 1.2 }), { duration: 0.4 });
    });

    // Service cards: flip to the back (desktop only)
    const mm = gsap.matchMedia();
    mm.add("(min-width: 992px)", () => {
      const cleanups = $$(".service-card").map((card) => {
        const front = $(".service-card-front", card);
        const back = $(".service-card-back", card);
        if (!front || !back) return () => {};

        const tl = hoverTimeline()
          .fromTo(front, { rotationY: 0 }, { rotationY: 180 }, 0)
          .fromTo(back, { rotationY: 180 }, { rotationY: 0 }, 0);

        const enter = () => gsap.to(tl, { progress: 1, duration: 0.5 * (1 - tl.progress()), ease: "power1.inOut", overwrite: true });
        const leave = () => gsap.to(tl, { progress: 0, duration: 0.5 * tl.progress(), ease: "power1.inOut", overwrite: true });
        card.addEventListener("mouseenter", enter);
        card.addEventListener("mouseleave", leave);
        return () => {
          card.removeEventListener("mouseenter", enter);
          card.removeEventListener("mouseleave", leave);
        };
      });
      return () => cleanups.forEach((cleanup) => cleanup());
    });
  }

  /* ---------- text reveals ---------- */

  // Characters slide up from a mask, one after another.
  function revealChars(targets, vars, scrollTrigger) {
    const chars = targets.flatMap((el) => {
      const split = SplitText.create(el, { type: "words,chars", mask: "chars", tag: "span" });
      // Inline wrappers can't be translated, so make every piece a positioned inline-block.
      [...(split.words || []), ...split.chars, ...(split.masks || [])].forEach((piece) => {
        piece.style.position = "relative";
        piece.style.display = "inline-block";
      });
      // Pad the clipping mask below so descenders (g, y) are not cut; the negative margin keeps the line spacing.
      (split.masks || []).forEach((mask) => {
        mask.style.paddingBottom = "0.2em";
        mask.style.marginBottom = "-0.2em";
      });
      return split.chars;
    });
    if (!chars.length) return;
    gsap.from(chars, { opacity: 0, yPercent: 50, ...vars, scrollTrigger });
  }

  function initTextReveals() {
    // Hero (and every .display-large): on page load, staggered from the center
    revealChars($$(".display-large"), { stagger: { amount: 1, from: "center" }, duration: 0.5 });

    // Section headings: play once when they scroll into view
    $$("[data-split-reveal]").forEach((heading) => {
      revealChars([heading], { duration: 0.4, ease: "none", stagger: { amount: 0.8 } }, playOnce(heading));
    });
  }

  /* ---------- label lines ---------- */

  function initLabelLines() {
    // Other lines grow once when they scroll into view
    const lines = [
      { selector: ".label-line.works-line", from: 0, to: 80, ease: "none" },
      { selector: ".label-line.about-line", from: 0, to: 320 },
      { selector: ".label-line.service-line", from: 0, to: 80 },
      { selector: ".label-line.cta-line", from: 0, to: 80 },
    ];

    lines.forEach(({ selector, from, to, ease }) => {
      const el = $(selector);
      if (!el) return;
      gsap.fromTo(el, { width: from }, { width: to, duration: 0.5, ease, scrollTrigger: playOnce(el) });
    });
  }

  /* ---------- scroll-linked animations ---------- */

  function initScrollScrub() {
    const scrub = 0.8;

    // The hero fades while it scrolls out (the navbar is separate, see js/navbar.js)
    const heroBlock = $(".navbar-hero-wrapper");
    if (heroBlock) {
      gsap.fromTo(
        heroBlock,
        { opacity: 1 },
        { opacity: 0.2, ease: "power1.inOut", scrollTrigger: { trigger: heroBlock, start: "clamp(top top)", end: scrollRange.end, scrub } }
      );
    }

    // About image parallax
    const aboutSection = $(".about-section");
    if (aboutSection) {
      gsap.fromTo(
        ".about-paralax-image",
        { yPercent: -10 },
        { yPercent: 10, ease: "none", scrollTrigger: { trigger: aboutSection, ...scrollRange, scrub } }
      );
    }

    // Sticky testimonials: cards rise while the title widens
    const stickyBlock = $(".testimonial-stiky-wrapper");
    if (stickyBlock) {
      gsap
        .timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: stickyBlock, ...scrollRange, scrub } })
        .fromTo(".testimonial-card-wrapper", { yPercent: 100 }, { yPercent: -80, duration: 0.5 }, 0)
        .fromTo(".testimonial-title-wrapper", { width: "60%" }, { width: "100%", duration: 0.15 }, 0);
    }
  }

  /* ---------- stats counters ---------- */

  function initStats() {
    const section = $(".stats-section");
    if (!section) return;

    // Each column is a stack of numbers that rolls into place (alternating direction).
    const directions = { first: -400, second: 400, third: -400, fourth: 400 };
    const tl = gsap.timeline({
      defaults: { duration: 1, ease: "power1.out" },
      scrollTrigger: playOnce(section, "clamp(bottom center)"),
    });

    Object.entries(directions).forEach(([name, from]) => {
      const numbers = $$(`.stats-number-count.${name} .display-medium`, section);
      if (numbers.length) tl.fromTo(numbers, { yPercent: from }, { yPercent: 0 }, 0);
    });
  }

  /* ---------- init ---------- */

  window.addEventListener("DOMContentLoaded", () => {
    // SplitText measures glyphs, so wait until the fonts are loaded.
    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
    fontsReady.then(() => {
      initHovers();
      initTextReveals();
      initLabelLines();
      initScrollScrub();
      initStats();
      document.documentElement.classList.add("is-ready");
      ScrollTrigger.refresh();
    });
  });

  // Images change the page height once they load.
  window.addEventListener("load", () => ScrollTrigger.refresh());
})();
