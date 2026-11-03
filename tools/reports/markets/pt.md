# Portuguese for lufthansa.com (batch 13)

Status of 2026-11-03 (briefs 298 and 300). Nothing published, nothing switched on.

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
Brazilian wording of its own on the pages compared so far.

## Captures

Bright Data, 2026-11-03, one warm session at a time, one page every 5 to 10 s; **no 403, no block**.
Stopped at 10:50 UTC on Ben's word (brief 300: no more Bright Data captures; Ben's machine captures
from `tools/markets/capture-lists/13-pt.txt`).

| | asked | captured | not captured |
| --- | --- | --- | --- |
| xx/pt, in scope (pages whose de/en or de/de counterpart is in `tools/migration-scope/pages.csv`) | 257 | 75 (73 in the session, 2 of the 3 probes) | 182: the capture stopped |
| the roots (homepages, own pages, comparison pages: what `rollout.mjs --plan 13` gives) | 21 | 20 | pt/pt `additional-services` |

- One www 404 so far: `/xx/pt/business-class` (www's short alias URL, as xx/es's
  `business-class`; its long URL answers 404).
- **Left out of the version** (77 of www's 334 xx/pt URLs): pages lh-com has in no language version
  (no in-scope de/en or de/de counterpart): the aircraft type pages (`319` … `74z`), the
  `configuration/commonheader` AEM pages, the stopover partner pages lh-com does not have,
  `emergency-contact` (no de/en page), `inscricao`, `book-and-manage/best-price` and others; the
  list is `migration-work/pt/xx-pt-out.tsv` (outside git) and reproducible from the sitemap groups.
- **The roots' own pages** (`rollout.mjs` ownPages): ao/pt none; br/pt six
  (`local-page/lufthansa-in-brazil/anac-report`, `carrying-values`,
  `international-transit-in-gru`, `online-tickets-cancellation`, `sac`; `pix`); pt/pt three
  (`book-and-manage/offers-and-destination/companion_special_business`,
  `companion_special_premium_economy`, `fatura`).

## Documents (DA and preview, not published)

**62 documents**, 62 of 62 answer 200 on preview and carry the same text in DA (374a0d18):
- **xx/pt, 50**: 48 pages imported from the captures (27 more captured pages wait for the archive) by the template of their de/en counterpart
  (`import-batch.mjs`; homepage 1, the 100-years hub and campaign pages, info, legal, one form), its
  nav and footer from its homepage capture (`import-nav.bundle.js`: Portuguese labels, "Outros
  países | Português"); links into xx/pt relative where it has the document (`root-docs.mjs
  --own-root xx/pt`: 142 links).
- **ao/pt, br/pt, pt/pt, 12**: the three homepages (homepage template) and the nine own pages (info
  template; pt/pt's two `companion_special_*` pages are documents under `companion-special-*`).
- Images: the Instagram logo SVG of the homepages (58 KB, over Edge Delivery's 40 KB: the preview
  answered 409) is its converted PNG already in DA (`media-manifest.json`'s conversion; this
  workspace has no media cache, so `postprocess-media.mjs --no-download` measures nothing).
- `tools/importer/sites/lh-com.json` lists the 62 (added at the end).

## What Portuguese still needs before it can go live

1. **The rest of the captures**: Ben's archive (182 xx/pt pages, pt/pt's `additional-services`,
   xx/pt's form confirmations below); where an archive page differs from a snapshot here, the
   archive's wins. Then the import of the rest, by template, uploaded and previewed per batch.
2. **The form confirmations**: xx/pt's form pages (`anmeldung-tiere-frachtraum`,
   `feedback-past-flight`, `register-ammunition`, `register-animal-cabin`; `farealert/best-price-alert`
   has no success row on de/en) and the pages their de/en forms send to:
   `/xx/pt/prepare-for-your-trip/baggage/travelling-with-animals/register-animal-cargo-hold/confirmation`,
   `/xx/pt/support/contact/contact-form-confirmation`,
   `/xx/pt/prepare-for-your-trip/baggage/sport-baggage/register-sporting-firearm/confirmation`,
   `/xx/pt/prepare-for-your-trip/baggage/travelling-with-animals/register-animal/confirmation`
   (to capture; not in www's sitemaps). The form ids stay as on de/en.
3. **Locale rows (ema-adobe: `tools/markets/locale-data.json` and the table it builds,
   `scripts/locale-table.js`, are shared)**: the values from the homepage captures
   (`rollout.mjs --rows 13`, not applied):

   | Root | name (www's label) | countryName en / de / pt | Airport | Currency |
   | --- | --- | --- | --- | --- |
   | xx/pt (version, documents own) | Outros países \| Português | – / – / Outros países | FRA | EUR |
   | ao/pt | Angola \| Português | Angola / Angola / Angola | LAD | USD |
   | br/pt | Brasil \| Português | Brazil / Brazil / Brasil | SAO | BRL |
   | pt/pt | Portugal \| Português | Portugal / Portugal / Portugal | LIS | EUR |

   (www's labels have runs of spaces before the "|": kept as www writes them, as for French);
   `languageVersions.pt = xx/pt`; all `pilot`, batch 13. Without the rows the roots' nav and footer
   copies (`root-docs.mjs --from xx/pt --to <root>`) keep xx/pt's label: they are not made yet.
4. **The query indexes** of xx/pt (helix-query.yaml `search-xx-pt`, `market-model-xx-pt`,
   `market-llms-xx-pt`, as for xx/es: `tools/markets/lean-indexes.mjs` ROOTS): they fill on
   publish; the market route answers the roots' pages from them.
5. **Redirect rows**: pt/pt's `companion_special_business` and `companion_special_premium_economy`
   (www's underscore URLs) to the documents `companion-special-business` and
   `companion-special-premium-economy`; `/xx/pt/business-class` (www's alias) as xx/es's.
6. **The site's texts in Portuguese** (labels fall back to English).
7. Then a wave: the local-version comparison (`rollout.mjs --plan 13` compare pairs) and the
   preview check, as batches 11 and 12.

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
made from its helpers without that check.
