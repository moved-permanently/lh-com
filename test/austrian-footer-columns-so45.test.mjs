/* eslint-disable max-len, import/extensions -- CSS and list lines; the tool is an .mjs module */
/* Standing order 45, item 1: the Austrian footer's three link columns in three tracks from 1025 px (order 44's HOLD,
   shipped with the stretcher rows), and the stretcher rows' delta list (READY, applied in the round after the rule).
   Run: node --max-old-space-size=256 --test test/austrian-footer-columns-so45.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { applyTextInserts, removeTextInserts, listPaths } from '../tools/importer/text-inserts-apply.mjs';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const R = 'tools/reports/parity-2026-11-09';
const RULE = '@media (width >= 1025px) { body.brand-austrian .footer .footer-columns:not(:has(> .footer-column:nth-child(4))) { grid-template-columns: repeat(3, minmax(0, 1fr)); } }';

test('the Austrian theme lays three footer link columns in three tracks from 1025 px, once', () => {
  const css = read('styles/themes/austrian.css');
  const flat = css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
  assert.equal(flat.split(RULE).length, 2);
  // before the online-check-in blocks that other tests read to the file's end
  assert.ok(css.indexOf('footer-columns:not(:has(') < css.indexOf('/* the end of online-check-in'));
  ['airdolomiti', 'cargo', 'swiss', 'tap', 'ita', 'brussels'].forEach((b) => assert.ok(!read(`styles/themes/${b}.css`).includes('footer-columns:not(:has(> .footer-column:nth-child(4)))'), b));
});

test('the stretcher rows: READY at both widths on both French homepages, each closer than as served', () => {
  const txt = read(`${R}/delta-so45-austrian-fr-stretcher-block.txt`);
  assert.deepEqual([...new Set(listPaths(txt))], ['/ca/fr/homepage', '/ch/fr/homepage']);
  const rows = txt.split('\n').filter((l) => /^(READY|HOLD)\t/.test(l));
  assert.equal(rows.length, 4);
  rows.forEach((l) => {
    const c = l.split('\t');
    const pct = (s) => Math.abs(Number(s.match(/\(([-+][\d.]+) %\)/)[1]));
    assert.equal(c[0], 'READY');
    assert.ok(pct(c[7]) < pct(c[5]), `${c[1]} ${c[2]} closer`);
  });
  assert.match(txt, /^READY\t\/ca\/fr\/homepage\t1440\t.*\t3428 \(\+1\.96 %\)\t/m);
  assert.match(txt, /^READY\t\/ch\/fr\/homepage\t1440\t.*\t5047 \(\+0\.10 %\)\t/m);
  assert.match(txt, /in the round AFTER the footer rule is live/);
});

test('the insert: after the empty flash teaser, removable, idempotent on a copy shaped as DA\'s', () => {
  const data = JSON.parse(read(`${R}/delta-so45-austrian-fr-stretcher-block.json`));
  assert.deepEqual(data.map((r) => r.path), ['/ca/fr/homepage', '/ch/fr/homepage']);
  data.forEach(({ inserts }) => {
    assert.equal(inserts.length, 1);
    assert.equal(inserts[0].after, '<div class="flash-teaser"></div>');
    assert.match(inserts[0].text, /^<h2>Stretcher transportation<\/h2><p>Lufthansa provides stretchers [^<]* Medical Operations Center\.<\/p>$/);
    const doc = '<body><header></header><main><div><div class="flash-teaser"></div><div class="flight-search"><div><div>Shop</div></div></div></div></main></body>';
    const once = applyTextInserts(doc, inserts);
    assert.deepEqual(once.results, ['inserted']);
    assert.ok(once.html.includes(`${inserts[0].text}<div class="flight-search">`));
    assert.equal(removeTextInserts(once.html, once.inserts), doc);
    assert.deepEqual(applyTextInserts(once.html, inserts).results, ['present']);
  });
});

test('the footer gate names the owner\'s reason on by/ru and ru/ru', () => {
  const fc = read(`${R}/gate-so44-austrian-footer-columns.txt`).split('\n');
  ['/by/ru/homepage', '/ru/ru/homepage'].forEach((p) => {
    const row = fc.find((l) => l.startsWith(`ACCEPTED\t${p}\t1440\t`));
    assert.ok(row, p);
    assert.match(row, /footer comes out at www's height; the rest is Cyrillic text/);
  });
  ['/ca/fr/homepage', '/ch/fr/homepage'].forEach((p) => assert.ok(fc.some((l) => l.startsWith(`INTERIM\t${p}\t1440\t`)), p));
});

test('no list of this order has a row for /de/en/overview-manage', () => {
  fs.readdirSync(new URL(`../${R}`, import.meta.url)).filter((f) => f.includes('so45')).forEach((f) => assert.ok(!read(`${R}/${f}`).includes('/de/en/overview-manage'), f));
});
