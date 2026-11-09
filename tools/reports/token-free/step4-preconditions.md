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
| lh-airdolomiti | page | 1,569 (upload state (previewed documents)) | 1,569 | 0 | 3 | form 3 |
| lh-airdolomiti | live | 1,569 (upload state (previewed documents)) | 1,569 | 0 | 3 | form 3 |
| lh-austrian | page | 2,398 (upload state (previewed documents)) | 2,398 | 0 | 2,007 | column 8,906, heading 4,945, separator 2,307, text-size 1,890, text-width 1,845, indent 357, video 100, caption 10 |
| lh-austrian | live | 2,398 (upload state (previewed documents)) | 2,397 | 1 | 2,006 | column 8,904, heading 4,944, separator 2,307, text-size 1,890, text-width 1,845, indent 357, video 100, caption 10 |
| lh-b2b | page | 733 (upload state (previewed documents)) | 733 | 0 | 679 | text-width 1,961, column 1,909, heading 883, separator 819, video 159, indent 29, text-size 27 |
| lh-b2b | live | 733 (upload state (previewed documents)) | 733 | 0 | 679 | text-width 1,961, column 1,909, heading 883, separator 819, video 159, indent 29, text-size 27 |
| lh-brussels | page | 1,801 (upload state (previewed documents)) | 1,801 | 0 | 1,216 | separator 2,154, heading 1,927, text-width 1,147, column 890, text-size 344, video 178, form 139, caption 115, indent 9 |
| lh-brussels | live | 1,801 (upload state (previewed documents)) | 1,801 | 0 | 1,216 | separator 2,154, heading 1,927, text-width 1,147, column 890, text-size 344, video 178, form 139, caption 115, indent 9 |
| lh-cargo | page | 990 (upload state (previewed documents)) | 990 | 0 | 22 | video 60 |
| lh-cargo | live | 990 (upload state (previewed documents)) | 990 | 0 | 22 | video 60 |
| lh-com | page | 7,587 (sitemap) | 7,587 | 0 | 6,752 | heading 12,329, separator 11,472, column 10,038, text-width 8,245, caption 6,249, video 2,044, text-size 1,464, parallax-narrow 292, indent 90, form 30, cell 8 |
| lh-com | live | 7,587 (sitemap) | 7,587 | 0 | 6,752 | heading 12,329, separator 11,472, column 10,038, text-width 8,245, caption 6,249, video 2,044, text-size 1,464, parallax-narrow 292, indent 90, form 30, cell 8 |
| lh-discover | page | 563 (upload state (previewed documents)) | 563 | 0 | 470 | column 1,677, heading 1,634, separator 518, text-width 451, text-size 40, video 24, form 6 |
| lh-discover | live | 563 (upload state (previewed documents)) | 563 | 0 | 470 | column 1,677, heading 1,634, separator 518, text-width 451, text-size 40, video 24, form 6 |
| lh-ita | page | 2,563 (upload state (previewed documents)) | 2,563 | 0 | 2,141 | text-width 14,466, heading 3,494, separator 1,466, column 590, indent 138, text-size 86, video 20, form 2 |
| lh-ita | live | 2,563 (upload state (previewed documents)) | 2,563 | 0 | 2,141 | text-width 14,466, heading 3,494, separator 1,466, column 590, indent 138, text-size 86, video 20, form 2 |
| lh-swiss | page | 5,125 (upload state (previewed documents)) | 5,125 | 0 | 2,625 | heading 7,797, separator 4,982, text-width 4,446, column 1,048, text-size 720, video 615, caption 25, form 24, indent 12 |
| lh-swiss | live | 5,125 (upload state (previewed documents)) | 5,124 | 1 | 2,624 | heading 7,797, separator 4,982, text-width 4,445, column 1,048, text-size 720, video 615, caption 25, form 24, indent 12 |
| lh-tap | page | 1,228 (upload state (previewed documents)) | 1,228 | 0 | 156 | blank 447 |
| lh-tap | live | 1,228 (upload state (previewed documents)) | 1,228 | 0 | 156 | blank 447 |
| lh-com nav documents and app screens | page, live | 326 (the upload state's previewed /…/nav and /content/mobile/…) | 326 | 0 | 74 | app spacer 291, app small 218, app divider 2 (no nav-role marker is left: the Nav Tools tables carry them) |

Every site is counted (2026-11-09). Preview and live are equal everywhere, except one page each that live lacks
(Austrian, SWISS). No
brand has had its pass yet, so every family a reader reads is still far from 0. Two things follow for the passes:

- DA holds more documents with markers than the workspaces' paths files: ITA 2,141 against 2,083, Discover 470
  against 24, B2B 679 against 644, Brussels 1,216 against 1,070, Austrian 2,007 against 1,893. Each pass takes DA's
  own list (harness-pass-ita.md, section 2).
- The smaller sites have markers too: TAP 156 pages with `{blank}` (447; TAP's importer collapses only new
  imports), Cargo 22 pages with video settings (60), Air Dolomiti 3 with `{selected}`. Each needs its pass as well.
- lufthansa.com's sitemaps leave out its nav documents and app screens, so those were counted from its upload state.