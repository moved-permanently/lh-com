/* eslint-disable max-len, import/extensions */
/* switch-dam-media and media.lufthansa.com (brief 464, item 3): the host is gone (NXDOMAIN); 102
   lh-com documents linked its videos (https://media.lufthansa.com/content/dam/...mp4). Such a link
   is now treated as www's: the asset path /content/dam/..., switched to the site's own copy
   (/content/dam/<dam-path.js name>, edsDamPath), and a link text that was the address becomes the
   copy's path too (as the harness switched them). Other hosts stay.
   Run: node --max-old-space-size=256 --test test/dam-video-hosts-464.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { VIDEO_LINK, videoAsset, switchedText } from '../tools/importer/dam-video-links.mjs';
import { edsDamPath } from '../scripts/dam-path.js';

const links = (html) => [...html.matchAll(VIDEO_LINK)].map((m) => videoAsset(m[1]));

test('www\'s and media.lufthansa.com\'s video links: the same asset path', () => {
  const html = '<a href="https://www.lufthansa.com/content/dam/video/a.mp4">x</a> <a href="https://media.lufthansa.com/content/dam/video/c3/b%20c.mp4">y</a> <a href="https://www.example.com/content/dam/video/d.mp4">z</a> <a href="https://media.lufthansa.com/other/e.mp4">w</a>';
  assert.deepEqual(links(html), ['/content/dam/video/a.mp4', '/content/dam/video/c3/b c.mp4']);
});

test('a link text that was the address becomes the copy\'s path; other texts stay', () => {
  const asset = '/content/dam/video/c3/b c.mp4';
  const own = edsDamPath(asset);
  assert.equal(switchedText('https://media.lufthansa.com/content/dam/video/c3/b%20c.mp4', 'https://media.lufthansa.com/content/dam/video/c3/b%20c.mp4', own), own);
  assert.equal(switchedText('/content/dam/video/c3/b%20c.mp4', 'https://www.lufthansa.com/content/dam/video/c3/b%20c.mp4', own), own);
  assert.equal(switchedText('Watch the video', 'https://media.lufthansa.com/content/dam/video/c3/b%20c.mp4', own), 'Watch the video');
});

test('switch-dam-media reads the links with the module', () => {
  const src = fs.readFileSync(new URL('../tools/importer/switch-dam-media.mjs', import.meta.url), 'utf8');
  assert.ok(src.includes("import { VIDEO_LINK, videoAsset, switchedText } from './dam-video-links.mjs';"));
  assert.ok(!src.includes('const WWW_VIDEO = '));
});
