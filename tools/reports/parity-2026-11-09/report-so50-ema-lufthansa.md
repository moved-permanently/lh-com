# ema-lufthansa: standing order 50 (2026-11-19, full-site no-breakage sweep of Brussels, ITA and Discover)

About 14:00 to 20:00 UTC.

**How the sweep was run.**
- **Documents:** every served document of the three sites, from the DA upload lists. That is every language and market root.
- **Nav and footer documents** are rendered inside every page rather than as pages of their own: Brussels 196, ITA 132, Discover 6.
- **Hosts and widths:** brussels / ita / discover.turnsthe.page at 1440 × 900 and 390 × 844.
- **Pace:** one page at a time, one browser per host.
- **Each load:** full Chrome with Liberation Sans for Arial, airline hosts refused. Waited to network idle, scrolled to the end for the lazy pictures, waited again, every section loaded, then measured.

**What happened to each flag.**
- **Box overlaps** got a second look on every flagged page-width: an overlap counts only where what is drawn crosses (text lines, pictures, controls, backgrounds, borders).
- **Single-time faults** were rendered again.
- **Heights off the source-language copy** were set against the two documents themselves (text, pictures, blocks).

The full list is in sweep-so50-ema-lufthansa.txt. Nothing was uploaded, previewed or published by me. DA was not read this order.

## Pushed

| commit | what | documents reached |
|---|---|---|
| 6e594e90 | sweep-so50, Discover's part | — |
| e09b571f | brussels.css: a link-list column view's first H4 (the fare name) keeps its icon item headings' 18 px on phones; sweep-so50, Brussels' part; test sweep-so50 | 6 (carry-on baggage: be/en, be/fr, be/nl, de/de, es/es, it/it) |
| this commit | ita.css: a tab block's closing separator stays under the tabs (no 16 px take-back); sweep-so50, ITA's part; this report | 31 (baggage-assistance, mice and required-documents copies) |

## The sweep, per brand

| | Discover | Brussels | ITA |
|---|---|---|---|
| documents rendered | 557 | 1,605 | 2,442 |
| page-widths | 1,114 | 3,210 | 4,884 |
| broken picture | 1 (transient) | 0 | 1 (transient) |
| sideways scroll / out of the column | 0 | 1 (transient) | 0 |
| section or block never loads, load error | 0 | 0 | 1 load timeout (transient) |
| drawn over another element | 0 | 69 documents: all by design (nothing drawn crosses) | 120 documents: 31 fixed (this commit), 3 listed, the rest by design |
| empty section | 3 documents (the culinary-journey app: function, listed) | 11 (a section holding only a Spacer block: by design) | 20 (19 by design; 1 content: do/es entry-regulations-schengen's own empty grey section) |
| empty column | 0 | 0 | 0 |
| heading in another size than its siblings | 0 | 6 documents: fixed (e09b571f) | 0 |
| list in another size than its paragraphs | 0 | 0 | 0 |
| height more than 15 % off its source-language copy | 91 documents: content | 87 documents: 85 content, 2 listed | 216 documents: content, except 1 transient |

**The two rules.**
- **Brussels, carry-on baggage (6 documents).**
  - **The fault:** on phones, the fare name (the column's first H4, without an icon) drew 16 px against its item headings' 18 px. The item headings are the link-list icon headings, www's heading-copytext-large, which stay 18 px. From 768 both were already 18 px.
  - **The fix:** the fare name keeps 18 px on phones.
  - **Checks:** rendered on all six with the rule at 1440 and 390, with no fault. None of the 104 recorded Brussels phone page-widths moves.
- **ITA, tab blocks (31 documents).**
  - **The fault:** a section ending in a tab block and its closing separator (the divider-below section style) pulled the separator 16 px up. That is styles.css's take-back for a wrapper of separators only after a block. The tab block has no space of its own under it, so the divider's line ran:
    - through the open tab's last text line at 1440 (the line at 2,915 px, the text to 2,922 on be/fr baggage-assistance);
    - and through the last closed tab's label on phones.
  - **The fix:** after a tab block, no take-back.
  - **Checks:** on all 82 recorded ITA page-widths none moves (none of them has a tab block with a closing separator), none further; reach 29 of the 31 documents rendered with the rule at 1440 and 28 at 390 before the order's end (one phone load timed out, the last two documents were not reached): the separator sits under the tabs (tabs' bottom = separator top), no fault.

**Listed (1 or 2 documents, or not a layout fault):**
- **Transient, rendered again with no fault:**
  - Discover calgary's picture (once at 1440);
  - Brussels be/fr check-in-options-for-africa, a picture drawn 1,440 px wide once at 390;
  - ITA entry-regulations-uk's picture;
  - ITA fr/fr data-protection-overview's 45 s timeout;
  - ITA nl/nl passenger-receipt, measured once before its section was built.
- **Function:** Discover culinaryjourney (de/de, de/en, xx/fr): its micro-frontend draws nothing on our host.
- **Brussels bf/fr charter:** the request form draws 480 px shorter than be/en's, with the same text.
- **Brussels ch/it travel-companion:** the grey column view is 1,307 px on phones against be/en's 440. Not located further.
- **ITA pre-check-in (at/de) and sea-destinations (it/it):** a closing divider drawn 6 px into a padded column view's grey box.
- **ITA bid-upgrade (it/en):** a closing separator drawn 8 / 20 px into the FAQ accordion's last item.

**Content:**
- **Height differences:** the language copies are different documents. Their own text differs by 10 % or more, or they have other pictures or other blocks (e.g. ca/us seat-reservation, xx/fr business-class, data-protection notices).
- **Discover xx/fr:** the footer document has an extra row of sections, 982 px against de/de's 669.
- **ITA:** the Portuguese, German, Spanish and Greek translations run 7 to 8 % longer and wrap to more lines on phones.
- **ITA do/es entry-regulations-schengen:** the document holds an empty grey column-band section of its own.

## Brussels be/en our-fleet (brussels-parity-016)

- **The recording:** the archive is at the R2 root with its sha256 file. The sha256 matches: 2172cd94…a13f.
- **What www does:** its sidebar view opens at 186 px and the H1 is at 226. Ours puts the H1 at 255 with order 49's travel-classes rule and at 222 without it. So **www does not keep the travel-classes space above the view on our-fleet.**
  - Instead, www's intro sits between two empty paragraphs (24 px each, with 20 px margins).
  - That puts its cards at 516.8, against ours at 490 with the rule.
- **No narrower rule is possible:** nothing in the structure sets travel-classes apart from our-fleet. Both are one section of a sidebar view (a title and one paragraph) over a four-up card grid.
- **The rule stays.** With our-fleet added as a recorded page-width, the rule takes the page as a whole closer: 1,266 → 1,299 against www's 1,289, so −1.78 → +0.78 %. That passes the gate with travel-classes unchanged (1,336, www's height). The space lands above the view, where www has it below.

## Checks

Before every push: whole-repo `npm run lint`, its exit code read each time (0, again after every rebase), and stylelint exit 0 on the changed themes.
- **6e594e90 (Discover's part):** the 189 folder-reading test files, 892 / 0.
- **e09b571f:** full suite 4,927 / 0.
- **This commit:** lint, stylelint ita.css and the full suite before its push. The figures are in the final answer to this order.

Not in git: the sweep loads (sw-*.jsonl, 9,208 page-widths), the second looks, the recording brussels-parity-016 and `.migration/project.json`. No upload, preview or publish, no DA request, no request to an airline host. /de/en/overview-manage has no row.
