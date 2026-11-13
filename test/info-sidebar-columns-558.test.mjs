/* eslint-disable max-len */
/* lufthansa.com's info template (brief 558, rule 6): a three- or four-column view inside a sidebar's content is a
   Columns Media block, as a two-column view there already was. /de/en/schengen's member states (www: four lists side
   by side in .sidebar-content > .fourcolumn) came in as four lists one under the other: 738 px taller than www at
   1440 (32.7 % off). Only the info template's selector changes; the other templates as before.
   Run: node --max-old-space-size=256 --test test/info-sidebar-columns-558.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const { templates } = JSON.parse(fs.readFileSync(new URL('../tools/importer/page-templates.json', import.meta.url), 'utf8'));
const instances = (name) => templates.find((t) => t.name === name).blocks.find((b) => b.name === 'columns-media').instances;
const SIDEBAR = '.sidebar-content > :is(.threecolumn, .fourcolumn):not(:has(.table, .teaser';

test('info: three- and four-column views in a sidebar\'s content are Columns Media', () => {
  assert.ok(instances('info').some((s) => s.startsWith(SIDEBAR)));
});

test('the other templates keep their selector', () => {
  ['campaign', 'fleet', 'legal', 'form'].forEach((t) => assert.ok(!instances(t).some((s) => s.startsWith(SIDEBAR)), t));
});
