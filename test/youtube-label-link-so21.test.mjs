/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* Standing order 21 (2026-11-14), item 4: /de/en/onboard-delights at 390 (the ranking: +143 px at the grey band).
   "To the interview" (https://youtu.be/XV6SYetTihY, a secondary button) became a YouTube player under the text; on www
   it is the button. electronic-devices-and-batteries' "Watch IATA video" (youtube.com/watch) is a link on www too (a
   maui-navigation-link, no iframe on the page). The importer writes www's YouTube iframes as links whose text is their
   address (parsers/media-nodes.js, embed.js: https://www.youtube-nocookie.com/embed/{id}), so in running content (text cells,
   accordion panels: decorateMedia) a YouTube link is a player only when its text is its address. A media cell's lone
   labelled link stays the player (SWISS's cards, test/cards-teaser-video). electronic-devices' link is default content,
   a link already. Census of the 9,912 published copies: labelled
   YouTube links on onboard-delights (4) and electronic-devices-and-batteries (8 language versions); every other YouTube
   link has its address as its text.
   Run: node --max-old-space-size=256 --test test/youtube-label-link-so21.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head><meta name="language" content="en"></head><body></body></html>');
window.location = {
  hostname: 'lufthansa.turnsthe.page', pathname: '/de/en/onboard-delights', search: '', href: 'https://lufthansa.turnsthe.page/de/en/onboard-delights', origin: 'https://lufthansa.turnsthe.page',
};
Object.defineProperty(window, 'origin', { value: 'https://lufthansa.turnsthe.page', configurable: true });
globalThis.window = window;
globalThis.document = document;
globalThis.Node = window.Node;
const { decorateMedia } = await import('../scripts/media.js');

const cell = (html) => {
  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.append(div);
  return div;
};

test('running content: a labelled YouTube link (www\'s button) stays a link', () => {
  const c = cell('<p>Learn more in the interview.</p><p class="button-container"><a class="button secondary" href="https://youtu.be/XV6SYetTihY">To the interview</a></p>');
  decorateMedia(c); // the DOM changes are synchronous; the media styles never load under linkedom
  assert.equal(c.querySelector('iframe, .media-embed'), null);
  assert.equal(c.querySelector('a').textContent, 'To the interview');
});

test('running content: a YouTube link whose text is its address is the player (the importer\'s iframes)', () => {
  const c = cell('<p>Text before</p><p><a href="https://www.youtube-nocookie.com/embed/GvGSbDmtvJU">https://www.youtube-nocookie.com/embed/GvGSbDmtvJU</a></p>');
  decorateMedia(c); // the DOM changes are synchronous; the media styles never load under linkedom
  assert.ok(c.querySelector('[class*="media-embed"]'), c.innerHTML.slice(0, 200));
});
