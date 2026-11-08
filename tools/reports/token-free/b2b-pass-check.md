# Lufthansa Group for Business's collapse pass: a check before the switch (the brief after 503, item 2)

16 pages of the Lufthansa Group for Business documents the collapse changes (templates in proportion, each at least once: info 16), each at 1440 and 390, rendered three ways (`logs/p4/s504/pass-cmp.mjs`, as ITA's check):

- **host**: b2b.turnsthe.page today (DA's documents as published, markers, theme off);
- **local**: the same published documents (the host's `.plain.html`, its page metadata as a Metadata block), today's code, `aem up --html-folder`; it renders as the host (where not, "E" below);
- **collapsed + live**: those documents through `marker-collapse.mjs --force` (brand b2b), the brand's theme forced on in the browser only (scripts/style-markers.js answered with `live: true`; the repository's switch stays off).

Flagged: the page more than 3 % taller or shorter than the host, or a heading more than 40 px off. "main's rules" is the collapse and theme as on main before this brief; "with the new theme rules" the ones this brief adds (below). Causes, from the element-by-element comparison (`logs/p4/s504/classify.mjs`, px, estimates: margins collapse): **A** text width, **B** column views (the marks' boxes and paddings), **C** separators (0-31 px go), **D** heading sizes, **R** the rest (block layouts, wrapping), **E** the local render of the published document already differs from the host (before the collapse).

## Fixed (ours): the theme's rules for Lufthansa Group for Business

- **Columns Media, Carousel Images and Quote are column views of their own on flow pages, also at a section's end.**
  www's column view around them (40 px above and below from 768 px, 20 px on phones): 558 of the 789 Columns Media not
  at a section's start have the edge above, 749 of 962 the edge below (371 of 533 at a section's end); Carousel
  Images 21 of 23, Quote 14 of 14. The collapse dropped those marks: the news pages lost 80 px (-12 %). The theme now
  draws the edges (`THEMES.b2b`, flow pages: `columnViews.blocks`, `endEdge`).
- **Flow pages set their H3s in heading-small** (www: 82 % of them).
- **The collapse weighs headings against the page type the site will see** (a page with column marks is a flow page).

Of the 32 page widths 18 were over the thresholds with main's rules, 5 are now.

## What is left, by cause

- **B, text in column views.** meals-on-board (-6.8 %): a heading and its text in a column view of their own lose
  its padding (the plan).
- **C, small separators** (`{spacer-25}`, `{spacer-30}`: history, route network, rail-fly).
- **D, heading sizes.** travel-classes-and-booking: H3s one step from the default take it (+240 px over the page,
  +1.6 %); the headings move up to 131 px at 390.
- **B +40 / +20.** new-swiss-lounges: one Columns Media without www's column view gets the edges (one of the
  minority).
- **E.** two news pages render 17 to 25 px differently locally than on the host, not the pass.

## For Ben

- **B2B's text width.** 301 of B2B's 573 flow-page sections are mostly wide (49 % of its running text), which the
  collapse writes as the section style Wide text (301 carriers). Options: keep the brand default (two thirds, 301
  carriers), or make wide B2B's default (no carriers; 272 sections that www draws at two thirds become wide; a
  "Limited text" style would be the only way back, which Ben ruled out for ITA).
- **Text in column views:** as for Discover (a Padded section per group, or the plan's loss).


## The pages over the thresholds (with the new theme rules: 5 of 32 page widths; with main's rules 18)

On average a page is 1.0 % off the host in height and its worst heading 14 px (main's rules: 3.8 %, 28 px).

| page | width | main's rules: vs host / heading | new rules: vs host / heading | heading | causes (px) |
| --- | --- | --- | --- | --- | --- |
| /de/en/about-us/lhg-history/lhg-history-business-class | 1440 | -5.6 % / -189 | -2.0 % (-85 px) / -42 px | Milestone of the partnership | C -31, R -48 |
| /xx/de/program/experts/on-board/meals-on-board/lufthansa | 1440 | -6.8 % / -43 | -6.8 % (-87 px) / -43 px | Menüs auf Langstreckenflügen | B -80 |
| /de/en/about-us/lhg-history/lhg-history-business-class | 390 | -3.4 % / -126 | -2.1 % (-94 px) / -70 px | Milestone of the partnership | C -31, R -57 |
| /xx/de/program/experts/on-board/meals-on-board/lufthansa | 390 | -5.8 % / -26 | -5.8 % (-50 px) / -26 px | Menüs auf Langstreckenflügen | B -40, D -10 |
| /ch/en/program/experts/on-board/travel-classes-and-booking | 390 | +0.1 % / -34 | +1.6 % (+136 px) / +131 px | Benefits of Green Fares: | C -62, D +240, R -42 |

## Within 3 % and 40 px (27)

| page | width | main's rules: vs host / heading | new rules: vs host / heading | heading | causes (px) |
| --- | --- | --- | --- | --- | --- |
| /de/de/program/experts/on-board/entertainment-on-board | 1440 | +0.0 % / +0 | +0.0 % (+0 px) / +0 px |  |  |
| /xx/de/program/experts/on-board/entertainment-on-board | 1440 | +0.0 % / +0 | +0.0 % (+0 px) / +0 px |  |  |
| /de/de/program/experts/news/brussels-airlines-unveils-its-newest-belgian-icon | 1440 | -10.0 % / +0 | +0.0 % (+0 px) / +0 px |  |  |
| /de/en/program/experts/news/swiss-and-sbb-expand-air-rail-service-to-include-three-more-dest | 1440 | -3.5 % / -32 | -0.3 % (-3 px) / +0 px |  |  |
| /de/en/news/lufthansa-increases-capacity-from-munich | 1440 | -7.0 % / +0 | +0.0 % (+0 px) / +0 px |  |  |
| /de/en/program/experts/news/lufthansa-expands-onboard-delights-with-hot-meals | 1440 | -12.1 % / +0 | +0.0 % (+0 px) / +0 px |  |  |
| /de/en/program/experts/news/our-new-lufthansa-allegris-winter-destinations-2025-2026 | 1440 | -12.5 % / +0 | -2.2 % (-17 px) / +0 px |  | E -17 (the local render against the host) |
| /de/de/program/experts/news/earn-points-even-more-flexibly-ita-airways-in-the-partnerplusbe | 1440 | -11.6 % / +0 | +0.0 % (+0 px) / +0 px |  |  |
| /de/de/program/experts/route-network | 1440 | -3.2 % / -52 | -2.0 % (-32 px) / -32 px | Mit Codesharing zu weiteren Zi | C -26, D +18, R -24 |
| /xx/en/program/experts/on-board/travel-classes-and-booking/austrian-airlines | 1440 | +0.0 % / +0 | +0.0 % (+0 px) / +0 px |  |  |
| /ch/en/program/experts/on-board/travel-classes-and-booking | 1440 | -0.8 % / -63 | +0.8 % (+49 px) / +40 px | Advance seat reservation: Swit | A -48, C -62, D +240, R -81 |
| /de/de/news/new-swiss-lounges-at-zurich-airport | 1440 | +0.0 % / +0 | +2.3 % (+40 px) / +0 px |  | B +40 |
| /de/en/program/experts/news/austrian-airlines-recognized-for-outstanding-service-and-hospita | 1440 | -3.2 % / +0 | +0.0 % (+0 px) / +0 px |  |  |
| /de/de/program/experts/at-the-airport/arrival-departure/rail-fly | 1440 | -12.5 % / -197 | -1.4 % (-26 px) / -26 px | Rail&Fly auch bei Eurowings ve | C -52, D +18, R +8 |
| /de/de/program/experts/on-board/entertainment-on-board | 390 | +0.0 % / +0 | +0.0 % (+0 px) / +0 px |  |  |
| /xx/de/program/experts/on-board/entertainment-on-board | 390 | +0.0 % / +0 | +0.0 % (+0 px) / +0 px |  |  |
| /de/de/program/experts/news/brussels-airlines-unveils-its-newest-belgian-icon | 390 | -2.8 % / +0 | +0.0 % (+0 px) / +0 px |  |  |
| /de/en/program/experts/news/swiss-and-sbb-expand-air-rail-service-to-include-three-more-dest | 390 | +0.3 % / +8 | -0.3 % (-4 px) / +0 px |  |  |
| /de/en/news/lufthansa-increases-capacity-from-munich | 390 | -1.4 % / +0 | +0.0 % (+0 px) / +0 px |  |  |
| /de/en/program/experts/news/lufthansa-expands-onboard-delights-with-hot-meals | 390 | -3.5 % / +0 | +0.0 % (+0 px) / +0 px |  |  |
| /de/en/program/experts/news/our-new-lufthansa-allegris-winter-destinations-2025-2026 | 390 | -5.2 % / +0 | -2.0 % (-25 px) / +0 px |  | E -25 (the local render against the host) |
| /de/de/program/experts/news/earn-points-even-more-flexibly-ita-airways-in-the-partnerplusbe | 390 | -3.4 % / +0 | +0.0 % (+0 px) / +0 px |  |  |
| /de/de/program/experts/route-network | 390 | -1.3 % / -38 | -0.1 % (-2 px) / -2 px | Austrian Airlines | C -26, D +49, R -25 |
| /xx/en/program/experts/on-board/travel-classes-and-booking/austrian-airlines | 390 | +0.0 % / +0 | +0.0 % (+0 px) / +0 px |  |  |
| /de/de/news/new-swiss-lounges-at-zurich-airport | 390 | +0.0 % / +0 | +1.0 % (+20 px) / +0 px |  | B +20 |
| /de/en/program/experts/news/austrian-airlines-recognized-for-outstanding-service-and-hospita | 390 | +0.5 % / +0 | +0.0 % (+0 px) / +0 px |  |  |
| /de/de/program/experts/at-the-airport/arrival-departure/rail-fly | 390 | -4.0 % / -79 | +0.0 % (+1 px) / +27 px | Die Vorteile mit Rail&Fly | C -52, D +44, R +9 |

## Before the pass

- The brand's switch (`THEMES.b2b.live`) ships in the same release as this pass, never apart (agreed). Nothing is switched here.
- The harness runs `marker-collapse-cli.mjs --content <DA copy> --brand b2b --force` on DA's documents. The workspace's 644 changed paths are in collapse-lh-b2b-paths.txt, in release order; DA's may differ.
- Measured with main at f682c697 plus these rules (56b60faf, before its rebase); the brand-theme commits that came later (the brief after 505) are not in these numbers.
