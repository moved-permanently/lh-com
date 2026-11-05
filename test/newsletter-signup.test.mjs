/* eslint-disable max-len */
/* The newsletter strip's field (blocks/newsletter-signup, Air Dolomiti's strip above the footer,
   www.airdolomiti.it's CenteredBlock news_letter): an email field and a button that open the
   site's own sign-up page with the address filled in (?email=, the sign-up form's prefill=email
   row); nothing is sent from the strip. An empty or malformed address stays in the field, which
   reports itself. Rows: Sign-up page (a link), Placeholder, Field label (for screen readers),
   Button label. Without a sign-up page the block shows nothing.
   Run: node --max-old-space-size=512 --test test/newsletter-signup.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
globalThis.window = window;
globalThis.document = document;
let focused = null;
window.HTMLElement.prototype.focus = function focus() { focused = this; };

const { default: decorate, signupUrl } = await import('../blocks/newsletter-signup/newsletter-signup.js');

const block = (rows) => {
  const b = document.createElement('div');
  b.className = 'newsletter-signup block';
  b.innerHTML = rows.map(([k, v]) => `<div><div>${k}</div><div>${v}</div></div>`).join('');
  document.body.replaceChildren(b);
  return b;
};
const rows = [['Sign-up page', '<a href="/iscrizione-newsletter">/iscrizione-newsletter</a>'], ['Placeholder', 'Email'], ['Field label', 'Indirizzo email per la newsletter'], ['Button label', 'Iscriviti alla nostra newsletter']];
const submit = (form) => form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));

test('the field and the button, labelled', () => {
  const b = block(rows);
  decorate(b, { navigate: () => {} });
  const input = b.querySelector('form input[type="email"]');
  assert.equal(input.getAttribute('placeholder'), 'Email');
  assert.equal(input.getAttribute('autocomplete'), 'email');
  assert.equal(input.name, 'email');
  assert.equal(b.querySelector(`label[for="${input.id}"]`).textContent, 'Indirizzo email per la newsletter');
  const button = b.querySelector('form button[type="submit"]');
  assert.equal(button.getAttribute('aria-label'), 'Iscriviti alla nostra newsletter');
});

test('a valid address opens the sign-up page with it; nothing is sent', () => {
  const b = block(rows);
  const opened = [];
  decorate(b, { navigate: (u) => opened.push(u) });
  const input = b.querySelector('input');
  input.value = ' mario.rossi+news@example.it ';
  input.checkValidity = () => true;
  submit(b.querySelector('form'));
  assert.deepEqual(opened, ['/iscrizione-newsletter?email=mario.rossi%2Bnews%40example.it']);
  assert.equal(b.querySelector('form').getAttribute('action'), null, 'the strip\'s form has no action');
});

test('an empty or malformed address stays: the field reports itself, nothing opens', () => {
  const b = block(rows);
  const opened = [];
  decorate(b, { navigate: (u) => opened.push(u) });
  const input = b.querySelector('input');
  let reported = 0;
  input.reportValidity = () => { reported += 1; return false; };
  input.checkValidity = () => false;
  input.value = 'mario@';
  submit(b.querySelector('form'));
  input.value = '';
  submit(b.querySelector('form'));
  assert.deepEqual(opened, []);
  assert.equal(reported, 2);
  assert.ok(focused === input);
});

test('the sign-up address keeps its own query; no sign-up page, no field', () => {
  assert.equal(signupUrl('/en/newsletter-subscription?src=strip', 'a@b.eu'), '/en/newsletter-subscription?src=strip&email=a%40b.eu');
  assert.equal(signupUrl('https://www.airdolomiti.de/newsletter-anmeldung', 'a@b.de'), 'https://www.airdolomiti.de/newsletter-anmeldung?email=a%40b.de');
  const b = block([['Placeholder', 'Email']]);
  decorate(b, { navigate: () => {} });
  assert.equal(b.querySelector('form'), null);
  assert.equal(b.textContent.trim(), '');
});
