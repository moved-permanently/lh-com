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

/* Then: styles/fonts.css and the brand themes load their web fonts from our path first (404 on aem.live) and then from
   the airline's www (https://www.lufthansa.com/digitalhangar/design-system/releases/mausy-v1.40.1/standalone/fonts/...):
   aborted, the text fell back to a system font (Discover's punta-cana at 390 344 px longer, 29.55 -> 48.18). The
   recording drops hold www's font files at the same paths (<drop>/digitalhangar/...); PARITY_FONTS (directories,
   ":"-separated) answers a font request from them: lib.js mirroredFont(u, dirs) is the file for a font URL (.woff2,
   .woff, .ttf, .otf) found under one of the directories at the URL's path, else null. Anything else stays aborted. */
test('mirroredFont: a font URL answered from a directory holding the same path, nothing else', () => {
  const { mirroredFont } = require('../tools/parity/lib.js');
  const os = require('node:os');
  const path = require('node:path');
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'fonts-'));
  const a = path.join(root, 'a');
  const b = path.join(root, 'b');
  const rel = 'digitalhangar/design-system/releases/mausy-v1.40.1/standalone/fonts/lufthansa';
  fs.mkdirSync(path.join(b, rel), { recursive: true });
  fs.mkdirSync(a, { recursive: true });
  fs.writeFileSync(path.join(b, rel, 'LufthansaHeadWeb-Bold.woff2'), 'x');
  fs.writeFileSync(path.join(b, rel, 'notes.txt'), 'x');
  fs.writeFileSync(path.join(root, 'secret.woff2'), 'x');
  const font = `https://www.lufthansa.com/${rel}/LufthansaHeadWeb-Bold.woff2`;
  assert.equal(mirroredFont(new URL(font), [a, b]), path.join(b, rel, 'LufthansaHeadWeb-Bold.woff2'));
  // the query string does not matter, the host does not either (the same path on swiss.com is its own file)
  assert.equal(mirroredFont(new URL(`${font}?v=1`), [a, b]), path.join(b, rel, 'LufthansaHeadWeb-Bold.woff2'));
  assert.equal(mirroredFont(new URL(`https://www.lufthansa.com/${rel}/LufthansaTextWeb-Bold.woff2`), [a, b]), null);
  assert.equal(mirroredFont(new URL(`https://www.lufthansa.com/${rel}/notes.txt`), [a, b]), null);
  assert.equal(mirroredFont(new URL('https://www.lufthansa.com/service/api/catalogs/regions'), [a, b]), null);
  // never outside the directories
  assert.equal(mirroredFont(new URL('https://www.lufthansa.com/b/%2E%2E/secret.woff2'), [b]), null);
  assert.equal(mirroredFont(new URL('https://www.lufthansa.com/..%2Fsecret.woff2'), [b]), null);
  assert.equal(mirroredFont(new URL(font), []), null);
  fs.rmSync(root, { recursive: true, force: true });
});

test('capture.js answers mirrored fonts, aborts the other requests and blocks service workers for our pages', () => {
  const src = fs.readFileSync(new URL('../tools/parity/capture.js', import.meta.url), 'utf8');
  assert.match(src, /const allowHost = ownHostFilter\(url\);/);
  assert.match(src, /\.\.\.\(allowHost \? \{ serviceWorkers: 'block' \} : \{\}\)/);
  assert.match(src, /if \(allowHost\) \{\s+await context\.route\(\(u\) => !allowHost\(u\), \(route\) => \{/);
  assert.match(src, /const font = mirroredFont\(new URL\(route\.request\(\)\.url\(\)\), FONT_DIRS\);/);
  assert.match(src, /return font \? route\.fulfill\(\{ path: font, headers: \{ 'Access-Control-Allow-Origin': '\*' \} \}\)\s+: route\.abort\('blockedbyclient'\);/);
  assert.match(src, /const FONT_DIRS = \(process\.env\.PARITY_FONTS \|\| ''\)\.split\(':'\)\.filter\(Boolean\);/);
  // routed before the first page opens
  assert.ok(src.indexOf('context.route(') < src.indexOf('context.newPage()'));
});
