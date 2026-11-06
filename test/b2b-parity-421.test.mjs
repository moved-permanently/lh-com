/* eslint-disable max-len -- dev tooling */
/* B2B round 2 (brief 421, tools/reports/b2b/parity.md rows 10, 14-22): B2B-scoped rules against the
   capture b2b-parity-001 and www's CSS (styles.*.css, b2b.css v1.38.0):
   - row 10: two-column rows 106 px apart from 768 px (www's .column-view: 4rem above, 2rem below,
     the item's 2rem, 2.6rem to the next view), not columns-media's 66;
   Run: node --max-old-space-size=512 --test test/b2b-parity-421.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const theme = () => fs.readFileSync(new URL('../styles/themes/b2b.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');

test('row 10: columns-media rows 106 px apart from 768 px on B2B (www\'s column views), 66 below as before', () => {
  assert.match(theme(), /@media \(width >= 768px\) \{ body\.brand-b2b \.columns-media \{ gap: 106px; \} \}/);
});

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const flat = (p) => read(p).replace(/\s+/g, ' ');

test('rows 14, 15: B2B\'s phone menu shows the logo in its head (header option flyoutLogo), the sub-panel\'s head the back chevron and the title alone', () => {
  assert.match(read('scripts/brands.js'), /menu: 'bar', logoLink: false, search: 'button', locale: false, flyoutLogo: true,/);
  const js = read('blocks/header/header.js');
  assert.match(js, /items, image, extras, login, labels, menuLabel, logo,/);
  assert.match(js, /const brandLogo = logo \? el\('span', \{ className: 'nav-flyout-logo', 'aria-hidden': 'true' \}, logo\) : null;/);
  assert.match(js, /el\('div', \{ className: 'nav-flyout-top' \}, \.\.\.\[back, brandLogo, title, close\]\.filter\(Boolean\)\)/);
  assert.match(js, /logo: headerStyle\.flyoutLogo && brandEl\.querySelector\('img'\) \? brandEl\.querySelector\('img'\)\.cloneNode\(true\) : null,/);
});

test('rows 14, 15, 17, 22: the phone menu a white card 15 px from the edges (radius 12, www\'s shadow), its entries and the bar\'s buttons in www\'s plain sans-serif, the sub-panel\'s head, the boxed search button, the thin menu icon', () => {
  const css = flat('blocks/header/header.css');
  const part = css.slice(css.indexOf('/* lh-b2b round 2'));
  assert.ok(part.length < css.length, 'the B2B round 2 part');
  assert.match(part, /@media \(width < 1025px\) \{ body\.brand-b2b \.header \.nav-flyout-panel \{ inset: 15px 15px 0 auto; width: calc\(100% - 30px\); border-radius: 12px; box-shadow: rgb\(0 0 0 \/ 10%\) -2px 0 8px 0; \}/);
  assert.match(part, /body\.brand-b2b \.header \.nav-wrapper\.nav-has-bar-menu :is\(\.nav-bar-menu-button, \.nav-flyout-item\) \{ font-family: sans-serif; \}/);
  assert.match(part, /body\.brand-b2b \.header \.nav-wrapper\.nav-has-bar-menu \.nav-flyout-item \{ font-size: 18px; font-weight: 600; \}/);
  assert.match(part, /body\.brand-b2b \.header \.nav-flyout-panel\.is-expanded :is\(\.nav-flyout-close, \.nav-flyout-logo\) \{ display: none; \}/);
  assert.match(part, /body\.brand-b2b \.header \.nav-flyout-title \{ font-size: 18px; font-weight: 600; text-align: left; \}/);
  assert.match(part, /body\.brand-b2b \.header \.nav-wrapper\.nav-has-bar-menu \.nav-flyout-extra \{ box-sizing: border-box; justify-content: center; width: 56px; height: 56px; padding: 0; border: 1px solid #ebebeb; border-radius: 8px; \}/);
  assert.match(part, /body\.brand-b2b \.header \.nav-menu-button \.lh-icon \{ display: none; \}/);
  assert.match(part, /body\.brand-b2b \.header \.nav-menu-button::before \{ content: ""; width: 32px; height: 24px;/);
});

test('row 16: the search field focused as www\'s: its label floats up small, the placeholder and the line under the field go (the focus outline stays: the keyboard\'s indicator)', () => {
  const css = flat('styles/themes/b2b.css');
  assert.match(css, /body\.brand-b2b \.search-results \.search-results-form:focus-within \.search-results-label \{[^}]*position: absolute;[^}]*font-size: 12px;/);
  assert.match(css, /body\.brand-b2b \.search-results \.search-results-input:focus::placeholder \{ color: transparent; \}/);
  assert.match(css, /body\.brand-b2b \.search-results \.search-results-form:focus-within \{[^}]*border-bottom-color: transparent;/);
});
