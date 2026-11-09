# Austrian baggage (brief 513 follow-up): re-import from the fresh capture, uploaded and previewed, not published

Snapshots: austrian-snapshots-018 (R2 drop 3LZRr22D3-eALPPoEh4mEOYB, sha256 32752a5e6bae21931debabad7574e372364d6d67d8f4a4d7cf20ee661013c41c, 10/10 pages, captured 2026-11-09 12:33 to 12:37 UTC). Importer: austrian-import.mjs (info bundle) at origin/main 00dcd156, offline.

Per document: the import's body sections plus DA's metadata block verbatim (markets, og:title, Breadcrumb title, chat-button, Theme and every other row as DA has them), uploaded as full `<path>.html`.

| document | result |
|---|---|
| /at/en/baggage | uploaded, previewed: www's current page, five `carousel-cards grid two-up` blocks (9 cards), www's new titles and texts, 9 new pictures |
| /at/de/gepaeck | uploaded, previewed: same, five blocks, www's new texts |
| /fr/fr/baggage, /es/es/baggage, /pl/pl/baggage, /ru/ru/baggage | uploaded, previewed: www still has the old text-and-picture layout there (the boxed cards are only on at/en and at/de); only difference to DA is www's no-break spaces (6, 2, 19, 4) |
| /it/it/baggage, /gr/el/baggage, /jp/ja/baggage, /cn/zh/baggage | unchanged (body equal to DA): not uploaded |

Pictures: the nine new pictures of at/en and at/de carry www's picture URLs as every other Austrian document does; the preview pipeline fetched them into the media bus itself (9 of 9 answer 200 image/jpeg on the preview), so no separate DA copy was needed. Alt texts are www's (mostly empty).
Checks: read back equal 6/6, preview 200, one h1, no about:error; rendered 1440 / 390: at/en 4,280 / 6,484 px, at/de 4,280 / 6,592, fr 4,510 / 6,069, es 4,383 / 6,123, pl 4,407 / 6,069, ru 4,507 / 6,250; no broken pictures.
Backup of the 10 DA documents: notes/_backup/2026-11-09-513b-austrian-baggage/.
