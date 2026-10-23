# booking-lookup

Custom **booking-lookup** block. Purpose: booking lookup form (booking reference or ticket number, first and last name) that validates in the browser and hands off to the live check-in app, with optional extra content tabs.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: 2 columns, label | value; every row optional. Tab | Booking reference or ticket number (first Tab row = the form tab; an optional Panel row right after it adds intro content above the form); Login notice | text + 'Go to login' link; Reference label | Booking reference or ticket number (DE: Buchungscode oder Ticketnummer); Reference pattern | ^([A-Z0-9]{6}|\d{13})$ (default; input is upper-cased and spaces removed before the check); First name label | First name (Vorname); Last name label | Last name (Nachname); Submit label | Confirm (Bestätigen); Submit URL | hand-off URL or pattern with {COUNTRY}, {LANG}, {REFERENCE}, {FIRSTNAME}, {LASTNAME} (default https://once.lufthansa.com/connect/main-app?APPID=LHG_ONLINE&COUNTRY={COUNTRY}&LANGUAGE={LANG}&TENANT=LH&MODE=PORTAL); Errors | First name is required, Last name is required (2 items = first/last name, 3 items = reference/first/last). Single error rows: Reference error, First name error (Vorname ist erforderlich), Last name error (Nachname ist erforderlich); Tabs label (accessible name of the tab bar: Find your booking / Buchung finden). Extra tabs: each further 'Tab | label' row followed by 'Panel | rich content' (paragraph, link, image) becomes a WAI-ARIA tab; without extra tabs no tab bar is drawn. Nothing is sent anywhere: submit validates and navigates to the Submit URL. Unknown rows are ignored. Sections right after the block's section with the section style `in-booking-lookup` are shown inside the form tab, below the form (live: "How to get your boarding pass" belongs to the first tab: hidden with the tour operator tab, before the second accordion row on mobile); the block must be the last element of its section for this.

## Behaviour

Tabs share the width equally (50/50 with two tabs); below 768px they become accordion rows (the form tab open). The submit button is as wide as its label from 768px.

## Supported variations

- `my-bookings`: the manage bookings tab (live dcep-quick-actions with only "My bookings", /de/en/book-and-manage/booking-services/manage-my-bookings). One tab with the my-bookings icon (an accordion row across the viewport below 768px that opens and closes), the Travel ID login link, Booking code and Last name, the checkbox "I have a tour operator code" (switches to Last name, First name, Tour operator trip code with its hint and info text), the yellow "Find Bookings" button. Rows (all optional, the importer writes the ones the snapshot shows): Tab | My bookings; Login link | link; Reference label | Booking code; Reference pattern | ^[A-Z0-9]{6}$; Reference error; Last name label; Last name error; Tour operator label; First name label; First name error; Tour operator code label; Tour operator code hint; Tour operator code error; Tour operator code info; Submit label. Defaults: the recorded live labels (quickactions, bookingQuery, tourOperatorQuery; English and German). Hand-off: the live tab logs in with booking code and last name and posts to the booking deeplink its service returns (tour operator: the Travel ID upcoming-trips API); neither can be called from the replica, so a valid search opens the same page on www.lufthansa.com, with none of the entered data in the URL.

## Universal Editor fields

N/A (Document Authoring project)
