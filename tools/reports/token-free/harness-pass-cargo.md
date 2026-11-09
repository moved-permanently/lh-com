# Lufthansa Cargo's collapse pass: the harness's job (after harness-pass-ita.md)

Status, 2026-11-09: **waits for one thing: ema-test brings `token-free-cargo-live` up to main** (1 commit ahead, 86
behind; Cargo's theme had fixes on main since, 84fc8d1 among them). Then **ready to start**. The pass is small: 22
documents, one batch.

Everything in [harness-pass-ita.md](harness-pass-ita.md) holds (the clone, phase A, phase B, backup, rollback, after the
pass), with the values and numbers of this page. ema-adobe wrote it from a read-only dry run; nothing was written to DA,
uploaded, previewed or published.

| | Lufthansa Cargo |
| --- | --- |
| DA site | `moved-permanently/lh-cargo` |
| documents | DA's own list (step 1 below). Expected from the census: 22 documents with markers, `collapse-lh-cargo-census-paths.txt` in release order (en, de, then es, fr, it, pt); the workspace has no list of its own |
| collapse | `--brand cargo --force` |
| switch branch (don't merge or change it) | `token-free-cargo-live` (b8ad4ddd: `THEMES.cargo.live`, the base theme, and the bundles rebuilt), preview `https://token-free-cargo-live--lh-cargo--moved-permanently.aem.page` (answers 200 and serves the switched theme, checked 2026-11-09) |
| host (published) | `https://cargo.turnsthe.page` |
| backup folder | `/.token-free-backup/2026-11-cargo/<path>.html` |
| batches | one: the 22 documents are the canary, every check at 1440 and 390 |

## 1. The census of DA's tree (before phase A)

As [harness-pass-b2b.md](harness-pass-b2b.md) section 1, with `lh-cargo` and `work/cargo/`: the token from
`~/.aem/da-token.json` in an environment variable only (never printed or logged), DA's `list` API from `/` down, every
document's source GET one at a time (150 ms apart) into `work/cargo/before/`, then `marker-collapse-cli.mjs --content
work/cargo/before --brand cargo --force --check --report work/cargo/census.json`. Its documents with markers, in release
order, are the pass's list. Stop if DA has a marker family other than video, or more than 25 documents with markers.

ema-adobe's census, the way step 4's was done: the 990 documents Cargo's upload state has previewed, read from our
preview host's `.plain.html` (main--lh-cargo--moved-permanently.aem.page, 990 of 990), the CLI's `--check`, a dry run
and the loss check. 22 of 990 have markers, as step 4's census found (it counts 60 video settings: each marker holds two).

## 2. The dry run's numbers (what phase A must report)

| | expected |
| --- | --- |
| documents changed | 22 (of 990 previewed) |
| markers | 30, all `{controls round-play-button}` (video): 30 theme, **0 carriers, 0 for a person** |
| marker left, not idempotent, errors | 0, 0, 0 |
| carriers written | 0 |
| the loss check | 0 failed; no document with several H1s |
| documents with from-768 separators | 0 |

`{controls round-play-button}` is what the site's video player does without a marker since token-free styling
(scripts/media.js `buildVideo`: "the default player: controls and the round play button"), so the marker goes and the
player stays as it is. Expect one visible change: the collapse names the video's link as the player's button does,
its text the file's title instead of the bare URL (`…/Lufthansa_Addon-Services_Video_17-03-2026.mp4` becomes "Lufthansa
Addon Services Video 17 03 2026"), which is the play button's accessible name from then on.

## 3. The backup

22 documents, 0.2 MB, into `/.token-free-backup/2026-11-cargo/` (POST, GET and compare), `work/cargo/before/` kept.
Estimated (DA's own times aren't known here): the backup **under a minute**, the whole pass with its page checks at two
widths **about 10 minutes**.

## 4. The switch branch and the page checks

- `pass-widths.mjs --host https://cargo.turnsthe.page --preview https://token-free-cargo-live--lh-cargo--moved-permanently.aem.page`
  for all 22 pages, 1440 and 390: the published page against the collapsed one; the player's poster, its round play
  button and its controls are the same, so a page should differ by nothing but the link's label.
- **Before the pass** the branch has to carry main's code (ema-test). Today it is 86 commits behind main; Cargo's own
  theme fixes since (Support & Contact's support band, 84fc8d1, and others) would show up as differences that are no
  part of the pass.

## 5. The stop rule

ITA's, with Cargo's values: any carrier written, any marker other than video, a document for a person; in the page
checks any page more than 1 % off in height (only the link's label may change) or without its video player.

## 6. What the census found that needs a decision

- **Nothing for a person, no marker without a rule, no near value**: Cargo's documents carry no spacing or heading
  markers at all; the collapse changes neither spacing nor headings on Cargo (near-values-531.md). No handover.
- **One question for the user, not Ben's rule**: the video links' visible text becomes the file's title. Today the
  link's text is the URL, and the button reads "Play video" in the page's language; after the pass it reads the
  file name ("Lufthansa Addon Services Video 17 03 2026"). Options: (a) as the collapse writes it; (b) the harness
  keeps the URL as the link text (the button stays "Play video").
