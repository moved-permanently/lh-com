/* A brand page's tenant through lh-proxy and in the recordings (scripts/lh-data.js): the proxy
   request carries the brand's X-Portal, X-Portal-Site and X-Portal-Language (lh-proxy forwards
   them to www), lh-com's carries none, as before; the recorded fallback takes the answer
   recorded for the page's portal ("OS:at/de|GET ..."), else the lookup lh-com pages use, and an
   lh-com page never takes a brand's recording.
   Run: node --max-old-space-size=512 --test test/lh-data-portal.test.mjs */
/* global globalThis */
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const store = () => {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
    clear: () => m.clear(),
  };
};
const { window } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.location = {
  hostname: 'austrian.turnsthe.page', pathname: '/at/de/homepage', search: '', href: 'https://austrian.turnsthe.page/at/de/homepage', origin: 'https://austrian.turnsthe.page',
};
window.sessionStorage = store();
window.localStorage = store();
globalThis.window = window;
const { lhFetch, PROXY_ORIGIN } = await import('../scripts/lh-data.js');

async function onPage(meta, fn) {
  const rows = Object.entries(meta).map(([k, v]) => `<meta name="${k}" content="${v}">`).join('');
  const { document } = parseHTML(`<!DOCTYPE html><html><head>${rows}</head><body></body></html>`);
  globalThis.document = document;
  try {
    return await fn();
  } finally {
    delete globalThis.document;
  }
}

const POI = '/service/secured/api/pointsOfInterest/FRA';
const RECOMMEND = '/service/api/lhg-fare-teaser/fareteaser/recommendations/VIE';
// the module keeps the index it fetched first: one index for every test
const entries = {
  [`at/de|GET ${POI}`]: { file: 'at-de-lh.json', recordedAt: '2026-10-21T00:00:00Z' },
  [`OS:at/de|GET ${POI}`]: { file: 'os-at-de-aua.json', recordedAt: '2026-10-31T00:00:00Z' },
  'OS:at/en|GET /service/secured/api/pointsOfInterest/MUC': { file: 'os-at-en-muc.json', recordedAt: '2026-10-31T00:00:00Z' },
  'de/en|GET /service/secured/api/pointsOfInterest/ZRH': { file: 'de-en-zrh.json', recordedAt: '2026-10-21T00:00:00Z' },
};
let calls;
beforeEach(() => {
  window.sessionStorage.clear();
  calls = [];
  globalThis.fetch = async (url, init = {}) => {
    const href = String(url);
    if (href === '/data/recorded/index.json') return new Response(JSON.stringify({ entries }));
    if (href.startsWith('/data/recorded/')) return new Response(JSON.stringify({ file: href.split('/').pop() }));
    calls.push({ href, headers: init.headers || {} });
    return new Response('{"live":1}', { status: 200, headers: { 'content-type': 'application/json' } });
  };
});

test('the proxy request of a brand page carries its portal; lh-com\'s none', async () => {
  await onPage({ brand: 'austrian' }, () => lhFetch(RECOMMEND, { market: 'at/de' }));
  const [aua] = calls;
  assert.ok(aua.href.startsWith(PROXY_ORIGIN));
  assert.equal(aua.headers['X-Portal'], 'OS');
  assert.equal(aua.headers['X-Portal-Site'], 'AT');
  assert.equal(aua.headers['X-Portal-Language'], 'de');
  assert.equal(aua.headers['X-LH-Market'], 'at/de');
  assert.equal(aua.headers['X-Portal-Taxonomy'], undefined, 'only the three lh-proxy forwards');

  await onPage({}, () => lhFetch(RECOMMEND, { market: 'at/de' }));
  assert.deepEqual(Object.keys(calls[1].headers).sort(), ['Accept', 'Accept-Language', 'X-LH-Market']);
});

test('recorded answers: the portal\'s when one exists, else today\'s; never a brand\'s on lh-com', async () => {
  const file = async (meta, route, market) => {
    const { data } = await onPage(meta, () => lhFetch(route, { market }));
    return data.file;
  };

  assert.equal(await file({ brand: 'austrian' }, POI, 'at/de'), 'os-at-de-aua.json', 'recorded for OS in at/de');
  assert.equal(await file({}, POI, 'at/de'), 'at-de-lh.json', 'lh-com: its own, as before');
  // the portal's recording of the same request in another of its roots comes before lh-com's
  assert.equal(await file({ brand: 'austrian' }, '/service/secured/api/pointsOfInterest/MUC', 'at/de'), 'os-at-en-muc.json');
  // nothing recorded for OS: today's lookup (the same request in any lh-com market)
  assert.equal(await file({ brand: 'austrian' }, '/service/secured/api/pointsOfInterest/ZRH', 'at/de'), 'de-en-zrh.json');
  // an lh-com page does not take OS's recording of a request lh-com has none of
  await assert.rejects(onPage({}, () => lhFetch('/service/secured/api/pointsOfInterest/MUC', { market: 'de/en' })));
  // another brand (Discover, FOUR_Y) does not take OS's
  await assert.rejects(onPage({ brand: 'discover' }, () => lhFetch('/service/secured/api/pointsOfInterest/MUC', { market: 'de/en' })));
});
