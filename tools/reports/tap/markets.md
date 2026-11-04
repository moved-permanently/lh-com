# TAP's market roots on lh-tap (option B)

Status of 2026-11-04: **the 137 market roots' own documents (414) are uploaded to DA
(`moved-permanently/lh-tap`) and previewed, 414 of 414 answer 200 on
`main--lh-tap--moved-permanently.aem.page`. Nothing is published.** The merged language documents
(step 2: 236 pages and 32 fragments in the eight language folders) are **written locally only**
and are not uploaded: the language folders are another agent's upload right now (wait for the go).

Ben's option B (`tools/reports/markets/plan.md` 4.B): one document per language page; a market
root holds documents of its own only where it differs. www.flytap.com authors one version per
language and applies its country rules on the server; our language versions are their home
markets' view (pt-pt, en-pt: Portugal; es-es, fr-fr, de-de, it-it, pl-pl; pt-br: Brazil).

## Captures

From `tap-deliveries.json`: segments `market-pages` (`tap-snapshots-016` to `-019`, 338 pages:
137 homepages, 195 `rule` pages, Canada's 6 own pages; `"complete": true`), `market-sitemaps`
(`tap-sitemaps-001`, `-002`, 138 sitemaps), `market-images` (`tap-media-018`, 35 files), plus the
language archives `tap-snapshots-001` to `-015` and every media archive (`tap-media-001` to `-018`,
in the index's order: a later copy of a picture wins). Each archive's sha256 against the index and
each of the 3,335 files with a sha256 against its archive's manifest: all match; every entry a
regular file inside its archive, each archive unpacked into its own empty folder
(`content-sites/lh-tap/captures/`, gitignored). No request to TAP's hosts; the only requests were
DA, admin.hlx.page and our own preview (the airport sheets' names for the booking box).

Left out, as listed (Ben): the Brazil- and US-only bank and card partner pages (en-br's
`btg-pactual`, `btg-pactual-black`, en-gh's `btg-pactual-black`; en-us', pt-us' and es-us' Bilt
Rewards folder) stay links to www.flytap.com. en-br's privacy page: the pt-pt page lists no en-br
version (the list's `noRootPage`).

## Which language version a root reads

| Language of the root | Language version | Roots |
| --- | --- | --- |
| pt | pt-pt (master `pt`; pt-br is a version of its own and serves no other root) | 57 |
| en | en-pt | 58 |
| es | es-es | 8 |
| fr | fr-fr | 12 |
| de | de-de | 2 (de-at, de-ch) |

it-it and pl-pl serve no market root. A root's paths are its language version's slugs (its sitemap; 16 paths on 11 roots have no
language counterpart, below).

## How the rules became sections (`tools/importer/tap-markets.mjs`)

- **www's rules** (`pageProps.personalizations`, 416 in the newest capture, the same list on all 137 root
  homepages; pt-pt's capture of 2026-11-03 has 415) name the pt master's component
  (`/content/dam/tap/master/pt/…`); they hold for every language's copy by the path after
  `/master/<lang>/` (checked: de-de's, en-pt's copies). Actions: `show` (331), `hide` (17),
  `activate-variation` (68; a variation for its markets, or with `hide` for every market but
  them, "variation_todososmercados-pt"). **One rule www applies without listing it:** a
  component's variation named `market_<cc>` is that market's (the club table's `market_us`, a
  promotion's `market_pt`); taking those as rules turned the last 2 of 193 mismatches into matches.
- **A component behind a rule** (on itself or on an item in it: a slide, a card, an accordion
  item, a FAQ subcategory) is a section of its own with section metadata `Markets`, as
  `scripts/market-rules.js` reads it (`br,pt` to show, `-us,-gb` to hide). Countries are grouped
  by what the rules give them; one section per distinct variant, each with its countries; the
  variant every other country sees has an exclusion list. A rule on the page itself (`PageModel`,
  28) is the page's own `Markets` metadata row.
- **The other markets' variants merged in** (step 2): the components a root shows that its
  language version lacks come from its `rule` page capture; a group without a capture is derived
  when its rules only show or hide items (the component without those items), else it is a hit
  that could not be placed (below). Homepages are not merged: every root has its own homepage
  document, so a language homepage only serves its home market.
- **The page metadata never sits in a market section**; each variant of a heading keeps its H1;
  a page over the content bus's limits keeps its fragments, a variant with other content gets
  fragment documents of its own (`…/hotels-8b97cc`).
- **The hook in TAP's importer** (`tap-import.mjs`, the other agent's file; 30 lines):
  `convertPage` takes `site.units` (the components with `__markets`), the `Page` keeps the
  markets on the sections it opens, the section metadata gets a `Markets` row, and one handler
  `MarketVariantOnWww`. Without `site.units` the importer writes what it wrote before (its tests
  unchanged and green). **A plain re-import of the language versions with `tap-import.mjs` drops
  the market sections again:** the merged language documents come from `tap-markets.mjs`.

**Check of the merge:** each of the 193 `rule` pages whose language version has the page, the
merged language document filtered for the root's country with `dropMarketSections`, against the
root's own capture converted with the same tools (text of every paragraph, heading, item and cell,
in order): **193 of 193 identical** (the "See on flytap.com" links left aside).

| Language version | Documents with market sections | Market sections | Pages with page Markets | Fragment documents | "See on flytap.com" sections |
| --- | --- | --- | --- | --- | --- |
| pt-pt | 37 | 144 | 7 | 15 | 18 |
| en-pt | 40 | 177 | 7 | 17 | 26 |
| es-es | 30 | 84 | 3 | 0 | 9 |
| fr-fr | 34 | 73 | 4 | 0 | 4 |
| de-de | 32 | 69 | 5 | 0 | 4 |
| it-it | 17 | 27 | 2 | 0 | 0 |
| pl-pl | 16 | 27 | 1 | 0 | 0 |
| pt-br | 30 | 60 | 2 | 0 | 0 |

Local only (`content-sites/lh-tap/content/<language>/…`, the list in
`content-sites/lh-tap/runs/markets-language-paths.txt`). **Before they are uploaded:** the 32
fragment documents of `/pt-pt/miles-and-go/parceiros` and `/en-pt/miles-and-go/partners` go into
the allowlist (the merged partners pages are over the limits with their 7 and 8 variants of the
partner categories; the plain ones were not).

## Each root's own documents (step 3)

- **Homepage** `/<ll>-<cc>/index` from the root's capture (Edge Delivery serves it at
  `/<ll>-<cc>/`), with lh-com's booking box (Market and Language the root's; Default origin the
  market's airport from www's market list: GVA for ch, YYZ for ca, …). **Airports** names the
  language version's sheet (`/de-de/booking/airports.json`): the roots have no sheet of their
  own yet (`tap-airports.mjs --root <root>`, one request to www's originSearch each; `tapRoute`
  depends on the market).
- **Own pages:** Canada's 6 (en-ca, fr-ca, pt-ca: passenger rights and accessibility plan) and
  the 2 `rule` pages whose language version has no such page (`/fr-ca/miles-and-go/gagnez-miles/
  cartes-de-credit`, `/es-us/miles-and-go/gane-millas/tarjetas-de-credito`).
- **Nav and footer** only where they differ from the language version's (the root's links taken
  as the language version's, `/en-us` → `/en-pt`, www's `en_us` → `en_pt`): **137 navs, 132
  footers**. The differences are TAP's own menu and footer rules: Credit Cards, Trip Insurance, the
  Portuguese Complaints Book, TAP Store, TAP FORBIZ left out for many markets, another
  Booking.com partner id in the Americas; and since 8701ac77 (tap-nav.mjs, the other agent) every
  root's language switch is its own (de-ch: English → `/en-ch`), so every root has its own nav.
  de-at, de-ch, fr-be, fr-lu and fr-ch use their language's footer. **For the other agent:** an
  English root of a market outside tap-nav's `MARKET_LANG` links itself (en-us, en-ch, en-gb …:
  "English" → `/en-us`); www's switch there offers the market's other language (pt-us, pt-ch).
- Links: relative where the root has the page (its sitemap) or an own document, else on www.
  Pictures: 2 are in no archive (the institutional logo of the homepages' Miles&Go card,
  `logoTAP_INST_vertical_CMYK_Positivo.jpg`, and the legal card picture of Canada's pages), left
  out.

Pilot (de-ch, fr-ca, en-us; 11 documents) first, then the 134 others in four batches, and the 72 that changed with the importer's
8701ac77 once more; upload
state in `tools/importer/da-upload-state-lh-tap-markets.json` (`da-upload.mjs --state markets`,
new: a run keeps a state file of its own; lh-tap's own state file untouched).

## Rule hits that could not be placed

**113 components × root groups, 1,129 hits.** The rules give these roots a variant that no
capture holds: mostly the master (the "rest of the world") version of a component that Portugal
sees in a variation of its own, in English and Portuguese, which no captured root shows. The
roots get a section with a link to the page on www ("See on flytap.com", as the importer does for
www's live widgets) in its place; the merge check above does not cover them. **What would place
them:** one more capture per page of a root in the master group (for example en-gb's and pt-gb's
`fast-track`, `donate-miles`, `service-animals`, `buy-ticket`, `club`, `miles-and-go`,
`conditions-of-carriage`, `promos`), and each market-only variation's own root (`market_us`,
`market_br`, `variation_<country>` of the legal pages). The capture list's `rule` pages miss them
because it followed the listed rules, not the `market_<cc>` variations and not the master groups.

| Language document | Component | What the rules give them | Roots |
| --- | --- | --- | --- |
| `/en-pt/manage-booking/extras/fast-track` | richtext-fast-track | master | 58 roots |
| `/en-pt/miles-and-go/use-miles/donate-miles` | banner-base | master | 58 roots |
| `/en-pt/miles-and-go/use-miles/donate-miles` | rich-text-o-tap-donate-miles-e-a-iniciativa-de-responsabilidade-social-da-tap | master | 58 roots |
| `/pt-pt/gerir-reserva/extras/fast-track` | richtext-fast-track | master | 57 roots |
| `/pt-pt/miles-and-go/utilizar-milhas/doar-milhas` | banner-base | master | 57 roots |
| `/pt-pt/miles-and-go/utilizar-milhas/doar-milhas` | rich-text-o-tap-donate-miles-e-a-iniciativa-de-responsabilidade-social-da-tap | master | 57 roots |
| `/en-pt/information/traveling-with-animals/service-animals` | expands-reservar-o-servico-de-transporte-de-animais-de-assistencia | master | 56 roots |
| `/en-pt/miles-and-go/use-miles/buy-ticket` | hero-card-mais-lugares-disponiveis-para-viajar-com-milhas | master | 56 roots |
| `/pt-pt/informacoes/viajar-com-animais/animais-assistencia` | expands-reservar-o-servico-de-transporte-de-animais-de-assistencia | master | 56 roots |
| `/pt-pt/miles-and-go/utilizar-milhas/comprar-bilhete` | hero-card-mais-lugares-disponiveis-para-viajar-com-milhas | master | 56 roots |
| `/en-pt/miles-and-go/club` | table-conheca-os-clubs | variation_todososmercados, master | 55 roots |
| `/en-pt/miles-and-go/club` | accordion-list-termos-e-condicoes-club-tap-miles-go | master, variation_todososmercados, variation_restantesmercados | 55 roots |
| `/pt-pt/miles-and-go/club` | table-conheca-os-clubs | variation_todososmercados, master | 55 roots |
| `/pt-pt/miles-and-go/club` | accordion-list-termos-e-condicoes-club-tap-miles-go | master, variation_todososmercados, variation_restantesmercados | 55 roots |
| `/en-pt/miles-and-go` | card-explorar-o-tap-m-g | master | 53 roots |
| `/pt-pt/miles-and-go` | card-explorar-o-tap-m-g | master | 53 roots |
| `/en-pt/legal-info/conditions-of-carriage` | accordion-list-condicoes-de-transporte | master | 45 roots |
| `/pt-pt/info-legal/condicoes-de-transporte` | accordion-list-condicoes-de-transporte | master | 45 roots |
| `/en-pt/promos` | generic-card-list-novidades | master | 19 roots |
| `/pt-pt/promos` | generic-card-list-novidades | master | 18 roots |
| `/fr-fr/mentions-legales/conditions-de-transport` | accordion-list-condicoes-de-transporte | master | ch, ci, dz, gn, lu, ma, ml, sn, tg |
| `/es-es/informacion-legal/condiciones-de-transporte` | accordion-list-condicoes-de-transporte | master | ar, cl, co, mx, pa, uy, ve |
| `/de-de/buchungen/versicherung` | rich-text-coberturas-e-condicoes | variation_austria | at |
| `/de-de/buchungen/versicherung` | rich-text-coberturas-e-condicoes | variation_suica | ch |
| `/de-de/rechtliche-informationen/beforderungsbedingungen` | accordion-list-condicoes-de-transporte | variation_austria, master | at |
| `/de-de/rechtliche-informationen/beforderungsbedingungen` | accordion-list-condicoes-de-transporte | master | ch |
| `/de-de/rechtliche-informationen/rechtliche-hinweise` | rich-text-avisos-legais-privacidade | variation_austria | at |
| `/de-de/rechtliche-informationen/rechtliche-hinweise` | rich-text-avisos-legais-privacidade | variation_suica | ch |
| `/de-de/rechtliche-informationen/schlichtungsstelle` | rich-text-orgao-de-arbitragem | market_at | at |
| `/en-pt/bookings` | cards-opcoes-de-reserva | market_us | us |
| `/en-pt/destinations` | titulo-voe-com-a-tap | market_us | us |
| `/en-pt/help` | expands-fa-qs | master, market_us | us |
| `/en-pt/help/frequently-asked-questions` | faqs | master, market_us | us |
| `/en-pt/help/tap-refunds` | richtext-reembolso-voluntario | market_br | br |
| `/en-pt/help/tap-refunds` | richtext-reembolso-involuntario | market_br | br |
| `/en-pt/info-legal/privacidade` | rich-text-politica-de-privacidade | variation_brasil | br |
| `/en-pt/info-legal/privacidade` | accordion-list-politica-de-privacidade | variation_brasil | br |
| `/en-pt/information/traveling-with-animals/service-animals` | expands-reservar-o-servico-de-transporte-de-animais-de-assistencia | variation_eua, master | us |
| `/en-pt/legal-info/conditions-of-carriage` | accordion-list-condicoes-de-transporte | variation_alemanha, master | de |
| `/en-pt/legal-info/conditions-of-carriage` | accordion-list-condicoes-de-transporte | variation_austria, master | at |
| `/en-pt/legal-info/conditions-of-carriage` | accordion-list-condicoes-de-transporte | variation_belgica, master | be |
| `/en-pt/legal-info/conditions-of-carriage` | accordion-list-condicoes-de-transporte | variation_canada, master | ca |
| `/en-pt/legal-info/conditions-of-carriage` | accordion-list-condicoes-de-transporte | variation_franca, master | fr |
| `/en-pt/legal-info/conditions-of-carriage` | accordion-list-condicoes-de-transporte | variation_ghana, master | gh |
| `/en-pt/legal-info/conditions-of-carriage` | accordion-list-condicoes-de-transporte | variation_italia, master | it |
| `/en-pt/legal-info/conditions-of-carriage` | accordion-list-condicoes-de-transporte | variation_polonia, master | pl |
| `/en-pt/legal-info/privacy` | rich-text-politica-de-privacidade | variation_brasil | br |
| `/en-pt/legal-info/privacy` | accordion-list-politica-de-privacidade | variation_brasil | br |
| `/en-pt/legal-info/terms-and-conditions` | rich-text-sede | market_br | br |
| `/en-pt/manage-booking/extras` | expands-todos-os-servicos-e-extras | market_br | br |
| `/en-pt/manage-booking/extras` | expands-todos-os-servicos-e-extras | market_ca | ca |
| `/en-pt/manage-booking/extras` | expands-todos-os-servicos-e-extras | market_us | us |
| `/en-pt/miles-and-go/club` | table-conheca-os-clubs | master, market_ao | ao |
| `/en-pt/miles-and-go/club` | accordion-list-termos-e-condicoes-club-tap-miles-go | master, variation_todososmercados, variation_angola | ao |
| `/en-pt/miles-and-go/happy-miles` | card-celebramos-o-seu-aniversario | market_br | br |
| `/en-pt/miles-and-go/happy-miles` | card-celebramos-o-seu-aniversario | market_us | us |
| `/en-pt/miles-and-go/promo` | accordion-list-termos-e-condicoes | market_cl | cl |
| `/en-pt/miles-and-go/promo` | accordion-list-termos-e-condicoes | market_mx | mx |
| `/en-pt/miles-and-go/promo` | accordion-list-termos-e-condicoes | market_mz | mz |
| `/en-pt/miles-and-go/promo` | accordion-list-termos-e-condicoes | market_pl | pl |
| `/en-pt/miles-and-go/promo` | accordion-list-termos-e-condicoes | market_sn | sn |
| `/en-pt/miles-and-go/promo` | accordion-list-termos-e-condicoes | market_tg | tg |
| `/en-pt/miles-and-go/promo` | accordion-list-termos-e-condicoes | market_tr | tr |
| `/en-pt/miles-and-go/promo` | accordion-list-termos-e-condicoes | market_za | za |
| `/en-pt/miles-and-go/use-miles/fees` | tabela-taxas-de-servico-em-reservas-online-com-milhas | market_br | br |
| `/en-pt/promos` | generic-card-list-promocoes | market_ca | ca |
| `/en-pt/promos` | generic-card-list-promocoes | market_us | us |
| `/es-es/ayuda` | expands-fa-qs | master, market_us | us |
| `/es-es/ayuda/preguntas-frecuentes` | faqs | master, market_us | us |
| `/es-es/destinos` | titulo-voe-com-a-tap | market_us | us |
| `/es-es/gestionar-reserva/extras` | expands-todos-os-servicos-e-extras | market_us | us |
| `/es-es/miles-and-go/happy-miles` | card-celebramos-o-seu-aniversario | market_us | us |
| `/es-es/miles-and-go/promo` | accordion-list-termos-e-condicoes | market_cl | cl |
| `/es-es/miles-and-go/promo` | accordion-list-termos-e-condicoes | market_mx | mx |
| `/es-es/promos` | generic-card-list-novidades | market_us | us |
| `/es-es/reservas` | cards-opcoes-de-reserva | market_us | us |
| `/fr-fr/gerer-reserves/extras` | expands-todos-os-servicos-e-extras | market_ca | ca |
| `/fr-fr/mentions-legales/conditions-de-transport` | accordion-list-condicoes-de-transporte | variation_belgica, master | be |
| `/fr-fr/mentions-legales/conditions-de-transport` | accordion-list-condicoes-de-transporte | variation_canada, master | ca |
| `/fr-fr/mentions-legales/conditions-de-transport` | accordion-list-condicoes-de-transporte | variation_ghana, master | gh |
| `/fr-fr/miles-and-go/promo` | accordion-list-termos-e-condicoes | market_sn | sn |
| `/fr-fr/miles-and-go/promo` | accordion-list-termos-e-condicoes | market_tg | tg |
| `/fr-fr/reservations/assurances` | rich-text-coberturas-e-condicoes | variation_belgica | be |
| `/fr-fr/reservations/assurances` | rich-text-coberturas-e-condicoes | variation_luxemburgo | lu |
| `/fr-fr/reservations/assurances` | rich-text-coberturas-e-condicoes | variation_suica | ch |
| `/pt-pt/ajuda` | expands-fa-qs | master, market_us | us |
| `/pt-pt/ajuda/perguntas-frequentes` | faqs | master, market_us | us |
| `/pt-pt/destinos` | titulo-voe-com-a-tap | market_us | us |
| `/pt-pt/gerir-reserva/extras` | expands-todos-os-servicos-e-extras | market_ca | ca |
| `/pt-pt/gerir-reserva/extras` | expands-todos-os-servicos-e-extras | market_us | us |
| `/pt-pt/info-legal/condicoes-de-transporte` | accordion-list-condicoes-de-transporte | variation_alemanha, master | de |
| `/pt-pt/info-legal/condicoes-de-transporte` | accordion-list-condicoes-de-transporte | variation_austria, master | at |
| `/pt-pt/info-legal/condicoes-de-transporte` | accordion-list-condicoes-de-transporte | variation_belgica, master | be |
| `/pt-pt/info-legal/condicoes-de-transporte` | accordion-list-condicoes-de-transporte | variation_canada, master | ca |
| `/pt-pt/info-legal/condicoes-de-transporte` | accordion-list-condicoes-de-transporte | variation_franca, master | fr |
| `/pt-pt/info-legal/condicoes-de-transporte` | accordion-list-condicoes-de-transporte | variation_ghana, master | gh |
| `/pt-pt/info-legal/condicoes-de-transporte` | accordion-list-condicoes-de-transporte | variation_italia, master | it |
| `/pt-pt/info-legal/condicoes-de-transporte` | accordion-list-condicoes-de-transporte | variation_polonia, master | pl |
| `/pt-pt/informacoes/viajar-com-animais/animais-assistencia` | expands-reservar-o-servico-de-transporte-de-animais-de-assistencia | variation_eua, master | us |
| `/pt-pt/miles-and-go/club` | table-conheca-os-clubs | master, market_ao | ao |
| `/pt-pt/miles-and-go/club` | accordion-list-termos-e-condicoes-club-tap-miles-go | master, variation_todososmercados, variation_angola | ao |
| `/pt-pt/miles-and-go/happy-miles` | card-celebramos-o-seu-aniversario | market_us | us |
| `/pt-pt/miles-and-go/promo` | accordion-list-termos-e-condicoes | market_cl | cl |
| `/pt-pt/miles-and-go/promo` | accordion-list-termos-e-condicoes | market_mx | mx |
| `/pt-pt/miles-and-go/promo` | accordion-list-termos-e-condicoes | market_mz | mz |
| `/pt-pt/miles-and-go/promo` | accordion-list-termos-e-condicoes | market_pl | pl |
| `/pt-pt/miles-and-go/promo` | accordion-list-termos-e-condicoes | market_sn | sn |
| `/pt-pt/miles-and-go/promo` | accordion-list-termos-e-condicoes | market_tg | tg |
| `/pt-pt/miles-and-go/promo` | accordion-list-termos-e-condicoes | market_tr | tr |
| `/pt-pt/miles-and-go/promo` | accordion-list-termos-e-condicoes | market_za | za |
| `/pt-pt/promos` | generic-card-list-promocoes | market_ca | ca |
| `/pt-pt/promos` | generic-card-list-promocoes | market_us | us |
| `/pt-pt/reservas` | cards-opcoes-de-reserva | market_us | us |

## Other rules

- **Alerts** (`AlertModel` 2, `ComponentExtraAlertModel` 2: Israel's aviation services law,
  Portugal's ID validity and credit intermediation, France's passenger rights): the alerts bar is
  another agent's (shared code); not placed here.
- **Menu entries** (`MenuLinkModel` 5): in the roots' own navs (above).
- **Pages** (`PageModel` 28): the page's `Markets` metadata (31 documents) and the roots' path
  lists (a page a root's sitemap lacks: `lacks` in `markets.json`).

## What our edge Worker needs to answer the roots

The data per root is in **`tools/reports/tap/markets.json`** (`language`, `market`, `homepage`,
`nav`, `footer`, `own`, `lacks`, `noDocument`), written by `tap-markets.mjs`.

1. **The root's homepage:** `/<ll>-<cc>` (and `/<ll>-<cc>/`) from `/<ll>-<cc>/index` (preview
   answers it at `/<ll>-<cc>/`; `/<ll>-<cc>/index` and `/<ll>-<cc>` are 404 there).
2. **A root's own documents** (`own`: Canada's 6, fr-ca's and es-us' credit-card pages): as they
   are.
3. **Every other path of the root** from its language version's document: `/<ll>-<cc>/<rest>` →
   `/<language>/<rest>` (same slugs), unless the path is in `lacks` (the root has no such page on
   www: 404, as www) or `noDocument` (below).
4. **Market sections:** drop the sections whose `Markets` excludes the root's market
   (`dropMarketSections(html, market)` of `scripts/market-rules.js`), and the whole page when the
   page metadata's `Markets` does (31 language documents have one). The country is the root's
   `<cc>` (`pt-br`'s documents: br).
5. **Nav and footer:** the root's (`nav`, `footer` in `markets.json`: `/<root>/nav` for all 137 roots,
   `/<root>/footer` for 132) in place of the language version's `/<language>/nav`, `…/footer`
   that the language documents' metadata names.
6. **Links in the language documents and navs** rewritten to the root: `/<language>/…` →
   `/<root>/…`; www's market forms too (`https://www.flytap.com/en_pt/…` → `…/en_us/…`,
   `https://www.flytap.com/en-pt/…` → `…/en-us/…`: the "See on flytap.com" links go to the root's
   page on www so); the booking-box anchors (`/en-pt#check-in`)
   → `/<root>#check-in`.
7. **Metadata per root:** canonical `https://www.flytap.com/<root>/<rest>` (or the replica's),
   `Language` stays the language; the `Alternate <ll>` rows (other language versions) → the same
   market's root in that language where it exists. The root homepages carry none (www's
   homepages list no hrefLangs).
8. **Paths without a document** (`noDocument`, 16 on 11 roots): in a root's sitemap, with no
   language counterpart and no capture: en-de's, pt-de's, en-at's and pt-at's legal notices and
   arbitration body, en-ch's, pt-ch's and fr-ch's legal notices, en-fr's and pt-fr's French
   passenger rights, and the left-out BTG Pactual pages. A link to www (or 404) until they are
   captured.
9. **Booking box on root pages:** the homepage's `Airports` row names the language version's sheet
   until each root has its own (`/<root>/booking/airports.json`).
10. **Sitemaps and search:** per root from its language's index and its path list (`lacks`
    taken out, `own` added); not built here.

## Per root

`Sections for it`: the market sections in its language's documents whose list names its market
(sections for "every other market" not counted). `Not placed`: the hits above, each a "See on
flytap.com" section on preview once the language documents are uploaded.

| Root | Language version | Own documents | Nav | Footer | Sections for it | Not placed | Language pages it lacks |
| --- | --- | --- | --- | --- | --- | --- | --- |
| de-at | de-de | `/de-at/index` | own (lacks English Menü) (adds English Menü) | language | 6 in 5 | 4 in 4 | 0 |
| de-ch | de-de | `/de-ch/index` | own (lacks Jetzt beitreten, English Menü) (adds English Menü) | language | 6 in 5 | 3 in 3 | 2 |
| en-ao | en-pt | `/en-ao/index` | own (lacks Trip Insurance, Português Menu) (adds English Menu) | own (lacks Complaints Book) | 7 in 6 | 8 in 6 | 6 |
| en-ar | en-pt | `/en-ar/index` | own (lacks Trip Insurance, Credit Cards, Português Menu) (adds English Menu) | own (lacks TAP FORBIZ, Complaints Book) | 0 in 0 | 9 in 7 | 7 |
| en-at | en-pt | `/en-at/index` | own (lacks Credit Cards, Português Menu) (adds English Menu) | own (lacks Complaints Book) | 6 in 5 | 10 in 8 | 4 |
| en-be | en-pt | `/en-be/index` | own (lacks Credit Cards, Português Menu) (adds English Menu) | own (lacks Complaints Book) | 6 in 5 | 10 in 8 | 4 |
| en-br | en-pt | `/en-br/index` | own (lacks Trip Insurance, Accommodation, Português Menu) (adds Accommodation, Português Menu) | own (lacks TAP Store, Complaints Book) | 29 in 18 | 14 in 10 | 5 |
| en-ca | en-pt | `/en-ca/index`, `/en-ca/legal-info/passenger-rights-canada`, `/en-ca/legal-info/accessibility-plan-canada` | own (lacks Trip Insurance, Accommodation, Português Menu) (adds Accommodation, English Menu) | own (lacks TAP FORBIZ, TAP Store, Complaints Book) | 8 in 6 | 11 in 8 | 5 |
| en-ch | en-pt | `/en-ch/index` | own (lacks Credit Cards, Português Menu) (adds English Menu) | own (lacks Complaints Book) | 6 in 5 | 10 in 8 | 5 |
| en-ci | en-pt | `/en-ci/index` | own (lacks Trip Insurance, Credit Cards, Português Menu) (adds English Menu) | own (lacks TAP FORBIZ, Complaints Book) | 0 in 0 | 9 in 7 | 7 |
| en-cl | en-pt | `/en-cl/index` | own (lacks Trip Insurance, Credit Cards, Português Menu) (adds English Menu) | own (lacks TAP FORBIZ, Complaints Book) | 0 in 0 | 10 in 8 | 7 |
| en-co | en-pt | `/en-co/index` | own (lacks Trip Insurance, Credit Cards, Português Menu) (adds English Menu) | own (lacks TAP FORBIZ, Complaints Book) | 0 in 0 | 9 in 7 | 7 |
| en-cv | en-pt | `/en-cv/index` | own (lacks Trip Insurance, Credit Cards, Português Menu) (adds English Menu) | own (lacks TAP FORBIZ, Complaints Book) | 1 in 1 | 9 in 7 | 7 |
| en-cz | en-pt | `/en-cz/index` | own (lacks Credit Cards, Português Menu) (adds English Menu) | own (lacks Complaints Book) | 4 in 4 | 10 in 8 | 5 |
| en-de | en-pt | `/en-de/index` | own (lacks Credit Cards, Português Menu) (adds Deutsch Menu) | own (lacks Complaints Book) | 6 in 5 | 10 in 8 | 4 |
| en-dk | en-pt | `/en-dk/index` | own (lacks Credit Cards, Português Menu) (adds English Menu) | own (lacks Complaints Book) | 8 in 5 | 10 in 8 | 5 |
| en-dz | en-pt | `/en-dz/index` | own (lacks Trip Insurance, Credit Cards, Português Menu) (adds English Menu) | own (lacks TAP FORBIZ, Complaints Book) | 0 in 0 | 9 in 7 | 7 |
| en-ee | en-pt | `/en-ee/index` | own (lacks Trip Insurance, Credit Cards, Português Menu) (adds English Menu) | own (lacks TAP FORBIZ, Complaints Book) | 0 in 0 | 9 in 7 | 7 |
| en-eg | en-pt | `/en-eg/index` | own (lacks Trip Insurance, Credit Cards, Português Menu) (adds English Menu) | own (lacks TAP FORBIZ, Complaints Book) | 0 in 0 | 9 in 7 | 7 |
| en-es | en-pt | `/en-es/index` | own (lacks Credit Cards, Português Menu) (adds Español Menu) | own (lacks Complaints Book) | 7 in 6 | 9 in 7 | 4 |
| en-fi | en-pt | `/en-fi/index` | own (lacks Credit Cards, Português Menu) (adds English Menu) | own (lacks Complaints Book) | 5 in 3 | 9 in 7 | 5 |
| en-fr | en-pt | `/en-fr/index` | own (lacks Credit Cards, Português Menu) (adds Français Menu) | own (lacks Complaints Book) | 8 in 6 | 10 in 8 | 4 |
| en-gb | en-pt | `/en-gb/index` | own (lacks Trip Insurance, Credit Cards, Português Menu) (adds English Menu) | own (lacks Complaints Book) | 6 in 5 | 8 in 6 | 6 |
| en-gh | en-pt | `/en-gh/index` | own (lacks Trip Insurance, Credit Cards, Português Menu) (adds English Menu) | own (lacks TAP FORBIZ, Complaints Book) | 0 in 0 | 9 in 7 | 7 |
| en-gm | en-pt | `/en-gm/index` | own (lacks Trip Insurance, Credit Cards, Português Menu) (adds English Menu) | own (lacks TAP FORBIZ, Complaints Book) | 0 in 0 | 9 in 7 | 7 |
| en-gn | en-pt | `/en-gn/index` | own (lacks Trip Insurance, Credit Cards, Português Menu) (adds English Menu) | own (lacks TAP FORBIZ, Complaints Book) | 0 in 0 | 9 in 7 | 7 |
| en-gr | en-pt | `/en-gr/index` | own (lacks Trip Insurance, Credit Cards, Português Menu) (adds English Menu) | own (lacks TAP FORBIZ, Complaints Book) | 0 in 0 | 9 in 7 | 7 |
| en-gw | en-pt | `/en-gw/index` | own (lacks Trip Insurance, Credit Cards, Português Menu) (adds English Menu) | own (lacks TAP FORBIZ, Complaints Book) | 0 in 0 | 9 in 7 | 7 |
| en-hk | en-pt | `/en-hk/index` | own (lacks Trip Insurance, Credit Cards, Português Menu) (adds English Menu) | own (lacks TAP FORBIZ, Complaints Book) | 0 in 0 | 9 in 7 | 7 |
| en-hr | en-pt | `/en-hr/index` | own (lacks Trip Insurance, Credit Cards, Português Menu) (adds English Menu) | own (lacks TAP FORBIZ, Complaints Book) | 0 in 0 | 9 in 7 | 6 |
| en-hu | en-pt | `/en-hu/index` | own (lacks Credit Cards, Português Menu) (adds English Menu) | own (lacks Complaints Book) | 3 in 3 | 9 in 7 | 6 |
| en-ie | en-pt | `/en-ie/index` | own (lacks Credit Cards, Português Menu) (adds English Menu) | own (lacks Complaints Book) | 6 in 5 | 10 in 8 | 4 |
| en-il | en-pt | `/en-il/index` | own (lacks Trip Insurance, Credit Cards, Português Menu) (adds English Menu) | own (lacks Complaints Book) | 2 in 2 | 8 in 6 | 7 |
| en-it | en-pt | `/en-it/index` | own (lacks Credit Cards, Português Menu) (adds Italiano Menu) | own (lacks Complaints Book) | 6 in 5 | 10 in 8 | 4 |
| en-lt | en-pt | `/en-lt/index` | own (lacks Trip Insurance, Credit Cards, Português Menu) (adds English Menu) | own (lacks TAP FORBIZ, Complaints Book) | 0 in 0 | 9 in 7 | 7 |
| en-lu | en-pt | `/en-lu/index` | own (lacks Credit Cards, Português Menu) (adds English Menu) | own (lacks Complaints Book) | 6 in 5 | 10 in 8 | 4 |
| en-lv | en-pt | `/en-lv/index` | own (lacks Trip Insurance, Credit Cards, Português Menu) (adds English Menu) | own (lacks TAP FORBIZ, Complaints Book) | 0 in 0 | 9 in 7 | 7 |
| en-ma | en-pt | `/en-ma/index` | own (lacks Trip Insurance, Credit Cards, Português Menu) (adds English Menu) | own (lacks TAP FORBIZ, Complaints Book) | 1 in 1 | 9 in 7 | 7 |
| en-ml | en-pt | `/en-ml/index` | own (lacks Trip Insurance, Credit Cards, Português Menu) (adds English Menu) | own (lacks TAP FORBIZ, Complaints Book) | 0 in 0 | 9 in 7 | 7 |
| en-mx | en-pt | `/en-mx/index` | own (lacks Trip Insurance, Credit Cards, Português Menu) (adds English Menu) | own (lacks TAP FORBIZ, Complaints Book) | 1 in 1 | 10 in 8 | 7 |
| en-mz | en-pt | `/en-mz/index` | own (lacks Trip Insurance, Credit Cards, Português Menu) (adds English Menu) | own (lacks TAP FORBIZ, Complaints Book) | 1 in 1 | 10 in 8 | 7 |
| en-nl | en-pt | `/en-nl/index` | own (lacks Credit Cards, Português Menu) (adds English Menu) | own (lacks Complaints Book) | 7 in 6 | 10 in 8 | 4 |
| en-no | en-pt | `/en-no/index` | own (lacks Credit Cards, Português Menu) (adds English Menu) | own (lacks Complaints Book) | 8 in 5 | 10 in 8 | 5 |
| en-pa | en-pt | `/en-pa/index` | own (lacks Trip Insurance, Credit Cards, Português Menu) (adds English Menu) | own (lacks TAP FORBIZ, Complaints Book) | 0 in 0 | 9 in 7 | 7 |
| en-pl | en-pt | `/en-pl/index` | own (lacks Trip Insurance, Credit Cards, Português Menu) (adds Polski Menu) | own (lacks Complaints Book) | 6 in 5 | 11 in 9 | 5 |
| en-ro | en-pt | `/en-ro/index` | own (lacks Trip Insurance, Credit Cards, Português Menu) (adds English Menu) | own (lacks Complaints Book) | 1 in 1 | 9 in 7 | 7 |
| en-rs | en-pt | `/en-rs/index` | own (lacks Trip Insurance, Credit Cards, Português Menu) (adds English Menu) | own (lacks TAP FORBIZ, Complaints Book) | 0 in 0 | 9 in 7 | 7 |
| en-ru | en-pt | `/en-ru/index` | own (lacks Trip Insurance, Credit Cards, Português Menu) (adds English Menu) | own (lacks Complaints Book) | 1 in 1 | 9 in 7 | 7 |
| en-se | en-pt | `/en-se/index` | own (lacks Accommodation, Credit Cards, Português Menu) (adds Accommodation, English Menu) | own (lacks Complaints Book) | 8 in 5 | 10 in 8 | 5 |
| en-sk | en-pt | `/en-sk/index` | own (lacks Trip Insurance, Credit Cards, Português Menu) (adds English Menu) | own (lacks TAP FORBIZ, Complaints Book) | 0 in 0 | 9 in 7 | 7 |
| en-sn | en-pt | `/en-sn/index` | own (lacks Trip Insurance, Credit Cards, Português Menu) (adds English Menu) | own (lacks TAP FORBIZ, Complaints Book) | 0 in 0 | 10 in 8 | 7 |
| en-st | en-pt | `/en-st/index` | own (lacks Trip Insurance, Credit Cards, Português Menu) (adds English Menu) | own (lacks TAP FORBIZ, Complaints Book) | 0 in 0 | 9 in 7 | 7 |
| en-tg | en-pt | `/en-tg/index` | own (lacks Trip Insurance, Credit Cards, Português Menu) (adds English Menu) | own (lacks TAP FORBIZ, Complaints Book) | 0 in 0 | 10 in 8 | 7 |
| en-tn | en-pt | `/en-tn/index` | own (lacks Trip Insurance, Credit Cards, Português Menu) (adds English Menu) | own (lacks TAP FORBIZ, Complaints Book) | 0 in 0 | 9 in 7 | 7 |
| en-tr | en-pt | `/en-tr/index` | own (lacks Trip Insurance, Credit Cards, Português Menu) (adds English Menu) | own (lacks TAP FORBIZ, Complaints Book) | 0 in 0 | 10 in 8 | 7 |
| en-ua | en-pt | `/en-ua/index` | own (lacks Trip Insurance, Credit Cards, Português Menu) (adds English Menu) | own (lacks TAP FORBIZ, Complaints Book) | 0 in 0 | 9 in 7 | 7 |
| en-us | en-pt | `/en-us/index` | own (lacks Trip Insurance, Accommodation, Português Menu) (adds Accommodation, English Menu) | own (lacks TAP Store, Complaints Book) | 16 in 11 | 12 in 10 | 5 |
| en-uy | en-pt | `/en-uy/index` | own (lacks Trip Insurance, Credit Cards, Português Menu) (adds English Menu) | own (lacks TAP FORBIZ, Complaints Book) | 0 in 0 | 9 in 7 | 7 |
| en-ve | en-pt | `/en-ve/index` | own (lacks Trip Insurance, Credit Cards, Português Menu) (adds English Menu) | own (lacks TAP FORBIZ, TAP Store, Complaints Book) | 0 in 0 | 9 in 7 | 7 |
| en-za | en-pt | `/en-za/index` | own (lacks Trip Insurance, Credit Cards, Português Menu) (adds English Menu) | own (lacks TAP FORBIZ, Complaints Book) | 0 in 0 | 10 in 8 | 7 |
| es-ar | es-es | `/es-ar/index` | own (lacks Seguro de Viaje, English Menú) (adds English Menú) | own (lacks TAP FORBIZ) | 0 in 0 | 1 in 1 | 3 |
| es-cl | es-es | `/es-cl/index` | own (lacks Seguro de Viaje, English Menú) (adds English Menú) | own (lacks TAP FORBIZ) | 0 in 0 | 2 in 2 | 3 |
| es-co | es-es | `/es-co/index` | own (lacks Seguro de Viaje, English Menú) (adds English Menú) | own (lacks TAP FORBIZ) | 0 in 0 | 1 in 1 | 3 |
| es-mx | es-es | `/es-mx/index` | own (lacks Seguro de Viaje, English Menú) (adds English Menú) | own (lacks TAP FORBIZ) | 1 in 1 | 2 in 2 | 3 |
| es-pa | es-es | `/es-pa/index` | own (lacks Seguro de Viaje, English Menú) (adds English Menú) | own (lacks TAP FORBIZ) | 0 in 0 | 1 in 1 | 3 |
| es-us | es-es | `/es-us/index`, `/es-us/miles-and-go/gane-millas/tarjetas-de-credito` | own (lacks Seguro de Viaje, Alojamiento, English Menú) (adds Alojamiento, Tarjetas de Crédito, English Menú) | own (lacks TAP Store) | 15 in 12 | 7 in 7 | 2 |
| es-uy | es-es | `/es-uy/index` | own (lacks Seguro de Viaje, English Menú) (adds English Menú) | own (lacks TAP FORBIZ) | 0 in 0 | 1 in 1 | 3 |
| es-ve | es-es | `/es-ve/index` | own (lacks Seguro de Viaje, English Menú) (adds English Menú) | own (lacks TAP FORBIZ, TAP Store) | 0 in 0 | 1 in 1 | 3 |
| fr-be | fr-fr | `/fr-be/index` | own (lacks English Menu) (adds English Menu) | language | 5 in 4 | 2 in 2 | 1 |
| fr-ca | fr-fr | `/fr-ca/index`, `/fr-ca/mentions-legales/droits-passagers-canada`, `/fr-ca/mentions-legales/plan-accessibilite-canada`, `/fr-ca/miles-and-go/gagnez-miles/cartes-de-credit` | own (lacks Assurance Voyage, Hébergement, English Menu) (adds Hébergement, Cartes de Crédit, English Menu) | own (lacks TAP FORBIZ, TAP Store) | 6 in 5 | 2 in 2 | 3 |
| fr-ch | fr-fr | `/fr-ch/index` | own (lacks English Menu) (adds English Menu) | language | 5 in 4 | 2 in 2 | 2 |
| fr-ci | fr-fr | `/fr-ci/index` | own (lacks Assurance Voyage, English Menu) (adds English Menu) | own (lacks TAP FORBIZ) | 0 in 0 | 1 in 1 | 4 |
| fr-dz | fr-fr | `/fr-dz/index` | own (lacks Assurance Voyage, English Menu) (adds English Menu) | own (lacks TAP FORBIZ) | 0 in 0 | 1 in 1 | 4 |
| fr-gh | fr-fr | `/fr-gh/index` | own (lacks Assurance Voyage, English Menu) (adds English Menu) | own (lacks TAP FORBIZ) | 0 in 0 | 1 in 1 | 4 |
| fr-gn | fr-fr | `/fr-gn/index` | own (lacks Assurance Voyage, English Menu) (adds English Menu) | own (lacks TAP FORBIZ) | 0 in 0 | 1 in 1 | 4 |
| fr-lu | fr-fr | `/fr-lu/index` | own (lacks Hébergement, Rejoignez dès maintenant, English Menu) (adds Acomodação, English Menu) | language | 5 in 4 | 2 in 2 | 1 |
| fr-ma | fr-fr | `/fr-ma/index` | own (lacks Assurance Voyage, English Menu) (adds English Menu) | own (lacks TAP FORBIZ) | 1 in 1 | 1 in 1 | 4 |
| fr-ml | fr-fr | `/fr-ml/index` | own (lacks Assurance Voyage, English Menu) (adds English Menu) | own (lacks TAP FORBIZ) | 0 in 0 | 1 in 1 | 4 |
| fr-sn | fr-fr | `/fr-sn/index` | own (lacks Assurance Voyage, English Menu) (adds English Menu) | own (lacks TAP FORBIZ) | 0 in 0 | 2 in 2 | 4 |
| fr-tg | fr-fr | `/fr-tg/index` | own (lacks Assurance Voyage, English Menu) (adds English Menu) | own (lacks TAP FORBIZ) | 0 in 0 | 2 in 2 | 4 |
| pt-ao | pt-pt | `/pt-ao/index` | own (lacks Seguro de Viagem, English Menu) (adds English Menu) | own (lacks Livro de Reclamações) | 7 in 6 | 8 in 6 | 6 |
| pt-ar | pt-pt | `/pt-ar/index` | own (lacks Seguro de Viagem, Cartões de Crédito, English Menu) (adds English Menu) | own (lacks TAP FORBIZ, Livro de Reclamações) | 0 in 0 | 9 in 7 | 7 |
| pt-at | pt-pt | `/pt-at/index` | own (lacks Cartões de Crédito, English Menu) (adds English Menu) | own (lacks Livro de Reclamações) | 6 in 5 | 10 in 8 | 4 |
| pt-be | pt-pt | `/pt-be/index` | own (lacks Cartões de Crédito, English Menu) (adds English Menu) | own (lacks Livro de Reclamações) | 6 in 5 | 10 in 8 | 4 |
| pt-ca | pt-pt | `/pt-ca/index`, `/pt-ca/info-legal/direitos-passageiros-canada`, `/pt-ca/info-legal/plano-acessibilidade-canada` | own (lacks Seguro de Viagem, Alojamento, English Menu) (adds Alojamento, English Menu) | own (lacks TAP FORBIZ, TAP Store, Livro de Reclamações) | 8 in 6 | 11 in 8 | 5 |
| pt-ch | pt-pt | `/pt-ch/index` | own (lacks Cartões de Crédito, English Menu) (adds English Menu) | own (lacks Livro de Reclamações) | 6 in 5 | 10 in 8 | 5 |
| pt-ci | pt-pt | `/pt-ci/index` | own (lacks Seguro de Viagem, Cartões de Crédito, English Menu) (adds English Menu) | own (lacks TAP FORBIZ, Livro de Reclamações) | 0 in 0 | 9 in 7 | 7 |
| pt-cl | pt-pt | `/pt-cl/index` | own (lacks Seguro de Viagem, Cartões de Crédito, English Menu) (adds English Menu) | own (lacks TAP FORBIZ, Livro de Reclamações) | 0 in 0 | 10 in 8 | 7 |
| pt-co | pt-pt | `/pt-co/index` | own (lacks Seguro de Viagem, Cartões de Crédito, English Menu) (adds English Menu) | own (lacks TAP FORBIZ, Livro de Reclamações) | 0 in 0 | 9 in 7 | 7 |
| pt-cv | pt-pt | `/pt-cv/index` | own (lacks Seguro de Viagem, Cartões de Crédito, English Menu) (adds English Menu) | own (lacks TAP FORBIZ, Livro de Reclamações) | 1 in 1 | 9 in 7 | 7 |
| pt-cz | pt-pt | `/pt-cz/index` | own (lacks Cartões de Crédito, English Menu) (adds English Menu) | own (lacks Livro de Reclamações) | 4 in 4 | 10 in 8 | 5 |
| pt-de | pt-pt | `/pt-de/index` | own (lacks Cartões de Crédito, English Menu) (adds English Menu) | own (lacks Livro de Reclamações) | 6 in 5 | 10 in 8 | 4 |
| pt-dk | pt-pt | `/pt-dk/index` | own (lacks Cartões de Crédito, English Menu) (adds English Menu) | own (lacks Livro de Reclamações) | 8 in 5 | 10 in 8 | 5 |
| pt-dz | pt-pt | `/pt-dz/index` | own (lacks Seguro de Viagem, Cartões de Crédito, English Menu) (adds English Menu) | own (lacks TAP FORBIZ, Livro de Reclamações) | 0 in 0 | 9 in 7 | 7 |
| pt-ee | pt-pt | `/pt-ee/index` | own (lacks Seguro de Viagem, Cartões de Crédito, English Menu) (adds English Menu) | own (lacks TAP FORBIZ, Livro de Reclamações) | 0 in 0 | 9 in 7 | 7 |
| pt-eg | pt-pt | `/pt-eg/index` | own (lacks Seguro de Viagem, Cartões de Crédito, English Menu) (adds English Menu) | own (lacks TAP FORBIZ, Livro de Reclamações) | 0 in 0 | 9 in 7 | 7 |
| pt-es | pt-pt | `/pt-es/index` | own (lacks Cartões de Crédito, English Menu) (adds English Menu) | own (lacks Livro de Reclamações) | 7 in 6 | 9 in 7 | 4 |
| pt-fi | pt-pt | `/pt-fi/index` | own (lacks Cartões de Crédito, English Menu) (adds English Menu) | own (lacks Livro de Reclamações) | 5 in 3 | 9 in 7 | 5 |
| pt-fr | pt-pt | `/pt-fr/index` | own (lacks Cartões de Crédito, English Menu) (adds English Menu) | own (lacks Livro de Reclamações) | 8 in 6 | 10 in 8 | 4 |
| pt-gb | pt-pt | `/pt-gb/index` | own (lacks Seguro de Viagem, Cartões de Crédito, English Menu) (adds English Menu) | own (lacks Livro de Reclamações) | 6 in 5 | 8 in 6 | 6 |
| pt-gh | pt-pt | `/pt-gh/index` | own (lacks Seguro de Viagem, Cartões de Crédito, English Menu) (adds English Menu) | own (lacks TAP FORBIZ, Livro de Reclamações) | 0 in 0 | 9 in 7 | 7 |
| pt-gm | pt-pt | `/pt-gm/index` | own (lacks Seguro de Viagem, Cartões de Crédito, English Menu) (adds English Menu) | own (lacks TAP FORBIZ, Livro de Reclamações) | 0 in 0 | 9 in 7 | 7 |
| pt-gn | pt-pt | `/pt-gn/index` | own (lacks Seguro de Viagem, Cartões de Crédito, English Menu) (adds English Menu) | own (lacks TAP FORBIZ, Livro de Reclamações) | 0 in 0 | 9 in 7 | 7 |
| pt-gr | pt-pt | `/pt-gr/index` | own (lacks Seguro de Viagem, Cartões de Crédito, English Menu) (adds English Menu) | own (lacks TAP FORBIZ, Livro de Reclamações) | 0 in 0 | 9 in 7 | 7 |
| pt-gw | pt-pt | `/pt-gw/index` | own (lacks Seguro de Viagem, Cartões de Crédito, English Menu) (adds English Menu) | own (lacks TAP FORBIZ, Livro de Reclamações) | 0 in 0 | 9 in 7 | 7 |
| pt-hk | pt-pt | `/pt-hk/index` | own (lacks Seguro de Viagem, Cartões de Crédito, English Menu) (adds English Menu) | own (lacks TAP FORBIZ, Livro de Reclamações) | 0 in 0 | 9 in 7 | 7 |
| pt-hr | pt-pt | `/pt-hr/index` | own (lacks Seguro de Viagem, Cartões de Crédito, English Menu) (adds English Menu) | own (lacks TAP FORBIZ, Livro de Reclamações) | 0 in 0 | 9 in 7 | 6 |
| pt-hu | pt-pt | `/pt-hu/index` | own (lacks Cartões de Crédito, English Menu) (adds English Menu) | own (lacks Livro de Reclamações) | 3 in 3 | 9 in 7 | 6 |
| pt-ie | pt-pt | `/pt-ie/index` | own (lacks Cartões de Crédito, English Menu) (adds English Menu) | own (lacks Livro de Reclamações) | 6 in 5 | 10 in 8 | 4 |
| pt-il | pt-pt | `/pt-il/index` | own (lacks Seguro de Viagem, Cartões de Crédito, English Menu) (adds English Menu) | own (lacks Livro de Reclamações) | 2 in 2 | 8 in 6 | 7 |
| pt-it | pt-pt | `/pt-it/index` | own (lacks Cartões de Crédito, English Menu) (adds English Menu) | own (lacks Livro de Reclamações) | 6 in 5 | 10 in 8 | 4 |
| pt-lt | pt-pt | `/pt-lt/index` | own (lacks Seguro de Viagem, Cartões de Crédito, English Menu) (adds English Menu) | own (lacks TAP FORBIZ, Livro de Reclamações) | 0 in 0 | 9 in 7 | 7 |
| pt-lu | pt-pt | `/pt-lu/index` | own (lacks Cartões de Crédito, English Menu) (adds English Menu) | own (lacks Livro de Reclamações) | 6 in 5 | 10 in 8 | 4 |
| pt-lv | pt-pt | `/pt-lv/index` | own (lacks Seguro de Viagem, Cartões de Crédito, English Menu) (adds English Menu) | own (lacks TAP FORBIZ, Livro de Reclamações) | 0 in 0 | 9 in 7 | 7 |
| pt-ma | pt-pt | `/pt-ma/index` | own (lacks Seguro de Viagem, Cartões de Crédito, English Menu) (adds English Menu) | own (lacks TAP FORBIZ, Livro de Reclamações) | 1 in 1 | 9 in 7 | 7 |
| pt-ml | pt-pt | `/pt-ml/index` | own (lacks Seguro de Viagem, Cartões de Crédito, English Menu) (adds English Menu) | own (lacks TAP FORBIZ, Livro de Reclamações) | 0 in 0 | 9 in 7 | 7 |
| pt-mx | pt-pt | `/pt-mx/index` | own (lacks Seguro de Viagem, Cartões de Crédito, English Menu) (adds English Menu) | own (lacks TAP FORBIZ, Livro de Reclamações) | 1 in 1 | 10 in 8 | 7 |
| pt-mz | pt-pt | `/pt-mz/index` | own (lacks Seguro de Viagem, Alojamento, Cartões de Crédito, English Menu) (adds Acomodação, English Menu) | own (lacks TAP FORBIZ, Livro de Reclamações) | 1 in 1 | 10 in 8 | 7 |
| pt-nl | pt-pt | `/pt-nl/index` | own (lacks Cartões de Crédito, English Menu) (adds English Menu) | own (lacks Livro de Reclamações) | 7 in 6 | 10 in 8 | 4 |
| pt-no | pt-pt | `/pt-no/index` | own (lacks Cartões de Crédito, English Menu) (adds English Menu) | own (lacks Livro de Reclamações) | 8 in 5 | 10 in 8 | 5 |
| pt-pa | pt-pt | `/pt-pa/index` | own (lacks Seguro de Viagem, Cartões de Crédito, English Menu) (adds English Menu) | own (lacks TAP FORBIZ, Livro de Reclamações) | 0 in 0 | 9 in 7 | 7 |
| pt-pl | pt-pt | `/pt-pl/index` | own (lacks Seguro de Viagem, Cartões de Crédito, English Menu) (adds English Menu) | own (lacks Livro de Reclamações) | 6 in 5 | 11 in 9 | 5 |
| pt-ro | pt-pt | `/pt-ro/index` | own (lacks Seguro de Viagem, Cartões de Crédito, English Menu) (adds English Menu) | own (lacks Livro de Reclamações) | 1 in 1 | 9 in 7 | 7 |
| pt-rs | pt-pt | `/pt-rs/index` | own (lacks Seguro de Viagem, Cartões de Crédito, English Menu) (adds English Menu) | own (lacks TAP FORBIZ, Livro de Reclamações) | 0 in 0 | 9 in 7 | 7 |
| pt-ru | pt-pt | `/pt-ru/index` | own (lacks Seguro de Viagem, Cartões de Crédito, English Menu) (adds English Menu) | own (lacks Livro de Reclamações) | 1 in 1 | 9 in 7 | 7 |
| pt-se | pt-pt | `/pt-se/index` | own (lacks Cartões de Crédito, English Menu) (adds English Menu) | own (lacks Livro de Reclamações) | 8 in 5 | 10 in 8 | 5 |
| pt-sk | pt-pt | `/pt-sk/index` | own (lacks Seguro de Viagem, Cartões de Crédito, English Menu) (adds English Menu) | own (lacks TAP FORBIZ, Livro de Reclamações) | 0 in 0 | 9 in 7 | 7 |
| pt-sn | pt-pt | `/pt-sn/index` | own (lacks Seguro de Viagem, Cartões de Crédito, English Menu) (adds English Menu) | own (lacks TAP FORBIZ, Livro de Reclamações) | 0 in 0 | 10 in 8 | 7 |
| pt-st | pt-pt | `/pt-st/index` | own (lacks Seguro de Viagem, Cartões de Crédito, English Menu) (adds English Menu) | own (lacks TAP FORBIZ, Livro de Reclamações) | 0 in 0 | 9 in 7 | 7 |
| pt-tg | pt-pt | `/pt-tg/index` | own (lacks Seguro de Viagem, Cartões de Crédito, English Menu) (adds English Menu) | own (lacks TAP FORBIZ, Livro de Reclamações) | 0 in 0 | 10 in 8 | 7 |
| pt-tn | pt-pt | `/pt-tn/index` | own (lacks Seguro de Viagem, Cartões de Crédito, English Menu) (adds English Menu) | own (lacks TAP FORBIZ, Livro de Reclamações) | 0 in 0 | 9 in 7 | 7 |
| pt-tr | pt-pt | `/pt-tr/index` | own (lacks Seguro de Viagem, Cartões de Crédito, English Menu) (adds English Menu) | own (lacks TAP FORBIZ, Livro de Reclamações) | 0 in 0 | 10 in 8 | 7 |
| pt-ua | pt-pt | `/pt-ua/index` | own (lacks Seguro de Viagem, Cartões de Crédito, English Menu) (adds English Menu) | own (lacks TAP FORBIZ, Livro de Reclamações) | 0 in 0 | 9 in 7 | 7 |
| pt-us | pt-pt | `/pt-us/index` | own (lacks Seguro de Viagem, Alojamento, English Menu) (adds Alojamento, English Menu) | own (lacks TAP Store, Livro de Reclamações) | 16 in 11 | 12 in 10 | 5 |
| pt-uy | pt-pt | `/pt-uy/index` | own (lacks Seguro de Viagem, Cartões de Crédito, English Menu) (adds English Menu) | own (lacks TAP FORBIZ, Livro de Reclamações) | 0 in 0 | 9 in 7 | 7 |
| pt-ve | pt-pt | `/pt-ve/index` | own (lacks Seguro de Viagem, Cartões de Crédito, English Menu) (adds English Menu) | own (lacks TAP FORBIZ, TAP Store, Livro de Reclamações) | 0 in 0 | 9 in 7 | 7 |
| pt-za | pt-pt | `/pt-za/index` | own (lacks Seguro de Viagem, Cartões de Crédito, English Menu) (adds English Menu) | own (lacks TAP FORBIZ, Livro de Reclamações) | 0 in 0 | 10 in 8 | 7 |

Rollback: git revert; the documents stay unpublished in Document Authoring (the roots'
folders are new: nothing was there before).
