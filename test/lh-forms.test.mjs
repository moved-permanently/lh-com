/* The form block's bot check configuration (scripts/lh-forms.js): GET /config of lh-forms once
   per page, the site key and a tester's override. Run: node --test test/*.test.mjs */
/* global globalThis */
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  formsConfig, resetFormsConfig, turnstileSiteKey, FORMS_ENDPOINT, formIdFromPath,
} from '../scripts/lh-forms.js';

const store = () => {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
  };
};
// a demo host (scripts/demo.js): the demo forms worker and the tester overrides
globalThis.window = { localStorage: store(), location: { hostname: 'main--lh-com--moved-permanently.aem.page' } };

let calls;
let reply;
beforeEach(() => {
  resetFormsConfig();
  window.localStorage.removeItem('lh-forms');
  window.localStorage.removeItem('lh-forms-sitekey');
  calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), init });
    if (reply === 'network') throw new TypeError('fetch failed');
    return new Response(JSON.stringify(reply.body), { status: reply.status });
  };
});

test('forms config: read once from the worker, without cookies', async () => {
  reply = { status: 200, body: { botCheck: 'on', turnstileSiteKey: ' 0x4AAAAAAFqInbtR3tz5FcF4 ' } };
  const [a, b] = await Promise.all([formsConfig(), formsConfig()]);
  assert.deepEqual(a, { botCheck: 'on', turnstileSiteKey: '0x4AAAAAAFqInbtR3tz5FcF4' });
  assert.equal(a, b);
  assert.deepEqual(calls.map((c) => [c.url, c.init.credentials]), [[`${FORMS_ENDPOINT}/config`, 'omit']]);
  assert.equal(turnstileSiteKey(a), '0x4AAAAAAFqInbtR3tz5FcF4');
});

test('forms config: an error, a failed request or odd values give no site key', async () => {
  const off = { botCheck: 'off', turnstileSiteKey: '' };
  reply = { status: 404, body: { ok: false } };
  assert.deepEqual(await formsConfig(), off);
  resetFormsConfig();
  reply = 'network';
  assert.deepEqual(await formsConfig(), off);
  resetFormsConfig();
  reply = { status: 200, body: { botCheck: 'yes', turnstileSiteKey: null } };
  assert.deepEqual(await formsConfig(), off);
});

test('forms config: the tester\'s worker and test site key from localStorage', async () => {
  window.localStorage.setItem('lh-forms', 'http://localhost:8787/');
  reply = { status: 200, body: { botCheck: 'off', turnstileSiteKey: '0x4AAAAAAFqInbtR3tz5FcF4' } };
  const config = await formsConfig();
  assert.equal(calls[0].url, 'http://localhost:8787/config');
  window.localStorage.setItem('lh-forms-sitekey', '1x00000000000000000000AA');
  assert.equal(turnstileSiteKey(config), '1x00000000000000000000AA');
  assert.equal(turnstileSiteKey(null), '1x00000000000000000000AA');
  window.localStorage.removeItem('lh-forms-sitekey');
  assert.equal(turnstileSiteKey(null), '');
});

test('form ids: the market roots\' own forms by page name; mk/en\'s empty refund page none', () => {
  assert.equal(formIdFromPath('/bg/en/local-page/invoice-request-bg'), 'invoice-request-bg');
  assert.equal(formIdFromPath('/il/en/cancellation-refund-webform'), 'cancellation-refund-webform');
  assert.equal(formIdFromPath('/mk/de/formular-notfallkontakt.plain.html'), 'formular-notfallkontakt');
  assert.equal(formIdFromPath('/fr/fr/emergency-contact'), 'emergency-contact');
  assert.equal(formIdFromPath('/mk/en/support/refund'), '');
  // brief 446: the invoice requests (Greece's two pages one id), the group check-in counter,
  // www's second ammunition form (register-ammunition's form); NaverPay's expired promotion none
  [['/ba/en/invoice-request-bosnia', 'invoice-request-bosnia'],
    ['/cz/en/invoice-request-czech-republic', 'invoice-request-czech-republic'],
    ['/hr/en/invoice-request-croatia', 'invoice-request-croatia'], ['/hu/en/invoice-request-hungary', 'invoice-request-hungary'],
    ['/pl/en/invoice-request-poland', 'invoice-request-poland'], ['/rs/en/invoice-request-serbia', 'invoice-request-serbia'],
    ['/si/en/invoice-request-slovenia', 'invoice-request-slovenia'], ['/gr/en/invoice-request-greece-en', 'invoice-request-greece'],
    ['/gr/el/invoice-request-greece-el', 'invoice-request-greece'],
    ['/de/de/prepare-for-your-trip/all-check-in/group-check-in-counter', 'group-check-in-counter'],
    ['/at/de/prepare-for-your-trip/all-check-in/group-check-in-counter', 'group-check-in-counter'],
    ['/xx/es/prepare-for-your-trip/baggage/sport-baggage/register-ammunition1', 'register-ammunition'],
    ['/kr/en/local-page/naverpay-points', '']].forEach(([path, id]) => assert.equal(formIdFromPath(path), id, path));
  assert.equal(formIdFromPath('/bg/en/invoice-request'), '');
});
