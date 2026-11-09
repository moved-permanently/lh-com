# Lufthansa Cargo's collapse pass: the harness's job (after harness-pass-ita.md)

**Update (ema-test, the brief after 520): the first condition is met, the second isn't.** `token-free-cargo-live` has
main at 3f2c61d7 merged in (head 9fcbcb77, full suite 680 passed, 0 failed), pushed as a merge commit. The video
links' text (brief 536) is not done in this brief. DA's own census (the dry run on DA's 990 documents): 22 changed, 30
markers, all to the theme, loss and carrier checks 0 failed: as below.

Status, 2026-11-09: **waits for two things from ema-test.** First, `token-free-cargo-live` has to come up to main (it
is 1 commit ahead and 86 behind; Cargo's theme had fixes on main since, 84fc8d1 among them). Second, the collapse has to
keep the video links' text (the user, brief 536: parity with www; section 6). Then it is **ready to start**. The pass is
small: 22 documents, one batch.

Everything in [harness-pass-ita.md](harness-pass-ita.md) holds (the clone, phase A, phase B, backup, rollback, after the
pass), with the values and numbers of this page. **Where section 7's lessons from the ITA pass differ from it, they
win.** ema-adobe wrote this from a read-only dry run; nothing was written to DA, uploaded, previewed or published.

| | Lufthansa Cargo |
| --- | --- |
| DA site | `moved-permanently/lh-cargo` |
| documents | DA's own list (step 1 below). Expected from the census: 22 documents with markers, `collapse-lh-cargo-census-paths.txt` in release order (en, de, then es, fr, it, pt); the workspace has no list of its own |
| collapse | `--brand cargo --force` |
| switch branch (don't merge or change it) | `token-free-cargo-live` (b8ad4ddd: `THEMES.cargo.live`, the base theme, and the bundles rebuilt), preview `https://token-free-cargo-live--lh-cargo--moved-permanently.aem.page` (answers 200 and serves the switched theme, checked 2026-11-09) |
| host (published) | `https://cargo.turnsthe.page` |
| backup folder | `/.token-free-backup/2026-11-cargo/<path>.html`, written and read back before the batch's upload (lesson 5) |
| batches | one: the 22 documents are the canary, every check at 1440 and 390 |

## 1. The census of DA's tree (before phase A)

DA's own tree is the pass, never the workspace's list or this page's. Lesson 2: ITA's DA had 2,195 documents where the
workspace had 2,083, and the extras were market roots and legal pages.

The census works as [harness-pass-b2b.md](harness-pass-b2b.md) section 1, with `lh-cargo` and `work/cargo/`:
- the token from `~/.aem/da-token.json` in an environment variable only (never printed or logged);
- DA's `list` API from `/` down;
- every document's source GET one at a time (150 ms apart) into `work/cargo/before/`;
- then `marker-collapse-cli.mjs --content work/cargo/before --brand cargo --force --check --report
  work/cargo/census.json`.

Its documents with markers, in release order, are the pass's list. Stop if DA has a marker family other than video, or
more than 25 documents with markers.

ema-adobe's census, the way step 4's was done: the 990 documents Cargo's upload state has previewed, read from our
preview host's `.plain.html` (main--lh-cargo--moved-permanently.aem.page, 990 of 990), then the CLI's `--check`, a dry
run and the loss check. 22 of 990 have markers, as step 4's census found (it counts 60 video settings, because each
marker holds two). `.plain.html` drops the Metadata block, so the collapse saw no Theme rows. On Cargo that changes
nothing: the page type only decides heading sizes and column views, and Cargo's documents have neither marker.

## 2. The dry run's numbers (what phase A must report)

| | expected |
| --- | --- |
| documents changed | 22 (of 990 previewed) |
| markers | 30, all `{controls round-play-button}` (video): 30 theme, **0 carriers, 0 for a person** |
| marker left, not idempotent, errors | 0, 0, 0 |
| carriers written | 0 |
| the loss check | 0 failed; no document with several H1s |
| documents with from-768 separators | 0 |
| Spacer / Divider blocks after the collapse | 0 (spacer-cost-536.md) |

`{controls round-play-button}` is what the site's video player does without a marker since token-free styling
(scripts/media.js `buildVideo`: "the default player: controls and the round play button"), so the marker goes and the
player stays as it is. **The video link's text stays as it is** (the user, brief 536: parity with www), so the play
button keeps "Play video" in the page's language. The collapse as it stands (main at 3f2c61d, rechecked: 30 markers, 0 carriers, as before) writes the file's title as the link text
(`…/Lufthansa_Addon-Services_Video_17-03-2026.mp4` would become "Lufthansa Addon Services Video 17 03 2026", the
button's name from then on). Fixing that is ema-test's job (marker-collapse.mjs), before the pass. After the fix, expect
no visible change at all.

## 3. The backup

22 documents, 0.2 MB, into `/.token-free-backup/2026-11-cargo/` (POST, GET and compare) before the batch's upload. Then
DA is read again right before the upload (lesson 5). `work/cargo/before/` is kept. Estimated (DA's own times aren't
known here): the backup **under a minute**, and the whole pass with its page checks at two widths **about 10 minutes**.

## 4. The switch branch and the page checks

- `pass-widths.mjs --host https://cargo.turnsthe.page --preview https://token-free-cargo-live--lh-cargo--moved-permanently.aem.page`
  for all 22 pages, 1440 and 390: the published page against the collapsed one. The player's poster, its round play
  button and its controls are the same, so a page should not differ at all.
- **The harness checks the play button's text on this first batch.** On every one of the 22 pages, at both widths, each
  video's play button must read "Play video" in the page's language (its accessible name, as on the published page).
  The link's text in the uploaded document must equal the one in `work/cargo/before/`. A button named after the file
  means the collapse still rewrites the link text: stop, and restore the batch from its backup before anything else.
- **Before the pass** the branch has to carry main's code (ema-test; lesson 1: ITA's preview lacked the from-768 Spacer
  commit). The harness checks `git merge-base --is-ancestor origin/main origin/token-free-cargo-live` (exit 0) before
  it starts. Today it is 86 commits behind main; Cargo's own theme fixes since (Support & Contact's support band,
  84fc8d1, and others) would show up as differences that are no part of the pass.
- Spacer blocks: Cargo has none, so lesson 3 doesn't apply.

## 5. The stop rule

Before phase B, Cargo's own rule: stop on any carrier written, any marker other than video, or a document for a
person. In the batch, lesson 4's rule applies (a loss, errors above 2 %, DA-changed skips above 5 %), plus Cargo's
strictest check: **a play button not named "Play video" stops the pass**. A page more than 1 % off in height, or
without its video player, goes to the held list and out of the publish list (lesson 4).

## 6. What the census found that needs a decision

- **Nothing for a person, no marker without a rule, no near value**: Cargo's documents carry no spacing or heading
  markers at all, and the collapse changes neither spacing nor headings on Cargo (near-values-531.md). No handover.
- **The video links' text: decided** (the user, brief 536): parity with www. The link text stays as it is and the play
  button keeps "Play video". The collapse-tool fix goes to ema-test. The harness checks the button text on the first
  (and only) batch (section 4).

## 7. The ITA pass's lessons (brief 536; they win over harness-pass-ita.md)

1. **The switch branch's preview must contain main** (section 4's merge-base check).
2. **Count DA's own tree** (section 1). Expect it to be a little larger than the census, with market roots and legal
   pages.
3. **Spacer-heavy pages fail page checks**: Cargo has none.
4. **Page checks.** ITA's are a 10-page width sample per batch, flagged at more than 3 % or a heading more than 40 px
   off, re-measured by hand above 10 %. Cargo's one batch is checked in full at both widths, with its own 1 % limit. A
   page that fails stays uploaded (preview only, backed up), goes to `work/cargo/held.txt` and out of the publish list,
   and the pass goes on. It stops only for:
   - a loss;
   - an error rate above 2 %;
   - DA-changed skips above 5 %;
   - three batches in a row with a new kind of difference (Cargo has one batch);
   - a play button not named "Play video".
5. **The batch is backed up first**: to `/.token-free-backup/<year-month>-<brand>` (`/.token-free-backup/2026-11-cargo/`),
   each backup read back equal, then DA read again right before the upload.
