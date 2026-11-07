- **Pairs:** 5,801 compared (the pending list; the first run's 9,056 pairs found the same are left out,
  `pending-summary.json`), fetched 2026-11-07 19:00 to 22:13 UTC without a challenge. 1,814 differ
  (content 1,696, links 118); 1 root page redirects on www.
- **md-replica-check:** 1,313 covered, 382 partly, 1 missing, 118 without a text difference. It
  reads each version document with every market's sections, so I checked each differing pair again
  against what the root is really served:
  - the version's DA document after `dropMarketSections` for the root's country, its remaining
    fragment blocks' documents included;
  - the root's and the version's fetched pages converted with `tap-import.mjs`'s `convertPage`;
  - the root's own texts must be there and the version's own texts not
    (`tools/markets/tap-view-check.mjs`).
- **That check's result:**
  - 1,474 already served as on www's root (market sections, fragments);
  - 229 differ on www in images, alt texts or link targets only;
  - 12 have their own documents (today's legal-info index pages);
  - **99 differ, on 9 version pages:**
    - pt-pt `/reservas/modalidades-de-pagamento`, all 57 pt roots: the "Pagamentos simples, seguros
      e flexíveis" hero instead of Portugal's Santander campaign, as en-pt got on 2026-11-07;
    - `/promos` of en-pt and pt-pt (18 roots each), es-es (es-us) and fr-fr (fr-ca): the roots'
      current promotion cards (Portugal Stopover's text, Iceland, Christmas);
    - the US-only American Express card offer on en-pt's, es-es' and pt-pt's miles-and-go
      promotions pages (en-us, es-us, pt-us).
- **Roots with the most rows in the report:** en-br 28, en-us 22, pt-us 22, en-ca 18, es-us 18.
- **For a decision:**
  - pt-pt payment-methods is version-local (all 57 roots agree, the version is Portugal's). I
    follow en-pt's precedent: the roots' hero as a section for every market except pt.
  - The alerts pages: www's version shows a Portuguese identity-card notice the importer does not
    render, so both views lack it. That's the version's own page, not a root difference.
- **The tool:** en-gb's Marriott link on `/miles-and-go/partners` is my check's artifact (the root
  code inside the external URL); nothing to import.
