# Web pages as SDUI: https://lhedge.bbird.live vs www

2026-10-27T08:25:22.029Z

4/8 recorded web answers equal (deliberate differences aside, sdui-web-diff.mjs).

- 7people.sdui: equal (cache-control none); normalised: images 22, trailing whitespace 2, host 6, related article picks 12
  - related article picks: www ["“Everyone wants to fly with the cranes”","A Girl Named Lufthansa","Essentials: Unusual Lufthansa Cargo Shipments from 100 Years of Aviation History"], replica ["Lufthansa in the Spotlight","“Everyone wants to fly with the cranes”","Welcome to My World: Elyas M’Barek"]
- 7people.ios.sdui: equal (cache-control none); normalised: images 22, trailing whitespace 2, host 6, related article picks 12
  - related article picks: www ["“Everyone wants to fly with the cranes”","A Girl Named Lufthansa","Essentials: Unusual Lufthansa Cargo Shipments from 100 Years of Aviation History"], replica ["Lufthansa in the Spotlight","“Everyone wants to fly with the cranes”","Welcome to My World: Elyas M’Barek"]
- 7people.v2.sdui: equal (cache-control none); normalised: ids 96, images 22, trailing whitespace 2, host 6, related article picks 15
  - related article picks: www ["“Everyone wants to fly with the cranes”","A Girl Named Lufthansa","Essentials: Unusual Lufthansa Cargo Shipments from 100 Years of Aviation History"], replica ["Lufthansa in the Spotlight","“Everyone wants to fly with the cranes”","Welcome to My World: Elyas M’Barek"]
- 7people.nocache.v2.sdui: equal (cache-control max-age=600); normalised: ids 96, images 22, trailing whitespace 2, host 6, related article picks 15
  - related article picks: www ["“Everyone wants to fly with the cranes”","A Girl Named Lufthansa","Essentials: Unusual Lufthansa Cargo Shipments from 100 Years of Aviation History"], replica ["Lufthansa in the Spotlight","“Everyone wants to fly with the cranes”","Welcome to My World: Elyas M’Barek"]
- faq-refund.sdui: 404 — not on the replica: /de/en/support/faq/faq-refund is not in tools/migration-scope/pages.csv
- faq-refund.ios.sdui: 404 — not on the replica: /de/en/support/faq/faq-refund is not in tools/migration-scope/pages.csv
- faq-refund.v2.sdui: 404 — not on the replica: /de/en/support/faq/faq-refund is not in tools/migration-scope/pages.csv
- faq-refund.nocache.v2.sdui: 404 — not on the replica: /de/en/support/faq/faq-refund is not in tools/migration-scope/pages.csv
- short spelling /de/en/…/7-people-who-shaped-lufthansa-history.v2.sdui: 200 text/html; charset=utf-8
- multiwidth page /content/lh/markets/de/en/baggage.v2.sdui: 404
- homepage /content/lh/markets/de/en/homepage.sdui: 404
