# SWISS's collapse pass: a check before the switch (the brief after 503, item 2)

12 pages of the SWISS documents the collapse changes (templates in proportion, each at least once: none 12), each at 1440 and 390, rendered three ways (`logs/p4/s504/pass-cmp.mjs`, as ITA's check):

- **host**: swiss.turnsthe.page today (DA's documents as published, markers, theme off);
- **local**: the same published documents (the host's `.plain.html`, its page metadata as a Metadata block), today's code, `aem up --html-folder`; it renders as the host (where not, "E" below);
- **collapsed + live**: those documents through `marker-collapse.mjs --force` (brand swiss), the brand's theme forced on in the browser only (scripts/style-markers.js answered with `live: true`; the repository's switch stays off).

Flagged: the page more than 3 % taller or shorter than the host, or a heading more than 40 px off. "main's rules" is the collapse and theme as on main before this brief; "with the new theme rules" the ones this brief adds (below). Causes, from the element-by-element comparison (`logs/p4/s504/classify.mjs`, px, estimates: margins collapse): **A** text width, **B** column views (the marks' boxes and paddings), **C** separators (0-31 px go), **D** heading sizes, **R** the rest (block layouts, wrapping), **E** the local render of the published document already differs from the host (before the collapse).

These are the 21 documents of the lh-swiss workspace (the FAQ hubs and the carry-on baggage pages in every
language); the markets' pages (lh-swiss-mk) and the sub-sites' (lh-swiss-sub) have reports of their own. All three
are on swiss.turnsthe.page.

## Fixed (ours)

- **The FAQ hub's topic teasers kept their grid only with their column marks.** styles.css and swiss.css draw the
  hub's four-up grid of topic teasers on a wrapper with a `{column-start}` mark; without the marks the teasers stacked
  (+38 % at 1440, -39 % at 390). The theme now marks the heading right before a run of teasers as the start of their
  group (`THEMES.swiss.rules: teaser-groups`, the class the marker gave it), so the grid and its rows are as before.
- **Flow pages set their H2s in heading-small** (www: 63 % of the markets' pages and 79 % of the sub-sites'; most of
  the rest unmarked, one step up). On the FAQ hubs the five group headings (Book, Prepare …) are unmarked: 36 to
  28 px.
- **The collapse weighs headings against the page type the site will see.**

## What is left, by cause

- **B, the FAQ hub's groups.** Each group of teasers had its column view's 32 px above; the groups that start after
  another group (the second row under Book) are not derivable without the marks (groups of 4, 4, 2 and 3): -73 px at
  1440, -90 to -121 px at 390 (-3.4 % / -1.9 %).
- **D and C, the carry-on baggage pages** (+2.5 % to +3.7 %):
  - a section whose H3s are mostly heading-medium gets the section style H3 large, so its two heading-small H3s grow
    too (+53 px);
  - the separators round to the table's sizes: 50 px to M (60), 100 px to L (120, four of them);
  - three `from-768` separators (none on phones on www) are drawn on phones as well: +140 px at 390.

## For Ben

- **`from-768` separators** (the collapse table drops the qualifier): keep (phones get the space as well), or a
  Spacer option for "from 768 px" (a carrier per such separator: SWISS 3 per baggage page).


## The pages over the thresholds (with the new theme rules: 24 of 24 page widths; with main's rules 24)

On average a page is 2.9 % off the host in height and its worst heading 149 px (main's rules: 21.1 %, 842 px).

| page | width | main's rules: vs host / heading | new rules: vs host / heading | heading | causes (px) |
| --- | --- | --- | --- | --- | --- |
| /ch/pt/customer-support/faq | 1440 | +38.4 % / +927 | -3.4 % (-73 px) / -73 px | Reserva antecipada de assento | B -352, D -56, R +335 |
| /ch/zh/customer-support/faq | 1440 | +44.2 % / +980 | -4.9 % (-100 px) / -99 px | 座位预订 | B -352, D -164, R +416 |
| /ch/it/prepare/baggage/hand-baggage | 1440 | +3.0 % / +166 | +2.5 % (+137 px) / +137 px | Domande frequenti sul bagaglio | D +53, R +104, E -22 (the local render against the host) |
| /ch/de/customer-support/faq | 1440 | +38.4 % / +927 | -3.4 % (-73 px) / -73 px | Frühzeitige Sitzplatzreservier | B -352, D -56, R +335 |
| /ch/es/customer-support/faq | 1440 | +38.4 % / +927 | -3.4 % (-73 px) / -73 px | Reserva de asiento por adelant | B -352, D -56, R +335 |
| /ch/de/prepare/baggage/hand-baggage | 1440 | +3.1 % / +166 | +2.5 % (+138 px) / +138 px | Häufig gestellte Fragen zu Han | D +53, R +104, E -21 (the local render against the host) |
| /ch/el/customer-support/faq | 1440 | +34.7 % / +874 | -4.5 % (-100 px) / -99 px | Προκράτηση θέσης | B -352, D -164, R +416 |
| /kr/ko/prepare/baggage/hand-baggage | 1440 | +3.4 % / +175 | +2.8 % (+147 px) / +147 px | 휴대 수하물 관련 자주 묻는 질문 | D +53, R +104, E -12 (the local render against the host) |
| /ch/zh/prepare/baggage/hand-baggage | 1440 | +3.5 % / +176 | +3.0 % (+148 px) / +148 px | 有关手提行李的常见问题及答案 | D +53, R +104, E -11 (the local render against the host) |
| /ch/en/prepare/baggage/hand-baggage | 1440 | +3.2 % / +169 | +2.7 % (+140 px) / +140 px | Frequently asked questions abo | D +53, R +104, E -19 (the local render against the host) |
| /ch/fr/customer-support/faq | 1440 | +38.0 % / +927 | -3.4 % (-73 px) / -73 px | Réservation de siège à l’avanc | B -352, D -56, R +335 |
| /ch/fr/prepare/baggage/hand-baggage | 1440 | +3.1 % / +168 | +2.5 % (+140 px) / +140 px | FAQ sur les bagages à main | D +53, R +104, E -19 (the local render against the host) |
| /ch/pt/customer-support/faq | 390 | -38.8 % / -1975 | -1.9 % (-90 px) / -90 px | Reserva antecipada de assento | B -352, D -28, R +290 |
| /ch/zh/customer-support/faq | 390 | -39.6 % / -1954 | -2.0 % (-91 px) / -91 px | 座位预订 | B -352, D -28, R +289 |
| /ch/it/prepare/baggage/hand-baggage | 390 | +3.0 % / +284 | +2.9 % (+272 px) / +271 px | Domande frequenti sul bagaglio | C +140, D +65, R +111, E -44 (the local render against the host) |
| /ch/de/customer-support/faq | 390 | -39.5 % / -1997 | -2.6 % (-121 px) / -121 px | Frühzeitige Sitzplatzreservier | B -352, D -59, R +290 |
| /ch/es/customer-support/faq | 390 | -38.5 % / -1953 | -1.9 % (-90 px) / -90 px | Reserva de asiento por adelant | B -352, D -28, R +290 |
| /ch/de/prepare/baggage/hand-baggage | 390 | +3.3 % / +316 | +2.9 % (+279 px) / +279 px | Häufig gestellte Fragen zu Han | C +140, D +71, R +111, E -43 (the local render against the host) |
| /ch/el/customer-support/faq | 390 | -38.4 % / -1980 | -1.9 % (-90 px) / -90 px | Προκράτηση θέσης | B -352, D -28, R +290 |
| /kr/ko/prepare/baggage/hand-baggage | 390 | +3.5 % / +305 | +3.5 % (+298 px) / +298 px | 휴대 수하물 관련 자주 묻는 질문 | C +140, D +71, R +112, E -25 (the local render against the host) |
| /ch/zh/prepare/baggage/hand-baggage | 390 | +3.8 % / +303 | +3.7 % (+297 px) / +297 px | 有关手提行李的常见问题及答案 | C +140, D +71, R +112, E -26 (the local render against the host) |
| /ch/en/prepare/baggage/hand-baggage | 390 | +3.1 % / +286 | +2.7 % (+249 px) / +249 px | Frequently asked questions abo | C +140, D +40, R +111, E -42 (the local render against the host) |
| /ch/fr/customer-support/faq | 390 | -39.1 % / -1976 | -1.9 % (-91 px) / -91 px | Réservation de siège à l’avanc | B -352, D -28, R +289 |
| /ch/fr/prepare/baggage/hand-baggage | 390 | +3.0 % / +293 | +2.8 % (+280 px) / +280 px | FAQ sur les bagages à main | C +140, D +71, R +112, E -43 (the local render against the host) |

## Within 3 % and 40 px (0)

| page | width | main's rules: vs host / heading | new rules: vs host / heading | heading | causes (px) |
| --- | --- | --- | --- | --- | --- |
| (none) | | | | | |

## Before the pass

- The brand's switch (`THEMES.swiss.live`) ships in the same release as this pass, never apart (agreed). Nothing is switched here. SWISS has one switch for its three workspaces (the markets, the sub-sites, the FAQ and baggage pages): their passes go together.
- The harness runs `marker-collapse-cli.mjs --content <DA copy> --brand swiss --force` on DA's documents. The workspace's 21 changed paths are in collapse-lh-swiss-paths.txt, in release order; DA's may differ.
- Measured with main at f682c697 plus these rules (56b60faf, before its rebase); the brand-theme commits that came later (the brief after 505) are not in these numbers.
