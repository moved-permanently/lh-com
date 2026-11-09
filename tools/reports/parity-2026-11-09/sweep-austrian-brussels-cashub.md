# The brief after 517: Austrian and Brussels against the recordings (ema-cashub)

The published pages of lh-austrian on austrian.turnsthe.page and of lh-brussels on brussels.turnsthe.page against the
www.austrian.com and www.brusselsairlines.com pages recorded in brief 497 (the austrian-parity-001 / -002a / -002b and
brussels-parity-001 / -002 archives), offline, at 1440 and 390 px: the page height, worst first by the larger difference
(the method of `tools/reports/parity-2026-11-08/sweep-swiss-cashub.md`).

- **Published:** Austrian 15,319 pages in the site's 64 sitemaps, Brussels 25,982 in its 98 (every market's copies).
- **Recorded:** Austrian 82 pages, all in the sitemaps. Brussels 83: 81 in the sitemaps; the other two
  (`/be/en|fr/check-in-options-and-info?country=BE&language=..`, a query the sitemaps don't list) answer 200 and are ranked too.
- **Not recorded:** listed, not guessed: `austrian-unrecorded.txt` (2,211 language documents without a recorded copy in
  any market, of 15,237 published pages without a recording) and `brussels-unrecorded.txt` (1,394, of 25,901), the market
  root dropped (at/de/x and de/de/x are one document).
- **Ours:** captured on austrian.turnsthe.page and brussels.turnsthe.page (the published pages). After values (→): a local
  dev server with this tree and the site's preview content (equal to the published pages before the change), for the CSS
  fixes; the importer and parser fixes need the harness's re-import, their effect measured by importing the recording
  offline and putting the changed block into the published document (local server, both copies).
- **Hosts:** austrian.turnsthe.page, brussels.turnsthe.page (pages, sitemaps, the documents' .plain.html), localhost. No
  request to www.austrian.com, www.brusselsairlines.com or any brand's www host from my scripts. One request I didn't make:
  after my edit of the carousel-images parser the editor's parser-validation hook opened
  https://www.lufthansa.com/de/en/flying-with-small-children in a local browser on its own (it reported "no results");
  the later parser and importer edits went through the shell, so it did not run again.

## Fixed (one row per commit)

| Commit | Brand | Row | Pages | 1440 | 390 |
| --- | --- | --- | --- | --- | --- |
| `ec7b6079` | Austrian | an accordion in a text column (spaced) without lh-com's 40 px above from 768 px (austrian.css): www 45 px from the text before it, ours 84 to 86 | the 8 recorded documents with such accordions | mean \|diff\| 4.10 → 2.89 % (gesundes-reisen +7.1 → +3.5 %, bearbeitungsgebuehren +5.4 → +2.9 %) | unchanged (2.89 %) |
| `d6517227` | Austrian | carousel-images: a slide's headline component (h3 above its text) is its title; it was dropped (the parser, the six bundles with it) | premium-economy-class en/de (4 titles lost today); `reimport-519-austrian-carousel-titles.txt` (12 documents) | +62 px: -5.8 → about -4.9 % | +48 px: -7.1 → about -6.4 % |
| `684d242f` | Austrian | a tab set's items on phones as www's collapsibles: titles CoreSans 24/28 500 in 52 px rows, the open one red, 64 px under an open item's content (austrian.css) | the 5 recorded pages with tabs (110 Austrian documents have tab sets) | unchanged | mean \|diff\| 6.36 → 5.24 % (online-check-in -6.9 → -5.3 %) |
| `8247a50f` | Brussels | a card teaser's link line ("Fasten up for perks", "En savoir plus") as www shows it (brussels-import.mjs withTeaserCta, as Austrian's) | jobs, connecting-africa en/fr, our-company: `reimport-519-brussels-card-links.txt` (18 documents) | jobs -2.9 → about -0.1 %; connecting-africa fr -7.8 → about -6.4 % | jobs -6.9 → about -1.4 %; connecting-africa fr -5.6 → about -2.6 % |
| `ed3a86b0` | Brussels | 40 px between a section heading and the accordion straight under it from 768 px (brussels.css; ours the heading's 26) | the 8 recorded pages with such a heading | +14 px a case (special-meals -7.8 → -6.7 %) | unchanged (even there) |

Five Austrian rows were asked for: three are fixed. The Austrian rows above them are live data, the recording, a capture
the harness doesn't have yet, homepage widgets and cards-icon (ema-adobe); the rows below them that are Austrian's own
(rebook's and premium-economy's teaser rows, seat-reservation's sections, travelling-with-animals' nested two-column view)
have no one rule I could measure across pages or are not traced to their step yet. Five Brussels rows were asked for: two
are fixed; the rest of Brussels' top 20 are data and widgets, recording state, one-page causes (travel-insurances,
beobank-mastercard, new-destinations), the no-break-space lines (item 4) and overview pages without a carrier. Their
causes and owners are in the tables.

## Causes in other files (for their owners)

- **Austrian /at/en/economy-class (content):** the FAQ section's two buttons ("Frequently asked questions about booking
  and travel classes", "FAQs about upgrades") are plain list text on DA's copy (no link); today's import of the recording
  keeps both as links (`<em><a href="/at/en/faq-booking-and-travel-classes">`): a re-import of `/at/en/economy-class`
  brings them back. On the 82 recorded pages it is the only document with www buttons as plain text (the others are form
  and widget buttons).
- **Austrian travelling-with-animals (1440 +621 px):** the cabin-pets tab's two-column view (text left, the carrier
  picture and its caption right) sits inside the tab panel's own column view and comes in as default content (text,
  then a full-width picture with "{caption}"). The offline import gives the same, so it is in the import chain; I did not
  trace the step (the tab markers and splitTabSections are swiss-import.mjs's, ema-lufthansa; the nested-view unwrap
  austrian-import.mjs's). Not changed.
- **Austrian /at/de/legal, seat-reservation:** cards-icon tiles and cards-icon-text partner rows (ema-adobe's cards-icon
  rules): 225 px apart on phones on www, ours 160; not changed.
- **Austrian /at/en/entryregulations:** www's separator (margin 40 px) and the section padding after a link list (-75 px
  at 1440); the divider markers are ema-test's. Not changed.
- **Brussels new-destinations:** each destination's facts are a three-column view of headline pairs (label, value) on
  www; lh-com's mapping gives ten stacked h4. A carrier for a headline-only column view would be lh-com's mapping (no
  owner named in the brief); one page.
- **Homepages (both brands):** live widgets, ema-adobe's homepage template, as before.

## Item 4: no-break spaces

The ranking points at them on these recorded pages. www keeps empty lines as a paragraph holding only a no-break space
(`<p>&nbsp;</p>`); the import framework turns it into a space and the empty paragraph goes. Each such line is a 24 px line
and its paragraph's 16 to 24 px margin on www, so about 40 to 48 px each where it shows:

| Brand | Page | Lines | About | Its row |
| --- | --- | --- | --- | --- |
| Brussels | /be/fr/travel-classes/business | 3 | up to 120 to 144 px where shown | 1440 -0.3 %, 390 -0.8 % |
| Brussels | /be/fr/special-care/families-and-children | 2 | 80 to 96 px | 1440 -9.9 % (-187 px): about half of it |
| Brussels | /be/en/special-care/families-and-children | 2 | 80 to 96 px | 1440 -8.3 % (-150 px): about half of it |
| Brussels | /be/en/flying-with-us/our-fleet | 2 | 80 to 96 px | 1440 -2.4 %, 390 +1.9 % |
| Brussels | /be/en/articles/the-gambia | 1 | 40 to 48 px | 1440 -4.2 % |
| Brussels | /be/en/plan-your-trip/travel-regulations | 1 | 40 to 48 px | 1440 -4.9 % |
| Austrian | /at/en/plan/special-requirements/travelling-with-animals | 2 | 80 to 96 px | 390 -4.8 % |
| Austrian | /at/en/accessible-travel | 1 | 40 to 48 px | 390 -4.2 % |
| Austrian | /at/de/gesundes-reisen | 1 | 40 to 48 px | 1440 +7.1 % (the accordions, fixed); 390 +1.0 % |
| Austrian | /at/en/book/additional-services/extra-services | 1 | 40 to 48 px | 390 -4.4 % |

That is 16 lines on 10 of the 165 recorded pages; on Brussels' families-and-children pages they are about half of the
difference. Nothing changed (Ben's rule: not now). Counted with `migration-work/parity-519/rank/nbsp-lines.mjs` over the
recordings' rich text.

## Austrian: the ranking

82 pages; 53 at 2 % or more, 17 at 5 % or more (before the fixes).

| Rank | Path | 1440 www / ours | 390 www / ours | Cause | Owner |
| --- | --- | --- | --- | --- | --- |
| 1 | /at/de/angebote-destinationen | 32933 / 10422 (-68.4 %) | 32487 / 18316 (-43.6 %) | live data: www's offers finder (a fares grid of 150 to 312 pictures), ours the static page | not a layout cause (a data feature) |
| 2 | /at/de/unterhaltung-an-bord | 2749 / 2248 (-18.2 %) | 3128 / 2558 (-18.2 %) → 2628 (-16.0 %) | the recording: about 700 px of empty space in the open tab's panel under the highlights (an empty component); on phones the tab items (fixed, 684d242f) | none (recording); austrian.css (fixed) |
| 3 | /at/en/baggage | 4319 / 4257 (-1.4 %) | 6673 / 5775 (-13.5 %) | phones: www's teasers are boxed cards (two-up); ours the old columns-media padded grid: the importer already gives the boxed cards from www's current markup, the harness's snapshot is older (reimport-austrian-boxed-teasers.txt, brief after 510) | harness: a newer capture, then the re-import |
| 4 | /at/en/fly/flight-information/flight-irregularities | 1321 / 1219 (-7.7 %) | 1736 / 1556 (-10.4 %) | live data: the current-information feed under the h1 | not a layout cause |
| 5 | /at/de/homepage | 4934 / 4464 (-9.5 %) | 6186 / 5707 (-7.7 %) | homepage: live widgets (booking, offers) | ema-adobe (homepage template) |
| 6 | /at/en/homepage | 4885 / 4438 (-9.2 %) | 6039 / 5539 (-8.3 %) | homepage: live widgets (booking, offers) | ema-adobe (homepage template) |
| 7 | /at/en/plan/special-requirements/travelling-with-animals | 6122 / 6661 (+8.8 %) → 6541 (+6.8 %) | 8674 / 8255 (-4.8 %) → 8357 (-3.7 %) | 1440: in the cabin-pets tab www's two-column view (the text left, the carrier picture and its caption right, inside the tab panel's own column view) comes in as text and a full-width picture (+621 px before the questions); the spaced accordions' 40 px (fixed, ec7b6079); phones: the tab items (fixed, 684d242f) | the nested two-column view: not traced to its step (the tab markers are swiss-import.mjs's, ema-lufthansa; the nested-view unwrap austrian-import.mjs's); the rest fixed |
| 8 | /at/de/legal | 1803 / 1766 (-2.1 %) | 2819 / 2592 (-8.1 %) | the four icon tiles (cards-icon usp four-up): www 225 px apart on phones, ours 160 | ema-adobe (cards-icon) |
| 9 | /at/de/book/additional-services/seat-reservation | 9984 / 9387 (-6.0 %) | 14680 / 13568 (-7.6 %) | each seat section 10 to 60 px shorter, growing down the page; the partner teasers (cards-icon-text partner) and the conditions section before the last accordion -242 px at 1440, -424 at 390 | not investigated further (cards-icon-text: ema-adobe's cards-icon family) |
| 10 | /at/en/premium-economy-class | 6689 / 6301 (-5.8 %) | 6346 / 5893 (-7.1 %) | the Services carousel's four slide titles were dropped by the parser (fixed, d6517227: +62 px at 1440, +48 at 390 after the re-import); the picture-and-text rows 38 to 47 px short at 1440 | carousel-images parser (fixed, re-import list); rows not investigated further |
| 11 | /at/de/gesundes-reisen | 6739 / 7218 (+7.1 %) → 6978 (+3.5 %) | 9455 / 9552 (+1.0 %) | 1440: each accordion in a text column 40 px low (lh-com's spaced rule) | austrian.css (fixed, ec7b6079) |
| 12 | /at/en/online-check-in | 4476 / 4350 (-2.8 %) → 4310 (-3.7 %) | 5845 / 5439 (-6.9 %) → 5535 (-5.3 %) | phones: the check-in tabs' items in lh-com's type and touching (fixed, 684d242f); 1440: below the h1 the booking-lookup block | austrian.css (fixed); the rest not investigated |
| 13 | /at/de/bearbeitungsgebuehren | 3140 / 3311 (+5.4 %) → 3231 (+2.9 %) | 4125 / 4384 (+6.3 %) | content: www's page continues with a second h1 block ours doesn't have; the spaced accordions (fixed, ec7b6079) | content; austrian.css (fixed) |
| 14 | /at/en/economy-class | 4134 / 4003 (-3.2 %) | 5414 / 5086 (-6.1 %) | the FAQ section's two buttons are plain list text on DA's copy (today's import keeps them as links: re-import); 1440: 24 px less between "Book your Economy Class flight now" and the FAQ heading (www's empty flight widget) | content (re-import, list below); widget |
| 15 | /at/de/check-in | 2758 / 2655 (-3.7 %) | 4129 / 3903 (-5.5 %) | 390: the block under the h1 76 px shorter, then the related content | not investigated further |
| 16 | /de/de/homepage | 4794 / 4631 (-3.4 %) | 5915 / 6227 (+5.3 %) | homepage: live widgets | ema-adobe |
| 17 | /at/de/book/rebook | 2162 / 2052 (-5.1 %) | 2846 / 2772 (-2.6 %) | the two teasers (picture above text): 35 px less above them and 75 px less below than www's column view at 1440 | not ruled (the padded columns-media is used in many shapes on the 33 recorded pages with it; no one rule) |
| 18 | /at/de/familien | 2408 / 2371 (-1.5 %) | 3146 / 2995 (-4.8 %) | not investigated | - |
| 19 | /at/en/book/additional-services/extra-services | 4414 / 4376 (-0.9 %) | 6780 / 6479 (-4.4 %) | not investigated | - |
| 20 | /at/en/accessible-travel | 12856 / 13028 (+1.3 %) | 19404 / 18589 (-4.2 %) | not investigated (one no-break-space line, item 4) | - |
| 21 | /at/en/entryregulations | 5539 / 5326 (-3.8 %) | 7236 / 6933 (-4.2 %) | 1440: -75 px before "Entry regulations for individual destinations" (www's separator and the section's padding after the link), -113 before "This may also interest you" | separators: ema-test's divider markers; not investigated further |
| 22 | /at/de/discover/inspiration/fly-with-austrian | 4649 / 4462 (-4.0 %) | 9114 / 8768 (-3.8 %) | not investigated | - |
| 23 | /at/en/discover/inspiration/fly-with-austrian | 4507 / 4347 (-3.6 %) | 8696 / 8371 (-3.7 %) | not investigated | - |
| 24 | /at/de/flugstatus-und-flugplan | 3494 / 3500 (+0.2 %) | 4729 / 4554 (-3.7 %) | not investigated | - |
| 25 | /at/en/book/flights/new-destinations | 9862 / 9500 (-3.7 %) | 18991 / 18289 (-3.7 %) | not investigated | - |
| 26 | /ch/en/homepage | 4745 / 4581 (-3.5 %) | 5789 / 5998 (+3.6 %) | homepage: live widgets | ema-adobe |
| 27 | /at/de/missing-baggage | 4603 / 4771 (+3.6 %) → 4731 (+2.8 %) | 6522 / 6464 (-0.9 %) → 6590 (+1.0 %) | not investigated | - |
| 28 | /at/de/culinaryjourney | 1539 / 1485 (-3.5 %) | 2081 / 2126 (+2.2 %) | not investigated | - |
| 29 | /at/en/book/flights/giftvoucher | 4065 / 3927 (-3.4 %) | 5756 / 5687 (-1.2 %) | not investigated | - |
| 30 | /at/en/payment-options | 2644 / 2560 (-3.2 %) | 3292 / 3251 (-1.2 %) | not investigated | - |
| 31 | /at/en/legal/conditions-of-carriage | 3036 / 2941 (-3.1 %) | 4276 / 4231 (-1.1 %) | not investigated | - |
| 32 | /at/en/imprint | 3688 / 3802 (+3.1 %) | 4757 / 4898 (+3.0 %) | not investigated | - |
| 33 | /at/en/special-requirements | 3784 / 3672 (-3.0 %) | 5456 / 5337 (-2.2 %) | not investigated | - |
| 34 | /at/de/business-class | 6179 / 6006 (-2.8 %) | 10445 / 10127 (-3.0 %) | not investigated | - |
| 35 | /at/de/fly/on-board/internet-overview | 3289 / 3191 (-3.0 %) | 4007 / 3968 (-1.0 %) | not investigated | - |
| 36 | /at/de/pre-order-food | 4243 / 4116 (-3.0 %) | 5884 / 5708 (-3.0 %) | not investigated | - |
| 37 | /at/de/upgrades | 8281 / 8056 (-2.7 %) | 11262 / 11074 (-1.7 %) | not investigated | - |
| 38 | /at/en/plan/special-requirements/healthy-travel/doctor-on-board/doctor-on-board-news | 2896 / 2972 (+2.6 %) → 2932 (+1.2 %) | 3083 / 3038 (-1.5 %) | not investigated | - |
| 39 | /at/de/notfallkontakt | 3045 / 3061 (+0.5 %) | 3542 / 3633 (+2.6 %) | not investigated | - |
| 40 | /at/de/rechnungsbeleg | 2277 / 2336 (+2.6 %) | 2949 / 2973 (+0.8 %) | not investigated | - |
| 41 | /at/en/unaccompanied-minors | 6231 / 6111 (-1.9 %) | 8487 / 8275 (-2.5 %) | not investigated | - |
| 42 | /at/en/book/overview-services-on-board | 2422 / 2399 (-0.9 %) | 2921 / 2850 (-2.4 %) | not investigated | - |
| 43 | /at/de/book/overview-services-on-board | 2447 / 2423 (-1.0 %) | 2969 / 2898 (-2.4 %) | not investigated | - |
| 44 | /at/en/faq | 2533 / 2592 (+2.3 %) → 2552 (+0.8 %) | 3903 / 3872 (-0.8 %) | not investigated | - |
| 45 | /at/de/travel-briefing | 6990 / 6956 (-0.5 %) | 8335 / 8146 (-2.3 %) | not investigated | - |
| 46 | /at/en/book/additional-services/travel-insurances | 2895 / 2963 (+2.3 %) | 3762 / 3734 (-0.7 %) | not investigated | - |
| 47 | /at/en/discover/inspiration | 1712 / 1742 (+1.8 %) | 1841 / 1799 (-2.3 %) | not investigated | - |
| 48 | /at/en/emergency-contact | 3009 / 3037 (+0.9 %) | 3415 / 3492 (+2.3 %) | not investigated | - |
| 49 | /at/en/fly/travel-classes | 2414 / 2415 (+0.0 %) | 2889 / 2826 (-2.2 %) | not investigated | - |
| 50 | /at/de/fly/travel-classes | 2414 / 2415 (+0.0 %) | 2889 / 2826 (-2.2 %) | not investigated | - |
| 51 | /at/de/lhg-staralliance-partner | 7230 / 7386 (+2.2 %) | 12070 / 11800 (-2.2 %) | not investigated | - |
| 52 | /at/de/anreise-abreise | 3105 / 3087 (-0.6 %) | 3759 / 3683 (-2.0 %) | not investigated | - |
| 53 | /at/de/book/groups-and-enterprises/group-travel-and-charter | 2432 / 2421 (-0.5 %) | 2997 / 2937 (-2.0 %) | not investigated | - |
| 54 | /at/de/zusatzgepaeck | 2916 / 2894 (-0.8 %) | 4106 / 4028 (-1.9 %) | not investigated | - |
| 55 | /at/en/contact | 2438 / 2460 (+0.9 %) | 3022 / 3077 (+1.8 %) | not investigated | - |
| 56 | /at/de/book/groups-and-enterprises/corporate-customers | 2664 / 2615 (-1.8 %) | 4095 / 4041 (-1.3 %) | not investigated | - |
| 57 | /at/en/book/overview-inspiration | 1777 / 1750 (-1.5 %) | 2299 / 2273 (-1.1 %) | not investigated | - |
| 58 | /at/de/book/overview-inspiration | 1777 / 1750 (-1.5 %) | 2347 / 2321 (-1.1 %) | not investigated | - |
| 59 | /at/en/fly/on-board/culinary-services | 8422 / 8343 (-0.9 %) | 9166 / 9029 (-1.5 %) | not investigated | - |
| 60 | /at/de/datenschutz | 16293 / 16517 (+1.4 %) | 31178 / 31328 (+0.5 %) | not investigated | - |
| 61 | /at/en/book/overview-manage | 3693 / 3648 (-1.2 %) | 5103 / 5051 (-1.0 %) | not investigated | - |
| 62 | /at/en/austrian-app | 5359 / 5425 (+1.2 %) | 6703 / 6637 (-1.0 %) → 6715 (+0.2 %) | not investigated | - |
| 63 | /at/de/besondere-anforderungen | 3736 / 3696 (-1.1 %) | 5497 / 5450 (-0.9 %) | not investigated | - |
| 64 | /at/de/contact | 2459 / 2460 (+0.0 %) | 3130 / 3163 (+1.1 %) | not investigated | - |
| 65 | /at/en/book/flights | 3575 / 3609 (+1.0 %) | 4693 / 4674 (-0.4 %) | not investigated | - |
| 66 | /at/de/anfrage-rueckerstattung | 2197 / 2186 (-0.5 %) | 2515 / 2540 (+1.0 %) | not investigated | - |
| 67 | /at/en/company | 3249 / 3282 (+1.0 %) | 4035 / 3993 (-1.0 %) | not investigated | - |
| 68 | /at/en/sustainable-flying | 4275 / 4278 (+0.1 %) | 5929 / 5868 (-1.0 %) | not investigated | - |
| 69 | /at/de/book/flights | 3600 / 3633 (+0.9 %) | 4850 / 4831 (-0.4 %) | not investigated | - |
| 70 | /at/en/international-lounges | 3192 / 3187 (-0.2 %) → 3147 (-1.4 %) | 3568 / 3537 (-0.9 %) | not investigated | - |
| 71 | /at/en/book/overview-travel-information | 2996 / 3015 (+0.6 %) | 4069 / 4076 (+0.2 %) | not investigated | - |
| 72 | /at/de/book/overview-travel-information | 3044 / 3063 (+0.6 %) | 4135 / 4141 (+0.1 %) | not investigated | - |
| 73 | /at/en/footer-pages/subscribe-newsletter | 2133 / 2125 (-0.4 %) | 2625 / 2609 (-0.6 %) | not investigated | - |
| 74 | /at/en/at-the-airport | 2957 / 2976 (+0.6 %) | 4154 / 4165 (+0.3 %) | not investigated | - |
| 75 | /at/de/legal/passenger-rights | 11067 / 11110 (+0.4 %) | 18875 / 18753 (-0.6 %) | not investigated | - |
| 76 | /at/de/footer-pages/accessibility-statement | 6756 / 6755 (-0.0 %) | 10387 / 10449 (+0.6 %) | not investigated | - |
| 77 | /at/en/book/overview-extra-services | 3604 / 3594 (-0.3 %) | 4964 / 4940 (-0.5 %) | not investigated | - |
| 78 | /at/de/book/overview-extra-services | 3669 / 3657 (-0.3 %) | 5155 / 5130 (-0.5 %) | not investigated | - |
| 79 | /at/de/schwangere-frauen | 4294 / 4307 (+0.3 %) | 5716 / 5689 (-0.5 %) | not investigated | - |
| 80 | /at/de/book/overview-manage | 3721 / 3711 (-0.3 %) | 5259 / 5243 (-0.3 %) | not investigated | - |
| 81 | /at/en/green-fare | 6482 / 6462 (-0.3 %) | 7637 / 7638 (+0.0 %) | not investigated | - |
| 82 | /at/en/aircraft-fleet | 3618 / 3612 (-0.2 %) | 5522 / 5510 (-0.2 %) | not investigated | - |

## Brussels: the ranking

83 pages; 69 at 2 % or more, 29 at 5 % or more (before the fixes).

| Rank | Path | 1440 www / ours | 390 www / ours | Cause | Owner |
| --- | --- | --- | --- | --- | --- |
| 1 | /be/en/book-a-flight/our-destinations | 32059 / 9873 (-69.2 %) | 33015 / 16590 (-49.8 %) | live data: www's destination list (186 to 312 pictures), ours the static page | not a layout cause (a data feature) |
| 2 | /be/fr/book-a-flight/our-payment-methods | 3752 / 2674 (-28.7 %) → 2688 (-28.4 %) | 5390 / 4515 (-16.2 %) | www's payment methods widget (about 900 px, empty in the recording) where ours has its link | widget: not a theme cause |
| 3 | /be/fr/extra-services/baggage/problems-with-your-baggage | 2619 / 2118 (-19.1 %) | 3789 / 2706 (-28.6 %) | state: the recording has the first two accordion panels open, ours all closed | none (recording state) |
| 4 | /be/en/my-bookings/cancel-and-refund-requests | 1642 / 1238 (-24.6 %) → 1252 (-23.8 %) | 2142 / 1701 (-20.6 %) | state: the recording has one accordion panel open and the chat assistant's panel; ours closed | none (recording state) |
| 5 | /be/en/extra-services/travel-insurances | 2210 / 2387 (+8.0 %) | 3885 / 4272 (+10.0 %) | the h1's padded section before a one-line grey band (+124 px before the first h2 at 1440); the only recorded page with this pair | brussels.css, but one page: no shared rule |
| 6 | /be/fr/special-care/families-and-children | 1892 / 1705 (-9.9 %) | 3804 / 3657 (-3.9 %) | the intro to the first card: www's separator and two no-break-space lines (item 4) ours doesn't carry | no carrier (item 4: not now) |
| 7 | /be/fr/extra-services/beobank-mastercard | 6458 / 6927 (+7.3 %) | 11205 / 12276 (+9.6 %) | 390: +60 to +90 px around the borrowing notice and the first three headings, then even; 1440 +7.3 % | not investigated further (one page) |
| 8 | /be/fr/flying-with-us/new-destinations | 4623 / 5030 (+8.8 %) | 4833 / 4471 (-7.5 %) | 1440: each destination's facts (flights a week, distance, duration, airport, aircraft) are a three-column view of headline pairs on www, ten stacked h4 in ours (+162 / +192 px a destination) | lh-com's mapping of a headline-only column view (no carrier); one page |
| 9 | /be/en/special-care/families-and-children | 1814 / 1664 (-8.3 %) | 3640 / 3513 (-3.5 %) | as fr (two no-break-space lines, item 4) | no carrier (item 4) |
| 10 | /be/fr/check-in-options-and-info/online-check-in-options | 4617 / 4556 (-1.3 %) | 7246 / 6647 (-8.3 %) | 390: -73 px before "Comment faire", then 20 to 40 px per step card, -118 and -165 before the next two headings | not investigated further |
| 11 | /be/fr/legal-notices | 1471 / 1349 (-8.3 %) | 1971 / 1875 (-4.9 %) | 1440: the h1 84 px higher than www's (www has something above it) | not investigated further |
| 12 | /be/fr/book-a-flight/connecting-africa | 4106 / 3785 (-7.8 %) | 7872 / 7432 (-5.6 %) | the advantages' cards without www's link line ("En savoir plus"): -221 px before "Autres sujets" at 1440 | brussels-import.mjs (fixed, 8247a50f, re-import list) |
| 13 | /be/en/extra-services/meals/special-meals | 2446 / 2255 (-7.8 %) → 2283 (-6.7 %) | 3518 / 3358 (-4.5 %) | the heading straight above each accordion 14 px short at 1440 (fixed, ed3a86b0); 20 to 40 px less after each accordion | brussels.css (fixed above; below: no one rule, -4 to -40 px by what follows) |
| 14 | /be/fr/book-a-flight/flight-search | 1163 / 1074 (-7.7 %) | 1748 / 1733 (-0.9 %) | the h1 in its picture row 44 px higher; the flight search widget | widget; not investigated further |
| 15 | /be/fr/my-bookings/invoices | 1505 / 1393 (-7.4 %) | 2292 / 2206 (-3.8 %) | the rows 30 px short each | not investigated further |
| 16 | /be/en/book-a-flight/connecting-africa | 3980 / 3696 (-7.1 %) | 7454 / 7059 (-5.3 %) | as fr (the cards' link lines) | brussels-import.mjs (fixed, 8247a50f) |
| 17 | /be/en/services-on-board | 1125 / 1180 (+4.9 %) | 1865 / 1993 (+6.9 %) | the bottom-gap rule (42d30cf3) overshoots here: www 61 / 101 px below the last grid | brussels.css (accepted: the median rule) |
| 18 | /be/en/jobs | 2062 / 2002 (-2.9 %) | 3189 / 2968 (-6.9 %) | the three cards without www's link line ("Fasten up for perks"): -73 px a card row at 390 | brussels-import.mjs (fixed, 8247a50f, re-import list) |
| 19 | /be/fr/flying-with-us/welcome-brussels-airlines | 6270 / 5864 (-6.5 %) | 10337 / 9912 (-4.1 %) | live data: www's trending offers (fares, conditions) before "Vous cherchez une autre destination ?" (-569 px at 1440) | not a layout cause |
| 20 | /be/fr/plan-your-trip/airport-info | 1388 / 1305 (-6.0 %) | 2731 / 2785 (+2.0 %) | overview page: the intro to the first card (www's separators and empty lines, no carrier) | no carrier |
| 21 | /be/fr/check-in-options-and-info?country=BE&language=FR | 1708 / 1609 (-5.8 %) | 3129 / 3017 (-3.6 %) | overview page: as airport-info | no carrier |
| 22 | /be/fr/special-care/pets | 1708 / 1609 (-5.8 %) | 3153 / 3042 (-3.5 %) | overview page: as airport-info | no carrier |
| 23 | /be/fr/legal-notices/imprint | 2056 / 1936 (-5.8 %) | 2492 / 2398 (-3.8 %) | not investigated | - |
| 24 | /fr/fr/homepage | 4214 / 4162 (-1.2 %) | 5464 / 5777 (+5.7 %) | homepage: live widgets | ema-adobe |
| 25 | /ke/en/homepage | 4110 / 4333 (+5.4 %) | 5227 / 5502 (+5.3 %) | homepage: live widgets | ema-adobe |
| 26 | /be/en/flying-with-us/the-belgian-icons | 1519 / 1438 (-5.3 %) | 2982 / 2876 (-3.6 %) | not investigated | - |
| 27 | /be/fr/flying-with-us/art-design | 4831 / 4581 (-5.2 %) | 6043 / 6007 (-0.6 %) | not investigated | - |
| 28 | /us/en/homepage | 4147 / 4076 (-1.7 %) | 5340 / 5615 (+5.1 %) | homepage: live widgets | ema-adobe |
| 29 | /be/en/book-a-flight/rebook | 1656 / 1573 (-5.0 %) | 2400 / 2360 (-1.7 %) | not investigated | - |
| 30 | /be/en/plan-your-trip/travel-regulations | 4354 / 4142 (-4.9 %) → 4156 (-4.5 %) | 7142 / 6899 (-3.4 %) | not investigated | - |
| 31 | /be/fr/travel-classes | 1336 / 1272 (-4.8 %) | 2472 / 2443 (-1.2 %) | not investigated | - |
| 32 | /be/fr/book-a-flight/groups-and-charter | 1415 / 1348 (-4.7 %) | 2859 / 2874 (+0.5 %) | not investigated | - |
| 33 | /be/fr/flying-with-us | 1609 / 1533 (-4.7 %) | 2875 / 2856 (-0.7 %) | not investigated | - |
| 34 | /be/en/book-a-flight/groups-and-charter/groups | 3072 / 2928 (-4.7 %) | 4545 / 4510 (-0.8 %) | not investigated | - |
| 35 | /be/en/book-a-flight/flightvoucher | 2835 / 2769 (-2.3 %) | 4241 / 4051 (-4.5 %) | not investigated | - |
| 36 | /be/fr/homepage | 4197 / 4020 (-4.2 %) | 5482 / 5327 (-2.8 %) | homepage: live widgets | ema-adobe |
| 37 | /be/en/articles/the-gambia | 9056 / 8674 (-4.2 %) | 13055 / 12778 (-2.1 %) | not investigated | - |
| 38 | /be/en/travel-classes/green-fare | 5504 / 5273 (-4.2 %) | 7745 / 7928 (+2.4 %) | not investigated | - |
| 39 | /be/fr/extra-services/meals | 1630 / 1600 (-1.8 %) | 3519 / 3377 (-4.0 %) | not investigated | - |
| 40 | /be/fr/extra-services/lounges | 1383 / 1329 (-3.9 %) | 2450 / 2474 (+1.0 %) | not investigated | - |
| 41 | /be/fr/articles/vibrant-senegal | 10888 / 10464 (-3.9 %) | 16436 / 16161 (-1.7 %) | not investigated | - |
| 42 | /be/fr/plan-your-trip/express-rail | 3356 / 3255 (-3.0 %) | 5599 / 5378 (-3.9 %) | not investigated | - |
| 43 | /be/en/homepage | 4110 / 3955 (-3.8 %) | 5294 / 5124 (-3.2 %) | not investigated | - |
| 44 | /be/en/my-bookings | 1467 / 1484 (+1.2 %) | 3638 / 3774 (+3.7 %) | not investigated | - |
| 45 | /be/en/check-in-options-and-info?country=BE&language=EN | 1597 / 1596 (-0.1 %) | 3132 / 3018 (-3.6 %) | not investigated | - |
| 46 | /be/en/book-a-flight | 1418 / 1466 (+3.4 %) | 3092 / 3126 (+1.1 %) | not investigated | - |
| 47 | /be/en/book-a-flight/groups-and-charter/meetings-and-events | 2897 / 2799 (-3.4 %) | 3526 / 3428 (-2.8 %) | not investigated | - |
| 48 | /be/fr/extra-services/inflight-services | 2900 / 2977 (+2.7 %) | 2902 / 2805 (-3.3 %) | not investigated | - |
| 49 | /be/en/plan-your-trip/travel-briefing | 4297 / 4226 (-1.7 %) | 7657 / 7401 (-3.3 %) | not investigated | - |
| 50 | /be/en/lufthansa-group | 1357 / 1312 (-3.3 %) | 2169 / 2139 (-1.4 %) | not investigated | - |
| 51 | /be/en/travel-classes | 1331 / 1288 (-3.2 %) | 2380 / 2395 (+0.6 %) | not investigated | - |
| 52 | /be/fr/my-bookings | 1521 / 1501 (-1.3 %) | 3658 / 3774 (+3.2 %) | not investigated | - |
| 53 | /be/en/articles | 4635 / 4715 (+1.7 %) | 7814 / 8045 (+3.0 %) | not investigated | - |
| 54 | /be/fr/extra-services/upgrades | 4136 / 4017 (-2.9 %) → 4031 (-2.5 %) | 7185 / 7148 (-0.5 %) | not investigated | - |
| 55 | /be/fr/plan-your-trip | 1598 / 1551 (-2.9 %) | 2886 / 2896 (+0.3 %) | not investigated | - |
| 56 | /be/fr/special-care/families-and-children/children-travelling-alone | 5942 / 5772 (-2.9 %) | 8183 / 8203 (+0.2 %) | not investigated | - |
| 57 | /be/fr/articles | 4740 / 4783 (+0.9 %) | 8049 / 8282 (+2.9 %) | not investigated | - |
| 58 | /be/en/travel-classes/economy | 3186 / 3097 (-2.8 %) | 5073 / 4946 (-2.5 %) | not investigated | - |
| 59 | /be/en/register-newsletter | 1802 / 1851 (+2.7 %) | 2362 / 2399 (+1.6 %) | not investigated | - |
| 60 | /be/en/extra-services/seat-reservation | 6305 / 6144 (-2.6 %) → 6158 (-2.3 %) | 9529 / 9645 (+1.2 %) | not investigated | - |
| 61 | /be/en/plan-your-trip/arrivals-and-departures | 1258 / 1227 (-2.5 %) | 1561 / 1539 (-1.4 %) | not investigated | - |
| 62 | /be/en/extra-services | 1475 / 1484 (+0.6 %) | 3216 / 3298 (+2.5 %) | not investigated | - |
| 63 | /be/en/contact | 1633 / 1672 (+2.4 %) | 2257 / 2296 (+1.7 %) | not investigated | - |
| 64 | /be/en/flying-with-us/our-fleet | 1287 / 1256 (-2.4 %) | 2680 / 2730 (+1.9 %) | not investigated | - |
| 65 | /be/fr/articles/milan-citytrip | 6007 / 5871 (-2.3 %) | 8693 / 8583 (-1.3 %) | not investigated | - |
| 66 | /be/fr/articles/discover-warsaw | 8161 / 8341 (+2.2 %) | 6506 / 6611 (+1.6 %) | not investigated | - |
| 67 | /be/en/articles/milan-citytrip | 5796 / 5668 (-2.2 %) | 8291 / 8190 (-1.2 %) | not investigated | - |
| 68 | /be/en/extra-services/upgrades | 3957 / 3873 (-2.1 %) → 3887 (-1.8 %) | 6649 / 6595 (-0.8 %) | not investigated | - |
| 69 | /be/en/special-care | 1475 / 1484 (+0.6 %) | 2805 / 2864 (+2.1 %) | not investigated | - |
| 70 | /be/en/extra-services/meals | 1548 / 1576 (+1.8 %) | 3391 / 3329 (-1.8 %) | not investigated | - |
| 71 | /be/en/special-care/special-assistance | 1641 / 1611 (-1.8 %) | 3724 / 3672 (-1.4 %) | not investigated | - |
| 72 | /be/fr/our-company | 6004 / 5937 (-1.1 %) | 9803 / 9662 (-1.4 %) | not investigated | - |
| 73 | /be/fr/contact | 1715 / 1696 (-1.1 %) | 2466 / 2486 (+0.8 %) | not investigated | - |
| 74 | /be/fr/articles/lyon | 9723 / 9619 (-1.1 %) | 7690 / 7661 (-0.4 %) | not investigated | - |
| 75 | /be/en/articles/lyon | 9555 / 9459 (-1.0 %) | 7192 / 7202 (+0.1 %) | not investigated | - |
| 76 | /be/fr/travel-classes/business | 6458 / 6438 (-0.3 %) | 8976 / 8905 (-0.8 %) | not investigated | - |
| 77 | /be/en/our-company/accessibility-statement | 5823 / 5872 (+0.8 %) | 9253 / 9297 (+0.5 %) | not investigated | - |
| 78 | /be/en/articles/valencia-like-a-local | 6295 / 6308 (+0.2 %) | 4715 / 4754 (+0.8 %) | not investigated | - |
| 79 | /be/fr/register-newsletter | 1964 / 1976 (+0.6 %) | 2598 / 2615 (+0.7 %) | not investigated | - |
| 80 | /be/fr/book-a-flight | 1493 / 1484 (-0.6 %) | 3147 / 3142 (-0.2 %) | not investigated | - |
| 81 | /be/en/extra-services/baggage | 1594 / 1593 (-0.1 %) | 3655 / 3633 (-0.6 %) | not investigated | - |
| 82 | /be/fr/travel-classes/premium-economy | 4620 / 4609 (-0.2 %) | 6224 / 6249 (+0.4 %) | not investigated | - |
| 83 | /be/en/legal-notices/data-protection-and-privacy-notice | 16274 / 16276 (+0.0 %) | 29975 / 30034 (+0.2 %) | not investigated | - |

## The brief after 521: five more rows in our own files

Measured on the published page: before on austrian.turnsthe.page / brussels.turnsthe.page, after on a local dev server
with this tree and the site's preview content. For importer changes, the recording is imported offline and the changed
part is put into the published document, with both copies on one local server.

| Commit | Brand | Row | Pages | 1440 | 390 |
| --- | --- | --- | --- | --- | --- |
| `762510ab` | Austrian | a tab panel's two-column view one level into the section's one-column view (austrian-import.mjs: withPanelWrappersUnwrapped in a column-view item; withNestedOnecolumnUnwrapped over a heading wrapper where the item holds a column view). Traced: the travelling-with-animals tab case was in these two steps, not in swiss-import.mjs | travelling-with-animals, online-check-in (2 of 82 recorded); `reimport-522-austrian-tab-columns.txt` (20) | travelling-with-animals +6.8 → about -1.3 % | -3.7 → about -3.4 % |
| `a22d29eb` | Austrian | a card grid opening the section after the page title's own section keeps the column view's 32 px (austrian.css) | check-in, families (20 documents) | check-in -3.7 → -2.6 %, familien -1.5 → -0.2 % | -5.5 → -4.7 %, -4.8 → -3.8 % |
| `16dca5ed` | Brussels | the heading after an accordion in its section, 41 px below it from 768 px, 21 on phones (brussels.css) | 222 + 38 documents with an h2 / h3 after an accordion | special-meals -6.7 → -4.9 %; 5 pages mean \|diff\| 10.04 → 9.32 % | 6.22 → 6.18 % |
| `582e6e25` | Brussels | the page title's section and a grey band right under it (brussels.css; ranking row 5) | travel-insurances en, fr | +8.0 → +1.9 % | +10.0 → +7.0 % |
| `4ce3096f` | Brussels | a headline-only column view in a sidebar's content comes in as columns-media (brussels-import.mjs withFactColumns; ranking row 8: the destination facts) | new-destinations (1 of 7 recorded pages with a marked sidebar); `reimport-522-brussels-fact-columns.txt` (6) | +8.8 → about -2.0 % | -7.5 → about -4.0 % |

Together with 521's five, that is five fixes per brand. Two rows I looked at and did not rule:

- **Austrian:** the padded teaser pairs (rebook, premium-economy, giftvoucher). The 33 recorded pages with
  `columns-media padded` show no one difference.
- **Brussels:** two patterns that are not one rule.
  - A teaser row ending in a button before a heading: -41 to -64 px on rebook, flightvoucher and beobank, but +24 on
    upgrades.
  - The link-to-heading "+21": the button's box against www's button host, not a gap; the ink gaps are equal.

Capture list for after 15:00 CET: `capture-list-austrian-brussels.txt` (56 pages, 107 captures, about 18 minutes).
No-break spaces: `nbsp-proposal-cashub.md` (not applied).
