# ch pilot, part 2: homepages and own pages of ch/en and ch/de (preview only)

2026-10-27. Nothing published; `*.aem.live/ch/en/homepage` answers 404.

## Captured (Bright Data, one warm session, 5-10 s pacing)

- `/ch/en/homepage`, `/ch/de/homepage`: captured earlier today for the market sample (not fetched
  again).
- The 9 own pages of `tools/reports/markets/inventory.json` (none is a test page):
  - ch/en: `local-page/experience-america`, `companion-special-first-class`,
    `companion-special-premium-economy-class`, `smart-bags`;
  - ch/de: `local-page/black-friday`, `companion-special-first-class`,
    `companion-special-premium-economy-class`, `fluege-vo-zurich-nach-china`,
    `event/exklusives-event-angebot-dxb-1`.
- `/xx/en/homepage`. Shared pages were not captured (A or B decides how they come).

## xx/en: what www answers for a language-only root

- `/xx/en/homepage` answers 200 with a page of its own: canonical `https://www.lufthansa.com/xx/en/homepage`,
  robots `index,follow`, `lang="en"`, the selector "Andere Länder | English" (other countries).
- It is an international homepage, not a copy of a market:
  - with today's ch/en and ca/en homepages it shares 25 authored text blocks and has 13 of its own
    (a fare teaser of routes from Frankfurt);
  - with de/en (captured 21 Oct) it shares 35 and has 3 of its own;
  - it shows no currency.
- So www keeps a market-neutral English version, which A or B can use as the English language
  version. Whether the other `xx/<ll>` roots answer the same way is not checked: one page per the
  request.

## Imported, made the root's own, uploaded and previewed

| DA path | Import | Preview |
| --- | --- | --- |
| /ch/en/homepage, /ch/de/homepage | homepage template | 200 |
| the 9 own pages | info template (the importer's rule for market-only pages) | 200 |
| /ch/en/nav, /ch/en/footer | copies of /de/en/nav and /de/en/footer (tools/markets/root-docs.mjs) | 200 |
| /ch/de/nav, /ch/de/footer | copies of /de/de/nav and /de/de/footer | 200 |

After the import:

- **Links into the page's own root** were made root-relative
  (`tools/markets/root-docs.mjs --own-root`): the importer writes them to www for a root outside
  the scope.
- **The homepages' large SVG** (one per homepage, over 40 KB) was rasterized by
  `postprocess-media.mjs`. Before that the content bus answered 409 to their preview.
- **Nav and footer copies** use the link step's rule with the page groups of www's sitemap
  dataset: 64 nav links and 17 footer links point to the ch root. The selector label reads
  "Switzerland | English" and "Schweiz | Deutsch".
- **Left on de/en and de/de:** `/de/en/articles` and `/de/en/support/search/search-result` (and
  their de/de counterparts), because the ch roots have no such page. Links to www stay as they are
  (14 in the nav, 5 in the footer), as the link step leaves other hosts.

Rollback: unpreview and delete the 15 documents in DA (`tools/importer/sites/lh-com.json` lists them).

## Links that answer 404 on preview (shared ch pages, until A or B is done)

From the homepages (the same 10 on ch/en and ch/de, German slugs on ch/de):

- `/ch/en/100-years`, `/ch/en/additional-services`
- `/ch/en/book-and-manage/additional-services/get-your-guide`
- `/ch/en/book-and-manage/flights/giftvoucher`
- `/ch/en/book-and-manage/offers-and-destination?OriginCode=ZRH&tripType=ROUNDTRIP`
- `/ch/en/hotel-offers` (ch/de `/ch/de/hotelangebote`), `/ch/en/lh-rentalcar` (ch/de `/ch/de/mietwagenangebote`)
- `/ch/en/onboard-delights`, `/ch/en/payment-options`, `/ch/en/sixt`

From the own pages:

- `/ch/en/flights` (both companion specials)
- `/ch/en/book-and-manage/offers-and-destination?country=US` (experience-america)
- `/ch/en/baggage`, `/ch/en/check-in-baggage`, `/ch/en/digital-baggage-services`,
  `/ch/en/digital-travel-companion`, `/ch/en/online-check-in` (smart-bags)
- `/ch/de/fluege` (black-friday and both companion specials), `/ch/de/travel-id` (black-friday)
- `/ch/de/discover-lufthansa/carbon-offsetting/faq-saf` (the DXB event)

The nav and footer copies link into ch as well (64 and 17 links): most of those targets are shared
pages and answer 404 on preview for now.

## Left out, and why

- **Main's code renders ch with de/en's row until part 1 is on main.** The locale table with the ch
  rows is on the branch `locale-table` (not pushed: git has no credentials in this session). Until
  then the preview renders ch with de/en's row: the de/en nav and footer, FRA, EUR. Checked
  locally with the branch's code: the ch rows render (ZRH in the destination finder, the ch nav and
  footer, every block loaded).
- **`head-metadata.mjs` was not run.** It only handles scope pages, so canonical and hreflang are
  as the importer wrote them.
- **The homepages' stage promotions:** the ch homepages carry the stage inline (hero card), so no
  `/ch/<ll>/fragments/stage-promotions` document is needed.
- **The breadcrumb's Parent** (page metadata) still names its www URL. The `--own-root` step only
  changes links.
