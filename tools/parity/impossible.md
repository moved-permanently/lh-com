# Genuinely impossible gaps

Differences between www.lufthansa.com and the replica (https://main--lh-com--moved-permanently.aem.page) that cannot be closed by design. They are not counted as defects; where they show up in a screenshot they are masked (live-data widgets) or explain a residual mismatch.

## Live data that changes by date (masked)

- Prices, fares and deals (fare teasers, price bar, deal tables, AirCore route/destination prices incl. last-minute deals), airport suggestions, default departure airport, flight status and weather differ by the day and hour they are shown. The replica shows what was recorded at import time (2026-10-21/22) wherever the live call is not possible, so the values in the live screenshot and the replica differ even when the widget is identical. The widgets (`.flight-search`, `.fare-teaser`, `.destination-finder`, `.price-bar`, `.weather`, `.flight-status`, `.table-deals .table-deals-price`, `[data-lh-source]`) are painted the same grey in both screenshots before diffing; their frame and position still count where they shift the layout.
- Which data is live at all depends on Lufthansa: the direct calls from the visitor's browser (airport suggestions, labels, catalogs, defaultAirport, core/feature/list, destination finder) only work while Lufthansa keeps CORS open for them and the visitor passes their bot protection; otherwise the recording is shown. Fare teasers and weather always come from the recordings, because lh-proxy is blocked upstream.

## Flows that hand off to the live site

- Shop / booking flow: "Find flights" and fare teasers post to shop.lufthansa.com (booking availability); the booking pages themselves are not part of the replica. The handoff's lang/portalCountry was taken from a real de/en search; the values used for de/de, at/de and gb/en are unverified.
- Login, Travel ID / My account: the login layer and account pages are Lufthansa's identity service (once.lufthansa.com); the replica links there. The /{country}/{lang}/login and /profile/* app shells are built outside this migration and are excluded from the parity jobs.
- Online check-in, pre-check-in and My Flights / Manage my bookings: the booking lookup and check-in forms submit to the live check-in and booking-management applications; only the entry pages are replicated.
- Flight status and timetable results beyond the recorded data link to the live flight-status application.

## Forms never submit

- Feedback (/feedback, /feedback-past-flight, /feedback/feedbackai), refund forms, pet/cargo registration and other forms are rendered with the same fields and layout but do not submit anywhere: the live back ends (case management, Medallia/feedback services) cannot be called from the replica origin, and sending test data to them would be wrong. Validation messages and confirmation screens after submit therefore cannot be compared.

## Only reachable on board

- FlyNet (/flynet): the real onboard portal (internet packages, onboard login, the live flight map) is only reachable from the aircraft Wi-Fi, so there is no reference capture. The replica has the information page (compared like any other page) and a FlyNet-style channel (page metadata `channel: flynet` on the lh-flynet site, scripts/channel.js) that is a stand-in, not a copy, and is not part of this comparison.

## Pages that are 404 on the live site

- /{country}/{lang}/lufthansa-city/menu-card answers 404 on www.lufthansa.com in all locales (de/en, de/de, at/de, gb/en); there is no reference to compare against, so the page is not in the parity job list. (/lufthansa-city/culinaryjourney exists and is compared.)

## Other gaps by design

- Consent: the live screenshots were taken after the OneTrust dialog was dismissed; the replica stores "necessary only" (C0001) before load (scripts/consent.js fallback) and the showcase notice is acknowledged. Neither dialog is in either screenshot, but anything the live site only shows after full consent (personalised teasers, third-party embeds) can differ.
- Personalisation and A/B tests: the live site varies teasers, the default departure airport and some campaign slots by visitor (geo-IP, cookies, tests). The live screenshot shows one variant; the replica always shows the imported one.
- Animated content: auto-rotating carousels, hero videos and count-up animations are captured at whatever frame they were in; slide position and video frame can differ between the two screenshots.
- App view (?channel=app): the replica drops header, footer, breadcrumb and cookie banner on the assumption that the app's web view handles navigation and consent itself (scripts/channel.js); there is no live counterpart to compare and it cannot be verified without the app. Not part of the visual comparison.
