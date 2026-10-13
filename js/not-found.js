/*
 * 404 page: the number "404" first flickers through random digits, then locks in digit by digit, left to right.
 * Every digit keeps the width of its final character, so the layout never jumps. Reduced motion: static "404".
 * The heading keeps aria-label="404", the flickering spans are hidden from screen readers.
 */
(() => {
  const root = document.documentElement;
  const title = document.querySelector("[data-scramble]");
  const reveal = () => root.classList.add("nf-ready");

  if (!title) return reveal();
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return reveal();

  const finalText = title.dataset.scramble; // "404"
  const LOCK_AT = [900, 1350, 1800]; // ms at which each digit stops changing
  const TICK = 55; // ms between random digits

  function run() {
    title.textContent = "";
    title.setAttribute("aria-label", finalText);

    const cells = Array.from(finalText).map((char) => {
      const cell = document.createElement("span");
      cell.className = "nf-digit";
      cell.setAttribute("aria-hidden", "true");
      cell.textContent = char;
      title.appendChild(cell);
      return cell;
    });

    // Freeze each cell at the width of its real digit before the digits start changing. The width is stored in em,
    // so it keeps matching the glyph when the heading's size changes (window resize, rotating a phone).
    const fontSize = parseFloat(getComputedStyle(title).fontSize);
    cells.forEach((cell) => (cell.style.width = cell.getBoundingClientRect().width / fontSize + "em"));
    reveal();

    const randomDigit = () => String(Math.floor(Math.random() * 10));
    const start = performance.now();

    const timer = setInterval(() => {
      const elapsed = performance.now() - start;
      let done = true;
      cells.forEach((cell, i) => {
        const locked = elapsed >= (LOCK_AT[i] ?? LOCK_AT[LOCK_AT.length - 1] + i * 450);
        if (locked) {
          if (cell.textContent !== finalText[i]) cell.textContent = finalText[i];
          cell.classList.add("is-locked");
        } else {
          cell.textContent = randomDigit();
          done = false;
        }
      });
      if (done) clearInterval(timer);
    }, TICK);
  }

  // Digits are measured, so wait for the fonts first
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(run);
})();
