/* eslint-disable max-len */
/* video-banner (blocks/video-banner, TAP; R4-9, brief 407): www.flytap.com's YouTube banner
   (Economy Prime, For Life): www's poster in the 380 px frame, the title over it and a play
   button (www's text), YouTube loaded only on play (youtube-nocookie.com, autoplay), the poster
   and the text then out of the way and the player focused; without a poster the frame dark.
   Run: node --max-old-space-size=512 --test test/tap-video-banner.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html lang="pt-PT"><head></head><body></body></html>');
window.hlx = { codeBasePath: '' };
window.location = {
  hostname: 'main--lh-tap--moved-permanently.aem.page', pathname: '/pt-pt/a-bordo/economy-prime', search: '', replace: () => {}, href: 'https://main--lh-tap--moved-permanently.aem.page/pt-pt/a-bordo/economy-prime', origin: 'https://main--lh-tap--moved-permanently.aem.page',
};
window.origin = window.location.origin;
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
globalThis.window = window;
globalThis.document = document;
const { default: decorate } = await import('../blocks/video-banner/video-banner.js');

const blockOf = (cells) => {
  const block = document.createElement('div');
  block.className = 'video-banner';
  block.innerHTML = `<div>${cells.map((c) => `<div>${c}</div>`).join('')}</div>`;
  document.body.replaceChildren(block);
  return block;
};
const poster = '<picture><img src="./media_1.jpg" alt=""></picture>';
const text = '<h3>TAP Economy Prime</h3><p><a href="https://youtu.be/LelHTPyM6-c">Ver vídeo</a></p>';

test('the poster in the frame, the title over it, the play button with www\'s text; nothing from YouTube before play', async () => {
  const block = blockOf([poster, text]);
  await decorate(block);
  const frame = block.querySelector('.video-banner-frame');
  assert.ok(frame);
  assert.ok(frame.querySelector('.video-banner-poster img'), 'the poster');
  assert.equal(frame.querySelector('.video-banner-content h3').textContent, 'TAP Economy Prime');
  const play = frame.querySelector('button.video-banner-play');
  assert.equal(play.querySelector('.video-banner-play-label').textContent, 'Ver vídeo');
  assert.equal(play.querySelector('.video-banner-play-icon').getAttribute('aria-hidden'), 'true');
  assert.equal(block.querySelector('iframe'), null, 'no player yet');
  assert.equal(block.querySelector('a'), null, 'the link becomes the button');
  assert.ok(!block.classList.contains('video-banner-no-poster'));
});

test('play: the player (youtube-nocookie, autoplay) in the frame, the poster and the text away, the player focused', async () => {
  const block = blockOf([poster, text]);
  await decorate(block);
  block.querySelector('button.video-banner-play').dispatchEvent(new window.Event('click'));
  const iframe = block.querySelector('.video-banner-frame iframe');
  assert.ok(iframe, 'the player');
  const src = new URL(iframe.getAttribute('src'));
  assert.equal(src.hostname, 'www.youtube-nocookie.com');
  assert.equal(src.pathname, '/embed/LelHTPyM6-c');
  assert.equal(src.searchParams.get('autoplay'), '1');
  assert.equal(iframe.getAttribute('title'), 'TAP Economy Prime');
  assert.match(iframe.getAttribute('allow'), /autoplay/);
  assert.ok(block.classList.contains('video-banner-playing'));
  assert.equal(block.querySelector('.video-banner-poster'), null);
  assert.equal(block.querySelector('.video-banner-content'), null);
});

test('without a poster (For Life): the dark frame, the title and the button', async () => {
  const block = blockOf([text]);
  await decorate(block);
  assert.ok(block.classList.contains('video-banner-no-poster'));
  assert.equal(block.querySelector('.video-banner-poster'), null);
  assert.ok(block.querySelector('button.video-banner-play'));
});

test('a link that is no YouTube video: the block as authored', async () => {
  const block = blockOf([poster, '<h3>X</h3><p><a href="https://www.flytap.com/">Ver</a></p>']);
  await decorate(block);
  assert.equal(block.querySelector('.video-banner-frame'), null);
  assert.ok(block.querySelector('a'));
});

test('the look (video-banner.css): the 380 px frame with 32 px corners, the title 32 / 38.4 white, the button a white outline pill', () => {
  const css = fs.readFileSync(new URL('../blocks/video-banner/video-banner.css', import.meta.url), 'utf8');
  assert.match(css, /\.video-banner \.video-banner-frame \{[^}]*position: relative;[^}]*height: 380px;[^}]*overflow: hidden;[^}]*border-radius: 32px;/);
  assert.match(css, /\.video-banner \.video-banner-content h3 \{[^}]*color: #fff;[^}]*font-size: 32px;[^}]*line-height: 1\.2;/);
  assert.match(css, /\.video-banner \.video-banner-play \{[^}]*min-height: 40px;[^}]*padding: 0 24px;[^}]*border: 1px solid #fff;[^}]*border-radius: 999px;[^}]*background: transparent;[^}]*color: #fff;/);
  css.replace(/\/\*[\s\S]*?\*\//g, '').split('}').map((r) => r.split('{')[0].trim()).filter((sel) => sel && !sel.startsWith('@'))
    .forEach((sel) => sel.split(/,(?![^(]*\))/).forEach((one) => assert.equal(one.trim().startsWith('.video-banner'), true, one)));
});
