# news-feed

Live press releases from a Mynewsdesk pressroom as cards: www.lufthansa-cargo.com's homepage
"Latest news" (`.latestNewsHome`, which reads the same list with its own script).

## Authoring (Document Authoring)

Model: `standalone`

Key/value rows (2 columns):

| Key | Value |
| --- | --- |
| Feed | the pressroom list, e.g. `https://www.mynewsdesk.com/services/pressroom/list/<key>/?format=json&type_of_media=pressrelease&limit=6&order=published` |
| Count | optional, how many cards (default 2) |
| Press release label | optional, the date line's label (default per language: Press Release, Pressemitteilung) |
| Read more label | optional (Read more, Mehr lesen) |

The page language's releases come first, then the others in the feed's order (as www). Each card:
the picture, "Press Release - 02 NOV 26 | 14:30" (the feed's own day and time, the month in English
capitals as on www), the title and "Read more", which opens the release on Mynewsdesk. Only feeds
on `www.mynewsdesk.com` are read; when the feed fails or is empty the block is hidden (keep a
"Read all news" link after it). The cards are built with DOM calls (the pages require Trusted
Types).

## Supported variations

None.

## Universal Editor fields

N/A (Document Authoring project)
