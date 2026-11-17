# SWISS: the unrecorded pages (standing order 42, item 2)

ema-lufthansa, 2026-11-17, about 14:05 to 18:55 UTC. Every figure was taken as served on swiss.turnsthe.page, main as deployed, in full Chrome with airline hosts refused per request. Two service restarts stopped the census (about 17:25 and 17:50 UTC); it resumed from its own files each time. Nothing was uploaded, previewed or published, and nothing was read from or written to DA.

## Documents checked

- **Pages.** SWISS's 227 market sitemaps list 67,370 pages. They come down to 3,196 distinct documents per language (each rendered from its language's main market: ch for de, en, fr and it; es/es, gr/el, jp/ja, kr/ko, pt/pt, ru/ru and cn/zh for the others, or the first market that has it):
  - en 374, fr 313, de 312, it 282, es 278, ko 275, pt 275, zh 275, ru 273, el 271, ja 268.
- **The rest.** The magazine's 955 documents (de 478, en 477, from its query indexes), and the nav and footer of each main market and of the magazine: 4,179 documents in all. The order counted 5,335.
- **Render.** 390 and 1440. All 4,178 documents with a page measured at both widths; 16 loads that failed (timeouts, and loads cut by the restarts) were measured again and pass.
- **List fix.** A first, parallel read of the sitemaps spliced 55 paths and lost 59. The list was rebuilt from a sequential read; the 6 documents it had missed were measured, and the 41 spliced paths are left out.
- **Market copies.** The other 64,174 market copies are not all compared: at about 4 s per answer the host could not serve them without slowing the census. A sample was compared by structure instead: every copy in twelve markets across the languages (de/de, at/de, us/en, gb/en, jp/en, kr/en, ru/en, in/en, fr/fr, ca/fr, it/it, br/pt), 3,696 copies (every `.plain.html` answered 200).

## Market copies against their language document (sample of 3,696)

- **Same:** 3,635.
- **Different:** 61, about five per market, and the same pages each time. They lack blocks the language document has: sidebar-aside (24), Cards Teaser (21), Accordion Columns (21), Columns Media (12).
- No SWISS market copy among them has a www recording, so they are not ruled here.

## No-breakage render, by class

| class | documents | what it is | row or rule |
|---|---|---|---|
| broken pictures, unknown blocks, horizontal overflow | 0 | | |
| a carousel slide whose text never shows | 1 document in 11 languages (and every market copy) | `discover/a350/special-livery`: in the Carousel Images block the St. Moritz slide has an empty picture cell. The block skips a row without a picture, so the slide and its paragraph ("St. Moritz, the Engadine resort steeped in tourist tradition…") do not render | HOLD, no row: the slide needs its picture from www (local content to import); the page is unrecorded, and the magazine article on the livery has no such carousel |
| no H1 | 184 | the homepages (11), the account area's apps (profile, login, feedback, help-center, fast-compensation, baggage-reimbursement, the fly-more-sustainably search, culinaryjourney), nav and footer fragments, modals; book-and-manage, customer-support and fly pages built around an app or form | none for the apps and fragments. The homepages: www's only H1 is a screen-reader "Swiss" in the page header (swiss-parity-001, -004 to -006), not in main; ours has none. A hidden H1 on the 11 homepages would match it, so it is left to the migration helper with DA's markup |
| more than one H1 | 399 (213 with 2, 133 with 3, 23 with 4, 10 each with 5, 6 and 10) | 436 Cards Teaser card titles imported as H1 (for example "Einchecken am Vorabend" on fly/airport/boarding) and 345 second H1s in default content; none of these documents is recorded, and no recorded SWISS page has a Cards Teaser | HOLD: a phone and desktop first load of ch/de fly/airport/boarding is requested (capture-requests-ema-lufthansa.txt) to see the level www gives teaser titles before any rule or rows |
| empty closing section | 1,076 end with DA's `<div></div>` (the render counts an empty section on 1,140 documents) | in a 40-document sample it takes no space on 37 pages at 390 and 38 at 1440 (24 px on two) | none: no visible effect |
| words in the plain not in main | 636 | all configuration, hidden by design, or a check artifact: forms (198), flight-search, micro-frontend, booking-lookup, destination-finder and flight-status settings, profile tabs, embed settings, search-result labels, video links (player label, subtitle and audio-description tracks), market-scoped sections, and the magazine's photo credits kept in alt text with `<br>`. The one real loss is the special-livery slide above | the special-livery row above |

## What is left

- The order counted 5,335 documents. The other 1,156 are not in any sitemap or the magazine indexes, so they could not be found without listing DA.
- The other 60,478 market copies, not compared.
- The special-livery picture (content to import), the homepages' hidden H1 (helper, DA markup), and the teaser H1 class (waits for the requested first loads).
