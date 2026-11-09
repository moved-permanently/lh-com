# lufthansa.com hub and campaign pages: the next worst (brief 521 item 1)

ema-adobe, 2026-11-09. The 37 recorded hub and campaign pages (lh-parity-002a-d) captured again on
lufthansa.turnsthe.page (published pages, deployed code, logs/b521/sweep-shard.sh and logs/b521/qp-all.sh), against
their recordings at 1440 and 390 (tools/parity/compare.js, the first 8,000 px). No request to www; nothing uploaded or
published. Scratch: logs/b521 (not in git).

## The ten pages

Left out: the causes outside my files the brief names (overview-manage, the parallax of picture-perfect-austin, the
stopover pages' map, culinaryjourney, explore-flying's data), and four more with a known cause elsewhere: /de/en/flights
(the destination finder's live offers; its document is held), menu-on-board (the capture's text rendering, brief 515),
frankfurt-fair and most-significant-route (fixed in 142a2d2, waiting for their re-import), meetings-and-events at 390 (the
logo slider, ema-cashub's parser, brief 521).

| page | worst width | % |
| --- | --- | --- |
| /de/en/airport-information | 390 | 25.4 |
| /de/en/100-years | 390 | 20.1 |
| /de/en/discover-lufthansa/take-off | 1440 / 390 | 19.6 / 19.3 |
| /de/en/overview-special-request | 390 | 18.4 |
| /de/en/100-years/destinations | 1440 | 18.3 |
| /de/en/100-years/campaigns | 390 | 18.0 |
| /de/en/100-years/global-network | 390 | 17.5 |
| /de/en/100-years/cabin-design | 390 | 16.2 |
| /de/en/100-years/crane | 390 | 15.4 |
| /de/en/100-years/chronicle | 1440 | 15.0 |

## What the differences are

Measured three ways: the drift between the recording and our capture (logs/b460/offsets.mjs, named by our elements:
logs/b521/step-elements.mjs), the pictures' positions down each screenshot (logs/b521/pic-runs.cjs), and www's snapshot
rendered locally with www's CSS against ours (logs/b484/www-render2.mjs, gap by gap: logs/b521/gap-agg.mjs).

- **Most of the percentage is no layout cause.** The /100-years pages drift little (/100-years at 390: one step of
  24 px in 8,000) but score 15-20 %: moving images caught at another frame (the 100-years teaser shows a flag on www, a
  plane on ours), carousels on another slide, and text drawn by two text engines (the recordings are Chrome on macOS, ours
  Chromium on Linux: bold runs wrap differently, and every line after them moves). At 390 the card grids'
  card-to-card distances differ by plus or minus one text line (27 px, take-off, overview-special-request,
  overview-travel-information): wrapping, not spacing; at 1440 the grids match www within 2 px on the overview pages.
- **The local www render can't measure across a button.** Its link components (maui-button-link) render without their
  shadow DOM as a 10-13 px line instead of a 48 px button, so every gap that passes a button comes out about 32-38 px off
  (a "-31 px after a text cell" on destinations, chronicle, cabin-design was this, not ours). Only the recordings decide
  those.
- **Shared causes the recordings confirm**, biggest first:

### 1. The stage sections www pads after an unpadded AEM section (lufthansa-sections.js: for ema-lufthansa)

www pads every stage AEM section (.section-padding-y-regular); lufthansa-sections.js gives a stage style padded only
when the AEM section before it is padded ("not for a stage", 467626c, the brief after 479). On destinations, Berlin's
stage follows a padded section and gets "stage, padded"; New York's and Cape Town's follow unpadded ones and get "stage"
only: 40 px less above and below them at 1440, 20 at 390 (New York: stage to text 31 px, www 70; Berlin 71 / 71).

The change (the padded-after-unpadded rule):

```js
-      if (!padded(before) && (!lufthansa || isStage(s) || isStage(before) || grey(before) || loneQuote(before))) return;
+      // a stage after an unpadded AEM section is padded on www too; not when the AEM section after it is padded
+      // (style before-padded holds that space already: economy-class's Allegris stage measured worse padded)
+      const next = aemSections[i + 1];
+      const stageBeforePadded = isStage(s) && !!next && padded(next) && !grey(next);
+      if (!padded(before) && (!lufthansa || stageBeforePadded || isStage(before) || grey(before) || loneQuote(before))) return;
```

Measured with style padded on those stage sections in the browser (logs/b521/draft-stage-*.js), score against the
recording: destinations 1440 18.3 -> 15.2 %, 390 14.5 -> 13.5 %; tips-senior-travellers 25.5 -> 25.3 % / 15.4 % and
first-class 20.4 / 27.7 % unchanged (their stage lies beyond the recordings' 8,000 px). Left out by the condition: the
stages followed by a padded AEM section (style before-padded): economy-class's Allegris stage (padded: 23.2 -> 30.3 % at
1440, 34.1 -> 36.2 % at 390) and new-onboard-experience's "Exactly what you want". Documents the change reaches (of the
3,397 lufthansa.com snapshots, logs/b521/stage-padded3.mjs): 100-years/destinations and tips-senior-travellers on seven
roots each, first-class on two (16); a test: a padded stage after an unpadded AEM section on a lufthansa.com page gets
"stage, padded", with a padded AEM section after it "stage, before-padded" as today.

### 2. A page that ends with separators only after a grey band (fixed: e224886, lufthansa.com styles)

/de/en/airport-information on four roots, the flights pages on three (held documents) and the info page
doctor-on-board-news end with "{spacer-N}" alone in a section after a grey band. On www that separator is all there is
before the footer (71 px at 1440 and at 390); ours added two section gaps (151 px). With the rule: 71 px at both widths
(www's); airport-information 1440 7.8 -> 5.8 %, 390 25.4 % unchanged (the page's intro wrapping), page height 3,290 -> 3,210
(www 3,232); doctor-on-board-news 1440 14.0 -> 8.4 %, 390 9.4 -> 12.6 % (its gap is www's; text higher up is 51 px
shorter than www's, which the 80 px had covered).

### 3. Nothing a third time

No other step repeats on two or more of the ten pages once the artefacts above are taken out: take-off's card rows at
1440 are 16-17 px taller than www's (82 px between rows, www 66), but take-off's cards are www column views, the overview
pages' grids (www teaser cards) match at 82; a limited-width heading in a column view (destinations' Rio, 3 lines on www,
2 here) is one heading per page and dropped by Ben's rule; the 41 px before a section heading after a full-width picture
(destinations' Vancouver, London, Beijing) lies beyond the recording's 8,000 px, so no recording settles it.

## Left

- The stage change: ema-lufthansa's (lufthansa-sections.js), the exact change above.
- airport-information at 390 (25.4 %): its intro wraps to five lines on www, four here, and everything below moves 27 px.
- The /100-years pages: their percentages are moving images, carousels and text rendering; a recording taken on the
  same machine as ours (Linux Chromium) would separate those from layout.
