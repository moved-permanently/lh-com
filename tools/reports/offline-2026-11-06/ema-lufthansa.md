# Offline package 2026-11-06: ema-lufthansa (Cargo: cargo.css and the Cargo importer; Brussels)

Running report, committed as the work goes. Nothing is published: documents are uploaded to DA and
previewed (da-upload.mjs --site lh-cargo / lh-brussels), checked on the aem.page preview hosts.
Release order for the user: code (on main) first, then files, then the pages that use them.

## 1. Brief 429, Cargo round 3 (done)

What: the bar 60 px up to 1024 px, www's grid at every width, the slide button's outline; story
pictures as www's modules; Facts & Figures' board, compliance and timeline; Support & Contact's
finder over its tabs, its "Contact us" band and technical support; the contact form as a dialog
over Support & Contact; eBooking's columns. Details: tools/reports/cargo/parity.md, "Round 3".

Commits (main): 1a6214c (accordion-columns exclusive, filter as a finder over tabs), a5352fe (a
dialog link's query reaches its form), 03864d1 (importer), 6a9448e (cargo.css), 8e79d0e (report,
state, release list).

Preview paths, in release order (code on main): `/modals/contact-us`, then `/en/support-and-contact`,
`/de/support-and-contact`, then `/en/ci/facts-figures`, `/de/ci/facts-figures`
(tools/importer/cargo-runs/publish-r3.txt).

Checked: main--lh-cargo--moved-permanently.aem.page at 1440 and 390 (and 768, 1024, 1025 for the
bar and grid), cargo.turnsthe.page for the CSS-only changes; smoke cargo and ita before and after
each push: 0 differences.

Open: the key facts' and the timeline's photos, the board members' and compliance pictures, and
Support & Contact's "Contact us" photo are not in lh-cargo's DA (for the harness); inside a Support
& Contact tab the topics stay one under the other (www: a list and the topic's links beside it).

## 2. Cargo's transport stories from cargo-snapshots-003 and -004 (done)

What: both archives from the R2 drop (sha256 checked: 4ff6b392… and 74bac112…), 341 stories (all
German: www's English story URLs come later in the 422 list). Their captures went into
content-sites/lh-cargo/snapshots/ (no capture was there before); cargo-import.mjs (the fixed
importer: www's phone copies left out, the two text columns, the heading order) imported all 341,
its files from what lh-cargo's DA has (--known-from DA's current copies). Each new document against
DA's current copy (read from DA's source API), by passage (every text passage of DA's copy must be
in the new document) and by picture (none of DA's lost; none new from www):

- 263 uploaded and previewed: DA's copies held most passages twice (the phone copy and the desktop
  table, the duplicates fixed in 417), now once. 82 of them have text DA's copy did not (www's
  desktop text where it differs from its phone copy, mostly punctuation, or www's newer text):
  listed with their first new passages in tools/importer/cargo-runs/stories-offline-2026-11-06.tsv.
- 77 unchanged (the new document is DA's): not uploaded.
- 1 held: /de/news/night-shift-in-chicago-44: its photo credit ("Fotos: Cornelia Garmann, Natalia
  Pekhanova") is only in www's phone copy; the import takes the desktop copy, which has no credit
  (www's desktop page does not show it either). DA keeps its copy with the credit.
- 59 pictures (67 places in 65 stories) are only on www (not in lh-cargo's DA): left out of the
  uploaded stories, as their DA copies had none of them; listed for the harness in
  tools/importer/cargo-runs/stories-offline-2026-11-06-files.tsv (cargo-assets.mjs --download,
  then the stories' re-import).
- Not captured (cargo-stories-not-captured.txt, 404): 5 that www answers 404 and 399 the capture
  did not reach before its deadline (09:40 CET); they stay as they are:
  tools/importer/cargo-runs/stories-offline-2026-11-06-not-captured.tsv.

Checked on main--lh-cargo--moved-permanently.aem.page at 1440 and 390, a sample from each upload
batch (10 stories): one H1, the headings in order, no passage twice, no broken picture, no
sideways scroll.

Preview paths (no files: every picture is DA's): the 263 "uploaded and previewed" rows of
tools/importer/cargo-runs/stories-offline-2026-11-06.tsv, in any order (the code is on main).

## 3. Brussels, deeper visual parity (brussels-parity-002a and -002b; done, open rows below)

What so far: both archives from the R2 drop (sha256 checked: d81b5e3f… and 7c7591fd…), 58 pages at
1440 and 390, compared with lh-brussels' preview (main--lh-brussels--moved-permanently.aem.page):
page heights, titles, headings, text, copy sizes, breadcrumbs, sideways scroll, the blocks against
www's components. The Studio's snapshots (brussels-snapshots-001 to -012 in the drop, 1504 pages;
no .sha256 files next to them) placed in tools/importer/bd-snapshots/ for the re-imports.

Found and fixed in the import:
- pages with a photo gallery (58 across the markets, e.g. /be/fr/travel-classes/business) took
  lh-com's fleet template, which has the gallery but none of a content page's other parsers:
  their picture and text rows, teaser cards and tabs came in as plain content. Now they import with
  the info template, the gallery spliced in from a fleet import of the same page
  (brussels-import.mjs, test/brussels-galleries.test.mjs; commit 4d56b6e).
- pages with tab panels (38, e.g. /be/fr/flying-with-us/new-destinations: both tabs one under the
  other, three times www's height): main's import bundles were older than 515475be (tab panels as
  Tab sections); with bundles built from main's sources (rebuilt upstream meanwhile) they import
  with their tabs.

87 documents re-imported (the gallery pages and the tab pages that lh-brussels has), each against
DA's current copy: no passage, picture or metadata row lost (DA's `markets` and `chat-button` rows
carried over, the workspace's scope.json is not on this machine; links DA has relative kept
relative; two amare pictures DA keeps its own copy of point at DA's copy). Uploaded and previewed:
tools/reports/brussels/preview-offline-2026-11-06.txt (87, any order: the code is on main; commit
c3bc782 and the next for the state).

Note: a service restart (about 12:35 CET) wiped /tmp mid-upload; the upload state file it was
writing came back from git and every document was uploaded again from the list.

Theme (styles/themes/brussels.css, commit c5050dd): the travel class pages' stage right under the
class tabs, 810 px at 1440 (16:9) and 804 px on phones, the title in capitals; the class tabs'
labels #0a1f62 with a red line under the chosen one. Rows P30 to P41 in
tools/reports/brussels/parity.md ("Pass 2"); before the fixes 75 of the 116 page-widths showed no
difference, after them 83.

Checked on main--lh-brussels--moved-permanently.aem.page at 1440 and 390 (the 58 pages measured
again after the uploads), the theme on a local dev server with lh-brussels' preview content
(economy at 1440 and 390: stage 0,186 1440x810, www 0,183 1440x810; phones 804, www 804); smoke
of brussels.turnsthe.page and cargo before and after each push: no difference.

Open (with why, in parity.md): three in lh-com's shared parsers and transformer, for ema-cashub
(P34 the gift card items' text and buttons, P35 a list item's text around its link, P36 tabs
holding accordions, P37 travel-regulations' picture rows); P38 www's newer text (needs a newer
capture); P39 environment; P40 beobank's title colour and P41 three page heights not
investigated yet.

## 4. Cargo's es, fr, it and pt pages against the en/de pages of the same kind (done, open below)

Measured on main--lh-cargo--moved-permanently.aem.page at 1440 and 390: every es, fr, it and pt
page of Cargo's scope next to the English page of the same path (header bar and its items,
footer headings and link count, the title's size and colour, breadcrumb, blocks, page height,
sideways scroll, html lang). Header, footer, title, breadcrumb, lang and scroll: no difference in
any language.

What was off, and the fix (no code change: item 1's importer applied to the documents):
- The es, fr, it and pt inside pages had been imported before this round's importer (Facts &
  Figures' and the CI pages' image lists, the SDG accordion, efreight's breadcrumb). 53 documents
  re-imported, each checked against DA's copy (no passage, picture or metadata row lost; pictures
  only on www left out, listed in tools/importer/cargo-runs/offline-langs-2026-11-06-files.tsv),
  uploaded and previewed: tools/importer/cargo-runs/offline-langs-2026-11-06.txt (commit 7663776).
- After that, five English CI pages lacked the image lists their es to pt versions have. 10 en/de
  documents re-imported (12 have no capture, below), the same checks; 6 changed and are uploaded
  and previewed: tools/importer/cargo-runs/offline-ende-2026-11-06.txt (/en/ci/fleet-infrastructure,
  /en/ci/partnerships-subsidiaries, /en/ci/security, /en/ci/social, /en/ci/transport-stories,
  /en/footer/bottomnav/imprint); 32 pictures only on www left out
  (offline-ende-2026-11-06-files.tsv). The other 4 were unchanged.
- The newsroom (fr, it, pt 4583 px against 900 in English) was a measuring artefact: measured
  again, every language the same.

Release order: the code is on main; the documents in any order (no fragments among them).

Open:
- /de/ci/digitalization, fleet-infrastructure, partnerships-subsidiaries, security, social,
  recycling, environmental, transport-stories, /de/eservices/efreight, /de/footer/bottomnav/imprint,
  /en/ci/digitalization and /en/ci/recycling: no capture on this machine, so not re-imported. The
  German CI pages (and English digitalization) still lack the image lists the other languages
  show. Needs captures of these 12 pages, then the same run.
- The transport stories hub: es to pt list 22 stories, English 10 (twice the page height). www's
  hub has a list of 100 stories and shows more tiles as you scroll; the captures stopped at 10
  tiles (en) and 22 (es to pt). Nothing is lost against DA. To make them equal, the importer could
  build the hub from the page's full list (all 100), but DA has the teaser pictures of only a few.
  Left as it is. For Ben: should the hub list all 100 stories (pictures copied to DA), or keep the
  10 or 22 the captures show?
- Local only: content-sites/lh-cargo/paths.json (not in git) has 53 es/fr/it/pt entries added for
  this run.

## 5. Accessibility pass on Cargo's and Brussels's captured pages (done, open below)

axe-core 4.10.2 (the npm package, sha512 checked; nothing from www) on the aem.page previews: Cargo's
24 captured pages (cargo-parity-001) and Brussels's 80 (brussels-parity-002a/b), each at 1440 and
390, WCAG 2.0 to 2.2 A and AA, after the consent choice ("Only necessary"), the page scrolled through.
Then axe's best-practice rules at 1440.

Method note: the first runs found almost nothing, because the replica's showcase notice (a modal
dialog) sometimes opened after the script had looked for it, and axe treats everything outside an
open modal as hidden. The runner now closes any modal right before axe and records a sanity check
per page (rules passed, any modal still open). Every result was run again that way: 23 to 33 rules
passed on each page, none blinded.

Fixed (ours):
- accordion-columns' tab bar: the buttons inside role="tablist" had no role="tab" (axe
  aria-required-children and aria-allowed-attr, critical; Cargo's support and contact pages).
  Brand-neutral fix in blocks/accordion-columns/accordion-columns.js, test first; every brand's
  smoke before and after (commit 2a0bf51).
- Brussels' our-destinations (be/en, be/fr) had no page title (best practice page-has-heading-one;
  www has its finder's "Best offers" h1). Brussels importer and documents, parity.md P42
  (commit e077925). Preview paths: tools/reports/brussels/preview-offline-2026-11-06-finder.txt.

After the fixes: WCAG A/AA, Brussels 0 violations on all 160 page-widths, Cargo one (below).

Open, not ours:
- Cargo /de/ci/facts-figures and /en/ci/facts-figures at 1440: carousel-cards' track scrolls sideways but
  can't be reached by keyboard (scrollable-region-focusable, serious; the slides hold no links).
  carousel-cards is Cargo's homepage block family (ema-adobe); the fix would be tabindex="0" with a
  label on the track when it scrolls.
- Best practice, shared code: the replica's demo badge text (.demo-badge-sr, "Demo: not a ...
  website") sits outside the landmarks on every page (region); the footer's column headings are h3
  where main has no h2 (heading-order); carousel-cards and carousel-images as role="region" with the
  same label more than once on a page (landmark-unique, 25 Brussels pages).
- Best practice, as www has it: card titles that skip a level (h2 to h4, www's own levels, 60
  Brussels page-widths); no h1 on the homepages, Cargo's SDG pages and two travel class pages (www has
  none there either); one picture whose alt repeats its caption (the Belgian icons, "Trident").
- Brussels be/nl and it/it our-destinations: still without a title (no capture shows the finder's
  Dutch or Italian label).

## Also done in this package

- Brussels P40 (from item 3): Beobank's title was red where www's is #1a1a1a: www's h1 there has
  the "medium" heading style, which the document already carries ({heading-medium}). The Brussels
  theme now makes only titles without a smaller style red (commit 485ee47; checked locally with
  lh-brussels' preview content at 1440 and 390 against brussels-parity-002b).
- Brussels P41 (from item 3), causes found: online check-in options imports through lh-com's
  app-entry template, which has no mapping for www's four-column teaser cards ("Autres sujets"
  comes out as four full-width pictures): for ema-cashub (page-templates.json). Payment methods:
  nothing missing. The articles hub: www's newest article (Milan) needs a newer capture.
- ema-adobe's note on Cargo's --spacing-default (cargo.css): left at 20 px. It sets the space
  below headings and paragraphs and between blocks in one section, 20 px as www's text. The
  homepage's differences are padding inside some of www's components, not one gap (cargo-parity-001,
  en at 1440: ours shorter by 53 px at the news, 64 at the fleet, 51 at eServices, 80 at About, the
  ULD teaser 20 px taller; at 390 our homepage is 171 px taller than www's). Raising the shared gap
  would make phones worse. This belongs in the homepage blocks' CSS, per component (ema-adobe).

## Left at the end

- Not in git, on purpose: .migration/project.json (workspace setup); content-sites/ (ignored; it
  holds the imported documents, lh-cargo's paths.json with the 53 language entries, the runs);
  .scratch/ (excluded locally: the downloaded archives, measurements, axe results, scratch tools).
- Every commit of this package is on main and pushed; smoke of every brand before and after each
  push: no difference except lufthansa.com's sitemaps, which change with lh-com's own uploads
  (ema-cashub's), not with these commits.
- Questions for Ben: the Cargo transport stories hub (item 4: all 100 stories or as now). Inputs
  that would close open rows: captures of the 12 en/de Cargo pages (item 4), a newer Brussels
  capture (P38, P41's Milan), the finder's Dutch and Italian labels.

## Brief 439: Cargo stories and pictures

Nothing published: documents and files uploaded to DA and previewed (da-upload.mjs --site
lh-cargo). The upload state (tools/importer/da-upload-state-lh-cargo.json) merged with origin's
entry by entry before each push (the user's harness writes it too). The three German articles with
umlauts were left alone (the user's).

### 1. The stories of cargo-snapshots-005

The archive (sha256 11fed94d…5c6694, as the brief) holds 399 stories (398 English, 1 German): its
captures into content-sites/lh-cargo/snapshots/ (none was there), imported as the 341 of item 2
(cargo-import.mjs, files from what lh-cargo's DA has), each against DA's current copy (read from
DA's source API), by passage and by picture. The passage check now compares sentence by sentence
(www's phone and desktop copies split the same text into different paragraphs; DA's copies came
from either).

- 118 uploaded and previewed. 107 of them gain www's breadcrumb (DA's copies had none; the German
  stories of item 2 have it). Four had passages that differ from DA's, all www's text or a fix,
  uploaded and noted in the table: engine-mission (www's "Kuehne+Nagel", DA "Kühne+Nagel"),
  everything-except-pepperoni-pizza-102 (DA's typo "xcustomers"), venus-egypt (www's word order),
  rettet-das-nashorn ("AnimalLogistics FRA GmbH", www's desktop copy).
- 280 unchanged: not uploaded.
- 1 held: /en/news/theculture. Ten sentences (Kai Nissen's quote, the 130 cm box, the art trucks,
  the SCHIRN opening) are only in www's phone copy (d-block d-sm-none); the import takes the
  desktop copy. DA keeps its copy with them (as night-shift-in-chicago-44 in item 2).
- 58 pictures (67 places) only on www, not in lh-cargo's DA: left out (DA's copies had none of them).
- All rows added to tools/importer/cargo-runs/stories-offline-2026-11-06.tsv (now 740: 381 uploaded,
  357 unchanged, 2 held), the pictures to stories-offline-2026-11-06-files.tsv, the not-captured
  list (stories-offline-2026-11-06-not-captured.tsv) now the 5 www answers 404 for.

On phones two of them scrolled sideways (123-flying-horses 83 px, from-above-48 54 px): the story
module's one grid column (cargo.css row 14) grew to the card's longest title word. Fixed in
cargo.css, test first (test/cargo-stories-439.test.mjs): the column is the block's width. All 399
checked at 390 on a local dev server with the fix and lh-cargo's preview content: one h1 each, no
broken picture, no sideways scroll, no passage twice except lhc-press-media-details-2012-page3-7
(unchanged; www and DA repeat its first paragraph too). A sample of 10 uploaded stories on
main--lh-cargo--moved-permanently.aem.page at 1440 and 390: the same.

Preview paths: the 118 "uploaded and previewed" rows of stories-offline-2026-11-06.tsv marked
"cargo-snapshots-005 (brief 439)"; any order after the cargo.css commit.

### 2. cargo-media-002

The archive (sha256 343c4945…08f5f5c, as the brief): each of the ten files checked against its
manifest row (bytes, sha256), named as cargo-assets.mjs names files (edsName:
/media-da/cargo/<name>-<sha1 8>.<ext>) and uploaded to lh-cargo's DA with the pages that use them.
Teaser-ULD-Mobile@2x.jpg left alone (ema-adobe's).

- /media-da/cargo/250701-executive-board-lufthansa-cargo-1000x465-jpg-37ea74fa.jpg,
  210301-ashwin-bhat-lhc-001-330x248-webseite-jpeg-39a0f8fe.jpg,
  gregor-schleussner-250701-248x330-jpg-53c1f225.jpg, frank-bauer-230720-v1-248x330-73a1d2da.jpg,
  compliance-tails-76caf4a4.jpg, compliance-cockpit-e03ba551.jpg (the board and compliance lists);
  facts-bg-paralaxe-01-864px-b82ad10b.jpg, mobile-facts-bg-01-92327d72.jpg (key facts);
  history-slider-bg-5ef3a125.jpg (timeline); 042b0cfe-5e6c-74b0-8652-a93835861949-ebc126d7.png
  (Support & Contact's "Contact us").

The six list pictures the importer already placed. For the other four the importer and the theme
had to use them (tests first: test/cargo-import-439.test.mjs, test/cargo-media-439.test.mjs):

- key facts a section of their own (style key-facts): www's photo covering the band behind the
  slides, the phone photo below 768 px, the slides the screen's width, "Key Facts" over them. 1440:
  1440 x 649 (www 1440 x 649), no sideways scroll;
- the timeline (section timeline) on www's photo at every width (the grey band before);
- "Contact us": from 768 px the photo the box's right half, 16:9 (1440: the box 1296 x 364.5, www
  1296 x 364), under the text on phones (451 px high, www 461), 4 px corners.

/en and /de ci/facts-figures and support-and-contact re-imported, each against DA's copy (no
passage or picture lost, nothing left on www), uploaded and previewed. Checked on a local dev
server with the code and lh-cargo's preview content at 1440 and 390 against cargo-parity-001's
screenshots: one h1, no broken picture, no sideways scroll. parity.md rows 18 and 21.

Differs (open): on phones the key facts slides are the desktop ones over the phone photo (www's
phone slider, seven text slides with icons, is its phone copy and not imported; the icons are not
in DA); www's "Facts & Figures >" link in the slider and its arrows beside the dots are not
imported. The es to pt Facts & Figures pages could take the same pictures with one run (not in the
brief; not done).

Release order: the code commit first (cargo.css and the importer), then the files with their pages
(da-upload sends them together): /en/ci/facts-figures, /de/ci/facts-figures,
/en/support-and-contact, /de/support-and-contact.

Found on the way, not ours: styles/styles.css has :has() inside :has() at lines 763-790 (the table
sections after a heading) and 1183-1184 (a column's last picture). Browsers reject such selectors
(CSS.supports: false in Chromium), so those rules never apply. For lh-com's owner (ema-cashub).

### 3. The 59 story pictures of item 2

Noted in stories-offline-2026-11-06-files.tsv (a third column): those 59 answer 404 on www itself
(also with ?t=, the user's check), so www's stories link dead pictures and leaving them out is
right. The 58 new ones from cargo-snapshots-005 are marked not checked on www (no requests to www).

### 4. The transport stories hub, all 100 stories

www's hub page holds its whole list in a script (var diaries = [...], 100 stories in www's order);
its grid renders the tiles as the visitor scrolls, which is why the captures had 10 (en) and 22 (es
to pt). The importer (cargo-import.mjs, tests first: test/cargo-hub-439.test.mjs) now builds the
hub's tiles from that list, each as www's tile (the headline linked, the text, "More"). A story www
rendered keeps its tile's text: www's Portuguese page shows its tiles translated while its list is
English (without this the Portuguese hub lost 8 passages against DA). The picture: the teaser's own
when lh-cargo's DA has it, else the story's first picture in DA, else none. All 500 tiles got the
teaser's own picture: DA already had every one (uuid-named, uploaded with the stories). Nothing
requested from www.

/en, /es, /fr, /it and /pt/ci/transport-stories re-imported (100 tiles each), each against DA's
copy (no passage or picture lost), uploaded and previewed. Checked on main--lh-cargo--moved-
permanently.aem.page at 1440 and 390 (en, pt): one h1, 101 pictures, none broken, no sideways
scroll; the last tile www's last story. English links three stories to www (artcube, hanoi,
isotope-institute: on www's list, not in Cargo's story scope); es to pt link www's stories in their
language, as before (those are not ours).

Open: /de/ci/transport-stories has no capture on this machine (as in item 4 of the package), so it
stays as it is; it needs a capture, then the same run.

Preview paths (any order; no files): /en/ci/transport-stories, /es/ci/transport-stories,
/fr/ci/transport-stories, /it/ci/transport-stories, /pt/ci/transport-stories.

### 5. carousel-cards' scrolling track by keyboard

blocks/carousel-cards/carousel-cards.js (shared, brand-neutral; tests first:
test/carousel-cards-track-focus.test.mjs): a track that scrolls sideways is a Tab stop
(tabindex 0) named as the carousel (the block's translated label), and drops it when its cards fit;
carousel-cards.css draws the focus ring inside its edge (as carousel-images' track). The arrow keys
scroll a focused track (the browser's own). On a local dev server with the code and lh-cargo's
preview content: /en and /de/ci/facts-figures at 1440, the timeline's track reached by Tab, two
ArrowRight presses scroll it 432 px, the ring 2 px; at 390 the timeline runs down the page (no
sideways scroll, no Tab stop). axe (WCAG A/AA) on both pages at 1440 and 390: 0 violations (before:
scrollable-region-focusable, serious, at 1440). Every brand's smoke before and after the push.

### Summary

| Item | Commit | What | Rollback |
| --- | --- | --- | --- |
| 1 | e428f498 | cargo.css: the story picture modules no wider than a phone (one grid column the block's width) | revert e428f498 |
| 1, 3 | 2cc59a42 | 118 stories of cargo-snapshots-005 uploaded and previewed; the stories tables (399 rows added, the not-captured list the 5 404s, the 59 dead pictures noted) | upload DA's previous copies back (read before the upload: the 118 documents as DA had them); the tables: revert |
| 2 | b99b88b2 | cargo-import.mjs and cargo.css: key facts, the timeline and "Contact us" with www's photos | revert b99b88b2 (the four pages then show their photos as plain pictures: re-upload DA's previous copies too) |
| 2 | 2cc59a42 | the ten files of cargo-media-002 in DA; Facts & Figures and Support & Contact (en, de) re-imported, uploaded and previewed; parity rows 14, 18, 21 | upload DA's previous copies of the four pages back (the files can stay: nothing else uses them) |
| 4 | 2842a2d0 | cargo-import.mjs: the hub from www's whole story list | revert 2842a2d0 |
| 4 | ac2cadee | the en, es, fr, it, pt hubs with all 100 stories, uploaded and previewed | upload DA's previous copies of the five hubs back |
| 5 | 08315222 | carousel-cards: a scrolling track a Tab stop with a name, its focus ring | revert the commit |

DA's previous copies of every document this brief uploaded are kept on this machine (not in git:
the drop-derived scratch folder) for those rollbacks.

### Preview path lists, in release order

1. Code: e428f498, b99b88b2, 2842a2d0 and 08315222 (merging is shipping: on main).
2. Files with their pages (da-upload sent them together): /en/ci/facts-figures,
   /de/ci/facts-figures (with the nine Facts & Figures pictures), /en/support-and-contact,
   /de/support-and-contact (with the contact photo).
3. The hubs: /en/ci/transport-stories, /es/ci/transport-stories, /fr/ci/transport-stories,
   /it/ci/transport-stories, /pt/ci/transport-stories.
4. The 118 stories: the rows of tools/importer/cargo-runs/stories-offline-2026-11-06.tsv whose
   result is "uploaded and previewed" and note starts "cargo-snapshots-005 (brief 439)"
   (also tools/importer/cargo-runs/stories-439-upload.txt, one path a line).

### Open after brief 439

- /en/news/theculture held (its ten phone-only sentences): DA keeps its copy.
- /de/ci/transport-stories: no capture; stays as it is.
- Key facts on phones: www's phone text slider (seven slides with icons) is not imported; the
  "Facts & Figures >" link in the slider and www's arrows beside the dots neither.
- The es to pt Facts & Figures pages could take the nine new pictures with one run (not asked).
- styles/styles.css's :has() inside :has() (lines 763-790, 1183-1184): never applied; for ema-cashub.

## Brief 442: Cargo follow-ups and Brussels

Nothing published: documents uploaded to DA and previewed (da-upload.mjs), the upload state merged
with origin's entry by entry before each push. styles/styles.css on current main (after ema-cashub's
0b5e12f8): no :has() inside :has() left.

### 1. The homepage's phone ULD picture in the importer

cargo-import.mjs (tests first: test/cargo-uld-import-442.test.mjs): the ULD teaser (www's
.teaserULD, one picture with a max-width: 767px source) writes the phone picture as its picture
cell's second picture, after the desktop one, without alt text (the same picture), which
hero-card-overlay shows on Cargo below 768 px (ema-adobe's 3c4c099). /en/home and /de/home imported
once against DA's current copies: identical (every line of main the same), so nothing uploaded.
Commit e0d6a35f.

### 2. Key facts on phones as www's

www shows its phone copy below 768 px (LCAGCP-lcagMobileFactsSlider: seven text slides, arrows and
dots, the "Facts & Figures" link, over the phone photo). Measured on cargo-parity-001 rendered with its
own stylesheets (its serve.py, copied into my tools and run there; nothing requested from www).

- cargo-import.mjs: after the desktop slides, the phone slides as carousel-cards (facts), one row
  per slide (www's slick clones left out): the icon when lh-cargo's DA has it, the lines (www's h2 as
  strong; the footnote as it is); then the link, all in the key-facts section.
- cargo.css below 768 px: the band as tall as the phone photo (556 x 864: 606 px at 390), "Key Facts"
  at its top, one slide at a time, the lines 24/28.8 bold navy centred 10 px apart, the arrows
  (48 px) either side of the dots (20 px navy rings, the current one filled) in one row 100 px above
  the band's foot, the link 16 px navy 16 px in and 30 px above the foot; the desktop slides hidden.
  From 768 px as before (www's desktop slider from its md breakpoint).
- Tests first: test/cargo-kf-phone-442.test.mjs.

Checked on a local dev server with the code and lh-cargo's preview content: 390, www's layout
(dots 200 px wide, www 210; the row's foot 100 px above the band's; the link at x 16, 30 px above the
foot; no sideways scroll); 768 and 1440 the desktop slider as before (1440 x 649 at 1440). axe on
/en and /de at 1440 and 390: 0 violations.

Differs: the slides' icons (six SVGs on www: lh-icon-earth-pin, fact-icon_63%, lh-icon-money,
lh-icon-people-group, lh-icon-airplane-booking, in /documents/20184/30701803/) are not in
lh-cargo's DA, so the slides show their text only (www shows each icon at half the width above the
text; its first slide has none); the link goes to www's PDF (2025-Facts-Figures_EN.pdf, _DE for
German), which lh-cargo's DA does not have. Our first slide has no "previous" arrow (www's slider
loops).

### 3. The es, fr, it and pt Facts & Figures pages

Imported in the same run as en and de (six documents), each against DA's current copy: the nine
pictures of cargo-media-002 in every language, the key facts' phone slides and link as item 2; no
passage or picture lost. The es to pt pages' hero video now DA's copy (/documents/home-impressions-
02-186d57.mp4, as en and de) instead of www's static.lufthansa-cargo.com link (the only line the
check flagged). Uploaded and previewed; one h1, no broken picture, no sideways scroll at 1440 and
390 (local dev server with the code).
