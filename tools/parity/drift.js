/* eslint-disable import/no-extraneous-dependencies -- dev tooling */
/**
 * The aligned drift profile of two screenshots (standing order 19 of 2026-11-14): per window of A
 * (www), the vertical offset at which B (ours) matches best, and what still differs there.
 *
 * Row signatures: the mean luminance of 16 column strips per row. For each window (100 px) of A
 * the offset d in [-maxShift, maxShift] minimizes the signature distance to B's rows y + d, with a
 * small pull to the previous window's offset (0.02 per px). The window is then pixel-compared
 * against B at that offset (pixelmatch, threshold 0.1). Most pages that are far from www by the
 * percentage are close once aligned: the difference is where things sit (spacing), and one
 * picture a few px off counts as a whole picture of mismatch.
 *
 * driftProfile(a, b) -> {
 *   windows: [[y, offset, mismatch %]] per window of A (y in A; B's y is y + offset),
 *   aligned: mismatched / compared pixels once aligned (%),
 *   largestStep: {y, yB, from, to, step} or null: the largest offset change between two windows
 *     that both match well (under 2 %) - where ours gains or loses space against www
 * }
 * Inputs are decoded PNGs ({width, height, data}, RGBA); paint masks before calling.
 */
const pixelmatch = require('pixelmatch').default;

const STRIPS = 16;
const GOOD = 2;

function signatures(img, width) {
  const sw = Math.floor(width / STRIPS);
  const rows = new Array(img.height);
  for (let y = 0; y < img.height; y += 1) {
    const r = new Float32Array(STRIPS);
    for (let s = 0; s < STRIPS; s += 1) {
      let sum = 0;
      for (let x = s * sw; x < (s + 1) * sw; x += 2) {
        const i = (y * img.width + x) * 4;
        sum += 0.3 * img.data[i] + 0.59 * img.data[i + 1] + 0.11 * img.data[i + 2];
      }
      r[s] = sum / Math.max(1, sw / 2);
    }
    rows[y] = r;
  }
  return rows;
}

function copyRows(img, y0, rows, width, dst) {
  for (let y = 0; y < rows; y += 1) {
    const yy = y0 + y;
    for (let x = 0; x < width; x += 1) {
      const o = (y * width + x) * 4;
      if (yy < 0 || yy >= img.height) {
        dst[o] = 255; dst[o + 1] = 255; dst[o + 2] = 255; dst[o + 3] = 255;
      } else {
        const i = (yy * img.width + x) * 4;
        dst[o] = img.data[i]; dst[o + 1] = img.data[i + 1]; dst[o + 2] = img.data[i + 2];
        dst[o + 3] = 255;
      }
    }
  }
}

/** The largest offset change between consecutive well-matching windows. */
function largestStep(windows, win = 100) {
  const good = windows.filter((w) => w[2] < GOOD);
  let best = null;
  for (let i = 1; i < good.length; i += 1) {
    const step = good[i][1] - good[i - 1][1];
    if (step && (!best || Math.abs(step) > Math.abs(best.step))) {
      best = {
        y: good[i - 1][0] + win,
        yB: good[i - 1][0] + win + good[i - 1][1],
        from: good[i - 1][1],
        to: good[i][1],
        step,
      };
    }
  }
  return best;
}

function driftProfile(a, b, { win = 100, maxShift = 400 } = {}) {
  const width = Math.min(a.width, b.width);
  const sa = signatures(a, width);
  const sb = signatures(b, width);
  const cost = (y0, d) => {
    let c = 0; let n = 0;
    for (let y = y0; y < y0 + win; y += 2) {
      const yb = y + d;
      if (yb < 0 || yb >= sb.length) {
        c += 255 * STRIPS;
      } else {
        for (let s = 0; s < STRIPS; s += 1) c += Math.abs(sa[y][s] - sb[yb][s]);
      }
      n += 1;
    }
    return c / n;
  };
  const ca = new Uint8Array(width * win * 4);
  const cb = new Uint8Array(width * win * 4);
  const windows = [];
  let prev = 0; let mism = 0; let total = 0;
  for (let y = 0; y + win <= a.height; y += win) {
    let best = prev; let bc = Infinity;
    for (let d = -maxShift; d <= maxShift; d += 1) {
      const c = cost(y, d) + Math.abs(d - prev) * 0.02;
      if (c < bc) { bc = c; best = d; }
    }
    prev = best;
    copyRows(a, y, win, width, ca);
    copyRows(b, y + best, win, width, cb);
    const m = pixelmatch(ca, cb, null, width, win, { threshold: 0.1, includeAA: false });
    mism += m; total += width * win;
    windows.push([y, best, Math.round((m / (width * win)) * 1000) / 10]);
  }
  return {
    win,
    windows,
    aligned: total ? Math.round((mism / total) * 10000) / 100 : 0,
    largestStep: largestStep(windows, win),
  };
}

/** The element of B (capture.js contentBoxes) starting nearest to B's y (within 60 px):
 * 'tag.class "text"'. */
function boxAt(boxes, yB) {
  const near = (boxes || []).filter((x) => x && Number.isFinite(x.y) && Math.abs(x.y - yB) <= 60)
    .sort((p, q) => Math.abs(p.y - yB) - Math.abs(q.y - yB));
  const x = near[0];
  if (!x) return null;
  const cls = (x.cls || '').split(/\s+/).filter((c) => c && c !== 'block').join('.');
  return `${x.tag || x.k}${cls ? `.${cls}` : ''} "${(x.text || '').slice(0, 40)}"`;
}

module.exports = {
  driftProfile, largestStep, boxAt, GOOD,
};
