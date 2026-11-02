/* eslint-disable max-len */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  validate, renderMarkdown, renderPage, renderCanvas, check, itemCount, titledItemLinks, verifyPlain,
} from './render.mjs';

const dir = path.dirname(fileURLToPath(import.meta.url));
const legend = Object.fromEntries(['done', 'wip', 'elsewhere', 'stays', 'lh', 'see', 'none']
  .map((s) => [s, { label: `label ${s}`, note: `Legend note for ${s}.` }]));

const fixture = () => ({
  updated: '2026-11-01',
  change: 'Flight status moved.',
  legend: structuredClone(legend),
  footnotes: { tid: 'Travel ID accepts only the airline\'s own website.', pick: 'The picker is in the shared code.' },
  brands: [
    {
      id: 'lufthansa', name: 'Lufthansa', host: 'https://lufthansa.turnsthe.page', www: 'https://www.lufthansa.com', note: 'The lufthansa.com replica.',
    },
    {
      id: 'airdolomiti', name: 'Air Dolomiti', host: 'https://airdolomiti.turnsthe.page', www: 'https://www.airdolomiti.it', note: 'The Air Dolomiti replica.',
    },
  ],
  functions: [
    {
      id: 'flight-search',
      name: 'Flight search',
      about: 'The search form that hands off to the shop.',
      cells: {
        lufthansa: {
          status: 'done', note: 'Hands "searches" to the shop.', page: '/de/en/homepage', evidence: 'scan',
        },
        airdolomiti: {
          status: 'wip', note: 'Built, not on the pages yet.', footnote: 'pick', evidence: 'fa98700',
        },
      },
    },
    {
      id: 'personalised',
      name: 'Personalised content',
      short: 'Personal',
      about: 'Parts of pages for signed-in travellers.',
      cells: {
        lufthansa: {
          status: 'lh', note: 'Needs Travel ID.', footnote: 'tid', evidence: 'M3',
        },
        airdolomiti: {
          status: 'see', see: 'flight-search', note: 'Part of the flight search.', evidence: 'fill',
        },
      },
    },
    {
      id: 'ebooking',
      name: 'eBooking quick start',
      short: 'eBooking',
      about: 'Cargo booking.',
      cells: {
        lufthansa: { status: 'none', note: 'No freight booking.', evidence: 'fill' },
        airdolomiti: {
          status: 'stays', note: 'Stays on the old system.', footnote: 'tid', evidence: 'decision',
        },
      },
    },
  ],
});

test('validate: a complete document has no errors', () => {
  assert.deepEqual(validate(fixture()), []);
});

test('validate: an unknown status', () => {
  const doc = fixture();
  doc.functions[0].cells.lufthansa.status = 'works';
  assert.match(validate(doc).join('\n'), /flight-search.*lufthansa.*unknown status "works"/);
});

test('validate: a missing note in a cell, also in a "none" cell, and on functions, brands and legend entries', () => {
  const doc = fixture();
  delete doc.functions[2].cells.lufthansa.note;
  doc.functions[0].cells.airdolomiti.note = ' ';
  delete doc.functions[1].about;
  delete doc.brands[1].note;
  delete doc.legend.see.note;
  const errors = validate(doc).join('\n');
  assert.match(errors, /ebooking.*lufthansa.*no note/);
  assert.match(errors, /flight-search.*airdolomiti.*no note/);
  assert.match(errors, /personalised.*no about/);
  assert.match(errors, /brand airdolomiti.*no note/);
  assert.match(errors, /legend see.*no note/);
});

test('validate: a needs-LH or stays cell without a footnote, and a footnote key that does not exist', () => {
  const doc = fixture();
  delete doc.functions[1].cells.lufthansa.footnote;
  delete doc.functions[2].cells.airdolomiti.footnote;
  doc.functions[0].cells.airdolomiti.footnote = 'nope';
  const errors = validate(doc).join('\n');
  assert.match(errors, /personalised.*lufthansa.*needs a footnote/);
  assert.match(errors, /ebooking.*airdolomiti.*needs a footnote/);
  assert.match(errors, /flight-search.*airdolomiti.*footnote "nope" does not exist/);
});

test('validate: a see target that does not exist, and a see cell without a target', () => {
  const doc = fixture();
  doc.functions[1].cells.airdolomiti.see = 'hotel-search';
  doc.functions[2].cells.lufthansa = { status: 'see', note: 'Elsewhere.', evidence: 'x' };
  const errors = validate(doc).join('\n');
  assert.match(errors, /personalised.*airdolomiti.*see target "hotel-search" does not exist/);
  assert.match(errors, /ebooking.*lufthansa.*see cell without a target/);
});

test('validate: a missing brand column', () => {
  const doc = fixture();
  delete doc.functions[1].cells.airdolomiti;
  assert.match(validate(doc).join('\n'), /personalised.*no cell for brand airdolomiti/);
});

test('validate: a note with :word: text, which Edge Delivery would turn into an icon', () => {
  const doc = fixture();
  doc.functions[0].cells.lufthansa.note = 'See :takeoff: here.';
  assert.match(validate(doc).join('\n'), /flight-search.*lufthansa.*icon syntax/);
});

test('validate: an updated value that is neither a date nor a date with a time', () => {
  const doc = fixture();
  doc.updated = '1 Nov';
  assert.match(validate(doc).join('\n'), /updated "1 Nov" is not YYYY-MM-DD or YYYY-MM-DD HH:MM/);
  doc.updated = '2026-11-02 00:15';
  assert.deepEqual(validate(doc), []);
});

test('updated with a time: markdown, page and canvas show the time after the date', () => {
  const doc = { ...fixture(), updated: '2026-11-02 00:15' };
  assert.match(renderMarkdown(doc), /Updated 2 November 2026, 00:15 CET: Flight status moved\./);
  assert.match(renderPage(doc), /Updated 2 November 2026, 00:15 CET: Flight status moved\./);
  assert.match(renderCanvas(doc), /Updated 2 November 2026, 00:15 CET: Flight status moved\./);
});

test('check: a stale functions.md fails, a current one passes', () => {
  const doc = fixture();
  assert.deepEqual(check(doc, renderMarkdown(doc)), []);
  assert.match(check(doc, 'old table').join('\n'), /functions\.md is out of date/);
});

test('page: every cell, function name, brand heading and legend symbol is a link whose title is its note', () => {
  const doc = fixture();
  const html = renderPage(doc);
  const titles = titledItemLinks(html).map((l) => l.title);
  assert.equal(titles.length, itemCount(doc));
  assert.equal(itemCount(doc), 3 * 2 + 3 + 2 + 7);
  ['Hands &quot;searches&quot; to the shop.', 'Needs Travel ID.', 'No freight booking.', 'The search form that hands off to the shop.',
    'The Air Dolomiti replica.', 'Legend note for none.'].forEach((t) => assert.ok(titles.includes(t), t));
});

test('page: cells link to their brand\'s list, which writes every note out', () => {
  const doc = fixture();
  const html = renderPage(doc);
  assert.match(html, /<a href="#air-dolomiti" title="Stays on the old system.">💬<\/a>/);
  assert.match(html, /<a href="#air-dolomiti" title="Part of the flight search.">→ Flight search<\/a>/);
  assert.match(html, /<a href="#lufthansa" title="No freight booking.">–<\/a>/);
  assert.match(html, /<h3>Air Dolomiti<\/h3>/);
  const list = html.slice(html.indexOf('<h3>Air Dolomiti</h3>'));
  ['Built, not on the pages yet.', 'Part of the flight search.', 'Stays on the old system.'].forEach((n) => assert.ok(list.includes(n), n));
});

test('page: a cell\'s website page gets a link and the PageSpeed before and after icons', () => {
  const html = renderPage(fixture());
  assert.match(html, /<a href="https:\/\/lufthansa\.turnsthe\.page\/de\/en\/homepage">Try it<\/a>\u00a0<a href="https:\/\/pagespeed\.web\.dev\/report\?url=https%3A%2F%2Fwww\.lufthansa\.com%2Fde%2Fen%2Fhomepage" title="PageSpeed Insights, before: www\.lufthansa\.com">:landing:<\/a>\u00a0<a href="https:\/\/pagespeed\.web\.dev\/report\?url=https%3A%2F%2Flufthansa\.turnsthe\.page%2Fde%2Fen%2Fhomepage" title="PageSpeed Insights, after: lufthansa\.turnsthe\.page">:takeoff:<\/a>/);
});

test('page: one striped table with a header row, and the metadata of the other meta pages', () => {
  const html = renderPage(fixture());
  assert.equal(html.match(/class="table-striped header matrix"/g).length, 1);
  assert.match(html, /<div class="metadata">.*<div><div>nav<\/div><div>\/de\/en\/nav<\/div><\/div><div><div>footer<\/div><div>\/de\/en\/footer<\/div><\/div><div><div>language<\/div><div>en<\/div><\/div>/);
  assert.match(html, /Updated 1 November 2026: Flight status moved\./);
});

test('canvas: title, date line, legend, replica links, table with footnote marks, totals and numbered notes', () => {
  const html = renderCanvas(fixture());
  assert.ok(html.startsWith('<h1>Lufthansa POC: functions by brand</h1>'));
  assert.match(html, /Updated 1 November 2026: Flight status moved\..*edits here get overwritten/);
  assert.match(html, /<a href="https:\/\/airdolomiti\.turnsthe\.page\/">Air Dolomiti<\/a>/);
  assert.match(html, /<tr><td>Flight search<\/td><td>✅<\/td><td>🪏¹<\/td><\/tr>/);
  assert.match(html, /<tr><td>Personalised content<\/td><td>⏳²<\/td><td>→ Flight search<\/td><\/tr>/);
  assert.match(html, /<tr><td>eBooking quick start<\/td><td>–<\/td><td>💬²<\/td><\/tr>/);
  assert.match(html, /Lufthansa 1\/0\/0\/0\/1 · Air Dolomiti 0\/1\/0\/1\/0/);
  assert.match(html, /<ol><li>The picker is in the shared code\.<\/li><li>Travel ID accepts only the airline's own website\.<\/li><\/ol>/);
});

test('canvas: a table stays within Slack\'s 300 cells; a longer one splits into even tables, each with the header row', () => {
  assert.equal(renderCanvas(fixture()).match(/<table>/g).length, 1);
  const doc = fixture();
  doc.functions = Array.from({ length: 150 }, (_, i) => ({ ...structuredClone(doc.functions[0]), id: `f${i}`, name: `Function ${i}` }));
  const tables = renderCanvas(doc).match(/<table>.*?<\/table>/g);
  assert.equal(tables.length, 2);
  assert.deepEqual(tables.map((t) => t.match(/<tr>/g).length), [76, 76]);
  assert.ok(tables.every((t) => t.startsWith('<table><tr><th>Function</th><th>Lufthansa</th><th>Air Dolomiti</th></tr>')));
  assert.match(tables[0], /<tr><td>Function 74<\/td>.*<\/table>$/);
  assert.match(tables[1], /^<table><tr><th>Function<\/th>.*?<\/tr><tr><td>Function 75<\/td>/);
});

test('markdown: legend, table with brand columns and every note', () => {
  const md = renderMarkdown(fixture());
  assert.match(md, /\| Function \| Lufthansa \| Air Dolomiti \|/);
  assert.match(md, /\| Flight search \| ✅ \| 🪏¹ \|/);
  assert.match(md, /Built, not on the pages yet\./);
});

test('verify: the served page has every titled item link, the brand and section anchors and the current update line', () => {
  const doc = fixture();
  const served = renderPage(doc)
    .replace('<h3>Air Dolomiti</h3>', '<h3 id="air-dolomiti">Air Dolomiti</h3>')
    .replace('<h3>Lufthansa</h3>', '<h3 id="lufthansa">Lufthansa</h3>')
    .replace('<h2>Legend</h2>', '<h2 id="legend">Legend</h2>')
    .replace('<h2>Functions</h2>', '<h2 id="functions">Functions</h2>');
  assert.deepEqual(verifyPlain(doc, served), []);
  const errors = verifyPlain(doc, served.replace(' title="No freight booking."', '').replace('id="air-dolomiti"', '')).join('\n');
  assert.match(errors, /17 titled item links, expected 18/);
  assert.match(errors, /no heading id "air-dolomiti"/);
  assert.match(verifyPlain({ ...doc, updated: '2026-11-02' }, served).join('\n'), /no "Updated 2 November 2026"/);
  assert.match(verifyPlain({ ...doc, change: 'Cargo moved too.' }, served).join('\n'), /no "Updated 1 November 2026: Cargo moved too\." line/);
  const quoted = { ...doc, change: 'Cargo\'s newsletter needs Cargo & Dynamics.' };
  assert.deepEqual(verifyPlain(quoted, served.replace('Flight status moved.', 'Cargo&#39;s newsletter needs Cargo &amp; Dynamics.')), []);
  assert.deepEqual(verifyPlain(quoted, served.replace('Flight status moved.', 'Cargo\'s newsletter needs Cargo &amp; Dynamics.')), []);
});

test('the committed functions.json is valid and functions.md is current', () => {
  const doc = JSON.parse(fs.readFileSync(path.join(dir, 'functions.json'), 'utf8'));
  const md = fs.readFileSync(path.join(dir, 'functions.md'), 'utf8');
  assert.deepEqual(check(doc, md), []);
  assert.deepEqual(doc.brands.map((b) => b.name), ['Lufthansa', 'Discover', 'ITA', 'Austrian', 'Cargo', 'Air Dolomiti', 'Brussels', 'Group for Business']);
});
