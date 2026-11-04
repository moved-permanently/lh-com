# TAP's homepage below the carousels: the Miles&Go cards, the Christmas banner, the footer (brief 331, parts 1 to 3)

Status of 2026-11-04: **code only, nothing published.**
- **Compared:** www.flytap.com/en-pt at 1440 × 900 and 390 px (cookie banner: necessary only)
  against the branch preview `cmp-331--lh-tap--moved-permanently.aem.page`.
- **Pages:** the eight root homepages and four inner pages, for the footer and the banner.
- **The draft page for the four cards was not uploaded:** the DA write was refused because the
  brief didn't name the upload (see the last section).

## What changed

| Where | What |
| --- | --- |
| `styles/themes/tap.css` | Three TAP-scoped sections, described below: `columns-media.stack`, `hero-card-overlay`, and the footer's cards. |
| `blocks/footer/footer-tap.js` (new), `footer.js` | On brand `tap`: the link columns in one card; a side card with the logo (from the logo row), "Follow us" and "TAP App"; the copyright bar, with Star Alliance at its right when the document has it. Other brands' footers are unchanged (`test/footer-logos-first.test.mjs`: their markup hashes are the same). |
| tests | `test/tap-below-carousel.test.mjs`; `test/fixtures/footers/tap.plain.html` (en-pt's footer document). |

### `columns-media.stack`: www's Miles&Go cards
- **Card:** 1120 × 580, white, rounded, soft shadow.
- **Text panel** on the left half: light green on the first card, near white on the others.
- **Chevrons:** the card's accent chevron on its left edge (www's own shape, 147 × 580); the
  photo on the right behind a chevron in the panel's colour.
- **Logo:** in a white box at the top.
- **Buttons:** the accent pill on the first card, green-outlined on the others, a text link beside
  them.
- **Accent per card, as www:** Miles&Go green, Club lime, grey, dark green.
- **Phones:** cards one under the other, the photo on top with a slanted edge.

### `hero-card-overlay`: the Christmas banner without its box
- Title, line and white pill straight on the picture, under a 20 % shade.
- 1120 × 305 at 1440, 358 × 380 on phones with the button at the bottom.

### The footer's cards
- Link card, side card and copyright bar on TAP's greys.
- A pill-shaped bar from 1024 px, accordions on phones.

## How www stacks the Miles&Go cards, and ours

- **www:** GSAP pins the four cards (`pin-spacer`, 1580 px of scroll for 580 px of card). Each
  next card slides up over the one before, about 30 px lower while it moves; at the end all four
  lie on top of each other at y 48, then leave together. On phones there is no pinning: the cards
  stand one under the other, 16 px apart.
- **Ours:** `position: sticky` from 1024 px:
  - the cards stick at 48, 78, 108 and 138 px, so each earlier card shows a 30 px edge, as on www
    while it stacks;
  - each next card slides over the one before;
  - all four leave together at the block's end;
  - no script.
  - **Not as www:** www finally lays the cards flush at 48 px; ours keep their 30 px steps.
- **Phones as www:** at 390 px the four cards are 492, 450, 429 and 596 px high (www: 492, 450,
  429 and 569).

## Measured

| | www | ours |
| --- | --- | --- |
| Miles&Go card at 1440 | 1120 × 580, title at +132, text column 496 | 1120 × 580, title at +132, text column 472 (local draft) |
| banner at 1440 | 1120 × 305, title at +72 / +64, line +118, button +193 (122 wide) | the same (button 124 wide) |
| banner at 390 | 358 × 380, button at the bottom | the same |
| footer at 1440 | links card 816 × 432, side card 280 × 432, bar 1120 × 69 | 816 × 454, 280 × 454, 1120 × 69 |
| footer at 390 | links 358 × 184, side 358 × 293, bar 358 × 97 | 358 × 184, 358 × 293, 358 × 53 (no Star Alliance) |

All eight homepages and the inner pages show the same footer at both widths (TAP's headings in
each language: "Siga-nos", "Síganos", "Suivez-nous", "Folgen Sie uns", "Ci segua", "Zachęcamy
do obserwowania nas"). No page scrolls sideways.

Screenshots (not committed), all in `/tmp/tap-331`:
- **Before:** `before-en-pt-{1440,390}-lower.png`.
- **The draft card stack, locally:** `draft-1440-*.png`, `draft-390-b.png`.
- **Banner and footer:** `work-banner-*.png`, `work-footer-*.png`.
- **www for comparison:** `www-miles-*.png`, `www-banner-*.png`, `www-footer-*.png`.

## For ema-cashub (content; `tools/importer/tap-*` unchanged)

1. **The Miles&Go cards:**
   - Write `ComponentMiles_GoCardListModel` as **`columns-media (stack)`** with **all its cards**,
     one row each. www shows all four to a visitor: "TAP Miles&Go", "Club TAP Miles&Go", "Hotel
     discounts", "TAP Miles&Go Credit Cards". They aren't members-only; the importer keeps the
     first only.
   - Each row is `[text | photo]`:
     - the text cell starts with the card's **logo** as a picture paragraph (`logo_miles_go`,
       Club's `logo_club_miles_go`);
     - then the title as `h2`;
     - the subtitle as a `<p><strong>` paragraph;
     - the description;
     - the CTA: `<strong><em>` (accent) on the first card, `<em>` (outline) on the others;
     - `extrainfo` links as plain link paragraphs, e.g. the credit card's "See here".
   - The draft page `content-sites/lh-tap-draft/drafts/miles-go-stack.plain.html` (local, not in
     git) is that shape with en-pt's texts. It uses the pictures already in DA. The credit card
     uses `credit-card-tap-miles-and-go`, because www's `CartaoPT_900x870` isn't in the media
     folder.
2. **The footer documents** have no Star Alliance logo; www shows it in the copyright bar. A
   `:star-alliance:` link (`https://www.staralliance.com`) in the logo row will show at the bar's
   right.
3. **"Cookies Settings"** is missing from "Other important features"; www lists it after "Cookies
   Policy".

## Not as www

- www's copyright bar sets "© 2026, TAP." in bold. Our note is one text, so it isn't bold.
- The side card's logo is the footer document's 166 × 21 SVG, shown at 202 px as www does.

## The draft page in DA: not done

The DA upload of `/drafts/miles-go-stack` (lh-tap, outside the language folders) was refused by
the remote-content guard: the brief's wording didn't explicitly ask for the upload. To have it on
preview, send: "Upload the drafts/miles-go-stack page to DA and preview it". It will not be
published.

## Checks

- **Lint:** passes.
- **Full suite:** 232 of 232 test files pass.
- **lufthansa.com's 19 comparison pages:** main against the warm branch, 18 of 19 equal. The
  other differs only in where the asynchronously loaded `styles/showcase-notice.css` link lands in
  the head, a timing effect that also shows up when main is compared with itself.
- **Brand homepages:** Discover, ITA, Austrian, Brussels, Lufthansa Group for Business and Cargo
  are equal. Air Dolomiti's `/en/` differs in the order of its head's stylesheets; SWISS's two
  homepages differ in the flash teaser's progress ring (`stroke-dashoffset`). Both are timing.
- **lh-edge:** no file on the lh-edge deploy paths changed.

Rollback: `git revert` of the commit.
