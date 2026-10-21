# destination-finder

Custom **destination-finder** block. Purpose: dynamic fare recommender: origin picker in the heading, trip type chips and a slider of recommended destinations with live prices.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: 2 columns, label | value. Rows (all optional): Heading | Flight offers from; Default origin | FRA or Frankfurt (FRA) (omitted: locale home airport); Origin input label | ...; Trip types | Round trip, One way (first = round trip, second = one way); Default trip type | One way (selects the second chip first); Trip duration | 14 (links only); Airline whitelist | yes (sent as airlineDestWhitelist); Price label | Round trip from; One way price label | One way from; Finder card | image + text + link (last slide); CTA | link; Disclaimer | text (adds * to prices; omitted: footerText of /service/api/catalogs/conditions); Conditions | title + text (omitted or title only: the catalog conditions); Sr heading | Recommendations for your next trip. Destinations: POST /service/api/lhg-fare-teaser/fareteaser/offers/{origin} (touchPointId 200, decisionTypeId 50, tripType R/O); the origin picker offers the market's origin cities from GET .../fareteaser/recommend. Authored links with an OriginCode parameter follow the chosen origin and trip type. Overridable UI rows: Change origin label, Trip type label, Previous label, Next label, No results label. UI strings have built-in English and German defaults chosen by the page language; any can be overridden with a row of the same name.

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)
