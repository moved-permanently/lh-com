/* eslint-disable max-len */
/* SWISS parity pass (brief 380, www.swiss.com's capture swiss-parity-001 of 2026-11-05, ch/en and
   ch/de at 390 and 1440; the rows: tools/reports/swiss/parity.md). What lies in SWISS's theme
   (styles/themes/swiss.css) and the shared code it reads, brand-neutral (the other brands as
   before: every new token defaults to the old value).
   Run: node --max-old-space-size=512 --test test/swiss-parity-380.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8').replace(/\s+/g, ' ');
const swiss = () => read('styles/themes/swiss.css');
const header = () => read('blocks/header/header.css');
// assert.match prints the whole stylesheet on a miss: the pattern only
const has = (css, re, msg) => assert.ok(re.test(css), msg ? `${msg}: ${re}` : String(re));
const hasNot = (css, re, msg) => assert.ok(!re.test(css), msg ? `${msg}: ${re}` : String(re));

test('row 1, the header bar as www\'s: the logo 147 x 34 from 1281px (121 x 28 below), the links 16/22 regular (12 px on phones), the bar 127 px, no dividers', () => {
  const css = swiss();
  has(css, /--nav-logo-height: 28px;/);
  has(css, /--nav-logo-height-wide: 34px;/);
  has(css, /--nav-bar-font-size: 12px;/, 'phones');
  has(css, /--nav-bar-font-weight: 400;/);
  has(css, /--nav-quick-link-padding: 15px 16px;/, 'the four quick links fit 390');
  has(css, /--nav-height: 143px;[^}]*--header-bar-padding: 26px 22px 11px;/, 'phones');
  has(css, /@media \(width >= 768px\) \{ :root \{ --nav-height: 127px; --nav-bar-font-size: 16px; --header-bar-padding: 38px 24px 39px; --nav-quick-list-padding: 1px 0 1px 6px; \} \}/, 'the bar 38 + 50 + 39 = 127 px (lh-com\'s list padding made it 143)');
  has(css, /@media \(width >= 1281px\) \{ :root \{ --header-bar-padding: 38px 88px 39px; \} \}/);
  has(css, /body\.brand-swiss \.header \.nav-divider \{ display: none; \}/);
});

test('row 2, the menu (flyout) white as www\'s: the shared header reads flyout tokens, each defaulting to the old value', () => {
  const css = header();
  has(css, /\.header \.nav-flyout-panel \{[^}]*background-color: var\(--nav-flyout-surface, var\(--nav-brand\)\); color: var\(--nav-flyout-text, var\(--nav-text\)\);/);
  has(css, /\.header \.nav-flyout-top \{[^}]*background-color: var\(--nav-flyout-surface, var\(--nav-brand\)\);/);
  has(css, /\.header \.nav-flyout-item \{[^}]*color: var\(--nav-flyout-heading, #fff\);/);
  has(css, /\.header \.nav-flyout-item span::after \{[^}]*background-color: var\(--nav-flyout-heading, #fff\);/);
  has(css, /\.header \.nav-flyout-item \.lh-icon \{ color: var\(--nav-flyout-chevron, currentcolor\); \}/);
  has(css, /\.header \.nav-flyout-group h3 \{[^}]*color: var\(--nav-flyout-heading, #fff\);/);
  has(css, /\.header \.nav-flyout-link \{ color: var\(--nav-flyout-text, var\(--nav-text\)\); font-size: var\(--nav-flyout-link-size, 18px\); font-weight: var\(--nav-flyout-link-weight, 700\); line-height: var\(--nav-flyout-link-line-height, 27px\);/);
  has(css, /\.header \.nav-flyout-extra \{[^}]*color: var\(--nav-flyout-text, var\(--nav-text\)\);[^}]*font-size: var\(--nav-flyout-extra-size, 14px\); font-weight: var\(--nav-flyout-extra-weight, 700\);/);
  has(css, /\.header \.nav-flyout-link:hover, \.header \.nav-flyout-extra:hover \{ color: var\(--nav-flyout-hover, #fff\); \}/);
  has(css, /\.header \.nav-flyout-back:hover, \.header \.nav-flyout-close:hover \{ color: var\(--nav-flyout-hover, #fff\); \}/);
  has(css, /\.header \.nav-flyout-link, \.header \.nav-flyout-extra \.nav-tool-label \{ background: linear-gradient\(var\(--nav-flyout-hover, #fff\), var\(--nav-flyout-hover, #fff\)\) 0 100% \/ 0 1px no-repeat;/);
  has(css, /\.header \.nav-flyout-login \{[^}]*border-top: 1px solid var\(--nav-flyout-line, var\(--nav-line\)\);/);
  has(css, /border-right: 1px solid var\(--nav-flyout-line, var\(--nav-line\)\);/);
  hasNot(css.slice(css.indexOf('/* --------------------------------------------------------------- flyout'), css.indexOf('/* ------------------------------------------------------- shopping cart')), /color: #fff;/, 'no fixed white left in the flyout');
});

test('row 2: SWISS\'s flyout values (www: white, #101010 tabs and headings, red chevrons, warm grey 16/25 regular links and extras)', () => {
  const css = swiss();
  [
    '--nav-flyout-surface: #fff;', '--nav-flyout-text: #6f6660;', '--nav-flyout-heading: #101010;', '--nav-flyout-hover: #554e49;',
    '--nav-flyout-chevron: #c00;', '--nav-flyout-line: #ccc;', '--nav-flyout-link-size: 16px;', '--nav-flyout-link-weight: 400;',
    '--nav-flyout-link-line-height: 25px;', '--nav-flyout-extra-size: 16px;', '--nav-flyout-extra-weight: 400;',
  ].forEach((t) => assert.ok(css.includes(t), t));
});

test('row 16, the breadcrumb as www\'s: 16/24 px, parents warm grey, red chevrons, the current page red bold; the shared block reads tokens defaulting to the old values', () => {
  const css = read('blocks/breadcrumb/breadcrumb.css');
  has(css, /\.breadcrumb nav \{ padding-top: var\(--breadcrumb-top, 16px\); \}/);
  has(css, /font-size: var\(--breadcrumb-font-size, var\(--body-font-size-xs\)\); line-height: var\(--breadcrumb-line-height, 20px\);/);
  has(css, /\.breadcrumb li \{[^}]*color: var\(--breadcrumb-parent-color, var\(--lh-whale-blue\)\);/);
  assert.equal((css.match(/background-color: var\(--breadcrumb-chevron-color, var\(--lh-deepblue\)\);/g) || []).length, 2, 'both chevrons');
  has(css, /\.breadcrumb a:any-link \{ color: var\(--breadcrumb-parent-color, var\(--lh-whale-blue\)\);/);
  has(css, /\.breadcrumb a:any-link:hover \{ color: var\(--breadcrumb-hover-color, var\(--lh-deepblue\)\);/);
  has(css, /\.breadcrumb \.breadcrumb-current \{ color: var\(--breadcrumb-current-color, var\(--lh-deepblue\)\); font-weight: 700; \}/);
  const theme = swiss();
  ['--breadcrumb-top: 18px;', '--breadcrumb-font-size: 16px;', '--breadcrumb-line-height: 24px;', '--breadcrumb-parent-color: #6f6660;', '--breadcrumb-hover-color: #554e49;', '--breadcrumb-chevron-color: #c00;', '--breadcrumb-current-color: #c00;']
    .forEach((t) => assert.ok(theme.includes(t), t));
});

test('row 15, the footer as www\'s: columns at the content edge, 46 px link rows with a #ccc rule and a small triangle, the social row centred without a rule, a full-width rule above the bottom bar, the legal links centred without arrows, all centred and stacked on phones', () => {
  const css = swiss();
  has(css, /--footer-column-indent: 0;/, 'the columns\' text at the content edge (www x 88)');
  has(css, /--footer-title-line: #ccc;/, 'a rule under each column heading');
  has(css, /--footer-link-gap: 0;/);
  has(css, /--footer-heading-size: 16px;[^}]*\}[^]*@media \(width >= 768px\) \{ body\.brand-swiss \.footer \{ --footer-heading-size: 18px; \}/, 'www 16 px on phones, 18 px from 768 px');
  has(css, /--footer-link-line-height: 25px;/);
  has(css, /body\.brand-swiss \.footer \.footer-column-links li \{ padding: 10px 0; border-bottom: 1px solid #ccc; \}/, '25 + 20 + 1 = 46 px rows');
  has(css, /body\.brand-swiss \.footer \.footer-column-links \.footer-link::after \{[^}]*border-left: 4px solid currentcolor;[^}]*\}/, 'the 4 x 7 px triangle');
  has(css, /body\.brand-swiss \.footer \.footer-badges \{[^}]*justify-content: center;[^}]*border-top: 0;/);
  has(css, /body\.brand-swiss \.footer \.footer-divider \{[^}]*margin: 0 calc\(-1 \* var\(--footer-margin\)\);/, 'the rule across the footer');
  has(css, /body\.brand-swiss \.footer \.footer-legal \.footer-link \.lh-icon \{ display: none; \}/);
  has(css, /body\.brand-swiss \.footer \.footer-subfooter \{[^}]*align-items: center;/, 'stacked and centred below 1025 px');
  has(css, /body\.brand-swiss \.footer \.footer-logo-star-alliance-horizontal img \{ height: 18px; \}/, 'www\'s STAR ALLIANCE mark (the documents\' :star-alliance-horizontal:), 132 x 18');
  has(css, /@media \(width >= 1025px\) \{ (\/\*[^*]*\*\/ )?body\.brand-swiss \.footer \.footer-subfooter \{ display: grid; grid-template-columns: 1fr auto 1fr;[^}]*\}/, 'the legal links centred on the page (www 720 px at 1440)');
  has(css, /body\.brand-swiss \.footer \.footer-subfooter-partner \{ justify-self: end; \}/);
  has(css, /body\.brand-swiss \.footer \.footer-subfooter \.footer-legal \{ grid-area: auto; \}/, 'the legal list out of the footer\'s legal area, in the middle column');
  has(css, /body\.brand-swiss \.footer \.footer-legal \.footer-link \{[^}]*line-height: 24px;/, 'the wrapped legal links 24 px apart (WCAG 2.5.8; www 14 px)');
});

test('rows 10 and 17, the cards\' links as www\'s teaser links: a 4 x 8 px triangle, regular; grid cards 16/25 px pine grey underlined below a #ccc rule 40 px under the description; wide cards 18 px warm grey, their titles regular', () => {
  const css = swiss();
  has(css, /body\.brand-swiss \.carousel-cards \.carousel-cards-body > \.carousel-cards-cta \{ font-weight: 400; \}/);
  has(css, /body\.brand-swiss \.carousel-cards \.carousel-cards-cta a:any-link \{ gap: 12px; color: #6f6660; font-weight: 400; \}/);
  has(css, /body\.brand-swiss \.carousel-cards:is\(\.grid, \.four-up\) \.carousel-cards-slide:not\(\.carousel-cards-wide\) \.carousel-cards-body > p:not\(\.carousel-cards-cta\) \{ line-height: 22px; \}/, 'descriptions 16/22');
  has(css, /body\.brand-swiss \.carousel-cards \.carousel-cards-cta a:any-link:hover \{ color: #554e49; \}/);
  has(css, /body\.brand-swiss \.carousel-cards \.carousel-cards-cta a:any-link::before \{[^}]*width: 4px; height: 8px;[^}]*mask: none; clip-path: polygon\(0 0, 100% 50%, 0 100%\);/);
  has(css, /body\.brand-swiss \.carousel-cards:is\(\.grid, \.four-up\) \.carousel-cards-slide:not\(\.carousel-cards-wide\) \.carousel-cards-cta \{[^}]*margin-top: 0;[^}]*border-top: 1px solid #ccc;[^}]*line-height: 25px;/);
  has(css, /body\.brand-swiss \.carousel-cards:is\(\.grid, \.four-up\) \.carousel-cards-body > p:has\(\+ \.carousel-cards-cta\) \{ margin-bottom: 40px; \}/);
  has(css, /body\.brand-swiss \.carousel-cards:is\(\.grid, \.four-up\) \.carousel-cards-slide:hover \.carousel-cards-cta a:any-link \{ color: #554e49; text-decoration: underline; \}/, 'underlined on the card\'s hover (www\'s captures show the first card hovered)');
  hasNot(css, /body\.brand-swiss \.carousel-cards:is\(\.grid, \.four-up\) \.carousel-cards-cta a:any-link \{[^}]*text-decoration: underline;/, 'no underline at rest');
  has(css, /body\.brand-swiss \.carousel-cards \.carousel-cards-wide \.carousel-cards-body > \.carousel-cards-cta \{ font-size: 18px; \}/);
  has(css, /body\.brand-swiss \.carousel-cards \.carousel-cards-wide \.carousel-cards-body :is\(h1, h2, h3, h4, h5, h6\) \{ font-weight: 400; \}/);
});

test('rows 4, 5 (options), 8, 9, 11-13: the homepage blocks as www\'s (the alert strip regular, the options row warm grey regular, the deals boxed, the conditions links warm grey regular, the offers heading bold with a red origin and red pills, white square icon tiles, the accordion title warm grey 20 px)', () => {
  const css = swiss();
  has(css, /body\.brand-swiss \.flash-teaser \.flash-teaser-link(:any-link)?, body\.brand-swiss \.flash-teaser \.flash-teaser-link:any-link \{ font-weight: 400; \}|body\.brand-swiss \.flash-teaser \.flash-teaser-link:any-link \{ font-weight: 400; \}/, 'row 4');
  has(css, /body\.brand-swiss \.flight-search :is\(\.flight-search-trip-type select, \.flight-search-travellers, \.flight-search-nonstop\) \{ color: #6f6660; font-size: 16px; font-weight: 400; \}/, 'row 5, the options row');
  has(css, /body\.brand-swiss \.fare-teaser-container \.default-content-wrapper h3, body\.brand-swiss \.destination-finder \.destination-finder-heading \{ font-weight: 700; \}/, 'rows 8 and 11, the headings');
  has(css, /body\.brand-swiss \.fare-teaser \.fare-teaser-item \{[^}]*grid-template: "image route" auto "image offer" 1fr \/ 126px minmax\(0, 1fr\);[^}]*border: 1px solid #ccc;/, 'row 8, the boxed deals');
  has(css, /body\.brand-swiss \.fare-teaser \.fare-teaser-image::after \{ display: none; \}/, 'no plane badge');
  has(css, /body\.brand-swiss :is\(\.fare-teaser \.fare-teaser-conditions-label, \.destination-finder \.destination-finder-conditions-toggle\) \{ color: #6f6660; font-size: 16px; font-weight: 400; line-height: 22px; \}/, 'row 9 and 14, Conditions');
  has(css, /body\.brand-swiss \.destination-finder :is\(\.destination-finder-origin, \.airport-combobox input\) \{[^}]*border-bottom-color: #c00; color: #c00; font-weight: 700;/, 'row 11, the origin');
  has(css, /body\.brand-swiss \.destination-finder \.destination-finder-chip:has\(input:checked\) \{ border-color: #c00; background-color: #c00;/, 'row 11, the pill');
  has(css, /body\.brand-swiss \.cards-icon \.cards-icon-tile \{[^}]*padding: 20px 20px 42px;[^}]*border-color: #ccc; border-radius: 0; background-color: #fff;/, 'row 12, the tiles');
  has(css, /body\.brand-swiss \.accordion-columns \.accordion-columns-title \{ color: #6f6660; font-size: calc\(20px \* var\(--a11y-scale, 1\)\); line-height: calc\(27px \* var\(--a11y-scale, 1\)\); \}/, 'row 13');
});

test('row 18, the menu pages\' cards as www\'s: under the H1 by the view\'s kind (row 42, test/swiss-grid-kinds-474), a 1 px #ccc border without shadow (the shadow on hover), three per row also with a card without image (flights)', () => {
  const css = swiss();
  // brief 474 (row 42): 72 px on phones and 73 from 768 px for views in a section, 60 / 80 for plain ones (were 43 / 80 from 1025 px for all)
  has(css, /body\.brand-swiss main \.default-content-wrapper:has\(\+ \.carousel-cards-wrapper\) > h1:last-child \{ margin-bottom: 72px; \}/);
  has(css, /@media \(width >= 768px\) \{[^@]*body\.brand-swiss main \.default-content-wrapper:has\(\+ \.carousel-cards-wrapper\) > h1:last-child \{ margin-bottom: 73px; \}/);
  has(css, /@media \(width >= 1025px\) \{[^@]*body\.brand-swiss main > \.section:has\(\+ \.section > \.carousel-cards-wrapper:first-child\) > \.default-content-wrapper:last-child > h1:last-child \{ margin-bottom: 72px; \}/, 'the H1 in a section of its own (flights, www 72 px)');
  const withImages = 'body\\.brand-swiss \\.carousel-cards:is\\(\\.grid, \\.four-up\\) \\.carousel-cards-track:has\\(> \\.carousel-cards-slide:not\\(\\.carousel-cards-text-only\\)\\) > \\.carousel-cards-slide';
  has(css, new RegExp(`${withImages} \\{ border-color: #ccc; border-radius: 0; box-shadow: none; \\}`), 'grids with image cards (the login strips, text only, as before)');
  has(css, new RegExp(`${withImages}:hover \\{ box-shadow: 0 2px 8px rgb\\(0 0 0 \\/ 20%\\); \\}`));
  has(css, /body\.brand-swiss \.carousel-cards\.grid:not\(\.two-up, \.four-up\) \.carousel-cards-track:has\(> \.carousel-cards-slide:not\(\.carousel-cards-text-only\)\) \{ grid-template-columns: repeat\(3, minmax\(0, 1fr\)\); \}/, 'a grid with image cards keeps three columns');
  has(css, /body\.brand-swiss \.carousel-cards\.grid \.carousel-cards-track:has\(> \.carousel-cards-slide:not\(\.carousel-cards-text-only\)\) \.carousel-cards-text-only \.carousel-cards-body \{ padding: 20px 20px 8px; \}/, 'and its card without image as the others');
});

test('row 5, the flight search\'s fields as www\'s boxes: 50 px, #f2f2f2 with a 1 px warm grey border, the label inside (12 px over the value, 18 px while empty), From and To one box on phones with the swap on the line between, the swap a 32 px grey circle from 768 px', () => {
  const css = swiss();
  has(css, /body\.brand-swiss \.flight-search \.airport-combobox \{ padding-top: 0; \}/);
  has(css, /body\.brand-swiss \.flight-search :is\(\.airport-combobox label, \.flight-search-dates legend\) \{[^}]*top: 5px; left: 11px;[^}]*font-size: 12px; line-height: 14px;/);
  has(css, /body\.brand-swiss \.flight-search \.airport-combobox input \{[^}]*height: 50px;[^}]*border: 1px solid #6f6660;[^}]*background-color: #f2f2f2;/);
  has(css, /body\.brand-swiss \.flight-search :is\(\.airport-combobox\[data-code=""\]:not\(:focus-within\) label, \.flight-search-dates:not\(:focus-within, :has\(input:valid\)\) legend\) \{ top: 11px; font-size: 18px; line-height: 28px; \}/, 'empty: the label as the placeholder');
  has(css, /body\.brand-swiss \.flight-search \.flight-search-dates \{[^}]*height: 50px;[^}]*border: 1px solid #6f6660;[^}]*background-color: #f2f2f2;/);
  has(css, /body\.brand-swiss \.flight-search \.airport-combobox input:focus \{[^}]*outline: 2px solid #101010;/, 'a visible focus');
  has(css, /body\.brand-swiss \.flight-search \.flight-search-dates:focus-within \{ outline: 2px solid #101010; outline-offset: -1px; \}/, 'the dates\' box focused as one');
  has(css, /@media \(width < 768px\) \{[^@]*body\.brand-swiss \.flight-search \.flight-search-origin input \{ border-bottom-color: transparent; \}/, 'phones: From and To one box');
  has(css, /@media \(width >= 768px\) \{[^@]*body\.brand-swiss \.flight-search \.flight-search-swap \{[^}]*width: 32px; height: 32px;[^}]*background-color: #f2f2f2;/);
  has(css, /body\.brand-swiss \.flight-search \.airport-combobox\[data-code=""\]:not\(:focus-within\)::after \{ display: none; \}/, 'no half border');
  has(css, /@media \(width >= 1025px\) \{ body\.brand-swiss \.flight-search \.flight-search-submit \{ margin-top: 0; \} \}/, 'the button level with the fields');
  has(css, /body\.brand-swiss \.flight-search \.flight-search-trip-type select \{ background-image: url\("data:image\/svg\+xml,[^"]*stroke='%236f6660'/, 'the trip type chevron warm grey');
});
