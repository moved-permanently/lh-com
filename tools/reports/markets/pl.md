# Polish (pl) for lufthansa.com (batch 21)

Status of 2026-11-05: **imported, uploaded and previewed; nothing published, nothing switched
on.** Imported by the local import harness (Ben 2026-11-05: content imports run locally and are
handed over to an EMA), with the EMAs' own pipeline: `import-batch.mjs` with the network-blocked
bulk importer (`offline-importer.mjs`), `import-nav.bundle.js`, `root-docs.mjs --own-root`,
`postprocess-media.mjs --no-download`, `da-upload.mjs`. Checked first on Greek: the harness
rebuilt xx/el's 264 documents identical to the ones in Document Authoring.

## The language version: xx/pl

`rollout.mjs` had batch 21 as `{ lang: 'pl', version: 'xx/pl', confirm: 'pl/pl' }`, to be
confirmed by the local capture's pilot. **The pilot settled it** (lh-deliveries.json, 2026-11-03 20:28 UTC:
`{"segment": "pl", "pilot": "passed", "version": "xx/pl", "versionHasOwnPages": true, "fallbackUsed": false}`).
xx/pl's pages are Polish (`lang="pl"`) with their own canonical and the label "Inne kraje | Polski",
fetched through www's long AEM URLs. So **xx/pl is the version** and **pl/pl is its market root**.
The fallback list `21-pl-pl-pl.txt` was not used.

## Captures

- **The local capture** (`21-pl.txt`, `21-pl-confirmations.txt`, `21-pl-aliases.txt`): 6
  archives, `lh-snapshots-056`, `-057`, `-058` and `-059` (pages), `-054` (confirmations) and `-055` (aliases), **266 pages** (lh-deliveries.json: `{"segment": "pl", "complete": true}`).
  Each archive's sha256 and each page's sha256 in its manifest were checked; every entry is a
  regular file inside the archive; each archive was unpacked into its own empty folder and applied
  in order. **059 replaces 057's** `medikamenten-transport` (057's copy was 70 KB, 059's 264 KB, the full page); the document is imported from 059's.
- **The checks, as el.md's adapted to Polish**: each page must have `lang="pl"`, be in Polish
  (more Polish than English function words in its own text, header, nav and footer left out), have its own canonical and its own URL or www's
  long AEM URL as final URL, and be neither a challenge page nor an empty shell. **None looked
  wrong.** `passenger-receipt-90` and two form confirmations are English inside Polish page chrome on www itself; `lufthansa-city/culinaryjourney`'s final URL carries www's `#/entry` (the same page). 23 pages have no H1, as on www (the same kind as for the other
  languages: `100-years/*`, `320`, `32n`, `boeing787`, `seat-maps`, `culinaryjourney` and others).
- **Not captured: 7**, as the index lists them (the capture's probes, all www 404s): the five
  alias URLs (`business-class`, `digital-travel-companion`, `flynet`, `freigepaeck-regeln`,
  `lounges`), `lufthansa-city/menu-card` and `.../register-sporting-firearm/confirmation` (de/en's
  path; xx/pl's ammunition form goes to another one, below).

## Documents (DA and preview, not published)

**265 documents. All 265 answer 200 on preview and carry the same text in DA** (every document read
back: preview's `.plain.html` and DA's source against the local document):
- **xx/pl, 264**:
  - 251 pages, each by the template of its de/en counterpart in www's page groups (homepage 1, hub 16, campaign 21, fleet 8, info 165, legal 29, form 5, app-entry 5, flight-status 1);
  - the 6 form confirmation pages captured (info, as de/en's);
  - **the five alias documents** `business-class`, `digital-travel-companion`, `flynet`,
    `freigepaeck-regeln` and `lounges`: documents under the alias paths, imported from the
    captures of their real pages (alias archive) by their de/en counterparts' templates (info;
    lounges hub). No document under the real paths;
  - its nav and footer from its homepage capture (`import-nav.bundle.js`: Polish labels,
    "Inne kraje | Polski").

  Links into xx/pl are relative where it has the document (`root-docs.mjs --own-root xx/pl`: 1,406
  links); the 59 links in 42 documents to the alias pages' real paths go to the alias documents,
  as de/en's link them. Links to pages xx/pl does not have stay on www.
- **pl/pl, 1**: the homepage (homepage template). pl/pl has no own pages (`rollout.mjs ownPages`).
  The root's links into its own root are relative where it has the document (none: it has no own pages); its homepage's
  other links into the root stay on www until the root has locale rows, as for the other languages.
- **Images**: the homepages carry the Instagram logo as its converted PNG already in DA; 35
  images in 31 documents (the homepages included) link the converted copies DA already has
  (the media manifest's conversions, the same copies de/en's documents use);
  `postprocess-media.mjs --no-download` swapped three broken originals for their renditions
  (`100-years/history`, `check-in-with-the-family`, `unterhaltung-an-bord`). Nothing over the limits
  (265 documents, 0 failing); no image converted or uploaded anew.
- **The forms** keep their ids: `add-sports-baggage` (on `sportgepaeck-hinzufuegen`),
  `anmeldung-tiere-frachtraum`, `feedback-past-flight`, `group-travel`, `passenger-receipt-90`,
  `register-animal-cabin` and `special-needs` link their confirmation documents (relative).
  `register-ammunition` goes to xx/pl's own `.../register-sporting-firearm1/confirmation` (as the
  other languages'), which no list had: its success row stays on www until it is captured.
  `passenger-receipt-90` and its confirmation (and the other confirmations' "Thank you for your
  enquiry") are English inside Polish page chrome on www itself; imported as www has them.
- `tools/importer/sites/lh-com.json` lists the 265 (added at the end).

## Left out, and why

- **www's other xx/pl URLs** with no in-scope de/en or de/de counterpart, as for the other
  languages. They were not in the capture list.
- **The root's comparison pages** (`flights`, `airport-information`, `additional-services` of
  pl/pl, 3 captured): references for the local-version comparison, not documents.

## What pl still needs before it can go live

Done since (2026-11-06): **the locale rows** as the table below proposes them, all pilot behind the switch (no wave; `languageVersions.pl = xx/pl`), with the user's calls: pl/pl's English name "Poland"; hreflang pl, pl-PL; **the built-in texts** in this language (the picker options, the accordion filter, the article dates; `test/languages-17-21.test.mjs`); **the own confirmation's list**: `21-pl-confirmations-own.txt` written (on main), for the capture. **The roots' nav and footer** (pl/pl) and the roots' homepages' links into their root (`root-docs.mjs --own-root` again, now that the roots have rows): commands and path lists for the local harness in `root-docs-harness.md`, not run yet. The query indexes come in a later brief.

1. **Locale rows (an EMA: `tools/markets/locale-data.json`, `scripts/locale-table.js` are shared)**:
   the values from the homepage captures (`rollout.mjs --rows 21`, not applied):

   | Root | name (www's label) | countryName en / de / pl | Airport | Currency |
   | --- | --- | --- | --- | --- |
   | xx/pl (version, documents own) | Inne kraje \| Polski | – / – / Inne kraje | FRA | EUR |
   | pl/pl | Polska \| Polski | Poland / Polen / Polska | WAW | PLN |

   The open points:
   - pl/pl's English country name: `--rows 21` gives en "Polen" (as it/it's swapped names in it.md); the table above has "Poland";
   - hreflang of the root (`pl-PL`?);
   - `languageVersions.pl = xx/pl`; all `pilot`, batch 21;
2. **The root's nav and footer** from xx/pl's (`root-docs.mjs --from xx/pl --to pl/pl --doc nav
   --doc footer`), after the rows.
3. **The query indexes** of xx/pl (`search-xx-pl`, `market-model-xx-pl`, `market-llms-xx-pl`, as xx/zh's).
4. **The own confirmation** above (`xx/pl/prepare-for-your-trip/baggage/sport-baggage/register-sporting-firearm1/confirmation`),
   from the local capture (a `21-pl-confirmations-own.txt` list, as `18-el-confirmations-own.txt`).
5. **The site's remaining texts in Polish**: most blocks already carry `pl`; check the picker
   options, the accordion filter and the article dates, as for el.
6. Then a wave. `rollout.mjs --plan 21` gives "4 pages, 3 references; compare pairs 3 (no counterpart: none)".
