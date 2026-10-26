# fare-teaser

Custom **fare-teaser** block. Purpose: static list of authored routes with live lowest fares.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: 2 columns, label | value. Rows: Origin | FRA or Frankfurt (FRA) (omitted: the market default airport from /service/api/defaultAirport, which www answers by the visitor's location, else the locale home airport; the order flight search uses); Destinations | CHI, WAS, IST or Chicago (CHI), ... (names authored in brackets are shown as is; otherwise names come from the fare service; omitted: the service recommends destinations); a teaser with routes from several origins names the origin per route: Munich (MUC) - New York (NYC), Frankfurt (FRA) - Cape Town (CPT) or MUC-NYC (the route's origin wins over the Origin row, as on /de/en/articles/highlights/all-it-takes-is-a-yes); Trip duration | 7; Cabin | E; Trip type | One way (omitted: round trip); Travel months | 1,2,3,10,11,12 (omitted: all twelve); Price label | Round trip from; Link | optional URL pattern with {origin}, {destination}, {duration}, {cabin} (a pattern without {origin}/{destination} is ignored; default: the locale's /book-and-manage/destination page); Conditions | title + text (a title alone gets the text of /service/api/catalogs/conditions). The section heading stays default content above the block. Fares: www asks its fare teaser service (POST /service/api/lhg-fare-teaser/fareteaser/manual), which refuses this site's origin; the block takes the price per destination from the destination finder instead: GET /service/api/destinationfinder/destination/finder/{origin}/{cabin}?months=0_11&tripType=RETURN|ONEWAY (directly on www.lufthansa.com with the market's X-Portal-* headers, one call per origin, cabin and trip type; the answer lists every destination with its lowest price over the next twelve months), rounded up and shown with the answer's currency symbol like the live site. The teaser's Travel months and Trip duration are not applied to the price (the finder has no such parameters; they still go into the destination link). A route without a live price shows without a price, as www does when its fare call gives none; prices are never taken from the recordings (`data-lh-source` is `live` or `none`). Without Destinations the finder's top deals, then the lowest prices, are shown (6); images: www's /content/dam/lh/images/offers/destination/{code}-square.jpg, from the site's own copy on this host (scripts/dam-path.js localDamUrl; lh-edge answers www's DAM URLs, its README "DAM URLs"). UI strings: an authored row wins, then the live labels (/service/api/labels/fareteaserstatic), then built-in English/German defaults.

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)

## App web view

In the Lufthansa app (the `groupapp` bridge, `scripts/app-bridge.js`), a click on an offer posts `OfferBookingRequest` (`{type, targetURL, parameters: [{key, values}], newWindow, methodGet}`, from the link) to the app instead of navigating; in a browser the link works as before.
