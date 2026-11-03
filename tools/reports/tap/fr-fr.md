# TAP Air Portugal, French (fr-fr) on lh-tap

Status of 2026-11-03: **imported, uploaded to DA (`moved-permanently/lh-tap`, `/fr-fr/` only) and
previewed on `main--lh-tap--moved-permanently.aem.page`; nothing published.** `/pt-pt`, `/en-pt` and
`/es-es` were not touched.

## Captures

- From tap-deliveries.json, segment `fr-fr` (`"complete": true`, 117 pages, 814 images): the page
  archives `tap-snapshots-008` (100 pages) and `-009` (17). fr-fr has no media archive of its own:
  all its images are in the ones the index lists as `imagesInEarlierSegments`, `tap-media-001` to
  `-005` (pt-pt) and `-008` (es-es), already here from es-es.
- Each archive's sha256 against the index (the two page archives downloaded, the six media
  archives checked again), and each page's and media file's sha256 against its archive's
  manifest (117 pages, 862 files): all match. Every entry is a regular file inside its archive;
  each page archive was unpacked into its own empty folder.
- Every page is under `/fr-fr`, with `lang="fr-fr"`, its own canonical and final URL, and
  `__NEXT_DATA__`; none looked wrong. Nothing was fetched from www.flytap.com, pic.flytap.com,
  TAP's AEM hosts or `/_next/data`.

## Tools

ema-cashub's `tap-import.mjs` and `tap-nav.mjs`, unchanged, run through my wrapper, now
**`tools/importer/tap-languages.mjs`** (was `tap-es-es.mjs`; `test/tap-languages.test.mjs`, tests
first): `node tools/importer/tap-languages.mjs <es-es|fr-fr> import|nav <the tool's arguments>`.
The same two steps as for es-es, per language:

1. **The language's texts in memory** (both tools have pt and en only), from www's fr-fr pages:
   - `LABELS.fr`: onWww "Voir sur flytap.com", video "Voir la vidéo" (fr-fr writes its links "Voir
     l'offre", "Voir le catalogue", "Voir la liste complète"; its one video button is still in
     Portuguese, "Assistir ao vídeo", and stays as www has it);
   - `SETUP.fr`: logo alt "TAP Air Portugal, retour à la page d'accueil", "Menu", help "Aide" →
     `/fr-fr/aide` (www's help tab and its page), the language switch "English" → `en-fr`
     (France's other language on www; not on lh-tap, so linked on www).
2. **`mergeMarks`** after the import run on the run's /fr-fr documents (a bold run right after a
   bold-italic one as one bold run; the preview printed the pattern as literal asterisks): 12
   documents changed, 0 stray asterisks on preview.

The points for ema-cashub are those of es-es.md: the `fr` entries (values above) and the adjacent
marks. The third, the rich text `reference` nodes, ema-cashub has done since (047687b0).

**The tool's version**: fr-fr (and es-es) were imported before ema-cashub's 047687b0 (rich text
DAM images: the archives' copy, else left out and listed) and f63bde38 (`Alternate <lang>`
metadata from www's hrefLangs, for the header's language switch). The wrapper and its tests work
with the current tool. A re-import with it would list the 264 rich text images as missing (no
file: no visible change), but would add **no Alternate rows**: the importer links only
counterparts among the run's own pages, so fr-fr's rows to pt-pt and en-pt need their archives in
the same run (it then writes pt-pt and en-pt documents locally too), and pt-pt's and en-pt's
documents would need `Alternate es` and `fr` rows of their own. Not done: it needs ema-cashub's
pt and en documents, so it is for you and ema-cashub to agree how.

## Documents (DA and preview, not published)

**129 documents, 129 of 129 answer 200 on preview and carry the same text in DA and locally**
(preview's text against DA's without the metadata tables):
- **113 pages**: the homepage `/fr-fr`, `informations` 31, `miles-and-go` 22, `a-bord` 13,
  `gerer-reserves` 12, `mentions-legales` 11, `reservations` 10, `aide` 5, `stopover` 2,
  `destinations` 2, and `promos`, `informations-enregistrement`, `info-legal`,
  `alertes-et-informations`;
- **14 fragments** of `/fr-fr/destinations/inspirez-vous` (its destination themes over the content
  bus's 1 MB or 200 images, as es-es's `inspirate`): `/fr-fr/fragments/inspirez-vous/<theme>`,
  culture in three;
- **the nav and footer** from the homepage capture: the mega menu (Planifier un voyage, Mes vols,
  TAP Miles&Go, Aide), the quick actions Gérer de réservation and Enregistrement (on www), TAP's
  logo; the footer's columns, app badges and social links (its "Voos Funchal" as www's fr-fr menu
  writes it). 39 nav links relative, 6 on www.
- **Images**: every picture of the archives the pages use; one file went to DA (the nav's logo,
  `tap-logo-d440ae81.svg`), all the others were there already from pt-pt and es-es.
  `tools/importer/sites/lh-tap.json` lists the 127 pages and fragments (the importer adds them;
  nav and footer by its pattern).
- **Links**: fr-fr pages relative; `/pt-pt`, `/en-pt`, `/es-es`, the booking, check-in,
  manage-booking, account and Miles&Go sign-in, search and the forms on www.flytap.com. As in
  es-es, 32 documents link PDFs on TAP's AEM publish host as www's page JSON does (links only).

**On preview** (the homepage, `informations/bagage/bagage-en-soute`, `stopover`, 1440 px):
`lang="fr"`, TAP's look, the French nav and footer, every image loads, no request to a TAP host.
The showcase notice is in English and the site's code asks for the same path under `/pt-pt`,
`/en-pt` and `/es-es` (404): the shared-code points of es-es.md.

**Blocks used**: accordion-columns (faq) 251 and (tabs) 2, columns-media 71, cards-teaser
(three-up) 55, plain 9 and (four-up) 3, cards 26, hero-campaign (narrow) 23, (slider) 1 and
(slider, narrow) 2, fragment 14, table-striped (header) 1 and (header, matrix) 2, embed 2,
cards-icon 1, carousel-cards 1, hero-card-overlay 1, plus section-metadata and metadata. **No
component fell back to the generic mapping.**

## Left out, and why

- **4 pages, the forms** (out of scope, links on www): `/fr-fr/inscription` (the TAP Miles&Go
  sign-up), `aide/demandes-reclamations/reclamation`, `…/informations-miles-go` and
  `…/suggestion-ou-compliment`.
- **www's live widgets**, a link "Voir sur flytap.com" in their place (15): the contacts picker
  (`aide`), Smartvel's destination explorer (`destinations`, `informations/bagage`), the baggage
  tracking form (`informations/bagage/localiser-bagages`) and 11 CoreMedia widgets (flight
  extras, seats, lounges, fast track, boarding, Miles&Go's club, shop, promotions, Miles4Extras,
  upgrades, Economy Xtra).
- 3 pages without a heading of their own get an H1 from their title, as on es-es:
  `mentions-legales/flight-passes`, `miles-and-go/promo`, `informations/bagage/localiser-bagages`.

## Pictures still missing

- **33 images without a file in the media archives** (left out, listed by the importer in
  `content-sites/lh-tap/runs/fr-fr-import.json`, not in git): the same kind as es-es's 34, mostly
  share images and card pictures on pic.flytap.com (`legal_information_card`, `boarding`,
  `baggage_card`, `tap_fares`, `club_tap_miles_and_go`, the documentation pages' country pictures
  …), TAP's institutional logo on the homepage and the stopover video on TAP's AEM host.
- **264 embedded images in rich text** on 3 pages, waiting for Ben's decision on the aem.flytap.com
  pictures (not fetched; and dropped by the importer): `stopover/partenaires` 212,
  `miles-and-go/partenaires` 46, `gerer-reserves/extras/sieges` 6. Left as they are.
- `stopover`'s 46.7 MB banner (over Edge Delivery's 20 MB): linked on the source, as for pt-pt and
  es-es.

Rollback: git revert; the documents stay unpublished in Document Authoring.
