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
| 10 | Homepage teaser rows' spacing | each two-column row 40 px padding above and below, 26 px apart (rows 495, 495, 430, 430, 458 px; 520 px from title to title) | the rows of one columns-media block 66 px apart, no padding (about 40 px less per row, -400 px on the page) | theme | mine | fixed (brief 421): columns-media rows 106 px apart from 768 px on B2B (www's .column-view 4rem above, 2rem below, the item's 2rem); homepage 4,964 px at 1440 (www 5,200: the rest is rows 12, 13) |
| 11 | Stages inside a two-column row (partner-plus-benefit's "Save while flying", eXperts' "Modern airline retailing" and "Current flight information", partner-plus-benefit's BusinessToGo) | the stage in its half: kicker and title (18 px bold, light) on the picture, a small outlined button | a full-width banner with a navy card (42 px title), the column's other half under it (+600 px) | import + block | mine | fixed (brief 421): b2b-import.mjs maps a stage in a column view to columns-media option stage (the picture with the kicker, title and button on it, www's gradient, the button hidden below 768 px); 10 documents re-imported, uploaded, previewed (tools/reports/b2b/preview-paths-421.txt); partner-plus-benefit 3,272 px at 1440 (www 3,287) |
| 12 | Homepage's first news teaser ("Lufthansa Group and Portuguese Government Sign Agreement … TAP Air Portugal") | there (www 2026-11-06) | missing: the snapshots of 2026-11-01 do not have it (-521 px) | content | the user's harness (a fresh snapshot of the homepages, then b2b-import.mjs) | fixed by the user's harness (b2b-snapshots-008, `fresh-2026-11-06.md`): the TAP teaser on both homepages, published 2026-11-06 |
| 13 | Product & Service News list (program/experts/news) | the items of 2 and 3 November 2026 first | the list from 27 October (the snapshot's; fewer items, -842 px at 1440) | content | the user's harness (a fresh snapshot) | fixed by the user's harness (b2b-snapshots-008): the 2 and 3 November items and 13 new articles, published 2026-11-06 |
| 14 | 390 menu panel | a card 15 px from the edges with rounded corners, the logo and the close button in its head; entries LufthansaText 18 px bold; a boxed 56 px search button at the bottom | full screen, no logo; entries 16 px; search as an icon and the word | block (header, b2b options) | mine | fixed (brief 421): below 1025 px the menu a white card 15 px from the top and sides (radius 12, www's shadow), the logo and the close button in its 72 px head (header option flyoutLogo), entries 18 px semi-bold 58 px apart, the search a 56 px box at the bottom; measured at 390 within 1-2 px of www |
| 15 | 390 menu, Login entry | a back chevron and "Login" left in the head, no close button | a back arrow, "Login" centred, a close button | block (header) | mine | fixed (brief 421): the sub-panel's 64 px head the back chevron and the title (18 px semi-bold, left, at x 75 as www's), no close button, no logo |
| 16 | Search field focused | the placeholder moves up into a small label, the line under the field goes | a blue focus box, the placeholder stays | block (search-results, b2b) | mine | fixed (brief 421): the label floats to the field's top edge (12 px grey), the placeholder and the line under the field go; the blue focus outline stays (the keyboard's focus indicator, kept on purpose) |
| 17 | Menu buttons' font (1440) | plain sans-serif (Helvetica on a Mac, Arial on Windows: www's buttons do not inherit LufthansaText) | LufthansaText 16 px | theme | the user's decision (www's look or its brand font) | fixed (brief 421, the user's decision: copy www): the bar's menu buttons and the phone menu's entries in the plain sans-serif stack, B2B only; www's own CSS names a face it does not load for these buttons and falls back to the browser's sans-serif (Helvetica on a Mac, Arial on Windows), which is what the capture shows |
| 18 | Link lists (contact's airline links, "More information", the article's "Back to News") | 12 px links 14 px apart; "Back to News" with a left arrow | 14 px bold, 22 px apart; a right arrow | theme | mine | fixed (brief 421): links alone in their paragraph 14 / 18 bold with a 16 px arrow 5 px before the text, column link lists 21 px apart (www's maui-navigation-link medium; contact's airline links 122 px wide as www's); the articles' "Back to News" / "Zurück zu Aktuelles" with the arrow to the left (www's variant back); off-site links keep the up-right arrow |
| 19 | Contact's country select (hotline-finder) | an underlined select with a small label above it | a boxed select | block (hotline-finder, b2b) | mine | fixed (brief 421): the label shown above (12 / 14 grey), a 38 px field with a 2 px line under an 18 / 24 value and a 24 px chevron, no box (www's maui-select) |
| 20 | Footer | en 339 px at 1440 (de 349: its link row wraps), 505 px at 390; LinkedIn in a circle | en 312 px (de 348), 543 px at 390; LinkedIn in a square | theme (footer) | mine | fixed (brief 421): the tagline 28 / 36.4 on phones, 80 px under it from 1025 px, the legal links 22 px under the note, LinkedIn www's "in" in a 48 px circle; contact en 341 px at 1440 (www 339), 502 at 390 (www 505) |
| 21 | Type details | h2 32/38, h3 18/24, breadcrumb 14/18 | h2 32/37, h3 18/20, breadcrumb 14/20; some text 18/27 | theme | mine | fixed (brief 421): www's line-height steps (h1 42/48 and 32/36.2, h2 32/38 and 28/32, the small headings + 4 px, h3/h4 18/24) in the content and the hotline finder, the cards' titles + 4 px, compact carousel cards 24 px, the breadcrumb 14/18; measured equal on contact and the homepage at 1440 and 390 |
| 22 | 390 menu toggle | three thin lines, 32 px | a small bold icon | block (header) | mine | fixed (brief 421): www's three thin lines, 32 x 24 px |
| 23 | Celebrating shared stories' stage | an inspirational stage video (the capture shows its first frame) | the stage picture with its text | live (a video www plays) | - | as www's content; nothing to do |
| 24 | Login, eXperts member area, PartnerPlusBenefit sign-in | www's sign-in apps | links to them on www | live | Lufthansa (the apps) | as before |
| 25 | Spacing between components (homepage, Product & Service News, the article, contact) | every component in a column view (40 px above, 20 + 20 below from 768 px, half below): blocks 80 px apart (40 on phones), the news lists' rows 80 apart, a band's view right under a column, a separator after a band instead of a gap, the page's last link 9 px above the footer | sibling blocks 24 px apart, list rows 64, the 48 px section gap on top of the column markers' padding, 48 px above the footer | theme | mine | fixed (brief 427): B2B rules for the column-view rhythm; homepage -236 -> -19 px at 1440, Product & Service News -116 -> +26 (390: +213 -> -4), the article +169 -> +33 (390: +207 -> +71) |
| 26 | Video beside text (homepage's Summer 2027 film) | www's player 16:9 (622 x 350) | the poster's ratio (622 x 280) | theme | mine | fixed (brief 427): 16:9 beside text; a full-width stage video keeps its poster's ratio |
| 27 | Card copy and partner tile titles (homepage's Travel solutions, LinkedIn tile) | icon modules 18 / 24 regular; the partner teaser's title 18 / 24 bold | 16 / 24 light; 24 / 28 | theme | mine | fixed (brief 427) |
| 28 | A stage outside a column (de/de and xx/de contact: "Erhalten Sie einen Einblick in die Lufthansa Group") | www's .stage in the content's width (1264 x 404, 346 x 110 on a phone), the title 18 / 24 bold and a small outlined button top left over a dark gradient, the footer right under it | a full-width stage with a navy card (42 px title) | theme | mine | fixed (brief 427): B2B rules for hero-card-overlay (the only two B2B documents with it); de/de contact at 390 +473 -> -62 px |
| 29 | Inspirational stage (celebrating-shared-stories: "Looking forward to the next century of aviation") | www's promo-hero in the content's width: the picture a 450 px panel, the teal gradient beside it, the text 88 px in, a light 32 px heading, a white button (508 px high); stacked on phones | a full-bleed hero-campaign with a bold 42 px heading on the picture (810 px), a white strip under its band | theme | mine | fixed (offline package, item 3): B2B-scoped; the stage 500 x 1264 px, its text at x 626 as www's; celebrating at 1440 +189 -> -137 px (the rest spread over the page, -18 to -92) |
| 30 | Contact: a heading after a divider ("Passenger Receipts …") | 72 px under the line (the next column view's padding) | 29 px | theme | mine | fixed (item 3): 20 px, 40 from 768 px |
| 31 | Contact de/en: the first column's end, then a separator, then the grey band | the band's view right under the column | the 48 px section gap too: round 3's rule only matched a column end that ends the section | theme | mine | fixed (item 3); round 3's rule had also been dropped whole while it held a :has() inside a :has() (a guard test now) |
| 32 | Member pages at de/de (fund, history, usermanagement, reports), signed in on b2b.turnsthe.page with the three test accounts against b2b-member-answers-001 (sha256 f4cc8ca1...b044) | German labels, code values and roles | the same: every label, code value and role German, the 403 views the German no-access line; English only in the backend's own data (category names, product texts), which the answers carry in English only | - | mine | checked (brief 486): nothing to close; the backend data stays as it comes (brief 464's rows) |
| 33 | The stage's button on phones (PartnerPlusBenefit's "Anmelden", eXperts' "Mehr erfahren" / "Learn More"; de/de, de/en) | the small secondary button under the subheadline at 390 as at 1440 (b2b-parity-001: the overlay's foot, x 42) | hidden below 768 px (brief 421) | theme | mine | fixed (the brief after 505, test/b2b-stage-button-phones-506.test.mjs; test/b2b-stage-columns.test.mjs no longer expects it hidden): b2b.css. On preview with the rules at 390: "Anmelden" at x 42 (www 42), the eXperts' two "Learn More". The pages' heights unchanged (the button sits in the stage, whose height is its picture's): PartnerPlusBenefit de 5,262 at 390 (www 5,361), en 5,042 (www 5,061); eXperts de 9,761 (www 9,807), en 9,559 (www 9,638). No document change |
| 34 | Contact (de/de, de/en): the hotline finder (www's PartnerPlusBenefit box, .dcep-ppb-hotlinebox) | its title a B2B h3 (24 / 28 on phones, 28 / 32 at 1440, 400, one line beside the picture), 30 px above it, 48 px under the hours on phones, 30 under the picture from 768 px | the finder's own 18 / 24 bold title in a 386 px column (two lines at 1440), 20 / 40 px above, 20 / 40 under: the box 56 px shorter at 390, 20 taller at 1440 (the ranking after 523) | theme | mine | fixed (the brief after 523, test/b2b-hotline-finder-526.test.mjs): b2b.css. On b2b.turnsthe.page with the rule (/de/de/about-us/contact): the box 893 + 500 px at 390 (www 896 + 510), 811 + 487 at 1440 (www 814 + 487); the page 390 4056 -> 4102 (www 4153), 1440 3417 -> 3397 (www 3499: the 40 px missing after the separator under the box, the shared separator and grey-band rules, were hidden by the box's 20 too many); de/en 390 3805 -> 3847 (www 3832), 1440 3026 -> 3006 (www 3070). No document change |
| 35 | A card carousel right under text in a white section (about-us de/de and de/en, celebrating-shared-stories) | www's two-item column view there, 4rem above it (64 px from 768 px, 44 on phones) | in the text's section, 24 px under it: about-us -2.0 % at 1440, celebrating-shared-stories -2.9 % (the ranking after 523) | theme | mine | fixed (the brief after 526, test/b2b-carousel-after-text-530.test.mjs): b2b.css, in a white section 44 / 64 px above such a carousel (a grey band's padding spaces it as before). On b2b.turnsthe.page with the rule, every recorded page at 1440 and 390: 20 of 52 change, none more than 1 % further from www (experts/news and route-network de/en at 1440 +0.8 points the most), about-us 1440 -2.0 -> -0.5 %, de/en experts 1440 -1.8 -> -0.5 %, celebrating-shared-stories -2.9 -> -2.4 %. No document change |
| 36 | travel-solutions/lufthansa-group-airlines (de/en, de/de): the airline rows | www's two-item views nested in one view, 83 px apart at 1440 | rows of one columns-media block, 106 px apart (b2b.css row 10, measured on the homepage's top-level views): +2.4 % at 1440 (the ranking after 523) | importer; theme | mine | fixed (the brief after 526, test/b2b-nested-columns-530.test.mjs): b2b-import.mjs marks a one-column view that holds column views (withNestedColumnMarkers) and gives the block made of it the option nested (withNestedColumns); b2b.css: a nested block's rows 83 px apart from 768 px. The recordings imported offline (mappedOf, import-info.bundle.js): the airlines page columns-media (nested), the homepage unchanged. Measured with the option at 1440: de/en 4108 -> 4039 px (www 4013), de/de 4142 -> 4073 (www 4071); 390 unchanged. Waits for reimport-530-b2b-nested.txt (2) |

## Brief 418

Fixed rows 1 to 9 (theme, shared code brand-neutral or b2b-scoped, the importer) and the documents
re-imported from the B2B snapshots with b2b-import.mjs (13 x 2 pages; 11 changed, the other 15 came
out byte for byte), read from DA first (the de/de homepage was a re-save of the same text and
pictures by its author on 2026-11-04, nothing lost) and checked unchanged just before the upload;
uploaded and previewed (`preview-paths-418.txt`), DA equal to local afterwards; nothing published.
Open: rows 10 to 22 (mine, a next pass), 12 and 13 (a fresh snapshot), 17 (the user's decision).

Round 2 (brief 421, 2026-11-06): rows 10, 11 and 14-22 fixed, B2B-scoped (body.brand-b2b, the
header option flyoutLogo); rows 12 and 13 with the user's harness (fresh snapshots of the two
homepages and the news lists). Still apart after round 2 and outside these rows: de/de contact at
390 (+473 px), the article pages (+169 px at 1440, +207 at 390) and experts news (+116 to +213 px);
next pass.

Round 3 (brief 427, 2026-11-06): rows 25-28 fixed, B2B-scoped CSS only (styles/themes/b2b.css),
no document changed. Measured against b2b-parity-001 (taken 2026-11-06, so it already has the
fresh homepage teaser and list items). Still apart, next pass: contact (both languages: the hotline
finder 46 px shorter, www shows an opening-hours table this hotline record does not have; Corporate
-> Passenger Receipts 56 px short; de/en's first column has no closing column marker, so its band
keeps the 48 px gap), the de/de contact stage 20 px closer to the airline picture than www's on
phones, celebrating-shared-stories (+170 to +189 px at 1440, -143 to -149 at 390), the news
overview (+37 px at 1440, +88 at 390), the airlines page at 390 (+83 to +131 px).

Offline package (2026-11-06, item 3): rows 29-31 fixed, B2B-scoped CSS only, no document changed.
Still apart: contact's hotline finder (www's capture shows an opening-hours table this hotline record
has not), contact de/de -78 px at 1440, the news overview (+37 / +88 px), the airlines page at 390
(+83 to +131 px), celebrating (-137 / -117 px, spread).

Accessibility (offline package item 5): axe on the 26 pages at 1440 and 390 on the preview; fixed: the
linked pictures without a name (columns-media), the outlined button on grey bands (#49748b, 4.64 : 1),
the link lists 24 px apart and the carousel dots as 24 px targets (WCAG 2.5.8; www's 21 px and 8 px
dots are under it). Rechecked: 0 findings on all 52.
