# Regional differences in Document Authoring (what a rollout would replace)

2026-10-27T06:09:23.765Z

Source: the DA documents of every row of `tools/migration-scope/pages.csv`. Normalised before comparing: the locale prefix in links and media, the market in `country=`/`market=` query parameters and `/<cc>_<ll>` file names, whitespace. Text is compared as the multiset of block-level texts (−removed from the source / +added in the market).

## at/de vs de/de

975 rows: 913 identical, 56 differ, 6 not compared (missing in DA: /de/de/lufthansa-city/menu-card, /at/de/lufthansa-city/menu-card; no pair in the scope).

Of the 913 identical pages only 5 are identical byte for byte (/at/de/lufthansa-city/culinaryjourney, /at/de/articles/authors, /at/de/prepare-for-your-trip/special-travel-needs/travel-with-needs/special-needs-online-form/confirmation, /at/de/good-for-train, /at/de/book-and-manage/trip-management); the others differ in the market of their links only (/at/de/… against /de/de/…, country=…). The app's rollout copies links as they are (no DNT step, views/rollout/index.js), so a rollout with merge marks each of those links as a difference (keep the local side), and one with overwrite would point the market's links at the source market.

- by kind: text 47, links 25, images 4, blocks 3, metadata 8
- by template group (differ/rows): app-entry 2/6, campaign 11/22, fleet 3/8, flight-status 1/1, form 1/9, homepage 1/1, hub 4/17, info 30/183, insights 3/697, legal 0/30, mfe 0/1
- metadata keys that differ: llms-description 5, llms-title 5, llms-category 5, llms-include 5, title 2, og:title 2, ai-guidance 1, breadcrumb title 1, description 1, canonical 1, theme 1, parent 1

### Biggest differences

| target | group | size | differences |
|---|---|---|---|
| /at/de/homepage | homepage | 515 | text −87/+113 ("VIE"); links −139/+165 ("/de/de/during-your-trip/lhg-wifi"); images −3/+3; metadata ai-guidance, llms-description, llms-title, llms-category, llms-include |
| /at/de/feedback-past-flight | form | 140 | text −68/+67 ("Feedback zu einem früheren Flug"); links −1/+2 ("/content/dam/lufthansa-group/pdfs/lhg-power-of-attorney-form-en.pdf"); metadata title, og:title |
| /at/de/book-and-manage/flights/lufthansa-voucher | info | 95 | text −68/+18 ("Nutzungsbedingungen für den Kauf von Gutschein"); links −6/+1 ("https://admin.vp-lhg.com/lh/sales_refunds/new?locale=de"); blocks −[accordion-columns] +[]; metadata breadcrumb title |
| /at/de/rechnungsbeleg | info | 71 | text −9/+31 ("Rechnungsbeleg (Passenger Receipt)"); links −2/+21 ("https://my.information.lufthansa.com/documents?lg=DE"); blocks −[] +[columns-media, columns-media]; metadata title, description, og:title, canonical, theme, parent |
| /at/de/fluege | hub | 24 | text −8/+6 ("Konditionen"); links −2/+1 ("https://lufthansa.travel-regulations.com/?language=de&apptarget=extern"); images −1/+1; blocks −[] +[section-metadata]; metadata llms-description, llms-title, llms-category, llms-include |
| /at/de/hotelangebote | info | 18 | text −12/+6 ("Zielort") |
| /at/de/100-years/destinations | campaign | 13 | text −9/+0; links −4/+0 ("https://www.lufthansa.com/lhg/de/de/dest/cy/berlin") |
| /at/de/flugsuche | app-entry | 10 | text −3/+3 ("Nachhaltiger Fliegen {heading-copytext-large}"); links −1/+1 ("/de/de/nachhaltiger-fliegen"); images −1/+1 |
| /at/de/first-class | info | 10 | text −9/+0; links −1/+0 ("/de/de/flugsuche") |
| /at/de/upgrademoeglichkeiten | info | 10 | links −5/+5 ("https://www.lufthansa.com/artifacts/flight-upgrades/fix-price-upgrade/") |
| /at/de/business-class | info | 9 | text −6/+0; links −3/+0 ("/de/de/flugsuche") |
| /at/de/premium-economy-class | info | 9 | text −6/+0; links −3/+0 ("/de/de/flugsuche") |
| /at/de/discover-lufthansa/new-onboard-experience | campaign | 8 | text −7/+0; links −1/+0 ("/de/de/premium-economy-class") |
| /at/de/economy-class | info | 7 | text −5/+0; links −2/+0 ("https://www.lufthansa.com/de/de/discover-lufthansa/allegris/economy") |
| /at/de/online-check-in-mit-der-ganzen-familie | info | 6 | images −3/+3 |

<details><summary>All 56 pages that differ</summary>

| target | group | differences |
|---|---|---|
| /at/de/100-years | campaign | text −4/+0; links −1/+0 ("/de/de/100-years/chronicle") |
| /at/de/100-years/campaigns | campaign | text −1/+0 |
| /at/de/100-years/chronicle | campaign | text −3/+0 |
| /at/de/100-years/destinations | campaign | text −9/+0; links −4/+0 ("https://www.lufthansa.com/lhg/de/de/dest/cy/berlin") |
| /at/de/100-years/fleet | campaign | text −1/+0 |
| /at/de/100-years/global-network | campaign | text −1/+0 |
| /at/de/100-years/history | campaign | text −4/+0; links −1/+0 ("/de/de/100-years/chronicle") |
| /at/de/100-years/history/menu-on-board | campaign | text −1/+0 |
| /at/de/320 | fleet | text −1/+0 |
| /at/de/32n | fleet | text −1/+0 |
| /at/de/additional-services | hub | text −5/+0 |
| /at/de/advice-for-travellers-with-special-needs-to-and-from-the-usa | info | text −1/+0 |
| /at/de/articles/highlights | insights | links −2/+2 ("https://www.lufthansa.com/de/de/articles/highlights/soccer-event-in-no") |
| /at/de/articles/highlights-european-championship/scotland-with-heart-and-energy | insights | links −1/+1 ("/de/de/fluege") |
| /at/de/articles/highlights/all-it-takes-is-a-yes | insights | text −3/+3 ("MUC") |
| /at/de/book-and-manage/flights/air-baltic | info | text −2/+0 |
| /at/de/book-and-manage/flights/lufthansa-voucher | info | text −68/+18 ("Nutzungsbedingungen für den Kauf von Gutschein"); links −6/+1 ("https://admin.vp-lhg.com/lh/sales_refunds/new?locale=de"); blocks −[accordion-columns] +[]; metadata breadcrumb title |
| /at/de/book-and-manage/flights/wetlease-hub | info | text −2/+0 |
| /at/de/book-and-manage/stopover | campaign | text −1/+2 ("Nonstop label") |
| /at/de/business-class | info | text −6/+0; links −3/+0 ("/de/de/flugsuche") |
| /at/de/discover-lufthansa/lufthansa-fleet/351 | fleet | text −1/+0 |
| /at/de/discover-lufthansa/miles-and-more-credit-card | info | text −1/+0 |
| /at/de/discover-lufthansa/new-onboard-experience | campaign | text −7/+0; links −1/+0 ("/de/de/premium-economy-class") |
| /at/de/discover-lufthansa/take-off | campaign | links −1/+1 ("/de/de/fluege") |
| /at/de/during-your-trip/internet-overview | info | text −1/+0 |
| /at/de/during-your-trip/lhg-wifi | info | text −1/+0 |
| /at/de/economy-class | info | text −5/+0; links −2/+0 ("https://www.lufthansa.com/de/de/discover-lufthansa/allegris/economy") |
| /at/de/feedback-past-flight | form | text −68/+67 ("Feedback zu einem früheren Flug"); links −1/+2 ("/content/dam/lufthansa-group/pdfs/lhg-power-of-attorney-form-en.pdf"); metadata title, og:title |
| /at/de/first-class | info | text −9/+0; links −1/+0 ("/de/de/flugsuche") |
| /at/de/first-class-terminal | info | text −4/+0 |
| /at/de/fluege | hub | text −8/+6 ("Konditionen"); links −2/+1 ("https://lufthansa.travel-regulations.com/?language=de&apptarget=extern"); images −1/+1; blocks −[] +[section-metadata]; metadata llms-description, llms-title, llms-category, llms-include |
| /at/de/flugplan-und-flugstatus | flight-status | metadata llms-description, llms-title, llms-category, llms-include |
| /at/de/flugsuche | app-entry | text −3/+3 ("Nachhaltiger Fliegen {heading-copytext-large}"); links −1/+1 ("/de/de/nachhaltiger-fliegen"); images −1/+1 |
| /at/de/flynet | info | text −3/+0; links −1/+1 ("https://lufthansa.miles-and-more.com/web/row/de/enrolment.html?client_") |
| /at/de/free2move | info | text −3/+2 ("Noch kein Free2move Kunde? Sichern Sie sich 50 % auf Ihre ersten 3 Fah") |
| /at/de/gepaeck | hub | metadata llms-description, llms-title, llms-category, llms-include |
| /at/de/homepage | homepage | text −87/+113 ("VIE"); links −139/+165 ("/de/de/during-your-trip/lhg-wifi"); images −3/+3; metadata ai-guidance, llms-description, llms-title, llms-category, llms-include |
| /at/de/hotelangebote | info | text −12/+6 ("Zielort") |
| /at/de/kindermenues-an-bord | info | text −2/+0; links −1/+0 ("https://www.lufthansa.com/de/de/anmeldung") |
| /at/de/onboard-delights | info | text −2/+0; links −1/+0 ("/de/de/culinaryjourney") |
| /at/de/online-check-in | app-entry | metadata llms-description, llms-title, llms-category, llms-include |
| /at/de/online-check-in-mit-der-ganzen-familie | info | images −3/+3 |
| /at/de/passengers-with-sensory-impairment | info | text −1/+0 |
| /at/de/premium-economy-class | info | text −6/+0; links −3/+0 ("/de/de/flugsuche") |
| /at/de/prepare-for-your-trip/getting-to-and-from-the-airport/lufthansa-express-rail-briefing | info | text −3/+3 ("Während der Zugfahrt führen Sie Ihr Gepäck bitte selbst mit. Für eine ") |
| /at/de/prepare-for-your-trip/special-travel-needs/travel-with-needs/cognitive-impairment | info | text −1/+0 |
| /at/de/prepare-for-your-trip/special-travel-needs/travel-with-needs/hearing-impairment | info | text −1/+0 |
| /at/de/prepare-for-your-trip/special-travel-needs/travel-with-needs/travel-companion | info | text −1/+0 |
| /at/de/prepare-for-your-trip/special-travel-needs/travel-with-needs/visual-impairment | info | text −1/+0 |
| /at/de/rechnungsbeleg | info | text −9/+31 ("Rechnungsbeleg (Passenger Receipt)"); links −2/+21 ("https://my.information.lufthansa.com/documents?lg=DE"); blocks −[] +[columns-media, columns-media]; metadata title, description, og:title, canonical, theme, parent |
| /at/de/shopping | info | text −4/+0; links −2/+0 ("https://www.worldshop.eu/?cid=web_jc7UXD&placementid=web_dlh_homepage_") |
| /at/de/sondermahlzeiten | info | text −2/+0; links −1/+0 ("https://www.lufthansa.com/de/de/anmeldung") |
| /at/de/speisen-und-getraenke | hub | text −2/+0; links −1/+0 ("/de/de/culinaryjourney") |
| /at/de/tips-senior-travellers | info | text −4/+0 |
| /at/de/traveltricks | info | links −1/+1 ("/de/de/fluege") |
| /at/de/upgrademoeglichkeiten | info | links −5/+5 ("https://www.lufthansa.com/artifacts/flight-upgrades/fix-price-upgrade/") |

</details>

## gb/en vs de/en

975 rows: 910 identical, 60 differ, 5 not compared (missing in DA: /de/en/lufthansa-city/menu-card, /gb/en/lufthansa-city/menu-card; no pair in the scope).

Of the 910 identical pages only 6 are identical byte for byte (/gb/en/lufthansa-city/culinaryjourney, /gb/en/prepare-for-your-trip/current-travel-information, /gb/en/articles/authors, /gb/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/special-needs-online-form/confirmation, /gb/en/good-for-train, /gb/en/book-and-manage/trip-management); the others differ in the market of their links only (/gb/en/… against /de/en/…, country=…). The app's rollout copies links as they are (no DNT step, views/rollout/index.js), so a rollout with merge marks each of those links as a difference (keep the local side), and one with overwrite would point the market's links at the source market.

- by kind: text 53, links 26, images 4, blocks 1, metadata 4
- by template group (differ/rows): app-entry 2/6, campaign 10/22, fleet 4/8, flight-status 0/1, form 1/9, homepage 1/1, hub 3/17, info 34/183, insights 4/697, legal 1/30, mfe 0/1
- metadata keys that differ: breadcrumb title 2, title 2, theme 2, description 1, image 1, og:title 1, og:description 1

### Biggest differences

| target | group | size | differences |
|---|---|---|---|
| /gb/en/homepage | homepage | 556 | text −97/+116 ("FRA"); links −137/+164 ("https://www.lufthansa.com/de/en/local-page/offers.html"); images −21/+21 |
| /gb/en/book-and-manage/flights/lufthansa-voucher | info | 97 | text −70/+18 ("Terms of use for the purchase of Gift Card"); links −6/+1 ("https://admin.vp-lhg.com/lh/sales_refunds/new?locale=en"); blocks −[accordion-columns] +[]; metadata breadcrumb title |
| /gb/en/green-fare | info | 69 | text −28/+29 ("Impact Fares: A fare that supports lower-emission aviation"); links −1/+0 ("https://www.lufthansa.com/de/en/prepare-for-your-trip/baggage/baggage-"); images −3/+1; metadata title, description, image, og:title, theme, breadcrumb title, og:description |
| /gb/en/book-and-manage/additional-services/travel-insurances | info | 21 | text −10/+11 ("UK Residents only: {full-width}") |
| /gb/en/cookie-policy | legal | 20 | text −6/+14 ("(script/cookie)") |
| /gb/en/hotel-offers | info | 16 | text −11/+5 ("Destination") |
| /gb/en/100-years/destinations | campaign | 13 | text −9/+0; links −4/+0 ("https://www.lufthansa.com/lhg/de/en/dest/cy/berlin") |
| /gb/en/flight-search | app-entry | 10 | text −3/+3 ("More sustainable flying"); links −1/+1 ("/de/en/fly-more-sustainabl"); images −1/+1 |
| /gb/en/first-class | info | 10 | text −9/+0; links −1/+0 ("/de/en/flight-search") |
| /gb/en/upgrade-options | info | 10 | links −5/+5 ("https://www.lufthansa.com/artifacts/flight-upgrades/fix-price-upgrade/") |
| /gb/en/business-class | info | 9 | text −6/+0; links −3/+0 ("/de/en/flight-search") |
| /gb/en/economy-class | info | 9 | text −6/+0; links −3/+0 ("/de/en/flight-search") |
| /gb/en/premium-economy-class | info | 9 | text −6/+0; links −3/+0 ("/de/en/flight-search") |
| /gb/en/book-and-manage/stopover | campaign | 8 | text −4/+2 ("Economy, 1 traveller"); links −1/+1 ("http://lh.fltmaps.com/en") |
| /gb/en/discover-lufthansa/new-onboard-experience | campaign | 8 | text −7/+0; links −1/+0 ("/de/en/premium-economy-class") |

<details><summary>All 60 pages that differ</summary>

| target | group | differences |
|---|---|---|
| /gb/en/100-years | campaign | text −4/+0; links −1/+0 ("/de/en/100-years/chronicle") |
| /gb/en/100-years/campaigns | campaign | text −1/+0 |
| /gb/en/100-years/chronicle | campaign | text −3/+0 |
| /gb/en/100-years/destinations | campaign | text −9/+0; links −4/+0 ("https://www.lufthansa.com/lhg/de/en/dest/cy/berlin") |
| /gb/en/100-years/fleet | campaign | text −1/+0 |
| /gb/en/100-years/global-network | campaign | text −1/+0 |
| /gb/en/100-years/history | campaign | text −4/+0; links −1/+0 ("/de/en/100-years/chronicle") |
| /gb/en/100-years/history/menu-on-board | campaign | text −1/+0 |
| /gb/en/320 | fleet | text −1/+0 |
| /gb/en/32n | fleet | text −1/+0 |
| /gb/en/additional-services | hub | text −5/+0 |
| /gb/en/advice-for-travellers-with-special-needs-to-and-from-the-usa | info | text −1/+0 |
| /gb/en/articles/explore-the-world | insights | links −1/+1 ("https://www.lufthansa.com/de/en/articles/tags/chennai") |
| /gb/en/articles/explore-the-world/a-perfect-day-toronto-in-one-day | insights | metadata title |
| /gb/en/articles/highlights | insights | links −2/+2 ("https://www.lufthansa.com/de/en/articles/highlights/soccer-event-in-no") |
| /gb/en/articles/tags | insights | links −1/+1 ("https://www.lufthansa.com/de/en/articles/tags/chennai") |
| /gb/en/boeing787 | fleet | text −1/+0 |
| /gb/en/book-and-manage/additional-services/travel-insurances | info | text −10/+11 ("UK Residents only: {full-width}") |
| /gb/en/book-and-manage/flights/air-baltic | info | text −2/+0 |
| /gb/en/book-and-manage/flights/lufthansa-voucher | info | text −70/+18 ("Terms of use for the purchase of Gift Card"); links −6/+1 ("https://admin.vp-lhg.com/lh/sales_refunds/new?locale=en"); blocks −[accordion-columns] +[]; metadata breadcrumb title |
| /gb/en/book-and-manage/flights/wetlease-hub | info | text −2/+0 |
| /gb/en/book-and-manage/stopover | campaign | text −4/+2 ("Economy, 1 traveller"); links −1/+1 ("http://lh.fltmaps.com/en") |
| /gb/en/business-class | info | text −6/+0; links −3/+0 ("/de/en/flight-search") |
| /gb/en/check-in-with-the-family | info | links −1/+0 ("/de/en/pre-check-in"); images −3/+3 |
| /gb/en/childrens-menus-on-board | info | text −2/+0; links −1/+0 ("https://www.lufthansa.com/de/en/login") |
| /gb/en/cookie-policy | legal | text −6/+14 ("(script/cookie)") |
| /gb/en/discover-lufthansa/lufthansa-fleet/351 | fleet | text −1/+0 |
| /gb/en/discover-lufthansa/miles-and-more-credit-card | info | text −1/+0 |
| /gb/en/discover-lufthansa/new-onboard-experience | campaign | text −7/+0; links −1/+0 ("/de/en/premium-economy-class") |
| /gb/en/during-your-trip/internet-overview | info | text −2/+1 ("Entertainment {heading-small}") |
| /gb/en/during-your-trip/lhg-wifi | info | text −1/+0 |
| /gb/en/economy-class | info | text −6/+0; links −3/+0 ("/de/en/flight-search") |
| /gb/en/europa-tarife-economy-class | info | text −1/+1 ("Impact Fares") |
| /gb/en/europcar | info | text −3/+0 |
| /gb/en/farealert/best-price-alert | form | text −4/+0 |
| /gb/en/first-class | info | text −9/+0; links −1/+0 ("/de/en/flight-search") |
| /gb/en/first-class-terminal | info | text −4/+0 |
| /gb/en/flight-search | app-entry | text −3/+3 ("More sustainable flying"); links −1/+1 ("/de/en/fly-more-sustainabl"); images −1/+1 |
| /gb/en/flights | hub | text −3/+0 |
| /gb/en/flynet | info | text −3/+0; links −1/+1 ("https://lufthansa.miles-and-more.com/web/row/en/enrolment.html?client_") |
| /gb/en/food-and-beverages | hub | text −2/+0; links −1/+0 ("/de/en/culinaryjourney") |
| /gb/en/free2move | info | text −1/+1 ("Not a Free2move customer yet? Get EUR 10 starting credit."); links −1/+1 ("https://www.share-now.com/de/en/lufthansa/") |
| /gb/en/green-fare | info | text −28/+29 ("Impact Fares: A fare that supports lower-emission aviation"); links −1/+0 ("https://www.lufthansa.com/de/en/prepare-for-your-trip/baggage/baggage-"); images −3/+1; metadata title, description, image, og:title, theme, breadcrumb title, og:description |
| /gb/en/homepage | homepage | text −97/+116 ("FRA"); links −137/+164 ("https://www.lufthansa.com/de/en/local-page/offers.html"); images −21/+21 |
| /gb/en/hotel-offers | info | text −11/+5 ("Destination") |
| /gb/en/my-bookings | app-entry | text −1/+0 |
| /gb/en/onboard-delights | info | text −2/+0; links −1/+0 ("/de/en/culinaryjourney") |
| /gb/en/passengers-with-sensory-impairment | info | text −1/+0 |
| /gb/en/premium-economy-class | info | text −6/+0; links −3/+0 ("/de/en/flight-search") |
| /gb/en/prepare-for-your-trip/special-travel-needs/medical-travel-companions | info | text −1/+1 ("To the services"); links −1/+1 ("https://bookings.medicaltravelcompanions.com/aff/LH/prsfks7v") |
| /gb/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/cognitive-impairment | info | text −1/+0 |
| /gb/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/hearing-impairment | info | text −1/+0 |
| /gb/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/travel-companion | info | text −1/+0 |
| /gb/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/visual-impairment | info | text −1/+0 |
| /gb/en/refund | info | metadata theme |
| /gb/en/shopping | info | text −4/+0; links −2/+0 ("https://www.worldshop.eu/?cid=web_jc7UXD&placementid=web_dlh_homepage_") |
| /gb/en/special-meals | info | text −2/+0; links −1/+0 ("https://www.lufthansa.com/de/en/login") |
| /gb/en/support/support | info | text −2/+1 ("Find answers and contact options for your request.") |
| /gb/en/tips-senior-travellers | info | text −4/+0 |
| /gb/en/upgrade-options | info | links −5/+5 ("https://www.lufthansa.com/artifacts/flight-upgrades/fix-price-upgrade/") |

</details>
