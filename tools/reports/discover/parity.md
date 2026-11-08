# Discover Airlines: discover.turnsthe.page and www.discover-airlines.com (brief 387)

Site lh-discover, host discover.turnsthe.page (live since 2026-10-29). This report holds the
accessibility pass and the parity rows from the user's capture of www.discover-airlines.com
(`discover-parity-001`). www refuses agents' browsers, so www is compared from the capture only.

Pages (26, each under /de/en/ and /de/de/): `homepage`, `book/flights/flight-search`,
`my-bookings/check-in/check-in-at-the-airport`, `book/special-requests/families`,
`my-bookings/check-in`, `my-bookings/services/additional-services`,
`discover/travel-classes/business-class`, `discover/services-on-board/entertainment`,
`book/flights/offers?PartnerFlights=one`, `travel-inspiration/inspiration/destinations/santorini`,
`travel-inspiration/inspiration/destinations/punta-cana`, `my-bookings/manage/customer-service`,
`book/baggage`; at 1440 x 900 and 390 x 844.

## Accessibility (2026-11-05)

**How:** axe-core 4.10.2, WCAG 2.0, 2.1 and 2.2, A and AA (`wcag2a`, `wcag2aa`, `wcag21a`,
`wcag21aa`, `wcag22a`, `wcag22aa`), one page at a time, each scrolled through so lazy blocks
loaded, after the cookie choice "Only necessary". Before the fixes on discover.turnsthe.page (main's
code, the published documents): 52 runs. After them on a local server with this branch's code and
the preview's documents (the changed documents uploaded): the 11 pages that changed, both
languages, both widths, 44 runs.

### Results

- **axe:** no violations in any of the 96 runs. The first de/en homepage run at 1440 had the
  showcase notice still open (it appears after the cookie dialog), so it was run again with the
  notice closed: no violations. "Needs review" only: select arrows and the date fields' own
  (transparent) text, which axe cannot judge; carousel and offer cards that overlap while they
  slide; the ✓ marks of the Business Class table; at 390 the fourth quick link (below).
- **ema-adobe's carousel dots (87f5d985):** 24 x 24 targets with the 8 px dot drawn in them; hold.
- **ema-cashub's inert flyout (d81e71f9):** the closing menu is `inert`, then `display: none`; a
  Tab pressed while it closes goes on in the page; holds.
- **Tab sets (new on these documents, scripts/section-tabs.js):** no findings; role tablist / tab /
  tabpanel, a roving tabindex, arrows, Home and End; below 768 px each panel an accordion toggle.

### Keyboard pass (de/en homepage, 1440 and 390)

| Part | What happens | Status |
| --- | --- | --- |
| Skip links | "Go to navigation", "Go to main content", "Go to footer" first, each with a ring | fine |
| Header | logo, Book, My flights, Check-in, Flight status, Accessibility, Help & Contact, Shopping cart, Login, Menu, each with a ring | fine |
| Menu, 1440 | Enter opens it with the focus on the first tab; Escape closes it and returns the focus to Menu. In the pass, after Enter on a tab the Tab key went through the other tabs and the bar's tools before the panel's links (brief 382's shared finding 1); rechecked on discover.turnsthe.page after 0ce56989 (header, another agent's): Tab now goes from the tab into its panel's links (Booking, Offers and destinations, Baggage …), Escape back to the tab | fine since 0ce56989 |
| Menu, 390 | Enter opens it on the first tab, Enter goes into the tab's links, Escape returns the focus to Menu | fine |
| Flight search | trip type, travellers, non-stop, From, swap, To, the two date fields (since 3ba047f7 one stop each, opening the calendar), Find flights, each named and with a ring | fine |
| Travellers panel | opens with Enter; Tab walks Adults, Children, Infants, the class and Done | fine |
| Fare tiles, offer cards | each a link; the ring is drawn round the card (`::after`) | fine |
| Alert strip | none on these pages at capture time | not applicable |
| Quick links at 390 | the fourth, "Flight status", runs to x 429 of 390 and the row does not scroll; www's row is cut the same way (x 344 to 424) | advisory, www's design, shared header (A1) |

### Findings

| # | Finding | WCAG | Kind | Owner | Status |
| --- | --- | --- | --- | --- | --- |
| A1 | At 390 the bar's fourth quick link is partly outside the viewport and the row does not scroll; on www the same | 1.4.10 / 2.4.11 (advisory) | shared code (blocks/header) | lh-com shared code | open, as www |
| A2 | With the footer sky blue (row 9), lh-com's footer greys would fall short: the language button's #ebebeb 4.27:1, the muted text's #b4b4b4 2.45:1 (brief 370's test caught the first) | 1.4.3 | theme | mine | fixed: white (5.09:1) and #f4f4f4 (4.63:1); the links #f4f4f4 as www's |

Nothing else to fix; Discover's theme changes (below) keep the contrast (copy #002554 and headings
#003e7b on white, links regular with lh-com's arrow before them).

## Parity

### How it was compared

- **www:** the capture `discover-parity-001.tar.gz` (sha256 `b08cb37e…330eb`, checked; 596 files):
  full-page PNGs, HTML, shadow HTML and the measurement files of the 26 pages at both widths, the
  homepage states, www's four stylesheets and its fonts. Served locally without its scripts (my own
  server, not the archive's serve.py); www's styles were read from the measurement files and from the
  rendered shadow HTML. The agent did not load www.
- **Ours, before:** discover.turnsthe.page (main's code, the published documents), measured the
  same way (box and the text style one sees per element) and screenshotted, side by side with
  www's PNGs.
- **Ours, with the fixes:** local dev servers with the working tree's code: the edited documents
  from a local folder (the brand's metadata added in the browser), then the preview after the
  upload. Locally the Lufthansa fonts answer 404 (the host serves them), so the capture's faces were
  loaded; sizes, weights, colours and boxes were compared, not glyph widths.
- The "DEMO | Not a Discover Airlines website" badge (brief 386) is ours and left out. Prices,
  offers and the stage campaign change with time and are not differences.

Kind: **theme** = `styles/themes/discover.css` (tokens and body.brand-discover rules, test
`test/discover-parity-387.test.mjs`); **document** = the lh-discover documents of de/en and de/de,
changed by `tools/importer/discover-parity-387.mjs` from the capture's own markup (test
`test/discover-parity-apply-387.test.mjs`); **shared** = lh-com's shared code; **data** = what the
page loads from Group services.

| Row | What www shows | What ours showed | Kind | Owner | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | Bar: quick links and Menu LufthansaHead 18/24 bold at 1440 (14/18 on phones), Login 18/24; logo 116 x 40 (110 x 38 on phones) | LufthansaText 14/18; logo 81 x 28 on phones | theme | mine | fixed |
| 2 | Headings dark sky blue #003e7b (h1 to h3, the stage teaser's headline) | sky blue #1e73af | theme | mine | fixed |
| 3 | Copy and links night sky blue #002554, 16/24 (copytext-medium); fields 18/24 | dark sky blue, 18/27 | theme | mine | fixed (the fields keep 18 px) |
| 4 | heading-copytext-large 16 to 18 px, heading-copytext-medium 14 to 16 px (LufthansaHead 700) | lh-com's 20 to 24 and 16 to 18 | theme | mine | fixed |
| 5 | Buttons LufthansaHead 20/24 bold | LufthansaText 18/24 | theme | mine | fixed |
| 6 | Stage teaser eyebrow LufthansaHead 24/26.4 regular | 18/19.8 | theme | mine | fixed |
| 7 | Accordion titles LufthansaHead 20/26 bold sky blue; the travellers button LufthansaHead 18/24 | 18/24 dark sky blue; LufthansaText 14/21 | theme | mine | fixed |
| 8 | "Looking for more" tiles white, 1 px rgb(0 62 123 / 30%), 10 px corners, soft shadow; labels #002554 | grey tiles, #e9e9e9 border, 8 px | theme | mine | fixed |
| 9 | Footer: a yellow 20 px and a light sky blue 24 px stripe over sky blue #1e73af; headings 18/19.8 without a rule; links 18/18 bold #f4f4f4 (corrected in brief 394: www's a.link-large; 14 px came from a rule for other links); the logo row dark sky blue, then night sky blue | one dark sky blue area, 24 px headings with a rule | theme | mine | fixed (brief 394: the links 18 px) |
| 10 | Teaser cards' titles (a.teaser.card) LufthansaHead 14 to 16 px #002554 | 18 to 24 px | theme | mine | fixed |
| 11 | Links in running text regular (`.richtext a` inherits 400), an arrow before them | bold | theme | mine | fixed |
| 12 | A tab set on phones: accordion toggles LufthansaHead 20/26 bold sky blue | 16/24 night sky blue | theme | mine | fixed |
| 13 | Offers page: "Filter" bold, its group titles 18 px, Filters / More information / General conditions LufthansaHead 18/24 | light title, 16 px groups, LufthansaText 14 to 16 px toggles | theme | mine | fixed |
| 14 | Tab sets: Check-in at the airport (Frankfurt Airport, Munich Airport, International airports), Business Class (Long-haul, Short- and medium-haul), Santorini (Bathing, Greek wine, Walking & hiking) | all panels one after the other | document | mine | fixed: Tab sections at www's first texts in de/en and de/de; in the panels www's column views (picture + heading as image \| text rows, Business Class's three benefits as one row of three cells) |
| 15 | Check-in at the airport: the Frankfurt panel once | an older copy of it (another picture, "usually open three hours", a modernization note) before the current one | document | mine | fixed: the older copy removed (www shows nothing between the title and the tab set) |
| 16 | Teaser cards two per row: Additional services (9), "This might also be of interest to you" on Traveling with children and Baggage, "You might also be interested in this" on Check-in | loose full-width pictures with a heading under each | document | mine | fixed: carousel-cards grid two-up |
| 17 | Headings in column views sized by their class (heading-copytext-large: "Economy Light fare", "Kids' entertainment …", "Online check-in with tour operator's code", Santorini's and Punta Cana's subheads …) | the class lost in the import: 28 px light | document | mine | fixed: the marker from www's own markup, 65 headings in 18 documents |
| 18 | Footer without a search field or country switch; Follow us a fourth link column | a search and country row on top; Follow us under the columns | document | mine | fixed in both footers (badges, in-columns) |
| 19 | Footer: legal links one per line on phones and larger; more space round the rows at 1440 | two per line, 14 px | theme | mine | fixed (brief 394): www's a.link-large is 18/18 bold #f4f4f4 for the column and the legal links (the rendered capture); Discover's theme: --footer-link-size 18 px, the legal row 18 px, one per line on phones (--footer-legal-direction: column); 38 px from link to link as www's |
| 20 | Santorini: "Flight time approx. 3 hours" and "JTR Airport" as two boxed cards side by side | stacked text in the grey band | document | mine | fixed (brief 394): www's two text-only teaser cards to the flight search (a.teaser.card) as a carousel-cards grid two-up in the grey band, 615/622 x 94 at 1440 and 331/346 x 91 at 390 as www's (20 px padding, 1 px 30 % dark sky blue border, 6 px corners, the soft shadow, also Santorini's weather cards) |
| 21 | Customer service: "You can also contact us via WhatsApp" and "Is your baggage delayed" side by side, a small QR code | stacked, a large QR code | document | mine | fixed (brief 394): www's column rows ([before the trip | feedback], [WhatsApp | delayed baggage]) as columns-media with the Discover option side-picture: the WhatsApp text and the QR code side by side (301 px each at 1440, www 297), the QR code under the text on phones; de/de had all of it as loose paragraphs, now both rows |
| 22 | Traveling with children: one accordion of nine items, the first ("Baggage regulations for children", with two pictures) open, the second "Important information about children's travel documents" (corrected in brief 394: not two groups) | one group of nine, that item missing | document (import) | mine | fixed (brief 394): the item "Important information about children's travel documents" / "Wichtige Informationen zu Reisedokumenten von Kindern" (www's text) second of 9; the first item open as www's, by the new accordion-columns option open-first (brand-neutral, test/accordion-columns-open-first.test.mjs) |
| 23 | The phone number on Customer service 18 px regular; Baggage's table values regular; "Your benefits on board" night sky blue | 16/24; bold; dark sky blue | document; theme | mine | fixed (brief 394): links in running text 18 px regular as www's .richtext a (the phone number with them); table row headers regular as www's cells. Fixed (brief 396): "Your benefits on board" / "Ihre Vorteile an Bord" night sky blue #002554 as www's column-view title (rgb(0, 37, 84), the other headings rgb(0, 62, 123)), by the Discover section style column-titles on Business Class's two tab sections (test/discover-396.test.mjs). The capture has no other column-view title. To check against www (not in the capture; DA has a heading right over a columns-media on them): premium-economy-class ("Your benefits on board"), fleet/a320-200, a330-300, a350-900 ("Did you know...?"), additional-services/rail-and-fly, profile/travel-id, customer-service/flight-disruptions, profile/account-statement, en and de |
| 24 | Offers cards: a "Compare cities" box on each card | none | design | lh-com shared block (destination-finder) | fixed (Discover only, BRANDS gridCompare: only discover-parity-001 has offer pages with the box, the other brands' captures have no offers grid): each offer card has www's "Compare cities" / "Städte vergleichen" checkbox, 18/24 regular dark sky blue, 10 px from the card's left and 20 px from its bottom; ticked "Added to compare" with "See comparison", announced in a live region. "See comparison" opens a modal dialog as www's df-compare-modal (its CSS and its labels from the captures; www's opened modal is not captured): the sticky headline, one column per ticked city (picture, city, country, price), the activities on #f4f4f4, "Flight Information" with duration and stops from the offer answer, "Calendar" to the destination page; 1231 px wide, 1.2 columns visible on phones, 3.4 from 1025 px. Escape, the close button or the backdrop closes it, the focus back on "See comparison". Checked locally at 1440 and 390 with the recorded FRA offers (keyboard, axe 0); live prices on discover.turnsthe.page are the user's check. Brief 412, against www's dialog (capture discover-compare-001): "See comparison" makes www's one request, GET /service/api/destinationfinder/flightinfo/FRA?destination=SZG&destination=LCA (one per ticked city in tick order, from the visitor's browser as the finder's other calls), ticking none; Duration and Stops from its answer ("From 1h", "From 3h 45min", "Ab 9Std. 35Min.", "Nonstop available"; the offer's own when it has no answer); www's headline "Compare destinations and flights from Frankfurt" / "Reiseziele und Flüge ab Frankfurt vergleichen"; the focus on Close when it opens and back on the clicked card's "See comparison" after Escape. Checked locally (de/en 1440, de/de 390) against the capture's recorded answers served as www; live on discover.turnsthe.page is the user's check. At 390 the second column runs off the right edge, as www |
| 25 | Travellers: a modal ("Travel details") | lh-com's popover panel | design | lh-com shared block | left, as the user decided (one EMA) |
| 26 | Header: no cart item in the bar | a "Shopping cart" item in the bar | shared | lh-com shared code (blocks/header) | open: whether www shows it once the cart holds a flight is not in the capture (a capture with a filled cart would tell) |
| 27 | The "Departure - Return" label above the date fields once focused | on focus the label sits over Chrome's mm/dd/yyyy | shared | lh-com shared block (flight search) | fixed in the flight search (3ba047f7, every brand): the field stays empty until a date is picked, the date then under the label (checked at 390 and 1440 on every brand host) |
| 28 | Fares, offers, the stage campaign | other prices and the earlier campaign | data | – | not a difference (changes with time); the fare and offer APIs do not answer this environment |
| 29 | The booking code entry (ema-adobe, 369/373) | – | – | – | left as it is (the brief) |
| 30 | Additional services: each row of two teaser cards its own .twocolumn, 80 px between rows | 20 px between rows; the last two cards (Tec4Med, Uptrip) in one row, www shows them one a row | theme; document | mine | part fixed, f43d5ef1 (the sweep after brief 470, tools/reports/parity-2026-11-08/sweep-brands.md): carousel-cards (grid, two-up) rows 80 px apart from 768 px (3416 px at 1440 on preview, www 3656; was 3176). Brief 482: fixed. The merge was brief 387's one-off teaserGrids on the documents; a fresh import writes each of www's .twocolumn as its own block (Tec4Med and Uptrip alone in theirs), and the theme spaces consecutive two-up blocks as the rows of one (40 px on phones, 80 px from 768 px; test/discover-sweep-471.test.mjs). Drafts of the capture rendered on discover.turnsthe.page with the local CSS: de/de 3,877 px at 1440 (www 4,093; the document 3,350), 4,625 at 390 (www 4,571); de/en 3,416 (3,656) and 4,402 (4,386); the rows 498 px apart at 1440 as www's. Re-import: reimport-482-discover.txt (2) |
| 31 | Tab sets on phones (check-in at the airport, Business Class, Santorini; theme four_y): every panel closed | the first panel open (the pages 15 to 95 % taller at 390) | shared | mine | fixed, f43d5ef1 (the sweep after brief 470, tools/reports/parity-2026-11-08/sweep-brands.md): scripts/section-tabs.js closes all on brand discover as on b2b; check-in at the airport at 390 1810 px (www 2117; was 4134), Business Class 2875 (www 3071; was 5656) |
| 32 | The footer on phones (every page) | sections 84 px under the top, titles 14/15.4 in rows 24 px apart whose white line stops 22 px from each side; Follow us 14/28; no line over the legal links, 60 px under the icons and 24 px apart (1,271 px) | titles 18 px on full-width lines 47 px apart, the links 38 px apart under a divider (802 px) | theme | mine (footer) | fixed (brief 474, c0dd212): 1,274 px |
| 33 | Homepage (de/en, de/de): the stage to "Economy Class Offers" | 93 px | 157 px: the document's {spacer-60} (www's space under the stage) on top of the section's 56 px and the heading's 40 px | document | mine (homepage) | fixed (brief 474): the spacer out of both documents, uploaded and previewed; 5 / 13 px off at 1440 / 390 |
| 34 | Additional services (de/en): the Airportr card's picture | www's picture | a picture taken from www's URL at each preview (about:error when that fetch fails) | document | mine | fixed (brief 486): the card points at the DA copy of the same file (Discover's DAM mirror in DA, content/dam/four_y/.../c-1691221580-airport-gate-couple-2-4y-2407-ex2907-ecirgb.jpg, 2560 x 1440, the picture of the capture's card), as de/de's card already did; the document uploaded to DA, read back (equal to the local copy) and previewed: every card's picture loads |
| 35 | New destinations (xx/en, xx/de, xx/fr /book/new-destinations) | www's current list | the 2025/26 programme ("Agadir from October 26, 2026"; documents of 30 October) while our de/en and de/de new-destinations (imported 1 November) already list the 2027 one ("Agadir since October 26, 2026", Genoa, Seattle, Glasgow ...) | document | the harness | older than www: reimport-486-discover.txt (3), xx/en first (no request to www; the comparison is our two imports) |

After the fixes the type comparison (www's measured text against ours, matched by text, 52 page
widths) went from 469 differences to 107, most of them rows 19 to 23 and measurement artefacts
(www's link arrows are an icon font the measurement takes as the link's text).

### Documents on preview (not published)

The 22 documents of `preview-paths.txt` were read from DA (lh-discover), changed by
`tools/importer/discover-parity-387.mjs --capture <discover-parity-001>`, uploaded to DA and
previewed on main--lh-discover--moved-permanently.aem.page with `tools/importer/da-upload.mjs
--site lh-discover`; DA was checked unchanged since the read just before the upload, and DA's
documents match the local ones after it. Publishing is the user's.

Brief 394: 6 documents read from DA (unchanged since brief 387's upload, published by the user),
changed by a scratch script (the accordion item and option, Santorini's cards, Customer service's
rows), DA checked unchanged just before the upload, uploaded and previewed, not published
(`preview-paths-394.txt`).

Brief 396: `/de/en/discover/travel-classes/business-class` and its de/de version (the section style column-titles,
row 23) read from DA, checked unchanged just before the upload, uploaded and previewed, not published
(`preview-paths-396.txt`).

### Commits

- 47ab079d: the theme rows 1 to 13 (and A2), `test/discover-parity-387.test.mjs`,
  `tools/importer/discover-parity-387.mjs` with `test/discover-parity-apply-387.test.mjs`, this
  report, `preview-paths.txt` and lh-discover's upload state.
- The commit after it: the tool keeps DA's `&amp;` in link attributes (linkedom wrote them bare; the
  preview served the links right either way); 7 documents uploaded again with it, and this section.

### Checked after the push (47ab079d)

- **main--lh-discover--moved-permanently.aem.page** (main's code, the changed documents) and
  **discover.turnsthe.page** (main's code, the published documents), de/en homepage, de/de Business
  Class, de/en Additional services, 1440 and 390: the brand's theme loaded; h1 48 px (36 on
  phones) #003e7b; copy LufthansaText 16/24 #002554; quick links LufthansaHead 18/24 (14/18 on
  phones); the logo 116 x 40 (110 x 38); the tiles white with their 5 icons; the footer's stripes;
  every picture loaded. The preview also shows the documents' changes: Business Class's two tabs
  ("Langstrecke | Kurz- und Mittelstrecke"), the teaser grid on Additional services, no footer search
  row. discover.turnsthe.page shows the published documents (no tabs, the footer search row) until
  they are published.
- **The other brands** (lufthansa /de/en/homepage, swiss, austrian, brussels, ita, tap, airdolomiti,
  cargo, b2b, 1440): each its own brand class, Discover's theme not loaded, blocks and footer
  loaded, no page errors and no "failed to load module".

## Regression check (offline package 2026-11-06, item 4)

Shared code changed a lot since 5 November, so the 26 pages of `discover-parity-001` (sha256 `b08cb37e…330eb`,
checked again) were rendered at 1440 and 390 with main's code of 2026-11-05 17:02 UTC (`0098269a`, the last
Discover commit) and with main's code of 2026-11-06 16:20 UTC, both over the same lh-discover preview content:
the page heights are equal on all 52, and the full-page screenshots are identical pixel for pixel (a check
of the comparison on two different pages: 6.68 % differ). No regression, nothing to fix; the rows above
stand as they were (their differences to www are the ones listed: the offers app, the forms, the content).
