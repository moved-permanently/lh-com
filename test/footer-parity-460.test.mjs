/* eslint-disable max-len */
/* The footer against www's (brief 460, de/en 2026-11-06 at 1440):
   - the STAR ALLIANCE graphic 20 px high, as the footer's :star-alliance: token: a document whose
     DA copy holds the horizontal token itself (span icon-star-alliance-horizontal, lh-com's de/en
     footer) got the class footer-logo-star-alliance-horizontal, which no default rule sized, so the
     SVG (a viewBox, no size) was 0 x 0 in its flex row (every brand without its own rule);
   - lufthansa.com's legal links 10 px from their arrow (14 px of ink on www, 12 here): the row then
     wraps "Change Privacy Settings" as www does (the footer 41 px higher, as www's).
   Run: node --max-old-space-size=256 --test test/footer-parity-460.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const flat = (f) => fs.readFileSync(new URL(f, import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const footer = flat('../blocks/footer/footer.css');
const styles = flat('../styles/styles.css');

test('the horizontal STAR ALLIANCE token sized and filtered as the default one', () => {
  assert.ok(footer.includes('.footer .footer-logos :is(.footer-logo-star-alliance, .footer-logo-star-alliance-horizontal) img { width: auto; height: 20px; }'));
  assert.ok(footer.includes('.footer .footer-logos a:is(.footer-logo-star-alliance, .footer-logo-star-alliance-horizontal) { filter: var(--footer-star-alliance-filter, none); }'));
});

test('lufthansa.com: the legal links 10 px from their arrow', () => {
  assert.ok(styles.includes('body.brand-lufthansa .footer .footer-legal .footer-link { gap: 10px; }'));
});

test('lufthansa.com: the legal row 20 px narrower from 1025 px, so the last item wraps in every renderer (brief 464)', () => {
  assert.ok(styles.includes('@media (width >= 1025px) { body.brand-lufthansa .footer .footer-legal { padding-right: 20px; } }'));
});
