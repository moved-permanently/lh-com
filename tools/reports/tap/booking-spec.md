# TAP booking box: how www.flytap.com hands off, and the spec for `booking-box`

Recorded on www.flytap.com from 2026-11-03 21:40 to 2026-11-04 02:15 CET in a headless Chrome (TAP's cookie banner
answered "Rejeitar Todos", no account, no booking; every search stopped at TAP's flight list). The 35 label keys per
language are in `tools/reports/tap/booking-labels.json`. de-de, it-it and pl-pl have been live since 2026-11-04 01:31 CET.

## 1. Result in five lines

1. TAP's homepage search hands off with a **GET in a new tab** to `https://booking.flytap.com/booking/flights/deeplink`
   (multi-city: `/booking/flights-multicity/deeplink`). The parameters are plain query fields: market, language,
   IATA codes, dates as `dd.MM.yyyy` and passenger counts. A URL built outside www.flytap.com without the tracking
   fields also lands on the flight list (checked: PAR→LIS, 2 adults, 1 child, 1 infant, fr).
2. There is **no cabin and no promo code** in the search. The cabin is chosen on TAP's flight list (Economy / Business
   columns). Currency follows the market (PT, ES, FR, DE, IT: EUR; PL: PLN), so it is not a parameter either.
3. The airport list comes from `POST https://www.flytap.com/api/flight?functionName=originSearch`, a public JSON array
   of 1,553 airports with names in the page's language. It sends no CORS headers (preflight answers 500), so a page on
   tap.turnsthe.page can't read it. We keep a copy per language root as a DA sheet and refresh it with a tool.
4. lh-com's `flight-search` block can't do this through configuration alone. It loads Lufthansa's labels, default
   airport and airport suggestions on every render, hands off as a POST to the same tab, uses a select and native date
   inputs, and has no multi-city or "pay with miles". A new block, **`booking-box`**, is the cleaner path. It reuses
   `scripts/airport-combobox.js` (with two backwards-compatible options) and leaves the six brands that use
   `flight-search` untouched.
5. The box appears on each root's homepage. Every other TAP page reaches it through header and content links to
   `#special-anchor-book-flight` (also `-check-in`, `-my-travels`, `-flight-status`). The block must answer those
   anchors too.

## 2. What www.flytap.com/pt-pt shows

### 2.1 Layout

**1440 px** (screenshots `box-1440-flights.png`, `fold-pt-pt.png`):

- The box overlaps the bottom of the hero carousel. The hero is inset 32 px from the viewport and has 32 px rounded
  corners. It runs from y=104 to y=844. The card runs from x=160 to 1280 (1120 px wide, the 1240 container minus
  60 px padding each side) and from y=622 to 826, which leaves 18 px of hero below it.
- **Tab bar** above the card, centred, its bottom 16 px above the card: a pill track (`#f7f7f8`, radius 9999 px,
  padding 4 px) holding four tabs: "Reservar voo", "Fazer Check-in", "Gerir reserva", "Estado do voo". Each tab has
  a 16 px line icon, Inter 14 px, padding 8 px 16 px and height 40 px. The active tab is TAP green `#65c922` with black
  text; idle tabs are transparent with `#424045` text.
- **Card**: white, radius 24 px, padding 32 px, no shadow (it sits on the photo).
  - Row 1: three radios ("Ida e volta", "Só ida", "Multi-city"). Each is a 24 px circle with a 1 px `#65c922` border;
    the selected one is filled green with a black dot. Labels are Inter 16/20 `#424045`. On the right: a "Pagar com
    milhas" checkbox (24 px square, green border) and the link "Reservas para empresas" with an external icon
    (`https://tapforbiz.com/`, new tab; `#397213`, underline in `#65c922`).
  - Row 2, 24 px below: four fields in one line, each with a label above (Inter 16/24, weight 500, `#424045`) and a
    52 px input with only a 1 px `#e0dfe2` bottom line (it turns green on focus):
    - Origem (x 192, w 169): a green code chip "LIS" (Inter 14 px, `#65c922`, radius 9999 px, 40×20 px) and then
      "Lisboa, Portugal" (the text is cut by the field width), with a caret.
    - A 40 px round swap button (2 px `#b0aeb4` border, white) between Origem and Destino.
    - Destino (x 449, w 169): placeholder "Escolher Destino" with a caret.
    - A 1 px vertical divider, then Datas (x 667, w 204): "Selecionar Datas".
    - Another divider, then Passageiros (x 920, w 176): "1 Passageiro(s)" with a caret.
    - The **Pesquisar** button (x 1120, 128×40): pill, `#9efd38` (TAP's lighter "electric" green), black text,
      Inter 15 px weight 500.
- **Airport list** (`box-1440-destination-typed.png`): a dropdown under the field. Each row has a dark grey code chip
  (`#424045`, white text), then "Porto, Porto" (city, airport) in 16 px and the country under it in 13 px grey.
  Typing filters the list; with an empty field it shows the first 30 entries. Picking one closes the list and opens
  the calendar.
- **Calendar** (`box-1440-calendar.png`): a popover of about 650 px. At the top are two typed inputs, "Data de partida"
  and "Data de regresso" (placeholder DD/MM/YYYY). Below them are two months side by side with month dropdowns and
  arrows; weeks start on Monday ("seg ... dom"). Days in the past are grey. Below the months: "Limpar datas" (outline
  pill) and "Continuar" (green pill, disabled until the dates are complete). TAP also shows a lowest fare under each
  day and a legend, both from `functionName=calendar`. **We leave the prices out** (live fares stay with TAP).
- **Passengers** (`box-1440-passengers.png`): a popover with three steppers (− value +): "Adulto(s) / Mais de 12
  anos", "Criança(s) / 2 a 11 anos", "Bebé(s) / Idade inferior a 2 anos". A fourth stepper, "Jovem(ns) Adulto(s) / 12 a
  15 anos", appears only when the origin or destination is one of 32 UK airports (list in 2.3).
- **Multi-city** (`box-1440-multicity.png`): one row per flight (origin, destination, date), "Adicionar mais um voo"
  (an outline pill with a plus), at most 6 flights. Each added row starts from the previous row's destination.
- **Other tabs** (`box-1440-tab1.png` to `tab3`): Check-in and Gerir reserva show two columns. On the left, "Login"
  with a short text and a green "Login" button (TAP's account, out of scope). On the right, "Ou insira os dados
  relativos à sua reserva" with two 52 px boxed inputs (Código de reserva, Último sobrenome do passageiro) and the
  outline button "Encontrar reserva". Estado do voo has three radio modes (Por aeroporto / Por origem e destino / Por
  voo), a date and a field, plus "Pesquisar".

**390 px** (screenshots `fold-390.png`, `box-390-a.png`, `box-390-destination-typed.png`, `box-390-calendar.png`):

- The hero is a 358×260 card with 24 px radius. Below it sit the carousel controls, then the four tabs as **separate
  pill chips** wrapped 2 + 2 and centred (Inter 16 px, 40 px high, 1 px `#e0dfe2` border, active one green).
- The card is 358 px wide with 16 px margin, radius 24 px, padding 24 px and a soft shadow (see the screenshot). Inside it, everything is
  stacked: the radios one per line, then "Pagar com milhas", then Origem (with the swap button to the right, between
  Origem and Destino), Destino, Datas, Passageiros, a full-width Pesquisar button (310×40) and "Reservas para
  empresas" under it.
- The calendar shows one month with arrows and only the field being edited (Data de partida, then Data de regresso),
  with the same Limpar datas / Continuar buttons. The airport list is as wide as the card.

### 2.2 Labels

All texts come from TAP's own i18n bundle, which every www.flytap.com page carries in `__NEXT_DATA__`
(`props.pageProps._nextI18Next.initialI18nStore.<ll>.common`, e.g. `round-trip`, `one-way`, `multi-city`,
`pay-with-miles`, `enterprise-reservation`, `origin-label`, `origin-placeholder`, `destination-label`,
`destination-placeholder`, `dates`, `select-date`, `departure-date`, `arrival-date`, `clean-dates`, `continue`,
`passengers-label`, `passengers`, `adult`, `adult-range`, `youngAdult`, `youngAdult-range`, `childrens`,
`childrens-range`, `babys`, `babys-range`, `search`, `add-more-flights`, `no-results-search`, `validation-required`,
`ibe.book-flight`, `ibe.to-check-in`, `ibe.my-travels`, `ibe.flight-status`). The values for all seven roots (pt-pt,
en-pt, es-es, fr-fr, de-de, it-it, pl-pl) were read from the live homepages: `booking-labels.json`. Note: in the
capture archives these i18n stores are complete only for pt-pt; read the other languages from the live homepage or
the JSON file above.

### 2.3 Behaviour (from the page and from TAP's own bundle `_app-30efa0b231457569.js`)

- **Default origin** is the market's airport from TAP's market settings (`pageProps.markets[].airport`): PT LIS,
  ES MAD, FR PAR, DE FRA, IT FCO, PL WAW (GB LON, US NYC, BR RIO for later roots). en-pt uses PT, so LIS. It does not
  depend on the visitor's location: the airport request always sends Lisbon's coordinates.
- **Airport matching** (TAP's function, per entry; highest score first, ties by city name, at most 30):
  "city, country" equal to the term 1; airport name equal 0.92; city name equal 0.8; a 3-letter term equal to the code
  0.79; country name equal 0.72; country code equal 0.71; a whole word of the city name 0.8, of "city, country" 0.78,
  of the airport name 0.75, of the country 0.7; the city starting or ending with the term 0.7, "city, country" 0.68,
  airport name 0.65, country 0.5; the country containing the term 0.1. Accents are folded before comparing.
- **Passengers**: at most 9 people including infants. Adults plus young adults must be at least 1. Infants are at
  most one per adult. Children are at most 7 per adult, and TAP adds smaller limits when there are infants (for
  example, 1 adult with 1 infant allows at most 3 children). Defaults: 1 adult and nothing else.
- **Young adults** are offered only when an origin or destination is one of: LCY LGW LHR MAN EDI BHD ABZ GLA BRS NCL SOU
  IOM BPR TPB CFW CWL ZXE EXT ZGG GLO INV XQL LPL LXL LON NQY NWI OXF XPT SZD ZFG. If the route changes away from them,
  the count goes back to 0.
- **Validation**: Destino, Datas and, for a return, both dates are required ("Campo obrigatório"). The return date is
  on or after the departure date.
- **Submit** builds the URL in 3.1 and opens it with `window.open(url, '_blank')`. The page itself stays where it is.

### 2.4 Where the box lives on www

- On the homepage of every root: the `ComponentSliderHomepageModel` section (hero slides plus the booking box). No
  other pt-pt page has its own box (checked across all 119 captured pt-pt pages).
- On every other page the header and content links use `<root>#special-anchor-book-flight`, `#special-anchor-check-in`,
  `#special-anchor-my-travels`, `#special-anchor-flight-status` (and `#special-anchor-login`). There are 1,262 such
  links across the 119 pt-pt pages (every page has some, about 10 a page; 150 go to book-flight). On www they open the same
  box as an overlay on the current page.
- Once (2026-11-03 ~21:55 CET), after about ten quick loads from this Mac, `https://www.flytap.com/pt-pt` redirected to
  `https://booking.flytap.com/lite/` (TAP's light booking page, screenshot `www-to-booking-lite-redirect.png`). Ten
  minutes later it was normal again. This doesn't affect the hand-off, but keep test traffic slow.

## 3. Hand-off to TAP's booking engine

### 3.1 The URL TAP builds

```
https://booking.flytap.com/booking/flights/deeplink?
  market=PT                       market code: the root's country, upper case (pt-pt, en-pt: PT; es-es: ES …)
  &language=pt                    the root's language, always 2 letters (also pt for a pt-br root)
  &origin=LIS                     IATA code, airport or city (PAR, LON, NYC are city codes)
  &destination=OPO
  &flexibleDates=false            always false (no flexible-dates control in the box)
  &flightType=return              return | single (one way) | openJaw (multi-city)
  &adt=1&chd=0&inf=0&yth=0        adults (12+), children (2-11), infants (<2), young adults (12-15, UK routes only)
  &depDate=28.11.2026             dd.MM.yyyy, zero-padded
  &headerfooterhidden=false       always false
  &retDate=02.12.2026             return only, dd.MM.yyyy
  &x_tap_source=WEB               always WEB
  &x_tap_username=                the signed-in TAP number; always empty for us (no account)
  &x_tap_correlationid=<uuid>     a fresh random UUID per search (TAP's tracing)
  &award=true                     only when "Pagar com milhas" is ticked (otherwise absent)
```

The order is TAP's (URLSearchParams insertion order): market, language, origin, destination, flexibleDates,
flightType, adt, chd, inf, yth, depDate, headerfooterhidden, then retDate, then for multi-city
origin1/destination1/depDate1 … origin5/destination5/depDate5, then x_tap_source, x_tap_username,
x_tap_correlationid, then award.

Multi-city goes to `https://booking.flytap.com/booking/flights-multicity/deeplink` with `flightType=openJaw`. The first
flight is in origin/destination/depDate, the next ones in origin1/destination1/depDate1 and so on (at most 6 flights,
so indexes 1 to 5).

The engine replaces the deeplink with `/booking/flights?…` (it drops market and language from the visible URL and keeps
them in its session) and shows "Selecionar voos" / "Select flights" / "Seleccionar vuelos" / "Sélectionner des vols" in
the requested language, with prices in the market's currency.

### 3.2 What we recorded (inputs → URL that left the page)

| # | Root, trip | Input | Recorded URL | Landed |
|---|---|---|---|---|
| R1 | pt-pt, return | LIS→OPO, 28.11.2026 – 02.12.2026, 1 adult | `…/flights/deeplink?market=PT&language=pt&origin=LIS&destination=OPO&flexibleDates=false&flightType=return&adt=1&chd=0&inf=0&yth=0&depDate=28.11.2026&headerfooterhidden=false&retDate=02.12.2026&x_tap_source=WEB&x_tap_username=&x_tap_correlationid=4154aecb-…` | "Selecionar voos", 10 direct flights (`pt-pt-R-OPOPorto-landing.png`) |
| R2 | pt-pt, one way | LIS→PAR (city, "todos os aeroportos"), 28.11.2026, 1 adult | `…&origin=LIS&destination=PAR&flexibleDates=false&flightType=single&adt=1&chd=0&inf=0&yth=0&depDate=28.11.2026&headerfooterhidden=false&x_tap_source=WEB&…` | "Selecionar voos" |
| R3 | en-pt, return | LIS→OPO, same dates | `…?market=PT&language=en&origin=LIS&destination=OPO…` | "Select flights" |
| R4 | es-es, return | MAD (default)→OPO, same dates | `…?market=ES&language=es&origin=MAD&destination=OPO…` | "Seleccionar vuelos" |
| R5 | built by us, opened directly with referrer tap.turnsthe.page, no x_tap fields | PAR→LIS one way 05.12.2026, 2 adults 1 child 1 infant, fr | `https://booking.flytap.com/booking/flights/deeplink?market=FR&language=fr&origin=PAR&destination=LIS&flexibleDates=false&flightType=single&adt=2&chd=1&inf=1&yth=0&depDate=05.12.2026` | "Sélectionnez votre départ", 4 passagers, 7 direct flights, EUR (`direct-fr-oneway.png`) |

Not run (taken from TAP's bundle): multi-city, `award=true` (TAP's engine probably asks for a sign-in then) and `yth`
greater than 0.

## 4. Why a new block and not a TAP setting of `flight-search`

lh-com's `flight-search` ([flight-search.js](https://github.com/moved-permanently/lh-com/blob/665f3a50f0ed55eeffdf8e7a90abfec2ee866ae9/blocks/flight-search/flight-search.js#L148)) is
Lufthansa's flight manager. On every render it loads Lufthansa's label bundles, the market default airport and the
airport-names catalogue, and it asks Lufthansa's `suggestions/airports` for every term typed. The hand-off
([shop-handoff.js](https://github.com/moved-permanently/lh-com/blob/665f3a50f0ed55eeffdf8e7a90abfec2ee866ae9/scripts/shop-handoff.js#L95)) posts a hidden form
to `shop.lufthansa.com/booking/availability` (or a brand shop at the same path: ITA). Air Dolomiti has its own
`format: 'airdolomiti'` POST branch. Lufthansa, SWISS, Austrian, Brussels, ITA, Discover and Air Dolomiti all use it.

For TAP it would need, besides configuration:

- a switch that skips all Lufthansa data requests (TAP has no `/service/api`; without the switch the block would show
  Lufthansa's airport names and labels, or send failing requests on every page view);
- a GET hand-off in a new tab with `dd.MM.yyyy` dates, instead of a POST in the same tab;
- radios instead of the trip-type `<select>`, a third trip type (multi-city with up to 6 rows) and "pay with miles";
- a two-month range calendar instead of the two native `<input type="date">` fields;
- TAP's passenger rules (no cabin, young adults by airport, the infant and child limits);
- code chips in the fields and in the list, and a list that opens on focus;
- check-in and manage-booking forms in the other tabs.

That would touch most of the 1,155 lines of a block that six live brands depend on, and lh-com code on main is live at
once. A new block keeps that risk at zero, and the TAP-specific parts (URL builder, airport sheet, passenger rules)
stay small and testable. What it reuses:

- `scripts/airport-combobox.js` (ARIA 1.2 combobox, used by flight-search and destination-finder), with two **optional**
  parameters whose defaults keep today's behaviour: `minChars` (default 2; TAP: 0, so the list opens on focus) and
  `renderOption(airport)` / `display(airport)` (default: today's `name (code)`; TAP: chip + "City, Airport" + country,
  and the field shows chip + "City, Country").
- the theme tokens of `styles/themes/tap.css` (colours, radii, Inter and GT Flexa), so the block CSS uses token names
  and the box can serve another airline later.

Name: `booking-box`. The name describes what it is, not whose it is (as `flight-timetable` and `manage-booking` were
built for Air Dolomiti). The engine-specific parts sit behind a `format` value, so another airline's engine could be
added later without a new block.

## 5. Spec for `booking-box`

### 5.1 Content model (DA, one block table, two columns key | value, all rows optional except Format)

| Row | Example (pt-pt) | Meaning |
|---|---|---|
| Format | tap | which hand-off and airport rules; only `tap` for now |
| Market | PT | market code for the hand-off (default: the root's country, upper case) |
| Language | pt | language for the hand-off (default: the root's language) |
| Default origin | LIS | prefilled origin (code; the name comes from the airport sheet) |
| Airports | `/pt-pt/booking/airports.json` (link) | the airport sheet (5.3); default `<root>/booking/airports.json` |
| Tabs | Reservar voo, Fazer Check-in, Gerir reserva, Estado do voo | tab labels, in this order: book, check-in, manage, status |
| Flight status page | link to www.flytap.com's flight status page | where the 4th tab sends visitors (status search stays on www) |
| Login page | link | the "Login" button of the check-in and manage tabs (TAP's account, on www) |
| Corporate link | [Reservas para empresas](https://tapforbiz.com/) | link under/next to the trip types, new tab |
| Labels | 35 rows, one per key of `booking-labels.json` (`Round trip | Ida e volta`, …) | UI texts; built-in English defaults for missing rows |

The importer (ema-cashub, TAP's importer) writes this table into each root's homepage from the captured page: labels
from that root's i18n store (or `booking-labels.json`), Default origin from `pageProps.markets[]` for the root's market.

### 5.2 Hand-off builder (pure function, own module, unit tested)

`buildTapDeeplink({ market, language, tripType, flights, adults, youngAdults, children, infants, payWithMiles },
uuid)` returns a URL string. Rules as in 3.1. `uuid` is passed in so tests are deterministic. In the browser it is
`crypto.randomUUID()`. Dates arrive as ISO `YYYY-MM-DD` and leave as `dd.MM.yyyy`, with no time-zone conversion (the
date the visitor picked is the date sent). The page opens the result with `window.open(url, '_blank', 'noopener')`.
Allowed host: exactly `booking.flytap.com`.

Test cases (input → expected URL; `U` = `00000000-0000-4000-8000-000000000000`):

1. `{market:'PT', language:'pt', tripType:'return', flights:[{origin:'LIS', destination:'OPO', date:'2026-11-28'}],
   returnDate:'2026-12-02', adults:1}` →
   `https://booking.flytap.com/booking/flights/deeplink?market=PT&language=pt&origin=LIS&destination=OPO&flexibleDates=false&flightType=return&adt=1&chd=0&inf=0&yth=0&depDate=28.11.2026&headerfooterhidden=false&retDate=02.12.2026&x_tap_source=WEB&x_tap_username=&x_tap_correlationid=U`
   (equals recorded R1 apart from the UUID)
2. one way LIS→PAR 2026-11-28, 1 adult, PT/pt →
   `…/flights/deeplink?market=PT&language=pt&origin=LIS&destination=PAR&flexibleDates=false&flightType=single&adt=1&chd=0&inf=0&yth=0&depDate=28.11.2026&headerfooterhidden=false&x_tap_source=WEB&x_tap_username=&x_tap_correlationid=U`
   (no `retDate`; equals R2)
3. en-pt: as 1 with `language:'en'` → `…?market=PT&language=en&…` (R3)
4. es-es: MAD→OPO, ES/es → `…?market=ES&language=es&origin=MAD&destination=OPO&…` (R4)
5. fr-fr one way PAR→LIS 2026-12-05, 2 adults 1 child 1 infant →
   `…?market=FR&language=fr&origin=PAR&destination=LIS&flexibleDates=false&flightType=single&adt=2&chd=1&inf=1&yth=0&depDate=05.12.2026&headerfooterhidden=false&x_tap_source=WEB&x_tap_username=&x_tap_correlationid=U` (R5 plus the x_tap fields)
6. multi-city LIS→PAR 2026-12-05, PAR→OPO 2026-12-10, OPO→LIS 2026-12-15, PT/pt →
   `https://booking.flytap.com/booking/flights-multicity/deeplink?market=PT&language=pt&origin=LIS&destination=PAR&flexibleDates=false&flightType=openJaw&adt=1&chd=0&inf=0&yth=0&depDate=05.12.2026&headerfooterhidden=false&origin1=PAR&destination1=OPO&depDate1=10.12.2026&origin2=OPO&destination2=LIS&depDate2=15.12.2026&x_tap_source=WEB&x_tap_username=&x_tap_correlationid=U`
7. case 1 with `payWithMiles:true` → the same URL with `&award=true` appended at the end
8. LHR→LIS return, 1 adult 1 young adult (UK route) → `…&adt=1&chd=0&inf=0&yth=1&…`
9. date padding: depDate `2027-01-05` → `depDate=05.01.2027`
10. pl-pl: WAW→LIS → `…?market=PL&language=pl&origin=WAW&…`
11. guards: a return without returnDate, a missing destination, origin equal to destination, or more than 6 flights
    throws (the UI blocks these before submit); young adults on a non-UK route are sent as `yth=0`.

### 5.3 Airport data

Source: `POST https://www.flytap.com/api/flight?functionName=originSearch`, `content-type: application/json`, body
`{"airlineIds":["TP"],"language":"<ll>","latitude":38.7071,"longitude":-9.13549,"market":"<CC>","payWithMiles":false,
"tripType":"R"}`. The answer is public, `cache-control: public, max-age=43200`, about 630 KB with 1,553 entries such as:

```json
{"city":"PAR","state":null,"airport":"PAR","country":"FR","area":null,"airlineId":[],"alias":null,"interline":true,
 "firstOperationDate":null,"lastOperationDate":null,"tapRoute":true,"starAllianceRoute":true,"weakFlight":null,
 "commercialRoute":true,"resident":null,"student":null,"milesAndGo":null,"isRailway":false,
 "cityName":"Paris","airportName":"todos os aeroportos","countryName":"França"}
```

Names follow `language` (en: "Lisbon", "All airports", "France"). 184 entries are TAP routes (`tapRoute`), 12 are rail
stations. TAP's destination list for a chosen origin comes from `functionName=destinationSearch` with
`{"airlineIds":["TP"],"language","market","origin":"LIS","payWithMiles":false,"tripType":"R"}` (670 entries from LIS).

From another origin it can't be read: no `access-control-allow-origin`, and the OPTIONS preflight answers 500. So:

- **Phase 1:** a tool (TAP importer side, ema-cashub) fetches originSearch once per root at a slow pace
  and writes a DA sheet `/<root>/booking/airports` with the columns `code, city, cityName, airportName, country,
  countryName, tapRoute, railway`. It uploads and previews it, and the steering session publishes it. The block fetches
  `<root>/booking/airports.json?limit=5000` the first time an airport field gets focus, not on page load (about
  260 KB raw, roughly 35 KB compressed), and then matches with TAP's scoring (2.3). The same list serves origin and
  destination. A route TAP doesn't fly is answered by TAP's engine ("no flights"), as on any engine. Refresh: before
  each publish round and before cutover.
- **Later, optional:** an lh-edge route on the brand host that proxies originSearch/destinationSearch server-side
  (cached 12 h, as TAP allows), with the sheet as fallback. That gives TAP's per-origin destination list. Probe first
  whether TAP's Cloudflare lets a Worker through (www.lufthansa.com does not).

### 5.4 Look and behaviour

As in 2.1 and 2.3, with these deviations:

- No prices in the calendar and no price legend; the estimated-price note is left out too.
- No "recent searches" (TAP keeps them in localStorage; we can add this later).
- Login buttons link to TAP's site (account is out of scope); the "Login" column stays so the layout matches.
- Check-in tab: on submit, open `https://checkin.si.amadeus.net/static/PRD/TP/#/checkindirect?Redirected=true&ISurname=<lastName>&IFormOfIdentification=PNR&IIdentification=<code>&ln=<ll>`
  in a new tab. This is TAP's own dynamic link `/content/dam/tap/global/dynamiclinks/check-in-link`; TAP first asks
  its `/api/checkin?functionName=retrieveOfferUrl`, which we can't call, and falls back to this URL. Field rules as
  for manage booking (not checked separately on www).
- Manage booking tab: open `https://myb.flytap.com/my-bookings/details/<code>/<lastName>?market=<CC>&language=<ll>` in
  a new tab. Code: 6 letters or digits, or a 13-digit ticket number. Last name: at least 2 characters.
- Flight status tab: one line of text and a button to the Flight status page row (status search stays on www).
- Layout: the block decides its placement from its section. When its section directly follows the homepage hero
  section, at ≥1024 px it pulls up over the hero's bottom (TAP: 222 px overlap, 18 px of hero left below the card) and
  centres the tab bar 16 px above the card. Below 1024 px it sits under the hero. This depends on the hero work in
  ema-cashub's parity list (TAP's hero is inset with 32 px corners); until then the overlap must not cover the
  hero-campaign slider's dots or CTA. Check both at 1440 and 390.
- Anchors: on load and on `hashchange`, `#book-flight`, `#check-in`, `#my-travels`, `#flight-status` and TAP's
  `#special-anchor-<same>` select that tab and scroll the box into view. The importer rewrites
  `/<root>#special-anchor-<tab>` links (and links on other pages with only that hash) to `/<root>#<tab>`, so header
  and content links land on the homepage box. A site-wide overlay like www's is a later step.
- Accessibility: tabs are an ARIA tablist (arrow keys), radios are native, steppers are buttons with labels, the
  calendar grid can be used by keyboard, errors are tied to fields with `aria-describedby`, and the new-tab links say
  so to screen readers (as lh-com does elsewhere).
- Performance: no request to TAP or the airport sheet before the first interaction; the block has no images.

### 5.5 Which pages use it

The homepage of every TAP root: pt-pt, en-pt, es-es, fr-fr, de-de, it-it and pl-pl (all live). It
replaces nothing; today's homepages have no search. It goes in a new section directly after the hero section. Every
other page reaches it through the rewritten anchor links (5.4).

### 5.6 Release order and rollback

1. ema-adobe: `booking-box` block plus the optional `airport-combobox.js` parameters, with unit tests for the builder
   (cases 1 to 11), the passenger rules and airport matching. Existing combobox tests stay green. Nothing uses the block
   yet. Rollback: git revert.
2. ema-cashub: airport sheet tool, sheets for the four live roots, uploaded and previewed; the steering session publishes the sheets.
   Rollback: unpublish.
3. ema-cashub: the block table on each live root's homepage and the anchor-link rewrite in the importer, uploaded
   and previewed. The steering session checks at 1440 and 390 (search to TAP's flight list once per root, no further) and then publishes.
   Rollback: restore the previous DA version of the homepages and republish.
4. Later imports (the market roots, pt-br) write the block table the same way.

## 6. Market roots

Checked on 2026-11-04 (brief 340), after ema-cashub switched pt-br and the 137 market roots on (b406eb8), on
tap.turnsthe.page: one root per language version plus the three pilots. Each root's homepage block table names its
market, language and default origin; they match `scripts/tap-markets.js` (www's market settings) and the box hands
them to TAP's engine as §3.1 says: `market=<CC>`, `language=<ll>`, `origin=<the root's airport>`. TAP's engine takes
the currency from the market (no currency parameter on www's hand-off either). The calendar is in the root's language
(the Language row), weeks from Monday on every root. Check-in sends `ln=<ll>`, manage booking `market=<CC>&language=<ll>`.

**Fixed:** on every market root the airport fields had no list. `/<root>/booking/airports.json` answered 404: the
market route rewrote the homepage's link to the language version's sheet into the root's path, and answered `.json`
only from the root's own folder. Since 19c45c5 (lh-edge, `src/tap-markets.js`) a sheet the root has no copy of comes
from its language version, as it is (1,553 airports on every root). pt-br has its own sheet.

| Root | Default origin | Hand-off (Dec 10-17, 1 adult, return) | TAP's answer |
| --- | --- | --- | --- |
| pt-br | RIO (Rio De Janeiro, Brasil) | market=BR, language=pt, RIO→LIS | flight list, "Selecionar voos" |
| de-at | VIE (Wien, Österreich) | market=AT, language=de, VIE→LIS | flight list, "Flüge wählen" (Wien → Lissabon) |
| en-gb | LON (London, United Kingdom) | market=GB, language=en, LON→LIS | flight list, "Select flights" |
| es-mx | CUN (Cancún, México) | market=MX, language=es, CUN→LIS | flight list, "Seleccionar vuelos" |
| fr-be | BRU (Bruxelles, Belgique) | market=BE, language=fr, BRU→LIS | flight list, "Sélectionner des vols" |
| pt-ao | NBJ (Luanda, Angola) | market=AO, language=pt, NBJ→OPO | flight list, "Selecionar voos" (Luanda → Porto) |
| de-ch | GVA (Genf, Schweiz) | market=CH, language=de, GVA→LIS | flight list, "Flüge wählen" (Genf → Lissabon) |
| fr-ca | YYZ (Toronto, Canada) | market=CA, language=fr, YYZ→LIS | flight list, "Sélectionner des vols" |
| en-us | NYC (New York, USA) | market=US, language=en, NYC→LIS | flight list, "Select flights" |
| it-it | FCO (Roma, Italia) | market=IT, language=it, FCO→LIS | not sent (the limit of 10 searches; built as the others) |
| pl-pl | WAW (Warszawa, Polska) | market=PL, language=pl, WAW→LIS | not sent (as it-it) |

Nine searches in all, one per root, at least 30 s apart; each reached TAP's flight list in the root's language. Italian
and Polish have no market roots (it-it and pl-pl are their only roots; it-ch does not exist on www either).

**Not verified:** www's own calendar on en-us and pt-br (www opens it only after a destination is chosen, and the
search limit was spent on the hand-offs). Ours starts every week on Monday, as www's pt-pt calendar (§2.1).

**Missing in every root's block table** (the language roots' too; the importer's, ema-lufthansa): the check-in and
manage tabs' rows `ibe.login`, `login-and-make-easier`, `ibe.reservation-details`, `ibe.reservation-number`,
`ibe.passenger-lastname`, `ibe.find-reservation`, `validation-invalid` (TAP's i18n keys, §2.2), and the block's own
`same-airports`, `flight-status-text`, `remove-flight`, `previous-month`, `next-month`, `close`, `fewer`, `more`,
`new-tab`. Without them those texts are English on every root ("Login", "Or enter your booking details", "Booking
code", "(opens in a new tab)" …). The tab labels come from the Tabs row and the corporate link's text from its link:
both present.
