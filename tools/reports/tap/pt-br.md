# TAP Air Portugal, Brazilian Portuguese (pt-br) on lh-tap

Status of 2026-11-04: **imported, uploaded to DA (`moved-permanently/lh-tap`, `/pt-br/` only) and
previewed on `main--lh-tap--moved-permanently.aem.page`; nothing published.** TAP's eighth language
version (Ben, 2026-11-03 22:05: pt-br its own version with its own slugs). The seven other
language folders were not touched.

## Captures

- From tap-deliveries.json, segment `pt-br` (`"complete": true`, 114 pages, 804 images): the page
  archives `tap-snapshots-014` (100 pages) and `-015` (14); the images in the media archives the
  index lists (`imagesInEarlierSegments`: `tap-media-001` to `-005`, `-008`), the `aem-dam` set
  (`tap-media-013`, `-014`, 226 files, `"complete": true`: the aem.flytap.com pictures held until
  2026-11-03 21:42 CET) and the `full-size` set (`tap-media-015`, `-016`, 600 files at 2,560 px).
- Each archive's sha256 against the index, and each page's and media file's sha256 against its
  archive's manifest (114 pages, 1,688 files): all match. Every entry is a regular file inside its
  archive; each new archive was unpacked into its own empty folder.
- Every page is under `/pt-br`, with `lang="pt-br"`, its own canonical and final URL, and
  `__NEXT_DATA__`; none looked wrong.
- **Not captured, as the index lists them**: `/pt-br/informações/documentacao/febre-amarela` (www
  redirects it to `/pt-br/informacoes/documentacao/febre-amarela`, which is captured and imported)
  and **`/pt-br/miles-and-go/btg-pactual`** (the Brazil-only bank partner page: left out, a link to
  www.flytap.com, as Ben decided).

## Tools

ema-cashub's `tools/importer/tap-import.mjs` and `tap-nav.mjs` **as they are on main**, unchanged:
`tap-import.mjs --archive 014 --archive 015 --media 001 … 005, 008, 013, 014, 015, 016 --name pt-br`
(the full-size archives last: the importer's index takes a later archive's copy of the same
picture), `tap-nav.mjs --locale pt-br`. pt-br's texts are the importer's `pt` ones (its texts are
keyed by language). Imported first with the tools as of 3fa6a307, then **again with 417cd022**
(the booking slot, breadcrumbs, the visitor's Miles&Go card, tiles, the footer's card texts and
store badges) and once more with 74932f1b (the text cards as cards three-up), the versions
ema-cashub re-imported the seven other languages with (c0e85ebb, 889eff45), so
pt-br matches them.

**For ema-cashub** (changes pt-br needs; not made here):
1. **aem.flytap.com pictures whose names have spaces or accents are not found** (78 of the 79
   aem.flytap.com pictures pt-br misses are in the aem-dam archives; ema-cashub's c0e85ebb counts 139
  still without a file in the seven languages, likely the same cause): the importer asks its index for
   `https://aem.flytap.com/content/dam/…/AdegaMãe Exterior.png` (one slash, unencoded), the archive
   records `https://aem.flytap.com//content/dam/…/AdegaM%C3%A3e%20Exterior.png` (two slashes,
   percent-encoded; its path `aem.flytap.com/content/dam/…/AdegaMãe Exterior.png` decoded). A lookup
   by the decoded path with the slashes collapsed would find all 78. pt-pt's `stopover/parceiros`
   and the other languages' partner pages have the same pictures, so they are likely missing them
   too.
2. **The nav tool's language switch for pt-br**: `SETUP` is keyed by language, so pt-br gets pt-pt's
   "English" → `/en-pt` (Portugal's English version). Brazil's other language on www is `en-br`
   (not on lh-tap: it would be linked on www). The help link is right for pt-br ("Ajuda" →
   `/pt-br/ajuda`, captured).
3. **`Alternate <lang>` rows** (f63bde38) are keyed by language: a pt-br page's counterpart in pt-pt
   is `Alternate pt`, the same key as pt-br's own language, and the other folders' documents name
   no pt-br counterpart until they are imported again with pt-br in the allowlist.

## Documents (DA and preview, not published)

**126 documents, 126 of 126 answer 200 on preview; 125 carry exactly DA's text** (preview's text
against DA's without the metadata tables; DA's against the local document's, 126 of 126). The one
difference is www's own: on `stopover/parceiros` the Sobreiras hotel's e-mail link is two addresses
run together (`mailto:info@quintadecabanas.ptinfo@sobreiras.pt`, as TAP's page JSON has it); Edge
Delivery cannot keep it as a link and shows `<info@quintadecabanas.ptinfo@sobreiras.pt>` as text.
For TAP's authors (pt-pt's partner page likely has it too). No stray asterisks on preview:
- **110 pages**: the homepage `/pt-br`, `informacoes` 30, `miles-and-go` 23, `a-bordo` 13,
  `gerenciar-reserva` 12, `informacoes-legais` 10, `reservas` 8, `ajuda` 5, `stopover` 2,
  `destinos` 2, and `promos`, `informacoes-check-in`, `info-legal`, `alertas-e-informacoes`;
- **14 fragments** of `/pt-br/destinos/inspire-se` (its destination themes over the content bus's
  1 MB or 200 images, as pt-pt's): `/pt-br/fragments/inspire-se/<theme>`, culture in three;
- **the nav and footer** from the homepage capture (Brazilian Portuguese: "Planejar viagem",
  "Administrar reserva", "Passagens Madri"), TAP's logo; 40 nav links relative, 5 on www.
- **Images**: the archives' pictures, the full-size copy where the full-size set has it;
  704 image files new to DA (the full-size copies have names of their own).
  `tools/importer/sites/lh-tap.json` lists the 124 pages and fragments (the importer adds them; nav
  and footer by its pattern).
- **Links**: pt-br pages relative; the other language folders' pages relative where they are
  documents of the site; booking, check-in, manage-booking, account and Miles&Go sign-in, search,
  the forms and the BTG Pactual page on www.flytap.com.
- **The credit card page** `miles-and-go/ganhe-milhas/cartoes-de-credito` is imported: it is the
  counterpart of pt-pt's `acumular-milhas/cartoes-de-credito` and en-pt's `earn-miles/credit-cards`,
  and the capture kept it while it left the bank page out. Its card is BTG Pactual's Black card: if
  it counts as a Brazil-only card partner page too, it is one document to take out.

**On preview** (the homepage, `miles-and-go/parceiros`, `stopover/parceiros`, 1440 px): TAP's look,
the Brazilian Portuguese nav and footer, the showcase notice in Portuguese ("Demonstração
técnica"), every image that has a file loads (178 on `stopover/parceiros`), no request to a TAP
host. **The homepage's first slide (the new Curitiba route) has no picture**: its banner
`_126_TdP_CWB_1980x1080px_v2` is in no archive (below). The pages carry `lang="pt"`, not `pt-BR`
(shared code: the page's language from its root, for ema-adobe).

**Blocks used** (with 74932f1b): accordion-columns (faq) 258 and (tabs) 2, cards (three-up) 22, cards-teaser (three-up)
54, plain 9 and (four-up) 3, columns-media 70, hero-campaign (narrow) 13, (slider) 1 and (slider,
narrow) 4, fragment 14, cards-icon 11, cards 4, table-striped (header) 1 and (header, matrix) 2,
embed 2, carousel-cards 1, hero-card-overlay 1, plus section-metadata and metadata. **No
component fell back to the generic mapping.**

## Left out, and why

- **4 pages, the forms** (out of scope, links on www): `/pt-br/registro`,
  `ajuda/solicitacoes-reclamacoes/reclamacao`, `…/informacoes-miles-go` and `…/sugestao-ou-elogio`.
- **The BTG Pactual bank partner page** (not captured, above).
- **www's live widgets**, a link "Ver em flytap.com" in their place (15): the contacts picker
  (`ajuda`), Smartvel's destination explorer (`destinos`, `informacoes/bagagem`), the baggage tracking
  form (`informacoes/bagagem/localizar-bagagem`) and 11 CoreMedia widgets.
- 3 pages without a heading of their own get an H1 from their title, as on the other versions.

## Pictures still missing

**121 files without a local copy** (left out, listed in `content-sites/lh-tap/runs/pt-br-import.json`,
not in git; 122 with the first import):
- **78 aem.flytap.com pictures that are in the aem-dam archives** but not found by the importer
  (point 1 above): mostly `stopover/parceiros`' partner cards and `miles-and-go/parceiros`' logos;
- **1 aem.flytap.com picture in no archive**: `…/Parceiros M&G/bancos-e-cc/cotacao-partner-card.png`;
- **42 in no archive**: 41 on pic.flytap.com (share pictures and card images, as for es-es and
  fr-fr, and pt-br's own banners: `_126_TdP_CWB_1980x1080px_v2`, `_126_TdP_CWB_card1280x720_v2`,
  `BBHP_1980x1080_B_v2`, `CartaoBR_900x870`) and the stopover video on TAP's AEM host. For the
  capture.
- The `full-size` set has no segment entry marked complete yet: pictures it adds later replace
  the smaller copies on a re-import.

Rollback: git revert; the documents stay unpublished in Document Authoring.
