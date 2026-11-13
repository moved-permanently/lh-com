# lufthansa.com insights and campaign against lh-parity-004a/b (the brief after 539, item 1)

ema-test, 2026-11-09. ema-adobe's ranking ([sweep-lh-004.md](sweep-lh-004.md)) put these two page types worst after the
hub. This report takes their causes, worst gap first.

**The recordings**: lh-parity-004a.tar.gz (sha256 643a8e35…) and lh-parity-004b.tar.gz (b2b2f085…) from the R2 drop.
Both checksums match the brief. They were unpacked outside the checkout and are not committed.

**The method** is sweep-lh-004.md's:
- each published page on lufthansa.turnsthe.page with the deployed code, at 1440 and 390;
- tools/parity/capture.js with the recording's layout width, then tools/parity/compare.js over the first 8,000 px,
  live boxes masked;
- per section of ours, the drift (how far ours sits from www's recording), to find where the height goes;
- a fix is measured the same way before and after, the rule injected into the published page (a scratch copy of
  capture.js that adds one stylesheet).

The pages are 24 (9 insights, 15 campaign), 48 page-widths per type pair. at/de renders the same documents and
recordings as de/de. No request to www. Nothing uploaded or published. Scratch: logs/p4/s512, not in git.

## Per page type

| page type | page-widths | mean % before | mean % after | median before / after | >= 20 % before / after |
| --- | --- | --- | --- | --- | --- |
| insights | 18 | 16.5 | 15.2 | 14.9 / 14.9 | 4 / 3 |
| campaign | 30 | 11.6 | 10.7 | 10.5 / 10.0 | 2 / 2 |

Most of the insights drop is not a fix. /gb/en/articles/highlights/all-it-takes-is-a-yes at 1440 went from 28.0 to
11.5 % because www's fare recommender (live data) recorded seven offers and ours showed three in the first run and more
in the second. Without that page-width, insights went 15.8 -> 15.4 %.

## Fixed (CSS, lufthansa.com only, pushed)

| commit | cause | measured (before -> after) |
| --- | --- | --- |
| 10a30d1b | **carousel dots** from 768 px. www draws the dots 58 px under the last slide's image or caption on every recorded carousel. Ours had 65 under an image and 77 under a caption: 56 px margin, the 24 px target's 8 px, and the caption's 10 px bottom padding. | crane 1440 10.2 -> 8.2 % (de/de) and 9.9 -> 8.0 % (gb/en); new-onboard-experience 1440 7.7 -> 4.9 % and 8.9 -> 6.4 %; san-diego 1440 -0.8 points |
| 60354011 | **no section gap under the related articles that end an article**, now at every width (brief 507's phone rule). www has 34 px from the last card's text to the footer at 1440 too; ours had 83. | san-diego 1440 12.9 -> 10.8 % (de/de) and 12.0 -> 9.9 % (gb/en), with the dots |
| 299fb458 | **34 px under a columns-media video cell on phones** (www's video component). Ours gave it the image's 50. | see the next row |
| 88360b0e | **a button label that doesn't fit wraps** on lines from the left, as www's, instead of being cut with an ellipsis. There were 4 cut labels on the 53 lufthansa.com sample pages, on crane and new-onboard-experience. | crane 390 12.9 -> 11.8 % and 15.4 -> 13.2 %; new-onboard-experience 390 12.2 -> 9.3 % and 11.7 -> 8.8 % (with 299fb458; each alone is worse, because the short button had made up for the 17 px above it) |

Every rule is scoped to body.brand-lufthansa, so no other brand's pages change. lufthansa.com's pass-check sample
(lh-com-pass-check.md's 37 pages) has no cut button and no carousel caption case other than these. No importer rule
changed, so there is no reimport-539 list: the published documents take the fixes as they are.

## Not fixed, worst first

| page-widths | % | cause | why not |
| --- | --- | --- | --- |
| /de/de, /at/de 100-years/destinations 1440 | 25.6 | **The stage images.** www's hero-campaign pictures show a lower crop of the same 16:9 image; ours draws the whole image at 1440 x 810. That is about 40-55 % mismatch in each stage band. | www's crop follows the scroll position (parallax; ema-adobe saw the same on insights). It is the recording's position, not a layout rule. |
| /gb/en, /de/de, /at/de articles/tags/allegris 1440 / 390 | 23-24 / 19-20 | 1. **www's "Conditions" link under the Allegris teaser card** in the grey band (+30 px, and the band's padding under it: the band is 66 px taller on www). The cards-teaser parser doesn't import it. 2. Two headings after a block (the video, the pagination) get 59 and 71 px on www, 33 and 36 on ours. 3. The pagination's look: 50 px boxes, grey #f5f5f5, 10 px apart on www; 40 px and no fill on ours. The height is about the same (www 47 + 50 + 71, ours 89 + 40 + 36). | The Conditions trigger on a cards-teaser has no markup on this machine: the snapshots hold it only on Austrian's and Brussels' homepage stages. Its dialog is empty on www (ema-adobe). A parser rule without www's markup would be a guess, so it needs a snapshot of the tag page. The heading gaps are tag-page-only, two cases. |
| /gb/en/articles/highlights/all-it-takes-is-a-yes 1440 | 28.0 -> 11.5 | the fare recommender's offers (www 7, ours 3) | live data, out of the numbers (the brief) |
| /gb/en/100-years/crane 390 | 13.2 (after) | the image caption "The Lufthansa crane on the Junkers Ju 52." shows on www and is missing on ours (-20 px) | a document question (the caption isn't in DA's document); left for the import owner |
| /gb/en, /de/de most-significant-route / bedeutsamste-strecken 1440 | 10.5-10.9 | **www draws the world map at the column width** (land 954 px wide, ours 865: the image's own 1144 px against the column's 1264). -51 px. | One image on the sample: no other content picture on the 84 recorded pages or the 37 pass-check pages is narrower than its column on ours. A rule stretching every image-only paragraph would also stretch small pictures. Without www's image rule, I left it. |
| /gb/en, /de/de frankfurt-fair 1440 | 8.7-10.0 | The column view paragraph under the stage picture: 15 px less space above it, 39 less under it than www (the column view carrier's padding, 40 px against www's about 56 / 80). | The column view carrier's CSS and the hub transformer that writes it are ema-adobe's. |
| text that wraps one line earlier on www (-27 px per paragraph: destinations, tags, bedeutsamste-strecken) | | The same words take about 1 % more width in the recording. A line that just fits on ours wraps on www ("…zu Familie und / Freund:innen"). The text boxes are the same width. | The recording is headful Google Chrome, ours headless Chromium on Linux: text rasterising differs. Settle it by capturing ours with the capture child's browser, not with CSS. |
| destinations' Rio de Janeiro H2 | | www sets it in three lines (a narrower heading box), ours in two | decided: headings with www's limited width take the text width (brief 515) |

## B2B's grey band Columns Media (the brief's item 3)

Not one rule. In B2B's DA documents no Columns Media in a grey band has a column mark (0 of 152, against 756 / 773 of
855 elsewhere). But dropping the theme's column-view edges there makes the canary worse: the mean goes from 2.0 % to
2.4 %, and the page-widths over 3 % from 11 to 18. contact at 390 improves (+4.3 -> +1.3 %), and every other affected
page moves away from www. The edges stand in for spacing that www's grey bands have without column marks. Reverted,
not committed.
