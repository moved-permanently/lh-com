/* eslint-disable max-len */
/* The brief after 539, item 1 (lufthansa.com parity, campaign pages against lh-parity-004a/b at 390): www wraps a
   button's label that doesn't fit, on lines that start at the left ("Lufthansa Signature Moments for / you",
   new-onboard-experience; "More on the role of the first Lufthansa in the era of National Socialism" on three lines,
   100-years/crane). Ours kept one line and cut it with an ellipsis: 4 cut labels on the 53 lufthansa.com sample pages,
   all on those two campaign pages. On lufthansa.com a button's label wraps; one that fits stays one centred line.
   Run: node --test test/button-wrap-lh-539.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('lufthansa.com: a label that doesn\'t fit wraps, its lines from the left', () => {
  const sel = 'body.brand-lufthansa a.button:any-link {';
  const i = css.indexOf(sel);
  assert.ok(i >= 0, 'the rule');
  const body = css.slice(i + sel.length, css.indexOf('}', i));
  assert.match(body, /white-space: normal;/);
  assert.match(body, /text-align: start;/);
  assert.match(body, /text-overflow: clip;/);
});

test('every other brand keeps the one-line label', () => {
  assert.ok(css.includes('text-overflow: ellipsis; white-space: nowrap;'));
});
