/* eslint-disable max-len -- CSS and list lines */
/* Standing order 43, item 4: Air Dolomiti's article title from 1025 px with www's letter-spacing 3px (BlogLayout_title),
   and this order's measured lists (items 1, 3 and 4).
   Run: node --max-old-space-size=256 --test test/airdolomiti-blog-title-so43.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const flat = read('styles/themes/airdolomiti.css').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const R = 'tools/reports/parity-2026-11-09';

test('from 1025 px the article title is 65 / 72 px with letter-spacing 3px; below it no spacing', () => {
  assert.ok(flat.includes('body.brand-airdolomiti .article-header .article-header-title { font-size: 65px; line-height: 72px; letter-spacing: 3px; }'));
  const block = flat.slice(flat.indexOf('@media (width >= 1025px) { body.brand-airdolomiti main .default-content-wrapper h3'));
  assert.ok(block.indexOf('letter-spacing: 3px') < block.indexOf('} }'), 'inside the 1025 px block');
  assert.ok(flat.includes('body.brand-airdolomiti .article-header .article-header-title { font-size: 38px;'));
  assert.ok(!/article-header-title \{ font-size: 38px;[^}]*letter-spacing/.test(flat));
});

test('the title gate: 5 recorded PASS, 1,128 page-widths, none broken', () => {
  const rows = read(`${R}/gate-so43-airdolomiti-blog-title.txt`).split('\n').filter((l) => /^(PASS|FAIL|OK)\t/.test(l));
  assert.equal(rows.length, 1128);
  assert.equal(rows.filter((l) => l.startsWith('PASS\t')).length, 5);
  assert.ok(rows.every((l) => /^(PASS|OK)\t/.test(l) && l.split('\t')[7] === 'none'));
});

test('the measured lists: 44 Cargo phone loads, 30 Austrian band page-widths, 449 swept', () => {
  const m1 = read(`${R}/measure-so43-cargo-phone-gap.txt`).split('\n').filter((l) => /^(as gated|[+-]\d+ px)\t/.test(l));
  assert.equal(m1.length, 44);
  const m3 = read(`${R}/measure-so43-austrian-ai-live.txt`).split('\n').filter((l) => /^(as gated|not applied|[+-]\d+ px)/.test(l));
  assert.equal(m3.length, 30);
  assert.equal(m3.filter((l) => l.startsWith('as gated\t')).length, 28);
  const sw = read(`${R}/sweep-so43-austrian-cargo-airdolomiti.txt`).split('\n').filter((l) => /^(within 2 %|outside)\t/.test(l));
  assert.equal(sw.length, 449);
  assert.ok(sw.filter((l) => l.startsWith('outside\t')).every((l) => l.split('\t')[9]));
});

test('no list of this order has a row for /de/en/overview-manage', () => {
  fs.readdirSync(new URL(`../${R}`, import.meta.url)).filter((f) => f.includes('so43')).forEach((f) => assert.ok(!read(`${R}/${f}`).includes('/de/en/overview-manage'), f));
});
