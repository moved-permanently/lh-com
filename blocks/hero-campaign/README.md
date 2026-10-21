# hero-campaign

Custom **hero** block. Purpose: full-bleed campaign stage with text directly on a background image or muted looping background video.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: 1 column. Row 1: background image (poster), optionally followed by a link to an .mp4 file that plays as a muted, looping, inline background video without controls (started only after the page has loaded; not started for users who prefer reduced motion, who keep the poster). Row 2: heading (H1 on the page stage, H2 further down), optional subtitle (the plain paragraph directly after the heading), optional text paragraph(s), optional CTA link (bold link = primary button). Option right: text aligned right (default left), always vertically centred. A pause/play toggle is shown while a background video is present; its labels default to 'Pause background video' / 'Play background video' (EN) and 'Hintergrundvideo anhalten' / 'Hintergrundvideo abspielen' (DE) and can be overridden with optional trailing rows 'Pause label | ...' and 'Play label | ...'. Defensive: the first image anywhere is the background, the first .mp4 link the video, everything else is text; rows may be merged or split..

## Supported variations

| Variation | Option class |
| --- | --- |
| Text right | `right` |

## Universal Editor fields

N/A (Document Authoring project)
