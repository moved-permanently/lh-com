/* A page that opens a dialog from its address (scripts/fragment-dialog.js; brief 490, Cargo
   row 22):
   www opens its contact form as a dialog over Support & Contact for
   /support-and-contact?reason=&subreason= (the menus' Feedback/Complaints). A page whose metadata
   "Dialog On Query" names a dialog document and the query's parameters
   ("/modals/contact-us reason subreason") opens that document as a dialog when its address carries
   all of them (the query handed to the dialog's blocks: the form's prefill), the focus returning to
   the page's h1; a link to the page itself with them opens the dialog in place (the focus back on
   the link). Without the metadata, or without every parameter, nothing changes.
   Run: node --max-old-space-size=512 --test test/fragment-dialog-query-490.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const PAGE = 'https://cargo.turnsthe.page/en/support-and-contact?reason=General%20request&subreason=Feedback%20%2F%20Complaints';
const { window, document } = parseHTML(`<!DOCTYPE html><html lang="en"><head><meta name="dialog-on-query" content="/modals/contact-us reason subreason"></head><body><main><h1>Support &amp; Contact</h1>
<p><a id="self" href="/en/support-and-contact?reason=General%20request&amp;subreason=Other">Other</a></p>
<p><a id="bare" href="/en/support-and-contact">Support</a></p>
<p><a id="half" href="/en/support-and-contact?reason=General%20request">Half</a></p></main></body></html>`);
Object.defineProperty(window, 'location', { value: new URL(PAGE), configurable: true });
Object.defineProperty(window, 'origin', { value: 'https://cargo.turnsthe.page', configurable: true });
globalThis.window = window;
globalThis.document = document;
window.hlx = { codeBasePath: '' };

const { initFragmentDialogs, openDialogOnQuery } = await import('../scripts/fragment-dialog.js');
const click = (node) => {
  const e = new window.Event('click', { bubbles: true, cancelable: true });
  Object.assign(e, { button: 0 });
  node.dispatchEvent(e);
  return e;
};

test('every parameter in the address: the dialog opens with the query, the focus back to the h1', async () => {
  const calls = [];
  const open = (path, trigger, opts) => {
    calls.push([path, trigger, opts]);
    return Promise.resolve({});
  };
  initFragmentDialogs(document, { open });
  await new Promise((r) => { setTimeout(r, 0); });
  assert.equal(calls.length, 1);
  const [path, trigger, { search }] = calls[0];
  assert.equal(path, '/modals/contact-us');
  assert.equal(trigger, document.querySelector('main h1'));
  assert.equal(trigger.getAttribute('tabindex'), '-1', 'the h1 can take the focus back');
  assert.equal(new URLSearchParams(search).get('subreason'), 'Feedback / Complaints');
  assert.equal(new URLSearchParams(search).get('reason'), 'General request');
});

const SELF = '/en/support-and-contact';
const fresh = () => parseHTML(`<!DOCTYPE html><html><head>
<meta name="dialog-on-query" content="/modals/contact-us reason subreason"></head><body><main>
<h1>Support</h1><p><a id="self" href="${SELF}?reason=General%20request&amp;subreason=Other">Other</a></p>
<p><a id="bare" href="${SELF}">Support</a></p>
<p><a id="half" href="${SELF}?reason=General%20request">Half</a></p></main></body></html>`).document;

test('a link to the page itself with the parameters opens the dialog in place; without all of them it stays a link', async () => {
  const doc = fresh();
  const $ = (id) => doc.getElementById(id);
  const calls = [];
  const open = (path, trigger, opts) => {
    calls.push([path, trigger, opts]);
    return Promise.resolve({});
  };
  openDialogOnQuery(doc, { open, url: new URL(`https://cargo.turnsthe.page${SELF}`) });
  assert.equal(calls.length, 0, 'no parameters in the address: no dialog on load');
  const e = click($('self'));
  assert.equal(e.defaultPrevented, true);
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], '/modals/contact-us');
  assert.equal(calls[0][1], $('self'));
  assert.equal(new URLSearchParams(calls[0][2].search).get('subreason'), 'Other');
  assert.equal(click($('bare')).defaultPrevented, false);
  assert.equal(click($('half')).defaultPrevented, false);
  assert.equal(calls.length, 1);
});

test('without the metadata nothing opens', () => {
  const { document: doc } = parseHTML('<!DOCTYPE html><html><head></head><body><main><h1>X</h1></main></body></html>');
  const calls = [];
  const open = (...a) => {
    calls.push(a);
    return Promise.resolve({});
  };
  openDialogOnQuery(doc, { open, url: new URL(PAGE) });
  assert.equal(calls.length, 0);
});

// the dialog's Tab trap wraps at its first and last control the visitor can reach: hidden fields,
// controls in a hidden part (the form's rows for another reason), disabled ones and tabindex -1 are
// none of them (they made Tab leave the form's dialog: brief 490, at 1440 and 390)
test('focusables: the controls Tab reaches, not hidden, disabled or tabindex -1 ones', async () => {
  const { focusables } = await import('../scripts/fragment-dialog.js');
  const { document: doc } = parseHTML(`<!DOCTYPE html><html><body><dialog>
<button id="close">x</button><a id="link" href="/a">a</a><input type="hidden" name="h">
<div hidden><input id="in-hidden" name="x"></div><button id="off" disabled>off</button>
<a id="minus" href="/b" tabindex="-1">b</a><select id="sel"><option>1</option></select>
<fieldset hidden><textarea id="ta"></textarea></fieldset><button id="send">send</button></dialog></body></html>`);
  assert.deepEqual(focusables(doc.querySelector('dialog')).map((n) => n.id), ['close', 'link', 'sel', 'send']);
});
