# TAP's inner pages: titles, banners, category cards, help-card buttons (brief 331, part 4)

Status of 2026-11-04: **code only (TAP-scoped CSS in `styles/themes/tap.css`), nothing
published.**
- **Compared:** www.flytap.com at 1440 and 390 px against the branch preview
  `cmp-331b--lh-tap--moved-permanently.aem.page`.
- **Inner pages:** ajuda / help, a-bordo / on-board, bagagem / baggage, miles-and-go, stopover,
  destinos / destinations and informacoes / information, in pt-pt and en-pt.
- **Plus:** the eight homepages, and two inner pages in each other root.

| parity.md row | www | ours, before | ours, after |
| --- | --- | --- | --- |
| 14 page titles | H1 40/48 centred; the lead centred in 726 px. On every inner page measured, including privacy, hand baggage, meals and club. | left | centred, the lead in 726 px; every TAP inner page with a title |
| 18 inner banners | 1176 × 404 at 1440, 32 px corners; previous / dots / next and pause inside at the bottom | the homepage stage: 1376 × 740 (miles-and-go, stopover); a full-bleed 1440 × 350 stage (destinos) | 1176 × 404, 32 px corners; controls at x 192 and the pause at 1204, as www; destinos' single stage the same size; 358 px wide on phones |
| 21 category cards | the picture 325 × 225 with 16 px corners; the title as a white tab over its top edge (Inter 16, 16 px lower corners); the sub-links as a light grey card list, lines and chevrons | a green heading under the picture, bullets | as www; on a-bordo (6 cards), informacoes (10) and stopover's destinations (7) |
| 15 help-card buttons | at the card's foot, a chevron after the label | under the text, no chevron | at the foot, with a chevron |

- **Which cards get the tab look:** cards whose body is a linked title alone, sometimes with a
  list of links (www's category cards). Cards with paragraphs keep their look.
- **Homepages:** the eight homepages' stages are unchanged; the stage selector only matches
  `narrow`.

## Not as www

- **Inner banners:** www shows the neighbouring slide peeking in at the left. Ours show one slide
  at a time.
- **Banner headline:** at 1440 it is 40 / 48 px on ours. I estimated www's size from its screenshot
  and didn't measure it.

## The extra link strip's 25 px (570a187c)

I had noted that the strip started 25 px below the alerts bar (stage at 129 instead of www's 104).
b9d689da fixed it on main meanwhile. Its selector `body.brand-tap.appear main >
.section.extra-alert:first-of-type` fails `test/brand.test.mjs`: the theme's selectors must start
with `body.brand-tap ` (with a space). For its owner: `body.brand-tap main > .section.extra-alert:first-of-type`
passes the test.

Screenshots (not committed), all in `/tmp/tap-331`:
- **Before (main):** `ours-inner-*.png`.
- **After (branch):** `branch-*.png`, `p4-*.png`, `p4-390-*.png`.
- **www:** `www-inner-*.png`.

## Checks

- **Lint:** passes.
- **Full suite:** 235 of 236 test files pass after the final rebase. `test/brand.test.mjs` fails
  on b9d689da's selector (above), which isn't from this commit.
- **lufthansa.com's 19 comparison pages:** 19 of 19 equal.
- **Brand homepages:** Discover, Austrian, Brussels, Lufthansa Group for Business and Cargo are
  equal. ITA and SWISS differ only in the flash teaser's progress ring, and Air Dolomiti's `/de/`
  in the order of its head's stylesheets; all timing.
- **lh-edge:** no file on the lh-edge deploy paths changed.

Rollback: `git revert` of the commit.
