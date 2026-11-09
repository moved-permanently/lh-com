# No-break spaces through the import: a proposal (ema-cashub, the brief after 521 item 4)

Not applied: Ben decides after reading it. Ben's rule was "not now unless the ranking points at it". It does: 16 lines on
10 of the 165 recorded Austrian and Brussels pages, about half the gap on Brussels' families-and-children
(`sweep-austrian-brussels-cashub.md`, item 4).

## What turns www's no-break spaces into plain ones

The bulk importer (`excat-content-import/scripts/run-bulk-import.js`, lines 699–712) runs our template's `onLoad`, then
`WebImporter.html2md`, then `WebImporter.md2da`. `WebImporter` is the plugin's
`static/inject/helix-importer.js`: a one-line minified build of `@adobe/helix-importer` 3.4.147, whose source sits beside
it in `scripts/node_modules/@adobe/helix-importer/src`. Three of its steps act on no-break spaces.

| Step | Source (helix-importer 3.4.147) | In the injected build | What it does |
| --- | --- | --- | --- |
| `DOMUtils.reviewParagraphs` | `src/utils/DOMUtils.js` 101–117, called from `PageImporter.preProcess` (`src/importer/PageImporter.js` 216) | char 1,945,540 | Removes every `<p>` whose text is `''`, `' '`, `'&nbsp;'` or a lone U+00A0: **www's empty lines (`<p>&nbsp;</p>`) are lost**. In the paragraphs that stay, `innerHTML.replace(/&nbsp;/gm, ' ')`. |
| `DOMUtils.reviewInlineElement` | `src/utils/DOMUtils.js` 22–31, from `preProcess` (`PageImporter.js` 217–232, for b, a, em, strong, sup …) | char 1,944,310 | The same `&nbsp;` → `' '` inside inline elements. |
| `MDUtils.cleanupMarkdown` | `src/utils/MDUtils.js` 35, from `PageImporter.postProcessMD` (`PageImporter.js` 281–283) | char 1,949,683 | `md.replace(/\u00A0/gm, ' ')`: **every no-break space left in the markdown becomes a plain space** (headings and attributes included). For example, "6&nbsp;773&nbsp;km" in new-destinations is "6 773 km" in ours. |

`PageImporter.import` runs `preProcess` before our `transform` (`PageImporter.js` 335), so our parsers and transformers
never see the no-break spaces in paragraphs. The plugin is not ours and is read-only here, so the change has to be on our
side, before and after the framework.

## The change (proposed, not applied)

1. **Guard: a transformer `tools/importer/transformers/nbsp-guard.js`, hook `onLoad`.**
   - It runs before `html2md`, so before `preProcess`. In the main content's text nodes it replaces U+00A0 with a
     private-use stand-in, U+E0A0. Attributes are left alone (alt and title are text on www too, but the framework's
     image handling rewrites them anyway).
   - A paragraph holding only the stand-in is no longer "empty" to `reviewParagraphs`. Neither `&nbsp;` replace matches
     it, and `cleanupMarkdown` only replaces U+0000–U+0013 and U+00A0.
   - Exact change: one new file, plus one entry in the transformer list of the 14 import scripts that call
     `executeTransformers('onLoad', …)`: app-entry, austrian-checkin, austrian-flight-status, austrian-hero-banner,
     campaign, fleet, flight-status, form, homepage, hub, info, insights, legal, mfe. import-magazine and import-nav have
     no onLoad and are left out.
2. **Restore: `tools/importer/nbsp-restore.mjs`.**
   - It turns U+E0A0 back into U+00A0 in a written `.plain.html`. It is idempotent, and a document without the stand-in
     comes back byte for byte.
   - Each brand importer calls it right before `collapseDocs` (twelve: airdolomiti, austrian, b2b, brussels, cargo,
     discover, ita, sdui, swiss, swiss-magazine, swiss-market, swiss-sub). The owners of airdolomiti, b2b, cargo,
     discover and the swiss importers are ema-lufthansa and others: the call is one line each, for them to add.
   - lufthansa.com's own runs (the bulk importer straight into content/) get it as a CLI over the written list.
   - da-upload's `readDocument` runs it too, as a safety net, so no stand-in can reach DA.
3. **Rebuild:**
   - Bundles: the 14 with onLoad (all of them except magazine and nav).
   - Documents: a re-import of the documents whose snapshot holds a no-break space. Most do, because "6&nbsp;773&nbsp;km"
     and prices are common, but only the empty lines change the layout.
   - Snapshots on disk with a paragraph holding only `&nbsp;`: lufthansa.com 46 of 883, SWISS 266 of 2,812, Brussels 1
     of 17. That count includes header and footer copies, so it is an upper bound.

An alternative for the empty lines alone: turn `<p>&nbsp;</p>` into a spacer marker in the guard. It is smaller, but
markers are ema-test's (style-markers.js, marker-collapse.mjs), so I don't propose it here.

## What it does to our text checks

They see a changed character (U+00A0 where today there is a space) but not a changed word:

- **Our side:**
  - market-diff's verdict strips `[\s\u00a0\u202f]` before comparing (`tools/market-diff/lib/verdict.mjs` 43).
  - The AEM-HTML normaliser and the markets sampler collapse `\s+`, and JavaScript's `\s` includes U+00A0
    (`tools/market-diff/lib/aem-html.mjs` 51, `tools/markets/compare-sample.mjs` 48 and 69).
  - So the counts stay the same.
- **The plugin's completeness check:** `content-similarity.js` `htmlToText` decodes `&nbsp;` and collapses `\s+`, and
  `tokenize` splits on `\s+`. Our "6 773 km" and www's "6&nbsp;773&nbsp;km" are three tokens either way.
  `normalizeText` collapses only `[ \t]+`, so a run of no-break spaces would stay as it is there. That changes no token
  and no score.
- **Checks that compare a heading's or line's exact string:** they would now match www where today they differ by that
  character (the market-diff replica check's text equality, any `===` on headings). The textdiff and word-loss checks
  named in the brief are not in this repository (the harness's); if they compare characters, they will see the change
  as a fix, not a loss.

## The test I would write (first)

`test/nbsp-guard-restore.test.mjs`:

1. The guard on a linkedom document: `<p>&nbsp;</p>` and "6&nbsp;773&nbsp;km" have U+E0A0, and an `alt` attribute is
   unchanged.
2. Through the framework's own steps, where the plugin's helix-importer is on disk (skipped otherwise, no network):
   - `DOMUtils.reviewParagraphs` keeps the guarded empty paragraph and drops an unguarded one;
   - `MDUtils.cleanupMarkdown` leaves U+E0A0.
3. `nbsp-restore`: U+E0A0 becomes U+00A0. It is idempotent, and a document without it comes back byte for byte.
4. A source check that each brand importer calls the restore before `collapseDocs`, and that da-upload's `readDocument`
   runs it.
5. Rendering: a restored `<p>&nbsp;</p>` gives an empty line (one body line plus the paragraph margin, about 40 to 48 px
   on www).

## The pages it helps (from the ranking)

| Brand | Page | Empty lines | About | The row today |
| --- | --- | --- | --- | --- |
| Brussels | /be/fr/special-care/families-and-children | 2 | 80 to 96 px | 1440 -9.9 % (-187 px): about half |
| Brussels | /be/en/special-care/families-and-children | 2 | 80 to 96 px | 1440 -8.3 % (-150 px): about half |
| Brussels | /be/fr/travel-classes/business | 3 | up to 120 to 144 px where shown | 1440 -0.3 %, 390 -0.8 % |
| Brussels | /be/en/flying-with-us/our-fleet | 2 | 80 to 96 px | 1440 -2.4 %, 390 +1.9 % |
| Brussels | /be/en/articles/the-gambia | 1 | 40 to 48 px | 1440 -4.2 % |
| Brussels | /be/en/plan-your-trip/travel-regulations | 1 | 40 to 48 px | 1440 -4.9 % |
| Austrian | /at/en/plan/special-requirements/travelling-with-animals | 2 | 80 to 96 px | 390 -4.8 % (-3.7 % after 684d242f) |
| Austrian | /at/en/accessible-travel | 1 | 40 to 48 px | 390 -4.2 % |
| Austrian | /at/de/gesundes-reisen | 1 | 40 to 48 px | 390 +1.0 % (it would go up) |
| Austrian | /at/en/book/additional-services/extra-services | 1 | 40 to 48 px | 390 -4.4 % |

On 8 of the 10 pages the empty lines narrow the gap. On gesundes-reisen 390 and our-fleet 390 we are already long, so it
widens there by about one line. Inside text the no-break spaces change no height. They only keep "6 773 km", prices and
dates on one line, as www does.
