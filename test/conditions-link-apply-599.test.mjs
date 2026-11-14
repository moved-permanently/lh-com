/* eslint-disable max-len, import/extensions -- dev tooling */
/* The fares' conditions as a link to their dialog, in DA's copy (standing order 15 of 2026-11-14, item 1): Brussels' fr/fr
   and ke/en homepages print "Conditions générales" / "General Conditions" and the whole conditions text (about 500 px at
   390) under the destination finder's page; www shows only the title, which opens the conditions in a dialog, and so
   does our be/en homepage: its title is a link to /be/en/modals/general-conditions, which scripts/fragment-dialog.js
   opens as a dialog. fr/fr's and ke/en's /modals/general-conditions documents exist with the same text.
   tools/importer/conditions-link-apply.mjs replaces the title paragraph and the one text paragraph right after it with
   the title as a link to the modal; refused, the document as it was, when the title is not found once, is a link already,
   or is not followed by one text paragraph and the section's end. Run: node --test test/conditions-link-apply-599.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { applyConditionsLink } from '../tools/importer/conditions-link-apply.mjs';

const TEXT = '<p>Les prix affichés peuvent varier et doivent servir de guide.</p>';
const DA = `<body><header></header><main><div><div class="cards-icon"><div><div>:hotel:</div><div><a href="https://h">Hôtels</a></div></div></div><p>*Les prix peuvent varier.</p><p>Conditions générales</p>${TEXT}</div><div></div></main><footer></footer></body>`;
const ROW = { title: 'Conditions générales', href: '/fr/fr/modals/general-conditions' };

test('the title as a link to the modal, the text paragraph gone; every other byte as DA\'s', () => {
  const r = applyConditionsLink(DA, ROW);
  assert.deepEqual(r.problems, []);
  assert.equal(r.html, DA.replace(`<p>Conditions générales</p>${TEXT}`, '<p><a href="/fr/fr/modals/general-conditions">Conditions générales</a></p>'));
});

test('the same where the section goes on with the page\'s metadata block (DA\'s fr/fr and ke/en)', () => {
  const meta = '<div class="metadata"><div><div>nav</div><div>/fr/fr/nav</div></div></div>';
  const withMeta = DA.replace(`${TEXT}</div>`, `${TEXT}${meta}</div>`);
  const r = applyConditionsLink(withMeta, ROW);
  assert.deepEqual(r.problems, []);
  assert.equal(r.html, withMeta.replace(`<p>Conditions générales</p>${TEXT}`, '<p><a href="/fr/fr/modals/general-conditions">Conditions générales</a></p>'));
});

test('refused, the document as it was: no such title, a link already, more than one paragraph after it', () => {
  assert.ok(applyConditionsLink(DA, { ...ROW, title: 'General Conditions' }).problems.length, 'not found');
  const once = applyConditionsLink(DA, ROW).html;
  const again = applyConditionsLink(once, ROW);
  assert.ok(again.problems.length, 'a second run');
  assert.equal(again.html, once);
  const more = DA.replace(TEXT, `${TEXT}<p>More text.</p>`);
  assert.ok(applyConditionsLink(more, ROW).problems.length, 'two paragraphs after the title');
});

test('the data and the list agree: READY rows, status first, the header naming the tool and the change', () => {
  const data = JSON.parse(fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/delta-so15-brussels-conditions-link.json', import.meta.url), 'utf8'));
  const lines = fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/delta-so15-brussels-conditions-link.txt', import.meta.url), 'utf8').split('\n');
  assert.match(lines[0], /node tools\/importer\/conditions-link-apply\.mjs --data tools\/reports\/parity-2026-11-09\/delta-so15-brussels-conditions-link\.json/);
  assert.match(lines[0], /Expected change only/);
  const rows = lines.filter((l) => l && !l.startsWith('#')).map((l) => l.split('\t'));
  assert.deepEqual(rows.map((r) => r[1]).sort(), Object.keys(data).sort());
  rows.forEach((r) => assert.match(r[0], /^(READY|HOLD)$/));
  assert.deepEqual(data['/fr/fr/homepage'], ROW);
  assert.deepEqual(data['/ke/en/homepage'], { title: 'General Conditions', href: '/ke/en/modals/general-conditions' });
});
