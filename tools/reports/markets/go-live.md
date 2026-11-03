# Go-live of the 190 pilot roots on lufthansa.turnsthe.page

Prepared 2026-11-02 (brief 256); nothing switched, nothing published. The rollout (rollout.md,
batches 1 to 10) gave every en and de root of www a row: 188 roots of batches 1 to 10 and ch/en,
ch/de, all `pilot` (documents from their language version, de/en or de/de, plus their own
homepage, nav, footer, own pages and local versions on preview). lufthansa-edge.turnsthe.page
serves all of them; the main host serves ch only (`PILOT_COUNTRIES_BY_HOST`).

Everything below comes from the repository, DA's upload state and lh-com's own origins
(`main--lh-com--moved-permanently.aem.page` / `.aem.live`); no request to www.lufthansa.com.

**Brief 264 (2026-11-02)**: the four form pages' forms on lh-forms (three; mk/en's has no fields on
www), az/en's Allegris page under www's canonical, hreflang on the four live roots behind the same
switch, and French as wave 11 (fr/fr the language version, 13 market roots; below).

## The switch

One setting, `tools/markets/locale-data.json` `liveWaves` (e2439f0, deployed 10:41 UTC with
`[]`): the pilot rows of the listed waves become `live` in `scripts/locale-table.js` (a wave is a
rollout batch by its number; ch is `"ch"`). `[]`: every row as today, the table byte for byte the
same (test/locale-table.test.mjs, test/go-live.test.mjs).

**On, for a wave** (e.g. wave 1 after ch):

1. `tools/markets/locale-data.json`: `"liveWaves": ["ch", 1]` (cumulative: every wave that is live).
2. `node tools/markets/build-locale-table.mjs` (it says how many rows are live: 4 + the wave's).
3. `node --max-old-space-size=512 --test test/locale-table.test.mjs test/go-live.test.mjs` (the
   table is the generated one and follows the setting); the full suites pass with any setting:
   lh-edge's tests load the table as with `liveWaves: []` (test/cloudflare-workers-shim.mjs, so
   they keep checking the pilot answers), the site's ch test follows the setting (checked with
   `["ch", 1]`: every lh-edge and site test passes).
4. Commit both files, push to main: the site code goes out with the push, lh-edge with its deploy
   workflow (scripts/locale-table.js is in its paths), the stored sitemap index with the
   sitemap-index workflow (a minute or two later; until then lh-edge builds the index per request).

**Off** (a wave or all): `git revert` of that commit (or the wave's number taken out, steps 2 to 4).
The main host then answers the wave's paths from the origin again (as today).

What the code does with a live market root (e2439f0; inert while `liveWaves` is `[]`):

- lh-edge serves live rows on every lh-com host (src/markets.js servedMarketRoots: "live ones
  everywhere"): the main host, lufthansa-edge (no change there: it serves them already) and the
  alias host lufthansa-cn.turnsthe.page (an alias of the main host). Brand hosts: unchanged (their
  own tables).
- The main host's front door (src/front-door.js) sends the pages and sitemap files of the countries
  of live market roots to the market route, as it did for ch only (the fixed `/ch/.+` rule is now
  "the countries of live market roots and of the host's PILOT_COUNTRIES_BY_HOST").
- lh-edge's search (src/search.js) and its search data (build-search-data.mjs) keep the roots with
  documents of their own (LIVE_ROOTS: the four): a live market root searches its language version's
  data, as a pilot root does on lufthansa-edge; llms lists a root once; the language-switch endpoint
  (src/changelocale.js) and the site's language switch map a live market root's page through its
  language version's row of `/data/locale-map.json`; the sdui pages take the language version.
- The site (scripts/locale.js): a live row is "migrated" (isMigratedLocale): its homepage and
  counterpart links are local, not www's; the country dialog keeps its list of the four, plus the
  page's own country roots on a live market root's page ("Other countries" goes to the local
  counterpart of a live root).

**Rehearsal** (local runtime, `liveWaves: [1]`, the main host's name, the preview origin; not
deployed, the table restored): `/ae/en/homepage` 200, `/ae/en/baggage` and `/ae/de/gepaeck` 200
(market), `/ae` and `/ae/en` 302 to the homepages, `/sitemap/sitemap_lh_ae_en.xml` 200, `/ae/llms.txt`
200, the sitemap index lists ae, ae's pages carry the main host's canonical and 25 hreflang
alternates (wave 1's 19, the four live roots, ch's 2); `/hu/en/baggage` (wave 3) 404, `/de/en` and
`/ch` pages as before.

**The deploy of e2439f0** (off): the nine hosts 0 differences before against after (b2b's committed
baseline differed in its de/de and at/de search indexes before the deploy: its content), lufthansa.com's
19 comparison pages 19 of 19 equal, the main host's `/ch/...` market route and `/ae/...` pass-through
as before.

## What changes on lufthansa.turnsthe.page when a wave goes live

- **Entry addresses**: `/<cc>` and `/<cc>/` 302 to the country's first root's homepage (the
  table's order: de first where both, as `/ae` → `/ae/de/homepage` on lufthansa-edge today; www's
  own market list where src/entry.js MARKETS has one), `/<cc>/<ll>` to its homepage; today they go to
  `https://www.lufthansa.com/<cc>`. The language choice of `/apps/selectlanguage` and g4t's
  redirects offer the wave's roots.
- **Pages**: `/<cc>/<ll>/<path>` answered by the market route: the root's own document (homepage,
  own pages, local versions, nav, footer: published), else the language version's page where its
  `markets` metadata allows the country, links made the root's, canonical and og:url on the main
  host; today these paths pass through to the origin (404 unless published, as `/us/en/ccpa`).
- **Sitemaps**: the index `/sitemap/sitemap_lh.xml(.gz)` lists each live root's file
  (`/sitemap/sitemap_lh_<cc>_<ll>.xml(.gz)`, from the language index and the root's own pages);
  the stored index is rebuilt by its workflow for the new table.
- **hreflang**: the market roots' pages (ch's and the wave's) list every root the host serves (25
  with wave 1, 194 at the end); the four live roots' pages (de/en, de/de, at/de, gb/en) carry none
  today and, from the first wave on, list their language versions, own roots and the live market
  roots that have the page (src/live-alternates.js, dcd4708: lh-edge adds them on the pass-through;
  with `liveWaves: []` the answer is untouched). Rehearsal with wave 1: 23 alternates on
  `/de/en/baggage`, `/de/de/gepaeck`, `/at/de/gepaeck`, `/gb/en/baggage` and `/de/en/homepage` (the
  four and wave 1's 19), none on nav and fragments. With wave "ch" alone they list ch/en and ch/de.
  The four roots' sitemap files (Edge Delivery's) keep their alternates among themselves.
- **The country and language dialog**: the four roots; on a wave's page also its country's roots
  (ae/de, ae/en); "Other countries" and authored country links go to the local counterpart of a live
  root instead of www.
- **The language switch** (dialog links, `/service/.../changelocale`): from and to a live market
  root through its language version's page (`/ae/en/baggage` ↔ `/ae/de/gepaeck` ↔ `/de/en/baggage`).
- **Search**: `/<cc>/<ll>/search-index.json` the language version's rows the root may show plus its
  own pages; the search API for the market headers (site AE, language en) answers from de/en's
  data, as for every pilot root today.
- **llms**: `/<cc>/llms.txt` and `/<cc>/<ll>/llms.txt` list the root's pages.
- **Redirects**: the redirect sheet's rows of a root answer on the market route (a market path whose
  language version redirects follows into the root); the six rows on preview only (pt and us) come
  with `/redirects.json` (wave 9).
- **The alias host** lufthansa-cn.turnsthe.page serves the live roots too; with wave 7 (cn/en,
  cn/de) its `/` goes to `/cn/en/homepage` (ALIAS_HOME_ROOT), as www's China host.
- **The 19 comparison pages**: `/eg/en/discover-lufthansa/carbon-offsetting1/carbon-offsetting/faq-saf`
  is eg/en's (wave 2): from wave 2 on it is answered by the market route (its own document, links
  made the root's, alternates): expect it to differ from the earlier captures; the others are the
  four live roots' and stay equal.

## Release order (checked both ways)

**Publish first, then switch** (recommended, per wave, within minutes):
- Before the switch the main host passes the wave's paths to the origin: a published homepage, nav,
  footer or own page is reachable there by its URL (as `/us/en/ccpa`, `/ch/...` before ch was served),
  unprocessed: its nav and page links point into the root, whose other pages 404 until the switch.
  Nothing links to these addresses on the main host (the dialog and every link go to www until the
  wave is live), so the half-finished state is reachable only by typing the URL; keep the time
  between publish and switch short.
- After the switch every page of the wave answers from the market route with its own documents.

**Switch first, then publish** (not recommended):
- The wave's roots answer at once, from the language version: the homepage of `/ae/en` would be de/en's
  (Germany's offers, Frankfurt in the fare teasers under a page that names the United Arab
  Emirates), own pages and local versions 404, nav and footer the language version's with links made
  the root's; consistent links, but wrong content until the publish.
- No way to hide the published documents on the main host before the switch without a change to the
  main host today (the pass-through answers `/us/en/ccpa`, `/us/en/dnsmpi` and three eg/en pages that
  are live already).

Per wave:
1. Publish the wave's list (`tools/reports/markets/publish-wave-NN.txt`), check every line answers
   200 on `main--lh-com--moved-permanently.aem.live` (`.plain.html`).
2. The switch on (above): commit, push, the lh-edge deploy, the sitemap-index workflow.
3. The checks below.

Order of the waves: ch first (wave 0: its documents are live already, the switch makes it live for
the site: dialog, language switch, entry from www links), then 1 to 10. Wave 9 carries the redirects
sheet (it also brings wave 10's four us rows; their sources redirect to us pages that 404 on the main
host until wave 10, unlinked). Wave 7 turns the China host on for cn (publish cn/en's and cn/de's
documents in that wave, as noted in rollout.md "The China host").

## Waves

| Wave | Roots | To publish | of which homepages, navs, footers / own pages and local versions | Already live | Left out |
| --- | --- | --- | --- | --- | --- |
| 00 (market-neutral pages) | – (xx/en, xx/de: every market root that shows them) | 109 | – / 109 | – | 35 (tools/reports/markets/neutral-pages.md) |
| 0 (ch) | 2 | 0 | – | 16 (ch's documents) | – |
| 1 | 19 | 71 | 57 / 14 | – | – |
| 2 | 19 | 70 | 57 / 13 | 3 (eg/en carbon-offsetting) | – |
| 3 | 20 | 72 | 60 / 12 | – | – |
| 4 | 20 | 77 | 60 / 17 | – | 1 |
| 5 | 20 | 63 | 60 / 3 | – | – |
| 6 | 22 | 80 | 66 / 14 | – | – |
| 7 | 20 | 77 | 60 / 17 | – | – |
| 8 | 20 | 78 | 60 / 18 | – | – |
| 9 | 20 | 72 | 60 / 11, and `/redirects.json` | – | – |
| 10 | 8 | 38 | 24 / 14 | 2 (us/en ccpa, dnsmpi) | – |
| **1–10** | **190** | **698** (697 documents and the redirects sheet) | | 21 | 1 |
| 11 (French) | 15 (xx/fr and 14 market roots) | 329 | xx/fr 280 (its homepage, nav, footer, 270 pages and 7 form confirmations) / 14 × 3 and 7 own pages | – | 1 |
| 12 (Spanish) | 14 (xx/es and 13 market roots) | 320 | xx/es 274 (its homepage, nav, footer, 265 pages and 6 form confirmations) / 13 × 3 and 7 own pages | – | 1 |

The lists hold every document of the wave's roots that is on preview and not live yet, homepages,
navs and footers first per root. Since brief 264 they also hold:
- **the market roots' forms, now on lh-forms** (26ed4b1, deployed 12:15 UTC; ids by page name as
  the other lh-com forms, recipients from FORM_CONFIG: its default unless the secret names the ids):
  `/bg/en/local-page/invoice-request-bg` (wave 1, `invoice-request-bg`), `/il/en/cancellation-refund-webform`
  (3, `cancellation-refund-webform`: www's five uploads, PDF, JPEG or PNG, 8,000,000 bytes each, 18.5
  MB in all; the importer had dropped them, www's older file inputs are now read),
  `/mk/de/formular-notfallkontakt` (4, `formular-notfallkontakt`). Their documents got the form id
  row (il/en also the file row) and were previewed again. You test each once on the main host
  after its wave is live.
- **az/en's Allegris page**: www's `/az/en/prepare-for-your-trip/travel-classes/fice` names
  `/az/en/discover-lufthansa/allegris` as canonical and the redirect sheet sends fice there, where
  lh-com had no document (de/en has no Allegris landing page either): the fice capture is now the
  document `/az/en/discover-lufthansa/allegris` (az/en's own; wave 1), fice stays the redirect row.

Left out:
- **`/mk/en/support/refund`** (wave 4): www's form there has no fields (a submit button without a
  label, 2026-10-29 capture), so there is no form for lh-forms; its document is the same.
- **the 36 demo documents** (5 November): none is in a wave (they are de/en, de/de, at/de, gb/en and
  /gc documents).

**Checks after each wave** (against fresh runs before it, the committed baselines updated after):
- the nine-host smoke: lufthansa and lufthansa-cn differ in the rows of ch (its pages' hreflang
  alternates, its sitemap files) and the sitemap index (wave 2 on: the eg page row too); lufthansa-edge,
  the brand hosts and b2b: 0 differences;
- lufthansa.com's 19 comparison pages: equal, except the eg/en page from wave 2 on;
- the route check on the main host for two roots of the wave (`node tools/markets/check-market-route.mjs
  --base https://lufthansa.turnsthe.page --root <cc>/<ll> --links /<cc>/<ll>/homepage …`): 200 with the
  root's canonical, the homepage's links 200;
- `/<cc>` and `/<cc>/<ll>` redirect to the root's homepage, the sitemap index lists the wave's files,
  `/<cc>/llms.txt` answers, the dialog of a wave page lists its country's roots.

**Rollback of a wave**: the lh-edge revert first (the commit that put the wave into `liveWaves`:
`git revert`, push, the deploy), then, if the documents should go too, unpublish the wave's list
(the same file: a DELETE on the admin API's live endpoint per line; the redirects sheet: republish
the previous version rather than unpublish it). Unpublished documents also go from lufthansa-edge,
which then shows the language version's pages for them, as before the publish.

## Per-root content sweep

From the local-version comparisons (rollout-batchN-compare.json), DA's upload state and the
preview and live origins (2026-11-02 11:00 UTC). "Own pages": the root's documents besides homepage,
nav and footer; "Local versions": root documents made where www's page differs from the language
version (flights, airport information, additional services).

| Root | Wave | Own pages | Local versions | Already live | Left out | Open |
| --- | --- | --- | --- | --- | --- | --- |
| ch/de | ch | 5: companion-special-first-class, companion-special-premium-economy-class, event/exklusives-event-angebot-dxb-1, fluege-vo-zurich-nach-china, … | fluege | 9 | – | – |
| ch/en | ch | 4: companion-special-first-class, companion-special-premium-economy-class, local-page/experience-america, smart-bags | – | 7 | – | – |
| ae/en | 1 | 2: local-page/dxb-50th-anniversary-promotion, longed-for-destinations-at-a-glance | – | – | – | – |
| al/de | 1 | 1: local-page/reply-to-check/yes | – | – | – | – |
| at/en | 1 | 3: book-and-manage/offers-and-destination/europe-offers1, book-and-manage/offers-and-destination/weltweite-angebote1, oneway-fares | – | – | – | – |
| au/en | 1 | 2: local-page/au-multi-city, local-page/star-alliance-au | – | – | – | – |
| az/de | 1 | 2: archived-contents/overview, articles/tags/destinations | – | – | – | – |
| az/en | 1 | 1: discover-lufthansa/allegris (the fice capture; fice a redirect row) | – | – | – | – |
| bg/en | 1 | 2: invoice-request, local-page/invoice-request-bg (form on lh-forms) | – | – | – | – |
| bh/en | 1 | 1: local-page/bahrain-airport-new-terminal | – | – | – | – |
| dk/en | 2 | 1: yes | – | – | – | – |
| eg/en | 2 | 13: discover-lufthansa/carbon-offsetting/carbon-offsetting/climate-protection-projects, discover-lufthansa/carbon-offsetting/carbon-offsetting/environmental-cost-surcharge, discover-lufthansa/carbon-offsetting/carbon-offsetting/faq-saf, discover-lufthansa/carbon-offsetting/carbon-offsetting/saf, … | – | 3 | – | – |
| er/de | 2 | – | – | – | – | currency null (www shows none) |
| fi/en | 2 | 2: book-and-manage/offers-and-destination/worldwide-offers1, worldwide-offers | – | – | – | – |
| il/en | 3 | 4: cancellation-refund-webform (form on lh-forms), cancellation-rights, passenger-rights-israel, updated-cancellation-and-change-of-tickets | – | – | – | – |
| in/en | 3 | 5: local-page/new-destinations, local-page/new-destinations-india, local-page/raffle-north-america-in/terms-and-conditions-in, local-page/upi, … | – | – | – | – |
| ir/en | 3 | 2: local-page/new-payment-option, tehran-frankfurt-restart | – | – | – | – |
| jo/en | 3 | 1: local-page/amm-relaunch-offer | – | – | – | – |
| kw/en | 4 | 1: local-page/jarallah | – | – | – | – |
| lb/en | 4 | – | flights | – | – | – |
| mk/de | 4 | 12: articles/back-up-explore-the-worl-manual, articles/explore-flying/time-travel-ki-aviation1, articles/explore-the-world/be-picky-frankfurt-insider-tips1, articles/explore-the-world/what-i-learned-living-in-rome1, … | – | – | – | – |
| mk/en | 4 | 4: articles/back-up-explore-the-world-manual, articles/highlights/winter-destinations1, business-services/for-corporate-customers/meetings-and-events/exclusive-event-offer-dubai, support/refund | – | – | support/refund (www's form has no fields) | – |
| my/en | 5 | 1: local-page/kul-promo-code-oct26 | – | – | – | – |
| no/en | 5 | 1: worldwide-offers | – | – | – | – |
| nz/en | 5 | 1: local-page/nz-multi-city | – | – | – | – |
| sa/en | 6 | 2: local-page/companion-special-riyadh-munich-2025, offers-to-europe1 | – | – | – | – |
| se/en | 6 | 4: discoverymode2023, yes, yes2, yes3 | – | – | – | – |
| sg/en | 6 | 3: local-page/changi-terminal-2, local-page/corporate-offer-sg, local-page/jewel | – | – | – | – |
| th/en | 6 | 2: local-page/promocode-th-europe3000, local-page/promptpay | – | – | – | – |
| tr/en | 6 | 3: flights-ankara-munich, istanbul-airport-transfer, local-page/natl-campaign | – | – | – | – |
| be/en | 7 | 2: early-bird-september2022, first-class-companion | – | – | – | – |
| ca/de | 7 | – | – | – | – | homeAirport null (www shows none); currency null (www shows none) |
| ca/en | 7 | 1: local-page/lufthansa-student-fares | – | – | – | homeAirport null (www shows none); currency null (www shows none) |
| cn/de | 7 | – | – | – | – | the China host serves cn once this wave is live (its / to /cn/en/homepage) |
| cn/en | 7 | 14: local-page/1212-specials, local-page/china-euro-cup-2024, local-page/china-euro-cup-2024/european-championship-2024-player-videos-anton, local-page/china-euro-cup-2024/european-championship-2024-player-videos-beier, … | – | – | – | the China host serves cn once this wave is live (its / to /cn/en/homepage) |
| es/en | 8 | 1: lgtbiq | – | – | – | – |
| fr/en | 8 | 2: winter-sun-in-asia, yes | – | – | – | – |
| hk/en | 8 | 12: local-page/apac-sales-and-station-leaderhip-meeting-hkg-oct23, local-page/hongkong-euro-cup-2024, local-page/hongkong-euro-cup-2024/european-championship-2024-player-videos-anton, local-page/hongkong-euro-cup-2024/european-championship-2024-player-videos-beier, … | – | – | – | – |
| it/de | 8 | – | fluege | – | – | – |
| it/en | 8 | – | flights | – | – | – |
| jp/en | 8 | – | flights | – | – | – |
| lu/en | 9 | 1: local-page/companion-special-oct21 | – | – | – | – |
| pl/de | 9 | – | fluege | – | – | – |
| pl/en | 9 | – | flights | – | – | – |
| pt/de | 9 | – | fluege | – | – | – |
| pt/en | 9 | 5: business-class-offers, faq-data-security, premium-economy-offers, sepa-terms-and-conditions, … | flights | – | – | redirect row lufthansa-first-class-hotlines on preview only (in /redirects.json, wave 9); redirect row common/lhid-terms-conditions_msm_moved on preview only (in /redirects.json, wave 9) |
| ru/en | 9 | – | flights | – | – | – |
| us/de | 10 | – | – | – | – | homeAirport null (www shows none); redirect row flynet-kurzstrecke on preview only (in /redirects.json, wave 9); redirect row flynet-langstrecke on preview only (in /redirects.json, wave 9) |
| us/en | 10 | 16: baggage-and-other-fees, ccpa, companion, current-fees, … | – | 2 | – | homeAirport null (www shows none); redirect row customer_service_plan on preview only (in /redirects.json, wave 9); redirect row local-page/terms---conditions-for-lufthansa-s--germany-jersey-sweepstakes-- on preview only (in /redirects.json, wave 9) |

The other 141 roots hold their homepage, nav and footer only:

- wave 1 (11): ae/de, al/en, am/de, am/en, au/de, ba/de, ba/en, bg/de, bh/de, cd/de, cd/en
- wave 2 (15): cz/de, cz/en, dk/de, ee/de, ee/en, eg/de, er/en, et/de, et/en, fi/de, gb/de, ge/de, ge/en, hr/de, hr/en
- wave 3 (16): hu/de, hu/en, id/de, id/en, ie/de, ie/en, il/de, in/de, iq/de, iq/en, ir/de, is/de, is/en, jo/de, ke/de, ke/en
- wave 4 (16): kw/de, lb/de, lt/de, lt/en, lv/de, lv/en, ly/de, ly/en, md/de, md/en, mt/de, mt/en, mu/de, mu/en, mv/de, mv/en
- wave 5 (17): my/de, ng/de, ng/en, nl/de, nl/en, no/de, nz/de, om/de, om/en, ph/de, ph/en, qa/de, qa/en, ro/de, ro/en, rs/de, rs/en
- wave 6 (17): sa/de, sd/de, sd/en, se/de, sg/de, si/de, si/en, sk/de, sk/en, th/de, tr/de, ua/de, ua/en, vn/de, vn/en, za/de, za/en
- wave 7 (15): ao/de, ao/en, ar/de, ar/en, be/de, br/de, br/en, by/de, by/en, cl/de, cl/en, co/de, co/en, cr/de, cr/en
- wave 8 (14): cy/de, cy/en, dz/de, dz/en, ec/de, ec/en, es/de, fr/de, gq/de, gq/en, gr/de, gr/en, hk/de, jp/de
- wave 9 (14): kr/de, kr/en, kz/de, kz/en, lu/de, ma/de, ma/en, mx/de, mx/en, pa/de, pa/en, pe/de, pe/en, ru/de
- wave 10 (6): tn/de, tn/en, tw/de, tw/en, ve/de, ve/en

Open per root besides the table: timeZone and shopLang are null for every pilot root (www's
homepage has neither: the site's defaults, Europe/Berlin and en-GB); the `unverified` fields of each
row in locale-data.json list what www did not show.

## The market-neutral pages (wave 00, brief 267; before wave 1)

www has 196 pages under `xx/en` (101) and `xx/de` (95) whose page group has no `de/en` or `de/de`
page in the scope: the 25 aircraft type pages, the Munich stopover partners, a few articles, hubs,
terms and service pages. Most market roots show them (194 to 240 of 240 per group), so a wave's
roots would answer them 404 without this. **109 of them** are documents of lh-com's neutral
versions now (`NEUTRAL_VERSIONS` in tools/markets/locale-data.json: en xx/en, de xx/de, no rows),
imported from captures of 2026-11-02, uploaded and previewed (not published); the list, the
`markets` values, what was left out and the global-tree question: tools/reports/markets/neutral-pages.md.

**How they are served** (1928ee0, deployed 20:27 UTC): lh-edge's market route answers a market root's
path its language version has no page for from the neutral document of the path, when the origin
has it and its `markets` allows the country (102 have no row: every market root of the language
shows them on www; 7 have a list). de/en and de/de themselves never answer them (www's de/<ll>
roots don't show them either), the `/xx/<ll>/...` URLs pass through as www's own URLs. Links in
them go to the root's pages where the neutral or language version has the document.
Rehearsal on the local runtime against preview: ch/en 1,024 of 1,058 www URLs 200 (33 404), ae/en
1,018 of 1,062 (batch 1: 960), hu/de 1,012 of 1,047, ch/de 1,017 of 1,054; `/de/en/319` 404.

**Wave 00 does not need the switch**: publish `publish-wave-00.txt` (109 lines) before wave 1 (with
or before ch). From the publish on, every host that serves a market root answers these pages for
it: lufthansa-edge (all pilot roots), **the main host for ch** (its pilot rows: `/ch/en/319`,
`/ch/de/book-and-manage/stopover/rosewood` … answer 200 instead of 404), and each later wave's roots
the moment they go live; the main host also answers the `/xx/<ll>/...` URLs themselves (from the
origin, as www's URLs; nothing links to them). Checks after the publish: the list's lines 200 on
`main--lh-com--moved-permanently.aem.live`; `/ch/en/319` and `/ch/de/319` 200 on the main host
with the root's canonical; the route check for ch/en on lufthansa-edge. Rollback: unpublish the
list (the route then answers 404 as before; the code alone changes nothing), or `git revert
1928ee0`.

**Not served** (35): 34 xx URLs that are no pages of www's xx roots (their long AEM URL answers
404, www sends the short one to the same path under de/<ll> from every exit; lh-com has none of
those de/<ll> pages: adding them to the scope as de/en and de/de documents with `markets` is your
decision) and one app page (`/xx/en/support/airport-assistant`); plus 52 left out of the 196 before
the capture (AEM configuration, login, registration, profile and Travel ID app pages,
confirmations), as for every root. No new redirect rows.

## The 34 de/<ll> pages behind www's xx alias URLs (brief 278)

The 34 xx URLs of brief 267 that www sends to the same path under de/en or de/de are **no pages of
www's de roots either** (checked 2026-11-03 through the Bright Data session, short and long URLs):
- **24 answer 404 on www** (short and long URL): the Art Basel, Paris 2024, European Championship,
  Yes-to-Europe raffle, tracksuit and Team Yes raffle articles and pages, de/de's
  `winter-destinations-backup` and `on-the-scene-paris-olympic-games`. www's sitemaps still list
  their xx alternates; there is no page to import, and a market root answering 404 for them is
  what www answers. No document, no publish list.
- **10 are www's 301 aliases**: the five travel guides in en and de
  (`/de/<ll>/articles/tags/<city>-travel-guide` to `/de/<ll>/articles/tags/<city>`, cape-town,
  chicago, munich, san-francisco, shanghai): lh-com has the ten tag pages. **Redirect rows for
  you** (the redirect sheet), so the main host and every market root (the market route follows the
  language version's redirects into the root) answer as www:
  `/de/en/articles/tags/<city>-travel-guide` -> `/de/en/articles/tags/<city>` and the same for
  de/de; www's xx URLs (`/xx/en/articles/tags/<city>-travel-guide`, `/xx/de/...`) go to the same
  targets if you want them too.
- **What changes on the main host**: nothing until the rows are on the published sheet; then
  `/de/en/articles/tags/cape-town-travel-guide` and the nine others answer 301 to the tag page
  instead of 404, on the main host and (after their waves) on the market roots.

## Wave 11: French (prepared 2026-11-02, brief 264; rebuilt 2026-11-03, brief 281; not switched)

**xx/fr is French's language version** (brief 281, your decision: www's `xx/fr` has pages since
2026-11-03, so French follows Spanish's rule) and ar/fr be/fr ca/fr ch/fr cl/fr co/fr cr/fr dz/fr
**fr/fr** gq/fr lu/fr ma/fr tn/fr us/fr its 14 market roots, all batch 11, `pilot`. xx/fr is a row of
a root that is only an alternate in www's sitemaps (hreflang `fr`); its label "Autres pays |
Français" is the replica's (www's selector on xx/fr shows the placeholder "XX | FR"; as xx/es's
"Otros paises | Español"). The query indexes `search-xx-fr`, `market-model-xx-fr`, `market-llms-xx-fr`
were in helix-query.yaml already (they fill on publish).

xx/fr's pages: www's 351 xx/fr URLs of the sitemaps of 2026-10-25 (only alternates, as xx/es's; www's
fresh sitemap fetch answered 403 on 2026-11-03), 275 in scope by their de/en counterpart's template
as fr/fr's, captured through the long AEM URLs on 2026-11-03 (one session at a time, 04:58 to 07:23
UTC, no block); 7 answer 404 on www: `articles/tags/toronto`, `lufthansa-city/menu-card` (fr/fr has
neither) and the five alias URLs `business-class`, `digital-travel-companion`, `flynet`,
`freigepaeck-regeln`, `lounges`, imported from their real pages under the alias paths (as xx/es's).
Imported by template, nav and footer from its homepage, its forms (their lh-forms ids from the page
name) and the **seven confirmation pages** they go to (captured, imported); 280 documents.

**fr/fr is a market root now**: it shows xx/fr's documents except its **9 own** (homepage, nav and
footer from xx/fr's with its label, and `asia-specials`, `toutes-les-couleurs-a-bord`, `yes`: no xx/fr
page; `support/support`: fr/fr has www's new help centre, xx/fr the old "Aide et Contacts" page;
`rechnungsbeleg`: fr/fr's own receipt and VAT text; `hotel-offers`: fr/fr's extra Miles section).
**275 of today's fr/fr documents are unnecessary** (`fr-fr-unnecessary.tsv`: 240 the same as xx/fr's,
27 that differ only in market parameters of links, texts only xx/fr has, layout rows or a link to the
same page's other path, the 7 confirmations, www's second ammunition form); they stay in Document
Authoring (not deleted) and are not in the list, so they are never published: the market route
serves a root's own document when the origin (aem.live) has one. Pages of fr/fr then show xx/fr's
links with `country=XX` (cockpit deeplinks, fix-price upgrades), as every market root shows its
version's.

`publish-wave-11.txt`: **329 documents** (xx/fr 280: homepage, nav, footer first, then its pages; then
per market root its homepage, nav and footer, fr/fr's six and dz/fr's one own pages). All 329
uploaded and previewed on 2026-11-03 (329 of 329 answer 200).

**Brief 268 for wave 11**: the **seven confirmation pages** fr/fr's forms go to on www (each form's
redirect target: the contact form confirmation of the feedback, group travel and emergency contact
forms, and those of the animal, sports baggage, firearm, assistance and passenger receipt forms),
captured through the long AEM URLs on 2026-11-02, imported and previewed; the forms' documents link
them (a submit lands on our page; the market roots' copies on the root's: confirmations are
language documents); www's passenger receipt confirmation is headed in English on its French page,
as here. fr/fr's feedback page (the feedback modules) shows its own success message, now in French.
The **French texts** of the form and search blocks and the SWISS sub-site's language list label
(4f10aaf, 56f4eb4; test/french-labels.test.mjs) go out with the code, before the wave: French pages
of the brand sites show them where they showed the English fallback (Austrian fr/fr, Brussels be/fr,
SWISS ch/fr: the file drop zone's "ou", "Fichiers téléchargés", the stepper buttons, Brussels' search
page). The other blocks' and scripts' texts in French as well (brief 278, under wave 12's labels):
before/after on 92 French and Spanish pages of lh-com and the brand sites, 51 changed, each an
English fallback (the fallback consent banner, lounge finder, check-in deadlines, booking lookup,
destination offer, carousel, blog), nothing French or Spanish replaced.

**Release order for wave 11** (it differs from the en and de waves: the language version is new):
1. Publish xx/fr's 280 lines first, then **wait until its indexes are filled**:
   `main--lh-com--moved-permanently.aem.live/xx/fr/search-index.json` and `/market-model/xx-fr.json`
   answer with the same `total` (about 277). The market roots answer every language page from these
   indexes; before they are filled, every French market page but the root's own documents is 404
   (as the preview check shows: rollout.md "Checks against the preview origin").
2. Publish the 49 market-root lines (fr/fr among them).
3. The switch: `"liveWaves": [ …, 11 ]`, build, tests, commit, push (as above). Wave 11 makes xx/fr
   live together with its roots (build-locale-table.mjs: a market root goes live with its language
   version only; the country wave "ch" alone leaves ch/fr pilot).
4. The checks as for every wave; the route check for two French roots on the main host.

**What changes on the main host with wave 11**:
- `/xx/fr/...` is a live root with its own documents (as de/en): the front door passes it to the
  origin (published documents), its pages get the hreflang alternates of the live roots
  (src/live-alternates.js). fr/fr and the 13 others are market roots (entry addresses, market
  route; France | Français in the country dialog).
- The 13 market roots as every wave's: entry addresses, market route, sitemap files, llms, the
  dialog on their pages; ch/fr joins ch/en and ch/de on `/ch` (the table's order: de first).
- Not yet: **xx/fr's sitemap file** is not in helix-sitemap.yaml, and the static sitemap index
  lists the four; adding both changes the main host, so they wait for the switch (one commit with
  wave 11, as xx/es's with wave 12). The search API for French headers
  answers from fr/fr's data once build-search-data includes the live root (LIVE_ROOTS).
- The site's labels in French: the header, footer, forms and search texts the blocks bring for en
  and de fall back to English on French pages (the content is French).

**Rollback of wave 11**: as every wave (revert the switch commit; unpublish the list if wanted, the
market roots' lines first).

## Wave 12: Spanish (prepared 2026-11-03, brief 268; not switched)

**xx/es is Spanish's language version.** www's `xx/es` has pages of its own (its homepage,
`flights`, the Munich stopover page answer in Spanish with their own canonical, 2026-11-02; `xx/fr`
too since 2026-11-03, wave 11); following your rule (xx first, es/es otherwise) it is the version, a row of a root that
is only an alternate in www's sitemaps (hreflang `es`, label "Otros paises | Español"), and
**es/es (Spain) is a market root** like the other twelve: ar br ca cl co cr ec es mx pa pe us ve
/es, 13 in all, batch 12, `pilot` (rollout.md "Batch 12"). The query indexes `search-xx-es`,
`market-model-xx-es`, `market-llms-xx-es` are in helix-query.yaml (7174fd9; they fill on
publish).

`publish-wave-12.txt`: **320 documents**: xx/es 274 (homepage, nav, footer first, then its 265
pages and the 6 confirmation pages its forms go to), then per market root its homepage, nav and
footer and the own pages (es/es: emergency contact, feedback, feedbackai, the Allegris article,
the ski campaign, asia-specials; ar/es: the Allegris article). Left out: xx/es's
`…/register-ammunition1` (www's second copy of the ammunition form; no lh-forms id).
**xx/es's five alias pages** (`business-class`, `digital-travel-companion`, `flynet`,
`freigepaeck-regeln`, `lounges`: www's short URLs of other pages, as on fr/fr) are documents under
the alias paths, as de/en has them (brief 278): imported from the captures of their real pages
(`prepare-for-your-trip/travel-classes/business-class`,
`book-and-manage/digital-self-services/digital-travel-companion`, `during-your-trip/internet-on-board`,
`prepare-for-your-trip/baggage/free-baggage`, `during-your-trip/lounges`, captured 2026-11-03
through the long URLs), previewed, in the list. Not imported: three www 404s and
`xx/es/emergency-contact` (www's error page; es/es has the form).

**Release order for wave 12**, as wave 11: publish xx/es's 269 lines first and wait until
`/xx/es/search-index.json` and `/market-model/xx-es.json` answer with the same total (about 260);
then the 46 market-root lines; then the switch `"liveWaves": [ …, 12 ]` (xx/es goes live with its
roots); the checks as for every wave. The main host: `/xx/es/...` becomes a live root with its own
documents (the origin, as de/en), the 13 roots as every wave's; xx/es's sitemap file and the
static index entry with the switch (as wave 11). **Rollback**: revert the switch commit; unpublish
the list if wanted, the market roots' lines first.

**Forms**: xx/es's form pages keep their ids (animal cargo hold and cabin, sports baggage,
ammunition, assistance, group travel, passenger receipt, feedback past flight); es/es's emergency
contact form is `emergency-contact`, titled "Contacto en caso de emergencia" for Spanish roots
(9288e6f). Their confirmations are xx/es's (captured, imported); es/es's emergency contact form
shows its own success message. **Labels**: the form and search blocks in Spanish (cbb1802, www's
texts where its Spanish pages and bundle have them); the brand sites' Spanish pages show them where
they showed the English fallback (Austrian es/es, Brussels es/es, SWISS ch/es). The other blocks'
and scripts' built-in texts in French and Spanish too (brief 278, test/fr-es-block-labels.test.mjs):
the fallback consent banner word for word as OneTrust's fr and es data, the check-in hand-off
errors, the lounge finder, check-in deadlines, booking lookup, car rental, destination offer,
carousel, blog, article header, POI map, security waiting time, countdown and the others; www's
bundle texts where they are French or Spanish (xx/es's bundles recorded 2026-11-03), else the
replica's own. They go out with the code, before the waves.

## The other roots (neither en nor de)

www has 46 roots in 11 other languages (own sitemaps; about 340 URLs each, a third of an en or de
root). **French (wave 11) and Spanish (wave 12) are prepared (above).** The other nine languages have
no capture, nothing in lh-com and no language version; next in the order of the number of roots: pt,
ru, zh-HK, zh, it, el, ja, ko, pl. The /gc tree (DA, brief 249) is en and de. The brand sites hold other
airlines' documents in some of these languages, not Lufthansa's.

| Language | Roots | Root with most URLs on www | Language version on Edge Delivery |
| --- | --- | --- | --- |
| fr | 14: ar/fr be/fr ca/fr ch/fr cl/fr co/fr cr/fr dz/fr fr/fr gq/fr lu/fr ma/fr tn/fr us/fr | ch/fr (351) | **xx/fr** (pilot, wave 11; www's xx/fr has pages since 2026-11-03; fr/fr a market root) |
| es | 13: ar/es br/es ca/es cl/es co/es cr/es ec/es es/es mx/es pa/es pe/es us/es ve/es | es/es (357) | **xx/es** (pilot, wave 12; www's xx/es has pages) |
| pt | 3: ao/pt br/pt pt/pt | pt/pt (345) | none |
| ru | 3: by/ru kz/ru ru/ru | ru/ru (338) | none |
| zh (zh-HK, www's `hk`) | 3: cn/hk hk/hk tw/hk | hk/hk (341) | none |
| zh (zh-CN) | 3: cn/zh hk/zh tw/zh | cn/zh (342) | none |
| it | 2: ch/it it/it | it/it (336) | none |
| el | 2: cy/el gr/el | gr/el (338) | none |
| ja | 1: jp/ja | jp/ja (342) | none |
| ko | 1: kr/ko | kr/ko (340) | none |
| pl | 1: pl/pl | pl/pl (340) | none |

What each language needs, in this order (French's run: rollout.md "Batch 11"; about 3 hours of
captures for the version's ~280 in-scope pages and the roots' ~4 pages each):
1. **A language version**: one root with every page as its own document (the country's own root
   where www has no language-only pages), imported from captures of www by the template of its de/en
   counterpart, or translated from /gc/en with the loc tools (tools/loc); its nav and footer from
   its homepage capture; its row (`documents: own`, pilot, the language's batch) and
   `languageVersions`; its indexes are in helix-query.yaml already for es/es, it/it, gr/el, jp/ja,
   ru/ru, cn/zh, pl/pl (shared with the brand sites; they fill on publish).
2. **Its market roots** (`documents: language`), as the en and de rollout: a row from each homepage
   capture, the homepage, nav and footer, own pages and local versions; a language batch in
   rollout.mjs (LANGUAGE_BATCHES); then a wave.
3. The site's texts in the language (labels fall back to English).
4. Two zh languages (www's `hk` is zh-HK, `zh` zh-CN) and Korean, Japanese, Greek, Russian: the font
   and hyphenation checks of the site's styles in those scripts (CJK, Cyrillic, Greek).

## Open

- **xx/fr's label**: www's selector on xx/fr shows the placeholder "XX | FR"; the row, nav and footer
  say "Autres pays | Français" (as xx/es's "Otros paises | Español"). Your call if www's wording should
  stay.
- **fr/fr's 275 unnecessary documents** (`fr-fr-unnecessary.tsv`): in Document Authoring, never
  published; delete them there if you want (the agent does not).
- **Ten redirect rows** for the travel guides (above).
- **Wave 00, the market-neutral pages**: publish before wave 1 (it changes ch's answers on the
  main host at once); 34 xx URLs are www's de/<ll> pages out of scope (your decision); which of the
  109 go to `/gc` (tools/reports/markets/neutral-pages.md), after 5 November.
- **fr/fr's indexes fill on publish**: wave 11's market pages depend on them (release order above).
- **fr/fr's sitemap file** and the static index entry: with the wave 11 switch.
- **One left out of waves 1 to 10**: `/mk/en/support/refund` (www's form has no fields).
- **Recipients**: the four new form ids (`invoice-request-bg`, `cancellation-refund-webform`,
  `formular-notfallkontakt`, `emergency-contact`) go to FORM_CONFIG's default unless the secret names
  them (it is yours; I cannot read it).
- **Redirect rows for you** (rollout.md "Batch 11"): `/fr/fr/Yes`, `/fr/fr/smart-bags`,
  `/ca/fr/lufthansa-id` (its target is not in the replica).
- **The form confirmations of fr/fr** (`/fr/fr/support/contact/contact-form-confirmation`, the
  animal confirmation) are not in fr/fr's sitemap and not imported: after a submit the form goes to
  www's French confirmation page.
- **The redirects sheet** (wave 9) brings all six rows on preview at once (pt for wave 9, us for wave
  10).
- **The 12 app screens** of batch 7 (`/content/mobile/lh/{en,de}/content-pages/100-years-of-lufthansa/…`)
  stay with you (www refused this machine).
- **ca and us**: no home airport (www's homepages preselect none; also ca/fr, us/fr and fr/fr); er/de
  and ca/fr no currency (www shows no price).
- **The demo on Wednesday**: no wave touches its 36 documents; a wave that goes live before Thursday
  changes the main host's dialog and entry addresses for that wave's countries only.
