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

## 3. Brussels, deeper visual parity (brussels-parity-002a and -002b; in progress)

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
