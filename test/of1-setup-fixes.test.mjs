/* eslint-disable max-len */
/* Three fixes from OF1's setup:
   - /of1 (at the site root) gets the de/en locale, as an English page (the fare widgets of its
     generated pages: English labels and conditions); every other path's locale as before.
   - the lh-com tenant's of1.live hosts (main--lh-com--moved-permanently.of1.live and its prev--
     preview) are demo hosts for the widgets (scripts/lh-data.js): /service/api from www in the
     browser as on our hosts, not same-origin (no prices there). Nothing else treats them as demo
     hosts (scripts/demo.js unchanged).
   - on *.of1.live OF1's banner governs consent: our OneTrust banner does not load there.
   Run: node --max-old-space-size=512 --test test/of1-setup-fixes.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const store = () => {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), clear: () => m.clear(),
  };
};
const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
const at = (hostname, pathname = '/of1') => {
  window.location = {
    hostname, pathname, search: '', hash: '', href: `https://${hostname}${pathname}`, origin: `https://${hostname}`,
  };
};
at('main--lh-com--moved-permanently.of1.live');
window.sessionStorage = store();
window.localStorage = store();
Object.defineProperty(window, 'origin', { value: 'https://main--lh-com--moved-permanently.of1.live', configurable: true });
globalThis.window = window;
globalThis.document = document;
globalThis.CustomEvent = window.CustomEvent;
const { getLocale } = await import('../scripts/locale.js');
const { lhFetch, isWidgetDemoHost } = await import('../scripts/lh-data.js');
const { isDemoHost } = await import('../scripts/demo.js');
const { initConsent } = await import('../scripts/consent.js');

test('/of1: the de/en locale; other paths as before', () => {
  ['/of1', '/of1/', '/content/of1'].forEach((p) => {
    const locale = getLocale(p);
    assert.equal(locale.key, 'de/en', p);
    assert.equal(locale.lang, 'en', p);
    assert.equal(locale.country, 'de', p);
  });
  assert.equal(getLocale('/content/of1').base, '/content/de/en');
  assert.equal(getLocale('/of1').base, '/de/en');
  ['/', '/index', '/of1x', '/of10', '/x/of1', '/of1/page'].forEach((p) => assert.equal(getLocale(p).key, 'de/de', p));
  assert.equal(getLocale('/gb/en/homepage').key, 'gb/en');
  assert.equal(getLocale('/de/de/of1').key, 'de/de');
});

test('the tenant\'s of1.live hosts are demo hosts for the widgets only', () => {
  ['main--lh-com--moved-permanently.of1.live', 'prev--main--lh-com--moved-permanently.of1.live', 'MAIN--lh-com--moved-permanently.of1.live'].forEach((h) => {
    assert.equal(isWidgetDemoHost(h), true, h);
    assert.equal(isDemoHost(h), false, `${h}: not a demo host elsewhere`);
  });
  ['main--lh-ita--moved-permanently.of1.live', 'other.of1.live', 'main--lh-com--moved-permanently.of1.live.evil.example', 'www.lufthansa.com'].forEach((h) => assert.equal(isWidgetDemoHost(h), false, h));
  ['lufthansa.turnsthe.page', 'main--lh-com--moved-permanently.aem.page', 'localhost'].forEach((h) => assert.equal(isWidgetDemoHost(h), true, h));
});

test('on the tenant\'s of1.live host a widget calls www (as on our hosts), not the same origin', async () => {
  at('main--lh-com--moved-permanently.of1.live', '/of1');
  const calls = [];
  globalThis.fetch = async (url) => {
    calls.push(String(url));
    return Response.json({ ok: true });
  };
  await lhFetch('/service/api/labels/flightmanager', { market: 'de/en' }).catch(() => {});
  assert.ok(calls.length >= 1);
  assert.ok(calls.some((u) => u.startsWith('https://www.lufthansa.com/service/api/labels/flightmanager')), calls.join());
  assert.ok(!calls.some((u) => u.startsWith('/service/api/')), 'not the same origin');
  delete globalThis.fetch;
});

test('on *.of1.live our OneTrust banner does not load (OF1\'s governs); the page announces necessary only', () => {
  at('main--lh-com--moved-permanently.of1.live', '/of1');
  const events = [];
  window.addEventListener('consent.update', (e) => events.push(e.detail));
  initConsent();
  assert.equal(document.querySelectorAll('script').length, 0, 'no OneTrust stub');
  assert.deepEqual(events.map((e) => [e.groups, e.source]), [[['C0001'], 'of1-host']]);
});
