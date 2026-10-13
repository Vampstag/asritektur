/*
 * FAQ section (css/faq.css), used on every page: one question open at a time, the answer slides open,
 * and the section fades up when it scrolls into view.
 * Requires: js/vendor/gsap.min.js, ScrollTrigger.min.js
 */
(() => {
  window.addEventListener("DOMContentLoaded", () => {
    if (!window.gsap) return;
    gsap.registerPlugin(ScrollTrigger);

    const sections = Array.from(document.querySelectorAll(".faq-section"));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reducedMotion ? 0 : 0.45;

    sections.forEach((section) => {
      const items = Array.from(section.querySelectorAll(".faq-item"));

      const set = (item, open) => {
        item.querySelector(".faq-btn").setAttribute("aria-expanded", String(open));
        gsap.to(item.querySelector(".faq-panel"), {
          height: open ? "auto" : 0,
          duration,
          ease: "power2.inOut",
          overwrite: true,
          // The page gets taller or shorter while the answer slides: tell the smooth-scroll library (js/main.js) so the
          // bottom of the page, and the footer under it, stays reachable.
          onUpdate: () => window.lenis && window.lenis.resize(),
          onComplete: () => {
            if (window.lenis) window.lenis.resize();
            ScrollTrigger.refresh();
          },
        });
      };

      items.forEach((item) => {
        const button = item.querySelector(".faq-btn");
        button.addEventListener("click", () => {
          const willOpen = button.getAttribute("aria-expanded") !== "true";
          items.forEach((other) => {
            if (other !== item && other.querySelector(".faq-btn").getAttribute("aria-expanded") === "true") set(other, false);
          });
          set(item, willOpen);
        });
      });

      if (!reducedMotion) {
        section.querySelectorAll("[data-faq-reveal]").forEach((el) => {
          gsap.from(el, {
            opacity: 0,
            y: 32,
            duration: 0.9,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 90%", toggleActions: "play none none none" },
          });
        });
      }
    });
  });
})();
