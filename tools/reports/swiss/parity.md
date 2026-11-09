# SWISS against www: parity (brief 380)

swiss.turnsthe.page (lh-swiss) against www.swiss.com, ch/en and ch/de at 390 and 1440, 24 pages:

- `/ch/<ll>/homepage`;
- the nine first-level menu pages: `/prepare/overview-flights`, `/prepare/overview-travel-information`,
  `/prepare/special-care`, `/book-and-manage/overview-manage`, `/book-and-manage/overview-extra-services`,
  `/fly/on-board/travel-classes`, `/fly/on-board`, `/discover/overview-inspiration`, `/magazine/<ll>`;
- `/customer-support/contact-us`;
- `/magazine/<ll>/inside-swiss/behind-the-scenes/a350-special-livery`.

## How it was compared (2026-11-05)

- **www:** the user's capture swiss-parity-001.tar.gz (sha256 `75a70815…b976f`, checked). It holds
  full-page screens, the HTML and shadow DOM, and the measured boxes and type per page and width;
  the menu tabs and the flight search's panels on the homepages. The agent did not load www.
- **Ours, before the fixes:** swiss.turnsthe.page at both widths, full-page screens, side by side
  with www's.
- **Ours, with the fixes:** a local dev server with the working tree's code, the site's preview
  content, and the changed documents applied to the preview's own pages. Locally the CH Sans fonts
  answer 404 (the site's host serves them), so local screens use the fallback font; sizes,
  weights, colours and boxes were compared, not glyph widths.
- **After the push:** see "Checked after the push" below.
- Differences only another language would show are out of scope.

## Rows

Kind: **theme** = `styles/themes/swiss.css` (body.brand-swiss rules and tokens); **shared** = lh-com's
shared code (brand-neutral: new tokens default to the old values); **document** = the lh-swiss
documents of ch/en and ch/de; **data** = what the page loads from Group services; **design** =
something www builds that the replica has no block for.

| Row | What www shows | What ours shows | Kind | Owner | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | Header bar 127 px (143 on phones), logo 147 x 34 from 1281 px (121 x 28 below), quick links, Login and Menu 16/22 regular (12/16 on phones), no dividers | bar 121 px (143 with lh-com's list padding), links 14 px bold, logo 28 px, dividers around Login | theme, shared tokens | mine | fixed |
| 2 | Menu white: tabs 28 px bold #101010 with red chevrons, group headings #101010, links and extras warm grey 16/25 regular, #ccc rules | lh-com's dark flyout, white bold links | theme, shared (header flyout tokens) | mine | fixed |
| 3 | At 1440 with no tab open, a photo left of the menu panel | no photo (the nav document has none) | document | the user's capture, then mine | fixed (brief 416, documents only: the header shows a nav picture after the menu list already): www's one flyoutImage for every tab, `/content/dam/lx/images/frontify_variations/7/c-472697710-777_103.jpg` (swiss-dam-101, sha256 checked), in lh-swiss's DA as `/content/dam/lx/images/frontify_variations/7/c-472697710-777-103.jpg` and previewed; all 227 SWISS roots' navs (each has its own) carry it after the menu list, uploaded and previewed, DA read back and every preview showing it (tools/reports/swiss/menu-photo-preview-paths.txt: the picture, then the navs). On main--lh-swiss--moved-permanently.aem.page ch/en and ch/de at 1440 the photo stands 240 to 934 px, 900 px high, left of the 506 px panel, as www's ch-en/ch-de-homepage-1440-menu.png; at 390 none, as www. Shows on swiss.turnsthe.page once published (picture first). Rollback: the navs without the paragraph `<p><picture><img src=".../c-472697710-777-103.jpg" alt=""></picture></p>` (DA's versions too), uploaded and previewed again |
| 4 | Alert strip text regular | bold | theme | mine | fixed |
| 5 | Flight search: boxed fields (50 px, #f2f2f2, 1 px border, the label inside), From and To one box on phones with the swap on the line, the options row warm grey regular | underlined fields, red bold options | theme | mine | fixed |
| 6 | Travellers: a modal (tabs Travel details / Redeem miles, class select, boxed steppers, alternative fares, access code, Continue) | lh-com's popover panel | design | flight search group variant (travellers-dialog.js, travellers-miles.js) | fixed: the window (brief 388) and its Redeem miles tab after it (capture redeem-miles-001): "Continue with login" to the replica's /ch/<ll>/login, "Become a member" to swiss.miles-and-more.com's row/<ll> enrolment, "Search award flights" (filled warm grey, the arrow after the text) to miles-and-more.com/de/de for every language, as www. ch/fr (capture redeem-miles-002): www's "Devenir membre" goes to Lufthansa's German enrolment (lufthansa.miles-and-more.com/web/row/de, back to www.lufthansa.com/es/de), a mistake on www; here swiss.miles-and-more.com/web/row/fr; ch/fr's texts are be/fr's word for word |
| 7 | Hero: the campaign at capture time ("Save CHF 40 with code NOV40", countdown) | Bengaluru teaser | none | | not a difference (content changes with time) |
| 8 | Winter deals: boxed cards, 126 px image left, Zurich 14 px and the city 18 px bold, the price red at the right; heading bold | unboxed rows with a plane badge, heading light; no prices for the agent | theme; data | mine; the user (prices) | done: layout and heading fixed; prices checked by the user on 2026-11-05 10:25 in a real browser on swiss.turnsthe.page/ch/en/homepage: the fare teaser showed 6 offers with live prices (the fare API refuses only the agent's environment) |
| 9 | Conditions: 16/22 regular warm grey | red bold | theme | mine | fixed |
| 10 | Topic cards: titles regular, link warm grey with a small triangle | bold titles, red bold link with an arrow | theme | mine | fixed |
| 11 | Flight offers: heading bold, origin red bold on a red line, Round trip a red pill (One way grey outline), offer cards with prices, All offers & destinations a red button | heading light, black origin, black pill; empty for the agent | theme; data | mine; the user (offers) | done: heading, origin, pills and Conditions fixed; checked by the user on 2026-11-05 10:25 in a real browser on swiss.turnsthe.page/ch/en/homepage: the destination finder showed 21 prices (the agent's environment is refused, not the host) |
| 12 | Looking for more: white square tiles, 1 px #ccc, www's black icons | grey rounded tiles, lh-com's navy icons | theme, document | mine | fixed: www's icons from the capture as `icons/swiss-*.svg`, the homepages' tiles use `:swiss-hotel:` etc. |
| 13 | Popular destinations: title warm grey 20 px | black 18 px | theme | mine | fixed |
| 14 | The footnote and "General Conditions" above the footer; "General Conditions" a link that opens a dialog | both under the flight offers; the conditions as text | document; shared | mine (position); lh-com (dialog) | position fixed in the homepages. The dialog: fixed (9b47738, scripts/fragment-dialog.js, every brand): "General Conditions" / "Allgemeine Bedingungen" is a link that opens /ch/en (de)/modals/general-conditions, www's text, as a dialog; documents on preview (tools/reports/general-conditions/preview-paths.txt) |
| 15 | Footer: column links at the content edge, 46 px rows with #ccc rules and a triangle, the social icons centred without a rule, a rule across the footer, the legal links centred without arrows, the STAR ALLIANCE mark; on phones everything stacked and centred | 12 px indent, plain links, social row left with a rule, arrows on the legal links, "A STAR ALLIANCE MEMBER" | theme, document | mine | fixed (the footers use `:star-alliance-horizontal:`) |
| 16 | Breadcrumb: "Home", 16/24, parents warm grey, red chevrons, current page red bold | the homepage's title, 14 px, blue | theme, shared tokens, document | mine | fixed (the homepages' Breadcrumb title "Home") |
| 17 | Every card on eight of the nine menu pages ends with a link row (www's link text) | the title is the link, no link row | document, theme | mine | fixed: 100 cards on 16 pages (the magazine landings have www's own cards, row 20), www's link texts from the capture |
| 18 | Cards 80 px under the H1 at 1440 (43 on phones; flights 72), 1 px #ccc border, the shadow only on hover; flights' second row three cards | 40 px, a shadow at rest; flights' second row two wide cards (one card has no image) | theme | mine | fixed |
| 19 | Contact: "Is there a topic missing?" with a note and Yes / No; the stage photo across the page | no question; the help app's stage inside the 1264 px column | document, shared; app | mine (question); open (stage) | question fixed: a feedback block (new optional note row) after the help app, below its FAQs teaser (www: above it). Stage width: fixed (4250353, every brand with the help app): the app's own CSS draws the photo calc(100vw - 15px) wide, main img's max-width held it to the column; now 1425 x 375 at 1440 and 375 x 210 at 390 as www's, the search card and the topics in the column (swiss.turnsthe.page). The help app's topic rules no longer run 13 px past the screen at 390 and 768 (a3ff993, every brand: the app's --full-width-horizontal-offset is the column's margin below 1024 px) |
| 20 | Magazine: www's own design (dark header over a full-bleed hero, the Magazine label, grey bands, cards with chips, More Stories, ad slots) | the main site's design | design | mine | built (fb49973, brief 400): styles/themes/swiss-magazine.css on /magazine/ only (a sub-site's own stylesheet, scripts/brand.js loadSubSiteTheme): the header white over the hero (72 px bar, www's white logo and "Magazine", the links at the right), the 16:9 hero (2:3 on phones) with its chip and 42/52 title, the Top Stories band, the lists in a 766 px column with 371 px cards, chips and More Stories links; the home documents (ch/en, ch/de: /magazine/en, /magazine/de and their navs) on preview (tools/reports/swiss/magazine-preview-paths.txt). Checked on the preview against swiss-parity-001 at 1440 and 390: hero 1440 x 810 and 390 x 585, the band from y 810 (585), the cards at x 337, 371 px wide, the title at 48,734, as www's. Left out: www's advertisement slots (we serve no ads; www's lists show five stories and an ad) and the offline reading tooltip. Differs: the lists' stories come from our index (www's picks differ in places). Brief 406 (bae28c8): the lists asked www.lufthansa.com for its blogOverview labels (…/lx/en, …/lx/de) since the magazine went up (4ac777b, 2 November) and were refused (CORS), so the block's own texts showed ("You are on page 1 of the results", "Sie befinden sich auf Ergebnisseite 1", screen-reader texts only on these lists); a brand page's lists now use those texts without asking (checked on swiss.turnsthe.page, en and de, 1440 and 390: no request, the same texts). The home and the a350 documents published by the user (5 November, job-2026-11-05-19-53-09-ccc4699a). Brief 403: the document step is a tool, tools/importer/swiss-mag-docs.mjs (4054866: prepare reads the documents from DA or a folder and writes the changed ones with changes.tsv; upload uploads and previews), for the user's harness: the 3 section pages per language get the band and More Stories / Mehr Stories, the 9 category pages their Parent row (their own list keeps its pages). On brief 400's saved sources it gives the 8 documents uploaded then byte for byte; not run over the documents by the agent |
| 21 | Article: narrow column, serif body, grey # tags, breadcrumb under the hero, ad slots | the main site's article layout | design | mine | built (fb49973, brief 400, code only, every article): the feature picture under the header, the breadcrumb under it (SWISS Magazine > section > category > page, from the documents' Parent rows), # tags in grey boxes, the 42/52 title and 24/31.2 lead in a 766 px column, the copy in Pensum Pro 18 px (served from our copies on the SWISS hosts since brief 403, 462aa65: lh-edge answers www's two font paths /etc.clientlibs/swissstoryhub/…/Pensum-Pro-Regular.woff(2) from etc.clientlibs-copies/, byte for byte; checked on swiss.turnsthe.page at 1440 and 390, en and de: the woff2 200 from our host, Pensum Pro loaded, the copy in it; title and lead in CH Sans, as www's CH Sans Bold and Light), captions 14/18, More Stories in two columns; the date and author at the article's end as www (the article header's date line hidden). The a350 article (ch/en, ch/de) and its parents on preview: breadcrumb at y 834 (609), tags 943 (718), title 1035 (862), as www's. Left out: the ad slot under the lead. The other articles (461 in en, 462 in de besides the a350 one, DA list of 2026-11-05) show the design now; their Parent rows come with tools/importer/swiss-mag-docs.mjs (brief 403, the user's harness runs it) |

### Pass 2 (brief 432, swiss-parity-002 of 2026-11-06)

swiss-parity-002a and -002b: 60 pages (ch/en, ch/de) at 1440 and 390, www read from the captures
only (rendered by a local server that blocks every outgoing request). Ours measured on
swiss.turnsthe.page and main--lh-swiss's aem.page, the fixes first on a local server (working
tree code, the step's documents in the preview's own pages), then on aem.page after the upload.
Heights are ours over www's.

| Row | What www shows | What ours showed | Kind | Owner | Status |
| --- | --- | --- | --- | --- | --- |
| 22 | The sidebar (airem-sidebar, 1,262 of the 4,641 snapshot pages): the content two thirds beside an aside a third wide, 40 px in, from 768 px | the content and the aside one after the other at the full width (Business 1.74, Economy 1.77, advance seat reservation 1.72 at 1440) | document; shared (decorateMain joins the asides before it builds the tab sets); theme | mine | fixed: tools/importer/swiss-sidebar.mjs (the content a section, the aside a section with the style sidebar-aside), the grid 2fr / 1fr in the theme (86ce78b, 54b91c4); ch/en+de 240 sidebars on 190 documents, uploaded and previewed |
| 23 | The aside's teasers: framed cards (1 px #ccc), the picture, a 24 px black title (20 px below 1025), the text, the link under a rule | loose headings, pictures and red bold links | document; theme | mine | fixed: a cards-teaser block per run of cards, styled as www's (54b91c4, 4029b37) |
| 24 | Image \| text views: the picture beside its text, 50 / 50 | the picture above the text at the full width | document | mine | fixed: columns-media rows (d085a29) |
| 25 | Two- to four-column views of text items (baggage irregularities' four steps: a number, a heading, text and links) | stacked, each step's number picture at the full width (2.17 at 1440) | document | mine | fixed: a columns-media row of a cell per item (4029b37): baggage irregularities 1.01 |
| 26 | Image \| image views (Recraft's design process: two by two; Miles & More) | four photos stacked at the full width (Recraft 3.28 at 1440) | document | mine | fixed: a columns-media row of a picture cell per item, option stacked (54b91c4): Recraft 1.09 |
| 27 | The text's h3 / h4 (heading-copytext-large): 16 / 17.6 px, 18 / 19.8 px from 1025 px, 20 px to the text | 20 to 24 px, 24 px below | theme | mine | fixed (54b91c4) |
| 28 | A link alone in its paragraph (maui-navigation-link hyper): warm grey 16 / 22 regular, a small triangle, up-right off-site, down in-page | red bold with lh-com's arrow | theme | mine | fixed (54b91c4) |
| 29 | Tabs: each panel holds its own content | animals travelling: the first panel empty, its content under a second tab bar; entertainment: the eJournals box and login under every tab (3.31 at 1440) | document | mine | fixed (4029b37, e482bfe): entertainment 0.98, animals 1.09 |
| 30 | — | sidebars the step leaves as they are (ch/en+de: 50 pages; their content starts inside a block such as an accordion or a table, or the aside is only partly in the document) | document | mine | fixed but 2 pages: brief 437 (283360b) 50 -> 37 pages; brief 440 37 -> 21; brief 445 (ffd9d6d) 21 -> 2: the page title no start, a start inside a block, text-only sidebar cells, ends before the next sidebar and at the last text the document has, no video player text, current information's accordion imported. Left: airportr en and de (the content a two-tab view, the aside after the tabs) |
| 31 | The aside's video teaser card plays the video in the card (215 px at 1440) | a text card whose title links to the video | document; shared (cards-teaser) | mine | fixed (brief 437, 283360b): the card's first cell the video's link, the title its text; cards-teaser builds the player (scripts/media.js, brand-neutral: a row whose first cell is a video link alone): Premium Economy 379 x 213 in the card |
| 32 | A grey box covering part of a tab panel (animals travelling, eJournals' notice) | the whole panel grey (animals) or no grey (eJournals) | document; shared (section-aside) | mine | fixed (brief 437, 67a4107): the content splits at www's box into parts of the same tab, scripts/section-aside.js joins a panel's parts beside the aside (each a section-part with its styles), the grey part as www's (#f2f2f2, to the page's edge, 32 px above and below) |
| 33 | FAQ questions in the accordion: on www not headings either (maui-headline type="none" renders a div; all 155 accordion items of the 60 captured pages) | accordion buttons, the text present | shared | — | no change (brief 440): the 8 "missing headings" came from the capture's measurement, which counts every maui-headline; axe on food and beverage and the payment options FAQ at 390 and 1440: 0 violations. Closed, as www (the user's decision, 2026-11-06): the titles stay buttons, not headings |
| 34 | Miles & More's tiers: an accordion with its first item open (www's maui-collapsible-item expanded) | all three closed (0.87) | document | mine | fixed (brief 437, 283360b): the accordion www opens first gets open-first (16 on ch/en+de; www's few other open items, voluntary rebooking's three and baggage provisions' two, open their first only); the aside's link list as www's (no bullets, grey, up-right off-site): Miles & More 1.06 at 1440, 0.97 at 390. The tier names are accordion titles on www too (as row 33) |
| 35 | The offers page's destination finder with fares | no results (Group fare data; the agent cannot verify it) | data | — | open, as row 13 |
| 36 | New destinations: the Toulouse photo, its text and button beside the magazine card | the photo above the sidebar at the full width (1.14 at 1440) | document | mine | fixed (1180c48: a picture opening the sidebar's content is the content's): 1.04 on aem.page |
| 37 | Accessible travel: the sidebar from the intro on, its grey notice in the content column | the notice a grey section of its own at the full width, the sidebar from the first heading (1.13 at 1440) | document; shared (section-aside); theme | mine | fixed (brief 440, item 4): the sidebar from the content's first text, the grey box a part (sidebar-part outside a tab), the sidebar's running text over its column as www's (lh-com's two thirds: 556 px lines, www 784): 1.03 at 1440 |
| 38 | Second-level menu pages (baggage, airport, check-in, lounges, travel regulations, fleet, corporate customers, children travelling): every card ends with a link row | the title the link, no link row (0.88 to 0.93) | document | mine | fixed (brief 445, c8fbca6, withCardLinks): baggage 1.00, airport 0.98 at 1440 |
| 39 | Icon teasers (teaser usp: the legal page, the FAQ hub): a 64 / 72 px icon centred above a 24 / 26.4 px title, no frame | framed cards with the icon at the card's width (legal 1.75), small red tiles (FAQ 0.82) | document; theme | mine | fixed (brief 445, c8fbca6): legal 1.02, FAQ 1.03 at 1440 |
| 40 | Headings' space below: h2 40 px at 1440 (20 px on phones), heading-small and text h3 20 px | 32 px (24 px on phones) | theme | mine | fixed (brief 445, 392ff5c) |
| 41 | Fleet, travel regulations: the cards two to a row | three-column grid, narrower cards (0.92, 0.93) | document | mine | fixed: the fleet and travel regulations hubs had it since brief 450 (fleet two-up; travel regulations is four to a row on www too, as ours); brief 467 gave two-up to the 27 documents still without it (the fleet's airbus-longhaul in 12 languages, the new destinations pages, corporate careers and SDG, one local page; withTwoUpCards against the snapshots, uploaded and previewed: preview-paths-467.txt) |
| 42 | Menu pages' card grids (manage, extra services, flights, travel information, special requests, travel classes, on board, inspiration) | two column-view spacings: a wrapper with class section (manage, extra services: 32 px above and below, the first card 72 px under the H1 at 390) and a plain one (special requests, travel information, travel classes, on board: 20 / 10 px, about 60 px); card titles 15 px over the text, 32 px between cards on phones | one spacing for all (the first card 43 px under the H1 below 1025 px, 64 px between grids), titles 10 px, 40 px between cards; 12 to 27 % at 390 | document; theme | mine | fixed (brief 474, 879fa38): the importer marks a plain view's grid plain-view (withPlainViews), the theme spaces each kind (in a section: 72 / 65 px on phones, 73 / 64 from 768 px; plain: 60 / 41, 80 / 81; 31 px between cards on phones; titles 15 px over the text); the cards' frames within 1-2 px of www's on the five hubs measured; 277 documents take the option on re-import (reimport-474-swiss.txt) |
| 43 | A350 (/<root>/discover/a350, 11 roots): the stage buttons' labels ("To behind the scenes", "À faits et chiffres", "Zu Hinter den Kulissen") | www's own: swiss-snapshots-046 (2026-11-07, the 22 files' sha256 as its manifest) has the same texts in its maui-button-link elements, en "To behind the scenes", fr "À faits et chiffres" and "À dans les coulisses", de "Zu den Zahlen und Fakten" and "Zu Hinter den Kulissen" | the same text in every language where we have the button (preview, main--lh-swiss, the 11 documents) | - | - | as www: no change (brief 499). The 15 buttons ours lacked (SWISS Wanderlust's in all 11; in el and it, facts' and behind the scenes': www's label there is the stage's heading, and Wanderlust's text names it too) fixed (brief 503, test/swiss-stage-buttons-503.test.mjs, www's stages from swiss-snapshots-046 and our 11 documents): withTeaserTexts (swiss-import.mjs) looks for a button as a link with its label outside the heading, and writes a missing one after the stage's text. Of the 4,721 SWISS snapshot pages (archives 001 to 046), 175 have stage texts: only the 11 A350 pages change. Drafts (preview's documents through the step) on preview at 1440: every stage with its button. Re-import: reimport-503-swiss.txt (11) |
| 44 | Homepages (ema-cashub's sweep-swiss-cashub.md rows 10, 12, 34): the fares' conditions | once, in the destination finder's dialog (www: page text only the footer disclaimer's note and its "General Conditions" button) | (a) the published homepages were imported before 75c9418e (the footer disclaimer a link to its dialog document): the dialog's text also as page text after the finder, 504 px at 390 on /de/de/homepage; (b) a re-import (import-homepage.bundle.js) gives the finder the dialog at its place among the fares components with conditions, but the fare teasers before it are blocks by then: /us/en/homepage got the winter sports offer's dialog and the general conditions were nowhere | importer | mine | fixed in the importer (the brief after 514, test/swiss-conditions-copy-518.test.mjs, test/general-conditions-host-518.test.mjs): swiss-import.mjs withFinderConditions, the finder's own dialog from the untouched snapshot in its Conditions row, the dialog's paragraphs out of the page flow (the note and the label stay); general-conditions-dialogs.mjs --host www.swiss.com writes the dialog documents the re-imported homepages link (196). Measured on swiss.turnsthe.page with draft documents (published + the step) against the recordings' www heights: /de/de/homepage 1440 4438 -> 4286 (www 4480, -4.3 %), 390 5705 -> 5201 (www 5196, +0.1 %); /us/en/homepage 1440 4399 -> 4269 (www 4467, -4.4 %), 390 5294 -> 4922 (www 4920, +0.04 %); /ch/en/homepage unchanged (no copy; its +4.3 % at 390 is the market's promotions). Waits for reimport-518-swiss-homepages.txt: 187 now, 40 after a capture (the brief after 518: a dialog label without Latin letters names its document with the root's language, /ch/ja/fragments/modals/ja; 206 dialog documents) |

## Accessibility (WCAG 2.0-2.2 A/AA)

- **axe-core 4.10.2** (wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa) on the 24 pages at 390 x 844
  and 1440 x 900, consent stored, scrolled through: 0 violations, locally with the fixes. Only
  colour-contrast "needs review" items over images and video remain (axe cannot decide them).
- **Keyboard**, homepage at both widths:
  - menu: Enter opens it, the focus moves in, Escape closes it and returns the focus;
  - flight search: every field has a ring, the dates' box rings as one;
  - alert strip: the link has a ring;
  - every ring is #101010, #6f6660 or the focus blue on white (at least 3:1).
- **Fixed in SWISS's files:** the footer's wrapped legal links are 24 px apart (WCAG 2.5.8; www 14 px).
- **Shared, fixed (0ce5698, every brand):** at 1440 an open tab's panel links come right after
  the tab, Shift+Tab goes back to it, Escape closes the panel (the focus on its tab), then the menu.

### Pass 2 (brief 432): the 84 SWISS pages of swiss-parity-001 and -002 on aem.page

- **axe-core 4.10.2**, same tags, at 390 and 1440 on main--lh-swiss--moved-permanently.aem.page
  after the pass 2 documents were previewed, the DEMO notice acknowledged (it is a modal dialog:
  with it open axe tests only the dialog, which a first run did), scrolled through: **0 violations
  on all 168 page-widths.**
- **Fixed (shared, brand-neutral):** frames with a title of their own: the magazine's "SWISS behind
  the wings" had 18 YouTube frames titled "YouTube-Video" (axe frame-title-unique, needs review);
  scripts/media.js numbers the next ones (4e55b9a; on aem.page after the push: 19 frames, 19 titles).
- **Needs review, not ours:** OneTrust's banner (`#onetrust-banner-sdk`, an aria-label on a div
  without a role: aria-prohibited-attr, every page); colour contrast axe cannot decide where the
  banner overlaps the page (110 page-widths).
- **Needs review, ours, left:** the flight search's travellers button points `aria-controls` at its
  dialog, which is built when it first opens (aria-valid-attr-value, the 10 pages with the flight
  search: the attribute names an id not yet in the page); the date field's contrast behind its
  floating label (axe cannot decide; the text is #101010 on white).

## Commits and documents

- `05dbb39` feat(swiss): rows 1, 2, 4, 5, 8-13, 15-18 in `styles/themes/swiss.css`; the header's flyout
  and the breadcrumb's tokens in their shared CSS (defaults: the old values); `icons/swiss-*.svg`;
  tests `test/swiss-parity-380.test.mjs`, `test/brand-swiss.test.mjs`. Rollback: `git revert 05dbb39`.
- `cf42f44` feat(feedback): the optional note row (row 19); test `test/feedback-note-380.test.mjs`.
  Rollback: `git revert cf42f44`.
- 22 lh-swiss documents uploaded to DA and previewed, not published: [preview-paths.txt](preview-paths.txt).
  They are the two footers, the two homepages, the two contact pages and 16 menu pages: eight per language, the magazine landing pages unchanged. The DA sources were
  backed up before and were unchanged right before the upload; after it, each DA document matched
  the local copy (`content-sites/lh-swiss/content/`).
- Until they are published, swiss.turnsthe.page shows the new code with the old documents: no card
  link rows, the old Star Alliance graphic, the homepage's title in the breadcrumb, lh-com's tile
  icons, no questionnaire. Everything else in the rows above is already live with the code.

## Checked after the push

- **Build** for `cf42f44`: success.
- **main--lh-swiss--moved-permanently.aem.page** (new code, new documents): the 22 documents carry
  their changes; axe on the 24 pages at 390 and 1440 shows 0 violations. Header 127 px (143 on
  phones), breadcrumb "Home" in warm grey, cards at www's 326 px at 1440, 6 link rows on travel
  information, the white flyout, the footer rows, the STAR ALLIANCE mark.
- **swiss.turnsthe.page** (new code, published documents): header, flyout, footer rows, boxed
  flight search and the other theme rows as above, with CH Sans. The contact page's help app
  renders in the 1264 px column (row 19, open).
- **Other brands:** smoke after the push gives the same differing rows as before it on lufthansa,
  lufthansa-edge, cargo, airdolomiti, austrian, ita, discover and TAP (swiss and brussels have no
  smoke baseline). lufthansa, austrian and brussels keep their dark flyout and 18 px bold links.
- **Lint and the full suite** before the push: lint clean, lh-edge 57 and site 276 test files, none failing.
