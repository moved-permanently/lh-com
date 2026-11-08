/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* A three-column view of videos in an Insights page (brief 474; ema-test's sweep of Brussels, rows 1-2):
   www's /be/en/articles and /be/fr/articles show "Guided by... our crew!" as three videos side by side
   (heading, video, text in each column). The insights template mapped every .videoViewer to its own
   columns-media block and not the view, so the three portrait videos stacked at the full width
   (+134 % and +130 % in height at 1440). The view now maps to one columns-media (the parser makes one
   row of three cells), ahead of the video selector; the videos inside it are not parsed again.
   Run: node --max-old-space-size=256 --test test/insights-video-row-474.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

let created = [];
globalThis.WebImporter = {
  Blocks: {
    createBlock: (document, { name, cells }) => {
      created.push({ name, cells });
      const t = document.createElement('table');
      t.dataset.name = name;
      return t;
    },
  },
};
const { default: parse } = await import('../tools/importer/parsers/columns-media.js');
const html = fs.readFileSync(new URL('./fixtures/insights-video-row/be-en-articles.html', import.meta.url), 'utf8');
const templates = JSON.parse(fs.readFileSync(new URL('../tools/importer/page-templates.json', import.meta.url), 'utf8'));
const insights = (templates.templates || templates).find((t) => t.name === 'insights');
const VIEW = '.threecolumn:has(> .column-view > .row > .column-view-item > .videoViewer):not(:has(.teaser, .table, .accordion, .tabs, form, .onecolumn, .twocolumn, .fourcolumn))';
const text = (n) => (typeof n === 'string' ? n.replace(/<[^>]*>/g, ' ') : (n && n.textContent) || '').replace(/\s+/g, ' ').trim();
const cellText = (cell) => (Array.isArray(cell) ? cell.map(text).join(' ') : text(cell));

test('the insights template maps a three-column view of videos to columns-media, before the single videos', () => {
  const cm = insights.blocks.find((b) => b.name === 'columns-media');
  const i = cm.instances.indexOf(VIEW);
  assert.ok(i >= 0, 'the view selector is mapped');
  assert.ok(i < cm.instances.indexOf('.videoViewer, .image:has(video)'));
});

test('as the import runs it (all matches collected, then parsed in order): one block of three columns', () => {
  const { document } = parseHTML(`<html><body>${html}</body></html>`);
  const cm = insights.blocks.find((b) => b.name === 'columns-media');
  const found = [];
  cm.instances.forEach((sel) => document.querySelectorAll(sel).forEach((el) => found.push(el)));
  created = [];
  found.forEach((el) => { if (el.parentNode && document.body.contains(el)) parse(el, { document }); });
  assert.equal(created.length, 1, 'one columns-media block');
  const [row] = created[0].cells;
  assert.equal(row.length, 3);
  assert.deepEqual(row.map((c) => cellText(c).split(' – ')[0]), ['PRAGUE', 'TOULOUSE', 'NEW YORK']);
  row.forEach((c) => assert.match(cellText(c), /\.mp4/));
  assert.equal(document.querySelectorAll('.videoViewer').length, 0, 'no video left outside the block');
});

test('the generated insights import script carries the selector', () => {
  const js = fs.readFileSync(new URL('../tools/importer/import-insights.js', import.meta.url), 'utf8');
  assert.ok(js.includes(JSON.stringify(VIEW).slice(1, -1)));
});
