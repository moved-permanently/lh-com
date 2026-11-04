# TAP's first screen: the header and the stage (brief 311)

Status of 2026-11-04: **code only, nothing published, no document changed.** Compared with
www.flytap.com at 1440 and 390 px (cookie banner: necessary only, `#onetrust-reject-all-handler`),
on a branch preview of lh-tap (`cmp-311--lh-tap--moved-permanently.aem.page`): the eight root
homepages (the seven, and pt-br) and two inner pages each (TAP fares, travelling with animals).
www was loaded one page at a time, 4.5 to 6 s apart (my reading of "slow traffic").
Values come from TAP's stylesheet (`/_next/static/css/86708601e3be1e13.css`, Tailwind `lg` 1024,
`md` 728, `sm` 600) and from computed styles.

## What changed

| Where | What |
| --- | --- |
| `blocks/hero-campaign/hero-campaign-tap.js` (new) | TAP's stage on a `hero-campaign slider` of brand `tap`: www's green wedge (`#65C922`, top left) and line (`#9EFD38`, bottom right), each in a desktop and a phone shape as www draws them. Previous, dots and next are in one group, followed by a pause button (`aria-pressed`, labels in TAP's seven languages). It rotates every 5 s like www's swiper, stops on hover and focus, and doesn't rotate under reduced motion. A stage with one slide gets the stripes and no controls. |
| `blocks/hero-campaign/hero-campaign.js` | `buildSlider` returns its parts; `decorate` loads the TAP module on brand `tap` only. TAP builds a slider from one slide, every other brand from two, as before. |
| `blocks/header/header-tap.js` (new), `header.js` | `header.layout 'tap'`. The menu is www's top-level menu: Check-in is inserted third, from the quick action, until the nav document has a Check-in item. Search and account link to www's same root, and the market button sits after them. The quick links are left out. The homepage test uses the page's own root (pt-br's locale reads as pt-pt). On a homepage, the bar floats inside the stage. |
| `scripts/brands.js` | TAP entry: `header: { menu: 'bar', languages: 'bar', layout: 'tap' }`. This file is an lh-edge deploy path. |
| `styles/themes/tap.css` | A "TAP's first screen" section at the end. Every rule is under `body.brand-tap`. |
| tests | `test/tap-first-screen.test.mjs` (15 tests); `test/header-bar-menu.test.mjs` now expects the brands with a header to be b2b and tap. |

## Measured: ours on the branch against www

Positions are relative to the stage's top. Both sites have the alerts bar above it (52 px, or
104 px on www when two alerts show).

| | www 1440 | ours 1440 | www 390 | ours 390 |
| --- | --- | --- | --- | --- |
| stage | x 32, 1376 × 740, radius 32 | same | x 16, 358 × 323 | x 16, 358 × 323 (325 where the lead takes three lines; pt-br's longer text 469) |
| bar | stage + 16, x 160, 1120 × 70, pill, `0 16px 32px rgb(0 0 0/10%)` | same | 16 below the alerts, 358 × 56 | same |
| bar on inner pages | fixed, top 16, 1120 × 70 | same | fixed, 16, 358 × 56 | same |
| top-level menu | 5 items, Inter 16/500, padding 8, 36 high | 5, same, 35 high | burger | burger |
| right side | search, account, flag + "PT" (62 wide) | search, account, globe + "PT" (50 wide) | search, account, burger | same |
| headline | stage + 96, x 164, 720 wide, 64/64, −4 % | same | 24/24 at stage + 48 | same |
| lead, button | stage + 256 (20/30, 600), button at + 348, 120 wide | + 256, + 348, 124 wide | full-width button | same |
| previous / dots / next | stage + 464, x 146 | same | centred below the picture | same |
| pause | x 1236, stage + 464 | same | x 334, below the picture at the right | same |
| booking box tab bar | stage + 454 | **stage + 504** (see below) | below the stage, + 24 | same |

Inner pages: our bar matches www's. Below the bar, www shows a green strip of the booking box's
four tabs (Reservar voo, Fazer Check-in, Gerir reserva, Estado do voo) on inner pages. The brief
didn't ask for it, so it isn't built (a candidate for a later round).

Pictures (homepage): the extras' icons are now 20 × 20 (www 20 × 20; ours were 48). The
Christmas-markets banner is now 1120 × 305 in the container with 32 px corners (www 1120 × 305;
ours was 1440 wide, upscaling a 1152 px file). The rule for the Miles&Go logo (36 px high) is in
place, but today's pt-pt document no longer has the logo in that text.

Screenshots (gitignored, not committed): www `/tmp/tap-hero/www-*.png` and `www/`; ours before
`ours-before-*.png`; after `ours-after-*.png`, `ours-alerts-*.png`, `ours-menu-1440.png` and the
branch run `branch/`.

## For the booking box's owner: the overlap is 50 px short at 1024 px and wider

`placeOverHero` (blocks/booking-box/booking-box.js) keeps the box's tab bar 16 px below the
lowest of the stage's dots, CTA and buttons whose horizontal range overlaps the **card's**
(160 to 1280 at 1440). www's controls sit level with the tab bar, but outside its horizontal
range: the controls run 146 to 290 and the pause button 1236 to 1276, while the tab bar runs
415 to 1025. With the controls where www has them, the box comes up only 172 px instead of
www's 222. Its tab bar sits at stage + 504 instead of + 454, and the card's last 16 px hang below
the stage's edge. The fix, if the owner agrees, is one line: test the blockers against the tab
bar's rectangle, not the card's (`const t = block.querySelector('[role=tablist]').getBoundingClientRect()`
and `r.right > t.left && r.left < t.right`). pl-pl's stage has no controls today, and there the
box comes up the full 206 px. I haven't changed the block.

## For ema-cashub: what the nav documents and the import lack

1. **Check-in as a top-level item** (www's third): today it comes from the "Check-in" quick action
   (`#special-anchor-check-in`) and is a plain link. www opens a panel with "Informações de
   Check-in". If the nav tool writes it into the mega-menu section, third, with its group, the
   header uses that and stops borrowing the quick action.
2. **Os meus voos** has only "Extras". www's first column is "Gerir reserva": Gestão da Reserva,
   Extras e Upgrades, Fatura online, TAP Vouchers.
3. **Tools section**: there are no search, account or market items. The header writes search and
   account itself, as links to www's root (`https://www.flytap.com/<root>`, because www opens
   panels there), and the market button comes from the language list. If the documents gain
   these items, the header can read them instead. The documents' Ajuda tool and "Menu" are hidden
   in TAP's bar.
4. **pl-pl's stage** has one slide. www's pl-pl homepage rotates (it has a pause button), so the
   import may be missing slides.
5. The market button shows the globe; www shows the country's flag. Flags would need assets
   (one per root).

## Not as the brief described

- **The pause button** is at the bottom **right** (x 1236 at 1440), level with previous, dots and
  next on the left. The brief said "bottom left, as on www", and www has it on the right.
  I followed www.
- On phones, www's neighbouring slides peek in at the sides. Ours show one slide at a time.

## Checks

- **Lint:** passes.
- **Full suite:** 227 of 227 test files pass after the rebase onto ema-adobe's TAP alerts bar
  (562d1e1f and the commits after it).
- **Alerts bar:** with ema-adobe's bar on the root homepages, the header sits 16 px below it, as
  on www: 68 px from the top at both widths, the stage at 52 (1440) and 148 (390), the same as
  www's es-es.
- **Other brands:** lufthansa.com's 19 comparison pages and the brand homepages (Discover, ITA,
  Austrian, Brussels, Lufthansa Group for Business, SWISS, Cargo, Air Dolomiti) were compared,
  main against the warm branch, with `compare-roots.mjs`. 17 of the 19 lufthansa.com pages are
  equal. The two that differ, and every brand page that differs, differ only in timing:
  - where the asynchronously loaded `styles/showcase-notice.css` link lands in the head (main
    against main differs the same way: 18 of 19);
  - the flash teaser's progress ring (`stroke-dashoffset`);
  - the order of the flight search's async sources;
  - random form ids.
  Header, main and footer are otherwise the same.
- **Smoke:** before and after the lh-edge deploy that `scripts/brands.js` triggers.

Rollback: `git revert` of the commit. No document or index needs undoing.
