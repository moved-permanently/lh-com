# Brussels Airlines against www: parity

brussels.turnsthe.page (lh-brussels; live in be/en and be/fr since 2026-11-01) compared with
www.brusselsairlines.com at 390 and 1440 px.

## Parity

www refuses this environment's browser: 403 with Cloudflare's "Security check" on the be/en
homepage on 2026-11-05, on the first request, with no retry and no proxy. The user captures the
pages locally (22 pages at both widths, the menu tabs, the travellers panel and the airport list,
www's stylesheets and fonts, computed styles), and the parity rows follow from that capture.

Pages, both languages (our paths are www's):

- `/be/<ll>/homepage`
- the menu tabs' first pages:
  - `book-a-flight`
  - `check-in-options-and-info?country=BE&language=<LL>`
  - `special-care/families-and-children`
  - `my-bookings`
  - `extra-services/upgrades`
  - `travel-classes`
  - `extra-services/meals`
  - `book-a-flight/connecting-africa`
- `contact`
- `articles/lyon`
- the footer, on the homepages.

| # | Where | www | Ours | Kind | Owner | Status |
| --- | --- | --- | --- | --- | --- | --- |
| | (from the capture) | | | | | |

## Accessibility (2026-11-05)

How it was checked, on brussels.turnsthe.page (the published site, main's code):

- **axe-core 4.10.2** (the npm tarball, its sha512 checked against the registry): WCAG 2.0, 2.1 and
  2.2 A and AA, at 390 x 844 and 1440 x 900, on the 22 pages above.
  - The page was scrolled through and settled.
  - First run (its consent click blocked by the showcase notice, so the OneTrust banner stayed
    open): only A1.
  - Second run, the consent stored, after ema-adobe's 87f5d985: no violations on the 22 pages at
    either width.
  - With the OneTrust banner open (both homepages): nothing more.
- **Keyboard pass, both homepages at both widths:**
  - the Tab order from the top, each stop's name and ring;
  - the menu: Enter opens it, the focus goes in, Tab through it, Escape and the close button
    close it;
  - the flight search: its fields, the travellers panel (Enter, Tab, Escape), the date fields;
  - the alert strip: none on the day (no alert in the Message Center for `sn`).

Every focus stop has a visible ring and a name.

| # | Finding | WCAG | Pages, widths | State | Owner |
| --- | --- | --- | --- | --- | --- |
| A1 | Carousel dots 8 x 8px: the homepages' card carousel (`carousel-cards-dot`, 6) and the Lyon article's image carousel (`carousel-images-dot`, 30) | 2.5.8 | both homepages and both Lyon articles, 390 and 1440 | fixed by ema-adobe in 87f5d985 (brief 377, during this pass): 24 x 24px targets; the second axe run, after it, finds none | ema-adobe (shared carousel code) |
| A2 | The menu's flyout, closed, stays in the Tab order: after the menu closes, Tab reaches its close button and items off-screen (9 controls; Lufthansa's has 10, so every brand) | 2.4.3, 2.4.7 | both homepages, 390 and 1440 | open: shared header code (`blocks/header`), not Brussels' files. A brand-neutral fix would keep the closed flyout out of the Tab order (hidden or inert) | lh-com shared code (header) |
| A3 | Phones: the travellers button and "Nonstop only" come in the Tab order before From and To, but show under the dates | 2.4.3 | both homepages, 390 | for the parity pass: the shared flight search's phone layout places the options row under the dates as the Group's flight manager shows it; whether www's DOM order is the same comes from the capture | shared flight search (lh-com); www's design if www does the same |
| A4 | The destination finder at 390: "All offers & destinations" (shown above "Conditions") comes after it in the Tab order | 2.4.3 | both homepages, 390 | for the parity pass (www's order from the capture) | shared destination finder (lh-com) |
| A5 | The fare teaser's route links named by the airport codes alone ("BRU WAS"): the prices, and with them the card's label ("Round trip from …"), do not load. Its request (`lh-proxy…/lhg-fare-teaser/fareteaser/recommend`) answers 502 | 2.4.4 (with the prices missing) | both homepages | open: the fare teaser's data, not Brussels' files | lh-com shared code (fare teaser, lh-proxy) |
| A6 | The airport list could not be tried by keyboard here: this environment's requests to www.lufthansa.com (`/service/api/suggestions/airports`) get 403 on the CORS preflight, from every origin (brussels, lufthansa and airdolomiti alike), so no suggestions show. The list's keys (arrows, Enter, Escape) were checked on the other brands in brief 370 | — | — | not a site finding (the environment); to check from a normal network | — |

No finding lies in Brussels' own theme or brand-scoped variants, so nothing was changed there.
The login page's booking code form (ema-adobe's) was left as it is.
