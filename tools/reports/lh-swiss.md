# lh-swiss (SWISS)

Site `moved-permanently/lh-swiss`, repoless on lh-com's code, content in DA
`moved-permanently/lh-swiss`; `/metadata.json` sets robots noindex and brand `swiss`.

## Theme `swiss` (2026-11-02)

Sources: the group design system's `/digitalhangar/design-system/releases/mausy-v1.40.1/standalone/css/swiss.css`
(theme `maui-theme-lx`, one request, 200); www.swiss.com's ch/en homepage answered the first page
load with Cloudflare's "Just a moment..." (403), so nothing else was loaded from www. The look comes
from the theme file, the groundwork's measurements and the rendered snapshots of `/ch/en/homepage`
and `/ch/de/homepage` (swiss-snapshots-001.tar.gz, cookies rejected; read offline: their CSS stays on
www, so they give the structure, texts, classes and links, not computed styles).

`scripts/brands.js` `swiss`: name SWISS, OneTrust `01994cb2-f461-7489-80cc-e1ce655a86bc` (the
snapshots' data-domain-script), Message Center tenant `lx`, www `www.swiss.com`, portal `LX` (the
pages' meta X-Portal), airline `LX`, hub `ZRH` (GVA the second one: the roots' airports come with
`BRAND_SITES`), the fallback cookie banner's links: the footer's privacy statement and imprint
under `/ch/<ll>/terms-conditions` (en, de; no cookie page of its own; other languages: en's).

`styles/themes/swiss.css`, tokens only, on lh-com's names as `brussels.css`:

| What | Value (design-system token) |
| --- | --- |
| Fonts | CH Sans, `.woff` only: SwissHead 300/400/700 (`chsans-light|regular|bold-webfont.woff`), SwissText 400/700, at www's path `/digitalhangar/design-system/releases/mausy-v1.40.1/standalone/fonts/swiss/` first (the replica's own host), `https://www.swiss.com/...` second |
| Text, headings | `#101010` (lxgrey8); headings SwissHead 700, line height 1.1 (h2 36/39.6 at 1440), 0.7 px tracking; copy SwissText 16/22, 0.6 px |
| Actions, links, selection | `#c00` (lx-red), hover `#900` (berry-red) |
| Buttons | square (radius 0), 50 px, 18 px bold, padding 8 px 30 px; primary white on red; secondary and the buttonsecondary fill warm grey `#6f6660`, hover pine grey `#554e49` |
| Greys | `#f2f2f2 #f2f2f2 #ccc #ccc #929292 #929292 #666 #101010` (lxgrey1 to 8) |
| Messages, focus | error `#ab3b35` (on `#f8ded6`), success `#477c00` (on `#f2f5ee`); info `#2c6187` on `#e8f5fc` and warning on `#feeea4` have no lh-com token; focus `#0968f6` |
| Header | white bar, a 1 px `#ccc` rule under it (`--header-bar-shadow`), quick actions warm grey, hover pine grey; logo 28 px high (www's `swiss-logo.svg` 121×28); 121 px from 768 px |
| Footer | white, a 1 px `#ccc` rule on top; headings `#101010` 18 px bold without a rule under them; links warm grey 16/22 regular, hover pine grey; logo row white, the logo 20 px (80×20) |
| Main-stage card | hero-card-overlay's light variant (white, 8 px radius from 768 px, 40/48 px padding): the documents choose it |

Shared code, additive (each default is today's value): `styles/styles.css` `--body-letter-spacing`
and `--heading-letter-spacing` (no fallback: unset, the property inherits as before),
`--button-font-size` (default the body size), `--button-padding` (default 11px 30px);
`blocks/footer/footer.css` `--footer-text-color` (default #fff), `--footer-link-color` and
`--footer-link-hover-color` (default the footer text), `--footer-top-line` (default none),
`--footer-locale-color` and `--footer-locale-hover-color` (defaults #ebebeb, #fff).

`scripts/brand-icons.js` `swiss`: `/etc/designs/lx/favicon.ico` (image/ico) and
`/etc/designs/lx/manifest.json` ("SWISS", short "LX"); `etc/designs/lx/` holds www's favicon, manifest,
its three icons (`clientlib-all/img/icon_16x16.png`, `icon_32x32.png`, `icon_192x192.png`) and the logo
`clientlib-all/vite/img/swiss-logo.svg`, byte for byte from swiss-assets-002.tar.gz (nothing hot-linked
to www.swiss.com).

Open:
- Not this repository's part of lh-swiss: lh-edge's `swiss.turnsthe.page` entry (`SITE_HOSTS`,
  `SITE_ORIGINS`, `SITE_WWW_HOSTS`) and `SITE_DESIGN_HOSTS` `swiss=www.swiss.com`, so the CH Sans
  files and the design system answer from the site's own host (until then the fonts come from
  www.swiss.com's absolute URL); `helix-query.yaml` for lh-swiss's indexes.
- From the snapshots, for the nav and footer documents (the kickoff): the footer's four columns
  (About us, Services, Customer support, Stay informed), the social row (LinkedIn, Instagram,
  TikTok, Facebook, X, Threads, YouTube: `/content/dam/lx/icons/footer-*.svg`), the sub-footer:
  SWISS logo 80×20, "Member of Lufthansa Group", Star Alliance, then Imprint, Legal, Data
  protection, Change Privacy Settings (lh-com's footer has the legal row above the logos).
