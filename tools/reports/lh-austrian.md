# Austrian Airlines on lh-com's code (lh-austrian)

2026-10-31. Site `moved-permanently/lh-austrian` (repoless, lh-com's code), preview
`https://main--lh-austrian--moved-permanently.aem.page/` (`/metadata.json`: `robots noindex,nofollow`,
`brand austrian`). Nothing on `.aem.live`. DA uploads and previews run as IMS user benp@adobe.com.
Built the way lh-ita was (`tools/reports/lh-ita.md`): the Studio's groundwork lists
(`content-sites/lh-austrian/lists/`), its snapshot archives 001-015 placed as snapshots
(`austrian-studio.mjs`), scope and plan, offline import with lh-com's importers, DAM copies,
checks, `da-upload.mjs --site lh-austrian`, one batch after the other (`austrian-batch.mjs`).

## How www.austrian.com answers

- Plain requests: Cloudflare "Access Denied" 403. `.migration/project.json` has
  `sites.lh-austrian.botProtected: true` (gitignored).
- Pages come from the Studio's snapshots only; no page was captured in this run.
- Files (DAM copies) through one warm Bright Data session (`/at/en/homepage` first, one request
  every 8-10 s). Stops, each followed by 30 minutes without Bright Data:
  - 02:10 UTC: a fetch error (no HTTP status) for `2025-os-delayed-baggage-de.mp4`; the same file
    came in on the next try (30.3 MB, in DA);
  - 02:49 and 03:27 UTC: 403 for the one-byte GET (`Range: bytes=0-0`) of
    `2025-os-chat-assistant-rebooking-en.mp4` and `2025-os-chat-assistant-refund-en.mp4`
    (the Studio's list has both as 200; the other videos answered the same request). Both are
    recorded `www-403-range` and not asked again: `/at/en/fly/flight-information/flight-disruptions`
    links www's files.
- Two live page loads before the workspace flag was set (2026-10-31 00:49 and 01:08 UTC, trial
  imports: `run-bulk-import.js` loads pages live unless the workspace's `.migration/project.json`
  says `botProtected`); both answered "Access Denied", followed by a 30-minute stop. Since then
  `austrian-import.mjs` (and `ita-import.mjs`) set the flag before the import, give the bulk
  importer no Bright Data endpoint, and load the snapshot under a CSP that allows no
  subresource (0 requests to www per page, measured).

## Theme `austrian`

`scripts/brand.js` `austrian: { name: 'Austrian Airlines', oneTrust: '01994cb3-6317-72f4-8589-1be98309c258' }`
(the OneTrust id from the homepage snapshot). `styles/themes/austrian.css`, tokens only: text
`#1a1a1a`, Austrian red `#d81e05` (primary button, footer link area), hover `#ac1804`, greys
`#f6f6f6 #e7e7e7 #d1d1d1 #b0b0b0 #888 #5d5d5d #4d4d4d #262626`, links `#4d4d4d` / hover
`#ac1804`, focus `#0968f6`, success `#007d35`; white header bar with the red wordmark
(`/etc/designs/os/clientlib-all/vite/img/austrian-logo.svg`), red footer with white text and the
white "servus" wordmark. Fonts at www's paths, no copies in the repository:
`/digitalhangar/design-system/releases/mausy-v1.40.1/standalone/fonts/austrian/` first (the
replica's own path, for lh-edge), `https://www.austrian.com/...` second: Portada 400
(`Portada-Regular.woff2`), Portada 500-700 (`Portada-SemiBold.woff2`), CoreSans 400
(`CoreSansRegular.woff2`), CoreSans 500-700 (`CoreSansMedium.woff2`). Headings Portada, body
CoreSans 16/24 (`--body-font-size-m: 16px`).

Shared code, additive (default today's value; lh-com's footer checked unchanged locally, the
new rules apply only with a `wordmark` section or the token set): `blocks/message-center` panel text from `--body-font-size-m` and `--body-line-height`;
footer block: an optional section with Style `wordmark` (an image row at the top of the link
area; without it the footer is as before).

The preview runs `main` of lh-com on GitHub: until the local commits are pushed, lh-austrian's
preview shows lh-com's look (no `austrian` theme, no wordmark row). The consent banner's colours
come from `scripts/consent.js` (another session's file, not changed).

## Columns

The groundwork's "none of 349 `.twocolumn` match columns-media" came from selectors run in
jsdom. In the browser import lh-com's selectors take Austrian's `.twocolumn` directly in
`.section-content` as columns-media rows (77 on the pilot pages): no template variant and no
parser option needed. Teaser twocolumns become cards (`withTeaserColumns`). Open: www's tabs
(8 on batch 1, 22 in all) become their panels one after the other, not `profile-tabs`.

## Nav and footer (at/en, at/de)

`tools/importer/austrian-nav.mjs` from the homepage snapshots, 1:1: the red wordmark, the
quick actions (Book, My flights, Check-in, Flight status), the menu (Book & Prepare, My bookings,
Discover Austrian, Miles & More ... 116 links), login, the country and language. Footer: the
"servus" wordmark row (Style `wordmark`), the link lists, payment methods and social links
(`badges`), the legal row, the logo row (Austrian, member of Lufthansa Group, Star Alliance).
Three SVGs Edge Delivery refuses at preview (409 from content-bus) are PNG renderings of the same
drawing in `/media-da/austrian/`: `paypal.svg` (56 KB, an embedded PNG), and the 32 px icons
`os-world-of-austrian-chevron_32px.svg` (409 KB) and `service-offline-payment_32px.svg` (218 KB)
(`LOCAL_IMAGES`, `withLocalImages`). The reference roots' 87 www SVGs (fetched once,
2026-10-31) hold four more of about 400 KB (`ife-audio_32px`, `service-checkin_32px`,
`product-add-pass_32px`, `product-train-carrier_32px`; `/fly/on-board/lhg-wifi` got the 409):
PNGs too; every other SVG is 21 KB or less. Every lh-austrian document has `nav` and `footer` metadata
rows for its root.

## Experience fragments

72 context-teaser fragments per language, 165 uses on 53 pages (at/en and at/de alike): 32 on one
page, 32 on 2-4, 8 on 5-9 (business-class 8, upgrades 7, travel-id 6, families-travel-prep 6,
airport-vienna, additional-baggage, free-baggage, app 5), none on more. Imported inline as cards;
fragment documents are not worth it at this reuse (the 8 most used would be the candidates).

## Forms

| page | fields | attachments on www | lh-forms | preview |
|---|---|---|---|---|
| /at/en/anfrage-gutscheine | 18 | 5 × 3.70 MB | yes, once `austrian-anfrage-gutscheine` and lh-austrian's origins are registered; attachments capped at 3.5 MB total (www up to 18.5 MB) | 200 |
| /at/en/book/groups-and-enterprises/exclusive-charter/exclusive-charter-enquiry | 19 | none | yes, once `austrian-exclusive-charter-enquiry` and lh-austrian's origins are registered | 200 |
| /at/en/contact-form-baggage | 39 | 5 × 3.70 MB | yes, once `austrian-contact-form-baggage` and lh-austrian's origins are registered; attachments capped at 3.5 MB total (www up to 18.5 MB) | 200 |
| /at/en/contact-form-booking-confirmation | 20 | 5 × 3.70 MB | yes, once `austrian-contact-form-booking-confirmation` and lh-austrian's origins are registered; attachments capped at 3.5 MB total (www up to 18.5 MB) | 200 |
| /at/en/contact-form-booking | 30 | 5 × 2.05 MB | yes, once `austrian-contact-form-booking` and lh-austrian's origins are registered; attachments capped at 3.5 MB total (www up to 10.2 MB) | 200 |
| /at/en/contact-form-charter | 15 | 5 × 3.70 MB | yes, once `austrian-contact-form-charter` and lh-austrian's origins are registered; attachments capped at 3.5 MB total (www up to 18.5 MB) | 200 |
| /at/en/contact-form-medical-request | 32 | 5 × 2.05 MB | yes, once `austrian-contact-form-medical-request` and lh-austrian's origins are registered; attachments capped at 3.5 MB total (www up to 10.2 MB) | 200 |
| /at/en/contact-form-other | 16 | 5 × 3.70 MB | yes, once `austrian-contact-form-other` and lh-austrian's origins are registered; attachments capped at 3.5 MB total (www up to 18.5 MB) | 200 |
| /at/en/contact-form-passenger-receipt | 17 | 5 × 3.70 MB | yes, once `austrian-contact-form-passenger-receipt` and lh-austrian's origins are registered; attachments capped at 3.5 MB total (www up to 18.5 MB) | 200 |
| /at/en/contact-form-rebooking | 30 | 5 × 3.70 MB | yes, once `austrian-contact-form-rebooking` and lh-austrian's origins are registered; attachments capped at 3.5 MB total (www up to 18.5 MB) | 200 |
| /at/en/contact-form-refund-seat-reservation | 25 | 5 × 3.70 MB | yes, once `austrian-contact-form-refund-seat-reservation` and lh-austrian's origins are registered; attachments capped at 3.5 MB total (www up to 18.5 MB) | 200 |
| /at/en/contact-form-requested-documents | 16 | 5 × 3.70 MB | yes, once `austrian-contact-form-requested-documents` and lh-austrian's origins are registered; attachments capped at 3.5 MB total (www up to 18.5 MB) | 200 |
| /at/en/contact-form-seat-meal-requests | 35 | 5 × 3.70 MB | yes, once `austrian-contact-form-seat-meal-requests` and lh-austrian's origins are registered; attachments capped at 3.5 MB total (www up to 18.5 MB) | 200 |
| /at/en/data-protection-contact | 28 | 5 × 5.00 MB, required | yes, once `austrian-data-protection-contact` and lh-austrian's origins are registered; attachments capped at 3.5 MB total (www up to 25.0 MB) | 200 |
| /at/en/emergency-contact | 14 | none | yes, once `austrian-emergency-contact` and lh-austrian's origins are registered | 200 |
| /at/en/fly/check-in/private-check-in-counter | 18 | 1 × 3.70 MB | yes, once `austrian-private-check-in-counter` and lh-austrian's origins are registered; attachments capped at 3.5 MB total (www up to 3.7 MB) | 200 |
| /at/en/request-traveling-with-animals | 25 | 5 × 3.70 MB | yes, once `austrian-request-traveling-with-animals` and lh-austrian's origins are registered; attachments capped at 3.5 MB total (www up to 18.5 MB) | 200 |
| /at/de/anfrage-bestaetigung | 20 | 5 × 3.70 MB | yes, once `austrian-anfrage-bestaetigung` and lh-austrian's origins are registered; attachments capped at 3.5 MB total (www up to 18.5 MB) | 200 |
| /at/de/anfrage-charterfluege | 15 | 5 × 3.70 MB | yes, once `austrian-anfrage-charterfluege` and lh-austrian's origins are registered; attachments capped at 3.5 MB total (www up to 18.5 MB) | 200 |
| /at/de/anfrage-flugbuchung | 30 | 5 × 2.05 MB | yes, once `austrian-anfrage-flugbuchung` and lh-austrian's origins are registered; attachments capped at 3.5 MB total (www up to 10.2 MB) | 200 |
| /at/de/anfrage-gepaeck | 44 | 5 × 3.70 MB | yes, once `austrian-anfrage-gepaeck` and lh-austrian's origins are registered; attachments capped at 3.5 MB total (www up to 18.5 MB) | 200 |
| /at/de/anfrage-gutscheine | 18 | 5 × 3.70 MB | yes, once `austrian-anfrage-gutscheine` and lh-austrian's origins are registered; attachments capped at 3.5 MB total (www up to 18.5 MB) | 200 |
| /at/de/anfrage-rechnung | 17 | 5 × 3.70 MB | yes, once `austrian-anfrage-rechnung` and lh-austrian's origins are registered; attachments capped at 3.5 MB total (www up to 18.5 MB) | 200 |
| /at/de/anfrage-reisen-mit-tieren | 25 | 5 × 3.70 MB | yes, once `austrian-anfrage-reisen-mit-tieren` and lh-austrian's origins are registered; attachments capped at 3.5 MB total (www up to 18.5 MB) | 200 |
| /at/de/anfrage-sitzplatz-menueauswahl | 35 | 5 × 3.70 MB | yes, once `austrian-anfrage-sitzplatz-menueauswahl` and lh-austrian's origins are registered; attachments capped at 3.5 MB total (www up to 18.5 MB) | 200 |
| /at/de/anfrage-sonstige-themen | 16 | 5 × 2.05 MB | yes, once `austrian-anfrage-sonstige-themen` and lh-austrian's origins are registered; attachments capped at 3.5 MB total (www up to 10.2 MB) | 200 |
| /at/de/betroffenenrechte-anfrage | 28 | 5 × 5.00 MB, required | yes, once `austrian-betroffenenrechte-anfrage` and lh-austrian's origins are registered; attachments capped at 3.5 MB total (www up to 25.0 MB) | 200 |
| /at/de/book/groups-and-enterprises/exclusive-charter/exclusive-charter-enquiry | 19 | none | yes, once `austrian-exclusive-charter-enquiry` and lh-austrian's origins are registered | 200 |
| /at/de/fluggaeste-mit-betreuungsbedarf | 32 | 5 × 3.70 MB | yes, once `austrian-fluggaeste-mit-betreuungsbedarf` and lh-austrian's origins are registered; attachments capped at 3.5 MB total (www up to 18.5 MB) | 200 |
| /at/de/fly/check-in/private-check-in-counter | 18 | 1 × 3.70 MB | yes, once `austrian-private-check-in-counter` and lh-austrian's origins are registered; attachments capped at 3.5 MB total (www up to 3.7 MB) | 200 |
| /at/de/formular-upload-angeforderter-dokumente | 16 | 5 × 3.70 MB | yes, once `austrian-formular-upload-angeforderter-dokumente` and lh-austrian's origins are registered; attachments capped at 3.5 MB total (www up to 18.5 MB) | 200 |
| /at/de/notfallkontakt | 14 | none | yes, once `austrian-notfallkontakt` and lh-austrian's origins are registered | 200 |
| /at/en/anfrage-gruppenreisen | 29 | none | yes, once `austrian-anfrage-gruppenreisen` and lh-austrian's origins are registered | 200 |
| /at/en/footer-pages/help-and-contact/bagdamage | 23 | 5 × 3.70 MB, required | yes, once `austrian-bagdamage` and lh-austrian's origins are registered; attachments capped at 3.5 MB total (www up to 18.5 MB) | 200 |
| /at/en/footer-pages/help-and-contact/request-for-refund-of-expenses | 103 | 5 × 3.70 MB | yes, once `austrian-request-for-refund-of-expenses` and lh-austrian's origins are registered; attachments capped at 3.5 MB total (www up to 18.5 MB) | 200 |
| /at/de/anfrage-gruppenreisen | 29 | none | yes, once `austrian-anfrage-gruppenreisen` and lh-austrian's origins are registered | 200 |
| /at/de/anfrage-umbuchung | 30 | 5 × 3.70 MB | yes, once `austrian-anfrage-umbuchung` and lh-austrian's origins are registered; attachments capped at 3.5 MB total (www up to 18.5 MB) | 200 |
| /at/de/footer-pages/help-and-contact/application-for-compensation-in-the-event-of-flight-irregularities | 101 | 5 × 3.70 MB | yes, once `austrian-application-for-compensation-in-the-event-of-flight-irregularities` and lh-austrian's origins are registered; attachments capped at 3.5 MB total (www up to 18.5 MB) | 200 |
| /at/de/footer-pages/help-and-contact/bagdamage | 23 | 5 × 3.70 MB, required | yes, once `austrian-bagdamage` and lh-austrian's origins are registered; attachments capped at 3.5 MB total (www up to 18.5 MB) | 200 |
| /at/de/footer-pages/help-and-contact/contact-form-refund/refund-form | 22 | none | yes, once `austrian-refund-form` and lh-austrian's origins are registered | 200 |
| /at/de/footer-pages/help-and-contact/request-for-refund-of-expenses | 103 | 5 × 3.70 MB | yes, once `austrian-request-for-refund-of-expenses` and lh-austrian's origins are registered; attachments capped at 3.5 MB total (www up to 18.5 MB) | 200 |

All forms preview only: lh-forms takes them once the ids (`austrian-<page name>`, 35 for the 41
pages; en and de share the id where the page name is the same) and lh-austrian's origins are
registered. Fields: at most 103, under lh-forms' 400. Attachments: lh-forms takes 3.5 MB per
submission in all (`MAIL_FILES.maxTotal`); www takes up to 5 files of 2.05, 3.7 or 5 MB each
(bagdamage: required). The success row is www's confirmation page (its `:redirect`):
`/at/en/form-confirmation`, at/de's content path
`/at/de/footer-pages/help-and-contact/form-confirmation` (`/at/de/form-confirmation` is 404 on
www), the emergency contact and private check-in counter their own confirmation pages (batch
44). The error row is the parser's `/error.html`, which lh-austrian doesn't have (404).

## Pilot: batches 1-8 and 44 (at/en, at/de)

| batch | pages | documents previewed (with nav, footer, re-previews) | with an H1 | images | contents |
|---|---|---|---|---|---|
| 1 (`runs/batch-01.txt`) | 79 | 83/83 | 74 | 551 | at/en: homepage, nav, footer, book, online check-in, flight status, flight booking (+ at/de homepage) |
| 2 (`runs/batch-02.txt`) | 77 | 79/79 | 74 | 517 | at/de: the same pages as batch 1 |
| 3 (`runs/batch-03.txt`) | 50 | 53/53 | 50 | 312 | at/en: additional services, ADM, AGB, AIRail, aircraft (A320 ...), book |
| 4 (`runs/batch-04.txt`) | 50 | 52/52 | 49 | 157 | at/en: footer pages, fly, legal, FAQ |
| 5 (`runs/batch-05.txt`) | 49 | 52/52 | 47 | 203 | at/en: plan, footer pages, premium economy, privacy, regulations |
| 6 (`runs/batch-06.txt`) | 49 | 51/51 | 48 | 304 | at/de: the pages of batch 3 |
| 7 (`runs/batch-07.txt`) | 49 | 54/54 | 49 | 192 | at/de: the pages of batch 4 |
| 8 (`runs/batch-08.txt`) | 49 | 55/55 | 50 | 267 | at/de: the pages of batch 5 |
| 44 (`runs/batch-44.txt`) | 6 | 13/13 | 9 | 99 | the form confirmation pages (at/en, at/de) |

## Large files for AEM

DAM copies of the pilot (at/en, at/de): in DA and previewed 66, for AEM 15, www 404 65 (63 old
`.docx` of Canada's historical conditions of carriage under
`/content/dam/aua/images/local-pages/nyc/ca/`, linked from
`/at/en/legal/conditions-of-carriage/conditions-of-carriage-canada`; the shark video's `.vtt`;
one `/content/os/gc/de` link), refused to the one-byte GET 2 (the two chat assistant videos,
linked to www). The documents link www's file where it is 404 or refused. Per batch:
`runs/batch-NN-aem.tsv` (page, Edge Delivery path, www path, bytes). As on lh-ita every `.vtt`
is for AEM, and so is the 353.9 MB shark video (size from the Studio list, not requested).

| www path | bytes | pages |
|---|---|---|
| `/content/dam/video/travel-briefing/chat-assistant-rebooking-os/2025-os-chat-assistant-rebooking-de-cc.vtt` | 2671 | /at/de/fly/flight-information/flight-disruptions |
| `/content/dam/video/travel-briefing/chat-assistant-rebooking-os/2025-os-chat-assistant-rebooking-de-ad.vtt` | 429 | /at/de/fly/flight-information/flight-disruptions |
| `/content/dam/video/travel-briefing/chat-assistant-refund-os/2025-os-chat-assistant-refund-de-cc.vtt` | 2000 | /at/de/fly/flight-information/flight-disruptions |
| `/content/dam/video/travel-briefing/chat-assistant-refund-os/2025-os-chat-assistant-refund-de-ad.vtt` | 486 | /at/de/fly/flight-information/flight-disruptions |
| `/content/dam/aua/videos/AUAShark_Doku_clean_klein.mp4` | 353930000 | /at/de/footer-pages/carbon-neutral-flying/mindful-travelling /at/en/footer-pages/carbon-neutral-flying/mindful-travelling |
| `/content/dam/aua/videos/os-how-to-stow-AD-de.vtt` | 1685 | /at/de/handgepaeck |
| `/content/dam/video/travel-briefing/delayed-baggage-os/2025-os-delayed-baggage-de-cc.vtt` | 2818 | /at/de/missing-baggage |
| `/content/dam/video/travel-briefing/delayed-baggage-os/2025-os-delayed-baggage-de-ad.vtt` | 643 | /at/de/missing-baggage |
| `/content/dam/video/travel-briefing/chat-assistant-rebooking-os/2025-os-chat-assistant-rebooking-en-cc.vtt` | 2431 | /at/en/fly/flight-information/flight-disruptions |
| `/content/dam/video/travel-briefing/chat-assistant-rebooking-os/2025-os-chat-assistant-rebooking-en-ad.vtt` | 571 | /at/en/fly/flight-information/flight-disruptions |
| `/content/dam/video/travel-briefing/chat-assistant-refund-os/2025-os-chat-assistant-refund-en-cc.vtt` | 1877 | /at/en/fly/flight-information/flight-disruptions |
| `/content/dam/video/travel-briefing/chat-assistant-refund-os/2025-os-chat-assistant-refund-en-ad.vtt` | 637 | /at/en/fly/flight-information/flight-disruptions |
| `/content/dam/aua/videos/os-how-to-stow-AD-en.vtt` | 1669 | /at/en/handgepaeck |
| `/content/dam/video/travel-briefing/delayed-baggage-os/2025-os-delayed-baggage-en-cc.vtt` | 2957 | /at/en/missing-baggage |
| `/content/dam/video/travel-briefing/delayed-baggage-os/2025-os-delayed-baggage-en-ad.vtt` | 880 | /at/en/missing-baggage |

## Batches 9-43 (2026-10-31): the other reference roots and the market roots

From the Studio's snapshots (no page captured), one batch after the other, 05:06-09:12 UTC; every
document previewed, 0 preview problems. The documents previewed include each root's nav and
footer and the documents the DAM switch changed.

| batches | root | pages | documents previewed |
|---|---|---|---|
| 9-12 | fr/fr | 204 | 57, 54, 54, 53 |
| 13-16 | it/it | 203 | 54, 55, 53, 53 |
| 17-20 | ru/ru | 199 | 53, 53, 52, 52 |
| 21-24 | es/es | 201 | 54, 54, 54, 51 |
| 25-28 | gr/el | 202 | 54, 54, 53, 52 |
| 29-32 | jp/ja | 206 | 55, 55, 55, 53 |
| 33-36 | pl/pl | 202 | 53, 54, 54, 52 |
| 37-40 | cn/zh | 206 | 56, 55, 55, 52 |
| 41 | own pages of 18 market roots | 33 | 70 |
| 42 | homepages of 32 market roots | 32 | 97 |
| 43 | homepages of 22 market roots | 22 | 66 |

All told: the scope's 2168 documents (language 2081, market homepages 54, own pages 33) and the
nav and footer of all 64 roots (128) are on the preview. One under its Edge Delivery name: www's
`/ca/en/local-page/austrian_in_canada` is `/ca/en/local-page/austrian-in-canada` (a
`redirects.json` row for the www path). The market homepages have no H1, as on www. DAM copies
in all: 175 in DA and previewed, 15 for AEM, 65 www 404, 2 refused to the one-byte GET; one PDF
in DA answers 409 at preview twice
(`/content/dam/aua/images/local-pages/nyc/ca/historical-conditions-of-carriage-ca/pdfs/16Aug2024.pdf`,
382 KB; the page links www's file). The reference roots' language pages link the English videos'
`.vtt` (`runs/batch-NN-aem.tsv`); no new file for AEM after the pilot.

## Other findings

- `/at/en/fly/flight-information/flight-irregularities` (and at/de): the current disruption
  message (City Airport Train) is a Message Center item: the page has an empty `message-center`
  block, which shows nothing until lh-austrian has a `/message-center/index.json`.
- `/at/en/legal/terms-and-conditions`: www links `https://lufthansa.com/de/de/common/terms-and-conditions.html`;
  the import writes `https://www.lufthansa.com/...` (the check counts it as made by the import).
- `mobile-check-in`: a redirect on at/en and at/de (to `/fly/at-the-airport/orientation-at-airports/boarding`),
  left out on every root as the Studio's batches do: a `redirects.json` row.
- Own market pages without any snapshot (404 on www according to the Studio) are left out
  (`scope.json` `ownWithoutSnapshot`).
- `/at/en/culinaryjourney` links out to www's culinary hub (micro-frontend); the check-in
  deadline search and the help centre link out as on lh-ita.

## For the Workers and shared config (not changed here)

- lh-forms: the 35 form ids and lh-austrian's origins; attachments over 3.5 MB.
- lh-proxy / the Lufthansa service API: lh-austrian's preview origin, if the flight search, fare
  teasers and airport names should work there.
- lh-edge: the font path `/digitalhangar/design-system/releases/mausy-v1.40.1/standalone/fonts/austrian/`
  and www's DAM paths on an lh-austrian host.
- Message Center content for lh-austrian (flash teaser, message-center).
