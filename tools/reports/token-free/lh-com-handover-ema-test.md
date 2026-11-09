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
It stays so (brief 515: Ben's rule answers it, see item 6). Nothing left.

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

## 6. decisions.md: the two answers of brief 515 (ema-test's file)

Brief 515 answered the pass check's two questions by Ben's rule, so neither goes back to him. The exact lines for
tools/reports/token-free/decisions.md, after its paragraph "**lufthansa.com's column views have a carrier of their
own** ...":

```markdown
6. **lufthansa.com's column view carrier is on every page type** (hub, info, legal, fleet, campaign: wherever the
   cleanup wrote column marks), as the collapse writes it for brand lufthansa. Reason: the carrier is the brand's
   common style for www's column views, so one rule for the brand; a hub-only condition would itself be an exception
   (the theme's page types can't tell hub from fleet or legal pages). Measured in lh-com-pass-check.md: info 0.9 %
   mean height difference instead of 3.0 %, fleet 0.6 % instead of 0.8 %.
7. **Headings with www's limited width outside column views** take the text width (14 of 173 section H2s on
   lufthansa.com's www). Reason: the limited width is a near value of the text width, and a heading style for the
   minority would be an exception. Cost: miles-and-more's first H2 at 1440, 39 px.
```

and, in the carrier paragraph, "ema-adobe's hub transformer writes it on import" stays (the campaign template's
pages of one AEM section get it too since 142a2d2). No code changes: the collapse does both today.

## What ema-adobe changed on its side this brief

Nothing in the theme for the switch was needed in lufthansa.com's rule files beyond the carrier (brief 506): left are
items 2, 4, 5 and 6 above and other templates' (lh-com-pass-check.md); Ben's questions are answered (item 6).
