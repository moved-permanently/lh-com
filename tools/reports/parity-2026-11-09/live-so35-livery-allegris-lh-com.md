# livery-iconic-moments and the Allegris art articles after their publish round, standing order 35 (2026-11-16)

Live since the helper's state commits c8c727f (the livery-iconic-moments re-import) and c15a3ee (the 29 Allegris
video-size rows, 29 of 29 live). Measured as published on lufthansa.turnsthe.page (the code deployed at 00:45-02:00 CET),
at 1440 and 390, against tonight's recordings (lh-parity-008; xx/it lh-parity-010), tools/parity/compare.js with the
sweeps' flags, the first 8,000 px, then the whole page with logs/b460/offsets.mjs for the drift steps. No request to www
or any airline host. "Off" below means a position or height difference against www; the pixel figure is given beside it.

## /de/en/articles/explore-flying/livery-iconic-moments

| width | first 8,000 px | before the re-import | whole page | height (www / ours) |
| --- | --- | --- | --- | --- |
| 1440 | 5.5 % | 29.8 % | 14.8 % | 17,187 / 17,061 px (-0.7 %) |
| 390 | 8.7 % | 24.2 % | see below | 25,049 / 25,541 px (the recording is broken, below) |

All of www's sentences are on our page (100 % text coverage); the 18 new pictures load (no failed picture).

- 1440: ours drifts upwards in small steps through stories 7 to 10 (-30 px at y 9,360, -69 at 11,360, -85 at 12,000,
  -126 at 12,960, -142 at 13,520, -161 at 15,600: about 15-40 px a story, 0.9 % of the page at most). Nothing is
  2 % off; no row.
- 390: www's recording breaks at about y 16,300. In the middle of story 8 ("Many Hands, One Goal") the capture
  restarts with the header, the breadcrumb and the title, and draws stories 1 to 5 a second time down to its end;
  stories 9 and 10 and the related articles are not in it. Its height (25,049 px) and the whole-page figure therefore
  measure the recording, not the page. Up to the break ours is never more than 22 px from www (0 to y 3,600, +15 to
  11,920, +19 to 12,880, +22 to 16,000: 0.1 %). Nothing is 2 % off; no row. A new 390 recording is needed to compare
  the page's last 9,000 px; I made no request to www for one.

## The Allegris art articles (/<market>/articles/highlights/allegris-new-york)

The only recorded art article: none of the others (allegris-business-san-diego, allegris-premium-economy-san-diego
and the rest of the series) has a recording.

| version | 1440 | 390 | heights (www / ours) at 1440, 390 |
| --- | --- | --- | --- |
| de/en | 8.3 % | 10.7 % | 6,945 / 6,935; 7,663 / 7,663 |
| de/de | 10.1 % | 11.2 % | 7,080 / 7,080; 8,227 / within 8,000 |
| at/de | 9.9 % | 12.3 % | 7,080 / 7,038; 8,227 / within 8,000 |
| gb/en | 11.0 % | 12.1 % | 6,945 / 6,864; 7,663 / 7,604 |
| xx/it | 28.5 % | 30.8 % | 7,000 / 6,406; 7,998 / 6,705 |

The four main versions are within 1.2 % of www's height at both widths. The video sizes now match.

### xx/it: content www has and we lack (a row)

xx/it's gap is 594 px at 1440 (735 px before the video rows went live) and 1,293 px at 390. It is content, not layout.
www shows three "Articoli correlati" cards: two xx/it highlights and gc/en's allegris-typologies. Ours shows none, and
its block hides its section. The block is empty in DA, and it picks from the language's article index. No xx article
index exists: /xx/it/articles/query-index.json answers 404, and helix-query.yaml has no index for xx/it, xx/fr or
xx/es. Text coverage is otherwise 94.6 %; the misses are the video player's menu labels. All 8 pictures load.

- **Row (READY):** delta-so35-xx-it-related-lh-com.txt / .json. www's three cards are authored in the block. As a
  draft on our host: 28.5 / 30.8 -> 14.0 / 14.0 % at 1440 / 390. Height 6,980 / 7,923 px (www 7,000 / 7,998), within
  0.3 / 0.9 %, so nothing left 2 % off. The other four versions read 8-12 %. The remaining difference on xx/it is the
  same as theirs.
- **Proposal, not shipped: an article index per xx language.** It would add `articles-xx-it`, `articles-xx-fr` and
  `articles-xx-es` to helix-query.yaml, each a copy of `articles-de-en` with the paths changed (extended, never
  replaced). It would fill the related cards of the other xx articles, which have the same empty block and are
  unrecorded. An index stays empty until a publish or the helper's index job, so it cannot be gated before that.
  xx/it has 8 articles, all under highlights/; xx/es also has explore-flying and explore-the-world. Whether to add the
  indexes is the migration session's call: they also change what blog-overview lists on the xx overview pages.

Two side findings, no row tonight:
- de/en's allegris-typologies has an og:image of a plane, but its og:image:alt describes the woman of its first
  picture.
- livery-iconic-moments at 390 needs a fresh recording past y 16,300.
