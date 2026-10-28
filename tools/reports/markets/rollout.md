# Choice B rolled out to www's en and de roots (pilot, lhedge only)

`tools/markets/rollout.mjs` (batches, capture lists, table rows, documents, comparison),
`tools/markets/check-market-route.mjs` (route check). Nothing published. Every new root is
`pilot`, `documents: language`, served on lhedge only.

## Batches

- 11 batches. www has 187 en and de roots without a row:
  - 61 countries with only en and de, plus at/en (at already has a row) = 62 countries, in batches 1–6;
  - the en and de roots of 35 countries with other languages too, in batches 7–11.
- A remainder of one or two countries joins the batch before it (za in batch 6).
- `node tools/markets/rollout.mjs --batches` lists them.

## Batch 1 (2026-10-27): ae al am at(en) au az ba bg bh cd, 19 roots

### Captures

- One warm Bright Data session at a time, one page every 5 to 10 s.
- Blocked once (403, 21:36 UTC), waited 31 minutes, went on.
- 90 pages: 19 homepages, 14 own pages, 57 pages compared with the language version.
- 13 same-day references of de/en and de/de.

### Locale rows

Taken from the homepage captures:

| Value | Source |
| --- | --- |
| `name` | www's country and language label |
| `countryName` | the label's country part, per language (a country's existing row where its other language has one) |
| `homeAirport` | the booking form's preselected origin, else the fare teaser's origin |
| `currency` | the prices shown |
| `timeZone`, `shopLang` | not on www's homepage: `null` for every root (listed in `unverified`) |

| Root | name | countryName en / de | Airport | Currency |
| --- | --- | --- | --- | --- |
| ae/de | Verein. Arab. Emirate \| Deutsch | United Arab Emirates / Verein. Arab. Emirate | DXB | AED |
| ae/en | United Arab Emirates \| English | United Arab Emirates / Verein. Arab. Emirate | DXB | AED |
| al/de | Albanien \| Deutsch | – / Albanien | TIA | EUR |
| al/en | – | – / Albanien | – | – |
| am/de, am/en | AM \| DE, AM \| EN | AM / AM | EVN | USD |
| at/en | Austria \| English | Austria / Österreich | VIE | EUR |
| au/de, au/en | Australien \| Deutsch, Australien \| English | Australien / Australien | SYD | AUD |
| az/de | – | Azerbaijan / – | BAK | AZN |
| az/en | Azerbaijan \| English | Azerbaijan / – | BAK | AZN |
| ba/de, ba/en | Bosnien und Herzegowina \| Deutsch, Bosnia-Herzegovina \| English | Bosnia-Herzegovina / Bosnien und Herzegowina | SJJ | BAM |
| bg/de, bg/en | Bulgarien \| Deutsch, Bulgarien \| English | Bulgarien / Bulgarien | SOF | EUR |
| bh/de, bh/en | Bahrain \| Deutsch, Bahrain \| English | Bahrain / Bahrain | BAH | BHD |
| cd/de, cd/en | Democratic Republic of Congo \| Deutsch, … \| English | Democratic Republic of Congo (both) | FIH | USD |

Not found (`–`):
- al/en: name, airport, currency. The forced recapture got the al/de page (www sent the
  session to al/de); a fresh session for al/en is queued.
- az/de: name. The country selector had not rendered in two captures.
- countryName en of al; countryName de of az.

What www itself shows:
- English roots with German country names: Australien, Bulgarien, Albanien.
- am: country codes only (AM | DE, AM | EN).
- The rows take www's labels as they are.

### Documents

Imported, made the root's own, uploaded and previewed; 75 uploads including the two corrected
navs and footers:
- 19 homepages: homepage template, large SVGs rasterized. Links into the root are relative where
  the replica serves the target; `payment-options` and `offers-and-destination` stay on www.
- 14 own pages: info template.
- Nav and footer of every root: root-docs.mjs. www links into the language root moved to www's
  root; `articles` and the search page into the root.

Left out:
- `/al/de/common/testperformance` (a test page).
- No AEM configuration pages or stale-file URLs in this batch.

### Local versions

Per root, `flights`/`fluege`, `airport-information`/`flughafeninformation` and
`additional-services`, against www's language page of the same day
(`rollout-batch1-compare.json`):

- **The de roots' flight offers page:** every one shows "Einreisebestimmungen" where de/de shows
  "Parken am Terminal". That is the section `markets` of `/de/de/fluege` (part 2:
  `Markets: de` / `-de`), so no root documents. Until it is published, lhedge (live origin) shows
  them the parking teaser.
- **The en roots' flight offers page:** only the destination offers differ ("best price …",
  "recommended …", per origin). The block loads them for the row's home airport. ba/en also has
  three empty components.
- **am/de and at/en airport pages:** a masking artifact ("am" and "at" are country codes and
  words); unmasked they are identical.
- Everything else: the same.
- **Root documents made: none.** `cd/de/fluege` was not compared (captured after the comparison).

### The ch lead texts (report ch-choice-b.md)

Against same-day de/en and de/de, `ch/en` and `ch/de` `additional-services`, `100-years`, `320`,
`32n` and ch/de `book-and-manage/stopover` are identical (0 items only on either side). ch does
not differ. www removed those lead texts from its de pages after 21/22 Oct, so the replica's
language documents are behind www there.

### Checks against the preview origin

Local runtime, `rollout-batch1-check.json`:

| Root | www URLs | 200 | 301 | 404 |
| --- | --- | --- | --- | --- |
| ae/de | 1,046 | 952 | 1 | 93 |
| ae/en | 1,062 | 960 | | 102 |
| al/de | 1,048 | 953 | 1 | 94 |
| al/en | 1,052 | 958 | | 94 |
| am/de | 1,046 | 952 | 1 | 93 |
| am/en | 1,054 | 958 | | 96 |
| at/en | 1,063 | 961 | | 102 |
| au/de | 1,048 | 953 | 1 | 94 |
| au/en | 1,057 | 959 | | 98 |
| az/de | 1,055 | 955 | 1 | 99 |
| az/en | 1,056 | 959 | | 97 |
| ba/de | 1,048 | 953 | 1 | 94 |
| ba/en | 1,056 | 958 | | 98 |
| bg/de | 1,047 | 953 | 1 | 93 |
| bg/en | 1,058 | 960 | | 98 |
| bh/de | 1,047 | 953 | 1 | 93 |
| bh/en | 1,061 | 959 | | 102 |
| cd/de | 1,047 | 953 | 1 | 93 |
| cd/en | 1,053 | 958 | | 95 |

- Every 200 has the root's canonical.
- The 404s:
  - 81–89 per root are pages the replica has in neither language version (as for ch);
  - 12–13 are the login and profile pages (left alone).
- The 301 is de/de's `support/support` redirect, moved into the root.
- Every link on the 19 homepages, navs and footers (57 documents) answers 200.

All of batch 1's values were found after a fresh-session recapture:
- al/en: Albania | English, TIA, EUR;
- az/de: Aserbaidschan | Deutsch;
- the country names en Albania and de Aserbaidschan.

Only am keeps www's code label ("AM | DE", "AM | EN").

## Batch 2 (2026-10-28): CZ DK EE EG ER ET FI GB(de) GE HR, 19 roots

### Captures

- 92 pages: 19 homepages, 16 own pages, 57 compared.
- No 403. The session crashed twice (the browser closed: a stall); it was restarted.
- 4 homepages without a rendered label were recaptured once (en first, a fresh session) and
  then had it.

### Locale rows

| Root | name | countryName en / de | Airport | Currency |
| --- | --- | --- | --- | --- |
| cz/de, cz/en | Tschechische Republik \| Deutsch, Czech Republic \| English | Czech Republic / Tschechische Republik | PRG | CZK |
| dk/de, dk/en | Dänemark \| Deutsch, Denmark \| English | Denmark / Dänemark | CPH | DKK |
| ee/de, ee/en | Estland \| Deutsch, Estonia \| English | Estonia / Estland | TLL | EUR |
| eg/de, eg/en | Ägypten \| Deutsch, Egypt \| English | Egypt / Ägypten | CAI | EGP |
| er/de | Eritrea \| Deutsch | Eritrea / Eritrea | FRA | – |
| er/en | Eritrea \| English | Eritrea / Eritrea | FRA | EUR |
| et/de, et/en | Äthiopien \| Deutsch, Ethiopia \| English | Ethiopia / Äthiopien | ADD | ETB |
| fi/de | FI \| DE | Finland / FI | HEL | EUR |
| fi/en | Finland \| English | Finland / FI | HEL | EUR |
| gb/de | Vereinigtes Königreich \| Deutsch | United Kingdom / Vereinigtes Königreich | LON | GBP |
| ge/de, ge/en | Georgien \| Deutsch, Georgia \| English | Georgia / Georgien | TBS | GEL |
| hr/de, hr/en | Kroatien \| Deutsch, Kroatien \| English | Kroatien / Kroatien | ZAG | EUR |

Not found (`–`) and www's own oddities:
- er/de: currency (no price on the homepage).
- er preselects FRA in the booking form; fi/de's label is codes only (FI | DE); hr/en has a
  German country name; gb/de gives the city code LON.
- timeZone and shopLang: null for every root, as in batch 1.

### Documents

- 19 homepages, 16 own pages and nav and footer of every root; 73 documents uploaded and
  previewed.
- www's `/fi/en/book-and-manage/offers-and-destination/worldwide_offers1` became the document
  `…/worldwide-offers1` (Edge Delivery allows no underscores). www's URL keeps working only with a
  redirect row `/fi/en/book-and-manage/offers-and-destination/worldwide_offers1` →
  `/fi/en/book-and-manage/offers-and-destination/worldwide-offers1` in the redirect sheet, which
  is yours to upload.

### Local versions

`rollout-batch2-compare.json`:
- The de roots' flight offers page: the same entry-rules teaser as batch 1 (section `markets`).
- The en roots' flight pages: only the destination offers differ.
- er/en: a masking artifact ("Palma de Mallorca").
- er/de's flight page lacks the whole teaser carousel. Its capture came back without a status (the
  screenshot timed out), so it is likely incomplete: unsettled, to be recaptured.
- **Root documents made: none.**

### Checks against the preview origin

`rollout-batch2-check.json`:
- Every root has 953–971 of its 1,047–1,071 www URLs at 200, with the root's canonical; one 301
  per de root (`support/support`).
- The 404s: pages the replica has in neither language version, the login and profile pages, and
  fi/en's underscore URL.
- Every link on the 19 homepages, navs and footers answers 200.
