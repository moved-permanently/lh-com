/* eslint-disable max-len -- CSS and list lines */
/* Standing order 52: an Air Dolomiti blog post's end as www's BlogLayout wrapper (no margin below 930 px, 100px from 930),
   the finder button gate again (HOLD), the four AI rows of austrian-parity-031, and places 151 to 170.
   Run: node --max-old-space-size=256 --test test/airdolomiti-article-end-so52.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const flat = read('styles/themes/airdolomiti.css').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const R = 'tools/reports/parity-2026-11-09';
const SEC = 'body.brand-airdolomiti main:has(.article-header) > .section:last-child:has(> .default-content-wrapper:last-child)';
const LAST = 'body.brand-airdolomiti main:has(.article-header) > .section:last-child > .default-content-wrapper:last-child > :last-child';

test('a post that ends with its text: no margin below 930 px, its last element none, 100px from 930', () => {
  const i = flat.indexOf(`${SEC} { margin-bottom: 0; }`);
  const j = flat.indexOf(`${LAST} { margin-bottom: 0; }`);
  const k = flat.indexOf(`@media (width >= 930px) { ${SEC} { margin-bottom: 100px; } }`);
  assert.ok(i > 0 && j > i && k > j, 'the three rules, in this order');
  assert.equal(flat.split(`${SEC} {`).length, 3, 'the section rule twice: below and from 930 px');
  assert.equal(flat.split(`${LAST} {`).length, 2, 'one last-element rule');
  // the theme's last rules: nothing after them can take the margin back
  assert.ok(flat.trimEnd().endsWith(`@media (width >= 930px) { ${SEC} { margin-bottom: 100px; } }`));
});

test('the gate: 10 recorded article page-widths PASS, 1,790 census page-widths OK', () => {
  const g = read(`${R}/gate-so52-airdolomiti-article-end.txt`).split('\n');
  const rec = g.filter((l) => /^(PASS|FAIL)\t/.test(l));
  assert.equal(rec.length, 10);
  assert.ok(rec.every((l) => l.startsWith('PASS\t') && Number(l.split('\t')[8]) <= 0.5));
  assert.ok(rec.some((l) => /^PASS\t\/en\/articles\/destinations\/where-the-adriatic-becomes-wild\t390\t.*\t5,185 \(\+1\.19 %\)\t5,137 \(\+0\.25 %\)\t-48\t/.test(l)));
  const cen = g.filter((l) => /^(OK|CHECK)\t/.test(l));
  assert.equal(cen.length, 1790);
  assert.equal(cen.filter((l) => l.startsWith('CHECK\t')).length, 0);
  // no page without the article header moves
  assert.ok(cen.filter((l) => l.split('\t')[3] === '-').every((l) => l.split('\t')[6] === '+0'));
});

test('item 1: the finder rule stays HOLD (ch/de 390 0.64 points further); the four AI rows READY', () => {
  const fb = read(`${R}/gate-so52-austrian-finder-button.txt`);
  assert.match(fb, /Status: HOLD, not shipped/);
  assert.match(fb, /^FAIL\t\/ch\/de\/homepage\t390\taustrian-parity-031 [^\t]*\t5916\t5,487 \(-7\.25 %\)\t5,449 \(-7\.89 %\)\t-38\t\+0\.64\t/m);
  assert.ok(!flat.includes('.destination-finder .destination-finder-cta a.button:any-link { width: 100%'), 'the rule is not in git');
  const ai = read(`${R}/delta-so52-austrian-ai-rows.txt`).split('\n').filter((l) => /^(READY|HOLD)\t/.test(l));
  assert.deepEqual([...new Set(ai.map((l) => l.split('\t')[1]))], ['/nl/en/homepage', '/no/en/homepage', '/se/en/homepage', '/si/en/homepage']);
  assert.ok(ai.every((l) => l.startsWith('READY\t')));
  const data = JSON.parse(read(`${R}/delta-so52-austrian-ai-rows.json`));
  assert.deepEqual(data.map((d) => d.path), ['/nl/en/homepage', '/no/en/homepage', '/se/en/homepage', '/si/en/homepage']);
  data.forEach((d) => assert.ok(d.inserts[0].text.includes(`https://www.austrian.com${d.path}`)));
});

test('item 3: places 151 to 170, each with its status', () => {
  const s = read(`${R}/sweep-so52-places-151-170.txt`).split('\n').filter((l) => /^\d+\t/.test(l));
  assert.deepEqual(s.map((l) => Number(l.split('\t')[0])), Array.from({ length: 20 }, (_, k) => k + 151));
  assert.ok(s.every((l) => ['within 2 %', 'closed'].includes(l.split('\t')[1])));
  assert.deepEqual(s.filter((l) => l.split('\t')[1] === 'closed').map((l) => Number(l.split('\t')[0])), [151, 159, 160]);
});

test('no file of this order has a row for /de/en/overview-manage', () => {
  fs.readdirSync(new URL(`../${R}`, import.meta.url)).filter((f) => f.includes('so52')).forEach((f) => assert.ok(!read(`${R}/${f}`).includes('/de/en/overview-manage'), f));
});
