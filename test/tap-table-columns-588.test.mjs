/* eslint-disable max-len, import/extensions */
/* TAP's rich-text tables (TAP row 146; tap-parity-007 lounges, tap-parity-009 fees, hold baggage, wheelchair, earn miles by
   flying): www draws every one the same way: from 1024 px one card per column side by side (the first the row labels when
   the table's first cell is empty; the others a grey card with a dark top line, the column's head over its values, the
   rows as high as across the cards), below 1024 px one closed accordion per value column (its head the column's; inside,
   each row's label over its value). table-striped on brand tap now builds both views (table-striped-tap.js toColumns); a
   comparison table (✓ / ✕), a matrix, a beside table, one row or one column: as before.
   Run: node --max-old-space-size=512 --test test/tap-table-columns-588.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head><meta name="brand" content="tap"></head><body><main></main></body></html>');
globalThis.window = window;
globalThis.document = document;
// scripts/aem.js reads the location when it is imported
window.location = {
  hostname: 'tap.turnsthe.page', pathname: '/', search: '', hash: '', replace: () => {}, href: 'https://tap.turnsthe.page/', origin: 'https://tap.turnsthe.page',
};
window.origin = window.location.origin;
globalThis.Event = window.Event;

const { toColumns } = await import('../blocks/table-striped/table-striped-tap.js');

const block = (rows, cls = 'table-striped') => {
  const b = document.createElement('div');
  b.className = cls;
  b.innerHTML = rows.map((r) => `<div>${r.map((c) => `<div>${c}</div>`).join('')}</div>`).join('');
  document.querySelector('main').append(b);
  return b;
};

test('a table with row labels: a labels card and a card per column; an accordion per value column, closed', () => {
  const b = block([['', 'Miles e Silver', 'Gold'], ['<strong>Domestic flights</strong>', '50 EUR', 'Free'], ['Continental flights', '75 EUR', '15 EUR']]);
  assert.equal(toColumns(b), true);
  const cards = [...b.querySelectorAll('.table-striped-cards > .table-striped-card')];
  assert.equal(cards.length, 3);
  assert.ok(cards[0].classList.contains('table-striped-card-labels'));
  assert.deepEqual([...cards[1].children].map((c) => c.textContent), ['Miles e Silver', '50 EUR', '75 EUR']);
  assert.equal(b.querySelector('.table-striped-cards').style.getPropertyValue('--table-striped-rows'), '3');
  const items = [...b.querySelectorAll('.table-striped-accordions > .table-striped-acc')];
  assert.equal(items.length, 2);
  const toggle = items[0].querySelector('button');
  const panel = items[0].querySelector('.table-striped-acc-panel');
  assert.equal(toggle.textContent, 'Miles e Silver');
  assert.equal(toggle.getAttribute('aria-expanded'), 'false');
  assert.equal(panel.hidden, true);
  assert.equal(toggle.getAttribute('aria-controls'), panel.id);
  assert.deepEqual([...panel.querySelectorAll('.table-striped-acc-label')].map((x) => x.textContent), ['Domestic flights', 'Continental flights']);
  assert.deepEqual([...panel.querySelectorAll('.table-striped-acc-value')].map((x) => x.textContent), ['50 EUR', '75 EUR']);
  toggle.dispatchEvent(new window.Event('click'));
  assert.equal(toggle.getAttribute('aria-expanded'), 'true');
  assert.equal(panel.hidden, false);
  b.remove();
});

test('a table without row labels (its first cell text, lounges): a card per column, an accordion per column', () => {
  const b = block([['Lounge A', 'Lounge B'], ['Terminal 1', 'Terminal 2']]);
  assert.equal(toColumns(b), true);
  assert.equal(b.querySelectorAll('.table-striped-card').length, 2);
  assert.equal(b.querySelectorAll('.table-striped-card-labels').length, 0);
  assert.equal(b.querySelectorAll('.table-striped-acc').length, 2);
  assert.equal(b.querySelectorAll('.table-striped-acc-label').length, 0);
  b.remove();
});

test('as before: a comparison table, a table with notes, one row, one column', () => {
  [[['', 'Prime'], ['Seat', '✓']], [['', 'Prime'], ['Seat', 'Free<br><em>a note</em>']], [['a', 'b']], [['a'], ['b']]].forEach((rows) => {
    const b = block(rows);
    assert.equal(toColumns(b), false);
    assert.equal(b.querySelector('.table-striped-cards'), null);
    b.remove();
  });
});
