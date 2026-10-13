/*
 * Navbar: hides while scrolling down, comes back as soon as the user scrolls up.
 * It stays visible near the top of the page and while the mobile menu is open.
 */
(() => {
  window.addEventListener("DOMContentLoaded", () => {
    const navbar = document.querySelector(".navbar-section");
    if (!navbar) return;

    const TOP_OFFSET = 80; // always visible this close to the top
    const THRESHOLD = 6; // ignore tiny movements (trackpad jitter)
    let lastY = window.scrollY;

    const update = () => {
      const y = Math.max(window.scrollY, 0);
      const delta = y - lastY;

      if (y <= TOP_OFFSET || navbar.classList.contains("is-open")) {
        navbar.classList.remove("is-hidden");
      } else if (delta > THRESHOLD) {
        navbar.classList.add("is-hidden");
      } else if (delta < -THRESHOLD) {
        navbar.classList.remove("is-hidden");
      } else {
        return; // below the threshold: keep the reference point
      }

      lastY = y;
    };

    window.addEventListener("scroll", update, { passive: true });
    update();
  });
})();
