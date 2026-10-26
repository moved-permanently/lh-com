/* The form block's bot check configuration (scripts/lh-forms.js): GET /config of lh-forms once
   per page, the site key and a tester's override. Run: node --test test/*.test.mjs */
/* global globalThis */
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  formsConfig, resetFormsConfig, turnstileSiteKey, FORMS_ENDPOINT,
} from '../scripts/lh-forms.js';

const store = () => {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
  };
};
globalThis.window = { localStorage: store() };

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
  reply = { status: 200, body: { botCheck: 'on', turnstileSiteKey: ' 0x4AAAAAAFnIbr4JnmqxGNVc ' } };
  const [a, b] = await Promise.all([formsConfig(), formsConfig()]);
  assert.deepEqual(a, { botCheck: 'on', turnstileSiteKey: '0x4AAAAAAFnIbr4JnmqxGNVc' });
  assert.equal(a, b);
  assert.deepEqual(calls.map((c) => [c.url, c.init.credentials]), [[`${FORMS_ENDPOINT}/config`, 'omit']]);
  assert.equal(turnstileSiteKey(a), '0x4AAAAAAFnIbr4JnmqxGNVc');
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
  reply = { status: 200, body: { botCheck: 'off', turnstileSiteKey: '0x4AAAAAAFnIbr4JnmqxGNVc' } };
  const config = await formsConfig();
  assert.equal(calls[0].url, 'http://localhost:8787/config');
  window.localStorage.setItem('lh-forms-sitekey', '1x00000000000000000000AA');
  assert.equal(turnstileSiteKey(config), '1x00000000000000000000AA');
  assert.equal(turnstileSiteKey(null), '1x00000000000000000000AA');
  window.localStorage.removeItem('lh-forms-sitekey');
  assert.equal(turnstileSiteKey(null), '');
});
