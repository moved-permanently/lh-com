# ejournals

Custom **ejournals** block. Purpose: www's eJournals download (`@core/containers-ejournals`, the same component on Lufthansa, ITA, Austrian and Brussels): the login notice, the manual search by booking code or ticket number and last name, the tickets with their flights and the download link; signed in on the airline's own host, the traveller's bookings.

## Authoring (Document Authoring)

Model: `standalone`. 2 columns, label | value, all rows optional (an empty block is the normal case):

| Row | Value | Default |
| --- | --- | --- |
| Login link | link | the brand's Travel ID login (`scripts/brands.js` `travelId`: host and client_id of www's own login links; Lufthansa's `api.travelid.lufthansa.com` on lh-com) with `redirect_uri` = the brand's www, `state` = the page path, `country`, `lang` |
| Live page | link | the page on the brand's www (`scripts/locale.js` siteOrigin + page path): the link of the error message |
| Trips endpoint | link | none: without it the signed-in bookings stay off. www's component config (`hallwayUrl`/`dataProviderUrl`), not in its public files |
| any label below | text | live label, then the built-in copy |

Texts: authored row, then the live labels (GET /service/api/labels/common/{tenant}/{lang}: `common.bookingcodeselection.container.messageBoxTitle`, `…loginLinkText`; GET /service/api/labels/ejournals/{tenant}/{lang}: `ejournals.searchmask.default.*`, `ejournals.searchresults.default.*`, `ejournals.common.default.{search,empty}`), then the built-in copies (en, de: www's live labels of 2026-11-01 where they have a text, else the component's defaults):

| Row | Live key | en |
| --- | --- | --- |
| Notice label | common…messageBoxTitle | Log in with your profile to select a booking. |
| Login label | common…loginLinkText | Go to login |
| Field label, Field hint | pnrOrTicketNumber.label, .hint | Booking code or ticket number; e.g. ABC123 or 2201234567890 |
| Field required, Field invalid | pnrOrTicketNumber.errorRequired, .errorPattern | Please enter your booking code or ticket number; Invalid booking code or ticket number |
| Name label, Name hint | lastName.label, .hint | Last name; as on your ticket |
| Name required, Name too long | lastName.errorRequired, .errorMaxLength | Please enter your last name as booked.; Name is too long |
| Submit label | submitSearch | To free download |
| Booking code label | searchresults.bookingcode | Booking code (www's label has no `{CODE}`: the code follows after a colon; with `{CODE}` it is filled in) |
| Flights label, Download label | searchresults.flights, .download | Flights; Download (component defaults: "Your flights:", "Download eJournals") |
| Route label, Date format | searchresults.screenreaderod, .dateformat | {ORIGIN} to {DESTINATION}; {ddd}, {DD}.{MM}.{Y} |
| Search again label, Empty label | common.default.search, .empty | New search; Unfortunately, no tickets could be found for your search. Please check your input for spelling errors |
| Not displayed label | myFlightNotDisplayed | My flight is not displayed |
| Bookings error title, Bookings error message, Retry label | bookingFetchError.* | We could not load your bookings; Please try again, or enter your booking code manually below.; Try again |
| Error label, Error link label | (none) | Your eJournals could not be loaded. Please try again later.; Search on {HOST} |
| Bookings label | (none) | Your bookings (the list's accessible name) |

## Behaviour

- Notice: #f5f5f5 info box with the copy and the "Go to login" link (the brand's Travel ID, back to the page on the brand's www).
- Manual search: two underlined fields (label inside, hint and error below) and the primary button. www's rules: the reference loses dashes and spaces and is upper-cased; 13 digits = `{ticketNumber, lastName}`, 6 characters = `{bookingCode, lastName}`, anything else "Field invalid"; the last name is required, at most 31 characters. Nothing is sent while a field is wrong.
- The search: `POST /service/api/ejournals` with the page's X-Portal headers (`scripts/lh-data.js`, live only: never a recorded answer, the price routes' two retries, no backoff). On a demo host directly on the brand's `serviceOrigin` (www.austrian.com), else www.lufthansa.com (both answer our hosts with ACAO *, 2026-11-01); on the airline's own host same-origin.
- Answers: tickets → the form gives way to "Booking code: …", "Flights", a row per flight (carrier and number, date, origin – destination, the airport names for screen readers) and per ticket the "Download" button to its deep link (`targetURL` with its `parameters` as the query; a new window when `newWindow`), then "New search". `{"tickets":[]}` (also www's answer to an unknown booking) → the empty text below the form. Any other answer (www: 400 text/html, Tomcat's error page, for a request it refuses; 5xx; network) → the error text and a link to the page on the brand's www (not on the airline's own host).
- Partner links: `?lastname=…&pnrfilekey=…` (www's names, any case) prefill the fields; both present → the search is sent at once.
- Signed in (Travel ID answers the airline's own host only): on the brand's own www host (`scripts/handoff.js` hosts) with a Trips endpoint row, GET `<endpoint>/flights/v3/me/upcoming-trips` with credentials, `tenant` (the brand's airline code, LH) and `lang` (`en-DE`). Bookings → the notice and the form give way to a button per booking (route, date, booking code); choosing one searches its booking code and last name; "My flight is not displayed" opens the manual entry. 401/403 or a network error → the manual entry as signed out; 5xx → www's "We could not load your bookings" with "Try again" above the manual entry. On every other host (turnsthe.page, aem.page, aem.live) and without the row this part makes no call.
- `data-lh-source`: live / recorded / none of the two label bundles.

## Import

Source: `.ejournals > .dcep-ejournals` (lh-com /{de/de,de/en,at/de,gb/en}/unterhaltung-an-bord and /lufthansa-ejournals; ITA's digital-newsstand pages; Brussels' extra-services/inflight-services/ejournals).

- Replace the rendered component with one empty `ejournals` block. Write none of its text.
- Keep the heading before it (id `login` on unterhaltung-an-bord: the page's "To login" link points to `#login`).
- www's newsstand iframe (`https://box.media-carrier.de/home?b=77745&l={de|en}`, `.iframe-wrapper`) is an embed of its own on the page.

## Universal Editor fields

N/A (Document Authoring project)
