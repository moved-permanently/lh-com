/* eslint-disable max-len, import/extensions */
/* TAP at 390 (brief 356; tools/reports/tap/parity.md rows 39 and 61 on), against www.flytap.com at
   390 x 844 (and 1440 where a rule holds at every width):
   - the text: www's body letter-spacing -1% (the stopover card's text on one line, the labels as
     wide as www's: the two leftovers of brief 352);
   - the header (blocks/header/header-tap.js, styles/themes/tap.css, header-tap.css): the logo
     130 x 17 on phones, the tools 4 px apart, www's search, person and menu icons; the
     quick-action tab 180 px on phones (12 px inside, 4 between), 56 px high with 48 px corners
     from 1025 px, www's four icons; on a homepage with the extra strip the strip above the bar
     (www: alerts, strip, then the bar 16 px lower);
   - the breadcrumb 26 px rows 6 apart, the house in a 24 px box, the chevrons 6 px either side,
     Inter 14 / 21; the title 24 px under it on phones (64 from 1025 px), the trail at main's top;
   - the single inner banner on phones 380 px high, 24 px inside, its title 32 / 38.4 500 and its
     lead 16 / 24 600, 32 px above the title that follows;
   - the booking box stacked (below 1024 px) as www: origin and destination 245 of 310 px with the
     swap button beside them, 12 px between the fields, the inputs 20 px under their labels, the
     dates 44 px, the search 12 px under the passengers, www's sync icon, the search label 500,
     the corporate link regular;
   - the help cards: the button 48 px under the text, 40 px, www's shadow;
   - the footer's social icons 20 px apart on phones.
   Boolean asserts around linkedom nodes. Run: node --max-old-space-size=512 --test test/tap-356.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html lang="en"><head></head><body><header></header><main></main></body></html>');
window.hlx = { codeBasePath: '' };
globalThis.window = window;
globalThis.document = document;

const css = fs.readFileSync(new URL('../styles/themes/tap.css', import.meta.url), 'utf8');
const headerCss = fs.readFileSync(new URL('../blocks/header/header-tap.css', import.meta.url), 'utf8');
const boxCss = fs.readFileSync(new URL('../blocks/booking-box/booking-box.css', import.meta.url), 'utf8');
const tap = await import('../blocks/header/header-tap.js');

test('the text: www\'s body letter-spacing -1%', () => {
  assert.match(css, /body\.brand-tap \{[^}]*letter-spacing: -1%;/);
});

test('the header on phones: the logo 17 px high, the tools 4 px apart', () => {
  assert.match(css, /@media \(width < 1025px\) \{\s*body\.brand-tap \.header \{\s*--nav-logo-height: 17px;\s*\}\s*body\.brand-tap \.header \.nav-tap \.nav-tools \{\s*gap: 4px;/);
});

test('the bar\'s tools with www\'s icons: search, person, menu', async () => {
  const tools = tap.tapBarTools({ base: '/en-pt', lang: 'en' });
  assert.deepEqual(tools.map((t) => t.icon), ['tap-search', 'tap-person']);
  ['tap-search', 'tap-person'].forEach((name) => {
    const svg = fs.readFileSync(new URL(`../icons/${name}.svg`, import.meta.url), 'utf8');
    assert.equal(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"'), true, name);
    assert.equal(/<script|on\w+=|href=/i.test(svg), false, name);
  });
  const menuButton = document.createElement('button');
  menuButton.innerHTML = '<svg class="lh-icon lh-icon-list-menu"><path d="M0 0"/></svg>';
  const section = document.createElement('div');
  section.innerHTML = '<ul><li><p>Help</p><ul><li><p><a href="/en-pt/help">Help center</a></p></li></ul></li></ul>';
  tap.buildTapMenu(section, { link: (href, label, className) => { const a = document.createElement('a'); a.href = href; a.className = className; a.textContent = label; return a; }, menuButton });
  const icon = menuButton.querySelector('svg');
  assert.equal(icon.classList.contains('lh-icon'), true, 'still the button\'s icon (hidden while the menu is open)');
  assert.equal(icon.classList.contains('tap-menu-icon'), true, 'www\'s menu icon');
  assert.equal(menuButton.querySelectorAll('svg').length, 1);
});

test('the quick-action tab: www\'s icons; 180 px on phones, 56 px with 48 px corners from 1025 px', () => {
  const tabs = tap.tapQuickTabs('/en-pt/help');
  assert.deepEqual(tabs.map((t) => t.viewBox), ['0 0 24 24', '0 0 20 21', '0 0 24 24', '0 0 21 20']);
  assert.equal(tabs.every((t) => /^<path [^>]*d="M/.test(t.icon) && !/<script|on\w+=/i.test(t.icon)), true);
  assert.match(headerCss, /body\.brand-tap \.header \.tap-quick \{[^}]*border-radius: 0 0 48px 48px;/);
  assert.match(headerCss, /body\.brand-tap \.header \.tap-quick ul \{[^}]*height: 56px;/);
  assert.match(headerCss, /@media \(width < 1025px\) \{[^@]*body\.brand-tap \.header \.tap-quick \{\s*padding: 0 12px;\s*border-radius: 0 0 32px 32px;/);
});

test('a homepage\'s extra strip above the bar on phones: the class, the strip\'s bottom as the bar\'s top', () => {
  document.body.innerHTML = '<header></header><main><div class="section extra-alert"></div><div class="section"><div class="hero-campaign slider"></div></div></main>';
  tap.floatInStage(document);
  const header = document.querySelector('header');
  assert.equal(header.classList.contains('tap-home'), true);
  assert.equal(header.classList.contains('tap-has-strip'), true);
  assert.equal(/^\d+px$/.test(document.documentElement.style.getPropertyValue('--tap-strip-offset')), true);
  document.body.innerHTML = '<header></header><main><div class="section"><div class="hero-campaign slider"></div></div></main>';
  tap.floatInStage(document);
  assert.equal(document.querySelector('header').classList.contains('tap-has-strip'), false);
  assert.match(css, /@media \(width < 1025px\) \{[^@]*body\.brand-tap header\.tap-home\.tap-has-strip ~ main > \.section\.extra-alert:first-of-type \{\s*position: relative;\s*top: calc\(-1 \* var\(--nav-height\)\);/);
  assert.match(css, /body\.brand-tap header\.tap-home\.tap-has-strip \.nav-wrapper\.nav-tap \{\s*top: calc\(var\(--header-bar-inset, 0px\) \+ max\(var\(--alerts-bar-offset, 0px\), var\(--tap-strip-offset, 0px\)\)\);/);
});

test('the breadcrumb and the title under it', () => {
  assert.match(css, /body\.brand-tap \.breadcrumb ol \{\s*row-gap: 6px;/);
  assert.match(css, /body\.brand-tap \.breadcrumb li:first-child:not\(:only-child\) \{\s*min-height: 26px;/);
  assert.match(css, /body\.brand-tap \.breadcrumb li,\s*body\.brand-tap \.breadcrumb li:not\(\.breadcrumb-parent\) \{[^}]*align-items: center;[^}]*font-size: 14px;\s*line-height: 21px;/);
  assert.match(css, /body\.brand-tap \.breadcrumb li:not\(:last-child\)::after \{[^}]*margin: 0 6px;/);
  assert.match(css, /body\.brand-tap \.breadcrumb li:first-child:not\(:only-child\) > a:any-link \{[^}]*width: 24px;\s*height: 24px;[^}]*mask: url\([^)]*\) center \/ 16px no-repeat;/);
  assert.match(css, /body\.brand-tap main > \.section\.breadcrumb-container:first-of-type \{\s*margin-top: 0;/);
  assert.match(css, /body\.brand-tap main > \.section > \.breadcrumb-wrapper \+ \.default-content-wrapper > h1:first-child \{\s*margin-top: 24px;/);
  assert.match(css, /@media \(width >= 1025px\) \{\s*body\.brand-tap main > \.section > \.breadcrumb-wrapper \+ \.default-content-wrapper > h1:first-child \{\s*margin-top: 64px;/);
});

test('the single inner banner on phones', () => {
  assert.match(css, /@media \(width < 1024px\) \{[^@]*body\.brand-tap \.hero-campaign\.narrow:not\(\.slider, \.hero-campaign-slide\) \{\s*min-height: 380px;[^@]*body\.brand-tap \.hero-campaign\.narrow:not\(\.slider, \.hero-campaign-slide\) \.hero-campaign-inner \{\s*padding: 24px;[^@]*body\.brand-tap \.hero-campaign\.narrow:not\(\.slider, \.hero-campaign-slide\) \.hero-campaign-content :is\(h1, h2, h3, h4, h5, h6\) \{\s*font-size: 32px;\s*line-height: 1\.2;\s*font-weight: 500;[^@]*body\.brand-tap \.hero-campaign\.narrow:not\(\.slider, \.hero-campaign-slide\) \.hero-campaign-content > \.hero-campaign-subtitle \{\s*padding-top: 8px;\s*font-size: 16px;\s*line-height: 24px;\s*font-weight: 600;[^@]*body\.brand-tap main > \.section:has\(> \.hero-campaign-wrapper:last-child \.hero-campaign\.narrow:not\(\.slider, \.hero-campaign-slide\)\) \{\s*margin-bottom: 32px;/);
});

test('the booking box stacked as www\'s', () => {
  const phones = boxCss.slice(boxCss.indexOf('/* brand tap below 1024 px'));
  assert.equal(phones.length > 0 && boxCss.includes('/* brand tap below 1024 px'), true);
  assert.match(phones, /body\.brand-tap \.booking-box-route \{\s*gap: 12px;/);
  assert.match(phones, /body\.brand-tap \.booking-box-route :is\(\.booking-box-origin, \.booking-box-destination\) \{\s*width: calc\(100% - 65px\);/);
  assert.match(phones, /body\.brand-tap \.booking-box :is\(\.airport-combobox label, \.booking-box-dates \.booking-box-label\) \{\s*margin-bottom: -4px;/);
  assert.match(phones, /body\.brand-tap \.booking-box-dates \.booking-box-field-button \{\s*height: 44px;/);
  assert.match(phones, /body\.brand-tap \.booking-box-passengers \.booking-box-label \{\s*margin-bottom: 4px;/);
  assert.match(phones, /body\.brand-tap \.booking-box-search \{\s*margin-top: -4px;/);
  assert.match(phones, /body\.brand-tap \.booking-box-swap \{\s*top: 56px;/);
  assert.match(phones, /body\.brand-tap \.booking-box-route :is\(\.booking-box-origin, \.booking-box-destination\) \.airport-combobox > \.booking-box-icon-caret \{\s*right: 12px;/);
  assert.match(boxCss, /body\.brand-tap \.booking-box-swap \.booking-box-icon-swap \{[^}]*width: 24px;\s*height: 24px;[^}]*mask: url\([^)]*\) center \/ contain no-repeat;\s*transform: rotate\(25deg\);/);
  assert.match(boxCss, /body\.brand-tap \.booking-box \.booking-box-swap \.booking-box-icon-swap svg \{\s*display: none;/);
  assert.match(boxCss, /body\.brand-tap \.booking-box :is\(\.airport-combobox input, \.booking-box-field-button:not\(\.empty\)\) \{\s*color: #020817;/);
  assert.match(boxCss, /body\.brand-tap \.booking-box-corporate \{\s*font-weight: 400;/);
});

test('the help cards and the footer\'s social icons', () => {
  assert.match(css, /body\.brand-tap \.cards:is\(\.three-up, \.two-up\) \.cards-card-body > \.button-wrapper:last-child \{\s*margin-top: auto;\s*padding-top: 24px;/);
  assert.match(css, /body\.brand-tap \.cards:is\(\.three-up, \.two-up\) \.cards-card-body a\.button:any-link \{[^}]*min-height: 40px;[^}]*font-weight: 500;/);
  assert.match(css, /@media \(width < 1024px\) \{[^@]*body\.brand-tap \.footer \.footer-tap-side \.footer-badge-group:has\(img\[data-icon-name\]\) ul \{\s*column-gap: 20px;/);
});

test('the Miles&Go cards\' buttons 15 / 500, as www\'s', () => {
  assert.match(css, /body\.brand-tap \.columns-media\.stack \.columns-media-text a\.button:any-link \{\s*width: 100%;\s*font-weight: 500;/);
});

test('phones: the open menu over the quick-action tab, as www\'s', () => {
  assert.match(headerCss, /body\.brand-tap \.header:has\(\.tap-menu\.is-open\) \.tap-quick \{\s*z-index: -1;/);
});
