/*
 * About page animations (about/index.html): the journey timeline. The FAQ lives in js/faq.js (shared by every page).
 * Hero intro, image reveal and fade-ups come from js/services.js.
 * Requires: js/vendor/gsap.min.js, ScrollTrigger.min.js
 */
(() => {
  gsap.registerPlugin(ScrollTrigger);

  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- journey timeline ----------
   * Desktop (4 columns): scroll-linked and pinned. A gold line draws across the dashed one as you scroll, each dot fills when the
   * line reaches it, and the figure + text of that step rise in at the same moment (reverses when scrolling back).
   * Tablet / phone: each step plays once when it comes into view.
   */

  function initTimeline() {
    const list = $$(".ab-timeline")[0];
    const steps = $$(".ab-step");
    if (!list || !steps.length || reducedMotion) return;

    const rootStyle = getComputedStyle(document.documentElement);
    const grey = rootStyle.getPropertyValue("--grey-200").trim() || "#d6dfe3";
    const blue = rootStyle.getPropertyValue("--blue").trim() || "#093b4f";

    const mm = gsap.matchMedia();

    mm.add("(min-width: 992px)", () => {
      list.classList.add("is-scrub");

      // The timeline itself is pinned in the middle of the screen while the animation plays, so it cannot scroll away
      // before the last step has appeared (the paragraph above scrolls up normally). It is ~270px tall, so it always fits.
      const pinned = list;

      // One unit of time = one full column. The first and last lines are half a column long.
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: pinned,
          start: "center center",
          end: () => "+=" + Math.round(window.innerHeight * 1.1),
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      const last = steps.length - 1;
      steps.forEach((step, i) => {
        const fill = step.querySelector(".ab-step-fill");
        const core = step.querySelector(".ab-step-core");
        const figure = step.querySelector(".ab-step-figure");
        const info = step.querySelector(".ab-step-info");

        // The line reaches step i exactly at time i (steps are one column apart).
        const dotTime = i;
        const lineStart = i === 0 ? 0 : i - 0.5;
        const lineLen = i === 0 || i === last ? 0.5 : 1;

        tl.fromTo(fill, { scaleX: 0 }, { scaleX: 1, duration: lineLen, immediateRender: true }, lineStart);
        tl.fromTo(core, { backgroundColor: grey, scale: 0.5 }, { backgroundColor: blue, scale: 1, duration: 0.22, ease: "power2.out", immediateRender: true }, Math.max(0, dotTime - 0.11));
        tl.fromTo(figure, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out", immediateRender: true }, Math.max(0, dotTime - 0.2));
        tl.fromTo(info, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out", immediateRender: true }, Math.max(0, dotTime - 0.1));
      });
      // keep the timeline at least as long as the last step so the scrub range maps cleanly
      tl.to({}, { duration: 0.15 }, last + 0.0);

      return () => {
        list.classList.remove("is-scrub");
        gsap.set(list.querySelectorAll(".ab-step-fill, .ab-step-core, .ab-step-figure, .ab-step-info"), { clearProps: "all" });
      };
    });

    mm.add("(max-width: 991px)", () => {
      steps.forEach((step, index) => {
        const line = step.querySelector(".ab-step-line");
        const dot = step.querySelector(".ab-step-dot");
        const figure = step.querySelector(".ab-step-figure");
        const info = step.querySelector(".ab-step-info");
        const lineVisible = getComputedStyle(step.querySelector(".ab-step-path")).display !== "none";

        const tl = gsap.timeline({
          defaults: { ease: "power2.out" },
          scrollTrigger: { trigger: step, start: "top 85%", toggleActions: "play none none none" },
        });

        tl.from(figure, { opacity: 0, y: 24, duration: 0.7 }, 0);
        if (lineVisible) {
          tl.from(dot, { scale: 0, duration: 0.5, ease: "back.out(2)" }, 0.15).from(line, { scaleX: 0, duration: 0.9, ease: "power2.inOut" }, 0.25);
        }
        tl.from(info, { opacity: 0, y: 24, duration: 0.7 }, 0.3 + index * 0.02);
      });
    });
  }

  window.addEventListener("DOMContentLoaded", () => {
    // Wait for fonts: the timeline text measures differently before they are loaded.
    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
    fontsReady.then(() => {
      initTimeline();
      ScrollTrigger.refresh();
    });
  });
})();
