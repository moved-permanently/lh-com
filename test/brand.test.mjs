/* Brand themes (scripts/brand.js): only known brands, lh-com unchanged. node --test test/ */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  brandOf, brandName, loadBrandTheme, BRANDS,
} from '../scripts/brand.js';

const meta = (values) => (name) => values[name] || '';

/** The selectors of a selector list, split on the commas outside parentheses. */
function selectorList(list) {
  const out = [];
  let depth = 0;
  let cur = '';
  [...list].forEach((c) => {
    if (c === '(') depth += 1;
    if (c === ')') depth -= 1;
    if (c === ',' && depth === 0) {
      out.push(cur.trim());
      cur = '';
    } else cur += c;
  });
  out.push(cur.trim());
  return out.filter(Boolean);
}

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

test('brand: lh-com loads no theme; the theme files are tokens, font faces and rules under the brand\'s body class only (Discover\'s, ITA\'s and Cargo\'s exist)', async () => {
  assert.equal(await loadBrandTheme(meta({})), '');
  ['discover', 'ita', 'cargo'].forEach((key) => assert.ok(fs.existsSync(new URL(`../styles/themes/${key}.css`, import.meta.url)), key));
  // Cargo: its own theme since its parity pass (brief 417, styles/themes/cargo.css)
  assert.notEqual(BRANDS.cargo.theme, false);
  Object.keys(BRANDS).filter((key) => BRANDS[key].theme !== false).forEach((key) => {
    const file = new URL(`../styles/themes/${key}.css`, import.meta.url);
    // Air Dolomiti's arrives with its session's work; until then loadBrandTheme keeps lh-com's
    if (!fs.existsSync(file)) return;
    const css = fs.readFileSync(file, 'utf8');
    assert.match(css, /^:root \{/m, `${key}: tokens on :root`);
    // tokens and the brand's own font faces (@font-face, ita); rules only under the brand's body
    // class (Discover's fields, brief 210), so a theme reaches no other brand
    // (@media and @supports wrap rules that are checked as well; @keyframes only named after the
    // brand, <key>-…, so no other brand's animation is overridden)
    const frames = [...css.matchAll(/@keyframes\s+([\w-]+)/g)].map((m) => m[1]);
    frames.forEach((name) => assert.ok(name.startsWith(`${key}-`), `${key}: @keyframes ${name}`));
    const rules = css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/@font-face\s*\{[^}]*\}/g, '')
      .replace(/@keyframes\s+[\w-]+\s*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, '')
      .replace(/@(media|supports)[^{]*\{/g, '');
    const selectors = rules.split('}').map((r) => r.split('{')[0].trim()).filter(Boolean)
      .filter((s) => s !== ':root')
      .flatMap(selectorList);
    const scope = `body.brand-${key}`;
    // the brand's body may carry more classes or states (B2B's body.brand-b2b.theme-live,
    // 1a5da3f9): the same element, still the brand's
    selectors.forEach((s) => {
      const rest = s.slice(scope.length);
      assert.ok(s.startsWith(scope) && (rest === '' || /^[ .:[]/.test(rest)), `${key}: ${s} outside ${scope}`);
    });
  });
});

test('loadBrandTheme: Cargo marks the body and loads its theme; a missing theme file (Air Dolomiti today) leaves the page as it is', async () => {
  const { parseHTML } = await import('linkedom');
  const { document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
  const saved = { document: globalThis.document, window: globalThis.window };
  globalThis.document = document;
  globalThis.window = { hlx: { codeBasePath: '' } };
  try {
    const loaded = [];
    const loader = async (href) => { loaded.push(href); throw new Error('404'); };
    assert.equal(await loadBrandTheme(meta({ brand: 'cargo' }), loader), 'cargo');
    assert.deepEqual(loaded, ['/styles/themes/cargo.css']);
    loaded.length = 0;
    assert.ok(document.body.classList.contains('brand-cargo'));
    assert.equal(await loadBrandTheme(meta({ brand: 'airdolomiti' }), loader), 'airdolomiti');
    assert.deepEqual(loaded, ['/styles/themes/airdolomiti.css']);
    assert.equal(await loadBrandTheme(meta({ brand: 'discover' }), async (href) => { loaded.push(href); }), 'discover');
    assert.equal(loaded.at(-1), '/styles/themes/discover.css');
  } finally {
    Object.assign(globalThis, saved);
  }
});

test('brand: the Message Center tenants: www\'s ita, four_y; Cargo and Air Dolomiti their own', () => {
  assert.equal(BRANDS.ita.messageCenter, 'ita');
  assert.equal(BRANDS.discover.messageCenter, 'four_y');
  assert.equal(BRANDS.cargo.messageCenter, 'cargo');
  assert.equal(BRANDS.airdolomiti.messageCenter, 'airdolomiti');
  assert.equal(BRANDS.brussels.messageCenter, 'sn');
  // where the Austrian session adds its key: the comment names its tenant
  assert.match(fs.readFileSync(new URL('../scripts/brands.js', import.meta.url), 'utf8'), /messageCenter: 'os'/);
});
