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
- Search FIR/BUS/HON/SEN/FTL/STA: GET /service/api/catalogs/lounges/{status}/{city} (scripts/lh-api.js `loungesRequest`, `mapLounges`), directly on www.lufthansa.com with the market's X-Portal-* headers, else the exact recording, else nothing.
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

## Recording (for the browser agent)

Recorded already (data/recorded/index.json): labels/loungefinder/lh/{de,en} and catalogs/lounges/cities for de/en, de/de, at/de, gb/en. Missing: the result answers. Record per market with the market's own X-Portal-* headers (the answers are localized), from the market's lounges page, GET:

| Market | City | URLs |
| --- | --- | --- |
| de/de, de/en | FRA | https://www.lufthansa.com/service/api/catalogs/lounges/{FIR,BUS,HON,SEN,FTL,STA}/FRA (6 URLs per market) |
| de/de, de/en | MUC | https://www.lufthansa.com/service/api/catalogs/lounges/{FIR,BUS,HON,SEN,FTL,STA}/MUC |
| at/de | VIE | https://www.lufthansa.com/service/api/catalogs/lounges/{FIR,BUS,HON,SEN,FTL,STA}/VIE |
| gb/en | LON | https://www.lufthansa.com/service/api/catalogs/lounges/{FIR,BUS,HON,SEN,FTL,STA}/LON |

That is 6 statuses × (FRA + MUC for de/de and de/en, VIE for at/de, LON for gb/en) = 36 requests. Economy (ECO) needs no catalogs URL of its own: it uses …/BUS/{city} (above) plus the Yilu product answer, which the recorder (record-live-data.mjs, lufthansa.com routes only) cannot store. Each answer is `{"lounges":[...]}`; check the shape against `mapLounges` (scripts/lh-api.js) once recorded: the fields were taken from the live selectors, no real answer has been seen yet. An empty city (`{"lounges":[]}`) is a valid answer worth recording too (the no-lounge message).

## Universal Editor fields

N/A (Document Authoring project)
