# flight-status

Custom **flight-status** block. Purpose: flight status search with three tabs (flight number, flight route, airport) that validates in the browser and opens the live flight status page.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: 2 columns, label | value; every row optional (built-in English/German defaults chosen by the page language). Tabs | Flight number, Flight route, Airport (by position: 1 = flight number, 2 = route, 3 = airport; fewer items = fewer panels; one item = no tab bar); Active tab | Flight number (label or number/route/airport); Airline label | Airline; Airlines | OS, 4Y, EN, LX, EW, WK, VL, AZ, SN, LH (default list); Default airline | LH; Flight number label | Flight number (Flugnummer); Flight number error | Flight number is required (Flugnummer ist erforderlich); Flight number invalid error | Please enter a valid flight number (1 to 4 digits); Date label | Date (Datum); Date hint | The flight status is available starting {days} days in advance. ({days} = Days after); Days before | 1; Days after | 5; From label | From (Von); To label | To (Nach); Airport label | Airport (Flughafen); Default airport | code (default: the market default airport from /service/api/defaultAirport, else the locale home airport, as flight search; also prefills From); Departure label | Departure (Abflug); Arrival label | Arrival (Ankunft); Direction label | Departures or arrivals (screen readers); Submit label | Search (Suchen); Origin error, Destination error, Airport error, No results label, Tabs label, Number/Route/Airport tab label; Live page (or Submit URL) | link to the live flight status page (default https://www.lufthansa.com/{cc}/{lang}/timetable-and-flight-status; relative links resolve against www.lufthansa.com). Dates are generated at runtime, never authored. The page H1 stays default content above the block. Unknown rows are ignored..

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)
