# Austrian Airlines: austrian.turnsthe.page and www.austrian.com

Site lh-austrian, host austrian.turnsthe.page, live in 64 roots since 2026-10-31. This report
holds the accessibility pass (brief 382) and, once the capture of www.austrian.com is in
(`austrian-parity-001`), the parity rows. www refuses agents' browsers, so www is compared from
the capture only.

Rows: what www shows, what ours shows, kind (theme, variant, import, document, shared code,
www's design), owner and status.

## Accessibility (brief 382, 2026-11-05)

**How:** axe-core 4.10.2, WCAG 2.0, 2.1 and 2.2, A and AA (`wcag2a`, `wcag2aa`, `wcag21a`,
`wcag21aa`, `wcag22a`, `wcag22aa`), on austrian.turnsthe.page (main's code, the published
documents), at 390 and 1440, one page at a time. Each page was scrolled
through so lazy blocks loaded, after the cookie choice "Only necessary"; the cookie dialog itself
was checked on the homepages before it was closed. Plus a keyboard pass on the homepages.

**Pages** (22, at/en and at/de each):
- the homepage (`/homepage`);
- the menu's three tabs, the first page of each group: Flights (`/book/flights`), Travel
  information (`/book/overview-travel-information`), Manage (`/book/overview-manage`), Extra
  services (`/book/overview-extra-services`), Travel classes (`/fly/travel-classes`), Services on
  board (`/book/overview-services-on-board`), Inspiration (`/book/overview-inspiration`);
- the contact page (`/contact`);
- an info page (`/baggage`, `/gepaeck`) and an article
  (`/discover/inspiration/fly-with-austrian`).

### Results

- **axe:** no violations on any of the 22 pages at either width (44 runs), nor in the cookie
  dialog. Every run passed 13 rules on the page's content (main held 300 to 3,200 characters
  and up to 8 blocks), so the runs saw the pages. The one "needs review" item: the showcase
  notice's text (#1a1a1a on white) over the page, which axe cannot measure; it reads fine.
- **ema-adobe's carousel dots (87f5d985):** the homepage's card carousel dots are 24 px targets;
  the 2.5.8 finding of brief 370 is gone.
- **ema-cashub's inert flyout (d81e71f9):** the menu flyout is `inert` and hidden when closed; a
  Tab pressed while it closes goes on to the page, not into the flyout (1440 and 390).

### Keyboard pass

| Part | What happens | Status |
| --- | --- | --- |
| Showcase notice | a modal dialog, `lang="en"` on the German pages (WCAG 3.1.2 holds), the focus on its button | fine |
| Cookie dialog | a modal dialog, the focus kept in its six controls | fine |
| Skip links | "Go to navigation", "Go to main content", "Go to end of page" (German: "Zur Navigation" …) first, each with a ring | fine |
| Header | logo, the quick links, Help & contact, Login, Menu, each with a ring, in the order they show | fine |
| Menu, 390 | Enter opens it with the focus on the first tab; Enter on a tab moves the focus to its first link; Escape closes it and returns the focus to Menu | fine |
| Menu, 1440 | as at 390, but after Enter on a tab the Tab key goes through the other tabs and the bar's tools before the open panel's links | finding 1 |
| Alert strip | "Current restrictions on rail services to Vienna Airport": a link right after the header, with a ring | fine |
| Flight search | every field named (trip type, travellers, non-stop, From, To, the two dates, Search); the travellers panel opens with Enter, Tab walks its controls, Escape closes it and returns the focus | fine |
| Airport list | could not be checked from here (finding 3) | not checked |
| Fare tiles | each tile a link; the focus ring is drawn round the whole card | fine |
| Cookie choice made | the focus stays on the page's body; the next Tab starts at the skip links | finding 2 |

### Findings

| # | Finding | WCAG | Kind | Owner | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | Desktop menu: the open panel's links come after the other tabs and the bar's tools in the Tab order (the panel follows them in the DOM); at 390 the focus goes into the panel | 2.4.3 (advisory) | shared code (blocks/header, every brand) | lh-com shared code | open, not Austrian's to change |
| 2 | After the cookie choice the focus stays on the page body instead of a named place | 2.4.3 (advisory) | shared code (the consent dialog) | lh-com shared code | noted: the next Tab starts at the skip links |
| 3 | The airport list: from this environment www.lufthansa.com answers the airport and label calls with Cloudflare's 403 page (the browser reports a CORS failure), and a production host uses no recordings, so no list opens here | – | environment | – | not checked; brief 370's keyboard pass and the functions report found it working |

Nothing to fix in Austrian's theme (`styles/themes/austrian.css`); Austrian has no brand-scoped
block variants. Possibly www's own design (for the parity pass): none found yet.

## Parity

Waits for the capture of www.austrian.com (`austrian-parity-001.tar.gz`: full-page PNGs at 390
and 1440, HTML and shadow HTML, measurements, the homepages' menu and search states, www's CSS
and fonts).

| Row | What | www | ours | Kind | Owner | Status |
| --- | --- | --- | --- | --- | --- | --- |
