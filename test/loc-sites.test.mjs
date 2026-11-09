/* eslint-disable max-len, import/extensions */
/* The loc tools with --site (tools/loc/sites.mjs): the registry, the site's own translate.json
   (tools/loc/sites/<site>/translate.json, built on lh-com's live DA file), the setup read from its rows, and
   check-config's siteChecks with the app's own functions (adobe/da-nx 69006f3b). lh-com keeps its files and its
   behaviour (test/loc-gc-setup.test.mjs, test/loc-config-check.test.mjs). No network.
   Run: node --max-old-space-size=512 --test test/loc-sites.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  SITES, siteInfo, isDefaultSite, daBase, daConfigUrl, configFile, aemPageOf, hostsRegex, siteFromArgv,
} from '../tools/loc/sites.mjs';
import { locSetup, readConfig } from '../tools/loc/setup-lib.mjs';
import { loadApp } from '../tools/loc/da-nx.mjs';
import { siteChecks, sourceChecks } from '../tools/loc/check-config.mjs';
import { SITE_HOSTS } from '../tools/loc/link-lib.mjs';

const OTHER = ['lh-austrian', 'lh-swiss', 'lh-brussels', 'lh-discover', 'lh-cargo', 'lh-b2b'];
const read = (u) => JSON.parse(fs.readFileSync(new URL(u, import.meta.url), 'utf8'));
const cfg = (site) => read(`../tools/loc/sites/${site}/translate.json`);
const LIVE = read('../tools/loc/translate.json');
const app = await loadApp();

test('registry: lh-com and the six airlines; ITA, TAP and Air Dolomiti are parked and stop the tools', () => {
  assert.deepEqual(Object.keys(SITES), ['lh-com', ...OTHER]);
  assert.equal(siteInfo().site, 'lh-com');
  ['lh-tap', 'lh-airdolomiti', 'lh-ita'].forEach((s) => assert.throws(() => siteInfo(s), /parked/));
  assert.throws(() => siteInfo('lh-nope'), /unknown/);
  assert.equal(isDefaultSite(), true);
  assert.equal(isDefaultSite('lh-swiss'), false);
  assert.equal(siteFromArgv(['--x', '1']), 'lh-com');
  assert.equal(siteFromArgv(['--site', 'lh-b2b']), 'lh-b2b');
  assert.throws(() => siteFromArgv(['--site', 'lh-tap']), /parked/);
  ['lh-tap', 'lh-airdolomiti', 'lh-ita'].forEach((s) => assert.ok(!fs.existsSync(new URL(`../tools/loc/sites/${s}`, import.meta.url)), `${s}: no loc files`));
});

test('registry: DA root and configuration document, preview host, own hosts, the repo file', () => {
  assert.equal(daBase('lh-brussels'), 'https://admin.da.live/source/moved-permanently/lh-brussels');
  assert.equal(daConfigUrl('lh-discover'), 'https://admin.da.live/source/moved-permanently/lh-discover/.da/translate.json');
  assert.equal(daConfigUrl(), 'https://admin.da.live/source/moved-permanently/lh-com/.da/translate.json', 'lh-com as before');
  assert.equal(aemPageOf('lh-cargo'), 'https://main--lh-cargo--moved-permanently.aem.page');
  assert.ok(configFile('lh-swiss').endsWith('tools/loc/sites/lh-swiss/translate.json'));
  assert.ok(configFile().endsWith('tools/loc/translate.json'));
  const re = hostsRegex('lh-austrian');
  assert.ok(re.test('https://austrian.turnsthe.page/at/en/x'));
  assert.ok(re.test('https://main--lh-austrian--moved-permanently.aem.live'));
  assert.ok(!re.test('https://www.austrian.com/at/en/x'), 'www links stay');
  assert.ok(!re.test('https://main--lh-swiss--moved-permanently.aem.page/x'), 'another site\'s host is not this site\'s');
  assert.ok(!re.test('https://lufthansa.turnsthe.page/x'));
  // lh-com keeps its constant; the registry lists the same hosts
  ['https://main--lh-com--moved-permanently.aem.page/x', 'https://main--lh-com--moved-permanently.aem.live', 'https://lufthansa.turnsthe.page/de/en/x', 'https://lhedge.bbird.live/x', 'https://www.lufthansa.com/x']
    .forEach((u) => assert.equal(hostsRegex('lh-com').test(u), SITE_HOSTS.test(u), u));
});

test('readConfig: the site\'s repo file, its DA document (a read with the login)', async () => {
  assert.equal(locSetup(await readConfig('repo', { site: 'lh-austrian' })).source, 'at/en');
  assert.equal(locSetup(await readConfig()).source, 'de/en', 'default: lh-com');
  const seen = [];
  const fetchImpl = async (url, opts) => { seen.push([url, opts.headers.authorization]); return new Response(JSON.stringify(cfg('lh-cargo')), { status: 200 }); };
  assert.equal(locSetup(await readConfig('da', { fetchImpl, token: 't', site: 'lh-cargo' })).source, 'en');
  assert.deepEqual(seen, [['https://admin.da.live/source/moved-permanently/lh-cargo/.da/translate.json', 'Bearer t']]);
});

test('setup of every site: English source, translations from it into each language root, no rollout', () => {
  const want = {
    'lh-austrian': ['at/en', ['at/de', 'fr/fr', 'it/it', 'es/es', 'gr/el', 'jp/ja', 'pl/pl', 'ru/ru', 'cn/zh']],
    'lh-swiss': ['ch/en', ['ch/de', 'ch/fr', 'ch/it', 'ch/es', 'ch/ru', 'ch/pt', 'ch/el', 'ch/zh', 'ch/ja', 'kr/ko']],
    'lh-brussels': ['be/en', ['be/fr', 'be/nl', 'it/it', 'de/de', 'es/es']],
    'lh-discover': ['de/en', ['de/de', 'xx/fr']],
    'lh-cargo': ['en', ['de']],
    'lh-b2b': ['de/en', ['de/de']],
  };
  OTHER.forEach((site) => {
    const s = locSetup(cfg(site));
    assert.equal(s.source, want[site][0], site);
    assert.deepEqual(s.translations.map((t) => t.to), want[site][1], site);
    assert.deepEqual(Object.values(s.pairs), want[site][1].map(() => 'translation'), `${site}: no rollout pair`);
    assert.equal(s.global, false);
    assert.equal(s.translation.from, want[site][0], `${site}: the first translation`);
  });
  // today's lh-com setup is read as before (the German row singled out)
  assert.deepEqual(locSetup(LIVE).translation, { from: 'de/en', to: 'de/de', locales: ['at/de'] });
});

OTHER.forEach((site) => {
  test(`${site}: the file is lh-com's live setup with this airline's rows; every check of the app passes`, () => {
    const c = cfg(site);
    const hostRow = c.config.data.find((r) => r.key === 'source.fragment.hostnames').value;
    assert.deepEqual(hostRow.split(',').map((h) => h.trim()), [`main--${site}--moved-permanently.aem.live`, SITES[site].hosts.find((h) => h.endsWith('.turnsthe.page'))]);
    // same keys, service and behaviours as lh-com's (the file in the repo is the live one: the rows differ only in the languages)
    assert.deepEqual(c.config.data.map((r) => r.key), LIVE.config.data.map((r) => r.key));
    ['translation.service.name', 'translation.service.all.env', 'translation.service.prod.origin', 'translate.conflict.behavior', 'rollout.conflict.behavior', 'copy.conflict.behavior', 'sync.conflict.behavior', 'source.language.detect']
      .forEach((k) => assert.equal(c.config.data.find((r) => r.key === k).value, LIVE.config.data.find((r) => r.key === k).value, k));
    assert.deepEqual(c['dnt-sheet-rules'], LIVE['dnt-sheet-rules']);
    LIVE['custom-doc-rules'].data.forEach((r) => assert.ok(c['custom-doc-rules'].data.some((x) => x.block === r.block && x.rule === r.rule), `lh-com's rule for ${r.block} is kept`));
    assert.ok(c['custom-doc-rules'].data.length > LIVE['custom-doc-rules'].data.length, 'the airline\'s own blocks');
    [...c[':names'], ...[]].forEach((n) => assert.equal(c[n].total, c[n].data.length, n));
    assert.equal(JSON.stringify(c).includes('/gc/'), false, 'no /gc tree (D1)');
    const langs = c.languages.data;
    assert.equal(langs[0].name, 'English');
    assert.equal(langs[0].actions, 'Skip');
    assert.ok(langs.slice(1).every((l) => l.actions === 'Skip, Translate' && l.source === langs[0].location && l.locales === ''));
    const results = siteChecks(app, c, site);
    assert.ok(results.length >= 12, `${results.length} checks`);
    results.forEach((r) => assert.ok(r.ok, `${r.name}: ${r.detail}`));
  });

  test(`${site}: the language roots hold a full copy in DA (uploaded documents, tools/importer/da-upload-state-${site}.json)`, () => {
    const docs = Object.keys(JSON.parse(fs.readFileSync(new URL(`../tools/importer/da-upload-state-${site}.json`, import.meta.url), 'utf8')).docs);
    cfg(site).languages.data.forEach((l) => {
      const n = docs.filter((d) => d.startsWith(`${l.location}/`)).length;
      assert.ok(n >= 100, `${l.location}: ${n} documents`);
    });
  });
});

test('the checks follow the rows: another site\'s checks fail on a wrong config, lh-com\'s own checks are untouched', () => {
  assert.ok(siteChecks(app, LIVE, 'lh-austrian').some((r) => !r.ok), 'lh-com\'s rows are no Austrian setup');
  const broken = cfg('lh-austrian');
  broken.languages.data[2].source = '/at/de';
  assert.ok(siteChecks(app, broken, 'lh-austrian').some((r) => !r.ok));
  const noDetect = cfg('lh-swiss');
  noDetect.config.data = noDetect.config.data.filter((r) => r.key !== 'source.language.detect');
  assert.ok(siteChecks(app, noDetect, 'lh-swiss').some((r) => !r.ok && /detect/.test(r.name)));
  assert.equal(sourceChecks(app, LIVE).length, 7);
  sourceChecks(app, LIVE).forEach((r) => assert.ok(r.ok, r.name));
});

test('the airline\'s own blocks: Brussels and Discover add nothing the airline does not use, B2B and Cargo their own', () => {
  const rules = (site) => cfg(site)['custom-doc-rules'].data.filter((r) => !LIVE['custom-doc-rules'].data.some((x) => x.block === r.block && x.rule === r.rule));
  assert.ok(rules('lh-b2b').some((r) => /b2b-login/.test(r.block) && r.rule === 'dnt col 1'));
  assert.ok(rules('lh-cargo').some((r) => /newsletter-form/.test(r.block)));
  assert.ok(rules('lh-austrian').some((r) => /checkin-deadlines/.test(r.block)));
  assert.ok(!rules('lh-brussels').some((r) => /b2b|newsletter-form|checkin-deadlines/.test(r.block)));
});

// ---- the other tools with --site ---------------------------------------------------------------------------------

const { spawnSync } = await import('node:child_process');
const { sameSlugMap, localizeHref, localizeDoc } = await import('../tools/loc/link-lib.mjs');
const { runLinkStep } = await import('../tools/loc/link-step.mjs');
const { daClient } = await import('../tools/loc/slug-step.mjs');
const { run: regionalRun, regionalPairs } = await import('../tools/loc/regional-diff.mjs');

test('daClient: the site\'s DA root, the refusal names the site; lh-com as before', async () => {
  const seen = [];
  const fetchImpl = async (url, opts) => { seen.push([url, opts.method || 'GET', opts.headers.authorization]); return new Response('<main></main>', { status: 200 }); };
  await daClient(fetchImpl, 't', 'lh-swiss').get('/ch/de/x');
  await daClient(fetchImpl, 't').get('/de/de/x');
  assert.deepEqual(seen, [
    ['https://admin.da.live/source/moved-permanently/lh-swiss/ch/de/x.html', 'GET', 'Bearer t'],
    ['https://admin.da.live/source/moved-permanently/lh-com/de/de/x.html', 'GET', 'Bearer t'],
  ]);
  const denied = daClient(async () => new Response('', { status: 403 }), 't', 'lh-b2b');
  await assert.rejects(() => denied.get('/de/de/x'), /moved-permanently\/lh-b2b/);
});

test('link step without a scope table: one slug per page, the site\'s own hosts become root-relative, other hosts stay', () => {
  const map = sameSlugMap('at/en', 'at/de', { hosts: hostsRegex('lh-austrian') });
  const unmapped = [];
  const r = (h) => localizeHref(h, map, (p) => unmapped.push(p));
  assert.equal(r('https://main--lh-austrian--moved-permanently.aem.page/at/en/baggage'), '/at/de/baggage');
  assert.equal(r('https://austrian.turnsthe.page/at/en/baggage?x=1#top'), '/at/de/baggage?x=1#top');
  assert.equal(r('/at/en/baggage.html'), '/at/de/baggage');
  assert.equal(r('/at/en'), '/at/de');
  assert.equal(r('/at/en/'), '/at/de');
  assert.equal(r('https://www.austrian.com/at/en/baggage'), null, 'www links stay');
  assert.equal(r('https://main--lh-swiss--moved-permanently.aem.page/ch/en/x'), null, 'another site\'s host stays');
  assert.equal(r('/at/de/baggage'), null);
  assert.equal(r('/fr/fr/baggage'), null, 'another root');
  assert.equal(r('#a'), null);
  assert.deepEqual(unmapped, []);
  const out = localizeDoc('<body><main><p><a href="https://austrian.turnsthe.page/at/en/a">https://austrian.turnsthe.page/at/en/a</a> <a href="/at/en/b">b</a> <a href="https://www.austrian.com/x">x</a></p></main></body>', map);
  assert.equal(out.links, 2);
  assert.match(out.html, /href="\/at\/de\/a">\/at\/de\/a<\/a>/);
  assert.match(out.html, /href="\/at\/de\/b"/);
  assert.match(out.html, /href="https:\/\/www\.austrian\.com\/x"/);
  // lh-com's hosts are not this site's
  assert.equal(localizeHref('https://lufthansa.turnsthe.page/at/en/x', map, () => {}), null);
});

test('runLinkStep without rows: the site\'s pairs from its setup, a fake DA, dry run and apply', async () => {
  const store = new Map([['/fr/fr/a', '<body><main><p><a href="https://main--lh-austrian--moved-permanently.aem.live/at/en/b">b</a></p></main></body>'], ['/fr/fr/b', '<body><main><p>nothing</p></main></body>']]);
  const da = { get: async (p) => store.get(p) || null, put: async (p, h) => { store.set(p, h); } };
  const setup = locSetup(cfg('lh-austrian'));
  const dry = await runLinkStep({
    from: 'at/en', to: 'fr/fr', pages: ['/fr/fr/a', '/fr/fr/b', '/fr/fr/c', '/at/de/x'], rows: null, da, setup, hosts: hostsRegex('lh-austrian'),
  });
  assert.deepEqual(dry.map((x) => [x.page, x.status, x.links || 0]), [['/fr/fr/a', 'changes', 1], ['/fr/fr/b', 'unchanged', 0], ['/fr/fr/c', 'not in DA', 0], ['/at/de/x', 'not a /fr/fr page', 0]]);
  assert.match(store.get('/fr/fr/a'), /aem\.live/, 'a dry run writes nothing');
  await runLinkStep({
    from: 'at/en', to: 'fr/fr', pages: ['/fr/fr/a'], rows: null, da, setup, apply: true, hosts: hostsRegex('lh-austrian'),
  });
  assert.match(store.get('/fr/fr/a'), /href="\/fr\/fr\/b"/);
  await assert.rejects(() => runLinkStep({ from: 'at/de', to: 'fr/fr', pages: [], rows: null, da, setup }), /not a rollout or translation pair/);
});

test('slug step, regional diff, link step and marker check: another site is handled, not crashed', async () => {
  const cli = (f, ...args) => spawnSync('node', [`tools/loc/${f}.mjs`, ...args], { cwd: new URL('..', import.meta.url).pathname, encoding: 'utf8' });
  const slug = cli('slug-step', '--site', 'lh-swiss');
  assert.equal(slug.status, 1);
  assert.match(slug.stderr, /lh-com only .* tools\/slugs\/lh-swiss\.json/);
  const diff = cli('regional-diff', '--site', 'lh-brussels');
  assert.equal(diff.status, 0);
  assert.match(diff.stdout, /no rollout/);
  const link = cli('link-step', '--site', 'lh-brussels', '--from', 'be/en', '--to', 'be/fr');
  assert.equal(link.status, 1);
  assert.match(link.stderr, /no scope table/);
  const marker = cli('marker-check', '--site', 'lh-cargo');
  assert.equal(marker.status, 1);
  assert.match(marker.stderr, /no scope table/);
  const parked = cli('link-step', '--site', 'lh-tap', '--from', 'a/b', '--to', 'c/d');
  assert.notEqual(parked.status, 0);
  assert.match(parked.stderr, /parked/);
  // the regional diff of a setup without rollout compares nothing
  assert.deepEqual(regionalPairs(locSetup(cfg('lh-discover'))), []);
  assert.deepEqual(await regionalRun({ setup: locSetup(cfg('lh-discover')) }), []);
});
