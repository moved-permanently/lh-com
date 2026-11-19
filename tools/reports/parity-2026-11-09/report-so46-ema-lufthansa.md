# ema-lufthansa: standing order 46 (2026-11-18/19, the last marked pages of Brussels, ITA and Discover)

About 22:45 to 04:45 UTC. Figures are in full Chrome as served, or with the drafted rows and the theme rule added in the same served page shell, with airline hosts refused per request. The gate for every rule: all recorded page-widths of the brand with the rule toggled in the same load; no page-width more than 0.5 points further from www than today. Nothing was uploaded, previewed or published by me, and DA was read, never written.

## Pushed

| commit | what |
|---|---|
| 4cd9fd68 | items 3 and 4: ita.css (a padded view whose text closes with links keeps its H2 in heading-small), discover.css (space above an H2 that opens the text after an accordion or a link-ending column view), delta-so46-ita-token-free, delta-so46-discover-token-free, test token-free-so46 |
| 1f531b11 | item 1: brussels.css (a page closing with a link list in a plain section; the lounges hub's closing four-up grid), delta-so46-brussels-token-free (legal-notices, lounges; aviation-services-law HOLD) |
| daa734ed | item 5: ita.css's stacked country columns on phones read the unmarked H2 again (contact 390 -4.70 -> +0.58 %) |
| (this commit) | item 2: THEMES.brussels "H3 large" in heading-small and a heading-small H3 marker kept as that choice (scripts/style-markers.js, after the two-hour windows of orders 57 and 70 on that file), terms-and-conditions' rows added to delta-so46-brussels-token-free, test brussels-h3-choice-so46 |
| this report | |

Your jobs have already applied and previewed three of the four lists: ITA (05e9f368, 8 documents), Discover (1aac7c2b, 5 documents) and Brussels' page ends (adb1ad83, 2 documents). Measured as served afterwards, all 15 render exactly as drafted: 16 of 16 ITA page-widths, 10 of 10 Discover and 4 of 4 Brussels, nothing lost or broken. legal-notices and lounges are now www's height at both widths.

## 1. Brussels page ends: legal-notices and lounges READY, aviation-services-law HOLD

The census behind the rules: every recorded Brussels page's gap from its last visible text to the footer, ours as served and www's in its recording.
- A first pass counted text in closed accordion panels; the census was repeated with a visibility check.
- The offline recordings draw www's accordions open, because cap-serve drops the scripts. So www's gaps after accordions, and the held sidebar-h1 ending, can't be measured offline.

What the census shows:
- **A closing link list:** www's gap is consistent, 170 / 209 px (1440 / 390). Ours on be/en legal-notices without its markers is 48 / 48. be/fr's, in a padded section, is already within 15 px of www's height.
- **A four-up grid after a padded sidebar intro:** www's gap is 157 / 158 on every recorded page (families, travel-classes, baggage, pets, lounges). Ours is 142 on the hubs, and 78 on lounges, whose grid sits in a section of its own.
- **Other endings:** www's gaps vary from page to page within a group (61 to 193 px after a plain four-up grid), so no single "page-end gap" rule fits them. The held hub ending (A) and sidebar-h1 ending (B) stay as order 45 left them.

The carriers in brussels.css, each gated on all 208 recorded Brussels page-widths. Neither matches any other recorded page, so all 208 are unchanged.

| page | www (1440 / 390) | today | without markers | with the row and the rule |
|---|---|---|---|---|
| /be/en/legal-notices | 1,428 / 1,867 | 1,428 / 1,843 | 1,330 / 1,803 | **1,428 / 1,867** |
| /de/de/extra-services/lounges | 1,344 / 2,401 | 1,344 / 2,379 | 1,311 / 2,305 | **1,344 / 2,401** |

- **legal-notices:** 54 px under the closing list on phones, 88 from 768. The padding also keeps the list's 10 px margin, so the gap becomes www's.
- **lounges:** 96 px on phones, 33 from 768. That makes the page www's height. It isn't www's gap, because the content above the grid is 46 px taller than www's at 1440. The other seven lounges pages (be/en, be/fr, be/nl, it/it, es/es, us/en, gb/en) have the same structure, no markers and no recording. They get the same end, which moves them towards www's 157 px gap.
- **aviation-services-law: HOLD.** Its four `{spacer-28}` sit before the first list and before three H2s.
  - Without them, the H2 gaps match www (29 against 25 px; 42 / 46 with the markers), and the first list is 26 / 32 px short of www's 43 / 53.
  - Aligned on the H1, the page matches www down to its last heading within 4 px a heading. Below it (the closing list, paragraph, four collapsed accordion items and the end), ours is 104 px short of www's live footer at 1440.
  - Without the markers the page is −2.87 / −4.74 % (390 / 1440; today −1.45 / −1.75 %), more than 0.5 points further, so the markers stay.
  - The shortfall needs www's collapsed accordion measured, which the offline recordings can't give. The same shortfall (30 to 74 px) is on most sidebar-h1 legal pages with 4 to 6 accordion items.

## 2. terms-and-conditions' 70 heading-small: READY (this commit)

All 70 are H3s in the panels of one FAQ accordion. On www they are `headline heading-small` (28 / 22 px).
- **Unmarked**, the accordion draws its H3s at 18 / 16 px, and the page loses 910 / 1,032 px (27,716 → 26,806 at 1440).
- **Census of every recorded Brussels accordion H3:** the other 70 (checked-baggage in six languages, 11 each; service-charges, 2 × 2) are unmarked and www's `heading-copytext-large`. A Brussels default for accordion H3s would break those pages, and the panels are built the same way on all of them. So the carrier has to be a choice in the document.
- **The carrier is the existing `title-large` block option.** THEMES.brussels now draws "H3 large" as heading-small and keeps a heading-small H3 marker as that choice, as Lufthansa's flow pages do. The collapse then writes `accordion-columns (faq, title-large)` with no marker, and a second run changes nothing (test brussels-h3-choice-so46).
- **No recorded Brussels page used `title-large` or `h3-large` before** (all 102 served copies checked), so the change draws no existing page differently.

| page | www (1440 / 390) | as served | with the row (and the theme change) |
|---|---|---|---|
| /be/en/legal-notices/terms-and-conditions-conditions-of-carriage | 28,478 / 59,474 | 27,716 / 58,662 | 27,716 / 58,662 (the H3s 28 / 22 px bold, as served) |

71 rows on DA's copy: 70 marker removals and the block option. They apply once and revert byte for byte. Order: only once this commit is on main.

## 3. ITA ita-airways-app in eight languages: READY, applied

Each language copy marks six headings: the five feature H3s (ea672c5d's column-view H3 weight carries them) and the padded "Plan your next trip" H2. That H2 is heading-small on www; ita.css drew an unmarked padded H2 as heading-medium (36 px).
- **Narrowing the scope:** "a padded view with a picture" also took entry-exit-system's country list (www heading-medium) 0.47 points further. The carrier is "a padded view whose text closes with links" (the app store links; contact and EES have none), at heading-small's size and margin.
- **Gate on all 80 recorded ITA page-widths:** 79 unchanged; /it/en's app page (36 px since order 44) closer at 390, 0.96 → 0.75 %.

| page | as served -> with the rows (1440 / 390) |
|---|---|
| /it/it/…/ita-airways-app | 4,051 -> 4,051 / 5,684 -> 5,684 |
| /fr/fr/…/ita-airways-app | 4,142 -> 4,142 / 6,458 -> 6,458 |
| /es/es/…/ita-airways-app | 4,073 -> 4,073 / 5,968 -> 5,968 |
| /de/de/…/ita-airways-app | 4,100 -> 4,100 / 6,092 -> 6,092 |
| /nl/nl/…/ita-airways-app | 4,033 -> 4,033 / 5,862 -> 5,862 |
| /br/pt/…/ita-airways-app | 4,073 -> 4,073 / 6,035 -> 6,035 |
| /gr/el/…/ita-airways-app | 4,139 -> 4,139 / 6,602 -> 6,602 |
| /jp/ja/…/ita-airways-app | 3,875 -> 3,875 / 4,609 -> 4,609 |

## 4. Discover {spacer-30}: 5 READY and applied, punta-cana de/de HOLD

Every `{spacer-30}` sits where default content opens with an H2 right after a block. The marker draws 67 px from 768 (its 31 px and Discover's 36 px paragraph margin). On phones it draws 31 after an accordion and nothing after a column view (Discover's phone rule for marker paragraphs).
- **The 1440 shortfalls** with the markers removed point to about 48 px per junction. The carrier in discover.css: 48 px above such an H2 from 768, 31 on phones after an accordion.
- **Scope:** the first draft also took column views ending in running text. That took santorini (de/de, de/en) and punta-cana de/en 0.6 to 1.0 points further. So the column-view case is limited to views ending with a link, which are families' and customer-service's.
- **Gate on all 54 recorded Discover page-widths:** families de/en (no marker) −1.46 → +0.23 % at 1440, within 0.5 points at 390; the rest unchanged.

| page | www (1440 / 390) | as served -> with the rows (1440 / 390) |
|---|---|---|
| /de/en/my-bookings/manage/customer-service | 4,375 / 6,316 | 4,399 -> 4,361 / 6,234 -> 6,235 |
| /de/de/my-bookings/manage/customer-service | 4,302 / 6,322 | 4,337 -> 4,299 / 6,214 -> 6,215 |
| /us/en/my-bookings/manage/customer-service | not recorded | 4,332 -> 4,361 / 6,203 -> 6,235 (as de/en) |
| /ca/en/my-bookings/manage/customer-service | not recorded | 4,332 -> 4,361 / 6,203 -> 6,235 (as de/en) |
| /de/de/book/special-requests/families | 5,658 / 8,148 | 5,704 -> 5,666 / 8,180 -> 8,181 |

**punta-cana de/de: HOLD.** Its marker sits after a column view ending in running text, where discover.css gives no space. Without the marker the page is −1.05 % at 1440 (today +0.39 %), 0.66 points further. de/en, with the same view and no marker, is −0.21 %, so the two copies differ elsewhere by about 60 px.

## 5. The page-widths furthest from www

### ITA

ITA's top 15 at 390 were mostly +2 to +3.5 % (74 to 105 px). The cause is the measuring machine, not the site.
- **What happens:** the footer's legal links are set in Arial 12 px bold, as on www. This Chrome has no Arial and falls back to DejaVu Sans, so the links wrap into 9 rows of 42 px where www's screenshot shows 7. That is +84 px on every ITA phone page.
- **How it was checked:** www's footer bands measured in the recording's own screenshot (1,130 + 141 px, ours 1,214 + 141). Then pages measured again with Liberation Sans for Arial: invoicing 3,607 (www 3,608), fco-lin 3,277 (3,287), help-and-contact 3,073 (3,055).
- **Result:** with that face, the 40 recorded ITA phone page-widths have a median of 0.75 % off www, and 6 are over 2 %. Your measuring Chrome may draw these the same way if it lacks Arial too.
- **A real regression fixed (daa734ed):** contact 390, −4.70 % (with the Arial face −5.79 %). Order 12's stacked country columns rule keyed on `h2.heading-medium`, which order 44's token-free rows removed. The rule reads the unmarked H2 again, when the next column opens with one (residents-in-sicily's numbered steps went 0.64 points further without that condition). Gated on the 40 phone page-widths: contact → +0.58 %, the other 39 unchanged.

ITA at 390, measured with the Arial-compatible face (worst first):

| page | ours (Arial face) | ours (DejaVu) | www | % off (Arial face) |
|---|---|---|---|---|
| …/support/utilities/contact | 7276 | 7360 | 7723 | -5.79 (the stacked columns rule, fixed in daa734ed (+0.58 % measured with DejaVu)) |
| it/it …/help-and-contact | 3024 | 3251 | 3193 | -5.29 (with DejaVu +1.82 %: its text wraps very differently in the two faces; not located further) |
| …/world-of-ita-airways/discover-ita-airways/network | 5690 | 5774 | 5517 | +3.14 |
| …/book-and-prepare/other-requests/families-and-children/baggage-and-strollers | 7635 | 7935 | 7882 | -3.13 |
| it/it …/book-and-prepare/travel-information/check-in-information/online-check-in | 4061 | 4103 | 4152 | -2.19 |
| …/manage-my-bookings/extra-services/travel-insurance | 3972 | 4056 | 4059 | -2.14 |
| …/book-and-prepare/travel-information/entry-regulations/entry-regulations-schengen/entry-exit-system | 9144 | 9228 | 9309 | -1.77 |
| …/corporate-b2b | 2545 | 2629 | 2586 | -1.59 |
| …/book-and-prepare/flight-search | 3359 | 3443 | 3409 | -1.47 |
| …/book-and-prepare/travel-information/check-in-information/online-check-in | 3934 | 4018 | 3990 | -1.40 |
| …/book-and-prepare/travel-information/at-the-airport/group-boarding | 5814 | 5898 | 5887 | -1.24 |
| …/book-and-prepare/travel-information/baggage/checked-baggage | 5062 | 5146 | 5000 | +1.24 |
| …/world-of-ita-airways/discover-ita-airways/roma-fiumicino/lost-and-found | 3918 | 4002 | 3958 | -1.01 |
| …/book-and-prepare/travel-information/baggage/electronic-devices-and-batteries | 8189 | 8273 | 8270 | -0.98 |
| …/book-and-prepare/other-requests/families-and-children/flying-with-a-baby | 5076 | 5160 | 5126 | -0.98 |

The rest of these were not located this order; none is a spacing pattern shared by several pages.

### Brussels

Brussels' top 15 (M at 40, as served). Most causes were already located in order 43 (sweep-so43-brussels.md); this order re-measured the page ends.

| page | width | % off www | cause |
|---|---|---|---|
| fop_standalone_1_en.html | 390 | +46.56 | www's payment-method picker, recorded on its own: owner decision (flag brussels-payment-picker) |
| be/fr book-a-flight/our-payment-methods | 1440 / 390 | −25.77 / −17.28 | www's 750 px country-picker iframe; built behind the flag, off (owner decision) |
| be/en local-page/offers | 1440 / 390 | −7.43 / −5.68 | live fare cards and the flight-search widget's no-API state (data) |
| be/en, be/fr special-care/families-and-children | 1440 | −6.17 / −5.92 | the hub ending: www 158 px under the cards, ours 142; the other ~95 px above the cards, not located this order |
| il/en rebooking-request-birthright | 1440 | +6.06 | our form's Turnstile box (71 px), which www has not |
| be/en check-in-options-and-info/check-in-times | 390 | −5.65 | document: www's collapsed check-in times component, imported as a link |
| be/fr our-company | 390 | +5.23 | owner decision: www cuts the cards' text after three lines |
| ke/en homepage | 1440 | +4.72 | live data (the fare teaser) |
| be/en check-in-options-and-info | 390 | −4.66 | the held hub ending (A) |
| be/fr extra-services/meals | 390 | −4.49 | a closing card grid; www's gap varies on that ending, no scope (held since order 22) |
| be/fr my-bookings/cancel-and-refund-requests | 1440 | −4.21 | the sidebar-h1 accordion ending: the shortfall below the last heading, as on aviation-services-law |
| be/en book-a-flight | 1440 | +4.09 | a closing teaser row: www 82 px under it, ours 112; other teaser endings differ the other way |

No new Brussels rule fits these: each is an owner decision, data, a document component, or an ending whose www gap varies.

## Held, with figures

- **/ao/fr/legal-notices/aviation-services-law:** 4 × {spacer-28}. Without them −2.87 / −4.74 % (today −1.45 / −1.75 %). The shortfall is below its last heading (104 px at 1440).
- **/de/de/travel-inspiration/inspiration/destinations/punta-cana:** 1 × {spacer-30}. Without it −1.05 % at 1440 (today +0.39 %).

## Checks

Before every push: whole-repo `npm run lint` exit 0 (and after each rebase), stylelint exit 0 on the changed themes. The full suite on each committed tree (it includes the folder-reading tests):
- 4cd9fd68: 4,833 / 0 pass / fail, 4,834 / 0 after the rebase.
- 1f531b11: 4,845 / 0.
- daa734ed: the first attempt was 4,846 / 2 and was undone (order 12's test still pinned the old selector; updated), then 4,848 / 0 and 4,849 / 0 after the rebase.
- This commit: see its ship.

GitHub Build green on each push, and the smoke after each push found no difference on any host.

Measured in this machine's full Chrome with DejaVu Sans standing in for Arial (as all earlier figures). Item 5's ITA table also gives the Arial-compatible figures.
