# Why our text measured about 1.4 % narrower than www's (brief 539 item 3)

ema-adobe, 2026-11-09. **The cause is our capture browser, not the site.** No code changed. Every number below was
measured on our hosts and on the recordings we hold; no request went to www.

## What I checked

| suspect | result |
| --- | --- |
| the font files | the same. Our host serves `mausy-v1.40.1/…/LufthansaTextWeb-Regular.woff2` (sha256 d9f86fb0…), byte for byte the file in www's own copy (lh-parity-003 html/fonts). www's page CSS lists `releases/latest/…/LufthansaTextWeb-Regular.woff` first; that file is identical to v1.40.1's woff (d181e905…). Both measure the same: "Discover the special services at the six" at 18 px is 291 px wide in both, and the bold 14 px legal links are the same too (logs/b539/fontw.cjs) |
| fallback metrics, size-adjust | not involved. `lufthansatext-fallback` (Arial at 98 %) only draws before the web font loads; our captures and the recordings both wait for `document.fonts` ("fonts": "loaded" in every capture.json) |
| letter-spacing | none on running text, on www (mausy lufthansa.css: only form inputs and a CTA wrapper) or ours (`--body-letter-spacing` unset for lufthansa.com) |
| the font-display swap moment | not involved: the recordings were taken after the fonts loaded (above) |
| kerning, ligatures, `text-rendering: optimizeLegibility` / `optimizeSpeed` | no change: 291 px each |
| **`text-rendering: geometricPrecision`** | **295.41 px**: fractional glyph advances |

Our captures run in headless Chromium on Linux, which rounds every glyph's advance to whole pixels (hinted, no
subpixel positioning): 291.00 px, an integer. The recording browser (the capture child's headful Chrome) lays text out
with fractional advances: www's line is 292 px of ink, a 295 px advance, the unrounded width. That difference, 1.4 %,
is the whole gap. The same font, at the same size, on the same site, would measure the same way on www.

## The proof

The same published pages, captured again with fractional advances (a measurement-only stylesheet,
`logs/b539/geo.css`: `text-rendering: geometricPrecision` on every element, injected by capture-d `--css`; not site
code):

| page | width | integer advances (the old captures) | fractional advances |
| --- | --- | --- | --- |
| /gb/en/airport-information | 390 | 25.4 % (the intro one line short, every card 27 px higher) | **7.8 %**; the intro has 5 lines as on www, the first picture at 455 px as on www |
| /de/de/lufthansa-reiseklassen, footer legal row | 390 | 4 rows ("Passagierrechte" and "Erklärung zur Barrierefreiheit" on one), -41 px | **5 rows, the same breaks and widths as www's** (311, 145, 223, 345 px) |

So the font-width difference and the footer's 41 px are not on the site. From now on our parity captures use the
fractional-advance stylesheet, so that we compare like with like; the hub numbers of item 4 are taken that way.

## Left

- Nothing on the site. If a real visitor's browser lays text out the way our capture machine does (Linux desktop with
  hinting), it does so for www too.
- One small offset seen on the way: our footer's legal links start 5 px right of www's (x 31 vs 26 at 390). That is
  less than a line, so it isn't in the page heights.
