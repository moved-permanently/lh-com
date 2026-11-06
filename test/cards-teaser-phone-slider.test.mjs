/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* cards-teaser's option phone-slider (blocks/cards-teaser/cards-teaser-slider.js, brief 441:
   /de/en/traveltricks' "This might also be of interest to you", www's swiper below lg): a dot per
   card after the cards, labelled with the card's title, controlling the row, the first current; a
   block with one card gets none. The row's scrolling is CSS (below 1025px). Without the option the
   block has no dots.
   Run: node --max-old-space-size=256 --test test/cards-teaser-phone-slider.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body><main></main></body></html>');
window.location = {
  hostname: 'lufthansa.turnsthe.page', pathname: '/de/en/traveltricks', search: '', href: 'https://lufthansa.turnsthe.page/de/en/traveltricks', origin: 'https://lufthansa.turnsthe.page',
};
Object.defineProperty(window, 'origin', { value: 'https://lufthansa.turnsthe.page', configurable: true });
globalThis.window = window;
globalThis.document = document;
globalThis.requestAnimationFrame = (f) => setTimeout(f, 0);
globalThis.cancelAnimationFrame = (id) => clearTimeout(id);
const { default: decorate } = await import('../blocks/cards-teaser/cards-teaser.js');

const block = async (classes, titles) => {
  const b = document.createElement('div');
  b.className = `cards-teaser ${classes}`;
  b.innerHTML = titles.map((t) => `<div><div><p>No picture</p></div><div><h3>${t}</h3><p>Text</p><p><a href="/de/en/${t.toLowerCase().replace(/ /g, '-')}">To ${t}</a></p></div></div>`).join('');
  document.querySelector('main').append(b);
  await decorate(b);
  return b;
};

test('phone-slider: a dot per card, its title as the label, the first current', async () => {
  const b = await block('three-up phone-slider', ['Help and contact', 'Travel briefing', 'Offers and destinations']);
  const ul = b.querySelector(':scope > ul');
  const dots = [...b.querySelectorAll(':scope > ol.cards-teaser-dots button.cards-teaser-dot')];
  assert.equal(dots.length, 3);
  assert.deepEqual(dots.map((d) => d.getAttribute('aria-label')), ['Help and contact', 'Travel briefing', 'Offers and destinations']);
  assert.ok(ul.id && dots.every((d) => d.getAttribute('aria-controls') === ul.id));
  assert.equal(dots[0].getAttribute('aria-current'), 'true');
  assert.equal(dots[1].getAttribute('aria-current'), null);
});

test('one card, or no option: no dots', async () => {
  assert.equal((await block('three-up phone-slider', ['Help and contact'])).querySelector('.cards-teaser-dots'), null);
  assert.equal((await block('three-up', ['Help and contact', 'Travel briefing'])).querySelector('.cards-teaser-dots'), null);
});
