# Discover Airlines: the whole site on lh-discover (brief 124)

Source www.discover-airlines.com, target DA `moved-permanently/lh-discover` (repoless on lh-com's code). The import
runs in batches of about 40 pages (`content-sites/lh-discover/runs/batch-NN.txt`, `tools/importer/discover-import.mjs`,
`tools/importer/discover-check.mjs`); each batch is uploaded and previewed, checked, and published by hand. This file
collects the results; the sections below grow with the batches.

## Media (brief 147, 2026-10-29)

The documents' links to www's DAM files are site-relative links to the replica's copies (`edsDamPath`), answered by
lh-edge's DAM route on discover.turnsthe.page (lh-discover's DA copies, then AEM, then R2; e386aa6). Copies:
`tools/importer/discover-dam.mjs` (list, download through one warm Bright Data session, upload and preview, switch);
the importer writes the relative links for every later batch. 72 files on 26 documents: 66 in lh-discover's DA
(60 PDFs, 2 videos under 36 MB, 4 posters), 5 for the AEM publish tier, 1 missing on www (404):
`/content/dam/four_y/pdfs/raffle/4y_season-kick-off-raffle-terms-and-conditions.pdf`, linked from the sweepstake (left as
www's link). The check-in poster `thumbnail_checkinvideo.jpg` (28,508,716 bytes, 9504 x 5346) is in DA recompressed to
6,857,881 bytes at the same pixel size (JPEG quality 90, metadata stripped).

Files for AEM (Edge Delivery can't hold them):

| www path | edsDamPath | bytes |
| --- | --- | ---: |
| `/content/dam/four_y/videos/250120_FM_Discover_Retrofit_HeroBanner_Uebersicht_v01.mp4` | `/content/dam/four_y/videos/250120-fm-discover-retrofit-herobanner-uebersicht-v01.mp4` | 68,286,566 (on AEM) |
| `/content/dam/four_y/videos/ocean_blue_video_v06.mp4` | `/content/dam/four_y/videos/ocean-blue-video-v06.mp4` | 200,615,093 (on AEM) |
| `/content/dam/four_y/videos/checkinvideo_en.mp4` | `/content/dam/four_y/videos/checkinvideo-en.mp4` | about 41.6 MB (not fetched) |
| `/content/dam/four_y/videos/checkinvideo_cc_en.vtt` | `/content/dam/four_y/videos/checkinvideo-cc-en.vtt` | 72 |
| `/content/dam/four_y/videos/checkinvideo_ad_en.vtt` | `/content/dam/four_y/videos/checkinvideo-ad-en.vtt` | 751 |

## Open points

### Forms: preview only, until the test submissions

Since 2026-10-29 (lh-forms 3dba488, deployed in both accounts) the Discover forms submit like the Lufthansa forms: lh-forms
accepts the lh-discover origins and discover.turnsthe.page, knows the ten `discover-*` form ids (titles from www's h1 in en
and de) and takes files on the two contact forms by www's rule; no recipient entry, so they mail to the worker's
default recipient. Every form block on lh-discover has its `form` config row with its id, and `success` and `error`
rows to the language version's thank-you and error pages (`discover-import.mjs` withDiscoverForm, also for later
batches and roots). They stay on preview, marked "form, preview only" in the batch reports, until the bot check's host
list has lh-discover's hosts and the test submissions are made; then they are published with their thank-you and error
pages.

| page | form id | success | error | fields | uploads |
| --- | --- | --- | --- | ---: | --- |
| `/de/en/book/assistance-requirements/accessible-travel/register-assistance-requirements-online` | `discover-assistance` | none (www 404) | `/de/en/my-bookings/manage/customer-service/contact-form/error` (www 404) | 22 | no |
| `/de/en/book/baggage/sports-baggage-and-special-baggage/add-sports-baggage` | `discover-add-sports-baggage` | `…/add-sports-baggage/thank-you` | `…/add-sports-baggage/error` | 60 | no |
| `/de/en/book/baggage/sports-baggage-and-special-baggage/register-ammunition` | `discover-register-ammunition` | `…/register-ammunition/thank-you` | `…/register-ammunition/error` | 20 | no |
| `/de/en/book/baggage/sports-baggage-and-special-baggage/register-hunting-firearm` | `discover-register-hunting-firearm` | `…/register-hunting-firearm/thank-you` | `…/register-hunting-firearm/error` | 39 | no |
| `/de/en/book/baggage/sports-baggage-and-special-baggage/register-sporting-firearm` | `discover-register-sporting-firearm` | `…/register-sporting-firearm/thank-you` | `…/register-sporting-firearm/error` | 39 | no |
| `/de/en/book/special-requests/pets/animal-cargo-hold/register-animal-cargo-hold` | `discover-register-animal-cargo-hold` | `…/register-animal-cargo-hold/thank-you` | `…/register-animal-cargo-hold/error` | 21 | no |
| `/de/en/book/special-requests/pets/animal-in-cabin/register-animal-cabin` | `discover-register-animal-cabin` | none (www 404) | `/de/en/my-bookings/manage/customer-service/contact-form/error` (www 404) | 17 | no |
| `/de/en/my-bookings/manage/customer-service/contact-form/compensation-baggage` | `discover-compensation-baggage` | `…/contact-form/thank-you` | `…/contact-form/error` | 28 | yes: 5 files, 3,145,728 bytes each, JPEG/PDF |
| `/de/en/my-bookings/manage/customer-service/contact-form/other-concerns` | `discover-other-concerns` | `…/contact-form/thank-you` | `…/contact-form/error` | 24 | yes: as above |
| `/us/de/buccaneers-season-kickoff`, `/xx/de/buccaneers-season-kickoff` (own pages, noindex) | `discover-buccaneers-season-kickoff` | none (www 404) | `/de/de/my-bookings/manage/customer-service/contact-form/error` | 4 | no |

The claims page (`…/contact-form/compensation-flight-irregularities`) stays a link to www: the claims app forbids
framing outside discover-airlines.com and lufthansa.com. The tables below are the state before (2026-10-29, morning).

Discover's form pages so far (batches 1 to 3, de/en). Fields: input rows of the form block (text, email, tel, date,
select, radio, checkbox, textarea, file), without steps, fieldsets, notes and the submit button. Where www's form posts,
from the snapshot: every one is an AEM core form container, `<form method="POST" enctype="application/x-www-form-urlencoded">`
whose `action` is the page's own AEM path on www (`https://www.discover-airlines.com/content/four_y/markets/de/en/<path>.html`);
the snapshots show no other submit service.

| page | form | fields | posts to (www) | batch |
| --- | --- | ---: | --- | --- |
| `/de/en/book/assistance-requirements/accessible-travel/register-assistance-requirements-online` | assistance requirements registration (5 steps) | 22 | `/content/four_y/markets/de/en/book/assistance-requirements/accessible-travel/register-assistance-requirements-online.html` | 1 |
| `/de/en/book/baggage/sports-baggage-and-special-baggage/add-sports-baggage` | sports baggage registration (3 steps) | 60 | `/content/four_y/markets/de/en/book/baggage/sports-baggage-and-special-baggage/add-sports-baggage.html` | 1 |
| `/de/en/book/baggage/sports-baggage-and-special-baggage/register-ammunition` | ammunition registration (3 steps) | 20 | `/content/four_y/markets/de/en/book/baggage/sports-baggage-and-special-baggage/register-ammunition.html` | 1 |
| `/de/en/book/baggage/sports-baggage-and-special-baggage/register-hunting-firearm` | hunting firearm registration (4 steps) | 39 | `/content/four_y/markets/de/en/book/baggage/sports-baggage-and-special-baggage/register-hunting-firearm.html` | 1 |
| `/de/en/book/baggage/sports-baggage-and-special-baggage/register-sporting-firearm` | sporting firearm registration (4 steps) | 39 | `/content/four_y/markets/de/en/book/baggage/sports-baggage-and-special-baggage/register-sporting-firearm.html` | 1 |
| `/de/en/book/special-requests/pets/animal-cargo-hold/register-animal-cargo-hold` | animal in the cargo hold registration (3 steps) | 21 | `/content/four_y/markets/de/en/book/special-requests/pets/animal-cargo-hold/register-animal-cargo-hold.html` | 1 |
| `/de/en/book/special-requests/pets/animal-in-cabin/register-animal-cabin` | animal in the cabin registration (3 steps) | 17 | `/content/four_y/markets/de/en/book/special-requests/pets/animal-in-cabin/register-animal-cabin.html` | 1 |
| `/de/en/my-bookings/manage/customer-service/contact-form/compensation-baggage` | contact form: baggage compensation (8 steps, a file upload) | 28 | `/content/four_y/markets/de/en/my-bookings/manage/customer-service/contact-form/compensation-baggage.html` | 3 |
| `/de/en/my-bookings/manage/customer-service/contact-form/other-concerns` | contact form: other concerns (6 steps, a file upload) | 24 | `/content/four_y/markets/de/en/my-bookings/manage/customer-service/contact-form/other-concerns.html` | 3 |

| `/de/en/my-bookings/manage/customer-service/contact-form/compensation-flight-irregularities` | claim form for flight disruptions (EU 261/2004): an iframe of `https://claims.discover-airlines.com/discover/v1/en/claims/start?embedded=1`, not a form block | not in the snapshot (the claims app inside the iframe) | the claims app on `claims.discover-airlines.com` | 3 |

The claims page has no form block: www embeds the claims app in an iframe, which lh-com's `embed` block doesn't play
(YouTube and the in-flight entertainment widget only). On lh-discover it shows the page text and a link "Claim form" to
the page on www.discover-airlines.com (`discover-import.mjs` withLinkOuts), like the timetable (an iframe of
`rms.discover-airlines.com/rms/en/flight-schedule`, link "Timetable"). It counts as a form page: preview only.

The de/de versions of these pages come with batches 5 to 8 and will be added here.
