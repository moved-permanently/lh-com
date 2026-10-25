# fare-teaser

Custom **fare-teaser** block. Purpose: static list of authored routes with live lowest fares.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: 2 columns, label | value. Rows: Origin | FRA or Frankfurt (FRA) (omitted: locale home airport); Destinations | CHI, WAS, IST or Chicago (CHI), ... (names authored in brackets are shown as is; otherwise names come from the fare service; omitted: the service recommends destinations); a teaser with routes from several origins names the origin per route: Munich (MUC) - New York (NYC), Frankfurt (FRA) - Cape Town (CPT) or MUC-NYC (the route's origin wins over the Origin row and is sent per travel in the manual request, as on /de/en/articles/highlights/all-it-takes-is-a-yes); Trip duration | 7; Cabin | E; Trip type | One way (omitted: round trip); Travel months | 1,2,3,10,11,12 (omitted: all twelve); Price label | Round trip from; Link | optional URL pattern with {origin}, {destination}, {duration}, {cabin} (a pattern without {origin}/{destination} is ignored; default: the locale's /book-and-manage/destination page); Conditions | title + text (a title alone gets the text of /service/api/catalogs/conditions). The section heading stays default content above the block. Fares: POST /service/api/lhg-fare-teaser/fareteaser/manual with exactly the live body (fareTeaserManualTravels, cabin, tripType, tripDuration, travelMonths), rounded up and shown with the answer's currency symbol like the live site; images from the live /content/dam/lh/images/offers/destination/{code}-square.jpg. UI strings: an authored row wins, then the live labels (/service/api/labels/fareteaserstatic), then built-in English/German defaults.

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)

## App web view

In the Lufthansa app (the `groupapp` bridge, `scripts/app-bridge.js`), a click on an offer posts `OfferBookingRequest` (`{type, targetURL, parameters: [{key, values}], newWindow, methodGet}`, from the link) to the app instead of navigating; in a browser the link works as before.
