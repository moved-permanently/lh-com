# GraphQL persisted queries on www

`index.json` maps each recorded `/graphql/execute.json/<config>/<query>[;name=value...]` URL to its file, status and headers.
What was recorded and when, and what was blanked: the GraphQL section of `../README.md`.

## FLMA and Flash-teaser (2026-10-29 01:28 UTC)

Searched for query names of these two configurations in public sources: the HTML of `/de/en/homepage` and the 62 JavaScript
files it loads from www, and the fixtures in this folder. None names one. `FLMA` appears in the bundles only as the flight
search widget's id (`app/FlightManager/`, tracking events `b2t/FLMA/...`); `Flash-teaser` only as the flash teaser component
(`.dcep-flash-teaser`), which reads its messages from a `data-dcep` attribute in the page HTML, not from GraphQL.

Six guessed names, each answered 404 with `cache-control: public, max-age=120` and the body
`{"errors":[{"errorType":"PersistenceError","message":"Could not find Persisted Query","details":"Configuration: '<config>' and Query Name: '<query>' does not resolve to an existing Persistent Query"}]}`:

| URL | status | bytes | file |
|---|---|---|---|
| `/graphql/execute.json/FLMA/flightManagerConfig` | 404 | 209 | `FLMA-flightManagerConfig.json` |
| `/graphql/execute.json/FLMA/FlightManagerConfig` | 404 | 209 | `FLMA-FlightManagerConfig.upper.json` |
| `/graphql/execute.json/FLMA/flmaConfig` | 404 | 200 | `FLMA-flmaConfig.json` |
| `/graphql/execute.json/Flash-teaser/flashTeaserList` | 404 | 213 | `Flash-teaser-flashTeaserList.json` |
| `/graphql/execute.json/Flash-teaser/FlashTeaserList` | 404 | 213 | `Flash-teaser-FlashTeaserList.upper.json` |
| `/graphql/execute.json/Flash-teaser/flashTeaser` | 404 | 209 | `Flash-teaser-flashTeaser.json` |

The `.upper.json` suffix keeps the two spellings apart on case-insensitive file systems. www gives the same 404 body for an
unknown configuration (`NoSuchConfig-noSuchQuery.json`), so these answers do not show whether `FLMA` or `Flash-teaser` exist
as configurations. Bodies byte for byte; nothing blanked.
