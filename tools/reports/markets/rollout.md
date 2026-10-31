# Choice B rolled out to www's en and de roots (pilot, test address only)

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
- er/de's flight page lacked the whole teaser carousel in its first capture (no status, the
  screenshot timed out). Recaptured on 2026-10-28 in a fresh session: the carousel is there, and
  the page differs from de/de only by the entry-rules teaser (section `markets`), like every de
  root. It shows no price either, so er/de's `currency` stays `null` (er/en: EUR).
- **Root documents made: none.**

### Checks against the preview origin

`rollout-batch2-check.json`:
- Every root has 953–971 of its 1,047–1,071 www URLs at 200, with the root's canonical; one 301
  per de root (`support/support`).
- The 404s: pages the replica has in neither language version, the login and profile pages, and
  fi/en's underscore URL.
- Every link on the 19 homepages, navs and footers answers 200.

## Batch 3 (2026-10-28): HU ID IE IL IN IQ IR IS JO KE, 20 roots

### Captures

- 93 pages: 20 homepages, 13 own pages, 60 compared with the language version; 6 same-day
  references of de/en and de/de.
- No 403. One session hung at warm-up (17 minutes, restarted); one could not connect (retried);
  the workspace restarted once in between (the captures and their state survived, the run went on).
- **Wrong pages:** after a navigation timeout (90 s, no response) the session saved the page still
  open under the next URL: `/ie/de/homepage` held www's `/id/en/additional-services`, five such
  captures in all (canonical check). `tools/importer/bd-session.mjs` now saves nothing when a
  navigation got no response and the browser is not on the requested path (`wrong-page`, retried
  like a net error). The five were moved aside and captured again; every batch 3 capture now has
  its own URL as canonical (batch 1 and 2 captures checked too: none affected).
- 5 homepages without a rendered country label (ie/de, is/de, is/en, jo/en, ke/de) were
  recaptured in a fresh session (en first); ie/de needed two more tries.
- `/in/en/local-page/india20` (in www's sitemap): www answers 404, so no document.

### Locale rows

| Root | name | countryName en / de | Airport | Currency |
| --- | --- | --- | --- | --- |
| hu/de, hu/en | Ungarn \| Deutsch, Hungary \| English | Hungary / Ungarn | BUD | HUF |
| id/de, id/en | Indonesien \| Deutsch, Indonesia \| English | Indonesia / Indonesien | DPS | IDR |
| ie/de, ie/en | Irland \| Deutsch, Ireland \| English | Ireland / Irland | DUB | EUR |
| il/de, il/en | Israel \| Deutsch, Israel \| English | Israel / Israel | TLV | USD |
| in/de, in/en | Indien \| Deutsch, Indien \| English | Indien / Indien | DEL | INR |
| iq/de, iq/en | Irak \| Deutsch, Iraq \| English | Iraq / Irak | FRA | EUR |
| ir/de, ir/en | Iran \| Deutsch, Iran \| English | Iran / Iran | FRA | EUR |
| is/de | IS \| DE | Iceland / IS | REK | ISK |
| is/en | Iceland \| English | Iceland / IS | REK | ISK |
| jo/de, jo/en | Jordanien \| Deutsch, Jordan \| English | Jordan / Jordanien | AMM | JOD |
| ke/de, ke/en | Kenia \| Deutsch, Kenya \| English | Kenya / Kenia | NBO | USD |

Every value was found. www's own oddities, taken as they are:
- in/en has a German country name (Indien), is/de's label is codes only (IS | DE).
- id preselects Denpasar (DPS), iq and ir preselect FRA (prices in EUR), is gives the city code REK.
- il and ke show prices in USD.
- timeZone and shopLang: null for every root, as in batches 1 and 2.

### Documents

- 20 homepages, 12 own pages (il/en 4, in/en 5, ir/en 2, jo/en 1) and nav and footer of every
  root: 72 documents uploaded and previewed (not published).
- `/il/en/cancellation-refund-webform` has the site's form block (`form core`), as the de/en forms.
- Left out of in/en: 5 test pages and 3 URLs only in stale sitemap files. The test-page rule now
  also matches an underscore name (`/in/en/local-page/new_menu_indian_routes/test_260526`; it
  would have become a renamed document with a redirect row).

### Local versions

`rollout-batch3-compare.json`:
- The de roots' flight offers page: the same entry-rules teaser as batches 1 and 2 (section
  `markets`).
- The en roots' flight pages: only the destination offers differ (per origin); ir/en shows none and
  is the same.
- id, in and is: masking artifacts ("travel id", "fly in comfort", "is now very easy": the country
  codes are words); unmasked identical.
- Everything else: the same. **Root documents made: none.**

### Checks against the preview origin

Local runtime, `rollout-batch3-check.json`:

| Root | www URLs | 200 | 301 | 404 | in neither language version | login/profile |
| --- | --- | --- | --- | --- | --- | --- |
| hu/de | 1,047 | 953 | 1 | 93 | 81 | 12 |
| hu/en | 1,057 | 958 | | 99 | 86 | 13 |
| id/de | 1,047 | 953 | 1 | 93 | 81 | 12 |
| id/en | 1,055 | 958 | | 97 | 84 | 13 |
| ie/de | 1,047 | 953 | 1 | 93 | 81 | 12 |
| ie/en | 1,054 | 958 | | 96 | 83 | 13 |
| il/de | 1,047 | 953 | 1 | 93 | 81 | 12 |
| il/en | 1,059 | 962 | | 97 | 84 | 13 |
| in/de | 1,047 | 953 | 1 | 93 | 81 | 12 |
| in/en | 1,069 | 963 | | 106 | 93 | 13 |
| iq/de | 1,047 | 953 | 1 | 93 | 81 | 12 |
| iq/en | 1,054 | 958 | | 96 | 83 | 13 |
| ir/de | 1,047 | 953 | 1 | 93 | 81 | 12 |
| ir/en | 1,056 | 960 | | 96 | 83 | 13 |
| is/de | 1,047 | 953 | 1 | 93 | 81 | 12 |
| is/en | 1,055 | 958 | | 97 | 84 | 13 |
| jo/de | 1,047 | 953 | 1 | 93 | 81 | 12 |
| jo/en | 1,057 | 959 | | 98 | 85 | 13 |
| ke/de | 1,047 | 953 | 1 | 93 | 81 | 12 |
| ke/en | 1,056 | 958 | | 98 | 85 | 13 |

- Every 200 has the root's canonical. The 301 is de/de's `support/support` redirect, moved into
  the root.
- in/en's extra 404s are its left-out test and stale-file pages and `india20`.
- Every link on the 20 homepages, navs and footers (60 documents, 1,700 links) answers 200.

## Batch 4 (2026-10-28): KW LB LT LV LY MD MK MT MU MV, 20 roots

### Captures

- Plan: 106 pages: 20 homepages, 26 own pages, 60 compared with the language version. The same-day
  references of de/en and de/de are batch 3's (08:05 UTC the same day).
- One warm session at a time, one page every 5 to 10 s, 18:02 to 20:34 UTC.
- **Four 403 blocks** (18:32, 19:04, 19:44, 20:34), each followed by a 31-minute pause; one crash
  (the browser closed, 18:30, a new session after a minute). Every block hit one of mk's own pages
  (the archive and garage pages of www's mk market): twice
  `/mk/de/articles/explore-the-world/be-picky-frankfurt-insider-tips1`, then
  `/mk/en/archived-contents/meetings-and-events/exclusive-event-offer-dubai` and
  `/mk/en/articles/back-up-explore-the-world-manual`. After the second block the blocked page went
  to the end of the list, after the third all of mk's own pages; the runner stopped after the
  fourth, as set.
- **94 captured**: every homepage, every compared page, 14 own pages. Every capture has its own
  URL as canonical, except two own pages that are www's aliases (below).
- **Not captured** (12 of mk's own pages):
  - www answers 500: `/mk/en/archived-contents/flight-desruptions`,
    `/mk/en/archived-contents/meetings-and-events/exclusive-event-offer-dubai` (no document, as
    in/en's `india20`);
  - blocked or not reached before the run stopped: `/mk/de/articles/explore-the-world/be-picky-frankfurt-insider-tips1`,
    `/mk/de/overview-additional-services`, `/mk/de/overview-services-on-board`,
    `/mk/de/overview-travel-classes`, `/mk/en/articles/back-up-explore-the-world-manual`,
    `/mk/en/articles/highlights/winter-destinations1`,
    `/mk/en/business-services/for-corporate-customers/meetings-and-events/exclusive-event-offer-dubai`,
    `/mk/en/lounge-news`, `/mk/en/protection-measures`, `/mk/en/support/refund`. To be captured
    with batch 5's session (last in its list); until then lh-edge answers them 404 on lhedge.
- **Left out by rule** (`rollout.mjs --own`), new with mk (www's sandbox-like market: 1,270 AEM
  configuration pages in mk/en's sitemap): pages named `do-not-publish` or `garage`
  (`/mk/de/discover_temporarygarage---do-not-publish/families`, `…/travel-tips`) and the component
  test pages mk/de lists under `testseiten-teaseruebersicht-teaser-garagen`
  (`/mk/en/teaser-overview/…` ×3, `/mk/en/Videoplayer`, `/mk/en/panorama-viewer`). No page of
  batches 1 to 3 is affected.

### Locale rows

| Root | name | countryName en / de | Airport | Currency |
| --- | --- | --- | --- | --- |
| kw/de, kw/en | Kuwait \| Deutsch, Kuwait \| English | Kuwait / Kuwait | KWI | KWD |
| lb/de, lb/en | Libanon \| Deutsch, Lebanon \| English | Lebanon / Libanon | BEY | USD |
| lt/de, lt/en | Litauen \| Deutsch, Lithuania \| English | Lithuania / Litauen | VNO | EUR |
| lv/de, lv/en | Lettland \| Deutsch, Latvia \| English | Latvia / Lettland | RIX | EUR |
| ly/de, ly/en | Libyen \| Deutsch, Libya \| English | Libya / Libyen | FRA | EUR |
| md/de, md/en | Moldawien \| Deutsch, Moldawien \| English | Moldawien / Moldawien | RMO | EUR |
| mk/de | Nordmazedonien \| Deutsch | MK / Nordmazedonien | SKP | USD |
| mk/en | MK \| EN | MK / Nordmazedonien | SKP | USD |
| mt/de, mt/en | MT \| DE, MT \| EN | MT / MT | MLA | EUR |
| mu/de, mu/en | Mauritius \| Deutsch, Mauritius \| English | Mauritius / Mauritius | MRU | MUR |
| mv/de, mv/en | Malediven \| Deutsch, Maldives \| English | Maldives / Malediven | MLE | USD |

Every value was found. www's own oddities, taken as they are: codes only for mk/en and mt (like am),
a German country name on md/en (Moldawien), ly preselects FRA (prices in EUR, like iq and ir), lb,
mk and mv show prices in USD. timeZone and shopLang: null for every root, as in batches 1 to 3.

### Documents

- 20 homepages, 12 own pages (kw/en `local-page/jarallah`, 11 of mk/de's: articles, article tag
  pages, the emergency contact form `formular-notfallkontakt` with the site's form block
  `form core`, and its confirmation page) and nav and footer of every root: 72 documents uploaded
  and previewed (not published).
- **www's aliases**: two own pages name another page as canonical; `rollout.mjs --docs` now makes
  no document for such a page (the root serves the canonical page from its language version).
  Redirect rows keep www's URLs; they go in the redirect sheet, which is yours to upload:
  - `/lv/de/check-in-information` → `/lv/de/all-check-in`
  - `/mk/de/satellit-muenchen` → `/mk/de/lufthansa-terminal-muenchen`

  Batch 1 has one such page that was imported as a document of its own:
  `/az/en/prepare-for-your-trip/travel-classes/fice` (canonical `/az/en/discover-lufthansa/allegris`).
  It answers, so it stays; deleting it in Document Authoring and adding the row
  `/az/en/prepare-for-your-trip/travel-classes/fice` → `/az/en/discover-lufthansa/allegris` is
  yours if you want it the same way.
- **The first root document of the rollout: `/lb/en/flights`.** www's lb/en flight page has a
  promotion of its own in front of the language page's content: the headline "Exclusive Economy
  and Business Class Offers for your European and North American adventures.", an image and the
  offer (valid until 26 November 2026, travel 2 December 2026 to 31 March 2027, USD savings).
  The document is `/de/en/flights` copied with root-docs.mjs (the link rule of every root copy)
  with that section in front; uploaded and previewed. It is a dated offer: once www drops it, the
  document goes (a delete in Document Authoring, yours), and lb/en is served from de/en again.

### Local versions

`rollout-batch4-compare.json`:
- The de roots' flight offers page: the same entry-rules teaser as batches 1 to 3 (section
  `markets`).
- The en roots' flight pages: the destination offers differ (per origin); ly, mk, mt and mu show
  none and are the same.
- lb/en's flight page: its promotion (above, the root document).
- Everything else: the same.

### Checks against the preview origin

Local runtime, `rollout-batch4-check.json` (run again after the redirect fix below):

| Root | www URLs | 200 | 301 | 404 | 500 | in neither language version | login/profile |
| --- | --- | --- | --- | --- | --- | --- | --- |
| kw/de | 1,047 | 953 | 1 | 93 | | 81 | 12 |
| kw/en | 1,058 | 958 | | 99 | 1 | 86 | 13 |
| lb/de | 1,047 | 951 | 1 | 93 | 2 | 81 | 12 |
| lb/en | 1,056 | 958 | | 98 | | 85 | 13 |
| lt/de | 1,047 | 953 | 1 | 93 | | 81 | 12 |
| lt/en | 1,055 | 956 | | 97 | 2 | 84 | 13 |
| lv/de | 1,048 | 953 | 1 | 94 | | 82 | 12 |
| lv/en | 1,056 | 956 | | 98 | 2 | 85 | 13 |
| ly/de | 1,047 | 952 | 1 | 93 | 1 | 81 | 12 |
| ly/en | 1,053 | 958 | | 95 | | 82 | 13 |
| md/de | 1,047 | 950 | 1 | 93 | 3 | 81 | 12 |
| md/en | 1,054 | 958 | | 96 | | 83 | 13 |
| mk/de | 1,769 | 964 | 1 | 803 | 1 | 792 | 12 |
| mk/en | 2,890 | 955 | | 1,930 | 5 | 1,919 | 13 |
| mt/de | 1,048 | 953 | 1 | 94 | | 82 | 12 |
| mt/en | 1,055 | 956 | | 97 | 2 | 84 | 13 |
| mu/de | 1,047 | 951 | 1 | 93 | 2 | 81 | 12 |
| mu/en | 1,053 | 957 | | 95 | 1 | 82 | 13 |
| mv/de | 1,046 | 953 | 1 | 92 | | 80 | 12 |
| mv/en | 1,053 | 956 | | 95 | 2 | 82 | 13 |

- Every 200 has the root's canonical. The 301 is de/de's `support/support` redirect, moved into
  the root.
- mk's large 404 counts are its AEM configuration pages (`configuration/seo-pages/…`) and the own
  pages left out or not captured.
- **The 500s (24 URLs, 3 links) are the local runtime's**: "the Worker's code had hung", under
  eight concurrent requests in one process. Fetched again one at a time, every one answers as it
  should (200 through the market route, the configuration pages 404). The same check for hu/en
  against lhedge itself (production, eight concurrent requests) gives no 500 (958 × 200, 99 × 404,
  as batch 3). Likely cause: since 15170c2 concurrent requests share one pending index read, and
  workerd cancels a request that waits for another request's promise when that one ends. Not seen
  in production so far; a candidate for a fix (share only the finished values) if `wrangler tail`
  shows "hung" errors.
- **The redirect fix**: the first run found every de root's `support/support` at 404 instead of 301.
  The request without its conditions (ea9bd9a) had lost Workers' manual redirect mode, so the
  language version's redirect was followed and the root's 404 answered: on lhedge from 17:38 UTC.
  Fixed in 4b6f42d (deployed 21:15 UTC), with a test.
- Every link on the 20 homepages, navs and footers (60 documents, 1,701 links) answers 200.

### CPU (Workers Free: 10 ms per request)

Locally, `bench-market.mjs` with the same recorded origin answers for both code versions, lean
sources (the path these answers take once the lean indexes are filled), medians of 25 runs, today's
60 pilot roots and deployed code against batch 4's 80 roots, back to back (ms of CPU, cold / warm):

| Answer | 60 roots | 80 roots |
| --- | --- | --- |
| pilot page `/hu/en/baggage` | 6.8–7.3 / 1.9–2.0 | 6.2–7.0 / 1.6–1.9 |
| pilot `search-index.json` (4.5 MB) | 36–57 / 40–48 | 27–40 / 47–51 |
| sitemap index `.xml` | 8.6–9.1 / 3.6–4.1 | 9.2–9.7 / 4.0 |
| sitemap index `.gz` | 9.6–9.7 / 4.5–4.6 | 10.0–10.1 / 4.8–5.0 |
| market sitemap file `.xml` | 13.0–13.7 / 7.5–7.8 | 13.4 / 7.7–8.1 |
| market sitemap file `.gz` | 18.4–19.2 / 13.3–14.3 | 19.4–19.8 / 13.0–14.9 |

- The sitemap index grows with every root (54 KB → 93 KB). Its sort made each item's key with two
  regular expressions in every comparison; the key is now made once per item (answers byte for byte
  the same), which takes about 1.5 ms off and keeps the index at today's cost. Market sitemap files
  stay the same size (the alternates budget: 880 KB → 845 KB). The pilot JSON is the same.
- The numbers are upper bounds (Node's fetch and Response plumbing, the test's HTMLRewriter
  stand-in); the large JSON answers were already over 10 ms after 128.

## Batch 5 (2026-10-29): MY NG NL NO NZ OM PH QA RO RS, 20 roots

### Captures

- Plan: 83 pages: 20 homepages, 3 own pages, 60 compared with the language version; 6 same-day
  references of de/en and de/de; then the 12 own pages of mk that batch 4 did not capture.
- One warm session at a time, one page every 5 to 10 s, 01:22 to 03:01 UTC.
- **The 83 pages**: all captured, no 403, one crash (the browser closed, a new session after a
  minute); every capture has its own URL as canonical.
- **The references**: one 403 (02:16, the first one, `/de/de/fluege`), a 31-minute pause, then all
  six (02:47 to 02:57).
- **mk's 12 pages** (forced, to try www's 500 pages again; the run would have stopped after a second
  block): no 403. www answers:
  - 200 for six: `/mk/en/articles/highlights/winter-destinations1`,
    `/mk/en/business-services/for-corporate-customers/meetings-and-events/exclusive-event-offer-dubai`,
    `/mk/en/support/refund`, `/mk/en/articles/back-up-explore-the-world-manual`,
    `/mk/de/articles/explore-the-world/be-picky-frankfurt-insider-tips1` and `/mk/en/lounge-news`
    (www's alias of `/mk/en/lounges`, its canonical: no document, below);
  - 500 for six, so no document: the two archive pages as in batch 4
    (`/mk/en/archived-contents/flight-desruptions`,
    `/mk/en/archived-contents/meetings-and-events/exclusive-event-offer-dubai`) and now also
    `/mk/de/overview-additional-services`, `/mk/de/overview-services-on-board`,
    `/mk/de/overview-travel-classes` and `/mk/en/protection-measures` (they had not been reached in
    batch 4).

### Locale rows

| Root | name | countryName en / de | Airport | Currency |
| --- | --- | --- | --- | --- |
| my/de, my/en | Malaysia \| Deutsch, Malaysia \| English | Malaysia / Malaysia | KUL | MYR |
| ng/de, ng/en | Nigeria \| Deutsch, Nigeria \| English | Nigeria / Nigeria | ABV | USD |
| nl/de, nl/en | Niederlande \| Deutsch, Netherlands \| English | Netherlands / Niederlande | AMS | EUR |
| no/de, no/en | Norwegen \| Deutsch, Norway \| English | Norway / Norwegen | OSL | NOK |
| nz/de, nz/en | Neuseeland \| Deutsch, New Zealand \| English | New Zealand / Neuseeland | AKL | NZD |
| om/de, om/en | Oman \| Deutsch, Oman \| English | Oman / Oman | MCT | OMR |
| ph/de, ph/en | Philippinen \| Deutsch, Philippines \| English | Philippines / Philippinen | MNL | USD |
| qa/de, qa/en | Katar \| Deutsch, Qatar \| English | Qatar / Katar | FRA | EUR |
| ro/de, ro/en | Rumänien \| Deutsch, Romania \| English | Romania / Rumänien | BUH | EUR |
| rs/de, rs/en | Serbien \| Deutsch, Serbia \| English | Serbia / Serbien | BEG | EUR |

Every value was found. www's own oddities, taken as they are: qa preselects FRA (prices in EUR, like
iq, ir and ly), ro gives the city code BUH, ng and ph show prices in USD, ro and rs in EUR.
timeZone and shopLang: null for every root, as in batches 1 to 4.

### Documents

- 20 homepages, 3 own pages (`/my/en/local-page/kul-promo-code-oct26`, `/no/en/worldwide-offers`,
  `/nz/en/local-page/nz-multi-city`) and nav and footer of every root: 63 documents uploaded and
  previewed (not published).
- mk (batch 4's root): the five pages above with www's 200, imported and made mk's own like batch
  4's (`/mk/en/support/refund` has the site's form block `form core`): 5 documents uploaded and
  previewed.
- www's alias, a redirect row for the redirect sheet (yours to upload):
  `/mk/en/lounge-news` → `/mk/en/lounges`.
- `/my/en/local-page/kul-promo-code-oct26` is a dated promotion page (October 2026); it goes when www
  drops it (a delete in Document Authoring, yours).

### Local versions

`rollout-batch5-compare.json`, against same-day de/en and de/de:
- 40 of 60 the same.
- The de roots' flight offers page: the same entry-rules teaser as batches 1 to 4 (section
  `markets` of `/de/de/fluege`).
- The en roots' flight pages: only the destination offers differ (per origin; today's de/en page
  lists many more of them, 289 to 591 items only there); no component differs.
- **Root documents made: none.**

### Checks against the preview origin

Local runtime, `rollout-batch5-check.json`:

| Root | www URLs | 200 | 301 | 404 | 500 | in neither language version | login/profile |
| --- | --- | --- | --- | --- | --- | --- | --- |
| my/de | 1,047 | 953 | 1 | 93 | | 81 | 12 |
| my/en | 1,054 | 959 | | 95 | | 82 | 13 |
| ng/de | 1,047 | 951 | 1 | 93 | 2 | 81 | 12 |
| ng/en | 1,060 | 956 | | 102 | 2 | 89 | 13 |
| nl/de | 1,048 | 951 | 1 | 94 | 2 | 82 | 12 |
| nl/en | 1,058 | 956 | | 100 | 2 | 87 | 13 |
| no/de | 1,047 | 953 | 1 | 92 | 1 | 81 | 12 |
| no/en | 1,061 | 958 | | 102 | 1 | 89 | 13 |
| nz/de | 1,047 | 952 | 1 | 93 | 1 | 81 | 12 |
| nz/en | 1,054 | 957 | | 95 | 2 | 82 | 13 |
| om/de | 1,047 | 952 | 1 | 92 | 2 | 81 | 12 |
| om/en | 1,055 | 957 | | 97 | 1 | 84 | 13 |
| ph/de | 1,047 | 952 | 1 | 93 | 1 | 81 | 12 |
| ph/en | 1,054 | 955 | | 96 | 3 | 83 | 13 |
| qa/de | 1,047 | 953 | 1 | 93 | | 81 | 12 |
| qa/en | 1,053 | 957 | | 95 | 1 | 82 | 13 |
| ro/de | 1,047 | 952 | 1 | 93 | 1 | 81 | 12 |
| ro/en | 1,055 | 957 | | 97 | 1 | 84 | 13 |
| rs/de | 1,047 | 953 | 1 | 93 | | 81 | 12 |
| rs/en | 1,056 | 956 | | 97 | 3 | 85 | 13 |

- Every 200 has the root's canonical. The 301 is de/de's `support/support` redirect, moved into
  the root.
- **The 500s (26 URLs, 2 links) are the local runtime's again** ("the Worker's code had hung",
  28 times in its log, eight concurrent requests in one process): fetched again one at a time, 23
  answer 200 through the market route, 3 answer 404, the 2 links 200. Production showed no such
  error (wrangler tail on lh-edge, 80 s, 639 requests); the shared index read stays as it is.
- Every link on the 20 homepages, navs and footers (60 documents, 1,700 links) answers 200.

### CPU (Workers Free: 10 ms per request)

Locally, `bench-market.mjs`, the same recorded origin answers, lean sources, medians of 25 runs,
batch 4's 80 pilot roots against batch 5's 100, back to back twice (ms of CPU, cold / warm):

| Answer | 80 roots | 100 roots |
| --- | --- | --- |
| pilot page `/hu/en/baggage` | 6.1–6.5 / 1.7–1.8 | 6.7 / 1.9 |
| pilot `search-index.json` (4.5 MB) | 50–61 / 19 | 49–50 / 19 |
| pilot `articles/query-index.json` | 7.2–8.2 / 3.6–4.3 | 6.9–7.1 / 3.5–3.6 |
| sitemap index `.xml` | 9.5–9.6 / 4.3 | 10.3–10.4 / 5.7–5.8 |
| sitemap index `.gz` | 9.9–10.1 / 5.1 | 11.9 / 6.7–6.8 |
| market sitemap file `.xml` | 12.6–13.9 / 7.4–8.0 | 11.9–12.0 / 7.0–7.5 |
| market sitemap file `.gz` | 17.8–18.4 / 12.9–13.3 | 18.2–18.4 / 13.5 |

- **The sitemap index grows**: 93 KB → 143 KB, about 1 to 2 ms more CPU. It lists every file of
  every root, and the alternates budget gives each root more, smaller files as roots are added
  (6,400 alternates per file, and every URL lists every root), so its entries grow faster than the roots
  (about with their square). Its answer is kept in the edge cache an hour per host, so the cost
  falls on one request per hour and data centre. With all 187 en and de roots it would be several
  times today's; to keep it at today's cost, the index could list a fixed number of files per root
  or be built ahead like the search data.
- Everything else costs what batch 4's did; market sitemap files stay the same size (845 → 815 KB).

## Batch 6 (2026-10-29): SA SD SE SG SI SK TH TR UA VN ZA, 22 roots

The last batch of the countries with only en and de (za as the remainder). With it, batches 1 to 6
cover those 62 countries: 122 pilot roots.

### Captures

- Plan: 102 pages: 22 homepages, 14 own pages, 66 compared with the language version; 6 same-day
  references of de/en and de/de; then the 12 app screens 123 left.
- One warm session at a time, one page every 5 to 10 s, 07:09 to 08:52 UTC.
- **The 102 pages**: all captured, no 403, one crash (the browser closed, 07:52, a new session
  after a minute); every capture has its own URL as canonical.
- **The references**: all six, no 403 (08:03 to 08:13).
- **Two homepages without a label** (the country selector had not rendered, as az/de in batch 1),
  captured again in a fresh session: sd/de got its label (08:18); sa/en's first try timed out
  while warming up (08:17).
- **The 12 app screens** (`/content/mobile/lh/{en,de}/content-pages/100-years-of-lufthansa/100-years-of-lufthansa-part-{1,2,3}.sdui`
  and `.v2.sdui`), at the end of the list over bd-fetch (from inside a www page, one every 6 s):
  **403 on the first one** (08:19, `…/en/…/100-years-of-lufthansa-part-1.sdui`, the URL that drew
  the 403 in 123 too); stopped there as agreed, all 12 left.
- **sa/en's homepage again after the 30-minute pause**: 403 (08:52). With the app screens' 403 that
  is the second block in a row: the run stopped there. Left: the sa/en homepage capture (its name
  and sa's English country name, below) and the 12 app screens.

### Locale rows

| Root | name | countryName en / de | Airport | Currency |
| --- | --- | --- | --- | --- |
| sa/de | Saudi-Arabien \| Deutsch | – / Saudi-Arabien | RUH | SAR |
| sa/en | – | – / Saudi-Arabien | RUH | SAR |
| sd/de, sd/en | Sudan \| Deutsch, Sudan \| English | Sudan / Sudan | FRA | EUR |
| se/de, se/en | Schweden \| Deutsch, Schweden \| English | Schweden / Schweden | STO | SEK |
| sg/de, sg/en | Singapore \| Deutsch, Singapur \| English | Singapur / Singapore | SIN | SGD |
| si/de, si/en | Slovenia \| Deutsch, Slowenien \| English | Slowenien / Slovenia | LJU | EUR |
| sk/de, sk/en | Slowakei \| Deutsch, Slovakia \| English | Slovakia / Slowakei | KSC | EUR |
| th/de, th/en | Thailand \| Deutsch, Thailand \| English | Thailand / Thailand | BKK | THB |
| tr/de, tr/en | Türkei \| Deutsch, Türkei \| English | Türkei / Türkei | IST | USD |
| ua/de, ua/en | Ukraine \| Deutsch, Ukraine \| English | Ukraine / Ukraine | FRA | EUR |
| vn/de, vn/en | Vietnam \| Deutsch, Vietnam \| English | Vietnam / Vietnam | HAN | VND |
| za/de, za/en | Südafrika \| Deutsch, South Africa \| English | South Africa / Südafrika | CPT | ZAR |

- Not found (`–`): sa/en's name and sa's English country name (the sa/en capture without its
  selector; the recapture was blocked): `null` until a later session captures sa/en's homepage.
- www's own oddities, taken as they are: sg and si have their labels the other way round (the
  English name on the German root, the German name on the English one), se and tr show German
  country names on their English roots, se gives the city code STO and sk KSC (Košice), sd and ua
  preselect FRA (prices in EUR, like iq, ir, ly and qa), tr shows prices in USD.
- timeZone and shopLang: null for every root, as in batches 1 to 5.

### Documents

- 22 homepages, 14 own pages and nav and footer of every root: 80 documents uploaded and previewed
  (not published).
- Own pages: sa/en `offers-to-europe1` and `local-page/companion-special-riyadh---munich-2025` (an
  offer of October/November 2025 that www still serves), se/en `discoverymode2023`, `yes`, `yes2`,
  `yes3` (campaign pages), sg/en `local-page/changi-terminal-2`, `corporate-offer-sg`, `jewel`,
  th/en `local-page/promocode-th-europe3000`, `promptpay`, tr/en `flights-ankara-munich`,
  `istanbul-airport-transfer`, `local-page/natl-campaign`.
- **`/se/en/yes3`** holds www's destination finder grid (the 315 offers of the flight offers page).
  The info template has no parser for it and took the rendered tiles as images; with 319 images
  the preview failed (409: Edge Delivery takes at most 200 images a document). Imported again with
  the hub template, whose `destination-finder (grid)` parser makes the block (the tiles are live
  data, none authored), with the info import's `flight-search` block in place of the search
  widget's text the hub template has no parser for; uploaded and previewed.
- **A document name**: Edge Delivery makes one dash of several, so www's
  `/sa/en/local-page/companion-special-riyadh---munich-2025` is the document
  `/sa/en/local-page/companion-special-riyadh-munich-2025`. `rollout.mjs --docs` now names such
  pages so (it had left the document out of the upload list), and a redirect row keeps www's URL.
- **Redirect rows for the redirect sheet** (yours to add):
  - `/sa/en/local-page/companion-special-riyadh---munich-2025` → `/sa/en/local-page/companion-special-riyadh-munich-2025`
- No www aliases (every own page has its own URL as canonical). None of www's 500 pages of batches
  4 and 5 is in this batch; they keep no document.

### Local versions

`rollout-batch6-compare.json`, against same-day de/en and de/de:
- 44 of 66 the same.
- The de roots' flight offers page: the same entry-rules teaser as batches 1 to 5 (section
  `markets` of `/de/de/fluege`).
- The en roots' flight pages: only the destination offers differ (per origin); sa/en and ua/en
  show none (as ly, mk, mt and mu); sd/en's five items are a masking artifact ("de" in "Palma de
  Mallorca" read as the language version's country code); no component differs.
- **Root documents made: none.**

### Checks against the preview origin

Local runtime, `rollout-batch6-check.json`:

| Root | www URLs | 200 | 301 | 404 | 500 | in neither language version | login/profile |
| --- | --- | --- | --- | --- | --- | --- | --- |
| sa/de | 1,047 | 953 | 1 | 93 | | 81 | 12 |
| sa/en | 1,059 | 959 | 1 | 99 | | 87 | 13 |
| sd/de | 1,047 | 952 | 1 | 93 | 1 | 81 | 12 |
| sd/en | 1,055 | 957 | 1 | 94 | 3 | 84 | 13 |
| se/de | 1,047 | 953 | 1 | 93 | | 81 | 12 |
| se/en | 1,065 | 961 | 1 | 102 | 1 | 90 | 13 |
| sg/de | 1,047 | 953 | 1 | 93 | | 81 | 12 |
| sg/en | 1,058 | 959 | 1 | 96 | 2 | 84 | 13 |
| si/de | 1,048 | 952 | 1 | 94 | 1 | 82 | 12 |
| si/en | 1,055 | 957 | 1 | 96 | 1 | 84 | 13 |
| sk/de | 1,048 | 953 | 1 | 94 | | 82 | 12 |
| sk/en | 1,054 | 958 | 1 | 95 | | 83 | 13 |
| th/de | 1,047 | 952 | 1 | 92 | 2 | 81 | 12 |
| th/en | 1,055 | 959 | 1 | 94 | 1 | 82 | 13 |
| tr/de | 1,047 | 953 | 1 | 93 | | 81 | 12 |
| tr/en | 1,055 | 959 | 1 | 94 | 1 | 82 | 13 |
| ua/de | 1,047 | 951 | 1 | 93 | 2 | 81 | 12 |
| ua/en | 1,053 | 958 | 1 | 94 | | 82 | 13 |
| vn/de | 1,047 | 953 | 1 | 92 | 1 | 81 | 12 |
| vn/en | 1,054 | 958 | 1 | 95 | | 83 | 13 |
| za/de | 1,047 | 952 | 1 | 93 | 1 | 81 | 12 |
| za/en | 1,053 | 958 | 1 | 94 | | 82 | 13 |

- Every 200 has the root's canonical. The de roots' 301 is de/de's `support/support` redirect,
  moved into the root. The en roots' 301 is new since 123's URL forms: www lists
  `/<cc>/en/profile/Best-price-alert`, which now answers a 301 to the lower-case
  `/<cc>/en/profile/best-price-alert` (a profile page, left alone: 404).
- **The 500s (17 URLs, 1 link) are the local runtime's again** ("the Worker's code had hung", 18
  times in its log): fetched again one at a time, 13 answer 200 through the market route, 4
  answer 404, the link 200.
- Every link on the 22 homepages, navs and footers (66 documents, 1,871 links) answers 200.

### CPU (Workers Free: 10 ms per request)

Locally, `bench-market.mjs`, the same recorded origin answers, lean sources, medians of 25 runs,
the code before batch 6 (100 pilot roots) against batch 6's 122, back to back twice, the sitemap
index as served since 3934c9b (built ahead, stored); then all 187 en and de roots (the 65 still to
come as synthetic rows, `--roots 187`) (ms of CPU, cold / warm):

| Answer | 100 roots | 122 roots | 187 roots (projection) |
| --- | --- | --- | --- |
| pilot page `/hu/en/baggage` | 7.1–7.5 / 2.2–2.3 | 7.0–7.3 / 2.2–2.3 | 7.2 / 2.3 |
| pilot `search-index.json` (4.5 MB) | 26–41 / 36–48 | 26–28 / 45–50 | 26 / 52 |
| pilot `articles/query-index.json` | 7.4–7.5 / 3.6–3.9 | 7.5–7.8 / 3.7–3.9 | 7.7 / 4.1 |
| sitemap index `.xml` (stored) | 6.0–6.4 / 1.9–2.0 | 6.2–8.4 / 2.0–2.6 | 6.9 / 2.9 |
| sitemap index `.gz` (stored) | 5.5–5.8 / 1.5–1.8 | 5.9–6.2 / 1.8–2.0 | 7.1 / 2.7 |
| market sitemap file `.xml` | 12.0–12.1 / 7.0–7.1 | 12.0–13.3 / 6.8–7.4 | 11.0 / 6.8 |
| market sitemap file `.gz` | 18.5–18.8 / 13.5–13.6 | 19.4–20.2 / 13.6–13.7 | 17.9 / 12.7 |

- **The sitemap index** (3934c9b, built ahead): 143 KB → 219 KB with batch 6, 503 KB with 187
  roots; served from the stored bytes it costs the model and the counts only: `.gz` cold 5.9–6.2 ms
  with 122 roots and 7.1 ms with 187, below batch 4's 10.0 ms. Made per request (until the Action
  has stored the new key, `x-lh-edge-sitemap-index: made`) it costs 14.7 / 9.0 ms with 122 roots
  and 20.9 / 16.5 ms with 187.
- Everything else costs what batch 5's did; market sitemap files stay the same size (815 → 785 KB).

## Batch 7 (2026-10-31): AO AR BE BR BY CA CL CN CO CR, en and de, 20 roots

The en and de roots of the first ten countries that also have roots in other languages; their
other-language roots wait for the language versions. 142 pilot roots.

**The test address is now `lufthansa-edge.turnsthe.page`** (lh-edge `PILOT_HOSTS`): every pilot
root answers there only. lhedge.bbird.live, the test address of batches 1 to 6, is retired.

### Captures

- Plan: 99 pages (20 homepages, 19 own pages, 60 compared with the language version) and 6
  same-day references of de/en and de/de; then sa/en's homepage and the 12 app screens left from
  batch 6.
- One warm session at a time, one page every 5 to 10 s, 16:13 to 17:29 UTC. **No 403 on any page.**
- **The 99 pages**: 93 captured in one session (16:13 to 16:57). be/de and ca/en's homepages and
  flight pages already had snapshots of 27 Oct: captured again (forced) for the same day. Every
  capture has its own URL as canonical.
- **www 500**: two ca/en own pages, `/ca/en/local-page/transfer-ita/travelling-with-children/child-in-businessclass`
  and `…/planning-with-kids`, answer www's error page (500): no document, taken off the list after
  the first answer.
- **The references**: all six (16:57 to 17:17; one session hit its time limit, the next one
  finished).
- **Homepages without a label** (only the country selector's skeleton): by/de, then be/de and
  ca/en in the forced recapture; captured again in a fresh session each, all three got their label.
- **sa/en's homepage** (batch 6's leftover): captured (17:23), label "Saudi Arabia | English".
- **The 12 app screens** (`/content/mobile/lh/{en,de}/content-pages/100-years-of-lufthansa/100-years-of-lufthansa-part-{1,2,3}.sdui`
  and `.v2.sdui`, bd-fetch from inside a www page): **403 on the first one** again (17:24,
  `…/en/…/100-years-of-lufthansa-part-1.sdui`). One plain request to that URL (no retry): 403 as
  well, `server: cloudflare`, Cloudflare's 11,304-byte "Lufthansa" page, byte for byte the size of
  the page this machine got for www's `/service/api` routes on 2026-10-31. So it shows Cloudflare
  refusing this machine, not something about the URL. All 12 left for your decision.

### Pages in the local language

None. Every capture of these en and de roots (homepages, own pages, compared pages) has its root's
language as `lang` and in its text (the common words of en, de, es, pt, fr, nl, ru counted, CJK for
zh). In www's sitemaps every path of these roots is the language version's path, apart from two
English names (ca/en `best-price-search` for de/en's `book-and-manage/best-price`, cr/en `oneTrip`
for `during-your-trip`), so no page is listed under a local-language name either.

### Locale rows

| Root | name | countryName en / de | Airport | Currency |
| --- | --- | --- | --- | --- |
| ao/de, ao/en | Angola \| Deutsch, Angola \| English | Angola / Angola | LAD | USD |
| ar/de, ar/en | Argentina \| Deutsch, Argentinien \| English | Argentinien / Argentina | BUE | USD |
| be/de, be/en | Belgien \| Deutsch, Belgium \| English | Belgium / Belgien | BRU | EUR |
| br/de, br/en | Brazil \| Deutsch, Brazil \| English | Brazil / Brazil | SAO | BRL |
| by/de, by/en | Belarus \| Deutsch, Belarus \| English | Belarus / Belarus | FRA | EUR |
| ca/de, ca/en | Kanada \| Deutsch, Canada \| English | Canada / Kanada | – | – |
| cl/de, cl/en | Chile \| Deutsch, Chile \| English | Chile / Chile | SCL | USD |
| cn/de, cn/en | China (Mainland) \| Deutsch, China (Mainland) \| English | China (Mainland) / China (Mainland) | SHA | CNY |
| co/de, co/en | Kolumbien \| Deutsch, Colombia \| English | Colombia / Kolumbien | BOG | USD |
| cr/de, cr/en | Costa Rica \| Deutsch, Costa Rica \| English | Costa Rica / Costa Rica | SJO | USD |

- Not found (`–`): ca's homeAirport and currency. www's ca homepage has no preselected origin, no
  fare teaser and no price (its flight search configures no origin): `null`, listed in
  `unverified`.
- www's own oddities, taken as they are: ar has its labels the other way round (the Spanish name on
  the German root, the German name on the English one, as sg and si in batch 6), br shows the
  English "Brazil" on its German root, cn "China (Mainland)" in both, by preselects FRA with EUR
  prices (as sd and ua), ao, ar, cl, co and cr show prices in USD, ar and br give city codes (BUE,
  SAO).
- **Batch 6's sa/en**: `name` "Saudi Arabia | English" and sa's English country name
  "Saudi Arabia" (both sa rows) from today's capture; no longer `unverified`.
- timeZone and shopLang: null for every root, as in batches 1 to 6.

### Documents

- 20 homepages, 17 own pages and nav and footer of every root: 77 documents uploaded and previewed
  (not published).
- Own pages: be/en `early-bird-september2022`, `first-class-companion`; ca/en
  `local-page/lufthansa-student-fares`; cn/en `local-page/1212-specials`,
  `local-page/china-euro-cup-2024` and its nine player-video pages (`…/european-championship-2024-player-videos-anton`,
  `-beier`, `-fuellkrug`, `-kimmich`, `-kroos`, `-leno`, `-raum`, `-ter-stegen`, `-undav`: a
  campaign of June 2024 that www still serves), `local-page/cn-en-tarmac-delay`,
  `local-page/promocode-pe-business-cn-en`, `local-page/your-winter-wonderland-escape`. At most 23
  images in a document.
- **No redirect rows** for the redirect sheet: no www alias (every own page has its own URL as
  canonical) and no document name that differs from www's URL.

### Local versions

`rollout-batch7-compare.json`, against same-day de/en and de/de:
- 39 of 60 the same.
- The de roots' flight offers page: the same entry-rules teaser as batches 1 to 6 (section
  `markets` of `/de/de/fluege`).
- The en roots' flight pages: only the destination offers differ (per origin); ca/en shows none
  (no origin).
- by/en's flight and services pages: a masking artifact ("by" is the country code and an English
  word: "eSIM by Breeze", "Be inspired by our destinations").
- **Root documents made: none.**

### Checks against the preview origin

Local runtime, `rollout-batch7-check.json`:

| Root | www URLs | 200 | 301 | 404 | 500 | in neither language version | login/profile |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ao/de | 1,045 | 952 | 1 | 92 | | 80 | 12 |
| ao/en | 1,055 | 955 | 1 | 95 | 4 | 84 | 13 |
| ar/de | 1,047 | 951 | 1 | 93 | 2 | 81 | 12 |
| ar/en | 1,056 | 957 | 1 | 97 | 1 | 85 | 13 |
| be/de | 1,051 | 951 | 1 | 97 | 2 | 85 | 12 |
| be/en | 1,058 | 958 | 1 | 97 | 2 | 85 | 13 |
| br/de | 1,047 | 951 | 1 | 93 | 2 | 81 | 12 |
| br/en | 1,055 | 957 | 1 | 96 | 1 | 84 | 13 |
| by/de | 1,047 | 951 | 1 | 92 | 3 | 81 | 12 |
| by/en | 1,055 | 957 | 1 | 96 | 1 | 84 | 13 |
| ca/de | 1,047 | 951 | 1 | 93 | 2 | 81 | 12 |
| ca/en | 1,057 | 959 | 1 | 97 | | 85 | 13 |
| cl/de | 1,047 | 952 | 1 | 92 | 2 | 81 | 12 |
| cl/en | 1,053 | 957 | 1 | 94 | 1 | 82 | 13 |
| cn/de | 1,047 | 952 | 1 | 93 | 1 | 81 | 12 |
| cn/en | 1,069 | 970 | 1 | 95 | 3 | 84 | 13 |
| co/de | 1,047 | 950 | 1 | 93 | 3 | 81 | 12 |
| co/en | 1,055 | 957 | 1 | 95 | 2 | 84 | 13 |
| cr/de | 1,046 | 951 | 1 | 92 | 2 | 80 | 12 |
| cr/en | 1,056 | 955 | 2 | 96 | 3 | 85 | 13 |

- Every 200 has the root's canonical. The de roots' 301 is de/de's `support/support` redirect,
  moved into the root; the en roots' is `profile/Best-price-alert` to lower case (as batch 6);
  cr/en's second is www's `oneTrip`, now a 301 to `onetrip` (no document).
- **The 500s (40 URLs, among them 3 links) are the local runtime's again** ("hung", 70 times in
  its log): fetched again one at a time, 35 answer 200 through the market route and 5 answer 404
  (pages the replica does not have).
- Every link on the 20 homepages, navs and footers (60 documents, 1,680 links) answers.
- **On lufthansa-edge.turnsthe.page after the deploy** (live origin, four concurrent requests):
  cn/en 958 × 200, 1 × 301, 110 × 404 (its 14 own pages are on preview only), be/de 953 × 200,
  1 × 301, 97 × 404; no 500; the two homepages' links answer 200.

### The China host

lufthansa-cn.turnsthe.page serves no pilot country and answers as before (7232ac7, deployed before
the rows): `PILOT_COUNTRIES_BY_HOST` no longer gives it cn, and its `/` goes to `ALIAS_HOME_ROOT`
cn/en only once it serves that root. After the deploy its smoke is unchanged, and `/cn/en/homepage`,
`/cn/de/homepage` and cn's sitemaps answer 404 there, as before. **To turn the China host on**:
publish cn/en's and cn/de's own documents (`/cn/en/homepage`, `/cn/en/nav`, `/cn/en/footer`, the 14
cn/en own pages above, `/cn/de/homepage`, `/cn/de/nav`, `/cn/de/footer`), then put
`; lufthansa-cn.turnsthe.page=cn` back into `PILOT_COUNTRIES_BY_HOST` and deploy: its `/` then goes
to `/cn/en/homepage`, as www's China host.

### CPU (Workers Paid; the 10 ms limit no longer applies)

`bench-market.mjs` as lufthansa-edge.turnsthe.page, locally, the same recorded origin answers
(`--record`, `--replay`), lean sources, medians of 25 runs, the code before batch 7 (122 pilot
roots) against batch 7's 142, back to back twice, the sitemap index as served (stored); then all
187 en and de roots (`--roots 187`, the 45 still to come as synthetic rows) (ms of CPU, cold /
warm):

| Answer | 122 roots | 142 roots | 187 roots (projection) |
| --- | --- | --- | --- |
| pilot page `/hu/en/baggage` | 5.3–8.9 / 1.8–3.1 | 5.2–8.2 / 1.8–2.5 | 6.8 / 2.4 |
| pilot `search-index.json` (4.5 MB) | 26–104 / 26–81 | 27–97 / 21–84 | 102 / 25 |
| pilot `articles/query-index.json` | 6.7–9.9 / 3.3–5.9 | 6.7–11.3 / 3.4–5.3 | 7.5 / 3.8 |
| sitemap index `.xml` (stored) | 5.9–7.6 / 1.8–2.4 | 5.6–8.2 / 1.9–2.5 | 6.5 / 2.5 |
| sitemap index `.gz` (stored) | 5.1–7.6 / 1.6–2.6 | 5.3–5.9 / 1.7 | 6.0 / 2.1 |
| market sitemap file `.xml` | 12.2–16.4 / 6.9–9.9 | 11.5–12.4 / 6.9–7.4 | 13.2 / 7.2 |
| market sitemap file `.gz` | 16.8–23.3 / 12.0–16.5 | 16.8–21.3 / 11.9–14.1 | 20.3 / 14.5 |

- The second pair ran on a busier machine (both code versions slower alike); between the code
  versions the numbers move within that noise.
- **The sitemap index**: 219 KB → 293 KB with batch 7 (503 KB with 187 roots); served from the
  stored bytes (`x-lh-edge-sitemap-index: stored` on lufthansa-edge after the deploy) it costs the
  model and the counts only. Market sitemap files get smaller as roots are added (785 → 753 KB).
- The search index's cold and warm medians swap between runs: Node's fetch plumbing for a 4.5 MB
  answer, an upper bound (as noted since batch 4).

### Smoke

Against the eight hosts before and after each deploy (lufthansa, lufthansa-edge, lufthansa-cn,
discover, ita, cargo, airdolomiti, austrian `.turnsthe.page`):
- 7232ac7 (the China host): 0 differences on all eight.
- 1cc9183 (batch 7's rows): only lufthansa-edge differs, in 7 rows: the ch pages (`/ch/en/baggage`,
  `/ch/de/gepaeck`, `/ch/en/baggage.solo_continue`: their hreflang alternates name the 20 new roots,
  146 alternates now, the rest equal to lufthansa.turnsthe.page's), ch's two sitemap files and the
  sitemap index. Its baseline updated. The other seven hosts: 0 differences; lufthansa.turnsthe.page's
  rows unchanged.
- lufthansa.com's 19 comparison pages: 19 of 19 equal.
- Before any change of this batch the committed baselines already differed from today's answers:
  lufthansa and lufthansa-edge (the search answers since the search data rebuild, `sitemap_lh_de_en.xml`,
  `sitemap_lh_at_de.xml.gz`), discover (four server endpoints), airdolomiti (`/`, `/en/`, `/de/`:
  its pages published); lufthansa-cn, ita and austrian have no committed baseline. smoke.mjs has
  no `--derive` since 56791d9 (the derived lhedge baseline went with that host).
