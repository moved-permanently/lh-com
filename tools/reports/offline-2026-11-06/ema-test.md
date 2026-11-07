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
