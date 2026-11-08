# Brussels's collapse pass: a check before the switch (the brief after 503, item 2)

19 pages of the Brussels documents the collapse changes (templates in proportion, each at least once: info 13, homepage 2, insights 1, fleet 1, app-entry 1, hub 1), each at 1440 and 390, rendered three ways (`logs/p4/s504/pass-cmp.mjs`, as ITA's check):

- **host**: brussels.turnsthe.page today (DA's documents as published, markers, theme off);
- **local**: the same published documents (the host's `.plain.html`, its page metadata as a Metadata block), today's code, `aem up --html-folder`; it renders as the host (where not, "E" below);
- **collapsed + live**: those documents through `marker-collapse.mjs --force` (brand brussels), the brand's theme forced on in the browser only (scripts/style-markers.js answered with `live: true`; the repository's switch stays off).

Flagged: the page more than 3 % taller or shorter than the host, or a heading more than 40 px off. "main's rules" is the collapse and theme as on main before this brief; "with the new theme rules" the ones this brief adds (below). Causes, from the element-by-element comparison (`logs/p4/s504/classify.mjs`, px, estimates: margins collapse): **A** text width, **B** column views (the marks' boxes and paddings), **C** separators (0-31 px go), **D** heading sizes, **R** the rest (block layouts, wrapping), **E** the local render of the published document already differs from the host (before the collapse).

## Fixed (ours)

- **Brussels' service pages no longer set their H2s in heading-small.** That rule (token-free step 1) contradicts
  www: 89 % of the service pages' H2s are unmarked and render heading-medium; an-unforgettable-reunion lost 190 px at
  390 to it. The service pages' H2 default is the base theme's again.
- **Flow pages set their H3s in heading-small** (www: 72 % of them; the rest unmarked).
- **The collapse weighs headings against the page type the site will see.** A Brussels page with column marks was
  weighed as a service page (H2 heading-small) and rendered as a flow page (heading-medium).

## What is left, by cause

- **C, small separators.** The A330 fleet page's four `{spacer-28}` go (-116 px, -3.5 % / -5.1 %); the Kinshasa
  lounge -123 px, meetings-and-events two `{spacer-25}`, security fast lanes one.
- **D, heading sizes.** online-check-in-options (-2.3 %, -87 px; was -5.5 % with the old service-page rule): its
  four numbered steps (H2 heading-large) are one step from the default now and take it; security fast lanes: its H3s
  in heading-small among unmarked ones.
- **A, text width, and B.** seat-reservation (+2.6 % at 1440): seven small-print paragraphs at the whole width in a
  section of limited text become limited (+96 px), its column groups lose their padding (-192 px), and its headings
  one step from the default take it (+176 px).
- **B.** lhg-hub-airport-info: a column view's 80 px (-4.1 % of a short page).
- **The Thai homepage**: its headings one step from the default (+63 px).

## For Ben

- **Small separators** (21-31 px; Brussels writes `{spacer-25}` and `{spacer-28}` often): the collapse table drops
  them (the plan; -116 px on the A330 page). The alternative is M (60 px), which is farther from 28 than none is.


## The pages over the thresholds (with the new theme rules: 12 of 38 page widths; with main's rules 15)

On average a page is 1.1 % off the host in height and its worst heading 35 px (main's rules: 1.6 %, 60 px).

| page | width | main's rules: vs host / heading | new rules: vs host / heading | heading | causes (px) |
| --- | --- | --- | --- | --- | --- |
| /be/nl/plan-your-trip/airport-info/security-fast-lanes | 1440 | -5.8 % / -129 | -3.0 % (-67 px) / -67 px | Noord-Amerika | C -26, D -52, R +11 |
| /es/es/flying-with-us/our-fleet/airbus-a330 | 1440 | -3.5 % / -116 | -3.5 % (-116 px) / -116 px | Detalles técnicos | C -116, D +32, R -32 |
| /es/es/plan-your-trip/airport-info/lhg-hub-airport-info | 1440 | -4.1 % / -40 | -4.1 % (-40 px) / -40 px | Aeropuertos del Lufthansa Grou | B -80, R +40 |
| /be/en/extra-services/seat-reservation | 1440 | -1.3 % / -127 | +2.6 % (+143 px) / +157 px | Do you have further questions? | A +96, B -192, C -45, D +176, R +108 |
| /be/en/extra-services/lounges/kinshasa-ndjili-airport-lounge | 1440 | -3.0 % / -169 | -0.7 % (-39 px) / -51 px | Taking pets into lounges | C -123, D +64, R +20 |
| /es/es/book-a-flight/groups-and-charter/meetings-and-events | 1440 | -1.9 % / -42 | -1.9 % (-42 px) / -42 px | Viajes en grupo | C -52, D +64, R -53 |
| /th/en/homepage | 1440 | +0.9 % / +31 | +1.9 % (+63 px) / +63 px | Looking for more than just a f | A -520, D -94, R -1893 |
| /de/de/check-in-options-and-info/online-check-in-options | 1440 | -5.5 % / -211 | -2.3 % (-87 px) / -87 px | Wissenswertes | D -80 |
| /es/es/flying-with-us/our-fleet/airbus-a330 | 390 | -5.1 % / -116 | -5.1 % (-116 px) / -116 px | Detalles técnicos | C -116, D +32, R -32 |
| /be/en/extra-services/seat-reservation | 390 | -1.2 % / -156 | +0.8 % (+71 px) / +81 px | Do you have further questions? | B -192, C -45, D +184, R +124 |
| /es/es/book-a-flight/groups-and-charter/meetings-and-events | 390 | -1.6 % / -47 | -1.6 % (-47 px) / -47 px | Viajes en grupo | C -52, D +64, R -58 |
| /de/de/check-in-options-and-info/online-check-in-options | 390 | -5.1 % / -285 | -1.2 % (-67 px) / -68 px | Verwandte Themen | D -62 |

## Within 3 % and 40 px (26)

| page | width | main's rules: vs host / heading | new rules: vs host / heading | heading | causes (px) |
| --- | --- | --- | --- | --- | --- |
| /be/nl/book-a-flight/our-destinations/island-destinations | 1440 | -0.1 % / +12 | +0.6 % (+12 px) / +12 px | Ontdek onze eilandbestemmingen | D +32, R -20 |
| /es/es/legal-notices/imprint | 1440 | +0.0 % / +0 | +0.0 % (+0 px) / +0 px |  |  |
| /be/fr/flying-with-us/our-fleet | 1440 | -0.8 % / -4 | -0.8 % (-4 px) / -4 px | Airbus A319 |  |
| /de/de/book-a-flight/rebook/voluntary-rebooking | 1440 | -0.6 % / -31 | -0.3 % (-14 px) / -14 px | Benötigen Sie Hilfe? | C -26, D +32, R -20 |
| /es/es/book-a-flight/rebook/voluntary-rebooking | 1440 | -0.6 % / -31 | -0.3 % (-14 px) / -14 px | ¿Necesitas ayuda? | C -26, D +32, R -20 |
| /de/de/extra-services/seat-reservation/faq-seat-reservation/refund | 1440 | +2.2 % / +0 | +2.2 % (+20 px) / +0 px |  | C +20 |
| /be/en/book-a-flight/rebook/voluntary-rebooking | 1440 | -0.6 % / -31 | -0.3 % (-14 px) / -14 px | Need help? | C -26, D +32, R -20 |
| /gn/en/homepage | 1440 | +0.9 % / +31 | +0.9 % (+31 px) / +31 px | Looking for more than just a f | A +216, D +26, R +1829 |
| /be/nl/articles/tenerife | 1440 | -0.2 % / +0 | -0.2 % (-11 px) / +0 px |  | E -11 (the local render against the host) |
| /be/fr/travel-classes/premium-economy | 1440 | +0.2 % / +34 | +0.2 % (+8 px) / +34 px | Relaxez-vous de la tête aux pi | D +32, R -18 |
| /bf/en/local-page/an-unforgettable-reunion | 1440 | -1.6 % / -83 | -0.6 % (-31 px) / -31 px | Connecting the World: Explore  | D -20, E -11 (the local render against the host) |
| /be/nl/book-a-flight/our-destinations/island-destinations | 390 | +0.0 % / +16 | +0.9 % (+16 px) / +16 px | Ontdek onze eilandbestemmingen | D +32, R -16 |
| /es/es/legal-notices/imprint | 390 | +0.0 % / +0 | +0.0 % (+0 px) / +0 px |  |  |
| /be/nl/plan-your-trip/airport-info/security-fast-lanes | 390 | -1.8 % / -49 | -0.4 % (-10 px) / -10 px | Europa | C -26, R +16 |
| /be/fr/flying-with-us/our-fleet | 390 | -0.3 % / -4 | -0.3 % (-4 px) / -4 px | Airbus A319 |  |
| /de/de/book-a-flight/rebook/voluntary-rebooking | 390 | -0.2 % / -21 | -0.1 % (-10 px) / +16 px | Mehr Flexibilität für jede Rei | C -26, D +32, R -16 |
| /es/es/book-a-flight/rebook/voluntary-rebooking | 390 | -0.3 % / -21 | -0.1 % (-10 px) / +16 px | Vuela como más te convenga | C -26, D +32, R -16 |
| /es/es/plan-your-trip/airport-info/lhg-hub-airport-info | 390 | -1.0 % / -20 | -1.0 % (-20 px) / -20 px | Aeropuertos del Lufthansa Grou | B -40, R +20 |
| /de/de/extra-services/seat-reservation/faq-seat-reservation/refund | 390 | +1.4 % / +0 | +1.4 % (+20 px) / +0 px |  | C +20 |
| /be/en/book-a-flight/rebook/voluntary-rebooking | 390 | -0.3 % / -21 | -0.1 % (-10 px) / +16 px | Fly on your terms | C -26, D +32, R -16 |
| /be/en/extra-services/lounges/kinshasa-ndjili-airport-lounge | 390 | -2.5 % / -129 | -0.2 % (-11 px) / -27 px | Taking pets into lounges | C -123, D +64, R +48 |
| /gn/en/homepage | 390 | -0.5 % / -22 | -0.5 % (-22 px) / -22 px | Looking for more than just a f | A +504, D +77, R +2303 |
| /th/en/homepage | 390 | -0.5 % / -22 | -0.5 % (-22 px) / -22 px | Looking for more than just a f | D -16 |
| /be/nl/articles/tenerife | 390 | -0.3 % / +0 | -0.3 % (-16 px) / +0 px |  | E -16 (the local render against the host) |
| /be/fr/travel-classes/premium-economy | 390 | +0.2 % / +34 | +0.2 % (+8 px) / +34 px | Relaxez-vous de la tête aux pi | D +32, R -18 |
| /bf/en/local-page/an-unforgettable-reunion | 390 | -4.9 % / -212 | -0.7 % (-32 px) / -33 px | Best offers | D -10, E -22 (the local render against the host) |

## Before the pass

- The brand's switch (`THEMES.brussels.live`) ships in the same release as this pass, never apart (agreed). Nothing is switched here.
- The harness runs `marker-collapse-cli.mjs --content <DA copy> --brand brussels --force` on DA's documents. The workspace's 1,070 changed paths are in collapse-lh-brussels-paths.txt, in release order; DA's may differ.
- Measured with main at f682c697 plus these rules (56b60faf, before its rebase); the brand-theme commits that came later (the brief after 505) are not in these numbers.
