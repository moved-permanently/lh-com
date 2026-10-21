# flight-search

Custom **flight-search** block. Purpose: flight search form (trip type, travellers, nonstop, origin/destination autocomplete, dates) that hands the search off to shop.lufthansa.com.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: 2 columns, label | value. Rows (all optional): Tabs | Flights; Trip types | Round trip, One way (first = round trip, second = one way); Default trip type | Round trip; Traveller label | Economy, 1 Traveller; Nonstop label | Nonstop only; From label | From; Default origin | Frankfurt (FRA) or FRA (omitted: the locale home airport); Default destination | code; To label | To; Date label | Departure - return (split at ' - ' into the two date labels); Date error | Please provide travel date(s); Submit label | Search flights; Where we fly | link; Cabin | E; Adults | 1. Overridable UI rows: Trip type label, Swap label, Departure label, Return label, Origin error, Destination error, No results label. UI strings have built-in English and German defaults chosen by the page language; any can be overridden with a row of the same name.

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)
