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
| 3 | At 1440 with no tab open, a photo left of the menu panel | no photo (the nav document has none) | document | the user's capture, then mine | open: the photo's URL is not in the capture. Needed: www's menu at 1440 with the flyout image's `src` (and per tab, if it changes) |
| 4 | Alert strip text regular | bold | theme | mine | fixed |
| 5 | Flight search: boxed fields (50 px, #f2f2f2, 1 px border, the label inside), From and To one box on phones with the swap on the line, the options row warm grey regular | underlined fields, red bold options | theme | mine | fixed |
| 6 | Travellers: a modal (tabs Travel details / Redeem miles, class select, boxed steppers, alternative fares, access code, Continue) | lh-com's popover panel | design | lh-com shared block (flight-search passenger picker) | open: a SWISS variant of the panel is a larger build; the user's call |
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
| 19 | Contact: "Is there a topic missing?" with a note and Yes / No; the stage photo across the page | no question; the help app's stage inside the 1264 px column | document, shared; app | mine (question); open (stage) | question fixed: a feedback block (new optional note row) after the help app, below its FAQs teaser (www: above it). Stage width: fixed (4250353, every brand with the help app): the app's own CSS draws the photo calc(100vw - 15px) wide, main img's max-width held it to the column; now 1425 x 375 at 1440 and 375 x 210 at 390 as www's, the search card and the topics in the column (swiss.turnsthe.page) |
| 20 | Magazine: www's own design (dark header over a full-bleed hero, the Magazine label, grey bands, cards with chips, More Stories, ad slots) | the main site's design | design | the user's call | open: a SWISS magazine template is new blocks; proposal, not built |
| 21 | Article: narrow column, serif body, grey # tags, breadcrumb under the hero, ad slots | the main site's article layout | design | the user's call | open, with row 20 |

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
