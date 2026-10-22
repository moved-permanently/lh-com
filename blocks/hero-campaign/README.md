# hero-campaign

Custom **hero** block. Purpose: full-bleed campaign stage with text directly on a background image or muted looping background video.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: 1 column. Row 1: background image (poster), optionally followed by a link to an .mp4 file that plays as a muted, looping, inline background video without controls (started only after the page has loaded; not started for users who prefer reduced motion, who keep the poster). Row 2: heading (H1 on the page stage, H2 further down), optional subtitle (a short plain paragraph of up to 100 characters directly after the heading), optional text paragraph(s), optional CTA link (bold link = primary button, any other link = secondary button). Default: text on the left of the image over a dark gradient overlay (the full-bleed 810px stage; on mobile the text stays on the image, overlay from the bottom). Option right: the text at the right end of the content column (421px wide from 1025px), overlay from the right. Option card: the text in a white card at the bottom of the image (no overlay), left or with right at the right. Option narrow: a 350px stage instead of 810px. Without card the text is vertically centred. A pause/play toggle is shown while a background video is present; its labels default to 'Pause background video' / 'Play background video' (EN) and 'Hintergrundvideo anhalten' / 'Hintergrundvideo abspielen' (DE) and can be overridden with optional trailing rows 'Pause label | ...' and 'Play label | ...'. Defensive: the first image anywhere is the background, the first .mp4 link the video, everything else is text; rows may be merged or split..

## Supported variations

| Variation | Option class |
| --- | --- |
| Text on the right | `right` |
| White text card | `card` (combine with `right`) |
| Narrow stage (350px) | `narrow` |

## Universal Editor fields

N/A (Document Authoring project)
