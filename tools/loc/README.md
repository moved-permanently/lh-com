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
| `check-config.mjs` | runs the app's own code (pinned commit, downloaded to a temp folder) on `translate.json` and on lh-com pages; report `tools/reports/loc-config-check.md` (`--config <file>`: the gc rows, `tools/reports/loc-config-check-gc.md`) |
| `setup-lib.mjs` | the setup of a `translate.json` (its languages rows): the source, the German translation, the pairs of every rollout; the link, slug and marker steps, regional-diff and check-config take it with `--config <file>\|da` (default the repo copy; `da`: DA's `/.da/translate.json`, read only) |
| `regional-diff.mjs` | what a rollout would replace: each rollout pair of the setup, the market's DA sources against the rollout's source (today's rows: /at/de against /de/de, /gb/en against /de/en, report `tools/reports/loc-regional-diff.md`; the gc rows: /de/en and /gb/en against /gc/en, /de/de and /at/de against /gc/de, `tools/reports/loc-regional-diff-gc.md`); `--pages <file or comma list>` for some pages (to stdout) |
| `link-step.mjs`, `link-lib.mjs` | makes a target locale's links its own after a rollout or a translation; dry run report `tools/reports/loc-link-step.md` |
| `slug-step.mjs`, `slug-lib.mjs`, `slug-map.json` | moves German translations onto the 72 pages with their own German slug; prints the at/de rollout project's URLs (`--rollout-urls`); dry run report `tools/reports/loc-slug-step.md` |
| `clear-review.mjs` | with `--linked-images`: removes the mark of links around a picture before a rollout; without: removes a page's `da-metadata` block (the review record) on purpose. Labelled DA version first, read-back after, dry run by default |
| `block-check.mjs`, `review-lib.mjs` | read only: every heading, paragraph, image and block of a target's copy from before a step that is missing after it |
| `marker-check.mjs` | read only: the style markers (`{caption}`, `{heading-small}`, `{divider-25}` …) of each translated page against its English source; report `tools/reports/loc-marker-check.md` |
| `da-nx.mjs` | loads the app's code at the pinned commit for check-config and the slug step |

All line numbers below are adobe/da-nx at `69006f3b` (release 1.29.1, 2026-10-29; `nx/blocks/loc/…`),
the commit the scripts pin and da-nx `main` on 2026-11-01. The merge is still in
`nx/blocks/loc/regional-diff/`.

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
   for the tab's lifetime, whatever site you choose later (utils/utils.js `fetchConfig` 275-276:
   one cache, not keyed by site).

## For authors

### A translation project (English → German, and on to Austria)

1. Edit the English page under `/de/en`.
2. "Before every run" (above): versions and local copies of the target pages, the page list.
3. Open da.live/apps/loc in a fresh tab, choose the site, **New project**, add the **`/de/en/…`
   URLs** (one folder per project, see "Limits"). A mix of `/de/en` and `/de/de` URLs is refused
   with a message naming the URLs to uncheck (validate.js 161-170, 191-192; utils/utils.js
   `formatMixedRootsError` 340-350).
4. Validate: each URL must exist; uncheck the ones marked "not found" (validate.js 106-124, 184).
   Fragments linked from a page are only added when their link is absolute on lh-com's hosts
   (`source.fragment.hostnames`, validate.js 66-104): add relative `/fragments/` links yourself.
5. Options: every row starts on **Skip** (the first action of its row is preselected,
   options/utils/utils.js 199-203; `translate.json` lists Skip first), so a project does only
   what you pick. Pick **German → Translate** (Google), and **English → Rollout** only for
   `/gb/en`. Then **click `/at/de` off the German row**: otherwise German Rollout in this project
   reads `/de/de/<English path>` (rollout/index.js 112-125); before the slug step it would write
   the machine translation to `/at/de/<English path>`, after it the rollout stops with Not found
   (36-42). Check that every conflict setting on Options says **merge**.
6. The app sends the pages to Google and saves the German pages to `/de/de/<same path>`
   (translate/index.js `getSaveDestPath` 107-117). With `merge` an existing German page is not
   replaced: the differences are marked in it (see "What merge does").
7. **Check every target page in DA** against your copy (see "What merge does": the app can show
   Complete after a failed write, and a failed read of a target turns merge into overwrite), and
   run the **block check** for each (below). A missing item means: stop and restore that page.
   A project opened again later can show **Saved 0**: don't use its Get status (see "Three things
   the app does today").
8. Pages with their own German slug (72, e.g. `/de/en/children-on-board` = `/de/de/kinder-an-bord`):
   run the **slug step** now (below); until then their translation sits at
   `/de/de/children-on-board`. Then the **link step** `--from de/en --to de/de --page …` over the
   translated pages (below): every translated page comes back with absolute aem.page links to
   `/de/en/…`. Then the **marker check** over the same pages (below).
9. **Resolve the German marks** in the DA editor (see "What merge does") before anything else is
   sent from or into those pages. Review the metadata block separately, row by row: accepting an
   incoming metadata block brings the English page's values (canonical, theme, paths: the keys
   that are not translated keep the English value). Never preview a page that still has marks.
10. **Rollout to `/at/de`, only now, from a project of its own** with the **`/de/de` URLs**: the
    German slug for the 72, the same path for the rest. `slug-step --rollout-urls` prints them
    (below). "Before every run" applies (versions and copies of the at/de pages), and
    `clear-review --linked-images` over those `/de/de` pages (below). Options show a **Source**
    card `/de/de` (options.js 442-447) and only **German, with Rollout and Skip**
    (options.js `detectSource` 72-93, options/utils/utils.js `filterLangsBySource` 167-188):
    pick Rollout. The German row shows **Ready** (rollout/index.js 195-209, 14); the app reads
    `/de/de/<path>` and writes `/at/de/<same path>` (112-147), and refuses a source page that still
    has marks (46-51). Same checks as in 2 and 7 for the at/de pages (the block check included),
    then the **link step** `--from de/de --to at/de --page …`.
11. Resolve the at/de marks, then preview and publish as usual. The app never previews or
    publishes.

The 72 own-slug pages go the same way: translation, slug step, link step, review, then the at/de
rollout project like every other page.

### A rollout only (a market keeps its edits)

"Before every run" applies here too (versions and copies of the market's pages), and
`clear-review --linked-images` over the project's source pages before every rollout (below).

- English to gb/en: a project with the `/de/en/…` URLs, **English → Rollout**, German → Skip.
- German to at/de: a new project with the **`/de/de` URLs** (the German slug for the 72, the same
  path for the rest; `slug-step --rollout-urls --page /de/en/…` prints them). Options show a
  Source card `/de/de` and only German, with Rollout and Skip: pick **Rollout**. The app writes
  `/at/de/<same path>` (rollout/index.js 112-147). The German pages must have no unresolved marks
  (rollout/index.js 46-51).
- Afterwards: check every target page in DA and run the block check, the link step for the pair
  with `--page` (`de/de → at/de`, `de/en → gb/en`), resolve the marks, then preview.

### What merge does

`merge` is the first value of every `*.conflict.behavior` row, so it is the default of each
project (options/utils/utils.js 103-107). On save the app compares the incoming page with the page
already at the destination (project/index.js `mergeCopy`, 306-357):

- no page there yet (or an empty one): the incoming page is written as it is (314-316, 354-356);
- the same content: nothing is saved (326-330);
- otherwise both versions stay in the document, marked: the incoming (upstream) content as
  `da-diff-deleted`, the market's own (local) content as `da-diff-added`
  (regional-diff/regional-diff.js `regionalDiff`, 479-498). The page's DA metadata (the
  differences already accepted or rejected) is read and saved again (project/index.js 332-348).

The author resolves the marks in the DA editor, now at `da.live/canvas#/moved-permanently/lh-com/<path>`
(`da.live/edit#/…` links, such as the app's own on Validate, validate.js 121, redirect there).
Its review buttons are per block (**Local**, **Upstream**, **Difference**) and per page (**Keep
All Local**, **Keep All Upstream**).

Unresolved marks:

- they stop a send **from** that page only: a translation or rollout refuses a source page with
  marks (translate/index.js 69-74, rollout/index.js 46-51);
- a second send **into** a page that still has marks is not refused: the merge first removes the
  marks of the target, keeping its local side and dropping its pending incoming blocks
  (project/index.js 323, regional-diff.js `removeLocTags` 457-477), then marks the new
  differences. What the author had not accepted yet is gone. Resolve before the next project.

The app's status is not proof that a page was written:

- a failed write leaves no error the rollout view counts (project/index.js 225-228, 348-353 set
  the page's status, rollout/index.js 94-101 counts `url.error`), so the language shows
  **Complete** (183-184: "no errors means success");
- a failed **read** of the target (any error, not only a missing page: project/index.js
  `getHtml` 147-158) makes merge write the incoming page over it (312-316, 354-356 →
  `overwriteCopy`): the market's page is replaced, not merged.

So after every run open every target page in DA and compare it with the copy from "Before every
run", with the block check (below).

`overwrite` replaces the destination page; sheets (`.json`) are always overwritten
(translate/index.js 148, rollout/index.js 83).

A rollout copies links as they are (no link rewriting: project/index.js `saveHtml` 197-201 passes
`replaceRelative: false`). The market pages link to their own market (`/gb/en/…`, `country=GB`);
the source page links to `/de/en/…`. So a rollout with merge marks those links as differences:
**keep the local side**, or run the link step after the rollout (below), which makes the incoming
links the market's too. With overwrite the market's links would point at the source market until
the link step runs. Of the 910 gb/en pages that are otherwise identical to de/en, 904 differ only in
that way (regional differences report).

### Three things the app does today (da-nx 1.29.1)

- **The review record comes back.** DA's editor keeps the hashes of the incoming blocks a reviewer
  accepted or rejected in the page's `da-metadata` block (`acceptedHashes`, `rejectedHashes`), and
  the next merge reads them (project/index.js 332-343). After `clear-review.mjs` removed it, the
  next save in the DA editor writes the earlier decisions back (old lower-case rows and/or
  `acceptedHashes`/`rejectedHashes`): on a page the editor has seen, the clear doesn't stick. Keep
  `clear-review` (without `--linked-images`) only as a way to drop a record on purpose. Later
  rounds still mark blocks the editor hashes differently from the merge: expected until
  [adobe/da-nx#924](https://github.com/adobe/da-nx/pull/924) is released. Resolve them as usual.
- **Linked images keep a mark.** After a merge a picture inside a link (`<a …><picture>`) gets
  `da-diff-added=""` on the `<a>`. No editor action resolves it, and the rollout then refuses the
  page (rollout/index.js 46-51). Run `clear-review --linked-images` over the source pages before
  every rollout from them (below).
- **A reopened translation project can show "Saved 0".** Opened again, it can show German
  "translated", Saved 0, a **Get status** button and "Rollout locales" disabled. Don't use Get
  status: it saves the translations again into pages already reviewed (translate/translate.js
  `handleGetStatus` 265-277 → `checkAndSaveLangs` 248-263, every language with status translated
  or complete). Roll out from a project of its own (step 10, "A rollout only").

### The review record and the block check (after every app step)

The merge used to drop a page's own block without a mark when an incoming block with the same
hash had been rejected (a heading: the page's has an id, the incoming one none); the supervised
test run of 2026-10-27 lost the German H1 of `/de/de/book-and-manage/rebook` this way (restored).
[adobe/da-nx#930](https://github.com/adobe/da-nx/pull/930), released with 1.29.1, keeps the
page's own block: rejected hashes only skip incoming blocks (regional-diff/regional-diff.js
434-443). The block check stays after every step:

```sh
node tools/loc/clear-review.mjs --linked-images --page /de/de/gepaeck            # dry run: the links
node tools/loc/clear-review.mjs --linked-images --page /de/de/gepaeck --apply    # before the rollout
node tools/loc/block-check.mjs --before ~/loc-backup/2026-10-28/de/de/book-and-manage/rebook.html \
  --after /de/de/book-and-manage/rebook                                          # after each step
node tools/loc/clear-review.mjs --page /de/de/book-and-manage/rebook            # dry run: the rows
node tools/loc/clear-review.mjs --page /de/de/book-and-manage/rebook --apply    # drop the record
```

- **clear-review --linked-images** before every rollout, over its source pages: it removes
  `da-diff-added` from `<a>` elements whose whole content is a picture, and only there (a marked
  paragraph, a marked text link, a link with a picture and a caption keep their marks). The dry
  run lists them (link, image); `--apply` takes a labelled DA version
  (`before clear-review --linked-images <date>`), writes the page and reads it back.
- **block-check** after every app step (translation, rollout, sync) on every target: it compares
  the copy from "Before every run" (or a DA path) with the read-back and lists every heading,
  paragraph, image and block that is missing after the step. Heading ids, `<p>` in metadata
  cells, `<source>` in pictures and the `da-metadata` block are ignored; content only inside an
  incoming mark (`da-diff-deleted`) counts as missing (it goes when that block is rejected). A
  missing item means: stop and restore the page from its labelled version or the local copy.
  Exit code 1 when something is missing; `--pair <before> <after>` repeats for several pages.
- **clear-review** (without `--linked-images`) only to drop a record on purpose: labelled DA
  version (`before clear-review <date>`), the page without its `da-metadata` block, read-back.
  It doesn't stick on a page the editor has seen (above).

### The link step (after every rollout and translation)

```sh
node tools/loc/link-step.mjs --from de/de --to at/de --page /at/de/gepaeck          # dry run
node tools/loc/link-step.mjs --from de/de --to at/de --page /at/de/gepaeck --apply  # write
node tools/loc/link-step.mjs --from de/en --to gb/en                     # dry run, all gb/en pages
node tools/loc/link-step.mjs --from de/en --to de/de --page /de/de/x --apply   # after a translation
node tools/loc/link-step.mjs --all                  # dry run of the three pairs: the report
node tools/loc/link-step.mjs --config da --from gc/de --to at/de --page /at/de/gepaeck   # the gc rows
```

The pairs are the `translate.json`'s (its languages rows, `setup-lib.mjs`): with today's rows the
three above, with the global source's rows the five of "Global source (/gc)" (below). A pair the
rows don't have is refused before anything is read.

On each page of the target locale (the `--page` ones, else every page of that locale in
`tools/migration-scope/pages.csv`). **`--apply` writes only the `--page` pages**: give the pages
the project wrote. Without `--page` it stops; `--all-pages --apply` (every page of the locale)
prints the page count and needs `--yes` as well. Don't use it: 87 at/de and 89 gb/en pages hold
www's links into `/de/de` and `/de/en`, and they stay until those pages' own rollout.

- links to the site's own hosts (`SITE_HOSTS`, below) become root-relative – the app writes
  aem.page links into every translation (dnt.js 46-52) and a merge aem.live ones
  (regional-diff.js `normalizeLinks` 103-120);
- a link into the source locale (`/de/de/<x>` in an `/at/de` page, `/de/en/<x>` in a `/gb/en` or
  translated `/de/de` page) becomes the target locale's page of `<x>`, from the `pages.csv` row
  that holds it (own German slugs included: `/de/en/flight-search` → `/de/de/flugsuche`); the
  metadata Parent link too, text included;
- a link into the source locale without a counterpart in the target locale stays as it is and is
  listed; links to other hosts (www.lufthansa.com, partners) and anchors stay.

Two host lists; when a host is added or retired, change both together:

- `SITE_HOSTS` in `tools/loc/link-lib.mjs` (links made root-relative, by the link step and the
  slug step): `main--lh-com--moved-permanently.aem.page`, `main--lh-com--moved-permanently.aem.live`,
  `lufthansa.turnsthe.page`, `lhedge.bbird.live`;
- `source.fragment.hostnames` in `translate.json` (fragments the app adds to a project,
  validate.js 66-104): `main--lh-com--moved-permanently.aem.live`, `lufthansa.turnsthe.page`.

Both changed on 2026-11-01 (7fc8ff7b; the DA copy of `translate.json` was uploaded the same
night); `lhcom.bbird.live` is retired.

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
node tools/loc/slug-step.mjs --rollout-urls --page /de/en/children-on-board --page /de/en/baggage
```

For each page with a translation at `/de/de/<english slug>` it:

1. turns the translation's links into German ones: the app makes every root-relative link an
   absolute `https://main--lh-com--moved-permanently.aem.page/…` link (dnt/dnt.js `resetHrefs`,
   46-52, run by `removeDnt` on every translation; a merge then makes them `.aem.live`,
   regional-diff.js `normalizeLinks` 103-120) – the step makes them root-relative again and turns
   `/de/en/<x>` into `/de/de/<German slug of x>` (Parent row included); links to pages without a
   German page in the scope stay and are listed;
2. sets `primary-language-url` to the English page on /de/en (what `helix-sitemap.yaml` pairs
   translated slugs by; the German pages carry it today; with the global source too, `/de/en/<x>`
   for `/gc/en/<x>`, the page the market pages pair with);
3. writes it to `/de/de/<german slug>`: moved when there is no German page yet, otherwise merged
   with **the app's own merge** (the same `regionalDiff` as above, downloaded at the pinned
   commit; the German page's DA metadata, its accepted and rejected differences, goes into the
   merge and is saved again, as `mergeCopy` does), or replaced with `--behavior overwrite`;
4. deletes the copy at `/de/de/<english slug>`.

`--rollout-urls` (with `--page /de/en/…`; a dry run only, no DA call, `--apply` is refused)
prints the URLs of the at/de rollout project, one per line: for each English page its German
page (the German slug from `slug-map.json`, else the same path under `/de/de`) as
`https://main--lh-com--moved-permanently.aem.page/<path>`, e.g.
`…/de/de/kinder-an-bord` and `…/de/de/gepaeck` for the two pages above. Paste them into the
rollout project's URLs.

With the global source's rows (`--config da` after the switch, or the file) the same runs under
`/gc`: the app writes `/gc/de/<english slug>` from `/gc/en`, the step moves it to the de/de own
slug under `/gc/de` (`/gc/en/flights` → `/gc/de/fluege`), and `--rollout-urls --page /gc/en/…`
prints the `/gc/de` pages: one German rollout of them writes `/de/de` and `/at/de`.

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
is refused); `--root /drafts/loc-test` for copies; `--config` as the link step (the gc rows: `/gc/en`
against `/gc/de`). Fix the markers in DA when you resolve the marks.

Today's report (`tools/reports/loc-marker-check.md`, before any project) is a baseline: the German
pages are still www's own, and 75 of 968 differ from the English page where www's pages differ
(other spacers, an extra heading style). Compare a page's findings with it.

## Global source (/gc)

On www the English and German documents of the markets come from a global tree
(`/content/lh/gc/<ll>`), which is never published. lh-com gets the same tree in DA (`/gc/en`,
`/gc/de`: ema-cashub, brief 249) and can take its projects from there. Two setups, both only the
languages rows of `/.da/translate.json`:

| setup | name | code | source | location | locales | actions |
|---|---|---|---|---|---|---|
| today | English | en | | /de/en | /gb/en | Skip, Rollout |
| today | German | de | /de/en | /de/de | /at/de | Skip, Translate, Rollout |
| global source | English | en | | /gc/en | /de/en, /gb/en | Skip, Rollout |
| global source | German | de | /gc/en | /gc/de | /de/de, /at/de | Skip, Translate, Rollout |

With the global source a project edits `/gc/en`; German Translate writes `/gc/de` (the de/de own
slugs, `slug-map.json`); **German Rollout writes `/de/de` and `/at/de` in one rollout**, English
Rollout writes `/de/en` and `/gb/en` (merge, as before). `check-config --config <file>` checks the
rows with the app's own functions (`tools/reports/loc-config-check-gc.md`; the rows of
`test/fixtures/loc/translate-gc.json`).

**Switching** (and back) is one upload of `/.da/translate.json` (the site's admin; no tool writes it):

1. Download DA's `/.da/translate.json` and keep it as the backup (`translate-<date>.json`, outside
   the repository).
2. Replace only the two languages rows, run `node tools/loc/check-config.mjs --config <the new
   file>` (all checks pass), upload it in one go; open the app in a fresh tab ("Before every run").
3. Back: upload the backup, unchanged.

The tools read the rows of the `translate.json` they are given: `--config da` (DA's, the one the
app uses), a file, or the repo copy (default: today's rows). Run them with `--config da` after a
switch.

**The Sync hazard.** With the global source a `/de/en`, `/de/de`, `/at/de` or `/gb/en` URL matches
no source root (resolveSourceLang knows `/gc/en` and `/gc/de` only, utils/utils.js 362-389): the
project goes to **Sync**, which copies it under the default source with its full path
(`/de/en/baggage` → `/gc/en/de/en/baggage`; views/sync/index.js getSyncUrls 7-34, options/utils/utils.js
calculateView 27-32). **Never put market URLs in a project**: only `/gc/en` URLs (translation, English
rollout) or `/gc/de` URLs (German rollout), one folder per project (a mix of `/gc/en` and `/gc/de`
is refused).

**Which rollout writes which locales:**

| project URLs | action | reads | writes |
|---|---|---|---|
| `/gc/en/x` | German Translate | `/gc/en/x` | `/gc/de/x` (then the slug step: `/gc/de/<german slug>`) |
| `/gc/en/x` | English Rollout | `/gc/en/x` | `/de/en/x` and `/gb/en/x` |
| `/gc/de/y` | German Rollout | `/gc/de/y` | `/de/de/y` and `/at/de/y` (one rollout) |

In the translation project click both German locales (`/de/de`, `/at/de`) off the German row: German
Rollout there reads `/gc/de/<English path>` (before the slug step it would write the machine
translation to `/de/de/<English path>` and `/at/de/<English path>`). Roll out German from a
project of its own with the `/gc/de` URLs (`slug-step --config da --rollout-urls --page /gc/en/…`).
Those are aem.page addresses of pages that are never previewed (they answer 404 there): the app
takes only their path and checks it in DA (validate.js 106-124).

How the app reports a rollout to two locales (views/rollout/rollout.js 140-179, rollout/index.js
149-193): one row per language; its "Rolled out" count is pages × locales (2 for one page), each
locale (expand the row) shows the project's page count and the language's status, not one of its
own. The rollout first reads every source page and stops on one with marks (nothing written);
then it writes both locales; a failed write in either returns the error list without "complete",
the writes that succeeded stay, and the row stays "rolling out", so the Rollout buttons are gone
(rollout.js 108-111, 127-129) until the project is opened again. Check both locales' pages after
every run ("Before every run", the block check).

**/gc is never previewed or published** and stays out of every publish sweep, as on www: no
publish request, no bulk preview or publish of a folder above it; the migration's `da-upload` never
previews a `/gc` path (249). Its pages exist in DA only; the markets' pages are what is published.

**What a rollout would replace** (`node tools/loc/regional-diff.mjs --config da`, read only): each
market page against its gc page, `tools/reports/loc-regional-diff-gc.md`. The gc tree is the de
market's documents with their relative links under `/gc`, so a relative `/<cc>/<ll>/` or `/de/<ll>/`
path counts as `/gc/<ll>/` and the market in www.lufthansa.com links, JCR paths and query values as
de. `--pages /gc/en/x,/gc/de/y` (or a file) limits it to those rows and prints the report.

**The link step's gc pairs** (`--config da` after the switch):

| pair | kind | links |
|---|---|---|
| `gc/en > gc/de` | translation | `/gc/en/<x>` → `/gc/de/<German slug of x>` |
| `gc/en > de/en`, `gc/en > gb/en` | rollout | `/gc/en/<x>` → `/de/en/<x>`, `/gb/en/<x>` |
| `gc/de > de/de`, `gc/de > at/de` | rollout | `/gc/de/<y>` → `/de/de/<y>`, `/at/de/<y>`; a `/gc/en/<x>` link → `/de/en/<x>` in a `/de/de` page (listed in an `/at/de` page: no at/en) |

The gc paths come from `pages.csv`: `/gc/en/x` is the de_en row's path with `/de/en` replaced,
`/gc/de/y` the de_de row's (own slugs included). After a rollout from `/gc` the market page links
`/de/de/…` (or `/at/de/…`, `/de/en/…`, `/gb/en/…`), never `/gc/…`: a link without a counterpart
stays and is listed; a `primary-language-url` of `/gc/en/<x>` becomes `/de/en/<x>`.

## The configuration (`translate.json`) and the code it relies on

`check-config.mjs` runs these functions of the app on the file; all checks pass
(`tools/reports/loc-config-check.md`).

### `config`

| key | value | code |
|---|---|---|
| `source.language` | `English` | the row whose `location` (`/de/en`) is the source of a project whose URLs match no other root (options/utils/utils.js 117-123 `formatConfig`; validate.js 172-180; translate/index.js 245, rollout/index.js 164-168, sync.js 33) |
| `source.language.detect` | `true` | read since da-nx 1.29.1 (`69006f3b`, #793 + #870; utils/utils.js `isSourceDetectEnabled` 307-309, validate.js 147-170, options.js 62, 72-93). A project takes its source folder from its URLs (utils/utils.js `resolveSourceLang` 362-389): `/de/en` URLs offer German Translate and English Rollout to `/gb/en`; `/de/de` URLs offer only German Rollout (and Skip) to `/at/de` (options/utils/utils.js `filterLangsBySource` 167-188). Mixed URLs are refused with a message naming the URLs to uncheck (utils/utils.js 340-350). The rollout keeps paths 1:1: `/de/de/kinder-an-bord` → `/at/de/kinder-an-bord` (rollout/index.js 112-147) |
| `translate.conflict.behavior` | `merge, overwrite` | first value is the project default (options/utils/utils.js 103-107); used in translate/index.js 173, 148. Merge keeps the existing German pages (www's translations) instead of replacing them with machine translation |
| `rollout.conflict.behavior` | `merge, overwrite` | rollout/index.js 169, 81-86: market edits survive |
| `copy.conflict.behavior`, `sync.conflict.behavior` | `merge, overwrite` | translate/index.js 244; sync.js 58 |
| `translation.service.name` | `Google` | the connector folder (translate/index.js 16-20: `connectors/google`); Google sends `fromlang=en`, `tolang=<code>` (connectors/google/index.js 25-26) through DA's translate proxy (29), no keys |
| `translation.service.all.env` | `prod` | options/utils/utils.js 103-107, 240-247 |
| `translation.service.prod.origin`, `.link` | `https://translate.da.live/google`, Google's docs | formatService (46-62); the Google connector calls DA's proxy constant, these are informative |
| `source.fragment.hostnames` | `main--lh-com--moved-permanently.aem.live, lufthansa.turnsthe.page` | validate.js 66-104: absolute fragment links on these hosts are added to a project; the merge treats links to these sites as the site's own (regional-diff.js 488-492). Changed together with `SITE_HOSTS` (see "The link step") |

### `languages`

| name | code | source | location | locales | actions |
|---|---|---|---|---|---|
| English | en | | `/de/en` | `/gb/en` | Skip, Rollout |
| German | de | `/de/en` | `/de/de` | `/at/de` | Skip, Translate, Rollout |

- `name`: matched by `source.language` (options/utils/utils.js 64-74).
- `code`: the target language for Google (connectors/google/index.js 26, 69); unique, the views
  match rows by it (options.js 421, rollout.js 57).
- `location`: where a translation is saved (translate/index.js 107-117), where a rollout reads
  from (rollout/index.js 112-125), and a root a project's URLs can come from (utils/utils.js
  362-389): the German row's `/de/de` is the root of the at/de rollout project.
- `locales`: comma list of full path prefixes; a rollout writes `<locale><path>`
  (rollout/index.js 127-147; options/utils/utils.js 205-215, all active without a
  `default locales` column).
- `actions`: the first is preselected (aem.live, "Translation projects": "the first one listed is
  the default"), Skip is added when missing (options/utils/utils.js 199-203). Skip comes first, so
  no project rolls out or translates a language unless the author chooses it. In a `/de/de`
  project only the German row is left, with Rollout and Skip (filterLangsBySource 167-188).
- `source`: the folder a row's translation reads from (translate/translate.js 161-182; `/de/en`,
  the same as the default) and the root that offers the row's Translate (filterLangsBySource).
- No `source language` column: that chains a translation after another one (options/utils/utils.js
  220-227, translate/index.js 291-386), not a rollout. The sample's `translate type` column is
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
| `translation.service.name` | `GlobalLink` (loads `connectors/globallink`, translate/index.js 16-20) |
| `translation.service.prod.endpoint` | the GlobalLink API base (connector 43-53: sent as `x-globallink-origin` to DA's proxy) |
| `translation.service.prod.projectId` | the GlobalLink project id (connector 318-337) |
| `translation.service.prod.fileFormatName` | the GlobalLink file format (connector 366) |
| `translation.service.prod.dueDateDays` | optional, days until due (default 7; connector 14, 762) |
| `translation.service.custom.<type>.<name>` | optional project attributes (options/utils/utils.js 76-93; connector 285-296) |

Remove `translation.service.prod.origin`/`.link`; the languages, conflict behaviours and DNT rules
stay. GlobalLink's language codes may need the region (`de-DE`): `code` is sent as the target.

## Limits (today's app, 69006f3b)

- **One folder per project.** `/de/en` URLs for the German translation and the gb/en rollout,
  `/de/de` URLs for the at/de rollout (a mix is refused, utils/utils.js 340-350). `/at/de` and
  `/gb/en` URLs still go to Sync: they are no project source (`resolveSourceLang` knows the rows'
  `location` and `source` roots only, utils/utils.js 362-389; options/utils/utils.js
  `calculateView` 27-32), and the sync copies them into `/de/en` + their full path
  (`/at/de/x` → `/de/en/at/de/x`, sync/index.js 15-21; utils/utils.js `convertPath` 131-152).
  Never add them.
- **German Rollout in a `/de/en` project** reads `/de/de/<English path>` (rollout/index.js
  112-125): click `/at/de` off the German row there (step 5) and roll out German from a `/de/de`
  project.
- **The three findings** ("Three things the app does today"): the review record comes back,
  linked images keep a mark (`clear-review --linked-images` before every rollout), a reopened
  project can show Saved 0 (no Get status).
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
  (de/en → gb/en from a `/de/en` project, de/de → at/de from a `/de/de` project). Not
  `/prepare-for-your-trip/current-travel-information`: it is the Message Center's anchor page.
- **Translation that creates only a new document**: one of the 72 own-slug pages without a form,
  e.g. `/de/en/children-on-board` (text and images, one link, one `{limited-width}` marker) → the
  app writes the new `/de/de/children-on-board` (no page there, checked 2026-10-27; not another
  page's German path); `/de/de/kinder-an-bord` is untouched until you run the slug step with
  `--apply`. Then the marker check with `--page /de/en/children-on-board`.
- **Slug step**: `--root /drafts/loc-test` on copies (the folder was deleted on 2026-10-27; copy
  the pages there first, and never preview `/drafts/`).
