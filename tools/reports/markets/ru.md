# Russian for lufthansa.com (batch 14)

Status of 2026-11-03: **imported, uploaded and previewed; nothing published, nothing switched
on.**

## The language version: xx/ru

www's sitemaps list `xx/ru` URLs only as hreflang alternates, as they did for `xx/pt`, so
`rollout.mjs` had batch 14 as `{ lang: 'ru', version: 'xx/ru', confirm: 'ru/ru' }` (to be confirmed
by the local capture's pilot). **The pilot settled it** (lh-deliveries.json: `{"segment": "ru",
"pilot": "passed", "version": "xx/ru", "versionHasOwnPages": true, "fallbackUsed": false}`):
xx/ru's pages are Russian with their own canonical and the label "Другие страны | Русский",
fetched through www's long AEM URLs. So **xx/ru is Russian's language version**, and **by/ru, kz/ru
and ru/ru are its market roots** (`test/markets-languages.test.mjs`). The fallback list
`14-ru-ru-ru.txt` was not used.

## Captures

- **The local capture** (Ben's machine, a real browser, from
  `tools/markets/capture-lists/14-ru.txt` and `14-ru-confirmations.txt`): `lh-snapshots-006`,
  `-007`, `-008`, `-009` (pages) and `-011` (confirmations; lh-deliveries.json: `{"segment": "ru",
  "complete": true, "archives": 5}`), **272 pages**. Each archive's sha256 and each page's sha256
  in its manifest were checked, and every entry is a regular file inside the archive. They were
  unpacked in order: **009 replaces 006's
  `advance-seat-reservations-terms-and-conditions`** (imported again: the document came out the
  same).
- The pages were checked before they were placed: Russian (`lang="ru"`), their own canonical,
  their own URL or www's long AEM URL of it as final URL, no challenge page, no empty shell.
  **None looked wrong.** 23 have no H1, as on www (the 100-years, aircraft, hero and app pages,
  as for Portuguese: `100-years/*`, `320`, `32n`, `boeing787`, `discover-lufthansa/lufthansa-fleet/351`,
  `seat-maps`, `timetable-and-flight-status`, `onboard-delights` and others).
- **Not captured: 6, all www 404s** (the capture's probes): `/xx/ru/business-class`,
  `digital-travel-companion`, `flynet`, `freigepaeck-regeln`, `lounges` (www's short alias URLs, as
  xx/pt's and xx/es's) and `/xx/ru/lufthansa-city/menu-card`.
- No Bright Data capture for Russian (stopped before it, brief 300).

## Documents (DA and preview, not published)

**265 documents. All 265 answer 200 on preview and carry the same text in DA:**
- **xx/ru, 259**:
  - 249 pages, each by the template of its de/en counterpart (`import-batch.mjs`; with the homepage:
    homepage 1, hub 16, campaign 20, fleet 8, info 165, legal 29, form 5, app-entry 5,
    flight-status 1);
  - the 7 form confirmation pages (info, as de/en's);
  - its homepage;
  - its nav and footer from its homepage capture (`import-nav.bundle.js`: Russian labels,
    "Другие страны | Русский").

  Links into xx/ru are relative where it has the document (`root-docs.mjs --own-root xx/ru`, run
  again after each archive, so earlier documents link the later ones).
- **by/ru, kz/ru, ru/ru, 6**: the three homepages (homepage template) and the three own pages
  (info template): kz/ru's `companion-business` and `companion-premium` (companion offers in
  business and premium economy), and ru/ru's `local-page/current-flight-information-ru` (www's
  page, still about the coronavirus: imported as captured). by/ru has no own pages.
- **The forms** keep their ids: `anmeldung-tiere-frachtraum`, `passenger-receipt-90`,
  `special-needs`, `feedback-past-flight`, `add-sports-baggage`, `group-travel`,
  `register-animal-cabin`, `register-ammunition`. **Every success row links its Russian
  confirmation document** (relative): `support/contact/contact-form-confirmation`,
  `book-and-manage/passenger-receipt-90days/confirmation`,
  `.../register-sporting-firearm/confirmation`, `.../register-sports-baggage/confirmation`,
  `.../register-animal-cargo-hold/confirmation`, `.../register-animal/confirmation`,
  `.../special-needs-online-form/confirmation`.
- Images: the converted images `media-manifest.json` records were applied where a document uses
  them. `postprocess-media.mjs --no-download` changed 3 documents (this workspace has no media
  cache).
- `tools/importer/sites/lh-com.json` lists the 265 (added at the end).
- **How it renders on preview**: xx/ru's body is Russian. Header and footer show de/en's for now, as
  on xx/pt: the site picks the nav by the locale rows, which xx/ru does not have yet (point 1
  below).

## Left out, and why

- **77 of www's xx/ru URLs** have no in-scope de/en or de/de counterpart: the aircraft type pages,
  the `configuration/commonheader` AEM pages, stopover partner pages lh-com does not have, and
  others (`migration-work`'s scope list, as for xx/pt). They were not in the capture list.
- **The six www 404s** above. Behind the five aliases are real pages, as for xx/pt and xx/es
  (`prepare-for-your-trip/travel-classes/business-class` and the others). No capture list has
  their xx/ru long URLs yet. A `14-ru-aliases.txt` like `13-pt-aliases.txt` would bring them, if
  you want those documents for Russian too.
- **The roots' comparison pages** (`flights`, `airport-information`, `additional-services` of
  by/ru, kz/ru and ru/ru, 9 captured): references for the local-version comparison, not documents
  (the roots answer them from xx/ru).

## What Russian still needs before it can go live

1. **Locale rows (ema-adobe: `tools/markets/locale-data.json` and the table it builds,
   `scripts/locale-table.js`, are shared)**: the values from the homepage captures
   (`rollout.mjs --rows 14`, not applied):

   | Root | name (www's label) | countryName en / de / ru | Airport | Currency |
   | --- | --- | --- | --- | --- |
   | xx/ru (version, documents own) | Другие страны \| Русский | – / – / Другие страны | FRA | not on the homepage |
   | by/ru | Belarus \| Русский | Belarus / Belarus / Belarus | FRA | not on the homepage |
   | kz/ru | Kazakhstan \| Русский | Kazakhstan / KZ / Kazakhstan | NQZ | KZT |
   | ru/ru | Russian Federation \| Русский | Russian Federation / Russische Föderation / Russian Federation | FRA | not on the homepage |

   Gaps to fill by hand: three currencies; kz/ru's German name (www gives "KZ": Kasachstan); the
   Russian country names (www's labels are in English; in Russian they would be Беларусь,
   Казахстан, Российская Федерация: your call);
   `languageVersions.ru = xx/ru`; all `pilot`, batch 14.
2. **The roots' nav and footer**: copies of xx/ru's (`root-docs.mjs --from xx/ru --to <root>`),
   which take the root's label from the locale rows: after them.
3. **The query indexes** of xx/ru (helix-query.yaml `search-xx-ru`, `market-model-xx-ru`,
   `market-llms-xx-ru`, as xx/es's and xx/pt's): they fill on publish.
4. **Redirect rows**, or alias documents: the five xx/ru alias URLs.
5. **The site's texts in Russian** (labels fall back to English).
6. Then a wave. `rollout.mjs --plan 14` runs now that xx/ru's three comparison documents exist
   (`flights`, `airport-information`, `additional-services`): "15 pages, 3 references; compare
   pairs 9 (no counterpart: none)". After it: the local-version comparison against the roots'
   captures, and the preview check, as for batches 11 to 13.
