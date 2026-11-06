/* A page's link that opens a fragment as a dialog (scripts/fragment-dialog.js, every brand; the
   General Conditions under the fares and offers: SWISS parity row 14, Austrian row 14, ITA row
   10). A link to a document under /modals/ (the block collection's modal convention,
   /ch/en/modals/general-conditions) opens that document in a modal <dialog>: the background
   inert (showModal), the focus on its close button, labelled by the document's first heading;
   Escape (the dialog's own cancel), the close button and a click on the backdrop close it, and the
   focus returns to the link. A new tab (modifier keys) and a document that does not load keep the
   link a link. Other links are not touched.
   Run: node --max-old-space-size=512 --test test/fragment-dialog.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html lang="de"><head></head><body><main><p><a id="link" href="/ch/de/modals/general-conditions">Allgemeine Bedingungen</a></p><p><a id="plain" href="/ch/de/offers">Angebote</a></p></main></body></html>');
Object.defineProperty(window, 'location', { value: new URL('https://swiss.turnsthe.page/ch/de/homepage'), configurable: true });
// scripts/aem.js (imported by fragment-dialog.js) needs an origin
Object.defineProperty(window, 'origin', { value: 'https://swiss.turnsthe.page', configurable: true });
globalThis.window = window;
globalThis.document = document;
window.hlx = { codeBasePath: '' };
window.HTMLElement.prototype.showModal = function showModal() { this.open = true; };
window.HTMLElement.prototype.close = function close() {
  this.open = false;
  this.dispatchEvent(new window.Event('close'));
};
const focused = [];
window.HTMLElement.prototype.focus = function focus() { focused.push(this); };

const {
  isDialogLink, openFragmentDialog, initFragmentDialogs, CLOSE_LABELS,
} = await import('../scripts/fragment-dialog.js');

const fragment = () => {
  const main = document.createElement('main');
  main.innerHTML = '<div class="section"><div class="default-content-wrapper"><h2>Allgemeine Bedingungen</h2><p>Die angezeigten Preise können variieren.</p></div></div>';
  return main;
};
const $ = (id) => document.getElementById(id);
const click = (node, init = {}) => {
  const e = new window.Event('click', { bubbles: true, cancelable: true });
  Object.assign(e, { button: 0, ...init });
  node.dispatchEvent(e);
  return e;
};

test('isDialogLink: a same-site link under /modals/', () => {
  assert.equal(isDialogLink($('link')), true);
  assert.equal(isDialogLink($('plain')), false);
  const other = document.createElement('a');
  other.href = 'https://www.swiss.com/ch/de/modals/x';
  assert.equal(isDialogLink(other), false, 'another site');
});

test('openFragmentDialog: modal, labelled by its heading, the focus on Close; Close returns it to the link', async () => {
  focused.length = 0;
  const loads = [];
  const dialog = await openFragmentDialog('/ch/de/modals/general-conditions', $('link'), { load: async (p) => { loads.push(p); return fragment(); } });
  assert.deepEqual(loads, ['/ch/de/modals/general-conditions']);
  assert.equal(dialog.tagName, 'DIALOG');
  assert.equal(dialog.open, true, 'showModal');
  assert.ok(dialog.parentElement === document.body);
  const h = dialog.querySelector('h2');
  assert.ok(h.id && dialog.getAttribute('aria-labelledby') === h.id);
  const close = dialog.querySelector('button.fragment-dialog-close');
  assert.equal(close.getAttribute('aria-label'), 'Schließen');
  assert.equal(close.type, 'button');
  assert.ok(focused[focused.length - 1] === close, 'the focus moves in');
  assert.ok(document.body.classList.contains('fragment-dialog-open'));
  click(close);
  assert.equal(dialog.isConnected, false, 'removed');
  assert.ok(focused[focused.length - 1] === $('link'), 'back on the link');
  assert.ok(!document.body.classList.contains('fragment-dialog-open'));
});

test('a click on the backdrop closes it; one in its content does not', async () => {
  const dialog = await openFragmentDialog('/x/modals/y', $('link'), { load: async () => fragment() });
  click(dialog.querySelector('p'));
  assert.equal(dialog.isConnected, true);
  click(dialog);
  assert.equal(dialog.isConnected, false);
});

test('no heading: named by the link; a document that does not load: null', async () => {
  const bare = document.createElement('main');
  bare.innerHTML = '<p>Text</p>';
  const dialog = await openFragmentDialog('/x/modals/y', $('link'), { load: async () => bare });
  assert.equal(dialog.getAttribute('aria-label'), 'Allgemeine Bedingungen');
  dialog.close();
  assert.equal(await openFragmentDialog('/x/modals/none', $('link'), { load: async () => null }), null);
});

test('initFragmentDialogs: the links to /modals/ open the dialog (aria-haspopup); others and new tabs as they are', async () => {
  const opened = [];
  initFragmentDialogs(document, { open: async (p, a) => { opened.push([p, a.id]); return {}; } });
  assert.equal($('link').getAttribute('aria-haspopup'), 'dialog');
  assert.equal($('plain').hasAttribute('aria-haspopup'), false);
  assert.equal(click($('link')).defaultPrevented, true);
  assert.equal(click($('plain')).defaultPrevented, false);
  assert.equal(click($('link'), { ctrlKey: true }).defaultPrevented, false, 'a new tab');
  await new Promise((r) => { setTimeout(r, 0); });
  assert.deepEqual(opened, [['/ch/de/modals/general-conditions', 'link']]);
  assert.equal(CLOSE_LABELS.en, 'Close');
});

test('a link\'s query goes to the dialog\'s document (round 3, Cargo\'s contact form: the form\'s prefill reads it from the fragment\'s main)', async () => {
  // a document of its own: the earlier tests' listeners on the page's document take its clicks
  const { document: own } = parseHTML('<!DOCTYPE html><html><body><a id="query" href="/en/modals/contact-us?reason=General%20request&amp;subreason=Other">Feedback</a></body></html>');
  const opened = [];
  const open = async (p, link, o) => { opened.push([p, link.id, o && o.search]); return {}; };
  initFragmentDialogs(own, { open });
  click(own.getElementById('query'));
  await new Promise((r) => { setTimeout(r, 0); });
  assert.deepEqual(opened, [['/en/modals/contact-us', 'query', '?reason=General%20request&subreason=Other']]);
  const loads = [];
  const dialog = await openFragmentDialog('/en/modals/contact-us', $('link'), { search: '?reason=General%20request', load: async (p, o) => { loads.push([p, o && o.search]); return fragment(); } });
  assert.deepEqual(loads, [['/en/modals/contact-us', '?reason=General%20request']]);
  dialog.close();
  const js = fs.readFileSync('blocks/fragment/fragment.js', 'utf8');
  assert.match(js, /export async function loadFragment\(path, \{ search = '' \} = \{\}\)/);
  assert.match(js, /if \(search\) main\.dataset\.search = search;\n\s+decorateMain\(main\);/, 'set before the blocks decorate');
});

test('Tab and Shift+Tab stay inside the dialog (its first and last focusable wrap)', () => {
  const js = fs.readFileSync('scripts/fragment-dialog.js', 'utf8');
  const trap = js.slice(js.indexOf("dialog.addEventListener('keydown'"), js.indexOf("dialog.addEventListener('close'"));
  assert.ok(trap.includes("if (e.key !== 'Tab') return;"));
  assert.ok(trap.includes('(e.shiftKey ? last : first).focus();'));
});

test('scripts.js starts it on every page; its styles in styles/fragment-dialog.css', () => {
  const js = fs.readFileSync('scripts/scripts.js', 'utf8');
  assert.ok(/import\('\.\/fragment-dialog\.js'\)\.then\(\(\{ initFragmentDialogs \}\) => initFragmentDialogs\(document\)\)/.test(js), 'loadLazy');
  const css = fs.readFileSync('styles/fragment-dialog.css', 'utf8');
  assert.ok(css.includes('.fragment-dialog::backdrop'));
  assert.ok(css.includes('.fragment-dialog-close:focus-visible'));
});
