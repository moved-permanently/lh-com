# TAP's main menu as www.flytap.com's (brief 331)

Status of 2026-11-04: **the 145 nav documents (the eight language versions' and the 137 market
roots') are uploaded to DA (`moved-permanently/lh-tap`) and previewed, 145 of 145 answer 200;
nothing published.** The code is on main (a5584160, 36ec98e2, f1f331b9, 833cad7c).

## What www shows (en-pt, 1440 x 900 and 390 x 844, 2026-11-04 06:20 CET)

| | www | ours before | ours after |
| --- | --- | --- | --- |
| Panel | white, 16 px under the header pill, as wide as it (1120), 24 px corners, a soft shadow | 1040 wide (Plan a trip), 284 (My flights), 32 px corners | 1120, 16 px under the pill, 24 px corners, www's shadow |
| Columns | in a row, 32 px from the edges and 32 px apart, as wide as their content, 32 px for the chevron | four equal 252 px columns (the banner the fourth) | as www: Plan a trip at x 224 / 492 / 805 (www 224 / 492 / 806) |
| Heading | TAP's type 18 / 700, a link, TAP's green chevron 24 px before it | 18 px text, no link, no chevron | as www |
| Links | Inter 16, 33.5 px apart | 41 px apart | 33.5 px apart |
| "See all" | under Book and Trip information (`showSeeAll`), Inter 16 / 500, dark green, underlined | none | as www, www's text per language (`menu-see-all`) |
| Banner | a 266 x 224 picture card on the right: green corner and arc, title 24 / 700 and line 13 / 700 in white, a white "Find out more" pill | a fourth text column with "Find out more" only | as www; the picture is in no archive yet (below) |
| Plan a trip | 330 high | 365 | 329 |
| My flights | "Manage booking" (4 links) and "Extras" (3), 223 high | only "Extras", 284 wide | both columns, 223 high |
| Check-in | sign-in widget, booking-code form, "Check-in Information" | no item (the quick action, a plain link) | the item, a column to the homepage's check-in box in place of the form, "Check-in Information" |
| TAP Miles&Go | the programme column (7 links) and its banner, 324 high | the banner as a column | as www, 324 high |
| Help | two columns, 223 high | | two columns, 223 high |
| Phones (390) | the items as an accordion in a white card under the pill: grey pills, TAP green when open, light green column pills, links 36 px apart, "See all" underlined, no banner | lh-com's full-screen flyout listing every column | as www |

Screenshots (gitignored, not committed: `content-sites/lh-tap/shots/menu/`): www
`www-1440-plan.png`, `www-1440-flights.png` (and `-checkin`, `-miles`, `-help`), `www-390-menu.png`,
`www-390-plan-book.png`; ours before `ours-before-1440-plan-a-trip.png`,
`ours-before-1440-my-flights.png` (and `-tap-miles-go`, `-help`), `ours-before-390-plan-a-trip.png`;
after (local, the new nav routed in) `ours-after-1440-plan-a-trip.png`,
`ours-after-1440-my-flights.png` (and `-check-in`, `-tap-miles-go`, `-help`), `ours-after-390-book.png`;
after on preview `preview-after-1440-plan-a-trip.png`, `preview-after-1440-my-flights.png`,
`preview-after-390-en-us-book.png`.

## The eight roots against www

pt-pt, en-pt, es-es, fr-fr, de-de, it-it, pl-pl and pt-br, each on www and on ours (each item
opened at 1440; the phone menu at 390), compared by their items, each panel's columns with their
link counts and "See all", and the banner's title:

- **1440:** the same five items in all eight; every panel the same except Check-in, where ours
  has one more column ("Efetuar Check-in", "Check-in", "Hacer check-in", "M'Enregistrer", "Machen
  die Check-in", "Effettua il check-in", "Odprawa online", "Fazer Check-in") linking the homepage's
  check-in box in place of www's booking-code form (a live widget; www's sign-in list is left out).
- **390:** the same five items in all eight. fr-fr's and pl-pl's listed Check-in twice (their item
  is "Enregistrement" / "Odprawa", the quick action was added a second time): fixed (f1f331b9).
- **pt-br's "See all"** was pt-pt's "Ver todos": its texts are in its `br` store; now www's "Ver
  tudo" (833cad7c).

## Content (`tools/importer/tap-nav.mjs`)

- www's top level with Check-in third, its link the homepage's booking box (`/<root>#check-in`).
- Each column: a heading linking the column's page, its links, "See all" after them where www
  shows it (`showSeeAll`; www's `menu-see-all` text, else per language).
- A column with a www widget keeps its links (Os meus voos' "Gerir reserva", `check-in-form`); a
  column of widgets only links the item's own target (Check-in's form); the signed-in widgets
  (`requireLogin`) are left out.
- The banner (`bannerMenu`) a row of its own: picture, bold title, line, link.
- **The language switch of English roots** outside the nav tool's market table (en-us, en-ch,
  en-gb …) linked the root itself; now the market's Portuguese (en-us → pt-us, en-ch → pt-ch,
  en-gb → pt-gb).
- The 137 root navs from `tap-markets.mjs` with the same tool (every root has its own nav now: the
  language switch is per root). The root homepages and own pages were not changed or uploaded.

## Look (`blocks/header/header-tap.js`, `blocks/header/header-tap.css`)

- `buildTapMenu` reads the nav document and builds TAP's own menu: the panels from 1025 px, the
  accordion card below; one panel open at a time, Escape and a click outside close it, the menu
  button opens and closes the card on phones.
- `header-tap.css` is loaded by `header-tap.js` for TAP only, every rule under `body.brand-tap`;
  `styles/themes/tap.css` is untouched (the bar and its top-level buttons stay the theme's).
- **`blocks/header/header.js`** (shared code, 10 lines, TAP only): TAP builds its menu with
  `buildTapMenu` in place of the bar menu, and its menu button is not bound to lh-com's flyout.
- Our Inter renders a few pixels wider than www's (Promotions and Campaigns 209 against 204 px):
  the links have −0.01em letter spacing (as `tap.css` gives the bar's buttons), and the columns
  give way into their gaps rather than push the banner out of the panel.

## Other brands

The tap-menu branch against main with `tools/markets/compare-roots.mjs`: **lufthansa.com's 19
comparison pages equal** (14 at once; the other 5 differed only by the head's asynchronous
`showcase-notice.css` and the form's bot check, and were equal on a second capture with the test
site key). The homepages of Discover, ITA, Austrian, Brussels, Lufthansa Group for Business,
SWISS, Cargo and Air Dolomiti: header, main and footer equal apart from the same stylesheet order
and the flash teaser's progress ring (timing).

## Gaps

1. **The banner pictures are in no archive** (www's `bannerMenu`; the capture never fetched them,
   so `missing-pictures.txt` doesn't list them either): every root's menu uses the same two. **For
   the capture:**
   - `https://pic.flytap.com/adobe/dynamicmedia/deliver/dm-aid--e9207061-036c-4438-83d7-c643440ab183/image_airport_ESS_V4.jpg`
     (Plan a trip, 145 roots)
   - `https://pic.flytap.com/adobe/dynamicmedia/deliver/dm-aid--3c60d8f3-1102-4460-8b70-bd24cc231bd3/card_menu_mile_go.jpg`
     (TAP Miles&Go, 143 roots)

   Until then the cards show TAP's dark grey with the green corner, the arc, the texts and the
   pill. Once the pictures are in an archive, a nav build and upload puts them in.
2. **Check-in's booking-code form and sign-in list** are www's live widgets: a link to the
   homepage's check-in box in their place.
3. **On phones** www turns the menu button into a close icon while the menu is open, and its card
   ends with the market button ("PT, English"); ours keeps the menu icon and has no market row.
4. **The language footers** are not part of this brief: rebuilt locally, not uploaded. pt-br's will
   take www's `br` texts at its next footer build (the same lookup as "See all").
5. **The workspace's local content tree** (`content/`, a link to a folder outside the repository)
   cannot be written from this session's shell: the 145 navs and the 414 root documents of brief
   327 are in DA, on preview and in `content-sites/lh-tap/content/`, not in that tree.

Rollback: git revert (code and tool); DA keeps the nav documents' earlier versions.
