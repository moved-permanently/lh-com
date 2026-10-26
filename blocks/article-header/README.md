# article-header

Custom **article-header** block. Purpose: insights article page header: feature image with an overlapping white panel holding tags, title, intro, byline and share links.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: 1 column. Row 1: feature image (alt required), optionally followed by a header video: a link to the video's `/content/dam/...mp4` path (www's moving image), with ` {mobile}` after the link when it also plays on small screens. Row 2: H1 and intro paragraph(s). Tags, publication date, reading time and author are NOT authored in the block; they come from page metadata: tags (comma separated; the pipeline publishes the row as one `meta property="article:tag"` per tag, which the block reads; rendered as chips linking to /<country>/<lang>/articles/tags/<slug-of-tag>), publication-date (ISO date like 2026-08-20 or a unix timestamp, formatted per page locale; other text is shown as authored), reading-time (shown as authored, e.g. '7 min read') and author; the byline reads 'date | reading time | author' and omits missing parts. Share links for Facebook, X, LinkedIn, email and a copy-link button use the current page URL. UI strings have English and German defaults by page language and can be overridden with optional two-cell rows: Tags label (Tags / Schlagwörter), Share label (Share this article / Artikel teilen), Facebook label, X label, LinkedIn label, Email label (Email / E-Mail), Copy link label (Copy link / Link kopieren), Link copied label (Link copied / Link kopiert). Defensive: the first picture is the image, the first heading the title, paragraphs after it the intro; a missing image renders the panel without the image..

### Header video

Played as www plays the moving image of its article pages (`.dcep-moving-image`): muted, looping, inline, without controls or picture-in-picture, while at least half of the image is in view (paused outside); from 768px wide only, unless the link is followed by ` {mobile}` (www's `isVideoEnabledOnMobile`). A pause/play button appears at the bottom right once the video can play and slides away 3 seconds after the pointer or focus leaves the image; a visitor's pause holds. The feature image stays as the poster: it shows until the video plays, and it is all that shows with reduced motion (`prefers-reduced-motion: reduce`), below 768px without ` {mobile}`, or when the video fails to load. Labels (two-cell rows, as above): Play label (Play video / Video abspielen), Pause label (Pause video / Video anhalten), Video started label (Video started / Video gestartet), Video stopped label (Video stopped / Video gestoppt); www's German label bundle holds the English texts. A header without a video link renders as before.

Example row 1 cell:

```
[feature image]
/content/dam/lh/article-images/europe/lh-blog-barcelona-animation-16x9.mp4 {mobile}
```

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)
