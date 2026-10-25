# destination-offer

Custom **destination-offer** block. Purpose: www's destination page (`/{cc}/{ll}/book-and-manage/destination`, component `dcep-single-offer-display`), built when the page is viewed for the route in the URL. The fare teaser and the homepage destination finder link to it with `OriginCode`, `DestinationCode`, `TripDuration`, `Cabin` (or `tripType`).

## Authoring (Document Authoring)

Model: `standalone`

Single block table, key | value rows (www's widget configuration, `data-dcep`, which the importer copies); all optional:

| Key | Value | www |
| --- | --- | --- |
| All offers | link to the offers page (`/de/en/book-and-manage/offers-and-destination`) | `allOffersUrl` |
| Trip duration | the stay when the URL has no `TripDuration` (14) | `tripDuration` |
| Max adults, Max children, Max infants | www's passenger limits (9, 8, 9); kept for the booking form, not used yet | `maxAdults`, ... |
| Content languages | `en` | `destinationContentLanguages` |

Labels: any of `Main heading` ("Flights"), `Sub heading` ("From {ORIGIN} to {DESTINATION} {SHOWPRICE, select, true {from {MINPRICE}} other {}}", www's ICU message syntax), `Error title`, `Error text`, `Offers label`, `All offers label`, `Back label`, `Banner heading`, `Banner text`, `Calendar heading`, `Travel class label`, `Months heading`, `Months intro`, `Months route`, `From label`, `Best price label`, `Best day label`, `Prices note`, `One way note`, `Flight time label`, `Flight time value`, `Stops label`, `Stops value`, `Nonstop label`, `Frequency label`, `Read more label`, `AI heading`, `AI text`, `Book label`, as a row; otherwise www's label bundle `singleOfferDisplay` (GET `/service/api/labels/singleOfferDisplay/lh/{lang}`, recorded answer as fallback; labels are not prices), then built-in English and German defaults (www's texts).

## Behaviour

URL parameters: `OriginCode`, `DestinationCode` (both required, three-letter codes), `TripDuration` (days; else the Trip duration row), `Cabin` (`E`, `N`, `B`, `F`; else economy), `tripType=ONEWAY` (one way: no return date, trip duration 0 in the price calls).

Calls, all directly on www.lufthansa.com with the market's X-Portal-* headers through `scripts/lh-data.js` (as www's page calls them, recorded 2026-10-25 for FRA-CHI):

- `GET /service/api/destinationfinder/destination/content/{destination}`: city text, usual visit duration, recommended minimum and extended stay, categories (sightseeing, local cuisine, neighbourhoods, getting around), each a list of title and text;
- `GET /service/api/labels/singleOfferDisplay/lh/{lang}`: the texts;
- `GET /service/api/destinationfinder/flightinfo/{origin}?destination={destination}`: `{"flightInformation":{"CHI":{"flightTime":545,"stops":0,"flightsPerWeek":7}}}`;
- `GET /service/api/flight-prices/{origin}/{destination}/{cabin}/{tomorrow, local midnight in UTC}/{tripDuration}?mode=MONTHS`: the lowest fare per month for twelve months;
- `GET .../flight-prices/{origin}/{destination}/{cabin}/{today or the month's first day}T00:00:00/{tripDuration}?monthsToFetch=2&mode=DAYS`: the fares per day of the chosen month and the next (with `bestPriceInMonth`).

Shown, in www's order (1440 capture of /de/en/book-and-manage/destination?OriginCode=FRA&DestinationCode=CHI&TripDuration=7&Cabin=E, `tools/source-export/feeds/destination/pages/`): "Flights" and "From Frankfurt to Chicago from 601 €" (the lowest month price in whole units, as www: 601.14 → 601); the destination's panorama (`/content/dam/lh/images/offers/destination/{code}-panorama.jpg` from www, two thirds of the width) with the city text and "Read more" (usual visit duration, recommended stays, the categories as "title: text" lists); Flight Time ("From 9h 5min"), Stops ("Nonstop available" / "From 1 stop"), Frequency (days per week); the price calendar: travel class select (reloads the prices), "Best Prices per Month" in a grey band ("Lowest available fares / From Frankfurt to Chicago, 1 Adult, Economy, 7 Days", one card per month "From 694 €", the cheapest with "Best price", year labels), two months of days (Monday first, price per day rounded up, www's yellow corner on the best price of the month, days before today and without a fare disabled) for the chosen month and the next, "Showing prices in EUR for a round trip of 7 days"; the "Keep exploring" card (Back to results: the previous page of this site, else the homepage; Explore all offers: All offers); www's AI note. Prices: rounded up with the answer's currency (heading: whole units), never recorded prices (`data-lh-source`: `live` when the month prices answered, else `none`).

Booking: a day in the calendar opens the Lufthansa shop as www's flight search does (`scripts/shop-handoff.js`: POST to shop.lufthansa.com/booking/availability with the route, the day, the return day after the trip duration, one adult, the cabin).

Without the parameters, or when neither the content nor the prices answer: www's error state, the heading "Flights", the notification "Page Load Error" / "This page isn't loading correctly ..." and the link to Offers & destinations.

Not done: www's route check (`POST /service/api/ondcontrol/validateOriginAndDestination`, body `{"flightSegments":[{originCode, destinationCode, travelDatetime}, {back}]}`, answer `{"cabinClasses":["E","F","B","N"],...}`): not called, as a refused cross-origin POST would stop all direct calls of the page for ten minutes (scripts/lh-data.js), so the travel class select offers all four classes; the one-way checkbox, the trip-days stepper and the conditions of the calendar; the fare alert ("Subscribe for Best price alerts"); the GetYourGuide activities widget; www's day selection with a separate search button (a day books at once).

Tests: `tools/source-export/feeds/destination/` holds www's answers recorded once for FRA-CHI (de/en), MUC-NYC (de/de), VIE-BKK (at/de) and LON-CPT (gb/en), with screenshots (`test/destination-offer.test.mjs`); `localStorage['lh-live-origin']` points the direct calls of a page at a mock server that serves them.

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)
