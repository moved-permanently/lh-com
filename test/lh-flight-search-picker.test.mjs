/* eslint-disable max-len, import/extensions */
/* lufthansa.com's flight search with the passengers and cabin picker (tools/importer/parsers/
   flight-search-picker.js, used by the flight-search parser and by lh-picker-apply.mjs): the rows
   Passenger picker | yes, www's texts of its travel details panel (labels/common booking.*,
   labels/flightmanager travelDetails.groupBookingLinkText; recorded 2026-11-01, data/recorded) and
   Group booking | our group travel page (www's groupBookingsUrl /content/lh/markets/<cc>/<ll>/
   book-and-manage/group-travel is our /<cc>/<ll>/group-travel). Applied to a document: only its
   flight-search block with a flights tab, in the document's cell format, once.
   Run: node --max-old-space-size=512 --test test/lh-flight-search-picker.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { pickerRows, groupTravelPath } from '../tools/importer/parsers/flight-search-picker.js';
import { applyPicker } from '../tools/importer/lh-picker-apply.mjs';

// a text of www's label bundles as recorded for the locale of <file> (its flightmanager or common bundle)
const label = (file, key) => {
  const locale = file.slice(0, 5);
  const dir = new URL('../data/recorded/', import.meta.url);
  let hit = null;
  fs.readdirSync(dir).filter((f) => f.startsWith(locale)).forEach((f) => {
    const walk = (o, p = '') => {
      if (o && typeof o === 'object') Object.entries(o).forEach(([k, v]) => walk(v, p ? `${p}.${k}` : k));
      else if (hit === null && p.endsWith(key)) hit = o;
    };
    walk(JSON.parse(fs.readFileSync(new URL(f, dir), 'utf8')));
  });
  return hit;
};

test('the rows: the picker, www\'s panel texts in the page\'s language, the group booking link to our page', () => {
  const en = pickerRows({ lang: 'en', groupBookingsUrl: '/content/lh/markets/de/en/book-and-manage/group-travel' });
  assert.deepEqual(en.map(([k]) => k), ['Passenger picker', 'Adults hint', 'Children label', 'Children hint', 'Infants label', 'Infants hint', 'Group booking', 'Fare preference']);
  assert.equal(Object.fromEntries(en)['Passenger picker'], 'yes');
  assert.deepEqual(Object.fromEntries(en)['Group booking'], { href: '/de/en/group-travel', text: label('de-en-54a90ef3.json', 'travelDetails.groupBookingLinkText') });
  assert.equal(Object.fromEntries(en)['Infants label'], label('gb-en-54a90ef3.json', 'common.booking.infants.label'));
  assert.equal(Object.fromEntries(en)['Children hint'], label('gb-en-54a90ef3.json', 'common.booking.children.hint'));
  const de = Object.fromEntries(pickerRows({ lang: 'de', groupBookingsUrl: '/content/lh/markets/at/de/book-and-manage/group-travel' }));
  assert.deepEqual(de['Group booking'], { href: '/at/de/group-travel', text: label('at-de-79a70a9b.json', 'travelDetails.groupBookingLinkText') });
  assert.equal(de['Infants label'], 'Kleinkinder ohne Sitzplatz');
  assert.equal(de['Children hint'], '(2-11 Jahre)');
  assert.equal(de['Traveller summary'], '{CABIN}, {COUNT} Reisende(r)', 'www\'s line, "Economy, 1 Reisende(r)"');
  // no group booking address: no link row
  assert.ok(!pickerRows({ lang: 'en' }).some(([k]) => k === 'Group booking'));
  assert.equal(groupTravelPath('/content/lh/markets/gb/en/book-and-manage/group-travel'), '/gb/en/group-travel');
  assert.equal(groupTravelPath('https://www.lufthansa.com/de/de/book-and-manage/group-travel'), '/de/de/group-travel');
  assert.equal(groupTravelPath('/content/lh/markets/de/en/other'), '/de/en/other');
  assert.equal(groupTravelPath(''), '');
});

const P = (key, value) => `<div><div><p>${key}</p></div><div><p>${value}</p></div></div>`;
const N = (key, value) => `<div><div>${key}</div><div>${value}</div></div>`;

test('applied: the rows after the traveller line, in the document\'s format, the rest of the document untouched; twice is once', () => {
  const doc = `<div><h1>Book</h1></div><div><div class="flight-search">${P('Tabs', 'Flights')}${P('Trip types', 'Round trip')}${P('Traveller label', 'Economy, 1 Traveller')}${P('Nonstop label', 'Nonstop only')}</div></div><div><div class="fare-teaser">${P('Origin', 'Frankfurt (FRA)')}</div></div>`;
  const out = applyPicker(doc, '/de/en/homepage');
  assert.equal(out.replace(/<div><div><p>(Passenger picker|Adults hint|Children label|Children hint|Infants label|Infants hint|Group booking|Fare preference)<\/p><\/div><div>.*?<\/div><\/div>/g, ''), doc, 'only the new rows');
  assert.ok(out.includes(`${P('Traveller label', 'Economy, 1 Traveller')}${P('Passenger picker', 'yes')}`));
  assert.ok(out.includes('<div><div><p>Group booking</p></div><div><p><a href="/de/en/group-travel">Group bookings for 10 or more passengers.</a></p></div></div>'));
  assert.equal(applyPicker(out, '/de/en/homepage'), out, 'idempotent');
  assert.ok(out.includes('<div><div><p>Adults hint</p></div><div></div></div>'), 'an empty hint cell');
  // the plain format
  const plain = `<div><div class="flight-search standalone">${N('Tabs', 'Flüge')}${N('Traveller label', 'Economy, 1 Reisende(r)')}</div></div>`;
  const outPlain = applyPicker(plain, '/at/de/flugsuche');
  assert.ok(outPlain.includes(`${N('Traveller label', 'Economy, 1 Reisende(r)')}${N('Passenger picker', 'yes')}`));
  assert.ok(outPlain.includes(N('Group booking', '<a href="/at/de/group-travel">Gruppenbuchungen für zehn oder mehr Passagiere.</a>')));
  assert.ok(outPlain.includes(N('Traveller summary', '{CABIN}, {COUNT} Reisende(r)')));
});

test('not applied: a hotel-only search, a document without the block; an existing row is not doubled', () => {
  const hotel = `<div><div class="flight-search standalone">${P('Tabs', 'Hotel')}${P('Location label', 'Destination')}</div></div>`;
  assert.equal(applyPicker(hotel, '/de/en/hotel-offers'), hotel);
  const none = '<div><h1>x</h1></div>';
  assert.equal(applyPicker(none, '/de/en/x'), none);
  const has = `<div><div class="flight-search">${P('Tabs', 'Flights')}${P('Passenger picker', 'yes')}</div></div>`;
  assert.equal((applyPicker(has, '/de/en/homepage').match(/Passenger picker/g) || []).length, 1);
});

test('brief 239: no adults hint and the fare selection on the four roots; young adults on gb/en and (for gb/de) de/de', () => {
  const rows = (cc, ll) => pickerRows({ lang: ll, groupBookingsUrl: `/content/lh/markets/${cc}/${ll}/book-and-manage/group-travel` });
  const keys = (cc, ll) => rows(cc, ll).map(([k]) => k);
  ['de/en', 'de/de', 'at/de', 'gb/en'].forEach((root) => {
    const r = Object.fromEntries(rows(...root.split('/')));
    assert.equal(r['Adults hint'], '', `${root}: www shows no adults hint`);
    assert.equal(r['Fare preference'], 'yes', `${root}: www's Alternative fare selection`);
  });
  assert.deepEqual(keys('gb', 'en').slice(0, 4), ['Passenger picker', 'Adults hint', 'Young adults', 'Children label']);
  assert.equal(Object.fromEntries(rows('gb', 'en'))['Young adults'], 'GB');
  assert.equal(Object.fromEntries(rows('de', 'de'))['Young adults'], 'GB', 'the de/de documents serve gb/de, where www shows them');
  assert.ok(!keys('de', 'en').includes('Young adults'));
  assert.ok(!keys('at', 'de').includes('Young adults'));
  assert.equal(keys('gb', 'en').at(-1), 'Fare preference');
});

test('brief 239 applied to a document with the picker rows of 238: each new row at its place, the rest untouched, once', () => {
  const r238 = ['Passenger picker', 'yes', 'Children label', 'Children', 'Children hint', '(2-11 years)', 'Infants label', 'Infants without seat', 'Infants hint', '(0-23 months)'];
  const pairs = [];
  for (let i = 0; i < r238.length; i += 2) pairs.push(P(r238[i], r238[i + 1]));
  const group = P('Group booking', '<a href="/gb/en/group-travel">Group bookings for 10 or more passengers.</a>');
  const doc = `<div><div class="flight-search">${P('Tabs', 'Flights')}${P('Traveller label', 'Economy, 1 Traveller')}${pairs.join('')}${group}${P('Nonstop label', 'Nonstop only')}</div></div>`;
  const out = applyPicker(doc, '/gb/en/homepage');
  assert.ok(out.includes(`${P('Passenger picker', 'yes')}<div><div><p>Adults hint</p></div><div></div></div>${P('Young adults', 'GB')}${P('Children label', 'Children')}`));
  assert.ok(out.includes(`${group}${P('Fare preference', 'yes')}${P('Nonstop label', 'Nonstop only')}`));
  assert.equal(out.replace('<div><div><p>Adults hint</p></div><div></div></div>', '').replace(P('Young adults', 'GB'), '').replace(P('Fare preference', 'yes'), ''), doc);
  assert.equal(applyPicker(out, '/gb/en/homepage'), out, 'idempotent');
  // the plain format, de/de
  const plain = `<div><div class="flight-search">${N('Traveller label', 'Economy, 1 Reisende(r)')}${N('Passenger picker', 'yes')}${N('Children label', 'Kinder')}</div></div>`;
  const outPlain = applyPicker(plain, '/de/de/homepage');
  assert.ok(outPlain.includes(`${N('Passenger picker', 'yes')}<div><div>Adults hint</div><div></div></div>${N('Young adults', 'GB')}${N('Children label', 'Kinder')}`));
  // an authored adults hint stays as it is
  const hinted = plain.replace(N('Children label', 'Kinder'), `${N('Adults hint', 'Ab 12')}${N('Children label', 'Kinder')}`);
  assert.equal((applyPicker(hinted, '/de/de/homepage').match(/Adults hint/g) || []).length, 1);
  assert.ok(applyPicker(hinted, '/de/de/homepage').includes(N('Adults hint', 'Ab 12')));
});
