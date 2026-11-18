# ema-lufthansa: standing order 44 (2026-11-17/18, token-free content)

About 22:30 to 00:00 UTC. Figures are in full Chrome, as served (or with the draft rule added in the same load), with airline hosts refused per request. Nothing was uploaded, previewed or published, and DA was read, never written.

## 1. The three withdrawn page-end rows as a Brussels rule: HOLD (no rule passes the gate)

The three documents' gap to the footer, against their newest recordings:

| page | width | ours | www |
|---|---|---|---|
| be/en check-in-options-and-info | 390 | 2,986 | 3,132 |
| be/en check-in-options-and-info | 1440 | 1,570 | 1,597 |
| be/fr check-in-options-and-info | 390 | 3,045 | 3,129 |
| be/fr check-in-options-and-info | 1440 | 1,684 | 1,708 |
| be/en legal-notices/us-traveling-with-disabilities | 390 | 1,823 | 1,874 |
| be/en legal-notices/us-traveling-with-disabilities | 1440 | 1,280 | 1,317 |

Two Brussels rules, one per ending, each gated with a toggle on all 208 recorded Brussels page-widths (104 pages at 390 and 1440, the rule added and removed in the same load, settled loads):

- **A, the hub ending.** One section with a sidebar intro ending with two card grids in a row. The rule raises the theme's card-end padding (brief 510) from 130 to 193 px on phones and from 64 to 89 from 768.
  - The first draft lost to the brief-510 rule's specificity and changed nothing. With higher specificity (A3) it applies.
  - The hubs come closer: be/en 390 −4.66 → −2.65 %, 1440 −1.69 → −0.13 %; be/fr 390 −2.68 → −0.67 %, 1440 −1.41 → +0.06 %.
  - But 16 page-widths with the same ending move further by more than 0.5 points: be/en book-a-flight (1440 +4.09 → +5.85 %), be/fr book-a-flight, be/en my-bookings (390 +3.74 → +5.47 %), the meals pages at 1440 (be/en +1.42 → +3.04 %), be/en and be/fr families-and-children, be/fr extra-services/baggage 390, es/es plan-your-trip.
  - www's gap under a closing pair of card grids differs page by page, as brief 510 found (82 to 248 px at 390).
- **B, the sidebar-h1 accordion ending.** A sidebar-h1 section ending with its accordion, as the last section with content, gets 51 px of bottom padding on phones and 37 from 768.
  - us-traveling-with-disabilities comes to www's height at both widths (390 −2.72 → 0.00 %, 1440 −2.81 → 0.00 %), and short-notice-eu-us, aviation-services-law and special-assistance-legal-guidelines come closer.
  - But 10 page-widths on legal pages that end the same way and already match www move further: liability (390 −0.27 → +2.49 %), travel-id, terms-of-use 390, us-customer-service-plan, and the two voucher pages (+1.4 to +1.7 %).
  - Order 22 found the same; no scope separates the pages.
- **Load noise.** dsar-start and rebooking-request-birthright moved +71 px in every trial load of both drafts: the form's Cloudflare Turnstile box arriving late, not either rule.
- **The 98-locale footer render.** Not run for these drafts: neither passes the recorded-page gate, and neither touches the footer.

## 2. Token-free importers and collapse rows

### Importer and keep-rule changes (5c8ec77d)

- **Brussels (6926f76b and the brief after 530).** `brussels-import.mjs` no longer writes www's empty paragraphs (`<p></p>`, `<p><br></p>`) or visible empty lines (`<p>&nbsp;</p>`) as `{spacer-N}`. They are a near value of 17 to 40 px, so the import writes nothing. `THEMES.brussels textSpacers` went with c031f617 (ema-adobe's order 55), which also removed Discover's `componentSpacers`.
- **ITA (a63e8fe2).** `ita-import.mjs` no longer marks column-view H2s `{heading-medium}`, and `THEMES.ita keepSizesIn` is gone.
  - The carrier is ita.css: a padded column view's H2 draws in heading-medium (www's 36 px; contact's country headings, entry-exit-system). Other column views keep the theme's heading-small, which the H2 marker there only repeated.
  - Gate on all 80 recorded ITA page-widths: 78 unchanged; residents-in-sicily 1440 −0.23 → 0.00 % (closer), 390 +2.12 → +2.31 % (within 0.5 points).
- **Discover (4d295672).** `THEMES.discover keepSizes` is gone.
  - heading-copytext-large is the H3 and H4 default, so their marker only repeated it.
  - For an H2 the collapse writes its carrier (title-compact on a block, h2-compact on a section) or nothing.
- **Tests.** test/token-free-importers-so44 (new): no writer, no keep rule, the collapse leaves none of these markers on the three brands, and no collapse row writes a token. so5, so6, so10 and 536 are restated; so5's three READY spacer rows are WITHDRAWN.
- **Bundles (for ema-adobe).** The 14 import bundles could not be rebuilt here: `@adobe/aem-import-helper` is not in the offline npm cache. c031f617 rebuilt them, but they still carry ITA's `keepSizesIn` and Discover's `keepSizes`. The brand importers run from source and are not affected; the template bundles need a rebuild from 5c8ec77d's `style-markers.js`.

### Collapse rows for the live documents (READY lists)

How the rows were built:

- **Census.** Every served plain copy was counted for these changes' markers: Brussels 1,450 documents, ITA 13,649, Discover 1,765.
- **DA reads.** Each marked document was then read from DA. Only DA's own documents get rows: lh-brussels 16, lh-discover 5 (the de/de and de/en masters; the other markets answered 404 in DA), lh-ita 11 (it/en and it/it; the 267 marked market-copy paths answered 404 in lh-ita, so another source serves them and no row is written for them).
- **Row shape.** Each row is A + marker + B → A + B, with A and B DA's own text on either side, stopping short of any other marker. Each document's rows were applied and reverted byte for byte with the tool's own functions.
- **Render.** Every row has a no-breakage render at 390 and 1440 (served copy against the copy with the rows).

The lists:

- **delta-so44-brussels-token-free.txt: 16 READY, 85 markers removed.**
  - The spacer paragraphs of 11 to 45 px between running text go.
  - Pages get shorter: for example privacy-notice-applicants 3,327 → 3,165 at 1440, and terms-and-conditions-conditions-of-carriage loses 684 px over its 57 markers.
- **delta-so44-ita-token-free.txt: 11 READY, 66 rows; 1 held.**
  - Apply only once 5c8ec77d's ita.css rule is live. The renders ran with the served CSS before it, where contact and entry-exit-system lose their padded H2s' heading-medium; with the rule live, those H2s keep it.
  - Held: ita-airways-app's five H3s in heading-small. No block option or section style gives an H3 heading-small.
- **delta-so44-discover-token-free.txt: 5 READY, 17 rows; 4 held.**
  - The H3 and H4 markers go; pages move by 11 to 41 px.
  - Held: santorini (de/de and de/en, 4 H2s each) and check-in (1 H2). Their marked H2s stand among unmarked ones in the same section, so a section-wide h2-compact would also restyle headings that should not change.

### Still keeping markers (not in the order's three changes)

- Discover's `columnViews.oneElementViews` still keeps column marks in the collapse.
- Group for Business keeps `heading-copytext-large` (ema-cashub's, order 9).

Both are listed for whoever owns them; I did not change them.

## 3. Brussels rows from sweep-so43-brussels.md by a Brussels rule

No new rule. Item 1's gates show that the page endings behind most of the sweep's remaining rows cannot be separated by a rule: book-a-flight, the meals pages, my-bookings and the legal pages all moved further with the shared-ending drafts. No row adds a document token.
