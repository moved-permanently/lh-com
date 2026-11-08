# Austrian's collapse pass: a check before the switch (the brief after 503, item 2)

19 pages of the Austrian documents the collapse changes (templates in proportion, each at least once: info 12, homepage 1, austrian-checkin 1, austrian-flight-status 1, austrian-hero-banner 1, none 1, hub 1, fleet 1), each at 1440 and 390, rendered three ways (`logs/p4/s504/pass-cmp.mjs`, as ITA's check):

- **host**: austrian.turnsthe.page today (DA's documents as published, markers, theme off);
- **local**: the same published documents (the host's `.plain.html`, its page metadata as a Metadata block), today's code, `aem up --html-folder`; it renders as the host (where not, "E" below);
- **collapsed + live**: those documents through `marker-collapse.mjs --force` (brand austrian), the brand's theme forced on in the browser only (scripts/style-markers.js answered with `live: true`; the repository's switch stays off).

Flagged: the page more than 3 % taller or shorter than the host, or a heading more than 40 px off. "main's rules" is the collapse and theme as on main before this brief; "with the new theme rules" the ones this brief adds (below). Causes, from the element-by-element comparison (`logs/p4/s504/classify.mjs`, px, estimates: margins collapse): **A** text width, **B** column views (the marks' boxes and paddings), **C** separators (0-31 px go), **D** heading sizes, **R** the rest (block layouts, wrapping), **E** the local render of the published document already differs from the host (before the collapse).

## Fixed (ours)

- **Flow pages set their H3s in heading-small** (www: 87 % of them). It brings some pages closer (climate projects
  -212 to -187 px, lounges -215 to -201 px, culinary services) and keeps the voucher conditions' heading-small H3s as
  www draws them (with main's rules they became copytext-large).
- **The collapse weighs headings against the page type the site will see** (a page with column marks is a flow page).
- Tried and dropped: a 48 px heading gap for Austrian (half its headings after content start or end a column view,
  32 to 80 px). In a trial run it brought data-protection-rights from -296 to -184 px but made the flagged pages more,
  14 against 11 at 1440 (the voucher conditions +218 px). 32 px it stays, as for ITA.

Austrian's Columns Media, Accordion and Table are in column views of their own as often as not (Columns Media: 62 %
edge above, 70 % below, outer and inner alike): no theme rule there (no majority of one kind).

## What is left, by cause

- **B, text in column views.** Austrian puts each heading and its text in a column view of its own (an H2 and its
  paragraphs: 319 + 204 groups at the top of the list). Between two such groups www has 80 px (40 + 40 from 768 px),
  the theme 32. data-protection-rights -10.7 % at 1440 (seven groups), miles-and-more -3.4 %, lounges -4.6 %,
  climate projects -4.0 %.
- **C, small separators** (lounges -78 px, culinary services -78 px, climate projects -130 px).
- **D, heading sizes** (above; flight-status -68 px at 390).
- **R, the theme's heading gap.** The voucher conditions (+2.3 %): 32 px above each of its nine H3s after text,
  where www has the paragraph's 24 px (+8 px each).
- The Serbian homepage: +45 px for its first heading.

## For Ben

- **Text in column views** decides Austrian's pass: keep losing the groups' padding (the plan: pages up to -10.7 %),
  or give each such group a carrier (the section style Padded on a section of its own per group, on the 1,304 Austrian
  pages with column marks), or a theme rule "a heading after content starts a column view" with the
  outer padding (80 px between two headed groups; measured as a 48 px gap above: more pages over the thresholds,
  not fewer).


## The pages over the thresholds (with the new theme rules: 19 of 38 page widths; with main's rules 18)

On average a page is 1.9 % off the host in height and its worst heading 71 px (main's rules: 1.9 %, 71 px).

| page | width | main's rules: vs host / heading | new rules: vs host / heading | heading | causes (px) |
| --- | --- | --- | --- | --- | --- |
| /ru/ru/footer-pages/carbon-neutral-flying/climate-protection-projects | 1440 | -4.5 % / -212 | -4.0 % (-188 px) / -187 px | Green Fares | B -96, C -130, D +96, R -56 |
| /ru/ru/data-protection-rights | 1440 | -10.7 % / -296 | -10.7 % (-376 px) / -296 px | Право на информацию | B -560, D +224, R -39 |
| /pl/pl/legal/voucher-conditions/austrian-voucher | 1440 | -1.2 % / -25 | +2.3 % (+74 px) / +74 px | 9. Postanowienia końcowe | R +72 |
| /ru/ru/miles-and-more | 1440 | -3.6 % / -182 | -3.4 % (-155 px) / -182 px | Использование миль | B -128, C -26, D +64, R -62 |
| /it/it/book/flights/giftvoucher | 1440 | -1.1 % / -65 | -1.1 % (-34 px) / -65 px | Gift Card digitale | B -128, D +73, R +24 |
| /at/en/lounges-vienna-airport | 1440 | -5.6 % / -215 | -4.6 % (-179 px) / -201 px | Access regulations and range o | B -256, C -78, D +55, R +102 |
| /rs/en/homepage | 1440 | +1.6 % / +45 | +1.6 % (+45 px) / +45 px | Looking for more than just a f |  |
| /pl/pl/flight-status-and-timetable | 1440 | -0.9 % / -54 | -0.9 % (-39 px) / -54 px | Aplikacja Austrian | C -15, D -16, E -8 (the local render against the host) |
| /ru/ru/fly/on-board/culinary-services | 1440 | -0.7 % / -72 | -0.4 % (-43 px) / +46 px | Класс Business | C -78, D +144, R -103 |
| /se/en/sustainable-flying | 1440 | -1.7 % / -63 | -1.3 % (-48 px) / -51 px | This may also interest you | B -128, C -26, D +91, R +18 |
| /cn/zh/premium-economy-class | 1440 | -1.2 % / -46 | -1.2 % (-46 px) / -46 px | 商务舱 | D -34, R -11 |
| /ru/ru/footer-pages/carbon-neutral-flying/climate-protection-projects | 390 | -2.8 % / -192 | -2.8 % (-188 px) / -187 px | Green Fares | B -96, C -130, D +96, R -56 |
| /gr/el/footer-pages/faq/faq-seat-reservation/seat-reservations | 390 | +1.8 % / +70 | +1.8 % (+80 px) / +70 px | Κατηγορίες θέσεων | D +65, R +16 |
| /ru/ru/data-protection-rights | 390 | -1.6 % / -56 | -1.6 % (-96 px) / -56 px | Право на информацию | B -280, D +224, R -39 |
| /pl/pl/legal/voucher-conditions/austrian-voucher | 390 | -0.0 % / +26 | +1.3 % (+70 px) / +70 px | 9. Postanowienia końcowe | R +75 |
| /ru/ru/miles-and-more | 390 | -2.5 % / -253 | -2.4 % (-230 px) / -253 px | HON Circle | B -128, C -26, D +64, R -128, E -12 (the local render against the host) |
| /it/it/book/flights/giftvoucher | 390 | -0.7 % / -69 | -0.7 % (-31 px) / -69 px | Gift Card digitale | B -128, D +77, R +25 |
| /at/en/lounges-vienna-airport | 390 | -4.5 % / -203 | -3.7 % (-168 px) / -177 px | Access regulations and range o | B -256, C -78, D +43, R +125 |
| /pl/pl/flight-status-and-timetable | 390 | -3.8 % / -160 | -3.8 % (-153 px) / -160 px | Aplikacja Austrian | C -15, D -68, R -60, E -10 (the local render against the host) |

## Within 3 % and 40 px (19)

| page | width | main's rules: vs host / heading | new rules: vs host / heading | heading | causes (px) |
| --- | --- | --- | --- | --- | --- |
| /fr/fr/data-protection-contact | 1440 | -1.7 % / -32 | -1.7 % (-64 px) / -32 px | Votre demande | B -64, R -16, E +16 (the local render against the host) |
| /gr/el/footer-pages/faq/faq-seat-reservation/seat-reservations | 1440 | +2.0 % / +35 | +2.0 % (+44 px) / +35 px | Κατηγορίες θέσεων | D +59, R -15 |
| /es/es/book/flights/new-destinations | 1440 | +0.2 % / +31 | +0.3 % (+30 px) / +31 px | Esto también puede resultarle  | R +32 |
| /at/de/anreise-abreise | 1440 | +0.3 % / -2 | +0.3 % (+6 px) / -2 px | Free2move Carsharing | R +9 |
| /at/de/footer-pages/faq/faq-upgrades | 1440 | -2.7 % / +0 | -2.7 % (-64 px) / +0 px |  | B -192, R +128 |
| /it/it/anfrage-gutscheine | 1440 | -2.5 % / -40 | -2.5 % (-80 px) / -40 px | La sua richiesta | B -80, R -16, E +16 (the local render against the host) |
| /fr/fr/passenger-receipt | 1440 | +1.8 % / +27 | +1.8 % (+24 px) / +27 px | Factures pour la Hongrie, l’It | C +20, D +32, R -24 |
| /gr/el/offers-destinations | 1440 | -1.0 % / +0 | -1.0 % (-15 px) / +0 px |  | C -15 |
| /fr/fr/data-protection-contact | 390 | -1.6 % / -32 | -1.6 % (-64 px) / -32 px | Votre demande | B -64, R -16, E +16 (the local render against the host) |
| /es/es/book/flights/new-destinations | 390 | +0.1 % / +27 | +0.1 % (+26 px) / +27 px | Esto también puede resultarle  | R +32 |
| /at/de/anreise-abreise | 390 | +0.2 % / -4 | +0.2 % (+4 px) / -4 px | Free2move Carsharing | R +9 |
| /at/de/footer-pages/faq/faq-upgrades | 390 | -1.7 % / +0 | -1.7 % (-64 px) / +0 px |  | B -192, R +128 |
| /it/it/anfrage-gutscheine | 390 | -1.2 % / -20 | -1.2 % (-40 px) / -20 px | La sua richiesta | B -40, R -16, E +16 (the local render against the host) |
| /rs/en/homepage | 390 | -0.1 % / -6 | -0.1 % (-6 px) / -6 px | Looking for more than just a f |  |
| /fr/fr/passenger-receipt | 390 | +1.2 % / +25 | +1.2 % (+22 px) / +25 px | Factures pour la Hongrie, l’It | C +20, D +32, R -24 |
| /ru/ru/fly/on-board/culinary-services | 390 | -0.6 % / -51 | -1.0 % (-88 px) / -37 px | Часто задаваемые вопросы — кул | C -78, D +100, R -101, E -9 (the local render against the host) |
| /se/en/sustainable-flying | 390 | -0.2 % / +39 | -0.1 % (-7 px) / +39 px | Reduce your CO₂ with innovativ | B -128, C -26, D +165, R -13 |
| /gr/el/offers-destinations | 390 | -1.4 % / +0 | -1.4 % (-15 px) / +0 px |  | C -15 |
| /cn/zh/premium-economy-class | 390 | -0.9 % / -34 | -0.9 % (-34 px) / -34 px | 商务舱 | D -15, R -16 |

## Before the pass

- The brand's switch (`THEMES.austrian.live`) ships in the same release as this pass, never apart (agreed). Nothing is switched here.
- The harness runs `marker-collapse-cli.mjs --content <DA copy> --brand austrian --force` on DA's documents. The workspace's 1,893 changed paths are in collapse-lh-austrian-paths.txt, in release order; DA's may differ.
- Measured with main at f682c697 plus these rules (56b60faf, before its rebase); the brand-theme commits that came later (the brief after 505) are not in these numbers.
