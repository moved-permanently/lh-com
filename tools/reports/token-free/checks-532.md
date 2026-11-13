# The brief after 532: what the Spacer gap rule does on every brand's sample, and B2B's and Cargo's canary

ema-test, 2026-11-09. Measured on our hosts only. The branch previews `token-free-<brand>-live--<site>--…aem.page`
have the theme on, and the `*.turnsthe.page` hosts serve the published pages. No request to www. Nothing written,
uploaded or published. Scratch: logs/p4/s510 (not in git).

## 1. The Spacer heading gap (e8089eaa), the pass checks' samples

Every pass check's sample pages (ita-, discover-, tap-, swiss-, swiss-mk-, swiss-sub-, austrian-, brussels-, b2b- and
lh-com-pass-check.md, 167 pages, plus B2B's two news/lhg-ita-airways pages) at 1440 and 390, on the brand's switch-branch
preview. Each was measured as served, then with the fix injected: the narrowed selector's effect,
`… > p.spacer:not(.divider) + :is(h2, h3) { margin-top: 0 }`. Where the fix changes the page, the host was measured too.
ITA's documents were collapsed in DA by then. The other brands' previews still carry the markers, and the old reader
draws their separators as the same `p.spacer`, so the rule meets the same elements.

| brand | page-widths | changed by the fix | headings that lose the 32 px | mean difference to the host on the changed ones: before -> after |
| --- | --- | --- | --- | --- |
| ITA | 24 | 4 | 28 | 3.7 % -> 1.4 % |
| Discover | 28 | 3 | 4 | 0.9 % -> 0.1 % |
| TAP | 20 | 0 | 0 | (no Spacer before a heading) |
| SWISS (markets, -mk, -sub) | 80 | 22 | 100 | 2.9 % -> 0.4 % |
| Austrian | 38 | 8 | 18 | 2.3 % -> 0.9 % |
| Brussels | 38 | 18 | 34 | 1.7 % -> 0.6 % |
| Group for Business | 36 | 8 | 42 | 3.2 % -> 0.4 % |
| lufthansa.com | 74 | 6 | 8 | 0.7 % -> 0.0 % |

Cargo and Air Dolomiti have no Spacer at all (spacer-cost-536.md).

- **ITA**: terms-and-conditions-of-use loses 416 px (13 headings): +9.2 % -> +3.5 % at 1440 and +3.8 % -> +1.5 % at
  390 on main's height (ema-adobe's +8.1 -> +3.1 % are page heights). bid-upgrade -32 px.
- **SWISS**: the six hand-baggage pages -192 px at 1440 and -168 at 390 (6 headings): +2.9 to +3.3 % -> -0.5 %.
  compensation-voucher-conditions /kr/ko -288 px (9 headings): +14.0 % / +8.0 % -> 0.0 %.
- **Brussels**: kinshasa-ndjili-airport-lounge -192 px: +4.7 % -> +0.3 % at 1440. At 390, +0.7 % -> -3.3 %: its
  small separators still go (cause C in brussels-pass-check.md).
- **Group for Business**: news/lhg-ita-airways in de and en -288 px: +5.1 % / +4.4 to +4.6 % -> -0.2 to -0.3 %.
- **Further from the host after the fix**: three page-widths (Brussels' Kinshasa lounge at 390, SWISS's /kr/ko
  group-travel 0.3 -> 1.2 % and 0.8 -> 1.0 %). The rest come closer.

## 2. Group for Business's canary: the three biggest differences

The canary is the first 20 documents of collapse-lh-b2b-census-paths.txt, at 1440 and 390.
- **The collapsed render**: the dry-run document as `<main>` on the branch preview (head 6d6a9206, theme on; today's
  collapse, 54303323 and the brief after 532 included).
- **E, the method's own render**: the same DA document uncollapsed, put in the same way on the host.

DA's documents differ from the published pages on 22 of the 40 page-widths, up to 2,622 px: re-imports uploaded and
previewed, not yet published (Ben's rule: they are published in the next round). So the collapse's own difference is
the collapsed render against E. **Mean 2.0 %, 10 of 40 page-widths over 3 %.**

1. **help-alliance -6.7 % at 1440 (-115 px), -3.0 % at 390.** The same intro block is on lhg-history (-4.9 %) and
   joint-ventures (-3.1 / -2.2 %). Three parts:
   - the intro's `{spacer-30}` goes (C, decision 4: -31 px);
   - the H4 "Engage in one of our focus areas", marked `{column-start-outer}` only, sat inside the outer column group's
     padding at the unmarked H4 size (64 px, two lines). Collapsed it is outside the group, at B2B's H4 default (21
     px), -43 px (D and B);
   - the paragraph after it ran in the group's padding (88 px, four lines) and now runs over the text width (48 px):
     -40 (A and B).
2. **lhg-history-alliances-and-joint-ventures -6.2 % at 1440 (-273 px), -4.5 % at 390.**
   - The H3 that opens each outer column group runs over the text width now (72 -> 32 px).
   - The grey band's Columns Media, a column view of its own (B2B's rule), is 154 px shorter: its text runs wider than
     in the old padded group (B).
   - An H4 takes heading-copytext-large (D).

   The four joint-venture pages show the same at 1440 (-3.5 to -3.9 %, -157 to -169 px): their H2s marked
   `{column-start-outer}` go from two lines at the unmarked size (78 px) to one at heading-medium (38 px), and a
   `{spacer-30}` goes.
3. **about-us/contact +4.3 % at 390 (+125 px).** In its grey band B2B's rule puts each Columns Media in a column view
   of its own, also at the section's end (four marks, 20 px each at 390, +80). The H2 between them gets the theme's
   32 px heading gap where the host had 20 (+12), and the band's opening paragraph its 24 px. At 1440 +2.0 %.

All three are the theme's known causes (A, B, C, D in b2b-pass-check.md): Ben's rule, near values to the common style.
Nothing in the collapse to fix.

## 3. Cargo's canary: the 22 documents

The 22 documents at 1440 and 390, the same way (branch head 0e0a2c31). **The collapse's own difference: 0 px on all
44 page-widths.** The 30 video settings go to the theme, and the video links keep their text (27284049).

The renders differ from the published pages by the method alone (E against the host: -111 to -2,187 px on every page).
The hosts draw the video players and the eBooking page's dynamic parts, which a document put in as `<main>` doesn't
load. Both sides of the collapse comparison miss them alike.
