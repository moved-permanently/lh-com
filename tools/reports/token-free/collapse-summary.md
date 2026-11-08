# Token-free styling, step 2: the collapse over the local documents (the brief after 503: 2026-11-08, --force, with its theme rules)

`node tools/importer/marker-collapse-cli.mjs --content <site content> --brand <brand> --force --check`: every local `.plain.html` of the workspace, nothing written. Markers: every token read (a `{full-width column-end}` is two). Theme: the marker goes (the theme draws it, or a near value is the default). Carriers: it becomes a section style, block option, purpose block, video fragment, italic caption, Default cell or Nav Tools role (counted per marker; "written" counts the carriers the documents gain). For a person: listed below.

| site | brand | documents | changed | markers | theme | % | carriers (markers) | carriers written | for a person | marker left | not idempotent | errors |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| lh-com | lufthansa | 6854 | 5153 | 35686 | 21266 | 59.6 | 14360 | 11049 | 60 | 4 | 0 | 0 |
| lh-austrian | austrian | 2363 | 1893 | 18267 | 16214 | 88.8 | 2053 | 1414 | 0 | 0 | 0 | 0 |
| lh-brussels | brussels | 1633 | 1070 | 5977 | 4649 | 77.8 | 1298 | 962 | 30 | 0 | 0 | 0 |
| lh-ita | ita | 2492 | 2083 | 18497 | 17382 | 94.0 | 1115 | 631 | 0 | 0 | 0 | 0 |
| lh-swiss | swiss | 51 | 21 | 383 | 251 | 65.5 | 132 | 77 | 0 | 0 | 0 | 0 |
| lh-swiss-mk | swiss | 1033 | 474 | 2578 | 1593 | 61.8 | 985 | 358 | 0 | 0 | 0 | 0 |
| lh-swiss-sub | swiss | 255 | 186 | 1201 | 910 | 75.8 | 291 | 78 | 0 | 0 | 0 | 0 |
| lh-swiss-mag | swiss | 959 | 0 | 0 | 0 | - | 0 | 0 | 0 | 0 | 0 | 0 |
| lh-tap | tap | 383 | 0 | 0 | 0 | - | 0 | 0 | 0 | 0 | 0 | 0 |
| lh-discover | discover | 30 | 24 | 285 | 279 | 97.9 | 6 | 6 | 0 | 0 | 0 | 0 |
| lh-b2b | b2b | 678 | 644 | 5185 | 3335 | 64.3 | 1850 | 773 | 0 | 0 | 0 | 0 |
| all | | 16731 | 11548 | 88059 | 65879 | 74.8 | 22090 | 15348 | 90 | 4 | 0 | 0 |

## Per family (all sites)

| family | theme | carriers | for a person |
| --- | --- | --- | --- |
| app | 0 | 325 | 0 |
| caption | 0 | 6322 | 88 |
| column | 17351 | 270 | 0 |
| column-page | 0 | 402 | 0 |
| form | 0 | 140 | 0 |
| heading | 19523 | 1887 | 0 |
| heading-aligned | 362 | 0 | 0 |
| heading-no-choice | 195 | 0 | 0 |
| indent | 571 | 19 | 0 |
| parallax | 0 | 232 | 0 |
| quote | 0 | 36 | 0 |
| separator | 8405 | 6276 | 0 |
| separator-from-768 | 681 | 0 | 0 |
| separator-in-block | 1 | 0 | 0 |
| text-size | 1747 | 360 | 0 |
| text-width | 16088 | 5718 | 0 |
| video | 955 | 103 | 2 |

## Carriers written (all sites)

| carrier | count |
| --- | --- |
| italic caption | 6322 |
| block spacer | 1409 |
| section style wide-text | 1236 |
| block divider | 1228 |
| section style divider | 1174 |
| section style space-below-m | 729 |
| section style space-m | 487 |
| section style h2-compact | 345 |
| section style parallax | 250 |
| section style space-below-l | 227 |
| section style small-print | 213 |
| block app-spacer medium | 201 |
| block option space-m | 188 |
| section style divider-below | 158 |
| section style padded | 143 |
| form Default | 140 |
| block option title-large | 135 |
| section style h3-large | 112 |
| block option title-compact | 101 |
| block option divider-above | 86 |
| block spacer l | 83 |
| section style space-l | 75 |
| block option background-video | 67 |
| block app-text small | 52 |
| block app-spacer medium v2 | 48 |
| section style narrow | 36 |
| block option mobile-video | 36 |
| block app-spacer x-small | 24 |
| block option space-l | 20 |
| list or quote (indent) | 19 |
| section style h2-large | 3 |
| page row Headings | 1 |

## For a person (88)

- lh-com /at/de/articles/explore-the-world/eat-see-do-minneapolis-st-paul: caption after no image: "(© Shutterstock; Header-Bild © Getty Images)"
- lh-com /at/de/articles/explore-the-world/eat-see-do-minneapolis-st-paul: caption after no image: "(© Getty Images)"
- lh-com /at/de/articles/explore-the-world/eat-see-do-minneapolis-st-paul: caption after no image: "(© Getty Images)"
- lh-com /de/de/articles/explore-the-world/eat-see-do-minneapolis-st-paul: caption after no image: "(© Shutterstock; Header-Bild © Getty Images)"
- lh-com /de/de/articles/explore-the-world/eat-see-do-minneapolis-st-paul: caption after no image: "(© Getty Images)"
- lh-com /de/de/articles/explore-the-world/eat-see-do-minneapolis-st-paul: caption after no image: "(© Getty Images)"
- lh-com /de/en/articles/explore-the-world/eat-see-do-minneapolis-st-paul: caption after no image: "(© Shutterstock; header image © Getty Images)"
- lh-com /de/en/articles/explore-the-world/eat-see-do-minneapolis-st-paul: caption after no image: "(© Getty Images)"
- lh-com /de/en/articles/explore-the-world/eat-see-do-minneapolis-st-paul: caption after no image: "(© Getty Images)"
- lh-com /gb/en/articles/explore-the-world/eat-see-do-minneapolis-st-paul: caption after no image: "(© Shutterstock; header image © Getty Images)"
- lh-com /gb/en/articles/explore-the-world/eat-see-do-minneapolis-st-paul: caption after no image: "(© Getty Images)"
- lh-com /gb/en/articles/explore-the-world/eat-see-do-minneapolis-st-paul: caption after no image: "(© Getty Images)"
- lh-com /migration-status/author-guide/admin: caption after no image: "DA Permissions: read and write per folder; preview and publi"
- lh-com /migration-status/author-guide/admin: caption after no image: "Deeplink partners, with invented test partners."
- lh-com /migration-status/author-guide/admin: caption after no image: "Feature switches: the markets each one is on for."
- lh-com /migration-status/author-guide/admin: caption after no image: "Admin data sheets: rule check, Excel, and the sync status."
- lh-com /migration-status/author-guide/admin: caption after no image: "Seat map import."
- lh-com /migration-status/author-guide/admin: caption after no image: "Feedback incidents: three ways to find one."
- lh-com /migration-status/author-guide/admin: caption after no image: "Good for Train report."
- lh-com /migration-status/author-guide/app-data: caption after no image: "An app screen: app blocks in a normal document."
- lh-com /migration-status/author-guide/app-data: caption after no image: "App services (panel menu, Extensions): pick the service inst"
- lh-com /migration-status/author-guide/app-data: caption after no image: "Structured content: a form per item, with the resulting data"
- lh-com /migration-status/author-guide/app-data: caption after no image: "Search results for lounge on the preview address."
- lh-com /migration-status/author-guide/articles: caption after no image: "The article's metadata decides where it is listed."
- lh-com /migration-status/author-guide/articles: caption after no image: "The Blog overview block: a few settings, no list to maintain"
- lh-com /migration-status/author-guide/articles: caption after no image: "The overview as it renders."
- lh-com /migration-status/author-guide/blocks: caption after no image: "Insert block: every block and variant with a rendered exampl"
- lh-com /migration-status/author-guide/blocks: caption after no image: "Block Inspector: the block under the cursor, its variant and"
- lh-com /migration-status/author-guide/images-metadata: caption after no image: "The Files panel (panel menu, Files) lists the site's folders"
- lh-com /migration-status/author-guide/images-metadata: caption after no image: "The copied DAM files sit at their old paths under /content/d"
- lh-com /migration-status/author-guide/images-metadata: caption after no image: "The Metadata table and the Page Metadata panel (panel menu, "
- lh-com /migration-status/author-guide/images-metadata: caption after no image: "The site-wide sheet: one row sets robots for every page."
- lh-com /migration-status/author-guide/markets: caption after no image: "The Markets row: this event page only goes to the German mar"
- lh-com /migration-status/author-guide/markets: caption after no image: "Two versions of the carousel: Markets de for Germany, Market"
- lh-com /migration-status/author-guide/markets: caption after no image: "de/de shows the version for Germany."
- lh-com /migration-status/author-guide/markets: caption after no image: "The /ch/de folder holds only the pages that differ from /de/"
- lh-com /migration-status/author-guide/markets: caption after no image: "A page of the linked site on its preview address."
- lh-com /migration-status/author-guide/markets: caption after no image: "The brand site on its preview address."
- lh-com /migration-status/author-guide/messages-forms: caption after no image: "The Lufthansa message form: every field with a short help te"
- lh-com /migration-status/author-guide/messages-forms: caption after no image: "The message on the current travel information page, about a "
- lh-com /migration-status/author-guide/messages-forms: caption after no image: "Message Center overview: every message with its languages, p"
- lh-com /migration-status/author-guide/messages-forms: caption after no image: "One folder per message, one page per language."
- lh-com /migration-status/author-guide/messages-forms: caption after no image: "The Form block: one row per field."
- lh-com /migration-status/author-guide/messages-forms: caption after no image: "The same form on the preview address."
- lh-com /migration-status/author-guide/navigation: caption after no image: "The navigation document: lists and links, one section per pa"
- lh-com /migration-status/author-guide/navigation: caption after no image: "One section per promotion. Start and End decide when it show"
- lh-com /migration-status/author-guide/navigation: caption after no image: "The homepage shows the promotion that is active now."
- lh-com /migration-status/author-guide/navigation: caption after no image: "Time travel on the preview address: the stage as visitors wi"
- lh-com /migration-status/author-guide/pages: caption after no image: "Search in a folder: the results are pages below the folder y"
- lh-com /migration-status/author-guide/pages: caption after no image: "Tick a page to get its actions in the blue bar at the bottom"
- lh-com /migration-status/author-guide/pages: caption after no image: "The toolbar at the bottom of the editor: paragraph or headin"
- lh-com /migration-status/author-guide/pages: caption after no image: "Markers such as {heading-small} stay visible in Content view"
- lh-com /migration-status/author-guide/pages: caption after no image: "Layout view shows the page as the site renders it."
- lh-com /migration-status/author-guide/pages: caption after no image: "The redirects sheet: Source and Destination, one row per old"
- lh-com /migration-status/author-guide/publishing: caption after no image: "Request Publish: one open request per page, with a note for "
- lh-com /migration-status/author-guide/publishing: caption after no image: "Versions (panel menu, Versions): the history of the document"
- lh-com /migration-status/author-guide/translation: caption after no image: "The localization app: Setup basics, Validate sources, Confir"
- lh-com /migration-status/tech-guide: caption after no image: "The parts and how a request reaches them."
- lh-brussels /be/en/articles/the-gambia: caption after no image: "Never a dull moment in The Gambia. Explore its beauty by bik"
- lh-brussels /be/en/articles/the-gambia: caption after no image: "Fall in love with the nature and immerse yourself in the bus"
- lh-brussels /be/en/articles/the-gambia: caption after no image: "Never a dull moment when you explore The Gambia! From childr"
- lh-brussels /be/en/articles/the-gambia: caption after no image: "Take a boat trip while enjoying fresh and refreshing juices "
- lh-brussels /be/en/articles/the-gambia: caption after no image: "Besides the country’s beauty, the hospitality of the people "
- lh-brussels /be/en/articles/the-gambia: caption after no image: "If you like nature and exploring the raw beauty of one of Af"
- lh-brussels /be/en/articles/the-ultimate-itinerary-in-kenya: caption after no image: "Immerse yourself in the wildlife that wander through this un"
- lh-brussels /be/en/articles/the-ultimate-itinerary-in-kenya: caption after no image: "Millions of wildebeest and zebras migrate during the Great M"
- lh-brussels /be/en/articles/the-ultimate-itinerary-in-kenya: caption after no image: "Find hippos bathing in the water and watch hundreds of bird "
- lh-brussels /be/en/articles/vibrant-senegal: caption after no image: "After 12 days of travelling around, this beautiful hotel is "
- lh-brussels /be/fr/articles/the-gambia: caption after no image: "Toujours quelque chose à faire en Gambie ! Découvrez sa beau"
- lh-brussels /be/fr/articles/the-gambia: caption after no image: "Succombez au charme de sa nature et plongez au cœur de l'eff"
- lh-brussels /be/fr/articles/the-gambia: caption after no image: "Impossible de s'ennuyer en Gambie ! Entre les enfants qui jo"
- lh-brussels /be/fr/articles/the-gambia: caption after no image: "Embarquez pour une balade en bateau, sirotez des jus frais e"
- lh-brussels /be/fr/articles/the-gambia: caption after no image: "Au-delà de la beauté du pays, c'est l'hospitalité de ses hab"
- lh-brussels /be/fr/articles/the-gambia: caption after no image: "Si vous aimez la nature et l'exploration de la beauté authen"
- lh-brussels /be/fr/articles/the-ultimate-itinerary-in-kenya: caption after no image: "Plongez au cœur d’un paysage sauvage où la faune règne en ma"
- lh-brussels /be/fr/articles/the-ultimate-itinerary-in-kenya: caption after no image: "Des millions de gnous et de zèbres se déplacent lors de la G"
- lh-brussels /be/fr/articles/the-ultimate-itinerary-in-kenya: caption after no image: "Observez les hippos se prélasser dans l’eau et admirez des c"
- lh-brussels /be/fr/articles/vibrant-senegal: caption after no image: "Après 12 jours de voyage, ce magnifique hôtel est l'endroit "
- lh-brussels /be/nl/articles/the-gambia: caption after no image: "Nooit een saai moment in Gambia. Verken het land al fietsend"
- lh-brussels /be/nl/articles/the-gambia: caption after no image: "Word verliefd op de natuur en dompel je onder in het bruisen"
- lh-brussels /be/nl/articles/the-gambia: caption after no image: "Nooit een saai moment als je Gambia verkent! Van spelende ki"
- lh-brussels /be/nl/articles/the-gambia: caption after no image: "Maak een boottocht terwijl je geniet van verse en verfrissen"
- lh-brussels /be/nl/articles/the-gambia: caption after no image: "Naast de schoonheid van het land zal de gastvrijheid van de "
- lh-brussels /be/nl/articles/the-gambia: caption after no image: "Als je van natuur houdt en van het verkennen van de ruwe sch"
- lh-brussels /be/nl/articles/the-ultimate-itinerary-in-kenya: caption after no image: "Laat je betoveren door de wilde dieren die door dit ongetemd"
- lh-brussels /be/nl/articles/the-ultimate-itinerary-in-kenya: caption after no image: "Tijdens de Grote Migratie migreren miljoenen gnoes en zebra'"
- lh-brussels /be/nl/articles/the-ultimate-itinerary-in-kenya: caption after no image: "Dobber voorbij nijlpaarden die er in het water baden en aans"
- lh-brussels /be/nl/articles/vibrant-senegal: caption after no image: "Na twaalf dagen rond te trekken is het heerlijk uitrusten in"
