/* eslint-disable max-len */
/* Discover parity pass (brief 387, www.discover-airlines.com's capture discover-parity-001 of 2026-11-05,
   de/en and de/de at 390 and 1440; the rows: tools/reports/discover/parity.md). What lies in
   Discover's theme (styles/themes/discover.css): tokens the shared blocks read and rules scoped to
   body.brand-discover.
   Run: node --max-old-space-size=256 --test test/discover-parity-387.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8').replace(/\s+/g, ' ');
const css = read('styles/themes/discover.css');
// assert.match prints the whole stylesheet on a miss: the pattern only
const has = (re, msg) => assert.ok(re.test(css), msg ? `${msg}: ${re}` : String(re));

test('row 1, the bar as www\'s: quick links and Menu LufthansaHead 18/24 bold from 1025 px (14/18 below), Login 18/24; the logo 110 x 38 on phones', () => {
  has(/--nav-logo-height: 38px;/);
  has(/--nav-logo-height-wide: 40px;/);
  has(/@media \(width >= 1025px\) \{ :root \{[^}]*--nav-bar-font-size: 18px;/);
  has(/body\.brand-discover \.header :is\(\.nav-quick-link, \.nav-menu-button \.nav-tool-label\) \{ font-family: var\(--heading-font-family\); \}/);
  has(/@media \(width >= 1025px\) \{ body\.brand-discover \.header :is\(\.nav-quick-link, \.nav-tool-label\) \{ line-height: 24px; \}/);
});

test('rows 2 and 3: headings dark sky blue (#003e7b, the hero card\'s too); copy and links night sky blue 16/24', () => {
  has(/--heading-color: #003e7b;/);
  has(/--hero-card-heading-color: #003e7b;/);
  has(/--text-color: #002554;/);
  has(/--link-color: #002554;/);
  has(/--body-font-size-m: 16px;/, 'www\'s copy (copytext-medium) is 16/24');
  has(/--discover-field-font: 18px;/, 'www\'s fields keep 18 px');
  assert.ok(!/font-size: var\(--body-font-size-m\)/.test(css), 'the fields read --discover-field-font, not the copy size');
});

test('row 4: Discover\'s copytext headings: heading-copytext-large 16 to 18 px, heading-copytext-medium 14 to 16 px (lh-com\'s 20 to 24, 16 to 18)', () => {
  has(/--heading-font-size-m: clamp\(16px, calc\(16px \+ 2 \* \(100vw - 375px\) \/ 1065\), 18px\);/);
  has(/--heading-font-size-s: clamp\(14px, calc\(14px \+ 2 \* \(100vw - 375px\) \/ 1065\), 16px\);/);
});

test('rows 5 to 7: buttons LufthansaHead 20/24; the hero card\'s eyebrow 24/26.4 regular; accordion titles LufthansaHead 20/26 sky blue; the travellers button 18/24', () => {
  has(/--button-font-size: 20px;/);
  has(/body\.brand-discover :is\(a\.button, button\.button, \.flight-search \.flight-search-submit\) \{ font-family: var\(--heading-font-family\); \}/);
  has(/body\.brand-discover \.hero-card-overlay \.hero-card-overlay-eyebrow \{[^}]*font-size: clamp\(16px, calc\(16px \+ 8 \* \(100vw - 375px\) \/ 1065\), 24px\);[^}]*font-weight: 400;/);
  has(/body\.brand-discover \.accordion-columns \.accordion-columns-title \{[^}]*color: #1e73af;[^}]*font-size: 20px;[^}]*line-height: 26px;/);
  has(/body\.brand-discover \.flight-search \.flight-search-travellers \{[^}]*font-family: var\(--heading-font-family\);[^}]*font-size: 18px;[^}]*line-height: 24px;/);
});

test('row 8: the icon tiles white with www\'s 30 % dark sky blue border, 10 px corners and soft shadow; labels night sky blue', () => {
  has(/body\.brand-discover \.cards-icon \.cards-icon-tile \{[^}]*border: 1px solid rgb\(0 62 123 \/ 30%\);[^}]*border-radius: 10px;[^}]*background-color: #fff;[^}]*box-shadow: 0 4px 12px rgb\(0 37 84 \/ 10%\);/);
  has(/body\.brand-discover \.cards-icon \.cards-icon-label \{ color: #002554; \}/);
});

test('row 9: the footer as www\'s: the yellow and light blue stripes over sky blue, headings 18/19.8 without a rule, links 14/18 #f4f4f4, the logo row dark then night sky blue', () => {
  has(/--footer-surface: #1e73af;/);
  has(/--footer-heading-size: 18px;/);
  has(/--footer-title-line: transparent;/);
  has(/--footer-link-size: 14px;/);
  has(/--footer-link-line-height: 18px;/);
  has(/--footer-link-color: #f4f4f4;/);
  // on sky blue: white 5.09:1, #f4f4f4 4.63:1 (lh-com's muted #b4b4b4 2.45, the language button's #ebebeb 4.27)
  has(/--footer-locale-color: #fff;/);
  has(/--footer-muted-text: #f4f4f4;/);
  has(/body\.brand-discover \.footer \.footer-main \{ background-image: linear-gradient\(#ffcd00 0 20px, #6aaae4 20px 44px, #1e73af 44px\); \}/);
  has(/body\.brand-discover \.footer \.footer-logos \{ background-image: linear-gradient\(#003e7b 0 115px, #002554 115px\); \}/);
  has(/@media \(width >= 768px\) \{ body\.brand-discover \.footer \.footer-logos \{ background-image: linear-gradient\(#003e7b 0 69px, #002554 69px\); \}/);
});

test('rows 10 and 11: the teaser cards\' titles (carousel-cards grid) LufthansaHead 14 to 16 px night sky blue, as www\'s teaser-heading; links in running text regular, as www\'s .richtext a', () => {
  has(/body\.brand-discover \.carousel-cards:is\(\.grid, \.four-up\) \.carousel-cards-slide:not\(\.carousel-cards-wide\) \.carousel-cards-body > :is\(h1, h2, h3, h4, h5, h6\) \{[^}]*color: #002554;[^}]*font-size: var\(--heading-font-size-s\);/);
  has(/body\.brand-discover main :is\(\.default-content-wrapper, \.columns-media-text\) :is\(p:not\(\.link-wrapper, \.button-wrapper\), li\) a:any-link:not\(\.button\) \{ font-weight: 400; \}/);
});

test('rows 12 and 13: a tab set\'s panels on phones titled LufthansaHead 20/26 sky blue (www\'s accordion of the tab control); the offers page\'s filter titles bold and 18 px, its toggles LufthansaHead 18/24', () => {
  has(/body\.brand-discover \.section-tab-panel > \.section-tab-toggle \{[^}]*color: #1e73af;[^}]*font-family: var\(--heading-font-family\);[^}]*font-size: 20px;[^}]*line-height: 26px;/);
  has(/body\.brand-discover \.destination-finder \.destination-finder-filters-heading \{ font-weight: 700; \}/);
  has(/body\.brand-discover \.destination-finder \.destination-finder-filter-heading \{ font-size: 18px; \}/);
  has(/body\.brand-discover \.destination-finder :is\(\.destination-finder-conditions-toggle, \.destination-finder-activities-toggle, \.destination-finder-filters-toggle\) \{[^}]*font-family: var\(--heading-font-family\);[^}]*font-size: 18px;[^}]*line-height: 24px;/);
});

test('every rule scoped to body.brand-discover (the brand test checks the same)', () => {
  const rules = css.replace(/\/\*.*?\*\//g, '').replace(/@font-face \{[^}]*\}/g, '').replace(/@media[^{]*\{/g, '');
  const selectors = rules.split('}').map((r) => r.split('{')[0].trim()).filter((s) => s && s !== ':root');
  const list = (sel) => { const out = ['']; let depth = 0; [...sel].forEach((ch) => { if (ch === '(') depth += 1; if (ch === ')') depth -= 1; if (ch === ',' && depth === 0) out.push(''); else out[out.length - 1] += ch; }); return out; };
  assert.equal(selectors.filter((s) => !list(s).every((one) => one.trim().startsWith('body.brand-discover'))).length, 0);
});
