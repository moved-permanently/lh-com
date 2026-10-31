/* Brand themes (scripts/brand.js): only known brands, lh-com unchanged. node --test test/ */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  brandOf, brandName, loadBrandTheme, BRANDS,
} from '../scripts/brand.js';

const meta = (values) => (name) => values[name] || '';

test('brand: only known keys count; lh-com (no key) is Lufthansa', () => {
  assert.equal(brandOf(meta({})), '');
  assert.equal(brandName(meta({})), 'Lufthansa');
  assert.equal(brandOf(meta({ brand: ' Discover ' })), 'discover');
  assert.equal(brandName(meta({ brand: 'discover' })), 'Discover Airlines');
  assert.equal(brandOf(meta({ brand: 'ita' })), 'ita');
  assert.equal(brandName(meta({ brand: 'ita' })), 'ITA Airways');
  assert.equal(brandName(meta({ brand: 'cargo' })), 'Lufthansa Cargo');
  assert.equal(brandName(meta({ brand: 'airdolomiti' })), 'Air Dolomiti');
  assert.equal(brandOf(meta({ brand: '../../evil' })), '', 'no arbitrary stylesheet paths');
  assert.equal(brandOf(meta({ brand: 'toString' })), '');
});

test('brand: lh-com loads no theme; the theme files are tokens only (Discover\'s and ITA\'s exist)', async () => {
  assert.equal(await loadBrandTheme(meta({})), '');
  ['discover', 'ita'].forEach((key) => assert.ok(fs.existsSync(new URL(`../styles/themes/${key}.css`, import.meta.url)), key));
  assert.equal(BRANDS.cargo.theme, false, 'Cargo: Lufthansa\'s look, no theme file');
  Object.keys(BRANDS).filter((key) => BRANDS[key].theme !== false).forEach((key) => {
    const file = new URL(`../styles/themes/${key}.css`, import.meta.url);
    // Air Dolomiti's arrives with its session's work; until then loadBrandTheme keeps lh-com's
    if (!fs.existsSync(file)) return;
    const css = fs.readFileSync(file, 'utf8');
    assert.match(css, /^:root \{/m, `${key}: tokens on :root`);
    // tokens and the brand's own font faces (@font-face, ita), no rules
    const rules = css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/@font-face\s*\{[^}]*\}/g, '');
    assert.ok(!/^\s*(?!:root)[.#a-z][^{]*\{/m.test(rules), `${key}: nothing but tokens`);
  });
});

test('loadBrandTheme: Cargo marks the body and loads no theme; a missing theme file (Air Dolomiti today) leaves the page as it is', async () => {
  const { parseHTML } = await import('linkedom');
  const { document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
  const saved = { document: globalThis.document, window: globalThis.window };
  globalThis.document = document;
  globalThis.window = { hlx: { codeBasePath: '' } };
  try {
    const loaded = [];
    const loader = async (href) => { loaded.push(href); throw new Error('404'); };
    assert.equal(await loadBrandTheme(meta({ brand: 'cargo' }), loader), 'cargo');
    assert.deepEqual(loaded, []);
    assert.ok(document.body.classList.contains('brand-cargo'));
    assert.equal(await loadBrandTheme(meta({ brand: 'airdolomiti' }), loader), 'airdolomiti');
    assert.deepEqual(loaded, ['/styles/themes/airdolomiti.css']);
    assert.equal(await loadBrandTheme(meta({ brand: 'discover' }), async (href) => { loaded.push(href); }), 'discover');
    assert.equal(loaded.at(-1), '/styles/themes/discover.css');
  } finally {
    Object.assign(globalThis, saved);
  }
});

test('brand: the Message Center tenants (www\'s): ita, four_y; Cargo and Air Dolomiti none', () => {
  assert.equal(BRANDS.ita.messageCenter, 'ita');
  assert.equal(BRANDS.discover.messageCenter, 'four_y');
  assert.equal(BRANDS.cargo.messageCenter, undefined);
  assert.equal(BRANDS.airdolomiti.messageCenter, undefined);
  // where the Austrian session adds its key: the comment names its tenant
  assert.match(fs.readFileSync(new URL('../scripts/brand.js', import.meta.url), 'utf8'), /messageCenter: 'os'/);
});
