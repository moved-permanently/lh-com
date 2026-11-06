/* eslint-disable max-len */
/* cards-teaser (blocks/cards-teaser): a row whose first cell is a video's link alone in its
   paragraph (brief 437, row 31: SWISS's aside video teasers, www's a.teaser.card with a
   .video-player) shows the player as the card's media (scripts/media.js buildEmbed, the link's
   text its title), the title and text below; rows with a picture, and a link elsewhere in the
   card, as before. Brand-neutral. Run: node --max-old-space-size=256 --test test/cards-teaser-video.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head><meta name="brand" content="swiss"><meta name="language" content="en"></head><body></body></html>');
window.hlx = { codeBasePath: '' };
window.location = {
  hostname: 'main--lh-swiss--moved-permanently.aem.page', pathname: '/ch/en/fly/on-board/travel-classes/swiss-premium-economy', search: '', replace: () => {}, href: 'https://main--lh-swiss--moved-permanently.aem.page/ch/en/fly/on-board/travel-classes/swiss-premium-economy', origin: 'https://main--lh-swiss--moved-permanently.aem.page',
};
window.origin = window.location.origin;
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
globalThis.window = window;
globalThis.document = document;
globalThis.Node = window.Node;
const { default: decorate } = await import('../blocks/cards-teaser/cards-teaser.js');

const blockOf = (...rows) => {
  const block = document.createElement('div');
  block.className = 'cards-teaser';
  block.innerHTML = rows.join('');
  document.body.replaceChildren(block);
  return block;
};
const VIDEO = '<div><div><p><a href="https://www.youtube.com/watch?v=JMEaiuOKtyQ">SWISS Premium Economy in detail</a></p></div><div><h4>SWISS Premium Economy in detail</h4></div></div>';

test('a video link alone in the first cell: the player as the card\'s media, titled by the link text', async () => {
  const block = blockOf(VIDEO);
  await decorate(block);
  const li = block.querySelector('li');
  const iframe = li.querySelector(':scope > .cards-teaser-image .media-embed-youtube iframe');
  assert.ok(iframe !== null, 'the player in the media');
  assert.match(iframe.getAttribute('src'), /youtube-nocookie\.com\/embed\/JMEaiuOKtyQ/);
  assert.equal(iframe.getAttribute('title'), 'SWISS Premium Economy in detail');
  assert.equal(li.classList.contains('cards-teaser-text-only'), false);
  assert.equal(li.querySelector('.cards-teaser-body a'), null, 'no link left in the body');
  assert.equal(li.querySelector('.cards-teaser-title').textContent.trim(), 'SWISS Premium Economy in detail');
});

test('a picture row, and a video link in the body (a CTA), as before', async () => {
  const block = blockOf(
    '<div><div><picture><img src="/media_1.jpg" alt=""></picture></div><div><h4>Explore</h4><p><a href="https://www.youtube.com/watch?v=abc">Watch the film</a></p></div></div>',
  );
  await decorate(block);
  const li = block.querySelector('li');
  assert.ok(li.querySelector('.cards-teaser-image img') !== null);
  assert.equal(li.querySelector('iframe'), null, 'a link in the body stays a link');
  assert.equal(li.querySelector('.cards-teaser-cta a').getAttribute('href'), 'https://www.youtube.com/watch?v=abc');
});
