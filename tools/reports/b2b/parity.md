# Lufthansa Group for Business: b2b.turnsthe.page and business.lufthansagroup.com (brief 418)

Site lh-b2b, host b2b.turnsthe.page (it answers without a sign-in; ours measured there before the
fixes, and on a local server with this branch's code over lh-b2b's preview after them). www is
compared from the user's capture `b2b-parity-001` only (sha256 1c391af6…, taken 2026-11-06
01:01-01:14 UTC; nothing loaded from www by the agent): 26 pages, de/en and de/de with the same
slug, at 1440 x 900 and 390 x 844, and its states (each homepage menu panel at 1440, the 390 menu
and its Login entry, the search field focused).

Pages: `homepage`, `news`, `program/experts/news`, `news/celebrating-shared-stories`,
`program/partner-plus-benefit`, `program/experts`, `travel-management/route-network`,
`travel-solutions/ndc`, `travel-solutions/lufthansa-group-airlines`, `about-us`,
`about-us/contact`, `lhg4b-search/lhg4b-search-prelogin`,
`news/travel-id-now-required-for-online-check-in`.

How: our pages measured with the capture's own fields (headings' font, size, weight, colour; header,
main, footer, sections, buttons, breadcrumb, body text); full-page shots side by side with www's at
both widths; the states from the same clicks on ours. Kinds: theme (styles/themes/b2b.css and
b2b-scoped rules), block (shared code), import (tools/importer, the documents re-imported from the
B2B snapshots tools/importer/bd-snapshots/business.lufthansagroup.com), document, content (what www
shows today that the snapshots of 2026-11-01 do not have), live (data or an app on www).

## Page heights (px), www / ours before / ours after (de/en; de/de alike)

| page | 1440 | 390 |
| --- | --- | --- |
| homepage | 5,200 / 6,625 / 4,259 | 7,892 / 7,299 / 7,060 |
| news | 4,161 / 9,400 / 4,132 | 1,298 / 22,965 / 1,432 |
| program/experts/news | 5,089 / 4,247 / 3,646 | 15,698 / 12,443 / 12,208 |
| news/celebrating-shared-stories | 8,265 / 15,661 / 8,413 | 12,438 / 15,186 / 12,360 |
| program/partner-plus-benefit | 3,287 / 3,899 / 3,899 | 5,061 / 5,720 / 5,720 |
| program/experts | 4,952 / 5,608 / 5,632 | 9,638 / 10,628 / 10,628 |
| travel-management/route-network | 4,037 / 4,964 / 4,030 | 5,739 / 5,888 / 5,905 |
| travel-solutions/ndc | 1,635 / 1,493 / 1,661 | 1,963 / 2,080 / 2,080 |
| travel-solutions/lufthansa-group-airlines | 4,013 / 3,881 / 3,929 | 5,286 / 5,506 / 5,506 |
| about-us | 2,761 / 4,819 / 2,670 | 3,305 / 3,304 / 3,382 |
| about-us/contact | 3,070 / 3,124 / 3,124 | 3,832 / 4,107 / 4,107 |
| lhg4b-search/lhg4b-search-prelogin | 900 / 900 / 900 | 844 / 1,009 / 850 |
| news/travel-id-now-required-for-online-check-in | 2,520 / 2,674 / 2,674 | 4,457 / 4,721 / 4,721 |

The header bar is www's at both widths (15, 15, 1410 x 81 at 1440; 360 x 61 at 390), the 1440 menu
panels too (the five entries, their sections side by side, the same links).

## Rows

| # | What | www | ours (before) | kind | owner | status |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Running text width (every page) | `.b2b-neo p { max-width: 80rem }`: paragraphs 800 px at 1440 | 1,264 px (only the homepage stage's copy was 800) | theme | mine | fixed (brief 418): every paragraph of a B2B page's content 800 px at most, a paragraph that holds a picture keeps the column (styles.css, brand-b2b) |
| 2 | Teaser cards two to a row (homepage "Ready for NDC" / "Loyalty pays off", about-us' four, route network's "For companies" / "For travel agents") | bordered cards, picture on top, bold title, text | each picture across the column, title and text as an arrow link under it (+2,000 px on about-us) | import | mine | fixed (brief 418): lh-com's info template maps a two-column view of a.teaser.card to carousel-cards (grid two-up, the parser had it), as the three- and four-column views; documents re-imported |
| 3 | 100 years' interviews (celebrating-shared-stories) | a swiper of cards, four in view, an arrow and dots | each interview a full-width picture with its title (+7,400 px) | import | mine | fixed (brief 418): a top-level swiper of a.teaser.card as carousel-cards (four-up); 8,413 px against www's 8,265 at 1440 |
| 4 | Partner teasers (homepage's LinkedIn row, Product & Service News' archive link) | a 48 px icon left of a bold title and a 14 px line | the icon drawn across the column (a 1,000 px LinkedIn logo) | import | mine | fixed (brief 418): a partner teaser in a two- or one-column view as cards-icon-text partner (the three-column one was mapped already) |
| 5 | Homepage "Travel solutions" title | an h2 over the four icon modules | missing | import | mine | fixed (brief 418): the icon modules keep their column view's title before the block (parsers/cards-icon-text.js) |
| 6 | Newsroom categories (news, de/en and de/de) | tabs Product & Services / Connections / Our Partner News, one panel shown; at 390 a collapsed accordion | the three lists one after the other (9,400 px; 22,965 at 390) | import + block | mine | fixed (brief 418): b2b-import.mjs marks www's tab sets (swiss-import.mjs's markers) and gives a panel that is a grey section of its own its Tab rows (withTabPanels): one tab set, scripts/section-tabs.js; on brand b2b every accordion item starts closed below 768 px, as www's (1,432 px at 390) |
| 7 | Route network's "Lufthansa Group network and timetable updates" | h1.heading-small: 28 px, normal case | 32 px uppercase (the theme's h1) | block | mine | fixed (brief 418): a heading marker (heading-medium, -small, copytext) resets the theme's uppercase, brand-neutral (lh-com's h1 is not uppercase) |
| 8 | Outlined buttons ("Register now", "Discover now", "Subscribe to the eXperts newsletter" …) | buttonsecondary: b2b-blue #4d7b93 text and 2 px border, no fill | deep blue on white | theme | mine | fixed (brief 418): --button-secondary-color #4d7b93, a new --button-secondary-surface (b2b transparent, white elsewhere as before) |
| 9 | Pre-login search page without a query | the search box alone | "Your search for" and "Your search results could not be loaded." | block | mine | fixed (brief 418): search-results shows the empty box on brand b2b as on SWISS (850 px at 390 against www's 844) |
| 10 | Homepage teaser rows' spacing | each two-column row 40 px padding above and below, 26 px apart (rows 495, 495, 430, 430, 458 px; 520 px from title to title) | the rows of one columns-media block 66 px apart, no padding (about 40 px less per row, -400 px on the page) | theme | mine | open: www's column-view rhythm for columns-media rows on B2B (the pages' other two-column rows to be measured first) |
| 11 | Stages inside a two-column row (partner-plus-benefit's "Save while flying", eXperts' "Modern airline retailing" and "Current flight information", partner-plus-benefit's BusinessToGo) | the stage in its half: kicker and title (18 px bold, light) on the picture, a small outlined button | a full-width banner with a navy card (42 px title), the column's other half under it (+600 px) | import + block | mine | open: the b2b-stage mapping (hero-card-overlay) for a stage in a column; next pass |
| 12 | Homepage's first news teaser ("Lufthansa Group and Portuguese Government Sign Agreement … TAP Air Portugal") | there (www 2026-11-06) | missing: the snapshots of 2026-11-01 do not have it (-521 px) | content | the user's harness (a fresh snapshot of the homepages, then b2b-import.mjs) | open |
| 13 | Product & Service News list (program/experts/news) | the items of 2 and 3 November 2026 first | the list from 27 October (the snapshot's; fewer items, -842 px at 1440) | content | the user's harness (a fresh snapshot) | open |
| 14 | 390 menu panel | a card 15 px from the edges with rounded corners, the logo and the close button in its head; entries LufthansaText 18 px bold; a boxed 56 px search button at the bottom | full screen, no logo; entries 16 px; search as an icon and the word | block (header, b2b options) | mine | open |
| 15 | 390 menu, Login entry | a back chevron and "Login" left in the head, no close button | a back arrow, "Login" centred, a close button | block (header) | mine | open |
| 16 | Search field focused | the placeholder moves up into a small label, the line under the field goes | a blue focus box, the placeholder stays | block (search-results, b2b) | mine | open |
| 17 | Menu buttons' font (1440) | plain sans-serif (Helvetica on a Mac, Arial on Windows: www's buttons do not inherit LufthansaText) | LufthansaText 16 px | theme | the user's decision (www's look or its brand font) | open |
| 18 | Link lists (contact's airline links, "More information", the article's "Back to News") | 12 px links 14 px apart; "Back to News" with a left arrow | 14 px bold, 22 px apart; a right arrow | theme | mine | open |
| 19 | Contact's country select (hotline-finder) | an underlined select with a small label above it | a boxed select | block (hotline-finder, b2b) | mine | open |
| 20 | Footer | en 339 px at 1440 (de 349: its link row wraps), 505 px at 390; LinkedIn in a circle | en 312 px (de 348), 543 px at 390; LinkedIn in a square | theme (footer) | mine | open |
| 21 | Type details | h2 32/38, h3 18/24, breadcrumb 14/18 | h2 32/37, h3 18/20, breadcrumb 14/20; some text 18/27 | theme | mine | open |
| 22 | 390 menu toggle | three thin lines, 32 px | a small bold icon | block (header) | mine | open |
| 23 | Celebrating shared stories' stage | an inspirational stage video (the capture shows its first frame) | the stage picture with its text | live (a video www plays) | - | as www's content; nothing to do |
| 24 | Login, eXperts member area, PartnerPlusBenefit sign-in | www's sign-in apps | links to them on www | live | Lufthansa (the apps) | as before |

## Brief 418

Fixed rows 1 to 9 (theme, shared code brand-neutral or b2b-scoped, the importer) and the documents
re-imported from the B2B snapshots with b2b-import.mjs (13 x 2 pages; 11 changed, the other 15 came
out byte for byte), read from DA first (the de/de homepage was a re-save of the same text and
pictures by its author on 2026-11-04, nothing lost) and checked unchanged just before the upload;
uploaded and previewed (`preview-paths-418.txt`), DA equal to local afterwards; nothing published.
Open: rows 10 to 22 (mine, a next pass), 12 and 13 (a fresh snapshot), 17 (the user's decision).
