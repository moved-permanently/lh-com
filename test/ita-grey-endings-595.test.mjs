/* eslint-disable max-len, import/extensions -- dev tooling */
/* ITA pages that end with a grey band, page by page (standing order 11 of 2026-11-13, item 1; www 24 to 45 px from the
   band to the footer, ours 48 under the band: the document's empty last section, after the metadata, keeps the band
   from being main's last section, styles.css's `main > .section.grey:last-child` 24 px). A shared rule made 5 of 6
   pages further from www's height, so a delta on DA's copy where one page's own document brings it closer:
   - /it/en/support/utilities/invoicing (ita-parity-004; +1.07 % at 1440, +2.44 % at 390, taller at both): the empty
     last section dropped (tools/importer/ita-section-drop-apply.mjs, new): the band 24 px from the footer, www's 24.
     Refused when the document does not end with the band (its text starting with `band`), a section of the metadata
     block only, then one empty section.
   - /it/en/book-and-prepare/travel-information/at-the-airport/lounges/fantasia-lounge (ita-parity-005; -1.46 % at 1440,
     +0.63 % at 390): www has 64 px of white above the closing band at 1440, ours 14: a section of style gap with
     "{spacer-65 from-768}" right before the band (tools/importer/ita-insert-apply.mjs's row option `section`).
   Run: node --test test/ita-grey-endings-595.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { dropEmptyLast } from '../tools/importer/ita-section-drop-apply.mjs';
import { applyInserts } from '../tools/importer/ita-insert-apply.mjs';

const meta = (rows) => `<div class="section-metadata">${rows.map(([k, v]) => `<div><div><p>${k}</p></div><div><p>${v}</p></div></div>`).join('')}</div>`;
const BAND = `<div><div class="columns-media"><div><div><picture><img src="x.jpg" alt=""></picture></div><div><h2>Flight Certification {heading-small}</h2><p>You can submit documentation.</p></div></div></div>${meta([['style', 'column-band, grey']])}</div>`;
const METADATA = '<div><div class="metadata"><div><div>Title</div><div>Invoicing | ITA Airways</div></div></div></div>';
const DA = `<body><header></header><main><div><h2>Issuing an Invoice</h2><p>Please note.</p></div>${BAND}${METADATA}<div></div></main><footer></footer></body>`;
const LIST = new URL('../tools/reports/parity-2026-11-09/reimport-595-ita-grey-endings.txt', import.meta.url);

test('the empty last section after the metadata goes; every other byte as DA\'s', () => {
  const r = dropEmptyLast(DA, { band: 'Flight Certification' });
  assert.deepEqual(r.problems, []);
  assert.equal(r.html, DA.replace(`${METADATA}<div></div></main>`, `${METADATA}</main>`));
  const spaced = DA.replace('<div></div></main>', '\n<div>\n</div>\n</main>');
  assert.equal(dropEmptyLast(spaced, { band: 'Flight Certification' }).html, DA.replace(`${METADATA}<div></div></main>`, `${METADATA}\n\n</main>`), 'an empty section with white space only (the white space around it kept)');
});

test('refused, the document as it was: no empty last section, not after the metadata, another band', () => {
  const once = dropEmptyLast(DA, { band: 'Flight Certification' }).html;
  const again = dropEmptyLast(once, { band: 'Flight Certification' });
  assert.ok(again.problems.length, 'a second run');
  assert.equal(again.html, once);
  const noMeta = DA.replace(METADATA, '');
  assert.ok(dropEmptyLast(noMeta, { band: 'Flight Certification' }).problems.length, 'the empty section not after the metadata section');
  const moreInMeta = DA.replace(METADATA, METADATA.replace('</div></div></div></div>', '</div></div></div><p>More</p></div>'));
  assert.ok(dropEmptyLast(moreInMeta, { band: 'Flight Certification' }).problems.length, 'the metadata section holds more');
  assert.ok(dropEmptyLast(DA, { band: 'Issuing an Invoice' }).problems.length, 'the band is another section');
  const notEmpty = DA.replace('<div></div></main>', '<div><p>{spacer-20}</p></div></main>');
  assert.ok(dropEmptyLast(notEmpty, { band: 'Flight Certification' }).problems.length, 'the last section not empty');
});

test('fantasia-lounge: the gap section with "{spacer-65 from-768}" right before the closing band', () => {
  const data = JSON.parse(fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/ita-inserts-595.json', import.meta.url), 'utf8'));
  const rows = data['/it/en/book-and-prepare/travel-information/at-the-airport/lounges/fantasia-lounge'];
  assert.equal(rows.length, 1);
  assert.equal(rows[0].section, true);
  assert.match(rows[0].html, /^<div><p>\{spacer-65 from-768\}<\/p><div class="section-metadata"><div><div><p>style<\/p><\/div><div><p>gap<\/p><\/div><\/div><\/div><\/div>$/);
  const band = '<div><div class="columns-media"><div><div><picture><img src="y.jpg" alt=""></picture></div><div><h2>Traveling Alone: Services for Unaccompanied Minors</h2></div></div></div></div>';
  const doc = `<body><main><div><div class="accordion-columns faq"><div><div><p>Location and Opening Hours</p></div></div></div></div>${band}${METADATA}<div></div></main></body>`;
  const r = applyInserts(doc, rows);
  assert.deepEqual(r.problems, []);
  assert.equal(r.html, doc.replace(band, `${rows[0].html}${band}`));
});

test('the data and the list agree: fantasia-lounge READY; invoicing HOLD since standing order 12 (publishing leaves the metadata section empty at the end, so the drop changes nothing there); the four others HOLD', () => {
  const lines = fs.readFileSync(LIST, 'utf8').split('\n');
  assert.match(lines[0], /ita-section-drop-apply\.mjs --data tools\/reports\/parity-2026-11-09\/ita-section-drops-595\.json/);
  assert.match(lines[0], /ita-insert-apply\.mjs --data tools\/reports\/parity-2026-11-09\/ita-inserts-595\.json/);
  const rows = lines.filter((l) => l && !l.startsWith('#')).map((l) => l.split('\t'));
  assert.equal(rows.length, 6);
  const drops = JSON.parse(fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/ita-section-drops-595.json', import.meta.url), 'utf8'));
  const inserts = JSON.parse(fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/ita-inserts-595.json', import.meta.url), 'utf8'));
  const ready = rows.filter((r) => /^READY\b/.test(r[r.length - 1])).map((r) => r[0]).sort();
  assert.deepEqual(ready, Object.keys(inserts).sort());
  Object.keys(drops).forEach((p) => assert.ok(rows.some((r) => r[0] === p && /^HOLD \(corrected in standing order 12/.test(r[r.length - 1])), p));
  rows.filter((r) => !ready.includes(r[0])).forEach((r) => assert.match(r[r.length - 1], /^HOLD \(.+\)$/, r[0]));
});
