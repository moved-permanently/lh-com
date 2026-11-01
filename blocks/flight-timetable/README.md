# flight-timetable

Custom **flight-timetable** block. Purpose: Air Dolomiti's timetable search (www.airdolomiti.it/orario-voli, .eu/flight-timetables, .de/flugplan): trip type, origin, destination, departure and return dates, Search; the search goes to Air Dolomiti's booking engine (digital.airdolomiti.it) as www's widget sends it.

## Authoring (Document Authoring)

Model: `standalone`

Single block table, 2 columns, label | value; every row optional (defaults: www's texts in Italian, English or German by the page's root: `/`, `/en/`, `/de/`). Rows: Trip types | Andata / Ritorno, Solo andata (round trip first); From label | Partenza; From placeholder | Partenza da; To label | Arrivo; To placeholder | Arrivo a; Departure label | Data partenza; Return label | Data ritorno; Submit label | Cerca; Submit aria label | Cerca volo; Open calendar | apri calendario (the date buttons are named "Data partenza: apri calendario"); Previous month, Next month (the calendar's buttons); Trip type label (the radios' screen-reader legend); Error (shown when Air Dolomiti's API does not answer); Live page | link (shown instead of the form on another brand's page).

## Behaviour

Brand `airdolomiti` only (scripts/brands.js: its booking entry's format `airdolomiti`); on any other page the block shows its Live page link and calls nothing. Data and hand-off (scripts/airdolomiti-api.js, api.airdolomiti.it, `Access-Control-Allow-Origin: *`, recorded 2026-11-01):

- origin: `GET /v1/airports`, the names in the page's language, sorted; destination: the origin's connections;
- dates: `GET /v1/flights/dates/<ORIG>-<DEST>` (dd/mm/yyyy): the calendars (one month, Monday first, previous and next within the route's months) offer only these days; the return calendar the same days from the departure on (as www's);
- Search: `POST /v1/bookings/timetable` (`Content-Type: application/json`, `Accept-Language: it|en|de`), body `{"departure_date","return_date","departure_airport","destination_airport","trip_type","consent"}` as www's: one way `trip_type` O and `return_date` 01/01/1970, round trip R and the return date; consent not given (`false`, `consent_date` and `consent_id` null, as www without a choice) until a consent tool provides it. The answer (201) `{url, payload: {search}}`: a POST form to `url` (only https://digital.airdolomiti.it) with one field `search` = JSON of `payload.search`.

A search without origin, destination or the dates marks the missing fields and sends nothing; an API failure shows the Error text and keeps the entries.

## Supported variations

None.

## Universal Editor fields

N/A (Document Authoring project)

## Tests

`test/airdolomiti-api.test.mjs` (requests byte for byte as www's), `test/airdolomiti-handoff-blocks.test.mjs` (the block on recorded answers, `test/fixtures/airdolomiti-api`).
