/* eslint-disable max-len */
/* cards-teaser (blocks/cards-teaser), brief 507 item 1: /de/en/meetings-and-events' "Request offer now" is www's primary
   maui-button-link (yellow); the document has it bold, the block drew it as the arrow link. A bold CTA is a primary
   button where the brand's theme asks for it (the token --cards-teaser-bold-cta: button; lufthansa.com's styles.css);
   without the token (TAP, Brussels: their bold CTAs are www's arrow links) the arrow link as before. Of 112 single-link
   card CTAs in lufthansa.com's published documents 2 are bold (both this card), 13 italic, 97 plain.
   Run: node --max-old-space-size=256 --test test/cards-teaser-bold-cta-507.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.hlx = { codeBasePath: '' };
window.location = {
  hostname: 'main--lh-com--moved-permanently.aem.page', pathname: '/de/en/meetings-and-events', search: '', replace: () => {}, href: 'https://main--lh-com--moved-permanently.aem.page/de/en/meetings-and-events', origin: 'https://main--lh-com--moved-permanently.aem.page',
};
window.origin = window.location.origin;
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
let token = '';
window.getComputedStyle = () => ({ getPropertyValue: (n) => (n === '--cards-teaser-bold-cta' ? token : '') });
globalThis.window = window;
globalThis.document = document;
globalThis.getComputedStyle = window.getComputedStyle;
const { default: decorate } = await import('../blocks/cards-teaser/cards-teaser.js');

const card = (cta) => `<div><div><h3>Send enquiry</h3><p>Let us know about your event.</p>${cta}</div></div>`;
const run = (cta) => {
  const block = document.createElement('div');
  block.className = 'cards-teaser';
  block.innerHTML = card(cta);
  document.body.replaceChildren(block);
  decorate(block);
  return block.querySelector('.cards-teaser-body > p:last-child');
};
const BOLD = ['<p><strong><a href="/de/en/request-for-proposal">Request offer now</a></strong></p>', '<p class="button-wrapper"><a href="/de/en/request-for-proposal" class="button primary">Request offer now</a></p>'];

test('with the theme token: a bold CTA is a primary button', () => {
  token = 'button';
  BOLD.forEach((cta) => {
    const p = run(cta);
    const a = p.querySelector('a');
    assert.ok(a.classList.contains('button') && a.classList.contains('primary'), cta);
    assert.ok(!a.classList.contains('cards-teaser-cta-link'), cta);
    assert.ok(p.classList.contains('cards-teaser-cta-button') && p.classList.contains('button-wrapper'), cta);
  });
});

test('with the token, plain and italic CTAs as before', () => {
  token = 'button';
  assert.ok(run('<p><a href="/de/en/baggage">To baggage</a></p>').querySelector('a').classList.contains('cards-teaser-cta-link'));
  const em = run('<p><em><a href="/de/en/fleet">More</a></em></p>').querySelector('a');
  assert.ok(em.classList.contains('button') && em.classList.contains('secondary'));
});

test('without the token (TAP, Brussels): a bold CTA is the arrow link as before', () => {
  token = '';
  BOLD.forEach((cta) => {
    const a = run(cta).querySelector('a');
    assert.ok(a.classList.contains('cards-teaser-cta-link') && !a.classList.contains('button'), cta);
  });
});

test('lufthansa.com sets the token', () => {
  const css = fs.readFileSync('styles/styles.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
  assert.ok(css.includes('body.brand-lufthansa { --cards-teaser-bold-cta: button; }'));
});
