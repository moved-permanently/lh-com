# ITA it/en online check-in: the Quick Links beside the h1 (the brief after 479, item 4)

**Document change for the harness:** `/it/en/book-and-prepare/travel-information/check-in-information/online-check-in`
(lh-ita, DA). Nothing else in the document changes.

## Why

The market passes of 2026-11-07 left this version document in sections of its own. Two of them are markets-only, so they
cannot be merged: one accordion for every root but ten, the other for those ten. DA's copy, read on 2026-11-08, has these
sections:

| # | content | Style | Markets |
| --- | --- | --- | --- |
| 0 | picture | – | – |
| 1 | h1 | flush | – |
| 2 | intro text | flush | – |
| 3 | accordion-columns faq | flush | -au/en, -be/en, -bg/en, -eg/en, -gh/en, -hr/en, -il/en, -in/en, -mt/en, -mv/en |
| 4 | accordion-columns faq | flush | au/en, be/en, bg/en, eg/en, gh/en, hr/en, il/en, in/en, mt/en, mv/en |
| 5 | columns-media grey (seat teaser) | flush | – |
| 6 | cards-teaser (Quick Links) | sidebar-aside | – |
| 7 | carousel-cards (Related) | – | the 35 English roots |

scripts/section-aside.js joins the Quick Links with the section right before them only (5). So the box stands beside the
seat teaser (y 1278 at 1440), not beside the h1 as on www.

## The change

Add `sidebar-part` to the Style of sections 2 to 5, keeping `flush` and the Markets rows: `Style: flush, sidebar-part`.
section-aside.js then joins sections 1 to 5 as parts of one section beside the Quick Links. dropOtherMarkets runs first, so
each root keeps only its own accordion.

This needs this round's rule in styles/themes/ita.css ("a section with the Quick Links whose first part opens with the h1"). It gives a section with the
aside whose first part opens with the h1 www's space above it: 26 px from 768 px, 6 px below.

Simulated on ita.turnsthe.page (the page's HTML rewritten in flight, the rule injected):

| | www | ours now | with the change |
| --- | --- | --- | --- |
| h1, 1440 | 675 | 649 | 675 |
| h1, 390 | 372 | 366 | 372 |
| Quick Links, 1440 | beside the h1 | y 1278 | y 675, beside the h1 |
| page height, 1440 | 3069 | 3052 | 2976 |

The page is shorter with the change because the content runs three quarters wide beside the box, as on www.

## Not proposed

`/it/en/book-and-prepare/travel-information/baggage/carry-on-baggage` has the same split: its h1 section is section 0, and
five sections sit between it and the Quick Links. There, though, the h1 section also holds the breadcrumb. Joining parts
would move the breadcrumb into the content's column, so a document change alone does not fix that page. It is left as it is.
