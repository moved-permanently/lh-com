/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* Standing order 3 item 2: Edge Delivery unwraps a block cell's lone <p>, so a style marker written as the cell's only
   paragraph (/az/en/online-check-in's Columns Media teaser text "… baggage updates. {copytext-medium}", live until the
   helper dropped it) is never read by scripts/style-markers.js and shows as text. lufthansa-cleanup's last
   afterTransform step drops paragraph-style markers from such cells (one text paragraph or bare text, no picture);
   a video's settings after its link and cells with more than one element keep theirs; other brands as before.
   Input: the snapshot's view (test/fixtures/lone-cell-marker-596, lh-snapshots-097).
   Run: node --max-old-space-size=256 --test test/lone-cell-marker-596.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

globalThis.WebImporter = {
  Blocks: {
    getMetadata: () => ({}),
    getMetadataBlock: (document) => document.createElement('table'),
    createBlock: (document, { name, variants = [], cells }) => {
      const table = document.createElement('table');
      const head = document.createElement('tr');
      const th = document.createElement('th');
      th.textContent = `${name}${variants.length ? ` (${variants.join(', ')})` : ''}`;
      head.append(th);
      table.append(head);
      (Array.isArray(cells) ? cells : Object.entries(cells)).forEach((row) => {
        const tr = document.createElement('tr');
        row.forEach((c) => {
          const td = document.createElement('td');
          (Array.isArray(c) ? c : [c]).forEach((n) => { if (n) td.append(typeof n === 'string' ? document.createTextNode(n) : n); });
          tr.append(td);
        });
        table.append(tr);
      });
      return table;
    },
  },
};
const { default: transform } = await import('../tools/importer/transformers/lufthansa-cleanup.js');
const { default: parse } = await import('../tools/importer/parsers/columns-media.js');

const view = fs.readFileSync(new URL('./fixtures/lone-cell-marker-596/az-en-online-check-in-view.html', import.meta.url), 'utf8').replace(/^<!--.*-->\n/, '');
const page = (body) => `<html><head><title>Online check-in | Lufthansa</title></head><body><main><div class="container-content"><div class="section"><div class="section-content container-fluid section-regular">${body}</div></div></div></main></body></html>`;
const URL_AZ = 'https://www.lufthansa.com/az/en/online-check-in';
const after = (html, url = URL_AZ) => {
  const { document } = parseHTML(page(html));
  transform('afterTransform', document.body, { document, url, params: { originalURL: url } });
  return document;
};

test('/az/en/online-check-in: the app teaser\'s text cell keeps its text, without the marker', () => {
  const { document } = parseHTML(page(view));
  const payload = { document, url: URL_AZ, params: { originalURL: URL_AZ }, template: { name: 'app-entry' } };
  transform('beforeTransform', document.body, payload);
  parse(document.querySelector('.twocolumn'), payload);
  transform('afterTransform', document.body, payload);
  const cell = [...document.querySelectorAll('table td')].find((td) => td.textContent.includes('Check-in conveniently'));
  assert.ok(cell, 'the teaser text is in a cell');
  assert.match(cell.textContent.trim(), /baggage updates\.$/);
  assert.ok(!document.body.textContent.includes('{copytext-medium}'));
});

test('a cell of one marked paragraph, or bare marked text: the marker goes', () => {
  const doc = after('<table><tr><th>Cards Teaser</th></tr><tr><td><p>Small print here {copytext-small}</p></td><td>Bare text {copytext-medium limited-width}</td></tr></table>');
  const tds = [...doc.querySelectorAll('td')];
  assert.equal(tds[0].textContent.trim(), 'Small print here');
  assert.equal(tds[1].textContent.trim(), 'Bare text');
});

test('kept: a video\'s settings, a cell with more elements, the Form block, other brands', () => {
  const video = '<table><tr><th>Columns Media</th></tr><tr><td><p><a href="/content/dam/x.mp4">/content/dam/x.mp4</a> {autoplay muted loop}</p></td></tr></table>';
  assert.ok(after(video).body.textContent.includes('{autoplay muted loop}'));
  const two = '<table><tr><th>Cards Teaser</th></tr><tr><td><h3>Title</h3><p>Text {copytext-small}</p></td></tr></table>';
  assert.ok(after(two).body.textContent.includes('{copytext-small}'));
  const form = '<table><tr><th>Form</th></tr><tr><td>Travel dates in 28 days at the earliest. {copytext-small}</td><td>note</td></tr></table>';
  assert.ok(after(form).body.textContent.includes('{copytext-small}'), 'the Form block reads its notes\' markers');
  const austrian = '<table><tr><th>Cards Teaser</th></tr><tr><td><p>Text {copytext-small}</p></td></tr></table>';
  assert.ok(after(austrian, 'https://www.austrian.com/at/en/x').body.textContent.includes('{copytext-small}'));
});
