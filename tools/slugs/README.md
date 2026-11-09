# Slug maps: one page, one slug in every language

A page has the same slug in every language of an airline. Where www uses another (translated) slug in a language, our document lives
at the common slug, the one the page has in the source language (English), and the www URL gets a 301 to it. `tools/slugs/<site>.json`
says which www slug is which page. A map changes nothing by itself: every entry is **inactive** until the round that moves it.

| file | airline | source root | state |
|---|---|---|---|
| `lh-com.json` | Lufthansa | `de/en` | listed, all flags off |
| `lh-austrian.json` | Austrian | `at/en` | listed, all flags off |
| `lh-swiss.json` | SWISS | `ch/en` | listed, all flags off |
| `lh-brussels.json`, `lh-discover.json` | Brussels, Discover | `be/en`, `de/en` | measured zero, no group listed (`listed: false`): nothing moves, the guard has nothing to refuse |
| `lh-b2b.json` | Group for Business | `de/en` | pairing unmeasured (no hreflang in any captured page), nothing moves |
| `lh-cargo.json` | Cargo | `en` | partly measured on the held snapshots, 5 candidates listed, nothing moves |

TAP, Air Dolomiti and ITA have no file: they keep a slug per language.

## Rules

- **Canonical path** = the EDS name (lower case, `a-z`, `0-9`, hyphens) of the page's slug in the source root, under the root of each
  language: the German page of `/de/en/flight-search` is `/de/de/flight-search`, not `/de/de/flugsuche`.
- A **group** is one page in all its versions: the URLs that the airline's sitemaps list as each other's hreflang alternates (Lufthansa:
  also the pairs of `tools/migration-scope/pages.csv`). Two groups with one canonical path and no common root are one page (merged).
- An **alias** is a www slug that differs from the canonical one in a root. Aliases that differ only in case or punctuation
  (`sanitizedOnly`) are the same page at the same document and never active: they pair a www path with ours.
- **Exceptions** keep their current path in every root and are listed in `exceptions`: `multi-source-path` (the source root holds
  two paths), `source-conflict` (no member in the source root and the English roots disagree), `collision` (a canonical path that is
  another page's www path or canonical path in a root; none today), `no-source-member` (an own page without an English member).
  Nothing is written for them.
- Broken `<loc>` addresses that carry the host name inside the path (`/ch/fr/www.swiss.com/ch/fr/...`) are ignored and counted.

## Format (version 1)

```
site, airline, host, sourceLanguage, sourceRoot, source (the data), measured (counts)
mirrors    { "gc/de": "de/de" }   an internal tree that follows a public root's slugs
active     { "<root>": false }    one flag per root that has aliases
rootsets   [ ["at/de", "de/de"] ] sorted root lists, referenced by index
groups     [ { id, canonical: "/flights", roots: <rootset>, aliases: [ { slug: "/fluege", roots: <rootset>, sanitizedOnly? } ] } ]
exceptions [ { id, kind, key, detail, rootCount, slugs, variants?, with? } ]
```

`roots` lists the roots whose www slug is the canonical one, `aliases` the roots with another slug. The www URL of a page in a root is
`<host>/<root><slug>` (the root page has slug `/`). An alias is **active** when its group says `active: true`, or (the group says
nothing) when its root's flag is true. All flags are off.

## Using a map

`lib.mjs` (tests: `test/slug-map.test.mjs`):

```js
import { loadMap } from './tools/slugs/lib.mjs';
const map = loadMap(JSON.parse(fs.readFileSync('tools/slugs/lh-austrian.json', 'utf8')));
map.canonicalOf('/at/de/anmeldung');            // active aliases only: '/at/de/login' once at/de is on, else the path as it was
map.canonicalOf('/at/de/anmeldung', { all: true }); // the whole map, for pairing: '/at/de/login'
map.wwwPathsOf('/at/de/login');                 // ['/at/de/anmeldung']: our path to the www path(s), the canonical slug first
map.groupOf('/at/de/anmeldung');                // the group, or null
map.entries();                                  // every active-or-not alias [root, www slug, canonical slug, group]
```

- **Importing** (www path to our path): `canonicalOf(path)` for the entries that are active; links the same way. A write to a localized
  slug of an active alias is refused with `canonicalOf(path)` in the message.
- **Pairing** (parity sweep, market-diff, page-check): `canonicalOf(path, { all: true })` and `wwwPathsOf(path)`; they ignore the flags.
- `gc/<ll>` follows `mirrors` (`/gc/de/fluege` is the page of `/de/de/fluege`).
- Paths come back as they went in when the map does not know them (an exception, an own page, another airline).
- The files are generated from the hreflang data (www's sitemaps) by a script, not edited by hand; the flags of a round are the one
  change a commit makes to them. `validateMap(map, { expectAllOff })` checks the invariants (both directions, no collisions).
