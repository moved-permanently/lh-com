# breadcrumb

Breadcrumb trail of the live pages ("Home > Airport information > Boarding"): `maui-breadcrumb` on AEM pages, `nav.breadcrumb` on AirCore city and route pages.

## Authoring (Document Authoring)

The trail is not authored in the documents. Each page names its parent in its **Metadata** block; the code walks up the parents at runtime. Lufthansa's URLs are flat (`/de/de/dangerous-dogs` sits under "Gepäck > Reisen mit Tieren"), so the trail cannot come from the path.

| Metadata row | Value | When |
| --- | --- | --- |
| `Parent` | the parent page's URL, e.g. `/de/de/travelling-with-animals` (as a link whose text is the URL: Edge Delivery puts the cell text, not the link target, into `<meta name="parent">`) | every page that shows a trail |
| `Breadcrumb title` | the page's own label in trails, e.g. `Komfort an Bord` | only where it differs from the page's `og:title` (else its `Title`) |
| `Parent title` | labels of `Parent` links outside this site, `Flight Asia > Flight Jordan` | only for parents outside the site |
| `Breadcrumb` | `hidden` | pages that show no trail themselves but are parents (hub pages, e.g. `/de/en/first-class`) |

- A page without `Parent` shows no trail (homepages, the AirCore start page `/lhg/de/en`). Homepages still carry `Breadcrumb title: Home` for their children.
- A parent outside the migrated site (still on www.lufthansa.com) cannot be read at runtime: `Parent` then lists that page's own ancestors before it, up to the first page of this site, in trail order with the direct parent last (`/lhg/de/en`, `https://www.lufthansa.com/lhg/de/en/dest/co/asia`, `https://www.lufthansa.com/lhg/de/en/dest/c/jordan` on `/lhg/de/en/dest/cy/amman`), and `Parent title` gives the outside labels in the same order.
- To move a page in the tree, change its `Parent`; its children follow automatically.

`scripts/scripts.js` (`buildBreadcrumb`) adds an empty block where the live page shows the trail: at the start of the first section on AEM pages, right before the h1 on AirCore pages (after the stage). A document that still contains an authored Breadcrumb block (one cell with a list of links, the last item the current page) keeps it; that form is rendered as it is.

The importer (`tools/importer/transformers/lufthansa-cleanup.js`) reads the live trail of the snapshot and writes these rows instead of a block: parent links mapped to in-scope relative paths, other parents as absolute live URLs with their labels. Pages without a trail of their own that are parents of others get theirs from `BREADCRUMB_MAP` (`node tools/importer/build-breadcrumb-map.js`, generated from all snapshots).

## How the trail is resolved

For each parent the block fetches the parent page's HTML (`fetch('/de/de/gepaeck')`) and reads `breadcrumb-title` / `og:title` / `parent` / `parent-title` from its `<head>` (only the head is parsed), then continues with that page's parent (at most 10 levels, cycles stop). Results are cached per tab in `sessionStorage` (`lh-breadcrumb:<path>`).

Why the parent pages and not an index:

- `/query-index.json` answers 404 on aem.page (the index is built on publish), and the site is previewed only, never published.
- A previewed sheet (e.g. `/breadcrumbs.json`) would need one more document to keep in sync with every page; the page metadata stays the single source, edited where the page is edited, and a moved or renamed parent shows at once after its preview.
- The parent pages are cached by the CDN and are the pages a visitor goes to next. A trail costs one request per level (usually 1-3, sequential), cached for the rest of the session.

The block renders the current page at once and fills in the parents without delaying the first section (the row keeps its height, `breadcrumb-loading` hides it until the trail is complete). A parent that cannot be fetched ends the trail at the parents found so far.

On the local dev server (`aem up --html-folder content`, pages under `/content/...`) the Metadata block stays in the page body: `scripts.js` turns it into `<meta>` tags like the pipeline does, and parents are fetched and linked under the same `/content` prefix.

## Behaviour

Rendered as `nav > ol > li` (link or `span[aria-current]` for the current page) with the `breadcrumb-parent` / `breadcrumb-current` item classes.

- From 1025px: the whole trail, parents regular in whale blue, the current page bold deep blue, 7x10px chevrons with 8px/6px to the texts.
- 768-1024px: only the parent page, as plain text 5px in (live 768 capture).
- Below 768px: the parent page as a back link with a left chevron (5px in, 9px to the text).
- AirCore pages (`body.aircore`): deep blue light (300) links, the whole trail from 768px, below only the parent followed by its right chevron, flush with the content edge. The trail sits 23px below the stage image (the section before it keeps a 6px gap instead of the section gap).
- `?channel=app`: no breadcrumb (scripts/channel.js).

## Supported variations

No variations.
