/* eslint-disable max-len */
// Brand market roots answered from another root's own document (README "Market roots"): the
// brand importers put a page only market roots have (Austrian's, SWISS's and Brussels' black
// friday, Brussels' two reunion versions) on the first root that has it and list the other roots
// in its `markets` row. A root with neither its own document nor an allowed language-version one
// gets another root's own document of the same language whose `markets` lists it (the market
// index's markets column, helix-query.yaml market-pages), its links into that root rewritten to
// the requesting root where it has the page (and into the language version as every page's).
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import HTMLRewriter from './htmlrewriter-shim.mjs';
import worker from '../src/index.js';
import { resetMarketCache, listsRoot } from '../src/markets.js';

globalThis.HTMLRewriter = HTMLRewriter;

const LH = 'main--lh-com--moved-permanently.aem.live';
const AUSTRIAN = 'main--lh-austrian--moved-permanently.aem.live';
const env = () => ({
  ORIGIN: LH,
  WWW_HOST: 'www.lufthansa.com',
  PILOT_HOSTS: '',
  EDGE_TTL: '60',
  SITE_HOSTS: 'austrian.example=austrian',
  SITE_ORIGINS: `austrian=${AUSTRIAN}`,
  SITE_WWW_HOSTS: 'austrian=www.austrian.com',
  SITE_DESIGN_HOSTS: 'austrian=www.lufthansa.com',
});
const sheet = (data) => ({
  total: data.length, offset: 0, limit: 1000, data, ':type': 'sheet',
});
const row = (path, extra = {}) => ({
  path, title: path, markets: '', robots: '', 'primary-language-url': '', lastModified: '1793045388', ...extra,
});
const page = (path, body, markets = '') => `<!DOCTYPE html><html><head><title>${path}</title><link rel="canonical" href="https://${AUSTRIAN}${path}"><meta property="og:url" content="https://${AUSTRIAN}${path}">${markets ? `<meta name="markets" content="${markets}">` : ''}</head><body><main>${body}</main></body></html>`;
const BF = 'gb/en, bg/en, ge/en';
const FILES = {
  '/at/en/search-index.json': sheet([
    row('/at/en/homepage'),
    row('/at/en/baggage', { markets: 'gb/en, bg/en, xk/en' }),
  ]),
  '/at/de/search-index.json': sheet([row('/at/de/gepaeck')]),
  '/market-pages.json': sheet([
    row('/al/en/local-page/black-friday', { markets: BF }),
    row('/al/en/local-page/student-fares', { markets: 'gb/en' }),
    row('/al/en/local-page/only-al'),
    // a root's own document of the language version's path: the language version's page wins
    row('/al/en/baggage', { markets: 'gb/en' }),
    // Brussels' reunion: version A on bg/en, B on ge/en, each for its roots
    row('/bg/en/local-page/reunion', { markets: 'gb/en' }),
    row('/ge/en/local-page/reunion', { markets: 'xk/en, us/en' }),
    // a German root listed: not gb/en
    row('/al/en/local-page/german-only', { markets: 'gb/de' }),
  ]),
  '/at/en/homepage': page('/at/en/homepage', '<h1>at/en homepage</h1>'),
  '/at/en/baggage': page('/at/en/baggage', '<h1>Baggage</h1>'),
  '/al/en/baggage': page('/al/en/baggage', '<h1>al/en own baggage</h1>', 'gb/en'),
  '/al/en/local-page/black-friday': page('/al/en/local-page/black-friday', '<h1>Black Friday</h1><a href="/al/en/local-page/student-fares">Student fares</a> <a href="/al/en/local-page/only-al">Only al</a> <a href="/at/en/baggage">Baggage</a>', BF),
  '/al/en/local-page/student-fares': page('/al/en/local-page/student-fares', '<h1>Student fares</h1>', 'gb/en'),
  '/al/en/local-page/only-al': page('/al/en/local-page/only-al', '<h1>Only al</h1>'),
  '/bg/en/local-page/reunion': page('/bg/en/local-page/reunion', '<h1>Reunion A</h1>', 'gb/en'),
  '/ge/en/local-page/reunion': page('/ge/en/local-page/reunion', '<h1>Reunion B</h1><a href="/ge/en/local-page/reunion">B</a>', 'xk/en, us/en'),
  '/al/en/local-page/german-only': page('/al/en/local-page/german-only', '<h1>German</h1>', 'gb/de'),
};
let calls;
beforeEach(() => {
  resetMarketCache();
  calls = [];
  globalThis.fetch = async (input, init = {}) => {
    const req = input instanceof Request ? input : new Request(input, init);
    const u = new URL(req.url);
    calls.push(`${u.hostname}${u.pathname}`);
    if (u.hostname === AUSTRIAN) {
      const key = u.pathname.replace(/\.plain\.html$/, '');
      const f = FILES[u.pathname] || (u.pathname.endsWith('.plain.html') ? FILES[key] : undefined);
      if (f && typeof f === 'object') return Response.json(f);
      if (f && u.pathname.endsWith('.plain.html')) return new Response(f.match(/<main>([\s\S]*)<\/main>/)[1], { headers: { 'content-type': 'text/html; charset=utf-8' } });
      if (f) return new Response(f, { headers: { 'content-type': 'text/html; charset=utf-8' } });
    }
    return new Response('<html>404</html>', { status: 404, headers: { 'content-type': 'text/html' } });
  };
});
const get = (path, init) => worker.fetch(new Request(`https://austrian.example${path}`, init), env(), { waitUntil() {} });

test('listsRoot: a markets value lists a root by the root itself or its country; another language\'s root of the country does not', () => {
  assert.equal(listsRoot('al/en, gb/en', 'gb/en'), true);
  assert.equal(listsRoot('gb, de', 'gb/en'), true);
  assert.equal(listsRoot('gb/de', 'gb/en'), false);
  assert.equal(listsRoot('-gb', 'gb/en'), false);
  assert.equal(listsRoot('', 'gb/en'), false, 'an empty row lists none (the root\'s own page only)');
});

test('a root without the page gets the root\'s own document that lists it (black friday on al/en for gb/en), its links the requesting root\'s where it has the page', async () => {
  const resp = await get('/gb/en/local-page/black-friday');
  assert.equal(resp.status, 200);
  assert.equal(resp.headers.get('x-lh-edge-route'), 'market');
  const html = await resp.text();
  assert.match(html, /<h1>Black Friday<\/h1>/);
  assert.match(html, /href="\/gb\/en\/local-page\/student-fares"/, 'a page the donor lists gb/en for too');
  assert.match(html, /href="\/al\/en\/local-page\/only-al"/, 'a page gb/en does not have: the donor\'s');
  assert.match(html, /href="\/gb\/en\/baggage"/, 'into the language version as every page');
  assert.match(html, /<link rel="canonical" href="[^"]*\/gb\/en\/local-page\/black-friday"/);
  // the page's other listed roots too; not those it leaves out, nor another language's
  assert.equal((await get('/bg/en/local-page/black-friday')).status, 200);
  assert.equal((await get('/us/en/local-page/black-friday')).status, 404);
  assert.equal((await get('/ch/de/local-page/black-friday')).status, 404);
  // the donor answers from its own document, as before
  const own = await get('/al/en/local-page/black-friday');
  assert.equal(own.status, 200);
  assert.match(await own.text(), /href="\/al\/en\/local-page\/student-fares"/);
});

test('two versions of one page (Brussels\' reunion A and B): each root gets the one that lists it', async () => {
  assert.match(await (await get('/gb/en/local-page/reunion')).text(), /Reunion A/);
  const b = await (await get('/xk/en/local-page/reunion')).text();
  assert.match(b, /Reunion B/);
  assert.match(b, /href="\/xk\/en\/local-page\/reunion"/, 'its link to itself the requesting root\'s');
  assert.match(await (await get('/us/en/local-page/reunion')).text(), /Reunion B/);
  assert.equal((await get('/bg/en/local-page/reunion')).status, 200, 'A\'s own root');
});

test('an allowed language-version page wins over another root\'s document; a German root listed is not the English one; .plain.html and HEAD as the page', async () => {
  assert.match(await (await get('/gb/en/baggage')).text(), /<h1>Baggage<\/h1>/);
  assert.equal((await get('/gb/en/local-page/german-only')).status, 404);
  const plain = await get('/gb/en/local-page/black-friday.plain.html');
  assert.equal(plain.status, 200);
  assert.match(await plain.text(), /href="\/gb\/en\/local-page\/student-fares"/);
  const head = await get('/ge/en/local-page/black-friday', { method: 'HEAD' });
  assert.equal(head.status, 200);
});
