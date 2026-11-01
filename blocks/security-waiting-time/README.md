# security-waiting-time

Custom **live widget** block. Purpose: the current waiting times at the security checkpoints of an airport, as www's component (`.securitywaitingtime` / `dcep-security-waiting-time`): lufthansa.com `/<cc>/<ll>/prepare-for-your-trip/airport-information/services-at-the-airport/security-waiting-time`, ITA `/it/en/book-and-prepare/travel-information/at-the-airport/security-waiting-times`, Discover `/de/en/book/travel-information/airport-info/security-check-time-slot`.

## Authoring (Document Authoring)

Model: `standalone`

Single block table, 2 columns, label | value. Every row is optional: an empty block is the component as on www.

| security-waiting-time | |
| --- | --- |
| Airport | FRA |
| Live page | [Security waiting times](https://www.lufthansa.com/de/en/prepare-for-your-trip/airport-information/services-at-the-airport/security-waiting-time) |

- `Airport`: the airport shown at first (an IATA code from the list); the page's `?airport=FRA` wins, as on www (lufthansa.com's labels link the waiting times so: `securityWaitingTimeURL`).
- `Live page`: the link shown when the data cannot be loaded. Default: this page on the brand's www (lh-com: www.lufthansa.com, ITA: www.ita-airways.com, Discover: www.discover-airlines.com).
- Text rows override the labels: `Select label`, `Last update label`, `Open label`, `Closed label`, `Minutes label`, `Error label`, `Status label` (screen readers; www's ICU form `{WORKLOAD, select, CLOSED {…} OPEN {…} other {…}}`), `Live page label` (`{HOST}`: the live page's host).

## Data

- Airports: `GET /service/api/security-waiting-time/airports` (`{"airports":["BGO","BER",…]}`), named from the airport names catalog (`/service/api/catalogs/airportnames`; a code without a name shows the code).
- Waiting times: `GET /service/api/security-waiting-time/<IATA>/security`: per terminal (a tab each, also for one terminal, as www) and area the badge `<min> - <max> min`, `open` (workload OPEN) or `closed` (CLOSED), a dot in the workload colour (LOW green, MEDIUM amber, FULL red, OPEN grey, CLOSED navy), the area name and `Last update: 3 minutes ago`; screen readers get www's status sentence.
- Labels: `GET /service/api/labels/securitywaitingtime/<tenant>/<lang>` (`securityWaitingTime.default.default.*`); built-in English (www's defaults), German and Italian otherwise.
- Called on www.lufthansa.com with the brand's `X-Portal` headers (scripts/lh-data.js direct routes; www.lufthansa.com answers our hosts cross-origin, the ITA and Discover www hosts don't); on the airline's own host same-origin. Live or nothing, as the price routes: two retries within the call, then a short backoff; a failed call shows www's error text (waiting times) and the Live page link, never older numbers; one late try per page load.

## Universal Editor fields

N/A (Document Authoring project)
