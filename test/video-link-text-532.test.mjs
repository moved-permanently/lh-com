/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* The brief after 532, item 1c (harness-pass-cargo.md, brief 536: parity with www): the collapse keeps a video link's
   text as it is. collapseVideos used to give a link whose text is its URL a readable text (the poster's alt, else the
   file name), so Cargo's play buttons would have read "Lufthansa Addon Services Video 17 03 2026" instead of the player's
   own "Play video". The settings still go to their carriers (theme, #size, background-video, mobile-video).
   Run: node --max-old-space-size=512 --test test/video-link-text-532.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { collapseHtml } from '../tools/importer/marker-collapse.mjs';
import { lossProblems } from '../tools/importer/collapse-loss-check.mjs';

const VIDEO_URL = 'https://static.lufthansa-cargo.com/videos/Lufthansa_Addon-Services_Video_17-03-2026.mp4';
const run = (html, brand = 'cargo', path = '/de/add-on-services/smartuld') => collapseHtml(html, {
  path, brand, parse: parseHTML, force: true,
});

test('Cargo\'s video links keep their text (the URL), the settings go', () => {
  const doc = `<div><h1>SmartULD</h1><p><a href="${VIDEO_URL}">${VIDEO_URL}</a> {controls round-play-button}</p></div>`;
  const r = run(doc);
  assert.equal(r.html, `<div><h1>SmartULD</h1><p><a href="${VIDEO_URL}">${VIDEO_URL}</a></p></div>`);
  assert.equal(r.stats.theme.video, 1);
  assert.deepEqual(lossProblems(doc, r.html), []);
});

test('every brand: a poster\'s alt or the file name no longer replaces the text; the carriers stay', () => {
  const pic = '<picture><img src="/media_1.jpg" alt="Lisbon at dusk"></picture>';
  const bg = run(`<div><p>${pic}</p><p><a href="/media/v.mp4#t=10">/media/v.mp4</a> {autoplay muted loop}</p></div>`, 'lufthansa', '/de/en/x').html;
  assert.equal(bg, `<div><p>${pic}</p><p><a href="/media/v.mp4#t=10&amp;background">/media/v.mp4</a></p></div>`);
  const header = run('<div><div class="article-header"><div><div><p><a href="/media/en_header.mp4">/media/en_header.mp4</a> {mobile}</p></div></div></div></div>', 'lufthansa', '/de/en/articles/x').html;
  assert.equal(header, '<div><div class="article-header mobile-video"><div><div><p><a href="/media/en_header.mp4">/media/en_header.mp4</a></p></div></div></div></div>');
  const sized = run('<div><p><a href="/v.mp4">/v.mp4</a> {controls round-play-button size-640x360}</p></div>', 'b2b', '/de/en/x').html;
  assert.equal(sized, '<div><p><a href="/v.mp4#size=640x360">/v.mp4</a></p></div>');
});
