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

Left for the import (done 2026-11-01, below): the footer's fourth column, the logo row's Member of
Lufthansa Group image and Star Alliance size, the header's tool icons.

## Roots (2026-11-01)

`scripts/brands.js` `BRAND_SITES.brussels`: the six reference roots (be/en, be/fr, be/nl, de/de,
it/it, es/es) with their own documents, the 92 market roots answered from their language's, no xx
roots (www sends `/xx/<ll>/*` to `/be/<ll>/*`). Names: www's country and language selector (be/en
in English, be/fr in French, as www writes them: "Senegal | Français"); those of the nl, de, it
and es roots ("België | Nederlands" ...) until their homepages are captured. No airports listed:
the hub BRU. lh-edge builds a table from it but no host serves it until the brussels.turnsthe.page
entry.

## Import tooling

As Austrian's (`tools/importer/austrian-*.mjs`), Brussels' own copies:
`brussels-studio.mjs` (the Studio's archives checked against their manifest and placed, cleaned
pages offline), `brussels-scope.mjs` (option B from the lists: the reference roots above, the
leave-out column of `urls-all.tsv` and the same rules for pages outside the sitemap, the two www
redirects `/extra-services/baggage/baggage-calculator` and the refund enquiry form; linked pages
outside the sitemap one level deep once their snapshot is there; own pages on the first root
with a snapshot), `brussels-plan.mjs` (the Studio's 27 batches), `brussels-import.mjs`,
`brussels-nav.mjs`, `brussels-dam.mjs`, `brussels-check.mjs`, `brussels-batch.mjs` (capture only
with `--capture`: the pages come as the Studio's archives). Import, Brussels-specific:

- two-column views: Austrian's solution (lh-com's columns-media selectors in the browser import,
  teaser rows as carousel-cards, `withTeaserColumns`), no new block;
- articles (template `article`) and the article hub with lh-com's insights template
  (article-header, price-bar), slideshows with fleet (carousel-lightbox);
- the phone-number widget (`dcep-hotline-number-display`) as plain content: per contact its
  heading, the number as a tel: link, notes, opening hours, e-mail (`withHotlines`);
- the payment methods iframe (webv4.brusselsairlines.com, a Cloudflare challenge to plain
  requests; not in the snapshots) as plain content once its page is at hand, else a link to the
  page on www (`withPaymentTable`, `withLinkOuts`);
- the help centre (`/contact`): the snapshot's content (accordion-columns), as on Austrian;
- the forms' jQuery UI date picker (`#ui-datepicker-div`, appended to the body, hidden on www)
  left out (it imported as a calendar on the feedback form; ITA's xx/en group-travel and
  emergency-contact documents have the same leak);
- forms: a form row `brussels-<page>` and the success row (www's `:redirect`), preview only;
- the flight search hands off to shop.brusselsairlines.com from Brussels (BRU).

DAM (`brussels-dam.mjs`): PDFs are sized with a one-byte range request like the videos before
they are downloaded (www's 101.5 MB comic PDF read whole inside the page closed the remote
browser twice); the groundwork's AEM sandbox set (14 mp4, 2 .vtt, `Total BD.pdf`) is recorded for
AEM with its measured size, not requested.

## Nav and footer (be/en, be/fr)

`brussels-nav.mjs` from the homepage snapshots, 1:1: `brussel-logo.svg`, the quick actions (Book,
My flights, Check-in, Flight status), the menu (3 top items, 8 columns, 43 links), accessible
travel, help, login, the country and language (the selector's 68 countries; the Austrian tool
also listed the three languages as countries, fixed here). Footer: the three link lists, "Social
media" / "Réseaux sociaux" as a fourth column (Style `badges, in-columns`), the legal row (cookie
settings `#privacy-settings`), the logo row (small logo 130×30, Member of Lufthansa Group,
Star Alliance 147×20). Footer block, additive: a badges section with `in-columns` is one more
link column; hooks `--footer-badge-heading-size`, `--footer-badge-gap`, `--footer-badge-width`,
`--footer-badge-size`, `--footer-divider-color`, `--footer-toggle-line`,
`--footer-logo-home-height` (each default today's value).
