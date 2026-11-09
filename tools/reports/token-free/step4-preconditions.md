# Token-free styling, step 4: what must be zero before the old marker readers go

Step 4 of Ben's plan removes the code that still reads style markers at runtime. A reader goes only when nothing it
reads is left anywhere it is served from. Until then it stays, so a document that still carries a marker renders as
today. This page lists the readers, the families each one reads, and the preconditions. The census that measures them
is `tools/importer/marker-census.mjs`.

## The readers

| reader | what it reads (families: tools/importer/marker-families.mjs) | goes when |
| --- | --- | --- |
| scripts/scripts.js `decorateTextStyles` / `takeStyleMarker` (HEADING_STYLE, PARAGRAPH_STYLE, LIST_STYLE, SEPARATOR, BLANK_LINE from scripts/style-markers.js) | heading, text-size, text-width, column, separator (incl. from-768), caption, parallax-narrow, indent, blank (TAP's empty line) | all these families are 0 on every site, preview and live |
| scripts/media.js `takeVideoSettings` (VIDEO_MARKER) | video (autoplay, muted, loop, controls, round-play-button, size-WxH) | video 0 (the carriers: the link's #background and #size=WxH, block option background-video) |
| blocks/article-header/article-header.js (MOBILE_MARKER) | video: {mobile} | {mobile} 0 (the carrier: option mobile-video) |
| blocks/columns-media/columns-media.js (the {cell-…} marks) | cell | cell 0 (the carriers: options picture-half-start, -half-end, -three-quarters) |
| blocks/form/form-rules.js (SELECTED_MARK) | form: {selected} | form 0 (the carrier: the Default column) |
| blocks/header/header-tools.js `takeRole`, blocks/header/header.js | nav-role ({cart}, {login}, {locale}, {help}, {search}, {accessibility}, {notifications}) in the nav documents | nav-role 0 in every nav document (the carrier: the Nav Tools table) |
| scripts/library-page.js `decorateAppScreen` (APP_SPACER, APP_SMALL) | app ({spacer: …}, {divider}, {small}) on /content/mobile/… | app 0 under /content/mobile/ (the carriers: App Spacer, App Divider, App Text) |
| lh-edge: tools/workers/lh-edge/src/sdui.js `takeMarker`, the {spacer: …} match; sdui-web.js `stripStyleMarkers` / `stripStyleMarkersHtml` and its separator MARKER | app; every family (stripped from the app JSON) | app 0 and all families 0 on the pages lh-edge turns into app JSON |
| scripts/style-markers.js: the marker patterns (HEADING_TOKENS … BLANK_LINE, VIDEO_SETTINGS' marker form, stripStyleMarkers) | the shared patterns of the readers above | the last of the readers above is gone (the carrier readers in the same module stay) |

The CSS stays. The classes the markers gave (`column-mark`, `spacer`, `copytext-small`, `full-width` …) are the ones
the carriers and the theme give too (scripts/token-free.js draws every carrier with them).

## The preconditions

1. **Every brand's pass is done and its switch merged**: ITA, Discover, TAP, SWISS, Austrian, Brussels, B2B, Cargo,
   and the two without a switch branch yet, lufthansa.com (lh-com) and Air Dolomiti. Until a brand's theme is live,
   its imports keep writing markers (the import gate, `isThemeLive`).
2. **The census is 0, preview and live, for each family a reader reads**, on every site: `node
   tools/importer/marker-census.mjs --site <site>` for lh-com, lh-ita, lh-discover, lh-tap, lh-swiss, lh-austrian,
   lh-brussels, lh-b2b, lh-cargo, lh-airdolomiti. lh-com's paths come from its sitemaps; the brand sites publish none,
   so their paths come from the upload state's previewed documents. A reader goes when its families are 0 everywhere
   it serves. Sites can't be counted one at a time: the code is shared.
3. **No writer is left.**
   - Every generated import script collapses as its last step (gated on the brand's theme).
   - The site importers do the same through collapse-docs.mjs.
   - TAP's tap-import.mjs collapses itself (ema-cashub's, gated on TAP's theme).
   - The app screens collapse through collapseApp.
   - A writer outside these has to go first, for example lufthansa-cleanup.js's marker output if a bundle stops
     calling the collapse.
4. **Documents that quote markers as text** are left out of the census or have their quotes as code. The census
   would otherwise never reach 0. Known today: lh-com's internal author and tech guides under /migration-status/,
   which explain markers; the collapse's loss check flags 3 of them.
5. **The tests that assert a reader** go with it (style-markers-lists, tap-blank-accordion, video-size-token-494, the
   readers' parts of token-free.test.mjs), and **lh-edge's tests** for the app JSON's stripping.
6. **The documentation** goes too: README's and AUTHORING's marker sections, the DA library's marker notes, the
   loc-marker check.

## The census today

`marker-census.mjs` over our own hosts' `.plain.html` (main--<site>--moved-permanently.aem.page and .aem.live), 150
ms between requests:

| site | environment | paths (source) | read | missing | with markers | per family |
| --- | --- | --- | --- | --- | --- | --- |
| lh-b2b | page | 733 (upload state (previewed documents)) | 733 | 0 | 679 | text-width 1,961, column 1,909, heading 883, separator 819, video 159, indent 29, text-size 27 |
| lh-b2b | live | 733 (upload state (previewed documents)) | 733 | 0 | 679 | text-width 1,961, column 1,909, heading 883, separator 819, video 159, indent 29, text-size 27 |
| lh-discover | page | 563 (upload state (previewed documents)) | 563 | 0 | 470 | column 1,677, heading 1,634, separator 518, text-width 451, text-size 40, video 24, form 6 |
| lh-discover | live | 563 (upload state (previewed documents)) | 563 | 0 | 470 | column 1,677, heading 1,634, separator 518, text-width 451, text-size 40, video 24, form 6 |
| lh-ita | page | 2,563 (upload state (previewed documents)) | 2,563 | 0 | 2,141 | text-width 14,466, heading 3,494, separator 1,466, column 590, indent 138, text-size 86, video 20, form 2 |
| lh-ita | live | 2,563 (upload state (previewed documents)) | 2,563 | 0 | 2,141 | text-width 14,466, heading 3,494, separator 1,466, column 590, indent 138, text-size 86, video 20, form 2 |

Counted so far: lh-b2b, lh-discover, lh-ita. Still to count (the census runs one request at a time, about 3 a second): lh-cargo, lh-tap, lh-airdolomiti, lh-brussels, lh-austrian, lh-swiss, lh-com; `logs/p4/s507/census/` collects them, and this table is rewritten from it.
