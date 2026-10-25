# Recorded www answers for the feed packages

Public answers of `https://www.lufthansa.com`, recorded from a browser tab on www (same-origin GET, no cookies,
one request every 2 seconds). They are the reference the lh-edge Worker and its diff scripts compare against.
Values that look like keys or ids of partners are blanked before anything is committed here.

| folder | what | recorded |
|---|---|---|
| `webviews/www-solo-pages.json` | the pages the Lufthansa app opens in its web view, as `<path>.solo_continue` for de/en, de/de, at/de, gb/en, plus the two US privacy pages and the other solo URL forms (`.solo.continue`, `.solo.continue.solo_continue`, `.solo_continue.html`, `.solo_continue.genapp.html`, a query string). Per URL: status, canonical, title, robots, lang, h1-h4, link hrefs, text of `<main>` (scripts and styles removed, cut at 30,000 characters). Not the full HTML. | 2026-10-25 18:14-18:21 UTC |
| `webviews/webview-aliases.csv` | draft of the DA sheet `/app/config/webview-aliases`: the path the app asks for, per locale, and the replica page that answers it. `note` says where the mapping comes from: `www canonical` (www's canonical of the solo page), `404 on www; German counterpart in the replica` (www answers 404 for the English page name in de/de and at/de; the replica maps it to the German page), `market-only page` (the two US pages). | derived from the recording |
| `well-known/assetlinks.json`, `well-known/apple-app-site-association` | www's App Links and Universal Links files, byte for byte (www sends `application/json` and `application/octet-stream`) | 2026-10-25 18:21 UTC |

Paths the app opens that answer 404 on www in all four locales (no alias, lh-edge answers 404 as well):
`on-board-overview`, `data-protection`, `prepare-for-your-trip/baggage/baggage-calculator`, `book-a-flight/our-destinations`.

All five solo URL forms answer the same page on www (status 200); `.solo.continue` and `.solo.continue.solo_continue`
give the canonical without a suffix, the others with `.solo_continue`. A query string is kept.
