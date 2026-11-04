# booking-box

Custom **booking-box** block. Purpose: an airline's booking box handed off to that airline's own booking engine. Only `Format | tap` for now: TAP Air Portugal's box from www.flytap.com's homepages (spec: `tools/reports/tap/booking-spec.md`, sections 4 and 5).

## Authoring (Document Authoring)

Model: `standalone`

Single block table, 2 columns, key | value; every row optional but Format.

| Row | Example (pt-pt) | Meaning |
|---|---|---|
| Format | tap | the hand-off and airport rules; another value: the block shows nothing |
| Market | PT | market code for the hand-off (default: the root's country) |
| Language | pt | language for the hand-off and the calendar (default: the root's language) |
| Default origin | LIS | prefilled origin (default: the market's airport, PT LIS, ES MAD, FR PAR, DE FRA, IT FCO, PL WAW) |
| Default origin name | Lisboa, Portugal | the origin's "City, Country" before the sheet is loaded (without it: the code until then) |
| Airports | link to `/pt-pt/booking/airports.json` | the airport sheet (default `<root>/booking/airports.json`) |
| Tabs | Reservar voo, Fazer Check-in, Gerir reserva, Estado do voo | the four tabs' labels, in this order |
| Flight status page | link | the flight status tab's button (default: www's `#special-anchor-flight-status`) |
| Login page | link | the Login button of the check-in and manage tabs (default: www's `#special-anchor-login`) |
| Corporate link | [Reservas para empresas](https://tapforbiz.com/) | the link next to the trip types, new tab |
| Labels | `round-trip` \| Ida e volta | one row per key of `tools/reports/tap/booking-labels.json`, by TAP's key or its English text (`Round trip`); English without one |

Further label rows, TAP's own keys: `ibe.login`, `login-and-make-easier`, `ibe.reservation-details`, `ibe.reservation-number`, `ibe.passenger-lastname`, `ibe.find-reservation`, `validation-invalid`. Ours (no TAP text): `same-airports`, `flight-status-text`, `remove-flight`, `previous-month`, `next-month`, `close`, `fewer`, `more`, `new-tab`.

The airport sheet: columns `code, city, cityName, airportName, country, countryName, tapRoute, railway` (spec 5.3).

## Behaviour

- Tabs: an ARIA tablist (arrow keys, Home, End). `#book-flight`, `#check-in`, `#my-travels`, `#flight-status` and TAP's `#special-anchor-<tab>` select a tab and scroll the box into view, on load and on `hashchange`.
- Book: trip types (Round trip, One way, Multi-city with 2 to 6 flights, each new one from the last destination), Pay with miles, the airport fields (`scripts/airport-combobox.js` with `minChars: 0`, a code chip, "City, Airport" and the country in the list, "City, Country" in the field), TAP's matching (`airport-match.js`), a range calendar without prices (two months from 768 px, one below; Monday first; no past days; typed DD/MM/YYYY; Clear and Continue; a keyboard grid), the passengers with TAP's rules (`tap-format.js`: at most 9, one infant per adult, young adults only on a UK route).
- Search: the URL from `buildTapDeeplink` (`tap-format.js`), opened with `window.open(url, '_blank', 'noopener')`; missing fields are marked (`aria-invalid`, `aria-describedby`).
- Check-in and manage booking: a booking code (6 letters or digits, or a 13-digit ticket number) and a last name (2 characters or more); TAP's check-in (Amadeus) or myb.flytap.com in a new tab.
- No request before the first interaction: the sheet loads (`?limit=5000`, once) when an airport field gets the focus.
- Right after a hero section and from 1024 px, the box pulls up over the hero's bottom (the card at most 18 px above it, as www), never over the hero's dots or CTA.

## Supported variations

None.

## Universal Editor fields

N/A (Document Authoring project)

## Tests

`test/booking-box-tap.test.mjs` (the hand-off, the passenger rules and the matching), `test/booking-box-block.test.mjs` (the block), `test/airport-combobox-options.test.mjs` (the combobox's two options).
