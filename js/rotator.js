/*
 * Word rotator: a vertical "slot" of words that keeps rolling upward in a seamless loop.
 * The words come from [data-words] (separated by "|"). The first word stays in the markup, so the page reads
 * correctly without JS and for visitors who prefer reduced motion (they see the static first word).
 *
 * Options (data attributes): data-hold = seconds each word rests (default 2.2), data-speed = seconds per roll (default 0.9).
 */
(() => {
  window.addEventListener("DOMContentLoaded", () => {
    const el = document.querySelector("[data-rotator]");
    if (!el || !window.gsap) return;

    const words = el.dataset.words.split("|").map((word) => word.trim()).filter(Boolean);
    if (words.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const hold = Number(el.dataset.hold ?? 2.2);
    const speed = Number(el.dataset.speed ?? 0.9);

    // Build: window > list > items, with the first word repeated at the end so the last roll lands on it.
    const view = document.createElement("span");
    view.className = "rotator-window";
    const list = document.createElement("span");
    list.className = "rotator-list";
    [...words, words[0]].forEach((word) => {
      const item = document.createElement("span");
      item.className = "rotator-item";
      item.textContent = word;
      list.appendChild(item);
    });
    view.appendChild(list);
    el.setAttribute("aria-label", words.join(", "));
    el.textContent = "";
    el.appendChild(view);
    list.setAttribute("aria-hidden", "true");

    // Each roll moves the list up by exactly one item (the list is words.length + 1 items tall).
    const step = 100 / (words.length + 1);
    const tl = gsap.timeline({ repeat: -1 });
    words.forEach((_, i) => {
      tl.to(list, { yPercent: -step * (i + 1), duration: speed, ease: "power3.inOut" }, i * (hold + speed) + hold);
    });
    // After the last roll the list shows the repeated first word; the repeat rewinds to the identical frame.
    tl.to({}, { duration: 0.001 }, words.length * (hold + speed));

    // Do not burn cycles while the tab is hidden.
    document.addEventListener("visibilitychange", () => (document.hidden ? tl.pause() : tl.resume()));
  });
})();
