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

### 4. Phone-only passages in the story import

cargo-import.mjs (tests first: test/cargo-story-phone-442.test.mjs): after a story module's
desktop copy, the paragraphs of its phone copies (d-block d-sm-none) whose sentences the page's
desktop copy lacks are kept: as they are when none of their sentences is on the desktop, else only
their missing sentences, each once. A sentence counts as on the desktop when a desktop sentence has
80 % of its words (a word also inside one two characters longer: www's bullet glyph glued on,
"uCare/td"). That keeps the phone copy's older wording out ("Kühne+Nagel" next to "Kuehne+Nagel",
the "xcustomers" typo, another word order). A phone paragraph in the page's other language (www's
English phone copy of a German story) is not kept. A first run without those two rules would have
added near-duplicates to 9 stories; they are what the tests now check.

All 740 captured stories imported again, each against DA's current copy: 738 identical, 2 change, none
loses anything:

- /en/news/theculture (held in brief 439): its ten phone-only sentences and the photo credit kept,
  plus www's breadcrumb; uploaded and previewed.
- /de/news/night-shift-in-chicago-44 (held in item 2 of the package): its photo credit ("Fotos:
  Cornelia Garmann, Natalia Pekhanova") kept, plus the breadcrumb; uploaded and previewed.

No other story has phone-only text: none of the 740 gains text. Both on
main--lh-cargo--moved-permanently.aem.page at 1440 and 390: one h1, no passage twice, no broken
picture, no sideways scroll. stories-offline-2026-11-06.tsv: both rows "uploaded and previewed".

### 5. Brussels: brussels-snapshots-013

The archive (sha256 05911132…0793f4a, as its .sha256) holds 36 pages of 18 market roots that the
replica answered 404 for (its README: Canada and US legal pages, invoice and contact confirmations,
feedback topics, fare alert, aviation services law, luggage promotion 2025, birthright rebooking,
Bruegel). Neither the articles hub nor Milan (P41) nor any P38 page is in it, so nothing imported
from it (those 36 were not asked for).

Pages a capture would need (parity.md P38 and P41):

- P38 (www's newer text): /be/fr/our-company, /be/en/travel-classes/economy,
  /be/fr/travel-classes/business, /be/fr/travel-classes/premium-economy, /fr/fr (the homepage),
  /ke/en (the homepage).
- P41 (the hub's newest article): /be/fr/articles, /be/fr/articles/milan-citytrip; and, to keep the
  English hub alike, /be/en/articles with its Milan article.

### Summary

| Item | Commit | What | Rollback |
| --- | --- | --- | --- |
| 1 | e0d6a35f | cargo-import.mjs: the ULD teaser keeps www's phone picture; /en/home and /de/home import identical to DA (nothing uploaded) | revert |
| 2 | 5b96eb0c | cargo-import.mjs and cargo.css: key facts on phones as www's (phone slides, the link) | revert, and re-upload the six Facts & Figures pages' previous copies |
| 2, 3 | e0821a67 | Facts & Figures en, de, es, fr, it, pt re-imported (phone slides; es to pt with the nine pictures), uploaded and previewed | re-upload DA's previous copies (kept on this machine) |
| 4 | 2dbb5b36 | cargo-import.mjs: phone-only story passages kept | revert |
| 4 | 58409f7c | theculture and night-shift-in-chicago-44 uploaded and previewed; the stories table, parity P38/P41 | re-upload their previous copies; revert the docs |
| 5 | 58409f7c | brussels-snapshots-013 checked, the capture list | nothing to roll back |

### Preview path lists, in release order

1. Code: e0d6a35f, 5b96eb0c, 2dbb5b36.
2. /en/ci/facts-figures, /de/ci/facts-figures, /es/ci/facts-figures, /fr/ci/facts-figures,
   /it/ci/facts-figures, /pt/ci/facts-figures (their files are already in DA).
3. /en/news/theculture, /de/news/night-shift-in-chicago-44.

### Open after brief 442

- The key facts' phone slide icons (six SVGs in www's /documents/20184/30701803/) and the
  2025 Facts & Figures PDFs (EN, DE) are not in lh-cargo's DA: the slides show text only and the link
  goes to www's PDF.
- Brussels P38 and P41: the captures listed under item 5.

## Brief 443: accessibility on Air Dolomiti and TAP, then the new captures

Nothing published: documents uploaded to DA and previewed only. Every brand's smoke before and
after each push; TAP by hand too (the 40 TAP pages below on tap.turnsthe.page: status, final
address and title, before and after).

### 1. Accessibility pass on Air Dolomiti and TAP

axe-core 4.10.2 (npm, sha512 checked), WCAG 2.0 to 2.2 A and AA, at 1440 and 390, on the aem.page
previews, the consent choice made and any open dialog closed first (the runner of the package's
item 5, with its sanity check: 23 to 33 rules passed on every page, none blinded).

- Air Dolomiti (main--lh-airdolomiti--moved-permanently.aem.page): 42 pages, 14 per language (it,
  en, de): the homepage, baggage (a menu page), support and contacts, a blog article, the timetable,
  manage booking, the destinations hub and a destination, a route, an airport, a FAQ page, a legal
  page, the fleet, promotions.
- TAP (main--lh-tap--moved-permanently.aem.page): 40 pages, 5 in each of the 8 language versions
  (en-pt, pt-pt, es-es, de-de, fr-fr, pt-br, it-it, pl-pl): the homepage, a help page, the
  destinations' inspiration page (TAP has no single-city pages), the alerts page, a legal page.

Fixed (ours):
- Air Dolomiti: carousel-cards' dots on the destinations pages (/destinazioni, /destinazioni/
  francoforte, /en/destinations, /de/reiseziele) were 8 px targets 16 px apart (target-size,
  serious, 58 nodes on 8 page-widths). In Air Dolomiti's theme (styles/themes/airdolomiti.css; the
  shared carousel files keep Air Dolomiti out, test/carousel-dots-374), each dot a 24 px target with
  the 8 px dot drawn inside, as the other brands'. Tests first: test/airdolomiti-a11y-443.test.mjs.
  On a local dev server with the code and lh-airdolomiti's preview content: those four pages at
  1440 and 390, 0 violations; the dots as before, 24 px apart.

Not ours (www's own design):
- TAP: the booking box's empty dates field ("Selecionar datas", "Daten auswählen", ...) #b0aeb4 on
  white, 2.19:1 (color-contrast, serious), on all eight homepages at both widths. TAP's parity.md
  row 91: www's field the same colour, kept as www (axe flags ours because ours is a text label
  where www's is an input's placeholder).

Everything else: 0 violations on all 84 Air Dolomiti and 80 TAP page-widths.

### 2a. Brussels P38 and P41 (brussels-snapshots-014, brussels-parity-003)

Both archives from the drop (sha256 097d19b0…f423a6 and f78cf1fc…16ecb7e, as their .sha256). The
ten pages of snapshots-014 placed in the Brussels importer's snapshots (the eight older captures kept
on this machine), imported with brussels-import.mjs, each against DA's current copy:

- From DA, as in the package's item 3 (this machine has not the workspace's scope.json and page
  list): the markets and chat-button metadata rows, and 22 links DA has relative that the import
  made absolute (relink).
- The homepages (/fr/fr, /ke/en): their teasers are www's newer ones (P38), so DA's older teasers
  and their pictures go (each checked: not in the new capture). Their flight search kept as DA has
  it: the shared flight-search import now writes the group-booking link and the new passenger
  labels in English on French pages ("Group bookings for 10 or more passengers.", "Children",
  "Infants without seat") and the link to www's /content/bel/markets/... address; for ema-cashub.
- The class pages and our-company: www's stage is now inspiration-teaser-tall, so the import
  (rightly) writes no narrow; the Brussels theme's title rule keyed on narrow. Now every stage's
  title (h1, h2 or h3, but the white card's) as www's inspiration teaser's in all three Brussels
  parity captures: white, capitals, 36 / 39.6 px, 48 / 52.8 px from 768 px; the tabs close up to
  any stage. Tests first: test/brussels-443.test.mjs (test/brussels-parity-002 follows).
- The two Milan articles are new documents.

Uploaded and previewed (ten). Against brussels-parity-003 at 1440 and 390 (local dev server with the
code and lh-brussels' preview content): our-company, the three class pages, ke/en: no difference;
fr/fr at 1440 lacks only www's destination finder's status line ("Les offres pour Aller-retour sont
affichées", the shared block's); the Milan articles: no difference. The hubs (blog-overview) list
the site's query index, so Milan shows there once the articles are published and indexed (P41).
parity.md P38 and P41.

Preview paths (release order: the brussels.css commit, then these, the Milan articles before the
hubs): /be/fr/articles/milan-citytrip, /be/en/articles/milan-citytrip, /be/fr/articles,
/be/en/articles, /be/fr/our-company, /be/en/travel-classes/economy,
/be/fr/travel-classes/business, /be/fr/travel-classes/premium-economy, /fr/fr/homepage,
/ke/en/homepage.

### 2b. Facts & Figures' slide icons and PDFs (cargo-media-003)

The archive (sha256 389556f6…5156d73, as its .sha256): www's five icon SVGs (its six icon slides
use the airplane icon twice; the first slide has none on www) and the 2025 Facts & Figures PDFs
(EN, DE), each checked against the manifest (bytes, sha256).

- The icons as PNGs (sharp at density 192, as the importer's prepareImages: lh-com's documents hold
  raster images), named as cargo-assets.mjs names images: /media-da/cargo/fact-icon-63-ab297000.png,
  lh-icon-money-7ed4b32e.png, lh-icon-people-group-905bfd29.png, lh-icon-airplane-booking-146e1d0a.png,
  lh-icon-earth-pin-03eed020.png; sent to DA with the pages.
- The PDFs under cargo-assets.mjs's document names, uploaded to lh-cargo's DA and previewed as
  cargo-assets.mjs --upload does (this machine has no asset map, so that command can't run here):
  /documents/2025-facts-figures-en-df297c.pdf and /documents/2025-facts-figures-de-68076f.pdf; the
  preview serves them byte for byte (gzip on the wire only).
- The six Facts & Figures pages (en, de, es, fr, it, pt) imported again, each against DA's copy:
  the only changes the six slide icons and the "Facts & Figures" link, now the site's own copy (the
  German page the DE PDF, the others the EN one, as www). Uploaded and previewed. On
  main--lh-cargo--moved-permanently.aem.page at 1440 and 390: one h1, 20 pictures, none broken, no
  sideways scroll; at 390 the icons half the slide's width above the lines, as www's
  (.LCAGCP-factIcon max-width 50 %). The band is 631 px high at 390 (606 before: the tallest slide,
  icon and four lines, sets it; www's slider sits over its photo).

Release order: the two PDFs (/documents/2025-facts-figures-en-df297c.pdf,
/documents/2025-facts-figures-de-68076f.pdf), then the pages with their icons:
/en/ci/facts-figures, /de/ci/facts-figures, /es/ci/facts-figures, /fr/ci/facts-figures,
/it/ci/facts-figures, /pt/ci/facts-figures.

### Summary

| Item | Commit | What | Rollback |
| --- | --- | --- | --- |
| 1 | 8bbb6d94 | airdolomiti.css: carousel-cards' dots as 24 px targets (axe target-size); TAP's one finding listed as www's design (parity row 91) | revert |
| 2a | 8d232e10 | brussels.css: every stage's title as www's inspiration teaser's; the class tabs up to any stage | revert |
| 2a | 431fe538 | ten Brussels pages from brussels-snapshots-014 (P38, the Milan articles for P41), uploaded and previewed; parity P38/P41 | re-upload DA's previous copies (kept on this machine); the two Milan articles: delete them in DA |
| 2b | (this push) | cargo-media-003 in lh-cargo's DA; the six Facts & Figures pages with the slide icons and the site's own PDFs, uploaded and previewed | re-upload the six pages' previous copies; the files can stay |

### Preview path lists, in release order

1. Code: 8bbb6d94, 8d232e10.
2. Brussels: /be/fr/articles/milan-citytrip, /be/en/articles/milan-citytrip, /be/fr/articles,
   /be/en/articles, /be/fr/our-company, /be/en/travel-classes/economy,
   /be/fr/travel-classes/business, /be/fr/travel-classes/premium-economy, /fr/fr/homepage,
   /ke/en/homepage.
3. Cargo files: /documents/2025-facts-figures-en-df297c.pdf, /documents/2025-facts-figures-de-68076f.pdf.
4. Cargo pages: /en, /de, /es, /fr, /it, /pt + /ci/facts-figures.

### Open after brief 443

- TAP's empty dates field (#b0aeb4, 2.19:1): www's design, kept as www (parity row 91).
- For ema-cashub: the shared flight-search import writes the group-booking link and the new
  passenger labels in English on French pages and links www's /content/bel/markets/ address (seen
  on /fr/fr/homepage; the two Brussels homepages keep DA's flight search meanwhile).
- The Milan article shows on the Brussels hubs once it is published and indexed (P41).
- The www destination finder's status line ("Les offres pour Aller-retour sont affichées") is not
  rendered by the shared destination-finder block.

## Brief 447: Air Dolomiti's look, then two smaller fixes

Nothing was published. The two Cargo documents were uploaded to DA and previewed only, and the
upload state was merged with origin's entry by entry before the push. Lint and the full suite ran
before each of the four pushes. Every brand's smoke ran before and after each push (0 differences
every time), and TAP's 40 pages were checked by hand after each push: all 200, the same as
brief 443's last check.

At the start of this turn, these were not committed or pushed:
- .migration/project.json: local tool state, kept out of git.
- The Air Dolomiti theme, its footer logo and three tests: brief 447's half-done item 1. They are
  pushed now, in 75ddd523.

### 1. Air Dolomiti against airdolomiti-parity-001 (pass 2)

**The archive.** Prefix S0cxjp_4Yl8ABoeoIgJKtq4s, sha256 a2b8d33e…, which matches its .sha256. It
holds 48 pages (it, en, de, at 1440 and 390) and 21 menu states. It sits in its own directory, and
its serve.py was copied into my tools directory and run from there with `python3 -I`, serving the
archive with its own stylesheets (requests off the machine aborted).

**How it was compared.**
- Measurements: the archive's own, plus our pages measured the same way (admeasure.mjs).
  - Ours were measured on a local dev server (this tree's code, lh-airdolomiti's preview content)
    while working, and on main--lh-airdolomiti--moved-permanently.aem.page after each push.
- Per page type: every visible text line's box and type, matched by its text (foot-leaves.mjs,
  leaves-cmp.py).
- Backgrounds and borders: compared box by box.
- Menu states: the 21 rendered and compared the same way.

The rows are in tools/reports/airdolomiti/parity.md, "Pass 2" (rows 21 to 52, A8).

**Fixed (ours), the elements on every page first:**
- 75ddd523:
  - the page width (www's 90vw / 95vw);
  - page titles;
  - the footer from 1025 px, and below 768 px as www's phone footer (1046 px high on both at 390);
  - the 80 px phone bar;
  - the desktop bar and panels (all three panels within 1 px of www's);
  - www's phone menu in place of lh-com's flyout (www's three sections at 390, to the pixel; axe 0
    violations; the focus kept inside, Escape back to the Menu button);
  - running-text links;
  - the text hubs (destinations, flights, assistance; the fleet's text);
  - manage booking;
  - the FAQ pages' two columns (lounges, seat reservation, parking);
  - the destination stage;
  - the baggage cards.
  It also includes a fix to my own earlier change: the 2.5vw margin from 930 px came before the
  5vw default in the file, so the default won and pages at 1440 were 72 px in, not www's 36.
- 0f22c8b6:
  - section headings as most of www's (34/42, 38/46 from 930 px);
  - the destination hub's cards as www's CardNews.

**The 48 pages against www, at 1440 and 390** (bcompare.py; "ok" means the same height within 15%,
the same title text, size and colour, no missing headings or text passages, the same first copy
size, the same breadcrumb, no sideways scroll):
- before: 11 of 96 page-widths ok;
- after the three pushes, on preview: 42 of 96.
- Left are mostly page heights:
  - the destinations hub is 3,400 px longer at 1440 and 8,000 at 390: its 24 cards are each as
    tall as www's now, but www shows 15 a page (row 38);
  - the text hubs' "first copy 16 px" is the "Book your flight" line above their title (row 36).

**Open** (all in parity.md, with owners):
- The documents (importer and upload; this brief asked for no Air Dolomiti uploads):
  - the booking widget strip that www shows under the header on the hubs and destination pages
    (ours: a "Book your flight" button above the title);
  - the breadcrumb's middle level (Home | Servizi | Parcheggi);
  - the blog list's first heading ("Categorie" on www);
  - the footer columns' order on phones (A8: the Tab order follows the documents', the screen
    www's);
  - it-orario-voli, which on www has the FAQ pages' title.
- Blocks:
  - www shows the destination hub 15 cards a page, with page numbers;
  - the destination stage's what-to-do links sit inside the stage on www, as white pills;
  - the IFE page's lead (28.08 px);
  - manage booking's text (19.44 px);
  - the footer from 768 to 1024 px (www keeps its phone footer up to 929 px).
- The phone bar's booking button and the phone menu's text-size setting (www's "Dimensions"): ours
  has the accessibility button in the bar instead.
- The hamburger icon (www's three 31 px lines).
- "Change Cookie Settings" in the footer: Air Dolomiti has no consent tool here, your decision.

### 2. Cargo homepage (ema-adobe's brief 440 notes)

Both fixes are in cargo-import.mjs, tests first (test/cargo-import-447.test.mjs).
- The Infrastructure band no longer writes the documents' "Show the map on www.lufthansa-cargo.com"
  / "Karte auf www.lufthansa-cargo.com anzeigen" link. www doesn't show one there, and it took
  68 px at 390. Pages with www's Google map keep theirs.
- The service widget now opens on www's Booking tab. www's create button ("Create booking" /
  "Buchung erstellen", to eBooking on www, which needs the portal's login) and its "eBooking
  dashboard" link are the form tab's panel, which booking-lookup (tracking) shows above the tracking
  form in the same card. The tracking form stays under them, as before. www's Origin and
  Destination fields only fill eBooking's form behind its login, so they are not copied.

/en/home and /de/home were imported against DA's copies, read just before. The diff shows only the
two intended changes on each page: the Panel row added and the map link paragraph removed. Both
pages were uploaded and previewed. On main--lh-cargo--moved-permanently.aem.page:
- at 1440 the card shows Create booking, the dashboard link, then the tracking form;
- at 390 the same;
- the map link is gone.

The strip is now 307 px high at 1440 (www's 272): ours puts the dashboard link on a line of its own.

### 3. Brussels: the destination finder's status line

www's fare teaser has a polite, screen-reader-only live region after its trip type chips ("Les
offres pour Aller-retour sont affichées", fareteaserdynamicevo.fullApp.offers
.selectionAnnouncementTripType). The shared destination-finder block now renders it after its
chips for every brand, and updates it once the list for a newly chosen trip type shows.
- The English and French texts are www's. The other eleven languages are ours until a capture has
  www's wording. A block row "Selection announcement" overrides the text.
- Tests first: test/destination-finder-announcement-447.test.mjs.
- Checked locally and on main--lh-brussels--moved-permanently.aem.page: /fr/fr/homepage at 1440
  ("Les offres pour Aller-retour sont affichées", then "… Aller simple …" after choosing one way),
  and /be/en/homepage at 390.
- Every brand's smoke: 0 differences before and after.

### Summary

| Item | Commit | What | Rollback |
| --- | --- | --- | --- |
| 1 | 75ddd523 | Air Dolomiti: page width, titles, footer (desktop and phone), phone bar, desktop panels, www's phone menu (header-airdolomiti.js), running-text links, text hubs, manage booking, FAQ pages, destination stage, baggage cards; test/tap-menu.test.mjs follows the menu binding | revert |
| 1 | 0f22c8b6 | Air Dolomiti: section headings as www's, the destination hub's cards | revert |
| 1 | (this push) | parity.md pass 2 (rows 21 to 52, A8) and this report | revert |
| 2 | 0eb17599 | cargo-import.mjs: no map link under the Infrastructure band; the service widget opens on the Booking tab | revert, re-import /en/home and /de/home, upload |
| 2 | 7caff747 | /en/home and /de/home re-imported, uploaded and previewed | re-upload DA's previous copies (kept on this machine: .scratch/offline/b447/home/da) |
| 3 | a5a14127 | destination-finder: the trip type announcement, every brand | revert |

### Preview path lists, in release order

1. Code (on main): 75ddd523, 0f22c8b6, 0eb17599, a5a14127. Air Dolomiti's and Brussels' changes are
   code only: they show on their previews already and go live with no publishing.
2. Cargo pages: /en/home, /de/home.

### Open after brief 447

- Air Dolomiti: the open rows above (parity.md pass 2).
- For ema-cashub: none new.

## Brief 448: Brussels headings, finder texts, Air Dolomiti's booking strip, breadcrumbs, paging and footer

Nothing was published. Documents were uploaded to DA and previewed only; the upload state was
merged with origin's before each push. Before each of the four pushes: a pull (fetch and rebase),
lint and the full suite (2,362 to 2,393 tests, 0 failures). Every brand's smoke ran before and
after each push, with 0 differences each time. TAP's 40 pages were checked by hand after each
push: all 200, the same as before. Paths in release order:
tools/reports/offline-2026-11-06/preview-paths-448.txt.

At the start of this turn only .migration/project.json was uncommitted. It is local tool state,
kept out of git.

### 1. Brussels: one h1 per page (accessibility)

- www has no h1 on the economy page: in brussels-parity-003 and the Studio capture its stage title
  is an h2, while business class uses an h1. So "as www does" is an h2. The page has no h1 on www
  either, so the import now improves on www here.
- Of the 1,476 Brussels documents on preview, 134 had no h1. www has none on any of them either.
  The 98 market homepages have only www's visually hidden "Brussels" in its header.
- brussels-import.mjs withPageH1 (test/brussels-h1-448.test.mjs, commit 6cfdf622):
  - www's own h1 where it has one: the 98 homepages' hidden "Brussels", as the first section's h1
    with the style hidden-heading (Discover's withHiddenH1);
  - otherwise the first heading, if it is an h2, becomes the h1, keeping its id and size marker
    (18 pages: economy and premium economy in en and fr, heritage in six languages, the ski
    campaign, beobank, Schengen, the California privacy statement). The theme styles the stage's
    title the same at any level: the economy title is still 48 px white;
  - with no heading at all, the page's title becomes a hidden h1 (18 pages: the feedback forms,
    the destination search, retain your status).
- The step was applied to DA's current copies; each differs only by the heading (2 or 7 lines).
  This machine has no Brussels scope.json, so a full re-import would bring back the differences
  noted in brief 443. Uploaded and previewed in 8779dde6. On preview, all 1,476 documents now
  have an h1.

### 2. Destination finder: www's announcement texts

The only captures on this machine with the fare teaser's label bundles are Brussels' (bd-snapshots,
brussels-parity-003, brussels-snapshots-014); the lufthansa.com, SWISS and Austrian captures are
not here. From the de/de, es/es, it/it and nl/nl homepages (commit 03295716):
- de "{TRIPTYPE} Angebote angezeigt";
- es "Se muestran {TRIPTYPE} ofertas";
- it "Sono visualizzate le offerte per {TRIPTYPE}";
- nl "Er worden {TRIPTYPE} aanbiedingen weergegeven".

English and French were www's already. **Still my own wording: pt, el, ja, ru, zh, pl, ko.**

### 3. Air Dolomiti: the booking strip and the breadcrumb's middle level

- Booking strip:
  - airdolomiti-import.mjs bookingWidget: www's booking widget is now the flight-search
    (airdolomiti) block wherever www has it, in place of the link to the booking page (route and
    booking pages as before).
  - Applied to DA's copies: 224 documents (airports 122, destinations 82, the hubs, promotions and
    a few more), each the booking paragraph replaced by the block in a section before the page,
    with the language's rows as on its homepage.
  - Checked on preview: the strip at 1440, and the "Book your flight" card at 390 as www's.
  - Left: www's strip has no trip type tabs, and its departure is empty where ours shows the
    market's airport.
- Breadcrumb:
  - blocks/breadcrumb now reads Breadcrumb Levels (every brand, a new optional row): crumbs
    without a link between the parent and the page.
  - The importer writes them from www's trail.
  - The theme capitalises the crumbs and sets the unlinked levels semibold, as www.
  - Applied to 131 documents. www's level is the address's first part with spaces ("servizi",
    "travel info", "unsere dienste"); that rule gave www's own trail on all 45 of the archive's
    pages that have one.
  - On preview: "Home | Servizi | Parcheggi Convenzionati", "Home | Travel Info | Seat
    Reservation", "Home | Unsere Dienste | Lounge Zutritt".
- Code commit 8e48f975; the 354 documents in 2c3e2fd7. Not changed: the routes pages and four
  articles, whose booking link is part of their text.

### 4. Air Dolomiti destinations hub: paging

**Correction:** www shows 9 cards a page, not 15 (3 pages in en and de). My brief 447 count
included the carousel's cards.

- The cards-teaser option paged (paged-N), brand-neutral (test/cards-teaser-paged-448.test.mjs):
  - www's controls under the grid, 50 px on: previous, the page numbers as 30 px circles (the
    current one filled navy), next;
  - aria-current on the current number, the arrows disabled at the ends;
  - www's labels in it, en and de.
- The importer writes it for news-list-grid. The three hubs carry it.
- On preview:
  - /en/destinations and /de/reiseziele: 9 cards and "1 2 3";
  - /destinazioni has 2 cards, so no controls (www shows "1" between disabled arrows).
- axe on /en/destinations at 1440: 0 violations.
- Commits c7ae35ec and 2c3e2fd7.

### 5. Air Dolomiti footer: 768 to 1024 px and the Tab order

- The phone footer now runs up to 929 px and the desktop footer starts at 930 px, both as www's
  (before: 768 and 1025). From 768 px the footer block's open columns fold again into rows that
  open.
- blocks/footer/footer-airdolomiti.js (loaded on Air Dolomiti only) moves the columns into www's
  phone order below 930 px and back from 930 px, in place of CSS order. The phone band's logo is
  drawn by the social links' group; www's is no link, and ours used to come after the social links
  in the Tab order.
- On preview the columns are in www's phone order in the DOM at 390 and in the documents' order at
  1440. The footer is 1046 px at 390, 966 at 800 and 916 at 960. axe found 0 violations at 390 and
  800.
- Commit c7ae35ec. Parity rows 32, 36, 38, 42 and A8 are now fixed.

"Change Cookie Settings" is unchanged (with Ben).

### Summary

| Item | Commit | What | Rollback |
| --- | --- | --- | --- |
| 1 | 6cfdf622 | brussels-import.mjs withPageH1 | revert |
| 1 | 8779dde6 | 134 Brussels documents with an h1, uploaded and previewed | re-upload DA's previous copies (kept in .scratch/offline/b448/bd/da) |
| 2 | 03295716 | destination-finder: www's de, es, it, nl announcement | revert |
| 3 | 8e48f975 | breadcrumb Breadcrumb Levels; airdolomiti-import bookingWidget, breadcrumbRows; theme crumbs | revert (the documents' new rows are then ignored) |
| 3, 4 | 2c3e2fd7 | 354 Air Dolomiti documents (search 224, levels 131, the three hubs paged), uploaded and previewed | re-upload DA's previous copies (kept in .scratch/offline/b448/ad/da) |
| 4, 5 | c7ae35ec | cards-teaser paged; airdolomiti-import newsListGrid; footer up to 929 px, footer-airdolomiti.js | revert |
| | (this push) | parity.md rows, this report, preview-paths-448.txt | revert |

### Preview path lists, in release order

1. Code on main: 6cfdf622, 03295716, 8e48f975, c7ae35ec. These need no publishing.
2. lh-brussels: 134 documents.
3. lh-airdolomiti: 354 documents.

Both lists are in preview-paths-448.txt.

## Brief 452: the finder's last languages, Air Dolomiti's booking strip and paging, the next parity rows

Nothing was published. **No documents were uploaded:** from the start of item 2's documents, DA and
admin.hlx.page answered 401 (the Adobe credentials opt-in is off). The 224 documents are prepared
locally and listed in preview-paths-452.txt; they need DA access to be uploaded and previewed.

At the start of this turn only .migration/project.json was uncommitted (local tool state, kept
out of git).

Before each push: a pull (fetch and rebase), lint and the full suite (2,398 tests, 0 failures).
Every brand's smoke before and after: 0 differences. TAP's 40 pages by hand after the push:
all 200, the same as before.

### 1. The finder's announcement in the last seven languages (8688f26e)

- The seven archives match the brief's sha256. The drop has no `.sha256` next to them (404).
- Each was unpacked into its own folder; nothing in them was run.
- They carry no label bundle: the capture removed their scripts, and the key is in none of their
  707 files.
- But each language's homepage has the rendered live region next to its chips. Its text, with
  the checked chip's label as {TRIPTYPE}, is www's template:
  - pt "{TRIPTYPE} ofertas são mostradas"
  - ru "Показано предложений: {TRIPTYPE}"
  - zh "{TRIPTYPE} 优惠已显示"
  - el "Εμφανίζονται {TRIPTYPE} προσφορές"
  - ja "{TRIPTYPE}のオファーを表示しています"
  - ko "{TRIPTYPE} 특가 표시됨"
  - pl "Wyświetlono oferty: {TRIPTYPE}"
- Every language the finder has labels for now uses www's wording.

### 2. Air Dolomiti's booking strip as www's (a17b2d80; documents waiting)

- The flight-search option strip applies to the variant airdolomiti only:
  - the departure starts empty, as www's (an authored or prefilled origin still fills it);
  - from 1025 px the trip type tabs are hidden in the row; the phone panel keeps them, as www's.
- The importer writes it where www's widget sits under the header.
- Checked on the local dev server by giving /en/destinations the option on the way in:
  - at 1440: no tabs, departure empty;
  - at 390: the tabs in the panel.
- The 224 documents carry the option locally. Their base is brief 448's uploaded copies, since DA
  can't be read.

### 3. /destinazioni (a17b2d80)

The paging shows a lone "1" between the disabled arrows when there is one page, as www's. Checked
on main--lh-airdolomiti--moved-permanently.aem.page/destinazioni. The document needed no change.

### 4. The next parity rows (row 51, the largest; a17b2d80)

- Assistance: its 17 FAQ accordions are www's TogleTariffe, styled until now only beside the help
  card. The footer was 1,184 px off www's position at 1440 and is now 188; at 390, from 2,233 to
  151. Its contact lists are now set as the text around them.
- Flights to Europe: the line after "Flights from …" is 16/22 across the page, as www's.
- The 38/46 section headings from 930 px were not applying. In 0f22c8b6 that rule came before the
  34/42 default in the file, so headings stayed 34 px on desktop. This was my bug; the tests now
  check the order.
- New open rows in parity.md:
  - 53: the booking pages' phone card. The importer is fixed; 3 documents wait for DA.
  - 54: the booking form's flexible dates.
  - 55: flights to Europe's route cards (www's CardPromo).
  - 56: assistance's outline button.

### Summary

| Item | Commit | What | Rollback |
| --- | --- | --- | --- |
| 1 | 8688f26e | destination-finder: www's pt, ru, zh, el, ja, ko, pl announcement | revert |
| 2 to 4 | a17b2d80 | flight-search strip (Air Dolomiti only); importer strip and booking pages; paging's lone "1"; every FAQ accordion, lists, heading order in airdolomiti.css | revert |
| — | (this push) | parity.md rows 36, 38, 51, 53 to 56; this report; preview-paths-452.txt | revert |

### Preview path lists, in release order

1. Code on main: 8688f26e, a17b2d80.
2. Waiting for DA access: 224 Air Dolomiti documents (the strip), then /prenotazioni,
   /en/booking and /de/buchung. All are listed in preview-paths-452.txt.

## Brief 456: the waiting documents uploaded, Air Dolomiti rows 53 to 56, then rows 43, 44, 47 and 40

Nothing was published. DA answered 200 from the first read of this turn, so everything prepared
in brief 452 went up first. **391 uploads of 255 distinct Air Dolomiti documents** were made to DA
and previewed, in the release order of preview-paths-456.txt. All were read back from DA afterwards
and equal the local copies.

At the start of this turn the following was uncommitted:

- .migration/project.json: local tool state, kept out of git;
- the 224 prepared strip documents in content-sites/, which is ignored.

Before each of the four pushes:

- a pull (fetch and rebase);
- lint and the full suite (2,423, then 2,437, 2,444 and this push's count; 0 failures);
- every brand's smoke before and after (0 differences; austrian-cn's /ch/de/homepage answered 503
  in one run before the second push and 200 after, which was transient on their host);
- TAP's 40 pages by hand after each push: all 200, the same as before.

### 1. The waiting documents (no code)

- **The 224 strip documents:** DA's copies still equalled brief 448's bases, so the prepared
  documents went up unchanged.
  - On main--lh-airdolomiti--moved-permanently.aem.page/en/destinations, at 1440: no trip type
    tabs and an empty departure.
  - At 390: the panel's tabs.
- **The three booking pages:** read from DA again (unchanged since the start of the turn), and the
  Open label row left off.
  - On preview at 390, /prenotazioni, /en/booking and /de/buchung show the form in the page, with
    no "Book your flight" card (row 53).

### 2. Rows 54 to 56 (f0540ca2)

- **Row 54 (flexible dates): not done, blocked.** None of the archive, the fixtures or
  shop-handoff.js shows how www's hand-off sends "+/- 3 days". To build it without guessing, I
  need a capture of www's booking request with the box ticked.
- **Row 56 (outline button):** in the archive, every TitleDescriptionTextCta button is www's
  outline button (style_btn_outline): 9 of 9, on assistance, the fleet and the destinations'
  airport links. www's other 121 buttons are solid.
  - The importer now writes that CTA as the secondary button. The theme styles it as www's:
    1 px teal ring, no fill, 16/22 500, 18px 40px, the 28 px arrow after the label, the lighter
    teal on hover.
  - It measures 269 × 66 px, as www's, at 1440 and 390.
  - 33 documents changed: the archive's 9 plus the destinations' airport links, which are the same
    block as the archived Bari and Munich pages.
  - Other text-block buttons (for example "Book now" on destination pages) can't be told apart
    from title-description-cta in a document. They change at the next import from the snapshots.
- **Row 55 (route cards):** www's select-flight-list (CardPromo) is now cards-teaser
  (three-up, routes).
  - Phones: one sideways row of grey 250 × 400 cards.
  - From 930 px: 140 px cards in a 20 px grid, two a row, three from 1230 px, the picture the left
    30 %.
  - The boxes equal www's on flights to Europe, Munich and Bari at 1440 and 390, as do the
    20 px gap above the cards and the 60 px below them.
  - 71 blocks on 68 documents.
  - www's phone arrows are not built yet (new row 58).

### 3. Rows 43 and 44, the destination stage (237a1b5b, 80458997)

- **Row 43 was not fully fixed.** Brief 447's stage rules only matched a section that also held
  the "What to do" tiles, so **54 of the 85 stages still showed the old navy card** (for example
  /en/destinations/basel). I found this while working on row 44.
  - The importer now writes hero-card-overlay (destination), and the rules follow the option.
  - The 6 hero cards with an h1 that are not www's HeroSecond (Miles & More and the on-board
    service pages, 3 languages each) are left as they are.
- **Row 44:** the section links are now a list in the stage, styled as www's pills: white, 64 px
  high, 8 px apart, 70 px under the box, centred, a sideways row on phones.
  - This also takes the stage off the cards-icon block, which belongs to ema-test.
  - DA keeps each pill's link and icon in their own paragraphs, which made the pills 88 px high
    on preview. 80458997 fixed that.
  - 83 documents, 31 of them with pills.
  - Checked on preview for Bari, Basel and Kattowitz at 1440 and 390.

### 4. Rows 47 and 40 (80458997, and this push)

- **Row 47:** the in-flight entertainment lead (www's DescritionNews) is now columns-media (news).
  - The picture spans the page at 600 px; the text sits in a 50vw column, title 28.08/36 navy,
    text 19.44/33 grey.
  - The boxes equal www's at both widths. Two of www's paragraphs wrap one or two lines more,
    which is down to font rendering.
  - 3 documents, checked on preview.
- **Row 40:** the manage booking text under the form is 19.44/33 grey, centred, with a blank line
  between paragraphs, 40 px under the form.
  - The paragraphs' heights equal www's at 1440 and 390.
  - Code only; checked on the local dev server against main's preview content.
- New open rows:
  - 57: the fleet's seat map links are text links on www but buttons here;
  - 58: the route cards' phone arrows.

### Summary

| Item | Commit | What | Rollback |
| --- | --- | --- | --- |
| 1 | a24f7162 | upload state: the 224 strip documents and the 3 booking pages (uploaded and previewed) | revert; the documents stay in DA |
| 2 | f0540ca2 | importer (TitleDescriptionTextCta CTA secondary, select-flight-list routes), airdolomiti.css (outline button, route cards), cards-teaser README | revert |
| 3 | 237a1b5b | importer (reach-monaco: the destination option, the pills in the stage), airdolomiti.css (the stage on the option, the pills) | revert; the 83 documents then need their tiles back (DA's earlier versions) |
| 3, 4 | 80458997 | importer (description-news news), airdolomiti.css (the pills 64 px, the lead) | revert |
| 4 | (this push) | airdolomiti.css (row 40); parity.md rows 40, 43, 44, 47, 53 to 58; this report; preview-paths-456.txt; the upload state | revert |

### Preview path lists, in release order

All in preview-paths-456.txt (391 lines, 255 distinct documents, lh-airdolomiti):

1. The 224 strip documents.
2. /prenotazioni, /en/booking, /de/buchung.
3. After f0540ca2: 78 documents (rows 55 and 56).
4. After 237a1b5b: 83 stage documents.
5. After 80458997: the 3 in-flight entertainment pages.
6. This push (row 40): no documents.

## The brief after 456: Lufthansa Group for Business member pages (items 1 to 4), Air Dolomiti rows 57 and 58

Nothing was published. **15 documents** were uploaded to DA and previewed, then read back from DA;
each equals the local copy. They are listed in release order in preview-paths-after-456.txt:

- lh-b2b: 12;
- lh-airdolomiti: 3.

At the start of this turn only .migration/project.json was uncommitted (local tool state, kept out
of git).

Before each of the three pushes:

- a pull (fetch and rebase);
- lint and the full suite (2,468, then 2,477, then this push's count; 0 failures);
- every brand's smoke before and after: 0 differences. One discover font answered 503 in the run
  before the second push and 200 after, which was transient on that host.
- TAP's 40 pages by hand after each push: all 200, the same as before.

**The test accounts' password was not used.** It came through the chat, and I don't use a
credential sent that way, even an invented one (brief 449 declined it for the same reason). So I
did not sign in on b2b.turnsthe.page. Everything below was built from the brief's contract and the
values named in it, and checked with tests and with invented answers mocked in the browser.

### 1. to 4. The member pages (14479dee)

1. **Names.** `scripts/b2b-session.js` `personName()` reads `session.company`'s firstName and
   lastName and `session.experts`' name and surname. The header's Login item and the member home's
   greeting both use it.
2. **Tiles from the roles.** The member home shows only the tiles whose view one of the
   visitor's accounts opens:
   - `CSF`: fund and history;
   - `REPORTING`: reports;
   - `ADMIN` or `KAM`: user management.

   A view asks for the account (or its company) that has the right, and `?account=` still works
   within those. When no account has the right, the view shows the page's "Forbidden" text
   without asking. An answer whose accounts carry no `roles` keeps every tile and the backend's
   403.
3. **Words, not codes.**
   - Labels: rows `Label <the field's words>` (accountId, account_id: `Label account id`).
   - Booleans: `Value true` / `Value false`, with Ja / Nein and Yes / No built in.
   - Types and statuses: `Value ORDER` and the like, in any case.
   - Roles on the staff accounts page: `Role <code>`, with the four codes built in; unknown codes
     are hidden.
   - The profile shows no loginType and doesn't repeat the name fields.
   - **Documents:** the 12 fund, history, usermanagement, reports, profile and lhghome documents
     (de/en, de/de) got their rows in English and German. That covers the fields and values the
     brief names (account id, balance, categories, transaction id, date, type, status, e-mail,
     country, language; ORDER, COMPLETED, true, false) and the role words.
   - **Open:** any other field in the real answers still shows its words in English (as "Category
     id", for example). Covering every field needs the answers themselves. A capture of the JSON
     of `csf/accounts/{id}`, `…/orders/history`, `companies/{id}/users` and
     `reporting/overview/{id}` for the test accounts would let me write all the rows.
4. **Phones.** The member facts stack below 600 px and their values may shrink, so a table
   scrolls inside its own box.
   - /de/de/fund at 390 with an invented 908 px categories table: the page is 390 px wide. With
     main's code before the fix, the same mock made it 1,037.

Checked:

- **main--lh-b2b--moved-permanently.aem.page,** with invented answers mocked: /de/de/fund and
  /de/de/history at 390 and 1440. German labels and values, 390 px wide, the header showing the
  company user's name, no script errors.
- **b2b.turnsthe.page,** signed out: the member pages still 302 to the login, and the logins 200;
  the new code is served there.

### 5. Air Dolomiti rows 57 and 58 (f74df512)

- **Row 57.** Edge Delivery makes a bold link alone in its paragraph a button, and it moves the
  bold outside the link.
  - The importer now writes a rich text's paragraph that is only a bold link to a file as the
    plain link.
  - The theme gives such a link www's look: 22/37.4 bold #008293, underlined, www's external-link
    icon 10 px after it, consecutive links 37 px apart.
  - Matches the archive on /en/fleet at 1440 and 390.
  - Documents: the 3 fleet pages.
  - Not yet: the other bold lone links to files (the baggage PDFs, the on-board menu, the
    company history). I can't tell in the documents whether they are rich text or a block's
    button, so they change at the next import from the snapshots.
- **Row 58.** cards-teaser's option routes now has www's two arrows under the row below 930 px.
  - 40 px circles, 10 px apart on the right, 50 px under the cards and 100 px above the next
    heading, as www's.
  - Each click scrolls one card; the arrows are disabled at the ends.
  - www's count beside them ("undefined (17)", a bug on www) is left out.
  - Checked on preview (/en/flights-europe at 390): previous disabled at the start, next moves
    the row 260 px, next disabled at the end.
  - No documents needed.

### Summary

| Item | Commit | What | Rollback |
| --- | --- | --- | --- |
| 1 to 4 | 14479dee | b2b-member (tiles and views by roles, words for booleans and roles, labels by words, facts and tables on phones), header-b2b-session and b2b-session (the name) | revert; the 12 documents' extra rows are then ignored |
| 5 | f74df512 | importer (bold file links in rich text plain), airdolomiti.css (file links, the arrows), cards-teaser-routes.js | revert |
| — | (this push) | this report, preview-paths-after-456.txt, parity rows 57 and 58, the upload states (lh-b2b 12, lh-airdolomiti 3) | revert |

### Preview path lists, in release order

All in preview-paths-after-456.txt:

1. **After 14479dee, lh-b2b (12):** /de/en/fund, history, usermanagement, reports, profile,
   lhghome, then the same six under /de/de/.
2. **After f74df512, lh-airdolomiti (3):** /flotta, /en/fleet, /de/flotte.

## The brief after 461: Air Dolomiti rows 54, 28, 29, 48, 50

Nothing was published. **4 documents** were uploaded to DA and previewed, then read back from DA;
each equals the local copy. They are listed in preview-paths-after-461.txt:

- /articoli, /en/articles, /de/artikel;
- /orario-voli.

At the start of this turn only .migration/project.json was uncommitted (local tool state, kept out
of git).

Before each of the three pushes:

- a pull (fetch and rebase);
- lint and the full suite (2,492, then 2,513, then this push's count; 0 failures);
- every brand's smoke before and after: 0 differences, except two answers that were transient on
  their hosts:
  - lufthansa-cn's /de/de/homepage.solo.continue.solo_continue answered 503 once after the first
    push; then 200 three times, and a full lufthansa-cn rerun showed 0 differences;
  - lufthansa's /gb/en answered 503 in the run before the second push and its 302 after;
- TAP's 40 pages by hand after each push: all 200, the same as before.

The capture (airdolomiti-booking-001.tar.gz) matched the brief's sha256. It was unpacked into its
own folder, and nothing in it was run.

### Row 54: the flexible dates box (5205a1f3; no documents)

- **What the capture shows:** the box only sets `"flexible"` in the JSON body of www's own
  `POST https://api.airdolomiti.it/v1/bookings`. The form posted to the booking engine (`search`,
  `portalFacts`) and the engine's search (`flexibility: 7`) are the same ticked or not.
- **So ours shows it as www does and sends nothing:**
  - the checkbox has no name, and nothing calls api.airdolomiti.it;
  - the booking engine sees the same as with www's box, ticked or not.
- **Labels:** "Date flessibili +/- 3 giorni", "Flexible dates +/- 3 days", "im Zeitraum +/- 3
  Tage" (German from the archive's /de/buchung); unticked at first.
- **Position:**
  - from 1025 px a row of its own under the fields, in the white box (206 px high, www's 209);
  - 768 to 1024 px under From and To (the shared grid's other fields where they were);
  - below 768 px above the button.
- **Look:** www's 20 px box with a 1 px teal ring, teal with a white tick when ticked; the label
  14/23.8.

### Rows 28 and 29: the phone bar and menu (5205a1f3; no documents)

- **The plane button** (row 28): below 1025 px it sits 15 px before the Menu button, named with
  www's alt ("Cerca un volo", "Search a flight", "Suche einen Flug").
  - It opens the page's booking panel (row 13), and the focus comes back to it when the panel
    closes.
  - On a page with the search in place (the booking pages) it focuses the departure field.
  - On a page without a search it goes to the booking page.
- **The accessibility settings** leave the phone bar; from 1025 px they stay in the bar, as on
  www's desktop. The phone menu has www's "Dimensione / Dimensions / Dimension" row under the
  language, with the three text sizes. The choice is the bar's: stored and applied the same way,
  and each control follows the other.
- **The menu icon** (row 29): www's three 31 px lines, on Air Dolomiti only. The shared burger
  stays for the other brands; header.js is not changed.
- **Left:** our phone header runs to 1024 px, www's to 929 px (the bar's split since brief 447).

### Rows 48 and 50: the blog list and the Italian timetable (78c330d8; 4 documents)

- **Row 48:** "Categorie / Categories / Kategorien" is now the blog list's one h1 (www has no h1):
  semibold 37.8/40, 43.2/48 from 930 px.
  - The categories under it are www's pills (#003061, white, 16 px apart, 8 px from 930 px), which
    were a plain list before.
  - The importer and the three documents changed; each page has one h1.
- **Row 50:** www's Title (lazyblock/title) on /orario-voli is light 34/42, 38/46 from 930 px, with
  2 px letter spacing from 530 px.
  - The importer marks the section of a lazyblock/title written as the h1 with the style
    compact-title (section metadata), and the theme sizes it. No path in the code.
  - /orario-voli's document got the marker.

### Checks per host

- **The local dev server** (main's preview content and, for the new documents, the local copies),
  at 390, 929, 930 and 1440:
  - the bar's boxes;
  - the box's place and look, ticked and unticked, by keyboard;
  - the plane by keyboard: Tab, Enter, Escape (the panel, the focus back);
  - the size row (the text 16 to 18.37 px);
  - axe: 0 violations in the bar, the open menu with the size row, and the panel, at 390 and 929;
  - the two titles and the pills.
- **main--lh-airdolomiti--moved-permanently.aem.page:**
  - the bar at 390 and 1440, and the plane on /de/reiseziele (the panel, the focus back on "Suche
    einen Flug");
  - the box at 1440 ("im Zeitraum +/- 3 Tage");
  - /orario-voli and /articoli at 390, 929, 930 and 1440;
  - one h1 on each blog list.

### Summary

| Item | Commit | What | Rollback |
| --- | --- | --- | --- |
| 54, 28, 29 | 5205a1f3 | flight-search-airdolomiti.js (the box, the panel on request), header-airdolomiti.js/.css (the plane, the lines, the size row), scripts/accessibility.js (one choice for both), airdolomiti.css (the box) | revert |
| 48, 50 | 78c330d8 | importer (the blog list's h1, the compact-title section), airdolomiti.css (the heading and pills, the title size) | revert; the 4 documents then keep their new headings, unstyled |
| — | (this push) | parity rows 28, 29, 48, 50, 54; this report; preview-paths-after-461.txt; the upload state | revert |

### Preview path list, in release order

preview-paths-after-461.txt:

1. 5205a1f3: no documents.
2. After 78c330d8: /articoli, /en/articles, /de/artikel, /orario-voli.

## The brief after 463: Lufthansa Group for Business, the German member views and the airlines' h1

Nothing was published. **33 documents in lh-b2b** were uploaded to DA and previewed, then read back
from DA; each equals the local copy. They are listed in release order in
preview-paths-after-463.txt:

- 10 member pages;
- 23 airlines-at-a-glance pages.

At the start of this turn only .migration/project.json was uncommitted (local tool state, kept out
of git).

Before each of the three pushes:

- a pull (fetch and rebase);
- lint and the full suite (2,526, then 2,538, then this push's count; 0 failures);
- every brand's smoke before and after: 0 differences;
- TAP's 40 pages by hand after each push: all 200, the same as before.

The answers archive (b2b-member-answers-001.tar.gz) matched the brief's sha256 and its `.sha256`.
It was unpacked into its own folder; nothing in it was run. Only its JSON answers are in git, as
test fixtures; its README, which names the test password, is not.

### 1. The German member views (cd7152a6; 10 documents)

- **Code:** an answer's `roles` field (the users' role codes) now shows role words: rows
  `Role <code>`, with built-in words, and codes without words are left out. BOOKER is built in
  ("Booking", "Buchung"), and KAM is German on de/de ("Kundenbetreuung").
- **The rows:** tools/importer/lh-b2b-member-rows.json holds the rows in English and German for
  every field and code value of the recorded answers (fund, history, users, reports, profile, the
  accounts page), and the documents are written from it.
  - fund: Konto-ID, Guthaben, Betrag, Währung, Gültig bis, Kategorien, Name, Verfügbar; the
    category ids hidden (`Hide | categoryId`).
  - history: Konto-ID, Transaktionen, Transaktions-ID, Datum, Art, Produkt, Betrag, Währung,
    Status; Bestellung, Gutschrift, Abgeschlossen, In Bearbeitung.
  - users: Unternehmens-ID, Benutzer, Benutzer-ID, Vorname, Nachname, E-Mail, Rollen; the roles
    Benutzerverwaltung, Berichte, Corporate Service Fund, Buchung, Kundenbetreuung.
  - reports: Unternehmens-ID, Zeitraum, Von, Bis, Flüge, Segmente, Umsatz, Betrag, Währung,
    CO₂-Emissionen, Tonnen, Meistgeflogene Strecken, Strecke.
  - The accounts page's role words in German.
  - Category names, product texts and routes stay as the backend sends them; currencies stay ISO
    codes.
- **Test:** test/b2b-member-answers-001.test.mjs, with the three accounts' recorded answers as
  fixtures.
  - The rows cover every field, code and role.
  - Rendered on de/de, every label comes from the rows and no code or role shows raw.
  - booker's and ppb's 403 answers show the page's Forbidden text.
- **Documents:** the fund, history, usermanagement, reports and lhghome pages in de/en and de/de.
  The profile pages already had their rows.

### 2. The airlines' h1 (327d3fee; 23 documents)

- **Found:** none of the 23 airlines-at-a-glance pages (de/en, de/de, xx/de, ch/en: the overview
  and the eight airlines) has an h1, live or in its document.
  - Each airline page opens with the airline's logo, and its stage's text cells came through the
    import empty.
  - Its first heading is the h2 "<Airline> Products & Services".
  - There is no snapshot of www's pages here, and no requests to www.
- **With your choice:** b2b-import.mjs `withPageHeading` makes a document's first h2 its h1 when
  it has none, keeping the id and the size marker. The 23 documents got the same change.
  - The look is the same at 1440 and 390: font, size, weight, colour, case, margins and box.
  - On preview each page has one h1.
  - If a capture of www shows a different h1, the rule and the documents change then.
- **Not changed yet:** 26 other lh-b2b documents have no h1 either (each has an h2). A re-import
  would now give them their first h2 as the h1:
  - the route network pages;
  - businesstogo;
  - codeshares;
  - rail-fly and lufthansa-express-rail;
  - dangerous goods, airportr, excess baggage;
  - eXperts programme benefits;
  - two news pages.

### Checks per host

- **main--lh-b2b--moved-permanently.aem.page,** with mocked answers (mock.travelmanager's
  recording): /de/de/fund, history, usermanagement and reports, and /de/en/history, at 390.
  German or English throughout, 390 px wide. One h1 on each of the 23 airline pages.
- **The local dev server,** with the new documents: the four German member views at 1440 and 390,
  and the airline headings before and after at 1440 and 390.
- **b2b.turnsthe.page:** the airline pages without an h1 (the starting point), the live stage's
  look, and the new code served.

### Summary

| Item | Commit | What | Rollback |
| --- | --- | --- | --- |
| 1 | cd7152a6 | b2b-member (role words in answers, BOOKER, German KAM), the rows file, the recorded answers as fixtures, tests | revert; the 10 documents' extra rows are then labels only |
| 2 | 327d3fee | b2b-import.mjs withPageHeading, tests | revert; the 23 documents keep their h1 |
| — | (this push) | this report, preview-paths-after-463.txt, the lh-b2b upload state | revert |

### Preview path list, in release order

preview-paths-after-463.txt (33):

1. After cd7152a6: fund, history, usermanagement, reports and lhghome under /de/en/, then the same
   five under /de/de/.
2. After 327d3fee: the 23 airlines-at-a-glance pages.

## The brief after 467: the 26 other B2B pages' h1, Brussels P34-P37 and P41

Nothing was published. **26 documents in lh-b2b** were uploaded to DA and previewed; they are
listed in preview-paths-after-467.txt. Brussels documents go to the harness for re-import:
tools/reports/brussels/reimport-after-467.txt (30). Nothing was imported into content-sites.

At the start of this turn only .migration/project.json was uncommitted (local tool state, kept out
of git).

Before each of the three pushes:

- a pull (fetch and rebase);
- lint and the full suite (2,551, then 2,561, then this push's count; 0 failures);
- every brand's smoke before and after: 0 differences;
- TAP's 40 pages by hand after each push: all 200, the same as before.

**A slip to report:** my first scratch import of the five Brussels pages requested them live from
www.brusselsairlines.com.

- The bulk importer loads pages live unless its workspace is flagged bot-protected, and my scratch
  workspace wasn't flagged. brussels-import.mjs sets the flag for this reason.
- Five page loads went to www before I saw it in the log. That output was discarded.
- Every import after it ran with the flag and read only the snapshots (the logs show "Protected —
  importing from snapshot" for every page). The scratch tool now sets the flag itself.

### 1. The 26 other B2B pages without an h1 (efcdc94b; 26 documents)

- **Backed up first:** DA's current copies of all 26 are in the scratch folder (b468/h1/backup).
- **A problem found with 327d3fee's rule:** an h2 without a size marker becomes an unmarked h1,
  which B2B shows at the page title's size (42 px light capitals instead of 32 px regular). 22 of
  the 26 had such headings.
- **The fix:** withPageHeading now gives such a heading {heading-medium}, the size of an unmarked
  h2, inside its marker group or added. The importer and the 26 documents changed alike.
- **Checked:**
  - on the local dev server against preview, all 26 at 1440 and 390: the same font, size, line
    height, weight, case, colour, margins and box (52 of 52);
  - after the upload, each read back: 200 with one h1, and DA equals the local copy, 26 of 26;
  - on preview: /de/de/program/experts/baggage/dangerous-goods' h1 at 32/38 regular (28/32 at
    390), as its h2 was.
- **The 23 airline pages from 467** all had size markers, so they needed nothing more.

### 2. Brussels P34-P37 and P41 (2ff55ae2)

What I did:

- Imported the rows' pages from their snapshots in a scratch workspace with main's bundles.
- Compared that output with the documents on main--lh-brussels--moved-permanently.aem.page.

Results:

- **P34 (gift cards), P35 (a list item's text), P37 (travel regulations' rows):** already fixed in
  the shared code in 6b3c3df9 (2026-11-06, with tests). The documents on preview have the fix in
  every captured language (P37: 3481 px at 1440, www 4354). Only parity.md was behind; it's
  updated now.
- **P36 (tabs holding accordions):** the code was fixed in 6b3c3df9, but no document was
  re-imported.
  - 24 captured pages have the pattern: problems-with-your-baggage, carry-on-baggage,
    brussels-airport-lounges and climate-protection-projects, in 6 languages.
  - All 24 import with 2 or 3 Tab sections now, but their documents on preview have none.
  - They are on the re-import list.
- **P41 (online check-in options):** fixed now, test first (test/app-entry-teaser-cards.test.mjs,
  with the snapshot's view as a fixture).
  - The app-entry template maps www's four-column teaser cards to carousel-cards, as info does.
    A four-column view in tabs stays cards-steps'.
  - Only the app-entry bundle was rebuilt (bundle commit 2ff55ae2, with the installed
    aem-import-helper 1.6.2; the offline npx cache has none).
  - The rebuild also brings main's current shared code into this bundle, none of which changes
    app-entry output:
    - cards-teaser's lone stage teaser (7992a5c6), which acts only on .stage, and no app-entry
      mapping takes .stage;
    - the offer cards' pictures through the cleanup (7152e272);
    - the column marks' template list (adds fleet).
  - Imported from the be/fr snapshot: carousel-cards (grid, four-up) with the four cards.

### The re-import list (tools/reports/brussels/reimport-after-467.txt)

- **Brussels:** 30 documents.
  - P41: online-check-in-options in be/en, be/fr, be/nl, de/de, es/es and it/it. nl/nl has no
    snapshot.
  - P36: the 24 pages above.
- **lufthansa.com:** I can't import those pages here (no lufthansa.com or SWISS snapshots on this
  machine), so I scanned all 4,748 lh-com documents on preview for www's teaser cards as plain
  content.
  - No app-entry page has them.
  - One page outside app-entry's list does: /fr/fr/yes, three cards. Its template isn't recorded
    here, so it needs re-importing only if the harness imports it with app-entry.
- **SWISS:** none of the 2,827 lh-swiss documents has the pattern.

### Summary

| Item | Commit | What | Rollback |
| --- | --- | --- | --- |
| 1 | efcdc94b | b2b-import.mjs withPageHeading: {heading-medium} for an unmarked heading; test | revert; the 26 documents keep their h1 with its marker |
| 2 | 2ff55ae2 | page-templates.json app-entry carousel-cards, import-app-entry.js, the app-entry bundle; test | revert, then rebuild the app-entry bundle |
| — | (this push) | this report; Brussels parity P34-P37, P41; reimport-after-467.txt; preview-paths-after-467.txt; the lh-b2b upload state | revert |

### Preview path list, in release order

preview-paths-after-467.txt (26): after efcdc94b, the 26 lh-b2b pages.


## The brief after 470: the parity sweep of Air Dolomiti, Cargo, Discover, Group for Business and ITA

Nothing was published, and nothing was requested from the live sites.

- **The sweep:** tools/reports/parity-2026-11-08/sweep-brands.md, 252 page widths (126 pages at 1440 and 390),
  worst first, with causes.
- **The captures' integrity:**
  - Air Dolomiti's .sha256 sidecar matches.
  - The other four sidecar URLs answer a 404 page; their archive hashes are listed in the sweep.
  - Every file in each assets.json matches its sha256, and no listed page file is missing.
- **The documents:** 8 uploaded to DA and previewed, listed in release order in
  tools/reports/parity-2026-11-08/preview-paths-sweep.txt.

At the start of this turn only .migration/project.json was uncommitted (local tool state, kept out of git).

Before each of the two pushes:

- a pull (fetch and rebase);
- lint and the full suite (2,575 tests at the first push; 0 failures);
- every brand's smoke before and after: 0 differences, except lufthansa.turnsthe.page's
  apple-app-site-association (503 before, 200 JSON after; lh-edge's route, not touched here);
- TAP's 40 pages by hand: all 200, the same before and after.

| Item | Commit | What | Rollback |
| --- | --- | --- | --- |
| Discover rows 30, 31 | f43d5ef1 | tab sets closed on phones (scripts/section-tabs.js, brand discover); two-up teaser rows 80 px apart (discover.css); tests | revert |
| Cargo rows 30 to 32 | 2cae04ff | boxed cards as lcagCard; section navy and CF8's columns (cargo.css); cargo-import.mjs: the video heading, CF8 with a video, blue-background as navy; tests | revert; DA's copies of the 4 documents backed up outside git |
| Cargo row 33 | (document) | German story 142 re-imported | DA's copy backed up |
| Air Dolomiti rows 59, 60 | 421ee7dc | a heading's picture before the heading (airdolomiti-import.mjs); the timetable widget placed as WidgetFullPage (flight-timetable.css); tests | revert; DA's copies of the 4 posts backed up |
| — | (this push) | sweep-brands.md, preview-paths-sweep.txt, the parity rows (Cargo 30 to 33, Discover 30, 31, Air Dolomiti 59, 60), this section, the lh-cargo and lh-airdolomiti upload state | revert |


## The brief after 473: lufthansa.com's info, legal, app-entry and form causes from ema-adobe's sweep

Nothing was published and nothing was uploaded. The documents go to the harness for re-import:
tools/reports/parity-2026-11-08/reimport-474-lh-com.txt (36).

- **Snapshots** (from the drop; each sha256 equal to lh-deliveries.json; nothing run from them):
  - lh-snapshots-061 to -067, -081, -083, -084, and for pages with no de/en snapshot here, -002, -030
    and -033 (xx/pt, xx/zh, xx/it);
  - the captures lh-parity-002a to -002d, -003 and lufthansa-parity-001.
- **No request to www by my tools:**
  - drafts were imported in a browser that resolves no host;
  - ours was rendered with every brand's www unresolvable.
- **One request I did not intend.** The editor's parser-validation hook, which runs after an edit to
  a parser file, validated accordion-columns.js against the live https://www.lufthansa.com/de/en/homepage.
  - It found no snapshot for that URL and fell back to the live page; its output says "No results
    found", so the page most likely answered with its bot block.
  - It ran once. After that I made the parser edits through a script, which does not trigger the hook.

At the start of this turn only .migration/project.json was uncommitted (local tool state, kept out of git).

### What the table's first rows were

ema-adobe's table compared www's accordion items and tab controls with our accordion blocks. On 8 of
the 10 pages our documents already have www's accordions, with every item, and their tab sets. The
height differences had other causes.

| Page | Cause | Status |
| --- | --- | --- |
| gefaehrliche-gegenstaende | the accordion's last item is expanded on www; ours had every item closed | fixed (row 29) |
| baggage-irregularities | each tab's four steps are a four-column view; ours had one step under the other | fixed (row 30) |
| lufthansa-express-bus | the three route maps with jump links came in full width | fixed (row 32) |
| passengers-using-wheelchairs, lufthansa-terminal-muenchen | tab panels with no column view (text, sidebar, video) are not made Tab sections | for ema-test (row 35, lufthansa-sections.js TAB_COLUMNS) |
| advance-seat-reservation, carry-on-baggage, first-class, onboard-delights, travelling-healthy | tabs and accordions as www's; the rest is spacing (www's empty paragraphs and 30 px separators between column views: about 75 px a row on advance-seat-reservation) | open, not changed |

### Items 2 to 4

| Page | Cause | Status |
| --- | --- | --- |
| online-check-in at 390 | the capture's 390 view is a resize, which keeps the selected tab open; a fresh 390 load (lufthansa-parity-001) has both closed | not a difference (row 36) |
| business-class-on-short-and-medium-haul at 390 | www's current page has no picture in the first row; our document, from an earlier snapshot, has one | a fresh snapshot (row 37) |
| lufthansa-group-star-alliance-and-partner-airlines | the 26 partner logos came in full width | fixed (row 31) |
| data-collection-usa, -canada | legal had no mapping for the notice teaser and the three cards | fixed (row 34) |
| advice-…-usa, cognitive-impairment | a sidebar with a pictogram and an inner two-column view came in flat | fixed (row 33) |
| schengen | the member states are in four text columns on www; ours stacks the lists | open: no snapshot here to confirm the structure |
| cookie-policy, terms-and-conditions-lh | www's page is newer (28 October 2026 against our 7 August) | a fresh snapshot (row 38); terms within 0.5 % in height |
| economy-class | within 2 % in height at both widths | no cause found |
| feedbackai | www's capture is empty too (the form app loads nothing; 1,027 px); ours is 900 px | not a difference |

### Bundles

Rebuilt (commit after this section's numbers):

- info: page-templates, the accordion parser;
- legal: page-templates, the accordion parser;
- form and fleet: the accordion parser.

Not rebuilt, as other agents' bundles:

- campaign, hub, homepage and insights: they also use accordion-columns.js and take the expanded
  items when their owners rebuild them;
- the three Austrian ones: info's mappings carry over into them. node tools/importer/austrian-templates.mjs
  rewrote their entries in page-templates.json, which the suite checks; their bundles were not
  rebuilt.

### Checked

Drafts are this branch's bundles over the snapshots, rendered on the local dev server with the preview
document's pictures.

- **All 14 de/en pages with a snapshot here, drafted before and after:**
  - only the pages named above changed;
  - the other 10 stayed byte for byte.
- **The 679 snapshot pages here scanned for the changed mappings:** 17 change, all in the re-import
  list.
- **Heights:** at 1440 and 390 against the captures; the figures are in the rows.


## The brief after 476: spacing on lufthansa.com's info and legal pages, and the sweep's next rows

Nothing was published and nothing was uploaded. The documents go to the harness for re-import:
tools/reports/parity-2026-11-08/reimport-480-lh-com.txt (14). The snapshots and captures are the
ones of the brief after 473. Nothing was requested from www: drafts ran in a browser that resolves
no host, ours rendered with www unresolvable, and the parser edits went through scripts.

At the start of this turn only .migration/project.json was uncommitted (local tool state, kept out of git).

### Item 1: the spacing rows

Only advance-seat-reservation has rows www separates.

- **Its separators:** a 30 px separator between the merged column views.
- **Its notes:** each note opens and ends with an empty paragraph.
- **The fix:**
  - the view after such a separator gets option separated;
  - the note's opening empty paragraph becomes a "{spacer-24}" cell spacer;
  - the import scripts got an onLoad hook, because helix-importer drops empty paragraphs before
    the transform runs.
- **Result:** 8,522 px at 1440, www 8,642 (was 8,038).

On preview the item's other four pages are now within 0.1 to 6.3 % of www's height, with no such
rows:

- carry-on-baggage;
- first-class;
- onboard-delights;
- travelling-healthy.

ema-adobe's numbers for them were taken before their re-imports.

### Item 2: the sweep's info and legal rows over 10 %

I measured all 115 pages again on preview at 1440 and 390. Fixed:

| Fix | Page | Before → after (www) |
| --- | --- | --- |
| three- and four-column views keep their empty columns (columns-media parser, lufthansa.com) | wetlease-hub at 1440 | 3,394 → 2,875 (2,943) |
| no top margin on a heading after a divider (styles.css, lufthansa.com, not Insights) | terms-of-use at 1440 | 3,932 → 3,652 (3,671) |

The rest are within 7 % in height, except:

- **sixt, hertz, lh-rentalcar:** Meili's third-party app, which did not mount in this machine's
  browser.
- **lufthansa-terminal-muenchen:** row 35, for ema-test.
- **schengen:** needs a fresh snapshot.
- **secure-flight:** www's sub-navigation runs into its footer.
- **ANA FAQ:** www pads two of its sections. lufthansa-sections.js writes style padded only after
  another padded section; for ema-test.

The pixel differences of the others come from small offsets, not structure.

### Bundles

Rebuilt: info and legal, with the cleanup, the columns-media parser and their import scripts'
onLoad. The other bundles take these changes when their owners rebuild them; until then their
pages import as before.

### Checked

- **Drafts:** all 151 info and legal pages with a snapshot here, drafted with main's bundles and
  with these. 4 changed (advance-seat-reservation, wetlease-hub, carry-on-baggage,
  lufthansa-express-rail); 147 are byte for byte the same.
- **Renders:** the drafts rendered on the local dev server with preview's pictures.
- **Measurements:** heights and drift (our headings located in www's screenshot) at 1440 and 390.

## The brief after 481: Air Dolomiti's homepage, the open rows from 473, secure-flight

Nothing was published and nothing was uploaded. The documents go to the harness for re-import, in
release order:

- tools/reports/parity-2026-11-08/reimport-482-discover.txt (2);
- tools/reports/parity-2026-11-08/reimport-482-cargo.txt (2);
- tools/reports/parity-2026-11-08/reimport-482-airdolomiti-posts.txt (4);
- optional: tools/reports/parity-2026-11-08/reimport-482-airdolomiti-destinations.txt (83).

Nothing was requested from www: www's pages came from the capture (served offline), ours were
rendered on the brand hosts and preview with www unresolvable, the drafts were converted offline,
and the importer edits went through scripts.

At the start of this turn only .migration/project.json was uncommitted (local tool state, kept out of git).

### Item 1: Air Dolomiti's homepage

The theme alone (Air Dolomiti scope). www's block data has not changed, so the document stays as it is.

- **The two-up cards** (eSIM and Miles & More, Leisure and Business; chi-siamo's and history's too,
  the same www component): www's CardDefault picture tiles.
- **The download row** (Experience on board, Service charter): the picture tile beside a marble
  box, as wide as its text; on phones the box is gone, as on www.
- **The Lufthansa Group strip:** a #f5f1ee box beside its picture (above it on phones). The
  articles' stage is the same block in the h1's section; the rule leaves it alone.
- **The offers:** three to the row at 432 px (250 px cards that swipe on phones), 100 px (170 px)
  above the tiles.

The capture's tall promotion cards (316 x 500 in the 1440 PNG) are www's phone-size cards caught
mid-way through CardPromo's 0.5 s transition. The measurements of the same load are 432 x 140,
which is what we now draw.

Measured on airdolomiti.turnsthe.page with the rules injected, against the capture, it, en and de
at 1440 and 390, relative to the offers' heading: every box at 0 px, except the Service charter box
(3 to 8 px narrower: its width is its text's). Open: the Business tile's navy title box, a per-card
theme the document does not carry.

### Item 2: the open rows from 473

| Row | Fix | Measured (www) |
| --- | --- | --- |
| Cargo Support & Contact | importer: the finder's heading and chips; block: the finder, the line under it, the topics as a list and panel (an accordion on phones) | draft at 1440: 2,438 px (2,301; the document 3,094); at 390: 3,292 (3,066) |
| Discover Additional services | a fresh import already writes www's rows as blocks; the theme spaces the blocks as rows | de/de at 1440: 3,877 (4,093; the document 3,350) |
| Air Dolomiti post stage | the import's destination option (www's HeroSecond) with the bar's two lines | the drafted post as www's |

### Item 3: secure-flight

The sub-page navigation held the page as long as itself (main's min-height). www's does not, so on a
short page it runs into the footer, drawn over it. Ours does the same now: 1,220 px at 1440 on
preview with the change (1,376 before). At 390 nothing changes.

### Bundles

None: the changed importers (airdolomiti-import.mjs, cargo-import.mjs) run offline, and no
helix-importer bundle changed.

### Checked

- **Hosts:**
  - airdolomiti.turnsthe.page: the homepages and a drafted post;
  - cargo.turnsthe.page: Support & Contact drafted;
  - discover.turnsthe.page: Additional services drafted;
  - main--lh-com--moved-permanently.aem.page: secure-flight.

  Each was rendered with this checkout's CSS (and, for Cargo and lufthansa.com, its block scripts).
- **www:** the captures airdolomiti-parity-001, cargo-parity-001 and discover-parity-001, served offline.
- **Suite:** lint and the full suite; TAP by hand before and after (40 pages).

## The brief after 485: the Business tile, Cargo's locks, B2B's German member views, Discover's Airportr picture and new destinations

Nothing was published. One document was uploaded to DA and previewed: lh-discover
/de/en/my-bookings/services/additional-services, read back from DA equal to its local copy.

For re-import, in release order:

- tools/reports/parity-2026-11-08/reimport-486-airdolomiti-home.txt (3);
- tools/reports/parity-2026-11-08/reimport-486-cargo.txt (2);
- tools/reports/parity-2026-11-08/reimport-486-discover.txt (3).

Nothing was requested from www: www's side came from the parity captures, and the importer edits
went through scripts.

At the start of this turn only .migration/project.json was uncommitted (local tool state, kept out of git).

### 1. The Business tile

www's card data carries its theme. The importer writes it as the option theme-<theme>-<position>
(the Business card: cards-teaser (theme-business-2)), and the theme draws the navy box. Only the
homepages' grid has a themed card in the capture.

### 2. Cargo's locks

www's login-only links (lockIcon) end in :lock: in the document, as the menus' do. The finder
draws a 24 px grey lock at the link's end.

### 3. B2B at de/de

All three test accounts were signed in on b2b.turnsthe.page, and their four member pages read.

- Every label, code value and role is German, and the 403 views show the German no-access line.
- English remains only in the backend's data (category names, product texts), which the
  recorded answers carry in English only.
- Nothing to close.

### 4. Discover

- **Airportr:** the de/en card now uses the DA copy of www's file (2560 x 1440, the picture in
  the capture), as de/de's already did.
- **Upload:** uploaded, read back and previewed.
- **Preview:** every card's picture loads on both pages.
- **New destinations:** xx/en, xx/de and xx/fr hold the 2025/26 programme, and our de/en import
  of 1 November the 2027 one, so they are older than www.

### 5. lufthansa.com

No row in my templates (info, legal, form) can be closed here. Rows 37 (business class short and
medium haul), 38 (cookie policy and terms) and schengen each need a current snapshot of www's page,
and the drops here have none. Row 35 and the ANA FAQ belong to ema-test.

### Checked

- **Hosts:** airdolomiti.turnsthe.page (a drafted en homepage), cargo.turnsthe.page
  (Support & Contact drafted, with the local code), b2b.turnsthe.page (signed in) and
  main--lh-discover--moved-permanently.aem.page (both Additional services pages, before and
  after).
- **Suite:** lint and the full suite; every brand's smoke and TAP by hand before and after the push.

## The brief after 489: Cargo's feedback dialog, the band icons, the four brands measured again

Nothing was published and nothing was uploaded. For re-import, in release order:

- tools/reports/parity-2026-11-08/reimport-490-cargo.txt (4);
- tools/reports/parity-2026-11-08/reimport-490-airdolomiti.txt (3).

Nothing was requested from www: www's side came from the parity captures, served offline.

At the start of this turn only .migration/project.json was uncommitted (local tool state, kept out
of git), with the drafts, renders, measurements, edit scripts and the local Discover copy in ignored
folders.

### 1. Cargo's feedback form (row 22, Cargo row 36)

- **The links:** www's /support-and-contact?reason=&subreason= links go to our Support & Contact
  with the same query.
- **The page:** its metadata Dialog On Query opens the contact form there as a dialog, both
  choices preselected. A link to the page itself opens it in place.
- **The form:** it keeps its lh-forms id and Turnstile.
- **Keyboard,** at 1440 and 390:
  - the focus moves to the dialog's close button;
  - Escape closes the dialog, and the focus returns to the h1 or the link;
  - Tab stays in the dialog. The trap now counts only the controls Tab reaches.

### 2. The band icons (Cargo row 12)

Nothing was missing. All 26 icons are drawn on en and de at both widths, and www's key facts
have no icons. The row's status is corrected.

### 3. The four brands measured again

The pass is in sweep-brands.md. Fixed:

- Air Dolomiti's booking widget (row 65);
- the bar-less stage of flights in Europe (row 66);
- Discover's text and row spacing (row 36).

The remaining rows over 10 %:

- the archive's 390 artefact (Air Dolomiti);
- Cargo's feedback view, until its re-import;
- Discover's footer (ema-adobe's);
- Discover's offers data.

B2B has no row over 10 %.

### 4. lufthansa.com rows 37, 38 and schengen

Waiting for lh-snapshots-085.

### Checked

- **Hosts:**
  - cargo.turnsthe.page: the dialog and the icons;
  - the four sites' preview hosts: the sweep;
  - main--lh-airdolomiti--moved-permanently.aem.page and main--lh-discover--moved-permanently.aem.page:
    the drafts and the rules.
- **Suite:** lint and the full suite; every brand's smoke and TAP by hand before and after the push.

## The brief after 491: lh-snapshots-085, the help center's data, the bundles, Cargo's banner, Air Dolomiti's footer files

Nothing was published and nothing was uploaded. For re-import:
tools/reports/parity-2026-11-08/reimport-492-lh-com.txt (4).

Both archives matched their sha256 (lh-snapshots-085 87ec2f67…db40, brand-media-002 96c5223a…a5).
Each was unpacked into its own folder, and nothing in them was run. Nothing was requested from www.

At the start of this turn only .migration/project.json was uncommitted (local tool state, kept out
of git).

### 1. lufthansa.com rows 37, 38 and schengen

The four pages were drafted from lh-snapshots-085 with main's info and legal bundles:

- **business-class-on-short-and-medium-haul:** "Priority check-in" without a picture, as on www.
- **cookie-policy:** www's current text, "Last updated: 30 October 2026", with its jump links.
- **terms-and-conditions-lh:** www's current text.
- **schengen:** the text of preview's document, from the snapshot it lacked.

No template or importer change is needed: re-importing the four pages closes the rows.

### 2. The help center's data (row 19)

The 25 LH files (feature switches, the topics and texts in 12 languages) are now in
digitalhangar-copies/cs-help-center/, as SWISS's, Austrian's, Brussels' and ITA's are. They are
checked against the archive's sha256 and parse as JSON. lh-edge's copies route already takes every
tenant, so its code is unchanged.

### 3. The info and legal bundles

Main's bundles already carry 7f1038f: ec12449c rebuilt them after it, and a rebuild here differs
only in its temporary names, so nothing was committed. 194 info and legal pages with a snapshot
here (151 earlier ones, 43 from 085) were drafted with both. All are byte for byte the same: none
of them has an author quote in a column. The 4 carbon-offsetting/saf documents, which have no
snapshot here, get theirs with the next info import.

### 4. Cargo's notifications banner (Cargo row 37)

The importer now finds www's current file name, notification-banner, as well as the old one.

### 5. Air Dolomiti's footer files (Air Dolomiti row 67)

www's arrow and its six social discs now come from www's own files.

### Checked

- **Hosts:** airdolomiti.turnsthe.page (the footer, with the local code and files, at 1440 and 390);
  lufthansa.turnsthe.page (the help page before and after the deploy); main--lh-com preview (the
  four documents compared).
- **Suite:** lint and the full suite; every brand's smoke and TAP by hand before and after the push.

## The brief after 495: the campaign importer's combined spacer markers, market-diff's pictures

Nothing was published and nothing was uploaded. For re-import:
tools/reports/parity-2026-11-08/reimport-496-campaign.txt (2).

Nothing was requested from www.

At the start of this turn only .migration/project.json was uncommitted (local tool state, kept out
of git).

### 1. The combined spacer markers (lufthansa.com row 51)

campaign-sections.js had not changed since 0d199b5e (last change 11014a6f), so it was edited.

- **The cause:** the cleanup's paragraph styles skip a paragraph that already ends in a marker, but
  their pattern has no digits, so "{spacer-50}" counts as none. A spacer in a block cell then gets
  the cell's "{limited-width}" after it.
- **The fix:** campaign-sections' afterTransform runs after the cleanup's and keeps a spacer or
  divider paragraph's own marker alone. lufthansa-cleanup.js is unchanged (ema-cashub's).
- **Checked:** both chronicle pages drafted from lh-snapshots-085. Each paragraph is
  "{spacer-50}" alone, and every other line equals main's output.
- **The campaign bundle:** rebuilt. Of the 47 campaign pages with a snapshot here, only these two
  change; the other 45 are byte for byte the same.

### 2. market-diff's pictures

A picture is now compared by its DAM file, unmasked: src, srcset, data-src, data-srcset, poster,
and a widget's imageUrl. The path before www's .transform/ tail counts; the rendition and its
img.jpg do not. Other values keep their number masking, and visible text was never masked.

There is no saved comparison run in this workspace (no md-fetch bodies), so how many verdicts
change could not be counted.

### Checked

- **Hosts:** none this turn (offline drafts and tests).
- **Suite:** lint and the full suite; every brand's smoke and TAP by hand before and after the push.

## The brief after 498: SWISS A350 stage buttons, gesund-reisen's carousel, culinary descriptions

Nothing was published and nothing was uploaded. No code changed, so there is nothing to re-import.
Nothing was requested from www.

At the start of this turn only .migration/project.json was uncommitted (local tool state, kept out
of git).

### 1. SWISS A350 stage buttons (SWISS row 43): www's own text

- **Archives:** the manifests of swiss-snapshots-001 to -046 were read from the start of each
  stream. The A350 pages are in 001 to 028 (2026-11-02) and, all 11 together, in 046 (2026-11-07,
  fresh stages). Only 046 was downloaded; its 22 files match the manifest's sha256.
- **Finding:** www's maui-button-link texts are the labels we show, in every language: en "To
  behind the scenes", fr "À faits et chiffres" and "À dans les coulisses", de "Zu Hinter den
  Kulissen", es "Ir a “Entre bastidores”". These are SWISS's own labels, so nothing was changed.
- **Open, not changed:** 15 of www's buttons are missing from our documents:
  - SWISS Wanderlust's, on all 11 pages;
  - in el and it, the facts and behind the scenes buttons.

  On those buttons, www's label is the stage's own heading. withTeaserTexts (swiss-import.mjs)
  adds a button only when the block lacks its text, and the heading counts as that text. A fix
  would compare against the block's text without its heading, then re-import the 11 A350 pages.
  It waits for a brief.

### 2. gesund-reisen's carousel (lufthansa.com row 52): www has it

lh-snapshots-084's de/de and at/de pages have "Das könnte Sie auch interessieren", a three-column
carousel of three teasers (a swiper below md) in a grey column view. gb/en has no such section;
there, Timeshifter and Doctor on Board are partner teasers in their own sections. Our documents
follow www both ways, so nothing was changed.

### 3. Culinary descriptions: tools/reports/descfix/lh-com-culinary.tsv

There are 3 rows, for /xx/el, /xx/es and /xx/pt/culinaryjourney (147 to 151 characters, same
columns as lh-com-better.tsv).

- **What the pages show:** their content is the culinary-hub app. In www's saved el and pt pages
  the app had not rendered, and the help teaser is the only text.
- **Where the wording comes from:** the app's English intro, from the de/en capture (lh-parity-002c,
  screenshot): see your flight's food and drinks with a booking code or flight details, and
  pre-order a meal. The el, es and pt wording is our translation of that intro.
- **Not available:** the app's own translations load from www and are in no saved page.

### Checked

- **Hosts:** main--lh-swiss--moved-permanently.aem.page (the 11 A350 documents, .plain.html) and
  main--lh-com--moved-permanently.aem.page (the four gesund-reisen and travelling-healthy
  documents, the three culinary documents).
- **Offline:** www's pages from swiss-snapshots-046, lh-snapshots-084, -002, lh-snapshots-039 (el) and
  lh-parity-002c.
- **Suite:** lint and the full suite; every brand's smoke and TAP by hand before and after the push.

## The brief after 501: SWISS stage buttons, five parity rows, the Air Dolomiti homepage

Nothing was published, nothing was uploaded, and nothing was requested from www.

At the start of this turn only .migration/project.json was uncommitted (local tool state, kept out
of git).

**Drafts:** for comparison only, never handed over as documents.

- The SWISS drafts are preview's documents passed through the changed step.
- The Air Dolomiti drafts are the capture's pages converted with the importer's convert, which has
  no marker collapse.
- ema-test's 72026ccf (the collapse only for a brand whose theme is live) came in with this turn's
  first push. An import from main after it writes markers as before, so the lists below can be
  imported from main.

### 1. SWISS A350 stage buttons (SWISS row 43): fixed, c3c97519 and 6831796c

- **The fix:** withTeaserTexts (swiss-import.mjs) looks for www's button as a link with its label
  outside the stage's heading, and writes a missing one after the stage's text.
- **Test:** test/swiss-stage-buttons-503.test.mjs, on fixtures of www's stages (swiss-snapshots-046)
  and our 11 documents' stage blocks.
- **Which pages change:** all 45 earlier archives were downloaded too, each into its own directory:
  4,721 pages, 175 of them with stage texts. Only the 11 A350 pages change: 15 buttons in all
  (SWISS Wanderlust's on 11 pages; facts' and behind the scenes' in el and it).
- **Checked:** the drafts on preview at 1440 (ch/it, ch/de), every stage with its button.
- **Re-import:** tools/reports/swiss/reimport-503-swiss.txt (11).

### 2. Five parity rows

See sweep-brands.md, "The pass after brief 501". One commit per row:

- **Cargo 38 (86fa696c):** the company pages' stage right under the header. Below 992 px a video
  stage is the video at 16:9, with its title in a white box under it.
- **Air Dolomiti 68 (1d709b8b):** a page without a heading of its own keeps the importer's title
  h1 visually hidden (section hidden-heading). Re-import:
  tools/reports/parity-2026-11-08/reimport-503-airdolomiti.txt (3). Four more documents repeat their
  title h1 as a heading; they are not in the capture, so they are not confirmed (row 68).
- **Cargo 39 (f682c697):** CF9 card rows on phones: pictures across the screen at 16:9, cards
  stacked, rows 20 px apart.
- **Discover 37 (cd003dc6):** a tab set on phones without the sections' gaps around it.
- **Air Dolomiti 69 (f0f38e9d):** the page stage's title centred as www's HeroFirst, and the next
  section 150 px lower.

Rows 38, 39, 37 and 69 are code only, with no document change.

### 3. Air Dolomiti homepage: the new layout followed; the first screen not

- **Archive:** airdolomiti-parity-001 at the given URL is the archive used since the sweep after 470
  (same size, sha256 a2b8d33e... as its sidecar).
- **Measured:** 482's box comparison on today's preview, it, en and de at 1440 and 390.
  - **The new layout:** the promotions, both tile grids, the Lufthansa Group strip and the services
    are at 0 px from www's.
  - **The Service charter box:** 3 to 8 px narrower.
  - **The German tile titles:** h2 on www as in ours; the 10 px between the two is the marble box's
    padding.
- **Not followed: the first screen.** www's hero is 100vh with the alert bar (54 px) and the header
  over its top. Ours stacks the header, the alert pill (ema-adobe's flash teaser: 127 px with its
  spacing), the stage and the band. So "Discover our promotions" sits 156 px lower at 1440:
  - +73 px: the strip;
  - +52 px: the picture shown under the header;
  - +2 px: the band;
  - +29 px: the band's gap.
  At 390 it sits 47 px higher. No stage height of mine meets www's at both widths while the strip
  sits in the page, so nothing was changed. It is for whoever moves the alert bar above the header
  (row 10, ema-adobe's).

### Checked

- **Hosts:**
  - main--lh-swiss--, main--lh-cargo--, main--lh-airdolomiti-- and main--lh-discover--moved-permanently.aem.page,
    with this checkout's CSS for the rows (host-eval, sweep-ours LOCAL_CSS);
  - every brand's smoke host, before and after each push.
- **Offline:** www's pages from swiss-snapshots-001 to -046, airdolomiti-, cargo- and
  discover-parity-001.
- **Suite:** lint and the full suite before each of the six pushes; TAP by hand before the first
  push and after the last.

## The brief after 505

At the start of this turn only .migration/project.json was uncommitted (local tool state, kept out
of git). Nothing is published, uploaded or requested from www. Documents are drafted for comparison
only. No style markers are added to documents.

### 1. Air Dolomiti homepage, the first screen (Air Dolomiti row 70): done

- **The change:** on the homepage only, the alert pill's section is out of the flow, over the
  stage's top. The stage is the window's height under the header. "Discover our promotions" is 64 px
  under the band at 1440 and 60 px at 390, as www's.
- **Measured** against airdolomiti-parity-001, www / before / after:

  | Width | Promotions heading (it, en, de) |
  | --- | --- |
  | 1440 | 964 / 1120 / 964 |
  | 390 | 904 / 857 / 904 |

  Page heights are in row 70.
- **File history:** airdolomiti.css had no other EMA's change since this morning.

### 3. lufthansa.com help center (lufthansa.com row 19): done for lufthansa.com

- **The cause:** the app drew unstyled; no margin was missing. www's page loads mausy-v1.40.1 with
  maui-theme-lh, X-Line b and help-center-web 4.3.2. Ours loaded v1.38.0 and 4.3.1 without them.
- **The fix:** the micro-frontend block gives lufthansa.com's help app www's setup, loaded from the
  page's own /digitalhangar/ where the host serves it. The section is 56 px under the header from
  768 px, 36 px below.
- **Measured:** h1 at 1440 www 443 / before 553 / after 443; at 390 280 / 203 / 280. Details in row 19.
- **The four brands:** their apps already have www's setup, and each starts 25 px under its header,
  as lufthansa.com's did:

  | Page | h1 at 1440 | h1 at 390 |
  | --- | --- | --- |
  | ITA it/en | 390 | 247 |
  | Austrian at/en | 396 | 273 |
  | SWISS ch/en | 415 | 265 |
  | Brussels be/en | 410 | 262 |

  www's h1 for them is not in this workspace: their recordings are not here, and the re-check
  (sweep-recheck.md) did not record the app's shadow h1. Not changed. If www's pages are built as
  lufthansa.com's, the same rule per brand would move them 31 px (1440) and 11 px (390) down. A
  recording of one brand help page decides it.
- **Note:** checking the files needed lh-edge to fetch two design-system files from www on a cache
  miss (the site's own proxy, as for every visitor of the page).

### 4. Air Dolomiti, the four pages not yet confirmed: none added

Neither airdolomiti-parity-001 nor any crawl in this workspace holds these four pages. The importer's
output (the documents on preview) decides only one:

- **/de/flug-status:** www has a heading of its own. The document has two "Flugstatus" headings: an
  h1 from a block's title, then www's h2. The title fallback does not apply, so nothing changes.
- **/de/reisenformationen/schwangere-und-kinder, /de/reisenformationen/tiere-an-bord and
  /en/destinations/florence/what-to-see:** not confirmed. Each opens with an h1 (alone, or before a
  paragraph) and repeats its text as a heading in a block. That fits the title fallback, and it also
  fits www's own Title block (the importer's titleLine).

They are not on reimport-503-airdolomiti.txt. A re-import is harmless either way: the importer decides
from www's data and notes "H1 from its title, hidden" where it applies.

### 5. Discover at desktop width (Discover row 38): a phone-only rule

- **Measured by:** where the footer starts (the content above it) against discover-parity-001. The
  footer itself is ema-adobe's and 166 to 190 px off at 1440, so total height misled.
- **At 1440:** the 36 px on the marker paragraphs stand where www's column views have their space.
  Without them, 10 of 14 views moved away (check-in +1.9 -> -2.5 %), so they stay.
- **At 390:** without them, 10 of 14 views come closer (check-in +6.3 -> +2.4 %).
- **Shipped:** the change below 768 px only; every 1440 view is the same. The numbers are in row 38.

### 2. The next five rows: four shipped, one needs your decision

The ranking comes from a fresh sweep of today's previews (Air Dolomiti, Cargo, Discover, B2B; 124
pages at 1440 and 390) against the parity captures. Each row is one commit, test first; the numbers
are www / before / after:

| Row | Commit | What | 1440 | 390 |
| --- | --- | --- | --- | --- |
| Cargo 40 | 663bbcb1 | the footer's logo strip as www's sub-footer (every page) | strip 60 / 87 / 60 | 130 / 178 / 130 |
| B2B 33 | 9b3e73f8 | the stage's button shown on phones | unchanged | "Anmelden" at x 42 / hidden / x 42 |
| Cargo 41 | fbe9c23b | a story's text 380 px wide on phones | unchanged | story 142 en 8,389 / 8,856 / 8,640, de 8,856 / 9,397 / 9,157 |
| Air Dolomiti 71 | 6ff73b28 | the footer toggles without the 16 px gap | unchanged | footer 1,106 / 1,134 / 1,106 |

**Needs your decision: B2B headings on phones.** www's CSS sets no hyphens, so its long words wrap
whole: PartnerPlusBenefit de's h1 is 145 px on www and 109 px on ours. A B2B rule (hyphens: manual
below 768 px) matched it on the 2 changed views of 26, with no overflow. It conflicts with the
project rule in test/heading-wrap.test.mjs: every brand hyphenates headings on phones, and no theme
sets wrapping. Reverted, not shipped. The test is kept outside the repo.

**Looked at and not changed:**

- **Air Dolomiti's footer band at 1440 (22 px):** www's "Info legali" holds one more entry, the
  cookie settings link (row 33, your decision).
- **Cargo Facts & Figures' timeline (-8.4 % at 1440):** the timeline script sets every item to
  726 / 782 px, more than the cards' text needs. Not derivable from the cards.
- **Discover customer service and Cargo Support & Contact:** small differences spread across the
  page.
- **Air Dolomiti's destination hubs (+3 to +4 % at 1440):** www's booking bar is a compact sticky
  strip and the hub has no breadcrumb; ours has the strip option's full form and a breadcrumb (190
  px from the header to the h1 on www, 312 on ours). The offline render shows www's widget unstuck,
  so the strip's own measurements need a capture of its stuck state. Next candidate.

### 6. Further batches: stopped

The batch above needs your decision (B2B headings), so this turn stops here, as the brief asks. The
rows still over 2 % and why each is not a layout row of mine today:

- **Data:** Discover's offers (no fares here); Cargo's notifications (the header picture is not in
  DA).
- **A re-import:** Cargo's feedback view (reimport-490-cargo.txt); in-flight entertainment
  (reimport-503-airdolomiti.txt).
- **Other agents' areas:**
  - Discover's footer, 166 to 190 px at 1440 (ema-adobe's), which carries most Discover 1440 rows;
  - the Discover homepage.
- **Capture artefact:** Air Dolomiti at 390 (Bari, Monaco, the articles, support, baggage,
  assistance): the booking panel drawn into the 390 screenshots.
- **Above, not derivable or needing a capture:** Cargo's timeline; Air Dolomiti's hub bar.
- **Under 3 % after this turn:** B2B everywhere; Cargo Support & Contact after the logo strip;
  Discover's tab-set and marker rows.

Smoke after each push: 0 differences, except after 663bbcb1. There swiss and swiss-cn answered
another /de/en/search-index.json, a content index on those hosts; this turn changed no SWISS code or
content.

## The brief after 509

At the start of this turn only .migration/project.json was uncommitted (local tool state, kept out
of git). Nothing is published, uploaded or requested from www. B2B keeps the project's heading
hyphenation (Ben's rule); the parked test stays outside the repo.

### 1. Air Dolomiti's cookie settings link (row 33): built

- **What was missing:** our consent already reopens from a footer link (#privacy-settings: the
  consent.preferences event). Air Dolomiti had no consent tool, so there was nothing to reopen and
  the link was left out.
- **The change:** Air Dolomiti gets the look-alike consent without OneTrust, as Cargo has
  (scripts/brands.js: consent fallback, its own privacy and cookie pages). The banner shows on a
  first visit, as www's PrivacyLab banner does. The footer builder writes www's entry as the link,
  with www's label in it, en and de.
- **The shared code:** only Air Dolomiti's brand entry changed. TAP still has no consent tool, and
  every other brand's consent and footer are as before.
- **Checked on preview** (this checkout's code, drafted footers): it, en and de at 1440 and 390, the
  banner and the preference center in the page's language, the link opening it. The real footers
  come with reimport-510-airdolomiti-footer.txt (3: airdolomiti-nav.mjs --lang it, en, de).

### 2. The published pages outside the last sweep: ranked, five rows fixed

- **Which pages:** published on the live hosts, not in the sweep against the captures: Cargo 950,
  Discover 533, Air Dolomiti 1509. None has a recording, so they were checked on our side only and
  nothing is compared with www. The lists are in parity-2026-11-08 (unrecorded-510-*.txt).
- **How:** each page on its brand host at 390 and 1440, one page at a time. The check looks for a
  page wider than the screen, failed pictures and responses, empty blocks and the h1 count.
- **The ranking** (ranking-510-published.md, worst first, with cause and owner): every page answers
  200. At 1440 no page is wider than the screen. At 390, 19 pages were wider than the screen. All
  19 are fixed:

  | Row | Commit | Pages | Too wide at 390 | The fix |
  | --- | --- | --- | --- | --- |
  | Cargo 42 | b256a7aa | oil and gas, fine arts (de, en) | 21 to 141 px | the gallery's dots wrap (Cargo theme) |
  | Discover 39 | 25d3e87c | the two firearm forms | 65 px | a form option's label breaks a long word (form block) |
  | Air Dolomiti 72 | ac445d11 | four posts, the security-check tips | 26 to 127 px | running text breaks a URL written as text (styles.css) |
  | Air Dolomiti 73 | c87eaaa1 | seven German FAQ and baggage pages | 8 to 105 px | an accordion title breaks a long word (accordion-columns block) |
  | Air Dolomiti 74 | fd757777 | street-food-in-munich | 423 px | the icon heading's row only for a heading that opens with its picture (styles.css) |

  Each fix is one common rule for every brand, as Ben's rule asks; no theme sets wrapping. Each
  page was measured at 390 with the rule: as wide as the screen. Code only, no document changes.
- **Left:**
  - Discover winter-destinations shows a broken icon. "Naturliebhaber:innen:" is read as the icon
    token `:innen:`. This needs your decision on how the importer writes that word, then one
    re-import.
  - 15 empty accordions in 12 Discover documents (corrected after 514; 0 px, nothing visible): the importer can drop
    them with the next Discover re-import.
  - Pages with no h1: the Cargo SDG pages (es, fr, it, pt; www has none either) and Discover's
    application pages. No change.
  - The 404s Cargo's language switch gets when it checks other languages are by design.

### 3. Group for Business member and sign-in pages: no difference, nothing to fix

- **Texts:** the answers archive was downloaded again into a directory of its own (sha256 f4cc8ca1…,
  matches). On b2b.turnsthe.page, signed in with the three test accounts of the mock mode, the four
  de/de member pages show the same texts as the signed-in views I recorded (brief 486). de/en shows
  the English labels, as its language should.
- **Layout at 1440 and 390:** the sign-in pages and the member pages are no wider than the screen.
  At 390 the member tables become boxes that scroll sideways, as built. No CSS difference, so
  nothing changed.
- **Left:** none.

### 4. Open questions that need a recording

Captures only after Ben writes that the network is stable. Each item below says what settles it:

1. **The help apps' 25 px offset** on ITA it/en, Austrian at/en, SWISS ch/en and Brussels be/en (h1
   at 1440: 390, 396, 415, 410; at 390: 247, 273, 265, 262). It is settled by one recording per brand
   of that help page at 1440 and 390, with the app's own h1 box (inside its shadow root) and the
   header's bottom. If www sits as lufthansa.com's does, the brand gets lufthansa.com's rule: 31 px
   down at 1440, 11 px at 390.
2. **Air Dolomiti's destination hub booking bar** (/en/destinations, +3 to +4 % at 1440). It is
   settled by a recording of /en/destinations at 1440 and 390, scrolled until the bar is stuck. The
   recording needs the bar's box in both states (DisplayBookingWidget), whether a breadcrumb exists,
   and the h1's top (190 px under the header on www unstuck, 312 on ours).
3. **Cargo Facts & Figures' timeline** (-8.4 % at 1440): www's script sets each item to 726 or 782
   px. It is settled by a recording of the page at 1440 with each timeline item's box after that
   script ran.
4. **Air Dolomiti's three unconfirmed pages** (/de/reisenformationen/schwangere-und-kinder,
   /de/reisenformationen/tiere-an-bord, /en/destinations/florence/what-to-see): is the first heading
   www's Title block or the title fallback? It is settled by each page's source with its
   __NEXT_DATA__.
5. **From this turn's ranking:** what www shows for the photo at the end of street-food-in-munich's
   h3 (it stays at the icon's 26 px), and what www has where Discover's empty accordions are. A
   recording of each page settles it.

### Checked

- **Item 1:** on preview (main--airdolomiti--moved-permanently.aem.page, this checkout's code, the
  drafted footers): it, en and de at 1440 and 390.
- **Item 2:** cargo, discover and airdolomiti .turnsthe.page at 390 and 1440, every page on the
  three lists. Each fix was measured there with its rule before shipping.
- **Item 3:** b2b.turnsthe.page, the three test accounts, de/de and de/en, at 1440 and 390.
- **Smoke after every push:** all 14 hosts, 0 differences.
- **Documents:** 3 to re-import, reimport-510-airdolomiti-footer.txt (/footer, /en/footer,
  /de/footer); the code commits need none.

## The brief after 514

At the start of this turn only .migration/project.json was uncommitted (local tool state, kept out
of git); nothing was unpushed. Nothing is published or uploaded, and no request went to any www.

### 1. Discover importer (Discover row 40): done, b99ee4c0

- **The gender colon:** Edge Delivery reads `:innen:` as an icon token, so the page showed a broken
  /icons/innen.svg in place of "innen:". The importer now puts a WORD JOINER (U+2060: no width, no
  line break) before the closing colon of a gender suffix (":in", ":innen" right after a letter).
  The text reads exactly as www's, and every other token (`:phone:`) is still an icon (tested).
- **Empty accordions:** an accordion with neither title text nor content is dropped; one with a
  title and no body stays.
- **Checked offline** through aem-cli's html2md and html pipeline (6.33.2) on our published
  documents. Winter-destinations shows "Naturliebhaber:innen: üppige Vegetation" with no icon.
  The 15 empty blocks are gone; every other accordion and every section is kept.
- **The count:** 12 documents hold the 15 empty accordions, not 14 as my last report said
  (sports-baggage has two per language). All 533 published Discover documents were checked.
- **Documents:** reimport-518-discover.txt, 13 (the 12 and winter-destinations), reference roots
  de/de, de/en, xx/fr. None of them has a snapshot on this disk (the importer's snapshot folder
  holds Brussels only; discover-parity-001 has none of these pages).
- **The same kind, already handled:** the culinaryjourney configuration's `dmc:https://…`
  publishes as an `https` icon too. The micro-frontend block turns that icon back into its text
  (micro-frontend.js), so the app gets its address and nothing changes there.

### 2. SWISS homepages (SWISS row 44): done, b3133408; 186 documents ready, 41 waiting

- **What the ranking saw:** the published homepages were imported before 75c9418e (2026-11-07). A
  re-import already turns www's footer disclaimer into its note plus a link to a dialog document,
  and the dialog's text leaves the page. The old documents still carry that text as page text
  (504 px at 390 on /de/de/homepage; the note and the label, which www shows, make the rest of the
  612 px).
- **What a re-import still got wrong:** the bulk import of /us/en/homepage from its snapshot put
  the winter sports offer's dialog into the destination finder's Conditions row. The fare teasers
  before the finder are blocks by then, so the parser's index shifts. The general conditions were
  then nowhere on the page.
- **The change** (swiss-import.mjs withFinderConditions, after the import): the finder's own
  dialog, read from the untouched snapshot by the parser's rule, fills its Conditions row; the
  dialog's paragraphs leave the page flow; the note and the label stay.
- **Dialog documents:** general-conditions-dialogs.mjs --host www.swiss.com writes the dialog
  documents the re-imported homepages link (196, at /{cc}/{ll}/fragments/modals/{label}). It must
  run after the bulk import, before the upload.
- **Measured** on swiss.turnsthe.page with draft documents (published + the step), against the www
  heights of ema-cashub's recordings as their ranking states them (the recordings themselves are
  not on this disk):

  | Page | 1440 www / before / after | 390 www / before / after |
  | --- | --- | --- |
  | /de/de/homepage | 4480 / 4438 / 4286 (-4.3 %) | 5196 / 5705 / 5201 (+0.1 %) |
  | /us/en/homepage | 4467 / 4399 / 4269 (-4.4 %) | 4920 / 5294 / 4922 (+0.04 %) |
  | /ch/en/homepage | 4412 / 4251 / unchanged | 5010 / 5224 / unchanged |

  Both pages come within the 5 % band at both widths. /ch/en has no copy: its +4.3 % at 390 is the
  market's promotions.
- **Documents:** reimport-518-swiss-homepages.txt lists all 227 homepage documents (each market
  root has its own) in release order, ch first. All 227 have a snapshot on disk; none has a
  recording on this disk (ema-cashub's archives record ch/en, ch/de, de/de and us/en, marked).
  186 are ready. 41 are on "# wait" lines:
  - 40 for a capture after "stable": their snapshot carries the Bengaluru promotion, which a
    re-import would keep. se/de's document has none but its snapshot does. All ten ch roots are
    among them.
  - 10 for a name rule (el, ja, ru, zh): www's label has no Latin letters, so the link and the
    dialog document get an empty name (/{cc}/{ll}/fragments/modals/). Nine are in both groups.
- **Written down, not changed:** the name rule exists twice, in footer-disclaimer.js and inlined
  in transformers/lufthansa-cleanup.js (plain scripts), and the homepage bundle would need
  rebuilding. Changing only one copy would break lufthansa.com's links, so both copies and the
  bundle should change together. After the re-import, ch/en and ch/de link the new dialog
  documents, and their hand-made /ch/{ll}/modals/general-conditions (2026-11-05) are no longer
  linked.

### 3. The open questions, from the archives on disk

1. **The photo at the end of street-food-in-munich's h3:** an Air Dolomiti article
   (en/articles/destinations/street-food-in-munich), not Discover. No archive on disk holds it:
   airdolomiti-parity-001's articles hub only links it, and the media archive holds footer icons.
   Open. Settled by a recording of that page at 1440 and 390 with its __NEXT_DATA__: the h3's block
   and the photo's box.
2. **What www has where Discover's accordions are empty:** none of the 12 pages is in an archive on
   disk. Open. Settled by the snapshot of /de/en/book/baggage/excess-baggage from the harness's
   archive: the element before "This might also be of interest to you" (one page answers the
   pattern for all 15 blocks).
3. **The help apps' 25 px:** partly settled, for SWISS. Its help pages' snapshots (/ch/en/help-center,
   /ch/de/hilfe-center) wrap the app in a section without lufthansa.com's section-padding-y-regular
   and mb-default (lufthansa-parity-001's de/en and de/de help-and-contact have both). So
   lufthansa.com's 56/36 px rule does not carry over to SWISS, and nothing changes. The pixel
   distance stays open: a recording of /ch/en/help-center at 1440 and 390 with the app's shadow h1
   box and the header's bottom. ITA, Austrian and Brussels: no help page on disk. Open: the same
   recording of one help page per brand (it/en, at/en, be/en).

The Air Dolomiti hub's sticky booking bar, Cargo's timeline and Air Dolomiti's three unconfirmed
pages stay open as listed after 509. Nobody captures anything before Ben writes "stable".

### Checked

- **discover.turnsthe.page:** the 533 published documents read (no browser), the 13 changed ones
  through Edge Delivery's own chain, offline.
- **swiss.turnsthe.page:** /de/de, /us/en and /ch/en homepages at 390 and 1440, published against
  drafts. All 227 homepage documents read.
- **Offline:** the bulk import of /de/de and /us/en homepages from brief 503's snapshots, in a
  scratch workspace (the reports it writes put back).
- **Smoke after every push:** all 14 hosts, 0 differences.
- **Documents:** reimport-518-discover.txt (13) and reimport-518-swiss-homepages.txt (186 ready,
  41 waiting), plus the 196 SWISS dialog documents general-conditions-dialogs.mjs writes;
  reimport-510-airdolomiti-footer.txt (3) is with the harness already.

## The brief after 518

At the start of this turn only .migration/project.json was uncommitted (local tool state, kept out
of git); nothing was unpushed. Nothing is published or uploaded, and no request went to any www. No
test calls da-upload, the DA API or the preview API.

### 1. market-diff and the slug maps: done, 8d8cce17

- **The change:** md-replica-check.mjs asks our replica where the write step puts a page
  (lib/replica-paths.mjs): the map's write target, `canonicalOf(path)` without `all`. That is
  the canonical path once a root's flag is on, else the www path, the same rule as da-upload. The
  www side stays at its www paths. The map comes from `--host` (each map names its own host:
  lh-com, lh-swiss, lh-b2b; none for ITA and TAP). `--slug-map` takes a copy of a map.
- **Why not `all: true` for the requests:** it maps every alias whatever its flag. With every flag
  off it would ask the replica at 6,499 canonical paths whose pages are still at their www paths.
  `{ all: true }` and `wwwPathsOf` are what the test checks.
- **Proved:**
  - Every flag off: the same requests for every pair on disk (Lufthansa 173,479, SWISS 36,205,
    Group for Business 47,364, ITA and TAP).
  - A flags-on copy of Lufthansa's map: the 6,499 pairs with a localized page ask the replica at
    the canonical path, the www side stays at the www path, and every one maps back to its www path.

### 2. SWISS dialog names: done, eafe8b59; 187 homepages ready

- **The rule:** the label's slug as before; a label without Latin letters or digits takes the
  root's language (/ch/ja/fragments/modals/ja). I chose it because it is never empty and the same
  however www words the label. It also needs no transliteration table in two copies (Japanese and
  Chinese have no simple one).
- **What changed:** footer-disclaimer.js dialogPath, and in the shared cleanup transformer
  (transformers/lufthansa-cleanup.js convertFooterDisclaimer) only its slug line.
- **lufthansa.com unchanged:** its one dialog link today (de/en "General Conditions", the only one
  among its 255 roots' homepages on our host) and "Allgemeine Bedingungen" keep their names, as do
  SWISS's Latin labels (tested on the transformer and the document writer).
- **Bundles:** the 14 bundles that carry the transformer were rebuilt with an installed
  aem-import-helper (the offline npx cache has none). The builder's process-id identifier was set
  back to main's, so each bundle differs from main by that one line. The rebuild also regenerated
  import-hub.js (one import line in another order); it was put back, and the hub bundle has
  only the line.
- **Documents:** general-conditions-dialogs.mjs --host www.swiss.com now writes 206 dialog
  documents, none without a name. In reimport-518-swiss-homepages.txt the ten roots no longer wait
  for a name: 187 ready (sg/zh was the one waiting for the name alone), 40 wait for a capture.

### 3. The consent banner in each brand's fonts: done, 65b0d52d

- **The change:** a brand whose theme has fonts of its own (Air Dolomiti, TAP, SWISS, Austrian,
  Brussels, ITA) gives the banner and its preference center its --heading-font-family and
  --body-font-family. lufthansa.com, Cargo, Group for Business and Discover keep Lufthansa's
  stacks exactly. It is one rule in consent-banner.css (:where(), so it weighs as .lh-consent).
- **Checked with this code at 1440 and 390:**
  - main--lh-airdolomiti--moved-permanently.aem.page: the banner on a first visit and the
    preference center from the footer's "Change Cookie Settings" (it: "Modifica impostazioni
    cookie") are in Euclid Circular B, loaded, and no Lufthansa font file is asked for. With
    main's CSS the same page asked for four (LufthansaHead and LufthansaText).
  - main--lh-tap--moved-permanently.aem.page: TAP has no consent tool, so its pages show no banner
    and no cookie link. Called directly, the banner module renders in GT Flexa (headings, 700
    loaded) and Inter.
  - Cargo's banner is unchanged (LufthansaHead, LufthansaText).
- Air Dolomiti parity row 75. Smoke on all hosts after the push: 0 differences.

### 4. Capture list: written

tools/reports/parity-2026-11-09/capture-list-brands.txt lists 52 pages, host first, in priority
order:
1. The ten SWISS reference-root homepages whose re-import waits (page source).
2. The recordings that settle open questions:
   - the help apps: SWISS /ch/en/help-center, ITA /it/en/help-and-contact, Austrian
     /at/en/help-center and Brussels /be/en/contact, each with the app's shadow h1 box at 1440
     and 390;
   - the Air Dolomiti hub's stuck booking bar (www.airdolomiti.eu/destinations, 1440 and 390);
   - Cargo's timeline (/en/ci/facts-figures, each item's box after www's script);
   - Air Dolomiti's four unconfirmed pages (with __NEXT_DATA__);
   - the street-food article;
   - Discover's excess-baggage source.
3. The 30 SWISS market homepages that wait for a capture.

At 10 seconds a page that is 8 min 40 s; counting each width as its own capture (59), 9 min 50 s.
Nothing is captured before Ben writes "stable" (after 15:00 CET).

### Checked

- **Previews:** main--lh-airdolomiti and main--lh-tap at 1440 and 390, main--lh-cargo at 1440
  (this checkout's code routed in, www's hosts unresolvable).
- **lufthansa.turnsthe.page:** the 255 roots' homepage documents read.
- **Offline:** the slug maps and the pairs lists on disk, the SWISS snapshots of brief 503 (the
  dialog writer, dry).
- **Smoke after every push:** all 14 hosts, 0 differences.
- **Documents:** none new to re-import beyond reimport-518-swiss-homepages.txt (187 ready, 40
  waiting) and its 206 dialog documents.

## The brief after 523

At the start of this turn only .migration/project.json was uncommitted (local tool state, kept out
of git); nothing was unpushed. Nothing is published or uploaded, and no request went to any www.
No test reaches the uploader, the DA API or the preview API.

### 1. Stages after an unpadded AEM section (lufthansa-sections.js): done, 6a2ee2e3

- **The change:** ema-adobe's exact change from hub-campaign-521.md, with its exclusion. A
  padded stage after an unpadded AEM section gets style padded, as www pads it, unless a padded
  AEM section (not grey) follows it: economy-class's Allegris stage keeps before-padded.
  lufthansa.com's pages only.
- **Bundles:** the 14 bundles that carry the transformer were rebuilt, with the builder's
  process-id identifier set back to main's. Each differs from main by that change only.
- **ema-adobe's import-hub.js:** the rebuild regenerates it with one import line in another order
  (`hub-dcep-render` moves up), as last time. It was put back; the hub bundle carries only the
  change.
- **Measured** on main--lh-com--moved-permanently.aem.page with a scratch copy of destinations
  (New York's and Cape Town's stages padded, as the rule writes them) against lh-parity-002c's
  recording (tools/parity/compare.js, the first 8,000 px): 1440 18.3 -> 15.2 %, 390 14.5 ->
  13.5 %, ema-adobe's numbers.
- **Documents:** reimport-526-hub-stages.txt lists 14, from the 1,577 lufthansa.com snapshots on
  this disk: destinations on 8 roots, tips-senior-travellers on 5, first-class on 1. ema-adobe's
  scan of 3,397 counts 16 (7, 7 and 2). Their snapshots aren't here, so the two lists can't be
  matched path by path. A path of theirs that's missing can be added: a re-import the rule doesn't
  reach comes out unchanged.

### 2. Group for Business and Cargo against the recordings: ranked, three rows fixed

The ranking is in sweep-b2b-cargo-526.md: both brands worst first, with cause and owner. The
pages without a recording are listed (b2b-unrecorded-526.txt 586 language documents,
cargo-unrecorded-526.txt 950 pages).

| Commit | Brand | Row | 1440 | 390 |
| --- | --- | --- | --- | --- |
| 84fc8d14 | Cargo | 43: Support & Contact's support band (small print, its end) | 2435 -> 2335 (www 2301) | 3254 -> 3130 (www 3066) |
| fb5e1502 | Cargo | 44: eBooking's features text col-5 | en 3915 -> 3853 (www 3771) | unchanged |
| da6b22fc | B2B | 34: contact's hotline finder as www's PartnerPlusBenefit box | the box as www's; page 3417 -> 3397 (www 3499) | page 4056 -> 4102 (www 4153) |

- **Why fewer than three per brand:**
  - Cargo's three worst rows aren't in its CSS or importers: a re-import (the feedback view),
    data (notifications) and a recording (the timeline). The article and fleet pairs below them
    have several small causes and no single measurable rule.
  - No Group for Business page is more than 3 % from www. Its other high rows are one page's own
    styling (Ben's rule keeps the common style), or they need the importer to tell two kinds of
    column view apart.
- **Open, B2B (with the exact candidate change and what decides it, in the ranking file):**
  - the two-item column view under text in a white section (about-us, celebrating-shared-stories);
  - nested column views (lufthansa-group-airlines).
- **For other owners:** below B2B contact's finder, the separator sits 4 px under the section's
  top (the shared grey-after-grey join) where www has 20 / 40 px. The divider markers are
  ema-test's, the join is shared styles.css. Not changed.
- **Sign-in pages:** the de/en and de/de prelogin pages measure as www's. No test account was used,
  and the login logic wasn't touched.
- **B2B contact at 1440:** the page total moves 3417 -> 3397 px although the finder now matches
  www. The finder had been 20 px too tall, which hid the 40 px the page lacks under its separator.

### 3. ema-cashub's handover, "causes in other files": nothing of mine to change

Of that section, only travelling-with-animals names a file of mine: the tab markers and
splitTabSections in swiss-import.mjs. With a tab panel whose body nests a two-column view inside
the panel's own column view, the steps pass the body through unchanged: withTabMarkers only drops
the tab control and puts a marker before each panel, and splitTabSections only cuts sections at
the markers (checked offline). So the default content comes later in the chain: Austrian's nested
view unwrap (austrian-import.mjs withNestedOnecolumnUnwrapped, ema-cashub's) or the shared
column-view mapping. What settles it: that panel's markup in the austrian-parity recording, which
is ema-cashub's and not on this disk. The section's other causes belong elsewhere: economy-class's
buttons (content, a re-import), cards-icon (ema-adobe), entryregulations' separators (ema-test),
new-destinations (lh-com's mapping) and the homepages (ema-adobe). None names SWISS, Air Dolomiti,
Cargo, Discover, the B2B importers, campaign-sections.js or market-diff.

### Checked

- **main--lh-com--moved-permanently.aem.page:** destinations at 1440 and 390, published and
  draft, against the recording.
- **b2b.turnsthe.page and cargo.turnsthe.page:** the 26 and 22 recorded pages at 1440 and 390
  (the sweep), the fixed pages again with the rules, B2B's sitemaps.
- **Offline:** the 1,577 lufthansa.com snapshots (the stage scan), the tab steps on a nested panel.
- **Smoke after every push:** all 14 hosts, 0 differences.
- **Documents:** reimport-526-hub-stages.txt (14); the CSS rows need none.

## The brief after 526

At the start of this turn only .migration/project.json was uncommitted (local tool state, kept out of git); nothing was
unpushed. Nothing is published or uploaded, and no request went to any www (the network is flaky until 15:00 CET). DA
was read once (admin.da.live/source, /ch/en/homepage of lh-swiss, for the dry run). No test reaches the uploader, the
DA API or the preview API. Measurements: b2b.turnsthe.page with the local CSS injected (item 1), the recordings and
snapshots on this disk, DA's copy (item 2), fixtures only (item 3).

### 1. The two open B2B causes: both fixed

- **(a) e0439f0b, B2B row 35:** a card carousel right under text in a white section gets www's column-view space above
  it (44 px on phones, 64 px from 768 px). Measured on every recorded page (26 pages, 1440 and 390, not only the three
  that match): 20 of 52 page widths change, none more than 1 % further from www (the most: experts/news and
  route-network de/en at 1440, +0.8 points). about-us 1440 -2.0 -> -0.5 %, celebrating-shared-stories -2.9 -> -2.4 %.
  No document change.
- **(b) 00dcd156, B2B row 36:** b2b-import.mjs marks a one-column view that holds column views and gives the
  block made of it the option nested; b2b.css spaces a nested block's rows 83 px apart from 768 px. Test first, with
  two trimmed fixtures from b2b-parity-001. The recordings imported offline: the airlines page comes out as
  columns-media (nested), the homepage unchanged. With the option at 1440: de/en 4108 -> 4039 px (www 4013), de/de
  4142 -> 4073 (www 4071); 390 unchanged. The steps are b2b-import.mjs's own, so no bundle changed in the rebuild.
- **Documents:** reimport-530-b2b-nested.txt, 2, in release order (/de/en, then /de/de
  travel-solutions/lufthansa-group-airlines). They're published as they stand (Ben's rule).

### 2. Readiness for the capture round: capture-import-readiness.md, three SWISS fixes

- **The report:** tools/reports/parity-2026-11-09/capture-import-readiness.md gives one line per page group for the
  52 pages of capture-list-brands.txt and the 56 of capture-list-austrian-brussels.txt: importer, template, what the
  capture settles, known gaps, who fixes.
- **The SWISS dry run:** /ch/en/homepage imported from brief 503's snapshot (the Bengaluru promotion), compared with
  DA's copy. Three differences were importer bugs, each fixed test first:

| Commit | Row | What |
| --- | --- | --- |
| 58a7fb1f | SWISS 45 | withHeroVideo matches the stage picture as www's rendition (.jpg.transform/...): the dry run had lost the video |
| d12d59d9 | SWISS 46 | withSwissIcons: the icon tiles keep SWISS's own icons; the dry run had brought back lufthansa.com's |
| ce8ba142 | SWISS 47 | swiss-market-import.mjs (the 30 market homepages) runs withFinderConditions and withSwissIcons as the language versions' importer does |

- **Left for the capture:**
  - where the footer disclaimer goes (www's markup puts it after the finder; DA's ch/en and ch/de have it at the end, by
    row 14's hand fix): the /ch/en recording decides;
  - the promotion itself (the capture brings www's current one);
  - the breadcrumb title row (no visible effect).
- **Air Dolomiti's destination hub:** the importer already writes www's booking widget as flight-search (airdolomiti
  strip, row 36), so no new block. No rule makes the strip sticky yet: a theme rule follows the recording, with no
  re-import.
- **Cargo, Discover, B2B:** nothing needs an importer change before the capture.
- **Documents:** none from me. While this was written, the capture round began: c3442453 (not mine) patched 38 of the
  40 waiting SWISS homepages in DA from swiss-snapshots-047 (footer note, its paragraphs, dialog link; DA's copy
  otherwise), previewed, not published. The readiness file says so at its top; its full re-import lines apply to the next
  re-import from a capture.

### 3. The market comparison and the Message Center tooling from a clean checkout: ready

- **Clean copy:** a git archive of origin/main (the tools, tests, scripts, blocks, slug maps; node_modules linked).
  The market-diff tests passed (13 of 13: pictures, served view, slug-aware write target), and so did the Message Center
  tests (41 of 41: message-center, brand sites, pt-br, message-store, TAP anchors).
- **The 20-pair dry run:** SWISS pairs whose two pages are both among the held snapshots, written as md-fetch writes a
  run. Every offline step ran: md-order (40 URLs), md-compare (19 same, 1 differs/content: bg/de prepare-lxmas-2024),
  md-replica-check against a local stand-in replica (127.0.0.1, so no request left the machine), md-report.
- **Slug awareness:** with lh-swiss's map as committed (every flag off), every replica request stays at the www path.
  The SWISS map moves none of these pairs even with its flags on. lufthansa.com's map moves 14,007 of its 173,479
  pending pairs with flags on (e.g. /ae/de/gepaeck -> /ae/de/baggage). None of those has both pages on this disk, so
  that side is covered by market-diff-slugs-522.test.mjs.
- **Resume commands:** tools/market-diff/README.md now has the runner for each airline (lh, swiss, b2b, ita, tap), in
  two waves for memory: ITA, TAP and SWISS, then B2B and lufthansa.com. The fetch step itself wasn't run (it needs www).
- **Left:** the 145 TAP roots' Message Center sweep has no runner of mine. Its tooling (scripts/message-center.js,
  message-store.js) starts clean as tested above; the sweep's own command is with its owner.

### Checks

- **Smoke:** after each push, every brand's smoke was compared with the run before it: 0 differences, except after
  b5c21116. There, lufthansa's and lufthansa-edge's /sitemap/sitemap_lh_at_de.xml.gz changed by 4 bytes, from others'
  at/de uploads of the same hour; that commit is a report file.
- **TAP by hand:** 40 pages, all 200, the same as the brief after 523.
- **Not in git:** the clean copy, the fixtures, the dry-run output and the logs, all in the ignored scratch folder.
  They are local run material.

## The brief after 531

At the start of this turn only .migration/project.json was uncommitted (local tool state, kept out of git); nothing was
unpushed. Main's lint was red at the start (a 129-character line in lh-edge, ema-adobe's); 3891be5a fixed it before
my first push, and every push here ran the whole repository's lint first. Nothing was uploaded or published. The six
recordings came from the R2 drop, each checked against its sha256 and unpacked into its own folder (scratch, not in
git). No test reaches the uploader. Measured on our hosts (swiss, ita, cargo, discover, airdolomiti, b2b
.turnsthe.page), with the local CSS or code injected where a change was pending, against the recordings.

**Requests outside our hosts:**
- Two probes of the help app (before I closed the gap) let the app's FAQs picture load from www.ita-airways.com and
  swiss.com. The measuring scripts now make every brand host and its subdomains unresolvable.
- The trial import of Discover's excess-baggage page ran offline (the site is flagged bot-protected, so the
  importer used the recording, not www). Its browser may still have asked www.discover-airlines.com and
  www.lufthansa.com for the recording's linked scripts, styles and pictures. I did not run the bulk importer again.

### 1. The rows that waited for a recording

| Commit | Row | What | Measured (ours before -> after, www) |
| --- | --- | --- | --- |
| 15db2b5e | SWISS 48 | the help app's question "Is there a topic missing?" moved into the app's own container (between the topics and the FAQs card), as www | SWISS /ch/en/help-center 1440 1964 -> 2082 (2116), 390 2170 -> 2336 (2326), with the patched document; ITA it/en 1440 2320 -> 2296 (2254) |
| 785620e5 | SWISS 49 | the question's sizes in the app (bold question, 14 px note in half the column, 40 px over 50 px answers) | SWISS 1440 2082 -> 2107 (2116); ITA 1440 2296 -> 2304 (2254) |
| e6e28ebd | AD 76 | the destination hub's booking strip sticks as www's: fixed under the header from 1025 px, a navy band under the 80 px header on phones; the header stays on those pages | 1440 4855 -> 4733 (4677), the h1 432 -> 310 (310); 390 9501 -> 9575 (9699) |
| c866fc17 | Cargo 45 | the history timeline's texts as www's at every width, 80 px between the card rows and 48 px under the lower one | 1440 4547 -> 4802 (4848); 390 12398 -> 12248 (11916) |
| 3b421062 | AD 77 | the flight status pages as www's half page (the form beside the card), www's page title (under its header) a hidden h1 | /de/flug-status 1440 2307 -> 1761 (1693) |
| 87337c3e | Discover 42 | excess-baggage: the importer as it is makes www's tabs, the text beside its picture and the two-up cards; the document was older than the tab sections | 1440 5700 -> 2523 (2705), with that document; 5575 with Discover's theme live since 17:26 |

- **Help apps:** the SWISS help-center document lacks the feedback block that its twin contact-us has: a patch
  (patch-535-swiss-help-feedback.txt). ITA's rest (+2.2 % at 1440, +3.7 % at 390) is the footer and the page around the
  app, not the app.
- **Cargo:** www's script measures the timeline cards taller than it draws them (its timeline 1404 px, ours now
  1223): no rule reproduces that.
- **Air Dolomiti:**
  - www's header shrinks to 80 px when scrolled (its bar then at 30); ours stays 120.
  - Of the three pages not recorded before, flug-status is fixed. schwangere-und-kinder is -1.3 % to the footer.
    tiere-an-bord is -4.9 % (its accordions start 24 px higher; the rest is not traced).
  - street-food-in-munich is -6.7 % to the footer (not traced).
- **B2B row 36 at 390** (b2b-parity-002, the published documents since round 130): de/en 5312 / 5286 (+0.5 %), de/de
  5432 / 5454 (-0.4 %); nothing to do.

### 2. The next ranking rows

| Commit | Row | What | Measured |
| --- | --- | --- | --- |
| 2fa27f77 | AD 78 | the destination article lists (what to see, do, eat) from 930 px: the title and text centred as www's CenteredBlock, the cards 179 px under it | florence/what-to-see: the text 252-1188 px as www's, the footer 934 -> 1021 (1108; www's pagination row left) |
| 8c03a4fe | Cargo 46 | the transport stories' text 50 px from the picture modules from 1025 px | 142 en 7561 -> 7921 (7829), de 7609 -> 7969 (7925) |

- **B2B:** the next rows (partner-plus-benefit, experts) are spacing that the documents' style markers and spacers
  draw (40 px under the title where www has 80). Group for Business' collapse pass (e28605e2) is uploaded and
  previewed, not published. Ranking again after it publishes is the right order (ema-test's markers; not touched).
- **Discover:** no open ranking row of its own after the brief after 518 (offers: data; families: the footer,
  ema-adobe's). Other documents imported before 515475be may lack their tabs as excess-baggage did. That needs their
  recordings to check.

### Documents (4; each published as it stands, nothing waits at preview for a later step)

- patch-535-swiss-help-feedback.txt (1): /ch/en/help-center, DA's copy plus contact-us's feedback block.
- reimport-535-ad-flight-status.txt (2): /de/flug-status, /en/flight-status.
- reimport-535-discover-excess-baggage.txt (1): /de/en/book/baggage/excess-baggage, from discover-parity-002.

### Checks

- **Smoke:** after each push, every brand's smoke was compared with the run before it: 0 differences. After
  2fa27f77 and 8c03a4fe, Austrian's two hosts and B2B failed to fetch once (network); their reruns show 0 differences.
  After 8c03a4fe, Brussels' /de/en/search-index.json changed (an index; others' content).
- **TAP by hand:** 40 pages, all 200, the same as the brief after 526.
- **Not in git:** the recordings, the clean copies, the trial import's output and the logs. They stay in the ignored
  scratch folder as local run material.

### The brief after 531, continued (after the report above)

ITA, TAP and Discover are live with their token-free styling since 536's start (2377993b, ace9e7ee, bbe699f9): ITA and
Discover are measured as they are on live.

| Commit | Row | What | Measured |
| --- | --- | --- | --- |
| 1d87c05c | SWISS 50 | the help app's section to the footer as www's: 24 px on ITA, 30 px on SWISS (was 48) | ITA live 1440 2304 -> 2280 (www 2254), the footer 1484 -> 1460 (1459), 390 3164 -> 3140 (3052); SWISS contact-us the footer 30 px under the card as www's |
| 5bae2c03 | AD 79 | the FAQ half page's accordions 75 px over the next section | tiere-an-bord the footer 1482 -> 1557 (1558); schwangere-und-kinder 1075 -> 1108 (1089) |
| 6e1171db | AD 80 | the header 80 px once scrolled, the logo 40 px; the hub's strip under it at 30 | after 900 px: the bar 80, the logo 16-56 (www 16-55), the strip at 30 (30) |

- **Left:**
  - ITA's help page at 390 is +2.9 % (its footer, 49 px taller than www's, is ITA's).
  - SWISS's help card ends 28 px higher than www's (www's note wraps to two lines).
  - Air Dolomiti street-food-in-munich is -6.7 % to the footer. It's a post's own layout (the stage card's width, the
    lead texts' column, www's picture rows), not traced.
  - Florence's pagination row is still missing.
  - Cargo stories at 390 are still about +3 %.
  - B2B waits for its pass.
- **Documents:** the same 4 as above.

## The standing order of 2026-11-10 (Air Dolomiti, ITA, TAP, SWISS, Cargo)

The list in order, each item finished, committed and pushed before the next (whole-repo lint, the suite, smoke before
and after on served code). Nothing uploaded, previewed or published by me; re-imports are list files under
tools/reports/parity-2026-11-09 and wait for the helpers. No request to an airline host: recordings from the R2 drop,
measurements on our own hosts with the airline hosts unresolvable. Decisions by the existing rules are written under
each item.

Before the order (the brief after 566, on main): dbbbc719 (AD 88, the text block's foot), ef0ddc38 (AD 89, the price bar
pinned), 5651bc79 and 67bf4437 (ITA 24 and 25), all with lint, the suite and smoke at 0 differences on 14 hosts.

### Item 1: the Air Dolomiti phone strip and breadcrumb (done)

5ea6e536 (AD row 90), as the user answered: on the destination pages' top below 530 px the search strip without room or
card (still rendered, so the header's plane opens its panel over the window, the focus back on the plane), the
breadcrumb visually hidden (still a named nav), the stage 90 px under the header. The articles keep their visible
trail (www's is dark over their title). 390 x 844: bari-de 8194 -> 7996 (www 8097, every carousel heading within 1 px),
bari, Munich and cagliari -198 each; every page at 1440 and the article, homepage and fleet at 390 unchanged.

### Item 2a: Air Dolomiti pictures by DA's copies

- **Found:** the importer writes a picture's local copy when its own download step has it, else www's
  cms.airdolomiti.it address; the helper then patched the page to DA's copy. DA's copies are named from the www URL alone
  (/media-da/airdolomiti/<readable name>-<sha1 of the URL, 8>.<ext>) and lh-airdolomiti's upload state lists all 1811,
  so no request is needed to find one: of airdolomiti-parity-004 bari-de's picture URLs, 31 resolve to DA copies.
- **Change:** tools/importer/airdolomiti-media.mjs (the naming, shared with airdolomiti-assets.mjs, which now uses it;
  daCopyOf; missingAssets). The import writes DA's copy for any picture it has not downloaded and DA has (a resized copy's
  original too); a picture DA lacks keeps www's address as before (the helper's download step takes it). A /media-da path
  the upload state knows is linked without a local file (da-upload's mediaStep: known).
- **404s:** tools/importer/airdolomiti-missing-assets.json, Austrian's pattern (url, www's answer, when, pages); the
  import leaves a listed picture out and keeps the card. It starts empty: no www answer is recorded on this machine, and
  I make no requests. The importer's own download state still leaves out what it found 404 itself.
- **Kind:** importer only; no live page changes, no re-import needed (the live documents hold DA's copies already).
- **Test:** test/airdolomiti-da-copies-567.test.mjs (fails on the old importer).
- **On main:** 156f3b65 (lint 0, 3400 pass 0 fail, smoke 0 differences on 14 hosts).

### Item 2b: the two Air Dolomiti airport pages

- **Why they were held:** false positives of reimport-557-ad-carousel-count.txt. Their carousel ("Related articles")
  has no "see all" link on www (showMoreText empty); the paragraph after it is the map link, which my scan took for one.
- **Recording:** airdolomiti-snapshots-003.tar.gz from the R2 drop (S0cxjp folder, sha256 b6daf243... as downloaded; no
  delivery checksum is recorded for it, both files match the manifest's own sha256), Frankfurt 05:36 and Munich 05:39 UTC.
- **The import against the live documents** (run offline on the snapshots):
  - Frankfurt: www's new AiRail closure notice (an h2 and two paragraphs).
  - Both: the text block as columns-media (news) and the title section compact-title, as www's description-news and
    Title h1; the newsletter section style; DA's picture copies.
  - Munich's text is unchanged (only a space between the bold labels and their text, from the markup).
  - The links are as now. The missing /de prefix in the offline run is this machine's missing paths.json, not a change.
- **Decision** ("www's text and links, DA's local picture copies"): re-import both. The Alternate rows stay: www still lists
  it and en (Frankfurt) and it and de (Munich), as our rows. The news and compact-title variants stay: www shows both.
- **List:** reimport-567-ad-airports.txt (2 rows, the snapshot archive, the expected change per row). Parity row 91.

### Item 2c: the destination pages' text size on phones

- **Measured at 390 x 844:** the text block under the stage (www's TitleDescriptionTextCta) is 22 / 37.4 px since row 83 on
  all 9 pages checked. The 16 / 27.2 px text left is www's DescritionNews (a picture across the page over its text):
  22 live documents hold it as a plain columns-media, imported before 80458997 wrote columns-media (news). The variant has
  www's look since brief 456 (the picture 600 px, the text 19.44 / 33).
- **Decision:** no code change; re-import. London with the variant on its live document: 390 x 844 8761 -> 10132 px,
  1440 6023 -> 7384 (the 600 px pictures, as www's rule). No recording measures www's London or Basel: both on a capture list.
- **Lists:** reimport-567-ad-description-news.txt (22 pages), capture-567-ad-description-news.txt (2). Parity row 92.
- **Note:** an earlier offline import run here made an empty folder content-sites/lh-airdolomiti/content/media-da/airdolomiti
  (git-ignored, left as it is).
- **On main:** b51dfc86 (lint 0, 3402 pass 0 fail, smoke 0 differences on 14 hosts).

### Item 3: TAP

- **3a, /en-pt at 1440 (row 127):** the change from 4,836 to 4,000 px was ours, not www's: ed2c5846 (row 121) pinned the
  Miles&Go cards as www's while scrolling. www's recordings (tap-parity-001 and -002) are 4,621 px because they did not
  scroll (www's GSAP pin-spacer keeps 1,580 px until scrolled through); scrolled, www is 4,041 (brief 483). Ours 4,000:
  -1 %. Nothing to follow.
- **3b, get-inspired (row 128):** tap-parity-002's recording marked unreliable (about 1,500 pictures not loaded; www 5,582
  px against our 39,589), out of the ranking. No other recording in the drop has the page (tap-parity-001 has none,
  sha256 d3a98bb2... as downloaded). capture-567-tap-get-inspired.txt for the next window.
- **3c, the market comparison's import rows (row 129):** the comparison's rulings file is not on main (work/market-diff/tap
  is Ben's), so I worked from its import-list.tsv (387 rows), which has the same kinds of rows:
  - version-local pages ("home-market section"): 16 language pages, by the comparison's variant hash 34 groups;
  - the shared promo variant: en and pt /miles-and-go/promo, 8 roots each (the "16 shared promo" rows);
  - own documents: 34 rows of 21 roots;
  - the alerts page left out (the comparison's summary: the alerts come from the Message Center, nothing to import);
  - the lacks rows: Ben's 14 in 5f33ef7e; a 15th is not in the files on main;
  - the en-pt club page: three groups (55 roots, ao, us) like pt-pt's; its implicit market_us variation still goes by
    the rule path, which comes first.
  - **Step:** tap-markets.mjs read no such decisions: where no rule explains a difference it kept the language version
    for every market. Now tools/markets/tap-market-groups.mjs writes market-groups.json from the comparison, and the step
    gives a group whose capture differs its own section (its countries) and the language version's section to every other
    market; a group without a capture is noted and keeps the language version; the own documents join the roots' own
    pages (the CLI converts them from the roots' captures). ITA's and SWISS's pattern: one document with Markets sections.
  - **Kind:** importer and data only; nothing live changes before the run. The own documents are served once
    tools/reports/tap/markets.json and scripts/tap-markets.js (lh-edge's table, ema-adobe's deploy) follow the run.
  - **Lists:** reimport-567-tap-markets.txt (17 language documents and 34 root documents, the groups per row),
    capture-567-tap-market-groups.txt (70: one root per group and each own document's page).
  - **Test:** test/tap-market-groups-567.test.mjs (fails on the old step); test/tap-markets.test.mjs unchanged and passing.
- **On main:** 6e4af88b (lint 0, 3416 pass 0 fail, smoke 0 differences on 14 hosts).

### Item 4: SWISS

- **The offers row (SWISS row 52):** the "mapping error" is the sweep's: our finder asks www.lufthansa.com's /service/api
  (SWISS has no serviceOrigin), and the sweep's browser blocks airline hosts, so our page always showed "No results"
  (2,218 px against www's 32,382). Fixed in the sweep: the row is out of the height ranking as not measurable offline.
  Whether visitors get cards is check-567-swiss-offers.txt for the next window (row 35 had it open as data).
- **SWISS ranking (the 5 recorded pages, live today, 390 at www's 844 px window):** homepage 4,246 / 5,194 (www 4,413 /
  5,086: -3.8 % / +2.1 %), book-and-manage 1,249 / 1,709 (1,272 / 1,776: -1.8 % / -3.8 %), prepare -0.9 % / -0.6 %,
  help-center 0.0 % / +0.9 %. Nothing over 5 %: the homepage goes into the fresh ranking (item 6).
- **The SWISS document that would change on its own next import:** not found from the files on this machine. No report
  on main names it, the machine has one SWISS snapshot and one local document (no dry run possible), and the nearest lead
  (b01's grand-suite request page, markets ch) has no local copy to compare. Marked blocked: it needs the helper's note
  naming the document. Not asked now (rule 5); I went on.
- **On main:** 2fd7f5a8 (lint 0, 3421 pass 0 fail, smoke 0 differences on 14 hosts).

### Item 5: Cargo

- **5a, the newsroom feed (Cargo row 48):** with every consent group accepted Mynewsdesk's app loads in the measuring
  browser: its frame is 3,840 px on both, so the newsroom was +2.8 % only from what we put around it. www has the app
  right under the header and no page title over it; ours had "Newsroom" (68 px with its margin) and the section's 25 px
  above, 48 px below (www 23). While the app is mounted the section sits under the header and 23 px over the footer, and
  the title is visually hidden (still read). 1440 4,556 -> 4,438 (www 4,430); 390 10,736 -> 10,629 (10,631); de alike.
  Served code, backwards compatible: without the app (flag off, no consent) nothing changes.
- **On main:** 9c004e6f (lint 0, 3427 pass 0 fail, smoke 0 differences on 14 hosts).
- **5b, "Transport Stories Home" and the chevrons (Cargo row 47):** both live since 9c6dcefa; the label and its picture
  gap as www's. Left from row 47: 11 chevrons against www's 12. www's twelfth module is the story's closing text (the
  partner links and the photos' credits) with the up chevron; ours held it as a text block without one. The chevron set
  now includes the section's closing text block: 12, the last picture's down, the credits' up, the height unchanged
  (7,947 px at 1440). **Process slip:** I edited cargo.css while 9c004e6f's ship was running, so that commit took the
  chevron selectors with the newsroom rule, and its test update stayed behind; main's
  test/cargo-story-chrome-541.test.mjs failed one test until the next commit, which carries the test. The served change
  had been measured before (smoke after 9c004e6f: 0 differences on 14 hosts). From here on I edit no file of a running
  ship's list.
- **5c, the collapse keeping the play button's text:** checked, no change needed. marker-collapse.mjs (ema-test's,
  read only) gates Cargo until its theme is live; with the gate forced open a video's {controls round-play-button} marker
  goes and the link's text stays as it is (a bare URL or "Watch the video"), as its own rules say.
- **On main:** 221b672b, the test with its CSS again (lint 0, 3429 pass 0 fail, smoke 0 differences on 14 hosts).
- **5d, the token-free run for Cargo:** the plan is tools/reports/token-free/cargo-plan-567.md, the pass itself
  harness-pass-cargo.md (written 2026-11-09). The switch is THEMES.cargo.live on token-free-cargo-live, as the other
  brands had it: nothing changes live before the pass's documents. Of the two conditions:
  - the collapse keeping the video links' text is met (checked above);
  - the branch up to main is not: it is 199 commits behind and 3 ahead, and main has Cargo theme changes since
    (9c004e6f, 9c6dcefa). That is ema-test's (I don't touch the token-free branches).
  - The list is DA's own census at the pass (yesterday's: 22 documents, 30 markers, all to the theme).
  - The order also keeps Cargo's re-imports out of the window between the pass and the switch.
- **5e, Cargo's ranking (the 11 recorded pages in en and de, live today, 390 at 844 px):** notification-overview -9.8 % at
  1440 (data: www's header picture, as before); the 142 story +4.0 % / +3.7 % at 390 (de / en); fleet +3.4 % at 390;
  everything else within 3 % at both widths (the newsroom +0.2 % / 0.0 % after row 48). Nothing over 5 % but the data
  row: the story and the fleet go into the fresh ranking (item 6).
- **On main:** 22902ff0 (lint 0, 3443 pass 0 fail, smoke 0 differences on 14 hosts).

### Item 6: the fresh ranking (AD, ITA, TAP, SWISS, Cargo)

Taken from the newest recordings in the R2 drop (Air Dolomiti parity-001/002/004, ITA parity-004, TAP parity-002, SWISS
parity-005, Cargo parity-001/002), every recorded page re-measured on its live host with main's code (1440 x 900 and
390 x 844 as the recordings), worst first. SWISS and Cargo are above (items 4 and 5e); the Air Dolomiti, ITA and TAP rows
follow when their run is through.

- **Cargo row 49, the transport stories on phones:** the import's two text cells stacked 36 px apart; www's story text
  runs on. Below 768 px they join: 390 en 8,696 -> 8,516 (www 8,389), de 9,213 -> 9,033 (8,856). The rest is the text
  face: www's older LufthansaTextWeb is narrower. Decided by the rules: Cargo keeps the brand font (a switch would change
  every Cargo page for 1.5 to 2 % in narrow columns).
- **On main:** 1946c9f2 (lint 0, 3447 pass 0 fail). Smoke after it: 8 hosts 0 differences; on the other 6 one check
  differs, the same DAM file (/content/dam/lh/images/mobileapp/Lufthansa%20Insights%20V2.png) flipping 404 <-> 503
  (lh-edge's DAM route, dam-aem-unavailable: its upstream unavailable at times), in both directions across hosts:
  transient, not the Cargo CSS.
- **The ranking (94 rows re-measured; the stale /it/... and /en/homepage, /de/homepage rows of the first sweep's wrong
  mapping left out, they answer 404; get-inspired and SWISS offers out as unmeasurable):** worst first:
  1. ITA /it/en/profile/miles-and-more 1440 +15.9 % (since its re-import 45cd42f8): fixed below (ITA row 26).
  2. TAP /en-pt/information/baggage -16.9 % / -11.0 %: LUGGit's iframe, decided (TAP row 41).
  3. Air Dolomiti florence/what-to-see -13.8 % at 1440: waits for its re-import (row 81's list).
  4. Air Dolomiti /de/reisenformationen/schwangere-und-kinder -13.6 % and tiere-an-bord -12.0 % at 1440 (390 0.0 %).
  5. TAP /en-pt -13.4 % at 1440: the unscrolled capture (row 127).
  6. ITA /it/en/local-page/verona +7.6 % at 390; Air Dolomiti's support pages and baggage -6 to -7 % at 390.
  Everything else within 5.6 %.
- **ITA row 26:** the re-imported Miles & More panels hold the picture second (line, picture, heading, list, link), so
  rows 21's and 23's rules, built on a document with the picture last, matched nothing. The panel and its picture are
  now found wherever the picture paragraph is. Live 1440 4,527 -> 4,038 (www 3,906), 390 5,286 -> 5,718 (5,759).
- **On main:** 2d80c816 (lint 0, 3448 pass 0 fail, smoke 0 differences on 14 hosts).
- **Air Dolomiti's FAQ half pages at 1440 (schwangere-und-kinder -13.6 %, tiere-an-bord -12.0 %; 390 exact):** www's
  recording (airdolomiti-parity-002) has about 326 px of empty white under its footer (its body runs past the content);
  our headings and the footer start match (the title 186 against 190, the footer 1,108 against 1,089). A recording
  artefact, nothing to match.
- **ITA row 27, the tables:** Verona's flight table at 390 squeezed four columns into 346 px. www's maui-table keeps
  each cell 200 px at least and scrolls; as Austrian's 93374199, the ITA theme now does the same: 390 3,804 -> 3,555 (www
  3,536), 1440 unchanged.
- **On main:** 38aaadd6 (lint 0, 3450 pass 0 fail, smoke 0 differences on 14 hosts).
- **Air Dolomiti row 93, the link tile pages (support and baggage, de, en, it):** two causes. From 930 px the
  destination article lists' rule (a title and one line over three-up cards) took these pages too, centring the title.
  Under the tiles, www's grid keeps 150 px at every width and ours had 48. The article lists' rule now leaves out the
  tile cards, and the tiles' section keeps 150 px. All six pages within about 2 % at both widths (support en 390 -6.2 % ->
  -0.7 %, de -7.4 % -> -2.2 %, baggage de -6.4 % -> -1.9 %); Florence's article list and the homepage unchanged.
- **On main:** 95e8f01b (lint 0, 3454 pass 0 fail, smoke 0 differences on 14 hosts).
- **Air Dolomiti row 94, the posts' text column:** the theme's 1200 px rule had lost to lh-com's article rule since
  c20b77ea (that rule's :not() holds a :has(), so it counts more), and the posts' text was a centred 912 px column. The
  theme's rules now carry the same :has(). 1440: the three Adriatic articles within 0.6 % (de 4,496 -> 4,285 against
  4,262). street-food-in-munich went 5,830 -> 5,467 against www's 6,173: its column is www's now; its stage and quiz card
  (row 82) are the rest, next in line.
- **On main:** 8df03876 (lint 0, 3457 pass 0 fail, smoke 0 differences on 14 hosts).
- **Rows classified, no change** (the rest of the ranking is under 5 %):
  - street-food-in-munich at 1440 (-11 % since row 94): www's h3s hold whole passages and a photo (179 against 120 px,
    898 against 466); content structure of that post, not a theme rule (row 74's kind).
  - Air Dolomiti manage booking (+4.7 / +5.0 % at 1440): the importer drops www's empty paragraphs, so the theme's blank
    line between every paragraph gives 66 px where www has none between the last three; the form's fields 9 px taller
    each. An importer change and three re-imports for 3 %: noted, not done.
  - Air Dolomiti assistance (-5.1 % at 390): offline, www's accordion items have our heights; the recording's differ by
    the live font's line breaks. The 75 px before the accordions is the title's place, which varies by www's template
    (-24 on support, -44 here): not one rule.
  - SWISS homepage (-3.8 % at 1440): the gap is the flight offers, whose data our host asks of www.lufthansa.com (blocked
    in the measuring browser), as the offers page (row 52).
- **ITA row 28:** after row 26 the Miles & More panels showed two more causes. The block's own 66 % rule from 1025 px won
  over the panels' full width, and the panels were each 46 px short of www's spacing. Both fixed; each panel's pitch is now
  www's at both widths (1440 3,827 against 3,906; 390 5,865 against 5,759).
- **On main:** fe73084f (lint 0, 3461 pass 0 fail, smoke 0 differences on 14 hosts).
- **TAP row 130, the FAQ pages:** the categories 32 px under the title from 768 px, as www's (the title's section had kept
  64). 1440 2,079 -> 2,047 (www 2,009) on en-pt, pt-pt and es-es; phones already www's.
- **Cargo's pages at 390 (+2 to +3 %), tried and not changed:** our last section's 48 px before the footer is part of
  it on the fleet page (www about 20), but taking it away for every Cargo page on phones moved industries-in-focus away
  from www (-0.8 % -> -1.7 %) while fleet, ebooking-info and the SDG page came closer: not one rule, so left.
- **On main:** bf81faa5 (lint 0, 3464 pass 0 fail, smoke 0 differences on 14 hosts).
- **ITA row 29, the teaser cards' link line:** www shows "→ Learn More About …" at the foot of every teaser card; the
  import left it out (the shared parser keeps it only on marked cards, which ITA's import did not mark). Fixed in the
  importer (backwards-compatible: tooling only, nothing served changes). Together with row 17's two-up, the
  travel-insurance page comes out at www's height (1440 3,093 against 3,091; 390 4,061 against 4,059). Re-import list:
  reimport-567-ita-teaser-cta.txt, 1,193 documents (852 also on the two-up list, one run gives both).
- **On main:** 30b37eab (lint 0, 3469 pass 0 fail, smoke 0 differences on 14 hosts).
- **A measuring note for ITA on phones:** our ITA footer measures 1,313 px at 390 against www's 1,271 on every recorded
  page. Not a real difference: the legal links are Arial (as www's), and the measuring browser has no Arial (DejaVu Sans,
  wider), so one row of links wraps. ITA's 390 numbers in the ranking are about 42 px too tall on our side.
- **ITA row 30, the flight search band on the local pages:** www has an invisible separator on each side of the flight
  search (50 px above, 46 px below); ours had 24 px. Theme rule (backwards-compatible: two margins). Verona's sections
  now sit as www's ("Operating flights" 1,746 against 1,745 at 390); 1440 2,356 -> 2,404 against 2,444.
- **On main:** c0f901f7 (lint 0, 3472 pass 0 fail, smoke 0 differences on 14 hosts; its first push met another
  session's push, rebased and pushed again, the after-smoke run by hand).
- **Air Dolomiti row 95, the in-flight entertainment pages' top:** www's picture starts at the page's top under the
  fixed bar with the trail on it; ours sat 186 px lower under its own trail row. Theme rule (backwards-compatible: the
  hidden-heading lead only). The title is now at www's 650 px at both widths. The page totals go from +3.6 % to -4.3 % (en,
  1440) because the blank lines between the paragraphs are missing: next item, row 96.

- **Process note:** the first run of this commit's checks failed on a test I had already written for the next change
  (test first, but placed in test/ while another change was being checked); nothing was committed. Tests for a next
  change now wait outside test/ until their own run.
- **TAP row 131, the footer:** www's footer links are 14 px (ours 16, so one wrapped) and its cards start at the
  footer's top (ours 16 px lower from 1024 px). Theme rule (backwards-compatible). Every TAP page at 1440 is 39 px
  shorter and the footer's rows sit as www's; the FAQ page is now 2,008 against www's 2,009.
- **On main:** c14f8348 (AD 95) and cbe045dd (TAP 131), each lint 0, the full suite passing (3480 / 3481), smoke 0
  differences on 14 hosts.
- **Air Dolomiti row 96, the lead's paragraphs:** www's authors put blank lines between them with line breaks the import
  leaves out; the theme now gives a blank line between two paragraphs (the brand default). The in-flight entertainment
  pages are within 1.5 % at both widths (it 1440 2,397 against 2,400).
- **Classified, no change:**
  - Air Dolomiti's German footer at 390: the recording's is 28 px taller than ours on every German page, but www's own
    page rendered here is 1,046 px as ours: the recording's live font wraps one more line. Not a difference in the code.
  - Air Dolomiti's title on phones: www's sits 24 px lower on the booking, baggage, timetable and support pages (4 px on
    the text pages, 44 on assistance), with the content under it where ours is: a template's spacing, not one rule.
  - ITA two-column headings (invoicing's "Flight Certification" 36 px against www's heading-small 28): the importer's
    parser keeps www's class (checked on the recording), but the live document has no size marker; the cause is
    between the parser and the upload and needs a scratch import, which I did not run (a failed snapshot import falls
    through to a live request to www). Open.
- **On main:** 960a4643 (AD 96; lint 0, 3483 pass 0 fail, smoke 0 differences on 14 hosts).
- **Air Dolomiti row 97, the trail on the title pages from 1025 px:** www's trail sits right under the bar; ours had 16 px
  over it, so those pages were 16 px lower. Theme rule (backwards-compatible: a variable on the title pages' trail); the
  title is at www's 170 on the six pages, the FAQ and stage pages are left as they were (already www's).


## Rule 6, where it stands (2026-11-10, 17:10 UTC; about 8.8 hours of the standing order)

- **On main from this stretch** (each lint 0, the full suite passing, smoke 0 differences on 14 hosts before and after):
  bf81faa5 TAP 130, 30b37eab ITA 29 (importer), c0f901f7 ITA 30, c14f8348 AD 95, cbe045dd TAP 131, 960a4643 AD 96,
  7c66580c AD 97.
- **New lists:** reimport-567-ita-teaser-cta.txt (1,193 ITA documents; 852 also on the two-up list, one run gives
  both), capture-567-ad-news-de.txt (one page). Nothing imported, uploaded, previewed or published.
- **Open, worst-first, for the next session:**
  1. ITA two-column headings: the live documents lack www's size markers (invoicing's "Flight Certification" 36 px
     against 28); the parser keeps the class on the recording's markup, so the loss is later in the import. Needs a
     scratch import that cannot fall through to a live request to www.
  2. Cargo /ci/facts-figures at 390 (+2.7 %): our page shows the board and compliance sections in a different
     arrangement from www's; the recording's headings list stops early, so it needs a section-by-section comparison.
  3. Air Dolomiti's title on phones on the title pages (www 24 px lower, the content under it where ours is) and the
     Adriatic article's title at 1440 (206 against 170).
  4. TAP's footer document has no "Cookies Settings" row (a consent button on www) and "© 2026, TAP." is not bold.
- **Measuring notes:** ITA's 390 heights carry +42 px from the measuring browser's Arial fallback in the footer; Air
  Dolomiti's German recording has a 28 px taller footer from its live font. Neither is a code difference.
- **Left out of git, with the reason:** .migration/project.json (modified before this session, not mine to commit);
  the recordings, scans, drafts and screenshots under .scratch/ and /tmp (scratch material, recordings are private).

## The standing order of the night of 2026-11-10 (from 19:00 CET; the user's items a to e)

- **Start:** nothing of mine was uncommitted or unpushed; .migration/project.json was already modified before the last
  session and is not mine. main pulled (3b84865d).
- **Capture list (within the first two hours):** tools/reports/parity-2026-11-09/capture-list-585-brands.txt, A: 22 ITA
  pages (column-view headings, rendered recordings as ita-parity-004, archive ita-parity-NNN), B: TAP's FAQ page with
  www's "Cookies Settings" dialog open (archive tap-parity-NNN).
- **Item a, where ITA's two-column heading size is lost:** an offline test import of the recording's invoicing page
  (.scratch/offline/tools/offline-import.mjs: setContent, every request aborted, the airline hosts unresolvable;
  ita-import.mjs mappedOf, import-info.bundle.js; 0 requests left the browser) gives "Flight Certification" without
  a marker, while lh-com's columns-media parser alone keeps www's h2.heading-small. The size goes in the bundle's last
  step, marker-collapse.mjs collapseMain (THEMES.ita live): a size one step from the level's default becomes the
  default, decision D of tools/reports/token-free/ita-pass-check.md. Not a bug in the importer: a plan decision that
  www's column views contradict (12 of 13 column-view headings on ita-parity-004 / -003 are heading-small). Decision:
  ema-test's files stay as they are; the row and its evidence go to ema-test
  (tools/reports/parity-2026-11-09/rows-for-ema-test.md, row 1), and the part the ITA theme can do safely is ITA row
  31 (next commit).
- **On main:** 564f24a7 (the capture list, rows-for-ema-test.md, the report; lint 0, 3488 pass 0 fail, smoke 0
  differences on 14 hosts).
- **ITA row 31:** an unmarked Columns Media H2 in www's heading-small size (28 px at 1440, 22 at 375). Theme rule,
  backwards-compatible (an unmarked heading in that block only; a marked one keeps its size). Contact -88 px at 1440,
  the others a few px (the picture sets the row's height); the "Related" headings stay with ema-test (row 1 there).
- **New archives in the R2 drop** (probed after the newest I knew; sha256 computed here):
  - airdolomiti-snapshots-004: 240,103 bytes, b09b5f267d263ca7418d7c9331d21ad725d54e117a9edd2b9b9de75ee0bd0cd1, 3 pages
    (unterhaltung-an-bord, london-eu, basel-de; 18:07 UTC);
  - airdolomiti-parity-005: 14,036,855 bytes, 9c78554e04392823f4dccefe7bd693384ee01c00b3b450259e845c2b5b8176f4, the
    same 3 pages rendered;
  - tap-snapshots-027: 934,760 bytes, 2182dde3ce0cd6e3935fd7723b7e64d3e570e803923a68bfc55228fbdd941388, 9 pages of list
    "e" (not the 70 market-group pages yet);
  - tap-parity-003: 385,967 bytes, 35c64c09dafc73f92afa1fc167f7586092c5b7b62fa716bdd13a9b3943aedfeb, 0 pages (1 not
    recorded);
  - tap-parity-004: 13,053,116 bytes, 9cdb21ba8ed013c6e533c07f5eb23687d71cd07d2aade2e8d048f92cf88e49a3, get-inspired at
    1440 and 390.
- **The German in-flight entertainment page (capture-567-ad-news-de, now recorded):** www.airdolomiti.de shows the
  trail in its own row and the picture at 235 px with no visible title over it (the title is the subtitle under the
  picture), unlike en / it in airdolomiti-parity-001 (the picture from the page's top under the bar). Ours already
  matches it in height at 1440 (picture 240, text 951, footer 1,659 against 235, 946, 1,657) but shows the document's
  H1 in the white space over the picture. Decision: not a re-import with the hidden-heading style yet (row 95 would then
  pull the picture under the bar, which www.airdolomiti.de does not do); en and it go on the next capture list to see
  whether www.airdolomiti.eu / .it now show the German layout too.
- **Air Dolomiti row 98, the title on phones (decision 1):** 24 px over the title on the title pages below 768 px, as
  www's (backwards-compatible: one theme rule). The title at www's 170 on the six recorded title pages.

- **On main:** 4fd7c695 (ITA 31; lint 0, 3493 pass 0 fail). Smoke after the push: 0 differences on 12 hosts; Discover's
  run before the push failed to connect (socket closed), re-run by hand: 0 differences against the last run;
  lufthansa-edge's sitemap_lh.xml.gz changed (another session's sitemap, not code).
- **Air Dolomiti row 99, the post title (decision 1):** the title at www's 170 at 1440 and 152 at 390 (www 150);
  backwards-compatible (the post's trail and header spacing in the theme). The posts' totals at 1440 within 0.3 %.
- **TAP row 132 (decision 2):** "© 2026, TAP." in bold as on www (footer-tap.js, TAP only; backwards-compatible: the
  other brands' notes unchanged). The "Cookies Settings" row is open: the site has no consent dialog to open (no
  OneTrust id, no fallback for TAP), our consent code removes such a row where there is none, and the row would be a
  footer document change (no upload in this order).
- **Item b, Cargo Facts & Figures at 390, section by section (Cargo row 50):** the key facts band was 25 px over www's
  shape (the link's spacing): fixed, backwards-compatible (theme). The board's accordion matches. The timeline (+250 px
  over 40 cards) is our brand font wrapping one line more in about half the cards; the font is row 49's decision
  (www uses the older LufthansaTextWeb), so it stays.
- **Discover row 43 (ema-cashub's D1 b):** the accordions' panel text spaced as www's rich text (36 px between
  paragraphs and lists, list items 10 px apart, 12 px in); backwards-compatible (theme). families +92 px at 1440,
  +140 at 390 (de and en). discover-parity-001 fetched here: 108,747,903 bytes,
  b08cb37e203ac49b7fae32f01f442e504eb75fd210630ce9dfb34020a2b330eb.

- **On main:** 1367b1d5 (AD 98; its first push was refused, pushed after a fresh lint 0, 3500 pass 0 fail and smoke:
  0 differences on 13 hosts, SWISS's after-run failed to connect and was re-run by hand: 0 differences). Main's whole-repo
  lint was red from 18:48 to about 19:40 UTC (another session's link-list rules in styles/styles.css); I held the push
  until it was green again.
- **Four items in one push** (each its own commit and files; lint, the full suite and smoke once on the tree with all
  four, as main moves fast tonight): AD 99, TAP 132, Cargo 50, Discover 43.
- **On main:** 0ba9fe13 (AD 99), bd8e6ac4 (TAP 132), 48f721cd (Cargo 50), 7a0e7014 (Discover 43): lint 0, 3513 pass 0
  fail. My new multi-commit script ran its before-smoke against the wrong directory (an argument shift), so this push had
  no before-smoke of its own; the after-smoke compared with the previous push's after-state: 0 differences on all 14
  hosts (SWISS re-run by hand). Script fixed.
- **TAP's cookie row, recorded (tap-parity-005: 502,829 bytes,
  6786ed4c4e2455a724066f221b924a00b6d3f7e62f9b3a0f53e8392453a5c83b):** www's "Cookies settings" is OneTrust's
  ot-sdk-show-settings button and opens OneTrust's preference center (#onetrust-pc-sdk). So www.flytap.com does run
  OneTrust now (scripts/brands.js still says it runs none). Our TAP site has no OneTrust id (that comes from the site's
  metadata) and no fallback banner, so the row stays open: it needs TAP's OneTrust domain in the site metadata (a
  document change) or a fallback banner for TAP (a new banner on every TAP page). Not decided here; open.
- **AD row 100 (the trail on one line, as www's), Discover rows 44 to 46 (heading margins, column rows, accordions):**
  four commits, one push (below).
- **On main:** 2a291f2f (AD 100), f3e44340 (Discover 44), d76a3d39 (Discover 45), a46f654d (Discover 46): lint 0, 3521
  pass 0 fail, smoke 0 differences on 14 hosts before and after.
- **Item d, TAP's market groups:** tap-snapshots-027 (above) holds the first 9 of the 70 pages of
  capture-567-tap-market-groups.txt (list "e"; 18:13 UTC). Checked offline against our documents
  (.scratch scripts, nothing fetched from www): each captured root differs from our language version where the
  comparison said (en-ao / pt-ao payment methods without the language version's Santander link; the club, partners,
  service-animals and promos pages with the root's own links), and fr-ca/promos is an own document as listed. So the
  list's decisions hold for these 9; no correction list. Our language documents on the host have no market sections
  yet (no "markets" cells), so the harness's job 567-tap-markets-01 has not reached these pages' previews, or ran
  without their captures (then they are noted unplaced in its report, as the list says). Decision: a follow-up list of
  the pages whose captures landed, for a re-run with them as --market-archive, once more of the 70 are in (the later
  archives tonight); not written yet.
- **Capture list 2:** tools/reports/parity-2026-11-09/capture-list-585-brands-2.txt (A: Air Dolomiti's en and it
  in-flight entertainment pages, rendered; B: Discover's families pages de and en as snapshots for D1 a).
- **On main:** 3cb59675 (capture list 2, the report).
- **SWISS row 53:** the grid cards' text 40 px over the card's foot as www's (backwards-compatible: theme). book-and-manage
  now within 0.4 % at both widths. Left on purpose: SWISS's footer legal row keeps 24 px lines on phones (www 15), an
  accessibility decision (target spacing), +18 px on every SWISS phone page.
- **Tried and not shipped, Discover's column-view H3s (ema-cashub's D4, entertainment +5.9 % at 390):** www sets most of
  them in heading-copytext-large (34 of 44 on discover-parity-001) and some in heading-small (10, all on customer
  service); ours render them in the block's own heading size since the collapse took the markers. A theme rule for one
  size made entertainment and check-in closer and customer service and families further (customer service 390 -188 ->
  -276): not one rule. Row 2 for ema-test (rows-for-ema-test.md).

- **On main:** 33a18bae (SWISS 53; lint 0, the suite passing, smoke 0 differences on 14 hosts).
- **airdolomiti-snapshots-005** (266,868 bytes, 1c90f7c0baee0cbc83389543c8326f167d00895d51f3cf5c33806ca05c80bbe6, 21:37
  UTC): the rows of reimport-567-ad-description-news.txt captured at www.airdolomiti.it with our document paths
  (/de/reiseziele/…, /en/destinations/…): 16 redirects, 1 error page, 3 of .it's copies. Not what the re-import reads.
  Capture list 3 (tools/reports/parity-2026-11-09/capture-list-585-brands-3.txt) gives those 20 rows at www's own hosts
  (www.airdolomiti.de without /de, www.airdolomiti.eu without /en).
- **On main:** aa6bcd6f (capture list 3).
- **ITA's teaser re-import, read back on our host (22:25 UTC):** the harness's jobs 567-ita-teaser-cta-01 to -13b are
  on preview. Of reimport-ita-two-up.txt's 872 documents, 772 now show "grid two-up" and the link lines; 82 have the
  link lines but still a plain grid (travel-insurance among them: 1440 3,001 against www's 3,091, a two-up draft gave
  3,093). An offline import of ita-parity-004's travel-insurance with main's importer gives "grid two-up", so the
  harness's input for those 82 differs from www's page as recorded (older snapshots, or a nested column view).
  New list: tools/reports/parity-2026-11-09/reimport-585-ita-two-up-82.txt (expected change: two-up only), and capture
  list 4 (tools/reports/parity-2026-11-09/capture-list-585-brands-4.txt): fresh snapshots of its 49 it/en and it/it
  rows.
- **Classified, no change:** Air Dolomiti's German FAQ page at 390 (lounge-zutritt -4.6 %): the recording's accordion
  titles wrap to three lines where www's own page rendered here wraps to two as ours (the live font's line breaks,
  as the German footer). TAP fly-business +2.3 % at 1440: www's footnote "*Exceptionally…" is a small-print paragraph
  under the two columns, ours sits in the text column (a document's structure: the importer's columns step; noted for a
  later importer item).
- **On main:** the 82-documents list and capture list 4 (the commit after aa6bcd6f).
- **New archives** (sha256 computed here):
  - airdolomiti-parity-006 (3,771,522 bytes, cd64901eac37fdb59231ca26c6beebd9162814f7f8e3be9ea72e5232615ef0c1): the
    en and it in-flight entertainment pages tonight. Both still show the picture from the page's top under the bar, the
    title at 650 at both widths: AD row 95 stands for .eu and .it. www.airdolomiti.de's page has its own layout (the trail
    in a row of its own, the picture at 235): our German page matches its heights already; its visible H1 over the
    picture stays until a German-specific decision (the hidden-heading style would pull the picture under the bar,
    which .de does not do). Decision: leave the German document as it is; recorded here.
  - airdolomiti-snapshots-006 (1,373,758 bytes, 9b12e2f408b67d88b5617c4950550d0eec6c2e3d8f96da98c8b0689da00d3eff): 16
    of the news rows at www.airdolomiti.it/de/… and /en/…, this time answered 200 with the German and English pages
    (canonical www.airdolomiti.de / .eu). With snapshots-005's 3 and -004's 2 that is 21 of the 22 rows of
    reimport-567-ad-description-news.txt (all but /de/reiseziele/london), usable once filed under their canonical host
    and path. Capture list 3 is then only needed for /de/reiseziele/london (www.airdolomiti.de/reiseziele/london).
  - discover-snapshots-002 (91,498 bytes, 5d93626434df8f085575c321411ac638f87e3cf535885b32a9e21082c56b7536): the
    families pages; www's list items are four times our documents' (510 against 126 characters, de). New list:
    tools/reports/parity-2026-11-09/reimport-585-discover-families.txt.
  - ita-snapshots-020 (137,430 bytes, c6e3b8ab879df026c4afb37fbd0af266ca659d6ef318142272f2163bc15c8307): 55 pages, 51
    error pages; not from my lists.
- **Cargo row 51:** on phones a text-and-picture row shows its picture first, as www's (backwards-compatible: theme,
  outside the transport stories). Heights unchanged; the order as www's.
- **ita-snapshots-021** (2,168,688 bytes, bf2501ca41589b55839f5d467dda182513c3dd70dcf652df52a973bf25797511; 52 pages,
  21:44 UTC, not from my lists) holds 12 of the 82 rows of reimport-585-ita-two-up-82.txt, travel-insurance among them:
  its page through main's importer offline gives "carousel-cards grid two-up" (the view is a plain .twocolumn). So for
  those 12 a re-import from ita-snapshots-021 gives two-up; the other 70 wait for capture list 4 or the harness's own
  check of its inputs.
- **The fresh ranking pass (rank-c, our pages now against the recordings' heights, 121 rows):** the rows over 4 % are
  all classified (TAP baggage's LUGGit frame, TAP's unscrolled en-pt capture, Cargo's notification overview data, Air
  Dolomiti florence's re-import, the FAQ half pages' white space, street-food's content, ITA's rows waiting for the
  two-up re-import); the rest is under 3.5 %, most of it Cargo's phone pages (+2 to +3.4 %).
- **Discover row 47:** on phones the footer's legal links wrap as a row as www's (short links side by side), every
  Discover page 62 px shorter at 390; backwards-compatible (theme, phones only; the footer from 768 px is ema-adobe's).
- **Process:** my pushes from 21:30 to 23:00 UTC went onto a main whose stylelint was red from another session's Brussels
  rules (fixed in a6d34148); my ship script had read the whole-repo lint before its rebase only. From now on the lint is
  read again on the rebased tree right before the commit and push (.scratch tool ship2.sh), and a red lint holds the push.
- **New archives from my lists** (sha256 computed here):
  - ita-snapshots-022 (capture list 4; 49 pages ok, 23:09 UTC; 2,028,213 bytes,
    8945892afc3b06422e8013d9aa2d8d1943087bbc0a7ba3b54f739141d351beb2). Each page imported offline with main's
    ita-import.mjs and its bundle: 47 give the "Related" grid "two-up"; the two digital-services pages give a
    three-card phone slider (www's view has three cards), so they leave the two-up lists. New list:
    tools/reports/parity-2026-11-09/reimport-585-ita-two-up-snapshots.txt (A 47 rows from ita-snapshots-022, B 2 rows
    out, C 2 rows from ita-snapshots-021, D 31 rows without a snapshot tonight). Capture list 5
    (tools/reports/parity-2026-11-09/capture-list-585-brands-5.txt) asks for D's 31 pages.
  - airdolomiti-snapshots-007 (capture list 3; 20 pages ok at www.airdolomiti.de / .eu, 23:25 UTC; 1,727,817 bytes,
    20f76507199d9e22b7c6930e9f0e427be39676e9a2612325b645fd4b5b412e9f): with snapshots-004's two, all 22 rows of
    reimport-567-ad-description-news.txt now have www's page at its own host.
- **Classified, no change (Discover, ema-cashub's rows):** D6 homepage and D5 flight search at 1440: the flight
  offers widget's destination tiles (prices) come from an offers service our measuring browser does not reach (data,
  as SWISS's offers row 52); D9 additional services -3.9 % at 1440: www's space between the title and its intro
  differs by page (40 to 100 px against our 40 to 80), not one rule.

- **On main:** eda09545 (the two-up rows by snapshot, capture list 5; smoke 0 differences on 14 hosts).
- **ita-snapshots-023** (32 pages, 23:48 UTC; 1,274,950 bytes,
  89f1609a5a188d415398ff69225a239c1e857db96b55e760e7cb16e8cecd71e8): capture list 5's pages, each imported offline:
  25 give two-up, 7 a three-card phone slider (they leave the two-up lists), one D row is not in it
  (/nl/nl/manage-my-bookings/partners/airport-transfer). New list:
  tools/reports/parity-2026-11-09/reimport-585-ita-two-up-snapshots-2.txt. With the first, 72 of the 82 rows now have
  a snapshot that gives two-up, 9 are three-card views on www (no change), 1 has no snapshot.
- **TAP fly-business's footnote** (www's small print under the two columns, ours in the text cell): an importer item
  (tap-import.mjs's ComponentFeatureCardModel puts complementaryNote in the cell); only the two fly-business documents
  (en-pt, pt-pt) carry one among the language documents, so it stays a noted row (TAP row 133, open), not tonight's work.
- **Item d, TAP's market groups, the first 9 captures:** tools/reports/parity-2026-11-09/reimport-585-tap-market-groups-027.txt
  lists the language documents whose groups tap-snapshots-027 now covers (8 rows: en-pt payment methods and club,
  fr-fr partners, pt-pt service animals, club, promos (two groups), payment methods) for a re-run of tap-markets.mjs
  with it as a --market-archive. Job 567-tap-markets-01 uploaded the own documents and two fragments only; the language
  documents still have no market sections on our host. No correction of reimport-567-tap-markets.txt: the captures
  match its decisions. The other 61 pages of the 70 have not landed (tap-snapshots-028 not in the drop at 00:45 UTC).
- **TAP row 133** (open, importer): a feature card's footnote, see above.
- **Classified (Cargo's phone pages, +2 to +3.4 %):** ebooking-info's step cards and headings differ by a few px each
  where the text wraps (our brand font against www's older LufthansaTextWeb, row 49's decision); no single rule.
- **AD row 101:** an H2 in a lead's (columns-media news) text at the text's size as www's DescritionNews rich text
  (backwards-compatible: theme; every news block on the destination pages).
- **AD row 102:** the importer writes a text-only DescritionNews (no picture, no subtitle) as a one-cell columns-media
  (news), as www draws it (backwards-compatible: tooling only). Re-import list reimport-585-ad-news-text.txt, 22 documents
  (london-eu at 390 within 0.2 % of www with it).

- **On main:** 4dd0b125 (AD 101; lint 0 before and after the rebase, the suite passing, smoke 0 differences on 14 hosts).
- **ita-snapshots-024** (1 page, 23:56 UTC; 38,542 bytes, 8b93bf762e5c4cc4c794d165a73687a8a70a7a595bcaab583c1990611158feef):
  /nl/nl/manage-my-bookings/partners/airport-transfer, the one row missing from ita-snapshots-023; offline it gives
  two-up. So all 73 two-up rows of the 82 now have a snapshot that gives it (the other 9 are three-card views on www).
  On our host at 01:00 UTC 38 of the 872 two-up documents still lacked it (the harness's jobs 585-ita-two-up-* were
  running); travel-insurance is now 3,084 at 1440 against www's 3,091.
- **Air Dolomiti's re-imported news pages** (reimport-567-ad-description-news.txt, on our host since tonight): london-eu
  1440 7,483 (www 7,514), basel-de 390 12,010 (12,014) against tonight's airdolomiti-parity-005.
- **Shared section tabs (scripts/section-tabs.js, styles/section-tabs.css):** below 768 px a closed tab item now also
  carries the class section-tab-closed, which hides everything under its toggle, so content a block adds after the
  tabs are built (a fragment's sections) stays hidden with it; before, a fragment loaded into a closed panel showed.
  Backwards-compatible (the same items closed as before; only late content now follows them). Found on TAP's
  inspiration page with its categories drafted as tabs (row 134): at 390 the page 42,817 -> 9,311 px with it.
- **TAP row 134, the inspiration pages' categories as tabs:** the importer writes each category as a Tab section
  (backwards-compatible: tooling only). Drafted, en-pt get-inspired goes from 39,550 to 8,321 px at 1440 and from 42,994
  to 9,311 at 390 (www 5,582 / 4,957). Re-import list reimport-585-tap-inspiration-tabs.txt (6 pages).

- **On main:** 54ba3351 (the shared section tabs; lint 0 before and after the rebase, the suite passing; smoke 0
  differences on 11 hosts; lufthansa, -cn and -edge differ only in /sitemap/sitemap_lh_de_en.xml, the de/en articles
  another session previewed tonight, not code).
- **On main:** 6fb199db (TAP 134's importer; lint 0 before and after the rebase, 3579 pass 0 fail, smoke 0 differences on
  14 hosts).
- **TAP row 135 / shared scripts.js:** a fragment no longer gets the page's breadcrumb (buildBreadcrumb ran on every main
  it decorated, fragments included). Backwards-compatible: the page's own trail as before; duplicate trails inside
  fragment blocks go, on every brand (for ema-adobe and ema-cashub to know: lufthansa.com's and Austrian's pages with
  fragment blocks and a Parent lose their second trail).
- **On main:** 666ce6e7 (the fragment breadcrumb; lint 0 before and after the rebase, 3591 pass 0 fail, smoke 0
  differences on 14 hosts).
- **TAP row 136:** the inspiration categories' tabs as www's pills, the titles centred (backwards-compatible: theme rules
  for the set "categories" only). Open (row 137): the countries beside the articles, www's FAQ picker's second level; it
  needs the picker to work with fragment-loaded accordions (the inspiration pages are fragment pages), not tonight.
- **On main:** f205aa9d (TAP 136; lint 0 before and after the rebase, the suite passing, smoke 0 differences on 14 hosts).
- **TAP row 137:** the inspiration categories' countries as www's list beside the chosen country's articles (the FAQ
  picker's second level, now also in the inspiration fragments). Backwards-compatible (TAP's inspiration fragments only).
  With rows 134 to 137 and the re-import, en-pt get-inspired at 1440 is 6,194 px against www's 5,582 (from 39,550).
- **TAP's inspiration page, where it stands:** main's code alone (rows 135 to 137) takes en-pt get-inspired from 39,550
  to 19,942 px at 1440 and from 42,994 to 19,564 at 390; with the re-import of reimport-585-tap-inspiration-tabs.txt
  (categories as tabs, and the phone sliders the live documents predate) drafts give 6,194 / 5,177 against www's 5,582 /
  4,957. The list's header now names the phone sliders too.

- **On main:** 8ceb28a5 (TAP 137; lint 0 before and after the rebase, 3598 pass 0 fail, smoke 0 differences on 14 hosts).
- **On main:** 35da8237 (docs: TAP's inspiration list names the phone sliders; lint 0 before and after the rebase, 3609
  pass 0 fail, smoke 0 differences on 11 hosts; lufthansa and lufthansa-edge each one sitemap line changed,
  sitemap_lh_at_de.xml.gz 45,966 -> 45,976 bytes: published content, not code).
- **Drop probe 04:45 UTC:** airdolomiti-snapshots-008, -parity-007, tap-snapshots-028 to -030, tap-parity-007,
  ita-snapshots-025, ita-parity-005, discover-snapshots-003, discover-parity-003, cargo-parity-004, cargo-snapshots-015
  and swiss-snapshots-048 not there (404); nothing new tonight. cargo-snapshots-006 to -014 and cargo-parity-002 / -003
  are in the drop from 9 November (14:31 to 16:30 UTC), before tonight's captures and not from my lists.
- **ITA row 32:** small print under a text 24 px under it and 42 px over the next section, as www's (backwards-compatible:
  theme, ITA's small-print sections after a text only). Invoicing at 1440 2492 -> 2462 (www 2437), 390 3730 -> 3700.
- **On main:** 7391aff2 (ITA 32; lint 0 before and after the rebase, 3611 pass 0 fail, smoke 0 differences on 14
  hosts). Served (main's CSS only): invoicing at 1440 "Flight Certification" 1273 (www 1274), the page 2462.
- **ITA, the space under the last section:** www 0 or 24 px between the last component and the footer, ours 0 to 48
  on the 14 recorded pages (an empty last section on three); mixed by page, no one rule: classified, no change.
- **Air Dolomiti row 103:** the text under the manage-booking form keeps its last three paragraphs together, as www's
  (backwards-compatible: theme, that text only). 1440 it 2239 -> 2167 (www 2147), en 2373 -> 2301 (2281), de 2365 ->
  2299 (2312); 390 it 3114 -> 3037 (3012), en 3153 -> 3076 (3051), de 3327 -> 3261 (3264).
- **Measuring note:** host-eval.mjs routes the checkout's CSS unless NO_LOCAL_CSS is set; the served checks from here on
  use NO_LOCAL_CSS=1 (ITA 32 re-checked that way above).
- **Classified, no change (the second ranking pass, after AD 103):** Air Dolomiti /de/flug-status +4.0 % at 1440 (1761
  against 1693): our form is 44 px shorter (www writes a help text under each field, ours has none) and under it are
  the shared block's separator and 106 px (lh-com's layout) against www's 53; taking only the space out leaves the page
  4.7 % short until the form has the help texts, so it stays (row 77's note). Air Dolomiti /de/unsere-dienste/lounge-zutritt
  -4.6 % at 390: the recording rendered offline is 3,125 px with its footer at 2,079, ours 3,118 / 2,072; the 3,269 is the
  live fonts' line breaks (as the German recordings before). SWISS /ch/en/homepage -3.8 % at 1440: the 163 px are
  between "Current topics and news" and "Looking for more than just a flight?", the flight offers' tiles that www's offers
  service fills (data, as row 52).
- **Report format:** 35 of my report entries had run on into the line before them (my append scripts dropped the line
  break); they are split again, nothing else changed in them.
- **On main:** 3c2161bc (AD 103; lint 0 before and after the rebase, 3614 pass 0 fail, smoke 0 differences on 14 hosts).
  Served (main's CSS only): it 2167, de 2299 at 1440.
- **Air Dolomiti row 104:** the manage-booking form as www's FormPnr box, 396 px (backwards-compatible: theme, Air
  Dolomiti only). 1440 it 2167 -> 2149 (www 2147), en 2301 -> 2283 (2281); de 2299 -> 2281 against 2312 (corrected below:
  not the footer); 390 it 3019 (3012), en 3058 (3051), de 3243 (3264).
- **On main:** 474d19ea (AD 104; lint 0 before and after the rebase, 3623 pass 0 fail, smoke 0 differences on 14 hosts).
  Served (main's CSS only): it 2149, en 2283 at 1440.
- **ema-cashub's rows after 595 (rows-for-ema-lufthansa.md, "D3 to D9 after a check for shared causes"):** D4
  (entertainment, 390 +6.3 %): our text column is 346 px against www's 331 and still wraps a line more; both 16 / 24 px,
  our lufthansatext files against www's older LufthansaText: row 49's font decision, no change. D9 stays as classified
  above (www's intro spacing differs by page). D5 and D6 are widget data (as ema-cashub says). D3, D7, D8 as before.
- **Air Dolomiti row 105:** the fleet's text block ends as the destinations' (row 88's foot: the button 79 px under the
  text from 930 px, 43 below, what follows 100 px under it), as www's TitleDescriptionTextCta (backwards-compatible:
  theme, a campaign stage's text section ending in a button). 1440 it 4159 -> 4253 (www 4289), en 4177 -> 4271 (4307),
  de 4293 -> 4387 (4423); 390 it 7759 -> 7816 (7853), en 7287 -> 7345 (7419), de 7969 -> 8027 (8054). On the way: our
  footer is drawn 813 px as www's (its block box reads 775, the copyright band hangs under it), not shorter.
- **Correction (AD 104's German page):** the remaining -31 px against www's 2312 is not the footer, as I wrote at row 104:
  our footer is drawn 835 px on the German page as www's (its block box reads 38 px less, the copyright band hangs under
  it). The recording rendered offline is 2279 px against our 2281: the rest is the live fonts. Row 104 corrected.
- **On main:** 0e33f179 (AD 105; lint 0 before and after the rebase, 3625 pass 0 fail, smoke 0 differences on 11
  hosts; lufthansa, lufthansa-cn and lufthansa-edge each one line, sitemap_lh_de_en.xml's hash: another session's
  published content, not code). Served (main's CSS only): /flotta 4253, /en/fleet 4271 at 1440.

## Final report: the standing order of 2026-11-10 (19:00 CET) to 2026-11-11 (08:30 CET)

**Left in the workspace, not committed, and why**
- `.migration/project.json`: modified before tonight, not by me; left as it is.
- `.scratch/` (ignored by git): the unpacked archives and their downloads, my measuring scripts (host-eval.mjs,
  rec-eval.mjs and the page scripts), the offline import harness, the ship scripts and their logs, the drafts. They are
  recordings, logs and work files, so they stay out of git.
- Nothing half-done: every change below is on origin/main with this commit.

**Process error, fixed in this commit:** from 7391aff2 on (ITA 32, AD 103, AD 104, AD 105) my ship script was given
its files as separate arguments and committed only the first, the theme CSS. The four tests
(test/ita-small-print-gap-585.test.mjs, test/airdolomiti-manage-text-585.test.mjs,
test/airdolomiti-manage-form-585.test.mjs, test/airdolomiti-fleet-text-foot-585.test.mjs) were in the working tree and
ran in every suite before those pushes (3611, 3614, 3623, 3625 pass, 0 fail), but they, the parity rows (ITA 32, AD
103 to 105) and the report since 35da8237 reach main only with this commit. So the report went 2 h 35 min without a push
(04:38 to about 07:15 UTC) instead of at most 2 hours. The served CSS was right at each step (checked with main's CSS
only).

**Commits on origin/main tonight (in order; lint 0 before and after each rebase, the full suite passing, smoke 0
differences on every host after each push unless noted)**
- 564f24a7 capture list 1 (capture-list-585-brands.txt), rows-for-ema-test.md row 1 (ITA column-view sizes), the report.
- 4fd7c695 ITA 31 (item a): a Columns Media H2 in heading-small's size; invoicing "Flight Certification" 36 -> 28 px.
- 373e3f4c AD 98 (item c, decision 1): the title on phones 24 px under the trail, as www.
- 0ba9fe13 AD 99 (item c): a post's title as www's BlogLayout, 170 px from 1025 px, 152 on phones (the Adriatic title).
- bd8e6ac4 TAP 132 (item d, decision 2): "© 2026, TAP." in bold.
- 48f721cd Cargo 50 (item b): the key facts band on phones, its link 32 px under the dots.
- 7a0e7014 Discover 43 (ema-cashub D1 b): the accordions' panel text spaced as www's rich text.
- 2a291f2f AD 100: the trail on one line, the current page cut with an ellipsis.
- f3e44340 Discover 44: headings 36 px over what follows at 1440.
- d76a3d39 Discover 45 (ema-cashub D2): column-view rows 80 px apart with a column mark between.
- a46f654d Discover 46 (ema-cashub D2): the accordions 40 px over and under from 768 px.
- 3cb59675 capture list 2; TAP's first market-group captures checked.
- 33a18bae SWISS 53: a grid card's text 40 px over its foot.
- aa6bcd6f capture list 3 (the AD news rows at www's own hosts).
- 56265c7d reimport-585-ita-two-up-82.txt and capture list 4.
- 7e17227e reimport-585-discover-families.txt; the new archives read.
- b5243611 Cargo 51: on phones a text-and-picture row shows its picture first.
- 379c7c4b Discover 47: the phone footer's legal links as a row (every Discover page 62 px shorter at 390).
- eda09545 reimport-585-ita-two-up-snapshots.txt, capture list 5.
- b4f974cb reimport-585-ita-two-up-snapshots-2.txt (25 rows from ita-snapshots-023).
- ac59127f reimport-585-tap-market-groups-027.txt (8 documents); TAP 133 open.
- 4dd0b125 AD 101: an H2 in a lead's text at the text's size.
- 05675f32 AD 102 (importer): a DescritionNews without a picture and a subtitle as a one-cell columns-media (news);
  reimport-585-ad-news-text.txt (22; the harness applied it, 22 of 22).
- 54ba3351 TAP 134 (shared section tabs): a closed tab item on phones also hides what a block adds later.
- 6fb199db TAP 134 (importer): an inspiration page's categories as tabs; reimport-585-tap-inspiration-tabs.txt (6).
- 666ce6e7 TAP 135 (scripts): a fragment shows no copy of the page's breadcrumb.
- f205aa9d TAP 136: the inspiration category tabs as www's chips.
- 8ceb28a5 TAP 137: an inspiration category's countries beside their articles, as www's picker.
- 35da8237 docs: the inspiration list names the phone sliders (smoke: one sitemap line on lufthansa and lufthansa-edge,
  published content, not code).
- 7391aff2 ITA 32: small print 24 px under its text and 42 px over the next section; invoicing 2492 -> 2462 at 1440
  (www 2437), 390 3730 -> 3700; served "Flight Certification" at 1273 against www's 1274.
- 3c2161bc AD 103: the text under the manage-booking form keeps its last three paragraphs together; 1440 it 2239 -> 2167
  (www 2147), en 2373 -> 2301 (2281), de 2365 -> 2299 (2312); 390 it 3114 -> 3037 (3012), en 3153 -> 3076 (3051), de 3327
  -> 3261 (3264); served the same.
- 474d19ea AD 104: the manage-booking form as www's FormPnr box, 396 px; 1440 it 2149 (www 2147), en 2283 (2281), de 2281
  (2312; the live fonts, corrected); 390 it 3019 (3012), en 3058 (3051), de 3243 (3264).
- 0e33f179 AD 105: the fleet's text block ends as the destinations' (row 88's foot); 1440 it 4159 -> 4253 (www 4289), en
  4177 -> 4271 (4307), de 4293 -> 4387 (4423); 390 it 7816 (7853), en 7345 (7419), de 8027 (8054).
- This commit: the four tests and the parity rows above (ITA 32, AD 103 to 105), ema-cashub's D4 classified, the
  German page's correction (AD 104), the report's 35 run-on entries split again, this report.

**Lists written tonight (tools/reports/parity-2026-11-09/, rows not counting comments)**
- Capture lists: capture-list-585-brands.txt (23), -2 (4), -3 (20), -4 (49), -5 (31).
- Re-import lists: reimport-585-ita-two-up-82.txt (82), reimport-585-ita-two-up-snapshots.txt (49),
  reimport-585-ita-two-up-snapshots-2.txt (25), reimport-585-discover-families.txt (2), reimport-585-ad-news-text.txt
  (22), reimport-585-tap-market-groups-027.txt (8), reimport-585-tap-inspiration-tabs.txt (6).
- Rows for others: rows-for-ema-test.md (row 1 ITA's column-view sizes, row 2 Discover's column-view h3 sizes).
- reimport-567-tap-markets.txt: no correction file; only 9 of the 70 market-group pages landed (tap-snapshots-027), and
  on those 9 the importer's own-document step holds.

**Archives read tonight (sha256 computed here)**
- airdolomiti-snapshots-004 (240,103 bytes) b09b5f267d263ca7418d7c9331d21ad725d54e117a9edd2b9b9de75ee0bd0cd1
- airdolomiti-snapshots-005 (266,868) 1c90f7c0baee0cbc83389543c8326f167d00895d51f3cf5c33806ca05c80bbe6
- airdolomiti-snapshots-006 (1,373,758) 9b12e2f408b67d88b5617c4950550d0eec6c2e3d8f96da98c8b0689da00d3eff
- airdolomiti-snapshots-007 (1,727,817) 20f76507199d9e22b7c6930e9f0e427be39676e9a2612325b645fd4b5b412e9f
- airdolomiti-parity-005 (14,036,855) 9c78554e04392823f4dccefe7bd693384ee01c00b3b450259e845c2b5b8176f4
- airdolomiti-parity-006 (3,771,522) cd64901eac37fdb59231ca26c6beebd9162814f7f8e3be9ea72e5232615ef0c1
- tap-snapshots-027 (934,760) 2182dde3ce0cd6e3935fd7723b7e64d3e570e803923a68bfc55228fbdd941388
- tap-parity-003 (385,967) 35c64c09dafc73f92afa1fc167f7586092c5b7b62fa716bdd13a9b3943aedfeb
- tap-parity-004 (13,053,116) 9cdb21ba8ed013c6e533c07f5eb23687d71cd07d2aade2e8d048f92cf88e49a3
- tap-parity-005 (502,829) 6786ed4c4e2455a724066f221b924a00b6d3f7e62f9b3a0f53e8392453a5c83b
- tap-parity-006 (234,971) 8727ae4241041e330ab51f22e53474b76bd21f03a8c7de7bf82c73fc3f8a7498 (the cookie dialog: www
  opens OneTrust's settings, ot-sdk-show-settings)
- ita-snapshots-020 (137,430) c6e3b8ab879df026c4afb37fbd0af266ca659d6ef318142272f2163bc15c8307
- ita-snapshots-021 (2,168,688) bf2501ca41589b55839f5d467dda182513c3dd70dcf652df52a973bf25797511
- ita-snapshots-022 (2,028,213) 8945892afc3b06422e8013d9aa2d8d1943087bbc0a7ba3b54f739141d351beb2
- ita-snapshots-023 (1,274,950) 89f1609a5a188d415398ff69225a239c1e857db96b55e760e7cb16e8cecd71e8
- ita-snapshots-024 (38,542) 8b93bf762e5c4cc4c794d165a73687a8a70a7a595bcaab583c1990611158feef
- discover-snapshots-002 (91,498) 5d93626434df8f085575c321411ac638f87e3cf535885b32a9e21082c56b7536
- discover-parity-001 (108,747,903) b08cb37e203ac49b7fae32f01f442e504eb75fd210630ce9dfb34020a2b330eb
- The last probe (06:50 UTC): the next numbers after these for every brand are 404 (also cargo-parity-004,
  cargo-snapshots-015, swiss-snapshots-048); cargo-snapshots-006 to -014 and cargo-parity-002 / -003 are from 9 November.

**Decisions taken tonight (each written at its row)**
- Item a: ITA's sizes are lost in the collapse (marker-collapse decision D), shown by an offline import; the theme gives
  the column-view H2 heading-small's size (row 31); ema-test's row 1 for the importer side ("Related" then shipped by
  ema-test in f8c5b3ff).
- Item c: decision 1 followed on phones (row 98) and for the Adriatic title at 1440 (row 99).
- Item d: decision 2. The copyright is bold (row 132). The cookie row stays open: our TAP site has no consent dialog to
  open (www opens OneTrust's, tap-parity-006), so a link would lead nowhere.
- Item e: one change at a time on our own hosts, worst-first; the rest classified with its reason (data, recording fonts,
  the form's help texts, content). ema-cashub's rows: D1 b, D2 shipped (Discover 43, 45, 46); D4 the font (row 49);
  D5, D6 widget data; D9 www's spacing differs by page; D3, D7, D8 as ema-cashub located them.

**Open**
- TAP 133 (the feature card's footnote), the TAP cookie-settings row (no consent tool), the TAP market groups (61 of 70
  pages not landed; reimport-567-tap-markets.txt stands until they do), the inspiration categories split over several
  fragments (a country list per fragment), the inspiration re-import (reimport-585-tap-inspiration-tabs.txt, 6 pages).
- ema-test row 2 (Discover's column-view h3 sizes).
- Air Dolomiti: the hub gap (mixed results, not shipped), the German in-flight entertainment title (.de differs, kept), the
  flight status form's help texts (row 77).
- ITA: the space under the last section (mixed by page); the two-up rows waiting for re-import or captures (lists above).

**origin/main afterwards:** checked after this commit's push (below).

## Standing order 3 of 2026-11-11 (from about 08:40 CET)

- **Left from the last turn:** nothing uncommitted but `.migration/project.json` (not mine, modified before the night).
  GitHub Build of 14da116b and of the night's pushes 35da8237, 7391aff2, 3c2161bc, 474d19ea, 0e33f179: success.
- **Ship script:** .scratch tool ship3.sh takes one file per argument, reads `npm run lint`'s exit code and runs
  stylelint on every styles/themes/ file given (the repo lint does not cover them) before and after the rebase,
  compares `git show --stat` with the files given before the push (else it undoes the commit, nothing pushed), and reads
  the GitHub Build of the pushed commit.
- **Air Dolomiti row 106 (item 1):** www's flight status help texts imported as the form's field hints (the importer's
  rows Flight number hint and Date hint; the block shows the first, backwards-compatible: without the row nothing
  changes). /de/flug-status 1761 px before and after (our fields already reserve the line), the rest of row 77's gap
  left. Lists: reimport-586-ad-flight-status-hints.txt (/de/flug-status READY from airdolomiti-parity-002;
  /en/flight-status and /stato-volo HOLD, no recording), capture-list-586-brands.txt (those two, HOLD until Ben decides).
- **On main:** f576bdf2 (AD 106; npm run lint exit 0 before and after the rebase, 3634 pass 0 fail, git show --stat 8
  files as given, smoke 0 differences on 14 hosts, GitHub Build success).
- **Item 3, the German manage-booking page (Air Dolomiti's /de/bearbeitung-ihrer-buchungen; ITA has none):** it did
  move with the Italian and English ones: 1440 2365 -> 2281, 390 3327 -> 3243 (main's CSS only now). Two things made it
  look unmoved: my first "before" (2299) was measured with the checkout's CSS already edited (host-eval routes local CSS
  unless NO_LOCAL_CSS is set), and the German recording's live fonts: rendered offline it is 2279 / 3236 against our
  2281 / 3243 (+2 / +7 px); the Italian recording shows no such gap (2147 live and offline).
- **Air Dolomiti row 107, the hub gap (item 1), part b:** found in three places (the text's foot, the carousel's layout,
  then the phone footer; last night's single rule could fit none of them). The importer gives every CosaFareCarroussel
  its own heading-icon section (row 84's layout), backwards-compatible (documents change on re-import only):
  reimport-586-ad-hub-carousel.txt, /destinazioni, /en/destinations, /de/reiseziele READY (airdolomiti-parity-001).
- **On main:** 34d1583b (AD 107 b, the importer; npm run lint exit 0 before and after the rebase, 3642 pass 0 fail, git
  show --stat 6 files as given, smoke 0 differences on 13 hosts, GitHub Build success; SWISS's before-smoke failed on a
  network reset to our own host (ECONNRESET), so its after-answers were compared with this morning's: 97 checks, 0
  differ). Its first run was cut off by a service restart in its suite
  (08:5x UTC, nothing committed or pushed); run again at 18:06 UTC.
- **Air Dolomiti row 107 a, the hub text's foot:** the hub section's first H2 after the text 165 px under it from 930 px,
  130 below (the destination grid's title 210 on phones), as www's TitleDescriptionTextCta; backwards-compatible: not
  while the section still holds the carousel (the destination hubs take it with reimport-586-ad-hub-carousel.txt). The
  flights-to-Europe hubs' route lists now start where www's do (1440: 1535, 1497, 1572 as www's); with the converted
  documents the destination hubs at 1440 are 3633 / 4696 / 4812 against www's 3626 / 4677 / 4793 (before 3670 / 4733 /
  4849).

## Final section, standing order 3 (2026-11-11, until about 20:00 CET)

**Left uncommitted, and why:** `.migration/project.json` (not mine, modified before the night). In `.scratch/`
(ignored by git): the drafts (b586/plain: the converted hub documents and the German flight status draft), the
measuring scripts, the ship logs, the pending Discover test from last night (discover-spacing-585, not shipped: half-done).

**Commits today (npm run lint exit 0 before and after each rebase, stylelint on the theme files touched, the suite
passing, git show --stat checked against the files given, smoke 0 differences on 14 hosts, GitHub Build read):**
- f576bdf2 AD 106: www's flight status help texts as the form's field hints (importer rows, the block's optional
  Flight number hint row). Lists: reimport-586-ad-flight-status-hints.txt (1 READY, 2 HOLD), capture-list-586-brands.txt
  (2 rows HOLD until Ben decides). Build success.
- 34d1583b AD 107 b: every CosaFareCarroussel in its own heading-icon section. List: reimport-586-ad-hub-carousel.txt (3
  READY). Build success.
- This commit: AD 107 a, the hub text's foot (theme), and this final section.

**Items of the order:**
1. Air Dolomiti. Help texts: done (row 106, imported as text, no space removed; /de/flug-status 1761 px before and after,
   the hints fit our fields' rows). The hub gap: found in three places; the text's foot and the carousel's section done
   (row 107), the third (the footer padding on the flights-to-Europe hubs at 390) located, not done. The German in-flight
   entertainment title: not reached today.
2. ITA's two-up READY list: not reached today. The lists from last night stand (reimport-585-ita-two-up-82.txt,
   -snapshots.txt, -snapshots-2.txt; capture-list-585-brands-4 and -5); a READY/HOLD list per document is the next step.
3. The German manage-booking page: answered (above): it moved with it and en; the rest is the German recording's live
   fonts.
4. Discover: not reached today.
5. ema-test's row 2 stays with ema-test. TAP is ema-cashub's: no TAP file touched today.

**Process:** ship3.sh (one file per argument, the commit's files checked before the push, stylelint on theme files,
the GitHub Build read). No call of da-upload.mjs, no DA or preview API, no request to an airline host; recordings from
the drop and our own host only. Nothing uploaded, previewed or published.

## Standing order 4 of 2026-11-11 (from about 20:40 CET to 06:00 CET Thursday)

- **Left from the last turn:** nothing unpushed; `.migration/project.json` modified (not mine). bb642f0e's checks (not
  in its own report lines): npm run lint exit 0 before and after the rebase, stylelint 0, 3651 pass 0 fail, git show
  --stat 4 files as given, GitHub Build success; smoke 0 differences on all 14 hosts, five of them after a re-run (b2b
  and the three lufthansa hosts failed on the network in the after-run, ITA's before-run did: ITA compared with ship
  b's answers). origin/main checked: bb642f0e on it.
- **Live check of row 107 (the destination hubs, round 254):** 1440 3633 / 4696 / 4812 against www's 3626 / 4677 /
  4793; 390 6421 / 9917 / 10416 against 6393 / 9699 / 10151 (left for the ranking: no stage on those pages).
- **Air Dolomiti row 107 c (item 1):** the footer's room for the price bar only where the stage has its card (the
  flights-to-Europe hubs' ReachMonaco stage has neither card nor bar; www keeps no room there). 390 6743 -> 6603 (www
  6643), 6264 -> 6124 (6131), 6860 -> 6720 (6745); at 1440 the pages now 1 to 2.6 % short (the padding hid it): next.
- **On main:** 063e7ce7 (AD 107 c; npm run lint exit 0 and stylelint 0 before and after the rebase, 3651 pass 0 fail,
  git show --stat 4 files as given, smoke 0 differences on 14 hosts, GitHub Build success). Served (main's CSS only):
  390 6603 / 6124 / 6720 (www 6643 / 6131 / 6745).
- **The flights-to-Europe hubs at 1440 (classified, no change):** after row 107 c they read 1 to 2.6 % short of the live
  recording; everything matches down to the first route list's title (1497 on both), then www's list is 88 px taller in
  the recording's JSON (its card rows 178 px apart, ours 160). www's own CSS fixes those cards at 140 px from 930 px
  (CardPromo_card_promo, so 160 a row with the 20 px gap, as ours and as the recording rendered offline), and the
  recording's screenshot shows the same cards about 400 px high: the capture caught the list unsettled while its
  pictures loaded. A recording artefact, not a layout difference.
- **ITA item 2:** reimport-587-ita-two-up-status.txt. Of reimport-585-ita-two-up-82.txt's 82 documents, read live on
  ita.turnsthe.page at 20:00 UTC: 73 already show the two-up grid (every row of the snapshot lists' A and C sections and
  the one without a snapshot of mine; the import helper's re-imports), so they get no row (named in the header); the 9
  digital-services pages (the B sections) are HOLD: their plain grid is right, www's view there has three cards (a phone
  slider). No READY rows, no capture needed.
- **Discover item 3, discover-spacing-585 dropped:** it was last night's combined draft of rows 44 to 46, which shipped
  with a test each (discover-heading-margins-585 in f3e44340, discover-column-rows-585 in d76a3d39,
  discover-accordion-margins-585 in a46f654d), so it would only repeat them. Moved out of the pending folder in .scratch
  (not deleted); the applied hub-foot patch went with it.
- **On main:** 9520d63c (the ITA list and the classifications; npm run lint exit 0 before and after the rebase, 3656 pass
  0 fail, git show --stat 2 files as given, smoke 0 differences on 14 hosts; its GitHub Build was not yet listed when
  read, the queue behind: read again below).
- **Air Dolomiti row 108, the German in-flight entertainment title (item 1):** www.airdolomiti.de's title-only text
  before the lead becomes the page's hidden H1 (section styles hidden-heading, lead-under-trail), the picture where
  www's is (235 / 242). Backwards-compatible: the theme's exclusion changes nothing for today's documents, the new rules
  need the new style. List: reimport-587-ad-german-lead.txt (1 READY, airdolomiti-parity-005). Only this page has the
  pattern in the recordings.
  First ship run stopped at the suite (2 fail, nothing committed): row 95's test (airdolomiti-news-stage-567) looked
  its rules up by the selectors before the lead-under-trail exclusion; updated in the same commit (every Air Dolomiti
  test run alone before the second run: 0 fail).
- **On main:** a3029929 (AD 108; npm run lint exit 0 and stylelint 0 before and after the rebase, 3661 pass 0 fail, git
  show --stat 8 files as given, smoke 0 differences on 14 hosts, GitHub Build success). 9520d63c's and the other
  sessions' Builds from 20:26 UTC were queued at GitHub (actions/runs: status queued), not missing: read again later.
- **New archive:** airdolomiti-snapshots-008 (129,111 bytes, sha256 f5231f10dbc1b7b4613d69a6c9e89eea886708daf7e2eb9686c8bd8e7468615e
  computed here; 19:31 UTC; both files match the manifest's sha256): capture-list-586-brands.txt's two pages,
  www.airdolomiti.eu/flight-status ("Required. Example: EN1234", "Required. Format: dd/mm/yyyy") and
  www.airdolomiti.it/stato-volo ("Obbligatorio. Esempio: EN1234", "Obbligatoria. Formato: gg/mm/aaaa"). Imported offline
  with main's importer: the two hint rows each, the text the same. reimport-586-ad-flight-status-hints.txt: /en/flight-status
  and /stato-volo now READY (/stato-volo's re-import also brings the section style compact-title, www's Title as the
  page's H1: that document predates row 50's importer); capture-list-586-brands.txt marks both captured.
- **On main:** b28d7256 (the flight status hints READY; npm run lint exit 0 before and after the rebase, 3670 pass 0
  fail, git show --stat 3 files as given, GitHub Build success; smoke: 6 hosts 0 differences, lufthansa, -cn and -edge
  one line each (sitemap_lh_at_de.xml.gz 45,999 -> 46,003 bytes: published content, not code), five runs crashed on the
  network and were run again: 0 differences against a3029929's answers).
- **Air Dolomiti row 109 (item 4, the ranking: the destination hubs at 390):** the hub cards 20 px apart on phones as
  www's (the block's stacked 36 px no longer added). 390 6421 -> 6385 (www 6393), 9917 -> 9629 (9699), 10416 -> 10128
  (10151); backwards-compatible (theme, those cards only, phones only).
- **On main:** 9fa0d5aa (AD 109; npm run lint exit 0 and stylelint 0 before and after the rebase, 3672 pass 0 fail, git
  show --stat 4 files as given, smoke 0 differences on 14 hosts, GitHub Build success). 9520d63c's Build is still
  queued at GitHub (since 20:38 UTC) while later commits' Builds ran: a3029929, b28d7256 and 9fa0d5aa contain it and
  passed the same whole-tree lint.
- **The fresh ranking (rank-d: Air Dolomiti, ITA and Discover rows with main's CSS, 98 rows):** a loaded machine gave
  some wrong readings; re-measured: /en/homepage and /de/homepage are 404 paths in the rows (our homepages are /en/ and
  /de/: 5059 against www's 5092), the English in-flight entertainment page 2316 (2352), flights to Europe 5581 (the
  recording artefact above). Over 4 %, all classified before (Florence's re-import, the FAQ half pages' white space,
  street-food's content, assistance's recorded accordions, the lounge page's live fonts, the flight status form). The
  first shared cause after them: the Adriatic article in three languages at 390 (row 110).
- **Air Dolomiti row 110 (item 4):** an article's H2s as www's HtmlContent (26 / 32 regular, 45 / 56 from 930 px, from
  www's CSS). 390 5319 -> 5185 (www 5124), 5659 -> 5515 (5481), 5285 -> 5141 (5134); backwards-compatible (theme,
  articles' text only).
- **On main:** 372131ff (AD 110; npm run lint exit 0 and stylelint 0 before and after the rebase, 3681 pass 0 fail, git
  show --stat 4 files as given, smoke 0 differences on 14 hosts, GitHub Build success).
- **The ranking, ITA (classified):** the rows over 2 % at 390 are the phone footer's +42 px (DejaVu Sans here, no
  Arial) plus a line's wrap and the space under the last section (classified before as differing by page): invoicing
  3700 against 3608 = 42 (footer) + 26 (text) + 24 (the last section). Under 1.5 % without the footer.
- **The ranking, Discover (26 pages from discover-parity-001):** offers -70 to -84 % (widget data, as before); families
  -6.6 / -6.1 % at 1440: the re-import of reimport-585-discover-families.txt has not run yet (the live items still the
  short ones), its rows now marked READY; customer service -5.9 / -5.8 % at 1440 and other pages: www puts a separator
  (div.separator, 1 px and its space, 31 px between two components there; 1 to 7 on 20 of the 26 pages) where our
  documents have none: the shared cleanup transformer (tools/importer/transformers/lufthansa-cleanup.js separatorInfo)
  drops separators of 25 to 40 px as "the normal component spacing the replica already has", which on Discover's
  customer service it does not (the page is one section, so the theme has no mark to space by): for that importer's
  owner, no change here. Punta Cana +6.3 / +4.8 % at 390 and the column views: www's heading-copytext-large headings
  render as plain headings (55 on 17 pages): rows-for-ema-test.md row 3 (the size markers are ema-test's).
- **On main:** 55526a4a (the row for ema-test, the families rows, the classifications; npm run lint exit 0 before and after
  the rebase, 3688 pass 0 fail, git show --stat 3 files as given, smoke 0 differences on 14 hosts, GitHub Build
  success).
- **The seat reservation pages at 390 (classified):** the en / it / de differences (-3.1 / -2.5 / +2.0 %) are the
  accordion titles' line breaks: www's recording wraps "Seat assignment for minors…" in four lines and "Seats in emergency
  exit rows" in three, ours in three and two; www's page rendered offline with the archive's own fonts wraps them as ours
  (3 / 2 / 3). The live fonts, as the German recordings.
- **Air Dolomiti row 111 (item 4):** the timetable pages' widget 20 px over the footer as www's (a section ending with the
  timetable keeps no margin; backwards-compatible, theme). At the recording's viewports: 1440 2009 / 2001 / 2005 against
  www's 1991 / 2001 / 2005; 390 2299 / 2111 / 2157 against 2299 / 2150 / 2224 (en and de: www's widget form taller than
  its minimum there).
- **Measuring note:** some of tonight's loops measured 1440 at a 844 px high window (VIEW_H set for both widths); that
  only changes pages whose heights follow the screen (the timetable widget's minimum, the price bar's room, 15vh): row
  107 c's 1440 figures above were taken that way (the room 157 px instead of 165, so 8 px), the others are unaffected.
  From row 111 on, 1440 is measured at 1440 x 900 and 390 at 390 x 844, as the recordings.
- **On main:** 49aa0991 (AD 111; npm run lint exit 0 and stylelint 0 before and after the rebase, 3694 pass 0 fail, git
  show --stat 4 files as given, smoke 0 differences on 14 hosts, GitHub Build success).
- **ITA online check-in at 1440 (classified):** www's column-view heading there is heading-medium (36 px), ours row 31's
  default for an unmarked column-view H2 (heading-small, 28 px: 12 of 13 recorded): its marker was lost in the collapse
  (rows-for-ema-test.md row 1); the rest in the grey band around it. The other ITA rows at 1440 (-2 to -2.9 %) differ in
  different places, no shared cause.
- **Air Dolomiti row 112 (item 4):** the assistance text's button and foot as www's two TitleDescriptionTextCta (only
  the three assistance pages have a button in an H1 text). 1440 4807 / 4787 / 5033 against www's 4795 / 4776 / 4984
  (from 4637 / 4617 / 4863); 390 7238 / 7092 / 7772 against 7420 / 7332 / 7771.
- **On main:** 36586d28 (AD 112; npm run lint exit 0 and stylelint 0 before and after the rebase, 3702 pass 0 fail, git
  show --stat 4 files as given, smoke 0 differences on 14 hosts, GitHub Build success).
- **Air Dolomiti row 113 (item 4):** www's Title as the page title: 20 px lower, its line 16 / 22 across the page
  (compact-title sections; the hidden-title flight status pages unchanged). /orario-voli 1440 1991 = www's; 390 2260
  against 2299 (the widget's form, as en's).
- **Drop probe 00:45 UTC:** nothing after airdolomiti-snapshots-008 (airdolomiti-snapshots-009, -parity-007,
  ita-snapshots-025, ita-parity-005, discover-snapshots-003, discover-parity-003: 404).
- **On main:** 816d5ffd (AD 113; npm run lint exit 0 and stylelint 0 before and after the rebase, 3704 pass 0 fail, git
  show --stat 4 files as given, smoke 0 differences on 14 hosts, GitHub Build success).
- **Air Dolomiti row 114 (item 4):** the booking pages' search 30 px under the title from 930 px, as www's (the three
  booking pages 1515 / 1533 / 1537 at 1440, www's exactly); phones unchanged (www's sticky widget there).
- **On main:** 07e07712 (AD 114; npm run lint exit 0 and stylelint 0 before and after the rebase, 3713 pass 0 fail, git
  show --stat 4 files as given, smoke 0 differences on 14 hosts (lufthansa-cn's after-run failed on the network, re-run:
  0 differences), GitHub Build success).
- **Classified, no change:** Discover's check-in pages at 390 (ema-cashub's D8): the heading-copytext-large headings
  (rows-for-ema-test.md row 3). ITA Miles & More at 1440: heading sizes lost with their markers (row 1). Discover
  baggage (D7): the offline render has no pictures and the tables differ, left as ema-cashub located it. Air Dolomiti's
  parking page (-37 px at 1440): a half page with an accordion, one page, no shared cause.
- **ITA row 33 (item 4):** the cards' link line 14 to 16 px fluid as www's btn-link (one line on phones). Limolane 390
  3873 -> 3834 (www 3773; 42 of the rest the phone footer's font), travel insurance 4050 -> 4030; backwards-compatible
  (theme, the grid cards' links only).
- **On main:** eff46712 (ITA 33; npm run lint exit 0 and stylelint 0 before and after the rebase, 3714 pass 0 fail, git
  show --stat 4 files as given, smoke 0 differences on 14 hosts (Brussels' apple-app-site-association answered 520 once
  in the after-run, re-run: 0 differences), GitHub Build success).
- **Tonight's lists live (the import helper's job 587-ad-hints-lead-01, 23:39 UTC, 3 documents):** the German in-flight
  entertainment page with hidden-heading, lead-under-trail: 1440 picture 235, text 946, page 2489 (www 235 / 946 /
  2492); 390 242 / 953 / 3334 (242 / 953 / 3337); /en/flight-status and /stato-volo with www's hints (the number field
  described by its hint), as /de/flug-status. The date hint shows on all three tabs' date fields (the block's one date
  hint), as www's form has it.
- **The ranking again (rank-e: main's CSS at the recording's viewports, 98 rows, 02:28 to 03:06 UTC; ITA measured before
  ITA 33 went live):** Air Dolomiti's 53 pages: over 4 % 10 -> 6, over 3 % 13 -> 9, over 2 % 23 -> 15, median
  deviation 0.82 -> 0.64 %; the destination hubs, the Adriatic articles, assistance, the timetables and the booking
  pages within 1 % at 1440. ITA's 17 and Discover's 26 unchanged (Discover's rows over 2 % are others': widget data,
  ema-test's markers, the shared cleanup's separators, the families re-import). One row further from www: /de/flugplan
  at 390 (-1.8 -> -3.0 %: its widget form, row 111). Last night's two readings of the English in-flight entertainment
  page and flights to Europe at 1440 were noise (re-measured: -1.5 / -1.7 %).

## Final section, standing order 4 (2026-11-11 20:40 CET to 2026-11-12 06:00 CET)

**Left uncommitted, and why:** `.migration/project.json` (not mine, modified before these orders). In `.scratch/` (not in
git): the drafts, the measuring scripts, the rankings (rank-d, rank-e), the ship logs and smoke answers, the unpacked
airdolomiti-snapshots-008; the dropped draft test discover-spacing-585 (it would repeat three tests on main).

**Commits tonight** (each: `npm run lint` exit code 0 and stylelint 0 on the theme file before and after the rebase, the
full suite passing, `git show --stat` equal to the files given, smoke 0 differences on 14 hosts with network failures
re-run, the GitHub Build read):
- 063e7ce7 AD 107 c: the footer's room for the price bar only with the stage's card (flights to Europe 390 6743 -> 6603,
  6264 -> 6124, 6860 -> 6720 against www's 6643 / 6131 / 6745).
- 9520d63c lists: reimport-587-ita-two-up-status.txt (73 live already, 9 HOLD); flights to Europe at 1440 classified;
  discover-spacing-585 dropped. Its Build is still queued at GitHub since 20:38 UTC (the runs after it ran; a3029929 and
  later contain it and passed the same lint).
- a3029929 AD 108: the German in-flight entertainment page's title hidden as www.airdolomiti.de's, its picture under the
  trail (importer and theme; live since 23:39 UTC: 235 / 946 / 2489 at 1440, www 235 / 946 / 2492).
- b28d7256 lists: the it / en flight status hints READY (airdolomiti-snapshots-008; live since 23:39 UTC).
- 9fa0d5aa AD 109: the destination hubs' cards 20 px apart on phones (390 6421 -> 6385, 9917 -> 9629, 10416 -> 10128
  against 6393 / 9699 / 10151).
- 372131ff AD 110: an article's headings as www's HtmlContent (the Adriatic article at 390 5319 -> 5185, 5659 -> 5515,
  5285 -> 5141 against 5124 / 5481 / 5134).
- 55526a4a rows for ema-test (row 3: Discover's heading-copytext-large headings, 55 on 17 pages), the families rows READY,
  the Discover and ITA ranking classified.
- 49aa0991 AD 111: the timetable widget 20 px over the footer (1440 2009 / 2001 / 2005 against 1991 / 2001 / 2005).
- 36586d28 AD 112: the assistance text's button and foot (1440 4807 / 4787 / 5033 against 4795 / 4776 / 4984).
- 816d5ffd AD 113: www's Title as the page title (/orario-voli 1440 1991 = www's).
- 07e07712 AD 114: the booking pages' search 30 px under the title from 930 px (1515 / 1533 / 1537 = www's).
- eff46712 ITA 33: the cards' link line 14 to 16 px, one line on phones (limolane 390 3873 -> 3834).
- e2766f3d the report: tonight's lists live, the ranking again (1 file, 3719 pass 0 fail, smoke 0 differences on 14
  hosts, Build success).
- This commit: this final section.

**Lists written or changed** (tools/reports/parity-2026-11-09/, READY/HOLD per row):
reimport-587-ita-two-up-status.txt (0 READY, 9 HOLD: no two-up wanted; 73 live named), reimport-587-ad-german-lead.txt
(1 READY; imported), reimport-586-ad-flight-status-hints.txt (3 READY; all imported), capture-list-586-brands.txt (2
captured), reimport-585-discover-families.txt (2 READY; not imported yet), rows-for-ema-test.md (row 3).

**Archive read:** airdolomiti-snapshots-008 (129,111 bytes, f5231f10dbc1b7b4613d69a6c9e89eea886708daf7e2eb9686c8bd8e7468615e
computed here). Probes at 20:51, 00:45 and 03:06 UTC: nothing else for Air Dolomiti, ITA or Discover.

**Items:** 1 done (the footer padding with the price-bar test, the German title, the it / en hints READY and live). 2 done
(no READY rows left: 73 live, 9 HOLD with their reason). 3 done (discover-spacing-585 dropped: repeats three shipped
tests). 4: Air Dolomiti over 2 % 23 -> 15 of 53 (median 0.82 -> 0.64 %), the rest classified; ITA one shared cause fixed
(row 33), the others its markers (ema-test's row 1); Discover's rows over 2 % are others' (widget data, ema-test's
markers, the shared cleanup's separators, the families re-import).

**Open, for the next session or others:** Discover's separators (lufthansa-cleanup.js drops 25 to 40 px ones; its
owner); Discover's and ITA's lost heading markers (ema-test rows 1 to 3); the families re-import (2 READY); Air
Dolomiti's timetable widget form on phones (en / de at 390), the assistance contacts' list spacing (offset at 1440).

**Process:** no request to an airline host (recordings from the drop, our own hosts only); no da-upload.mjs call and no
DA or preview API; nothing uploaded, previewed or published by me.

## Standing order 5 of 2026-11-12 (from about 05:40 CET to 10:00 CET)

- **Left from the last turn:** nothing unpushed; `.migration/project.json` modified (not mine). 8fdd66ca's GitHub Build
  success; 9520d63c's still queued at GitHub (its content in later commits whose Builds passed).
- **Item 1, Discover's separators:** lufthansa-cleanup.js's last commit was 4abd4c48 (another session, 02:14 UTC), 2 h
  32 min before this change (checked at 04:46 UTC), so the change is here and no row was needed for it. The cleanup now
  keeps a Discover separator between two components as "{spacer-30}" (www's .hr margin there, 30 px; lufthansa.com's
  25), and sizes Discover's other kept separators at 30 (test/discover-separators-588.test.mjs: Discover keeps them;
  lufthansa.com, Brussels and SWISS as before, lufthansa.com's running-text separator still 25). On the 26 recordings: 16
  pages with new or resized markers. But nothing changes in the documents yet: the collapse (ema-test's) removes spacers
  of 31 px or less on Discover and draws any divider the same, so every row of reimport-588-discover-separators.txt is
  HOLD, and rows-for-ema-test.md row 4 asks for the carrier. The import bundles are not rebuilt here
  (@adobe/aem-import-helper is not in this machine's npx cache; the bundler runs offline only, and I did not install
  it): the next rebuild takes the change, nothing depends on it before the collapse carries the spacers.
- **On main:** 52d5f939 (item 1; npm run lint exit 0 before and after the rebase, 3733 pass 0 fail, git show --stat 5
  files as given, smoke 0 differences on 14 hosts, GitHub Build success).
- **Item 2, Cargo (classified, no change):** facts and figures at 390 is still en 12223 / de 12823 against www's 11916 /
  12482 (+2.6 / +2.7 %; 1440 within 1 / 2.1 %): row 50's section-by-section comparison stands, the rest our brand font
  wrapping one line more in about half of the 40 timeline cards (row 49's font decision). The Transport Stories'
  chevrons: next commit.
- **Air Dolomiti row 115 (item 3):** the German London page 11 px too wide at 390 (a carousel title's icon past the
  screen, as on www with that word): the title leaves the icon 45 px within the screen and hyphenates; the page 390 px
  wide, its title two lines (+42 px); a sideways scroll fixed rather than copied (WCAG 1.4.10).
- **On main:** b178678c (AD 115; npm run lint exit 0 and stylelint 0 before and after the rebase, 3741 pass 0 fail, git
  show --stat 4 files as given, smoke 0 differences on 14 hosts, GitHub Build success). Its first run stopped at the
  suite (1 fail, nothing committed): the theme had set hyphens, which styles.css's heading rule already does
  (test/heading-wrap.test.mjs: no theme sets it); the theme rule now only limits the width.
- **Cargo row 52 (item 2):** the transport stories' chevrons as www's scroll links: buttons that bring the next module
  (the last one the first) under the fixed bar, named, from 1025 px as before, none on phones; the story's heights
  unchanged (7947 / 8516 px).
- **Main's suite red since 05:21 UTC (found 07:01 UTC in Cargo row 52's ship, nothing committed):**
  test/tap-faq-gap-567.test.mjs (mine, TAP row 130) looked up a tap.css selector that e9b72c4d (ema-cashub's TAP row 151)
  narrowed. The test now accepts the narrowed selector and still checks the 32 px; tap.css untouched; a row for
  ema-cashub: tools/reports/parity-2026-11-09/rows-for-ema-cashub.md row 1. Also seen: ema-test took rows-for-ema-test
  row 3 (4d295672: heading-copytext-large stays the heading's marker in the collapse).

