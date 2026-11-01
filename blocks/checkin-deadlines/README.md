# checkin-deadlines

Custom **checkin-deadlines** block. Purpose: www's check-in deadline search (`.checkindeadlinesearch > .dcep-checkin-deadline-search`, React "CheckinDeadlineSearch"), on lufthansa.com's `/de/en/check-in-deadlines`, Austrian's `/<root>/check-in-deadlines` (`/at/de/check-in-annahmeschlusszeiten`) and Brussels Airlines' `/<root>/check-in-options-and-info/check-in-times`: a travel class select (Economy/Premium Economy, Business/First), a country select, an airport select and Search; it shows the airport's terminal, check-in counter and deadline (in minutes, with www's explanation), then its off-airport and on-airport check-in services.

## Authoring (Document Authoring)

Model: `standalone`. Single block table, 2 columns, label | value, in the place of www's component. All rows optional:

| Row | Value | Default |
| --- | --- | --- |
| Check-in link | `https://wci.austrian.com/app/ck.fly` (www's data-dcep `checkinLink`): where a service www marks `GET FROM AEM` links | none: such a service shows its text |
| Fallback | a link to the airline's own page (`[Check-in times](https://www.austrian.com/at/en/check-in-deadlines)`): shown when www cannot be reached | www's page of the same path (scripts/locale.js siteOrigin), named with the Heading label |

Any UI string can be overridden with a row of the same name ("Submit label | Search"). Precedence: authored row, then www's label (`GET /service/api/labels/checkindeadlinesearch/{portal}/{lang}`: `lh/en`, `os/de`, `sn/fr`, …), then the built-in English (www's own defaults) or German (www's os/de). Strings: Heading, Class label, Economy label, Business label, Country label, Airport label, Submit label, Result heading (`Airport {AIRPORT_NAME}`), Off airport heading, On airport heading, No results label, Loading label, Loaded label, Failure label, Service header, Availability header, Deadline header, Link header, Drop-off deadline header, Drop-off location header, Terminal label, Counter label, Deadline label, Service CIS_Label_31 (online), Service CIS_Label_32 (mobile), Service CIS_Label_33 (automatic), Service CIS_Label_26 (late night), Service CIS_Label_34 (kiosk), Service option2, Availability 0, Availability 1, Availability 2.

Lufthansa's four locales (authored by ema-adobe): an empty block in the component's place (`| Checkin Deadlines |`) is enough; the labels come as `lh/{lang}`, the calls go to www.lufthansa.com with LH's portal headers. A Fallback row only if the default (www.lufthansa.com's page of the same path) is not the page to send visitors to.

## Behaviour

- Calls (www's 014527fd/2dd051c3/a13666a2 chunks on www.austrian.com, 2026-11-01): `GET /service/api/catalogs/checkin/info/countries` (`{"countries":[{code, name}]}`) on load; `…/airports?country=AT` (`{"airports":[{code, airport}]}`, an airport listed several times: one option per code, in the order of its first entry) when a country is chosen; `…/deadlines?airport=VIE&isEconomy=true` (`{"checkinInfos":[…]}`) on Search, `isEconomy` being `cabin === "ECE"` as www's onSubmit: Business/First (FBE) sends `false`. Headers X-Portal (the brand's portal: LH, OS, SN), X-Portal-Site, X-Portal-Language, X-Portal-Taxonomy "", X-Portal-CountryId "" (scripts/lh-data.js portalHeaders).
- Where: on the airline's own host same-origin; on a demo host directly on the brand's www when it answers our hosts cross-origin (scripts/brands.js `serviceOrigin`: www.austrian.com), else www.lufthansa.com (lh-com; Brussels: www.brusselsairlines.com sends no CORS headers, www.lufthansa.com answers the SN portal with Brussels' data). The four routes are live-only routes of scripts/lh-data.js (isLiveOnlyRoute): the price routes' two retries and short backoff, never a recorded answer.
- Form (www's): Travel class preselected Economy/Premium Economy, Country, Airport (disabled until the country's airports are in), the primary button disabled until all three are chosen; the labels sit on the fields as www's floating labels. From 768px the four in a row, below stacked.
- Results: `Airport {AIRPORT_NAME}` (h2), per check-in info a summary table (Terminal, Check-in counter, Check-in deadline; www's explanation under the deadline, its HTML kept to text, line breaks, emphasis and http(s) links), then the off-airport services, then the on-airport services, each an h3 and a six-column table (service, available for, deadline, link, bag drop-off deadline, bag drop-off location) scrolling sideways on a narrow screen. A service's name is its `CIS_Label_*` label (31 online, 32 mobile, 33 automatic, 26 late night, 34 kiosk, option2); availability 0/1/2 its label; a link `GET FROM AEM` the Check-in link row; a service www has no label for and nothing else (Brussels' CIS_Label_35) is left out. No info: www's no-results text.
- A call fails (after the retries): countries: the Fallback link instead of the form; airports or deadlines: the failure label and the Fallback link. Each failed call is tried once more when its backoff ends (scripts/lh-data.js priceRetryDelay); an answer then puts the form or the results in place and hides the link. Labels that fail are tried once more too (the built-in strings meanwhile).
- data-lh-source: before a search the countries (primary), after it the deadlines; data-lh-sources lists all (markSource).
- Left out: www's small-screen mode (after a search the form folds into a summary with a "Modify search" dialog: here the form stays), the required-field errors (the button stays disabled instead), the analytics event.

## Universal Editor fields

N/A (Document Authoring project)
