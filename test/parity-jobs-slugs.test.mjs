/* eslint-disable max-len, import/extensions -- dev tooling */
/* The parity sweep pairs a www capture with our page (tools/parity/build-jobs.mjs, the brief after 516 item 6): a job keeps
   www's path (its captures, tools/source-export/pages/<www path>) and its edsUrl is where our document lives, the write
   step's target (tools/parity/pair.mjs edsUrlOf: slug-write.mjs writeTarget, the canonical path once the alias is active).
   Checked on the run on disk (tools/parity/jobs.json): with the map as it is (flags off) every job pairs exactly as the run
   did; with a copy with de/de and at/de on, a localized de/de or at/de page pairs with its canonical path, the others as
   before, its www capture kept.
   Run: node --test test/parity-jobs-slugs.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadMap } from '../tools/slugs/lib.mjs';
import { slugMapOf } from '../tools/importer/slug-write.mjs';
import { edsUrlOf, EDS_ORIGIN } from '../tools/parity/pair.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const jobs = JSON.parse(fs.readFileSync(path.join(root, 'tools/parity/jobs.json'), 'utf8'));
const raw = JSON.parse(fs.readFileSync(path.join(root, 'tools/slugs/lh-com.json'), 'utf8'));
raw.active['de/de'] = true;
raw.active['at/de'] = true;
const on = loadMap(raw);

test('flags off: every job of the run on disk pairs as it did', () => {
  assert.ok(jobs.length > 100);
  const off = slugMapOf('lh-com');
  jobs.forEach((j) => assert.equal(edsUrlOf(j.path, off), j.edsUrl, j.path));
});

test('de/de and at/de on (a test copy): localized pages pair with their canonical path, their www captures kept', () => {
  let moved = 0;
  jobs.forEach((j) => {
    const u = edsUrlOf(j.path, on);
    if (u !== j.edsUrl) {
      moved += 1;
      assert.equal(u, `${EDS_ORIGIN}${on.canonicalOf(j.path)}`);
      assert.match(j.path, /^\/(de|at)\/de\//);
    }
  });
  assert.ok(moved > 0, 'the run has localized de/de or at/de pages');
});

test('build-jobs pairs through edsUrlOf with the site\'s map (or --slug-map)', () => {
  const src = fs.readFileSync(path.join(root, 'tools/parity/build-jobs.mjs'), 'utf8');
  assert.match(src, /edsUrl: edsUrlOf\(job\.path, SLUGS\)/);
  assert.match(src, /'slug-map'/);
});
