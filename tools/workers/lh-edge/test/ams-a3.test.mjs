/* eslint-disable max-len */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import worker from '../src/index.js';
import { resetSheetCache } from '../src/sheet.js';
import { buildCatalog, parseTags } from '../src/xf.js';
import { aircraftOf, localeOf } from '../src/aircraft.js';

const SEL = new URL('../../../source-export/feeds/ams-rest/selectors/', import.meta.url);
const STATIC = new URL('../../../source-export/feeds/ams-rest/static/', import.meta.url);
const fixture = (f) => JSON.parse(fs.readFileSync(new URL(f, SEL), 'utf8'));
const ORIGIN = 'main--lh-com--moved-permanently.aem.live';
const env = { ORIGIN, PUBLIC_HOST: '', EDGE_TTL: '60' };

/** The index rows the /xf/ documents give (as tools/importer/build-xf-docs.mjs writes them). */
function rowsOf(catalog, base) {
  const rows = [];
  const tags = (t) => (t || []).map((x) => `${x.title}|${x.id}`).join(', ');
  const walk = (node, folder) => {
    const subs = Object.keys(node).filter((k) => k !== 'experienceFragments');
    if (!subs.length && !node.experienceFragments.length) rows.push({ 'xf-path': folder, 'xf-kind': 'folder', title: folder.split('/').pop() });
    node.experienceFragments.forEach((f) => {
      rows.push({
        'xf-path': f.path, 'xf-kind': 'fragment', title: f.title, 'xf-tags': tags(f.tags),
      });
      f.variants.forEach((v) => rows.push({
        'xf-path': v.path, 'xf-kind': 'variant', title: v.title, 'xf-tags': tags(v.tags),
      }));
    });
    subs.forEach((k) => walk(node[k], `${folder}/${k}`));
  };
  walk(catalog, base);
  return rows;
}
/** Order aside: arrays sorted by their JSON. */
const sorted = (v) => {
  if (Array.isArray(v)) return v.map(sorted).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, sorted(x)]));
  return v;
};

const MARKETS = fixture('csi-xf-markets-de.json');
const GC = fixture('csi-xf-gc-en.json');
const XF_ROWS = [...rowsOf(MARKETS, '/content/experience-fragments/lh/markets/de'), ...rowsOf(GC, '/content/experience-fragments/lh/gc/en')];
const FLEET_ROWS = [
  {
    path: '/de/en/744', title: 'Boeing 747-400 | Lufthansa', 'aircraft-code': '744', 'aircraft-order': '6',
  },
  {
    path: '/de/en/359', title: 'Airbus A350-900 | Lufthansa', 'aircraft-code': '359', 'aircraft-order': '1',
  },
  {
    path: '/de/en/discover-lufthansa/lufthansa-fleet/351', title: 'Airbus 350-1000 | Lufthansa', 'aircraft-code': '351', 'aircraft-order': '2',
  },
  {
    path: '/de/de/359', title: 'Airbus A350-900 | Lufthansa', 'aircraft-code': '359', 'aircraft-order': '1',
  },
];
const SW = fs.readFileSync(new URL('service-worker.js', STATIC), 'utf8');

let calls;
beforeEach(() => {
  resetSheetCache();
  calls = [];
  globalThis.fetch = async (input) => {
    const u = new URL((input instanceof Request ? input : new Request(input)).url);
    calls.push(u.pathname);
    if (u.pathname === '/xf/query-index.json') return new Response(JSON.stringify({ data: XF_ROWS }), { headers: { 'content-type': 'application/json' } });
    if (u.pathname === '/fleet-index.json') return new Response(JSON.stringify({ data: FLEET_ROWS }), { headers: { 'content-type': 'application/json' } });
    if (u.pathname === '/service-worker.js') return new Response(SW, { headers: { 'content-type': 'text/javascript; charset=utf-8', 'cache-control': 'max-age=60' } });
    return new Response('not found', { status: 404 });
  };
});
const get = (p) => worker.fetch(new Request(`https://lh-edge.example${p}`), env, {});

test('csi-xf: both recorded catalogs from the index (order aside), www\'s headers; outside the folder 400 {}', async () => {
  assert.deepEqual(sorted(buildCatalog(XF_ROWS, '/content/experience-fragments/lh/markets/de')), sorted(MARKETS));
  assert.deepEqual(sorted(buildCatalog(XF_ROWS, '/content/experience-fragments/lh/gc/en')), sorted(GC));
  const resp = await get('/content/experience-fragments/lh/gc/en.csi-xf.json');
  assert.equal(resp.status, 200);
  assert.equal(resp.headers.get('content-type'), 'application/json');
  assert.equal(resp.headers.get('cache-control'), 'no-cache, no-store, must-revalidate');
  assert.equal(resp.headers.get('pragma'), 'no-cache');
  assert.equal(resp.headers.get('expires'), '0');
  assert.deepEqual(sorted(await resp.json()), sorted(GC));
  // a sub-folder of a catalog
  const sub = await (await get('/content/experience-fragments/lh/markets/de/de/contextteaser.csi-xf.json')).json();
  assert.deepEqual(sorted(sub), sorted(MARKETS.de.contextteaser));
  const out = await get('/content/experience-fragments/other/de.csi-xf.json');
  assert.equal(out.status, 400);
  assert.equal(await out.text(), '{}');
  assert.deepEqual(parseTags('High|lufthansa-group:priority/high'), [{ title: 'High', id: 'lufthansa-group:priority/high', name: 'high' }]);
});

test('aircraft.json: the locale\'s aircraft pages in the fleet overview\'s order, no cache headers, empty elsewhere', async () => {
  const resp = await get('/de/en/homepage.aircraft.json');
  assert.equal(resp.headers.get('content-type'), 'application/json');
  assert.equal(resp.headers.get('cache-control'), null);
  assert.deepEqual(await resp.json(), {
    aircrafts: [
      { name: '359', title: 'Airbus A350-900', url: '/de/en/359' },
      { name: '351', title: 'Airbus 350-1000', url: '/de/en/discover-lufthansa/lufthansa-fleet/351' },
      { name: '744', title: 'Boeing 747-400', url: '/de/en/744' },
    ],
  });
  assert.deepEqual((await (await get('/content/lh/markets/de/de/homepage.aircraft.json')).json()).aircrafts.map((a) => a.url), ['/de/de/359']);
  assert.deepEqual(await (await get('/us/en/homepage.aircraft.json')).json(), { aircrafts: [] });
  assert.deepEqual(aircraftOf(FLEET_ROWS, null), []);
  assert.equal(localeOf('/gb/en'), '/gb/en');
  assert.equal(localeOf('/index'), null);
});

test('service-worker.js: www\'s file with www\'s headers', async () => {
  const resp = await get('/service-worker.js');
  assert.equal(resp.headers.get('content-type'), 'application/javascript');
  assert.equal(resp.headers.get('cache-control'), 'public, max-age=21600');
  assert.equal(await resp.text(), SW);
});

test('sitemap .xml.gz: the origin\'s .xml gzipped, application/octet-stream, 4 h; missing 404', async () => {
  const { gunzipSync } = await import('node:zlib');
  const XML = '<?xml version="1.0" encoding="UTF-8"?><urlset><url><loc>https://www.lufthansa.com/de/en/baggage</loc></url></urlset>';
  globalThis.fetch = async (input) => {
    const u = new URL((input instanceof Request ? input : new Request(input)).url);
    if (u.pathname === '/sitemap/sitemap_lh_de_en.xml') return new Response(XML, { headers: { 'content-type': 'application/xml' } });
    return new Response('not found', { status: 404 });
  };
  const resp = await get('/sitemap/sitemap_lh_de_en.xml.gz');
  assert.equal(resp.status, 200);
  assert.equal(resp.headers.get('content-type'), 'application/octet-stream');
  assert.equal(resp.headers.get('cache-control'), 'public, max-age=14400');
  assert.equal(gunzipSync(Buffer.from(await resp.arrayBuffer())).toString(), XML);
  assert.equal((await get('/sitemap/sitemap_lh_xx_xx.xml.gz')).status, 404);
});
