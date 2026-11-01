# manage-booking

Custom **manage-booking** block. Purpose: Air Dolomiti's manage booking form (www.airdolomiti.it/gestione-prenotazione-volo, .eu/manage-flight-booking, .de/bearbeitung-ihrer-buchungen): surname and booking code, handed to Air Dolomiti's booking engine as www's form does.

## Authoring (Document Authoring)

Model: `standalone`

Single block table, 2 columns, label | value; every row optional (defaults: www's texts in Italian, English or German by the page's root). Rows: Surname label | Cognome; Surname placeholder | Cognome; Booking code label | Codice di prenotazione; Booking code placeholder | Codice di prenotazione; Submit label | Cerca prenotazione; Error (shown when Air Dolomiti's API does not answer); Live page | link (shown instead of the form on another brand's page). The block's section is a centred column 720px wide (its first text, the page's heading and introduction, centred), as www's page.

## Behaviour

Brand `airdolomiti` only (its booking entry's format `airdolomiti`); elsewhere the Live page link, no call. Both fields are required (www sends empty ones too). Search: `POST https://api.airdolomiti.it/v1/bookings/retrieve-pnr` (`Accept` and `Content-Type: application/json`, `Accept-Language: it|en|de`), body `{"surname","booking_code"}` (trimmed). The answer (201) carries `url` and `payload {recLoc, lastName, dxMMBTripFlow, portalFacts}`; `dxMMBTripFlow` holds a value the server encrypts, so only the API can build the hand-off. Then a POST form to `url` (only https://digital.airdolomiti.it) with `recLoc`, `lastName`, `dxMMBTripFlow` and `portalFacts` (the answer's, as www posts them: `[{"key":"carsDateandTime","value":…}]`; without them the current date and time). The API answers without checking the booking; the engine checks it. An API failure shows the Error text and keeps the entries.

## Supported variations

None.

## Universal Editor fields

N/A (Document Authoring project)

## Tests

`test/airdolomiti-api.test.mjs`, `test/airdolomiti-handoff-blocks.test.mjs` (recorded answers, `test/fixtures/airdolomiti-api`).
