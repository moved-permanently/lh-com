/* eslint-disable max-len */
/* Austrian parity pass (brief 386, www.austrian.com's capture austrian-parity-001 of 2026-11-05,
   at/en and at/de at 390 and 1440; the rows: tools/reports/austrian/parity.md). What lies in
   Austrian's theme (styles/themes/austrian.css): tokens the shared blocks read and rules scoped to
   body.brand-austrian.
   Run: node --max-old-space-size=256 --test test/austrian-parity-386.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8').replace(/\s+/g, ' ');
const css = read('styles/themes/austrian.css');
// assert.match prints the whole stylesheet on a miss: the pattern only
const has = (re, msg) => assert.ok(re.test(css), msg ? `${msg}: ${re}` : String(re));

test('row 1, the bar as www\'s: logo 163 x 24 (122 x 18 on phones), links 16/24 regular #4d4d4d (14 px on phones), a 1 px #d1d1d1 rule', () => {
  has(/--nav-logo-height: 18px;/);
  has(/--nav-logo-height-wide: 24px;/);
  has(/--header-bar-text: #4d4d4d;/);
  has(/--header-bar-shadow: 0 1px 0 #d1d1d1;/);
  has(/--nav-bar-font-size: 14px;/);
  has(/--nav-bar-font-weight: 400;/);
  has(/@media \(width >= 768px\) \{ :root \{[^}]*--nav-bar-font-size: 16px;/);
  has(/body\.brand-austrian \.header :is\([^)]*\) \{ letter-spacing: 0\.4px; \}/, 'www tracks the bar\'s links 0.4 px');
});

test('row 2, the menu white as www\'s: red Portada tabs, CoreSans 24/26.4 500 group headings (20/22 on phones), links and extras 16/24 regular #4d4d4d', () => {
  has(/--nav-flyout-surface: #fff;/);
  has(/--nav-flyout-text: #4d4d4d;/);
  has(/--nav-flyout-heading: #1a1a1a;/);
  has(/--nav-flyout-chevron: #d81e05;/);
  has(/--nav-flyout-line: #d1d1d1;/);
  has(/--nav-flyout-link-size: 16px; --nav-flyout-link-weight: 400; --nav-flyout-link-line-height: 24px;/);
  has(/--nav-flyout-extra-size: 16px; --nav-flyout-extra-weight: 400;/);
  has(/body\.brand-austrian \.header \.nav-flyout-item \{ color: #d81e05; \}/);
  has(/body\.brand-austrian \.header \.nav-flyout-group h3 \{ font-family: var\(--body-font-family\); font-size: 20px; font-weight: 500; line-height: 22px; \}/);
});

test('rows 6 and 7: the alert strip 16/24 regular #333 in a 50 px #f6f6f6 box; the flight search\'s fields as www\'s boxes', () => {
  has(/body\.brand-austrian \.flash-teaser :is\(\.flash-teaser-link, \.flash-teaser-link:any-link\) \{ color: #333; font-size: 16px; font-weight: 400; line-height: 24px; letter-spacing: 0\.4px; \}/);
  has(/body\.brand-austrian \.flight-search \.airport-combobox input \{[^}]*height: 56px;[^}]*border: 1px solid #262626; border-radius: 8px; background-color: #f6f6f6;[^}]*font-size: 18px;/);
  has(/body\.brand-austrian \.flight-search \.flight-search-dates \{[^}]*height: 50px;[^}]*border: 1px solid #262626; border-radius: 8px; background-color: #f6f6f6;/);
  has(/body\.brand-austrian \.flight-search \.flight-search-swap \{[^}]*width: 32px; height: 32px;[^}]*background-color: #4d4d4d; color: #fff;/);
  has(/body\.brand-austrian :is\(a\.button, button\.button, \.flight-search \.flight-search-submit\) \{ font-weight: 500; letter-spacing: 1\.3px; text-transform: uppercase; \}/, 'www\'s buttons: FIND FLIGHTS');
});

test('rows 9, 10, 12, 13 and 15: headings, fare cards, pills, tiles and the accordion as www\'s', () => {
  has(/--heading-color: #000;/);
  has(/--text-color: #000;/);
  has(/--heading-light-weight: 700;/, 'www\'s h2 and h3 (heading-medium, heading-small) are 700');
  has(/body\.brand-austrian :is\(\.fare-teaser-container \.default-content-wrapper h3, \.destination-finder \.destination-finder-heading\) \{ color: #1a1a1a; font-weight: 500; \}/, 'the headline titles 500');
  has(/body\.brand-austrian \.fare-teaser \.fare-teaser-item \{[^}]*border: 1px solid #d1d1d1; border-radius: 4px;/);
  has(/body\.brand-austrian \.fare-teaser \.fare-teaser-destination \{ font-size: 18px; font-weight: 500; line-height: 19\.8px; \}/);
  has(/body\.brand-austrian \.destination-finder \.destination-finder-chip:has\(input:checked\) \{ border-color: #d81e05; background-color: #d81e05; color: #fff; \}/);
  has(/body\.brand-austrian \.cards-icon \.cards-icon-tile \{[^}]*border-color: #d1d1d1;[^}]*background-color: #fff;/);
  has(/body\.brand-austrian \.accordion-columns \.accordion-columns-title \{[^}]*font-family: var\(--body-font-family\);[^}]*font-weight: 500;/);
});

test('rows 20, 21 and 23: the breadcrumb 16/24 regular #4d4d4d, the current page red; the footer\'s headings CoreSans 18/19.8 regular and links 14/21 regular', () => {
  has(/--breadcrumb-font-size: 16px; --breadcrumb-line-height: 24px; --breadcrumb-parent-color: #4d4d4d;[^}]*--breadcrumb-current-color: #d81e05;/);
  has(/--footer-heading-size: 18px;/);
  has(/--footer-link-size: 14px; --footer-link-weight: 400; --footer-link-line-height: 21px;/);
  has(/body\.brand-austrian \.footer :is\(\.footer-column-heading, \.footer-badge-heading\) \{[^}]*font-family: var\(--body-font-family\);[^}]*font-weight: 400;/);
  has(/--footer-title-line: transparent;/, 'no rule under the column headings');
  has(/body\.brand-austrian \.footer \.footer-logo-star-alliance-horizontal img \{ width: 128px; height: auto; \}/, 'www\'s horizontal Star Alliance mark');
});

test('every rule scoped to body.brand-austrian (the brand test checks the same)', () => {
  const rules = css.replace(/\/\*.*?\*\//g, '').replace(/@font-face \{[^}]*\}/g, '').replace(/@media[^{]*\{/g, '');
  const selectors = rules.split('}').map((r) => r.split('{')[0].trim()).filter((s) => s && s !== ':root');
  // a selector list split on the commas outside parentheses (nested ones too)
  const list = (sel) => { const out = ['']; let depth = 0; [...sel].forEach((ch) => { if (ch === '(') depth += 1; if (ch === ')') depth -= 1; if (ch === ',' && depth === 0) out.push(''); else out[out.length - 1] += ch; }); return out; };
  assert.equal(selectors.filter((s) => !list(s).every((one) => one.trim().startsWith('body.brand-austrian'))).length, 0);
});
