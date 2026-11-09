# Lufthansa Group for Business's collapse pass: the harness's job (after harness-pass-ita.md)

Status, 2026-11-09: **waits for one thing: ema-test brings `token-free-b2b-live` up to main** (it is 1 commit ahead
and 86 behind; its preview runs older code than the host, so the page checks would compare two code bases). Then
**ready to start**. Everything else below is in place.

Everything in [harness-pass-ita.md](harness-pass-ita.md) holds (the clone, phase A all at once, phase B in batches,
backup, rollback, after the pass), with the values and numbers of this page. ema-adobe wrote it from a read-only dry
run; nothing was written to DA, uploaded, previewed or published.

| | Lufthansa Group for Business |
| --- | --- |
| DA site | `moved-permanently/lh-b2b` |
| documents | DA's own list (step 1 below). Expected from the census: 679 documents with markers, `collapse-lh-b2b-census-paths.txt` in release order (de/en, de/de, then the other roots); the workspace's older `collapse-lh-b2b-paths.txt` has 644 (35 of the census's are not in it, 1 of it is not in the census) |
| collapse | `--brand b2b --force` |
| switch branch (don't merge or change it) | `token-free-b2b-live` (74d01f9f: `THEMES.b2b.live` and the bundles rebuilt), preview `https://token-free-b2b-live--lh-b2b--moved-permanently.aem.page` (answers 200 and serves the switched theme, checked 2026-11-09) |
| host (published) | `https://b2b.turnsthe.page` |
| backup folder | `/.token-free-backup/2026-11-b2b/<path>.html` |
| batches | a canary of 20, then 100 per batch, as ITA's: 7 batches |

## 1. The census of DA's tree (before phase A)

DA, not the preview, is what the pass changes, so the harness counts DA's tree first. Read-only:

1. The token: `DA_TOKEN` from `~/.aem/da-token.json` (its `access_token`), in an environment variable only; never echo
   it, never write it into a log, a report or a command line that is logged.
2. List the tree: `GET https://admin.da.live/list/moved-permanently/lh-b2b/<folder>` from `/` down, every folder
   (entries without `ext` are folders), `Authorization: Bearer $DA_TOKEN`. Keep the `.html` documents; leave out
   `/.token-free-backup/`, `/drafts/` and the sheets (`.json`).
3. GET every document's source (`https://admin.da.live/source/moved-permanently/lh-b2b/<path>.html`), byte for byte, into
   `work/b2b/before/<path>.plain.html`, one request at a time with 150 ms between them.
4. `node tools/importer/marker-collapse-cli.mjs --content work/b2b/before --brand b2b --force --check --report
   work/b2b/census.json` (no output written): its documents with markers are the pass's list; write them in release
   order as `work/b2b/paths.txt` and use that list for phase A and B instead of the census file of this page.
5. Compare with this page's numbers (section 2). DA's may be a little off; stop if a row is more than 10 % off, or if
   DA has a marker family that isn't in the table.

ema-adobe's census, the way step 4's was done (tools/reports/token-free/step4-preconditions.md): the 733 documents B2B's
upload state has previewed, read from our own preview host's `.plain.html` (main--lh-b2b--moved-permanently.aem.page,
no token, 733 of 733 read), then the CLI's `--check` and a full dry run (`--force --out`, a scratch folder) and the
loss check. 679 of the 733 have markers, as step 4's census found.

## 2. The dry run's numbers (what phase A must report)

| | expected |
| --- | --- |
| documents changed | 679 (of 733 previewed) |
| markers | 5,705: 3,565 theme (the marker goes), 2,140 as carriers, **0 for a person** |
| marker left, not idempotent, errors, cross-document anchors | 0, 0, 0, 0 |
| carriers written | 859: Section Metadata wide-text 332, space-below-m 54, space-m 50, padded 20, divider 13, divider-below 12, h3-large 6, space-below-l 5, small-print 5, space-l 4; Spacer blocks 153, Spacer (l) 17, Divider blocks 112; block options space-m 34, divider-above 14, background-video 11, title-compact 4, space-l 2; indented lists or quotes 11 |
| the loss check | 0 failed; **58 documents already have several H1s** (notes, as www has them: `/al/en/programs-and-advantages/experts` 11, `meals-on-board` 5, the joint-venture pages 4 each …) |
| documents with from-768 separators | 0 |

By family (theme / carrier): text-width 394 / 1,528, column 1,869 / 40, heading 817 / 31, separator 305 / 514, video
60 / 11, heading-no-choice 63 / 0, indent 24 / 11, text-size 22 / 5, heading-aligned 11 / 0.

Carriers per changed document: none for 343 of 679; median 0, 95 % at most 6, **at most 17**:
`/de/en/program/experts/special-assistance-and-services` and `/xx/en/…/special-assistance-and-services` 17 each (their
sections' Space and Wide text styles), `/al/en/programs-and-advantages/experts` 15, the two `news/lhg-ita-airways` 12.

What changes on the site with B2B's theme (b2b-pass-check.md): on flow pages the H3s are heading-small; Columns Media,
Carousel Images and Quote are column views of their own, also at a section's end; running text keeps the brand's two
thirds, 332 sections with mostly wide text get the section style Wide text (decisions.md 2). Known and accepted
(b2b-pass-check.md, decisions.md): text in column views loses its padding (meals-on-board -6.8 %), separators of 0-31 px
go (history -31 px), heading sizes one step from the default take it (travel-classes-and-booking +1.6 %).

## 3. The backup

679 documents, 6.2 MB of sources, into `/.token-free-backup/2026-11-b2b/` (POST, then GET and compare byte for byte),
and `work/b2b/before/` kept. Time, estimated (our preview's reads are CDN hits, so DA's own times are not known here):
2 requests per document for the backup, about 1.3 s with the 150 ms pause: **about 15 minutes**; the whole of phase B
(backup, re-read, upload, read back, preview: 6 requests per document) about 4 s per document, **about 45 minutes**, plus
the page checks (the canary's 20 pages at two widths, then 10 pages per batch): about 30 minutes. Rescale from the
canary's measured times.

## 4. The switch branch and the page checks

- `pass-widths.mjs --host https://b2b.turnsthe.page --preview https://token-free-b2b-live--lh-b2b--moved-permanently.aem.page`:
  the published page (markers, theme off, main's code) against the collapsed document on the branch's preview (theme on).
- **Before the canary**: the branch has to carry main's code (ema-test: merge or rebase main into `token-free-b2b-live`,
  head after that noted here). Today it is 86 commits behind main (B2B's theme fixes of the last days among them), so a
  page could be flagged for code the host has and the branch hasn't.
- Flagged and stop thresholds as ITA's.

## 5. The stop rule

ITA's, with B2B's values:
- before phase B: a loss-check failure, a marker left, an error or a document for a person; carriers written more than
  10 % above 859 (over 945); a document with **more than 17** carriers (ITA's 15 would stop on the two
  special-assistance-and-services pages, which are expected);
- in phase B: as ITA's; the known kinds a flagged page may have are the four above.

## 6. What the census found that needs a decision

- **Nothing for a person, no marker without a rule**: no handover to ema-test.
- **The near values the collapse takes to the common style** (tools/reports/token-free/near-values-531.md, B2B):
  162 `{spacer-25}` and 115 `{spacer-30}` go (decisions.md 4, decided); 199 flow-page H2s marked heading-small take
  heading-medium (+4 px), 79 flow-page H1s marked heading-medium take heading-large (+10 px at 1440), 68 H3s marked
  heading-small outside flow pages take heading-copytext-large (-10 px). Ben's rule decides them; listed for the user.
- **B2B's text width** is decided (decisions.md 2: the brand's two thirds, Wide text on 332 sections).
