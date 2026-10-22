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
