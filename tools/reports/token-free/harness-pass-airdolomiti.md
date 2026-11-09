# Air Dolomiti's collapse pass: the harness's job (after harness-pass-ita.md)

Status, 2026-11-09: **waits for ema-test's switch branch.** Air Dolomiti's theme entry is on main since 3f2c61d
(`airdolomiti: {}` in `scripts/style-markers.js` THEMES, the base theme). The branch `token-free-airdolomiti-live`
doesn't exist yet: it needs `airdolomiti: { live: true }` and the bundles rebuilt, as Cargo's and TAP's got in f418f61,
cut from main (lesson 1). Without the switch, the site's imports keep writing `{selected}` (the import gate,
`isThemeLive`). Then **ready to start**. The pass is three
documents.

Everything in [harness-pass-ita.md](harness-pass-ita.md) holds (the clone, phase A, phase B, backup, rollback, after the
pass), with the values and numbers of this page. **Where section 7's lessons from the ITA pass differ from it, they
win.** ema-adobe wrote it from a read-only dry run; nothing was written to DA, uploaded, previewed or published.

| | Air Dolomiti |
| --- | --- |
| DA site | `moved-permanently/lh-airdolomiti` |
| documents | DA's own list (step 1 below). Expected from the census: 3 documents, `collapse-lh-airdolomiti-census-paths.txt` in release order: `/iscrizione-newsletter`, `/en/newsletter-subscription`, `/de/newsletter-anmeldung` |
| collapse | `--brand airdolomiti --force` |
| switch branch (don't merge or change it) | `token-free-airdolomiti-live`, to be made by ema-test (above); its preview would be `https://token-free-airdolomiti-live--lh-airdolomiti--moved-permanently.aem.page` |
| host (published) | `https://airdolomiti.turnsthe.page` |
| backup folder | `/.token-free-backup/2026-11-airdolomiti/<path>.html`, written and read back before the batch's upload (lesson 5) |
| batches | one, the three documents, every check at 1440 and 390 |

## 1. The census of DA's tree (before phase A)

DA's own tree is the pass, never the workspace's list or this page's. Lesson 2: ITA's DA had 2,195 documents where the
workspace had 2,083, and the extras were market roots and legal pages.

As [harness-pass-b2b.md](harness-pass-b2b.md) section 1, with `lh-airdolomiti` and `work/airdolomiti/`: the token from
`~/.aem/da-token.json` in an environment variable only (never printed or logged), DA's `list` API from `/` down, every
document's source GET one at a time (150 ms apart) into `work/airdolomiti/before/`, then `marker-collapse-cli.mjs
--content work/airdolomiti/before --brand airdolomiti --force --check --report work/airdolomiti/census.json`. Stop if DA
has a marker family other than form, or more than 5 documents with markers.

ema-adobe's census, the way step 4's was done: the 1,569 documents Air Dolomiti's upload state has previewed, read from
our preview host's `.plain.html` (main--lh-airdolomiti--moved-permanently.aem.page, 1,569 of 1,569), the CLI's
`--check`, a dry run and the loss check. 3 of 1,569 have markers, as step 4's census found. (`.plain.html` drops the
Metadata block, so the collapse saw no Theme rows; on Air Dolomiti that changes nothing, since its markers are forms only.)

## 2. The dry run's numbers (what phase A must report)

| | expected |
| --- | --- |
| documents changed | 3 (of 1,569 previewed): the newsletter forms in Italian, English and German |
| markers | 3, `{selected}` (form): **3 carriers, 0 theme, 0 for a person** |
| marker left, not idempotent, errors | 0, 0, 0 |
| carriers written | 3: the form's Default column, one per form |
| the loss check | 0 failed; no document with several H1s |
| documents with from-768 separators | 0 |
| Spacer / Divider blocks after the collapse | 0 (spacer-cost-536.md) |

The form reads its Default column whatever the theme (blocks/form/form-rules.js: "the options chosen at load, instead
of {selected}"), so the three forms render the same before and after the collapse; the switch only stops new imports
from writing the marker again.

## 3. The backup

3 documents, a few kB, into `/.token-free-backup/2026-11-airdolomiti/` (POST, GET and compare) before the upload, then DA
read again right before it (lesson 5), `work/airdolomiti/before/` kept. Estimated: the
backup and the pass with its page checks **a few minutes**.

## 4. The switch branch and the page checks

- `pass-widths.mjs --host https://airdolomiti.turnsthe.page --preview https://token-free-airdolomiti-live--lh-airdolomiti--moved-permanently.aem.page`
  for the three pages at 1440 and 390, once the branch exists and carries main's code: the published newsletter page
  against the collapsed one. They should not differ at all; check by hand that the option www preselects is the one
  preselected on the preview.
- **The branch has to carry main** (lesson 1: ITA's preview lacked the from-768 Spacer commit). When ema-test makes it,
  it is cut from main and kept up to date. The harness checks
  `git merge-base --is-ancestor origin/main origin/token-free-airdolomiti-live` (exit 0) before it starts.
- Spacer blocks: Air Dolomiti has none, so lesson 3 doesn't apply.

## 5. The stop rule

Before phase B, Air Dolomiti's own rule: stop on any marker other than `{selected}`, more than 3 carriers, or a document
for a person. In the batch, lesson 4's rule applies (a loss, errors above 2 %, DA-changed skips above 5 %). A page that
differs in height, or a form whose preselected option differs from the published page's, goes to the held list and
out of the publish list.

## 6. What the census found that needs a decision

- **Nothing for a person, no marker without a rule, no near value**: Air Dolomiti's documents carry no spacing or
  heading markers; its own CSS draws its headings by level (styles/themes/airdolomiti.css). No handover of a rule.
- **For ema-test**: the switch branch above (the theme entry is on main since 3f2c61d).

## 7. The ITA pass's lessons (brief 536; they win over harness-pass-ita.md)

1. **The switch branch's preview must contain main** (section 4's merge-base check).
2. **Count DA's own tree** (section 1). Expect it to be a little larger than the census, with market roots and legal
   pages. Stop if it has more than 5 documents with markers or a marker family other than form.
3. **Spacer-heavy pages fail page checks**: Air Dolomiti has none.
4. **Page checks.** ITA's are a 10-page width sample per batch, flagged at more than 3 % or a heading more than 40 px
   off, re-measured by hand above 10 %. Air Dolomiti's three pages are checked in full at both widths and must not
   differ. A page that does stays uploaded (preview only, backed up), goes to `work/airdolomiti/held.txt` and out of the
   publish list. The pass stops only for:
   - a loss;
   - an error rate above 2 %;
   - DA-changed skips above 5 %;
   - three batches in a row with a new kind of difference (Air Dolomiti has one batch).
5. **The batch is backed up first**: to `/.token-free-backup/<year-month>-<brand>`
   (`/.token-free-backup/2026-11-airdolomiti/`), each backup read back equal, then DA read again right before the
   upload.
