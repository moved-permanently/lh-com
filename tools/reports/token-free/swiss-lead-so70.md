# Standing order 70: the SWISS lead, the rules around it, the title and the footer (2026-11-18)

Code: 50e7c40d (THEMES.swiss rules `lead-after-h1`, scripts/token-free.js, styles/themes/swiss.css,
test/swiss-lead-so70.test.mjs). Every rule is token-free: a theme rule or theme CSS, nothing in a document.

**Method.**
- **Pages:** the 172 recorded SWISS page-widths (86 pages at 1440 and 390; swiss-parity-001, -002a, -002b).
- **Per rule:** an in-page toggle on swiss.turnsthe.page. Each rule was added as a style tag (the lead's class by a script
  doing what lead-after-h1 does) on top of the ones before, in one load, and the height read after each step.
- **The code:** a CODE override of this checkout's blocks, scripts and styles (so70/togc.mjs), then live after the push.
- **The gate:** |after %| - |before %| <= 0.5 against today's served page.
- **Left out of the sums:** the homepages, /ch/en/offers and culinaryjourney, whose loads were still filling. Their
  heights were read again alone: no rule moves them.
- **Requests:** airline hosts, www.* and lh-proxy were refused per request and counted. None was sent.

## Item 1: the lead (shipped)

- **The rule:**
  - Which paragraph: the H1's paragraph, when nothing but metadata follows it in its section, gets copytext-large.
  - How it is drawn: as www's p.copytext-large, SwissText light 18 / 30 px with 0.2 px letter spacing, 20 px below
    it. www sets it so on 22 recorded pages.
  - A title's paragraph that more text, a heading or a block follows is running text. These are the text pages.
- **Reach:** 972 of the 4,661 served SWISS documents (183 pages across the markets).

**The four page-widths it took further, and what closes them (SWISS rules, same commit):**

| Page-width | Cause, read from the recording | Rule |
| --- | --- | --- |
| ch/de duty-free-shop 390 | The page is one padded section. www keeps the section's padding between the breadcrumb and the picture (www's picture 20 px lower at 390, 41 px at 1440). It leaves no section gap under the last text: 40 / 60 px from the lead to the footer, ours 88 / 108. | On a one-section padded page, the padding goes under the breadcrumb and no margin goes under the last text. Reach: duty-free-shop, 11 documents. |
| ch/de unaccompanied-minors 390 | www's maui-table cells are at least 200 px wide, so the table scrolls inside its box. They have 24 px lines and 30 px above and below. Ours fitted both columns into 346 px: 808 px against www's 648. Under the table, www leaves 107 px before the accordion (128 at 1440), ours 40 / 64. | www's cell metrics, 200 px wide on phones; 107 / 104 px from a table to an accordion after it. Reach: tables in 417 documents. The capped 840 px tables don't change, and no page scrolls sideways. |
| ch/en miles-and-more 1440 | In the open accordion panel, www draws the card picture (377 px) beside its "Privileges" list. Ours stacked them: 262 px taller. | From 768 px, a panel's picture followed by a titled list sits beside it: half the panel, with www's 57 / 73 px of ink above and below. Reach: 22 documents. |
| ch/en swiss-recraft-collection 1440 | The real cause is the column beside the aside: www's is 794 px, ours 842, so the video and pictures draw taller. A column rule was tried and failed five other 1440 page-widths (newsletter, food-and-beverage, green-fare, swiss-premium-economy, accessible-travel). | None of its own. It passes with item 2's title rule (-9 px). |

**The nine aside pages and the four (live):**

| Page | www 1440 / 390 | Today | Now |
| --- | --- | --- | --- |
| ch/de duty-free-shop | 1,516 / 1,173 | 1,516 / 1,182 | 1,515 / 1,186 |
| ch/de unaccompanied-minors | 3,414 / 4,483 | 3,266 / 4,519 | 3,345 / 4,464 |
| ch/de additional-bag | 2,387 / 2,816 | 2,324 / 2,771 | 2,331 / 2,787 |
| ch/de swiss-business | 4,655 / 6,821 | 4,748 / 6,722 | 4,755 / 6,754 |
| ch/en swiss-premium-economy | 4,120 / 7,682 | 4,044 / 7,455 | 4,051 / 7,509 |
| ch/en miles-and-more | 3,427 / 5,194 | 3,543 / 5,076 | 3,310 / 5,116 |
| ch/en upgrade-options | 2,888 / 3,904 | 2,822 / 3,764 | 2,837 / 3,834 |
| ch/en swiss-recraft-collection | 4,053 / 5,441 | 4,106 / 5,341 | 4,121 / 5,419 |
| ch/en mobile-apps | 2,152 / 2,643 | 2,086 / 2,546 | 2,093 / 2,578 |
| ch/en animals-travelling | 5,121 / 7,771 | 5,016 / 7,581 | 5,031 / 7,621 |
| ch/en health-and-travel | 3,150 / 4,873 | 2,946 / 4,773 | 2,953 / 4,805 |

## Item 2: the title and the footer

**The title (shipped from 768 px; phones HOLD):**
- **Where the offset is:** only after a picture. ours puts the H1 40 px under the picture where www puts it 30 px under.
  That is 21 recorded page-widths at each width, +8 or +9 at 1440 and +10 at 390. Without a picture the H1s match
  (0 / -1 px).
- **From 768 px:** 31 px. Reach: 1,393 documents with a picture before their H1.
- **Phones:** 30 px is HOLD. It takes two customer-support pages that are short of www more than half a point further:
  refunds 390 -0.88 -> -1.86 % and payment-options 390 -2.06 -> -3.02 %.
  - Why they are short: www draws the H2s there as heading-medium (all 9 recorded customer-support H2s), ours as the
    flow pages' heading-small.
  - payment-options also has 33 px more above its accordion and 49 px more under its last text on www.

**The footer on phones (8 of 19 px shipped):**
- The legal row is now 4 px closer to the logo above it and 4 px to the one below: 549 -> 541 px, www 530.
- The other 10 px is the legal lines' height. They stay 24 px apart (www 14) so the links keep WCAG 2.5.8's 24 px
  target spacing. That was a deliberate choice before (swiss.css), and this order keeps it.
- 5 px below instead of 4 takes arrival-departure 390 (short of www) +0.53 points further.

**The fleet hub intro (+21 px at 390): HOLD.**
- With the footer at -8, ch/en fleet 390 is 2,043 (www 2,040). The intro's 21 px would make it 2,064 (+1.18 %), +0.64
  points further than today.
- It passes only with the whole 19 px off the footer.

## The gate, live (all rules together, against today's served pages)

- 156 page-widths (homepages, offers and culinaryjourney left out, as above). 103 moved: 53 closer, 49 further, 1 the
  same. The sum of |% off www| is 395.21 -> 380.87.
- No page-width is more than 0.5 points further. The most is arrival-departure 390: -2.60 -> -3.08 %, +0.47.
- Three loads in the parallel sweep were broken (swiss-first 1440, contact-us 390, ch/en homepage 1440). Read again
  alone they gave 4,274, 2,338 and 4,346: unchanged, the footer's -8, and the code-override figure.
- online-check-in 390's booking form varies by 24 px per load. With the code it is 5,555 (www 5,567).
