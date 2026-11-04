# TAP alerts bar: spec for the display (lh-tap)

Written 2026-11-04 ~02:30 CET from www.flytap.com read in a browser (pt-pt at 1440 x 900 and 390 x 844, the alerts
pages of all 7 live roots) and lh-com origin/main d6adb884. The content is already in place: lh-tap's Message Center
documents (tenant `tap`) and its CTI sheet, kept in step with www.flytap.com by the steering session's Message Center
sync. What's missing is the display.

## What www.flytap.com shows

**Where:** only on the root homepages (`/pt-pt`, `/en-pt`, ...). Checked live on pt-pt: the homepage has the bar; the
alerts page (`/pt-pt/alertas-e-informacoes`), the help page (`/pt-pt/ajuda`) and a content page (`/pt-pt/stopover`) have
none, although `__NEXT_DATA__` carries `pageProps.alerts` on every page. The bar is rendered client-side (not in the
server HTML). It is the first thing on the page, above the header, full width, in the normal flow (not sticky or
fixed: it scrolls away with the page; the floating header starts below it).

**Layout** (both widths): a white strip (`#fff`, text `#000`), 52 px high (8 px padding top and bottom, a 36 px row).
- 1440 px: content 32 px from the left and right edges (lg:px-8). Left to right: previous chevron button, the pager
  `1/8` (Inter 16/24 semibold), next chevron button (16 x 16 black chevrons, `aria-label` "chevron_left, Previous slide"
  / "chevron_right, Next slide"), 8 px gaps, then the headline (Inter 16/24 semibold, one line, cut with an ellipsis,
  underline on hover) as a link, and on the right the "Ver todos" button.
- 390 px: 16 px side padding; the same order, the headline in 13/19.5 semibold. The pager and button keep their size, so
  only the start of the headline shows ("Manutenção de sistemas" fits; longer ones are cut).
- "Ver todos": www's label `alerts/see-all` per language: pt "Ver todos", en "See all", es "Ver todo", fr "Voir
  tous", de "Alle anzeigen", it "Veda tutto", pl "Zobacz wszystkie" (and `alerts/no-alerts` for the alerts page when
  there is none: pt "De momento não existem alertas.", en "There are currently no alerts.", es "Actualmente no hay
  alertas.", fr "Il n'y a actuellement aucune alerte.", de "Derzeit liegen keine Warnungen vor.", it "Al momento non ci
  sono avvisi.", pl "Obecnie nie ma żadnych alertów."). Pill button, 32 px high, 16 px side
  padding, white background, 1 px border `#65c922` (TAP green), radius 999 px, Inter 15 px regular. It goes to the
  root's alerts page (`/pt-pt/alertas-e-informacoes`), the CTI sheet's `webPath` for the language.
- No icon in the bar (the alerts page shows a 24 px warning triangle `#c3b404` in front of each medium alert). No
  colour change by criticality: all alerts today are `medium`.
- No close button; nothing in cookies or storage. The bar comes back on every page load.

**Behaviour:** a Swiper carousel, one alert per slide, loop, horizontal slide, transition 1200 ms, autoplay every
5000 ms, paused while the mouse is over it (`pauseOnMouseEnter`), not stopped by the arrows or a swipe
(`disableOnInteraction: false`). The arrows go one alert back or on (wrapping around); the pager shows the current
position. Each headline links to the alerts page with the alert's id as the hash:
`/pt-pt/alertas-e-informacoes#scheduled-technical-interventions`; there the alerts are an accordion and each item has
that id. Order: TAP's `weight`, 1 first.

**The second strip (`extraAlert`), not part of the Message Center:** below the alerts bar, pt-pt and en-pt show one
more 52 px strip, background `#ebf2ff`, with a link ("Intermediação de Crédito" / "Credit Intermediation", to
`/miles-and-go/acumular-milhas/cartoes-de-credito` / `/miles-and-go/earn-miles/credit-cards`) and a "Saiba mais" /
"Find out more" pill button to the same page (the border is the button's default, no green). fr-fr has one too
("Droits des passagers" to `/mentions-legales/droits-des-passagers-france`). es-es, de-de, it-it and pl-pl have none.
This is a standing link strip, not an alert: it is not in lh-tap's Message Center (open question for the parent: a small
authored block or fragment per root, or leave it out).

## What lh-tap has now (content)

- Documents `/message-center/<type>/<id>/<lang>` on lh-tap (DA `moved-permanently/lh-tap`), live: 8 alerts, 51
  documents (7 languages x 7, plus the Portuguese ID card alert in pt and en). Type `tech-outage` for the systems
  maintenance notice, `irreg` for the others. Fields as lh-com's: `tenants` `tap`; `criticality` `low` (TAP's
  `medium`); `markets` empty, except `pt` for `portuguese-identity-card`; `touchpoints` web, android-app, ios-app (TAP's
  channel `both`); `from` = TAP's publishDate; `details` = `/message-center/details/<id>/<lang>` (the text of the alert);
  `internal-title` = TAP's content path. Plus one row the index doesn't read yet: **`weight`** (TAP's order, 1 first).
- Index `/message-center/index.json` on main--lh-tap--moved-permanently.aem.live and tap.turnsthe.page (lh-com's
  `helix-query.yaml` index `message-center`, shared by the repoless sites).
- CTI sheet `/message-center/config/cti-pages.json`: one row per language (`tenant` tap, `language`, `webPath`
  `/pt-pt/alertas-e-informacoes`, `/en-pt/alerts-and-informations`, `/es-es/avisos-e-informacion`,
  `/fr-fr/alertes-et-informations`, `/de-de/warnmeldungen-und-informationen`, `/it-it/avvisi-e-informazioni`,
  `/pl-pl/ostrzezenia-i-informacje`). `messageHref` already picks the row of the page's language.

## What lh-com does today (origin/main d6adb884)

- `scripts/message-center.js`: `selectMessages` filters the index by tenant (`siteTenant()`: the brand's
  `messageCenter` in `scripts/brands.js`), market, language (else English), touchpoint `web` and the `from`/`to` window,
  then sorts by rank (irreg high, tech-outage high, irreg low, tech-outage low, promo) and newest `from` first.
  `messageLocale()` drops the country for every site with `siteLanguages`, which includes TAP's `<ll>-<cc>` roots
  (meant for Cargo and Air Dolomiti, which have no markets).
- `scripts/brands.js` `tap`: no `messageCenter` key, so `siteTenant()` is '' and no TAP page shows a message.
- `blocks/flash-teaser`: an authored block in the homepage content (not at the very top), Lufthansa's look (44 px,
  `#f5f5f5`, icon, countdown ring, 7 s rotation, up/down arrows).
- `blocks/message-center`: the accordion of current messages on a CTI page; opens `#<id>`.
- lh-tap's homepages have no flash-teaser block; lh-tap's alerts pages are a static `accordion-columns faq` block
  (the import of 2026-11-03), without ids per item.

## What has to change

1. `scripts/brands.js` `tap`: `messageCenter: 'tap'` (and the comment there that says TAP has no tenant).
2. `scripts/message-center.js` `messageLocale()`: keep the country for sites whose `siteLanguages` name a country (TAP's
   roots: `pt-pt` -> lang pt, country pt). Without it the Portuguese ID card alert (markets `pt`) never shows on
   pt-pt or en-pt. Cargo and Air Dolomiti stay as they are (no country in their languages).
3. Order by `weight`: add `weight` to the `message-center` index in `helix-query.yaml` (select
   `div > div > div:has(#weight) > div:last-child`, `textContent(el)`), parse it in `parseRow`, and for TAP sort by
   weight ascending (1 first; rows without weight after, by the current rank). With the current rank the maintenance
   notice (`tech-outage` low) would come last and the rest by publish date: TAP's order is 1 maintenance, 2 US
   travel advisory, 3 Optiontown, 4 Portuguese ID card (pt only), 5 Ebola, 6 power banks, 7 baggage, 8 phishing.
   After the index change is on main, the lh-tap documents must be published again so their index rows get the
   field (the steering session does that; say in your report when the change is on main).
4. The bar at the very top of the TAP homepages, before the header, in TAP's look and behaviour above: either a TAP
   variant of `flash-teaser` that `scripts.js` puts at the start of the page for brand `tap` on the root homepages
   (no authored block needed, so the importer and the 7 homepages stay as they are), or a block authored first on each
   root homepage. Same carousel rules as www: pager `n/N` between left/right chevrons, 5 s, 1.2 s slide, pause on hover,
   arrows don't stop it, the "Ver todos" pill to the CTI row's `webPath` without hash. Headline links: `webPath#<id>`
   (already what `messageHref` builds). Keep the existing a11y (region, slide roles, live region) and reduced motion.
   Reserve the 52 px before the data arrives, or render nothing when there's no message (no layout shift either way).
5. The alerts page `#<id>` links: lh-tap's alerts pages don't open an item by hash today. Either switch them to the
   `message-center` block (types irreg, tech-outage; it reads the same index and opens `#<id>`; then the page always
   shows the current alerts, in weight order once item 3 is in), or give the static accordion items the ids. That is
   a change to lh-tap's 7 alerts pages (content), for whoever owns TAP's content.
6. Tests: `selectMessages` with tenant `tap`, a `pt-pt` locale (lang pt, country pt) and the PT-only row; weight order;
   the bar's look at 1440 and 390 against www's numbers above.

Release order: the content is live and no page reads it yet. Ship 1 to 4 together (3's index change is backwards
compatible: other sites have no `weight`); then the republish of lh-tap's documents for `weight`; then 5.
Rollback: git revert of the display commit; the content stays (it shows nowhere without the code).
