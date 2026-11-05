/* The group's one Message Center store (scripts/message-store.js): the brand sites with a Message
   Center tenant (SWISS lx, Austrian os, Brussels sn, ITA ita, Discover four_y, B2B b2b) read the
   index, the CTI sheet and the details pages from the store. On their own Edge Delivery hosts
   (main--lh-swiss--moved-permanently.aem.page, .aem.live, branch previews) that is the store's
   host of the same kind, cross-origin (the store sends access-control-allow-origin: * on
   /message-center/**); on every other host (the .turnsthe.page hosts, where lh-edge answers the
   same paths from the store, localhost) the same-origin path as before. lh-com itself (tenant lh,
   no brand) and the sites with a source of their own (TAP, Air Dolomiti, Cargo) as before.
   Run: node --max-old-space-size=512 --test test/message-store.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.hlx = { codeBasePath: '' };
const at = (origin, pathname, meta = {}) => {
  const { hostname } = new URL(origin);
  window.location = {
    hostname, pathname, search: '', hash: '', replace: () => {}, href: `${origin}${pathname}`, origin,
  };
  document.head.innerHTML = Object.entries(meta).map(([k, v]) => `<meta name="${k}" content="${v}">`).join('');
};
at('https://main--lh-com--moved-permanently.aem.page', '/de/en/homepage');
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
globalThis.window = window;
globalThis.document = document;

const {
  MESSAGE_STORE, STORE_TENANTS, storeHost, storeBase,
} = await import('../scripts/message-store.js');
const { BRANDS } = await import('../scripts/brands.js');

const STORE_PAGE = 'https://main--lh-com--moved-permanently.aem.page';
const STORE_LIVE = 'https://main--lh-com--moved-permanently.aem.live';

test('the store is lh-com on its owner, in one place', () => {
  assert.deepEqual(MESSAGE_STORE, { site: 'lh-com', owner: 'moved-permanently' });
  assert.equal(storeHost('live'), 'main--lh-com--moved-permanently.aem.live');
  assert.equal(storeHost('page'), 'main--lh-com--moved-permanently.aem.page');
  assert.equal(storeHost(), 'main--lh-com--moved-permanently.aem.live');
});

test('the store tenants: the brand sites with a Message Center tenant on www, not lh-com\'s nor the own-source sites\'', () => {
  ['swiss', 'austrian', 'brussels', 'ita', 'discover', 'b2b'].forEach((b) => {
    assert.ok(STORE_TENANTS.includes(BRANDS[b].messageCenter), b);
  });
  ['tap', 'airdolomiti', 'cargo'].forEach((b) => {
    assert.ok(!STORE_TENANTS.includes(BRANDS[b].messageCenter), b);
  });
  assert.ok(!STORE_TENANTS.includes('lh'));
});

test('storeBase: a brand site\'s aem.page reads the store\'s aem.page, its aem.live the store\'s aem.live', () => {
  const cases = [
    ['main--lh-swiss--moved-permanently.aem.page', 'lx', STORE_PAGE],
    ['main--lh-swiss--moved-permanently.aem.live', 'lx', STORE_LIVE],
    ['main--lh-austrian--moved-permanently.aem.page', 'os', STORE_PAGE],
    ['main--lh-brussels--moved-permanently.aem.live', 'sn', STORE_LIVE],
    ['main--lh-ita--moved-permanently.aem.live', 'ita', STORE_LIVE],
    ['main--lh-discover--moved-permanently.aem.page', 'four_y', STORE_PAGE],
    ['main--lh-b2b--moved-permanently.aem.live', 'b2b', STORE_LIVE],
    // a branch preview of a brand site: the store's main
    ['parity-fix--lh-swiss--moved-permanently.aem.page', 'lx', STORE_PAGE],
    ['MAIN--LH-SWISS--MOVED-PERMANENTLY.AEM.PAGE', 'lx', STORE_PAGE],
  ];
  cases.forEach(([host, tenant, want]) => assert.equal(storeBase(host, tenant), want, `${host} ${tenant}`));
});

test('storeBase: same origin everywhere else (lh-edge\'s hosts, lh-com\'s own hosts, own-source tenants, local)', () => {
  const cases = [
    ['swiss.turnsthe.page', 'lx'],
    ['austrian-cn.turnsthe.page', 'os'],
    ['localhost', 'lx'],
    ['main--lh-com--moved-permanently.aem.page', 'lh'],
    ['main--lh-com--moved-permanently.aem.live', 'lx'],
    ['feature--lh-com--moved-permanently.aem.page', 'os'],
    ['main--lh-tap--moved-permanently.aem.live', 'tap'],
    ['main--lh-airdolomiti--moved-permanently.aem.page', 'airdolomiti'],
    ['main--lh-cargo--moved-permanently.aem.live', 'cargo'],
    ['main--lh-flynet--moved-permanently.aem.page', 'lh'],
    ['main--lh-swiss--moved-permanently.aem.page', ''],
    ['main--lh-swiss--moved-permanently.example.com', 'lx'],
    ['', 'lx'],
  ];
  cases.forEach(([host, tenant]) => assert.equal(storeBase(host, tenant), '', `${host} ${tenant}`));
});

/** The Message Center module fresh for one page (it loads the index and sheet once per page). */
let n = 0;
async function page(origin, pathname, meta) {
  at(origin, pathname, meta);
  n += 1;
  return import(`../scripts/message-center.js?page=${n}`);
}
let calls;
const mockFetch = () => {
  calls = [];
  globalThis.fetch = async (url, init = {}) => {
    calls.push({ url: String(url), init });
    if (String(url).endsWith('.json')) return new Response(JSON.stringify({ data: [{ path: String(url) }] }), { headers: { 'content-type': 'application/json' } });
    return new Response('<div><p>Details <img src="./media_1234567890abcdef1234567890abcdef12345678.png"></p></div>', { headers: { 'content-type': 'text/html' } });
  };
};

test('SWISS on its aem.live: index, CTI sheet and details from the store\'s aem.live, without credentials; media from the store', async () => {
  mockFetch();
  const mc = await page('https://main--lh-swiss--moved-permanently.aem.live', '/ch/en/homepage', { brand: 'swiss' });
  await mc.loadIndex();
  await mc.loadCtiPages();
  const nodes = await mc.loadDetails('/message-center/details/information-on-flights-to-dubai/en');
  assert.deepEqual(calls.map((c) => c.url), [
    `${STORE_LIVE}/message-center/index.json`,
    `${STORE_LIVE}/message-center/config/cti-pages.json`,
    `${STORE_LIVE}/message-center/details/information-on-flights-to-dubai/en.plain.html`,
  ]);
  calls.forEach((c) => {
    assert.equal(c.init.cache, 'no-cache');
    assert.ok(!c.init.credentials || c.init.credentials === 'omit' || c.init.credentials === 'same-origin');
  });
  const img = nodes.map((x) => (x.querySelector ? x.querySelector('img') : null)).find(Boolean);
  assert.equal(img.src, `${STORE_LIVE}/message-center/details/information-on-flights-to-dubai/media_1234567890abcdef1234567890abcdef12345678.png`);
});

test('Austrian on its aem.page: the store\'s aem.page', async () => {
  mockFetch();
  const mc = await page('https://main--lh-austrian--moved-permanently.aem.page', '/at/de/homepage', { brand: 'austrian' });
  await mc.loadIndex();
  await mc.loadCtiPages();
  assert.deepEqual(calls.map((c) => c.url), [`${STORE_PAGE}/message-center/index.json`, `${STORE_PAGE}/message-center/config/cti-pages.json`]);
});

test('SWISS on swiss.turnsthe.page, lh-com on its aem.page, Air Dolomiti and Cargo on theirs: same-origin paths, as before', async () => {
  const cases = [
    ['https://swiss.turnsthe.page', '/ch/en/homepage', { brand: 'swiss' }],
    ['https://main--lh-com--moved-permanently.aem.page', '/de/en/homepage', {}],
    ['https://main--lh-airdolomiti--moved-permanently.aem.page', '/', { brand: 'airdolomiti' }],
    ['https://main--lh-tap--moved-permanently.aem.live', '/pt-pt', { brand: 'tap' }],
  ];
  for (const [origin, path, meta] of cases) { // eslint-disable-line no-restricted-syntax
    mockFetch();
    const mc = await page(origin, path, meta); // eslint-disable-line no-await-in-loop
    await mc.loadIndex(); // eslint-disable-line no-await-in-loop
    await mc.loadCtiPages(); // eslint-disable-line no-await-in-loop
    await mc.loadDetails('/message-center/details/x/en'); // eslint-disable-line no-await-in-loop
    assert.deepEqual(calls.map((c) => c.url), ['/message-center/index.json', '/message-center/config/cti-pages.json', '/message-center/details/x/en.plain.html'], origin);
  }
});

test('Cargo\'s notifications stay its own (same origin) on its aem.live', async () => {
  mockFetch();
  const mc = await page('https://main--lh-cargo--moved-permanently.aem.live', '/en/home', { brand: 'cargo' });
  await mc.loadNotifications();
  assert.deepEqual(calls.map((c) => c.url), ['/message-center/notifications.json']);
});
