# ema-lufthansa: standing order 48 (2026-11-19, spacing lost when the markers came out)

About 08:30 to 14:00 UTC. Figures are in full Chrome, measured once every section and block reports loaded, with Liberation Sans standing in for Arial (PARITY_ARIAL_FONTS), and with airline hosts refused per request. The gate for every rule: all recorded page-widths of the brand, the rule toggled in the same load; none ends more than 0.5 points further from www than before the rule, and the sum of % off www goes down. Every carrier is a theme rule scoped by structure; no row, rule or importer change writes a style token. Nothing was uploaded, previewed or published by me, and DA was read, never written.

## Pushed

| commit | what |
|---|---|
| 444b743c | item 3: capture-requests-ema-lufthansa-so48.txt (pushed early) |
| 3e250b69 | items 1 and 2: ita.css (a grey column view's H2 in heading-medium), discover.css (the homepage's offers and destination finder sections from 768), test token-free-so48 |
| e71ac9e7 | item 1: brussels.css (terms and conditions' accordion H3s, refund-for-cancelled-flights' closing link), ita.css (group-boarding's H2 after the boarding tables), spacing-lost-so48.txt, test token-free-so48b, two more capture lines |
| this commit | item 3: ita.css (the strollers tables' frame from ita-parity-014), test ita-fare-tables-600 updated; spacing-lost-so48.txt (strollers carried); this report (items 4 and 5) |

## 1. Spacing lost when the markers came out

**Where it came from.** Two things removed the separator markers: order 44's token-free rows (16 Brussels documents, 85 rows), and the token-free re-import of 18 Nov around 00:19 UTC. The re-import dropped the importer-written spacers and the spacers earlier rows had added. That is how be/fr travel-classes and refund-for-cancelled-flights lost theirs (order 25's rows), and how ITA and Discover lost all of theirs.

**The census.**
- **Old copies:** every served document's copy from before the re-import, from the 16 / 17 Nov snapshots. That covers Brussels 1,358 of 1,801, ITA 2,451 of 2,574 and Discover 557 of 563.
- **The documents not covered (572)** were last uploaded between 30 Oct and 11 Nov and hold no marker today, so nothing was removed from them.
- **Documents with markers:** 23 Brussels, 10 ITA and 13 Discover. The hosts also serve 267 ITA and 19 Discover market views (/ae/en/..., /ca/en/..., /us/de/...) from those same documents, with a market filter. Each view was measured too, and each draws the same as its document.
- **The measurement:** each marker was put back where it stood, into the copy served today. Today's copy and the restored copy were both rendered in the served page shell at 1440 and 390. The lost space is the stretch between the elements around each marker, with the marker minus without.

**The list:** spacing-lost-so48.txt has one line per document and marker kind: the marker, the space it drew, what draws it now, the page with the marker and today against www, and the decision.

**Carriers shipped**, each scoped by structure, gated on all recorded page-widths of the brand and reach-checked at 1440 and 390 (item 5):

| brand | carrier | marker it carries | recorded page-widths moved (gate) | reach |
|---|---|---|---|---|
| Brussels | the title-large FAQ accordion's H3 after text: 12 px more | terms and conditions' 57 × `{spacer-11}` | T&C 1440 27,716 → 28,412 (www 28,478; −2.68 → −0.23 %), 390 58,662 → 59,358 (59,474; −1.37 → −0.20 %) | 1 document (the only one with title-large) |
| Brussels | a sidebar-h1 page's closing lone link after its last paragraph: 31 px more from 768 | `{spacer-30 from-768}` | refund-for-cancelled-flights 1440 1,546 → 1,577 (1,579; −2.09 → −0.13 %) | 6 documents (the refund page in six languages) |
| ITA | an H2 opening the section after a boarding-table section: 26 px more from 768 | `{spacer-25 from-768}` | group-boarding 1440 4,854 → 4,880 (4,911; −1.16 → −0.63 %) | 1 document (it/en, and its market views) |
| ITA | a panel made only of tables in www's frame: header 97 px, 32 px under each table, first body row 199 px from 768 / 172 on phones (item 3) | the cells' `{spacer-27}` / `{spacer-54}` | strollers 1440 4,358 → 4,456 (4,446; −1.98 → +0.22 %), 390 7,635 → 7,887 (7,882; −3.13 → +0.06 %) | 9 documents (strollers in nine languages) |
| Discover | the section opening with an H2 over the fare teaser, and the section opening with the destination finder: 42 and 57 px more from 768 | `{spacer-1 from-768}`, `{spacer-28}` | homepage de/de 1440 4,180 → 4,279 (4,260; −1.88 → +0.45 %), de/en 4,176 → 4,275 (4,285; −2.54 → −0.23 %) | 6 documents (the de, ca and us homepages) |

**Gate totals.** Brussels: 208 measured, 3 moved, all closer, none further, sum −5.58 points. ITA: 80 each; the group-boarding rule moved 1 (sum −0.53) and the strollers frame 2 (sum −4.82). Discover: 54, 2 moved, sum −3.74.
- The Discover rules apply only from 768. On phones the de/en homepage would go further with the `{spacer-28}` (+0.04 → +1.04 %), and both homepages' phone heights match www's within 1.4 % without it.

**No carrier: where none fits, or none is needed.**
- **Nothing needed. Without the markers the page is already as close to www, or closer:**
  - Brussels checked-baggage in six languages: with the markers 1440 is +1.05 to +2.11 %.
  - Discover business-class in four markets: with the markers 390 is +2.87 / +3.41 %.
  - Discover families and customer-service: order 46's carriers.
  - aviation-services-law, unsubscribe-failure, be/en legal-notices and lounges: carried by orders 46 and 47.
  - privacy-notice-applicants and short-notice-eu-us: within 1 px.
- **A Spacer block draws the space.** For ITA's from-768 markers the token-free collapse made Spacer blocks: flying-with-a-baby, electronic-devices, pets-in-cabin, fantasia-lounge, entry-exit-system and network. Each is within 5 px, or draws more and is closer to www than it was with the marker.
- **Content of www's that no structure singles out.** These are www's own empty paragraphs. A carrier by structure would add the space where www has none:
  - **check-in-at-the-airport, service-charges (en, nl), economy, special-assistance-legal-guidelines:** 13 to 17 px before one heading after text. Order 47's page-wide form of that rule failed the gate.
  - **families-and-children (en, fr):** 41 px under the H1 and 66 / 62 px before the card grid. The same padded sidebar hub opens travel-classes, baggage, pets, lounges and plan-your-trip, which www draws without that space. Order 44's token-free block option space-m on the card grid adds nothing there (rendered 1,703 / 3,518).
  - **be/fr travel-classes:** 33 px above the opening sidebar view from 768. 207 served documents open with that view, and be/en book-a-flight (+4.09 %) would go further.
  - **be/fr my-bookings:** a hub's closing card grid, 24 px at 1440. www's space to the footer there varies (order 46's census).
  - **connecting-africa:** 32 px before "Related topics" at 1440.
  - **ITA corporate-b2b:** 32 px from 768 between the intro paragraph and the card grid; with it 1440 would be +0.07 % (today −2.08 %). 134 served hub documents share that template and had no marker there. Two capture lines ask whether www keeps that space on two of them.
  - **ITA travel-insurance:** 27 px, the paragraph before the policy link. With it 390 is closer, but 1440 goes further (−0.23 → +0.65 %).
  - **Discover excess-baggage:** 23 px of closing dividers at 390. At 1440 the page is closer without them.
  - **Discover punta-cana de/de:** no carrier, the migration session's decision (order 47).
- **ITA baggage-and-strollers (item 3):** the markers stood for www's empty lines in the table cells. The recording shows them: "No baggage<br><br><br>" and "Light fare and lap seat<br>&nbsp;". See item 3.

## 2. ITA online-check-in, corporate-b2b, travel-insurance

**online-check-in, shipped in 3e250b69.**
- **Order 47's cause was wrong.** The 67 px at 1440 is not the sidebar's card teaser: the aside ends 540 px above the section's end (ours 217 → 710, www's content 218 → 1,252), so it doesn't set the height.
- **The cause** is the grey column view's H2, "Scegli il posto che preferisci in tutte le classi di viaggio": www heading-medium (36 px, 119 px tall), ours heading-small (28 px, 62 px tall).
  - Order 44's token-free rows removed its `{heading-medium}` (2,727 → 2,669 then).
  - Order 44's carrier covered padded views only, and this view is grey.
- **The census behind the scope:** the recorded ITA column-view H2s. The two in grey views (online-check-in it/it, it/en) are both heading-medium on www. Plain views in grey sections are mixed (5 of 9 heading-small), so they are not taken.
- **The carrier:** a grey view's H2 in heading-medium. Gate on 80 page-widths: 3 closer, none further, sum 61.17 → 57.65.
  - it/it 1440 −3.24 → −1.10 %;
  - it/it 390 −2.19 → −1.13 %;
  - it/en 390 −1.40 → −1.08 %;
  - it/en 1440 unchanged.
- **Reach:** the 10 language copies.

**corporate-b2b 1440.** The cause is a lost `{spacer-31 from-768}`.
- ita-parity-014 has www's H1 (178, 52.8 px, 40 below), the paragraph (270.8, 27 px, 24 below), and the cards at 353.8: 56 px between paragraph and cards. Ours has 24.
- **No carrier:** the 134 hub documents of that template had no marker there (see item 1). The capture lines for two hubs are added.

**travel-insurance 390.** Between "General Terms…" and "Previous insurance", www is 304 px and ours 254.
- On www the paragraph ends with an empty line ("…Travel Guard.&nbsp;<br>&nbsp;"), 135 px, and the policy link is a separate link component after it. Ours is an 81 px paragraph and a 27 px link paragraph.
- 27 px of the 50 px is the lost `{spacer-26}`.
- "Previous insurance" is heading-copytext-large on www (22 px tall) and heading-medium on ours (31 px tall).
- **No rule:** with the marker, 1440 goes further (−0.23 → +0.65 %), and the heading is a per-page choice.

## 3. Recordings: ita-parity-014

The index landed at 10:05 UTC (sha256 69697d74…49a5). The archive ita-parity-014 (sha256 9b000a3b…7b13, verified) holds 5 pages and 7 recordings with the so48 probes. The two hub lines added later are not recorded yet.

**baggage-and-strollers.** www's maui-table, measured through its shadow DOM:

| | header row | gap under it | Baggage row | the other rows | under the table |
|---|---|---|---|---|---|
| www 1440 (four tables side by side) | 97.4 | 32 | 199 in all four (equal rows) | 118 | 32 |
| www 390 (stacked) | 97.4 | 32 | 199 / 172 / 172 / 199 | 118 | 32 |
| ours before this order (both widths, rows as rendered) | 144 | (inside the first row) | 134 / 161 / 188 / 161 | 118 | none |

- **The Baggage cells hold www's empty lines** ("No baggage<br><br><br>"), the content the `{spacer-54}` stood for. At 1440 www draws the rows of the four tables at equal height.
- Ours differed three ways: the header row 46.6 px taller, nothing under the table, and the Baggage rows without the empty lines.
- **Carrier (this commit), on the panel made only of tables** that ita.css already draws as www's four-column view (order 18). It sets www's frame:
  - the header row 97 px (24 px above and below its two lines);
  - 32 px under each table;
  - the first body row 199 px from 768, which is www's equal row across the four tables;
  - the first body row 172 px on phones, www's shorter Baggage row there.
- **Gate on all 80 recorded ITA page-widths:** strollers 1440 4,358 → 4,456 (www 4,446; −1.98 → +0.22 %), 390 7,635 → 7,887 (7,882; −3.13 → +0.06 %), the others unchanged, sum −4.82.
- **Reach:** the nine language copies of strollers are the only served documents with such a panel. All nine were rendered at 1440 and 390 with the rule: nothing cut off, out of its column or overflowing.
  - At 1440 the check reports each table "overlapping" the next. They stand side by side there, so this is a false alarm (as order 47's contact columns).
- **The alternative was not used:** putting the empty lines back as line breaks in the cells. It drew 108 of the 216 px at 390 and nothing at 1440, and needs a preview to know whether the pipeline keeps them.
- Order 18's header height of 144 px (test ita-fare-tables-600) is now www's 97 px; the test follows.

## 4. Discover ranks 16 to 35

Ranked with this order's carriers (served, Arial face). The largest step per page-width is the stretch between two matched headings, or the last heading and the footer, where ours gains or loses most against www. The homepages' steps were measured before the carrier went live.

| rank | page | width | % off | ours − www (px) | largest step |
|---|---|---|---|---|---|
| 16 | /de/de/homepage | 390 | +1.33 | +74 | +42 between "Entdecken Sie weitere Themen" and "Greatness is a Group effort" |
| 17 | /de/de/my-bookings/services/additional-services | 390 | -1.31 | -60 | -82 between "Medikamenten Transport mit dem" and "the footer" |
| 18 | /de/en/my-bookings/manage/customer-service | 390 | -1.28 | -81 | +32 between "At Discover Airlines, what lou" and "the footer" |
| 19 | /de/en/book/baggage/excess-baggage | 390 | -1.13 | -28 | -24 between "Excess baggage" and "the footer" |
| 20 | /de/de/my-bookings/check-in/check-in-at-the-airport | 390 | -1.09 | -23 | -28 between "Check-in am Flughafen" and "Wie nutze ich die Gepäckautoma" |
| 21 | /de/de/travel-inspiration/inspiration/destinations/punta-cana | 1440 | -1.05 | -49 | -92 between "Urlaub in Punta Cana" and "Wissenswertes" |
| 22 | /de/de/my-bookings/services/additional-services | 1440 | -1.00 | -41 | -40 between "Medikamenten Transport mit dem" and "the footer" |
| 23 | /de/de/travel-inspiration/inspiration/destinations/santorini | 1440 | +0.99 | +76 | +45 between "Santorini Urlaub" and "Wieso nach Santorini" |
| 24 | /de/en/book/special-requests/families | 390 | +0.95 | +77 | +36 between "Kids’ entertainment on short a" and "This might also be of interest" |
| 25 | /de/en/discover/services-on-board/entertainment | 390 | +0.88 | +48 | +70 between "Experience the excitement of f" and "the footer" |
| 26 | /de/en/discover/travel-classes/business-class | 390 | +0.78 | +25 | +36 between "This might also be of interest" and "the footer" |
| 27 | /de/de/discover/services-on-board/entertainment | 1440 | -0.72 | -26 | +66 between "Entertainment auf der Kurz- &" and "Kopfhörer" |
| 28 | /de/en/travel-inspiration/inspiration/destinations/santorini | 1440 | +0.68 | +52 | -65 between "Bucket list for your vacation" and "Weather & best time to travel" |
| 29 | /de/de/my-bookings/check-in | 390 | +0.60 | +18 | +38 between "Online Check-in mit Code des R" and "the footer" |
| 30 | /de/de/discover/travel-classes/business-class | 1440 | +0.50 | +21 | +44 between "Bester Service und Komfort übe" and "Ihre Vorteile an Bord" |
| 31 | /de/de/travel-inspiration/inspiration/destinations/punta-cana | 390 | +0.47 | +26 | -34 between "Urlaub in Punta Cana" and "Wissenswertes" |
| 32 | /de/de/homepage | 1440 | +0.45 | +19 | -77 between "Wohin soll die Reise gehen?" and "Suchen Sie mehr als nur einen" |
| 33 | /de/en/my-bookings/services/additional-services | 1440 | +0.44 | +16 | +16 between "Express Rail" and "the footer" |
| 34 | /de/de/book/special-requests/families | 390 | +0.41 | +33 | -45 between "Gepäckabholservice von Airport" and "Onboard Entertainment für Kind" |
| 35 | /de/en/my-bookings/services/additional-services | 390 | +0.36 | +16 | -24 between "Additional services" and "Advance seat reservation" |

Causes and rules:
- **The related-cards ending on phones** ("This might also be of interest" / "Das könnte Sie auch interessieren" → footer).
  - It is +23 to +37 px on all six recorded phone page-widths: baggage, families and business-class in two languages. www's space under the last card is that much smaller on phones.
  - The rule tried was the closing card section's space on phones, 56 → 31 px. **It FAILED** (15 of 27 phone page-widths measured):
    - business-class de/de 0.13 → 0.68 %;
    - excess-baggage de/en −1.13 → −2.13 %;
    - sum +0.47.
  - business-class de/de is within 0.13 % today because other stretches of it are short; excess-baggage closes with dividers, not related cards. Not shipped.
- **additional-services de/de** (−82 / −40 to the footer after the medication-transport section): de/en is +16 at the same place, so it is the German copy's content.
- **customer-service de/en 390, check-in-at-the-airport de/de 390, santorini (both languages), entertainment (both languages):** steps of 28 to 70 px inside one text or after one block, each on one page and differing between the language copies. No rule.
- **punta-cana:** the held column view (orders 46 and 47).
- **The homepages:** this order's carrier at 1440. At 390 de/de is +74 (+42 at "Greatness is a Group effort"), the teaser section. No rule fits both copies.
- **The offers page** stays as it is (ranks 1 to 4).

## 5. Reach of every rule shipped in this order

Each rule was rendered with the rule on every served document it reaches, at 1440 and 390. The check covered the matched elements (out of column, overlapping the next element, text cut off, empty box over 200 px) and the page's horizontal overflow.

| rule | documents | matched | faults |
|---|---|---|---|
| ITA grey column view H2 | 10 (online-check-in, ten languages) | 1 each | none |
| ITA strollers tables' frame | 9 (strollers, nine languages) | 6 tables each | none (at 1440 the side-by-side tables read as "overlapping", a false alarm) |
| ITA H2 after a boarding-table section | 1 of the 10 group-boarding documents (it/en; the nine others are built differently and don't match) | 1 | none |
| Brussels title-large accordion H3 | 1 (terms and conditions) | 58 | none |
| Brussels sidebar-h1 closing link | 6 (refund-for-cancelled-flights) | 1 each | none |
| Discover offers section / destination finder section | 6 (de/de, de/en, ca/en, ca/fr, us/de, us/en homepages) | 2 on de, 1 on ca and us | none |

Document counts come from the served copies' markup (all 1,801 / 2,574 / 563 documents), confirmed on the rendered pages.

## Each brand at the end (Arial face, as served after this order's pushes)

| brand | page-widths | before this order (sum / median) | after (sum / median) |
|---|---|---|---|
| Brussels | 208 | 373.42 / 0.95 % | 367.85 / 0.90 % |
| ITA | 80 | 61.17 / 0.52 % | 52.29 / 0.49 % |
| Discover | 54 | 356.22 / 0.83 % (order 47's figure) | 352.47 / 0.70 % |

- **Sources.** Brussels: the gate's loads, before and with this order's two rules. ITA: a served baseline after 3e250b69 (57.65), with group-boarding's and strollers' gated figures. Discover: a served baseline after 3e250b69.
- **Discover's sum** is still mostly its offers page (live fares, the owner's).
- **Brussels' 373.42 against order 47's 374.17:** the same page-widths, loaded on another day. The four form pages' Turnstile box (71 px each) draws in some loads and not in others.

## Checks

Before every push: whole-repo `npm run lint`, its exit code read each time (0, again after every rebase), and stylelint exit 0 on the changed themes.
- **444b743c (capture list):** the 187 folder-reading test files, 876 / 0.
- **3e250b69:** full suite 4,876 / 0. Rebased twice (main busy), lint 0 each time.
- **e71ac9e7:** full suite 4,881 / 0.
- **This commit:** lint, stylelint ita.css and the full suite before its push. The figures are in the final answer to this order.

Not in git: the snapshot copies, renders, gate loads, the recording archive and `.migration/project.json`. No upload, preview or publish. DA was read once, for the two families hubs. No request reached an airline host. /de/en/overview-manage has no row.

