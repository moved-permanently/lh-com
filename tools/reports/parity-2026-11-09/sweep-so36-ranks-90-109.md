# Brand sweep, ranks 90 to 109 (ema-lufthansa, standing order 36, 2026-11-16)

## How the ranks were taken

sweep-so30-brands.md ranked the 89 page-widths that order 27's sweep had outside 2 %. Ranks 90 onwards continue with the other 409 page-widths of SWISS, Brussels, Discover and Group for Business, ranked by their distance from www as served:
- order 35's re-capture (regress-so35-brands.md);
- for the two SWISS homepages, the figures against swiss-parity-010 (item 1 of this order).

Ranks 91 to 109 were captured again at ~19:42 UTC with main as deployed (capture.js, airline hosts refused per request), and each gave its order-35 figure (economy 1440 one pixel less). Rank 90 is the ch/de homepage at 390, captured at ~19:05 UTC against swiss-parity-010.

They were located by lining up www's recorded marks with ours:
- www: the headings, body text, links and footer in the recording's measurements;
- ours: capture.js's content boxes, and the footer top from a load on the brand host.

All twenty are within 2 % except rank 90 (-2.00 %).

## Result

- **One delta row, READY:** delta-so36-b2b-special-assistance-forms-heading.txt, ranks 91 and 92. The grey band's "Forms" heading becomes heading-small, as www's. 390 goes +1.99 -> +1.51 % on both documents. 1440 is not recorded; the render with and without the row differs by -6 px, the heading only.
- **One rule, drafted and HOLD:** B2B below 768 px, no top margin for a heading that opens a column view right after a sidebar Columns Media (ranks 100 and 106).
  - The recorded route-network pages are closer: en 390 5849 -> 5817 (+1.92 -> +1.36 %), de 390 6025 -> 5993 (+1.86 -> +1.32 %).
  - The rule would go live on push, so it needs the no-breakage render of every served document it reaches. The sitemap lists 56,216 served Group for Business documents (612 language-paths across the markets), and the market copies are not all the same (special-assistance differs in ae, ch, us). That census did not fit this order, so the rule is not in the theme.
  - The draft is in .scratch (b621/draft-b2b.css), with its gate figures above.
- **One hand-over:** rank 103's picture-first Columns Media rows to ema-test (rows-for-ema-test.md, item 16).
- **Every other rank:** located, no row or rule. Each is within 2 %, and either the steps cancel inside the page or the cause is spread over many places.

| # | brand | page | width | recording | www px | ours px | ours vs www | located | row / rule |
|---|---|---|---|---|---|---|---|---|---|
| 90 | SWISS | /ch/de/homepage | 390 | swiss-parity-010 (first load) | 5189 | 5085 | -2.00 % | -21 px before "Winterangebote" (our German hero card 40 px shorter than the English one, www's alike), -29 in the fare teaser, -147 in the "Aktuelle Themen" cards and the destination finder, +93 from "Suchen Sie mehr" to the end. The same spread is in the English page (-0.93 %). | none: no single cause (finish-swiss.txt HOLD) |
| 91 | Group for Business | /de/en/program/experts/special-assistance-and-services | 390 | b2b-parity-005 | 1458 | 1487 | +1.99 % | The grey band's "Forms" heading: www heading-small (28 px), ours heading-medium (32 px). +23 px above it (the band's 48 px start and 20 px padding), +4 in it, +2 under it; the rest of the page as www's. | READY row: +1.51 % |
| 92 | Group for Business | /xx/en/program/experts/special-assistance-and-services | 390 | b2b-parity-005 | 1458 | 1487 | +1.99 % | as rank 91 | READY row: +1.51 % |
| 93 | Group for Business | /de/de/news/celebrating-shared-stories | 1440 | b2b-parity-001 | 7754 | 7600 | -1.99 % | +40 above the first heading. -168 px at "Auf das nächste Jahrhundert Luftfahrt" (the promo stage after the teaser grids), +80 after it, -8 at "Ein Jahrhundert ikonischer Ziele" and -127 from there to the end of main; -154 at the end. | none: the steps cancel |
| 94 | Group for Business | /de/en/news/celebrating-shared-stories/sap | 390 | b2b-parity-007 | 8819 | 8992 | +1.96 % | +168 px inside the interview text, between its first heading and "Just two more things": the long text runs to more lines on ours at 390. +5 from there to the end. | none: text wrapping over the whole interview |
| 95 | Group for Business | /de/en/program/experts/on-board/meals-on-board | 1440 | b2b-parity-010 | 2910 | 2853 | -1.96 % | -30 px above the first airline heading, then +6 at each of the five airline sections, -53 to the footer. The 390 width is rank 20 of sweep-so30 (HOLD). | none |
| 96 | Brussels | /ao/fr/legal-notices/aviation-services-law | 390 | brussels-parity-007 | 4771 | 4678 | -1.95 % | -44 px before "Denied boarding": the opening bullet list between the intro and the first heading. Then even (+1, 0). The footer stands 69 px higher than www's (3,848 against 3,917), so -26 px between the last heading and the footer; the footer itself is 23 px shorter. | none |
| 97 | Group for Business | /de/en/news/celebrating-shared-stories | 390 | b2b-parity-001 | 12438 | 12196 | -1.95 % | The interview slider at 390: www 1,315 px from "We are the journey" to "Loyalty pays off", ours 982 (-333). The teaser grids and promo stage below make up most of it (+265, -363, +374). -50, then -117 to the footer. | none: the steps cancel |
| 98 | Brussels | /be/en/articles/your-summer-in-athens-starts-here | 1440 | brussels-parity-010 | 7994 | 8149 | +1.94 % | -78 px above the intro heading, then +16 to +56 at each of the seven city sections: each photo carousel takes about 17 px more than www's between its text and the next heading (e.g. section 1: 621 against 604). +155 to the footer. | none: a carousel rule needs a census of every Brussels article; 390 is +0.97 % |
| 99 | Group for Business | /de/de/news/celebrating-shared-stories | 390 | b2b-parity-001 | 12092 | 11858 | -1.94 % | as rank 97 in German: -60 at the first teaser, -363 / +360 around the promo stage, -50, -139 to the footer | none: the steps cancel |
| 100 | Group for Business | /de/en/travel-management/route-network | 390 | b2b-parity-001 | 5739 | 5849 | +1.92 % | +52 px before "Enjoy the benefits of our global route network". www starts the column view 20 px under the sidebar and the heading at its padding; ours keeps the column mark's 20 px and the heading's 32 px top margin, under a sidebar 20 px taller than www's. Then even (+8, +4). | rule drafted, HOLD (census) |
| 101 | Brussels | /de/de/extra-services/lounges | 390 | brussels-parity-006 | 2401 | 2447 | +1.92 % | The footer stands 69 px lower than www's (1,616 against 1,547), all in the page's one Columns Media section (no headings under the title to place it further). The footer itself is 23 px shorter. 1440 is +0.22 %. | none |
| 102 | Group for Business | /de/en/news/lhg-ita-airways | 390 | b2b-parity-003 | 6073 | 6188 | +1.89 % | Title as www's. +52 px between the title and the first heading (the intro, the grey benefit card band and two 61 px spacers), then steps of +/-25 px in the route accordions and sections; +115 at the end. | none: spread |
| 103 | Group for Business | /de/en/about-us/contact | 390 | b2b-parity-001 | 3832 | 3904 | +1.88 % | Two picture-first Columns Media rows: www stacks the picture above the heading, ours draws the heading first (-218 / +197 and -228 / +277). Then +28 to +32 at each heading. | hand-over: rows-for-ema-test.md item 16 |
| 104 | Brussels | /be/en/legal-notices/dsar-start | 1440 | brussels-parity-004 | 2983 | 2927 | -1.88 % | -56 px in main, before the footer: one Columns Media section (the request form's text), no headings to place it further. The footer is as www's. | none |
| 105 | SWISS | /ch/de/fly/on-board | 1440 | swiss-parity-001 | 1448 | 1421 | -1.86 % | Title as www's (193 against 194). The footer stands 2 px lower than www's (824 against 826), so the page's -27 px is the footer: ours 597 px tall, www 622. The English page and 390 are within 1 %. | none: the footer's height in German |
| 106 | Group for Business | /de/de/travel-management/route-network | 390 | b2b-parity-001 | 5915 | 6025 | +1.86 % | as rank 100 in German | rule drafted, HOLD (census) |
| 107 | Brussels | /be/en/travel-classes/economy | 1440 | brussels-parity-003 | 3186 | 3126 | -1.88 % | -6 above the first heading, -15 before "Related topics", -38 in the closing grey teaser band to the footer (footer top 2,648 against 2,707) (its 390 ending is rows-for-ema-test.md item 14) | none |
| 108 | Brussels | /be/en/my-bookings | 1440 | brussels-parity-001 | 1467 | 1494 | +1.84 % | Title as www's (226, ours 222). The footer stands 28 px lower than www's (1,016 against 988): all between the title and the footer, in the sidebar and the two card rows (www records no mark there to place it further). The footer is as www's (478 against 479). | none |
| 109 | Brussels | /be/nl/contact/service-charges | 390 | brussels-parity-006 | 2177 | 2137 | -1.84 % | Title and first sections as www's. -8 at "Optionele betalingskosten", -5 in the card-cost table, -24 more before the footer (footer top 1,307 against 1,342). The footer is 4 px shorter. | none |

Notes:
- **Figures and loads:** all heights are capture.js's as served. The footer tops come from one load per page on the brand host (host-eval, served CSS, airline hosts refused per request: 10 loads, 4 refused).
- **dsar-start's footer:** in that load dsar-start drew 2,998 px (its request form), so its footer top is not used above.
- **Rank 107:** -1.85 % in order 35's capture (3127), -1.88 % in today's (3126); the table gives today's figure.
