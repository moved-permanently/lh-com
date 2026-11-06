# Italian (it) for lufthansa.com (batch 17)

Status of 2026-11-03: **imported, uploaded and previewed; nothing published, nothing switched
on.**

## The language version: xx/it

`rollout.mjs` had batch 17 as `{ lang: 'it', version: 'xx/it', confirm: 'it/it' }`, to be confirmed
by the local capture's pilot. **The pilot settled it** (lh-deliveries.json: `{"segment": "it",
"pilot": "passed", "version": "xx/it", "versionHasOwnPages": true, "fallbackUsed": false}`).
xx/it's pages are Italian (`lang="it"`) with their own canonical and the label "Altri paesi |
Italiano", fetched through www's long AEM URLs. So **xx/it is the version** and **ch/it and it/it
are its market roots**. The fallback list `17-it-it-it.txt` was not used.

## Captures

- **The local capture** (`17-it.txt`, `17-it-confirmations.txt`, `17-it-aliases.txt`): five
  archives, `lh-snapshots-032`, `-033` and `-034` (pages), `-031` (confirmations) and `-035`
  (aliases), **279 pages** (lh-deliveries.json: `{"segment": "it", "complete": true, "archives":
  5}`). Each archive's sha256 and each page's sha256 in its manifest were checked; every entry is a
  regular file inside the archive (no absolute path, no `..`); each archive was unpacked into its
  own empty folder. No archive replaces another's pages.
- **The checks, as zh.md's adapted to Italian**: each page must have `lang="it"`, be in Italian (more
  Italian than English function words in its own text, header, nav and footer left out), have its
  own canonical and its own URL or www's long AEM URL as final URL, and be neither a challenge page
  nor an empty shell. **None looked wrong.** Two pages are English inside Italian page chrome on
  www itself: `passenger-receipt-90` (the passenger receipt form for journeys over 90 days ago) and
  its `book-and-manage/passenger-receipt-90days/confirmation`; imported as www has them. 24 pages
  have no H1, as on www (the same kind as for the other languages: `100-years/*`, `320`, `32n`,
  `boeing787`, `seat-maps`, `timetable-and-flight-status`, `culinaryjourney` and others).
- **Not captured: 8**, as the index lists them (the capture's probes, all www 404s):
  - the five alias URLs (`business-class`, `digital-travel-companion`, `flynet`,
    `freigepaeck-regeln`, `lounges`) and `lufthansa-city/menu-card`, as for the other languages;
  - `.../register-sporting-firearm/confirmation` (de/en's path; xx/it's ammunition form goes to
    another one, below);
  - `articles/highlights/allegris-typologies`.

## Documents (DA and preview, not published)

**275 documents. All 275 answer 200 on preview and carry the same text in DA** (preview's text
against DA's without the metadata tables; DA's against the local document's):
- **xx/it, 271**:
  - 258 pages, each by the template of its de/en counterpart in www's page groups (homepage 1,
    hub 16, campaign 21, fleet 6, info 164, legal 29, form 5, insights 10, app-entry 5,
    flight-status 1). Unlike zh, Italian has the Allegris articles (insights: `articles/highlights`
    and seven articles, `articles/tags` and its `allegris-inspires` page);
  - the 6 form confirmation pages captured (info, as de/en's);
  - **the five alias documents** `business-class`, `digital-travel-companion`, `flynet`,
    `freigepaeck-regeln` and `lounges`, as xx/zh's: documents under the alias paths, imported from
    the captures of their real pages (archive 035) by their de/en counterparts' templates (info;
    lounges hub). No document under the real paths;
  - its nav and footer from its homepage capture (`import-nav.bundle.js`: Italian labels, "Altri
    paesi | Italiano").

  Links into xx/it are relative where it has the document (`root-docs.mjs --own-root xx/it`: 1,339
  links); the 61 links in 43 documents to the alias pages' real paths go to the alias documents,
  as de/en's link them. Links to pages xx/it does not have stay on www.
- **ch/it, it/it, 4**: the two homepages (homepage template) and it/it's two own pages
  `book-and-manage/offers-and-destination/generic_offer_chicago` and `generic_offer_miami` (info
  template; documents `generic-offer-chicago` and `generic-offer-miami`: Edge Delivery names have
  no underscores). ch/it has no own pages. The roots' links into their own root are relative where
  the root has the document; their homepages' 10 others stay on www until the roots have locale
  rows, as for hk's and zh's.
- **Images**: the three homepages carry the Instagram logo as its converted PNG already in DA (as
  for the other languages); in 30 documents every www image the media manifest has converted links
  its converted copy, which DA already has (the same copies de/en's documents use: the step zh.md
  describes); `postprocess-media.mjs --no-download` swapped three broken originals for their
  renditions (`100-years/history`, `check-in-with-the-family`, `unterhaltung-an-bord`). Nothing
  over the limits; no image converted or uploaded anew.
- **The forms** keep their ids: `add-sports-baggage` (on `sportgepaeck-hinzufuegen`),
  `anmeldung-tiere-frachtraum`, `feedback-past-flight`, `group-travel`, `passenger-receipt-90`,
  `register-animal-cabin` and `special-needs` link their confirmation documents (relative).
  `register-ammunition` goes to xx/it's own `.../register-sporting-firearm1/confirmation`, which
  no list had (as xx/pt's, xx/hk's and xx/zh's): its success row stays on www until it is
  captured; `17-it-confirmations-own.txt` lists it for the local capture.
- `tools/importer/sites/lh-com.json` lists the 275 (added at the end).
- **How it renders on preview** (xx/it's homepage and `lounges`, it/it's `generic-offer-chicago`):
  `lang="it"`, the body Italian, every image loads. Header and footer show de/en's ("Germany |
  English") until it has its locale rows, as for the other languages before theirs.

## Left out, and why

- **www's other xx/it URLs** with no in-scope de/en or de/de counterpart, as for the other
  languages (aircraft type pages, `configuration/commonheader`, stopover partner pages and others).
  They were not in the capture list.
- **The roots' comparison pages** (`flights`, `airport-information`, `additional-services` of
  ch/it and it/it, 6 captured): references for the local-version comparison, not documents (the
  capture lists ch/it's under its plan and it/it's two offers among the references; they were told
  apart by their paths and by `rollout.mjs ownPages`).

## What it still needs before it can go live

Done since (2026-11-06): **the locale rows** as the table below proposes them, all pilot behind the switch (no wave; `languageVersions.it = xx/it`), with the user's calls: it/it's country names the right way round (Italy / Italien); hreflang it, it-CH, it-IT; **the built-in texts** in this language (the picker options, the accordion filter, the article dates; `test/languages-17-21.test.mjs`); **the own confirmation's list**: `17-it-confirmations-own.txt` (on main before) waits for the capture. **The roots' nav and footer** (ch/it and it/it) and the roots' homepages' links into their root (`root-docs.mjs --own-root` again, now that the roots have rows): commands and path lists for the local harness in `root-docs-harness.md`, not run yet. The query indexes come in a later brief.

1. **Locale rows (ema-adobe)**: the values from the homepage captures (`rollout.mjs --rows 17`,
   not applied):

   | Root | name (www's label) | countryName en / de / it | Airport | Currency |
   | --- | --- | --- | --- | --- |
   | xx/it (version, documents own) | Altri paesi \| Italiano | – / – / Altri paesi | FRA | EUR |
   | ch/it | Svizzera \| Italiano | Switzerland / Schweiz / Svizzera | ZRH | CHF |
   | it/it | Italia \| Italiano | Italy / Italien / Italia | MIL | EUR |

   The open points are yours:
   - **it/it's country names**: `--rows 17` gives en "Italien" and de "Italy", the two swapped
     (ch/it's are right); the table above has them the right way round;
   - the language code `it` and hreflang (`it-CH`, `it-IT` for the roots?);
   - `languageVersions.it = xx/it`; all `pilot`, batch 17.
2. **The roots' nav and footer** from xx/it's (`root-docs.mjs --from xx/it --to <root> --doc nav
   --doc footer`), after the rows (as done this turn for hk's and zh's roots).
3. **The query indexes** of xx/it (`search-xx-it`, `market-model-xx-it`, `market-llms-xx-it`, as
   xx/zh's).
4. **The own confirmation** above, from the local capture.
5. **The site's remaining texts in Italian**: the accordion filter and the form have `it`
   already; the picker options and the article dates do not (as zh's came with 8a2976f9).
6. Then a wave. `rollout.mjs --plan 17` gives "10 pages, 3 references; compare pairs 6 (no
   counterpart: none)".
