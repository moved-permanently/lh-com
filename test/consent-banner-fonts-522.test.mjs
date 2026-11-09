/* eslint-disable max-len */
/* The look-alike consent banner and its preference center in the brand's fonts (the brief after
   518, item 3; ema-adobe found it on Air Dolomiti, where the banner was the only element asking
   for Lufthansa's fonts while the site's text is Euclid Circular B). styles/consent-banner.css
   set Lufthansa's faces for every brand (--lh-consent-head, --lh-consent-text). A brand whose theme
   has fonts of its own (its --heading-font-family and --body-font-family, styles/themes/<brand>.css)
   gets them in the banner; a brand without (lufthansa.com, Cargo, Group for Business, Discover:
   Lufthansa's faces) keeps today's stacks exactly.
   Run: node --max-old-space-size=256 --test test/consent-banner-fonts-522.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const flat = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const css = flat(fs.readFileSync(new URL('../styles/consent-banner.css', import.meta.url), 'utf8'));
const BRANDS = ['discover', 'ita', 'austrian', 'brussels', 'b2b', 'swiss', 'cargo', 'airdolomiti', 'tap'];
const fontOf = (brand, v) => (flat(fs.readFileSync(new URL(`../styles/themes/${brand}.css`, import.meta.url), 'utf8')).match(new RegExp(`--${v}-font-family: ([^,;]+)`)) || [])[1];
const ownFonts = (brand) => Boolean(fontOf(brand, 'body')) && fontOf(brand, 'body') !== 'lufthansatext';
// the brands the banner's brand rule names
const rule = css.match(/:where\(([^)]*)\) \.lh-consent \{ --lh-consent-head: var\(--heading-font-family\); --lh-consent-text: var\(--body-font-family\); \}/);
const named = rule ? rule[1].split(',').map((s) => s.trim().replace(/^body\.brand-/, '')) : [];

test('today\'s stacks stay the banner\'s own default', () => {
  assert.ok(css.includes('--lh-consent-head: lufthansahead, arial, helvetica, sans-serif;'));
  assert.ok(css.includes('--lh-consent-text: lufthansatext, arial, helvetica, sans-serif;'));
});

BRANDS.forEach((brand) => {
  test(`${brand}: ${ownFonts(brand) ? `the banner in its own fonts (${fontOf(brand, 'heading')}, ${fontOf(brand, 'body')})` : 'no fonts of its own: today\'s stacks'}`, () => {
    assert.equal(named.includes(brand), ownFonts(brand));
  });
});

test('the brands with fonts of their own: Air Dolomiti, TAP, SWISS, Austrian, Brussels, ITA', () => {
  assert.deepEqual(BRANDS.filter(ownFonts).sort(), ['airdolomiti', 'austrian', 'brussels', 'ita', 'swiss', 'tap']);
  assert.deepEqual([...named].sort(), ['airdolomiti', 'austrian', 'brussels', 'ita', 'swiss', 'tap']);
});
