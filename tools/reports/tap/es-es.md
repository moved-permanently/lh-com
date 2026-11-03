# TAP Air Portugal, Spanish (es-es) on lh-tap

Status of 2026-11-03: **imported, uploaded to DA (`moved-permanently/lh-tap`, `/es-es/` only) and
previewed on `main--lh-tap--moved-permanently.aem.page`; nothing published.** `/pt-pt` and `/en-pt`
were not touched.

## Captures

- From tap-deliveries.json, segment `es-es` (`"complete": true`, 116 pages, 814 images): the page
  archives `tap-snapshots-006` (100 pages) and `-007` (16), the media archive `tap-media-008` (7
  files) and pt-pt's media archives `tap-media-001` to `-005` (855 files) that the index lists as
  `imagesInEarlierSegments`.
- Each archive's sha256 against the index, and each page's and media file's sha256 against its
  archive's manifest: all match. Every entry is a regular file inside its archive (no absolute
  path, no `..`), and each archive was unpacked into its own empty folder. No later archive
  replaces an earlier one's page.
- Every page is under `/es-es`, with `lang="es-es"`, its own canonical and final URL, and
  `__NEXT_DATA__`; none looked wrong. Nothing was fetched from www.flytap.com, pic.flytap.com,
  TAP's AEM hosts or `/_next/data`.

## Tools

ema-cashub's `tools/importer/tap-import.mjs` and `tap-nav.mjs`, unchanged, run through
**`tools/importer/tap-es-es.mjs`** (mine, es-only, with `test/tap-es-es.test.mjs`; since fr-fr
`tools/importer/tap-languages.mjs es-es …`, the same steps for es and fr, see fr-fr.md):

1. **Spanish texts in memory.** Both tools have texts in pt and en only: tap-import's `LABELS`
   (the dry run stopped on `LABELS.es` at the first page with a www widget, in the contacts
   picker's component), tap-nav's `SETUP` (the nav would fall back to English). The runner runs the
   current tool from a temp copy with one entry added and nothing else changed (a tool that gets
   its own `es` runs as it is):
   - `LABELS.es`: onWww "Ver en flytap.com", video "Ver el vídeo";
   - `SETUP.es`: logo alt "TAP Air Portugal, volver a la página de inicio", "Menú", help "Ayuda" →
     `/es-es/ayuda` (www's help tab), the language switch "English" → `en-es` (es-es's other
     language on www; not on lh-tap, so linked on www).
2. **`mergeMarks` after an import run**, on the run's /es-es documents: `<em><strong>A</strong></em><strong>B</strong>`
   becomes `<strong><em>A</em>B</strong>`, and touching bold runs become one. Preview printed the
   first form's marks as literal asterisks in 2 documents (`fragments/inspirate/cultura-2`:
   "Cristo morto**,"; `informacion/equipaje/equipaje-bodega`: "compartido*****"); 12 documents
   changed, 0 stray asterisks left on preview.

**For ema-cashub** (the importer's own fixes would replace both steps):
- `es` entries in `LABELS` and `SETUP` (the values above), or the texts from the page JSON;
- the adjacent marks, in `richText`'s inline output; pt-pt and en-pt may have the same pattern;
- rich text `reference` nodes (embedded assets) are dropped without a note: neither rendered nor
  listed as missing (below).

## Documents (DA and preview, not published)

**128 documents, 128 of 128 answer 200 on preview and carry the same text in DA and locally**
(preview's text against DA's without the metadata tables):
- **112 pages**: the homepage `/es-es`, `informacion` 30, `miles-and-go` 22, `a-bordo` 13,
  `gestionar-reserva` 12, `reservas` 10, `informacion-legal` 9, `ayuda` 5, `stopover` 2,
  `info-legal` 2, `destinos` 2, and `promos`, `informaciones`, `informacion-check-in`,
  `avisos-e-informacion`;
- **14 fragments** of `/es-es/destinos/inspirate` (its destination themes over the content bus's
  1 MB or 200 images, as for pt-pt's `inspire-se`): `/es-es/fragments/inspirate/<theme>`, culture
  in three;
- **the nav and footer** from the homepage capture (`tap-nav.mjs` through the runner): the mega
  menu's four tabs (Planificar viaje, Mis vuelos, TAP Miles&Go, Ayuda), the quick actions
  Gestionar reserva and Check-in (on www), TAP's logo; the footer's columns, app badges and social
  links. 38 nav links relative, 7 on www.
- **786 image files** copied from the media archives (and the nav's logo); 411 of them went to DA
  with the pages, the others were there already from pt-pt and were not sent again. `tools/importer/sites/lh-tap.json` lists the 126 pages
  and fragments (the importer adds them; nav and footer by its pattern).
- **Links**: es-es pages relative; `/pt-pt` and `/en-pt`, the booking, check-in, manage-booking,
  account and Miles&Go sign-in, search and the forms stay on www.flytap.com. 33 documents link
  PDFs on TAP's AEM publish host (`publish-p133109-e1368204.adobeaemcloud.com`), as www's page JSON
  does: links only, the preview fetches nothing from it.

**On preview** (the homepage, `informacion/equipaje/equipaje-bodega`, `stopover`, 1440 px):
`lang="es"`, TAP's look, the Spanish nav and footer, every image loads, no request to a TAP host.
The showcase notice is in English (shared code). The site's code asks for the same path under
`/pt-pt` and `/en-pt` (404: the Spanish slugs differ), shared code as well.

**Blocks used**: accordion-columns (faq) 251 and (tabs) 2, columns-media 71, cards-teaser
(three-up) 54, plain 9 and (four-up) 3, cards 26, hero-campaign (narrow) 23, (slider) 1 and
(slider, narrow) 2, fragment 14, table-striped (header) 1 and (header, matrix) 2, embed 2,
cards-icon 1, carousel-cards 1, hero-card-overlay 1, plus section-metadata and metadata. **No
component fell back to the generic mapping.**

## Left out, and why

- **4 pages, the forms** (out of scope, links on www): `/es-es/registro` (the TAP Miles&Go sign-up),
  `ayuda/solicitudes-reclamaciones/reclamacion`, `…/informaciones-miles-go` and
  `…/sugerencia-o-elogio`.
- **www's live widgets**, a link "Ver en flytap.com" in their place (15): the contacts picker
  (`ayuda`), Smartvel's destination explorer (`destinos`, `informacion/equipaje`), the baggage
  tracking form (`informacion/equipaje/localizar-equipaje`) and 11 CoreMedia widgets (flight
  extras, seats, lounges, fast track, Miles&Go's club, shop, promotions, Miles4Extras, upgrades).
- 3 pages without a heading of their own get an H1 from their title, as on pt-pt:
  `informacion-legal/flight-passes`, `miles-and-go/promo`, `informacion/equipaje/localizar-equipaje`.

## Pictures still missing

- **34 images without a file in the media archives** (left out, listed by the importer): mostly
  the pages' share images and card pictures on pic.flytap.com (`legal_information_card`,
  `boarding`, `baggage_card`, `tap_fares`, `club_tap_miles_and_go` …) and TAP's institutional logo
  on the homepage, plus the stopover video on TAP's AEM host. The list is in the run report
  (`content-sites/lh-tap/runs/es-es-import.json`, not in git).
- **264 embedded images in rich text** on 3 pages, which the capture did not fetch (aem.flytap.com,
  the index's `imagesNotFetched`, decision "ask") and the importer drops (above):
  `stopover/socios` 212 (the partners' cards), `miles-and-go/socios` 46,
  `gestionar-reserva/extras/asientos` 6.
- `stopover`'s 46.7 MB banner (over Edge Delivery's 20 MB): linked on the source, as for pt-pt.

Rollback: git revert; the documents stay unpublished in Document Authoring.
