# fare-teaser

Custom **fare-teaser** block. Purpose: static list of authored routes with live lowest fares.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: 2 columns, label | value. Rows: Origin | FRA or Frankfurt (FRA) (omitted: locale home airport); Destinations | CHI, WAS, IST or Chicago (CHI), ... (names authored in brackets are shown as is; otherwise names come from the fare service; omitted: the service recommends destinations); Trip duration | 7; Cabin | E; Price label | Round trip from; Link | optional URL pattern with {origin}, {destination}, {duration}, {cabin} (default: the locale's /book-and-manage/destination page); Conditions | text or link. The section heading stays default content above the block. UI strings have built-in English and German defaults chosen by the page language; any can be overridden with a row of the same name.

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)
