# Traditional Chinese (hk) for lufthansa.com (batch 15)

Status of 2026-11-03: **imported, uploaded and previewed; nothing published, nothing switched
on.**

## The language version: xx/hk

`rollout.mjs` had batch 15 as `{ lang: 'hk', version: 'xx/hk', confirm: 'hk/hk' }`, to be confirmed
by the local capture's pilot. **The pilot settled it** (lh-deliveries.json: `{"segment": "hk",
"pilot": "passed", "version": "xx/hk", "versionHasOwnPages": true, "fallbackUsed": false}`).
xx/hk's pages are Traditional Chinese with their own canonical and the label "其他国家 | 繁體中文"
(www writes 其他国家 in simplified characters), fetched through www's long AEM URLs. So **xx/hk is
the version** and **cn/hk, hk/hk and tw/hk are its market roots** (`test/markets-languages.test.mjs`).
The fallback list `15-hk-hk-hk.txt` was not used.

## Captures

- **The local capture** (`15-hk.txt`, `15-hk-confirmations.txt`): `lh-snapshots-012`, `-014`,
  `-015` and `-017` (pages) and `-016` (confirmations), **270 pages** (lh-deliveries.json: `{"segment":
  "hk", "complete": true, "archives": 5}`). Each archive's sha256 and each page's sha256 in its
  manifest were checked, and every entry is a regular file inside the archive. They were unpacked in
  order: **017 replaces 14 pages of 015** (`services-on-board` to `tiere-als-uebergepaeck`; imported
  again, 2 documents changed).
- **The checks, adapted to hk**: www's hk pages carry `lang="en-US"` (the capture's pilot notes
  it) and tw/hk's `lang="tw"`, so the language check is by the text. Each page must:
  - be in Chinese: a third of the text units are CJK characters (one character against one Latin
    word: www's chrome lists the countries in English on every page);
  - be Traditional: more Traditional-only than Simplified-only characters among those common on
    the pages (這/这, 國/国, 預/预 …);
  - have its own canonical and final URL, and be neither a challenge page nor an empty shell.

  **None looked wrong.** A first version of the check measured Latin letters against characters
  and flagged 23 real pages; it was stopped before any upload, corrected, and archive 012 was
  checked again. 23 pages have no H1, as on www (the same pages as for Russian: `100-years/*`,
  `320`, `32n`, `boeing787`, `seat-maps`, `timetable-and-flight-status` and others).
- **Not captured: 8, all www 404s** (the capture's probes):
  - the five alias URLs (`business-class`, `digital-travel-companion`, `flynet`,
    `freigepaeck-regeln`, `lounges`) and `lufthansa-city/menu-card`, as for xx/pt and xx/ru;
  - two confirmations under de/en's paths (`.../register-sporting-firearm/confirmation`,
    `.../register-animal/confirmation`): xx/hk's forms go to other ones (below).

## Documents (DA and preview, not published)

**263 documents. All 263 answer 200 on preview and carry the same text in DA:**
- **xx/hk, 258**:
  - 250 pages, each by the template of its de/en counterpart (homepage 1, hub 16, campaign 21,
    fleet 8, info 165, legal 29, form 5, app-entry 5, flight-status 1);
  - the 5 form confirmation pages captured (info);
  - its nav and footer from its homepage capture (Traditional Chinese labels, "其他国家 | 繁體中文").

  Links into xx/hk are relative where it has the document, run again after each archive.
- **cn/hk, hk/hk, tw/hk, 5**: the three homepages and hk/hk's two own pages
  `local-page/hk-black-friday-deals` (the Black Friday Economy Flex fares) and
  `local-page/upstream-hkg-hk` (upstream check-in from Macau and Shenzhen); cn/hk and tw/hk have
  no own pages. The hk/hk and cn/hk homepages carry the Instagram logo as its converted PNG (the
  SVG is over Edge Delivery's 40 KB; the first preview answered 409, as for Portuguese).
- **The forms** keep their ids: `add-sports-baggage`, `anmeldung-tiere-frachtraum`,
  `feedback-past-flight`, `group-travel`, `passenger-receipt-90`, `special-needs` (their success
  rows link their confirmation documents, relative), `register-ammunition` and
  `register-animal-cabin`. **These last two go to confirmations of xx/hk's own** that no list had:
  `.../register-sporting-firearm1/confirmation` (as xx/pt's) and
  `.../travelling-with-animals/register-animal/thank-you-confirmation`. Their success rows stay on
  www until those are captured: `15-hk-confirmations-own.txt` lists the two for the local capture.
- `tools/importer/sites/lh-com.json` lists the 263 (added at the end).
- **How it renders on preview**: xx/hk's body is Traditional Chinese. Header and footer show
  de/en's until hk has its locale rows, as xx/pt and xx/ru did.

## Left out, and why

- **78 of www's xx/hk URLs** have no in-scope de/en or de/de counterpart, as for xx/pt and xx/ru
  (aircraft type pages, `configuration/commonheader`, stopover partner pages and others). They
  were not in the capture list.
- **The five aliases**: `15-hk-aliases.txt` (5a716374) lists their real pages for the local
  capture. They become documents under the alias paths, as xx/pt's, when an archive brings them.
- **The roots' comparison pages** (`flights`, `airport-information`, `additional-services` of
  cn/hk, hk/hk and tw/hk, 9 captured): references for the local-version comparison, not documents.

## What hk still needs before it can go live

1. **Locale rows (ema-adobe)**: the values from the homepage captures (`rollout.mjs --rows 15`,
   not applied):

   | Root | name (www's label) | countryName en / de / hk | Airport | Currency |
   | --- | --- | --- | --- | --- |
   | xx/hk (version, documents own) | 其他国家 \| 繁體中文 | – / – / 其他国家 | FRA | not on the homepage |
   | cn/hk | China (Mainland) \| 繁體中文 | China (Mainland) / China (Mainland) / China (Mainland) | SHA | not on the homepage |
   | hk/hk | Hong Kong, China \| 繁體中文 | Hong Kong, China / Hong Kong, China / Hong Kong, China | HKG | not on the homepage |
   | tw/hk | Taiwan, China \| 繁體中文 | Taiwan, China / Taiwan, China / Taiwan, China | TPE | not on the homepage |

   The open points are yours:
   - all four currencies;
   - the German country names (www gives the English ones);
   - the Chinese names (www's labels are in English);
   - the language code: the rows say `hk`, while www's hreflang is `zh-HK`;
   - `languageVersions.hk = xx/hk`; all `pilot`, batch 15.
2. **The roots' nav and footer** from xx/hk's (`root-docs.mjs --from xx/hk --to <root>`), after
   the rows.
3. **The query indexes** of xx/hk (`search-xx-hk`, `market-model-xx-hk`, `market-llms-xx-hk`, as
   xx/ru's).
4. **The two own confirmations** above and **the five alias documents**, from the local capture.
5. **The site's texts in Traditional Chinese.**
6. Then a wave. `rollout.mjs --plan 15` gives "14 pages, 3 references; compare pairs 9 (no
   counterpart: none)".
