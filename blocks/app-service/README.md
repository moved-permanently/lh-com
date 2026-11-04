# app-service

Custom block. Purpose: the home screen's service slot, which the app fills itself: a labelled slot naming its Service, Tenant, Market and Language. It belongs only in app screen documents under `/content/mobile/lh/<lang>/`, which lh-edge turns into the app's JSON (`tools/workers/lh-edge/SDUI.md`). This rendering only shows authors what the app shows (each item's tracking label as a small grey caption); lh-edge reads the document itself, so it never changes the app.

## Authoring (Document Authoring)

Model: key/value rows.

| Row | Value |
| --- | --- |
| Service | the service's content path |
| Auxiliary data | JSON passed to the app unchanged |
| Tenant | e.g. `app_lh` |
| Market | optional |
| Language | the screen's language |

## Universal Editor fields

N/A (Document Authoring project)
