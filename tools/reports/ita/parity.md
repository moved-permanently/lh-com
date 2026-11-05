# ITA Airways against www: parity and accessibility (brief 391)

ita.turnsthe.page (lh-ita) against www.ita-airways.com, it/en and it/it at 390 and 1440, 26 pages
(13 per language):

- `homepage`;
- `book-and-prepare/flights-overview`, `/offers`, `/travel-information`, `/other-requests`;
- `manage-my-bookings/manage`, `/extra-services`, `/partners`;
- `world-of-ita-airways/travel-classes`, `/services-on-board`, `/discover-ita-airways`;
- `help-and-contact`;
- the info page `book-and-prepare/travel-information/baggage/carry-on-baggage`.

## How it was compared (2026-11-05)

- **www:** the user's capture ita-parity-001.tar.gz (sha256 `0e48c72e…f35e9f1`, checked; 527 files).
  The agent did not load www. Its full-page screens and measurements were compared with ours.
  www's values (boxes, type, colours, borders, shadows) were read from its own CSS: the capture's
  `.shadow.html` pages rendered with the captured stylesheets and fonts by a local static server
  (not the archive's `serve.py`), without www's scripts.
- **Ours, before:** ita.turnsthe.page at both widths, full-page screens side by side with www's.
- **Ours, with the fixes:** a local dev server with the working tree's code, the site's preview
  content, and the changed documents applied to the preview's own pages.
- The capture's 390 screens were taken in a desktop Chrome with a 15 px scrollbar (content 375 px
  wide), so www's phone layout sits up to 15 px left of ours; sizes were compared, not those offsets.
- The DEMO badge (brief 386) is ours and left out of the comparison. Locale work is out of scope.

## Rows

Kind: **theme** = `styles/themes/ita.css` (tokens and body.brand-ita rules); **shared** = lh-com's
shared code (brand-neutral); **document** = the lh-ita documents of it/en and it/it;
**data** = what the page loads from Group services; **design** = something www builds that the
replica has no block for.

| Row | What www shows | What ours showed | Kind | Owner | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | Header bar 112 px (132 on phones), logo 196 x 29 (162 x 24 on phones), quick links 16/24 bold (12/16 on phones) | 122 px (140), logo 270 x 40 (189 x 28), links 14/18 | theme | mine | fixed |
| 2 | Menu white: dark blue tabs 28 px, panel headings 24 px, links 18/27 regular (in Arial: www asks for LufthansaText, which it never loads), extras 16 px bold, ITA blue chevrons, blue 32 px square back and close buttons, a 24 px title on phones | dark navy flyout, white bold links, plain buttons | theme | mine | fixed |
| 3 | it/en menu: "Summer destinations Italy 2027", "Summer destinations Europe 2027"; it/it: one entry "Mete estive Italia ed Europa 2027"; the cart extra "Your Cart" | it/en: the Italian labels; it/it: two entries; "Shopping cart preview" | document; shared | mine; lh-com header | labels fixed in the navs. The cart label: fixed in lh-com's header (9f93486, every brand with www's capture): the bar's icon is named "Shopping cart preview", the menu's item reads "Your Cart" (it/en); it/it keeps "Anteprima del carrello" in both (www's Italian menu is not in the capture) |
| 4 | Alert strip 70 px from 768 px, headline 16/24 bold (#b01411 on #fdf5f5 when critical, dark blue on #f4f8fc otherwise), a round ! or i, previous / next chevrons stacked 30 px apart | 44 px, 14/18, a triangle, chevrons 24 x 18 (axe target-size) | theme | mine | fixed: www's sizes, colours and icons; previous / next 24 px targets 6 px apart (WCAG 2.5.8) |
| 5 | Flight search: 50 px boxes (1 px #72727f, 8 px corners, the label 12/18 inside), the dates a 48 px box, From and To separate boxes on phones with the swap inside To, the options row 16 px, Find flights 48 px 16 px bold | underlined fields, 14 px options, 50 px 18 px button | theme | mine | fixed |
| 6 | Hero card: white, 8 px corners, padding 40 48, 48 px headline | the same | none | | not a difference (content changes with time) |
| 7 | Wide teaser cards: 1 px #d1d1d5, 12 px corners, www's shadow, 36/39.6 px titles 32 px above the link; dots 12 px blue rings, the current a 20 x 12 px blue pill | lighter border, 8 px corners, 28 px titles; 8 px grey dots, the current one navy | theme; shared | mine; the user's call (dots) | cards fixed (391). Dots fixed (c73f6f1): the carousels' dot tokens, ITA's theme draws www's 12 px #0171cf rings and the current one as a 20 x 12 px pill, in the 24 px targets (87f5d985) |
| 8 | Flight offers: heading 28 px bold, origin ITA blue bold on a blue line, pills outlined ITA blue (the chosen one filled); offer cards with prices | heading 36 px light, navy origin and pill; no offers for the agent | theme; data | mine; the user (offers) | fixed (heading, origin, pills). The offer cards need the fare service, which refuses the agent: please check on the host. Prices are live (the user's check, brief 393). www's selection (New York, Brussels, Vienna, …: www's own POST /service/api/lhg-fare-teaser/fareteaser/offers/ROM) is not available to a browser on ita.turnsthe.page: the fare teaser service refuses foreign origins (403 "Invalid CORS request" on www.lufthansa.com; www.ita-airways.com not tested from here), and the only way around is a Worker calling www (lh-proxy: 502 since 29 October). Ours stays www.lufthansa.com's destination finder (ROM, ITA's portal): open, see the report for the user's browser check |
| 9 | Icon tiles ITA blue, 168 px, white icons and labels, www's shadow | grey tiles, navy icons | theme | mine | fixed |
| 10 | The footnote and "General Conditions" (a dialog link) above the footer | not on our homepages | document; shared | lh-com (dialog) | fixed (9b47738, scripts/fragment-dialog.js): www's footnote and "General Conditions" / "Condizioni generali" above the footer of both homepages, a link that opens /it/en (it)/modals/general-conditions (www's text) as a dialog; on preview (tools/reports/general-conditions/preview-paths.txt) |
| 11 | Footer: column headings 18 px without a rule (20 px accordion rows 32 px apart on phones), 12/16.8 px bold links in Arial 37 px apart, the payment and social rows with 24 px headings, white 20 % rules, the legal links 12 px with the language button at their end, the company note centred 14/21, the ITA AIRWAYS mark and STAR ALLIANCE in the logo row | 24 px headings with a rule, 14 px links, small badge headings, the language button at the top, the note left 12 px, the header logo with "inspired by Alitalia", "A STAR ALLIANCE MEMBER" | theme, document | mine | fixed: www's mark rebuilt from the capture's shapes as `icons/ita-airways-logo-inverted.svg`, the footers use `:ita-airways-logo-inverted:` and `:star-alliance-horizontal:`. www's footer says "Italia \| English" on the en menu pages and "Italy \| English" on the en homepage: www's own text, ours says "Italy \| English" |
| 12 | Breadcrumb "Home" 16/24 bold ITA blue, the current page regular dark blue, 17 px under the bar | the homepage's title, 14 px, the current page bold | theme, document | mine | fixed (the homepages' Breadcrumb title "Home") |
| 13 | Menu pages' cards: a near-white border, www's shadow (stronger on hover), titles 28 px (22 on phones), 16/24 descriptions, a link row "→ Check-in: learn more" 16/17.6 bold | #b0b0b0 border, 24 px titles, 18 px descriptions, the title as the link | theme, document | mine | fixed: 111 cards on 20 pages, www's link texts from the capture |
| 14 | Help page: the help app (search, topics, FAQs, its own breadcrumb), then "Is there a topic missing?" with its note and Yes / No | the fallback list; the app refused (its script from www.ita-airways.com, cross-origin); the question without its note (it/en), none (it/it); "Yes, No" as one button | shared; document; theme | mine | fixed: the app from ita.turnsthe.page's own /digitalhangar/ (micro-frontend OWN_HOST_BRANDS, as SWISS and Brussels); the note row (it/en) and the whole question (it/it); the feedback block splits "Yes, No" when the page's decoration wraps it in one paragraph (this also fixes SWISS's ch/en and ch/de contact pages of brief 380, which showed one "Yes, No" button). Whether the app renders: only on the host, after the push (below) Since 9238300 (the AZ copies) the app renders on ita.turnsthe.page; its stage photo runs across the page since 4250353. Styled as www's since 7e5c9de and 0de5ebb (brief 393): maui-theme-az (ITA's az-fonts.css and icon.library.AZ.js load instead of Lufthansa's), X-Line b, help-center-web 4.3.2, no topic rules (www's design system has no --border-color for ITA); checked on ita.turnsthe.page at 390 and 1440 against the capture's shots. Still different: www's own questionnaire ("Is there a topic missing?") sits above the FAQs card (ours is the feedback block after the app: www's questionnaire service refuses our host), and at 1440 www's FAQs card lies on a grey band |
| 15 | Info page: a two-column layout (content and a Quick Links sidebar with two cards), boxed accordions (1 px #d1d1d5, 8 px corners, the shadow, 20/28 titles) | one column, no Quick Links, accordion rows with rules | theme; design | mine; open | accordions fixed. The sidebar: the importer wrote no Quick Links and lh-com has no sidebar section layout; a new section style and the importer's part, open |

## Accessibility (WCAG 2.0-2.2 A/AA)

- **axe-core 4.10.2** on the 26 pages at 390 x 844 and 1440 x 900 on ita.turnsthe.page, before the
  fixes: one finding, `target-size` on the alert strip's previous / next (24 x 18, stacked) at
  1440 on both homepages. Fixed in ITA's theme (row 4).
- **Keyboard**, homepage at both widths:
  - every stop up to the flight search has a ring;
  - menu: Enter opens it, the focus moves in, Escape closes it and returns the focus;
  - the closing flyout is inert at once (d81e71f9): the Tab right after Escape lands on the alert strip;
  - the alert strip: Next moves 1/4 to 2/4;
  - the dots are 24 x 24 (87f5d985).
- **Shared, since fixed:** Chromium's native date fields made three Tab stops per date
  (day, month, year); fixed in the flight search (3ba047f7, every brand): one stop per date, a readonly field that opens the
  browser's calendar (Enter, Space, Alt+Down, a click), as www's one field.

## Checked after the push

Commits on main (rollback: `git revert <hash>`):

- `cf032c7` feat(ita): ITA's theme (rows 1, 2, 4, 5, 7 cards, 8, 9, 11, 12, 13, 15 accordions) and
  `icons/ita-airways-logo-inverted.svg`, test/ita-parity-391.test.mjs;
- `5fcd2bb` fix(micro-frontend): ITA's help app from ita.turnsthe.page (row 14), test/micro-frontend-apps.test.mjs;
- `8c01f99` fix(feedback): "Yes, No" in one paragraph is two answers (row 14, SWISS 380), test/feedback-commas-391.test.mjs.

Documents: the 28 in `preview-paths.txt`, uploaded to DA and previewed on
main--lh-ita--moved-permanently.aem.page (28 uploaded, 28 previewed; DA read back equal 28 of 28,
the DA sources before the upload kept by the agent). Nothing published.

On the hosts after the build of `8c01f99`:

- **ita.turnsthe.page**: the bar 112 px at 1440, the strip 70 px with 16 px text, the white menu
  with Arial links, the boxed 1 px / 8 px flight search fields. Pages on the host show the published
  documents until the user publishes; the changed documents were checked on the preview.
- **main--lh-ita--moved-permanently.aem.page**: axe 0 violations on the 26 pages at 390 and 1440.
- **Help app (row 14)**: the module now loads from ita.turnsthe.page/digitalhangar/, but www refuses
  lh-edge (403) its JSON, and lh-edge has copies for LX and SN only, so the app does not render and
  the fallback list stays. Needed from www, captured by the user, for lh-edge's copies:
  `/digitalhangar/cs-help-center/feature-manager/AZ/features.json`,
  `/digitalhangar/cs-help-center/translations/web/AZ/` `en-IT.json`, `en.json`, `it-IT.json`,
  `it.json`, and the `topics/AZ/` files for en and it.
- **SWISS** (shared feedback fix): ch/en and ch/de contact pages on main--lh-swiss's preview now
  show Yes and No as two answers.
- **Other brands** (shared code): lufthansa bar 122 px, strip 44 px / 14 px, dark flyout, underlined
  fields, as before; austrian unchanged by this brief.
- **Smoke** of the brand hosts before and after the push: one row more differs on lufthansa,
  lufthansa-edge, austrian, ita and discover, the same row everywhere:
  `/message-center/config/cti-pages.json` now answered by lh-edge's one Message Center store
  (262cee2, pushed upstream at the same time; one hash on every host). Not from this brief.
  airdolomiti: same rows.
