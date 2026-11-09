/* eslint-disable max-len -- dev tooling */
/* The brief after 510, item 2 (ITA's rows: most ITA pages +2 to +5 % at 390): ITA's footer on phones was 114 px taller
   than www.ita-airways.com's (1,467 px against 1,353 at 390, the recordings of brief 497): the first heading 8 px
   lower, "Informazioni su ITA Airways" on two lines (its toggle 16 px in, www's text 8 px in from the footer's
   22 px), the payment row 11 px and the legal links 7 px further down and packed closer (www: a 14 px arrow, 10 px to the text, 26 px to the next link; seven rows in English, ours six), the language button 41 px under the legal
   links (www 11), the note 9 px and the logo stack 4 and 5 px further apart, 11 px more under it. ITA's own rules
   for phones give www's numbers (each text line within 1 to 6 px; the footer 1,359 px).
   Run: node --test test/ita-footer-phones.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const file = process.env.ITA_CSS || new URL('../styles/themes/ita.css', import.meta.url);
const css = fs.readFileSync(file, 'utf8').replace(/\s+/g, ' ');
const phones = (() => {
  const i = css.indexOf('/* phones (the brief after 510, ITA rows');
  assert.ok(i >= 0, 'the phone block');
  const at = css.indexOf('@media (width < 768px) {', i);
  return css.slice(at, css.indexOf('/* the breadcrumb (row 12)', at));
})();

test('the first heading 32 px down, the accordion titles 8 px in', () => {
  assert.ok(phones.includes('body.brand-ita .footer .footer-inner { padding-top: 32px; }'));
  assert.ok(phones.includes('body.brand-ita .footer .footer-column-toggle { padding-left: 8px; }'));
});

test('the payment and social rows, the language button and the note as www\'s', () => {
  assert.ok(phones.includes('body.brand-ita .footer .footer-badges { padding-top: 15px; padding-bottom: 31px; }'));
  assert.ok(phones.includes('body.brand-ita .footer .footer-locale { margin: -30px 0 15px; }'));
});

test('the legal links spaced as www\'s: a 14 px arrow, 10 px to its text, 26 px to the next link', () => {
  assert.ok(phones.includes('body.brand-ita .footer .footer-legal { column-gap: 26px; }'));
  assert.ok(phones.includes('body.brand-ita .footer .footer-legal .footer-link { gap: 10px; }'));
  assert.ok(phones.includes('body.brand-ita .footer .footer-legal .footer-link .lh-icon { width: 14px; height: 14px; }'));
});

test('the logo stack 22 and 24 px apart, 28 px under it', () => {
  assert.ok(phones.includes('body.brand-ita .footer .footer-logos-inner { padding-top: 26px; padding-bottom: 27px; }'));
  assert.ok(phones.includes('body.brand-ita .footer .footer-logos li { margin-bottom: 21px; }'));
  assert.ok(phones.includes('body.brand-ita .footer .footer-logos li:nth-child(2) { margin-bottom: 23px; }'));
});
