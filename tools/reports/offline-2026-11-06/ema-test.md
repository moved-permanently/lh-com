# ema-test, offline package of 2026-11-06 (Austrian, B2B, Discover)

Running report, committed as I go. Nothing is published: documents are uploaded to DA and previewed
(`da-upload.mjs`), and checked on the aem.page preview hosts. Times in UTC.

## 1. Brief 427 (B2B round 3): done

- `af6a8973` fix(importer): the importers import without the excat plugin. `test/b2b-parity-418.test.mjs`
  failed in the go-live child's clean clone because `b2b-import.mjs` (and four other importers) loaded
  the plugin's `strip-scripts.js`, outside git, when imported. Now `tools/importer/excat-plugin.mjs`
  loads it when it is there; the one test that really strips scripts skips without it. Checked in a
  fresh clone of origin/main with `npm ci`: 350 files pass with the plugin, 351 (one case skipped)
  with `EXCAT_MARKETPLACE` pointing nowhere. `library-entries` passes there too; it fails only in my
  workspace, against my stale untracked `content/library` copy.
- `cf906784` fix(b2b): rows 25-28 of `tools/reports/b2b/parity.md` (www's column-view spacing, the 16:9
  video beside text, the cards' copy, a stage outside a column), B2B-scoped CSS only, no document
  changed. Against b2b-parity-001 (1440 / 390): homepage -236 / -73 -> -19 / +41 px, Product & Service
  News -116 / +213 -> +26 / -4, the article +169 / +207 -> +33 / +71, de/de contact +46 / +473 -> -118 /
  -62.
- Checked: the 26 B2B pages at 1440 and 390 locally and on main--lh-b2b--moved-permanently.aem.page
  (equal); lufthansa.com's stage unchanged; smoke of the 12 hosts before and after each push, 0
  differences; builds green.
- Preview paths: none (no document changed).
- Open (item 3): contact's hotline hours and Corporate -> Passenger Receipts gaps, de/en contact's
  missing column marker, celebrating-shared-stories, the news overview, the airlines page at 390.

## 2. Austrian, deeper visual parity (austrian-parity-002)

Archive: `austrian-parity-002a.tar.gz` (sha256 `ea26c50e…9527`, checked; 31 pages). 002 and 002b not in the
drop yet at 08:25 (polled every 15 min, see the end). Compared at 1440 and 390 against
austrian.turnsthe.page and main--lh-austrian--moved-permanently.aem.page (equal on every page).

### 2a. Headings in Portada again (shared, brand-neutral)

- Every heading of 213 Austrian documents drew in LufthansaHead, not Portada: lh-com's cleanup gives a page
  whose www loads the digital assistant the metadata "Theme: digital-assistant", and `styles/styles.css`
  set the LufthansaHead face of lufthansa.com's assistant stylesheet on `body.digital-assistant`, over the
  brand theme. The same documents exist on lh-brussels (467) and lh-swiss / lh-swiss-mk (22): their
  headings lose Intelo / SWISS's face the same way.
- Fix: the rule is lufthansa.com's, now `body.brand-lufthansa.digital-assistant`
  (`test/digital-assistant-brand.test.mjs`). Checked locally: Austrian's h1 Portada (loaded), lufthansa.com's
  digital-assistant page still in its face. For ema-lufthansa (Brussels) and ema-adobe (SWISS): your
  digital-assistant pages get your theme's heading font back with this commit.

### 2b. Components and type of the deeper pages (importer, theme, 42 documents)

- 002b arrived 09:06 (sha256 `a79e58fa…3454`, checked; 29 pages); compared with 002a: 60 pages x 2 widths.
- `663b69a0` feat(austrian) and `e441c469` (bundles rebuilt after the rebase): Austrian templates for the
  check-in and flight-status pages (info's mappings plus their block), the teaser cards' link line, two-up
  card rows, the intro (copytext-large), the default h3 / h4, the lists. Rows 29-43 in
  `tools/reports/austrian/parity.md`.
- Documents (release order; no files): the 42 paths in `tools/reports/austrian/preview-paths-002.txt`,
  re-imported from the Austrian snapshots, read from DA first and rechecked unchanged before the upload,
  uploaded and previewed (`da-upload.mjs --site lh-austrian`: 46 uploaded, 0 problems), DA equal to local
  afterwards. Not published.
- Restored: four tab pages (missing-baggage, travelling-with-animals, unterhaltung-an-bord, austrian-app):
  their re-import lost the Tab rows of a grey band's section (lh-com's sections transformer now makes Tab
  sections itself, 515475be, besides Austrian's markers), so the content after the band showed under every
  tab. Uploaded again from their DA versions before mine and previewed: as they were. For ema-cashub: the
  interplay of lufthansa-sections.js's Tab sections with swiss-import.mjs's tab markers (row 43).
- Not uploaded: culinaryjourney (today's import drops its micro-frontend block) and new-destinations (its
  poi maps sit in accordion items, today's accordion parser keeps them inside): row 42.
- Checked on main--lh-austrian--moved-permanently.aem.page at 1440 and 390 (all 60 measured, the
  changed ones side by side with www): familien's two-up cards with link lines, online-check-in's steps,
  accordion and card row, Portada intros, CoreSans h3 / h4, the lists 5 px apart.
- Open (rows 36-43): steps in a tab panel, culinary-services' expanding panels and stage, QR / badge
  pairs, giftvoucher's icon steps, a card row's grey band, the two not uploaded, the tab pages.
- Rollback: `git revert e441c469 663b69a0` (and the documents: DA's versions before 11:00 UTC; the
  originals read at 08:30 / 09:30 are in /tmp/s407/da-orig until this machine restarts).
