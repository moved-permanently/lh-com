/* eslint-disable no-console, no-continue, no-restricted-syntax, no-await-in-loop, max-len, no-underscore-dangle, import/extensions -- tooling */
/**
 * TAP's market roots on lh-tap (Ben's option B, tools/reports/markets/plan.md: one document per
 * language page; a market root holds documents of its own only where it differs). www.flytap.com
 * authors one version per language and applies its country rules on the server
 * (pageProps.personalizations: show, hide, activate-variation; a rule names the pt master's
 * component, /content/dam/tap/master/pt/…, and holds for every language's copy by the path after
 * /master/<lang>/). Our language versions are their home markets' view.
 *
 * - marketUnits: the components of a language page (its topSections and sections) as units for
 *   tap-import.mjs's convertPage (site.units): a component behind a rule (on itself or on an item
 *   in it) with __markets, its countries as lh-com's market rules read them (scripts/market-rules.js:
 *   'br,pt' to show, '-us' to hide), a section of its own; the variants other markets show (their
 *   captures, the market roots' `rule` pages) merged in, one unit per variant, each with its
 *   countries. Countries are grouped by what the rules give them; a group that no capture shows is
 *   decided by a show/hide rule on the component itself, else it is noted (unplaced).
 * - the CLI writes the merged language documents (local only until they may be uploaded), each
 *   root's own documents (/<ll>-<cc>/index, its own pages, a rule page its language version lacks,
 *   nav and footer where they differ from the language version's), the allowlist entries for them
 *   and a run report for tools/reports/tap/markets.md.
 *
 * Usage: node tools/importer/tap-markets.mjs --archive <language pages archive> [...]
 *          --market-archive <market pages archive> [...] --media <media archive> [...]
 *          --sitemaps <sitemaps archive> [...] --pages tap-market-pages.json
 *          [--roots de-ch,fr-ca] [--name markets] [--existing <DA copies>] [--dry-run]
 *        (--existing: DA's documents saved read-only before the run, <doc>.html with DA's time,
 *        curl -R; without it the local copies)
 *        (archives unpacked, in the index's order)
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import {
  convertPage, anchorsOf, docPath, mediaIndex, mediaResolver, WWW, outOfScope, collapseTap,
} from './tap-import.mjs';
import {
  navHtml, footerHtml, logoSvg, flagSvg, flagPath,
} from './tap-nav.mjs';
import { marketAllows, sectionMarkets } from '../../scripts/market-rules.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const W = path.join(root, 'content-sites/lh-tap');
const OUT = path.join(W, 'content');

/** The language version a root's pages come from (TAP's home market of the language). */
export const LANGUAGE_VERSIONS = {
  pt: 'pt-pt', en: 'en-pt', es: 'es-es', fr: 'fr-fr', de: 'de-de', it: 'it-it', pl: 'pl-pl',
};
export const languageOf = (r) => (r === 'pt-br' ? 'pt-br' : LANGUAGE_VERSIONS[r.split('-')[0]]);
/** A root's document for a path of it: its homepage /<ll>-<cc>/index (www's /<ll>-<cc>). */
export const rootDocPath = (p) => (/^\/[a-z]{2}-[a-z]{2}$/.test(p) ? `${p}/index` : p);

/** A component's path after /master/<lang>/ (rules name the pt master's). */
export const ruleTail = (p) => String(p || '').replace(/^\/content\/dam\/tap\/master\/[^/]+\//, '');

/** The rules by the tail of each target. */
export function ruleIndex(rules) {
  const idx = new Map();
  (rules || []).forEach((r) => (r.targets || []).forEach((t) => {
    const k = ruleTail(t._path);
    if (!idx.has(k)) idx.set(k, []);
    if (!idx.get(k).includes(r)) idx.get(k).push(r);
  }));
  return idx;
}

const lc = (x) => String(x).trim().toLowerCase();
/** A rule's countries: show/hide its value, activate-variation its variations' markets. */
const variationsOf = (r) => Object.values(r.variations || {}).filter((v) => (v.markets || []).length);
const namedBy = (r) => (r.action === 'activate-variation' ? variationsOf(r).flatMap((v) => v.markets) : r.value || []).map(lc);

/** What a rule gives a country: shown or not; for activate-variation the variation's name (master without one). */
function ruleOutcome(r, c) {
  if (r.action === 'show') return (r.value || []).map(lc).includes(c) ? 'in' : 'out';
  if (r.action === 'hide') return (r.value || []).map(lc).includes(c) ? 'out' : 'in';
  if (r.action === 'activate-variation') {
    // a variation for its markets (show), or for every market but its markets (hide: "variation_x-pt")
    const vs = variationsOf(r);
    const v = vs.find((x) => x.action !== 'hide' && x.markets.map(lc).includes(c)) || vs.find((x) => x.action === 'hide' && !x.markets.map(lc).includes(c));
    return v ? v.name : 'master';
  }
  return 'in';
}

/** The tails of a component and of every item in it. */
function tailsOf(unit) {
  const out = new Set();
  const walk = (o) => {
    if (Array.isArray(o)) { o.forEach(walk); return; }
    if (!o || typeof o !== 'object') return;
    if (o._path && o.__typename) out.add(ruleTail(o._path));
    Object.values(o).forEach(walk);
  };
  walk(unit);
  return out;
}

/**
 * The variations www applies without a rule: a component's (or item's) variation market_<cc> is
 * that market's where a capture shows it served (the club table's market_us, a promotion's
 * market_pt), as activate-variation rules. A variation only listed (_variations) is not: TAP
 * serves those markets the plain master (the market-variants capture, 35 of 35 rows).
 */
function implicitRules(units) {
  const out = new Map();
  const walk = (o) => {
    if (Array.isArray(o)) { o.forEach(walk); return; }
    if (!o || typeof o !== 'object') return;
    const own = o._path && /^market_[a-z]{2}$/.test(o._variation || '') ? [o._variation] : [];
    // one rule per component, with every market's variation a capture shows (us and ao each theirs)
    if (own.length && !out.has(ruleTail(o._path))) {
      out.set(ruleTail(o._path), {
        _path: `implicit:${o._path}`, action: 'activate-variation', implicit: true, targets: [{ __typename: o.__typename, _path: o._path }], variations: {},
      });
    }
    own.forEach((v) => { out.get(ruleTail(o._path)).variations[v] = { name: v, markets: [v.slice(7)], action: 'show' }; });
    Object.values(o).forEach(walk);
  };
  walk(units);
  return [...out.values()];
}

const keyOf = (u, i) => (u._path ? ruleTail(u._path) : `${u.__typename}@${i}`);
// a component's content: its variations list left aside (TAP serves a market_<cc> root the plain
// master with no variations listed: the same component as the language version's master)
const hashOf = (u) => crypto.createHash('sha1').update(JSON.stringify(u, (k, v) => (k === '_variations' ? undefined : v))).digest('hex');
const OTHERS = '*';
const sorted = (s) => [...s].sort();

/**
 * A language page's units with the markets of those behind a rule.
 * @param {{home: string, units: object[], views: {country: string, units: object[]}[],
 *   rules: object[], countries: string[]}} o home: the language version's market; units: its
 *   components; views: the same page as other markets show it (their captures); rules: www's
 *   personalizations; countries: the markets of the roots this language version serves; groups:
 *   the market comparison's root groups for the page, each a list of countries (market-groups.json)
 * @returns {{units: object[], notes: object[]}} units (copies, __markets on those behind a rule)
 *   in the page's order; notes: drift (a difference no rule explains: the language version kept),
 *   unplaced (countries whose view no capture holds)
 */
export function marketUnits({
  home, units, views = [], rules = [], countries = [], groups = [],
}) {
  const idx = ruleIndex(rules);
  const notes = [];
  const sources = [{ country: home, units }, ...views];
  // the slots (one per component) in the page's order: a component only other markets show goes
  // before the next one the page has
  const order = units.map(keyOf);
  views.forEach((v) => {
    const keys = v.units.map(keyOf);
    keys.forEach((k, i) => {
      if (order.includes(k)) return;
      const next = keys.slice(i + 1).find((x) => order.includes(x));
      order.splice(next ? order.indexOf(next) : order.length, 0, k);
    });
  });
  const out = [];
  order.forEach((key) => {
    // what each source shows in the slot (null: nothing)
    const seen = new Map(sources.map((s) => {
      const i = s.units.map(keyOf).indexOf(key);
      return [s.country, i < 0 ? null : s.units[i]];
    }));
    const variants = [...seen.values()].filter(Boolean);
    const hit = [...new Set(variants.flatMap((u) => [...tailsOf(u)]).flatMap((t) => idx.get(t) || [])), ...implicitRules(variants)];
    if (!hit.length) {
      const own = seen.get(home);
      // the market comparison's root groups (tools/reports/market-diff/tap/market-groups.json): roots
      // www serves another variant of the page without a rule (the version page local to its home
      // market, or a group sharing a variant): a group whose capture differs here gets its unit with
      // its countries, the language version's unit every other country
      const placed = [];
      groups.forEach((g) => {
        const cs = g.map(lc);
        const from = cs.find((c) => seen.has(c));
        if (!from) {
          if (own) {
            notes.push({
              kind: 'unplaced', slot: key, countries: cs, why: `the comparison's group ${cs.join(',')}: no capture of a root of it, the language version kept`,
            });
          }
          return;
        }
        const u = seen.get(from);
        if ((u ? hashOf(u) : null) === (own ? hashOf(own) : null)) return;
        cs.filter((c) => c !== from && seen.has(c) && (seen.get(c) ? hashOf(seen.get(c)) : null) !== (u ? hashOf(u) : null)).forEach((c) => notes.push({
          kind: 'drift', slot: key, root: c, why: `differs from ${from}'s, its comparison group's: ${from}'s kept`,
        }));
        placed.push({ unit: u, countries: cs });
      });
      if (placed.length) {
        const away = sorted(new Set(placed.flatMap((p) => p.countries)));
        if (own) out.push({ ...own, __markets: away.map((c) => `-${c}`).join(',') });
        placed.filter((p) => p.unit).forEach((p) => out.push({ ...p.unit, __markets: sorted(p.countries).join(',') }));
        return;
      }
      // no rule: every market sees the language version's (a difference is TAP's edit between captures)
      views.forEach((v) => {
        const u = seen.get(v.country);
        if ((u ? hashOf(u) : null) !== (own ? hashOf(own) : null)) {
          notes.push({
            kind: 'drift', slot: key, root: v.country, why: `differs from the language version without a rule on it (${u ? 'other content' : 'missing'}): the language version's kept`,
          });
        }
      });
      if (own) out.push({ ...own });
      return;
    }
    // the countries the rules name, the roots' and the home market; OTHERS: every other country
    const universe = new Set([home, ...countries.map(lc), ...hit.flatMap(namedBy)]);
    const sig = (c) => hit.map((r) => ruleOutcome(r, c)).join('|');
    const classes = new Map();
    [...universe, OTHERS].forEach((c) => {
      const s = sig(c === OTHERS ? '\u0000' : c);
      if (!classes.has(s)) classes.set(s, []);
      classes.get(s).push(c);
    });
    const direct = hit.every((r) => r.action !== 'activate-variation' && (r.targets || []).some((t) => ruleTail(t._path) === key));
    // a group no capture shows: from a capture whose rules give it the same variations and every
    // item the group sees, without the items the group's rules hide (null: hidden); undefined
    // without such a capture
    const derive = (member) => {
      const c = member === OTHERS ? '\u0000' : member;
      for (const [from, u] of seen) {
        if (!u) continue;
        const tails = tailsOf(u);
        const fits = hit.every((r) => {
          const mine = ruleOutcome(r, c);
          if (r.action === 'activate-variation') return mine === ruleOutcome(r, from);
          return mine === 'out' || (r.targets || []).some((t) => tails.has(ruleTail(t._path)));
        });
        if (!fits) continue;
        const outs = new Set(hit.filter((r) => r.action !== 'activate-variation' && ruleOutcome(r, c) === 'out')
          .flatMap((r) => (r.targets || []).map((t) => ruleTail(t._path))));
        if (outs.has(key)) return null;
        const strip = (o) => {
          if (Array.isArray(o)) return o.filter((x) => !(x && x._path && outs.has(ruleTail(x._path)))).map(strip);
          if (!o || typeof o !== 'object') return o;
          return Object.fromEntries(Object.entries(o).map(([k, v]) => [k, strip(v)]));
        };
        return strip(u);
      }
      return undefined;
    };
    const assigned = new Map();
    const onWww = [];
    classes.forEach((members, s) => {
      const observed = members.filter((c) => seen.has(c));
      let pick;
      if (observed.length) {
        // the home market's view first, then the captures in order; a capture that disagrees with
        // its group is drift
        const first = observed.includes(home) ? home : observed[0];
        pick = seen.get(first);
        observed.filter((c) => c !== first).forEach((c) => {
          const u = seen.get(c);
          if ((u ? hashOf(u) : null) !== (pick ? hashOf(pick) : null)) {
            notes.push({
              kind: 'drift', slot: key, root: c, why: `differs from ${first}'s, which the rules give the same view: ${first}'s kept`,
            });
          }
        });
      } else if (direct) {
        // a show/hide rule on the component itself: shown (the content the shown ones have) or not
        const shown = s.split('|').every((x) => x === 'in');
        pick = shown ? [...seen.values()].find(Boolean) || null : null;
      } else if (derive(members[0]) !== undefined) {
        pick = derive(members[0]);
      } else {
        pick = null;
        const what = s.split('|').filter((x) => x !== 'in' && x !== 'out').join(', ') || s;
        const roots = members.filter((c) => c !== OTHERS && countries.map(lc).includes(c));
        roots.forEach((c) => notes.push({
          kind: 'unplaced', slot: key, root: c, why: `the rules give ${c} ${what}, which no capture shows: the page on www in its place`,
        }));
        roots.forEach((c) => onWww.push(c));
        const rest = members.filter((c) => !roots.includes(c));
        if (rest.length) {
          notes.push({
            kind: 'unplaced', slot: key, countries: rest, why: `${what} for ${rest.join(',')} (no root of ours): no capture`,
          });
        }
      }
      assigned.set(s, pick);
    });
    // a unit per variant: its countries (an exclusion list when every other country sees it)
    const byHash = new Map();
    classes.forEach((members, s) => {
      const u = assigned.get(s);
      if (!u) return;
      const h = hashOf(u);
      if (!byHash.has(h)) byHash.set(h, { unit: u, members: [] });
      byHash.get(h).members.push(...members);
    });
    const homeHash = seen.get(home) ? hashOf(seen.get(home)) : null;
    [...byHash.entries()].sort(([a], [b]) => (b === homeHash) - (a === homeHash)).forEach(([, v]) => {
      const others = v.members.includes(OTHERS);
      const mine = new Set(v.members.filter((c) => c !== OTHERS));
      let markets;
      if (others) {
        const not = sorted([...universe].filter((c) => !mine.has(c)));
        markets = not.length ? not.map((c) => `-${c}`).join(',') : null;
      } else markets = sorted(mine).join(',');
      out.push(markets ? { ...v.unit, __markets: markets } : { ...v.unit });
    });
    // the roots whose variant no capture holds: the page on www (tap-import.mjs MarketVariantOnWww)
    if (onWww.length) out.push({ __typename: 'MarketVariantOnWww', _path: (variants[0] || {})._path, __markets: sorted(new Set(onWww)).join(',') });
  });
  return { units: out, notes };
}

/**
 * The captured market pages as views of their language versions' pages: /<root>/<rest> for
 * /<language version>/<rest> where that is a page (a root's homepage and own pages are not).
 * @param {Iterable<string>} paths the market captures' paths
 * @param {Set<string>} langPages the language versions' page paths
 * @returns {Map<string, string[]>} language page → its market pages
 */
export function marketViewPaths(paths, langPages) {
  const views = new Map();
  [...paths].forEach((p) => {
    const m = p.match(/^\/([a-z]{2}-[a-z]{2})(\/.+)$/);
    if (!m) return;
    const lv = languageOf(m[1]);
    if (!lv || lv === m[1]) return;
    const lp = `/${lv}${m[2]}`;
    if (!langPages.has(lp)) return;
    if (!views.has(lp)) views.set(lp, []);
    views.get(lp).push(p);
  });
  return views;
}

/** The page's own markets (rules on the page itself, PageModel), or null. */
export function pageMarkets(page, rules) {
  const hit = ruleIndex(rules).get(ruleTail(page._path)) || [];
  if (!hit.length) return null;
  const universe = new Set(hit.flatMap(namedBy));
  const shown = (c) => hit.every((r) => ruleOutcome(r, c) !== 'out');
  const others = shown('\u0000');
  const list = sorted([...universe].filter((c) => shown(c) !== others));
  if (!list.length) return null;
  return others ? list.map((c) => `-${c}`).join(',') : list.join(',');
}

/** A document with a Markets row in its metadata block. */
export function withPageMarkets(html, markets) {
  const at = html.indexOf('<div class="metadata">');
  if (at < 0 || !markets) return html;
  const re = /<div\b[^>]*>|<\/div>/g;
  re.lastIndex = at;
  let depth = 0;
  let m = re.exec(html);
  while (m) {
    depth += m[0] === '</div>' ? -1 : 1;
    if (depth === 0) break;
    m = re.exec(html);
  }
  const end = m.index;
  return `${html.slice(0, end)}<div><div>Markets</div><div>${markets}</div></div>${html.slice(end)}`;
}

/**
 * A page over the limits (fragment documents) whose variants each made their own: a fragment
 * document per distinct content (the first keeps its name, another gets -<hash>), the page's
 * fragment blocks (in the same order as the fragments) pointing to them.
 */
export function variantFragments(html, fragments) {
  const byDoc = new Map();
  const docs = fragments.map((f) => {
    const seen = byDoc.get(f.doc) || new Map();
    byDoc.set(f.doc, seen);
    if (!seen.size) seen.set(f.html, f.doc);
    if (!seen.has(f.html)) seen.set(f.html, `${f.doc}-${crypto.createHash('sha1').update(f.html).digest('hex').slice(0, 6)}`);
    return { doc: seen.get(f.html), html: f.html };
  });
  // each link resolved by its fragment's name, in order among the fragments of that name; a link repeated (market
  // sections with the same content share one fragment, marketFragments) keeps the name its fragment got. By position
  // alone the links after such a repeat pointed at other fragments (en-pt partners: ao's "Rent a Car" tab linked a
  // Hotels fragment; standing order 10)
  const queues = new Map();
  fragments.forEach((f, k) => {
    if (!queues.has(f.doc)) queues.set(f.doc, []);
    queues.get(f.doc).push(docs[k].doc);
  });
  const lastOf = new Map();
  const out = html.replace(/<div class="fragment"><div><div><a href="([^"]+)">[^<]*<\/a><\/div><\/div><\/div>/g, (m, d) => {
    const q = queues.get(d);
    const to = q && q.length ? q.shift() : (lastOf.get(d) || d);
    lastOf.set(d, to);
    return to !== d ? m.split(d).join(to) : m;
  });
  const uniq = [...new Map(docs.map((f) => [f.doc, f])).values()];
  return { html: out, fragments: uniq };
}

/** The top-level sections of a document's HTML (its <div>s). */
function topSections(html) {
  const out = [];
  const re = /<div\b[^>]*>|<\/div>/g;
  let depth = 0;
  let start = 0;
  let m = re.exec(html);
  while (m) {
    if (m[0] === '</div>') {
      depth -= 1;
      if (depth === 0) out.push(html.slice(start, re.lastIndex));
    } else {
      if (depth === 0) start = m.index;
      depth += 1;
    }
    m = re.exec(html);
  }
  return out;
}

/** A section's section-metadata block and the section's content without it. */
function splitSectionMetadata(section) {
  const inner = section.replace(/^<div>/, '').replace(/<\/div>$/, '');
  const at = inner.indexOf('<div class="section-metadata">');
  if (at < 0) return { body: inner, meta: '' };
  const end = at + topSections(inner.slice(at))[0].length;
  return { body: inner.slice(0, at) + inner.slice(end), meta: inner.slice(at, end) };
}

/**
 * A page over the content bus's limits: the sections its home market never sees (other markets'
 * variants) as fragment documents (<base>/market-<hash>), each section a fragment block with its
 * Markets kept; the home market's view stays inline as the plain document has it (a loaded
 * fragment gets the page's breadcrumb again: scripts.js builds it in fragments too).
 * @param {string} html the document
 * @param {{home: string, base: string}} o home: the language version's market; base: the
 *   fragments' folder (/<language>/fragments/<page>)
 * @returns {{html: string, fragments: {doc: string, html: string}[]}}
 */
export function marketFragments(html, { home, base }) {
  const fragments = [];
  const out = topSections(html).map((sec) => {
    const m = sectionMarkets(sec);
    if (m === null || marketAllows(m, home)) return sec;
    const { body, meta } = splitSectionMetadata(sec);
    const frag = `<div>${body}</div>\n`;
    const doc = `${base}/market-${crypto.createHash('sha1').update(frag).digest('hex').slice(0, 6)}`;
    if (!fragments.some((x) => x.doc === doc)) fragments.push({ doc, html: frag });
    return `<div><div class="fragment"><div><div><a href="${doc}">${doc}</a></div></div></div>${meta}</div>`;
  });
  return { html: `${out.join('\n')}\n`, fragments };
}

const marketItems = (m) => String(m || '').toLowerCase().split(/[\s,;]+/).filter(Boolean);
const isInclude = (m) => m !== null && marketItems(m).length > 0 && !marketItems(m).some((i) => i.startsWith('-'));
const sectionText = (sec) => splitSectionMetadata(sec).body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const firstBlock = (sec) => (sec.match(/<div class="([^"]+)"/) || [])[1] || '';
const withMarkets = (sec, v) => sec.replace(/(<div><div>(?:<p>)?\s*Markets\s*(?:<\/p>)?<\/div><div>(?:<p>)?)([^<]*)/i, `$1${v}`);

/**
 * A language document merged again keeps what the existing copy (a local or DA document from an
 * earlier import) gives the countries no root of the language covers: their views are in no
 * capture of this merge (fr-fr promos: es, br, us and pt; brief 468). A section whose Markets list
 * such a country stays for it: added to the merged section with the same text, else the section
 * on its own for those countries, after its predecessor's counterpart. An existing exclusion of
 * such a country goes to the merged section that replaces that section (the same text, else the
 * same block at the same rank among the exclusion sections). The covered countries as merged.
 * @param {string} html the merged document
 * @param {string} existing the existing document's HTML ('' without one)
 * @param {string[]} covered the home market and the countries of the language's roots
 * @returns {{html: string, kept: {countries: string[], how: string, text: string}[]}}
 */
export function keepUncovered(html, existing, covered) {
  const kept = [];
  if (!existing) return { html, kept };
  const ex = topSections(existing);
  const out = topSections(html);
  // a country that sees the same text in the same order in the merge sees only sections cut
  // elsewhere (row 134's category tabs, a heading's section, TAP rows 139 and 149): as covered
  const named = new Set(ex.flatMap((s) => marketItems(sectionMarkets(s) || '').map((x) => x.replace(/^-/, ''))));
  const cov = new Set([...covered.map(lc), ...[...named].filter((c) => viewText(out, c) === viewText(ex, c))]);
  const pos = (i) => {
    // the merged section standing for the existing one: the same text, else (an exclusion or
    // unmarked section) the same block at the same rank among its kind
    const t = sectionText(ex[i]);
    const same = out.findIndex((o) => sectionText(o) === t);
    if (same >= 0) return same;
    const m = sectionMarkets(ex[i]);
    if (isInclude(m)) return -1;
    const kind = (x) => {
      const v = sectionMarkets(x);
      return `${firstBlock(x)}|${v === null ? 'all' : (!isInclude(v) && 'not') || 'only'}`;
    };
    const k = kind(ex[i]);
    const rank = ex.slice(0, i).filter((x) => kind(x) === k).length;
    const like = out.map((o, j) => [o, j]).filter(([o]) => kind(o) === k);
    return like[rank] ? like[rank][1] : -1;
  };
  ex.forEach((sec, i) => {
    const m = sectionMarkets(sec);
    if (!isInclude(m)) return;
    const mine = marketItems(m).filter((c) => !cov.has(c));
    if (!mine.length) return;
    const j = out.findIndex((o) => sectionText(o) === sectionText(sec));
    if (j >= 0) {
      const om = sectionMarkets(out[j]);
      if (om === null) return;
      // the countries the merged section does not give them yet
      const add = isInclude(om) ? mine.filter((c) => !marketItems(om).includes(c)) : mine.filter((c) => marketItems(om).includes(`-${c}`));
      if (!add.length) return;
      const rest = marketItems(om).filter((x) => !add.includes(x.slice(1)));
      if (!isInclude(om) && !rest.length) return;
      out[j] = withMarkets(out[j], isInclude(om) ? sorted(new Set([...marketItems(om), ...add])).join(',') : rest.join(','));
      kept.push({ countries: add, how: 'added', text: sectionText(sec).slice(0, 80) });
      return;
    }
    let at = -1;
    for (let k = i - 1; k >= 0 && at < 0; k -= 1) at = pos(k);
    out.splice(at + 1, 0, withMarkets(sec, mine.join(',')));
    kept.push({ countries: mine, how: 'section', text: sectionText(sec).slice(0, 80) });
  });
  ex.forEach((sec, i) => {
    const m = sectionMarkets(sec);
    if (m === null || isInclude(m)) return;
    const not = marketItems(m).filter((x) => x.startsWith('-')).map((x) => x.slice(1)).filter((c) => !cov.has(c));
    const j = not.length ? pos(i) : -1;
    if (j < 0) return;
    const om = sectionMarkets(out[j]);
    if (om === null || isInclude(om)) return;
    const add = not.filter((c) => !marketItems(om).includes(`-${c}`));
    if (!add.length) return;
    out[j] = withMarkets(out[j], sorted(new Set([...marketItems(om), ...add.map((c) => `-${c}`)])).join(','));
    kept.push({ countries: add, how: 'excluded', text: sectionText(sec).slice(0, 80) });
  });
  if (!kept.length) return { html, kept };
  return { html: `${out.join('\n')}\n`, kept };
}

// the page's metadata block of a section (the document's last section holds it), '' without one
const metadataOf = (sec) => {
  const at = sec.indexOf('<div class="metadata">');
  return at < 0 ? '' : topSections(sec.slice(at))[0];
};
// a section's own text: without its section metadata and the page's metadata
const ownText = (sec) => {
  const md = metadataOf(sec);
  return sectionText(md ? sec.replace(md, '') : sec);
};
const sees = (sec, c) => {
  const m = sectionMarkets(sec);
  return m === null || marketAllows(m, c);
};
// the text a country sees in a document's sections, in order, wherever the sections are cut; a
// no-break space as written in DA's copies (&#160;) or as the importer writes it (the character)
const viewText = (secs, c) => secs.filter((s) => sees(s, c)).map(ownText).filter(Boolean).join(' ')
  .replace(/&(#160|#xa0|nbsp);|\u00a0/gi, ' ').replace(/\s+/g, ' ').trim();
// a section that shows (want) or does not show a country; null: it shows no one any more
function showFor(sec, c, want) {
  const m = sectionMarkets(sec);
  const items = m === null ? [] : marketItems(m);
  const inc = items.filter((i) => !i.startsWith('-'));
  let exc = items.filter((i) => i.startsWith('-'));
  let list;
  if (want) {
    exc = exc.filter((i) => i !== `-${c}`);
    list = inc.length && !inc.includes(c) ? [...inc, c] : inc;
  } else if (inc.length) {
    list = inc.filter((i) => i !== c);
    if (!list.length) return null;
  } else {
    list = inc;
    exc = [...exc, `-${c}`];
  }
  const value = [...sorted(new Set(list)), ...sorted(new Set(exc))].join(',');
  if (value === (m || '')) return sec;
  if (m !== null) return withMarkets(sec, value);
  // an unmarked section: a Markets row into its section metadata, else a section metadata block
  const at = sec.indexOf('<div class="section-metadata">');
  const row = `<div><div>Markets</div><div>${value}</div></div>`;
  if (at >= 0) return sec.replace('<div class="section-metadata">', `<div class="section-metadata">${row}`);
  const md = metadataOf(sec);
  const block = `<div class="section-metadata">${row}</div>`;
  return md ? sec.replace(md, `${block}${md}`) : sec.replace(/<\/div>$/, `${block}</div>`);
}

/**
 * A language document merged again shows the countries in `stale` what the existing copy (DA's)
 * showed them: countries the run's captures do not hold a view of (unplaced) or hold one older
 * than the existing copy (TAP's held documents of 2026-11-11: DA's US and Canada sections came
 * from the market comparison's fetch of 2026-11-07, the drop's en-us / en-ca captures are of
 * 2026-11-04). A merged section shows such a country exactly when the existing copy showed it a
 * section with the same text; an existing section it saw that the merge lacks comes back for it
 * (the countries that saw it as its Markets), after its predecessor's counterpart. The page's
 * metadata stays in the last section. keepUncovered's countries (no root) are not this one's.
 * @param {string} html the merged document
 * @param {string} existing the existing document's HTML ('' without one)
 * @param {string[]} stale the countries whose view the existing copy keeps
 * @param {string[]} [audience] the countries the document is served to (the home market, the
 *   roots'): a merged section this step hid from all of them goes (it would show no one)
 * @returns {{html: string, kept: {countries: string[], how: string, text: string}[]}}
 */
export function keepStale(html, existing, stale, audience = null) {
  const kept = [];
  if (!existing || !(stale || []).length) return { html, kept };
  const ex = topSections(existing).filter((s) => ownText(s));
  let out = topSections(html);
  // a stale country that sees the same text in the same order sees only sections cut elsewhere (a
  // heading's section ended after its description, TAP rows 139 and 149): the merge stands for it
  const xs = sorted(new Set(stale.map(lc))).filter((c) => viewText(out, c) !== viewText(ex, c));
  if (!xs.length) return { html, kept };
  // the page's metadata apart (back as the last section's at the end)
  const mdAt = out.findIndex((s) => metadataOf(s));
  const md = mdAt >= 0 ? metadataOf(out[mdAt]) : '';
  if (md) {
    out[mdAt] = out[mdAt].replace(md, '');
    if (out[mdAt] === '<div></div>') out.splice(mdAt, 1);
  }
  const seenBefore = new Map(xs.map((c) => [c, new Set(ex.filter((s) => sees(s, c)).map(ownText))]));
  const note = (countries, how, sec) => {
    if (countries.length) kept.push({ countries, how, text: ownText(sec).slice(0, 80) });
  };
  // 1. the merged sections: shown to a stale country exactly when it saw the same text before
  out = out.flatMap((sec) => {
    const t = ownText(sec);
    if (!t) return [sec];
    let s = sec;
    const shown = [];
    const hidden = [];
    xs.forEach((c) => {
      if (s === null) return;
      const want = seenBefore.get(c).has(t);
      if (sees(s, c) === want) return;
      s = showFor(s, c, want);
      (want ? shown : hidden).push(c);
    });
    note(shown, 'shown', sec);
    note(hidden, 'hidden', sec);
    if (s !== null && hidden.length && audience && !audience.map(lc).some((c) => sees(s, c))) s = null;
    return s === null ? [] : [s];
  });
  // 2. the existing sections a stale country saw that no merged section shows it now
  ex.forEach((sec, i) => {
    const t = ownText(sec);
    const missing = xs.filter((c) => sees(sec, c) && !out.some((o) => ownText(o) === t && sees(o, c)));
    if (!missing.length) return;
    const same = out.findIndex((o) => ownText(o) === t);
    if (same >= 0) {
      missing.forEach((c) => { out[same] = showFor(out[same], c, true); });
      note(missing, 'shown', sec);
      return;
    }
    let at = -1;
    for (let k = i - 1; k >= 0 && at < 0; k -= 1) {
      const tk = ownText(ex[k]);
      for (let j = out.length - 1; j >= 0 && at < 0; j -= 1) if (ownText(out[j]) === tk) at = j;
    }
    const value = sorted(missing).join(',');
    const m = sectionMarkets(sec);
    let add = m !== null ? withMarkets(sec, value) : showFor(sec, missing[0], false);
    if (m === null) add = withMarkets(add, value);
    out.splice(at + 1, 0, add);
    note(missing, 'section', sec);
  });
  if (!kept.length) return { html, kept };
  if (md) {
    // the metadata in an unmarked last section (never a market's, tap-import.mjs)
    const last = out[out.length - 1];
    if (last && sectionMarkets(last) === null) out[out.length - 1] = last.replace(/<\/div>$/, `${md}</div>`);
    else out.push(`<div>${md}</div>`);
  }
  return { html: `${out.join('\n')}\n`, kept };
}

/**
 * The existing copy's sections a merge keeps: keepUncovered (the countries no root covers), then
 * keepStale (those whose captures are older than the copy), both on the merge as written (collapsed,
 * as DA's copies are: a {blank} line the collapse takes out is no text of the page; collapseTap is
 * idempotent and the write collapses again).
 * @param {string} html the merged document
 * @param {string} existing the existing document's HTML ('' without one)
 * @param {{doc: string, covered: string[], stale: string[]}} o
 * @returns {{html: string, kept: object[], keptStale: object[]}}
 */
export function keepExisting(html, existing, { doc, covered, stale }) {
  const written = existing ? collapseTap(html, doc) : html;
  const keep = keepUncovered(written, existing, covered);
  const kept2 = keepStale(keep.html, existing, stale, covered);
  return { html: kept2.html, kept: keep.kept, keptStale: kept2.kept };
}

/**
 * The countries keepStale gives the existing copy's view: every root country (and every country
 * a view or group names) that no capture newer than the existing copy covers. A capture covers
 * its root's country and, for the comparison's group whose first captured member it is
 * (marketUnits takes that member's view for the group), the group's countries. Rule-derived and
 * unplaced views of uncaptured roots are no newer than the captures they come from, so the
 * existing copy's stay. Never the home market (the language page is the document's own).
 * @param {{home: string, roots?: string[], views: {country: string, at?: string}[],
 *   groups?: string[][], notes?: object[], at?: string|null}} o roots: the countries of the
 *   language's roots with the page; at: the existing copy's time (null: every capture is newer)
 * @returns {string[]}
 */
export function staleCountries({
  home, roots = [], views = [], groups = [], notes = [], at = null,
}) {
  const h = lc(home);
  const when = new Map(views.map((v) => [lc(v.country), v.at || '']));
  const fresh = (c) => c === h || (when.has(c) && (!at || String(when.get(c)) >= String(at)));
  // a country's view: its group's first captured member's, else its own capture's
  const by = new Map();
  groups.forEach((g) => {
    const cs = g.map(lc);
    const from = cs.find((c) => c === h || when.has(c));
    if (from) cs.forEach((c) => { if (!by.has(c)) by.set(c, from); });
  });
  const unplaced = notes.filter((n) => n.kind === 'unplaced').flatMap((n) => (n.root ? [n.root] : n.countries || []));
  const all = new Set([...roots, ...when.keys(), ...by.keys(), ...unplaced].map(lc));
  return sorted([...all].filter((c) => c !== h && c !== OTHERS && !fresh(by.get(c) || c)));
}

/** A root's document with its links as its language version's (/en-us → /en-pt, www's en_us → en_pt). */
export function rootLinks(html, r, lv) {
  const u = (x) => x.replace('-', '_');
  return html.replace(new RegExp(`/${r}(?=[/"#?]|$)`, 'g'), `/${lv}`).replace(new RegExp(`/${u(r)}(?=[/"#?]|$)`, 'g'), `/${u(lv)}`);
}

/* ------------------------------------------------------------------ CLI ---------------- */

/** What a root's nav or footer has that its language version's lacks, and the other way (links and texts). */
function differences(mine, theirs) {
  const parts = (h) => h.split(/(?=<li>|<h3>|<div>)/).map((x) => x.replace(/<\/(li|ul|div)>/g, '').trim()).filter(Boolean);
  const a = parts(mine);
  const b = parts(theirs);
  const label = (x) => {
    const href = (x.match(/href="([^"]+)"/) || [])[1];
    return `${x.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60)}${href ? ` (${href.slice(0, 80)})` : ''}`;
  };
  return { only: a.filter((x) => !b.includes(x)).map(label), lacks: b.filter((x) => !a.includes(x)).map(label) };
}

const NEXT_DATA = /<script id="__NEXT_DATA__" type="application\/json"[^>]*>([\s\S]*?)<\/script>/;
const readJson = (f, d) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : d);
const writeJson = (f, v) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, `${JSON.stringify(v, null, 1)}\n`); };

/** The market comparison's decisions (tools/reports/market-diff/tap/market-groups.json, tools/markets/tap-market-groups.mjs). */
export const MARKET_GROUPS = path.join(root, 'tools/reports/market-diff/tap/market-groups.json');

/**
 * The comparison's decisions for a run: the root groups per language page (lists of countries) and
 * the market pages list with the comparison's own documents added to each root's own (www URLs).
 * @param {object} list tap-market-pages.json's roots
 * @param {{pages?: object, own?: object}} groups market-groups.json
 * @returns {{groupsOf: (doc: string) => string[][], list: object}}
 */
export function withComparison(list, groups = {}) {
  const pages = groups.pages || {};
  const ownAdd = groups.own || {};
  const merged = Object.fromEntries(Object.entries(list).map(([r, v]) => [r, { ...v, own: [...new Set([...(v.own || []), ...(ownAdd[r] || [])])] }]));
  return { groupsOf: (doc) => (pages[doc] || []).map((g) => g.countries), list: merged };
}

/** The pages of unpacked page archives: path → {url, file, at} (a later archive's copy wins). */
function pagesOf(dirs) {
  const pages = new Map();
  dirs.forEach((dir) => readJson(path.join(dir, 'manifest.json'), []).forEach((e) => {
    if (e.status && e.status !== 'ok') return;
    const f = path.join(dir, (e.file || '').replace(/^snapshots\//, ''));
    if (fs.existsSync(f) && path.resolve(f).startsWith(path.resolve(dir) + path.sep)) pages.set(docPath(e.url), { url: e.url, file: f, at: e.at });
  }));
  return pages;
}
const ndOf = (p) => {
  if (!p.nd) { const m = fs.readFileSync(p.file, 'utf8').match(NEXT_DATA); p.nd = m ? JSON.parse(m[1]) : null; }
  return p.nd;
};
const unitsOf = (nd) => { const page = nd.props.pageProps.page || {}; return [...(page.topSections || []), ...(page.sections || [])]; };

/**
 * The pages links stay on the site for: the allowlist's and the captured language pages, but
 * www's forms (sign-up, complaint, Miles&Go information, suggestion: no document, their links to
 * www as the language import's; the roots' navs too, their scope this one's).
 */
export function languageScope(paths, pages, templateOf) {
  return new Set([...paths, ...[...pages.keys()].filter((d) => !outOfScope(templateOf(pages.get(d))))]);
}

/** The paths of a root's sitemap (www.flytap.com/<root>/sitemap.xml in the sitemaps archives). */
function sitemapOf(dirs, r) {
  const f = dirs.map((d) => path.join(d, 'www.flytap.com', r, 'sitemap.xml')).find((x) => fs.existsSync(x));
  if (!f) return null;
  return [...fs.readFileSync(f, 'utf8').matchAll(/<loc>\s*https:\/\/www\.flytap\.com([^<\s]*)\s*<\/loc>/g)].map((m) => docPath(decodeURIComponent(m[1])));
}

async function main() {
  const argv = process.argv.slice(2);
  const all = (n) => argv.flatMap((a, i) => (a === `--${n}` ? [path.resolve(argv[i + 1])] : []));
  const opt = (n) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : null);
  const dry = argv.includes('--dry-run');
  // DA's documents as saved before the run (read only: <dir>/<doc>.html as DA's source API gives
  // it, or <dir>/<doc>.plain.html; the file's time is the copy's, curl -R keeps DA's
  // Last-Modified), for a checkout without the local copies
  const existingDir = opt('existing') ? path.resolve(opt('existing')) : null;
  const existingOf = (doc, localFile) => {
    const files = existingDir ? [`${doc}.html`, `${doc}.plain.html`].map((f) => path.join(existingDir, f)) : [];
    const f = [...files, localFile].find((x) => fs.existsSync(x));
    if (!f) return { html: '', at: null };
    const raw = fs.readFileSync(f, 'utf8');
    const inner = raw.match(/<main>([\s\S]*)<\/main>/);
    return { html: inner ? inner[1].trim() : raw, at: fs.statSync(f).mtime.toISOString(), file: f };
  };
  const name = opt('name') || 'markets';
  const pagesList = readJson(path.resolve(opt('pages') || ''), null);
  // the market comparison's root groups and own documents (market-groups.json)
  const comparison = withComparison(pagesList || {}, readJson(MARKET_GROUPS, {}));
  const list = pagesList && comparison.list;
  if (!all('archive').length || !all('market-archive').length || !list) {
    console.log('usage: --archive <dir> ... --market-archive <dir> ... --media <dir> ... --sitemaps <dir> ... --pages tap-market-pages.json [--roots a,b] [--existing <dir>] [--dry-run]');
    process.exit(1);
  }
  const only = opt('roots') ? opt('roots').split(',') : null;
  const roots = Object.keys(list).filter((r) => !only || only.includes(r));
  const langPages = pagesOf(all('archive'));
  const marketPages = pagesOf(all('market-archive'));
  const sitemaps = all('sitemaps');
  // www's rules: the newest capture's list (the market pages were captured last)
  const newest = [...marketPages.values()].sort((a, b) => String(b.at).localeCompare(String(a.at)))[0];
  const rules = ndOf(newest).props.pageProps.personalizations || [];
  const allowFile = path.join(root, 'tools/importer/sites/lh-tap.json');
  const allow = readJson(allowFile, { paths: [] });
  const langDocs = new Set(allow.paths);
  // the call-back cards as captured (CoreMedia type → language → card, parity 66)
  const clickToCall = readJson(path.join(root, 'tools/importer/tap-click-to-call.json'), {}).cards || {};
  const media = mediaResolver(mediaIndex(all('media')), { out: OUT, dry });
  const anchors = new Map([...langPages].filter(([, p]) => ndOf(p)).map(([d, p]) => [d, anchorsOf(ndOf(p))]));
  const report = {
    at: new Date().toISOString(), rules: rules.length, rulesFrom: newest.url, languages: {}, roots: {},
  };
  const written = [];
  // the language pages' fragment documents (market sections, categories): into the allowlist too
  const langFragments = [];
  const write = (doc, raw) => {
    if (dry) return;
    // the collapse, the last step (tap-import.mjs collapseTap)
    const html = collapseTap(raw, doc);
    const f = path.join(OUT, `${doc}.plain.html`);
    fs.mkdirSync(path.dirname(f), { recursive: true });
    if (fs.existsSync(f) && fs.readFileSync(f, 'utf8') === html) return;
    fs.writeFileSync(f, html);
    written.push(doc);
  };
  // every root: its language version, country, sitemap
  const allRoots = Object.keys(list);
  const info = Object.fromEntries(allRoots.map((r) => [r, { lv: languageOf(r), country: r.split('-')[1], paths: sitemapOf(sitemaps, r) || [] }]));

  /* 1 and 2: the language pages with rules, their other markets' variants merged in (local only) */
  // every captured market page is a view of its language page (the roots' rule pages and the
  // market variants' captures: a page per variant, from a root that gets it)
  const views = new Map([...marketViewPaths(marketPages.keys(), new Set(langPages.keys()))].map(([lp, ps]) => [lp, ps
    .filter((p) => info[p.split('/')[1]])
    .map((p) => ({ root: p.split('/')[1], country: info[p.split('/')[1]].country, page: marketPages.get(p) }))]));
  const lvs = [...new Set([...Object.values(LANGUAGE_VERSIONS), 'pt-br'])];
  const templateOf = (p) => { const nd = ndOf(p); return nd && ((nd.props.pageProps || {}).page || {}).template; };
  const scopeLang = languageScope(langDocs, langPages, templateOf);
  for (const [doc, p] of langPages) {
    const lv = doc.split('/')[1];
    if (!lvs.includes(lv) || doc === `/${lv}` || !ndOf(p)) continue;
    const nd = ndOf(p);
    const page = nd.props.pageProps.page || {};
    const home = lv === 'pt-br' ? 'br' : lv.split('-')[1];
    const vs = (views.get(doc) || []).filter((v) => v.page && ndOf(v.page)).map((v) => ({
      country: v.country, root: v.root, at: v.page.at, units: unitsOf(ndOf(v.page)),
    }));
    // the markets of the roots that have the page (their sitemaps) and that the page's rules allow
    const pm = pageMarkets(page, rules);
    const rest = doc.slice(lv.length + 1);
    const countries = allRoots.filter((r) => info[r].lv === lv && info[r].paths.includes(`/${r}${rest}`)).map((r) => info[r].country)
      .filter((c) => !pm || marketAllows(pm, c));
    const merged = marketUnits({
      home, units: unitsOf(nd), views: vs, rules, countries, groups: comparison.groupsOf(doc),
    });
    const marked = merged.units.filter((u) => u.__markets);
    const plain = !marked.length && !pm && !merged.notes.length;
    // a page with no market section now whose local copy still has some (an earlier run's): the
    // plain conversion again, so no stale section stays (it is the language import's document)
    const localFile = path.join(OUT, `${doc}.plain.html`);
    const stale = plain && fs.existsSync(localFile) && fs.readFileSync(localFile, 'utf8').includes('<div>Markets</div>');
    if (plain && !stale) continue;
    const site = {
      url: p.url, scope: scopeLang, media, anchors, sourceImages: false, clickToCall, phonePictures: true, units: plain ? undefined : () => merged.units,
    };
    let r = convertPage(nd, site);
    if (r.skipped) continue;
    const over = (h) => Buffer.byteLength(h) > 900 * 1024 || (h.match(/<img /g) || []).length > 190;
    if (over(r.html)) {
      // other markets' sections into fragments first (the home view stays as the plain document),
      // else the importer's fragments of the page's categories
      const mf = marketFragments(r.html, { home, base: `/${lv}/fragments/${doc.split('/').pop()}` });
      if (mf.fragments.length && !over(mf.html) && !mf.fragments.some((x) => over(x.html))) r = { ...r, html: mf.html, fragments: mf.fragments };
      else r = convertPage(nd, { ...site, fragments: true });
    }
    // the variants' fragment documents apart
    const vf = variantFragments(r.html, r.fragments);
    let html = withPageMarkets(vf.html, pm);
    if (plain) {
      (report.plainAgain ||= []).push(doc);
      write(doc, html);
      vf.fragments.forEach((x) => { write(x.doc, x.html); langFragments.push(x.doc); });
      continue;
    }
    // the existing copy: DA's as saved (--existing), else the local copy (brief 468)
    const prior = existingOf(doc, localFile);
    // the countries no root of the language covers keep the existing copy's sections (brief 468)
    const covered = [home, ...countries, ...vs.map((v) => v.country)];
    // the countries whose view no capture holds (unplaced) or only one older than the existing
    // copy keep the existing copy's view (the held TAP documents of 2026-11-11)
    const older = staleCountries({
      home, roots: countries, views: vs, groups: comparison.groupsOf(doc), notes: merged.notes, at: prior.at,
    }).filter((c) => covered.map(lc).includes(c));
    const keep = keepExisting(html, prior.html, { doc, covered, stale: older });
    html = keep.html;
    (report.languages[lv] ||= {})[doc] = {
      sections: marked.map((u) => ({ component: keyOf(u), variation: u._variation, markets: u.__markets })),
      ...(keep.kept.length ? { kept: keep.kept } : {}),
      ...(keep.keptStale.length ? { keptStale: keep.keptStale, stale: older, existingAt: prior.at } : {}),
      pageMarkets: pm,
      merged: vs.map((v) => v.root),
      notes: merged.notes,
      fragments: vf.fragments.map((f) => f.doc),
      ...(over(html) ? { overLimits: true } : {}),
      blocks: r.report.blocks,
      missing: r.report.missing.length,
    };
    write(doc, html);
    vf.fragments.forEach((f) => { write(f.doc, f.html); langFragments.push(f.doc); });
  }

  /* 3: each root's own documents */
  // the roots' paths our worker answers: a root's sitemap paths whose language page is a document,
  // its own documents and every root's homepage
  const ownOf = (r) => [...list[r].own.map(docPath), ...list[r].rule.map(docPath).filter((p) => !langPages.has(p.replace(/^\/[a-z]{2}-[a-z]{2}/, `/${info[r].lv}`)))];
  const rootScope = new Set(scopeLang);
  allRoots.forEach((r) => {
    rootScope.add(`/${r}`);
    info[r].paths.forEach((p) => { if (scopeLang.has(p.replace(/^\/[a-z]{2}-[a-z]{2}/, `/${info[r].lv}`))) rootScope.add(p); });
    ownOf(r).forEach((p) => rootScope.add(p));
  });
  // the homepages' booking box: the language version's labels and airport sheet (a root has no
  // sheet of its own yet: tap-airports.mjs makes them per root)
  const bookingLabels = readJson(path.join(root, 'tools/reports/tap/booking-labels.json'), {});
  const sheetNames = {};
  const namesOf = async (lv) => {
    if (sheetNames[lv]) return sheetNames[lv];
    const cache = path.join(W, 'runs', `airports-${lv}.json`);
    let names = readJson(cache, null);
    if (!names) {
      const res = await fetch(`https://main--lh-tap--moved-permanently.aem.page/${lv}/booking/airports.json?limit=5000`);
      names = res.ok ? Object.fromEntries(((await res.json()).data || []).map((a) => [a.code, `${a.cityName}, ${a.countryName}`])) : {};
      if (res.ok && !dry) writeJson(cache, names);
    }
    sheetNames[lv] = names;
    return names;
  };
  const rootDocs = [];
  for (const r of roots) {
    const { lv } = info[r];
    const names = await namesOf(lv);
    const booking = { labels: bookingLabels[r] || bookingLabels[lv] || {}, originNameOf: (code) => names[code] };
    const rep = {
      language: lv, country: info[r].country, docs: [], navOwn: false, footerOwn: false, notes: [],
    };
    report.roots[r] = rep;
    const homeCap = marketPages.get(`/${r}`);
    const langHome = langPages.get(`/${lv}`);
    // nav and footer: the root's own only where they differ from the language version's
    let navDoc = `/${lv}/nav`;
    let footerDoc = `/${lv}/footer`;
    if (homeCap && langHome) {
      const html = fs.readFileSync(homeCap.file, 'utf8');
      const svg = logoSvg(html);
      const logo = `/media-da/tap/tap-logo-${crypto.createHash('sha1').update(svg || '').digest('hex').slice(0, 8)}.svg`;
      // each nav with its market's flag (www's market button: the SVG in the homepage's header)
      const flagOf = (capture, locale) => {
        const f = flagSvg(fs.readFileSync(capture.file, 'utf8'));
        return f ? { file: flagPath(locale, f), svg: f } : null;
      };
      const flags = { [r]: flagOf(homeCap, r), [lv]: flagOf(langHome, lv) };
      const mk = (pp, locale) => [navHtml(pp, {
        url: `${WWW}/${locale}`, locale, scope: rootScope, logo, media, flag: flags[locale] ? flags[locale].file : null,
      }), footerHtml(pp, {
        url: `${WWW}/${locale}`, locale, scope: rootScope, logo, media,
      })];
      const [n1, f1] = mk(ndOf(homeCap).props.pageProps, r);
      const [n0, f0] = mk(ndOf(langHome).props.pageProps, lv);
      if (flags[r] && !dry) { fs.mkdirSync(path.join(OUT, 'media-da/tap'), { recursive: true }); fs.writeFileSync(path.join(OUT, flags[r].file), flags[r].svg); }
      if (rootLinks(n1, r, lv) !== n0) { rep.navOwn = differences(rootLinks(n1, r, lv), n0); navDoc = `/${r}/nav`; write(navDoc, n1); rootDocs.push(navDoc); }
      if (rootLinks(f1, r, lv) !== f0) { rep.footerOwn = differences(rootLinks(f1, r, lv), f0); footerDoc = `/${r}/footer`; write(footerDoc, f1); rootDocs.push(footerDoc); }
      if ((rep.navOwn || rep.footerOwn) && !dry && svg) { fs.mkdirSync(path.join(OUT, 'media-da/tap'), { recursive: true }); fs.writeFileSync(path.join(OUT, logo), svg); }
    }
    const pagesToDo = [[`/${r}`, homeCap, 'homepage'], ...ownOf(r).map((p) => [p, marketPages.get(p), list[r].own.map(docPath).includes(p) ? 'own' : 'rule page its language version lacks'])];
    for (const [p, cap, kind] of pagesToDo) {
      if (!cap || !ndOf(cap)) { rep.notes.push(`${p}: no capture`); continue; }
      const res = convertPage(ndOf(cap), {
        url: cap.url, version: lv, scope: rootScope, media, anchors, sourceImages: false, booking, clickToCall, phonePictures: true,
      });
      if (res.skipped) { rep.notes.push(`${p}: ${res.skipped}`); continue; }
      const sheet = (x) => `/${x}/booking/airports.json`;
      const html = res.html.replace(`<div><div>Nav</div><div>/${r}/nav</div></div>`, `<div><div>Nav</div><div>${navDoc}</div></div>`)
        .replace(`<div><div>Footer</div><div>/${r}/footer</div></div>`, `<div><div>Footer</div><div>${footerDoc}</div></div>`)
        .split(sheet(r)).join(sheet(lv));
      const doc = rootDocPath(p);
      write(doc, html);
      rootDocs.push(doc);
      rep.docs.push({
        doc, kind, blocks: res.report.blocks, missing: res.report.missing, linkedOut: res.report.linkedOut,
      });
    }
    rep.pathsNotInLanguage = info[r].paths.filter((p) => p !== `/${r}` && !rootScope.has(p));
  }
  // what lh-edge needs to answer a root (tools/reports/tap/markets.json): its language version and
  // market, its own documents, the language pages it lacks (www answers 404 there) and its paths
  // with no document anywhere
  const pagesOfLang = (lv) => [...langDocs].filter((d) => d.startsWith(`/${lv}/`) && !/\/(nav|footer)$|\/fragments\//.test(d));
  report.worker = Object.fromEntries(allRoots.map((r) => {
    const { lv } = info[r];
    const has = new Set(info[r].paths);
    const own = [rootDocPath(`/${r}`), ...ownOf(r)];
    return [r, {
      language: lv,
      market: info[r].country,
      homepage: rootDocPath(`/${r}`),
      nav: report.roots[r] && report.roots[r].navOwn ? `/${r}/nav` : `/${lv}/nav`,
      footer: report.roots[r] && report.roots[r].footerOwn ? `/${r}/footer` : `/${lv}/footer`,
      own: own.filter((d) => d !== rootDocPath(`/${r}`)),
      sitemapPages: info[r].paths.length,
      lacks: pagesOfLang(lv).map((d) => `/${r}${d.slice(lv.length + 1)}`).filter((p) => !has.has(p)).map((p) => p.slice(r.length + 1)),
      noDocument: info[r].paths.filter((p) => p !== `/${r}` && !rootScope.has(p)).map((p) => p.slice(r.length + 1)),
    }];
  }));
  if (!dry && !only) {
    writeJson(path.join(root, 'tools/reports/tap/markets.json'), {
      about: 'TAP market roots on lh-tap (tools/importer/tap-markets.mjs, tools/reports/tap/markets.md): per root its language version, market, homepage, nav, footer, own documents, the language pages it lacks and its paths without a document',
      at: report.at,
      roots: report.worker,
    });
  }
  if (!dry) {
    writeJson(path.join(W, 'runs', `${name}-import.json`), report);
    fs.writeFileSync(path.join(W, 'runs', `${name}-paths.txt`), rootDocs.length ? `${rootDocs.join('\n')}\n` : '');
    fs.writeFileSync(path.join(W, 'runs', `${name}-written.txt`), written.length ? `${written.join('\n')}\n` : '');
    // the roots' documents and the language pages' fragments into the site's allowlist (nav and
    // footer by its pattern)
    const fresh = readJson(allowFile, allow);
    fresh.paths = [...new Set([...fresh.paths, ...langFragments, ...rootDocs.filter((d) => !/\/(nav|footer)$/.test(d))])].sort();
    writeJson(allowFile, fresh);
  }
  const langDocsN = Object.values(report.languages).reduce((n, x) => n + Object.keys(x).length, 0);
  console.log(`${name}: ${langDocsN} language documents with market sections (local), ${rootDocs.length} root documents for ${roots.length} roots, ${written.length} files new or changed`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
