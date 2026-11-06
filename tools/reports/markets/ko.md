# Korean (ko) for lufthansa.com (batch 20)

Status of 2026-11-05: **imported, uploaded and previewed; nothing published, nothing switched
on.** Imported by the local import harness (Ben 2026-11-05: content imports run locally and are
handed over to an EMA), with the EMAs' own pipeline: `import-batch.mjs` with the network-blocked
bulk importer (`offline-importer.mjs`), `import-nav.bundle.js`, `root-docs.mjs --own-root`,
`postprocess-media.mjs --no-download`, `da-upload.mjs`. Checked first on Greek: the harness
rebuilt xx/el's 264 documents identical to the ones in Document Authoring.

## The language version: xx/ko

`rollout.mjs` had batch 20 as `{ lang: 'ko', version: 'xx/ko', confirm: 'kr/ko' }`, to be
confirmed by the local capture's pilot. **The pilot settled it** (lh-deliveries.json, 2026-11-03 19:34 UTC:
`{"segment": "ko", "pilot": "passed", "version": "xx/ko", "versionHasOwnPages": true, "fallbackUsed": false}`).
xx/ko's pages are Korean (`lang="ko"`) with their own canonical and the label "다른 국가들 | 한국어",
fetched through www's long AEM URLs. So **xx/ko is the version** and **kr/ko is its market root**.
The fallback list `20-ko-kr-ko.txt` was not used.

## Captures

- **The local capture** (`20-ko.txt`, `20-ko-confirmations.txt`, `20-ko-aliases.txt`): 5
  archives, `lh-snapshots-051`, `-052` and `-053` (pages), `-049` (confirmations) and `-050` (aliases), **268 pages** (lh-deliveries.json: `{"segment": "ko", "complete": true}`).
  Each archive's sha256 and each page's sha256 in its manifest were checked; every entry is a
  regular file inside the archive; each archive was unpacked into its own empty folder and applied
  in order. No archive replaces another's pages.
- **The checks, as el.md's adapted to Korean**: each page must have `lang="ko"`, be in Korean
  (Hangul words at least half the Latin words in its own text, header, nav and footer left out), have its own canonical and its own URL or www's
  long AEM URL as final URL, and be neither a challenge page nor an empty shell. **None looked
  wrong.** The three form pages with the most Latin text (`anmeldung-tiere-frachtraum`, `feedback-past-flight`, `register-animal-cabin`) are Korean in title and headings; the Latin is form markup. 23 pages have no H1, as on www (the same kind as for the other
  languages: `100-years/*`, `320`, `32n`, `boeing787`, `seat-maps`, `culinaryjourney` and others).
- **Not captured: 7**, as the index lists them (the capture's probes, all www 404s): the five
  alias URLs (`business-class`, `digital-travel-companion`, `flynet`, `freigepaeck-regeln`,
  `lounges`), `lufthansa-city/menu-card` and `.../register-sporting-firearm/confirmation` (de/en's
  path; xx/ko's ammunition form goes to another one, below).

## Documents (DA and preview, not published)

**267 documents. All 267 answer 200 on preview and carry the same text in DA** (every document read
back: preview's `.plain.html` and DA's source against the local document):
- **xx/ko, 263**:
  - 250 pages, each by the template of its de/en counterpart in www's page groups (homepage 1, hub 16, campaign 21, fleet 8, info 164, legal 29, form 5, app-entry 5, flight-status 1);
  - the 6 form confirmation pages captured (info, as de/en's);
  - **the five alias documents** `business-class`, `digital-travel-companion`, `flynet`,
    `freigepaeck-regeln` and `lounges`: documents under the alias paths, imported from the
    captures of their real pages (alias archive) by their de/en counterparts' templates (info;
    lounges hub). No document under the real paths;
  - its nav and footer from its homepage capture (`import-nav.bundle.js`: Korean labels,
    "다른 국가들 | 한국어").

  Links into xx/ko are relative where it has the document (`root-docs.mjs --own-root xx/ko`: 1,398
  links); the 59 links in 42 documents to the alias pages' real paths go to the alias documents,
  as de/en's link them. Links to pages xx/ko does not have stay on www.
- **kr/ko, 4**: the homepage (homepage template) and kr/ko's three own pages (info template): `local-page/klook`, `local-page/korea-customer-info` and `local-page/muc-citypass`.
  The root's links into its own root are relative where it has the document (4 links); its homepage's
  other links into the root stay on www until the root has locale rows, as for the other languages.
- **Images**: the homepages carry the Instagram logo as its converted PNG already in DA; 35
  images in 31 documents (the homepages included) link the converted copies DA already has
  (the media manifest's conversions, the same copies de/en's documents use);
  `postprocess-media.mjs --no-download` swapped three broken originals for their renditions
  (`100-years/history`, `check-in-with-the-family`, `unterhaltung-an-bord`). Nothing over the limits
  (267 documents, 0 failing); no image converted or uploaded anew.
- **The forms** keep their ids: `add-sports-baggage` (on `sportgepaeck-hinzufuegen`),
  `anmeldung-tiere-frachtraum`, `feedback-past-flight`, `group-travel`, `passenger-receipt-90`,
  `register-animal-cabin` and `special-needs` link their confirmation documents (relative).
  `register-ammunition` goes to xx/ko's own `.../register-sporting-firearm1/confirmation` (as the
  other languages'), which no list had: its success row stays on www until it is captured.
  `passenger-receipt-90` and its confirmation (and the other confirmations' "Thank you for your
  enquiry") are English inside Korean page chrome on www itself; imported as www has them.
- `tools/importer/sites/lh-com.json` lists the 267 (added at the end).

## Left out, and why

- **www's other xx/ko URLs** with no in-scope de/en or de/de counterpart, as for the other
  languages. They were not in the capture list.
- **The root's comparison pages** (`flights`, `airport-information`, `additional-services` of
  kr/ko, 3 captured): references for the local-version comparison, not documents.

## What ko still needs before it can go live

Done since (2026-11-06): **the locale rows** as the table below proposes them, all pilot behind the switch (no wave; `languageVersions.ko = xx/ko`), with the user's calls: kr/ko's currency KRW (its fare teaser's prices); hreflang ko, ko-KR; **the built-in texts** in this language (the picker options, the accordion filter, the article dates; `test/languages-17-21.test.mjs`); **the own confirmation's list**: `20-ko-confirmations-own.txt` written (on main), for the capture. **The roots' nav and footer** (kr/ko) and the roots' homepages' links into their root (`root-docs.mjs --own-root` again, now that the roots have rows): commands and path lists for the local harness in `root-docs-harness.md`, not run yet. The query indexes come in a later brief.

1. **Locale rows (an EMA: `tools/markets/locale-data.json`, `scripts/locale-table.js` are shared)**:
   the values from the homepage captures (`rollout.mjs --rows 20`, not applied):

   | Root | name (www's label) | countryName en / de / ko | Airport | Currency |
   | --- | --- | --- | --- | --- |
   | xx/ko (version, documents own) | 다른 국가들 \| 한국어 | – / – / 다른 국가들 | FRA | EUR |
   | kr/ko | 대한민국 \| 한국어 | Korea, Republic of / Korea, Republik / 대한민국 | SEL | KRW |

   The open points:
   - kr/ko's currency: `--rows 20` gives EUR (the only price text on the homepage capture is a "€10" offer), but all 15 price elements of the fare teaser carry `currency="KRW"`; the table above has KRW;
   - hreflang of the root (`ko-KR`?);
   - `languageVersions.ko = xx/ko`; all `pilot`, batch 20;
2. **The root's nav and footer** from xx/ko's (`root-docs.mjs --from xx/ko --to kr/ko --doc nav
   --doc footer`), after the rows.
3. **The query indexes** of xx/ko (`search-xx-ko`, `market-model-xx-ko`, `market-llms-xx-ko`, as xx/zh's).
4. **The own confirmation** above (`xx/ko/prepare-for-your-trip/baggage/sport-baggage/register-sporting-firearm1/confirmation`),
   from the local capture (a `20-ko-confirmations-own.txt` list, as `18-el-confirmations-own.txt`).
5. **The site's remaining texts in Korean**: most blocks already carry `ko`; check the picker
   options, the accordion filter and the article dates, as for el.
6. Then a wave. `rollout.mjs --plan 20` gives "7 pages, 3 references; compare pairs 3 (no counterpart: none)".
