# Pages: rendered DOM compared

2026-10-31T06:19:31.109Z. A: logs/compare/lh-com-main, B: logs/compare/lh-com-brand-sites. 18 of 19 pages equal (head, header, main, footer and html lang, after masking nonces, cache-busting queries, timestamps, randomised ids and animation state).

| Root | Page | Status A/B | Result | First difference |
| --- | --- | --- | --- | --- |
| de/en | /de/en/homepage | 200/200 | differs: head | head at 2714: «fare-teaser/fare-teaser.css"> <link rel="stylesheet" href="/blocks/carousel-cards/carousel-cards.css"> <link rel="stylesheet" href="/styles/» vs «fare-teaser/fare-teaser.css"> <link rel="stylesheet" href="/styles/showcase-notice.css"> <link rel="stylesheet" href="/blocks/carousel-cards» |
| de/en | /de/en/feedback-past-flight | 200/200 | equal |  |
| de/en | /de/en/articles/explore-flying/7-people-who-shaped-lufthansa-history | 200/200 | equal |  |
| de/en | /de/en/flights | 200/200 | equal |  |
| de/de | /de/de/homepage | 200/200 | equal |  |
| de/de | /de/de/feedback-past-flight | 200/200 | equal |  |
| de/de | /de/de/fluege | 200/200 | equal |  |
| de/de | /de/de/first-class | 200/200 | equal |  |
| de/de | /de/de/sitzplaene | 200/200 | equal |  |
| de/de | /de/de/handgepaeck | 200/200 | equal |  |
| de/de | /de/de/unterhaltung-an-bord | 200/200 | equal |  |
| de/de | /de/de/fliegen-mit-kindern | 200/200 | equal |  |
| at/de | /at/de/homepage | 200/200 | equal |  |
| gb/en | /gb/en/homepage | 200/200 | equal |  |
| gb/en | /gb/en/flights | 200/200 | equal |  |
| mk/de | /mk/de/articles/munich | 200/200 | equal |  |
| eg/en | /eg/en/discover-lufthansa/carbon-offsetting1/carbon-offsetting/faq-saf | 200/200 | equal |  |
| ke/en | /ke/en/homepage | 200/200 | equal |  |
| nz/en | /nz/en/local-page/nz-multi-city | 200/200 | equal |  |
Noise floor (main against main, same day): lh-com 18/19, lh-discover 7/8, lh-ita 8/8 equal; every difference in either run is the order of the head's stylesheet links (load order). The pages differing here (lh-com /de/en/homepage, lh-ita /it/it/homepage) have the same head elements as sets (38/38, 37/37).

