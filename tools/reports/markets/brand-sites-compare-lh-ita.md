# Pages: rendered DOM compared

2026-10-31T06:19:34.318Z. A: logs/compare/lh-ita-main, B: logs/compare/lh-ita-brand-sites. 7 of 8 pages equal (head, header, main, footer and html lang, after masking nonces, cache-busting queries, timestamps, randomised ids and animation state).

| Root | Page | Status A/B | Result | First difference |
| --- | --- | --- | --- | --- |
| it/it | /it/it/homepage | 200/200 | differs: head | head at 2768: «s/cards-icon/cards-icon.css"> <link rel="stylesheet" href="/blocks/accordion-columns/accordion-columns.css"> <link rel="stylesheet" href="/b» vs «s/cards-icon/cards-icon.css"> <link rel="stylesheet" href="/styles/showcase-notice.css"> <link rel="stylesheet" href="/blocks/accordion-colu» |
| it/it | /it/it/world-of-ita-airways/discover-ita-airways/inspired-by-alitalia | 200/200 | equal |  |
| it/en | /it/en/homepage | 200/200 | equal |  |
| it/en | /it/en/book-and-prepare/offers/mice | 200/200 | equal |  |
| it/en | /it/en/support/support-faq/baggage-faq | 200/200 | equal |  |
| it/en | /it/en/world-of-ita-airways/discover-ita-airways/sustainability/female-talent | 200/200 | equal |  |
| it/en | /it/en/world-of-ita-airways/travel-classes/business-long-haul | 200/200 | equal |  |
| it/en | /it/en/world-of-ita-airways/discover-ita-airways/fleet/long-haul | 200/200 | equal |  |
Noise floor: see brand-sites-compare-lh-com.md (head stylesheet order only).

