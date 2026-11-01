/* eslint-disable max-len */
/* Lufthansa Group for Business (lh-b2b, business.lufthansagroup.com) as a brand: the values of
   www's de/en and de/de homepages (2026-11-01): OneTrust id, portal B2BNEO (meta X-Portal), Message
   Center tenant b2b, the favicon at www's path (no manifest); the theme styles/themes/b2b.css: the
   group design system's b2b.css (v1.38.0, maui-theme-b2b) on lh-com's token names: the palette is
   Lufthansa's, primary buttons deep blue with white text, LufthansaHead Thin (www's face for the
   h1's weight 200) uppercase headlines, LufthansaText Light copy 18/24, the floating header bar and
   the footer's gradient. The shared tokens the theme sets default to lh-com's values.
   Run: node --max-old-space-size=512 --test test/brand-b2b.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.location = {
  hostname: 'main--lh-b2b--moved-permanently.aem.page', pathname: '/de/en/homepage', search: '', href: 'https://main--lh-b2b--moved-permanently.aem.page/de/en/homepage', origin: 'https://main--lh-b2b--moved-permanently.aem.page',
};
window.hlx = { codeBasePath: '' };
globalThis.window = window;
const {
  BRANDS, brandOf, brandName, oneTrustId, brandIcons, brandWwwHost, isOwnWwwHost, isSitePreviewHost, siteTitleSuffix,
} = await import('../scripts/brand.js');

const meta = (values) => (name) => values[name] || '';
const b2b = meta({ brand: 'b2b' });
const read = (f) => fs.readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');
const tokenOf = (css) => (name) => (css.match(new RegExp(`^\\s*${name}:\\s*([^;]+);`, 'm')) || [])[1];

test('the entry: name, OneTrust, www, portal, Message Center tenant', () => {
  assert.equal(brandOf(b2b), 'b2b');
  assert.equal(brandName(b2b), 'Lufthansa Group for Business');
  assert.equal(oneTrustId(b2b), '01a08598-d052-711c-9ff4-2def82055cba');
  assert.equal(brandWwwHost(b2b), 'business.lufthansagroup.com');
  assert.ok(isOwnWwwHost('business.lufthansagroup.com', b2b));
  assert.ok(isSitePreviewHost('main--lh-b2b--moved-permanently.aem.page', b2b));
  assert.equal(BRANDS.b2b.portal, 'B2BNEO', 'www\'s meta X-Portal');
  assert.equal(BRANDS.b2b.messageCenter, 'b2b');
  assert.match(' | Lufthansa Group for Business', siteTitleSuffix(b2b));
});

test('lh-com (no brand key) as before', () => {
  const none = meta({});
  assert.equal(brandOf(none), '');
  assert.equal(brandName(none), 'Lufthansa');
  assert.equal(oneTrustId(none), '01994cb2-af99-7dbe-8fb0-56427773e54e');
});

test('the favicon at www\'s path, the copy in the code; www links no manifest', () => {
  assert.deepEqual(brandIcons(b2b), { icon: '/etc/designs/b2b-neo/favicon.ico', type: 'image/ico', manifest: '' });
  const ico = fs.readFileSync(new URL('../etc/designs/b2b-neo/favicon.ico', import.meta.url));
  assert.deepEqual([...ico.subarray(0, 4)], [0, 0, 1, 0], 'an .ico file');
});

test('the theme: LufthansaHead Thin for the light headline, Lufthansa\'s palette, deep blue primary buttons', () => {
  const css = read('styles/themes/b2b.css');
  const token = tokenOf(css);
  // www's b2b.css maps LufthansaHead 100 to LufthansaHeadWeb-Thin: the h1's 200 draws Thin; the
  // other faces are lh-com's (styles/fonts.css, the same files); business.lufthansagroup.com sends
  // its fonts without CORS, www.lufthansa.com the same file with access-control-allow-origin: *
  assert.match(css, /font-family: LufthansaHead;\s*font-style: normal;\s*font-weight: 100;/);
  assert.ok(css.includes("url('/digitalhangar/design-system/releases/v1.38.0/standalone/fonts/lufthansa/LufthansaHeadWeb-Thin.woff2') format('woff2')"));
  assert.ok(css.includes("url('https://www.lufthansa.com/digitalhangar/design-system/releases/v1.38.0/standalone/fonts/lufthansa/LufthansaHeadWeb-Thin.woff2') format('woff2')"));
  assert.equal(token('--text-color'), '#05164d');
  assert.equal(token('--heading-color'), '#05164d');
  assert.equal(token('--lh-yellow'), '#05164d', 'primary actions deep blue (buttonprimary)');
  assert.equal(token('--lh-sunglow-yellow'), '#000245', 'their hover (lhdarkblue)');
  assert.equal(token('--button-primary-text'), '#fff');
  assert.equal(token('--button-accent-color'), '#4d7b93', 'buttonsecondary: b2b-blue');
  assert.equal(token('--link-color'), '#52627c', 'interaction: whale blue');
  assert.equal(token('--link-hover-color'), '#414e63');
  assert.equal(token('--focus-color'), '#0968f6');
  assert.equal(token('--lh-midnight'), '#031029');
});

test('the theme: type as www\'s (h1 Thin uppercase, h2 and h3 regular, copy Light 18/24)', () => {
  const token = tokenOf(read('styles/themes/b2b.css'));
  assert.equal(token('--heading-large-weight'), '200');
  assert.equal(token('--heading-large-transform'), 'uppercase');
  assert.equal(token('--heading-light-weight'), '400', 'h2 and h3 LufthansaHead 400 (Light)');
  assert.equal(token('--body-font-weight'), '300');
  assert.equal(token('--body-font-size-m'), '18px');
  assert.equal(token('--body-line-height'), '1.3334');
});

test('the theme: the floating header bar, the footer\'s gradient with white text', () => {
  const token = tokenOf(read('styles/themes/b2b.css'));
  assert.equal(token('--header-bar-surface'), '#fff');
  assert.equal(token('--header-bar-inset'), '15px');
  assert.equal(token('--header-bar-radius'), '12px');
  assert.equal(token('--header-bar-shadow'), 'rgb(0 0 0 / 10%) 0 2px 8px');
  assert.equal(token('--header-bar-padding'), '23px 24px', 'the logo 24 px inside the bar, the bar 81 px high');
  assert.equal(token('--footer-surface-image'), 'linear-gradient(135deg, #2254bb 0%, #021959 100%)');
  assert.equal(token('--footer-surface'), 'transparent');
  assert.equal(token('--footer-logos-surface'), 'transparent');
  assert.equal(token('--footer-muted-text'), '#fff');
});

test('the shared tokens default to lh-com\'s values', () => {
  const styles = read('styles/styles.css');
  assert.match(styles, /\nh1 \{[^}]*font-weight: var\(--heading-large-weight, 700\);[^}]*text-transform: var\(--heading-large-transform, none\);/);
  assert.match(styles, /\.heading-large \{[^}]*font-weight: var\(--heading-large-weight, 700\);[^}]*text-transform: var\(--heading-large-transform, none\);/);
  assert.match(styles, /\nbody \{[^}]*font-weight: var\(--body-font-weight, 400\);/);
  assert.match(styles, /a\.button\.accent,\s*button\.button\.accent \{[^}]*background-color: var\(--button-accent-color, var\(--lh-deepblue\)\);/);
  assert.match(styles, /button\.button\.accent:focus-visible \{[^}]*background-color: var\(--button-accent-hover, var\(--lh-marble-blue\)\);/);
  const header = read('blocks/header/header.css');
  assert.match(header, /\.header \.nav-wrapper \{[^}]*inset: var\(--header-bar-inset, 0\) var\(--header-bar-inset, 0\) auto;[^}]*border-radius: var\(--header-bar-radius, 0\);[^}]*box-shadow: var\(--header-bar-shadow, none\);/);
  // the bar's padding: lh-com's per breakpoint (phones, 768, 1025, 1281 px)
  ['24px 22px 10px', '23px 24px', '23px 80px', '23px 88px'].forEach((v) => assert.ok(header.includes(`padding: var(--header-bar-padding, ${v});`), v));
  const footer = read('blocks/footer/footer.css');
  assert.match(footer, /\n\.footer \{[^}]*background-image: var\(--footer-surface-image, none\);/);
  // lh-com's own stylesheet sets none of them
  ['--heading-large-weight', '--heading-large-transform', '--body-font-weight', '--button-accent-color', '--header-bar-inset', '--header-bar-radius', '--header-bar-shadow', '--footer-surface-image'].forEach((t) => {
    assert.ok(!new RegExp(`^\\s*${t}:`, 'm').test(styles), `${t} not set in styles.css`);
  });
});
