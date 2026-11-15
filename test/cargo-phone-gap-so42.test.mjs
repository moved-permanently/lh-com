/* eslint-disable max-len, import/extensions -- CSS and list lines; the tool is an .mjs module */
/* Standing order 42: Cargo's sections 20 px apart below 1025 px, as www's Liferay boxes (a page with Theme wide-gaps
   keeps 48 px: the seven recorded pages the 20 px would take further from www); www's CF8 split for a picture-first
   wide-media block (the English eservices-app's benefits); two Columns Media options for industries-healthcare
   (two-thirds, natural-media). And the lists that go with them.
   Run: node --max-old-space-size=256 --test test/cargo-phone-gap-so42.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { listPaths } from '../tools/importer/text-inserts-apply.mjs';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const css = read('styles/themes/cargo.css').replace(/\/\*[\s\S]*?\*\//g, '');
const flat = css.replace(/\s+/g, ' ');
const R = 'tools/reports/parity-2026-11-09';

test('below 1025 px Cargo\'s section gap is 20 px, except on a page with the class wide-gaps', () => {
  assert.ok(flat.includes('@media (width < 1025px) { body.brand-cargo:not(.wide-gaps) { --section-gap: 20px; } }'));
  assert.ok(!/--section-gap:\s*20px/.test(read('styles/styles.css')));
  ['austrian', 'airdolomiti', 'swiss', 'tap', 'ita', 'brussels', 'b2b', 'discover'].forEach((b) => assert.ok(!read(`styles/themes/${b}.css`).includes('wide-gaps'), b));
});

test('www\'s CF8 split from 768 px; the two healthcare options', () => {
  assert.ok(flat.includes('@media (width >= 768px) { body.brand-cargo .columns-media.wide-media .columns-media-media-first { grid-template-columns: minmax(0, 746fr) minmax(0, 526fr); } }'));
  assert.ok(flat.includes('@media (width >= 1025px) { body.brand-cargo main .columns-media.two-thirds .columns-media-row { max-width: 856px; column-gap: 24px; } }'));
  assert.ok(flat.includes('body.brand-cargo main .columns-media.natural-media .columns-media-media :is(picture, img) { width: auto; max-width: 100%; }'));
});

test('the wide-gaps rows: Theme | wide-gaps on the seven pages, READY', () => {
  assert.deepEqual(JSON.parse(read(`${R}/delta-so42-cargo-wide-gaps.json`)), [{ key: 'Theme', value: 'wide-gaps' }]);
  assert.deepEqual(listPaths(read(`${R}/delta-so42-cargo-wide-gaps.txt`)).sort(), ['/de/industries-in-focus', '/en/ci/sustainable-development-goals', '/en/eaw', '/en/ecsd', '/en/industries-in-focus', '/en/meta/meta/company/general-terms1', '/en/onerecord']);
  const gate = read(`${R}/gate-so42-cargo-section-gap.txt`).split('\n').filter((l) => /^(PASS|FAIL)\t/.test(l));
  assert.equal(gate.length, 44);
  assert.ok(gate.every((l) => l.startsWith('PASS\t')));
});

test('eservices-app: the English row READY, the German HOLD (+2.01 % at 390)', () => {
  assert.deepEqual([...new Set(listPaths(read(`${R}/delta-so42-cargo-eservices-app.txt`)))], ['/en/eservices-app']);
  assert.match(read(`${R}/delta-so42-cargo-eservices-app.txt`), /^HOLD\t\/de\/eservices-app\t390\t.*\+2\.01 %/m);
});

test('industries-healthcare\'s rest: four replaces, READY', () => {
  const [row] = JSON.parse(read(`${R}/delta-so42-cargo-healthcare-rest.json`));
  assert.equal(row.path, '/en/industries-healthcare');
  assert.deepEqual(row.inserts.map((i) => i.text.match(/columns-media [a-z-]+|metadata|Any questions/)[0]), ['columns-media two-thirds', 'columns-media natural-media', 'Any questions', 'metadata']);
  assert.ok(row.inserts.every((i) => i.replace !== undefined && i.replace.length > i.text.length - 20));
  assert.deepEqual([...new Set(listPaths(read(`${R}/delta-so42-cargo-healthcare-rest.txt`)))], ['/en/industries-healthcare']);
});

test('no list of this order has a row for /de/en/overview-manage', () => {
  fs.readdirSync(new URL(`../${R}`, import.meta.url)).filter((f) => f.includes('so42')).forEach((f) => assert.ok(!read(`${R}/${f}`).includes('/de/en/overview-manage'), f));
});
