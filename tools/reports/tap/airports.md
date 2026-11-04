# TAP's airport sheets for the booking box

Status of 2026-11-04: **seven sheets in DA (`moved-permanently/lh-tap`) and on preview; not
published** (booking-spec.md 5.3: the steering session publishes them).

`tools/importer/tap-airports.mjs` (tests: `test/tap-airports.test.mjs`): per root one `POST
https://www.flytap.com/api/flight?functionName=originSearch` with the spec's body (the root's
language and market, Lisbon's coordinates, return trips), 12 s between requests; anything but JSON
with an airport list stops the run. Every entry becomes a row, in TAP's order:

| column | from originSearch |
| --- | --- |
| code | `airport` |
| city | `city` (TAP's city code: `PAR` for all of Paris) |
| cityName, airportName, countryName | the names in the root's language |
| country | `country` |
| tapRoute | `tapRoute` (`true`/`false`) |
| railway | `isRailway` (`true`/`false`) |

Run of 2026-11-04 (seven requests, each answered `application/json`, 625 to 632 KB):

| Root | Rows | TAP routes | Rail stations | Lisbon, Paris (names) |
| --- | --- | --- | --- | --- |
| pt-pt | 1,553 | 184 | 12 | Lisboa; Paris, todos os aeroportos, França |
| en-pt | 1,553 | 175 | 12 | Lisbon; Paris, All airports, France |
| es-es | 1,553 | 194 | 12 | Lisboa; París, todos los aeropuertos, Francia |
| fr-fr | 1,553 | 197 | 12 | Lisbonne; Paris, tous les aéroports, France |
| de-de | 1,553 | 173 | 12 | Lissabon; Paris, alle Flughäfen, Frankreich |
| it-it | 1,553 | 172 | 12 | Lisbona; Parigi, tutti gli aeroporti, Francia |
| pl-pl | 1,553 | 174 | 12 | Lizbona; Paryż, wszystkie lotniska, Francja |

No airport code repeats within a sheet. **`tapRoute` depends on the market**, not only on the
airport (172 to 197 of the same 1,553 entries): the block should read each root's own sheet.

Each sheet is `/<root>/booking/airports` in DA (the JSON sheet as `b2b-hotlines.mjs` writes its
own), previewed; `https://main--lh-tap--moved-permanently.aem.page/<root>/booking/airports.json?limit=5000`
answers 200 with all 1,553 rows, each as in the sheet (`--check`).

Refresh (spec: before each publish round and before cutover): `node tools/importer/tap-airports.mjs
--fetch --sheet --upload --check` (all seven roots, about 75 s of requests); `--root <root>` for one.
The answers and the sheets stay in `content-sites/lh-tap/` (gitignored). pt-br (the eighth
version) is not in the tool's list yet: add it when its root goes live (market BR).
