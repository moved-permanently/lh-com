# Import notes (lufthansa.com → lh-com)

Things that are not obvious from the code and cost time once.

## Fetching

- www.lufthansa.com is bot-protected. Pages come only through one warm Bright Data session
  (`tools/importer/bd-session.mjs`): homepage first, then the same page navigates on, one page
  every 5–10 s. Every page is saved once as a snapshot under `tools/importer/bd-snapshots/`
  and never fetched again.
- Cloudflare challenges in-page `fetch()` of `.model.json` even inside the warm session, so
  component trees are not collected (the rendered snapshot is the import input).
- Never run `run-bulk-import.js` directly on a URL without a snapshot: it then opens its own
  cold Bright Data session and fetches the live page. `import-batch.mjs` refuses such URLs.
  `BD_SNAPSHOT_DIR` is not honoured by the bulk importer, and `--html-dir` is not an output
  folder (output always goes to `content/`).
- Static assets (CSS, fonts, images) answer 200 to plain curl.

## Parsers

- The importer unwraps `<span>` elements before the import script's `transform()` runs.
  Text that sat in a span becomes a bare text node: read `childNodes`, not `children`.
- helix-importer's preProcess runs before `transform()` and replaces every `<img src="data:...">`
  with a `blob:` URL (or with `data-src` when present). Parsers never see data URIs in the real
  pipeline, though jsdom checks against snapshots do. Treat `data:` and `blob:` alike;
  the cleanup drops leftover inline images in afterTransform.
- `cleaned.html` drops attributes the parsers need (`maui-*` labels, `data-dcep` JSON,
  input values). Validate parsers against the raw snapshots.
- Some snapshots caught a video viewer before its player loaded (`.dcep-video-viewer` with only a
  `maui-loader`): the video is in its `data-dcep` JSON (`videoSrc`, `thumbnailSrc`), so the cleanup
  keeps such components and the columns-media parser reads the JSON (/de/en/first-class,
  /de/en/tiere-als-uebergepaeck).
- Links are still `maui-navigation-link` / `maui-link` / `maui-button-link` (often inside a
  `maui-tooltip` as `slot="trigger"`) when parsers run; the cleanup converts the rest to `<a>`
  in afterTransform.
- To debug the real browser pipeline offline: put a test snapshot in `tools/importer/bd-snapshots/`
  and run `import-batch.mjs --url ...`, or load the snapshot with playwright-core, inject
  `helix-importer.js` and the bundle, and call `WebImporter.html2md` (see git history of this file).

## Bundles and offline checks

- Rebuild bundles with `node tools/importer/build-bundles.mjs [template ...]`: temp file + rename,
  so a running import loop never loads a half-written bundle (`npx --offline` works).
- A full import can be reproduced without a browser in jsdom: load the snapshot, eval
  `excat-content-import/scripts/static/inject/helix-importer.js` and the bundle, call
  `WebImporter.html2md` + `md2da` + `processPlainHtml` (import-processors). Output matches the
  browser run except `:icon:` tokens (blob images) and the `/media-da/` imageMap.

## Page head metadata (post-import step)

- `node tools/importer/head-metadata.mjs` (idempotent, a few seconds) rewrites the Metadata block
  of every scope page from its snapshot's live `<head>`: Description (empty row where live has none,
  else EDS makes one from the first paragraph), og:title / og:description only where live differs
  from its title / description, Keywords, Robots only with "noindex", Canonical only where it points
  elsewhere, Image = live og:image, json-ld (AirCore routes, `aircore-jsonld.json`). Run it after
  every import and before postprocess-media.mjs (batch-cycle.sh does). Report:
  `tools/reports/head-metadata.md`.

## Preview limits (post-import step)

- Edge Delivery preview rejects documents with > 200 images, SVGs > 40 KB and images > 20 MB.
  `node tools/importer/postprocess-media.mjs --all` (idempotent, ~6 s when cached) splits long
  list sections into `/{lhg/}{cc}/{ll}/fragments/{page}-{group}[-n]` documents, rasterizes big
  SVGs and resizes originals wider than 2560 px / over 5 MB into `content/media-da/`. AEM
  renditions (`.transform/lh-dcep-transform-width-N`, N ≤ 2560) stay remote. Downloads are cached
  in `tools/source-export/media-cache/`, decisions in `tools/importer/media-manifest.json`.
- Some DAM originals the importer picks answer 403/404 (`…/1091_02_0988.tif.jpg`, extensionless
  `pixels_variations/c-…`); their `.transform/lh-dcep-transform-width-2560/img.jpg` rendition works.
- The `/de/en/flights` destination grid (`.dcep-destination-finder`, 590 tiles) is the
  `Destination Finder (grid)` block, rendered from the destinationfinder API, never static tiles.

## Content

- Files under `content/` cannot be deleted from the agent. Two stray local files exist and are
  never uploaded (not in scope): `content/drafts/blocktest/t.plain.html`,
  `content/lhg/de/en/zz-test.plain.html`.
- Edits authors make in DA are lost on the next upload of the imported document unless they are
  listed in `tools/importer/author-edits.json`: `da-upload.mjs` (also in the import loop) applies
  their `replace` pairs to every upload of that path, refuses the upload when an edit no longer
  applies, and never uploads paths with `skip: true`. Current entry: Ben's "Entertainment on
  board" heading on `/de/en/during-your-trip/internet-overview` (channels demo).
- `da-upload.mjs` runs are cut by `timeout` (SIGTERM). It prints every problem the moment it
  happens and, on SIGTERM/SIGINT or when `--budget <seconds>` is nearly used (no new document in
  the last min(30 s, budget/10)), saves the state and prints the summary with the problems (budget:
  exit 0). A preview counts as done only when it succeeded after the last upload
  (`preview >= uploaded`, no `previewError`); failed previews are kept in the state
  (`previewError`, `previewErrorAt`) and retried on the next run even if the upload is unchanged.
  `/{cc}/{ll}/login` and `/{cc}/{ll}/profile/*` (app shells, built elsewhere) are always refused.
  Offline test: a fake `curl` script first on `PATH` and `DA_UPLOAD_STATE=/tmp/copy.json`.

## Shop handoff (flight search submit)

- The live flight manager hands off with a POST form navigation, not a GET URL. Captured from one
  real de/en search (FRA→NYC, 18–25 Nov 2026, 1 adult, Economy, consent declined):
  `action="https://shop.lufthansa.com/booking/availability?lang=en-GB&portalCountry=DE"`,
  `method="post"`, `target="_self"`, fields
  - `lang` = `en-GB`
  - `portalCountry` = `DE`
  - `search` = `{"itineraries":[{"departureDateTime":"2026-11-18","originLocationCode":"FRA","destinationLocationCode":"NYC"},{"departureDateTime":"2026-11-25","originLocationCode":"NYC","destinationLocationCode":"FRA"}],"travelers":[{"discounts":[],"passengerTypeCode":"ADT"}],"cabin":"ECONOMY","portalFacts":{"performance":false,"targeting":false,"functional":false}}`
- `blocks/flight-search/flight-search.js` `buildShopHandoff()` builds the same form: one itinerary
  for one-way, one `ADT` traveler per adult, cabin from the Cabin row (E→ECONOMY, P/W→PREMIUM_ECONOMY,
  B/C→BUSINESS, F→FIRST), `portalCountry` from the market. Unverified (no capture): `lang` for
  de/de (`de-DE`), at/de (`de-AT`), gb/en (`en-GB`); `portalFacts` from the stored consent
  (C0002 performance, C0004 targeting, C0003 functional, assumed standard OneTrust ids). The
  nonstop checkbox has no field in the capture and is not sent.
