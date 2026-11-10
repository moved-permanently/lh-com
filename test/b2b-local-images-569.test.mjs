/* eslint-disable max-len, import/extensions -- dev tooling */
/* The brief after d9cf2340, item 4: lhg-history-alliances' airline tails. www shows SVGs
   (/content/dam/b2b/100y_webhub/04-joint-ventures/02_Deepening ties-*_Teaser-1440x512.svg) that Edge Delivery refuses
   (b2b-import.mjs LOCAL_IMAGES: a PNG in DA instead). Each SVG only wraps one picture, a 1440 x 512 PNG with a
   transparent background (b2b-studio's capture, content-sites/lh-b2b/assets/svg); DA's PNGs were renderings on white
   (RGB, no alpha), the white boxes on the grey band. The media file is now the picture the SVG wraps, as www shows it.
   Run: node --test test/b2b-local-images-569.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { embeddedRaster, writeLocalImages, LOCAL_IMAGES } from '../tools/importer/b2b-import.mjs';

// a 2 x 1 RGBA PNG: one transparent pixel, one red
const chunk = (type, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const c = Buffer.alloc(4); c.writeUInt32BE(zlib.crc32(td)); return Buffer.concat([len, td, c]); };
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(2, 0); ihdr.writeUInt32BE(1, 4); ihdr[8] = 8; ihdr[9] = 6;
const PNG = Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(Buffer.from([0, 255, 255, 255, 0, 255, 0, 0, 255]))), chunk('IEND', Buffer.alloc(0))]);
const wrap = (b64, extra = '') => `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 345.6 122.88"><image width="1440" height="512" transform="scale(.24)" xlink:href="data:image/png;base64,${b64}"/>${extra}</svg>`;

test('an SVG that only wraps one picture gives that picture; one that draws gives none', () => {
  assert.deepEqual(embeddedRaster(wrap(PNG.toString('base64'))), PNG);
  assert.equal(embeddedRaster(wrap(PNG.toString('base64'), '<path d="M0 0h10v10z"/>')), null, 'it draws shapes too');
  assert.equal(embeddedRaster('<svg><path d="M0 0h10v10z"/></svg>'), null);
});

test('LOCAL_IMAGES\' media files written from the capture\'s SVGs, the others left as they are', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'b2b-local-images-'));
  const assets = path.join(dir, 'assets/svg');
  const content = path.join(dir, 'content');
  fs.mkdirSync(assets, { recursive: true });
  const [www, media] = Object.entries(LOCAL_IMAGES).find(([k]) => k.includes('2010'));
  fs.writeFileSync(path.join(assets, path.basename(www)), wrap(PNG.toString('base64')));
  fs.mkdirSync(path.dirname(path.join(content, media)), { recursive: true });
  fs.writeFileSync(path.join(content, media), 'a rendering on white');
  const written = writeLocalImages(assets, content);
  assert.deepEqual(written, [media]);
  assert.deepEqual(fs.readFileSync(path.join(content, media)), PNG);
  assert.deepEqual(writeLocalImages(assets, content), [], 'the same file again: nothing to write');
  fs.rmSync(dir, { recursive: true, force: true });
});
