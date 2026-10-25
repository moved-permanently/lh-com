# price-bar

Custom **price-bar** block. Purpose: sticky destination bar with the live lowest round-trip price and a link to find flights; shown from page load, hidden while the footer is in view.

Price: GET `/service/api/teaser/price/{destination}` as www's sticky price calls it (`{"currency":"EUR","destination":"Berlin","price":141.26}`: the market's lowest round trip; www picks the origin), directly on www.lufthansa.com with the market's X-Portal-* headers; shown rounded up with the currency (`142 €`); no answer, no price (never a recorded price). Without a Title row the destination name of the answer is the title; without a title and without a price the bar is hidden (www hides its bar when its price call answers 204, e.g. /service/api/teaser/price/FRA from the German market, recorded 2026-10-25). `data-lh-source`: `live` or `none`. An authored Origin row is ignored (the route has no origin).

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: 2 columns, label | value. Rows: Title | Berlin; Destination | BER (IATA code, also 'Berlin (BER)'; without it no price is requested); Price label | Round trip from (defaults: Round trip from / Hin- und Rückflug ab); Link | [Find Flights](/de/en/book-and-manage/offers-and-destination?BpsDestination=BER) (empty query parameters such as OriginCode= are dropped; without a link the locale's offers-and-destination page for the destination is used, labelled by the live stickyprice ctaLabel or Link label: Find flights / Flüge finden); Trip duration | 7; Cabin | E. The price is fetched at runtime (POST /service/api/lhg-fare-teaser/fareteaser/manual via lhFetch, exact request only: the live sticky price request is not captured yet) and shown only when one arrives for this origin and destination; title and link always render. The bar is fixed at the bottom of the window from page load and hides while the footer is visible; its place in the document does not matter (the importer puts it in the 2nd section). Unknown rows are ignored.

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)
