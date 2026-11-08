/* eslint-disable max-len, import/no-extraneous-dependencies, import/no-relative-packages, import/extensions -- dev tooling; lh-edge's model */
/* The brief after 493, item 1: ema-adobe's video sizes (e650caa6: tools/importer/video-sizes.mjs, the viewer parsers add
   "size-WxH" to a video's settings marker, "{controls round-play-button size-1920x1080}"). The shared list
   (scripts/style-markers.js) did not know the token, so lh-edge's app JSON (stripStyleMarkers) and the loc marker check
   would have shown the whole marker as text. Now: the token is part of the video marker everywhere (the same goes for the
   columns-media parser's "{cell-half-start}", "{cell-half-end}", "{cell-three-quarters}" picture marks).
   Run: node --max-old-space-size=256 --test test/video-size-token-494.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  stripStyleMarkers, stripStyleMarkersHtml, isOnlyStyleMarkers, VIDEO_MARKER, VIDEO_SIZE,
} from '../scripts/style-markers.js';
import { collectMarkers, compareMarkers } from '../tools/loc/marker-check.mjs';
import { webModel, renderWeb } from '../tools/workers/lh-edge/src/sdui-web.js';

test('the shared list: the size token in a video marker, alone or with settings; other braces stay', () => {
  assert.ok(new RegExp(`^${VIDEO_SIZE}$`).test('size-1920x1080'));
  assert.equal(stripStyleMarkers('Play the film {controls round-play-button size-1920x1080}'), 'Play the film');
  assert.equal(stripStyleMarkers('/content/dam/v.mp4 {autoplay muted size-640x360}'), '/content/dam/v.mp4');
  assert.equal(stripStyleMarkers('Film {size-1280x720}'), 'Film');
  assert.ok(isOnlyStyleMarkers('{autoplay muted loop size-1920x823}'));
  assert.equal(stripStyleMarkersHtml('<p><a href="/v.mp4">Film</a> {controls size-1920x1080}</p>'), '<p><a href="/v.mp4">Film</a></p>');
  assert.equal(VIDEO_MARKER.exec(' {controls round-play-button size-1920x1080}')[1], 'controls round-play-button size-1920x1080');
  assert.equal(stripStyleMarkers('A picture {cell-half-start}'), 'A picture');
  assert.equal(stripStyleMarkers('Sizes {1920x1080}'), 'Sizes {1920x1080}', 'not a marker');
  assert.equal(stripStyleMarkers('From {origin}'), 'From {origin}');
});

test('the loc marker check reads a video marker (size included): a changed or lost one is listed', () => {
  const src = '<main><div><p><picture><img src="/p.jpg" alt=""></picture></p><p><a href="/v.mp4">Film</a> {controls round-play-button size-1920x1080}</p></div></main>';
  const read = collectMarkers(src).filter((m) => m.read);
  assert.deepEqual(read.map((m) => `${m.read.kind}:${m.read.marker}`), ['video:controls round-play-button size-1920x1080']);
  const translated = src.replace('size-1920x1080', 'Größe-1920x1080');
  const r = compareMarkers(src, translated);
  assert.ok(JSON.stringify(r).includes('size-1920x1080'), 'the changed marker is listed');
});

test('lh-edge\'s app JSON: no size token and no marker text', () => {
  const page = '/de/en/articles/explore-the-world/x';
  const html = '<html><head></head><body><main><div><p>Text before {copytext-small}</p><p><a href="/content/dam/v.mp4">Watch the film</a> {controls round-play-button size-1920x1080}</p><p>After</p></div></main></body></html>';
  const json = JSON.stringify(renderWeb(webModel(html, page), {
    fullPath: `/content/lh/markets${page}`, page, version: 'v2', host: 'lh-edge.example', title: 't', lang: 'en',
  }));
  assert.ok(!/size-\d|round-play-button|\{(?:controls|copytext)/.test(json), json.slice(0, 400));
});
