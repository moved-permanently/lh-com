/* Cargo's newsletter form (Dynamics 365 Customer Insights) behind the site flag newsletter-form,
   as www.lufthansa-cargo.com/en/ci/newsletter embeds it (2026-11-01, before Usercentrics, no
   consent wait): a div with data-form-id, data-form-api-url and data-cached-form-url (the block's
   rows, from www's markup) and FormLoader.bundle.js (the brand's script) with the page's nonce.
   The block's link to www's form until the form is there; Dynamics' refusal box (a host it doesn't
   allow) leaves the link. Off, rows that aren't a Dynamics form, another brand: nothing loaded.
   Run: node --max-old-space-size=512 --test test/embed-newsletter-form.test.mjs */
/* global globalThis */
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.hlx = { codeBasePath: '' };
window.location = {
  hostname: 'main--lh-cargo--moved-permanently.aem.page', pathname: '/en/ci/newsletter', search: '', replace: () => {}, href: 'https://main--lh-cargo--moved-permanently.aem.page/en/ci/newsletter', origin: 'https://main--lh-cargo--moved-permanently.aem.page',
};
window.origin = window.location.origin;
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
globalThis.window = window;
globalThis.document = document;
globalThis.MutationObserver = window.MutationObserver;

const LOADER = 'https://cxppusa1formui01cdnsa01-endpoint.azureedge.net/eur/FormLoader/FormLoader.bundle.js';
const FORM = {
  id: 'e6c5cd32-425b-f011-bec1-6045bd8f3223',
  api: 'https://public-eur.mkt.dynamics.com/api/v1.0/orgs/e3f06c9e-19c7-4f62-ac5a-46806cf88b17/landingpageforms',
  cached: 'https://assets-eur.mkt.dynamics.com/e3f06c9e-19c7-4f62-ac5a-46806cf88b17/digitalassets/forms/e6c5cd32-425b-f011-bec1-6045bd8f3223',
};
let flagRows;
beforeEach(async () => {
  flagRows = [{ flag: 'newsletter-form', value: 'on' }];
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
const loaders = () => [...document.querySelectorAll('script[src*="FormLoader"]')];
const { BRANDS } = await import('../scripts/brands.js');
const { default: decorate } = await import('../blocks/newsletter-form/newsletter-form.js');

const formBlock = (form = FORM) => {
  const block = document.createElement('div');
  block.className = 'newsletter-form';
  block.innerHTML = `
    <div><div>Form ID</div><div>${form.id}</div></div>
    <div><div>Form API URL</div><div>${form.api}</div></div>
    <div><div>Cached Form URL</div><div>${form.cached}</div></div>
    <div><div><p><a href="https://www.lufthansa-cargo.com/en/ci/newsletter">Go to the form on www.lufthansa-cargo.com</a></p></div></div>`;
  document.querySelector('main').append(block);
  return block;
};

test('brands.js: Cargo\'s form loader, no other brand has one', () => {
  assert.deepEqual(BRANDS.cargo.embeds['newsletter-form'], { script: LOADER, formHost: '.mkt.dynamics.com' });
  Object.entries(BRANDS).filter(([k]) => k !== 'cargo').forEach(([k, b]) => assert.ok(!(b.embeds && b.embeds['newsletter-form']), k));
});

test('flag off: the link to www\'s form only, the settings rows hidden, nothing loaded', async () => {
  flagRows = [{ flag: 'newsletter-form', value: 'off' }];
  const block = formBlock();
  await decorate(block);
  await sleep(20);
  assert.equal(loaders().length, 0);
  assert.equal(block.querySelector('[data-form-id]'), null);
  assert.equal(block.textContent.includes(FORM.id), false, 'no settings shown');
  assert.equal(block.querySelector('.newsletter-form-fallback a').getAttribute('href'), 'https://www.lufthansa-cargo.com/en/ci/newsletter');
});

test('flag on: www\'s container and loader with the page\'s nonce; the form replaces the link', async () => {
  const block = formBlock();
  await decorate(block);
  await sleep(20);
  const box = block.querySelector('[data-form-id]');
  assert.equal(box.getAttribute('data-form-id'), FORM.id);
  assert.equal(box.getAttribute('data-form-api-url'), FORM.api);
  assert.equal(box.getAttribute('data-cached-form-url'), FORM.cached);
  assert.equal(loaders().length, 1);
  assert.equal(loaders()[0].getAttribute('src'), LOADER);
  assert.equal(loaders()[0].getAttribute('nonce'), 'n0nce-lcag');
  const fallback = block.querySelector('.newsletter-form-fallback');
  assert.ok(!fallback.hasAttribute('hidden'), 'the link until the form is there');
  // Dynamics' refusal box on a host it doesn't allow: the link stays
  box.innerHTML = '<div class="msg">This domain hasn\'t been allowed for external form hosting</div>';
  await sleep(20);
  assert.ok(!fallback.hasAttribute('hidden'));
  assert.ok(box.hasAttribute('hidden'), 'the refusal box is not shown');
  box.innerHTML = '<div><form class="marketingForm"><input name="emailaddress1"></form></div>';
  await sleep(20);
  assert.ok(fallback.hasAttribute('hidden'), 'the form replaces the link');
  assert.ok(!box.hasAttribute('hidden'));
  // Dynamics shows the cached form first, then its refusal box on a host it doesn't allow (seen
  // locally): the link comes back
  box.innerHTML = '<div class="msg">The form can not be loaded on a domain that hasn\'t been allowed for external form hosting</div>';
  await sleep(20);
  assert.ok(!fallback.hasAttribute('hidden'), 'the link is back');
  assert.ok(box.hasAttribute('hidden'));
});

test('flag on, the loader fails: no container, the link stays', async () => {
  const block = formBlock();
  await decorate(block);
  await sleep(20);
  loaders()[0].dispatchEvent(new window.Event('error'));
  await sleep(20);
  assert.equal(block.querySelector('[data-form-id]'), null);
  assert.ok(!block.querySelector('.newsletter-form-fallback').hasAttribute('hidden'));
});

test('flag on, rows that are not a Dynamics form: nothing loaded', async () => {
  const bad = [
    { ...FORM, api: 'https://evil.example.com/api/v1.0/orgs/x/landingpageforms' },
    { ...FORM, cached: 'http://assets-eur.mkt.dynamics.com/x' },
    { ...FORM, id: 'not-a-form-id' },
  ];
  await Promise.all(bad.map(async (form) => {
    const block = formBlock(form);
    await decorate(block);
  }));
  await sleep(20);
  assert.equal(loaders().length, 0);
  assert.equal(document.querySelectorAll('[data-form-id]').length, 0);
});

test('another brand: nothing loaded', async () => {
  document.querySelector('meta[name="brand"]').setAttribute('content', 'airdolomiti');
  const block = formBlock();
  await decorate(block);
  await sleep(20);
  assert.equal(loaders().length, 0);
});
