/*
 * "Bagikan proyek" (case study pages).
 *
 * Markup contract (see projects/2026/template-1.html):
 *   [data-share]                       the block; it is hidden in the markup and shown here once the script runs
 *   [data-share-native]                button that opens the phone's own share sheet (only used on touch devices)
 *   [data-share-link="whatsapp|facebook|x"]   links; their href is built here from the current page
 *   [data-share-copy]                  copy-the-link button
 *   [data-share-status]                live region for "Tautan disalin"
 *
 * The shared URL is the page without hash or query. The text is "<project name> | Asritektur", read from the <h1>.
 */
(() => {
  window.addEventListener("DOMContentLoaded", () => {
    const root = document.querySelector("[data-share]");
    if (!root) return;

    const url = window.location.origin + window.location.pathname;
    const heading = document.querySelector("h1");
    const name = heading ? heading.textContent.trim() : document.title;
    const message = window.i18n ? window.i18n.tf("Lihat proyek {name} dari Asritektur", { name }) : `Lihat proyek ${name} dari Asritektur`;

    const nativeButton = root.querySelector("[data-share-native]");
    const copyButton = root.querySelector("[data-share-copy]");
    const status = root.querySelector("[data-share-status]");
    const links = Array.from(root.querySelectorAll("[data-share-link]"));

    const targets = {
      whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${message} ${url}`)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(url)}`,
    };
    links.forEach((link) => {
      link.href = targets[link.dataset.shareLink] || url;
    });

    // Phones and tablets: the system share sheet already lists every app, so the three network links step aside.
    const canNativeShare = typeof navigator.share === "function" && window.matchMedia("(pointer: coarse)").matches;
    if (nativeButton) nativeButton.hidden = !canNativeShare;
    if (canNativeShare) links.forEach((link) => (link.hidden = true));

    if (nativeButton && canNativeShare) {
      nativeButton.addEventListener("click", async () => {
        try {
          await navigator.share({ title: `${name} | Asritektur`, text: message, url });
        } catch (error) {
          /* the visitor closed the sheet: nothing to do */
        }
      });
    }

    let timer;
    const t = (text) => (window.i18n ? window.i18n.t(text) : text);
    const say = (text) => {
      if (!status) return;
      status.textContent = text;
      clearTimeout(timer);
      timer = setTimeout(() => (status.textContent = ""), 2600);
    };

    const fallbackCopy = () => {
      const field = document.createElement("textarea");
      field.value = url;
      field.setAttribute("readonly", "");
      field.style.cssText = "position:fixed;top:-1000px;opacity:0";
      document.body.appendChild(field);
      field.select();
      let ok = false;
      try {
        ok = document.execCommand("copy");
      } catch (error) {
        ok = false;
      }
      document.body.removeChild(field);
      return ok;
    };

    if (copyButton) {
      copyButton.addEventListener("click", async () => {
        let ok = false;
        try {
          await navigator.clipboard.writeText(url);
          ok = true;
        } catch (error) {
          ok = fallbackCopy();
        }
        say(ok ? t("Tautan disalin") : t("Tautan tidak bisa disalin. Salin dari bilah alamat."));
        if (ok) {
          copyButton.classList.add("is-done");
          setTimeout(() => copyButton.classList.remove("is-done"), 2600);
        }
      });
    }

    root.hidden = false;
  });
})();
