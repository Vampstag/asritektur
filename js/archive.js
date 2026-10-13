/*
 * Archive tools (search + filters + layout switch), shared by the project archive and the journal.
 *
 * Markup contract (see projects/index.html):
 *   [data-archive]                      root; optional data-archive-noun="proyek" for the result count
 *   [data-archive-grid]                 the element holding the items (data-layout is set on it by the layout buttons)
 *   [data-archive-item data-<key>=...]  one card; its text and data-* values are what the search looks at
 *   [data-archive-search]               <input type="search">
 *   [data-archive-filter="<key>"]       group of <button data-value="..."> chips (single choice, "" = all)
 *   [data-archive-select="<key>"]       <select> (value "" = all)
 *   [data-archive-count]                live region: "Menampilkan 12 dari 30 proyek"
 *   [data-archive-empty]                shown when nothing matches
 *   [data-archive-reset]                clears search and filters
 *   [data-archive-toggle] / [data-archive-panel] / [data-archive-badge]   phones: button that folds the filters, the filters, a counter
 *   [data-archive-layout="<name>"]      layout buttons (grid[data-layout] is set; the choice is remembered)
 *
 * Visible items also get data-pos="odd|even" so the staggered layouts keep their rhythm after filtering
 * (:nth-child would still count the hidden ones).
 */
(() => {
  const norm = (value) =>
    String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "");

  const STORAGE_KEY = "asritektur-archive-layout";
  const readStored = () => {
    try {
      return window.localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      return null;
    }
  };
  const writeStored = (value) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch (error) {
      /* private mode: the choice just is not remembered */
    }
  };

  // The page height changes when cards hide or the layout changes: tell the scroll libraries.
  let refreshQueued = false;
  const refreshScroll = () => {
    if (refreshQueued) return;
    refreshQueued = true;
    requestAnimationFrame(() => {
      refreshQueued = false;
      if (window.lenis) window.lenis.resize();
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    });
  };

  function init(root) {
    const items = Array.from(root.querySelectorAll("[data-archive-item]"));
    const grid = root.querySelector("[data-archive-grid]");
    const input = root.querySelector("[data-archive-search]");
    const chipGroups = Array.from(root.querySelectorAll("[data-archive-filter]"));
    const selects = Array.from(root.querySelectorAll("[data-archive-select]"));
    const count = root.querySelector("[data-archive-count]");
    const empty = root.querySelector("[data-archive-empty]");
    const resets = Array.from(root.querySelectorAll("[data-archive-reset]"));
    const layoutButtons = Array.from(root.querySelectorAll("[data-archive-layout]"));
    const toggle = root.querySelector("[data-archive-toggle]");
    const panel = root.querySelector("[data-archive-panel]");
    const badge = root.querySelector("[data-archive-badge]");
    const noun = root.dataset.archiveNoun || "item";

    // What the search looks at: the visible text of the card plus its data-* values.
    const haystack = new Map(items.map((item) => [item, norm(item.textContent + " " + Object.values(item.dataset).join(" "))]));

    const filters = {};

    function apply() {
      const tokens = norm(input ? input.value : "").split(/\s+/).filter(Boolean);
      let shown = 0;

      items.forEach((item) => {
        const text = haystack.get(item);
        const matchesText = tokens.every((token) => text.includes(token));
        const matchesFilters = Object.keys(filters).every((key) => !filters[key] || norm(item.dataset[key]) === norm(filters[key]));
        const visible = matchesText && matchesFilters;

        item.hidden = !visible;
        if (visible) {
          shown += 1;
          item.dataset.pos = shown % 2 === 0 ? "even" : "odd";
        }
      });

      // Phones: the filter button shows how many filters are on
      const activeFilters = Object.values(filters).filter(Boolean).length;
      if (badge) {
        badge.textContent = String(activeFilters);
        badge.hidden = activeFilters === 0;
      }

      if (count) {
        const i18n = window.i18n;
        count.textContent = i18n
          ? i18n.tf("Menampilkan {shown} dari {total} {noun}", { shown, total: items.length, noun: i18n.t(noun) })
          : `Menampilkan ${shown} dari ${items.length} ${noun}`;
      }
      if (empty) empty.hidden = shown > 0;

      const active = tokens.length > 0 || Object.values(filters).some(Boolean);
      resets.forEach((button) => {
        if (button.hasAttribute("data-archive-reset-toggle")) button.hidden = !active;
      });

      refreshScroll();
    }

    // ----- phones: filters are folded behind one button -----
    if (toggle && panel) {
      toggle.addEventListener("click", () => {
        const open = toggle.getAttribute("aria-expanded") !== "true";
        toggle.setAttribute("aria-expanded", String(open));
        panel.classList.toggle("is-open", open);
        refreshScroll();
      });
    }

    // ----- search -----
    if (input) {
      input.addEventListener("input", apply);
      input.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && input.value) {
          input.value = "";
          apply();
        }
      });
    }

    // ----- chips (single choice per group) -----
    chipGroups.forEach((group) => {
      const key = group.dataset.archiveFilter;
      filters[key] = "";
      group.addEventListener("click", (event) => {
        const chip = event.target.closest("button[data-value]");
        if (!chip) return;
        filters[key] = chip.dataset.value;
        group.querySelectorAll("button[data-value]").forEach((other) => {
          const on = other === chip;
          other.classList.toggle("is-active", on);
          other.setAttribute("aria-pressed", String(on));
        });
        apply();
      });
    });

    // ----- selects -----
    selects.forEach((select) => {
      const key = select.dataset.archiveSelect;
      filters[key] = "";
      select.addEventListener("change", () => {
        filters[key] = select.value;
        apply();
      });
    });

    // ----- reset -----
    resets.forEach((button) =>
      button.addEventListener("click", () => {
        if (input) input.value = "";
        Object.keys(filters).forEach((key) => (filters[key] = ""));
        chipGroups.forEach((group) =>
          group.querySelectorAll("button[data-value]").forEach((chip) => {
            const on = chip.dataset.value === "";
            chip.classList.toggle("is-active", on);
            chip.setAttribute("aria-pressed", String(on));
          })
        );
        selects.forEach((select) => (select.value = ""));
        apply();
        if (input) input.focus({ preventScroll: true });
      })
    );

    // ----- layout switch -----
    if (grid && layoutButtons.length) {
      const names = layoutButtons.map((button) => button.dataset.archiveLayout);
      const setLayout = (name, remember) => {
        if (!names.includes(name)) return;
        grid.dataset.layout = name;
        layoutButtons.forEach((button) => {
          const on = button.dataset.archiveLayout === name;
          button.classList.toggle("is-active", on);
          button.setAttribute("aria-pressed", String(on));
        });
        if (remember) writeStored(name);
        refreshScroll();
      };

      layoutButtons.forEach((button) => button.addEventListener("click", () => setLayout(button.dataset.archiveLayout, true)));
      setLayout(readStored() || grid.dataset.layout || names[0], false);
    }

    apply();
  }

  window.addEventListener("DOMContentLoaded", () => document.querySelectorAll("[data-archive]").forEach(init));
})();
