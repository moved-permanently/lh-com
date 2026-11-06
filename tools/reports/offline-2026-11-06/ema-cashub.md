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

## 4. The worst 30 page-widths of summary-de-en.md, one by one

Measured again on aem.page (14 pages of the 30 not yet in item 3; `/tmp` was wiped by a service
restart at about 12:15 UTC, so the parity archives were fetched and checked again and the staging rebuilt).
Then (aem.live, before) -> now:

| # | Page | Width | Then | Now | What it is | Done |
|---|---|---:|---:|---:|---|---|
| 1, 3 | /de/en/book-and-manage/stopover | 1440, 768 | 56.5, 51.3 % | 56.5, 51.3 % | tab panels with picture rows came in flat (importer fixed in pass 2) | blocked: no de/en snapshot of the 6 tab pages (reimport-tabs.txt) to re-import |
| 2, 7, 22 | /de/en/discover-lufthansa/take-off | 1440, 768, 390 | 51.5, 49.7, 43.9 % | two-up now (not measured again) | www's two-up teaser rows straight in the page column came in as plain content (campaign mapped .section-content rows only) | importer: campaign maps them; de/en, de/de, at/de, gb/en converted from DA's copies into cards-teaser (spacious); xx/hk, pt, ru re-imported |
| 4, 8, 9 | /de/en/book-and-manage/pax-receipt | 1440, 390, 768 | 50.6, 49.3, 48.2 % | 4.9, 9.2, 7.3 % | the form (item 1) | done |
| 5, 16, 17 | /de/en/first-class | 1440, 768, 390 | 50.5, 44.8, 44.5 % | unchanged | www's new content (Skytrax, schedules in tabs) | held for a person's DA edit (item 2): Ben |
| 6, 11, 15 | /de/en/homepage | 1440, 768, 390 | 50.0, 46.1, 45.0 % | 16.5, 13.9, 9.5 % | www's new content | done (item 2) |
| 10 | /de/en/flights | 390 | 48.0 % | 48.0 % | www's offer grid full, ours empty: the offer API does not answer here (impossible.md) | row (live data); its 768 "then" of 1.2 % was a short capture |
| 12 | /de/en/doctor-on-board-news | 390 | 45.8 % | 45.8 % | ours 30 % taller at 390 | open |
| 13 | /de/en/business-class-on-short-and-medium-haul | 390 | 45.7 % | 45.7 % | ours taller at 390 | open |
| 14 | /de/en/book-and-manage/digital-self-services/airline-apps | 768 | 45.2 % | 45.2 % | | open |
| 18 | /de/en/advance-seat-reservation | 1440 | 44.4 % | 44.4 % | tab panels (as stopover) | blocked: no de/en snapshot |
| 19 | /de/en/faq-data-security | 390 | 44.3 % | 44.3 % | the legal template lost every accordion: answers only, no questions | importer fixed (legal maps .accordion); xx/hk, pt, ru re-imported; de/en, de/de, at/de, gb/en need snapshots (4 pages each) |
| 20, 24 | /de/en/during-your-trip/internet-overview | 390, 1440 | 44.0, 42.5 % | 22.6, 13.9 % | re-import | done (item 2) |
| 21 | /de/en/prepare-for-your-trip/special-travel-needs/medical-travel-companions | 390 | 44.0 % | 44.0 % | ours taller at 390 | open |
| 23 | /de/en/articles/tags | 768 | 43.2 % | 2.5 % | pass 2 | done |
| 25 | /de/en/traveltricks | 390 | 42.1 % | 41.0 % | ours taller at 390 | open |
| 26 | /de/en/first-class-terminal | 768 | 41.8 % | 41.8 % | the image carousel and the rows 40-60 px lower on www (spacing) | open |
| 27 | /de/en/lufthansa-first-class-fleet | 1440 | 41.8 % | 41.8 % | | open |
| 28 | /de/en/special-meals | 1440 | 41.7 % | 9.4 % | re-import | done (item 2) |
| 29 | /de/en/overview-manage | 390 | 41.7 % | 16.5 % | spacious (pass 2) | done; but its 1440 went 6.6 -> 16.9 %: www's de/en rows are in a section (32 / 66 px), unlike xx/hk's: spacious taken off that document |
| 30 | /de/en/discover-lufthansa/new-onboard-experience | 390 | 41.4 % | 30.0 % | re-import | done (item 2) |

Fixed for item 4 (commits `05be2f7b` and `35039517`; tests first):
- the legal template maps `.accordion` (accordion-columns): the FAQ and conditions pages had lost
  every question. Re-imported and previewed where snapshots exist: xx/hk, xx/pt, xx/ru
  faq-data-security, faq-password-security, common/accessibility-statement,
  common/seatreservation-condtions/seat-reservations (10; xx/hk's seat-reservations and
  accessibility-statement held: their answers' inline links and a mailto link don't come through the
  accordion, open: importer). de/en, de/de, at/de and gb/en need snapshots of those 4 pages.
- the campaign template maps teaser rows straight in the page column
  (`:is(.section-content, .container-content) > .twocolumn`, as hub): take-off's ten cards were plain
  content. xx/hk, pt, ru re-imported; de/en, de/de, at/de, gb/en converted from DA's copies into the
  block the parser writes (cards-teaser spacious, two per row from 768 px).
- /de/en/overview-manage: `spacious` taken off (www's de/en rows are in a section).

Rows (not ours or blocked): stopover and advance-seat-reservation (no de/en snapshots of the tab
pages); first-class (held, Ben); flights (live data); overview-manage's share image
(`/etc/designs/dcep/logo-lh-og.jpg` on www, about:error on preview and live, before this package).
Open (ours, not reached): the 390 heights of doctor-on-board-news, business-class-on-short-and-medium-haul,
medical-travel-companions and traveltricks (ours 12-30 % taller), airline-apps at 768,
lufthansa-first-class-fleet at 1440, first-class-terminal's spacing.

## 5. Accessibility pass on lufthansa.com's top templates (aem.page)

axe-core 4.10.2 (npm, integrity checked; WCAG 2.0-2.2 A and AA) at 1440 and 390 on 31 de/en pages:
homepage; hub (baggage, overview-travel-information, services-on-board, special-needs, flights,
miles-and-more); info (flying-with-small-children, accessible-travel, travel-companion, hertz,
get-your-guide, tiere-als-handgepaeck); insights (articles, experience-nature, tags/kuala-lumpur,
living-in-oslo, schanzenviertel-hamburg, raleigh-nc-winter); campaign (100-years, culinaryjourney,
100-years/destinations, chronicle, munich-fair); form (feedback, best-price-alert,
feedback-past-flight, refund-form, anmeldung-tiere-frachtraum, feedbackai); flight-status
(timetable-and-flight-status). 25 pages without a violation at either width.

Fixed (commit `05be2f7b`, tests first):
- **aria-allowed-attr (critical)**, forms: `aria-required` on a required checkbox group's fieldset
  (not allowed on role group): now only on radio groups (special-needs, feedback-past-flight,
  refund-form, anmeldung-tiere-frachtraum; the form block of every brand).
- **link-name, target-size (serious)**, articles: www's empty links (`<a href="…">&#8203;</a>` before
  the real link) dropped by the importer, and removed from the 70 documents that had them (de/en 8,
  de/de 25, at/de 25, gb/en 8, xx/hk 2, xx/ru 1, ru/ru 1; uploaded and previewed).

Not changed, for Ben: **link-in-text-block (serious)**, refund-form: a link in small text is told apart
from the text by its colour only (2.76:1 against the text; 3:1 needed) and not underlined. That is
www's own style (`.richtext a` underlined on hover and focus only), which ours keeps; underlining
links in running text would change the look.

Preview paths of items 4 and 5, release order (no files first): `ema-cashub-preview-items45.txt` (88).
Checked on aem.page at 1440 and 390: take-off (de/en, gb/en, xx/hk), xx/hk faq-data-security,
xx/pt seat-reservations, overview-manage, experience-nature, freigepaeck-regeln: 200, every block
loaded, no overflow; DA equal to the local copies after the upload.

## Status at 18:20 UTC

Items 1-3 done; items 4 and 5 done as far as the inputs reach. Commits pushed (smoke of the 11 hosts
before and after each push): `bb42c99c`, `e5a46b2b`, `05be2f7b`, `35039517`, `92eb35d2` and this report.
After the last push the de/en sitemap answered differently on the three lufthansa.com hosts: it is
built from the published pages' index (nothing was published here; the push held importer code and
reports), so a publish or an index run elsewhere.

Notes:
- A service restart at about 12:15 UTC wiped `/tmp`: the archives (fetched and checked again), the
  offline importer copy and the parity staging (rebuilt). Work resumed at 15:50 UTC.
- main moves about six times an hour: the push loop gave up once (five suites, behind each time);
  `migration-work/brussels/push-loop-docs.sh` pushes when main moved by reports, documents or upload
  state only after the green suite (one more pull), and runs the suite again for anything else.
- An import run while the push loop's pull held its autostash used main's older importer files (the
  legal accordions came out missing); imports now wait for the chain.
- The DA token still worked at 18:00 UTC (no 401).

Open, in one place:
- Ben: /de/en/business-class and /de/en/first-class (held, item 2); link-in-text-block (item 5);
  the receipt service's config on the own host (item 1).
- Inputs: de/en snapshots of the 6 tab pages (reimport-tabs.txt) and of the 4 legal accordion pages
  for de/en, de/de, at/de, gb/en.
- Ours: the importer gaps (100-years/campaigns' sidebar image in the full import, xx/hk's accordion
  answers' inline links, add-fleet-metadata on roots without local documents); de/de's stage
  promotions; the 390 heights and spacings listed under item 4.
