# it, el, ja, ko, pl: the held locale work, item by item (brief 526 item 2)

ema-adobe, 2026-11-09. The seven items of brief 526 that need no request to www, checked on main (as of be71a18), in
Document Authoring's preview (main--lh-com--moved-permanently.aem.page, curl) and on lufthansa.turnsthe.page (curl).
ema-cashub had (a), (b), (d), (e), (f) since brief 414. **All seven are done; nothing was left for me to build.**
Nothing uploaded or published; no request to www.

| item | state | where |
| --- | --- | --- |
| (a) locale rows | done | `tools/markets/locale-data.json`, generated `scripts/locale-table.js`: xx/it, ch/it, it/it, xx/el, cy/el, gr/el, xx/ja, jp/ja, xx/ko, kr/ko, xx/pl, pl/pl; the calls as decided: kr/ko currency KRW, pl/pl countryName.en "Poland", jp/ja name "Japan \| 日本語" (countryName.ja "Japan"), it/it en "Italy" / de "Italien" / it "Italia"; hreflang it, it-CH, it-IT, el, el-CY, el-GR, ja, ja-JP, ko, ko-KR, pl, pl-PL (as zh-HK, zh-CN for hk's and zh's roots); `languageVersions` it/el/ja/ko/pl = xx/<ll> |
| (b) the roots' nav and footer | done | the local harness ran `root-docs-commands.sh` on 2026-11-06 01:58-02:24 CET (`root-docs-harness.md`, part A: 14 of 14 written; part B: the roots' own links, 25 of 46 changed). On preview all 14 answer 200 with the root's own label (jp/ja "Japan \| 日本語", kr/ko "대한민국 \| 한국어", pl/pl "Polska \| Polski", it/it "Italia \| Italiano", gr/el "Ελλάδα \| Ελληνικά") and 59-60 links into their own root |
| (c) query indexes | done | `helix-query.yaml`: search-xx-<ll>, market-model-xx-<ll>, market-llms-xx-<ll> for it, el, ja, ko, pl (613708c, 2026-11-06, as xx/zh's). They fill on publish |
| (d) built-in texts | done | the picker options, the accordion filter and the article dates in it, el, ja, ko, pl: `test/languages-17-21.test.mjs` (5 pass) and `test/languages-17-21-rest.test.mjs` (3 pass), run 2026-11-09 |
| (e) the own confirmations' capture lists | done | `tools/markets/capture-lists/19-ja-`, `20-ko-`, `21-pl-confirmations-own.txt` (eafbc58, 2026-11-05), beside 15-hk, 16-zh, 17-it, 18-el |
| (f) offline-importer.mjs's script path | done | `tools/importer/offline-importer.mjs` reads `EXCAT_IMPORT_SCRIPTS_SOURCE` (default the skill's folder); `test/offline-importer.test.mjs` 2 pass |
| (g) zh / hk / pt / ru | done | the root navs and footers of cn/hk, hk/hk, tw/hk, cn/zh, hk/zh, tw/zh, ao/pt, br/pt, pt/pt, by/ru, kz/ru, ru/ru: 200 in DA and on preview, each with its root's label (`root-docs-harness.md`, "Already done"); pt's and ru's confirmation pages 200 on preview; the own (ammunition) confirmations of xx/hk (2), xx/zh, xx/it, xx/el, xx/ja, xx/ko, xx/pl: all 8 answer 200 on preview now (2026-11-09) |

## One point for you: the switch

The brief has the rows "behind the switch (liveWaves stays off)" and the waves as yours to come. On main the waves are
already on: `tools/markets/locale-data.json` `liveWaves` is `["ch", 1, ..., 17, 18, 19, 20, 21]` since 2026-11-06
(029ec0b wave 17 it, fa1e621 18 el, e232750 19 ja, d305387 20 ko, daa6a61 21 pl, each with its sitemap file), so the
generated table has the twelve rows as `status: live`, and lufthansa.turnsthe.page answers all twelve roots' homepages
200 (checked 2026-11-09). Nothing of mine changes that; if those waves were meant to wait, that is a revert of those
five commits, yours to decide.

## Checked again on live (brief 536, 2026-11-09 evening; Ben's rule: only live counts)

All seven items hold on main (44a93d7) and on live (main--lh-com--moved-permanently.aem.live, lufthansa.turnsthe.page,
curl). No request to www.

| item | live |
| --- | --- |
| (a) | the twelve rows and the calls in `locale-data.json` / `scripts/locale-table.js` (KRW, "Poland", "Japan \| 日本語", it/it's names; hreflang it-CH, it-IT, el-CY, el-GR, ja-JP, ko-KR, pl-PL); `liveWaves` still holds ch and waves 1-21 (yours, unchanged) |
| (b) | the 14 navs and footers of it/it, ch/it, gr/el, cy/el, jp/ja, kr/ko, pl/pl: live 200, the same bytes as preview |
| (c) | the indexes are filled: xx/it 304 rows, xx/el 309, xx/ja 309, xx/ko 307, xx/pl 310 (search-index, market-model and market-llms each) |
| (d), (f) | `test/languages-17-21.test.mjs` 5 pass, `test/languages-17-21-rest.test.mjs` 3 pass, `test/offline-importer.test.mjs` 2 pass |
| (e) | the three lists on main (eafbc58); their pages live 200 |
| (g) | the 26 navs and footers of cn/hk, hk/hk, tw/hk, cn/zh, hk/zh, tw/zh, ao/pt, br/pt, pt/pt, by/ru, kz/ru, ru/ru: live 200, the same as preview; every own confirmation live 200 (the 8 pages of the seven `*-confirmations-own.txt` lists) |

The confirmation lists' other 65 URLs that answer 404 on aem.live are not documents and need none:
- the roots' lists (`<root>-confirmations.txt`, 7 pages each for hk/hk, cn/zh, it/it, gr/el, jp/ja, kr/ko, pl/pl,
  ru/ru): a root's confirmation page is its version's document, served under the root by lh-edge (lufthansa.turnsthe.page
  answers them 200);
- the versions' `register-sporting-firearm/confirmation` (de/en's path; www's forms of the versions go to
  `register-sporting-firearm1/confirmation`, which is live) and xx/hk's `register-animal/confirmation` (its form goes to
  `register-animal/thank-you-confirmation`, live).

Every success link of the 36 live form documents of xx/pt, ru, hk, zh, it, el, ja, ko and pl (26 links) answers 200 on
lufthansa.turnsthe.page.

**One functional point, ahead of the locale items (Ben's order):** on lufthansa.com a market root's own homepage lists
no hreflang alternates. The language versions' homepages name it (de/de/homepage: 251 alternates, kr/ko/homepage among
them), but kr/ko/homepage, jp/ja/homepage, fr/fr/homepage and hk/hk/homepage carry none back. Their other pages, served
from the version, do carry the set (jp/ja/baggage-irregularities: 251). The brands' sites were given this on 2026-11-02
(16f2dd1: `withLiveAlternates(..., { marketOwn: true })` in the site route). lh-com's pass-through route still calls it
without `marketOwn` ("lh-com's hosts as before"). The fix is one argument in `tools/workers/lh-edge/src/index.js`'s
pass-through call, with a test like 16f2dd1's. It changes the head of every live market root's homepage on
lufthansa.com, so I haven't made it without your go.
