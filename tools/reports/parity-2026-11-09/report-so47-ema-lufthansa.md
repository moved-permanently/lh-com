# ema-lufthansa: standing order 47 (2026-11-19, the last marked pages; the reach of orders 44 to 47)

About 04:40 to 11:00 UTC. Figures are in full Chrome, measured only once every section and block of the page reports loaded, with Liberation Sans standing in for Arial (PARITY_ARIAL_FONTS, tools/parity/arial-alias.mjs), and with airline hosts refused per request. "As served" is the page on the brand host today. "With the row" is DA's copy with the drafted rows, rendered in the same served page shell with the theme's rule. The gate for every rule: all recorded page-widths of the brand, with the rule toggled in the same load. No page-width may end more than 0.5 points further from www than today, and the sum of % off www must go down. Nothing was uploaded, previewed or published by me, and DA was read, never written.

## Pushed

| commit | what |
|---|---|
| dc46c297 | item 1: delta-so47-discover-token-free (punta-cana de/de's `{spacer-30}`, without a carrier) |
| 7ffaad4f | items 2 and 4: brussels.css (the notice carriers from brussels-parity-015; order 46's closing link-list end scoped to link lists), delta-so47-brussels-token-free (aviation-services-law), test token-free-so47, token-free-so46's Brussels assertion on the scoped selector |
| this commit | item 5: brussels.css (a one-message page keeps www's space under its closing button: be/en unsubscribe-failure, whose `{spacer-11}` order 44's rows removed), test token-free-so47; this report (items 3 to 5, the census and the samples) |

## 1. Discover punta-cana de/de: the READY row without a carrier (dc46c297)

**Shipped: the row without the marker**, the migration session's decision (−1.05 % at 1440). No carrier was shipped: order 46 found no Discover scope for a column view ending in running text that keeps santorini (de/de, de/en) and punta-cana de/en within 0.5 points.

| page | www (1440 / 390) | as served with the marker | with the row |
|---|---|---|---|
| /de/de/travel-inspiration/inspiration/destinations/punta-cana | 4,666 / 5,485 | 4,684 / 5,510 | **4,617 / 5,511** |

Your job has already applied it: the served page is now 4,617 at 1440. **Discover's census is 0**: no served Discover document holds a style token.

## 2. Brussels ao/fr aviation-services-law: notice carriers (7ffaad4f), the row READY

From the recording brussels-parity-015 (default state, all four accordions closed; 2,682 / 4,771; 90 / 72 px from the last heading to the footer). Aligned on the H1, ours without the four `{spacer-28}` against www:

| stretch | ours − www (1440 / 390) |
|---|---|
| the intro paragraph to the list and the first H2 ("Denied boarding") | −49 / −62 |
| each later paragraph or list to the next H2 | −17 / −12 |
| the last section to the accordion | about −1 / −4 |
| the four collapsed accordion items | within 1 px |
| the accordion's end to the footer | −40 / −22 (www 90 / 72, ours 48 / 48) |

**Page-wide forms failed the gate**, so none shipped:
- the space above an H2 after text in every sidebar-h1 section: privacy-notice-applicants 390 0.09 → 0.95 %;
- a closing accordion's end: liability, travel-id and the voucher terms further;
- the list after the intro matched no other recorded page.

**The carriers in brussels.css are scoped to the notice's shape**: a sidebar-h1 section whose text opens with a title, a paragraph and a list. Among the 1,801 served Brussels documents only the two aviation-services-law copies (ao/fr, il/en) have that shape.
- The list's space under the opening paragraph: 50 px (32 from 768).
- Above each H2 after text: 12 px (17 from 768).
- The closing accordion section's space to the footer: 22 px (40 from 768).

**Gate on all 208 recorded Brussels page-widths:** 208 measured, 0 bad loads, 0 moved, none further (sum 381.40 → 381.40).
- This includes aviation-services-law itself as served. Its markers draw as spacers between the paragraph and the list and before each H2, so the carriers' selectors don't match until the rows remove the markers. The code can therefore merge before the rows apply.
- **The gate's second condition, a lower sum, is met only once the row applies.** As served the carriers move nothing. With the row the Brussels sum falls by 2.44 points (the two aviation page-widths below).
- **Why 381.40 here and 374.17 at the end:** in the gate loads, four form pages (charter, feedback/other, dsar-start, emergency-contact) drew their 71 px Turnstile box, and in the baseline loads they didn't. Each gate compares the rule with no rule in the same load, so the box doesn't touch the verdict.

| page | www (1440 / 390) | as served (4 markers) | with the row and the carriers |
|---|---|---|---|
| /ao/fr/legal-notices/aviation-services-law | 2,682 / 4,771 | 2,635 / 4,702 (−1.75 / −1.45 %) | **2,678 / 4,742 (−0.15 / −0.61 %)** |

- **The rows:** 4, each removes one `<p>{spacer-28}</p>` and writes nothing else. They were checked on DA's copy re-read at 06:30 UTC: they apply once and revert byte for byte.
- **Order:** apply only once 7ffaad4f is on main.
- **il/en aviation-services-law:** the same text, unmarked and not recorded. With the carriers it gains the same spacing (rendered at 1440 and 390: nothing out of its column, overlapping or cut off).
- **After the row, Brussels' census is 0.**

## 3. ITA phone pages with the Arial face: the six over 2 %

80 recorded ITA page-widths, measured with Liberation Sans: sum 61.17, median 0.52 %.

| page | width | ours / www | % off | cause |
|---|---|---|---|---|
| it/it …/check-in-information/online-check-in | 1440 | 2,627 / 2,715 | −3.24 | −67 px between "Scegli il posto" and "Temi correlati": the sidebar aside's card teaser, drawn 67 px shorter than www's |
| …/discover-ita-airways/network | 390 | 5,690 / 5,517 | +3.14 | the lead H2 under the H1: ours heading-medium (28 / 36 px), www heading-small (22 / 28); +132 px over the page |
| …/families-and-children/baggage-and-strollers | 390 | 7,635 / 7,882 | −3.13 | −206 px inside the "Newborn" panel's four tables: ours 118 to 144 px a row with 32 px cell padding. www's maui-table draws in its shadow DOM, which the recording doesn't keep, so its rows can't be measured |
| it/it …/check-in-information/online-check-in | 390 | 4,061 / 4,152 | −2.19 | −48 px at the teaser H3, −41 at the end (the same card teaser as at 1440) |
| …/extra-services/travel-insurance | 390 | 3,972 / 4,059 | −2.14 | −50 px between "General Terms…" and "Previous insurance": one paragraph and a link |
| …/corporate-b2b | 1440 | 1,461 / 1,492 | −2.08 | −24 px between the H1 and the cards, −8 at the end |

**The rule tried: the lead H2 in heading-small.** `h1 + h2` in default content, at heading-small's size and margin. It brings network 390 to 0.65 %, but **FAILS the gate**: 20 page-widths moved, 8 more than 0.5 points further, sum 61.17 → 66.86. Among them:
- network 1440: 0.14 → 1.46 %;
- the app page: 0.89 → 2.10 % and 0.87 → 1.90 %;
- digital-newsstand 390: 0.05 → 1.23 %;
- miles-and-more, fco-lin, and the two economy meals pages.

On www the lead H2's size is the author's choice per page, so there is no ITA default that fits. **Held.** No other cause in the six is a rule:
- the card teaser is one sidebar layout;
- the tables can't be measured on www;
- travel-insurance and corporate-b2b are single-page text spacing.

**ITA's top 15 (Arial face)** replaces order 46's DejaVu list:

| rank | page | width | % off www |
|---|---|---|---|
| 1 | it/it …/check-in-information/online-check-in | 1440 | -3.24 |
| 2 | it/en …/discover-ita-airways/network | 390 | +3.14 |
| 3 | it/en …/families-and-children/baggage-and-strollers | 390 | -3.13 |
| 4 | it/it …/check-in-information/online-check-in | 390 | -2.19 |
| 5 | it/en …/extra-services/travel-insurance | 390 | -2.14 |
| 6 | /it/en/corporate-b2b | 1440 | -2.08 |
| 7 | it/en …/families-and-children/baggage-and-strollers | 1440 | -1.98 |
| 8 | it/en …/entry-regulations-schengen/entry-exit-system | 390 | -1.77 |
| 9 | it/en …/at-the-airport/digital-newsstand | 1440 | +1.75 |
| 10 | it/en …/travel-classes/business-class-medium-haul | 1440 | -1.67 |
| 11 | /it/it/help-and-contact | 1440 | -1.64 |
| 12 | /it/en/corporate-b2b | 390 | -1.59 |
| 13 | /it/en/book-and-prepare/flight-search | 390 | -1.47 |
| 14 | it/en …/check-in-information/online-check-in | 390 | -1.40 |
| 15 | it/en …/fleet/long-haul | 1440 | -1.28 |

Ranks 7 to 15 are under 2 %.
- Two of them were compared heading by heading:
  - business-class-medium-haul 1440: −46 px between "Dedicated airport services" and "Please Note:";
  - flight-search 390: −48 px between the H1 and "Related".
- The other seven are the same pages as ranks 1 to 6 at their other width, or pages with no heading comparison this order.
- No shared pattern; no ITA rule.

## 4. The reach of the rules of orders 44 to 47

**Census:** every served document from the upload-state files (Brussels 1,801, ITA 2,574, Discover 563), rendered on its brand host at 1440 once every section had loaded. A document counts when the rule's selector matches in it. The phone-only rules count the same elements, which they change only below 768.

| brand | rule (order) | documents | elements |
|---|---|---|---|
| Brussels | M at 40 (45) | 238 | 514 |
| Brussels | closing link-list end (46), as shipped in 1f531b11 | 119 (98 footer fragments, 21 pages) | 119 |
| Brussels | the same, scoped in 7ffaad4f | 105 (98 footer fragments, 7 pages) | 105 |
| Brussels | lounges hub end (46) | 1 | 1 |
| Brussels | H3 large in heading-small (46, style-markers) | 1 | 70 |
| Brussels | the notice carriers (47) | 2 (ao/fr, il/en aviation-services-law) | — |
| Brussels | a one-message page's closing button (47, this commit) | 12 (farealert unsubscribe-failure and -success in be/en, be/fr, be/nl, de/de, it/it; es/en retain-your-status; il/en birthright thank-you) | 12 |
| Discover | H2 after an accordion or a link-ending view (46) | 69 | 82 |
| Discover | the same on phones (46) | 54 | 57 |
| Discover | M at 40 (45) | 25 | 30 |
| Discover | the intro view without marks (45) | 8 | 8 |
| ITA | column-view H3 weight (45) | 55 | 218 |
| ITA | padded-view H2 heading-medium (44) | 40 | 298 |
| ITA | padded view with links, H2 heading-small (46) | 11 | 11 |
| ITA | stacked country columns on phones (46) | 12 | 172 |

The footer fragments are counted because they are served documents. On a page the footer is drawn outside main, where the rule doesn't reach.

**Samples:** 52 documents, up to five per rule, rendered at 1440 and 390. For every element the rule matches, the check looked for four faults: drawn out of its column, overlapping the next element, text cut off, or an empty box over 200 px. It also checked the page for horizontal overflow.
- **No faults** at either width.
- **One false alarm:** the stacked country columns at 1440 on the five contact pages report each column "overlapping" the next. They are side by side there, and the rule applies only on phones.

**What was fixed or scoped:**
- **Order 46's link-list end took 14 terms pages' closing bullet lists.** The pages are terms-and-conditions-baggage-sale, conditions-seat-reservation and terms-and-conditions-upgrade, in up to six languages. Their list items hold text, not links, so `:not(:has(> li > :not(a)))` let them through.
- Since 1f531b11 those pages have had 54 / 88 px more under the list. None is recorded on www, so there is no figure against www.
- 7ffaad4f puts the rule on the list and requires a link in it (`:has(> li > a)`). It now takes be/en legal-notices and the six immigration-regulations-canada copies only.
- **Gate on the 208 recorded Brussels page-widths:** 208 measured, 0 bad loads, 0 moved, none further (sum 381.40 → 381.40). No recorded page is among the 14.
- **Order 46's report was wrong about the lounges hub end.** It said the end reaches the other seven lounges pages. The census over the served documents finds it on de/de lounges only.

## 5. Brussels' top 15, and ranks 16 to 35 per brand

### Brussels' top 15: content or function differences (no rows)

| rank | page | width | ours / www | % off | difference |
|---|---|---|---|---|---|
| 1 | prod/content …/new/fop_standalone_1_en.html | 390 | 1,237 / 844 | +46.56 | www's payment-method picker, recorded on its own: owner decision (flag brussels-payment-picker) |
| 2 | /be/fr/book-a-flight/our-payment-methods | 1440 | 2,785 / 3,752 | -25.77 | www's 750 px country-picker iframe; built behind the flag, off (owner decision) |
| 3 | /be/fr/book-a-flight/our-payment-methods | 390 | 4,461 / 5,393 | -17.28 | www's 750 px country-picker iframe; built behind the flag, off (owner decision) |
| 4 | /be/en/local-page/offers | 1440 | 4,286 / 4,630 | -7.43 | live fare cards and the flight-search widget's no-API state (data) |
| 5 | /be/en/special-care/families-and-children | 1440 | 1,702 / 1,814 | -6.17 | the hub ending: −111 px from the H1 to the footer, of which 16 under the closing cards (www 158, ours 142); held hub ending (A) |
| 6 | /il/en/rebooking-request-birthright | 1440 | 2,014 / 1,899 | +6.06 | our form's Turnstile box (71 px), which www has not (function) |
| 7 | /be/fr/special-care/families-and-children | 1440 | 1,780 / 1,892 | -5.92 | as be/en: the hub ending and the content above the cards |
| 8 | /be/en/local-page/offers | 390 | 5,882 / 6,236 | -5.68 | live fare cards and the flight-search widget's no-API state (data) |
| 9 | /be/en/check-in-options-and-info/check-in-times | 390 | 4,108 / 4,354 | -5.65 | document: www's collapsed check-in times component (−259 px before "Related topics"), imported as a link |
| 10 | /be/fr/our-company | 390 | 10,316 / 9,803 | +5.23 | owner decision: www cuts the cards' text after three lines |
| 11 | /ke/en/homepage | 1440 | 4,304 / 4,110 | +4.72 | live data (the fare teaser) |
| 12 | /be/en/check-in-options-and-info?country=BE&language=EN | 390 | 2,986 / 3,132 | -4.66 | the held hub ending (A) |
| 13 | /be/fr/extra-services/meals | 390 | 3,361 / 3,519 | -4.49 | a closing card grid; www's gap varies on that ending |
| 14 | /be/fr/my-bookings/cancel-and-refund-requests | 1440 | 1,684 / 1,758 | -4.21 | the sidebar-h1 accordion ending (as aviation-services-law's before order 47; its notice carriers don't reach this page's shape) |
| 15 | /be/en/book-a-flight | 1440 | 1,476 / 1,418 | +4.09 | a closing teaser row: www 82 px under it, ours 112; other teaser endings differ the other way |

### Ranks 16 to 35

For each page-width: the largest step, meaning the stretch between two matched headings (or the last heading and the footer) where ours gains or loses most against www's live measurements.

**Brussels**

| rank | page | width | % off | ours − www; largest step |
|---|---|---|---|---|
| 16 | /it/it/legal-notices/special-assistance-legal-guidelines | 1440 | -4.08 | ours-www -62 px; largest step -28 px between "What is a 'disabled person' or" and "Legal guidelines for flights t" (at the last match -59) |
| 17 | /be/en/contact/service-charges | 1440 | -4.05 | ours-www -68 px; largest step -41 px between "Credit card fee (OPC) for desk" and "the footer" (at the last match -67) |
| 18 | /il/en/rebooking-request-birthright | 390 | +4.03 | ours-www +115 px; largest step +60 px between "Rebooking request for Birthrig" and "the footer" (at the last match +50) |
| 19 | /be/nl/contact/service-charges | 1440 | -4.02 | ours-www -69 px; largest step -41 px between "Creditcardkosten (OPC) voor de" and "the footer" (at the last match -66) |
| 20 | /it/it/legal-notices/special-assistance-legal-guidelines | 390 | -3.95 | ours-www -89 px; largest step -52 px between "What is a 'disabled person' or" and "Legal guidelines for flights t" (at the last match -66) |
| 21 | /ke/en/homepage | 390 | -3.81 | ours-www -199 px; largest step -2812 px between "page top" and "Brussels" (at the last match -201) |
| 22 | /be/en/my-bookings | 390 | +3.74 | ours-www +136 px; largest step +123 px between "Manage" and "the footer" (at the last match +133) |
| 23 | /be/en/farealert/unsubscribe-failure | 1440 | -3.51 | ours-www -33 px; largest step -29 px between "Unsubscription failed" and "the footer" (at the last match -33) |
| 24 | /be/en/check-in-options-and-info/check-in-times | 1440 | -3.27 | ours-www -85 px; largest step -43 px between "When can I check-in when I fly" and "Related topics" (at the last match -84) |
| 25 | /be/fr/special-care/families-and-children | 390 | -3.26 | ours-www -124 px; largest step -102 px between "Familles et enfants" and "the footer" (at the last match -102) |
| 26 | /be/en/travel-classes/economy | 1440 | -3.04 | ours-www -97 px; largest step -38 px between "Related topics" and "the footer" (at the last match -96) |
| 27 | /be/en/my-bookings/cancel-and-refund-requests | 1440 | -2.92 | ours-www -48 px; largest step -59 px between "Rebooking fee Additional charg" and "the footer" (at the last match -47) |
| 28 | /be/en/legal-notices/us-traveling-with-disabilities | 1440 | -2.81 | ours-www -37 px; largest step -23 px between "Traveling with disabilities to" and "Flight booking and reservation" (at the last match -35) |
| 29 | /be/en/legal-notices/us-traveling-with-disabilities | 390 | -2.72 | ours-www -51 px; largest step -24 px between "Flight booking and reservation" and "Advanced seat requests" (at the last match -47) |
| 30 | /be/en/special-care/families-and-children | 390 | -2.72 | ours-www -99 px; largest step -102 px between "Families and children" and "the footer" (at the last match -102) |
| 31 | be/en …/meals/bon | 1440 | -2.72 | ours-www -131 px; largest step -69 px between "Related topics" and "the footer" (at the last match -130) |
| 32 | /be/fr/check-in-options-and-info?country=BE&language=FR | 390 | -2.68 | no comparison |
| 33 | /be/en/legal-notices/terms-and-conditions-conditions-of-carriage | 1440 | -2.68 | ours-www -762 px; largest step -465 px between "Article 8: Baggage" and "the footer" (at the last match -760) |
| 34 | /be/en/farealert/unsubscribe-failure | 390 | -2.64 | ours-www -36 px; largest step -21 px between "Unsubscription failed" and "the footer" (at the last match -31) |
| 35 | /be/fr/book-a-flight | 1440 | +2.55 | ours-www +38 px; largest step +36 px between "Vols" and "the footer" (at the last match +39) |

Causes, and whether a rule fits:
Causes, and whether a rule fits:
- **Page endings** (economy −38 and meals/bon −69 after "Related topics", families −102 at 390, service-charges −41 in two languages, cancel-and-refund −59, my-bookings 390 +123, be/fr book-a-flight +36):
  - www's gap after these endings varies from page to page, for example from 61 to 193 px after a plain four-up grid.
  - Order 43's page-end rule took 16 of these further (my-bookings 390 +3.74 → +5.47 %, book-a-flight +4.09 → +5.85 %). Order 46's census found no single gap.
  - No rule.
- **check-in-times 1440** (−43 before "Related topics"): the same document difference as rank 9 at 390 (www's collapsed check-in times component).
- **special-assistance-legal-guidelines** (−28 / −52 in one section) and **us-traveling-with-disabilities** (−23 / −24, ending 37 / 51 px short): sidebar-h1 legal pages with accordions.
  - Order 22's rule for that ending failed on five other legal pages that end like www's.
  - Order 47's page-wide forms of the notice carriers failed the gate as well (privacy-notice-applicants, liability, travel-id, the voucher terms).
  - No rule.
- **unsubscribe-failure** (−29 / −21 from the title to the footer; ranks 23 and 34): **a rule fits, shipped in this commit.**
  - Order 25's row gave the page www's space under its closing button as a `{spacer-11}` (939 / 1,357). Order 44's token-free rows removed it, and nothing carried it.
  - The carrier: a page whose only section is plain text (a title, paragraphs and a closing button) keeps 32 px under the button from 768, and 29 on phones.
  - By markup, 12 served documents have that shape (the census table in item 4). All 12 were rendered at 1440 and 390, with the selector matching once on each and no fault.
  - **Gate on all 208 recorded Brussels page-widths:** 0 bad loads, 2 moved, both closer, none further. 1440: 907 → 939 (www 940), −3.51 → −0.11 %. 390: 1,328 → 1,357 (www 1,364), −2.64 → −0.51 %. Sum 381.40 → 375.87 (−5.53). **PASS.**
  - The same loss is on be/fr travel-classes 1440 (rank 38, its spacer above the title, −2.47 %) and refund-for-cancelled-flights 1440 (rank 50, −2.09 %). Both are outside ranks 16 to 35 and were not worked this order.
- **Content or function:**
  - rebooking-request-birthright 390: the Turnstile box.
  - ke/en homepage 390: the live fare teaser. Its headings don't match www's ("Brussels" first at a different place), so the step figure means nothing.
- **terms-and-conditions 1440:** −465 px from "Article 8: Baggage" to the footer, in the FAQ accordion's last panels. Not located further this order; order 46's 70 H3 rows draw these headings as served.
- **be/fr check-in-options-and-info?country=BE&language=FR:** a query-string address, recorded but with no heading measurements to compare.

**ITA**

| rank | page | width | % off | ours − www; largest step |
|---|---|---|---|---|
| 16 | it/en …/at-the-airport/group-boarding | 390 | -1.24 | ours-www -73 px; largest step -24 px between "Easy Parking" and "the footer" (at the last match -73) |
| 17 | it/en …/baggage/checked-baggage | 390 | +1.24 | ours-www +62 px; largest step +170 px between "Excess baggage charges" and "Baggage Assistance" (at the last match +63) |
| 18 | /it/en/profile/miles-and-more | 1440 | -1.20 | ours-www -47 px; largest step -42 px between "The frequent flyer and awards " and "Explore the travel benefits fo" (at the last match -50) |
| 19 | it/en …/at-the-airport/group-boarding | 1440 | -1.16 | ours-www -57 px; largest step -26 px between "Short/Medium-Haul flights" and "Long-haul flights" (at the last match -59) |
| 20 | it/en …/utilities/invoicing | 1440 | +1.03 | ours-www +25 px; largest step +24 px between "Flight Certification" and "the footer" (at the last match +23) |
| 21 | it/en …/seats-selection/seats-selection-economy | 1440 | +1.02 | ours-www +46 px; largest step +26 px between "Economy Class: The Convenient " and "Legroom Seat" (at the last match +43) |
| 22 | it/en …/roma-fiumicino/lost-and-found | 390 | -1.01 | ours-www -40 px; largest step -20 px between "Baggage" and "All About Rome Fiumicino Airpo" (at the last match -39) |
| 23 | it/en …/baggage/electronic-devices-and-batteries | 390 | -0.98 | ours-www -81 px; largest step -32 px between "Request for transport authoriz" and "Portable electronic devices wi" (at the last match -81) |
| 24 | it/en …/families-and-children/flying-with-a-baby | 390 | -0.98 | ours-www -50 px; largest step -32 px between "Related" and "‘First-Time Flyer’ certificate" (at the last match -50) |
| 25 | /it/en/legal/health-and-safety-at-work | 1440 | -0.95 | ours-www -26 px; largest step -28 px between "Occupational Health and Safety" and "the footer" (at the last match -29) |
| 26 | it/en …/families-and-children/first-time-flyers | 390 | -0.94 | ours-www -31 px; largest step -29 px between "A Flight They’ll Never Forget" and "Related" (at the last match -31) |
| 27 | it/en …/discover-ita-airways/ita-airways-app | 1440 | -0.89 | ours-www -36 px; largest step -24 px between "Mobile check-in" and "Track flights with FlightRadar" (at the last match -38) |
| 28 | /it/en/local-page/verona | 390 | -0.88 | ours-www -31 px; largest step -26 px between "Verona, an Italian masterpiece" and "Operating flights from 28 Marc" (at the last match -31) |
| 29 | it/en …/discover-ita-airways/ita-airways-app | 390 | -0.87 | ours-www -45 px; largest step -53 px between "Keep an eye on everything with" and "Track flights with FlightRadar" (at the last match -45) |
| 30 | it/en …/airport-transfer/limolane | 1440 | +0.84 | ours-www +23 px; largest step +16 px between "Transfer" and "the footer" (at the last match +21) |
| 31 | it/en …/travel-classes/business-class-medium-haul | 390 | -0.81 | ours-www -40 px; largest step -19 px between "Airbus A321neo" and "Related" (at the last match -39) |
| 32 | /it/en/book-and-prepare/flight-search | 1440 | -0.79 | ours-www -15 px; largest step -32 px between "Flight search" and "Related" (at the last match -18) |
| 33 | it/en …/sustainability/iris | 390 | -0.78 | ours-www -43 px; largest step -29 px between "Our actions" and "Related" (at the last match -42) |
| 34 | it/en …/territorial-continuity/alghero | 390 | -0.71 | ours-www -25 px; largest step -32 px between "Alghero: a Catalan soul, a Sar" and "the footer" (at the last match -25) |
| 35 | it/en …/fleet/short-haul | 390 | +0.71 | ours-www +21 px; largest step +26 px between "Choose your favorite seat in a" and "the footer" (at the last match +22) |

No step is shared by several pages; most are 20 to 30 px in one stretch, on one page. checked-baggage 390 (+170 between "Excess baggage charges" and "Baggage Assistance") is its fee table. No ITA rule.

**Discover**

| rank | page | width | % off | ours − www; largest step |
|---|---|---|---|---|
| 16 | /de/de/book/baggage | 1440 | -1.68 | ours-www -70 px; largest step -43 px between "Das könnte Sie auch interessie" and "the footer" (at the last match -70) |
| 17 | /de/en/book/baggage | 1440 | -1.67 | ours-www -70 px; largest step -43 px between "This might also be of interest" and "the footer" (at the last match -70) |
| 18 | /de/de/homepage | 390 | +1.33 | ours-www +74 px; largest step +42 px between "Entdecken Sie weitere Themen" and "Greatness is a Group effort" (at the last match +89) |
| 19 | de/de …/services/additional-services | 390 | -1.31 | ours-www -60 px; largest step -82 px between "Medikamenten Transport mit dem" and "the footer" (at the last match -46) |
| 20 | de/en …/manage/customer-service | 390 | -1.28 | ours-www -81 px; largest step +32 px between "At Discover Airlines, what lou" and "the footer" (at the last match -84) |
| 21 | de/en …/baggage/excess-baggage | 390 | -1.13 | ours-www -28 px; largest step -24 px between "Excess baggage" and "the footer" (at the last match -32) |
| 22 | de/de …/check-in/check-in-at-the-airport | 390 | -1.09 | ours-www -23 px; largest step -28 px between "Check-in am Flughafen" and "Wie nutze ich die Gepäckautoma" (at the last match -8) |
| 23 | de/de …/destinations/punta-cana | 1440 | -1.05 | ours-www -49 px; largest step -92 px between "Urlaub in Punta Cana" and "Wissenswertes" (at the last match -49) |
| 24 | de/de …/services/additional-services | 1440 | -1.00 | ours-www -41 px; largest step -40 px between "Medikamenten Transport mit dem" and "the footer" (at the last match -41) |
| 25 | de/de …/destinations/santorini | 1440 | +0.99 | ours-www +76 px; largest step +45 px between "Santorini Urlaub" and "Wieso nach Santorini" (at the last match +76) |
| 26 | de/en …/special-requests/families | 390 | +0.95 | ours-www +77 px; largest step +36 px between "Kids’ entertainment on short a" and "This might also be of interest" (at the last match +73) |
| 27 | de/en …/services-on-board/entertainment | 390 | +0.88 | ours-www +48 px; largest step +70 px between "Experience the excitement of f" and "the footer" (at the last match +45) |
| 28 | de/en …/travel-classes/business-class | 390 | +0.78 | ours-www +25 px; largest step +36 px between "This might also be of interest" and "the footer" (at the last match +21) |
| 29 | de/de …/services-on-board/entertainment | 1440 | -0.72 | ours-www -26 px; largest step +66 px between "Entertainment auf der Kurz- & " and "Kopfhörer" (at the last match -26) |
| 30 | de/en …/destinations/santorini | 1440 | +0.68 | ours-www +52 px; largest step -65 px between "Bucket list for your vacation " and "Weather & best time to travel" (at the last match +52) |
| 31 | /de/de/my-bookings/check-in | 390 | +0.60 | ours-www +18 px; largest step +38 px between "Online Check-in mit Code des R" and "the footer" (at the last match +33) |
| 32 | de/de …/travel-classes/business-class | 1440 | +0.50 | ours-www +21 px; largest step +44 px between "Bester Service und Komfort übe" and "Ihre Vorteile an Bord" (at the last match +22) |
| 33 | de/de …/destinations/punta-cana | 390 | +0.47 | ours-www +26 px; largest step -34 px between "Urlaub in Punta Cana" and "Wissenswertes" (at the last match +40) |
| 34 | de/en …/services/additional-services | 1440 | +0.44 | ours-www +16 px; largest step +16 px between "Express Rail" and "the footer" (at the last match +16) |
| 35 | de/de …/special-requests/families | 390 | +0.41 | ours-www +33 px; largest step -45 px between "Gepäckabholservice von Airport" and "Onboard Entertainment für Kind" (at the last match +47) |

- **The baggage pages in both languages** (−43 px from "Das könnte Sie auch interessieren" / "This might also be of interest" to the footer at 1440): 12 recorded page-widths have that related-cards ending. On the other 10 ours is +23 to +37 px or −24 px from www, so a rule adding space there would take most of them further. No rule.
- **The rest** are single-page steps in destination and service texts. punta-cana de/de 1440 (−92 above "Wissenswertes") is the column view held since order 46, now without its marker. The offers page stays with the owner.

## Each brand at the end (Arial face, as served)

| brand | page-widths | sum of % off www | median | with order 47's READY row |
|---|---|---|---|---|
| Brussels | 208 | 374.17 before this commit; 368.64 with this commit's carrier | 0.97 %; 0.92 % | 366.19, median 0.89 % (aviation −1.75 → −0.15 %, −1.45 → −0.61 %) |
| ITA | 80 | 61.17 | 0.52 % | (no row) |
| Discover | 54 | 356.22 | 0.83 % | (punta-cana already applied: included) |

Discover's sum is mostly its offers page (live data, owner decision).

## Checks

Before every push: whole-repo `npm run lint`, its exit code read (0 each time, and again after each rebase), and stylelint exit 0 on the changed theme.
- **dc46c297:** lint 0. The folder-reading tests: 865 / 865 pass (the 185 test files that read tools/reports).
- **7ffaad4f:** lint 0, stylelint brussels.css 0, the full suite on the committed tree 4,861 pass / 0 fail. Rebased onto cf715dad, lint 0 again, pushed in the first round.
- **This commit:** lint, stylelint brussels.css and the full suite before its push. The figures are in the final answer to this order.

Not in git: the recordings, the gate and census loads and their logs, `.migration/project.json`. No upload, preview or publish; DA was read only; no request reached an airline host (each browser refused them by route). /de/en/overview-manage has no row.
