/* eslint-disable max-len, no-underscore-dangle, import/extensions, no-restricted-syntax */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import worker from '../src/index.js';
import {
  resetFeedCache, parseQueryPath, allowedOrigin, graphqlPath,
} from '../src/graphql.js';
import readDaForm from '../src/daform.js';
import { normalize, diff } from '../graphql-diff.mjs';

const FEEDS = JSON.parse(fs.readFileSync(new URL('./fixtures/graphql-feeds.json', import.meta.url), 'utf8'));
const RECORDED_DIR = new URL('../../../source-export/feeds/', import.meta.url);
const recorded = JSON.parse(fs.readFileSync(new URL('graphql/index.json', RECORDED_DIR), 'utf8')).urls;
const env = {
  ORIGIN: 'main--lh-com--moved-permanently.aem.live',
  CORS_ORIGINS: 'lufthansa.com,swiss.com,*--lh-com--moved-permanently.aem.page,localhost',
};

let calls;
beforeEach(() => {
  resetFeedCache();
  calls = [];
  globalThis.fetch = async (input, init = {}) => {
    const req = input instanceof Request ? input : new Request(input);
    calls.push({ url: req.url, init });
    const u = new URL(req.url);
    const hit = FEEDS[u.pathname];
    if (hit) {
      const offset = Number(u.searchParams.get('offset') || 0);
      const limit = Number(u.searchParams.get('limit') || 1000);
      return Response.json({ ...hit, offset, data: hit.data.slice(offset, offset + limit) });
    }
    return new Response('not found', { status: 404 });
  };
});

const get = (path, headers = {}) => worker.fetch(new Request(`https://lh-edge.example${path}`, { headers }), env, {});

test('graphql: every recorded www answer (apart from Message-Center) as www, deliberate differences aside', async () => {
  const urls = Object.keys(recorded).filter((u) => !u.includes('/Message-Center/'));
  assert.ok(urls.length >= 50);
  for (const url of urls) {
    // eslint-disable-next-line no-await-in-loop
    const resp = await get(url);
    const www = JSON.parse(fs.readFileSync(new URL(recorded[url].file, RECORDED_DIR), 'utf8'));
    assert.equal(resp.status, recorded[url].status, url);
    // eslint-disable-next-line no-await-in-loop
    const d = diff(normalize(www, '', 'www'), normalize(await resp.json(), '', 'edge'));
    assert.deepEqual(d, [], `${url}: ${JSON.stringify(d.slice(0, 2))}`);
  }
});

test('graphql: headers, last-modified of the data, failing queries as www', async () => {
  const r = await get('/graphql/execute.json/AllegrisUpgrade/AllegrisAircraftsList;airline=lh');
  assert.equal(r.headers.get('content-type'), 'application/json');
  assert.equal(r.headers.get('cache-control'), 'public, max-age=120');
  assert.ok(r.headers.get('last-modified'));
  // case-insensitive airline
  assert.equal((await r.json()).data.allegrisaircraftList.items.length, 22);
  // the 500s of www have no cache-control
  const v = await get('/graphql/execute.json/Travel-Regulations/TravelRegulationList');
  assert.equal(v.status, 500);
  assert.equal(v.headers.get('cache-control'), null);
  assert.equal(await v.text(), fs.readFileSync(new URL('graphql/Travel-Regulations-TravelRegulationList.json', RECORDED_DIR), 'utf8'));
  // unknown configuration or query (also ones only test systems have): 404 with AEM's body
  const u = await get('/graphql/execute.json/Ancillary-on-TMC/tmc-translations-v2');
  assert.equal(u.status, 404);
  assert.match((await u.json()).errors[0].details, /Configuration: 'Ancillary-on-TMC' and Query Name: 'tmc-translations-v2' does not resolve/);
  // the indexes are read past the edge cache, once per isolate for 30 s
  await get('/graphql/execute.json/AllegrisUpgrade/AllegrisAircraftsList;airline=LX');
  assert.equal(calls.filter((c) => c.url.includes('/aircraft/query-index.json')).length, 1);
  assert.equal(calls[0].init.cache, 'no-store');
});

test('graphql: /api/content/graphql/execute.json/... answers exactly as /graphql/execute.json/...', async () => {
  const urls = Object.keys(recorded).filter((u) => !u.includes('/Message-Center/'));
  for (const url of urls) {
    const alias = url.replace('/graphql/execute.json/', '/api/content/graphql/execute.json/');
    // eslint-disable-next-line no-await-in-loop
    const [a, b] = await Promise.all([get(url), get(alias)]);
    assert.equal(b.status, a.status, alias);
    ['content-type', 'cache-control', 'last-modified', 'x-lh-edge-route'].forEach((h) => assert.equal(b.headers.get(h), a.headers.get(h), `${alias} ${h}`));
    // eslint-disable-next-line no-await-in-loop
    assert.equal(await b.text(), await a.text(), alias);
  }
  const tmc = await get('/api/content/graphql/execute.json/Ancillary-on-TMC/tmc-translations;path=/content/dam/lufthansa-group/ancillary/tmc/tmc-web-translations/tmc-translations;variation=master');
  assert.equal(tmc.status, 200);
  assert.equal(tmc.headers.get('cache-control'), 'public, max-age=120');
  assert.ok(Object.keys((await tmc.json()).data).length);
  // CORS and the preflight as on /graphql
  const pre = await worker.fetch(new Request('https://lh-edge.example/api/content/graphql/execute.json/AllegrisUpgrade/AllegrisAircraftsList', { method: 'OPTIONS', headers: { origin: 'https://www.lufthansa.com' } }), env, {});
  assert.equal(pre.status, 204);
  assert.equal(pre.headers.get('access-control-allow-origin'), 'https://www.lufthansa.com');
  assert.equal(graphqlPath('/api/content/graphql/execute.json/a/b;x=1'), '/graphql/execute.json/a/b;x=1');
  assert.equal(graphqlPath('/api/content/other'), '/api/content/other');
  assert.equal(parseQueryPath('/api/content/graphql/execute.json/BenefitCard/BenefitItemsList;airline=LH').query, 'BenefitItemsList');
});

test('graphql: path variables with %2F as with /, encoded values, limit', async () => {
  const a = await (await get('/graphql/execute.json/BenefitCard/BenefitItemsList;langPath=%2Fcontent%2Fdam%2Flufthansa-group%2Fancillary%2Fupgrade%2Fbenefitcard%2Fbenefititems%2Fen;airline=LH')).json();
  assert.equal(a.data.benefititemList.items.length, 14);
  assert.deepEqual(parseQueryPath('/graphql/execute.json/mobileapp/getStartPopupEarlyAccess;locale=en;to=2026-10-25T20%3A00%3A00.000%2B01%3A00').vars, { locale: 'en', to: '2026-10-25T20:00:00.000+01:00' });
  assert.equal(parseQueryPath('/graphql/execute.json/Message-Center/CTI%20Pages%20for%20tenants').query, 'CTI Pages for tenants');
  const l = await (await get('/graphql/execute.json/mobileapp/whatsnewList;locale=en;limit=2;client=mobile-app:ios')).json();
  assert.equal(l.data.whatsnewList.items.length, 2);
});

test('graphql: CORS allowlist (group domains and subdomains, lh-com hosts, localhost)', async () => {
  assert.equal(allowedOrigin('https://www.swiss.com', env.CORS_ORIGINS), true);
  assert.equal(allowedOrigin('https://lufthansa.com', env.CORS_ORIGINS), true);
  assert.equal(allowedOrigin('https://evil-lufthansa.com', env.CORS_ORIGINS), false);
  assert.equal(allowedOrigin('http://www.lufthansa.com', env.CORS_ORIGINS), false);
  assert.equal(allowedOrigin('https://main--lh-com--moved-permanently.aem.page', env.CORS_ORIGINS), true);
  assert.equal(allowedOrigin('http://localhost:8080', env.CORS_ORIGINS), true);
  const r = await get('/graphql/execute.json/B2BNeo/getAllFooterLogos', { origin: 'https://www.austrian.com' });
  assert.equal(r.headers.get('access-control-allow-origin'), null);
  const ok = await get('/graphql/execute.json/B2BNeo/getAllFooterLogos', { origin: 'https://www.lufthansa.com' });
  assert.equal(ok.headers.get('access-control-allow-origin'), 'https://www.lufthansa.com');
  const pre = await worker.fetch(new Request('https://lh-edge.example/graphql/execute.json/B2BNeo/getAllFooterLogos', { method: 'OPTIONS', headers: { origin: 'https://www.lufthansa.com' } }), env, {});
  assert.equal(pre.status, 204);
});

test('daform: the form editor format as EDS renders it (nested blocks, lists, types)', () => {
  const html = '<div class="da-form"><div><div><h3 id="title">title</h3></div><div>x</div></div><div><div><h3 id="x-schema-name">x-schema-name</h3></div><div>lh-test</div></div></div>'
    + '<div class="lh-test"><div><div><h3>name</h3></div><div>A &amp; B</div></div><div><div><h3>enabled</h3></div><div>true</div></div><div><div><h3>list</h3></div><div><ul><li>self://#list-abc</li></ul></div></div><div><div><h3>tags</h3></div><div><ul><li>x</li><li>y</li></ul></div></div></div>'
    + '<div class="list list-abc"><div><div><h3>k</h3></div><div><p>v</p></div></div></div>';
  assert.deepEqual(readDaForm(html, { enabled: 'boolean' }), {
    metadata: { title: 'x', schemaName: 'lh-test' },
    data: {
      name: 'A & B', enabled: true, list: [{ k: 'v' }], tags: ['x', 'y'],
    },
  });
});
