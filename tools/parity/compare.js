/* eslint-disable no-console, import/no-extraneous-dependencies -- dev tooling */
/**
 * Pixel-compares two screenshots.
 *
 * node tools/parity/compare.js --a src.png --b eds.png --out diff.png
 *   [--crop-a top=98,right=15] [--mask boxes.json ...] [--threshold 0.1] [--band 200]
 *   [--diverge 0.3]
 *
 * --crop-a: px cut off the source image before anything else (top, right, bottom, left): the
 *   15 px scrollbar strip of live screenshots that are as wide as the viewport (build-jobs.mjs
 *   srcCrop.right), or a banner the live capture has and the replica must not (top). Mask
 *   boxes are in the cropped coordinates (those of the replica).
 * Both images are padded with white to the larger width/height, so a page that is too short or too
 * long shows up as mismatch at the bottom.
 * --mask (repeatable): a JSON file with boxes in document coordinates, either an array of
 *   {x, y, width, height} or an object with "liveBoxes" or "boxes" (so capture.js's <out>.json can
 *   be passed as is). The boxes are painted the same grey in BOTH images before diffing, so
 *   live/recorded data (fares, flight search) never counts as mismatch; in the diff
 *   image they are tinted blue.
 * Prints and writes <out>.json:
 *   mismatchRatio    mismatched / all pixels (masked pixels count as matching)
 *   unmaskedRatio    mismatched / unmasked pixels (the number to judge parity by)
 *   maskedPixels, maskRatio, maskBoxes
 *   bands            [{index, y, ratio, unmaskedRatio}] per --band px horizontal strip
 *   worstBands       top 3 bands by unmaskedRatio
 *   heightDiffRatio  |heightA - heightB| / max(heightA, heightB)
 *   firstDivergentBand {index, y, unmaskedRatio} of the first band above --diverge (where the
 *                    layout starts to diverge), or null
 * Also usable as a module: const { compareImages, comparePngs } = require('./compare.js').
 */
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const pixelmatch = require('pixelmatch').default;
const { getArgs, writeJsonAtomic, mkdirp } = require('./lib.js');

const DIFF_COLOR = [255, 0, 0];
const MASK_COLOR = [128, 128, 128];
const MASK_TINT = [0, 90, 255];
const DIVERGE_THRESHOLD = 0.3;

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

/**
 * Parses "top=98,right=15" (or an object) into {top, right, bottom, left}; null when all are 0.
 */
function parseCrop(spec) {
  if (!spec) return null;
  const obj = typeof spec === 'string'
    ? Object.fromEntries(spec.split(',').filter(Boolean).map((kv) => kv.split('=').map((x) => x.trim())))
    : spec;
  const crop = {};
  ['top', 'right', 'bottom', 'left'].forEach((k) => {
    const n = Number(obj[k] || 0);
    if (!Number.isInteger(n) || n < 0) throw new Error(`invalid crop ${k}=${obj[k]}`);
    crop[k] = n;
  });
  Object.keys(obj).forEach((k) => {
    if (!(k in crop)) throw new Error(`invalid crop key ${k}`);
  });
  return Object.values(crop).some((n) => n > 0) ? crop : null;
}

/** Returns a copy of img without crop.{top,right,bottom,left} px (img itself when no crop). */
function cropImage(img, crop) {
  if (!crop) return img;
  const width = img.width - crop.left - crop.right;
  const height = img.height - crop.top - crop.bottom;
  if (width < 1 || height < 1) throw new Error(`crop leaves nothing of ${img.width}x${img.height}`);
  const out = new PNG({ width, height });
  PNG.bitblt(img, out, crop.left, crop.top, width, height, 0, 0);
  return out;
}

/** Returns an image of exactly width x height: a padded copy, or a copy of the pixels. */
function padCopy(img, width, height) {
  const out = new PNG({ width, height });
  if (img.width === width && img.height === height) {
    Buffer.from(img.data.buffer, img.data.byteOffset, img.data.length).copy(out.data);
    return out;
  }
  out.data.fill(255); // opaque white
  PNG.bitblt(img, out, 0, 0, img.width, img.height, 0, 0);
  return out;
}

/**
 * Reads mask boxes from a JSON file: an array of boxes or {liveBoxes|boxes: [...]}.
 * @param {string} file
 * @returns {{x: number, y: number, width: number, height: number}[]}
 */
function loadMask(file) {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  let boxes = [];
  if (Array.isArray(data)) boxes = data;
  else if (data && Array.isArray(data.liveBoxes)) boxes = data.liveBoxes;
  else if (data && Array.isArray(data.boxes)) boxes = data.boxes;
  return boxes.filter((b) => b && [b.x, b.y, b.width, b.height].every(Number.isFinite)
    && b.width > 0 && b.height > 0);
}

/** Marks the boxes (clipped to the image) in a width*height byte map; returns the map. */
function maskMap(boxes, width, height) {
  const map = new Uint8Array(width * height);
  boxes.forEach((b) => {
    const x0 = Math.max(0, Math.floor(b.x));
    const y0 = Math.max(0, Math.floor(b.y));
    const x1 = Math.min(width, Math.ceil(b.x + b.width));
    const y1 = Math.min(height, Math.ceil(b.y + b.height));
    for (let y = y0; y < y1; y += 1) map.fill(1, y * width + x0, y * width + Math.max(x0, x1));
  });
  return map;
}

function paint(img, map, [r, g, b]) {
  for (let p = 0; p < map.length; p += 1) {
    if (map[p]) {
      const i = p * 4;
      img.data[i] = r;
      img.data[i + 1] = g;
      img.data[i + 2] = b;
      img.data[i + 3] = 255;
    }
  }
}

function tint(img, map, [r, g, b], alpha = 0.35) {
  for (let p = 0; p < map.length; p += 1) {
    if (map[p]) {
      const i = p * 4;
      img.data[i] = Math.round(img.data[i] * (1 - alpha) + r * alpha);
      img.data[i + 1] = Math.round(img.data[i + 1] * (1 - alpha) + g * alpha);
      img.data[i + 2] = Math.round(img.data[i + 2] * (1 - alpha) + b * alpha);
    }
  }
}

const round = (n) => Math.round(n * 1e5) / 1e5;

/**
 * Compares two decoded images (the inputs are not modified).
 * @param {{width, height, data}} imgA source image
 * @param {{width, height, data}} imgB EDS image
 * @param {Object} [opts] {threshold=0.1, bandHeight=200, masks=[], divergeThreshold=0.3}
 * @returns {{result: Object, diff: PNG}} metrics and the diff image
 */
function comparePngs(imgA, imgB, {
  threshold = 0.1, bandHeight = 200, masks = [], divergeThreshold = DIVERGE_THRESHOLD,
} = {}) {
  const width = Math.max(imgA.width, imgB.width);
  const height = Math.max(imgA.height, imgB.height);
  const a = padCopy(imgA, width, height);
  const b = padCopy(imgB, width, height);
  const map = masks.length ? maskMap(masks, width, height) : null;
  if (map) {
    paint(a, map, MASK_COLOR);
    paint(b, map, MASK_COLOR);
  }
  const diff = new PNG({ width, height });
  const mismatched = pixelmatch(a.data, b.data, diff.data, width, height, {
    threshold, diffColor: DIFF_COLOR, includeAA: false,
  });

  // unchanged pixels are drawn as grey (r = g = b), so pure red marks exactly the mismatches
  const bands = [];
  let maskedPixels = 0;
  for (let y0 = 0, index = 0; y0 < height; y0 += bandHeight, index += 1) {
    const y1 = Math.min(height, y0 + bandHeight);
    let count = 0;
    let masked = 0;
    for (let p = y0 * width, end = y1 * width; p < end; p += 1) {
      const i = p * 4;
      if (diff.data[i] === 255 && diff.data[i + 1] === 0 && diff.data[i + 2] === 0) count += 1;
      if (map && map[p]) masked += 1;
    }
    maskedPixels += masked;
    const area = (y1 - y0) * width;
    bands.push({
      index,
      y: y0,
      ratio: round(count / area),
      unmaskedRatio: area > masked ? round(count / (area - masked)) : 0,
    });
  }
  if (map) tint(diff, map, MASK_TINT);

  const total = width * height;
  const divergent = bands.find((x) => x.unmaskedRatio > divergeThreshold);
  const result = {
    mismatchRatio: round(mismatched / total),
    unmaskedRatio: total > maskedPixels ? round(mismatched / (total - maskedPixels)) : 0,
    mismatchedPixels: mismatched,
    maskedPixels,
    maskRatio: round(maskedPixels / total),
    maskBoxes: masks.length,
    width,
    height,
    widthA: imgA.width,
    widthB: imgB.width,
    heightA: imgA.height,
    heightB: imgB.height,
    heightDiffRatio: round(Math.abs(imgA.height - imgB.height)
      / Math.max(imgA.height, imgB.height, 1)),
    firstDivergentBand: divergent
      ? { index: divergent.index, y: divergent.y, unmaskedRatio: divergent.unmaskedRatio } : null,
    threshold,
    bandHeight,
    divergeThreshold,
    worstBands: [...bands].sort((x, y) => y.unmaskedRatio - x.unmaskedRatio)
      .slice(0, 3).filter((x) => x.unmaskedRatio > 0),
    bands,
  };
  return { result, diff };
}

/**
 * Compares two image files and writes the diff PNG plus <out>.json.
 * @param {{a: string, b: string, out: string, masks?: string[], threshold?: number,
 *   bandHeight?: number, divergeThreshold?: number, cropA?: string|Object}} opts masks: mask
 *   JSON files; cropA: px cut off the source image ("top=98,right=15" or {top, right, ...})
 * @returns {Object} metrics (also written to <out>.json)
 */
function compareImages({
  a, b, out, masks = [], threshold, bandHeight, divergeThreshold, cropA,
}) {
  const crop = parseCrop(cropA);
  const imgA = cropImage(readImage(a), crop);
  const imgB = readImage(b);
  const boxes = masks.flatMap(loadMask);
  const { result, diff } = comparePngs(imgA, imgB, {
    threshold, bandHeight, divergeThreshold, masks: boxes,
  });
  const full = {
    a: path.resolve(a),
    b: path.resolve(b),
    diff: path.resolve(out),
    maskFiles: masks.map((m) => path.resolve(m)),
    cropA: crop,
    ...result,
  };
  mkdirp(path.dirname(path.resolve(out)));
  fs.writeFileSync(out, PNG.sync.write(diff));
  writeJsonAtomic(`${out}.json`, full);
  return full;
}

module.exports = {
  compareImages, comparePngs, readImage, loadMask, parseCrop, cropImage, DIVERGE_THRESHOLD,
};

if (require.main === module) {
  const args = getArgs({
    a: { type: 'string' },
    b: { type: 'string' },
    out: { type: 'string' },
    'crop-a': { type: 'string' },
    mask: { type: 'string', multiple: true },
    threshold: { type: 'string', default: '0.1' },
    band: { type: 'string', default: '200' },
    diverge: { type: 'string', default: String(DIVERGE_THRESHOLD) },
  }, ['a', 'b', 'out'], 'node tools/parity/compare.js --a src.png --b eds.png --out diff.png [--crop-a top=98,right=15] [--mask boxes.json ...] [--threshold 0.1] [--band 200] [--diverge 0.3]');
  try {
    const res = compareImages({
      a: args.a,
      b: args.b,
      out: args.out,
      masks: args.mask || [],
      cropA: args['crop-a'],
      threshold: Number(args.threshold),
      bandHeight: Number(args.band),
      divergeThreshold: Number(args.diverge),
    });
    const { bands, ...summary } = res;
    console.log(JSON.stringify(summary));
  } catch (e) {
    console.error(`compare failed: ${e.message}`);
    process.exit(1);
  }
}
