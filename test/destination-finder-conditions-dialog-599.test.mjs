/* eslint-disable max-len */
/* The destination finder's conditions in a dialog, as www's (standing order 15 of 2026-11-14, item 1): www's finder footer
   shows only a "Conditions" link button (maui-link-button variant dialog, .disclaimerandconditions) that opens the
   conditions in a dialog; ours opened them in place as a disclosure (<details>). Authored conditions (a short title
   paragraph and the text) become a button (type button, aria-haspopup dialog, the title as its text) and a <dialog>
   with the title as its heading (aria-labelledby), the text, and a close button labelled from the finder's labels.
   The toggle keeps its class, so the brands' toggle styles stay (SWISS row 9). Run: node --max-old-space-size=256 --test test/destination-finder-conditions-dialog-599.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.hlx = { codeBasePath: '' };
window.location = {
  hostname: 'main--lh-brussels--moved-permanently.aem.page', pathname: '/fr/fr/homepage', search: '', replace: () => {}, href: 'https://main--lh-brussels--moved-permanently.aem.page/fr/fr/homepage', origin: 'https://main--lh-brussels--moved-permanently.aem.page',
};
window.origin = window.location.origin;
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
globalThis.window = window;
globalThis.document = document;
const { decorateConditions } = await import('../blocks/destination-finder/destination-finder.js');
const css = fs.readFileSync(new URL('../blocks/destination-finder/destination-finder.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');

const authored = () => {
  const c = document.createElement('div');
  c.className = 'destination-finder-conditions';
  c.innerHTML = '<p><strong>Conditions générales</strong></p><p>Les prix affichés peuvent varier.</p><p>Les sièges sont limités.</p>';
  document.body.append(c);
  return c;
};

test('a button that opens the conditions in a dialog, no disclosure', () => {
  const c = authored();
  decorateConditions(c, 'Fermer');
  assert.equal(c.querySelector('details'), null, 'no <details>');
  const button = c.querySelector('button.destination-finder-conditions-toggle');
  assert.ok(button, 'the toggle is a button');
  assert.equal(button.getAttribute('type'), 'button');
  assert.equal(button.getAttribute('aria-haspopup'), 'dialog');
  assert.equal(button.textContent.trim(), 'Conditions générales');
  const dialog = c.querySelector('dialog.destination-finder-conditions-dialog');
  assert.ok(dialog, 'a dialog');
  assert.equal(button.getAttribute('aria-controls'), dialog.id);
  const heading = dialog.querySelector(`#${dialog.getAttribute('aria-labelledby')}`);
  assert.ok(heading && heading.textContent.trim() === 'Conditions générales', 'the title labels the dialog');
  assert.deepEqual([...dialog.querySelectorAll('.destination-finder-conditions-body p')].map((p) => p.textContent), ['Les prix affichés peuvent varier.', 'Les sièges sont limités.']);
  const close = dialog.querySelector('button.destination-finder-conditions-close');
  assert.ok(close && close.getAttribute('aria-label') === 'Fermer', 'a labelled close button');
});

test('the button opens the dialog, the close button closes it', () => {
  const c = authored();
  decorateConditions(c, 'Close');
  const dialog = c.querySelector('dialog');
  dialog.showModal = function showModal() { this.setAttribute('open', ''); };
  dialog.close = function close() { this.removeAttribute('open'); };
  c.querySelector('.destination-finder-conditions-toggle').dispatchEvent(new window.Event('click'));
  assert.ok(dialog.hasAttribute('open'), 'opened');
  dialog.querySelector('.destination-finder-conditions-close').dispatchEvent(new window.Event('click'));
  assert.equal(dialog.hasAttribute('open'), false, 'closed');
});

test('left as authored: a title with a link, or a title without text', () => {
  const linked = document.createElement('div');
  linked.innerHTML = '<p><a href="/x">Conditions</a></p><p>Text</p>';
  const before = linked.innerHTML;
  decorateConditions(linked, 'Close');
  assert.equal(linked.innerHTML, before);
  const alone = document.createElement('div');
  alone.innerHTML = '<p>Conditions</p>';
  decorateConditions(alone, 'Close');
  assert.equal(alone.innerHTML, '<p>Conditions</p>');
});

test('the toggle drawn as a link button, the dialog styled', () => {
  assert.match(css, /\.destination-finder \.destination-finder-conditions-toggle \{[^}]*border: 0;[^}]*background: none;[^}]*padding: 0;/);
  assert.match(css, /\.destination-finder \.destination-finder-conditions-dialog \{/);
  assert.match(css, /\.destination-finder \.destination-finder-conditions-dialog::backdrop \{/);
});
