# ITA's collapse pass: a check before the switch (the brief after 500, item 3)

20 ITA pages (it/en; the templates in proportion to ITA's collapsed documents: info 15, homepage, app-entry,
flight-status, hub and one without a report), each rendered three ways at 1440 and 390 (`logs/p4/s501/ita-cmp.mjs`):

- **host**: ita.turnsthe.page as it renders today (DA's documents, markers, theme off);
- **local**: the same local documents (content-sites/lh-ita), today's code, served by `aem up --html-folder` (:3022);
- **collapsed + live**: the local documents through `marker-collapse.mjs --force` (brand ita), served on :3021, with
  ITA's theme forced on in the browser only (scripts/style-markers.js answered with `ita: { live: true, …}`; the
  repository's switch stays off).

The site's metadata sheet isn't applied locally, so the brand meta is injected. "local" vs "host" shows where DA
and the workspace's documents differ; "collapsed + live" vs "local" is the pass itself. Flagged: height more than
3 % or a heading more than 40 px off, against either.

## Fixed (ours): the theme's heading gap

The theme's flow-page heading gap (`body.theme-live.flow-spacing … > * + :is(h2, h3)`, 32 px, the column view's
padding) also put 32 px between a page title and its subtitle (youth: H1 + H2 +32 px). It now applies only after
content that is not a heading (`> :not(h1, h2, h3, h4, h5, h6) + :is(h2, h3)`), and its value comes from the theme
(`columnViews.headingGap`, `--theme-heading-gap`).

A per-brand gap was tried and dropped. Most ITA headings after content don't start a column view (6 %), but 0 px
measured worse on every flagged page (cookie-policy -461 instead of -405 px, entry-exit -112 instead of -72, baggage
assistance -76 instead of -52). The `{spacer-10…30}` paragraphs before headings that the collapse table drops gave
that space. 32 px it is, every brand.

## The pages over the thresholds, with the cause

| page (/it/en/…) | width | vs host | vs local | cause |
| --- | --- | --- | --- | --- |
| legal/cookie-policy | 1440 / 390 | -5.1 % -405 px / -3.4 % -378 px | the same | B, C, A: 14 column marks; groups that end inside running text lose their 32 px (the plan); 21-30 px separators go (none); the link lists over the whole width |
| volare/airline-partners | 1440 | -7.6 % | -7.6 % | A: a 66 % list (unmarked, www's limited text) runs over the whole width (ITA's default); at 390 nothing moves |
| book-and-prepare/flightpass/youth | 1440 / 390 | -2.4 % -62 px / -1.7 % -62 px | the same | C: two 30 px separators (`{spacer-30}`, the table's none) around the purchase button |
| manage-my-bookings/manage/flight-status | 1440 | -1.7 % -54 px | -1.7 % -54 px | A: an unmarked paragraph at the whole width wraps to one line |
| extra-services/seats-selection/seats-selection-premium-economy | 1440 / 390 | -3.7 % -138 px / 0.4 % -41 px | -1.0 % -50 px / -40 px | B and D: a column group's end; the H2s' heading-small (28 px, one step) now the default heading-medium; the rest is DA vs local |
| travel-information/baggage/baggage-assistance | 1440 / 390 | -1.6 % -52 px / -0.8 % -49 px | -1.0 % -36 px / -33 px | C and D: 25 px separators go; "Lost baggage" heading-small to heading-medium |
| entry-regulations/…/entry-exit-system | 1440 / 390 | -1.6 % -72 px / -1.1 % -81 px | -1.2 % -56 px / -0.2 % +48 px | B, C: four column marks, small separators; headings 8-24 px each, over the page 56 px |
| manage-my-bookings/manage/check-in | 390 | +2.7 % +42 px | the same | D: "Check-in with ITA Airways" heading-small to heading-medium wraps to two lines on phones |
| homepage | 1440 / 390 | -5.9 % / -6.0 % | 0.6 % / 1.8 % | E: DA's homepage differs from the workspace's (vs local the collapse moves 9 / 42 px) |
| support/utilities/invoicing | 1440 / 390 | -3.8 % / -2.2 % | +1.7 % / +1.6 % | E: DA vs local (81 px); the pass itself +24 px (a small-print run as its own section) |
| other-requests/accessible-travel-us | 390 | +1.6 % +62 px | +0.5 % +18 px | E: DA vs local |

The other 9 pages stay within 3 % and 40 px at both widths: offers-and-destinations, multi-leg and upgrade move 0 px;
group-travel-and-charter, manage-my-bookings, the lounge, the flight-pass FAQ, youth-offers and seats-selection
move up to 2.9 %.

Causes:

- **A, ITA's text width.** ITA's theme draws running text over the whole width. 12,220 of its 12,708 running-text
  paragraphs and lists say so today (`{full-width}`). The other 488 (100 sections, 100 documents) were www's
  limited text and become wide: Ben's rule (the brand's default; a mixed section takes its majority, and there is no
  carrier for a narrow section on a wide brand). If those 100 sections should stay at two thirds, that needs a
  section style "Limited text" (Ben's decision).
- **B, column groups.** Groups that end inside running text lose their 32 px (the plan).
- **C, small separators.** 0-30 px separators go (the collapse table).
- **D, heading sizes.** A size one step from the level's default becomes the default (the plan).
- **E, DA vs the workspace.** DA's document is not the workspace's; the harness collapses DA's.

## Before the pass

- ITA's switch (`ita: { …, live: true }`) and the pass ship in one release (agreed). Nothing switched here.
- The harness runs `marker-collapse-cli.mjs --content <DA copy> --brand ita --force` on DA's documents. The
  workspace's 2,083 changed paths are in collapse-lh-ita-paths.txt; DA's may differ (E).
