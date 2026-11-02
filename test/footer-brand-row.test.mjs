/* eslint-disable max-len */
/* The footer's brand row (blocks/footer buildBrandRow; section Style: brand-row), as
   business.lufthansagroup.com's footer (2026-11-02): the white logo left of the tagline ("Best
   choice for your business", 40px/52px) above the line, and below it in one row the © note, the
   legal links, the social badges and the country and language button (from 1025px; stacked below,
   badges and locale side by side). Footers without the section as before.
   Run: node --max-old-space-size=512 --test test/footer-brand-row.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.hlx = { codeBasePath: '' };
window.location = {
  hostname: 'main--lh-com--moved-permanently.aem.page', pathname: '/', search: '', replace: () => {}, href: 'https://main--lh-com--moved-permanently.aem.page/', origin: 'https://main--lh-com--moved-permanently.aem.page',
};
window.origin = window.location.origin;
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
globalThis.window = window;
globalThis.document = document;
const { buildBrandRow } = await import('../blocks/footer/footer.js');

const section = (html) => {
  const s = document.createElement('div');
  s.className = 'section brand-row';
  s.innerHTML = `<div class="default-content-wrapper">${html}</div>`;
  return s;
};

test('the brand row: the logo, then the tagline', () => {
  const row = buildBrandRow([section('<p><picture><img src="https://business.lufthansagroup.com/content/dam/b2bneo/b2b-logo-icons/LHG_Logo_for-Business_Horizontal-standard_white_rgb.svg" alt="Lufthansa Group for Business"></picture></p><p>Best choice for your business</p>')]);
  assert.equal(row.className, 'footer-brand-row');
  const logo = row.querySelector(':scope > .footer-brand-logo img');
  assert.ok(logo && /white_rgb\.svg$/.test(logo.getAttribute('src')));
  assert.equal(logo.getAttribute('loading'), 'lazy');
  assert.deepEqual([...row.querySelectorAll(':scope > .footer-brand-tagline p')].map((p) => p.textContent), ['Best choice for your business']);
  assert.equal(buildBrandRow([]), null, 'no section: none');
});

test('footer.js: the section is taken out of the others, the row first, the grid marked has-brand-row', () => {
  const js = fs.readFileSync('blocks/footer/footer.js', 'utf8');
  assert.match(js, /const brandRows = marked\('brand-row'\);/);
  assert.match(js, /inner\.classList\.add\('has-brand-row'\)/);
});

test('footer.css: www\'s rows only with the brand row; the side margin token defaults to the layout margin', () => {
  const css = fs.readFileSync('blocks/footer/footer.css', 'utf8');
  assert.match(css, /--footer-margin: var\(--footer-side-margin, var\(--layout-margin, 22px\)\);/);
  assert.match(css, /\.footer \.footer-inner\.has-brand-row \{[^}]*grid-template-areas:\s*'brandrow brandrow'\s*'divider divider'\s*'note note'\s*'legal legal'\s*'badges locale';/);
  assert.match(css, /\.footer \.footer-inner\.has-brand-row \{[^}]*grid-template-areas:\s*'brandrow brandrow brandrow brandrow'\s*'divider divider divider divider'\s*'note legal badges locale';/);
  assert.match(css, /\.footer \.footer-brand-tagline p \{[^}]*font-size: 40px;[^}]*line-height: 52px;/);
});
