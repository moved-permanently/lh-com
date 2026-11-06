/* eslint-disable max-len, no-restricted-syntax, no-await-in-loop -- dev tooling */
/* Discover's "Compare cities" against www's dialog (brief 412, Discover parity row 24; capture
   discover-compare-001 of 2026-11-05, its two recorded answers in test/fixtures/discover-compare/):
   - "See comparison" makes one request, GET /service/api/destinationfinder/flightinfo/<ORIGIN>
     ?destination=<IATA>&destination=<IATA> (one per ticked city, in tick order; scripts/lh-api.js
     flightInfoRequest, the finder's other destinationfinder calls' way); ticking sends nothing;
   - the dialog's Duration ("From 1h", "Ab 9Std. 35Min.") is the answer's flightTime in minutes and
     its Stops ("Nonstop available") its stops; flightsPerWeek is not shown; a city the answer lacks,
     or no answer, keeps the offer's own duration and stops;
   - www's texts (labels/destinationFinder/four_y): "Compare destinations and flights from
     Frankfurt", "Reiseziele und Flüge ab Frankfurt vergleichen";
   - focus on the Close button when it opens; Escape and Close give it back to the "See comparison"
     button that was clicked (each ticked card has one), also when the card was drawn again.
   Values compared as strings, never DOM nodes. Run: node --max-old-space-size=256 --test test/finder-compare-flightinfo.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.hlx = { codeBasePath: '' };
window.location = {
  hostname: 'discover.turnsthe.page', pathname: '/', search: '', hash: '', replace: () => {}, href: 'https://discover.turnsthe.page/', origin: 'https://discover.turnsthe.page',
};
window.origin = window.location.origin;
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
globalThis.window = window;
globalThis.document = document;
globalThis.Event = window.Event;
// the last element focused (linkedom keeps no activeElement)
let lastFocus = null;
window.HTMLElement.prototype.focus = function focus() { lastFocus = this; };
const {
  COMPARE_LABELS, createCompare, loadFlightInfo,
} = await import('../blocks/destination-finder/finder-compare.js');
const { flightInfoRequest } = await import('../scripts/lh-api.js');

const fixture = (name) => JSON.parse(fs.readFileSync(new URL(`./fixtures/discover-compare/${name}.json`, import.meta.url), 'utf8'));
const EN = fixture('flightinfo-FRA-SZG-LCA');
const DE = fixture('flightinfo-FRA-LCA-YYC');
const text = (n) => (n ? n.textContent.replace(/\s+/g, ' ').trim() : '');
const offer = (code, name, duration, stops) => ({
  code, name, country: 'x', price: 100, currency: 'EUR', affinities: [], duration, stops,
});
// the offers answer's own (minimumFlightDuration, numberOfStopovers) differ from flightinfo's
const SZG = offer('SZG', 'Salzburg', 75, 1);
const LCA = offer('LCA', 'Larnaca', 235, 1);
const YYC = offer('YYC', 'Calgary', 595, 1);

const setup = (lang, flightInfo) => {
  const compare = createCompare({
    labels: COMPARE_LABELS[lang],
    origin: () => ({ code: 'FRA', name: 'Frankfurt' }),
    tripTypeLabel: () => 'round trip',
    price: (o) => `${o.price} €`,
    priceLabel: () => 'Round trip from',
    link: (o) => `/de/${lang}/book/destination?DestinationCode=${o.code}`,
    flightInfo,
  });
  document.body.replaceChildren(compare.element);
  return compare;
};
const tick = (control) => {
  const box = control.querySelector('input');
  box.checked = !box.checked;
  box.dispatchEvent(new window.Event('change', { bubbles: true }));
};
const values = (dialog) => [...dialog.querySelectorAll('.destination-finder-compare-destination')]
  .map((c) => `${text(c.querySelector('h3'))}: ${text(c.querySelector('.destination-finder-compare-duration .destination-finder-compare-value'))}, ${text(c.querySelector('.destination-finder-compare-stops .destination-finder-compare-value'))}`);
const opened = (dialog) => dialog.open || dialog.hasAttribute('open');

test('the request: one destination per ticked city in tick order, as www\'s', () => {
  assert.equal(flightInfoRequest('FRA', ['SZG', 'LCA']).route, '/service/api/destinationfinder/flightinfo/FRA?destination=SZG&destination=LCA');
  assert.equal(new URL(EN.url).pathname + new URL(EN.url).search, flightInfoRequest('FRA', ['SZG', 'LCA']).route);
  assert.equal(flightInfoRequest('FRA', 'CHI').route, '/service/api/destinationfinder/flightinfo/FRA?destination=CHI', 'the destination page\'s one city as before');
});

test('loadFlightInfo: the finder\'s fetch with the request, the answer by city code (flightTime, stops)', async () => {
  const calls = [];
  const fetcher = async (request, locale, options) => {
    calls.push([request.route, locale.key, JSON.stringify(options)]);
    return { data: EN.body, source: 'live' };
  };
  const info = await loadFlightInfo('FRA', ['SZG', 'LCA'], { key: 'de/en' }, fetcher);
  assert.deepEqual(calls, [['/service/api/destinationfinder/flightinfo/FRA?destination=SZG&destination=LCA', 'de/en', '{"exact":true}']]);
  assert.deepEqual(info, { SZG: { duration: 60, stops: 0 }, LCA: { duration: 225, stops: 0 } });
  assert.deepEqual(await loadFlightInfo('FRA', ['SZG'], { key: 'de/en' }, async () => ({ data: { nothing: 1 } })), {});
  assert.deepEqual(await loadFlightInfo('FRA', [], { key: 'de/en' }, async () => { throw new Error('no call'); }), {});
});

test('ticking sends nothing; See comparison asks once, the dialog shows the answer\'s duration and stops (de/en)', async () => {
  const asked = [];
  const compare = setup('en', async (codes) => { asked.push(codes.join(',')); return { SZG: { duration: 60, stops: 0 }, LCA: { duration: 225, stops: 0 } }; });
  const a = compare.control(SZG);
  const b = compare.control(LCA);
  document.body.append(a, b);
  tick(a);
  tick(b);
  assert.deepEqual(asked, [], 'no request on a tick');
  await compare.open(a.querySelector('button.destination-finder-compare-open'));
  assert.deepEqual(asked, ['SZG,LCA']);
  const dialog = compare.element.querySelector('dialog');
  assert.ok(opened(dialog));
  assert.deepEqual(values(dialog), ['Salzburg: From 1h, Nonstop available', 'Larnaca: From 3h 45min, Nonstop available']);
  assert.equal(text(document.getElementById(dialog.getAttribute('aria-labelledby'))), 'Compare destinations and flights from Frankfurt');
  assert.equal(lastFocus && lastFocus.getAttribute('aria-label'), 'Close');
});

test('de/de: "Ab 9Std. 35Min.", "Nonstop-Flüge verfügbar", www\'s headline', async () => {
  const compare = setup('de', async () => loadFlightInfo('FRA', ['LCA', 'YYC'], { key: 'de/de' }, async () => ({ data: DE.body })));
  const a = compare.control(LCA);
  const b = compare.control(YYC);
  document.body.append(a, b);
  tick(a);
  tick(b);
  await compare.open(b.querySelector('button.destination-finder-compare-open'));
  const dialog = compare.element.querySelector('dialog');
  assert.deepEqual(values(dialog), ['Larnaca: Ab 3Std. 45Min., Nonstop-Flüge verfügbar', 'Calgary: Ab 9Std. 35Min., Nonstop-Flüge verfügbar']);
  assert.equal(text(document.getElementById(dialog.getAttribute('aria-labelledby'))), 'Reiseziele und Flüge ab Frankfurt vergleichen');
  assert.equal(lastFocus && lastFocus.getAttribute('aria-label'), 'Schließen');
});

test('no answer, or a city the answer lacks: the offer\'s own duration and stops', async () => {
  for (const flightInfo of [async () => { throw new Error('refused'); }, async () => ({})]) {
    const compare = setup('en', flightInfo);
    const a = compare.control(SZG);
    document.body.append(a);
    tick(a);
    await compare.open(a.querySelector('button.destination-finder-compare-open'));
    assert.deepEqual(values(compare.element.querySelector('dialog')), ['Salzburg: From 1h 15min, From 1 stop']);
  }
});

test('focus back on the clicked card\'s See comparison button (the second card), also after the card was drawn again', async () => {
  const compare = setup('en', async () => ({}));
  const a = compare.control(SZG);
  let b = compare.control(LCA);
  document.body.append(a, b);
  tick(a);
  tick(b);
  const focused = [];
  const watch = (control, name) => { control.querySelector('button.destination-finder-compare-open').focus = () => focused.push(name); };
  watch(a, 'SZG');
  watch(b, 'LCA');
  await compare.open(b.querySelector('button.destination-finder-compare-open'));
  const dialog = compare.element.querySelector('dialog');
  dialog.dispatchEvent(new window.Event('cancel', { cancelable: true }));
  assert.equal(opened(dialog), false);
  assert.deepEqual(focused, ['LCA']);
  // the grid draws its cards again while the dialog is open: the new card's button gets the focus
  await compare.open(b.querySelector('button.destination-finder-compare-open'));
  const again = compare.control(LCA);
  b.replaceWith(again);
  b = again;
  watch(b, 'LCA again');
  dialog.querySelector('.destination-finder-compare-close').click();
  assert.deepEqual(focused, ['LCA', 'LCA again']);
});

test('the finder hands the compare its flight info loader (origin, the ticked codes, the page\'s locale)', () => {
  const js = fs.readFileSync(new URL('../blocks/destination-finder/destination-finder.js', import.meta.url), 'utf8');
  assert.ok(js.includes('flightInfo: (codes) => loadFlightInfo(state.origin.code, codes, locale)'), js.match(/createCompare\(\{[\s\S]{0,200}/)[0]);
});
