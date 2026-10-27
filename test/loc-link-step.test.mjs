/* eslint-disable max-len, import/extensions */
/* The link step (tools/loc/link-step.mjs): rollout and translation links, unmapped links, the DA
   calls (a fake DA, no network). Run: node --test test/*.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { pairMap, localizeHref, localizeDoc } from '../tools/loc/link-lib.mjs';
import { runLinkStep } from '../tools/loc/link-step.mjs';
import { scopeRows } from '../tools/loc/regional-diff.mjs';

const ROWS = scopeRows();
const TRANSLATED = fs.readFileSync(new URL('./fixtures/loc/translated-flight-search.html', import.meta.url), 'utf8');
const ROLLED_OUT = `<body><header></header><main><div><h1>Baggage</h1>
<p><a href="/de/en/freigepaeck-regeln">Free baggage</a>, <a href="/de/en/baggage?x=1#top">baggage</a>, <a href="/gb/en/carry-on-baggage">carry-on</a></p>
<p><a href="https://main--lh-com--moved-permanently.aem.live/de/en/flight-search">search</a> <a href="https://lhcom.bbird.live/de/en/homepage">home</a> <a href="/de/en/no-such-page">gone</a></p>
<p><a href="https://www.lufthansa.com/de/en/flights">www</a> <a href="#types">anchor</a> <a href="mailto:x@example.com">mail</a></p>
<div class="metadata"><div><div>Parent</div><div><a href="/de/en/homepage">/de/en/homepage</a></div></div></div></div></main><footer></footer></body>`;

test('pair maps: every scope row of both locales; the homepage root too', () => {
  const at = pairMap(ROWS, 'de/de', 'at/de');
  assert.equal(at.paths['/de/de/gepaeck'], '/at/de/gepaeck');
  assert.equal(at.paths['/de/de'], '/at/de');
  const de = pairMap(ROWS, 'de/en', 'de/de');
  assert.equal(de.paths['/de/en/flight-search'], '/de/de/flugsuche');
  assert.equal(de.paths['/de/en/baggage'], '/de/de/gepaeck');
  assert.throws(() => pairMap(ROWS, 'de/en', 'fr/fr'), /unknown locale pair/);
});

test('rollout de/en -> gb/en: source-locale links become gb/en ones, site hosts relative, the rest stays', () => {
  const map = pairMap(ROWS, 'de/en', 'gb/en');
  const unmapped = [];
  const r = (h) => localizeHref(h, map, (p) => unmapped.push(p));
  assert.equal(r('/de/en/baggage?x=1#top'), '/gb/en/baggage?x=1#top');
  assert.equal(r('https://main--lh-com--moved-permanently.aem.page/de/en/flight-search'), '/gb/en/flight-search');
  assert.equal(r('/gb/en/carry-on-baggage'), null, 'already the target locale');
  assert.equal(r('https://www.lufthansa.com/de/en/flights'), null, 'other hosts stay');
  assert.equal(r('/de/en/no-such-page'), null);
  assert.deepEqual(unmapped, ['/de/en/no-such-page']);
  const doc = localizeDoc(ROLLED_OUT, map);
  assert.equal(doc.links, 5);
  assert.deepEqual(doc.unmapped, ['/de/en/no-such-page']);
  assert.match(doc.html, /href="\/gb\/en\/freigepaeck-regeln"/);
  assert.match(doc.html, /href="\/gb\/en\/flight-search">search/);
  assert.match(doc.html, /href="\/gb\/en\/homepage">home/);
  assert.match(doc.html, /href="\/de\/en\/no-such-page">gone/);
  assert.match(doc.html, /Parent<\/div><div><a href="\/gb\/en\/homepage">\/gb\/en\/homepage<\/a>/);
  assert.match(doc.html, /href="https:\/\/www\.lufthansa\.com\/de\/en\/flights"/);
  assert.match(doc.html, /href="#types"/);
  assert.equal(localizeDoc(doc.html, map).links, 0, 'a second run changes nothing');
});

test('translation de/en -> de/de: the app\'s absolute links become relative German ones in any translated page', () => {
  const map = pairMap(ROWS, 'de/en', 'de/de');
  const doc = localizeDoc(TRANSLATED, map);
  assert.ok(!doc.html.includes('aem.page'));
  assert.ok(!/href="\/de\/en/.test(doc.html));
  assert.match(doc.html, /href="\/de\/de\/homepage">\/de\/de\/homepage/);
  assert.deepEqual(doc.unmapped, []);
  const at = pairMap(ROWS, 'de/de', 'at/de');
  assert.equal(localizeHref('/de/de/flugsuche', at), '/at/de/flugsuche', 'own German slugs roll out by their German path');
});

/** An in-memory DA: path -> html; records writes. */
function fakeDa(docs) {
  const calls = [];
  return {
    calls,
    docs,
    get: async (p) => { calls.push(['GET', p]); return docs[p] ?? null; },
    put: async (p, html) => { calls.push(['POST', p]); docs[p] = html; },
    remove: async () => { throw new Error('the link step never deletes'); },
  };
}

test('runLinkStep: dry run reads only; --apply writes the changed pages only; --root; refusals; pair check', async () => {
  const docs = { '/gb/en/baggage': ROLLED_OUT, '/gb/en/homepage': '<body><main><div><p><a href="/gb/en/baggage">ok</a></p></div></main></body>' };
  const dry = fakeDa({ ...docs });
  const results = await runLinkStep({
    from: 'de/en', to: 'gb/en', pages: ['/gb/en/baggage', '/gb/en/homepage', '/gb/en/missing', '/de/en/baggage', '/gb/en/login'], rows: ROWS, da: dry,
  });
  assert.deepEqual(results.map((r) => r.status), ['changes', 'unchanged', 'not in DA', 'not a /gb/en page', 'refused (lhg, login or profile)']);
  assert.ok(dry.calls.every(([m]) => m === 'GET'));

  const da = fakeDa({ ...docs });
  await runLinkStep({
    from: 'de/en', to: 'gb/en', pages: ['/gb/en/baggage', '/gb/en/homepage'], rows: ROWS, da, apply: true,
  });
  assert.deepEqual(da.calls.filter(([m]) => m === 'POST'), [['POST', '/gb/en/baggage']]);
  assert.match(da.docs['/gb/en/baggage'], /href="\/gb\/en\/freigepaeck-regeln"/);

  const drafts = fakeDa({ '/drafts/loc-test/gb/en/baggage': ROLLED_OUT });
  await runLinkStep({
    from: 'de/en', to: 'gb/en', pages: ['/gb/en/baggage'], rows: ROWS, da: drafts, apply: true, rootDir: '/drafts/loc-test',
  });
  assert.deepEqual(drafts.calls.filter(([m]) => m === 'POST'), [['POST', '/drafts/loc-test/gb/en/baggage']]);
  await assert.rejects(runLinkStep({
    from: 'at/de', to: 'de/de', pages: [], rows: ROWS, da,
  }), /not a rollout or translation pair/);
});
