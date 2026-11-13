# lufthansa.com market comparison: rulings

Written 2026-11-10 (09:50 CET, ahead of the 10:30 stop) by an analysis child, offline and read-only (not in git). Flaky mode: 0 requests to www.lufthansa.com or any airline host, no DA, preview, publish or EMA calls, no Chrome.
Input: `import-list.tsv` (7,454 pairs), `review-list.tsv` (1,011), `report.md`, `summary.md`, `roots-table.md`, `BANKED.md`, `paths.tsv`, `pairs/pairs.tsv`, `pairs/not-served.tsv`, `compare/results.tsv`, `compare/evidence/*` (read), `run/fetch.jsonl` (fetch times and body file names only, read), `urls-prio.txt`, `work/lh-capture/deliveries.json`, lh-com `tools/importer/page-templates.json`.
Nothing in `run/`, `compare/` or `chunks/` was touched. New files only: `rulings.md`, `rulings-pairs.tsv`, `import-rows.tsv`, `decisions-log.txt`, `rulings.py` (the classifier, rerunnable offline), `rulings-stats.json`.
The earlier runners left no classifier script (their rulings were written by hand), so `rulings.py` is new; it reuses the comparison's own evidence files and lists.

**Basis.** 128,859 of 205,068 pairs were compared (63 %); the 46 priority roots (the first 46 market roots of `urls-prio.txt` after the versions de/de and de/en, ch/en to co/en) are complete except co/en (761 of 1,007). Rows below therefore hold for what was compared; 76,209 pairs (editorial articles and the long tail of 174 partial roots) are not in these numbers.

## 1. The 7,454 import-list pairs

| class | pairs | rule | action |
| --- | ---: | --- | --- |
| IGNORE date format | 4,818 | D1: the root shows the article date as localized text ("27 Dezember 2025 г.", Hebrew or Armenian digits), the version page has the `{date:2025-27-dezember}` placeholder; every root-only token holds a digit | none |
| IGNORE promotion teaser | 466 | W1: only the booking widget's `promotionTeaser` differs (title, text, link, picture) | none (campaign data) |
| IGNORE link only | 191 | L1/L2: `lufthansa.cn` vs `lufthansa.com` host on the version page (190 pairs on mit-kindern-am-flughafen / with-children-at-the-airport), one `home` vs `homepage` alias | none |
| IGNORE media only | 56 | D2: another campaign image rendition (frontify vs pixels variations, partner header pictures hertz, sixt, europcar, check-in-baggage, premium-economy upgrade), text equal | none |
| IGNORE meta only | 7 | M1/M2: description differs (6); the root's title is the page slug on www (1) | none |
| IGNORE time-bound drift | 0 | T1: gap of 6 h or more between version and root fetch on a time-bound page; 1,104 pairs have that gap (1,100 are date noise), none qualifies | none |
| MARKETS SECTION on a version page | 1,548 | R3: the roots of a language agree with each other and differ from the version page (version-local, 23 pages) | 23 rows |
| SHARED VARIANT (one document with `markets`) | 109 | R2/R3b: roots of one language share a variant of a page (29 root-local-shared, 80 smaller variants of version-local pages) | 25 rows |
| OWN DOCUMENT | 192 | R1/R3b: one root differs on a page (root-local, 145; single-root variants of version-local pages, 47) | 192 rows |
| WIDGET SETTING | 65 | W2/W3: booking-widget tab switches per market (`hideHotel`, `hideCar`, `hideHoliday`, 43) and the feedback questionnaire that only the version shows (22) | 14 rows (markets section, widget setting) |
| NOT RULED | 2 | W4: video and subtitle sources on one allegris article (az/en); fare-teaser origins on se/en europe-offers | one look |
| **sum** | **7,454** | | **254 rows** |

Counts add up: 4,818 + 466 + 191 + 56 + 7 + 0 + 1,548 + 109 + 192 + 65 + 2 = 7,454; rows 23 + 25 + 192 + 14 = 254.

**Evidence for the large rules.**
- D1 (4,818). `compare/evidence/` for any article pair, e.g. `by/de /articles/explore-the-world/a-perfect-day-cape-town-in-one-day`: `text: root only 1: "27 Dezember 2025 г."; version only 1: "{date:2025-27-dezember}"`. Samples on il/en ("{date:2025-21-בaugust}"), vn/de, am/de, co/en show the same: the only difference is the date's rendering. 4,813 pairs are on `/articles/`, 5 on local pages. Twelve pairs (ski-campaign-2026) also differ in a text paragraph and stay real.
- W1 (466). The widget setting is a JSON attribute (`@data-dcep`); the differing keys all start with `.promotionTeaser` (alignment, displayText, linkModeConfig url/label, image). Example `ar/es /book-and-manage/stopover`: "Lufthansa Group Wi-Fi powered by Starlink" on the version against "Hasta -50 % para niños" on the root. Same ruling as ITA (promotion teasers: ignore) and the proposal for TAP.
- L1 (190). Example `ae/de /mit-kindern-am-flughafen`: the version's links point to `http://www.lufthansa.cn/de/de/prepare-for-your-trip/travelling-with-children/...`, the root's to `http://www.lufthansa.com/{R}/...`: the version page's own quirk; after normalizing host, scheme and root, the link sets are equal. The replica writes own links root-relative anyway.
- R3 (1,548 pairs on 23 pages). The pages are the booking and service pages every root of a language shows the same way and the version shows differently (version only: the promotion for the home market; roots only: the neutral text). The largest variant per page is folded into one row on the version page; the others are rows of their own (below). Pages, in priority order: de/de automatic-check-in 80, giftvoucher 94, cash-and-miles 71, fluege 90, flugsuche 82, free2move 94, meetings-und-events (2 pages, 91 each), pre-check-in 81, lufthansa-express-rail-briefing 67, medical-travel-companions 93; de/en giftvoucher 95, cash-and-miles 66, europcar 90, flight-search 79, flights 86, free2move 94, medical-travel-companions 93 (roots covered); xx/ru automatic-check-in and pre-check-in (3 each), xx/fr cash-and-miles 2, hotel-offers 1. Real text, e.g. giftvoucher: roots show the neutral "Give a Lufthansa Gift Card" block, the version a different offer block; medical-travel-companions: the CTA ("Jetzt buchen" vs "Zu den Angeboten") and the affiliate link.
- W2/W3 (65). `cr/es /cash-and-miles`: `.hideCar: false -> true; .hideHotel: false -> true` (the market hides the car and hotel tab); 22 pairs on `/feedback/feedbackai`: the version carries `<feedback-questionnaire>` with the travel-id feedback endpoint, 21 roots lack it. These are market rules, not campaign data, so they are kept.

## 2. The 1,011 review-list pairs

| class | pairs | rule |
| --- | ---: | --- |
| IGNORE link only | 997 | L1/L2/L3: internal link alias or placeholder, no text change. 877 internal-target aliases (www's `/{R}/home` vs `/{R}/homepage` 427, `local-offers` vs `fluege` 100, flight-upgrade artifact path per locale 203, check-in aliases 60, allegris path 30, the rest single digits), 1 host/placeholder, 119 tooltip or date-field attribute only (external-link notice, date mask) |
| NOT RULED | 14 | one article (`what-the-hack-travel-with-kids`, kids' meals text, 13 text runs, 14 roots); the review list kept it as minor |
| **sum** | **1,011** | |

No review-list pair becomes an import row. The 422 `homepage` / `home` pairs are also www's own breakage on ec/de (`/null/null/home`): the root's link is wrong on www, the version's is right.

## 3. Import rows (254) by priority

Priority: 1 = the 46 priority roots, 2 = the other complete roots (62 complete in all, 45 of them priority roots), 3 = the partial roots; a version-page, shared-variant or widget row takes the best priority of its roots.

| priority | own document | shared variant | markets section on a version page | widget setting | rows | pairs behind them |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 93 | 16 | 19 | 2 | 130 | 421 |
| 2 | 18 | 0 | 2 | 0 | 20 | 24 |
| 3 | 81 | 9 | 2 | 12 | 104 | 1,469 |
| **sum** | **192** | **25** | **23** | **14** | **254** | **1,914** |

Pairs behind rows: priority 1: 93 own + 31 shared + 295 markets-section + 2 widget = 421; priority 2: 18 + 6 = 24; priority 3: 81 + 78 + 1,247 + 63 = 1,469; total 1,914 = 192 + 109 + 1,548 + 65. All other import-list pairs are ignored (5,538) or not ruled (2).

`import-rows.tsv` columns: priority, root, da_path, action (importer's words: own document, shared variant, markets section on a version page, markets section (widget setting)), markets (root list for a shared variant or widget setting), roots_covered, version, page, template, template_source, importer (what is needed), www_path, archive, archive_of (root page or version page), fetched_body.

Assumptions: a shared variant lives under the first root of its group (`da_path`) with the group in `markets` (the importer may choose another path); a version-page row changes `/<version>/<page>` and covers the roots in `roots_covered`.

**Archive.** The capture archives hold the language versions (xx/ja, xx/pl, xx/pt, ..., de/de, de/en, at/de, gb/en: 4,144 pages) and only a handful of market-root pages. For the 254 rows: 17 have the root page in an archive, 116 only the version page, 121 none; for all 254 the compare run holds the page's body as fetched (`fetched_body`, gzip HTML under `lh/run/bodies`, 1.9 GB, not the rendered snapshot with header labels the importer reads). Root pages the importer needs as snapshots must be captured (not now, flaky mode).

## 4. What needs importer work

| rows | what | status of the importer for lufthansa.com |
| ---: | --- | --- |
| 192 | own document | handled: the importer has templates for all seven types seen here (info 131, app-entry 21, hub 14, legal 12, insights 10, campaign 3, form 1; `tools/importer/page-templates.json`, 11 templates in all). Type confirmed by `page-templates.json` for 113 rows, by the same page on de/en, de/de or gb/en for 39, by the path only for 40 (unconfirmed). Input needed: a snapshot of the root's page (only 4 rows have one; 97 have the version page's only) |
| 25 | shared variant | importer work first: no lufthansa.com step writes a document with `markets` for a group of roots (page-level `markets` exists, `tools/markets/seed-markets.mjs`; TAP's `tap-markets.mjs` is brand-specific) |
| 23 | markets section on a version page | importer work first: needs a merge of the root's variant into a section with `markets` on the version document (the lh-edge market route reads section-level `markets`, brief 119) and a check that the version page stays unchanged for its home market |
| 14 | markets section (widget setting) | importer work first, plus a decision on how the widget block carries per-market tab switches (`hideHotel`, `hideCar`, `hideHoliday`) and the feedback component |

So 192 of 254 rows (76 %) are for the document type the importer handles today; 62 need importer work first. The 192 own documents are mostly priority 1 (93): local pages 13, articles 7, then cash-and-miles, flight-search, book-and-manage, passenger-rights.

## 5. The pairs without a comparison (not import rows)

| set | count | ruling |
| --- | ---: | --- |
| www redirects the root page, the replica serves it | 1,913 | mirror www: a `lacks` or redirect row (harness; same as TAP's 15 root-redirects). Evidence: the verdict is `root-redirect` (www answers a redirect, target not followed); 236 each on `/dcc` and `/rechnungsbeleg`, 190 on `/business-class`, `/digital-travel-companion`, `/flynet`, `/freigepaeck-regeln`, `/green-fare`, `/lounges` (short codes and app entries www sends elsewhere). The targets are unread: inference |
| missing on both sides (root and version) | 512 | none: sitemap entries no page answers (`/child-restraint-systems` 108, `/datenerfassung-fuer-die-usa` 95, `/business-class` 46, ...) |
| root answers 404, replica serves it | 59 | mirror www (`lacks` row): `/articles/explore-the-world/eat-see-do-seattle` 18, `/articles/tags/chennai` 15, `/articles/tags/gothenburg` 3, others single |
| HTTP 500 from www | 18 | not ruled: 17 on mk/de and us/de (`/overview-additional-services`, `/overview-services-on-board`, `/overview-travel-classes` ...), 1 unread; retry once when fetching is allowed |
| www pages the replica does not serve (`pairs/not-served.tsv`) | 4,600 | not fetched, not ruled on status: by pattern, articles 2,911 (tags 964, editorial series), app shells and legal-like short pages (`/travel-id-linking-page` 236, `/registration` 108, `/validate-mail-token` 46, `/connexion`, `/inscription`, `/registro`: login and registration: link-out like the earlier brands), `/lufthansa-city` 236, `/raffle-team-yes` 380, `/support` 197, `/flights` 95, `/smart-bags` 60. 236 roots; the largest are mk/de 83, mk/en 48, us/de 36. None was fetched by the run (it fetches pairs only), so whether www answers 200 or 404 is unknown |

## 6. What I could not rule on, and why

1. The 4,600 not-served pages: never fetched; a status read needs www (flaky mode forbids it). Proposed rule once reads are allowed: 404 = out of scope, 200 = own document of the root's language page group, login and registration pages = link-out.
2. 2 widget pairs (W4) and 14 review pairs (one article): one look each.
3. 18 HTTP 500 pairs: a retry.
4. The 1,913 root-redirect targets: unread; whether a target is a TAP-like app, a partner or another page of the root decides between a redirect row and a `lacks` row.
5. The 174 partial roots: 76,209 pairs are not compared; the classes above will change in count when the run resumes. The ratios hold: 4,818 of 7,454 compared difference pairs are date format alone.
6. Replica check: the 361 pairs with `no-text-diff` that have real root-only and version-only text (bh/en companion-special pages: city and price lists) stay rows; the check does not read those. I did not use it as a noise signal.
7. The promotions on the version page that the roots lack (e.g. "Promotion: Jetzt Nordamerika entdecken und bis zu 30 % Meilen sparen" on cash-and-miles) are real differences the replica shows to every root today; whether it should is the trade-off in section 8.

## 7. What to hand to the harness

1. 1,913 + 59 `lacks` or redirect rows for the root-redirect and root-404 pages (pattern above; no request needed for the 59, a read of the 1,913 targets later).
2. The 254 rows to the import helper in priority order (130, 20, 104); the 192 own documents can run as soon as root snapshots exist (bodies are in `lh/run/bodies`), the other 62 wait for the importer step.
3. Nothing for the 5,538 ignored import-list pairs and 997 ignored review pairs.

## 8. What Ben decides

Only one item, and it is the same decision as for TAP and ITA, so I did not repeat the question: should a market page show the language version's home-market promotion (cash-and-miles "Nordamerika" offer, giftvoucher offer, booking-widget teaser) as the replica does today, or follow www and show the roots' neutral variant? This pass assumed "follow www" (markets sections), and ignored the booking-widget teaser (466 pairs) as campaign data.

## 9. Files (all in `work/market-diff/lh/`)

`rulings.md`, `rulings-pairs.tsv` (8,465 pairs: 7,454 import-list + 1,011 review-list, with class, action, rule, importer_row, fetch gap in hours, variant, reason), `import-rows.tsv` (254 rows), `decisions-log.txt` (14 decisions), `rulings.py`, `rulings-stats.json`.
