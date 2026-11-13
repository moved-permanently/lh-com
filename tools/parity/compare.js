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
 * A capture marked cut off (www's recordings stop at 8000 px) is the exception: the other image,
 *   when taller, is cut to its height first, so what lies below the cut is not counted (a page
 *   shorter than the cut still counts its missing part). Cut off means, in this order:
 *   --a-truncated / --b-truncated; capture.js's <png>.json "truncated"; a source export's
 *   capture.json beside the png (widths[w].file, "truncated"); a drop's manifest.json beside the
 *   png or one folder up (pages[].widths[w].png, its measurements' scrollHeight taller than the
 *   png). --no-cut keeps the padding. Output: "cut" {image, from, to, reason} or null,
 *   truncatedA / truncatedB (true, false or null when unknown); heightA / heightB stay the images'
 *   own heights.
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
 *   heightDiffRatio  |heightA - heightB| / max(heightA, heightB) of the images compared (cut)
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

const readJsonFile = (file) => {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    return null;
  }
};

/** A png's height from its header, or null (not a png). */
function pngHeight(file) {
  const fd = fs.openSync(file, 'r');
  try {
    const head = Buffer.alloc(24);
    fs.readSync(fd, head, 0, 24, 0);
    return head.readUInt32BE(0) === 0x89504e47 ? head.readUInt32BE(20) : null;
  } finally {
    fs.closeSync(fd);
  }
}

/**
 * Whether the capture in `file` is cut off, from its metadata: capture.js's <file>.json, a source
 * export's capture.json beside it, a drop's manifest.json beside it or one folder up.
 * @param {string} file the png (or jpeg)
 * @param {number} [height] its height in px (read from a png's header when not given)
 * @returns {boolean|null} null when no metadata names the file
 */
function readTruncated(file, height) {
  const own = readJsonFile(`${file}.json`);
  if (own && typeof own.truncated === 'boolean') return own.truncated;
  const dir = path.dirname(file);
  const name = path.basename(file);
  const cap = readJsonFile(path.join(dir, 'capture.json'));
  if (cap && cap.widths && typeof cap.widths === 'object') {
    const w = Object.values(cap.widths).find((x) => x && x.file && path.basename(x.file) === name);
    if (w && typeof w.truncated === 'boolean') return w.truncated;
  }
  const found = [dir, path.dirname(dir)].map((d) => [d, readJsonFile(path.join(d, 'manifest.json'))])
    .find(([, m]) => m && Array.isArray(m.pages));
  if (found) {
    const [root, manifest] = found;
    const rel = path.relative(root, file).split(path.sep).join('/');
    const w = manifest.pages.flatMap((p) => Object.values((p && p.widths) || {}))
      .find((x) => x && (x.png === rel || x.png === name));
    if (w && w.measurements) {
      const m = readJsonFile(path.join(root, w.measurements));
      if (m && Number.isFinite(m.scrollHeight)) {
        const h = Number.isFinite(height) ? height : pngHeight(file);
        if (Number.isFinite(h)) return m.scrollHeight > h + 1;
      }
    }
  }
  return null;
}

/** Copy of the top `height` rows of img. */
function cutRows(img, height) {
  const out = new PNG({ width: img.width, height });
  PNG.bitblt(img, out, 0, 0, img.width, height, 0, 0);
  return out;
}

/**
 * The taller image cut to the height of a cut-off one (inputs not modified).
 * @returns {{imgA, imgB, cut: null|{image: 'a'|'b', from: number, to: number, reason: string}}}
 */
function cutToRecording(imgA, imgB, { truncatedA, truncatedB } = {}) {
  if (truncatedA === true && imgB.height > imgA.height) {
    return {
      imgA,
      imgB: cutRows(imgB, imgA.height),
      cut: {
        image: 'b', from: imgB.height, to: imgA.height, reason: 'a cut off',
      },
    };
  }
  if (truncatedB === true && imgA.height > imgB.height) {
    return {
      imgA: cutRows(imgA, imgB.height),
      imgB,
      cut: {
        image: 'a', from: imgA.height, to: imgB.height, reason: 'b cut off',
      },
    };
  }
  return { imgA, imgB, cut: null };
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
  cut = true, truncatedA, truncatedB,
}) {
  const crop = parseCrop(cropA);
  const rawA = readImage(a);
  const imgA = cropImage(rawA, crop);
  const imgB = readImage(b);
  const boxes = masks.flatMap(loadMask);
  const known = (given, file, height) => (typeof given === 'boolean' ? given : readTruncated(file, height));
  const truncA = known(truncatedA, a, rawA.height);
  const truncB = known(truncatedB, b, imgB.height);
  const cutImgs = cut ? cutToRecording(imgA, imgB, { truncatedA: truncA, truncatedB: truncB })
    : { imgA, imgB, cut: null };
  const { result, diff } = comparePngs(cutImgs.imgA, cutImgs.imgB, {
    threshold, bandHeight, divergeThreshold, masks: boxes,
  });
  const full = {
    a: path.resolve(a),
    b: path.resolve(b),
    diff: path.resolve(out),
    maskFiles: masks.map((m) => path.resolve(m)),
    cropA: crop,
    ...result,
    heightA: imgA.height,
    heightB: imgB.height,
    truncatedA: truncA,
    truncatedB: truncB,
    cut: cutImgs.cut,
  };
  mkdirp(path.dirname(path.resolve(out)));
  fs.writeFileSync(out, PNG.sync.write(diff));
  writeJsonAtomic(`${out}.json`, full);
  return full;
}

module.exports = {
  compareImages,
  comparePngs,
  readImage,
  loadMask,
  parseCrop,
  cropImage,
  cutToRecording,
  readTruncated,
  DIVERGE_THRESHOLD,
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
    'a-truncated': { type: 'boolean' },
    'b-truncated': { type: 'boolean' },
    'no-cut': { type: 'boolean', default: false },
  }, ['a', 'b', 'out'], 'node tools/parity/compare.js --a src.png --b eds.png --out diff.png [--crop-a top=98,right=15] [--mask boxes.json ...] [--threshold 0.1] [--band 200] [--diverge 0.3] [--a-truncated] [--b-truncated] [--no-cut]');
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
      cut: !args['no-cut'],
      truncatedA: args['a-truncated'] ? true : undefined,
      truncatedB: args['b-truncated'] ? true : undefined,
    });
    const { bands, ...summary } = res;
    console.log(JSON.stringify(summary));
  } catch (e) {
    console.error(`compare failed: ${e.message}`);
    process.exit(1);
  }
}
