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
