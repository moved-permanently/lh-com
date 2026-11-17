# ITA Airways: the unrecorded pages (standing order 42, item 2)

ema-lufthansa, 2026-11-17, about 11:40 to 14:00 UTC. Every figure was taken as served on ita.turnsthe.page, main as deployed, in full Chrome with airline hosts refused per request. Nothing was uploaded, previewed or published, and nothing was read from or written to DA.

## Documents checked

- **Indexed pages.** ITA's 66 markets each have their own search index, 13,631 indexed pages in all. They come down to 2,455 distinct documents per language:
  - en 301, it 311, es 268, fr 268, nl 270, pt 267, ja 267, de 255, el 248;
  - each rendered from its language's main market (it/en, it/it, es/es, fr/fr, nl/nl, br/pt, gr/el, jp/ja, de/de), or from the first market that has it;
  - with each main market's nav and footer: 2,473 documents. The order counted 2,573.
- **Render.** 390 and 1440: 4,946 page-widths. One load that failed (xx/pt support/utilities) was measured again and passes.
- **Market copies.** All 11,176 other market copies were fetched (every `.plain.html` answered 200) and compared with their language document by structure. They were not rendered one by one: a copy with the same structure renders through the same blocks.

## Market copies against their language document

There are 11,176 copies:

- **Same:** 8,582.
- **Different:** 2,594.
  - About 82 per English market (ae/en, al/en, ar/en, au/en, br/en, ca/en, ch/en, ve/en and so on), fewer in the other languages.
  - Almost all of them lack blocks that the language document has: Accordion Columns 2,497 times, Carousel Cards 1,562, Columns Media 276, Table Striped 209, column bands 101, profile tabs 84.
  - Example: ae/en accessible-travel-us is half the size of it/en's and lacks the second accordion.
  - The most common shapes: section count only (626), one accordion fewer (524), three accordions fewer (393), one card grid fewer (331).
- **www.** No ITA market copy is recorded on www (the recordings cover the language documents only), so these are not ruled here. Where a copy lacks a block its language document has, the gap is in DA's copy, not in the rendering.

## No-breakage render, by class

| class | documents | what it is | row or rule |
|---|---|---|---|
| unknown blocks, horizontal overflow | 0 | | |
| broken pictures | 1 | de/de required-documents-families-and-children at 390: a transient load failure; all 3 pictures load when measured again | none |
| no H1 | 155 | 94 profile pages and 9 bookinglist pages (the account area's apps), 18 nav and footer fragments, 2 modals, 9 help-and-contact pages (www has no H1 there either: ita-parity-003, -007, -008, -011), 9 homepages (the hero is not a heading), and the login, registration and feedback apps, two smart-destination-search apps and al/it homepage-new | none |
| more than one H1 | 34 (17 with 2, 14 with 3, 1 with 4, 1 with 9, 1 with 10) | residents-in-sicily (3, in 8 languages), upgrade-terms-and-conditions (2, in 8), local pages (sea-destinations 9 and 10, summer-destinations 3, the partner pages 2), star-alliance (2); the one with a www recording (it/en residents-in-sicily) carries exactly www's 3 | no row: www's own structure where recorded |
| empty closing section | 360 end with DA's `<div></div>` (the render counts an empty section on 356 documents) | in a 40-document sample, removing it takes 38 px from most pages (up to 48; 691 on smart-destination-search, whose only section it is) | none: on the 11 recorded pages among them, removing it takes 7 more than 0.5 points further from www at 1440, so it does the job of www's end gap there, and a document row cannot remove it at one width only. The ITA theme also reads it (ita.css, `.section.grey.gap-after-small + .section:last-child:empty`) |
| other empty sections | 22 | market-scoped sections empty in this market, tab markers, an empty spacer block | none: by design |
| words in the plain not in main | 423 | all configuration, hidden by design, or a check artifact: flight-search, booking-lookup, flight-status, destination-finder, car-rental and form settings, the profile and bookinglist apps' settings, market-scoped sections (57), video links (player label, subtitle and audio-description tracks), the `&#x3C;` entity in the cookie-policy tables, and Greek headings set in capitals (a final sigma lowercases differently once words are joined) | no row: no reader text lost |

## What is left

- The order counted 2,573 documents. The other 100 are not in any search index, so they could not be found without listing DA.
- The 2,594 market copies that differ from their language document are listed by class only: no www recording exists to rule them.
