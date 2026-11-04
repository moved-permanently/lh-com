/* scripts/airport-combobox.js's two optional parameters (brief 324; booking-spec.md 4):
   minChars (default 2: the list after two typed characters, as before; booking-box 0: the list
   opens on focus with an empty term) and renderOption(airport, li) / display(airport) (default:
   today's "name (code)" in the list and the field; booking-box: a code chip, "City, Airport" and
   the country in the list, "City, Country" in the field). flight-search, destination-finder,
   flight-status and lounge-finder pass neither: unchanged.
   Run: node --max-old-space-size=512 --test test/airport-combobox-options.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><body></body></html>');
globalThis.window = window;
globalThis.document = document;
let active = null;
Object.defineProperty(document, 'activeElement', { get: () => active, configurable: true });
const { createAirportCombobox, airportDisplay } = await import('../scripts/airport-combobox.js');

const wait = (ms) => new Promise((r) => { setTimeout(r, ms); });
const fire = (el, type) => el.dispatchEvent(new window.Event(type));
const focus = (el) => { active = el; fire(el, 'focus'); };
const LIST = [{ code: 'LIS', name: 'Lisbon', cityName: 'Lisboa' }, { code: 'OPO', name: 'Porto', cityName: 'Porto' }];

// scrollIntoView is not in linkedom
function li(box) { box.element.querySelector('ul').scrollIntoView = () => {}; }

function make(extra = {}) {
  const terms = [];
  const box = createAirportCombobox({
    label: 'From',
    fetchSuggestions: async (t) => { terms.push(t); return LIST; },
    ...extra,
  });
  document.body.append(box.element);
  box.input.select = () => {};
  li(box);
  return { box, terms };
}

test('defaults as before: no list under two characters, none on focus, "name (code)" in the list and the field', async () => {
  const { box, terms } = make({ value: { code: 'FRA', name: 'Frankfurt' } });
  assert.equal(box.input.value, 'Frankfurt (FRA)');
  focus(box.input);
  await wait(300);
  assert.deepEqual(terms, [], 'nothing on focus');
  box.input.value = 'l';
  fire(box.input, 'input');
  await wait(300);
  assert.deepEqual(terms, [], 'one character: nothing');
  box.input.value = 'li';
  fire(box.input, 'input');
  await wait(300);
  assert.deepEqual(terms, ['li']);
  const items = [...box.element.querySelectorAll('li')];
  assert.deepEqual(items.map((x) => x.textContent), ['Lisbon (LIS)', 'Porto (OPO)']);
  assert.equal(airportDisplay({ code: 'LIS', name: 'Lisbon' }), 'Lisbon (LIS)');
  items[0].dispatchEvent(new window.Event('mousedown'));
  assert.equal(box.input.value, 'Lisbon (LIS)');
  assert.equal(box.getValue().code, 'LIS');
});

test('minChars 0: the list opens on focus with an empty term, and filters from the first character', async () => {
  const { box, terms } = make({ minChars: 0 });
  focus(box.input);
  await wait(300);
  assert.deepEqual(terms, ['']);
  assert.equal(box.element.querySelector('ul').hidden, false);
  box.input.value = 'p';
  fire(box.input, 'input');
  await wait(300);
  assert.deepEqual(terms, ['', 'p']);
  box.input.value = '';
  fire(box.input, 'input');
  await wait(300);
  assert.deepEqual(terms, ['', 'p', ''], 'emptied: the full list again');
});

test('renderOption and display: the option\'s content and the field\'s text are the block\'s', async () => {
  const display = (a) => (a.cityName ? `${a.cityName}, PT` : a.code);
  const renderOption = (a, item) => {
    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.textContent = a.code;
    item.append(chip, document.createTextNode(` ${a.cityName}`));
  };
  const changes = [];
  const { box } = make({
    minChars: 0, display, renderOption, value: { code: 'LIS', cityName: 'Lisboa' }, onChange: (a) => changes.push(a && a.code),
  });
  assert.equal(box.input.value, 'Lisboa, PT');
  focus(box.input);
  await wait(300);
  const items = [...box.element.querySelectorAll('li')];
  assert.deepEqual(items.map((x) => x.querySelector('.chip').textContent), ['LIS', 'OPO']);
  assert.equal(items[1].textContent, 'OPO Porto');
  assert.equal(items[1].getAttribute('role'), 'option');
  items[1].dispatchEvent(new window.Event('mousedown'));
  assert.equal(box.input.value, 'Porto, PT');
  assert.deepEqual(changes, ['OPO']);
  // typed text that was not picked: back to the value's display text
  box.input.value = 'Por';
  fire(box.input, 'blur');
  assert.equal(box.input.value, 'Porto, PT');
  box.setValue({ code: 'FAO' }, { silent: true });
  assert.equal(box.input.value, 'FAO');
});

test('the blocks that use the combobox pass neither option (their behaviour unchanged)', () => {
  ['blocks/flight-search/flight-search.js', 'blocks/destination-finder/destination-finder.js', 'blocks/flight-status/flight-status.js', 'blocks/lounge-finder/lounge-finder.js'].forEach((f) => {
    const src = fs.readFileSync(f, 'utf8');
    if (!src.includes('createAirportCombobox(')) return;
    assert.doesNotMatch(src, /minChars|renderOption/, f);
  });
});
