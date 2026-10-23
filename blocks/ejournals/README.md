# ejournals

Custom **ejournals** block. Purpose: the logged-out view of the live eJournals download (`.ejournals > .dcep-ejournals`) as content: an info box "Log in with your profile to select a booking." with "Go to login", the field "Booking code or ticket number" and the yellow "To free download" button. Render-only: the login link and the button lead to lufthansa.com, nothing is sent.

## Authoring (Document Authoring)

Model: `standalone`. 2 columns, label | value, all rows optional (an empty block is the normal case):

| Row | Value | Default |
| --- | --- | --- |
| Login link | link | the live Travel ID login (`https://api.travelid.lufthansa.com/oauth2/authorize?client_id=…&state=/{cc}/{ll}/unterhaltung-an-bord&…&country={CC}&lang={ll}`, the URL of the live page's own login links; after the login Travel ID returns to the page on www.lufthansa.com) |
| Live page | link (the form action) | https://www.lufthansa.com + page path + `#login` |
| Notice label, Login label, Field label, Submit label | text | see below |

Texts: authored row, then the live labels (GET /service/api/labels/common/lh/{lang}: `common.bookingcodeselection.container.messageBoxTitle`, `…loginLinkText`; GET /service/api/labels/ejournals/lh/{lang}: `ejournals.searchmask.default.pnrOrTicketNumber.label`, `…submitSearch`), then the built-in copies:

| | en | de |
| --- | --- | --- |
| Notice | Log in with your profile to select a booking. (recorded) | Melden Sie sich mit Ihrem Profil an, um eine Buchung auszuwählen. (recorded) |
| Login | Go to login (recorded) | Zum Login (recorded) |
| Field | Booking code or ticket number (bundle default of chunk 2d00a8ef) | Buchungscode oder Ticketnummer (unverified) |
| Submit | To free download (live) | Zum kostenlosen Download (unverified) |

The German field and button texts are not in any snapshot or recording (all four snapshots caught the component at "Loading..."); they are replaced by the live text as soon as labels/ejournals/lh/de is recorded (or answers directly).

## Behaviour

- Look of the dcep booking selection container (as online-check-in renders it, same CSS as booking-lookup): #f5f5f5 info box with icon, the copy and the 14px bold "Go to login" link with arrow; below, the 335px underlined field (label inside, moving up on focus, max 13 characters) and the primary button (full width below 768px).
- The field has no name and the form is a GET to the live page: pressing the button opens the live page at its Login heading, where the real component looks the booking up (POST /service/api/ejournals, which needs the live session). Nothing typed here leaves the page.
- `data-lh-source`: live / recorded / none of the two label bundles.
- Left out (logged-in states of the live app): the booking list of a logged-in profile, the last-name step, the result list with the download link, the error messages.

## Import

Source: `.ejournals > .dcep-ejournals` on /{de/de,de/en,at/de,gb/en}/unterhaltung-an-bord (no data-dcep).

- Replace the rendered component (today: the paragraph "Loading..." after the "Login {heading-small}" heading) with one empty `ejournals` block. Write none of its text.
- Keep the heading "Login" before it (id `login`: the later "Go to login" / "Zum Login" text link of the page points to `#login`).
- Also missing from today's import of these pages, right after "Browse the available titles … / Stöbern Sie unten durch die verfügbaren Titel …": the iframe `https://box.media-carrier.de/home?b=77745&l={de|en}` (`.iframe-wrapper`, max-width 1240px, height 520px), as the faq-ejournals imports already carry it.
- Record (browser agent): GET https://www.lufthansa.com/service/api/labels/ejournals/lh/de and …/lh/en (from the de/de and de/en unterhaltung-an-bord pages, with their X-Portal-* headers); labels/common is recorded already.

## Universal Editor fields

N/A (Document Authoring project)
