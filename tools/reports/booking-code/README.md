# Booking code entry on the brand sites (briefs 369 and 373)

www's capture brand-booking-001 of 2026-11-05 shows Discover, Austrian, Brussels and SWISS on the same page code. Only the fake code ABC123 / Test was sent. On each login page the "Booking code" card opens a modal with two fields, validated in the browser. A valid code then posts a form in the same window to `https://shop.<brand>/booking/manage-booking/retrieve?lang=<lang>&portalCountry=<CC>`. ITA's www form sends nothing, so ITA is left as it was.

## Code (main, edb99f8)

- **`blocks/booking-lookup` variant `booking-code`:** a dialog opened by the page's `#booking-code` links. It uses www's texts per brand and language (`booking-code-texts.js`), with www's error box and the message under each field.
- **`scripts/handoff.js`:**
  - `BOOKING_RETRIEVE` holds each brand's shop and the lang of each page language; `retrieveTarget` builds www's form from it.
  - On the brand's own www host it makes www's two calls first. The target's query is repeated as fields, and Discover's link call goes as LH.
- **Tests:** `test/booking-code-369.test.mjs`.

## Documents (DA, previewed, not published)

All 50 are listed in [preview-paths.txt](preview-paths.txt). The DA backups from before the upload are in `logs/b369/da/before` (not in git).

| brand | login pages | navs |
| --- | --- | --- |
| Discover | de/en, de/de, xx/fr `/profile/login`: the card opens the form | 3: "My flights" and "Edit booking" went from www's cockpit deeplink to the login page |
| Austrian | at/en, `/at/de/anmeldung`, fr/fr, it/it, ru/ru, cn/zh, es/es, gr/el, jp/ja, pl/pl | 10: "My flights" went from www's cockpit deeplink to the login page |
| Brussels | be/en, be/fr, be/nl, de/de, it/it, es/es `/profile/login` | none (they already linked the login pages) |
| SWISS | ch/en, ch/de; new: ch/fr, it, zh, pt, el, ja, ru `/login` and `/ch/es/profile/login`, with www's card texts and titles; no tour operator line and no description (not in the capture) | 8 (fr–ru, es): "My flights" went to the login page; "Manage bookings" keeps www's cockpit link with language EN (www's) |

## Checks (2026-11-05)

On each brand's aem.page preview at 390 and 1440, with submits stubbed, 24 runs passed:
- **Pages:** SWISS ch/en, ch/fr, ch/ja, ch/es; Austrian at/en, at/de, pl/pl; Brussels be/en, be/fr, be/nl; Discover de/en, de/de.
- **Empty submit:** the error box headline, both messages (in the box and under the fields) and "Go to error" match. They were compared with www's rendered texts where a run was captured, and with www's label service otherwise; spaces are collapsed, since www's labels use no-break spaces.
- **Wrong code:** the one-error headline and the pattern message match.
- **ABC123 / Test:** the posted form equals www's: action, POST, `_self`, and the fields lang, portalCountry, lastName, recLoc in order. It was compared with www's recorded form where captured, and with bookingdetailslink's answer for the language otherwise. No API was called.

The hosts (`<brand>.turnsthe.page`) serve the new code but still the published documents. They show the change once the documents are published.

## Open

- **SWISS redirects (the user's sheet):** www's cockpit deeplink lands on `/ch/<ll>/profile/login`, but the sheet has rows for en and de only. Rows for 1:1:
  - `/ch/fr/profile/login` to `/ch/fr/login`, and the same for it, zh, pt, el, ja, ru;
  - as for en and de, `/ch/<ll>/profile/profile-login` to `/ch/<ll>/login` for the same seven.
- **Discover xx/fr:** the language version itself posts `portalCountry=XX`. Its market roots (ca/fr) post their own country, as www's capture shows.
- **Not recorded on www:** the modal's look (only its attributes were captured), and whether www's field upper-cases typed input. The replica rejects lower case, as www's pattern does.
