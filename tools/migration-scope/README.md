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
The last 8 rows (added 2026-10-25) are the confirmation pages the 9 core forms go to after a
submit (live `:redirect`, e.g. `/de/en/support/contact/contact-form-confirmation`); the refund
confirmation exists only in de/de and at/de (de/en and gb/en refunds go to the contact-form
confirmation), so its de_en and gb_en cells are empty. The forms' error page is live's
`/error.html` (the not-found page), served by `404.html`.

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

`local-pages.csv`: market-only pages, `path,locale,kind`. Every market on www also has pages
that exist only there: events (`event`), local promotions (`local-promotion`) and the LoungeNet
lounge pages (`loungenet`). They are imported 1:1 in their own locale only. They sit outside
`pages.csv` because that file is the set of parallel pages that exist in all four locales and
that Document Authoring later links as translation (`de/en` to `de/de`) and rollout (`de/de` to
`at/de`, `de/en` to `gb/en`); these pages have no counterpart in another locale and must stay out
of any rollout or translation. The importer treats links to them as local
(`tools/importer/build-scope-paths.js` reads both files), and the language switch
(`data/locale-map.json`) goes to the other locale's homepage. Even the two
`south-africa-winter-promotion` pages (de/en and de/de) are two separate rows: each is its
market's own page, not a translation of the other. The LoungeNet pages keep the full path www
serves them under (`/content/lh/markets/de/en/during-your-trip/lounges/loungenet/...`) and live's
`noindex`.

## AirCore (/lhg/), out of scope

The pages under `/lhg/` (destination, origin and route pages) come from a second platform,
AirCore. www renders them separately and writes their prices into the HTML every night, so a
copy carries prices frozen at import (Bari on `/lhg/de/en/dest/c/italy`: 143 EUR in the copy,
131 EUR on www on 2026-10-25). They left the replica on 2026-10-25 in all four locales: links to
them import as absolute `https://www.lufthansa.com/lhg/...` links, nothing under `/lhg/` is
uploaded or previewed in DA, and the parity report no longer lists them. The former list
`aircore.csv` is gone; only the image list below remains.

`aircore-dam-images.csv`: every `/content/dam/` URL that the 107 imported `/lhg/` pages (all
four locales) load on www, from their captures (`tools/importer/bd-snapshots/www.lufthansa.com/lhg`,
the rendered DOM: img `src` and `srcset`, inline and `<style>` backgrounds, preloads, `og:image`;
and the recorded heads in `tools/source-export/heads/lhg`, which hold the JSON-LD). Columns:
`path` (the exact path, on `https://www.lufthansa.com`), `asset` (the part before `.transform/`,
or the path itself for an untransformed file), `width` and `format` (from the transform; empty
width for an original), `pages` (space-separated). Regenerate it with
`node tools/migration-scope/build-aircore-dam-images.mjs`. The captures were taken on 2026-10-21
and 2026-10-22: 754 paths of 712 assets. The AirCore pages use only widths 360, 720, 1440 and
2560 and only webp (the 180 and jpg renditions belong to the AEM pages' own transform). The
`og:image` of these pages is under `/aircore/cache/` or `/aircore/media/`, not `/content/dam/`,
and their JSON-LD carries no image. The list is the source of the image redirects for the `/lhg/`
pages, which left the replica on 2026-10-25.

The navigation is authored as pages under `/{country}/{lang}/configuration/commonheader/*`. Use
them as the source for the nav, not as pages.

## Left out

The Insights articles beyond the 24 sampled, `/profile/*`, login and Travel ID, `/deeplink/*`
(My Flights), the booking flow on shop.lufthansa.com, the check-in flow, form submissions, test
pages (`dcep_ams_*`), the raffle pages, the other 26 aircraft-type pages, the other 10 stopover
offers, and all AirCore pages (`/lhg/`, see above).

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
| Login, cart | `api.travelid.lufthansa.com`. Out of scope: show the login entry point and link to the live site. |
