# Japanese (ja) for lufthansa.com (batch 19)

Status of 2026-11-05: **imported, uploaded and previewed; nothing published, nothing switched
on.** Imported by the local import harness (Ben 2026-11-05: content imports run locally and are
handed over to an EMA), with the EMAs' own pipeline: `import-batch.mjs` with the network-blocked
bulk importer (`offline-importer.mjs`), `import-nav.bundle.js`, `root-docs.mjs --own-root`,
`postprocess-media.mjs --no-download`, `da-upload.mjs`. Checked first on Greek: the harness
rebuilt xx/el's 264 documents identical to the ones in Document Authoring.
The EMA import stopped on 2026-11-04 02:18 had uploaded nothing: Document Authoring had no
document under xx/ja or jp/ja on 2026-11-05 21:05, so all 269 documents come from this run.

## The language version: xx/ja

`rollout.mjs` had batch 19 as `{ lang: 'ja', version: 'xx/ja', confirm: 'jp/ja' }`, to be
confirmed by the local capture's pilot. **The pilot settled it** (lh-deliveries.json, 2026-11-03 18:37 UTC:
`{"segment": "ja", "pilot": "passed", "version": "xx/ja", "versionHasOwnPages": true, "fallbackUsed": false}`).
xx/ja's pages are Japanese (`lang="ja"`) with their own canonical and the label "その他の国 | 日本語",
fetched through www's long AEM URLs. So **xx/ja is the version** and **jp/ja is its market root**.
The fallback list `19-ja-jp-ja.txt` was not used.

## Captures

- **The local capture** (`19-ja.txt`, `19-ja-confirmations.txt`, `19-ja-aliases.txt`): 5
  archives, `lh-snapshots-046`, `-047` and `-048` (pages), `-044` (confirmations) and `-045` (aliases), **270 pages** (lh-deliveries.json: `{"segment": "ja", "complete": true}`).
  Each archive's sha256 and each page's sha256 in its manifest were checked; every entry is a
  regular file inside the archive; each archive was unpacked into its own empty folder and applied
  in order. No archive replaces another's pages.
- **The checks, as el.md's adapted to Japanese**: each page must have `lang="ja"`, be in Japanese
  (Japanese script (kana and kanji) at least half the Latin words in its own text, header, nav and footer left out), have its own canonical and its own URL or www's
  long AEM URL as final URL, and be neither a challenge page nor an empty shell. **None looked
  wrong.** Five pages are English inside Japanese page chrome on www itself: `passenger-receipt-90` and four form confirmations ("Thank you for your enquiry"). 24 pages have no H1, as on www (the same kind as for the other
  languages: `100-years/*`, `320`, `32n`, `boeing787`, `seat-maps`, `culinaryjourney` and others).
- **Not captured: 7**, as the index lists them (the capture's probes, all www 404s): the five
  alias URLs (`business-class`, `digital-travel-companion`, `flynet`, `freigepaeck-regeln`,
  `lounges`), `lufthansa-city/menu-card` and `.../register-sporting-firearm/confirmation` (de/en's
  path; xx/ja's ammunition form goes to another one, below).

## Documents (DA and preview, not published)

**269 documents. All 269 answer 200 on preview and carry the same text in DA** (every document read
back: preview's `.plain.html` and DA's source against the local document):
- **xx/ja, 264**:
  - 251 pages, each by the template of its de/en counterpart in www's page groups (homepage 1, hub 16, campaign 21, fleet 8, info 165, legal 29, form 5, app-entry 5, flight-status 1);
  - the 6 form confirmation pages captured (info, as de/en's);
  - **the five alias documents** `business-class`, `digital-travel-companion`, `flynet`,
    `freigepaeck-regeln` and `lounges`: documents under the alias paths, imported from the
    captures of their real pages (alias archive) by their de/en counterparts' templates (info;
    lounges hub). No document under the real paths;
  - its nav and footer from its homepage capture (`import-nav.bundle.js`: Japanese labels,
    "その他の国 | 日本語").

  Links into xx/ja are relative where it has the document (`root-docs.mjs --own-root xx/ja`: 1,406
  links); the 61 links in 43 documents to the alias pages' real paths go to the alias documents,
  as de/en's link them. Links to pages xx/ja does not have stay on www.
- **jp/ja, 5**: the homepage (homepage template) and jp/ja's four own pages (info template): `local-page/information-for-customers`, its `japan-fuel-surcharge`, `local-page/student-offer-error` and `student-offer-thanks`.
  The root's links into its own root are relative where it has the document (6 links); its homepage's
  other links into the root stay on www until the root has locale rows, as for the other languages.
- **Images**: the homepages carry the Instagram logo as its converted PNG already in DA; 35
  images in 31 documents (the homepages included) link the converted copies DA already has
  (the media manifest's conversions, the same copies de/en's documents use);
  `postprocess-media.mjs --no-download` swapped three broken originals for their renditions
  (`100-years/history`, `check-in-with-the-family`, `unterhaltung-an-bord`). Nothing over the limits
  (269 documents, 0 failing); no image converted or uploaded anew.
- **The forms** keep their ids: `add-sports-baggage` (on `sportgepaeck-hinzufuegen`),
  `anmeldung-tiere-frachtraum`, `feedback-past-flight`, `group-travel`, `passenger-receipt-90`,
  `register-animal-cabin` and `special-needs` link their confirmation documents (relative).
  `register-ammunition` goes to xx/ja's own `.../register-sporting-firearm1/confirmation` (as the
  other languages'), which no list had: its success row stays on www until it is captured.
  `passenger-receipt-90` and its confirmation (and the other confirmations' "Thank you for your
  enquiry") are English inside Japanese page chrome on www itself; imported as www has them.
- `tools/importer/sites/lh-com.json` lists the 269 (added at the end).

## Left out, and why

- **www's other xx/ja URLs** with no in-scope de/en or de/de counterpart, as for the other
  languages. They were not in the capture list.
- **The root's comparison pages** (`flights`, `airport-information`, `additional-services` of
  jp/ja, 3 captured): references for the local-version comparison, not documents.

## What ja still needs before it can go live

Done since (2026-11-06): **the locale rows** as the table below proposes them, all pilot behind the switch (no wave; `languageVersions.ja = xx/ja`), with the user's calls: jp/ja's label as www writes it ("Japan | 日本語", countryName.ja "Japan" as `--rows 19`); hreflang ja, ja-JP; **the built-in texts** in this language (the picker options, the accordion filter, the article dates; `test/languages-17-21.test.mjs`); **the own confirmation's list**: `19-ja-confirmations-own.txt` written (on main), for the capture. **The roots' nav and footer** (jp/ja) and the roots' homepages' links into their root (`root-docs.mjs --own-root` again, now that the roots have rows): commands and path lists for the local harness in `root-docs-harness.md`, not run yet. The query indexes come in a later brief.

1. **Locale rows (an EMA: `tools/markets/locale-data.json`, `scripts/locale-table.js` are shared)**:
   the values from the homepage captures (`rollout.mjs --rows 19`, not applied):

   | Root | name (www's label) | countryName en / de / ja | Airport | Currency |
   | --- | --- | --- | --- | --- |
   | xx/ja (version, documents own) | その他の国 \| 日本語 | – / – / その他の国 | FRA | EUR |
   | jp/ja | Japan \| 日本語 | Japan / Japan / Japan | TYO | JPY |

   The open points:
   - jp/ja's label: www writes the country in English ("Japan | 日本語"), so `--rows 19` gives "Japan" as the Japanese country name too; keep www's label or use 日本 for `countryName.ja`;
   - hreflang of the root (`ja-JP`?);
   - `languageVersions.ja = xx/ja`; all `pilot`, batch 19;
2. **The root's nav and footer** from xx/ja's (`root-docs.mjs --from xx/ja --to jp/ja --doc nav
   --doc footer`), after the rows.
3. **The query indexes** of xx/ja (`search-xx-ja`, `market-model-xx-ja`, `market-llms-xx-ja`, as xx/zh's).
4. **The own confirmation** above (`xx/ja/prepare-for-your-trip/baggage/sport-baggage/register-sporting-firearm1/confirmation`),
   from the local capture (a `19-ja-confirmations-own.txt` list, as `18-el-confirmations-own.txt`).
5. **The site's remaining texts in Japanese**: most blocks already carry `ja`; check the picker
   options, the accordion filter and the article dates, as for el.
6. Then a wave. `rollout.mjs --plan 19` gives "8 pages, 3 references; compare pairs 3 (no counterpart: none)".
