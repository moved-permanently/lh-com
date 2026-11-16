/* eslint-disable max-len, import/extensions -- CSS and list lines; the tool is an .mjs module */
/* Standing order 43, item 2: a Cargo Columns Media text cell that ends with a list keeps no space under its last item
   (www's icon lists), which brings the German eservices-app's row within 2 %; and Austrian ca/en's full homepage row
   (the AI band, www's two empty sections as spacers, order 591's disclaimer patch).
   Run: node --max-old-space-size=256 --test test/cargo-list-end-so43.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { applyTextInserts, listPaths } from '../tools/importer/text-inserts-apply.mjs';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const flat = read('styles/themes/cargo.css').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const R = 'tools/reports/parity-2026-11-09';

test('a Cargo Columns Media text cell ending with a list: its last item without margin', () => {
  assert.ok(flat.includes('body.brand-cargo main .columns-media .columns-media-text > :is(ul, ol):last-child > li:last-child { margin-bottom: 0; }'));
  ['austrian', 'airdolomiti', 'swiss', 'tap', 'ita', 'brussels', 'b2b', 'discover'].forEach((b) => assert.ok(!read(`styles/themes/${b}.css`).includes(':is(ul, ol):last-child > li:last-child'), b));
});

test('the list-end gate: every recorded page-width PASS, every other one without breakage', () => {
  const rows = read(`${R}/gate-so43-cargo-list-end.txt`).split('\n').filter((l) => /^(PASS|FAIL|OK|BROKEN)\t/.test(l));
  assert.equal(rows.length, 38);
  assert.equal(rows.filter((l) => l.startsWith('PASS\t')).length, 10);
  assert.ok(rows.every((l) => /^(PASS|OK)\t/.test(l)));
  assert.ok(rows.every((l) => l.split('\t')[8] === 'none'));
});

test('de eservices-app: READY at both widths, within 2 %', () => {
  const txt = read(`${R}/delta-so43-cargo-de-eservices-app.txt`);
  assert.deepEqual([...new Set(listPaths(txt))], ['/de/eservices-app']);
  assert.match(txt, /^READY\t\/de\/eservices-app\t390\t.*\t3195 \(\+1\.69 %\)\t/m);
  assert.match(txt, /^READY\t\/de\/eservices-app\t1440\t.*\t3315 \(\+0\.79 %\)\t/m);
  const [de] = JSON.parse(read(`${R}/delta-so41-cargo-eservices-app-text.json`)).filter((r) => r.path === '/de/eservices-app');
  assert.equal(de.inserts.length, 4);
});

test('ca/en: four inserts, removable, idempotent on a copy shaped as DA\'s', () => {
  const [row] = JSON.parse(read(`${R}/delta-so43-austrian-ca-en-home.json`));
  assert.equal(row.path, '/ca/en/homepage');
  assert.equal(row.inserts.length, 4);
  assert.match(row.inserts[0].text, /^<div class="ask-ai-flights">/);
  assert.equal(row.inserts[1].text, '<p>{spacer-48 from-768}</p><p>{spacer-95 below-768}</p>');
  assert.equal(row.inserts[2].text, '<p>{spacer-81}</p>');
  assert.match(row.inserts[2].replace, /^<p>\*The prices incl\. all taxes[^<]*<\/p><p>General Conditions<\/p><p>The prices displayed/);
  assert.match(row.inserts[3].text, /<a href="\/ca\/en\/fragments\/modals\/general-conditions">General Conditions<\/a>/);
  const doc = `<main><div>${row.inserts[0].after}</div>${row.inserts[1].before}<div>${row.inserts[2].replace}</div>\n<div><h2 id="looking-for-more-than-just-a-flight">L</h2>${row.inserts[3].after}</div></main>`;
  const once = applyTextInserts(doc, row.inserts);
  assert.deepEqual(once.results, ['inserted', 'inserted', 'inserted', 'inserted']);
  assert.ok(!once.html.includes('The prices displayed'));
  assert.deepEqual(applyTextInserts(once.html, row.inserts).results, ['present', 'present', 'present', 'present']);
  const txt = read(`${R}/delta-so43-austrian-ca-en-home.txt`);
  assert.deepEqual([...new Set(listPaths(txt))], ['/ca/en/homepage']);
  assert.match(txt, /Do NOT apply order 42's ca\/en row/);
  assert.match(read(`${R}/delta-so42-austrian-ask-ai-flights.txt`), /^HOLD\t\/ca\/en\/homepage\t390\t/m);
});

test('no list of this order has a row for /de/en/overview-manage', () => {
  fs.readdirSync(new URL(`../${R}`, import.meta.url)).filter((f) => f.includes('so43')).forEach((f) => assert.ok(!read(`${R}/${f}`).includes('/de/en/overview-manage'), f));
});
