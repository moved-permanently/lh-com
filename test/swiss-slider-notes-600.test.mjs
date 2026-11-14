/* eslint-disable max-len */
/* SWISS row 56 (ema-lufthansa, standing order 18 of 2026-11-14): the homepage slider's notes as www's SWISS slider
   (swiss-parity-008): www keeps its prices disclaimer for screen readers only (.recommender-footer-conditional-content
   .sr-only) and has no Conditions link there (its "General Conditions" close the page, as ours); ours drew both under the
   slider's link, the disclaimer a second time on the page. Counted with the recording's 15 priced cards: ch/en 390 5210 ->
   5133 (www 5086, +2.44 -> +0.92 %), ch/de 5268 -> 5170 (www 5141, +2.47 -> +0.56 %); 1440 unchanged (ch/de -3 px); the
   offers grid's notes as before. Run: node --test test/swiss-slider-notes-600.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/swiss.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const N = 'body.brand-swiss .destination-finder:not(.grid) .destination-finder-notes';
const rule = (sel) => {
  const q = css.indexOf(`${sel} {`);
  return q < 0 ? '' : css.slice(q, css.indexOf('}', q));
};

test('the slider\'s disclaimer for screen readers only, as www\'s', () => {
  const r = rule(`${N} .destination-finder-disclaimer`);
  ['position: absolute;', 'width: 1px;', 'height: 1px;', 'overflow: hidden;', 'clip-path: inset(50%);'].forEach((d) => assert.ok(r.includes(d), d));
  assert.ok(!r.includes('display: none'), 'still read out');
});

test('no Conditions link under the slider, the grid\'s kept', () => {
  assert.match(rule(`${N} .destination-finder-conditions`), /display: none;/);
  assert.ok(N.includes(':not(.grid)'));
});
