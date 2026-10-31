/* The footer's badges row (blocks/footer buildBadges): images outside links (Air Dolomiti's payment
   logos, "Metodi di pagamento") are shown too, in their place, unlinked; linked images, icon links
   and text links as before. lufthansa.com's footers have no badges section (126 market footer
   documents on main--lh-com, 2026-10-31): the row is not built there.
   Run: node --max-old-space-size=512 --test test/footer-badges-unlinked.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
// the footer's imports load scripts.js: on a demo host's / (lh-com, no brand) it only redirects
// (stubbed), it decorates nothing
window.hlx = { codeBasePath: '' };
window.location = {
  hostname: 'main--lh-com--moved-permanently.aem.page', pathname: '/', search: '', replace: () => {}, href: 'https://main--lh-com--moved-permanently.aem.page/', origin: 'https://main--lh-com--moved-permanently.aem.page',
};
window.origin = window.location.origin;
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
globalThis.window = window;
globalThis.document = document;
const { buildBadges } = await import('../blocks/footer/footer.js');
// scripts/aem.js setup takes the code base from the module's file URL: the site's root here
window.hlx.codeBasePath = '';

const LABELS = { newTab: 'si apre in una nuova scheda' };
const section = (html) => {
  const s = document.createElement('div');
  s.className = 'section badges';
  s.innerHTML = `<div class="default-content-wrapper">${html}</div>`;
  return s;
};
const pic = (name, alt) => `<picture><source type="image/webp" srcset="./media_${name}.png?format=webply"><img src="./media_${name}.png" alt="${alt}"></picture>`;

test('unlinked payment logos: one item each, unlinked, in their place after the heading', () => {
  const row = buildBadges([section(`<ul><li><a href="/miles-and-more-it">Miles &amp; More</a></li></ul>
    <h3>Metodi di pagamento</h3><ul><li>${pic('visa', 'Visa')}</li><li>${pic('mc', 'Mastercard')}</li><li><img src="./media_pp.png" alt="PayPal"></li></ul>`)], LABELS);
  const groups = [...row.querySelectorAll('.footer-badge-group')];
  assert.equal(groups.length, 2);
  assert.equal(groups[1].querySelector('h3').textContent, 'Metodi di pagamento');
  const items = [...groups[1].querySelectorAll('li')];
  assert.equal(items.length, 3);
  assert.deepEqual(items.map((li) => li.querySelector('img').getAttribute('alt')), ['Visa', 'Mastercard', 'PayPal']);
  items.forEach((li) => {
    assert.ok(li.querySelector('a') === null, 'not linked');
    assert.equal(li.firstElementChild.className, 'footer-badge-image');
    assert.equal(li.querySelector('img').loading, 'lazy');
  });
  assert.ok(items[0].querySelector('picture source') !== null, 'the picture as authored');
});

test('linked images, icon links and text links as before; a linked picture is not shown twice', () => {
  const row = buildBadges([section(`<ul><li><a href="https://www.facebook.com/AirDolomiti">:facebook:</a></li>
    <li><a href="https://www.tiktok.com/@air.dolomiti">${pic('tt', 'TikTok')}</a></li><li><a href="/faq">FAQ</a></li></ul>`)], LABELS);
  const items = [...row.querySelectorAll('li')];
  assert.equal(items.length, 3);
  assert.equal(items[0].querySelector('a').className, 'footer-badge-facebook');
  assert.equal(items[0].querySelector('img').getAttribute('src'), '/icons/facebook.svg');
  assert.equal(items[1].querySelector('a').getAttribute('href'), 'https://www.tiktok.com/@air.dolomiti');
  assert.equal(items[1].querySelectorAll('img').length, 1);
  assert.equal(items[1].querySelector('a').getAttribute('target'), '_blank');
  assert.equal(items[2].querySelector('a').textContent, 'FAQ');
  assert.ok(row.querySelector('.footer-badge-image') === null, 'no unlinked items');
});

test('no badges section (lufthansa.com\'s footers): no row', () => {
  assert.ok(buildBadges([], LABELS) === null);
});
