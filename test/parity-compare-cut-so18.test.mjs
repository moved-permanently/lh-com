/* eslint-disable max-len */
/* Standing order 18 of 2026-11-13, item 1: tools/parity/compare.js cuts the longer capture to the height of one that is
   marked cut off (www's recordings stop at 8000 px). Before, the shorter image was padded white, so everything of ours
   below www's cut counted as mismatch: 86 lufthansa.com page-widths averaged 20.3 % so, 13.8 % cut to the same height.
   - A capture is cut off when its metadata says so: capture.js's <png>.json ("truncated"), a source export's
     capture.json beside it (widths[w].file, "truncated"), or a drop's manifest.json (pages[].widths[w].png with its
     measurements' scrollHeight taller than the png). truncatedA / truncatedB (--a-truncated / --b-truncated) say it
     directly; cut: false (--no-cut) keeps the old padding.
   - Only the other image is cut, and only when it is taller: a page shorter than www's cut still counts its missing
     part. heightA / heightB stay the images' own heights; "cut" names what was cut; heightDiffRatio is of the images
     compared.
   Run: node --test test/parity-compare-cut-so18.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { PNG } = require('pngjs');
const { compareImages, cutToRecording, readTruncated } = require('../tools/parity/compare.js');

/** a width x height PNG: rows 0..top-1 striped grey/white, the rest black */
function png(width, height, top = height) {
  const img = new PNG({ width, height });
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4;
      let v = 0;
      if (y < top) v = (Math.floor(y / 5) % 2) ? 200 : 255;
      img.data[i] = v; img.data[i + 1] = v; img.data[i + 2] = v; img.data[i + 3] = 255;
    }
  }
  return img;
}
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'compare-cut-'));
const write = (rel, img) => {
  const f = path.join(dir, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, PNG.sync.write(img));
  return f;
};
const json = (rel, obj) => {
  const f = path.join(dir, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, JSON.stringify(obj));
  return f;
};
const ours = write('ours/page-1440.png', png(20, 150, 100)); // the recording's 100 rows, then 50 more of its own

test('cutToRecording: the taller image to the cut-off one\'s height, only then', () => {
  const a = png(20, 100); const b = png(20, 150, 100);
  const cut = cutToRecording(a, b, { truncatedA: true });
  assert.equal(cut.imgB.height, 100);
  assert.equal(cut.imgA, a);
  assert.deepEqual(cut.cut, {
    image: 'b', from: 150, to: 100, reason: 'a cut off',
  });
  assert.equal(cutToRecording(a, b, { truncatedA: false }).cut, null);
  assert.equal(cutToRecording(a, b, {}).cut, null);
  const short = png(20, 80);
  assert.equal(cutToRecording(a, short, { truncatedA: true }).cut, null, 'a page shorter than the cut keeps its gap');
  const both = cutToRecording(png(20, 150), png(20, 100), { truncatedB: true });
  assert.equal(both.imgA.height, 100);
  assert.equal(both.cut.image, 'a');
});

test('capture.js metadata beside the png (truncated: true): ours cut, nothing below counted', () => {
  const rec = write('cap/page-1440-src.png', png(20, 100));
  json('cap/page-1440-src.png.json', { truncated: true, scrollHeight: 400 });
  const r = compareImages({ a: rec, b: ours, out: path.join(dir, 'out/1.png') });
  assert.equal(r.unmaskedRatio, 0);
  assert.equal(r.heightA, 100);
  assert.equal(r.heightB, 150);
  assert.equal(r.height, 100);
  assert.equal(r.heightDiffRatio, 0);
  assert.deepEqual(r.cut, {
    image: 'b', from: 150, to: 100, reason: 'a cut off',
  });
  assert.equal(r.truncatedA, true);
  const off = compareImages({
    a: rec, b: ours, out: path.join(dir, 'out/1b.png'), cut: false,
  });
  assert.ok(off.unmaskedRatio > 0.3);
  assert.equal(off.cut, null);
});

test('a source export\'s capture.json (widths[w].file, truncated)', () => {
  const rec = write('export/pages/de/en/page/screenshot.png', png(20, 100));
  json('export/pages/de/en/page/capture.json', {
    maxHeight: 100,
    widths: {
      1440: { file: 'tools/source-export/pages/de/en/page/screenshot.png', truncated: true },
      390: { file: 'tools/source-export/pages/de/en/page/screenshot-390.png', truncated: false },
    },
  });
  assert.equal(readTruncated(rec), true);
  const r = compareImages({ a: rec, b: ours, out: path.join(dir, 'out/2.png') });
  assert.equal(r.unmaskedRatio, 0);
  const rec390 = write('export/pages/de/en/page/screenshot-390.png', png(20, 100));
  assert.equal(readTruncated(rec390), false);
  assert.ok(compareImages({ a: rec390, b: ours, out: path.join(dir, 'out/2b.png') }).unmaskedRatio > 0.3);
});

test('a drop\'s manifest.json: the png shorter than its measurements\' scrollHeight', () => {
  const rec = write('drop/de-en-page-1440.png', png(20, 100));
  const whole = write('drop/de-en-page-390.png', png(20, 100));
  json('drop/manifest.json', {
    pages: [{
      name: 'de-en-page',
      widths: {
        1440: { png: 'de-en-page-1440.png', measurements: 'measurements/de-en-page-1440.json' },
        390: { png: 'de-en-page-390.png', measurements: 'measurements/de-en-page-390.json' },
      },
    }],
  });
  json('drop/measurements/de-en-page-1440.json', { scrollHeight: 900 });
  json('drop/measurements/de-en-page-390.json', { scrollHeight: 100 });
  assert.equal(readTruncated(rec), true);
  assert.equal(readTruncated(whole), false);
  assert.equal(compareImages({ a: rec, b: ours, out: path.join(dir, 'out/3.png') }).unmaskedRatio, 0);
});

test('no metadata: unknown, the old padding; truncatedA says it directly', () => {
  const rec = write('plain/page.png', png(20, 100));
  assert.equal(readTruncated(rec), null);
  const r = compareImages({ a: rec, b: ours, out: path.join(dir, 'out/4.png') });
  assert.ok(r.unmaskedRatio > 0.3);
  assert.equal(r.cut, null);
  assert.equal(r.heightDiffRatio, 0.33333);
  const told = compareImages({
    a: rec, b: ours, out: path.join(dir, 'out/4b.png'), truncatedA: true,
  });
  assert.equal(told.unmaskedRatio, 0);
});

test.after(() => fs.rmSync(dir, { recursive: true, force: true }));
