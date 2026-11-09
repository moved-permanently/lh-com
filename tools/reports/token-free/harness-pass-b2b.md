# Lufthansa Group for Business's collapse pass: the harness's job (after harness-pass-ita.md)

Status, 2026-11-09: **waits for one thing: ema-test brings `token-free-b2b-live` up to main.** It is 1 commit ahead
and 86 behind, so its preview runs older code than the host and the page checks would compare two code bases (lesson 1
below). Then it is **ready to start**. Everything else below is in place. ema-test's Spacer heading-gap rule
([spacer-cost-536.md](spacer-cost-536.md)) is not a precondition, but B2B's two `news/lhg-ita-airways` pages are flagged
without it (section 4).

Everything in [harness-pass-ita.md](harness-pass-ita.md) holds (the clone, phase A all at once, phase B in batches,
backup, rollback, after the pass), with the values and numbers of this page. **Where section 5's lessons from the ITA
pass differ from it, they win.** ema-adobe wrote this from a read-only dry run; nothing was written to DA, uploaded,
previewed or published.

| | Lufthansa Group for Business |
| --- | --- |
| DA site | `moved-permanently/lh-b2b` |
| documents | DA's own list (step 1 below). Expected from the census: 679 documents with markers, `collapse-lh-b2b-census-paths.txt` in release order (de/en, de/de, then the other roots); the workspace's older `collapse-lh-b2b-paths.txt` has 644 (35 of the census's are not in it, 1 of it is not in the census) |
| collapse | `--brand b2b --force` |
| switch branch (don't merge or change it) | `token-free-b2b-live` (74d01f9f: `THEMES.b2b.live` and the bundles rebuilt), preview `https://token-free-b2b-live--lh-b2b--moved-permanently.aem.page` (answers 200 and serves the switched theme, checked 2026-11-09) |
| host (published) | `https://b2b.turnsthe.page` |
| backup folder | `/.token-free-backup/2026-11-b2b/<path>.html`, written batch by batch (lesson 5) |
| batches | a canary of 20, then 100 per batch, as ITA's: 7 batches |

## 1. The census of DA's tree (before phase A)

DA, not the preview, is what the pass changes, so the harness counts DA's own tree first. It does not count the
workspace's list or this page's: ITA's DA tree had 2,195 documents where the workspace had 2,083, and the extras were
market roots and legal pages (lesson 2). Read-only:

1. The token: `DA_TOKEN` from `~/.aem/da-token.json` (its `access_token`), in an environment variable only. Never echo
   it, never write it into a log, a report or a command line that is logged.
2. List the tree: `GET https://admin.da.live/list/moved-permanently/lh-b2b/<folder>` from `/` down, every folder
   (entries without `ext` are folders), `Authorization: Bearer $DA_TOKEN`. Keep the `.html` documents. Leave out
   `/.token-free-backup/`, `/drafts/` and the sheets (`.json`).
3. GET every document's source (`https://admin.da.live/source/moved-permanently/lh-b2b/<path>.html`), byte for byte, into
   `work/b2b/before/<path>.plain.html`, one request at a time with 150 ms between them. DA's source has the Metadata
   block; the collapse reads the page's Theme row from it (step 4 below).
4. `node tools/importer/marker-collapse-cli.mjs --content work/b2b/before --brand b2b --force --check --report
   work/b2b/census.json` (no output written). Its documents with markers are the pass's list. Write them in release
   order as `work/b2b/paths.txt` and use that list for phase A and B instead of the census file of this page.
5. Compare with this page's numbers (section 2). DA's may be a little off. Stop if a row is more than 10 % off, or if
   DA has a marker family that isn't in the table.

ema-adobe's census, the way step 4's was done (tools/reports/token-free/step4-preconditions.md):
- the 733 documents B2B's upload state has previewed, read from our own preview host's `.plain.html`
  (main--lh-b2b--moved-permanently.aem.page, no token, 733 of 733 read);
- **each document's Theme row put back from the page's `theme` meta** (logs/b536/add-theme.mjs, our preview's full
  page). `.plain.html` drops the Metadata block, and without it the collapse takes a flow page for a service page. 729
  of the 733 are flow pages;
- then the CLI's `--check`, a full dry run (`--force --out`, a scratch folder) and the loss check.

679 of the 733 have markers, as step 4's census found. Brief 531's numbers came from the copies without the Theme row;
section 2 has the corrected ones.

## 2. The dry run's numbers (what phase A must report)

| | expected |
| --- | --- |
| documents changed | 679 (of 733 previewed) |
| markers | 5,708: 3,595 theme (the marker goes), 2,113 as carriers, **0 for a person** (with main's collapse at 3f2c61d, which reads video settings in block cells too: 3 more video markers than the code of brief 531) |
| marker left, not idempotent, errors, cross-document anchors | 0, 0, 0, 0 |
| carriers written | 853: Section Metadata wide-text 332, space-below-m 54, space-m 50, padded 20, divider 13, divider-below 12, space-below-l 5, small-print 5, space-l 4; Spacer blocks 153, Spacer (l) 17, Divider blocks 112; block options space-m 34, divider-above 14, background-video 11, title-compact 4, space-l 2; indented lists or quotes 11 |
| the loss check | 0 failed; **58 documents already have several H1s** (notes, as www has them: `/al/en/programs-and-advantages/experts` 11, `meals-on-board` 5, the joint-venture pages 4 each …) |
| documents with from-768 separators | 0 |

By family (theme / carrier): text-width 394 / 1,528, column 1,869 / 40, heading 846 / 4, separator 305 / 514, video
63 / 11, heading-no-choice 63 / 0, indent 24 / 11, text-size 22 / 5, heading-aligned 9 / 0.

Carriers per changed document: none for 344 of 679; median 0, 95 % at most 6, **at most 16**:
`/de/en/program/experts/special-assistance-and-services` and `/xx/en/…/special-assistance-and-services` 16 each (their
sections' Space and Wide text styles), `/al/en/programs-and-advantages/experts` 15, the two `news/lhg-ita-airways` 12.
(Brief 531's copies without the Theme row gave those two pages 17. There, their H3s marked heading-medium got an
`h3-large` section style; on a flow page that size is one step from the default, so the marker goes. Brief 531 had 6
such styles in all, 0 now.)

What changes on the site with B2B's theme (b2b-pass-check.md):
- on flow pages the H3s are heading-small;
- Columns Media, Carousel Images and Quote are column views of their own, also at a section's end;
- running text keeps the brand's two thirds; 332 sections with mostly wide text get the section style Wide text
  (decisions.md 2).

Known and accepted (b2b-pass-check.md, decisions.md):
- text in column views loses its padding (meals-on-board -6.8 %);
- separators of 0-31 px go (history -31 px);
- heading sizes one step from the default take it (travel-classes-and-booking +1.6 %).

## 3. The backup

679 documents, 6.2 MB of sources, backed up batch by batch into `/.token-free-backup/2026-11-b2b/` (lesson 5), with
`work/b2b/before/` kept. Time, estimated: our preview's reads are CDN hits, so DA's own times are not known here.
- the backup: 2 requests per document, about 1.3 s with the 150 ms pause, **about 15 minutes** over the pass;
- all of phase B (backup, re-read, upload, read back, preview: 6 requests per document): about 4 s per document,
  **about 45 minutes**;
- the page checks (the canary's 20 pages at two widths, then 10 pages per batch): about 30 minutes.

Rescale from the canary's measured times.

## 4. The switch branch and the page checks

- `pass-widths.mjs --host https://b2b.turnsthe.page --preview https://token-free-b2b-live--lh-b2b--moved-permanently.aem.page`:
  the published page (markers, theme off, main's code) against the collapsed document on the branch's preview (theme on).
- **Before the canary**: the branch has to carry main's code (lesson 1). ema-test merges or rebases main into
  `token-free-b2b-live` and notes the head here. The harness checks
  `git merge-base --is-ancestor origin/main origin/token-free-b2b-live` (exit 0) and doesn't start without it. Today it
  is 86 commits behind main (B2B's theme fixes of the last days among them), so a page could be flagged for code the
  host has and the branch hasn't. ITA's preview lacked the from-768 Spacer commit.
- The canary at 1440 and 390 in full; after it, a 10-page width sample per batch (lesson 4). Flagged at more than 3 %
  off in height or a heading more than 40 px off; re-measured by hand above 10 %.

What the canary and the samples should show, measured against b2b.turnsthe.page. b2b-parity-001, the B2B recording,
is not on this machine, so the comparison is the host's published page, as the harness's own check (collapsed
documents as `<main>` on the host with main's code and the theme live; logs/b536):

- **H3s marked heading-small on 19 documents** (programs-and-groups, the experts pages, the news pages, meals-on-board,
  63 H3s): **no change.** All 19 are flow pages, where heading-small is B2B's H3 default; the marker goes and the H3
  stays 28 px (24 on phones). 89 of 89 H3 renders matched in size and class. Their share of the page height was +0.9 px
  per H3 at 1440 and +1.6 px at 390 (rounding). Brief 531's "28 to 18 px" was wrong; it came from the copies without the
  Theme row.
- **H3s marked heading-medium on flow pages: 45 in 14 documents** take heading-small, **32 to 28 px at 1440, 28 to 24
  on phones**. Measured: **-6 px per H3 at 1440** (the line 38 to 32 px), **-8 px per line at 390** (-11.6 px per H3 on
  average with the wrapping ones). At most **-36 px at 1440 and -48 px at 390** on a page: the three
  `partner-plus-benefit-raffle-terms-and-conditions`, with 6 each. No page is flagged for it. The raffle terms pages
  are -5.4 % at 1440 for their separators going, not for the H3s.
- **Spacer blocks before headings** (spacer-cost-536.md): 106 in 91 documents, +32 px each until ema-test's rule is on
  the branch. `/de/de` and `/de/en/news/lhg-ita-airways` (8 each) are **+277 px, +5.0 % at 1440, and +271 px at 390**
  without it, and -11 / -17 px with it. Lesson 3: the pages with many Spacers are the ones that fail.
- **Headings marked a size their level has no choice for** (the CLI's heading-no-choice, 63): they take the level's
  default.
  - 41 H1s marked heading-small on 41 pages' titles become heading-large (28 to 42 px; the airlines-at-a-glance and
    allegris start-of-booking pages);
  - meals-on-board's 4 H1s marked heading-copytext-large become heading-large (18 to 42 px; with the column views,
    +126 px at 1440, +95 at 390, 0.5 %);
  - 10 H4s marked heading-medium on 4 documents become heading-copytext-large (32 to 18 px; lhg-history-alliances,
    corporate-preferred).

  Two such pages measured: airlines-at-a-glance/airdolomiti -39 / +66 px, allegris corporates-start-of-booking +162 /
  +145 px at 1440 / 390, both under 3 %.

## 5. The ITA pass's lessons (brief 536; they win over harness-pass-ita.md)

1. **The switch branch's preview must contain main.** ITA's lacked the from-768 Spacer commit. Check with
   `git merge-base --is-ancestor origin/main origin/token-free-b2b-live` before the canary and before each batch after
   a push to main.
2. **Count DA's own tree**, never the workspace's list. ITA's DA had 2,195 documents where the workspace had 2,083;
   the extras were market roots and legal pages. Section 1's numbers are a guide; DA's tree is the pass.
3. **Pages with many Spacer blocks fail page checks** (13 on ITA's terms-and-conditions-of-use: +8.1 %). On B2B these
   are the two lhg-ita-airways pages (8 Spacers before headings). Every page with 5 or more Spacer blocks goes into its
   batch's width sample.
4. **Page checks are a 10-page width sample per batch**: pages with carriers first, then pages with 5 or more Spacer
   blocks, then the batch's first pages. A page is flagged at more than 3 % or a heading more than 40 px off, and
   re-measured by hand above 10 %. **The stop rule is relaxed:** a page above 10 % stays uploaded (preview only,
   backed up), goes to the held list (`work/b2b/held.txt`: path, width, %, cause) and out of the publish list, and the
   pass goes on. The pass **stops only** for:
   - a loss;
   - an error rate above 2 % in a batch (preview, `.plain.html`, read-back or `about:error`);
   - documents skipped because DA changed them since phase A above 5 % of a batch;
   - three batches in a row each with a new kind of difference (not one of section 4's or b2b-pass-check.md's).
5. **Each batch is backed up before it is uploaded.** Its documents go to
   `/.token-free-backup/<year-month>-<brand>` in DA (`/.token-free-backup/2026-11-b2b/<path>.html`), and each backup is
   read back (GET, equal byte for byte). Then the batch's documents are read again from DA right before the upload
   (lesson 4's DA-changed skips). No batch uploads before its own backup is read back.

The checks before phase B stay as ITA's, with B2B's values:
- a loss-check failure, a marker left, an error or a document for a person;
- carriers written more than 10 % above 853 (over 938);
- a document with **more than 17** carriers. That's the user's limit (brief 536), kept although the two
  special-assistance-and-services pages now carry 16.

## 6. What the census found, and what is decided

- **Nothing for a person, no marker without a rule**: no handover to ema-test.
- **The heading groups are approved as the tool writes them** (the user, brief 536). With the Theme row
  (near-values-531.md, corrected):
  - 201 flow-page H2s marked heading-small take heading-medium (+4 px);
  - 82 flow-page H1s marked heading-medium take heading-large (+10 px at 1440);
  - 45 flow-page H3s marked heading-medium take heading-small (-4 px, measured in section 4).

  The H3 group the user approved as "heading-small to copytext-large" turned out to be no change at all (section 4).
  The H3 heading-medium group replaces it in the same three. Listed for the user, not stopped on.
- The separators: 162 `{spacer-25}` and 115 `{spacer-30}` go (decisions.md 4, decided).
- **The heading-no-choice headings** (section 4: 41 H1 titles to 42 px, meals-on-board's H1s, 10 H4s) are the
  collapse's rule for a size without a level choice, not near values. Listed for the user; the harness doesn't stop on
  them.
- **B2B's text width** is decided (decisions.md 2: the brand's two thirds, Wide text on 332 sections).
