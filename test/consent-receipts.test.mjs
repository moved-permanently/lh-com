/* OneTrust's consent receipts (brief 322; tools/reports/consent/receipts.md): on our hosts OneTrust
   posts a receipt to Lufthansa Group's OneTrust tenant on every choice (an XHR POST to
   https://lufthansagroup-privacy.my.onetrust.com/request/v1/consentreceipts) and another one by
   sendBeacon when the page is left (its "no interaction" receipt: it can't read its interaction
   count from the .lufthansa.com cookie on our hosts). scripts/consent.js guardReceipts, installed
   before the stub loads, drops exactly the receipt endpoint (/request/v1/consentreceipts and its
   /anonymous and /cro variants on *.my.onetrust.com): the XHR is not sent and fails as when the
   endpoint is unreachable (OneTrust's error handler), the beacon reports queued, a fetch rejects;
   every other request passes through unchanged, and nothing breaks without OneTrust.
   Run: node --max-old-space-size=512 --test test/consent-receipts.test.mjs */
/* global globalThis */
/* eslint-disable max-classes-per-file, class-methods-use-this -- fakes of the browser's XHR */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';
import consentOn from './consent-page.js';

// scripts/aem.js (imported by consent.js) needs a window
const { window: w0 } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
w0.hlx = { codeBasePath: '' };
w0.location = {
  hostname: 'lufthansa.turnsthe.page', pathname: '/', search: '', href: 'https://lufthansa.turnsthe.page/', origin: 'https://lufthansa.turnsthe.page',
};
Object.defineProperty(w0, 'origin', { value: 'https://lufthansa.turnsthe.page', configurable: true });
globalThis.window = w0;
globalThis.document = w0.document;
const { isReceiptUrl, guardReceipts } = await import('../scripts/consent.js');

const RECEIPTS = [
  'https://lufthansagroup-privacy.my.onetrust.com/request/v1/consentreceipts',
  'https://lufthansagroup-privacy.my.onetrust.com/request/v1/consentreceipts/anonymous',
  'https://lufthansagroup-privacy.my.onetrust.com/request/v1/consentreceipts/cro',
  'https://lufthansagroup-privacy.my.onetrust.com/request/v1/consentreceipts?x=1',
  'HTTPS://LufthansaGroup-Privacy.my.onetrust.com/request/v1/consentreceipts',
];
const OTHERS = [
  'https://lufthansa.turnsthe.page/onetrust/scripttemplates/otSDKStub.js',
  'https://cdn.cookielaw.org/scripttemplates/otSDKStub.js',
  'https://lufthansa.turnsthe.page/onetrust/consent/01994cb2-af99-7dbe-8fb0-56427773e54e/01994cb2-af99-7dbe-8fb0-56427773e54e.json',
  'https://lufthansa.turnsthe.page/onetrust/consent/01994cb2-af99-7dbe-8fb0-56427773e54e/019eac39-8e36-7166-9c88-774aaec25aea/en.json',
  'https://lufthansa.turnsthe.page/onetrust/scripttemplates/202610.1.0/otBannerSdk.js',
  'https://cdn.cookielaw.org/logos/static/ot_guard_logo.svg',
  'https://geolocation.onetrust.com/cookieconsentpub/v1/geo/location',
  'https://cookies-data.onetrust.io/bannersdk/v1/domaingroupcheck',
  'https://privacyportal-de.onetrust.com/webform/5395d766-067c-455c-a0af-1ff72db528d7/x',
  'https://lufthansagroup-privacy.my.onetrust.com/request/v1/consentreceiptsx',
  'https://lufthansagroup-privacy.my.onetrust.com/request/v2/consentreceipts',
  'https://lufthansagroup-privacy.my.onetrust.com/api/consentmanager/v1/datasubjects',
  'https://evil.example/request/v1/consentreceipts',
  'https://my.onetrust.com.evil.example/request/v1/consentreceipts',
  'http://lufthansagroup-privacy.my.onetrust.com/request/v1/consentreceipts',
  '/request/v1/consentreceipts',
  'https://lufthansa.turnsthe.page/cdn-cgi/rum',
  'https://www.lufthansa.com/service/api/catalogs/localeData',
  'https://lufthansa.turnsthe.page/de/en/footer.plain.html',
];

test('isReceiptUrl: exactly the receipt endpoint, nothing else', () => {
  RECEIPTS.forEach((u) => assert.equal(isReceiptUrl(u), true, u));
  OTHERS.forEach((u) => assert.equal(isReceiptUrl(u), false, u));
  assert.equal(isReceiptUrl(new URL(RECEIPTS[0])), true, 'a URL object');
  [undefined, null, '', 'not a url ::'].forEach((u) => assert.equal(isReceiptUrl(u), false, String(u)));
});

/** A window with recording XHR, sendBeacon and fetch, as the browser's. */
function fakeWindow() {
  const calls = [];
  class XHR extends EventTarget {
    open(method, url, async) { calls.push(['open', method, String(url), async]); this.url = String(url); }

    send(body) { calls.push(['send', this.url, body]); return 'sent'; }

    setRequestHeader(k, v) { calls.push(['header', k, v]); }
  }
  const timers = [];
  const win = {
    XMLHttpRequest: XHR,
    ProgressEvent: class extends Event {},
    navigator: { sendBeacon(url, data) { calls.push(['beacon', String(url), data]); return 'queued'; } },
    fetch(input, init) { calls.push(['fetch', String(input.url || input), init]); return Promise.resolve('fetched'); },
    setTimeout: (fn) => { timers.push(fn); return timers.length; },
    location: { href: 'https://lufthansa.turnsthe.page/de/en/homepage' },
  };
  const flush = () => { while (timers.length) timers.shift()(); };
  return { win, calls, flush };
}

test('XHR: the receipt is not sent and fails as an unreachable endpoint; every other XHR as before', () => {
  const { win, calls, flush } = fakeWindow();
  guardReceipts(win);
  const receipt = new win.XMLHttpRequest();
  const seen = [];
  receipt.onerror = () => seen.push('error');
  receipt.addEventListener('loadend', () => seen.push('loadend'));
  receipt.onload = () => seen.push('load');
  receipt.open('post', RECEIPTS[0], true);
  receipt.setRequestHeader('Content-Type', 'application/json');
  assert.equal(receipt.send('{"purposes":[]}'), undefined);
  assert.deepEqual(calls.filter((c) => c[0] === 'send'), [], 'not sent');
  assert.deepEqual(seen, [], 'asynchronously, as the browser');
  flush();
  assert.deepEqual(seen, ['error', 'loadend']);
  // the same XHR object reused for another URL, and a fresh one: unchanged
  calls.length = 0;
  receipt.open('GET', OTHERS[3], true);
  assert.equal(receipt.send(), 'sent');
  const other = new win.XMLHttpRequest();
  other.open('POST', OTHERS[16], false);
  assert.equal(other.send('payload'), 'sent');
  assert.deepEqual(calls, [['open', 'GET', OTHERS[3], true], ['send', OTHERS[3], undefined], ['open', 'POST', OTHERS[16], false], ['send', OTHERS[16], 'payload']]);
});

test('sendBeacon and fetch: the receipt dropped, everything else passed through as it is', async () => {
  const { win, calls } = fakeWindow();
  guardReceipts(win);
  assert.equal(win.navigator.sendBeacon(RECEIPTS[0], '{}'), true, 'reported queued');
  await assert.rejects(win.fetch(RECEIPTS[1], { method: 'POST', body: '{}' }), TypeError);
  await assert.rejects(win.fetch(new Request(RECEIPTS[2], { method: 'POST' })), TypeError);
  assert.deepEqual(calls, [], 'nothing sent');
  assert.equal(win.navigator.sendBeacon(OTHERS[16], 'rum'), 'queued');
  const init = { method: 'GET' };
  assert.equal(await win.fetch(OTHERS[3], init), 'fetched');
  assert.deepEqual(calls, [['beacon', OTHERS[16], 'rum'], ['fetch', OTHERS[3], init]]);
});

test('installed once; a window without XHR, sendBeacon or fetch is left as it is', () => {
  const { win, calls } = fakeWindow();
  guardReceipts(win);
  const { send } = win.XMLHttpRequest.prototype;
  const beacon = win.navigator.sendBeacon;
  guardReceipts(win);
  assert.equal(win.XMLHttpRequest.prototype.send, send, 'not wrapped twice');
  assert.equal(win.navigator.sendBeacon, beacon);
  assert.deepEqual(calls, []);
  const bare = { location: { href: 'https://x.example/' } };
  assert.doesNotThrow(() => guardReceipts(bare));
  const noBeacon = { navigator: {}, location: bare.location };
  assert.doesNotThrow(() => guardReceipts(noBeacon));
  assert.equal(noBeacon.navigator.sendBeacon, undefined);
});

test('consent.js installs the guard right before OneTrust\'s stub, only where OneTrust loads', async () => {
  const src = fs.readFileSync(new URL('../scripts/consent.js', import.meta.url), 'utf8');
  const load = src.slice(src.indexOf('function loadOneTrust('), src.indexOf('/* ------------------------------------------------------------------- preferences link'));
  assert.ok(load.indexOf('guardReceipts();') > 0 && load.indexOf('guardReceipts();') < load.indexOf('document.head.append(script)'), 'guardReceipts() before the stub is appended');
  assert.equal((src.match(/guardReceipts\(\)/g) || []).length, 1, 'nowhere else');
  // a page in linkedom (no XHR, no sendBeacon): OneTrust's stub is added as before
  const lh = await consentOn('', { hostname: 'lufthansa.turnsthe.page' });
  assert.ok(lh.stub, 'the stub');
  assert.equal(lh.stub.getAttribute('src'), '/onetrust/scripttemplates/otSDKStub.js');
  assert.deepEqual(lh.events.map((e) => e.source), ['default']);
  // a brand without OneTrust (Cargo): no stub, no guard needed
  const cargo = await consentOn('cargo', { hostname: 'cargo.turnsthe.page' });
  assert.equal(cargo.stub, null);
});
