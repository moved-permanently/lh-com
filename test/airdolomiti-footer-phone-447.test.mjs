/* eslint-disable max-len */
/* Air Dolomiti's footer below 930 px (styles/themes/airdolomiti.css), briefs 447 and 448: as www's phone
   footer (airdolomiti-parity-001 at 390, its FooterMobile_* rules; www's own switches at 930 px,
   ours too since brief 448, its open columns from 768 px folded again): on teal, 40 px in; no search field and no pills; the
   company links first (19.44 / 30 px, www's 1.8rem, underlined), then the sections as www orders
   them (Contacts, Passenger Assistance, Routes, Travel tips, Legal info), each a row in capitals
   (19.44 / 28 px, 15 px above and below, a white line, a 25 px chevron); the address centred
   (15.12 / 20 px, www's 1.4rem, 50 px in), the payment logos (30 px) in a row under their label in
   capitals; then the dark band, centred: the logo with "Member of LUFTHANSA GROUP" and the social
   circles (40 px) 16 px apart; last the company line (15.12 / 20 px, grey on white, 10 px under
   the band, centred). The footer's parts become one column (display: contents) so that the logo
   row, a sibling of the link area, takes its place in the band and keeps its home link.
   Run: node --test test/airdolomiti-footer-phone-447.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/airdolomiti.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const phone = (() => {
  const i = css.indexOf('@media (width < 930px) { body.brand-airdolomiti footer .footer {');
  assert.ok(i >= 0, 'the phone footer rules');
  return css.slice(i, css.indexOf('@media (width >= 930px) { body.brand-airdolomiti footer .footer {', i));
})();
const has = (re, msg) => assert.ok(re.test(phone), msg ? `${msg}: ${re}` : String(re));
const F = 'body\\.brand-airdolomiti footer \\.footer';

test('on teal, one column of www\'s parts in its order; no search, no pills', () => {
  has(new RegExp(`${F} \\{[^}]*--footer-surface: #00798a;[^}]*display: flex;[^}]*flex-direction: column;[^}]*background-color: #00798a;`));
  has(new RegExp(`${F} :is\\(\\.footer-main, \\.footer-inner\\.has-extras, \\.footer-badges, \\.footer-note\\) \\{[^}]*display: contents;`));
  has(new RegExp(`${F} :is\\(\\.footer-search, \\.footer-divider, \\.footer-badge-group:nth-child\\(1\\), \\.footer-logos\\) \\{[^}]*display: none;`), 'the logo row hidden: its link came after the social links (A8)');
  has(new RegExp(`${F} \\.footer-columns \\{[^}]*display: flex;[^}]*flex-direction: column;[^}]*order: 1;[^}]*margin: 0;[^}]*padding: 40px 40px 0;`));
  // the sections in www's order in the DOM (blocks/footer/footer-airdolomiti.js), no CSS order: Tab follows what shows (A8)
  assert.equal(/\.footer-column:nth-child\(\d\) \{ order:/.test(phone), false);
  has(new RegExp(`${F} \\.footer-column-links \\{[^}]*display: none;`), 'the rows fold from 768 px too');
  has(new RegExp(`${F} \\.footer-column\\.is-open \\.footer-column-links \\{[^}]*display: block;`));
  has(new RegExp(`${F} \\.footer-column-title \\{[^}]*display: none;`));
  has(new RegExp(`${F} \\.footer-note p:first-child \\{[^}]*order: 2;`));
  has(new RegExp(`${F} \\.footer-badge-group:nth-child\\(3\\) \\{[^}]*order: 3;`));
  has(new RegExp(`${F} \\.footer-badge-group:nth-child\\(2\\) \\{[^}]*order: 5;`));
  has(new RegExp(`${F} \\.footer-note p:last-child \\{[^}]*order: 6;`));
});

test('the company links shown, the sections\' rows in capitals with a white line', () => {
  has(new RegExp(`${F} \\.footer-column:nth-child\\(1\\) \\.footer-column-heading \\{[^}]*display: none;`));
  has(new RegExp(`${F} \\.footer-column:nth-child\\(1\\) \\.footer-column-links \\{[^}]*display: block;[^}]*margin-bottom: 50px;`));
  has(new RegExp(`${F} \\.footer-column-toggle \\{[^}]*display: flex;[^}]*margin-bottom: 15px;[^}]*padding: 15px 0;[^}]*border-bottom: 1px solid #fff;[^}]*font-size: 19\\.44px;[^}]*font-weight: 400;[^}]*line-height: 28px;[^}]*text-transform: uppercase;`));
  has(new RegExp(`${F} \\.footer-column-toggle \\.lh-icon \\{[^}]*width: 25px;[^}]*height: 25px;`));
  has(new RegExp(`${F} \\.footer-column-links a \\{[^}]*font-size: 19\\.44px;[^}]*font-weight: 400;[^}]*line-height: 30px;[^}]*text-decoration: underline;`));
});

test('the address and the payment logos centred; the band with the logo and the circles; the company line', () => {
  has(new RegExp(`${F} \\.footer-note p:first-child \\{[^}]*margin: 15px 40px 30px;[^}]*padding: 0 50px;[^}]*font-size: 15\\.12px;[^}]*line-height: 20px;[^}]*text-align: center;`));
  has(new RegExp(`${F} \\.footer-badge-heading \\{[^}]*margin: 0 0 20px;[^}]*font-size: 15\\.12px;[^}]*line-height: 20px;[^}]*text-align: center;[^}]*text-transform: uppercase;`));
  has(new RegExp(`${F} \\.footer-badge-group:nth-child\\(3\\) ul \\{[^}]*justify-content: space-between;[^}]*padding: 0 40px;`));
  has(new RegExp(`${F} \\.footer-badge-group:nth-child\\(2\\)::before \\{[^}]*width: 159px;[^}]*height: 51px;[^}]*margin: 0 auto 20px;[^}]*background: url\\('/icons/airdolomiti-footer-logo-phone\\.svg'\\)`), 'the band\'s logo before the social links');
  assert.ok(fs.existsSync(new URL('../icons/airdolomiti-footer-logo-phone.svg', import.meta.url)));
  has(new RegExp(`${F} \\.footer-badge-group:nth-child\\(2\\) ul \\{[^}]*justify-content: center;[^}]*gap: 16px;`));
  has(new RegExp(`${F} \\.footer-badge-group:nth-child\\(2\\) a \\{[^}]*width: 40px;[^}]*height: 40px;[^}]*border-radius: 50%;[^}]*background-color: #fff;`));
  has(new RegExp(`${F} \\.footer-note p:last-child \\{[^}]*padding: 10px;[^}]*border-top: 10px solid #fff;[^}]*background-color: #fff;[^}]*color: #6e6e6e;[^}]*font-size: 15\\.12px;[^}]*line-height: 20px;[^}]*text-align: center;`));
});
