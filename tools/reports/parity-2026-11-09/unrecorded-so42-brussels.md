# Brussels: the unrecorded pages (standing order 42, items 2 and 3)

ema-lufthansa, 2026-11-17, about 09:30 to 11:35 UTC. Every figure was taken as served on brussels.turnsthe.page, main as deployed, in full Chrome with airline hosts refused per request. Nothing was uploaded, previewed or published, and nothing was read from or written to DA.

## Documents checked

- **1,450 served documents.** Brussels' documents live in six language versions: be/en, be/fr, be/nl, de/de, it/it and es/es. Every other market is served from them (lh-edge's market route).
  - Their sitemaps and search indexes list 1,438 pages; the articles indexes add none.
  - Each language's nav and footer add 12.
  - No page references a fragment.
  - The order counted 1,801 documents. The other 351 are documents that are not served as pages (none in a sitemap or index), so they could not be found without listing DA.
- **Plain copies.** Every `.plain.html` answered 200.
- **Widths.** 390 and 1440: 2,900 page-widths.

## Language copies against their source

be/fr, be/nl, de/de, it/it and es/es were compared with be/en, the source, by block sequence and variants, section count, headings by level and pictures per block. There are 1,162 copies with a source.

- **Same:** 1,026.
- **Different:** 136. By language: be/fr 36, be/nl 32, es/es 25, it/it 23, de/de 20.
  - blocks added: 29 (mostly `padded`, Accordion Columns, Columns Media, grey);
  - blocks dropped: 29 (mostly `padded`, spacers, Columns Media, column bands, fare teasers);
  - both added and dropped: 17;
  - section count only: 22;
  - headings: 20;
  - variants only: 17 (for example `columns-media` and `columns-media padded`, `hero-campaign right` and `hero-campaign right narrow`).
- **Recorded pairs.** Five of the 136 have both copy and source recorded on www:
  - legal-notices (be/fr) and es/es checked-baggage differ on www too;
  - be/fr connecting-africa, my-bookings and travel-classes differ only in section layout or a variant. My-bookings' extra section is order 41's live card row. All three are recorded pages, already covered by the parity lists.
- **Unrecorded pairs.** The other 131 are per-language layouts with no www reference. None of them is breakage in the render below, so none gets a row.

## No-breakage render, by class

| class | documents | what it is | row or rule |
|---|---|---|---|
| unknown blocks, horizontal overflow | 0 | | |
| broken pictures | 3 | be/en and be/fr contact: the help-center micro-frontend's picture comes from www's own host (refused here). it/it our-company/organisation: a transient load failure, all 8 pictures load when measured again | none: the contact pages run www's app, as check-in-times' deadlines do |
| no H1 | 76 | 60 profile pages (the account area: its apps draw the page once signed in), 12 nav and footer fragments, 2 modals (fragments), and the two contact pages, whose H1 sits in the micro-frontend's fallback | none |
| more than one H1 | 19 (11 with 2, 4 with 3, 1 with 4, 3 with 15) | local pages and offers (chase-the-sun-across-spain 15, offers, student-fares), destination, travel-regulations, beobank-navigator-mastercard; the 3 with a www recording carry exactly www's H1 count | no row: www's own structure |
| empty closing section | 230 | DA's own closing `<div></div>` (as order 41's DA copies show) | none: the theme's page-end rules read it (brussels.css, `:has(+ .section:last-child:empty)`). In a 40-document sample, removing it moves 21 pages at 390 (by 32 to 67 px) and 11 at 1440, so it is part of how the theme ends these pages |
| closing section with only a spacer | 11 | an authored spacer section at the page end | none: authored spacing |
| words in the plain not in main | 345 | all configuration or hidden by design: forms (85), price bars, carousel-lightbox labels, destination-finder and flight-search settings, booking-lookup and flight-status texts, the profile apps' settings, video paths and subtitle links in Columns Media, market-scoped sections (feedback-error's second message for ao and bf, us-traveling-with-disabilities' medical desk for ao, bf and gn, our-destinations' hidden heading for at and ch), and the `&#x3C;` entity in the pets tables | no row: no reader text lost |

## The closing related-topics band (item 3)

- **Census.** 411 documents close with a Carousel Cards grid right after an H2:
  - 396 are the related-topics band (347 with four cards, 32 with three, 17 with two);
  - 3 carry a similar title;
  - 12 are other card bands ("Book with peace of mind", "Discover our travel classes").
- **www.** On the 12 recorded pages that have the band on www at both widths, www's spacing differs page by page:
  - roomier than ours on checked-baggage in all six languages (+57 px at 1440, +122 at 390), bon (+69 / +90) and upgrades (+56 / +77);
  - tighter on travel-comfortably-from-lille (−16 / −78) and check-in-times (−27 / −73).
- **No page-end rule.** A rule giving checked-baggage www's band would take lille 1.8 points further at 1440, and upgrades about 2 points further.
- **Rows instead: delta-so42-brussels-related-topics-band, 7 rows, READY.**
  - Checked-baggage in its six languages gets www's band at both widths.
  - Bon gets it on phones only.
  - All 14 recorded page-widths are closer or within 0.5 points, and the drafts render without breakage.
  - finish-brussels.txt: de/de and it/it checked-baggage 390 (−2.03 % and −2.06 %, HOLD for this band) are now READY, at +0.42 % and +0.43 % once applied.
  - The rows reach the same pages in every market, all unrecorded.

## What is left

- The 351 documents of the order's count that no sitemap or index lists.
- Upgrades (be/en, be/fr) and the other roomier bands, where a row would take the page further from www.
