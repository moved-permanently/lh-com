# Standing order 69, item 3: where the nine SWISS aside pages lose height (2026-11-18)

The nine pages of order 68 item 3 (ch/en animals-travelling, health-and-travel, upgrade-options, swiss-premium-economy,
swiss-recraft-collection, miles-and-more, mobile-apps; ch/de additional-bag, swiss-business), today (with this order's
81 px aside, 9f86e8d2), against www's recordings (swiss-parity-002a, -002b).

**Method.** Our page: so67/hostv2.mjs, the served copy, this checkout's code; every heading's text top (so69/heads.js).
www: the recording's measurement file (h1, h2, h3, accordion headlines, footer). Matched by heading text. Regions:

- top: page top to the H1
- intro: the H1 to the first main-column heading after it
- body: that heading to the last main-column heading both pages have
- end: that heading to the footer (the rest of the column and the aside)
- footer: footer top to page end

Negative = ours shorter than www.

| Page | Width | www | Ours | Top | Intro | Body | End | Footer | Total |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ch/de additional-bag | 1440 | 2,387 | 2,324 | +8 | -32 | -61 | +23 | -1 | -63 |
| ch/de additional-bag | 390 | 2,816 | 2,771 | +10 | -27 | -76 | +29 | +19 | -45 |
| ch/de swiss-business | 1440 | 4,655 | 4,748 | +9 | +19 | +10 | +56 | -1 | +93 |
| ch/de swiss-business | 390 | 6,821 | 6,722 | +10 | -21 | -29 | -78 | +19 | -99 |
| ch/en swiss-premium-economy | 1440 | 4,120 | 4,044 | +9 | -106 | -6 | +24 | +3 | -76 |
| ch/en swiss-premium-economy | 390 | 7,682 | 7,455 | +10 | -140 | -26 | -90 | +19 | -227 |
| ch/en miles-and-more | 1440 | 3,427 | 3,543 | +8 | -72 | -34 | +212 | +2 | +116 |
| ch/en miles-and-more | 390 | 5,194 | 5,076 | +10 | -84 | -36 | -27 | +19 | -118 |
| ch/en upgrade-options | 1440 | 2,888 | 2,822 | +9 | -72 | +51 | -57 | +3 | -66 |
| ch/en upgrade-options | 390 | 3,904 | 3,764 | +10 | -114 | +18 | -73 | +19 | -140 |
| ch/en swiss-recraft-collection | 1440 | 4,053 | 4,106 | +9 | -40 | +55 | +26 | +3 | +53 |
| ch/en swiss-recraft-collection | 390 | 5,441 | 5,341 | +10 | -89 | -59 | +19 | +19 | -100 |
| ch/en mobile-apps | 1440 | 2,152 | 2,086 | +8 | -64 | +1 | -13 | +2 | -66 |
| ch/en mobile-apps | 390 | 2,643 | 2,546 | +10 | -76 | +0 | -50 | +19 | -97 |
| ch/en animals-travelling | 1440 | 5,121 | 5,016 | +8 | +11 | +136 | -263 | +3 | -105 |
| ch/en animals-travelling | 390 | 7,771 | 7,581 | +10 | -29 | +261 | -451 | +19 | -190 |
| ch/en health-and-travel | 1440 | 3,150 | 2,946 | +8 | -32 | -98 | -84 | +2 | -204 |
| ch/en health-and-travel | 390 | 4,873 | 4,773 | +10 | -44 | +141 | -226 | +19 | -100 |

animals-travelling's and health-and-travel's body / end split is unreliable: www's accordion headlines come in a different
order there. Their totals hold.

## Where the height goes

**1. The intro is the biggest loss, on every page** (-21 to -140 px; only swiss-business 1440 and animals 1440 are not short there).

- **The lead paragraph.** www sets the paragraph under the H1 as `p.copytext-large`: 18 / 30 px, weight 300, letter
  spacing 0.2 px. It does so on 22 recorded pages (44 page-widths). Ours draws it as body text: 16 / 22 px, 0.6 px.
  - On phones that is 5 lines of 22 against 5 of 30: -40 px.
  - From 768 px: -16 px.
  - The token-free collapse counts a SWISS `{copytext-large}` as body text: marker-collapse.mjs has no TEXT_PX entry for
    it, and BODY_PX swiss is 16, within 2 px.
- **Under the lead.** www's next heading is 64 px below the lead from 768 px and 44 px on phones, ours 48 at both widths.
  Where www's sidebar opens with a column view (mobile-apps, upgrade-options, miles-and-more, unaccompanied-minors,
  special-meals) it is 96 / 76 px: the view's 32 px padding.
  - Our heading's 48 px margin collapses with the paragraph's, so a lead margin cannot give 44 on phones.
  - The column view has no trace in our documents.
- **Above the lead on phones:** www 40 px under the H1, ours 32.
- **swiss-premium-economy** has another 42 px between its H1 and the lead in www (82 px there).

**2. Every SWISS page's top and footer.**

- Ours puts the H1 8 to 10 px lower than www's.
- Our footer is 19 px taller on phones. Its two legal lines are 24 px apart where www's are 15 (14 / 15 px text), and the
  last row is 28 px high where www's is 16 (mobile-apps 390, pixel rows of both footers).
- These offsets are on every page. Taking them out shortens every SWISS page.

**3. Page by page in the body and the aside** (smaller, and not one cause):

- additional-bag: the teaser cards 10 to 20 px shorter each, and the Quicklinks 33 px.
- mobile-apps 390: the aside's picture 117 px under the column's last link in www, ours 82; its card 62 px above the
  footer in www, ours 49.
- upgrade-options 390: the last teaser to the footer, -69 px.

## The lead rule: HOLD (fails the gate)

**The rule (not in git; so69/hold-lead):**

- THEMES.swiss rules: the H1's paragraph, when it ends its section's text, is the lead. It gets copytext-large, as
  Austrian's intro-after-h1 does.
- swiss.css: `h1 + p.copytext-large` at 18 / 30 px, weight 300, letter spacing 0.2 px.
- The text pages' first paragraph is not reached: a paragraph, a heading or a block follows it. Those pages are pax-receipt,
  green-fare, privacy-statement, accessibility-statement, imprint and faq.
- Four lead pages are not reached either: group-travel-and-charter, swiss-airrail, rebook, arrival-departure.

**Simulated in-page on all recorded SWISS page-widths** (the class added, then the CSS, in the same load):

- 34 page-widths move, and the sum of their |% off www| drops from 70.33 to 57.33.
- On the other 138 page-widths the class goes on no paragraph. Three of them moved in the same load without it: two
  homepages still filling, and online-check-in 390's form (-24 px).
- **4 fail** the half-point gate. They are pages already longer than www elsewhere:

| Page | Width | www | Today | With the lead | Points |
| --- | --- | --- | --- | --- | --- |
| ch/de duty-free-shop | 390 | 1,173 | 1,182 (+0.77 %) | 1,202 (+2.47 %) | +1.71 FAIL |
| ch/de unaccompanied-minors | 390 | 4,483 | 4,519 (+0.80 %) | 4,559 (+1.70 %) | +0.89 FAIL |
| ch/en miles-and-more | 1440 | 3,427 | 3,543 (+3.38 %) | 3,567 (+4.09 %) | +0.70 FAIL |
| ch/en swiss-recraft-collection | 1440 | 4,053 | 4,106 (+1.31 %) | 4,130 (+1.90 %) | +0.59 FAIL |

**The nine pages with the lead:**

| Page | www 1440 / 390 | Today | With the lead |
| --- | --- | --- | --- |
| additional-bag | 2,387 / 2,816 | 2,324 / 2,771 | 2,340 / 2,795 |
| swiss-business | 4,655 / 6,821 | 4,748 / 6,722 | 4,764 / 6,762 |
| swiss-premium-economy | 4,120 / 7,682 | 4,044 / 7,455 | 4,060 / 7,517 |
| miles-and-more | 3,427 / 5,194 | 3,543 / 5,076 | 3,567 (FAIL) / 5,124 |
| upgrade-options | 2,888 / 3,904 | 2,822 / 3,764 | 2,846 / 3,842 |
| swiss-recraft-collection | 4,053 / 5,441 | 4,106 / 5,341 | 4,130 (FAIL) / 5,427 |
| mobile-apps | 2,152 / 2,643 | 2,086 / 2,546 | 2,102 / 2,586 |
| animals-travelling | 5,121 / 7,771 | 5,016 / 7,581 | 5,040 / 7,629 |
| health-and-travel | 3,150 / 4,873 | 2,946 / 4,773 | 2,962 / 4,813 |

**Other variants:**

- The class on every H1 + paragraph: 54 move, 10 fail. The six text pages and group-travel, rebook and airrail are among them.
- With a bottom margin on the lead (16 px, 36 from 768): duty-free 1440 fails too.
- With the footer fix (-19 px on phones) and the top (-10 / -9) in the same package, more page-widths fail (17 / 27): the
  pages short of www and without a lead get shorter.

**Held for your word:** the lead is www's on 22 recorded pages. It fails only on pages that are already too long elsewhere
(the shrinking-rule arithmetic the other way round). Ship it on a base like item 1's, or after those four pages are fixed.

## The two places where www's gap is larger

- **SWISS fleet hub intro (390): HOLD.**
  - www's cards start 102 px under the intro, ours 81. The extra 21 px take ch/en fleet 390 from 2,051 to 2,072 (www
    2,040: +0.54 to +1.57 %, +1.03 points, FAIL).
  - The page is long only by its footer (+19). Its content is 8 px short: our intro is 40 px shorter (no lead) and our
    card pictures about 45 px taller than www's.
- **Group for Business celebrating-shared-stories: de/en READY** (delta-so69-b2b-celebrating-space-below-l). The card
  section before "Anniversary of an icon" goes from Style space-below-m to space-below-l.
  - The gap is 133 -> 193 px at 1440 (www 219) and 113 -> 173 at 390 (www 179).
  - 1440: 8,216 -> 8,276 (www 8,265, -0.59 -> +0.13 %). 390: 12,345 -> 12,405 (www 12,438, -0.75 -> -0.27 %).
  - de/de is HOLD: its card section has no space below to enlarge, and its 1440 page is already 23 px longer than www's.
