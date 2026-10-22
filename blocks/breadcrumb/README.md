# breadcrumb

Breadcrumb trail of the live pages ("Home > Airport information > Boarding"): `maui-breadcrumb` on AEM pages, `nav.breadcrumb` on AirCore city and route pages. Imported by `tools/importer/transformers/lufthansa-cleanup.js` (convertBreadcrumbs) as the first block of the page (AEM) or of the content after the stage (AirCore).

## Authoring (Document Authoring)

Model: `standalone`

One cell with a list of links, in order; the last item is the current page (its link is optional and not rendered as a link). Links or text paragraphs instead of a list also work.

## Behaviour

Rendered as `nav > ol > li` (link or `span[aria-current]` for the current page); the CSS only relies on that structure and the `breadcrumb-parent` / `breadcrumb-current` item classes, so a trail built from page metadata later can reuse it.

- From 1025px: the whole trail, parents regular in whale blue, the current page bold deep blue, 7x10px chevrons with 8px/6px to the texts.
- 768-1024px: only the parent page, as plain text 5px in (live 768 capture).
- Below 768px: the parent page as a back link with a left chevron (5px in, 9px to the text).
- AirCore pages (`body.aircore`): deep blue light (300) links, the whole trail from 768px, below only the parent followed by its right chevron, flush with the content edge.

## Supported variations

No variations.
