# www's answers to other spellings of a page URL

Public answers of `https://www.lufthansa.com`, recorded 2026-10-29 01:27-01:28 UTC from a private browser tab on
`/de/en/homepage` (same-origin GET, credentials omitted, no cookies, `redirect: 'manual'`, one request every 3 to 5 seconds).
Redirects were not followed: each URL has its first answer only. All 15 requests were answered (no 403, 429 or challenge
page). They are the reference for how lh-edge answers URL forms that differ from the canonical lower-case path.
`index.json` lists every URL with status, headers, file and body size in bytes.

| # | URL | status | location or bytes | file |
|---|---|---|---|---|
| 1 | `/de/en/Homepage` | 301 | `/de/en/homepage` | - |
| 2 | `/de/de/Handgepaeck` | 301 | `/de/de/handgepaeck` | - |
| 3 | `/de/en/CARRY-ON-BAGGAGE` | 301 | `/de/en/carry-on-baggage` | - |
| 4 | `/content/dam/hcl/FF_pdp.jpg` (asset `/content/dam/hcl/ff_pdp.jpg` with upper case) | 404 | 1 byte (`\n`) | `bodies/content_dam_hcl_FF_pdp.jpg.head.html` |
| 5 | `/de/en/homepage.html` | 200 | 216,266 | `bodies/de_en_homepage.html.head.html` |
| 6 | `/de/en/carry-on-baggage.html` | 200 | 127,362 | `bodies/de_en_carry-on-baggage.html.head.html` |
| 7 | `/de/en/carry-on-baggage/` | 200 | 127,363 | `bodies/de_en_carry-on-baggage.head.html` |
| 8 | `/de/de/handgepaeck/` | 200 | 127,296 | `bodies/de_de_handgepaeck.head.html` |
| 9 | `/content/lh/markets/de/en/homepage` | 200 | 216,529 | `bodies/content_lh_markets_de_en_homepage.head.html` |
| 10 | `/content/lh/markets/de/en/homepage.html` | 302 | `/content/lh/markets/de/en/homepage` | - |
| 11 | `/content/lh/markets/de/de/prepare-for-your-trip/baggage/carry-on-baggage.html` | 302 | `/content/lh/markets/de/de/prepare-for-your-trip/baggage/carry-on-baggage` | - |
| 12 | `/content/lh/markets/gb/en/homepage.html` | 302 | `/content/lh/markets/gb/en/homepage` | - |
| 13 | `/de/en/homepage.nocache.html` | 200 | 216,263 | `bodies/de_en_homepage.nocache.html.head.html` |
| 14 | `/de/en/homepage.external.html` | 200 | 216,257 | `bodies/de_en_homepage.external.html.head.html` |
| 15 | `/de/en/homepage.solo.html` | 200 | 122,628 | `bodies/de_en_homepage.solo.html.head.html` |

What the answers show:

- Upper case in a page path: 301 to the lower-case path (`text/html; charset=UTF-8`). Upper case in a DAM path is not
  folded: 404 with a one-byte body and `cache-control: public, max-age=2592000`.
- `.html` and a trailing slash both answer 200 with the page itself, no redirect; the canonical in the HTML is the path
  without suffix (`<link rel="canonical" href="https://www.lufthansa.com/de/en/carry-on-baggage">`).
- Long AEM paths: without `.html` the page answers 200 directly (`cache-control: max-age=28800`, `cf-cache-status: DYNAMIC`,
  same canonical as the short URL); with `.html` 302 (`text/html; charset=iso-8859-1`, an Apache redirect page) to the long
  path without `.html`, not to the short URL.
- Selectors `.nocache.html`, `.external.html`, `.solo.html` on the homepage: 200 with the page (`max-age=28800`); `.solo.html`
  is the page without header and footer (122 KB instead of 216 KB). Canonical stays `/de/en/homepage`.
- `cache-control` of the pages: homepage forms `public, max-age=28800`, carry-on baggage forms `public, max-age=300`.

Limits of the recording: a page cannot read a redirect answer (`type: opaqueredirect`, status 0, no headers). Status and
content type of the redirects come from the browser's network log; `location` is the path the browser requested next, so
whether www sends it relative or absolute, and the redirects' `cache-control`, are not recorded.

Bodies: only the first 2,048 characters (the `<head>` up to the first stylesheet) are kept, as `*.head.html`; `bytes` in the
index is the full body size. Headers: the ones that say how the answer is cached and typed (`cache-control`, `expires`,
`content-type`, `content-encoding`, `vary`, `last-modified`, `age`, `access-control-max-age`, `cf-cache-status`, `x-vhost`,
`server`, `cf-ray`); `x-dispatcher` is blanked as in `ams-rest/index.json` and `ch-market/index.json`. No `set-cookie` was
readable or kept.

Redacted: `<meta name="content-page-ref" content="...">` (a long encrypted page reference) in all 8 kept page bodies, blanked
to an empty `content`.
