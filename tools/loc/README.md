# Translation and rollout in Document Authoring (lh-com)

On www, de/de is a translation of the English source, at/de a rollout of de/de and gb/en a rollout
of the English. In Document Authoring authors work the same way with the localisation app
(da.live/apps/loc, code: adobe/da-nx `nx/blocks/loc`):

```
/de/en  ──translate (Google)──▶  /de/de  ──rollout──▶  /at/de
   └──────────rollout──────────▶  /gb/en
```

Files here:

| File | What it is |
|---|---|
| `translate.json` | the app's configuration, to upload as the DA document `/.da/translate.json` of the site (an admin uploads it; tools never write site-wide documents) |
| `check-config.mjs` | runs the app's own code (pinned commit, downloaded to a temp folder) on `translate.json` and on lh-com pages; report `tools/reports/loc-config-check.md` |
| `regional-diff.mjs` | what a rollout would replace: DA sources of /at/de against /de/de and /gb/en against /de/en; report `tools/reports/loc-regional-diff.md` |
| `link-step.mjs`, `link-lib.mjs` | makes a target locale's links its own after a rollout or a translation; dry run report `tools/reports/loc-link-step.md` |
| `slug-step.mjs`, `slug-lib.mjs`, `slug-map.json` | moves German translations onto the 72 pages with their own German slug; dry run report `tools/reports/loc-slug-step.md` |
| `clear-review.mjs` | removes a target page's `da-metadata` block (the review record) after a review: labelled DA version first, read-back after, dry run by default |
| `block-check.mjs`, `review-lib.mjs` | read only: every heading, paragraph, image and block of a target's copy from before a step that is missing after it |
| `marker-check.mjs` | read only: the style markers (`{caption}`, `{heading-small}`, `{divider-25}` …) of each translated page against its English source; report `tools/reports/loc-marker-check.md` |
| `da-nx.mjs` | loads the app's code at the pinned commit for check-config and the slug step |

All line numbers below are adobe/da-nx at `f0c63255` (`nx/blocks/loc/…`), the commit the scripts pin;
`nx/blocks/loc` is unchanged at `52201f9`.

The tools read and write DA from a terminal with your login: set `DA_TOKEN` to an Adobe IMS
access token with access to `moved-permanently/lh-com`, and every call sends
`Authorization: Bearer $DA_TOKEN`; the tools never print it. Without it DA answers 401, except
where the login is added for the tools. A refused token (401/403) stops the tool with that
message.

```sh
read -rs DA_TOKEN && export DA_TOKEN      # paste, Enter: not echoed, not in the shell history
```

## Before every run

1. **A copy of every page the project writes.** For each target page (`/de/de/…`, and `/at/de/…`,
   `/gb/en/…` for a rollout; for the 72 own-slug pages both `/de/de/<english slug>` and the German
   page): a labelled DA version (label e.g. `before loc 2026-10-28`; the same call the app makes
   for its versions, project/index.js 126-128) and a local copy, kept outside the repository:

   ```sh
   d=~/loc-backup/$(date +%F); label="before loc $(date +%F)"
   for p in /de/de/kinder-an-bord /at/de/kinder-an-bord; do
     curl -sf --create-dirs -o "$d$p.html" -H "Authorization: Bearer $DA_TOKEN" \
       "https://admin.da.live/source/moved-permanently/lh-com$p.html" || { echo "not in DA: $p"; continue; }
     curl -sf -X POST -H "Authorization: Bearer $DA_TOKEN" -d "{\"label\":\"$label\"}" \
       "https://admin.da.live/versionsource/moved-permanently/lh-com$p.html" >/dev/null || echo "no version: $p"
   done
   ```

   The app saves a version of its own (project/index.js `saveVersion` 122-132, label
   `<project> - Rolled Out`), but only **after** it wrote the page (232, 292, 351): it holds the
   new state, not the one to go back to.
2. **Which pages.** Never in a project: pages with a form (the form block's column 5 holds option
   keys such as `airport=` that Google would translate: `feedback`, `group-travel`,
   `register-animal-cabin`, `refund-form`, `register-ammunition`, … all pages with a `form`
   block), the nav and footer documents, the homepage, the flight search
   (`/de/en/flight-search`), the Message Center anchor page
   (`/prepare-for-your-trip/current-travel-information`), and `/lhg/`, login and profile pages.
3. **Nothing else writes those pages while the project runs**: the migration's uploads
   (`da-upload.mjs`) and previews stay off them until the marks are resolved.
4. **Open the app in a fresh tab** (da.live/apps/loc): it keeps the first site's `translate.json`
   for the tab's lifetime, whatever site you choose later (utils/utils.js `fetchConfig` 205-206:
   one cache, not keyed by site).

## For authors

### A translation project (English → German, and on to Austria)

1. Edit the English page under `/de/en`.
2. "Before every run" (above): versions and local copies of the target pages, the page list.
3. Open da.live/apps/loc in a fresh tab, choose the site, **New project**, add the **`/de/en/…`
   URLs** (only `/de/en` ones, see "Limits").
4. Validate: each URL must exist; uncheck the ones marked "not found" (validate.js 98-116, 147).
   Fragments linked from a page are only added when their link is absolute on lh-com's hosts
   (`source.fragment.hostnames`, validate.js 58-66): add relative `/fragments/` links yourself.
5. Options: **German → Translate** (Google), and **English → Rollout** only if `/gb/en` should
   get the English change too. Every language starts on **Skip** (the first action of its row is
   preselected, options/utils/utils.js 139-149; `translate.json` lists Skip first), so a project
   does only what you pick. Check that every conflict setting on Options says **merge**.
6. The app sends the pages to Google and saves the German pages to `/de/de/<same path>`
   (translate/index.js 106). With `merge` an existing German page is not replaced: the
   differences are marked in it (see "What merge does").
7. **Check every target page in DA** against your copy (see "What merge does": the app can show
   Complete after a failed write, and a failed read of a target turns merge into overwrite), and
   run the **block check** for each (below). A missing item means: stop and restore that page.
8. Pages with their own German slug (72, e.g. `/de/en/children-on-board` = `/de/de/kinder-an-bord`):
   run the **slug step** now (below); until then their translation sits at
   `/de/de/children-on-board`. Then the **link step** `--from de/en --to de/de --page …` over the
   translated pages (below): every translated page comes back with absolute aem.page links to
   `/de/en/…`. Then the **marker check** over the same pages (below).
9. **Resolve the German marks** in DA (accept or reject each difference) before anything else is
   sent from or into those pages. Review the metadata block separately, row by row: accepting an
   incoming metadata block brings the English page's values (canonical, theme, paths: the keys
   that are not translated keep the English value). Never preview a page that still has marks.
   Then **clear the review record** of each reviewed page (`clear-review.mjs`, below) before
   anything is sent into it again.
10. Rollout to `/at/de`, only now: the rollout refuses a source page that still has marks
    (rollout/index.js 41-46). The German row shows **Ready** (rollout/index.js 184-198); the
    project's URLs are the `/de/en/…` ones. **Not for the 72 own-slug pages yet** (the app reads
    `/de/de/<English path>`, which the slug step removed: see "Limits"). Same checks as in 2 and 7
    for the at/de pages (the block check included), then the **link step** `--from de/de --to at/de --page …`.
11. Resolve the at/de marks and clear their review records, then preview and publish as usual.
    The app never previews or publishes.

### A rollout only (a market keeps its edits)

"Before every run" applies here too (versions and copies of the market's pages).

- English to gb/en: a project with the `/de/en/…` URLs, **English → Rollout**, German → Skip.
- German to at/de: a project with the **`/de/en/…` URLs of the pages** (the app reads
  `/de/de/<same path>`, rollout/index.js 107-120), **German → Rollout**, English → Skip. This
  works for pages whose German path equals the English one; the 72 pages with an own German slug
  cannot be rolled out to at/de by the app yet (see "Limits"). The German pages must have no
  unresolved marks (rollout/index.js 41-46).
- Afterwards: check every target page in DA and run the block check, the link step for the pair
  with `--page`, resolve the marks and clear the review records, then preview.

### What merge does

`merge` is the first value of every `*.conflict.behavior` row, so it is the default of each
project (options/utils/utils.js 92-96). On save the app compares the incoming page with the page
already at the destination (project/index.js `mergeCopy`, 306-357):

- no page there yet (or an empty one): the incoming page is written as it is (314-316, 354-356);
- the same content: nothing is saved (326-330);
- otherwise both versions stay in the document, marked: the incoming (upstream) content as
  `da-diff-deleted`, the market's own (local) content as `da-diff-added`
  (regional-diff/regional-diff.js `regionalDiff`, 482-500). The author accepts or rejects each one
  in the DA editor. The page's DA metadata (the differences already accepted or rejected) is
  read and saved again (332-348).

Unresolved marks:

- they stop a send **from** that page only: a translation or rollout refuses a source page with
  marks (translate/index.js 61-66, rollout/index.js 41-46);
- a second send **into** a page that still has marks is not refused: the merge first removes the
  marks of the target, keeping its local side and dropping its pending incoming blocks
  (project/index.js 323, regional-diff.js `removeLocTags` 460-480), then marks the new
  differences. What the author had not accepted yet is gone. Resolve before the next project.

The app's status is not proof that a page was written:

- a failed write leaves no error the rollout view counts (project/index.js 225-228, 348-353 set
  the page's status, rollout/index.js 89-101 counts `url.error`), so the language shows
  **Complete** (172-173: "no errors means success");
- a failed **read** of the target (any error, not only a missing page: project/index.js
  `getHtml` 147-158) makes merge write the incoming page over it (312-316, 354-356 →
  `overwriteCopy`): the market's page is replaced, not merged.

So after every run open every target page in DA and compare it with the copy from "Before every
run", with the block check (below).

### The review record and the block check (after every review and every app step)

DA's editor keeps the hashes of the incoming blocks a reviewer accepted or rejected in the target
page's `da-metadata` block (`acceptedHashes`, `rejectedHashes`), and the next merge reads them
(project/index.js 332-343). A rejected incoming block that equals one of the page's own blocks
apart from its id (a heading: the page's has an id, the incoming one none) has the same hash, so
the next merge drops the page's own block without a mark (regional-diff/regional-diff.js 434-438:
a local block whose hash is rejected is skipped). The supervised test run of 2026-10-27 lost the
German H1 of `/de/de/book-and-manage/rebook` this way (restored). Until it is fixed in the app:

```sh
node tools/loc/clear-review.mjs --page /de/de/book-and-manage/rebook            # dry run: the rows
node tools/loc/clear-review.mjs --page /de/de/book-and-manage/rebook --apply    # remove the block
node tools/loc/block-check.mjs --before ~/loc-backup/2026-10-28/de/de/book-and-manage/rebook.html \
  --after /de/de/book-and-manage/rebook                                          # after each step
```

- **clear-review** after each review, before anything is sent into that page again: it takes a
  labelled DA version (`before clear-review <date>`), writes the page without its `da-metadata`
  block and reads it back (no block left, the rest unchanged). Blocks the author kept local are
  marked again in the next round, as they already are.
- **block-check** after every app step (translation, rollout, sync) on every target: it compares
  the copy from "Before every run" (or a DA path) with the read-back and lists every heading,
  paragraph, image and block that is missing after the step. Heading ids, `<p>` in metadata
  cells, `<source>` in pictures and the `da-metadata` block are ignored; content only inside an
  incoming mark (`da-diff-deleted`) counts as missing (it goes when that block is rejected). A
  missing item means: stop and restore the page from its labelled version or the local copy.
  Exit code 1 when something is missing; `--pair <before> <after>` repeats for several pages.

`overwrite` replaces the destination page; sheets (`.json`) are always overwritten
(translate/index.js 111, rollout/index.js 78).

A rollout copies links as they are (no link rewriting: project/index.js `saveHtml` 197-201 passes
`replaceRelative: false`). The market pages link to their own market (`/gb/en/…`, `country=GB`);
the source page links to `/de/en/…`. So a rollout with merge marks those links as differences:
**keep the local side**, or run the link step after the rollout (below), which makes the incoming
links the market's too. With overwrite the market's links would point at the source market until
the link step runs. Of the 910 gb/en pages that are otherwise identical to de/en, 904 differ only in
that way (regional differences report).

### The link step (after every rollout and translation)

```sh
node tools/loc/link-step.mjs --from de/de --to at/de --page /at/de/gepaeck          # dry run
node tools/loc/link-step.mjs --from de/de --to at/de --page /at/de/gepaeck --apply  # write
node tools/loc/link-step.mjs --from de/en --to gb/en                     # dry run, all gb/en pages
node tools/loc/link-step.mjs --from de/en --to de/de --page /de/de/x --apply   # after a translation
node tools/loc/link-step.mjs --all                  # dry run of the three pairs: the report
```

On each page of the target locale (the `--page` ones, else every page of that locale in
`tools/migration-scope/pages.csv`). **`--apply` writes only the `--page` pages**: give the pages
the project wrote. Without `--page` it stops; `--all-pages --apply` (every page of the locale)
prints the page count and needs `--yes` as well. Don't use it: 87 at/de and 89 gb/en pages hold
www's links into `/de/de` and `/de/en`, and they stay until those pages' own rollout.

- links to the site's own hosts (`main--lh-com--moved-permanently.aem.page`/`.aem.live`,
  `lhcom.bbird.live`, `lhedge.bbird.live`) become root-relative – the app writes aem.page links into
  every translation (dnt.js 46-52) and a merge aem.live ones (regional-diff.js 103-117);
- a link into the source locale (`/de/de/<x>` in an `/at/de` page, `/de/en/<x>` in a `/gb/en` or
  translated `/de/de` page) becomes the target locale's page of `<x>`, from the `pages.csv` row
  that holds it (own German slugs included: `/de/en/flight-search` → `/de/de/flugsuche`); the
  metadata Parent link too, text included;
- a link into the source locale without a counterpart in the target locale stays as it is and is
  listed; links to other hosts (www.lufthansa.com, partners) and anchors stay.

Links inside merge marks are changed like all others; the marks stay for the author. Dry run by
default; `--apply` writes the changed pages only (and reads them back); `--root /drafts/loc-test`
works on copies below that folder; `/lhg/`, login and profile pages are refused. It never
deletes, previews or publishes. Running it twice changes nothing the second time.

The dry run over DA today (`tools/reports/loc-link-step.md`) finds cross-locale links already in
the imported content: 87 at/de pages link into `/de/de` and 89 gb/en pages into `/de/en` (www's
own articles do: e.g. www's at/de "7 people" article links to `/de/de/articles/…`); 2 translated
de/de pages hold a `/de/en` link.

### The slug step (after a translation into /de/de)

The app writes the German translation of `/de/en/<path>` to `/de/de/<path>`. 72 pages have their
own German slug (`slug-map.json`, from `tools/migration-scope/pages.csv`). Run, from the repo:

```sh
node tools/loc/slug-step.mjs                     # dry run: what it would do for all 72
node tools/loc/slug-step.mjs --page /de/en/flight-search            # one page
node tools/loc/slug-step.mjs --page /de/en/flight-search --apply    # write
```

For each page with a translation at `/de/de/<english slug>` it:

1. turns the translation's links into German ones: the app makes every root-relative link an
   absolute `https://main--lh-com--moved-permanently.aem.page/…` link (dnt/dnt.js `resetHrefs`,
   46-52, run by `removeDnt` on every translation; a merge then makes them `.aem.live`,
   regional-diff.js `normalizeLinks` 103-117) – the step makes them root-relative again and turns
   `/de/en/<x>` into `/de/de/<German slug of x>` (Parent row included); links to pages without a
   German page in the scope stay and are listed;
2. sets `primary-language-url` to the English page (what `helix-sitemap.yaml` pairs translated
   slugs by; the German pages carry it today);
3. writes it to `/de/de/<german slug>`: moved when there is no German page yet, otherwise merged
   with **the app's own merge** (the same `regionalDiff` as above, downloaded at the pinned
   commit; the German page's DA metadata, its accepted and rejected differences, goes into the
   merge and is saved again, as `mergeCopy` does), or replaced with `--behavior overwrite`;
4. deletes the copy at `/de/de/<english slug>`.

The 72 own-slug pages: translation and slug step yes; the at/de rollout not yet (see "Limits").

It never touches a page whose German slug equals the English one, never removes a path that is
another page's German page (`conflict`), and never previews or publishes. `--root /drafts/loc-test`
runs it on copies below that folder; `--simulate` (dry run only) uses the English page as the
translation to show the work before any project ran.

The slug step uses the link step's fix (`link-lib.mjs`) for the page it moves. Translated pages
whose slug did not change are the link step's (`--from de/en --to de/de`).

### The marker check (after a translation)

The authoring markers (`Ticket refunds {heading-medium}`, `{caption}`, `{divider-25}`,
`{full-width}` …, the site's README "Authoring conventions") are text: they go to Google like any
text, and the site only reads them **exact and at the end of the text** (a separator: a
paragraph of its own; `scripts/scripts.js` 198-205). `{Bildunterschrift}`, `{Copytext-klein}` or
a marker moved to the start of the sentence show as text on the page.

```sh
node tools/loc/marker-check.mjs --page /de/en/children-on-board   # the project's English URLs
node tools/loc/marker-check.mjs                                   # every page: the report
```

For each English page it reads the translation (an own-slug page at `/de/de/<english slug>`
while it sits there, else at its German page) and lists every marker of the English page that
**changed** (another brace text in its place), is **not read** (the same text, not where the site
reads it) or **vanished**, and markers the translation has but the English page not (**added**).
Markers inside merge marks count: an incoming block (`da-diff-deleted`, what you accept) is
checked like the page; the page's own local blocks are left out. Read only (a dry run; `--apply`
is refused); `--root /drafts/loc-test` for copies. Fix the markers in DA when you resolve the marks.

Today's report (`tools/reports/loc-marker-check.md`, before any project) is a baseline: the German
pages are still www's own, and 75 of 968 differ from the English page where www's pages differ
(other spacers, an extra heading style). Compare a page's findings with it.

## The configuration (`translate.json`) and the code it relies on

`check-config.mjs` runs these functions of the app on the file; all checks pass
(`tools/reports/loc-config-check.md`).

### `config`

| key | value | code |
|---|---|---|
| `source.language` | `English` | the row whose `location` (`/de/en`) is every project's source (options/utils/utils.js 107-112 `formatConfig`; validate.js 137-143; translate/index.js 150, rollout/index.js 157, sync.js 32) |
| `source.language.detect` | `true` | **not read at f0c63255** (nor on main): it comes with da-nx PR #870 (open, stacked on #793). Once both are released a project takes its source from its URLs: `/de/en/…` URLs offer the English rollout and the German translation, `/de/de/…` URLs the German rollout only. Until then the row is ignored (#870: "Without it, nothing changes") |
| `translate.conflict.behavior` | `merge, overwrite` | first value is the project default (options/utils/utils.js 92-96); used in translate/index.js 134, 111. Merge keeps the existing German pages (www's translations) instead of replacing them with machine translation |
| `rollout.conflict.behavior` | `merge, overwrite` | rollout/index.js 158, 76-81: market edits survive |
| `copy.conflict.behavior`, `sync.conflict.behavior` | `merge, overwrite` | translate/index.js 149; sync.js 55 |
| `translation.service.name` | `Google` | the connector folder (translate/index.js 10-14: `connectors/google`); Google sends `fromlang=en`, `tolang=<code>` (connectors/google/index.js 25-26) through DA's translate proxy (29), no keys |
| `translation.service.all.env` | `prod` | options/utils/utils.js 92-96, 179-187 |
| `translation.service.prod.origin`, `.link` | `https://translate.da.live/google`, Google's docs | formatService (35-51); the Google connector calls DA's proxy constant, these are informative |
| `source.fragment.hostnames` | `main--lh-com--moved-permanently.aem.live, lhcom.bbird.live` | validate.js 58-66: absolute fragment links on these hosts are added to a project |

### `languages`

| name | code | source | location | locales | actions |
|---|---|---|---|---|---|
| English | en | | `/de/en` | `/gb/en` | Skip, Rollout |
| German | de | `/de/en` | `/de/de` | `/at/de` | Skip, Translate, Rollout |

- `name`: matched by `source.language` (options/utils/utils.js 53-63).
- `code`: the target language for Google (connectors/google/index.js 26, 78); unique, the views
  match rows by it (options.js 379, rollout.js 57).
- `location`: where a translation is saved (translate/index.js 106) and where a rollout reads
  from (rollout/index.js 107-120).
- `locales`: comma list of full path prefixes; a rollout writes `<locale><path>`
  (rollout/index.js 122-142; options/utils/utils.js 151-164, all active without a
  `default locales` column).
- `actions`: the first is preselected (aem.live, "Translation projects": "the first one listed is
  the default"), Skip is added when missing (options/utils/utils.js 139-149). Skip comes first, so
  no project rolls out or translates a language unless the author chooses it.
- `source`: today the folder a row's translation reads from (translate/translate.js 133-149;
  `/de/en`, the same as the default); with #793/#870 also the root that offers the row's
  Translate. The German row's `location` (`/de/de`) is then the root of its rollout.
- No `source language` column: that chains a translation after another one (options/utils/utils.js
  166-173, translate/index.js 190-285), not a rollout. The sample's `translate type` column is
  read nowhere and left out.

### `custom-doc-rules` (what does not go to Google)

Rules per block class (dnt/dnt.js 87-96; grammar dnt/parseQuery.js; matching is case-insensitive,
dnt/decorateTable.js 25-27):

- `metadata`: only `Title`, `Description`, `og:title`, `og:description`, `Keywords`,
  `Breadcrumb title`, `Parent title`, `card-image-alt`, `author-description`, `reading-time`,
  `tags` are translated (the keys that differ between /de/en and /de/de today); paths, ids, dates,
  `category`, `author`, `page-type`, `Theme`, robots and the other keys stay.
- `section-metadata`, and the blocks that hold only codes or links (`blog-overview`, `car-rental`,
  `embed`, `micro-frontend`, `search-results`, `stage-promotions`): not translated.
- key | value blocks (`price-bar`, `flight-search`, `destination-finder`, `booking-lookup`,
  `fare-teaser`, `flight-status`, `destination-offer`): the key column stays (the blocks read it),
  and the value of keys that hold codes (Destination, Origin, Airlines, Trip duration, …).
- `poi-map`: the key cells, the Source/Tiles rows and the coordinates stay; place names, captions,
  labels and link texts are translated. A rule with `unless` was tried and dropped: decorateTable
  then marks the whole row (check-config's synthetic tables show it).
- `carousel-images`, `carousel-lightbox`: the label keys; `hero-banner`: the Overlay row.
- `form`: the header row, the columns Type, Name, Required and Rules, and the `config` rows. The
  option keys in column 5 (`airport=` …) are translated all the same: form pages stay out of
  projects ("Before every run").

Alt texts are translated, except a URL at their start; link texts that are URLs are not
(dnt/processAltText.js 7-45); `code` elements never (dnt.js 5).

### `dnt-sheet-rules`

URLs in sheets are not translated (the zero-config default).

### Not used: `dnt-content-rules`

The app wraps the matches of a content rule via `contentMatches?._value?.nodes` (dnt/dnt.js
58-64). Browsers' `XPathResult` has no `_value` (checked in Chromium), so content rules do nothing
in the app today; brand names (Lufthansa, Miles & More, Allegris, Travel ID, HON Circle) rely on
Google keeping them. Review them in the merge.

## Switching to GlobalLink (Lufthansa's service today)

DA's GlobalLink connector (`connectors/globallink`) needs Adobe-side onboarding (DA's translate
proxy allowlist) and TransPerfect credentials (stored through da-etc, never in this file); lh-com
has neither, so the demo uses Google. The rows that would change:

| key | value |
|---|---|
| `translation.service.name` | `GlobalLink` (loads `connectors/globallink`, translate/index.js 10-14) |
| `translation.service.prod.endpoint` | the GlobalLink API base (connector 43-53: sent as `x-globallink-origin` to DA's proxy) |
| `translation.service.prod.projectId` | the GlobalLink project id (connector 318-337) |
| `translation.service.prod.fileFormatName` | the GlobalLink file format (connector 366) |
| `translation.service.prod.dueDateDays` | optional, days until due (default 7; connector 14, 762) |
| `translation.service.custom.<type>.<name>` | optional project attributes (options/utils/utils.js 65-82; connector 285-296) |

Remove `translation.service.prod.origin`/`.link`; the languages, conflict behaviours and DNT rules
stay. GlobalLink's language codes may need the region (`de-DE`): `code` is sent as the target.

## Limits (today's app, f0c63255)

- **Only `/de/en` URLs in a project.** A URL outside the source folder sends the project to the
  sync view (options/utils/utils.js 20-21), which copies it into `/de/en` + its full path
  (`/de/de/x` → `/de/en/de/de/x`, sync/index.js 16 and utils.js 104-107). Never add `/de/de`,
  `/at/de` or `/gb/en` URLs until #793/#870 are released.
- **No at/de rollout for the 72 own German slugs**: the German rollout reads `/de/de/<English path>`
  (rollout/index.js 107-120), which does not exist for them. With #793/#870 a project with the
  `/de/de/<german slug>` URLs rolls them out.
- **Links**: the app leaves absolute aem.page links in translations (dnt.js 46-52) and copies a
  rollout's links as they are: the link step (above) fixes both. External links that carry the
  market in their query (Travel ID's `state=/de/de/…&country=DE`) are not changed by it.
- Google is called with `fromlang=en` always (connectors/google/index.js 25).
- **No form pages**: the form block's option keys (column 5, `airport=` …) are text Google would
  translate, and the form would send the translated keys.
- **Style markers** are translated like text: the marker check (above) finds the broken ones.

## Pages safe for a first test

- **Rollout, no change at all** (identical byte for byte in DA, so merge saves nothing):
  `/good-for-train`, `/book-and-manage/trip-management`, `/lufthansa-city/culinaryjourney`,
  `/articles/authors`,
  `/prepare-for-your-trip/special-travel-needs/travel-with-needs/special-needs-online-form/confirmation`
  (de/en → gb/en and de/de → at/de). Not `/prepare-for-your-trip/current-travel-information`:
  it is the Message Center's anchor page.
- **Translation that creates only a new document**: one of the 72 own-slug pages without a form,
  e.g. `/de/en/children-on-board` (text and images, one link, one `{limited-width}` marker) → the
  app writes the new `/de/de/children-on-board` (no page there, checked 2026-10-27; not another
  page's German path); `/de/de/kinder-an-bord` is untouched until you run the slug step with
  `--apply`. Then the marker check with `--page /de/en/children-on-board`.
- **Slug step**: `--root /drafts/loc-test` on copies (the folder was deleted on 2026-10-27; copy
  the pages there first, and never preview `/drafts/`).
