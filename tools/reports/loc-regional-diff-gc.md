# Regional differences in Document Authoring (what a rollout would replace)

2026-11-02T01:52:11.963Z

Source: the DA documents of every row of `tools/migration-scope/pages.csv`. Normalised before comparing: the locale prefix in links and media, the market in `country=`/`market=` query parameters and `/<cc>_<ll>` file names, whitespace. Text is compared as the multiset of block-level texts (−removed from the source / +added in the market).

With the global source's rows (translate.json: /gc/en, /gc/de): each rollout pair against the gc tree (the de market's documents with their relative links under /gc): a relative /<cc>/<ll>/ or /de/<ll>/ path counts as /gc/<ll>/, the market in www.lufthansa.com links, JCR paths and query values as de. Own German slugs from pages.csv (/gc/de/fluege against /de/de/fluege and /at/de/fluege).

## at/de vs gc/de

980 rows: 933 identical, 27 differ, 20 not compared (missing in DA: /gc/de/lufthansa-city/menu-card, /at/de/lufthansa-city/menu-card; missing in DA: /gc/de/anmeldung-tiere-frachtraum; missing in DA: /gc/de/book-and-manage/cancellation-and-refund/refund/refund-form; missing in DA: /gc/de/farealert/best-price-alert; missing in DA: /gc/de/feedback; missing in DA: /gc/de/feedback-past-flight; missing in DA: /gc/de/feedback/feedbackai; missing in DA: /gc/de/prepare-for-your-trip/baggage/baggage-irregularities/report-baggage; missing in DA: /gc/de/prepare-for-your-trip/baggage/sport-baggage/register-ammunition; missing in DA: /gc/de/register-animal-cabin; missing in DA: /gc/de/betreuungsbedarf; missing in DA: /gc/de/sportgepaeck-hinzufuegen; missing in DA: /gc/de/group-travel; missing in DA: /gc/de/passenger-receipt-90; missing in DA: /gc/de/prepare-for-your-trip/current-travel-information; no pair in the scope).

Of the 933 identical pages only 4 are identical byte for byte (/at/de/lufthansa-city/culinaryjourney, /at/de/articles/authors, /at/de/prepare-for-your-trip/special-travel-needs/travel-with-needs/special-needs-online-form/confirmation, /at/de/book-and-manage/trip-management); the others differ in the market of their links only (/at/de/… against /gc/de/…, country=…). The app's rollout copies links as they are (no DNT step, views/rollout/index.js), so a rollout with merge marks each of those links as a difference (keep the local side), and one with overwrite would point the market's links at the source market.

- by kind: text 20, links 17, images 3, blocks 3, metadata 7
- by template group (differ/rows): app-entry 1/6, campaign 2/22, fleet 1/8, flight-status 1/1, form 0/9, homepage 1/1, hub 3/17, info 16/187, insights 2/697, legal 0/30, mfe 0/2
- metadata keys that differ: llms-description 5, llms-title 5, llms-category 5, llms-include 5, ai-guidance 1, breadcrumb title 1, title 1, description 1, og:title 1, canonical 1, theme 1, parent 1

### Biggest differences

| target | group | size | differences |
|---|---|---|---|
| /at/de/homepage | homepage | 511 | text −85/+111 ("Lufthansa Group Wi-Fi powered by Starlink"); links −139/+165 ("/gc/de/during-your-trip/lhg-wifi"); images −3/+3; metadata ai-guidance, llms-description, llms-title, llms-category, llms-include |
| /at/de/book-and-manage/flights/lufthansa-voucher | info | 98 | text −89/+0; links −7/+0 ("https://www.lufthansa.com/de/de/book-and-manage/travel-information/fli"); blocks −[accordion-columns] +[]; metadata breadcrumb title |
| /at/de/rechnungsbeleg | info | 71 | text −9/+31 ("Rechnungsbeleg (Passenger Receipt)"); links −2/+21 ("https://my.information.lufthansa.com/documents?lg=DE"); blocks −[] +[columns-media, columns-media]; metadata title, description, og:title, canonical, theme, parent |
| /at/de/fluege | hub | 39 | text −17/+3 ("style"); links −6/+0 ("https://www.lufthansa.com/de/de/travel-id"); images −6/+0; blocks −[carousel-cards, carousel-cards, section-metadata] +[]; metadata llms-description, llms-title, llms-category, llms-include |
| /at/de/first-class | info | 10 | text −9/+0; links −1/+0 ("/gc/de/flugsuche") |
| /at/de/upgrademoeglichkeiten | info | 10 | links −5/+5 ("https://www.lufthansa.com/artifacts/flight-upgrades/fix-price-upgrade/") |
| /at/de/discover-lufthansa/new-onboard-experience | campaign | 8 | text −7/+0; links −1/+0 ("/gc/de/premium-economy-class") |
| /at/de/online-check-in-mit-der-ganzen-familie | info | 6 | images −3/+3 |
| /at/de/articles/highlights/all-it-takes-is-a-yes | insights | 6 | text −3/+3 ("MUC") |
| /at/de/flynet | info | 5 | text −3/+0; links −1/+1 ("https://lufthansa.miles-and-more.com/web/row/de/enrolment.html?client_") |
| /at/de/free2move | info | 5 | text −3/+2 ("Noch kein Free2move Kunde? Sichern Sie sich 50 % auf Ihre ersten 3 Fah") |
| /at/de/online-check-in | app-entry | 4 | metadata llms-description, llms-title, llms-category, llms-include |
| /at/de/flugplan-und-flugstatus | flight-status | 4 | metadata llms-description, llms-title, llms-category, llms-include |
| /at/de/gepaeck | hub | 4 | metadata llms-description, llms-title, llms-category, llms-include |
| /at/de/articles/highlights | insights | 4 | links −2/+2 ("https://www.lufthansa.com/de/de/articles/highlights/soccer-event-in-no") |

<details><summary>All 27 pages that differ</summary>

| target | group | differences |
|---|---|---|
| /at/de/100-years/fleet | campaign | text −1/+0 |
| /at/de/articles/highlights | insights | links −2/+2 ("https://www.lufthansa.com/de/de/articles/highlights/soccer-event-in-no") |
| /at/de/articles/highlights/all-it-takes-is-a-yes | insights | text −3/+3 ("MUC") |
| /at/de/book-and-manage/flights/lufthansa-voucher | info | text −89/+0; links −7/+0 ("https://www.lufthansa.com/de/de/book-and-manage/travel-information/fli"); blocks −[accordion-columns] +[]; metadata breadcrumb title |
| /at/de/business-class | info | text −2/+0; links −1/+0 ("/gc/de/flugsuche") |
| /at/de/discover-lufthansa/lufthansa-fleet/351 | fleet | text −1/+0 |
| /at/de/discover-lufthansa/new-onboard-experience | campaign | text −7/+0; links −1/+0 ("/gc/de/premium-economy-class") |
| /at/de/discover-lufthansa/register-newsletter | info | links −2/+2 ("https://lufthansa.miles-and-more.com/web/row/de/enrolment.html?client_") |
| /at/de/during-your-trip/internet-overview | info | text −1/+0 |
| /at/de/during-your-trip/lhg-wifi | info | text −1/+0 |
| /at/de/first-class | info | text −9/+0; links −1/+0 ("/gc/de/flugsuche") |
| /at/de/fluege | hub | text −17/+3 ("style"); links −6/+0 ("https://www.lufthansa.com/de/de/travel-id"); images −6/+0; blocks −[carousel-cards, carousel-cards, section-metadata] +[]; metadata llms-description, llms-title, llms-category, llms-include |
| /at/de/flugplan-und-flugstatus | flight-status | metadata llms-description, llms-title, llms-category, llms-include |
| /at/de/flynet | info | text −3/+0; links −1/+1 ("https://lufthansa.miles-and-more.com/web/row/de/enrolment.html?client_") |
| /at/de/free2move | info | text −3/+2 ("Noch kein Free2move Kunde? Sichern Sie sich 50 % auf Ihre ersten 3 Fah") |
| /at/de/gepaeck | hub | metadata llms-description, llms-title, llms-category, llms-include |
| /at/de/homepage | homepage | text −85/+111 ("Lufthansa Group Wi-Fi powered by Starlink"); links −139/+165 ("/gc/de/during-your-trip/lhg-wifi"); images −3/+3; metadata ai-guidance, llms-description, llms-title, llms-category, llms-include |
| /at/de/kindermenues-an-bord | info | text −2/+0; links −1/+0 ("https://www.lufthansa.com/de/de/anmeldung") |
| /at/de/onboard-delights | info | text −2/+0; links −1/+0 ("/gc/de/culinaryjourney") |
| /at/de/online-check-in | app-entry | metadata llms-description, llms-title, llms-category, llms-include |
| /at/de/online-check-in-mit-der-ganzen-familie | info | images −3/+3 |
| /at/de/premium-economy-class | info | text −2/+0; links −1/+0 ("/gc/de/flugsuche") |
| /at/de/rechnungsbeleg | info | text −9/+31 ("Rechnungsbeleg (Passenger Receipt)"); links −2/+21 ("https://my.information.lufthansa.com/documents?lg=DE"); blocks −[] +[columns-media, columns-media]; metadata title, description, og:title, canonical, theme, parent |
| /at/de/shopping | info | text −2/+0; links −1/+0 ("https://www.worldshop.eu/?cid=web_jc7UXD&placementid=web_dlh_homepage_") |
| /at/de/sondermahlzeiten | info | text −2/+0; links −1/+0 ("https://www.lufthansa.com/de/de/anmeldung") |
| /at/de/speisen-und-getraenke | hub | text −2/+0; links −1/+0 ("/gc/de/culinaryjourney") |
| /at/de/upgrademoeglichkeiten | info | links −5/+5 ("https://www.lufthansa.com/artifacts/flight-upgrades/fix-price-upgrade/") |

</details>

## de/de vs gc/de

980 rows: 925 identical, 36 differ, 19 not compared (missing in DA: /gc/de/lufthansa-city/menu-card, /de/de/lufthansa-city/menu-card; missing in DA: /gc/de/anmeldung-tiere-frachtraum; missing in DA: /gc/de/book-and-manage/cancellation-and-refund/refund/refund-form; missing in DA: /gc/de/farealert/best-price-alert; missing in DA: /gc/de/feedback; missing in DA: /gc/de/feedback-past-flight; missing in DA: /gc/de/feedback/feedbackai; missing in DA: /gc/de/prepare-for-your-trip/baggage/baggage-irregularities/report-baggage; missing in DA: /gc/de/prepare-for-your-trip/baggage/sport-baggage/register-ammunition; missing in DA: /gc/de/register-animal-cabin; missing in DA: /gc/de/betreuungsbedarf; missing in DA: /gc/de/sportgepaeck-hinzufuegen; missing in DA: /gc/de/group-travel; missing in DA: /gc/de/passenger-receipt-90; missing in DA: /gc/de/prepare-for-your-trip/current-travel-information; no pair in the scope).

Of the 925 identical pages only 12 are identical byte for byte (/de/de/culinaryjourney, /de/de/lufthansa-city/culinaryjourney, /de/de/articles/authors, /de/de/prepare-for-your-trip/special-travel-needs/travel-with-needs/special-needs-online-form/confirmation, /de/de/support/support, /de/de/good-for-train, /de/de/help-and-contact, /de/de/support/search/search-result, /de/de/book-and-manage/trip-management, /de/de/lufthansa-ejournals, /de/de/support/fast-compensation/compensation-flight-disruptions, /de/de/discover-lufthansa/register-newsletter); the others differ in the market of their links only (/de/de/… against /gc/de/…, country=…). The app's rollout copies links as they are (no DNT step, views/rollout/index.js), so a rollout with merge marks each of those links as a difference (keep the local side), and one with overwrite would point the market's links at the source market.

- by kind: text 33, links 13, images 2, blocks 1, metadata 0
- by template group (differ/rows): app-entry 1/6, campaign 9/22, fleet 2/8, flight-status 0/1, form 0/9, homepage 1/1, hub 2/17, info 20/187, insights 1/697, legal 0/30, mfe 0/2
- metadata keys that differ: none

### Biggest differences

| target | group | size | differences |
|---|---|---|---|
| /de/de/book-and-manage/flights/lufthansa-voucher | info | 43 | text −40/+1 ("Nutzungsbedingungen für den Lufthansa Geschenkgutschein"); links −2/+0 ("https://admin.vp-lhg.com/lh/sales_refunds/new?locale=de") |
| /de/de/fluege | hub | 22 | text −7/+5 ("Smart search"); links −4/+2 ("https://www.lufthansa.com/de/de/book-and-manage/smart-destination-sear"); images −3/+0; blocks −[carousel-cards] +[] |
| /de/de/hotelangebote | info | 18 | text −6/+12 ("Location") |
| /de/de/100-years/destinations | campaign | 13 | text −0/+9 ("Seit 100 Jahren verbinden wir Menschen mit ihren Lieblingsorten. Mit S"); links −0/+4 ("https://www.lufthansa.com/lhg/de/de/dest/cy/berlin") |
| /de/de/flugsuche | app-entry | 12 | text −3/+5 ("Young adults"); links −1/+1 ("https://www.miles-and-more-kreditkarte.com/?kid=e.1200.09.22&kidc=publ"); images −1/+1 |
| /de/de/traveltricks | info | 8 | links −4/+4 ("https://www.lufthansa.com/de/de/travel-id") |
| /de/de/economy-class | info | 7 | text −0/+5 ("Willkommen in der Economy Class. Nehmen Sie Platz. Lehnen Sie sich zur"); links −0/+2 ("https://www.lufthansa.com/de/de/discover-lufthansa/allegris/economy") |
| /de/de/discover-lufthansa/take-off | campaign | 6 | links −3/+3 ("https://www.lufthansa.com/de/de/local-page/local-offers") |
| /de/de/homepage | homepage | 6 | text −2/+4 ("Young adults") |
| /de/de/business-class | info | 6 | text −0/+4 ("Mit unserer neuen Lufthansa Allegris Business Class geben wir Ihren Wü"); links −0/+2 ("https://www.lufthansa.com/de/de/discover-lufthansa/allegris/business-c") |
| /de/de/premium-economy-class | info | 6 | text −0/+4 ("Die Beine ausgestreckt. Ein Glas in der Hand. Der Alltag ganz weit weg"); links −0/+2 ("https://www.lufthansa.com/de/de/discover-lufthansa/allegris/premium-ec") |
| /de/de/prepare-for-your-trip/getting-to-and-from-the-airport/lufthansa-express-rail-briefing | info | 6 | text −3/+3 ("Während der Zugfahrt führen Sie Ihr Gepäck bitte selbst mit. Für die G") |
| /de/de/100-years | campaign | 5 | text −0/+4 ("Vom Pionier der Luftfahrt zum täglichen Begleiter"); links −0/+1 ("/gc/de/100-years/chronicle") |
| /de/de/100-years/history | campaign | 5 | text −0/+4 ("Von den Pionierjahren der 1920er über die Neugründung der 1950er bis z"); links −0/+1 ("/gc/de/100-years/chronicle") |
| /de/de/book-and-manage/stopover | campaign | 5 | text −2/+3 ("Stopover buchen und München erleben – mit dem Lufthansa Stopover- Prog") |

<details><summary>All 36 pages that differ</summary>

| target | group | differences |
|---|---|---|
| /de/de/100-years | campaign | text −0/+4 ("Vom Pionier der Luftfahrt zum täglichen Begleiter"); links −0/+1 ("/gc/de/100-years/chronicle") |
| /de/de/100-years/campaigns | campaign | text −0/+1 ("100 Jahre Lufthansa: Das sind nicht nur 100 Jahre Unternehmensgeschich") |
| /de/de/100-years/chronicle | campaign | text −0/+3 ("Werfen Sie einen Blick zurück auf die Anfänge der ersten Lufthansa – e") |
| /de/de/100-years/destinations | campaign | text −0/+9 ("Seit 100 Jahren verbinden wir Menschen mit ihren Lieblingsorten. Mit S"); links −0/+4 ("https://www.lufthansa.com/lhg/de/de/dest/cy/berlin") |
| /de/de/100-years/global-network | campaign | text −0/+1 ("Von dem wegweisenden Start 1926 in Berlin und den ersten Atlantikflüge") |
| /de/de/100-years/history | campaign | text −0/+4 ("Von den Pionierjahren der 1920er über die Neugründung der 1950er bis z"); links −0/+1 ("/gc/de/100-years/chronicle") |
| /de/de/100-years/history/menu-on-board | campaign | text −0/+1 ("Es ist eine der schönsten Möglichkeiten, die Zeit an Bord zu überbrück") |
| /de/de/320 | fleet | text −0/+1 ("Entdecken Sie ein Flugzeug, das die zivile Luftfahrt geprägt hat – und") |
| /de/de/32n | fleet | text −0/+1 ("Entdecken Sie unser modernes Kurzstreckenflugzeug – effizient, leise u") |
| /de/de/additional-services | hub | text −0/+5 ("Manchmal darf es ein bisschen mehr sein. Mehr Gepäck. Mehr Komfort in ") |
| /de/de/advice-for-travellers-with-special-needs-to-and-from-the-usa | info | text −0/+1 ("Wir haben relevante Informationen und Hinweise für Sie zusammengestell") |
| /de/de/articles/highlights-european-championship/scotland-with-heart-and-energy | insights | links −1/+1 ("https://www.lufthansa.com/de/de/local-page/local-offers") |
| /de/de/book-and-manage/flights/air-baltic | info | text −0/+2 ("Lufthansa steht für mehr als Fliegen – wir verbinden Menschen und Kult") |
| /de/de/book-and-manage/flights/lufthansa-voucher | info | text −40/+1 ("Nutzungsbedingungen für den Lufthansa Geschenkgutschein"); links −2/+0 ("https://admin.vp-lhg.com/lh/sales_refunds/new?locale=de") |
| /de/de/book-and-manage/flights/wetlease-hub | info | text −0/+2 ("Auch bei steigendem Reiseaufkommen möchten wir Ihnen optimale Flugverb") |
| /de/de/book-and-manage/stopover | campaign | text −2/+3 ("Stopover buchen und München erleben – mit dem Lufthansa Stopover- Prog") |
| /de/de/business-class | info | text −0/+4 ("Mit unserer neuen Lufthansa Allegris Business Class geben wir Ihren Wü"); links −0/+2 ("https://www.lufthansa.com/de/de/discover-lufthansa/allegris/business-c") |
| /de/de/cash-and-miles | info | text −0/+2 ("Young adults") |
| /de/de/discover-lufthansa/miles-and-more-credit-card | info | text −0/+1 ("Auf Flügen, beim Reisen und im Alltag sammeln Sie mit Miles & More, de") |
| /de/de/discover-lufthansa/take-off | campaign | links −3/+3 ("https://www.lufthansa.com/de/de/local-page/local-offers") |
| /de/de/economy-class | info | text −0/+5 ("Willkommen in der Economy Class. Nehmen Sie Platz. Lehnen Sie sich zur"); links −0/+2 ("https://www.lufthansa.com/de/de/discover-lufthansa/allegris/economy") |
| /de/de/first-class-terminal | info | text −0/+4 ("Beginnen Sie Ihre Reise auf gehobenem Niveau – mit den exklusiven Vorz") |
| /de/de/fluege | hub | text −7/+5 ("Smart search"); links −4/+2 ("https://www.lufthansa.com/de/de/book-and-manage/smart-destination-sear"); images −3/+0; blocks −[carousel-cards] +[] |
| /de/de/flugsuche | app-entry | text −3/+5 ("Young adults"); links −1/+1 ("https://www.miles-and-more-kreditkarte.com/?kid=e.1200.09.22&kidc=publ"); images −1/+1 |
| /de/de/homepage | homepage | text −2/+4 ("Young adults") |
| /de/de/hotelangebote | info | text −6/+12 ("Location") |
| /de/de/passengers-with-sensory-impairment | info | text −0/+1 ("Ob chronische Erkrankungen, Angststörungen, Autismus, ADHS oder andere") |
| /de/de/premium-economy-class | info | text −0/+4 ("Die Beine ausgestreckt. Ein Glas in der Hand. Der Alltag ganz weit weg"); links −0/+2 ("https://www.lufthansa.com/de/de/discover-lufthansa/allegris/premium-ec") |
| /de/de/prepare-for-your-trip/getting-to-and-from-the-airport/lufthansa-express-rail-briefing | info | text −3/+3 ("Während der Zugfahrt führen Sie Ihr Gepäck bitte selbst mit. Für die G") |
| /de/de/prepare-for-your-trip/special-travel-needs/travel-with-needs/cognitive-impairment | info | text −0/+1 ("Wir helfen Ihnen am Flughafen. Wir zeigen Ihnen den richtigen Weg und ") |
| /de/de/prepare-for-your-trip/special-travel-needs/travel-with-needs/hearing-impairment | info | text −0/+1 ("Wir sind für Sie da. Wenn Sie eine Hörbeeinträchtigung haben, unterstü") |
| /de/de/prepare-for-your-trip/special-travel-needs/travel-with-needs/travel-companion | info | text −0/+1 ("In bestimmten Situationen kann es erforderlich sein, mit einer Begleit") |
| /de/de/prepare-for-your-trip/special-travel-needs/travel-with-needs/visual-impairment | info | text −0/+1 ("Wir sind für Sie da. Wenn Sie eine Sehbeeinträchtigung haben, unterstü") |
| /de/de/shopping | info | text −0/+2 ("Entdecken Sie unsere Neuheiten, von saisonalen Favoriten bis hin zu Kl"); links −0/+1 ("https://www.worldshop.eu/de/neuheiten/?cid=web_zsPcgs&placementid=web_") |
| /de/de/tips-senior-travellers | info | text −0/+4 ("Durchdachte Services von der Buchung bis zur Landung – damit Ihre Reis") |
| /de/de/traveltricks | info | links −4/+4 ("https://www.lufthansa.com/de/de/travel-id") |

</details>

## de/en vs gc/en

980 rows: 924 identical, 39 differ, 17 not compared (missing in DA: /gc/en/lufthansa-city/menu-card, /de/en/lufthansa-city/menu-card; missing in DA: /gc/en/anmeldung-tiere-frachtraum; missing in DA: /gc/en/book-and-manage/cancellation-and-refund/refund/refund-form; missing in DA: /gc/en/farealert/best-price-alert; missing in DA: /gc/en/feedback; missing in DA: /gc/en/feedback-past-flight; missing in DA: /gc/en/feedback/feedbackai; missing in DA: /gc/en/prepare-for-your-trip/baggage/baggage-irregularities/report-baggage; missing in DA: /gc/en/prepare-for-your-trip/baggage/sport-baggage/register-ammunition; missing in DA: /gc/en/register-animal-cabin; missing in DA: /gc/en/special-needs; missing in DA: /gc/en/add-sports-baggage; missing in DA: /gc/en/group-travel; missing in DA: /gc/en/passenger-receipt-90; missing in DA: /gc/en/prepare-for-your-trip/current-travel-information; no pair in the scope).

Of the 924 identical pages only 11 are identical byte for byte (/de/en/culinaryjourney, /de/en/lufthansa-city/culinaryjourney, /de/en/articles/authors, /de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/special-needs-online-form/confirmation, /de/en/good-for-train, /de/en/help-and-contact, /de/en/support/search/search-result, /de/en/book-and-manage/trip-management, /de/en/lufthansa-ejournals, /de/en/support/fast-compensation/compensation-flight-disruptions, /de/en/discover-lufthansa/register-newsletter); the others differ in the market of their links only (/de/en/… against /gc/en/…, country=…). The app's rollout copies links as they are (no DNT step, views/rollout/index.js), so a rollout with merge marks each of those links as a difference (keep the local side), and one with overwrite would point the market's links at the source market.

- by kind: text 38, links 15, images 3, blocks 0, metadata 2
- by template group (differ/rows): app-entry 2/6, campaign 7/22, fleet 3/8, flight-status 0/1, form 0/9, homepage 1/1, hub 2/17, info 23/187, insights 0/697, legal 1/30, mfe 0/2
- metadata keys that differ: title 1, description 1, image 1, og:title 1, og:description 1, breadcrumb title 1, theme 1, canonical 1

### Biggest differences

| target | group | size | differences |
|---|---|---|---|
| /de/en/green-fare | info | 69 | text −29/+28 ("Green Fares: More sustainable air travel"); links −0/+1 ("https://www.lufthansa.com/de/en/prepare-for-your-trip/baggage/baggage-"); images −1/+3; metadata title, description, image, og:title, og:description, breadcrumb title, theme |
| /de/en/homepage | homepage | 48 | links −10/+10 ("https://www.lufthansa.com/de/en/payment-options"); images −14/+14 |
| /de/en/book-and-manage/flights/lufthansa-voucher | info | 43 | text −40/+1 ("Terms of use for Lufthansa Gift Cards"); links −2/+0 ("https://admin.vp-lhg.com/lh/sales_refunds/new?locale=en") |
| /de/en/support/support | info | 26 | text −1/+2 ("Help page loaded."); links −11/+11 ("https://www.lufthansa.com/de/en/support/support"); metadata canonical |
| /de/en/cookie-policy | legal | 20 | text −14/+6 ("(script)") |
| /de/en/hotel-offers | info | 16 | text −5/+11 ("Location") |
| /de/en/100-years/destinations | campaign | 13 | text −0/+9 ("For 100 years, we have been connecting people with their favorite plac"); links −0/+4 ("https://www.lufthansa.com/lhg/de/en/dest/cy/berlin") |
| /de/en/flight-search | app-entry | 10 | text −3/+3 ("Miles & More Credit Card"); links −1/+1 ("https://www.miles-and-more-kreditkarte.com/?kid=e.1200.09.22&kidc=publ"); images −1/+1 |
| /de/en/europcar | info | 7 | text −1/+4 ("https://www.lufthansa.com/de/en/europcar"); links −1/+1 ("https://www.lufthansa.com/de/en/europcar") |
| /de/en/business-class | info | 6 | text −0/+4 ("With our new Lufthansa Allegris Business Class, we’re giving you more "); links −0/+2 ("https://www.lufthansa.com/de/en/discover-lufthansa/allegris/business-c") |
| /de/en/economy-class | info | 6 | text −0/+4 ("Arrive relaxed. Lufthansa Allegris Economy Class is setting new standa"); links −0/+2 ("https://www.lufthansa.com/de/en/discover-lufthansa/allegris/economy") |
| /de/en/premium-economy-class | info | 6 | text −0/+4 ("Your legs stretched out. A glass in your hand. Everyday life is a worl"); links −0/+2 ("https://www.lufthansa.com/de/en/discover-lufthansa/allegris/premium-ec") |
| /de/en/100-years | campaign | 5 | text −0/+4 ("From aviation pioneer to daily travel companion"); links −0/+1 ("/gc/en/100-years/chronicle") |
| /de/en/100-years/history | campaign | 5 | text −0/+4 ("From the pioneering years of the 1920s, through the airline’s re-estab"); links −0/+1 ("/gc/en/100-years/chronicle") |
| /de/en/additional-services | hub | 5 | text −0/+5 ("Sometimes, you’d like a little more. More baggage. More comfort in a h") |

<details><summary>All 39 pages that differ</summary>

| target | group | differences |
|---|---|---|
| /de/en/100-years | campaign | text −0/+4 ("From aviation pioneer to daily travel companion"); links −0/+1 ("/gc/en/100-years/chronicle") |
| /de/en/100-years/campaigns | campaign | text −0/+1 ("100 years of Lufthansa: This is not just 100 years of company history,") |
| /de/en/100-years/chronicle | campaign | text −0/+3 ("Look back at the beginnings of the first Lufthansa – an era of new sta") |
| /de/en/100-years/destinations | campaign | text −0/+9 ("For 100 years, we have been connecting people with their favorite plac"); links −0/+4 ("https://www.lufthansa.com/lhg/de/en/dest/cy/berlin") |
| /de/en/100-years/global-network | campaign | text −0/+1 ("From a groundbreaking start in Berlin in 1926 and the first transatlan") |
| /de/en/100-years/history | campaign | text −0/+4 ("From the pioneering years of the 1920s, through the airline’s re-estab"); links −0/+1 ("/gc/en/100-years/chronicle") |
| /de/en/100-years/history/menu-on-board | campaign | text −0/+1 ("Dining on board: one of the most wonderful ways to pass the time on a ") |
| /de/en/320 | fleet | text −0/+1 ("Discover an aircraft that shaped civil aviation – and that still conne") |
| /de/en/32n | fleet | text −0/+1 ("Discover our modern short-haul aircraft – efficient, quiet and comfort") |
| /de/en/additional-services | hub | text −0/+5 ("Sometimes, you’d like a little more. More baggage. More comfort in a h") |
| /de/en/advice-for-travellers-with-special-needs-to-and-from-the-usa | info | text −0/+1 ("We have put together the relevant information and tips to ensure you h") |
| /de/en/boeing787 | fleet | text −0/+1 ("With the Dreamliner, you can enjoy a dreamlike travel experience on lo") |
| /de/en/book-and-manage/flights/air-baltic | info | text −0/+2 ("Lufthansa stands for more than flying: we connect people and cultures ") |
| /de/en/book-and-manage/flights/lufthansa-voucher | info | text −40/+1 ("Terms of use for Lufthansa Gift Cards"); links −2/+0 ("https://admin.vp-lhg.com/lh/sales_refunds/new?locale=en") |
| /de/en/book-and-manage/flights/wetlease-hub | info | text −0/+2 ("Even during periods of increased travel demand, we aim to offer you th") |
| /de/en/business-class | info | text −0/+4 ("With our new Lufthansa Allegris Business Class, we’re giving you more "); links −0/+2 ("https://www.lufthansa.com/de/en/discover-lufthansa/allegris/business-c") |
| /de/en/cookie-policy | legal | text −14/+6 ("(script)") |
| /de/en/discover-lufthansa/miles-and-more-credit-card | info | text −0/+1 ("On flights, when travelling and in everyday life, you can earn miles w") |
| /de/en/during-your-trip/internet-overview | info | text −1/+1 ("Entertainment on board {heading-small}") |
| /de/en/economy-class | info | text −0/+4 ("Arrive relaxed. Lufthansa Allegris Economy Class is setting new standa"); links −0/+2 ("https://www.lufthansa.com/de/en/discover-lufthansa/allegris/economy") |
| /de/en/europa-tarife-economy-class | info | text −1/+1 ("Green Fares"); links −1/+1 ("https://www.lufthansa.com/de/en/prepare-for-your-trip/travel-classes/f") |
| /de/en/europcar | info | text −1/+4 ("https://www.lufthansa.com/de/en/europcar"); links −1/+1 ("https://www.lufthansa.com/de/en/europcar") |
| /de/en/first-class-terminal | info | text −0/+4 ("Begin your journey at the highest standard – with the exclusive amenit") |
| /de/en/flight-search | app-entry | text −3/+3 ("Miles & More Credit Card"); links −1/+1 ("https://www.miles-and-more-kreditkarte.com/?kid=e.1200.09.22&kidc=publ"); images −1/+1 |
| /de/en/flights | hub | text −0/+3 ("{divider-25}") |
| /de/en/free2move | info | text −1/+1 ("Not yet Free2move customer? Get 40% off your first 3 trips with the co"); links −1/+1 ("https://www.free2move.com/de/en/offer/lufthansa/") |
| /de/en/green-fare | info | text −29/+28 ("Green Fares: More sustainable air travel"); links −0/+1 ("https://www.lufthansa.com/de/en/prepare-for-your-trip/baggage/baggage-"); images −1/+3; metadata title, description, image, og:title, og:description, breadcrumb title, theme |
| /de/en/homepage | homepage | links −10/+10 ("https://www.lufthansa.com/de/en/payment-options"); images −14/+14 |
| /de/en/hotel-offers | info | text −5/+11 ("Location") |
| /de/en/my-bookings | app-entry | text −0/+1 ("Your trip doesn’t just start at your destination, it begins with the r") |
| /de/en/passengers-with-sensory-impairment | info | text −0/+1 ("Whether you have a chronic illness, anxiety, autism, ADHD or other inv") |
| /de/en/premium-economy-class | info | text −0/+4 ("Your legs stretched out. A glass in your hand. Everyday life is a worl"); links −0/+2 ("https://www.lufthansa.com/de/en/discover-lufthansa/allegris/premium-ec") |
| /de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/cognitive-impairment | info | text −0/+1 ("We will assist you at the aiport. We will show you which way to go and") |
| /de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/hearing-impairment | info | text −0/+1 ("We’re here to help you. If you have a hearing impairment, we can provi") |
| /de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/travel-companion | info | text −0/+1 ("In certain situations it may be required to travel with a companion. Y") |
| /de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/visual-impairment | info | text −0/+1 ("We’re here to help you. If you have a visual impairment, we can provid") |
| /de/en/shopping | info | text −0/+2 ("Discover our new arrivals, from seasonal favorites to classics for any"); links −0/+1 ("https://www.worldshop.eu/de/neuheiten/?cid=web_zsPcgs&placementid=web_") |
| /de/en/support/support | info | text −1/+2 ("Help page loaded."); links −11/+11 ("https://www.lufthansa.com/de/en/support/support"); metadata canonical |
| /de/en/tips-senior-travellers | info | text −0/+4 ("Well thought-out services from booking to landing, so your trip is wor") |

</details>

## gb/en vs gc/en

980 rows: 931 identical, 30 differ, 19 not compared (missing in DA: /gc/en/lufthansa-city/menu-card, /gb/en/lufthansa-city/menu-card; missing in DA: /gc/en/anmeldung-tiere-frachtraum; missing in DA: /gc/en/book-and-manage/cancellation-and-refund/refund/refund-form; missing in DA: /gc/en/farealert/best-price-alert; missing in DA: /gc/en/feedback; missing in DA: /gc/en/feedback-past-flight; missing in DA: /gc/en/feedback/feedbackai; missing in DA: /gc/en/prepare-for-your-trip/baggage/baggage-irregularities/report-baggage; missing in DA: /gc/en/prepare-for-your-trip/baggage/sport-baggage/register-ammunition; missing in DA: /gc/en/register-animal-cabin; missing in DA: /gc/en/special-needs; missing in DA: /gc/en/add-sports-baggage; missing in DA: /gc/en/group-travel; missing in DA: /gc/en/passenger-receipt-90; missing in DA: /gc/en/prepare-for-your-trip/current-travel-information; no pair in the scope).

Of the 931 identical pages only 5 are identical byte for byte (/gb/en/lufthansa-city/culinaryjourney, /gb/en/articles/authors, /gb/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/special-needs-online-form/confirmation, /gb/en/support/support, /gb/en/book-and-manage/trip-management); the others differ in the market of their links only (/gb/en/… against /gc/en/…, country=…). The app's rollout copies links as they are (no DNT step, views/rollout/index.js), so a rollout with merge marks each of those links as a difference (keep the local side), and one with overwrite would point the market's links at the source market.

- by kind: text 22, links 21, images 2, blocks 1, metadata 3
- by template group (differ/rows): app-entry 1/6, campaign 3/22, fleet 1/8, flight-status 0/1, form 0/9, homepage 1/1, hub 1/17, info 19/187, insights 4/697, legal 0/30, mfe 0/2
- metadata keys that differ: breadcrumb title 1, theme 1, title 1

### Biggest differences

| target | group | size | differences |
|---|---|---|---|
| /gb/en/homepage | homepage | 530 | text −97/+118 ("Young adults"); links −137/+164 ("https://www.lufthansa.com/de/en/local-page/offers.html"); images −7/+7 |
| /gb/en/book-and-manage/flights/lufthansa-voucher | info | 100 | text −91/+0; links −7/+0 ("https://www.lufthansa.com/de/en/book-and-manage/travel-information/fli"); blocks −[accordion-columns] +[]; metadata breadcrumb title |
| /gb/en/book-and-manage/additional-services/travel-insurances | info | 21 | text −10/+11 ("UK Residents only: {full-width}") |
| /gb/en/book-and-manage/stopover | campaign | 10 | text −4/+4 ("Economy, 1 traveller"); links −1/+1 ("http://lh.fltmaps.com/en") |
| /gb/en/first-class | info | 10 | text −9/+0; links −1/+0 ("/gc/en/flight-search") |
| /gb/en/upgrade-options | info | 10 | links −5/+5 ("https://www.lufthansa.com/artifacts/flight-upgrades/fix-price-upgrade/") |
| /gb/en/discover-lufthansa/new-onboard-experience | campaign | 8 | text −7/+0; links −1/+0 ("/gc/en/premium-economy-class") |
| /gb/en/check-in-with-the-family | info | 7 | links −1/+0 ("/gc/en/pre-check-in"); images −3/+3 |
| /gb/en/flynet | info | 5 | text −3/+0; links −1/+1 ("https://lufthansa.miles-and-more.com/web/row/en/enrolment.html?client_") |
| /gb/en/prepare-for-your-trip/special-travel-needs/medical-travel-companions | info | 4 | text −1/+1 ("To the services"); links −1/+1 ("https://bookings.medicaltravelcompanions.com/aff/LH/prsfks7v") |
| /gb/en/articles/highlights | insights | 4 | links −2/+2 ("https://www.lufthansa.com/de/en/articles/highlights/soccer-event-in-no") |
| /gb/en/discover-lufthansa/register-newsletter | info | 4 | links −2/+2 ("https://lufthansa.miles-and-more.com/web/row/en/enrolment.html?client_") |
| /gb/en/food-and-beverages | hub | 3 | text −2/+0; links −1/+0 ("/gc/en/culinaryjourney") |
| /gb/en/business-class | info | 3 | text −2/+0; links −1/+0 ("/gc/en/flight-search") |
| /gb/en/childrens-menus-on-board | info | 3 | text −2/+0; links −1/+0 ("https://www.lufthansa.com/de/en/login") |

<details><summary>All 30 pages that differ</summary>

| target | group | differences |
|---|---|---|
| /gb/en/100-years/fleet | campaign | text −1/+0 |
| /gb/en/articles/explore-the-world | insights | links −1/+1 ("https://www.lufthansa.com/de/en/articles/tags/chennai") |
| /gb/en/articles/explore-the-world/a-perfect-day-toronto-in-one-day | insights | metadata title |
| /gb/en/articles/highlights | insights | links −2/+2 ("https://www.lufthansa.com/de/en/articles/highlights/soccer-event-in-no") |
| /gb/en/articles/tags | insights | links −1/+1 ("https://www.lufthansa.com/de/en/articles/tags/chennai") |
| /gb/en/book-and-manage/additional-services/travel-insurances | info | text −10/+11 ("UK Residents only: {full-width}") |
| /gb/en/book-and-manage/flights/lufthansa-voucher | info | text −91/+0; links −7/+0 ("https://www.lufthansa.com/de/en/book-and-manage/travel-information/fli"); blocks −[accordion-columns] +[]; metadata breadcrumb title |
| /gb/en/book-and-manage/stopover | campaign | text −4/+4 ("Economy, 1 traveller"); links −1/+1 ("http://lh.fltmaps.com/en") |
| /gb/en/business-class | info | text −2/+0; links −1/+0 ("/gc/en/flight-search") |
| /gb/en/cash-and-miles | info | text −0/+2 ("Young adults") |
| /gb/en/check-in-with-the-family | info | links −1/+0 ("/gc/en/pre-check-in"); images −3/+3 |
| /gb/en/childrens-menus-on-board | info | text −2/+0; links −1/+0 ("https://www.lufthansa.com/de/en/login") |
| /gb/en/discover-lufthansa/lufthansa-fleet/351 | fleet | text −1/+0 |
| /gb/en/discover-lufthansa/new-onboard-experience | campaign | text −7/+0; links −1/+0 ("/gc/en/premium-economy-class") |
| /gb/en/discover-lufthansa/register-newsletter | info | links −2/+2 ("https://lufthansa.miles-and-more.com/web/row/en/enrolment.html?client_") |
| /gb/en/during-your-trip/internet-overview | info | text −1/+0 |
| /gb/en/during-your-trip/lhg-wifi | info | text −1/+0 |
| /gb/en/economy-class | info | text −2/+0; links −1/+0 ("/gc/en/flight-search") |
| /gb/en/first-class | info | text −9/+0; links −1/+0 ("/gc/en/flight-search") |
| /gb/en/flight-search | app-entry | text −0/+2 ("Young adults") |
| /gb/en/flynet | info | text −3/+0; links −1/+1 ("https://lufthansa.miles-and-more.com/web/row/en/enrolment.html?client_") |
| /gb/en/food-and-beverages | hub | text −2/+0; links −1/+0 ("/gc/en/culinaryjourney") |
| /gb/en/homepage | homepage | text −97/+118 ("Young adults"); links −137/+164 ("https://www.lufthansa.com/de/en/local-page/offers.html"); images −7/+7 |
| /gb/en/onboard-delights | info | text −2/+0; links −1/+0 ("/gc/en/culinaryjourney") |
| /gb/en/premium-economy-class | info | text −2/+0; links −1/+0 ("/gc/en/flight-search") |
| /gb/en/prepare-for-your-trip/special-travel-needs/medical-travel-companions | info | text −1/+1 ("To the services"); links −1/+1 ("https://bookings.medicaltravelcompanions.com/aff/LH/prsfks7v") |
| /gb/en/refund | info | metadata theme |
| /gb/en/shopping | info | text −2/+0; links −1/+0 ("https://www.worldshop.eu/?cid=web_jc7UXD&placementid=web_dlh_homepage_") |
| /gb/en/special-meals | info | text −2/+0; links −1/+0 ("https://www.lufthansa.com/de/en/login") |
| /gb/en/upgrade-options | info | links −5/+5 ("https://www.lufthansa.com/artifacts/flight-upgrades/fix-price-upgrade/") |

</details>
