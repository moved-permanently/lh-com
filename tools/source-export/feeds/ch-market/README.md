# www's answers for the ch market routes

Public answers of `https://www.lufthansa.com`, recorded 2026-10-28 02:06-02:07 UTC from a private browser tab on
`/ch/en/homepage` (same-origin GET, credentials omitted, no cookies, one request every 2.5 seconds, redirects followed).
They are the reference for lh-edge's ch market routes (`tools/reports/markets/ch-choice-b.md`). All 16 requests were
answered (no 403, 429 or challenge page). `index.json` lists every URL with status, final URL, response headers, file and
size in bytes; bodies are byte for byte except where `redacted` says otherwise.

| folder | URL | status | notes |
|---|---|---|---|
| `owa/` | `/content/lh/markets/ch/{en,de}/homepage.csi-owa-{header,footer}.json`, `ch/en/homepage.csi-owa-portal-config.json` | 200 | `application/json;charset=utf-8`, `max-age=300, public`. The ch/en portal config is `{"appShellJs":"","remoteEntries":[]}` (36 bytes). |
| `sdui/` | `/content/lh/markets/ch/en/addresses-worldwide.sdui`, `ch/de/adressen-weltweit.sdui`, `ch/en/articles/explore-flying/7-people-who-shaped-lufthansa-history.sdui` | 200 | `application/json`, no `cache-control`. The two address pages are empty shells (title, type `PAGE`, three spacers); the article is 18,678 bytes. |
| `solo/` | `/ch/en/baggage.solo_continue`, `/ch/de/gepaeck.solo_continue` | 200 | `text/html;charset=utf-8`, `x-robots-tag: noindex`, `expires: Thu, 01 Jan 1970` (en only), no `cache-control`. Full HTML, 64 KB each. |
| `csi-offline/` | `/content/lh/markets/ch/en/homepage.csi-offline.json`, `ch/de/gepaeck.csi-offline.json` | 200 | `no-cache, no-store, must-revalidate`. The en homepage lists 11 resources; the de page `gepaeck` only `{"targetPage":"/content/lh/markets/ch/de/gepaeck","resources":[""]}`. |
| `notfound/` | `/ch/en/book-and-manage/trip-management.mfe.html`, `/ch/en/addresses-worldwide.aircraft.json` | 404 | Apache-style 404 page from AEM (`text/html; charset=iso-8859-1`, 1,134 bytes with Cloudflare's injected challenge script); the mfe one has `cache-control: public, max-age=300`. |
| `notfound/` | `/ch/llms.txt`, `/ch/en/llms.txt` | 404 | Cloudflare's own "Not Found" page (`text/html`, 27,150 bytes, `cache-control: public, max-age=2592000`), not an AEM answer. |

File names: `<cc>-<ll>-<page>.<selector>.<ext>`; the 404 bodies are saved as `.html` on top of the URL name.

Header set in `index.json`: the ones that say how the answer is cached and typed (`cache-control`, `expires`, `pragma`,
`content-type`, `content-encoding`, `vary`, `etag`, `last-modified`, `age`, `x-robots-tag`, `access-control-max-age`,
`cf-cache-status`, `x-vhost`, `server`, `cf-ray`; no `location` because none of the 16 redirected). `x-dispatcher` is
blanked as in `ams-rest/index.json`. Left out: the site-wide security headers (`content-security-policy`,
`strict-transport-security`, `x-frame-options`, `x-xss-protection`, `x-content-type-options`, `referrer-policy`,
`feature-policy`, `x-dns-prefetch-control`), identical on every answer. `content-length` is the compressed size on the
wire (`content-encoding: gzip`); `bytes` in the index is the body size.

Redacted: `<meta name="content-page-ref" content="...">` in both solo pages (a long encrypted page reference, blanked to
an empty `content`). Kept: the Travel ID OAuth `client_id` in the two `userAuthorize` links (public on every www page,
already in `login/loginpageurl.json`) and the `data-dcep` component ids (random UUIDs, no secret).
