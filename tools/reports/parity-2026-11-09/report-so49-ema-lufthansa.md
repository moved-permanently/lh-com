# ema-lufthansa: standing order 49 (2026-11-19, narrower second tries and the closing list)

About 11:40 to 14:00 UTC. Figures are in full Chrome, measured once every section and block reports loaded, with Liberation Sans standing in for Arial, and with airline hosts refused per request.
- **The gate for every rule:** all recorded page-widths of the brand, the rule toggled in the same load. None may end more than 0.5 points further from www, and the sum of % off www must go down.
- **A pattern whose rule fails** gets one narrower second try, then it is held with its figures.
- **Token-free:** every carrier is a theme rule scoped by structure, and nothing writes a style token into a document.
- Nothing was uploaded, previewed or published by me, and DA was not read this order.

## Pushed

| commit | what |
|---|---|
| 7996b5a4 | items 1 to 3: brussels.css (travel-classes' opening space), ita.css (the one-grid hub's space above its cards), discover.css (business-class' phone ending), test token-free-so49 |
| this commit | item 4: closing-so49-ema-lufthansa.txt; this report |

## 1. ITA hubs (ita-parity-015)

**The recordings.**
- The index gained ita-parity-015 between 11:42 and 12:11 UTC. The index's sha256 is now a0aa7d54…c7f9 (it was 69697d74…49a5 with ita-parity-014 alone).
- The archive's sha256 is 81f2bb2a…abc0, and it verifies. It has 2 pages and 2 recordings, at 1440.

**What www does:**

| hub | www: intro paragraph → cards | ours | page (ours / www) |
|---|---|---|---|
| /it/en/book-and-prepare/travel-information/baggage | 56 px (paragraph 270.8 + 27, cards 353.8) | 24 | 2,055 / 2,061 (−0.29 %) |
| /it/en/manage-my-bookings | 24 px (www's cards are its login cards, in a grey band) | 24 | 1,508 / 1,477 (+2.10 %) |
| /it/en/corporate-b2b (ita-parity-014) | 56 px | 24 | 1,461 / 1,492 (−2.08 %) |

**www keeps the 32 px on the baggage hub too.** So the space is the hub layout's, not corporate-b2b's content.

**First try: every hub**, meaning a title section, then a section of the intro paragraph over the card grid, not grey: 144 served documents have that layout. **FAILED:**
- corporate-b2b goes −2.08 → +0.07 %;
- but baggage goes −0.29 → +1.26 % (2,055 → 2,087), 0.97 points further. The rest of the baggage page is already 26 px taller than www's below its cards, so adding www's space there takes the whole page further.

**Second, narrower try: the hubs with one card grid** (corporate-b2b, territorial-continuity, world-of-ita-airways; 20 documents reached). The baggage hub, with two grids like 96 others, is not taken. **PASS** on all 82 recorded ITA page-widths, the two new recordings included:
- corporate-b2b 1440 −2.08 → +0.07 %;
- the others unchanged;
- sum −2.01.

**Held:** the two- and three-grid hubs (97 documents). On the one recorded (baggage), the space is www's, but the page as a whole would end 0.97 points further.

## 2. Brussels be/fr travel-classes

- **What sets it apart:** a one-section page that is only a sidebar view, its text a title and one paragraph, over one four-up card grid. Of the 207 documents that open with a sidebar view, 24 have that shape: travel-classes, groups-and-charter, our-fleet, and the bf lounges, lufthansa-group and airport-info hubs.
- **Narrower try:** 33 px above the view from 768. **PASS** on all 208 recorded Brussels page-widths:
  - travel-classes 1440 1,303 → 1,336 (www 1,336; −2.47 → 0.00 %);
  - none further;
  - sum −2.47.
- **Reach:** 24 documents, no fault.
- **For the migration session to know:** only travel-classes among the 24 is recorded. In the 16 / 17 Nov snapshots, 13 of the other 23 were imported without a spacer there. That is no proof www lacks the space: ITA's baggage hub has www's 56 px with no spacer in its old copy. But a recording of one of them (e.g. be/en our-fleet at 1440) would settle it.

## 3. Discover

**The offers page** stays as it is, as **live data**. www's offers page lists live fares: its destination grid loads them from www's fare API, 8,261 / 14,807 px at 1440 / 390 for de/de. Ours renders the finder without fare data. Its four page-widths carry 308 of Discover's 352 points.

**Patterns of three or more page-widths, worst first.**
- **The related-cards ending on phones** ("This might also be of interest" → footer, +23 to +37 px on six recorded phone page-widths):
  - The first try (order 48: every closing card section on phones, 56 → 31 px) failed.
  - **Second, narrower try:** a closing section of only a heading over a card row, 36 px to the footer. **PASS** on the 27 recorded phone page-widths (the rule applies only on phones):
    - business-class de/en 390 +0.78 → +0.16 %;
    - business-class de/de +0.13 → −0.52 % (0.39 further, within the gate);
    - sum −0.24.
  - **Reach:** 2 documents.
  - **Held:** baggage and families (4 page-widths). Their related cards sit in the page's one section with everything else, so no narrower structure singles their ending out.
- **The check-in pages** (de/de and de/en, +2.61 / +2.57 % at 1440): 78 px too long at 1440 after the three-column view. In ours, the column-end mark and the Spacer block between "You might also be interested in this" and the cards add about 45 px each. In an archive render of www, there is 30 px from the columns to the H4 and 44 px from the H4 to the cards.
  - The Spacer block sits on these two documents only (both at 1440), so this is a pattern under 3 page-widths. No rule.
- **No other pattern** covers three or more page-widths. Discover's work ends here.

## 4. The closing list

closing-so49-ema-lufthansa.txt lists every recorded page-width still more than 3 % off www after this order, with its cause class:

| brand | page-widths over 3 % | content | live data | function | Lufthansa side | font | pattern under 3 page-widths |
|---|---|---|---|---|---|---|---|
| Brussels | 25 | 8 | 4 | 7 | 1 | 0 | 5 |
| ITA | 1 | 0 | 0 | 0 | 0 | 0 | 1 |
| Discover | 6 | 0 | 4 | 1 | 0 | 0 | 1 |

**Brussels:**
- **function (7):** the payment-method picker and the country picker (the flag, off), the birthright form's Turnstile box, and the check-in times component we link.
- **live data (4):** the offers fares, and the ke/en fare teaser.
- **content (8):** www's empty paragraphs on the families hubs, special-assistance, service-charges and economy (spacing-lost-so48).
- **Lufthansa side (1):** our-company's card text, which www cuts after three lines; ours shows it in full, the owner's decision.
- **patterns under 3 page-widths (5):** the check-in hub's query-string address, meals' closing grid, the sidebar-h1 accordion ending, the closing teaser row, and my-bookings' closing three-up teaser.

**ITA:** network 390, whose lead H2 is heading-small on www on that page only.

**Discover:**
- the offers page (live data);
- the price calendar's empty state (function);
- the German entertainment page on phones (pattern under 3 page-widths).

**No font class is left:** the Arial-compatible face is used for every figure.

## 5. Reach of every rule shipped in this order

Each rule was rendered on every served document it reaches, at 1440 and 390, with the rule. The check covered the matched elements (out of column, overlapping the next element, text cut off, empty box over 200 px) and the page's horizontal overflow.

| rule | documents | faults |
|---|---|---|
| Brussels sidebar view over one four-up grid | 24 | none |
| ITA one-grid hub | 20 of the 47 one-grid hubs (the grey manage-my-bookings hubs and the others with another section shape don't match) | none |
| Discover closing heading-and-cards section | 2 (business-class de/de, de/en; excess-baggage's markup matches but its rendered section doesn't) | none |

## Each brand at the end (Arial face, as served with this order's rules)

| brand | page-widths | after order 48 (sum / median) | after this order (sum / median) |
|---|---|---|---|
| Brussels | 208 | 367.85 / 0.90 % | 365.38 / 0.89 % |
| ITA | 82 (80 + ita-parity-015's two) | 52.29 / 0.49 % (80) | 52.67 / 0.46 % |
| Discover | 54 | 352.47 / 0.70 % | 352.24 / 0.64 % |

ITA's sum takes in the two new hub page-widths: baggage 0.29 and manage-my-bookings 2.10. Over the same 80 page-widths it is 50.28.

## Checks

Before every push: whole-repo `npm run lint`, its exit code read each time (0, again after the rebase), and stylelint exit 0 on the changed themes.
- **7996b5a4:** full suite 4,892 / 0; rebased onto 019775ed, lint 0 again.
- **This commit:** lint and the full suite before its push. The figures are in the final answer to this order.

Not in git: the recordings (ita-parity-015, unpacked in scratch), the renders, the gate loads and `.migration/project.json`. No upload, preview or publish, no DA request, no request to an airline host. /de/en/overview-manage has no row.
