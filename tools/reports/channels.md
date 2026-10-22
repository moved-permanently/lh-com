# Channels: website, FlyNet, app view

One document in DA, one codebase (GitHub `moved-permanently/lh-com`), three presentations:

| Channel | Where | Switched on by | Content |
| --- | --- | --- | --- |
| Website | `main--lh-com--moved-permanently.aem.page` | default | lh-com |
| FlyNet (onboard portal style) | `main--lh-flynet--moved-permanently.aem.page` | metadata row `channel` = `flynet`, URL `/**`, in lh-flynet's `metadata` sheet (never the hostname) | lh-flynet, a linked site of lh-com |
| App view | any page of either site + `?channel=app` | the query parameter | the page itself, no copy |

Code: `scripts/channel.js` (channel detection, removed blocks, app-view links), `scripts/scripts.js`
(`applyChannel` in `loadEager`, `styles/channels.css`, no consent in the app view, no header or footer
when they are removed), `blocks/header` (FlyNet: flight bar, no booking/login/cart, FlyNet locales
only), `blocks/footer` (FlyNet: no booking links), `blocks/channels-demo` (the demo page).
Documents: `tools/channels/da/` (DA source format), written and previewed by `tools/channels/apply.sh`.

## FlyNet channel

- Compact and mobile first, Lufthansa's design as migrated: brand bar 64 px (121 px with the
  flight bar below 768 px, 111 px from 768 px, 115 px from 1281 px), smaller headings and
  spacing.
- Flight bar: first row of the lh-flynet sheet `/flight` (columns flight, from, to, departure,
  arrival: LH 400, Frankfurt (FRA) → New York (JFK), 10:55 → 13:40), labelled "Sample data" /
  "Beispieldaten". Not the real onboard portal (only reachable on board): a FlyNet-style channel.
- Not offered: the blocks flight-search, booking-lookup, price-bar, fare-teaser and
  destination-finder are removed before they load; nav and footer links to the shop, booking deep
  links (`/deeplink/cockpit`), Travel ID login, check-in, flight search and seat/upgrade booking
  are dropped; no login, cart or search tool; the country dialog offers de/en and de/de only.
- Without the metadata row the same code renders the website unchanged (checked locally:
  quick actions, login, 140 px header, no channel class).

### What lh-flynet holds (overrides) and inherits

| lh-flynet document | Why |
| --- | --- |
| `/metadata` sheet | the `/**` → `channel: flynet` row. lh-com has no metadata sheet (GET `admin.da.live/source/moved-permanently/lh-com/metadata.json` → 404, 2026-10-22), so there is no lh-com row to repeat. If lh-com gets one, lh-flynet's must repeat all its rows (sheets are not merged). |
| `/flight` sheet | the sample flight |
| `/de/en/homepage`, `/de/de/homepage` | FlyNet start pages: welcome, sample-data note, teasers to the onboard pages |
| `/de/en/nav`, `/de/en/footer`, `/de/de/nav`, `/de/de/footer` | FlyNet nav (Services on board, Food & drinks, Entertainment, Miles & More, Imprint) and footer |
| `/de/en/during-your-trip/internet-overview`, `/de/de/...` | local override (detached copy) with an onboard-only intro at the top |

Inherited from lh-com: every other path, among them the onboard pages the FlyNet nav links to
(de/en services-on-board, menus-on-long-haul-flights, menus-travel-classes, onboard-delights,
childrens-menus-on-board, during-your-trip/lhg-wifi, lufthansa-first-class-entertainment,
children-on-board, doctor-on-board, miles-and-more, imprint; de/de services-an-bord,
menues-auf-langstreckenfluegen, menues-reiseklassen, onboard-delights, kindermenues-an-bord,
during-your-trip/lhg-wifi, lufthansa-first-class-entertainment, kinder-an-bord, doctor-on-board,
miles-and-more, impressum), and `/` → `/de/de/homepage` (client-side in `scripts.js`, query kept),
which on lh-flynet lands on the FlyNet start page.

## App view

`?channel=app` on any lh-com or lh-flynet page: no header, footer, breadcrumb or cookie banner
(OneTrust is not loaded and no consent is announced); the showcase notice still shows. Internal
links get `?channel=app` when they are clicked (also middle click and context menu), so the reader
stays in the app view. No second site, no copied content.

Assumption: the app's web view handles navigation (back, tabs, deep links) and consent itself.
Navigation that does not go through a link (form posts such as the flight search hand-off to the
shop, `location.href` set by a block) and external links leave the app view.

## Demo page `/demo/channels` (lh-com)

Outside the locale trees, robots `noindex, nofollow`, linked from no nav; nav/footer of de/en by
metadata, `language: en`. The `channels-demo` block shows `/de/en/menus-on-long-haul-flights` in
three 390 × 780 frames side by side (website, FlyNet, app view) with a link under each; below,
what is shared, inherited and overridden. The preview hosts allow framing (no X-Frame-Options,
no frame-ancestors; the CSP allows `frame-src https:`), so no screenshots are needed. Inside the
frames the showcase notice does not show; the FlyNet frame (other origin) shows the cookie banner
until a choice is made there.

## Demo flow

| Step | Who | Where |
| --- | --- | --- |
| 1. Edit a page in DA on lh-com (e.g. the "Entertainment" heading of `/de/en/during-your-trip/internet-overview` → "Entertainment on board") | author | da.live, site lh-com |
| 2. Preview it on lh-com | author (DA Preview) or `apply.sh timing` | `main--lh-com--…aem.page/<path>` |
| 3. Preview the same path on lh-flynet: the worker returns lh-com's document because lh-flynet has none | author with the MSM plugin (Prepare → Multi-site Manager → Preview on linked sites) or `apply.sh timing` (needs the IMS token as `x-content-source-authorization`) | `main--lh-flynet--…aem.page/<path>` |
| 4. Open it in the FlyNet channel: flight bar, FlyNet nav and footer, no booking | anyone | lh-flynet preview, 390 px |
| 5. Open it with `?channel=app` | anyone | `main--lh-com--…aem.page/<path>?channel=app` |
| 6. Detach internet-overview on lh-flynet and add the onboard intro at the top | author (MSM Detach, then edit) or `apply.sh detach` (the same copy: GET lh-com source, write it to lh-flynet, here with the intro) | da.live, site lh-flynet; preview on lh-flynet |
| 7. Change something further down on lh-com (step 1) and preview on lh-com | author | lh-com |
| 8. Merge on lh-flynet: open lh-flynet's internet-overview, Prepare → Multi-site Manager → Merge. The plugin calls `mergeCopy` of da.live/nx (3-way: regional copy vs source) and writes the copy back with diff marks; accept the upstream heading, keep the local intro | author, in the DA editor | da.live, site lh-flynet |
| 9. Preview the merged copy on lh-flynet; `apply.sh merge-check` checks intro and change | author / Ben | lh-flynet |

`apply.sh` runs steps 1–3 as `timing` before `detach`: the edit is measured while the page is
still inherited, and the detached copy is made from the version before the edit
(`tools/channels/baseline/`), so the merge in step 8 has an upstream change to bring in.

## Inheritance delay

Not measured yet: this agent may not write to DA or trigger previews (the permission system
refused both, see Limits), and the worker answers 401 without an IMS token, so no edit could be
made and timed. `apply.sh timing` measures it: it writes the lh-com edit, previews lh-com, then
previews lh-flynet every 15 s until the lh-flynet `.plain.html` shows the edit (at most 10 min),
and prints the seconds. Expected: as soon as the lh-flynet preview runs if the worker has no
cached copy, otherwise up to 5 minutes (worker cache).

## Limits found

- DA writes and preview calls were refused to the agent by the permission system (an agent's
  instructions are not the user's consent). Nothing was written to DA, nothing was previewed;
  Ben runs `DA_TOKEN=… sh tools/channels/apply.sh` (or its steps) and the merge in the editor.
  Until then the lh-flynet preview answers 404 (also in the demo's FlyNet frame).
- lh-flynet previews need `x-content-source-authorization: Bearer <IMS token>`; inheritance
  resolves at preview time, so an lh-com change reaches lh-flynet only after an lh-flynet
  preview, and the worker may serve a copy up to 5 minutes old.
- Metadata sheets are replaced, not merged: lh-flynet's sheet must repeat every lh-com row.
- Merge needs the DA editor: `mergeCopy` loads in the browser with DA's auth and leaves diff
  marks that an author accepts or rejects.
- The import loop uploads `content/` to lh-com; `tools/importer/author-edits.json` re-applies
  the DA edit of step 1/7 on internet-overview to every upload (da-upload.mjs), so a re-import
  or re-upload keeps "Entertainment on board".
- The showcase notice acknowledgement is stored per origin: lh-com and lh-flynet are two hosts,
  so it shows once on each.
- The flight bar shows one fixed sample row; no live flight data.
- Pages outside de/* on lh-flynet are inherited with lh-com's nav and footer (booking links
  filtered) because lh-flynet holds de/en and de/de only.
