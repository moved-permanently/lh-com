/* eslint-disable max-len, import/extensions */
/* Standing order 19 of 2026-11-14, item 1: tools/parity/compare.js writes the aligned drift profile next to the
   percentage (tools/parity/drift.js), and tools/parity/gate.mjs reads two of them per page-width.
   - drift.windows: per 100 px window of A (www) [y, offset, mismatch %]: the vertical offset at which B (ours) matches
     best (16-strip row signatures within +-400 px, a small pull to the previous offset) and the pixels that still
     differ there. drift.aligned: mismatched / compared pixels once aligned (low: only where things sit differs).
     drift.largestStep: the largest change of offset between two windows that match well (under 2 %), with A's y,
     B's y and, when B's capture json has contentBoxes (capture.js), the element of B that starts there.
   - gate.mjs: base and trial compare json per page-width; the 0.5 gate as before, and for a page-width worse by more
     than 0.5 the reason: "compensation removed" when, going down the page, the first window whose offset changed
     comes closer to www (the fix is right there) and the page gets further from www only below it (a drift that
     the old offset had cancelled), else "fix wrong" (the first change already takes the page further from www).
   Run: node --test test/parity-drift-so19.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { PNG } = require('pngjs');
const { driftProfile } = require('../tools/parity/drift.js');
const { compareImages } = require('../tools/parity/compare.js');

const { gateVerdict } = await import('../tools/parity/gate.mjs');

/** A page of 40 px text-like bands (each its own grey) on white; `gaps` [y, px]: white rows at that y, the page's
    rows below them moved down by px. */
function page(height, gaps = [], width = 64) {
  const img = new PNG({ width, height });
  img.data.fill(255);
  for (let y = 0; y < height; y += 1) {
    const inGap = gaps.some(([gy, px]) => y >= gy && y < gy + px);
    const src = y - gaps.filter(([gy, px]) => y >= gy + px).reduce((t, [, px]) => t + px, 0);
    const band = Math.floor(src / 40);
    if (!inGap && src % 40 < 24) {
      const v = 40 + ((band * 53) % 180);
      for (let x = 4 + (band % 5) * 3; x < width - 4; x += 1) {
        const i = (y * width + x) * 4;
        img.data[i] = v; img.data[i + 1] = v; img.data[i + 2] = (v + 40) % 256;
      }
    }
  }
  return img;
}

test('driftProfile: 20 px more at 300 on ours, offset 0 above and +20 below, the step there, aligned 0', () => {
  const a = page(1000);
  const b = page(1020, [[300, 20]]);
  const d = driftProfile(a, b);
  assert.equal(d.windows.length, 10);
  assert.ok(d.windows.slice(0, 3).every((w) => w[1] === 0));
  assert.ok(d.windows.slice(4).every((w) => w[1] === 20));
  assert.ok(d.aligned < 1);
  assert.equal(d.largestStep.step, 20);
  assert.ok(d.largestStep.y >= 300 && d.largestStep.y <= 400);
});

test('compareImages writes drift; the element of ours at the step from contentBoxes', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'drift-'));
  const fa = path.join(dir, 'a.png'); const fb = path.join(dir, 'b.png');
  fs.writeFileSync(fa, PNG.sync.write(page(1000)));
  fs.writeFileSync(fb, PNG.sync.write(page(1020, [[300, 20]])));
  fs.writeFileSync(`${fb}.json`, JSON.stringify({
    truncated: false,
    contentBoxes: [{
      k: 'el', tag: 'h2', cls: '', y: 300, h: 40, text: 'Heading',
    }, {
      k: 'el', tag: 'p', cls: '', y: 360, h: 80, text: 'Text',
    }],
  }));
  const r = compareImages({ a: fa, b: fb, out: path.join(dir, 'd.png') });
  assert.ok(Array.isArray(r.drift.windows));
  assert.equal(r.drift.largestStep.step, 20);
  assert.equal(r.drift.largestStep.at, 'h2 "Heading"');
  const off = compareImages({
    a: fa, b: fb, out: path.join(dir, 'e.png'), drift: false,
  });
  assert.equal(off.drift, undefined);
  fs.rmSync(dir, { recursive: true, force: true });
});

const res = (pct, offsets) => ({ unmaskedRatio: pct / 100, drift: { windows: offsets.map((d, i) => [i * 100, d, 0]) } });

test('gateVerdict: better, same, worse because a compensating drift went, worse because the fix is wrong', () => {
  // base: +10 at 300 (the fix's place), cancelled by -10 at 600; trial: the +10 gone, so -10 from 600 on
  const base = res(8, [0, 0, 0, 10, 10, 10, 0, 0, 0, 0]);
  const comp = res(9, [0, 0, 0, 0, 0, 0, -10, -10, -10, -10]);
  const v = gateVerdict(base, comp);
  assert.equal(v.verdict, 'worse: compensation removed');
  assert.equal(v.fixAt, 300);
  assert.equal(v.uncoveredAt, 600);
  const wrong = res(9, [0, 0, 0, 20, 20, 20, 10, 10, 10, 10]);
  assert.equal(gateVerdict(base, wrong).verdict, 'worse: fix wrong');
  assert.equal(gateVerdict(base, res(7, [0, 0, 0, 0, 0, 0, -10, -10, -10, -10])).verdict, 'better');
  assert.equal(gateVerdict(base, res(8.3, [0, 0, 0, 10, 10, 10, 0, 0, 0, 0])).verdict, 'same');
});
