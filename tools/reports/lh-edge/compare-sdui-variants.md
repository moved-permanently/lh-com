# lh-edge app screens vs www (https://lhedge.bbird.live)

2026-10-26T20:28:42.238Z

v1: 12 URLs, 12 equal apart from the fields left out, 0 with differences (missing 0, extra 0, different 0)

v2: 15 URLs, 15 equal apart from the fields left out, 0 with differences (missing 0, extra 0, different 0)

Left out on purpose:
- id: www sends AEM node paths; lh-edge generates stable ids of its own
- normalised (listed per URL in the JSON): whitespace Document Authoring does not keep (spaces, &nbsp; and <br> at the end of a text, of a bold run or of a list item, at the start of a list item, "\n" at the end of a text, leading spaces, runs of spaces) and an editor style on <b> (<b style="font-size: 16px;">)

| URL | status | equal | missing | extra | different (first) | Cache-Control www / lh-edge |
|---|---|---|---|---|---|---|
| /content/mobile/lh/de/articles.ios.sdui | 200 | yes |  |  |  | (none) / (none) |
| /content/mobile/lh/de/articles.nocache.sdui | 200 | yes |  |  |  | max-age=600 / max-age=600 |
| /content/mobile/lh/de/articles.ios.v2.sdui | 200 | yes |  |  |  | (none) / (none) |
| /content/mobile/lh/de/articles.v2.ios.sdui | 200 | yes |  |  |  | (none) / (none) |
| /content/mobile/lh/de/articles.nocache.v2.sdui | 200 | yes |  |  |  | max-age=600 / max-age=600 |
| /content/mobile/lh/de/articles.v2.nocache.sdui | 200 | yes |  |  |  | max-age=600 / max-age=600 |
| /content/mobile/lh/de/articles.ios.nocache.sdui | 200 | yes |  |  |  | max-age=600 / max-age=600 |
| /content/mobile/lh/de/articles.sdui | 200 | yes |  |  |  | (none) / (none) |
| /content/mobile/lh/de/articles.v2.sdui | 200 | yes |  |  |  | (none) / (none) |
| /content/mobile/lh/de/articles/a-perfect-day-in-london.ios.sdui | 200 | yes |  |  |  | (none) / (none) |
| /content/mobile/lh/de/articles/a-perfect-day-in-london.nocache.sdui | 200 | yes |  |  |  | max-age=600 / max-age=600 |
| /content/mobile/lh/de/articles/a-perfect-day-in-london.ios.v2.sdui | 200 | yes |  |  |  | (none) / (none) |
| /content/mobile/lh/de/articles/a-perfect-day-in-london.v2.ios.sdui | 200 | yes |  |  |  | (none) / (none) |
| /content/mobile/lh/de/articles/a-perfect-day-in-london.nocache.v2.sdui | 200 | yes |  |  |  | max-age=600 / max-age=600 |
| /content/mobile/lh/de/articles/a-perfect-day-in-london.v2.nocache.sdui | 200 | yes |  |  |  | max-age=600 / max-age=600 |
| /content/mobile/lh/de/articles/a-perfect-day-in-london.ios.nocache.sdui | 200 | yes |  |  |  | max-age=600 / max-age=600 |
| /content/mobile/lh/de/articles/a-perfect-day-in-london.sdui | 200 | yes |  |  |  | (none) / (none) |
| /content/mobile/lh/de/articles/a-perfect-day-in-london.v2.sdui | 200 | yes |  |  |  | (none) / (none) |
| /content/mobile/lh/de/homepage.ios.sdui | 200 | yes |  |  |  | (none) / (none) |
| /content/mobile/lh/de/homepage.nocache.sdui | 200 | yes |  |  |  | max-age=600 / max-age=600 |
| /content/mobile/lh/de/homepage.ios.v2.sdui | 200 | yes |  |  |  | (none) / (none) |
| /content/mobile/lh/de/homepage.v2.ios.sdui | 200 | yes |  |  |  | (none) / (none) |
| /content/mobile/lh/de/homepage.nocache.v2.sdui | 200 | yes |  |  |  | max-age=600 / max-age=600 |
| /content/mobile/lh/de/homepage.v2.nocache.sdui | 200 | yes |  |  |  | max-age=600 / max-age=600 |
| /content/mobile/lh/de/homepage.ios.nocache.sdui | 200 | yes |  |  |  | max-age=600 / max-age=600 |
| /content/mobile/lh/de/homepage.sdui | 200 | yes |  |  |  | (none) / (none) |
| /content/mobile/lh/de/homepage.v2.sdui | 200 | yes |  |  |  | (none) / (none) |
