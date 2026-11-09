# lufthansa.com's pass check: what needs ema-test's files (brief 507 item 2)

ema-adobe, 2026-11-09. From the pass check in [lh-com-pass-check.md](lh-com-pass-check.md) (37 published lufthansa.com
documents, 10 page types, 1440 and 390, the collapse run read-only with `--force`, the theme forced live in the browser
only). Each item: the exact change, where, what it does on the sample, and the scratch that measured it (logs/b507, not
in git). Nothing here is changed in ema-test's files; ema-adobe's part is on main.

## 1. The chapter split reorders articles: done on main (6d1bb8a)

The handover asked for `splitAfter(last.parentElement, last, doc)` in `collapseSeparators`' `ruled-chapters` branch;
ema-test's 6d1bb8a (pushed during this brief) has each run work on its section as it is. Checked with main's collapse
as of 142a2d2 over the 296 published lufthansa.com documents of lh-parity-002a-d / -003 (logs/b507/reorder-count.mjs):
none out of order (the two /100-years pages it lists differ in shared lines the collapse rewrites before and after
the fix alike, not in order). In the pass check the worst heading shift on chiswick at 390 goes 1261 -> 310 px,
be-picky-barcelona 1619 -> 278. Nothing left.

## 2. /100-years: `sections-m` doubles the sections' spacing (style-markers.js)

`THEMES.lufthansa.pageTypes['100-years']: { rules: ['sections-m'] }` puts M (60 px) at the start of every section of a
/100-years page. lufthansa.com's /100-years documents are campaign pages: campaign-sections writes each of www's AEM
sections as a section of ours with www's spacing (campaign-section, spaced / flush, padded), and none of the
published /100-years documents starts a section with a separator (11 of 11, 63 of 63, 13 of 14 sections without). So
every section gets 61 px it doesn't have on www.

```js
-      '100-years': { rules: ['sections-m'] },
```

(and with it the collapse's `sections-m` branch has nothing to do; separators at a section's edge on these pages then
become the section's Space styles like on other pages). Measured with main's collapse as of 142a2d2, 1440 / 390,
height against today's published page:

| page | with sections-m | without |
| --- | --- | --- |
| /de/en/100-years | +8.9 / +6.3 % | -0.6 / -1.7 % |
| /de/en/100-years/chronicle | +9.4 / +7.6 % | -0.2 / -1.2 % |
| /de/en/100-years/global-network | +3.4 / +2.6 % | -2.2 / -2.3 % |

(the rule removed in the browser only: `logs/b507/pcb-variant.sh`, the theme's text patched as the live flag is).

## 3. Column views in existing documents: done on main (d1bd76e)

ema-test's d1bd76e writes the carrier in the collapse (`THEMES.lufthansa.columnViews.carrier = 'column-view'`,
`columnViewSections`), and the DA library offers "Column view". Measured with main's collapse as of 142a2d2 (1440 /
390, height against today's published page): miles-and-more de/en -6.9 / -4.1 % -> +0.4 / +0.5 %, de/de -6.7 / -3.7 %
-> +1.8 / +0.5 %, meetings-and-events de/de -10.7 / -2.2 % -> -0.5 / -0.1 %, as the mapping measured. It applies to
every lufthansa.com page type with column marks, not only hub pages: info 3.0 -> 0.9 % mean, fleet 0.8 -> 0.6 %.
Whether that stays is Ben's ([lh-com-pass-check.md](lh-com-pass-check.md), "For Ben" 1); if Ben limits it to hub
pages, the condition is ema-test's: the theme's page types (`pageTypeOf`, scripts/style-markers.js) tell `flow` (the
info pages, Theme flow-spacing) from `service` (hub, legal, fleet and campaign pages alike), and the documents carry no
template, so "not on `flow` pages" is the nearest condition (info back to decision 1; fleet's two pages keep the
carrier). Nothing else left.

## 4. Captions in block cells (token-free.js)

The collapse turns `{caption}` into the italic paragraph after the image (the carrier). `decorateCaptions` reads only a
section's own paragraphs (`main > div > p`); 36 of lufthansa.com's captions (12 pages; 28 more in sections) sit in
Columns Media cells. There the italic paragraph stays a paragraph: on-the-scene-food-trends-istanbul's info box
888 -> 1076 px at 390 (the three captions at body size instead of the caption style).

The change: in a block cell (`main > div > div[class] > div > div`), an italic paragraph right after an image paragraph
gets the class `caption` (what the `{caption}` marker gave the cell's paragraph before: columns-media.css styles
`p.caption`), the same test as for the section's paragraphs (`isCaptionParagraph`). Expected: the info box back to
888 px (host), food-trends 390 +3.8 % -> about 0.5 %.

## 5. The ruled chapters' divider before Related Articles (token-free.js)

`applyThemeRules`, `ruled-chapters`: a section whose first element starts a chapter gets a divider prepended. On
lufthansa.com's articles that includes the Related Articles section (its H3 "Related Articles"), which www draws
without a rule: +26 px on each article (flying-high-christoph-quarch, on-the-scene-food-trends-istanbul, the
pass check's articles). The change: not before a section that holds the related-articles block
(`section.querySelector(':scope > div.related-articles')`). Expected: those 26 px gone (flying-high +1.1 % -> about
+0.6 %).

## What ema-adobe changed on its side this brief

Nothing in the theme for the switch was needed in lufthansa.com's rule files beyond the carrier (brief 506): left are
items 2, 4 and 5 above, Ben's questions and other templates' (lh-com-pass-check.md).
