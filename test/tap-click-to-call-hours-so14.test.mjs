/* eslint-disable max-len, import/extensions */
/* click-to-call in and out of the opening hours (TAP row 157, standing order 14). www's BySide window shows the day and
   the half-hour slot only outside the hours ("Agendar Contacto"); during them the telephone and the button alone, side
   by side from 601 px, the button under the field on phones (the recordings, both in the hours: tap-parity-001
   voar-economica 2026-11-09 15:03 UTC, tap-parity-007 lounges 2026-11-11 21:06 UTC). Ours drew the day and slot row
   always: voar-economica 1440 +112 px in the box against www. The block marks its form in-hours and hides that row;
   it looks again when the form takes focus, as the button's label does. (Booleans and strings only in the asserts.)
   Run: timeout 60 node --max-old-space-size=256 --test test/tap-click-to-call-hours-so14.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const ROWS = [
  ['Title', 'Dê um boost à sua viagem'],
  ['Hours', 'Mon-Fri 09:00-24:00'],
  ['Button', 'Liguem-me'],
  ['Button outside hours', 'Agendar Contacto'],
  ['Days', 'Hoje, Amanhã'],
];
const page = () => `<!DOCTYPE html><html lang="pt"><body><main><div class="section"><div class="click-to-call-wrapper"><div class="click-to-call block">${ROWS.map(([k, v]) => `<div><div>${k}</div><div>${v}</div></div>`).join('')}</div></div></div></main></body></html>`;
const { window, document } = parseHTML(page());
globalThis.window = window;
globalThis.document = document;
const { default: decorate } = await import('../blocks/click-to-call/click-to-call.js');

const fresh = () => {
  const main = document.querySelector('main');
  main.innerHTML = parseHTML(page()).document.querySelector('main').innerHTML;
  return document.querySelector('.click-to-call');
};
const state = (block) => {
  const form = block.querySelector('.click-to-call-form');
  return {
    inHours: form.classList.contains('in-hours'),
    whenHidden: Boolean(block.querySelector('.click-to-call-when').hidden),
    label: String(block.querySelector('.click-to-call-submit').textContent),
  };
};

test('in the opening hours: the form in-hours, no day and slot row, the in-hours label', async () => {
  const block = fresh();
  // 2026-11-04 is a Wednesday; Lisbon is UTC in November
  await decorate(block, { now: () => new Date('2026-11-04T10:00:00Z') });
  assert.deepEqual(state(block), { inHours: true, whenHidden: true, label: 'Liguem-me' });
});

test('outside them: the day and slot row, the other label', async () => {
  const block = fresh();
  await decorate(block, { now: () => new Date('2026-11-07T12:00:00Z') });
  assert.deepEqual(state(block), { inHours: false, whenHidden: false, label: 'Agendar Contacto' });
});

test('the form looks again when it takes focus (the page left open past the hours)', async () => {
  const block = fresh();
  let t = '2026-11-04T23:50:00Z';
  await decorate(block, { now: () => new Date(t) });
  assert.equal(state(block).inHours, true);
  t = '2026-11-05T00:10:00Z';
  block.querySelector('.click-to-call-form').dispatchEvent(new window.Event('focusin'));
  assert.deepEqual(state(block), { inHours: false, whenHidden: false, label: 'Agendar Contacto' });
});

test('the look: from 601 px the field and the button side by side in the hours (www: the field, 24 px, a 164 px button)', () => {
  const css = fs.readFileSync(new URL('../blocks/click-to-call/click-to-call.css', import.meta.url), 'utf8');
  const wide = css.slice(css.indexOf('@media (width > 600px)'));
  const rule = (sel) => {
    const at = wide.indexOf(`${sel} {`);
    return at < 0 ? '' : wide.slice(at, wide.indexOf('}', at));
  };
  assert.match(rule('  .click-to-call .click-to-call-form.in-hours'), /display: flex;/);
  assert.match(rule('  .click-to-call .click-to-call-form.in-hours'), /align-items: center;/);
  const button = rule('  .click-to-call .click-to-call-form.in-hours .click-to-call-button');
  assert.match(button, /flex: 0 0 164px;/);
  assert.match(button, /margin: 0 0 0 24px;/);
  assert.match(rule('  .click-to-call .click-to-call-form.in-hours .click-to-call-phone-row'), /flex: 1 1 auto;/);
});
