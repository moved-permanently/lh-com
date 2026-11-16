/* eslint-disable max-len, import/extensions -- dev tooling */
/* Group for Business (ema-lufthansa, standing order 37 of 2026-11-16, item 2): allegris/video-gallery's page metadata moved
   into the closing grey section (no empty last section) with a 39 px phone spacer at the band's end
   (delta-so37-b2b-video-gallery-ending.txt: 1440 +2.07 -> +1.38 %, 390 equal against b2b-parity-016).
   Run: node --test test/b2b-video-gallery-ending-so37.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readyPaths } from '../tools/importer/ita-fragment-insert-apply.mjs';

const R = '../tools/reports/parity-2026-11-09/';
const data = JSON.parse(fs.readFileSync(new URL(`${R}delta-so37-b2b-video-gallery-ending.json`, import.meta.url), 'utf8'));
const list = fs.readFileSync(new URL(`${R}delta-so37-b2b-video-gallery-ending.txt`, import.meta.url), 'utf8');
const PATH = '/de/en/allegris/video-gallery';

test('one row: the section break before the metadata goes, the phone spacer comes in', () => {
  assert.deepEqual(Object.keys(data), [PATH]);
  const [r] = data[PATH];
  assert.equal(data[PATH].length, 1);
  assert.equal(r.count, 1);
  assert.ok(r.from.includes('</div>\n<div><div class="metadata">'));
  assert.ok(!r.to.includes('</div>\n<div><div class="metadata">'));
  assert.ok(r.to.startsWith('<p>{spacer-39 below-768}</p><div class="section-metadata">'));
  // nothing else changes: the spacer before, the grey section's end and the metadata section's start dropped
  assert.equal(r.to, `<p>{spacer-39 below-768}</p>${r.from.replace('</div>\n<div><div class="metadata">', '<div class="metadata">')}`);
});

test('the list: READY, naming both recordings and the backup', () => {
  assert.deepEqual(readyPaths(list), [PATH]);
  assert.match(list.split('\n')[0], /9ebf4357ffceea3b1f4b5b90827696094ed167de4ced55e2e2462cd874bda169/);
  assert.match(list.split('\n')[0], /\.token-free-backup\/2026-11-b2b-so37-video-gallery-ending\//);
});
