# All markets on Edge Delivery: plan (package 1)

2026-10-27. Inputs: the sitemap dataset (`tools/source-export/feeds/sitemaps`, 2026-10-27), the
inventory (`inventory.md`), the code list (`code.md`) and the 60-page sample (`sample.md`). Nothing
was imported. The decisions marked **yours** are open.

## 1. What is there

- **240 roots with sitemaps in 97 countries**, 236 of them not on Edge Delivery; 13 `xx/<ll>`
  roots only as hreflang targets.
- **Every country has de and en.** 62 countries have only those two, and 35 have one or two more:
  fr 14 roots, es 13, pt, ru, zh and hk 3 each, it and el 2 each, ja, ko and pl 1 each.
- **210,791 pages** in the 236 roots, without AEM configuration pages and the stale leftover
  files.
  - **210,229 (99.7 %) have a path of their language's reference:** de/en for en, de/de for de,
    the majority of the roots for every other language.
  - **Other slug for the same page:** 30.
  - **Own pages:** 532 (en 375, de 87, the 11 other languages 70).
- **Size per root.** An en or de root is about 1,030 pages, a root of another language about 335.
  Those 11 languages share one smaller page set: travel information, without articles and most
  campaign pages.
- **What the sample showed** (12 markets of en, de, fr and es, 5 pages each):
  - group travel, baggage and online check-in, in all 30 compared pages: the same as the
    reference, except that the links point to the page's own root;
  - the flight offer pages: the same authored content; the offers and prices come from www's
    apps per market (the replica's blocks load them per market already);
  - homepages: every one has local content (other teasers and components, up to 190 own text
    blocks on ch/fr; ca/fr without the fare teaser; AED on ae/en);
  - no phone number differed.
- **The reference markets have local content of their own.** de/de's flight offers page has a
  Germany-only teaser ("Parken am Terminal"); ch/de, be/de and dk/de show an entry-rules teaser
  there instead.
- **Footers are the same within a language,** except the root in the destinations link
  (`/lhg/<cc>/<ll>`). The header navigation is loaded by www in the browser and is not in the
  captures: not compared.
- **`lastmod` carries no signal for local edits:** it is when www wrote the sitemap file. Every
  root's value is within a day of the reference's.

## 2. Which roots: rollout or own import

- **Rollout plus own pages (all 236 roots).** A language version, the root's own pages (532 in
  all) and its local pages: the homepage for certain, and the pages with local teasers.
- **A full import of its own: no root needs one.** For the three single-root languages (jp/ja,
  kr/ko, pl/pl) the language version is the root itself.
- **Leave out:**
  - the AEM configuration pages (5,152, mostly in mk/en, mk/de and us/de: `/configuration/seo-pages`);
  - the 1,944 URLs only in the stale files (test and campaign leftovers);
  - the test pages among the own pages (`/event/test-cug`, `APAC-market-conference-test`, …).
    List them at import time.

## 3. New languages need a language version first

Import it from the language's home market, the root with the full page set:

| Language | From | Pages | Then roll out to |
| --- | --- | --- | --- |
| fr | fr/fr | 345 | 13 roots (be, ca, ch, lu, us, ar, cl, co, cr, dz, gq, ma, tn) |
| es | es/es | 352 | 12 (mx, ar, cl, co, cr, ec, pa, pe, ve, br, ca, us) |
| pt | pt/pt | 340 | ao, br |
| ru | ru/ru | 333 | by, kz |
| zh | cn/zh | 337 | hk, tw |
| hk | hk/hk | 336 | cn, tw |
| it | it/it | 331 | ch |
| el | gr/el | 333 | cy |
| ja, ko, pl | jp/ja, kr/ko, pl/pl | 337, 335, 335 | none |

That is 3,714 pages to import. Every language version is a market of its own with local content
(de/de shows it). So the version that rolls out must not carry the home market's local teasers.
Two ways (**yours**):

- **Import the home market and mark its local parts.** The homepage, the offers teasers and the
  campaign pages stay with that market; the rest is the language version.
- **Use www's own language versions `xx/<ll>`.** www has 13 of them, as the targets of
  language-only hreflang values, with 330 to 1,054 URLs each. They may be the market-neutral
  version. The dataset does not show what their URLs answer, so the pilot's first step checks
  one through the Bright Data session.

## 4. Two ways to put the roots on Edge Delivery

### A. One DA document per page and root (rollout copies)

Every root gets its own copy of each shared page (rolled out from the language version, links
made the root's own by the link step), plus its own and local pages.

- DA documents:
  - en 97,748 + de 97,021 shared copies;
  - 11,840 rollouts of the new languages;
  - 3,714 language-version imports;
  - 532 own pages, 236 homepages, 472 nav and footer documents;
  - **about 211,500 documents** (the replica has about 5,000 today, 3,905 of them in the four roots).
- Configuration: `helix-sitemap.yaml`, the search and article indexes, the redirects rows and the
  locale table get one entry per root (240 instead of 4). Generate them; check Edge Delivery's
  limits on the number of query indexes and sitemaps before relying on 240 of each.
- Authors edit any root's page directly; the next rollout from the language version marks the
  differences (merge).

### B. One document per language page; lh-edge serves each root from it

`/ch/en/baggage` is answered with the language version's document (`/de/en/baggage`, or `xx/en`),
rendered for ch/en. A root only has its own documents where it differs: homepage, own pages, local
overrides.

- **DA documents:**
  - 3,714 new language-version pages (en and de exist);
  - 532 own pages and 236 homepages;
  - nav and footer per language, 26 documents (the root is filled in when rendered);
  - **about 4,500 documents.**
- **lh-edge:**
  - a route that answers a root path from the language document when the root has no document
    of its own;
  - the root's path list from the dataset (paths a root lacks answer 404 as on www);
  - links rewritten to the root (HTMLRewriter, the link step's rule);
  - canonical and hreflang per root from the page groups.
- **Page code:** reads the root from the URL (it does already), so currency, home airport, time
  zone and the APIs follow the root.
- **Sitemaps:** lh-edge generates one per root from the language's index and the root's path list.
- **Search:** one index per language (13), filtered to the root's paths.
- **Redirects:** per-root rules generated as patterns.
- **The risk:** local edits on shared pages that the sample did not see. Mitigation: a content
  sweep per root (2 to 3 pages per page type, like `sample.md`) before a root goes live, and an
  override document for every page that differs.
- **Authors:** edit the language version once for all its roots, and a root's own document only
  where it differs. This is how www's content behaves today: the same page in every market of a
  language.

### Estimates

Measured today:

- **Capture:** one Bright Data session, about 35 s per page (median), pacing and screenshot
  included, so about 100 pages an hour. The 5 to 10 s pacing alone would allow 360 to 720. Today
  one session hung for 13 minutes, and the second session was blocked twice.
- **Import from the snapshots:** offline, seconds per page.
- **Upload and preview** (`da-upload.mjs`): about 1,500 documents an hour.

| | A: copies per root | B: language documents + lh-edge |
| --- | --- | --- |
| Pages to capture (language versions 3,714, own 532, homepages 236) | 4,482 | 4,482 |
| Capture at ~100/h (pacing alone 360-720/h) | ~45 h (6-12 h) | ~45 h (6-12 h) |
| Content sweep before going live (3 pages × 6 types × 236 roots) | – | ~4,250 pages, ~42 h |
| DA documents written | ~211,500 | ~4,500 |
| Upload, rollout and preview at ~1,500/h | ~140 h | ~3 h |
| Code and configuration | the four-root list (`code.md`), generated per-root entries for 240 roots | the four-root list, plus the lh-edge root route, root path lists, generated sitemaps |
| Re-sync when www changes a shared page | every root's copy (95 × per en page) | once per language |

The capture is the same work in both, and it dominates the calendar unless several sessions can
run. That is your call (one Chromium-using session at a time today). The rollout copies of A are
fast per document but run to 211,500 documents to keep in step. B moves that work into code.

## 5. Per root: nav, footer, selector, sitemaps, search, redirects

- **Nav and footer:** one per language, with the root filled in when rendered. The footers match
  that, except the destinations link. For the nav, the pilot checks one root per language, since
  the captures don't hold www's client-loaded navigation. With A this is 472 documents instead.
- **Country and language selector:** a country list (97) and that country's languages, from the
  locale table built from `roots.json`. lh-edge's `MARKETS` (default language per country) comes
  from the same table. The header dialog changes from "every locale" to country plus language
  (`code.md`, header).
- **Sitemaps:** one per root (240 files plus a complete index; www's own index is cut off after
  499 entries). With A, from per-root indexes; with B, generated by lh-edge.
- **Search:** with A, one index per root; with B, one per language. `site-search.js` needs
  stopwords per language and a tokenizer for ja, zh, hk and ko.
- **Redirects:** the 8 rows per root of today's `/redirects` sheet become generated rows (about
  1,900) with A, or pattern rules in lh-edge with B. `.changelocale` and the locale map take every
  root.
- **Labels:** about 20 blocks have English and German labels only (`code.md`). The new languages
  need labels; www's label services (`/service/api/labels/<app>/lh/<lang>`) have them.

## 6. Who runs the rollouts (yours): what each needs

- **DA's localization app:**
  - `translate.json` with one row per language: the language version as `location`, every root
    of the language in `locales` (en and de: 95 each);
  - projects of `/de/en/…` URLs (or the language version's);
  - the link step after each rollout;
  - the README's procedure (versions before, every target checked after, marks resolved before
    the next send);
  - the app's limits that apply: only source-folder URLs; a failed write can show as Complete;
    a failed read turns merge into overwrite. At 95 locales per row these checks are the work.
- **A script** (`tools/loc/link-lib.mjs` plus a copy step on DA's source API):
  - copies the language document to every root that has the path (the dataset's path lists),
    makes the links the root's, skips roots with an own document;
  - reads each one back; a labelled version before;
  - a DA login (`DA_TOKEN` or the injected credentials);
  - about 1,500 documents an hour.
  - It knows nothing of merge marks: a root's own edits are kept only if the script skips
    documents that differ from the last rollout. It needs a record of what it wrote.
- **With B:** neither is needed for the shared pages. Only the own and override documents are
  imported.

## 7. Pilot proposal: ch/en and ch/de (not imported)

Switzerland: one English and one German market, CHF, a local homepage, few own pages (ch/en 4,
ch/de 5, one of them market-only). The country also has fr and it for the step after (ch/fr is in
the sample).

1. Locale table rows for ch/en and ch/de: currency CHF, home airport ZRH, time zone
   Europe/Zurich, shop lang, names. Plus the code changes of `code.md` that a third market needs.
   Without these, `getLocale()` would render ch/* with de/de's texts and FRA.
2. Capture through the Bright Data session: the two homepages, the 9 own pages, the nav and
   footer, and 3 pages of each page type for the content sweep. About 30 pages, about 30 minutes.
   Also one `xx/en` and one `xx/de` page, to see what www's language versions answer.
3. Choose A or B for the pilot. A: about 2,060 DA documents. B: about 15 documents and the lh-edge
   root route.
4. Preview both roots and compare with www page by page (the parity tools), then decide the rest.

The pilot costs about 1 hour of capture, either way.
