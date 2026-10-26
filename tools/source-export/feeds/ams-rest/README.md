# Recorded www answers for the "AMS rest" briefs (A1 to A11)

Public answers of `https://www.lufthansa.com`, recorded 2026-10-25 22:20 to 22:42 UTC from a private browser tab on
www (same-origin GET, no cookies, one request every 2 seconds). No key-like values were found in the bodies (checked
by property name and value pattern). `index.json` lists every recorded URL with status, final URL after redirects and
the response headers (`x-dispatcher` present = answered by AEM; its values are blanked).

| folder | what | briefs |
|---|---|---|
| `sdui-variants/` | three app screens (`articles` hub, the London article, `homepage`) in all nine spellings: `.sdui`, `.ios.sdui`, `.nocache.sdui`, `.ios.nocache.sdui`, `.v2.sdui`, `.ios.v2.sdui`, `.v2.ios.sdui`, `.nocache.v2.sdui`, `.v2.nocache.sdui`. Files `sdui-<screen>.<spelling>.json`. All v2 spellings of a screen are byte-identical; `.nocache.` bodies equal the plain ones (only the header differs, see `index.json`) | 78 (A1) |
| `sdui-web/` | two web pages as SDUI on their full content paths: an article (`7people` = `/content/lh/markets/de/en/articles/explore-flying/7-people-who-shaped-lufthansa-history`) and a content page (`faq-refund` = `/content/lh/markets/de/en/support/faq/faq-refund`), in `.sdui`, `.ios.sdui`, `.v2.sdui`, `.nocache.v2.sdui` | 78 part 2 (A1, held) |
| `selectors/` | `csi-xf-markets-de.json` (`/content/experience-fragments/lh/markets/de.csi-xf.json`), `csi-xf-gc-en.json` (`/content/experience-fragments/lh/gc/en.csi-xf.json`), `csi-offline-full.json` (`/content/lh/markets/de/en/homepage.csi-offline.json`) | 80 (A3) |
| `static/service-worker.js` | `/service-worker.js` as www serves it (`application/javascript`, `public, max-age=21600`) | 80 (A3) |
| `sitemap/sitemap_lh.xml` | the unzipped sitemap index `/sitemap/sitemap_lh.xml.gz` (499 entries, lastmod 2026-10-25 22:00 UTC) | 84 (A7) |
| `sitemap/sitemap_lh_de_en.xml.gz` | www's de/en sitemap `/sitemap/sitemap_lh_de_en.xml.gz` as served (gzip, 186,171 bytes; 144 URLs with their hreflang alternates), recorded 2026-10-26 21:54 UTC in a browser tab on www; for A7's alternates spot check | 84 (A7) |

Small answers that are only in `index.json` (no body file): `/apps/selectlanguage` without parameters
(`{"languages":[]}`) and with `?tenant=lh&country=de`
(`{"languages":[{"code":"de","name":"German","isDefault":false},{"code":"en","name":"English","isDefault":false}]}`),
both `cache-control: max-age=604800`; the entry redirects (A9) with their final URLs; robots.txt and llms.txt headers.
