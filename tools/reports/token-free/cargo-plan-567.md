# Lufthansa Cargo's token-free run: the plan (the standing order of 2026-11-10, item 5d)

ema-lufthansa (Cargo's importer and theme). The harness's job is [harness-pass-cargo.md](harness-pass-cargo.md) (the
pass on DA, ITA's pattern); this page says where it stands today and what goes in which order, so nothing changes live
before its matching documents. Nothing here was uploaded, previewed or published; DA was not read.

## The switch stays off until the documents match

Cargo's theme switch is `THEMES.cargo.live` (scripts/style-markers.js, ema-test's) on the branch
`token-free-cargo-live`, as for ITA, Discover, TAP and SWISS: main keeps Cargo's theme as today until that branch is
merged, so no live page changes before the pass. The importers' collapse is gated on the same switch
(marker-collapse.mjs isThemeLive): Cargo's imports keep writing markers until then, and the readers keep reading them.

## Where it stands (2026-11-10)

| condition (harness-pass-cargo.md) | state |
| --- | --- |
| 1. `token-free-cargo-live` up to main | **not met**: the branch (head 0e0a2c31) is 3 commits ahead of main and 199 behind. Main has Cargo theme changes since: 9c004e6f (the newsroom with Mynewsdesk's app, row 48; the stories' twelfth chevron, row 47), 9c6dcefa (the stories' chrome) and others. ema-test's to merge main in (I don't touch the token-free branches) |
| 2. the collapse keeps the video links' text (brief 536) | **met**: marker-collapse.mjs (ema-test's, read only) with the gate forced for Cargo drops `{controls round-play-button}` and keeps the link's text as it is ("Watch the video" or a bare URL), as its rules now say ("the link's text stays as it is, parity with www, a bare URL too"). Checked offline on Cargo's video markup (tools/importer/cargo-import.mjs writes `<p><a href="….mp4">….mp4</a> {controls round-play-button}</p>`) |

## The order

1. ema-test merges main into `token-free-cargo-live` (condition 1), the suite on the branch.
2. The harness runs [harness-pass-cargo.md](harness-pass-cargo.md): DA's own census first (the pass is DA's tree, not a
   list), phase A local, then the one batch with its backup; nothing published.
3. The user merges `token-free-cargo-live` into main: Cargo's theme goes live with its collapsed documents.
4. The changed documents are published (the pass's publish list).
5. Only then: Cargo's re-imports collapse themselves (cargo-import.mjs ends with collapse-docs.mjs, gated on the switch).
   A Cargo re-import list written before the switch (reimport-*-cargo*.txt) runs before step 2 or after step 3, never
   between (between, the import would write markers into documents the pass has collapsed).

## The list

The pass's list is DA's own census at the time of the pass. Yesterday's (2026-11-09, read-only dry run on DA's 990
documents): `collapse-lh-cargo-census-paths.txt`, 22 documents, 30 markers, all to the theme, loss and carrier checks 0
failed: en and de /add-on-services/personal-supervision, /smartuld, /sustainable-choice, /ci/environmental,
/ci/lccevo-event, /ebooking-info, /portfolio, /precheck, /qdo; es, fr, it, pt /ci/environmental. Cargo documents
re-imported since then are in the next census (step 2 counts DA's tree again).
