/* eslint-disable max-len */
/* The brief after 595, item 3: Austrian's in-flight entertainment film carousel (www's unterhaltung-an-bord pages, ten
   languages, embed www.austrian-inflightentertainment.com/external-widgets?id=12441&type=film-carousel in a 520 px iframe)
   behind the site flag austrian-ife-carousel in lh-austrian's flags sheet: no row = off = today's page (the import's link
   "Carousel" to the page on www); on: the iframe in that paragraph's place; never another page. The same embed code as
   Brussels' payment picker (scripts/site-embeds.js linkOutEmbed).
   Run: node --max-old-space-size=512 --test test/embed-austrian-ife-carousel-595.test.mjs */
/* global globalThis */
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.hlx = { codeBasePath: '' };
const at = (pathname) => {
  window.location = {
    hostname: 'main--lh-austrian--moved-permanently.aem.page', pathname, search: '', replace: () => {}, href: `https://main--lh-austrian--moved-permanently.aem.page${pathname}`, origin: 'https://main--lh-austrian--moved-permanently.aem.page',
  };
};
at('/');
window.origin = window.location.origin;
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
globalThis.window = window;
globalThis.document = document;

const PAGE = '/at/de/unterhaltung-an-bord';
let flagRows;
const page = (pathname) => {
  at(pathname);
  document.head.innerHTML = '<meta name="brand" content="austrian"><meta name="language" content="de">';
  document.body.innerHTML = `<main><div><h2>Unsere Highlights</h2><p><strong><a href="https://www.austrian-inflightentertainment.com/de/">Programm entdecken</a></strong></p><p><a href="https://www.austrian.com${pathname}">Carousel</a></p></div></main>`;
};
beforeEach(async () => {
  flagRows = null;
  globalThis.fetch = async (url) => {
    if (String(url) === '/config/flags.json' && flagRows) return new Response(JSON.stringify({ data: flagRows }), { headers: { 'content-type': 'application/json' } });
    return new Response('', { status: 404 });
  };
  (await import('../scripts/flags.js')).resetFlags();
});

const { BRANDS } = await import('../scripts/brands.js');
const { default: loadSiteEmbeds } = await import('../scripts/site-embeds.js');
const CFG = BRANDS.austrian.embeds['austrian-ife-carousel'];
const frames = () => [...document.querySelectorAll('main iframe')];

test('brands.js: the widget, 520 px, the page it belongs on, www\'s host', () => {
  assert.equal(CFG.src, 'https://www.austrian-inflightentertainment.com/external-widgets?id=12441&type=film-carousel&lang=de');
  assert.equal(CFG.height, 520);
  assert.equal(CFG.path, '/unterhaltung-an-bord');
  assert.equal(CFG.www, 'www.austrian.com');
});

test('no row, or off: the link stays, no iframe', async () => {
  for (const rows of [null, [{ flag: 'austrian-ife-carousel', value: 'off' }], [{ flag: 'brussels-payment-picker', value: 'on' }]]) {
    flagRows = rows;
    (await import('../scripts/flags.js')).resetFlags();
    page(PAGE);
    await loadSiteEmbeds();
    assert.equal(frames().length, 0);
    assert.ok([...document.querySelectorAll('main a')].some((a) => a.textContent === 'Carousel'));
  }
});

test('the flag on: the iframe in the link\'s place, 520 px; the programme link stays', async () => {
  flagRows = [{ flag: 'austrian-ife-carousel', value: 'on' }];
  page(PAGE);
  await loadSiteEmbeds();
  const f = frames();
  assert.equal(f.length, 1);
  assert.equal(f[0].getAttribute('src'), CFG.src);
  assert.equal(f[0].getAttribute('height'), '520');
  assert.ok(![...document.querySelectorAll('main a')].some((a) => a.textContent === 'Carousel'));
  assert.ok([...document.querySelectorAll('main a')].some((a) => a.textContent === 'Programm entdecken'));
});

test('the flag on, another page: nothing', async () => {
  flagRows = [{ flag: 'austrian-ife-carousel', value: 'on' }];
  page('/at/de/flynet');
  await loadSiteEmbeds();
  assert.equal(frames().length, 0);
});
