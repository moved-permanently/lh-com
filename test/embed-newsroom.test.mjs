/* Cargo's newsroom (Mynewsdesk) behind the site flag newsroom (brief 422), as
   www.lufthansa-cargo.com/<ll>/ci/newsroom embeds it: a #mnd-script element and the newsroom's
   own hosted_newsroom.js (its host from the block, one of the brand's hosts), which writes the
   newsroom's iframe after #mnd-script and sizes it; only with the visitor's consent to third-party
   content (C0005, as www waits for its consent manager). Until then, and with the flag off, an
   unknown host or another brand: the link to the newsroom on Mynewsdesk, nothing loaded; a
   withdrawn consent takes the newsroom away again.
   Run: node --max-old-space-size=512 --test test/embed-newsroom.test.mjs */
/* global globalThis */
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.hlx = { codeBasePath: '' };
window.location = {
  hostname: 'main--lh-cargo--moved-permanently.aem.page', pathname: '/en/ci/newsroom', search: '', hash: '', replace: () => {}, href: 'https://main--lh-cargo--moved-permanently.aem.page/en/ci/newsroom', origin: 'https://main--lh-cargo--moved-permanently.aem.page',
};
window.origin = window.location.origin;
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
globalThis.window = window;
globalThis.document = document;
globalThis.CustomEvent = window.CustomEvent;
globalThis.MutationObserver = window.MutationObserver;

const EN = 'lufthansa-cargo-ag-com.mynewsdesk.com';
const DE = 'lufthansa-cargo-ag.mynewsdesk.com';
let flagRows;
beforeEach(async () => {
  flagRows = [{ flag: 'newsroom', value: 'on' }];
  globalThis.fetch = async (url) => {
    if (String(url) === '/config/flags.json' && flagRows) {
      return new Response(JSON.stringify({ data: flagRows }), { headers: { 'content-type': 'application/json' } });
    }
    return new Response('', { status: 404 });
  };
  (await import('../scripts/flags.js')).resetFlags();
  document.head.innerHTML = '<meta name="brand" content="cargo"><script nonce="n0nce-lcag" src="/scripts/scripts.js" type="module"></script>';
  document.body.innerHTML = '<main></main>';
});

const sleep = (ms) => new Promise((r) => { setTimeout(r, ms); });
const scripts = () => [...document.querySelectorAll('script[src*="hosted_newsroom.js"]')];
const consent = (groups) => window.dispatchEvent(new window.CustomEvent('consent.update', { detail: { consented: groups.length > 1, groups, source: 'fallback' } }));
const { BRANDS } = await import('../scripts/brands.js');
const { default: decorate } = await import('../blocks/newsroom/newsroom.js');

const newsroom = (host = EN) => {
  const block = document.createElement('div');
  block.className = 'newsroom';
  block.innerHTML = `
    <div><div>Newsroom</div><div><a href="https://${host}">https://${host}</a></div></div>
    <div><div><p><a href="https://${host}">Lufthansa Cargo newsroom on Mynewsdesk</a></p></div></div>`;
  document.querySelector('main').append(block);
  return block;
};

test('brands.js: Cargo\'s newsroom hosts (www\'s English and German newsrooms) and the consent it waits for; no other brand has one', () => {
  assert.deepEqual(BRANDS.cargo.embeds.newsroom, { hosts: [EN, DE], script: '/hosted_newsroom.js', consent: 'C0005' });
  Object.entries(BRANDS).filter(([k]) => k !== 'cargo').forEach(([k, b]) => assert.ok(!(b.embeds && b.embeds.newsroom), k));
});

test('flag off: the link to the newsroom only, its settings row hidden, nothing loaded', async () => {
  flagRows = [{ flag: 'newsroom', value: 'off' }];
  const block = newsroom();
  await decorate(block);
  await sleep(20);
  consent(['C0001', 'C0002', 'C0004', 'C0005']);
  await sleep(20);
  assert.equal(scripts().length, 0);
  assert.equal(block.querySelector('#mnd-script'), null);
  assert.equal(block.querySelector('.newsroom-fallback a').getAttribute('href'), `https://${EN}`);
  assert.equal(block.textContent.includes('Newsroom\n'), false);
});

test('flag on, no consent yet: the link; once the visitor accepts third-party content, www\'s #mnd-script and the newsroom\'s script with the page\'s nonce', async () => {
  const block = newsroom();
  await decorate(block);
  await sleep(20);
  assert.equal(scripts().length, 0, 'no consent: nothing loaded');
  consent(['C0001', 'C0002']);
  await sleep(20);
  assert.equal(scripts().length, 0, 'statistics only: nothing loaded');
  consent(['C0001', 'C0002', 'C0004', 'C0005']);
  await sleep(20);
  assert.equal(scripts().length, 1);
  const [script] = scripts();
  assert.equal(script.getAttribute('src'), `https://${EN}/hosted_newsroom.js`);
  assert.equal(script.getAttribute('nonce'), 'n0nce-lcag');
  const holder = block.querySelector('#mnd-script');
  assert.ok(holder, 'the element the newsroom\'s iframe goes after');
  // Mynewsdesk's script writes its iframe after #mnd-script: the link goes then
  const iframe = document.createElement('iframe');
  iframe.id = 'mnd-iframe';
  holder.after(iframe);
  await sleep(20);
  assert.equal(block.querySelector('.newsroom-fallback').hasAttribute('hidden'), true);
  // a withdrawn consent: the newsroom goes, the link comes back
  consent(['C0001']);
  await sleep(20);
  assert.equal(block.querySelector('#mnd-iframe'), null);
  assert.equal(block.querySelector('.newsroom-fallback').hasAttribute('hidden'), false);
});

test('the German newsroom from the German page\'s block; a host that is not the brand\'s: nothing loaded', async () => {
  const de = newsroom(DE);
  await decorate(de);
  await sleep(20);
  consent(['C0001', 'C0005']);
  await sleep(20);
  assert.deepEqual(scripts().map((s) => s.getAttribute('src')), [`https://${DE}/hosted_newsroom.js`]);
  document.body.innerHTML = '<main></main>';
  const other = newsroom('evil.mynewsdesk.com');
  await decorate(other);
  await sleep(20);
  consent(['C0001', 'C0005']);
  await sleep(20);
  assert.equal(scripts().length, 0);
  assert.equal(other.querySelector('.newsroom-fallback a').getAttribute('href'), 'https://evil.mynewsdesk.com');
});

test('another brand: nothing loaded, the link stays', async () => {
  document.head.innerHTML = '<meta name="brand" content="ita">';
  const block = newsroom();
  await decorate(block);
  await sleep(20);
  consent(['C0001', 'C0005']);
  await sleep(20);
  assert.equal(scripts().length, 0);
  assert.ok(block.querySelector('.newsroom-fallback a'));
});
