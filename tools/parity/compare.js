/* eslint-disable no-console, import/no-extraneous-dependencies -- dev tooling */
/**
 * Pixel-compares two screenshots.
 *
 * node tools/parity/compare.js --a src.png --b eds.png --out diff.png
 *   [--threshold 0.1] [--band 200]
 *
 * Both images are padded with white to the larger width/height, so a page that is too short or too
 * long shows up as mismatch at the bottom. Prints and writes <out>.json:
 * {mismatchRatio, width, height, heightA, heightB, bands: [{y, ratio}]} where each band is a 200 px
 * horizontal strip; high bands locate the broken section.
 * Also usable as a module: const { compareImages } = require('./compare.js').
 */
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const pixelmatch = require('pixelmatch').default;
const { getArgs, writeJsonAtomic, mkdirp } = require('./lib.js');

const DIFF_COLOR = [255, 0, 0];

/** Reads a PNG or JPEG (live captures are JPEG) into {width, height, data}. */
function readImage(file) {
  const buf = fs.readFileSync(file);
  if (/\.jpe?g$/i.test(file)) {
    // eslint-disable-next-line global-require, import/no-extraneous-dependencies
    const jpeg = require('jpeg-js');
    const img = jpeg.decode(buf, { useTArray: true, maxMemoryUsageInMB: 1024 });
    return { width: img.width, height: img.height, data: Buffer.from(img.data) };
  }
  return PNG.sync.read(buf);
}

function pad(img, width, height) {
  if (img.width === width && img.height === height) return img;
  const out = new PNG({ width, height });
  out.data.fill(255); // opaque white
  PNG.bitblt(img, out, 0, 0, img.width, img.height, 0, 0);
  return out;
}

const round = (n) => Math.round(n * 1e5) / 1e5;

/**
 * Compares two decoded PNGs.
 * @param {PNG} imgA source image
 * @param {PNG} imgB EDS image
 * @param {Object} [opts] {threshold=0.1, bandHeight=200}
 * @returns {{result: Object, diff: PNG}} metrics and the diff image
 */
function comparePngs(imgA, imgB, { threshold = 0.1, bandHeight = 200 } = {}) {
  const width = Math.max(imgA.width, imgB.width);
  const height = Math.max(imgA.height, imgB.height);
  const a = pad(imgA, width, height);
  const b = pad(imgB, width, height);
  const diff = new PNG({ width, height });
  const mismatched = pixelmatch(a.data, b.data, diff.data, width, height, {
    threshold, diffColor: DIFF_COLOR, includeAA: false,
  });

  // unchanged pixels are drawn as grey (r = g = b), so pure red marks exactly the mismatches
  const bands = [];
  for (let y0 = 0; y0 < height; y0 += bandHeight) {
    const y1 = Math.min(height, y0 + bandHeight);
    let count = 0;
    for (let i = y0 * width * 4, end = y1 * width * 4; i < end; i += 4) {
      if (diff.data[i] === 255 && diff.data[i + 1] === 0 && diff.data[i + 2] === 0) count += 1;
    }
    bands.push({ y: y0, ratio: round(count / ((y1 - y0) * width)) });
  }

  const result = {
    mismatchRatio: round(mismatched / (width * height)),
    mismatchedPixels: mismatched,
    width,
    height,
    widthA: imgA.width,
    widthB: imgB.width,
    heightA: imgA.height,
    heightB: imgB.height,
    threshold,
    bandHeight,
    worstBands: [...bands].sort((x, y) => y.ratio - x.ratio).slice(0, 3).filter((x) => x.ratio > 0),
    bands,
  };
  return { result, diff };
}

/**
 * Compares two PNG files and writes the diff PNG plus <out>.json.
 * @param {{a: string, b: string, out: string, threshold?: number, bandHeight?: number}} opts
 * @returns {Object} metrics (also written to <out>.json)
 */
function compareImages({
  a, b, out, threshold, bandHeight,
}) {
  const imgA = readImage(a);
  const imgB = readImage(b);
  const { result, diff } = comparePngs(imgA, imgB, { threshold, bandHeight });
  const full = {
    a: path.resolve(a), b: path.resolve(b), diff: path.resolve(out), ...result,
  };
  mkdirp(path.dirname(path.resolve(out)));
  fs.writeFileSync(out, PNG.sync.write(diff));
  writeJsonAtomic(`${out}.json`, full);
  return full;
}

module.exports = { compareImages, comparePngs };

if (require.main === module) {
  const args = getArgs({
    a: { type: 'string' },
    b: { type: 'string' },
    out: { type: 'string' },
    threshold: { type: 'string', default: '0.1' },
    band: { type: 'string', default: '200' },
  }, ['a', 'b', 'out'], 'node tools/parity/compare.js --a src.png --b eds.png --out diff.png [--threshold 0.1] [--band 200]');
  try {
    const res = compareImages({
      a: args.a,
      b: args.b,
      out: args.out,
      threshold: Number(args.threshold),
      bandHeight: Number(args.band),
    });
    console.log(JSON.stringify(res));
  } catch (e) {
    console.error(`compare failed: ${e.message}`);
    process.exit(1);
  }
}
