/* eslint-disable max-len, import/extensions, no-restricted-syntax, no-await-in-loop -- dev tooling */
/* One slug in every language (Ben's rule, tools/slugs/README.md): the write step maps a page's www path through its site's
   map (tools/slugs/<site>.json) to the canonical path, the English slug, for active entries only; its internal links the
   same way; a write to a localized slug of an active entry is refused with the canonical path; an author's hold follows the
   page to its canonical path; a page the map does not know is reported, and falls back to the English slug only where the
   correspondence is verified (the document's primary-language-url) and its root is on. With every flag off nothing changes.
   TAP, Air Dolomiti and ITA have no map: their paths, links and app-shell decisions are exactly as before.
   The maps are read, never written; a flag is switched on only in a copy in memory.
   Run: node --test test/slug-write.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  slugMapOf, writeTarget, slugRefusal, holdAt, unmappedEntry,
} from '../tools/importer/slug-write.mjs';
import { withCanonicalLinks } from '../tools/importer/own-links.mjs';
import { loadMap } from '../tools/slugs/lib.mjs';
import { APP_SHELL } from '../tools/importer/da-upload-sites.mjs';

const read = (site) => JSON.parse(fs.readFileSync(new URL(`../tools/slugs/${site}.json`, import.meta.url), 'utf8'));
// a copy of a real map with roots switched on (the file keeps its flags off)
const withRoots = (site, roots) => {
  const m = read(site);
  roots.forEach((r) => { m.active[r] = true; });
  return loadMap(m);
};
const off = slugMapOf('lh-com');
const on = withRoots('lh-com', ['de/de', 'at/de']);

test('the files keep every flag off; the site maps load, TAP, Air Dolomiti and ITA have none', () => {
  ['lh-com', 'lh-swiss', 'lh-austrian', 'lh-brussels', 'lh-discover', 'lh-cargo', 'lh-b2b'].forEach((s) => {
    const m = slugMapOf(s);
    assert.ok(m, s);
    assert.deepEqual(Object.values(m.map.active).filter(Boolean), [], `${s}: flags off`);
  });
  ['lh-tap', 'lh-airdolomiti', 'lh-ita'].forEach((s) => assert.equal(slugMapOf(s), null, s));
});

test('flags off: every path is written where it is, no write is refused', () => {
  ['/de/de/gepaeck', '/at/de/anmeldung', '/de/en/baggage', '/de/de/homepage', '/fr/fr/bagages'].forEach((p) => {
    assert.equal(writeTarget(p, off), p);
    assert.equal(slugRefusal(p, off), null);
  });
  const m = slugMapOf('lh-com');
  const refused = m.entries().map(([r, s]) => `/${r}${s}`).filter((p) => slugRefusal(p, m));
  assert.deepEqual(refused, []);
});

test('an active entry: the www path is written at the canonical path; the localized slug is refused, with the canonical path', () => {
  assert.equal(writeTarget('/de/de/gepaeck', on), '/de/de/baggage');
  assert.equal(writeTarget('/at/de/gepaeck', on), '/at/de/baggage');
  assert.equal(writeTarget('/de/en/baggage', on), '/de/en/baggage');
  // a root not switched on keeps its slug
  assert.equal(writeTarget('/fr/fr/bagages', on), '/fr/fr/bagages');
  assert.equal(slugRefusal('/de/de/baggage', on), null);
  assert.match(slugRefusal('/de/de/gepaeck', on), /\/de\/de\/baggage/);
  assert.equal(slugRefusal('/fr/fr/bagages', on), null);
});

test('internal links go to the canonical path for active entries only (query and fragment kept); others as they were', () => {
  const doc = '<p><a href="/de/de/gepaeck">Gepäck</a> <a href="/at/de/gepaeck?x=1#y">AT</a> <a href="/fr/fr/bagages">FR</a> <a href="https://www.lufthansa.com/de/de/gepaeck">www</a> <a href="/de/de/nav">nav</a></p><div><div>Parent</div><div><a href="/de/de/gepaeck">/de/de/gepaeck</a></div></div>';
  const r = withCanonicalLinks(doc, on);
  assert.equal(r.doc, '<p><a href="/de/de/baggage">Gepäck</a> <a href="/at/de/baggage?x=1#y">AT</a> <a href="/fr/fr/bagages">FR</a> <a href="https://www.lufthansa.com/de/de/gepaeck">www</a> <a href="/de/de/nav">nav</a></p><div><div>Parent</div><div><a href="/de/de/baggage">/de/de/baggage</a></div></div>');
  assert.equal(r.moved, 4);
  assert.equal(withCanonicalLinks(doc, off).doc, doc);
  assert.equal(withCanonicalLinks(doc, null).doc, doc);
});

test('an author\'s hold follows the page: a hold on /de/de/gepaeck protects /de/de/baggage once de/de is on', () => {
  const hold = { by: 'Ben', skip: true };
  const edits = { '/de/de/gepaeck': hold };
  assert.equal(holdAt('/de/de/baggage', '/de/de/gepaeck', edits, on), hold);
  // the same hold found from the canonical path alone (a list naming our path)
  assert.equal(holdAt('/de/de/baggage', '/de/de/baggage', edits, on), hold);
  // flags off: the page stays at its www path and the hold where it was
  assert.equal(holdAt('/de/de/gepaeck', '/de/de/gepaeck', edits, off), hold);
  assert.equal(holdAt('/de/de/homepage', '/de/de/homepage', edits, on), undefined);
});

test('a page the map does not know: reported; the English slug only when verified and its root is on, else its path', () => {
  const doc = (primary) => `<div class="metadata">${primary ? `<div><div>primary-language-url</div><div>${primary}</div></div>` : ''}</div>`;
  const verified = unmappedEntry('/de/de/neue-seite', doc('/de/en/new-page'), on);
  assert.deepEqual(verified, {
    path: '/de/de/neue-seite', source: '/de/en/new-page', verified: true, target: '/de/de/new-page',
  });
  const verifiedOff = unmappedEntry('/de/de/neue-seite', doc('/de/en/new-page'), off);
  assert.deepEqual(verifiedOff, {
    path: '/de/de/neue-seite', source: '/de/en/new-page', verified: true, target: '/de/de/neue-seite',
  });
  const unverified = unmappedEntry('/de/de/andere-seite', doc(null), on);
  assert.deepEqual(unverified, {
    path: '/de/de/andere-seite', source: null, verified: false, target: '/de/de/andere-seite',
  });
  // a page the map knows, the source root, nav and fragments, an exception: not reported
  assert.equal(unmappedEntry('/de/de/gepaeck', doc(null), on), null);
  assert.equal(unmappedEntry('/de/en/new-page', doc(null), on), null);
  assert.equal(unmappedEntry('/de/de/nav', doc(null), on), null);
  assert.equal(unmappedEntry('/de/de/fragments/x', doc(null), on), null);
});

test('the login shell keeps being refused under its canonical path (www /de/de/anmeldung is /de/de/login)', () => {
  assert.equal(writeTarget('/de/de/anmeldung', on), '/de/de/login');
  assert.ok(APP_SHELL.test(writeTarget('/de/de/anmeldung', on)));
});

test('Brussels, Discover, Cargo and Group for Business list no group: with every root on, nothing moves and nothing is refused', () => {
  ['lh-brussels', 'lh-discover', 'lh-cargo', 'lh-b2b'].forEach((s) => {
    const m = read(s);
    Object.keys(m.active).forEach((r) => { m.active[r] = true; });
    const map = loadMap(m);
    assert.deepEqual(map.entries(), [], s);
    ['/be/fr/bagages', '/de/de/gepaeck', '/en/products', '/de/en/login'].forEach((p) => {
      assert.equal(writeTarget(p, map), p);
      assert.equal(slugRefusal(p, map), null);
      assert.equal(unmappedEntry(p, '<div class="metadata"></div>', map), null);
    });
  });
});

test('TAP, Air Dolomiti and ITA: every allowlist path written at itself, app-shell decisions as before, documents\' links unchanged', async () => {
  const { siteSettings } = await import('../tools/importer/da-upload-sites.mjs');
  const repo = new URL('..', import.meta.url).pathname;
  for (const site of ['lh-tap', 'lh-airdolomiti', 'lh-ita']) {
    const map = slugMapOf(site);
    assert.equal(map, null, site);
    const { paths } = JSON.parse(fs.readFileSync(new URL(`../tools/importer/sites/${site}.json`, import.meta.url), 'utf8'));
    const s = await siteSettings(repo, async () => new Set(), { site });
    paths.forEach((p) => {
      assert.equal(writeTarget(p, map), p);
      assert.equal(slugRefusal(p, map), null);
      assert.equal(s.appShell(writeTarget(p, map)), s.appShell(p));
    });
    const dir = new URL(`../content-sites/${site}/content/`, import.meta.url).pathname;
    const docs = fs.existsSync(dir) ? fs.readdirSync(dir, { recursive: true }).filter((f) => f.endsWith('.plain.html')).slice(0, 300) : [];
    docs.forEach((f) => {
      const text = fs.readFileSync(dir + f, 'utf8');
      assert.equal(withCanonicalLinks(text, map).doc, text, `${site} ${f}`);
    });
  }
});
