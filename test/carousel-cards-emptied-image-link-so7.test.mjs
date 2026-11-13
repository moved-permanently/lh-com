/* eslint-disable max-len, class-methods-use-this */
/* Standing order 7 of 2026-11-12, item 3 (the Group for Business ranking): Allegris' start-of-booking pages (6 of the
   86 recorded B2B pages: de/de, de/en, xx/de, corporates and intermediaries) end with two cards whose picture is a
   link (<a href><picture></a>) to the page the title and the text link to as well. The block moves the picture into
   the card's image and kept the link, now empty, as a paragraph of the body: the CTA class gave it the arrow, an
   arrow row 24 px tall with 32 px under it above each title (www: the whole card is one link, the title right under
   the image). A link the picture left empty, whose page another link of the card with text goes to, is dropped; a
   card whose picture link is its only link keeps that link. Brand-neutral (every brand's carousel-cards).
   Run: node --max-old-space-size=512 --test test/carousel-cards-emptied-image-link-so7.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html lang="en"><head></head><body><main></main></body></html>');
window.location = {
  hostname: 'main--lh-b2b--moved-permanently.aem.page', pathname: '/de/en/allegris/intermediaries-start-of-booking', search: '', hash: '', href: 'https://main--lh-b2b--moved-permanently.aem.page/de/en/allegris/intermediaries-start-of-booking', origin: 'https://main--lh-b2b--moved-permanently.aem.page',
};
Object.defineProperty(window, 'origin', { value: 'https://main--lh-b2b--moved-permanently.aem.page', configurable: true });
window.matchMedia = () => ({ matches: false, addEventListener() {}, addListener() {} });
globalThis.window = window;
globalThis.document = document;
globalThis.Node = window.Node;
globalThis.ResizeObserver = class { observe() {} };
globalThis.requestAnimationFrame = (fn) => fn();
globalThis.cancelAnimationFrame = () => {};
globalThis.getComputedStyle = () => ({ columnGap: '20px' });
window.getComputedStyle = globalThis.getComputedStyle;
const { default: decorate } = await import('../blocks/carousel-cards/carousel-cards.js');

const pic = '<picture><img src="./media_1.jpg?width=750&format=jpg" alt="" width="1440" height="960"></picture>';
const card = (imgHref, texts) => `<div><div><p><a href="${imgHref}">${pic}</a></p></div><div>${texts}</div></div>`;
const run = async (rows) => {
  const block = document.createElement('div');
  block.className = 'carousel-cards grid two-up';
  block.innerHTML = rows.join('');
  document.querySelector('main').replaceChildren(block);
  await decorate(block);
  return block;
};
const emptyParas = (block) => [...block.querySelectorAll('.carousel-cards-body > p')].filter((p) => !p.textContent.trim() && !p.querySelector('img, picture')).length;

test('a picture link the title and the text link to as well: no empty CTA paragraph above the title', async () => {
  const block = await run([
    card('https://theperfectmatch-lufthansagroup.com/gb/en/intermediaries/', '<h4><a href="https://theperfectmatch-lufthansagroup.com/gb/en/intermediaries/">Lufthansa Allegris for travel agencies</a></h4><p><a href="https://theperfectmatch-lufthansagroup.com/gb/en/intermediaries/">Discover the new Lufthansa travel experience now.</a></p>'),
    card('/content/dam/b2b/lufthansa-allegris/brochure-en.pdf', '<h4><a href="/content/dam/b2b/lufthansa-allegris/brochure-en.pdf">Brochure to download</a></h4><p><a href="/content/dam/b2b/lufthansa-allegris/brochure-en.pdf">The brochure (PDF).</a></p>'),
  ]);
  assert.ok(emptyParas(block) === 0, 'no empty paragraph in the cards\' bodies');
  assert.ok(block.querySelectorAll('.carousel-cards-image picture').length === 2, 'both pictures in the images');
  assert.ok([...block.querySelectorAll('.carousel-cards-body')].every((b) => b.firstElementChild && b.firstElementChild.tagName === 'H4'), 'the title first');
  assert.ok(block.querySelectorAll('.carousel-cards-body a[href]').length === 4, 'the titles\' and texts\' links stay');
});

test('a card whose picture link is its only link keeps it', async () => {
  const block = await run([card('/de/en/only-here', '<h4>No link in the title</h4><p>Plain text</p>')]);
  assert.ok(block.querySelectorAll('a[href="/de/en/only-here"]').length === 1, 'the link is kept');
});
