# ema-test, offline package of 2026-11-06 (Austrian, B2B, Discover)

Running report, committed as I go. Nothing is published: documents are uploaded to DA and previewed
(`da-upload.mjs`), and checked on the aem.page preview hosts. Times in UTC.

## 1. Brief 427 (B2B round 3): done

- `af6a8973` fix(importer): the importers import without the excat plugin. `test/b2b-parity-418.test.mjs`
  failed in the go-live child's clean clone because `b2b-import.mjs` (and four other importers) loaded
  the plugin's `strip-scripts.js`, outside git, when imported. Now `tools/importer/excat-plugin.mjs`
  loads it when it is there; the one test that really strips scripts skips without it. Checked in a
  fresh clone of origin/main with `npm ci`: 350 files pass with the plugin, 351 (one case skipped)
  with `EXCAT_MARKETPLACE` pointing nowhere. `library-entries` passes there too; it fails only in my
  workspace, against my stale untracked `content/library` copy.
- `cf906784` fix(b2b): rows 25-28 of `tools/reports/b2b/parity.md` (www's column-view spacing, the 16:9
  video beside text, the cards' copy, a stage outside a column), B2B-scoped CSS only, no document
  changed. Against b2b-parity-001 (1440 / 390): homepage -236 / -73 -> -19 / +41 px, Product & Service
  News -116 / +213 -> +26 / -4, the article +169 / +207 -> +33 / +71, de/de contact +46 / +473 -> -118 /
  -62.
- Checked: the 26 B2B pages at 1440 and 390 locally and on main--lh-b2b--moved-permanently.aem.page
  (equal); lufthansa.com's stage unchanged; smoke of the 12 hosts before and after each push, 0
  differences; builds green.
- Preview paths: none (no document changed).
- Open (item 3): contact's hotline hours and Corporate -> Passenger Receipts gaps, de/en contact's
  missing column marker, celebrating-shared-stories, the news overview, the airlines page at 390.

## 2. Austrian, deeper visual parity (austrian-parity-002)

Archive: `austrian-parity-002a.tar.gz` (sha256 `ea26c50e…9527`, checked; 31 pages). 002 and 002b not in the
drop yet at 08:25 (polled every 15 min, see the end). Compared at 1440 and 390 against
austrian.turnsthe.page and main--lh-austrian--moved-permanently.aem.page (equal on every page).

### 2a. Headings in Portada again (shared, brand-neutral)

- Every heading of 213 Austrian documents drew in LufthansaHead, not Portada: lh-com's cleanup gives a page
  whose www loads the digital assistant the metadata "Theme: digital-assistant", and `styles/styles.css`
  set the LufthansaHead face of lufthansa.com's assistant stylesheet on `body.digital-assistant`, over the
  brand theme. The same documents exist on lh-brussels (467) and lh-swiss / lh-swiss-mk (22): their
  headings lose Intelo / SWISS's face the same way.
- Fix: the rule is lufthansa.com's, now `body.brand-lufthansa.digital-assistant`
  (`test/digital-assistant-brand.test.mjs`). Checked locally: Austrian's h1 Portada (loaded), lufthansa.com's
  digital-assistant page still in its face. For ema-lufthansa (Brussels) and ema-adobe (SWISS): your
  digital-assistant pages get your theme's heading font back with this commit.

### 2b. Components and type of the deeper pages (importer, theme, 42 documents)

- 002b arrived 09:06 (sha256 `a79e58fa…3454`, checked; 29 pages); compared with 002a: 60 pages x 2 widths.
- `663b69a0` feat(austrian) and `e441c469` (bundles rebuilt after the rebase): Austrian templates for the
  check-in and flight-status pages (info's mappings plus their block), the teaser cards' link line, two-up
  card rows, the intro (copytext-large), the default h3 / h4, the lists. Rows 29-43 in
  `tools/reports/austrian/parity.md`.
- Documents (release order; no files): the 42 paths in `tools/reports/austrian/preview-paths-002.txt`,
  re-imported from the Austrian snapshots, read from DA first and rechecked unchanged before the upload,
  uploaded and previewed (`da-upload.mjs --site lh-austrian`: 46 uploaded, 0 problems), DA equal to local
  afterwards. Not published.
- Restored: four tab pages (missing-baggage, travelling-with-animals, unterhaltung-an-bord, austrian-app):
  their re-import lost the Tab rows of a grey band's section (lh-com's sections transformer now makes Tab
  sections itself, 515475be, besides Austrian's markers), so the content after the band showed under every
  tab. Uploaded again from their DA versions before mine and previewed: as they were. For ema-cashub: the
  interplay of lufthansa-sections.js's Tab sections with swiss-import.mjs's tab markers (row 43).
- Not uploaded: culinaryjourney (today's import drops its micro-frontend block) and new-destinations (its
  poi maps sit in accordion items, today's accordion parser keeps them inside): row 42.
- Checked on main--lh-austrian--moved-permanently.aem.page at 1440 and 390 (all 60 measured, the
  changed ones side by side with www): familien's two-up cards with link lines, online-check-in's steps,
  accordion and card row, Portada intros, CoreSans h3 / h4, the lists 5 px apart.
- Open (rows 36-43): steps in a tab panel, culinary-services' expanding panels and stage, QR / badge
  pairs, giftvoucher's icon steps, a card row's grey band, the two not uploaded, the tab pages.
- Rollback: `git revert e441c469 663b69a0` (and the documents: DA's versions before 11:00 UTC; the
  originals read at 08:30 / 09:30 are in /tmp/s407/da-orig until this machine restarts).

## 3. B2B: what was still open and ours after round 3

- Fixed (B2B-scoped CSS, `styles/themes/b2b.css`; rows 29-31 in `tools/reports/b2b/parity.md`; no document
  changed, no preview paths):
  - the inspirational stage on celebrating-shared-stories as www's promo-hero (content width, a 450 px picture
    panel, the teal gradient, the text 88 px in; stacked on phones): the page at 1440 +189 -> -137 px, the rest
    spread over the page (-18 to -92);
  - contact's heading after a divider 40 px down (www's column view), and de/en contact's first column (a column
    end followed by a separator) without the 48 px gap before the grey band;
  - round 3's "column end before a grey band" rule had been dropped whole by the browser after I added a
    selector with a :has() inside a :has(); rewritten, and a guard test (`test/b2b-parity-427.test.mjs`) fails
    on any nested :has() in the theme.
- For ema-cashub (shared, not changed): `styles/styles.css` has seven selectors with a :has() inside a :has()
  (the table-striped section rules after a band, the picture-before-a-block rule): browsers drop each of those
  rules whole today.
- Still apart: contact's hotline finder (an opening-hours table this hotline record has not), the news
  overview (+37 / +88 px), the airlines page at 390 (+83 to +131 px).
- A service restart (between about 12:00 and 15:50 UTC) wiped this machine's /tmp (the captures, my measuring scripts, the DA
  originals read this morning): DA's version history is the rollback for the documents from here on.

## 4. Discover: the 26 pages of discover-parity-001 on the current code

- `discover-parity-001.tar.gz` downloaded again (sha256 `b08cb37e…330eb`, the one on record). Rendered at 1440
  and 390 with main's code of 2026-11-05 17:02 UTC (`0098269a`, a worktree) and with today's main, over the same
  lh-discover preview content: heights equal on all 52 page/width pairs, full-page screenshots identical pixel
  for pixel (the pixel check itself verified on two different pages). No regression; nothing to fix, no new
  rows (`tools/reports/discover/parity.md`, "Regression check"). No document changed.

## 5. Accessibility pass: Austrian's and B2B's captured pages on aem.page

axe-core 4.10.2 (WCAG 2.0 / 2.1 A and AA, 2.2 AA) on main--lh-austrian--moved-permanently.aem.page (the 60
pages of austrian-parity-002) and main--lh-b2b--moved-permanently.aem.page (the 26 pages of b2b-parity-001),
1440 and 390, one page at a time; the demo notice removed first (its modal leaves the page inert: a first run
with it open missed findings), the consent accepted. A keyboard check of the new card link lines (familien):
a logical order, a 2 px blue focus ring on every stop.

Fixed (tests first):
- link-name (Austrian 6 pages, B2B 9 page / width pairs): a link holding only a picture without an alt text
  (www's linked teaser pictures) in columns-media. `blocks/columns-media/columns-media.js` (brand-neutral):
  when its row links the same page in text, the picture link is aria-hidden and out of the tab order (it
  stays clickable); otherwise its row's heading names it (`test/columns-media-image-links.test.mjs`).
- color-contrast (B2B: route-network, celebrating-shared-stories): the outlined button on a grey band,
  www's #4d7b93 on #f5f5f5 is 4.21 : 1; on grey bands #49748b (4.64 : 1), on white as before
  (`test/b2b-a11y-offline.test.mjs`).
- target-size (B2B contact, celebrating): the link lists 24 px from link to link (www's and round 2's 21 px
  are under WCAG 2.5.8; 3 px a link off www's), and B2B joins the brands whose carousel dots are 24 px targets
  (carousel-cards and carousel-images; `test/carousel-dots-374.test.mjs`, `test/carousel-dot-tokens.test.mjs`).
- Rechecked with the fixes (local code over the previews): B2B 0 findings on all 52; Austrian's 7 pages:
  the 6 columns-media pages clean.

Listed, not fixed:
- /at/de/lhg-staralliance-partner: the Star Alliance airlines' logo links have no alt text (not
  columns-media): the documents need the airlines' names as alt texts (content; next pass).
- The Austrian logo link in the bar (122 x 18 px at 390): target-size on one or two pages at 390 depending
  on what sits next to it; the logo's size is www's (shared header).
- Each Austrian teaser card has two tab stops to one page (title and link line), as the card's link line
  is its own link now; not a failure.

## Summary (19:10 UTC)

All five items done; nothing published. On main, in release order:

| item | commit | what | rollback |
| --- | --- | --- | --- |
| 1 | `af6a8973`, `cf906784` | importers without the excat plugin; B2B round 3 | `git revert` |
| 1 | `64348de9` | this report | – |
| 2 | `71cbf543` | the digital assistant's face on lufthansa.com only (every brand's headings) | `git revert` |
| 2 | `663b69a0`, `e441c469` | Austrian templates, cards, intro, h3 / h4, lists; bundles | `git revert`; the 42 documents: DA's versions before 11:00 UTC |
| 2 | `8fd60c71` | Austrian parity rows 28-43, `preview-paths-002.txt` | – |
| 3 | `08abae8c` | B2B rows 29-31 (stage, contact) | `git revert` |
| 4 | `4011c4d4` | Discover regression check (none) | – |
| 5 | `0f50d704` | accessibility fixes (columns-media, B2B button, link lists, dots) | `git revert` |

Preview paths (documents uploaded to DA and previewed, not published), release order, no files:
`tools/reports/austrian/preview-paths-002.txt` (42 Austrian pages); the four Austrian tab pages re-uploaded as they
were before (row 43). No B2B or Discover document changed.

Every push: lint and the suite (one failure throughout, `library-entries`, only in this workspace: its
untracked `content/library` copy is stale; it passes in a clean clone), smoke of the 12 hosts before and after (0
differences from my pushes; body changes on Austrian pages and lufthansa.com's sitemaps came from others'
publishing), builds green. Checked on main--lh-austrian--, main--lh-b2b-- and main--lh-discover--moved-permanently.aem.page.

Open, by owner:
- mine: Austrian rows 36-43 (steps in a tab panel, culinary-services' panels, QR / badge pairs, giftvoucher, a card row's
  band, culinaryjourney and new-destinations not re-imported, the tab pages); the Star Alliance logos' alt texts;
  B2B's hotline hours, news overview, airlines at 390.
- ema-cashub: lufthansa-sections.js's Tab sections and Austrian's tab markers (Austrian row 43); seven `styles.css`
  selectors with a :has() inside a :has() that browsers drop.
- ema-lufthansa (Brussels), ema-adobe (SWISS): your digital-assistant pages draw in your own heading font since `71cbf543`.

## Brief 438 (Austrian, B2B and Discover after the offline window)

### 1. Austrian rows 36 to 43 (tools/reports/austrian/parity.md)

Against austrian-parity-002a / 002b (sha256 as in the drop's files), 1440 and 390, www / before / now in px (now: measured on main--lh-austrian-- after the push):

| row | page | 1440 | 390 | what |
| --- | --- | --- | --- | --- |
| 36 | /at/de/missing-baggage | 4604 / 5413 / 4565 | 6522 / 6654 / 5972 | the first tab's steps four columns (the panel's bare wrapper unwrapped); 390 stacked as www; the rest of 390's gap is the FAQ accordion's type (not this row) |
| 39 | /at/en/austrian-app | 5360 / 6797 / 5267 | 6703 / 6332 / 6460 | the QR / badge pair side by side (a one-column view in a one-column view unwrapped); each tab panel text beside its picture as www |
| 40 | /at/en/book/flights/giftvoucher | 4066 / 4192 / 3777 | 5756 / 7685 / 5479 | "How does it work?" as cards-icon-text partner rows (32 px icons beside the titles, Portada 18 / 27 copy), its title kept |
| 41 | /at/de/bearbeitungsgebuehren | 3141 / 3785 / 3181 | 4125 / 5051 / 4131 | the grey band was there; three cards a row though one has no picture; a one-card slider below 1025 px (phone-slider) |
| 43 | the four tab pages | – | – | Austrian's side: withTabRuns gives a band inside a panel its Tab rows; missing-baggage and austrian-app re-imported; travelling-with-animals and unterhaltung-an-bord stay as DA has them (their re-import is no closer to www) |

Also: long button labels wrap as on www (missing-baggage's "Weitere häufig gestellte Fragen zu verspätetem Gepäck" was
clipped at 390, on the live preview too).

Found and fixed on the way: a re-import dropped the page metadata row `chat-button` (written outside the importer in
briefs 197 / 210). 11 of the 42 documents published at 17:05 had lost it: /at/de/pre-order-food, /at/de/familien,
/at/de/gesundes-reisen, /at/de/check-in, /at/en/at-the-airport, /at/en/accessible-travel, /at/en/unaccompanied-minors,
/at/en/online-check-in, /at/en/baggage, /at/en/international-lounges and doctor-on-board-news. The import now writes the row
from www's webchat topic (equal to the row on all 139 documents that have both). The 11 were taken from DA, given their
row, uploaded and previewed: **they need publishing again** to get the chat button back on live.

The video's caption and audio-description links on missing-baggage are not lost by a re-import: austrian-dam.mjs --switch
adds them after the import (run for every re-imported document here).

lh-com's phone-slider import (115ea542, from ema-cashub's side) only fires when the view still holds www's swiper copy, but
lufthansa-cleanup's removeMobileDuplicates drops that copy first when it equals the grid (Austrian's swipers have no loop
duplicates). The parser now also reads a mark the Austrian import sets (3c382f28). The mark applies to 740 Austrian
documents' card rows; only this brief's pages were re-imported. The rest show as a slider on phones after their next
re-import.

Still open, mine:
- row 37: culinary-services' expanding panels are www's .herobanner (three hero items, the active one widened, its title
  over it). lh-com has no block for it; it needs a block variant and a parser (design work). The document is unchanged.
- row 42: culinaryjourney (micro-frontend) and new-destinations (two poi maps inside accordion items): today's import still
  drops these blocks, so DA keeps both documents as they were.

For ema-cashub (row 43's shared part, left as it is): lufthansa-sections.js' Tab sections next to Austrian's tab markers.

### 2. The Star Alliance partner pages

Done (5616b6ef): the 10 lhg-staralliance-partner documents (at/de, at/en, cn/zh, es/es, fr/fr, gr/el, it/it, jp/ja, pl/pl,
ru/ru): 68 logo links without a name now carry their airline's name from www's page (www's own alt texts kept). Uploaded and
previewed, DA = local, axe link-name gone.

### 3. B2B (against b2b-parity-001, sha256 1c391af6…, fetched again after /tmp was wiped; 1440 / 390, www / before / now)

- Contact's hotline hours: no change was needed. The DE record has www's hours (Monday to Friday 08:00 - 18:00) and the
  finder shows them on de/en and de/de exactly as www's capture does; www's xx pages show none either. My earlier note
  that "this hotline record has not" the hours was wrong. Contact now -44 / -27 (de/en) and -78 / -65 (de/de), spread over the page.
- News overview: at 390 the tab set is now www's accordion: 30 px under the heading, closed rows on white without their
  grey band, the footer right after the last row (1298 / 1386 / 1296, de/de 1294 / 1382 / 1292). At 1440 it stays +36 (not
  changed).
- Airlines page at 390: a stacked text cell that ends with its link line sits 14 px above the picture, and the block's
  rows are 42 px apart, as www: every airline's heading now within 5 px of www's (it was 24 px more per airline); the pages' ends
  were already about 80 px short after the last airline (de/en 5286 / 5417 / 5257, de/de 5454 / 5537 / 5377), open. The same rule reaches contact's two
  such cells (both 14 px on www) and route-network (no change).
B2B-scoped, below 768 px, no :has() inside a :has() (bba68615). No B2B document changed.

### 4. Discover accessibility (discover-parity-001's 26 pages on main--lh-discover--, 1440 and 390)

axe 4.10.2 (WCAG 2.0 to 2.2 A / AA): no violations of ours on any page at either width. The one finding, target-size on
the logo of whichever page comes first at 390, is the first skip link: it holds the focus after the consent banner
closes (OneTrust returns focus to the page start), and like any focused skip link it shows over the top of the logo.
That is expected, not a defect. Nothing changed.

### Summary (brief 438)

| item | commit | what | rollback |
| --- | --- | --- | --- |
| 2 | `5616b6ef` | Star Alliance partner logos named (import), 10 documents | `git revert`; the documents: DA's versions before 2026-11-06 21:00 UTC |
| 1 | `ad617d90` | Austrian rows 36, 39, 40, 41, 43 (import, theme), chat-button row kept | `git revert`; the 4 + 11 documents: DA's versions before 2026-11-06 23:30 UTC |
| 1 | `3c382f28` | the phone slider of a view the cleanup left without its swiper copy (parser, Austrian mark, bundles) | `git revert` |
| 3 | `bba68615` | B2B news tab set and airlines page below 768 px | `git revert` |
| 1-4 | `e81fcd08`, `c7a7d0ac` | parity rows 36-43, `preview-paths-438.txt`, this report; the upload state | – |
| 1-4 | this commit | the measurements after the push, smoke | – |

Preview paths (uploaded to DA and previewed, not published), release order, no files:
`tools/reports/austrian/preview-paths-438.txt`, 25 Austrian pages:
- the 10 lhg-staralliance-partner pages (item 2);
- /at/de/missing-baggage, /at/en/austrian-app, /at/de/bearbeitungsgebuehren, /at/en/book/flights/giftvoucher (item 1);
- the 11 pages with their chat-button row back (item 1; already live once, so they need re-publishing).
No B2B or Discover document changed.

Checks: lint and the full suite before the push (one failure, `library-entries`, only in this workspace: its untracked
`content/library` copy is stale; a clean clone skips it), my own tests after the last rebase (docs and data only came
in); smoke of the 12 hosts before and after: 0 differences from these commits (lufthansa's three hosts: a sitemap's
content changed, others' publishing). Pushed `d9b97cae..c7a7d0ac`.

## Brief 444 (Austrian's last rows and B2B)

### 1. Row 37, culinary-services' expanding panels

www's `.herobanner` (`.dcep-hero-banner`) is the component lh-com's `hero-banner` block was built for (Lufthansa's
food pages), so no new block was needed. The import maps it through a new Austrian template `austrian-hero-banner` (info
plus hub's hero-banner, austrian-templates.mjs). The content model stays simple: one row per panel, picture | H2 label,
H3 title, link, plus the overlay colour. Austrian theme: the title 48 / 50 below 1025 px, the button 10 px (20 px) under
it, the tab labels a plain sans 16 / 17.6 (18 / 19.8) as wide as the pane. Against austrian-parity-002a: 720 px at 1440
with panes 1029 / 206 / 206 (www 1028 / 206 / 206), 760 at 390x844 with 543 / 109 / 109 (www 542 / 108 / 108); each
label opens its pane. The page is 8244 / 8791 px against www's 8422 / 9166 (10714 / 9320 before).

Found on the way: lh-com's cleanup gave column markers and flow spacing (and the sections transformer its padded first
section) to the `info` template by name only, so Austrian's info-plus-a-block templates (check-in and flight status
since brief 427, now hero-banner) had neither. The templates now say `base: info` and both transformers take that as
info (99295754). lh-com's own templates are unchanged. Austrian's check-in and flight-status pages pick this up at
their next import.

### 2. Row 42, culinaryjourney and new-destinations

- culinaryjourney (10 languages): the import made www's `<culinary-hub>` a link to www and read the page with the info
  template, which has no micro-frontend mapping. Now the hub stays, and a page with it takes lh-com's `mfe` template
  (micro-frontend culinary-hub with its Configuration and API gateway rows). Against DA nothing is lost; the only
  difference is the `Theme: flow-spacing` row, which styles running text only, and these pages have none.
- new-destinations (10): www's points-of-interest maps sit inside accordion items, and the parser nested the map table
  in the accordion's cell, which lost both blocks. `withAccordionMapsHoisted` splits the accordion before each item
  with a map and puts the map first. The maps' points (21 maps) were only in DA's documents (an earlier import step);
  they are now recorded in `tools/importer/austrian-poi-points.json` and written in place of the parser's `Source`
  row (www doesn't answer aem.page). Against DA: nothing lost; the card row is now a phone slider, and the cards keep
  their link lines.

All 21 documents were re-imported, uploaded and previewed (the culinary hub app, both maps and both accordions render).

### 3. Row 43's shared part: lufthansa-sections.js

A grey band inside a tab panel opened a section of its own without the panel's Tab, so it showed under every tab
(c0b1d928). Now:
- in lh-com's own panels, a break inside a panel takes the panel's Tab, and a band stops at its panel (before, it made
  the whole tab control grey);
- in the panels SWISS's and Austrian's import mark with paragraphs, a break between two markers takes the panel's Tab
  and Tabs, and a panel that holds a break ends at the next marker, so its rows stay with it.

Austrian's own patch, withTabRuns, is removed. Its "band right after the last tab" guess gave a band outside the set
the last panel's rows (on /at/de/austrian-app and the ten advertise-with-austrian pages).

Checked offline: the four tab pages come out with DA's Tab rows, and the two other samples keep their Tab sections
(only brief 438's column markers differ). An ITA page with a band in a panel is unchanged. No lufthansa.com, SWISS or
Brussels snapshot has a grey band inside a tab panel. Every brand's smoke before and after: no differences from these
commits. No document needed uploading for this item.

### 4. B2B airlines page at 390

www ends 12 pages with a separator whose inline margin shows (30 px here). lh-com's cleanup drops a separator at a
section's end. `withEndSpacer` writes it back as `{spacer-N}` (496ed894). The last link's ink now sits 30 px further
from the footer, as on www (121 px at 1440, 81 at 390). The rest of de/de's gap at 390, about 48 px, is an empty
paragraph www has after Air Dolomiti's text (`<p><br></p>`). The import doesn't reproduce empty paragraphs, so it
stays. Both documents re-imported, uploaded and previewed; the only change against DA is the spacer.

### 5. All captured pages against austrian-parity-002a / 002b and b2b-parity-001 (1440 and 390, on the previews)

B2B: none of the 52 page/width pairs is more than 5 % off.

Austrian, at first: 69 of 120 more than 5 % off. Fixed this round:
- the footer (1dbddd8c): about 100 px short on every page (716 / 962 px against 815 / 1065). Its spacing was taken
  from the captures' pixel rows; now 814 / 1067;
- card rows www shows as a one-card slider on phones: 23 captured pages still had them stacked (+600 to +1400 px at
  390); `phone-slider` set on their one card row, uploaded and previewed. Below 1025 px the slider's cards then lost
  Austrian's card style (the block is four-up there, not grid); the rule now covers both (28ca6766; +50 to +70 px
  per page, measured on two pages with it injected);
- new-destinations: www opens its destination items; `withOpenFirst` gives such an accordion `open-first` (df5b6b5c).

Still more than 5 % off on the preview (39 of 120, measured before the slider card rule; with it, about five of the
390 widths come within 5 %), cause in one line each:

| page | 1440 | 390 | cause |
| --- | --- | --- | --- |
| /at/de/angebote-destinationen | -92 % | -93 % | www's offers and destinations app (every route listed); ours links to it on www (row 38) |
| /at/en/book/flights/new-destinations | +55 % | -20 % | www opens three destination items, ours the first item of each of the two accordions (two of three); inside an open item www sets picture and text side by side, ours stacks them |
| /at/de/unterhaltung-an-bord | -19 % | -20 % | www's in-flight entertainment carousel (an iframe app, about 530 px) is a link on ours |
| /at/de/legal | +11 % | -16 % | www's four icon teasers (four-column view of a.teaser.usp: 64 px icons, Portada labels, one row at 1440) are linked headings with small icons on ours; cards-icon-text has no four-up option |
| /at/en/accessible-travel | +7 % | – | the same four-column icon teasers (eight, stacked on ours) and the three-column "Services" view stacked |
| ch/en homepage | -18 % | – | the flight offers from Zurich: www's large picture tiles; ours the fare rows (live data) |
| /at/en/discover-inspiration | +20 % | – | the picture at the content's full width on ours, half width on www |
| /at/de/notfallkontakt, /at/en/emergency-contact | -9 % | -7 % | www's form groups (Passagierdaten, Flüge) as labelled boxes side by side at 1440 and taller fields; ours one box (the form block's layout) |
| /at/en/baggage, /at/en/book/additional-services/extra-services | – | -14 %, -8 % | the teaser list: www's cards about 70 px taller each (picture and copy) |
| /at/en/legal/conditions-of-carriage | – | -10 % | the article accordion's titles: www's type wraps more (284 px before "ATTACHMENTS") |
| /at/en/plan/special-requirements/travelling-with-animals | +7 % | -9 % | 1440: the pictures in the tab panels full width on ours, small beside the text on www; 390: the card row's band white |
| /at/en/plan/.../doctor-on-board-news, /at/de/flugstatus-und-flugplan, /at/de/pre-order-food, /at/en/international-lounges, /at/en/online-check-in, /at/en/premium-economy-class, /at/de/book/additional-services/seat-reservation, /at/en/entryregulations | (premium -6 %, seat -6 %, entry -5 %) | -5 to -9 % | the card row's grey band comes out white (a grey three-column view inside a one-column view's item: lh-com's sections transformer stops at the column item) and the slider card's style (fixed after this measurement) |
| /at/de/missing-baggage | – | -7 % | the FAQ accordion's titles larger on www, and the card row's band |
| /at/de/check-in | – | -7 % | 235 px shorter above "Verwandte Inhalte" (the check-in entry's teaser list) |
| /at/de/familien | – | -7 % | spread over the page, not located this round |
| /at/de/book/rebook | -6 % | – | less space before "Sie sind sich nicht sicher…" and above the footer |
| /at/en/fly/flight-information/flight-irregularities | -8 % | -10 % | not located this round |
| /at/en/economy-class | – | +7 % | not located this round |
| de/de homepage | – | +5 % | the offers block taller on ours (693 px before "Suchen Sie mehr als nur einen Flug?") |

Ours and not quick: the four-column icon teasers (a four-up cards-icon-text option and its parser), the grey band of a
card row inside a one-column view (lufthansa-sections' region stop), the open accordion items' side-by-side rows, and the
emergency-contact form's layout. Not ours to change: www's apps (offers list, entertainment carousel) and live fare
data.

### Summary (brief 444)

| item | commit | what | rollback |
| --- | --- | --- | --- |
| 3 | `c0b1d928` | lufthansa-sections: a break in a tab panel carries the panel's Tab (shared) | `git revert` |
| 1, 2 | `62cf2909` | hero-banner template and theme (row 37); culinary hub, maps and their points (row 42); withTabRuns removed | `git revert`; the 21 documents: DA's versions before 2026-11-07 |
| 3 | `19b44b7c` | bundles rebuilt after the rebase; Austrian templates from the current info | `git revert` |
| 1, 2 | `99295754` | info-based templates get info's column markers and flow spacing (shared) | `git revert` |
| 4 | `496ed894` | B2B: a page www ends with a separator keeps its space | `git revert`; the 2 airlines documents: DA's versions before 2026-11-07 |
| 5 | `1dbddd8c` | Austrian footer's spacing as www's | `git revert` |
| 5 | `df5b6b5c` | an accordion open first on www opens it (new-destinations) | `git revert`; the 10 documents: DA's versions before their second upload |
| – | `9c64dae0`, `d8f4a76d` | upload state | – |
| 5 | `28ca6766` | phone slider cards keep Austrian's card style below 1025 px | `git revert` |
| 1-5 | `7bfeff8b` | parity rows 37, 42, 43, `preview-paths-444.txt`, this report | – |

Documents (uploaded to DA and previewed, not published): no files; pages in release order:
- `tools/reports/austrian/preview-paths-444.txt` (44 pages): the 10 culinaryjourney pages, the 10 new-destinations
  pages, /at/en/fly/on-board/culinary-services, then the 23 pages whose card row became a phone slider;
- lh-b2b: /de/en/travel-solutions/lufthansa-group-airlines, /de/de/travel-solutions/lufthansa-group-airlines.
None is published; all 46 need publishing to show the changes on live.

## Brief 445 (your 454: padded pairs, four-up teasers, Austrian rows from brief 444's list)

Left from brief 444 and pushed with this round: `fd91923d`, the report's two commit hashes (now `a34d45cd` after the
rebase). Not in git, by design: `.migration/project.json` (the import's local workspace flag), `tools/importer/reports/**`
(the bulk importer's per-page reports), `content-sites/` (the local document trees), `logs/` and /tmp (scripts,
captures, screenshots, DA backups).

### 1. Padded sections back to back (lufthansa-sections.js)

When a padded section followed another padded section, the earlier one kept its own bottom gap, so we added 48 px
that www doesn't (first-class-terminal had it twice). Now (`89d84423`), the break before the second section marks
the first one `spaced` if www gives it a bottom margin (`.mb-default`) and `flush` otherwise; styles.css sets
48 px or 0. Test first: importer-padded-pairs. Checked at 1440 on /at/de/lhg-staralliance-partner: the end
difference was +190 px, now +2 px.

Documents whose look changes: Austrian's 67 (uploaded and previewed). DA's copies were the base: only the section
tokens were moved into them, 137 tokens (one wasn't found on /jp/ja/travel-insurances). Other sites change at their
next import: `tools/reports/offline-2026-11-06/padded-pairs-445.txt` lists them for their owners (lh-com 131,
Brussels 34, ITA 37, SWISS-MK 3).

### 2. Four-up icon teasers

`cards-icon-text` has a brand-neutral `four-up` option (four a row from 1025 px, README row). The parser sets it for
www's `.fourcolumn` views, and the info template maps the four-column `a.teaser.usp` views to `cards-icon` with
`four-up` (`4d694bf6`). The Austrian theme draws those tiles without a box: the icon over a Portada 500 label,
22 / 27.5 px, and 28 / 35 px from 1025 px. Tests first: icon-teasers-four-up and austrian-usp-tiles.

22 documents re-imported from DA's copies (10 legal, 10 accessible-travel, 2 digital-services), uploaded and
previewed. Against DA, only the new blocks changed. On the preview: /at/de/legal is −3.2 % at 1440 (was +11 %);
/at/en/accessible-travel is +0.3 % (was +7 %).

### 3. Card-row grey bands nested in a column

The premise didn't hold this round: the card rows inside a one-column view's item are grey in our documents and on
the previews. What does differ, on /at/en/plan/.../doctor-on-board-news at 390: www leaves a 70 px white gap between
the grey contact box and the grey card band; ours joins the two bands, with the `{spacer-70}` inside the grey. The
band is 57 px shorter, and there is 57 px more white before the footer (−6.7 % at 390). Not changed; it needs the
sections transformer to end a grey band before a separator, a shared change for its own round.

### 4. new-destinations: picture and text side by side in the open items (`518184e6`)

- The accordion-columns parser writes a two-column view of a picture item and a text item with facts as the view's
  title plus a one-row table of two cells, in www's order (Bilbao's picture is on the right). Each facts view becomes a
  one-row table, one cell per fact. The row's secondary button becomes an italic link (the outlined button). Only the
  10 new-destinations documents have this shape; the 39 other pages with a text | picture view stay running text.
- The block turns such a row into `.accordion-columns-media-row` (side by side from 768 px) and the facts into
  `.accordion-columns-facts` (three a row from 992 px), with spacing and type from the capture.
- No other document on any site holds such a table (all local copies scanned). Tests first: accordion-media-rows,
  accordion-columns-grid.

The 10 documents were re-imported from DA's copies, uploaded and previewed (text identical to DA). /at/en at 1440: the
headings are −18 px against www (the page was 15287 px in brief 444, now 8924; www 9862), and −92 px at 390. What's
left of the page height is the third item, which www opens: ours opens the first item of each of the two
accordions. Opening a third would need a new block option.

### 5. Austrian emergency-contact form (`a8ac8ab3`)

- The cause, shared: the import browser drops the empty `h2.form-section-headline` before the parsers run (linkedom
  keeps it), and form-core needed it to see a band. Every band without a headline was therefore read as plain fields:
  its description ("Passagierdaten", "Flüge") was lost and its fieldsets merged into the previous card. Now the
  headline container or the description container is enough.
- The snapshots have such bands on 156 Austrian pages, 8 Brussels, 3 ITA and 5 lufthansa.com pages
  (`tools/reports/offline-2026-11-06/form-bands-445.txt` for the other sites' owners).
- austrian.css styles the core forms as www's: 300 × 50 boxed fields (1 px #262626, 8 px radius, #f6f6f6 fill, the
  label inside), the band's card 72 px below its top and 108 px from the next card, 24 px card padding, CoreSans 500
  descriptions and subsection titles, 14 / 20 hints. Tests first: form-core-parser and austrian-core-forms.

155 of the 156 Austrian form documents were uploaded and previewed. A full re-import would have undone DA's own
changes (for example a removed `phone-slider`), so only the new step rows were moved into DA's copies
(logs/da/transfer-steps.py: the other rows had to match DA's, apart from the config rows' order).
/il/en/legal/cancellation-refund-via-document-upload was left out because its file-upload rows differ from DA's
(another parser change); it is unchanged. On the preview: /at/de/notfallkontakt −0.1 % at 1440 and +2.5 % at 390 (was
−9 % / −7 %); /at/en/emergency-contact +0.3 % / +2.1 %. Left: "* Pflichtfelder" sits in the last card, where www has
it in the left column.

### 6. The pages more than 5 % off again, and the next largest of ours (`8445f6a5`)

The 38 pages of brief 444's list, measured on main--lh-austrian--moved-permanently.aem.page after the pushes above: 29
of 76 page/width pairs are more than 5 % off (46 in brief 444). Of those:
- not ours to change: www's apps (offers and destinations −92 %, the entertainment carousel −19 %) and the
  Zurich fares on the ch/en homepage (−18 %, live data);
- ours, next largest:
  - /at/en/discover/inspiration (+20 % at 1440): www's two-column view has one teaser and an empty item, so the
    teaser stays half width; columns-media drops the empty item. The same shape is on 274 Austrian snapshots, 115
    lufthansa.com, 148 ITA, 63 Brussels and 83 B2B, so the shared parser change needs its own round with every site's
    check. Not changed.
  - /at/en/baggage (−13.5 % at 390): the capture shows a newer www page (white teaser cards with a shadow, other
    texts) than the Studio snapshot we import from (plain two-column items). It needs a fresh snapshot, not an
    import change.
  - The accordion titles, fixed: brief 386 gave every faq accordion 18 / 28 regular grey titles, measured on the
    contact page's help topics, but all 23 captured collapsibles wrap as 24 px type does. All Austrian accordion
    titles are now 24 / 28 500 with 12 px padding; the 18 px style stays on the accordion after the help centre app
    (the 12 contact pages). CSS only. Measured on the previews with it injected: conditions-of-carriage 390
    −9.7 % → −1.2 %, missing-baggage 390 −5.7 → −2.0, international-lounges 390 −5.9 → −2.9, entryregulations
    −5.1 / −5.3 → −4.8 / −4.2, travelling-with-animals 390 −8.5 → −4.9 (gesundes-reisen 1440 +4.7 → +5.7, from the
    longer titles). Test first: austrian-accordion-titles.

Still over 5 % after this and not located this round: /at/de/legal 390 (−8.2 %), seat-reservation (−6 / −9 %),
online-check-in 390, economy-class 390 (+8 %), familien, check-in, rebook, flight-irregularities.

### Checks

- Lint and the full suite before each push, in a fresh worktree of the commit (logs/suite-wt.sh): 465, 466, 467,
  468, 470, 471 and 479 files, all passing (the last pull before the fourth push brought code too, so it ran again). The first pull brought code (ded93847), so the suite ran again on the rebased
  commits. Its four conflicting bundles were rebuilt from the merged sources; the rebuilt Austrian bundles also carry
  ded93847's flight-search change, whose commit hadn't rebuilt them.
- Smoke on all 12 lh-edge hosts before and after each of the four pushes: 0 differences, except b2b's
  /xx/en/search-index.json hash after the first push. That is index content (the B2B pages publishing then), and no
  commit of this round touches b2b or lh-edge.
- Local checks on the lh-austrian document folder (aem up with --html-folder, brand set in the browser); page
  heights on main--lh-austrian--moved-permanently.aem.page against austrian-parity-002a / 002b at 1440 and 390.
- DA: each document read before, checked unchanged right before upload, and DA equal to local after; nothing
  published.

### Summary (brief 445)

| item | commit | what | rollback |
| --- | --- | --- | --- |
| – | `a34d45cd` | brief 444's report with the pushed hashes | – |
| 1 | `89d84423` | padded sections back to back: the earlier one `spaced` or `flush` as www's (shared) | `git revert`; the 67 documents: DA's versions before 2026-11-07 (logs/da/pre-padded) |
| 2 | `4d694bf6` | cards-icon-text `four-up`; four-column usp teasers as cards-icon four-up; Austrian usp tiles | `git revert`; the 22 documents: DA's versions before 2026-11-07 |
| 4 | `518184e6` | accordion panels' picture and text rows and facts side by side (parser and block) | `git revert`; the 10 documents: DA's versions before 2026-11-07 |
| 5 | `a8ac8ab3` | form-core: bands without a headline; Austrian core form styles | `git revert`; the 155 documents: DA's versions before 2026-11-07 |
| 6 | `8445f6a5` | Austrian accordion titles 24 / 28 500, contact topics 18 px | `git revert` |
| 1-6 | `46e0aeef` | report, `preview-paths-445.txt`, `form-bands-445.txt` | – |

Documents (uploaded to DA and previewed, not published): no files; pages in release order,
`tools/reports/austrian/preview-paths-445.txt` (254 pages): the 67 padded-pair documents, the 22 four-up documents,
the 10 new-destinations documents, then the 155 form documents. None is published; all 254 need publishing to show
the changes on live.

## The brief after 454 (Austrian bundles, other sites' form bands and padded pairs, new-destinations, grey bands, half-width teaser)

The brief after your 454 (the section above, "Brief 445", was your 454: I had numbered it 445). This round's
commits say "brief 454" in their messages; they belong to this brief. Left from the last one, not in git by design:
`.migration/project.json` (the import's local workspace flag), `tools/importer/reports/**` (the bulk importer's
per-page reports, e.g. at/de/notfallkontakt from the emergency-contact runs), `content/` and `migration-work/` (the
local lh-com workspace), `content-sites/` (the local document trees, among them about 230 Austrian copies the link
step changed and that were never uploaded), `logs/` and /tmp (scripts, captures, DA backups).

### 1. The Austrian bundles (`e68af307`, `41ceef62`)

ded93847's flight-search change was already in the Austrian bundles: my rebuild in brief 445 (89d84423) took it, as
that report said. Rebuilt from main again; the rebuild adds main's later cleanup changes (5b8e3e1e campaign
separators, campaign template only; 75c9418e footer disclaimer and own links; 8510d01a offer cards, after the pull
before the push). Checked on the 41 documents on austrian-checkin / -flight-status / -hero-banner: each imported with
these bundles, the committed ones and these without ded93847's two parser files, and all 123 outputs were equal per
document. None of the 41 has a flight search, so ded93847 has nothing to change there; 8510d01a's offer-card section is
on no Austrian snapshot. No document upload. Against DA those 41 do show older, never-uploaded template changes (the
culinary-services panels outside /at/en, the check-in template); they are not part of this item and stay as DA has
them.

### 2. Form bands and padded pairs on the other sites

The same way as Austrian's: each site's pages imported fresh into a scratch workspace (the sites' mapped snapshots;
lufthansa.com's bd-snapshots without scripts), then only the new rows / tokens moved into DA's copies, every other row
and section checked equal to DA's; DA read before, rechecked right before upload, equal to local after.
- Form bands (form-bands-445.txt), all 16: lh-brussels 8 (the six emergency-contact pages with their four bands:
  Passenger Details, Contact Details, Flights; the two group-travel requests), lh-ita 3, lh-com 5 (the five
  special-needs pages; /xx/ko had no local document and has one now, DA's plus the step rows). Checked on the previews
  (main--lh-brussels--, main--lh-ita--, main--lh-com--): be/en four bands with their descriptions, ITA and lh-com
  their separate cards.
- Padded pairs (padded-pairs-445.txt), 112 of the 205 moved and uploaded: lh-com 48, lh-brussels 28, lh-ita 36. Not
  moved (named in `next-import-after-454.txt`): lh-com 79 without a snapshot here (www.lufthansa.com's at/de, de/de, de/en
  and gb/en markets; www refuses headless loads) and 4 (100-years/campaigns: two sections with the same text, the
  token's place ambiguous), lh-brussels 6 (airbus-320n: the fresh import gives no padded pair), lh-ita 1
  (pets-as-cargo), lh-swiss-mk 3 (not in DA: 404).
Brussels' 8 local form copies differed from DA before this (another session's local state); DA's were the base, the
local ones are kept in logs/da/fb456/local-before.

### 3. new-destinations: the first three items open (`ee8ea261`)

www expands its first three items; the import splits them into two accordions (the first alone, before its map), and
withOpenFirst gave each only open-first. accordion-columns has an option `open-2` … `open-9` now (the first N items
open; not with tabs; with exclusive only the first; README row); withOpenFirst counts each accordion's leading items
expanded on www and decodes www's `&nbsp;` in the headlines (fr/fr and ru/ru didn't match before). 20 documents, the
option only, moved into DA's copies: new-destinations × 10 (open-first / open-2) and voluntary-rebooking × 10 (open-3:
www expands its first three too; they were imported before withOpenFirst existed). On the preview: new-destinations
"O / OO-", voluntary-rebooking "OOO / -----", as www. Tests first: accordion-columns-open-first, austrian-accordion-maps.

### 4. doctor-on-board-news at 390: white between the two grey bands (`486c237e`)

The separator between the grey contact box and the grey card band (both in one column item on www) lay alone between
two grey sections, so dropEmptyBreaks merged its {spacer-70} into the second band. Now only separators between two
grey sections keep a section of their own, style `gap`; styles.css gives it its spacers' height only and takes the
grey before it its section gap. Anything else as before. Test first: importer-grey-gap; every brand's smoke before
and after the push. On the preview (390): grey 163, gap 71 white, grey 652 (www 70). The 2 Austrian documents
(/at/de, /at/en) got the gap section on DA's copies and are uploaded. Still left at 390, another cause: www has about
89 px above the band's heading, ours 20 (the band is a grey view nested in a column, so it gets the plain grey
padding), and the accordion items above are 57 px shorter.
Documents whose look changes at their next import (`next-import-after-454.txt`): lh-com 9 (the doctor-on-board-news pages),
lh-b2b 6, lh-ita 3, lh-brussels 2, lh-swiss-mk 1.

### 5. discover/inspiration: the lone teaser half width (`0cd4db1a`)

Narrow as asked: columns-media keeps the empty cell only for a `.twocolumn` view of exactly two items with one empty
(the lone-image, embed and nested-N cases did already); three- and four-column views and full rows as before. Test
first: columns-media-half-alone. 50 Austrian documents have such a row (snapshots with the view, the local document
with the one-cell row): the empty cell moved into DA's copies in the empty item's place, uploaded. On the preview
/at/en/discover/inspiration at 1440: 622 + 622 (half), at 390 the full width; locally against www the headings
+22 px at 1440, +7 at 390 (was +20 % page height). Other sites at their next import: lh-com 11, lh-brussels 6; lh-ita,
lh-b2b, lh-swiss, lh-swiss-mk none (`next-import-after-454.txt`).

The bundles for items 4 and 5 (`e9b216d8`): every bundle carries lufthansa-sections, so all were rebuilt; that also
brought main's cleanup changes listed under item 1 into the lufthansa.com bundles that didn't have them yet.

### Checks

- Lint and the full suite before each push, in a fresh worktree of the commit: 480, 485, 486 and, after the last pull
  brought 9d25c98e (columns-media CSS), 486 again; all passing.
- Smoke on all 12 lh-edge hosts before and after the push: no difference from these commits; austrian-cn's
  /at/llms.txt answered 503 before (an origin error at that moment) and 404 after, as austrian.turnsthe.page does.
- Previews checked: main--lh-austrian-- (open items, the gap at 390, the half-width teaser at 1440 and 390),
  main--lh-brussels--, main--lh-ita--, main--lh-com-- (the form bands, one padded-pair page); locally the
  lh-austrian document folder (aem up --html-folder) against austrian-parity-002 at 1440 and 390.

### Summary (the brief after 454)

| item | commit | what | rollback |
| --- | --- | --- | --- |
| 1 | `e68af307`, `41ceef62` | Austrian bundles rebuilt from main | `git revert` |
| 3 | `ee8ea261` | accordion-columns open-N; withOpenFirst counts the leading open items, decodes &nbsp; | `git revert`; the 20 documents: DA's versions before 2026-11-07 15:00 UTC (logs/da/pre-open456) |
| 4 | `486c237e` | separators between two grey bands: a white `gap` section (shared) | `git revert`; the 2 documents: DA's before |
| 5 | `0cd4db1a` | columns-media: a two-column view of one item and an empty one keeps the empty column (shared) | `git revert`; the 50 documents: DA's before (logs/da/pre-half454) |
| 4, 5 | `e9b216d8` | bundles rebuilt | `git revert` |
| 2-5 | `2eb0c111` and this report's commit | upload states; report, `preview-paths-after-454.txt`, `next-import-after-454.txt` | – |

Documents (uploaded to DA and previewed, not published): no files; 200 pages in `preview-paths-after-454.txt`, per site in
release order: lh-austrian 72 (20 open items, 2 grey gap, 50 half-width), lh-brussels 36 (8 form bands, 28 padded
pairs), lh-ita 39 (3 + 36), lh-com 53 (5 + 48). None is published.

## The brief after 462 (your 462 was "the brief after 454")

Left from the last one, not in git by design: `.migration/project.json` (the import's local workspace flag),
`tools/importer/reports/**` (the bulk importer's per-page reports), `content/` and `migration-work/` (the local lh-com
workspace), `content-sites/` (the local document trees), `logs/` and /tmp (scripts, captures, DA backups).

### 1. The Austrian local copies that differ from DA (no upload; your decision)

All 2,362 local Austrian documents compared with DA (read only): 311 differ, more than the ~230 the link step
reported, in four clean groups (`tools/reports/austrian/local-vs-da-462.txt`, paths per group):

| group | documents | what differs | should DA have it? |
| --- | --- | --- | --- |
| links to www made relative | 210 | 327 links `https://www.austrian.com/<cc>/<ll>/{contact,flightbooking,travel-briefing}` -> `/<cc>/<ll>/...` (23 pages, each in DA, previewed and live): e.g. /cn/zh/awards' flightbooking link, /cn/zh/book/additional-services/seat-reservation's two contact links | yes: the visitor stays on the site; recommended upload |
| image sources | 83 | `https://content.da.live/moved-permanently/lh-austrian/media-da/austrian/paypal-white.png` (DA) vs `/media-da/austrian/paypal-white.png` (local): the footers' and icon pages' pictures | nothing to do: DA writes the absolute form on upload, the same image |
| navs | 10 | DA's login link to the site's own page (`/at/de/anmeldung`, briefs 369/373) vs the local www deeplink (`/deeplink/cockpit?country=AT&language=DE`) | no: DA is newer, the local copy stale |
| more than links | 8 | black-friday (al/en, ch/de: DA a hero-campaign), at/de and at/en contact, homepage, fly-with-austrian: DA's later edits (uploaded 2026-11-05 evening without the local copy) | no: keep DA |

So only the first group would change anything on the site; uploading it (210 documents, links only) is a yes/no for
you. The 18 of groups 3 and 4 should get DA's version locally so no later upload takes the stale copy back.

### 2. The hk passenger picker (`16c0f338`)

PASSENGER_LABELS has an hk entry with www's wording (hk/hk/homepage with the picker open, 2026-11-07 11:38 CET): the
panel label 調整旅客和預訂艙等選擇。, the summary 經濟艙, 1 旅客, 旅行艙等 with 經濟艙 / 優選經濟艙 / 商務艙 / 頭等,
成人, 兒童 (2 至 11 歲), 嬰兒不佔位 (0 - 23 個月), 儲存; picker-options.js hk the fare texts in www's words
(其他票價選擇 ... 彈性/最高等級預訂艙等以累積更多哩程). Not in lufthansa.com's dropdown, so not used: www's tabs
(旅行詳細資訊 / 兌換哩數), the promo code field and its hint; the group link's text is the document's own row (on the
previews www's 10 名旅客以上的團體預訂。 already). The stepper buttons' screen-reader names are the Traditional forms of
zh's (www shows none). Two market tests compared every table entry with an older commit; they now leave picker-options'
hk out (changed on purpose). Test first: hk-picker-labels.
Checked on main--lh-com--moved-permanently.aem.page at 1440: /xx/hk/flight-search, /hk/hk, /cn/hk, /tw/hk homepages:
`<html lang="zh-HK">`, the button 經濟艙, 1 旅客, every row and choice in Traditional Chinese; /xx/zh and /de/en as before.
Found on the way, not changed: /xx/zh's picker still says "Children (2-11 years)", "Infants without seat" and the English
group link; those come from its documents' authored rows, not the built-in table.

### 3. doctor-on-board-news at 390 (`70d0f480`)

From www's own stylesheet: `.column-view.container-gray { padding: 4.8rem 0 }`, and the items' 1.2rem (2.4rem from 768
px) below. A grey column view nested in a column item (the contact box, the card band) had our plain grey section
padding, 20 / 40 px. lufthansa-sections now gives such a band style `in-column` (the other brands: the token only, no
rule, as they were); austrian.css gives it 48 px above, 60 px below (72 from 768 px). A band that is its section's own
column view (`column-band`) keeps 32 px: www's `.section-content .column > .column-view:only-child { padding: 3.2rem }`
outranks the grey view's padding there; injected on the 28 captured pages with column-band, 14 came closer and 14 went
further, so not changed. Locally (against austrian-parity-002, from the h1): at 1440 the contact box, the band's heading
and the cards within 8 px of www (were -48); at 390 the band's heading -48 px (was -144). Not changed, the rest at 390:
about 32 px above the accordion (www's gap between the h1 and the intro differs from page to page, 36 px on /at/en/faq,
72 here) and the item's 12 px top padding inside the contact box.
114 Austrian documents have such a band (from the snapshots): imported fresh into a scratch workspace with the new
bundles, then only the token moved into DA's copies (136 sections); every other byte as DA has it.
Ten of them (the green-fare pages) changed in DA meanwhile (another session's share images): taken again from DA,
the token moved again, then all 114 uploaded and previewed; DA equal to local after. On the preview at 390 the band's
heading 50 px above www's (was 146), the card titles 46 (was 142); at 1440 within 6 px, the card titles equal; the bar's
logo link 122 x 24.
Test first: importer-grey-in-column.

### 4. The Austrian parity rows still open

Rows 3 (the airport list from this environment) and 38 (www's offers app, a link out) are not ours to change; row 28's
font point was row 29, fixed. The deeper pages' accessibility items: the Star Alliance logos' alt texts were done in
brief 438 (5616b6ef: 0 linked pictures without one on at/de and at/en); the bar's logo link was 122 x 18 px at 390 (axe
target-size): now 24 px tall with 3 px of padding taken back by the margin (`70d0f480`). parity.md updated.

### Checks

- Lint and the full suite before each push, in a fresh worktree: 487 (item 2) and, after the pull brought 1abf9cbd
  (campaign's columns and its bundle; the bundle conflict rebuilt from the merged sources, every bundle differing from
  main by my one line), the suite again on the rebased commit; the last pull brought 7d9be6b4 (insights, hub), whose
  parser and cleanup changes the rebuilt bundles now carry too (only its own bundles had them), and the suite again.
- Smoke on all 12 hosts before and after each push: no differences from these commits; one host's /ch answered 503 in
  a before-run (an origin error) and its redirect after.
- Previews: main--lh-com-- (the hk pages), main--lh-austrian-- (the logo, the alt texts, the doctor page after the
  upload); locally the lh-austrian document folder against austrian-parity-002 at 1440 and 390.

### Summary (the brief after 462)

| item | commit | what | rollback |
| --- | --- | --- | --- |
| 2 | `16c0f338` | the hk passenger picker in www's Traditional Chinese | `git revert` |
| 3, 4 | `70d0f480` | in-column grey bands with www's 4.8rem (Austrian); the logo link a 24 px target; bundles | `git revert`; the 114 documents: DA's versions before 2026-11-07 17:00 UTC (logs/da/pre-ic462) |
| 1-4 | `df42c3a8` and this commit | report, `local-vs-da-462.txt`, `preview-paths-after-462.txt`, parity.md | – |

Documents (uploaded to DA and previewed, not published): no files; 114 Austrian pages in
`tools/reports/offline-2026-11-06/preview-paths-after-462.txt`. None is published.

## The brief after 464

Left from the last one, not in git by design: `.migration/project.json` (the import's local workspace flag),
`tools/importer/reports/**` (the bulk importer's per-page reports), `content/` and `migration-work/` (the local lh-com
workspace), `content-sites/` (the local document trees), `logs/` and /tmp (scripts, captures, DA backups).

### 1. The 311 Austrian copies

- The 210 with www links (contact, flightbooking, travel-briefing): DA's current copy as the base (read again: 204
  differed from the local ones by now, among them the 114 of last round), only those 327 links made relative, every
  other byte as DA has it; uploaded and previewed, DA equal to local. The 23 target pages answer 200 on
  austrian.turnsthe.page (e.g. /cn/zh/contact, /jp/ja/flightbooking, /gr/el/travel-briefing); on the preview
  /cn/zh/awards links /cn/zh/flightbooking, /jp/ja/book/additional-services/seat-reservation /jp/ja/contact.
- The 83 image-source ones: nothing.
- The 18 (10 navs, 8 with DA's own edits): DA's version written into the local copies (the old local ones in
  logs/da/pre-stale464); local equal to DA.

### 2. ITA's date picker (`74074a23`)

The import has dropped www's jQuery UI date picker (#ui-datepicker-div) since c41fa328; the two documents with the `lu`
block had been imported before. The mapping is now an exported `mappedOf`, tested on both snapshots. Every lh-ita
document in DA read (the 2,492 local ones): only those two had a `lu` block; the block and its two header paragraphs
("<PrecSucc>", "Ottobre 2026") removed on DA's copies, nothing else changed; uploaded and previewed. On
main--lh-ita--: both forms render, no lu block, no failed block. DA documents of lh-ita without a local copy were not
read.

### 3. One h1 (`ebfd99bf`)

www's own markup has several h1 on these pages (sustainable-flying: the title and three
h1.headline.heading-copytext-large). The Austrian post chain's `withOneH1` keeps the first h1 and writes the later ones
as h2 at their size (their marker's heading size, else {heading-large}, inside the one trailing marker scripts.js reads),
so the pages look as before. Not only sustainable-flying: 65 Austrian documents had more than one h1 (96 headings:
electronic-devices-and-batteries, flight-status-and-timetable, faq-flight, ombudssystem, sustainable-flying,
premium-economy-class in each language, and a few others); all changed on DA's copies and uploaded, plus
se/en/sustainable-flying's own document (in DA, no local copy). at/en keeps its market sections. dk/en has no document
of its own (it answers on austrian.turnsthe.page from at/en). The first pass put a second marker after "Lounges
{column-start}" on the ten faq-flight pages (shown as text on the preview); repaired the same way, uploaded again.
Checked on main--lh-austrian--: at/en and se/en sustainable-flying one h1 (48 px), the former h1 sections 24 px h2;
es/es/faq-flight one h1, "Lounges" without a marker, 48 px.

### 4. /xx/zh's picker rows

www's xx/zh wording from the homepage snapshot's picker: 儿童 （2 至 11 周岁）, 没有座位的婴儿 （0-23 个月）, the group link
10 名或以上旅客团体预订。. Four documents have the rows (flight-search, homepage, cash-and-miles, book-and-manage/stopover;
hotel-offers has none): only those five values changed on DA's copies, each link's target as DA had it (www's
xx/zh group page has no copy on our site); uploaded and previewed. On main--lh-com--: /xx/zh/flight-search and
/xx/zh/homepage show 儿童（2 至 11 周岁）, 没有座位的婴儿（0-23 个月） and 10 名或以上旅客团体预订。. The homepage is
ema-adobe's area; only these rows changed, DA rechecked right before the upload.

### 5. The Austrian parity rows still open

Rows 3 (the airport list from this environment) and 38 (www's offers app, a link out) only, both not ours to change;
nothing else is open in parity.md.

### Checks

- Lint and the full suite before the push, in a fresh worktree: the first run failed on ita-datepicker (it read a snapshot,
  and tools/importer/bd-snapshots is not in git); on a fixture now, 497 passed.
- Smoke on all 12 hosts before and after the push.
- Previews: main--lh-austrian-- (links, h1s), main--lh-ita-- (the forms), main--lh-com-- (xx/zh picker); the link
  targets on austrian.turnsthe.page.

### Summary (the brief after 464)

| item | commit | what | rollback |
| --- | --- | --- | --- |
| 2 | `74074a23`, `394ed970` | ITA: mappedOf with the date picker dropped, tested (the test on a fixture: the snapshots are not in git, the clean worktree had none) | `git revert`; the 2 documents: DA's versions before 2026-11-07 (logs/da/orig at the time) |
| 3 | `ebfd99bf` | Austrian: one h1 per page | `git revert`; the 66 documents: DA's versions before (logs/da/pre-h1464) |
| 1-5 | this report's commit | report, `preview-paths-after-464.txt`, upload states | – |

Documents (uploaded to DA and previewed, not published): no files; `tools/reports/offline-2026-11-06/preview-paths-after-464.txt`,
per site in release order: lh-austrian 261 (210 links, 50 more one-h1 documents, se/en), lh-ita 2, lh-com 4. Plus 18
Austrian local copies refreshed from DA (not uploaded).
