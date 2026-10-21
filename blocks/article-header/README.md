# article-header

Custom **article-header** block. Purpose: insights article page header: feature image with an overlapping white panel holding tags, title, intro, byline and share links.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: 1 column. Row 1: feature image (alt required). Row 2: H1 and intro paragraph(s). Tags, publication date, reading time and author are NOT authored in the block; they come from page metadata: tags (comma separated, rendered as chips linking to /<country>/<lang>/articles/tags/<slug-of-tag>), publication-date (ISO date like 2026-08-20 or a unix timestamp, formatted per page locale; other text is shown as authored), reading-time (shown as authored, e.g. '7 min read') and author; the byline reads 'date | reading time | author' and omits missing parts. Share links for Facebook, X, LinkedIn, email and a copy-link button use the current page URL. UI strings have English and German defaults by page language and can be overridden with optional two-cell rows: Tags label (Tags / Schlagwörter), Share label (Share this article / Artikel teilen), Facebook label, X label, LinkedIn label, Email label (Email / E-Mail), Copy link label (Copy link / Link kopieren), Link copied label (Link copied / Link kopiert). Defensive: the first picture is the image, the first heading the title, paragraphs after it the intro; a missing image renders the panel without the image..

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)
