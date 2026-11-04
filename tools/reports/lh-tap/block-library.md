# Block library check

2026-11-04. 36 library variants: 15 OK on the named pages, 7 with named pages that differ, 0 with a library error, 0 notes, 14 second structures. "Blocks differing" counts every block of the variant on all pages that does not resolve against the library table (tools/reports/block-library.json lists them); "Other rows" counts rows of multi blocks with another cell count than the item (label, intro or config rows), which the sidebar shows as items without editable fields.

SECOND: a later library entry of the same variant (another structure its pages use, for inserting it); the Block Inspector edits every block of a variant with the first entry (library.js getBlockFieldTemplate). "No entry fits" counts the blocks of a variant that none of its entries fits.

| Variant | Result | Detail | Blocks differing / all | No entry fits | Other rows (multi) |
| --- | --- | --- | --- | --- | --- |
| accordion-columns (faq) | PAGES | /en-pt/bookings/flight-and-train: row 2 cell 2 "Text": list, the library text | 1098 / 2381 | 576 |  |
| accordion-columns (faq) [Accordion columns (faq): text | list] | SECOND | fits 291 of the 2381 blocks of the variant (accordion-columns (faq) fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 291 / 2381 |  |  |
| accordion-columns (faq) [Accordion columns (faq): text | image] | SECOND | fits 231 of the 2381 blocks of the variant (accordion-columns (faq) fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 231 / 2381 |  |  |
| accordion-columns (tabs) | OK | checked /pt-pt/reservas/tarifas-tap, /en-pt/bookings/tap-fares, /de-de/buchungen/tarife-tap | 0 / 14 |  |  |
| booking-box | OK | checked /pt-pt, /en-pt, /de-de | 0 / 7 |  |  |
| cards-icon | OK | checked /pt-pt/a-bordo/refeicoes, /en-pt/bookings/flight-and-train, /de-de/an-bord/mahlzeiten | 7 / 75 | 0 | 51 |
| cards-icon [Cards icon: image | text] | SECOND | fits 7 of the 75 blocks of the variant (cards-icon fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 7 / 75 |  |  |
| cards-teaser | PAGES | /pt-pt/a-bordo/altitude-film-festival: row 1 cell 1 "Text": image, the library text; row 2 cell 1 "Text": image, the library text \| /de-de/an-bord/altitude-film-festival: row 1 cell 1 "Text": image, the library text; row 2 cell 1 "Text": image, the library text | 28 / 59 | 0 |  |
| cards-teaser [Cards teaser: image | text] | SECOND | fits 28 of the 59 blocks of the variant (cards-teaser fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 28 / 59 |  |  |
| cards-teaser (three-up) | PAGES | /en-pt/bookings/ponte-aerea: row 1 cell 1 "Image": text, the library image; row 2 cell 1 "Image": text, the library image | 63 / 344 | 0 |  |
| cards-teaser (three-up) [Cards teaser (three-up): text | text] | SECOND | fits 63 of the 344 blocks of the variant (cards-teaser (three-up) fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 63 / 344 |  |  |
| cards-teaser (four-up) | OK | checked /pt-pt/reservas/modalidades-de-pagamento, /en-pt/bookings/payment-methods, /de-de/buchungen/zahlungsmethoden | 0 / 21 |  |  |
| cards | OK | checked /pt-pt/informacoes/documentacao/vistos-schengen, /en-pt/bookings/time-to-think, /de-de/buchungen/time-to-think | 5 / 26 | 0 | 20 |
| cards [Cards: image | text, list] | SECOND | fits 5 of the 26 blocks of the variant (cards fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 5 / 26 |  |  |
| cards (three-up) | OK | checked /pt-pt/a-bordo/refeicoes/classe-executiva, /en-pt/help/requests-complaints, /de-de/an-bord/mahlzeiten/business-class | 0 / 133 |  |  |
| carousel-cards | OK | checked /pt-pt, /en-pt, /de-de | 0 / 7 |  |  |
| columns-media | PAGES | /pt-pt/a-bordo/economy-prime: row 1 cell 1 "Image": text, the library image; row 1 cell 2 "Text": image, the library text \| /de-de/an-bord/economy-prime: row 1 cell 1 "Image": text, the library image; row 1 cell 2 "Text": image, the library text | 100 / 488 | 0 |  |
| columns-media [Columns media: image | list] | SECOND | fits 56 of the 488 blocks of the variant (columns-media fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 56 / 488 |  |  |
| columns-media [Columns media: text | image] | SECOND | fits 44 of the 488 blocks of the variant (columns-media fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 44 / 488 |  |  |
| columns | OK | checked /pt-pt, /en-pt, /fr-fr | 0 / 3 |  |  |
| embed | OK | checked /pt-pt/a-bordo/economy-prime, /en-pt/miles-and-go/statuses/for-life, /de-de/an-bord/economy-prime | 0 / 12 |  |  |
| fragment | OK | checked /pt-pt/destinos/inspire-se, /en-pt/destinations/get-inspired, /de-de/reiseziele/inspirieren | 0 / 133 |  |  |
| hero-campaign (narrow) | OK | checked /pt-pt/a-bordo/altitude-film-festival, /en-pt/bookings/payment-methods, /de-de/an-bord/altitude-film-festival | 0 / 84 |  |  |
| hero-campaign (slider) | PAGES | /pt-pt: 6 rows, the library has 4 \| /en-pt: 6 rows, the library has 4 | 3 / 7 | 0 |  |
| hero-campaign (slider) [Hero campaign (slider): 6 rows] | SECOND | fits 2 of the 7 blocks of the variant (hero-campaign (slider) fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 2 / 7 |  |  |
| hero-campaign (slider) [Hero campaign (slider): image / text] | SECOND | fits 1 of the 7 blocks of the variant (hero-campaign (slider) fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 1 / 7 |  |  |
| hero-campaign (slider, narrow) | PAGES | /pt-pt/miles-and-go/parceiros: 6 rows, the library has 4 \| /en-pt/miles-and-go/partners: 6 rows, the library has 4 | 4 / 18 | 0 |  |
| hero-campaign (slider, narrow) [Hero campaign (slider, narrow): 6 rows] | SECOND | fits 4 of the 18 blocks of the variant (hero-campaign (slider, narrow) fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 4 / 18 |  |  |
| hero-card-overlay | OK | checked /pt-pt/miles-and-go/acumular-milhas/dia-a-dia, /en-pt/miles-and-go/earn-miles/day-by-day, /de-de | 0 / 9 |  |  |
| message-center | OK | checked /pt-pt/alertas-e-informacoes, /en-pt/alerts-and-informations, /de-de/warnmeldungen-und-informationen | 0 / 7 |  |  |
| table-striped | PAGES | /pt-pt/gerir-reserva/extras/lounges: no item row (2 rows, none with 4 cells); no item row (2 rows, none with 4 cells) | 27 / 59 | 1 | 58 |
| table-striped [Table striped: text | text | text] | SECOND | fits 21 of the 59 blocks of the variant (table-striped fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 21 / 59 |  |  |
| table-striped [Table striped: text | text | text | text | text | text | text | text | text] | SECOND | fits 5 of the 59 blocks of the variant (table-striped fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 5 / 59 |  |  |
| table-striped (header) | OK | checked /pt-pt/a-bordo/economy-prime, /en-pt/information/special-needs/blind, /de-de/an-bord/economy-prime | 0 / 28 |  |  |
| table-striped (header, matrix) | OK | checked /pt-pt/miles-and-go/club, /en-pt/miles-and-go/club, /de-de/miles-and-go/club | 5 / 10 | 0 | 145 |
| table-striped (header, matrix) [Table striped (header, matrix): text | text | text | text | text] | SECOND | fits 5 of the 10 blocks of the variant (table-striped (header, matrix) fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 5 / 10 |  |  |
