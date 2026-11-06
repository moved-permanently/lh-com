/* eslint-disable max-len, import/extensions */
/* Lufthansa Cargo parity pass 1 (brief 417, www.lufthansa-cargo.com's capture cargo-parity-001 of
   2026-11-06, en and de at 390 and 1440; the rows: tools/reports/cargo/parity.md). Cargo's own
   theme (styles/themes/cargo.css: tokens, and rules under body.brand-cargo only) and its header
   settings (scripts/brands.js BRANDS.cargo.header: the menu in the bar, the language button).
   Run: node --max-old-space-size=512 --test test/cargo-parity-417.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { BRANDS } from '../scripts/brands.js';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const cargo = () => read('styles/themes/cargo.css');
// assert.match prints the whole stylesheet on a miss: the pattern only
const has = (css, re, msg) => assert.ok(re.test(css), msg ? `${msg}: ${re}` : String(re));
const tokens = (css, list) => list.forEach((t) => assert.ok(css.includes(t), t));

test('Cargo loads its theme and keeps www\'s header: the three menu items in the bar, the language button (rows 1, 2)', () => {
  assert.notEqual(BRANDS.cargo.theme, false);
  assert.deepEqual(BRANDS.cargo.header, { menu: 'bar', languages: 'bar', menuClose: true });
  assert.ok(fs.existsSync(new URL('../styles/themes/cargo.css', import.meta.url)));
});

test('row 3, type: www\'s sizes (h1 32/36 and 42/48, h2 28/32 and 32/36 bold, h3 24/28 and 28/32 light, h4 18/24 bold, copy 18/24), 20 px below headings and paragraphs', () => {
  const css = cargo();
  tokens(css, [
    '--heading-font-size-xxl: 32px;', '--heading-font-size-xl: 28px;', '--heading-font-size-m: 24px;',
    '--heading-light-weight: 700;', '--heading-line-height: 1.143;', '--body-line-height: 1.3334;',
    '--heading-margin-xxl: 20px;', '--heading-margin-xl: 20px;', '--heading-margin-l: 20px;', '--spacing-default: 20px;',
  ]);
  has(css, /@media \(width >= 768px\) \{ :root \{[^}]*--heading-font-size-xxl: 42px;[^}]*--heading-font-size-xl: 32px;[^}]*--heading-font-size-m: 28px;/);
  has(css, /body\.brand-cargo main h3 \{[^}]*font-weight: 300;/);
  has(css, /body\.brand-cargo main h4 \{[^}]*font-size: 18px;[^}]*line-height: 24px;/);
});

test('row 4, the grid as www\'s (round 3, its CSS at 768 to 1920 px): 16 px margins on phones, 24 px from 768 px, 48 px from 1025 px, from 1281 px the content 1296 px wide in the middle with at least 16 px beside it (72 px at 1440)', () => {
  const css = cargo();
  tokens(css, ['--layout-margin: 16px;']);
  has(css, /@media \(width >= 768px\) \{ :root \{[^}]*--layout-margin: 24px;/);
  has(css, /@media \(width >= 1025px\) \{ :root \{[^}]*--layout-margin: 48px;/);
  has(css, /@media \(width >= 1281px\) \{ :root \{[^}]*--content-max-width: 1328px;[^}]*--layout-margin: 16px;/);
  assert.doesNotMatch(css, /--layout-margin: 72px;/);
});

test('row 5, buttons: 50 px, 18/24 bold, padding 10 30, 4 px corners', () => {
  tokens(cargo(), ['--button-min-height: 50px;', '--button-font-size: 18px;', '--button-padding: 10px 30px;', '--button-radius: 4px;']);
});

test('row 1, the bar: 60 px on phones (logo 24 px high, no quick links row, the bell in the menu), from 768 px still 60 px with 24 px sides, 90 px from 1025 px (logo 30 px; round 3, ema-adobe\'s homepage pass); the items Head Light 18/24 #ebebeb, the open one outlined', () => {
  const css = cargo();
  tokens(css, ['--nav-height: 60px;', '--nav-logo-height: 24px;', '--header-bar-padding: 10px 16px;']);
  has(css, /@media \(width >= 768px\) \{ :root \{[^}]*--header-bar-padding: 10px 24px;/);
  assert.doesNotMatch(css, /@media \(width >= 768px\) \{ :root \{[^}]*--nav-height: 90px;/, 'www\'s bar is 60 px up to 1024 px');
  has(css, /@media \(width >= 1025px\) \{ :root \{[^}]*--nav-height: 90px;[^}]*--nav-logo-height: 30px;[^}]*--header-bar-padding: 20px 72px 20px 24px;/);
  has(css, /@media \(width < 768px\) \{ body\.brand-cargo \.header \.nav-tools \.nav-tool-notifications, body\.brand-cargo \.header \.nav-tools \.nav-languages \{ display: none; \}/);
  has(css, /body\.brand-cargo \.header \.nav-tools \.nav-languages \{ order: 1; \}/);
  has(css, /body\.brand-cargo \.header \.nav-quick \{ display: none; \}/);
  has(css, /body\.brand-cargo \.header \.nav-bar-menu-button(, [^{]*)? \{[^}]*font-family: var\(--heading-font-family\);[^}]*font-size: 18px;[^}]*font-weight: 300;[^}]*line-height: 24px;/);
  has(css, /body\.brand-cargo \.header \.nav-bar-menu-button\[aria-expanded="true"\] \{[^}]*background: none;[^}]*outline: 1px solid/);
});

test('row 2, the menu panel: #f5f5f5 under the bar (brief 422), four 306 px columns 24 px apart, titles Head Bold 18/24, links 14/18 #52627c', () => {
  const css = cargo();
  has(css, /body\.brand-cargo \.header \.nav-dropdown \{[^}]*top: 100%;[^}]*background-color: #f5f5f5;/);
  // every section in one row, as wide as each other (Book & Track's 4, Cargo inside's 5: brief 422)
  has(css, /body\.brand-cargo \.header \.nav-dropdown-inner \{[^}]*display: grid;[^}]*grid-auto-columns: minmax\(0, 1fr\);[^}]*grid-auto-flow: column;[^}]*gap: 24px;/);
  // the Close link at the top right and the access note below the sections (brief 422)
  has(css, /body\.brand-cargo \.header \.nav-dropdown-close \{[^}]*top: 30px;[^}]*right: 72px;[^}]*color: #52627c;[^}]*font-size: 18px;/);
  has(css, /body\.brand-cargo \.header \.nav-dropdown-note \{[^}]*border-top: 1px solid #ccc;[^}]*font-size: 14px;[^}]*line-height: 18px;/);
  has(css, /body\.brand-cargo \.header \.nav-dropdown-title \{[^}]*font-family: var\(--heading-font-family\);[^}]*font-size: 18px;[^}]*line-height: 24px;/);
  has(css, /body\.brand-cargo \.header \.nav-dropdown-link \{[^}]*color: #52627c;[^}]*font-size: 14px;[^}]*line-height: 18px;/);
});

test('row 14, the SDG goals (accordion items titled by an icon): grey rows, the icon 126 px, the line 20/24 regular beside it, a rule below', () => {
  const css = cargo();
  has(css, /body\.brand-cargo \.accordion-columns \.accordion-columns-title:has\(> picture\) \{[^}]*display: block;[^}]*background-color: #f5f5f5;[^}]*font-size: 20px;[^}]*font-weight: 400;[^}]*line-height: 24px;/);
  has(css, /body\.brand-cargo \.accordion-columns \.accordion-columns-title:has\(> picture\) img \{[^}]*float: left;[^}]*width: 126px;[^}]*height: 126px;/);
  has(css, /body\.brand-cargo \.accordion-columns \.accordion-columns-title:has\(> picture\) strong \{ font-weight: 700; \}/);
  // phones: www's 28 px icon, the line 16/20
  has(css, /@media \(width < 768px\) \{ body\.brand-cargo \.accordion-columns \.accordion-columns-title:has\(> picture\) \{[^}]*min-height: 0;[^}]*font-size: 16px;[^}]*line-height: 20px;[^}]*\} body\.brand-cargo \.accordion-columns \.accordion-columns-title:has\(> picture\) img \{[^}]*width: 28px;[^}]*height: 28px;/);
});

test('row 15, shared (brand-neutral): a carousel\'s dots wrap to a second line instead of pushing the page sideways (Facts & Figures\' 25 timeline slides at 390: 483 px wide)', () => {
  has(read('blocks/carousel-cards/carousel-cards.css'), /\.carousel-cards \.carousel-cards-dots \{[^}]*display: flex;[^}]*flex-wrap: wrap;/);
});

// round 2 (brief 422): the inner pages
test('row 6, shared (brand-neutral): a footer column link whose text holds a lock icon (:lock:, Cargo\'s portal links) gets footer-link-locked, drawn with icons/lock.svg', () => {
  has(read('blocks/footer/footer.js'), /if \(a\.querySelector\('\.icon-lock'\)\) link\.classList\.add\('footer-link-locked'\);/);
  has(read('blocks/footer/footer.css'), /\.footer \.footer-link-locked::after \{[^}]*mask: url\('\/icons\/lock\.svg'\)/);
});

test('row 9, the breadcrumb as www\'s: LufthansaText 14/18, the links whale blue, the section labels and the page grey', () => {
  tokens(cargo(), ['--breadcrumb-font-size: 14px;', '--breadcrumb-line-height: 18px;', '--breadcrumb-parent-color: #52627c;', '--breadcrumb-current-color: #666;']);
});

test('row 19, What\'s up now?\'s tiles (cards-teaser (overlay, mosaic)): edge to edge without gaps, 526 / 214 px rows (285 / 174 px on phones), the title on a navy band at the bottom', () => {
  const css = cargo();
  has(css, /body\.brand-cargo \.cards-teaser\.mosaic \{[^}]*margin-inline: calc\(50% - 50vw\);/);
  has(css, /body\.brand-cargo \.cards-teaser\.mosaic > ul \{[^}]*gap: 0;/);
  has(css, /body\.brand-cargo \.cards-teaser\.mosaic > ul > li:nth-child\(n\) \{[^}]*height: 285px;[^}]*margin: 0;/);
  has(css, /@media \(width >= 768px\) \{[^@]*body\.brand-cargo \.cards-teaser\.mosaic > ul > li:nth-child\(n\) \{ height: 526px; \}[^@]*body\.brand-cargo \.cards-teaser\.mosaic\.three-up > ul > li:nth-child\(n\) \{ height: 214px; \}/);
  has(css, /body\.brand-cargo \.cards-teaser\.mosaic \.cards-teaser-image \+ \.cards-teaser-body \{[^}]*inset: auto 0 0;[^}]*background-color: rgb\(5 22 77 \/ 70%\);/);
  // no gaps between the header, the tile rows and the footer; the links www's outlined buttons
  has(css, /body\.brand-cargo main \.section:has\(\.hero-campaign\.narrow, \.cards-teaser\.mosaic\) \{[^}]*margin-bottom: 0;/);
  has(css, /body\.brand-cargo main \.cards-teaser-wrapper:has\(> \.cards-teaser\.mosaic\) \{[^}]*margin-top: 0;/);
  has(css, /body\.brand-cargo \.cards-teaser\.mosaic \.cards-teaser-body a \{[^}]*border: 1px solid #fff;[^}]*font-size: 16px;/);
});

test('row 18, the company pages\' video headers (hero-campaign (narrow): What\'s up now?, Facts & Figures, SDG): 900 px at desktop (320 on phones), the title 60/72 bold near the bottom (24/29 on phones)', () => {
  const css = cargo();
  has(css, /body\.brand-cargo \.hero-campaign\.narrow \{[^}]*min-height: 320px;[^}]*align-items: flex-end;/);
  has(css, /body\.brand-cargo \.hero-campaign\.narrow h1 \{[^}]*font-size: 24px;[^}]*line-height: 29px;/);
  has(css, /@media \(width >= 768px\) \{[^@]*body\.brand-cargo \.hero-campaign\.narrow \{[^}]*min-height: 900px;[^}]*\}[^@]*body\.brand-cargo \.hero-campaign\.narrow h1 \{[^}]*font-size: 60px;[^}]*line-height: 72px;/);
});

test('row 22, the contact form\'s fields as www\'s dialog: a 900 px card, three columns from 768 px, the note, the request and the file drop across', () => {
  const css = cargo();
  has(css, /body\.brand-cargo \.form \.form-step-card \{[^}]*max-width: 900px;/);
  has(css, /@media \(width >= 768px\) \{[^@]*body\.brand-cargo \.form\.core \.form-fields \{[^}]*display: grid;[^}]*grid-template-columns: repeat\(3, minmax\(0, 1fr\)\);[^}]*\}[^@]*body\.brand-cargo \.form \.form-field-note, body\.brand-cargo \.form \.form-field-textarea, body\.brand-cargo \.form \.form-filedrop \{[^}]*grid-column: 1 \/ -1;/);
});

test('row 28, the header stays at the top while the page scrolls (www\'s sticky bar): Cargo\'s bar never hides', () => {
  has(cargo(), /body\.brand-cargo \.header \.nav-wrapper\.is-hidden \{ transform: none; \}/);
});

test('row 27, the footer search focused as www\'s: the field white with www\'s glow, whale blue text and line, 10 px in', () => {
  has(cargo(), /body\.brand-cargo \.footer \.footer-search input:focus \{[^}]*background-color: #fff;[^}]*box-shadow: 0 0 6px 1px #fff;[^}]*border-bottom: 2px solid #52627c;[^}]*color: #52627c;[^}]*padding-left: 10px;/);
});

test('row 24, boxed cards (cards-teaser (boxed): www\'s lcagCard, the industries): a white card, 1 px #dcdcdc, www\'s shadow, 20 px inside', () => {
  const css = cargo();
  has(css, /body\.brand-cargo \.cards-teaser\.boxed > ul > li \{[^}]*border: 1px solid #dcdcdc;[^}]*background-color: #fff;[^}]*box-shadow: 0 1px 4px 0 rgb\(0 0 0 \/ 20%\);/);
  has(css, /body\.brand-cargo \.cards-teaser\.boxed \.cards-teaser-body \{[^}]*padding: 20px;/);
  has(css, /body\.brand-cargo \.cards-teaser\.boxed \.cards-teaser-body h3 \{[^}]*font-size: 18px;[^}]*font-weight: 700;[^}]*line-height: 24px;/);
});

test('row 6, the footer: three link columns across the width, titles Head Bold 18/24, links 14/18 regular', () => {
  const css = cargo();
  tokens(css, ['--footer-heading-size: 18px;', '--footer-link-size: 14px;', '--footer-link-weight: 400;', '--footer-link-line-height: 18px;']);
  has(css, /@media \(width >= 768px\) \{ body\.brand-cargo \.footer \.footer-columns \{ grid-template-columns: repeat\(3, minmax\(0, 1fr\)\); gap: 24px; \}/);
  // the social links at the right end of the legal row, as www's
  has(css, /body\.brand-cargo \.footer \.footer-inner\.has-extras \{ grid-template-areas: 'search locale' 'columns columns' 'divider divider' 'legal badges' 'note note'; grid-template-columns: minmax\(0, 1fr\) auto; \}/);
  has(css, /body\.brand-cargo \.footer \.footer-badges \{[^}]*justify-self: end;[^}]*padding: 0;/);
});
