# Greek (el) for lufthansa.com (batch 18)

Status of 2026-11-04: **imported, uploaded and previewed; nothing published, nothing switched
on.**

## The language version: xx/el

`rollout.mjs` had batch 18 as `{ lang: 'el', version: 'xx/el', confirm: 'gr/el' }`, to be confirmed
by the local capture's pilot. **The pilot settled it** (lh-deliveries.json: `{"segment": "el",
"pilot": "passed", "version": "xx/el", "versionHasOwnPages": true, "fallbackUsed": false}`).
xx/el's pages are Greek (`lang="el"`) with their own canonical and the label "Παγκόσμιος
ιστότοπος | Ελληνικά", fetched through www's long AEM URLs. So **xx/el is the version** and **cy/el
and gr/el are its market roots**. The fallback list `18-el-gr-el.txt` was not used.

## Captures

- **The local capture** (`18-el.txt`, `18-el-confirmations.txt`, `18-el-aliases.txt`): six
  archives, `lh-snapshots-039`, `-041` and `-042` (pages), `-037` and `-040` (confirmations) and
  `-038` (aliases), **268 pages** (lh-deliveries.json: `{"segment": "el", "complete": true,
  "archives": 6}`). Each archive's sha256 and each page's sha256 in its manifest were checked;
  every entry is a regular file inside the archive; each archive was unpacked into its own empty
  folder, and applied in order: **040 replaces 037's**
  `book-and-manage/passenger-receipt-90days/confirmation`.
- **The checks, as it.md's adapted to Greek**: each page must have `lang="el"`, be in Greek (Greek
  words at least half the Latin ones in its own text, header, nav and footer left out), have its
  own canonical and its own URL or www's long AEM URL as final URL, and be neither a challenge page
  nor an empty shell. **None looked wrong.** The page with the most Latin words is
  `security-fast-lanes` (its list of airports). 23 pages have no H1, as on www (the same kind as for
  the other languages: `100-years/*`, `320`, `32n`, `boeing787`, `seat-maps`, `culinaryjourney` and
  others).
- **Not captured: 7**, as the index lists them (the capture's probes, all www 404s): the five
  alias URLs (`business-class`, `digital-travel-companion`, `flynet`, `freigepaeck-regeln`,
  `lounges`), `lufthansa-city/menu-card` and `.../register-sporting-firearm/confirmation` (de/en's
  path; xx/el's ammunition form goes to another one, below).

## Documents (DA and preview, not published)

**264 documents. All 264 answer 200 on preview and carry the same text in DA** (preview's text
against DA's without the metadata tables; DA's against the local document's):
- **xx/el, 262**:
  - 249 pages, each by the template of its de/en counterpart in www's page groups (homepage 1,
    hub 16, campaign 21, fleet 8, info 163, legal 29, form 5, app-entry 5, flight-status 1);
  - the 6 form confirmation pages captured (info, as de/en's);
  - **the five alias documents** `business-class`, `digital-travel-companion`, `flynet`,
    `freigepaeck-regeln` and `lounges`: documents under the alias paths, imported from the
    captures of their real pages (archive 038) by their de/en counterparts' templates (info;
    lounges hub). No document under the real paths;
  - its nav and footer from its homepage capture (`import-nav.bundle.js`: Greek labels,
    "Παγκόσμιος ιστότοπος | Ελληνικά").

  Links into xx/el are relative where it has the document (`root-docs.mjs --own-root xx/el`: 1,338
  links); the 59 links in 42 documents to the alias pages' real paths go to the alias documents,
  as de/en's link them. Links to pages xx/el does not have stay on www.
- **cy/el, gr/el, 2**: the two homepages (homepage template). Neither root has own pages
  (`rollout.mjs ownPages`). Their homepages' 11 links into the root stay on www until the roots
  have locale rows, as for the other languages.
- **Images**: the three homepages carry the Instagram logo as its converted PNG already in DA; 33
  images in 29 documents link the converted copies DA already has (the media manifest's
  conversions, the same copies de/en's documents use); `postprocess-media.mjs --no-download`
  swapped three broken originals for their renditions (`100-years/history`,
  `check-in-with-the-family`, `unterhaltung-an-bord`). Nothing over the limits; no image converted
  or uploaded anew.
- **The forms** keep their ids: `add-sports-baggage`, `anmeldung-tiere-frachtraum`,
  `feedback-past-flight`, `group-travel`, `passenger-receipt-90`, `register-animal-cabin` and
  `special-needs` link their confirmation documents (relative). `register-ammunition` goes to
  xx/el's own `.../register-ammunition1/confirmation1` (a path of its own, unlike the other
  languages' `register-sporting-firearm1/confirmation`), which no list had: its success row stays
  on www until it is captured; `18-el-confirmations-own.txt` lists it for the local capture.
- `tools/importer/sites/lh-com.json` lists the 264 (added at the end).
- **How it renders on preview**: `lang="el"`, the body Greek; header and footer de/en's until el
  has its locale rows, as for the other languages before theirs.

## Left out, and why

- **www's other xx/el URLs** with no in-scope de/en or de/de counterpart, as for the other
  languages. They were not in the capture list.
- **The roots' comparison pages** (`flights`, `airport-information`, `additional-services` of
  cy/el and gr/el, 6 captured): references for the local-version comparison, not documents.

## What el still needs before it can go live

1. **Locale rows (ema-adobe)**: the values from the homepage captures (`rollout.mjs --rows 18`,
   not applied):

   | Root | name (www's label) | countryName en / de / el | Airport | Currency |
   | --- | --- | --- | --- | --- |
   | xx/el (version, documents own) | Παγκόσμιος ιστότοπος \| Ελληνικά | – / – / Παγκόσμιος ιστότοπος | FRA | EUR |
   | cy/el | Κύπρος \| Ελληνικά | Cyprus / Zypern / Κύπρος | LCA | EUR |
   | gr/el | Ελλάδα \| Ελληνικά | Greece / Griechenland / Ελλάδα | ATH | EUR |

   The open points are yours: xx/el's label ("Παγκόσμιος ιστότοπος", "global site", where the other
   versions say "other countries"); the hreflang of the roots (`el-CY`, `el-GR`?);
   `languageVersions.el = xx/el`; all `pilot`, batch 18.
2. **The roots' nav and footer** from xx/el's (`root-docs.mjs --from xx/el --to <root> --doc nav
   --doc footer`), after the rows.
3. **The query indexes** of xx/el (`search-xx-el`, `market-model-xx-el`, `market-llms-xx-el`).
4. **The own confirmation** above, from the local capture.
5. **The site's remaining texts in Greek**: the form and the timetable have `el`; the picker
   options, the accordion filter and the article dates do not.
6. Then a wave. `rollout.mjs --plan 18` gives "8 pages, 3 references; compare pairs 6 (no
   counterpart: none)".
