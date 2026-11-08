# SWISS sub-sites's collapse pass: a check before the switch (the brief after 503, item 2)

12 pages of the SWISS sub-sites documents the collapse changes (templates in proportion, each at least once: info 12), each at 1440 and 390, rendered three ways (`logs/p4/s504/pass-cmp.mjs`, as ITA's check):

- **host**: swiss.turnsthe.page today (DA's documents as published, markers, theme off);
- **local**: the same published documents (the host's `.plain.html`, its page metadata as a Metadata block), today's code, `aem up --html-folder`; it renders as the host (where not, "E" below);
- **collapsed + live**: those documents through `marker-collapse.mjs --force` (brand swiss), the brand's theme forced on in the browser only (scripts/style-markers.js answered with `live: true`; the repository's switch stays off).

Flagged: the page more than 3 % taller or shorter than the host, or a heading more than 40 px off. "main's rules" is the collapse and theme as on main before this brief; "with the new theme rules" the ones this brief adds (below). Causes, from the element-by-element comparison (`logs/p4/s504/classify.mjs`, px, estimates: margins collapse): **A** text width, **B** column views (the marks' boxes and paddings), **C** separators (0-31 px go), **D** heading sizes, **R** the rest (block layouts, wrapping), **E** the local render of the published document already differs from the host (before the collapse).

The 186 documents of the SWISS sub-sites (corporate, medical services) the collapse changes; they live on the lh-swiss
site in DA and are served from swiss.turnsthe.page.

## Fixed (ours)

- **Flow pages set their H2s in heading-small** (79 % of the sub-sites' H2s; 12 % copytext-large keep their style).
- **The collapse weighs headings against the page type the site will see.**

Of the 24 page widths 5 were over the thresholds with main's rules, 4 are now; on average a page is 1.2 % off.

## What is left, by cause

- **C, small separators** and **D, one-step heading sizes**: the two media-request success pages lose a 26 px
  separator (-4 % of a short page); the careers pages' H3s one step from the default (diversity -44 px,
  experience-day).


## The pages over the thresholds (with the new theme rules: 4 of 24 page widths; with main's rules 5)

On average a page is 1.2 % off the host in height and its worst heading 14 px (main's rules: 1.2 %, 11 px).

| page | width | main's rules: vs host / heading | new rules: vs host / heading | heading | causes (px) |
| --- | --- | --- | --- | --- | --- |
| /corporate/fr/media/media-request-form/media-request-form-success | 1440 | -4.0 % / +0 | -4.0 % (-26 px) / +0 px |  | C -26 |
| /corporate/de/careers/working-at-swiss/our-culture | 1440 | -0.8 % / -65 | -0.8 % (-21 px) / -65 px | Carlos Clemente, Application E | E -21 (the local render against the host) |
| /corporate/de/media/media-request-form/media-request-form-success | 1440 | -4.0 % / +0 | -4.0 % (-26 px) / +0 px |  | C -26 |
| /corporate/de/careers/working-at-swiss/our-culture | 390 | -0.5 % / -65 | -0.5 % (-21 px) / -65 px | Carlos Clemente, Application E | E -21 (the local render against the host) |

## Within 3 % and 40 px (20)

| page | width | main's rules: vs host / heading | new rules: vs host / heading | heading | causes (px) |
| --- | --- | --- | --- | --- | --- |
| /medicalservices/de/health/passengers-with-disabilities/seating-on-board | 1440 | +0.0 % / +0 | +0.0 % (+0 px) / +0 px |  |  |
| /corporate/fr/careers/working-at-swiss/work-environment | 1440 | +1.4 % / +0 | +0.0 % (+0 px) / +0 px |  |  |
| /corporate/de/careers/information-events/experience-day | 1440 | +3.6 % / +21 | -2.6 % (-37 px) / -36 px | Ablauf - Erlebnistag Technik | C -26, D -29, R +20 |
| /corporate/en/careers/working-at-swiss/diversity | 1440 | -0.5 % / +3 | -2.3 % (-37 px) / -29 px | Combining work and family | D +139, R -176 |
| /corporate/en/careers/professional-fields/professions-on-ground | 1440 | -0.4 % / +0 | -0.4 % (-7 px) / +0 px |  |  |
| /corporate/fr/company/about-us/company-profile | 1440 | +0.0 % / +0 | +0.0 % (+0 px) / +0 px |  | D -89, R +89 |
| /medicalservices/en/health/medical-equipment-and-care/inflight-medical-support-from-ground | 1440 | +0.0 % / +0 | +0.0 % (+0 px) / +0 px |  |  |
| /medicalservices/de/aviation/during-the-flight/earache | 1440 | +0.0 % / +0 | +0.0 % (+0 px) / +0 px |  |  |
| /medicalservices/en/aviation/before-the-flight/fear-of-flying | 1440 | +1.0 % / -18 | -1.6 % (-18 px) / -18 px | "Fit to fly" seminars: fear of | C -26, R +8 |
| /corporate/fr/media/media-request-form/media-request-form-success | 390 | -2.8 % / +0 | -2.8 % (-29 px) / +0 px |  | C -26 |
| /medicalservices/de/health/passengers-with-disabilities/seating-on-board | 390 | +0.0 % / +0 | +0.0 % (+0 px) / +0 px |  |  |
| /corporate/fr/careers/working-at-swiss/work-environment | 390 | +1.4 % / +37 | +0.0 % (+0 px) / +0 px |  |  |
| /corporate/de/careers/information-events/experience-day | 390 | +2.6 % / -6 | -1.5 % (-24 px) / -25 px | Ablauf - Erlebnistag Technik | C -26, D -13, R +20 |
| /corporate/en/careers/working-at-swiss/diversity | 390 | +0.3 % / +16 | -1.1 % (-29 px) / -37 px | Combining work and family | D +190, R -219 |
| /corporate/de/media/media-request-form/media-request-form-success | 390 | -2.9 % / +0 | -2.9 % (-29 px) / +0 px |  | C -26 |
| /corporate/en/careers/professional-fields/professions-on-ground | 390 | -0.2 % / -7 | -0.2 % (-7 px) / -7 px | Dream job aircraft technician |  |
| /corporate/fr/company/about-us/company-profile | 390 | +0.0 % / +0 | -2.0 % (-38 px) / -38 px | Kloten (Zurich) | D -38 |
| /medicalservices/en/health/medical-equipment-and-care/inflight-medical-support-from-ground | 390 | +0.0 % / +0 | +0.0 % (+0 px) / +0 px |  |  |
| /medicalservices/de/aviation/during-the-flight/earache | 390 | +0.0 % / +0 | +0.0 % (+0 px) / +0 px |  |  |
| /medicalservices/en/aviation/before-the-flight/fear-of-flying | 390 | +1.6 % / -18 | -1.1 % (-18 px) / -18 px | "Fit to fly" seminars: fear of | C -26, R +8 |

## Before the pass

- The brand's switch (`THEMES.swiss.live`) ships in the same release as this pass, never apart (agreed). Nothing is switched here. SWISS has one switch for its three workspaces (the markets, the sub-sites, the FAQ and baggage pages): their passes go together.
- The harness runs `marker-collapse-cli.mjs --content <DA copy> --brand swiss --force` on DA's documents. The workspace's 186 changed paths are in collapse-lh-swiss-sub-paths.txt, in release order; DA's may differ.
- Measured with main at f682c697 plus these rules (56b60faf, before its rebase); the brand-theme commits that came later (the brief after 505) are not in these numbers.
