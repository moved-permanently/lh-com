/* eslint-disable max-len */
/* Frames with a title of their own (brief 432, the SWISS accessibility pass: axe frame-title-unique
   on the magazine's "SWISS behind the wings", 18 YouTube embeds all titled "YouTube-Video").
   scripts/media.js buildEmbed titles an embed whose link text is its URL with the type's label; a
   second such embed of the same type on the page gets the label and its number ("YouTube video 2"),
   the first keeps the label alone (a page with one embed as before); an embed with link text keeps
   its text. Brand-neutral.
   Run: node --max-old-space-size=512 --test test/media-embed-titles.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head><meta name="language" content="en"></head><body></body></html>');
window.location = {
  hostname: 'main--lh-swiss--moved-permanently.aem.page', pathname: '/ch/en/fly/x', search: '', href: 'https://main--lh-swiss--moved-permanently.aem.page/ch/en/fly/x', origin: 'https://main--lh-swiss--moved-permanently.aem.page',
};
Object.defineProperty(window, 'origin', { value: 'https://main--lh-swiss--moved-permanently.aem.page', configurable: true });
globalThis.window = window;
globalThis.document = document;
globalThis.Node = window.Node;
const { buildEmbed } = await import('../scripts/media.js');

// an embed link in its paragraph, replaced by its player as the blocks do
const place = (href, text = href) => {
  const p = document.createElement('p');
  p.innerHTML = `<a href="${href}">${text}</a>`;
  document.body.append(p);
  const el = buildEmbed(p.querySelector('a'));
  p.replaceWith(el);
  return el.querySelector('iframe').getAttribute('title');
};

test('URL-text embeds of one type: the label, then the label and its number', () => {
  const titles = ['abc111', 'abc222', 'abc333'].map((id) => place(`https://www.youtube.com/watch?v=${id}`));
  assert.deepEqual(titles, ['YouTube video', 'YouTube video 2', 'YouTube video 3']);
});

test('an embed with link text keeps its text; another type counts on its own', () => {
  assert.equal(place('https://www.youtube.com/watch?v=abc444', 'Our new cabin'), 'Our new cabin');
  assert.equal(place('https://www.youtube.com/watch?v=abc555'), 'YouTube video 4');
  assert.equal(place('https://box.media-carrier.de/home?b=1'), 'eJournals newsstand');
});
