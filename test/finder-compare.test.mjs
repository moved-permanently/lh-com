/* eslint-disable max-len */
/* The offers grid's "Compare cities" (blocks/destination-finder/finder-compare.js; Discover parity
   row 24): on a brand whose www grid has it (scripts/brands.js gridCompare: Discover; the parity
   captures show it on Discover's offers pages only) each offer card carries a "Compare cities"
   checkbox (www's maui-checkbox); a ticked card says "Added to compare" and offers "See
   comparison", which opens a modal dialog (www's df-compare-modal): the headline, one column per
   ticked destination with its picture, city, country and price, a grey section with its
   activities, "Flight Information" (duration and stops from the offer: minimumFlightDuration,
   numberOfStopovers) and "Calendar" to the destination's page. Texts: www's labels
   (destinationFinder.resultSection.comparison.* of four_y, discover-compare-001; brief 412). Escape or the close
   button closes it, the focus back on the button that opened it. Values compared as strings and
   booleans, never as DOM nodes. Run: node --max-old-space-size=256 --test test/finder-compare.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.hlx = { codeBasePath: '' };
globalThis.window = window;
globalThis.document = document;
globalThis.Event = window.Event;
const {
  COMPARE_LABELS, durationText, stopsText, createCompare,
} = await import('../blocks/destination-finder/finder-compare.js');
const { BRANDS } = await import('../scripts/brands.js');

const text = (n) => (n ? n.textContent.replace(/\s+/g, ' ').trim() : '');
const LCA = {
  code: 'LCA', name: 'Larnaca', country: 'Cyprus', price: 220, currency: 'EUR', affinities: ['BE', 'CU'], duration: 235, stops: 0,
};
const YYC = {
  code: 'YYC', name: 'Calgary', country: 'Canada', price: 699, currency: 'EUR', affinities: ['NA'], duration: 595, stops: 1,
};
const setup = (lang = 'en') => {
  const compare = createCompare({
    labels: COMPARE_LABELS[lang],
    affinities: [{ code: 'BE', name: 'Beach' }, { code: 'CU', name: 'Culture' }, { code: 'NA', name: 'Nature' }],
    origin: () => ({ code: 'FRA', name: 'Frankfurt' }),
    tripTypeLabel: () => 'round trip',
    price: (o) => `${o.price} €`,
    priceLabel: () => 'Round trip from',
    link: (o) => `/de/en/book/destination?DestinationCode=${o.code}`,
    image: (o) => `/content/dam/four_y/images/offers/destination/${o.code.toLowerCase()}-square.jpg`,
  });
  document.body.replaceChildren(compare.element);
  return compare;
};
const tick = (box) => {
  box.checked = !box.checked;
  box.dispatchEvent(new window.Event('change', { bubbles: true }));
};

// SWISS since standing order 18 of ema-lufthansa (2026-11-14): www's SWISS grid has the same "Compare cities" (swiss-parity-008)
test('the switch: Discover and SWISS only', () => {
  const on = ['discover', 'swiss'];
  on.forEach((k) => assert.equal(BRANDS[k].gridCompare, true, k));
  Object.keys(BRANDS).filter((k) => !on.includes(k)).forEach((k) => assert.equal(Boolean(BRANDS[k].gridCompare), false, k));
});

test('www\'s flight information texts: the duration and the stops', () => {
  const l = COMPARE_LABELS.en;
  assert.equal(durationText(l, 155), 'From 2h 35min');
  assert.equal(durationText(l, 60), 'From 1h');
  assert.equal(durationText(l, 45), 'From 45min');
  assert.equal(durationText(l, undefined), '');
  assert.equal(stopsText(l, 0), 'Nonstop available');
  assert.equal(stopsText(l, 1), 'From 1 stop');
  assert.equal(stopsText(l, 2), 'From 2 stops');
  assert.equal(durationText(COMPARE_LABELS.de, 155), 'Ab 2Std. 35Min.');
  assert.equal(stopsText(COMPARE_LABELS.de, 2), 'Ab 2 Zwischenstops');
});

test('a card\'s control: the checkbox named "Compare cities"; ticked "Added to compare" with "See comparison", announced', () => {
  const compare = setup();
  const control = compare.control(LCA);
  document.body.append(control);
  const box = control.querySelector('input[type="checkbox"]');
  const label = control.querySelector(`label[for="${box.id}"]`);
  assert.equal(text(label), 'Compare cities');
  const open = control.querySelector('button.destination-finder-compare-open');
  assert.equal(open.hidden, true);
  tick(box);
  assert.equal(text(label), 'Added to compare');
  assert.equal(open.hidden, false);
  assert.equal(text(open), 'See comparison');
  assert.equal(text(compare.element.querySelector('[aria-live]')), 'Larnaca has been added to comparison list');
  assert.deepEqual(compare.selected().map((o) => o.code), ['LCA']);
  tick(box);
  assert.equal(text(label), 'Compare cities');
  assert.equal(open.hidden, true);
  assert.equal(text(compare.element.querySelector('[aria-live]')), 'Larnaca has been removed from comparison list');
  assert.deepEqual(compare.selected(), []);
});

test('a re-rendered card keeps its tick; reset() clears them (a new origin or trip type)', () => {
  const compare = setup();
  tick(compare.control(LCA).querySelector('input'));
  assert.equal(compare.control(LCA).querySelector('input').checked, true);
  compare.reset();
  assert.equal(compare.control(LCA).querySelector('input').checked, false);
  assert.deepEqual(compare.selected(), []);
});

test('the dialog: www\'s headline, a column per ticked city in the order ticked, its activities and flight information, Calendar to its page', () => {
  const compare = setup();
  const a = compare.control(LCA);
  const b = compare.control(YYC);
  document.body.append(a, b);
  tick(b.querySelector('input'));
  tick(a.querySelector('input'));
  a.querySelector('button.destination-finder-compare-open').click();
  const dialog = compare.element.querySelector('dialog.destination-finder-compare-dialog');
  assert.ok(dialog.open || dialog.hasAttribute('open'), 'open');
  assert.equal(text(document.getElementById(dialog.getAttribute('aria-labelledby'))), 'Compare destinations and flights from Frankfurt');
  const cols = [...dialog.querySelectorAll('.destination-finder-compare-destination')];
  assert.deepEqual(cols.map((c) => text(c.querySelector('h3'))), ['Calgary', 'Larnaca']);
  const lca = cols[1];
  assert.equal(text(lca.querySelector('.destination-finder-compare-country')), 'Cyprus');
  assert.equal(text(lca.querySelector('.destination-finder-compare-price')), 'Round trip from 220 €');
  assert.deepEqual([...lca.querySelectorAll('.destination-finder-compare-activities li')].map(text), ['Beach', 'Culture']);
  assert.equal(text(lca.querySelector('.destination-finder-compare-duration .destination-finder-compare-label')), 'Duration');
  assert.equal(text(lca.querySelector('.destination-finder-compare-duration .destination-finder-compare-value')), 'From 3h 55min');
  assert.equal(text(lca.querySelector('.destination-finder-compare-stops .destination-finder-compare-label')), 'Stops');
  assert.equal(text(lca.querySelector('.destination-finder-compare-stops .destination-finder-compare-value')), 'Nonstop available');
  assert.equal(text(cols[0].querySelector('.destination-finder-compare-stops .destination-finder-compare-value')), 'From 1 stop');
  const cta = lca.querySelector('a.destination-finder-compare-cta');
  assert.equal(text(cta), 'Calendar');
  assert.equal(cta.getAttribute('href'), '/de/en/book/destination?DestinationCode=LCA');
  assert.equal(text(dialog.querySelector('.destination-finder-compare-flight-headline')), 'Flight Information');
  assert.equal(dialog.style.getPropertyValue('--df-compare-destinations-count'), '2');
});

test('Escape and the close button close it, the focus back on the button that opened it', () => {
  const compare = setup('de');
  const a = compare.control(LCA);
  document.body.append(a);
  const open = a.querySelector('button.destination-finder-compare-open');
  let focused = 0;
  open.focus = () => { focused += 1; };
  tick(a.querySelector('input'));
  open.click();
  const dialog = compare.element.querySelector('dialog.destination-finder-compare-dialog');
  assert.equal(text(document.getElementById(dialog.getAttribute('aria-labelledby'))), 'Reiseziele und Flüge ab Frankfurt vergleichen');
  dialog.dispatchEvent(new window.Event('cancel', { cancelable: true }));
  assert.equal(dialog.hasAttribute('open'), false);
  assert.equal(focused, 1);
  open.click();
  dialog.querySelector('.destination-finder-compare-close').click();
  assert.equal(dialog.hasAttribute('open'), false);
  assert.equal(focused, 2);
  assert.equal(dialog.querySelector('.destination-finder-compare-close').getAttribute('aria-label'), 'Schließen');
});
