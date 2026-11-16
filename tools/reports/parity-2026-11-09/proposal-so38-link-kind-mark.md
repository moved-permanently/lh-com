# Standalone links on phones: a link-kind mark from the importer, proposal (standing order 38, item 3, 2026-11-16)

Proposal only. No importer change and no stylesheet rule were pushed.

## The question

On phones our standalone links (p.link-wrapper, www's maui-navigation-link) draw 27px lines: 27px on one line, 54 on
two. ema-test measured www's at 48px on two lines and 30 on one line. Order 36 tried one shared rule (24px lines,
arrow by the first line) on the 63 rest pages at 390: 7 better, 9 worse, net +4.4 points. That rule reaches 7,134
documents. The question was whether an importer mark for the kind of www link would let each kind get its own
spacing.

## What www's links are (bd-snapshots, main content of 3,397 lufthansa.com pages)

| maui-navigation-link size / variant / place | links | pages |
| --- | --- | --- |
| large / hyper / standalone (div.link) | 8,518 | 2,025 |
| large / custom / standalone | 2,764 | 253 |
| large / external / standalone | 1,976 | 593 |
| large / anchor-down / standalone (jump links) | 1,613 | 385 |
| large / hyper / in a link list | 553 | 26 |
| large / custom / in a link list | 442 | 225 |
| large / hyper / in a teaser | 217 | 217 |
| medium / hyper / standalone | 215 | 215 |
| large / lh-arrow-top-right / standalone | 213 | 58 |
| large / back / standalone | 164 | 164 |
| others (dialog, anchor-top, lh-arrow-down, ...) | under 100 each | |

(the header's medium/custom links, 13,040 on 3,260 pages, left out)

So a mark could carry size and variant. Every recorded page's standalone links, though, are large hyper, external or
anchor-down. These are the same kinds on the pages that got better and on the pages that got worse below.

## Gates on all 378 recorded pages at 390 (lh-parity-002 / -003 / -004, our host, injected rules)

Three ways, each on the same 378 recorded page-widths, A (as served now) against B (the rule injected):

| Rule (below 768px, p.link-wrapper in default content) | closer (-0.5 or more) | within 0.5 | worse (+0.5 or more) | net |
| --- | --- | --- | --- | --- |
| order 36: 24px lines, arrow by the first line (on the 63 rest pages only) | 7 of 63 | 47 | 9 | +4.4 |
| 24px lines, 30px minimum, arrow by the first line | 31 | 327 | 20 | -11.6 |
| **24px lines, 27px minimum (one-line links as today, two-line 48px as www)** | **29** | **334** | **15** | **-20.8** |

The last rule leaves one-line links as they are (27px, which matches www on pages such as planning-with-kids:
"Babies on board" to "Children on board" 50px on both) and gives two-line links www's 48px. It is the best of the
three.

Its 15 worse page-widths, and the kinds of www link on them:
- 4 confirmation pages (passenger-receipt-90days, register-animal, register-animal-cargo-hold,
  register-sporting-firearm): +0.7 to +0.9. Their only standalone link is www's variant **back**
  (maui-navigation-link variant="back"), which the 27px minimum should not touch;
- 11 pages whose links are large hyper, external or anchor-down, the same kinds as on the 29 that got closer:
  - planning-with-kids +3.2, boeing787 +2.5, meetings-and-events-delegates +1.8, all-check-in +1.8,
    book-and-manage/flights/helvetic +1.6;
  - agb-extra-services-at-online-check-in +1.5, flight-disruptions +1.2, munich-fair +1.0, data-collection-usa
    +1.0, pre-check-in +0.8, lufthansa-terminal-muenchen +0.7.
  - On boeing787 the two-line PDF links come out right, and the page is worse because its seat-map views are 35px
    short already (hand-over item 14): the links' own excess had been hiding that. The others are the same pattern:
    the drift after the change is the other causes' drift.


## What that means for a mark

- **A mark helps for one kind only.** If the importer marked the link variant, the 4 back-link pages would keep
  today's link, and the gate would read 29 closer, 338 within and 11 worse (net about -24). The proposal:
  - convertMauiLinks in tools/importer/transformers/lufthansa-cleanup.js already sees each maui-navigation-link's
    size and variant when it turns it into an `<a>`;
  - it would write them as a token on the link's paragraph: `{link-back}`, `{link-custom}`, `{link-medium}`, and
    nothing for the large hyper, external and anchor-down links that make up 1,507 of the 1,622 links on the
    recorded pages;
  - the stylesheet rule above would then skip `p.link-wrapper:is(.link-back, .link-custom, .link-medium)`.
  - The tokens reach published documents only on re-import, or through rows: delta lists per template, as order
    30's legal rows were.
- **The other 11 worse pages are not a kind.** Their links are the same kinds as on the pages that got closer, and
  no size or variant mark separates them. They get worse because another cause had been compensating:
  - the seat-map and section gaps of hand-over items 12 and 14;
  - page ends after a link and a spacer;
  - for this they need what order 34 called the interim gate: the rule waits until those rows and rules are live,
    then is gated again.
- **The no-breakage renders.** The rule reaches the 7,134 documents with a standalone link. With the rule scoped to
  phones (it changes nothing at 1440), a with/without render of each at 390 is about 14,300 captures: two to three
  nights at this machine's rate, or a sample if the migration session accepts one.
- **Nothing was pushed:** no importer change and no stylesheet rule. The figures above are the gate the proposal
  would have to pass again on the day it is shipped.

