# TAP market comparison, the rest (brief 488, 2026-11-08)

- **What was left:** of the 14,857 pairs (`md-pairs-tap.mjs` today: unchanged since 2026-11-07), my runs had read 5,801
  (brief 462); the 9,056 the first run had found the same were not read here (9,266 pages, 210 of them version
  pages). Not 4,527: no count of that size in the lists, the reports or the runs.
- **Fetched today:** `md-run.sh` on www.flytap.com, one page every 2.5 s, from 06:10 UTC (a pause of 22 minutes for
  the inspiration page's two loads): 1,508 pages answered, then from 08:02:22 every page a 404 (349 in a row,
  version pages that answered the day before among them: www no longer answering this client, or an outage, not
  missing pages). Stopped at 08:16; not started again today. The 349 rows are out of `fetch.jsonl`
  (`runs/tap/fetch-404-488.jsonl`, gitignored), so the next run asks them again.
- **Compared:** 1,741 more pairs (both pages read): 1,718 the same (70 of them differing in the root's own links
  only), 23 root redirects, no content difference: nothing to import from them.
- **Pending:** 7,315 pairs (`runs/tap-pending-after-488.tsv`, gitignored), for the next run.

## Redirects (a proposal per group)

| Group | Today | Proposal |
| --- | --- | --- |
| A root page redirects on www, the replica serves the version's page (the first run: 268) | 24 in 7,542 pairs: one to four roots a page, no market and no page type in common (/pt-pt/a-bordo/refeicoes/especiais: pt-eg, pt-se, pt-st, pt-tg; /en-pt/miles-and-go: en-gb …) | leave: no lh-edge redirect; scattered single roots look like www's passing redirects, not pages it moved. The targets are not logged (md-fetch asks them in a second pass at a run's end, which today's run did not reach): read them in the next run before deciding |
| A version page redirects (the first run: 237 off the host) | 5 (/fr-fr/aide/questions-frequentes, /de-de/buchungen/gift-card, /pt-pt/gerir-reserva/extras/upgrades/preco-fixo, /pt-pt/info-legal/ciberseguranca, /en-pt/on-board/entertainment), targets not logged | leave until the targets are read: a version page's own redirect on www would be a redirect in lh-tap's redirects sheet for the version and its roots (not lh-edge's), or an own document if www serves the roots another page |

## The FAQs

`/en-pt/help/frequently-asked-questions` and `/pt-pt/ajuda/perguntas-frequentes` re-imported (DA's copies as the base,
the br and us variants as before, www's current questions): uploaded and previewed, `publish-list-488-faq.txt`.
