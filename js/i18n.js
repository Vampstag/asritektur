/*
 * Language switch: Indonesian is the default, English is chosen with the ID / EN buttons in the navbar and menu.
 *
 * How it works
 * - The HTML is written in Indonesian and stays the single source of copy (good for search engines and no-JS visitors).
 * - The small inline script in <head> picks the language (?lang=en|id, then the saved choice, then Indonesian) and, only for
 *   English, loads i18n/en.js (the dictionary) before the page is parsed. Indonesian visitors never download it.
 * - This file runs at the end of <body>, before the animation scripts: it swaps every text node and the texts in alt,
 *   aria-label, placeholder, title, meta tags, the hero word list and the WhatsApp message links for their English
 *   version, so SplitText and the other animations measure the final English text.
 * - Keys in the dictionary are the Indonesian text itself. Text that has no entry is left as it is.
 * - Choosing a language saves it (localStorage) and reloads the page, which keeps every animation in a clean state.
 *
 * For scripts: window.i18n.lang ("id" | "en"), window.i18n.t("Indonesian text"), window.i18n.tf("Text with {name}", { name }).
 */
(() => {
  const html = document.documentElement;
  const pack = window.__I18N_EN;
  const lang = html.lang === "en" && pack ? "en" : "id";
  const dict = pack ? pack.dict : {};
  const rules = pack && pack.rules ? pack.rules : [];
  const has = Object.prototype.hasOwnProperty;
  const STORAGE_KEY = "asritektur-lang";

  const norm = (text) => String(text).replace(/\s+/g, " ").trim();

  function t(source) {
    if (lang !== "en") return source;
    const key = norm(source);
    if (!key) return source;
    if (has.call(dict, key)) return dict[key];
    for (let i = 0; i < rules.length; i += 1) {
      const match = key.match(rules[i][0]);
      if (match) return rules[i][1](...match, t);
    }
    return source;
  }

  const tf = (template, values) =>
    t(template).replace(/\{(\w+)\}/g, (whole, name) => (values && values[name] !== undefined ? values[name] : whole));

  window.i18n = { lang, t, tf };

  // ----- apply English to the page -----
  function translateAttributes() {
    document.querySelectorAll("[alt],[aria-label],[placeholder],[title]").forEach((el) => {
      ["alt", "aria-label", "placeholder", "title"].forEach((name) => {
        if (!el.hasAttribute(name)) return;
        const value = el.getAttribute(name);
        const out = t(value);
        if (out !== value) el.setAttribute(name, out);
      });
    });

    document
      .querySelectorAll(
        'meta[name="description"],meta[property="og:title"],meta[property="og:description"],meta[name="twitter:title"],meta[name="twitter:description"]'
      )
      .forEach((meta) => {
        const value = meta.getAttribute("content");
        const out = t(value);
        if (out !== value) meta.setAttribute("content", out);
      });

    // Hero word list ("Cerita.|Kebutuhan.|...") read by js/rotator.js
    document.querySelectorAll("[data-words]").forEach((el) => {
      el.setAttribute(
        "data-words",
        el
          .getAttribute("data-words")
          .split("|")
          .map((word) => t(word))
          .join("|")
      );
    });

    // Ready-made WhatsApp messages in the links
    document.querySelectorAll('a[href*="api.whatsapp.com"]').forEach((link) => {
      try {
        const url = new URL(link.href);
        const text = url.searchParams.get("text");
        if (!text) return;
        const out = t(text);
        if (out === text) return;
        url.searchParams.set("text", out);
        link.setAttribute("href", url.toString());
      } catch (error) {
        /* not a valid URL: leave it */
      }
    });
  }

  function translateTextNodes() {
    const skip = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEXTAREA: 1 };
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let node;
    while ((node = walker.nextNode())) {
      const parent = node.parentNode;
      if (!parent || skip[parent.nodeName]) continue;
      if (parent.closest && parent.closest("[data-i18n-skip]")) continue;
      nodes.push(node);
    }
    nodes.forEach((textNode) => {
      const raw = textNode.nodeValue;
      const key = norm(raw);
      if (!key) return;
      const out = t(key);
      if (out === key) return;
      textNode.nodeValue = raw.match(/^\s*/)[0] + out + raw.match(/\s*$/)[0];
    });
  }

  if (lang === "en") {
    translateTextNodes();
    translateAttributes();
    const title = t(document.title);
    if (title !== document.title) document.title = title;
  }
  html.classList.remove("i18n-wait");

  // ----- the ID / EN switch -----
  document.querySelectorAll(".lang-switch").forEach((switcher) => {
    switcher.dataset.active = lang;
  });
  document.querySelectorAll("[data-lang-set]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.langSet === lang));
    button.addEventListener("click", () => {
      const next = button.dataset.langSet;
      if (next === lang) return;
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch (error) {
        /* private mode: ?lang= below still carries the choice for this page */
      }
      // Slide the switch to the new language first, then reload into it
      document.querySelectorAll(".lang-switch").forEach((switcher) => {
        switcher.dataset.active = next;
        switcher.querySelectorAll("[data-lang-set]").forEach((other) => other.setAttribute("aria-pressed", String(other.dataset.langSet === next)));
      });
      const url = new URL(window.location.href);
      url.searchParams.set("lang", next);
      const go = () => (window.location.href = url.toString());
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) go();
      else window.setTimeout(go, 300);
    });
  });

  // Keep the address bar clean once the choice is saved
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.has("lang") && window.localStorage.getItem(STORAGE_KEY)) {
      url.searchParams.delete("lang");
      window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    }
  } catch (error) {
    /* ignore */
  }
})();
