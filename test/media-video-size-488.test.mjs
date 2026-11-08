/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* Brief 488 item 3: www's video viewer (video.js, vjs-fluid) takes the video's own size before the
   video loads; ours took the poster's (allegris-premium-economy-san-diego: a 1920x823 poster, the
   player 141 px short at 1440). tools/importer/video-sizes.mjs reads each viewer video's width and
   height from the file's MP4 header (tools/importer/mp4-size.mjs: range requests on the site's own
   copy, or a local copy) into tools/importer/parsers/video-sizes.js; the parsers add "size-WxH" to
   the video's settings marker; scripts/media.js sets the player's aspect from it and styles/media.css
   draws it black with the poster contained, as www.
   Run: node --test test/media-video-size-488.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';
import { mp4SizeOf, sizeInMoov } from '../tools/importer/mp4-size.mjs';

const { viewerNodes, videoSizeToken } = await import('../tools/importer/parsers/media-nodes.js');
const { default: VIDEO_SIZES } = await import('../tools/importer/parsers/video-sizes.js');

// a minimal MP4: ftyp, then moov > trak > tkhd (version 0) with the given matrix and size
function mp4(width, height, matrix = [1, 0, 0, 1]) {
  const box = (type, body) => {
    const b = Buffer.alloc(8 + body.length);
    b.writeUInt32BE(8 + body.length, 0);
    b.write(type, 4, 'latin1');
    body.copy(b, 8);
    return b;
  };
  const tkhd = Buffer.alloc(84);
  // version/flags 4, created 4, modified 4, track id 4, reserved 4, duration 4, reserved 8,
  // layer 2, group 2, volume 2, reserved 2, matrix 36, width 4, height 4
  const m = 4 + 4 + 4 + 4 + 4 + 4 + 8 + 2 + 2 + 2 + 2;
  tkhd.writeInt32BE(matrix[0] * 65536, m);
  tkhd.writeInt32BE(matrix[1] * 65536, m + 4);
  tkhd.writeInt32BE(matrix[2] * 65536, m + 12);
  tkhd.writeInt32BE(matrix[3] * 65536, m + 16);
  tkhd.writeUInt32BE(width * 65536, m + 36);
  tkhd.writeUInt32BE(height * 65536, m + 40);
  const audio = box('trak', box('tkhd', Buffer.alloc(84)));
  return Buffer.concat([box('ftyp', Buffer.from('isom0000')), box('mdat', Buffer.alloc(64)), box('moov', Buffer.concat([audio, box('trak', box('tkhd', tkhd))]))]);
}
const reader = (buf) => async (start, end) => ({ buf: buf.subarray(start, end + 1), total: buf.length });

test('mp4-size: the video track\'s size from moov > trak > tkhd, after other boxes and a track without a size', async () => {
  assert.deepEqual(await mp4SizeOf(reader(mp4(1920, 1080))), { width: 1920, height: 1080 });
  assert.deepEqual(await mp4SizeOf(reader(mp4(1920, 1150))), { width: 1920, height: 1150 });
});

test('mp4-size: a 90 degree matrix (a phone video recorded upright) swaps width and height', async () => {
  assert.deepEqual(await mp4SizeOf(reader(mp4(1920, 1080, [0, 1, -1, 0]))), { width: 1080, height: 1920 });
  assert.equal(sizeInMoov(Buffer.alloc(8)), null);
});

test('the sizes read from the files: the two Insights articles\' videos are 16:9', () => {
  assert.deepEqual(VIDEO_SIZES['/content/dam/video/c3/art-design-spain/lh_art_design_san_diego_diego_blanco_60sec.mp4'], [1920, 1080]);
  assert.ok(Object.keys(VIDEO_SIZES).length >= 40);
  assert.equal(videoSizeToken('https://www.lufthansa.com/content/dam/video/c3/art-design-spain/lh_art_design_san_diego_diego_blanco_60sec.mp4'), 'size-1920x1080');
  assert.equal(videoSizeToken('/content/dam/not/read/yet.mp4'), '');
});

test('the parser writes the size into the viewer\'s settings marker', () => {
  const { document } = parseHTML('<html><body><div class="videoViewer event"><div class="dcep-video-viewer" data-dcep=\'{"videoSrc": "/content/dam/video/c3/art-design-spain/lh_art_design_san_diego_diego_blanco_60sec.mp4", "thumbnailSrc": "/content/dam/p.jpg", "alternativeText": "Diego Blanco"}\'></div></div></body></html>');
  const nodes = viewerNodes(document.querySelector('.videoViewer'), document);
  const p = nodes.find((n) => n.tagName === 'P');
  assert.match(p.textContent, /\{controls round-play-button size-1920x1080\}$/);
});

test('media.js reads the size and sets the player\'s aspect; media.css draws it as www\'s player', () => {
  const js = fs.readFileSync('scripts/media.js', 'utf8');
  assert.ok(js.includes('|size-\\\\d{2,5}x\\\\d{2,5})`'), 'the marker takes a size token');
  assert.match(js, /wrapper\.classList\.add\('media-video-sized'\);\s*wrapper\.style\.setProperty\('--media-video-ratio', `\$\{size\[1\]\} \/ \$\{size\[2\]\}`\);/);
  const css = fs.readFileSync('styles/media.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
  assert.ok(css.includes('.media-video.media-video-sized { aspect-ratio: var(--media-video-ratio); background-color: #000; }'));
  assert.ok(css.includes('.media-video.media-video-sized :is(picture, img, video) { height: 100%; object-fit: contain; }'));
});
