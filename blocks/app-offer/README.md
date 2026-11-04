# app-offer

Custom block. Purpose: the app's offer box: picture, title, description, the link text as its button. It belongs only in app screen documents under `/content/mobile/lh/<lang>/`, which lh-edge turns into the app's JSON (`tools/workers/lh-edge/SDUI.md`). This rendering only shows authors what the app shows (each item's tracking label as a small grey caption); lh-edge reads the document itself, so it never changes the app.

## Authoring (Document Authoring)

Model: key/value rows.

| Row | Value |
| --- | --- |
| Title | the box's title |
| Description | its text |
| Link text | the button's text |
| Image | the picture's DAM URL (a link) |
| Link | the target: an app screen (`/content/mobile/...`) or a web page |
| Tracking | the tracking label |
| Initial title | optional: the title the app shows while the target loads |

## Universal Editor fields

N/A (Document Authoring project)
