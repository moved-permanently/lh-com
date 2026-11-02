/* eslint-disable max-len, import/extensions */
/* The showcase notice and a visitor typing (scripts/showcase-notice.js, briefs 262 and 263): the
   notice does not open while a form field has the focus (its modal would take the keys typed
   into the field); it opens when the focus leaves the fields (tabbing from field to field keeps
   it waiting). Every brand; nobody typing: at its fixed time, as before. OneTrust's own banner
   moves the focus into itself when it opens (OneTrust's behaviour, left as it is).
   Run: node --max-old-space-size=512 --test test/showcase-notice-typing.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body><form><input id="name" type="text"><input id="mail" type="email"><input id="ok" type="checkbox"><textarea id="msg"></textarea><button id="send" type="submit">Send</button></form><a id="link" href="#x">x</a></body></html>');
window.hlx = { codeBasePath: '' };
window.location = {
  hostname: 'swiss.turnsthe.page', pathname: '/ch/en/customer-support/contact-us/general-request', search: '', hash: '', href: 'https://swiss.turnsthe.page/ch/en/customer-support/contact-us/general-request', origin: 'https://swiss.turnsthe.page',
};
Object.defineProperty(window, 'origin', { value: 'https://swiss.turnsthe.page', configurable: true });
globalThis.window = window;
globalThis.document = document;

const { isTypingIn, afterTyping } = await import('../scripts/showcase-notice.js');
const byId = (id) => document.getElementById(id);
const tick = () => new Promise((resolve) => { setTimeout(resolve, 5); });

test('a text field, e-mail field or text area is typing; a checkbox, button, link or nothing is not', () => {
  ['name', 'mail', 'msg'].forEach((id) => assert.ok(isTypingIn(byId(id)), id));
  ['ok', 'send', 'link'].forEach((id) => assert.ok(!isTypingIn(byId(id)), id));
  assert.ok(!isTypingIn(document.body));
  assert.ok(!isTypingIn(null));
});

test('the notice waits while a field has the focus, also from field to field, and opens when it leaves the fields', async () => {
  let active = byId('name');
  let done = false;
  const wait = afterTyping(document, () => active).then(() => { done = true; });
  await tick();
  assert.ok(!done, 'typing in a field: waits');
  active = byId('msg');
  byId('name').dispatchEvent(new window.Event('focusout', { bubbles: true }));
  await tick();
  assert.ok(!done, 'tabbed to the next field: still waits');
  active = byId('send');
  byId('msg').dispatchEvent(new window.Event('focusout', { bubbles: true }));
  await wait;
  assert.ok(done, 'the focus left the fields: opens');
});

test('no field with the focus: the notice opens at once', async () => {
  let done = false;
  await afterTyping(document, () => document.body).then(() => { done = true; });
  assert.ok(done);
});

test('every brand\'s notice waits for the visitor\'s typing (brief 263); nobody typing: it opens at its time, as before', () => {
  const src = fs.readFileSync(new URL('../scripts/showcase-notice.js', import.meta.url), 'utf8');
  const show = src.slice(src.indexOf('export default async function showShowcaseNotice'));
  assert.match(show, /\n {2}await afterTyping\(\);\n/, 'for every brand, lh-com included');
  assert.doesNotMatch(src, /WAITS_FOR_TYPING|waitsForTyping/, 'no brand list');
  assert.ok(show.indexOf('await afterTyping();') < show.indexOf('dialog.showModal()'), 'before the modal opens');
});
