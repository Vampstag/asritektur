/*
 * Home sections after the testimonials (css/home.css): Paket dan Harga, Keunggulan, Proses.
 * Fades each [data-home-reveal] element up when it scrolls into view, the same way js/faq.js does for the FAQ.
 * Requires: js/vendor/gsap.min.js, ScrollTrigger.min.js
 */
(() => {
  window.addEventListener("DOMContentLoaded", () => {
    if (!window.gsap) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);

    document.querySelectorAll(".home-section").forEach((section) => {
      section.querySelectorAll("[data-home-reveal]").forEach((el, index) => {
        gsap.from(el, {
          opacity: 0,
          y: 32,
          duration: 0.9,
          delay: el.hasAttribute("data-home-stagger") ? (index % 5) * 0.06 : 0,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 90%", toggleActions: "play none none none" },
        });
      });
    });
  });
})();
