/* eslint-disable max-len */
/* Standing order 49, item 2: a sized player (a size-WxH token, e.g. the 16:9 player of a 1920x823 poster) gets a muted,
   never-played still of its video under the contained poster, as www's video.js (preload metadata) paints the first
   frame there; so the letterbox shows the scene, not black bars. Only for a video file on our own host (www's DAM links on
   the language versions would load from www with every page view). Gate: allegris-new-york 1440 9.04 -> 7.68 % against
   lh-parity-015; every recorded page-width with a sized player closer or within 0.5; the census of every served document
   with a video on lh-com and the brand sites (2,708 page-widths, with and without in the same load) found nothing broken.
   Run: node --test test/media-video-frame-so49.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const js = fs.readFileSync(new URL('../scripts/media.js', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../styles/media.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('a sized player on our own host gets a muted still under its poster', () => {
  assert.ok(js.includes("if (size && new URL(src, window.location.href).origin === window.location.origin) {"));
  assert.ok(js.includes("frame.className = 'media-video-frame';"));
  assert.ok(js.includes("frame.preload = 'metadata';"));
  assert.ok(js.includes('frame.muted = true;'));
  assert.ok(js.includes('wrapper.prepend(frame);'));
  assert.ok(!/frame\.(autoplay|play\()/.test(js), 'the still is never played');
});

test('the still fills the player behind the contained poster', () => {
  assert.ok(css.includes('.media-video.media-video-sized > .media-video-frame { position: absolute; inset: 0; width: 100%; object-fit: cover; }'));
  assert.ok(css.includes('.media-video.media-video-sized:has(> .media-video-frame) > picture { position: relative; }'));
  assert.ok(css.includes('.media-video.media-video-sized { aspect-ratio: var(--media-video-ratio); background-color: #000; }'));
});
