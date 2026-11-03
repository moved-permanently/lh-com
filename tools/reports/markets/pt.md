# Portuguese for lufthansa.com (batch 13)

Status of 2026-11-03 (briefs 298, 300, 302 and the next): **imported, uploaded and previewed; nothing
published, nothing switched on.**

## The language version: xx/pt

www's sitemaps list 334 `xx/pt` URLs, only as hreflang alternates (no sitemap of its own), as they
did for `xx/es` and `xx/fr`. The captures settle it: `xx/pt/homepage`, `xx/pt/flights` and
`xx/pt/book-and-manage/stopover/munich-airport` answer 200 through www's long AEM URLs with
`lang="pt"`, Portuguese text and **their own canonical** (`https://www.lufthansa.com/xx/pt/...`).
So **xx/pt is Portuguese's language version** (as xx/es), and the three roots with own sitemaps,
**ao/pt, br/pt and pt/pt, are its market roots** (`tools/markets/rollout.mjs` LANGUAGE_BATCHES,
batch 13, d0c80364; `test/markets-pt.test.mjs`).

The four homepages carry the same Portuguese text (European Portuguese, "Reserve os seus bilhetes
online agora e viaje pelo mundo"); only the country and language label differs. br/pt has no
Brazilian wording of its own on the pages compared.

## Captures

- **The local capture** (Ben's machine, a real browser, about one page every 10 s, from
  `tools/markets/capture-lists/13-pt.txt`): five archives, `lh-snapshots-001` to `-005`, the
  confirmations' `lh-snapshots-010` and the aliases' `lh-snapshots-013` (lh-deliveries.json:
  `{"segment": "pt", "complete": true}`), **274 pages, 7 confirmations and 5 alias pages**; each archive's sha256
  and each page's sha256 in its manifest checked, every entry a regular file inside the archive.
  The pages were checked before they were placed: all Portuguese (`lang="pt"`), each with its own
  canonical, its own URL or www's long AEM URL of it as final URL, no challenge page, no empty
  shell. **None looked wrong.** 13 have no H1, as on www (the 100-years, aircraft and hero
  pages; the Bright Data snapshots of the same pages have none either).
- **Archives 004 and 005 replace 39 pages of 003** (field `replaces`, unpacked in order): 004
  `prepare-for-your-trip/current-travel-information` (imported again: the document came out the
  same), 005 the 38 from `.../entering-schengen/entry-exit-system` to `terms-of-use`. 003's copies of
  these had www's country list in English and no "Outros países | Português" label; 005's carry the
  Portuguese page chrome. All 39 passed the same checks; imported again by their templates, **8
  documents changed** (`cognitive-impairment`, `visual-impairment`, `economy-basic`, `schengen`,
  `security-fast-lanes`, `services-am-flughafen-frankfurt`, `shopping`, `sports-baggage`),
  uploaded and previewed; the other 31 came out the same.
- **Not captured: 6, all www 404s** (the archive's probes): `/xx/pt/business-class`,
  `digital-travel-companion`, `flynet`, `freigepaeck-regeln`, `lounges` (www's short alias URLs of
  other xx/pt pages, as xx/es's five) and `/xx/pt/lufthansa-city/menu-card` (a 404 on www, as
  fr/fr's).
- Before that, Bright Data (2026-11-03, no 403) had captured 75 xx/pt and 20 root pages; stopped at
  10:50 UTC on Ben's word (brief 300). Every one of those pages came again in the archives, and
  **the archives' copies replaced them** (every one differed: another capture time): every
  document is imported from Ben's captures.

## Documents (DA and preview, not published)

**277 documents, 277 of 277 answer 200 on preview and carry the same text in DA:**
- **xx/pt, 265**: 251 pages by the template of their de/en counterpart (`import-batch.mjs`:
  homepage 1, hub 16, campaign 21, fleet 8, info 165, legal 29, form 5, app-entry 5,
  flight-status 1), the 7 form confirmation pages (info, as de/en's; archive `lh-snapshots-010`,
  below), the five alias documents (below), its nav and footer from its homepage capture (`import-nav.bundle.js`:
  Portuguese labels, "Outros países | Português"); links into xx/pt relative where it has the
  document (`root-docs.mjs --own-root xx/pt`).
- **ao/pt, br/pt, pt/pt, 12**: the three homepages (homepage template) and the nine own pages
  (info template): br/pt's `local-page/lufthansa-in-brazil/anac-report`, `carrying-values`,
  `international-transit-in-gru`, `online-tickets-cancellation`, `sac` and `pix`; pt/pt's
  `book-and-manage/offers-and-destination/companion_special_business` and
  `companion_special_premium_economy` (documents under `companion-special-*`) and `fatura`; their
  links into their own root relative (`--own-root`). ao/pt has no own pages.
- **The forms** keep their ids: `anmeldung-tiere-frachtraum`, `feedback-past-flight`,
  `register-ammunition`, `register-animal-cabin` (`farealert/best-price-alert` has no form row, as
  on de/en). Every success row links its confirmation document now (relative): the contact
  forms' `support/contact/contact-form-confirmation`, `passenger-receipt-90days/confirmation`,
  `register-sporting-firearm1/confirmation` (www's own for xx/pt's ammunition form),
  `register-sports-baggage/confirmation`, `register-animal/confirmation`,
  `special-needs-online-form/confirmation`. `register-animal-cargo-hold/confirmation` is a document
  too, though xx/pt's `anmeldung-tiere-frachtraum` names no success page (as captured).
- **The five alias documents** `business-class`, `digital-travel-companion`, `flynet`,
  `freigepaeck-regeln` and `lounges` (www's short URLs, 404s on www), as xx/es's (931e6d05):
  documents under the alias paths, as de/en has them, imported from the captures of their real
  pages (`prepare-for-your-trip/travel-classes/business-class`,
  `book-and-manage/digital-self-services/digital-travel-companion`,
  `during-your-trip/internet-on-board`, `prepare-for-your-trip/baggage/free-baggage`,
  `during-your-trip/lounges`; `tools/markets/capture-lists/13-pt-aliases.txt`, archive
  `lh-snapshots-013`, kind `aliases`: all five Portuguese with their own canonical, none wrong) by
  their de/en counterparts' templates (info; lounges hub). No document under the real paths (they
  are in none of www's sitemaps; de/en has none either). Seven documents that link the aliases
  link them relative now; the 12 uploaded and previewed.
- Images: the homepages' Instagram logo SVG (58 KB, over Edge Delivery's 40 KB: the preview answered
  409) is its converted PNG already in DA (`media-manifest.json`'s conversion; this workspace has no
  media cache, so `postprocess-media.mjs --no-download` measures nothing).
- `tools/importer/sites/lh-com.json` lists the 277 (added at the end).

## Left out, and why

- **77 of www's 334 xx/pt URLs** have no in-scope de/en or de/de counterpart (pages lh-com has in
  no language version): the aircraft type pages (`319` … `74z`), the `configuration/commonheader`
  AEM pages, the stopover partner pages lh-com does not have, `inscricao`,
  `book-and-manage/best-price` and others. They were not captured.
- **`/xx/pt/lufthansa-city/menu-card`**, a www 404 (no capture, no document). The other five
  404s are the alias documents above.
- **Two archive pages outside the scope**, captured but not imported: `/xx/pt/emergency-contact`
  (no de/en counterpart; the emergency contact form is on lh-forms as `emergency-contact`, as es/es
  and fr/fr have it) and `/xx/pt/prepare-for-your-trip/baggage/sport-baggage/register-ammunition1`
  (www's second copy of the ammunition form, as fr/fr's, which has no id).
- **The roots' comparison pages** (`flights`, `airport-information`, `additional-services` of each
  root, 8 captured): references for the local-version comparison, not documents (the roots answer
  them from xx/pt).
- **One confirmation URL, a www 404**: `/xx/pt/prepare-for-your-trip/baggage/sport-baggage/register-sporting-firearm/confirmation`
  (de/en's path; xx/pt's form goes to `register-sporting-firearm1/confirmation`, which is a
  document). The confirmations were in no capture list at first (not in www's sitemaps);
  `13-pt-confirmations.txt` (271507e2) listed 8, the local capture brought 7
  (`lh-snapshots-010`, kind `confirmations`; the eighth is the 404).

## What Portuguese still needs before it can go live

1. **Locale rows (ema-adobe: `tools/markets/locale-data.json` and the table it builds,
   `scripts/locale-table.js`, are shared)**: the values from the homepage captures
   (`rollout.mjs --rows 13`, not applied):

   | Root | name (www's label) | countryName en / de / pt | Airport | Currency |
   | --- | --- | --- | --- | --- |
   | xx/pt (version, documents own) | Outros países \| Português | – / – / Outros países | FRA | EUR |
   | ao/pt | Angola \| Português | Angola / Angola / Angola | LAD | USD |
   | br/pt | Brasil \| Português | Brazil / Brazil / Brasil | SAO | BRL |
   | pt/pt | Portugal \| Português | Portugal / Portugal / Portugal | LIS | EUR |

   (www's labels have runs of spaces before the "|": kept as www writes them, as for French);
   `languageVersions.pt = xx/pt`; all `pilot`, batch 13.
2. **The roots' nav and footer**: copies of xx/pt's (`root-docs.mjs --from xx/pt --to <root>`),
   which take the root's label from the locale rows: after them.
3. **The query indexes** of xx/pt (helix-query.yaml `search-xx-pt`, `market-model-xx-pt`,
   `market-llms-xx-pt`, as xx/es's: `tools/markets/lean-indexes.mjs` ROOTS): they fill on publish;
   the market route answers the roots' pages from them.
4. **Redirect rows**: pt/pt's `companion_special_business` and `companion_special_premium_economy`
   (www's underscore URLs) to `companion-special-business` and `companion-special-premium-economy`.
5. **The site's texts in Portuguese** (labels fall back to English).
6. Then a wave: the local-version comparison (`rollout.mjs --plan 13`'s compare pairs, the roots'
   comparison captures against xx/pt's) and the preview check, as batches 11 and 12.

## The other languages (brief 300)

`rollout.mjs` LANGUAGE_BATCHES has them as batches 14 to 21 in this order: ru, hk (www's zh-HK), zh
(zh-CN), it, el, ja, ko, pl (`test/markets-languages.test.mjs`). For each, www's sitemaps list
330 to 335 `xx/<ll>` URLs, but only as alternates (as xx/pt's, and xx/fr's while its pages answered
404), so the sitemaps do not settle the version: **xx/<ll>, to confirm** by the local capture's
pilot; `confirm` names the root with the most URLs, the version if xx/<ll> has no pages: ru/ru,
hk/hk, cn/zh, it/it, gr/el, jp/ja, kr/ko, pl/pl. www's xx/hk and xx/zh both have hreflang `zh`.

The local capture's lists are `tools/markets/capture-lists/<n>-<lang>.txt` (URLs only): the
version's in-scope pages (its homepage first), then what `rollout.mjs --plan <n>` gives (the
version's three comparison references; the roots' homepages, own pages and comparison pages).
For batches 14 to 21 also `<n>-<lang>-<cc>-<ll>.txt`, the fallback root's in-scope pages. `--plan`
itself stops on batches 14 to 21 until the version's comparison documents exist; the lists were
made from its helpers without that check. The form confirmation pages (not in www's sitemaps) are
in `<n>-<lang>-confirmations.txt` and `<n>-<lang>-<cc>-<ll>-confirmations.txt` (271507e2): the
confirmations of the de/en and de/de forms whose group has a page of the root, the root swapped in
(7 a list; xx/pt 8 with its own `register-sporting-firearm1`).
