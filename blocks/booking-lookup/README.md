# booking-lookup

Custom **booking-lookup** block. Purpose: booking lookup form (booking reference or ticket number, first and last name) that validates in the browser and hands off to the live check-in app, with optional extra content tabs.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: 2 columns, label | value; every row optional. Tab | Booking reference or ticket number (first Tab row = the form tab; an optional Panel row right after it adds intro content above the form); Login notice | text + 'Go to login' link; Reference label | Booking reference or ticket number (DE: Buchungscode oder Ticketnummer); Reference pattern | ^([A-Z0-9]{6}|\d{13})$ (default; input is upper-cased and spaces removed before the check); First name label | First name (Vorname); Last name label | Last name (Nachname); Submit label | Confirm (Bestätigen); Submit URL | hand-off URL or pattern with {COUNTRY}, {LANG}, {REFERENCE}, {FIRSTNAME}, {LASTNAME} (default https://once.lufthansa.com/connect/main-app?APPID=LHG_ONLINE&COUNTRY={COUNTRY}&LANGUAGE={LANG}&TENANT=LH&MODE=PORTAL); Errors | First name is required, Last name is required (2 items = first/last name, 3 items = reference/first/last). Single error rows: Reference error, First name error (Vorname ist erforderlich), Last name error (Nachname ist erforderlich); Tabs label (accessible name of the tab bar: Find your booking / Buchung finden). Extra tabs: each further 'Tab | label' row followed by 'Panel | rich content' (paragraph, link, image) becomes a WAI-ARIA tab; without extra tabs no tab bar is drawn. Nothing is sent anywhere: submit validates and navigates to the Submit URL. Unknown rows are ignored..

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)
