# Migration scope: www.lufthansa.com to moved-permanently/lh-com

This folder lists the pages to migrate. The migration is 1:1: every page in scope should look and
behave like the live page on www.lufthansa.com. The folder is listed in `.hlxignore`, so EDS
does not serve it.

## Locales

Four locales, with the same pages in each:

| Locale | Role in the demo |
|---|---|
| `/de/en/` | English source. Lufthansa authors a global English tree internally (`gc/en`), but it is not public, so `de/en` stands in for it. |
| `/de/de/` | German translation of `de/en`. |
| `/at/de/` | Rollout of `de/de` to Austria. |
| `/gb/en/` | Rollout of `de/en` to the UK. |

All four are migrated from their live pages, including market differences such as prices,
currency, phone numbers and market-only notes. The translation and rollout relationships between
them are set up later in Document Authoring, so keep the page paths parallel: a page lives at the
same place in each locale tree, under the slug the live site uses for that locale.

## Files

`pages.csv`: 294 AEM pages, one row per page, with its path in all four locales:
`template_group,de_en,de_de,at_de,gb_en`. Paths are on `https://www.lufthansa.com`. The rows
come from the hreflang alternates in the live sitemap (`/sitemap/sitemap_lh_de_en*.xml.gz`,
read on 2026-10-21). Only pages that exist in all four locales are listed.

| template_group | pages | what it is |
|---|---|---|
| homepage | 1 | `/de/en/homepage` |
| hub | 17 | overview pages such as `flights`, `overview-travel-information`, `baggage`, `lounges` |
| info | 169 | service and information pages: baggage, check-in, airports, travel classes, onboard, families, animals, special needs, Miles & More, partners |
| campaign | 22 | long editorial pages: `100-years` and its sub-pages, stopover and three of its offers, trade fairs |
| fleet | 8 | aircraft and seat-map pages (four of the 30 aircraft-type pages, which share one template) |
| insights | 32 | the Insights magazine: overview, categories, tags, one author, 24 articles across all article formats |
| legal | 29 | imprint, privacy, terms and conditions, passenger rights |
| form | 9 | feedback, refund and registration forms. Render them, never submit them. |
| app-entry | 6 | entry pages of apps (flight search, check-in, my bookings). Migrate the page; the app itself links out. |
| flight-status | 1 | `timetable-and-flight-status` |

`aircore.csv`: 35 `/lhg/de/en/...` pages from the second platform, AirCore (destination, origin
and route pages). AirCore slugs are translated per locale (`/lhg/de/en/dest/co/europe` is
`/lhg/de/de/dest/co/europa`), so match the same destination in each locale, for example through
the page's language switch or the locale's AirCore sitemap
(`/aircore/sitemaps/{country}_{type}_{lang}_sitemap.xml`). Routes start in each market's own
cities: Vienna for `at/de`, London for `gb/en`. Origin pages (`/from/`) and business-class pages
exist only for Germany, so `at/de` and `gb/en` have no equivalent for those rows.

The navigation is authored as pages under `/{country}/{lang}/configuration/commonheader/*`. Use
them as the source for the nav, not as pages.

## Left out

The Insights articles beyond the 24 sampled, `/profile/*`, login and Travel ID, `/deeplink/*`
(My Flights), the booking flow on shop.lufthansa.com, the check-in flow, form submissions, test
pages (`dcep_ams_*`), the raffle pages, the other 26 aircraft-type pages, the other 10 stopover
offers, and all AirCore routes beyond the sample.

## Fetching the live site

Cloudflare bot management answers HTTP 403 to every client that is not a real browser (curl,
fetch from a server, headless clients without a browser TLS stack) on HTML pages, sitemaps,
`.model.json` and `/service/api/*`. Only `robots.txt`, images and static CSS/JS answer 200. Load
pages in a real browser, and fetch sitemaps and JSON with `fetch()` from inside a
www.lufthansa.com page. Keep the request rate low.

- A OneTrust cookie dialog covers the page until it is answered. Dismiss it before screenshots.
- `/` redirects by visitor IP. Always use full locale paths.
- AEM pages expose their component tree at `{page}.model.json`.

## Live data

These are same-origin calls on www.lufthansa.com today and become cross-origin on `aem.page`:

| Feature | Endpoints |
|---|---|
| Flight search: airport autocomplete, calendar, passengers | `/service/api/suggestions/airports`, `/service/api/catalogs/{airlines,airportnames,calendar,localeData,conditions,regions,affinities,countryselector}`, `/service/api/defaultAirport`, `/service/api/labels/bookingQuery/lh/{lang}`. Submitting hands off to shop.lufthansa.com. |
| Fare teasers | `POST /service/api/lhg-fare-teaser/fareteaser/offers/{origin}`, `POST .../fareteaser/manual`, `GET .../fareteaser/recommend`, `/service/api/labels/fareteaserstatic/lh/{lang}` |
| Destination finder | `/service/api/destinationfinder/campaign/{origin}`, `/service/api/destinationfinder/destination/finder/{origin}/{region}` |
| Labels | `/service/api/labels/{component}/lh/{lang}` |
| AirCore | prices are in the server-rendered HTML; `/aircore/weather/`, `/aircore/geolocation/` |
| Login, cart | `api.travelid.lufthansa.com`. Out of scope: show the login entry point and link to the live site. |
