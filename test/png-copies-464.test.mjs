/* eslint-disable max-len, import/extensions */
/* The payment and social icons keep their PNG copies (brief 464, item 2). www's homepage links
   them as SVGs (/content/dam/lh/icons/payment/*.svg, social-media/*.svg, the Klarna badge and the
   Instagram logo, which is over the 40 KB preview limit); DA and live use the PNG copies
   /media-da/<md5 of the www URL>.png. postprocess-media (the import's media step) now writes those
   copies (tools/importer/png-copies/, index.json) for such an SVG instead of the SVG or a new
   rasterization; other SVGs as before.
   Run: node --max-old-space-size=256 --test test/png-copies-464.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pngCopyOf, PNG_COPIES } from '../tools/importer/png-copies.mjs';

test('the 13 icons of www\'s homepage have their copies', () => {
  assert.equal(Object.keys(PNG_COPIES).length, 13);
  Object.values(PNG_COPIES).forEach(({ key }) => assert.ok(fs.existsSync(new URL(`../tools/importer/png-copies/${key}.png`, import.meta.url))));
});

test('a known icon (www URL, relative or absolute): its copy, written into media-da', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'png-copies-'));
  assert.equal(pngCopyOf('https://www.lufthansa.com/content/dam/lh/icons/payment/mastercard.svg', dir), '/media-da/27a90bd12073b1a31490cb4f1fb6bec9.png');
  assert.ok(fs.existsSync(path.join(dir, '27a90bd12073b1a31490cb4f1fb6bec9.png')));
  assert.equal(pngCopyOf('/content/dam/lh/images/local_images/homepage/ig_logo_200x200%20(1).svg', dir), '/media-da/9e4b1f896c002aac7ffe3fbb8a686950.png');
  assert.equal(pngCopyOf('https://www.lufthansa.com/content/dam/lh/icons/other.svg', dir), null);
  assert.equal(pngCopyOf('https://www.example.com/content/dam/lh/icons/payment/mastercard.svg', dir), null);
});

test('postprocess-media uses the copies before measuring an SVG', () => {
  const src = fs.readFileSync(new URL('../tools/importer/postprocess-media.mjs', import.meta.url), 'utf8');
  assert.ok(src.includes("import { pngCopyOf } from './png-copies.mjs';"));
  assert.ok(src.includes("const copy = kind === 'static' || (kind === 'local' && /\\.svg$/i.test(ref.url)) ? pngCopyOf(ref.url, MEDIA_DIR, dryRun) : null;"));
});

test('a snapshot import\'s local copy of the SVG (/media-da/<name>.svg): recognised by its bytes', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'png-copies-'));
  fs.writeFileSync(path.join(dir, 'abc.svg'), fs.readFileSync(new URL('./fixtures/png-copies/visa.svg', import.meta.url)));
  assert.equal(pngCopyOf('/media-da/abc.svg', dir), '/media-da/1b373abbaab0b986c34b1d03407c4337.png');
  fs.writeFileSync(path.join(dir, 'other.svg'), '<svg xmlns="http://www.w3.org/2000/svg"/>');
  assert.equal(pngCopyOf('/media-da/other.svg', dir), null);
});
