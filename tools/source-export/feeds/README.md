# Recorded www answers for the feed packages

Public answers of `https://www.lufthansa.com`, recorded from a browser tab on www (same-origin GET, no cookies,
one request every 2 seconds). They are the reference the lh-edge Worker and its diff scripts compare against.
Values that look like keys or ids of partners are blanked before anything is committed here.

| folder | what | recorded |
|---|---|---|
| `webviews/www-solo-pages.json` | the pages the Lufthansa app opens in its web view, as `<path>.solo_continue` for de/en, de/de, at/de, gb/en, plus the two US privacy pages and the other solo URL forms (`.solo.continue`, `.solo.continue.solo_continue`, `.solo_continue.html`, `.solo_continue.genapp.html`, a query string). Per URL: status, canonical, title, robots, lang, h1-h4, link hrefs, text of `<main>` (scripts and styles removed, cut at 30,000 characters). Not the full HTML. | 2026-10-25 18:14-18:21 UTC |
| `webviews/webview-aliases.csv` | draft of the DA sheet `/app/config/webview-aliases`: the path the app asks for, per locale, and the replica page that answers it. `note` says where the mapping comes from: `www canonical` (www's canonical of the solo page), `404 on www; German counterpart in the replica` (www answers 404 for the English page name in de/de and at/de; the replica maps it to the German page), `market-only page` (the two US pages). | derived from the recording |
| `well-known/assetlinks.json`, `well-known/apple-app-site-association` | www's App Links and Universal Links files, byte for byte (www sends `application/json` and `application/octet-stream`) | 2026-10-25 18:21 UTC |

Paths the app opens that answer 404 on www in all four locales (no alias, lh-edge answers 404 as well):
`on-board-overview`, `data-protection`, `prepare-for-your-trip/baggage/baggage-calculator`, `book-a-flight/our-destinations`.

All five solo URL forms answer the same page on www (status 200); `.solo.continue` and `.solo.continue.solo_continue`
give the canonical without a suffix, the others with `.solo_continue`. A query string is kept.

## App screens (SDUI), `sdui/`

`sdui/<lang>/<path>.sdui.json` (v1) and `sdui/<lang>/<path>.v2.sdui.json` (v2) for the 64 Lufthansa app screens
(per language: the hub `articles`, 7 category lists, 24 articles) and the home screen `homepage`, de and en:
132 answers, all 200, recorded 2026-10-25 18:21-18:36 UTC with a plain GET (the dispatcher does not vary on the
app's request headers). `sdui/index.json` maps each URL to its file with status and headers (`cf-cache-status:
DYNAMIC`, no `cache-control`). Image URLs inside are absolute `https://www.lufthansa.com/content/dam/...`.

## GraphQL persisted queries, `graphql/`

47 answers of `/graphql/execute.json/<config>/<query>[;name=value...]`, recorded 2026-10-25 18:36-18:41 UTC:
every variable combination listed in the feed brief, the error answers for missing required variables (HTTP 200
with a GraphQL error body) and one unknown query (404 body). `graphql/index.json` maps URL to file, status and
headers (`cache-control: public, max-age=120`, `last-modified` is the query's own edit time, not the data's).

- Variables are path parameters. Path values must keep their slashes: www answers 404 when they are `%2F`-encoded.
- Travel regulations: `TravelRegulationsByPath` without a path returns all 24 entries without their country;
  15 countries were asked by path (`travelready-infohub/<cc>`): 13 answer with data (ca, cn, il, in, jp, ke, mv, my,
  th, ng, na, tn, us) plus za, ec and gb are empty.
- Ancillary catalog (`Ancillary-on-TMC/get-ancillaries-catalogs`): `properties` values are blanked when the
  property name suggests a key or an id (`apiKey`, `clientID`, `partnerId`, `aid`, `urlId`, `ptid`...) or the value
  looks like a token; names, image URLs and airport lists are kept (30 values blanked, 15 kept).
- Data errors in www's answers, not to be reproduced (to report to Lufthansa): links to `qa-www.lufthansa.com` in the
  ancillary catalog (7), and doubled image URLs there.
- Message Center queries are not here: `tools/workers/lh-messages/test/fixtures/` has them.
- Failing and unknown queries (recorded 2026-10-25 21:38 UTC, bodies byte for byte): `TravelRegulationList` and
  `benefitcardimageList` answer 500 with a `QueryValidationError` body and no `cache-control`; `B2BNeo/getLoginConfig`
  answers 200 with a missing-fragment error; `B2BNeo/getLoginConfigByPath` without `path` 200 with a variable error;
  an unknown query or configuration 404 with "... does not resolve to an existing Persistent Query".

## Login URL, `login/loginpageurl.json`

`GET /service/secured/api/core/authenticate/loginPageUrl?state=/<cc>/<ll>/homepage` for the four locales with the
headers `X-Portal: LH`, `X-Portal-Site: <CC>`, `X-Portal-Language: <ll>` (200 JSON `{loginPageUrl}` with the Travel
ID authorize URL; `cache-control: private, no-cache, no-store, must-revalidate`, `access-control-allow-origin: *`),
and twice without the headers (500 HTML). Recorded 2026-10-25 18:38 UTC.

## Header, footer and portal config JSON, `owa/`

`/content/lh/markets/<cc>/<ll>/homepage.csi-owa-{header,footer,portal-config}.json` for the four locales,
recorded 2026-10-25 07:30-07:37 UTC (`Cache-Control: max-age=300, public`). `owa/index.json` has status and headers.

## Booking endpoints, `booking/`

`GET /service/secured/api/core/booking/defaultairport` with `X-Portal: LH`, `X-Portal-Site: <CC>`,
`X-Portal-Language: <ll>` for DE, AT, GB (200 JSON `{globalDefaultAirport: {iataCode, name}, marketDefaultAirport:
{iataCode, name}}`: FRA, VIE, LHR) and once without the headers (400 `{"error":"Missing headers",...}`);
`GET /service/secured/api/core/booking/bookinglist` (204, empty body). All `private, no-cache, no-store,
must-revalidate`. Recorded 2026-10-25 21:40 UTC; `booking/index.json` lists request headers and status.

## Favicon and web app manifest, `favicon/`

www's icons under the same paths as on www (`favicon/etc/designs/dcep/...`), byte for byte, recorded 2026-10-25 22:48 UTC.
Every www page has `<link rel="manifest" href="/etc/designs/dcep/manifest.json">` and
`<link rel="shortcut icon" href="/etc/designs/dcep/favicon.ico" type="image/ico">`. `favicon.ico` (32,988 bytes, 4 sizes
up to 64x64) has `cache-control: public, max-age=2592000`; `/favicon.ico` answers 301 to `/etc/designs/dcep/favicon.ico`.
The manifest (723 bytes) lists `clientlib-all/img/icon_{192x192,32x32,16x16}.png` (8,182, 1,003 and 450 bytes).

## DAM assets to copy, `dam/dam-assets.csv`

6,945 asset paths as www has them (`/content/dam/...`, decoded: spaces, apostrophes and capitals as on www),
with where each one comes from (`sources`) and the rendition widths seen (`widths`):

| source | assets | from |
|---|---|---|
| `aircore` | 712 | `tools/migration-scope/aircore-dam-images.csv` (copies already in DA under `/aircore-images/`) |
| `destination` | 682 | every `lh/images/offers/destination/<code>-{square,panorama}.jpg` for the 324 codes seen in the Internet Archive's captures of www (and cinescope where seen); the app loads widths 360 and 1440 |
| `destination-fallback`, `offers-fallback` | 210, 4 | `lufthansa-group/images/destination/*` and `lh/images/offers/fallback/*` from the same captures (targets of the missing-image fallback) |
| `app-screens` | 181 | image URLs inside the recorded `.sdui` and `.v2.sdui` answers |
| `mobileapp` | 49 | What's new images in the recorded GraphQL answers (many with spaces, `'` or capitals) |
| `tmc`, `graphql` | 37, 2 | Trip Management catalog images and B2B images in the recorded GraphQL answers; the 4 doubled URLs in www's catalog (`.../all-service-page/https://www.lufthansa.com/content/dam/...`) are listed once under their inner path |
| `replica` | 13 | icons the replica's recorded labels load from www |
| `articles` | 5,408 (5,372 new, 36 also in other sources) | every `/content/dam/...` URL in the 2,773 exported article, category, tag and author pages (`tools/source-export/articles/`, 2026-10-26): 4,560 jpg (article images, `lufthansa-group/images/local_images`, POI images under `lufthansa-group/poi/de`), 290 mp4 and 525 vtt (the audio travel guides under `video/c3/audiotravelguide`), 13 pdf, 11 png, 5 txt, 3 jpeg, 1 svg; widths from the `.transform/lh-dcep-transform-width-<n>/` renditions seen |

Not in the list: lounge images (`lh/images/lounges/<loungeid>-square.jpg` and `fallback-square.jpg`); their ids come from
the lounge finder's search answers.

## Destination page and prices, `destination/`

`destination/<cc>-<ll>.ndjson`: the `/service/api` answers www's pages loaded themselves when viewed once each through the
warm Bright Data session (`tools/importer/bd-record-api.mjs --set destination`, 2026-10-25 22:44-22:49 UTC; the full
recording with every answer and the rendered markup stays in `tools/source-export/api/watched/`, not committed): the
destination page `/<cc>/<ll>/book-and-manage/destination?OriginCode=..&DestinationCode=..&TripDuration=7&Cabin=E` for
FRA-CHI (de/en), MUC-NYC (de/de), VIE-BKK (at/de), LON-CPT (gb/en) (destinationfinder/destination/content,
destinationfinder/flightinfo, flight-prices MONTHS and DAYS, ondcontrol/validateOriginAndDestination, labels/singleOfferDisplay,
catalogs/localeData), an article with a sticky price (`teaser/price/FRA`: 204 from the German market) and the de/en
homepage. `destination/pages/*.jpg`: full-page screenshots of the four destination pages at 1440. For tests and
documentation only (`test/destination-offer.test.mjs`, `blocks/destination-offer/README.md`); no block shows these prices.

## Site search, `search/`

www's site search, recorded 2026-10-26 00:53 UTC: `POST /service/secured/api/search` with `{"phrase": "<phrase>"}`,
`X-Portal: LH`, `X-Portal-Site`, `X-Portal-Language`, no credentials. 10 phrases per locale (40 answers,
`search-<cc>-<ll>-<phrase>.json`, bodies byte for byte), `search-no-headers.json` and `search-empty-de-en.json` (both
400 `{"error":"Invalid input",...}`), the four search result pages `page-<cc>-<ll>.html`
(`/<cc>/<ll>/support/search/search-result`, all 200) and `index.json` (file, URL, request headers and body, status,
content type, size, phrase, locale). Answers are `{results, total, pageSize: 10}` with at most 30 results; `total` is
the number returned. No `cache-control` on any answer. Result links are AEM paths (`/content/lh/markets/de/en/...`),
not public URLs.

| phrase | de/en | gb/en | phrase | de/de | at/de |
|---|---|---|---|---|---|
| baggage | 30 | 30 | Gepäck | 30 | 30 |
| check-in | 30 | 30 | Check-in | 30 | 30 |
| refund | 27 | 26 | Erstattung | 18 | 23 |
| lounge | 30 | 24 | Lounge | 30 | 24 |
| wifi | 3 | 3 | WLAN | 6 | 6 |
| pets | 3 | 3 | Tiere | 6 | 6 |
| wheelchair | 4 | 4 | Rollstuhl | 3 | 3 |
| miles and more | 30 | 30 | Miles & More | 30 | 30 |
| seat reservation | 17 | 17 | Sitzplatzreservierung | 12 | 12 |
| rebooking | 22 | 20 | Umbuchung | 17 | 22 |
