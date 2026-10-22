# destination-finder

Custom **destination-finder** block. Purpose: dynamic fare recommender: origin picker in the heading, trip type chips and a slider of recommended destinations with live prices.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: 2 columns, label | value. Rows (all optional): Heading | Flight offers from; Default origin | FRA or Frankfurt (FRA) (omitted: locale home airport); Origin input label | ...; Trip types | Round trip, One way (first = round trip, second = one way); Default trip type | One way (selects the second chip first); Trip duration | 14 (links only); Airline whitelist | yes (sent as airlineDestWhitelist); Price label | Round trip from; One way price label | One way from; Finder card | image + text + link (last slide); CTA | link; Disclaimer | text (adds * to prices; omitted: footerText of /service/api/catalogs/conditions); Conditions | title + text (omitted or title only: the catalog conditions, titled with the "Conditions label" string: Conditions / Konditionen like the live link, labels/common common.user.disclaimerandconditions.linktext); Sr heading | Recommendations for your next trip. Destinations: POST /service/api/lhg-fare-teaser/fareteaser/offers/{origin} (touchPointId 200, decisionTypeId 50, tripType R/O); the slider shows the first 15 offers in the service's order, then the finder card (like the live component; the service answers 27); the origin picker offers the market's origin cities from GET .../fareteaser/recommend. Authored links with an OriginCode parameter follow the chosen origin and trip type. Overridable UI rows: Change origin label, Trip type label, Previous label, Next label, No results label, Conditions label. UI strings have built-in English and German defaults chosen by the page language; any can be overridden with a row of the same name.

## Supported variations

### grid ("Destination Finder (grid)")

The full-page live component `dcep-destination-finder` ("Best offers", /de/en/flights): a filter column (25%) next to a grid of every destination the service returns (about 590 for FRA). The page heading ("Best offers") is default content before the block. Without the `grid` class the block is the slider above, unchanged.

Rows (2 columns, label | value, all optional):

| Row | Value | Default |
| --- | --- | --- |
| Trip duration | 14 (TripDuration of round-trip tile links) | 14 |
| Highlighted offers | 6 (maxHighlightedOffers) | 6 |
| Highlight priority | topDeal, previouslySeen, kClass | that list |
| Smart search | link (secondary button with sparkle icon, top right) | no button |
| Destination page | link or URL (baseRedirectUrl; tiles link there) | {locale}/book-and-manage/destination |
| Default origin | FRA or Frankfurt (FRA) | locale home airport (city of it per fareteaser/recommend) |
| Disclaimer | text (adds * to prices) | footerText of catalogs/conditions |
| Conditions | title + text (disclosure) | catalogs/conditions |

Any UI string can be overridden with a row of the same name (e.g. "Sort label | Sort by"). Precedence: authored row, then the live label of GET /service/api/labels/destinationFinder/lh/{lang}, then built-in English/German defaults by page language. Strings: Filter heading, Filter info, Where to fly label, Origin input label, Destination label, Destination hint, Destination no results label, Selected destinations label, Destination added label, Destination removed label, Remove label, Budget label, Budget slider label, Budget value label ("Max: {VALUE}"), Month label, Month from label, Month to label, Stops label, Nonstop label, Stops info, Info label, Travel classes label, Travel class label, Economy label, Premium economy label, Business label, First label, Airline label, All partners label, Tenant only label, Trip type label, Round trip label, One way label, Activities label, Activities info, No activities label, More activities label, Fewer activities label, Filters button label, Reset label, Reset done label, Results count label ("{NUMBER} matching destinations"), Results heading, Sort label, Sort recommended label, Sort price label, Sort alphabet label, Sorted label, Recommended label, Smart search label, Price label, One way price label, No results for origin heading, No results for origin, No results for filters heading, No results for filters, Show more label, More loaded label, All loaded label, No results label.

Data (scripts/lh-api.js): GET /service/api/destinationfinder/destination/finder/{origin city}/{cabin}?months={from}_{to}&tripType=RETURN|ONEWAY (destinationFinderOffersRequest, mapDestinationFinderOffers; through lh-proxy, the exact recording as fallback), catalogs/affinities (activities), catalogs/regions (destination typeahead), labels/destinationFinder, fareteaser/recommend (origin cities), catalogs/conditions, catalogs/localeData. Cabin codes E/N/B/F are the live travel class select values; only E with months 0_11 and RETURN is recorded. months are offsets from the current month (0_11 = the next twelve). A request that can be answered neither live nor by its exact recording shows "No results for your current origin selection" (never prices of another request, e.g. round-trip prices for one way).

Behaviour: origin, travel class, months and trip type reload; destinations (cities, countries, regions as removable chips; any of them), budget (max = highest price, compared with the displayed rounded-up price), nonstop only (numberOfStopovers 0), Lufthansa only (isTenantAirlineOperating) and activities (any of them) filter the loaded offers client-side. Sort: Recommended (up to Highlighted offers tiles picked by the priority list in the service's order, badged "Recommended" and shown first by price, then all others by price; previouslySeen is skipped, there is no visit history), Price, Alphabet. 48 tiles are rendered first, more on scroll or "Show more"; images are created at runtime only (destination square images, lazy, removed on error). Below 768px the filters other than origin/destination collapse behind a "Filters" button. data-lh-source marks the offers request (markSource, primary 'offers').

Left out (need modals, login or the visit history): "Compare cities" checkboxes, the fare-alert (clock) button on tiles, previously seen destinations, the destination detail modal, campaign mode (destinationfinder/campaign).

## Universal Editor fields

N/A (Document Authoring project)
