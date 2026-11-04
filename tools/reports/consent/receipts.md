# OneTrust's consent receipts on our hosts (brief 322)

Recorded 2026-11-04 in Chromium (Playwright, Chrome DevTools Protocol network log) on
`lufthansa.turnsthe.page/de/en/homepage` and `swiss.turnsthe.page/ch/en/homepage`, a fresh profile
per run, `lh-geo` set to DE-HE (Lufthansa) and CH-ZH (SWISS) as lh-edge sets it for a visitor
there. Every request to `*.my.onetrust.com` was stopped in the browser (DevTools request
interception): no test receipt reached OneTrust.

## What OneTrust loads

From page load to the banner, on both hosts (Lufthansa's domain script
`01994cb2-af99-7dbe-8fb0-56427773e54e`, SWISS's `01994cb2-f461-7489-80cc-e1ce655a86bc`; lh-edge's
`/onetrust/` route is cdn.cookielaw.org's answer):

| Request | Method, transport |
| --- | --- |
| `<host>/onetrust/scripttemplates/otSDKStub.js` | GET, script |
| `<host>/onetrust/consent/<domain script>/<domain script>.json` (rules) | GET, XHR |
| `https://geolocation.onetrust.com/cookieconsentpub/v1/geo/location` (only without `lh-geo`) | GET, XHR |
| `<host>/onetrust/scripttemplates/202610.1.0/otBannerSdk.js` | GET, script |
| `<host>/onetrust/consent/<domain script>/<rule>/<language>.json` (banner and preference center texts, settings) | GET, fetch |
| `<host>/onetrust/scripttemplates/202610.1.0/assets/otCenterRounded.json`, `v2/otPcCenter.json`, `otCommonStyles.css` | GET, fetch |
| `https://cdn.cookielaw.org/logos/static/ot_guard_logo.svg` | GET, fetch |

Nothing else of OneTrust's, apart from the receipts below.

## The receipt

The language data (`CommonData.ConsentIntegration`) has `IsConsentLoggingEnabled: true` and the
endpoint `ConsentApi: https://lufthansagroup-privacy.my.onetrust.com/request/v1/consentreceipts`
(with `AnonymousConsentApi` `…/consentreceipts/anonymous` and `CROConsentApi` `…/consentreceipts/cro`):
Lufthansa Group's OneTrust tenant, for SWISS's domain script too.

| When | Request | Transport |
| --- | --- | --- |
| A choice: Accept all, Only necessary, or Confirm my choices in the preference center | `POST https://lufthansagroup-privacy.my.onetrust.com/request/v1/consentreceipts`, JSON (about 14 KB: the purposes, the consent id, the interaction), after a CORS preflight `OPTIONS` to the same URL | XHR (OneTrust's own `ajax`, asynchronous) |
| Leaving the page (`beforeunload`), with or without a choice | the same URL, `POST`, `text/plain;charset=UTF-8`, about 14 KB: a "No interaction" receipt | `navigator.sendBeacon` |

Why the second one comes on every page view here: OneTrust's `beforeunload` handler reads the
interaction count from its `OptanonConsent` cookie; OneTrust writes its cookies for
`.lufthansa.com`, which the browser drops on our hosts, so the count is always missing and
OneTrust sends a "no interaction" receipt as the page is left (on www the cookie holds the count
and this receipt isn't sent after a choice).

What OneTrust does with the answer (otBannerSdk.js 202610.1.0): on success it dispatches its consent
event and writes the receipt's timestamp into `OptanonConsent` (not kept here, the cookie is
dropped); on an error it dispatches its consent event and does nothing else. No retry, no message
for the visitor; the beacon's answer isn't read.

**When OneTrust sends none**: it skips anonymous receipts when the visitor is flagged as a bot. The
flag is the `X-OneTrust-IsBot` response header of its rules JSON and language data. From our test
machine every request gets `x-onetrust-isbot: true` (directly from cdn.cookielaw.org and through
lh-edge's `/onetrust/` route, any user agent), so a plain test run sends no receipt at all; the
recordings above set the header to `false` inside the test browser to see what a visitor OneTrust
doesn't flag sends. lh-edge's route caches OneTrust's answers at the edge (`cacheEverything`), so a
cached `true` would suppress receipts for every visitor of that edge location; whether
real visitors get `true` or `false` there can't be seen from here.

## The change

`scripts/consent.js` `guardReceipts`, installed in `loadOneTrust` right before the stub is
added: requests to exactly `https://<tenant>.my.onetrust.com/request/v1/consentreceipts`
(and `/anonymous`, `/cro`) are dropped. The XHR is not sent and fails as when the endpoint can't be
reached (OneTrust's error path above: its consent event, nothing else); the beacon reports queued;
a fetch (not used by OneTrust today) rejects. Every other request passes through unchanged. No
OneTrust setting does this from the page (receipts are switched in the OneTrust tenant, by
Lufthansa Group).

## Before and after, same browser, both hosts

The draft `consent.js` served in place of the live one for the "after" runs (DevTools request
interception of `/scripts/consent.js`), everything else live.

| Check | Lufthansa (de/en) | SWISS (ch/en) |
| --- | --- | --- |
| Accept all, Only necessary, Confirm my choices: requests | identical apart from the receipt's `OPTIONS`, its XHR `POST` and the leave beacon, now not sent | the same |
| Leaving without a choice | the leave beacon not sent; nothing else differs | — |
| `lh-consent` in localStorage (groups, source) | the same after each choice | the same |
| `consent.update` events | the same (`default`, then `onetrust` with the chosen groups) | the same |
| Cookies | the same (OneTrust's dropped on both runs, as before) | the same |
| Console | no new error; one fewer: the blocked receipt's "Failed to load resource" | the same |
| Banner and preference center, en | markup identical; preference center 0 pixels differ; banner pixels differ as much between two "before" runs (the page behind it moves) | markup identical; preference center 0 pixels differ; banner 23 to 28 pixels in its bottom two rows, as between two "after" runs (edge anti-aliasing over the page) |
| de | banner and preference center 0 pixels differ | banner: the same bottom-row pixels; preference center 0 |
| fr | — | banner and preference center 0 pixels differ |
| OneTrust blocked: fallback banner | the same markup, 0 pixels differ, the same choice (`fallback`) and events, no errors | the same |

One run of SWISS's preference-center case also had Edge Delivery's RUM (the sampled
`/.rum/100` pings and the helix-rum-enhancer scripts) in its "before" run only; RUM samples page
views at random. A second run of that case differed only by the receipt.
