# price-bar

Custom **price-bar** block. Purpose: sticky destination bar with the live lowest round-trip price and a link to find flights; appears once the reader scrolls past its position.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: 2 columns, label | value. Rows: Title | Berlin; Destination | BER (IATA code, also 'Berlin (BER)'; without it no price is requested); Origin | optional IATA code (default: the market default airport from /service/api/defaultAirport, else the locale home airport); Price label | Round trip from (defaults: Round trip from / Hin- und Rückflug ab); Link | [Find Flights](/de/en/book-and-manage/offers-and-destination?BpsDestination=BER) (empty query parameters such as OriginCode= are dropped; without a link the locale's offers-and-destination page for the destination is used, labelled by the live stickyprice ctaLabel or Link label: Find flights / Flüge finden); Trip duration | 7; Cabin | E. The price is fetched at runtime (POST /service/api/lhg-fare-teaser/fareteaser/manual via lhFetch, exact request only: the live sticky price request is not captured yet) and shown only when one arrives for this origin and destination; title and link always render. Place the block as the 2nd section (its position decides when the bar appears). Unknown rows are ignored.

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)
