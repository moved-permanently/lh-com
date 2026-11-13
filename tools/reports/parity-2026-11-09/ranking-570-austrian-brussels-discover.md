# Ranking after the standing order of 570 (ema-cashub): Austrian, Brussels, Discover

Our live pages (austrian.turnsthe.page, brussels.turnsthe.page, discover.turnsthe.page; every www request refused and
counted) against the R2 drop's recordings: austrian-parity-003 (28 pages), brussels-parity-004 (30), discover-parity-001
(26; the first sweep since Discover's theme switch). Page height at 1440 / 390, ours against www. Rows of 3 % or more,
worst first; each with its cause, or "not traced". Austrian and Brussels from capture 570 (after the footer patch and the
first re-imports), with the changes since (93374199, 2595ae36, 02e15c52, the Brussels form commits) measured on the live
pages. Marks: CAPTURE (an effect of our headless capture: the 71 px Turnstile box on core forms, no CJK font, Latin-only
fonts for Russian and Greek, an app caught before it rendered), DESIGN (by design: a link-out, token-free's collapse),
LIVE (live data: fares, widgets), RECORDING (the recording's state), QUEUED (a re-import or patch is on a list).

## Austrian

| page | 1440 | 390 | cause |
|---|---|---|---|
| /at/en/help-center | -2.1 % | -26.4 % (capture) / -2.2 % live | CAPTURE (app not rendered in capture 570); QUEUED done: Feedback block live |
| /th/en/book/flights/promptpay | -18.5 % | -18.4 % | LIVE (the fare deals) |
| /at/de/unterhaltung-an-bord | -18.2 % | -16.0 % | RECORDING (the recording's empty panel) |
| /jp/ja/baggage, /cn/zh/baggage | -5.8 / -4.2 % | -10.3 / -7.6 % | CAPTURE (no CJK font) |
| /at/en/online-check-in | -7.0 % | - | QUEUED (reimport-566-austrian-online-check-in); the rest token-free spacing (DESIGN) |
| /il/en/legal/cancellation-refund-via-document-upload | -0.1 % | -6.8 % | QUEUED (reimport-551; the form's file upload and terms band); 71 px CAPTURE |
| /us/en/local-page/ski-campaign-2026 | -2.0 % | -5.5 % | 02e15c52 (was -5.3 / -4.5); 390: www shows the flight search without the band picture (open: the mobile picture) |
| /ru/ru/baggage, /gr/el/baggage | +3.5 / +2.5 % | +3.6 / +2.6 % | CAPTURE (Cyrillic, Greek in DejaVu Sans: no Arial here) |
| /at/en/book-and-manage/flights/wetlease-hub | -3.5 % | -3.0 % | re-imported (c26893cb); the rest not traced |
| /at/de/local-page/feels-like-flying/os401crewstory | +3.0 % | +1.3 % | DESIGN (token-free heading sizes) |
| /at/de/bearbeitungsgebuehren | +0.8 % | -2.1 % | fixed (93374199, was +4.8 % at 390) |

## Brussels

| page | 1440 | 390 | cause |
|---|---|---|---|
| /be/fr/extra-services/baggage/problems-with-your-baggage | -17.4 % | -28.5 % | RECORDING (accordions open) |
| /be/fr/book-a-flight/our-payment-methods | -24.7 % | -16.5 % | LIVE (www's payment widget) |
| /be/en/my-bookings/cancel-and-refund-requests | -22.4 % | -19.8 % | RECORDING (accordions open); also the section-sidebar h1 (-44 / -30 px, open) |
| /be/fr/special-care/families-and-children | -9.1 % | -3.7 % | QUEUED (reimport-570-brussels-in-column-sidebars: -4.4 / -2.1 %) |
| /be/en/local-page/offers | -9.0 % | -4.9 % | LIVE (fares) |
| /be/en/contact/service-charges | -8.6 % | -4.6 % | the section-sidebar h1 (-44 / -30 px) and the accordions' width in the sidebar text column: no single rule (open) |
| /be/en/local-page/chase-the-sun-across-spain | -6.7 % | -2.4 % | QUEUED (reimport-551) |
| /il/en/rebooking-request-birthright | +6.1 % | +4.3 % | CAPTURE 71 px (without: +2.3 / +1.8 %); 560369f6 |
| /am/en/non-encrypt-mail/contact-form-error | 0.0 % | +5.6 % | not traced |
| /be/en/check-in-options-and-info/check-in-times | -3.3 % | -5.5 % | DESIGN (the deadline search's link-out) |
| /be/en/contact/feedback | +4.2 % | +3.2 % | not traced |
| /be/en/articles/the-gambia, /be/fr/articles/vibrant-senegal | -3.7 / -3.5 % | - | not traced |
| /be/en/farealert/unsubscribe-failure | -3.5 % | -2.2 % | not traced |
| contact/feedback/general/other, charter, dsar-start, emergency-contact | +0.3 / -1.3 / -1.9 / 0.0 % | +1.3 / -0.4 / -0.5 / +0.7 % | fixed (895fc563, c0b107f5, bfb3889b; 71 px taken off) |

## Discover (first sweep after the theme switch)

Discover's importer and theme files are ema-lufthansa's (standing rule): causes in shared code are fixed here, causes in
Discover's own files are rows for ema-lufthansa.

| page | 1440 | 390 | cause |
|---|---|---|---|
| /de/de/book/special-requests/families | -9.1 % | -5.6 % | content drift (www's "Auf einen Blick" list text is longer now: a re-import from the recording) and the accordions' list spacing (www about 34 px a list item, more between paragraphs, the panel indented; ours 24): Discover theme, ema-lufthansa |
| /de/en/book/special-requests/families | -8.1 % | -5.2 % | the same |
| /de/en/my-bookings/manage/customer-service | -7.6 % | -3.5 % | -135 px before "Refunds" (1440), -89 (390): not traced |
| /de/de/my-bookings/manage/customer-service | -6.5 % | -3.0 % | the same page |
| /de/en/travel-inspiration/inspiration/destinations/punta-cana | -0.5 % | +5.9 % | not traced |
| /de/de/discover/services-on-board/entertainment | -1.6 % | +5.9 % | not traced |
| /de/de/travel-inspiration/inspiration/destinations/punta-cana | -1.4 % | +5.1 % | not traced |
| /de/de/book/flights/flight-search | -5.0 % | +3.0 % | not traced |
| /de/en/book/flights/flight-search | -4.8 % | -3.1 % | not traced |
| /de/en/homepage | -4.7 % | -1.0 % | -184 px before "Looking for more than just a flight" (1440): not traced |
| /de/de/book/baggage, /de/en/book/baggage | -4.6 / -4.6 % | +3.4 / +3.0 % | not traced |
| /de/de/my-bookings/check-in | +0.4 % | +4.2 % | not traced |
| /de/de/homepage | -4.1 % | +1.4 % | not traced |
| /de/de/my-bookings/services/additional-services | -3.9 % | -0.8 % | not traced |
| /de/en/discover/services-on-board/entertainment | -3.5 % | +2.6 % | not traced |
| /de/en/my-bookings/check-in | +1.2 % | +3.1 % | not traced |
| /de/en/discover/travel-classes/business-class | -3.0 % | +0.8 % | not traced |

Tab controls (item 4): Discover's 7 pages with one all have tab sections.
