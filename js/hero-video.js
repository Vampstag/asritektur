/*
 * Background videos (hero and the "Punya Rencana Hunian?" CTA): autoplay muted on loop. Each one is paused while it is
 * off screen (saves CPU and battery) and never plays for visitors who prefer reduced motion (they keep the poster frame).
 */
(() => {
  window.addEventListener("DOMContentLoaded", () => {
    const videos = Array.from(document.querySelectorAll(".hero-video"));
    if (!videos.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      videos.forEach((video) => {
        video.removeAttribute("autoplay");
        video.pause();
      });
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (isIntersecting) target.play().catch(() => {});
        else target.pause();
      });
    });
    videos.forEach((video) => observer.observe(video));
  });
})();
