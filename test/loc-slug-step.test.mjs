/* eslint-disable max-len, import/extensions -- dev tooling */
/* The slug step (tools/loc/slug-step.mjs): map, German links, metadata, plan, DA calls (a fake DA,
   no network). Run: node --test test/*.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  buildSlugMap, germanHref, germanize, plan, translationPath,
} from '../tools/loc/slug-lib.mjs';
import { runStep, daClient } from '../tools/loc/slug-step.mjs';
import { scopeRows } from '../tools/loc/regional-diff.mjs';
import {
  mergeLikeTheApp, getElementMetadata, previousHashes, saveBody, parseDoc, DA_METADATA_SELECTOR,
} from '../tools/loc/da-nx.mjs';

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

/** The app's regional-diff module as a stand-in: records what the merge passes it. */
function fakeDiffModule() {
  const seen = [];
  return {
    seen,
    diff: {
      removeLocTags: () => {},
      regionalDiff: async (langstore, regional, accepted, rejected) => {
        seen.push({ accepted, rejected });
        const main = regional.querySelector('main');
        main.innerHTML = `<div><p da-diff-added="">${main.textContent.trim()}</p><da-diff-deleted><p>${langstore.querySelector('main').textContent.trim()}</p></da-diff-deleted></div>`;
        return main;
      },
    },
  };
}
const WITH_DA_METADATA = '<body><header></header><main><div><p>Flugsuche alt</p></div></main><div class="da-metadata"><div><div>acceptedHashes</div><div>a1b2c3,d4e5f6</div></div><div><div>rejectedHashes</div><div>0f9e8d</div></div><div><div>diff-label-local</div><div>Local</div></div></div><footer></footer></body>';

test('merge keeps the target\'s DA metadata: accepted and rejected differences go into the diff and are saved again', async () => {
  const app = fakeDiffModule();
  const out = await mergeLikeTheApp('<body><header></header><main><div><p>Flugsuche neu</p></div></main><footer></footer></body>', WITH_DA_METADATA, app);
  assert.deepEqual(app.seen, [{ accepted: ['a1b2c3', 'd4e5f6'], rejected: ['0f9e8d'] }]);
  // as project/index.js replaceHtml writes it: after <main>, keys and values lower-cased (getElementMetadata)
  assert.match(out, /<\/main><div class="da-metadata"><div><div>acceptedhashes<\/div><div>a1b2c3,d4e5f6<\/div><\/div><div><div>rejectedhashes<\/div><div>0f9e8d<\/div><\/div><div><div>diff-label-local<\/div><div>local<\/div><\/div><\/div><footer><\/footer><\/body>$/);
  assert.match(out, /<da-diff-deleted><p>Flugsuche neu<\/p><\/da-diff-deleted>/);
  const da = getElementMetadata(parseDoc(out).querySelector(DA_METADATA_SELECTOR));
  assert.deepEqual(previousHashes(da), { acceptedHashes: ['a1b2c3', 'd4e5f6'], rejectedHashes: ['0f9e8d'] }, 'a second merge reads the same decisions');
});

test('merge without DA metadata: empty lists, no da-metadata block (as before); same content: nothing saved', async () => {
  const app = fakeDiffModule();
  const out = await mergeLikeTheApp(TRANSLATED, EXISTING, app);
  assert.deepEqual(app.seen, [{ accepted: [], rejected: [] }]);
  assert.ok(!out.includes('da-metadata'));
  assert.match(out, /^<body><header><\/header><main>.*<\/main><footer><\/footer><\/body>$/s);
  assert.equal(await mergeLikeTheApp(WITH_DA_METADATA, WITH_DA_METADATA, app), null);
  assert.equal(saveBody('<div></div>', { 'diff-label-upstream': 'English' }), '<body><header></header><main><div></div></main><div class="da-metadata"><div><div>diff-label-upstream</div><div>English</div></div></div><footer></footer></body>');
});

/** A fetch that records each call's method and headers and answers `status`. */
function fakeFetch(status = 200) {
  const calls = [];
  const impl = async (url, opts = {}) => {
    calls.push({ url, method: opts.method || 'GET', headers: { ...opts.headers } });
    return new Response(status === 200 ? '<body>x</body>' : '', { status });
  };
  return { calls, impl };
}

test('daClient: DA_TOKEN set: every call sends Authorization: Bearer; never in an error message', async () => {
  const f = fakeFetch();
  const da = daClient(f.impl, 'secret-ims-token');
  assert.equal(await da.get('/de/de/x'), '<body>x</body>');
  await da.put('/de/de/x', '<body>y</body>');
  await da.remove('/de/de/x');
  assert.deepEqual(f.calls.map((c) => [c.method, c.headers.authorization]), [
    ['GET', 'Bearer secret-ims-token'], ['POST', 'Bearer secret-ims-token'], ['DELETE', 'Bearer secret-ims-token']]);
  assert.equal(f.calls[0].url, 'https://admin.da.live/source/moved-permanently/lh-com/de/de/x.html');
  assert.equal(f.calls[0].headers['cache-control'], 'no-cache');
  await Promise.all([401, 403].map(async (status) => {
    const denied = daClient(fakeFetch(status).impl, 'secret-ims-token');
    await assert.rejects(denied.get('/de/de/x'), (e) => {
      assert.match(e.message, new RegExp(`DA ${status}: DA_TOKEN was refused`));
      assert.ok(!e.message.includes('secret-ims-token'), 'the token is never printed');
      return true;
    });
    await assert.rejects(denied.put('/de/de/x', '<body></body>'), /DA_TOKEN was refused/);
  }));
});

test('daClient: without DA_TOKEN no Authorization header (as before)', async () => {
  const f = fakeFetch();
  const da = daClient(f.impl, undefined);
  await da.get('/de/de/x');
  await da.put('/de/de/x', '<body>y</body>');
  await da.remove('/de/de/x');
  assert.ok(f.calls.every((c) => !('authorization' in c.headers)), JSON.stringify(f.calls));
  assert.equal(await daClient(fakeFetch(404).impl, undefined).get('/de/de/missing'), null);
  await assert.rejects(daClient(fakeFetch(401).impl, undefined).get('/de/de/x'), /DA 401: no login \(set DA_TOKEN/);
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
