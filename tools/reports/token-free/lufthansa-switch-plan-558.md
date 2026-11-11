# lufthansa.com's token-free switch: what is in its way, a measured plan (brief 558 item 5)

ema-adobe, 2026-11-10. Nothing was switched: main keeps `THEMES.lufthansa` without `live`; the branch
`token-free-lufthansa-live` (f2139516, the one line `live: true` and the rebuilt bundles; 202 commits behind main today)
is untouched. The harness's job for the pass is [harness-pass-lufthansa.md](harness-pass-lufthansa.md) (ema-test); this
page adds what the parity measurements say about the switch.

## 1. How it was measured

- **Documents.** 12 published lufthansa.com documents with recordings (the hub ranking's pages: baggage, food-and-beverages,
  digital-self-services, overview-travel-information, additional-services, services-at-the-airport,
  lufthansa-travel-classes, miles-and-more, special-needs, airport-information on gb/en; gepaeck on de/de;
  overview-special-request on gb/en), read from our host as `.plain.html` and collapsed with main's
  `tools/importer/marker-collapse-cli.mjs --brand lufthansa --force`: 10 changed, 76 markers (38 theme, 38 carriers),
  0 left, 0 not idempotent.
- **Code.** A local worktree of main with `live: true` (not pushed). Pages captured on lufthansa.turnsthe.page with
  that code (blocks, scripts, styles served from the worktree) and the collapsed document put in the page; today's
  numbers from the same capture without either. Measurement-only geo.css; against lh-parity-004a/b and -002a.
- **Control.** The four documents without markers (overview-travel-information, additional-services,
  services-at-the-airport, special-needs) measure the same before and after to the decimal: the method adds no error.

## 2. Results (390 / 1440, % off www)

| Page | Today | After the switch | Main cause of the change |
| --- | --- | --- | --- |
| /gb/en/baggage | 5.0 / 1.7 | 13.7 / 11.8 | 40 px separators drawn as M (60 px): +20 px each (B2) |
| /de/de/gepaeck | 6.6 / 3.4 | 13.3 / 6.5 | the same (B2) |
| /gb/en/food-and-beverages | 6.6 / 2.2 | 28.2 / 21.3 | B2, the section titles' H1 size (B3), space-below-m sections (B2) and more (B4) |
| /gb/en/lufthansa-travel-classes | 7.2 / 2.7 | 32.8 / 15.0 | the page title's `{heading-medium}` on an H1 dropped: H1 large, +61 px at the top (B3) |
| /gb/en/digital-self-services | 7.1 / 2.9 | 16.3 / 19.9 | the column view carrier (section style `column-view, padded` for `{column-start-outer}` / `{column-end-outer}`): +261 px at 390, +385 px at 1440 (B1) |
| /gb/en/miles-and-more | 12.6 / 9.1 (7.3 / 2.3 with e66d091) | 10.7 / 17.1 | the column view carrier and h3-large (B1) |
| /gb/en/airport-information | 7.8 / 5.3 | 16.4 / 3.8 | the cards' H2 `{heading-small}` dropped (B3); `{spacer-70}` as M (B2) |
| the 4 without markers | as today | as today | (control) |

Candidate theme rules simulated in the page (measurement only):

| Page | After the switch | + section H1s in heading-medium | + M at 40 px as well |
| --- | --- | --- | --- |
| baggage | 13.7 / 11.8 | 13.7 / 11.8 | **6.1 / 2.0** |
| gepaeck | 13.3 / 6.5 | 13.3 / 6.5 | **5.3** / 7.5 |
| food-and-beverages | 28.2 / 21.3 | 26.1 / 19.8 | 20.4 / 11.1 |
| digital-self-services | 16.3 / 19.9 | 16.3 / 19.9 | 15.3 / 19.5 |
| airport-information | 16.4 / 3.8 | 16.4 / 3.8 | 15.9 / 5.0 |

## 3. What is in the way (worst first)

- **B1. The column view carrier on hub pages.** The collapse turns `{column-start-outer}` / `{column-end-outer}` into
  the section style `column-view, padded`; on digital-self-services and miles-and-more that view draws 261 to 385 px
  taller than the marker pairs did. The marker-based layout carries this brief's and earlier parity rules
  (column marks, jump links before a separator, the divider after a campaign column view); the carrier sections
  have none of them yet. Check before the switch: every hub and campaign page with column marks (the hub's 68
  documents, campaign's 88) measured with the carrier at most 0.5 points worse than with the marks.
- **B2. M is 60 px.** www's 40 px separators (59 of 195 M-band separators on the 296 recorded pages, separators-40-506.md, the hub's
  `{spacer-40}` on baggage, food-and-beverages, speisen-und-getraenke, gepaeck) become 60. Ben's decision 3
  (decisions.md) keeps M at 60 with this cost. Measured now: baggage +8.7 / +10.1 points, gepaeck +6.7 / +3.1,
  food-and-beverages part of +21.6 / +19.1. With M at 40 on these pages, baggage and gepaeck come back to today's
  numbers or better. Not changed here: the decision is Ben's; the cost is written down for the switch.
- **B3. Heading sizes the collapse drops as near values.** An H1 in heading-medium (the page title of
  lufthansa-travel-classes, the section titles of food-and-beverages) and the cards' H2 in heading-small
  (airport-information) are one step from the theme's default and go: +61 px on travel-classes alone. The theme has
  no H1 choice (`headingChoices` has h2, h3, h4). Options in the theme's own order: a page-type default for hub
  pages (their H1 titles in heading-medium where www draws them so), or an H1 compact choice the collapse writes as
  a carrier. Count first: how many lufthansa.com documents carry `{heading-medium}` on an H1 (the census).
- **B4. food-and-beverages' remaining 14 / 9 points** after B2 and B3: space-below-m sections where the marker was
  a 40 px separator at a section's end, and the dropped `{spacer-25}` (decision 4). Needs a look per section
  after B1 to B3.
- **B5. The bundles are behind their sources.** A rebuild of every import bundle on main today changes each one
  (hub 11 lines: columns-media's in-column and lufthansagroup branches, style-markers' H4 large choice; the others
  5 lines each). The switch branch's bundles are older still. Rebuild all bundles on the merge commit, then run the
  collapse bundle test, before any lufthansa.com import after the switch. The hub's own transformers
  (hub-dcep-render, campaign-sections, hub-column-views, theme-separators) are in the hub bundle; theme-separators
  only there (campaign and info write separator markers and leave them to the collapse).

## 4. The plan

1. B5: rebuild the bundles on main (one commit), the suites and the collapse bundle test green.
2. B1: a carrier check on the hub and campaign documents (collapsed locally from their published `.plain.html`,
   theme on in a worktree, measured as above, all recorded hub and campaign page-widths): the carrier's CSS until
   no page is more than 0.5 points worse than today. Then the same for info pages with column marks.
3. B3: count the H1 heading-medium and card-H2 heading-small markers in DA's census; decide the carrier or page
   default by the count (the theme's own order: default, rule, carrier, never an exception); measure.
4. B2: unchanged unless Ben revisits decision 3; the measured cost goes with the switch's release note.
5. Then ema-test's pass page: canary of 20 documents, batches of 100, the switch merged, publish last.

Checks for each step: the sample above (12 documents) and every recorded hub page at 390 and 1440, today against
after; smoke before and after any served change; nothing published until step 5's own order.

## 5. Where it stands (brief 582, 2026-11-11 06:00 CET)

Nothing switched; THEMES.lufthansa has no `live`. Measured in a local worktree with `live: true`, the documents
collapsed with main's CLI and injected into the page on our host, today's side injected the same way.

1. **B5 done (a94f721):** the hub bundle rebuilt (the 133 hub snapshots import byte-identically); the other
   lufthansa.com bundles are current (rebuilt with every importer change since). The three Austrian bundles are
   their EMA's.
2. **B1, code done (0346b0c, d085603):** the collapse splits a view's opening separator into a section of its own
   that keeps the view's classes; such a section now has no padding and no gap, and none after the view before it;
   a carrier view's last slider keeps its own bottom margin. digital-self-services 16.3 / 19.9 % -> 8.2 / 3.5
   (today 7.1 / 2.9); meetings-and-events at 1440 8.3 -> 4.7 (today 3.9). The 36 recorded hub and campaign pages
   with column marks (logs/b582/b1all.tsv in the EMA's logs): the views within a point; worse by more after the
   switch: miles-and-more (+3.4 at 390, up to +14.8 at 1440), most-significant-route (+2.1 / +1.1), stopover
   (+2.9 / +3.5), neuschwanstein (+1.2 at 390), chronicle (+1.0 at 1440): separators (B2) and per-page (B4).
   Info pages with column marks, sampled (the 12 recorded de/en ones with the most marks): 9 of 12 worse after
   the switch (lufthansa-express-rail +9.6 at 1440, first-class-lounges, fia-valet-service, bid-upgrade +5 or
   more): each collapsed view 16 to 80 px shorter than with its marks; info needs carrier rules of its own.
3. **B3, code done (6c997b5):** census of the 6,826 documents: 168 page titles and 85 later H1s marked
   heading-medium. The lufthansa theme keeps that one-step size as the choice "H1 compact" (nearChoices); the
   collapse writes the section style, other brands unchanged. travel-classes 33.8 -> 5.8 / 15.0 -> 2.7 (today
   7.2 / 2.7); food-and-beverages 28.2 -> 22.0 / 21.3 -> 17.2.
4. **B2** as before (Ben's decision 3). **B4** next: miles-and-more (its separators collapse to M and its carousel
   section takes h3-large, 89 px shorter at 1440), stopover, most-significant-route, food-and-beverages' rest.

## 6. Info pages (standing order 3 item 5, 2026-11-11 11:00 CET)

The 582 sample of 12 recorded de/en info pages, measured again with the method fixed: 582 injected the collapsed
`.plain.html` without its Metadata, so the `Theme: flow-spacing` the collapse writes on every column-mark page never
reached the page (the page-level rules of column pages went off: the title image's 40px, the heading gap);
`logs/b596/capture-meta.cjs` puts the collapsed document's Metadata rows (the page's own Theme plus flow-spacing)
into the head. Today = the published document; switched = main's collapse and
code with `live: true`; fixed = with 739b5b1. % off www, 390 / 1440:

| page | today | switched | fixed |
| --- | --- | --- | --- |
| europa-tarife-economy-class | 7.4 / 5.8 | 9.2 / 8.4 | 7.1 / 6.2 |
| lufthansa-express-rail | 8.2 / 10.8 | 8.3 / 20.4 | 8.5 / 20.4 |
| unaccompanied-minors | 5.6 / 8.3 | 6.7 / 6.6 | 6.6 / 6.9 |
| first-class-lounges | 3.6 / 3.5 | 7.6 / 5.9 | 3.6 / 2.2 |
| rail-and-fly | 8.6 / 8.0 | 12.1 / 8.0 | 12.1 / 8.0 |
| admission-rules | 5.6 / 3.1 | 4.7 / 3.6 | 4.7 / 3.6 |
| fia-valet-service | 3.4 / 2.0 | 5.2 / 2.0 | 5.5 / 2.5 |
| sports-baggage | 5.8 / 5.9 | 6.0 / 6.4 | 6.0 / 4.6 |
| tiere-als-uebergepaeck | 9.5 / 8.1 | 10.0 / 9.5 | 10.0 / 9.5 |
| bid-upgrade | 8.0 / 2.3 | 7.1 / 7.3 | 8.0 / 2.3 |
| digital-baggage-services | 5.3 / 6.0 | 6.3 / 5.2 | 6.3 / 5.2 |
| green-fare | 4.6 / 2.9 | 5.7 / 4.7 | 5.3 / 3.2 |

Sum of the 12: 390 75.6 / 88.9 / 83.7, 1440 66.7 / 88.0 / 74.6. Fixed (739b5b1, all inert while the theme is off):
A an H3 marked heading-small stays heading-small on flow pages (section style H3 large; www: 924 of the 1,462 H3s
of the 1,862 column-mark documents); B a view's opening divider at the section's top edge; C the title image 40px
above a view; D a view's headings keep the full width on flow pages (6,500 of 6,978 without `{limited-width}`).
unaccompanied-minors at 1440 6.6 -> 6.9 with D is drift: its H2 is one line as on www (recording crop), the two-line
H2 had made up for 40px missing above.

Still in the way (shared, by documents):

1. **Nested column views** (a `{column-start}` while a view is open: 247 in 193 of the 1,862 column-mark documents):
   the collapse keeps the outermost group, the inner view's 32px above and below go (express-rail: four headings
   32px closer to their block).
2. **A grey column band before a view on info pages:** the rule from /de/de/lounges (brief 540, no gap) takes the
   band's 48px (rail-and-fly -80px at 390, express-rail -48 at 1440).
3. **A separator that is a view's first component** (75 dividers in 75 documents, 39 spacers in 39): with B 32px
   higher than www (fia-valet-service at 390 3.4 -> 5.5). Dividers right before a view, where B fits: 177 in 90
   documents (spacers 124 in 109; logs/b596/sep-census.mjs).
4. **A view's last block without bottom margin** ("the last component without margin"): after a table www keeps
   40px (fia-valet-service's Parking charges).
5. **Small print in the middle of a view** takes the body size (the collapse: "single small paragraphs body";
   express-rail's City-Ticket note), and copytext-medium paragraphs too (2px rule; unaccompanied-minors' notes).
6. Losses A and D take: 106 H3s marked heading-medium in 59 flow documents (miles-and-more's carousel title) come out
   heading-small (one H3 choice only); 462 headings marked limited-width come out full width (express-rail's video
   title). And the 143 published flow documents with column-view sections and no marks (economy-class,
   business-class, onboard-delights … in their markets) lose their two-thirds headings once the theme is live:
   measure them before the switch.

**Verdict: not yet for info pages.** With 739b5b1 the sample went from 9 of 12 worse to 4 of 12 worse at 1440 and
6 of 12 at 390 (by 0.5 points or more); lufthansa-express-rail (+9.6 at 1440) and rail-and-fly (+3.5 at 390)
need 1 and 2, fia-valet-service needs 3 and 4.
