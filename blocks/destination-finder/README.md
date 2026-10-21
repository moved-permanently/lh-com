# destination-finder

Custom **destination-finder** block. Purpose: dynamic fare recommender: origin picker in the heading, trip type chips and a slider of recommended destinations with live prices.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: 2 columns, label | value. Rows (all optional): Heading | Flight offers from; Default origin | FRA (omitted: locale home airport); Origin input label | ...; Trip types | Round trip, One way (first = round trip, second = one way); Trip duration | 14; Price label | Round trip from; One way price label | One way from; Region | region code (switches to the region finder route); Finder card | image + text + link (last slide); CTA | link; Disclaimer | text (adds * to prices); Conditions | text or link; Sr heading | Recommendations for your next trip. Authored links with an OriginCode parameter follow the chosen origin and trip type. Overridable UI rows: Change origin label, Trip type label, Previous label, Next label, No results label. UI strings have built-in English and German defaults chosen by the page language; any can be overridden with a row of the same name.

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)
