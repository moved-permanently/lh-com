/* booking-lookup (blocks/booking-lookup), lh-com only (brief 404, parity row 15; capture
   lufthansa-parity-001 /de/en/online-check-in at 390): www's maui-tab-control-panel-responsive is
   on phones a maui-collapsible-item per tab, all collapsed. Option collapsible of buildTabs: below
   768px the tabs are disclosure buttons (aria-expanded, no tab roles), all closed at first, each
   opening and closing its own panel; from 768px the tab set as before (the first selected). Without
   the option (the other brands) the tabs stay tabs at every width.
   Run: node --max-old-space-size=256 --test test/booking-lookup-collapsible.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.hlx = { codeBasePath: '' };
window.location = {
  hostname: 'main--lh-com--moved-permanently.aem.page', pathname: '/de/en/online-check-in', search: '', replace: () => {}, href: 'https://main--lh-com--moved-permanently.aem.page/de/en/online-check-in', origin: 'https://main--lh-com--moved-permanently.aem.page',
};
window.origin = window.location.origin;
let narrow = true;
const listeners = [];
window.matchMedia = (q) => ({
  get matches() { return /width < 768px/.test(q) ? narrow : false; },
  addEventListener: (type, fn) => listeners.push(fn),
  addListener: (fn) => listeners.push(fn),
});
globalThis.window = window;
globalThis.document = document;
const { buildTabs } = await import('../blocks/booking-lookup/booking-lookup.js');

const setup = (options) => {
  const panels = [0, 1].map((i) => { const p = document.createElement('div'); p.id = `bl-panel-${i}`; p.textContent = `panel ${i}`; return p; });
  const tablist = buildTabs('bl', [{ label: 'Booking reference or ticket number' }, { label: 'Tour operator travel' }], panels, 'Check-in', options);
  document.body.replaceChildren(tablist, ...panels);
  return { tablist, panels, buttons: [...tablist.querySelectorAll('button')] };
};
const state = ({ buttons, panels }) => buttons.map((b, i) => `${b.getAttribute('role') || '-'}:${b.getAttribute('aria-expanded') || '-'}:${b.getAttribute('aria-selected') || '-'}:${panels[i].hidden ? 'hidden' : 'shown'}`).join(' ');

test('collapsible below 768px: disclosure buttons, both closed; each opens and closes its own panel', () => {
  narrow = true;
  const t = setup({ collapsible: true });
  assert.equal(t.tablist.hasAttribute('role'), false);
  assert.equal(state(t), '-:false:-:hidden -:false:-:hidden');
  t.buttons[1].click();
  assert.equal(state(t), '-:false:-:hidden -:true:-:shown');
  t.buttons[0].click();
  assert.equal(state(t), '-:true:-:shown -:true:-:shown');
  t.buttons[1].click();
  assert.equal(state(t), '-:true:-:shown -:false:-:hidden');
});

test('collapsible from 768px (and on resize): the tab set, the first selected', () => {
  narrow = false;
  const t = setup({ collapsible: true });
  assert.equal(t.tablist.getAttribute('role'), 'tablist');
  assert.equal(state(t), 'tab:-:true:shown tab:-:false:hidden');
  narrow = true;
  listeners.forEach((fn) => fn());
  assert.equal(state(t), '-:false:-:hidden -:false:-:hidden');
  narrow = false;
  listeners.forEach((fn) => fn());
  assert.equal(state(t), 'tab:-:true:shown tab:-:false:hidden');
});

test('without the option: tabs at every width, as before', () => {
  narrow = true;
  const t = setup();
  assert.equal(t.tablist.getAttribute('role'), 'tablist');
  assert.equal(state(t), 'tab:-:true:shown tab:-:false:hidden');
});

test('an open disclosure row turns its chevron (below 768px), not the my-bookings variant\'s', async () => {
  const fs = await import('node:fs');
  const css = fs.readFileSync(new URL('../blocks/booking-lookup/booking-lookup.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');
  assert.match(css, /@media \(width < 768px\) \{[^@]*\.booking-lookup:not\(\.my-bookings\) \.booking-lookup-tab\[aria-expanded="true"\]::after \{ transform: rotate\(180deg\); \}/);
});
