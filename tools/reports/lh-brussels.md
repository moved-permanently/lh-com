# lh-brussels (Brussels Airlines)

Site `moved-permanently/lh-brussels`, repoless on lh-com's code, content in DA
`moved-permanently/lh-brussels`; `/metadata.json` sets robots noindex and brand `brussels`.

## Theme `brussels` (2026-10-31)

Sources, through one warm Bright Data session (a page every 5 to 10 s, no block): www's be/en and
be/fr homepages (HTML, screenshots 1440 and 390, computed styles), the design system's
`/digitalhangar/design-system/releases/mausy-v1.40.1/standalone/css/brussels.css` (the release the
pages load; v1.38.0's file is byte for byte the same) and `packages/css/sn-fonts.css`, the favicon
and manifest (`tools/importer/bd-brand-icons.mjs`). Kept in `content-sites/lh-brussels/look/`.

`scripts/brands.js` `brussels`: name Brussels Airlines, OneTrust `01994cb3-c7a3-7096-82a3-ae642c99e85e`,
www `www.brusselsairlines.com`, portal `SN` (the pages' meta X-Portal), hub `BRU` (the fare
widgets' origin), airline `SN`, destination images `/content/dam/bel/images/offers/destination`
(the widgets' imageBaseUrl), the fallback cookie banner's links (www's OneTrust banner: xx/en and
xx/fr legal notices with `?hidebanner=true`); no Message Center tenant yet. A root's X-Portal comes
from its row: Brussels' roots (`BRAND_SITES`) arrive with the groundwork.
`scripts/brand-icons.js` `brussels`: `/etc/designs/sn/favicon.ico` (image/ico) and
`/etc/designs/sn/manifest.json`, copies at www's paths with the manifest's three icons.

`styles/themes/brussels.css`, tokens only, on lh-com's names as `austrian.css`:

| What | Value (design-system token) |
| --- | --- |
| Fonts | Intelo 400 and 700 (`Intelo-Regular.woff2`, `Intelo-Bold.woff2`) for headings and copy, at www's path `/digitalhangar/design-system/releases/mausy-v1.40.1/standalone/fonts/brussels/` first (the replica's own, for lh-edge), `https://www.brusselsairlines.com/...` second; no copies in the repository |
| Text, headings | `#1a1a1a` (sngrey8); headings Bold |
| Actions, links in copy | `#e5002b` (sn-red-2), hover `#ac0020` (sn-red-3) |
| Buttons | primary white on red; secondary red outline with red text (as www renders them; the stylesheet's `buttonsecondary` blue `#0a1f62` fills no button on these pages); lh-com's 4 px radius = www's |
| Blues | `#0a1f62` (sn-blue-3, selection), `#051446` (sn-blue-4, footer) |
| Greys | `#f8f8f8 #e8e8e8 #e8e8e8 #c5c5c5 #bababa #afafaf #696969 #1a1a1a` (sngrey1 to 8) |
| Status, focus | error `#ac0020`, success `#3b813f`, focus `#0968f6` |
| Header | white bar; links, login and menu red 16 px regular, hover `#ac0020`; logo 26 px high, 34 px from 1281 px (www's `brussel-logo.svg` 115×26 and 150×34) |
| Footer | `#051446` link area, white text; headings 18 px, uppercase from 768 px, flush left without a line, the accordion rows regular below 768 px; links 16/22 regular, 15 px apart; logo row white |

Shared code, additive (each default is today's value): `blocks/header/header.css`
`--nav-logo-height`, `--nav-logo-height-wide`, `--nav-bar-font-size`, `--nav-bar-font-weight`;
`blocks/footer/footer.css` `--footer-heading-size`, `--footer-toggle-weight`,
`--footer-heading-transform`, `--footer-title-line`, `--footer-column-indent`, `--footer-link-size`,
`--footer-link-weight`, `--footer-link-gap`, `--footer-link-line-height`.

Checks: a local page with brand `brussels` (aem up of the working tree; the page, a be/en nav and
footer with www's texts from `content-sites/lh-brussels/local-check`, www's fonts and logos served
from the copies, nothing requested from www) at 1440 and 390 against www's screenshots: header,
logo, type (h2 36/28 px as www's heading-medium), links, buttons and footer as above. Before and
after on local servers of the working tree (the four shared files stashed for "before"):
lufthansa.com's 19 comparison pages and the homepages of Discover, ITA, Austrian, Cargo and Air
Dolomiti equal except the head's stylesheet order (showcase-notice.css, the known timing noise;
the same elements as a set). `test/brand-brussels.test.mjs`.

Left for the import: the footer's fourth column (Social media beside the link columns on www, a
badges row below them here), the logo row's Member of Lufthansa Group image and Star Alliance
size, the header's tool icons: content of the nav and footer documents.
