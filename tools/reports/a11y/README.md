# Accessibility on six brand sites (brief 370)

One report per brand: [swiss](swiss.md), [austrian](austrian.md), [ita](ita.md),
[brussels](brussels.md), [discover](discover.md), [cargo](cargo.md). TAP: ema-test's
`tools/reports/tap/parity.md` rows 86 to 94 (brief 363/366).

## How it was checked (2026-11-05)

- **axe-core 4.10.2:** tags wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa. Each page was loaded at 390 × 844 and
  1440 × 900, the consent stored, scrolled through and settled before the run.
- **Pages:** per brand the homepage, the contact or help page and one article or info page, on
  `<brand>.turnsthe.page` with the code of main at fcff6ca.
- **Keyboard pass:** the same homepages at both widths:
  - the first Tab stops;
  - every stop up to the footer, for a visible ring;
  - the header menu: Enter opens it, the focus goes in and stays in, Escape closes it, the focus returns;
  - the flight search's fields, the airport list, the travellers panel and the date fields;
  - the alert strip's buttons.
- **The fixes:** checked before the push on a second local dev server, with the working tree's code against each site's
  aem.page preview content (Brussels, ITA, Discover), with axe and the keyboard again.
- **www:** www.swiss.com, austrian.com, ita-airways.com, brusselsairlines.com and
  discover-airlines.com all answered the agent's browser with 403 (Cloudflare). www's design
  was therefore read from what the repo holds:
  - the Group frontend's stylesheet (`tools/source-export/static/app.8c42f486.css`, `logs/b199/css-app.54a93e38.css`);
  - the skip links on www's pages in the 404 captures of brief 342 (`logs/b342/bd-404/`, 2026-11-01).

## Shared findings (all five airline brands)

| Finding | WCAG | Where | Status | Owner |
| --- | --- | --- | --- | --- |
| No skip links; www has "Go to navigation / main content / search / footer" on every page | 2.4.1 | `scripts/skip-links.js` (new), `styles/styles.css`, `scripts/scripts.js` | fixed: www's wording per brand and language. "Go to search" left out: the replicas have no search field for it. Cargo's www has none, so Cargo gets none | lh-com shared code |
| The travellers panel stays open when the focus leaves it (Tab past it) | 2.4.3 / 3.2.1 | `blocks/flight-search/passenger-picker.js` | fixed: it closes when the focus moves outside it, stays open on a click on its own text | lh-com shared code |
| The date fields' calendar stop (the invisible native picker button) has no ring | 2.4.7 | `blocks/flight-search/flight-search.css` | fixed: the field's ring by `:focus-within` | lh-com shared code |
| Card carousel dots: 8 px, 16 px apart (`target-size`) | 2.5.8 | `blocks/carousel-cards` | left as www: the Group frontend's `.swiper-pagination-bullet` is 8 px with 4 px margins (`app.8c42f486.css`). 24 px targets would change the dots' spacing | www's design; a change is the user's design call (code: lh-com) |

Not findings: the header menu passed the keyboard pass on all six brands at both widths. Every
focus stop up to the footer has a ring. The airport list works with the arrow keys, Enter and
Escape.

## After the push (42defbc, live on the hosts)

- **axe:** all 18 pages at both widths again. Only the findings left as www remain: the carousel dots (every homepage; Cargo's at 390) and ITA's alert-strip chevrons at 1440. Every fixed finding is gone.
- **Skip links:** 3 on each page of the five airline brands, none on Cargo.
- **Keyboard:** the travellers panel closes on Tab out and the date fields' calendar stop has its ring (ITA at 390, Austrian de at 1440).
- **Smoke:** the same rows as before the push on lufthansa, lufthansa-edge, cargo, airdolomiti, swiss, austrian, ita, brussels, discover and TAP.

Rollback: `git revert 42defbc`.
