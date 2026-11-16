# Regression check, standing order 36 (ema-lufthansa, 2026-11-16): the code that landed after order 35's measurements

Three commits landed after order 35's captures (16:00 to 16:50 UTC):
- **3ee29556** (17:35 UTC): lufthansa.com campaign pages below 768 px. A lone quote after a section that ends with text keeps the quote's own 60 px.
- **6bb8859d** (17:46 UTC), three changes:
  - the Columns Media option narrow-pictures (lufthansa.com, below 768 px);
  - Brussels from 768 px: two buttons at the end of a Columns Media text cell share one line;
  - the recording-path map (tools/parity only, no page reach).
- **03aeb80d** (18:38 UTC): Austrian below 768 px, the page-closing two-up card list.

## Method

**Reach.** Every recorded page-width of the brands each rule is scoped to:
- lufthansa.com: 408 recorded paths, taken from lh-parity-002a to -002d, -003, -004a, -004b, -007 to -013 and lufthansa-parity-001. lh-parity-004a/b were checked against lh-deliveries.json's sha256; the rest against their sidecars.
- Austrian: 121 paths (austrian-parity-001 to -018).
- Brussels: 104 paths (brussels-parity-001 to -014, without -002).

Each path's served .plain.html was read once from its brand host (~19:15 UTC). The documents that can hold a rule's pattern were then loaded on the brand host at the width the rule's media query covers, with main as deployed, the served CSS and airline hosts refused per request:
- 9 lufthansa.com documents with a campaign-section and a blockquote;
- 1 with narrow-pictures;
- 2 Austrian documents with a two-up Carousel Cards grid;
- 52 Brussels documents with a Columns Media block.

In each load the page height and footer top were read as served. Then the commit's rule was deleted from the served stylesheets in the same load, and both were read again (b621/mk-toggle.py; the rule found by its selector, 1 or 2 rules per page as committed). How many elements the rule's selector matches decides the reach.

- **Loads:** 64 pages, 65 loads with the retry; 105 requests to airline hosts were refused and counted, none sent.
- **Not published:** 7 recorded lufthansa.com paths answer 404 as .plain.html: six old /content/lh/markets/... paths and /fr/fr/.../digital-travel-companion. They are not documents and reach no rule.
- **The four lounge roots** (lh-parity-004's during-your-trip/lounges) answer 301. Their documents (/xx/yy/lounges, tools/parity/recording-paths.json) were read too and hold neither pattern.
- **Off by width:** where the media query is off, the rule cannot change a page-width:
  - 3ee29556, narrow-pictures and 03aeb80d at 768 and 1440;
  - the Brussels button rule below 768 (Brussels has no 768 recording).
- **"further"** means |with| - |without| against www's recorded height, in points.

## Result

- **No recorded page-width is more than 0.5 points further.**
- **Three are closer:**
  - lufthansa.com child-in-businessclass 390 (narrow-pictures);
  - the two Austrian baggage pages at 390 (03aeb80d).
- **One is equal:** Brussels student-fares 1440. The button rule matches its two app buttons, but the band's height is set by its picture.
- **Two are within 0.5 points:** the two recorded campaign pages at 390 (3ee29556), each 33 px shorter, which moves them 0.21 and 0.22 points further from www's height.
  - The rule brings the quote to www's 90 px under the text above it, and the commit's gate measured mismatch % (9.9 -> 9.5 %).
  - In height the pages were already shorter than www's (the poster slider and the other steps in sweep-so35-lh-rest.md, place 42), so 33 px less takes them a little further.
  - That is inside the 0.5 points, so no reverse.
- **Every other candidate is unchanged:** 58 documents, 0 elements matched, the same height with and without.
  - The 7 other lufthansa.com 100-years pages: crane at/de, de/de, de/en, gb/en; cabin-design; chronicle; global-network.
  - The 51 other Brussels Columns Media documents.
- **No fix or reverse is needed.**

| commit | rule | brand | page | width | recording | www px | without the rule | with the rule (as served) | further (points) |
|---|---|---|---|---|---|---|---|---|---|
| 6bb8859d | narrow-pictures | lufthansa.com | /de/en/prepare-for-your-trip/travelling-with-children/child-in-businessclass | 390 | lh-parity-002b (resized) | 5792 | 5931 (+2.40 %) | 5780 (-0.21 %) | -2.19 (closer) |
| 03aeb80d | closing two-up list | Austrian | /at/en/baggage | 390 | austrian-parity-003 (resized) | 6673 | 6602 (-1.06 %) | 6670 (-0.04 %) | -1.02 (closer) |
| 03aeb80d | closing two-up list | Austrian | /at/de/gepaeck | 390 | austrian-parity-003 (resized) | 6754 | 6683 (-1.05 %) | 6751 (-0.04 %) | -1.01 (closer) |
| 6bb8859d | two buttons side by side | Brussels | /be/en/local-page/student-fares | 1440 | brussels-parity-004 | 5153 | 5222 (+1.34 %) | 5222 (+1.34 %) | 0.00 (equal) |
| 3ee29556 | lone quote after text | lufthansa.com | /de/en/100-years/campaigns | 390 | lufthansa-parity-001 (resized) | 15417 | 15367 (-0.32 %) | 15334 (-0.54 %) | +0.22 (within 0.5) |
| 3ee29556 | lone quote after text | lufthansa.com | /de/de/100-years/campaigns | 390 | lufthansa-parity-001 (resized) | 15909 | 15825 (-0.53 %) | 15792 (-0.74 %) | +0.21 (within 0.5) |

Notes:
- **lh-parity-002b** also records /de/en/100-years/campaigns at 390, but it is cut at 8,000 px (truncated), so it gives no height. The page is compared with lufthansa-parity-001 only.
- **austrian-parity-019**, the at/en baggage 390 first load that ema-cashub's gate used (www 6674), is not on our drop. Against it the figures above read -1.08 -> -0.06 %, the same step.
- **The other documents the rules reach are not recorded:**
  - 3ee29556: the at/de, gb/en, xx/es and xx/fr campaigns pages;
  - 03aeb80d: /at/de/familien and the eleven extra-services pages.
  - The commits' own no-breakage renders cover them (gate-so53-austrian-closing-two-up.txt; 3ee29556's message). I did not render them again.

## Also landed after my measurements: d85fa7d4 and 2a02f6f6

Two more commits with page code reached main after order 35's captures:
- **d85fa7d4** (18:53 UTC): a Brussels page that closes with a flush grey band of four-up Carousel Cards runs the grey into the footer, 87 px under the cards. All widths.
- **2a02f6f6** (19:24 UTC), two lufthansa.com rules:
  - an untitled core-form sub-section with one checkbox group keeps www's 29 px title slot (all widths);
  - below 768 px, Table Striped's beside rows get 68 px under each cell.

The order did not name them, so they were checked the same way (~19:50 to 20:11 UTC, 101 loads with one retry):
- d85fa7d4: the 36 recorded Brussels documents with four-up Carousel Cards, at 1440 and 390;
- 2a02f6f6's form rule: the 13 recorded lufthansa.com documents with a Form, at 1440 and 390;
- 2a02f6f6's table rule: the 2 recorded documents with Table Striped beside, at 390.

**Result: no recorded page-width with a usable height is more than 0.5 points further.**
- Closer: economy 390 and business 390 (d85fa7d4), add-sports-baggage 1440 and 390 (2a02f6f6).
- Within 0.5 points: premium-economy 390 (+0.31), economy 1440 (+0.03), business 1440 (+0.02).
- **Not decided by height:** /de/en/100-years/fleet at 390. The table rule makes the page 1,188 px taller (34,905 -> 36,093), but its only recording (lh-parity-002c) is cut at 8,000 px, so there is no www height to compare with. The commit's own gate compared the recorded part (mismatch 7.9 -> 6.4 %).
- The other 34 Brussels and 12 lufthansa.com documents: no match, the same height with and without. Among them are passenger-receipt-90, feedback-past-flight and /de/en/boarding. The form rule matches no element on passenger-receipt-90 or feedback-past-flight as served.

| commit | brand | page | width | recording | www px | without the rule | with the rule (as served) | further (points) |
|---|---|---|---|---|---|---|---|---|
| 2a02f6f6 | lufthansa.com | /de/en/add-sports-baggage | 1440 | lh-parity-002a | 4337 | 4177 (-3.69 %) | 4467 (+3.00 %) | -0.69 (closer) |
| 2a02f6f6 | lufthansa.com | /de/en/add-sports-baggage | 390 | lh-parity-002a (resized) | 5317 | 5163 (-2.90 %) | 5453 (+2.56 %) | -0.34 (closer) |
| d85fa7d4 | Brussels | /be/en/travel-classes/economy | 390 | brussels-parity-003 (resized) | 5073 | 4966 (-2.11 %) | 4985 (-1.73 %) | -0.37 (closer) |
| d85fa7d4 | Brussels | /be/fr/travel-classes/business | 390 | brussels-parity-003 (resized) | 8976 | 8796 (-2.01 %) | 8815 (-1.79 %) | -0.21 (closer) |
| d85fa7d4 | Brussels | /be/fr/travel-classes/premium-economy | 1440 | brussels-parity-003 | 4620 | 4664 (+0.95 %) | 4663 (+0.93 %) | -0.02 (closer) |
| d85fa7d4 | Brussels | /be/fr/travel-classes/premium-economy | 390 | brussels-parity-003 (resized) | 6224 | 6257 (+0.53 %) | 6276 (+0.84 %) | +0.31 (within 0.5) |
| d85fa7d4 | Brussels | /be/en/travel-classes/economy | 1440 | brussels-parity-003 | 3186 | 3127 (-1.85 %) | 3126 (-1.88 %) | +0.03 (within 0.5) |
| d85fa7d4 | Brussels | /be/fr/travel-classes/business | 1440 | brussels-parity-003 | 6458 | 6449 (-0.14 %) | 6448 (-0.15 %) | +0.02 (within 0.5) |
| 2a02f6f6 | lufthansa.com | /de/en/100-years/fleet | 390 | lh-parity-002c (cut at 8,000 px) | - | 34905 | 36093 | not comparable by height |

## Standing order 37: the brand sites, after order 36's measurements

What landed on main after order 36's measurements (to ~21:05 UTC): 955b7f7d (lufthansa.com author pages' cards from 1025 px), 75a33aa4 (a report) and 89a05e83 (lufthansa.com document state). With 2a02f6f6 and d85fa7d4, these are all the changes since order 35's captures.

- **2a02f6f6 (the untitled checkbox sub-section, Table Striped beside rows) and 955b7f7d reach no brand-site page-width.** Each of their rules starts with body.brand-lufthansa. Every brand site serves its own brand class: one load per site at 1440, ~21:05 UTC, gave brand-swiss, brand-brussels, brand-discover, brand-b2b, brand-ita and brand-tap, and none of the six homepages has a core form or a Table Striped block. So those rules cannot match there; order 36's lufthansa.com figures above stand.
- **d85fa7d4 (Brussels closing flush grey four-up band): its six matched page-widths were loaded again at ~21:07 UTC, with the same result as above.** Closer: economy 390 (-0.37 points) and business 390 (-0.21). Within 0.5 points: premium-economy 390 (+0.31), economy 1440 (+0.03), business 1440 (+0.02), premium-economy 1440 (+0.02). The other 30 Brussels four-up documents matched nothing in order 36.
  - In that run premium-economy 1440 drew 4,148 px with and without the rule. capture.js gives 4,663 again (the served markup's md5 is unchanged), so the run was a bad load. The rule's own effect is -1 px in both.
- **No recorded brand page-width is more than 0.5 points further. No fix or reverse.**
