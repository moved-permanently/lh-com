# translate.json against the localisation app (adobe/da-nx f0c63255)

2026-10-27T16:43:04.590Z

All checks pass.

- OK   sheet config: 11 rows, total 11
- OK   sheet languages: 2 rows, total 2
- OK   sheet custom-doc-rules: 18 rows, total 18
- OK   sheet dnt-sheet-rules: 1 rows, total 1
- OK   source.language -> the English row: {"name":"English","code":"en","location":"/de/en"}
- OK   translate.conflict.behavior default: merge
- OK   rollout.conflict.behavior default: merge
- OK   copy.conflict.behavior default: merge
- OK   sync.conflict.behavior default: merge
- OK   service: {"name":"Google","envs":{"prod":{"origin":"https://translate.da.live/google","link":"https://cloud.google.com/translate/docs/overview"}}}
- OK   source.language.detect is not read at this commit (da-nx #793 + #870 open)
- OK   English: Skip first (preselected), then Rollout; locale /gb/en
- OK   German: Skip first (preselected), then Translate, Rollout; locale /at/de
- OK   no waiting languages (no "source language" column)
- OK   unique codes (options.js, rollout.js match languages by code)
- OK   /de/en URLs, English rollout + German translate -> translate view first
- OK   /de/en URLs, German rollout only -> rollout view
- OK   a /de/de URL in a project -> sync view (it would be copied into /de/en: do not add such URLs today)
- OK   translate /de/en/baggage -> /de/de/baggage.html
- OK   translate /de/en/flight-search -> /de/de/flight-search.html (the slug step moves it to /de/de/flugsuche)
- OK   English rollout /de/en/baggage -> /gb/en/baggage.html
- OK   German rollout of /de/en/baggage reads /de/de/baggage.html -> /at/de/baggage.html
- OK   German rollout of /de/en/flight-search reads /de/de/flight-search.html (not /de/de/flugsuche): own German slugs cannot be rolled out today
- OK   rules on a poi-map table: tr/no/tr | no/tr | ROW | no/tr (expected tr/no/tr | no/tr | ROW | no/tr)
- OK   rules on a hero-banner table: tr/tr | ROW (expected tr/tr | ROW)
- OK   rules on a carousel-lightbox table: tr/tr | no/tr (expected tr/tr | no/tr)
- OK   rules on a price-bar table: ROW | no/tr (expected ROW | no/tr)
- OK   rules on a blog-overview table: BLOCK | BLOCK (expected BLOCK | BLOCK)
- OK   metadata of /de/en/feedback-past-flight: only display texts translated: Title, og:title, Description
- OK   form: header row, Type, Name, Required, Rules and config rows not translated; Label and texts translated
- OK   metadata of /de/en/timetable-and-flight-status: only display texts translated: Title, Description, og:title
- OK   metadata of /de/en/homepage: only display texts translated: Title, Description, og:title, Breadcrumb title
- OK   metadata of /de/en/articles/explore-the-world/a-perfect-day-beijing-in-one-day: only display texts translated: Title, Description, og:title, tags, reading-time, card-image-alt
- OK   metadata of /de/en/320: only display texts translated: Title, Description, og:title
- OK   metadata of /de/en/flights: only display texts translated: Title, Description, og:title, Breadcrumb title
- OK   metadata of /de/en/online-check-in: only display texts translated: Title, Description, og:title
- OK   metadata of /de/en/food-and-beverages: only display texts translated: Title, Description, og:title
- OK   metadata of /de/en/32n: only display texts translated: Title, Description, og:title
- OK   metadata of /de/en/articles/explore-the-world: only display texts translated: Title, Description, og:title, Breadcrumb title

## What reaches the translation service (addDnt on lh-com pages)

row/col and text of the cells that stay translatable, per block (other blocks: everything but the block name is translated)

| page | block | translatable cells |
|---|---|---|
| /de/en/feedback-past-flight | form | 2/1 "How can we help?"; 2/6 "This feedback form is for our customers who have a"; 3/1 "Topic:"; 3/5 "airport=At the airport (e.g. check-in, lounge, gat"; 3/8 "Please select an option."; 4/1 "For whom are you submitting this request?" (+85) |
| /de/en/feedback-past-flight | metadata | 1/2 "Feedback on a past flight | Lufthansa"; 3/2 "Feedback on a past flight" |
| /de/en/timetable-and-flight-status | flight-status | 1/2 "Flight number, Flight route, Airport"; 3/2 "Airline"; 6/2 "Flight number"; 7/2 "Flight number is required"; 8/2 "Date"; 9/2 "The flight status is available starting 5 days in " (+1) |
| /de/en/timetable-and-flight-status | metadata | 1/2 "Timetable & flight status | Lufthansa"; 2/2 "Check the status of Lufthansa flights including ar"; 4/2 "Timetable & flight status" |
| /de/en/homepage | flash-teaser | nothing |
| /de/en/homepage | flight-search | 1/2 "Flights"; 2/2 "Round trip"; 3/2 "Economy, 1 Traveller"; 4/2 "Nonstop only"; 5/2 "Where we fly" |
| /de/en/homepage | stage-promotions | nothing |
| /de/en/homepage | fare-teaser | 6/2 "Round trip from"; 7/2 "ConditionsThe prices displayed may vary and should" |
| /de/en/homepage | destination-finder | 1/2 "Flight offers from"; 3/2 "Please choose an origin city for fares for your re"; 4/2 "Round trip, One way"; 6/2 "Round trip from"; 7/2 "For all flight routes and prices, visit ourOffers "; 8/2 "All offers & destinations" (+2) |
| /de/en/homepage | cards-icon | 1/2 "Hotels"; 2/2 "Rental car"; 3/2 "Parking at the airport"; 4/2 "Tours and activities"; 5/2 "All extra services" |
| /de/en/homepage | columns-logos | 1/1 "Payment options"; 1/2 "Follow us" |
| /de/en/homepage | metadata | 1/2 "Book your flight now - travel with Lufthansa to ov"; 2/2 "Experience premium service and comfort worldwide w"; 4/2 "Book your flight now - travel with Lufthansa to ov"; 5/2 "Home" |
| /de/en/articles/explore-the-world/a-perfect-day-beijing-in-one-day | article-header | 2/1 "A Perfect Day: Beijing in One DayLufthansa flight " |
| /de/en/articles/explore-the-world/a-perfect-day-beijing-in-one-day | section-metadata | nothing |
| /de/en/articles/explore-the-world/a-perfect-day-beijing-in-one-day | price-bar | 2/2 "Round trip from" |
| /de/en/articles/explore-the-world/a-perfect-day-beijing-in-one-day | poi-map | 1/1 "Casa Bacardi"; 2/1 "Siji Minfu"; 3/1 "HEYTEA"; 3/3 "More Information"; 4/1 "Haidilao Hot Pot"; 4/3 "More Information" (+9) |
| /de/en/articles/explore-the-world/a-perfect-day-beijing-in-one-day | related-articles | nothing |
| /de/en/articles/explore-the-world/a-perfect-day-beijing-in-one-day | metadata | 1/2 "A Perfect Day in Beijing: Peking Duck, Hutongs, an"; 2/2 "Lufthansa flight attendant Tian Tian-Kenneweg shar"; 4/2 "A Perfect Day in Beijing: Peking Duck, Hutongs, an"; 5/2 "Team Stories, Food, Shopping, Music, Beijing, Perf"; 7/2 "6 min read"; 14/2 "Aerial view of a traditional temple complex with o" |
| /de/en/320 | hero-campaign | 2/1 "Airbus A320-200Discover an aircraft that shaped ci" |
| /de/en/320 | section-metadata | nothing |
| /de/en/320 | carousel-lightbox | 1/2 "Detailed airplane seat map with Business, Economy,"; 2/2 "Aircraft seating plan: economy cabin layout, rear "; 3/2 "Close" |
| /de/en/320 | table-striped | 1/1 "Length"; 1/2 "37.57 m"; 2/1 "Wingspan"; 2/2 "34.10 m"; 3/1 "Height"; 3/2 "12 m" (+10) |
| /de/en/320 | metadata | 3/2 "Airbus A320-200 | Lufthansa"; 4/2 "Discover the Airbus A320-200, an aircraft that sha"; 6/2 "Airbus A320-200" |
| /de/en/flights | destination-finder | 2/2 "6"; 6/2 "*The prices incl. all taxes, fees, carrier surchar"; 7/2 "General Conditions" |
| /de/en/flights | feedback | 1/1 "Did you find this information useful? *"; 2/1 "Yes No" |
| /de/en/flights | section-metadata | nothing |
| /de/en/flights | metadata | 1/2 "Flight offers and destinations worldwide | Lufthan"; 2/2 "Discover the world. We’ll bring you to your destin"; 4/2 "Flight offers and destinations worldwide"; 6/2 "Offers and destinations" |
| /de/en/online-check-in | section-metadata | nothing |
| /de/en/online-check-in | booking-lookup | 1/2 "Booking reference or ticket number"; 2/2 "Log in with your profile to select a booking. Go t"; 3/2 "Booking reference or ticket number"; 5/2 "First name"; 6/2 "Last name"; 7/2 "Confirm" (+2) |
| /de/en/online-check-in | cards-steps | 1/1 "1Find your bookingIdentify yourself using your nam"; 2/1 "2Sign in with Travel IDSign in with your existing "; 3/1 "3Complete your travel detailsProvide the required "; 4/1 "4Personalize your flightSelect a seat for yourself" |
| /de/en/online-check-in | metadata | 1/2 "Online check-in | Lufthansa"; 2/2 "You can check in here from 30 hours before departu"; 4/2 "Online check-in" |
| /de/en/food-and-beverages | hero-campaign | 2/1 "Your culinary journey starts hereEven before depar" |
| /de/en/food-and-beverages | section-metadata | nothing |
| /de/en/food-and-beverages | hero-banner | 1/2 "First ClassPure IndulgenceDiscover the menus"; 2/2 "Business ClassGourmet MomentsDiscover the menus"; 3/2 "Premium Economy ClassFlavourfulDiscover the menus"; 4/2 "Economy ClassSimply GoodDiscover the menus" |
| /de/en/food-and-beverages | metadata | 1/2 "Menus on board | Lufthansa"; 2/2 "Food and drinks with Lufthansa: from gourmet meals"; 4/2 "Menus on board" |
| /de/en/32n | hero-campaign | 2/1 "Airbus A320neoDiscover our modern short-haul aircr" |
| /de/en/32n | section-metadata | nothing |
| /de/en/32n | carousel-lightbox | 1/2 "Detailed airplane seat map with Business, Economy,"; 2/2 "Aircraft seating plan: economy cabin layout, rear "; 3/2 "Close" |
| /de/en/32n | table-striped | 1/1 "Length"; 1/2 "37.57 m"; 2/1 "Wingspan"; 2/2 "34.10 m"; 3/1 "Height"; 3/2 "12 m" (+10) |
| /de/en/32n | metadata | 3/2 "Airbus A320neo | Lufthansa"; 4/2 "Discover the Airbus A320neo, our modern short-haul"; 6/2 "Airbus A320neo" |
| /de/en/articles/explore-the-world | poi-map | 1/1 "Chicago"; 1/3 "To the Stories"; 2/1 "Tokyo"; 2/3 "To the Stories"; 3/1 "New York"; 3/3 "To the Stories" (+184) |
| /de/en/articles/explore-the-world | blog-overview | nothing |
| /de/en/articles/explore-the-world | metadata | 1/2 "Lufthansa Insights – Explore the World | Lufthansa"; 2/2 "Discover new perspectives on selected destinations"; 4/2 "Lufthansa Insights – Explore the World"; 6/2 "Explore the World" |
