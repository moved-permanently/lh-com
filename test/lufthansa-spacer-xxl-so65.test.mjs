/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* lufthansa.com's Spacer step XXL 375 (standing order 65, ema-cashub's sweep-so81 item 2): www's contact-form confirmation
   pages end their text 400px above the footer (div.hr, margin-bottom 400px); the collapse picked the nearest step it had
   (space-below-l, 145px of gap). With XXL among the near-value steps the collapse writes a Spacer block xxl for
   {spacer-400} where it stands, and token-free.js draws it at 375px: with the last paragraph's own 25px the text ends 400px
   above the footer (the test copy: 425 at 400px, 400 at 375). Only separators of 248px or more round to it: the 13
   {spacer-400} documents; {spacer-150} (84 documents) stays L.
   Run: node --test test/lufthansa-spacer-xxl-so65.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { collapseHtml } from '../tools/importer/marker-collapse.mjs';
import { STEP_SPACE, themeFor } from '../scripts/style-markers.js';

const run = (html, brand = 'lufthansa') => collapseHtml(html, {
  path: '/xx/pt/support/contact/contact-form-confirmation', brand, parse: parseHTML, force: true,
}).html;
const MARKER = /\{[a-z][^}]*\}/;

test('XXL 375 is a step of lufthansa.com and a Spacer size', () => {
  assert.equal(STEP_SPACE.xxl, 375);
  assert.equal(themeFor('lufthansa').space.steps.xxl, 375);
});

test('{spacer-400} at a section end becomes a Spacer block xxl where it stands, not the section style space-below-l', () => {
  const out = run('<div><h1>Thank you</h1><p>We have received your message. <a href="/xx/pt/homepage">Home</a></p><p>{spacer-400}</p></div>');
  assert.ok(!MARKER.test(out), out);
  assert.ok(/<div class="spacer xxl"><div><div><\/div><\/div><\/div>/.test(out), out);
  assert.ok(!/space-below-l/.test(out), out);
});

test('the near-value choice: 248px and more round to XXL, 150 and 240 stay L', () => {
  [[150, 'l'], [240, 'l'], [248, 'xxl'], [400, 'xxl']].forEach(([n, step]) => {
    const html = run(`<div><p>a</p><p>{spacer-${n}}</p><p>b</p></div>`);
    const cls = (html.match(/class="spacer( [a-z-]+)?"/) || [])[1];
    assert.equal((cls || ' m').trim(), step, `${n}: ${html}`);
  });
});

test('token-free.js draws a Spacer block xxl at 375px', async () => {
  const { document } = parseHTML('<html><body><main><div><p>a</p><div class="spacer xxl"><div><div></div></div></div></div></main></body></html>');
  globalThis.document = document;
  const { default: decorateTokenFree } = await import('../scripts/token-free.js');
  const main = document.querySelector('main');
  decorateTokenFree(main, { brand: 'lufthansa', path: '/xx/pt/support/contact/contact-form-confirmation', read: () => '' });
  assert.deepEqual([...main.querySelectorAll('p.spacer')].map((x) => x.style.getPropertyValue('--spacer-size')), ['375px'], main.innerHTML);
});
