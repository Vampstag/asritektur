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
  archive.js         search + filters + layout switch for [data-archive] sections (projects, journal)
  about.js           About page: journey timeline (scroll-linked, pinned)
  vendor/            gsap, ScrollTrigger, SplitText, lenis
assets/
  fonts/  img/  logo/  docs/
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

## Language

The site is Indonesian-first (`<html lang="id">`). An English version is planned as a language switch.
`i18n/index.en.snapshot.html` is a snapshot of `index.html` taken just before the Indonesian pass (English copy,
except for a few sections that were already Indonesian: About text, "Proyek Terbaru" card, WhatsApp widget).
It is only a reference for the future English strings, not a page to publish.
