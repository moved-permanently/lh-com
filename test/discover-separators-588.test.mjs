/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* Discover's separators (standing order 5 of 2026-11-12, item 1; discover-parity-001 /de/en/my-bookings/manage/
   customer-service -5.9 % at 1440): www.discover-airlines.com's .separator (.hr-no-layout: no line, .hr's margin-bottom
   30 px on Discover, 2.5rem = 25 px on lufthansa.com) adds 31 px between two components (the accordion's end to the next
   heading 71 px on www, 40 in the replica; 1 to 7 on 20 of the 26 recorded pages). The cleanup dropped every separator
   under 50 px as "the normal component spacing the replica already has". On Discover pages it now keeps a separator
   between two components as "{spacer-30}" (its inline margin when it has one); one at the start or end of its parent
   goes as before (www: no margin there). lufthansa.com, Brussels and SWISS as before.
   Note: marker-collapse.mjs (THEMES.discover live, no textSpacers) removes separators of 31 px or less, so the
   documents keep these spaces only once the collapse carries them (rows-for-ema-test.md row 4).
   Run: node --max-old-space-size=256 --test test/discover-separators-588.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import transform from '../tools/importer/transformers/lufthansa-cleanup.js';

globalThis.WebImporter = { Blocks: { getMetadata: () => ({}), getMetadataBlock: (document) => document.createElement('table') } };

const text = '<div class="text section"><div class="richtext"><p>You can rebook your flight online.</p></div></div>';
const sep = (style) => `<div class="separator section"><div aria-hidden="true" ${style ? `style="${style}" ` : ''}class="hr hr-no-layout "><maui-divider></maui-divider></div></div>`;
const headline = '<div class="headline section"><h2 class="headline heading-small">Refunds</h2></div>';
// www's accordion component (maui-collapsible): a block, as on customer-service before "Rebooking a flight"
const accordion = '<div class="accordion section"><div class="accordion commonevent"><maui-collapsible><maui-collapsible-item><span slot="header">Travel agency tickets</span><p>If you purchased your flight from a travel agency…</p></maui-collapsible-item></maui-collapsible></div></div>';

const spacers = (inner, url, template = 'info') => {
  const { document } = parseHTML(`<html><head><title>T</title></head><body><main><div class="section"><div class=" mb-default "><div class="section-content container-fluid section-regular ">${inner}</div></div></div></main></body></html>`);
  const payload = {
    document, url, params: { originalURL: url }, template: { name: template },
  };
  transform('beforeTransform', document.body, payload);
  transform('afterTransform', document.body, payload);
  return [...document.querySelectorAll('p')].map((p) => p.textContent.trim()).filter((t) => /\{(spacer|divider)-/.test(t));
};

const DISCOVER = 'https://www.discover-airlines.com/de/en/my-bookings/manage/customer-service';

test('Discover: a separator between two components stays, 30 px (its inline margin when it has one)', () => {
  assert.deepEqual(spacers(`${accordion}${sep()}${headline}${text}`, DISCOVER), ['{spacer-30}']);
  assert.deepEqual(spacers(`${accordion}${sep('margin-bottom: 40px;')}${headline}${text}`, DISCOVER), ['{spacer-40}']);
  assert.deepEqual(spacers(`${accordion}${sep()}${headline}${text}`, DISCOVER, 'hub'), ['{spacer-30}'], 'any template');
});

test('Discover: at the start or end of its parent, dropped as before', () => {
  assert.deepEqual(spacers(`${sep()}${accordion}${headline}`, DISCOVER), []);
  assert.deepEqual(spacers(`${headline}${accordion}${sep()}`, DISCOVER), []);
});

test('lufthansa.com, Brussels and SWISS: the same separator (after a block, before a heading) dropped as before', () => {
  ['https://www.lufthansa.com/de/en/customer-service', 'https://www.brusselsairlines.com/be/en/customer-service', 'https://www.swiss.com/ch/en/customer-service'].forEach((url) => {
    assert.deepEqual(spacers(`${accordion}${sep()}${headline}${text}`, url), [], url);
  });
});

test('Discover: separators kept for other reasons (running text on an info page) at Discover\'s 30 px too', () => {
  assert.deepEqual(spacers(`${text}${sep()}${headline}${text}`, DISCOVER), ['{spacer-30}']);
  assert.deepEqual(spacers(`${text}${sep()}${headline}${text}`, 'https://www.lufthansa.com/de/en/customer-service'), ['{spacer-25}'], 'lufthansa.com keeps its 25');
});
