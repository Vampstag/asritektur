/*
 * Package pages (services/<paket>/, css/package.css): on narrow screens the comparison table scrolls sideways,
 * so start it with this page's own package column in view instead of the first one.
 */
(() => {
  window.addEventListener("load", () => {
    document.querySelectorAll(".pkg-table-wrap").forEach((wrap) => {
      const current = wrap.querySelector("thead .is-current");
      if (!current || wrap.scrollWidth <= wrap.clientWidth) return;
      const label = wrap.querySelector("tbody th");
      const offset = label ? label.getBoundingClientRect().width : 0;
      wrap.scrollLeft = Math.max(0, current.offsetLeft - offset);
    });
  });
})();
