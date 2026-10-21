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
- `cleaned.html` drops attributes the parsers need (`maui-*` labels, `data-dcep` JSON,
  input values). Validate parsers against the raw snapshots.
- Links are still `maui-navigation-link` / `maui-link` / `maui-button-link` (often inside a
  `maui-tooltip` as `slot="trigger"`) when parsers run; the cleanup converts the rest to `<a>`
  in afterTransform.
- To debug the real browser pipeline offline: put a test snapshot in `tools/importer/bd-snapshots/`
  and run `import-batch.mjs --url ...`, or load the snapshot with playwright-core, inject
  `helix-importer.js` and the bundle, and call `WebImporter.html2md` (see git history of this file).

## Content

- Files under `content/` cannot be deleted from the agent. Two stray local files exist and are
  never uploaded (not in scope): `content/drafts/blocktest/t.plain.html`,
  `content/lhg/de/en/zz-test.plain.html`.
