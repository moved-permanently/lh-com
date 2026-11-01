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
