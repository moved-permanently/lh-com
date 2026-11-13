# lounge-finder

Custom **lounge-finder** block. Purpose: the live lounge finder (`.loungefinder > .dcep-lounge-finder`): a city field, a "Travel Class or Frequent Flyer Status" select and a "Search lounges" button in a grey band; a search lists the lounges of the city for that class or status as cards (type, name, location, opening hours, hint, amenities).

## Authoring (Document Authoring)

Model: `standalone`. Put the block in its own section with Section Metadata `style | grey` (the live band is `.container-gray`, `py-8` = 40px; the block adds what the grey section padding lacks).

Single block table, 2 columns, label | value. All rows optional:

| Row | Value | Default |
| --- | --- | --- |
| Image base | /content/dam/lh/images/lounges (data-dcep `imageBaseUrl`) | that path |
| Lounge purchase | off (removes Economy from the select) | on (the live switch TEX-APEX-DHTE-22006-lounge-purchase is on) |

Any UI string can be overridden with a row of the same name ("Submit label | Search lounges"). Precedence: authored row, then the live label of GET /service/api/labels/loungefinder/lh/{lang}, then built-in English/German defaults (copies of the recorded de/en and de/de labels). Strings: Heading, City label, City placeholder, Status label, Class group label, Status group label, Status FIR, Status BUS, Status ECO, Status HON, Status SEN, Status FTL, Status STA, Submit label, City required label, Status required label, Results label, Results found label, No results label, No cities label, Loading label, Opening hours label, Location label, Amenities label, Show amenities label, Hide amenities label, Closed label, And label, Weekend label, Monday label … Sunday label, Price prefix label, Price label ("{PRICE} {CURRENCY}"), Purchase label, Lounge type label; feature and lounge category names as "Feature WLAN | Wi-Fi" (live keys loungefinder.results.details.feature.{CODE}).

## Behaviour

- Form (live order and labels): heading (`form.headline.redesignHeadlineText`, "Finden Sie Ihre Lounge"), city autocomplete over GET /service/api/catalogs/lounges/cities (localized by market; typing two letters filters the names and codes, a fully typed city name counts as chosen), select with the groups Reiseklasse (First Class FIR, Business Class BUS, Economy ECO) and Vielfliegerstatus (HON Circle Member HON, Senator SEN, Frequent Traveller FTL, Star Alliance Gold STA), yellow submit button. Missing city or status: the live required texts under the fields, no request.
- Deep link (the live "prefilled" state): `?city=FRA&status=SEN` (also `cabin=BUS|FIR`: a basic/FTL status with cabin BUS searches BUS, STA stays STA; cabin FIR searches FIR unless HON) preselects both; the visitor submits.
- Search FIR/BUS/HON/SEN/FTL/STA: GET /service/api/catalogs/lounges/{status}/{city} (scripts/lh-api.js `loungesRequest`, `mapLounges`): on www's own hosts a same-origin call with the market's X-Portal-* headers; on our hosts www's recorded answer from /data/lounges (below), never a call to www.
- Search ECO (lounge purchase): GET https://amp.yiluhub.com/product/v1/products?storeId=6662ff1e7d41365f96988306&airport={airport} (LON tries LHR first, NYC JFK, DTT DTW, MIL MXP, then the city code; 400 = next), then catalogs/lounges/BUS/{city}; only lounges Yilu sells (fixed Yilu→loungeid table of the live app) are listed, with "from {PRICE} {CURRENCY}" (regularPrice, else defaultPrice.price.amount / 100) and "Purchase Lounge Access" → https://lufthansa.travelintegration.com/lounges/product?loungeId={yiluId}&airportIataCode={airport}&utm_source=web-lounge-finder&utm_medium=LH&utm_campaign=lounge-voucher&utm_content=result-lounge-item-cta&touchpoint=web-lounge-finder (new tab). Yilu is called directly (3 s timeout) and is never recorded: when it does not answer, Economy shows the no-lounge message.
- Results: "Ergebnisse (N)", one white card per lounge: square image `{Image base}/{loungeid}-square.jpg.transform/lh-dcep-transform-width-720/img.jpg` (srcset 180–2560, `fallback-square.jpg` on 404), category badge (`loungeType` with the feature label of `category`), name, location (airport, terminal; level; gate info, or `plainLocation`), opening hours table (Monday–Friday and the weekend each in one row when alike, else per day; "05:30 - 22:00 and …", closed label; `openingHours` text when the week is missing), `loungeDescription` as a warning hint, amenities (`loungefeatures`, icon + label, four per row). From 1025px details and amenities sit side by side; below, a "View amenities" / "Back to overview" button switches the card.
- No answer at all (or an empty list): the live label `form.response.empty` ("Leider haben wir keine Informationen über Lounges in der von Ihnen ausgewählten Stadt.").
- data-lh-source: before a search labels + cities (primary), after it the lounges (and Yilu `products` for ECO) are primary; data-lh-sources lists all (markSource).
- Left out: the sticky "edit search" button of the live mobile view after a search (the form stays), the analytics events, the error box listing every error above the form.

/at/de/lounges showed English texts on preview because its live snapshot (bd-snapshots/www.lufthansa.com/at/de/lounges.html) caught the app after GET catalogs/lounges/cities failed ("You are not authorized to access this resource.", FETCH_CITIES error box): the app then renders its built-in English defaultMessages ("Find your airport lounge", "Travel Class or Travel Status", "Search lounges", a plain city dropdown), and the importer froze that text into content/at/de/lounges. The at/de snapshot of tips-senior-travellers and the recorded at/de labels (labels/loungefinder/lh/de) are German. With this block the at/de texts come from those labels (tested offline: "Finden Sie Ihre Lounge", "Lounge finden").

## Import

Source: `.loungefinder > .dcep-lounge-finder` (8 pages: /{de/de,de/en,at/de,gb/en}/lounges and /{…}/tips-senior-travellers), `data-dcep` `{"imageBaseUrl":"/content/dam/lh/images/lounges"}` (the same on all 8).

- Replace the whole rendered form (everything inside `.loungefinder`: the error box, the headline, field labels, button text) with one `lounge-finder` block. Write none of its text: the labels come at runtime per language, so the frozen English of the at/de/lounges snapshot disappears.
- Rows: write `Image base | {imageBaseUrl}` only when imageBaseUrl differs from `/content/dam/lh/images/lounges` (currently never), i.e. an empty block (one row `Lounge finder` header only) is the normal output. If the importer cannot write an empty block, write `Image base | /content/dam/lh/images/lounges`.
- Section: the `.loungefinder` component gets its own section with `style | grey` (as the current static import does), placed where the live component is (after the intro image and the separator).
- Implemented in `tools/importer/parsers/lounge-finder.js`, mapped as `.loungefinder:has(> .dcep-lounge-finder)` in the hub (lounges) and info (tips-senior-travellers) templates; the grey section comes from the sections transformer (the `.container-gray` inside the component).

## Data on our hosts (brief 539)

www's lounge API refuses our origins (CORS) and Workers (its bot rule), so on the demo hosts (scripts/demo.js: turnsthe.page, aem.page / aem.live, localhost) the three routes the finder calls are answered from www's recorded answers in the repo, `data/lounges/` (scripts/lounge-data.js through scripts/lh-data.js `lhFetch`; lufthansa.com's portal only), and www is never called. On www's own hosts nothing changes.

- `labels-<ll>.json`, `cities-<ll>.json`: GET labels/loungefinder/lh/<ll> and catalogs/lounges/cities (de from /de/de, en from /de/en).
- `<ll>/<STATUS>/<CITY>.json`: GET catalogs/lounges/<STATUS>/<CITY>, only answers with lounges; `manifest.json` lists every recorded answer with its lounge count (0: an empty answer, no file).
- Languages: de pages read de, every other language en (labels, city names and the answers' two text fields, plainLocation and openingHours).
- No match: a recorded empty answer and a status and city never recorded both show the finder's own `form.response.empty` label.
- Refresh: the capture child's archives (lh-lounges-api-NNN, www's own JSON per status, city and language), then `node tools/lounges/build-lounge-data.mjs --onload <lh-lounges-api-001> --answers <dir> [--answers <dir> …]`, a commit and a push (code: live at once, no publish step). Tests: test/lounge-data-539.test.mjs.
- www's own de label `form.response.results` reads "Leider steht unter den ausgewählten Suchkriterien keine Lounge zur Verfügung" (it means "no lounge"); the screen-reader status after a de search says that, as on www.

## Universal Editor fields

N/A (Document Authoring project)
