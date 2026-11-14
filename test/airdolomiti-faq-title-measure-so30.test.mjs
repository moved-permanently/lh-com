/* eslint-disable max-len */
/* Air Dolomiti's FAQ titles get www's text measure (standing order 30, item 1): a 24 px gap between the text and the
   25 px arrow leaves 302 px for a wrapped title at 390 px, as www's. Before, ours left 326 px, so titles took a line less
   (airdolomiti-parity-001 / -007 at 390: seat-reservation -4.31 %, en/assistance -3.82 %, prenotazione-del-posto -3.53 %,
   lounges -2.99 %, assistenza -2.88 %; with the gap all five are within 0.7 %; the other 103 recorded page-widths
   unchanged to the px). German pages keep gap 0: www lets a word longer than the line overflow there, and ours breaks it,
   so the narrower measure made sitzplatzreservierung and betreuung taller than www's (order 29, version A).
   Run: node --max-old-space-size=512 --test test/airdolomiti-faq-title-measure-so30.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/airdolomiti.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const T = 'body.brand-airdolomiti main .accordion-columns.faq .accordion-columns-title';
const rules = (sel) => [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter((m) => m[1].split(',').map((s) => s.trim()).includes(sel)).map((m) => m[2]);

test('the FAQ title: 24 px between its text and the arrow, outside German pages', () => {
  const r = rules(`${T}:not(:lang(de))`);
  assert.equal(r.length, 1);
  assert.match(r[0], /^\s*gap: 24px;\s*$/);
});

test('the base title rule keeps gap 0 (German pages, as before)', () => {
  const r = rules(T).filter((b) => /\bgap:/.test(b));
  assert.equal(r.length, 1);
  assert.match(r[0], /\bgap: 0;/);
});

test('no other rule sets the FAQ title\'s gap or its word breaking for the brand', () => {
  const all = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter((m) => m[1].includes('.accordion-columns-title') && !m[1].includes('::after'));
  const gaps = all.filter((m) => /\bgap:/.test(m[2])).map((m) => m[1].trim());
  assert.deepEqual(gaps.sort(), [T, `${T}:not(:lang(de))`].sort());
  assert.ok(!all.some((m) => /overflow-wrap|word-break/.test(m[2])));
});
