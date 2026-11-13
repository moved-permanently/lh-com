/* eslint-disable max-len */
/* Standing order 12 of 2026-11-13: a capture of one of our pages ran its scripts, and they call www.lufthansa.com
   directly (scripts/lh-data.js direct routes: 23 requests on /de/en/book/flights/offers) and lh-proxy, which forwards
   to www. Captures of our pages must not reach an airline host. Chrome's --host-resolver-rules do not help behind an
   HTTP proxy (the proxy resolves the host: example.com still loaded with "MAP * ~NOTFOUND"), so capture.js aborts the
   requests in the browser: lib.js ownHostFilter(url) is, for a capture of our hosts (aem.live, aem.page, localhost),
   the test of the hosts its requests may go to (ours and OneTrust's consent hosts, no airline's); for any other target
   (a www recording) null, as before. Service workers are blocked with it (their requests are not routed).
   Run: node --test test/parity-capture-own-hosts-so12.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { ownHostFilter } = require('../tools/parity/lib.js');

test('ownHostFilter: a capture of our hosts may reach only our hosts and the consent hosts', () => {
  ['https://main--lh-discover--moved-permanently.aem.live/de/en/book/flights/offers',
    'https://cmp-394--lh-com--moved-permanently.aem.page/de/en/homepage',
    'http://localhost:3062/de/de/offers',
    'http://127.0.0.1:3000/x'].forEach((url) => {
    const allow = ownHostFilter(url);
    assert.equal(typeof allow, 'function', url);
    ['https://main--lh-discover--moved-permanently.aem.live/scripts/aem.js',
      'https://main--lh-com--moved-permanently.aem.page/media_1.png',
      'http://localhost:3062/styles/styles.css',
      'https://cdn.cookielaw.org/scripttemplates/otSDKStub.js',
      'https://geolocation.onetrust.com/cookieconsentpub/v1/geo/location',
      'data:image/png;base64,AAAA',
      'blob:https://main--lh-com--moved-permanently.aem.live/1'].forEach((u) => assert.equal(allow(new URL(u)), true, u));
    ['https://www.lufthansa.com/service/api/catalogs/regions',
      'https://lh-proxy.benpeter.workers.dev/service/api/x',
      'https://www.austrian.com/at/de/homepage',
      'https://www.swiss.com/x', 'https://www.flytap.com/x', 'https://www.ita-airways.com/x',
      'https://www.brusselsairlines.com/x', 'https://www.discover-airlines.com/x', 'https://www.eurowings.com/x',
      'https://aem.live.example.com/x', 'https://example.com/'].forEach((u) => assert.equal(allow(new URL(u)), false, u));
  });
});

test('ownHostFilter: none for a target that is not ours (a recording of www)', () => {
  assert.equal(ownHostFilter('https://www.lufthansa.com/de/en/homepage'), null);
  assert.equal(ownHostFilter('https://www.flytap.com/en-us'), null);
  assert.equal(ownHostFilter('https://aem.live.example.com/x'), null);
  assert.equal(ownHostFilter('not a url'), null);
});

test('capture.js aborts the other requests and blocks service workers for our pages', () => {
  const src = fs.readFileSync(new URL('../tools/parity/capture.js', import.meta.url), 'utf8');
  assert.match(src, /const allowHost = ownHostFilter\(url\);/);
  assert.match(src, /\.\.\.\(allowHost \? \{ serviceWorkers: 'block' \} : \{\}\)/);
  assert.match(src, /if \(allowHost\) await context\.route\(\(u\) => !allowHost\(u\), \(route\) => route\.abort\('blockedbyclient'\)\);/);
  // routed before the first page opens
  assert.ok(src.indexOf('context.route(') < src.indexOf('context.newPage()'));
});
