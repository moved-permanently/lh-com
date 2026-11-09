/* eslint-disable import/extensions, max-len, no-use-before-define -- dev tooling, plain Node */
/**
 * Slug maps: one page, one slug in every language of an airline (tests: test/slug-map.test.mjs).
 *
 * A *group* is one logical page in all its versions (the hreflang alternates of the airline's
 * sitemaps tie its URLs together). The canonical path of a group is the slug it has in the
 * source language (English), taken from the source root (`de/en` for Lufthansa). Every other
 * root that holds the page under another slug has an *alias*: the www slug that gets a 301 to
 * the canonical path once its round is active.
 *
 * Nothing here moves, redirects or publishes anything. A map file only says what is what; an
 * entry changes behaviour only while it is active (`active` per root, `group.active` per group),
 * and every flag is off until the round that moves it.
 *
 * Map file (tools/slugs/<site>.json), version 1:
 *   site, airline, host, sourceLanguage, sourceRoot, source (where the data came from), measured (counts),
 *   mirrors   { "gc/de": "de/de" }  internal trees that follow a public root's slugs
 *   active    { "<root>": false }   one flag per root that has aliases; an alias is active when
 *                                    its group's `active` is true, or (group.active unset) its root's flag is true
 *   rootsets  [ ["de/de", "at/de"] ] sorted root lists, referenced by index
 *   groups    [ { id, canonical: "/flights", roots: <rootset>, aliases: [ { slug: "/fluege", roots: <rootset>, sanitizedOnly? } ] } ]
 *               `roots`: the roots whose www slug is the canonical one; `aliases`: the roots with another slug
 *   exceptions [ { id, kind, key, ... } ] groups that keep their current path in every root:
 *               multi-source-path, source-conflict, collision, no-source-member
 *   The canonical path is the EDS name (lower case, a-z 0-9 hyphens) of the source slug, which is where our documents live.
 *   A www slug that differs from it only in case or punctuation is an alias with `sanitizedOnly: true`: same page, no translation, never active
 *   (it pairs www and our path; it is not a redirect of this programme).
 * The www URL of a group in a root is host + "/" + root + slug (root pages: slug "/").
 */
import crypto from 'node:crypto';

export const MAP_VERSION = 1;
export const EXCEPTION_KINDS = ['multi-source-path', 'source-conflict', 'collision', 'no-source-member'];

const ROOT_RE = /^[a-z]{2}\/[a-z]{2}$/;
export const langOf = (root) => root.split('/')[1];

/** The www path of a page in a root: "/<root>" + slug; the root page has slug "/". */
export const joinPath = (root, slug) => (slug === '/' ? `/${root}` : `/${root}${slug}`);

/** Splits a www path into [root, slug]; null when it is not under /cc/ll. */
export function splitPath(p) {
  const m = String(p).match(/^\/([a-z]{2}\/[a-z]{2})(\/.*)?$/);
  if (!m) return null;
  return [m[1], m[2] && m[2] !== '/' ? m[2].replace(/\/$/, '') : '/'];
}

/** The name EDS gives a path: lower case, a-z 0-9 and hyphens (helix-shared sanitizeName), kept per segment. */
export const sanitizePath = (slug) => slug.split('/').map((s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')).join('/');

const hashId = (prefix, text) => `${prefix}-${crypto.createHash('sha1').update(text).digest('hex').slice(0, 8)}`;

/**
 * Builds the map from hreflang groups.
 * @param {object} o
 * @param {string} o.site            `lh-com`, `lh-austrian`, ...
 * @param {string} o.airline
 * @param {string} o.host            `https://www.lufthansa.com`
 * @param {string} o.sourceRoot      `de/en`
 * @param {string} [o.sourceLanguage='en']
 * @param {Array<{paths: Object<string,string|string[]>}>} o.groups  paths: root -> www path(s)
 * @param {object} [o.source]        description of the data (public)
 * @param {object} [o.mirrors]
 */
export function buildMap(o) {
  const sourceLanguage = o.sourceLanguage || 'en';
  const stats = { groupsInData: o.groups.length, ignoredPaths: 0, ignoredPathsSample: [] };
  // 1. normalise: group -> { roots: Map(root -> Set(slug)) }
  const norm = [];
  o.groups.forEach((g) => {
    const roots = new Map();
    Object.entries(g.paths).forEach(([, v]) => {
      (Array.isArray(v) ? v : [v]).forEach((p) => {
        const sp = splitPath(p);
        // a broken <loc> that carries the host name inside the path (www.swiss.com/ch/en/www.swiss.com/ch/en/...) is no page address
        if (!sp || /^\/[a-z0-9-]+(\.[a-z0-9-]+)+\//.test(sp[1])) {
          stats.ignoredPaths += 1;
          if (stats.ignoredPathsSample.length < 5) stats.ignoredPathsSample.push(p);
          return;
        }
        if (!roots.has(sp[0])) roots.set(sp[0], new Set());
        roots.get(sp[0]).add(sp[1]);
      });
    });
    if (roots.size) norm.push(roots);
  });
  // 2. resolve the canonical slug of each group (the EDS name of its source-language slug)
  const san = sanitizePath;
  const items = norm.map((roots) => {
    const item = { roots, canonical: null, exception: null };
    const srcSlugs = roots.get(o.sourceRoot);
    const enRoots = [...roots.keys()].filter((r) => langOf(r) === sourceLanguage);
    if (srcSlugs) {
      const distinct = new Set([...srcSlugs].map(san));
      if (distinct.size === 1) [item.canonical] = [...distinct];
      else item.exception = { kind: 'multi-source-path', detail: `the source root ${o.sourceRoot} holds ${distinct.size} paths: ${[...srcSlugs].sort().join(' ')}` };
    } else if (enRoots.length) {
      const all = new Set(enRoots.flatMap((r) => [...roots.get(r)]).map(san));
      if (all.size === 1) {
        [item.canonical] = [...all];
        item.fallback = true;
      } else item.exception = { kind: 'source-conflict', detail: `no member in ${o.sourceRoot}; the ${sourceLanguage} roots disagree: ${[...all].sort().join(' ')}` };
    } else item.exception = { kind: 'no-source-member', detail: `no ${sourceLanguage} member; own page of ${[...roots.keys()].filter((r) => langOf(r) !== sourceLanguage).length ? 'other languages' : 'a market'}` };
    return item;
  });
  // 3a. groups the hreflang data left apart that have the same canonical path and share no root are one page (the same
  //     source-language slug, no root holds two of them): merged. Sharing a root, they stay apart and collide below.
  const merged = [];
  const byC = new Map();
  items.forEach((it) => {
    if (!it.canonical) { merged.push(it); return; }
    if (!byC.has(it.canonical)) byC.set(it.canonical, []);
    byC.get(it.canonical).push(it);
  });
  byC.forEach((list) => {
    const seen = new Set();
    const clean = list.every((it) => [...it.roots.keys()].every((r) => { const dup = seen.has(r); seen.add(r); return !dup; }));
    if (list.length === 1 || !clean) { merged.push(...list); return; }
    const m = {
      roots: new Map(), canonical: list[0].canonical, exception: null, fallback: list.every((it) => it.fallback), mergedGroups: list.length,
    };
    list.forEach((it) => it.roots.forEach((v, r) => m.roots.set(r, v)));
    merged.push(m);
  });
  items.length = 0;
  items.push(...merged);
  // 3. collisions, per root and case-insensitive (EDS lower-cases): a canonical path that is the
  //    www path of another group in a root, or the canonical path of another group
  const lc = san;
  const owner = new Map(); // `${root}${slug lc}` -> Set(item index)
  items.forEach((it, i) => it.roots.forEach((slugs, root) => slugs.forEach((s) => {
    const k = root + lc(s);
    if (!owner.has(k)) owner.set(k, new Set());
    owner.get(k).add(i);
  })));
  const byCanon = new Map();
  items.forEach((it, i) => { if (it.canonical) { const k = lc(it.canonical); if (!byCanon.has(k)) byCanon.set(k, []); byCanon.get(k).push(i); } });
  const clash = new Map(); // item index -> Set(other index)
  const mark = (a, b) => { if (!clash.has(a)) clash.set(a, new Set()); clash.get(a).add(b); };
  byCanon.forEach((idx) => { if (idx.length > 1) idx.forEach((a) => idx.forEach((b) => { if (a !== b) mark(a, b); })); });
  items.forEach((it, i) => {
    if (!it.canonical) return;
    it.roots.forEach((slugs, root) => {
      const deviating = [...slugs].some((s) => san(s) !== it.canonical);
      if (!deviating) return;
      const others = owner.get(root + lc(it.canonical));
      if (others) others.forEach((j) => { if (j !== i) { mark(i, j); mark(j, i); } });
    });
  });
  clash.forEach((others, i) => {
    const it = items[i];
    if (it.canonical) {
      it.exception = { kind: 'collision', detail: `canonical ${it.canonical} meets another page's path or canonical path in a root`, withKeys: [...others].map((j) => keyOf(items[j], o.sourceRoot)) };
      it.canonical = null;
    }
  });
  // 4. assemble
  const rootsets = new Map(); // JSON -> index
  const rsIndex = (roots) => {
    const k = JSON.stringify([...roots].sort());
    if (!rootsets.has(k)) rootsets.set(k, rootsets.size);
    return rootsets.get(k);
  };
  const groups = [];
  const exceptions = [];
  const deviatingByLanguage = {};
  const deviatingRoots = new Set();
  items.forEach((it) => {
    const key = keyOf(it, o.sourceRoot);
    if (!it.canonical) {
      const e = {
        id: hashId(o.site === 'lh-com' ? 'lh' : o.site.replace(/^lh-/, ''), key), kind: it.exception.kind, key, detail: it.exception.detail,
      };
      if (it.exception.withKeys) e.with = it.exception.withKeys.sort();
      e.rootCount = it.roots.size;
      e.slugs = [...new Set([...it.roots.values()].flatMap((s) => [...s]))].sort().slice(0, 12);
      if (it.exception.kind === 'multi-source-path' || it.exception.kind === 'collision' || it.exception.kind === 'source-conflict') {
        e.variants = variantsOf(it, rsIndex);
      }
      exceptions.push(e);
      return;
    }
    const byslug = new Map();
    it.roots.forEach((slugs, root) => slugs.forEach((s) => { if (!byslug.has(s)) byslug.set(s, []); byslug.get(s).push(root); }));
    const g = { id: hashId(o.site === 'lh-com' ? 'lh' : o.site.replace(/^lh-/, ''), it.canonical), canonical: it.canonical, roots: rsIndex(byslug.get(it.canonical) || []) };
    if (it.fallback) g.canonicalFrom = 'other-source-language-roots';
    if (it.mergedGroups) g.mergedGroups = it.mergedGroups;
    const aliases = [...byslug].filter(([s]) => s !== it.canonical).sort(([a], [b]) => a.localeCompare(b));
    if (aliases.length) {
      g.aliases = aliases.map(([slug, rs]) => {
        const a = { slug, roots: rsIndex(rs) };
        if (san(slug) === it.canonical) a.sanitizedOnly = true;
        return a;
      });
      const langs = new Set();
      aliases.filter(([s]) => san(s) !== it.canonical).forEach(([, rs]) => rs.forEach((r) => { langs.add(langOf(r)); deviatingRoots.add(r); }));
      langs.forEach((l) => { deviatingByLanguage[l] = (deviatingByLanguage[l] || 0) + 1; });
      if (!langs.size) g.sanitizedOnly = true;
    }
    groups.push(g);
  });
  groups.sort((a, b) => a.canonical.localeCompare(b.canonical));
  exceptions.sort((a, b) => a.kind.localeCompare(b.kind) || a.key.localeCompare(b.key));
  const rsList = [...rootsets.keys()].map((k) => JSON.parse(k));
  const active = Object.fromEntries([...deviatingRoots].sort().map((r) => [r, false]));
  const exceptionCounts = {};
  exceptions.forEach((e) => { exceptionCounts[e.kind] = (exceptionCounts[e.kind] || 0) + 1; });
  return {
    version: MAP_VERSION,
    site: o.site,
    airline: o.airline,
    host: o.host,
    sourceLanguage,
    sourceRoot: o.sourceRoot,
    source: o.source || {},
    measured: {
      groupsInData: stats.groupsInData,
      mapped: groups.length,
      mergedGroups: groups.reduce((n, g) => n + (g.mergedGroups ? g.mergedGroups - 1 : 0), 0),
      deviatingGroups: groups.filter((g) => g.aliases && !g.sanitizedOnly).length,
      sanitizedOnlyGroups: groups.filter((g) => g.sanitizedOnly).length,
      deviatingByLanguage: Object.fromEntries(Object.entries(deviatingByLanguage).sort()),
      exceptions: exceptionCounts,
      ignoredPaths: stats.ignoredPaths,
      ...(stats.ignoredPaths ? { ignoredPathsSample: stats.ignoredPathsSample } : {}),
    },
    mirrors: o.mirrors || {},
    active,
    rootsets: rsList,
    groups,
    exceptions,
  };
}

const keyOf = (it, sourceRoot) => {
  const s = it.roots.get(sourceRoot);
  if (s) return joinPath(sourceRoot, [...s].sort()[0]);
  const [r0] = [...it.roots.keys()].sort();
  return joinPath(r0, [...it.roots.get(r0)].sort()[0]);
};

function variantsOf(it, rsIndex) {
  const byslug = new Map();
  it.roots.forEach((slugs, root) => slugs.forEach((s) => { if (!byslug.has(s)) byslug.set(s, []); byslug.get(s).push(root); }));
  return [...byslug].sort(([a], [b]) => a.localeCompare(b)).map(([slug, rs]) => ({ slug, roots: rsIndex(rs) }));
}

/** An alias is active when its group says so, else when its root's flag is on. */
export const isActive = (map, group, root) => (typeof group.active === 'boolean' ? group.active : map.active[root] === true);

/**
 * Indexes a map file for lookups in both directions.
 *   canonicalOf(path, {all})  www path -> our canonical path (identity for a page without an active alias, and for an exception or unknown path)
 *   wwwPathOf(path)           our path -> the www path (the canonical slug's own root path when the root lists it, else its first alias)
 *   wwwPathsOf(path)          all www paths of our path, primary first
 *   entries()                 every [root, wwwSlug, canonical, group] (aliases only)
 *   groupOf(path)             the group of a www or canonical path
 */
export function loadMap(map) {
  const rs = map.rootsets;
  const www = new Map(); // exact www path -> hit
  const wwwLc = new Map(); // sanitized www path -> hit (first wins): a lower-cased request still finds its page
  const mirrors = map.mirrors || {};
  const wwwOf = new Map(); // `${root}${canonical}` -> [www paths], canonical first
  const add = (g, root, slug, alias, sanitizedOnly) => {
    const p = joinPath(root, slug);
    const hit = {
      g, alias, sanitizedOnly, root, slug,
    };
    www.set(p, hit);
    if (!wwwLc.has(sanitizePath(p))) wwwLc.set(sanitizePath(p), hit);
    const ck = joinPath(root, g.canonical);
    if (!wwwOf.has(ck)) wwwOf.set(ck, []);
    wwwOf.get(ck)[alias ? 'push' : 'unshift'](p);
  };
  map.groups.forEach((g) => {
    rs[g.roots].forEach((root) => add(g, root, g.canonical, false, false));
    (g.aliases || []).forEach((a) => rs[a.roots].forEach((root) => add(g, root, a.slug, true, !!a.sanitizedOnly)));
  });
  const strip = (p) => String(p).split(/[?#]/)[0].replace(/\.html$/, '').replace(/\/$/, '') || '/';
  const mirrorRoot = (p) => {
    const sp = p.match(/^\/([a-z]{2}\/[a-z]{2})(\/.*)?$/);
    if (sp && mirrors[sp[1]]) return [`/${mirrors[sp[1]]}${sp[2] || ''}`, sp[1]];
    return [p, null];
  };
  const find = (q) => www.get(q) || wwwLc.get(sanitizePath(q)) || null;
  const api = {
    map,
    /**
     * www path -> our canonical path. Without `all` only an active translated-slug alias maps (the guard and the importer);
     * `all`: the whole map, for pairing www and our pages (also case and punctuation forms). Anything else comes back as it was.
     */
    canonicalOf(p, { all = false } = {}) {
      const [q, mirror] = mirrorRoot(strip(p));
      const hit = find(q);
      if (!hit) return p;
      if (!hit.alias && !all) return p;
      if (hit.sanitizedOnly ? !all : (!all && !isActive(map, hit.g, hit.root))) return p;
      const c = joinPath(hit.root, hit.g.canonical);
      return mirror ? c.replace(`/${hit.root}`, `/${mirror}`) : c;
    },
    /** our canonical path -> the www path(s) of the page in that root, the canonical slug first when the root lists it. */
    wwwPathsOf(p) {
      const [q, mirror] = mirrorRoot(strip(p));
      const hit = wwwOf.get(q) || wwwOf.get(sanitizePath(q));
      const out = hit ? [...hit] : [q];
      return mirror ? out.map((x) => x.replace(/^\/[a-z]{2}\/[a-z]{2}/, `/${mirror}`)) : out;
    },
    wwwPathOf(p) { return api.wwwPathsOf(p)[0]; },
    groupOf(p) {
      const [q] = mirrorRoot(strip(p));
      const hit = find(q);
      return hit ? hit.g : null;
    },
    /** every translated-slug alias [root, www slug, canonical slug, group]; sanitized-only forms are left out unless `all`. */
    entries({ all = false } = {}) {
      const out = [];
      map.groups.forEach((g) => (g.aliases || []).forEach((a) => {
        if (a.sanitizedOnly && !all) return;
        rs[a.roots].forEach((root) => out.push([root, a.slug, g.canonical, g]));
      }));
      return out;
    },
  };
  return api;
}

/**
 * Invariants of a map file. Returns a list of problems (empty: fine).
 *  - every root of a group appears once per (root, slug), no path in two groups, the rootsets are sorted and unique
 *  - both directions: every www path maps to one canonical path and back to a www path that maps there again
 *  - no collision: no canonical path in a root is another group's www path or canonical path there
 *  - every canonical path is an EDS name; aliases differ from the canonical slug
 *  - all active flags are booleans; exceptions have a known kind
 */
export function validateMap(map, { expectAllOff = false } = {}) {
  const problems = [];
  const rs = map.rootsets;
  rs.forEach((set, i) => {
    if (JSON.stringify(set) !== JSON.stringify([...set].sort())) problems.push(`rootset ${i} not sorted`);
    set.forEach((r) => { if (!ROOT_RE.test(r)) problems.push(`rootset ${i}: bad root ${r}`); });
  });
  const seenSets = new Set(rs.map((s) => JSON.stringify(s)));
  if (seenSets.size !== rs.length) problems.push('duplicate rootsets');
  const seenWww = new Map();
  const seenSan = new Map();
  const canonRoot = new Map();
  const ids = new Set();
  map.groups.forEach((g) => {
    if (ids.has(g.id)) problems.push(`duplicate group id ${g.id}`);
    ids.add(g.id);
    if (sanitizePath(g.canonical) !== g.canonical) problems.push(`canonical not an EDS name: ${g.canonical}`);
    const all = [{ slug: g.canonical, roots: g.roots }, ...(g.aliases || [])];
    all.forEach((a, n) => {
      if (n > 0 && a.slug === g.canonical) problems.push(`alias equals canonical: ${g.canonical}`);
      if (n > 0 && !!a.sanitizedOnly !== (sanitizePath(a.slug) === g.canonical)) problems.push(`sanitizedOnly wrong on ${a.slug} of ${g.canonical}`);
      if (typeof a.roots !== 'number' || !rs[a.roots]) problems.push(`group ${g.id}: bad rootset ${a.roots}`);
      (rs[a.roots] || []).forEach((root) => {
        const k = joinPath(root, a.slug);
        if (seenWww.has(k)) problems.push(`www path in two places: ${k} (${seenWww.get(k)}, ${g.id})`);
        seenWww.set(k, g.id);
        const sk = sanitizePath(k);
        if (seenSan.has(sk) && seenSan.get(sk) !== g.id) problems.push(`collision: ${k} and another group's path share the EDS name ${sk} (${seenSan.get(sk)}, ${g.id})`);
        seenSan.set(sk, g.id);
      });
    });
    new Set(all.flatMap((a) => rs[a.roots] || [])).forEach((root) => {
      const k = joinPath(root, g.canonical);
      if (canonRoot.has(k)) problems.push(`canonical path in two groups: ${k} (${canonRoot.get(k)}, ${g.id})`);
      canonRoot.set(k, g.id);
    });
  });
  // the canonical path a group gets in each of its roots must not be another group's www path there (a clash or a swap)
  map.groups.forEach((g) => {
    new Set([g.roots, ...(g.aliases || []).map((a) => a.roots)].flatMap((i) => rs[i] || [])).forEach((root) => {
      const w = seenSan.get(sanitizePath(joinPath(root, g.canonical)));
      if (w && w !== g.id) problems.push(`collision: ${joinPath(root, g.canonical)} is a www path of ${w} and the canonical path of ${g.id}`);
    });
  });
  map.exceptions.forEach((e) => { if (!EXCEPTION_KINDS.includes(e.kind)) problems.push(`unknown exception kind ${e.kind}`); });
  Object.entries(map.active).forEach(([r, v]) => { if (typeof v !== 'boolean') problems.push(`active[${r}] is not a boolean`); if (expectAllOff && v) problems.push(`active[${r}] is on`); });
  map.groups.forEach((g) => {
    if ('active' in g && typeof g.active !== 'boolean') problems.push(`group ${g.id}: active is not a boolean`);
    if (expectAllOff && g.active) problems.push(`group ${g.id}: active is on`);
  });
  // round trip, whole map: every www path maps to one canonical path, which lists it again and is a fixed point
  const api = loadMap(map);
  api.entries({ all: true }).forEach(([root, slug, canonical]) => {
    const w = joinPath(root, slug);
    const c = api.canonicalOf(w, { all: true });
    if (c !== joinPath(root, canonical)) problems.push(`forward: ${w} -> ${c}, expected ${joinPath(root, canonical)}`);
    if (!api.wwwPathsOf(c).includes(w)) problems.push(`back: ${c} does not list ${w}`);
    if (api.canonicalOf(c, { all: true }) !== c) problems.push(`canonical path ${c} is not a fixed point`);
  });
  return problems;
}

/** Stable JSON, one line per rootset, group and exception (readable diffs, small files): the same input always writes the same bytes. */
export function stringifyMap(map) {
  const line = (a) => a.map((x) => `  ${JSON.stringify(x)}`).join(',\n');
  const head = Object.entries(map).filter(([k]) => !['rootsets', 'groups', 'exceptions'].includes(k)).map(([k, v]) => ` ${JSON.stringify(k)}: ${JSON.stringify(v)}`);
  const parts = [...head];
  ['rootsets', 'groups', 'exceptions'].forEach((k) => { parts.push(` ${JSON.stringify(k)}: [${map[k].length ? `\n${line(map[k])}\n ` : ''}]`); });
  return `{\n${parts.join(',\n')}\n}\n`;
}
