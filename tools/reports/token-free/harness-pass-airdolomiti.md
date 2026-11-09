# Air Dolomiti's collapse pass: the harness's job (after harness-pass-ita.md)

Status, 2026-11-09: **waits for ema-test**: Air Dolomiti has no theme entry (`scripts/style-markers.js` THEMES has no
`airdolomiti`) and no switch branch (`token-free-airdolomiti-live` doesn't exist). What it needs, as Cargo's and TAP's
got in f418f61: an entry `airdolomiti: {}` (the base theme; the CLI already collapses with it under `--force`) and the
branch `token-free-airdolomiti-live` with `airdolomiti: { live: true }` and the bundles rebuilt. Without the switch the
site's imports keep writing `{selected}` (the import gate, `isThemeLive`). Then **ready to start**. The pass is three
documents.

Everything in [harness-pass-ita.md](harness-pass-ita.md) holds (the clone, phase A, phase B, backup, rollback, after the
pass), with the values and numbers of this page. ema-adobe wrote it from a read-only dry run; nothing was written to DA,
uploaded, previewed or published.

| | Air Dolomiti |
| --- | --- |
| DA site | `moved-permanently/lh-airdolomiti` |
| documents | DA's own list (step 1 below). Expected from the census: 3 documents, `collapse-lh-airdolomiti-census-paths.txt` in release order: `/iscrizione-newsletter`, `/en/newsletter-subscription`, `/de/newsletter-anmeldung` |
| collapse | `--brand airdolomiti --force` |
| switch branch (don't merge or change it) | `token-free-airdolomiti-live`, to be made by ema-test (above); its preview would be `https://token-free-airdolomiti-live--lh-airdolomiti--moved-permanently.aem.page` |
| host (published) | `https://airdolomiti.turnsthe.page` |
| backup folder | `/.token-free-backup/2026-11-airdolomiti/<path>.html` |
| batches | one, the three documents, every check at 1440 and 390 |

## 1. The census of DA's tree (before phase A)

As [harness-pass-b2b.md](harness-pass-b2b.md) section 1, with `lh-airdolomiti` and `work/airdolomiti/`: the token from
`~/.aem/da-token.json` in an environment variable only (never printed or logged), DA's `list` API from `/` down, every
document's source GET one at a time (150 ms apart) into `work/airdolomiti/before/`, then `marker-collapse-cli.mjs
--content work/airdolomiti/before --brand airdolomiti --force --check --report work/airdolomiti/census.json`. Stop if DA
has a marker family other than form, or more than 5 documents with markers.

ema-adobe's census, the way step 4's was done: the 1,569 documents Air Dolomiti's upload state has previewed, read from
our preview host's `.plain.html` (main--lh-airdolomiti--moved-permanently.aem.page, 1,569 of 1,569), the CLI's
`--check`, a dry run and the loss check. 3 of 1,569 have markers, as step 4's census found.

## 2. The dry run's numbers (what phase A must report)

| | expected |
| --- | --- |
| documents changed | 3 (of 1,569 previewed): the newsletter forms in Italian, English and German |
| markers | 3, `{selected}` (form): **3 carriers, 0 theme, 0 for a person** |
| marker left, not idempotent, errors | 0, 0, 0 |
| carriers written | 3: the form's Default column, one per form |
| the loss check | 0 failed; no document with several H1s |
| documents with from-768 separators | 0 |

The form reads its Default column whatever the theme (blocks/form/form-rules.js: "the options chosen at load, instead
of {selected}"), so the three forms render the same before and after the collapse; the switch only stops new imports
from writing the marker again.

## 3. The backup

3 documents, a few kB, into `/.token-free-backup/2026-11-airdolomiti/`, `work/airdolomiti/before/` kept. Estimated: the
backup and the pass with its page checks **a few minutes**.

## 4. The switch branch and the page checks

- `pass-widths.mjs --host https://airdolomiti.turnsthe.page --preview https://token-free-airdolomiti-live--lh-airdolomiti--moved-permanently.aem.page`
  for the three pages at 1440 and 390, once the branch exists and carries main's code: the published newsletter page
  against the collapsed one. They should not differ at all; check by hand that the option www preselects is the one
  preselected on the preview.

## 5. The stop rule

ITA's, with Air Dolomiti's values: any marker other than `{selected}`, more than 3 carriers, a document for a person; any
page that differs in height, or a form whose preselected option differs from the published page's.

## 6. What the census found that needs a decision

- **Nothing for a person, no marker without a rule, no near value**: Air Dolomiti's documents carry no spacing or
  heading markers; its own CSS draws its headings by level (styles/themes/airdolomiti.css). No handover of a rule.
- **For ema-test**: the theme entry and the switch branch above (one line each, as f418f61 did for TAP and Cargo).
