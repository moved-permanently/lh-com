/* eslint-disable max-len */
/* ITA parity pass (brief 391, www.ita-airways.com's capture ita-parity-001 of 2026-11-05, it/en and
   it/it at 390 and 1440, values from www's own CSS rendered from the capture; the rows:
   tools/reports/ita/parity.md). What lies in ITA's theme (styles/themes/ita.css, body.brand-ita
   rules and the shared tokens of briefs 380 and earlier).
   Run: node --max-old-space-size=512 --test test/ita-parity-391.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8').replace(/\s+/g, ' ');
const ita = () => read('styles/themes/ita.css');
// assert.match prints the whole stylesheet on a miss: the pattern only
const has = (css, re, msg) => assert.ok(re.test(css), msg ? `${msg}: ${re}` : String(re));
const tokens = (css, list) => list.forEach((t) => assert.ok(css.includes(t), t));

test('row 1, the header bar as www\'s: 132 px on phones (the logo 162 x 24, the links 12 px), 112 px from 768 px (16 px links), the logo 196 x 29 from 1281 px', () => {
  const css = ita();
  tokens(css, ['--nav-logo-height: 24px;', '--nav-logo-height-wide: 29px;', '--nav-height: 132px;', '--nav-bar-font-size: 12px;', '--header-bar-padding: 25px 22px 9px;', '--nav-quick-link-padding: 12px 16px;', '--nav-quick-list-padding: 12px 0 4px 6px;']);
  has(css, /@media \(width >= 768px\) \{ :root \{ --nav-height: 112px; --nav-bar-font-size: 16px; --header-bar-padding: 31px 24px; --nav-quick-list-padding: 0 0 0 6px; \} \}/);
  has(css, /@media \(width >= 1025px\) \{ :root \{ --header-bar-padding: 31px 80px; \} \}/);
  has(css, /@media \(width >= 1281px\) \{ :root \{ --header-bar-padding: 31px 88px; \} \}/);
});

test('row 2, the menu white as www\'s: dark blue tabs, headings and links (links 18/27 regular in Arial, www\'s fallback for its unloaded LufthansaText), ITA blue chevrons and hover, blue square back and close buttons, a 24 px title on phones', () => {
  const css = ita();
  tokens(css, ['--nav-flyout-surface: #fff;', '--nav-flyout-text: #0b2340;', '--nav-flyout-heading: #0b2340;', '--nav-flyout-hover: #0171cf;', '--nav-flyout-chevron: #0171cf;', '--nav-flyout-line: #d1d1d5;', '--nav-flyout-link-size: 18px;', '--nav-flyout-link-weight: 400;', '--nav-flyout-link-line-height: 27px;', '--nav-flyout-extra-size: 16px;', '--nav-flyout-extra-weight: 700;']);
  has(css, /body\.brand-ita \.header \.nav-flyout-link \{ font-family: arial, helvetica, sans-serif; \}/);
  has(css, /body\.brand-ita \.header :is\(\.nav-flyout-back, \.nav-flyout-close\) \{ width: 32px; height: 32px; border-radius: 6px; background-color: #0171cf; color: #fff; \}/);
  has(css, /body\.brand-ita \.header :is\(\.nav-flyout-back, \.nav-flyout-close\):hover \{ background-color: #01569d; color: #fff; \}/);
  has(css, /body\.brand-ita \.header \.nav-flyout-title \{ color: #0b2340; font-size: 24px; line-height: 26\.4px; \}/);
});

test('row 4, the alert strip as www\'s: 70 px from 768 px, the headline 16/24 bold (#b01411 on #fdf5f5 when critical, #0b2340 on #f4f8fc otherwise), a round 12 px icon, previous and next 24 px targets 6 px apart (WCAG 2.5.8; www\'s chevrons 30 px apart)', () => {
  const css = ita();
  has(css, /body\.brand-ita \.flash-teaser-strip \{ --flash-teaser-color: #0b2340; background-color: #f4f8fc; \}/);
  has(css, /body\.brand-ita \.flash-teaser-strip:is\(\[data-type="irreg"\], \[data-type="tech-outage"\]\)\[data-criticality="high"\] \{ --flash-teaser-color: #b01411; background-color: #fdf5f5; \}/);
  has(css, /body\.brand-ita \.flash-teaser \.flash-teaser-link:any-link \{ font-size: 16px; line-height: 24px; \}/);
  has(css, /body\.brand-ita \.flash-teaser-icon:is\(\.flash-teaser-icon-warning, \.flash-teaser-icon-info\) \{[^}]*width: 12px; height: 12px; margin-top: 6px;[^}]*background-color: currentcolor;[^}]*mask:/, 'www\'s round ! and i (promotions keep their icon)');
  has(css, /body\.brand-ita \.flash-teaser-icon-info \{ mask-image:/);
  has(css, /body\.brand-ita \.flash-teaser-icon:is\(\.flash-teaser-icon-warning, \.flash-teaser-icon-info\) svg \{ display: none; \}/);
  has(css, /@media \(width >= 768px\) \{[^@]*body\.brand-ita \.flash-teaser-bar \{ height: 70px; \}/);
  has(css, /body\.brand-ita \.flash-teaser-nav \{ gap: 6px; \} body\.brand-ita \.flash-teaser-nav \.flash-teaser-button \{ height: 24px; \}/, 'the 24 px targets');
});

test('row 5, the flight search as www\'s: 50 px boxes, 1 px #72727f, 8 px corners, the label 12/18 inside (16 px while empty), the value 16/24, the dates a 48 px box, From and To separate boxes on phones with the swap inside To, the blue swap icon, the button 16 px', () => {
  const css = ita();
  has(css, /body\.brand-ita \.flight-search \.airport-combobox \{ padding-top: 0; \}/);
  has(css, /body\.brand-ita \.flight-search :is\(\.airport-combobox label, \.flight-search-dates legend\) \{[^}]*top: 6px; left: 16px;[^}]*color: #72727f; font-size: 12px; line-height: 18px;/);
  has(css, /body\.brand-ita \.flight-search :is\(\.airport-combobox\[data-code=""\]:not\(:focus-within\) label, \.flight-search-dates:not\(:focus-within, :has\(input:valid\)\) legend\) \{ top: 12px; font-size: 16px; line-height: 24px; \}/);
  has(css, /body\.brand-ita \.flight-search \.airport-combobox input \{[^}]*height: 50px; padding: 20px 30px 4px 15px; border: 1px solid #72727f; border-radius: 8px; background-color: #fff; color: #0b2340; font-size: 16px; line-height: 24px;/);
  has(css, /body\.brand-ita \.flight-search \.flight-search-dates \{[^}]*height: 48px;[^}]*border: 1px solid #72727f; border-radius: 8px;/);
  has(css, /body\.brand-ita \.flight-search \.flight-search-swap \{ color: #0171cf; \}/);
  has(css, /body\.brand-ita \.flight-search \.airport-combobox\[data-code=""\]:not\(:focus-within\)::after \{ display: none; \}/, 'no half border');
  tokens(css, ['--button-font-size: 16px;', '--button-padding: 10px 24px;']);
  has(css, /body\.brand-ita \.flight-search :is\(\.flight-search-travellers, \.flight-search-nonstop\) \{ font-size: 16px; \}/, 'the options row 16 px, as www\'s');
});

test('rows 7-9, the homepage blocks as www\'s: wide teaser cards (1 px #d1d1d5, 12 px corners, www\'s shadow, 36/39.6 px titles 32 px above the link), the offers heading 28 px bold with a blue bold origin, blue pills, the icon tiles ITA blue with white icons and labels', () => {
  const css = ita();
  has(css, /body\.brand-ita \.carousel-cards \.carousel-cards-slide\.carousel-cards-wide \{ border-color: #d1d1d5; border-radius: 12px; box-shadow: 0 3px 6px #0b23401a; \}/);
  has(css, /body\.brand-ita \.carousel-cards \.carousel-cards-wide \.carousel-cards-body :is\(h1, h2, h3, h4, h5, h6\) \{ margin-bottom: 32px; font-size: 36px; line-height: 39\.6px; \}/);
  has(css, /body\.brand-ita \.destination-finder \.destination-finder-heading \{ font-size: 28px; font-weight: 700; line-height: 30\.8px; \}/);
  has(css, /body\.brand-ita \.destination-finder :is\(\.destination-finder-origin, \.airport-combobox input\) \{[^}]*border-bottom-color: #0171cf; color: #0171cf; font-size: 28px; font-weight: 700;/);
  has(css, /body\.brand-ita \.destination-finder \.destination-finder-chip \{ border-color: #0171cf; color: #0171cf; font-weight: 400; \}/);
  has(css, /body\.brand-ita \.destination-finder \.destination-finder-chip:has\(input:checked\) \{ border-color: #0171cf; background-color: #0171cf; color: #fff; font-weight: 700; \}/);
  has(css, /body\.brand-ita \.cards-icon \.cards-icon-tile \{[^}]*min-height: 168px; border-color: #0171cf; background-color: #0171cf; box-shadow: 0 3px 6px #0b23401a;/);
  has(css, /body\.brand-ita \.cards-icon \.cards-icon-label \{ color: #fff; \}/);
  has(css, /body\.brand-ita \.cards-icon \.cards-icon-icon img \{ filter: brightness\(0\) invert\(1\); \}/);
});

test('row 11, the footer as www\'s: column headings 18 px without a rule (20 px accordion rows on phones), 12/16.8 px bold links in Arial 37 px apart, the payment and social rows with 24 px headings side by side, white 20 % rules, the language button at the end of the legal links, the company note centred 14/21, www\'s ITA AIRWAYS mark and STAR ALLIANCE white', () => {
  const css = ita();
  tokens(css, ['--footer-title-line: transparent;', '--footer-column-indent: 3px;', '--footer-link-size: 12px;', '--footer-link-weight: 700;', '--footer-link-line-height: 16.8px;', '--footer-link-gap: 20px;', '--footer-divider-color: rgb(255 255 255 / 20%);', '--footer-toggle-line: rgb(255 255 255 / 50%);']);
  has(css, /body\.brand-ita \.footer \{ --footer-heading-size: 20px; \}/);
  has(css, /@media \(width >= 768px\) \{[^@]*body\.brand-ita \.footer \{ --footer-heading-size: 18px; \}/);
  has(css, /body\.brand-ita \.footer :is\(\.footer-column-links \.footer-link, \.footer-legal \.footer-link\) \{ font-family: arial, helvetica, sans-serif; \}/, 'www\'s unloaded LufthansaText: Arial');
  has(css, /body\.brand-ita \.footer \.footer-inner\.has-extras \{ grid-template-areas: "columns" "badges" "divider" "legal" "locale" "note"; \}/, 'phones: the language button after the legal links');
  has(css, /@media \(width >= 768px\) \{[^@]*body\.brand-ita \.footer \.footer-inner\.has-extras \{ grid-template-areas: "columns columns" "badges badges" "divider divider" "legal locale" "note note"; grid-template-columns: minmax\(0, 1fr\) auto;/);
  has(css, /body\.brand-ita \.footer \.footer-badges \{[^}]*border-top: 1px solid rgb\(255 255 255 \/ 20%\);/);
  has(css, /body\.brand-ita \.footer \.footer-badge-heading \{[^}]*font-size: 20px;[^}]*\}/);
  has(css, /body\.brand-ita \.footer \.footer-note \{[^}]*border-top: 1px solid rgb\(255 255 255 \/ 20%\);[^}]*font-size: 14px; line-height: 21px; text-align: center;/);
  has(css, /body\.brand-ita \.footer \.footer-locale-button \{ font-size: 18px; line-height: 27px; \}/);
  has(css, /body\.brand-ita \.footer \.footer-locale-button \.lh-icon \{ display: none; \}/);
  has(css, /body\.brand-ita \.footer \.footer-logos a\.footer-logo-star-alliance-horizontal \{ filter: brightness\(0\) invert\(1\); \}/);
  has(css, /body\.brand-ita \.footer \.footer-logos \.footer-logo-ita-airways-logo-inverted img, body\.brand-ita \.footer \.footer-logos \.footer-logo-star-alliance-horizontal img \{ height: 20px; \}/, 'both marks 20 px high');
  assert.ok(fs.existsSync(new URL('../icons/ita-airways-logo-inverted.svg', import.meta.url)), 'www\'s footer mark as an icon (the footer documents\' :ita-airways-logo-inverted:)');
});

test('rows 12, 13 and 15, the breadcrumb, the menu pages\' cards and the info page\'s accordions as www\'s: Home 16/24 bold ITA blue, the current page regular; cards with www\'s near-white border and shadow, 28 px titles (22 px on phones), 16/24 descriptions 20 px above the link; accordion items boxed (1 px #d1d1d5, 8 px corners, the shadow), their titles 20/28', () => {
  const css = ita();
  tokens(css, ['--breadcrumb-top: 17px;', '--breadcrumb-font-size: 16px;', '--breadcrumb-line-height: 24px;', '--breadcrumb-parent-color: #0171cf;', '--breadcrumb-hover-color: #01569d;', '--breadcrumb-chevron-color: #0b2340;', '--breadcrumb-current-color: #0b2340;']);
  has(css, /body\.brand-ita \.breadcrumb a:any-link \{ font-weight: 700; \}/);
  has(css, /body\.brand-ita \.breadcrumb \.breadcrumb-current \{ font-weight: 400; \}/);
  has(css, /body\.brand-ita \.carousel-cards:is\(\.grid, \.four-up\) \.carousel-cards-slide:not\(\.carousel-cards-text-only\), body\.brand-ita \.carousel-cards:is\(\.grid, \.four-up\) \.carousel-cards-slide:not\(\.carousel-cards-text-only\):hover \{ border-color: #f8f8f9; box-shadow: 0 3px 6px #0b23401a; \}/);
  has(css, /body\.brand-ita \.carousel-cards:is\(\.grid, \.four-up\) \.carousel-cards-slide:not\(\.carousel-cards-text-only\):hover \{ box-shadow: 0 1px 20px 1px #0003; \}/);
  has(css, /body\.brand-ita \.carousel-cards:is\(\.grid, \.four-up\) \.carousel-cards-slide:not\(\.carousel-cards-wide\) \.carousel-cards-body > :is\(h1, h2, h3, h4, h5, h6\) \{ font-size: clamp\(22px, calc\(22px \+ 6 \* \(100vw - 375px\) \/ 1065\), 28px\); line-height: 1\.1; \}/);
  has(css, /body\.brand-ita \.carousel-cards:is\(\.grid, \.four-up\) \.carousel-cards-slide:not\(\.carousel-cards-wide\) \.carousel-cards-body > p:not\(\.carousel-cards-cta\) \{ font-size: 16px; line-height: 24px; \}/);
  has(css, /body\.brand-ita \.carousel-cards:is\(\.grid, \.four-up\) \.carousel-cards-body > p:has\(\+ \.carousel-cards-cta\) \{ margin-bottom: 20px; \}/);
  has(css, /body\.brand-ita \.carousel-cards:is\(\.grid, \.four-up\) \.carousel-cards-slide:not\(\.carousel-cards-wide\) \.carousel-cards-body > \.carousel-cards-cta \{ font-size: 16px; line-height: 17\.6px; \}/, 'the link row 16/17.6 bold');
  has(css, /body\.brand-ita \.accordion-columns\.faq \.accordion-columns-item \{ margin-bottom: 8px; border: 1px solid #d1d1d5; border-radius: 8px; box-shadow: 0 3px 6px #0b23401a; \}/);
  has(css, /body\.brand-ita \.accordion-columns\.faq \.accordion-columns-title \{ padding: 12px 48px 12px 16px; font-size: calc\(20px \* var\(--a11y-scale, 1\)\); line-height: calc\(28px \* var\(--a11y-scale, 1\)\); \}/);
});

test('row 14, the contact page\'s question as www\'s: the question 16/24 bold, the note 14/21 40 px above the answers; the help app from ita.turnsthe.page (micro-frontend OWN_HOST_BRANDS)', () => {
  const css = ita();
  has(css, /body\.brand-ita \.feedback \.feedback-label \{ font-weight: 700; \}/);
  has(css, /body\.brand-ita \.feedback \.feedback-note \{ margin-bottom: 40px; font-size: 14px; line-height: 21px; \}/);
  has(read('blocks/micro-frontend/micro-frontend.js'), /'www\.ita-airways\.com': `ita\.\$\{TURNSTHE_PAGE_DOMAIN\}`/);
});
