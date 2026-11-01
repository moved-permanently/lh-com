# OF1 on lh-com: "the site notices you"

OF1 (of1.live, Adobe's generative search) builds `/of1` (the `of1` block). Our own code adds the
parts that use the visitor's browsing, all in the browser and all off unless the site flag is on:

- **Consent adapter** (`scripts/of1/consent-adapter.js`): `window.of1Consent = { region, has(category), on(category, cb) }` from our OneTrust choice (`scripts/consent.js`): `functional` and `marketing` = C0004, `analytics` = C0002; `region` from the `lh-geo` cookie (US `us`, everything else `eu`). It writes OF1's `of1_consent` cookie (base64url JSON, `Path=/; SameSite=None; Secure; Partitioned`, session, host-only) with C0004 and deletes it, `of1_profile` and our visits without. On `/of1` without C0004 `window.of1Consent` stays undefined: OF1's client then allows the typed search, and we record nothing and answer no profile request.
- **Tracker** (`scripts/of1/tracker.js`, only with C0004): the last 20 visits in `localStorage` (`lh-of1-visits`; never `/of1`, `/deliverables/`, `/galleries/`), the interests and intent profile in OF1's stages, and the answer to OF1's `OF1_REQUEST_PROFILE` on `/of1?personalize=1`. No cookie, no Adobe ids.
- **Homepage** (`scripts/of1/homepage.js`, `/de/en/homepage` after 3 tracked visits): a grey band with a button to `/of1?personalize=1&q=<summary>`, and the hero's headline, subhead and call to action plus the section headings rewritten from `POST /api/personalize` (lh-edge forwards it to OF1, `tools/workers/lh-edge/src/of1.js`); text only, within 2.5 s, else the published text stays.

OF1's own banner (`of1-consent.js`) and tracker (`of1-tracker.js`) never load on our hosts. On
`*.of1.live` OF1's banner governs: our OneTrust banner and these features stay off there.

## Switching it on

- Site flag: a row in the site's `/config/flags` sheet: `flag` = `of1`, `value` = `on` (published as `/config/flags.json`; `scripts/flags.js`). No row, or any other value: off.
- Where: lh-com's pages on Lufthansa's turnsthe.page hosts (lh-edge routes OF1's API on lufthansa.turnsthe.page), not in DA's authoring views, not in the app channel, not on a brand's page (`scripts/of1/gate.js`).
- Tester switch, demo hosts only: `localStorage.setItem('lh-of1', 'on')` switches it on for that browser before the flag row is live (`removeItem('lh-of1')` switches it off).

## After an OF1 release

`node tools/of1/check-client-consent.mjs` (network) loads OF1's `of1-client.js` and fails when a missing consent API no longer counts as allowed: then `/of1` without C0004 needs another plan.
