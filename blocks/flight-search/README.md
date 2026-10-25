# flight-search

Custom **flight-search** block. Purpose: flight search form (trip type, travellers, nonstop, origin/destination autocomplete, dates) that hands the search off to shop.lufthansa.com as a POST form navigation to `/booking/availability` (fields `lang`, `portalCountry`, `search` JSON; see `tools/importer/IMPORT-NOTES.md`, Shop handoff).

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: 2 columns, label | value. Rows (all optional): Tabs | Flights; Trip types | Round trip, One way (first = round trip, second = one way; a missing second type gets the live one-way label); Default trip type | Round trip; Traveller label | Economy, 1 Traveller; Nonstop label | Nonstop only; From label | From; Default origin | Frankfurt (FRA) or FRA (omitted: the market default airport from /service/api/defaultAirport, like the live prefilled origin); Default destination | code; To label | To; Date label | Departure - Return (split at ' - ' into the two date labels); Date error | Please provide travel date(s); Submit label | Find flights; Where we fly | link; Cabin | E (E economy, P premium economy, B business, F first); Adults | 1. Overridable UI rows: Trip type label, Swap label, Departure label, Return label, One way date label, Return date error, Origin error, Destination error, Same airport error, No results label. UI strings: an authored row wins, then the live labels (/service/api/labels/flightmanager and common), then built-in English/German defaults. The importer does not write the From/To/Date/Submit label rows or the date error (the snapshots show the flight manager's built-in texts, e.g. "Search flights", "Departure - return"; the live site shows the labels: "Find flights", "Departure - Return"), and authors only the selected trip type when the dropdown is not rendered (the one-way option then gets the live label "One-way" / "Einfacher Flug").

Behaviour: a chosen airport shows its name only ("Frankfurt", like the live prefilled origin); a typed code without a name shows the code.

Tabs: the Tabs row lists the live flight manager's tabs (Flights / Flüge, Flug & Hotel, Rental car / Mietwagen, Hotel); the kind of a tab follows from its label. `Active tab | Hotel` selects a tab other than the first. In the standalone variant, or as soon as a tab other than Flights is listed, the block shows a tab bar (icon only below 768px): the Flights tab shows the flight search, the Hotel tab the hotel search, and every other tab (rental car, flight + hotel) opens the same page on www.lufthansa.com in a new tab. Without a flight tab no live flight data is loaded (`data-lh-source="none"`; only the hotel button label).

Hotel tab (Booking.com, /de/en/hotel-offers, the hotel tab on /de/en/cash-and-miles): Location (empty), Check-In (today) and Check-Out (tomorrow) with hints, footnote, "Search hotel" button and a close button (from 768px; it closes the tab content, a tab opens it again). Rows (all optional, the importer writes them from the rendered hotel tab): Location label, Location hint, Location error, Check-in label, Check-in hint, Check-in error, Check-out label, Check-out hint, Check-out error, Check-out order error, Hotel footnote, Hotel submit label, Hotel external note (the button's "external website" tooltip), Close label, Live page (link). Defaults: the live hotel tab's built-in English texts, which the live site shows in every market (German only for the tooltip and the close button). The button text comes from the live label bundle (`labels/flightmanager`, `flightmanager.hotel.default.searchButton`: "Hotelsuche" on de/de and at/de, "Search hotel" on de/en and gb/en), as the flight tab gets its labels, also without a flight tab; a Hotel submit label row other than "Search hotel" wins. Handoff: the live tab posts the search to its booking service (`/booking/hotel`), which answers with the Booking.com address for a new window; that service cannot be called from here, so a valid search opens the live page (the Live page row, else the same path on www.lufthansa.com) in a new tab; nothing is sent.

## Supported variations

- `standalone`: the flight manager outside the homepage stage (`.flm-standalone`: flight search, stopover, cash-and-miles, hotel offers): a white card with a shadow and the tab bar, the form 20px inside.

## Universal Editor fields

N/A (Document Authoring project)
