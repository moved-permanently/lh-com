# lufthansa.com's token-free switch with its carriers and M at 40 (standing order 56)

ema-adobe, 2026-11-18. Follows [lufthansa-switch-plan-919.md](lufthansa-switch-plan-919.md) (order 55, a sample of
162 page-widths); this one measures all 670. Nothing is switched on main: `THEMES.lufthansa` has no `live` there.

## 1. Verdict

*Updated by standing order 57 (2026-11-19): §9 has the gate again with that night's carriers (361 worse, 22 of them explained by www, 60 better; switched sum 5,705.63).*

**The gate does not pass.** Of the 670 recorded lufthansa.com page-widths that carry markers, 369 read worse
switched than today by more than 0.5 points and 57 better (sum of % off www 4,347.02 today, 5,767.70
switched; median 5.61 / 7.17). On 19 of the worse page-widths, www's own layout is the cause: www draws 60
px where the theme's M is now 40, and with M at 60 they would pass (§4 lists the page-widths further at 40). That
still leaves 350 that don't pass. §6 lists every worse page-width and what is left on it: the first box that moves
and the marker kinds the collapse handed to the theme.

Where the evening's carriers got to, on plan 919's examples (switched with M at 40, % off www; today in brackets):
miles-and-more gb/en 1440 18.6 -> 4.4 (2.3); airport-information gb/en 390 15.0 -> 6.3 (5.6); digital-self-services
gb/en 1440 5.8 -> 4.7 (2.9); pax-receipt 1440 8.8 -> 4.1 (3.0); terms-of-service-group 1440 18.9 -> 13.7 (4.5);
gepaeck de/de 1440 7.9 -> 5.2 (3.4). Not in plan 919's sample: 100-years/destinations de/en 1440 29.2 before H2
large, now 5.3 (0.8).

## 2. The branch

`token-free-lufthansa-live`, pushed as 0a18699 and never merged. It is rebased on today's main (c03909b, with the
markets fix 06bb987); branch lint exit 0; the collapse, theme and token-free tests (376) and the importers' tests
(1,849) pass on it. Its commits over main:

- 2a127fb: lufthansa.com live; M at 40 (`THEMES.lufthansa.space`); (a) `{limited-width}` headings as the section style
  limited-headings; (b) H2 heading-small as the choice small (title-small, h2-small); (e) a from-768 / below-768 pair
  as one Spacer block per width.
- aa82249: the shared tests follow lufthansa.com live (its own live test); bundles.
- 45f3af3: a fix. Spacer blocks now draw the page's M. Before it, a Spacer block M stayed at the base 60 (switched
  baggage 1440 read 7.29 instead of order 55's 1.97).
- 85546ae: the 100-years pages keep M at 60 (page-type default). www's separators there are 60: 86 of the 98
  `{spacer-N}` of the 16 recorded documents.
- 204e35c: M at 60 from 768 px (`space.from768`, variant B) and the Spacer block option s (25 px) for www's 21-31 px
  separators (variant S); rebased on main; bundles.
- 0a18699: H2 heading-large kept as the choice H2 large (variant L); bundles.

On main tonight: 7ccaff7 (item 2f, the width-scoped section styles), 7ecdbbc (its test), dc563d0 (item 4, the 14
bundles from today's sources), and 06bb987, a collapse fix. When the collapse split a market section (`data-markets="de"` /
`"-de"`), it dropped the attribute from the parts, so both versions showed. That drew cash-and-miles' Flight Search
twice (+769 px) and made fluege and free2move worse.

## 3. How it was measured

As in plan 919, on all 670 page-widths:
- **Documents.** The 335 recorded documents with markers, read from our host today (9 changed since the 17th), each
  with a Metadata block holding its Theme, and collapsed with the branch's `marker-collapse-cli.mjs --brand lufthansa
  --force`.
- **Sides.** Today is the published document as `<main>` with the deployed code. Switched is the collapsed document
  with the branch's code, served from the worktree. Both use geo.css and the first 8,000 px against the newest
  recording, with every host but ours and aem refused.
- **Re-captures.** 13 today captures failed and 7 drew one viewport (900 px); all 20 were captured again. One switched
  capture failed and was captured again.
- **Which run each switched row comes from.**
  - 459 page-widths come from the first run on the branch at 85546ae. Their documents and drawing don't change with
    B, S or L.
  - 179 were captured again with 204e35c: the documents that changed (S, the markets fix) and the pages with
    width-scoped separators (B).
  - 32, the 16 H2 heading-large pages, come from variant L's run. 0a18699's collapse writes those documents byte for
    byte.
- **M at 60** (item 1). The same documents and code, with every separator the theme drew at 40 px toggled to 60 in
  the page (logs/b656/m60.js). That covers 288 page-widths. The 192 documents (382 page-widths) with no M carrier
  draw the same at 60 and 40; 11 of them were captured to check, and all 11 toggled nothing.

## 4. Item 1: M at 40

**lufthansa.com: adopted on the branch.** On 670 page-widths, switched, the sum goes 6,034.55 -> 5,767.70
and the median 7.32 -> 7.17. 78 page-widths come closer by more than 0.5 points and
75 go further. The rule is met, but not with one M for the whole site. www draws both sizes:
- 40 on service pages: 100 of their unscoped separators are 40, 12 are 50;
- 60 on 100-years pages and from 768 px: 41 of the 68 width-scoped separators of the service pages are 60.

So the theme now holds three values, all tested here:
- **M at 40**, everywhere else.
- **100-years M at 60.** 100-years/destinations 1440 at M 40 read 27.3 (today 0.7).
- **M at 60 from 768 px** (variant B). 42 page-widths: sum 471.5 -> 408.3, median 7.44 -> 6.96, 8 closer and 7
  further. The further ones are the pages whose www separators from 768 px are 40: new-onboard-experience x4,
  privacy-statement-group, report-baggage, payment-options-at-the-airport.

The page-widths further at 40 than at 60 by more than 0.5 are in the table below, with www's own separators on each
page (the published document's `{spacer-N}`: 31-50 px as "40", 51-89 px as "60"). Most have a 60 or a 50 of www's.
The rest move because of a page-type or carrier difference that the M size changes in passing (stopover's 50s sit
between the two).

**SWISS and ITA: HOLD, as nothing changes.** Their 50 recorded pages (100 page-widths: swiss-parity-001,
ita-parity-001/-002) carry no M separator in their published documents: no Spacer block, no Space M style, no
marker. The toggle found none on the 54 captured (logs/b656/bm40), so the sum can't go down. ema-test's order 45
(ea672c5) held ITA as well, at a sum of 95.02 -> 96.62.

**The other brands are not measured here** (no recordings on this machine). ema-test's orders measured them on
theirs:
- Brussels and Discover: adopted on main by brand CSS (ea672c5; sum 393.96 -> 383.60 and 358.64 -> 358.04);
- Austrian: HOLD (sum 4,698.33 -> 4,731.05); TAP: no M; Cargo: one M, worse (f098b64);
- Air Dolomiti: not measured; B2B: not measured by anyone tonight.

## 5. Item 2: the carriers

| carrier | documents (of 335) | commit | examples, switched (today) |
| --- | --- | --- | --- |
| (a) `{limited-width}` headings -> section style limited-headings | 26 | 2a127fb | miles-and-more gb/en 1440 4.38 (2.33; 919: 18.58), de/de 1440 4.35 (2.34; 12.6) |
| (b) H2 heading-small -> H2 small (h2-small, title-small) | 70 | 2a127fb | airport-information gb/en 390 6.33 (5.64; 919: 14.99); 1440 7.09 (3.84; 4.97) |
| (c) the hub view's last section | (b)'s h2-small | 2a127fb | digital-self-services gb/en 1440 4.70 (2.90; 5.82), 390 7.07 (5.55; 9.05) |
| (d) info and legal pages' column marks | - | none | terms-of-service-group 1440 13.66 (4.54), business-terms-and-conditions 1440 7.77 (2.32), pax-receipt 1440 4.12 (3.01) |
| (e) from-768 / below-768 pair -> two Spacer blocks | 3 (first-class, hotel-offers, wetlease-hub) | 2a127fb | test/lufthansa-switch-carriers-so56.test.mjs |
| (f) width-scoped section styles | main | 7ccaff7 | test/width-section-styles-so56.test.mjs |
| Spacer s (21-31 px), variant S | 68 (140 blocks) | 204e35c | menu-on-board 1440 2.21 (2.21; 31.62 without it); 141 page-widths: sum 1,667.1 -> 1,439.7, median 9.80 -> 8.56, 66 closer, 27 further |
| H2 heading-large -> H2 large, variant L | 16 | 0a18699 | 100-years/destinations de/en 1440 5.25 (0.78; 29.22 without it); 20 page-widths sum 382.7 -> 217.8, none further |

**What (c) and (d) still lack:**
- **(c).** The digital-self-services view's last section now holds. What is left is the opening of each view: the
  view's first H2 ends 36 px higher (1440; the marks' padding on the heading against the carrier section's padding).
  The same step shows on every hub column view.
- **(d).** Nothing closes it yet:
  - terms-of-service-group's 7 `{spacer-25}` sit inside block cells, where no carrier is written;
  - on terms-of-use, sepa-terms-and-conditions and the other legal pages, every chapter of an outer column view
    lands 32 px lower: the Divider block between chapters inside the carrier view, against the marks' rule.
  - It needs the info pages' own carrier rules (plan 558 §6). None of tonight's candidates closes it.

**Measured and held:**
- **Variant A, half of M as the "none" threshold** (a 25 px separator becomes M). 70 page-widths: sum 951.7 -> 984.8,
  median 10.33 -> 11.09, 11 closer and 24 further. A section-opening 25 before an H2 gains (gepaeck 1440 -2.7); one
  before an H3 or mid-text loses (involuntary-rebooking +1.7). S replaced it.

## 6. The gate

What is left, grouped over the 369 worse page-widths (count, and the points above today summed; a page-width can be
in more than one group; logs/b656/causes.mjs):

| group | page-widths | points over today |
| --- | --- | --- |
| a column view carrier on the page | 230 | 869.1 |
| text width marks handed to the theme | 61 | 202.3 |
| text size marks handed to the theme | 53 | 158.7 |
| separators handed to the theme (unscoped / from 768 px / phones / in block cells) | 46 / 29 / 8 / 21 | 176.9 / 98.6 / 30.6 / 82.5 |
| column marks handed to the theme | 42 | 153.7 |
| video marks handed to the theme | 39 | 247.4 |
| heading sizes handed to the theme (near / aligned to the section) | 36 / 31 | 129.2 / 159.1 |
| 100-years pages | 9 | 46.9 |
| none of these (the theme's own drawing) | 31 | 104.2 |

The column views are the largest gap:
- **Each view's opening.** The marks put the view's 32 px (an outer view: the section padding) on its first element,
  while the carrier puts it on the section; on hub views the first H2 ends 36 px higher.
- **Outer views on legal pages.** Each chapter lands 32 px lower (terms-of-use, sepa-terms-and-conditions).
- **The views' own separators.** (c)'s last section holds, but the rest of each view does not yet.

A carrier pass on the column view (styles.css "the column view carrier") is the next step before another gate.


| | today | switched (carriers, M at 40) |
| --- | --- | --- |
| page-widths measured | 670 | 670 |
| sum of % off www | 4347.02 | 5767.70 |
| median | 5.61 | 7.17 |
| worse than today by more than 0.5 | | 369 |
| better than today by more than 0.5 | | 57 |

Item 1 on lufthansa.com (§4; switched, the same documents and code, M toggled):

| | M at 60 | M at 40 |
| --- | --- | --- |
| page-widths | 670 | 670 |
| sum of % off www | 6034.55 | 5767.70 |
| median | 7.32 | 7.17 |
| closer with 40 by more than 0.5 | | 78 |
| further with 40 by more than 0.5 | | 75 |

Further with M at 40 than at 60 by more than 0.5 points:

| page-width | M 60 | M 40 | heights 60 / 40 | www's separators |
| --- | --- | --- | --- | --- |
| /de/en/first-class-terminal 390 | 16.32 | 27.94 | 11110 / 11070 | www 1 x 40, 1 x 60 (flow) |
| /de/en/first-class-terminal 1440 | 26.73 | 32.59 | 12381 / 12341 | www 1 x 40, 1 x 60 (flow) |
| /de/en/prepare-for-your-trip/travel-classes/economy-basic 390 | 8.47 | 12.72 | 4990 / 4930 | www 2 x 40, 1 x 60 (flow) |
| /de/en/my-bookings 390 | 6.98 | 10.72 | 5312 / 5252 | www 2 x 40, 1 x 60 (service) |
| /de/en/book-and-manage/passenger-receipt-90days/confirmation 1440 | 3.97 | 7.65 | 1106 / 1086 | www 0 x 40, 1 x 60 (flow) |
| /de/en/traveltricks 1440 | 12.55 | 16.19 | 3759 / 3739 | www 0 x 40, 1 x 60 (flow) |
| /de/en/support/contact/contact-form-confirmation 1440 | 4.05 | 7.66 | 1129 / 1109 | www 0 x 40, 1 x 60 (flow) |
| /de/en/prepare-for-your-trip/baggage/travelling-with-animals/register-animal-cargo-hold/confirmation 1440 | 3.58 | 6.94 | 1208 / 1188 | www 0 x 40, 1 x 60 (flow) |
| /de/en/prepare-for-your-trip/baggage/travelling-with-animals/register-animal/confirmation 1440 | 3.58 | 6.94 | 1208 / 1188 | www 0 x 40, 1 x 60 (flow) |
| /de/en/prepare-for-your-trip/baggage/sport-baggage/register-sporting-firearm/confirmation 1440 | 3.62 | 6.97 | 1208 / 1188 | www 0 x 40, 1 x 60 (flow) |
| /de/en/carry-on-baggage 1440 | 7.32 | 10.62 | 6539 / 6479 | www 4 x 40, 1 x 60 (flow) |
| /de/en/addresses-worldwide 1440 | 3.29 | 6.54 | 1249 / 1229 | www 0 x 40, 1 x 60 (flow) |
| /de/en/baggage-irregularities 1440 | 10.91 | 13.85 | 3797 / 3757 | www 1 x 40, 1 x 60 (flow) |
| /de/en/tips-senior-travellers 1440 | 7.54 | 10.26 | 13133 / 13073 | www 1 x 40, 4 x 60 (flow) |
| /de/en/book-and-manage/passenger-receipt-90days/confirmation 390 | 7.12 | 9.75 | 1301 / 1281 | www 0 x 40, 1 x 60 (flow) |
| /de/en/prepare-for-your-trip/baggage/sport-baggage/register-sports-baggage/confirmation 1440 | 6.34 | 8.9 | 1431 / 1411 | www 0 x 40, 1 x 60 (flow) |
| /de/en/support/contact/contact-form-confirmation 390 | 6.73 | 9.24 | 1324 / 1304 | www 0 x 40, 1 x 60 (flow) |
| /de/en/prepare-for-your-trip/baggage/travelling-with-animals/register-animal-cargo-hold/confirmation 390 | 6.47 | 8.66 | 1565 / 1545 | www 0 x 40, 1 x 60 (flow) |
| /de/en/prepare-for-your-trip/baggage/travelling-with-animals/register-animal/confirmation 390 | 6.47 | 8.66 | 1565 / 1545 | www 0 x 40, 1 x 60 (flow) |
| /de/en/prepare-for-your-trip/baggage/sport-baggage/register-sporting-firearm/confirmation 390 | 6.58 | 8.77 | 1565 / 1545 | www 0 x 40, 1 x 60 (flow) |
| /de/en/prepare-for-your-trip/baggage/sport-baggage/register-sports-baggage/confirmation 390 | 6.16 | 8.27 | 1799 / 1779 | www 0 x 40, 1 x 60 (flow) |
| /de/en/traveltricks 390 | 19.78 | 21.89 | 4486 / 4466 | www 0 x 40, 1 x 60 (flow) |
| /de/en/premium-economy-class 1440 | 5 | 7.09 | 7077 / 7057 | www 1 x 40, 0 x 60 (flow) |
| /de/en/book-and-manage/stopover 390 | 17.3 | 19.3 | 17514 / 17314 | www 16 x 40, 0 x 60 (service) |
| /de/en/baggage-irregularities 390 | 9.69 | 11.41 | 5111 / 5071 | www 1 x 40, 1 x 60 (flow) |
| /de/en/special-meals 390 | 16.08 | 17.78 | 6988 / 6948 | www 2 x 40, 0 x 60 (flow) |
| /de/en/doctor-on-board-news 390 | 11.02 | 12.72 | 2352 / 2332 | www 0 x 40, 1 x 60 (service) |
| /de/en/book-and-manage/pax-receipt 390 | 6.93 | 8.55 | 2495 / 2475 | www 0 x 40, 0 x 60 (flow) |
| /de/en/doctor-on-board-news 1440 | 16.03 | 17.63 | 2366 / 2346 | www 0 x 40, 1 x 60 (service) |
| /de/en/lufthansa-express-rail 1440 | 6.02 | 7.57 | 7732 / 7692 | www 2 x 40, 0 x 60 (flow) |
| /de/en/europa-tarife-economy-class 390 | 7.03 | 8.55 | 7417 / 7377 | www 1 x 40, 1 x 60 (service) |
| /de/en/electronic-bag-tags 390 | 5.31 | 6.81 | 3804 / 3784 | www 1 x 40, 0 x 60 (flow) |
| /de/en/tips-senior-travellers 390 | 11.17 | 12.66 | 20300 / 20240 | www 1 x 40, 4 x 60 (flow) |
| /de/en/affiliatemarketing 1440 | 4.08 | 5.41 | 2803 / 2783 | www 0 x 40, 1 x 60 (flow) |
| /de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/travel-companion 390 | 12.93 | 14.26 | 8241 / 8221 | www 2 x 40, 0 x 60 (flow) |
| /de/en/unterhaltung-an-bord 1440 | 9.22 | 10.55 | 2918 / 2898 | www 2 x 40, 1 x 60 (flow) |
| /de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/travel-companion 1440 | 7.91 | 9.22 | 4832 / 4812 | www 2 x 40, 0 x 60 (flow) |
| /de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/hearing-impairment 1440 | 5.09 | 6.33 | 5346 / 5326 | www 2 x 40, 0 x 60 (flow) |
| /de/en/passenger-rights 390 | 5.34 | 6.57 | 9117 / 9097 | www 0 x 40, 1 x 60 (flow) |
| /de/en/electronic-bag-tags 1440 | 4.09 | 5.31 | 2849 / 2829 | www 1 x 40, 0 x 60 (flow) |
| /de/en/refund 390 | 3.12 | 4.3 | 3207 / 3187 | www 0 x 40, 1 x 60 (service) |
| /de/en/schengen 1440 | 6.23 | 7.41 | 3062 / 3042 | www 0 x 40, 1 x 60 (flow) |
| /de/en/airport-information 1440 | 5.93 | 7.09 | 3200 / 3180 | www 0 x 40, 1 x 60 (service) |
| /gb/en/airport-information 1440 | 5.94 | 7.09 | 3200 / 3180 | www 0 x 40, 1 x 60 (service) |
| /de/en/upgrades-at-online-check-in 390 | 9.01 | 10.15 | 3862 / 3842 | www 0 x 40, 1 x 60 (service) |
| /at/de/flughafeninformation 1440 | 5.58 | 6.72 | 3251 / 3231 | www 0 x 40, 1 x 60 (service) |
| /de/de/flughafeninformation 1440 | 5.58 | 6.72 | 3251 / 3231 | www 0 x 40, 1 x 60 (service) |
| /de/en/prepare-for-your-trip/baggage/baggage-irregularities/delayed-baggage-lhg 390 | 6.63 | 7.77 | 4417 / 4397 | www 0 x 40, 1 x 60 (flow) |
| /de/en/book-and-manage/pax-receipt 1440 | 3.01 | 4.12 | 2093 / 2073 | www 0 x 40, 0 x 60 (flow) |
| /de/en/book-and-manage/flights/helvetic 1440 | 3.62 | 4.71 | 5261 / 5241 | www 0 x 40, 1 x 60 (flow) |
| /de/en/farealert/best-price-alert 1440 | 13.33 | 14.39 | 4247 / 4227 | www 1 x 40, 0 x 60 (service) |
| /de/en/unterhaltung-an-bord 390 | 13.76 | 14.8 | 3561 / 3541 | www 2 x 40, 1 x 60 (flow) |
| /de/en/book-and-manage/flights/wetlease-hub 390 | 6.29 | 7.33 | 3382 / 3362 | www 0 x 40, 0 x 60 (flow) |
| /de/en/upgrades-at-online-check-in 1440 | 6.89 | 7.93 | 3183 / 3163 | www 0 x 40, 1 x 60 (service) |
| /de/en/lufthansa-express-rail 390 | 6.9 | 7.9 | 10814 / 10774 | www 2 x 40, 0 x 60 (flow) |
| /de/en/articles/explore-the-world 1440 | 5 | 5.97 | 6294 / 6274 | www 1 x 40, 0 x 60 (service) |
| /de/en/doctor-on-board 1440 | 3.69 | 4.65 | 3849 / 3829 | www 0 x 40, 1 x 60 (flow) |
| /de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/visual-impairment 1440 | 5.83 | 6.79 | 5756 / 5736 | www 2 x 40, 0 x 60 (flow) |
| /gb/en/airport-information 390 | 5.45 | 6.33 | 5470 / 5450 | www 0 x 40, 1 x 60 (service) |
| /de/en/airport-information 390 | 5.43 | 6.31 | 5470 / 5450 | www 0 x 40, 1 x 60 (service) |
| /de/en/passenger-rights 1440 | 3.5 | 4.37 | 5783 / 5763 | www 0 x 40, 1 x 60 (flow) |
| /de/en/tiere-als-handgepaeck 1440 | 6.72 | 7.57 | 4145 / 4125 | www 0 x 40, 1 x 60 (service) |
| /de/en/lufthansa-first-class-fleet 390 | 12.65 | 13.47 | 4227 / 4207 | www 1 x 40, 0 x 60 (flow) |
| /de/en/schengen 390 | 10.14 | 10.94 | 4448 / 4428 | www 0 x 40, 1 x 60 (flow) |
| /de/en/discover-lufthansa/miles-and-more-credit-card 1440 | 9.7 | 10.48 | 5074 / 5054 | www 1 x 40, 0 x 60 (flow) |
| /de/en/mobility-partner-program-healthcare 390 | 9.19 | 9.97 | 4698 / 4678 | www 0 x 40, 0 x 60 (service) |
| /de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/cognitive-impairment 1440 | 14.11 | 14.89 | 7188 / 7168 | www 2 x 40, 0 x 60 (flow) |
| /de/en/hotel-offers 390 | 11.09 | 11.85 | 4523 / 4503 | www 0 x 40, 0 x 60 (flow) |
| /de/en/doctor-on-board 390 | 6.63 | 7.31 | 4804 / 4784 | www 0 x 40, 1 x 60 (flow) |
| /de/en/discover-lufthansa/flightreservation-priceguarantee 390 | 10.53 | 11.17 | 4839 / 4819 | www 1 x 40, 0 x 60 (service) |
| /de/en/tiere-als-handgepaeck 390 | 5.66 | 6.3 | 5298 / 5278 | www 0 x 40, 1 x 60 (service) |
| /de/en/shopping 1440 | 8.62 | 9.22 | 5647 / 5627 | www 0 x 40, 1 x 60 (flow) |
| /de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/hearing-impairment 390 | 7.23 | 7.78 | 9762 / 9742 | www 2 x 40, 0 x 60 (flow) |
| /de/en/passengers-with-sensory-impairment 1440 | 5.69 | 6.23 | 8395 / 8375 | www 4 x 40, 0 x 60 (flow) |
| /de/en/farealert/best-price-alert 390 | 17.56 | 18.09 | 5260 / 5240 | www 1 x 40, 0 x 60 (service) |

## 7. Worse than today by more than 0.5 points: what is left, per page-width

Worst first. "First part": the first heading, block or section whose box ends elsewhere switched than today (its bottom in px; h: its height; w: its width). A heading whose padding moved to its section keeps its bottom and is skipped. "Theme": what the collapse handed to the theme on the document (marker kinds, counts); empty when every marker has a carrier.

| page-width | today | switched | + | height | first part | theme |
| --- | --- | --- | --- | --- | --- | --- |
| /de/en/first-class-terminal 1440 | 6.28 | 32.59 | 26.31 | -174 | head h2 "Your affairs in the best hands": bottom -92 | separator-from-768 3, separator 2 |
| /at/de/discover-lufthansa/new-onboard-experience 1440 | 4.46 | 24.4 | 19.94 | +70 | head h2 "Premium ist eine Haltung": bottom +60 | video 1 |
| /de/de/discover-lufthansa/new-onboard-experience 1440 | 4.46 | 24.35 | 19.89 | +70 | head h2 "Premium ist eine Haltung": bottom +60 | video 1 |
| /de/en/lufthansa-business-class-on-long-haul-routes 1440 | 6.46 | 23.29 | 16.83 | +98 | head h2 "Benefits of Business Class": bottom +98 (h -32) |  |
| /de/en/exclusive-charter 390 | 8.68 | 25.06 | 16.38 | +96 | head h2 "This might also be of interest to you": bottom +48 (h -20) |  |
| /gb/en/discover-lufthansa/new-onboard-experience 1440 | 6.18 | 21.16 | 14.98 | +50 | head h2 "Premium is a state of mind": bottom +40 | video 1 |
| /de/en/discover-lufthansa/new-onboard-experience 1440 | 6.19 | 21.13 | 14.94 | +50 | head h2 "Premium is a state of mind": bottom +40 | video 1 |
| /de/en/lufthansa-business-class-on-long-haul-routes 390 | 13.33 | 26.44 | 13.11 | +68 | head h2 "Benefits of Business Class": bottom +68 (h -32) |  |
| /de/en/100-years 390 | 19.68 | 32.68 | 13.00 | -81 | head h2 "Under the symbol of the crane": bottom -81 | text-width 1, indent 1 |
| /de/en/advance-seat-reservations-terms-and-conditions 1440 | 2.17 | 14.59 | 12.42 | +118 | block columns-media: bottom +98 (h +98) | text-size 4 |
| /de/de/articles/highlights/allegris-premium-economy-san-diego 1440 | 3.53 | 15.92 | 12.39 | +64 | head h2 "Zum Download des Posters einfach auf das": bottom +88 (h +39), w -210 | video 1 |
| /de/en/entryprocesses 1440 | 2.62 | 14.8 | 12.18 | +115 | head h2 "United Kingdom": bottom +75 (h +75) | heading-aligned 1, column 1 |
| /de/en/exclusive-charter 1440 | 4.86 | 16.8 | 11.94 | +96 | head h2 "This might also be of interest to you": bottom +48 (h -40) |  |
| /de/en/first-class-terminal 390 | 16.22 | 27.94 | 11.72 | -133 | head h2 "Your affairs in the best hands": bottom -41 | separator-from-768 3, separator 2 |
| /de/en/discover-lufthansa/take-off 390 | 4.75 | 16.4 | 11.65 | -16 | head h2 "Ready to hand – 8 kg carry-on baggage": bottom -16 | separator 1 |
| /de/en/book-and-manage/additional-services/get-your-guide 1440 | 1.01 | 12.36 | 11.35 | +137 | head h2 "How to earn miles with GetYourGuide": bottom +62 | text-width 2 |
| /de/en/discover-lufthansa/take-off 1440 | 1.76 | 12.83 | 11.07 | -16 | head h2 "Ready to hand – 8 kg carry-on baggage": bottom -16 | separator 1 |
| /gb/en/articles/highlights/allegris-premium-economy-san-diego 1440 | 3.65 | 14.68 | 11.03 | +25 | head h2 "To download the poster, simply click on ": bottom +49, w -210 | video 1 |
| /at/de/articles/highlights/allegris-premium-economy-san-diego 1440 | 4.9 | 15.92 | 11.02 | +64 | head h2 "Zum Download des Posters einfach auf das": bottom +88 (h +39), w -210 | video 1 |
| /de/en/farealert/best-price-alert 1440 | 3.6 | 14.39 | 10.79 | -134 | head h2 "Activate price tracking": bottom -43 | heading-aligned 4 |
| /de/en/traveltricks 390 | 11.11 | 21.89 | 10.78 | -62 | head h2 "Step 1: Download the Lufthansa app": bottom -38 (h -38) | heading-aligned 3 |
| /de/en/doctor-on-board-news 1440 | 7.31 | 17.63 | 10.32 | -94 | head h2 "This may also interest you": bottom -64 | column 2 |
| /de/en/terms-of-service-group 390 | 4.75 | 14.94 | 10.19 | -182 | head h2 "Austrian Airlines": bottom -26 | separator-in-block 7 |
| /de/en/farealert/best-price-alert 390 | 7.91 | 18.09 | 10.18 | -141 | head h2 "Activate price tracking": bottom -26 | heading-aligned 4 |
| /de/en/childrens-menus-on-board 1440 | 0.91 | 11 | 10.09 | +105 | head h2 "Baby food": bottom +48 (h -32) | text-width 2, heading-aligned 1 |
| /de/en/terms-of-use 1440 | 2.23 | 12.09 | 9.86 | +277 | head h2 "2. Proprietary rights": bottom +32 |  |
| /de/en/sepa-terms-and-conditions 1440 | 1.01 | 10.8 | 9.79 | +72 | head h2 "Address disclosure authorisation": bottom +8 |  |
| /de/en/check-in-with-the-family 390 | 2.95 | 12.72 | 9.77 | -16 | head h2 "Simply check in from home or en route": bottom -16 (h -32) |  |
| /de/en/advance-seat-reservation 390 | 12.01 | 21.71 | 9.70 | +204 | head h2 "How do I reserve a seat?": bottom -16 (h -32) | text-size 18, separator-in-block 17, heading 2, text-width 1 |
| /de/en/advance-seat-reservations-terms-and-conditions 390 | 5.53 | 15.22 | 9.69 | +125 | block columns-media: bottom +105 (h +105) | text-size 4 |
| /gb/en/articles/highlights/allegris-premium-economy-san-diego 390 | 5.63 | 15.15 | 9.52 | +50 | head h2 "To download the poster, simply click on ": bottom +50 | video 1 |
| /de/en/lufthansa-first-class-fleet 390 | 4.2 | 13.47 | 9.27 | -26 | head h2 "Lufthansa Allegris First Class on the A3": bottom -16 (h -20) |  |
| /de/en/first-class 1440 | 8.83 | 18.01 | 9.18 | -272 | head h2 "First Class Lounge": bottom +20 | separator-below-768 11, heading-aligned 2, video 1 |
| /gb/en/articles/tags/allegris 390 | 3.94 | 13.09 | 9.15 | +97 | head h1 "All Articles on Lufthansa Allegris": bottom +50 | video 1, text-size 0 |
| /de/en/terms-of-service-group 1440 | 4.54 | 13.66 | 9.12 | -104 | head h2 "Austrian Airlines": bottom -26 | separator-in-block 7 |
| /de/en/articles/highlights/allegris-premium-economy-san-diego 390 | 6.72 | 15.78 | 9.06 | +50 | head h2 "To download the poster, simply click on ": bottom +50 | video 1 |
| /de/de/articles/highlights/allegris-premium-economy-san-diego 390 | 4.82 | 13.87 | 9.05 | +50 | head h2 "Zum Download des Posters einfach auf das": bottom +50 | video 1 |
| /de/en/entryprocesses 390 | 5.51 | 14.54 | 9.03 | +58 | head h2 "United Kingdom": bottom +16 (h +16) | heading-aligned 1, column 1 |
| /de/en/100-years/cabin-design 1440 | 5.88 | 14.81 | 8.93 | +135 | head h2 "Sublime salons – the beginnings of comfo": bottom +20 |  |
| /de/en/cancellations-and-refunds 1440 | 3.54 | 12.42 | 8.88 | -29 | head h2 "Options for your refund": bottom -16 (h -32) |  |
| /de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/special-needs-online-form/confirmation 1440 | 2.37 | 11.2 | 8.83 | -45 | section section: bottom -45 (h -45) | separator 1 |
| /de/en/childrens-menus-on-board 390 | 6.09 | 14.88 | 8.79 | +113 | head h2 "Baby food": bottom +48 (h -32) | text-width 2, heading-aligned 1 |
| /de/en/articles/highlights/allegris-premium-economy-san-diego 1440 | 8.12 | 16.89 | 8.77 | +25 | head h2 "To download the poster, simply click on ": bottom +49, w -210 | video 1 |
| /de/en/special-meals 1440 | 8.35 | 17.12 | 8.77 | +221 | head h2 "Dietary meals": bottom +87 (h -32) | column 2 |
| /at/de/articles/highlights/allegris-premium-economy-san-diego 390 | 5.55 | 14.3 | 8.75 | +50 | head h2 "Zum Download des Posters einfach auf das": bottom +50 | video 1 |
| /de/en/book-and-manage/additional-services/travel-insurances 1440 | 10.23 | 18.66 | 8.43 | +107 | head h2 "Travel Guard* - Travel Care": bottom +8 | text-width 4, heading 1, text-size 1 |
| /de/en/faq-data-security 1440 | 0.97 | 9.2 | 8.23 | +48 | section section.breadcrumb-container.accordion-columns-container: bottom -413 (h -413) |  |
| /de/en/faq-password-security 1440 | 0.9 | 9.09 | 8.19 | +48 | section section.breadcrumb-container.accordion-columns-container: bottom -298 (h -298) |  |
| /de/en/sepa-terms-and-conditions 390 | 3.75 | 11.82 | 8.07 | +72 | head h2 "Address disclosure authorisation": bottom +8 |  |
| /de/en/320 390 | 5.75 | 13.7 | 7.95 | -37 | head h2 "Trusted, modern, comfortable": bottom -37 |  |
| /de/en/secure-flight 1440 | 1.54 | 9.42 | 7.88 | +48 | section section.breadcrumb-container: bottom -336 (h -336) |  |
| /de/en/articles/explore-the-world/a-perfect-day-barcelona-in-one-day 1440 | 3.07 | 10.75 | 7.68 | -12 | head h2 "This may also be of interest to you": bottom +27 | separator 7, heading 1, separator-from-768 1 |
| /de/en/check-in-with-the-family 1440 | 1.74 | 9.11 | 7.37 | -16 | head h2 "Simply check in from home or en route": bottom -16 (h -32) |  |
| /de/en/upgrade-options 1440 | 4.52 | 11.88 | 7.36 | -16 | head h2 "One journey – and lots of options for fl": bottom -39 (h -71), w +430 | heading 1, text-width 1 |
| /de/en/sepa-terms-and-conditions-b 1440 | 2.86 | 10.15 | 7.29 | +72 | head h2 "Authorisation for direct debiting in two": bottom 0 (h -40), w +430 | heading 1 |
| /de/en/support/contact/passenger-duty-united-kingdom 390 | 6.22 | 13.49 | 7.27 | +61 | head h1 "Exemptions and refund": bottom +49 (h +49) | heading-aligned 1 |
| /de/en/lufthansa-corporate-customers 1440 | 2.61 | 9.7 | 7.09 | +32 | head h2 "Lufthansa provides corporate and busines": bottom -16 (h -40), w +430 | heading 1 |
| /de/en/travelling-with-children 390 | 10.7 | 17.69 | 6.99 | -56 | head h2 "Planning your trip": bottom -16 (h -32) | heading 1 |
| /de/en/prepare-for-your-trip/baggage/sport-baggage/register-sports-baggage/confirmation 1440 | 2.08 | 8.9 | 6.82 | -54 | section section.breadcrumb-container: bottom -280 (h -280) |  |
| /de/en/articles/tags 1440 | 1.2 | 7.97 | 6.77 | -25 | head h2 "Explore more": bottom -24 | heading 2 |
| /de/en/travelling-with-children 1440 | 5.75 | 12.5 | 6.75 | -56 | head h2 "Planning your trip": bottom -16 (h -32), w +430 | heading 1 |
| /de/en/support/contact/contact-form-confirmation 1440 | 0.98 | 7.66 | 6.68 | -30 | section section: bottom -30 (h -30) |  |
| /de/en/articles/explore-the-world/eat-see-do-berlin 390 | 8.46 | 15.04 | 6.58 | +28 | block columns-media: bottom +28 |  |
| /de/en/terms-of-use 390 | 6.07 | 12.64 | 6.57 | +277 | head h2 "2. Proprietary rights": bottom +32 |  |
| /de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/special-needs-online-form/confirmation 390 | 5.32 | 11.87 | 6.55 | -45 | section section: bottom -45 (h -45) | separator 1 |
| /de/en/special-meals 390 | 11.3 | 17.78 | 6.48 | -70 | head h2 "Dietary meals": bottom -10 (h -32) | column 2 |
| /de/en/articles/explore-the-world/a-perfect-day-berlin-in-one-day 1440 | 2.69 | 9.07 | 6.38 | -11 | head h2 "Our recommendations": bottom +25 | separator 7, separator-from-768 1 |
| /de/en/meetings-and-events-organisers 1440 | 2.19 | 8.41 | 6.22 | +112 | section section.breadcrumb-container: bottom -1323 (h -1323) | column 1, text-size 0 |
| /de/en/32n 390 | 7.39 | 13.59 | 6.20 | -76 | head h2 "The quietest cabin in its class": bottom -13 | column 1 |
| /de/en/rail-and-fly 1440 | 2.12 | 8.32 | 6.20 | +119 | head h2 "Book Rail&Fly directly with your flight": bottom -8 (h -32) | column 1 |
| /at/de/articles/tags/allegris 390 | 5.96 | 12.12 | 6.16 | +75 | head h2 "Alle Artikel zu Lufthansa Allegris": bottom +32 (h -18) | video 1, heading-aligned 1, text-size 0 |
| /de/de/articles/tags/allegris 390 | 5.96 | 12.12 | 6.16 | +75 | head h2 "Alle Artikel zu Lufthansa Allegris": bottom +32 (h -18) | video 1, heading-aligned 1, text-size 0 |
| /de/en/cancellations-and-refunds 390 | 7.68 | 13.84 | 6.16 | +11 | head h2 "Options for your refund": bottom -16 (h -32) |  |
| /de/en/articles/tags/allegris 390 | 3.88 | 10.03 | 6.15 | +47 | head h1 "All Articles on Lufthansa Allegris": bottom +50 | video 1, text-size 0 |
| /de/en/menus-on-long-haul-flights 1440 | 1.88 | 8 | 6.12 | -25 | block columns-media: bottom +15 | column 2 |
| /de/en/my-logbook 1440 | 4.58 | 10.67 | 6.09 | +32 | head h2 "Welcome on board!": bottom -16 (h -32) |  |
| /de/en/book-and-manage/additional-services/travel-insurances 390 | 11 | 16.99 | 5.99 | +77 | head h2 "Travel Guard* - Travel Care": bottom +8 | text-width 4, heading 1, text-size 1 |
| /de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/travel-companion 390 | 8.38 | 14.26 | 5.88 | -27 | head h2 "Further information on travel and health": bottom -75 (h -32) | heading-aligned 1 |
| /de/en/book-and-manage/passenger-receipt-90days/confirmation 1440 | 1.79 | 7.65 | 5.86 | -30 | section section: bottom -30 (h -30) |  |
| /de/en/onboard-delights 1440 | 4.84 | 10.69 | 5.85 | +82 | head h2 "Pre-order now": bottom +8 | text-width 3, column 1, separator 1 |
| /de/en/upgrades-at-online-check-in 390 | 4.36 | 10.15 | 5.79 | -78 | head h2 "Upgrade benefits": bottom -16 (h -32) |  |
| /de/en/hotel-offers 1440 | 4.8 | 10.45 | 5.65 | +66 | head h2 "Be inspired": bottom +6 (h -32) | separator-in-block 1 |
| /de/en/during-your-trip/food-and-beverages/onboard-delights/faq 1440 | 1.08 | 6.71 | 5.63 | +48 | section section.breadcrumb-container.accordion-columns-container: bottom -1025 (h -1025) |  |
| /de/en/flight-disruptions 390 | 8.94 | 14.57 | 5.63 | +67 | head h2 "Rapid help in the event of delay or canc": bottom +7 | video 2, heading-aligned 1, column 1 |
| /de/en/book-and-manage/passenger-receipt-90days/confirmation 390 | 4.17 | 9.75 | 5.58 | -30 | section section: bottom -30 (h -30) |  |
| /de/en/first-class-personal-assistant 1440 | 0.96 | 6.54 | 5.58 | +48 | section section.breadcrumb-container: bottom -908 (h -908) |  |
| /de/en/faq-data-security 390 | 3.32 | 8.87 | 5.55 | +48 | section section.breadcrumb-container.accordion-columns-container: bottom -469 (h -469) |  |
| /de/en/business-terms-and-conditions 1440 | 2.32 | 7.77 | 5.45 | +48 | section section.breadcrumb-container: bottom -878 (h -878) |  |
| /de/en/faq-password-security 390 | 3.82 | 9.25 | 5.43 | +48 | section section.breadcrumb-container.accordion-columns-container: bottom -314 (h -314) |  |
| /de/en/upgrade-to-premium-economy-class 1440 | 4.96 | 10.39 | 5.43 | +68 | head h2 "How to book your upgrade": bottom +19 | separator 1 |
| /de/en/general-conditions-currency-conversion 1440 | 0.94 | 6.34 | 5.40 | +48 | section section.breadcrumb-container: bottom -366 (h -366) |  |
| /de/en/prepare-for-your-trip/baggage/travelling-with-animals/register-animal-cargo-hold/confirmation 1440 | 1.59 | 6.94 | 5.35 | -30 | section section: bottom -30 (h -30) |  |
| /de/en/prepare-for-your-trip/baggage/travelling-with-animals/register-animal/confirmation 1440 | 1.59 | 6.94 | 5.35 | -30 | section section: bottom -30 (h -30) |  |
| /de/en/prepare-for-your-trip/baggage/sport-baggage/register-sporting-firearm/confirmation 1440 | 1.63 | 6.97 | 5.34 | -30 | section section: bottom -30 (h -30) |  |
| /de/en/book-and-manage/stopover 390 | 14 | 19.3 | 5.30 | -134 | head h2 "Exclusive offers for stopover passengers": bottom -69 (h -57) | heading-aligned 2, heading 1, text-width 1, separator-in-block 1 |
| /de/en/upgrades-at-online-check-in 1440 | 2.76 | 7.93 | 5.17 | -94 | head h2 "Upgrade benefits": bottom -16 (h -32) |  |
| /de/en/shopping 1440 | 4.07 | 9.22 | 5.15 | -63 | head h2 "You decide: your selection, your locatio": bottom -43 | separator-from-768 1, separator-below-768 1 |
| /de/en/lufthansa-first-class-entertainment 390 | 4.22 | 9.35 | 5.13 | +23 | head h2 "When your flight time turns into great e": bottom -16 (h -20) | text-size 1 |
| /de/en/support/contact/contact-form-confirmation 390 | 4.11 | 9.24 | 5.13 | -30 | section section: bottom -30 (h -30) |  |
| /de/en/travelling-with-special-requirements 1440 | 0.96 | 6.09 | 5.13 | +48 | section section.breadcrumb-container.columns-media-container: bottom -1129 (h -1129) |  |
| /gb/en/articles/tags/allegris 1440 | 9.04 | 14.17 | 5.13 | +117 | head h1 "All Articles on Lufthansa Allegris": bottom +50 | video 1, text-size 0 |
| /de/en/book-and-manage/digital-self-services/airline-apps 1440 | 2.22 | 7.34 | 5.12 | +48 | section section.breadcrumb-container.columns-media-container: bottom -547 (h -547) |  |
| /de/en/online-check-in-info 1440 | 3.34 | 8.39 | 5.05 | +94 | head h2 "Check in conveniently online now": bottom -16 (h -40) | text-width 2 |
| /de/en/book-and-manage/additional-services/get-your-guide 390 | 3.87 | 8.86 | 4.99 | +56 | head h2 "How to earn miles with GetYourGuide": bottom +8 | text-width 2 |
| /de/en/prepare-for-your-trip/baggage/baggage-irregularities/faq-damaged-baggage 1440 | 1.15 | 6.11 | 4.96 | +48 | section section.breadcrumb-container.accordion-columns-container: bottom -1327 (h -1327) |  |
| /de/en/datenschutz 390 | 7.83 | 12.73 | 4.90 | +48 | section section.breadcrumb-container: bottom -580 (h -580) |  |
| /de/en/baggage-irregularities 1440 | 8.98 | 13.85 | 4.87 | -77 | head h2 "Procedure for delayed baggage": bottom -25 | video 2, separator-in-block 2 |
| /de/en/discover-lufthansa/carbon-offsetting/saf 1440 | 3.31 | 8.08 | 4.77 | +88 | head h2 "Why does SAF reduce CO₂ emissions by at ": bottom +8 | text-size 0 |
| /de/en/seat-maps 390 | 7.39 | 12.16 | 4.77 | -66 | head h2 "Boeing": bottom -53 |  |
| /de/en/traveltricks 1440 | 11.43 | 16.19 | 4.76 | -14 | head h2 "Step 1: Download the Lufthansa app": bottom -33 (h -53) | heading-aligned 3 |
| /de/en/sepa-terms-and-conditions-b 390 | 6.14 | 10.88 | 4.74 | +72 | head h2 "Address disclosure authorisation": bottom +8 | heading 1 |
| /de/en/travel-expense-management 390 | 3.91 | 8.6 | 4.69 | +32 | head h2 "The benefits of the Lufthansa Travel & E": bottom -16 (h -20) |  |
| /de/en/prepare-for-your-trip/baggage/sport-baggage/register-sporting-firearm/confirmation 390 | 4.12 | 8.77 | 4.65 | -30 | section section: bottom -30 (h -30) |  |
| /de/en/prepare-for-your-trip/baggage/travelling-with-animals/register-animal-cargo-hold/confirmation 390 | 4.02 | 8.66 | 4.64 | -30 | section section: bottom -30 (h -30) |  |
| /de/en/prepare-for-your-trip/baggage/travelling-with-animals/register-animal/confirmation 390 | 4.02 | 8.66 | 4.64 | -30 | section section: bottom -30 (h -30) |  |
| /de/en/articles/explore-the-world/eat-see-do-algiers 390 | 9.38 | 14.01 | 4.63 | +28 | block columns-media: bottom +28 |  |
| /at/de/100-years/destinations 1440 | 0.71 | 5.33 | 4.62 | +8 | head h2 "Rio de Janeiro: Feiern wie die Weltmeist": bottom +8 | video 1 |
| /de/de/100-years/destinations 1440 | 0.71 | 5.33 | 4.62 | +8 | head h2 "Rio de Janeiro: Feiern wie die Weltmeist": bottom +8 | video 1 |
| /de/en/359 390 | 6.09 | 10.61 | 4.52 | -82 | head h2 "Seat map of the Airbus A350-900": bottom -8 (h -20) | column 2 |
| /de/en/articles/explore-the-world/a-perfect-day-berlin-in-one-day 390 | 10.01 | 14.53 | 4.52 | +44 | block columns-media: bottom +52 | separator 7, separator-from-768 1 |
| /de/en/100-years/destinations 1440 | 0.78 | 5.25 | 4.47 | +8 | head h2 "Rio de Janeiro: Party like World Cup win": bottom +8 | video 1 |
| /gb/en/100-years/destinations 1440 | 0.78 | 5.25 | 4.47 | +8 | head h2 "Rio de Janeiro: Party like World Cup win": bottom +8 | video 1 |
| /de/en/first-class-valet-parking-service 1440 | 2.15 | 6.53 | 4.38 | +32 | head h2 "For your rental or private car: valet pa": bottom -16 (h -40) | text-width 1 |
| /de/en/100-years/cabin-design 390 | 13.28 | 17.61 | 4.33 | +135 | head h2 "Sublime salons – the beginnings of comfo": bottom +20 |  |
| /de/en/dangerous-dogs 1440 | 3 | 7.31 | 4.31 | +48 | section section.breadcrumb-container.accordion-columns-container: bottom -1377 (h -1377) |  |
| /de/en/fliegen-mit-baby 390 | 3.3 | 7.59 | 4.29 | -16 | heads 0 -> 3 |  |
| /de/en/menus-travel-classes 1440 | 1.58 | 5.87 | 4.29 | +48 | section section.breadcrumb-container.columns-media-container: bottom -1174 (h -1174) |  |
| /de/en/schengen 390 | 6.8 | 10.94 | 4.14 | -80 | head h2 "Entry into the “Schengen Area” in Europe": bottom -32 (h -32) | column 2 |
| /de/en/common/imprint/lufthansa-insights-imprint 1440 | 1.75 | 5.85 | 4.10 | -51 | head h2 "Publishing support, design and productio": bottom -51 | separator-in-block 2 |
| /de/en/prepare-for-your-trip/baggage/baggage-irregularities/faq-baggage-delay 390 | 8.15 | 12.25 | 4.10 | +59 | head h2 "Delayed baggage": bottom +7 (h -25) | heading 3, heading-aligned 1 |
| /de/en/security-check-time-slot 1440 | 2.6 | 6.67 | 4.07 | +56 | head h2 "All the airports with time-slot access t": bottom +48 |  |
| /de/en/common/imprint/lufthansa-insights-imprint 390 | 4.54 | 8.58 | 4.04 | -102 | head h2 "Registered office": bottom -51 | separator-in-block 2 |
| /de/en/advance-seat-reservation 1440 | 7.71 | 11.72 | 4.01 | +18 | head h2 "How do I reserve a seat?": bottom -16 (h -32) | text-size 18, separator-in-block 17, heading 2, text-width 1 |
| /de/en/book-and-manage/flights/ana 390 | 8.35 | 12.35 | 4.00 | -58 | head h2 "What you need to remember": bottom -58 (h -58) |  |
| /de/en/lufthansa-aviation-group 1440 | 5.38 | 9.37 | 3.99 | +48 | section section.breadcrumb-container.columns-media-container: bottom -1761 (h -1761) |  |
| /at/de/miles-and-more 390 | 5.03 | 9.01 | 3.98 | -51 | block carousel-cards: bottom -51 |  |
| /de/de/miles-and-more 390 | 5.04 | 9.01 | 3.97 | -51 | block carousel-cards: bottom -51 |  |
| /de/en/tips-senior-travellers 1440 | 6.3 | 10.26 | 3.96 | -93 | head h2 "At the airport": bottom -20 | heading-aligned 3, separator-in-block 1, separator 1, separator-from-768 1 |
| /de/en/menus-on-long-haul-flights 390 | 3.46 | 7.41 | 3.95 | -20 | head h2 "The menu on your Lufthansa flight": bottom -20 (h -20) | column 2 |
| /de/en/travel-agencies 1440 | 2.68 | 6.62 | 3.94 | +48 | section section.breadcrumb-container.columns-media-container: bottom -819 (h -819) |  |
| /de/en/first-class-personal-assistant 390 | 2.39 | 6.31 | 3.92 | +24 | head h2 "First Class": bottom +24 |  |
| /de/en/upgrade-business-class-long-haul 1440 | 4.95 | 8.79 | 3.84 | +48 | head h2 "Further information about your upgrade": bottom +48, w -326 | text-width 1 |
| /de/en/upgrade-premium-economy-class 1440 | 4.67 | 8.5 | 3.83 | +48 | head h2 "Further information about your upgrade": bottom +48, w -326 | text-width 1 |
| /de/en/mobility-partner-program-healthcare 390 | 6.15 | 9.97 | 3.82 | -66 | head h2 "Health & Medical Agreement": bottom -16 (h -32) | column 1, separator-below-768 1 |
| /de/en/upgrade-to-business-class 1440 | 4.72 | 8.54 | 3.82 | +48 | section section.breadcrumb-container.accordion-columns-container: bottom -842 (h -842) | heading-no-choice 1, text-width 1 |
| /de/en/feedback 1440 | 2.47 | 6.27 | 3.80 | +55 | head h2 "Baggage irregularities: reimbursement of": bottom +34 | text-width 2 |
| /de/en/32n 1440 | 2.37 | 6.14 | 3.77 | -26 | head h2 "Seat maps Airbus A320neo": bottom +6 (h -32) | column 1 |
| /de/en/mobility-partner-program-healthcare 1440 | 7.83 | 11.59 | 3.76 | -40 | head h2 "Health & Medical Agreement": bottom -16 (h -32) | column 1, separator-below-768 1 |
| /de/en/business-class-on-short-and-medium-haul 1440 | 2.69 | 6.44 | 3.75 | +48 | section section.breadcrumb-container.columns-media-container: bottom -1835 (h -1835) |  |
| /de/en/meetings-and-events-organisers 390 | 6.29 | 10.03 | 3.74 | +88 | head h2 "Lufthansa Group Meetings & Events": bottom +88 | column 1, text-size 0 |
| /de/de/flughafeninformation 1440 | 3.06 | 6.72 | 3.66 | -51 | section grey.section: bottom -21 (h -21) | separator 1 |
| /at/de/flughafeninformation 1440 | 3.07 | 6.72 | 3.65 | -51 | section grey.section: bottom -21 (h -21) | separator 1 |
| /de/en/discover-lufthansa/carbon-offsetting/saf 390 | 6.59 | 10.18 | 3.59 | +88 | head h2 "Why does SAF reduce CO₂ emissions by at ": bottom +8 | text-size 0 |
| /de/en/lufthansa-express 1440 | 6.29 | 9.88 | 3.59 | +104 | head h2 "Lufthansa Express – your ticket to the w": bottom -16 (h -32) |  |
| /de/en/articles/explore-the-world/essentials-barcelona-facts 390 | 7.37 | 10.95 | 3.58 | +28 | block columns-media: bottom +28 | separator 1 |
| /de/en/book-and-manage/stopover 1440 | 11.82 | 15.36 | 3.54 | -35 | head h2 "Turn your Stopover into an adventure": bottom +10 | heading-aligned 2, heading 1, text-width 1, separator-in-block 1 |
| /de/en/imprint 1440 | 3.57 | 7.1 | 3.53 | +32 | head h2 "Management Board": bottom +32 | text-size 3 |
| /de/en/during-your-trip/food-and-beverages/onboard-delights/faq 390 | 2.62 | 6.14 | 3.52 | +48 | section section.breadcrumb-container.accordion-columns-container: bottom -1372 (h -1372) |  |
| /de/en/articles/tags 390 | 2.85 | 6.36 | 3.51 | -4 | head h2 "Explore more": bottom -4 | heading 2 |
| /de/en/seat-maps 1440 | 3.59 | 7.1 | 3.51 | -43 | head h2 "Boeing": bottom -34 |  |
| /de/en/upgrade-to-premium-economy-class 390 | 10.19 | 13.68 | 3.49 | +23 | head h2 "How to book your upgrade": bottom -25 | separator 1 |
| /de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/travel-companion 1440 | 5.84 | 9.22 | 3.38 | -37 | head h2 "Further information on travel and health": bottom -84 (h -32) | heading-aligned 1 |
| /de/en/first-class-comfort 1440 | 4.84 | 8.18 | 3.34 | +48 | section section.breadcrumb-container: bottom -1230 (h -1230) | text-width 1 |
| /de/en/carry-on-baggage 1440 | 7.32 | 10.62 | 3.30 | -47 | head h2 "Other items of baggage allowed in the ca": bottom -30 | text-width 3, video 1, separator-from-768 1 |
| /de/en/prepare-for-your-trip/baggage/baggage-irregularities/faq-damaged-baggage 390 | 3.02 | 6.31 | 3.29 | +48 | section section.breadcrumb-container.accordion-columns-container: bottom -1557 (h -1557) |  |
| /de/en/lufthansa-at-duesseldorf-airport 390 | 3.27 | 6.55 | 3.28 | +8 | head h2 "The Lufthansa terminal at Dusseldorf Air": bottom -16 (h -20) | text-width 2 |
| /de/en/airport-information 1440 | 3.83 | 7.09 | 3.26 | -50 | section grey.section: bottom -20 (h -20) | separator 1 |
| /de/en/baggage-irregularities 390 | 8.15 | 11.41 | 3.26 | -77 | head h2 "Procedure for delayed baggage": bottom -25 | video 2, separator-in-block 2 |
| /gb/en/airport-information 1440 | 3.84 | 7.09 | 3.25 | -50 | section grey.section: bottom -20 (h -20) | separator 1 |
| /de/en/addresses-worldwide 1440 | 3.29 | 6.54 | 3.25 | -20 | section section.breadcrumb-container.accordion-columns-container: bottom -20 (h -20) |  |
| /de/en/articles/explore-the-world/eat-see-do-berlin 1440 | 4.87 | 8.11 | 3.24 | -13 | block columns-media: bottom -13 |  |
| /de/en/lufthansa-at-duesseldorf-airport 1440 | 1.76 | 4.97 | 3.21 | +32 | head h2 "The Lufthansa terminal at Dusseldorf Air": bottom -16 (h -40) | text-width 2 |
| /de/en/prepare-for-your-trip/baggage/sport-baggage/register-sports-baggage/confirmation 390 | 5.06 | 8.27 | 3.21 | -30 | section section.breadcrumb-container: bottom -267 (h -267) |  |
| /de/en/my-bookings 1440 | 1.2 | 4.37 | 3.17 | -48 | block cards-teaser: bottom -17 (h -17) | heading 5 |
| /de/en/pre-check-in 1440 | 3.29 | 6.41 | 3.12 | +52 | head h2 "A relaxed take-off with late-night check": bottom -16 (h -32) |  |
| /de/en/doctor-on-board-news 390 | 9.61 | 12.72 | 3.11 | -54 | head h2 "This may also interest you": bottom -24 | column 2 |
| /de/en/upgrade-first-class 1440 | 4.76 | 7.84 | 3.08 | +39 | section section.breadcrumb-container.accordion-columns-container: bottom -842 (h -842) | text-width 1 |
| /de/en/tiere-als-handgepaeck 1440 | 4.5 | 7.57 | 3.07 | -70 | head h2 "Checklist": bottom -40 (h -32) | text-width 2 |
| /de/en/children-on-board 1440 | 4.53 | 7.56 | 3.03 | -27 | head h2 "Flying with baby": bottom -27 | text-width 1 |
| /de/en/general-conditions-currency-conversion 390 | 2.52 | 5.53 | 3.01 | +48 | section section.breadcrumb-container: bottom -409 (h -409) |  |
| /de/en/articles/explore-flying/7-people-who-shaped-lufthansa-history 390 | 3.35 | 6.33 | 2.98 | +2 | no box moved (pictures, text, colour) | separator 1 |
| /de/en/secure-flight 390 | 3.51 | 6.49 | 2.98 | +24 | head h2 "Entry regulations": bottom +24 |  |
| /de/en/lufthansa-express 390 | 8.56 | 11.52 | 2.96 | +104 | head h2 "Lufthansa Express – your ticket to the w": bottom -16 (h -32) |  |
| /de/en/passengers-with-sensory-impairment 1440 | 3.28 | 6.23 | 2.95 | -72 | head h2 "cabinblu – Fly Above It All": bottom -29 | heading-aligned 1 |
| /de/en/imprint 390 | 7.07 | 10.01 | 2.94 | +65 | head h2 "Registration": bottom +65 | text-size 3 |
| /de/en/onboard-delights 390 | 10.99 | 13.91 | 2.92 | +82 | head h2 "Pre-order now": bottom +8 | text-width 3, column 1, separator 1 |
| /de/en/arrival-services 390 | 6.74 | 9.58 | 2.84 | 0 | head h2 "From the aircraft straight to the termin": bottom -16 (h -32) | text-size 0 |
| /de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/hearing-impairment 390 | 4.94 | 7.78 | 2.84 | -17 | block columns-media: bottom +7 |  |
| /de/en/first-class 390 | 16.73 | 19.52 | 2.79 | -324 | head h2 "The First Class Terminal": bottom -59 | separator-below-768 11, heading-aligned 2, video 1 |
| /de/en/schengen 1440 | 4.63 | 7.41 | 2.78 | -80 | head h2 "Entry into the “Schengen Area” in Europe": bottom -32 (h -32) | column 2 |
| /de/en/articles/explore-the-world/a-perfect-day-barcelona-in-one-day 390 | 11.35 | 14.11 | 2.76 | +42 | block columns-media: bottom +49 | separator 7, heading 1, separator-from-768 1 |
| /de/en/data-collection-canada 390 | 9.93 | 12.65 | 2.72 | +63 | head h2 "Requirements for entry or transit in Can": bottom -16 (h -20) | separator-in-block 1 |
| /de/en/articles/explore-flying/anniversary-super-crane-special 390 | 10.79 | 13.45 | 2.66 | +13 | head h2 "An Iconic Design to Celebrate Lufthansa’": bottom +21 | separator 5, separator-from-768 1, separator-below-768 1 |
| /de/en/flight-disruptions 1440 | 3.5 | 6.16 | 2.66 | +25 | head h2 "Rapid help in the event of delay or canc": bottom +7 | video 2, heading-aligned 1, column 1 |
| /de/en/support/feedback-and-contact-airlines 1440 | 3.53 | 6.19 | 2.66 | -18 | block columns-media: bottom -18 (h -18) |  |
| /de/en/prepare-for-your-trip/travel-classes/economy-basic 1440 | 3.23 | 5.86 | 2.63 | -20 | head h2 "Baggage in Economy Basic Fare": bottom -20 | heading-aligned 1 |
| /de/en/payment-options-at-the-airport 1440 | 0.94 | 3.56 | 2.62 | +28 | section section.breadcrumb-container.columns-media-container: bottom -1092 (h -1092) | text-width 3 |
| /de/en/support/feedback-and-contact-airlines 390 | 7.41 | 10.03 | 2.62 | -46 | block columns-media: bottom -47 (h -47) |  |
| /de/en/359 1440 | 2.51 | 5.11 | 2.60 | -33 | head h2 "Seat map of the Airbus A350-900": bottom -8 (h -40) | column 2 |
| /de/en/business-terms-and-conditions 390 | 4.68 | 7.28 | 2.60 | +48 | heads 0 -> 1 |  |
| /de/en/book-and-manage/cancellation-and-refund/refund/refund-form 390 | 7.31 | 9.88 | 2.57 | +69 | head h2 "General information": bottom +84 | text-size 1 |
| /de/en/travelling-with-animals 390 | 4.53 | 7.07 | 2.54 | -16 | head h2 "A good trip for your precious pet": bottom -16 (h -32) | column 1 |
| /de/en/menus-travel-classes 390 | 3.97 | 6.5 | 2.53 | +48 | section section.breadcrumb-container.columns-media-container: bottom -1767 (h -1767) |  |
| /de/en/discover-lufthansa/lufthansa-fleet/351 1440 | 4.88 | 7.4 | 2.52 | +27 | head h2 "Around the world with Allegris": bottom +27 | text-width 1 |
| /de/en/travelling-with-animals 1440 | 1.61 | 4.13 | 2.52 | +8 | head h2 "A good trip for your precious pet": bottom -16 (h -32) | column 1 |
| /de/en/articles/explore-the-world/know-before-you-go-algiers 1440 | 4.28 | 6.79 | 2.51 | -25 | block columns-media: bottom -25 |  |
| /de/en/my-bookings 390 | 8.21 | 10.72 | 2.51 | -63 | block cards-teaser: bottom -31 (h -31) | heading 5 |
| /de/en/articles/explore-the-world/what-i-learned-living-in-barcelona 390 | 11.67 | 14.17 | 2.50 | +20 | block columns-media: bottom +28 | separator 4, separator-from-768 1 |
| /de/en/online-check-in-info 390 | 5.54 | 8.04 | 2.50 | +40 | head h2 "Check in conveniently online now": bottom -16 (h -20) | text-width 2 |
| /de/en/articles/explore-the-world/eat-see-do-algiers 1440 | 7.72 | 10.18 | 2.46 | -13 | block columns-media: bottom -13 |  |
| /de/en/during-your-trip/lhg-wifi 1440 | 8.96 | 11.4 | 2.44 | +88 | head h2 "Using Wi-Fi onboard – made simple": bottom +79 (h +79) |  |
| /de/en/check-in-baggage 1440 | 6.17 | 8.53 | 2.36 | +32 | head h2 "Baggage drop locations and times": bottom -16 (h -32) | video 1 |
| /de/en/security-check-time-slot 390 | 3.94 | 6.28 | 2.34 | +26 | head h2 "All the airports with time-slot access t": bottom +18 |  |
| /de/en/articles/explore-the-world/know-before-you-go-berlin 1440 | 4.63 | 6.94 | 2.31 | -25 | block columns-media: bottom -25 |  |
| /de/en/security-fast-lanes 390 | 6 | 8.31 | 2.31 | +8 | head h2 "Services at the airport": bottom +8 |  |
| /de/en/articles/explore-flying/7-people-who-shaped-lufthansa-history 1440 | 1.32 | 3.62 | 2.30 | +25 | block columns-media: bottom +25 | separator 1 |
| /de/en/travel-expense-management 1440 | 2.04 | 4.32 | 2.28 | +32 | head h2 "The benefits of the Lufthansa Travel & E": bottom -16 (h -40) |  |
| /de/en/my-logbook 390 | 9.4 | 11.67 | 2.27 | +8 | head h2 "Welcome on board!": bottom -16 (h -32) |  |
| /de/en/book-and-manage/flights/wetlease-hub 1440 | 1.67 | 3.93 | 2.26 | +28 | section grey.section.columns-media-container: bottom +28 (h +28) |  |
| /de/en/business-class-on-short-and-medium-haul 390 | 7.31 | 9.56 | 2.25 | +48 | heads 0 -> 2 |  |
| /de/en/check-in-baggage 390 | 7.28 | 9.52 | 2.24 | +32 | head h2 "Baggage drop locations and times": bottom -16 (h -32) | video 1 |
| /de/en/prepare-for-your-trip/entry-regulations/immigration-regulations-uk 390 | 4.89 | 7.1 | 2.21 | +24 | head h2 "Travellers who require a visa to enter t": bottom +16 | text-width 2, heading 1 |
| /de/en/articles/explore-the-world/what-i-learned-living-in-barcelona 1440 | 4.92 | 7.11 | 2.19 | -6 | block columns-media: bottom +11 | separator 4, separator-from-768 1 |
| /de/en/travelling-with-special-requirements 390 | 4.61 | 6.8 | 2.19 | +48 | section section.breadcrumb-container.columns-media-container: bottom -2684 (h -2684) |  |
| /de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/cognitive-impairment 1440 | 12.71 | 14.89 | 2.18 | -131 | head h2 "Hidden Disabilities Sunflower": bottom -12 | heading-aligned 4 |
| /de/en/articles/explore-the-world/essentials-frankfurt-facts 390 | 3.65 | 5.82 | 2.17 | +2 | no box moved (pictures, text, colour) | separator 2, separator-from-768 1 |
| /de/en/fia-valet-service 390 | 3.39 | 5.54 | 2.15 | -43 | head h2 "Other services": bottom -40 (h -32) |  |
| /de/en/services-munich-airport 1440 | 4.47 | 6.62 | 2.15 | +64 | block accordion-columns: bottom +16 |  |
| /de/en/data-collection-canada 1440 | 8.17 | 10.31 | 2.14 | -16 | head h2 "Requirements for entry or transit in Can": bottom -16 (h -40) | separator-in-block 1 |
| /de/en/articles/tags/munich 390 | 16.61 | 18.74 | 2.13 | -37 | head h2 "Dive Deeper With Our Interest-based Epis": bottom -83 (h -57) | video 7, heading-aligned 2, heading 1, text-width 1, separator-in-block 1 |
| /de/en/free2move 390 | 4.07 | 6.2 | 2.13 | +19 | head h2 "Book Free2move": bottom -9 (h -32) | column 2, text-width 2, text-size 0 |
| /de/en/digital-self-services 1440 | 3.46 | 5.58 | 2.12 | +20 | head h2 "Shortly before your flight": bottom -36 (h -40) |  |
| /de/en/articles/explore-the-world/stop-over-tokyo 1440 | 7.64 | 9.75 | 2.11 | -52 | block columns-media: bottom -52 | separator 3 |
| /de/en/passenger-receipt-90 390 | 9.17 | 11.27 | 2.10 | +48 | section section.breadcrumb-container.form-container: bottom -2645 (h -2645) |  |
| /de/en/cash-and-miles 1440 | 10.35 | 12.42 | 2.07 | -32 | head h2 "Promotion: Discover North America now an": bottom -32 (h -32) | column 2, text-size 0 |
| /gb/en/miles-and-more 1440 | 2.33 | 4.38 | 2.05 | -18 | block carousel-cards: bottom -17 |  |
| /de/en/articles/explore-the-world/what-i-learned-living-in-frankfurt 1440 | 4.6 | 6.64 | 2.04 | -16 | block columns-media: bottom -16 | separator 3, separator-from-768 1 |
| /de/de/miles-and-more 1440 | 2.34 | 4.35 | 2.01 | -18 | block carousel-cards: bottom -17 |  |
| /at/de/miles-and-more 1440 | 2.34 | 4.35 | 2.01 | -18 | block carousel-cards: bottom -17 |  |
| /de/en/articles/explore-the-world/on-the-scene-caspar-plautz-munich 1440 | 4.05 | 6.05 | 2.00 | -41 | block columns-media: bottom -41 | separator 3, heading 1, separator-from-768 1 |
| /de/en/book-and-manage/flights/wetlease-hub 390 | 5.33 | 7.33 | 2.00 | -37 | section grey.section.columns-media-container: bottom -37 (h -37) |  |
| /de/en/miles-and-more 1440 | 2.42 | 4.41 | 1.99 | -18 | block carousel-cards: bottom -17 |  |
| /de/en/articles/explore-the-world/be-picky-frankfurt-insider-tips 1440 | 2.8 | 4.79 | 1.99 | -17 | block columns-media: bottom -17 | separator 3, separator-from-768 1 |
| /de/en/articles/explore-the-world/essentials-barcelona-facts 1440 | 3.92 | 5.91 | 1.99 | +35 | block columns-media: bottom +35 | separator 1 |
| /de/en/lufthansa-at-vienna-airport 1440 | 2.8 | 4.78 | 1.98 | +32 | head h2 "The Austrian Star Alliance Terminal at V": bottom -16 (h -40) | text-width 2 |
| /de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/hearing-impairment 1440 | 4.36 | 6.33 | 1.97 | -12 | block columns-media: bottom +12 |  |
| /de/en/articles/explore-flying/essentials-future-of-flying 390 | 4.87 | 6.83 | 1.96 | +2 | no box moved (pictures, text, colour) |  |
| /de/en/first-class-comfort 390 | 3.13 | 5.06 | 1.93 | +24 | head h2 "First Class": bottom +24 | text-width 1 |
| /de/en/pre-check-in 390 | 4.89 | 6.81 | 1.92 | +28 | head h2 "A relaxed take-off with late-night check": bottom -16 (h -32) |  |
| /de/en/common/privacy-statement/privacy-statement-group 1440 | 3.51 | 5.41 | 1.90 | +25 | section section.breadcrumb-container: bottom +25 (h +25) |  |
| /de/en/electronic-bag-tags 1440 | 3.42 | 5.31 | 1.89 | -29 | block columns-media: bottom -19 (h -19) | separator-in-block 1 |
| /de/en/lounge-companions 390 | 7.23 | 9.12 | 1.89 | +39 | head h2 "Premium Economy Class passengers: Busine": bottom -16 (h -32) | text-size 4, column 1 |
| /de/en/prepare-for-your-trip/baggage/baggage-irregularities/delayed-baggage-lhg 390 | 5.88 | 7.77 | 1.89 | -27 | block columns-media: bottom -40 (h -20) |  |
| /de/de/digital-self-services 1440 | 2.93 | 4.8 | 1.87 | +20 | head h2 "Kurz vor Abflug": bottom -36 (h -40) |  |
| /at/de/digital-self-services 1440 | 2.93 | 4.8 | 1.87 | +20 | head h2 "Kurz vor Abflug": bottom -36 (h -40) |  |
| /de/en/services-at-frankfurt-airport 1440 | 5.27 | 7.12 | 1.85 | +24 | section section.breadcrumb-container.columns-media-container: bottom -660 (h -660) | column 1 |
| /de/en/cash-and-miles 390 | 11.65 | 13.48 | 1.83 | -32 | head h2 "Promotion: Discover North America now an": bottom -32 (h -32) | column 2, text-size 0 |
| /de/en/fliegen-mit-baby 1440 | 4.98 | 6.79 | 1.81 | -16 | head h2 "Important information about preparing fo": bottom -16 (h -40) |  |
| /gb/en/digital-self-services 1440 | 2.9 | 4.7 | 1.80 | +20 | head h2 "Shortly before your flight": bottom -36 (h -40) |  |
| /de/de/gepaeck 1440 | 3.37 | 5.15 | 1.78 | -12 | head h2 "Gepäckservices": bottom -13 | heading 9 |
| /at/de/gepaeck 1440 | 3.37 | 5.15 | 1.78 | -12 | head h2 "Gepäckservices": bottom -13 | heading 9 |
| /de/en/tiere-als-handgepaeck 390 | 4.52 | 6.3 | 1.78 | -70 | head h2 "Checklist": bottom -40 (h -32) | text-width 2 |
| /de/en/100-years 1440 | 10.49 | 12.25 | 1.76 | +27 | section spaced.campaign-section.section: bottom +27 (h +27) | text-width 1, indent 1 |
| /de/en/prepare-for-your-trip/baggage/baggage-irregularities/report-baggage 1440 | 5.09 | 6.84 | 1.75 | +21 | block columns-media: bottom +21 | separator-below-768 1 |
| /de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/visual-impairment 1440 | 5.04 | 6.79 | 1.75 | -11 | block columns-media: bottom +13 |  |
| /de/en/affiliatemarketing 1440 | 3.67 | 5.41 | 1.74 | -25 | head h2 "Your benefits as an affiliate partner:": bottom +8 | text-width 6, separator 1 |
| /de/en/first-class-valet-parking-service 390 | 5.13 | 6.87 | 1.74 | +8 | head h2 "For your rental or private car: valet pa": bottom -16 (h -20) | text-width 1 |
| /de/en/travelling-healthy 390 | 11.75 | 13.48 | 1.73 | +57 | head h2 "Health guide": bottom +57 | text-size 1 |
| /de/de/meetings-and-events 1440 | 2.74 | 4.44 | 1.70 | -27 | head h2 "Vorteile": bottom -27 (h -40) | text-width 4 |
| /at/de/meetings-and-events 1440 | 2.74 | 4.44 | 1.70 | -27 | head h2 "Vorteile": bottom -27 (h -40) | text-width 4 |
| /de/en/hotel-offers 390 | 10.16 | 11.85 | 1.69 | -45 | head h2 "Be inspired": bottom -15 (h -32) | separator-in-block 1 |
| /de/en/lufthansa-express-bus 1440 | 4.12 | 5.81 | 1.69 | +12 | head h2 "Lufthansa Express Bus is available on th": bottom -32 | column 3 |
| /de/en/with-children-at-the-airport 390 | 17.48 | 19.14 | 1.66 | -16 | head h2 "Make airport waiting times pass more qui": bottom -16 (h -32) | column 1, text-width 1 |
| /de/en/book-and-manage/digital-self-services/airline-apps 390 | 4.18 | 5.83 | 1.65 | +48 | heads 0 -> 2 |  |
| /de/en/meetings-and-events-delegates 1440 | 2.07 | 3.72 | 1.65 | +8 | head h2 "Flight booking for event delegates": bottom -16 (h -32) | column 1, text-width 1 |
| /xx/es/meetings-and-events 1440 | 2.77 | 4.41 | 1.64 | -27 | head h2 "Privilegios": bottom -27 (h -40) | text-width 4 |
| /de/en/uebergepaeck 390 | 7.77 | 9.41 | 1.64 | +43 | head h2 "Baggage": bottom +43 | text-size 0 |
| /de/de/digital-self-services 390 | 5.57 | 7.19 | 1.62 | +20 | head h2 "Kurz vor Abflug": bottom -36 (h -20) |  |
| /at/de/digital-self-services 390 | 5.57 | 7.19 | 1.62 | +20 | head h2 "Kurz vor Abflug": bottom -36 (h -20) |  |
| /de/en/book-and-manage/pax-receipt 390 | 6.93 | 8.55 | 1.62 | -20 | head h2 "Invoices for different countries": bottom -20 |  |
| /de/en/uebergepaeck 1440 | 4.37 | 5.99 | 1.62 | +67 | block accordion-columns: bottom +19 | text-size 0 |
| /de/en/upgrade-info 390 | 5.55 | 7.16 | 1.61 | +24 | head h2 "Upgrade options": bottom +24 |  |
| /de/en/book-and-manage/stopover/zugspitze 390 | 3.33 | 4.93 | 1.60 | +7 | block columns-media: bottom +7 (h +7) | text-size 1, text-width 1, separator-in-block 1 |
| /xx/ru/meetings-and-events 1440 | 3.1 | 4.69 | 1.59 | -27 | head h2 "Привилегии": bottom -27 (h -40) | text-width 4 |
| /fr/fr/meetings-and-events 1440 | 3.11 | 4.69 | 1.58 | -27 | head h2 "Avantages": bottom -27 (h -40) | text-width 4 |
| /xx/fr/meetings-and-events 1440 | 3.07 | 4.65 | 1.58 | -27 | head h2 "Avantages": bottom -27 (h -40) | text-width 4 |
| /de/en/prepare-for-your-trip/baggage/baggage-irregularities/report-baggage 390 | 5.54 | 7.08 | 1.54 | -47 | block columns-media: bottom -47 | separator-below-768 1 |
| /de/en/prepare-for-your-trip/baggage/electronic-devices-and-batteries 390 | 8 | 9.53 | 1.53 | +25 | head h2 "Travel safely with lithium batteries": bottom -5 | text-width 2, heading 1, separator 1 |
| /gb/en/digital-self-services 390 | 5.55 | 7.07 | 1.52 | +20 | head h2 "Shortly before your flight": bottom -36 (h -20) |  |
| /de/en/digital-self-services 390 | 5.54 | 7.05 | 1.51 | +20 | head h2 "Shortly before your flight": bottom -36 (h -20) |  |
| /de/en/munich-fair 1440 | 9.8 | 11.31 | 1.51 | +39 | head h2 "From the airport to Messe München (Munic": bottom +39 (h +39), w -326 | text-width 1 |
| /de/en/lufthansa-at-zuerich-airport 390 | 5.86 | 7.36 | 1.50 | -16 | head h2 "Terminal 1 at Zurich Airport": bottom -16 (h -20) |  |
| /de/en/travel-agencies 390 | 7.21 | 8.71 | 1.50 | +48 | section section.breadcrumb-container.columns-media-container: bottom -1260 (h -1260) |  |
| /de/en/europcar 390 | 2.41 | 3.9 | 1.49 | +58 | section section.breadcrumb-container.car-rental-container: bottom +58 (h +58) | text-size 1 |
| /de/en/lufthansa-at-berlin-airport 1440 | 2.76 | 4.25 | 1.49 | -24 | head h2 "Getting there": bottom -24 (h -40) |  |
| /de/en/lufthansa-express-rail 1440 | 6.08 | 7.57 | 1.49 | -15 | head h2 "Book Lufthansa Express Rail": bottom +32 (h -32) | heading 3, video 1, column 1, text-size 1, separator 1 |
| /de/en/miles-and-more 390 | 5.16 | 6.61 | 1.45 | -20 | block carousel-cards: bottom -20 |  |
| /gb/en/miles-and-more 390 | 5.17 | 6.61 | 1.44 | -20 | block carousel-cards: bottom -20 |  |
| /de/en/data-collection-usa 390 | 4.72 | 6.16 | 1.44 | +14 | head h2 "This might also interest you": bottom -7 (h -39) | column 1 |
| /de/en/tiere-als-uebergepaeck 1440 | 8.07 | 9.5 | 1.43 | -48 | head h2 "Prices": bottom +40 (h -32) | video 1, text-width 1, text-size 0 |
| /de/en/articles/explore-the-world/stop-over-tokyo 390 | 8.91 | 10.32 | 1.41 | -36 | block carousel-images: bottom -4 | separator 3 |
| /de/de/frankfurt-fair 390 | 6.09 | 7.49 | 1.40 | +39 | head h2 "Flughafen Frankfurt": bottom +39 | text-size 1, separator-from-768 1 |
| /de/en/all-check-in 390 | 5.17 | 6.57 | 1.40 | +32 | head h2 "Bag drop-off": bottom +5 (h +7) | heading-aligned 2 |
| /at/de/frankfurt-fair 390 | 6.09 | 7.48 | 1.39 | +39 | head h2 "Flughafen Frankfurt": bottom +39 | text-size 1, separator-from-768 1 |
| /at/de/articles/tags/allegris 1440 | 10.56 | 11.94 | 1.38 | +96 | head h2 "Alle Artikel zu Lufthansa Allegris": bottom +37 (h -13) | video 1, heading-aligned 1, text-size 0 |
| /de/en/flying-with-small-children 390 | 9.24 | 10.6 | 1.36 | -16 | head h2 "Important information about flying with ": bottom -16 (h -32) |  |
| /de/en/articles/explore-flying/inflight-entertainment-vr-experience 390 | 0.94 | 2.27 | 1.33 | -4 | block columns-media: bottom -4 | separator 1 |
| /de/en/fmg-valet-parking-service 1440 | 1.96 | 3.29 | 1.33 | -19 | head h2 "Dropping off your vehicle": bottom -24 (h -40) |  |
| /de/en/passenger-rights 1440 | 3.07 | 4.37 | 1.30 | -40 | head h2 "Refunds": bottom -24 | column 1, text-width 1 |
| /de/de/articles/tags/allegris 1440 | 10.64 | 11.93 | 1.29 | +96 | head h2 "Alle Artikel zu Lufthansa Allegris": bottom +37 (h -13) | video 1, heading-aligned 1, text-size 0 |
| /de/en/doctor-on-board 390 | 6.03 | 7.31 | 1.28 | -31 | head h2 "Doctor on Board – good to know": bottom -32 | text-size 0 |
| /de/en/discover-lufthansa/lufthansa-fleet/351 390 | 8.53 | 9.79 | 1.26 | -20 | head h2 "Seamless connection": bottom -20 | text-width 1 |
| /de/en/lufthansa-at-zuerich-airport 1440 | 3.31 | 4.57 | 1.26 | -40 | head h2 "Terminal 1 at Zurich Airport": bottom -16 (h -40) |  |
| /de/en/book-and-manage/cancellation-and-refund/refund/refund-form 1440 | 3.78 | 5 | 1.22 | +96 | head h2 "General information": bottom +39 | text-size 1 |
| /de/en/articles/authors/florian-tomberg 390 | 4.53 | 5.74 | 1.21 | -24 | head h1 "All articles from Florian Tomberg": bottom -24 |  |
| /de/en/prepare-for-your-trip/baggage/baggage-irregularities/delayed-baggage-lhg 1440 | 2.92 | 4.12 | 1.20 | -6 | block columns-media: bottom -29 (h -9) |  |
| /de/en/accessible-travel 1440 | 4.16 | 5.33 | 1.17 | +21 | block columns-media: bottom +13 |  |
| /de/en/doctor-on-board 1440 | 3.48 | 4.65 | 1.17 | -63 | head h2 "Doctor on Board – good to know": bottom -48 | text-size 0 |
| /de/en/automatic-check-in 1440 | 3.37 | 4.52 | 1.15 | +31 | section section.breadcrumb-container.columns-media-container: bottom -1364 (h -1364) | text-width 3, column 1, text-size 1 |
| /gb/en/baggage 390 | 5.01 | 6.14 | 1.13 | -4 | head h2 "Baggage services": bottom -4 | heading 9 |
| /de/en/baggage 390 | 5.01 | 6.13 | 1.12 | -4 | head h2 "Baggage services": bottom -4 | heading 9 |
| /de/en/book-and-manage/pax-receipt 1440 | 3.01 | 4.12 | 1.11 | -20 | head h2 "Invoices for different countries": bottom -20 |  |
| /de/en/lufthansa-guide-service 1440 | 4.33 | 5.44 | 1.11 | +119 | head h2 "Lufthansa Guides meeting and escorting o": bottom +111 (h -32) | text-width 1, text-size 0 |
| /de/en/fly-more-sustainabl 390 | 7.6 | 8.69 | 1.09 | -24 | head h2 "Your options to support more sustainable": bottom -32 | column 3 |
| /de/en/prepare-for-your-trip/travelling-with-children/child-in-businessclass 390 | 8.24 | 9.32 | 1.08 | +93 | head h2 "One adult with two children": bottom +61 | text-size 1 |
| /de/en/unterhaltung-an-bord 390 | 13.74 | 14.8 | 1.06 | -20 | block columns-media: bottom -20 (h +20) | heading 1, text-size 1 |
| /de/en/during-your-trip/lhg-wifi 390 | 11.38 | 12.43 | 1.05 | +22 | head h2 "Using Wi-Fi onboard – made simple": bottom +18 (h +18) |  |
| /de/en/refund 390 | 3.26 | 4.3 | 1.04 | -15 | section section.breadcrumb-container: bottom -1880 (h -1880) |  |
| /de/en/group-travel 390 | 5.99 | 7.02 | 1.03 | -42 | head h2 "Your group booking at lufthansa.com": bottom -16 (h -32) | text-size 1, text-width 1 |
| /de/en/flight-search 390 | 7.05 | 8.05 | 1.00 | -2 | block cards-teaser: bottom -3 | heading 1 |
| /de/en/upgrade-first-class 390 | 5.32 | 6.32 | 1.00 | -17 | head h2 "Upgrade options": bottom -17 | text-width 1 |
| /de/en/articles/explore-the-world/essentials-frankfurt-facts 1440 | 5.14 | 6.13 | 0.99 | +8 | block columns-media: bottom +8 | separator 2, separator-from-768 1 |
| /de/en/articles/explore-the-world/in-my-hood-district-zurich 1440 | 3.58 | 4.56 | 0.98 | -17 | block columns-media: bottom -17 | separator 3, separator-from-768 1 |
| /de/en/digital-baggage-services 390 | 5.37 | 6.34 | 0.97 | +24 | head h2 "Baggage": bottom +24 | video 1 |
| /de/en/articles/explore-the-world/be-picky-barcelona-insider-tips 1440 | 7.16 | 8.1 | 0.94 | -17 | block columns-media: bottom -17 | separator 4, separator-from-768 1 |
| /de/en/refund 1440 | 1.71 | 2.64 | 0.93 | -15 | section section.breadcrumb-container: bottom -1359 (h -1359) |  |
| /de/en/articles/tags/munich 1440 | 13.06 | 13.98 | 0.92 | -64 | head h1 "Travel Guide Munich – a Cozy City in the": bottom 0, w +430 | video 7, heading-aligned 2, heading 1, text-width 1, separator-in-block 1 |
| /de/en/book-and-manage/stopover/neuschwanstein 390 | 2.72 | 3.6 | 0.88 | +7 | block columns-media: bottom +7 (h +7) | text-size 1, text-width 1, separator-in-block 1 |
| /de/en/anmeldung-tiere-frachtraum 1440 | 3.47 | 4.35 | 0.88 | +29 | block form: bottom +29 (h +29) | text-size 2 |
| /de/en/all-check-in 1440 | 3.14 | 4.02 | 0.88 | +9 | head h2 "Bag drop-off": bottom +9 (h +9) | heading-aligned 2 |
| /de/en/articles/explore-the-world/what-i-learned-living-in-frankfurt 390 | 7.58 | 8.45 | 0.87 | -2 | section section.columns-media-container: bottom -776 (h -778) | separator 3, separator-from-768 1 |
| /de/en/passenger-receipt-90 1440 | 2.32 | 3.19 | 0.87 | +24 | head h2 "Personal information": bottom -24 |  |
| /de/en/book-and-manage/flights/helvetic 390 | 7.29 | 8.15 | 0.86 | -35 | section section.accordion-columns-container: bottom -35 (h -35) |  |
| /de/en/electronic-bag-tags 390 | 6 | 6.81 | 0.81 | -29 | block columns-media: bottom -19 (h -19) | separator-in-block 1 |
| /de/en/advice-for-travellers-with-special-needs-to-and-from-the-usa 1440 | 4.18 | 4.98 | 0.80 | -15 | head h2 "Reporting accessibility problems to a co": bottom -24 | column 1 |
| /de/en/articles/explore-the-world/on-the-scene-caspar-plautz-munich 390 | 7.65 | 8.42 | 0.77 | -20 | block columns-media: bottom -19 | separator 3, heading 1, separator-from-768 1 |
| /de/en/anmeldung-tiere-frachtraum 390 | 7.28 | 8.04 | 0.76 | +29 | block form: bottom +29 (h +29) | text-size 2 |
| /de/en/lufthansa-group-star-alliance-and-partner-airlines 1440 | 7.37 | 8.12 | 0.75 | -72 | head h2 "Miles that take you further": bottom +40 |  |
| /de/en/datenschutz 1440 | 8.51 | 9.24 | 0.73 | +6 | head h2 "Information about data protection": bottom -42 (h -40) |  |
| /de/en/articles/explore-flying/essentials-future-of-flying 1440 | 2.68 | 3.4 | 0.72 | -23 | block columns-media: bottom -23 |  |
| /de/en/100-years/global-network 390 | 15.04 | 15.75 | 0.71 | +7 | head h2 "Rapid rise": bottom +20 | heading-aligned 1 |
| /gb/en/airport-information 390 | 5.64 | 6.33 | 0.69 | -30 | section section: bottom -30 (h -30) | separator 1 |
| /de/en/airport-information 390 | 5.62 | 6.31 | 0.69 | -30 | section section: bottom -30 (h -30) | separator 1 |
| /de/en/744 1440 | 5.03 | 5.71 | 0.68 | -49 | head h2 "Seat maps Boeing B747-400i": bottom -8 (h -40) | column 2 |
| /de/en/articles/explore-the-world/in-my-hood-chiswick-london 390 | 7.73 | 8.41 | 0.68 | +11 | block columns-media: bottom +10 | separator 2, heading 1, separator-from-768 1 |
| /gb/en/frankfurt-fair 390 | 5.91 | 6.58 | 0.67 | +15 | head h2 "Frankfurt Airport": bottom +15 | text-size 1, separator-from-768 1 |
| /de/en/frankfurt-fair 390 | 5.9 | 6.57 | 0.67 | +15 | head h2 "Frankfurt Airport": bottom +15 | text-size 1, separator-from-768 1 |
| /de/en/articles/explore-the-world/be-picky-barcelona-insider-tips 390 | 9.71 | 10.36 | 0.65 | -8 | block columns-media: bottom -8 | separator 4, separator-from-768 1 |
| /de/en/discover-lufthansa/lufthansa-group-airlines/ita-airways 1440 | 6.25 | 6.9 | 0.65 | +39 | head h2 "FAQ": bottom +39, w +430 | heading 1 |
| /de/en/lufthansa-express-rail 390 | 7.25 | 7.9 | 0.65 | +64 | head h2 "Book Lufthansa Express Rail": bottom +36 (h -32) | heading 3, video 1, column 1, text-size 1, separator 1 |
| /de/en/lufthansa-first-class-entertainment 1440 | 6.58 | 7.22 | 0.64 | +14 | head h2 "When your flight time turns into great e": bottom -16 (h -40) | text-size 1 |
| /de/en/lufthansa-corporate-customers 390 | 12.09 | 12.72 | 0.63 | +32 | head h2 "Lufthansa provides corporate and busines": bottom -16 (h -20) | heading 1 |
| /gb/en/frankfurt-fair 1440 | 4.74 | 5.36 | 0.62 | -11 | section column-view.padded.section: bottom -59 (h -59) | text-size 1, separator-from-768 1 |
| /de/en/frankfurt-fair 1440 | 4.74 | 5.35 | 0.61 | -11 | section column-view.padded.section: bottom -59 (h -59) | text-size 1, separator-from-768 1 |
| /de/en/fia-valet-service 1440 | 1.97 | 2.54 | 0.57 | -19 | head h2 "Other services": bottom -40 (h -32) |  |
| /de/en/europa-tarife-economy-class 390 | 7.99 | 8.55 | 0.56 | -30 | head h2 "Travel classes": bottom -30 |  |
| /de/en/tiere-als-uebergepaeck 390 | 9.61 | 10.16 | 0.55 | -62 | head h2 "Prices": bottom +40 (h -32) | video 1, text-width 1, text-size 0 |
| /de/en/admission-rules 1440 | 3.06 | 3.6 | 0.54 | +100 | head h2 "Lounge access on departure": bottom +25 (h -32) | text-width 1 |
| /de/en/green-fare 1440 | 2.67 | 3.18 | 0.51 | -24 | head h2 "More information about Sustainable Aviat": bottom -48 | column 1 |

## 8. The full table: every recorded lufthansa.com page-width with markers (670)

today: the published document with the deployed code; switched: the collapsed document with the branch (carriers, M at 40); M 60: the same with M toggled back to 60 ("=" where the document has no M carrier, the same page). Heights in px.

| page | width | today | height | switched | height | M 60 | +/- |
| --- | --- | --- | --- | --- | --- | --- | --- |
| /gb/en/baggage | 390 | 5.01 | 7340 | 6.14 | 7336 | 13.8 | 1.13 |
| /gb/en/baggage | 1440 | 1.7 | 4627 | 1.97 | 4627 | 11.96 | 0.27 |
| /de/de/gepaeck | 390 | 4.84 | 7521 | 4.18 | 7517 | 13.58 | -0.66 |
| /de/de/gepaeck | 1440 | 3.37 | 4727 | 5.15 | 4715 | 9 | 1.78 |
| /gb/en/food-and-beverages | 390 | 6.71 | 6742 | 6.71 | 6742 | 23.39 | 0.00 |
| /gb/en/food-and-beverages | 1440 | 6.46 | 5087 | 2.19 | 5087 | 18.73 | -4.27 |
| /gb/en/lufthansa-travel-classes | 390 | 8.02 | 4688 | 8.02 | 4688 | = | 0.00 |
| /gb/en/lufthansa-travel-classes | 1440 | 3.85 | 3290 | 3.85 | 3290 | = | 0.00 |
| /gb/en/digital-self-services | 390 | 5.55 | 5483 | 7.07 | 5503 | 8.52 | 1.52 |
| /gb/en/digital-self-services | 1440 | 2.9 | 4463 | 4.7 | 4483 | 6.72 | 1.80 |
| /gb/en/miles-and-more | 390 | 5.17 | 4193 | 6.61 | 4173 | 6.61 | 1.44 |
| /gb/en/miles-and-more | 1440 | 2.33 | 3410 | 4.38 | 3392 | 4.38 | 2.05 |
| /gb/en/airport-information | 390 | 5.64 | 5480 | 6.33 | 5450 | 5.45 | 0.69 |
| /gb/en/airport-information | 1440 | 3.84 | 3230 | 7.09 | 3180 | 5.94 | 3.25 |
| /gb/en/overview-special-request | 390 | 5.79 | 3936 | 5.79 | 3936 | = | 0.00 |
| /gb/en/overview-special-request | 1440 | 2.46 | 2746 | 2.46 | 2746 | = | 0.00 |
| /de/de/digital-self-services | 390 | 5.57 | 5645 | 7.19 | 5665 | 8.65 | 1.62 |
| /de/de/digital-self-services | 1440 | 2.93 | 4541 | 4.8 | 4561 | 6.8 | 1.87 |
| /at/de/digital-self-services | 390 | 5.57 | 5645 | 7.19 | 5665 | 8.65 | 1.62 |
| /at/de/digital-self-services | 1440 | 2.93 | 4541 | 4.8 | 4561 | 6.8 | 1.87 |
| /de/de/fluege | 390 | 45.79 | 5260 | 45.75 | 5274 | 45.75 | -0.04 |
| /de/de/fluege | 1440 | 33.76 | 3892 | 33.82 | 3900 | 33.82 | 0.06 |
| /at/de/fluege | 390 | 43.93 | 5370 | 43.96 | 5338 | = | 0.03 |
| /at/de/fluege | 1440 | 34.14 | 4063 | 33.9 | 3991 | = | -0.24 |
| /gb/en/flights | 390 | 43.82 | 5132 | 43.87 | 5108 | 43.74 | 0.05 |
| /gb/en/flights | 1440 | 33.08 | 3898 | 33.2 | 3874 | 32.91 | 0.12 |
| /de/de/lufthansa-reiseklassen | 390 | 7.95 | 4787 | 7.95 | 4787 | = | 0.00 |
| /de/de/lufthansa-reiseklassen | 1440 | 3.88 | 3290 | 3.88 | 3290 | = | 0.00 |
| /at/de/lufthansa-reiseklassen | 390 | 7.95 | 4787 | 7.95 | 4787 | = | 0.00 |
| /at/de/lufthansa-reiseklassen | 1440 | 3.88 | 3290 | 3.88 | 3290 | = | 0.00 |
| /de/de/meetings-and-events | 390 | 6.11 | 4149 | 6.11 | 4149 | = | 0.00 |
| /de/de/meetings-and-events | 1440 | 2.74 | 3609 | 4.44 | 3582 | = | 1.70 |
| /at/de/meetings-and-events | 390 | 6.11 | 4149 | 6.11 | 4149 | = | 0.00 |
| /at/de/meetings-and-events | 1440 | 2.74 | 3609 | 4.44 | 3582 | = | 1.70 |
| /gb/en/meetings-and-events | 390 | 5.75 | 3888 | 5.75 | 3888 | = | 0.00 |
| /gb/en/meetings-and-events | 1440 | 2.56 | 3528 | 2.56 | 3528 | = | 0.00 |
| /de/de/miles-and-more | 390 | 5.04 | 4516 | 9.01 | 4465 | 9.01 | 3.97 |
| /de/de/miles-and-more | 1440 | 2.34 | 3491 | 4.35 | 3473 | 4.35 | 2.01 |
| /at/de/miles-and-more | 390 | 5.03 | 4516 | 9.01 | 4465 | 9.01 | 3.98 |
| /at/de/miles-and-more | 1440 | 2.34 | 3491 | 4.35 | 3473 | 4.35 | 2.01 |
| /de/en/flights | 390 | 44.84 | 5341 | 45.24 | 5307 | 44.76 | 0.40 |
| /de/en/flights | 1440 | 34.1 | 4107 | 34.05 | 4073 | 34 | -0.05 |
| /de/de/frankfurt-fair | 390 | 6.09 | 5451 | 7.49 | 5490 | 7.49 | 1.40 |
| /de/de/frankfurt-fair | 1440 | 3.83 | 3506 | 4.07 | 3495 | 4.07 | 0.24 |
| /at/de/frankfurt-fair | 390 | 6.09 | 5451 | 7.48 | 5490 | 7.48 | 1.39 |
| /at/de/frankfurt-fair | 1440 | 3.84 | 3506 | 4.07 | 3495 | 4.07 | 0.23 |
| /gb/en/frankfurt-fair | 390 | 5.91 | 5321 | 6.58 | 5336 | 6.58 | 0.67 |
| /gb/en/frankfurt-fair | 1440 | 4.74 | 3503 | 5.36 | 3492 | 5.36 | 0.62 |
| /de/de/bedeutsamste-strecken | 390 | 5.94 | 2875 | 5.94 | 2875 | = | 0.00 |
| /de/de/bedeutsamste-strecken | 1440 | 2.71 | 2466 | 2.77 | 2466 | = | 0.06 |
| /at/de/bedeutsamste-strecken | 390 | 5.94 | 2875 | 5.94 | 2875 | = | 0.00 |
| /at/de/bedeutsamste-strecken | 1440 | 2.71 | 2466 | 2.77 | 2466 | = | 0.06 |
| /gb/en/most-significant-route | 390 | 5.99 | 2780 | 5.99 | 2780 | = | 0.00 |
| /gb/en/most-significant-route | 1440 | 2.56 | 2574 | 2.56 | 2574 | = | 0.00 |
| /fr/fr/meetings-and-events | 390 | 6.04 | 4355 | 6.04 | 4355 | = | 0.00 |
| /fr/fr/meetings-and-events | 1440 | 3.11 | 3715 | 4.69 | 3688 | = | 1.58 |
| /xx/es/meetings-and-events | 390 | 6.23 | 4109 | 6.23 | 4109 | = | 0.00 |
| /xx/es/meetings-and-events | 1440 | 2.77 | 3608 | 4.41 | 3581 | = | 1.64 |
| /xx/fr/meetings-and-events | 390 | 6.05 | 4355 | 6.05 | 4355 | = | 0.00 |
| /xx/fr/meetings-and-events | 1440 | 3.07 | 3715 | 4.65 | 3688 | = | 1.58 |
| /de/en/100-years/chronicle | 390 | 7.03 | 43634 | 7.03 | 43491 | 7.03 | 0.00 |
| /de/en/100-years/chronicle | 1440 | 12.22 | 34698 | 12.12 | 34772 | 12.12 | -0.10 |
| /de/en/book-and-manage/stopover | 390 | 14 | 17448 | 19.3 | 17314 | 17.3 | 5.30 |
| /de/en/book-and-manage/stopover | 1440 | 11.82 | 13090 | 15.36 | 13055 | 17.5 | 3.54 |
| /de/en/book-and-manage/stopover/bayerischer-hof | 390 | 4.98 | 4047 | 4.76 | 4036 | = | -0.22 |
| /de/en/book-and-manage/stopover/bayerischer-hof | 1440 | 5.08 | 2950 | 5.45 | 2950 | = | 0.37 |
| /de/en/book-and-manage/stopover/neuschwanstein | 390 | 2.72 | 3732 | 3.6 | 3739 | = | 0.88 |
| /de/en/book-and-manage/stopover/neuschwanstein | 1440 | 4.8 | 3012 | 5 | 3012 | = | 0.20 |
| /de/en/book-and-manage/stopover/zugspitze | 390 | 3.33 | 4004 | 4.93 | 4011 | = | 1.60 |
| /de/en/book-and-manage/stopover/zugspitze | 1440 | 4.53 | 3069 | 4.73 | 3069 | = | 0.20 |
| /de/en/digital-self-services | 390 | 5.54 | 5483 | 7.05 | 5503 | 8.51 | 1.51 |
| /de/en/digital-self-services | 1440 | 3.46 | 4463 | 5.58 | 4483 | 7.56 | 2.12 |
| /de/en/frankfurt-fair | 390 | 5.9 | 5321 | 6.57 | 5336 | 6.57 | 0.67 |
| /de/en/frankfurt-fair | 1440 | 4.74 | 3503 | 5.35 | 3492 | 5.35 | 0.61 |
| /de/en/lufthansa-travel-classes | 390 | 8.01 | 4688 | 8.01 | 4688 | = | 0.00 |
| /de/en/lufthansa-travel-classes | 1440 | 3.86 | 3290 | 3.86 | 3290 | = | 0.00 |
| /de/en/meetings-and-events | 390 | 5.74 | 3888 | 5.74 | 3888 | = | 0.00 |
| /de/en/meetings-and-events | 1440 | 2.56 | 3528 | 2.56 | 3528 | = | 0.00 |
| /de/en/miles-and-more | 390 | 5.16 | 4193 | 6.61 | 4173 | 6.61 | 1.45 |
| /de/en/miles-and-more | 1440 | 2.42 | 3410 | 4.41 | 3392 | 4.41 | 1.99 |
| /de/en/most-significant-route | 390 | 5.98 | 2780 | 5.98 | 2780 | = | 0.00 |
| /de/en/most-significant-route | 1440 | 2.56 | 2574 | 2.56 | 2574 | = | 0.00 |
| /at/de/100-years/crane | 390 | 9.38 | 11407 | 9.38 | 11407 | = | 0.00 |
| /at/de/100-years/crane | 1440 | 7.96 | 9755 | 7.96 | 9755 | = | 0.00 |
| /at/de/additional-services | 390 | 6.83 | 8440 | 6.83 | 8440 | 6.83 | 0.00 |
| /at/de/additional-services | 1440 | 5.73 | 6766 | 5.73 | 6766 | 5.73 | 0.00 |
| /at/de/100-years/destinations | 390 | 7.96 | 22167 | 7.96 | 22167 | 7.96 | 0.00 |
| /at/de/100-years/destinations | 1440 | 0.71 | 20288 | 5.33 | 20296 | 5.33 | 4.62 |
| /at/de/articles/highlights/all-it-takes-is-a-yes | 390 | 12.77 | 7984 | 12.77 | 7984 | = | 0.00 |
| /at/de/articles/highlights/all-it-takes-is-a-yes | 1440 | 6.6 | 6802 | 6.6 | 6802 | = | 0.00 |
| /at/de/articles/highlights/allegris-premium-economy-san-diego | 390 | 5.55 | 7871 | 14.3 | 7921 | 14.3 | 8.75 |
| /at/de/articles/highlights/allegris-premium-economy-san-diego | 1440 | 4.9 | 6965 | 15.92 | 7029 | 15.92 | 11.02 |
| /at/de/articles/tags/allegris | 390 | 5.96 | 8154 | 12.12 | 8229 | = | 6.16 |
| /at/de/articles/tags/allegris | 1440 | 10.56 | 7396 | 11.94 | 7492 | = | 1.38 |
| /at/de/discover-lufthansa/new-onboard-experience | 390 | 8.33 | 18847 | 8.33 | 18847 | 17.29 | 0.00 |
| /at/de/discover-lufthansa/new-onboard-experience | 1440 | 4.46 | 15411 | 24.4 | 15481 | 33.7 | 19.94 |
| /at/de/flughafeninformation | 390 | 24.76 | 5942 | 23.88 | 5912 | 24.44 | -0.88 |
| /at/de/flughafeninformation | 1440 | 3.07 | 3282 | 6.72 | 3231 | 5.58 | 3.65 |
| /at/de/gepaeck | 390 | 4.84 | 7521 | 4.18 | 7517 | 13.58 | -0.66 |
| /at/de/gepaeck | 1440 | 3.37 | 4727 | 5.15 | 4715 | 9 | 1.78 |
| /at/de/services-am-flughafen | 390 | 7.47 | 3619 | 7.47 | 3619 | = | 0.00 |
| /at/de/services-am-flughafen | 1440 | 1.49 | 2851 | 1.49 | 2851 | = | 0.00 |
| /at/de/overview-special-request | 390 | 5.61 | 4028 | 5.61 | 4028 | = | 0.00 |
| /at/de/overview-special-request | 1440 | 2.45 | 2773 | 2.45 | 2773 | = | 0.00 |
| /at/de/speisen-und-getraenke | 390 | 7.4 | 7113 | 7.4 | 7113 | 23.25 | 0.00 |
| /at/de/speisen-und-getraenke | 1440 | 2.41 | 5114 | 2.41 | 5114 | 19.05 | 0.00 |
| /de/de/100-years/crane | 390 | 9.38 | 11407 | 9.38 | 11407 | = | 0.00 |
| /de/de/100-years/crane | 1440 | 7.96 | 9755 | 7.96 | 9755 | = | 0.00 |
| /de/de/100-years/destinations | 390 | 7.96 | 22167 | 7.96 | 22167 | 7.96 | 0.00 |
| /de/de/100-years/destinations | 1440 | 0.71 | 20288 | 5.33 | 20296 | 5.33 | 4.62 |
| /de/de/additional-services | 390 | 6.83 | 8440 | 6.83 | 8440 | 6.83 | 0.00 |
| /de/de/additional-services | 1440 | 5.73 | 6766 | 5.73 | 6766 | 5.73 | 0.00 |
| /de/de/articles/highlights/all-it-takes-is-a-yes | 390 | 12.78 | 7984 | 12.78 | 7984 | = | 0.00 |
| /de/de/articles/highlights/all-it-takes-is-a-yes | 1440 | 6.6 | 6802 | 6.6 | 6802 | = | 0.00 |
| /de/de/articles/highlights/allegris-premium-economy-san-diego | 390 | 4.82 | 7844 | 13.87 | 7894 | 13.93 | 9.05 |
| /de/de/articles/highlights/allegris-premium-economy-san-diego | 1440 | 3.53 | 6965 | 15.92 | 7029 | 15.92 | 12.39 |
| /de/de/articles/tags/allegris | 390 | 5.96 | 8154 | 12.12 | 8229 | = | 6.16 |
| /de/de/articles/tags/allegris | 1440 | 10.64 | 7396 | 11.93 | 7492 | = | 1.29 |
| /de/de/discover-lufthansa/new-onboard-experience | 390 | 8.33 | 18847 | 8.33 | 18847 | 17.27 | 0.00 |
| /de/de/discover-lufthansa/new-onboard-experience | 1440 | 4.46 | 15411 | 24.35 | 15481 | 33.65 | 19.89 |
| /de/de/flughafeninformation | 390 | 24.77 | 5942 | 23.88 | 5912 | 24.45 | -0.89 |
| /de/de/flughafeninformation | 1440 | 3.06 | 3282 | 6.72 | 3231 | 5.58 | 3.66 |
| /de/de/overview-special-request | 390 | 5.61 | 4028 | 5.61 | 4028 | = | 0.00 |
| /de/de/overview-special-request | 1440 | 2.45 | 2773 | 2.45 | 2773 | = | 0.00 |
| /de/de/services-am-flughafen | 390 | 7.47 | 3619 | 7.47 | 3619 | = | 0.00 |
| /de/de/services-am-flughafen | 1440 | 1.48 | 2851 | 1.48 | 2851 | = | 0.00 |
| /de/de/speisen-und-getraenke | 390 | 7.61 | 7113 | 7.61 | 7113 | 23.34 | 0.00 |
| /de/de/speisen-und-getraenke | 1440 | 2.41 | 5114 | 2.41 | 5114 | 19.05 | 0.00 |
| /de/en/100-years | 390 | 19.68 | 9963 | 32.68 | 9882 | = | 13.00 |
| /de/en/100-years | 1440 | 10.49 | 8464 | 12.25 | 8491 | = | 1.76 |
| /de/en/100-years/cabin-design | 390 | 13.28 | 19631 | 17.61 | 19766 | 17.61 | 4.33 |
| /de/en/100-years/cabin-design | 1440 | 5.88 | 16930 | 14.81 | 17065 | 14.77 | 8.93 |
| /de/en/100-years/campaigns | 390 | 9.52 | 15334 | 7.31 | 15343 | = | -2.21 |
| /de/en/100-years/campaigns | 1440 | 4.93 | 16479 | 3.25 | 16466 | = | -1.68 |
| /de/en/100-years/crane | 390 | 9.46 | 10981 | 9.46 | 10981 | = | 0.00 |
| /de/en/100-years/crane | 1440 | 7.79 | 9782 | 7.79 | 9782 | = | 0.00 |
| /de/en/100-years/destinations | 390 | 8.1 | 21532 | 8.1 | 21532 | 8.1 | 0.00 |
| /de/en/100-years/destinations | 1440 | 0.78 | 20233 | 5.25 | 20241 | 5.25 | 4.47 |
| /de/en/100-years/fleet | 390 | 6.38 | 36566 | 6.27 | 36530 | 6.27 | -0.11 |
| /de/en/100-years/fleet | 1440 | 7.45 | 28346 | 7.45 | 28325 | 7.45 | 0.00 |
| /de/en/100-years/global-network | 390 | 15.04 | 18816 | 15.75 | 18823 | 15.75 | 0.71 |
| /de/en/100-years/global-network | 1440 | 13.62 | 16715 | 13.73 | 16722 | 13.73 | 0.11 |
| /de/en/320 | 390 | 5.75 | 6751 | 13.7 | 6714 | = | 7.95 |
| /de/en/320 | 1440 | 4.42 | 6385 | 4.58 | 6385 | = | 0.16 |
| /de/en/100-years/history | 390 | 5.92 | 11691 | 5.92 | 11691 | 5.92 | 0.00 |
| /de/en/100-years/history | 1440 | 1.04 | 9520 | 1.04 | 9520 | 1.04 | 0.00 |
| /de/en/100-years/history/menu-on-board | 390 | 9.53 | 11889 | 9.53 | 11863 | = | 0.00 |
| /de/en/100-years/history/menu-on-board | 1440 | 2.21 | 12337 | 2.21 | 12343 | = | 0.00 |
| /de/en/32n | 390 | 7.39 | 6959 | 13.59 | 6883 | = | 6.20 |
| /de/en/32n | 1440 | 2.37 | 6494 | 6.14 | 6468 | = | 3.77 |
| /de/en/359 | 390 | 6.09 | 3037 | 10.61 | 2955 | = | 4.52 |
| /de/en/359 | 1440 | 2.51 | 3406 | 5.11 | 3373 | = | 2.60 |
| /de/en/add-sports-baggage | 390 | 9.92 | 5453 | 8.91 | 5423 | 9.63 | -1.01 |
| /de/en/add-sports-baggage | 1440 | 6.62 | 4467 | 5.95 | 4437 | 6.39 | -0.67 |
| /de/en/744 | 390 | 11.64 | 3341 | 8.82 | 3239 | = | -2.82 |
| /de/en/744 | 1440 | 5.03 | 3342 | 5.71 | 3293 | = | 0.68 |
| /de/en/accessible-travel | 390 | 6.21 | 10371 | 6.11 | 10394 | 6.19 | -0.10 |
| /de/en/accessible-travel | 1440 | 4.16 | 5521 | 5.33 | 5542 | 5.55 | 1.17 |
| /de/en/additional-services | 390 | 6.68 | 8372 | 6.68 | 8372 | 6.68 | 0.00 |
| /de/en/additional-services | 1440 | 5.8 | 6766 | 5.81 | 6766 | 5.81 | 0.01 |
| /de/en/addresses-worldwide | 390 | 5.51 | 1417 | 5.88 | 1397 | 5.51 | 0.37 |
| /de/en/addresses-worldwide | 1440 | 3.29 | 1249 | 6.54 | 1229 | 3.29 | 3.25 |
| /de/en/admission-rules | 390 | 5.6 | 8342 | 4.72 | 8415 | = | -0.88 |
| /de/en/admission-rules | 1440 | 3.06 | 7205 | 3.6 | 7305 | = | 0.54 |
| /de/en/advance-seat-reservation | 390 | 12.01 | 12950 | 21.71 | 13154 | 21.71 | 9.70 |
| /de/en/advance-seat-reservation | 1440 | 7.71 | 8701 | 11.72 | 8719 | 11.75 | 4.01 |
| /de/en/advance-seat-reservations-terms-and-conditions | 390 | 5.53 | 2534 | 15.22 | 2659 | = | 9.69 |
| /de/en/advance-seat-reservations-terms-and-conditions | 1440 | 2.17 | 1601 | 14.59 | 1719 | = | 12.42 |
| /de/en/affiliatemarketing | 390 | 9.69 | 4112 | 9.04 | 4087 | 9.8 | -0.65 |
| /de/en/affiliatemarketing | 1440 | 3.67 | 2808 | 5.41 | 2783 | 4.08 | 1.74 |
| /de/en/advice-for-travellers-with-special-needs-to-and-from-the-usa | 390 | 8.42 | 9935 | 8.42 | 9928 | 8.42 | 0.00 |
| /de/en/advice-for-travellers-with-special-needs-to-and-from-the-usa | 1440 | 4.18 | 6113 | 4.98 | 6098 | 4.98 | 0.80 |
| /de/en/anmeldung-tiere-frachtraum | 390 | 7.28 | 8726 | 8.04 | 8755 | = | 0.76 |
| /de/en/anmeldung-tiere-frachtraum | 1440 | 3.47 | 6474 | 4.35 | 6503 | = | 0.88 |
| /de/en/all-check-in | 390 | 5.17 | 3330 | 6.57 | 3362 | = | 1.40 |
| /de/en/all-check-in | 1440 | 3.14 | 2817 | 4.02 | 2826 | = | 0.88 |
| /de/en/airport-information | 390 | 5.62 | 5480 | 6.31 | 5450 | 5.43 | 0.69 |
| /de/en/airport-information | 1440 | 3.83 | 3230 | 7.09 | 3180 | 5.93 | 3.26 |
| /de/en/articles/authors/florian-tomberg | 390 | 4.53 | 3802 | 5.74 | 3778 | 5.74 | 1.21 |
| /de/en/articles/authors/florian-tomberg | 1440 | 3.03 | 3449 | 3.24 | 3425 | 3.24 | 0.21 |
| /de/en/arrival-services | 390 | 6.74 | 4633 | 9.58 | 4633 | = | 2.84 |
| /de/en/arrival-services | 1440 | 10.36 | 3778 | 9.49 | 3738 | = | -0.87 |
| /de/en/articles/explore-flying | 390 | 7.22 | 6793 | 7.32 | 6783 | 7.41 | 0.10 |
| /de/en/articles/explore-flying | 1440 | 4.32 | 5523 | 3.51 | 5513 | 4.92 | -0.81 |
| /de/en/articles/explore-flying/7-people-who-shaped-lufthansa-history | 390 | 3.35 | 11712 | 6.33 | 11714 | = | 2.98 |
| /de/en/articles/explore-flying/7-people-who-shaped-lufthansa-history | 1440 | 1.32 | 9820 | 3.62 | 9845 | = | 2.30 |
| /de/en/articles/explore-flying/anniversary-super-crane-special | 390 | 10.79 | 10102 | 13.45 | 10115 | = | 2.66 |
| /de/en/articles/explore-flying/anniversary-super-crane-special | 1440 | 7.67 | 7298 | 7.42 | 7299 | = | -0.25 |
| /de/en/articles/explore-flying/essentials-future-of-flying | 390 | 4.87 | 5853 | 6.83 | 5855 | 6.83 | 1.96 |
| /de/en/articles/explore-flying/essentials-future-of-flying | 1440 | 2.68 | 5776 | 3.4 | 5753 | 3.4 | 0.72 |
| /de/en/articles/explore-flying/flying-high-christoph-quarch | 390 | 5.63 | 6402 | 5.72 | 6398 | = | 0.09 |
| /de/en/articles/explore-flying/flying-high-christoph-quarch | 1440 | 5.76 | 5400 | 5.76 | 5400 | = | 0.00 |
| /de/en/articles/explore-flying/inflight-entertainment-vr-experience | 390 | 0.94 | 10338 | 2.27 | 10334 | 2.27 | 1.33 |
| /de/en/articles/explore-flying/inflight-entertainment-vr-experience | 1440 | 2.08 | 7896 | 1.94 | 7872 | 1.94 | -0.14 |
| /de/en/articles/explore-the-world/a-perfect-day-barcelona-in-one-day | 390 | 11.35 | 10527 | 14.11 | 10569 | = | 2.76 |
| /de/en/articles/explore-the-world/a-perfect-day-barcelona-in-one-day | 1440 | 3.07 | 7615 | 10.75 | 7603 | = | 7.68 |
| /de/en/articles/explore-the-world | 390 | 7.42 | 8369 | 7.37 | 8359 | 7.51 | -0.05 |
| /de/en/articles/explore-the-world | 1440 | 5.5 | 6284 | 5.97 | 6274 | 5 | 0.47 |
| /de/en/articles/explore-the-world/be-picky-barcelona-insider-tips | 390 | 9.71 | 7655 | 10.36 | 7647 | = | 0.65 |
| /de/en/articles/explore-the-world/be-picky-barcelona-insider-tips | 1440 | 7.16 | 5042 | 8.1 | 5025 | = | 0.94 |
| /de/en/articles/explore-the-world/a-perfect-day-berlin-in-one-day | 390 | 10.01 | 11857 | 14.53 | 11901 | = | 4.52 |
| /de/en/articles/explore-the-world/a-perfect-day-berlin-in-one-day | 1440 | 2.69 | 8073 | 9.07 | 8062 | = | 6.38 |
| /de/en/articles/explore-the-world/be-picky-frankfurt-insider-tips | 390 | 8.05 | 5104 | 8.2 | 5104 | = | 0.15 |
| /de/en/articles/explore-the-world/be-picky-frankfurt-insider-tips | 1440 | 2.8 | 3833 | 4.79 | 3816 | = | 1.99 |
| /de/en/articles/explore-the-world/eat-see-do-algiers | 390 | 9.38 | 8366 | 14.01 | 8394 | 14.01 | 4.63 |
| /de/en/articles/explore-the-world/eat-see-do-algiers | 1440 | 7.72 | 6527 | 10.18 | 6514 | 10.18 | 2.46 |
| /de/en/articles/explore-the-world/essentials-barcelona-facts | 390 | 7.37 | 6039 | 10.95 | 6067 | = | 3.58 |
| /de/en/articles/explore-the-world/essentials-barcelona-facts | 1440 | 3.92 | 5387 | 5.91 | 5422 | = | 1.99 |
| /de/en/articles/explore-the-world/eat-see-do-berlin | 390 | 8.46 | 9799 | 15.04 | 9827 | 15.04 | 6.58 |
| /de/en/articles/explore-the-world/eat-see-do-berlin | 1440 | 4.87 | 7122 | 8.11 | 7109 | 8.11 | 3.24 |
| /de/en/articles/explore-the-world/in-my-hood-chiswick-london | 390 | 7.73 | 7214 | 8.41 | 7225 | 9.41 | 0.68 |
| /de/en/articles/explore-the-world/in-my-hood-chiswick-london | 1440 | 4.34 | 5180 | 4.27 | 5181 | 4.41 | -0.07 |
| /de/en/articles/explore-the-world/essentials-frankfurt-facts | 390 | 3.65 | 5023 | 5.82 | 5025 | = | 2.17 |
| /de/en/articles/explore-the-world/essentials-frankfurt-facts | 1440 | 5.14 | 5137 | 6.13 | 5145 | = | 0.99 |
| /de/en/articles/explore-the-world/in-my-hood-district-zurich | 390 | 5.45 | 8113 | 5.48 | 8109 | = | 0.03 |
| /de/en/articles/explore-the-world/in-my-hood-district-zurich | 1440 | 3.58 | 5440 | 4.56 | 5423 | = | 0.98 |
| /de/en/articles/explore-the-world/know-before-you-go-berlin | 390 | 7.74 | 7425 | 7.89 | 7421 | 13.6 | 0.15 |
| /de/en/articles/explore-the-world/know-before-you-go-berlin | 1440 | 4.63 | 7458 | 6.94 | 7433 | 7.64 | 2.31 |
| /de/en/articles/explore-the-world/know-before-you-go-algiers | 390 | 8 | 7479 | 8.05 | 7475 | 13.91 | 0.05 |
| /de/en/articles/explore-the-world/know-before-you-go-algiers | 1440 | 4.28 | 7417 | 6.79 | 7392 | 7.21 | 2.51 |
| /de/en/articles/explore-the-world/on-the-scene-food-trends-istanbul | 390 | 4.91 | 7090 | 5.21 | 7084 | = | 0.30 |
| /de/en/articles/explore-the-world/on-the-scene-food-trends-istanbul | 1440 | 5.93 | 5217 | 5.97 | 5217 | = | 0.04 |
| /de/en/articles/explore-the-world/on-the-scene-caspar-plautz-munich | 390 | 7.65 | 6801 | 8.42 | 6781 | = | 0.77 |
| /de/en/articles/explore-the-world/on-the-scene-caspar-plautz-munich | 1440 | 4.05 | 5146 | 6.05 | 5105 | = | 2.00 |
| /de/en/articles/explore-the-world/picture-perfect-austin | 390 | 25.42 | 10433 | 25.36 | 10429 | = | -0.06 |
| /de/en/articles/explore-the-world/picture-perfect-austin | 1440 | 18.75 | 8001 | 18.92 | 7984 | = | 0.17 |
| /de/en/articles/explore-the-world/stop-over-tokyo | 390 | 8.91 | 7378 | 10.32 | 7342 | 10.32 | 1.41 |
| /de/en/articles/explore-the-world/stop-over-tokyo | 1440 | 7.64 | 6240 | 9.75 | 6188 | 9.75 | 2.11 |
| /de/en/articles/explore-the-world/what-i-learned-living-in-barcelona | 390 | 11.67 | 9049 | 14.17 | 9069 | = | 2.50 |
| /de/en/articles/explore-the-world/what-i-learned-living-in-barcelona | 1440 | 4.92 | 5921 | 7.11 | 5915 | = | 2.19 |
| /de/en/articles/highlights/all-it-takes-is-a-yes | 390 | 13.43 | 7476 | 13.43 | 7476 | = | 0.00 |
| /de/en/articles/highlights/all-it-takes-is-a-yes | 1440 | 6.64 | 6748 | 6.64 | 6748 | = | 0.00 |
| /de/en/articles/explore-the-world/what-i-learned-living-in-frankfurt | 390 | 7.58 | 6091 | 8.45 | 6089 | = | 0.87 |
| /de/en/articles/explore-the-world/what-i-learned-living-in-frankfurt | 1440 | 4.6 | 4519 | 6.64 | 4503 | = | 2.04 |
| /de/en/articles/highlights | 390 | 0.66 | 9456 | 0.66 | 9456 | = | 0.00 |
| /de/en/articles/highlights | 1440 | 1.3 | 6844 | 1.3 | 6844 | = | 0.00 |
| /de/en/articles/tags | 390 | 2.85 | 2476 | 6.36 | 2472 | = | 3.51 |
| /de/en/articles/tags | 1440 | 1.2 | 1988 | 7.97 | 1963 | = | 6.77 |
| /de/en/articles/tags/allegris | 390 | 3.88 | 7893 | 10.03 | 7940 | = | 6.15 |
| /de/en/articles/tags/allegris | 1440 | 9.01 | 7412 | 8.71 | 7479 | = | -0.30 |
| /de/en/articles/highlights/allegris-premium-economy-san-diego | 390 | 6.72 | 7287 | 15.78 | 7337 | 15.78 | 9.06 |
| /de/en/articles/highlights/allegris-premium-economy-san-diego | 1440 | 8.12 | 6747 | 16.89 | 6772 | 16.89 | 8.77 |
| /de/en/automatic-check-in | 390 | 6.75 | 4497 | 5.76 | 4525 | 7.25 | -0.99 |
| /de/en/automatic-check-in | 1440 | 3.37 | 2980 | 4.52 | 3011 | 8.29 | 1.15 |
| /de/en/assistenzhunde | 390 | 10.18 | 3733 | 9.08 | 3714 | 9.08 | -1.10 |
| /de/en/assistenzhunde | 1440 | 7.97 | 2328 | 7.29 | 2336 | 7.29 | -0.68 |
| /de/en/articles/tags/munich | 390 | 16.61 | 8795 | 18.74 | 8758 | = | 2.13 |
| /de/en/articles/tags/munich | 1440 | 13.06 | 7482 | 13.98 | 7418 | = | 0.92 |
| /de/en/baggage-irregularities | 390 | 8.15 | 5148 | 11.41 | 5071 | 9.69 | 3.26 |
| /de/en/baggage-irregularities | 1440 | 8.98 | 3834 | 13.85 | 3757 | 10.91 | 4.87 |
| /de/en/baggage | 390 | 5.01 | 7340 | 6.13 | 7336 | 13.79 | 1.12 |
| /de/en/baggage | 1440 | 1.71 | 4627 | 1.98 | 4627 | 11.96 | 0.27 |
| /de/en/besondere-befoerderungsbedingungen-bus | 390 | 9.12 | 15385 | 9.12 | 15433 | = | 0.00 |
| /de/en/besondere-befoerderungsbedingungen-bus | 1440 | 3.99 | 9258 | 4.2 | 9282 | = | 0.21 |
| /de/en/bid-upgrade | 390 | 7.98 | 5020 | 7.98 | 5020 | = | 0.00 |
| /de/en/bid-upgrade | 1440 | 2.3 | 3889 | 2.3 | 3889 | = | 0.00 |
| /de/en/boeing787 | 390 | 7.44 | 8326 | 7.69 | 8344 | 9.39 | 0.25 |
| /de/en/boeing787 | 1440 | 5.99 | 7520 | 4.7 | 7544 | 7.19 | -1.29 |
| /de/en/boarding | 390 | 4.84 | 4510 | 5.3 | 4505 | = | 0.46 |
| /de/en/boarding | 1440 | 1.81 | 3185 | 1.8 | 3180 | = | -0.01 |
| /de/en/book-and-manage/additional-services/get-your-guide | 390 | 3.87 | 2310 | 8.86 | 2366 | = | 4.99 |
| /de/en/book-and-manage/additional-services/get-your-guide | 1440 | 1.01 | 1969 | 12.36 | 2106 | = | 11.35 |
| /de/en/book-and-manage/additional-services/travel-insurances | 390 | 11 | 3486 | 16.99 | 3563 | = | 5.99 |
| /de/en/book-and-manage/additional-services/travel-insurances | 1440 | 10.23 | 2813 | 18.66 | 2920 | = | 8.43 |
| /de/en/book-and-manage/cancellation-and-refund/refund/refund-form | 390 | 7.31 | 5016 | 9.88 | 5085 | 10.64 | 2.57 |
| /de/en/book-and-manage/cancellation-and-refund/refund/refund-form | 1440 | 3.78 | 3886 | 5 | 3982 | 5.94 | 1.22 |
| /de/en/book-and-manage/digital-self-services/airline-apps | 390 | 4.18 | 3443 | 5.83 | 3491 | = | 1.65 |
| /de/en/book-and-manage/digital-self-services/airline-apps | 1440 | 2.22 | 1688 | 7.34 | 1736 | = | 5.12 |
| /de/en/book-and-manage/flights/air-baltic | 390 | 5.67 | 10457 | 5.73 | 10452 | 5.73 | 0.06 |
| /de/en/book-and-manage/flights/air-baltic | 1440 | 6.3 | 6577 | 6.04 | 6494 | 6.04 | -0.26 |
| /de/en/book-and-manage/flights/ana | 390 | 8.35 | 5138 | 12.35 | 5080 | = | 4.00 |
| /de/en/book-and-manage/flights/ana | 1440 | 6.35 | 3363 | 6.22 | 3363 | = | -0.13 |
| /de/en/book-and-manage/flights/giftvoucher | 390 | 23.04 | 3696 | 15.73 | 6974 | 15.73 | -7.31 |
| /de/en/book-and-manage/flights/giftvoucher | 1440 | 13.18 | 4368 | 11.54 | 4399 | 11.54 | -1.64 |
| /de/en/book-and-manage/flights/helvetic | 390 | 7.29 | 7466 | 8.15 | 7431 | 7.7 | 0.86 |
| /de/en/book-and-manage/flights/helvetic | 1440 | 4.53 | 5276 | 4.71 | 5241 | 3.62 | 0.18 |
| /de/en/book-and-manage/passenger-receipt-90days/confirmation | 390 | 4.17 | 1311 | 9.75 | 1281 | 7.12 | 5.58 |
| /de/en/book-and-manage/passenger-receipt-90days/confirmation | 1440 | 1.79 | 1116 | 7.65 | 1086 | 3.97 | 5.86 |
| /de/en/book-and-manage/flights/wetlease-hub | 390 | 5.33 | 3399 | 7.33 | 3362 | 6.29 | 2.00 |
| /de/en/book-and-manage/flights/wetlease-hub | 1440 | 1.67 | 2943 | 3.93 | 2971 | 3.93 | 2.26 |
| /de/en/book-and-manage/rebook | 390 | 6.62 | 2407 | 6.62 | 2407 | = | 0.00 |
| /de/en/book-and-manage/rebook | 1440 | 4.33 | 1886 | 4.33 | 1886 | = | 0.00 |
| /de/en/book-and-manage/pax-receipt | 390 | 6.93 | 2495 | 8.55 | 2475 | 6.93 | 1.62 |
| /de/en/book-and-manage/pax-receipt | 1440 | 3.01 | 2093 | 4.12 | 2073 | 3.01 | 1.11 |
| /de/en/book-and-manage/pax-receipt/invoices-different-countries | 390 | 6.46 | 2262 | 5.52 | 2289 | 5.52 | -0.94 |
| /de/en/book-and-manage/pax-receipt/invoices-different-countries | 1440 | 3.17 | 2045 | 2.96 | 2072 | 2.96 | -0.21 |
| /de/en/book-and-manage/rebook/involuntary-rebooking | 390 | 8.72 | 7667 | 8.72 | 7667 | = | 0.00 |
| /de/en/book-and-manage/rebook/involuntary-rebooking | 1440 | 4.43 | 4841 | 4.43 | 4841 | = | 0.00 |
| /de/en/book-and-manage/rebook/voluntary-rebooking | 390 | 9.17 | 9651 | 9.17 | 9651 | = | 0.00 |
| /de/en/book-and-manage/rebook/voluntary-rebooking | 1440 | 5.4 | 6050 | 5.4 | 6050 | = | 0.00 |
| /de/en/business-class-on-short-and-medium-haul | 390 | 7.31 | 3910 | 9.56 | 3958 | = | 2.25 |
| /de/en/business-class-on-short-and-medium-haul | 1440 | 2.69 | 2868 | 6.44 | 2916 | = | 3.75 |
| /de/en/business-terms-and-conditions | 390 | 4.68 | 2902 | 7.28 | 2950 | = | 2.60 |
| /de/en/business-terms-and-conditions | 1440 | 2.32 | 1789 | 7.77 | 1837 | = | 5.45 |
| /de/en/cancellations-and-refunds | 390 | 7.68 | 3115 | 13.84 | 3126 | = | 6.16 |
| /de/en/cancellations-and-refunds | 1440 | 3.54 | 2370 | 12.42 | 2341 | = | 8.88 |
| /de/en/carry-on-baggage | 390 | 6.45 | 9626 | 6.5 | 9637 | 6.41 | 0.05 |
| /de/en/carry-on-baggage | 1440 | 7.32 | 6526 | 10.62 | 6479 | 7.32 | 3.30 |
| /de/en/check-in-baggage | 390 | 7.28 | 3311 | 9.52 | 3343 | = | 2.24 |
| /de/en/check-in-baggage | 1440 | 6.17 | 3445 | 8.53 | 3477 | = | 2.36 |
| /de/en/check-in-with-the-family | 390 | 2.95 | 3299 | 12.72 | 3283 | = | 9.77 |
| /de/en/check-in-with-the-family | 1440 | 1.74 | 2538 | 9.11 | 2522 | = | 7.37 |
| /de/en/cash-and-miles | 390 | 11.65 | 4094 | 13.48 | 4062 | = | 1.83 |
| /de/en/cash-and-miles | 1440 | 10.35 | 2922 | 12.42 | 2890 | = | 2.07 |
| /de/en/childrens-menus-on-board | 390 | 6.09 | 5402 | 14.88 | 5515 | 26.9 | 8.79 |
| /de/en/childrens-menus-on-board | 1440 | 0.91 | 3971 | 11 | 4076 | 21.44 | 10.09 |
| /de/en/children-on-board | 390 | 5.3 | 3642 | 5.3 | 3642 | = | 0.00 |
| /de/en/children-on-board | 1440 | 4.53 | 2404 | 7.56 | 2377 | = | 3.03 |
| /de/en/common/agb-extra-services-at-online-check-in | 390 | 6.59 | 2631 | 6.46 | 2632 | = | -0.13 |
| /de/en/common/agb-extra-services-at-online-check-in | 1440 | 1.6 | 2327 | 1.44 | 2328 | = | -0.16 |
| /de/en/common/accessibility-statement | 390 | 7.42 | 9987 | 7.42 | 9987 | 7.42 | 0.00 |
| /de/en/common/accessibility-statement | 1440 | 6.73 | 6600 | 6.73 | 6600 | 6.73 | 0.00 |
| /de/en/common/compensation-voucher | 390 | 7.43 | 6726 | 7.43 | 6726 | = | 0.00 |
| /de/en/common/compensation-voucher | 1440 | 2.8 | 4210 | 2.8 | 4210 | = | 0.00 |
| /de/en/common/agb-extra-services-at-online-check-in/conditions-seat-reservation | 390 | 6.77 | 3568 | 6.77 | 3568 | = | 0.00 |
| /de/en/common/agb-extra-services-at-online-check-in/conditions-seat-reservation | 1440 | 5.53 | 2675 | 5.53 | 2675 | = | 0.00 |
| /de/en/common/imprint/lufthansa-insights-imprint | 390 | 4.54 | 4860 | 8.58 | 4758 | = | 4.04 |
| /de/en/common/imprint/lufthansa-insights-imprint | 1440 | 1.75 | 2903 | 5.85 | 2852 | = | 4.10 |
| /de/en/cookie-policy | 390 | 6.06 | 12411 | 6.33 | 12212 | = | 0.27 |
| /de/en/cookie-policy | 1440 | 2.98 | 9862 | 2.97 | 9726 | = | -0.01 |
| /de/en/common/privacy-statement/privacy-statement-group | 390 | 10 | 1924 | 10 | 1924 | 10 | 0.00 |
| /de/en/common/privacy-statement/privacy-statement-group | 1440 | 3.51 | 1470 | 5.41 | 1495 | 5.41 | 1.90 |
| /de/en/culinaryjourney | 390 | 32.63 | 1620 | 32.63 | 1620 | = | 0.00 |
| /de/en/culinaryjourney | 1440 | 10.52 | 1524 | 10.52 | 1524 | = | 0.00 |
| /de/en/common/seatreservation-condtions/seat-reservations | 390 | 10.08 | 4167 | 10.08 | 4167 | = | 0.00 |
| /de/en/common/seatreservation-condtions/seat-reservations | 1440 | 4.96 | 2877 | 4.85 | 2878 | = | -0.11 |
| /de/en/dangerous-dogs | 390 | 12.55 | 3999 | 10.09 | 4023 | = | -2.46 |
| /de/en/dangerous-dogs | 1440 | 3 | 2408 | 7.31 | 2456 | = | 4.31 |
| /de/en/data-protection-information | 390 | 5.36 | 29408 | 4.54 | 29553 | = | -0.82 |
| /de/en/data-protection-information | 1440 | 4.44 | 15904 | 4.43 | 16059 | = | -0.01 |
| /de/en/data-collection-usa | 390 | 4.72 | 7398 | 6.16 | 7412 | = | 1.44 |
| /de/en/data-collection-usa | 1440 | 4.3 | 5318 | 4.63 | 5334 | = | 0.33 |
| /de/en/data-collection-canada | 390 | 9.93 | 5472 | 12.65 | 5535 | = | 2.72 |
| /de/en/data-collection-canada | 1440 | 8.17 | 4199 | 10.31 | 4183 | = | 2.14 |
| /de/en/digital-baggage-services | 390 | 5.37 | 4869 | 6.34 | 4893 | = | 0.97 |
| /de/en/digital-baggage-services | 1440 | 5.95 | 3720 | 5.5 | 3744 | = | -0.45 |
| /de/en/datenschutz | 390 | 7.83 | 1822 | 12.73 | 1870 | = | 4.90 |
| /de/en/datenschutz | 1440 | 8.51 | 1574 | 9.24 | 1580 | = | 0.73 |
| /de/en/discover-lufthansa/carbon-offsetting/climate-protection-projects | 390 | 7.97 | 6070 | 7.97 | 6070 | = | 0.00 |
| /de/en/discover-lufthansa/carbon-offsetting/climate-protection-projects | 1440 | 4.01 | 4479 | 4.01 | 4479 | = | 0.00 |
| /de/en/discover-lufthansa/carbon-offsetting/saf | 390 | 6.59 | 5138 | 10.18 | 5226 | = | 3.59 |
| /de/en/discover-lufthansa/carbon-offsetting/saf | 1440 | 3.31 | 3581 | 8.08 | 3669 | = | 4.77 |
| /de/en/discover-lufthansa/flightreservation-priceguarantee | 390 | 12.72 | 4781 | 11.17 | 4819 | 10.53 | -1.55 |
| /de/en/discover-lufthansa/flightreservation-priceguarantee | 1440 | 4.7 | 3728 | 5.12 | 3766 | 5.99 | 0.42 |
| /de/en/discover-lufthansa/lufthansa-fleet/351 | 390 | 8.53 | 8627 | 9.79 | 8607 | = | 1.26 |
| /de/en/discover-lufthansa/lufthansa-fleet/351 | 1440 | 4.88 | 7756 | 7.4 | 7783 | = | 2.52 |
| /de/en/discover-lufthansa/lufthansa-group-airlines/ita-airways | 390 | 7.06 | 5493 | 7.06 | 5493 | = | 0.00 |
| /de/en/discover-lufthansa/lufthansa-group-airlines/ita-airways | 1440 | 6.25 | 3757 | 6.9 | 3796 | = | 0.65 |
| /de/en/discover-lufthansa/new-onboard-experience | 390 | 7.47 | 18227 | 7.47 | 18227 | 18.53 | 0.00 |
| /de/en/discover-lufthansa/new-onboard-experience | 1440 | 6.19 | 15128 | 21.13 | 15178 | 31.82 | 14.94 |
| /de/en/discover-lufthansa/miles-and-more-credit-card | 390 | 8.56 | 8648 | 8.56 | 8648 | 8.95 | 0.00 |
| /de/en/discover-lufthansa/miles-and-more-credit-card | 1440 | 10.48 | 5054 | 10.48 | 5054 | 9.7 | 0.00 |
| /de/en/discover-lufthansa/take-off | 390 | 4.75 | 6911 | 16.4 | 6895 | = | 11.65 |
| /de/en/discover-lufthansa/take-off | 1440 | 1.76 | 4528 | 12.83 | 4512 | = | 11.07 |
| /de/en/doctor-on-board-news | 390 | 9.61 | 2386 | 12.72 | 2332 | 11.02 | 3.11 |
| /de/en/doctor-on-board-news | 1440 | 7.31 | 2440 | 17.63 | 2346 | 16.03 | 10.32 |
| /de/en/doctor-on-board | 390 | 6.03 | 4815 | 7.31 | 4784 | 6.63 | 1.28 |
| /de/en/doctor-on-board | 1440 | 3.48 | 3892 | 4.65 | 3829 | 3.69 | 1.17 |
| /de/en/during-your-trip/food-and-beverages/onboard-delights/faq | 390 | 2.62 | 2459 | 6.14 | 2507 | = | 3.52 |
| /de/en/during-your-trip/food-and-beverages/onboard-delights/faq | 1440 | 1.08 | 1936 | 6.71 | 1984 | = | 5.63 |
| /de/en/during-your-trip/internet-overview | 390 | 13.89 | 4713 | 13.89 | 4713 | = | 0.00 |
| /de/en/during-your-trip/internet-overview | 1440 | 5.15 | 3142 | 5.15 | 3142 | = | 0.00 |
| /de/en/during-your-trip/lhg-wifi | 390 | 11.38 | 6149 | 12.43 | 6171 | = | 1.05 |
| /de/en/during-your-trip/lhg-wifi | 1440 | 8.96 | 4037 | 11.4 | 4125 | = | 2.44 |
| /de/en/economy-class | 390 | 11.92 | 10009 | 11.92 | 10009 | 14.3 | 0.00 |
| /de/en/economy-class | 1440 | 7.17 | 8273 | 7.17 | 8273 | 8.25 | 0.00 |
| /de/en/electronic-bag-tags | 390 | 6 | 3813 | 6.81 | 3784 | 5.31 | 0.81 |
| /de/en/electronic-bag-tags | 1440 | 3.42 | 2858 | 5.31 | 2829 | 4.09 | 1.89 |
| /de/en/europa-tarife-economy-class | 390 | 7.99 | 7407 | 8.55 | 7377 | 7.03 | 0.56 |
| /de/en/europa-tarife-economy-class | 1440 | 4.26 | 5472 | 2.95 | 5442 | 4.64 | -1.31 |
| /de/en/europcar | 390 | 2.41 | 4330 | 3.9 | 4388 | 3.9 | 1.49 |
| /de/en/europcar | 1440 | 3.8 | 3021 | 3.24 | 3010 | 3.24 | -0.56 |
| /de/en/exclusive-charter | 390 | 8.68 | 2718 | 25.06 | 2814 | = | 16.38 |
| /de/en/exclusive-charter | 1440 | 4.86 | 2103 | 16.8 | 2199 | = | 11.94 |
| /de/en/faq-data-security | 390 | 3.32 | 1556 | 8.87 | 1604 | = | 5.55 |
| /de/en/faq-data-security | 1440 | 0.97 | 1324 | 9.2 | 1372 | = | 8.23 |
| /de/en/entryprocesses | 390 | 5.51 | 5153 | 14.54 | 5211 | = | 9.03 |
| /de/en/entryprocesses | 1440 | 2.62 | 2777 | 14.8 | 2892 | = | 12.18 |
| /de/en/faq-password-security | 390 | 3.82 | 1595 | 9.25 | 1643 | = | 5.43 |
| /de/en/faq-password-security | 1440 | 0.9 | 1330 | 9.09 | 1378 | = | 8.19 |
| /de/en/farealert/best-price-alert | 390 | 7.91 | 5381 | 18.09 | 5240 | 17.56 | 10.18 |
| /de/en/farealert/best-price-alert | 1440 | 3.6 | 4361 | 14.39 | 4227 | 13.33 | 10.79 |
| /de/en/feedback | 390 | 8.47 | 3652 | 7.3 | 3680 | 8.54 | -1.17 |
| /de/en/feedback | 1440 | 2.47 | 3081 | 6.27 | 3136 | 9.08 | 3.80 |
| /de/en/feedback-past-flight | 390 | 9.25 | 7128 | 9.25 | 7128 | = | 0.00 |
| /de/en/feedback-past-flight | 1440 | 5.42 | 6133 | 5.42 | 6133 | = | 0.00 |
| /de/en/fia-valet-service | 390 | 3.39 | 4906 | 5.54 | 4863 | 5.54 | 2.15 |
| /de/en/fia-valet-service | 1440 | 1.97 | 3462 | 2.54 | 3443 | 2.54 | 0.57 |
| /de/en/feedback/feedbackai | 390 | 11.06 | 1198 | 8.83 | 1184 | = | -2.23 |
| /de/en/feedback/feedbackai | 1440 | 6.81 | 1049 | 4.06 | 1035 | = | -2.75 |
| /de/en/first-class | 390 | 16.73 | 23860 | 19.52 | 23536 | 19.52 | 2.79 |
| /de/en/first-class | 1440 | 8.83 | 21195 | 18.01 | 20923 | 18.01 | 9.18 |
| /de/en/first-class-lounges | 390 | 3.61 | 6115 | 3.61 | 6115 | = | 0.00 |
| /de/en/first-class-lounges | 1440 | 3.47 | 3995 | 2.15 | 4019 | = | -1.32 |
| /de/en/first-class-comfort | 390 | 3.13 | 3408 | 5.06 | 3432 | = | 1.93 |
| /de/en/first-class-comfort | 1440 | 4.84 | 2793 | 8.18 | 2841 | = | 3.34 |
| /de/en/first-class-personal-assistant | 390 | 2.39 | 3101 | 6.31 | 3125 | = | 3.92 |
| /de/en/first-class-personal-assistant | 1440 | 0.96 | 2210 | 6.54 | 2258 | = | 5.58 |
| /de/en/first-class-valet-parking-service | 390 | 5.13 | 2483 | 6.87 | 2491 | = | 1.74 |
| /de/en/first-class-valet-parking-service | 1440 | 2.15 | 1731 | 6.53 | 1763 | = | 4.38 |
| /de/en/first-class-terminal | 390 | 16.22 | 11203 | 27.94 | 11070 | 16.32 | 11.72 |
| /de/en/first-class-terminal | 1440 | 6.28 | 12515 | 32.59 | 12341 | 26.73 | 26.31 |
| /de/en/fliegen-mit-baby | 390 | 3.3 | 2885 | 7.59 | 2869 | = | 4.29 |
| /de/en/fliegen-mit-baby | 1440 | 4.98 | 2233 | 6.79 | 2217 | = | 1.81 |
| /de/en/flight-disruptions | 390 | 8.94 | 7906 | 14.57 | 7973 | 16.51 | 5.63 |
| /de/en/flight-disruptions | 1440 | 3.5 | 4868 | 6.16 | 4893 | 8.61 | 2.66 |
| /de/en/flight-search | 390 | 7.05 | 3411 | 8.05 | 3409 | = | 1.00 |
| /de/en/flight-search | 1440 | 4.62 | 2071 | 4.77 | 2071 | = | 0.15 |
| /de/en/fly-more-sustainabl | 390 | 7.6 | 5958 | 8.69 | 5934 | = | 1.09 |
| /de/en/fly-more-sustainabl | 1440 | 3.48 | 4137 | 3.81 | 4113 | = | 0.33 |
| /de/en/flying-with-small-children | 390 | 9.24 | 4359 | 10.6 | 4343 | = | 1.36 |
| /de/en/flying-with-small-children | 1440 | 4.11 | 3403 | 4.54 | 3387 | = | 0.43 |
| /de/en/food-and-beverages | 390 | 6.72 | 6742 | 6.72 | 6742 | 23.39 | 0.00 |
| /de/en/food-and-beverages | 1440 | 2.19 | 5087 | 2.19 | 5087 | 18.75 | 0.00 |
| /de/en/fmg-valet-parking-service | 390 | 4.68 | 3737 | 4.81 | 3742 | 4.81 | 0.13 |
| /de/en/fmg-valet-parking-service | 1440 | 1.96 | 2959 | 3.29 | 2940 | 3.29 | 1.33 |
| /de/en/free2move | 390 | 4.07 | 4388 | 6.2 | 4407 | 6.95 | 2.13 |
| /de/en/free2move | 1440 | 4.8 | 3024 | 4.23 | 3078 | 4.23 | -0.57 |
| /de/en/general-conditions-currency-conversion | 390 | 2.52 | 2813 | 5.53 | 2861 | 7.3 | 3.01 |
| /de/en/general-conditions-currency-conversion | 1440 | 0.94 | 1968 | 6.34 | 2016 | 8.53 | 5.40 |
| /de/en/green-fare | 390 | 4.34 | 7320 | 4.58 | 7312 | = | 0.24 |
| /de/en/green-fare | 1440 | 2.67 | 5671 | 3.18 | 5647 | = | 0.51 |
| /de/en/gefaehrliche-gegenstaende | 390 | 8.49 | 8544 | 8.92 | 8563 | = | 0.43 |
| /de/en/gefaehrliche-gegenstaende | 1440 | 6.47 | 4981 | 4.63 | 5024 | = | -1.84 |
| /de/en/group-travel | 390 | 5.99 | 8526 | 7.02 | 8484 | = | 1.03 |
| /de/en/group-travel | 1440 | 4.49 | 7664 | 4.19 | 7606 | = | -0.30 |
| /de/en/homepage | 390 | 5.47 | 6161 | 5.69 | 6213 | = | 0.22 |
| /de/en/homepage | 1440 | 6 | 5010 | 6.04 | 5009 | = | 0.04 |
| /de/en/hotel-offers | 390 | 10.16 | 4548 | 11.85 | 4503 | 11.09 | 1.69 |
| /de/en/hotel-offers | 1440 | 4.8 | 3433 | 10.45 | 3499 | 10.45 | 5.65 |
| /de/en/imprint | 390 | 7.07 | 4102 | 10.01 | 4167 | = | 2.94 |
| /de/en/imprint | 1440 | 3.57 | 2483 | 7.1 | 2515 | = | 3.53 |
| /de/en/lounge-companions | 390 | 7.23 | 4813 | 9.12 | 4852 | 9.12 | 1.89 |
| /de/en/lounge-companions | 1440 | 4.25 | 3499 | 4.38 | 3450 | 4.38 | 0.13 |
| /de/en/lufthansa-am-flughafen-frankfurt | 390 | 9.68 | 6700 | 9.68 | 6700 | = | 0.00 |
| /de/en/lufthansa-am-flughafen-frankfurt | 1440 | 7.43 | 4068 | 7.43 | 4068 | = | 0.00 |
| /de/en/lufthansa-at-duesseldorf-airport | 390 | 3.27 | 3902 | 6.55 | 3910 | = | 3.28 |
| /de/en/lufthansa-at-duesseldorf-airport | 1440 | 1.76 | 2876 | 4.97 | 2908 | = | 3.21 |
| /de/en/lufthansa-at-berlin-airport | 390 | 7.01 | 4274 | 7.01 | 4274 | = | 0.00 |
| /de/en/lufthansa-at-berlin-airport | 1440 | 2.76 | 2919 | 4.25 | 2895 | = | 1.49 |
| /de/en/lufthansa-at-zuerich-airport | 390 | 5.86 | 3047 | 7.36 | 3031 | = | 1.50 |
| /de/en/lufthansa-at-zuerich-airport | 1440 | 3.31 | 2558 | 4.57 | 2518 | = | 1.26 |
| /de/en/lufthansa-aviation-group | 390 | 14.04 | 3783 | 13.25 | 3831 | = | -0.79 |
| /de/en/lufthansa-aviation-group | 1440 | 5.38 | 2751 | 9.37 | 2799 | = | 3.99 |
| /de/en/lufthansa-at-vienna-airport | 390 | 5.44 | 2999 | 5.25 | 3007 | = | -0.19 |
| /de/en/lufthansa-at-vienna-airport | 1440 | 2.8 | 2483 | 4.78 | 2515 | = | 1.98 |
| /de/en/lufthansa-business-class-on-long-haul-routes | 390 | 13.33 | 4508 | 26.44 | 4576 | = | 13.11 |
| /de/en/lufthansa-business-class-on-long-haul-routes | 1440 | 6.46 | 3184 | 23.29 | 3282 | = | 16.83 |
| /de/en/lufthansa-corporate-customers | 390 | 12.09 | 4147 | 12.72 | 4179 | = | 0.63 |
| /de/en/lufthansa-corporate-customers | 1440 | 2.61 | 3380 | 9.7 | 3412 | = | 7.09 |
| /de/en/lufthansa-express | 390 | 8.56 | 6372 | 11.52 | 6476 | = | 2.96 |
| /de/en/lufthansa-express | 1440 | 6.29 | 4089 | 9.88 | 4193 | = | 3.59 |
| /de/en/lufthansa-express-bus | 390 | 8.9 | 7794 | 9.35 | 7806 | 12.4 | 0.45 |
| /de/en/lufthansa-express-bus | 1440 | 4.12 | 4897 | 5.81 | 4909 | 7.28 | 1.69 |
| /de/en/lufthansa-first-class-entertainment | 390 | 4.22 | 3793 | 9.35 | 3816 | 9.35 | 5.13 |
| /de/en/lufthansa-first-class-entertainment | 1440 | 6.58 | 3064 | 7.22 | 3078 | 7.22 | 0.64 |
| /de/en/lufthansa-express-rail | 390 | 7.25 | 10710 | 7.9 | 10774 | 6.9 | 0.65 |
| /de/en/lufthansa-express-rail | 1440 | 6.08 | 7707 | 7.57 | 7692 | 6.02 | 1.49 |
| /de/en/lufthansa-first-class-fleet | 390 | 4.2 | 4233 | 13.47 | 4207 | 12.65 | 9.27 |
| /de/en/lufthansa-first-class-fleet | 1440 | 6.68 | 4182 | 6.34 | 4156 | 7.37 | -0.34 |
| /de/en/lufthansa-group-star-alliance-and-partner-airlines | 390 | 11.49 | 10518 | 10.73 | 10462 | = | -0.76 |
| /de/en/lufthansa-group-star-alliance-and-partner-airlines | 1440 | 7.37 | 6003 | 8.12 | 5931 | = | 0.75 |
| /de/en/lufthansa-guide-service | 390 | 8.59 | 5652 | 8.55 | 5650 | = | -0.04 |
| /de/en/lufthansa-guide-service | 1440 | 4.33 | 3802 | 5.44 | 3921 | = | 1.11 |
| /de/en/lufthansa-terminal-muenchen | 390 | 10.22 | 6576 | 8.12 | 6576 | = | -2.10 |
| /de/en/lufthansa-terminal-muenchen | 1440 | 6.93 | 4219 | 4.71 | 4267 | = | -2.22 |
| /de/en/medikamenten-transport | 390 | 10.41 | 4180 | 10.41 | 4180 | 15.05 | 0.00 |
| /de/en/medikamenten-transport | 1440 | 2.62 | 2838 | 2.62 | 2838 | 6.59 | 0.00 |
| /de/en/meetings-and-events-delegates | 390 | 6.03 | 2909 | 6.29 | 2893 | = | 0.26 |
| /de/en/meetings-and-events-delegates | 1440 | 2.07 | 2314 | 3.72 | 2322 | = | 1.65 |
| /de/en/meetings-and-events-organisers | 390 | 6.29 | 4089 | 10.03 | 4177 | = | 3.74 |
| /de/en/meetings-and-events-organisers | 1440 | 2.19 | 2886 | 8.41 | 2998 | = | 6.22 |
| /de/en/menus-on-long-haul-flights | 390 | 3.46 | 4586 | 7.41 | 4566 | = | 3.95 |
| /de/en/menus-on-long-haul-flights | 1440 | 1.88 | 3243 | 8 | 3218 | = | 6.12 |
| /de/en/mobility-partner-program-healthcare | 390 | 6.15 | 4744 | 9.97 | 4678 | 9.19 | 3.82 |
| /de/en/mobility-partner-program-healthcare | 1440 | 7.83 | 3506 | 11.59 | 3466 | 11.59 | 3.76 |
| /de/en/menus-travel-classes | 390 | 3.97 | 3111 | 6.5 | 3159 | = | 2.53 |
| /de/en/menus-travel-classes | 1440 | 1.58 | 2250 | 5.87 | 2298 | = | 4.29 |
| /de/en/my-bookings | 390 | 8.21 | 5315 | 10.72 | 5252 | 6.98 | 2.51 |
| /de/en/my-bookings | 1440 | 1.2 | 3647 | 4.37 | 3599 | 5.49 | 3.17 |
| /de/en/munich-fair | 390 | 6.1 | 3157 | 6.1 | 3157 | = | 0.00 |
| /de/en/munich-fair | 1440 | 9.8 | 2412 | 11.31 | 2451 | = | 1.51 |
| /de/en/my-logbook | 390 | 9.4 | 3441 | 11.67 | 3449 | = | 2.27 |
| /de/en/my-logbook | 1440 | 4.58 | 3110 | 10.67 | 3142 | = | 6.09 |
| /de/en/onboard-delights | 390 | 10.99 | 9445 | 13.91 | 9527 | 17.75 | 2.92 |
| /de/en/onboard-delights | 1440 | 4.84 | 7319 | 10.69 | 7401 | 17.12 | 5.85 |
| /de/en/online-check-in | 390 | 11.29 | 5694 | 10.46 | 5689 | = | -0.83 |
| /de/en/online-check-in | 1440 | 4.92 | 3567 | 4.83 | 3559 | = | -0.09 |
| /de/en/online-check-in-info | 390 | 5.54 | 3001 | 8.04 | 3041 | = | 2.50 |
| /de/en/online-check-in-info | 1440 | 3.34 | 2655 | 8.39 | 2749 | = | 5.05 |
| /de/en/overview-special-request | 390 | 5.79 | 3936 | 5.79 | 3936 | = | 0.00 |
| /de/en/overview-special-request | 1440 | 2.46 | 2746 | 2.46 | 2746 | = | 0.00 |
| /de/en/partner | 390 | 6.79 | 3425 | 6.79 | 3425 | = | 0.00 |
| /de/en/partner | 1440 | 3.76 | 2684 | 3.76 | 2684 | = | 0.00 |
| /de/en/passenger-receipt-90 | 390 | 9.17 | 4082 | 11.27 | 4130 | = | 2.10 |
| /de/en/passenger-receipt-90 | 1440 | 2.32 | 3310 | 3.19 | 3334 | = | 0.87 |
| /de/en/passenger-rights | 390 | 6.09 | 9121 | 6.57 | 9097 | 5.34 | 0.48 |
| /de/en/passenger-rights | 1440 | 3.07 | 5803 | 4.37 | 5763 | 3.5 | 1.30 |
| /de/en/payment-options-at-the-airport | 390 | 7.04 | 3303 | 5.83 | 3327 | 5.83 | -1.21 |
| /de/en/payment-options-at-the-airport | 1440 | 0.94 | 2542 | 3.56 | 2570 | 3.56 | 2.62 |
| /de/en/passengers-with-sensory-impairment | 390 | 3.72 | 14722 | 3.71 | 14647 | 3.66 | -0.01 |
| /de/en/passengers-with-sensory-impairment | 1440 | 3.28 | 8447 | 6.23 | 8375 | 5.69 | 2.95 |
| /de/en/passengers-using-wheelchairs | 390 | 7.53 | 20239 | 6.82 | 20214 | 6.82 | -0.71 |
| /de/en/passengers-using-wheelchairs | 1440 | 4.51 | 11169 | 4.46 | 11103 | 4.47 | -0.05 |
| /de/en/pre-check-in | 390 | 4.89 | 3555 | 6.81 | 3583 | 7.91 | 1.92 |
| /de/en/pre-check-in | 1440 | 3.29 | 2379 | 6.41 | 2431 | 8.08 | 3.12 |
| /de/en/prepare-for-your-trip/baggage/baggage-conditions | 390 | 3.16 | 3414 | 3.49 | 3409 | = | 0.33 |
| /de/en/prepare-for-your-trip/baggage/baggage-conditions | 1440 | 6.2 | 2154 | 5.02 | 2142 | = | -1.18 |
| /de/en/prepare-for-your-trip/baggage/baggage-irregularities/delayed-baggage-lhg | 390 | 5.88 | 4424 | 7.77 | 4397 | 6.63 | 1.89 |
| /de/en/prepare-for-your-trip/baggage/baggage-irregularities/delayed-baggage-lhg | 1440 | 2.92 | 2751 | 4.12 | 2745 | 4.44 | 1.20 |
| /de/en/prepare-for-your-trip/baggage/baggage-irregularities/faq-damaged-baggage | 390 | 3.02 | 2683 | 6.31 | 2731 | = | 3.29 |
| /de/en/prepare-for-your-trip/baggage/baggage-irregularities/faq-damaged-baggage | 1440 | 1.15 | 2239 | 6.11 | 2287 | = | 4.96 |
| /de/en/prepare-for-your-trip/baggage/baggage-irregularities/faq-baggage-delay | 390 | 8.15 | 4824 | 12.25 | 4883 | = | 4.10 |
| /de/en/prepare-for-your-trip/baggage/baggage-irregularities/faq-baggage-delay | 1440 | 8.27 | 3620 | 5.89 | 3676 | = | -2.38 |
| /de/en/premium-economy-class | 390 | 12 | 9223 | 12 | 9223 | 13.89 | 0.00 |
| /de/en/premium-economy-class | 1440 | 7.09 | 7057 | 7.09 | 7057 | 5 | 0.00 |
| /de/en/prepare-for-your-trip/baggage/electronic-devices-and-batteries | 390 | 8 | 7109 | 9.53 | 7134 | = | 1.53 |
| /de/en/prepare-for-your-trip/baggage/electronic-devices-and-batteries | 1440 | 4.57 | 4388 | 5.05 | 4413 | = | 0.48 |
| /de/en/prepare-for-your-trip/baggage/baggage-irregularities/report-baggage | 390 | 5.54 | 4957 | 7.08 | 4910 | 7.08 | 1.54 |
| /de/en/prepare-for-your-trip/baggage/baggage-irregularities/report-baggage | 1440 | 5.09 | 2698 | 6.84 | 2719 | 6.84 | 1.75 |
| /de/en/prepare-for-your-trip/baggage/sport-baggage/register-sports-baggage/confirmation | 390 | 5.06 | 1809 | 8.27 | 1779 | 6.16 | 3.21 |
| /de/en/prepare-for-your-trip/baggage/sport-baggage/register-sports-baggage/confirmation | 1440 | 2.08 | 1465 | 8.9 | 1411 | 6.34 | 6.82 |
| /de/en/prepare-for-your-trip/baggage/sport-baggage/register-sporting-firearm/confirmation | 390 | 4.12 | 1575 | 8.77 | 1545 | 6.58 | 4.65 |
| /de/en/prepare-for-your-trip/baggage/sport-baggage/register-sporting-firearm/confirmation | 1440 | 1.63 | 1218 | 6.97 | 1188 | 3.62 | 5.34 |
| /de/en/prepare-for-your-trip/baggage/travelling-with-animals/register-animal-cargo-hold/confirmation | 390 | 4.02 | 1575 | 8.66 | 1545 | 6.47 | 4.64 |
| /de/en/prepare-for-your-trip/baggage/travelling-with-animals/register-animal-cargo-hold/confirmation | 1440 | 1.59 | 1218 | 6.94 | 1188 | 3.58 | 5.35 |
| /de/en/prepare-for-your-trip/entry-regulations/entering-schengen/entry-exit-system | 390 | 13.62 | 8745 | 13.17 | 8791 | = | -0.45 |
| /de/en/prepare-for-your-trip/entry-regulations/entering-schengen/entry-exit-system | 1440 | 4.36 | 5567 | 4.79 | 5613 | = | 0.43 |
| /de/en/prepare-for-your-trip/baggage/travelling-with-animals/register-animal/confirmation | 390 | 4.02 | 1575 | 8.66 | 1545 | 6.47 | 4.64 |
| /de/en/prepare-for-your-trip/baggage/travelling-with-animals/register-animal/confirmation | 1440 | 1.59 | 1218 | 6.94 | 1188 | 3.58 | 5.35 |
| /de/en/prepare-for-your-trip/entry-regulations/immigration-regulations-uk | 390 | 4.89 | 3073 | 7.1 | 3097 | = | 2.21 |
| /de/en/prepare-for-your-trip/entry-regulations/immigration-regulations-uk | 1440 | 6.06 | 2592 | 3.53 | 2560 | = | -2.53 |
| /de/en/prepare-for-your-trip/getting-to-and-from-the-airport/lufthansa-express-bus-briefing | 390 | 11.36 | 3308 | 11.36 | 3308 | = | 0.00 |
| /de/en/prepare-for-your-trip/getting-to-and-from-the-airport/lufthansa-express-bus-briefing | 1440 | 5.35 | 2488 | 3.16 | 2515 | = | -2.19 |
| /de/en/prepare-for-your-trip/special-travel-needs/medical-travel-companions | 390 | 8.91 | 2703 | 8.91 | 2703 | = | 0.00 |
| /de/en/prepare-for-your-trip/special-travel-needs/medical-travel-companions | 1440 | 1.1 | 2545 | 1.1 | 2545 | = | 0.00 |
| /de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/cognitive-impairment | 390 | 5.86 | 12973 | 5.96 | 12867 | 6.09 | 0.10 |
| /de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/cognitive-impairment | 1440 | 12.71 | 7299 | 14.89 | 7168 | 14.11 | 2.18 |
| /de/en/prepare-for-your-trip/getting-to-and-from-the-airport/lufthansa-express-rail-briefing | 390 | 12.88 | 3477 | 12.88 | 3477 | = | 0.00 |
| /de/en/prepare-for-your-trip/getting-to-and-from-the-airport/lufthansa-express-rail-briefing | 1440 | 8.17 | 2612 | 8.17 | 2612 | = | 0.00 |
| /de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/hearing-impairment | 390 | 4.94 | 9759 | 7.78 | 9742 | 7.23 | 2.84 |
| /de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/hearing-impairment | 1440 | 4.36 | 5338 | 6.33 | 5326 | 5.09 | 1.97 |
| /de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/travel-companion | 390 | 8.38 | 8248 | 14.26 | 8221 | 12.93 | 5.88 |
| /de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/travel-companion | 1440 | 5.84 | 4849 | 9.22 | 4812 | 7.91 | 3.38 |
| /de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/special-needs-online-form/confirmation | 390 | 5.32 | 1312 | 11.87 | 1267 | = | 6.55 |
| /de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/special-needs-online-form/confirmation | 1440 | 2.37 | 1063 | 11.2 | 1018 | = | 8.83 |
| /de/en/prepare-for-your-trip/travel-classes/economy-basic | 390 | 12.27 | 4933 | 12.72 | 4930 | 8.47 | 0.45 |
| /de/en/prepare-for-your-trip/travel-classes/economy-basic | 1440 | 3.23 | 4082 | 5.86 | 4062 | 5.83 | 2.63 |
| /de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/visual-impairment | 390 | 4.34 | 10695 | 4.43 | 10678 | 4.47 | 0.09 |
| /de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/visual-impairment | 1440 | 5.04 | 5747 | 6.79 | 5736 | 5.83 | 1.75 |
| /de/en/prepare-for-your-trip/travelling-with-children/child-in-businessclass | 390 | 8.24 | 5780 | 9.32 | 5873 | = | 1.08 |
| /de/en/prepare-for-your-trip/travelling-with-children/child-in-businessclass | 1440 | 11.34 | 5082 | 9.3 | 5142 | = | -2.04 |
| /de/en/refund | 390 | 3.26 | 3202 | 4.3 | 3187 | 3.12 | 1.04 |
| /de/en/refund | 1440 | 1.71 | 2419 | 2.64 | 2404 | 2.32 | 0.93 |
| /de/en/rail-and-fly | 390 | 8.64 | 6662 | 9.11 | 6660 | = | 0.47 |
| /de/en/rail-and-fly | 1440 | 2.12 | 4714 | 8.32 | 4833 | = | 6.20 |
| /de/en/rail-fly-terms-and-conditions | 390 | 8.6 | 5131 | 7.51 | 5179 | = | -1.09 |
| /de/en/rail-fly-terms-and-conditions | 1440 | 5.11 | 3000 | 5.47 | 3048 | = | 0.36 |
| /de/en/register-animal-cabin | 390 | 8.04 | 7550 | 7.35 | 7520 | 7.66 | -0.69 |
| /de/en/register-animal-cabin | 1440 | 5.36 | 5589 | 4.4 | 5487 | 5.11 | -0.96 |
| /de/en/schengen | 390 | 6.8 | 4508 | 10.94 | 4428 | 10.14 | 4.14 |
| /de/en/schengen | 1440 | 4.63 | 3122 | 7.41 | 3042 | 6.23 | 2.78 |
| /de/en/secure-flight | 390 | 3.51 | 2060 | 6.49 | 2084 | = | 2.98 |
| /de/en/secure-flight | 1440 | 1.54 | 1247 | 9.42 | 1295 | = | 7.88 |
| /de/en/security-fast-lanes | 390 | 6 | 3554 | 8.31 | 3562 | = | 2.31 |
| /de/en/security-fast-lanes | 1440 | 5.27 | 3006 | 3.7 | 3038 | = | -1.57 |
| /de/en/security-check-time-slot | 390 | 3.94 | 2977 | 6.28 | 3003 | = | 2.34 |
| /de/en/security-check-time-slot | 1440 | 2.6 | 2852 | 6.67 | 2908 | = | 4.07 |
| /de/en/seat-maps | 390 | 7.39 | 5741 | 12.16 | 5675 | = | 4.77 |
| /de/en/seat-maps | 1440 | 3.59 | 4902 | 7.1 | 4859 | = | 3.51 |
| /de/en/services-at-frankfurt-airport | 390 | 5.75 | 3232 | 5.75 | 3232 | = | 0.00 |
| /de/en/services-at-frankfurt-airport | 1440 | 5.27 | 2273 | 7.12 | 2297 | = | 1.85 |
| /de/en/sepa-terms-and-conditions | 390 | 3.75 | 2477 | 11.82 | 2549 | = | 8.07 |
| /de/en/sepa-terms-and-conditions | 1440 | 1.01 | 1795 | 10.8 | 1867 | = | 9.79 |
| /de/en/sepa-terms-and-conditions-b | 390 | 6.14 | 2730 | 10.88 | 2802 | = | 4.74 |
| /de/en/sepa-terms-and-conditions-b | 1440 | 2.86 | 1900 | 10.15 | 1972 | = | 7.29 |
| /de/en/services-at-the-airport | 390 | 6.41 | 3412 | 6.41 | 3412 | = | 0.00 |
| /de/en/services-at-the-airport | 1440 | 1.82 | 2827 | 1.82 | 2827 | = | 0.00 |
| /de/en/shopping | 390 | 8.84 | 9937 | 9.08 | 9914 | 9.08 | 0.24 |
| /de/en/shopping | 1440 | 4.07 | 5690 | 9.22 | 5627 | 8.62 | 5.15 |
| /de/en/services-munich-airport | 390 | 7.66 | 2079 | 6.08 | 2119 | = | -1.58 |
| /de/en/services-munich-airport | 1440 | 4.47 | 1907 | 6.62 | 1971 | = | 2.15 |
| /de/en/special-meals | 390 | 11.3 | 7018 | 17.78 | 6948 | 16.08 | 6.48 |
| /de/en/special-meals | 1440 | 8.35 | 5018 | 17.12 | 5239 | 18.66 | 8.77 |
| /de/en/sports-baggage | 390 | 6.62 | 7669 | 6.25 | 7709 | = | -0.37 |
| /de/en/sports-baggage | 1440 | 5.94 | 4808 | 3.24 | 4872 | = | -2.70 |
| /de/en/support/contact/contact-form-confirmation | 390 | 4.11 | 1334 | 9.24 | 1304 | 6.73 | 5.13 |
| /de/en/support/contact/contact-form-confirmation | 1440 | 0.98 | 1139 | 7.66 | 1109 | 4.05 | 6.68 |
| /de/en/support/contact/passenger-duty-united-kingdom | 390 | 6.22 | 2603 | 13.49 | 2664 | = | 7.27 |
| /de/en/support/contact/passenger-duty-united-kingdom | 1440 | 8.03 | 1860 | 7.32 | 1847 | = | -0.71 |
| /de/en/support/feedback-and-contact-airlines | 390 | 7.41 | 4132 | 10.03 | 4086 | = | 2.62 |
| /de/en/support/feedback-and-contact-airlines | 1440 | 3.53 | 1975 | 6.19 | 1957 | = | 2.66 |
| /de/en/terms-of-use | 390 | 6.07 | 5711 | 12.64 | 5988 | 12.64 | 6.57 |
| /de/en/terms-of-use | 1440 | 2.23 | 3668 | 12.09 | 3945 | 12.09 | 9.86 |
| /de/en/terms-and-conditions-lh | 390 | 6.9 | 41878 | 6.93 | 41990 | 6.93 | 0.03 |
| /de/en/terms-and-conditions-lh | 1440 | 3.67 | 24920 | 3.62 | 24993 | 3.62 | -0.05 |
| /de/en/terms-of-service-group | 390 | 4.75 | 3981 | 14.94 | 3799 | = | 10.19 |
| /de/en/terms-of-service-group | 1440 | 4.54 | 2221 | 13.66 | 2117 | = | 9.12 |
| /de/en/tiere-als-handgepaeck | 390 | 4.52 | 5348 | 6.3 | 5278 | 5.66 | 1.78 |
| /de/en/tiere-als-handgepaeck | 1440 | 4.5 | 4195 | 7.57 | 4125 | 6.72 | 3.07 |
| /de/en/tiere-als-uebergepaeck | 390 | 9.61 | 8646 | 10.16 | 8584 | 9.93 | 0.55 |
| /de/en/tiere-als-uebergepaeck | 1440 | 8.07 | 6036 | 9.5 | 5988 | 9.5 | 1.43 |
| /de/en/timetable-and-flight-status | 390 | 5.71 | 3875 | 5.71 | 3875 | = | 0.00 |
| /de/en/timetable-and-flight-status | 1440 | 3.5 | 3090 | 3.5 | 3090 | = | 0.00 |
| /de/en/travel-agencies | 390 | 7.21 | 2307 | 8.71 | 2355 | = | 1.50 |
| /de/en/travel-agencies | 1440 | 2.68 | 1731 | 6.62 | 1779 | = | 3.94 |
| /de/en/tips-senior-travellers | 390 | 12.2 | 20297 | 12.66 | 20240 | 11.17 | 0.46 |
| /de/en/tips-senior-travellers | 1440 | 6.3 | 13166 | 10.26 | 13073 | 7.54 | 3.96 |
| /de/en/travel-id-terms-conditions | 390 | 6.62 | 16563 | 6.62 | 16573 | = | 0.00 |
| /de/en/travel-id-terms-conditions | 1440 | 3.97 | 9633 | 3.97 | 9639 | = | 0.00 |
| /de/en/travel-expense-management | 390 | 3.91 | 3569 | 8.6 | 3601 | = | 4.69 |
| /de/en/travel-expense-management | 1440 | 2.04 | 2941 | 4.32 | 2973 | = | 2.28 |
| /de/en/travelling-with-animals | 390 | 4.53 | 3846 | 7.07 | 3830 | = | 2.54 |
| /de/en/travelling-with-animals | 1440 | 1.61 | 2655 | 4.13 | 2663 | = | 2.52 |
| /de/en/travelling-healthy | 390 | 11.75 | 4786 | 13.48 | 4843 | = | 1.73 |
| /de/en/travelling-healthy | 1440 | 6.8 | 3786 | 4.93 | 3825 | = | -1.87 |
| /de/en/travelling-with-children | 390 | 10.7 | 6253 | 17.69 | 6197 | = | 6.99 |
| /de/en/travelling-with-children | 1440 | 5.75 | 5299 | 12.5 | 5243 | = | 6.75 |
| /de/en/travelling-with-special-requirements | 390 | 4.61 | 3935 | 6.8 | 3983 | = | 2.19 |
| /de/en/travelling-with-special-requirements | 1440 | 0.96 | 2119 | 6.09 | 2167 | = | 5.13 |
| /de/en/unaccompanied-minors | 390 | 5.64 | 11570 | 5.42 | 11639 | 5.42 | -0.22 |
| /de/en/unaccompanied-minors | 1440 | 8.28 | 7293 | 7.22 | 7335 | 7.22 | -1.06 |
| /de/en/traveltricks | 390 | 11.11 | 4528 | 21.89 | 4466 | 19.78 | 10.78 |
| /de/en/traveltricks | 1440 | 11.43 | 3753 | 16.19 | 3739 | 12.55 | 4.76 |
| /de/en/uebergepaeck | 390 | 7.77 | 4811 | 9.41 | 4854 | 10.62 | 1.64 |
| /de/en/uebergepaeck | 1440 | 4.37 | 3190 | 5.99 | 3257 | 8.15 | 1.62 |
| /de/en/upgrade-business-class-long-haul | 390 | 5.14 | 3622 | 5.14 | 3622 | = | 0.00 |
| /de/en/upgrade-business-class-long-haul | 1440 | 4.95 | 2441 | 8.79 | 2489 | = | 3.84 |
| /de/en/upgrade-first-class | 390 | 5.32 | 3772 | 6.32 | 3755 | = | 1.00 |
| /de/en/upgrade-first-class | 1440 | 4.76 | 2521 | 7.84 | 2560 | = | 3.08 |
| /de/en/unterhaltung-an-bord | 390 | 13.74 | 3561 | 14.8 | 3541 | 13.76 | 1.06 |
| /de/en/unterhaltung-an-bord | 1440 | 11.15 | 2888 | 10.55 | 2898 | 9.22 | -0.60 |
| /de/en/upgrade-options | 390 | 8.8 | 4884 | 8.8 | 4884 | = | 0.00 |
| /de/en/upgrade-options | 1440 | 4.52 | 3535 | 11.88 | 3519 | = | 7.36 |
| /de/en/upgrade-info | 390 | 5.55 | 3261 | 7.16 | 3285 | = | 1.61 |
| /de/en/upgrade-info | 1440 | 2.78 | 2260 | 2.91 | 2260 | = | 0.13 |
| /de/en/upgrade-to-premium-economy-class | 390 | 10.19 | 3115 | 13.68 | 3138 | = | 3.49 |
| /de/en/upgrade-to-premium-economy-class | 1440 | 4.96 | 2301 | 10.39 | 2369 | = | 5.43 |
| /de/en/upgrade-premium-economy-class | 390 | 5.47 | 3691 | 5.47 | 3691 | = | 0.00 |
| /de/en/upgrade-premium-economy-class | 1440 | 4.67 | 2466 | 8.5 | 2514 | = | 3.83 |
| /de/en/upgrade-to-business-class | 390 | 7.52 | 3706 | 6.98 | 3723 | = | -0.54 |
| /de/en/upgrade-to-business-class | 1440 | 4.72 | 2470 | 8.54 | 2518 | = | 3.82 |
| /de/en/upgrades-at-online-check-in | 390 | 4.36 | 3920 | 10.15 | 3842 | 9.01 | 5.79 |
| /de/en/upgrades-at-online-check-in | 1440 | 2.76 | 3257 | 7.93 | 3163 | 6.89 | 5.17 |
| /de/en/wheelchair-batteries | 390 | 6.79 | 4782 | 6.12 | 4756 | 9.8 | -0.67 |
| /de/en/wheelchair-batteries | 1440 | 4.35 | 3579 | 3.08 | 3553 | 7.46 | -1.27 |
| /de/en/with-children-at-the-airport | 390 | 17.48 | 4030 | 19.14 | 4014 | = | 1.66 |
| /de/en/with-children-at-the-airport | 1440 | 14.18 | 2967 | 14.15 | 2975 | = | -0.03 |
| /gb/en/100-years/crane | 390 | 9.46 | 10981 | 9.46 | 10981 | = | 0.00 |
| /gb/en/100-years/crane | 1440 | 7.78 | 9782 | 7.78 | 9782 | = | 0.00 |
| /gb/en/100-years/destinations | 390 | 8.1 | 21532 | 8.1 | 21532 | 8.1 | 0.00 |
| /gb/en/100-years/destinations | 1440 | 0.78 | 20233 | 5.25 | 20241 | 5.25 | 4.47 |
| /gb/en/additional-services | 390 | 6.69 | 8372 | 6.69 | 8372 | 6.69 | 0.00 |
| /gb/en/additional-services | 1440 | 5.8 | 6766 | 5.81 | 6766 | 5.81 | 0.01 |
| /gb/en/articles/highlights/all-it-takes-is-a-yes | 390 | 13.59 | 7476 | 13.59 | 7476 | = | 0.00 |
| /gb/en/articles/highlights/all-it-takes-is-a-yes | 1440 | 6.64 | 6748 | 6.64 | 6748 | = | 0.00 |
| /gb/en/articles/tags/allegris | 390 | 3.94 | 7893 | 13.09 | 7990 | = | 9.15 |
| /gb/en/articles/tags/allegris | 1440 | 9.04 | 7412 | 14.17 | 7529 | = | 5.13 |
| /gb/en/articles/highlights/allegris-premium-economy-san-diego | 390 | 5.63 | 7287 | 15.15 | 7337 | 15.15 | 9.52 |
| /gb/en/articles/highlights/allegris-premium-economy-san-diego | 1440 | 3.65 | 6747 | 14.68 | 6772 | 14.68 | 11.03 |
| /gb/en/discover-lufthansa/new-onboard-experience | 390 | 7.46 | 18227 | 7.46 | 18227 | 18.56 | 0.00 |
| /gb/en/discover-lufthansa/new-onboard-experience | 1440 | 6.18 | 15128 | 21.16 | 15178 | 31.86 | 14.98 |
| /gb/en/services-at-the-airport | 390 | 7.46 | 3409 | 7.46 | 3409 | = | 0.00 |
| /gb/en/services-at-the-airport | 1440 | 1.4 | 2824 | 1.4 | 2824 | = | 0.00 |
| /xx/hk/meetings-and-events | 390 | 32.29 | 3119 | 32.29 | 3119 | = | 0.00 |
| /xx/hk/meetings-and-events | 1440 | 9.51 | 3271 | 9.51 | 3271 | = | 0.00 |
| /xx/ru/meetings-and-events | 390 | 6.92 | 4370 | 6.92 | 4370 | = | 0.00 |
| /xx/ru/meetings-and-events | 1440 | 3.1 | 3689 | 4.69 | 3662 | = | 1.59 |
| /xx/pt/meetings-and-events | 390 | 6.04 | 4188 | 6.04 | 4188 | = | 0.00 |
| /xx/pt/meetings-and-events | 1440 | 4.14 | 3611 | 4.15 | 3611 | = | 0.01 |

## 9. Standing order 57 (2026-11-18/19): the gate again, with tonight's carriers

**The gate still does not pass.** 361 of the 670 page-widths are worse than today by more than 0.5 points; 22 of them
would pass with M at 60 (www draws 60 there), which leaves 339. 60 are better. Against plan 923 the switched sum goes
down by 62 points (5,767.70 -> 5,705.63): 21 page-widths closer, 5 further.

### What changed, and where

**On the branch** (`token-free-lufthansa-live`, 876d67d, rebased on main 987ade9, never merged):
- **Legal pages** (template legal) draw a chapter heading without the live theme's heading gap, after a divider or
  after text, as www's legal chapters and the marks do. On the 56 legal page-widths the sum goes 437.5 -> 409.0, with
  7 closer and none further: terms-of-use 1440 12.09 -> 4.83 % (today 2.23), sepa-terms-and-conditions 390
  11.82 -> 6.93.
  - A first form for every flow page (no gap after a divider anywhere) took miles-and-more, europa-tarife-economy-class
    and flight-disruptions further: www keeps the gap after a divider there.
- **The hub views.** A related-teasers section's heading (section style H2 small) right after its Divider keeps no gap,
  and a view's opening Spacer draws 60 (`THEMES.lufthansa.columnViews.opening`). digital-self-services 1440
  4.70 -> 2.74 % (today 2.90), 390 7.07 -> 6.66.
  - Each rule alone moved the page further (1440 6.72 and 5.11). Together the views open where www's do and the last
    section closes up.
- **Divider space options** draw the page's M / L (40 / 120, 60 from 768 px).

**On main, also collapsed into the branch's documents:**
- **chapters.** www's in-cell chapter separator becomes the Columns Media option chapters: terms-of-service-group now
  draws as today at both widths (1440 13.66 -> 4.54 %, 390 14.94 -> 4.75; item 2(d) closed).
- **Link list layouts** are section styles / block options: lufthansa-business-class-on-long-haul-routes 1440
  23.29 -> 17.60, data-collection-canada 390 12.65 -> 8.23.
- **The Markets row** is kept on split parts.
- **A split keeps separator styles at their ends.**

**Further than plan 923:**
- data-collection-canada 1440 (10.31 -> 12.96), unterhaltung-an-bord 1440 / 390 (+3.13 / +0.94; a link-list section
  in a tab panel, its block's space M at 40).
- passenger-receipt-90 1440 (+3.78; the form 72 px taller in its view), anniversary-super-crane-special 1440 (+4.22).
- Per-page steps, listed in §9.1.

### Held

- **The view opening's 16 px.** Every hub page's content before its first view ends 16 px higher switched; not
  found tonight.
- **Item 3, text width, text size and video markers handed to the theme.** Measured, no carrier: they stand on the
  worse page-widths without being what moves them.
  - **Video:** the settings left are the player's own defaults; the size is in the link.
  - **Text width:** of the 397 full-width marks in sections, the 106 dropped are a minority in their section, most of
    them a short line after a heading, the same line at either width.
  - **Small print in mid-section:** no in-section carrier yet.
  - The worse pages' first moved boxes are column views, headings and per-page steps.


| | plan 923 (order 56) | order 57 |
| --- | --- | --- |
| page-widths measured | 670 | 670 |
| worse than today by more than 0.5 | 369 | 361 |
| of these explained by www (would pass with M at 60) | 19 | 22 |
| better than today by more than 0.5 | 57 | 60 |
| sum of % off www, today | 4,347.02 | 4,358.13 |
| sum of % off www, switched | 5,767.70 | 5,705.63 |
| median, today / switched | 5.61 / 7.17 | 5.62 / 7.09 |

Today differs from plan 923 on 12 page-widths: six documents changed tonight (ema-test's order 58 rows, published) and were captured again; the other 658 keep plan 923's today figures.

### 9.1 The page-widths that moved against plan 923 by more than 0.5 points

| page-width | today | plan 923 | order 57 | +/- | height (px) |
| --- | --- | --- | --- | --- | --- |
| /de/en/terms-of-service-group 390 | 4.75 | 14.94 | 4.75 | -10.19 | 3981 |
| /de/en/terms-of-service-group 1440 | 4.54 | 13.66 | 4.54 | -9.12 | 2221 |
| /de/en/terms-of-use 1440 | 2.23 | 12.09 | 4.83 | -7.26 | 3721 |
| /de/en/terms-of-use 390 | 6.07 | 12.64 | 5.72 | -6.92 | 5764 |
| /de/en/lufthansa-business-class-on-long-haul-routes 1440 | 6.46 | 23.29 | 17.6 | -5.69 | 3232 |
| /de/en/sepa-terms-and-conditions 390 | 3.75 | 11.82 | 6.93 | -4.89 | 2525 |
| /de/en/data-collection-canada 390 | 9.93 | 12.65 | 8.23 | -4.42 | 5491 |
| /de/en/lufthansa-business-class-on-long-haul-routes 390 | 13.33 | 26.44 | 22.68 | -3.76 | 4556 |
| /de/en/sepa-terms-and-conditions 1440 | 1.01 | 10.8 | 7.2 | -3.60 | 1843 |
| /de/en/sepa-terms-and-conditions-b 1440 | 2.86 | 10.15 | 7.41 | -2.74 | 1948 |
| /de/en/security-check-time-slot 1440 | 2.6 | 6.67 | 4.01 | -2.66 | 2868 |
| /de/en/sepa-terms-and-conditions-b 390 | 6.14 | 10.88 | 8.59 | -2.29 | 2778 |
| /de/en/articles/explore-flying/anniversary-super-crane-special 390 | 10.79 | 13.45 | 11.32 | -2.13 | 10095 |
| /de/de/digital-self-services 1440 | 2.93 | 4.8 | 2.83 | -1.97 | 4549 |
| /at/de/digital-self-services 1440 | 2.93 | 4.8 | 2.83 | -1.97 | 4549 |
| /gb/en/digital-self-services 1440 | 2.9 | 4.7 | 2.74 | -1.96 | 4471 |
| /de/en/digital-self-services 1440 | 3.46 | 5.58 | 3.65 | -1.93 | 4471 |
| /de/en/rail-fly-terms-and-conditions 1440 | 5.11 | 5.47 | 4.26 | -1.21 | 3024 |
| /de/en/pre-check-in 1440 | 3.29 | 6.41 | 5.46 | -0.95 | 2418 |
| /de/en/pre-check-in 390 | 4.89 | 6.81 | 6.23 | -0.58 | 3570 |
| /de/en/security-check-time-slot 390 | 3.94 | 6.28 | 5.75 | -0.53 | 2993 |
| /de/en/unterhaltung-an-bord 390 | 13.74 | 14.8 | 15.74 | 0.94 | 3521 |
| /de/en/data-collection-canada 1440 | 8.17 | 10.31 | 12.96 | 2.65 | 4142 |
| /de/en/unterhaltung-an-bord 1440 | 11.15 | 10.55 | 13.68 | 3.13 | 2848 |
| /de/en/passenger-receipt-90 1440 | 2.32 | 3.19 | 6.97 | 3.78 | 3406 |
| /de/en/articles/explore-flying/anniversary-super-crane-special 1440 | 7.67 | 7.42 | 11.64 | 4.22 | 7259 |

## 10. The full table after order 57: every recorded page-width with markers (670)

| page | width | today | switched (order 57) | height | plan 923 | +/- today |
| --- | --- | --- | --- | --- | --- | --- |
| /gb/en/baggage | 390 | 5.01 | 6.14 | 7336 | 6.14 | 1.13 |
| /gb/en/baggage | 1440 | 1.7 | 1.97 | 4627 | 1.97 | 0.27 |
| /de/de/gepaeck | 390 | 4.84 | 4.18 | 7517 | 4.18 | -0.66 |
| /de/de/gepaeck | 1440 | 3.37 | 5.15 | 4715 | 5.15 | 1.78 |
| /gb/en/food-and-beverages | 390 | 6.71 | 6.71 | 6742 | 6.71 | 0.00 |
| /gb/en/food-and-beverages | 1440 | 6.46 | 2.19 | 5087 | 2.19 | -4.27 |
| /gb/en/lufthansa-travel-classes | 390 | 8.02 | 8.02 | 4688 | 8.02 | 0.00 |
| /gb/en/lufthansa-travel-classes | 1440 | 3.85 | 3.85 | 3290 | 3.85 | 0.00 |
| /gb/en/digital-self-services | 390 | 5.55 | 6.66 | 5491 | 7.07 | 1.11 |
| /gb/en/digital-self-services | 1440 | 2.9 | 2.74 | 4471 | 4.7 | -0.16 |
| /gb/en/miles-and-more | 390 | 5.17 | 6.61 | 4173 | 6.61 | 1.44 |
| /gb/en/miles-and-more | 1440 | 2.33 | 4.38 | 3392 | 4.38 | 2.05 |
| /gb/en/airport-information | 390 | 5.64 | 6.33 | 5450 | 6.33 | 0.69 |
| /gb/en/airport-information | 1440 | 3.84 | 7.09 | 3180 | 7.09 | 3.25 |
| /gb/en/overview-special-request | 390 | 5.79 | 5.79 | 3936 | 5.79 | 0.00 |
| /gb/en/overview-special-request | 1440 | 2.46 | 2.46 | 2746 | 2.46 | 0.00 |
| /de/de/digital-self-services | 390 | 5.57 | 6.8 | 5653 | 7.19 | 1.23 |
| /de/de/digital-self-services | 1440 | 2.93 | 2.83 | 4549 | 4.8 | -0.10 |
| /at/de/digital-self-services | 390 | 5.57 | 6.8 | 5653 | 7.19 | 1.23 |
| /at/de/digital-self-services | 1440 | 2.93 | 2.83 | 4549 | 4.8 | -0.10 |
| /de/de/fluege | 390 | 45.79 | 45.75 | 5274 | 45.75 | -0.04 |
| /de/de/fluege | 1440 | 33.76 | 33.82 | 3900 | 33.82 | 0.06 |
| /at/de/fluege | 390 | 43.93 | 43.96 | 5338 | 43.96 | 0.03 |
| /at/de/fluege | 1440 | 34.14 | 33.9 | 3991 | 33.9 | -0.24 |
| /gb/en/flights | 390 | 43.82 | 43.87 | 5108 | 43.87 | 0.05 |
| /gb/en/flights | 1440 | 33.08 | 33.2 | 3874 | 33.2 | 0.12 |
| /de/de/lufthansa-reiseklassen | 390 | 7.95 | 7.95 | 4787 | 7.95 | 0.00 |
| /de/de/lufthansa-reiseklassen | 1440 | 3.88 | 3.88 | 3290 | 3.88 | 0.00 |
| /at/de/lufthansa-reiseklassen | 390 | 7.95 | 7.95 | 4787 | 7.95 | 0.00 |
| /at/de/lufthansa-reiseklassen | 1440 | 3.88 | 3.88 | 3290 | 3.88 | 0.00 |
| /de/de/meetings-and-events | 390 | 6.11 | 6.11 | 4149 | 6.11 | 0.00 |
| /de/de/meetings-and-events | 1440 | 2.74 | 4.44 | 3582 | 4.44 | 1.70 |
| /at/de/meetings-and-events | 390 | 6.11 | 6.11 | 4149 | 6.11 | 0.00 |
| /at/de/meetings-and-events | 1440 | 2.74 | 4.44 | 3582 | 4.44 | 1.70 |
| /gb/en/meetings-and-events | 390 | 5.75 | 5.75 | 3888 | 5.75 | 0.00 |
| /gb/en/meetings-and-events | 1440 | 2.56 | 2.56 | 3528 | 2.56 | 0.00 |
| /de/de/miles-and-more | 390 | 5.04 | 9.01 | 4465 | 9.01 | 3.97 |
| /de/de/miles-and-more | 1440 | 2.34 | 4.35 | 3473 | 4.35 | 2.01 |
| /at/de/miles-and-more | 390 | 5.03 | 9.01 | 4465 | 9.01 | 3.98 |
| /at/de/miles-and-more | 1440 | 2.34 | 4.35 | 3473 | 4.35 | 2.01 |
| /de/en/flights | 390 | 44.84 | 45.24 | 5307 | 45.24 | 0.40 |
| /de/en/flights | 1440 | 34.1 | 34.05 | 4073 | 34.05 | -0.05 |
| /de/de/frankfurt-fair | 390 | 6.09 | 7.49 | 5490 | 7.49 | 1.40 |
| /de/de/frankfurt-fair | 1440 | 3.83 | 4.07 | 3495 | 4.07 | 0.24 |
| /at/de/frankfurt-fair | 390 | 6.09 | 7.48 | 5490 | 7.48 | 1.39 |
| /at/de/frankfurt-fair | 1440 | 3.84 | 4.07 | 3495 | 4.07 | 0.23 |
| /gb/en/frankfurt-fair | 390 | 5.91 | 6.58 | 5336 | 6.58 | 0.67 |
| /gb/en/frankfurt-fair | 1440 | 4.74 | 5.36 | 3492 | 5.36 | 0.62 |
| /de/de/bedeutsamste-strecken | 390 | 5.94 | 5.94 | 2875 | 5.94 | 0.00 |
| /de/de/bedeutsamste-strecken | 1440 | 2.71 | 2.77 | 2466 | 2.77 | 0.06 |
| /at/de/bedeutsamste-strecken | 390 | 5.94 | 5.94 | 2875 | 5.94 | 0.00 |
| /at/de/bedeutsamste-strecken | 1440 | 2.71 | 2.77 | 2466 | 2.77 | 0.06 |
| /gb/en/most-significant-route | 390 | 5.99 | 5.99 | 2780 | 5.99 | 0.00 |
| /gb/en/most-significant-route | 1440 | 2.56 | 2.56 | 2574 | 2.56 | 0.00 |
| /fr/fr/meetings-and-events | 390 | 6.04 | 6.04 | 4355 | 6.04 | 0.00 |
| /fr/fr/meetings-and-events | 1440 | 3.11 | 4.69 | 3688 | 4.69 | 1.58 |
| /xx/es/meetings-and-events | 390 | 6.23 | 6.23 | 4109 | 6.23 | 0.00 |
| /xx/es/meetings-and-events | 1440 | 2.77 | 4.41 | 3581 | 4.41 | 1.64 |
| /xx/fr/meetings-and-events | 390 | 6.05 | 6.05 | 4355 | 6.05 | 0.00 |
| /xx/fr/meetings-and-events | 1440 | 3.07 | 4.65 | 3688 | 4.65 | 1.58 |
| /de/en/100-years/chronicle | 390 | 7.03 | 7.03 | 43491 | 7.03 | 0.00 |
| /de/en/100-years/chronicle | 1440 | 12.22 | 12.12 | 34772 | 12.12 | -0.10 |
| /de/en/book-and-manage/stopover | 390 | 14 | 19.3 | 17314 | 19.3 | 5.30 |
| /de/en/book-and-manage/stopover | 1440 | 11.82 | 15.36 | 13055 | 15.36 | 3.54 |
| /de/en/book-and-manage/stopover/bayerischer-hof | 390 | 4.98 | 4.76 | 4036 | 4.76 | -0.22 |
| /de/en/book-and-manage/stopover/bayerischer-hof | 1440 | 5.08 | 5.45 | 2950 | 5.45 | 0.37 |
| /de/en/book-and-manage/stopover/neuschwanstein | 390 | 2.72 | 3.6 | 3739 | 3.6 | 0.88 |
| /de/en/book-and-manage/stopover/neuschwanstein | 1440 | 4.8 | 5 | 3012 | 5 | 0.20 |
| /de/en/book-and-manage/stopover/zugspitze | 390 | 3.33 | 4.93 | 4011 | 4.93 | 1.60 |
| /de/en/book-and-manage/stopover/zugspitze | 1440 | 4.53 | 4.73 | 3069 | 4.73 | 0.20 |
| /de/en/digital-self-services | 390 | 5.54 | 6.64 | 5491 | 7.05 | 1.10 |
| /de/en/digital-self-services | 1440 | 3.46 | 3.65 | 4471 | 5.58 | 0.19 |
| /de/en/frankfurt-fair | 390 | 5.9 | 6.57 | 5336 | 6.57 | 0.67 |
| /de/en/frankfurt-fair | 1440 | 4.74 | 5.35 | 3492 | 5.35 | 0.61 |
| /de/en/lufthansa-travel-classes | 390 | 8.01 | 8.01 | 4688 | 8.01 | 0.00 |
| /de/en/lufthansa-travel-classes | 1440 | 3.86 | 3.86 | 3290 | 3.86 | 0.00 |
| /de/en/meetings-and-events | 390 | 5.74 | 5.74 | 3888 | 5.74 | 0.00 |
| /de/en/meetings-and-events | 1440 | 2.56 | 2.56 | 3528 | 2.56 | 0.00 |
| /de/en/miles-and-more | 390 | 5.16 | 6.61 | 4173 | 6.61 | 1.45 |
| /de/en/miles-and-more | 1440 | 2.42 | 4.41 | 3392 | 4.41 | 1.99 |
| /de/en/most-significant-route | 390 | 5.98 | 5.98 | 2780 | 5.98 | 0.00 |
| /de/en/most-significant-route | 1440 | 2.56 | 2.56 | 2574 | 2.56 | 0.00 |
| /at/de/100-years/crane | 390 | 9.38 | 9.38 | 11407 | 9.38 | 0.00 |
| /at/de/100-years/crane | 1440 | 7.96 | 7.96 | 9755 | 7.96 | 0.00 |
| /at/de/additional-services | 390 | 6.83 | 6.83 | 8440 | 6.83 | 0.00 |
| /at/de/additional-services | 1440 | 5.73 | 5.73 | 6766 | 5.73 | 0.00 |
| /at/de/100-years/destinations | 390 | 7.96 | 7.96 | 22167 | 7.96 | 0.00 |
| /at/de/100-years/destinations | 1440 | 0.71 | 5.33 | 20296 | 5.33 | 4.62 |
| /at/de/articles/highlights/all-it-takes-is-a-yes | 390 | 12.77 | 12.77 | 7984 | 12.77 | 0.00 |
| /at/de/articles/highlights/all-it-takes-is-a-yes | 1440 | 6.6 | 6.6 | 6802 | 6.6 | 0.00 |
| /at/de/articles/highlights/allegris-premium-economy-san-diego | 390 | 5.55 | 14.3 | 7921 | 14.3 | 8.75 |
| /at/de/articles/highlights/allegris-premium-economy-san-diego | 1440 | 4.9 | 15.92 | 7029 | 15.92 | 11.02 |
| /at/de/articles/tags/allegris | 390 | 5.96 | 12.12 | 8229 | 12.12 | 6.16 |
| /at/de/articles/tags/allegris | 1440 | 10.56 | 11.94 | 7492 | 11.94 | 1.38 |
| /at/de/discover-lufthansa/new-onboard-experience | 390 | 8.33 | 8.33 | 18847 | 8.33 | 0.00 |
| /at/de/discover-lufthansa/new-onboard-experience | 1440 | 4.46 | 24.4 | 15481 | 24.4 | 19.94 |
| /at/de/flughafeninformation | 390 | 24.76 | 23.88 | 5912 | 23.88 | -0.88 |
| /at/de/flughafeninformation | 1440 | 3.07 | 6.72 | 3231 | 6.72 | 3.65 |
| /at/de/gepaeck | 390 | 4.84 | 4.18 | 7517 | 4.18 | -0.66 |
| /at/de/gepaeck | 1440 | 3.37 | 5.15 | 4715 | 5.15 | 1.78 |
| /at/de/services-am-flughafen | 390 | 7.47 | 7.47 | 3619 | 7.47 | 0.00 |
| /at/de/services-am-flughafen | 1440 | 1.49 | 1.49 | 2851 | 1.49 | 0.00 |
| /at/de/overview-special-request | 390 | 5.61 | 5.61 | 4028 | 5.61 | 0.00 |
| /at/de/overview-special-request | 1440 | 2.45 | 2.45 | 2773 | 2.45 | 0.00 |
| /at/de/speisen-und-getraenke | 390 | 7.4 | 7.4 | 7113 | 7.4 | 0.00 |
| /at/de/speisen-und-getraenke | 1440 | 2.41 | 2.41 | 5114 | 2.41 | 0.00 |
| /de/de/100-years/crane | 390 | 9.38 | 9.38 | 11407 | 9.38 | 0.00 |
| /de/de/100-years/crane | 1440 | 7.96 | 7.96 | 9755 | 7.96 | 0.00 |
| /de/de/100-years/destinations | 390 | 7.96 | 7.96 | 22167 | 7.96 | 0.00 |
| /de/de/100-years/destinations | 1440 | 0.71 | 5.33 | 20296 | 5.33 | 4.62 |
| /de/de/additional-services | 390 | 6.83 | 6.83 | 8440 | 6.83 | 0.00 |
| /de/de/additional-services | 1440 | 5.73 | 5.73 | 6766 | 5.73 | 0.00 |
| /de/de/articles/highlights/all-it-takes-is-a-yes | 390 | 12.78 | 12.78 | 7984 | 12.78 | 0.00 |
| /de/de/articles/highlights/all-it-takes-is-a-yes | 1440 | 6.6 | 6.6 | 6802 | 6.6 | 0.00 |
| /de/de/articles/highlights/allegris-premium-economy-san-diego | 390 | 4.82 | 13.93 | 7894 | 13.87 | 9.11 |
| /de/de/articles/highlights/allegris-premium-economy-san-diego | 1440 | 3.53 | 16.13 | 7029 | 15.92 | 12.60 |
| /de/de/articles/tags/allegris | 390 | 5.96 | 12.12 | 8229 | 12.12 | 6.16 |
| /de/de/articles/tags/allegris | 1440 | 10.64 | 11.93 | 7492 | 11.93 | 1.29 |
| /de/de/discover-lufthansa/new-onboard-experience | 390 | 8.33 | 8.33 | 18847 | 8.33 | 0.00 |
| /de/de/discover-lufthansa/new-onboard-experience | 1440 | 4.46 | 24.35 | 15481 | 24.35 | 19.89 |
| /de/de/flughafeninformation | 390 | 24.77 | 23.88 | 5912 | 23.88 | -0.89 |
| /de/de/flughafeninformation | 1440 | 3.06 | 6.72 | 3231 | 6.72 | 3.66 |
| /de/de/overview-special-request | 390 | 5.61 | 5.61 | 4028 | 5.61 | 0.00 |
| /de/de/overview-special-request | 1440 | 2.45 | 2.45 | 2773 | 2.45 | 0.00 |
| /de/de/services-am-flughafen | 390 | 7.47 | 7.47 | 3619 | 7.47 | 0.00 |
| /de/de/services-am-flughafen | 1440 | 1.48 | 1.48 | 2851 | 1.48 | 0.00 |
| /de/de/speisen-und-getraenke | 390 | 7.61 | 7.61 | 7113 | 7.61 | 0.00 |
| /de/de/speisen-und-getraenke | 1440 | 2.41 | 2.41 | 5114 | 2.41 | 0.00 |
| /de/en/100-years | 390 | 19.68 | 32.69 | 9882 | 32.68 | 13.01 |
| /de/en/100-years | 1440 | 10.49 | 12.36 | 8491 | 12.25 | 1.87 |
| /de/en/100-years/cabin-design | 390 | 13.28 | 17.61 | 19766 | 17.61 | 4.33 |
| /de/en/100-years/cabin-design | 1440 | 5.88 | 14.86 | 17065 | 14.81 | 8.98 |
| /de/en/100-years/campaigns | 390 | 9.52 | 7.31 | 15343 | 7.31 | -2.21 |
| /de/en/100-years/campaigns | 1440 | 4.93 | 3.25 | 16466 | 3.25 | -1.68 |
| /de/en/100-years/crane | 390 | 9.46 | 9.46 | 10981 | 9.46 | 0.00 |
| /de/en/100-years/crane | 1440 | 7.79 | 7.79 | 9782 | 7.79 | 0.00 |
| /de/en/100-years/destinations | 390 | 8.1 | 8.1 | 21532 | 8.1 | 0.00 |
| /de/en/100-years/destinations | 1440 | 0.78 | 5.25 | 20241 | 5.25 | 4.47 |
| /de/en/100-years/fleet | 390 | 6.38 | 6.27 | 36530 | 6.27 | -0.11 |
| /de/en/100-years/fleet | 1440 | 7.45 | 7.45 | 28325 | 7.45 | 0.00 |
| /de/en/100-years/global-network | 390 | 15.04 | 15.75 | 18823 | 15.75 | 0.71 |
| /de/en/100-years/global-network | 1440 | 13.62 | 13.73 | 16722 | 13.73 | 0.11 |
| /de/en/320 | 390 | 5.75 | 13.7 | 6714 | 13.7 | 7.95 |
| /de/en/320 | 1440 | 4.42 | 4.58 | 6385 | 4.58 | 0.16 |
| /de/en/100-years/history | 390 | 5.92 | 5.92 | 11691 | 5.92 | 0.00 |
| /de/en/100-years/history | 1440 | 1.04 | 1.04 | 9520 | 1.04 | 0.00 |
| /de/en/100-years/history/menu-on-board | 390 | 9.53 | 9.53 | 11863 | 9.53 | 0.00 |
| /de/en/100-years/history/menu-on-board | 1440 | 2.21 | 2.21 | 12343 | 2.21 | 0.00 |
| /de/en/32n | 390 | 7.39 | 13.59 | 6883 | 13.59 | 6.20 |
| /de/en/32n | 1440 | 2.37 | 6.14 | 6468 | 6.14 | 3.77 |
| /de/en/359 | 390 | 6.09 | 10.61 | 2955 | 10.61 | 4.52 |
| /de/en/359 | 1440 | 2.51 | 5.11 | 3373 | 5.11 | 2.60 |
| /de/en/add-sports-baggage | 390 | 9.92 | 8.91 | 5423 | 8.91 | -1.01 |
| /de/en/add-sports-baggage | 1440 | 6.62 | 5.95 | 4437 | 5.95 | -0.67 |
| /de/en/744 | 390 | 11.64 | 8.82 | 3239 | 8.82 | -2.82 |
| /de/en/744 | 1440 | 5.03 | 5.71 | 3293 | 5.71 | 0.68 |
| /de/en/accessible-travel | 390 | 6.21 | 6.11 | 10394 | 6.11 | -0.10 |
| /de/en/accessible-travel | 1440 | 4.16 | 5.33 | 5542 | 5.33 | 1.17 |
| /de/en/additional-services | 390 | 6.68 | 6.68 | 8372 | 6.68 | 0.00 |
| /de/en/additional-services | 1440 | 5.8 | 5.81 | 6766 | 5.81 | 0.01 |
| /de/en/addresses-worldwide | 390 | 5.51 | 5.88 | 1397 | 5.88 | 0.37 |
| /de/en/addresses-worldwide | 1440 | 3.29 | 6.54 | 1229 | 6.54 | 3.25 |
| /de/en/admission-rules | 390 | 5.6 | 4.72 | 8415 | 4.72 | -0.88 |
| /de/en/admission-rules | 1440 | 3.06 | 3.6 | 7305 | 3.6 | 0.54 |
| /de/en/advance-seat-reservation | 390 | 12.01 | 21.71 | 13154 | 21.71 | 9.70 |
| /de/en/advance-seat-reservation | 1440 | 7.71 | 11.72 | 8719 | 11.72 | 4.01 |
| /de/en/advance-seat-reservations-terms-and-conditions | 390 | 5.53 | 15.22 | 2659 | 15.22 | 9.69 |
| /de/en/advance-seat-reservations-terms-and-conditions | 1440 | 2.17 | 14.59 | 1719 | 14.59 | 12.42 |
| /de/en/affiliatemarketing | 390 | 9.69 | 9.04 | 4087 | 9.04 | -0.65 |
| /de/en/affiliatemarketing | 1440 | 3.67 | 5.41 | 2783 | 5.41 | 1.74 |
| /de/en/advice-for-travellers-with-special-needs-to-and-from-the-usa | 390 | 8.42 | 8.42 | 9928 | 8.42 | 0.00 |
| /de/en/advice-for-travellers-with-special-needs-to-and-from-the-usa | 1440 | 5.8 | 4.98 | 6098 | 4.98 | -0.82 |
| /de/en/anmeldung-tiere-frachtraum | 390 | 7.28 | 8.04 | 8755 | 8.04 | 0.76 |
| /de/en/anmeldung-tiere-frachtraum | 1440 | 3.47 | 4.35 | 6503 | 4.35 | 0.88 |
| /de/en/all-check-in | 390 | 5.17 | 6.57 | 3362 | 6.57 | 1.40 |
| /de/en/all-check-in | 1440 | 3.14 | 4.02 | 2826 | 4.02 | 0.88 |
| /de/en/airport-information | 390 | 5.62 | 6.31 | 5450 | 6.31 | 0.69 |
| /de/en/airport-information | 1440 | 3.83 | 7.09 | 3180 | 7.09 | 3.26 |
| /de/en/articles/authors/florian-tomberg | 390 | 4.53 | 5.74 | 3778 | 5.74 | 1.21 |
| /de/en/articles/authors/florian-tomberg | 1440 | 3.03 | 3.24 | 3425 | 3.24 | 0.21 |
| /de/en/arrival-services | 390 | 6.74 | 9.58 | 4633 | 9.58 | 2.84 |
| /de/en/arrival-services | 1440 | 10.36 | 9.49 | 3738 | 9.49 | -0.87 |
| /de/en/articles/explore-flying | 390 | 7.22 | 7.32 | 6783 | 7.32 | 0.10 |
| /de/en/articles/explore-flying | 1440 | 4.32 | 3.51 | 5513 | 3.51 | -0.81 |
| /de/en/articles/explore-flying/7-people-who-shaped-lufthansa-history | 390 | 3.35 | 6.33 | 11714 | 6.33 | 2.98 |
| /de/en/articles/explore-flying/7-people-who-shaped-lufthansa-history | 1440 | 1.32 | 3.62 | 9845 | 3.62 | 2.30 |
| /de/en/articles/explore-flying/anniversary-super-crane-special | 390 | 10.79 | 11.32 | 10095 | 13.45 | 0.53 |
| /de/en/articles/explore-flying/anniversary-super-crane-special | 1440 | 7.67 | 11.64 | 7259 | 7.42 | 3.97 |
| /de/en/articles/explore-flying/essentials-future-of-flying | 390 | 4.87 | 6.83 | 5855 | 6.83 | 1.96 |
| /de/en/articles/explore-flying/essentials-future-of-flying | 1440 | 2.68 | 3.4 | 5753 | 3.4 | 0.72 |
| /de/en/articles/explore-flying/flying-high-christoph-quarch | 390 | 5.63 | 5.72 | 6398 | 5.72 | 0.09 |
| /de/en/articles/explore-flying/flying-high-christoph-quarch | 1440 | 5.76 | 5.76 | 5400 | 5.76 | 0.00 |
| /de/en/articles/explore-flying/inflight-entertainment-vr-experience | 390 | 0.94 | 2.27 | 10334 | 2.27 | 1.33 |
| /de/en/articles/explore-flying/inflight-entertainment-vr-experience | 1440 | 2.08 | 1.94 | 7872 | 1.94 | -0.14 |
| /de/en/articles/explore-the-world/a-perfect-day-barcelona-in-one-day | 390 | 11.35 | 14.11 | 10569 | 14.11 | 2.76 |
| /de/en/articles/explore-the-world/a-perfect-day-barcelona-in-one-day | 1440 | 3.07 | 10.75 | 7603 | 10.75 | 7.68 |
| /de/en/articles/explore-the-world | 390 | 7.42 | 7.37 | 8359 | 7.37 | -0.05 |
| /de/en/articles/explore-the-world | 1440 | 5.5 | 5.97 | 6274 | 5.97 | 0.47 |
| /de/en/articles/explore-the-world/be-picky-barcelona-insider-tips | 390 | 9.71 | 10.36 | 7647 | 10.36 | 0.65 |
| /de/en/articles/explore-the-world/be-picky-barcelona-insider-tips | 1440 | 7.16 | 8.1 | 5025 | 8.1 | 0.94 |
| /de/en/articles/explore-the-world/a-perfect-day-berlin-in-one-day | 390 | 10.01 | 14.53 | 11901 | 14.53 | 4.52 |
| /de/en/articles/explore-the-world/a-perfect-day-berlin-in-one-day | 1440 | 2.69 | 9.07 | 8062 | 9.07 | 6.38 |
| /de/en/articles/explore-the-world/be-picky-frankfurt-insider-tips | 390 | 8.05 | 8.2 | 5104 | 8.2 | 0.15 |
| /de/en/articles/explore-the-world/be-picky-frankfurt-insider-tips | 1440 | 2.8 | 4.79 | 3816 | 4.79 | 1.99 |
| /de/en/articles/explore-the-world/eat-see-do-algiers | 390 | 9.38 | 14.01 | 8394 | 14.01 | 4.63 |
| /de/en/articles/explore-the-world/eat-see-do-algiers | 1440 | 7.72 | 10.18 | 6514 | 10.18 | 2.46 |
| /de/en/articles/explore-the-world/essentials-barcelona-facts | 390 | 7.37 | 10.95 | 6067 | 10.95 | 3.58 |
| /de/en/articles/explore-the-world/essentials-barcelona-facts | 1440 | 3.92 | 6.21 | 5422 | 5.91 | 2.29 |
| /de/en/articles/explore-the-world/eat-see-do-berlin | 390 | 8.46 | 15.04 | 9827 | 15.04 | 6.58 |
| /de/en/articles/explore-the-world/eat-see-do-berlin | 1440 | 4.87 | 8.11 | 7109 | 8.11 | 3.24 |
| /de/en/articles/explore-the-world/in-my-hood-chiswick-london | 390 | 7.73 | 8.41 | 7225 | 8.41 | 0.68 |
| /de/en/articles/explore-the-world/in-my-hood-chiswick-london | 1440 | 4.34 | 4.27 | 5181 | 4.27 | -0.07 |
| /de/en/articles/explore-the-world/essentials-frankfurt-facts | 390 | 3.65 | 5.81 | 5025 | 5.82 | 2.16 |
| /de/en/articles/explore-the-world/essentials-frankfurt-facts | 1440 | 5.14 | 6.07 | 5145 | 6.13 | 0.93 |
| /de/en/articles/explore-the-world/in-my-hood-district-zurich | 390 | 5.45 | 5.48 | 8109 | 5.48 | 0.03 |
| /de/en/articles/explore-the-world/in-my-hood-district-zurich | 1440 | 3.58 | 4.56 | 5423 | 4.56 | 0.98 |
| /de/en/articles/explore-the-world/know-before-you-go-berlin | 390 | 7.74 | 7.89 | 7421 | 7.89 | 0.15 |
| /de/en/articles/explore-the-world/know-before-you-go-berlin | 1440 | 4.63 | 6.94 | 7433 | 6.94 | 2.31 |
| /de/en/articles/explore-the-world/know-before-you-go-algiers | 390 | 8 | 8.05 | 7475 | 8.05 | 0.05 |
| /de/en/articles/explore-the-world/know-before-you-go-algiers | 1440 | 4.28 | 6.76 | 7392 | 6.79 | 2.48 |
| /de/en/articles/explore-the-world/on-the-scene-food-trends-istanbul | 390 | 4.91 | 5.21 | 7084 | 5.21 | 0.30 |
| /de/en/articles/explore-the-world/on-the-scene-food-trends-istanbul | 1440 | 5.93 | 5.97 | 5217 | 5.97 | 0.04 |
| /de/en/articles/explore-the-world/on-the-scene-caspar-plautz-munich | 390 | 7.65 | 8.42 | 6781 | 8.42 | 0.77 |
| /de/en/articles/explore-the-world/on-the-scene-caspar-plautz-munich | 1440 | 4.05 | 6.05 | 5105 | 6.05 | 2.00 |
| /de/en/articles/explore-the-world/picture-perfect-austin | 390 | 25.42 | 25.36 | 10429 | 25.36 | -0.06 |
| /de/en/articles/explore-the-world/picture-perfect-austin | 1440 | 18.75 | 18.92 | 7984 | 18.92 | 0.17 |
| /de/en/articles/explore-the-world/stop-over-tokyo | 390 | 8.91 | 10.32 | 7342 | 10.32 | 1.41 |
| /de/en/articles/explore-the-world/stop-over-tokyo | 1440 | 7.64 | 9.75 | 6188 | 9.75 | 2.11 |
| /de/en/articles/explore-the-world/what-i-learned-living-in-barcelona | 390 | 11.67 | 14.17 | 9069 | 14.17 | 2.50 |
| /de/en/articles/explore-the-world/what-i-learned-living-in-barcelona | 1440 | 4.92 | 7.11 | 5915 | 7.11 | 2.19 |
| /de/en/articles/highlights/all-it-takes-is-a-yes | 390 | 13.43 | 13.43 | 7476 | 13.43 | 0.00 |
| /de/en/articles/highlights/all-it-takes-is-a-yes | 1440 | 6.64 | 6.64 | 6748 | 6.64 | 0.00 |
| /de/en/articles/explore-the-world/what-i-learned-living-in-frankfurt | 390 | 7.58 | 8.45 | 6089 | 8.45 | 0.87 |
| /de/en/articles/explore-the-world/what-i-learned-living-in-frankfurt | 1440 | 4.6 | 6.64 | 4503 | 6.64 | 2.04 |
| /de/en/articles/highlights | 390 | 0.66 | 0.66 | 9456 | 0.66 | 0.00 |
| /de/en/articles/highlights | 1440 | 1.3 | 1.3 | 6844 | 1.3 | 0.00 |
| /de/en/articles/tags | 390 | 2.85 | 6.36 | 2472 | 6.36 | 3.51 |
| /de/en/articles/tags | 1440 | 1.2 | 7.97 | 1963 | 7.97 | 6.77 |
| /de/en/articles/tags/allegris | 390 | 3.88 | 10.03 | 7940 | 10.03 | 6.15 |
| /de/en/articles/tags/allegris | 1440 | 9.01 | 8.71 | 7479 | 8.71 | -0.30 |
| /de/en/articles/highlights/allegris-premium-economy-san-diego | 390 | 6.72 | 15.78 | 7337 | 15.78 | 9.06 |
| /de/en/articles/highlights/allegris-premium-economy-san-diego | 1440 | 8.12 | 16.89 | 6772 | 16.89 | 8.77 |
| /de/en/automatic-check-in | 390 | 6.75 | 5.76 | 4525 | 5.76 | -0.99 |
| /de/en/automatic-check-in | 1440 | 3.37 | 4.52 | 3011 | 4.52 | 1.15 |
| /de/en/assistenzhunde | 390 | 10.18 | 9.08 | 3714 | 9.08 | -1.10 |
| /de/en/assistenzhunde | 1440 | 7.97 | 7.29 | 2336 | 7.29 | -0.68 |
| /de/en/articles/tags/munich | 390 | 16.61 | 18.74 | 8758 | 18.74 | 2.13 |
| /de/en/articles/tags/munich | 1440 | 13.06 | 13.98 | 7418 | 13.98 | 0.92 |
| /de/en/baggage-irregularities | 390 | 8.15 | 11.41 | 5071 | 11.41 | 3.26 |
| /de/en/baggage-irregularities | 1440 | 8.98 | 13.85 | 3757 | 13.85 | 4.87 |
| /de/en/baggage | 390 | 5.01 | 6.13 | 7336 | 6.13 | 1.12 |
| /de/en/baggage | 1440 | 1.71 | 1.98 | 4627 | 1.98 | 0.27 |
| /de/en/besondere-befoerderungsbedingungen-bus | 390 | 9.12 | 9.12 | 15433 | 9.12 | 0.00 |
| /de/en/besondere-befoerderungsbedingungen-bus | 1440 | 3.99 | 4.2 | 9282 | 4.2 | 0.21 |
| /de/en/bid-upgrade | 390 | 7.98 | 7.98 | 5020 | 7.98 | 0.00 |
| /de/en/bid-upgrade | 1440 | 2.3 | 2.3 | 3889 | 2.3 | 0.00 |
| /de/en/boeing787 | 390 | 7.44 | 7.69 | 8344 | 7.69 | 0.25 |
| /de/en/boeing787 | 1440 | 5.99 | 4.7 | 7544 | 4.7 | -1.29 |
| /de/en/boarding | 390 | 4.84 | 5.3 | 4505 | 5.3 | 0.46 |
| /de/en/boarding | 1440 | 1.81 | 1.8 | 3180 | 1.8 | -0.01 |
| /de/en/book-and-manage/additional-services/get-your-guide | 390 | 3.87 | 8.86 | 2366 | 8.86 | 4.99 |
| /de/en/book-and-manage/additional-services/get-your-guide | 1440 | 1.01 | 12.36 | 2106 | 12.36 | 11.35 |
| /de/en/book-and-manage/additional-services/travel-insurances | 390 | 11 | 16.99 | 3563 | 16.99 | 5.99 |
| /de/en/book-and-manage/additional-services/travel-insurances | 1440 | 10.23 | 18.66 | 2920 | 18.66 | 8.43 |
| /de/en/book-and-manage/cancellation-and-refund/refund/refund-form | 390 | 7.31 | 9.88 | 5085 | 9.88 | 2.57 |
| /de/en/book-and-manage/cancellation-and-refund/refund/refund-form | 1440 | 3.78 | 5 | 3982 | 5 | 1.22 |
| /de/en/book-and-manage/digital-self-services/airline-apps | 390 | 4.18 | 5.83 | 3491 | 5.83 | 1.65 |
| /de/en/book-and-manage/digital-self-services/airline-apps | 1440 | 2.22 | 7.34 | 1736 | 7.34 | 5.12 |
| /de/en/book-and-manage/flights/air-baltic | 390 | 5.67 | 5.73 | 10452 | 5.73 | 0.06 |
| /de/en/book-and-manage/flights/air-baltic | 1440 | 6.3 | 6.04 | 6494 | 6.04 | -0.26 |
| /de/en/book-and-manage/flights/ana | 390 | 8.35 | 12.35 | 5080 | 12.35 | 4.00 |
| /de/en/book-and-manage/flights/ana | 1440 | 6.35 | 6.22 | 3363 | 6.22 | -0.13 |
| /de/en/book-and-manage/flights/giftvoucher | 390 | 23.04 | 15.73 | 6974 | 15.73 | -7.31 |
| /de/en/book-and-manage/flights/giftvoucher | 1440 | 13.18 | 11.54 | 4399 | 11.54 | -1.64 |
| /de/en/book-and-manage/flights/helvetic | 390 | 7.29 | 8.15 | 7431 | 8.15 | 0.86 |
| /de/en/book-and-manage/flights/helvetic | 1440 | 4.53 | 4.71 | 5241 | 4.71 | 0.18 |
| /de/en/book-and-manage/passenger-receipt-90days/confirmation | 390 | 4.17 | 9.75 | 1281 | 9.75 | 5.58 |
| /de/en/book-and-manage/passenger-receipt-90days/confirmation | 1440 | 1.79 | 7.65 | 1086 | 7.65 | 5.86 |
| /de/en/book-and-manage/flights/wetlease-hub | 390 | 6.29 | 7.33 | 3362 | 7.33 | 1.04 |
| /de/en/book-and-manage/flights/wetlease-hub | 1440 | 3.93 | 3.93 | 2971 | 3.93 | 0.00 |
| /de/en/book-and-manage/rebook | 390 | 6.62 | 6.62 | 2407 | 6.62 | 0.00 |
| /de/en/book-and-manage/rebook | 1440 | 4.33 | 4.33 | 1886 | 4.33 | 0.00 |
| /de/en/book-and-manage/pax-receipt | 390 | 6.93 | 8.55 | 2475 | 8.55 | 1.62 |
| /de/en/book-and-manage/pax-receipt | 1440 | 3.01 | 4.12 | 2073 | 4.12 | 1.11 |
| /de/en/book-and-manage/pax-receipt/invoices-different-countries | 390 | 6.46 | 5.52 | 2289 | 5.52 | -0.94 |
| /de/en/book-and-manage/pax-receipt/invoices-different-countries | 1440 | 3.17 | 2.96 | 2072 | 2.96 | -0.21 |
| /de/en/book-and-manage/rebook/involuntary-rebooking | 390 | 8.72 | 8.72 | 7667 | 8.72 | 0.00 |
| /de/en/book-and-manage/rebook/involuntary-rebooking | 1440 | 4.43 | 4.43 | 4841 | 4.43 | 0.00 |
| /de/en/book-and-manage/rebook/voluntary-rebooking | 390 | 9.17 | 9.17 | 9651 | 9.17 | 0.00 |
| /de/en/book-and-manage/rebook/voluntary-rebooking | 1440 | 5.4 | 5.4 | 6050 | 5.4 | 0.00 |
| /de/en/business-class-on-short-and-medium-haul | 390 | 7.31 | 9.56 | 3958 | 9.56 | 2.25 |
| /de/en/business-class-on-short-and-medium-haul | 1440 | 2.69 | 6.44 | 2916 | 6.44 | 3.75 |
| /de/en/business-terms-and-conditions | 390 | 4.68 | 7.28 | 2950 | 7.28 | 2.60 |
| /de/en/business-terms-and-conditions | 1440 | 2.32 | 7.77 | 1837 | 7.77 | 5.45 |
| /de/en/cancellations-and-refunds | 390 | 7.68 | 13.84 | 3126 | 13.84 | 6.16 |
| /de/en/cancellations-and-refunds | 1440 | 3.54 | 12.42 | 2341 | 12.42 | 8.88 |
| /de/en/carry-on-baggage | 390 | 6.45 | 6.5 | 9637 | 6.5 | 0.05 |
| /de/en/carry-on-baggage | 1440 | 7.32 | 10.62 | 6479 | 10.62 | 3.30 |
| /de/en/check-in-baggage | 390 | 7.28 | 9.52 | 3343 | 9.52 | 2.24 |
| /de/en/check-in-baggage | 1440 | 6.17 | 8.53 | 3477 | 8.53 | 2.36 |
| /de/en/check-in-with-the-family | 390 | 2.95 | 12.72 | 3283 | 12.72 | 9.77 |
| /de/en/check-in-with-the-family | 1440 | 1.74 | 9.11 | 2522 | 9.11 | 7.37 |
| /de/en/cash-and-miles | 390 | 11.65 | 13.48 | 4062 | 13.48 | 1.83 |
| /de/en/cash-and-miles | 1440 | 10.35 | 12.42 | 2890 | 12.42 | 2.07 |
| /de/en/childrens-menus-on-board | 390 | 6.09 | 14.88 | 5515 | 14.88 | 8.79 |
| /de/en/childrens-menus-on-board | 1440 | 0.91 | 11 | 4076 | 11 | 10.09 |
| /de/en/children-on-board | 390 | 5.3 | 5.3 | 3642 | 5.3 | 0.00 |
| /de/en/children-on-board | 1440 | 4.53 | 7.56 | 2377 | 7.56 | 3.03 |
| /de/en/common/agb-extra-services-at-online-check-in | 390 | 6.59 | 6.46 | 2632 | 6.46 | -0.13 |
| /de/en/common/agb-extra-services-at-online-check-in | 1440 | 1.6 | 1.44 | 2328 | 1.44 | -0.16 |
| /de/en/common/accessibility-statement | 390 | 7.42 | 7.42 | 9987 | 7.42 | 0.00 |
| /de/en/common/accessibility-statement | 1440 | 6.73 | 6.73 | 6600 | 6.73 | 0.00 |
| /de/en/common/compensation-voucher | 390 | 7.43 | 7.43 | 6726 | 7.43 | 0.00 |
| /de/en/common/compensation-voucher | 1440 | 2.8 | 2.8 | 4210 | 2.8 | 0.00 |
| /de/en/common/agb-extra-services-at-online-check-in/conditions-seat-reservation | 390 | 6.77 | 6.77 | 3568 | 6.77 | 0.00 |
| /de/en/common/agb-extra-services-at-online-check-in/conditions-seat-reservation | 1440 | 5.53 | 5.53 | 2675 | 5.53 | 0.00 |
| /de/en/common/imprint/lufthansa-insights-imprint | 390 | 4.54 | 8.58 | 4758 | 8.58 | 4.04 |
| /de/en/common/imprint/lufthansa-insights-imprint | 1440 | 1.75 | 5.85 | 2852 | 5.85 | 4.10 |
| /de/en/cookie-policy | 390 | 6.06 | 6.31 | 12180 | 6.33 | 0.25 |
| /de/en/cookie-policy | 1440 | 2.98 | 2.99 | 9694 | 2.97 | 0.01 |
| /de/en/common/privacy-statement/privacy-statement-group | 390 | 10 | 10 | 1924 | 10 | 0.00 |
| /de/en/common/privacy-statement/privacy-statement-group | 1440 | 3.51 | 5.41 | 1495 | 5.41 | 1.90 |
| /de/en/culinaryjourney | 390 | 32.63 | 32.63 | 1620 | 32.63 | 0.00 |
| /de/en/culinaryjourney | 1440 | 10.52 | 10.52 | 1524 | 10.52 | 0.00 |
| /de/en/common/seatreservation-condtions/seat-reservations | 390 | 10.08 | 10.08 | 4167 | 10.08 | 0.00 |
| /de/en/common/seatreservation-condtions/seat-reservations | 1440 | 4.96 | 4.85 | 2878 | 4.85 | -0.11 |
| /de/en/dangerous-dogs | 390 | 12.55 | 10.09 | 4023 | 10.09 | -2.46 |
| /de/en/dangerous-dogs | 1440 | 3 | 7.31 | 2456 | 7.31 | 4.31 |
| /de/en/data-protection-information | 390 | 5.36 | 4.62 | 29457 | 4.54 | -0.74 |
| /de/en/data-protection-information | 1440 | 4.44 | 4.62 | 15963 | 4.43 | 0.18 |
| /de/en/data-collection-usa | 390 | 4.72 | 6.16 | 7412 | 6.16 | 1.44 |
| /de/en/data-collection-usa | 1440 | 4.3 | 4.63 | 5334 | 4.63 | 0.33 |
| /de/en/data-collection-canada | 390 | 9.93 | 8.23 | 5491 | 12.65 | -1.70 |
| /de/en/data-collection-canada | 1440 | 8.17 | 12.96 | 4142 | 10.31 | 4.79 |
| /de/en/digital-baggage-services | 390 | 5.37 | 6.34 | 4893 | 6.34 | 0.97 |
| /de/en/digital-baggage-services | 1440 | 5.95 | 5.5 | 3744 | 5.5 | -0.45 |
| /de/en/datenschutz | 390 | 7.83 | 12.73 | 1870 | 12.73 | 4.90 |
| /de/en/datenschutz | 1440 | 8.51 | 9.24 | 1580 | 9.24 | 0.73 |
| /de/en/discover-lufthansa/carbon-offsetting/climate-protection-projects | 390 | 7.97 | 7.97 | 6070 | 7.97 | 0.00 |
| /de/en/discover-lufthansa/carbon-offsetting/climate-protection-projects | 1440 | 4.01 | 4.01 | 4479 | 4.01 | 0.00 |
| /de/en/discover-lufthansa/carbon-offsetting/saf | 390 | 6.59 | 10.18 | 5226 | 10.18 | 3.59 |
| /de/en/discover-lufthansa/carbon-offsetting/saf | 1440 | 3.31 | 8.08 | 3669 | 8.08 | 4.77 |
| /de/en/discover-lufthansa/flightreservation-priceguarantee | 390 | 12.72 | 11.17 | 4819 | 11.17 | -1.55 |
| /de/en/discover-lufthansa/flightreservation-priceguarantee | 1440 | 4.7 | 5.12 | 3766 | 5.12 | 0.42 |
| /de/en/discover-lufthansa/lufthansa-fleet/351 | 390 | 8.53 | 9.79 | 8607 | 9.79 | 1.26 |
| /de/en/discover-lufthansa/lufthansa-fleet/351 | 1440 | 4.88 | 7.4 | 7783 | 7.4 | 2.52 |
| /de/en/discover-lufthansa/lufthansa-group-airlines/ita-airways | 390 | 7.06 | 7.06 | 5493 | 7.06 | 0.00 |
| /de/en/discover-lufthansa/lufthansa-group-airlines/ita-airways | 1440 | 6.25 | 6.9 | 3796 | 6.9 | 0.65 |
| /de/en/discover-lufthansa/new-onboard-experience | 390 | 7.47 | 7.47 | 18227 | 7.47 | 0.00 |
| /de/en/discover-lufthansa/new-onboard-experience | 1440 | 6.19 | 21.13 | 15178 | 21.13 | 14.94 |
| /de/en/discover-lufthansa/miles-and-more-credit-card | 390 | 8.56 | 8.56 | 8648 | 8.56 | 0.00 |
| /de/en/discover-lufthansa/miles-and-more-credit-card | 1440 | 10.48 | 10.48 | 5054 | 10.48 | 0.00 |
| /de/en/discover-lufthansa/take-off | 390 | 4.75 | 16.4 | 6895 | 16.4 | 11.65 |
| /de/en/discover-lufthansa/take-off | 1440 | 1.76 | 12.83 | 4512 | 12.83 | 11.07 |
| /de/en/doctor-on-board-news | 390 | 9.61 | 12.72 | 2332 | 12.72 | 3.11 |
| /de/en/doctor-on-board-news | 1440 | 7.31 | 17.63 | 2346 | 17.63 | 10.32 |
| /de/en/doctor-on-board | 390 | 6.03 | 7.31 | 4784 | 7.31 | 1.28 |
| /de/en/doctor-on-board | 1440 | 3.48 | 4.65 | 3829 | 4.65 | 1.17 |
| /de/en/during-your-trip/food-and-beverages/onboard-delights/faq | 390 | 2.62 | 6.14 | 2507 | 6.14 | 3.52 |
| /de/en/during-your-trip/food-and-beverages/onboard-delights/faq | 1440 | 1.08 | 6.71 | 1984 | 6.71 | 5.63 |
| /de/en/during-your-trip/internet-overview | 390 | 13.89 | 13.89 | 4713 | 13.89 | 0.00 |
| /de/en/during-your-trip/internet-overview | 1440 | 5.15 | 5.15 | 3142 | 5.15 | 0.00 |
| /de/en/during-your-trip/lhg-wifi | 390 | 11.38 | 12.43 | 6171 | 12.43 | 1.05 |
| /de/en/during-your-trip/lhg-wifi | 1440 | 8.96 | 11.4 | 4125 | 11.4 | 2.44 |
| /de/en/economy-class | 390 | 11.92 | 11.92 | 10009 | 11.92 | 0.00 |
| /de/en/economy-class | 1440 | 7.17 | 7.17 | 8273 | 7.17 | 0.00 |
| /de/en/electronic-bag-tags | 390 | 6 | 6.81 | 3784 | 6.81 | 0.81 |
| /de/en/electronic-bag-tags | 1440 | 3.42 | 5.31 | 2829 | 5.31 | 1.89 |
| /de/en/europa-tarife-economy-class | 390 | 7.99 | 8.55 | 7377 | 8.55 | 0.56 |
| /de/en/europa-tarife-economy-class | 1440 | 4.26 | 2.95 | 5442 | 2.95 | -1.31 |
| /de/en/europcar | 390 | 2.41 | 3.9 | 4388 | 3.9 | 1.49 |
| /de/en/europcar | 1440 | 3.8 | 3.24 | 3010 | 3.24 | -0.56 |
| /de/en/exclusive-charter | 390 | 8.68 | 25.06 | 2814 | 25.06 | 16.38 |
| /de/en/exclusive-charter | 1440 | 4.86 | 16.8 | 2199 | 16.8 | 11.94 |
| /de/en/faq-data-security | 390 | 3.32 | 8.87 | 1604 | 8.87 | 5.55 |
| /de/en/faq-data-security | 1440 | 0.97 | 9.2 | 1372 | 9.2 | 8.23 |
| /de/en/entryprocesses | 390 | 5.51 | 14.54 | 5211 | 14.54 | 9.03 |
| /de/en/entryprocesses | 1440 | 2.62 | 14.8 | 2892 | 14.8 | 12.18 |
| /de/en/faq-password-security | 390 | 3.82 | 9.25 | 1643 | 9.25 | 5.43 |
| /de/en/faq-password-security | 1440 | 0.9 | 9.09 | 1378 | 9.09 | 8.19 |
| /de/en/farealert/best-price-alert | 390 | 7.91 | 18.09 | 5240 | 18.09 | 10.18 |
| /de/en/farealert/best-price-alert | 1440 | 3.6 | 14.39 | 4227 | 14.39 | 10.79 |
| /de/en/feedback | 390 | 8.47 | 7.3 | 3680 | 7.3 | -1.17 |
| /de/en/feedback | 1440 | 2.47 | 6.27 | 3136 | 6.27 | 3.80 |
| /de/en/feedback-past-flight | 390 | 9.25 | 9.25 | 7128 | 9.25 | 0.00 |
| /de/en/feedback-past-flight | 1440 | 5.42 | 5.42 | 6133 | 5.42 | 0.00 |
| /de/en/fia-valet-service | 390 | 3.39 | 5.54 | 4863 | 5.54 | 2.15 |
| /de/en/fia-valet-service | 1440 | 1.97 | 2.54 | 3443 | 2.54 | 0.57 |
| /de/en/feedback/feedbackai | 390 | 11.06 | 8.83 | 1184 | 8.83 | -2.23 |
| /de/en/feedback/feedbackai | 1440 | 6.81 | 4.06 | 1035 | 4.06 | -2.75 |
| /de/en/first-class | 390 | 16.73 | 19.52 | 23536 | 19.52 | 2.79 |
| /de/en/first-class | 1440 | 8.83 | 18.01 | 20923 | 18.01 | 9.18 |
| /de/en/first-class-lounges | 390 | 3.61 | 3.61 | 6115 | 3.61 | 0.00 |
| /de/en/first-class-lounges | 1440 | 3.47 | 2.15 | 4019 | 2.15 | -1.32 |
| /de/en/first-class-comfort | 390 | 3.13 | 5.06 | 3432 | 5.06 | 1.93 |
| /de/en/first-class-comfort | 1440 | 4.84 | 8.18 | 2841 | 8.18 | 3.34 |
| /de/en/first-class-personal-assistant | 390 | 2.39 | 6.31 | 3125 | 6.31 | 3.92 |
| /de/en/first-class-personal-assistant | 1440 | 0.96 | 6.54 | 2258 | 6.54 | 5.58 |
| /de/en/first-class-valet-parking-service | 390 | 5.13 | 6.87 | 2491 | 6.87 | 1.74 |
| /de/en/first-class-valet-parking-service | 1440 | 2.15 | 6.53 | 1763 | 6.53 | 4.38 |
| /de/en/first-class-terminal | 390 | 16.22 | 27.94 | 11070 | 27.94 | 11.72 |
| /de/en/first-class-terminal | 1440 | 6.28 | 32.59 | 12341 | 32.59 | 26.31 |
| /de/en/fliegen-mit-baby | 390 | 3.3 | 7.59 | 2869 | 7.59 | 4.29 |
| /de/en/fliegen-mit-baby | 1440 | 4.98 | 6.79 | 2217 | 6.79 | 1.81 |
| /de/en/flight-disruptions | 390 | 8.94 | 14.57 | 7973 | 14.57 | 5.63 |
| /de/en/flight-disruptions | 1440 | 3.5 | 6.16 | 4893 | 6.16 | 2.66 |
| /de/en/flight-search | 390 | 7.05 | 8.05 | 3409 | 8.05 | 1.00 |
| /de/en/flight-search | 1440 | 4.62 | 4.77 | 2071 | 4.77 | 0.15 |
| /de/en/fly-more-sustainabl | 390 | 7.6 | 8.69 | 5934 | 8.69 | 1.09 |
| /de/en/fly-more-sustainabl | 1440 | 3.48 | 3.81 | 4113 | 3.81 | 0.33 |
| /de/en/flying-with-small-children | 390 | 9.24 | 10.6 | 4343 | 10.6 | 1.36 |
| /de/en/flying-with-small-children | 1440 | 4.11 | 4.54 | 3387 | 4.54 | 0.43 |
| /de/en/food-and-beverages | 390 | 6.72 | 6.72 | 6742 | 6.72 | 0.00 |
| /de/en/food-and-beverages | 1440 | 2.19 | 2.19 | 5087 | 2.19 | 0.00 |
| /de/en/fmg-valet-parking-service | 390 | 4.68 | 4.81 | 3742 | 4.81 | 0.13 |
| /de/en/fmg-valet-parking-service | 1440 | 1.96 | 3.29 | 2940 | 3.29 | 1.33 |
| /de/en/free2move | 390 | 4.07 | 6.2 | 4407 | 6.2 | 2.13 |
| /de/en/free2move | 1440 | 4.8 | 4.23 | 3078 | 4.23 | -0.57 |
| /de/en/general-conditions-currency-conversion | 390 | 2.52 | 5.53 | 2861 | 5.53 | 3.01 |
| /de/en/general-conditions-currency-conversion | 1440 | 0.94 | 6.34 | 2016 | 6.34 | 5.40 |
| /de/en/green-fare | 390 | 4.34 | 4.58 | 7312 | 4.58 | 0.24 |
| /de/en/green-fare | 1440 | 2.67 | 3.18 | 5647 | 3.18 | 0.51 |
| /de/en/gefaehrliche-gegenstaende | 390 | 8.49 | 8.92 | 8563 | 8.92 | 0.43 |
| /de/en/gefaehrliche-gegenstaende | 1440 | 6.47 | 4.63 | 5024 | 4.63 | -1.84 |
| /de/en/group-travel | 390 | 5.99 | 7.02 | 8484 | 7.02 | 1.03 |
| /de/en/group-travel | 1440 | 4.49 | 4.19 | 7606 | 4.19 | -0.30 |
| /de/en/homepage | 390 | 5.47 | 5.69 | 6213 | 5.69 | 0.22 |
| /de/en/homepage | 1440 | 6 | 6.04 | 5009 | 6.04 | 0.04 |
| /de/en/hotel-offers | 390 | 10.54 | 11.85 | 4503 | 11.85 | 1.31 |
| /de/en/hotel-offers | 1440 | 5.45 | 10.45 | 3499 | 10.45 | 5.00 |
| /de/en/imprint | 390 | 7.07 | 10.01 | 4167 | 10.01 | 2.94 |
| /de/en/imprint | 1440 | 3.57 | 7.1 | 2515 | 7.1 | 3.53 |
| /de/en/lounge-companions | 390 | 7.23 | 9.12 | 4852 | 9.12 | 1.89 |
| /de/en/lounge-companions | 1440 | 4.25 | 4.38 | 3450 | 4.38 | 0.13 |
| /de/en/lufthansa-am-flughafen-frankfurt | 390 | 9.68 | 9.68 | 6700 | 9.68 | 0.00 |
| /de/en/lufthansa-am-flughafen-frankfurt | 1440 | 7.43 | 7.43 | 4068 | 7.43 | 0.00 |
| /de/en/lufthansa-at-duesseldorf-airport | 390 | 3.27 | 6.55 | 3910 | 6.55 | 3.28 |
| /de/en/lufthansa-at-duesseldorf-airport | 1440 | 1.76 | 4.97 | 2908 | 4.97 | 3.21 |
| /de/en/lufthansa-at-berlin-airport | 390 | 7.01 | 7.01 | 4274 | 7.01 | 0.00 |
| /de/en/lufthansa-at-berlin-airport | 1440 | 2.76 | 4.25 | 2895 | 4.25 | 1.49 |
| /de/en/lufthansa-at-zuerich-airport | 390 | 5.86 | 7.36 | 3031 | 7.36 | 1.50 |
| /de/en/lufthansa-at-zuerich-airport | 1440 | 3.31 | 4.57 | 2518 | 4.57 | 1.26 |
| /de/en/lufthansa-aviation-group | 390 | 14.04 | 13.25 | 3831 | 13.25 | -0.79 |
| /de/en/lufthansa-aviation-group | 1440 | 5.38 | 9.37 | 2799 | 9.37 | 3.99 |
| /de/en/lufthansa-at-vienna-airport | 390 | 5.44 | 5.25 | 3007 | 5.25 | -0.19 |
| /de/en/lufthansa-at-vienna-airport | 1440 | 2.8 | 4.78 | 2515 | 4.78 | 1.98 |
| /de/en/lufthansa-business-class-on-long-haul-routes | 390 | 13.33 | 22.68 | 4556 | 26.44 | 9.35 |
| /de/en/lufthansa-business-class-on-long-haul-routes | 1440 | 6.46 | 17.6 | 3232 | 23.29 | 11.14 |
| /de/en/lufthansa-corporate-customers | 390 | 12.09 | 12.72 | 4179 | 12.72 | 0.63 |
| /de/en/lufthansa-corporate-customers | 1440 | 2.61 | 9.7 | 3412 | 9.7 | 7.09 |
| /de/en/lufthansa-express | 390 | 8.56 | 11.52 | 6476 | 11.52 | 2.96 |
| /de/en/lufthansa-express | 1440 | 6.29 | 9.88 | 4193 | 9.88 | 3.59 |
| /de/en/lufthansa-express-bus | 390 | 8.9 | 9.35 | 7806 | 9.35 | 0.45 |
| /de/en/lufthansa-express-bus | 1440 | 4.12 | 5.81 | 4909 | 5.81 | 1.69 |
| /de/en/lufthansa-first-class-entertainment | 390 | 4.22 | 9.35 | 3816 | 9.35 | 5.13 |
| /de/en/lufthansa-first-class-entertainment | 1440 | 6.58 | 7.22 | 3078 | 7.22 | 0.64 |
| /de/en/lufthansa-express-rail | 390 | 7.25 | 7.9 | 10774 | 7.9 | 0.65 |
| /de/en/lufthansa-express-rail | 1440 | 6.08 | 7.43 | 7692 | 7.57 | 1.35 |
| /de/en/lufthansa-first-class-fleet | 390 | 4.2 | 13.47 | 4207 | 13.47 | 9.27 |
| /de/en/lufthansa-first-class-fleet | 1440 | 6.68 | 6.34 | 4156 | 6.34 | -0.34 |
| /de/en/lufthansa-group-star-alliance-and-partner-airlines | 390 | 11.49 | 10.73 | 10462 | 10.73 | -0.76 |
| /de/en/lufthansa-group-star-alliance-and-partner-airlines | 1440 | 7.37 | 8.12 | 5931 | 8.12 | 0.75 |
| /de/en/lufthansa-guide-service | 390 | 8.59 | 8.55 | 5650 | 8.55 | -0.04 |
| /de/en/lufthansa-guide-service | 1440 | 4.33 | 5.44 | 3921 | 5.44 | 1.11 |
| /de/en/lufthansa-terminal-muenchen | 390 | 10.22 | 8.12 | 6576 | 8.12 | -2.10 |
| /de/en/lufthansa-terminal-muenchen | 1440 | 6.93 | 4.71 | 4267 | 4.71 | -2.22 |
| /de/en/medikamenten-transport | 390 | 10.41 | 10.41 | 4180 | 10.41 | 0.00 |
| /de/en/medikamenten-transport | 1440 | 2.62 | 2.62 | 2838 | 2.62 | 0.00 |
| /de/en/meetings-and-events-delegates | 390 | 6.03 | 6.29 | 2893 | 6.29 | 0.26 |
| /de/en/meetings-and-events-delegates | 1440 | 2.07 | 3.72 | 2322 | 3.72 | 1.65 |
| /de/en/meetings-and-events-organisers | 390 | 6.29 | 10.03 | 4177 | 10.03 | 3.74 |
| /de/en/meetings-and-events-organisers | 1440 | 2.19 | 8.41 | 2998 | 8.41 | 6.22 |
| /de/en/menus-on-long-haul-flights | 390 | 3.46 | 7.41 | 4566 | 7.41 | 3.95 |
| /de/en/menus-on-long-haul-flights | 1440 | 1.88 | 8 | 3218 | 8 | 6.12 |
| /de/en/mobility-partner-program-healthcare | 390 | 6.53 | 9.97 | 4678 | 9.97 | 3.44 |
| /de/en/mobility-partner-program-healthcare | 1440 | 7.85 | 11.62 | 3466 | 11.59 | 3.77 |
| /de/en/menus-travel-classes | 390 | 3.97 | 6.5 | 3159 | 6.5 | 2.53 |
| /de/en/menus-travel-classes | 1440 | 1.58 | 5.87 | 2298 | 5.87 | 4.29 |
| /de/en/my-bookings | 390 | 8.21 | 10.72 | 5252 | 10.72 | 2.51 |
| /de/en/my-bookings | 1440 | 1.2 | 4.37 | 3599 | 4.37 | 3.17 |
| /de/en/munich-fair | 390 | 6.1 | 6.1 | 3157 | 6.1 | 0.00 |
| /de/en/munich-fair | 1440 | 9.8 | 11.31 | 2451 | 11.31 | 1.51 |
| /de/en/my-logbook | 390 | 9.4 | 11.67 | 3449 | 11.67 | 2.27 |
| /de/en/my-logbook | 1440 | 4.58 | 10.67 | 3142 | 10.67 | 6.09 |
| /de/en/onboard-delights | 390 | 10.99 | 13.91 | 9527 | 13.91 | 2.92 |
| /de/en/onboard-delights | 1440 | 4.84 | 10.69 | 7401 | 10.69 | 5.85 |
| /de/en/online-check-in | 390 | 11.29 | 10.46 | 5689 | 10.46 | -0.83 |
| /de/en/online-check-in | 1440 | 4.92 | 4.83 | 3559 | 4.83 | -0.09 |
| /de/en/online-check-in-info | 390 | 5.54 | 8.04 | 3041 | 8.04 | 2.50 |
| /de/en/online-check-in-info | 1440 | 3.34 | 8.39 | 2749 | 8.39 | 5.05 |
| /de/en/overview-special-request | 390 | 5.79 | 5.79 | 3936 | 5.79 | 0.00 |
| /de/en/overview-special-request | 1440 | 2.46 | 2.46 | 2746 | 2.46 | 0.00 |
| /de/en/partner | 390 | 6.79 | 6.79 | 3425 | 6.79 | 0.00 |
| /de/en/partner | 1440 | 3.76 | 3.76 | 2684 | 3.76 | 0.00 |
| /de/en/passenger-receipt-90 | 390 | 9.17 | 11.27 | 4130 | 11.27 | 2.10 |
| /de/en/passenger-receipt-90 | 1440 | 2.32 | 6.97 | 3406 | 3.19 | 4.65 |
| /de/en/passenger-rights | 390 | 6.09 | 6.57 | 9097 | 6.57 | 0.48 |
| /de/en/passenger-rights | 1440 | 3.07 | 4.37 | 5763 | 4.37 | 1.30 |
| /de/en/payment-options-at-the-airport | 390 | 7.04 | 5.83 | 3327 | 5.83 | -1.21 |
| /de/en/payment-options-at-the-airport | 1440 | 0.94 | 3.56 | 2570 | 3.56 | 2.62 |
| /de/en/passengers-with-sensory-impairment | 390 | 3.72 | 3.71 | 14647 | 3.71 | -0.01 |
| /de/en/passengers-with-sensory-impairment | 1440 | 3.28 | 6.23 | 8375 | 6.23 | 2.95 |
| /de/en/passengers-using-wheelchairs | 390 | 7.53 | 6.82 | 20214 | 6.82 | -0.71 |
| /de/en/passengers-using-wheelchairs | 1440 | 4.51 | 4.46 | 11103 | 4.46 | -0.05 |
| /de/en/pre-check-in | 390 | 4.89 | 6.23 | 3570 | 6.81 | 1.34 |
| /de/en/pre-check-in | 1440 | 3.29 | 5.46 | 2418 | 6.41 | 2.17 |
| /de/en/prepare-for-your-trip/baggage/baggage-conditions | 390 | 3.16 | 3.49 | 3409 | 3.49 | 0.33 |
| /de/en/prepare-for-your-trip/baggage/baggage-conditions | 1440 | 6.2 | 5.02 | 2142 | 5.02 | -1.18 |
| /de/en/prepare-for-your-trip/baggage/baggage-irregularities/delayed-baggage-lhg | 390 | 5.88 | 7.77 | 4397 | 7.77 | 1.89 |
| /de/en/prepare-for-your-trip/baggage/baggage-irregularities/delayed-baggage-lhg | 1440 | 2.92 | 4.12 | 2745 | 4.12 | 1.20 |
| /de/en/prepare-for-your-trip/baggage/baggage-irregularities/faq-damaged-baggage | 390 | 3.02 | 6.31 | 2731 | 6.31 | 3.29 |
| /de/en/prepare-for-your-trip/baggage/baggage-irregularities/faq-damaged-baggage | 1440 | 1.15 | 6.11 | 2287 | 6.11 | 4.96 |
| /de/en/prepare-for-your-trip/baggage/baggage-irregularities/faq-baggage-delay | 390 | 8.15 | 12.25 | 4883 | 12.25 | 4.10 |
| /de/en/prepare-for-your-trip/baggage/baggage-irregularities/faq-baggage-delay | 1440 | 8.27 | 5.89 | 3676 | 5.89 | -2.38 |
| /de/en/premium-economy-class | 390 | 12 | 12 | 9223 | 12 | 0.00 |
| /de/en/premium-economy-class | 1440 | 7.09 | 7.09 | 7057 | 7.09 | 0.00 |
| /de/en/prepare-for-your-trip/baggage/electronic-devices-and-batteries | 390 | 8 | 9.53 | 7134 | 9.53 | 1.53 |
| /de/en/prepare-for-your-trip/baggage/electronic-devices-and-batteries | 1440 | 4.57 | 5.05 | 4413 | 5.05 | 0.48 |
| /de/en/prepare-for-your-trip/baggage/baggage-irregularities/report-baggage | 390 | 5.54 | 7.08 | 4910 | 7.08 | 1.54 |
| /de/en/prepare-for-your-trip/baggage/baggage-irregularities/report-baggage | 1440 | 5.09 | 6.84 | 2719 | 6.84 | 1.75 |
| /de/en/prepare-for-your-trip/baggage/sport-baggage/register-sports-baggage/confirmation | 390 | 5.06 | 8.27 | 1779 | 8.27 | 3.21 |
| /de/en/prepare-for-your-trip/baggage/sport-baggage/register-sports-baggage/confirmation | 1440 | 2.08 | 8.9 | 1411 | 8.9 | 6.82 |
| /de/en/prepare-for-your-trip/baggage/sport-baggage/register-sporting-firearm/confirmation | 390 | 4.12 | 8.77 | 1545 | 8.77 | 4.65 |
| /de/en/prepare-for-your-trip/baggage/sport-baggage/register-sporting-firearm/confirmation | 1440 | 1.63 | 6.97 | 1188 | 6.97 | 5.34 |
| /de/en/prepare-for-your-trip/baggage/travelling-with-animals/register-animal-cargo-hold/confirmation | 390 | 4.02 | 8.66 | 1545 | 8.66 | 4.64 |
| /de/en/prepare-for-your-trip/baggage/travelling-with-animals/register-animal-cargo-hold/confirmation | 1440 | 1.59 | 6.94 | 1188 | 6.94 | 5.35 |
| /de/en/prepare-for-your-trip/entry-regulations/entering-schengen/entry-exit-system | 390 | 13.62 | 13.17 | 8791 | 13.17 | -0.45 |
| /de/en/prepare-for-your-trip/entry-regulations/entering-schengen/entry-exit-system | 1440 | 4.36 | 4.79 | 5613 | 4.79 | 0.43 |
| /de/en/prepare-for-your-trip/baggage/travelling-with-animals/register-animal/confirmation | 390 | 4.02 | 8.66 | 1545 | 8.66 | 4.64 |
| /de/en/prepare-for-your-trip/baggage/travelling-with-animals/register-animal/confirmation | 1440 | 1.59 | 6.94 | 1188 | 6.94 | 5.35 |
| /de/en/prepare-for-your-trip/entry-regulations/immigration-regulations-uk | 390 | 4.89 | 7.1 | 3097 | 7.1 | 2.21 |
| /de/en/prepare-for-your-trip/entry-regulations/immigration-regulations-uk | 1440 | 6.06 | 3.53 | 2560 | 3.53 | -2.53 |
| /de/en/prepare-for-your-trip/getting-to-and-from-the-airport/lufthansa-express-bus-briefing | 390 | 11.36 | 11.36 | 3308 | 11.36 | 0.00 |
| /de/en/prepare-for-your-trip/getting-to-and-from-the-airport/lufthansa-express-bus-briefing | 1440 | 5.35 | 3.16 | 2515 | 3.16 | -2.19 |
| /de/en/prepare-for-your-trip/special-travel-needs/medical-travel-companions | 390 | 8.91 | 8.91 | 2703 | 8.91 | 0.00 |
| /de/en/prepare-for-your-trip/special-travel-needs/medical-travel-companions | 1440 | 1.1 | 1.1 | 2545 | 1.1 | 0.00 |
| /de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/cognitive-impairment | 390 | 5.86 | 5.96 | 12867 | 5.96 | 0.10 |
| /de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/cognitive-impairment | 1440 | 12.71 | 14.89 | 7168 | 14.89 | 2.18 |
| /de/en/prepare-for-your-trip/getting-to-and-from-the-airport/lufthansa-express-rail-briefing | 390 | 12.88 | 12.88 | 3477 | 12.88 | 0.00 |
| /de/en/prepare-for-your-trip/getting-to-and-from-the-airport/lufthansa-express-rail-briefing | 1440 | 8.17 | 8.17 | 2612 | 8.17 | 0.00 |
| /de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/hearing-impairment | 390 | 4.94 | 7.78 | 9742 | 7.78 | 2.84 |
| /de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/hearing-impairment | 1440 | 4.36 | 6.33 | 5326 | 6.33 | 1.97 |
| /de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/travel-companion | 390 | 8.38 | 14.26 | 8221 | 14.26 | 5.88 |
| /de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/travel-companion | 1440 | 5.84 | 9.22 | 4812 | 9.22 | 3.38 |
| /de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/special-needs-online-form/confirmation | 390 | 5.32 | 11.87 | 1267 | 11.87 | 6.55 |
| /de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/special-needs-online-form/confirmation | 1440 | 2.37 | 11.2 | 1018 | 11.2 | 8.83 |
| /de/en/prepare-for-your-trip/travel-classes/economy-basic | 390 | 12.27 | 12.72 | 4930 | 12.72 | 0.45 |
| /de/en/prepare-for-your-trip/travel-classes/economy-basic | 1440 | 3.23 | 5.86 | 4062 | 5.86 | 2.63 |
| /de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/visual-impairment | 390 | 4.34 | 4.43 | 10678 | 4.43 | 0.09 |
| /de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/visual-impairment | 1440 | 5.04 | 6.79 | 5736 | 6.79 | 1.75 |
| /de/en/prepare-for-your-trip/travelling-with-children/child-in-businessclass | 390 | 8.24 | 9.32 | 5873 | 9.32 | 1.08 |
| /de/en/prepare-for-your-trip/travelling-with-children/child-in-businessclass | 1440 | 11.34 | 9.3 | 5142 | 9.3 | -2.04 |
| /de/en/refund | 390 | 3.26 | 4.3 | 3187 | 4.3 | 1.04 |
| /de/en/refund | 1440 | 1.71 | 2.64 | 2404 | 2.64 | 0.93 |
| /de/en/rail-and-fly | 390 | 8.64 | 9.11 | 6660 | 9.11 | 0.47 |
| /de/en/rail-and-fly | 1440 | 5.2 | 8.32 | 4833 | 8.32 | 3.12 |
| /de/en/rail-fly-terms-and-conditions | 390 | 8.6 | 7.71 | 5155 | 7.51 | -0.89 |
| /de/en/rail-fly-terms-and-conditions | 1440 | 5.11 | 4.26 | 3024 | 5.47 | -0.85 |
| /de/en/register-animal-cabin | 390 | 8.04 | 7.35 | 7520 | 7.35 | -0.69 |
| /de/en/register-animal-cabin | 1440 | 5.36 | 4.4 | 5559 | 4.4 | -0.96 |
| /de/en/schengen | 390 | 6.8 | 10.94 | 4428 | 10.94 | 4.14 |
| /de/en/schengen | 1440 | 4.63 | 7.41 | 3042 | 7.41 | 2.78 |
| /de/en/secure-flight | 390 | 3.51 | 6.49 | 2084 | 6.49 | 2.98 |
| /de/en/secure-flight | 1440 | 1.54 | 9.42 | 1295 | 9.42 | 7.88 |
| /de/en/security-fast-lanes | 390 | 6 | 8.31 | 3562 | 8.31 | 2.31 |
| /de/en/security-fast-lanes | 1440 | 5.27 | 3.7 | 3038 | 3.7 | -1.57 |
| /de/en/security-check-time-slot | 390 | 3.94 | 5.75 | 2993 | 6.28 | 1.81 |
| /de/en/security-check-time-slot | 1440 | 2.6 | 4.01 | 2868 | 6.67 | 1.41 |
| /de/en/seat-maps | 390 | 7.39 | 12.16 | 5675 | 12.16 | 4.77 |
| /de/en/seat-maps | 1440 | 3.59 | 7.1 | 4859 | 7.1 | 3.51 |
| /de/en/services-at-frankfurt-airport | 390 | 5.75 | 5.75 | 3232 | 5.75 | 0.00 |
| /de/en/services-at-frankfurt-airport | 1440 | 5.27 | 7.12 | 2297 | 7.12 | 1.85 |
| /de/en/sepa-terms-and-conditions | 390 | 3.75 | 6.93 | 2525 | 11.82 | 3.18 |
| /de/en/sepa-terms-and-conditions | 1440 | 1.01 | 7.2 | 1843 | 10.8 | 6.19 |
| /de/en/sepa-terms-and-conditions-b | 390 | 6.14 | 8.59 | 2778 | 10.88 | 2.45 |
| /de/en/sepa-terms-and-conditions-b | 1440 | 2.86 | 7.41 | 1948 | 10.15 | 4.55 |
| /de/en/services-at-the-airport | 390 | 7.83 | 6.7 | 3433 | 6.41 | -1.13 |
| /de/en/services-at-the-airport | 1440 | 2.16 | 2.16 | 2830 | 1.82 | 0.00 |
| /de/en/shopping | 390 | 8.84 | 9.08 | 9914 | 9.08 | 0.24 |
| /de/en/shopping | 1440 | 4.07 | 9.22 | 5627 | 9.22 | 5.15 |
| /de/en/services-munich-airport | 390 | 7.66 | 6.08 | 2119 | 6.08 | -1.58 |
| /de/en/services-munich-airport | 1440 | 4.47 | 6.62 | 1971 | 6.62 | 2.15 |
| /de/en/special-meals | 390 | 11.3 | 17.78 | 6948 | 17.78 | 6.48 |
| /de/en/special-meals | 1440 | 8.35 | 17.12 | 5239 | 17.12 | 8.77 |
| /de/en/sports-baggage | 390 | 6.62 | 6.25 | 7709 | 6.25 | -0.37 |
| /de/en/sports-baggage | 1440 | 5.94 | 3.24 | 4872 | 3.24 | -2.70 |
| /de/en/support/contact/contact-form-confirmation | 390 | 4.11 | 9.24 | 1304 | 9.24 | 5.13 |
| /de/en/support/contact/contact-form-confirmation | 1440 | 0.98 | 7.66 | 1109 | 7.66 | 6.68 |
| /de/en/support/contact/passenger-duty-united-kingdom | 390 | 6.22 | 13.49 | 2664 | 13.49 | 7.27 |
| /de/en/support/contact/passenger-duty-united-kingdom | 1440 | 8.03 | 7.32 | 1847 | 7.32 | -0.71 |
| /de/en/support/feedback-and-contact-airlines | 390 | 7.41 | 10.03 | 4086 | 10.03 | 2.62 |
| /de/en/support/feedback-and-contact-airlines | 1440 | 3.53 | 6.19 | 1957 | 6.19 | 2.66 |
| /de/en/terms-of-use | 390 | 6.07 | 5.72 | 5764 | 12.64 | -0.35 |
| /de/en/terms-of-use | 1440 | 2.23 | 4.83 | 3721 | 12.09 | 2.60 |
| /de/en/terms-and-conditions-lh | 390 | 6.9 | 6.93 | 41446 | 6.93 | 0.03 |
| /de/en/terms-and-conditions-lh | 1440 | 3.67 | 3.57 | 24449 | 3.62 | -0.10 |
| /de/en/terms-of-service-group | 390 | 4.75 | 4.75 | 3981 | 14.94 | 0.00 |
| /de/en/terms-of-service-group | 1440 | 4.54 | 4.54 | 2221 | 13.66 | 0.00 |
| /de/en/tiere-als-handgepaeck | 390 | 4.52 | 6.3 | 5278 | 6.3 | 1.78 |
| /de/en/tiere-als-handgepaeck | 1440 | 4.5 | 7.57 | 4125 | 7.57 | 3.07 |
| /de/en/tiere-als-uebergepaeck | 390 | 9.61 | 10.16 | 8584 | 10.16 | 0.55 |
| /de/en/tiere-als-uebergepaeck | 1440 | 8.07 | 9.5 | 5988 | 9.5 | 1.43 |
| /de/en/timetable-and-flight-status | 390 | 5.71 | 5.71 | 3875 | 5.71 | 0.00 |
| /de/en/timetable-and-flight-status | 1440 | 3.5 | 3.5 | 3090 | 3.5 | 0.00 |
| /de/en/travel-agencies | 390 | 7.21 | 8.71 | 2355 | 8.71 | 1.50 |
| /de/en/travel-agencies | 1440 | 2.68 | 6.62 | 1779 | 6.62 | 3.94 |
| /de/en/tips-senior-travellers | 390 | 12.2 | 12.66 | 20266 | 12.66 | 0.46 |
| /de/en/tips-senior-travellers | 1440 | 6.3 | 10.27 | 13073 | 10.26 | 3.97 |
| /de/en/travel-id-terms-conditions | 390 | 6.62 | 6.62 | 16573 | 6.62 | 0.00 |
| /de/en/travel-id-terms-conditions | 1440 | 3.97 | 3.97 | 9639 | 3.97 | 0.00 |
| /de/en/travel-expense-management | 390 | 3.91 | 8.6 | 3601 | 8.6 | 4.69 |
| /de/en/travel-expense-management | 1440 | 2.04 | 4.32 | 2973 | 4.32 | 2.28 |
| /de/en/travelling-with-animals | 390 | 4.53 | 7.07 | 3830 | 7.07 | 2.54 |
| /de/en/travelling-with-animals | 1440 | 1.61 | 4.13 | 2663 | 4.13 | 2.52 |
| /de/en/travelling-healthy | 390 | 11.75 | 13.48 | 4843 | 13.48 | 1.73 |
| /de/en/travelling-healthy | 1440 | 6.8 | 4.93 | 3825 | 4.93 | -1.87 |
| /de/en/travelling-with-children | 390 | 10.7 | 17.69 | 6197 | 17.69 | 6.99 |
| /de/en/travelling-with-children | 1440 | 5.75 | 12.5 | 5243 | 12.5 | 6.75 |
| /de/en/travelling-with-special-requirements | 390 | 4.61 | 6.8 | 3983 | 6.8 | 2.19 |
| /de/en/travelling-with-special-requirements | 1440 | 0.96 | 6.09 | 2167 | 6.09 | 5.13 |
| /de/en/unaccompanied-minors | 390 | 5.64 | 5.42 | 11639 | 5.42 | -0.22 |
| /de/en/unaccompanied-minors | 1440 | 8.28 | 7.22 | 7335 | 7.22 | -1.06 |
| /de/en/traveltricks | 390 | 11.11 | 21.89 | 4466 | 21.89 | 10.78 |
| /de/en/traveltricks | 1440 | 11.43 | 16.19 | 3739 | 16.19 | 4.76 |
| /de/en/uebergepaeck | 390 | 7.77 | 9.41 | 4854 | 9.41 | 1.64 |
| /de/en/uebergepaeck | 1440 | 4.37 | 5.99 | 3257 | 5.99 | 1.62 |
| /de/en/upgrade-business-class-long-haul | 390 | 5.14 | 5.14 | 3622 | 5.14 | 0.00 |
| /de/en/upgrade-business-class-long-haul | 1440 | 4.95 | 8.79 | 2489 | 8.79 | 3.84 |
| /de/en/upgrade-first-class | 390 | 5.32 | 6.32 | 3755 | 6.32 | 1.00 |
| /de/en/upgrade-first-class | 1440 | 4.76 | 7.84 | 2560 | 7.84 | 3.08 |
| /de/en/unterhaltung-an-bord | 390 | 13.74 | 15.74 | 3521 | 14.8 | 2.00 |
| /de/en/unterhaltung-an-bord | 1440 | 11.15 | 13.68 | 2848 | 10.55 | 2.53 |
| /de/en/upgrade-options | 390 | 8.8 | 8.8 | 4884 | 8.8 | 0.00 |
| /de/en/upgrade-options | 1440 | 4.52 | 11.88 | 3519 | 11.88 | 7.36 |
| /de/en/upgrade-info | 390 | 5.55 | 7.16 | 3285 | 7.16 | 1.61 |
| /de/en/upgrade-info | 1440 | 2.78 | 2.91 | 2260 | 2.91 | 0.13 |
| /de/en/upgrade-to-premium-economy-class | 390 | 10.19 | 13.68 | 3138 | 13.68 | 3.49 |
| /de/en/upgrade-to-premium-economy-class | 1440 | 4.96 | 10.39 | 2369 | 10.39 | 5.43 |
| /de/en/upgrade-premium-economy-class | 390 | 5.47 | 5.47 | 3691 | 5.47 | 0.00 |
| /de/en/upgrade-premium-economy-class | 1440 | 4.67 | 8.5 | 2514 | 8.5 | 3.83 |
| /de/en/upgrade-to-business-class | 390 | 7.52 | 6.98 | 3723 | 6.98 | -0.54 |
| /de/en/upgrade-to-business-class | 1440 | 4.72 | 8.54 | 2518 | 8.54 | 3.82 |
| /de/en/upgrades-at-online-check-in | 390 | 4.36 | 10.15 | 3842 | 10.15 | 5.79 |
| /de/en/upgrades-at-online-check-in | 1440 | 2.76 | 7.93 | 3163 | 7.93 | 5.17 |
| /de/en/wheelchair-batteries | 390 | 6.79 | 6.12 | 4756 | 6.12 | -0.67 |
| /de/en/wheelchair-batteries | 1440 | 4.35 | 3.08 | 3553 | 3.08 | -1.27 |
| /de/en/with-children-at-the-airport | 390 | 17.48 | 19.14 | 4014 | 19.14 | 1.66 |
| /de/en/with-children-at-the-airport | 1440 | 14.18 | 14.15 | 2975 | 14.15 | -0.03 |
| /gb/en/100-years/crane | 390 | 9.46 | 9.46 | 10981 | 9.46 | 0.00 |
| /gb/en/100-years/crane | 1440 | 7.78 | 7.78 | 9782 | 7.78 | 0.00 |
| /gb/en/100-years/destinations | 390 | 8.1 | 8.1 | 21532 | 8.1 | 0.00 |
| /gb/en/100-years/destinations | 1440 | 0.78 | 5.25 | 20241 | 5.25 | 4.47 |
| /gb/en/additional-services | 390 | 6.69 | 6.69 | 8372 | 6.69 | 0.00 |
| /gb/en/additional-services | 1440 | 5.8 | 5.81 | 6766 | 5.81 | 0.01 |
| /gb/en/articles/highlights/all-it-takes-is-a-yes | 390 | 13.59 | 13.59 | 7476 | 13.59 | 0.00 |
| /gb/en/articles/highlights/all-it-takes-is-a-yes | 1440 | 6.64 | 6.64 | 6748 | 6.64 | 0.00 |
| /gb/en/articles/tags/allegris | 390 | 3.94 | 13.09 | 7990 | 13.09 | 9.15 |
| /gb/en/articles/tags/allegris | 1440 | 9.04 | 14.16 | 7529 | 14.17 | 5.12 |
| /gb/en/articles/highlights/allegris-premium-economy-san-diego | 390 | 5.63 | 15.15 | 7337 | 15.15 | 9.52 |
| /gb/en/articles/highlights/allegris-premium-economy-san-diego | 1440 | 3.65 | 14.68 | 6772 | 14.68 | 11.03 |
| /gb/en/discover-lufthansa/new-onboard-experience | 390 | 7.46 | 7.46 | 18227 | 7.46 | 0.00 |
| /gb/en/discover-lufthansa/new-onboard-experience | 1440 | 6.18 | 21.16 | 15178 | 21.16 | 14.98 |
| /gb/en/services-at-the-airport | 390 | 7.46 | 7.46 | 3409 | 7.46 | 0.00 |
| /gb/en/services-at-the-airport | 1440 | 1.4 | 1.4 | 2824 | 1.4 | 0.00 |
| /xx/hk/meetings-and-events | 390 | 32.29 | 32.29 | 3119 | 32.29 | 0.00 |
| /xx/hk/meetings-and-events | 1440 | 9.51 | 9.51 | 3271 | 9.51 | 0.00 |
| /xx/ru/meetings-and-events | 390 | 6.92 | 6.92 | 4370 | 6.92 | 0.00 |
| /xx/ru/meetings-and-events | 1440 | 3.1 | 4.69 | 3662 | 4.69 | 1.59 |
| /xx/pt/meetings-and-events | 390 | 6.04 | 6.04 | 4188 | 6.04 | 0.00 |
| /xx/pt/meetings-and-events | 1440 | 4.14 | 4.15 | 3611 | 4.15 | 0.01 |

## 11. Worse than today by more than 0.5 points after order 57: what is left, per page-width (361)

Worst first, as §7: "first part" the first heading, block or section whose box ends elsewhere switched than today (its bottom in px; h: its height; w: its width); "theme" what the branch's collapse hands to the theme on the document (marker kinds, counts), empty when every marker has a carrier. "www 60" marks the 22 that would pass with M at 60 (plan 923's M-at-60 figures).

| page-width | today | switched | + | height | first part | theme |
| --- | --- | --- | --- | --- | --- | --- |
| /de/en/first-class-terminal 1440 | 6.28 | 32.59 | 26.31 | -174 | head h2 "Your affairs in the best hands": bottom -92 | separator-from-768 3, separator 2 |
| /at/de/discover-lufthansa/new-onboard-experience 1440 | 4.46 | 24.4 | 19.94 | +70 | head h2 "Premium ist eine Haltung": bottom +60 | video 1 |
| /de/de/discover-lufthansa/new-onboard-experience 1440 | 4.46 | 24.35 | 19.89 | +70 | head h2 "Premium ist eine Haltung": bottom +60 | video 1 |
| /de/en/exclusive-charter 390 | 8.68 | 25.06 | 16.38 | +96 | head h2 "This might also be of interest to you": bottom +48 (h -20) |  |
| /gb/en/discover-lufthansa/new-onboard-experience 1440 | 6.18 | 21.16 | 14.98 | +50 | head h2 "Premium is a state of mind": bottom +40 | video 1 |
| /de/en/discover-lufthansa/new-onboard-experience 1440 | 6.19 | 21.13 | 14.94 | +50 | head h2 "Premium is a state of mind": bottom +40 | video 1 |
| /de/en/100-years 390 | 19.68 | 32.69 | 13.01 | -81 | head h2 "Under the symbol of the crane": bottom -81 | text-width 1, indent 1 |
| /de/de/articles/highlights/allegris-premium-economy-san-diego 1440 | 3.53 | 16.13 | 12.60 | +64 | head h2 "Zum Download des Posters einfach auf das": bottom +88 (h +39), w -210 | video 1 |
| /de/en/advance-seat-reservations-terms-and-conditions 1440 | 2.17 | 14.59 | 12.42 | +118 | block columns-media: bottom +98 (h +98) | text-size 4 |
| /de/en/entryprocesses 1440 | 2.62 | 14.8 | 12.18 | +115 | head h2 "United Kingdom": bottom +75 (h +75) | heading-aligned 1, column 1 |
| /de/en/exclusive-charter 1440 | 4.86 | 16.8 | 11.94 | +96 | head h2 "This might also be of interest to you": bottom +48 (h -40) |  |
| /de/en/first-class-terminal 390 (www 60) | 16.22 | 27.94 | 11.72 | -133 | head h2 "Your affairs in the best hands": bottom -41 | separator-from-768 3, separator 2 |
| /de/en/discover-lufthansa/take-off 390 | 4.75 | 16.4 | 11.65 | -16 | head h2 "Ready to hand – 8 kg carry-on baggage": bottom -16 | separator 1 |
| /de/en/book-and-manage/additional-services/get-your-guide 1440 | 1.01 | 12.36 | 11.35 | +137 | head h2 "How to earn miles with GetYourGuide": bottom +62 | text-width 2 |
| /de/en/lufthansa-business-class-on-long-haul-routes 1440 | 6.46 | 17.6 | 11.14 | +48 | head h2 "Benefits of Business Class": bottom +48 (h -32) |  |
| /de/en/discover-lufthansa/take-off 1440 | 1.76 | 12.83 | 11.07 | -16 | head h2 "Ready to hand – 8 kg carry-on baggage": bottom -16 | separator 1 |
| /gb/en/articles/highlights/allegris-premium-economy-san-diego 1440 | 3.65 | 14.68 | 11.03 | +25 | head h2 "To download the poster, simply click on ": bottom +49, w -210 | video 1 |
| /at/de/articles/highlights/allegris-premium-economy-san-diego 1440 | 4.9 | 15.92 | 11.02 | +64 | head h2 "Zum Download des Posters einfach auf das": bottom +88 (h +39), w -210 | video 1 |
| /de/en/farealert/best-price-alert 1440 | 3.6 | 14.39 | 10.79 | -134 | head h2 "Activate price tracking": bottom -43 | heading-aligned 4 |
| /de/en/traveltricks 390 | 11.11 | 21.89 | 10.78 | -62 | head h2 "Step 1: Download the Lufthansa app": bottom -38 (h -38) | heading-aligned 3 |
| /de/en/doctor-on-board-news 1440 | 7.31 | 17.63 | 10.32 | -94 | head h2 "This may also interest you": bottom -64 | column 2 |
| /de/en/farealert/best-price-alert 390 | 7.91 | 18.09 | 10.18 | -141 | head h2 "Activate price tracking": bottom -26 | heading-aligned 4 |
| /de/en/childrens-menus-on-board 1440 | 0.91 | 11 | 10.09 | +105 | head h2 "Baby food": bottom +48 (h -32) | text-width 2, heading-aligned 1 |
| /de/en/check-in-with-the-family 390 | 2.95 | 12.72 | 9.77 | -16 | head h2 "Simply check in from home or en route": bottom -16 (h -32) |  |
| /de/en/advance-seat-reservation 390 | 12.01 | 21.71 | 9.70 | +204 | head h2 "How do I reserve a seat?": bottom -16 (h -32) | text-size 18, separator-in-block 17, heading 2, text-width 1 |
| /de/en/advance-seat-reservations-terms-and-conditions 390 | 5.53 | 15.22 | 9.69 | +125 | block columns-media: bottom +105 (h +105) | text-size 4 |
| /gb/en/articles/highlights/allegris-premium-economy-san-diego 390 | 5.63 | 15.15 | 9.52 | +50 | head h2 "To download the poster, simply click on ": bottom +50 | video 1 |
| /de/en/lufthansa-business-class-on-long-haul-routes 390 | 13.33 | 22.68 | 9.35 | +48 | head h2 "Benefits of Business Class": bottom +48 (h -32) |  |
| /de/en/lufthansa-first-class-fleet 390 | 4.2 | 13.47 | 9.27 | -26 | head h2 "Lufthansa Allegris First Class on the A3": bottom -16 (h -20) |  |
| /de/en/first-class 1440 | 8.83 | 18.01 | 9.18 | -272 | head h2 "First Class Lounge": bottom +20 | separator-below-768 11, heading-aligned 2, video 1 |
| /gb/en/articles/tags/allegris 390 | 3.94 | 13.09 | 9.15 | +97 | head h1 "All Articles on Lufthansa Allegris": bottom +50 | video 1, text-size 0 |
| /de/de/articles/highlights/allegris-premium-economy-san-diego 390 | 4.82 | 13.93 | 9.11 | +50 | head h2 "Zum Download des Posters einfach auf das": bottom +50 | video 1 |
| /de/en/articles/highlights/allegris-premium-economy-san-diego 390 | 6.72 | 15.78 | 9.06 | +50 | head h2 "To download the poster, simply click on ": bottom +50 | video 1 |
| /de/en/entryprocesses 390 | 5.51 | 14.54 | 9.03 | +58 | head h2 "United Kingdom": bottom +16 (h +16) | heading-aligned 1, column 1 |
| /de/en/100-years/cabin-design 1440 | 5.88 | 14.86 | 8.98 | +135 | head h2 "Sublime salons – the beginnings of comfo": bottom +20 |  |
| /de/en/cancellations-and-refunds 1440 | 3.54 | 12.42 | 8.88 | -29 | head h2 "Options for your refund": bottom -16 (h -32) |  |
| /de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/special-needs-online-form/confirmation 1440 | 2.37 | 11.2 | 8.83 | -45 | section section: bottom -45 (h -45) | separator 1 |
| /de/en/childrens-menus-on-board 390 | 6.09 | 14.88 | 8.79 | +113 | head h2 "Baby food": bottom +48 (h -32) | text-width 2, heading-aligned 1 |
| /de/en/articles/highlights/allegris-premium-economy-san-diego 1440 | 8.12 | 16.89 | 8.77 | +25 | head h2 "To download the poster, simply click on ": bottom +49, w -210 | video 1 |
| /de/en/special-meals 1440 | 8.35 | 17.12 | 8.77 | +221 | head h2 "Dietary meals": bottom +87 (h -32) | column 2 |
| /at/de/articles/highlights/allegris-premium-economy-san-diego 390 | 5.55 | 14.3 | 8.75 | +50 | head h2 "Zum Download des Posters einfach auf das": bottom +50 | video 1 |
| /de/en/book-and-manage/additional-services/travel-insurances 1440 | 10.23 | 18.66 | 8.43 | +107 | head h2 "Travel Guard* - Travel Care": bottom +8 | text-width 4, heading 1, text-size 1 |
| /de/en/faq-data-security 1440 | 0.97 | 9.2 | 8.23 | +48 | section section.breadcrumb-container.accordion-columns-container: bottom -413 (h -413) |  |
| /de/en/faq-password-security 1440 | 0.9 | 9.09 | 8.19 | +48 | section section.breadcrumb-container.accordion-columns-container: bottom -298 (h -298) |  |
| /de/en/320 390 | 5.75 | 13.7 | 7.95 | -37 | head h2 "Trusted, modern, comfortable": bottom -37 |  |
| /de/en/secure-flight 1440 | 1.54 | 9.42 | 7.88 | +48 | section section.breadcrumb-container: bottom -336 (h -336) |  |
| /de/en/articles/explore-the-world/a-perfect-day-barcelona-in-one-day 1440 | 3.07 | 10.75 | 7.68 | -12 | head h2 "This may also be of interest to you": bottom +27 | separator 7, heading 1, separator-from-768 1 |
| /de/en/check-in-with-the-family 1440 | 1.74 | 9.11 | 7.37 | -16 | head h2 "Simply check in from home or en route": bottom -16 (h -32) |  |
| /de/en/upgrade-options 1440 | 4.52 | 11.88 | 7.36 | -16 | head h2 "One journey – and lots of options for fl": bottom -39 (h -71), w +430 | heading 1, text-width 1 |
| /de/en/support/contact/passenger-duty-united-kingdom 390 | 6.22 | 13.49 | 7.27 | +61 | head h1 "Exemptions and refund": bottom +49 (h +49) | heading-aligned 1 |
| /de/en/lufthansa-corporate-customers 1440 | 2.61 | 9.7 | 7.09 | +32 | head h2 "Lufthansa provides corporate and busines": bottom -16 (h -40), w +430 | heading 1 |
| /de/en/travelling-with-children 390 | 10.7 | 17.69 | 6.99 | -56 | head h2 "Planning your trip": bottom -16 (h -32) | heading 1 |
| /de/en/prepare-for-your-trip/baggage/sport-baggage/register-sports-baggage/confirmation 1440 | 2.08 | 8.9 | 6.82 | -54 | section section.breadcrumb-container: bottom -280 (h -280) |  |
| /de/en/articles/tags 1440 | 1.2 | 7.97 | 6.77 | -25 | head h2 "Explore more": bottom -24 | heading 2 |
| /de/en/travelling-with-children 1440 | 5.75 | 12.5 | 6.75 | -56 | head h2 "Planning your trip": bottom -16 (h -32), w +430 | heading 1 |
| /de/en/support/contact/contact-form-confirmation 1440 | 0.98 | 7.66 | 6.68 | -30 | section section: bottom -30 (h -30) |  |
| /de/en/articles/explore-the-world/eat-see-do-berlin 390 | 8.46 | 15.04 | 6.58 | +28 | block columns-media: bottom +28 |  |
| /de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/special-needs-online-form/confirmation 390 | 5.32 | 11.87 | 6.55 | -45 | section section: bottom -45 (h -45) | separator 1 |
| /de/en/special-meals 390 | 11.3 | 17.78 | 6.48 | -70 | head h2 "Dietary meals": bottom -10 (h -32) | column 2 |
| /de/en/articles/explore-the-world/a-perfect-day-berlin-in-one-day 1440 | 2.69 | 9.07 | 6.38 | -11 | head h2 "Our recommendations": bottom +25 | separator 7, separator-from-768 1 |
| /de/en/meetings-and-events-organisers 1440 | 2.19 | 8.41 | 6.22 | +112 | section section.breadcrumb-container: bottom -1323 (h -1323) | column 1, text-size 0 |
| /de/en/32n 390 | 7.39 | 13.59 | 6.20 | -76 | head h2 "The quietest cabin in its class": bottom -13 | column 1 |
| /de/en/sepa-terms-and-conditions 1440 | 1.01 | 7.2 | 6.19 | +48 | section section.breadcrumb-container: bottom -883 (h -883) |  |
| /at/de/articles/tags/allegris 390 | 5.96 | 12.12 | 6.16 | +75 | head h2 "Alle Artikel zu Lufthansa Allegris": bottom +32 (h -18) | video 1, heading-aligned 1, text-size 0 |
| /de/de/articles/tags/allegris 390 | 5.96 | 12.12 | 6.16 | +75 | head h2 "Alle Artikel zu Lufthansa Allegris": bottom +32 (h -18) | video 1, heading-aligned 1, text-size 0 |
| /de/en/cancellations-and-refunds 390 | 7.68 | 13.84 | 6.16 | +11 | head h2 "Options for your refund": bottom -16 (h -32) |  |
| /de/en/articles/tags/allegris 390 | 3.88 | 10.03 | 6.15 | +47 | head h1 "All Articles on Lufthansa Allegris": bottom +50 | video 1, text-size 0 |
| /de/en/menus-on-long-haul-flights 1440 | 1.88 | 8 | 6.12 | -25 | block columns-media: bottom +15 | column 2 |
| /de/en/my-logbook 1440 | 4.58 | 10.67 | 6.09 | +32 | head h2 "Welcome on board!": bottom -16 (h -32) |  |
| /de/en/book-and-manage/additional-services/travel-insurances 390 | 11 | 16.99 | 5.99 | +77 | head h2 "Travel Guard* - Travel Care": bottom +8 | text-width 4, heading 1, text-size 1 |
| /de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/travel-companion 390 | 8.38 | 14.26 | 5.88 | -27 | head h2 "Further information on travel and health": bottom -75 (h -32) | heading-aligned 1 |
| /de/en/book-and-manage/passenger-receipt-90days/confirmation 1440 | 1.79 | 7.65 | 5.86 | -30 | section section: bottom -30 (h -30) |  |
| /de/en/onboard-delights 1440 | 4.84 | 10.69 | 5.85 | +82 | head h2 "Pre-order now": bottom +8 | text-width 3, column 1, separator 1 |
| /de/en/upgrades-at-online-check-in 390 | 4.36 | 10.15 | 5.79 | -78 | head h2 "Upgrade benefits": bottom -16 (h -32) |  |
| /de/en/during-your-trip/food-and-beverages/onboard-delights/faq 1440 | 1.08 | 6.71 | 5.63 | +48 | section section.breadcrumb-container.accordion-columns-container: bottom -1025 (h -1025) |  |
| /de/en/flight-disruptions 390 | 8.94 | 14.57 | 5.63 | +67 | head h2 "Rapid help in the event of delay or canc": bottom +7 | video 2, heading-aligned 1, column 1 |
| /de/en/book-and-manage/passenger-receipt-90days/confirmation 390 | 4.17 | 9.75 | 5.58 | -30 | section section: bottom -30 (h -30) |  |
| /de/en/first-class-personal-assistant 1440 | 0.96 | 6.54 | 5.58 | +48 | section section.breadcrumb-container: bottom -908 (h -908) |  |
| /de/en/faq-data-security 390 | 3.32 | 8.87 | 5.55 | +48 | section section.breadcrumb-container.accordion-columns-container: bottom -469 (h -469) |  |
| /de/en/business-terms-and-conditions 1440 | 2.32 | 7.77 | 5.45 | +48 | section section.breadcrumb-container: bottom -878 (h -878) |  |
| /de/en/faq-password-security 390 | 3.82 | 9.25 | 5.43 | +48 | section section.breadcrumb-container.accordion-columns-container: bottom -314 (h -314) |  |
| /de/en/upgrade-to-premium-economy-class 1440 | 4.96 | 10.39 | 5.43 | +68 | head h2 "How to book your upgrade": bottom +19 | separator 1 |
| /de/en/general-conditions-currency-conversion 1440 | 0.94 | 6.34 | 5.40 | +48 | section section.breadcrumb-container: bottom -366 (h -366) |  |
| /de/en/prepare-for-your-trip/baggage/travelling-with-animals/register-animal-cargo-hold/confirmation 1440 | 1.59 | 6.94 | 5.35 | -30 | section section: bottom -30 (h -30) |  |
| /de/en/prepare-for-your-trip/baggage/travelling-with-animals/register-animal/confirmation 1440 | 1.59 | 6.94 | 5.35 | -30 | section section: bottom -30 (h -30) |  |
| /de/en/prepare-for-your-trip/baggage/sport-baggage/register-sporting-firearm/confirmation 1440 | 1.63 | 6.97 | 5.34 | -30 | section section: bottom -30 (h -30) |  |
| /de/en/book-and-manage/stopover 390 | 14 | 19.3 | 5.30 | -134 | head h2 "Exclusive offers for stopover passengers": bottom -69 (h -57) | heading-aligned 2, heading 1, text-width 1, separator-in-block 1 |
| /de/en/upgrades-at-online-check-in 1440 | 2.76 | 7.93 | 5.17 | -94 | head h2 "Upgrade benefits": bottom -16 (h -32) |  |
| /de/en/shopping 1440 | 4.07 | 9.22 | 5.15 | -63 | head h2 "You decide: your selection, your locatio": bottom -43 | separator-from-768 1, separator-below-768 1 |
| /de/en/lufthansa-first-class-entertainment 390 | 4.22 | 9.35 | 5.13 | +23 | head h2 "When your flight time turns into great e": bottom -16 (h -20) | text-size 1 |
| /de/en/support/contact/contact-form-confirmation 390 | 4.11 | 9.24 | 5.13 | -30 | section section: bottom -30 (h -30) |  |
| /de/en/travelling-with-special-requirements 1440 | 0.96 | 6.09 | 5.13 | +48 | section section.breadcrumb-container.columns-media-container: bottom -1129 (h -1129) |  |
| /de/en/book-and-manage/digital-self-services/airline-apps 1440 | 2.22 | 7.34 | 5.12 | +48 | section section.breadcrumb-container.columns-media-container: bottom -547 (h -547) |  |
| /gb/en/articles/tags/allegris 1440 | 9.04 | 14.16 | 5.12 | +117 | head h1 "All Articles on Lufthansa Allegris": bottom +50 | video 1, text-size 0 |
| /de/en/online-check-in-info 1440 | 3.34 | 8.39 | 5.05 | +94 | head h2 "Check in conveniently online now": bottom -16 (h -40) | text-width 2 |
| /de/en/hotel-offers 1440 | 5.45 | 10.45 | 5.00 | +54 | head h2 "Be inspired": bottom +6 (h -32) | separator-in-block 1 |
| /de/en/book-and-manage/additional-services/get-your-guide 390 | 3.87 | 8.86 | 4.99 | +56 | head h2 "How to earn miles with GetYourGuide": bottom +8 | text-width 2 |
| /de/en/prepare-for-your-trip/baggage/baggage-irregularities/faq-damaged-baggage 1440 | 1.15 | 6.11 | 4.96 | +48 | section section.breadcrumb-container.accordion-columns-container: bottom -1327 (h -1327) |  |
| /de/en/datenschutz 390 | 7.83 | 12.73 | 4.90 | +48 | section section.breadcrumb-container: bottom -580 (h -580) |  |
| /de/en/baggage-irregularities 1440 | 8.98 | 13.85 | 4.87 | -77 | head h2 "Procedure for delayed baggage": bottom -25 | video 2, separator-in-block 2 |
| /de/en/data-collection-canada 1440 | 8.17 | 12.96 | 4.79 | -57 | head h2 "Requirements for entry or transit in Can": bottom -16 (h -40) | separator-in-block 1 |
| /de/en/discover-lufthansa/carbon-offsetting/saf 1440 | 3.31 | 8.08 | 4.77 | +88 | head h2 "Why does SAF reduce CO₂ emissions by at ": bottom +8 | text-size 0 |
| /de/en/seat-maps 390 | 7.39 | 12.16 | 4.77 | -66 | head h2 "Boeing": bottom -53 |  |
| /de/en/traveltricks 1440 | 11.43 | 16.19 | 4.76 | -14 | head h2 "Step 1: Download the Lufthansa app": bottom -33 (h -53) | heading-aligned 3 |
| /de/en/travel-expense-management 390 | 3.91 | 8.6 | 4.69 | +32 | head h2 "The benefits of the Lufthansa Travel & E": bottom -16 (h -20) |  |
| /de/en/passenger-receipt-90 1440 | 2.32 | 6.97 | 4.65 | +96 | head h2 "Personal information": bottom -24 |  |
| /de/en/prepare-for-your-trip/baggage/sport-baggage/register-sporting-firearm/confirmation 390 | 4.12 | 8.77 | 4.65 | -30 | section section: bottom -30 (h -30) |  |
| /de/en/prepare-for-your-trip/baggage/travelling-with-animals/register-animal-cargo-hold/confirmation 390 | 4.02 | 8.66 | 4.64 | -30 | section section: bottom -30 (h -30) |  |
| /de/en/prepare-for-your-trip/baggage/travelling-with-animals/register-animal/confirmation 390 | 4.02 | 8.66 | 4.64 | -30 | section section: bottom -30 (h -30) |  |
| /de/en/articles/explore-the-world/eat-see-do-algiers 390 | 9.38 | 14.01 | 4.63 | +28 | block columns-media: bottom +28 |  |
| /at/de/100-years/destinations 1440 | 0.71 | 5.33 | 4.62 | +8 | head h2 "Rio de Janeiro: Feiern wie die Weltmeist": bottom +8 | video 1 |
| /de/de/100-years/destinations 1440 | 0.71 | 5.33 | 4.62 | +8 | head h2 "Rio de Janeiro: Feiern wie die Weltmeist": bottom +8 | video 1 |
| /de/en/sepa-terms-and-conditions-b 1440 | 2.86 | 7.41 | 4.55 | +48 | head h2 "Authorisation for direct debiting in two": bottom 0 (h -40), w +430 | heading 1 |
| /de/en/359 390 | 6.09 | 10.61 | 4.52 | -82 | head h2 "Seat map of the Airbus A350-900": bottom -8 (h -20) | column 2 |
| /de/en/articles/explore-the-world/a-perfect-day-berlin-in-one-day 390 | 10.01 | 14.53 | 4.52 | +44 | block columns-media: bottom +52 | separator 7, separator-from-768 1 |
| /de/en/100-years/destinations 1440 | 0.78 | 5.25 | 4.47 | +8 | head h2 "Rio de Janeiro: Party like World Cup win": bottom +8 | video 1 |
| /gb/en/100-years/destinations 1440 | 0.78 | 5.25 | 4.47 | +8 | head h2 "Rio de Janeiro: Party like World Cup win": bottom +8 | video 1 |
| /de/en/first-class-valet-parking-service 1440 | 2.15 | 6.53 | 4.38 | +32 | head h2 "For your rental or private car: valet pa": bottom -16 (h -40) | text-width 1 |
| /de/en/100-years/cabin-design 390 | 13.28 | 17.61 | 4.33 | +135 | head h2 "Sublime salons – the beginnings of comfo": bottom +20 |  |
| /de/en/dangerous-dogs 1440 | 3 | 7.31 | 4.31 | +48 | section section.breadcrumb-container.accordion-columns-container: bottom -1377 (h -1377) |  |
| /de/en/fliegen-mit-baby 390 | 3.3 | 7.59 | 4.29 | -16 | head h2 "Important information about preparing fo": bottom -16 (h -20) |  |
| /de/en/menus-travel-classes 1440 | 1.58 | 5.87 | 4.29 | +48 | section section.breadcrumb-container.columns-media-container: bottom -1174 (h -1174) |  |
| /de/en/schengen 390 | 6.8 | 10.94 | 4.14 | -80 | head h2 "Entry into the “Schengen Area” in Europe": bottom -32 (h -32) | column 2 |
| /de/en/common/imprint/lufthansa-insights-imprint 1440 | 1.75 | 5.85 | 4.10 | -51 | head h2 "Publishing support, design and productio": bottom -51 | separator-in-block 2 |
| /de/en/prepare-for-your-trip/baggage/baggage-irregularities/faq-baggage-delay 390 | 8.15 | 12.25 | 4.10 | +59 | head h2 "Delayed baggage": bottom +7 (h -25) | heading 3, heading-aligned 1 |
| /de/en/common/imprint/lufthansa-insights-imprint 390 | 4.54 | 8.58 | 4.04 | -102 | head h2 "Registered office": bottom -51 | separator-in-block 2 |
| /de/en/advance-seat-reservation 1440 | 7.71 | 11.72 | 4.01 | +18 | head h2 "How do I reserve a seat?": bottom -16 (h -32) | text-size 18, separator-in-block 17, heading 2, text-width 1 |
| /de/en/book-and-manage/flights/ana 390 | 8.35 | 12.35 | 4.00 | -58 | head h2 "What you need to remember": bottom -58 (h -58) |  |
| /de/en/lufthansa-aviation-group 1440 | 5.38 | 9.37 | 3.99 | +48 | section section.breadcrumb-container.columns-media-container: bottom -1761 (h -1761) |  |
| /at/de/miles-and-more 390 | 5.03 | 9.01 | 3.98 | -51 | block carousel-cards: bottom -51 |  |
| /de/de/miles-and-more 390 | 5.04 | 9.01 | 3.97 | -51 | block carousel-cards: bottom -51 |  |
| /de/en/articles/explore-flying/anniversary-super-crane-special 1440 (www 60) | 7.67 | 11.64 | 3.97 | -39 | head h2 "An Iconic Design to Celebrate Lufthansa’": bottom -39 | separator 5, separator-from-768 1, separator-below-768 1 |
| /de/en/tips-senior-travellers 1440 | 6.3 | 10.27 | 3.97 | -93 | head h2 "At the airport": bottom -20 | heading-aligned 3, separator 1, separator-from-768 1 |
| /de/en/menus-on-long-haul-flights 390 | 3.46 | 7.41 | 3.95 | -20 | head h2 "The menu on your Lufthansa flight": bottom -20 (h -20) | column 2 |
| /de/en/travel-agencies 1440 | 2.68 | 6.62 | 3.94 | +48 | section section.breadcrumb-container.columns-media-container: bottom -819 (h -819) |  |
| /de/en/first-class-personal-assistant 390 | 2.39 | 6.31 | 3.92 | +24 | head h2 "First Class": bottom +24 |  |
| /de/en/upgrade-business-class-long-haul 1440 | 4.95 | 8.79 | 3.84 | +48 | head h2 "Further information about your upgrade": bottom +48, w -326 | text-width 1 |
| /de/en/upgrade-premium-economy-class 1440 | 4.67 | 8.5 | 3.83 | +48 | head h2 "Further information about your upgrade": bottom +48, w -326 | text-width 1 |
| /de/en/upgrade-to-business-class 1440 | 4.72 | 8.54 | 3.82 | +48 | section section.breadcrumb-container.accordion-columns-container: bottom -842 (h -842) | heading-no-choice 1, text-width 1 |
| /de/en/feedback 1440 | 2.47 | 6.27 | 3.80 | +55 | head h2 "Baggage irregularities: reimbursement of": bottom +34 | text-width 2 |
| /de/en/32n 1440 | 2.37 | 6.14 | 3.77 | -26 | head h2 "Seat maps Airbus A320neo": bottom +6 (h -32) | column 1 |
| /de/en/mobility-partner-program-healthcare 1440 | 7.85 | 11.62 | 3.77 | -40 | head h2 "Health & Medical Agreement": bottom -16 (h -32) | column 1 |
| /de/en/business-class-on-short-and-medium-haul 1440 | 2.69 | 6.44 | 3.75 | +48 | section section.breadcrumb-container.columns-media-container: bottom -1835 (h -1835) |  |
| /de/en/meetings-and-events-organisers 390 | 6.29 | 10.03 | 3.74 | +88 | head h2 "Lufthansa Group Meetings & Events": bottom +88 | column 1, text-size 0 |
| /de/de/flughafeninformation 1440 | 3.06 | 6.72 | 3.66 | -51 | section grey.section: bottom -21 (h -21) | separator 1 |
| /at/de/flughafeninformation 1440 | 3.07 | 6.72 | 3.65 | -51 | section grey.section: bottom -21 (h -21) | separator 1 |
| /de/en/discover-lufthansa/carbon-offsetting/saf 390 | 6.59 | 10.18 | 3.59 | +88 | head h2 "Why does SAF reduce CO₂ emissions by at ": bottom +8 | text-size 0 |
| /de/en/lufthansa-express 1440 | 6.29 | 9.88 | 3.59 | +104 | head h2 "Lufthansa Express – your ticket to the w": bottom -16 (h -32) |  |
| /de/en/articles/explore-the-world/essentials-barcelona-facts 390 | 7.37 | 10.95 | 3.58 | +28 | block columns-media: bottom +28 | separator 1 |
| /de/en/book-and-manage/stopover 1440 | 11.82 | 15.36 | 3.54 | -35 | head h2 "Turn your Stopover into an adventure": bottom +10 | heading-aligned 2, heading 1, text-width 1, separator-in-block 1 |
| /de/en/imprint 1440 | 3.57 | 7.1 | 3.53 | +32 | head h2 "Management Board": bottom +32 | text-size 3 |
| /de/en/during-your-trip/food-and-beverages/onboard-delights/faq 390 | 2.62 | 6.14 | 3.52 | +48 | section section.breadcrumb-container.accordion-columns-container: bottom -1372 (h -1372) |  |
| /de/en/articles/tags 390 | 2.85 | 6.36 | 3.51 | -4 | head h2 "Explore more": bottom -4 | heading 2 |
| /de/en/seat-maps 1440 | 3.59 | 7.1 | 3.51 | -43 | head h2 "Boeing": bottom -34 |  |
| /de/en/upgrade-to-premium-economy-class 390 | 10.19 | 13.68 | 3.49 | +23 | head h2 "How to book your upgrade": bottom -25 | separator 1 |
| /de/en/mobility-partner-program-healthcare 390 | 6.53 | 9.97 | 3.44 | -60 | head h2 "Health & Medical Agreement": bottom -16 (h -32) | column 1 |
| /de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/travel-companion 1440 | 5.84 | 9.22 | 3.38 | -37 | head h2 "Further information on travel and health": bottom -84 (h -32) | heading-aligned 1 |
| /de/en/first-class-comfort 1440 | 4.84 | 8.18 | 3.34 | +48 | section section.breadcrumb-container: bottom -1230 (h -1230) | text-width 1 |
| /de/en/carry-on-baggage 1440 (www 60) | 7.32 | 10.62 | 3.30 | -47 | head h2 "Other items of baggage allowed in the ca": bottom -30 | text-width 3, video 1, separator-from-768 1 |
| /de/en/prepare-for-your-trip/baggage/baggage-irregularities/faq-damaged-baggage 390 | 3.02 | 6.31 | 3.29 | +48 | section section.breadcrumb-container.accordion-columns-container: bottom -1557 (h -1557) |  |
| /de/en/lufthansa-at-duesseldorf-airport 390 | 3.27 | 6.55 | 3.28 | +8 | head h2 "The Lufthansa terminal at Dusseldorf Air": bottom -16 (h -20) | text-width 2 |
| /de/en/airport-information 1440 | 3.83 | 7.09 | 3.26 | -50 | section grey.section: bottom -20 (h -20) | separator 1 |
| /de/en/baggage-irregularities 390 | 8.15 | 11.41 | 3.26 | -77 | head h2 "Procedure for delayed baggage": bottom -25 | video 2, separator-in-block 2 |
| /gb/en/airport-information 1440 | 3.84 | 7.09 | 3.25 | -50 | section grey.section: bottom -20 (h -20) | separator 1 |
| /de/en/addresses-worldwide 1440 (www 60) | 3.29 | 6.54 | 3.25 | -20 | section section.breadcrumb-container.accordion-columns-container: bottom -20 (h -20) |  |
| /de/en/articles/explore-the-world/eat-see-do-berlin 1440 | 4.87 | 8.11 | 3.24 | -13 | block columns-media: bottom -13 |  |
| /de/en/lufthansa-at-duesseldorf-airport 1440 | 1.76 | 4.97 | 3.21 | +32 | head h2 "The Lufthansa terminal at Dusseldorf Air": bottom -16 (h -40) | text-width 2 |
| /de/en/prepare-for-your-trip/baggage/sport-baggage/register-sports-baggage/confirmation 390 | 5.06 | 8.27 | 3.21 | -30 | section section.breadcrumb-container: bottom -267 (h -267) |  |
| /de/en/sepa-terms-and-conditions 390 | 3.75 | 6.93 | 3.18 | +48 | section section.breadcrumb-container: bottom -1390 (h -1390) |  |
| /de/en/my-bookings 1440 | 1.2 | 4.37 | 3.17 | -48 | block cards-teaser: bottom -17 (h -17) | heading 5 |
| /de/en/rail-and-fly 1440 | 5.2 | 8.32 | 3.12 | +95 | head h2 "Book Rail&Fly directly with your flight": bottom -32 (h -32) | column 1 |
| /de/en/doctor-on-board-news 390 | 9.61 | 12.72 | 3.11 | -54 | head h2 "This may also interest you": bottom -24 | column 2 |
| /de/en/upgrade-first-class 1440 | 4.76 | 7.84 | 3.08 | +39 | section section.breadcrumb-container.accordion-columns-container: bottom -842 (h -842) | text-width 1 |
| /de/en/tiere-als-handgepaeck 1440 | 4.5 | 7.57 | 3.07 | -70 | head h2 "Checklist": bottom -40 (h -32) | text-width 2 |
| /de/en/children-on-board 1440 | 4.53 | 7.56 | 3.03 | -27 | head h2 "Flying with baby": bottom -27 | text-width 1 |
| /de/en/general-conditions-currency-conversion 390 | 2.52 | 5.53 | 3.01 | +48 | section section.breadcrumb-container: bottom -409 (h -409) |  |
| /de/en/articles/explore-flying/7-people-who-shaped-lufthansa-history 390 | 3.35 | 6.33 | 2.98 | +2 | no box moved (pictures, text, colour) | separator 1 |
| /de/en/secure-flight 390 | 3.51 | 6.49 | 2.98 | +24 | head h2 "Entry regulations": bottom +24 |  |
| /de/en/lufthansa-express 390 | 8.56 | 11.52 | 2.96 | +104 | head h2 "Lufthansa Express – your ticket to the w": bottom -16 (h -32) |  |
| /de/en/passengers-with-sensory-impairment 1440 | 3.28 | 6.23 | 2.95 | -72 | head h2 "cabinblu – Fly Above It All": bottom -29 | heading-aligned 1 |
| /de/en/imprint 390 | 7.07 | 10.01 | 2.94 | +65 | head h2 "Registration": bottom +65 | text-size 3 |
| /de/en/onboard-delights 390 | 10.99 | 13.91 | 2.92 | +82 | head h2 "Pre-order now": bottom +8 | text-width 3, column 1, separator 1 |
| /de/en/arrival-services 390 | 6.74 | 9.58 | 2.84 | 0 | head h2 "From the aircraft straight to the termin": bottom -16 (h -32) | text-size 0 |
| /de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/hearing-impairment 390 | 4.94 | 7.78 | 2.84 | -17 | block columns-media: bottom +7 |  |
| /de/en/first-class 390 | 16.73 | 19.52 | 2.79 | -324 | head h2 "The First Class Terminal": bottom -59 | separator-below-768 11, heading-aligned 2, video 1 |
| /de/en/schengen 1440 | 4.63 | 7.41 | 2.78 | -80 | head h2 "Entry into the “Schengen Area” in Europe": bottom -32 (h -32) | column 2 |
| /de/en/articles/explore-the-world/a-perfect-day-barcelona-in-one-day 390 | 11.35 | 14.11 | 2.76 | +42 | block columns-media: bottom +49 | separator 7, heading 1, separator-from-768 1 |
| /de/en/flight-disruptions 1440 | 3.5 | 6.16 | 2.66 | +25 | head h2 "Rapid help in the event of delay or canc": bottom +7 | video 2, heading-aligned 1, column 1 |
| /de/en/support/feedback-and-contact-airlines 1440 | 3.53 | 6.19 | 2.66 | -18 | block columns-media: bottom -18 (h -18) |  |
| /de/en/prepare-for-your-trip/travel-classes/economy-basic 1440 | 3.23 | 5.86 | 2.63 | -20 | head h2 "Baggage in Economy Basic Fare": bottom -20 | heading-aligned 1 |
| /de/en/payment-options-at-the-airport 1440 | 0.94 | 3.56 | 2.62 | +28 | section section.breadcrumb-container.columns-media-container: bottom -1092 (h -1092) | text-width 3 |
| /de/en/support/feedback-and-contact-airlines 390 | 7.41 | 10.03 | 2.62 | -46 | block columns-media: bottom -47 (h -47) |  |
| /de/en/359 1440 | 2.51 | 5.11 | 2.60 | -33 | head h2 "Seat map of the Airbus A350-900": bottom -8 (h -40) | column 2 |
| /de/en/business-terms-and-conditions 390 | 4.68 | 7.28 | 2.60 | +48 | section section.breadcrumb-container: bottom -1775 (h -1775) |  |
| /de/en/terms-of-use 1440 | 2.23 | 4.83 | 2.60 | +53 | head h2 "8. Storage of IP addresses": bottom +5 |  |
| /de/en/book-and-manage/cancellation-and-refund/refund/refund-form 390 | 7.31 | 9.88 | 2.57 | +69 | head h2 "General information": bottom +84 | text-size 1 |
| /de/en/travelling-with-animals 390 | 4.53 | 7.07 | 2.54 | -16 | head h2 "A good trip for your precious pet": bottom -16 (h -32) | column 1 |
| /de/en/menus-travel-classes 390 | 3.97 | 6.5 | 2.53 | +48 | section section.breadcrumb-container.columns-media-container: bottom -1767 (h -1767) |  |
| /de/en/unterhaltung-an-bord 1440 (www 60) | 11.15 | 13.68 | 2.53 | -40 | block columns-media: bottom -40 | heading 1, text-size 1 |
| /de/en/discover-lufthansa/lufthansa-fleet/351 1440 | 4.88 | 7.4 | 2.52 | +27 | head h2 "Around the world with Allegris": bottom +27 | text-width 1 |
| /de/en/travelling-with-animals 1440 | 1.61 | 4.13 | 2.52 | +8 | head h2 "A good trip for your precious pet": bottom -16 (h -32) | column 1 |
| /de/en/my-bookings 390 (www 60) | 8.21 | 10.72 | 2.51 | -63 | block cards-teaser: bottom -31 (h -31) | heading 5 |
| /de/en/articles/explore-the-world/what-i-learned-living-in-barcelona 390 | 11.67 | 14.17 | 2.50 | +20 | block columns-media: bottom +28 | separator 4, separator-from-768 1 |
| /de/en/online-check-in-info 390 | 5.54 | 8.04 | 2.50 | +40 | head h2 "Check in conveniently online now": bottom -16 (h -20) | text-width 2 |
| /de/en/articles/explore-the-world/know-before-you-go-algiers 1440 | 4.28 | 6.76 | 2.48 | -25 | block columns-media: bottom -25 |  |
| /de/en/articles/explore-the-world/eat-see-do-algiers 1440 | 7.72 | 10.18 | 2.46 | -13 | block columns-media: bottom -13 |  |
| /de/en/sepa-terms-and-conditions-b 390 | 6.14 | 8.59 | 2.45 | +48 | section section.breadcrumb-container: bottom -1604 (h -1604) | heading 1 |
| /de/en/during-your-trip/lhg-wifi 1440 | 8.96 | 11.4 | 2.44 | +88 | head h2 "Using Wi-Fi onboard – made simple": bottom +79 (h +79) |  |
| /de/en/check-in-baggage 1440 | 6.17 | 8.53 | 2.36 | +32 | head h2 "Baggage drop locations and times": bottom -16 (h -32) | video 1 |
| /de/en/articles/explore-the-world/know-before-you-go-berlin 1440 | 4.63 | 6.94 | 2.31 | -25 | block columns-media: bottom -25 |  |
| /de/en/security-fast-lanes 390 | 6 | 8.31 | 2.31 | +8 | head h2 "Services at the airport": bottom +8 |  |
| /de/en/articles/explore-flying/7-people-who-shaped-lufthansa-history 1440 | 1.32 | 3.62 | 2.30 | +25 | block columns-media: bottom +25 | separator 1 |
| /de/en/articles/explore-the-world/essentials-barcelona-facts 1440 | 3.92 | 6.21 | 2.29 | +35 | block columns-media: bottom +35 | separator 1 |
| /de/en/travel-expense-management 1440 | 2.04 | 4.32 | 2.28 | +32 | head h2 "The benefits of the Lufthansa Travel & E": bottom -16 (h -40) |  |
| /de/en/my-logbook 390 | 9.4 | 11.67 | 2.27 | +8 | head h2 "Welcome on board!": bottom -16 (h -32) |  |
| /de/en/business-class-on-short-and-medium-haul 390 | 7.31 | 9.56 | 2.25 | +48 | section section.breadcrumb-container.columns-media-container: bottom -2590 (h -2590) |  |
| /de/en/check-in-baggage 390 | 7.28 | 9.52 | 2.24 | +32 | head h2 "Baggage drop locations and times": bottom -16 (h -32) | video 1 |
| /de/en/prepare-for-your-trip/entry-regulations/immigration-regulations-uk 390 | 4.89 | 7.1 | 2.21 | +24 | head h2 "Travellers who require a visa to enter t": bottom +16 | text-width 2, heading 1 |
| /de/en/articles/explore-the-world/what-i-learned-living-in-barcelona 1440 | 4.92 | 7.11 | 2.19 | -6 | block columns-media: bottom +11 | separator 4, separator-from-768 1 |
| /de/en/travelling-with-special-requirements 390 | 4.61 | 6.8 | 2.19 | +48 | section section.breadcrumb-container.columns-media-container: bottom -2684 (h -2684) |  |
| /de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/cognitive-impairment 1440 | 12.71 | 14.89 | 2.18 | -131 | head h2 "Hidden Disabilities Sunflower": bottom -12 | heading-aligned 4 |
| /de/en/pre-check-in 1440 | 3.29 | 5.46 | 2.17 | +39 | head h2 "A relaxed take-off with late-night check": bottom -16 (h -32) |  |
| /de/en/articles/explore-the-world/essentials-frankfurt-facts 390 | 3.65 | 5.81 | 2.16 | +2 | no box moved (pictures, text, colour) | separator 2, separator-from-768 1 |
| /de/en/fia-valet-service 390 | 3.39 | 5.54 | 2.15 | -43 | head h2 "Other services": bottom -40 (h -32) |  |
| /de/en/services-munich-airport 1440 | 4.47 | 6.62 | 2.15 | +64 | block accordion-columns: bottom +16 |  |
| /de/en/articles/tags/munich 390 | 16.61 | 18.74 | 2.13 | -37 | head h2 "Dive Deeper With Our Interest-based Epis": bottom -83 (h -57) | video 7, heading-aligned 2, heading 1, text-width 1, separator-in-block 1 |
| /de/en/free2move 390 | 4.07 | 6.2 | 2.13 | +19 | head h2 "Book Free2move": bottom -9 (h -32) | column 2, text-width 2, text-size 0 |
| /de/en/articles/explore-the-world/stop-over-tokyo 1440 | 7.64 | 9.75 | 2.11 | -52 | block columns-media: bottom -52 | separator 3 |
| /de/en/passenger-receipt-90 390 | 9.17 | 11.27 | 2.10 | +48 | section section.breadcrumb-container.form-container: bottom -2645 (h -2645) |  |
| /de/en/cash-and-miles 1440 | 10.35 | 12.42 | 2.07 | -32 | head h2 "Promotion: Discover North America now an": bottom -32 (h -32) | column 2, text-size 0 |
| /gb/en/miles-and-more 1440 | 2.33 | 4.38 | 2.05 | -18 | block carousel-cards: bottom -17 |  |
| /de/en/articles/explore-the-world/what-i-learned-living-in-frankfurt 1440 | 4.6 | 6.64 | 2.04 | -16 | block columns-media: bottom -16 | separator 3, separator-from-768 1 |
| /de/de/miles-and-more 1440 | 2.34 | 4.35 | 2.01 | -18 | block carousel-cards: bottom -17 |  |
| /at/de/miles-and-more 1440 | 2.34 | 4.35 | 2.01 | -18 | block carousel-cards: bottom -17 |  |
| /de/en/articles/explore-the-world/on-the-scene-caspar-plautz-munich 1440 | 4.05 | 6.05 | 2.00 | -41 | block columns-media: bottom -41 | separator 3, heading 1, separator-from-768 1 |
| /de/en/unterhaltung-an-bord 390 (www 60) | 13.74 | 15.74 | 2.00 | -40 | block columns-media: bottom -40 | heading 1, text-size 1 |
| /de/en/miles-and-more 1440 | 2.42 | 4.41 | 1.99 | -18 | block carousel-cards: bottom -17 |  |
| /de/en/articles/explore-the-world/be-picky-frankfurt-insider-tips 1440 | 2.8 | 4.79 | 1.99 | -17 | block columns-media: bottom -17 | separator 3, separator-from-768 1 |
| /de/en/lufthansa-at-vienna-airport 1440 | 2.8 | 4.78 | 1.98 | +32 | head h2 "The Austrian Star Alliance Terminal at V": bottom -16 (h -40) | text-width 2 |
| /de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/hearing-impairment 1440 | 4.36 | 6.33 | 1.97 | -12 | block columns-media: bottom +12 |  |
| /de/en/articles/explore-flying/essentials-future-of-flying 390 | 4.87 | 6.83 | 1.96 | +2 | no box moved (pictures, text, colour) |  |
| /de/en/first-class-comfort 390 | 3.13 | 5.06 | 1.93 | +24 | head h2 "First Class": bottom +24 | text-width 1 |
| /de/en/common/privacy-statement/privacy-statement-group 1440 | 3.51 | 5.41 | 1.90 | +25 | section section.breadcrumb-container: bottom +25 (h +25) |  |
| /de/en/electronic-bag-tags 1440 | 3.42 | 5.31 | 1.89 | -29 | block columns-media: bottom -19 (h -19) | separator-in-block 1 |
| /de/en/lounge-companions 390 | 7.23 | 9.12 | 1.89 | +39 | head h2 "Premium Economy Class passengers: Busine": bottom -16 (h -32) | text-size 4, column 1 |
| /de/en/prepare-for-your-trip/baggage/baggage-irregularities/delayed-baggage-lhg 390 | 5.88 | 7.77 | 1.89 | -27 | block columns-media: bottom -40 (h -20) |  |
| /de/en/100-years 1440 | 10.49 | 12.36 | 1.87 | +27 | section spaced.campaign-section.section: bottom +27 (h +27) | text-width 1, indent 1 |
| /de/en/services-at-frankfurt-airport 1440 | 5.27 | 7.12 | 1.85 | +24 | section section.breadcrumb-container.columns-media-container: bottom -660 (h -660) | column 1 |
| /de/en/cash-and-miles 390 | 11.65 | 13.48 | 1.83 | -32 | head h2 "Promotion: Discover North America now an": bottom -32 (h -32) | column 2, text-size 0 |
| /de/en/fliegen-mit-baby 1440 | 4.98 | 6.79 | 1.81 | -16 | head h2 "Important information about preparing fo": bottom -16 (h -40) |  |
| /de/en/security-check-time-slot 390 | 3.94 | 5.75 | 1.81 | +16 | head h2 "All the airports with time-slot access t": bottom +8 |  |
| /de/de/gepaeck 1440 | 3.37 | 5.15 | 1.78 | -12 | head h2 "Gepäckservices": bottom -13 | heading 9 |
| /at/de/gepaeck 1440 | 3.37 | 5.15 | 1.78 | -12 | head h2 "Gepäckservices": bottom -13 | heading 9 |
| /de/en/tiere-als-handgepaeck 390 | 4.52 | 6.3 | 1.78 | -70 | head h2 "Checklist": bottom -40 (h -32) | text-width 2 |
| /de/en/prepare-for-your-trip/baggage/baggage-irregularities/report-baggage 1440 | 5.09 | 6.84 | 1.75 | +21 | block columns-media: bottom +21 | separator-below-768 1 |
| /de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/visual-impairment 1440 | 5.04 | 6.79 | 1.75 | -11 | block columns-media: bottom +13 |  |
| /de/en/affiliatemarketing 1440 (www 60) | 3.67 | 5.41 | 1.74 | -25 | head h2 "Your benefits as an affiliate partner:": bottom +8 | text-width 6, separator 1 |
| /de/en/first-class-valet-parking-service 390 | 5.13 | 6.87 | 1.74 | +8 | head h2 "For your rental or private car: valet pa": bottom -16 (h -20) | text-width 1 |
| /de/en/travelling-healthy 390 | 11.75 | 13.48 | 1.73 | +57 | head h2 "Health guide": bottom +57 | text-size 1 |
| /de/de/meetings-and-events 1440 | 2.74 | 4.44 | 1.70 | -27 | head h2 "Vorteile": bottom -27 (h -40) | text-width 4 |
| /at/de/meetings-and-events 1440 | 2.74 | 4.44 | 1.70 | -27 | head h2 "Vorteile": bottom -27 (h -40) | text-width 4 |
| /de/en/lufthansa-express-bus 1440 | 4.12 | 5.81 | 1.69 | +12 | head h2 "Lufthansa Express Bus is available on th": bottom -32 | column 3 |
| /de/en/with-children-at-the-airport 390 | 17.48 | 19.14 | 1.66 | -16 | head h2 "Make airport waiting times pass more qui": bottom -16 (h -32) | column 1, text-width 1 |
| /de/en/book-and-manage/digital-self-services/airline-apps 390 | 4.18 | 5.83 | 1.65 | +48 | section section.breadcrumb-container.columns-media-container: bottom -2007 (h -2007) |  |
| /de/en/meetings-and-events-delegates 1440 | 2.07 | 3.72 | 1.65 | +8 | head h2 "Flight booking for event delegates": bottom -16 (h -32) | column 1, text-width 1 |
| /xx/es/meetings-and-events 1440 | 2.77 | 4.41 | 1.64 | -27 | head h2 "Privilegios": bottom -27 (h -40) | text-width 4 |
| /de/en/uebergepaeck 390 | 7.77 | 9.41 | 1.64 | +43 | head h2 "Baggage": bottom +43 | text-size 0 |
| /de/en/book-and-manage/pax-receipt 390 (www 60) | 6.93 | 8.55 | 1.62 | -20 | head h2 "Invoices for different countries": bottom -20 |  |
| /de/en/uebergepaeck 1440 | 4.37 | 5.99 | 1.62 | +67 | block accordion-columns: bottom +19 | text-size 0 |
| /de/en/upgrade-info 390 | 5.55 | 7.16 | 1.61 | +24 | head h2 "Upgrade options": bottom +24 |  |
| /de/en/book-and-manage/stopover/zugspitze 390 | 3.33 | 4.93 | 1.60 | +7 | block columns-media: bottom +7 (h +7) | text-size 1, text-width 1, separator-in-block 1 |
| /xx/ru/meetings-and-events 1440 | 3.1 | 4.69 | 1.59 | -27 | head h2 "Привилегии": bottom -27 (h -40) | text-width 4 |
| /fr/fr/meetings-and-events 1440 | 3.11 | 4.69 | 1.58 | -27 | head h2 "Avantages": bottom -27 (h -40) | text-width 4 |
| /xx/fr/meetings-and-events 1440 | 3.07 | 4.65 | 1.58 | -27 | head h2 "Avantages": bottom -27 (h -40) | text-width 4 |
| /de/en/prepare-for-your-trip/baggage/baggage-irregularities/report-baggage 390 | 5.54 | 7.08 | 1.54 | -47 | block columns-media: bottom -47 | separator-below-768 1 |
| /de/en/prepare-for-your-trip/baggage/electronic-devices-and-batteries 390 | 8 | 9.53 | 1.53 | +25 | head h2 "Travel safely with lithium batteries": bottom -5 | text-width 2, heading 1, separator 1 |
| /de/en/munich-fair 1440 | 9.8 | 11.31 | 1.51 | +39 | head h2 "From the airport to Messe München (Munic": bottom +39 (h +39), w -326 | text-width 1 |
| /de/en/lufthansa-at-zuerich-airport 390 | 5.86 | 7.36 | 1.50 | -16 | head h2 "Terminal 1 at Zurich Airport": bottom -16 (h -20) |  |
| /de/en/travel-agencies 390 | 7.21 | 8.71 | 1.50 | +48 | section section.breadcrumb-container.columns-media-container: bottom -1260 (h -1260) |  |
| /de/en/europcar 390 | 2.41 | 3.9 | 1.49 | +58 | section section.breadcrumb-container.car-rental-container: bottom +58 (h +58) | text-size 1 |
| /de/en/lufthansa-at-berlin-airport 1440 | 2.76 | 4.25 | 1.49 | -24 | head h2 "Getting there": bottom -24 (h -40) |  |
| /de/en/miles-and-more 390 | 5.16 | 6.61 | 1.45 | -20 | block carousel-cards: bottom -20 |  |
| /gb/en/miles-and-more 390 | 5.17 | 6.61 | 1.44 | -20 | block carousel-cards: bottom -20 |  |
| /de/en/data-collection-usa 390 | 4.72 | 6.16 | 1.44 | +14 | head h2 "This might also interest you": bottom -7 (h -39) | column 1 |
| /de/en/tiere-als-uebergepaeck 1440 | 8.07 | 9.5 | 1.43 | -48 | head h2 "Prices": bottom +40 (h -32) | video 1, text-width 1, text-size 0 |
| /de/en/articles/explore-the-world/stop-over-tokyo 390 | 8.91 | 10.32 | 1.41 | -36 | block carousel-images: bottom -4 | separator 3 |
| /de/en/security-check-time-slot 1440 | 2.6 | 4.01 | 1.41 | +16 | head h2 "All the airports with time-slot access t": bottom +8 |  |
| /de/de/frankfurt-fair 390 | 6.09 | 7.49 | 1.40 | +39 | head h2 "Flughafen Frankfurt": bottom +39 | text-size 1, separator-from-768 1 |
| /de/en/all-check-in 390 | 5.17 | 6.57 | 1.40 | +32 | head h2 "Bag drop-off": bottom +5 (h +7) | heading-aligned 2 |
| /at/de/frankfurt-fair 390 | 6.09 | 7.48 | 1.39 | +39 | head h2 "Flughafen Frankfurt": bottom +39 | text-size 1, separator-from-768 1 |
| /at/de/articles/tags/allegris 1440 | 10.56 | 11.94 | 1.38 | +96 | head h2 "Alle Artikel zu Lufthansa Allegris": bottom +37 (h -13) | video 1, heading-aligned 1, text-size 0 |
| /de/en/flying-with-small-children 390 | 9.24 | 10.6 | 1.36 | -16 | head h2 "Important information about flying with ": bottom -16 (h -32) |  |
| /de/en/lufthansa-express-rail 1440 (www 60) | 6.08 | 7.43 | 1.35 | -15 | head h2 "Book Lufthansa Express Rail": bottom +32 (h -32) | heading 3, video 1, column 1, text-size 1, separator 1 |
| /de/en/pre-check-in 390 | 4.89 | 6.23 | 1.34 | +15 | head h2 "A relaxed take-off with late-night check": bottom -16 (h -32) |  |
| /de/en/articles/explore-flying/inflight-entertainment-vr-experience 390 | 0.94 | 2.27 | 1.33 | -4 | block columns-media: bottom -4 | separator 1 |
| /de/en/fmg-valet-parking-service 1440 | 1.96 | 3.29 | 1.33 | -19 | head h2 "Dropping off your vehicle": bottom -24 (h -40) |  |
| /de/en/hotel-offers 390 | 10.54 | 11.85 | 1.31 | -35 | head h2 "Be inspired": bottom -15 (h -32) | separator-in-block 1 |
| /de/en/passenger-rights 1440 (www 60) | 3.07 | 4.37 | 1.30 | -40 | head h2 "Refunds": bottom -24 | column 1, text-width 1 |
| /de/de/articles/tags/allegris 1440 | 10.64 | 11.93 | 1.29 | +96 | head h2 "Alle Artikel zu Lufthansa Allegris": bottom +37 (h -13) | video 1, heading-aligned 1, text-size 0 |
| /de/en/doctor-on-board 390 | 6.03 | 7.31 | 1.28 | -31 | head h2 "Doctor on Board – good to know": bottom -32 | text-size 0 |
| /de/en/discover-lufthansa/lufthansa-fleet/351 390 | 8.53 | 9.79 | 1.26 | -20 | head h2 "Seamless connection": bottom -20 | text-width 1 |
| /de/en/lufthansa-at-zuerich-airport 1440 | 3.31 | 4.57 | 1.26 | -40 | head h2 "Terminal 1 at Zurich Airport": bottom -16 (h -40) |  |
| /de/de/digital-self-services 390 | 5.57 | 6.8 | 1.23 | +8 | head h2 "Kurz vor Abflug": bottom -16 (h -20) |  |
| /at/de/digital-self-services 390 | 5.57 | 6.8 | 1.23 | +8 | head h2 "Kurz vor Abflug": bottom -16 (h -20) |  |
| /de/en/book-and-manage/cancellation-and-refund/refund/refund-form 1440 | 3.78 | 5 | 1.22 | +96 | head h2 "General information": bottom +39 | text-size 1 |
| /de/en/articles/authors/florian-tomberg 390 | 4.53 | 5.74 | 1.21 | -24 | head h1 "All articles from Florian Tomberg": bottom -24 |  |
| /de/en/prepare-for-your-trip/baggage/baggage-irregularities/delayed-baggage-lhg 1440 | 2.92 | 4.12 | 1.20 | -6 | block columns-media: bottom -29 (h -9) |  |
| /de/en/accessible-travel 1440 | 4.16 | 5.33 | 1.17 | +21 | block columns-media: bottom +13 |  |
| /de/en/doctor-on-board 1440 (www 60) | 3.48 | 4.65 | 1.17 | -63 | head h2 "Doctor on Board – good to know": bottom -48 | text-size 0 |
| /de/en/automatic-check-in 1440 | 3.37 | 4.52 | 1.15 | +31 | section section.breadcrumb-container.columns-media-container: bottom -1364 (h -1364) | text-width 3, column 1, text-size 1 |
| /gb/en/baggage 390 | 5.01 | 6.14 | 1.13 | -4 | head h2 "Baggage services": bottom -4 | heading 9 |
| /de/en/baggage 390 | 5.01 | 6.13 | 1.12 | -4 | head h2 "Baggage services": bottom -4 | heading 9 |
| /gb/en/digital-self-services 390 | 5.55 | 6.66 | 1.11 | +8 | head h2 "Shortly before your flight": bottom -16 (h -20) |  |
| /de/en/book-and-manage/pax-receipt 1440 (www 60) | 3.01 | 4.12 | 1.11 | -20 | head h2 "Invoices for different countries": bottom -20 |  |
| /de/en/lufthansa-guide-service 1440 | 4.33 | 5.44 | 1.11 | +119 | head h2 "Lufthansa Guides meeting and escorting o": bottom +111 (h -32) | text-width 1, text-size 0 |
| /de/en/digital-self-services 390 | 5.54 | 6.64 | 1.10 | +8 | head h2 "Shortly before your flight": bottom -16 (h -20) |  |
| /de/en/fly-more-sustainabl 390 | 7.6 | 8.69 | 1.09 | -24 | head h2 "Your options to support more sustainable": bottom -32 | column 3 |
| /de/en/prepare-for-your-trip/travelling-with-children/child-in-businessclass 390 | 8.24 | 9.32 | 1.08 | +93 | head h2 "One adult with two children": bottom +61 | text-size 1 |
| /de/en/during-your-trip/lhg-wifi 390 | 11.38 | 12.43 | 1.05 | +22 | head h2 "Using Wi-Fi onboard – made simple": bottom +18 (h +18) |  |
| /de/en/book-and-manage/flights/wetlease-hub 390 (www 60) | 6.29 | 7.33 | 1.04 | -20 | section grey.space-below-l-768.space-below-m-below-768: bottom -20 (h -20) |  |
| /de/en/refund 390 (www 60) | 3.26 | 4.3 | 1.04 | -15 | section section.breadcrumb-container: bottom -1880 (h -1880) |  |
| /de/en/group-travel 390 | 5.99 | 7.02 | 1.03 | -42 | head h2 "Your group booking at lufthansa.com": bottom -16 (h -32) | text-size 1, text-width 1 |
| /de/en/flight-search 390 | 7.05 | 8.05 | 1.00 | -2 | block cards-teaser: bottom -3 | heading 1 |
| /de/en/upgrade-first-class 390 | 5.32 | 6.32 | 1.00 | -17 | head h2 "Upgrade options": bottom -17 | text-width 1 |
| /de/en/articles/explore-the-world/in-my-hood-district-zurich 1440 | 3.58 | 4.56 | 0.98 | -17 | block columns-media: bottom -17 | separator 3, separator-from-768 1 |
| /de/en/digital-baggage-services 390 | 5.37 | 6.34 | 0.97 | +24 | head h2 "Baggage": bottom +24 | video 1 |
| /de/en/articles/explore-the-world/be-picky-barcelona-insider-tips 1440 | 7.16 | 8.1 | 0.94 | -17 | block columns-media: bottom -17 | separator 4, separator-from-768 1 |
| /de/en/articles/explore-the-world/essentials-frankfurt-facts 1440 | 5.14 | 6.07 | 0.93 | +8 | block columns-media: bottom +8 | separator 2, separator-from-768 1 |
| /de/en/refund 1440 | 1.71 | 2.64 | 0.93 | -15 | section section.breadcrumb-container: bottom -1359 (h -1359) |  |
| /de/en/articles/tags/munich 1440 | 13.06 | 13.98 | 0.92 | -64 | head h1 "Travel Guide Munich – a Cozy City in the": bottom 0, w +430 | video 7, heading-aligned 2, heading 1, text-width 1, separator-in-block 1 |
| /de/en/book-and-manage/stopover/neuschwanstein 390 | 2.72 | 3.6 | 0.88 | +7 | block columns-media: bottom +7 (h +7) | text-size 1, text-width 1, separator-in-block 1 |
| /de/en/anmeldung-tiere-frachtraum 1440 | 3.47 | 4.35 | 0.88 | +29 | block form: bottom +29 (h +29) | text-size 2 |
| /de/en/all-check-in 1440 | 3.14 | 4.02 | 0.88 | +9 | head h2 "Bag drop-off": bottom +9 (h +9) | heading-aligned 2 |
| /de/en/articles/explore-the-world/what-i-learned-living-in-frankfurt 390 | 7.58 | 8.45 | 0.87 | -2 | section section.columns-media-container: bottom -776 (h -778) | separator 3, separator-from-768 1 |
| /de/en/book-and-manage/flights/helvetic 390 (www 60) | 7.29 | 8.15 | 0.86 | -35 | section section.accordion-columns-container: bottom -35 (h -35) |  |
| /de/en/electronic-bag-tags 390 (www 60) | 6 | 6.81 | 0.81 | -29 | block columns-media: bottom -19 (h -19) | separator-in-block 1 |
| /de/en/articles/explore-the-world/on-the-scene-caspar-plautz-munich 390 | 7.65 | 8.42 | 0.77 | -20 | block columns-media: bottom -19 | separator 3, heading 1, separator-from-768 1 |
| /de/en/anmeldung-tiere-frachtraum 390 | 7.28 | 8.04 | 0.76 | +29 | block form: bottom +29 (h +29) | text-size 2 |
| /de/en/lufthansa-group-star-alliance-and-partner-airlines 1440 | 7.37 | 8.12 | 0.75 | -72 | head h2 "Miles that take you further": bottom +40 |  |
| /de/en/datenschutz 1440 | 8.51 | 9.24 | 0.73 | +6 | head h2 "Information about data protection": bottom -42 (h -40) |  |
| /de/en/articles/explore-flying/essentials-future-of-flying 1440 | 2.68 | 3.4 | 0.72 | -23 | block columns-media: bottom -23 |  |
| /de/en/100-years/global-network 390 | 15.04 | 15.75 | 0.71 | +7 | head h2 "Rapid rise": bottom +20 | heading-aligned 1 |
| /gb/en/airport-information 390 (www 60) | 5.64 | 6.33 | 0.69 | -30 | section section: bottom -30 (h -30) | separator 1 |
| /de/en/airport-information 390 (www 60) | 5.62 | 6.31 | 0.69 | -30 | section section: bottom -30 (h -30) | separator 1 |
| /de/en/744 1440 | 5.03 | 5.71 | 0.68 | -49 | head h2 "Seat maps Boeing B747-400i": bottom -8 (h -40) | column 2 |
| /de/en/articles/explore-the-world/in-my-hood-chiswick-london 390 | 7.73 | 8.41 | 0.68 | +11 | block columns-media: bottom +10 | separator 2, heading 1, separator-from-768 1 |
| /gb/en/frankfurt-fair 390 | 5.91 | 6.58 | 0.67 | +15 | head h2 "Frankfurt Airport": bottom +15 | text-size 1, separator-from-768 1 |
| /de/en/frankfurt-fair 390 | 5.9 | 6.57 | 0.67 | +15 | head h2 "Frankfurt Airport": bottom +15 | text-size 1, separator-from-768 1 |
| /de/en/articles/explore-the-world/be-picky-barcelona-insider-tips 390 | 9.71 | 10.36 | 0.65 | -8 | block columns-media: bottom -8 | separator 4, separator-from-768 1 |
| /de/en/discover-lufthansa/lufthansa-group-airlines/ita-airways 1440 | 6.25 | 6.9 | 0.65 | +39 | head h2 "FAQ": bottom +39, w +430 | heading 1 |
| /de/en/lufthansa-express-rail 390 (www 60) | 7.25 | 7.9 | 0.65 | +64 | head h2 "Book Lufthansa Express Rail": bottom +36 (h -32) | heading 3, video 1, column 1, text-size 1, separator 1 |
| /de/en/lufthansa-first-class-entertainment 1440 | 6.58 | 7.22 | 0.64 | +14 | head h2 "When your flight time turns into great e": bottom -16 (h -40) | text-size 1 |
| /de/en/lufthansa-corporate-customers 390 | 12.09 | 12.72 | 0.63 | +32 | head h2 "Lufthansa provides corporate and busines": bottom -16 (h -20) | heading 1 |
| /gb/en/frankfurt-fair 1440 | 4.74 | 5.36 | 0.62 | -11 | section column-view.padded.section: bottom -59 (h -59) | text-size 1, separator-from-768 1 |
| /de/en/frankfurt-fair 1440 | 4.74 | 5.35 | 0.61 | -11 | section column-view.padded.section: bottom -59 (h -59) | text-size 1, separator-from-768 1 |
| /de/en/fia-valet-service 1440 | 1.97 | 2.54 | 0.57 | -19 | head h2 "Other services": bottom -40 (h -32) |  |
| /de/en/europa-tarife-economy-class 390 (www 60) | 7.99 | 8.55 | 0.56 | -30 | head h2 "Travel classes": bottom -30 |  |
| /de/en/tiere-als-uebergepaeck 390 (www 60) | 9.61 | 10.16 | 0.55 | -62 | head h2 "Prices": bottom +40 (h -32) | video 1, text-width 1, text-size 0 |
| /de/en/admission-rules 1440 | 3.06 | 3.6 | 0.54 | +100 | head h2 "Lounge access on departure": bottom +25 (h -32) | text-width 1 |
| /de/en/articles/explore-flying/anniversary-super-crane-special 390 | 10.79 | 11.32 | 0.53 | -7 | block carousel-images: bottom -3 | separator 5, separator-from-768 1, separator-below-768 1 |
| /de/en/green-fare 1440 | 2.67 | 3.18 | 0.51 | -24 | head h2 "More information about Sustainable Aviat": bottom -48 | column 1 |
