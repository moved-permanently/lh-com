# subpage-nav

Custom **navigation** block. Purpose: the Lufthansa sub-page navigation of information pages ("More information around this topic": the parent topic and its pages, the current page bold), live `nav.subpage` in `.container-subnav` on `.has-subnav` pages (/de/en/upgrade-info, /de/en/lounge-companions; 180 info pages).

## Authoring (Document Authoring)

Model: `standalone`

One block with one cell: an optional first paragraph (the eyebrow, "More information around this topic"), an optional heading (the topic, e.g. "Upgrade options") and a list with one item per page in nav order. An item is a link to the page; the current page is plain (or bold) text without a link, or a link to the page itself. Put the block alone in the last section of the page (the importer writes it there, as live has the nav after the content).

| subpage-nav |
| --- |
| More information around this topic<br>## Upgrade options<br>• [Premium Economy Class upgrade options](/de/en/premium-economy-upgrade) • **General upgrade information** • [Submit an offer for your upgrade](/de/en/bid-upgrade) |

## Layout

- Below 768px: after the content (24px below its last component, 20px above the footer), the eyebrow 16px and the 22-28px light title 10px indented, then the pages as rows with a 1px #ccc line under each (24px above the text, 10px below; the first row 10px above), 18px regular text with a chevron at the right; the current page bold without chevron.
- From 768px: the nav takes the last 25% of the content column at the top right of the content (10px gap, 15px padding), its top 20px above the first element after the page title (live `.container-subnav { inset: -20px 0 auto auto }`). Everything else on the page keeps to the first 75% of the column (styles.css; running text drops its two-thirds limit, as on live), the page title keeps the full width. The page is at least as long as the nav.

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)
