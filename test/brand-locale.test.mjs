/* eslint-disable max-len */
/* The brand locale (scripts/locale.js on a page with `brand` metadata; scripts/brands.js
   BRAND_SITES, the one source of the roots shared with lh-edge's src/sites.js): ITA's and
   Discover's <cc>/<ll> roots are their own locales (not Lufthansa's de/en), with the root's home
   airport, the brand's www in place of www.lufthansa.com, the brand's homepages and roots.
   Cargo's and Air Dolomiti's pages (no roots) as since 170; lh-com (no brand) exactly as before.
   Run: node --max-old-space-size=512 --test test/brand-locale.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseHTML } from 'linkedom';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const L = await import('../scripts/locale.js');
const { BRAND_SITES } = await import('../scripts/brands.js');

/** Runs fn on a page with these metadata rows. */
function onPage(meta, fn) {
  const rows = Object.entries(meta).map(([k, v]) => `<meta name="${k}" content="${v}">`).join('');
  const { document } = parseHTML(`<!DOCTYPE html><html><head>${rows}</head><body></body></html>`);
  globalThis.document = document;
  try {
    return fn();
  } finally {
    delete globalThis.document;
  }
}
const ita = (fn) => onPage({ brand: 'ita' }, fn);
const discover = (fn) => onPage({ brand: 'discover' }, fn);
const pick = (l, keys = ['key', 'country', 'lang', 'base', 'root', 'homeAirport', 'versionBase', 'brand']) => Object.fromEntries(keys.filter((k) => l[k] !== undefined).map((k) => [k, l[k]]));

test('ITA: its roots are its own locales, with the root\'s home airport', () => {
  assert.deepEqual(ita(() => pick(L.getLocale('/it/en/book-and-prepare/offers'))), {
    key: 'it/en', country: 'it', lang: 'en', base: '/it/en', root: 'it/en', homeAirport: 'ROM', brand: 'ita',
  });
  assert.deepEqual(ita(() => pick(L.getLocale('/it/it/x'))), {
    key: 'it/it', country: 'it', lang: 'it', base: '/it/it', root: 'it/it', homeAirport: 'ROM', brand: 'ita',
  });
  assert.deepEqual(ita(() => pick(L.getLocale('/be/fr/x'))), {
    key: 'be/fr', country: 'be', lang: 'fr', base: '/be/fr', root: 'be/fr', homeAirport: 'PAR', versionBase: '/fr/fr', brand: 'ita',
  }, 'a market root: its language version\'s documents');
  assert.equal(ita(() => L.getLocale('/xx/ja/x')).homeAirport, 'ROM', 'no default origin: the hub');
  assert.equal(ita(() => L.getLocale('/jp/ja/x')).homeAirport, 'TYO');
  assert.equal(ita(() => L.getLocale('/jp/ja/x')).name, 'Japan | 日本語');
  assert.equal(ita(() => pick(L.getLocale('/pl/pl/x'))).key, 'it/en', 'a root the site lacks: the default');
  assert.equal(ita(() => pick(L.getLocale('/es/x/y'))).key, 'it/en');
  assert.equal(ita(() => pick(L.getLocale('/'))).key, 'it/en');
  assert.equal(ita(() => L.getLocale('/content/it/it/x')).base, '/content/it/it', 'the local dev server');
});

test('Discover: xx/fr is French, ca/en Canada\'s (Calgary), the brand\'s language versions', () => {
  assert.deepEqual(discover(() => pick(L.getLocale('/xx/fr/homepage'))), {
    key: 'xx/fr', country: 'xx', lang: 'fr', base: '/xx/fr', root: 'xx/fr', homeAirport: 'FRA', brand: 'discover',
  });
  assert.deepEqual(discover(() => pick(L.getLocale('/ca/en/homepage'))), {
    key: 'ca/en', country: 'ca', lang: 'en', base: '/ca/en', root: 'ca/en', homeAirport: 'YYC', versionBase: '/de/en', brand: 'discover',
  });
  assert.equal(discover(() => L.getLocale('/ca/en/x')).name, 'Canada | English', 'www\'s label');
  assert.equal(discover(() => L.getLocale('/us/de/x')).homeAirport, 'TPA');
});

test('homepages, the www origin, the roots: the brand\'s on its pages', () => {
  assert.equal(ita(() => L.getHomepageUrl('CA', 'fr')), '/ca/fr/homepage');
  assert.equal(ita(() => L.getHomepageUrl('pl', 'pl')), 'https://www.ita-airways.com/pl/pl/homepage');
  assert.equal(discover(() => L.getHomepageUrl('ca', 'en')), '/ca/en/homepage');
  assert.equal(discover(() => L.getHomepageUrl('de', 'fr')), 'https://www.discover-airlines.com/de/fr/homepage');
  assert.equal(ita(() => L.siteOrigin()), 'https://www.ita-airways.com');
  assert.equal(onPage({ brand: 'cargo' }, () => L.siteOrigin()), 'https://www.lufthansa-cargo.com');
  assert.equal(L.siteOrigin(), L.LIVE_ORIGIN);
  assert.equal(onPage({}, () => L.siteOrigin()), 'https://www.lufthansa.com');
  assert.ok(ita(() => L.isMigratedLocale('be', 'fr')));
  assert.ok(!ita(() => L.isMigratedLocale('de', 'fr')));
  const roots = ita(() => L.siteLocales());
  assert.deepEqual(Object.keys(roots), Object.keys(BRAND_SITES.ita.rows));
  assert.equal(roots['it/it'].name, 'Italia | Italiano');
  assert.ok(onPage({}, () => L.siteLocales()) === L.LOCALES, 'lh-com: LOCALES');
  assert.ok(onPage({ brand: 'cargo' }, () => L.siteLocales()) === L.LOCALES, 'no roots: LOCALES (Cargo has its own switch)');
  assert.deepEqual(ita(() => L.ownRoots()), ['it/en', 'it/it', 'fr/fr', 'es/es', 'de/de', 'nl/nl', 'br/pt', 'gr/el', 'jp/ja']);
  assert.deepEqual(discover(() => L.ownRoots()), ['de/en', 'de/de', 'xx/fr', 'us/en', 'ca/en', 'xx/en', 'us/de', 'xx/de', 'ca/fr'], 'Discover: every root with a name');
});

test('getCounterpartPath on a brand: the target root\'s homepage', async () => {
  assert.equal(await ita(() => L.getCounterpartPath('fr/fr', '/it/it/x')), '/fr/fr/homepage');
  assert.equal(await ita(() => L.getCounterpartPath('pl/pl', '/it/it/x')), 'https://www.ita-airways.com/pl/pl/homepage');
});

test('lh-com (no brand), Cargo and Air Dolomiti: exactly the previous locale.js', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'locale-old-'));
  const abs = (f) => pathToFileURL(path.join(root, 'scripts', f)).href;
  // the previous locale.js (170's, the last before the brand roots)
  const old = execFileSync('git', ['show', '4df7eac:scripts/locale.js'], { cwd: root, encoding: 'utf8' })
    .replace("from './locale-table.js'", `from '${abs('locale-table.js')}'`)
    .replace("from './site-languages.js'", `from '${abs('site-languages.js')}'`);
  fs.writeFileSync(path.join(dir, 'old.mjs'), old);
  const O = await import(pathToFileURL(path.join(dir, 'old.mjs')).href);
  const paths = ['/de/en/x', '/de/de/homepage', '/at/de/x', '/gb/en/x', '/ch/de/x', '/it/en/x', '/it/it/x', '/xx/fr/x', '/us/en/ccpa', '/xf/lh/x', '/x', '/', '/content/de/en/x', '/content/lh/markets/de/en/lounges', '/en/home', '/de/ci/x', '/voli/x'];
  [{}, { brand: 'cargo', language: 'en' }, { brand: 'cargo', language: 'de' }, { brand: 'airdolomiti' }, { brand: 'unknown' }].forEach((meta) => {
    paths.forEach((p) => {
      assert.deepEqual(onPage(meta, () => L.getLocale(p)), onPage(meta, () => O.getLocale(p)), `${JSON.stringify(meta)} ${p}`);
    });
    [['de', 'en'], ['it', 'it'], ['CA', 'en'], ['gb', 'en']].forEach(([c, l]) => {
      assert.equal(onPage(meta, () => L.getHomepageUrl(c, l)), onPage(meta, () => O.getHomepageUrl(c, l)), `${JSON.stringify(meta)} ${c}/${l}`);
      assert.equal(onPage(meta, () => L.isMigratedLocale(c, l)), onPage(meta, () => O.isMigratedLocale(c, l)));
    });
  });
  // no page at all (lh-edge bundles locale.js): lh-com's
  assert.equal(L.getHomepageUrl('it', 'it'), O.getHomepageUrl('it', 'it'));
  assert.ok(L.LOCALES === L.siteLocales());
  fs.rmSync(dir, { recursive: true, force: true });
});
