# Brief 513, Austrian baggage's boxed teaser cards: HELD (decision of 2026-11-09: option a)

Nothing is converted by hand and nothing is uploaded. /at/en/baggage on lh-austrian keeps its old "columns-media padded" document until a fresh capture exists.

## Why

Brief 497's recording (austrian-parity-002b.tar.gz, sha256 a79e58fa..., at-en-baggage-1440.html) is a newer version of www's page than DA's copy. The re-import with the info bundle gives the boxed "carousel-cards grid two-up" blocks (5 blocks, 9 cards), but also: h2 titles become linked h4 titles; texts changed ("Hand lugagge", "Free bagagge allowance", "To bagagge problems" as on www; "Dangerous goods", "Electronic devices", new descriptions for electronic devices, bag tags, dangerous goods and excess baggage; the baggage pick-up link /de/ -> /en/); 8 of the 9 pictures are other files (frontify_variations ids differ), their alt texts empty; metadata og:title "Baggage" (DA: "All the information you need about baggage"), no Breadcrumb title row, no markets row. The new pictures have no DA copy, and a DAM copy needs a www fetch.

## Preconditions for the re-import (after Ben writes "stable")

1. A fresh capture of the ten baggage pages (local, one warm session, ~10 s a page, archive with sha256 in the R2 drop): /at/en/baggage, /at/de/gepaeck, /fr/fr/baggage, /it/it/baggage, /es/es/baggage, /pl/pl/baggage, /ru/ru/baggage, /gr/el/baggage, /jp/ja/baggage, /cn/zh/baggage (order as reimport-austrian-boxed-teasers.txt: at/en, at/de, then the market roots).
2. DAM copies of the new pictures (brand media on AEM / DA media before the pages that use them), so the documents carry DA's own picture URLs, not www's transform URLs.
3. Keep from DA's current documents, as the importer does not write them: the metadata rows `markets`, `og:title` (DA: "All the information you need about baggage" on at/en; the importer would write "Baggage"), `Breadcrumb title` ("Baggage"), and the `chat-button` row; each document's own market sections.
4. Gate as always: backup first (notes/_backup/<date>-austrian-baggage/), diff against DA, loss check, upload as full <path>.html, preview, read back, 200, no about:error, render 1440/390. Expected: five "carousel-cards grid two-up" blocks, the context teasers ("Hand luggage") as boxed cards two a row.
