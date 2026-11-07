/* eslint-disable max-len */
/* Air Dolomiti's footer columns in www's phone order (blocks/footer/footer-airdolomiti.js), brief
   448, item 5 (parity A8): below 930 px www's phone footer (FooterMobile) has the company links,
   then Contacts, Passenger Assistance, Routes, Travel tips, Legal info; its desktop one (and the
   footer documents) Contacts, Travel tips, Routes, Passenger Assistance, Legal info. The columns
   are moved in the DOM (no CSS order), so the Tab order is the order on screen, and back from
   930 px (the desktop grid places them by position). Other column counts stay as they are.
   footer.js loads it on the brand airdolomiti only.
   Run: node --max-old-space-size=256 --test test/footer-airdolomiti-448.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
globalThis.window = window;
globalThis.document = document;
const { default: orderFooterColumns } = await import('../blocks/footer/footer-airdolomiti.js');

const NAMES = ['Air Dolomiti', 'Contacts', 'Travel tips', 'Routes', 'Passenger Assistance', 'Legal info'];
const footer = (names = NAMES) => {
  const block = document.createElement('div');
  block.innerHTML = `<div class="footer-main"><div class="footer-inner"><div class="footer-columns">${names.map((n) => `<div class="footer-column"><h3>${n}</h3></div>`).join('')}</div></div></div>`;
  return block;
};
const order = (block) => [...block.querySelectorAll('.footer-column h3')].map((h) => h.textContent);
const query = (matches) => {
  const q = { matches, listeners: [], addEventListener: (t, f) => q.listeners.push(f) };
  q.set = (m) => { q.matches = m; q.listeners.forEach((f) => f()); };
  return q;
};

test('below 930 px www\'s phone order, from 930 px the documents\' again', () => {
  const block = footer();
  const mq = query(true);
  orderFooterColumns(block, mq);
  assert.deepEqual(order(block), ['Air Dolomiti', 'Contacts', 'Passenger Assistance', 'Routes', 'Travel tips', 'Legal info']);
  mq.set(false);
  assert.deepEqual(order(block), NAMES);
  mq.set(true);
  assert.equal(order(block)[2], 'Passenger Assistance');
});

test('other footers as they are; footer.js on Air Dolomiti only', () => {
  const block = footer(NAMES.slice(0, 4));
  orderFooterColumns(block, query(true));
  assert.deepEqual(order(block), NAMES.slice(0, 4));
  const js = fs.readFileSync(new URL('../blocks/footer/footer.js', import.meta.url), 'utf8');
  assert.match(js, /if \(getMetadata\('brand'\)\.trim\(\)\.toLowerCase\(\) === 'airdolomiti'\) \{\s*const \{ default: orderFooterColumns \} = await import\('\.\/footer-airdolomiti\.js'\);\s*orderFooterColumns\(block\);/);
});
