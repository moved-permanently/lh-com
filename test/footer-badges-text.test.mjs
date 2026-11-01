/* The footer's badges row (blocks/footer buildBadges): text-only links (Air Dolomiti's Check in,
   Gestione Prenotazione, Miles & More, Prenota auto; Cargo's social links) are a.footer-badge-text,
   drawn in the footer's text colour with a normal line-height (the badge links' line-height 0 is
   for images: at 390 the text lines lay on top of each other, dark teal on the teal footer,
   airdolomiti.turnsthe.page/flotta, 2026-11-01). Image and icon badges as they are.
   Run: node --max-old-space-size=512 --test test/footer-badges-text.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
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
window.hlx.codeBasePath = '';

const LABELS = { newTab: 'si apre in una nuova scheda' };
const section = (html) => {
  const s = document.createElement('div');
  s.className = 'section badges';
  s.innerHTML = `<div class="default-content-wrapper">${html}</div>`;
  return s;
};

test('text-only badge links are footer-badge-text; image and icon links are not', () => {
  const row = buildBadges([section(`<ul><li><a href="https://www.lufthansa.com/it/it/online-check-in">Check in</a></li>
    <li><a href="/miles-and-more-it">Miles &amp; More</a></li>
    <li><a href="https://www.facebook.com/AirDolomiti">:facebook:</a></li>
    <li><a href="https://www.tiktok.com/@air.dolomiti"><picture><img src="./media_tt.png" alt="TikTok"></picture></a></li></ul>
    <h3>Metodi di pagamento</h3><ul><li><picture><img src="./media_visa.png" alt="Visa"></picture></li></ul>`)], LABELS);
  const links = [...row.querySelectorAll('a')];
  assert.deepEqual(links.map((a) => a.classList.contains('footer-badge-text')), [true, true, false, false]);
  assert.equal(links[0].textContent, 'Check in');
  assert.equal(links[2].className, 'footer-badge-facebook', 'icon links as before');
  assert.ok(row.querySelector('.footer-badge-image img') !== null, 'unlinked payment logos as before');
});

test('footer.css: text badges in the footer\'s text colour, a normal line-height; image badges keep line-height 0', () => {
  const css = fs.readFileSync('blocks/footer/footer.css', 'utf8');
  const text = css.match(/\.footer \.footer-badges a\.footer-badge-text \{([^}]*)\}/);
  assert.ok(text, 'a rule for text badges');
  assert.match(text[1], /color: var\(--footer-text\);/);
  assert.match(text[1], /line-height: 1\.5;/);
  assert.match(css, /\.footer \.footer-badges a,\n\.footer \.footer-badge-image \{\n {2}display: block;\n {2}line-height: 0;\n\}/, 'the image rule unchanged');
});
