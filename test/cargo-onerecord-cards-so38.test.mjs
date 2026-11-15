/* eslint-disable max-len, import/extensions -- dev tooling */
/* Standing order 38 of 2026-11-15, item 4: Cargo /en/onerecord's advantages as www's (cargo-parity-003 at 1440): the
   paragraph before them over the whole content width (the DA row " {full-width}", delta-so38-cargo-onerecord.txt) and
   the five text-only cards as one grid: a text-only three-up block right after a text-only three-up block without the
   block's 91 px (the wrapper's 20 px stays). Cargo's theme only; picture cards and other options keep their space.
   Run: node --max-old-space-size=256 --test test/cargo-onerecord-cards-so38.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { applyTextInserts, listPaths } from '../tools/importer/text-inserts-apply.mjs';

const css = fs.readFileSync(new URL('../styles/themes/cargo.css', import.meta.url), 'utf8');
const dir = new URL('../tools/reports/parity-2026-11-09/', import.meta.url);
const read = (f) => fs.readFileSync(new URL(f, dir), 'utf8');

test('the rule: the second of two text-only three-up blocks without its 91 px, at every width', () => {
  const sel = 'body.brand-cargo .cards-teaser-wrapper:has(> .cards-teaser.three-up li.cards-teaser-text-only) + .cards-teaser-wrapper > .cards-teaser.three-up:not(.overlay, .mosaic, .boxed, :has(picture)) {';
  const i = css.indexOf(sel);
  assert.ok(i > 0);
  assert.match(css.slice(i, css.indexOf('}', i)), /margin-top: 0;/);
  assert.ok(!css.slice(css.lastIndexOf('}', i), i).includes('@media'), 'not in a media query');
});

test('the row: " {full-width}" at the end of the advantages paragraph, READY, its tool and data in the header', () => {
  const list = read('delta-so38-cargo-onerecord.txt');
  const data = JSON.parse(read('delta-so38-cargo-onerecord.json'));
  assert.deepEqual(data.map((d) => d.path), ['/en/onerecord']);
  const head = list.split('\n').filter((l) => l.startsWith('#')).slice(0, 3).join('\n');
  assert.match(head, /text-inserts-apply\.mjs --data tools\/reports\/parity-2026-11-09\/delta-so38-cargo-onerecord\.json/);
  assert.deepEqual(listPaths(list), ['/en/onerecord']);
  const doc = '<div><p>ONE Record offers several advantages.<br><br>The benefits of ONE Record at a glance:</p><div class="cards-teaser three-up"></div></div>';
  const r = applyTextInserts(doc, data[0].inserts);
  assert.equal(r.html, doc.replace('a glance:</p>', 'a glance: {full-width}</p>'));
});
