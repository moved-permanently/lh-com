# lh-b2b: Lufthansa Group for Business (business.lufthansagroup.com)

Edge Delivery site `moved-permanently/lh-b2b` on lh-com's code (repoless), content in DA
`moved-permanently/lh-b2b`, preview `main--lh-b2b--moved-permanently.aem.page`; `/metadata.json`
sets `robots: noindex, nofollow` and `brand: b2b`.

## Look (2026-11-01)

Source: www's `/de/en/homepage` and `/de/de/homepage` (one Bright Data session, cookies rejected,
8-10 s apart; snapshots, probes and screenshots in `content-sites/lh-b2b/snapshots/`, not in git)
and the design system's `/digitalhangar/design-system/releases/v1.38.0/standalone/css/b2b.css`
(`maui-theme-b2b`).

- Brand entry (`scripts/brands.js` `b2b`): name "Lufthansa Group for Business", OneTrust
  `01a08598-d052-711c-9ff4-2def82055cba` (www's data-domain-script), Message Center tenant `b2b`,
  www `business.lufthansagroup.com`, portal `B2BNEO` (meta X-Portal).
- Icons (`scripts/brand-icons.js`): www's `/etc/designs/b2b-neo/favicon.ico` (copy in the code); www
  links no manifest.
- Theme `styles/themes/b2b.css`: Lufthansa's palette (the same values as lh-com) with the primary
  button deep blue `#05164d`, white text, hover `#000245`; buttonsecondary (`accent`) `#4d7b93`;
  links `#52627c` / `#414e63`; h1 LufthansaHead 200 uppercase (www's b2b.css maps weight 100 to
  `LufthansaHeadWeb-Thin`: the theme adds that face; www.lufthansa.com serves the file with
  `access-control-allow-origin: *`, business.lufthansagroup.com without CORS); h2, h3 LufthansaHead
  400; copy LufthansaText 300 18/24; sizes h1 32/42, h2 28/32, h3 24/28, teaser titles 18 (390 /
  1440 px); the header a floating white bar (15 px inset, radius 12 px, shadow
  `rgba(0,0,0,.1) 0 2px 8px`, 23/24 px padding, 40 px items); the footer on
  `linear-gradient(135deg, #2254bb 0%, #021959 100%)` with white text.
- Shared tokens added for it, each defaulting to lh-com's value: `--heading-large-weight`,
  `--heading-large-transform`, `--body-font-weight`, `--button-accent-color`,
  `--button-accent-hover` (styles/styles.css); `--header-bar-inset`, `--header-bar-radius`,
  `--header-bar-shadow`, `--header-bar-padding`, `--nav-quick-list-padding`,
  `--nav-quick-link-padding` (blocks/header/header.css); `--footer-surface-image`
  (blocks/footer/footer.css).

Open for the nav and footer documents: www's header menu (Login, News, Programs, Travel Solutions,
About Us with drop-downs), the boxed search button to `/<root>/lhg4b-search/lhg4b-search-prelogin`,
the logo without a link, one row with a burger below 1025 px; the footer's layout (logo and the
tagline "Best choice for your business" at 40 px, then copyright, legal links, LinkedIn in a circle,
"DE | EN" with the globe); the cookie banner's links (www's banner was rejected before it was read).
Done on 2026-11-02 (below): the header options and the footer's brand row; the banner's links are
B2B's Data protection page (its cookie categories) and Imprint.

## Import (2026-11-02)

Inputs: the Studio's lists (b2b-lists-001: groundwork.md, decisions in 10a) and seven snapshot
archives (b2b-snapshots-001 to -007, sha256 checked, placed by `b2b-studio.mjs`), in
`content-sites/lh-b2b/` (not in git).

- `b2b-scope.mjs`: 187 roots (de/en, de/de own; 185 market roots; us/de, ca/de, mx/de answer 500),
  674 documents: 571 language documents (de/en 259, de/de 312), 86 rest-of-world documents from
  `xx/<ll>` (`markets`: every root of the language but de and the roots with an own page; the de
  document of such a path serves de only), 15 own documents of ch/en and at/de (archive 007), the
  own homepages us/en and ca/en; mx/en and al/* are served from the reference (decision 3). Paths
  Edge Delivery can't name ("--", capitals, "_", a "-" at a segment's end) get the name `docName`
  gives them: `content-sites/lh-b2b/runs/redirects.tsv` (www path, document path).
- `b2b-plan.mjs`: the Studio's 16 batches; archive 007's own documents join batch 16.
- `b2b-import.mjs`: lh-com's info template for every page; B2B's components get classes only this
  importer gives, taken by B2B selectors in `page-templates.json` (icon modules: cards-icon-text
  `stacked`; stage: hero-card-overlay; inspirational stage: hero-campaign right); the author quote
  as its text and name (no lh-com block; a quote block is proposed, not built); the phone list
  (`dcep-ppb-hotlinebox`) as plain content; Cloudflare's obfuscated e-mail addresses decoded; the
  pre-login search as the search-results block (the root's search index); the route network map
  (`lhg-network.com`) as an embed (decision 6); the forms with lh-forms ids `b2b-<page>`; the
  metadata: the language version's nav and footer, `markets`, www's noindex; five SVG images Edge
  Delivery refuses (409) as PNG renderings in DA (`/media-da/b2b/`).
- `b2b-nav.mjs`: nav and footer of de/en and de/de from www's header JSON and footer, with the
  brand's header options (`scripts/brands.js` b2b header: the menu in the bar, the logo without a
  link, the boxed search, no country button) and the footer's brand row.
- `b2b-dam.mjs`: the linked PDFs, small videos and posters as copies in DA; the mp4 over 36 MiB
  (the groundwork's media.tsv) listed for AEM per batch (`runs/batch-NN-aem.tsv`).
- `b2b-batch.mjs`: import, links (aliases for renamed documents:
  `tools/importer/sites/lh-b2b-aliases.json`), DAM, upload and preview per batch.

Needs outside this repo's B2B files: the search indexes of de/en and de/de (`helix-query.yaml`);
lh-forms rows for `b2b-businesstogo` and `b2b-partner-plus-benefit-raffle` (both languages, origin
`main--lh-b2b--moved-permanently.aem.page`, later `b2b.turnsthe.page`); the redirects sheet from
`runs/redirects.tsv`; the lh-edge site entry for `b2b.turnsthe.page`.
