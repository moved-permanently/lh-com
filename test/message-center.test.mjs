/* Filter and order logic of scripts/message-center.js. Run: node --test test/ */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  selectMessages, parseRow, listField, messageHref, iconOf,
} from '../scripts/message-center.js';

const NOW = Date.parse('2026-10-25T09:00:00.000Z');

const row = (path, fields = {}) => ({
  path,
  headline: `Headline ${path}`,
  criticality: 'low',
  tenants: ['lh'],
  markets: [],
  touchpoints: ['web'],
  link: '',
  details: '',
  from: '',
  to: '',
  push: 'false',
  'internal-title': '',
  lastModified: 1792900000,
  ...fields,
});

// the three published test messages of the index (2026-10-25)
const INDEX = [
  row('/message-center/promo/test-3/de', {
    headline: 'Test 3: Ihr Skigepäck fliegt kostenlos mit (Test)', markets: ['gb'], link: '/gb/en/local-page/ski-campaign-2026', push: 'true',
  }),
  row('/message-center/irreg/test-1/en', {
    headline: 'Test 1: Information on flights to Dubai (test)', criticality: 'high', tenants: ['lh', 'lx'], markets: ['de', 'at'], touchpoints: ['web', 'android-app'], details: '/message-center/details/test-1/en', to: '2026-12-31T22:00:00.000Z',
  }),
  row('/message-center/tech-outage/test-2/en', {
    headline: 'Test 2: Check-in is temporarily only possible in the app (test)', tenants: ['lh', 'b2b'], from: '2026-10-25T07:00:00.000Z',
  }),
];

const ids = (list) => list.map((m) => m.id);

test('de/en: test-1 (high) before test-2, no promo', () => {
  assert.deepEqual(ids(selectMessages(INDEX, { market: 'de', lang: 'en', now: NOW })), ['test-1', 'test-2']);
});

test('gb/en: test-2 only (test-1 is for de and at; test-3 has no English row)', () => {
  assert.deepEqual(ids(selectMessages(INDEX, { market: 'gb', lang: 'en', now: NOW })), ['test-2']);
});

test('de/de: the English rows stand in for the missing German ones', () => {
  const list = selectMessages(INDEX, { market: 'de', lang: 'de', now: NOW });
  assert.deepEqual(ids(list), ['test-1', 'test-2']);
  assert.ok(list.every((m) => m.lang === 'en'));
});

test('the page language wins over English when both rows exist', () => {
  const rows = [
    row('/message-center/irreg/x/en', { headline: 'English' }),
    row('/message-center/irreg/x/de', { headline: 'Deutsch' }),
  ];
  assert.equal(selectMessages(rows, { market: 'de', lang: 'de', now: NOW })[0].headline, 'Deutsch');
  assert.equal(selectMessages(rows, { market: 'de', lang: 'en', now: NOW })[0].headline, 'English');
  // no English row and another language: nothing
  assert.deepEqual(selectMessages([rows[1]], { market: 'gb', lang: 'en', now: NOW }), []);
});

test('the from/to window, compared in UTC (from inclusive, to exclusive)', () => {
  const rows = [row('/message-center/irreg/w/en', { from: '2026-10-25T08:00:00.000Z', to: '2026-10-25T10:00:00.000Z' })];
  const at = (iso) => ids(selectMessages(rows, { market: 'de', lang: 'en', now: Date.parse(iso) }));
  assert.deepEqual(at('2026-10-25T07:59:59.999Z'), []);
  assert.deepEqual(at('2026-10-25T08:00:00.000Z'), ['w']);
  assert.deepEqual(at('2026-10-25T09:59:59.999Z'), ['w']);
  assert.deepEqual(at('2026-10-25T10:00:00.000Z'), []);
  // test-2 starts at 07:00 UTC
  assert.deepEqual(ids(selectMessages(INDEX, { market: 'gb', lang: 'en', now: Date.parse('2026-10-25T06:59:00Z') })), []);
});

test('order: irreg high, tech-outage high, irreg low, tech-outage low, promo; newest first', () => {
  const rows = [
    row('/message-center/tech-outage/to-low/en'),
    row('/message-center/irreg/ir-low-old/en', { from: '2026-10-20T00:00:00.000Z' }),
    row('/message-center/irreg/ir-low-new/en', { from: '2026-10-24T00:00:00.000Z' }),
    row('/message-center/tech-outage/to-high/en', { criticality: 'high' }),
    row('/message-center/irreg/ir-high/en', { criticality: 'high' }),
  ];
  assert.deepEqual(
    ids(selectMessages(rows, { market: 'de', lang: 'en', now: NOW })),
    ['ir-high', 'to-high', 'ir-low-new', 'ir-low-old', 'to-low'],
  );
});

test('promotions only when no irregularity or outage is shown; promo high before low', () => {
  const promos = [
    row('/message-center/promo/p-low/en'),
    row('/message-center/promo/p-high/en', { criticality: 'high' }),
  ];
  assert.deepEqual(ids(selectMessages(promos, { market: 'de', lang: 'en', now: NOW })), ['p-high', 'p-low']);
  const mixed = [...promos, row('/message-center/tech-outage/t/en')];
  assert.deepEqual(ids(selectMessages(mixed, { market: 'de', lang: 'en', now: NOW })), ['t']);
  // a block that shows promotions only keeps them
  assert.deepEqual(ids(selectMessages(mixed, {
    market: 'de', lang: 'en', now: NOW, types: ['promo'],
  })), ['p-high', 'p-low']);
});

test('tenant, market and touchpoint filters', () => {
  const rows = [
    row('/message-center/irreg/lx-only/en', { tenants: ['lx'] }),
    row('/message-center/irreg/at-only/en', { markets: ['at'] }),
    row('/message-center/irreg/app-only/en', { touchpoints: ['android-app'] }),
    row('/message-center/irreg/all/en', { markets: [] }),
  ];
  assert.deepEqual(ids(selectMessages(rows, { market: 'de', lang: 'en', now: NOW })), ['all']);
  assert.deepEqual(ids(selectMessages(rows, { market: 'at', lang: 'en', now: NOW })).sort(), ['all', 'at-only']);
});

test('empty and broken input', () => {
  assert.deepEqual(selectMessages([], { market: 'de', lang: 'en', now: NOW }), []);
  assert.deepEqual(selectMessages(undefined, { market: 'de', lang: 'en', now: NOW }), []);
  assert.deepEqual(selectMessages([row('/message-center/details/test-1/en'), row('/elsewhere')], { market: 'de', lang: 'en', now: NOW }), []);
  assert.deepEqual(selectMessages([row('/message-center/irreg/x/en', { headline: '' })], { market: 'de', lang: 'en', now: NOW }), []);
});

test('list fields: arrays, JSON strings and comma lists', () => {
  assert.deepEqual(listField(['LH', ' lx ']), ['lh', 'lx']);
  assert.deepEqual(listField('["lh","lx"]'), ['lh', 'lx']);
  assert.deepEqual(listField('lh, lx'), ['lh', 'lx']);
  assert.deepEqual(listField(''), []);
  assert.deepEqual(listField('[]'), []);
  assert.equal(parseRow(row('/message-center/irreg/a/en', { push: 'true' })).push, true);
});

test('links: own link, else the current travel information page; #<id> added', () => {
  const cti = [{ tenant: 'lh', webPath: '/{cc}/{ll}/prepare-for-your-trip/current-travel-information', contentPath: '/content/lh/gc/en/prepare-for-your-trip/current-travel-information' }];
  const [m1, m2] = selectMessages(INDEX, { market: 'de', lang: 'en', now: NOW });
  const locale = { country: 'de', lang: 'en' };
  assert.equal(messageHref(m1, cti, locale), '/de/en/prepare-for-your-trip/current-travel-information#test-1');
  assert.equal(messageHref(m2, cti, locale), '/de/en/prepare-for-your-trip/current-travel-information#test-2');
  const promo = parseRow(INDEX[0]);
  assert.equal(messageHref(promo, cti, locale), '/gb/en/local-page/ski-campaign-2026#test-3');
  assert.equal(messageHref(m1, [], locale), '');
});

test('icons: warning for high, info for low, sale for promotions', () => {
  assert.equal(iconOf({ type: 'irreg', criticality: 'high' }), 'warning');
  assert.equal(iconOf({ type: 'tech-outage', criticality: 'low' }), 'info');
  assert.equal(iconOf({ type: 'promo', criticality: 'high' }), 'sale');
});
