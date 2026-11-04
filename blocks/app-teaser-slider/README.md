# app-teaser-slider

Custom block. Purpose: the app's teaser slider, the home screen's "Discover further topics": its title over a row of cards. It belongs only in app screen documents under `/content/mobile/lh/<lang>/`, which lh-edge turns into the app's JSON (`tools/workers/lh-edge/SDUI.md`). This rendering only shows authors what the app shows (each item's tracking label as a small grey caption); lh-edge reads the document itself, so it never changes the app.

## Authoring (Document Authoring)

Row `Title | <text>`, then one row per card: the headline (a heading) and text, the picture (linked to its DAM URL), the link (its text is the title the app shows while the target loads), the tracking label.

## Universal Editor fields

N/A (Document Authoring project)
