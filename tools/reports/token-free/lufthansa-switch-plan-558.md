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
