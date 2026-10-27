/* eslint-disable max-len, import/extensions -- dev tooling */
/* The slug step (tools/loc/slug-step.mjs): map, German links, metadata, plan, DA calls (a fake DA,
   no network). Run: node --test test/*.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  buildSlugMap, germanHref, germanize, plan, translationPath,
} from '../tools/loc/slug-lib.mjs';
import { runStep } from '../tools/loc/slug-step.mjs';
import { scopeRows } from '../tools/loc/regional-diff.mjs';

const fixture = (f) => fs.readFileSync(new URL(`./fixtures/loc/${f}`, import.meta.url), 'utf8');
const MAP = JSON.parse(fs.readFileSync(new URL('../tools/loc/slug-map.json', import.meta.url), 'utf8'));
const TRANSLATED = fixture('translated-flight-search.html');
const EXISTING = fixture('existing-flugsuche.html');

test('slug map: the 72 own German slugs of pages.csv, kept in tools/loc/slug-map.json', () => {
  const built = buildSlugMap(scopeRows());
  built.paths['/de/en'] = '/de/de';
  assert.equal(Object.keys(built.slugs).length, 72);
  assert.deepEqual(built.slugs, MAP.slugs, 'slug-map.json is up to date (node tools/loc/slug-step.mjs --build-map)');
  assert.deepEqual(built.paths, MAP.paths);
  assert.equal(MAP.slugs['/de/en/flight-search'], '/de/de/flugsuche');
  assert.equal(MAP.slugs['/de/en/baggage'], '/de/de/gepaeck');
  assert.equal(MAP.slugs['/de/en/homepage'], undefined, 'same slug: not in the map');
  assert.equal(translationPath('/de/en/flight-search'), '/de/de/flight-search');
});

test('German links: the site hosts become root-relative, /de/en/<x> the German page of x', () => {
  const unmapped = [];
  const r = (h) => germanHref(h, MAP, (p) => unmapped.push(p));
  assert.equal(r('https://main--lh-com--moved-permanently.aem.page/de/en/flight-search'), '/de/de/flugsuche');
  assert.equal(r('https://main--lh-com--moved-permanently.aem.live/de/en/baggage?x=1#top'), '/de/de/gepaeck?x=1#top');
  assert.equal(r('https://lhcom.bbird.live/de/en/homepage'), '/de/de/homepage');
  assert.equal(r('/de/en/flight-search.html'), '/de/de/flugsuche');
  assert.equal(r('/de/en'), '/de/de');
  assert.equal(r('https://main--lh-com--moved-permanently.aem.page/content/dam/lh/x.pdf'), '/content/dam/lh/x.pdf');
  assert.equal(r('/de/en/not-in-the-scope'), null, 'no German page: left as it is');
  assert.equal(r('https://main--lh-com--moved-permanently.aem.page/de/en/not-in-the-scope'), '/de/en/not-in-the-scope', 'host stripped, path kept');
  assert.deepEqual(unmapped, ['/de/en/not-in-the-scope', '/de/en/not-in-the-scope']);
  assert.equal(r('https://www.lufthansa.com/de/en/flights'), null, 'www links stay');
  assert.equal(r('/de/de/gepaeck'), null);
  assert.equal(r('#anchor'), null);
});

test('germanize: the translated flight search (as the app writes it) gets German links, Parent and primary-language-url', () => {
  const g = germanize(TRANSLATED, '/de/en/flight-search', MAP);
  assert.ok(!g.html.includes('aem.page'), 'no absolute aem.page links left');
  assert.ok(!/href="\/de\/en/.test(g.html), 'no /de/en links left');
  assert.match(g.html, /Parent<\/div><div><a href="\/de\/de\/homepage">\/de\/de\/homepage<\/a>/);
  assert.match(g.html, /<div>primary-language-url<\/div><div>\/de\/en\/flight-search<\/div>/);
  assert.equal(g.primary, 'added');
  assert.deepEqual(g.unmapped, []);
  assert.ok(g.links >= 5, String(g.links));
  assert.match(g.html, /href="https:\/\/www\.lufthansa\.com\/xx\/en\/flights"/, 'www links unchanged');
  // a row already there is corrected, not doubled
  const again = germanize(g.html.replace('/de/en/flight-search</div>', '/de/en/old</div>'), '/de/en/flight-search', MAP);
  assert.equal(again.primary, 'set');
  assert.equal((again.html.match(/primary-language-url/g) || []).length, 1);
  assert.equal(germanize(g.html, '/de/en/flight-search', MAP).primary, 'kept');
});

test('plan: same slug never touched, no translation, move, merge, conflict', () => {
  assert.equal(plan('/de/en/homepage', MAP, { copyExists: true, targetExists: true }).action, 'skip-same-slug');
  assert.equal(plan('/de/en/flight-search', MAP, { copyExists: false, targetExists: true }).action, 'no-translation');
  assert.deepEqual(plan('/de/en/flight-search', MAP, { copyExists: true, targetExists: false }), {
    action: 'move', enPath: '/de/en/flight-search', copy: '/de/de/flight-search', target: '/de/de/flugsuche',
  });
  assert.equal(plan('/de/en/flight-search', MAP, { copyExists: true, targetExists: true }).action, 'merge');
  const clash = { slugs: { '/de/en/a': '/de/de/b' }, paths: { '/de/en/a': '/de/de/b', '/de/en/c': '/de/de/a' } };
  assert.equal(plan('/de/en/a', clash, { copyExists: true, targetExists: true }).action, 'conflict', '/de/de/a is another page: never removed');
});

/** An in-memory DA: path -> html; records writes and deletes. */
function fakeDa(docs) {
  const calls = [];
  return {
    calls,
    docs,
    get: async (p) => { calls.push(['GET', p]); return docs[p] ?? null; },
    put: async (p, html) => { calls.push(['POST', p]); docs[p] = html; },
    remove: async (p) => { calls.push(['DELETE', p]); delete docs[p]; },
  };
}
const fakeMerge = async (translated, existing) => (translated === existing ? null : `MERGED(${translated.length},${existing.length})`);

test('dry run: reads only; --apply merges onto the German slug and deletes the copy; same-slug pages untouched', async () => {
  const docs = { '/de/de/flight-search': TRANSLATED, '/de/de/flugsuche': EXISTING, '/de/de/homepage': '<body>keep</body>' };
  const dry = fakeDa({ ...docs });
  const [r] = await runStep({
    pages: ['/de/en/flight-search'], map: MAP, da: dry, merge: fakeMerge,
  });
  assert.equal(r.action, 'merge');
  assert.ok(dry.calls.every(([m]) => m === 'GET'), 'dry run: no writes');

  const da = fakeDa({ ...docs });
  const results = await runStep({
    pages: ['/de/en/flight-search', '/de/en/homepage'], map: MAP, da, merge: fakeMerge, apply: true,
  });
  assert.deepEqual(results.map((x) => x.action), ['merge', 'skip-same-slug']);
  assert.deepEqual(da.calls.filter(([m]) => m !== 'GET'), [['POST', '/de/de/flugsuche'], ['DELETE', '/de/de/flight-search']]);
  assert.match(da.docs['/de/de/flugsuche'], /^MERGED\(/);
  assert.equal(da.docs['/de/de/flight-search'], undefined);
  assert.equal(da.docs['/de/de/homepage'], '<body>keep</body>');
  assert.ok(!da.calls.some(([, p]) => p === '/de/de/homepage'), 'a same-slug page is not even read');
});

test('--apply moves when there is no German page; overwrite replaces; --root prefixes every DA path; --simulate never writes', async () => {
  const move = fakeDa({ '/drafts/loc-test/de/de/flight-search': TRANSLATED });
  const [m] = await runStep({
    pages: ['/de/en/flight-search'], map: MAP, da: move, merge: fakeMerge, apply: true, rootDir: '/drafts/loc-test',
  });
  assert.equal(m.action, 'move');
  assert.deepEqual(move.calls.filter(([x]) => x !== 'GET'), [['POST', '/drafts/loc-test/de/de/flugsuche'], ['DELETE', '/drafts/loc-test/de/de/flight-search']]);
  assert.match(move.docs['/drafts/loc-test/de/de/flugsuche'], /primary-language-url/);
  assert.ok(!move.docs['/drafts/loc-test/de/de/flugsuche'].includes('aem.page'));

  const over = fakeDa({ '/de/de/flight-search': TRANSLATED, '/de/de/flugsuche': EXISTING });
  const [o] = await runStep({
    pages: ['/de/en/flight-search'], map: MAP, da: over, merge: fakeMerge, apply: true, behavior: 'overwrite',
  });
  assert.equal(o.mergeResult, 'overwrite');
  assert.ok(!over.docs['/de/de/flugsuche'].startsWith('MERGED'));

  const same = fakeDa({ '/de/de/flight-search': EXISTING, '/de/de/flugsuche': EXISTING });
  const [s] = await runStep({
    pages: ['/de/en/flight-search'], map: MAP, da: same, merge: async () => null, apply: true,
  });
  assert.equal(s.mergeResult, 'identical (nothing to save)');
  assert.deepEqual(same.calls.filter(([x]) => x !== 'GET'), [['DELETE', '/de/de/flight-search']]);

  await assert.rejects(runStep({
    pages: ['/de/en/flight-search'], map: MAP, da: fakeDa({}), merge: fakeMerge, apply: true, simulate: true,
  }), /dry run only/);
});
