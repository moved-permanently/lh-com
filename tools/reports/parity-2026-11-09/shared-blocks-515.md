# Two worst rows in shared blocks (brief 515 item 3)

ema-adobe, 2026-11-09. The two rows of the brief 507 baseline ([sweep-lh-baseline.md](sweep-lh-baseline.md)) whose
cause sat outside my templates, measured on lufthansa.turnsthe.page (deployed code) against lh-parity-002a. No request
to www; nothing uploaded or published; no file of another EMA's changed. Scratch: logs/b515 (not in git).

## 1. meetings-and-events at 390: the partner logos (Columns Media; for ema-cashub)

**www:** the four partner logos (Austrian, Brussels Airlines, Lufthansa, SWISS) are a four-column view with carousel
behaviour (`.fourcolumn .column-view > .carousel`: the `.hidden-md-down` grid from 1025 px, a `.hidden-lg-up` swiper
below), each item one image and nothing else. At 390 www shows one logo at a time with four dots under it.

**Ours:** `columns-media` without an option: the four logos stacked, 368 px. The page at 390: 14.5 % against the
recording, 4,033 px high (www 3,869).

**Cause:** `tools/importer/parsers/columns-media.js` gives `cell-slider` (Columns Media's existing option: below
1025 px the cells of a row are slides with dots) only to a carousel view whose items mix pictures and text (the
onboard-delights Dallmayr band). A carousel view of image-only items gets no option.

**The exact change** (the parser, after the `textItem` line; ema-cashub's parser, so not changed here):

```js
    const textItem = (it) => !!it.querySelector('.headline, .text');
-    if (!sliderView && view.querySelector(':scope > .carousel') && items.length > 1
-      && items.some(textItem) && items.some((it) => !textItem(it) && it.querySelector('.image img'))) {
+    const imageItem = (it) => !textItem(it) && !!it.querySelector('.image img');
+    // and a row of logos with carousel behaviour (meetings-and-events' partner airlines): three or
+    // more image-only items (not the app teaser's photo + QR code pair, option slider)
+    if (!sliderView && view.querySelector(':scope > .carousel') && items.length > 1
+      && ((items.some(textItem) && items.some(imageItem)) || (items.length > 2 && items.every(imageItem)))) {
       variants.push('cell-slider');
     }
```

Then the bundles that carry the parser rebuilt (the hub bundle imports meetings-and-events).

**Measured** (the published document with `columns-media cell-slider` on that block, rendered as the page on
lufthansa.turnsthe.page): 390 14.5 % -> 7.6 %, the page 4,033 -> 3,846 px (www 3,869); 1440 9.0 % unchanged (the
option changes nothing from 1025 px).

**Which pages:** of the 3,397 lufthansa.com snapshots in tools/importer/bd-snapshots, 106 carousel column views; image-
only ones with three or more items are meetings-and-events' logos only, on 7 roots; the other image-only carousel views
are online-check-in's photo + QR code pairs (two items, option slider, unchanged by the condition). Documents after the
change, in release order: [reimport-515-meetings-logos-lh-com.txt](reimport-515-meetings-logos-lh-com.txt) (7).

A test for it: a four-column view with `:scope > .carousel` and four image-only items gives `columns-media
(cell-slider)`; two image-only items (photo + QR code) give what they give today.

## 2. menu-on-board at 390 (19.8 %): the capture's text rendering, no block

**Measured:** the page is 11,897 px high at 390, www 11,924: the 19.8 % is not spacing. Paragraphs of plain text break
alike on both; bold runs ("a salad of cured ham with Belgian endive and radicchio, roast saddle ...") are narrower in
our capture, so their lines and every line after them shift. The recording is Chrome 156 on macOS (lh-parity-002a's
README), ours Chromium on Linux: the same font files (LufthansaText's woff and woff2 of mausy-v1.40.1 and v1.38.0
measure the same text alike to 0.1 px), drawn by two text engines. No block or rule of anyone's to change; the row
stays as the capture's.

**Found on the way, not the row's cause:** www's text has 21 no-break spaces on this page (before each " – ", "Boeing
707", "Ju 90", "G 38"); our documents have none. The import framework's html2md / md2da (helix-importer.js, the bulk
import's path) turns U+00A0 into a plain space; U+202F (narrow no-break space) and U+2060 (word joiner) survive it
(logs/b515/nbsp-roundtrip.mjs). Put back in the browser, the 30 joins on menu-on-board change neither its height nor its
score (19.8 -> 19.9 % at 390, 9.7 % at 1440): our lines break elsewhere for the reason above. On other pages a lost
no-break space can move a dash or a number to the next line. The fix would sit in the import framework or in every
template's transformer chain (all EMAs' importers): a decision for the user, not taken here.
