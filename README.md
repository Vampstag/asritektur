# Asritektur

Static site, no build step and no external runtime dependencies.

## Run locally

Serve the folder over HTTP (opening `index.html` by double-click blocks the web fonts in Chrome):

```
npx serve .          # or VS Code "Live Server", or: python -m http.server 8000
```

## Structure

```
index.html
services/index.html   Layanan dan Harga
services/<standard|premium|profesional>/index.html   one landing page per package (generated, see _internal/build_packages.py)
about/index.html      Tentang (hero, numbers, mission, journey, team, FAQ)
journal/index.html    Jurnal (centred hero + two-column article cards; articles are TODO examples)
projects/2026/template-1.html   case-study template: copy per project, replace everything marked TODO
css/
  fonts.css          @font-face (self-hosted fonts)
  base.css           reset, element defaults, small utilities (.container, .inline-block, form controls)
  main.css           design tokens (:root), typography, sections, components, responsive rules
  animations.css     initial hidden states for animated elements
  services.css       Services page + building blocks shared with case studies (.svc-*: sections, hero, image reveal)
  project.css        case-study pages only (.cs-*: spec sheet, principles, gallery, next project)
  about.css          About page only (.ab-*)
  journal.css        Journal page only (.jr-*)
  archive.css        search / filters / layout switch shared by projects and journal (.ar-*)
  contact.css        contact and 404 pages
  faq.css            FAQ section shared by every page (.faq-*)
  home.css           home sections after the testimonials: Paket dan Harga, Keunggulan, Proses (.home-*)
  package.css        package landing pages only (.pkg-*: price line, deliverables, offer band, proof, comparison table)
js/
  main.js            smooth scrolling (Lenis) synced with GSAP
  animations.js      hovers, text reveals, scroll animations (GSAP + ScrollTrigger + SplitText)
  menu.js            mobile menu
  navbar.js            navbar: hides on scroll down, shows on scroll up
  slider.js            slideshow (fade, arrows, swipe, autoplay)
  hero-video.js            hero background video (pauses off screen / reduced motion)
  rotator.js            rotating word in the hero ("Hadir, untuk setiap" + Cerita / Kebutuhan / Keluarga / ...)
  services.js        Services + case-study animations (hero intro, image reveal/parallax, fade-ups, row hovers)
  contact.js         contact form: opens WhatsApp with the filled-in message
  faq.js             FAQ accordion + fade-up, shared by every page
  home.js            fade-up for the home sections after the testimonials ([data-home-reveal])
  package.js         package pages: scrolls the comparison table to this package on narrow screens
  share.js           "Bagikan Proyek" on case study pages (WhatsApp, Facebook, X, copy link, phone share sheet)
  i18n.js            ID / EN language switch (dictionary: i18n/en.js, loaded for English only)
  archive.js         search + filters + layout switch for [data-archive] sections (projects, journal)
  about.js           About page: journey timeline (scroll-linked, pinned)
  vendor/            gsap, ScrollTrigger, SplitText, lenis
assets/
  fonts/  img/  logo/  docs/
  img/works/<style>/   project photos, one folder per architectural style:
                     <style>-eksterior-01.png (raw, git-ignored) + <style>-eksterior-01.webp / -500 / -800 (optimised, tracked)
                     new photo: <style>-eksterior-NN or <style>-interior-NN, then export the 3 webp sizes next to it
legacy/            no longer used by any page; safe to delete (kept only until you confirm)
projects/index.html   Arsip Proyek: 30 placeholder cards, search, filters (paket, jenis, gaya, lokasi) and 3 layouts
contact/index.html   Hubungi Kami: form builds a WhatsApp message (js/contact.js, number in data-whatsapp)
404.html   Not found page (all URLs start with "/", so the site must live at the domain root)
```

## Notes

  Until then, submitting shows the error message.
- **Adding an animation:** `html.js:not(.is-ready)` in `css/animations.css` hides elements until their
  start state is set. If you add an element that animates *from* a hidden state, list it there too.
- **Open Graph image:** `og:image` uses a relative path; social networks need an absolute URL
  (`https://your-domain/assets/img/og/og-snippet.png`) once the site is deployed.
- GSAP, ScrollTrigger and SplitText are GreenSock libraries and fall under the
  [GSAP license](https://gsap.com/standard-license).

## Language (ID / EN)

Indonesian is the default and the single source of copy: write every new text in the HTML in Indonesian.
English is a switch (ID / EN in the navbar and the mobile menu), built to stay light:

- `js/i18n.js` (about 5 KB, every page) picks the language: `?lang=en|id`, then the saved choice (localStorage), then Indonesian.
- Only English visitors download `i18n/en.js`, the dictionary. It is loaded from `<head>` before the body is parsed, so the page is
  already English when the animations start (no flash, SplitText measures the English text).
- The dictionary keys are the Indonesian texts themselves. `js/i18n.js` translates every text node, `alt`, `aria-label`,
  `placeholder`, `title`, the meta description / og tags, the hero word list and the ready-made WhatsApp messages in links.
  Text without an entry simply stays Indonesian.
- Texts built by scripts use `window.i18n.t("Indonesian text")` or `window.i18n.tf("Text with {name}", { name })`
  (archive count, contact form messages, share messages, menu button label).
- Numbers, dates and photo captions ("3 dari 8", "Proyek 04 · Residensial", "13 Oktober 2026", "Foto ...") are handled by `rules` at the bottom of `i18n/en.js`.
- **Adding or changing copy:** edit the Indonesian in the HTML, then add / update the same Indonesian text as a key in `i18n/en.js`.
  (A changed Indonesian sentence no longer matches its old key, so it shows in Indonesian on the English site until the key is updated.)
- Choosing a language reloads the page on purpose, so every animation starts clean.
- Limits: the English text is applied in the browser, so search engines and link previews (WhatsApp, Facebook) still see the Indonesian
  HTML. If English search traffic matters later, generate static `/en/` pages from the same dictionary.
- `i18n/index.en.snapshot.html` is an old snapshot of the home page from before the Indonesian pass; it is not used by the site.

The brand line "Everyone Deserves Better Living" stays in English in both languages.
