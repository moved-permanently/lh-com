# Discover's collapse pass: a check before the switch (the brief after 503, item 2)

14 pages of the Discover documents the collapse changes (templates in proportion, each at least once: none 12, homepage 2), each at 1440 and 390, rendered three ways (`logs/p4/s504/pass-cmp.mjs`, as ITA's check):

- **host**: discover.turnsthe.page today (DA's documents as published, markers, theme off);
- **local**: the same published documents (the host's `.plain.html`, its page metadata as a Metadata block), today's code, `aem up --html-folder`; it renders as the host (where not, "E" below);
- **collapsed + live**: those documents through `marker-collapse.mjs --force` (brand discover), the brand's theme forced on in the browser only (scripts/style-markers.js answered with `live: true`; the repository's switch stays off).

Flagged: the page more than 3 % taller or shorter than the host, or a heading more than 40 px off. "main's rules" is the collapse and theme as on main before this brief; "with the new theme rules" the ones this brief adds (below). Causes, from the element-by-element comparison (`logs/p4/s504/classify.mjs`, px, estimates: margins collapse): **A** text width, **B** column views (the marks' boxes and paddings), **C** separators (0-31 px go), **D** heading sizes, **R** the rest (block layouts, wrapping), **E** the local render of the published document already differs from the host (before the collapse).

## Fixed (ours): the theme's rules for Discover

- **Columns Media is a column view of its own on flow pages.** www puts it in a column view of its own (40 px above
  and below from 768 px, 20 px on phones): 26 of the 33 Columns Media not at a section's start have the edge above,
  and most have none at a section's end (14 of 20). The collapse dropped those marks, so every page lost 80 px per
  block (baggage -244 px). The theme now draws the edges (`THEMES.discover`, flow pages: `columnViews.blocks`), not
  in tab panels and not at a section's start or end, with the same paragraphs the markers drew.
- **Flow pages set their H2s in heading-small.** 86 % of Discover's H2s are heading-small (none unmarked), so the
  level's default on flow pages is heading-small; the others (copytext-large) keep their section style.
- **The collapse weighs headings against the page type the site will see.** A page with column marks becomes a
  flow page in the collapse (its Theme row), so its headings are measured against the flow pages' defaults.

## What is left, by cause

- **B, text in column views.** www also puts text in column views: an intro paragraph after the title (additional
  services, -80 px), a table and its footnotes (baggage, -116 px), a heading and its text. Those groups lose their
  padding (the plan). Pages up to -3.7 % at 1440.
- **C, small separators.** `{spacer-30}` and smaller go (the collapse table): customer service -124 px, families
  -62 px.
- **R, the heading gap.** The theme's 32 px above a heading after content, where www had a column edge of 40 px or a
  small separator (families, check-in: +40 to +75 px for the headings, the pages within 1 %).
- **D, the homepages.** Their headings one step from the default become the default (+60 to +95 px at 390).
- **E.** check-in-at-the-airport and business-class at 390 render 80 to 110 px differently locally than on the host
  before the collapse (a video and a tab set): not the pass.

## For Ben

- **Text in column views** (Discover, also Austrian and B2B): keep losing the group padding (the plan), or give
  such a group a carrier: a section of its own with the section style Padded (per group; Discover about 10, Austrian
  some 1,300 pages).


## The pages over the thresholds (with the new theme rules: 20 of 28 page widths; with main's rules 21)

On average a page is 1.9 % off the host in height and its worst heading 58 px (main's rules: 3.2 %, 94 px).

| page | width | main's rules: vs host / heading | new rules: vs host / heading | heading | causes (px) |
| --- | --- | --- | --- | --- | --- |
| /de/de/discover/services-on-board/entertainment | 1440 | -9.8 % / -240 | -5.1 % (-144 px) / -104 px | Discover FlyNet® | B -120, C -62, D +32, R +9 |
| /de/de/my-bookings/manage/customer-service | 1440 | -3.1 % / -107 | -0.9 % (-28 px) / +48 px | Sie haben ein Anliegen vor Ihr | B +116, C -124, R -20 |
| /de/de/book/baggage | 1440 | -7.5 % / -244 | -3.7 % (-120 px) / -120 px | Gepäckbestimmungen für Kinder | B -116, D -15, R +11 |
| /de/en/book/baggage | 1440 | -7.6 % / -244 | -3.7 % (-120 px) / -120 px | Baggage regulations for childr | B -116, D -15, R +11 |
| /de/en/discover/travel-classes/business-class | 1440 | -2.3 % / -103 | -3.1 % (-101 px) / -112 px | Your benefits on board | B -80, R +11, E -32 (the local render against the host) |
| /de/en/book/special-requests/families | 1440 | -3.5 % / -159 | -0.5 % (-21 px) / +42 px | Personalized audio adventures  | C -62, R +41 |
| /de/de/my-bookings/services/additional-services | 1440 | -2.5 % / -80 | -2.5 % (-80 px) / -80 px | Sitzplatzreservierung | B -80 |
| /de/de/book/special-requests/families | 1440 | -4.2 % / -190 | -1.2 % (-51 px) / -51 px | Das könnte Sie auch interessie | C -62, R +11 |
| /de/en/my-bookings/services/additional-services | 1440 | -1.9 % / -52 | -1.9 % (-52 px) / -52 px | Advance seat reservation | B -80, R +28 |
| /de/de/discover/services-on-board/entertainment | 390 | -1.1 % / -158 | +0.7 % (+29 px) / -82 px | Onboard Cloud | B -60, C -62, D +32, R +119 |
| /de/de/my-bookings/manage/customer-service | 390 | -1.9 % / -103 | -1.4 % (-68 px) / -68 px | Häufig gestellte Fragen | B +76, C -124, R -20 |
| /de/de/book/baggage | 390 | -2.6 % / -125 | -1.7 % (-73 px) / -76 px | Zusätzliches Gepäck | B -76 |
| /de/en/book/baggage | 390 | -2.7 % / -125 | -1.7 % (-73 px) / -76 px | Additional baggage | B -76 |
| /de/en/my-bookings/check-in/check-in-at-the-airport | 390 | +12.0 % / +80 | +12.4 % (+100 px) / +80 px | How do I use the baggage machi | B +20, E +80 (the local render against the host) |
| /de/en/discover/travel-classes/business-class | 390 | +7.1 % / +128 | +3.9 % (+69 px) / +69 px | This might also be of interest | B -40, E +109 (the local render against the host) |
| /de/en/book/special-requests/families | 390 | -0.0 % / +46 | -0.3 % (-18 px) / +44 px | Personalized audio adventures  | C -62, R +44 |
| /de/en/my-bookings/check-in | 390 | -1.9 % / +55 | +0.7 % (+13 px) / +75 px | Check-in at the airport | C -62, R +75 |
| /de/de/book/special-requests/families | 390 | -0.0 % / +46 | -0.3 % (-18 px) / +45 px | Personalisierte Hörabenteuer f | C -62, R +44 |
| /de/de/homepage | 390 | +2.2 % / +91 | +2.2 % (+91 px) / +91 px | Die Welt entdecken | D +95 |
| /de/en/homepage | 390 | +1.5 % / +60 | +1.5 % (+60 px) / +60 px | Explore the world | D +64 |

## Within 3 % and 40 px (8)

| page | width | main's rules: vs host / heading | new rules: vs host / heading | heading | causes (px) |
| --- | --- | --- | --- | --- | --- |
| /de/en/my-bookings/check-in/check-in-at-the-airport | 1440 | +0.8 % / +17 | +1.8 % (+56 px) / +17 px | Late-night check-in Frankfurt | B +40, R +16 |
| /de/en/book/flights/flight-search | 1440 | +1.9 % / +0 | +0.0 % (+0 px) / +0 px |  |  |
| /de/en/my-bookings/check-in | 1440 | -6.1 % / -91 | -0.2 % (-3 px) / -3 px | You might also be interested i | C -62, R +59 |
| /de/de/homepage | 1440 | +0.8 % / +24 | +0.8 % (+24 px) / +24 px | Die Welt entdecken | D +27 |
| /de/en/homepage | 1440 | +0.8 % / +25 | +0.8 % (+25 px) / +25 px | Explore the world | D +27 |
| /de/en/book/flights/flight-search | 390 | +2.5 % / +0 | +0.0 % (+0 px) / +0 px |  |  |
| /de/de/my-bookings/services/additional-services | 390 | -1.2 % / -40 | -1.2 % (-40 px) / -40 px | Sitzplatzreservierung | B -40 |
| /de/en/my-bookings/services/additional-services | 390 | -0.4 % / -12 | -0.4 % (-12 px) / -12 px | Advance seat reservation | B -40, R +28 |

## Before the pass

- The brand's switch (`THEMES.discover.live`) ships in the same release as this pass, never apart (agreed). Nothing is switched here.
- The harness runs `marker-collapse-cli.mjs --content <DA copy> --brand discover --force` on DA's documents. The workspace's 24 changed paths are in collapse-lh-discover-paths.txt, in release order; DA's may differ.
- Measured with main at f682c697 plus these rules (56b60faf, before its rebase); the brand-theme commits that came later (the brief after 505) are not in these numbers.
