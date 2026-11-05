/* cards-teaser (blocks/cards-teaser): an italic CTA (www's maui-button-link secondary, the outlined
   buttons of www.lufthansa.com's /de/en/100-years teasers: "Discover stories") stays a secondary
   button; a plain or bold CTA is the arrow link as before (TAP's and Brussels' bold CTAs included).
   Run: node --max-old-space-size=256 --test test/cards-teaser-secondary.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.hlx = { codeBasePath: '' };
window.location = {
  hostname: 'main--lh-com--moved-permanently.aem.page', pathname: '/de/en/100-years', search: '', replace: () => {}, href: 'https://main--lh-com--moved-permanently.aem.page/de/en/100-years', origin: 'https://main--lh-com--moved-permanently.aem.page',
};
window.origin = window.location.origin;
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
globalThis.window = window;
globalThis.document = document;
const { default: decorate } = await import('../blocks/cards-teaser/cards-teaser.js');

const card = (cta) => `<div><div><h3>Lufthansa stories on a journey</h3><p>Twelve moving stories.</p>${cta}</div></div>`;
const blockOf = (...rows) => {
  const block = document.createElement('div');
  block.className = 'cards-teaser';
  block.innerHTML = rows.join('');
  document.body.replaceChildren(block);
  return block;
};

test('an italic CTA stays a secondary button, without the arrow link class', () => {
  // as scripts.js decorateButtons leaves it (em replaced by a.button.secondary), and as authored
  const block = blockOf(
    card('<p class="button-wrapper"><a href="/de/en/100-years/stories" class="button secondary">Discover stories</a></p>'),
    card('<p><em><a href="/de/en/100-years/fleet">More about our milestones</a></em></p>'),
  );
  decorate(block);
  ['/de/en/100-years/stories', '/de/en/100-years/fleet'].forEach((href) => {
    const a = block.querySelector(`a[href="${href}"]`);
    assert.equal(a.classList.contains('button'), true, href);
    assert.equal(a.classList.contains('secondary'), true, href);
    assert.equal(a.classList.contains('cards-teaser-cta-link'), false, href);
    assert.equal(a.closest('p').classList.contains('cards-teaser-cta-button'), true, href);
  });
});

test('a plain or bold CTA is the arrow link as before', () => {
  const block = blockOf(
    card('<p><a href="/de/en/baggage">To baggage</a></p>'),
    card('<p class="button-wrapper"><a href="/de/en/book" class="button primary">Book now</a></p>'),
  );
  decorate(block);
  [...block.querySelectorAll('.cards-teaser-body > p:last-child a')].forEach((a) => {
    assert.equal(a.classList.contains('cards-teaser-cta-link'), true);
    assert.equal(a.classList.contains('button'), false);
    assert.equal(a.closest('p').querySelector('strong, em') === null, true);
  });
});
