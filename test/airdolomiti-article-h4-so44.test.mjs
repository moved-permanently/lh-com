/* eslint-disable max-len -- CSS and list lines */
/* Standing order 44: Air Dolomiti's article H4s from 1025 px as www's post headings (26px / 32px regular, a photo in one
   12px under its text), and this order's lists (items 1 to 3).
   Run: node --max-old-space-size=256 --test test/airdolomiti-article-h4-so44.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const flat = read('styles/themes/airdolomiti.css').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const R = 'tools/reports/parity-2026-11-09';
const H4 = 'body.brand-airdolomiti main:has(.article-header) > .section:not(.carousel-cards-container, .related-articles-container, :has(> .carousel-cards-wrapper > .carousel-cards:not(.article))) > .default-content-wrapper > h4';

test('from 1025 px an article H4 is 26 / 32 px regular, a photo in it 12 px under its text', () => {
  const block = flat.slice(flat.indexOf('@media (width >= 1025px) { body.brand-airdolomiti main .default-content-wrapper h3'));
  const end = block.indexOf('} }');
  const i = block.indexOf(`${H4} { font-size: 26px; font-weight: 400; line-height: 32px; }`);
  const j = block.indexOf(`${H4} > picture { margin-top: 12px; }`);
  assert.ok(i > 0 && i < end, 'the H4 rule in the 1025 px block');
  assert.ok(j > i && j < end, 'the photo rule after it, in the same block');
  assert.equal(flat.split(`${H4} {`).length, 2, 'one H4 rule');
});

test('the H4 gate: 5 recorded PASS, archistars within 2 %, 1,128 page-widths none broken', () => {
  const rows = read(`${R}/gate-so44-airdolomiti-article-h4.txt`).split('\n').filter((l) => /^(PASS|FAIL|OK)\t/.test(l));
  assert.equal(rows.filter((l) => l.startsWith('PASS\t')).length, 5);
  assert.equal(rows.filter((l) => l.startsWith('OK\t')).length, 1128);
  assert.ok(rows.every((l) => /^(PASS|OK)\t/.test(l) && l.split('\t')[7] === 'none'));
  const arch = rows.find((l) => l.startsWith('PASS\t/en/articles/dyk/airports-designed-by-archistars\t1440'));
  assert.match(arch, /\t4420 \(-2\.84 %\)\t4489 \(-1\.32 %\)\t/);
});

test('item 1: general-terms1 traced to 92278044; the footer rule is HOLD with its gate', () => {
  const gt = read(`${R}/trace-so44-cargo-general-terms1.txt`);
  assert.match(gt, /^92278044 \(2026-11-15 23:03\)\t1486\t926\t878$/m);
  assert.match(gt, /^aace6c90 \(2026-11-15 22:35\)\t1470\t910\t862$/m);
  const fc = read(`${R}/gate-so44-austrian-footer-columns.txt`);
  assert.match(fc, /^# Status: HOLD/m);
  const rec = fc.split('\n').filter((l) => /^(PASS|FAIL)\t/.test(l));
  assert.equal(rec.length, 121);
  assert.equal(rec.filter((l) => l.startsWith('FAIL\t')).length, 4);
  assert.ok(rec.some((l) => /^PASS\t\/fr\/fr\/contact\t1440\t.*\t2561 \(\+2\.11 %\)\t2519 \(\+0\.44 %\)\t/.test(l)));
  // HOLD: not in the theme
  assert.ok(!read('styles/themes/austrian.css').includes('.footer .footer-columns:not(:has(> .footer-column:nth-child(4)))'));
});

test('item 2: places 11 to 30, each with its status; item 3: the 5 touched page-widths PASS', () => {
  const s = read(`${R}/sweep-so44-places-11-30.txt`).split('\n').filter((l) => /^\d+\t/.test(l));
  assert.deepEqual(s.map((l) => Number(l.split('\t')[0])), Array.from({ length: 20 }, (_, k) => k + 11));
  assert.ok(s.every((l) => ['left out', 'no fix', 'your call', 'shipped'].includes(l.split('\t')[1])));
  const m = read(`${R}/measure-so44-airdolomiti-title-live.txt`).split('\n');
  assert.equal(m.filter((l) => l.startsWith('PASS\t')).length, 5);
  assert.equal(m.filter((l) => l.startsWith('untouched\t')).length, 5);
  assert.equal(m.filter((l) => /^(equal|differs)\t/.test(l)).length, 39);
});

test('no list of this order has a row for /de/en/overview-manage', () => {
  fs.readdirSync(new URL(`../${R}`, import.meta.url)).filter((f) => f.includes('so44')).forEach((f) => assert.ok(!read(`${R}/${f}`).includes('/de/en/overview-manage'), f));
});
