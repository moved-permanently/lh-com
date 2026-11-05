/* eslint-disable max-len, import/extensions */
/* click-to-call (brief 368, tools/reports/tap/parity.md row 66): TAP's call-back card on the
   extras pages as www.flytap.com shows it (CoreMedia Engagement Cloud's widget, "Fly in the
   Comfort area"): a picture, the title, the text, a telephone field with the country code, a day
   and an hour, "Schedule contact", the hours. www's widget hands the number to TAP's call-back
   service, which the replica has not: the button takes the visitor to the same page on www (a new
   tab), where TAP's own form calls back; the number typed here goes nowhere.
   Run: node --max-old-space-size=512 --test test/tap-click-to-call.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const ROWS = [
  ['Title', 'Fly in the Comfort area'],
  ['Text', '<p>Already have a reservation? We will <strong>contact you free</strong> of charge.</p>'],
  ['Schedule', 'Schedule: Mon to Fri – 5:00am to 7:00pm'],
  ['Image', '<picture><img src="/media/agent-wide.jpg" alt="An agent"></picture>'],
  ['Mobile image', '<picture><img src="/media/agent.jpg" alt="An agent"></picture>'],
  ['Link', '<a href="https://www.flytap.com/en-pt/manage-booking/extras/seats">https://www.flytap.com/en-pt/manage-booking/extras/seats</a>'],
];
const { window, document } = parseHTML(`<!DOCTYPE html><html lang="en"><head></head><body><main><div class="click-to-call">${ROWS.map(([k, v]) => `<div><div>${k}</div><div>${v}</div></div>`).join('')}</div></main></body></html>`);
globalThis.window = window;
globalThis.document = document;
const opened = [];
window.open = (...a) => { opened.push(a); return null; };
const { default: decorate, CALL_LABELS } = await import('../blocks/click-to-call/click-to-call.js');

test('the card as www\'s: the pictures, the title and text, the telephone with its country code, the day and hour, the button, the hours', async () => {
  const block = document.querySelector('.click-to-call');
  await decorate(block);
  assert.equal(block.querySelector('.click-to-call-media img').getAttribute('src'), '/media/agent-wide.jpg');
  assert.equal(block.querySelector('.click-to-call-media-mobile img').getAttribute('src'), '/media/agent.jpg');
  assert.equal(block.querySelector('h3.click-to-call-title').textContent, 'Fly in the Comfort area');
  assert.equal(block.querySelector('.click-to-call-text strong').textContent, 'contact you free');
  const form = block.querySelector('form');
  const codes = [...form.querySelectorAll('select.click-to-call-code option')].map((o) => o.textContent);
  assert.equal(codes[0], '(+351)');
  assert.equal(codes.includes('(+55)'), true);
  const tel = form.querySelector('input[type="tel"]');
  assert.equal(tel.getAttribute('placeholder'), CALL_LABELS.en.phone);
  assert.equal(tel.getAttribute('autocomplete'), 'tel-national');
  assert.equal(Boolean(form.querySelector(`[aria-label="${CALL_LABELS.en.code}"]`)), true, 'the country code named');
  assert.deepEqual([...form.querySelectorAll('select.click-to-call-day option')].map((o) => o.textContent), [CALL_LABELS.en.today, CALL_LABELS.en.tomorrow]);
  assert.equal(form.querySelectorAll('select.click-to-call-time option').length > 10, true);
  assert.equal(form.querySelector('button[type="submit"]').textContent, CALL_LABELS.en.submit);
  assert.equal(block.querySelector('.click-to-call-schedule').textContent, 'Schedule: Mon to Fri – 5:00am to 7:00pm');
});

test('the button: www\'s page for the call-back, in a new tab; the number sent nowhere', async () => {
  const block = document.querySelector('.click-to-call');
  const form = block.querySelector('form');
  form.querySelector('input[type="tel"]').value = '912345678';
  const e = new window.Event('submit', { cancelable: true });
  form.dispatchEvent(e);
  assert.equal(e.defaultPrevented, true);
  assert.deepEqual(opened, [['https://www.flytap.com/en-pt/manage-booking/extras/seats', '_blank', 'noopener']]);
  assert.equal(JSON.stringify(opened).includes('912345678'), false);
});

test('the look: www\'s light green card (#f0faf2, 16 px corners, 32 from 1024 px), GT Flexa title, the outline button; scoped to the block', () => {
  const css = fs.readFileSync(new URL('../blocks/click-to-call/click-to-call.css', import.meta.url), 'utf8');
  assert.match(css, /\.click-to-call \{[^}]*border-radius: 16px;[^}]*background-color: #f0faf2;/);
  assert.match(css, /@media \(width >= 1024px\) \{[^@]*\.click-to-call \{\s*[^}]*border-radius: 32px;/);
  assert.match(css, /\.click-to-call \.click-to-call-title \{[^}]*font-family: var\(--heading-font-family\);[^}]*font-size: 24px;[^}]*font-weight: 700;/);
  assert.match(css, /\.click-to-call \.click-to-call-submit \{[^}]*border: 1px solid #65c922;[^}]*color: #2c7839;/);
  css.replace(/\/\*[\s\S]*?\*\//g, '').split('}').map((r) => r.split('{')[0].trim()).filter((sel) => sel && !sel.startsWith('@'))
    .forEach((sel) => sel.split(/,(?![^(]*\))/).forEach((one) => assert.equal(one.trim().startsWith('.click-to-call'), true, one)));
});
