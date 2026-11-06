# ema-cashub, offline package of 2026-11-06 (lufthansa.com: lh-com's look and its de/en importer)

Running report, committed as I go. Nothing is published: documents are uploaded to DA and previewed
(`da-upload.mjs`) and checked on main--lh-com--moved-permanently.aem.page. Times in UTC.

## 1. The passenger receipt form and parity pass 2 (the brief called 430 in the package; 424 in my notes): done

Pushed before the package started; smoke of the 11 hosts before and after each push, 0 differences.

- `515475be` fix(importer): tab panels with picture and text rows as Tab sections, their rows as
  columns-media (advance-seat-reservation and 6 pages like it: `tools/reports/parity-2026-11-06/reimport-tabs.txt`)
- `333e172e` feat(passenger-receipt): www's form on `/{cc}/{ll}/book-and-manage/pax-receipt` (from
  lh-parity-003 `pax-receipt/`): Ticket number (13 digits, `220-…`, the dash dropped, at most 14
  characters), First name (1-56) and Last name (1-57) side by side from 768 px with www's accent table
  per language, the business-purpose checkbox, "Download Passenger Receipt"; www's error box with links
  to the fields (it takes the focus) and a message under each field; texts en and de www's, fr, es, it,
  pt, ru, hk, zh, el, ja, ko, pl ours.
- `601f9428` feat(importer): www's `passenger-receipt-portal` as that block (info).
- `4cb9f04c` fix(cards-teaser): rows straight in www's page column as the option `spacious` (www's
  .column-view there: 40 / 80 / 40 px, 20 / 40 / 20 on phones; ours had 32 / 66 / 48).
- `f5d01a3c` fix(accordion-columns): rows of column accordions spaced as www's page column
  (/de/en/articles/tags: every heading and accordion at www's y at 1440).
- `bdd01582` state and the report's pass-2 rows.

**The hand-off, for Ben's call:** www's form does not post to a www `/service/` path; its script calls
`POST https://api.travelid.lufthansa.com/passenger-receipt/v1/download` with `X-API-KEY` (read from
`runtime-config.json` under www's `/digitalhangar/passenger-receipt-portal/…`), `X-Tenant-id: LH`,
`Accept-Language` and `{ticketNumber, firstName, lastName}`, and saves the PDF of the answer. Ours: off
the own www host a valid form opens the same page on www (nothing sent); on the own host it does what
www's script does once that config is served on its origin (lh-edge or a backend: open). Nothing was
ever submitted to www; tested with a stand-in.

Preview paths (release order; no files before them): `tools/reports/parity-2026-11-06/preview-pax-receipt.txt`
(16), `preview-spacious.txt` (6). Checked on aem.page at 1440 and 390 (all 16 forms: texts, the empty
submit's box and focus, the accents, the hand-off; the overview rows; the tags page also on
lufthansa.turnsthe.page, code only).

Found on www: the form's note renders at 10 px (www's bug, kept).

## 2. The de/en re-imports (51 listed, 50 distinct): 47 uploaded and previewed, 2 held, 1 left

Snapshots from the drop (each in its own folder, sha256 and entries checked, nothing run from them):
`lh-snapshots-062` (45 pages), `-063` (the real pages behind /de/en/business-class and /de/en/flynet),
`-061` (homepage, meetings-and-events; its new-onboard-experience superseded by 062's). Not captured:
/de/en/local-page/south-africa-winter-promotion (404 on www; left, Ben's call).

**Bundles:** rebuilt here, all 11 (`build-bundles.mjs` with `AEM_IMPORT_HELPER` = the aem-import-helper
1.6.2 in excat's tools). The ones on main had none of the importer changes since their last build.
**Import:** `import-batch.mjs` per template with the network-blocked importer copy, from the staged
snapshots (alias pages imported at the alias path, as xx/<ll>'s were), then the loop's post steps
(head-metadata, share-sections, stage-promotions, postprocess-media `--no-download`) and the link
steps (add-fleet-metadata, switch-dam-pdfs, switch-dam-media); the media cache is the harness's, so
the manifest's converted copies were applied directly where DA has them (13 references).
Every document diffed against DA's copy saved before the import (text, links, images, blocks,
headings; DA's editor normalisation ignored). Scripts: `migration-work/reimport/` (not in git).

What the import brought, as expected: www's current content (onboard-delights' autumn offer, the
homepage's cards, offers and Black Friday stage, first-class' Skytrax award, the A350 header, the
culinary-journey links), the regular stage (hero-campaign regular), the two-column card grid
(carousel-cards grid two-up instead of the column markers), relative links to pages now in scope,
alt texts, the articles' destination teaser rows.

What it would have lost, fixed before the upload (commit `bb42c99c`, tests first):
- links to the alias pages (/de/en/business-class, flynet, freigepaeck-regeln, digital-travel-companion,
  lounges) went to www's long URLs, and flynet's in-page anchors to www: the cleanup now maps them;
- videos and subtitles DA plays from the site's copies went back to www: lh-edge serves them from the
  AEM publish tier now (route `dam-aem`), which switch-dam-media counted as missing;
- the articles' "Related Articles" heading came as an h2 (www: h3 at the h2 size, as DA has it);
- the homepage's payment and social logos: www has SVGs now where DA has the site's PNG copies, and
  converting needs the media cache (or scripted downloads from www): DA's block kept, SEPA dropped as on www;
- /de/en/100-years/campaigns: the sidebar image in the "Made in Germany" text column; the parser keeps
  it on its own, the full import drops it (open: importer); DA's paragraph kept.
- de/en's stage promotions: the Kuala Lumpur card the second promotion was built from is gone from
  www's homepage: `stage-promotions.json` de/en is the imported stage alone (Black Friday).

**Held (not uploaded; DA unchanged; local copies set back to DA's):**
- `/de/en/business-class`: DA's copy holds unresolved `da-diff-deleted` / `da-diff-added` markup from
  a 2026-11-04 05:32 version labelled "business-class-update - Rolled Out" (a person's rollout).
- `/de/en/first-class`: saved and previewed in DA on 2026-11-04 08:33-08:34 after its last import;
  DA has a "Breadcrumb title" row, the text "Lufthansa First Class", `{spacer-80 from-768}` and
  `{limited-width}` markers the import doesn't bring.
- Seen and not held: the homepage (saved 2026-11-03 13:10) and food-and-beverages (2026-11-04 13:13):
  those saves changed nothing but DA's editor normalisation; internet-overview's author edit
  (author-edits.json, "Entertainment on board") is re-applied by da-upload and is in DA.

**Also uploaded:** 150 documents of other locales (xx/hk, xx/pt, xx/ru …) whose www video and PDF links
the two link steps switched to the site's copies (only those links differ from DA, plus 6 with the
videos' subtitle links). Not uploaded: /xx/hk/register-animal-cabin (DA newer than the local copy).

Preview paths, release order (files first): `ema-cashub-preview-reimport.txt` (48: the stage
fragment, 46 pages, the homepage last; the 5 articles uploaded twice, the second with the h3),
`ema-cashub-preview-dam-links.txt` (150). DA checked against the local copies after the upload: equal.
Checked on main--lh-com--moved-permanently.aem.page at 1440 and 390, all 48: 200, every block
loaded, no broken image, no horizontal overflow; the homepage's Black Friday stage (480 / 280 px).

Open:
- business-class and first-class: Ben's call (keep DA's, take the import, or merge).
- the 100-years/campaigns sidebar image in the full import (importer).
- add-fleet-metadata.mjs stops at the first live root whose fleet documents aren't in the workspace
  (xx/fr here): de/en's rows were written before.
- de/de's stage promotions still name the Kuala Lumpur card (de/de wasn't re-imported).
- two local copies at the alias pages' real paths from a first import, never uploaded (deleting
  under content/ is blocked).

## 3. The re-imports and the chat-panel pages compared again on aem.page: done

144 page-widths (the 45 re-import pages with parity jobs and the 6 chat-panel pages, at 1440, 768 and
390) on main--lh-com--moved-permanently.aem.page against www (lh-parity-002 of this morning; the
chat-panel pages lh-parity-003's recaptures, chat closed). Before (aem.live) -> now: mean unmasked
mismatch 21.8 % -> 17.7 %, pass / review / fail 17 / 55 / 72 -> 20 / 75 / 49; 42 page-widths better by
more than 2 points, none worse by more than 2. The homepage 50.0 -> 16.5 % at 1440. Not compared: the 5
explore-the-world articles (no parity job, no www screenshot), south-africa-winter-promotion (404 on
www), the alias pages business-class and flynet (www redirects them). Summary updated:
`tools/reports/parity-2026-11-06/summary-de-en.md` (section and open rows), every page-width in
`reimport-then-now.md`.
