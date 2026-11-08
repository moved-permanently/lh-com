# SWISS markets's collapse pass: a check before the switch (the brief after 503, item 2)

16 pages of the SWISS markets documents the collapse changes (templates in proportion, each at least once: info 7, homepage 5, hub 1, fleet 1, app-entry 1, none 1), each at 1440 and 390, rendered three ways (`logs/p4/s504/pass-cmp.mjs`, as ITA's check):

- **host**: swiss.turnsthe.page today (DA's documents as published, markers, theme off);
- **local**: the same published documents (the host's `.plain.html`, its page metadata as a Metadata block), today's code, `aem up --html-folder`; it renders as the host (where not, "E" below);
- **collapsed + live**: those documents through `marker-collapse.mjs --force` (brand swiss), the brand's theme forced on in the browser only (scripts/style-markers.js answered with `live: true`; the repository's switch stays off).

Flagged: the page more than 3 % taller or shorter than the host, or a heading more than 40 px off. "main's rules" is the collapse and theme as on main before this brief; "with the new theme rules" the ones this brief adds (below). Causes, from the element-by-element comparison (`logs/p4/s504/classify.mjs`, px, estimates: margins collapse): **A** text width, **B** column views (the marks' boxes and paddings), **C** separators (0-31 px go), **D** heading sizes, **R** the rest (block layouts, wrapping), **E** the local render of the published document already differs from the host (before the collapse).

The 474 documents of SWISS's markets (lh-swiss-mk) the collapse changes; in DA on the lh-swiss site, served from
swiss.turnsthe.page.

## Fixed (ours)

- **Flow pages set their H2s in heading-small** (63 % of the markets' H2s).
- **The collapse weighs headings against the page type the site will see.**

## What is left, by cause

- **E, the homepages.** Every market homepage renders 47 px (1440) and 90 px (390) differently locally than on the
  host before the collapse (not the pass); the pass itself moves them by +16 to +66 px (A: a paragraph's width).
- **D, headings in blocks one step from the default.** prepare-lxmas-2024 (+9.2 %, +345 px): its Columns Media
  headings in heading-small become the blocks' default heading-medium (the page is no flow page).
- **C, small separators.** compensation-voucher-conditions (-117 px), flights (-26 px).
- **ski-campaign** (-2.7 % / -5.4 %): text width (A), column views (B), separators (C) and heading sizes (D) together.
- **ru/de homepage**: the host's document differs from the local copy's render by 273 px (E).


## The pages over the thresholds (with the new theme rules: 18 of 32 page widths; with main's rules 19)

On average a page is 2.3 % off the host in height and its worst heading 60 px (main's rules: 2.9 %, 67 px).

| page | width | main's rules: vs host / heading | new rules: vs host / heading | heading | causes (px) |
| --- | --- | --- | --- | --- | --- |
| /gb/en/ski-campaign | 1440 | -2.7 % / -138 | -2.7 % (-101 px) / -138 px | From the Airport to the Powder | A +44, B -64, C -31, D +56, R -99 |
| /kr/ko/book-and-manage/flights | 1440 | -7.1 % / +0 | -7.1 % (-58 px) / +0 px |  | C -26, R -32 |
| /kr/ko/book-and-manage/conditions/compensation-voucher-conditions | 1440 | +11.8 % / +214 | -2.2 % (-45 px) / -45 px | 10. 최종 조항 | C -117, R +72 |
| /us/fr/homepage | 1440 | -8.4 % / -47 | +0.5 % (+16 px) / -47 px | Greatness is a Group effort | A +66, E -50 (the local render against the host) |
| /il/de/homepage | 1440 | +0.5 % / -47 | +0.5 % (+19 px) / -47 px | Flugmodus an. Verbindung steht | A +66, E -47 (the local render against the host) |
| /th/en/homepage | 1440 | -0.1 % / -47 | -0.1 % (-3 px) / -47 px | Student offer | A +44, E -47 (the local render against the host) |
| /nl/de/homepage | 1440 | +0.5 % / -47 | +0.5 % (+19 px) / -47 px | Flugmodus an. Verbindung steht | A +66, E -47 (the local render against the host) |
| /ru/de/homepage | 1440 | +14.4 % / -47 | +14.4 % (+317 px) / -47 px | Flugmodus an. Verbindung steht | A +44, E +273 (the local render against the host) |
| /al/fr/prepare-lxmas-2024 | 1440 | +9.2 % / +345 | +9.2 % (+342 px) / +345 px | Teaser HP | D +405, R -60 |
| /gb/en/ski-campaign | 390 | -5.4 % / -145 | -5.4 % (-155 px) / -145 px | Your journey starts here | B -64, C -31, D +52, R -89, E -23 (the local render against the host) |
| /kr/ko/book-and-manage/flights | 390 | -4.3 % / +24 | -4.3 % (-51 px) / +24 px | 고급 검색 | C -26, R -49, E +24 (the local render against the host) |
| /kr/ko/book-and-manage/conditions/compensation-voucher-conditions | 390 | +0.9 % / +27 | -1.3 % (-46 px) / -46 px | 10. 최종 조항 | C -117, R +72 |
| /us/fr/homepage | 390 | -1.8 % / -91 | -1.8 % (-91 px) / -91 px | Envie de plus qu’un simple vol | R -78, E -91 (the local render against the host) |
| /il/de/homepage | 390 | -1.9 % / -90 | -1.9 % (-90 px) / -90 px | Suchen Sie mehr als nur einen  | E -90 (the local render against the host) |
| /th/en/homepage | 390 | -2.1 % / -90 | -2.1 % (-90 px) / -90 px | Looking for more than just a f | E -90 (the local render against the host) |
| /nl/de/homepage | 390 | -1.9 % / -90 | -1.9 % (-90 px) / -90 px | Suchen Sie mehr als nur einen  | E -90 (the local render against the host) |
| /ru/de/homepage | 390 | -2.2 % / -91 | -2.2 % (-90 px) / -91 px | Aktuelle Themen und Neuigkeite | E -90 (the local render against the host) |
| /al/fr/prepare-lxmas-2024 | 390 | +5.8 % / +334 | +5.8 % (+330 px) / +334 px | Teaser HP | D +333 |

## Within 3 % and 40 px (14)

| page | width | main's rules: vs host / heading | new rules: vs host / heading | heading | causes (px) |
| --- | --- | --- | --- | --- | --- |
| /kr/ko/prepare/special-care/health-and-travel | 1440 | +3.3 % / +57 | +0.0 % (+0 px) / -23 px | 원인 |  |
| /kr/ko/fly/flight-information/flight-irregularities/faq | 1440 | -1.9 % / +0 | -1.9 % (-10 px) / +0 px |  | C -10 |
| /al/it/customer-support/travel-and-corona/excemption-mouth-nose-cover | 1440 | +0.0 % / +0 | +0.0 % (+0 px) / +0 px |  |  |
| /kr/ko/book-and-manage/corporate-customers/group-travel-and-charter/group-travel | 1440 | +2.8 % / +49 | -2.1 % (-37 px) / +12 px | SWISS.com의 단체 필수 조건 | C -26, D -29, R +20 |
| /kr/ko/offers | 1440 | -0.1 % / -1 | -0.1 % (-1 px) / -1 px | 최저 특가 |  |
| /kr/ko/fly/check-in/online-check-in | 1440 | +1.2 % / +31 | +1.2 % (+30 px) / +31 px | 자동 체크인 | D +58, R -21 |
| /us/en/local-pages/baggage-and-other-fees | 1440 | +0.0 % / +17 | +0.0 % (+0 px) / +17 px | Travelling with animals |  |
| /kr/ko/prepare/special-care/health-and-travel | 390 | +0.5 % / +20 | +0.0 % (+0 px) / -23 px | 원인 |  |
| /kr/ko/fly/flight-information/flight-irregularities/faq | 390 | -1.2 % / +0 | -1.2 % (-10 px) / +0 px |  | C -10 |
| /al/it/customer-support/travel-and-corona/excemption-mouth-nose-cover | 390 | -0.1 % / +0 | -0.1 % (-1 px) / +0 px |  |  |
| /kr/ko/book-and-manage/corporate-customers/group-travel-and-charter/group-travel | 390 | +1.7 % / +36 | -2.2 % (-46 px) / +12 px | SWISS.com의 단체 필수 조건 | C -26, D -38, R +20 |
| /kr/ko/offers | 390 | -0.2 % / -2 | -0.2 % (-3 px) / -2 px | 최저 특가 |  |
| /kr/ko/fly/check-in/online-check-in | 390 | +0.2 % / +13 | +0.2 % (+7 px) / +13 px | 자동 체크인 | D +20 |
| /us/en/local-pages/baggage-and-other-fees | 390 | +0.0 % / +17 | +0.0 % (+0 px) / +17 px | Travelling with animals |  |

## Before the pass

- The brand's switch (`THEMES.swiss.live`) ships in the same release as this pass, never apart (agreed). Nothing is switched here. SWISS has one switch for its three workspaces (the markets, the sub-sites, the FAQ and baggage pages): their passes go together.
- The harness runs `marker-collapse-cli.mjs --content <DA copy> --brand swiss --force` on DA's documents. The workspace's 474 changed paths are in collapse-lh-swiss-mk-paths.txt, in release order; DA's may differ.
- Measured with main at f682c697 plus these rules (56b60faf, before its rebase); the brand-theme commits that came later (the brief after 505) are not in these numbers.
