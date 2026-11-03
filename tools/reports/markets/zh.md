# Simplified Chinese (zh) for lufthansa.com (batch 16)

Status of 2026-11-03: **imported, uploaded and previewed; nothing published, nothing switched
on.**

## The language version: xx/zh

`rollout.mjs` had batch 16 as `{ lang: 'zh', version: 'xx/zh', confirm: 'cn/zh' }`, to be confirmed
by the local capture's pilot. **The pilot settled it** (lh-deliveries.json: `{"segment": "zh",
"pilot": "passed", "version": "xx/zh", "versionHasOwnPages": true, "fallbackUsed": false}`).
xx/zh's pages are Simplified Chinese (`lang="zh"`) with their own canonical and the label
"其它国家 (Other countries) | 简体中文", fetched through www's long AEM URLs. So **xx/zh is the
version** and **cn/zh, hk/zh and tw/zh are its market roots**. The fallback list `16-zh-cn-zh.txt`
was not used.

## Captures

- **The local capture** (`16-zh.txt`, `16-zh-confirmations.txt`, `16-zh-aliases.txt`): eight
  archives, `lh-snapshots-019`, `-023`, `-024`, `-025` and `-030` (pages), `-018`
  (confirmations), `-022` and `-029` (aliases), **278 pages** (lh-deliveries.json: `{"segment":
  "zh", "complete": true, "archives": 8}`). Each archive's sha256 and each page's sha256 in its
  manifest were checked, and every entry is a regular file inside the archive (no absolute path,
  no `..`). Each archive was unpacked into its own empty folder, then applied in order:
  - **025 replaces 019's** `book-and-manage/pax-receipt`;
  - **029 replaces 022's** five alias pages;
  - **030 replaces 74 pages**: 31 of 023 and 43 of 024 (`lufthansa-group-star-alliance-and-partner-airlines`
    to `tiere-als-handgepaeck`).

  Only the latest copy of each page was imported.
- **The checks, as hk.md's adapted to Simplified Chinese**: each page must
  - be in Chinese: a third of the text units are CJK characters (one character against one Latin
    word: www's chrome lists the countries with their English names on every page);
  - be Simplified: more Simplified-only than Traditional-only characters among those common on
    the pages (这/這, 国/國, 预/預 …);
  - have its own canonical and its own URL or www's long AEM URL of it as final URL;
  - be neither a challenge page nor an empty shell (under 200 characters of its own text, header,
    nav and footer left out).

  **None looked wrong.** Every page has `lang="zh"`. The page with the most Traditional
  characters is hk/zh's homepage (104 against 378 Simplified: its Hong Kong teasers); xx/zh's
  nav has one item in Traditional characters on www too (機場抵達入境和起飛出境), kept as www
  writes it. A first threshold on the capture's own `mainText` field flagged 9 real pages (FAQs,
  app pages: that field measures less than the page's text); it was replaced by the own-text
  check above before anything was imported. 23 pages have no H1, as on www (the same kind as for
  Russian and Traditional Chinese: `100-years/*`, `320`, `32n`, `boeing787`, `seat-maps`,
  `timetable-and-flight-status`, `culinaryjourney` and others).
- **Not captured: 8**, as the index lists them (the capture's probes):
  - the five alias URLs (`business-class`, `digital-travel-companion`, `flynet`,
    `freigepaeck-regeln`, `lounges`) and `lufthansa-city/menu-card`, www 404s as for xx/pt, xx/ru
    and xx/hk;
  - `.../register-sporting-firearm/confirmation` (de/en's path, a www 404; xx/zh's ammunition form
    goes to another one, below);
  - `tw/zh/travel-care`, tw/zh's one own page: www answers a redirect (300) that the capture did
    not follow.

## Documents (DA and preview, not published)

**271 documents. All 271 answer 200 on preview and carry the same text in DA** (preview's text
against DA's without the metadata tables; DA's against the local document's):
- **xx/zh, 264**:
  - 251 pages, each by the template of its de/en counterpart in www's page groups (homepage 1,
    hub 16, campaign 21, fleet 8, info 165, legal 29, form 5, app-entry 5, flight-status 1);
  - the 6 form confirmation pages captured (info, as de/en's);
  - **the five alias documents** `business-class`, `digital-travel-companion`, `flynet`,
    `freigepaeck-regeln` and `lounges`, as xx/pt's: documents under the alias paths, imported from
    the captures of their real pages (archive 029) by their de/en counterparts' templates (info;
    lounges hub). No document under the real paths, as for de/en;
  - its nav and footer from its homepage capture (`import-nav.bundle.js`: Simplified Chinese
    labels, "其它国家 (Other countries) | 简体中文").

  Links into xx/zh are relative where it has the document (`root-docs.mjs --own-root xx/zh`: 1,347
  links). www's xx/zh pages link the alias pages by their real paths; those 59 links in 42
  documents go to the alias documents now, as de/en's documents link `/de/en/lounges`,
  `/de/en/flynet` and the others. Links to pages xx/zh does not have stay on www.
- **cn/zh, hk/zh, tw/zh, 7**: the three homepages (homepage template) and cn/zh's four own pages
  (info template): `irreg-handling-plan` (its handling of flight irregularities),
  `local-page/cn-ewallet-payment` (e-wallet payment at the airport counters),
  `local-page/promocode-100--anniversary-1` (the document `promocode-100-anniversary-1`: Edge
  Delivery names have no double dash; the centenary promo code, 600 yuan off) and `wechat-profile` (the
  official WeChat account with its QR code; the capture lists it with the comparison pages, www's
  market-only list as an own page). hk/zh has no own pages; tw/zh's one was not captured (above).
  The roots' links into their own root are relative where the root has the document; their
  homepages' 11 others stay on www until the roots have locale rows, as for hk's.
- **Images**: the four homepages carry the Instagram logo as its converted PNG already in DA (the
  SVG is over Edge Delivery's 40 KB, as for Portuguese and Traditional Chinese).
  `postprocess-media.mjs --no-download` swapped three broken originals for their renditions
  (`100-years/history`, `check-in-with-the-family`, `unterhaltung-an-bord`). It could not apply
  the manifest's other conversions: their files sit under `content/media-da/media-da/`, not where
  the manifest says, and this workspace downloads nothing. The first preview of
  `lounge-companions` and `passengers-with-sensory-impairment` answered 409 (a 32 MB JPEG
  original, two SVGs over 40 KB). So in 29 documents every www image the manifest has converted
  (33 images) now links its converted copy, which DA already has: the same copies de/en's
  documents use. No image was converted or uploaded anew.
- **The forms** keep their ids: `add-sports-baggage`, `anmeldung-tiere-frachtraum`,
  `feedback-past-flight`, `group-travel`, `passenger-receipt-90`, `register-animal-cabin` and
  `special-needs` link their confirmation documents (relative). `register-ammunition` goes to a
  **confirmation of xx/zh's own** that no list had,
  `.../register-sporting-firearm1/confirmation` (as xx/pt's and xx/hk's). Its success row stays
  on www until it is captured: `16-zh-confirmations-own.txt` lists it for the local capture.
  Unlike xx/hk, xx/zh's `register-animal/confirmation` was captured, so `register-animal-cabin`'s
  success row is relative.
- `tools/importer/sites/lh-com.json` lists the 271 (added at the end).
- **How it renders on preview** (xx/zh's homepage and `lounges`, cn/zh's `wechat-profile`):
  `lang="zh"`, the body Simplified Chinese. Header and footer show de/en's ("Germany | English")
  until zh has its locale rows, as xx/pt, xx/ru and xx/hk did. The homepages' `:tours-and-activities:`
  icon has no file in `/icons/` (404), as on de/en's homepage: shared code, not changed here.

## Left out, and why

- **www's other xx/zh URLs** with no in-scope de/en or de/de counterpart, as for xx/pt, xx/ru and
  xx/hk (aircraft type pages, `configuration/commonheader`, stopover partner pages and others).
  They were not in the capture list.
- **The roots' comparison pages** (`flights`, `airport-information`, `additional-services` of
  cn/zh, hk/zh and tw/zh, 9 captured): references for the local-version comparison, not
  documents.

## What zh still needs before it can go live

1. **Locale rows (ema-adobe)**: the values from the homepage captures (`rollout.mjs --rows 16`,
   not applied):

   | Root | name (www's label) | countryName en / de / zh | Airport | Currency |
   | --- | --- | --- | --- | --- |
   | xx/zh (version, documents own) | 其它国家 (Other countries) \| 简体中文 | – / – / 其它国家 (Other countries) | FRA | not on the homepage |
   | cn/zh | 中国内地 (China Mainland) \| 简体中文 | China (Mainland) / China (Mainland) / 中国内地 (China Mainland) | SHA | CNY |
   | hk/zh | 中国香港 (Hong Kong, China) \| 简体中文 | Hong Kong, China / Hong Kong, China / 中国香港 (Hong Kong, China) | HKG | HKD |
   | tw/zh | 中国台湾 (Taiwan, China) \| 简体中文 | Taiwan, China / Taiwan, China / 中国台湾 (Taiwan, China) | TPE | TWD |

   The open points are yours:
   - xx/zh's currency (EUR, as xx/pt's?);
   - the German country names (www gives the English ones);
   - the language code: the rows say `zh`; www's hreflang is `zh` for xx/zh and xx/hk alike.
     Since 76c7f9ca hk pages carry `lang="zh-HK"` (`HTML_LANGS`) and zh pages keep `zh`; whether
     zh's hreflang alternates should say `zh-CN` is open;
   - `languageVersions.zh = xx/zh`; all `pilot`, batch 16.
2. **The roots' nav and footer** from xx/zh's (`root-docs.mjs --from xx/zh --to <root> --doc nav
   --doc footer`), after the rows.
3. **The query indexes** of xx/zh (`search-xx-zh`, `market-model-xx-zh`, `market-llms-xx-zh`, as
   xx/ru's).
4. **The own confirmation** above and **tw/zh's `travel-care`** (where www's redirect goes), from
   the local capture.
5. **The site's remaining texts in Simplified Chinese**: ca8f235e brought the first built-in
   texts in zh; the remaining ones (form, picker options, accordion filter, article dates,
   timetable weekdays) are not in zh yet, as Portuguese's came with 0f5a27f2 and Russian's with
   6e0aed3c.
6. Then a wave. `rollout.mjs --plan 16` gives "17 pages, 3 references; compare pairs 9 (no
   counterpart: none)".
