# app-article-list

Custom block. Purpose: the app's list of a category's articles, one offer box per article. It belongs only in app screen documents under `/content/mobile/lh/<lang>/`, which lh-edge turns into the app's JSON (`tools/workers/lh-edge/SDUI.md`). This rendering only shows authors what the app shows (each item's tracking label as a small grey caption); lh-edge reads the document itself, so it never changes the app.

## Authoring (Document Authoring)

Model: key/value rows.

| Row | Value |
| --- | --- |
| Category | the category screen (a link) |
| Link text | each box's button ("Read article") |
| Tracking | the tracking label ("article") |

The articles come from `/content/mobile/lh/query-index.json` (headline, description, teaser image), newest Date first, then Order, as lh-edge sorts them.

## Universal Editor fields

N/A (Document Authoring project)
