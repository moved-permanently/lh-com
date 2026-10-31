/* eslint-disable max-len */
/* Embeds loaded on click (scripts/media.js embedFor, buildEmbed): a Matterport tour and a
   Mynewsdesk newsroom are embeds behind a button (no consent layer of their own); YouTube and the
   in-flight entertainment widget as before (lazy iframes); Google Maps stays a link.
   Run: node --test test/*.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head><meta name="brand" content="cargo"><meta name="language" content="en"></head><body></body></html>');
window.location = {
  hostname: 'cargo.turnsthe.page', pathname: '/en/hangar', search: '', href: 'https://cargo.turnsthe.page/en/hangar', origin: 'https://cargo.turnsthe.page',
};
Object.defineProperty(window, 'origin', { value: 'https://cargo.turnsthe.page', configurable: true });
globalThis.window = window;
globalThis.document = document;
globalThis.Node = window.Node;
const { embedFor, buildEmbed, isEmbedLink } = await import('../scripts/media.js');

const link = (href, text = href, inParagraph = true) => {
  const a = document.createElement('a');
  a.href = href;
  a.textContent = text;
  if (inParagraph) {
    const p = document.createElement('p');
    p.append(a);
    document.body.append(p);
  }
  return a;
};

test('embedFor: Matterport tours and Mynewsdesk newsrooms, loaded on click; Google Maps no embed', () => {
  assert.deepEqual(embedFor('https://my.matterport.com/show/?m=SxQL3iGyoDo'), { type: 'matterport', src: 'https://my.matterport.com/show/?m=SxQL3iGyoDo&play=1', onClick: true });
  assert.deepEqual(embedFor('https://my.matterport.com/show?m=Ab12&qs=1'), { type: 'matterport', src: 'https://my.matterport.com/show/?m=Ab12&play=1', onClick: true });
  assert.deepEqual(embedFor('https://lufthansa-cargo-ag-com.mynewsdesk.com'), { type: 'mynewsdesk', src: 'https://lufthansa-cargo-ag-com.mynewsdesk.com/', onClick: true });
  assert.equal(embedFor('https://www.mynewsdesk.com/de/lufthansa-cargo/news').type, 'mynewsdesk');
  [
    'https://my.matterport.com/show/', 'https://my.matterport.com/show/?m=bad id', 'https://my.matterport.com/models/x', 'https://matterport.com/show/?m=Ab12',
    'http://lufthansa-cargo-ag-com.mynewsdesk.com', 'https://mynewsdesk.com.example.org/', 'https://www.google.com/maps?q=FRA', 'https://maps.google.com/?q=FRA', 'https://goo.gl/maps/x',
  ].forEach((h) => assert.equal(embedFor(h), null, h));
  // unchanged: YouTube and the in-flight entertainment widget load lazily, without onClick
  assert.equal(embedFor('https://youtu.be/xyz').onClick, undefined);
  assert.equal(embedFor('https://www.lufthansa-inflightentertainment.com/de/en/widgets/?id=1&type=movies&lang=en').onClick, undefined);
});

test('buildEmbed: a button with the link\'s text until the click, then the player (focused), once', () => {
  const a = link('https://my.matterport.com/show/?m=SxQL3iGyoDo', 'Start the virtual tour (Matterport)');
  assert.ok(isEmbedLink(a), 'a link alone in its paragraph');
  const el = buildEmbed(a);
  assert.equal(el.className, 'media-embed media-embed-matterport media-embed-on-click');
  assert.ok(el.querySelector('iframe') === null, 'nothing loaded before the click');
  const button = el.querySelector('button.media-embed-load');
  assert.equal(button.getAttribute('type'), 'button');
  assert.equal(button.textContent, 'Start the virtual tour (Matterport)');
  document.body.append(el);
  // linkedom tracks no focus: record the focus() call (never compare DOM nodes with assert.equal,
  // a failure's diff of two linkedom nodes takes gigabytes)
  let focused = null;
  const { focus } = window.HTMLElement.prototype;
  window.HTMLElement.prototype.focus = function recordFocus() { focused = this; };
  button.dispatchEvent(new window.Event('click'));
  const iframe = el.querySelector('iframe');
  assert.equal(iframe.getAttribute('src'), 'https://my.matterport.com/show/?m=SxQL3iGyoDo&play=1');
  assert.equal(iframe.getAttribute('title'), 'Start the virtual tour (Matterport)');
  assert.equal(iframe.getAttribute('allow'), 'fullscreen; xr-spatial-tracking');
  assert.equal(iframe.getAttribute('loading'), null, 'loaded at once on the click');
  assert.ok(el.querySelector('button') === null, 'no button');
  assert.ok(el.classList.contains('media-embed-loaded'));
  window.HTMLElement.prototype.focus = focus;
  assert.ok(focused === iframe, 'the player has the focus');
});

test('buildEmbed: a link whose text is its URL gets the type\'s label (the page\'s language)', () => {
  const news = buildEmbed(link('https://lufthansa-cargo-ag-com.mynewsdesk.com', 'https://lufthansa-cargo-ag-com.mynewsdesk.com'));
  assert.equal(news.querySelector('button').textContent, 'Show the newsroom');
  document.head.querySelector('meta[name="language"]').setAttribute('content', 'de');
  const tour = buildEmbed(link('https://my.matterport.com/show/?m=Ab12', 'https://my.matterport.com/show/?m=Ab12'));
  document.head.querySelector('meta[name="language"]').setAttribute('content', 'en');
  assert.equal(tour.querySelector('button').textContent, 'Virtuelle Tour starten');
});

test('YouTube as before: a lazy iframe at once, no button', () => {
  const el = buildEmbed(link('https://www.youtube.com/watch?v=abc123', 'Meal voucher'));
  assert.equal(el.className, 'media-embed media-embed-youtube');
  const iframe = el.querySelector('iframe');
  assert.equal(iframe.getAttribute('loading'), 'lazy');
  assert.match(iframe.getAttribute('src'), /^https:\/\/www\.youtube-nocookie\.com\/embed\/abc123/);
  assert.ok(el.querySelector('button') === null, 'no button');
});
