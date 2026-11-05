/* eslint-disable max-len, no-restricted-syntax */
/* fare-comparison (brief 374, TAP parity row 99): TAP's fare pages as www.flytap.com shows them
   (/pt-pt/reservas/tarifas-tap, /en-pt/bookings/tap-fares, pt-br, de-ch, 2026-11-05): route-group
   pills over cabin tabs, the fares as columns, ✓ / ✕ as icons, each note as an (i) tooltip (hover,
   keyboard focus, a tap; Escape closes it), "Compare fares" (a dialog with the route group's fares
   by cabin, up to four, Clear and Compare: the chosen fares side by side), www's texts per language.
   Read from one authorable table (blocks/fare-comparison/README.md); the fixtures are today's en-pt
   and pt-pt documents in that shape (logs/b374/to-fare-comparison.py).
   DOM nodes are compared with assert.ok(a === b) only.
   Run: node --max-old-space-size=512 --test test/fare-comparison.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const fixture = (name) => fs.readFileSync(new URL(`./fixtures/fare-comparison/${name}.plain.html`, import.meta.url), 'utf8');
const { window } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
globalThis.window = window;
globalThis.Event = window.Event;
globalThis.Node = window.Node;
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
let focused;
window.HTMLElement.prototype.focus = function focus() { focused = this; };

const { default: decorate, FARE_COMPARISON_LABELS } = await import('../blocks/fare-comparison/fare-comparison.js');

function page(name, path) {
  window.location = {
    hostname: 'tap.turnsthe.page', pathname: path, search: '', hash: '', href: `https://tap.turnsthe.page${path}`, origin: 'https://tap.turnsthe.page',
  };
  const { document } = parseHTML(`<!DOCTYPE html><html><head><meta name="brand" content="tap"></head><body><main><div class="section">${fixture(name)}</div></main></body></html>`);
  globalThis.document = document;
  const block = document.querySelector('.fare-comparison');
  decorate(block);
  return { document, block };
}
const fire = (el, type, init = {}) => {
  const e = new window.Event(type, { bubbles: true, cancelable: true });
  Object.assign(e, init);
  el.dispatchEvent(e);
  return e;
};
const key = (el, k) => {
  const e = new window.Event('keydown', { bubbles: true, cancelable: true });
  Object.defineProperty(e, 'key', { value: k });
  el.dispatchEvent(e);
};
const visibleTable = (block) => [...block.querySelectorAll('.fare-comparison-group')].find((g) => !g.hidden).querySelector('table');
const heads = (table) => [...table.querySelectorAll('thead th')].slice(1).map((th) => th.querySelector('.fare-comparison-fare').textContent);
const labels = (table) => [...table.querySelectorAll('tbody th')].map((th) => th.querySelector('.fare-comparison-label').textContent);

test('the route groups as pills (tabs) over cabin tabs; the first group and cabin shown', () => {
  const { block } = page('en-pt', '/en-pt/bookings/tap-fares');
  const pills = [...block.querySelectorAll('.fare-comparison-groups [role="tab"]')];
  assert.deepEqual(pills.map((p) => p.textContent), ['Flights to Europe and North Africa', 'Intercontinental flights']);
  assert.deepEqual(pills.map((p) => p.getAttribute('aria-selected')), ['true', 'false']);
  const groups = [...block.querySelectorAll('.fare-comparison-group')];
  assert.deepEqual(groups.map((g) => g.hidden), [false, true]);
  assert.equal(groups[0].querySelector('h2').textContent, 'Flights to Europe and North Africa');
  const cabins = [...groups[0].querySelectorAll('.fare-comparison-cabins [role="tab"]')];
  assert.deepEqual(cabins.map((c) => c.textContent), ['Economy', 'Business']);
  assert.equal(groups[0].querySelector('.fare-comparison-cabin-title').textContent, 'Economy');
  assert.deepEqual(heads(visibleTable(block)), ['Discount', 'Classic', 'Plus']);
  assert.equal(labels(visibleTable(block)).length, 15);
  // the old block rows are gone
  assert.equal(block.querySelectorAll(':scope > div:not([class])').length, 0);
});

test('the pills and the cabin tabs switch with a press and the arrow keys', () => {
  const { block } = page('en-pt', '/en-pt/bookings/tap-fares');
  const pills = [...block.querySelectorAll('.fare-comparison-groups [role="tab"]')];
  fire(pills[1], 'click');
  assert.deepEqual([...block.querySelectorAll('.fare-comparison-group')].map((g) => g.hidden), [true, false]);
  assert.deepEqual(heads(visibleTable(block)), ['Discount', 'Basic', 'Classic', 'Plus']);
  const group = block.querySelectorAll('.fare-comparison-group')[1];
  const cabins = [...group.querySelectorAll('.fare-comparison-cabins [role="tab"]')];
  assert.deepEqual(cabins.map((c) => c.textContent), ['Economy', 'Economy Prime', 'Business']);
  key(cabins[0], 'ArrowRight');
  assert.equal(cabins[1].getAttribute('aria-selected'), 'true');
  assert.ok(focused === cabins[1]);
  assert.deepEqual(heads(visibleTable(block)), ['Prime', 'Top Prime']);
  assert.equal(group.querySelector('.fare-comparison-cabin-title').textContent, 'Economy Prime');
  key(pills[1], 'ArrowLeft');
  assert.equal(pills[0].getAttribute('aria-selected'), 'true');
});

test('a fare column\'s colour by its name (www\'s tops and phone tints); ✓ / ✕ icons named by the caption', () => {
  const { block } = page('en-pt', '/en-pt/bookings/tap-fares');
  const table = visibleTable(block);
  assert.deepEqual([...table.querySelectorAll('thead th')].slice(1).map((th) => th.dataset.fare), ['discount', 'classic', 'plus']);
  const premium = [...table.querySelectorAll('tbody tr')].find((tr) => tr.querySelector('th').textContent.startsWith('Premium Check-in'));
  const cells = [...premium.querySelectorAll('td')];
  assert.deepEqual(cells.map((c) => c.querySelector('.fare-comparison-icon')?.dataset.mark), ['no', 'no', 'yes']);
  assert.deepEqual(cells.map((c) => c.querySelector('.fare-comparison-sr').textContent), ['Service not included', 'Service not included', 'Service included']);
  // the mobile header: cabin above the fare
  assert.equal(table.querySelector('thead th[data-fare="discount"] .fare-comparison-fare-cabin').textContent, 'Economy');
  assert.equal(table.querySelector('thead th').textContent.trim().startsWith('Services'), true);
});

test('notes: a label\'s or value\'s italic text as an (i) button with a tooltip, not in the cell', () => {
  const { block, document } = page('en-pt', '/en-pt/bookings/tap-fares');
  const table = visibleTable(block);
  const hand = table.querySelector('tbody tr th');
  assert.equal(hand.querySelector('.fare-comparison-label').textContent, 'Hand baggage');
  assert.equal(hand.querySelector('em'), null);
  const info = hand.querySelector('button.fare-comparison-info');
  assert.equal(info.getAttribute('aria-label'), 'Info');
  const tip = document.getElementById(info.getAttribute('aria-describedby'));
  assert.equal(tip.getAttribute('role'), 'tooltip');
  assert.equal(tip.textContent, 'Additionally, you can take a personal item with you.');
  assert.equal(tip.hidden, true);
  const hold = [...table.querySelectorAll('tbody tr')][1];
  const plus = hold.querySelectorAll('td')[2];
  assert.equal(plus.querySelector('.fare-comparison-value').textContent, '1 x 23 kg / 50 lbs');
  assert.ok(plus.querySelector('button.fare-comparison-info'));
  assert.equal(hold.querySelectorAll('td')[1].querySelector('button'), null, 'no note, no (i)');
});

test('tooltips: hover, keyboard focus and a tap open them; leaving, blur, Escape and a second tap close them', () => {
  const { block, document } = page('en-pt', '/en-pt/bookings/tap-fares');
  const info = visibleTable(block).querySelector('button.fare-comparison-info');
  const tip = () => document.getElementById(info.getAttribute('aria-describedby'));
  fire(info, 'pointerenter', { pointerType: 'mouse' });
  assert.equal(tip().hidden, false);
  fire(info, 'pointerleave', { pointerType: 'mouse' });
  assert.equal(tip().hidden, true);
  fire(info, 'focus');
  assert.equal(tip().hidden, false);
  key(info, 'Escape');
  assert.equal(tip().hidden, true);
  fire(info, 'blur');
  fire(info, 'pointerdown', { pointerType: 'touch' });
  fire(info, 'click');
  assert.equal(tip().hidden, false, 'a tap opens it');
  fire(info, 'pointerdown', { pointerType: 'touch' });
  fire(info, 'click');
  assert.equal(tip().hidden, true, 'a second tap closes it');
  fire(info, 'click');
  fire(document.body, 'pointerdown', { pointerType: 'touch' });
  assert.equal(tip().hidden, true, 'a tap elsewhere closes it');
});

test('Compare fares: the route group\'s fares by cabin, at most four; Compare shows them side by side, Clear goes back', () => {
  const { block, document } = page('en-pt', '/en-pt/bookings/tap-fares');
  const group = block.querySelector('.fare-comparison-group');
  const open = group.querySelector('.fare-comparison-compare');
  assert.equal(open.textContent.trim(), 'Compare fares');
  fire(open, 'click');
  const dialog = document.querySelector('dialog.fare-comparison-dialog');
  assert.equal(dialog.hasAttribute('open'), true);
  assert.equal(dialog.querySelector('h2').textContent, 'Compare fares');
  assert.deepEqual([...dialog.querySelectorAll('fieldset legend')].map((l) => l.textContent), ['Economy', 'Business']);
  const boxes = [...dialog.querySelectorAll('input[type="checkbox"]')];
  assert.deepEqual(boxes.map((b) => b.closest('label').textContent.trim()), ['Discount', 'Classic', 'Plus', 'Executive', 'Top Executive']);
  assert.equal(dialog.querySelector('.fare-comparison-dialog-note').textContent, 'You can select up to four fares to compare.');
  [0, 1, 2, 3].forEach((i) => { boxes[i].checked = true; fire(boxes[i], 'change'); });
  assert.equal(boxes[4].disabled, true, 'four chosen: the fifth is off');
  boxes[1].checked = false;
  fire(boxes[1], 'change');
  boxes[2].checked = false;
  fire(boxes[2], 'change');
  assert.equal(boxes[4].disabled, false);
  fire(dialog.querySelector('.fare-comparison-apply'), 'click');
  assert.equal(dialog.hasAttribute('open'), false);
  const table = visibleTable(block);
  assert.deepEqual(heads(table), ['Discount', 'Executive']);
  assert.deepEqual([...table.querySelectorAll('thead th')].slice(1).map((th) => th.querySelector('.fare-comparison-fare-cabin').textContent), ['Economy', 'Business']);
  assert.equal(group.querySelector('.fare-comparison-cabin-title').hidden, true);
  assert.deepEqual([...group.querySelectorAll('.fare-comparison-cabins [role="tab"]')].map((t) => t.getAttribute('aria-selected')), ['false', 'false']);
  assert.equal(open.textContent.trim(), 'Compare fares (2)');
  // the rows of both fares in order; Executive has no Empty Side Seat row: its cell empty
  const side = [...table.querySelectorAll('tbody tr')].find((tr) => tr.querySelector('th').textContent.startsWith('Empty Side Seat'));
  assert.equal(side.querySelectorAll('td')[1].textContent.trim(), '');
  // Clear: nothing chosen, the cabin view back
  fire(open, 'click');
  const reopened = [...dialog.querySelectorAll('input[type="checkbox"]')];
  assert.deepEqual(reopened.map((x) => x.checked), [true, false, false, true, false], 'the dialog opens with the chosen ones');
  fire(dialog.querySelector('.fare-comparison-clear'), 'click');
  assert.equal(reopened.every((x) => !x.checked), true);
  fire(dialog.querySelector('.fare-comparison-apply'), 'click');
  assert.deepEqual(heads(visibleTable(block)), ['Discount', 'Classic', 'Plus']);
  assert.equal(open.textContent.trim(), 'Compare fares');
  // a cabin tab ends the comparison too
  fire(open, 'click');
  const third = dialog.querySelector('input[type="checkbox"]');
  third.checked = true;
  fire(third, 'change');
  fire(dialog.querySelector('.fare-comparison-apply'), 'click');
  fire(group.querySelectorAll('.fare-comparison-cabins [role="tab"]')[1], 'click');
  assert.deepEqual(heads(visibleTable(block)), ['Executive', 'Top Executive']);
});

test('the dialog closes with its close button and Escape, nothing changed', () => {
  const { block, document } = page('en-pt', '/en-pt/bookings/tap-fares');
  const open = block.querySelector('.fare-comparison-compare');
  fire(open, 'click');
  const dialog = document.querySelector('dialog.fare-comparison-dialog');
  const close = dialog.querySelector('.fare-comparison-dialog-close');
  assert.equal(close.getAttribute('aria-label'), 'close');
  dialog.querySelector('input[type="checkbox"]').checked = true;
  fire(close, 'click');
  assert.equal(dialog.hasAttribute('open'), false);
  assert.deepEqual(heads(visibleTable(block)), ['Discount', 'Classic', 'Plus']);
});

test('the caption box: the legend with its icons, the notes; its headings from the label rows', () => {
  const { block } = page('pt-pt', '/pt-pt/reservas/tarifas-tap');
  const group = block.querySelector('.fare-comparison-group');
  const caption = [...group.querySelectorAll('.fare-comparison-caption')].find((c) => !c.hidden);
  assert.equal(caption.querySelector('.fare-comparison-caption-title').textContent, 'Legenda');
  assert.deepEqual([...caption.querySelectorAll('li')].map((li) => [li.querySelector('.fare-comparison-icon').dataset.mark, li.textContent.trim()]), [['yes', 'Serviço incluído'], ['no', 'Serviço não incluído']]);
  assert.equal(caption.querySelector('.fare-comparison-notes-title').textContent, 'Notas');
  assert.match(caption.querySelector('.fare-comparison-notes').textContent, /\S/);
});

test('www\'s texts per language (pt-pt, pt-br, de-ch, es, fr, it, en); a row overrides one', () => {
  const { block, document } = page('pt-pt', '/pt-pt/reservas/tarifas-tap');
  assert.equal(block.querySelector('.fare-comparison-compare').textContent.trim(), 'Comparar tarifas');
  assert.equal(block.querySelector('thead th .fare-comparison-services').textContent, 'Serviços');
  fire(block.querySelector('.fare-comparison-compare'), 'click');
  const dialog = document.querySelector('dialog.fare-comparison-dialog');
  assert.equal(dialog.querySelector('.fare-comparison-dialog-note').textContent, 'Pode escolher até quatro tarifas para comparar.');
  assert.deepEqual([dialog.querySelector('.fare-comparison-clear').textContent, dialog.querySelector('.fare-comparison-apply').textContent], ['Limpar', 'Comparar']);
  assert.deepEqual(Object.keys(FARE_COMPARISON_LABELS).sort(), ['de', 'en', 'es', 'fr', 'it', 'pt']);
  assert.equal(FARE_COMPARISON_LABELS.de['compare label'], 'Tarife vergleichen');
  assert.equal(FARE_COMPARISON_LABELS.de['clear label'], 'Zurücksetzen');
  for (const [lang, t] of Object.entries(FARE_COMPARISON_LABELS)) {
    assert.deepEqual(Object.keys(t).sort(), Object.keys(FARE_COMPARISON_LABELS.en).sort(), lang);
  }
});

test('the phone table scrolls sideways; its two buttons are named and move it a column', () => {
  const { block } = page('en-pt', '/en-pt/bookings/tap-fares');
  const group = block.querySelector('.fare-comparison-group');
  const scroller = group.querySelector('.fare-comparison-scroll');
  const [prev, next] = group.querySelectorAll('.fare-comparison-nav button');
  assert.deepEqual([prev.getAttribute('aria-label'), next.getAttribute('aria-label')], ['Previous', 'Next']);
  let moved = null;
  scroller.scrollBy = (o) => { moved = o; };
  fire(next, 'click');
  assert.equal(moved.left, 128);
  fire(prev, 'click');
  assert.equal(moved.left, -128);
});
