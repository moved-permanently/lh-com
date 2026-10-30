/* Brand themes (scripts/brand.js): only known brands, lh-com unchanged. node --test test/ */
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
  assert.equal(brandOf(meta({ brand: '../../evil' })), '', 'no arbitrary stylesheet paths');
  assert.equal(brandOf(meta({ brand: 'toString' })), '');
});

test('brand: lh-com loads no theme; every known brand has its tokens file', async () => {
  assert.equal(await loadBrandTheme(meta({})), '');
  Object.keys(BRANDS).forEach((key) => {
    const css = fs.readFileSync(new URL(`../styles/themes/${key}.css`, import.meta.url), 'utf8');
    assert.match(css, /^:root \{/m, `${key}: tokens on :root`);
    // tokens and the brand's own font faces (@font-face, ita), no rules
    const rules = css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/@font-face\s*\{[^}]*\}/g, '');
    assert.ok(!/^\s*(?!:root)[.#a-z][^{]*\{/m.test(rules), `${key}: nothing but tokens`);
  });
});
