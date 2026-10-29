# Discover Airlines: the whole site on lh-discover (brief 124)

Source www.discover-airlines.com, target DA `moved-permanently/lh-discover` (repoless on lh-com's code). The import
runs in batches of about 40 pages (`content-sites/lh-discover/runs/batch-NN.txt`, `tools/importer/discover-import.mjs`,
`tools/importer/discover-check.mjs`); each batch is uploaded and previewed, checked, and published by hand. This file
collects the results; the sections below grow with the batches.

## Open points

### Forms: preview only

The forms can't work on lh-discover: lh-forms answers 403 to the lh-discover origin, and Discover's form pages are not
in `FORM_IDS`. Every Discover page with a `form` block stays on preview (not published) and is marked "form, preview only"
in the batch reports; nothing is built for them until this is decided. The seven of batch 1 were taken off live again on
2026-10-29 (they stay on preview).

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
