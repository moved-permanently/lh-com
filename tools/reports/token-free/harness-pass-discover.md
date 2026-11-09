# Discover's collapse pass: the delta to ITA's (harness-pass-ita.md)

Everything in tools/reports/token-free/harness-pass-ita.md holds, with these values:

| | Discover |
| --- | --- |
| DA site | `moved-permanently/lh-discover` |
| documents | not the workspace's list. The workspace has 30 of Discover's documents (collapse-lh-discover-paths.txt: 24 with markers), but step 4's census of Discover's preview finds 470 of its 563 previewed documents with markers. The pass's list is DA's: download the site's tree and run `marker-collapse-cli.mjs --check`; its changed paths are the list (release order: de/en, de/de, then the others) |
| collapse | `--brand discover --force` |
| switch branch (don't merge or change it) | `token-free-discover-live` (f7b1214a), preview `https://token-free-discover-live--lh-discover--moved-permanently.aem.page` |
| host (published) | `https://discover.turnsthe.page` |
| backup folder | `/.token-free-backup/2026-11-discover/<path>.html` |
| batches | a canary of 20, then 100 per batch, as ITA's |

What the workspace's 24 documents reported (a sample of DA's 470; DA's totals scale with it): 24 documents changed; 285 markers, of which 279 are theme and 6 carriers, 0 for a person;
nothing left, no errors.
- Carriers written: 6 (Section Metadata space-m 2, divider 2; Divider blocks 2).
- Per document: 20 gain no carrier, 2 gain one, 2 gain two.
- Theme families: heading 177, column 74, separator 20, text-width 4, text-size 2, video 2.
- The loss check passes for all 24 in the workspace.

What changes on the site with Discover's theme (discover-pass-check.md):
- on flow pages the H2s are heading-small, and a Columns Media is a column view of its own (the column-view edges
  above and below, not at a section's start or end, not in tab panels);
- known and accepted: text in column views loses its padding (decisions.md 1; baggage -3.7 %), and `{spacer-30}` and
  smaller go (decisions.md 4).

Stop rule and rollback as for ITA.
