/* eslint-disable max-len */
/* Air Dolomiti's flight search (blocks/flight-search/flight-search-airdolomiti.js, the block's
   variant airdolomiti), as www.airdolomiti.it's booking widget (2026-11-05):
   - the trip type as two radio tabs (www: "Andata / Ritorno", "Solo andata") instead of the
     drop-down; the block's select stays the source of truth (hidden), a tab sets it and fires its
     change, so the dates and the shop hand-off follow as before;
   - with an Open label row (the homepages): on phones the card "Prenota il tuo volo" that opens
     the search as a full-screen panel with a close button; Escape or the close button closes it,
     the focus goes to the close button on opening and back to the card on closing. Without the
     row no card.
   flight-search.js loads the module only for the variant; every other brand's search as before.
   Run: node --max-old-space-size=512 --test test/flight-search-airdolomiti.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
globalThis.window = window;
globalThis.document = document;
globalThis.Event = window.Event;
let focused = null;
window.HTMLElement.prototype.focus = function focus() { focused = this; };
const key = (target, k) => {
  const e = new window.Event('keydown', { bubbles: true });
  e.key = k;
  target.dispatchEvent(e);
};
const click = (target) => target.dispatchEvent(new window.Event('click', { bubbles: true }));

const { default: decorateAirDolomiti } = await import('../blocks/flight-search/flight-search-airdolomiti.js');

const build = () => {
  const block = document.createElement('div');
  block.className = 'flight-search airdolomiti block';
  block.innerHTML = '<form class="flight-search-form"><div class="flight-search-options"><div class="flight-search-trip-type"><label class="flight-search-sr-only" for="tt">Tipo di viaggio</label><select id="tt" name="tripType"><option value="RETURN" selected>Andata / Ritorno</option><option value="ONEWAY">Solo andata</option></select></div></div><div class="flight-search-fields"><div class="airport-combobox"><input name="origin"></div></div></form>';
  document.body.replaceChildren(block);
  return block;
};

test('the trip type as two radio tabs that set the hidden select and fire its change', () => {
  const block = build();
  const select = block.querySelector('select');
  let changes = 0;
  select.addEventListener('change', () => { changes += 1; });
  decorateAirDolomiti(block, { form: block.querySelector('form'), select, lang: 'it' });
  const group = block.querySelector('.flight-search-trip-tabs');
  assert.equal(group.getAttribute('role'), 'radiogroup');
  assert.equal(group.getAttribute('aria-label'), 'Tipo di viaggio');
  const radios = [...group.querySelectorAll('input[type="radio"]')];
  assert.deepEqual(radios.map((r) => [r.value, r.checked, r.closest('label').textContent.trim()]), [['RETURN', true, 'Andata / Ritorno'], ['ONEWAY', false, 'Solo andata']]);
  assert.ok(radios.every((r) => r.name && r.name !== 'tripType'), 'the tabs carry a name of their own');
  assert.ok(select.closest('.flight-search-trip-type').hidden || select.hidden, 'the drop-down hidden');
  radios[1].checked = true;
  radios[1].dispatchEvent(new window.Event('change', { bubbles: true }));
  assert.equal(select.value, 'ONEWAY');
  assert.equal(changes, 1);
  assert.ok(radios[1].closest('label').classList.contains('is-checked'));
  assert.ok(!radios[0].closest('label').classList.contains('is-checked'));
});

test('with an Open label: the card opens the search as a panel; the close button and Escape close it', () => {
  const block = build();
  const form = block.querySelector('form');
  decorateAirDolomiti(block, {
    form, select: block.querySelector('select'), openLabel: 'Prenota il tuo volo', lang: 'it',
  });
  assert.ok(block.classList.contains('flight-search-overlay'));
  const card = block.querySelector('button.flight-search-open');
  assert.equal(card.textContent.trim(), 'Prenota il tuo volo');
  assert.equal(card.getAttribute('aria-expanded'), 'false');
  assert.equal(card.getAttribute('aria-controls'), form.id);
  const close = form.querySelector('button.flight-search-close-panel');
  assert.equal(close.getAttribute('aria-label'), 'Chiudi');
  assert.equal(close.type, 'button');
  click(card);
  assert.ok(block.classList.contains('flight-search-overlay-open'));
  assert.equal(card.getAttribute('aria-expanded'), 'true');
  assert.ok(focused === close, 'the focus on the close button');
  click(close);
  assert.ok(!block.classList.contains('flight-search-overlay-open'));
  assert.ok(focused === card, 'the focus back on the card');
  click(card);
  key(form.querySelector('input'), 'Escape');
  assert.ok(!block.classList.contains('flight-search-overlay-open'), 'Escape closes');
  assert.equal(card.getAttribute('aria-expanded'), 'false');
});

test('without an Open label: no card, no panel (the booking pages); English and German close labels', () => {
  const block = build();
  decorateAirDolomiti(block, { form: block.querySelector('form'), select: block.querySelector('select'), lang: 'en' });
  assert.equal(block.querySelector('.flight-search-open'), null);
  assert.ok(!block.classList.contains('flight-search-overlay'));
  const de = build();
  decorateAirDolomiti(de, {
    form: de.querySelector('form'), select: de.querySelector('select'), openLabel: 'Flug buchen', lang: 'de',
  });
  assert.equal(de.querySelector('.flight-search-close-panel').getAttribute('aria-label'), 'Schließen');
});

test('flight-search.js: the module for the variant airdolomiti only, with the Open label row', () => {
  const js = fs.readFileSync('blocks/flight-search/flight-search.js', 'utf8');
  assert.match(js, /if \(block\.classList\.contains\('airdolomiti'\)\) \{\n\s+import\('\.\/flight-search-airdolomiti\.js'\)/);
  assert.match(js, /openLabel: text\('open-label'\)/);
});
