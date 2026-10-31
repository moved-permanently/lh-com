# hero-campaign

Custom **hero** block. Purpose: full-bleed campaign stage with text directly on a background image or muted looping background video.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: 1 column. Row 1: background image (poster), optionally followed by a link to an .mp4 file that plays as a muted, looping, inline background video without controls (started only after the page has loaded; not started for users who prefer reduced motion, who keep the poster). Row 2: heading (H1 on the page stage, H2 further down), optional subtitle (a short plain paragraph of up to 100 characters directly after the heading), optional text paragraph(s), optional CTA link (bold link = primary button, any other link = secondary button). Default: text on the left of the image over a dark gradient overlay (the full-bleed 810px stage; on mobile the text stays on the image, overlay from the bottom). Option right: the text at the right end of the content column (421px wide from 1025px), overlay from the right. Option card: the text in a white card at the bottom of the image (no overlay), left or with right at the right. Option narrow: a 350px stage instead of 810px. Option regular: a 640px stage (Lufthansa .inspiration-teaser-regular). Without card the text is vertically centred. A pause/play toggle is shown while a background video is present; its labels default to 'Pause background video' / 'Play background video' (EN) and 'Hintergrundvideo anhalten' / 'Hintergrundvideo abspielen' (DE) and can be overridden with optional trailing rows 'Pause label | ...' and 'Play label | ...'. Defensive: the first image anywhere is the background, the first .mp4 link the video, everything else is text; rows may be merged or split..

Option slider (`hero-campaign (slider)`, www.lufthansa-cargo.com's homepage stage): several slides in one block. Each row with a picture starts a slide (its background image, optionally followed by an .mp4 link), the rows after it up to the next picture are that slide's text, written as in a single stage (heading, subtitle, text, CTA): image row, text row, image row, text row, ... The block's other options (`right`, `card`, `narrow`, `regular`) apply to every slide. One slide at a time, full width; previous/next buttons at the sides (from 768px), a dot per slide at the bottom, arrow keys on the focused slider; no automatic rotation. Screen readers get it as carousel-images: a region (aria-roledescription carousel, label 'Stage' / 'Bühne'), each slide a group labelled '1 of 3' / '1 von 3', the buttons 'Previous slide' / 'Next slide' ('Vorherige Folie' / 'Nächste Folie'), the current dot aria-current. Optional label rows: 'Slider label', 'Previous label', 'Next label', 'Slide label' ({n} and {total}). Only the first slide's image loads eagerly. A block with a single slide is a plain stage.

## Supported variations

| Variation | Option class |
| --- | --- |
| Text on the right | `right` |
| White text card | `card` (combine with `right`) |
| Narrow stage (350px) | `narrow` |
| Regular stage (640px) | `regular` |
| Several stages, one at a time | `slider` (combine with the others: they apply to every slide) |

## Universal Editor fields

N/A (Document Authoring project)
