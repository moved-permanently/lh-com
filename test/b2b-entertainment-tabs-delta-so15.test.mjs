/* eslint-disable max-len, import/extensions */
/* Standing order 15 of 2026-11-13, item 2: the list for xx/en entertainment-on-board's tab set as a delta on DA's copy
   (tab-sections-apply.mjs): its expected change first, the tool command, one READY row better at 390; the data: the
   eight tabs of www's panels in www's order, each with the heading it starts at.
   Run: node --test test/b2b-entertainment-tabs-delta-so15.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { applyTabSections, removeInserts } from '../tools/importer/tab-sections-apply.mjs';

const read = (f) => fs.readFileSync(new URL(`../tools/reports/parity-2026-11-09/${f}`, import.meta.url), 'utf8');
const list = read('delta-so15-b2b-entertainment-tabs.txt');
const data = JSON.parse(read('b2b-entertainment-tabs-so15.json'));

test('the list: expected change, the command, one READY row better at 390', () => {
  assert.match(list.split('\n')[0], /^# Expected change: \/xx\/en\/program\/experts\/on-board\/entertainment-on-board gets www's airline tab set/);
  assert.ok(list.includes('node tools/importer/tab-sections-apply.mjs --data tools/reports/parity-2026-11-09/b2b-entertainment-tabs-so15.json --list tools/reports/parity-2026-11-09/delta-so15-b2b-entertainment-tabs.txt'));
  const rows = list.split('\n').filter((l) => l.startsWith('/')).map((l) => l.split('\t'));
  assert.equal(rows.length, 1);
  const [, a, b] = rows[0][3].match(/390 ([\d.]+) -> ([\d.]+)/);
  assert.ok(Number(b) < Number(a));
  assert.equal(rows[0][4], 'READY');
});

test('the data: www\'s eight tabs in order, each with its start heading', () => {
  assert.equal(data.length, 1);
  assert.equal(data[0].path, '/xx/en/program/experts/on-board/entertainment-on-board');
  assert.deepEqual(data[0].tabs.map((t) => t.name), ['Air Dolomiti', 'Austrian Airlines', 'Brussels Airlines', 'Discover Airlines', 'Edelweiss Air', 'Eurowings', 'Lufthansa', 'SWISS']);
  assert.ok(data[0].tabs.every((t) => t.start.length > 5));
});

test('on a copy shaped as DA\'s (airlines run on inside sections, market rows between) the gate holds', () => {
  const meta = (rows) => `<div class="section-metadata">${rows.map(([k, v]) => `<div><div><p>${k}</p></div><div><p>${v}</p></div></div>`).join('')}</div>`;
  const tabs = data[0].tabs;
  const da = '<body><header></header><main>'
    + `<div><h1>Entertainment on Board</h1><p>Intro</p><h2>eJournals</h2><h2>${tabs[0].start}</h2><p>x</p><h2>${tabs[1].start}</h2>${meta([['Style', 'wide-text']])}</div>`
    + `<div><h4>FlyNet® Messaging*</h4>${meta([['style', 'grey'], ['markets', 'bg/en, kw/en']])}</div>`
    + `<div>${tabs.slice(2, 5).map((t) => `<h2>${t.start}</h2><p>y</p>`).join('')}</div>`
    + `<div>${tabs.slice(5, 7).map((t) => `<h2>${t.start}</h2><p>z</p>`).join('')}</div>`
    + `<div><h2>${tabs[7].start}</h2></div><div></div></main><footer></footer></body>`;
  const { html, inserts, results } = applyTabSections(da, tabs);
  assert.ok(results.every((r) => r.result === 'found'));
  assert.equal(removeInserts(html, inserts), da);
  assert.ok(html.includes('<div><div><p>markets</p></div><div><p>bg/en, kw/en</p></div></div><div><div>Tab</div><div>Austrian Airlines</div></div>'));
  tabs.forEach((t) => assert.ok(html.includes(`<div><div>Tab</div><div>${t.name}</div></div>`), t.name));
});
