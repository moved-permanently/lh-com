/* eslint-disable max-len */
/* Air Dolomiti's text under the manage-booking form (the standing order of the night of 2026-11-10, item e; AD row 103;
   airdolomiti-parity-001 /gestione-prenotazione-volo, /en/manage-flight-booking, /de/bearbeitung-ihrer-buchungen): www's
   rich text puts an empty paragraph after the first two paragraphs only; the phone paragraph, the opening hours and the
   footnote ("*The call does not incur…", <small><sup>) follow one another, the footnote a 33 px line. Ours put a 33 px
   blank line under every paragraph (row 40), and the footnote's superscript made its line 38 px: the page 92 px taller
   at 1440 than www's (2239 against 2147, it), 66 + 5 of them here. The theme keeps the last three paragraphs together
   and the superscript inside the line.
   Run: node --test test/airdolomiti-manage-text-585.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/airdolomiti.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const BASE = 'body.brand-airdolomiti main:has(.manage-booking) .manage-booking-wrapper ~ .default-content-wrapper > p';
const rule = (sel) => {
  const i = css.indexOf(`${sel} {`);
  assert.ok(i >= 0, `the rule ${sel}`);
  return css.slice(i, css.indexOf('}', i));
};

test('the phone paragraph and the hours without a blank line under them, as www\'s', () => {
  assert.match(rule(`${BASE}:is(:nth-last-of-type(2), :nth-last-of-type(3))`), /margin-bottom: 0;/);
});

test('the footnote\'s superscript inside its 33 px line', () => {
  assert.match(rule(`${BASE} > sup`), /line-height: 0;/);
});

test('the blank line under the other paragraphs stays (row 40)', () => {
  assert.match(rule(BASE), /margin: 0 0 33px;/);
});
