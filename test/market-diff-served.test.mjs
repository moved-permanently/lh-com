/* eslint-disable max-len, import/extensions, import/no-relative-packages, object-property-newline -- tools/market-diff has a package.json of its own */
/* market-diff's served view (brief 468): md-replica-check reads a root's page as the root is served — the root's
   own document, else the language version's without the sections whose markets leave the country out — with each
   fragment block's document in its place, filtered the same way (the site's fragments load in the browser, so
   neither lh-edge's .plain.html nor the version document holds their text). tools/market-diff/lib/served.mjs.
   Run: node --max-old-space-size=256 --test test/market-diff-served.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { servedView, fragmentRefs, countryOfRoot } from '../tools/market-diff/lib/served.mjs';

const md = (m) => `<div class="section-metadata"><div><div>Markets</div><div>${m}</div></div></div>`;
const version = [
  '<div><h1>Payment methods</h1></div>',
  `<div><p>Santander campaign</p>${md('pt')}</div>`,
  `<div><p>Simple, secure payments</p>${md('-pt')}</div>`,
  '<div><div class="fragment"><div><div><a href="https://main--lh-tap--moved-permanently.aem.page/en-pt/fragments/payment/market-abc123">x</a></div></div></div></div>',
].join('');
const fragment = `<div><p>Pay in kwanza</p>${md('ao')}</div><div><p>Pay in euro</p>${md('-ao')}</div>`;
const answers = (map) => async (p) => (map[p] !== undefined ? { status: 200, text: map[p] } : { status: 404, text: '' });

test('version read: the root without an own document gets the version less the sections it is left out of, fragments in place', async () => {
  const v = await servedView({
    get: answers({ '/en-pt/bookings/payment-methods': version, '/en-pt/fragments/payment/market-abc123': fragment }),
    rootPath: '/en-ao/bookings/payment-methods', versionPath: '/en-pt/bookings/payment-methods', country: 'ao', read: 'version',
  });
  assert.equal(v.status, 200);
  assert.equal(v.from, 'version');
  assert.deepEqual(v.fragments, ['/en-pt/fragments/payment/market-abc123']);
  assert.ok(v.html.includes('Simple, secure payments'));
  assert.ok(!v.html.includes('Santander campaign'));
  assert.ok(v.html.includes('Pay in kwanza'));
  assert.ok(!v.html.includes('Pay in euro'));
  assert.ok(!v.html.includes('class="fragment"'));
});

test('version read: the root\'s own document is served as it is', async () => {
  const own = `<div><p>Angola only</p>${md('pt')}</div>`;
  const v = await servedView({
    get: answers({ '/en-ao/bookings/payment-methods': own, '/en-pt/bookings/payment-methods': version }),
    rootPath: '/en-ao/bookings/payment-methods', versionPath: '/en-pt/bookings/payment-methods', country: 'ao', read: 'version',
  });
  assert.equal(v.from, 'own');
  assert.ok(v.html.includes('Angola only'));
});

test('root read: the replica\'s answer for the root path (its market route), fragments put in and filtered', async () => {
  const routed = version.replace(`<div><p>Santander campaign</p>${md('pt')}</div>`, '');
  const v = await servedView({
    get: answers({ '/en-ao/bookings/payment-methods': routed, '/en-pt/fragments/payment/market-abc123': fragment }),
    rootPath: '/en-ao/bookings/payment-methods', versionPath: '/en-pt/bookings/payment-methods', country: 'ao',
  });
  assert.equal(v.from, 'root');
  assert.ok(v.html.includes('Pay in kwanza') && !v.html.includes('Pay in euro'));
});

test('no document: the status comes back', async () => {
  const v = await servedView({
    get: answers({}), rootPath: '/en-ao/x', versionPath: '/en-pt/x', country: 'ao', read: 'version',
  });
  assert.equal(v.status, 404);
  assert.equal(v.html, '');
});

test('fragmentRefs and countryOfRoot', () => {
  assert.deepEqual(fragmentRefs('<div class="fragment"><div><div><p><a href="/de/de/fragments/a.plain.html">a</a></p></div></div></div><p><a href="/x">x</a></p>'), ['/de/de/fragments/a']);
  assert.deepEqual(fragmentRefs('<p>none</p>'), []);
  assert.equal(countryOfRoot('en-ao', 'll-cc'), 'ao');
  assert.equal(countryOfRoot('ch/de', 'cc/ll'), 'ch');
});

test('md-replica-check reads the served view (lib/served.mjs) for the root\'s country', () => {
  const js = fs.readFileSync(new URL('../tools/market-diff/bin/md-replica-check.mjs', import.meta.url), 'utf8');
  assert.match(js, /import \{ servedView, countryOfRoot \} from '\.\.\/lib\/served\.mjs';/);
  assert.match(js, /servedView\(\{[^}]*country: countryOfRoot\(r\.root, rootStyle\)/);
  assert.match(js, /\[--read root\|version\]/);
});
