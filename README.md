# Your Project's Title...
Your project's description...

## Environments
- Preview: https://main--lh-com--moved-permanently.aem.page/
- Live: https://main--lh-com--moved-permanently.aem.live/

## Documentation

Before using the aem-boilerplate, we recommend you to go through the documentation on https://www.aem.live/docs/ and more specifically:
1. [Developer Tutorial](https://www.aem.live/developer/tutorial)
2. [The Anatomy of a Project](https://www.aem.live/developer/anatomy-of-a-project)
3. [Web Performance](https://www.aem.live/developer/keeping-it-100)
4. [Markup, Sections, Blocks, and Auto Blocking](https://www.aem.live/developer/markup-sections-blocks)

## Authoring conventions (default content)

### Heading styles

Lufthansa sizes headings by class, not by level: an `h3` can be 48px bold (`heading-large`), an
`h2` 28px light (`heading-small`). The level is kept as it is (it is the document outline), and
each level has a default size:

| Level | Default | Size at 1440px |
| --- | --- | --- |
| Heading 1 | `heading-large` | 48px bold |
| Heading 2 | `heading-medium` | 36px light |
| Heading 3, 4 | `heading-copytext-large` | 24px bold |
| Heading 5, 6 | `heading-copytext-medium` | 18px bold |

Any other size is a marker at the end of the heading text, in curly braces:
`Ticket refunds {heading-medium}`. Possible values: `heading-large` (48px bold), `heading-medium`
(36px light), `heading-small` (28px light), `heading-copytext-large` (24px bold),
`heading-copytext-medium` (18px bold), `copytext-large` (body text, 18px regular).
`scripts/scripts.js` removes the marker from the text (and from the heading id) and sets the
class; the styles are in `styles/styles.css`. The importer (`lufthansa-cleanup.js`) writes the
marker only where the live class differs from the level's default.

Why a text marker: Document Authoring keeps no classes on headings, and a section style or a
block would change the whole section or the structure for one heading. The marker is visible
and editable in the document, sits on the heading it applies to, survives copy and paste, and
an author can delete it to get the default size again.

### Small text

The same marker at the end of a paragraph sets its text size: `{copytext-small}` (14px:
footnotes, disclaimers, small link lists), `{copytext-medium}` (16px),
`{copytext-large}` (18px, the default size, but with regular instead of bold links). A link
alone in such a paragraph stays a small text link with an arrow instead of a large
navigation link.

### Image captions

`{caption}` at the end of the paragraph right after an image makes it the image's caption
(14px bold, 10px under the image), as on Lufthansa Insights articles.

`{parallax}` at the end of an image paragraph (after the image) shows the image in a 500px
high window, cropped to fill it (Lufthansa Insights parallax images, `.parallax-content`).

### Quotes

A quote (a blockquote: the quote paragraph, then an optional source line) is set in 28-36px bold
LufthansaHead with the source in 16px light below, at most 622px wide, 60px (80px from 768px)
above and below (Lufthansa author quotes, `.author-quote`). `{narrow}` at the end of the quote
paragraph centres it like a Lufthansa narrow section (720px with the side margins: /de/en/first-class).

### Text width

Running text (paragraphs, lists) uses two thirds of the content width from 1025px.
`{full-width}` at the end of a paragraph, or
at the end of the last item of a list, lets it run over the whole width; it combines with a
size: `{copytext-small full-width}`. On Lufthansa Insights articles the body text is a centred
column of two thirds of the width from 768px. Inside a Columns Media cell the text uses the whole cell;
`{limited-width}` at the end of a paragraph (or of the last item of a list) there keeps it to two
thirds of the cell from 1025px (Lufthansa `.richtext.limited-width` in a column: the
/de/de/additional-services intro beside the jump links).
Headings run over the whole width; `{limited-width}` at the end of a heading keeps it to two
thirds from 1025px, so it wraps as the Lufthansa `.headline.limited-width` (/de/en/admission-rules
"Access to the Star Alliance partner lounges on departure"). It combines: `{heading-small limited-width}`.
`{indent-80}` at the end of a paragraph indents it by 80px (any value up to 999); from 1025px
the paragraph still ends at two thirds of the width (the /100-years intro). It combines with the
other markers: `{full-width indent-40}`.

### Spacing and dividers

A paragraph with only `{spacer-120}` adds 120px of extra space at that place (Lufthansa
`.separator` with `margin-bottom: 120px`), `{divider-25}` a thin grey line with 25px below it;
`{spacer-80 from-768}` only from 768px. The importer writes them for live separators with a line
or with 50px and more (smaller ones are the normal spacing); delete the paragraph to remove it.
Right after a grey band the importer keeps every separator (the band ends a section, so the
separator's space is not part of the normal spacing). On info pages (`Theme: flow-spacing`, below)
it also keeps the smaller separators (10px and more) in running text, before text, a heading, a
link, an image or a column. On every page (not the homepages and flight status pages, whose
spacing already holds them) it also keeps them between two blocks, after a sidebar (only what goes
beyond 25px: a 40px separator becomes `{spacer-15}`, the sidebar's own spacing holds the rest),
under a heading that ends a live section before a block (`{spacer-0}`: the 1px line only, the
heading keeps its spacing below; `{spacer-24}` on flow-spacing pages, where a separator's space
ends at the block) and under a stage (`{spacer-40}` right after the hero: the live separator at
the end of the stage's section keeps its inline margin).

`{column-start}` at the end of the first element of a Lufthansa column view and `{column-end}` at
the end of its last one give the column view's padding: 32px above and below at every width
(`-outer`: `{column-start-outer}` / `{column-end-outer}`, a column view outside a page section,
20px, 40px from 768px). They combine with the other markers (`Title {heading-small column-start}`;
lists: at the end of the last item); next to a block, an image or a separator the marker is a
paragraph of its own (`{column-end}` alone). On a page with such markers headings add no space of
their own above and images keep 40px below, as on lufthansa.com. The importer writes them on info
pages for one-column views, column views with a title or outside a page section, and column
views nested in a one-column view; remove a pair to drop the padding. A page that ends with a
column view gets no extra space below it; `column-spaced` with the last `{column-end}`
(`{column-end column-spaced}`) keeps 24px there, as the live sections with that spacing.

Section style `padded` (Section Metadata) adds 20px (40px from 768px) above and below the
section, as the padding of the Lufthansa page sections: the importer writes it for every live
section after another padded one (/de/en/boeing787 'Seat maps of the Boeing 787-9'); remove it
to get the normal section spacing.

Below a `grey` section the normal section spacing (48px) applies, unless: `spaced` gives 24px (a
live grey section before an unpadded one that starts with a heading or text, onboard-delights
"Fresh on board"), `before-column` 32px (a grey band before a titled column view of the same live
section, the flight search pages' "This might also be of interest to you"). The importer writes
both; remove them to get the 48px.

Page metadata `Theme: flow-spacing` (the importer writes it on info pages) spaces default content
as lufthansa.com spaces its components: headings add no space of their own above (text → heading
24px), images keep 40px below, the separators of running text are kept as `{spacer-N}` and a
separator's space ends at the next block. Pages with column markers get the same spacing.

### Buttons and links

- Bold link alone in a paragraph: primary (yellow) button. Italic link alone in a paragraph:
  secondary (outlined) button. Bold and italic: dark filled button.
- Plain link alone in a paragraph: navigation link with a large arrow.
- Links in running text get a small arrow before the text (→ on lufthansa.com, ↗ to other
  sites, ↓ to a place on the same page), as on the live site.

The AirCore pages under /lhg/ left the replica on 2026-10-25 (links to them are absolute
www.lufthansa.com links); their look (`body.aircore`), blocks and section styles (`centered`,
`new-tab`, `link-tiles`) were removed.

### Breadcrumb

Not authored in the page: the Metadata block names the page's parent (`Parent`: a link) and,
where the label in trails differs from the page's og:title, `Breadcrumb title`. The trail is
built at runtime by walking up the parents; see `blocks/breadcrumb/README.md` (also `Parent
title` for parents outside the site and `Breadcrumb: hidden`).

### Theme `digital-assistant`

Pages that show the Lufthansa digital assistant on the live site load its stylesheet, which maps
LufthansaHead regular to the bold font file: there every light heading (300) draws bold. The
importer records this as page metadata `Theme: digital-assistant` (`body.digital-assistant`,
styles.css / fonts.css); remove the row to get the light headings.

## Time travel (preview)

Preview the site as it will look at a chosen moment: the stage promotion of the homepage and the Message Center's disruption and flash banners are those of that moment (`scripts/clock.js`, the page's one clock). Add `?time-travel=` to a preview URL:

- `https://main--lh-com--moved-permanently.aem.page/de/en/homepage?time-travel=2026-12-24T09:00`: 09:00 in the market's time zone (de Europe/Berlin, at Europe/Vienna, gb Europe/London), summer time included.
- Another zone: an offset (`2026-12-24T09:00+01:00`, `2026-12-24T08:00Z`) or `&time-zone=America/New_York`. A date alone (`2026-12-24`) is the start of that day; `24.12.2026 09:00` works too.
- A bar at the bottom shows the chosen time and its time zone, with **Back to now**. An unreadable time says so in the bar, and the page shows now.
- Only on `*.aem.page` (main and branch previews) and localhost. On `*.aem.live`, lhcom/lhedge/lhcn.bbird.live the parameter is ignored. Without it the page behaves exactly as without time travel.
- The parameter is not passed on: forms send the page URL without it, share and copy links leave it out. Links on the page do not carry it either; add it again on the next page.
- The moment is fixed while the page is open (reload for a new one). Booking parts (flight search dates, prices, flight status) keep the real date: they ask Lufthansa's live services. The Message Center's GraphQL paths for www and the app (lh-messages) decide by the real time on the server; time travel is for the website preview.

## Installation

```sh
npm i
```

## Linting

```sh
npm run lint
```

## Local development

1. Create a new repository based on the `aem-boilerplate` template
1. Add the [AEM Code Sync GitHub App](https://github.com/apps/aem-code-sync) to the repository
1. Install the [AEM CLI](https://github.com/adobe/helix-cli): `npm install -g @adobe/aem-cli`
1. Start AEM Proxy: `aem up` (opens your browser at `http://localhost:3000`)
1. Open the `lh-com` directory in your favorite IDE and start coding :)
