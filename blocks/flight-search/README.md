# flight-search

Custom **flight-search** block. Purpose: flight search form (trip type, travellers, nonstop, origin/destination autocomplete, dates) that hands the search off to shop.lufthansa.com as a POST form navigation to `/booking/availability` (fields `lang`, `portalCountry`, `search` JSON; see `tools/importer/IMPORT-NOTES.md`, Shop handoff).

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: 2 columns, label | value. Rows (all optional): Tabs | Flights; Trip types | Round trip, One way (first = round trip, second = one way; a missing second type gets the live one-way label); Default trip type | Round trip; Traveller label | Economy, 1 Traveller; Nonstop label | Nonstop only; From label | From; Default origin | Frankfurt (FRA) or FRA (omitted: the market default airport from /service/api/defaultAirport, like the live prefilled origin); Default destination | code; To label | To; Date label | Departure - Return (split at ' - ' into the two date labels); Date error | Please provide travel date(s); Submit label | Find flights; Where we fly | link; Cabin | E (E economy, P premium economy, B business, F first); Adults | 1. Overridable UI rows: Trip type label, Swap label, Departure label, Return label, One way date label, Return date error, Origin error, Destination error, Same airport error, No results label. UI strings: an authored row wins, then the live labels (/service/api/labels/flightmanager and common), then built-in English/German defaults.

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)
