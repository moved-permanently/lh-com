# lh-edge app screens vs www (local render)

2026-10-25T20:57:26.377Z

v1: 66 URLs, 66 equal apart from the fields left out, 0 with differences (missing 0, extra 0, different 0)

v2: 66 URLs, 66 equal apart from the fields left out, 0 with differences (missing 0, extra 0, different 0)

Left out on purpose:
- id: www sends AEM node paths; lh-edge generates stable ids of its own
- normalised (listed per URL in the JSON): whitespace Document Authoring does not keep (spaces, &nbsp; and <br> at the end of a text or of a bold run, "\n" at the end of a text, leading spaces, runs of spaces) and an editor style on <b> (<b style="font-size: 16px;">)

| URL | status | equal | missing | extra | different (first) |
|---|---|---|---|---|---|
| /content/mobile/lh/de/articles.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/de/articles.v2.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/de/articles/a-perfect-day-in-chicago.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/de/articles/a-perfect-day-in-chicago.v2.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/de/articles/a-perfect-day-in-frankfurt.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/de/articles/a-perfect-day-in-frankfurt.v2.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/de/articles/a-perfect-day-in-london.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/de/articles/a-perfect-day-in-london.v2.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/de/articles/a-perfect-day-in-munich.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/de/articles/a-perfect-day-in-munich.v2.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/de/articles/a-perfect-day-in-new-york.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/de/articles/a-perfect-day-in-new-york.v2.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/de/articles/a-perfect-day-in-singapore.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/de/articles/a-perfect-day-in-singapore.v2.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/de/articles/africa.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/de/articles/africa.v2.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/de/articles/africa/a-perfect-day-in-cape-town.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/de/articles/africa/a-perfect-day-in-cape-town.v2.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/de/articles/africa/a-perfect-day-johannesburg-in-one-day.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/de/articles/africa/a-perfect-day-johannesburg-in-one-day.v2.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/de/articles/africa/essentials-cape-town-facts.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/de/articles/africa/essentials-cape-town-facts.v2.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/de/articles/asia.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/de/articles/asia.v2.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/de/articles/asia/a-perfect-day-in-hong-kong.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/de/articles/asia/a-perfect-day-in-hong-kong.v2.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/de/articles/comfort-on-board.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/de/articles/comfort-on-board.v2.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/de/articles/discover-allegris.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/de/articles/discover-allegris.v2.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/de/articles/discover-allegris/allegris-essentials.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/de/articles/discover-allegris/allegris-essentials.v2.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/de/articles/discover-allegris/allegris-fox.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/de/articles/discover-allegris/allegris-fox.v2.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/de/articles/discover-allegris/lufthansa-allegris-what-type-of-passenger-are-you.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/de/articles/discover-allegris/lufthansa-allegris-what-type-of-passenger-are-you.v2.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/de/articles/discover-allegris/the-perfect-flight-with-dirk-nowitzki.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/de/articles/discover-allegris/the-perfect-flight-with-dirk-nowitzki.v2.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/de/articles/essentials-of-barcelona.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/de/articles/essentials-of-barcelona.v2.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/de/articles/essentials-of-mexico-city.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/de/articles/essentials-of-mexico-city.v2.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/de/articles/essentials-of-paris.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/de/articles/essentials-of-paris.v2.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/de/articles/essentials-of-rio-de-janeiro.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/de/articles/essentials-of-rio-de-janeiro.v2.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/de/articles/essentials-of-shanghai.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/de/articles/essentials-of-shanghai.v2.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/de/articles/europe.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/de/articles/europe.v2.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/de/articles/help-alliance-leading-self-determined-lives.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/de/articles/help-alliance-leading-self-determined-lives.v2.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/de/articles/north-america.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/de/articles/north-america.v2.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/de/articles/south-america.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/de/articles/south-america.v2.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/de/articles/south-america/a-perfect-day-in-buenos-aires.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/de/articles/south-america/a-perfect-day-in-buenos-aires.v2.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/de/articles/south-america/a-perfect-day-in-rio-de-janeiro.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/de/articles/south-america/a-perfect-day-in-rio-de-janeiro.v2.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/de/articles/what-the-hack-best-seats.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/de/articles/what-the-hack-best-seats.v2.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/de/articles/what-the-hack-travel-with-kids.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/de/articles/what-the-hack-travel-with-kids.v2.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/de/homepage.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/de/homepage.v2.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/articles.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/articles.v2.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/articles/a-perfect-day-in-chicago.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/articles/a-perfect-day-in-chicago.v2.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/articles/a-perfect-day-in-frankfurt.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/articles/a-perfect-day-in-frankfurt.v2.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/articles/a-perfect-day-in-london.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/articles/a-perfect-day-in-london.v2.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/articles/a-perfect-day-in-munich.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/articles/a-perfect-day-in-munich.v2.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/articles/a-perfect-day-in-new-york.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/articles/a-perfect-day-in-new-york.v2.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/articles/a-perfect-day-in-singapore.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/articles/a-perfect-day-in-singapore.v2.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/articles/africa.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/articles/africa.v2.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/articles/africa/a-perfect-day-in-cape-town.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/articles/africa/a-perfect-day-in-cape-town.v2.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/articles/africa/a-perfect-day-johannesburg-in-one-day.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/articles/africa/a-perfect-day-johannesburg-in-one-day.v2.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/articles/africa/essentials-cape-town-facts.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/articles/africa/essentials-cape-town-facts.v2.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/articles/asia.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/articles/asia.v2.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/articles/asia/a-perfect-day-in-hong-kong.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/articles/asia/a-perfect-day-in-hong-kong.v2.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/articles/comfort-on-board.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/articles/comfort-on-board.v2.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/articles/discover-allegris.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/articles/discover-allegris.v2.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/articles/discover-allegris/allegris-essentials.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/articles/discover-allegris/allegris-essentials.v2.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/articles/discover-allegris/allegris-fox.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/articles/discover-allegris/allegris-fox.v2.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/articles/discover-allegris/lufthansa-allegris-what-type-of-passenger-are-you.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/articles/discover-allegris/lufthansa-allegris-what-type-of-passenger-are-you.v2.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/articles/discover-allegris/the-perfect-flight-with-dirk-nowitzki.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/articles/discover-allegris/the-perfect-flight-with-dirk-nowitzki.v2.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/articles/essentials-of-barcelona.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/articles/essentials-of-barcelona.v2.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/articles/essentials-of-mexico-city.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/articles/essentials-of-mexico-city.v2.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/articles/essentials-of-paris.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/articles/essentials-of-paris.v2.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/articles/essentials-of-rio-de-janeiro.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/articles/essentials-of-rio-de-janeiro.v2.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/articles/essentials-of-shanghai.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/articles/essentials-of-shanghai.v2.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/articles/europe.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/articles/europe.v2.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/articles/help-alliance-leading-self-determined-lives.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/articles/help-alliance-leading-self-determined-lives.v2.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/articles/north-america.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/articles/north-america.v2.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/articles/south-america.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/articles/south-america.v2.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/articles/south-america/a-perfect-day-in-buenos-aires.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/articles/south-america/a-perfect-day-in-buenos-aires.v2.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/articles/south-america/a-perfect-day-in-rio-de-janeiro.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/articles/south-america/a-perfect-day-in-rio-de-janeiro.v2.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/articles/what-the-hack-best-seats.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/articles/what-the-hack-best-seats.v2.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/articles/what-the-hack-travel-with-kids.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/articles/what-the-hack-travel-with-kids.v2.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/homepage.sdui | 200 | yes |  |  |  |
| /content/mobile/lh/en/homepage.v2.sdui | 200 | yes |  |  |  |
