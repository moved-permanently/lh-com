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

test('row 18: links alone in their paragraph as www\'s maui-navigation-link medium (14 / 18 bold, a 16 px arrow 5 px before the text, one below the other 24 px apart: www\'s 21 px are under WCAG 2.5.8\'s 24 px target spacing, offline package item 5); "Back to News" with the left arrow (variant back)', () => {
  const css = theme();
  const scope = String.raw`body\.brand-b2b main :is\(\.default-content-wrapper, \.columns-media-text\) p\.link-wrapper`;
  assert.match(css, new RegExp(`${scope} \\{ font-size: 14px; line-height: 18px; \\}`));
  assert.match(css, new RegExp(`${scope} a:any-link \\{ gap: 5px; \\}`));
  assert.match(css, new RegExp(`${scope} a:any-link::before \\{ align-self: flex-start; width: 16px; height: 16px; margin-top: 1px; \\}`));
  assert.match(css, /body\.brand-b2b main \.columns-media \.columns-media-text p\.link-wrapper:has\(\+ p\.link-wrapper\) \{ margin-bottom: 6px; \}/);
  assert.match(css, /body\.brand-b2b main \.default-content-wrapper p\.link-wrapper a:any-link\[href\$="\/news"\]::before \{ transform: scaleX\(-1\); \}/);
});

test('row 19: contact\'s country select as www\'s maui-select: its label shown above (12 / 14 grey), the field a 2 px line under an 18 / 24 value with a 24 px chevron, no box', () => {
  const css = theme();
  assert.match(css, /body\.brand-b2b \.hotline-finder \.hotline-finder-field label \{ position: static; display: block; width: auto; height: auto; margin-bottom: 6px; overflow: visible; clip-path: none; color: #666; font-size: 12px; font-weight: 400; line-height: 14px; white-space: normal; \}/);
  assert.match(css, /body\.brand-b2b \.hotline-finder \.hotline-finder-field select \{ min-height: 38px; padding: 6px 29px 6px 0; border: 0; border-bottom: 2px solid #333; border-radius: 0; appearance: none; background: transparent url\("data:image\/svg\+xml,[^"]+"\) right 5px center \/ 24px no-repeat; color: var\(--lh-deepblue, #05164d\); font-size: 18px; font-weight: 400; line-height: 24px; \}/);
});

test('row 20: the footer as www\'s: the tagline 28 / 36.4 on phones, 80 px under it from 1025 px, the legal links 22 px under the note; LinkedIn www\'s "in" in a 48 px circle (the badge keeps its aria-label)', () => {
  const css = theme();
  const row = String.raw`body\.brand-b2b \.footer \.footer-inner\.has-brand-row`;
  assert.match(css, /@media \(width < 768px\) \{ body\.brand-b2b \.footer \.footer-brand-tagline p \{ font-size: 28px; line-height: 36\.4px; \} \}/);
  assert.match(css, /@media \(width >= 1025px\) \{ body\.brand-b2b \.footer \.footer-brand-row \{ padding-bottom: 80px; \} \}/);
  assert.match(css, new RegExp(`${row} \\.footer-legal \\{ padding-top: 22px; \\}`));
  assert.match(css, new RegExp(`${row} \\.footer-badges a\\.footer-badge-linkedin \\{ width: 48px; height: 48px; border-color: rgb\\(255 255 255 \\/ 50%\\); background: url\\("data:image\\/svg\\+xml,[^"]+"\\) center \\/ 24px no-repeat; \\}`));
  assert.match(css, new RegExp(`${row} \\.footer-badges a\\.footer-badge-linkedin img \\{ opacity: 0; \\}`));
  assert.match(css, /@media \(width < 1025px\) \{ body\.brand-b2b \.footer \.footer-inner\.has-brand-row \.footer-badges \{ padding: 20px 0; \}/);
});

test('row 21: www\'s line heights: the large headline size x 1.2 - 2.4 px (48 at 42, 36.2 at 32), the medium x 1.5 - 10 px (38 at 32, 32 at 28), the small + 4 px, the copytext headings 24 px, in the content only (blocks keep theirs); the breadcrumb 14 / 18', () => {
  const css = theme();
  const c = String.raw`body\.brand-b2b main :is\(\.default-content-wrapper, \.columns-media-text\)`;
  assert.match(css, /--breadcrumb-line-height: 18px;/);
  assert.match(css, new RegExp(`${c} > h1, ${c} > :is\\(h1, h2, h3, h4, h5, h6\\)\\.heading-large \\{ line-height: calc\\(var\\(--heading-font-size-xxl\\) \\* 1\\.2 - 2\\.4px\\); \\}`));
  assert.match(css, new RegExp(`${c} > h2:not\\(\\[class\\*="heading-"\\]\\), ${c} > :is\\(h1, h2, h3, h4, h5, h6\\)\\.heading-medium \\{ line-height: calc\\(var\\(--heading-font-size-xl\\) \\* 1\\.5 - 10px\\); \\}`));
  assert.match(css, new RegExp(`${c} > :is\\(h1, h2, h3, h4, h5, h6\\)\\.heading-small \\{ line-height: calc\\(var\\(--heading-font-size-l\\) \\+ 4px\\); \\}`));
  assert.match(css, /body\.brand-b2b main \.hotline-finder :is\(h3, h4\), [^{]+> :is\(h3, h4\):not\(\[class\*="heading-"\]\) \{ line-height: 24px; \}/);
});

test('row 21: the blocks\' type as www\'s: the cards\' titles their size + 4 px (28 / 32, 24 / 28), the carousel cards\' titles and copy 24 px (not 19.8 and 27)', () => {
  const css = theme();
  assert.match(css, /body\.brand-b2b \.cards-icon-text \.cards-icon-text-card \.cards-icon-text-body > \.cards-icon-text-title \{ line-height: calc\(1em \+ 4px\); \}/);
  assert.match(css, /body\.brand-b2b \.carousel-cards \.carousel-cards-slide:not\(\.carousel-cards-wide\) \.carousel-cards-body > :is\(p, h1, h2, h3, h4, h5, h6\) \{ line-height: 24px; \}/);
});
