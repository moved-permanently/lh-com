# breadcrumb

Breadcrumb trail of the live pages ("Home > Airport information > Boarding"): `maui-breadcrumb` on AEM pages, `nav.breadcrumb` on AirCore city and route pages. Imported by `tools/importer/transformers/lufthansa-cleanup.js` (convertBreadcrumbs) as the first block of the page (AEM) or of the content after the stage (AirCore).

## Authoring (Document Authoring)

Model: `standalone`

One cell with a list of links, in order; the last item is the current page (its link is optional and not rendered as a link). Links or text paragraphs instead of a list also work.

## Behaviour

Desktop and tablet show the whole trail with chevrons between the items, the current page bold. Below 768px only the parent page shows, as a back link with a left chevron (as on the live site).

## Supported variations

No variations. AirCore pages (`body.aircore`) use the AirCore type weights.
