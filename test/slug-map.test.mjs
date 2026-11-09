/* eslint-disable max-len, import/extensions -- dev tooling */
/* Slug maps (tools/slugs/lib.mjs, tools/slugs/<site>.json): the build rules on synthetic groups, the invariants of
   every committed map, and the files the parked sites must not have. Run: node --test test/slug-map.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  buildMap, loadMap, validateMap, stringifyMap, isActive, joinPath, splitPath, sanitizePath,
} from '../tools/slugs/lib.mjs';

const base = { site: 'lh-test', airline: 'test', host: 'https://www.example.com', sourceRoot: 'de/en' };
const build = (groups, extra = {}) => buildMap({ ...base, groups: groups.map((paths) => ({ paths })), ...extra });
const find = (map, canonical) => map.groups.find((g) => g.canonical === canonical);
const rootsOf = (map, i) => map.rootsets[i];

test('path helpers: split and join a www path, the EDS name of a slug', () => {
  assert.deepEqual(splitPath('/de/de/flugsuche'), ['de/de', '/flugsuche']);
  assert.deepEqual(splitPath('/de/de'), ['de/de', '/']);
  assert.deepEqual(splitPath('/de/de/a/b/'), ['de/de', '/a/b']);
  assert.equal(splitPath('/xyz/foo'), null);
  assert.equal(joinPath('de/de', '/'), '/de/de');
  assert.equal(joinPath('de/de', '/a/b'), '/de/de/a/b');
  assert.equal(sanitizePath('/profile/Best-price-alert'), '/profile/best-price-alert');
  assert.equal(sanitizePath('/a/first_class'), '/a/first-class');
});

test('canonical path = the slug of the source root; other roots with another slug get an alias', () => {
  const m = build([
    { 'de/en': '/de/en/flight-search', 'de/de': '/de/de/flugsuche', 'at/de': '/at/de/flugsuche', 'gb/en': '/gb/en/flight-search', 'fr/fr': '/fr/fr/recherche-de-vol' },
    { 'de/en': '/de/en/homepage', 'de/de': '/de/de/homepage' },
  ]);
  assert.equal(m.groups.length, 2);
  const g = find(m, '/flight-search');
  assert.deepEqual(rootsOf(m, g.roots), ['de/en', 'gb/en']);
  assert.deepEqual(g.aliases.map((a) => [a.slug, rootsOf(m, a.roots)]), [['/flugsuche', ['at/de', 'de/de']], ['/recherche-de-vol', ['fr/fr']]]);
  assert.equal(find(m, '/homepage').aliases, undefined);
  assert.equal(m.measured.deviatingGroups, 1);
  assert.deepEqual(m.measured.deviatingByLanguage, { de: 1, fr: 1 });
  assert.deepEqual(validateMap(m, { expectAllOff: true }), []);
});

test('every flag is off in a new map; an alias maps only while its root or group is on', () => {
  const m = build([{ 'de/en': '/de/en/a-page', 'de/de': '/de/de/eine-seite', 'fr/fr': '/fr/fr/une-page' }]);
  assert.deepEqual(m.active, { 'de/de': false, 'fr/fr': false });
  const api = loadMap(m);
  assert.equal(api.canonicalOf('/de/de/eine-seite'), '/de/de/eine-seite', 'off: nothing changes');
  assert.equal(api.canonicalOf('/de/de/eine-seite', { all: true }), '/de/de/a-page');
  m.active['de/de'] = true;
  assert.equal(api.canonicalOf('/de/de/eine-seite'), '/de/de/a-page');
  assert.equal(api.canonicalOf('/fr/fr/une-page'), '/fr/fr/une-page', 'another root stays off');
  const g = find(m, '/a-page');
  g.active = false;
  assert.equal(api.canonicalOf('/de/de/eine-seite'), '/de/de/eine-seite', 'the group flag wins over the root flag');
  g.active = true;
  assert.equal(api.canonicalOf('/fr/fr/une-page'), '/fr/fr/a-page', 'and the other way round');
  assert.equal(isActive(m, g, 'xx/xx'), true);
});

test('both directions: www path to canonical, canonical to www path (primary first), query, hash, .html and trailing slash', () => {
  const m = build([{ 'de/en': '/de/en/flights', 'de/de': ['/de/de/flights', '/de/de/fluege'], 'at/de': '/at/de/fluege' }]);
  const api = loadMap(m);
  assert.deepEqual(api.wwwPathsOf('/de/de/flights'), ['/de/de/flights', '/de/de/fluege'], 'the canonical slug first when the root lists it');
  assert.equal(api.wwwPathOf('/at/de/flights'), '/at/de/fluege');
  assert.equal(api.canonicalOf('/at/de/fluege/?x=1#y', { all: true }), '/at/de/flights');
  assert.equal(api.canonicalOf('/at/de/fluege.html', { all: true }), '/at/de/flights');
  assert.equal(api.canonicalOf('/at/de/unknown', { all: true }), '/at/de/unknown', 'unknown paths come back as they were');
  assert.equal(api.groupOf('/at/de/fluege').canonical, '/flights');
  assert.deepEqual(api.entries().map((e) => e.slice(0, 3)), [['at/de', '/fluege', '/flights'], ['de/de', '/fluege', '/flights']]);
});

test('unresolved groups keep their paths and are listed: two paths in the source root, English roots that disagree, no English member', () => {
  const m = build([
    { 'de/en': ['/de/en/343', '/de/en/34p'], 'de/de': ['/de/de/343', '/de/de/34p'] },
    { 'gb/en': '/gb/en/offer-a', 'us/en': '/us/en/offer-b', 'de/de': '/de/de/angebot' },
    { 'de/de': '/de/de/nur-deutsch', 'at/de': '/at/de/nur-deutsch' },
    { 'de/en': '/de/en/ok', 'de/de': '/de/de/ok' },
  ]);
  assert.deepEqual(m.groups.map((g) => g.canonical), ['/ok']);
  assert.deepEqual(m.exceptions.map((e) => e.kind).sort(), ['multi-source-path', 'no-source-member', 'source-conflict']);
  assert.deepEqual(m.measured.exceptions, { 'multi-source-path': 1, 'no-source-member': 1, 'source-conflict': 1 });
  const multi = m.exceptions.find((e) => e.kind === 'multi-source-path');
  assert.equal(multi.key, '/de/en/343');
  assert.equal(multi.variants.length, 2);
  assert.equal(loadMap(m).canonicalOf('/de/de/angebot', { all: true }), '/de/de/angebot', 'an exception is never mapped');
});

test('source-language fallback only where the English roots agree on one slug', () => {
  const m = build([{ 'gb/en': '/gb/en/only-uk', 'us/en': '/us/en/only-uk', 'de/de': '/de/de/nur-uk' }]);
  const g = find(m, '/only-uk');
  assert.ok(g, 'one English slug in all English roots: mapped');
  assert.equal(g.canonicalFrom, 'other-source-language-roots');
  assert.deepEqual(g.aliases.map((a) => a.slug), ['/nur-uk']);
});

test('a broken <loc> with the host name inside the path is no page address: ignored and counted', () => {
  const m = build([
    { 'ch/en': '/ch/en/various/GVA-2022-Inspiration', 'ch/fr': '/ch/fr/www.swiss.com/ch/fr/various/swiss-gva-2022-inspiration' },
    { 'ch/en': '/ch/en/www.swiss.com/ch/en/various/swiss-gva-2022-information', 'ch/fr': '/ch/fr/various/GVA-2022-Information' },
  ], { sourceRoot: 'ch/en' });
  assert.equal(m.measured.ignoredPaths, 2);
  assert.deepEqual(m.groups.map((g) => g.canonical), ['/various/gva-2022-inspiration']);
  assert.equal(m.groups[0].aliases.length, 1, 'only the case form of the English slug: no alias from the broken address');
  assert.equal(m.groups[0].aliases[0].sanitizedOnly, true);
  assert.deepEqual(m.exceptions.map((e) => e.kind), ['no-source-member']);
});

test('a root-specific English deviation is an alias, not an exception', () => {
  const m = build([{ 'de/en': '/de/en/offers', 'us/en': '/us/en/offers-us', 'gb/en': '/gb/en/offers' }]);
  const g = find(m, '/offers');
  assert.deepEqual(g.aliases.map((a) => [a.slug, rootsOf(m, a.roots)]), [['/offers-us', ['us/en']]]);
  assert.deepEqual(m.measured.deviatingByLanguage, { en: 1 });
});

test('collisions: a canonical path that is another page\'s www path in a root keeps both pages out of the map', () => {
  const m = build([
    { 'de/en': '/de/en/baggage', 'de/de': '/de/de/gepaeck' },
    { 'de/en': '/de/en/luggage', 'de/de': '/de/de/baggage' }, // our canonical /de/de/baggage is the www path of the second page
    { 'de/en': '/de/en/fine', 'de/de': '/de/de/schoen' },
  ]);
  assert.deepEqual(m.groups.map((g) => g.canonical), ['/fine']);
  const col = m.exceptions.filter((e) => e.kind === 'collision');
  assert.equal(col.length, 2);
  assert.deepEqual(col.map((e) => e.key).sort(), ['/de/en/baggage', '/de/en/luggage']);
  assert.deepEqual(col.find((e) => e.key === '/de/en/baggage').with, ['/de/en/luggage']);
});

test('two pages swapping slugs collide; two groups with one canonical path and disjoint roots are one page', () => {
  const swap = build([
    { 'de/en': '/de/en/a', 'de/de': '/de/de/b' },
    { 'de/en': '/de/en/b', 'de/de': '/de/de/a' },
  ]);
  assert.equal(swap.groups.length, 0);
  assert.equal(swap.exceptions.length, 2);
  const merged = build([
    { 'de/en': '/de/en/check-in', 'de/de': '/de/de/check-in' },
    { 'sa/en': '/sa/en/check-in', 'sd/en': '/sd/en/check-in' },
  ]);
  assert.equal(merged.groups.length, 1);
  assert.equal(merged.groups[0].mergedGroups, 2);
  assert.deepEqual(rootsOf(merged, merged.groups[0].roots), ['de/de', 'de/en', 'sa/en', 'sd/en']);
  assert.equal(merged.measured.mergedGroups, 1);
  const overlap = build([
    { 'de/en': '/de/en/check-in', 'de/de': '/de/de/check-in-de' },
    { 'sa/en': '/sa/en/check-in', 'de/de': '/de/de/anmeldung' }, // the same root holds two different pages under one canonical path
  ]);
  assert.equal(overlap.groups.length, 0);
  assert.deepEqual(overlap.exceptions.map((e) => e.kind), ['collision', 'collision']);
});

test('a www slug that differs only in case or punctuation is the same page: sanitizedOnly, never active, not deviating', () => {
  const m = build([
    { 'de/en': '/de/en/profile/Best-price-alert', 'de/de': '/de/de/profile/Best-price-alert' },
    { 'de/en': '/de/en/a_b', 'de/de': '/de/de/a-b' },
  ]);
  const g = find(m, '/profile/best-price-alert');
  assert.equal(g.canonical, '/profile/best-price-alert', 'our documents live at the EDS name');
  assert.equal(g.aliases[0].sanitizedOnly, true);
  assert.equal(g.sanitizedOnly, true);
  assert.equal(m.measured.deviatingGroups, 0);
  assert.equal(m.measured.sanitizedOnlyGroups, 2);
  assert.deepEqual(m.active, {}, 'nothing to switch on');
  const api = loadMap(m);
  api.map.active['de/de'] = true;
  assert.equal(api.canonicalOf('/de/de/profile/Best-price-alert'), '/de/de/profile/Best-price-alert', 'not an alias of this programme');
  assert.equal(api.canonicalOf('/de/de/profile/Best-price-alert', { all: true }), '/de/de/profile/best-price-alert', 'but it pairs with our page');
  assert.equal(api.wwwPathOf('/de/de/profile/best-price-alert'), '/de/de/profile/Best-price-alert');
  assert.equal(api.wwwPathOf('/de/en/a-b'), '/de/en/a_b');
  assert.equal(api.canonicalOf('/de/de/profile/best-price-alert', { all: true }), '/de/de/profile/best-price-alert', 'a lower-cased request finds the page');
  assert.deepEqual(validateMap(m), []);
});

test('mirrors: an internal tree follows the slugs of its public root', () => {
  const m = build([{ 'de/en': '/de/en/flights', 'de/de': '/de/de/fluege' }], { mirrors: { 'gc/de': 'de/de', 'gc/en': 'de/en' } });
  m.active['de/de'] = true;
  const api = loadMap(m);
  assert.equal(api.canonicalOf('/gc/de/fluege'), '/gc/de/flights');
  assert.deepEqual(api.wwwPathsOf('/gc/de/flights'), ['/gc/de/fluege']);
  assert.equal(api.canonicalOf('/gc/en/flights'), '/gc/en/flights');
});

test('validateMap finds planted problems', () => {
  const m = build([{ 'de/en': '/de/en/a', 'de/de': '/de/de/b' }, { 'de/en': '/de/en/c', 'de/de': '/de/de/d' }]);
  assert.deepEqual(validateMap(m), []);
  const dup = JSON.parse(JSON.stringify(m));
  dup.groups[1].canonical = '/a';
  assert.ok(validateMap(dup).some((p) => /canonical path in two groups/.test(p)));
  const clash = JSON.parse(JSON.stringify(m));
  clash.groups[1].canonical = '/b'; // the canonical path of the second page is the www path of the first
  assert.ok(validateMap(clash).some((p) => /collision/.test(p)));
  const on = JSON.parse(JSON.stringify(m));
  on.active['de/de'] = true;
  assert.ok(validateMap(on, { expectAllOff: true }).some((p) => /is on/.test(p)));
  const bad = JSON.parse(JSON.stringify(m));
  bad.groups[0].canonical = '/Upper';
  assert.ok(validateMap(bad).some((p) => /not an EDS name/.test(p)));
});

test('the same input writes the same bytes', () => {
  const a = stringifyMap(build([{ 'de/en': '/de/en/x', 'de/de': '/de/de/y' }]));
  const b = stringifyMap(build([{ 'de/de': '/de/de/y', 'de/en': '/de/en/x' }]));
  assert.equal(a, b);
  assert.deepEqual(JSON.parse(a).groups[0].id, build([{ 'de/en': '/de/en/x' }]).groups[0].id, 'the id depends on the canonical path only');
});

// ---- the committed maps -------------------------------------------------------------------------------------------

const dir = new URL('../tools/slugs/', import.meta.url);
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
const maps = Object.fromEntries(files.map((f) => [f.replace(/\.json$/, ''), JSON.parse(fs.readFileSync(new URL(f, dir), 'utf8'))]));

// the airlines in scope; a file is added with its piece of work, so the list grows with the commits
const IN_SCOPE = ['lh-com', 'lh-austrian', 'lh-swiss'];

test('the committed maps exist for the airlines done so far and for no parked site', () => {
  IN_SCOPE.forEach((s) => assert.ok(maps[s], `tools/slugs/${s}.json`));
  ['lh-tap', 'lh-airdolomiti', 'lh-ita'].forEach((s) => assert.equal(maps[s], undefined, `${s} is parked: no map file, no flag`));
  assert.deepEqual(Object.keys(maps).filter((s) => !/^lh-/.test(s)), []);
});

Object.entries(maps).forEach(([site, map]) => {
  test(`${site}: invariants, every flag off, counts equal the file`, () => {
    assert.equal(map.site, site);
    assert.equal(map.sourceLanguage, 'en');
    assert.deepEqual(validateMap(map, { expectAllOff: true }), []);
    assert.equal(map.measured.mapped, map.groups.length);
    assert.equal(map.measured.deviatingGroups, map.groups.filter((g) => g.aliases && !g.sanitizedOnly).length);
    const kinds = {};
    map.exceptions.forEach((e) => { kinds[e.kind] = (kinds[e.kind] || 0) + 1; });
    assert.deepEqual(map.measured.exceptions || {}, kinds);
    const api = loadMap(map);
    // inactive: no www path changes
    api.entries({ all: true }).forEach(([root, slug]) => assert.equal(api.canonicalOf(joinPath(root, slug)), joinPath(root, slug)));
    // every group of a deviating root names an alias; the flag set has exactly those roots
    const roots = new Set(api.entries().map((e) => e[0]));
    assert.deepEqual(Object.keys(map.active).sort(), [...roots].sort());
  });
});
